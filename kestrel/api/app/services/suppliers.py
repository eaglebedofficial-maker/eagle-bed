"""Supplier verification, scoring, status classification and discovery.

Rules that never bend:
- A supplier is never "authorised" because it sells a brand. Only evidence of type `brand_locator`
  (listed on the brand's own distributor page) or `brand_confirmation` (written confirmation from the
  brand) supports "verified authorised distributor".
- A high supplier score is not authorisation and not an Amazon approval.
"""
from __future__ import annotations

import re
from datetime import date, datetime, timezone
from urllib.parse import urlparse

import httpx
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..models import Brand, BrandAuthorisation, InvoiceAssessment, Quotation, Supplier, SupplierEvidence
from ..providers import ProviderError, get_provider

EU = {"AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE"}


def norm(s: str) -> str:
    s = (s or "").lower()
    s = re.sub(r"\b(limited|ltd|plc|llp|llc|inc|gmbh|sarl|s\.?r\.?l|s\.?a\.?s?|bv|b\.v\.|co|company|the|uk|group)\b", " ", s)
    return re.sub(r"[^a-z0-9]+", " ", s).strip()


def name_match(a: str, b: str) -> float:
    ta, tb = set(norm(a).split()), set(norm(b).split())
    if not ta or not tb:
        return 0.0
    return len(ta & tb) / max(len(ta), len(tb))


def add_evidence(db: Session, s: Supplier, kind: str, summary: str, *, url="", source="", classification="user", confidence="medium", supports_auth=False, raw=None):
    ev = SupplierEvidence(supplier_id=s.id, kind=kind, summary=summary, source_url=url, source_name=source, classification=classification,
                          confidence=confidence, supports_authorisation=supports_auth, raw=raw or {})
    db.add(ev)
    return ev


def verify_registry(db: Session, s: Supplier) -> dict:
    """Companies House (UK). Other countries: record that no registry integration exists."""
    out = {"registry": None, "vat": None, "notes": []}
    if s.country == "GB":
        ch = get_provider(db, s.org_id, "companies_house")
        if ch.configured():
            try:
                number = s.registration_number
                if not number:
                    hits = ch.search(s.legal_name).data
                    best = max(hits, key=lambda h: name_match(h["name"], s.legal_name), default=None)
                    if best and name_match(best["name"], s.legal_name) >= 0.6:
                        number = best["number"]
                    else:
                        out["notes"].append("No Companies House match for the legal name. Add the company number to verify.")
                if number:
                    prof = ch.profile(number).data
                    s.registration_number, s.registry, s.registry_data, s.registry_checked_at = prof["number"], "companies_house", prof, datetime.now(timezone.utc)
                    if prof.get("created"):
                        s.years_trading = round((date.today() - date.fromisoformat(prof["created"])).days / 365.25, 1)
                    if not s.address and prof.get("address"):
                        s.address = prof["address"]
                    m = name_match(prof["name"], s.legal_name)
                    add_evidence(db, s, "registry", f"Companies House: {prof['name']} ({prof['number']}), status {prof['status']}, incorporated {prof.get('created')}. Name match {m:.0%}.",
                                 url=prof["url"], source="Companies House", classification="public_registry", confidence="high" if m >= 0.8 else "medium", raw=prof)
                    out["registry"] = prof
            except ProviderError as e:
                out["notes"].append(f"Companies House: {e.message}")
        else:
            out["notes"].append("Connect Companies House (free key) to verify UK company details.")
    else:
        out["notes"].append(f"No public-registry integration for {s.country}; verify the company with that country's register and record it as evidence.")
    if s.vat_number:
        vn = s.vat_number.replace(" ", "").upper()
        try:
            if s.country == "GB" or vn.startswith("GB"):
                p = get_provider(db, s.org_id, "hmrc_vat")
                if not p.configured():
                    out["notes"].append("Connect HMRC's VAT check (free) to validate UK VAT numbers.")
                    vr = None
                else:
                    vr = p.check(vn).data
                    src, url = "HMRC VAT register", "https://www.tax.service.gov.uk/check-vat-number/enter-vat-details"
            else:
                vr = get_provider(db, s.org_id, "vies").check(s.country, vn).data
                src, url = "EU VIES", "https://ec.europa.eu/taxation_customs/vies/"
            if vr is not None:
                s.vat_valid, s.vat_data, s.vat_checked_at = vr["valid"], vr, datetime.now(timezone.utc)
                m = name_match(vr.get("name") or "", s.legal_name) if vr.get("name") else None
                add_evidence(db, s, "vat", f"{src}: {vn} is {'VALID' if vr['valid'] else 'NOT VALID'}" + (f", registered to {vr.get('name')} (name match {m:.0%})" if vr.get("name") else ""),
                             url=url, source=src, classification="public_registry", confidence="high" if vr["valid"] else "high", raw=vr)
                out["vat"] = vr
        except ProviderError as e:
            out["notes"].append(f"VAT check: {e.message}")
    return out


