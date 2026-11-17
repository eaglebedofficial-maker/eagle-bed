"""Inventory manager, sales analytics, PPC analytics, reimbursement analysis (from your reports or authorised APIs)."""
import csv
import io
import re
from collections import defaultdict
from datetime import date, datetime, timedelta

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from pydantic import BaseModel, Field
from sqlalchemy import delete, func, select

from ..audit import audit_ctx
from ..deps import Ctx, get_ctx, need_analyst
from ..models import AdMetric, InventoryItem, Marketplace, ReimbursementCase, SalesRecord
from ..providers import get_provider

router = APIRouter(tags=["operations"])


def _rows(raw: bytes, filename: str = "") -> list[dict]:
    if filename.lower().endswith(".xlsx") or raw[:2] == b"PK":
        from openpyxl import load_workbook
        wb = load_workbook(io.BytesIO(raw), read_only=True, data_only=True)
        ws = wb.active
        it = ws.iter_rows(values_only=True)
        head = [str(h or "").strip() for h in next(it)]
        return [{head[i]: v for i, v in enumerate(r) if i < len(head)} for r in it if any(c not in (None, "") for c in r)]
    text = raw.decode("utf-8-sig", "replace")
    delim = "\t" if text.split("\n", 1)[0].count("\t") > text.split("\n", 1)[0].count(",") else ","
    return list(csv.DictReader(io.StringIO(text), delimiter=delim))


def _pick(row: dict, *names):
    low = {str(k).lower().strip(): v for k, v in row.items() if k is not None}
    for n in names:
        for k, v in low.items():
            if k == n or (n.endswith("*") and k.startswith(n[:-1])):
                return v
    return None


def _num(v):
    if v is None:
        return 0.0
    if isinstance(v, (int, float)):
        return float(v)
    s = re.sub(r"[^0-9.\-]", "", str(v).replace(",", ""))
    try:
        return float(s) if s not in ("", "-", ".") else 0.0
    except ValueError:
        return 0.0


def _date(v):
    if isinstance(v, datetime):
        return v.date()
    if isinstance(v, date):
        return v
    s = str(v or "").strip()[:10]
    for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%m/%d/%Y", "%d.%m.%Y", "%b %d, %Y"):
        try:
            return datetime.strptime(s, fmt).date()
        except ValueError:
            continue
    try:
        return datetime.fromisoformat(str(v).replace("Z", "+00:00")).date()
    except ValueError:
        return None


# ================================================================ inventory
def velocity(ctx: Ctx, sku: str, days=30) -> float:
    since = date.today() - timedelta(days=days)
    u = ctx.db.scalar(select(func.sum(SalesRecord.units)).where(SalesRecord.org_id == ctx.org_id, SalesRecord.sku == sku, SalesRecord.date >= since)) or 0
    return u / days


def inv_out(ctx: Ctx, i: InventoryItem):
    v = velocity(ctx, i.sku)
    avail = i.on_hand + i.inbound
    cover = (i.on_hand / v) if v > 0 else None
    reorder_point = v * (i.lead_time_days + i.safety_days)
    suggest = max(0, round(v * (i.lead_time_days + i.safety_days + 30) - avail)) if v > 0 else 0
    risk = "none" if v == 0 else "high" if cover is not None and cover < i.lead_time_days else "medium" if cover is not None and cover < i.lead_time_days + i.safety_days else "low"
    stockout = (date.today() + timedelta(days=int(cover))).isoformat() if cover is not None else None
    return {"id": i.id, "sku": i.sku, "title": i.title, "asin": i.asin, "on_hand": i.on_hand, "inbound": i.inbound, "reserved": i.reserved, "unit_cost": i.unit_cost,
            "value": round(i.on_hand * i.unit_cost, 2) if i.unit_cost else None, "lead_time_days": i.lead_time_days, "safety_days": i.safety_days,
            "daily_velocity": round(v, 2), "days_of_cover": round(cover, 1) if cover is not None else None, "reorder_point": round(reorder_point), "reorder_now": avail <= reorder_point and v > 0,
            "suggested_order_qty": suggest, "stockout_risk": risk, "projected_stockout": stockout,
            "forecast_90d": [{"day": d, "units": max(0, round(i.on_hand - v * d))} for d in range(0, 91, 7)], "source": i.source}


