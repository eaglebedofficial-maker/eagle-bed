"""Pure-logic tests: Keepa decoding, estimation, scoring, keyword processing, listing rules."""
from datetime import datetime, timezone

from app.providers.keepa import KEEPA_EPOCH_MIN, decode_product, decode_series, keepa_time, to_keepa_minutes
from app.services import estimation, keywords, listing, scoring


def km(dt):
    return to_keepa_minutes(dt)


def test_keepa_time_roundtrip():
    dt = datetime(2026, 1, 15, 12, 0, tzinfo=timezone.utc)
    assert keepa_time(km(dt)) == dt
    assert keepa_time(0) == datetime(2011, 1, 1, tzinfo=timezone.utc)
    assert KEEPA_EPOCH_MIN == 21564000


def test_decode_price_and_missing_values():
    t1, t2, t3 = km(datetime(2026, 1, 1, tzinfo=timezone.utc)), km(datetime(2026, 2, 1, tzinfo=timezone.utc)), km(datetime(2026, 3, 1, tzinfo=timezone.utc))
    s = decode_series([t1, 2499, t2, -1, t3, 1999], 1)
    assert [v for _, v in s] == [24.99, None, 19.99]


def test_decode_buybox_triplets_include_shipping():
    t1 = km(datetime(2026, 1, 1, tzinfo=timezone.utc))
    s = decode_series([t1, 1000, 299, t1 + 60, 1100, 0], 18)
    assert [v for _, v in s] == [12.99, 11.0]


def test_decode_product_fields_and_stats():
    t = km(datetime(2026, 3, 1, tzinfo=timezone.utc))
    csv = [None] * 19
    csv[0] = [t, 3000]
    csv[3] = [t, 1500, t + 1440, 1200]
    csv[16] = [t, 43]
    csv[17] = [t, 1284]
    p = {"asin": "B0TEST0001", "title": "Bed", "brand": "Acme", "csv": csv, "packageWeight": 42000, "packageLength": 1900, "packageWidth": 1350, "packageHeight": 300,
         "stats": {"current": [3000, -1, -1, 1200, -1, -1, -1, -1, -1, -1, -1, 3, -1, -1, -1, -1, 43, 1284, 2999], "salesRankDrops30": 40, "avg90": [1]},
         "buyBoxSellerIdHistory": [str(t), "A1SELLER", str(t + 100), "AMAZON"], "monthlySold": 200, "categoryTree": [{"name": "Home & Kitchen"}, {"name": "Beds"}], "listedSince": t - 100000}
    d = decode_product(p)
    f = d["fields"]
    assert f["price"] == 29.99 and f["bsr"] == 1200 and f["rating"] == 4.3 and f["review_count"] == 1284 and f["offer_count"] == 3
    assert f["weight_g"] == 42000 and f["length_cm"] == 190 and f["category"] == "Home & Kitchen" and f["subcategory"] == "Beds"
    assert [v for _, v in d["series"]["rank"]] == [1500, 1200]
    assert d["buybox_sellers"][1][1] == "AMAZON" and d["stats"]["salesRankDrops30"] == 40 and f["bought_past_month"] == 200


def test_estimation_uses_badge_as_bounds():
    e = estimation.estimate(bsr=640, category="Home & Kitchen", marketplace="UK", bought_past_month=1000)
    assert e["low"] == 1000 and e["high"] == 2000 and 1000 <= e["units"] <= 2000 and e["classification"] == "estimated"
    none = estimation.estimate(bsr=None, category="", marketplace="UK")
    assert none["units"] is None and none["confidence"] == "none"
    assert estimation.units_from_bsr(1000, "Home & Kitchen", "US") > estimation.units_from_bsr(10000, "Home & Kitchen", "US")


def test_score_excludes_missing_factors_and_caps_losses():
    s = scoring.score({"units": 500, "revenue": 15000, "reviews": 80, "offers": 2, "margin": 30, "size_tier": "Standard parcel", "weight_g": 900})
    assert s["score"] is not None and 0 <= s["score"] <= 100
    assert s["factors"]["sales_consistency"]["missing"] and s["coverage"] < 1
    loss = scoring.score({"units": 2000, "revenue": 60000, "reviews": 10, "offers": 1, "margin": -5})
    assert loss["score"] <= 25
    assert "guarantee" in s["disclaimer"]


def test_keyword_processor():
    r = keywords.process("divan bed\nDivan Bed\ndivan bed double, storage bed;\nbed frame")
    assert r["unique_count"] == 4 and r["removed"] == 1
    assert len(r["backend_terms"].encode()) <= 249
    assert any(w["word"] == "bed" for w in r["words"])


def test_listing_rules_flag_problems():
    a = listing.analyse(title="BEST BED!!", bullets=["short"], description="", keywords=["divan bed", "storage bed"], images=3, has_aplus=False, has_video=False)
    titles = [i["title"] for i in a["issues"]]
    assert any("Short title" in t for t in titles) and any("bullet" in t.lower() for t in titles)
    assert any("Restricted" in t for t in titles) and a["score"] < 50


def test_review_parsing_and_themes():
    text = "5.0 out of 5 stars Love it\nSturdy and comfortable bed.\n1.0 out of 5 stars Broke\nThe drawers broke and screws were missing. Instructions terrible."
    rs = listing.parse_reviews(text)
    assert len(rs) == 2 and rs[1]["rating"] == 1.0
    th = listing.review_themes(rs)
    assert th["sentiment"]["negative"] == 1 and any(t["theme"] == "Assembly & instructions" for t in th["themes"])
