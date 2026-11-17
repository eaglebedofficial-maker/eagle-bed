"""Organisation settings, members, roles, integrations, audit log, marketplaces, providers."""
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import func, select

from ..audit import audit_ctx
from ..deps import ROLE_RANK, Ctx, get_ctx, require
from ..models import AuditLog, DataSourceRecord, Integration, Marketplace, Membership, User
from ..providers import REGISTRY, ProviderError, get_provider
from ..security import encrypt_json, decrypt_json, hash_password, mask_secret

router = APIRouter(tags=["organisation"])


@router.get("/marketplaces")
def marketplaces(ctx: Ctx = Depends(get_ctx)):
    rows = ctx.db.scalars(select(Marketplace).order_by(Marketplace.code)).all()
    order = ["UK", "US", "DE", "FR", "IT", "ES", "NL", "CA", "AU"]
    rows = sorted(rows, key=lambda m: order.index(m.code) if m.code in order else 99)
    return [{"code": m.code, "name": m.name, "domain": m.domain, "currency": m.currency, "vat_rate": m.vat_rate} for m in rows]


class OrgIn(BaseModel):
    name: str | None = Field(default=None, max_length=160)
    default_marketplace: str | None = None
    vat_registered: bool | None = None
    settings: dict | None = None


@router.get("/org")
def get_org(ctx: Ctx = Depends(get_ctx)):
    o = ctx.org
    return {"id": o.id, "name": o.name, "slug": o.slug, "is_demo": o.is_demo, "default_marketplace": o.default_marketplace,
            "vat_registered": o.vat_registered, "settings": o.settings or {}, "role": ctx.role}


@router.patch("/org")
def update_org(body: OrgIn, ctx: Ctx = Depends(require("admin"))):
    for k, v in body.model_dump(exclude_none=True).items():
        if k == "default_marketplace" and not ctx.db.get(Marketplace, v):
            raise HTTPException(400, "Unknown marketplace")
        setattr(ctx.org, k, v)
    audit_ctx(ctx, "org.updated", "organisation", ctx.org_id, body.model_dump(exclude_none=True))
    ctx.db.commit()
    return get_org(ctx)


@router.get("/org/members")
def members(ctx: Ctx = Depends(get_ctx)):
    rows = ctx.db.scalars(select(Membership).where(Membership.org_id == ctx.org_id).order_by(Membership.id)).all()
    return [{"id": m.id, "user_id": m.user_id, "email": m.user.email, "name": m.user.name, "role": m.role,
             "last_login_at": m.user.last_login_at, "is_you": m.user_id == ctx.user.id} for m in rows]


class InviteIn(BaseModel):
    email: EmailStr
    name: str = ""
    role: str = "analyst"
    temporary_password: str = Field(min_length=10)


@router.post("/org/members")
def add_member(body: InviteIn, ctx: Ctx = Depends(require("admin"))):
    if body.role not in ROLE_RANK or (body.role == "owner" and ctx.role != "owner"):
        raise HTTPException(400, "Invalid role")
    user = ctx.db.scalar(select(User).where(User.email == body.email.lower()))
    if not user:
        user = User(email=body.email.lower(), name=body.name, password_hash=hash_password(body.temporary_password))
        ctx.db.add(user)
        ctx.db.flush()
    if ctx.db.scalar(select(Membership).where(Membership.user_id == user.id, Membership.org_id == ctx.org_id)):
        raise HTTPException(409, "Already a member")
    ctx.db.add(Membership(user_id=user.id, org_id=ctx.org_id, role=body.role))
    audit_ctx(ctx, "member.added", "user", user.id, {"email": user.email, "role": body.role})
    ctx.db.commit()
    return {"ok": True}


class RoleIn(BaseModel):
    role: str


@router.patch("/org/members/{mid}")
def set_role(mid: int, body: RoleIn, ctx: Ctx = Depends(require("admin"))):
    m = ctx.db.get(Membership, mid)
    if not m or m.org_id != ctx.org_id:
        raise HTTPException(404, "Member not found")
    if body.role not in ROLE_RANK or ((body.role == "owner" or m.role == "owner") and ctx.role != "owner"):
        raise HTTPException(403, "Only an owner can change owners")
    if m.role == "owner" and body.role != "owner":
        owners = ctx.db.scalar(select(func.count()).select_from(Membership).where(Membership.org_id == ctx.org_id, Membership.role == "owner"))
        if owners <= 1:
            raise HTTPException(400, "An organisation needs at least one owner")
    m.role = body.role
    audit_ctx(ctx, "member.role_changed", "membership", mid, {"role": body.role})
    ctx.db.commit()
    return {"ok": True}


@router.delete("/org/members/{mid}")
def remove_member(mid: int, ctx: Ctx = Depends(require("admin"))):
    m = ctx.db.get(Membership, mid)
    if not m or m.org_id != ctx.org_id:
        raise HTTPException(404, "Member not found")
    if m.role == "owner":
        raise HTTPException(400, "Transfer ownership before removing an owner")
    ctx.db.delete(m)
    audit_ctx(ctx, "member.removed", "membership", mid)
    ctx.db.commit()
    return {"ok": True}