@router.get("/inventory")
def inventory(ctx: Ctx = Depends(get_ctx)):
    items = [inv_out(ctx, i) for i in ctx.db.scalars(select(InventoryItem).where(InventoryItem.org_id == ctx.org_id).order_by(InventoryItem.sku))]
    has_sales = bool(ctx.db.scalar(select(SalesRecord.id).where(SalesRecord.org_id == ctx.org_id).limit(1)))
    return {"items": items, "summary": {"skus": len(items), "units": sum(i["on_hand"] for i in items), "value": round(sum(i["value"] or 0 for i in items), 2),
                                        "reorder_now": sum(1 for i in items if i["reorder_now"]), "high_risk": sum(1 for i in items if i["stockout_risk"] == "high")},
            "velocity_basis": "Last 30 days of imported sales" if has_sales else "No sales imported yet — import a sales report to calculate velocity."}


class InvIn(BaseModel):
    sku: str = Field(min_length=1, max_length=80)
    title: str = ""
    asin: str = ""
    on_hand: int = 0
    inbound: int = 0
    reserved: int = 0
    unit_cost: float | None = None
    lead_time_days: int = 30
    safety_days: int = 14


@router.post("/inventory")
def upsert_inv(body: InvIn, ctx: Ctx = Depends(need_analyst)):
    i = ctx.db.scalar(select(InventoryItem).where(InventoryItem.org_id == ctx.org_id, InventoryItem.sku == body.sku))
    if not i:
        i = InventoryItem(org_id=ctx.org_id, sku=body.sku)
        ctx.db.add(i)
    for k, v in body.model_dump().items():
        setattr(i, k, v)
    ctx.db.commit()
    return inv_out(ctx, i)


@router.delete("/inventory/{iid}")
def del_inv(iid: int, ctx: Ctx = Depends(need_analyst)):
    i = ctx.db.get(InventoryItem, iid)
    if i and i.org_id == ctx.org_id:
        ctx.db.delete(i)
        ctx.db.commit()
    return {"ok": True}


@router.post("/inventory/import")
async def import_inv(ctx: Ctx = Depends(need_analyst), file: UploadFile = File(...)):
    rows = _rows(await file.read(), file.filename or "")
    n = 0
    for r in rows:
        sku = str(_pick(r, "sku", "seller-sku", "seller sku", "msku") or "").strip()
        if not sku:
            continue
        i = ctx.db.scalar(select(InventoryItem).where(InventoryItem.org_id == ctx.org_id, InventoryItem.sku == sku)) or InventoryItem(org_id=ctx.org_id, sku=sku)
        ctx.db.add(i)
        i.title = str(_pick(r, "product-name", "product name", "title") or i.title or "")[:300]
        i.asin = str(_pick(r, "asin") or i.asin or "")[:10]
        i.on_hand = int(_num(_pick(r, "afn-fulfillable-quantity", "available", "fulfillable quantity", "on hand", "quantity")))
        i.inbound = int(_num(_pick(r, "afn-inbound-working-quantity")) + _num(_pick(r, "afn-inbound-shipped-quantity")) + _num(_pick(r, "afn-inbound-receiving-quantity")) or _num(_pick(r, "inbound")))
        i.reserved = int(_num(_pick(r, "afn-reserved-quantity", "reserved")))
        c = _num(_pick(r, "unit cost", "cost"))
        if c:
            i.unit_cost = c
        i.source = "report_upload"
        n += 1
    audit_ctx(ctx, "inventory.imported", "inventory", "", {"rows": n})
    ctx.db.commit()
    return {"imported": n}


@router.post("/inventory/sync")
def sync_inv(marketplace: str = "UK", ctx: Ctx = Depends(need_analyst)):
    sp = get_provider(ctx.db, ctx.org_id, "sp_api")
    m = ctx.db.get(Marketplace, marketplace)
    token, n = None, 0
    while True:
        r = sp.fba_inventory(m.sp_marketplace_id, token).data
        for it in r["items"]:
            i = ctx.db.scalar(select(InventoryItem).where(InventoryItem.org_id == ctx.org_id, InventoryItem.sku == it["sku"])) or InventoryItem(org_id=ctx.org_id, sku=it["sku"])
            ctx.db.add(i)
            i.title, i.asin, i.on_hand, i.inbound, i.reserved, i.source = it["title"][:300], it["asin"] or "", it["on_hand"] or 0, it["inbound"] or 0, it["reserved"] or 0, "sp_api"
            n += 1
        token = r["next_token"]
        if not token:
            break
    ctx.db.commit()
    return {"synced": n}


