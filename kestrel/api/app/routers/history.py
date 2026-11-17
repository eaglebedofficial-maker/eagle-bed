"""Keepa Intelligence: historical series, analytics, buy box, offers, Product Finder, best sellers."""
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select

from ..deps import Ctx, get_ctx, need_analyst
from ..models import BuyBoxHistory, Marketplace, OfferSnapshot, PriceHistory, Product, ProductSnapshot
from ..providers import get_provider
from ..providers.keepa import KeepaProvider
from ..services import history as hist
from ..services import products as psvc
from .products import product_out

router = APIRouter(prefix="/history", tags=["history"])
SERIES_LABELS = {"amazon": "Amazon", "new": "New (3rd party)", "used": "Used", "buybox": "Buy Box", "fba": "New FBA", "fbm": "New FBM (incl. shipping)",
                 "warehouse": "Warehouse deals", "list": "List price", "rank": "Sales rank", "offers_new": "New offer count", "offers_used": "Used offer count",
                 "rating": "Rating", "reviews": "Review count", "monthly_sold": "Bought in past month"}


@router.get("/{pid}")
def series(pid: int, days: int = 365, ctx: Ctx = Depends(get_ctx)):
    p = ctx.db.get(Product, pid)
    if not p or p.org_id != ctx.org_id:
        raise HTTPException(404, "Product not found")
    since = datetime.now(timezone.utc) - timedelta(days=days) if days and days > 0 else None
    q = select(PriceHistory.series, PriceHistory.ts, PriceHistory.value, PriceHistory.source).where(PriceHistory.product_id == pid)
    if since:
        q = q.where(PriceHistory.ts >= since)
    data: dict[str, list] = {}
    sources = set()
    for s, t, v, src in ctx.db.execute(q.order_by(PriceHistory.ts)):
        data.setdefault(s, []).append([int(t.timestamp() * 1000), v])
        sources.add(src)
    # carry the value in force at the window start for step series
    if since:
        for s in list(data.keys()):
            prev = ctx.db.execute(select(PriceHistory.value).where(PriceHistory.product_id == pid, PriceHistory.series == s, PriceHistory.ts < since)
                                  .order_by(PriceHistory.ts.desc()).limit(1)).scalar()
            if prev is not None:
                data[s].insert(0, [int(since.timestamp() * 1000), prev])
    snaps = ctx.db.scalars(select(ProductSnapshot).where(ProductSnapshot.product_id == pid).order_by(ProductSnapshot.ts)).all()
    tracking = {"price": [[int(s.ts.timestamp() * 1000), s.price] for s in snaps if s.price], "rank": [[int(s.ts.timestamp() * 1000), s.bsr] for s in snaps if s.bsr],
                "offers": [[int(s.ts.timestamp() * 1000), s.offer_count] for s in snaps if s.offer_count]}
    bb = ctx.db.execute(select(BuyBoxHistory.ts, BuyBoxHistory.seller_id).where(BuyBoxHistory.product_id == pid).order_by(BuyBoxHistory.ts)).all()
    offers = ctx.db.scalars(select(OfferSnapshot).where(OfferSnapshot.product_id == pid).order_by(OfferSnapshot.ts.desc()).limit(60)).all()
    latest_ts = offers[0].ts if offers else None
    current_offers = [o for o in offers if o.ts == latest_ts]
    first = min((v[0][0] for v in data.values() if v), default=None)
    last = max((v[-1][0] for v in data.values() if v), default=None)
    return {
        "product": product_out(p, brief=True), "currency": p.currency, "labels": SERIES_LABELS, "series": data, "tracking": tracking,
        "buybox_sellers": [[int(t.timestamp() * 1000), s] for t, s in bb if not since or t >= since],
        "offers": [{"seller_id": o.seller_id, "is_fba": o.is_fba, "is_amazon": o.is_amazon, "price": o.price, "condition": o.condition, "is_buybox": o.is_buybox} for o in current_offers],
        "offers_at": latest_ts, "analytics": hist.analyse(ctx.db, pid),
        "source": {"provider": ",".join(sorted(sources)) or ("tracking" if snaps else None), "classification": "licensed" if "keepa" in sources else "user",
                   "period_from": datetime.fromtimestamp(first / 1000, timezone.utc).isoformat() if first else None,
                   "period_to": datetime.fromtimestamp(last / 1000, timezone.utc).isoformat() if last else None},
        "available": bool(data) or bool(snaps), "keepa_stats": (p.raw or {}).get("keepa_stats"),
    }


