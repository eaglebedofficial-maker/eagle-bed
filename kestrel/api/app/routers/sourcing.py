"""RFQ manager: quotation requests, email drafts, responses, samples, purchase orders."""
import smtplib
from datetime import date
from email.message import EmailMessage

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import func, select

from ..audit import audit_ctx
from ..config import get_settings
from ..db import utcnow
from ..deps import Ctx, get_ctx, need_analyst
from ..models import Communication, Product, PurchaseOrder, Quotation, Supplier, SupplierContact
from ..services.suppliers import classify_and_score

router = APIRouter(tags=["sourcing"])
STATUSES = ["draft", "sent", "quoted", "negotiating", "accepted", "declined"]


def q_out(q: Quotation):
    s = q.supplier
    return {"id": q.id, "supplier_id": q.supplier_id, "supplier": s.trading_name or s.legal_name, "supplier_country": s.country, "supplier_status": s.status, "product_id": q.product_id,
            "product_desc": q.product_desc, "quantity": q.quantity, "target_price": q.target_price, "status": q.status, "email_subject": q.email_subject, "email_body": q.email_body,
            "sent_at": q.sent_at, "responded_at": q.responded_at, "quoted_price": q.quoted_price, "negotiated_price": q.negotiated_price, "currency": q.currency, "moq": q.moq,
            "lead_time_days": q.lead_time_days, "shipping_cost": q.shipping_cost, "shipping_terms": q.shipping_terms, "sample_status": q.sample_status,
            "response_notes": q.response_notes, "created_at": q.created_at, "updated_at": q.updated_at}


def draft_email(ctx: Ctx, s: Supplier, product: str, qty: int | None, target: float | None, branded: bool, brand: str = "") -> tuple[str, str]:
    st = ctx.org.settings or {}
    company = st.get("legal_name") or ctx.org.name
    region = {"GB": "the UK"}.get(s.country, "the UK")
    subj = f"Quotation request — {product}" + (f" ({brand})" if brand else "")
    lines = [f"Dear {s.trading_name or s.legal_name} team,", "",
             f"{company} is a {region}-based online retailer. We'd like a quotation for:", "",
             f"• Product: {product}" + (f" — brand: {brand}" if brand else ""),
             f"• Quantity: {qty:,} units" if qty else "• Quantity: please quote your price breaks",
             *( [f"• Target price: around {target:.2f} per unit"] if target else []), "",
             "Could you also confirm:",
             "1. Unit price at each quantity break, and your minimum order quantity",
             "2. Lead time and shipping terms (EXW/FOB/DDP) to the UK",
             "3. Whether samples are available, and their cost",
             "4. That you will issue a full commercial invoice showing your registered business name and address, VAT number, our business details, product descriptions and quantities"]
    if branded:
        lines += [f"5. Your relationship with {brand or 'the brand'} (manufacturer, authorised distributor or wholesaler), and whether the brand can confirm you as an authorised supplier"]
    lines += ["", "Our details:", f"{company}", f"{st.get('address', '[Business address]')}", f"VAT: {st.get('vat_number', '[VAT number]')}", "", "Kind regards,", f"{ctx.user.name or '[Your name]'}"]
    return subj, "\n".join(lines)


class RfqIn(BaseModel):
    supplier_id: int
    product_desc: str = Field(min_length=2, max_length=300)
    product_id: int | None = None
    quantity: int | None = None
    target_price: float | None = None
    currency: str = "GBP"
    branded: bool = False
    brand: str = ""


@router.post("/rfq")
def create_rfq(body: RfqIn, ctx: Ctx = Depends(need_analyst)):
    s = ctx.db.get(Supplier, body.supplier_id)
    if not s or s.org_id != ctx.org_id:
        raise HTTPException(404, "Supplier not found")
    subj, text = draft_email(ctx, s, body.product_desc, body.quantity, body.target_price, body.branded, body.brand)
    q = Quotation(org_id=ctx.org_id, supplier_id=s.id, product_id=body.product_id, product_desc=body.product_desc, quantity=body.quantity, target_price=body.target_price,
                  currency=body.currency, email_subject=subj, email_body=text)
    ctx.db.add(q)
    ctx.db.commit()
    return q_out(q)


