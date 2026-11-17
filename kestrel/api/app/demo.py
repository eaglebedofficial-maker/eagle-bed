"""Demo workspace: clearly labelled, fictional data for exploring the UI.

Everything created here belongs to an organisation flagged ``is_demo`` and carries the
``demo`` classification, so the UI shows a "Demo data" banner and badges. Product ASINs
start with ``B0DEMO`` and every company name ends in "(Demo)". Nothing here describes a
real product, seller or supplier. Run: ``python -m app.demo`` (idempotent; ``--reset`` rebuilds).
"""
import random
import sys
from datetime import datetime, timedelta, timezone

from sqlalchemy import delete, select

from .db import SessionLocal
from .models import (BuyBoxHistory, Keyword, KeywordList, KeywordListItem, Membership, OfferSnapshot, Organisation, PriceHistory, Product,
                     ProductSnapshot, RankHistory, RankTrack, Supplier, SupplierEvidence, SupplierProduct, TrackedProduct, TrackingGroup, User)
from .security import hash_password
from .services import products as productsvc
from .services import suppliers as suppliersvc

DEMO_EMAIL = "demo@kestrel.local"
DEMO_PASSWORD = "kestrel-demo-2026"
DEMO_SLUG = "kestrel-demo"

# (title, brand, category, price, bsr, reviews, rating, offers, weight_g, (l, w, h) cm, amazon_sells, bought_past_month)
CATALOGUE = [
    ("Memory Foam Mattress Topper, 5 cm, Double, Breathable Bamboo Cover", "Duskwell", "Home & Kitchen", 49.99, 820, 1840, 4.4, 6, 3900, (60, 40, 30), False, 900),
    ("Hollowfibre Pillows Pair, Hotel Quality, Medium Support", "Duskwell", "Home & Kitchen", 19.99, 410, 5210, 4.5, 9, 1600, (55, 40, 25), True, 2000),
    ("Upholstered Ottoman Storage Bed Frame, Grey Plush Velvet, King", "Harrowgate Home", "Home & Kitchen", 329.0, 6400, 312, 4.2, 3, 68000, (190, 60, 40), False, 50),
    ("Wooden Bed Slats Replacement Set, Pine, Single (13 slats)", "Harrowgate Home", "DIY & Tools", 24.5, 3100, 640, 4.3, 4, 5200, (95, 12, 10), False, 200),
    ("Waterproof Mattress Protector, Quilted, Deep Fitted 35 cm, Double", "Pellmoor", "Home & Kitchen", 17.49, 1250, 3920, 4.6, 11, 900, (32, 26, 8), True, 1000),
    ("Bed Risers Heavy Duty, Set of 4, Adds 13 cm Height", "Pellmoor", "Home & Kitchen", 15.99, 5200, 880, 4.1, 7, 1400, (25, 20, 15), False, 100),
    ("Under-Bed Storage Bags, 4 Pack, Zip Closure, 105 L", "Tidewick", "Home & Kitchen", 21.99, 2600, 1460, 4.4, 8, 1700, (35, 28, 10), False, 300),
    ("Headboard Wall Panels, Velvet, Set of 6, Charcoal", "Tidewick", "Home & Kitchen", 59.99, 9800, 205, 4.0, 2, 4300, (62, 32, 20), False, None),
    ("Weighted Blanket 6.8 kg, 150 × 200 cm, Glass Beads", "Calmora", "Home & Kitchen", 44.99, 3600, 2210, 4.3, 5, 7200, (45, 35, 20), False, 200),
    ("Electric Heated Underblanket, Double, 3 Heat Settings, Auto Off", "Calmora", "Home & Kitchen", 39.99, 1900, 4100, 4.5, 6, 1900, (38, 30, 12), True, 600),
    ("Bamboo Bed Sheet Set, King, Deep Pocket, Cooling", "Linnet & Loom", "Home & Kitchen", 54.0, 7300, 390, 4.2, 3, 1500, (32, 26, 9), False, 50),
    ("Fitted Sheet Straps, Adjustable Elastic Bed Sheet Holders, 4 Pack", "Linnet & Loom", "Home & Kitchen", 7.99, 2200, 6400, 4.2, 14, 120, (16, 12, 3), False, 500),
    ("Bedside Caddy Organiser, Felt, Hanging, 4 Pockets", "Tidewick", "Home & Kitchen", 12.99, 14500, 96, 4.4, 2, 300, (30, 20, 3), False, None),
    ("Kids Single Cabin Bed with Ladder, White, Solid Pine", "Harrowgate Home", "Home & Kitchen", 219.0, 22000, 58, 3.9, 2, 52000, (200, 45, 25), False, None),
    ("Mattress Vacuum Storage Bag, Double/King, Heavy Duty", "Pellmoor", "Home & Kitchen", 14.99, 8800, 410, 4.0, 5, 800, (30, 22, 6), False, 50),
    ("Silk Pillowcase, 22 Momme Mulberry, Standard, Champagne", "Linnet & Loom", "Beauty", 24.99, 1500, 2870, 4.4, 10, 160, (25, 18, 2), False, 400),
    ("Bed Wedge Pillow, Memory Foam, Acid Reflux, Removable Cover", "Calmora", "Health & Personal Care", 34.99, 2700, 1650, 4.3, 6, 1800, (62, 50, 20), False, 200),
    ("Divan Bed Base with 2 Drawers, Black Faux Leather, Double", "Harrowgate Home", "Home & Kitchen", 189.0, 15800, 74, 4.0, 2, 46000, (140, 70, 35), False, None),
]

