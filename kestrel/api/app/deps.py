from dataclasses import dataclass

import jwt
from fastapi import Depends, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.orm import Session

from .db import get_db
from .models import Membership, Organisation, User
from .security import decode_access_token

ROLE_RANK = {"viewer": 0, "analyst": 1, "admin": 2, "owner": 3}


@dataclass
class Ctx:
    user: User
    org: Organisation
    role: str
    db: Session
    ip: str

    @property
    def org_id(self) -> int:
        return self.org.id

    def can(self, role: str) -> bool:
        return ROLE_RANK[self.role] >= ROLE_RANK[role]


def _token(request: Request) -> str | None:
    auth = request.headers.get("authorization", "")
    if auth.lower().startswith("bearer "):
        return auth[7:]
    return request.cookies.get("k_access")


def get_ctx(request: Request, db: Session = Depends(get_db)) -> Ctx:
    tok = _token(request)
    if not tok:
        raise HTTPException(401, "Not signed in")
    try:
        data = decode_access_token(tok)
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Session expired")
    except jwt.PyJWTError:
        raise HTTPException(401, "Invalid session")
    user = db.get(User, int(data["sub"]))
    if not user or not user.is_active:
        raise HTTPException(401, "Account disabled")
    org_id = request.headers.get("x-org-id") or data.get("org")
    m = db.scalar(select(Membership).where(Membership.user_id == user.id, Membership.org_id == int(org_id))) if org_id else None
    if not m:
        m = db.scalar(select(Membership).where(Membership.user_id == user.id).order_by(Membership.id))
    if not m:
        raise HTTPException(403, "No organisation")
    ip = request.headers.get("x-forwarded-for", request.client.host if request.client else "").split(",")[0].strip()
    return Ctx(user=user, org=m.org, role=m.role, db=db, ip=ip)


def require(role: str):
    def dep(ctx: Ctx = Depends(get_ctx)) -> Ctx:
        if not ctx.can(role):
            raise HTTPException(403, f"Requires {role} role")
        return ctx
    return dep


def need_analyst(ctx: Ctx = Depends(get_ctx)) -> Ctx:
    if not ctx.can("analyst"):
        raise HTTPException(403, "Viewers can't change data")
    return ctx
