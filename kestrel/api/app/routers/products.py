"""Product research, database, detail, tracker, comparison, opportunity finder, saved searches."""
from datetime import date, timedelta

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile
from pydantic import BaseModel, Field
from sqlalchemy import and_, asc, desc, func, or_, select
from sqlalchemy.orm import Session

from ..audit import audit_ctx
from ..deps import Ctx, get_ctx, need_analyst
from ..models import (EligibilityRecord, Marketplace, Product, ProductSnapshot, SavedSearch, SupplierProduct, TrackedProduct, TrackingGroup)
from ..services import history as hist
from ..services import products as svc

router = APIRouter(tags=["products"])


def product_out(p: Product, brief=False) -> dict:
    d = {
        "id": p.id, "asin": p.asin, "marketplace": p.marketplace, "title": p.title, "brand": p.brand_name, "category": p.category, "subcategory": p.subcategory,
        "image_url": p.image_url, "price": p.price, "currency": p.currency, "bsr": p.bsr, "bsr_category": p.bsr_category, "rating": p.rating, "reviews": p.review_count,
        "offers": p.offer_count, "fulfilment": p.fulfilment, "amazon_sells": p.amazon_sells, "units": p.est_monthly_units, "units_low": p.est_units_low,
        "units_high": p.est_units_high, "revenue": p.est_monthly_revenue, "profit": p.est_profit, "margin": p.est_margin, "roi": p.est_roi,
        "fba_fee": p.fba_fee, "size_tier": p.size_tier, "competition": p.competition_level, "score": p.opportunity_score,
        "bought_past_month": p.bought_past_month, "source": p.source, "classification": p.classification, "last_refreshed_at": p.last_refreshed_at,
        "unit_cost": p.unit_cost, "cost_assumed": (p.data_quality or {}).get("cost_assumed", True),
    }
    if brief:
        return d
    d.update({"ean": p.ean, "upc": p.upc, "isbn": p.isbn, "manufacturer": p.manufacturer, "parent_asin": p.parent_asin, "fba_offers": p.fba_offer_count,
              "fbm_offers": p.fbm_offer_count, "weight_g": p.weight_g, "length_cm": p.length_cm, "width_cm": p.width_cm, "height_cm": p.height_cm,
              "variations": p.variation_count, "images": p.image_count, "has_aplus": p.has_aplus, "has_video": p.has_video, "listed_at": p.listed_at,
              "est_method": p.est_method, "referral_fee": p.referral_fee, "price_stability": p.price_stability, "sales_consistency": p.sales_consistency,
              "seasonality": p.seasonality, "listing_quality": p.listing_quality, "score_components": p.score_components, "data_quality": p.data_quality,
              "keepa_stats": (p.raw or {}).get("keepa_stats")})
    return d


def _get(ctx: Ctx, pid: int) -> Product:
    p = ctx.db.get(Product, pid)
    if not p or p.org_id != ctx.org_id:
        raise HTTPException(404, "Product not found")
    return p


# ---------------------------------------------------------------- research
class ResearchIn(BaseModel):
    q: str = Field(min_length=1, max_length=500)
    marketplace: str = "UK"


@router.post("/research")
def research(body: ResearchIn, ctx: Ctx = Depends(need_analyst)):
    parsed = svc.parse_query(body.q)
    mkt = parsed.get("marketplace") or body.marketplace
    if not ctx.db.get(Marketplace, mkt):
        raise HTTPException(400, "Unknown marketplace")
    found, notes = svc.lookup_and_store(ctx.db, ctx.org_id, mkt, parsed)
    if parsed["type"] == "keyword":
        like = f"%{parsed['value']}%"
        local = ctx.db.scalars(select(Product).where(Product.org_id == ctx.org_id, Product.marketplace == mkt, or_(Product.title.ilike(like), Product.brand_name.ilike(like)))
                               .order_by(Product.opportunity_score.desc().nullslast()).limit(100)).all()
        ids = {p.id for p in found}
        found += [p for p in local if p.id not in ids]
    audit_ctx(ctx, "research.search", "query", parsed["type"], {"q": body.q[:120], "results": len(found)})
    ctx.db.commit()
    return {"query": parsed, "marketplace": mkt, "results": [product_out(p, brief=True) for p in found], "notes": notes}


