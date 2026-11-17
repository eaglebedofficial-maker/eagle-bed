"""Supplier finder, profiles, verification, evidence, comparison, brands & authorised distributors."""
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy import func, or_, select

from ..audit import audit_ctx
from ..deps import Ctx, get_ctx, need_analyst
from ..models import (Brand, BrandAuthorisation, Communication, Document, EligibilityRecord, InvoiceAssessment, Product, PurchaseOrder, Quotation, Supplier,
                      SupplierContact, SupplierEvidence, SupplierProduct)
from ..providers import get_provider
from ..services import suppliers as svc
from ..services.suppliers import EU

router = APIRouter(tags=["suppliers"])
STATUS_LABEL = {"official_brand_owner": "Official brand owner", "manufacturer": "Manufacturer", "verified_authorised_distributor": "Verified authorised distributor",
                "established_wholesaler": "Established wholesaler", "unverified": "Unverified", "high_risk": "High risk"}


def sup_out(s: Supplier, ctx: Ctx | None = None, brief=True):
    d = {"id": s.id, "legal_name": s.legal_name, "trading_name": s.trading_name, "name": s.trading_name or s.legal_name, "supplier_type": s.supplier_type, "status": s.status,
         "status_label": STATUS_LABEL.get(s.status, s.status), "country": s.country, "city": s.city, "website": s.website, "logo_url": s.logo_url, "categories": s.categories,
         "brands_supplied": s.brands_supplied, "moq": s.moq, "price_min": s.price_min, "price_max": s.price_max, "currency": s.currency, "lead_time_days": s.lead_time_days,
         "sample_available": s.sample_available, "score": s.score, "risk_level": s.risk_level, "saved": s.saved, "registry_checked_at": s.registry_checked_at,
         "vat_valid": s.vat_valid, "years_trading": s.years_trading, "source": s.source, "created_at": s.created_at}
    if ctx:
        d["has_contact"] = bool(ctx.db.scalar(select(SupplierContact.id).where(SupplierContact.supplier_id == s.id).limit(1)))
        d["matched_products"] = ctx.db.scalar(select(func.count(func.distinct(SupplierProduct.product_id))).where(SupplierProduct.supplier_id == s.id, SupplierProduct.product_id.isnot(None))) or 0
        d["has_authorisation_evidence"] = bool(ctx.db.scalar(select(SupplierEvidence.id).where(SupplierEvidence.supplier_id == s.id, SupplierEvidence.supports_authorisation.is_(True)).limit(1))) or \
            bool(ctx.db.scalar(select(BrandAuthorisation.id).where(BrandAuthorisation.supplier_id == s.id, BrandAuthorisation.status.in_(["confirmed_by_brand", "listed_by_brand"])).limit(1)))
        last = ctx.db.scalar(select(InvoiceAssessment.risk_level).where(InvoiceAssessment.supplier_id == s.id).order_by(InvoiceAssessment.created_at.desc()))
        d["documentation"] = last or "none"
    if not brief:
        d.update({"address": s.address, "registration_number": s.registration_number, "registry": s.registry, "registry_data": s.registry_data, "vat_number": s.vat_number,
                  "vat_data": s.vat_data, "vat_checked_at": s.vat_checked_at, "countries_served": s.countries_served, "certifications": s.certifications,
                  "shipping_options": s.shipping_options, "communication_rating": s.communication_rating, "quality_rating": s.quality_rating, "score_components": s.score_components,
                  "risk_reasons": s.risk_reasons, "notes": s.notes})
    return d


def _get(ctx: Ctx, sid: int) -> Supplier:
    s = ctx.db.get(Supplier, sid)
    if not s or s.org_id != ctx.org_id:
        raise HTTPException(404, "Supplier not found")
    return s


