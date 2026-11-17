"""Amazon Supplier & Invoice Compliance Checker: upload, extraction, assessment, policy settings."""
import os
from datetime import date, datetime, timezone

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import Response
from pydantic import BaseModel
from sqlalchemy import select

from .. import storage
from ..audit import audit_ctx
from ..config import get_settings
from ..deps import Ctx, get_ctx, need_analyst, require
from ..models import Document, InvoiceAssessment, Product, Supplier
from ..providers import ProviderError, get_provider
from ..services import invoices as inv
from ..services.suppliers import classify_and_score

router = APIRouter(tags=["invoices"])
ALLOWED = {"application/pdf": ".pdf", "image/png": ".png", "image/jpeg": ".jpg"}


@router.post("/documents")
async def upload(ctx: Ctx = Depends(need_analyst), file: UploadFile = File(...), kind: str = Form("invoice"), supplier_id: int | None = Form(None)):
    data = await file.read()
    if len(data) > get_settings().max_upload_mb * 1024 * 1024:
        raise HTTPException(400, f"Files must be under {get_settings().max_upload_mb} MB.")
    mime = file.content_type or ""
    if data[:4] == b"%PDF":
        mime = "application/pdf"
    elif data[:8] == b"\x89PNG\r\n\x1a\n":
        mime = "image/png"
    elif data[:3] == b"\xff\xd8\xff":
        mime = "image/jpeg"
    if mime not in ALLOWED:
        raise HTTPException(400, "Upload a PDF, PNG or JPEG.")
    if supplier_id:
        s = ctx.db.get(Supplier, supplier_id)
        if not s or s.org_id != ctx.org_id:
            raise HTTPException(404, "Supplier not found")
    text, pages, meta = inv.pdf_text(data) if mime == "application/pdf" else ("", 1, {})
    key = storage.put(ctx.org_id, data, ALLOWED[mime])
    d = Document(org_id=ctx.org_id, supplier_id=supplier_id, kind=kind, filename=os.path.basename(file.filename or "document")[:250], storage_key=key, sha256=inv.sha256(data),
                 mime=mime, size_bytes=len(data), pages=pages, text=text[:200000], uploaded_by=ctx.user.id)
    ctx.db.add(d)
    ctx.db.flush()
    audit_ctx(ctx, "document.uploaded", "document", d.id, {"kind": kind, "supplier_id": supplier_id, "sha256": d.sha256[:16]})
    ctx.db.commit()
    return {"id": d.id, "pages": pages, "has_text": bool(text.strip()), "meta": {k: v for k, v in meta.items() if not k.startswith("_") or k == "_incremental_updates"}}


@router.get("/documents")
def documents(ctx: Ctx = Depends(get_ctx)):
    rows = ctx.db.scalars(select(Document).where(Document.org_id == ctx.org_id).order_by(Document.uploaded_at.desc()).limit(200)).all()
    out = []
    for d in rows:
        a = ctx.db.scalars(select(InvoiceAssessment).where(InvoiceAssessment.document_id == d.id).order_by(InvoiceAssessment.created_at.desc())).first()
        s = ctx.db.get(Supplier, d.supplier_id) if d.supplier_id else None
        out.append({"id": d.id, "filename": d.filename, "kind": d.kind, "pages": d.pages, "size_bytes": d.size_bytes, "uploaded_at": d.uploaded_at,
                    "supplier": {"id": s.id, "name": s.trading_name or s.legal_name} if s else None,
                    "assessment": {"id": a.id, "risk_level": a.risk_level, "created_at": a.created_at, "counts": (a.extracted or {}).get("_counts")} if a else None})
    return out


@router.get("/documents/{did}/file")
def document_file(did: int, ctx: Ctx = Depends(get_ctx)):
    d = ctx.db.get(Document, did)
    if not d or d.org_id != ctx.org_id:
        raise HTTPException(404, "Document not found")
    return Response(storage.get(d.storage_key), media_type=d.mime, headers={"content-disposition": f'inline; filename="{d.filename}"', "cache-control": "private, max-age=300"})


@router.delete("/documents/{did}")
def delete_document(did: int, ctx: Ctx = Depends(need_analyst)):
    d = ctx.db.get(Document, did)
    if d and d.org_id == ctx.org_id:
        storage.delete(d.storage_key)
        ctx.db.delete(d)
        audit_ctx(ctx, "document.deleted", "document", did)
        ctx.db.commit()
    return {"ok": True}


class AssessIn(BaseModel):
    supplier_id: int | None = None
    brand: str = ""
    product_id: int | None = None
    use_ai: bool = True
    corrections: dict = {}


