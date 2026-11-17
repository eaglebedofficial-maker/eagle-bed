"""Amazon Selling Partner API, Amazon Ads API and Product Advertising API 5.0.

SP-API and Ads use Login with Amazon (LWA) refresh tokens. SP-API no longer needs AWS SigV4.
PA-API 5 uses SigV4 (implemented below).
"""
from __future__ import annotations

import hashlib
import hmac
import json
import time
from datetime import datetime, timezone

from .. import cache
from .base import ConfigField, Provider, ProviderError, Result

SP_HOSTS = {"na": "https://sellingpartnerapi-na.amazon.com", "eu": "https://sellingpartnerapi-eu.amazon.com", "fe": "https://sellingpartnerapi-fe.amazon.com"}
ADS_HOSTS = {"na": "https://advertising-api.amazon.com", "eu": "https://advertising-api-eu.amazon.com", "fe": "https://advertising-api-fe.amazon.com"}
LWA_URL = "https://api.amazon.com/auth/o2/token"


class _LWA(Provider):
    def _access_token(self) -> str:
        ck = f"lwa:{self.key}:{self.org_id}:{hashlib.sha256(self.config.get('refresh_token', '').encode()).hexdigest()[:16]}"
        tok = cache.get_json(ck)
        if tok:
            return tok
        data, _ = self.request("POST", LWA_URL, data={"grant_type": "refresh_token", "refresh_token": self.config["refresh_token"],
                                                      "client_id": self.config["client_id"], "client_secret": self.config["client_secret"]})
        tok = data.get("access_token")
        if not tok:
            raise ProviderError("auth_failed", "Login with Amazon did not return an access token.", self.key)
        cache.set_json(ck, tok, int(data.get("expires_in", 3600)) - 120)
        return tok


