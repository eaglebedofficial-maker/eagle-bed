"""Suppliers, evidence, documents, invoice assessments, RFQs, POs, eligibility; ops tables."""
from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, Float, ForeignKey, Index, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..db import Base, TimestampMixin, utcnow
from .core import JSONType, org_fk

SUPPLIER_TYPES = ("brand_owner", "manufacturer", "authorised_distributor", "wholesaler", "importer",
                  "trade_supplier", "private_label_manufacturer", "oem", "odm")
# Assessment categories (never inferred from "sells the brand" alone)
SUPPLIER_STATUSES = ("official_brand_owner", "manufacturer", "verified_authorised_distributor",
                     "established_wholesaler", "unverified", "high_risk")


class Supplier(TimestampMixin, Base):
    __tablename__ = "suppliers"
    __table_args__ = (Index("ix_suppliers_org_name", "org_id", "legal_name"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    org_id: Mapped[int] = org_fk()
    legal_name: Mapped[str] = mapped_column(String(240))
    trading_name: Mapped[str] = mapped_column(String(240), default="")
    supplier_type: Mapped[str] = mapped_column(String(32), default="wholesaler")
    status: Mapped[str] = mapped_column(String(40), default="unverified")
    country: Mapped[str] = mapped_column(String(2), default="GB")
    city: Mapped[str] = mapped_column(String(120), default="")
    address: Mapped[str] = mapped_column(Text, default="")
    website: Mapped[str] = mapped_column(String(300), default="")
    logo_url: Mapped[str] = mapped_column(String(400), default="")
    registration_number: Mapped[str] = mapped_column(String(40), default="")
    registry: Mapped[str] = mapped_column(String(40), default="")  # companies_house | other
    registry_data: Mapped[dict] = mapped_column(JSONType, default=dict)
    registry_checked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    vat_number: Mapped[str] = mapped_column(String(30), default="")
    vat_valid: Mapped[bool | None] = mapped_column(Boolean)
    vat_data: Mapped[dict] = mapped_column(JSONType, default=dict)
    vat_checked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    categories: Mapped[list] = mapped_column(JSONType, default=list)
    brands_supplied: Mapped[list] = mapped_column(JSONType, default=list)
    countries_served: Mapped[list] = mapped_column(JSONType, default=list)
    certifications: Mapped[list] = mapped_column(JSONType, default=list)
    shipping_options: Mapped[list] = mapped_column(JSONType, default=list)
    moq: Mapped[int | None] = mapped_column(Integer)
    price_min: Mapped[float | None] = mapped_column(Float)
    price_max: Mapped[float | None] = mapped_column(Float)
    currency: Mapped[str] = mapped_column(String(3), default="GBP")
    lead_time_days: Mapped[int | None] = mapped_column(Integer)
    sample_available: Mapped[bool | None] = mapped_column(Boolean)
    years_trading: Mapped[float | None] = mapped_column(Float)
    communication_rating: Mapped[int | None] = mapped_column(Integer)  # user 1-5
    quality_rating: Mapped[int | None] = mapped_column(Integer)  # user 1-5
    score: Mapped[int | None] = mapped_column(Integer)
    score_components: Mapped[dict] = mapped_column(JSONType, default=dict)
    risk_level: Mapped[str] = mapped_column(String(10), default="unknown")  # low|medium|high|unknown
    risk_reasons: Mapped[list] = mapped_column(JSONType, default=list)
    saved: Mapped[bool] = mapped_column(Boolean, default=True)
    source: Mapped[str] = mapped_column(String(40), default="user")
    notes: Mapped[str] = mapped_column(Text, default="")
    contacts: Mapped[list["SupplierContact"]] = relationship(cascade="all, delete-orphan")
    evidence: Mapped[list["SupplierEvidence"]] = relationship(cascade="all, delete-orphan")


class SupplierContact(Base):
    __tablename__ = "supplier_contacts"
    id: Mapped[int] = mapped_column(primary_key=True)
    supplier_id: Mapped[int] = mapped_column(ForeignKey("suppliers.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String(160), default="")
    role: Mapped[str] = mapped_column(String(120), default="")
    email: Mapped[str] = mapped_column(String(320), default="")
    phone: Mapped[str] = mapped_column(String(60), default="")
    source: Mapped[str] = mapped_column(String(300), default="user")


class SupplierProduct(Base):
    __tablename__ = "supplier_products"
    id: Mapped[int] = mapped_column(primary_key=True)
    supplier_id: Mapped[int] = mapped_column(ForeignKey("suppliers.id", ondelete="CASCADE"), index=True)
    product_id: Mapped[int | None] = mapped_column(ForeignKey("products.id", ondelete="SET NULL"))
    description: Mapped[str] = mapped_column(String(300))
    sku: Mapped[str] = mapped_column(String(80), default="")
    ean: Mapped[str] = mapped_column(String(20), default="")
    unit_price: Mapped[float | None] = mapped_column(Float)
    currency: Mapped[str] = mapped_column(String(3), default="GBP")
    moq: Mapped[int | None] = mapped_column(Integer)
    sample_available: Mapped[bool | None] = mapped_column(Boolean)


class SupplierEvidence(Base):
    __tablename__ = "supplier_evidence"
    id: Mapped[int] = mapped_column(primary_key=True)
    supplier_id: Mapped[int] = mapped_column(ForeignKey("suppliers.id", ondelete="CASCADE"), index=True)
    kind: Mapped[str] = mapped_column(String(30))  # registry | vat | website_claim | brand_locator | brand_confirmation | trade_record | document | user_note
    summary: Mapped[str] = mapped_column(Text)
    source_url: Mapped[str] = mapped_column(String(500), default="")
    source_name: Mapped[str] = mapped_column(String(200), default="")
    classification: Mapped[str] = mapped_column(String(24), default="user")
    confidence: Mapped[str] = mapped_column(String(10), default="medium")  # high|medium|low
    supports_authorisation: Mapped[bool] = mapped_column(Boolean, default=False)
    raw: Mapped[dict] = mapped_column(JSONType, default=dict)
    retrieved_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class BrandAuthorisation(TimestampMixin, Base):
    __tablename__ = "brand_authorisations"
    id: Mapped[int] = mapped_column(primary_key=True)
    org_id: Mapped[int] = org_fk()
    brand_id: Mapped[int] = mapped_column(ForeignKey("brands.id", ondelete="CASCADE"), index=True)
    supplier_id: Mapped[int] = mapped_column(ForeignKey("suppliers.id", ondelete="CASCADE"), index=True)
    evidence_type: Mapped[str] = mapped_column(String(40))  # brand_locator_listing | brand_written_confirmation | authorisation_letter | distributor_claim | none
    statement: Mapped[str] = mapped_column(Text, default="")
    source_url: Mapped[str] = mapped_column(String(500), default="")
    status: Mapped[str] = mapped_column(String(20), default="claimed")  # confirmed_by_brand | listed_by_brand | claimed | unverified | rejected
    verified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    verified_by: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))


class Document(Base):
    __tablename__ = "documents"
    id: Mapped[int] = mapped_column(primary_key=True)
    org_id: Mapped[int] = org_fk()
    supplier_id: Mapped[int | None] = mapped_column(ForeignKey("suppliers.id", ondelete="SET NULL"), index=True)
    kind: Mapped[str] = mapped_column(String(30), default="invoice")
    filename: Mapped[str] = mapped_column(String(260))
    storage_key: Mapped[str] = mapped_column(String(300))
    sha256: Mapped[str] = mapped_column(String(64), index=True)
    mime: Mapped[str] = mapped_column(String(80))
    size_bytes: Mapped[int] = mapped_column(Integer)
    pages: Mapped[int | None] = mapped_column(Integer)
    text: Mapped[str] = mapped_column(Text, default="")
    uploaded_by: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    uploaded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class InvoiceAssessment(Base):
    __tablename__ = "invoice_assessments"
    id: Mapped[int] = mapped_column(primary_key=True)
    org_id: Mapped[int] = org_fk()
    document_id: Mapped[int] = mapped_column(ForeignKey("documents.id", ondelete="CASCADE"), index=True)
    supplier_id: Mapped[int | None] = mapped_column(ForeignKey("suppliers.id", ondelete="SET NULL"))
    extracted: Mapped[dict] = mapped_column(JSONType, default=dict)
    extraction_method: Mapped[str] = mapped_column(String(20), default="rules")  # rules | ai | user
    checks: Mapped[list] = mapped_column(JSONType, default=list)  # [{id,label,status(pass|warn|fail|unknown),detail,evidence}]
    risk_level: Mapped[str] = mapped_column(String(10))
    summary: Mapped[str] = mapped_column(Text, default="")
    policy_source_url: Mapped[str] = mapped_column(String(400), default="")
    policy_version: Mapped[str] = mapped_column(String(80), default="")
    policy_retrieved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class Quotation(TimestampMixin, Base):
    """RFQ lifecycle: draft → sent → quoted → negotiating → accepted | declined."""
    __tablename__ = "quotations"
    id: Mapped[int] = mapped_column(primary_key=True)
    org_id: Mapped[int] = org_fk()
    supplier_id: Mapped[int] = mapped_column(ForeignKey("suppliers.id", ondelete="CASCADE"), index=True)
    product_id: Mapped[int | None] = mapped_column(ForeignKey("products.id", ondelete="SET NULL"))
    product_desc: Mapped[str] = mapped_column(String(300))
    quantity: Mapped[int | None] = mapped_column(Integer)
    target_price: Mapped[float | None] = mapped_column(Float)
    status: Mapped[str] = mapped_column(String(20), default="draft")
    email_subject: Mapped[str] = mapped_column(String(300), default="")
    email_body: Mapped[str] = mapped_column(Text, default="")
    sent_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    responded_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    quoted_price: Mapped[float | None] = mapped_column(Float)
    negotiated_price: Mapped[float | None] = mapped_column(Float)
    currency: Mapped[str] = mapped_column(String(3), default="GBP")
    moq: Mapped[int | None] = mapped_column(Integer)
    lead_time_days: Mapped[int | None] = mapped_column(Integer)
    shipping_cost: Mapped[float | None] = mapped_column(Float)
    shipping_terms: Mapped[str] = mapped_column(String(40), default="")  # EXW, FOB, DDP...
    sample_status: Mapped[str] = mapped_column(String(20), default="none")  # none|requested|paid|received|approved|rejected
    response_notes: Mapped[str] = mapped_column(Text, default="")
    supplier: Mapped["Supplier"] = relationship()


class PurchaseOrder(TimestampMixin, Base):
    __tablename__ = "purchase_orders"
    id: Mapped[int] = mapped_column(primary_key=True)
    org_id: Mapped[int] = org_fk()
    supplier_id: Mapped[int] = mapped_column(ForeignKey("suppliers.id", ondelete="CASCADE"), index=True)
    quotation_id: Mapped[int | None] = mapped_column(ForeignKey("quotations.id", ondelete="SET NULL"))
    reference: Mapped[str] = mapped_column(String(60))
    status: Mapped[str] = mapped_column(String(20), default="draft")  # draft|placed|in_production|shipped|received|cancelled
    items: Mapped[list] = mapped_column(JSONType, default=list)  # [{description, qty, unit_price}]
    currency: Mapped[str] = mapped_column(String(3), default="GBP")
    total: Mapped[float] = mapped_column(Float, default=0)
    ordered_at: Mapped[date | None] = mapped_column(Date)
    expected_at: Mapped[date | None] = mapped_column(Date)
    received_at: Mapped[date | None] = mapped_column(Date)
    supplier: Mapped["Supplier"] = relationship()


class Communication(Base):
    __tablename__ = "communications"
    id: Mapped[int] = mapped_column(primary_key=True)
    org_id: Mapped[int] = org_fk()
    supplier_id: Mapped[int] = mapped_column(ForeignKey("suppliers.id", ondelete="CASCADE"), index=True)
    direction: Mapped[str] = mapped_column(String(10))  # outbound | inbound | note
    channel: Mapped[str] = mapped_column(String(16), default="email")
    subject: Mapped[str] = mapped_column(String(300), default="")
    body: Mapped[str] = mapped_column(Text, default="")
    at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))


