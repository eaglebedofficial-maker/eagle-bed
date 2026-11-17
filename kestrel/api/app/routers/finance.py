"""Profit / FBA / VAT calculators, fee database, saved calculations, duty and FX lookups."""
from dataclasses import asdict, fields
from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import or_, select

from ..audit import audit_ctx
from ..deps import Ctx, get_ctx, need_analyst, require
from ..models import FeeSchedule, Marketplace, Product, ProfitCalculation, ReferralRule
from ..providers import get_provider
from ..services.fees import fba_fee, referral_fee, storage_fee_per_month
from ..services.profit import ProfitInput, calculate, scenarios

router = APIRouter(tags=["finance"])
INPUT_FIELDS = {f.name for f in fields(ProfitInput)}


def _input(d: dict, ctx: Ctx) -> ProfitInput:
    clean = {k: v for k, v in d.items() if k in INPUT_FIELDS and v is not None}
    clean.setdefault("vat_registered", ctx.org.vat_registered)
    if not ctx.db.get(Marketplace, clean.get("marketplace", "UK")):
        raise HTTPException(400, "Unknown marketplace")
    return ProfitInput(**clean)


@router.post("/profit/calculate")
def profit_calc(body: dict, ctx: Ctx = Depends(get_ctx)):
    inp = _input(body, ctx)
    out = asdict(calculate(ctx.db, inp, ctx.org_id))
    out["input"] = asdict(inp)
    if body.get("with_scenarios"):
        out["scenarios"] = scenarios(ctx.db, inp, ctx.org_id)
    return out


