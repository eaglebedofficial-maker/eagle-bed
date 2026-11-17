import re
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from .. import cache
from ..audit import audit
from ..config import get_settings
from ..db import get_db, utcnow
from ..deps import Ctx, get_ctx, require
from ..models import Membership, Organisation, RefreshToken, User
from ..security import create_access_token, hash_password, hash_token, new_refresh_token, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])


class RegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=10, max_length=200)
    name: str = Field(default="", max_length=120)
    organisation: str = Field(min_length=2, max_length=160)


class LoginIn(BaseModel):
    email: EmailStr
    password: str


def _slug(s: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")[:60] or "org"


def _set_cookies(resp: Response, access: str, refresh: str | None):
    s = get_settings()
    resp.set_cookie("k_access", access, httponly=True, secure=s.cookie_secure, samesite="lax", max_age=s.access_token_minutes * 60, path="/")
    if refresh:
        resp.set_cookie("k_refresh", refresh, httponly=True, secure=s.cookie_secure, samesite="lax", max_age=s.refresh_token_days * 86400, path="/api/auth")


def _issue(db: Session, resp: Response, user: User, org_id: int | None):
    raw, hashed = new_refresh_token()
    db.add(RefreshToken(user_id=user.id, token_hash=hashed, expires_at=utcnow() + timedelta(days=get_settings().refresh_token_days)))
    access = create_access_token(user.id, org_id)
    _set_cookies(resp, access, raw)
    return access


def user_payload(db: Session, user: User, org_id: int | None = None):
    ms = db.scalars(select(Membership).where(Membership.user_id == user.id).order_by(Membership.id)).all()
    active = next((m for m in ms if m.org_id == org_id), ms[0] if ms else None)
    return {"user": {"id": user.id, "email": user.email, "name": user.name},
            "organisations": [{"id": m.org.id, "name": m.org.name, "slug": m.org.slug, "role": m.role, "is_demo": m.org.is_demo} for m in ms],
            "active_org": {"id": active.org.id, "name": active.org.name, "role": active.role, "is_demo": active.org.is_demo,
                           "default_marketplace": active.org.default_marketplace, "vat_registered": active.org.vat_registered} if active else None}


def _throttle(request: Request, key: str):
    ip = request.client.host if request.client else "?"
    if not cache.hit(f"auth:{key}:{ip}", get_settings().auth_attempts_per_5min, 300):
        raise HTTPException(429, "Too many attempts. Wait a few minutes and try again.")


@router.post("/register")
def register(body: RegisterIn, request: Request, response: Response, db: Session = Depends(get_db)):
    _throttle(request, "register")
    email = body.email.lower()
    if db.scalar(select(User).where(User.email == email)):
        raise HTTPException(409, "An account with this email already exists. Sign in instead.")
    user = User(email=email, name=body.name.strip(), password_hash=hash_password(body.password))
    base = _slug(body.organisation)
    slug, n = base, 1
    while db.scalar(select(Organisation).where(Organisation.slug == slug)):
        n += 1
        slug = f"{base}-{n}"
    org = Organisation(name=body.organisation.strip(), slug=slug)
    db.add_all([user, org])
    db.flush()
    db.add(Membership(user_id=user.id, org_id=org.id, role="owner"))
    audit(db, "auth.register", org_id=org.id, user_id=user.id, ip=request.client.host if request.client else "")
    _issue(db, response, user, org.id)
    db.commit()
    return user_payload(db, user, org.id)


@router.post("/login")
def login(body: LoginIn, request: Request, response: Response, db: Session = Depends(get_db)):
    _throttle(request, "login")
    user = db.scalar(select(User).where(User.email == body.email.lower()))
    if not user or not verify_password(body.password, user.password_hash) or not user.is_active:
        audit(db, "auth.login_failed", meta={"email": body.email.lower()}, ip=request.client.host if request.client else "", commit=True)
        raise HTTPException(401, "Email or password is incorrect.")
    user.last_login_at = utcnow()
    m = db.scalar(select(Membership).where(Membership.user_id == user.id).order_by(Membership.id))
    _issue(db, response, user, m.org_id if m else None)
    audit(db, "auth.login", org_id=m.org_id if m else None, user_id=user.id, ip=request.client.host if request.client else "")
    db.commit()
    return user_payload(db, user, m.org_id if m else None)


@router.post("/demo")
def demo_login(request: Request, response: Response, db: Session = Depends(get_db)):
    """Sign in to the fictional demo workspace (created by `python -m app.demo`)."""
    if not get_settings().demo_login_enabled:
        raise HTTPException(404, "The demo workspace is not enabled on this server.")
    _throttle(request, "demo")
    org = db.scalar(select(Organisation).where(Organisation.is_demo.is_(True), Organisation.slug == "kestrel-demo"))
    m = org and db.scalar(select(Membership).where(Membership.org_id == org.id, Membership.role == "owner"))
    if not m:
        raise HTTPException(404, "No demo workspace on this server. Run `python -m app.demo` to create it.")
    user = db.get(User, m.user_id)
    _issue(db, response, user, org.id)
    audit(db, "auth.demo_login", org_id=org.id, user_id=user.id, ip=request.client.host if request.client else "")
    db.commit()
    return user_payload(db, user, org.id)


@router.post("/refresh")
def refresh(request: Request, response: Response, db: Session = Depends(get_db)):
    raw = request.cookies.get("k_refresh")
    if not raw:
        raise HTTPException(401, "No session")
    rt = db.scalar(select(RefreshToken).where(RefreshToken.token_hash == hash_token(raw)))
    now = datetime.now(timezone.utc)
    if not rt or rt.revoked_at or rt.expires_at < now:
        if rt and rt.revoked_at:  # reuse of a rotated token: revoke all sessions for safety
            for t in db.scalars(select(RefreshToken).where(RefreshToken.user_id == rt.user_id, RefreshToken.revoked_at.is_(None))):
                t.revoked_at = now
            db.commit()
        raise HTTPException(401, "Session expired")
    rt.revoked_at = now
    user = db.get(User, rt.user_id)
    org_id = request.headers.get("x-org-id")
    _issue(db, response, user, int(org_id) if org_id else None)
    db.commit()
    return user_payload(db, user, int(org_id) if org_id else None)


@router.post("/logout")
def logout(request: Request, response: Response, db: Session = Depends(get_db)):
    raw = request.cookies.get("k_refresh")
    if raw:
        rt = db.scalar(select(RefreshToken).where(RefreshToken.token_hash == hash_token(raw)))
        if rt and not rt.revoked_at:
            rt.revoked_at = utcnow()
            db.commit()
    response.delete_cookie("k_access", path="/")
    response.delete_cookie("k_refresh", path="/api/auth")
    return {"ok": True}


@router.get("/me")
def me(ctx: Ctx = Depends(get_ctx)):
    return user_payload(ctx.db, ctx.user, ctx.org_id)


class SwitchIn(BaseModel):
    org_id: int


@router.post("/switch")
def switch(body: SwitchIn, response: Response, ctx: Ctx = Depends(get_ctx)):
    m = ctx.db.scalar(select(Membership).where(Membership.user_id == ctx.user.id, Membership.org_id == body.org_id))
    if not m:
        raise HTTPException(404, "Organisation not found")
    _set_cookies(response, create_access_token(ctx.user.id, m.org_id), None)
    return user_payload(ctx.db, ctx.user, m.org_id)


class PasswordIn(BaseModel):
    current: str
    new: str = Field(min_length=10, max_length=200)


@router.post("/password")
def change_password(body: PasswordIn, ctx: Ctx = Depends(get_ctx)):
    if not verify_password(body.current, ctx.user.password_hash):
        raise HTTPException(400, "Current password is incorrect.")
    ctx.user.password_hash = hash_password(body.new)
    audit(ctx.db, "auth.password_changed", org_id=ctx.org_id, user_id=ctx.user.id, ip=ctx.ip)
    ctx.db.commit()
    return {"ok": True}
