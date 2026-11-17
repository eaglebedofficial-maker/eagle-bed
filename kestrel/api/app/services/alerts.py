"""Alert evaluation: compares current values to rule conditions and the last seen value; in-app + email."""
from __future__ import annotations

import logging
import smtplib
from email.message import EmailMessage

from sqlalchemy import select
from sqlalchemy.orm import Session

from ..config import get_settings
from ..db import utcnow
from ..models import AlertEvent, AlertRule, Membership, Product, Quotation, RankHistory, RankTrack, Supplier
from ..worker import every, job

log = logging.getLogger("kestrel.alerts")

PRODUCT_METRICS = {"price": "price", "bsr": "bsr", "offers": "offer_count", "reviews": "review_count", "rating": "rating", "buybox_seller": "buybox_seller",
                   "amazon_sells": "amazon_sells", "profit": "est_profit", "margin": "est_margin", "available": "price"}


def current_value(db: Session, rule: AlertRule):
    m = (rule.condition or {}).get("metric")
    if rule.entity_type == "product":
        p = db.get(Product, rule.entity_id)
        if not p or p.org_id != rule.org_id:
            return None, None
        attr = PRODUCT_METRICS.get(m)
        v = getattr(p, attr) if attr else None
        if m == "available":
            v = p.price is not None
        return v, p.title[:80] or p.asin
    if rule.entity_type == "keyword_rank":
        t = db.get(RankTrack, rule.entity_id)
        if not t:
            return None, None
        h = db.scalars(select(RankHistory).where(RankHistory.track_id == t.id).order_by(RankHistory.ts.desc()).limit(1)).first()
        return (h.organic_pos if h else None), f"“{t.keyword.phrase}” · {t.product.asin}"
    if rule.entity_type == "supplier":
        s = db.get(Supplier, rule.entity_id)
        return (s.status if m == "status" else s.risk_level if m == "risk_level" else s.score) if s else None, s.trading_name or s.legal_name if s else None
    if rule.entity_type == "rfq":
        q = db.get(Quotation, rule.entity_id)
        return (q.status if q else None), q.product_desc if q else None
    return None, None


def check(rule: AlertRule, value, last):
    c = rule.condition or {}
    op, target, pct = c.get("op"), c.get("value"), c.get("pct")
    if value is None and op != "changes":
        return False, ""
    if op == "below" and target is not None and value < float(target):
        return True, f"is {value:g}, below your target {float(target):g}"
    if op == "above" and target is not None and value > float(target):
        return True, f"is {value:g}, above your threshold {float(target):g}"
    if op == "changes" and last is not None and value != last:
        return True, f"changed from {last} to {value}"
    if op == "change_pct" and last not in (None, 0) and isinstance(value, (int, float)) and pct:
        ch = (value - last) / abs(last) * 100
        if abs(ch) >= float(pct):
            return True, f"moved {ch:+.1f}% ({last:g} → {value:g})"
    if op == "becomes" and value == target and last != target:
        return True, f"is now {value}"
    return False, ""


def evaluate_org(db: Session, org_id: int | None = None) -> int:
    q = select(AlertRule).where(AlertRule.active.is_(True))
    if org_id:
        q = q.where(AlertRule.org_id == org_id)
    fired = 0
    for rule in db.scalars(q):
        value, name = current_value(db, rule)
        last = (rule.last_value or {}).get("v")
        hit, why = check(rule, value, last)
        # level-triggered ops (below/above) fire only when crossing
        if hit and rule.condition.get("op") in ("below", "above") and (rule.last_value or {}).get("hit"):
            hit = False
        if hit:
            title = f"{rule.name}: {name or 'item'}"
            ev = AlertEvent(org_id=rule.org_id, rule_id=rule.id, kind=rule.entity_type, title=title, body=f"{rule.condition.get('metric', '').replace('_', ' ').capitalize()} {why}.",
                            payload={"value": value, "previous": last})
            db.add(ev)
            fired += 1
            if "email" in (rule.channels or []):
                send_email(db, rule.org_id, title, ev.body)
        rule.last_value = {"v": value if not hasattr(value, "isoformat") else value.isoformat(), "hit": bool(check(rule, value, None)[0]) if rule.condition.get("op") in ("below", "above") else False, "at": utcnow().isoformat()}
    db.commit()
    return fired


def send_email(db: Session, org_id: int, subject: str, body: str):
    s = get_settings()
    if not s.smtp_host:
        return
    to = [m.user.email for m in db.scalars(select(Membership).where(Membership.org_id == org_id, Membership.role.in_(["owner", "admin", "analyst"])))]
    if not to:
        return
    msg = EmailMessage()
    msg["Subject"], msg["From"], msg["To"] = f"[Kestrel] {subject}", s.smtp_from or s.smtp_user, ", ".join(to)
    msg.set_content(f"{body}\n\nOpen Kestrel → Alerts to manage this rule.")
    try:
        with smtplib.SMTP(s.smtp_host, s.smtp_port, timeout=15) as smtp:
            smtp.starttls()
            if s.smtp_user:
                smtp.login(s.smtp_user, s.smtp_password)
            smtp.send_message(msg)
    except Exception as e:  # noqa: BLE001
        log.warning("alert email failed: %s", e)


@job("alerts.evaluate")
def _job(db, j):
    return {"fired": evaluate_org(db, j.org_id)}


every(900, "alerts.evaluate")
