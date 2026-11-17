"""Marketplaces, fees, products, history, keywords, listings, reviews."""
from datetime import date, datetime

from sqlalchemy import (Boolean, Date, DateTime, Float, ForeignKey, Index, Integer, Numeric, String, Text,
                        UniqueConstraint)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..db import Base, TimestampMixin, utcnow
from .core import JSONType, org_fk


class Marketplace(Base):
    __tablename__ = "marketplaces"
    code: Mapped[str] = mapped_column(String(4), primary_key=True)
    name: Mapped[str] = mapped_column(String(60))
    domain: Mapped[str] = mapped_column(String(40))
    currency: Mapped[str] = mapped_column(String(3))
    keepa_domain_id: Mapped[int] = mapped_column(Integer)
    sp_marketplace_id: Mapped[str] = mapped_column(String(20))
    region: Mapped[str] = mapped_column(String(4))  # na | eu | fe
    vat_rate: Mapped[float] = mapped_column(Float, default=0)
    active: Mapped[bool] = mapped_column(Boolean, default=True)


class FeeSchedule(Base):
    """Editable FBA fee rows with effective dates (weights in grams, money in marketplace currency)."""
    __tablename__ = "fee_schedules"
    __table_args__ = (Index("ix_fee_lookup", "marketplace", "fee_type", "size_tier", "effective_from"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    marketplace: Mapped[str] = mapped_column(ForeignKey("marketplaces.code"))
    fee_type: Mapped[str] = mapped_column(String(24))  # fba | storage | removal | inbound
    size_tier: Mapped[str] = mapped_column(String(40))
    max_length_cm: Mapped[float | None] = mapped_column(Float)
    max_width_cm: Mapped[float | None] = mapped_column(Float)
    max_height_cm: Mapped[float | None] = mapped_column(Float)
    weight_from_g: Mapped[float] = mapped_column(Float, default=0)
    weight_to_g: Mapped[float | None] = mapped_column(Float)
    price_from: Mapped[float | None] = mapped_column(Float)
    price_to: Mapped[float | None] = mapped_column(Float)
    amount: Mapped[float] = mapped_column(Float)
    per_kg_over: Mapped[float] = mapped_column(Float, default=0)  # incremental per kg above weight_from_g
    unit: Mapped[str] = mapped_column(String(16), default="per_unit")  # per_unit | per_cuft_month
    season: Mapped[str] = mapped_column(String(10), default="all")  # all | offpeak | peak
    effective_from: Mapped[date] = mapped_column(Date)
    effective_to: Mapped[date | None] = mapped_column(Date)
    source_url: Mapped[str] = mapped_column(String(400), default="")
    notes: Mapped[str] = mapped_column(Text, default="")
    org_id: Mapped[int | None] = mapped_column(ForeignKey("organisations.id", ondelete="CASCADE"))  # null = platform default


class ReferralRule(Base):
    __tablename__ = "referral_rules"
    id: Mapped[int] = mapped_column(primary_key=True)
    marketplace: Mapped[str] = mapped_column(ForeignKey("marketplaces.code"))
    category: Mapped[str] = mapped_column(String(80))
    rate: Mapped[float] = mapped_column(Float)
    threshold: Mapped[float | None] = mapped_column(Float)  # price above which rate_above applies
    rate_above: Mapped[float | None] = mapped_column(Float)
    tiered_whole_price: Mapped[bool] = mapped_column(Boolean, default=False)  # true: whole price at band rate
    min_fee: Mapped[float] = mapped_column(Float, default=0.25)
    effective_from: Mapped[date] = mapped_column(Date)
    effective_to: Mapped[date | None] = mapped_column(Date)
    source_url: Mapped[str] = mapped_column(String(400), default="")
    org_id: Mapped[int | None] = mapped_column(ForeignKey("organisations.id", ondelete="CASCADE"))


class Brand(TimestampMixin, Base):
    __tablename__ = "brands"
    __table_args__ = (UniqueConstraint("org_id", "normalised_name"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    org_id: Mapped[int] = org_fk()
    name: Mapped[str] = mapped_column(String(160))
    normalised_name: Mapped[str] = mapped_column(String(160), index=True)
    owner_company: Mapped[str] = mapped_column(String(200), default="")
    official_website: Mapped[str] = mapped_column(String(300), default="")
    distributor_locator_url: Mapped[str] = mapped_column(String(400), default="")
    reseller_policy_url: Mapped[str] = mapped_column(String(400), default="")
    trademark_info: Mapped[dict] = mapped_column(JSONType, default=dict)
    restrictions: Mapped[dict] = mapped_column(JSONType, default=dict)
    notes: Mapped[str] = mapped_column(Text, default="")


class Category(Base):
    __tablename__ = "categories"
    __table_args__ = (UniqueConstraint("marketplace", "external_id"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    marketplace: Mapped[str] = mapped_column(ForeignKey("marketplaces.code"))
    external_id: Mapped[str] = mapped_column(String(40))
    name: Mapped[str] = mapped_column(String(200))
    parent_id: Mapped[int | None] = mapped_column(ForeignKey("categories.id"))
    root_name: Mapped[str] = mapped_column(String(120), default="")


class Product(TimestampMixin, Base):
    __tablename__ = "products"
    __table_args__ = (UniqueConstraint("org_id", "marketplace", "asin"), Index("ix_products_org_score", "org_id", "opportunity_score"))
    id: Mapped[int] = mapped_column(primary_key=True)
    org_id: Mapped[int] = org_fk()
    marketplace: Mapped[str] = mapped_column(ForeignKey("marketplaces.code"))
    asin: Mapped[str] = mapped_column(String(10), index=True)
    parent_asin: Mapped[str] = mapped_column(String(10), default="")
    title: Mapped[str] = mapped_column(Text, default="")
    brand_id: Mapped[int | None] = mapped_column(ForeignKey("brands.id", ondelete="SET NULL"))
    brand_name: Mapped[str] = mapped_column(String(160), default="", index=True)
    manufacturer: Mapped[str] = mapped_column(String(160), default="")
    category: Mapped[str] = mapped_column(String(160), default="")
    subcategory: Mapped[str] = mapped_column(String(200), default="")
    ean: Mapped[str] = mapped_column(String(20), default="", index=True)
    upc: Mapped[str] = mapped_column(String(20), default="", index=True)
    isbn: Mapped[str] = mapped_column(String(20), default="")
    image_url: Mapped[str] = mapped_column(String(500), default="")
    price: Mapped[float | None] = mapped_column(Float)
    currency: Mapped[str] = mapped_column(String(3), default="GBP")
    bsr: Mapped[int | None] = mapped_column(Integer)
    bsr_category: Mapped[str] = mapped_column(String(160), default="")
    rating: Mapped[float | None] = mapped_column(Float)
    review_count: Mapped[int | None] = mapped_column(Integer)
    offer_count: Mapped[int | None] = mapped_column(Integer)
    fba_offer_count: Mapped[int | None] = mapped_column(Integer)
    fbm_offer_count: Mapped[int | None] = mapped_column(Integer)
    amazon_sells: Mapped[bool | None] = mapped_column(Boolean)
    buybox_seller: Mapped[str] = mapped_column(String(60), default="")
    fulfilment: Mapped[str] = mapped_column(String(8), default="")  # FBA | FBM | AMZ
    weight_g: Mapped[float | None] = mapped_column(Float)
    length_cm: Mapped[float | None] = mapped_column(Float)
    width_cm: Mapped[float | None] = mapped_column(Float)
    height_cm: Mapped[float | None] = mapped_column(Float)
    size_tier: Mapped[str] = mapped_column(String(40), default="")
    variation_count: Mapped[int | None] = mapped_column(Integer)
    image_count: Mapped[int | None] = mapped_column(Integer)
    has_aplus: Mapped[bool | None] = mapped_column(Boolean)
    has_video: Mapped[bool | None] = mapped_column(Boolean)
    listed_at: Mapped[date | None] = mapped_column(Date)
    bought_past_month: Mapped[int | None] = mapped_column(Integer)
    est_monthly_units: Mapped[int | None] = mapped_column(Integer)
    est_units_low: Mapped[int | None] = mapped_column(Integer)
    est_units_high: Mapped[int | None] = mapped_column(Integer)
    est_method: Mapped[str] = mapped_column(String(120), default="")
    est_monthly_revenue: Mapped[float | None] = mapped_column(Float)
    fba_fee: Mapped[float | None] = mapped_column(Float)
    referral_fee: Mapped[float | None] = mapped_column(Float)
    unit_cost: Mapped[float | None] = mapped_column(Float)  # user-entered sourcing cost
    est_profit: Mapped[float | None] = mapped_column(Float)
    est_margin: Mapped[float | None] = mapped_column(Float)
    est_roi: Mapped[float | None] = mapped_column(Float)
    price_stability: Mapped[float | None] = mapped_column(Float)  # 0-1 from history
    sales_consistency: Mapped[float | None] = mapped_column(Float)  # 0-1 from history
    seasonality: Mapped[float | None] = mapped_column(Float)  # 0-1, high = seasonal
    listing_quality: Mapped[int | None] = mapped_column(Integer)
    competition_level: Mapped[str] = mapped_column(String(10), default="")
    opportunity_score: Mapped[int | None] = mapped_column(Integer)
    score_components: Mapped[dict] = mapped_column(JSONType, default=dict)
    data_quality: Mapped[dict] = mapped_column(JSONType, default=dict)
    source: Mapped[str] = mapped_column(String(30), default="user")  # provider that last refreshed core fields
    classification: Mapped[str] = mapped_column(String(24), default="user")
    last_refreshed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    raw: Mapped[dict] = mapped_column(JSONType, default=dict)


class PriceHistory(Base):
    __tablename__ = "price_history"
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id", ondelete="CASCADE"), primary_key=True)
    series: Mapped[str] = mapped_column(String(24), primary_key=True)  # amazon,new,used,buybox,fba,fbm,lowest,warehouse,list,rank,offers_new,offers_fba,offers_fbm,rating,reviews,monthly_sold
    ts: Mapped[datetime] = mapped_column(DateTime(timezone=True), primary_key=True)
    value: Mapped[float | None] = mapped_column(Float)
    source: Mapped[str] = mapped_column(String(20), default="keepa")


class BuyBoxHistory(Base):
    __tablename__ = "buybox_history"
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id", ondelete="CASCADE"), primary_key=True)
    ts: Mapped[datetime] = mapped_column(DateTime(timezone=True), primary_key=True)
    seller_id: Mapped[str] = mapped_column(String(40))
    price: Mapped[float | None] = mapped_column(Float)


class OfferSnapshot(Base):
    __tablename__ = "offer_snapshots"
    id: Mapped[int] = mapped_column(primary_key=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id", ondelete="CASCADE"), index=True)
    ts: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    seller_id: Mapped[str] = mapped_column(String(40))
    seller_name: Mapped[str] = mapped_column(String(160), default="")
    is_fba: Mapped[bool] = mapped_column(Boolean, default=False)
    is_amazon: Mapped[bool] = mapped_column(Boolean, default=False)
    is_buybox: Mapped[bool] = mapped_column(Boolean, default=False)
    condition: Mapped[str] = mapped_column(String(20), default="new")
    price: Mapped[float | None] = mapped_column(Float)
    shipping: Mapped[float | None] = mapped_column(Float)
    stock: Mapped[int | None] = mapped_column(Integer)


class TrackingGroup(TimestampMixin, Base):
    __tablename__ = "tracking_groups"
    id: Mapped[int] = mapped_column(primary_key=True)
    org_id: Mapped[int] = org_fk()
    name: Mapped[str] = mapped_column(String(120))
    colour: Mapped[str] = mapped_column(String(9), default="#4F7CFF")
    kind: Mapped[str] = mapped_column(String(20), default="tracker")  # tracker | competitor_set | market


class TrackedProduct(TimestampMixin, Base):
    __tablename__ = "tracked_products"
    __table_args__ = (UniqueConstraint("org_id", "product_id", "group_id"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    org_id: Mapped[int] = org_fk()
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id", ondelete="CASCADE"), index=True)
    group_id: Mapped[int | None] = mapped_column(ForeignKey("tracking_groups.id", ondelete="SET NULL"))
    notes: Mapped[str] = mapped_column(Text, default="")
    target_price: Mapped[float | None] = mapped_column(Float)
    product: Mapped[Product] = relationship()


class ProductSnapshot(Base):
    """Daily snapshot for tracked products (our own history, independent of Keepa)."""
    __tablename__ = "product_snapshots"
    __table_args__ = (Index("ix_psnap_product_ts", "product_id", "ts"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id", ondelete="CASCADE"))
    ts: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    price: Mapped[float | None] = mapped_column(Float)
    bsr: Mapped[int | None] = mapped_column(Integer)
    review_count: Mapped[int | None] = mapped_column(Integer)
    rating: Mapped[float | None] = mapped_column(Float)
    offer_count: Mapped[int | None] = mapped_column(Integer)
    est_monthly_units: Mapped[int | None] = mapped_column(Integer)
    source: Mapped[str] = mapped_column(String(20), default="")


class Keyword(Base):
    __tablename__ = "keywords"
    __table_args__ = (UniqueConstraint("marketplace", "phrase"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    marketplace: Mapped[str] = mapped_column(ForeignKey("marketplaces.code"))
    phrase: Mapped[str] = mapped_column(String(300), index=True)
    search_volume: Mapped[int | None] = mapped_column(Integer)
    volume_source: Mapped[str] = mapped_column(String(30), default="")
    difficulty: Mapped[int | None] = mapped_column(Integer)
    cpc: Mapped[float | None] = mapped_column(Float)
    result_count: Mapped[int | None] = mapped_column(Integer)
    trend: Mapped[list] = mapped_column(JSONType, default=list)  # [{month, volume}]
    updated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class KeywordList(TimestampMixin, Base):
    __tablename__ = "keyword_lists"
    id: Mapped[int] = mapped_column(primary_key=True)
    org_id: Mapped[int] = org_fk()
    name: Mapped[str] = mapped_column(String(160))
    marketplace: Mapped[str] = mapped_column(String(4), default="UK")
    source: Mapped[str] = mapped_column(String(40), default="")


class KeywordListItem(Base):
    __tablename__ = "keyword_list_items"
    __table_args__ = (UniqueConstraint("list_id", "keyword_id"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    list_id: Mapped[int] = mapped_column(ForeignKey("keyword_lists.id", ondelete="CASCADE"), index=True)
    keyword_id: Mapped[int] = mapped_column(ForeignKey("keywords.id", ondelete="CASCADE"))
    relevance: Mapped[float | None] = mapped_column(Float)
    tags: Mapped[list] = mapped_column(JSONType, default=list)
    keyword: Mapped[Keyword] = relationship()


class RankTrack(TimestampMixin, Base):
    __tablename__ = "rank_tracks"
    __table_args__ = (UniqueConstraint("org_id", "product_id", "keyword_id"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    org_id: Mapped[int] = org_fk()
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id", ondelete="CASCADE"))
    keyword_id: Mapped[int] = mapped_column(ForeignKey("keywords.id", ondelete="CASCADE"))
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    product: Mapped[Product] = relationship()
    keyword: Mapped[Keyword] = relationship()


class RankHistory(Base):
    __tablename__ = "rank_history"
    __table_args__ = (Index("ix_rank_history_track_ts", "track_id", "ts"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    track_id: Mapped[int] = mapped_column(ForeignKey("rank_tracks.id", ondelete="CASCADE"))
    ts: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    organic_pos: Mapped[int | None] = mapped_column(Integer)
    sponsored_pos: Mapped[int | None] = mapped_column(Integer)
    page: Mapped[int | None] = mapped_column(Integer)
    source: Mapped[str] = mapped_column(String(30), default="")


class IndexCheck(Base):
    __tablename__ = "index_checks"
    id: Mapped[int] = mapped_column(primary_key=True)
    org_id: Mapped[int] = org_fk()
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id", ondelete="CASCADE"))
    keyword_id: Mapped[int] = mapped_column(ForeignKey("keywords.id", ondelete="CASCADE"))
    indexed: Mapped[bool | None] = mapped_column(Boolean)
    checked_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    source: Mapped[str] = mapped_column(String(30), default="")


class ListingAnalysis(Base):
    __tablename__ = "listing_analyses"
    id: Mapped[int] = mapped_column(primary_key=True)
    org_id: Mapped[int] = org_fk()
    product_id: Mapped[int | None] = mapped_column(ForeignKey("products.id", ondelete="CASCADE"))
    input: Mapped[dict] = mapped_column(JSONType, default=dict)
    score: Mapped[int] = mapped_column(Integer)
    components: Mapped[dict] = mapped_column(JSONType, default=dict)
    gaps: Mapped[dict] = mapped_column(JSONType, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class ListingDraft(TimestampMixin, Base):
    __tablename__ = "listing_drafts"
    id: Mapped[int] = mapped_column(primary_key=True)
    org_id: Mapped[int] = org_fk()
    product_id: Mapped[int | None] = mapped_column(ForeignKey("products.id", ondelete="SET NULL"))
    name: Mapped[str] = mapped_column(String(160), default="Untitled listing")
    title: Mapped[str] = mapped_column(Text, default="")
    bullets: Mapped[list] = mapped_column(JSONType, default=lambda: ["", "", "", "", ""])
    description: Mapped[str] = mapped_column(Text, default="")
    backend_terms: Mapped[str] = mapped_column(Text, default="")
    keyword_list_id: Mapped[int | None] = mapped_column(ForeignKey("keyword_lists.id", ondelete="SET NULL"))
    facts: Mapped[str] = mapped_column(Text, default="")


class ReviewDataset(Base):
    __tablename__ = "review_datasets"
    id: Mapped[int] = mapped_column(primary_key=True)
    org_id: Mapped[int] = org_fk()
    product_id: Mapped[int | None] = mapped_column(ForeignKey("products.id", ondelete="SET NULL"))
    name: Mapped[str] = mapped_column(String(200))
    source: Mapped[str] = mapped_column(String(40), default="user_upload")
    reviews: Mapped[list] = mapped_column(JSONType, default=list)  # [{rating, title, body, date, verified}]
    review_count: Mapped[int] = mapped_column(Integer, default=0)
    analysis: Mapped[dict] = mapped_column(JSONType, default=dict)
    analysed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