class FetchIn(BaseModel):
    product_id: int
    days: int = 365
    offers: int = 0


@router.post("/fetch")
def fetch(body: FetchIn, ctx: Ctx = Depends(need_analyst)):
    """Fetch (or re-fetch) Keepa history for a product. Costs Keepa tokens."""
    p = ctx.db.get(Product, body.product_id)
    if not p or p.org_id != ctx.org_id:
        raise HTTPException(404, "Product not found")
    m = ctx.db.get(Marketplace, p.marketplace)
    if not m.keepa_domain_id:
        raise HTTPException(400, f"Keepa does not cover Amazon {p.marketplace}.")
    k = get_provider(ctx.db, ctx.org_id, "keepa")
    res = k.products(m.keepa_domain_id, [p.asin], days=body.days if body.days > 0 else None, offers=body.offers)
    if not res.data:
        raise HTTPException(404, "Keepa has no data for this ASIN.")
    psvc.store_keepa(ctx.db, ctx.org_id, p.marketplace, res.data[0])
    psvc.derive(ctx.db, p)
    ctx.db.commit()
    return {"ok": True, "tokens_left": res.usage.get("tokens_left"), "tokens_used": res.usage.get("tokens_consumed")}


class FinderIn(BaseModel):
    marketplace: str = "UK"
    filters: dict = {}
    import_limit: int = 50


@router.post("/finder")
def finder(body: FinderIn, ctx: Ctx = Depends(need_analyst)):
    """Keepa Product Finder → import the matching products with history."""
    m = ctx.db.get(Marketplace, body.marketplace)
    if not m or not m.keepa_domain_id:
        raise HTTPException(400, f"Keepa does not cover Amazon {body.marketplace}.")
    k = get_provider(ctx.db, ctx.org_id, "keepa")
    sel = KeepaProvider.finder_selection({**body.filters, "limit": max(50, body.import_limit)})
    r = k.finder(m.keepa_domain_id, sel)
    asins = r.data["asins"][: min(body.import_limit, 100)]
    items = []
    for i in range(0, len(asins), 20):
        for d in k.products(m.keepa_domain_id, asins[i:i + 20], days=180).data:
            pr = psvc.store_keepa(ctx.db, ctx.org_id, body.marketplace, d)
            psvc.derive(ctx.db, pr)
            items.append(pr)
    ctx.db.commit()
    return {"total_matches": r.data.get("total"), "imported": len(items), "items": [product_out(x, brief=True) for x in items], "tokens_left": k.usage.get("tokens_left"),
            "selection": sel}


@router.get("/categories/search")
def categories(term: str, marketplace: str = "UK", ctx: Ctx = Depends(get_ctx)):
    m = ctx.db.get(Marketplace, marketplace)
    return get_provider(ctx.db, ctx.org_id, "keepa").category_search(m.keepa_domain_id, term).data


class BestIn(BaseModel):
    marketplace: str = "UK"
    category_id: str
    import_limit: int = 30


@router.post("/bestsellers")
def bestsellers(body: BestIn, ctx: Ctx = Depends(need_analyst)):
    m = ctx.db.get(Marketplace, body.marketplace)
    k = get_provider(ctx.db, ctx.org_id, "keepa")
    asins = k.bestsellers(m.keepa_domain_id, body.category_id).data["asins"][: min(body.import_limit, 100)]
    items = []
    for i in range(0, len(asins), 20):
        for d in k.products(m.keepa_domain_id, asins[i:i + 20], days=180).data:
            pr = psvc.store_keepa(ctx.db, ctx.org_id, body.marketplace, d)
            psvc.derive(ctx.db, pr)
            items.append(pr)
    ctx.db.commit()
    return {"imported": len(items), "items": [product_out(x, brief=True) for x in items]}
