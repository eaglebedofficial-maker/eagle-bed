"""Listing analyzer & optimizer, review intelligence, competitor sets, market tracker."""
from datetime import timedelta

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from pydantic import BaseModel, Field
from sqlalchemy import func, select

from ..audit import audit_ctx
from ..db import utcnow
from ..deps import Ctx, get_ctx, need_analyst
from ..models import (KeywordList, KeywordListItem, ListingAnalysis, ListingDraft, Product, ProductSnapshot, ReviewDataset, TrackedProduct, TrackingGroup)
from ..providers import get_provider
from ..services import listing as ls
from .products import product_out

router = APIRouter(tags=["listings"])


class AnalyseIn(BaseModel):
    product_id: int | None = None
    title: str = ""
    bullets: list[str] = []
    description: str = ""
    backend: str = ""
    keywords: list[str] = []
    keyword_list_id: int | None = None
    images: int | None = None
    has_aplus: bool | None = None
    has_video: bool | None = None
    competitor_ids: list[int] = []


def _kw_from_list(ctx: Ctx, lid: int | None) -> list[str]:
    if not lid:
        return []
    l = ctx.db.get(KeywordList, lid)
    if not l or l.org_id != ctx.org_id:
        return []
    return [i.keyword.phrase for i in ctx.db.scalars(select(KeywordListItem).where(KeywordListItem.list_id == lid))]


@router.post("/listings/analyse")
def analyse(body: AnalyseIn, ctx: Ctx = Depends(get_ctx)):
    p = ctx.db.get(Product, body.product_id) if body.product_id else None
    if p and p.org_id != ctx.org_id:
        raise HTTPException(404, "Product not found")
    comps = [c.title for c in ctx.db.scalars(select(Product).where(Product.id.in_(body.competitor_ids), Product.org_id == ctx.org_id))] if body.competitor_ids else []
    title = body.title or (p.title if p else "")
    raw = (p.raw or {}) if p else {}
    res = ls.analyse(title=title, bullets=body.bullets or raw.get("bullets", []), description=body.description or raw.get("description", ""), backend=body.backend,
                     keywords=body.keywords or _kw_from_list(ctx, body.keyword_list_id), images=body.images if body.images is not None else (p.image_count if p else None),
                     has_aplus=body.has_aplus if body.has_aplus is not None else (p.has_aplus if p else None),
                     has_video=body.has_video if body.has_video is not None else (p.has_video if p else None),
                     rating=p.rating if p else None, reviews=p.review_count if p else None, competitor_titles=comps)
    a = ListingAnalysis(org_id=ctx.org_id, product_id=p.id if p else None, input=body.model_dump(), score=res["score"], components=res["components"], gaps={"issues": res["issues"], "competitor_gaps": res["competitor_gaps"]})
    ctx.db.add(a)
    if p:
        p.listing_quality = res["score"]
    ctx.db.commit()
    return res


@router.get("/listings/drafts")
def drafts(ctx: Ctx = Depends(get_ctx)):
    rows = ctx.db.scalars(select(ListingDraft).where(ListingDraft.org_id == ctx.org_id).order_by(ListingDraft.updated_at.desc())).all()
    return [{"id": d.id, "name": d.name, "product_id": d.product_id, "title": d.title, "bullets": d.bullets, "description": d.description, "backend_terms": d.backend_terms,
             "keyword_list_id": d.keyword_list_id, "facts": d.facts, "updated_at": d.updated_at} for d in rows]


class DraftIn(BaseModel):
    name: str = "Untitled listing"
    product_id: int | None = None
    title: str = ""
    bullets: list[str] = ["", "", "", "", ""]
    description: str = ""
    backend_terms: str = ""
    keyword_list_id: int | None = None
    facts: str = ""


@router.post("/listings/drafts")
def create_draft(body: DraftIn, ctx: Ctx = Depends(need_analyst)):
    d = ListingDraft(org_id=ctx.org_id, **body.model_dump())
    ctx.db.add(d)
    ctx.db.commit()
    return {"id": d.id}


@router.put("/listings/drafts/{did}")
def save_draft(did: int, body: DraftIn, ctx: Ctx = Depends(need_analyst)):
    d = ctx.db.get(ListingDraft, did)
    if not d or d.org_id != ctx.org_id:
        raise HTTPException(404, "Draft not found")
    for k, v in body.model_dump().items():
        setattr(d, k, v)
    ctx.db.commit()
    return {"ok": True}