@router.get("/rfq")
def list_rfq(status: str | None = None, supplier_id: int | None = None, ctx: Ctx = Depends(get_ctx)):
    qq = select(Quotation).where(Quotation.org_id == ctx.org_id)
    if status:
        qq = qq.where(Quotation.status == status)
    if supplier_id:
        qq = qq.where(Quotation.supplier_id == supplier_id)
    rows = ctx.db.scalars(qq.order_by(Quotation.updated_at.desc())).all()
    counts = dict(ctx.db.execute(select(Quotation.status, func.count()).where(Quotation.org_id == ctx.org_id).group_by(Quotation.status)).all())
    return {"items": [q_out(q) for q in rows], "counts": {s: counts.get(s, 0) for s in STATUSES}}


@router.patch("/rfq/{qid}")
def update_rfq(qid: int, body: dict, ctx: Ctx = Depends(need_analyst)):
    q = ctx.db.get(Quotation, qid)
    if not q or q.org_id != ctx.org_id:
        raise HTTPException(404, "Quotation not found")
    allowed = {"product_desc", "quantity", "target_price", "status", "email_subject", "email_body", "quoted_price", "negotiated_price", "currency", "moq", "lead_time_days",
               "shipping_cost", "shipping_terms", "sample_status", "response_notes"}
    before = q.status
    for k, v in body.items():
        if k in allowed:
            if k == "status" and v not in STATUSES:
                raise HTTPException(400, "Unknown status")
            setattr(q, k, v)
    if body.get("quoted_price") is not None and not q.responded_at:
        q.responded_at = utcnow()
        if q.status in ("draft", "sent"):
            q.status = "quoted"
    if q.status != before:
        ctx.db.add(Communication(org_id=ctx.org_id, supplier_id=q.supplier_id, direction="note", channel="system", subject=f"RFQ #{q.id} {before} → {q.status}", body=q.product_desc, user_id=ctx.user.id))
    if q.quoted_price and not q.supplier.price_min:
        q.supplier.price_min = q.negotiated_price or q.quoted_price
    if q.moq and not q.supplier.moq:
        q.supplier.moq = q.moq
    if q.lead_time_days and not q.supplier.lead_time_days:
        q.supplier.lead_time_days = q.lead_time_days
    classify_and_score(ctx.db, q.supplier)
    ctx.db.commit()
    return q_out(q)


@router.post("/rfq/{qid}/send")
def send_rfq(qid: int, ctx: Ctx = Depends(need_analyst)):
    q = ctx.db.get(Quotation, qid)
    if not q or q.org_id != ctx.org_id:
        raise HTTPException(404, "Quotation not found")
    to = ctx.db.scalar(select(SupplierContact.email).where(SupplierContact.supplier_id == q.supplier_id, SupplierContact.email != "").limit(1))
    s = get_settings()
    sent_by_email = False
    if s.smtp_host and to:
        msg = EmailMessage()
        msg["Subject"], msg["From"], msg["To"], msg["Reply-To"] = q.email_subject, s.smtp_from or s.smtp_user, to, ctx.user.email
        msg.set_content(q.email_body)
        try:
            with smtplib.SMTP(s.smtp_host, s.smtp_port, timeout=20) as smtp:
                smtp.starttls()
                if s.smtp_user:
                    smtp.login(s.smtp_user, s.smtp_password)
                smtp.send_message(msg)
            sent_by_email = True
        except Exception as e:  # noqa: BLE001
            raise HTTPException(502, f"The email server rejected the message: {e}")
    q.status, q.sent_at = "sent", utcnow()
    ctx.db.add(Communication(org_id=ctx.org_id, supplier_id=q.supplier_id, direction="outbound", channel="email" if sent_by_email else "manual", subject=q.email_subject, body=q.email_body, user_id=ctx.user.id))
    audit_ctx(ctx, "rfq.sent", "quotation", qid, {"emailed": sent_by_email})
    ctx.db.commit()
    return {"ok": True, "emailed": sent_by_email, "to": to,
            "message": "Sent by email." if sent_by_email else ("Marked as sent. Copy the email into your mail client — " + ("no SMTP server is configured." if not s.smtp_host else "the supplier has no email contact."))}


