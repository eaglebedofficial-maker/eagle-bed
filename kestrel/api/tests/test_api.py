"""API flows: auth, RBAC, org isolation, products, suppliers, invoices, providers, alerts, reports."""
import io
import json

import httpx

from app import providers
from tests.conftest import register

EXT = {"source": "product-pilot-extension", "v": 2, "mkt": "UK", "items": [
    {"asin": "B0TEST0001", "title": "Grey Velvet Divan Bed Double", "brand": "DreamCo", "price": 249.99, "bsr": 1523, "rankCategory": "Home & Kitchen", "bought": 200, "reviews": 1284, "rating": 4.3, "offers": 3, "weightKg": 42, "dims": {"l": 190, "w": 135, "h": 30}},
    {"asin": "B0TEST0007", "title": "Bamboo Bath Mat", "brand": "Bambu", "price": 24.99, "bsr": 2100, "rankCategory": "Home & Kitchen", "bought": 300, "reviews": 140, "rating": 4.2, "offers": 4, "weightKg": 0.9, "dims": {"l": 60, "w": 40, "h": 3}}]}


def test_auth_cycle(client):
    email, _ = register(client)
    assert client.get("/api/auth/me").status_code == 200
    assert client.post("/api/auth/refresh").status_code == 200
    client.post("/api/auth/logout")
    client.cookies.clear()
    assert client.get("/api/auth/me").status_code == 401
    assert client.post("/api/auth/login", json={"email": email, "password": "wrong-password-x"}).status_code == 401
    assert client.post("/api/auth/login", json={"email": email, "password": "correct-horse-1"}).status_code == 200


def test_refresh_token_reuse_revokes_sessions(client):
    register(client)
    old = client.cookies.get("k_refresh")
    assert client.post("/api/auth/refresh").status_code == 200
    client.cookies.set("k_refresh", old, path="/api/auth")
    assert client.post("/api/auth/refresh").status_code == 401


def test_org_isolation_and_viewer_role(authed, client):
    r = authed.post("/api/products/import", data={"text": json.dumps(EXT)})
    assert r.status_code == 200 and r.json()["imported"] == 2
    pid = r.json()["items"][0]["id"]
    register(client, "Rival Ltd")
    assert client.get(f"/api/products/{pid}").status_code == 404
    assert client.post("/api/products/query", json={"filters": {}}).json()["total"] == 0
    # viewer cannot write
    authed.post("/api/org/members", json={"email": "viewer@example.com", "role": "viewer", "temporary_password": "temporary-pass-1"})
    v = providers  # noqa
    from fastapi.testclient import TestClient
    from app.main import app
    vc = TestClient(app)
    assert vc.post("/api/auth/login", json={"email": "viewer@example.com", "password": "temporary-pass-1"}).status_code == 200
    assert vc.get(f"/api/products/{pid}").status_code == 200
    assert vc.patch(f"/api/products/{pid}", json={"unit_cost": 1}).status_code == 403
    assert vc.put("/api/integrations/keepa", json={"values": {"api_key": "x"}}).status_code == 403


def test_products_filters_scoring_export(authed):
    authed.post("/api/products/import", data={"text": json.dumps(EXT)})
    q = authed.post("/api/products/query", json={"filters": {"price_max": 100}, "sort": "price", "dir": "asc"}).json()
    assert q["total"] == 1 and q["items"][0]["asin"] == "B0TEST0007"
    item = q["items"][0]
    assert item["units"] and item["revenue"] and item["score"] is not None and item["cost_assumed"] is True
    d = authed.get(f"/api/products/{item['id']}").json()
    assert "summary" in d["score_components"] and d["history_summary"]["available"] is False
    p = authed.patch(f"/api/products/{item['id']}", json={"unit_cost": 4.5}).json()
    assert p["unit_cost"] == 4.5 and p["cost_assumed"] is False
    x = authed.get("/api/products/export", params={"format": "csv"})
    assert x.status_code == 200 and b"B0TEST0007" in x.content and b"estimates" in x.content


def test_research_without_providers_is_honest(authed):
    r = authed.post("/api/research", json={"q": "https://www.amazon.co.uk/x/dp/B0ABCDEF12", "marketplace": "UK"}).json()
    assert r["query"]["type"] == "asin" and r["results"][0]["asin"] == "B0ABCDEF12"
    assert any("No product data source" in n["error"] for n in r["notes"])
    k = authed.post("/api/keywords/research", json={"seed": "divan bed"})
    assert k.status_code == 424 and k.json()["error"]["code"] == "not_configured"


