"""Product upsert, identifier parsing, provider refresh, derived metrics and imports."""
from __future__ import annotations

import csv
import io
import re
from datetime import date, datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..models import (BuyBoxHistory, DataSourceRecord, EligibilityRecord, Marketplace, OfferSnapshot, PriceHistory, Product,
                      ProductSnapshot, SupplierProduct)
from ..providers import ProviderError, get_provider
from ..providers.keepa import KeepaProvider
from . import estimation, history, scoring
from .fees import fba_fee, referral_fee
from .profit import ProfitInput, calculate

ASIN_RE = re.compile(r"\b(B0[A-Z0-9]{8})\b", re.I)


def parse_query(q: str) -> dict:
    """Classify a search string: ASIN, EAN/UPC/ISBN, Amazon URL, or keywords."""
    s = (q or "").strip()
    m = re.search(r"/(?:dp|gp/product|gp/aw/d|product-reviews)/([A-Z0-9]{10})", s, re.I)
    if m:
        return {"type": "asin", "value": m.group(1).upper(), "marketplace": _mkt_from_url(s)}
    if re.fullmatch(r"B0[A-Z0-9]{8}", s, re.I):
        return {"type": "asin", "value": s.upper()}
    digits = re.sub(r"[\s-]", "", s)
    if re.fullmatch(r"\d{13}", digits):
        return {"type": "isbn" if digits.startswith(("978", "979")) else "ean", "value": digits}
    if re.fullmatch(r"\d{12}", digits):
        return {"type": "upc", "value": digits}
    if re.fullmatch(r"\d{9}[\dX]", digits, re.I):
        return {"type": "isbn", "value": digits.upper()}
    return {"type": "keyword", "value": s}


def _mkt_from_url(u: str) -> str | None:
    for dom, code in (("amazon.co.uk", "UK"), ("amazon.com.au", "AU"), ("amazon.de", "DE"), ("amazon.fr", "FR"), ("amazon.it", "IT"), ("amazon.es", "ES"),
                      ("amazon.nl", "NL"), ("amazon.ca", "CA"), ("amazon.com", "US")):
        if dom in u:
            return code
    return None


PRODUCT_FIELDS = {c.name for c in Product.__table__.columns} - {"id", "org_id", "created_at", "updated_at"}


def upsert(db: Session, org_id: int, marketplace: str, fields: dict, *, source: str, classification: str) -> Product:
    asin = (fields.get("asin") or "").upper()
    p = db.scalar(select(Product).where(Product.org_id == org_id, Product.marketplace == marketplace, Product.asin == asin))
    if not p:
        p = Product(org_id=org_id, marketplace=marketplace, asin=asin)
        db.add(p)
    for k, v in fields.items():
        if k in PRODUCT_FIELDS and v not in (None, "") and k not in ("asin",):
            setattr(p, k, v)
    p.source, p.classification = source, classification
    p.last_refreshed_at = datetime.now(timezone.utc)
    p.currency = (db.get(Marketplace, marketplace).currency) if db.get(Marketplace, marketplace) else p.currency
    db.flush()
    return p


def record_source(db: Session, org_id, entity, entity_id, provider, classification, *, period_from=None, period_to=None, tokens=0, status="ok", error="", ref=""):
    db.add(DataSourceRecord(org_id=org_id, entity=entity, entity_id=str(entity_id), provider=provider, classification=classification, period_from=period_from,
                            period_to=period_to, tokens_used=tokens or 0, status=status, error=error, request_ref=ref[:400]))


def store_keepa(db: Session, org_id: int, marketplace: str, decoded: dict) -> Product:
    f = dict(decoded["fields"])
    p = upsert(db, org_id, marketplace, f, source="keepa", classification="licensed")
    db.query(PriceHistory).filter(PriceHistory.product_id == p.id, PriceHistory.source == "keepa").delete()
    rows, first, last = [], None, None
    for series, pts in decoded["series"].items():
        seen = set()
        for t, v in pts:
            if t in seen:
                continue
            seen.add(t)
            rows.append({"product_id": p.id, "series": series, "ts": t, "value": v, "source": "keepa"})
            first = t if not first or t < first else first
            last = t if not last or t > last else last
    if rows:
        db.execute(PriceHistory.__table__.insert(), rows)
    db.query(BuyBoxHistory).filter(BuyBoxHistory.product_id == p.id).delete()
    seen = set()
    bb_rows = []
    for t, s in decoded["buybox_sellers"]:
        if t not in seen and s:
            seen.add(t)
            bb_rows.append({"product_id": p.id, "ts": t, "seller_id": str(s)[:40], "price": None})
    if bb_rows:
        db.execute(BuyBoxHistory.__table__.insert(), bb_rows)
    if decoded.get("offers"):
        now = datetime.now(timezone.utc)
        for o in decoded["offers"]:
            db.add(OfferSnapshot(product_id=p.id, ts=now, seller_id=o["seller_id"] or "", is_fba=o["is_fba"], is_amazon=o["is_amazon"], price=o["price"], condition=o["condition"]))
        p.fba_offer_count = sum(1 for o in decoded["offers"] if o["is_fba"] and o["condition"] == "new")
        p.fbm_offer_count = sum(1 for o in decoded["offers"] if not o["is_fba"] and o["condition"] == "new")
    p.raw = {**(p.raw or {}), "keepa_stats": decoded["stats"], "keepa_fba_fees": decoded.get("fba_fees"), "referral_pct": decoded.get("referral_fee_pct")}
    record_source(db, org_id, "product", p.id, "keepa", "licensed", period_from=first, period_to=last)
    return p