@router.delete("/rfq/{qid}")
def delete_rfq(qid: int, ctx: Ctx = Depends(need_analyst)):
    q = ctx.db.get(Quotation, qid)
    if q and q.org_id == ctx.org_id:
        ctx.db.delete(q)
        ctx.db.commit()
    return {"ok": True}


# ---------------------------------------------------------------- purchase orders
class PoIn(BaseModel):
    supplier_id: int
    quotation_id: int | None = None
    items: list[dict] = []
    currency: str = "GBP"
    expected_at: date | None = None


@router.post("/purchase-orders")
def create_po(body: PoIn, ctx: Ctx = Depends(need_analyst)):
    s = ctx.db.get(Supplier, body.supplier_id)
    if not s or s.org_id != ctx.org_id:
        raise HTTPException(404, "Supplier not found")
    items = body.items
    if not items and body.quotation_id:
        q = ctx.db.get(Quotation, body.quotation_id)
        if q and q.org_id == ctx.org_id:
            items = [{"description": q.product_desc, "qty": q.quantity or q.moq or 0, "unit_price": q.negotiated_price or q.quoted_price or 0}]
    total = round(sum((i.get("qty") or 0) * (i.get("unit_price") or 0) for i in items), 2)
    n = (ctx.db.scalar(select(func.count()).select_from(PurchaseOrder).where(PurchaseOrder.org_id == ctx.org_id)) or 0) + 1
    po = PurchaseOrder(org_id=ctx.org_id, supplier_id=s.id, quotation_id=body.quotation_id, reference=f"PO-{date.today():%Y%m}-{n:04d}", items=items, currency=body.currency,
                       total=total, expected_at=body.expected_at)
    ctx.db.add(po)
    if body.quotation_id:
        q = ctx.db.get(Quotation, body.quotation_id)
        if q and q.org_id == ctx.org_id:
            q.status = "accepted"
    ctx.db.commit()
    return {"id": po.id, "reference": po.reference}


@router.get("/purchase-orders")
def list_po(ctx: Ctx = Depends(get_ctx)):
    rows = ctx.db.scalars(select(PurchaseOrder).where(PurchaseOrder.org_id == ctx.org_id).order_by(PurchaseOrder.created_at.desc())).all()
    return [{"id": p.id, "reference": p.reference, "supplier_id": p.supplier_id, "supplier": p.supplier.trading_name or p.supplier.legal_name, "status": p.status, "items": p.items,
             "currency": p.currency, "total": p.total, "ordered_at": p.ordered_at, "expected_at": p.expected_at, "received_at": p.received_at, "created_at": p.created_at} for p in rows]


@router.patch("/purchase-orders/{pid}")
def update_po(pid: int, body: dict, ctx: Ctx = Depends(need_analyst)):
    p = ctx.db.get(PurchaseOrder, pid)
    if not p or p.org_id != ctx.org_id:
        raise HTTPException(404, "Purchase order not found")
    if "status" in body:
        if body["status"] not in ("draft", "placed", "in_production", "shipped", "received", "cancelled"):
            raise HTTPException(400, "Unknown status")
        p.status = body["status"]
        if p.status == "placed" and not p.ordered_at:
            p.ordered_at = date.today()
        if p.status == "received":
            p.received_at = date.today()
    for k in ("expected_at",):
        if k in body:
            setattr(p, k, date.fromisoformat(body[k]) if body[k] else None)
    if "items" in body:
        p.items = body["items"]
        p.total = round(sum((i.get("qty") or 0) * (i.get("unit_price") or 0) for i in p.items), 2)
    ctx.db.commit()
    return {"ok": True}
