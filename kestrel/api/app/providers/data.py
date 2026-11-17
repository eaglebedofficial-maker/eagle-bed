"""DataForSEO (Amazon keyword data), registries (Companies House, HMRC VAT, EU VIES), UK Trade Tariff, FX, web search."""
from __future__ import annotations

import base64
import time

from .. import cache
from .base import ConfigField, Provider, ProviderError, Result

DFS_LOCATIONS = {"UK": (2826, "en"), "US": (2840, "en"), "DE": (2276, "de"), "FR": (2250, "fr"), "IT": (2380, "it"),
                 "ES": (2724, "es"), "NL": (2528, "nl"), "CA": (2124, "en"), "AU": (2036, "en")}


class DataForSEOProvider(Provider):
    key = "dataforseo"
    name = "DataForSEO (Amazon data)"
    category = "keywords"
    description = "Amazon keyword search volumes, related keywords, keywords an ASIN ranks for (reverse ASIN) and Amazon search-result positions (organic and sponsored)."
    classification = "licensed"
    docs_url = "https://docs.dataforseo.com/v3/dataforseo_labs/amazon/overview/"
    signup_url = "https://app.dataforseo.com/register"
    cost = "Pay as you go (fractions of a cent per keyword/task)"
    capabilities = ["search_volume", "related_keywords", "ranked_keywords", "serp_positions"]
    fields = [ConfigField("login", "API login (email)"), ConfigField("password", "API password", secret=True)]
    rate_limit = (600, 60)
    BASE = "https://api.dataforseo.com/v3"

    def _auth(self):
        tok = base64.b64encode(f"{self.config['login']}:{self.config['password']}".encode()).decode()
        return {"Authorization": f"Basic {tok}"}

    def _post(self, path, task: dict, cache_ttl=86400):
        self.ensure_configured()
        ck_extra = repr(sorted(task.items()))
        hit = cache.get_json(f"dfs:{path}:{hash(ck_extra)}") if cache_ttl else None
        if hit:
            return hit, True
        data, _ = self.request("POST", self.BASE + path, json_body=[task], headers=self._auth())
        if data.get("status_code") != 20000:
            raise ProviderError("upstream", f"DataForSEO: {data.get('status_message')}", self.key)
        t = (data.get("tasks") or [{}])[0]
        if t.get("status_code") not in (20000, 20100):
            raise ProviderError("upstream", f"DataForSEO task: {t.get('status_message')}", self.key)
        self.usage["cost"] = self.usage.get("cost", 0) + (data.get("cost") or 0)
        if cache_ttl:
            cache.set_json(f"dfs:{path}:{hash(ck_extra)}", t, cache_ttl)
        return t, False

    def health_check(self):
        self.ensure_configured()
        data, _ = self.request("GET", self.BASE + "/appendix/user_data", headers=self._auth())
        res = ((data.get("tasks") or [{}])[0].get("result") or [{}])[0]
        return {"ok": True, "balance": (res.get("money") or {}).get("balance")}

    def _loc(self, mkt):
        if mkt not in DFS_LOCATIONS:
            raise ProviderError("invalid_input", f"Marketplace {mkt} not supported by DataForSEO.", self.key)
        return DFS_LOCATIONS[mkt]

    def search_volume(self, mkt: str, keywords: list[str]) -> Result:
        loc, lang = self._loc(mkt)
        t, cached = self._post("/dataforseo_labs/amazon/bulk_search_volume/live", {"keywords": keywords[:1000], "location_code": loc, "language_code": lang})
        items = ((t.get("result") or [{}])[0].get("items") or [])
        return Result([{"keyword": i.get("keyword"), "search_volume": i.get("search_volume")} for i in items], self.provenance(cached))

    def related_keywords(self, mkt: str, seed: str, limit: int = 200) -> Result:
        loc, lang = self._loc(mkt)
        t, cached = self._post("/dataforseo_labs/amazon/related_keywords/live", {"keyword": seed, "location_code": loc, "language_code": lang, "depth": 2, "limit": limit, "include_seed_keyword": True})
        out = []
        for it in ((t.get("result") or [{}])[0].get("items") or []):
            kd = it.get("keyword_data") or {}
            info = kd.get("keyword_info") or {}
            out.append({"keyword": kd.get("keyword"), "search_volume": info.get("search_volume"), "depth": it.get("depth"), "related": it.get("related_keywords") or []})
        return Result(out, self.provenance(cached))

    def ranked_keywords(self, mkt: str, asin: str, limit: int = 500) -> Result:
        loc, lang = self._loc(mkt)
        t, cached = self._post("/dataforseo_labs/amazon/ranked_keywords/live", {"asin": asin, "location_code": loc, "language_code": lang, "limit": limit})
        out = []
        for it in ((t.get("result") or [{}])[0].get("items") or []):
            kd = it.get("keyword_data") or {}
            el = (it.get("ranked_serp_element") or {}).get("serp_item") or {}
            out.append({"keyword": kd.get("keyword"), "search_volume": (kd.get("keyword_info") or {}).get("search_volume"),
                        "position": el.get("rank_absolute"), "type": el.get("type", "")})
        return Result(out, self.provenance(cached))

    def serp(self, mkt: str, keyword: str, depth: int = 100, wait: float = 60) -> Result:
        """Amazon search results (organic + sponsored) via the asynchronous Merchant API."""
        loc, lang = self._loc(mkt)
        t, _ = self._post("/merchant/amazon/products/task_post", {"keyword": keyword, "location_code": loc, "language_code": lang, "depth": depth}, cache_ttl=0)
        tid = t.get("id")
        deadline = time.time() + wait
        while time.time() < deadline:
            time.sleep(3)
            data, _ = self.request("GET", f"{self.BASE}/merchant/amazon/products/task_get/advanced/{tid}", headers=self._auth())
            task = (data.get("tasks") or [{}])[0]
            if task.get("status_code") == 20000 and task.get("result"):
                r = task["result"][0]
                items = [{"asin": i.get("data_asin"), "title": i.get("title"), "type": i.get("type"), "rank_group": i.get("rank_group"),
                          "rank_absolute": i.get("rank_absolute"), "price": (i.get("price_from")), "rating": (i.get("rating") or {}).get("value"),
                          "reviews": (i.get("rating") or {}).get("votes_count"), "sponsored": i.get("type") == "amazon_paid"} for i in r.get("items") or []]
                return Result({"items": items, "result_count": r.get("se_results_count")}, self.provenance())
        raise ProviderError("timeout", "Amazon search results are still being collected; try again in a minute.", self.key)


