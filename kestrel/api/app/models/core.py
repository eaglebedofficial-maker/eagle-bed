"""Identity, tenancy, platform tables."""
from datetime import datetime

from sqlalchemy import JSON, Boolean, DateTime, ForeignKey, Index, Integer, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..db import Base, TimestampMixin, utcnow

JSONType = JSON().with_variant(JSONB(), "postgresql")
ROLES = ("owner", "admin", "analyst", "viewer")


def org_fk():
    return mapped_column(ForeignKey("organisations.id", ondelete="CASCADE"), index=True, nullable=False)


class User(TimestampMixin, Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(120), default="")
    password_hash: Mapped[str] = mapped_column(String(255))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    memberships: Mapped[list["Membership"]] = relationship(back_populates="user", cascade="all, delete-orphan")


class Organisation(TimestampMixin, Base):
    __tablename__ = "organisations"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(160))
    slug: Mapped[str] = mapped_column(String(80), unique=True)
    is_demo: Mapped[bool] = mapped_column(Boolean, default=False)
    default_marketplace: Mapped[str] = mapped_column(String(4), default="UK")
    vat_registered: Mapped[bool] = mapped_column(Boolean, default=True)
    settings: Mapped[dict] = mapped_column(JSONType, default=dict)
    memberships: Mapped[list["Membership"]] = relationship(back_populates="org", cascade="all, delete-orphan")