@router.get("/suppliers")
def list_suppliers(q: str = "", types: list[str] = Query([]), statuses: list[str] = Query([]), region: str = "", saved: bool | None = None,
                   sort: str = "score", page: int = 1, page_size: int = 50, ctx: Ctx = Depends(get_ctx)):
    qq = select(Supplier).where(Supplier.org_id == ctx.org_id)
    if q:
        like = f"%{q}%"
        qq = qq.where(or_(Supplier.legal_name.ilike(like), Supplier.trading_name.ilike(like), Supplier.website.ilike(like), Supplier.notes.ilike(like),
                          Supplier.id.in_(select(SupplierProduct.supplier_id).where(SupplierProduct.description.ilike(like)))))
    if types:
        qq = qq.where(Supplier.supplier_type.in_(types))
    if statuses:
        qq = qq.where(Supplier.status.in_(statuses))
    if region == "UK":
        qq = qq.where(Supplier.country == "GB")
    elif region == "EU":
        qq = qq.where(Supplier.country.in_(EU))
    elif region == "INTL":
        qq = qq.where(Supplier.country.notin_(EU | {"GB"}))
    if saved is not None:
        qq = qq.where(Supplier.saved.is_(saved))
    total = ctx.db.scalar(select(func.count()).select_from(qq.subquery()))
    order = {"score": Supplier.score.desc().nullslast(), "name": Supplier.legal_name.asc(), "recent": Supplier.created_at.desc(), "moq": Supplier.moq.asc().nullslast()}.get(sort, Supplier.score.desc().nullslast())
    rows = ctx.db.scalars(qq.order_by(order).offset((page - 1) * page_size).limit(page_size)).all()
    counts = dict(ctx.db.execute(select(Supplier.status, func.count()).where(Supplier.org_id == ctx.org_id).group_by(Supplier.status)).all())
    return {"total": total, "items": [sup_out(s, ctx) for s in rows], "status_counts": counts}


class SupplierIn(BaseModel):
    legal_name: str = Field(min_length=2, max_length=240)
    trading_name: str = ""
    supplier_type: str = "wholesaler"
    country: str = Field("GB", min_length=2, max_length=2)
    city: str = ""
    address: str = ""
    website: str = ""
    registration_number: str = ""
    vat_number: str = ""
    categories: list[str] = []
    brands_supplied: list[str] = []
    countries_served: list[str] = []
    certifications: list[str] = []
    shipping_options: list[str] = []
    moq: int | None = None
    price_min: float | None = None
    price_max: float | None = None
    currency: str = "GBP"
    lead_time_days: int | None = None
    sample_available: bool | None = None
    communication_rating: int | None = Field(None, ge=1, le=5)
    quality_rating: int | None = Field(None, ge=1, le=5)
    notes: str = ""
    source: str = "user"


@router.post("/suppliers")
def create_supplier(body: SupplierIn, ctx: Ctx = Depends(need_analyst)):
    s = Supplier(org_id=ctx.org_id, **{**body.model_dump(), "country": body.country.upper()})
    ctx.db.add(s)
    ctx.db.flush()
    svc.classify_and_score(ctx.db, s)
    audit_ctx(ctx, "supplier.created", "supplier", s.id, {"name": s.legal_name})
    ctx.db.commit()
    return sup_out(s, ctx, brief=False)


@router.patch("/suppliers/{sid}")
def update_supplier(sid: int, body: dict, ctx: Ctx = Depends(need_analyst)):
    s = _get(ctx, sid)
    allowed = set(SupplierIn.model_fields) | {"saved"}
    for k, v in body.items():
        if k in allowed:
            setattr(s, k, v.upper() if k == "country" and isinstance(v, str) else v)
    svc.classify_and_score(ctx.db, s)
    ctx.db.commit()
    return sup_out(s, ctx, brief=False)


@router.delete("/suppliers/{sid}")
def delete_supplier(sid: int, ctx: Ctx = Depends(need_analyst)):
    s = _get(ctx, sid)
    ctx.db.delete(s)
    audit_ctx(ctx, "supplier.deleted", "supplier", sid)
    ctx.db.commit()
    return {"ok": True}