SUPPLIERS = [
    # (legal name, type, country, city, years, vat_valid, moq, lead, sample, certs, brands, evidence[(kind, summary, supports_auth)], registry_active)
    ("Northbrook Bedding Supplies Ltd (Demo)", "wholesaler", "GB", "Leeds", 9, True, 50, 7, True, ["ISO 9001"], ["Duskwell", "Pellmoor"],
     [("brand_locator", "Listed on the Duskwell stockist locator page (fictional demo evidence).", True), ("website_claim", "Website states it is an official Pellmoor distributor.", False)], True),
    ("Harrowgate Home Ltd (Demo)", "brand_owner", "GB", "Harrogate", 14, True, 10, 14, True, ["FIRA Gold", "BS 7177"], ["Harrowgate Home"],
     [("brand_confirmation", "Owner of the Harrowgate Home brand per its website and trade mark record (fictional demo evidence).", True), ("registry", "Company register entry matches the trading name.", False)], True),
    ("Qingdao Softline Textile Co. (Demo)", "manufacturer", "CN", "Qingdao", 11, None, 500, 45, True, ["OEKO-TEX Standard 100", "BSCI"], [],
     [("trade_record", "Shipment records show bedding exports to UK importers (fictional demo evidence).", False)], False),
    ("Midlands Trade Wholesale Ltd (Demo)", "wholesaler", "GB", "Birmingham", 3, True, 24, 5, False, [], ["Calmora", "Tidewick"],
     [("website_claim", "Website lists Calmora and Tidewick in its catalogue. No confirmation from the brands.", False)], True),
    ("QuickStock Clearance (Demo)", "liquidator", "GB", "Bradford", 0.5, False, 1, 3, False, [], ["Duskwell", "Calmora", "Linnet & Loom"],
     [("user_note", "Prices well below brand trade price; no address on invoice sample.", False)], True),
    ("Vellora Textiles GmbH (Demo)", "distributor", "DE", "Hamburg", 6, True, 100, 12, True, ["OEKO-TEX Standard 100"], ["Linnet & Loom"],
     [("website_claim", "States it is an EU distributor for Linnet & Loom.", False)], False),
]

KEYWORDS = [("mattress topper double", 40500), ("memory foam mattress topper", 33100), ("pillows", 90500), ("hotel pillows", 22200),
            ("mattress protector double", 27100), ("waterproof mattress protector", 18100), ("ottoman bed king", 12100), ("bed slats", 14800),
            ("weighted blanket", 49500), ("heated underblanket", 22200), ("silk pillowcase", 33100), ("bed risers", 9900),
            ("under bed storage", 18100), ("headboard panels", 6600), ("wedge pillow", 14800)]


def _asin(i: int) -> str:
    return f"B0DEMO{i:04d}"


def _series(rng, days, start, drift, noise, floor=None, every=1):
    now = datetime.now(timezone.utc).replace(minute=0, second=0, microsecond=0)
    v, out = start, []
    for d in range(days, -1, -every):
        v = v * (1 + rng.uniform(-noise, noise)) + drift
        if floor is not None:
            v = max(floor, v)
        out.append((now - timedelta(days=d), v))
    return out