def classify_and_score(db: Session, s: Supplier) -> dict:
    ev = db.scalars(select(SupplierEvidence).where(SupplierEvidence.supplier_id == s.id)).all()
    auths = db.scalars(select(BrandAuthorisation).where(BrandAuthorisation.supplier_id == s.id)).all()
    assessments = db.scalars(select(InvoiceAssessment).where(InvoiceAssessment.supplier_id == s.id).order_by(InvoiceAssessment.created_at.desc())).all()
    quotes = db.scalars(select(Quotation).where(Quotation.supplier_id == s.id)).all()
    reg = s.registry_data or {}
    comp, risks = {}, []

    def put(k, label, score, mx, note):
        comp[k] = {"label": label, "score": round(score, 1), "max": mx, "note": note}

    # identity
    if reg:
        active = (reg.get("status") or "").lower() == "active"
        m = name_match(reg.get("name", ""), s.legal_name)
        put("identity", "Company identity", (12 if active else 0) + 8 * m, 20, f"Registry status {reg.get('status')}, name match {m:.0%}")
        if not active:
            risks.append(f"Company status on the register is “{reg.get('status')}”.")
        if m < 0.6:
            risks.append("Legal name differs from the registered name.")
        if reg.get("accounts_overdue") or reg.get("confirmation_overdue"):
            risks.append("Overdue filings at Companies House.")
        if reg.get("has_insolvency_history"):
            risks.append("Insolvency history on the register.")
    else:
        put("identity", "Company identity", 0, 20, "Not verified against a public register")
    # VAT
    if s.vat_valid is True:
        put("vat", "VAT registration", 10, 10, "VAT number valid")
    elif s.vat_valid is False:
        put("vat", "VAT registration", 0, 10, "VAT number not valid")
        risks.append("VAT number did not validate.")
    else:
        put("vat", "VAT registration", 0, 10, "Not checked or not provided")
    # trading history
    yrs = s.years_trading
    put("history", "Trading history", min(10, (yrs or 0) * 2), 10, f"{yrs} years" if yrs is not None else "Unknown")
    if yrs is not None and yrs < 1:
        risks.append("Company is less than a year old.")
    # brand relationship evidence
    strong = [a for a in auths if a.status in ("confirmed_by_brand", "listed_by_brand")] + [e for e in ev if e.supports_authorisation and e.kind in ("brand_locator", "brand_confirmation")]
    claims = [a for a in auths if a.status == "claimed"] + [e for e in ev if e.kind == "website_claim"]
    put("authorisation", "Brand relationship evidence", 15 if strong else 5 if claims else 0, 15,
        "Confirmed by the brand" if strong else "Supplier's own claim only (not proof)" if claims else "No evidence recorded")
    # documentation
    best = next((a for a in assessments), None)
    if best:
        put("documents", "Invoice documentation", {"low": 15, "medium": 8, "high": 0}.get(best.risk_level, 0), 15, f"Latest assessment: {best.risk_level} risk")
        if best.risk_level == "high":
            risks.append("Latest invoice assessment flagged high risk.")
    else:
        put("documents", "Invoice documentation", 0, 15, "No invoice assessed")
    # commercial
    com = 0
    notes = []
    if quotes:
        com += 5
        notes.append(f"{len(quotes)} quotation(s)")
    if s.moq:
        com += 3
    if s.lead_time_days:
        com += 3 if s.lead_time_days <= 45 else 1
    if s.sample_available:
        com += 4
        notes.append("samples available")
    put("commercial", "Commercial terms", min(15, com), 15, ", ".join(notes) or "No terms recorded")
    put("certifications", "Certifications", min(5, len(s.certifications or []) * 2.5), 5, ", ".join(s.certifications or []) or "None recorded")
    rq = [x for x in (s.communication_rating, s.quality_rating) if x]
    put("relationship", "Communication & quality", (sum(rq) / len(rq)) / 5 * 10 if rq else 0, 10, "Your team's ratings" if rq else "Not rated")
    if not s.address:
        risks.append("No business address recorded.")
    if s.website and s.legal_name and not any(t in urlparse(s.website if "://" in s.website else "https://" + s.website).netloc for t in norm(s.legal_name).split()[:2] if len(t) > 3):
        pass
    score = round(sum(c["score"] for c in comp.values()))
    risk = "high" if len(risks) >= 2 or any("did not validate" in r or "Insolvency" in r or "status on the register" in r for r in risks) else "medium" if risks or not reg else "low"
    # status: evidence-based, never inferred
    if s.supplier_type == "brand_owner" and any(e.kind in ("brand_confirmation", "registry") for e in ev) and reg:
        status = "official_brand_owner"
    elif risk == "high":
        status = "high_risk"
    elif strong:
        status = "verified_authorised_distributor"
    elif s.supplier_type in ("manufacturer", "private_label_manufacturer", "oem", "odm") and (reg or any(e.kind in ("trade_record", "document") for e in ev)):
        status = "manufacturer"
    elif reg and (reg.get("status") or "").lower() == "active" and (yrs or 0) >= 2 and s.vat_valid is not False:
        status = "established_wholesaler"
    else:
        status = "unverified"
    s.score, s.score_components, s.risk_level, s.risk_reasons, s.status = score, comp, risk, risks, status
    return {"score": score, "components": comp, "risk_level": risk, "risk_reasons": risks, "status": status,
            "disclaimer": "The supplier score summarises the evidence on file. It is not proof of brand authorisation and does not predict Amazon's decisions."}