class SPAPIProvider(_LWA):
    key = "sp_api"
    name = "Amazon Selling Partner API"
    category = "amazon_data"
    description = "Your seller account: catalog data (EAN/UPC lookup, sales ranks, dimensions), offers and buy box, exact fee estimates, gating checks, inventory, orders, reports and compliant review requests."
    classification = "official_api"
    docs_url = "https://developer-docs.amazon.com/sp-api/"
    signup_url = "https://sellercentral.amazon.co.uk/sellingpartner/developerconsole"
    cost = "Free (requires a Seller Central developer profile and app authorisation)"
    capabilities = ["catalog", "identifiers", "offers", "fees", "restrictions", "inventory", "orders", "reports", "solicitations", "brand_analytics"]
    fields = [ConfigField("client_id", "LWA client ID"), ConfigField("client_secret", "LWA client secret", secret=True),
              ConfigField("refresh_token", "Refresh token", secret=True, help="From authorising your app in Seller Central"),
              ConfigField("seller_id", "Seller (merchant) ID", help="Seller Central → Settings → Account info → Merchant token"),
              ConfigField("region", "Region", required=False, placeholder="eu", help="eu (UK/EU), na (US/CA), fe (AU/JP)")]
    rate_limit = (60, 60)

    def _base(self):
        return SP_HOSTS.get((self.config.get("region") or "eu").lower(), SP_HOSTS["eu"])

    def _call(self, method, path, params=None, body=None, cache_ttl=0):
        self.ensure_configured()
        headers = {"x-amz-access-token": self._access_token(), "content-type": "application/json"}
        data, cached = self.request(method, self._base() + path, params=params, json_body=body, headers=headers, cache_ttl=cache_ttl)
        return data, cached

    def health_check(self):
        data, _ = self._call("GET", "/sellers/v1/marketplaceParticipations")
        mps = [m["marketplace"]["id"] for m in data.get("payload", [])]
        return {"ok": True, "marketplaces": mps}

    def catalog_search(self, marketplace_id: str, *, identifiers: list[str] | None = None, id_type: str | None = None, keywords: str | None = None, brand: str | None = None) -> Result:
        params = {"marketplaceIds": marketplace_id, "includedData": "summaries,attributes,salesRanks,dimensions,identifiers,images,relationships", "pageSize": 20}
        if identifiers:
            params.update(identifiers=",".join(identifiers[:20]), identifiersType=id_type or "ASIN")
        elif keywords:
            params["keywords"] = keywords
            if brand:
                params["brandNames"] = brand
        data, cached = self._call("GET", "/catalog/2022-04-01/items", params=params, cache_ttl=3600)
        return Result([self.normalise_item(i, marketplace_id) for i in data.get("items", [])], self.provenance(cached))

    @staticmethod
    def normalise_item(item: dict, marketplace_id: str) -> dict:
        def first(lst):
            return lst[0] if lst else {}
        s = first([x for x in item.get("summaries", []) if x.get("marketplaceId") == marketplace_id] or item.get("summaries", []))
        ranks = first([x for x in item.get("salesRanks", []) if x.get("marketplaceId") == marketplace_id])
        cr = (ranks.get("classificationRanks") or []) + (ranks.get("displayGroupRanks") or [])
        top = sorted(ranks.get("displayGroupRanks") or [], key=lambda r: r.get("rank", 1e12))
        ids = {}
        for grp in item.get("identifiers", []):
            for i in grp.get("identifiers", []):
                ids.setdefault(i["identifierType"], i["identifier"])
        dims = first(item.get("dimensions", [])).get("package") or first(item.get("dimensions", [])).get("item") or {}
        def cm(d):
            if not d:
                return None
            v = d.get("value")
            return v * 2.54 if d.get("unit") == "inches" else v / 10 if d.get("unit") == "millimeters" else v
        w = dims.get("weight") or {}
        wg = None
        if w:
            wg = w["value"] * (453.592 if w.get("unit") == "pounds" else 1000 if w.get("unit") == "kilograms" else 28.3495 if w.get("unit") == "ounces" else 1)
        imgs = first([x for x in item.get("images", []) if x.get("marketplaceId") == marketplace_id] or item.get("images", [])).get("images", [])
        return {"asin": item.get("asin"), "title": s.get("itemName", ""), "brand_name": s.get("brand", ""), "manufacturer": s.get("manufacturer", ""),
                "bsr": top[0]["rank"] if top else (cr[0]["rank"] if cr else None), "bsr_category": top[0].get("title", "") if top else "",
                "category": top[0].get("title", "") if top else "", "subcategory": (ranks.get("classificationRanks") or [{}])[0].get("title", ""),
                "ean": ids.get("EAN", ""), "upc": ids.get("UPC", ""), "isbn": ids.get("ISBN", ""),
                "weight_g": wg, "length_cm": cm(dims.get("length")), "width_cm": cm(dims.get("width")), "height_cm": cm(dims.get("height")),
                "image_url": imgs[0]["link"] if imgs else "", "image_count": len({i.get("link") for i in imgs}) or None}

    def item_offers(self, marketplace_id: str, asin: str) -> Result:
        data, cached = self._call("GET", f"/products/pricing/v0/items/{asin}/offers", params={"MarketplaceId": marketplace_id, "ItemCondition": "New"}, cache_ttl=900)
        p = data.get("payload", {})
        offers = [{"seller_id": o.get("SellerId"), "is_fba": o.get("IsFulfilledByAmazon", False), "is_buybox": o.get("IsBuyBoxWinner", False),
                   "price": (o.get("ListingPrice") or {}).get("Amount"), "shipping": (o.get("Shipping") or {}).get("Amount"), "condition": "new"} for o in p.get("Offers", [])]
        summ = p.get("Summary", {})
        return Result({"offers": offers, "total_offers": summ.get("TotalOfferCount"), "buybox_prices": summ.get("BuyBoxPrices", [])}, self.provenance(cached))

    def fees_estimate(self, marketplace_id: str, asin: str, price: float, currency: str, fba: bool = True) -> Result:
        body = {"FeesEstimateRequest": {"MarketplaceId": marketplace_id, "IsAmazonFulfilled": fba, "Identifier": f"kestrel-{asin}-{int(time.time())}",
                                        "PriceToEstimateFees": {"ListingPrice": {"CurrencyCode": currency, "Amount": price}}}}
        data, _ = self._call("POST", f"/products/fees/v0/items/{asin}/feesEstimate", body=body)
        res = (data.get("payload") or {}).get("FeesEstimateResult", {})
        est = res.get("FeesEstimate") or {}
        fees = {d["FeeType"]: d["FinalFee"]["Amount"] for d in est.get("FeeDetailList", [])}
        if res.get("Status") != "Success":
            raise ProviderError("upstream", f"Fee estimate failed: {res.get('Error', {}).get('Message', 'unknown')}", self.key)
        return Result({"total": (est.get("TotalFeesEstimate") or {}).get("Amount"), "fees": fees}, self.provenance())

    def listing_restrictions(self, marketplace_id: str, asin: str) -> Result:
        data, _ = self._call("GET", "/listings/2021-08-01/restrictions", params={"asin": asin, "sellerId": self.config["seller_id"], "marketplaceIds": marketplace_id, "conditionType": "new_new"})
        rs = data.get("restrictions", [])
        reasons = [{"code": r.get("reasonCode"), "message": r.get("message"), "links": [l.get("resource") for l in r.get("links", [])]} for rr in rs for r in rr.get("reasons", [])]
        result = "eligible" if not rs else ("approval_required" if any(x["code"] == "APPROVAL_REQUIRED" for x in reasons) else "restricted")
        return Result({"result": result, "reasons": reasons}, self.provenance())

    def fba_inventory(self, marketplace_id: str, next_token: str | None = None) -> Result:
        params = {"granularityType": "Marketplace", "granularityId": marketplace_id, "marketplaceIds": marketplace_id, "details": "true"}
        if next_token:
            params["nextToken"] = next_token
        data, _ = self._call("GET", "/fba/inventory/v1/summaries", params=params)
        p = data.get("payload", {})
        items = [{"sku": s.get("sellerSku"), "asin": s.get("asin"), "title": s.get("productName", ""),
                  "on_hand": (s.get("inventoryDetails") or {}).get("fulfillableQuantity", s.get("totalQuantity", 0)),
                  "inbound": sum(((s.get("inventoryDetails") or {}).get(k) or 0) for k in ("inboundWorkingQuantity", "inboundShippedQuantity", "inboundReceivingQuantity")),
                  "reserved": ((s.get("inventoryDetails") or {}).get("reservedQuantity") or {}).get("totalReservedQuantity", 0)} for s in p.get("inventorySummaries", [])]
        return Result({"items": items, "next_token": (data.get("pagination") or {}).get("nextToken")}, self.provenance())

    def order_metrics(self, marketplace_id: str, start: str, end: str, granularity: str = "Day") -> Result:
        data, _ = self._call("GET", "/sales/v1/orderMetrics", params={"marketplaceIds": marketplace_id, "interval": f"{start}--{end}", "granularity": granularity})
        return Result(data.get("payload", []), self.provenance())

    def request_review(self, marketplace_id: str, order_id: str) -> Result:
        """Amazon's standard 'Request a Review' (only compliant review-request channel)."""
        actions, _ = self._call("GET", f"/solicitations/v1/orders/{order_id}", params={"marketplaceIds": marketplace_id})
        names = [a.get("name") for a in (actions.get("_links") or {}).get("actions", [])]
        if "productReviewAndSellerFeedback" not in names:
            raise ProviderError("invalid_input", "Amazon does not allow a review request for this order now (window is 5–30 days after delivery, once per order).", self.key)
        self._call("POST", f"/solicitations/v1/orders/{order_id}/solicitations/productReviewAndSellerFeedback", params={"marketplaceIds": marketplace_id})
        return Result({"requested": True}, self.provenance())

    def create_report(self, marketplace_id: str, report_type: str, start: str | None = None, end: str | None = None) -> Result:
        body = {"reportType": report_type, "marketplaceIds": [marketplace_id]}
        if start:
            body["dataStartTime"] = start
        if end:
            body["dataEndTime"] = end
        data, _ = self._call("POST", "/reports/2021-06-30/reports", body=body)
        return Result({"report_id": data.get("reportId")}, self.provenance())

    def get_report(self, report_id: str) -> Result:
        data, _ = self._call("GET", f"/reports/2021-06-30/reports/{report_id}")
        out = {"status": data.get("processingStatus"), "document_id": data.get("reportDocumentId")}
        if out["document_id"]:
            doc, _ = self._call("GET", f"/reports/2021-06-30/documents/{out['document_id']}")
            out["url"] = doc.get("url")
            out["compression"] = doc.get("compressionAlgorithm")
        return Result(out, self.provenance())


