"""Fee lookup from the editable fee database (effective-dated, org overrides take precedence)."""
from __future__ import annotations

from dataclasses import dataclass
from datetime import date

from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from ..models import FeeSchedule, Marketplace, ReferralRule

DIM_DIVISOR = 5000  # cm³ per kg (Amazon EU 5000; US 139 in³/lb ≈ 5022 cm³/kg)


@dataclass
class FbaResult:
    fee: float | None
    tier: str
    shipping_weight_g: float
    dim_weight_g: float
    rule_id: int | None
    source_url: str
    note: str = ""


def _active(q, model, org_id: int | None, on: date):
    q = q.where(model.effective_from <= on, or_(model.effective_to.is_(None), model.effective_to >= on))
    return q.where(or_(model.org_id.is_(None), model.org_id == org_id)) if org_id else q.where(model.org_id.is_(None))


def fba_fee(db: Session, marketplace: str, *, weight_g: float | None, l: float | None, w: float | None, h: float | None,
            price: float | None = None, org_id: int | None = None, on: date | None = None) -> FbaResult:
    on = on or date.today()
    if not weight_g and not (l and w and h):
        return FbaResult(None, "Unknown — add weight and dimensions", 0, 0, None, "", "missing_dimensions")
    dims = sorted([x or 0 for x in (l, w, h)], reverse=True)
    rows = db.scalars(_active(select(FeeSchedule).where(FeeSchedule.marketplace == marketplace, FeeSchedule.fee_type == "fba"), FeeSchedule, org_id, on)
                      .order_by(FeeSchedule.org_id.is_(None), FeeSchedule.id)).all()
    if not rows:
        return FbaResult(None, "No fee schedule for this marketplace", 0, 0, None, "", "no_schedule")
    # org overrides replace platform rows of the same tier
    org_tiers = {r.size_tier for r in rows if r.org_id}
    rows = [r for r in rows if r.org_id or r.size_tier not in org_tiers]
    tiers: list[str] = []
    for r in rows:
        if r.size_tier not in tiers:
            tiers.append(r.size_tier)
    dimw = (dims[0] * dims[1] * dims[2]) / DIM_DIVISOR * 1000 if all(dims) else 0
    unit_w = weight_g or 0
    for tier in tiers:
        tr = [r for r in rows if r.size_tier == tier]
        t0 = tr[0]
        if t0.max_length_cm is not None and all(dims):
            if dims[0] > t0.max_length_cm or dims[1] > (t0.max_width_cm or 1e9) or dims[2] > (t0.max_height_cm or 1e9):
                continue
        envelope = "envelope" in tier.lower() or tier.lower().startswith("small standard")
        ship_w = unit_w if envelope or tier.lower().startswith("special") or tier.lower().startswith("extra-large") and marketplace not in ("US", "CA") else max(unit_w, dimw)
        last_cap = max((r.weight_to_g or 0) for r in tr)
        for r in sorted(tr, key=lambda r: r.weight_from_g):
            cap = r.weight_to_g
            if cap is None or ship_w <= cap:
                fee = r.amount
                if cap is None and r.per_kg_over and ship_w > r.weight_from_g:
                    fee += -(-(ship_w - r.weight_from_g) // 1000) * r.per_kg_over
                if price is not None and marketplace == "US" and price < 10:
                    fee -= 0.77  # low-price FBA rate
                return FbaResult(round(max(fee, 0), 2), tier, ship_w, dimw, r.id, r.source_url)
        if ship_w > last_cap:
            continue
    return FbaResult(None, "Outside seeded tiers — check Amazon's rate card", unit_w, dimw, None, "", "no_tier")


def storage_fee_per_month(db: Session, marketplace: str, *, l, w, h, oversize: bool, month: int | None = None, org_id: int | None = None) -> float:
    if not (l and w and h):
        return 0.0
    month = month or date.today().month
    season = "peak" if month >= 10 else "offpeak"
    tier = "Oversize" if oversize else "Standard"
    row = db.scalars(_active(select(FeeSchedule).where(FeeSchedule.marketplace == marketplace, FeeSchedule.fee_type == "storage",
                                                       FeeSchedule.size_tier == tier, FeeSchedule.season == season), FeeSchedule, org_id, date.today())
                     .order_by(FeeSchedule.org_id.is_(None))).first()
    if not row:
        return 0.0
    cuft = (l * w * h) / 28316.8
    return round(cuft * row.amount, 4)


def referral_fee(db: Session, marketplace: str, category: str, price: float, org_id: int | None = None) -> tuple[float, float, str]:
    """Returns (fee, effective_rate, rule_label)."""
    if not price:
        return 0.0, 0.0, ""
    rules = db.scalars(_active(select(ReferralRule).where(ReferralRule.marketplace == marketplace), ReferralRule, org_id, date.today())
                       .order_by(ReferralRule.org_id.is_(None))).all()
    by = {r.category.lower(): r for r in rules}
    cat = (category or "").lower()
    rule = by.get(cat) or next((r for k, r in by.items() if k != "default" and (k in cat or cat in k) and cat), None) or by.get("default")
    if not rule:
        return round(price * 0.15, 2), 0.15, "Default 15% (no rule found)"
    if rule.threshold and rule.rate_above is not None:
        if rule.tiered_whole_price:
            rate = rule.rate if price <= rule.threshold else rule.rate_above
            fee = price * rate
        else:
            fee = min(price, rule.threshold) * rule.rate + max(0, price - rule.threshold) * rule.rate_above
    else:
        fee = price * rule.rate
    fee = max(fee, rule.min_fee)
    return round(fee, 2), fee / price, f"{rule.category} ({rule.rate * 100:.0f}%{f' / {rule.rate_above * 100:.0f}% above {rule.threshold:g}' if rule.threshold else ''})"


def marketplace_info(db: Session, code: str) -> Marketplace:
    m = db.get(Marketplace, code)
    if not m:
        raise ValueError(f"Unknown marketplace {code}")
    return m