# ================================================================ sales analytics
@router.post("/sales/import")
async def import_sales(ctx: Ctx = Depends(need_analyst), file: UploadFile = File(...), period_end: str = Form(""), replace: bool = Form(False)):
    rows = _rows(await file.read(), file.filename or "")
    if not rows:
        raise HTTPException(400, "The file has no rows.")
    head = " ".join(str(k).lower() for k in rows[0].keys())
    recs = []
    if "purchase-date" in head or "purchase date" in head:  # All Orders report
        for r in rows:
            if str(_pick(r, "order-status", "order status") or "").lower() in ("cancelled",):
                continue
            d = _date(_pick(r, "purchase-date", "purchase date"))
            if not d:
                continue
            recs.append(SalesRecord(org_id=ctx.org_id, date=d, sku=str(_pick(r, "sku") or ""), asin=str(_pick(r, "asin") or ""), title=str(_pick(r, "product-name") or "")[:300],
                                    units=int(_num(_pick(r, "quantity"))), revenue=_num(_pick(r, "item-price", "item price")), source="all_orders_report"))
    elif "ordered product sales" in head or "units ordered" in head:  # Business Report (no dates in rows)
        d = _date(period_end) or date.today()
        for r in rows:
            recs.append(SalesRecord(org_id=ctx.org_id, date=d, sku=str(_pick(r, "sku") or ""), asin=str(_pick(r, "(child) asin", "child asin", "asin") or ""), title=str(_pick(r, "title") or "")[:300],
                                    units=int(_num(_pick(r, "units ordered", "units ordered - total"))), revenue=_num(_pick(r, "ordered product sales", "ordered product sales - total")),
                                    sessions=int(_num(_pick(r, "sessions - total", "sessions"))), source="business_report"))
    elif "settlement-id" in head or "amount-type" in head:  # settlement flat file v2
        agg = defaultdict(lambda: {"units": 0, "revenue": 0.0, "fees": 0.0, "refunds": 0.0})
        for r in rows:
            d = _date(_pick(r, "posted-date", "posted-date-time"))
            sku = str(_pick(r, "sku") or "")
            if not d or not sku:
                continue
            a = agg[(d, sku)]
            amt = _num(_pick(r, "amount"))
            tt, at = str(_pick(r, "transaction-type") or "").lower(), str(_pick(r, "amount-type") or "").lower()
            if tt == "order" and at == "itemprice" and str(_pick(r, "amount-description")).lower() == "principal":
                a["revenue"] += amt
                a["units"] += int(_num(_pick(r, "quantity-purchased")))
            elif "fee" in at:
                a["fees"] += -amt
            elif tt == "refund" and at == "itemprice":
                a["refunds"] += -amt
        for (d, sku), a in agg.items():
            recs.append(SalesRecord(org_id=ctx.org_id, date=d, sku=sku, units=a["units"], revenue=round(a["revenue"], 2), fees=round(a["fees"], 2), refunds=round(a["refunds"], 2), source="settlement_report"))
    else:
        raise HTTPException(400, "Unrecognised report. Upload an All Orders report, a Business Report (Detail Page Sales and Traffic by Child Item) or a settlement flat file.")
    if replace and recs:
        ctx.db.execute(delete(SalesRecord).where(SalesRecord.org_id == ctx.org_id, SalesRecord.source == recs[0].source))
    costs = {i.sku: i.unit_cost for i in ctx.db.scalars(select(InventoryItem).where(InventoryItem.org_id == ctx.org_id)) if i.unit_cost}
    for r in recs:
        r.cogs = round(costs.get(r.sku, 0) * r.units, 2)
    ctx.db.add_all(recs)
    audit_ctx(ctx, "sales.imported", "sales", "", {"rows": len(recs), "source": recs[0].source if recs else ""})
    ctx.db.commit()
    return {"imported": len(recs), "source": recs[0].source if recs else None}