# ---------------------------------------------------------------- database
SORTABLE = {"score": Product.opportunity_score, "price": Product.price, "units": Product.est_monthly_units, "revenue": Product.est_monthly_revenue,
            "bsr": Product.bsr, "reviews": Product.review_count, "rating": Product.rating, "profit": Product.est_profit, "roi": Product.est_roi,
            "margin": Product.est_margin, "offers": Product.offer_count, "title": Product.title, "updated": Product.last_refreshed_at, "listed": Product.listed_at}
RANGES = {"price": Product.price, "revenue": Product.est_monthly_revenue, "units": Product.est_monthly_units, "bsr": Product.bsr, "reviews": Product.review_count,
          "rating": Product.rating, "profit": Product.est_profit, "roi": Product.est_roi, "margin": Product.est_margin, "offers": Product.offer_count,
          "weight": Product.weight_g, "fba_fee": Product.fba_fee, "variations": Product.variation_count, "score": Product.opportunity_score,
          "price_stability": Product.price_stability, "sales_consistency": Product.sales_consistency, "seasonality": Product.seasonality, "listing_quality": Product.listing_quality}


def apply_filters(q, f: dict, org_id: int):
    q = q.where(Product.org_id == org_id)
    if f.get("marketplace"):
        q = q.where(Product.marketplace == f["marketplace"])
    if f.get("q"):
        like = f"%{f['q']}%"
        q = q.where(or_(Product.title.ilike(like), Product.asin.ilike(like), Product.brand_name.ilike(like), Product.ean == f["q"], Product.upc == f["q"]))
    for key, colm in (("category", Product.category), ("brand", Product.brand_name), ("size_tier", Product.size_tier), ("competition", Product.competition_level), ("fulfilment", Product.fulfilment)):
        if f.get(key):
            vals = f[key] if isinstance(f[key], list) else [f[key]]
            q = q.where(colm.in_(vals)) if key != "brand" else q.where(or_(*[Product.brand_name.ilike(f"%{v}%") for v in vals]))
    for key, colm in RANGES.items():
        lo, hi = f.get(f"{key}_min"), f.get(f"{key}_max")
        if lo not in (None, ""):
            q = q.where(colm >= float(lo) * (1000 if key == "weight" else 1))
        if hi not in (None, ""):
            q = q.where(colm <= float(hi) * (1000 if key == "weight" else 1))
    if f.get("age_max_days"):
        q = q.where(Product.listed_at >= date.today() - timedelta(days=int(f["age_max_days"])))
    if f.get("age_min_days"):
        q = q.where(Product.listed_at <= date.today() - timedelta(days=int(f["age_min_days"])))
    if f.get("exclude_amazon"):
        q = q.where(or_(Product.amazon_sells.is_(None), Product.amazon_sells.is_(False)))
    if f.get("tracked"):
        q = q.where(Product.id.in_(select(TrackedProduct.product_id).where(TrackedProduct.org_id == org_id)))
    if f.get("has_supplier"):
        q = q.where(Product.id.in_(select(SupplierProduct.product_id)))
    return q


class ListIn(BaseModel):
    filters: dict = {}
    sort: str = "score"
    dir: str = "desc"
    page: int = 1
    page_size: int = Field(50, le=200)


@router.post("/products/query")
def query_products(body: ListIn, ctx: Ctx = Depends(get_ctx)):
    q = apply_filters(select(Product), body.filters, ctx.org_id)
    total = ctx.db.scalar(select(func.count()).select_from(q.subquery()))
    col = SORTABLE.get(body.sort, Product.opportunity_score)
    order = (desc(col) if body.dir == "desc" else asc(col)).nullslast()
    rows = ctx.db.scalars(q.order_by(order, Product.id).offset((body.page - 1) * body.page_size).limit(body.page_size)).all()
    tracked = set(ctx.db.scalars(select(TrackedProduct.product_id).where(TrackedProduct.org_id == ctx.org_id)))
    sub = apply_filters(select(Product), body.filters, ctx.org_id).subquery()
    agg = ctx.db.execute(select(func.count(), func.avg(sub.c.opportunity_score), func.sum(sub.c.est_monthly_revenue), func.avg(sub.c.price), func.avg(sub.c.review_count))).one()
    return {"total": total, "page": body.page, "page_size": body.page_size,
            "summary": {"count": agg[0], "avg_score": round(agg[1], 1) if agg[1] else None, "total_revenue": agg[2], "avg_price": agg[3], "avg_reviews": agg[4]},
            "items": [{**product_out(p, brief=True), "tracked": p.id in tracked} for p in rows]}