def build(db, reset: bool = False):
    org = db.scalar(select(Organisation).where(Organisation.slug == DEMO_SLUG))
    if org and reset:
        db.delete(org)
        db.flush()
        org = None
    if org:
        print("Demo organisation already exists (use --reset to rebuild).")
        return org
    org = Organisation(name="Kestrel Demo Workspace", slug=DEMO_SLUG, is_demo=True, default_marketplace="UK", vat_registered=True)
    user = db.scalar(select(User).where(User.email == DEMO_EMAIL))
    if not user:
        user = User(email=DEMO_EMAIL, name="Demo Analyst", password_hash=hash_password(DEMO_PASSWORD))
    db.add_all([org, user])
    db.flush()
    db.add(Membership(user_id=user.id, org_id=org.id, role="owner"))
    rng = random.Random(20261117)

    prods = []
    for i, (title, brand, cat, price, bsr, reviews, rating, offers, wg, dims, amz, bpm) in enumerate(CATALOGUE, 1):
        p = productsvc.upsert(db, org.id, "UK", {
            "asin": _asin(i), "title": title, "brand_name": brand, "manufacturer": brand, "category": cat, "bsr_category": cat, "price": price, "bsr": bsr,
            "review_count": reviews, "rating": rating, "offer_count": offers, "fba_offer_count": max(1, offers - 1), "fbm_offer_count": 1,
            "amazon_sells": amz, "fulfilment": "AMZ" if amz else "FBA", "weight_g": wg, "length_cm": dims[0], "width_cm": dims[1], "height_cm": dims[2],
            "bought_past_month": bpm, "image_count": rng.randint(4, 9), "has_aplus": rng.random() > 0.4, "has_video": rng.random() > 0.6,
            "variation_count": rng.randint(1, 8), "buybox_seller": "Amazon" if amz else f"DEMO-SELLER-{i % 5 + 1}",
            "ean": f"5060000{i:06d}", "listed_at": (datetime.now(timezone.utc) - timedelta(days=rng.randint(120, 1800))).date(),
        }, source="demo", classification="demo")
        if i % 3 == 0:
            p.unit_cost = round(price * rng.uniform(0.18, 0.32) / 1.2, 2)
        prods.append(p)
    db.flush()

    for p in prods:
        # 365 days of history: price (new, buy box, amazon), rank, offers, reviews, rating
        base = p.price
        newp = _series(rng, 365, base * 1.05, -base * 0.0002, 0.012, floor=base * 0.7)
        rank = _series(rng, 365, p.bsr * 1.3, -p.bsr * 0.0008, 0.06, floor=50, every=1)
        offers = _series(rng, 365, max(1, (p.offer_count or 2) - 2), 0.01, 0.05, floor=1, every=3)
        rev_start = max(5, int((p.review_count or 50) * 0.55))
        reviews = [(t, round(rev_start + ((p.review_count or 50) - rev_start) * k / 52)) for k, (t, _) in enumerate(_series(rng, 364, 0, 0, 0, every=7))]
        rows = [("new", newp), ("buybox", [(t, v * rng.uniform(0.99, 1.01)) for t, v in newp]), ("rank", rank), ("offers_new", offers),
                ("reviews", reviews), ("rating", [(t, p.rating) for t, _ in reviews])]
        if p.amazon_sells:
            rows.append(("amazon", [(t, v * 0.995) for t, v in newp]))
        for series, pts in rows:
            for t, v in pts:
                db.add(PriceHistory(product_id=p.id, series=series, ts=t, value=round(v, 2) if series not in ("rank", "offers_new", "reviews") else round(v), source="demo"))
        sellers = ["Amazon"] if p.amazon_sells else []
        sellers += [f"DEMO-SELLER-{k}" for k in range(1, 4)]
        for k, (t, v) in enumerate(newp[::5]):
            db.add(BuyBoxHistory(product_id=p.id, ts=t, seller_id=rng.choice(sellers), price=round(v, 2)))
        for k, s in enumerate(sellers):
            db.add(OfferSnapshot(product_id=p.id, seller_id=s, seller_name=s.replace("DEMO-SELLER-", "Demo Seller ") + (" (Demo)" if s != "Amazon" else ""),
                                 is_fba=s != "Amazon", is_amazon=s == "Amazon", is_buybox=k == 0, price=round(p.price * (1 + k * 0.03), 2), shipping=0))
        db.flush()
        productsvc.derive(db, p)
        for d in (28, 21, 14, 7, 0):
            db.add(ProductSnapshot(product_id=p.id, ts=datetime.now(timezone.utc) - timedelta(days=d), price=round(p.price * rng.uniform(0.96, 1.04), 2),
                                   bsr=int(p.bsr * rng.uniform(0.85, 1.2)), review_count=p.review_count, rating=p.rating, offer_count=p.offer_count,
                                   est_monthly_units=int((p.est_monthly_units or 0) * rng.uniform(0.85, 1.15)), source="demo"))

    grp = TrackingGroup(org_id=org.id, name="Bedroom shortlist", kind="tracker")
    comp = TrackingGroup(org_id=org.id, name="Mattress topper competitors", kind="competitor_set", colour="#22C7E8")
    db.add_all([grp, comp])
    db.flush()
    for p in prods[:8]:
        db.add(TrackedProduct(org_id=org.id, product_id=p.id, group_id=grp.id))

    sups = []
    for name, typ, country, city, yrs, vat, moq, lead, sample, certs, brands, evidence, reg_active in SUPPLIERS:
        s = Supplier(org_id=org.id, legal_name=name, trading_name=name.replace(" (Demo)", ""), supplier_type=typ, country=country, city=city,
                     address=f"Unit {rng.randint(1, 40)}, {city} (fictional demo address)" if "QuickStock" not in name else "", website="",
                     years_trading=yrs, vat_valid=vat, vat_number=f"GB{rng.randint(100000000, 999999999)}" if vat is not None and country == "GB" else "",
                     moq=moq, lead_time_days=lead, sample_available=sample, certifications=certs, brands_supplied=brands, categories=["Bedding", "Bedroom furniture"],
                     countries_served=["GB"] if country == "GB" else ["GB", "EU"], currency="GBP" if country == "GB" else ("EUR" if country == "DE" else "USD"),
                     price_min=round(rng.uniform(2, 8), 2), price_max=round(rng.uniform(40, 150), 2), source="demo",
                     communication_rating=rng.randint(3, 5), quality_rating=rng.randint(3, 5),
                     registry="companies_house" if country == "GB" else "",
                     registry_checked_at=datetime.now(timezone.utc) if country == "GB" else None,
                     vat_checked_at=datetime.now(timezone.utc) if vat is not None else None,
                     vat_data={"valid": vat, "name": name.replace(" (Demo)", "").upper(), "demo": True} if vat is not None else {},
                     registry_data={"name": name.replace(" (Demo)", "").upper(), "status": "active" if reg_active else "dissolved", "demo": True,
                                    "number": f"DEMO{rng.randint(1000, 9999)}", "incorporated": f"{2026 - int(yrs)}-03-01"} if country == "GB" else {})
        db.add(s)
        db.flush()
        for kind, summary, auth in evidence:
            db.add(SupplierEvidence(supplier_id=s.id, kind=kind, summary=summary, source_name="Demo data", classification="demo",
                                    confidence="high" if auth else "low", supports_authorisation=auth))
        for p in prods:
            if p.brand_name in brands or (typ == "manufacturer" and p.category == "Home & Kitchen" and rng.random() < 0.4):
                db.add(SupplierProduct(supplier_id=s.id, product_id=p.id, description=p.title[:300], unit_price=round(p.price * rng.uniform(0.22, 0.45) / 1.2, 2),
                                       currency=s.currency, moq=moq, sample_available=sample))
        db.flush()
        suppliersvc.classify_and_score(db, s)
        sups.append(s)
    for p in prods:  # rescore with supplier counts
        productsvc.derive(db, p)

    kl = KeywordList(org_id=org.id, name="Bedding seed keywords", marketplace="UK", source="demo")
    db.add(kl)
    db.flush()
    for phrase, vol in KEYWORDS:
        kw = db.scalar(select(Keyword).where(Keyword.marketplace == "UK", Keyword.phrase == phrase))
        if not kw:
            kw = Keyword(marketplace="UK", phrase=phrase, search_volume=vol, volume_source="demo", difficulty=rng.randint(20, 85), cpc=round(rng.uniform(0.3, 1.6), 2),
                         trend=[{"month": (datetime.now(timezone.utc) - timedelta(days=30 * m)).strftime("%Y-%m"), "volume": int(vol * rng.uniform(0.7, 1.3))} for m in range(11, -1, -1)],
                         updated_at=datetime.now(timezone.utc))
            db.add(kw)
            db.flush()
        db.add(KeywordListItem(list_id=kl.id, keyword_id=kw.id, relevance=round(rng.uniform(0.5, 1), 2), tags=["demo"]))
    db.flush()
    kws = {k.phrase: k for k in db.scalars(select(Keyword).where(Keyword.marketplace == "UK"))}
    for p, phrase in [(prods[0], "mattress topper double"), (prods[0], "memory foam mattress topper"), (prods[1], "hotel pillows"), (prods[4], "waterproof mattress protector")]:
        tr = RankTrack(org_id=org.id, product_id=p.id, keyword_id=kws[phrase].id)
        db.add(tr)
        db.flush()
        pos = rng.randint(8, 30)
        for d in range(30, -1, -1):
            pos = max(1, min(60, pos + rng.choice([-2, -1, 0, 0, 1])))
            db.add(RankHistory(track_id=tr.id, ts=datetime.now(timezone.utc) - timedelta(days=d), organic_pos=pos, sponsored_pos=rng.choice([None, rng.randint(1, 8)]),
                               page=(pos - 1) // 48 + 1, source="demo"))
    db.commit()
    print(f"Demo workspace ready: {len(prods)} products, {len(sups)} suppliers. Sign in as {DEMO_EMAIL} / {DEMO_PASSWORD}")
    return org


if __name__ == "__main__":
    with SessionLocal() as db:
        build(db, reset="--reset" in sys.argv)