class CompaniesHouseProvider(Provider):
    key = "companies_house"
    name = "Companies House"
    category = "registry"
    description = "UK company identity: registered name, number, status, registered office, incorporation date, officers and filing history."
    classification = "public_registry"
    docs_url = "https://developer.company-information.service.gov.uk/"
    signup_url = "https://developer.company-information.service.gov.uk/manage-applications"
    cost = "Free (API key)"
    capabilities = ["company_search", "company_profile", "officers", "filing_history"]
    fields = [ConfigField("api_key", "REST API key", secret=True)]
    rate_limit = (500, 300)
    BASE = "https://api.company-information.service.gov.uk"

    def _get(self, path, params=None):
        self.ensure_configured()
        return self.request("GET", self.BASE + path, params=params, auth=(self.config["api_key"], ""), cache_ttl=86400)

    def health_check(self):
        self._get("/search/companies", {"q": "tesco", "items_per_page": 1})
        return {"ok": True}

    def search(self, q: str) -> Result:
        data, cached = self._get("/search/companies", {"q": q, "items_per_page": 10})
        return Result([{"number": i.get("company_number"), "name": i.get("title"), "status": i.get("company_status"), "address": i.get("address_snippet"),
                        "created": i.get("date_of_creation"), "type": i.get("company_type")} for i in data.get("items", [])], self.provenance(cached))

    def profile(self, number: str) -> Result:
        number = number.strip().upper().zfill(8) if number.strip().isdigit() else number.strip().upper()
        data, cached = self._get(f"/company/{number}")
        addr = data.get("registered_office_address") or {}
        out = {"number": data.get("company_number"), "name": data.get("company_name"), "status": data.get("company_status"), "type": data.get("type"),
               "created": data.get("date_of_creation"), "ceased": data.get("date_of_cessation"), "sic_codes": data.get("sic_codes", []),
               "address": ", ".join(v for v in [addr.get("address_line_1"), addr.get("address_line_2"), addr.get("locality"), addr.get("postal_code"), addr.get("country")] if v),
               "accounts_overdue": (data.get("accounts") or {}).get("overdue"), "confirmation_overdue": (data.get("confirmation_statement") or {}).get("overdue"),
               "has_insolvency_history": data.get("has_insolvency_history"), "has_charges": data.get("has_charges"),
               "url": f"https://find-and-update.company-information.service.gov.uk/company/{data.get('company_number')}"}
        try:
            off, _ = self._get(f"/company/{number}/officers", {"items_per_page": 20})
            out["officers"] = [{"name": o.get("name"), "role": o.get("officer_role"), "appointed": o.get("appointed_on"), "resigned": o.get("resigned_on")} for o in off.get("items", [])]
        except ProviderError:
            out["officers"] = []
        return Result(out, self.provenance(cached))


