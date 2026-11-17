"""Amazon Supplier & Invoice Compliance Checker — documentation assessment.

This is a documentation assessment against a checklist of commonly published Amazon invoice
requirements, plus supplier identity checks and document-integrity indicators. It is never a
prediction of Amazon's decision. The policy source URL and the date it was last reviewed are
recorded with every assessment (organisation setting `invoice_policy`).
"""
from __future__ import annotations

import hashlib
import io
import re
from datetime import date, datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from ..models import Document, InvoiceAssessment, Organisation, Supplier
from .suppliers import name_match

CHECKLIST_VERSION = "Kestrel invoice checklist v1 (Nov 2026)"
DEFAULT_POLICY = {
    "url": "",
    "reviewed_at": None,
    "max_age_days": 365,
    "min_units": 10,
    "summary": "Amazon asks for invoices from a manufacturer or distributor, dated within the last 365 days (some categories 180), showing supplier and buyer "
               "names and addresses, product descriptions that match the listing, and quantities (often at least 10 units). Pro-formas, quotes, receipts "
               "and order confirmations are typically not accepted. Requirements vary by category and account; check Seller Central for the current version.",
}

DATE_PATTERNS = [r"(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})", r"(\d{4})-(\d{2})-(\d{2})", r"(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+(\d{4})"]
MONTHS = {m: i + 1 for i, m in enumerate("jan feb mar apr may jun jul aug sep oct nov dec".split())}


def pdf_text(data: bytes) -> tuple[str, int, dict]:
    from pypdf import PdfReader
    try:
        r = PdfReader(io.BytesIO(data))
        text = "\n".join((p.extract_text() or "") for p in r.pages)
        meta = {k.strip("/"): str(v) for k, v in (r.metadata or {}).items()}
        startxrefs = data.count(b"startxref")
        meta["_incremental_updates"] = max(0, startxrefs - 1)
        meta["_pages"] = len(r.pages)
        return text, len(r.pages), meta
    except Exception as e:  # noqa: BLE001
        return "", 0, {"_error": str(e)[:200]}


def _parse_date(s: str) -> date | None:
    s = s.lower()
    for pat in DATE_PATTERNS:
        for m in re.finditer(pat, s):
            g = m.groups()
            try:
                if pat.startswith(r"(\d{4})"):
                    return date(int(g[0]), int(g[1]), int(g[2]))
                if g[1].isalpha():
                    return date(int(g[2]), MONTHS[g[1][:3]], int(g[0]))
                d, mth, y = int(g[0]), int(g[1]), int(g[2])
                return date(y, mth, d) if mth <= 12 else date(y, d, mth)
            except ValueError:
                continue
    return None


