"""Profit engine: landed cost → Amazon fees → VAT → net profit, plus break-evens and scenarios.

VAT handling (UK/EU): Amazon prices are VAT-inclusive. For a VAT-registered seller, output VAT
(price × r / (1 + r)) is owed to HMRC and input VAT on costs is reclaimable (so costs are entered
net). For a non-registered seller, nothing is deducted from the price and VAT paid on costs is a
cost. Amazon fees in the UK carry VAT; registered sellers reclaim it, others don't.
"""
from __future__ import annotations

from dataclasses import asdict, dataclass, field

from sqlalchemy.orm import Session

from .fees import fba_fee, marketplace_info, referral_fee, storage_fee_per_month


@dataclass
class ProfitInput:
    marketplace: str = "UK"
    category: str = "Default"
    selling_price: float = 0.0  # as shown on Amazon (VAT-inclusive in UK/EU)
    unit_cost: float = 0.0  # supplier price per unit (net of VAT)
    supplier_shipping: float = 0.0  # per unit, supplier to port/warehouse
    freight: float = 0.0  # per unit, international freight
    duty_rate: float = 0.0  # % of customs value (cost + freight)
    import_vat_rate: float | None = None  # defaults to marketplace VAT rate
    prep: float = 0.0
    labelling: float = 0.0
    packaging: float = 0.0
    inbound_to_amazon: float = 0.0
    fulfilment: str = "FBA"  # FBA | FBM
    fbm_shipping: float = 0.0
    weight_g: float | None = None
    length_cm: float | None = None
    width_cm: float | None = None
    height_cm: float | None = None
    fba_fee_override: float | None = None
    referral_fee_override: float | None = None
    storage_months: float = 1.5
    removal_rate: float = 0.0  # % of units that end up removed
    removal_fee: float = 0.0
    ad_spend_pct: float = 0.0  # ACoS on all sales (TACoS)
    returns_pct: float = 0.0
    returns_recoverable_pct: float = 50.0  # share of returned units resaleable
    other_costs: float = 0.0
    vat_registered: bool = True
    vat_rate: float | None = None  # defaults to marketplace rate
    fees_vatable: bool = True
    monthly_units: float = 0.0
    order_quantity: float = 0.0


@dataclass
class ProfitOutput:
    currency: str
    gross_revenue: float
    output_vat: float
    net_revenue: float
    referral_fee: float
    referral_rule: str
    fba_fee: float | None
    size_tier: str
    storage_fee: float
    removal_cost: float
    fee_vat: float
    total_amazon_fees: float
    landed_cost: float
    landed_breakdown: dict
    advertising: float
    returns_cost: float
    other_costs: float
    net_profit: float
    margin_pct: float
    roi_pct: float
    break_even_price: float | None
    break_even_acos_pct: float | None
    max_unit_cost: float | None
    monthly_profit: float | None
    monthly_revenue: float | None
    cash_required: float | None
    months_to_recoup: float | None
    warnings: list = field(default_factory=list)
    fee_sources: list = field(default_factory=list)