class SaveCalcIn(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    product_id: int | None = None
    inputs: dict


@router.post("/profit/saved")
def save_calc(body: SaveCalcIn, ctx: Ctx = Depends(need_analyst)):
    inp = _input(body.inputs, ctx)
    out = asdict(calculate(ctx.db, inp, ctx.org_id))
    c = ProfitCalculation(org_id=ctx.org_id, product_id=body.product_id, name=body.name, inputs=asdict(inp), outputs=out, fee_version=date.today().isoformat())
    ctx.db.add(c)
    if body.product_id:
        p = ctx.db.get(Product, body.product_id)
        if p and p.org_id == ctx.org_id:
            p.unit_cost = inp.unit_cost
            from ..services.products import derive
            derive(ctx.db, p)
    ctx.db.commit()
    return {"id": c.id}


@router.get("/profit/saved")
def list_calcs(ctx: Ctx = Depends(get_ctx)):
    rows = ctx.db.scalars(select(ProfitCalculation).where(ProfitCalculation.org_id == ctx.org_id).order_by(ProfitCalculation.created_at.desc()).limit(100)).all()
    return [{"id": c.id, "name": c.name, "product_id": c.product_id, "inputs": c.inputs, "net_profit": c.outputs.get("net_profit"), "margin_pct": c.outputs.get("margin_pct"),
             "roi_pct": c.outputs.get("roi_pct"), "currency": c.outputs.get("currency"), "created_at": c.created_at} for c in rows]


@router.delete("/profit/saved/{cid}")
def del_calc(cid: int, ctx: Ctx = Depends(need_analyst)):
    c = ctx.db.get(ProfitCalculation, cid)
    if c and c.org_id == ctx.org_id:
        ctx.db.delete(c)
        ctx.db.commit()
    return {"ok": True}


class FbaIn(BaseModel):
    marketplace: str = "UK"
    weight_g: float | None = None
    length_cm: float | None = None
    width_cm: float | None = None
    height_cm: float | None = None
    price: float | None = None
    category: str = "Default"


@router.post("/fba/calculate")
def fba_calc(body: FbaIn, ctx: Ctx = Depends(get_ctx)):
    r = fba_fee(ctx.db, body.marketplace, weight_g=body.weight_g, l=body.length_cm, w=body.width_cm, h=body.height_cm, price=body.price, org_id=ctx.org_id)
    oversize = any(x in r.tier.lower() for x in ("oversize", "bulky", "extra-large"))
    st = storage_fee_per_month(ctx.db, body.marketplace, l=body.length_cm, w=body.width_cm, h=body.height_cm, oversize=oversize, org_id=ctx.org_id)
    st_peak = storage_fee_per_month(ctx.db, body.marketplace, l=body.length_cm, w=body.width_cm, h=body.height_cm, oversize=oversize, month=11, org_id=ctx.org_id)
    st_off = storage_fee_per_month(ctx.db, body.marketplace, l=body.length_cm, w=body.width_cm, h=body.height_cm, oversize=oversize, month=3, org_id=ctx.org_id)
    ref = referral_fee(ctx.db, body.marketplace, body.category, body.price or 0, ctx.org_id) if body.price else (0, 0, "")
    m = ctx.db.get(Marketplace, body.marketplace)
    return {"currency": m.currency, "fba_fee": r.fee, "size_tier": r.tier, "shipping_weight_g": round(r.shipping_weight_g), "dimensional_weight_g": round(r.dim_weight_g),
            "unit_weight_g": body.weight_g, "storage_month_now": round(st, 3), "storage_month_offpeak": round(st_off, 3), "storage_month_peak": round(st_peak, 3),
            "referral_fee": ref[0], "referral_rule": ref[2], "source_url": r.source_url, "note": r.note,
            "classification": "estimated", "basis": "Your fee database (effective-dated). Connect SP-API for Amazon's exact per-ASIN fee estimate."}


class VatIn(BaseModel):
    amount: float
    rate: float = 20.0
    mode: str = Field("inclusive", pattern="^(inclusive|exclusive)$")


@router.post("/vat/calculate")
def vat_calc(body: VatIn):
    r = body.rate / 100
    if body.mode == "inclusive":
        net = body.amount / (1 + r)
        return {"gross": round(body.amount, 2), "net": round(net, 2), "vat": round(body.amount - net, 2), "rate": body.rate}
    return {"gross": round(body.amount * (1 + r), 2), "net": round(body.amount, 2), "vat": round(body.amount * r, 2), "rate": body.rate}


# ---------------------------------------------------------------- fee database
def fee_out(f: FeeSchedule):
    return {"id": f.id, "marketplace": f.marketplace, "fee_type": f.fee_type, "size_tier": f.size_tier, "max_length_cm": f.max_length_cm, "max_width_cm": f.max_width_cm,
            "max_height_cm": f.max_height_cm, "weight_from_g": f.weight_from_g, "weight_to_g": f.weight_to_g, "amount": f.amount, "per_kg_over": f.per_kg_over, "unit": f.unit,
            "season": f.season, "effective_from": f.effective_from, "effective_to": f.effective_to, "source_url": f.source_url, "notes": f.notes, "is_custom": f.org_id is not None}


@router.get("/fees")
def list_fees(marketplace: str = "UK", fee_type: str | None = None, ctx: Ctx = Depends(get_ctx)):
    q = select(FeeSchedule).where(FeeSchedule.marketplace == marketplace, or_(FeeSchedule.org_id.is_(None), FeeSchedule.org_id == ctx.org_id))
    if fee_type:
        q = q.where(FeeSchedule.fee_type == fee_type)
    fees = ctx.db.scalars(q.order_by(FeeSchedule.fee_type, FeeSchedule.id)).all()
    refs = ctx.db.scalars(select(ReferralRule).where(ReferralRule.marketplace == marketplace, or_(ReferralRule.org_id.is_(None), ReferralRule.org_id == ctx.org_id)).order_by(ReferralRule.category)).all()
    return {"fees": [fee_out(f) for f in fees],
            "referral": [{"id": r.id, "category": r.category, "rate": r.rate, "threshold": r.threshold, "rate_above": r.rate_above, "tiered_whole_price": r.tiered_whole_price,
                          "min_fee": r.min_fee, "effective_from": r.effective_from, "effective_to": r.effective_to, "source_url": r.source_url, "is_custom": r.org_id is not None} for r in refs]}


class FeeIn(BaseModel):
    marketplace: str
    fee_type: str = "fba"
    size_tier: str
    max_length_cm: float | None = None
    max_width_cm: float | None = None
    max_height_cm: float | None = None
    weight_from_g: float = 0
    weight_to_g: float | None = None
    amount: float
    per_kg_over: float = 0
    unit: str = "per_unit"
    season: str = "all"
    effective_from: date
    effective_to: date | None = None
    source_url: str = ""
    notes: str = ""


@router.post("/fees")
def add_fee(body: FeeIn, ctx: Ctx = Depends(require("admin"))):
    f = FeeSchedule(org_id=ctx.org_id, **body.model_dump())
    ctx.db.add(f)
    audit_ctx(ctx, "fees.added", "fee_schedule", "", body.model_dump(mode="json"))
    ctx.db.commit()
    return fee_out(f)


@router.put("/fees/{fid}")
def edit_fee(fid: int, body: FeeIn, ctx: Ctx = Depends(require("admin"))):
    f = ctx.db.get(FeeSchedule, fid)
    if not f:
        raise HTTPException(404, "Fee row not found")
    if f.org_id is None:
        # editing a platform row creates an org override and retires nothing globally
        f = FeeSchedule(org_id=ctx.org_id, **body.model_dump())
        ctx.db.add(f)
    elif f.org_id != ctx.org_id:
        raise HTTPException(404, "Fee row not found")
    else:
        for k, v in body.model_dump().items():
            setattr(f, k, v)
    audit_ctx(ctx, "fees.edited", "fee_schedule", fid, body.model_dump(mode="json"))
    ctx.db.commit()
    return fee_out(f)


@router.delete("/fees/{fid}")
def delete_fee(fid: int, ctx: Ctx = Depends(require("admin"))):
    f = ctx.db.get(FeeSchedule, fid)
    if not f or f.org_id != ctx.org_id:
        raise HTTPException(400, "Only your organisation's custom rows can be deleted.")
    ctx.db.delete(f)
    audit_ctx(ctx, "fees.deleted", "fee_schedule", fid)
    ctx.db.commit()
    return {"ok": True}


class RefIn(BaseModel):
    marketplace: str
    category: str
    rate: float = Field(ge=0, le=1)
    threshold: float | None = None
    rate_above: float | None = None
    tiered_whole_price: bool = False
    min_fee: float = 0.25
    effective_from: date
    source_url: str = ""


@router.post("/fees/referral")
def add_referral(body: RefIn, ctx: Ctx = Depends(require("admin"))):
    r = ReferralRule(org_id=ctx.org_id, **body.model_dump())
    ctx.db.add(r)
    audit_ctx(ctx, "fees.referral_added", "referral_rule", "", body.model_dump(mode="json"))
    ctx.db.commit()
    return {"id": r.id}


# ---------------------------------------------------------------- duty & FX
@router.get("/tariff/search")
def tariff_search(q: str, ctx: Ctx = Depends(get_ctx)):
    r = get_provider(ctx.db, ctx.org_id, "trade_tariff").search(q)
    return {"results": r.data, "source": r.provenance.dict()}


@router.get("/tariff/{code}")
def tariff_commodity(code: str, ctx: Ctx = Depends(get_ctx)):
    r = get_provider(ctx.db, ctx.org_id, "trade_tariff").commodity(code)
    return {**r.data, "source": r.provenance.dict()}


@router.get("/fx")
def fx(base: str = "GBP", ctx: Ctx = Depends(get_ctx)):
    r = get_provider(ctx.db, ctx.org_id, "fx").rates(base)
    return {**r.data, "source": r.provenance.dict()}
