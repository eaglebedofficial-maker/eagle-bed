"""Reports: generate, store and download CSV / Excel / PDF exports of any module."""
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel, Field
from sqlalchemy import select

from .. import storage
from ..audit import audit_ctx
from ..deps import Ctx, get_ctx, need_analyst
from ..models import Keyword, KeywordList, KeywordListItem, PriceHistory, Product, ProfitCalculation, Report, Supplier, SupplierEvidence
from ..services.exports import export_rows
from .products import apply_filters, product_out

router = APIRouter(prefix="/reports", tags=["reports"])
KINDS = {"product_research": "Product research", "product_comparison": "Product comparison", "supplier_comparison": "Supplier comparison",
         "supplier_verification": "Supplier verification report", "profit_calculations": "Profit calculations", "price_history": "Historical price report",
         "keyword_research": "Keyword research", "competitor_research": "Competitor research", "market_research": "Market research"}
PCOLS = [("ASIN", "asin"), ("Marketplace", "marketplace"), ("Title", "title"), ("Brand", "brand"), ("Category", "category"), ("Price", "price"), ("Est. units/mo", "units"),
         ("Units range", "units_range"), ("Est. revenue/mo", "revenue"), ("BSR", "bsr"), ("Reviews", "reviews"), ("Rating", "rating"), ("Sellers", "offers"), ("FBA fee", "fba_fee"),
         ("Profit/unit", "profit"), ("Margin %", "margin"), ("ROI %", "roi"), ("Cost assumed", "cost_assumed"), ("Score", "score"), ("Source", "source"), ("Refreshed", "last_refreshed_at")]


class ReportIn(BaseModel):
    kind: str
    format: str = Field("xlsx", pattern="^(csv|xlsx|pdf)$")
    params: dict = {}
    title: str = ""


def build(ctx: Ctx, kind: str, params: dict):
    note = "Estimated values (sales, revenue, profit, scores) are estimates, not Amazon figures. Each row lists its data source."
    if kind in ("product_research", "competitor_research", "market_research", "product_comparison"):
        q = apply_filters(select(Product), params.get("filters", {}), ctx.org_id)
        if params.get("ids"):
            q = select(Product).where(Product.org_id == ctx.org_id, Product.id.in_(params["ids"]))
        rows = [product_out(p, brief=True) | {"units_range": f"{p.est_units_low}–{p.est_units_high}" if p.est_units_low else ""} for p in ctx.db.scalars(q.order_by(Product.opportunity_score.desc().nullslast()).limit(5000))]
        return PCOLS, rows, note
    if kind in ("supplier_comparison", "supplier_verification"):
        ids = params.get("ids") or []
        q = select(Supplier).where(Supplier.org_id == ctx.org_id)
        if ids:
            q = q.where(Supplier.id.in_(ids))
        rows = []
        for s in ctx.db.scalars(q.order_by(Supplier.score.desc().nullslast())):
            ev = ctx.db.scalars(select(SupplierEvidence).where(SupplierEvidence.supplier_id == s.id)).all()
            rows.append({"name": s.legal_name, "type": s.supplier_type, "status": s.status, "country": s.country, "score": s.score, "risk": s.risk_level, "risk_reasons": "; ".join(s.risk_reasons or []),
                         "registry": f"{(s.registry_data or {}).get('number', '')} {(s.registry_data or {}).get('status', '')}".strip(), "vat_valid": s.vat_valid, "years": s.years_trading,
                         "moq": s.moq, "lead_time": s.lead_time_days, "price_range": f"{s.price_min or ''}–{s.price_max or ''} {s.currency}", "brands": ", ".join(s.brands_supplied or []),
                         "evidence": " | ".join(f"[{e.kind}] {e.summary[:120]} ({e.source_url})" for e in ev[:6])})
        cols = [("Supplier", "name"), ("Type", "type"), ("Status", "status"), ("Country", "country"), ("Score", "score"), ("Risk", "risk"), ("Risk reasons", "risk_reasons"), ("Register", "registry"),
                ("VAT valid", "vat_valid"), ("Years trading", "years"), ("MOQ", "moq"), ("Lead time (days)", "lead_time"), ("Price range", "price_range"), ("Brands", "brands"), ("Evidence", "evidence")]
        return cols, rows, "Supplier score summarises evidence on file; it is not proof of brand authorisation and does not predict Amazon's decisions."
    if kind == "profit_calculations":
        rows = [{"name": c.name, "price": c.inputs.get("selling_price"), "unit_cost": c.inputs.get("unit_cost"), "landed": c.outputs.get("landed_cost"), "fees": c.outputs.get("total_amazon_fees"),
                 "vat": c.outputs.get("output_vat"), "net": c.outputs.get("net_profit"), "margin": c.outputs.get("margin_pct"), "roi": c.outputs.get("roi_pct"), "be": c.outputs.get("break_even_price"),
                 "vat_registered": c.inputs.get("vat_registered"), "created": c.created_at} for c in ctx.db.scalars(select(ProfitCalculation).where(ProfitCalculation.org_id == ctx.org_id).order_by(ProfitCalculation.created_at.desc()))]
        return [("Name", "name"), ("Price", "price"), ("Unit cost", "unit_cost"), ("Landed cost", "landed"), ("Amazon fees", "fees"), ("Output VAT", "vat"), ("Net profit", "net"),
                ("Margin %", "margin"), ("ROI %", "roi"), ("Break-even price", "be"), ("VAT registered", "vat_registered"), ("Saved", "created")], rows, "Fees from your fee database at calculation time."
    if kind == "price_history":
        pid = params.get("product_id")
        p = ctx.db.get(Product, pid) if pid else None
        if not p or p.org_id != ctx.org_id:
            raise HTTPException(400, "Choose a product for the price history report.")
        rows = [{"series": s, "ts": t, "value": v, "source": src} for s, t, v, src in ctx.db.execute(select(PriceHistory.series, PriceHistory.ts, PriceHistory.value, PriceHistory.source).where(PriceHistory.product_id == pid).order_by(PriceHistory.series, PriceHistory.ts))]
        if not rows:
            raise HTTPException(400, "This product has no retrieved history yet.")
        return [("Series", "series"), ("Timestamp (UTC)", "ts"), ("Value", "value"), ("Source", "source")], rows, f"Historical data for {p.asin} exactly as retrieved; no values are interpolated."
    if kind == "keyword_research":
        lid = params.get("list_id")
        if lid:
            l = ctx.db.get(KeywordList, lid)
            if not l or l.org_id != ctx.org_id:
                raise HTTPException(404, "List not found")
            kws = [i.keyword for i in ctx.db.scalars(select(KeywordListItem).where(KeywordListItem.list_id == lid))]
        else:
            kws = ctx.db.scalars(select(Keyword).where(Keyword.marketplace == params.get("marketplace", "UK"), Keyword.search_volume.isnot(None)).order_by(Keyword.search_volume.desc()).limit(2000)).all()
        rows = [{"keyword": k.phrase, "volume": k.search_volume, "source": k.volume_source, "difficulty": k.difficulty, "cpc": k.cpc, "results": k.result_count, "updated": k.updated_at} for k in kws]
        return [("Keyword", "keyword"), ("Search volume", "volume"), ("Volume source", "source"), ("Difficulty", "difficulty"), ("Est. CPC", "cpc"), ("Results", "results"), ("Updated", "updated")], rows, \
            "Search volumes are licensed estimates (DataForSEO); difficulty is Kestrel's estimate from page-1 review walls."
    raise HTTPException(400, "Unknown report type")