def refresh_from_providers(db: Session, org_id: int, p: Product, *, prefer: str | None = None) -> dict:
    """Pull the freshest data we're entitled to. Returns which sources succeeded/failed."""
    m = db.get(Marketplace, p.marketplace)
    report = {"ok": [], "failed": [], "skipped": []}
    keepa = get_provider(db, org_id, "keepa")
    if keepa.configured() and m.keepa_domain_id:
        try:
            res = keepa.products(m.keepa_domain_id, [p.asin], days=365)
            if res.data:
                store_keepa(db, org_id, p.marketplace, res.data[0])
                report["ok"].append("keepa")
        except ProviderError as e:
            report["failed"].append({"provider": "keepa", "error": e.message})
    else:
        report["skipped"].append("keepa")
    sp = get_provider(db, org_id, "sp_api")
    if sp.configured():
        try:
            items = sp.catalog_search(m.sp_marketplace_id, identifiers=[p.asin], id_type="ASIN").data
            if items:
                upsert(db, org_id, p.marketplace, items[0], source="sp_api", classification="official_api")
                record_source(db, org_id, "product", p.id, "sp_api", "official_api")
            offers = sp.item_offers(m.sp_marketplace_id, p.asin).data
            p.offer_count = offers.get("total_offers") or p.offer_count
            report["ok"].append("sp_api")
        except ProviderError as e:
            report["failed"].append({"provider": "sp_api", "error": e.message})
    else:
        report["skipped"].append("sp_api")
    derive(db, p)
    return report


def derive(db: Session, p: Product, *, unit_cost: float | None = None):
    """Recompute estimates, fees, profit and score from stored data."""
    stats = (p.raw or {}).get("keepa_stats") or {}
    est = estimation.estimate(bsr=p.bsr, category=p.category or p.bsr_category, marketplace=p.marketplace, bought_past_month=p.bought_past_month,
                              rank_drops_30=stats.get("salesRankDrops30") if stats.get("salesRankDrops30") not in (None, -1) else None)
    p.est_monthly_units, p.est_units_low, p.est_units_high = est["units"], est["low"], est["high"]
    p.est_method = est["method"]
    p.est_monthly_revenue = round(est["units"] * p.price, 2) if est["units"] and p.price else None
    if p.price:
        fr = fba_fee(db, p.marketplace, weight_g=p.weight_g, l=p.length_cm, w=p.width_cm, h=p.height_cm, price=p.price, org_id=p.org_id)
        p.fba_fee, p.size_tier = fr.fee, fr.tier if fr.fee is not None else (p.size_tier or "")
        p.referral_fee = referral_fee(db, p.marketplace, p.category, p.price, p.org_id)[0]
        cost = unit_cost if unit_cost is not None else p.unit_cost
        cost_known = cost is not None
        if cost is None:
            cost = round(p.price * 0.25 / (1.2 if p.marketplace != "US" else 1), 2)  # placeholder assumption, flagged
        out = calculate(db, ProfitInput(marketplace=p.marketplace, category=p.category or "Default", selling_price=p.price, unit_cost=cost,
                                        weight_g=p.weight_g, length_cm=p.length_cm, width_cm=p.width_cm, height_cm=p.height_cm, ad_spend_pct=10,
                                        returns_pct=3, vat_registered=True, fba_fee_override=None if fr.fee is not None else 0.0), p.org_id)
        p.est_profit, p.est_margin, p.est_roi = out.net_profit, out.margin_pct, out.roi_pct
        p.data_quality = {**(p.data_quality or {}), "cost_assumed": not cost_known, "fba_fee_known": fr.fee is not None}
    h = history.analyse(db, p.id) if p.id else {"available": False}
    if h.get("available"):
        p.price_stability, p.sales_consistency, p.seasonality = h.get("price_stability"), h.get("sales_consistency"), h.get("seasonality")
    supplier_count = db.scalar(select(func.count(func.distinct(SupplierProduct.supplier_id))).where(SupplierProduct.product_id == p.id)) if p.id else 0
    elig = db.scalar(select(EligibilityRecord.result).where(EligibilityRecord.product_id == p.id).order_by(EligibilityRecord.checked_at.desc())) if p.id else None
    sc = scoring.score({"units": p.est_monthly_units, "revenue": p.est_monthly_revenue, "price": p.price, "reviews": p.review_count, "rating": p.rating,
                        "offers": p.offer_count, "margin": p.est_margin, "cost_known": p.unit_cost is not None, "price_stability": p.price_stability,
                        "sales_consistency": p.sales_consistency, "seasonality": p.seasonality, "amazon_sells": p.amazon_sells, "size_tier": p.size_tier,
                        "weight_g": p.weight_g, "title": p.title, "category": p.category},
                       {"supplier_count": supplier_count if supplier_count else None, "eligibility": elig})
    p.opportunity_score, p.score_components = sc["score"], sc
    p.competition_level = scoring.competition_level(p.review_count, p.offer_count)
    p.data_quality = {**(p.data_quality or {}), **quality(p)}