# ---------------------------------------------------------------- integrations
def _integration_view(ctx: Ctx, key: str):
    cls = REGISTRY[key]
    integ = ctx.db.scalar(select(Integration).where(Integration.org_id == ctx.org_id, Integration.provider == key))
    cfg = decrypt_json(integ.config_encrypted) if integ else {}
    d = cls.describe()
    d["values"] = {f.name: (mask_secret(cfg.get(f.name, "")) if f.secret else cfg.get(f.name, "")) for f in cls.fields}
    d["status"] = ("ok" if not cls.requires_config else "not_configured") if not integ else integ.status
    if not cls.requires_config and (not integ or integ.status == "not_configured"):
        d["status"] = "available"
    d["last_ok_at"] = integ.last_ok_at if integ else None
    d["last_error"] = integ.last_error if integ else ""
    d["usage"] = integ.usage if integ else {}
    return d


@router.get("/integrations")
def list_integrations(ctx: Ctx = Depends(get_ctx)):
    return [_integration_view(ctx, k) for k in REGISTRY]


class IntegrationIn(BaseModel):
    values: dict[str, str]


@router.put("/integrations/{key}")
def save_integration(key: str, body: IntegrationIn, ctx: Ctx = Depends(require("admin"))):
    if key not in REGISTRY:
        raise HTTPException(404, "Unknown provider")
    cls = REGISTRY[key]
    integ = ctx.db.scalar(select(Integration).where(Integration.org_id == ctx.org_id, Integration.provider == key))
    current = decrypt_json(integ.config_encrypted) if integ else {}
    allowed = {f.name: f for f in cls.fields}
    for k, v in body.values.items():
        if k not in allowed:
            continue
        if allowed[k].secret and (v == "" or "•" in v):
            continue  # unchanged masked secret
        current[k] = v.strip()
    if not integ:
        integ = Integration(org_id=ctx.org_id, provider=key)
        ctx.db.add(integ)
    integ.config_encrypted = encrypt_json(current)
    integ.status = "configured" if cls(current).configured() else "not_configured"
    integ.last_error = ""
    audit_ctx(ctx, "integration.saved", "integration", key, {"fields": sorted(k for k in current if current[k])})
    ctx.db.commit()
    return _integration_view(ctx, key)


@router.delete("/integrations/{key}")
def delete_integration(key: str, ctx: Ctx = Depends(require("admin"))):
    integ = ctx.db.scalar(select(Integration).where(Integration.org_id == ctx.org_id, Integration.provider == key))
    if integ:
        ctx.db.delete(integ)
        audit_ctx(ctx, "integration.removed", "integration", key)
        ctx.db.commit()
    return {"ok": True}


@router.post("/integrations/{key}/test")
def test_integration(key: str, ctx: Ctx = Depends(require("analyst"))):
    if key not in REGISTRY:
        raise HTTPException(404, "Unknown provider")
    p = get_provider(ctx.db, ctx.org_id, key)
    integ = ctx.db.scalar(select(Integration).where(Integration.org_id == ctx.org_id, Integration.provider == key))
    try:
        result = p.health_check()
        if integ:
            integ.status, integ.last_ok_at, integ.last_error = "ok", datetime.now(timezone.utc), ""
            integ.usage = {**(integ.usage or {}), **{k: v for k, v in result.items() if k != "ok"}}
        ok = True
    except ProviderError as e:
        result = e.as_dict()
        if integ:
            integ.status, integ.last_error = "error", e.message
        ok = False
    ctx.db.commit()
    return {"ok": ok, "result": result}


@router.get("/audit")
def audit_log(limit: int = 100, ctx: Ctx = Depends(require("admin"))):
    rows = ctx.db.scalars(select(AuditLog).where(AuditLog.org_id == ctx.org_id).order_by(AuditLog.created_at.desc()).limit(min(limit, 500))).all()
    users = {u.id: u.email for u in ctx.db.scalars(select(User).where(User.id.in_({r.user_id for r in rows if r.user_id})))}
    return [{"id": r.id, "action": r.action, "entity": r.entity, "entity_id": r.entity_id, "meta": r.meta, "ip": r.ip,
             "user": users.get(r.user_id, ""), "created_at": r.created_at} for r in rows]


@router.get("/data-sources")
def data_sources(entity: str | None = None, entity_id: str | None = None, ctx: Ctx = Depends(get_ctx)):
    q = select(DataSourceRecord).where(DataSourceRecord.org_id == ctx.org_id)
    if entity:
        q = q.where(DataSourceRecord.entity == entity)
    if entity_id:
        q = q.where(DataSourceRecord.entity_id == entity_id)
    rows = ctx.db.scalars(q.order_by(DataSourceRecord.retrieved_at.desc()).limit(200)).all()
    return [{"provider": r.provider, "classification": r.classification, "retrieved_at": r.retrieved_at, "period_from": r.period_from,
             "period_to": r.period_to, "status": r.status, "error": r.error, "entity": r.entity, "entity_id": r.entity_id, "tokens_used": r.tokens_used} for r in rows]
