"""Historical analytics computed only from retrieved history (Keepa or our own tracking snapshots)."""
from __future__ import annotations

import math
import statistics
from collections import defaultdict
from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from ..models import BuyBoxHistory, PriceHistory, ProductSnapshot


def _series(db: Session, product_id: int, series: str, since: datetime | None) -> list[tuple[datetime, float]]:
    q = select(PriceHistory.ts, PriceHistory.value).where(PriceHistory.product_id == product_id, PriceHistory.series == series)
    if since:
        q = q.where(PriceHistory.ts >= since)
    return [(t, v) for t, v in db.execute(q.order_by(PriceHistory.ts)).all() if v is not None]


def time_weighted_avg(points: list[tuple[datetime, float]], end: datetime) -> float | None:
    if not points:
        return None
    if len(points) == 1:
        return points[0][1]
    total, dur = 0.0, 0.0
    for i, (t, v) in enumerate(points):
        nxt = points[i + 1][0] if i + 1 < len(points) else end
        d = max((nxt - t).total_seconds(), 0)
        total += v * d
        dur += d
    return total / dur if dur else points[-1][1]


def stats_for(points, end) -> dict:
    vals = [v for _, v in points]
    if not vals:
        return {}
    mean = statistics.fmean(vals)
    sd = statistics.pstdev(vals) if len(vals) > 1 else 0.0
    return {"avg": round(time_weighted_avg(points, end), 2), "min": min(vals), "max": max(vals), "points": len(vals), "cv": round(sd / mean, 4) if mean else None,
            "first": vals[0], "last": vals[-1]}


def analyse(db: Session, product_id: int, days_list=(30, 90, 180, 365)) -> dict:
    now = datetime.now(timezone.utc)
    all_price = _series(db, product_id, "buybox", None) or _series(db, product_id, "new", None) or _series(db, product_id, "amazon", None)
    all_rank = _series(db, product_id, "rank", None)
    if not all_price and not all_rank:
        snaps = db.execute(select(ProductSnapshot.ts, ProductSnapshot.price, ProductSnapshot.bsr).where(ProductSnapshot.product_id == product_id).order_by(ProductSnapshot.ts)).all()
        all_price = [(t, p) for t, p, _ in snaps if p]
        all_rank = [(t, b) for t, _, b in snaps if b]
        source = "tracking" if snaps else None
    else:
        source = "keepa"
    if not all_price and not all_rank:
        return {"available": False, "reason": "No history retrieved yet. Connect Keepa or track this product to build history."}
    out = {"available": True, "source": source, "period_from": (all_price or all_rank)[0][0].isoformat(), "period_to": now.isoformat(), "windows": {}}
    for d in days_list:
        since = now - timedelta(days=d)
        p = [x for x in all_price if x[0] >= since]
        r = [x for x in all_rank if x[0] >= since]
        # carry the last value before the window in, so step series are correct
        prev_p = [x for x in all_price if x[0] < since][-1:]
        prev_r = [x for x in all_rank if x[0] < since][-1:]
        if prev_p:
            p = [(since, prev_p[0][1])] + p
        if prev_r:
            r = [(since, prev_r[0][1])] + r
        covered = (now - (all_price or all_rank)[0][0]).days >= d * 0.9
        out["windows"][str(d)] = {"price": stats_for(p, now), "rank": stats_for(r, now), "complete": covered}
    p90 = out["windows"]["90"]["price"]
    r90 = out["windows"]["90"]["rank"]
    out["price_stability"] = round(max(0.0, 1 - (p90.get("cv") or 0) * 5), 3) if p90 else None
    if r90 and r90.get("points", 0) > 3:
        logs = [math.log10(v) for _, v in all_rank if v and v > 0 and _ >= now - timedelta(days=90)]
        sd = statistics.pstdev(logs) if len(logs) > 1 else 0
        out["sales_consistency"] = round(max(0.0, 1 - sd / 0.6), 3)
        out["rank_volatility"] = round(sd, 3)
        first30 = [v for t, v in all_rank if now - timedelta(days=90) <= t < now - timedelta(days=60)]
        last30 = [v for t, v in all_rank if t >= now - timedelta(days=30)]
        if first30 and last30:
            a, b = statistics.fmean(first30), statistics.fmean(last30)
            out["bsr_movement_pct"] = round((a - b) / a * 100, 1)  # positive = rank improving
    else:
        out["sales_consistency"] = None
    # seasonality from 12 months of rank: spread of monthly mean log-rank
    if all_rank and (now - all_rank[0][0]).days >= 330:
        monthly = defaultdict(list)
        for t, v in all_rank:
            if t >= now - timedelta(days=365) and v > 0:
                monthly[t.month].append(math.log10(v))
        if len(monthly) >= 10:
            means = [statistics.fmean(v) for v in monthly.values()]
            out["seasonality"] = round(min(1.0, (max(means) - min(means)) / 0.8), 3)
            out["best_months"] = sorted(monthly, key=lambda m: statistics.fmean(monthly[m]))[:3]
    else:
        out["seasonality"] = None
    # buy box ownership
    bb = db.execute(select(BuyBoxHistory.ts, BuyBoxHistory.seller_id).where(BuyBoxHistory.product_id == product_id, BuyBoxHistory.ts >= now - timedelta(days=90)).order_by(BuyBoxHistory.ts)).all()
    if bb:
        share = defaultdict(float)
        for i, (t, s) in enumerate(bb):
            end = bb[i + 1][0] if i + 1 < len(bb) else now
            share[s] += (end - t).total_seconds()
        tot = sum(share.values()) or 1
        dist = sorted(({"seller_id": k, "share": round(v / tot, 4), "is_amazon": k in AMAZON_SELLER_IDS} for k, v in share.items()), key=lambda x: -x["share"])
        out["buybox"] = {"distribution": dist[:10], "changes_90d": sum(1 for i in range(1, len(bb)) if bb[i][1] != bb[i - 1][1]),
                         "amazon_share": round(sum(d["share"] for d in dist if d["is_amazon"]), 4), "stability": round(dist[0]["share"], 3) if dist else None}
    return out


AMAZON_SELLER_IDS = {"A3P5ROKL5A1OLE", "ATVPDKIKX0DER", "A1PA6795UKMFR9", "A1X6FK5RDHNB96", "A3JWKAKR8XB7XF", "A11IL2PNWYJU7H", "A1AT7YVPFBWXBL", "A2Q3Y263D00KWC"}