@router.get("/kinds")
def kinds():
    return [{"kind": k, "label": v} for k, v in KINDS.items()]


@router.post("")
def create(body: ReportIn, ctx: Ctx = Depends(need_analyst)):
    if body.kind not in KINDS:
        raise HTTPException(400, "Unknown report type")
    cols, rows, note = build(ctx, body.kind, body.params)
    title = body.title or KINDS[body.kind]
    resp = export_rows(title, cols, rows, body.format, note=note)
    key = storage.put(ctx.org_id, resp.body, "." + body.format)
    r = Report(org_id=ctx.org_id, user_id=ctx.user.id, kind=body.kind, title=title, params=body.params, format=body.format, storage_key=key, size_bytes=len(resp.body))
    ctx.db.add(r)
    audit_ctx(ctx, "report.created", "report", "", {"kind": body.kind, "format": body.format, "rows": len(rows)})
    ctx.db.commit()
    return {"id": r.id, "rows": len(rows)}


@router.get("")
def list_reports(ctx: Ctx = Depends(get_ctx)):
    rows = ctx.db.scalars(select(Report).where(Report.org_id == ctx.org_id).order_by(Report.created_at.desc()).limit(200)).all()
    return [{"id": r.id, "kind": r.kind, "kind_label": KINDS.get(r.kind, r.kind), "title": r.title, "format": r.format, "size_bytes": r.size_bytes, "created_at": r.created_at, "params": r.params} for r in rows]


@router.get("/{rid}/download")
def download(rid: int, ctx: Ctx = Depends(get_ctx)):
    r = ctx.db.get(Report, rid)
    if not r or r.org_id != ctx.org_id:
        raise HTTPException(404, "Report not found")
    mime = {"csv": "text/csv", "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "pdf": "application/pdf"}[r.format]
    safe = "".join(ch if ch.isalnum() else "-" for ch in r.title.lower()).strip("-")
    return Response(storage.get(r.storage_key), media_type=mime, headers={"content-disposition": f'attachment; filename="{safe}-{r.created_at:%Y%m%d}.{r.format}"'})


@router.delete("/{rid}")
def delete(rid: int, ctx: Ctx = Depends(need_analyst)):
    r = ctx.db.get(Report, rid)
    if r and r.org_id == ctx.org_id:
        storage.delete(r.storage_key)
        ctx.db.delete(r)
        ctx.db.commit()
    return {"ok": True}