@router.get("/suppliers/{sid}")
def supplier_profile(sid: int, ctx: Ctx = Depends(get_ctx)):
    s = _get(ctx, sid)
    d = sup_out(s, ctx, brief=False)
    d["contacts"] = [{"id": c.id, "name": c.name, "role": c.role, "email": c.email, "phone": c.phone, "source": c.source} for c in s.contacts]
    d["evidence"] = [{"id": e.id, "kind": e.kind, "summary": e.summary, "source_url": e.source_url, "source_name": e.source_name, "classification": e.classification,
                      "confidence": e.confidence, "supports_authorisation": e.supports_authorisation, "retrieved_at": e.retrieved_at} for e in sorted(s.evidence, key=lambda e: e.retrieved_at, reverse=True)]
    d["products"] = [{"id": p.id, "description": p.description, "sku": p.sku, "ean": p.ean, "unit_price": p.unit_price, "currency": p.currency, "moq": p.moq,
                      "sample_available": p.sample_available, "product_id": p.product_id} for p in ctx.db.scalars(select(SupplierProduct).where(SupplierProduct.supplier_id == sid))]
    d["authorisations"] = [{"id": a.id, "brand": ctx.db.get(Brand, a.brand_id).name, "brand_id": a.brand_id, "evidence_type": a.evidence_type, "status": a.status, "statement": a.statement,
                            "source_url": a.source_url, "verified_at": a.verified_at} for a in ctx.db.scalars(select(BrandAuthorisation).where(BrandAuthorisation.supplier_id == sid))]
    d["quotations"] = [{"id": q.id, "product_desc": q.product_desc, "status": q.status, "quantity": q.quantity, "quoted_price": q.quoted_price, "negotiated_price": q.negotiated_price,
                        "currency": q.currency, "moq": q.moq, "lead_time_days": q.lead_time_days, "shipping_cost": q.shipping_cost, "shipping_terms": q.shipping_terms,
                        "sample_status": q.sample_status, "updated_at": q.updated_at} for q in ctx.db.scalars(select(Quotation).where(Quotation.supplier_id == sid).order_by(Quotation.updated_at.desc()))]
    d["documents"] = [{"id": x.id, "kind": x.kind, "filename": x.filename, "uploaded_at": x.uploaded_at, "pages": x.pages,
                       "assessment": (lambda a: {"id": a.id, "risk_level": a.risk_level, "created_at": a.created_at} if a else None)(ctx.db.scalars(select(InvoiceAssessment).where(InvoiceAssessment.document_id == x.id).order_by(InvoiceAssessment.created_at.desc())).first())}
                      for x in ctx.db.scalars(select(Document).where(Document.supplier_id == sid).order_by(Document.uploaded_at.desc()))]
    d["communications"] = [{"id": c.id, "direction": c.direction, "channel": c.channel, "subject": c.subject, "body": c.body, "at": c.at}
                           for c in ctx.db.scalars(select(Communication).where(Communication.supplier_id == sid).order_by(Communication.at.desc()).limit(100))]
    d["purchase_orders"] = [{"id": p.id, "reference": p.reference, "status": p.status, "total": p.total, "currency": p.currency, "ordered_at": p.ordered_at}
                            for p in ctx.db.scalars(select(PurchaseOrder).where(PurchaseOrder.supplier_id == sid).order_by(PurchaseOrder.created_at.desc()))]
    d["score_disclaimer"] = "The supplier score summarises the evidence on file. It is not proof of brand authorisation and does not predict Amazon's decisions."
    return d


@router.post("/suppliers/{sid}/verify")
def verify(sid: int, ctx: Ctx = Depends(need_analyst)):
    s = _get(ctx, sid)
    res = svc.verify_registry(ctx.db, s)
    ctx.db.flush()
    sc = svc.classify_and_score(ctx.db, s)
    audit_ctx(ctx, "supplier.verified", "supplier", sid, {"status": s.status, "notes": res["notes"]})
    ctx.db.commit()
    return {**res, **sc}


class EvidenceIn(BaseModel):
    kind: str = Field(pattern="^(website_claim|brand_locator|brand_confirmation|trade_record|document|user_note|registry|vat)$")
    summary: str = Field(min_length=3)
    source_url: str = ""
    source_name: str = ""
    confidence: str = "medium"
    brand: str = ""