@router.get("/products/facets")
def facets(marketplace: str | None = None, ctx: Ctx = Depends(get_ctx)):
    base = select(Product).where(Product.org_id == ctx.org_id)
    if marketplace:
        base = base.where(Product.marketplace == marketplace)
    sub = base.subquery()
    cats = ctx.db.execute(select(sub.c.category, func.count()).where(sub.c.category != "").group_by(sub.c.category).order_by(func.count().desc()).limit(60)).all()
    brands = ctx.db.execute(select(sub.c.brand_name, func.count()).where(sub.c.brand_name != "").group_by(sub.c.brand_name).order_by(func.count().desc()).limit(60)).all()
    tiers = ctx.db.execute(select(sub.c.size_tier, func.count()).where(sub.c.size_tier != "").group_by(sub.c.size_tier)).all()
    return {"categories": [{"value": c, "count": n} for c, n in cats], "brands": [{"value": c, "count": n} for c, n in brands], "size_tiers": [{"value": c, "count": n} for c, n in tiers]}


@router.get("/products/export")
def export_products(ctx: Ctx = Depends(get_ctx), format: str = "csv", filters: str = "{}"):
    import json
    from ..services.exports import export_rows
    f = json.loads(filters or "{}")
    rows = ctx.db.scalars(apply_filters(select(Product), f, ctx.org_id).order_by(Product.opportunity_score.desc().nullslast()).limit(10000)).all()
    cols = [("ASIN", "asin"), ("Marketplace", "marketplace"), ("Title", "title"), ("Brand", "brand"), ("Category", "category"), ("Price", "price"), ("Currency", "currency"),
            ("Est. monthly units", "units"), ("Units low", "units_low"), ("Units high", "units_high"), ("Est. monthly revenue", "revenue"), ("BSR", "bsr"), ("Reviews", "reviews"),
            ("Rating", "rating"), ("Offers", "offers"), ("FBA fee", "fba_fee"), ("Size tier", "size_tier"), ("Est. profit/unit", "profit"), ("Margin %", "margin"),
            ("ROI %", "roi"), ("Unit cost assumed", "cost_assumed"), ("Competition", "competition"), ("Opportunity score", "score"), ("Data source", "source"), ("Last refreshed", "last_refreshed_at")]
    audit_ctx(ctx, "export.products", "products", "", {"rows": len(rows), "format": format})
    ctx.db.commit()
    return export_rows("Product research", cols, [product_out(p, brief=True) for p in rows], format,
                       note="Sales, revenue, profit and score are estimates. Profit uses your unit cost where entered, otherwise an assumed 25% of price (flagged).")


@router.get("/products/{pid}")
def product_detail(pid: int, ctx: Ctx = Depends(get_ctx)):
    p = _get(ctx, pid)
    d = product_out(p)
    d["tracked"] = bool(ctx.db.scalar(select(TrackedProduct.id).where(TrackedProduct.org_id == ctx.org_id, TrackedProduct.product_id == pid)))
    d["eligibility"] = [{"result": e.result, "source": e.source, "checked_at": e.checked_at, "reasons": e.reasons} for e in
                        ctx.db.scalars(select(EligibilityRecord).where(EligibilityRecord.org_id == ctx.org_id, EligibilityRecord.product_id == pid).order_by(EligibilityRecord.checked_at.desc()).limit(5))]
    from ..models import DataSourceRecord
    d["sources"] = [{"provider": r.provider, "classification": r.classification, "retrieved_at": r.retrieved_at, "period_from": r.period_from, "period_to": r.period_to}
                    for r in ctx.db.scalars(select(DataSourceRecord).where(DataSourceRecord.org_id == ctx.org_id, DataSourceRecord.entity == "product", DataSourceRecord.entity_id == str(pid)).order_by(DataSourceRecord.retrieved_at.desc()).limit(10))]
    d["history_summary"] = hist.analyse(ctx.db, pid)
    return d


@router.post("/products/{pid}/refresh")
def refresh_product(pid: int, ctx: Ctx = Depends(need_analyst)):
    p = _get(ctx, pid)
    rep = svc.refresh_from_providers(ctx.db, ctx.org_id, p)
    svc.snapshot(ctx.db, p, ",".join(rep["ok"]) or "derived")
    ctx.db.commit()
    return {"report": rep, "product": product_out(p)}


