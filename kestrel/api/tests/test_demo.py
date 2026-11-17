from sqlalchemy import select

from app import demo
from app.models import Product, Supplier


def test_demo_workspace_is_labelled_and_loginable(db, client):
    org = demo.build(db, reset=True)
    assert org.is_demo
    prods = db.scalars(select(Product).where(Product.org_id == org.id)).all()
    assert prods and all(p.classification == "demo" and p.asin.startswith("B0DEMO") for p in prods)
    sups = db.scalars(select(Supplier).where(Supplier.org_id == org.id)).all()
    assert all(s.legal_name.endswith("(Demo)") for s in sups)
    # authorisation only where brand-side evidence exists
    for s in sups:
        if s.status == "verified_authorised_distributor":
            assert any(e.supports_authorisation and e.kind in ("brand_locator", "brand_confirmation") for e in s.evidence)
    r = client.post("/api/auth/demo")
    assert r.status_code == 200 and r.json()["active_org"]["is_demo"] is True
    d = client.get("/api/dashboard", params={"marketplace": "UK"}, headers={"x-org-id": str(org.id)}).json()
    assert d["kpis"]["products_analysed"]["value"] == len(prods)