def extract_rules(text: str) -> dict:
    """Best-effort deterministic extraction; AI extraction improves this when connected."""
    t = text or ""
    low = t.lower()
    inv_date = None
    m = re.search(r"(invoice|tax point|date)[^\n]{0,25}?[:\s]([^\n]{4,40})", t, re.I)
    if m:
        inv_date = _parse_date(m.group(2))
    inv_date = inv_date or _parse_date(t[:1500])
    num = re.search(r"invoice\s*(?:no\.?|number|#)\s*[:#]?\s*([A-Z0-9][A-Z0-9/-]{2,})", t, re.I)
    vats = re.findall(r"\b(GB\s?\d{3}\s?\d{4}\s?\d{2}|GB\d{9}|[A-Z]{2}\d{8,12})\b", t)
    company_no = re.search(r"(?:company|registration|reg\.?)\s*(?:no\.?|number)\s*[:#]?\s*([A-Z]{0,2}\d{6,8})", t, re.I)
    emails = sorted(set(re.findall(r"[\w.+-]+@[\w-]+\.[\w.-]+", t)))
    phones = sorted(set(re.findall(r"(?:\+44|0)\s?\d{2,4}[\s-]?\d{3,4}[\s-]?\d{3,4}", t)))
    qty = [int(x) for x in re.findall(r"(?:qty|quantity)[^\d\n]{0,12}(\d{1,6})", t, re.I)]
    lines = []
    for ln in t.splitlines():
        mm = re.match(r"\s*(.{6,90}?)\s+(\d{1,6})\s+(?:x\s*)?[£$€]?\s?(\d+[.,]\d{2})\s+[£$€]?\s?(\d+[.,]?\d*[.,]\d{2})\s*$", ln)
        if mm:
            lines.append({"description": mm.group(1).strip(), "quantity": int(mm.group(2)), "unit_price": float(mm.group(3).replace(",", ".")), "line_total": float(mm.group(4).replace(",", "").replace(" ", ""))})
    total = re.search(r"(?:grand\s+)?total(?:\s+due|\s+amount)?\s*[:£$€\s]*([\d,]+\.\d{2})", t, re.I)
    vat_amt = re.search(r"\bvat\b[^\n]{0,20}?([\d,]+\.\d{2})", t, re.I)
    sub = re.search(r"sub\s*-?\s*total\s*[:£$€\s]*([\d,]+\.\d{2})", t, re.I)
    blocks = [b.strip() for b in re.split(r"\n\s*\n", t) if b.strip()]
    bill_to = next((b for b in blocks if re.search(r"bill(ed)?\s*to|invoice\s*to|customer|sold\s*to", b, re.I)), "")
    kind = "proforma" if "pro forma" in low or "proforma" in low or "pro-forma" in low else "quote" if re.search(r"\bquot(e|ation)\b", low) and "invoice" not in low else \
        "receipt" if "receipt" in low and "invoice" not in low else "order_confirmation" if "order confirmation" in low else "invoice" if "invoice" in low else "unknown"
    return {"document_type": kind, "invoice_number": num.group(1) if num else "", "invoice_date": inv_date.isoformat() if inv_date else "",
            "seller_name": blocks[0].splitlines()[0][:120] if blocks else "", "seller_address": "", "seller_vat": vats[0].replace(" ", "") if vats else "",
            "seller_company_number": company_no.group(1) if company_no else "", "seller_email": emails[0] if emails else "", "seller_phone": phones[0] if phones else "",
            "buyer_name": re.sub(r"(?i)(bill(ed)?|invoice|sold)\s*to:?", "", bill_to.splitlines()[0] if bill_to else "").strip()[:120] if bill_to else "",
            "buyer_address": " ".join(bill_to.splitlines()[1:4]) if bill_to else "", "line_items": lines, "total_quantity": sum(l["quantity"] for l in lines) or (sum(qty) if qty else None),
            "subtotal": float(sub.group(1).replace(",", "")) if sub else None, "vat_amount": float(vat_amt.group(1).replace(",", "")) if vat_amt else None,
            "total": float(total.group(1).replace(",", "")) if total else None, "currency": "GBP" if "£" in t else "EUR" if "€" in t else "USD" if "$" in t else ""}


EXTRACT_SCHEMA = {
    "type": "object", "additionalProperties": False,
    "required": ["document_type", "invoice_number", "invoice_date", "seller_name", "seller_address", "seller_vat", "seller_company_number", "seller_email", "seller_phone", "seller_website",
                 "buyer_name", "buyer_address", "line_items", "total_quantity", "subtotal", "vat_amount", "total", "currency", "visible_alterations"],
    "properties": {
        "document_type": {"type": "string", "enum": ["invoice", "proforma", "quote", "receipt", "order_confirmation", "credit_note", "unknown"]},
        "invoice_number": {"type": "string"}, "invoice_date": {"type": "string", "description": "YYYY-MM-DD or empty"},
        "seller_name": {"type": "string"}, "seller_address": {"type": "string"}, "seller_vat": {"type": "string"}, "seller_company_number": {"type": "string"},
        "seller_email": {"type": "string"}, "seller_phone": {"type": "string"}, "seller_website": {"type": "string"},
        "buyer_name": {"type": "string"}, "buyer_address": {"type": "string"},
        "line_items": {"type": "array", "items": {"type": "object", "additionalProperties": False, "required": ["description", "quantity", "unit_price", "line_total", "brand", "identifiers"],
                                                  "properties": {"description": {"type": "string"}, "quantity": {"type": ["number", "null"]}, "unit_price": {"type": ["number", "null"]},
                                                                 "line_total": {"type": ["number", "null"]}, "brand": {"type": "string"}, "identifiers": {"type": "string"}}}},
        "total_quantity": {"type": ["number", "null"]}, "subtotal": {"type": ["number", "null"]}, "vat_amount": {"type": ["number", "null"]}, "total": {"type": ["number", "null"]},
        "currency": {"type": "string"}, "visible_alterations": {"type": "array", "items": {"type": "string"}, "description": "crossed-out, covered or overwritten areas visible in the document"},
    },
}