class ProductPatch(BaseModel):
    unit_cost: float | None = None
    weight_g: float | None = None
    length_cm: float | None = None
    width_cm: float | None = None
    height_cm: float | None = None
    category: str | None = None
    price: float | None = None


@router.patch("/products/{pid}")
def patch_product(pid: int, body: ProductPatch, ctx: Ctx = Depends(need_analyst)):
    p = _get(ctx, pid)
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(p, k, v)
    svc.derive(ctx.db, p)
    ctx.db.commit()
    return product_out(p)


@router.delete("/products/{pid}")
def delete_product(pid: int, ctx: Ctx = Depends(need_analyst)):
    p = _get(ctx, pid)
    ctx.db.delete(p)
    ctx.db.commit()
    return {"ok": True}


class EligIn(BaseModel):
    result: str = Field(pattern="^(eligible|approval_required|restricted)$")
    notes: str = ""


@router.post("/products/{pid}/eligibility")
def record_eligibility(pid: int, body: EligIn, ctx: Ctx = Depends(need_analyst)):
    p = _get(ctx, pid)
    ctx.db.add(EligibilityRecord(org_id=ctx.org_id, product_id=p.id, result=body.result, reasons=[body.notes] if body.notes else [], source="seller_central_manual", user_id=ctx.user.id))
    svc.derive(ctx.db, p)
    audit_ctx(ctx, "eligibility.recorded", "product", pid, {"result": body.result})
    ctx.db.commit()
    return {"ok": True}


@router.post("/products/{pid}/eligibility/check")
def check_eligibility(pid: int, ctx: Ctx = Depends(need_analyst)):
    from ..providers import get_provider
    p = _get(ctx, pid)
    sp = get_provider(ctx.db, ctx.org_id, "sp_api")
    res = sp.listing_restrictions(ctx.db.get(Marketplace, p.marketplace).sp_marketplace_id, p.asin)
    ctx.db.add(EligibilityRecord(org_id=ctx.org_id, product_id=p.id, result=res.data["result"], reasons=res.data["reasons"], source="sp_api", user_id=ctx.user.id))
    svc.derive(ctx.db, p)
    ctx.db.commit()
    return res.data


@router.post("/products/import")
async def import_products(ctx: Ctx = Depends(need_analyst), file: UploadFile | None = File(None), text: str = Form(""), marketplace: str = Form("UK")):
    import json
    raw = (await file.read()).decode("utf-8", "replace") if file else text
    if not raw.strip():
        raise HTTPException(400, "Upload a CSV, or paste the JSON copied from the Product Pilot extension.")
    if raw.lstrip().startswith("{"):
        try:
            data = json.loads(raw)
        except ValueError:
            raise HTTPException(400, "That JSON couldn't be read.")
        rows = svc.import_extension_json(ctx.db, ctx.org_id, data)
    else:
        try:
            rows = svc.import_csv(ctx.db, ctx.org_id, marketplace, raw)
        except ValueError as e:
            raise HTTPException(400, str(e))
    audit_ctx(ctx, "products.imported", "products", "", {"count": len(rows)})
    ctx.db.commit()
    return {"imported": len(rows), "items": [product_out(p, brief=True) for p in rows[:200]]}


# ---------------------------------------------------------------- opportunity finder
OPP_TYPES = {
    "high_demand_low_competition": ("High demand, low competition", lambda: and_(Product.est_monthly_units >= 300, Product.review_count <= 300)),
    "consistent_sales": ("Consistent sales", lambda: Product.sales_consistency >= 0.7),
    "improving_demand": ("Improving demand", None),
    "stable_prices": ("Stable selling prices", lambda: Product.price_stability >= 0.8),
    "weak_listings": ("Weak competitor listings", lambda: or_(Product.rating < 4.2, Product.listing_quality < 60)),
    "differentiation": ("Room to differentiate", lambda: and_(Product.rating < 4.3, Product.review_count >= 50)),
    "multiple_suppliers": ("Multiple viable suppliers", None),
    "wholesale_margin": ("Attractive wholesale margins", lambda: and_(Product.est_margin >= 20, Product.offer_count >= 2, Product.unit_cost.isnot(None))),
    "private_label": ("Private-label potential", lambda: and_(Product.est_monthly_units >= 150, Product.review_count <= 500, or_(Product.amazon_sells.is_(None), Product.amazon_sells.is_(False)), Product.est_margin >= 20)),
}