class EligibilityRecord(Base):
    __tablename__ = "eligibility_records"
    id: Mapped[int] = mapped_column(primary_key=True)
    org_id: Mapped[int] = org_fk()
    product_id: Mapped[int | None] = mapped_column(ForeignKey("products.id", ondelete="CASCADE"))
    brand_id: Mapped[int | None] = mapped_column(ForeignKey("brands.id", ondelete="CASCADE"))
    result: Mapped[str] = mapped_column(String(24))  # eligible | approval_required | restricted
    reasons: Mapped[list] = mapped_column(JSONType, default=list)
    source: Mapped[str] = mapped_column(String(30), default="seller_central_manual")  # seller_central_manual | sp_api
    checked_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))


# ---------------------------------------------------------------- operations
class ProfitCalculation(Base):
    __tablename__ = "profit_calculations"
    id: Mapped[int] = mapped_column(primary_key=True)
    org_id: Mapped[int] = org_fk()
    product_id: Mapped[int | None] = mapped_column(ForeignKey("products.id", ondelete="SET NULL"))
    name: Mapped[str] = mapped_column(String(200), default="")
    inputs: Mapped[dict] = mapped_column(JSONType, default=dict)
    outputs: Mapped[dict] = mapped_column(JSONType, default=dict)
    fee_version: Mapped[str] = mapped_column(String(40), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class InventoryItem(TimestampMixin, Base):
    __tablename__ = "inventory_items"
    id: Mapped[int] = mapped_column(primary_key=True)
    org_id: Mapped[int] = org_fk()
    sku: Mapped[str] = mapped_column(String(80), index=True)
    title: Mapped[str] = mapped_column(String(300), default="")
    asin: Mapped[str] = mapped_column(String(10), default="")
    product_id: Mapped[int | None] = mapped_column(ForeignKey("products.id", ondelete="SET NULL"))
    on_hand: Mapped[int] = mapped_column(Integer, default=0)
    inbound: Mapped[int] = mapped_column(Integer, default=0)
    reserved: Mapped[int] = mapped_column(Integer, default=0)
    unit_cost: Mapped[float | None] = mapped_column(Float)
    lead_time_days: Mapped[int] = mapped_column(Integer, default=30)
    safety_days: Mapped[int] = mapped_column(Integer, default=14)
    source: Mapped[str] = mapped_column(String(30), default="user")


class SalesRecord(Base):
    __tablename__ = "sales_records"
    __table_args__ = (Index("ix_sales_org_date", "org_id", "date"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    org_id: Mapped[int] = org_fk()
    date: Mapped[date] = mapped_column(Date)
    sku: Mapped[str] = mapped_column(String(80), default="")
    asin: Mapped[str] = mapped_column(String(10), default="")
    title: Mapped[str] = mapped_column(String(300), default="")
    units: Mapped[int] = mapped_column(Integer, default=0)
    revenue: Mapped[float] = mapped_column(Float, default=0)
    fees: Mapped[float] = mapped_column(Float, default=0)
    refunds: Mapped[float] = mapped_column(Float, default=0)
    cogs: Mapped[float] = mapped_column(Float, default=0)
    sessions: Mapped[int | None] = mapped_column(Integer)
    source: Mapped[str] = mapped_column(String(30), default="report_upload")


class AdMetric(Base):
    __tablename__ = "ad_metrics"
    __table_args__ = (Index("ix_ads_org_date", "org_id", "date"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    org_id: Mapped[int] = org_fk()
    date: Mapped[date] = mapped_column(Date)
    campaign: Mapped[str] = mapped_column(String(200), default="")
    ad_group: Mapped[str] = mapped_column(String(200), default="")
    targeting: Mapped[str] = mapped_column(String(300), default="")
    match_type: Mapped[str] = mapped_column(String(20), default="")
    search_term: Mapped[str] = mapped_column(String(300), default="")
    impressions: Mapped[int] = mapped_column(Integer, default=0)
    clicks: Mapped[int] = mapped_column(Integer, default=0)
    spend: Mapped[float] = mapped_column(Float, default=0)
    sales: Mapped[float] = mapped_column(Float, default=0)
    orders: Mapped[int] = mapped_column(Integer, default=0)
    source: Mapped[str] = mapped_column(String(30), default="report_upload")


class ReimbursementCase(TimestampMixin, Base):
    __tablename__ = "reimbursement_cases"
    id: Mapped[int] = mapped_column(primary_key=True)
    org_id: Mapped[int] = org_fk()
    case_type: Mapped[str] = mapped_column(String(40))  # lost_inbound | damaged_warehouse | refund_not_returned | fee_overcharge
    sku: Mapped[str] = mapped_column(String(80), default="")
    reference: Mapped[str] = mapped_column(String(120), default="")
    quantity: Mapped[int] = mapped_column(Integer, default=0)
    estimated_amount: Mapped[float] = mapped_column(Float, default=0)
    evidence: Mapped[dict] = mapped_column(JSONType, default=dict)
    status: Mapped[str] = mapped_column(String(24), default="identified")  # identified|reviewed_by_seller|filed_by_seller|resolved|dismissed