def assess(db: Session, org: Organisation, doc: Document, extracted: dict, meta: dict, *, supplier: Supplier | None, brand: str = "", seller_legal_name: str = "",
           expected_products: list[str] | None = None) -> dict:
    policy = {**DEFAULT_POLICY, **((org.settings or {}).get("invoice_policy") or {})}
    checks: list[dict] = []

    def add(cid, label, status, detail, group):
        checks.append({"id": cid, "label": label, "status": status, "detail": detail, "group": group})

    # document type
    dt = extracted.get("document_type") or "unknown"
    add("doc_type", "Document is an invoice", "pass" if dt == "invoice" else "fail" if dt in ("proforma", "quote", "receipt", "order_confirmation", "credit_note") else "warn",
        {"invoice": "Labelled as an invoice.", "proforma": "This is a pro-forma, which is a request for payment, not an invoice.", "quote": "This is a quotation, not an invoice.",
         "receipt": "This is a receipt; Amazon generally asks for a supplier invoice.", "order_confirmation": "Order confirmations are generally not accepted."}.get(dt, "Couldn't confirm the document type."), "Document")
    # date
    d = None
    try:
        d = date.fromisoformat(extracted.get("invoice_date") or "")
    except ValueError:
        pass
    if d:
        age = (date.today() - d).days
        maxd = int(policy["max_age_days"])
        add("date", f"Dated within {maxd} days", "pass" if 0 <= age <= maxd else "fail", f"Invoice dated {d.isoformat()} ({age} days old)." if age >= 0 else f"Invoice is dated in the future ({d.isoformat()}).", "Document")
    else:
        add("date", "Invoice date present", "fail", "No invoice date found.", "Document")
    add("number", "Invoice number", "pass" if extracted.get("invoice_number") else "warn", extracted.get("invoice_number") or "No invoice number found.", "Document")
    # seller
    sn = extracted.get("seller_name") or ""
    add("seller_name", "Supplier name shown", "pass" if sn else "fail", sn or "No supplier name found.", "Supplier")
    add("seller_address", "Supplier address shown", "pass" if extracted.get("seller_address") else "warn", extracted.get("seller_address") or "No supplier address found.", "Supplier")
    contact = [x for x in (extracted.get("seller_phone"), extracted.get("seller_email"), extracted.get("seller_website")) if x]
    add("seller_contact", "Supplier contact details", "pass" if contact else "warn", ", ".join(contact) or "No phone, email or website on the invoice.", "Supplier")
    if supplier:
        m = name_match(sn, supplier.legal_name) if sn else 0
        add("seller_match", "Supplier matches your supplier record", "pass" if m >= 0.6 else "fail" if sn else "warn", f"Invoice: “{sn}” · Record: “{supplier.legal_name}” (match {m:.0%})", "Supplier")
        reg = supplier.registry_data or {}
        if reg:
            add("registry", "Supplier verified on a public register", "pass" if (reg.get("status") or "").lower() == "active" else "fail",
                f"{reg.get('name')} ({reg.get('number')}), status {reg.get('status')}.", "Supplier")
        else:
            add("registry", "Supplier verified on a public register", "warn", "Not verified yet. Run verification on the supplier profile.", "Supplier")
        inv_vat = (extracted.get("seller_vat") or "").replace(" ", "").upper()
        if inv_vat and supplier.vat_number and inv_vat.replace("GB", "") != supplier.vat_number.replace(" ", "").upper().replace("GB", ""):
            add("vat_match", "VAT number matches supplier record", "fail", f"Invoice shows {inv_vat}; supplier record has {supplier.vat_number}.", "Supplier")
        elif supplier.vat_valid is not None:
            add("vat_valid", "VAT number valid", "pass" if supplier.vat_valid else "fail", "Validated against the VAT register." if supplier.vat_valid else "Did not validate on the VAT register.", "Supplier")
        if supplier.supplier_type in ("retailer",) or re.search(r"\b(amazon|ebay|argos|tesco|costco|wish|aliexpress|temu)\b", sn.lower()):
            add("retail_source", "Supplier is not a retailer", "fail", "Invoices from retailers or marketplaces are generally not accepted as proof of authentic sourcing.", "Supplier")
        if brand:
            auth_ok = supplier.status in ("official_brand_owner", "verified_authorised_distributor", "manufacturer")
            add("brand_relation", f"Evidence of a relationship with {brand}", "pass" if auth_ok else "warn",
                "Supplier status: " + supplier.status.replace("_", " ") + ("" if auth_ok else ". Record brand confirmation or a brand distributor listing as evidence."), "Supplier")
    else:
        add("supplier_link", "Linked to a supplier record", "warn", "Link this document to a supplier to run identity checks.", "Supplier")
    # buyer
    bn = extracted.get("buyer_name") or ""
    add("buyer_name", "Your business name shown as buyer", "pass" if bn and (not seller_legal_name or name_match(bn, seller_legal_name) >= 0.6) else "fail" if not bn else "warn",
        (f"Buyer “{bn}”" + (f" vs your legal name “{seller_legal_name}”" if seller_legal_name else "") + ".") if bn else "No buyer name found.", "Buyer")
    add("buyer_address", "Your business address shown", "pass" if extracted.get("buyer_address") else "warn", extracted.get("buyer_address") or "No buyer address found.", "Buyer")
    if not seller_legal_name:
        add("buyer_setting", "Your Seller Central legal name is set", "warn", "Add your legal business name (as in Seller Central) in Settings → Organisation so buyer details can be matched.", "Buyer")
    # products & quantities
    items = extracted.get("line_items") or []
    add("items", "Products clearly described", "pass" if items and all(len((i.get("description") or "")) >= 6 for i in items) else "fail" if not items else "warn",
        f"{len(items)} line item(s)." if items else "No product lines found.", "Products")
    tq = extracted.get("total_quantity") or sum((i.get("quantity") or 0) for i in items)
    mu = int(policy["min_units"])
    add("quantity", f"At least {mu} units", "pass" if tq and tq >= mu else "warn" if tq else "fail", f"{int(tq)} units in total." if tq else "No quantities found.", "Products")
    if brand:
        hit = any(brand.lower() in f"{i.get('description', '')} {i.get('brand', '')}".lower() for i in items)
        add("brand_named", f"{brand} named on the invoice", "pass" if hit else "warn", "Brand appears in the product lines." if hit else "The brand isn't named in the product lines.", "Products")
    if expected_products:
        words = {w for p in expected_products for w in re.findall(r"[a-z0-9]{4,}", p.lower())}
        hits = sum(1 for i in items if words & set(re.findall(r"[a-z0-9]{4,}", (i.get("description") or "").lower())))
        add("matches_listing", "Products match the listing you'll sell", "pass" if hits else "warn", f"{hits} line(s) share terms with the selected product." if items else "No lines to match.", "Products")
    # arithmetic consistency
    if items and any(i.get("line_total") for i in items):
        s = round(sum(i.get("line_total") or 0 for i in items), 2)
        sub = extracted.get("subtotal") or extracted.get("total")
        ok = sub is not None and abs(s - sub) <= max(0.05, 0.005 * sub)
        bad = [i for i in items if i.get("quantity") and i.get("unit_price") and i.get("line_total") and abs(i["quantity"] * i["unit_price"] - i["line_total"]) > 0.05]
        add("arithmetic", "Totals add up", "pass" if ok and not bad else "fail" if bad else "warn",
            ("Line totals match the subtotal." if ok else f"Lines sum to {s}, invoice shows {sub}.") + (f" {len(bad)} line(s) where quantity × price ≠ line total." if bad else ""), "Integrity")
    # integrity indicators
    upd = meta.get("_incremental_updates", 0)
    prod = (meta.get("Producer") or "") + " " + (meta.get("Creator") or "")
    edit_tools = re.search(r"(photoshop|illustrator|gimp|canva|pdf\s*(escape|filler)|sejda|smallpdf|ilovepdf|pdf-xchange editor|foxit phantom|acrobat (pro|dc))", prod.lower())
    flags = []
    if upd:
        flags.append(f"{upd} incremental save(s) after creation (the file was modified)")
    if edit_tools:
        flags.append(f"produced or edited with {edit_tools.group(0)}")
    cd, md = meta.get("CreationDate"), meta.get("ModDate")
    if cd and md and cd[:16] != md[:16]:
        flags.append("modified after it was created")
    for alt in extracted.get("visible_alterations") or []:
        flags.append(f"visible alteration: {alt}")
    add("integrity", "No signs of editing", "warn" if flags else "pass", "; ".join(flags) + ". These are indicators to check with the supplier, not proof of tampering." if flags else "No editing indicators in the file metadata.", "Integrity")
    dup = db.scalar(select(Document.id).where(Document.org_id == org.id, Document.sha256 == doc.sha256, Document.id != doc.id))
    if dup:
        add("duplicate", "Not previously uploaded", "warn", "The same file was uploaded before (document #%d)." % dup, "Integrity")
    fails = [c for c in checks if c["status"] == "fail"]
    warns = [c for c in checks if c["status"] == "warn"]
    risk = "high" if len(fails) >= 2 or any(c["id"] in ("doc_type", "retail_source", "seller_match", "vat_match") for c in fails) else "medium" if fails or len(warns) >= 3 else "low"
    summary = {"low": "The document shows what Amazon commonly asks for, and the supplier checks found no problems.",
               "medium": "Some information is missing or unconfirmed. Resolve the flagged items before submitting this invoice.",
               "high": "Important problems found. This document is unlikely to meet Amazon's published requirements as it stands."}[risk]
    return {"risk_level": risk, "summary": summary, "checks": checks, "counts": {"pass": sum(c["status"] == "pass" for c in checks), "warn": len(warns), "fail": len(fails)},
            "policy": {"version": CHECKLIST_VERSION, "url": policy["url"], "reviewed_at": policy["reviewed_at"], "summary": policy["summary"]},
            "disclaimer": "Documentation assessment only. Amazon decides what it accepts based on its current requirements, the category and your account. This is not a guarantee of approval."}


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()