def calculate(db: Session, inp: ProfitInput, org_id: int | None = None) -> ProfitOutput:
    m = marketplace_info(db, inp.marketplace)
    vat_rate = (inp.vat_rate if inp.vat_rate is not None else m.vat_rate) / 100.0
    import_vat_rate = (inp.import_vat_rate if inp.import_vat_rate is not None else m.vat_rate) / 100.0
    warnings: list[str] = []
    price = max(inp.selling_price, 0)

    output_vat = price * vat_rate / (1 + vat_rate) if inp.vat_registered and vat_rate else 0.0
    net_revenue = price - output_vat

    # landed cost
    customs_value = inp.unit_cost + inp.supplier_shipping + inp.freight
    duty = customs_value * inp.duty_rate / 100.0
    import_vat = (customs_value + duty) * import_vat_rate
    import_vat_cost = 0.0 if inp.vat_registered else import_vat
    landed = inp.unit_cost + inp.supplier_shipping + inp.freight + duty + import_vat_cost + inp.prep + inp.labelling + inp.packaging + inp.inbound_to_amazon
    landed_breakdown = {"unit_cost": inp.unit_cost, "supplier_shipping": inp.supplier_shipping, "freight": inp.freight, "duty": round(duty, 4),
                        "import_vat_unrecovered": round(import_vat_cost, 4), "import_vat_paid": round(import_vat, 4), "prep": inp.prep,
                        "labelling": inp.labelling, "packaging": inp.packaging, "inbound_to_amazon": inp.inbound_to_amazon}

    # fees
    sources = []
    if inp.referral_fee_override is not None:
        ref, rule = inp.referral_fee_override, "Manual override"
    else:
        ref, _, rule = referral_fee(db, inp.marketplace, inp.category, price, org_id)
        sources.append({"fee": "referral", "rule": rule})
    tier = "Merchant fulfilled"
    fba = None
    if inp.fulfilment == "FBA":
        if inp.fba_fee_override is not None:
            fba, tier = inp.fba_fee_override, "Manual override"
        else:
            r = fba_fee(db, inp.marketplace, weight_g=inp.weight_g, l=inp.length_cm, w=inp.width_cm, h=inp.height_cm, price=price, org_id=org_id)
            fba, tier = r.fee, r.tier
            sources.append({"fee": "fba", "tier": r.tier, "source_url": r.source_url, "shipping_weight_g": round(r.shipping_weight_g), "dim_weight_g": round(r.dim_weight_g)})
            if fba is None:
                warnings.append("FBA fee unknown — add weight and dimensions, or enter the fee manually.")
        oversize = "oversize" in tier.lower() or "bulky" in tier.lower() or "extra-large" in tier.lower()
        storage = storage_fee_per_month(db, inp.marketplace, l=inp.length_cm, w=inp.width_cm, h=inp.height_cm, oversize=oversize, org_id=org_id) * inp.storage_months
    else:
        storage = 0.0
    fulfil = (fba or 0.0) if inp.fulfilment == "FBA" else inp.fbm_shipping
    removal = inp.removal_rate / 100.0 * inp.removal_fee
    fees_ex = ref + (fba or 0.0 if inp.fulfilment == "FBA" else 0.0) + storage + removal
    fee_vat = fees_ex * vat_rate if (inp.fees_vatable and vat_rate and not inp.vat_registered and inp.marketplace in ("UK", "DE", "FR", "IT", "ES", "NL")) else 0.0
    total_fees = fees_ex + fee_vat + (inp.fbm_shipping if inp.fulfilment == "FBM" else 0.0)

    ads = price * inp.ad_spend_pct / 100.0
    # A return loses the unrecoverable share of stock plus Amazon's refund administration fee (20% of the referral fee).
    returns_cost = (inp.returns_pct / 100.0) * (landed * (1 - inp.returns_recoverable_pct / 100.0) + ref * 0.2)
    other = inp.other_costs
    net = net_revenue - total_fees - landed - ads - returns_cost - other
    margin = net / price * 100 if price else 0.0
    roi = net / landed * 100 if landed else 0.0

    # break-even price: solve net(p) = 0 numerically (referral fees are piecewise)
    def net_at(p: float) -> float:
        return calculate_light(db, inp, p, landed, vat_rate, org_id, fba, storage, removal)
    be_price = _solve(net_at, 0.01, max(price * 5, landed * 10 + 50)) if landed or fba else None
    # break-even ACoS: ad % at which net = 0
    pre_ad = net + ads
    be_acos = pre_ad / price * 100 if price else None
    # maximum unit cost for net = 0 at current price (landed moves 1:1 with unit cost, plus duty and unrecovered VAT)
    cost_mult = (1 + inp.duty_rate / 100.0) * (1 + (0 if inp.vat_registered else import_vat_rate))
    max_cost = inp.unit_cost + net / cost_mult if cost_mult else None
    if inp.vat_registered and vat_rate:
        warnings.append(f"Assumes VAT registration: {vat_rate * 100:g}% output VAT removed from the price and import VAT reclaimed.")
    monthly = net * inp.monthly_units if inp.monthly_units else None
    cash = landed * (inp.order_quantity or inp.monthly_units * 3) if (inp.order_quantity or inp.monthly_units) else None
    recoup = (cash / monthly) if cash and monthly and monthly > 0 else None
    return ProfitOutput(
        currency=m.currency, gross_revenue=round(price, 2), output_vat=round(output_vat, 2), net_revenue=round(net_revenue, 2),
        referral_fee=round(ref, 2), referral_rule=rule, fba_fee=None if fba is None else round(fba, 2), size_tier=tier, storage_fee=round(storage, 2),
        removal_cost=round(removal, 2), fee_vat=round(fee_vat, 2), total_amazon_fees=round(total_fees, 2), landed_cost=round(landed, 2),
        landed_breakdown=landed_breakdown, advertising=round(ads, 2), returns_cost=round(returns_cost, 2), other_costs=round(other, 2),
        net_profit=round(net, 2), margin_pct=round(margin, 2), roi_pct=round(roi, 2), break_even_price=None if be_price is None else round(be_price, 2),
        break_even_acos_pct=None if be_acos is None else round(be_acos, 2), max_unit_cost=None if max_cost is None else round(max_cost, 2),
        monthly_profit=None if monthly is None else round(monthly, 2), monthly_revenue=round(price * inp.monthly_units, 2) if inp.monthly_units else None,
        cash_required=None if cash is None else round(cash, 2), months_to_recoup=None if recoup is None else round(recoup, 1), warnings=warnings, fee_sources=sources)


