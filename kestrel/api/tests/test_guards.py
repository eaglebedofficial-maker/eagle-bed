def test_keyword_processor_requires_sign_in(client):
    assert client.post("/api/keywords/process", json={"text": "a b"}).status_code == 401


def test_competitor_set_cap_and_age_filter(authed):
    ids = []
    for i in range(11):
        r = authed.post("/api/products/import", data={"text": f"asin,title,price\nB0TEST{i:04d},Thing {i},10", "marketplace": "UK"})
        assert r.status_code == 200, r.text
    rows = authed.post("/api/products/query", json={"filters": {}, "page_size": 50}).json()
    ids = [p["id"] for p in rows["items"]][:11]
    assert len(ids) == 11
    assert authed.post("/api/sets", json={"name": "Too many", "kind": "competitor_set", "product_ids": ids}).status_code == 422
    sid = authed.post("/api/sets", json={"name": "Ten", "kind": "competitor_set", "product_ids": ids[:10]}).json()["id"]
    assert authed.post(f"/api/sets/{sid}/products", json=[ids[10]]).status_code == 422
    assert authed.delete(f"/api/sets/{sid}/products/{ids[0]}").status_code == 200
    assert authed.post(f"/api/sets/{sid}/products", json=[ids[10]]).status_code == 200
    # decimal listing-age filter no longer crashes
    assert authed.post("/api/products/query", json={"filters": {"age_max_days": "30.5"}}).status_code == 200