def test_keepa_history_with_mocked_provider(authed):
    from datetime import datetime, timezone
    from app.providers.keepa import to_keepa_minutes
    t0 = to_keepa_minutes(datetime(2026, 1, 1, tzinfo=timezone.utc))
    csv = [None] * 19
    csv[1] = sum(([t0 + i * 14400, 2500 + (i % 3) * 50] for i in range(30)), [])
    csv[3] = sum(([t0 + i * 14400, 2000 + i * 20] for i in range(30)), [])
    prod = {"asin": "B0TEST0001", "title": "Grey Velvet Divan Bed", "csv": csv, "stats": {"current": [-1, 2600, -1, 2580, -1, -1, -1, -1, -1, -1, -1, 2] + [-1] * 7, "salesRankDrops30": 25},
            "buyBoxSellerIdHistory": [str(t0), "A1", str(t0 + 100000), "A2"]}

    def handler(req: httpx.Request):
        if req.url.path == "/token":
            return httpx.Response(200, json={"tokensLeft": 99, "refillRate": 5})
        return httpx.Response(200, json={"products": [prod], "tokensLeft": 80, "tokensConsumed": 2})
    providers.TRANSPORTS["keepa"] = httpx.MockTransport(handler)
    try:
        assert authed.put("/api/integrations/keepa", json={"values": {"api_key": "k" * 64}}).status_code == 200
        assert authed.post("/api/integrations/keepa/test").json()["ok"] is True
        authed.post("/api/products/import", data={"text": json.dumps(EXT)})
        pid = authed.post("/api/products/query", json={"filters": {"q": "B0TEST0001"}}).json()["items"][0]["id"]
        r = authed.post("/api/history/fetch", json={"product_id": pid, "days": 0})
        assert r.status_code == 200, r.text
        h = authed.get(f"/api/history/{pid}", params={"days": 0}).json()
        assert h["available"] and len(h["series"]["rank"]) == 30 and h["source"]["provider"] == "keepa"
        a = h["analytics"]
        assert a["available"] and a["windows"]["365"]["rank"]["points"] >= 30 and "buybox" in a
    finally:
        providers.TRANSPORTS.pop("keepa", None)


def test_supplier_verification_with_mocked_registry(authed):
    def ch(req: httpx.Request):
        if req.url.path.startswith("/search/companies"):
            return httpx.Response(200, json={"items": [{"company_number": "01234567", "title": "ACME BEDS LIMITED", "company_status": "active", "address_snippet": "1 High St, Leeds", "date_of_creation": "2012-03-01"}]})
        if req.url.path.endswith("/officers"):
            return httpx.Response(200, json={"items": [{"name": "SMITH, Jane", "officer_role": "director", "appointed_on": "2012-03-01"}]})
        return httpx.Response(200, json={"company_number": "01234567", "company_name": "ACME BEDS LIMITED", "company_status": "active", "type": "ltd", "date_of_creation": "2012-03-01",
                                         "registered_office_address": {"address_line_1": "1 High St", "locality": "Leeds", "postal_code": "LS1 1AA"}, "accounts": {"overdue": False}})

    def vat(req: httpx.Request):
        if req.url.path == "/oauth/token":
            return httpx.Response(200, json={"access_token": "t", "expires_in": 14400})
        return httpx.Response(200, json={"target": {"name": "ACME BEDS LIMITED", "vatNumber": "123456789", "address": {"line1": "1 High St", "postcode": "LS1 1AA"}}, "processingDate": "2026-11-17"})
    providers.TRANSPORTS["companies_house"] = httpx.MockTransport(ch)
    providers.TRANSPORTS["hmrc_vat"] = httpx.MockTransport(vat)
    try:
        authed.put("/api/integrations/companies_house", json={"values": {"api_key": "ch-key"}})
        authed.put("/api/integrations/hmrc_vat", json={"values": {"client_id": "id", "client_secret": "secret"}})
        s = authed.post("/api/suppliers", json={"legal_name": "Acme Beds Ltd", "supplier_type": "wholesaler", "country": "GB", "vat_number": "GB123456789", "brands_supplied": ["DreamCo"]}).json()
        assert s["status"] == "unverified"
        v = authed.post(f"/api/suppliers/{s['id']}/verify").json()
        assert v["registry"]["status"] == "active" and v["vat"]["valid"] is True
        assert v["status"] == "established_wholesaler"  # NOT authorised: selling a brand proves nothing
        # brand claim alone does not make it authorised
        authed.post(f"/api/suppliers/{s['id']}/evidence", json={"kind": "website_claim", "summary": "Says it is an official DreamCo distributor", "source_url": "https://acme.example/about", "brand": "DreamCo"})
        assert authed.get(f"/api/suppliers/{s['id']}").json()["status"] == "established_wholesaler"
        # a listing on the brand's own distributor page does
        r = authed.post(f"/api/suppliers/{s['id']}/evidence", json={"kind": "brand_locator", "summary": "Listed on dreamco.example/distributors", "source_url": "https://dreamco.example/distributors", "brand": "DreamCo"}).json()
        assert r["status"] == "verified_authorised_distributor"
        prof = authed.get(f"/api/suppliers/{s['id']}").json()
        assert any(e["kind"] == "registry" and e["classification"] == "public_registry" for e in prof["evidence"])
        assert "not proof of brand authorisation" in prof["score_disclaimer"]
    finally:
        providers.TRANSPORTS.pop("companies_house", None)
        providers.TRANSPORTS.pop("hmrc_vat", None)