@router.post("/suppliers/{sid}/evidence")
def add_evidence(sid: int, body: EvidenceIn, ctx: Ctx = Depends(need_analyst)):
    s = _get(ctx, sid)
    supports = body.kind in ("brand_locator", "brand_confirmation")
    if supports and not body.source_url and body.kind == "brand_locator":
        raise HTTPException(400, "A brand distributor listing needs the URL of the brand's page.")
    cls = "official_supplier" if body.kind in ("brand_locator", "brand_confirmation", "website_claim") else "public_registry" if body.kind in ("registry", "vat") else "user"
    svc.add_evidence(ctx.db, s, body.kind, body.summary, url=body.source_url, source=body.source_name or "Your team", classification=cls, confidence=body.confidence, supports_auth=supports)
    if body.brand:
        b = _brand(ctx, body.brand)
        ctx.db.add(BrandAuthorisation(org_id=ctx.org_id, brand_id=b.id, supplier_id=s.id, evidence_type=body.kind, statement=body.summary, source_url=body.source_url,
                                      status={"brand_locator": "listed_by_brand", "brand_confirmation": "confirmed_by_brand", "website_claim": "claimed"}.get(body.kind, "unverified"),
                                      verified_at=datetime.now(timezone.utc) if supports else None, verified_by=ctx.user.id if supports else None))
        if body.brand not in (s.brands_supplied or []):
            s.brands_supplied = [*(s.brands_supplied or []), body.brand]
    ctx.db.flush()
    svc.classify_and_score(ctx.db, s)
    audit_ctx(ctx, "supplier.evidence_added", "supplier", sid, {"kind": body.kind, "brand": body.brand})
    ctx.db.commit()
    return {"ok": True, "status": s.status, "score": s.score}


@router.delete("/suppliers/{sid}/evidence/{eid}")
def delete_evidence(sid: int, eid: int, ctx: Ctx = Depends(need_analyst)):
    s = _get(ctx, sid)
    e = ctx.db.get(SupplierEvidence, eid)
    if e and e.supplier_id == s.id:
        ctx.db.delete(e)
        ctx.db.flush()
        svc.classify_and_score(ctx.db, s)
        ctx.db.commit()
    return {"ok": True}


class ContactIn(BaseModel):
    name: str = ""
    role: str = ""
    email: str = ""
    phone: str = ""
    source: str = "user"


@router.post("/suppliers/{sid}/contacts")
def add_contact(sid: int, body: ContactIn, ctx: Ctx = Depends(need_analyst)):
    s = _get(ctx, sid)
    ctx.db.add(SupplierContact(supplier_id=s.id, **body.model_dump()))
    ctx.db.commit()
    return {"ok": True}


@router.delete("/suppliers/{sid}/contacts/{cid}")
def del_contact(sid: int, cid: int, ctx: Ctx = Depends(need_analyst)):
    _get(ctx, sid)
    c = ctx.db.get(SupplierContact, cid)
    if c and c.supplier_id == sid:
        ctx.db.delete(c)
        ctx.db.commit()
    return {"ok": True}


class SupProductIn(BaseModel):
    description: str = Field(min_length=2)
    product_id: int | None = None
    sku: str = ""
    ean: str = ""
    unit_price: float | None = None
    currency: str = "GBP"
    moq: int | None = None
    sample_available: bool | None = None


@router.post("/suppliers/{sid}/products")
def add_sup_product(sid: int, body: SupProductIn, ctx: Ctx = Depends(need_analyst)):
    s = _get(ctx, sid)
    ctx.db.add(SupplierProduct(supplier_id=s.id, **body.model_dump()))
    if body.product_id:
        from ..services.products import derive
        p = ctx.db.get(Product, body.product_id)
        if p and p.org_id == ctx.org_id:
            ctx.db.flush()
            derive(ctx.db, p)
    ctx.db.commit()
    return {"ok": True}


@router.delete("/suppliers/{sid}/products/{spid}")
def del_sup_product(sid: int, spid: int, ctx: Ctx = Depends(need_analyst)):
    _get(ctx, sid)
    p = ctx.db.get(SupplierProduct, spid)
    if p and p.supplier_id == sid:
        ctx.db.delete(p)
        ctx.db.commit()
    return {"ok": True}


class CommIn(BaseModel):
    direction: str = Field("note", pattern="^(outbound|inbound|note)$")
    channel: str = "email"
    subject: str = ""
    body: str = ""


@router.post("/suppliers/{sid}/communications")
def add_comm(sid: int, body: CommIn, ctx: Ctx = Depends(need_analyst)):
    s = _get(ctx, sid)
    ctx.db.add(Communication(org_id=ctx.org_id, supplier_id=s.id, user_id=ctx.user.id, **body.model_dump()))
    ctx.db.commit()
    return {"ok": True}


