"""Background worker: Postgres job queue (SELECT … FOR UPDATE SKIP LOCKED) + a simple scheduler.

Run with `python -m app.worker`. Several workers can run at once.
Modules register handlers with @job("kind") and schedules with @every(seconds, "kind").
"""
import logging
import signal
import time
import traceback
from collections.abc import Callable
from datetime import datetime, timedelta, timezone

from sqlalchemy import select, text

from . import cache
from .db import SessionLocal, utcnow
from .models import Job

log = logging.getLogger("kestrel.worker")
HANDLERS: dict[str, Callable] = {}
SCHEDULES: list[tuple[int, str]] = []


def job(kind: str):
    def deco(fn):
        HANDLERS[kind] = fn
        return fn
    return deco


def every(seconds: int, kind: str):
    SCHEDULES.append((seconds, kind))


def enqueue(db, kind: str, payload: dict | None = None, org_id: int | None = None, run_at: datetime | None = None) -> Job:
    j = Job(kind=kind, payload=payload or {}, org_id=org_id, run_at=run_at or utcnow())
    db.add(j)
    db.flush()
    return j


def claim(db) -> Job | None:
    row = db.execute(text("""
        UPDATE jobs SET status='running', locked_at=now(), attempts=attempts+1
        WHERE id = (SELECT id FROM jobs WHERE status='queued' AND run_at <= now() ORDER BY run_at FOR UPDATE SKIP LOCKED LIMIT 1)
        RETURNING id""")).first()
    db.commit()
    return db.get(Job, row[0]) if row else None


def run_one(db) -> bool:
    j = claim(db)
    if not j:
        return False
    fn = HANDLERS.get(j.kind)
    try:
        if not fn:
            raise RuntimeError(f"No handler for {j.kind}")
        result = fn(db, j) or {}
        j.status, j.result, j.finished_at = "done", result, utcnow()
    except Exception as e:  # noqa: BLE001
        db.rollback()
        j = db.get(Job, j.id)
        j.error = f"{e}\n{traceback.format_exc()[-1500:]}"
        if j.attempts < 3:
            j.status, j.run_at = "queued", utcnow() + timedelta(minutes=2 ** j.attempts)
        else:
            j.status, j.finished_at = "failed", utcnow()
        log.warning("job failed", extra={"msg": str(e)})
    db.commit()
    return True


def tick_schedules(db):
    now = int(time.time())
    for seconds, kind in SCHEDULES:
        slot = now // seconds
        c = cache.client()
        key = f"sched:{kind}:{slot}"
        if c:
            if not c.set(key, "1", nx=True, ex=seconds + 60):
                continue
        elif cache.get_json(key):
            continue
        else:
            cache.set_json(key, 1, seconds + 60)
        if not db.scalar(select(Job.id).where(Job.kind == kind, Job.status.in_(["queued", "running"])).limit(1)):
            enqueue(db, kind)
            db.commit()


def load_modules():
    # Importing services registers their handlers and schedules.
    import importlib
    for m in ["app.services.tracking", "app.services.alerts", "app.services.ranks", "app.services.reports"]:
        try:
            importlib.import_module(m)
        except ModuleNotFoundError as e:
            if e.name != m:
                raise


def main():
    logging.basicConfig(level=logging.INFO)
    load_modules()
    stop = {"v": False}
    signal.signal(signal.SIGTERM, lambda *_: stop.update(v=True))
    signal.signal(signal.SIGINT, lambda *_: stop.update(v=True))
    log.info("worker started", extra={"msg": f"{len(HANDLERS)} handlers"})
    while not stop["v"]:
        db = SessionLocal()
        try:
            tick_schedules(db)
            worked = run_one(db)
        finally:
            db.close()
        if not worked:
            time.sleep(2)


if __name__ == "__main__":
    main()
