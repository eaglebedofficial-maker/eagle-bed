"""Scheduled keyword rank checks via DataForSEO Amazon SERP (organic + sponsored)."""
from collections import defaultdict

from sqlalchemy import select

from ..db import utcnow
from ..models import IndexCheck, Keyword, RankHistory, RankTrack
from ..providers import ProviderError, get_provider
from ..worker import every, job


def check_tracks(db, tracks: list[RankTrack]) -> dict:
    by_kw: dict[tuple, list[RankTrack]] = defaultdict(list)
    for t in tracks:
        by_kw[(t.org_id, t.keyword.marketplace, t.keyword.phrase)].append(t)
    done, errors = 0, []
    for (org_id, mkt, phrase), ts in by_kw.items():
        dfs = get_provider(db, org_id, "dataforseo")
        if not dfs.configured():
            errors.append("DataForSEO not connected")
            continue
        try:
            serp = dfs.serp(mkt, phrase, depth=100).data
        except ProviderError as e:
            errors.append(e.message)
            continue
        org_pos = {}
        spon_pos = {}
        n = 0
        for it in serp["items"]:
            a = it.get("asin")
            if not a:
                continue
            if it.get("sponsored"):
                spon_pos.setdefault(a, it.get("rank_absolute"))
            else:
                n += 1
                org_pos.setdefault(a, n)
        kw = ts[0].keyword
        kw.result_count = serp.get("result_count") or kw.result_count
        for t in ts:
            a = t.product.asin
            op = org_pos.get(a)
            db.add(RankHistory(track_id=t.id, organic_pos=op, sponsored_pos=spon_pos.get(a), page=((op - 1) // 48 + 1) if op else None, source="dataforseo"))
            done += 1
        db.commit()
    return {"checked": done, "errors": sorted(set(errors))}


@job("ranks.check")
def _job(db, j):
    q = select(RankTrack).where(RankTrack.active.is_(True))
    if j.org_id:
        q = q.where(RankTrack.org_id == j.org_id)
    if j.payload.get("track_ids"):
        q = q.where(RankTrack.id.in_(j.payload["track_ids"]))
    return check_tracks(db, list(db.scalars(q)))


every(86400, "ranks.check")