# ---------------------------------------------------------------- discovery (web search + AI extraction with citations)
def _fetch_text(url: str, limit=20000) -> str:
    try:
        with httpx.Client(timeout=12, follow_redirects=True, headers={"user-agent": "Kestrel/1.0 supplier-research (+contact via website)"}) as c:
            r = c.get(url)
            if r.status_code != 200 or "text/html" not in r.headers.get("content-type", ""):
                return ""
            html = r.text
    except httpx.HTTPError:
        return ""
    html = re.sub(r"(?is)<(script|style|noscript|svg).*?</\1>", " ", html)
    text = re.sub(r"(?s)<[^>]+>", " ", html)
    return re.sub(r"\s+", " ", text)[:limit]


def discover(db: Session, org_id: int, *, product: str, brand: str = "", region: str = "UK", mode: str = "unbranded", fetch_pages: int = 6) -> dict:
    search = get_provider(db, org_id, "brave_search")
    ai = get_provider(db, org_id, "anthropic")
    country = {"UK": "GB", "EU": "DE", "US": "US", "INTL": "GB"}.get(region, "GB")
    if mode == "branded" and brand:
        queries = [f'"{brand}" official website', f'"{brand}" authorised distributor {region}', f'"{brand}" wholesale trade account {region}', f'"{brand}" where to buy stockists', f'"{brand}" distributor locator']
    else:
        queries = [f"{product} manufacturer", f"{product} wholesale supplier {region}", f"{product} OEM factory", f"{product} private label manufacturer", f"{product} distributor {region}"]
    results, seen = [], set()
    for q in queries:
        try:
            for r in search.search(q, country=country, count=8).data:
                host = urlparse(r["url"]).netloc.lower()
                if host in seen or any(x in host for x in ("amazon.", "ebay.", "wikipedia.", "facebook.", "youtube.", "reddit.", "pinterest.", "instagram.", "tiktok.")):
                    continue
                seen.add(host)
                results.append({**r, "query": q})
        except ProviderError as e:
            if e.code == "not_configured":
                raise
    pages = []
    for r in results[:fetch_pages]:
        t = _fetch_text(r["url"])
        if t:
            pages.append({"url": r["url"], "text": t[:8000]})
    corpus = "\n\n".join(f"[S{i + 1}] {r['title']} — {r['url']}\n{r.get('snippet') or ''}" for i, r in enumerate(results)) + "\n\n" + \
             "\n\n".join(f"[P{i + 1}] PAGE {p['url']}\n{p['text']}" for i, p in enumerate(pages))
    cand = {"type": "object", "additionalProperties": False,
            "required": ["name", "website", "supplier_type", "country", "summary", "source_ids", "claims_authorised", "claim_quote", "is_brand_official_site", "listed_on_brand_site", "emails", "phones", "products", "moq", "certifications"],
            "properties": {"name": {"type": "string"}, "website": {"type": "string"}, "supplier_type": {"type": "string", "enum": ["brand_owner", "manufacturer", "authorised_distributor", "wholesaler", "importer", "trade_supplier", "private_label_manufacturer", "oem", "odm", "retailer", "marketplace", "unknown"]},
                           "country": {"type": "string", "description": "ISO 3166-1 alpha-2 or empty"}, "summary": {"type": "string"}, "source_ids": {"type": "array", "items": {"type": "string"}},
                           "claims_authorised": {"type": "boolean"}, "claim_quote": {"type": "string"}, "is_brand_official_site": {"type": "boolean"},
                           "listed_on_brand_site": {"type": "boolean", "description": "true only if a page on the BRAND's own domain lists this company as a distributor/stockist"},
                           "emails": {"type": "array", "items": {"type": "string"}}, "phones": {"type": "array", "items": {"type": "string"}}, "products": {"type": "array", "items": {"type": "string"}},
                           "moq": {"type": "string"}, "certifications": {"type": "array", "items": {"type": "string"}}}}
    schema = {"type": "object", "additionalProperties": False, "required": ["candidates", "brand_owner", "notes"],
              "properties": {"candidates": {"type": "array", "items": cand},
                             "brand_owner": {"type": "object", "additionalProperties": False, "required": ["company", "website", "distributor_locator_url", "reseller_policy_url", "source_ids"],
                                             "properties": {"company": {"type": "string"}, "website": {"type": "string"}, "distributor_locator_url": {"type": "string"}, "reseller_policy_url": {"type": "string"}, "source_ids": {"type": "array", "items": {"type": "string"}}}},
                             "notes": {"type": "array", "items": {"type": "string"}}}}
    res = ai.json(system=("You extract supplier facts from search results and web pages for a sourcing team. Use only the text provided and cite source ids (S#/P#) for every candidate. "
                          "Do not infer authorisation: claims_authorised is true only when the company's own text says it is authorised/official; listed_on_brand_site is true only when a page on the brand's own domain lists it. "
                          "Contact details must appear verbatim in the sources. Leave fields empty when unknown. Exclude retailers and marketplaces unless they are the brand's official site."),
                  prompt=f"Mode: {mode}. Product: {product}. Brand: {brand or 'n/a'}. Region: {region}.\n\nSOURCES:\n{corpus[:150000]}", schema=schema, effort="medium")
    src_index = {f"S{i + 1}": r["url"] for i, r in enumerate(results)} | {f"P{i + 1}": p["url"] for i, p in enumerate(pages)}
    for c in res.data["candidates"]:
        c["source_urls"] = [src_index[s] for s in c.get("source_ids", []) if s in src_index]
    bo = res.data["brand_owner"]
    bo["source_urls"] = [src_index[s] for s in bo.get("source_ids", []) if s in src_index]
    return {"candidates": [c for c in res.data["candidates"] if c["supplier_type"] not in ("retailer", "marketplace")], "brand_owner": bo, "notes": res.data["notes"],
            "searched": len(results), "pages_read": len(pages), "source": {"provider": "brave_search + anthropic", "classification": "ai", "retrieved_at": datetime.now(timezone.utc).isoformat()},
            "warning": "Discovered from public web pages. Verify each company before relying on it; a website's claim is not proof of authorisation."}