@router.delete("/sets/{gid}/products/{pid}")
def remove_from_set(gid: int, pid: int, ctx: Ctx = Depends(need_analyst)):
    g = ctx.db.get(TrackingGroup, gid)
    if not g or g.org_id != ctx.org_id:
        raise HTTPException(404, "Set not found")
    for t in ctx.db.scalars(select(TrackedProduct).where(TrackedProduct.group_id == gid, TrackedProduct.product_id == pid)):
        ctx.db.delete(t)
    ctx.db.commit()
    return {"ok": True}


@router.delete("/listings/drafts/{did}")
def delete_draft(did: int, ctx: Ctx = Depends(need_analyst)):
    d = ctx.db.get(ListingDraft, did)
    if d and d.org_id == ctx.org_id:
        ctx.db.delete(d)
        ctx.db.commit()
    return {"ok": True}


class WriteIn(BaseModel):
    marketplace: str = "UK"
    facts: str = Field(min_length=10)
    keywords: list[str] = []
    keyword_list_id: int | None = None
    competitor_ids: list[int] = []
    review_dataset_id: int | None = None


@router.post("/listings/generate")
def generate(body: WriteIn, ctx: Ctx = Depends(need_analyst)):
    ai = get_provider(ctx.db, ctx.org_id, "anthropic")
    kws = body.keywords or _kw_from_list(ctx, body.keyword_list_id)
    comps = [c.title for c in ctx.db.scalars(select(Product).where(Product.id.in_(body.competitor_ids), Product.org_id == ctx.org_id))] if body.competitor_ids else []
    complaints = []
    if body.review_dataset_id:
        ds = ctx.db.get(ReviewDataset, body.review_dataset_id)
        if ds and ds.org_id == ctx.org_id:
            complaints = [f"{t['theme']} ({t['negative']} negative mentions)" for t in (ds.analysis.get("themes") or []) if t.get("negative")][:8]
    schema = {"type": "object", "additionalProperties": False, "required": ["title", "bullets", "description", "backend_terms", "keyword_placement", "notes"],
              "properties": {"title": {"type": "string"}, "bullets": {"type": "array", "items": {"type": "string"}}, "description": {"type": "string"},
                             "backend_terms": {"type": "string"}, "keyword_placement": {"type": "array", "items": {"type": "object", "additionalProperties": False, "required": ["keyword", "where"], "properties": {"keyword": {"type": "string"}, "where": {"type": "string"}}}},
                             "notes": {"type": "array", "items": {"type": "string"}}}}
    system = ("You write Amazon product listings that follow Amazon's style guide. Use only the product facts given; never invent specifications, certifications, "
              "awards or claims. No promotional or prohibited claims (best, #1, guaranteed, eco-friendly, antibacterial, medical claims). Write for the marketplace's language and spelling.")
    prompt = (f"Marketplace: Amazon {body.marketplace}.\nProduct facts:\n{body.facts}\n\nTarget keywords (most important first):\n" + "\n".join(kws[:80]) +
              ("\n\nCompetitor titles for context (do not copy):\n" + "\n".join(comps[:10]) if comps else "") +
              ("\n\nCustomer complaints about competitors to address with facts we have:\n" + "\n".join(complaints) if complaints else "") +
              "\n\nWrite: a title of 150–200 characters with the main keyword first; exactly 5 bullets of 150–250 characters, each starting with a short capitalised benefit label; "
              "a description of 800–1500 characters; backend search terms under 245 bytes, lower case, no commas, no words repeated from the title, no brand names. "
              "In notes, list any facts you would need to make the listing stronger.")
    res = ai.json(system=system, prompt=prompt, schema=schema, effort="medium")
    out = res.data
    out["bullets"] = (out.get("bullets") or [])[:5] + [""] * max(0, 5 - len(out.get("bullets") or []))
    out["analysis"] = ls.analyse(title=out["title"], bullets=out["bullets"], description=out["description"], backend=out["backend_terms"], keywords=kws)
    out["source"] = {**res.provenance.dict(), "classification": "ai"}
    audit_ctx(ctx, "listing.generated", "listing", "", {"keywords": len(kws)})
    ctx.db.commit()
    return out


# ---------------------------------------------------------------- review intelligence
@router.get("/reviews/datasets")
def datasets(ctx: Ctx = Depends(get_ctx)):
    rows = ctx.db.scalars(select(ReviewDataset).where(ReviewDataset.org_id == ctx.org_id).order_by(ReviewDataset.created_at.desc())).all()
    return [{"id": d.id, "name": d.name, "product_id": d.product_id, "source": d.source, "review_count": d.review_count, "analysed_at": d.analysed_at,
             "has_ai": bool((d.analysis or {}).get("ai")), "created_at": d.created_at} for d in rows]