@router.get("/opportunities")
def opportunities(kind: str = "high_demand_low_competition", marketplace: str | None = None, limit: int = 50, ctx: Ctx = Depends(get_ctx)):
    out = {}
    kinds = [kind] if kind != "all" else list(OPP_TYPES)
    for k in kinds:
        label, cond = OPP_TYPES[k]
        q = select(Product).where(Product.org_id == ctx.org_id, Product.opportunity_score.isnot(None))
        if marketplace:
            q = q.where(Product.marketplace == marketplace)
        if k == "improving_demand":
            rows = _improving(ctx, q, limit)
        elif k == "multiple_suppliers":
            sub = select(SupplierProduct.product_id).group_by(SupplierProduct.product_id).having(func.count(func.distinct(SupplierProduct.supplier_id)) >= 2)
            rows = ctx.db.scalars(q.where(Product.id.in_(sub)).order_by(Product.opportunity_score.desc()).limit(limit)).all()
        else:
            rows = ctx.db.scalars(q.where(cond()).order_by(Product.opportunity_score.desc()).limit(limit)).all()
        out[k] = {"label": label, "items": [{**product_out(p, brief=True), "why": (p.score_components or {}).get("summary", "")} for p in rows]}
    return out


def _improving(ctx: Ctx, q, limit):
    from ..models import PriceHistory
    cands = ctx.db.scalars(q.where(Product.id.in_(select(PriceHistory.product_id).where(PriceHistory.series == "rank").distinct())).order_by(Product.opportunity_score.desc()).limit(300)).all()
    scored = []
    for p in cands:
        mv = hist.analyse(ctx.db, p.id).get("bsr_movement_pct")
        if mv and mv > 15:
            scored.append((mv, p))
    return [p for _, p in sorted(scored, key=lambda x: -x[0])[:limit]]


# ---------------------------------------------------------------- comparison
@router.get("/compare")
def compare(ids: list[int] = Query(...), ctx: Ctx = Depends(get_ctx)):
    if len(ids) > 10:
        raise HTTPException(400, "Compare up to 10 products at a time.")
    rows = []
    for i in ids:
        p = _get(ctx, i)
        h = hist.analyse(ctx.db, p.id)
        sup = ctx.db.scalar(select(func.count(func.distinct(SupplierProduct.supplier_id))).where(SupplierProduct.product_id == p.id)) or 0
        w90 = (h.get("windows") or {}).get("90", {}) if h.get("available") else {}
        rows.append({**product_out(p), "history": {"available": h.get("available", False), "avg_price_90": (w90.get("price") or {}).get("avg"),
                                                   "avg_bsr_90": (w90.get("rank") or {}).get("avg"), "buybox_stability": (h.get("buybox") or {}).get("stability"),
                                                   "bsr_movement_pct": h.get("bsr_movement_pct")}, "supplier_count": sup})
    return rows


# ---------------------------------------------------------------- tracker
class TrackIn(BaseModel):
    product_ids: list[int]
    group_id: int | None = None
    target_price: float | None = None


@router.post("/tracker")
def track(body: TrackIn, ctx: Ctx = Depends(need_analyst)):
    n = 0
    for pid in body.product_ids:
        _get(ctx, pid)
        if not ctx.db.scalar(select(TrackedProduct.id).where(TrackedProduct.org_id == ctx.org_id, TrackedProduct.product_id == pid, TrackedProduct.group_id == body.group_id)):
            ctx.db.add(TrackedProduct(org_id=ctx.org_id, product_id=pid, group_id=body.group_id, target_price=body.target_price))
            p = ctx.db.get(Product, pid)
            svc.snapshot(ctx.db, p, "tracking_start")
            n += 1
    ctx.db.commit()
    return {"added": n}


@router.delete("/tracker/{pid}")
def untrack(pid: int, ctx: Ctx = Depends(need_analyst)):
    for t in ctx.db.scalars(select(TrackedProduct).where(TrackedProduct.org_id == ctx.org_id, TrackedProduct.product_id == pid)):
        ctx.db.delete(t)
    ctx.db.commit()
    return {"ok": True}