def calculate_light(db, inp: ProfitInput, p: float, landed: float, vat_rate: float, org_id, fba, storage, removal) -> float:
    out_vat = p * vat_rate / (1 + vat_rate) if inp.vat_registered and vat_rate else 0.0
    if inp.referral_fee_override is not None:
        ref = inp.referral_fee_override
    else:
        ref, _, _ = referral_fee(db, inp.marketplace, inp.category, p, org_id)
    fulfil = (fba or 0.0) if inp.fulfilment == "FBA" else inp.fbm_shipping
    fees = ref + fulfil + storage + removal
    if inp.fees_vatable and vat_rate and not inp.vat_registered and inp.marketplace in ("UK", "DE", "FR", "IT", "ES", "NL"):
        fees += (fees - (inp.fbm_shipping if inp.fulfilment == "FBM" else 0)) * vat_rate
    ads = p * inp.ad_spend_pct / 100.0
    returns_cost = (inp.returns_pct / 100.0) * (landed * (1 - inp.returns_recoverable_pct / 100.0) + ref * 0.2)
    return p - out_vat - fees - landed - ads - returns_cost - inp.other_costs


def _solve(f, lo, hi, iters=60):
    if f(hi) < 0:
        return None
    if f(lo) >= 0:
        return lo
    for _ in range(iters):
        mid = (lo + hi) / 2
        if f(mid) >= 0:
            hi = mid
        else:
            lo = mid
    return hi


def scenarios(db: Session, inp: ProfitInput, org_id=None) -> dict:
    """Conservative / expected / best case around the user's inputs."""
    from dataclasses import replace
    cons = replace(inp, selling_price=inp.selling_price * 0.92, unit_cost=inp.unit_cost * 1.05, ad_spend_pct=inp.ad_spend_pct + 6,
                   returns_pct=inp.returns_pct + 2, monthly_units=inp.monthly_units * 0.6)
    best = replace(inp, selling_price=inp.selling_price * 1.04, ad_spend_pct=max(0, inp.ad_spend_pct - 4), monthly_units=inp.monthly_units * 1.3)
    return {k: asdict(calculate(db, v, org_id)) for k, v in (("conservative", cons), ("expected", inp), ("best", best))} | {
        "assumptions": {"conservative": "Price −8%, unit cost +5%, ACoS +6 pts, returns +2 pts, units −40%", "best": "Price +4%, ACoS −4 pts, units +30%"}}