class HMRCVATProvider(Provider):
    key = "hmrc_vat"
    name = "HMRC — Check a UK VAT number"
    category = "registry"
    description = "Validates a UK VAT registration number and returns the registered business name and address."
    classification = "public_registry"
    docs_url = "https://developer.service.hmrc.gov.uk/api-documentation/docs/api/service/vat-registered-companies-api/2.0"
    signup_url = "https://developer.service.hmrc.gov.uk/developer/registration"
    cost = "Free (HMRC developer application, client credentials)"
    capabilities = ["vat_check"]
    fields = [ConfigField("client_id", "Client ID"), ConfigField("client_secret", "Client secret", secret=True)]
    BASE = "https://api.service.hmrc.gov.uk"

    def _token(self):
        ck = f"hmrc:{self.org_id}"
        tok = cache.get_json(ck)
        if tok:
            return tok
        data, _ = self.request("POST", f"{self.BASE}/oauth/token", data={"grant_type": "client_credentials", "client_id": self.config["client_id"], "client_secret": self.config["client_secret"]})
        tok = data.get("access_token")
        cache.set_json(ck, tok, int(data.get("expires_in", 14400)) - 120)
        return tok

    def check(self, vrn: str) -> Result:
        self.ensure_configured()
        vrn = "".join(ch for ch in vrn.upper() if ch.isalnum()).removeprefix("GB")
        try:
            data, _ = self.request("GET", f"{self.BASE}/organisations/vat/check-vat-number/lookup/{vrn}", headers={"Authorization": f"Bearer {self._token()}", "Accept": "application/vnd.hmrc.2.0+json"})
        except ProviderError as e:
            if e.code == "not_found":
                return Result({"valid": False, "vrn": vrn}, self.provenance())
            raise
        t = data.get("target") or {}
        a = t.get("address") or {}
        return Result({"valid": True, "vrn": t.get("vatNumber", vrn), "name": t.get("name"), "address": ", ".join(v for k, v in sorted(a.items()) if v),
                       "processed": data.get("processingDate")}, self.provenance())

    def health_check(self):
        self.ensure_configured()
        self._token()
        return {"ok": True}


class VIESProvider(Provider):
    key = "vies"
    name = "EU VIES VAT check"
    category = "registry"
    description = "Validates EU VAT numbers against member-state registers (name and address where the state shares them)."
    classification = "public_registry"
    docs_url = "https://ec.europa.eu/taxation_customs/vies/"
    cost = "Free"
    capabilities = ["vat_check"]
    requires_config = False

    def check(self, country: str, number: str) -> Result:
        num = "".join(ch for ch in number.upper() if ch.isalnum())
        if num[:2].isalpha():
            country, num = num[:2], num[2:]
        data, cached = self.request("POST", "https://ec.europa.eu/taxation_customs/vies/rest-api/check-vat-number", json_body={"countryCode": country.upper(), "vatNumber": num}, cache_ttl=3600)
        return Result({"valid": bool(data.get("valid")), "country": country.upper(), "number": num, "name": data.get("name"), "address": data.get("address"),
                       "request_date": data.get("requestDate")}, self.provenance(cached))

    def health_check(self):
        return {"ok": True}