@router.post("/reviews/datasets")
async def create_dataset(ctx: Ctx = Depends(need_analyst), name: str = Form(...), product_id: int | None = Form(None), text: str = Form(""), file: UploadFile | None = File(None)):
    raw = (await file.read()).decode("utf-8", "replace") if file else text
    reviews = ls.parse_reviews(raw)
    if not reviews:
        raise HTTPException(400, "No reviews found. Paste reviews copied from Amazon (each starting “x out of 5 stars”) or upload a CSV with rating, title and body columns.")
    d = ReviewDataset(org_id=ctx.org_id, product_id=product_id, name=name, source="user_upload", reviews=reviews, review_count=len(reviews))
    d.analysis = ls.review_themes(reviews)
    d.analysed_at = utcnow()
    ctx.db.add(d)
    ctx.db.commit()
    return {"id": d.id, "review_count": len(reviews)}


@router.get("/reviews/datasets/{did}")
def dataset(did: int, ctx: Ctx = Depends(get_ctx)):
    d = ctx.db.get(ReviewDataset, did)
    if not d or d.org_id != ctx.org_id:
        raise HTTPException(404, "Dataset not found")
    return {"id": d.id, "name": d.name, "product_id": d.product_id, "review_count": d.review_count, "analysis": d.analysis, "reviews": d.reviews[:300],
            "source": {"classification": "user", "provider": "Your upload"}}


@router.delete("/reviews/datasets/{did}")
def delete_dataset(did: int, ctx: Ctx = Depends(need_analyst)):
    d = ctx.db.get(ReviewDataset, did)
    if d and d.org_id == ctx.org_id:
        ctx.db.delete(d)
        ctx.db.commit()
    return {"ok": True}


@router.post("/reviews/datasets/{did}/ai")
def ai_report(did: int, ctx: Ctx = Depends(need_analyst)):
    d = ctx.db.get(ReviewDataset, did)
    if not d or d.org_id != ctx.org_id:
        raise HTTPException(404, "Dataset not found")
    ai = get_provider(ctx.db, ctx.org_id, "anthropic")
    numbered = "\n".join(f"[R{i + 1}] ({r.get('rating') or '?'}★) {r.get('title', '')} — {r.get('body', '')[:1200]}" for i, r in enumerate(d.reviews[:400]))
    item = {"type": "object", "additionalProperties": False, "required": ["theme", "detail", "review_ids", "share_pct"],
            "properties": {"theme": {"type": "string"}, "detail": {"type": "string"}, "review_ids": {"type": "array", "items": {"type": "string"}}, "share_pct": {"type": "number"}}}
    schema = {"type": "object", "additionalProperties": False,
              "required": ["summary", "complaints", "praise", "defects", "packaging", "missing_features", "expectations", "improvements", "competitor_weaknesses", "confidence", "limitations"],
              "properties": {"summary": {"type": "string"}, "complaints": {"type": "array", "items": item}, "praise": {"type": "array", "items": item}, "defects": {"type": "array", "items": item},
                             "packaging": {"type": "array", "items": item}, "missing_features": {"type": "array", "items": item}, "expectations": {"type": "array", "items": item},
                             "improvements": {"type": "array", "items": {"type": "object", "additionalProperties": False, "required": ["change", "why", "review_ids", "priority"],
                                                                          "properties": {"change": {"type": "string"}, "why": {"type": "string"}, "review_ids": {"type": "array", "items": {"type": "string"}}, "priority": {"type": "string", "enum": ["high", "medium", "low"]}}}},
                             "competitor_weaknesses": {"type": "array", "items": {"type": "string"}}, "confidence": {"type": "string", "enum": ["high", "medium", "low"]},
                             "limitations": {"type": "array", "items": {"type": "string"}}}}
    res = ai.json(system="You analyse customer reviews for a product team. Every theme must cite the review ids it comes from (e.g. R12). Never invent reviews, quotes or percentages beyond what the reviews support; share_pct is the share of the given reviews mentioning the theme.",
                  prompt=f"{d.review_count} reviews ({min(400, d.review_count)} included):\n{numbered}\n\nProduce the product improvement report.", schema=schema, effort="medium")
    d.analysis = {**(d.analysis or {}), "ai": res.data, "ai_source": res.provenance.dict(), "ai_reviews_used": min(400, d.review_count)}
    ctx.db.commit()
    return d.analysis