class DiscoverIn(BaseModel):
    product: str = Field(min_length=2, max_length=200)
    brand: str = ""
    region: str = "UK"
    mode: str = Field("unbranded", pattern="^(branded|unbranded)$")


@router.post("/suppliers/discover")
def discover(body: DiscoverIn, ctx: Ctx = Depends(need_analyst)):
    res = svc.discover(ctx.db, ctx.org_id, product=body.product, brand=body.brand, region=body.region, mode=body.mode)
    existing = {svc.norm(s.legal_name): s.id for s in ctx.db.scalars(select(Supplier).where(Supplier.org_id == ctx.org_id))}
    for c in res["candidates"]:
        c["existing_id"] = existing.get(svc.norm(c["name"]))
    if body.mode == "branded" and body.brand:
        b = _brand(ctx, body.brand)
        bo = res["brand_owner"]
        if bo.get("website") and not b.official_website:
            b.official_website = bo["website"]
        if bo.get("company") and not b.owner_company:
            b.owner_company = bo["company"]
        if bo.get("distributor_locator_url") and not b.distributor_locator_url:
            b.distributor_locator_url = bo["distributor_locator_url"]
        if bo.get("reseller_policy_url") and not b.reseller_policy_url:
            b.reseller_policy_url = bo["reseller_policy_url"]
        res["brand_id"] = b.id
    audit_ctx(ctx, "supplier.discover", "query", body.mode, {"q": body.product[:100], "brand": body.brand, "found": len(res["candidates"])})
    ctx.db.commit()
    return res


class SaveCandidateIn(BaseModel):
    candidate: dict
    brand: str = ""
    product_id: int | None = None


@router.post("/suppliers/discover/save")
def save_candidate(body: SaveCandidateIn, ctx: Ctx = Depends(need_analyst)):
    c = body.candidate
    stype = c.get("supplier_type") if c.get("supplier_type") not in ("unknown", "retailer", "marketplace", None) else "wholesaler"
    s = Supplier(org_id=ctx.org_id, legal_name=c.get("name", "")[:240] or "Unknown", supplier_type=stype, country=(c.get("country") or "GB")[:2].upper(), website=c.get("website", ""),
                 categories=c.get("products", [])[:10], certifications=c.get("certifications", []), brands_supplied=[body.brand] if body.brand else [], source="discovery",
                 notes=c.get("summary", ""))
    ctx.db.add(s)
    ctx.db.flush()
    for e in c.get("emails", [])[:5]:
        ctx.db.add(SupplierContact(supplier_id=s.id, email=e, source=(c.get("source_urls") or [""])[0]))
    for ph in c.get("phones", [])[:3]:
        ctx.db.add(SupplierContact(supplier_id=s.id, phone=ph, source=(c.get("source_urls") or [""])[0]))
    for u in c.get("source_urls", [])[:5]:
        svc.add_evidence(ctx.db, s, "website_claim", f"Found during discovery: {c.get('summary', '')[:300]}", url=u, source="Web search", classification="official_supplier", confidence="low")
    if c.get("claims_authorised") and body.brand:
        b = _brand(ctx, body.brand)
        ctx.db.add(BrandAuthorisation(org_id=ctx.org_id, brand_id=b.id, supplier_id=s.id, evidence_type="distributor_claim", statement=c.get("claim_quote", ""),
                                      source_url=(c.get("source_urls") or [""])[0], status="claimed"))
    if body.product_id:
        ctx.db.add(SupplierProduct(supplier_id=s.id, product_id=body.product_id, description=", ".join(c.get("products", [])[:3]) or "Discovered supplier"))
    ctx.db.flush()
    svc.classify_and_score(ctx.db, s)
    audit_ctx(ctx, "supplier.created", "supplier", s.id, {"name": s.legal_name, "source": "discovery"})
    ctx.db.commit()
    return {"id": s.id}