@router.get("/tracker")
def tracker(group_id: int | None = None, ctx: Ctx = Depends(get_ctx)):
    q = select(TrackedProduct).where(TrackedProduct.org_id == ctx.org_id)
    if group_id:
        q = q.where(TrackedProduct.group_id == group_id)
    out, seen = [], set()
    for t in ctx.db.scalars(q.order_by(TrackedProduct.created_at.desc())):
        if t.product_id in seen:
            continue
        seen.add(t.product_id)
        snaps = ctx.db.execute(select(ProductSnapshot.ts, ProductSnapshot.price, ProductSnapshot.bsr, ProductSnapshot.review_count, ProductSnapshot.est_monthly_units)
                               .where(ProductSnapshot.product_id == t.product_id).order_by(ProductSnapshot.ts.desc()).limit(60)).all()[::-1]
        first = snaps[0] if snaps else None
        p = t.product
        out.append({**product_out(p, brief=True), "group_id": t.group_id, "target_price": t.target_price, "notes": t.notes, "tracked_since": t.created_at,
                    "spark_price": [s[1] for s in snaps], "spark_bsr": [s[2] for s in snaps], "spark_units": [s[4] for s in snaps],
                    "price_change": (p.price - first[1]) if first and first[1] and p.price else None,
                    "bsr_change": (p.bsr - first[2]) if first and first[2] and p.bsr else None,
                    "reviews_change": (p.review_count - first[3]) if first and first[3] is not None and p.review_count is not None else None, "snapshots": len(snaps)})
    groups = [{"id": g.id, "name": g.name, "colour": g.colour, "kind": g.kind, "count": ctx.db.scalar(select(func.count()).select_from(TrackedProduct).where(TrackedProduct.group_id == g.id))}
              for g in ctx.db.scalars(select(TrackingGroup).where(TrackingGroup.org_id == ctx.org_id).order_by(TrackingGroup.name))]
    return {"items": out, "groups": groups}


class GroupIn(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    colour: str = "#4F7CFF"
    kind: str = "tracker"


@router.post("/tracker/groups")
def create_group(body: GroupIn, ctx: Ctx = Depends(need_analyst)):
    g = TrackingGroup(org_id=ctx.org_id, **body.model_dump())
    ctx.db.add(g)
    ctx.db.commit()
    return {"id": g.id, "name": g.name}


@router.delete("/tracker/groups/{gid}")
def delete_group(gid: int, ctx: Ctx = Depends(need_analyst)):
    g = ctx.db.get(TrackingGroup, gid)
    if g and g.org_id == ctx.org_id:
        ctx.db.delete(g)
        ctx.db.commit()
    return {"ok": True}


@router.get("/products/{pid}/snapshots")
def snapshots(pid: int, ctx: Ctx = Depends(get_ctx)):
    _get(ctx, pid)
    rows = ctx.db.scalars(select(ProductSnapshot).where(ProductSnapshot.product_id == pid).order_by(ProductSnapshot.ts)).all()
    return [{"ts": s.ts, "price": s.price, "bsr": s.bsr, "reviews": s.review_count, "rating": s.rating, "offers": s.offer_count, "units": s.est_monthly_units, "source": s.source} for s in rows]


# ---------------------------------------------------------------- saved searches
class SavedIn(BaseModel):
    module: str
    name: str = Field(min_length=1, max_length=120)
    filters: dict
    is_template: bool = False


@router.get("/saved-searches")
def list_saved(module: str, ctx: Ctx = Depends(get_ctx)):
    rows = ctx.db.scalars(select(SavedSearch).where(SavedSearch.org_id == ctx.org_id, SavedSearch.module == module).order_by(SavedSearch.is_template.desc(), SavedSearch.name)).all()
    return [{"id": s.id, "name": s.name, "filters": s.filters, "is_template": s.is_template, "created_at": s.created_at} for s in rows]


@router.post("/saved-searches")
def create_saved(body: SavedIn, ctx: Ctx = Depends(need_analyst)):
    s = SavedSearch(org_id=ctx.org_id, user_id=ctx.user.id, **body.model_dump())
    ctx.db.add(s)
    ctx.db.commit()
    return {"id": s.id}


@router.delete("/saved-searches/{sid}")
def delete_saved(sid: int, ctx: Ctx = Depends(need_analyst)):
    s = ctx.db.get(SavedSearch, sid)
    if s and s.org_id == ctx.org_id:
        ctx.db.delete(s)
        ctx.db.commit()
    return {"ok": True}
