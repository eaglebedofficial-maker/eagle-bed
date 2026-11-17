"""Keyword research, reverse ASIN, rank/keyword tracker, index checker, keyword processor, lists."""
from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy import func, select

from ..audit import audit_ctx
from ..db import utcnow
from ..deps import Ctx, get_ctx, need_analyst
from ..models import IndexCheck, Keyword, KeywordList, KeywordListItem, Product, RankHistory, RankTrack
from ..providers import ProviderError, get_provider
from ..services import keywords as kw
from ..services.ranks import check_tracks

router = APIRouter(prefix="/keywords", tags=["keywords"])


def upsert_kw(ctx: Ctx, mkt: str, phrase: str, volume=None, source="") -> Keyword:
    phrase = " ".join(phrase.lower().split())[:300]
    k = ctx.db.scalar(select(Keyword).where(Keyword.marketplace == mkt, Keyword.phrase == phrase))
    if not k:
        k = Keyword(marketplace=mkt, phrase=phrase)
        ctx.db.add(k)
    if volume is not None:
        k.search_volume, k.volume_source, k.updated_at = int(volume), source, utcnow()
    ctx.db.flush()
    return k


def kw_out(k: Keyword, **extra):
    return {"id": k.id, "keyword": k.phrase, "search_volume": k.search_volume, "volume_source": k.volume_source, "difficulty": k.difficulty, "cpc": k.cpc,
            "result_count": k.result_count, "trend": k.trend, "updated_at": k.updated_at, **extra}


class ResearchIn(BaseModel):
    seed: str = Field(min_length=1, max_length=200)
    marketplace: str = "UK"
    limit: int = 200


@router.post("/research")
def research(body: ResearchIn, ctx: Ctx = Depends(need_analyst)):
    dfs = get_provider(ctx.db, ctx.org_id, "dataforseo")
    res = dfs.related_keywords(body.marketplace, body.seed, limit=body.limit)
    out = []
    for r in res.data:
        if not r["keyword"]:
            continue
        k = upsert_kw(ctx, body.marketplace, r["keyword"], r["search_volume"], "dataforseo")
        out.append(kw_out(k, depth=r["depth"], relevance=kw.relevance(r["keyword"], [body.seed])))
    # CPC / bid estimates when the Ads API is connected
    ads = get_provider(ctx.db, ctx.org_id, "ads_api")
    bids_note = None
    if ads.configured():
        try:
            asins = [p.asin for p in ctx.db.scalars(select(Product).where(Product.org_id == ctx.org_id, Product.marketplace == body.marketplace).limit(3))]
            if asins:
                for b in ads.keyword_bid_recommendations(asins, [o["keyword"] for o in out[:100]]).data:
                    k = upsert_kw(ctx, body.marketplace, b["keyword"])
                    k.cpc = b["mid"]
                for o in out:
                    o["cpc"] = ctx.db.scalar(select(Keyword.cpc).where(Keyword.id == o["id"]))
        except ProviderError as e:
            bids_note = e.message
    audit_ctx(ctx, "keywords.research", "keyword", body.seed, {"results": len(out)})
    ctx.db.commit()
    return {"seed": body.seed, "items": sorted(out, key=lambda x: -(x["search_volume"] or 0)), "source": res.provenance.dict(), "bids_note": bids_note}


class VolumeIn(BaseModel):
    keywords: list[str]
    marketplace: str = "UK"


@router.post("/volume")
def volume(body: VolumeIn, ctx: Ctx = Depends(need_analyst)):
    dfs = get_provider(ctx.db, ctx.org_id, "dataforseo")
    res = dfs.search_volume(body.marketplace, [k for k in body.keywords if k.strip()][:1000])
    out = [kw_out(upsert_kw(ctx, body.marketplace, r["keyword"], r["search_volume"], "dataforseo")) for r in res.data if r["keyword"]]
    ctx.db.commit()
    return {"items": out, "source": res.provenance.dict()}


class SerpIn(BaseModel):
    keyword: str
    marketplace: str = "UK"