@router.get("/suppliers/compare/data")
def compare(ids: list[int] = Query(...), quantity: int = 500, currency: str = "GBP", ctx: Ctx = Depends(get_ctx)):
    if len(ids) > 10:
        raise HTTPException(400, "Compare up to 10 suppliers.")
    fx = None
    try:
        fx = get_provider(ctx.db, ctx.org_id, "fx").rates(currency).data
    except Exception:  # noqa: BLE001
        fx = None
    out = []
    for i in ids:
        s = _get(ctx, i)
        q = ctx.db.scalars(select(Quotation).where(Quotation.supplier_id == i, Quotation.quoted_price.isnot(None)).order_by(Quotation.updated_at.desc())).first()
        unit = (q.negotiated_price or q.quoted_price) if q else (s.price_min if s.price_min else None)
        cur = (q.currency if q else s.currency) or "GBP"
        rate = None
        if fx and cur != currency:
            r = fx["rates"].get(cur)
            rate = 1 / r if r else None
        conv = (lambda v: None if v is None else round(v * (rate if rate else 1), 4) if cur == currency or rate else None)
        ship = (q.shipping_cost if q else None)
        landed = None
        if unit is not None:
            landed = conv(unit + ((ship or 0) / quantity if ship else 0))
        d = sup_out(s, ctx, brief=False)
        d["comparison"] = {"unit_cost": conv(unit), "unit_cost_original": unit, "original_currency": cur, "shipping_total": conv(ship), "landed_unit_estimate": landed,
                           "moq": (q.moq if q and q.moq else s.moq), "lead_time_days": (q.lead_time_days if q and q.lead_time_days else s.lead_time_days),
                           "quote_id": q.id if q else None, "fx_rate": rate, "fx_date": fx.get("date") if fx else None}
        out.append(d)
    return {"currency": currency, "quantity": quantity, "suppliers": out, "fx_source": {"provider": "ECB via Frankfurter", "date": fx.get("date") if fx else None},
            "note": "Supplier score ≠ authorisation. Landed estimate = unit price + quoted shipping spread over the quantity; add duty and freight in the Profit Calculator."}


# ---------------------------------------------------------------- brands
def _brand(ctx: Ctx, name: str) -> Brand:
    nn = svc.norm(name) or name.lower()
    b = ctx.db.scalar(select(Brand).where(Brand.org_id == ctx.org_id, Brand.normalised_name == nn))
    if not b:
        b = Brand(org_id=ctx.org_id, name=name.strip(), normalised_name=nn)
        ctx.db.add(b)
        ctx.db.flush()
    return b


@router.get("/brands")
def brands(ctx: Ctx = Depends(get_ctx)):
    rows = ctx.db.scalars(select(Brand).where(Brand.org_id == ctx.org_id).order_by(Brand.name)).all()
    out = []
    for b in rows:
        auths = ctx.db.scalars(select(BrandAuthorisation).where(BrandAuthorisation.brand_id == b.id)).all()
        prods = ctx.db.scalar(select(func.count()).select_from(Product).where(Product.org_id == ctx.org_id, Product.brand_name.ilike(b.name))) or 0
        out.append({"id": b.id, "name": b.name, "owner_company": b.owner_company, "official_website": b.official_website, "distributor_locator_url": b.distributor_locator_url,
                    "reseller_policy_url": b.reseller_policy_url, "products": prods, "confirmed_distributors": sum(1 for a in auths if a.status in ("confirmed_by_brand", "listed_by_brand")),
                    "claimed_distributors": sum(1 for a in auths if a.status == "claimed"), "updated_at": b.updated_at})
    return out


