"""AI research assistant: retrieval over the organisation's own data, answers cite record ids."""
import json
import re

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import or_, select

from ..deps import Ctx, get_ctx, need_analyst
from ..models import AiMessage, AiThread, InvoiceAssessment, KeywordList, Product, Quotation, Supplier
from ..providers import get_provider
from ..providers.ai import EVIDENCE_SCHEMA
from ..services import history as hist

router = APIRouter(prefix="/assistant", tags=["assistant"])

SYSTEM = """You are Kestrel's research assistant for Amazon sellers (wholesale, private label, brand owners). Answer ONLY from the records provided.
Rules:
- Every factual claim must list the record ids it relies on (e.g. P12, S3, H12). If the records don't contain something, say so in missing_information — never estimate it yourself.
- Keep classifications straight: values marked estimated are estimates; say so. Never call a supplier authorised unless its record shows brand-confirmed evidence.
- Never say a product is guaranteed profitable or that Amazon will accept an invoice.
- State assumptions, a confidence level, and risks. Be concise and practical; use short markdown headings and bullets in `answer`."""


def _products(ctx: Ctx, q: str, limit=25):
    asins = re.findall(r"\bB0[A-Z0-9]{8}\b", q.upper())
    words = [w for w in re.findall(r"[a-zA-Z]{4,}", q.lower()) if w not in {"find", "products", "product", "with", "that", "this", "these", "compare", "analyse", "analyze", "supplier", "suppliers", "which", "what", "should", "price", "history", "months"}]
    qq = select(Product).where(Product.org_id == ctx.org_id)
    if asins:
        rows = ctx.db.scalars(qq.where(Product.asin.in_(asins))).all()
    elif words:
        rows = ctx.db.scalars(qq.where(or_(*[Product.title.ilike(f"%{w}%") for w in words[:6]], *[Product.brand_name.ilike(f"%{w}%") for w in words[:6]])).order_by(Product.opportunity_score.desc().nullslast()).limit(limit)).all()
        if len(rows) < 5:
            rows += ctx.db.scalars(qq.order_by(Product.opportunity_score.desc().nullslast()).limit(limit - len(rows))).all()
    else:
        rows = ctx.db.scalars(qq.order_by(Product.opportunity_score.desc().nullslast()).limit(limit)).all()
    return list(dict.fromkeys(rows))


def build_context(ctx: Ctx, question: str, context: dict) -> tuple[str, dict]:
    records, index = [], {}
    prods = _products(ctx, question)
    if context.get("product_ids"):
        prods = list(dict.fromkeys(list(ctx.db.scalars(select(Product).where(Product.org_id == ctx.org_id, Product.id.in_(context["product_ids"])))) + prods))
    for p in prods[:25]:
        rid = f"P{p.id}"
        dq = p.data_quality or {}
        rec = {"id": rid, "type": "product", "asin": p.asin, "marketplace": p.marketplace, "title": p.title[:140], "brand": p.brand_name, "category": p.category,
               "price": p.price, "currency": p.currency, "bsr": p.bsr, "reviews": p.review_count, "rating": p.rating, "sellers": p.offer_count, "amazon_sells": p.amazon_sells,
               "est_units_month": {"value": p.est_monthly_units, "range": [p.est_units_low, p.est_units_high], "classification": "estimated", "method": p.est_method},
               "est_revenue_month": p.est_monthly_revenue, "fba_fee": p.fba_fee, "size_tier": p.size_tier, "unit_cost": p.unit_cost,
               "est_profit_unit": p.est_profit, "margin_pct": p.est_margin, "roi_pct": p.est_roi, "profit_uses_assumed_cost": dq.get("cost_assumed", True),
               "opportunity_score": p.opportunity_score, "score_summary": (p.score_components or {}).get("summary"), "data_source": p.source, "classification": p.classification,
               "retrieved_at": p.last_refreshed_at.isoformat() if p.last_refreshed_at else None, "data_quality_issues": dq.get("issues")}
        records.append(rec)
        index[rid] = {"type": "product", "label": f"{p.asin} · {p.title[:60]}", "href": f"/products/{p.id}", "retrieved_at": rec["retrieved_at"], "classification": p.classification}
        h = hist.analyse(ctx.db, p.id)
        if h.get("available"):
            hid = f"H{p.id}"
            records.append({"id": hid, "type": "history_analytics", "product": rid, "source": h.get("source"), "period_from": h.get("period_from"), "period_to": h.get("period_to"),
                            "windows": h.get("windows"), "price_stability": h.get("price_stability"), "sales_consistency": h.get("sales_consistency"), "bsr_movement_pct": h.get("bsr_movement_pct"),
                            "seasonality": h.get("seasonality"), "buybox": h.get("buybox")})
            index[hid] = {"type": "history", "label": f"History · {p.asin}", "href": f"/history?product={p.id}", "retrieved_at": h.get("period_to"), "classification": "licensed" if h.get("source") == "keepa" else "user"}
    sq = select(Supplier).where(Supplier.org_id == ctx.org_id)
    words = [w for w in re.findall(r"[a-zA-Z]{4,}", question.lower())]
    sups = ctx.db.scalars(sq.where(or_(*[Supplier.legal_name.ilike(f"%{w}%") for w in words[:6]], *[Supplier.trading_name.ilike(f"%{w}%") for w in words[:6]])).limit(10)).all() if words else []
    if context.get("supplier_ids"):
        sups = list(ctx.db.scalars(sq.where(Supplier.id.in_(context["supplier_ids"])))) + list(sups)
    if re.search(r"supplier|distributor|wholesal|manufactur|source|sourcing|invoice", question.lower()) and len(sups) < 10:
        sups = list(sups) + list(ctx.db.scalars(sq.order_by(Supplier.score.desc().nullslast()).limit(10 - len(sups))))
    for s in list(dict.fromkeys(sups))[:12]:
        sid = f"S{s.id}"
        last = ctx.db.scalars(select(InvoiceAssessment).where(InvoiceAssessment.supplier_id == s.id).order_by(InvoiceAssessment.created_at.desc())).first()
        quotes = ctx.db.scalars(select(Quotation).where(Quotation.supplier_id == s.id).order_by(Quotation.updated_at.desc()).limit(3)).all()
        records.append({"id": sid, "type": "supplier", "name": s.legal_name, "supplier_type": s.supplier_type, "status": s.status, "country": s.country, "score": s.score,
                        "risk_level": s.risk_level, "risk_reasons": s.risk_reasons, "registry": {k: (s.registry_data or {}).get(k) for k in ("number", "status", "created")} if s.registry_data else None,
                        "vat_valid": s.vat_valid, "brands": s.brands_supplied, "moq": s.moq, "lead_time_days": s.lead_time_days, "price_range": [s.price_min, s.price_max], "currency": s.currency,
                        "latest_invoice_assessment": {"risk": last.risk_level, "summary": last.summary} if last else None,
                        "quotes": [{"product": q.product_desc, "price": q.negotiated_price or q.quoted_price, "currency": q.currency, "moq": q.moq, "status": q.status} for q in quotes]})
        index[sid] = {"type": "supplier", "label": s.trading_name or s.legal_name, "href": f"/suppliers/{s.id}", "retrieved_at": s.updated_at.isoformat(), "classification": "user"}
    lists = ctx.db.scalars(select(KeywordList).where(KeywordList.org_id == ctx.org_id).limit(3)).all()
    for l in lists:
        records.append({"id": f"K{l.id}", "type": "keyword_list", "name": l.name})
        index[f"K{l.id}"] = {"type": "keywords", "label": l.name, "href": f"/keywords?list={l.id}", "classification": "user"}
    return json.dumps(records, default=str)[:180000], index