@router.post("/serp")
def serp(body: SerpIn, ctx: Ctx = Depends(need_analyst)):
    """Amazon page 1 for a keyword: organic and sponsored positions, difficulty."""
    dfs = get_provider(ctx.db, ctx.org_id, "dataforseo")
    res = dfs.serp(body.marketplace, body.keyword)
    k = upsert_kw(ctx, body.marketplace, body.keyword)
    k.difficulty = kw.difficulty_from_serp(res.data["items"])
    k.result_count = res.data.get("result_count")
    ctx.db.commit()
    return {"keyword": kw_out(k), "items": res.data["items"], "source": res.provenance.dict(), "difficulty_method": "Kestrel estimate from page-1 review walls"}


class ReverseIn(BaseModel):
    asins: list[str] = Field(min_length=1, max_length=10)
    marketplace: str = "UK"
    limit: int = 300


@router.post("/reverse-asin")
def reverse_asin(body: ReverseIn, ctx: Ctx = Depends(need_analyst)):
    dfs = get_provider(ctx.db, ctx.org_id, "dataforseo")
    per: dict[str, dict] = {}
    asins = [a.strip().upper() for a in body.asins if a.strip()]
    for a in asins:
        for r in dfs.ranked_keywords(body.marketplace, a, limit=body.limit).data:
            if not r["keyword"]:
                continue
            row = per.setdefault(r["keyword"], {"keyword": r["keyword"], "search_volume": r["search_volume"], "positions": {}})
            row["positions"][a] = {"position": r["position"], "sponsored": "paid" in (r["type"] or "")}
            if r["search_volume"] is not None:
                row["search_volume"] = r["search_volume"]
                upsert_kw(ctx, body.marketplace, r["keyword"], r["search_volume"], "dataforseo")
    rows = list(per.values())
    for r in rows:
        r["ranking_count"] = len(r["positions"])
        r["overlap"] = r["ranking_count"] / len(asins)
        best = min((p["position"] for p in r["positions"].values() if p["position"]), default=None)
        r["best_position"] = best
        vol = r["search_volume"] or 0
        r["opportunity"] = round(min(100, (vol ** 0.5) / 3 * (1.2 if r["ranking_count"] < len(asins) else 1) * (1.3 if best and best > 10 else 1)))
    gaps = {a: [r["keyword"] for r in sorted(rows, key=lambda x: -(x["search_volume"] or 0)) if a not in r["positions"]][:100] for a in asins}
    ctx.db.commit()
    return {"asins": asins, "items": sorted(rows, key=lambda x: -(x["search_volume"] or 0)), "gaps": gaps,
            "overlap_matrix": {a: {b: sum(1 for r in rows if a in r["positions"] and b in r["positions"]) for b in asins} for a in asins},
            "source": {"provider": "dataforseo", "classification": "licensed"}}


class ProcessIn(BaseModel):
    text: str
    remove_words: list[str] = []
    min_words: int = 1
    dedupe_words: bool = True


@router.post("/process")
def process(body: ProcessIn, ctx: Ctx = Depends(get_ctx)):
    return kw.process(body.text, remove_words=body.remove_words, min_len=body.min_words, dedupe_words=body.dedupe_words)


# ---------------------------------------------------------------- lists
@router.get("/lists")
def lists(ctx: Ctx = Depends(get_ctx)):
    rows = ctx.db.scalars(select(KeywordList).where(KeywordList.org_id == ctx.org_id).order_by(KeywordList.updated_at.desc())).all()
    return [{"id": l.id, "name": l.name, "marketplace": l.marketplace, "source": l.source, "count": ctx.db.scalar(select(func.count()).select_from(KeywordListItem).where(KeywordListItem.list_id == l.id)),
             "updated_at": l.updated_at} for l in rows]


class ListIn(BaseModel):
    name: str = Field(min_length=1, max_length=160)
    marketplace: str = "UK"
    keywords: list[str] = []
    source: str = ""


@router.post("/lists")
def create_list(body: ListIn, ctx: Ctx = Depends(need_analyst)):
    l = KeywordList(org_id=ctx.org_id, name=body.name, marketplace=body.marketplace, source=body.source)
    ctx.db.add(l)
    ctx.db.flush()
    _add_items(ctx, l, body.keywords)
    ctx.db.commit()
    return {"id": l.id}


