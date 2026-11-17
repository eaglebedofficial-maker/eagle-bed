"""Dashboard summary, market overview and global search."""
from datetime import timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func, or_, select

from ..db import utcnow
from ..deps import Ctx, get_ctx
from ..models import AlertEvent, AuditLog, Product, ProductSnapshot, Supplier, SupplierProduct
from .products import product_out

router = APIRouter(tags=["dashboard"])


def _weekly(ctx: Ctx, model, col, weeks=8):
    """Counts per week for the last N weeks (for sparklines and deltas)."""
    now = utcnow()
    out = []
    for i in range(weeks, 0, -1):
        a, b = now - timedelta(weeks=i), now - timedelta(weeks=i - 1)
        out.append(ctx.db.scalar(select(func.count()).select_from(model).where(model.org_id == ctx.org_id, col >= a, col < b)) or 0)
    return out


def _delta(series):
    if len(series) < 2 or not series[-2]:
        return None
    return round((series[-1] - series[-2]) / series[-2] * 100, 1)


@router.get("/dashboard")
def dashboard(marketplace: str | None = None, ctx: Ctx = Depends(get_ctx)):
    pq = select(Product).where(Product.org_id == ctx.org_id)
    if marketplace:
        pq = pq.where(Product.marketplace == marketplace)
    sub = pq.subquery()
    total = ctx.db.scalar(select(func.count()).select_from(sub)) or 0
    opps = ctx.db.scalar(select(func.count()).select_from(sub).where(sub.c.opportunity_score >= 65)) or 0
    avg_score = ctx.db.scalar(select(func.avg(sub.c.opportunity_score)).select_from(sub))
    rev = ctx.db.scalar(select(func.sum(sub.c.est_monthly_revenue)).select_from(sub).where(sub.c.opportunity_score >= 65))
    profit = ctx.db.scalar(select(func.sum(sub.c.est_profit * sub.c.est_monthly_units)).select_from(sub).where(sub.c.opportunity_score >= 65, sub.c.est_profit > 0))
    sup_n = ctx.db.scalar(select(func.count()).select_from(Supplier).where(Supplier.org_id == ctx.org_id)) or 0
    prod_weekly = _weekly(ctx, Product, Product.created_at)
    sup_weekly = _weekly(ctx, Supplier, Supplier.created_at)
    top = ctx.db.scalars(pq.where(Product.opportunity_score.isnot(None)).order_by(Product.opportunity_score.desc()).limit(8)).all()
    # category opportunities
    cats = ctx.db.execute(select(sub.c.category, func.count(), func.avg(sub.c.opportunity_score), func.sum(sub.c.est_monthly_revenue), func.avg(sub.c.review_count))
                          .where(sub.c.category != "").group_by(sub.c.category).order_by(func.avg(sub.c.opportunity_score).desc().nullslast()).limit(8)).all()
    # market trend: weekly avg price / units of tracked snapshot data (real snapshots only)
    snaps = []
    now = utcnow()
    for i in range(12, 0, -1):
        a, b = now - timedelta(weeks=i), now - timedelta(weeks=i - 1)
        r = ctx.db.execute(select(func.avg(ProductSnapshot.est_monthly_units), func.avg(ProductSnapshot.price), func.count())
                           .join(Product, Product.id == ProductSnapshot.product_id).where(Product.org_id == ctx.org_id, ProductSnapshot.ts >= a, ProductSnapshot.ts < b)).one()
        snaps.append({"week": a.date().isoformat(), "avg_units": round(r[0], 1) if r[0] else None, "avg_price": round(r[1], 2) if r[1] else None, "samples": r[2]})
    suppliers = ctx.db.scalars(select(Supplier).where(Supplier.org_id == ctx.org_id).order_by(Supplier.created_at.desc()).limit(6)).all()
    sup_out = []
    for s in suppliers:
        matched = ctx.db.scalar(select(func.count(func.distinct(SupplierProduct.product_id))).where(SupplierProduct.supplier_id == s.id, SupplierProduct.product_id.isnot(None))) or 0
        sup_out.append({"id": s.id, "name": s.trading_name or s.legal_name, "country": s.country, "status": s.status, "type": s.supplier_type, "score": s.score,
                        "risk_level": s.risk_level, "matched_products": matched, "registry_checked": bool(s.registry_checked_at), "vat_valid": s.vat_valid, "created_at": s.created_at})
    events = ctx.db.scalars(select(AlertEvent).where(AlertEvent.org_id == ctx.org_id).order_by(AlertEvent.triggered_at.desc()).limit(8)).all()
    activity = [{"kind": e.kind, "title": e.title, "body": e.body, "at": e.triggered_at} for e in events]
    if len(activity) < 8:
        for a in ctx.db.scalars(select(AuditLog).where(AuditLog.org_id == ctx.org_id, AuditLog.action.in_(["research.search", "products.imported", "supplier.created", "supplier.verified", "invoice.assessed", "integration.saved"]))
                                .order_by(AuditLog.created_at.desc()).limit(8 - len(activity))):
            label = {"research.search": "Research search", "products.imported": "Products imported", "supplier.created": "Supplier added", "supplier.verified": "Supplier verified",
                     "invoice.assessed": "Invoice assessed", "integration.saved": "Integration updated"}.get(a.action, a.action)
            detail = a.meta.get("q") or a.meta.get("name") or (f"{a.meta.get('count')} products" if a.meta.get("count") else "") or a.entity_id
            activity.append({"kind": a.action.split(".")[0], "title": label, "body": str(detail or ""), "at": a.created_at})
    return {
        "kpis": {
            "products_analysed": {"value": total, "trend": prod_weekly, "delta": _delta(prod_weekly)},
            "opportunities": {"value": opps},
            "avg_score": {"value": round(avg_score, 1) if avg_score else None},
            "est_monthly_revenue": {"value": rev, "classification": "estimated"},
            "potential_net_profit": {"value": profit, "classification": "estimated"},
            "suppliers": {"value": sup_n, "trend": sup_weekly, "delta": _delta(sup_weekly)},
        },
        "top_opportunities": [product_out(p, brief=True) for p in top],
        "categories": [{"category": c, "products": n, "avg_score": round(s, 1) if s else None, "revenue": r, "avg_reviews": round(rv) if rv else None} for c, n, s, r, rv in cats],
        "market_trend": snaps,
        "suppliers": sup_out,
        "activity": sorted(activity, key=lambda x: x["at"], reverse=True),
    }