class AdsAPIProvider(_LWA):
    key = "ads_api"
    name = "Amazon Ads API"
    category = "amazon_data"
    description = "Sponsored Products campaign, keyword and search-term reports; keyword and bid recommendations."
    classification = "official_api"
    docs_url = "https://advertising.amazon.com/API/docs/en-us/"
    signup_url = "https://advertising.amazon.com/API/docs/en-us/setting-up/overview"
    cost = "Free (requires Ads API access approval)"
    capabilities = ["campaign_reports", "search_terms", "keyword_recommendations", "bid_recommendations"]
    fields = [ConfigField("client_id", "LWA client ID"), ConfigField("client_secret", "LWA client secret", secret=True),
              ConfigField("refresh_token", "Refresh token", secret=True), ConfigField("profile_id", "Advertising profile ID", required=False),
              ConfigField("region", "Region", required=False, placeholder="eu")]

    def _call(self, method, path, body=None, params=None, headers=None):
        self.ensure_configured()
        h = {"Authorization": f"Bearer {self._access_token()}", "Amazon-Advertising-API-ClientId": self.config["client_id"], "content-type": "application/json"}
        if self.config.get("profile_id"):
            h["Amazon-Advertising-API-Scope"] = str(self.config["profile_id"])
        h.update(headers or {})
        base = ADS_HOSTS.get((self.config.get("region") or "eu").lower(), ADS_HOSTS["eu"])
        data, _ = self.request(method, base + path, json_body=body, params=params, headers=h)
        return data

    def health_check(self):
        profiles = self._call("GET", "/v2/profiles")
        return {"ok": True, "profiles": [{"id": p["profileId"], "country": p.get("countryCode"), "name": (p.get("accountInfo") or {}).get("name")} for p in profiles]}

    def request_sp_report(self, start: str, end: str, report: str = "spSearchTerm") -> Result:
        cols = {"spSearchTerm": ["date", "campaignName", "adGroupName", "keyword", "matchType", "searchTerm", "impressions", "clicks", "cost", "sales7d", "purchases7d"],
                "spCampaigns": ["date", "campaignName", "impressions", "clicks", "cost", "sales7d", "purchases7d"]}[report]
        body = {"name": f"kestrel-{report}-{start}", "startDate": start, "endDate": end,
                "configuration": {"adProduct": "SPONSORED_PRODUCTS", "groupBy": ["searchTerm"] if report == "spSearchTerm" else ["campaign"],
                                  "columns": cols, "reportTypeId": report, "timeUnit": "DAILY", "format": "GZIP_JSON"}}
        data = self._call("POST", "/reporting/reports", body=body, headers={"content-type": "application/vnd.createasyncreportrequest.v3+json"})
        return Result({"report_id": data.get("reportId"), "status": data.get("status")}, self.provenance())

    def get_report(self, report_id: str) -> Result:
        data = self._call("GET", f"/reporting/reports/{report_id}")
        return Result({"status": data.get("status"), "url": data.get("url")}, self.provenance())

    def keyword_bid_recommendations(self, asins: list[str], keywords: list[str]) -> Result:
        body = {"recommendationType": "BIDS_FOR_NEW_AD_GROUP", "asins": asins[:50],
                "targetingExpressions": [{"type": "KEYWORD_EXACT_MATCH", "value": k} for k in keywords[:100]], "bidding": {"strategy": "LEGACY_FOR_SALES"}}
        data = self._call("POST", "/sp/targets/bid/recommendations", body=body, headers={"content-type": "application/vnd.spthemebasedbidrecommendation.v3+json"})
        recs = []
        for theme in data.get("bidRecommendations", []):
            for r in theme.get("bidRecommendationsForTargetingExpressions", []):
                vals = [b.get("suggestedBid") for b in r.get("bidValues", [])]
                recs.append({"keyword": r["targetingExpression"]["value"], "low": vals[0] if vals else None, "mid": vals[1] if len(vals) > 1 else None, "high": vals[2] if len(vals) > 2 else None})
        return Result(recs, self.provenance())