class TradeTariffProvider(Provider):
    key = "trade_tariff"
    name = "UK Trade Tariff"
    category = "finance"
    description = "UK commodity codes and import duty rates (third-country duty) for landed-cost calculations."
    classification = "official_api"
    docs_url = "https://api.trade-tariff.service.gov.uk/"
    cost = "Free"
    capabilities = ["commodity_search", "duty_rates"]
    requires_config = False
    BASE = "https://www.trade-tariff.service.gov.uk/api/v2"

    def search(self, q: str) -> Result:
        data, cached = self.request("GET", f"{self.BASE}/search", params={"q": q}, cache_ttl=86400)
        d = data.get("data") or {}
        attrs = d.get("attributes") or {}
        results = []
        for grp in ("goods_nomenclature_match", "reference_match"):
            m = attrs.get(grp) or {}
            for kind in ("commodities", "headings", "chapters"):
                for it in m.get(kind, []) or []:
                    src = it.get("_source", it)
                    results.append({"code": src.get("goods_nomenclature_item_id"), "description": src.get("description") or src.get("title"), "kind": kind[:-1]})
        if attrs.get("type") == "exact_search" and attrs.get("entry"):
            e = attrs["entry"]
            results.insert(0, {"code": e.get("id"), "description": e.get("endpoint"), "kind": "exact"})
        return Result(results[:25], self.provenance(cached))

    def commodity(self, code: str) -> Result:
        code = "".join(ch for ch in code if ch.isdigit()).ljust(10, "0")[:10]
        data, cached = self.request("GET", f"{self.BASE}/commodities/{code}", cache_ttl=86400)
        attrs = (data.get("data") or {}).get("attributes") or {}
        duty = None
        inc = {i["id"]: i for i in data.get("included", [])}
        for m in data.get("included", []):
            if m.get("type") == "measure" and (m.get("attributes") or {}).get("measure_type_id") in ("103", "105"):
                dexp = (m.get("relationships") or {}).get("duty_expression", {}).get("data") or {}
                de = inc.get(dexp.get("id"), {}).get("attributes", {})
                duty = de.get("base") or de.get("formatted_base")
                break
        return Result({"code": code, "description": attrs.get("formatted_description") or attrs.get("description"), "third_country_duty": duty,
                       "url": f"https://www.trade-tariff.service.gov.uk/commodities/{code}"}, self.provenance(cached))

    def health_check(self):
        return {"ok": True}


class FXProvider(Provider):
    key = "fx"
    name = "Exchange rates (ECB via Frankfurter)"
    category = "finance"
    description = "Daily European Central Bank reference rates for multi-currency supplier comparison."
    classification = "official_api"
    docs_url = "https://frankfurter.dev/"
    cost = "Free"
    capabilities = ["fx_rates"]
    requires_config = False

    def rates(self, base: str = "GBP") -> Result:
        data, cached = self.request("GET", "https://api.frankfurter.dev/v1/latest", params={"base": base.upper()}, cache_ttl=21600)
        r = dict(data.get("rates") or {})
        r[base.upper()] = 1.0
        return Result({"base": base.upper(), "date": data.get("date"), "rates": r}, self.provenance(cached, note=f"ECB reference rates {data.get('date')}"))

    def health_check(self):
        return {"ok": True}


class BraveSearchProvider(Provider):
    key = "brave_search"
    name = "Brave Search API"
    category = "search"
    description = "Web search used to find official brand websites, distributor locators, wholesaler and manufacturer pages. Every result keeps its URL as the evidence source."
    classification = "licensed"
    docs_url = "https://api-dashboard.search.brave.com/app/documentation/web-search/get-started"
    signup_url = "https://api-dashboard.search.brave.com/register"
    cost = "Free tier, then paid per 1,000 queries"
    capabilities = ["web_search"]
    fields = [ConfigField("api_key", "Subscription token", secret=True)]
    rate_limit = (50, 60)

    def search(self, q: str, country: str = "GB", count: int = 10) -> Result:
        self.ensure_configured()
        data, cached = self.request("GET", "https://api.search.brave.com/res/v1/web/search", params={"q": q, "country": country.lower(), "count": count},
                                    headers={"X-Subscription-Token": self.config["api_key"], "Accept": "application/json"}, cache_ttl=86400)
        results = [{"title": r.get("title"), "url": r.get("url"), "snippet": r.get("description"), "age": r.get("age")} for r in (data.get("web") or {}).get("results", [])]
        return Result(results, self.provenance(cached, note="Web search results; each claim is attributed to its page URL"))

    def health_check(self):
        self.search("amazon seller")
        return {"ok": True}