def _invoice_pdf(seller="ACME BEDS LIMITED", buyer="Test Org", date_str="10/10/2026", qty=24, title="INVOICE"):
    from reportlab.lib.pagesizes import A4
    from reportlab.pdfgen import canvas
    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=A4)
    y = 800
    for line in [seller, "1 High St, Leeds LS1 1AA", "Tel: 0113 496 0000  sales@acme.example", "VAT No: GB123456789", "", title, f"Invoice No: INV-1042", f"Invoice Date: {date_str}", "",
                 "Bill To:", buyer, "5 Market Rd, York YO1 1AA", "", f"DreamCo Divan Bed Double Grey {qty} 120.00 {qty * 120:.2f}", "", f"Subtotal {qty * 120:.2f}", f"VAT {qty * 24:.2f}", f"Total {qty * 144:.2f}"]:
        c.drawString(60, y, line)
        y -= 18
    c.save()
    return buf.getvalue()


def test_invoice_assessment_rules(authed):
    s = authed.post("/api/suppliers", json={"legal_name": "Acme Beds Ltd", "country": "GB"}).json()
    authed.put("/api/compliance/policy", json={"url": "https://sellercentral.amazon.co.uk/help/hub/reference/external/example", "reviewed_at": "2026-11-01", "legal_name": "Test Org"})
    pdf1 = _invoice_pdf()
    up = authed.post("/api/documents", files={"file": ("inv.pdf", pdf1, "application/pdf")}, data={"kind": "invoice", "supplier_id": str(s["id"])}).json()
    assert up["has_text"]
    a = authed.post(f"/api/documents/{up['id']}/assess", json={"brand": "DreamCo", "use_ai": False}).json()
    checks = {c["id"]: c["status"] for c in a["checks"]}
    assert checks["doc_type"] == "pass" and checks["date"] == "pass" and checks["quantity"] == "pass" and checks["seller_match"] == "pass"
    assert a["policy"]["url"].startswith("https://sellercentral") and "not a guarantee" in a["disclaimer"]
    # a pro-forma from an old date fails
    up2 = authed.post("/api/documents", files={"file": ("pf.pdf", _invoice_pdf(title="PRO FORMA INVOICE", date_str="01/01/2023", qty=4), "application/pdf")}, data={"supplier_id": str(s["id"])}).json()
    b = authed.post(f"/api/documents/{up2['id']}/assess", json={"use_ai": False}).json()
    c2 = {c["id"]: c["status"] for c in b["checks"]}
    assert c2["doc_type"] == "fail" and c2["date"] == "fail" and b["risk_level"] == "high"
    # same file again is flagged as a duplicate
    up3 = authed.post("/api/documents", files={"file": ("again.pdf", pdf1, "application/pdf")}).json()
    c3 = {c["id"]: c["status"] for c in authed.post(f"/api/documents/{up3['id']}/assess", json={"use_ai": False}).json()["checks"]}
    assert c3.get("duplicate") == "warn"