def _add_items(ctx, l, phrases):
    existing = set(ctx.db.scalars(select(KeywordListItem.keyword_id).where(KeywordListItem.list_id == l.id)))
    for ph in phrases:
        if not ph.strip():
            continue
        k = upsert_kw(ctx, l.marketplace, ph)
        if k.id not in existing:
            ctx.db.add(KeywordListItem(list_id=l.id, keyword_id=k.id))
            existing.add(k.id)


class ItemsIn(BaseModel):
    keywords: list[str]


@router.post("/lists/{lid}/items")
def add_items(lid: int, body: ItemsIn, ctx: Ctx = Depends(need_analyst)):
    l = ctx.db.get(KeywordList, lid)
    if not l or l.org_id != ctx.org_id:
        raise HTTPException(404, "List not found")
    _add_items(ctx, l, body.keywords)
    ctx.db.commit()
    return {"ok": True}


@router.get("/lists/{lid}")
def get_list(lid: int, ctx: Ctx = Depends(get_ctx)):
    l = ctx.db.get(KeywordList, lid)
    if not l or l.org_id != ctx.org_id:
        raise HTTPException(404, "List not found")
    items = ctx.db.scalars(select(KeywordListItem).where(KeywordListItem.list_id == lid)).all()
    return {"id": l.id, "name": l.name, "marketplace": l.marketplace, "items": [kw_out(i.keyword, item_id=i.id, relevance=i.relevance, tags=i.tags) for i in items]}


@router.delete("/lists/{lid}")
def delete_list(lid: int, ctx: Ctx = Depends(need_analyst)):
    l = ctx.db.get(KeywordList, lid)
    if l and l.org_id == ctx.org_id:
        ctx.db.delete(l)
        ctx.db.commit()
    return {"ok": True}


@router.delete("/lists/{lid}/items/{iid}")
def delete_item(lid: int, iid: int, ctx: Ctx = Depends(need_analyst)):
    l = ctx.db.get(KeywordList, lid)
    i = ctx.db.get(KeywordListItem, iid)
    if l and i and l.org_id == ctx.org_id and i.list_id == lid:
        ctx.db.delete(i)
        ctx.db.commit()
    return {"ok": True}


# ---------------------------------------------------------------- rank tracker
class TrackIn(BaseModel):
    product_id: int
    keywords: list[str]


@router.post("/tracks")
def add_tracks(body: TrackIn, ctx: Ctx = Depends(need_analyst)):
    p = ctx.db.get(Product, body.product_id)
    if not p or p.org_id != ctx.org_id:
        raise HTTPException(404, "Product not found")
    n = 0
    for ph in body.keywords:
        if not ph.strip():
            continue
        k = upsert_kw(ctx, p.marketplace, ph)
        if not ctx.db.scalar(select(RankTrack.id).where(RankTrack.org_id == ctx.org_id, RankTrack.product_id == p.id, RankTrack.keyword_id == k.id)):
            ctx.db.add(RankTrack(org_id=ctx.org_id, product_id=p.id, keyword_id=k.id))
            n += 1
    ctx.db.commit()
    return {"added": n}


@router.get("/tracks")
def tracks(product_id: int | None = None, days: int = 30, ctx: Ctx = Depends(get_ctx)):
    q = select(RankTrack).where(RankTrack.org_id == ctx.org_id)
    if product_id:
        q = q.where(RankTrack.product_id == product_id)
    since = utcnow() - timedelta(days=days)
    out = []
    for t in ctx.db.scalars(q.order_by(RankTrack.created_at.desc())):
        hist = ctx.db.scalars(select(RankHistory).where(RankHistory.track_id == t.id, RankHistory.ts >= since).order_by(RankHistory.ts)).all()
        last = hist[-1] if hist else None
        prev = hist[-2] if len(hist) > 1 else None
        week = [h for h in hist if h.ts <= utcnow() - timedelta(days=7)]
        out.append({"id": t.id, "active": t.active, "product_id": t.product_id, "asin": t.product.asin, "product_title": t.product.title, "keyword_id": t.keyword_id,
                    "keyword": t.keyword.phrase, "search_volume": t.keyword.search_volume, "organic": last.organic_pos if last else None,
                    "sponsored": last.sponsored_pos if last else None, "change": (prev.organic_pos - last.organic_pos) if last and prev and last.organic_pos and prev.organic_pos else None,
                    "change_7d": (week[-1].organic_pos - last.organic_pos) if last and week and last.organic_pos and week[-1].organic_pos else None,
                    "checked_at": last.ts if last else None, "history": [{"ts": h.ts, "organic": h.organic_pos, "sponsored": h.sponsored_pos} for h in hist]})
    return out