def quality(p: Product) -> dict:
    issues = []
    if not p.price:
        issues.append("No price")
    if not p.bsr and not p.bought_past_month:
        issues.append("No sales signal (rank or monthly-bought)")
    if not (p.weight_g and p.length_cm):
        issues.append("Missing size/weight — fees unknown")
    if p.last_refreshed_at and (datetime.now(timezone.utc) - p.last_refreshed_at).days > 14:
        issues.append(f"Data is {(datetime.now(timezone.utc) - p.last_refreshed_at).days} days old")
    if p.review_count is None:
        issues.append("No review count")
    score = max(0, 100 - 20 * len(issues))
    return {"score": score, "issues": issues}


def snapshot(db: Session, p: Product, source: str):
    db.add(ProductSnapshot(product_id=p.id, price=p.price, bsr=p.bsr, review_count=p.review_count, rating=p.rating, offer_count=p.offer_count,
                           est_monthly_units=p.est_monthly_units, source=source))


# ---------------------------------------------------------------- imports
def _f(v):
    try:
        s = str(v).replace(",", "").replace("£", "").replace("$", "").replace("€", "").strip()
        return float(s) if s not in ("", "None", "null") else None
    except ValueError:
        return None


def import_extension_json(db: Session, org_id: int, data: dict) -> list[Product]:
    mkt = data.get("mkt") or "UK"
    out = []
    for it in data.get("items") or []:
        if not it.get("asin"):
            continue
        dims = it.get("dims") or {}
        fields = {"asin": it["asin"], "title": it.get("title", ""), "brand_name": it.get("brand", ""), "price": _f(it.get("price")), "bsr": int(it["bsr"]) if it.get("bsr") else None,
                  "bsr_category": it.get("rankCategory", ""), "category": it.get("rankCategory") or it.get("category") or "", "rating": _f(it.get("rating")),
                  "review_count": int(it["reviews"]) if it.get("reviews") else None, "offer_count": it.get("offers") or None, "bought_past_month": it.get("bought") or None,
                  "weight_g": _f(it.get("weightKg")) * 1000 if _f(it.get("weightKg")) else None, "length_cm": dims.get("l"), "width_cm": dims.get("w"), "height_cm": dims.get("h"),
                  "variation_count": it.get("variations") or None, "image_count": it.get("images") or None, "has_aplus": it.get("aplus"), "has_video": it.get("video"),
                  "image_url": it.get("image", ""), "fulfilment": it.get("sellerType") or "", "amazon_sells": (it.get("sellerType") == "AMZ") if it.get("sellerType") else None}
        p = upsert(db, org_id, mkt, fields, source="extension_import", classification="user")
        derive(db, p)
        out.append(p)
    record_source(db, org_id, "import", "extension", "extension_import", "user", ref=f"{len(out)} products")
    return out


CSV_MAP = {"asin": ["asin"], "title": ["title", "product name", "name"], "brand_name": ["brand"], "price": ["price", "buy box price", "selling price"],
           "bsr": ["bsr", "sales rank", "best sellers rank"], "category": ["category"], "rating": ["rating", "stars"], "review_count": ["reviews", "review count", "ratings"],
           "offer_count": ["offers", "sellers", "seller count"], "weight_g": ["weight g", "weight (g)"], "ean": ["ean"], "upc": ["upc"], "unit_cost": ["unit cost", "cost"],
           "bought_past_month": ["bought past month badge", "monthly sold", "bought past month"]}


