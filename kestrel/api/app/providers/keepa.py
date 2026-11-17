"""Keepa API — historical Amazon price, rank, offer and buy-box data.

Docs: https://keepa.com/#!discuss/t/product-object/116 · https://keepa.com/#!api
Each organisation uses its own key (Keepa licences data to the key holder).
"""
from __future__ import annotations

from datetime import datetime, timezone

from .base import ConfigField, Provider, ProviderError, Result

KEEPA_EPOCH_MIN = 21564000  # Keepa minutes are minutes since 2011-01-01

# csv index → our series name, and whether the value is a price (cents)
CSV_SERIES = {
    0: ("amazon", True), 1: ("new", True), 2: ("used", True), 3: ("rank", False), 4: ("list", True),
    7: ("fbm", True),  # NEW_FBM_SHIPPING (price incl. shipping)
    9: ("warehouse", True), 10: ("fba", True), 11: ("offers_new", False), 12: ("offers_used", False),
    16: ("rating", False), 17: ("reviews", False), 18: ("buybox", True),
}
TRIPLET_SERIES = {7, 18}  # stored as [t, price, shipping]


def keepa_time(km: int) -> datetime:
    return datetime.fromtimestamp((km + KEEPA_EPOCH_MIN) * 60, tz=timezone.utc)