@router.get("/brands/{bid}")
def brand(bid: int, ctx: Ctx = Depends(get_ctx)):
    b = ctx.db.get(Brand, bid)
    if not b or b.org_id != ctx.org_id:
        raise HTTPException(404, "Brand not found")
    auths = ctx.db.scalars(select(BrandAuthorisation).where(BrandAuthorisation.brand_id == bid)).all()
    elig = ctx.db.scalars(select(EligibilityRecord).where(EligibilityRecord.org_id == ctx.org_id, or_(EligibilityRecord.brand_id == bid, EligibilityRecord.product_id.in_(
        select(Product.id).where(Product.org_id == ctx.org_id, Product.brand_name.ilike(b.name))))).order_by(EligibilityRecord.checked_at.desc()).limit(20)).all()
    q = b.name.replace(" ", "+")
    return {"id": b.id, "name": b.name, "owner_company": b.owner_company, "official_website": b.official_website, "distributor_locator_url": b.distributor_locator_url,
            "reseller_policy_url": b.reseller_policy_url, "trademark_info": b.trademark_info, "restrictions": b.restrictions, "notes": b.notes,
            "distributors": [{"id": a.id, "supplier_id": a.supplier_id, "supplier": (lambda s: s.trading_name or s.legal_name)(ctx.db.get(Supplier, a.supplier_id)), "status": a.status,
                              "evidence_type": a.evidence_type, "statement": a.statement, "source_url": a.source_url, "verified_at": a.verified_at} for a in auths],
            "products": [{"id": p.id, "asin": p.asin, "title": p.title, "marketplace": p.marketplace} for p in ctx.db.scalars(select(Product).where(Product.org_id == ctx.org_id, Product.brand_name.ilike(b.name)).limit(50))],
            "eligibility": [{"result": e.result, "source": e.source, "checked_at": e.checked_at, "reasons": e.reasons, "product_id": e.product_id} for e in elig],
            "research_links": [
                {"label": "UK trade mark search (IPO)", "url": f"https://trademarks.ipo.gov.uk/ipo-tmtext?searchType=word&word={q}"},
                {"label": "EU trade mark search (EUIPO)", "url": f"https://euipo.europa.eu/eSearch/#basic/1+1+1+1/100+100+100+100/{q}"},
                {"label": "US trade mark search (USPTO)", "url": f"https://tmsearch.uspto.gov/search/search-results?query={q}"},
                {"label": "Amazon Brand Registry", "url": "https://brandservices.amazon.co.uk/"},
                {"label": "Check eligibility in Seller Central (Add a product)", "url": "https://sellercentral.amazon.co.uk/product-search"}],
            "note": "Third-party data never proves you're authorised to sell a brand. Record Seller Central eligibility checks and the brand's own confirmation as evidence."}


class BrandIn(BaseModel):
    name: str = Field(min_length=1, max_length=160)
    owner_company: str = ""
    official_website: str = ""
    distributor_locator_url: str = ""
    reseller_policy_url: str = ""
    notes: str = ""
    restrictions: dict = {}
    trademark_info: dict = {}


@router.post("/brands")
def create_brand(body: BrandIn, ctx: Ctx = Depends(need_analyst)):
    b = _brand(ctx, body.name)
    for k, v in body.model_dump().items():
        if v and k != "name":
            setattr(b, k, v)
    ctx.db.commit()
    return {"id": b.id}


@router.patch("/brands/{bid}")
def update_brand(bid: int, body: dict, ctx: Ctx = Depends(need_analyst)):
    b = ctx.db.get(Brand, bid)
    if not b or b.org_id != ctx.org_id:
        raise HTTPException(404, "Brand not found")
    for k, v in body.items():
        if k in BrandIn.model_fields and k != "name":
            setattr(b, k, v)
    ctx.db.commit()
    return {"ok": True}


class BrandEligIn(BaseModel):
    result: str = Field(pattern="^(eligible|approval_required|restricted)$")
    notes: str = ""


@router.post("/brands/{bid}/eligibility")
def brand_eligibility(bid: int, body: BrandEligIn, ctx: Ctx = Depends(need_analyst)):
    b = ctx.db.get(Brand, bid)
    if not b or b.org_id != ctx.org_id:
        raise HTTPException(404, "Brand not found")
    ctx.db.add(EligibilityRecord(org_id=ctx.org_id, brand_id=bid, result=body.result, reasons=[body.notes] if body.notes else [], source="seller_central_manual", user_id=ctx.user.id))
    ctx.db.commit()
    return {"ok": True}


@router.get("/distributors")
def distributors(ctx: Ctx = Depends(get_ctx)):
    rows = ctx.db.scalars(select(BrandAuthorisation).where(BrandAuthorisation.org_id == ctx.org_id).order_by(BrandAuthorisation.updated_at.desc())).all()
    out = []
    for a in rows:
        s, b = ctx.db.get(Supplier, a.supplier_id), ctx.db.get(Brand, a.brand_id)
        out.append({"id": a.id, "brand": b.name, "brand_id": b.id, "supplier": s.trading_name or s.legal_name, "supplier_id": s.id, "country": s.country, "status": a.status,
                    "evidence_type": a.evidence_type, "statement": a.statement, "source_url": a.source_url, "verified_at": a.verified_at, "supplier_status": s.status, "supplier_score": s.score})
    return out