class Membership(TimestampMixin, Base):
    __tablename__ = "memberships"
    __table_args__ = (UniqueConstraint("user_id", "org_id"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    org_id: Mapped[int] = org_fk()
    role: Mapped[str] = mapped_column(String(16), default="analyst")
    user: Mapped[User] = relationship(back_populates="memberships")
    org: Mapped[Organisation] = relationship(back_populates="memberships")


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    token_hash: Mapped[str] = mapped_column(String(128), unique=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class AuditLog(Base):
    __tablename__ = "audit_logs"
    __table_args__ = (Index("ix_audit_org_created", "org_id", "created_at"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    org_id: Mapped[int | None] = mapped_column(ForeignKey("organisations.id", ondelete="CASCADE"))
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    action: Mapped[str] = mapped_column(String(80))
    entity: Mapped[str] = mapped_column(String(60), default="")
    entity_id: Mapped[str] = mapped_column(String(60), default="")
    meta: Mapped[dict] = mapped_column(JSONType, default=dict)
    ip: Mapped[str] = mapped_column(String(64), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class Integration(TimestampMixin, Base):
    __tablename__ = "integrations"
    __table_args__ = (UniqueConstraint("org_id", "provider"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    org_id: Mapped[int] = org_fk()
    provider: Mapped[str] = mapped_column(String(40))
    config_encrypted: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String(20), default="not_configured")  # not_configured|configured|ok|error
    last_ok_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    last_error: Mapped[str] = mapped_column(Text, default="")
    usage: Mapped[dict] = mapped_column(JSONType, default=dict)


class DataSourceRecord(Base):
    """Provenance for every fetched dataset."""
    __tablename__ = "data_source_records"
    __table_args__ = (Index("ix_dsr_entity", "entity", "entity_id"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    org_id: Mapped[int | None] = mapped_column(ForeignKey("organisations.id", ondelete="CASCADE"), index=True)
    entity: Mapped[str] = mapped_column(String(40))
    entity_id: Mapped[str] = mapped_column(String(60))
    provider: Mapped[str] = mapped_column(String(40))
    classification: Mapped[str] = mapped_column(String(24))
    retrieved_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    period_from: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    period_to: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    request_ref: Mapped[str] = mapped_column(String(400), default="")
    tokens_used: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(String(16), default="ok")
    error: Mapped[str] = mapped_column(Text, default="")


class Job(Base):
    __tablename__ = "jobs"
    __table_args__ = (Index("ix_jobs_status_run", "status", "run_at"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    org_id: Mapped[int | None] = mapped_column(ForeignKey("organisations.id", ondelete="CASCADE"))
    kind: Mapped[str] = mapped_column(String(60))
    payload: Mapped[dict] = mapped_column(JSONType, default=dict)
    status: Mapped[str] = mapped_column(String(16), default="queued")  # queued|running|done|failed
    run_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    attempts: Mapped[int] = mapped_column(Integer, default=0)
    locked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    finished_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    result: Mapped[dict] = mapped_column(JSONType, default=dict)
    error: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class SavedSearch(TimestampMixin, Base):
    __tablename__ = "saved_searches"
    id: Mapped[int] = mapped_column(primary_key=True)
    org_id: Mapped[int] = org_fk()
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    module: Mapped[str] = mapped_column(String(40))
    name: Mapped[str] = mapped_column(String(120))
    filters: Mapped[dict] = mapped_column(JSONType, default=dict)
    is_template: Mapped[bool] = mapped_column(Boolean, default=False)


class AlertRule(TimestampMixin, Base):
    __tablename__ = "alert_rules"
    id: Mapped[int] = mapped_column(primary_key=True)
    org_id: Mapped[int] = org_fk()
    name: Mapped[str] = mapped_column(String(160))
    entity_type: Mapped[str] = mapped_column(String(30))  # product|keyword_rank|supplier|rfq|inventory
    entity_id: Mapped[int | None] = mapped_column(Integer)
    condition: Mapped[dict] = mapped_column(JSONType, default=dict)  # {metric, op, value, pct}
    channels: Mapped[list] = mapped_column(JSONType, default=lambda: ["in_app"])
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    last_value: Mapped[dict] = mapped_column(JSONType, default=dict)


class AlertEvent(Base):
    __tablename__ = "alert_events"
    __table_args__ = (Index("ix_alert_events_org", "org_id", "triggered_at"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    org_id: Mapped[int] = org_fk()
    rule_id: Mapped[int | None] = mapped_column(ForeignKey("alert_rules.id", ondelete="SET NULL"))
    kind: Mapped[str] = mapped_column(String(40))
    title: Mapped[str] = mapped_column(String(240))
    body: Mapped[str] = mapped_column(Text, default="")
    payload: Mapped[dict] = mapped_column(JSONType, default=dict)
    triggered_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    read_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class Report(TimestampMixin, Base):
    __tablename__ = "reports"
    id: Mapped[int] = mapped_column(primary_key=True)
    org_id: Mapped[int] = org_fk()
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    kind: Mapped[str] = mapped_column(String(40))
    title: Mapped[str] = mapped_column(String(200))
    params: Mapped[dict] = mapped_column(JSONType, default=dict)
    format: Mapped[str] = mapped_column(String(8))
    status: Mapped[str] = mapped_column(String(16), default="ready")
    storage_key: Mapped[str] = mapped_column(String(300), default="")
    size_bytes: Mapped[int] = mapped_column(Integer, default=0)


class AiThread(TimestampMixin, Base):
    __tablename__ = "ai_threads"
    id: Mapped[int] = mapped_column(primary_key=True)
    org_id: Mapped[int] = org_fk()
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    title: Mapped[str] = mapped_column(String(200), default="New research")
    context: Mapped[dict] = mapped_column(JSONType, default=dict)


class AiMessage(Base):
    __tablename__ = "ai_messages"
    id: Mapped[int] = mapped_column(primary_key=True)
    thread_id: Mapped[int] = mapped_column(ForeignKey("ai_threads.id", ondelete="CASCADE"), index=True)
    role: Mapped[str] = mapped_column(String(12))
    content: Mapped[str] = mapped_column(Text)
    structured: Mapped[dict] = mapped_column(JSONType, default=dict)  # evidence, sources, assumptions, confidence, missing, risks
    model: Mapped[str] = mapped_column(String(60), default="")
    tokens: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
