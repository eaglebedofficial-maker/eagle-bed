from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import func, select, update

from ..db import utcnow
from ..deps import Ctx, get_ctx, need_analyst
from ..models import AlertEvent, AlertRule, Product, Quotation, RankTrack, Supplier
from ..services.alerts import evaluate_org

router = APIRouter(prefix="/alerts", tags=["alerts"])

METRICS = {
    "product": [("price", "Price"), ("bsr", "Best Sellers Rank"), ("offers", "Seller count"), ("buybox_seller", "Buy-box seller"), ("amazon_sells", "Amazon selling"),
                ("reviews", "Review count"), ("rating", "Rating"), ("available", "Availability"), ("profit", "Profit per unit"), ("margin", "Margin %")],
    "keyword_rank": [("organic_pos", "Organic position")],
    "supplier": [("status", "Verification status"), ("risk_level", "Risk level"), ("score", "Supplier score")],
    "rfq": [("status", "Quotation status")],
}
OPS = ["below", "above", "change_pct", "changes", "becomes"]


class RuleIn(BaseModel):
    name: str = Field(min_length=1, max_length=160)
    entity_type: str = Field(pattern="^(product|keyword_rank|supplier|rfq)$")
    entity_id: int
    metric: str
    op: str
    value: float | str | bool | None = None
    pct: float | None = None
    channels: list[str] = ["in_app"]


def _entity_name(ctx: Ctx, t: str, i: int):
    m = {"product": Product, "keyword_rank": RankTrack, "supplier": Supplier, "rfq": Quotation}[t]
    o = ctx.db.get(m, i)
    if not o or o.org_id != ctx.org_id:
        return None
    if t == "product":
        return o.title[:80] or o.asin
    if t == "keyword_rank":
        return f"“{o.keyword.phrase}” · {o.product.asin}"
    if t == "supplier":
        return o.trading_name or o.legal_name
    return o.product_desc


@router.get("/meta")
def meta():
    return {"metrics": METRICS, "ops": OPS}


@router.get("/rules")
def rules(ctx: Ctx = Depends(get_ctx)):
    out = []
    for r in ctx.db.scalars(select(AlertRule).where(AlertRule.org_id == ctx.org_id).order_by(AlertRule.created_at.desc())):
        n = ctx.db.scalar(select(func.count()).select_from(AlertEvent).where(AlertEvent.rule_id == r.id))
        out.append({"id": r.id, "name": r.name, "entity_type": r.entity_type, "entity_id": r.entity_id, "entity_name": _entity_name(ctx, r.entity_type, r.entity_id),
                    "condition": r.condition, "channels": r.channels, "active": r.active, "last_value": r.last_value, "events": n, "created_at": r.created_at})
    return out


@router.post("/rules")
def create_rule(body: RuleIn, ctx: Ctx = Depends(need_analyst)):
    if body.op not in OPS or body.metric not in [m for m, _ in METRICS[body.entity_type]]:
        raise HTTPException(400, "Unsupported metric or condition")
    if not _entity_name(ctx, body.entity_type, body.entity_id):
        raise HTTPException(404, "Item not found")
    r = AlertRule(org_id=ctx.org_id, name=body.name, entity_type=body.entity_type, entity_id=body.entity_id,
                  condition={"metric": body.metric, "op": body.op, "value": body.value, "pct": body.pct}, channels=body.channels)
    ctx.db.add(r)
    ctx.db.commit()
    from ..services.alerts import current_value
    v, _ = current_value(ctx.db, r)
    r.last_value = {"v": v if not hasattr(v, "isoformat") else v.isoformat(), "hit": False, "at": utcnow().isoformat()}
    ctx.db.commit()
    return {"id": r.id}


class ToggleIn(BaseModel):
    active: bool


@router.patch("/rules/{rid}")
def toggle(rid: int, body: ToggleIn, ctx: Ctx = Depends(need_analyst)):
    r = ctx.db.get(AlertRule, rid)
    if not r or r.org_id != ctx.org_id:
        raise HTTPException(404, "Rule not found")
    r.active = body.active
    ctx.db.commit()
    return {"ok": True}


@router.delete("/rules/{rid}")
def delete_rule(rid: int, ctx: Ctx = Depends(need_analyst)):
    r = ctx.db.get(AlertRule, rid)
    if r and r.org_id == ctx.org_id:
        ctx.db.delete(r)
        ctx.db.commit()
    return {"ok": True}


@router.post("/evaluate")
def evaluate_now(ctx: Ctx = Depends(need_analyst)):
    return {"fired": evaluate_org(ctx.db, ctx.org_id)}


@router.get("/events")
def events(limit: int = 50, ctx: Ctx = Depends(get_ctx)):
    rows = ctx.db.scalars(select(AlertEvent).where(AlertEvent.org_id == ctx.org_id).order_by(AlertEvent.triggered_at.desc()).limit(min(limit, 200))).all()
    unread = ctx.db.scalar(select(func.count()).select_from(AlertEvent).where(AlertEvent.org_id == ctx.org_id, AlertEvent.read_at.is_(None)))
    return {"unread": unread, "items": [{"id": e.id, "kind": e.kind, "title": e.title, "body": e.body, "payload": e.payload, "triggered_at": e.triggered_at, "read_at": e.read_at} for e in rows]}


@router.post("/events/read-all")
def read_all(ctx: Ctx = Depends(get_ctx)):
    ctx.db.execute(update(AlertEvent).where(AlertEvent.org_id == ctx.org_id, AlertEvent.read_at.is_(None)).values(read_at=utcnow()))
    ctx.db.commit()
    return {"ok": True}