def to_keepa_minutes(dt: datetime) -> int:
    return int(dt.timestamp() // 60) - KEEPA_EPOCH_MIN


def decode_series(csv: list | None, idx: int) -> list[tuple[datetime, float | None]]:
    if not csv:
        return []
    out = []
    is_price = CSV_SERIES.get(idx, ("", False))[1]
    step = 3 if idx in TRIPLET_SERIES else 2
    for i in range(0, len(csv) - (step - 1), step):
        t, v = csv[i], csv[i + 1]
        if step == 3 and v is not None and v >= 0:
            ship = csv[i + 2]
            v = v + (ship if ship and ship > 0 else 0)
        if v is None or v < 0:
            val = None
        elif idx == 16:
            val = v / 10.0
        else:
            val = v / 100.0 if is_price else float(v)
        out.append((keepa_time(t), val))
    return out


def decode_product(p: dict) -> dict:
    """Normalise one Keepa product object into our product fields + history series."""
    csv = p.get("csv") or []
    series = {}
    for idx, (name, _) in CSV_SERIES.items():
        if idx < len(csv) and csv[idx]:
            series[name] = decode_series(csv[idx], idx)
    stats = p.get("stats") or {}
    cur = stats.get("current") or []

    def c(i, price=True):
        if i >= len(cur) or cur[i] is None or cur[i] < 0:
            return None
        return cur[i] / 100.0 if price else cur[i]

    buybox_hist = []
    bb = p.get("buyBoxSellerIdHistory") or []
    for i in range(0, len(bb) - 1, 2):
        try:
            buybox_hist.append((keepa_time(int(bb[i])), bb[i + 1]))
        except (TypeError, ValueError):
            continue
    monthly_sold = []
    ms = p.get("monthlySoldHistory") or []
    for i in range(0, len(ms) - 1, 2):
        monthly_sold.append((keepa_time(ms[i]), float(ms[i + 1])))
    if monthly_sold:
        series["monthly_sold"] = monthly_sold
    images = (p.get("imagesCSV") or "").split(",")
    dims = [p.get("packageLength"), p.get("packageWidth"), p.get("packageHeight")]
    tree = p.get("categoryTree") or []
    fields = {
        "asin": p.get("asin"), "title": p.get("title") or "", "brand_name": p.get("brand") or "",
        "manufacturer": p.get("manufacturer") or "", "parent_asin": p.get("parentAsin") or "",
        "ean": (p.get("eanList") or [""])[0] or "", "upc": (p.get("upcList") or [""])[0] or "",
        "image_url": f"https://m.media-amazon.com/images/I/{images[0]}" if images and images[0] else "",
        "image_count": len([i for i in images if i]) or None,
        "price": c(18) or c(1) or c(0) or c(10), "bsr": c(3, False),
        "rating": (c(16, False) / 10.0) if c(16, False) else None, "review_count": c(17, False),
        "offer_count": c(11, False),
        "category": tree[0]["name"] if tree else "", "subcategory": tree[-1]["name"] if tree else "",
        "weight_g": p.get("packageWeight") or p.get("itemWeight") or None,
        "length_cm": (dims[0] or 0) / 10 or None, "width_cm": (dims[1] or 0) / 10 or None, "height_cm": (dims[2] or 0) / 10 or None,
        "variation_count": len(p.get("variations") or []) or None,
        "listed_at": keepa_time(p["listedSince"]).date() if p.get("listedSince") else None,
        "bought_past_month": p.get("monthlySold") or None,
        "amazon_sells": (p.get("availabilityAmazon") == 0) if p.get("availabilityAmazon") is not None else None,
    }
    st = {k: stats.get(k) for k in ("avg30", "avg90", "avg180", "avg365", "min", "max", "salesRankDrops30", "salesRankDrops90",
                                    "salesRankDrops180", "salesRankDrops365", "buyBoxSellerId", "outOfStockPercentage30",
                                    "outOfStockPercentage90", "buyBoxIsAmazon", "buyBoxIsFBA", "offerCountFBA", "offerCountFBM")}
    if stats.get("offerCountFBA") is not None:
        fields["fba_offer_count"] = stats.get("offerCountFBA")
    if stats.get("offerCountFBM") is not None:
        fields["fbm_offer_count"] = stats.get("offerCountFBM")
    offers = []
    for o in p.get("offers") or []:
        oc = o.get("offerCSV") or []
        price = oc[-2] / 100.0 if len(oc) >= 2 and oc[-2] >= 0 else None
        offers.append({"seller_id": o.get("sellerId"), "is_fba": bool(o.get("isFBA")), "is_amazon": bool(o.get("isAmazon")),
                       "condition": "new" if o.get("condition") == 1 else "used", "price": price, "is_buybox": False})
    return {"fields": fields, "series": series, "buybox_sellers": buybox_hist, "stats": st, "offers": offers,
            "fba_fees": p.get("fbaFees"), "referral_fee_pct": p.get("referralFeePercentage")}


class KeepaProvider(Provider):
    key = "keepa"
    name = "Keepa"
    category = "amazon_data"
    description = "Historical price, Best Sellers Rank, offer count, buy box and monthly-sold history; Product Finder and best-seller lists."
    classification = "licensed"
    docs_url = "https://keepa.com/#!api"
    signup_url = "https://keepa.com/#!api"
    cost = "Paid subscription (token based, from about €49/month)"
    capabilities = ["price_history", "rank_history", "buybox_history", "offers", "product_finder", "bestsellers", "alerts"]
    fields = [ConfigField("api_key", "API key", secret=True, help="keepa.com → API → your private API access key")]
    rate_limit = (120, 60)
    BASE = "https://api.keepa.com"

    def health_check(self):
        self.ensure_configured()
        data, _ = self.request("GET", f"{self.BASE}/token", params={"key": self.config["api_key"]})
        if "tokensLeft" not in data:
            raise ProviderError("auth_failed", "Keepa did not accept the key.", self.key)
        return {"ok": True, "tokens_left": data.get("tokensLeft"), "refill_rate": data.get("refillRate")}

    def _check(self, data: dict):
        if data.get("error"):
            err = data["error"]
            raise ProviderError("upstream", f"Keepa: {err.get('message') or err.get('type')}", self.key)
        self.usage["tokens_left"] = data.get("tokensLeft")
        self.usage["tokens_consumed"] = self.usage.get("tokens_consumed", 0) + (data.get("tokensConsumed") or 0)

    def products(self, domain_id: int, asins: list[str], days: int | None = 365, offers: int = 0, buybox: bool = True) -> Result:
        self.ensure_configured()
        if not asins:
            raise ProviderError("invalid_input", "No ASINs given.", self.key)
        params = {"key": self.config["api_key"], "domain": domain_id, "asin": ",".join(asins[:100]),
                  "stats": days or 365, "history": 1, "rating": 1, "buybox": 1 if buybox else 0}
        if days:
            params["days"] = days
        if offers:
            params["offers"] = max(20, min(100, offers))
        data, cached = self.request("GET", f"{self.BASE}/product", params=params, cache_ttl=1800)
        self._check(data)
        prods = [decode_product(p) for p in data.get("products") or []]
        return Result(prods, self.provenance(cached, note=f"{len(prods)} products"), usage=self.usage)

    def product_by_code(self, domain_id: int, code: str) -> Result:
        """Look up by EAN/UPC/ISBN."""
        self.ensure_configured()
        data, cached = self.request("GET", f"{self.BASE}/product", params={"key": self.config["api_key"], "domain": domain_id, "code": code, "stats": 90}, cache_ttl=1800)
        self._check(data)
        return Result([decode_product(p) for p in data.get("products") or []], self.provenance(cached), usage=self.usage)

    def finder(self, domain_id: int, selection: dict) -> Result:
        """Product Finder: returns ASIN list matching the selection (Keepa query JSON)."""
        self.ensure_configured()
        import json as _json
        data, cached = self.request("GET", f"{self.BASE}/query", params={"key": self.config["api_key"], "domain": domain_id, "selection": _json.dumps(selection)}, cache_ttl=3600)
        self._check(data)
        return Result({"asins": data.get("asinList") or [], "total": data.get("totalResults")}, self.provenance(cached), usage=self.usage)

    def bestsellers(self, domain_id: int, category_id: str) -> Result:
        self.ensure_configured()
        data, cached = self.request("GET", f"{self.BASE}/bestsellers", params={"key": self.config["api_key"], "domain": domain_id, "category": category_id}, cache_ttl=21600)
        self._check(data)
        bl = data.get("bestSellersList") or {}
        return Result({"asins": bl.get("asinList") or [], "category": bl.get("categoryId")}, self.provenance(cached), usage=self.usage)

    def category_search(self, domain_id: int, term: str) -> Result:
        self.ensure_configured()
        data, cached = self.request("GET", f"{self.BASE}/search", params={"key": self.config["api_key"], "domain": domain_id, "type": "category", "term": term}, cache_ttl=86400)
        self._check(data)
        cats = [{"id": str(k), "name": v.get("name"), "products": v.get("productCount")} for k, v in (data.get("categories") or {}).items()]
        return Result(cats, self.provenance(cached), usage=self.usage)

    @staticmethod
    def finder_selection(f: dict) -> dict:
        """Map our filter vocabulary to Keepa Product Finder fields (prices in cents)."""
        sel: dict = {"perPage": min(int(f.get("limit") or 100), 10000), "page": int(f.get("page") or 0)}
        def rng(lo_key, hi_key, field, mult=1):
            if f.get(lo_key) not in (None, ""):
                sel[f"{field}_gte"] = int(float(f[lo_key]) * mult)
            if f.get(hi_key) not in (None, ""):
                sel[f"{field}_lte"] = int(float(f[hi_key]) * mult)
        rng("price_min", "price_max", "current_BUY_BOX_SHIPPING", 100)
        rng("bsr_min", "bsr_max", "current_SALES")
        rng("reviews_min", "reviews_max", "current_COUNT_REVIEWS")
        rng("rating_min", "rating_max", "current_RATING", 10)
        rng("offers_min", "offers_max", "current_COUNT_NEW")
        rng("avg90_price_min", "avg90_price_max", "avg90_BUY_BOX_SHIPPING", 100)
        rng("sold_min", "sold_max", "monthlySold")
        if f.get("category_id"):
            sel["rootCategory"] = [int(f["category_id"])]
        if f.get("brand"):
            sel["brand"] = [f["brand"]]
        if f.get("title"):
            sel["title"] = f["title"]
        if f.get("amazon_not_selling"):
            sel["availabilityAmazon"] = [-1, 2, 3, 4]
        sel["sort"] = [["current_SALES", "asc"]]
        return sel