@router.post("/documents/{did}/assess")
def assess(did: int, body: AssessIn, ctx: Ctx = Depends(need_analyst)):
    d = ctx.db.get(Document, did)
    if not d or d.org_id != ctx.org_id:
        raise HTTPException(404, "Document not found")
    supplier_id = body.supplier_id or d.supplier_id
    s = ctx.db.get(Supplier, supplier_id) if supplier_id else None
    if s and s.org_id != ctx.org_id:
        raise HTTPException(404, "Supplier not found")
    if supplier_id and not d.supplier_id:
        d.supplier_id = supplier_id
    raw = storage.get(d.storage_key)
    _, _, meta = inv.pdf_text(raw) if d.mime == "application/pdf" else ("", 1, {})
    extracted, method, note = inv.extract_rules(d.text), "rules", ""
    ai = get_provider(ctx.db, ctx.org_id, "anthropic")
    if body.use_ai and ai.configured() and d.mime == "application/pdf":
        try:
            r = ai.json(system="Extract fields from a supplier invoice exactly as printed. Leave a field empty when it is not on the document. Do not correct or infer values. List any visibly crossed-out, covered or overwritten areas.",
                        prompt="Extract the invoice fields.", schema=inv.EXTRACT_SCHEMA, pdf_bytes=raw, effort="low")
            extracted, method = r.data, "ai"
        except ProviderError as e:
            note = f"AI extraction unavailable ({e.message}); used rule-based extraction."
    elif not d.text.strip():
        note = "This file has no text layer. Connect Claude for scanned-document extraction, or correct the fields by hand."
    if body.corrections:
        extracted = {**extracted, **body.corrections}
        method = method + "+user"
    prod = ctx.db.get(Product, body.product_id) if body.product_id else None
    seller_name = (ctx.org.settings or {}).get("legal_name", "")
    res = inv.assess(ctx.db, ctx.org, d, extracted, meta, supplier=s, brand=body.brand or (prod.brand_name if prod else ""), seller_legal_name=seller_name,
                     expected_products=[prod.title] if prod else None)
    rv = res["policy"].get("reviewed_at")
    a = InvoiceAssessment(org_id=ctx.org_id, document_id=d.id, supplier_id=supplier_id, extracted={**extracted, "_counts": res["counts"]}, extraction_method=method, checks=res["checks"],
                          risk_level=res["risk_level"], summary=res["summary"], policy_source_url=res["policy"]["url"], policy_version=res["policy"]["version"],
                          policy_retrieved_at=datetime.fromisoformat(rv) if rv else None)
    ctx.db.add(a)
    ctx.db.flush()
    if s:
        classify_and_score(ctx.db, s)
    audit_ctx(ctx, "invoice.assessed", "document", did, {"risk": res["risk_level"], "supplier_id": supplier_id})
    ctx.db.commit()
    return {**res, "id": a.id, "extracted": extracted, "extraction_method": method, "note": note, "document": {"id": d.id, "filename": d.filename, "mime": d.mime, "pages": d.pages},
            "supplier": {"id": s.id, "name": s.legal_name, "status": s.status} if s else None}


@router.get("/assessments/{aid}")
def get_assessment(aid: int, ctx: Ctx = Depends(get_ctx)):
    a = ctx.db.get(InvoiceAssessment, aid)
    if not a or a.org_id != ctx.org_id:
        raise HTTPException(404, "Assessment not found")
    d = ctx.db.get(Document, a.document_id)
    s = ctx.db.get(Supplier, a.supplier_id) if a.supplier_id else None
    ex = {k: v for k, v in (a.extracted or {}).items() if k != "_counts"}
    return {"id": a.id, "risk_level": a.risk_level, "summary": a.summary, "checks": a.checks, "extracted": ex, "extraction_method": a.extraction_method,
            "counts": (a.extracted or {}).get("_counts"), "created_at": a.created_at,
            "policy": {"version": a.policy_version, "url": a.policy_source_url, "reviewed_at": a.policy_retrieved_at},
            "document": {"id": d.id, "filename": d.filename, "mime": d.mime, "pages": d.pages}, "supplier": {"id": s.id, "name": s.legal_name, "status": s.status} if s else None,
            "disclaimer": "Documentation assessment only. Amazon decides what it accepts based on its current requirements, the category and your account. This is not a guarantee of approval."}


class PolicyIn(BaseModel):
    url: str
    reviewed_at: date
    max_age_days: int = 365
    min_units: int = 10
    summary: str = ""
    legal_name: str = ""


@router.get("/compliance/policy")
def get_policy(ctx: Ctx = Depends(get_ctx)):
    pol = {**inv.DEFAULT_POLICY, **((ctx.org.settings or {}).get("invoice_policy") or {})}
    rv = pol.get("reviewed_at")
    stale = (date.today() - date.fromisoformat(rv)).days > 90 if rv else True
    return {**pol, "checklist_version": inv.CHECKLIST_VERSION, "legal_name": (ctx.org.settings or {}).get("legal_name", ""), "stale": stale}


@router.put("/compliance/policy")
def set_policy(body: PolicyIn, ctx: Ctx = Depends(require("admin"))):
    st = dict(ctx.org.settings or {})
    st["invoice_policy"] = {"url": body.url, "reviewed_at": body.reviewed_at.isoformat(), "max_age_days": body.max_age_days, "min_units": body.min_units,
                            "summary": body.summary or inv.DEFAULT_POLICY["summary"]}
    if body.legal_name:
        st["legal_name"] = body.legal_name
    ctx.org.settings = st
    audit_ctx(ctx, "compliance.policy_updated", "organisation", ctx.org_id, {"url": body.url, "reviewed_at": body.reviewed_at.isoformat()})
    ctx.db.commit()
    return get_policy(ctx)