@router.get("/search")
def global_search(q: str, marketplace: str | None = None, ctx: Ctx = Depends(get_ctx)):
    like = f"%{q.strip()}%"
    out = []
    pq = select(Product).where(Product.org_id == ctx.org_id, or_(Product.title.ilike(like), Product.asin.ilike(like), Product.brand_name.ilike(like), Product.ean == q.strip(), Product.upc == q.strip()))
    for p in ctx.db.scalars(pq.order_by(Product.opportunity_score.desc().nullslast()).limit(6)):
        out.append({"type": "product", "id": p.id, "title": p.title[:90] or p.asin, "subtitle": f"{p.asin} · {p.marketplace}", "href": f"/products/{p.id}"})
    for s in ctx.db.scalars(select(Supplier).where(Supplier.org_id == ctx.org_id, or_(Supplier.legal_name.ilike(like), Supplier.trading_name.ilike(like), Supplier.website.ilike(like))).limit(5)):
        out.append({"type": "supplier", "id": s.id, "title": s.trading_name or s.legal_name, "subtitle": s.country, "href": f"/suppliers/{s.id}"})
    return out


@router.get("/market")
def market_overview(marketplace: str | None = None, ctx: Ctx = Depends(get_ctx)):
    pq = select(Product).where(Product.org_id == ctx.org_id)
    if marketplace:
        pq = pq.where(Product.marketplace == marketplace)
    sub = pq.subquery()
    by_cat = ctx.db.execute(select(sub.c.category, func.count(), func.sum(sub.c.est_monthly_revenue), func.sum(sub.c.est_monthly_units), func.avg(sub.c.price),
                                   func.avg(sub.c.review_count), func.avg(sub.c.rating), func.avg(sub.c.opportunity_score), func.avg(sub.c.offer_count))
                            .where(sub.c.category != "").group_by(sub.c.category).order_by(func.sum(sub.c.est_monthly_revenue).desc().nullslast()).limit(40)).all()
    brands = ctx.db.execute(select(sub.c.brand_name, func.count(), func.sum(sub.c.est_monthly_revenue)).where(sub.c.brand_name != "").group_by(sub.c.brand_name)
                            .order_by(func.sum(sub.c.est_monthly_revenue).desc().nullslast()).limit(15)).all()
    comp = ctx.db.execute(select(sub.c.competition_level, func.count()).where(sub.c.competition_level != "").group_by(sub.c.competition_level)).all()
    bucket = func.width_bucket(sub.c.price, 0, 500, 10).label("b")
    bands = ctx.db.execute(select(bucket, func.count(), func.sum(sub.c.est_monthly_revenue)).where(sub.c.price.isnot(None)).group_by(bucket).order_by(bucket)).all()
    total_rev = sum((r[2] or 0) for r in by_cat) or 0
    return {
        "categories": [{"category": c, "products": n, "revenue": r, "units": u, "avg_price": ap, "avg_reviews": ar, "avg_rating": rt, "avg_score": sc, "avg_offers": of,
                        "share": (r or 0) / total_rev if total_rev else None} for c, n, r, u, ap, ar, rt, sc, of in by_cat],
        "brands": [{"brand": b, "products": n, "revenue": r, "share": (r or 0) / total_rev if total_rev else None} for b, n, r in brands],
        "competition": {k: v for k, v in comp},
        "price_bands": [{"band": f"{(b - 1) * 50}–{b * 50}" if b <= 10 else "500+", "products": n, "revenue": r} for b, n, r in bands],
        "classification": "estimated", "basis": "Aggregated from the products in your workspace; revenue and units are estimates.",
    }