@router.post("/tracks/check")
def check_now(track_ids: list[int] | None = None, ctx: Ctx = Depends(need_analyst)):
    q = select(RankTrack).where(RankTrack.org_id == ctx.org_id, RankTrack.active.is_(True))
    if track_ids:
        q = q.where(RankTrack.id.in_(track_ids))
    ts = list(ctx.db.scalars(q.limit(200)))
    if not get_provider(ctx.db, ctx.org_id, "dataforseo").configured():
        raise ProviderError("not_configured", "Rank checks need DataForSEO (Amazon search results). Connect it in Settings → Integrations.", "dataforseo")
    distinct = {(t.keyword.marketplace, t.keyword.phrase) for t in ts}
    if len(distinct) > 5:  # each keyword is a live search (up to ~60 s): run large batches in the worker
        from ..worker import enqueue
        enqueue(ctx.db, "ranks.check", {"track_ids": [t.id for t in ts]}, org_id=ctx.org_id)
        ctx.db.commit()
        return {"checked": 0, "errors": [], "queued": len(ts)}
    return check_tracks(ctx.db, ts)


@router.delete("/tracks/{tid}")
def del_track(tid: int, ctx: Ctx = Depends(need_analyst)):
    t = ctx.db.get(RankTrack, tid)
    if t and t.org_id == ctx.org_id:
        ctx.db.delete(t)
        ctx.db.commit()
    return {"ok": True}


# ---------------------------------------------------------------- index checker
class IndexIn(BaseModel):
    product_id: int
    keywords: list[str]


@router.post("/index-check")
def index_check(body: IndexIn, ctx: Ctx = Depends(need_analyst)):
    """A keyword counts as indexed when the ASIN appears in Amazon results for that keyword (SERP data)."""
    p = ctx.db.get(Product, body.product_id)
    if not p or p.org_id != ctx.org_id:
        raise HTTPException(404, "Product not found")
    dfs = get_provider(ctx.db, ctx.org_id, "dataforseo")
    if not dfs.configured():
        raise ProviderError("not_configured", "Index checks need DataForSEO (Amazon search results). Connect it in Settings → Integrations.", "dataforseo")
    phrases = list(dict.fromkeys(k.strip() for k in body.keywords if k.strip()))[:50]

    def look(ph):  # network only; database writes stay on this thread
        try:
            items = dfs.serp(p.marketplace, f"{p.asin} {ph}", depth=20, wait=45).data["items"]
            return any(i.get("asin") == p.asin for i in items)
        except ProviderError:
            return None

    from concurrent.futures import ThreadPoolExecutor
    with ThreadPoolExecutor(max_workers=8) as pool:
        results = list(pool.map(look, phrases))
    out = []
    for ph, ok in zip(phrases, results):
        k = upsert_kw(ctx, p.marketplace, ph)
        ctx.db.add(IndexCheck(org_id=ctx.org_id, product_id=p.id, keyword_id=k.id, indexed=ok, source="dataforseo"))
        out.append({"keyword": k.phrase, "indexed": ok})
    ctx.db.commit()
    return {"items": out, "method": "Searches Amazon for “ASIN + keyword”; the product appearing means the keyword is attached to the listing."}


@router.get("/index-check")
def index_history(product_id: int, ctx: Ctx = Depends(get_ctx)):
    rows = ctx.db.scalars(select(IndexCheck).where(IndexCheck.org_id == ctx.org_id, IndexCheck.product_id == product_id).order_by(IndexCheck.checked_at.desc()).limit(500)).all()
    kws = {k.id: k.phrase for k in ctx.db.scalars(select(Keyword).where(Keyword.id.in_({r.keyword_id for r in rows})))}
    return [{"keyword": kws.get(r.keyword_id), "indexed": r.indexed, "checked_at": r.checked_at} for r in rows]