def test_rfq_po_flow(authed):
    s = authed.post("/api/suppliers", json={"legal_name": "Ningbo Home Co", "country": "CN", "supplier_type": "manufacturer"}).json()
    q = authed.post("/api/rfq", json={"supplier_id": s["id"], "product_desc": "Upholstered bed frame", "quantity": 200}).json()
    assert "commercial invoice" in q["email_body"]
    assert authed.post(f"/api/rfq/{q['id']}/send").json()["emailed"] is False
    q2 = authed.patch(f"/api/rfq/{q['id']}", json={"quoted_price": 61.5, "moq": 100, "lead_time_days": 35, "currency": "USD"}).json()
    assert q2["status"] == "quoted"
    po = authed.post("/api/purchase-orders", json={"supplier_id": s["id"], "quotation_id": q["id"], "currency": "USD"}).json()
    lst = authed.get("/api/purchase-orders").json()
    assert lst[0]["reference"] == po["reference"] and lst[0]["total"] == 200 * 61.5


def test_alerts_fire_on_price_drop(authed):
    authed.post("/api/products/import", data={"text": json.dumps(EXT)})
    pid = authed.post("/api/products/query", json={"filters": {"q": "B0TEST0007"}}).json()["items"][0]["id"]
    assert authed.post("/api/alerts/rules", json={"name": "Price drop", "entity_type": "product", "entity_id": pid, "metric": "price", "op": "below", "value": 20}).status_code == 200
    assert authed.post("/api/alerts/evaluate").json()["fired"] == 0
    authed.patch(f"/api/products/{pid}", json={"price": 18.5})
    assert authed.post("/api/alerts/evaluate").json()["fired"] == 1
    assert authed.post("/api/alerts/evaluate").json()["fired"] == 0  # fires once per crossing
    ev = authed.get("/api/alerts/events").json()
    assert ev["unread"] >= 1 and "below your target" in ev["items"][0]["body"]


def test_reports_and_operations(authed):
    authed.post("/api/products/import", data={"text": json.dumps(EXT)})
    r = authed.post("/api/reports", json={"kind": "product_research", "format": "xlsx"}).json()
    dl = authed.get(f"/api/reports/{r['id']}/download")
    assert dl.status_code == 200 and dl.content[:2] == b"PK"
    pdf = authed.post("/api/reports", json={"kind": "product_research", "format": "pdf"}).json()
    assert authed.get(f"/api/reports/{pdf['id']}/download").content[:4] == b"%PDF"
    inv = authed.post("/api/inventory", json={"sku": "BED-01", "on_hand": 40, "unit_cost": 70, "lead_time_days": 30}).json()
    assert inv["stockout_risk"] == "none"
    orders = "amazon-order-id,purchase-date,order-status,sku,asin,product-name,quantity,item-price\n" + "\n".join(
        f"20{i}-1,2026-11-{(i % 15) + 1:02d}T10:00:00Z,Shipped,BED-01,B0TEST0001,Bed,1,249.99" for i in range(60))
    assert authed.post("/api/sales/import", files={"file": ("orders.csv", orders.encode(), "text/csv")}).json()["imported"] == 60
    s = authed.get("/api/sales", params={"days": 365}).json()
    assert s["available"] and s["totals"]["units"] == 60 and s["totals"]["cogs"] == 60 * 70
    inv2 = authed.get("/api/inventory").json()["items"][0]
    assert inv2["daily_velocity"] > 0 and inv2["stockout_risk"] in ("high", "medium", "low")
    ppc = "Date,Campaign Name,Ad Group Name,Targeting,Match Type,Customer Search Term,Impressions,Clicks,Spend,7 Day Total Sales,7 Day Total Orders\n" + \
        "2026-11-10,Beds,AG1,divan bed,BROAD,cheap divan bed,1000,25,30.00,0,0\n2026-11-10,Beds,AG1,divan bed,BROAD,double divan bed,2000,40,40.00,750,3\n"
    assert authed.post("/api/ppc/import", files={"file": ("st.csv", ppc.encode(), "text/csv")}).json()["imported"] == 2
    p = authed.get("/api/ppc", params={"days": 3650}).json()
    assert p["totals"]["acos"] == round(70 / 750 * 100, 1) and p["wasted_spend"][0]["term"] == "cheap divan bed" and p["harvest"][0]["term"] == "double divan bed"