@router.get("/sales")
def sales(days: int = 90, ctx: Ctx = Depends(get_ctx)):
    since = date.today() - timedelta(days=days)
    rows = ctx.db.scalars(select(SalesRecord).where(SalesRecord.org_id == ctx.org_id, SalesRecord.date >= since)).all()
    if not rows:
        return {"available": False, "reason": "No sales imported yet. Upload a Seller Central report, or connect SP-API."}
    daily = defaultdict(lambda: {"units": 0, "revenue": 0.0, "fees": 0.0, "refunds": 0.0, "cogs": 0.0})
    by = defaultdict(lambda: {"units": 0, "revenue": 0.0, "fees": 0.0, "refunds": 0.0, "cogs": 0.0, "title": "", "asin": "", "sessions": 0})
    for r in rows:
        for b in (daily[r.date.isoformat()], by[r.sku or r.asin]):
            b["units"] += r.units
            b["revenue"] += r.revenue
            b["fees"] += r.fees
            b["refunds"] += r.refunds
            b["cogs"] += r.cogs
        by[r.sku or r.asin]["title"] = by[r.sku or r.asin]["title"] or r.title
        by[r.sku or r.asin]["asin"] = r.asin
        by[r.sku or r.asin]["sessions"] += r.sessions or 0
    def fin(b):
        profit = b["revenue"] - b["fees"] - b["refunds"] - b["cogs"]
        return {**{k: round(v, 2) if isinstance(v, float) else v for k, v in b.items()}, "profit": round(profit, 2), "margin": round(profit / b["revenue"] * 100, 1) if b["revenue"] else None,
                "roi": round(profit / b["cogs"] * 100, 1) if b["cogs"] else None}
    tot = fin({k: sum(d[k] for d in daily.values()) for k in ("units", "revenue", "fees", "refunds", "cogs")})
    ad_spend = ctx.db.scalar(select(func.sum(AdMetric.spend)).where(AdMetric.org_id == ctx.org_id, AdMetric.date >= since)) or 0
    tot["ad_spend"] = round(ad_spend, 2)
    tot["tacos"] = round(ad_spend / tot["revenue"] * 100, 1) if tot["revenue"] else None
    tot["profit_after_ads"] = round(tot["profit"] - ad_spend, 2)
    sources = sorted({r.source for r in rows})
    return {"available": True, "totals": tot, "daily": [{"date": d, **fin(v)} for d, v in sorted(daily.items())],
            "products": sorted([{"sku": k, **fin(v)} for k, v in by.items()], key=lambda x: -x["revenue"]),
            "sources": sources, "classification": "user", "cogs_note": "COGS uses unit costs from the Inventory Manager; SKUs without a cost show no COGS."}


@router.post("/sales/sync")
def sync_sales(marketplace: str = "UK", days: int = 30, ctx: Ctx = Depends(need_analyst)):
    sp = get_provider(ctx.db, ctx.org_id, "sp_api")
    m = ctx.db.get(Marketplace, marketplace)
    end = date.today()
    start = end - timedelta(days=days)
    data = sp.order_metrics(m.sp_marketplace_id, f"{start}T00:00:00Z", f"{end}T00:00:00Z").data
    ctx.db.execute(delete(SalesRecord).where(SalesRecord.org_id == ctx.org_id, SalesRecord.source == "sp_api_metrics", SalesRecord.date >= start))
    for d in data:
        ctx.db.add(SalesRecord(org_id=ctx.org_id, date=_date(d["interval"].split("--")[0]), sku="(all)", units=int(d.get("unitCount", 0)),
                               revenue=float((d.get("totalSales") or {}).get("amount", 0)), source="sp_api_metrics"))
    ctx.db.commit()
    return {"synced": len(data)}