class AskIn(BaseModel):
    question: str = Field(min_length=2, max_length=4000)
    thread_id: int | None = None
    context: dict = {}


@router.post("/ask")
def ask(body: AskIn, ctx: Ctx = Depends(need_analyst)):
    ai = get_provider(ctx.db, ctx.org_id, "anthropic")
    ai.ensure_configured()
    t = ctx.db.get(AiThread, body.thread_id) if body.thread_id else None
    if t and t.org_id != ctx.org_id:
        raise HTTPException(404, "Conversation not found")
    if not t:
        t = AiThread(org_id=ctx.org_id, user_id=ctx.user.id, title=body.question[:80], context=body.context)
        ctx.db.add(t)
        ctx.db.flush()
    history_msgs = ctx.db.scalars(select(AiMessage).where(AiMessage.thread_id == t.id).order_by(AiMessage.created_at)).all()[-8:]
    records, index = build_context(ctx, body.question, body.context or t.context or {})
    convo = "\n".join(f"{m.role.upper()}: {m.content[:2000]}" for m in history_msgs)
    prompt = f"RECORDS (retrieved from the workspace just now):\n{records}\n\n" + (f"EARLIER IN THIS CONVERSATION:\n{convo}\n\n" if convo else "") + f"QUESTION: {body.question}"
    ctx.db.add(AiMessage(thread_id=t.id, role="user", content=body.question))
    res = ai.json(system=SYSTEM, prompt=prompt, schema=EVIDENCE_SCHEMA, effort="medium")
    data = res.data
    cites = []
    for ev in data.get("evidence", []):
        ev["sources"] = [{"id": r, **index[r]} for r in ev.get("record_ids", []) if r in index]
        cites += ev["sources"]
    data["sources"] = list({c["id"]: c for c in cites}.values())
    data["retrieved_records"] = len(index)
    m = AiMessage(thread_id=t.id, role="assistant", content=data.get("answer", ""), structured=data, model=res.usage.get("model", ""), tokens=(res.usage.get("input_tokens") or 0) + (res.usage.get("output_tokens") or 0))
    ctx.db.add(m)
    ctx.db.commit()
    return {"thread_id": t.id, "message": {"id": m.id, "role": "assistant", "content": m.content, "structured": data, "created_at": m.created_at}}


@router.get("/threads")
def threads(ctx: Ctx = Depends(get_ctx)):
    rows = ctx.db.scalars(select(AiThread).where(AiThread.org_id == ctx.org_id, AiThread.user_id == ctx.user.id).order_by(AiThread.updated_at.desc()).limit(50)).all()
    return [{"id": t.id, "title": t.title, "updated_at": t.updated_at} for t in rows]


@router.get("/threads/{tid}")
def thread(tid: int, ctx: Ctx = Depends(get_ctx)):
    t = ctx.db.get(AiThread, tid)
    if not t or t.org_id != ctx.org_id:
        raise HTTPException(404, "Conversation not found")
    msgs = ctx.db.scalars(select(AiMessage).where(AiMessage.thread_id == tid).order_by(AiMessage.created_at)).all()
    return {"id": t.id, "title": t.title, "messages": [{"id": m.id, "role": m.role, "content": m.content, "structured": m.structured, "created_at": m.created_at} for m in msgs]}


@router.delete("/threads/{tid}")
def delete_thread(tid: int, ctx: Ctx = Depends(need_analyst)):
    t = ctx.db.get(AiThread, tid)
    if t and t.org_id == ctx.org_id:
        ctx.db.delete(t)
        ctx.db.commit()
    return {"ok": True}