# ---------------------------------------------------------------- competitor sets & market tracker
class SetIn(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    kind: str = Field("competitor_set", pattern="^(competitor_set|market)$")
    product_ids: list[int] = []


@router.post("/sets")
def create_set(body: SetIn, ctx: Ctx = Depends(need_analyst)):
    g = TrackingGroup(org_id=ctx.org_id, name=body.name, kind=body.kind)
    ctx.db.add(g)
    ctx.db.flush()
    cap = 10 if body.kind == "competitor_set" else 50
    if len(body.product_ids) > cap:
        raise HTTPException(422, f"A {'competitor set' if cap == 10 else 'market'} holds at most {cap} products.")
    for pid in body.product_ids:
        p = ctx.db.get(Product, pid)
        if p and p.org_id == ctx.org_id:
            ctx.db.add(TrackedProduct(org_id=ctx.org_id, product_id=pid, group_id=g.id))
    ctx.db.commit()
    return {"id": g.id}


@router.post("/sets/{gid}/products")
def add_to_set(gid: int, product_ids: list[int], ctx: Ctx = Depends(need_analyst)):
    g = ctx.db.get(TrackingGroup, gid)
    if not g or g.org_id != ctx.org_id:
        raise HTTPException(404, "Set not found")
    have = set(ctx.db.scalars(select(TrackedProduct.product_id).where(TrackedProduct.group_id == gid)))
    cap = 10 if g.kind == "competitor_set" else 50
    if len(have | set(product_ids)) > cap:
        raise HTTPException(422, f"This set can hold at most {cap} products.")
    for pid in product_ids:
        p = ctx.db.get(Product, pid)
        if p and p.org_id == ctx.org_id and pid not in have:
            ctx.db.add(TrackedProduct(org_id=ctx.org_id, product_id=pid, group_id=gid))
    ctx.db.commit()
    return {"ok": True}


@router.get("/sets")
def list_sets(kind: str = "competitor_set", ctx: Ctx = Depends(get_ctx)):
    rows = ctx.db.scalars(select(TrackingGroup).where(TrackingGroup.org_id == ctx.org_id, TrackingGroup.kind == kind).order_by(TrackingGroup.created_at.desc())).all()
    return [{"id": g.id, "name": g.name, "kind": g.kind, "count": ctx.db.scalar(select(func.count()).select_from(TrackedProduct).where(TrackedProduct.group_id == g.id)), "created_at": g.created_at} for g in rows]


@router.get("/sets/{gid}")
def get_set(gid: int, days: int = 90, ctx: Ctx = Depends(get_ctx)):
    g = ctx.db.get(TrackingGroup, gid)
    if not g or g.org_id != ctx.org_id:
        raise HTTPException(404, "Set not found")
    prods = [t.product for t in ctx.db.scalars(select(TrackedProduct).where(TrackedProduct.group_id == gid))]
    total_rev = sum(p.est_monthly_revenue or 0 for p in prods) or 0
    since = utcnow() - timedelta(days=days)
    changes, timeline = [], {}
    for p in prods:
        snaps = ctx.db.scalars(select(ProductSnapshot).where(ProductSnapshot.product_id == p.id, ProductSnapshot.ts >= since).order_by(ProductSnapshot.ts)).all()
        for a, b in zip(snaps, snaps[1:]):
            if a.price and b.price and abs(b.price - a.price) / a.price >= 0.05:
                changes.append({"product_id": p.id, "asin": p.asin, "title": p.title, "at": b.ts, "type": "price", "from": a.price, "to": b.price})
            if a.offer_count and b.offer_count and b.offer_count != a.offer_count:
                changes.append({"product_id": p.id, "asin": p.asin, "title": p.title, "at": b.ts, "type": "sellers", "from": a.offer_count, "to": b.offer_count})
            if a.review_count is not None and b.review_count is not None and b.review_count - a.review_count >= 20:
                changes.append({"product_id": p.id, "asin": p.asin, "title": p.title, "at": b.ts, "type": "reviews", "from": a.review_count, "to": b.review_count})
        for s in snaps:
            wk = s.ts.date().isoformat()[:10]
            if s.est_monthly_units and p.price:
                timeline.setdefault(wk, {}).setdefault(p.id, s.est_monthly_units * (s.price or p.price))
    weeks = sorted(timeline)
    share_series = [{"date": w, **{str(pid): v for pid, v in timeline[w].items()}} for w in weeks]
    return {"id": g.id, "name": g.name, "kind": g.kind,
            "products": [{**product_out(p, brief=True), "share": (p.est_monthly_revenue or 0) / total_rev if total_rev else None} for p in prods],
            "total_revenue": total_rev, "changes": sorted(changes, key=lambda c: c["at"], reverse=True)[:100], "revenue_series": share_series,
            "classification": "estimated", "basis": "Market share is each product's share of the set's estimated revenue; history comes from tracking snapshots."}


@router.delete("/sets/{gid}")
def delete_set(gid: int, ctx: Ctx = Depends(need_analyst)):
    g = ctx.db.get(TrackingGroup, gid)
    if g and g.org_id == ctx.org_id:
        ctx.db.delete(g)
        ctx.db.commit()
    return {"ok": True}