# ================================================================ PPC analytics
@router.post("/ppc/import")
async def import_ppc(ctx: Ctx = Depends(need_analyst), file: UploadFile = File(...), replace: bool = Form(True)):
    rows = _rows(await file.read(), file.filename or "")
    recs = []
    for r in rows:
        d = _date(_pick(r, "date", "start date"))
        if not d:
            continue
        recs.append(AdMetric(org_id=ctx.org_id, date=d, campaign=str(_pick(r, "campaign name", "campaign") or "")[:200], ad_group=str(_pick(r, "ad group name", "ad group") or "")[:200],
                             targeting=str(_pick(r, "targeting", "keyword") or "")[:300], match_type=str(_pick(r, "match type") or "")[:20],
                             search_term=str(_pick(r, "customer search term", "search term") or "")[:300], impressions=int(_num(_pick(r, "impressions"))), clicks=int(_num(_pick(r, "clicks"))),
                             spend=_num(_pick(r, "spend", "cost")), sales=_num(_pick(r, "7 day total sales*", "14 day total sales*", "sales", "7 day total sales (£)", "total sales")),
                             orders=int(_num(_pick(r, "7 day total orders*", "14 day total orders*", "orders", "7 day total orders (#)"))), source="report_upload"))
    if not recs:
        raise HTTPException(400, "No rows with dates found. Upload a Sponsored Products Search Term or Campaign report.")
    if replace:
        lo, hi = min(r.date for r in recs), max(r.date for r in recs)
        ctx.db.execute(delete(AdMetric).where(AdMetric.org_id == ctx.org_id, AdMetric.date >= lo, AdMetric.date <= hi))
    ctx.db.add_all(recs)
    ctx.db.commit()
    return {"imported": len(recs)}


@router.get("/ppc")
def ppc(days: int = 30, target_acos: float = 25, ctx: Ctx = Depends(get_ctx)):
    since = date.today() - timedelta(days=days)
    rows = ctx.db.scalars(select(AdMetric).where(AdMetric.org_id == ctx.org_id, AdMetric.date >= since)).all()
    if not rows:
        last = ctx.db.scalar(select(func.max(AdMetric.date)).where(AdMetric.org_id == ctx.org_id))
        if last:
            since = last - timedelta(days=days)
            rows = ctx.db.scalars(select(AdMetric).where(AdMetric.org_id == ctx.org_id, AdMetric.date >= since)).all()
    if not rows:
        return {"available": False, "reason": "No advertising data yet. Upload a Sponsored Products report or connect the Amazon Ads API."}

    def agg(rs):
        imp, clk, sp, sl, od = (sum(getattr(r, k) for r in rs) for k in ("impressions", "clicks", "spend", "sales", "orders"))
        return {"impressions": imp, "clicks": clk, "spend": round(sp, 2), "sales": round(sl, 2), "orders": od, "acos": round(sp / sl * 100, 1) if sl else None,
                "roas": round(sl / sp, 2) if sp else None, "cpc": round(sp / clk, 2) if clk else None, "ctr": round(clk / imp * 100, 2) if imp else None, "cvr": round(od / clk * 100, 1) if clk else None}
    tot = agg(rows)
    total_sales = ctx.db.scalar(select(func.sum(SalesRecord.revenue)).where(SalesRecord.org_id == ctx.org_id, SalesRecord.date >= since)) or 0
    tot["tacos"] = round(tot["spend"] / total_sales * 100, 1) if total_sales else None
    by_c, by_t, by_d = defaultdict(list), defaultdict(list), defaultdict(list)
    for r in rows:
        by_c[r.campaign].append(r)
        by_t[(r.search_term or r.targeting, r.match_type, r.campaign)].append(r)
        by_d[r.date.isoformat()].append(r)
    terms = [{"term": k[0], "match_type": k[1], "campaign": k[2], **agg(v)} for k, v in by_t.items()]
    wasted = sorted([t for t in terms if t["orders"] == 0 and t["clicks"] >= 10], key=lambda t: -t["spend"])[:50]
    winners = sorted([t for t in terms if t["orders"] >= 2 and t["acos"] is not None and t["acos"] <= target_acos and t["match_type"].lower() != "exact"], key=lambda t: -t["sales"])[:50]
    return {"available": True, "period": {"from": since.isoformat(), "to": date.today().isoformat()}, "totals": tot,
            "campaigns": sorted([{"campaign": k, **agg(v)} for k, v in by_c.items()], key=lambda x: -x["spend"]),
            "search_terms": sorted(terms, key=lambda x: -x["spend"])[:500], "daily": [{"date": d, **agg(v)} for d, v in sorted(by_d.items())],
            "wasted_spend": wasted, "harvest": winners, "wasted_total": round(sum(t["spend"] for t in wasted), 2), "classification": "user"}


