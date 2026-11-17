"""Scheduled refresh of tracked products (daily). Uses only connected providers; never fabricates values."""
from sqlalchemy import select

from ..models import TrackedProduct
from ..worker import every, job
from . import products as psvc


@job("tracking.refresh")
def refresh_tracked(db, j):
    q = select(TrackedProduct)
    if j.org_id:
        q = q.where(TrackedProduct.org_id == j.org_id)
    done, failed = 0, 0
    seen = set()
    for t in db.scalars(q):
        if t.product_id in seen:
            continue
        seen.add(t.product_id)
        p = t.product
        rep = psvc.refresh_from_providers(db, t.org_id, p)
        if rep["ok"]:
            psvc.snapshot(db, p, ",".join(rep["ok"]))
            done += 1
        else:
            failed += 1
        db.commit()
    return {"refreshed": done, "no_source": failed}


every(86400, "tracking.refresh")
