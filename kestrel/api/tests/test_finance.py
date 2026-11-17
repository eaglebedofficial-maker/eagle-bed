from app.services.fees import fba_fee, referral_fee
from app.services.profit import ProfitInput, calculate


def test_uk_fba_tiers(db):
    r = fba_fee(db, "UK", weight_g=400, l=25, w=15, h=5)
    assert r.tier == "Extra-large envelope" and r.fee == 3.08
    big = fba_fee(db, "UK", weight_g=42000, l=190, w=135, h=30)
    assert big.tier == "Special oversize" and big.fee > 16
    none = fba_fee(db, "UK", weight_g=None, l=None, w=None, h=None)
    assert none.fee is None


def test_referral_tiers(db):
    fee, rate, rule = referral_fee(db, "US", "Furniture", 300)
    assert fee == round(200 * 0.15 + 100 * 0.10, 2)
    fee2, _, _ = referral_fee(db, "UK", "Beauty", 8)
    assert fee2 == round(8 * 0.08, 2)


def test_profit_vat_registered_vs_not(db):
    base = dict(marketplace="UK", category="Home & Kitchen", selling_price=24.0, unit_cost=5.0, freight=1.0, duty_rate=4, weight_g=400, length_cm=25, width_cm=15, height_cm=5)
    reg = calculate(db, ProfitInput(**base, vat_registered=True))
    non = calculate(db, ProfitInput(**base, vat_registered=False))
    assert reg.output_vat == 4.0 and non.output_vat == 0
    assert non.landed_cost > reg.landed_cost  # import VAT is a cost when not registered
    assert non.fee_vat > 0 and reg.fee_vat == 0
    # break-even price gives ~zero profit
    be = calculate(db, ProfitInput(**{**base, "selling_price": reg.break_even_price}, vat_registered=True))
    assert abs(be.net_profit) < 0.05
    # max unit cost gives ~zero profit at the current price
    mx = calculate(db, ProfitInput(**{**base, "unit_cost": reg.max_unit_cost}, vat_registered=True))
    assert abs(mx.net_profit) < 0.05


def test_profit_api_and_scenarios(authed):
    r = authed.post("/api/profit/calculate", json={"marketplace": "UK", "selling_price": 30, "unit_cost": 6, "weight_g": 500, "length_cm": 20, "width_cm": 15, "height_cm": 8, "monthly_units": 200, "with_scenarios": True})
    assert r.status_code == 200
    j = r.json()
    assert j["scenarios"]["conservative"]["net_profit"] < j["scenarios"]["best"]["net_profit"]
    assert abs(j["monthly_profit"] - j["net_profit"] * 200) < 2


def test_fee_override_is_org_scoped(authed, client):
    fees = authed.get("/api/fees", params={"marketplace": "UK", "fee_type": "fba"}).json()["fees"]
    row = fees[0]
    body = {k: row[k] for k in ("marketplace", "fee_type", "size_tier", "max_length_cm", "max_width_cm", "max_height_cm", "weight_from_g", "weight_to_g", "per_kg_over", "unit", "season", "effective_from")}
    body["amount"] = 9.99
    assert authed.put(f"/api/fees/{row['id']}", json=body).status_code == 200
    mine = authed.get("/api/fees", params={"marketplace": "UK", "fee_type": "fba"}).json()["fees"]
    assert any(f["is_custom"] and f["amount"] == 9.99 for f in mine)
    from tests.conftest import register
    register(client, "Other")
    theirs = client.get("/api/fees", params={"marketplace": "UK", "fee_type": "fba"}).json()["fees"]
    assert not any(f["is_custom"] for f in theirs)