# ================================================================ reimbursement analysis
@router.post("/reimbursements/analyse")
async def analyse_reimb(ctx: Ctx = Depends(need_analyst), adjustments: UploadFile = File(...), reimbursements: UploadFile | None = File(None), unit_value: float = Form(0.0)):
    adj = _rows(await adjustments.read(), adjustments.filename or "")
    reim = _rows(await reimbursements.read(), reimbursements.filename or "") if reimbursements else []
    lost = defaultdict(lambda: {"lost": 0, "damaged": 0, "found": 0, "refs": []})
    for r in adj:
        sku = str(_pick(r, "sku", "msku") or "")
        reason = str(_pick(r, "reason") or "").upper().strip()
        q = int(_num(_pick(r, "quantity")))
        d = lost[sku]
        if reason in ("M", "5", "MISPLACED", "LOST"):
            d["lost"] += abs(q)
        elif reason in ("E", "H", "K", "U", "6", "7", "D", "DAMAGED"):
            d["damaged"] += abs(q)
        elif reason in ("F", "FOUND", "N", "P"):
            d["found"] += abs(q)
        ref = str(_pick(r, "transaction-item-id", "reference id", "fnsku") or "")
        if ref:
            d["refs"].append(ref)
    paid = defaultdict(lambda: {"qty": 0, "amount": 0.0})
    for r in reim:
        sku = str(_pick(r, "sku") or "")
        paid[sku]["qty"] += int(_num(_pick(r, "quantity-reimbursed-total", "quantity reimbursed", "quantity-reimbursed-cash")))
        paid[sku]["amount"] += _num(_pick(r, "amount-total", "amount"))
    cases = []
    ctx.db.execute(delete(ReimbursementCase).where(ReimbursementCase.org_id == ctx.org_id, ReimbursementCase.status == "identified"))
    for sku, d in lost.items():
        net = d["lost"] + d["damaged"] - d["found"] - paid[sku]["qty"]
        if net <= 0:
            continue
        avg = (paid[sku]["amount"] / paid[sku]["qty"]) if paid[sku]["qty"] else unit_value
        c = ReimbursementCase(org_id=ctx.org_id, case_type="lost_or_damaged_in_warehouse", sku=sku, quantity=net, estimated_amount=round(net * avg, 2),
                              evidence={"lost": d["lost"], "damaged": d["damaged"], "found": d["found"], "reimbursed_units": paid[sku]["qty"], "valuation_basis": "average past reimbursement" if paid[sku]["qty"] else "unit value you entered",
                                        "references": d["refs"][:20]})
        ctx.db.add(c)
        cases.append(c)
    ctx.db.commit()
    return {"cases": len(cases), "estimated_total": round(sum(c.estimated_amount for c in cases), 2)}


@router.get("/reimbursements")
def reimb(ctx: Ctx = Depends(get_ctx)):
    rows = ctx.db.scalars(select(ReimbursementCase).where(ReimbursementCase.org_id == ctx.org_id).order_by(ReimbursementCase.estimated_amount.desc())).all()
    return {"items": [{"id": c.id, "type": c.case_type, "sku": c.sku, "quantity": c.quantity, "estimated_amount": c.estimated_amount, "evidence": c.evidence, "status": c.status, "updated_at": c.updated_at} for c in rows],
            "note": "Possible discrepancies only. Review each case against your Seller Central records; you decide whether to file a claim with Amazon. Kestrel never submits claims."}


@router.patch("/reimbursements/{cid}")
def reimb_status(cid: int, body: dict, ctx: Ctx = Depends(need_analyst)):
    c = ctx.db.get(ReimbursementCase, cid)
    if not c or c.org_id != ctx.org_id:
        raise HTTPException(404, "Case not found")
    if "status" in body:
        if body["status"] not in ("identified", "reviewed_by_seller", "filed_by_seller", "resolved", "dismissed"):
            raise HTTPException(422, "Unknown status")
        c.status = body["status"]
    ctx.db.commit()
    return {"ok": True}