def import_csv(db: Session, org_id: int, marketplace: str, text: str) -> list[Product]:
    reader = csv.DictReader(io.StringIO(text))
    headers = {h.lower().strip(): h for h in (reader.fieldnames or [])}
    col = {k: next((headers[a] for a in alts if a in headers), None) for k, alts in CSV_MAP.items()}
    wkg = headers.get("weight kg")
    if not col["asin"]:
        raise ValueError("The CSV needs an ASIN column.")
    out = []
    for row in reader:
        asin = (row.get(col["asin"]) or "").strip().upper()
        if not re.fullmatch(r"[A-Z0-9]{10}", asin):
            continue
        f = {"asin": asin}
        for k, c in col.items():
            if c and k != "asin":
                v = row.get(c)
                f[k] = _f(v) if k in ("price", "rating", "weight_g", "unit_cost") else (int(_f(v)) if _f(v) is not None else None) if k in ("bsr", "review_count", "offer_count", "bought_past_month") else (v or "")
        if wkg and _f(row.get(wkg)):
            f["weight_g"] = _f(row.get(wkg)) * 1000
        p = upsert(db, org_id, marketplace, f, source="csv_import", classification="user")
        derive(db, p)
        out.append(p)
    record_source(db, org_id, "import", "csv", "csv_import", "user", ref=f"{len(out)} products")
    return out


def lookup_and_store(db: Session, org_id: int, marketplace: str, q: dict) -> tuple[list[Product], list[dict]]:
    """Resolve an identifier or keyword to products through configured providers."""
    m = db.get(Marketplace, marketplace)
    notes: list[dict] = []
    found: list[Product] = []
    keepa = get_provider(db, org_id, "keepa")
    sp = get_provider(db, org_id, "sp_api")
    pa = get_provider(db, org_id, "pa_api")
    t, v = q["type"], q["value"]
    if t == "asin":
        existing = db.scalar(select(Product).where(Product.org_id == org_id, Product.marketplace == marketplace, Product.asin == v))
        p = existing or upsert(db, org_id, marketplace, {"asin": v}, source="user", classification="user")
        rep = refresh_from_providers(db, org_id, p)
        notes += [{"provider": f["provider"], "error": f["error"]} for f in rep["failed"]]
        if not rep["ok"] and not existing:
            notes.append({"provider": None, "error": "No product data source is connected, so only the ASIN was saved. Connect Keepa or SP-API, or import data from the extension."})
        found.append(p)
        return found, notes
    if t in ("ean", "upc", "isbn"):
        if sp.configured():
            try:
                items = sp.catalog_search(m.sp_marketplace_id, identifiers=[v], id_type=t.upper()).data
                for it in items:
                    p = upsert(db, org_id, marketplace, it, source="sp_api", classification="official_api")
                    derive(db, p)
                    found.append(p)
            except ProviderError as e:
                notes.append({"provider": "sp_api", "error": e.message})
        if not found and keepa.configured() and m.keepa_domain_id:
            try:
                for d in keepa.product_by_code(m.keepa_domain_id, v).data:
                    p = store_keepa(db, org_id, marketplace, d)
                    derive(db, p)
                    found.append(p)
            except ProviderError as e:
                notes.append({"provider": "keepa", "error": e.message})
        if not found and not (sp.configured() or keepa.configured()):
            notes.append({"provider": None, "error": "Looking up EAN/UPC/ISBN needs SP-API or Keepa."})
        return found, notes
    # keywords / brand
    if sp.configured():
        try:
            for it in sp.catalog_search(m.sp_marketplace_id, keywords=v).data:
                p = upsert(db, org_id, marketplace, it, source="sp_api", classification="official_api")
                derive(db, p)
                found.append(p)
        except ProviderError as e:
            notes.append({"provider": "sp_api", "error": e.message})
    elif pa.configured():
        try:
            for it in pa.search(marketplace, v).data:
                p = upsert(db, org_id, marketplace, it, source="pa_api", classification="official_api")
                derive(db, p)
                found.append(p)
        except ProviderError as e:
            notes.append({"provider": "pa_api", "error": e.message})
    if keepa.configured() and m.keepa_domain_id and len(found) < 5:
        try:
            asins = keepa.finder(m.keepa_domain_id, KeepaProvider.finder_selection({"title": v, "limit": 50})).data["asins"][:20]
            if asins:
                for d in keepa.products(m.keepa_domain_id, asins, days=180).data:
                    p = store_keepa(db, org_id, marketplace, d)
                    derive(db, p)
                    found.append(p)
        except ProviderError as e:
            notes.append({"provider": "keepa", "error": e.message})
    if not (sp.configured() or pa.configured() or keepa.configured()):
        notes.append({"provider": None, "error": "Keyword search on Amazon needs SP-API, PA-API or Keepa. Searching your saved products instead."})
    return found, notes
