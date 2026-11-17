# Kestrel — Amazon product intelligence & supplier sourcing platform

Working name: **Kestrel** (configurable via `APP_NAME`). Primary marketplace: Amazon UK (amazon.co.uk). Architected for US, DE, FR, IT, ES, NL, CA, AU.

This document covers the eight planning items requested before implementation: requirements analysis, technical architecture, feature checklist (see `02-checklist.md`), data providers, independent vs paid capabilities, database schema, roadmap and limitations.

---

## 1. Requirements analysis

The product is three things joined by one data model:

1. **Market intelligence** (Jungle Scout / Helium 10 / Keepa equivalents): product discovery, sales estimation, historical price/rank/offer data, keywords, competitors, listings, reviews.
2. **Sourcing intelligence** (the differentiator): supplier discovery for branded and unbranded products, brand-owner and authorised-distributor research with cited evidence, company-registry and VAT verification, invoice documentation assessment, supplier comparison and RFQ management.
3. **Seller operations** (needs the seller's own Amazon authorisation): profit, inventory, sales analytics, PPC, reimbursements, review requests.

Cross-cutting rules that shape every module:

- **Provenance on every number.** Each value carries a classification (`official_api`, `official_supplier`, `public_registry`, `licensed`, `estimated`, `ai`, `user`, `demo`), a source, a retrieval time and, for history, the period covered. Estimates carry a confidence range and a method summary.
- **No invented data.** If a provider is not configured or fails, the UI shows "unavailable" with the reason and the credential needed. Demo data lives only in an organisation flagged `is_demo`, and the UI labels it.
- **No false authority.** Supplier scores never imply authorisation; invoice assessment is a "documentation assessment", never an approval prediction.
- **Legitimate data only.** No scraping against terms, no CAPTCHA bypass, no use of other people's accounts. Amazon data comes from Keepa, SP-API, PA-API, the Ads API or licensed datasets (DataForSEO), or is entered/imported by the user.

## 2. Technical architecture

```
                ┌────────────────────────── web (Next.js 15, React 19, TS) ─────────────────────────┐
 browser ─────▶ │ App Router · Tailwind · Radix primitives (shadcn-style kit) · TanStack Table/Query │
                │ Recharts · server rewrites /api/* → API                                          │
                └──────────────────────────────────────┬────────────────────────────────────────────┘
                                                       │ REST (JSON) · httpOnly JWT cookie
                ┌──────────────────────────── api (FastAPI, Python 3.12+) ──────────────────────────┐
                │ routers/ (one per module) → services/ (domain logic) → providers/ (data sources)   │
                │ auth · RBAC · org isolation · audit log · rate limiting · structured JSON logging  │
                └───────┬───────────────────────┬──────────────────────────┬─────────────────────────┘
                        │                       │                          │
                 PostgreSQL 16            Redis 7                    Object storage
          (SQLAlchemy 2, Alembic)  (cache, rate limits, locks)   (S3-compatible / local disk)
                        ▲
                        │ jobs table (SELECT … FOR UPDATE SKIP LOCKED)
                ┌───────┴───────── worker (same codebase, `python -m app.worker`) ─────────────────┐
                │ scheduler: tracking refresh, rank checks, alert evaluation, report generation      │
                └────────────────────────────────────────────────────────────────────────────────────┘
```

**Why these choices**

- FastAPI + SQLAlchemy 2: typed, fast, first-class Pydantic validation; Python has the best libraries for data work (openpyxl, reportlab, pdfplumber, numpy-free stats are enough).
- Postgres job queue instead of Celery: one less moving part, transactional with the data it changes, `SKIP LOCKED` scales to several workers. Redis handles caching, provider rate-limit buckets and distributed locks.
- Provider layer: every external source implements `Provider` (config schema, auth, `RateLimiter`, `cache_ttl`, typed errors, attribution, freshness). Swapping Keepa for another history vendor touches one module.
- Secrets: provider credentials stored per organisation, encrypted with Fernet (key from `SECRET_ENCRYPTION_KEY`), never returned to the browser after save.

**Request lifecycle**: router → `get_current_member` (JWT → user → membership → role) → service (all queries filtered by `org_id`) → provider (cache check → rate limiter → call → validate → store `DataSourceRecord`) → response model with `source` blocks.

**Security**: Argon2 password hashing; JWT access token (15 min) + rotating refresh token (30 days, hashed in DB); roles `owner > admin > analyst > viewer`; per-IP and per-user rate limits in Redis; CORS locked to the web origin; audit log for auth events, integration changes, exports, supplier verification changes and document uploads; uploaded files type-checked and size-limited.

## 3. Data providers

| # | Provider | Used for | Access | Cost |
|---|---|---|---|---|
| 1 | **Keepa API** | Price/BSR/offer/buy-box/rating/review history, stats (30/90/180/365 averages), Product Finder (`/query`), best sellers, seller lookup, tracking webhooks | Customer's own API key | Paid (from ~€49/mo) |
| 2 | **Amazon SP-API** | Catalog Items (identifiers incl. EAN/UPC/ISBN, sales ranks, dimensions), Product Pricing (offers, buy box), **Product Fees** (exact fee estimates), **Listings Restrictions** (is this seller gated for this ASIN), FBA Inventory, Orders/Sales metrics, Reports (settlement, reimbursements, returns, Brand Analytics), **Solicitations** (compliant review requests) | Seller's LWA authorisation; developer registration | Free |
| 3 | Amazon PA-API 5 | Product search and item data where the user has an Associates account with qualifying sales | Associates keys | Free, gated |
| 4 | **Amazon Ads API** | Campaign, keyword and search-term reports; keyword and bid recommendations | Advertiser authorisation | Free |
| 5 | **DataForSEO (Amazon endpoints)** | Keyword search volume, related keywords, ranked keywords for an ASIN (reverse ASIN), Amazon SERP (organic + sponsored positions) | API login | Paid, pay-as-you-go |
| 6 | **Companies House API** | UK company identity, status, registered address, officers, filing history | Free API key | Free |
| 7 | **HMRC Check a UK VAT number API** | UK VAT number validation and registered name/address | HMRC developer app (client credentials) | Free |
| 8 | **EU VIES REST** | EU VAT validation | None | Free |
| 9 | **UK Trade Tariff API** | Commodity codes and import duty rates | None | Free |
| 10 | **Frankfurter (ECB rates)** | Multi-currency supplier comparison | None | Free |
| 11 | **Brave Search API** (or SerpAPI) | Finding official brand sites, distributor locators, supplier pages; results cited | API key | Paid tier / free quota |
| 12 | **Claude API** | Extraction from fetched pages and documents, review analysis, listing writing, research assistant with citations | API key | Paid |
| 13 | Licensed trade-record data (ImportGenius, Panjiva) | Manufacturers behind competing products via shipment records | Commercial licence | Paid (expensive) |
| 14 | SMTP | Email alerts and RFQ sending | Any SMTP | — |

## 4. What works without paid data

Works with **no credentials**: accounts, organisations, roles; profit/FBA/VAT calculators with the editable fee database; landed-cost and duty (Trade Tariff API); FX conversion; supplier records, contacts, quotations, RFQs, purchase orders, comparison and scoring; Companies House needs only a free key; VIES; invoice documentation assessment on uploaded PDFs (rule engine works without AI; AI extraction improves it); manual and CSV/extension imports of products; keyword processing (Frankenstein), listing builder rules and Scribbles-style coverage; inventory and sales analytics from uploaded Seller Central reports; reports and exports; alerts on imported data.

Needs the **seller's free Amazon authorisation** (SP-API / Ads API): exact fees, gating checks, inventory sync, orders, settlements, reimbursements, review requests, PPC analytics, Brand Analytics search terms.

Needs **paid data**: historical charts and Product Finder (Keepa); keyword volumes, reverse ASIN and SERP rank tracking (DataForSEO); web-wide distributor discovery (search API); AI features (Claude API); shipment records (trade-data licence).

## 5. Database schema (PostgreSQL)

All tenant tables carry `org_id` (FK, indexed) and are filtered by it in every query. Timestamps are UTC `timestamptz`.

**Identity & tenancy** — `users` (email unique, password_hash, name, is_active, created_at) · `organisations` (name, slug, is_demo, default_marketplace) · `memberships` (user_id, org_id, role; unique pair) · `refresh_tokens` (user_id, token_hash, expires_at, revoked_at) · `audit_logs` (org_id, user_id, action, entity, entity_id, meta jsonb, ip, created_at; index org_id+created_at).

**Reference** — `marketplaces` (code PK e.g. UK, amazon_domain, currency, keepa_domain_id, sp_marketplace_id, vat_rate, region) · `fee_schedules` (marketplace, fee_type, size_tier, weight_from_g, weight_to_g, price_from, price_to, amount, unit, effective_from, effective_to, source_url, notes) · `referral_rules` (marketplace, category, threshold, rate, min_fee, effective_from) · `categories` (marketplace, external_id, name, parent_id).

**Products** — `brands` (org_id, name, normalised_name, owner_company, official_website, notes) · `products` (org_id, marketplace, asin; unique org+mkt+asin; title, brand_id, category_id, ean, upc, isbn, manufacturer, image_url, price, currency, bsr, bsr_category, rating, review_count, offer_count, fba_offer_count, fbm_offer_count, buybox_seller, weight_g, length_mm, width_mm, height_mm, size_tier, variation_count, listed_at, est_monthly_units, est_low, est_high, est_method, data_quality, last_refreshed_at) · `product_metrics` (product_id, metric, value, period_days, computed_at — 30/90/180/365 averages, volatility, stability) · `price_history` (product_id, series, ts, value; PK product+series+ts; BRIN on ts) · `rank_history` (product_id, category_id, ts, rank) · `offer_snapshots` (product_id, ts, seller_id, is_fba, is_amazon, price, shipping, condition, is_buybox) · `buybox_history` (product_id, ts, seller_id, price) · `data_source_records` (org_id, entity, entity_id, provider, classification, retrieved_at, period_from, period_to, request_ref, tokens_used, status, error).

**Research workspace** — `saved_searches` (org_id, user_id, module, name, filters jsonb, is_template) · `tracking_groups` (org_id, name, colour) · `tracked_products` (org_id, product_id, group_id, notes, target_price) · `competitor_sets` + `competitor_set_items` · `opportunity_scores` (product_id, score, components jsonb, explanation, computed_at).

**Keywords** — `keywords` (marketplace, phrase; unique) · `keyword_history` (keyword_id, ts, search_volume, source) · `keyword_lists` (org_id, name) + `keyword_list_items` (list_id, keyword_id, relevance, tags) · `rank_tracks` (org_id, product_id, keyword_id, active) · `rank_history_kw` (track_id, ts, organic_pos, sponsored_pos, page) · `index_checks` (org_id, product_id, keyword_id, indexed, checked_at, source).

**Listings & reviews** — `listing_analyses` (org_id, product_id, score, components jsonb, gaps jsonb, created_at) · `listing_drafts` (org_id, product_id, title, bullets jsonb, description, backend_terms, keyword_list_id) · `review_datasets` (org_id, product_id, source, review_count, uploaded_at) · `review_analyses` (dataset_id, summary jsonb, model, created_at).

**Suppliers & sourcing** — `suppliers` (org_id, legal_name, trading_name, supplier_type [brand_owner, manufacturer, authorised_distributor, wholesaler, importer, trade_supplier, private_label_mfr, oem, odm], country, region, website, registration_number, registry, vat_number, vat_verified_at, status [official_brand_owner, manufacturer, verified_authorised_distributor, established_wholesaler, unverified, high_risk], score, score_components jsonb, moq_min, lead_time_days, currency, certifications jsonb, notes) · `supplier_contacts` (supplier_id, name, role, email, phone, source) · `supplier_products` (supplier_id, product_id|null, description, unit_price, currency, moq, sample_available) · `supplier_evidence` (supplier_id, kind [registry, vat, website_claim, brand_locator, trade_record, document, user_note], summary, source_url, source_name, retrieved_at, confidence, raw jsonb) · `brand_authorisations` (org_id, brand_id, supplier_id, evidence_type, source_url, statement, verified_at, verified_by, status) · `documents` (org_id, supplier_id, kind [invoice, authorisation_letter, certificate, quotation, other], storage_key, filename, sha256, mime, pages, uploaded_by, uploaded_at) · `invoice_assessments` (document_id, extracted jsonb, checks jsonb, risk_level, result, policy_source_url, policy_retrieved_at, created_at) · `quotations`/RFQs (org_id, supplier_id, product_desc, quantity, target_price, status, sent_at, responded_at, quoted_price, currency, moq, lead_time_days, shipping_terms, notes) · `purchase_orders` (org_id, supplier_id, rfq_id, status, total, currency, items jsonb, ordered_at, expected_at) · `sample_orders` · `communications` (org_id, supplier_id, direction, channel, subject, body, at) · `eligibility_records` (org_id, product_id, brand_id, result [eligible, approval_required, restricted], checked_at, source [seller_central_manual, sp_api]).

**Finance & operations** — `profit_calculations` (org_id, product_id|null, inputs jsonb, outputs jsonb, fee_schedule_version, created_at) · `inventory_items` (org_id, sku, product_id, on_hand, inbound, reserved, unit_cost, lead_time_days, safety_days, source) · `inventory_snapshots` · `sales_records` (org_id, date, sku, units, revenue, fees, refunds, source) · `ad_metrics` (org_id, date, campaign, ad_group, keyword, impressions, clicks, spend, sales, orders) · `reimbursement_cases` (org_id, type, sku, quantity, estimated_amount, evidence jsonb, status [identified, reviewed_by_seller, filed_by_seller, resolved]).

**Platform** — `integrations` (org_id, provider, config_encrypted, status, last_ok_at, last_error, usage jsonb) · `alert_rules` (org_id, entity_type, entity_id, condition jsonb, channels jsonb, active) · `alert_events` (rule_id, triggered_at, payload jsonb, read_at) · `reports` (org_id, kind, params, status, storage_key, format, created_at) · `jobs` (kind, payload, status, run_at, attempts, locked_at, error) · `ai_threads` + `ai_messages` (content, citations jsonb, model, tokens).

Retention: raw provider payloads 90 days; history tables kept indefinitely (BRIN index, monthly partitioning when large); audit logs 2 years; uploaded documents until deleted by the user.

## 6. Roadmap

| Phase | Scope | Exit check |
|---|---|---|
| 1 Foundation | repo, Docker, Postgres/Redis, migrations, auth, orgs, RBAC, audit, provider framework, integrations settings, design system, app shell, dashboard | tests pass; every nav item routes to a real page |
| 2 Product intelligence | product model, imports (CSV/extension/SP-API/Keepa), database & filters, saved templates, opportunity scoring with explanations, tracker & groups, comparison (≤10), profit/FBA/VAT calculators, fee DB | scoring unit-tested; calculator matches worked examples |
| 3 Historical | Keepa client & decoder, history storage, analytics (averages, volatility, stability), interactive charts, buy-box ownership, Product Finder, alert rules + engine + email | real Keepa responses decoded in tests (fixtures from documented format) |
| 4 Keywords & competitors | DataForSEO keyword volume, related keywords, reverse ASIN, SERP rank tracking, index checker, Frankenstein, listing analyzer & builder, competitor intelligence, review intelligence | provider contract tests; UI states for "not configured" |
| 5 Supplier intelligence | supplier CRUD, search, Companies House, HMRC VAT, VIES, brand verification with evidence, distributor research (search API + Claude extraction with citations), invoice compliance checker, supplier scoring & comparison, RFQ/quotes/POs/samples | assessment rules tested against sample invoices |
| 6 Business intelligence | AI assistant (retrieval over org data + citations + confidence), inventory forecasting, sales analytics, PPC analytics, reimbursement analysis, reports (CSV/XLSX/PDF), notifications | end-to-end flows |
| 7 Production | e2e (Playwright), security review, performance, docs, deploy guide | green CI |

Progress is tracked in `03-status.md`.

## 7. Limitations (legal, technical, data access)

- **Amazon terms.** Amazon's Conditions of Use forbid robots and data mining on amazon.* pages. The platform does not crawl Amazon. The earlier Product Pilot Chrome extension fetches product pages automatically while a user browses; that sits in a grey area under those terms and is not used as a backend data source here. Its exports can still be imported as **user-entered** data.
- **Keepa terms.** Keepa data is licensed to the key holder. Each organisation must use its own Keepa key; the platform must not pool one key's data across customers. Same for DataForSEO and PA-API licences.
- **Sales and search volume are estimates everywhere.** Amazon publishes neither, except Brand Analytics (search frequency rank) to brand-registered sellers via SP-API. The UI shows ranges and methods.
- **Authorisation can't be proven by data.** Only a brand (or its documented distributor programme) can confirm authorisation. The platform records evidence and its source; it never infers authorisation from a supplier selling a brand.
- **Invoice acceptance is Amazon's decision.** The checker compares documents to Amazon's published requirements (source URL and retrieval date stored) and reports gaps and risks, nothing more.
- **Trade records.** UK customs declarations are not public; US bills of lading are, via licensed vendors. Manufacturer discovery from shipments is therefore mostly US-import based and paid.
- **Review requests** must use Amazon's Solicitations API (one standard request per order, 5–30 days after delivery). No incentivised or filtered requests.
- **Reimbursements.** The tool identifies possible discrepancies from the seller's own reports; the seller reviews and files any claim.
- **Personal data.** Supplier contact details and uploaded invoices are personal/commercial data under UK GDPR: tenant isolation, encryption at rest for secrets, deletion on request, retention policy above.
- **Fees change.** Fee tables carry effective dates and source links; the seeded UK/US values are the published 2025 schedules and must be reviewed when Amazon announces changes. SP-API Product Fees gives exact per-ASIN fees once connected.