class PAAPIProvider(Provider):
    key = "pa_api"
    name = "Amazon Product Advertising API 5.0"
    category = "amazon_data"
    description = "Product search and item details for Amazon Associates with qualifying sales."
    classification = "official_api"
    docs_url = "https://webservices.amazon.com/paapi5/documentation/"
    signup_url = "https://affiliate-program.amazon.co.uk/assoc_credentials/home"
    cost = "Free (Associates account with qualifying sales required)"
    capabilities = ["search", "item_details"]
    fields = [ConfigField("access_key", "Access key"), ConfigField("secret_key", "Secret key", secret=True), ConfigField("partner_tag", "Partner tag (tracking ID)")]
    HOSTS = {"UK": ("webservices.amazon.co.uk", "eu-west-1", "www.amazon.co.uk"), "US": ("webservices.amazon.com", "us-east-1", "www.amazon.com"),
             "DE": ("webservices.amazon.de", "eu-west-1", "www.amazon.de"), "FR": ("webservices.amazon.fr", "eu-west-1", "www.amazon.fr"),
             "IT": ("webservices.amazon.it", "eu-west-1", "www.amazon.it"), "ES": ("webservices.amazon.es", "eu-west-1", "www.amazon.es"),
             "NL": ("webservices.amazon.nl", "eu-west-1", "www.amazon.nl"), "CA": ("webservices.amazon.ca", "us-east-1", "www.amazon.ca"),
             "AU": ("webservices.amazon.com.au", "us-west-2", "www.amazon.com.au")}

    def _signed(self, mkt: str, op: str, body: dict):
        self.ensure_configured()
        host, region, marketplace = self.HOSTS[mkt]
        body = {**body, "PartnerTag": self.config["partner_tag"], "PartnerType": "Associates", "Marketplace": marketplace}
        payload = json.dumps(body)
        path = f"/paapi5/{op.lower()}"
        target = f"com.amazon.paapi5.v1.ProductAdvertisingAPIv1.{op}"
        t = datetime.now(timezone.utc)
        amzdate, datestamp = t.strftime("%Y%m%dT%H%M%SZ"), t.strftime("%Y%m%d")
        headers = {"content-encoding": "amz-1.0", "content-type": "application/json; charset=utf-8", "host": host, "x-amz-date": amzdate, "x-amz-target": target}
        signed_headers = ";".join(sorted(headers))
        canonical = "\n".join(["POST", path, "", "".join(f"{k}:{headers[k]}\n" for k in sorted(headers)), signed_headers, hashlib.sha256(payload.encode()).hexdigest()])
        scope = f"{datestamp}/{region}/ProductAdvertisingAPI/aws4_request"
        to_sign = "\n".join(["AWS4-HMAC-SHA256", amzdate, scope, hashlib.sha256(canonical.encode()).hexdigest()])
        def h(k, m):
            return hmac.new(k, m.encode(), hashlib.sha256).digest()
        k = h(h(h(h(("AWS4" + self.config["secret_key"]).encode(), datestamp), region), "ProductAdvertisingAPI"), "aws4_request")
        sig = hmac.new(k, to_sign.encode(), hashlib.sha256).hexdigest()
        headers["Authorization"] = f"AWS4-HMAC-SHA256 Credential={self.config['access_key']}/{scope}, SignedHeaders={signed_headers}, Signature={sig}"
        data, _ = self.request("POST", f"https://{host}{path}", data=payload, headers=headers)
        if data.get("Errors"):
            raise ProviderError("upstream", data["Errors"][0].get("Message", "PA-API error"), self.key)
        return data

    RESOURCES = ["ItemInfo.Title", "ItemInfo.ByLineInfo", "ItemInfo.ExternalIds", "Images.Primary.Large", "Offers.Listings.Price", "BrowseNodeInfo.WebsiteSalesRank"]

    def search(self, mkt: str, keywords: str) -> Result:
        data = self._signed(mkt, "SearchItems", {"Keywords": keywords, "Resources": self.RESOURCES, "ItemCount": 10})
        return Result([self._norm(i) for i in (data.get("SearchResult") or {}).get("Items", [])], self.provenance())

    def get_items(self, mkt: str, asins: list[str]) -> Result:
        data = self._signed(mkt, "GetItems", {"ItemIds": asins[:10], "Resources": self.RESOURCES})
        return Result([self._norm(i) for i in (data.get("ItemsResult") or {}).get("Items", [])], self.provenance())

    @staticmethod
    def _norm(i):
        info = i.get("ItemInfo", {})
        lst = ((i.get("Offers") or {}).get("Listings") or [{}])[0]
        rank = (i.get("BrowseNodeInfo") or {}).get("WebsiteSalesRank") or {}
        ext = info.get("ExternalIds") or {}
        return {"asin": i.get("ASIN"), "title": (info.get("Title") or {}).get("DisplayValue", ""),
                "brand_name": ((info.get("ByLineInfo") or {}).get("Brand") or {}).get("DisplayValue", ""),
                "image_url": (((i.get("Images") or {}).get("Primary") or {}).get("Large") or {}).get("URL", ""),
                "price": (lst.get("Price") or {}).get("Amount"), "bsr": rank.get("SalesRank"), "bsr_category": rank.get("DisplayName", ""),
                "ean": ((ext.get("EANs") or {}).get("DisplayValues") or [""])[0], "upc": ((ext.get("UPCs") or {}).get("DisplayValues") or [""])[0]}
