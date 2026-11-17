from sqlalchemy.orm import Session

from .models import AuditLog


def audit(db: Session, action: str, *, org_id=None, user_id=None, entity="", entity_id="", meta=None, ip="", commit=False):
    db.add(AuditLog(org_id=org_id, user_id=user_id, action=action, entity=entity, entity_id=str(entity_id or ""), meta=meta or {}, ip=ip))
    if commit:
        db.commit()


def audit_ctx(ctx, action: str, entity="", entity_id="", meta=None):
    audit(ctx.db, action, org_id=ctx.org_id, user_id=ctx.user.id, entity=entity, entity_id=entity_id, meta=meta, ip=ctx.ip)
