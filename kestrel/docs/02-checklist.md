# Feature checklist and status

Legend: ☑ built and tested · ◐ built, partly · ⊘ built, needs credentials to run live (interface + config + tests with recorded fixtures) · ☐ not started

Updated as each phase completes.

## Phase 1 — Foundation
- ☐ Monorepo, Docker Compose (Postgres, Redis, API, worker, web), `.env.example`
- ☐ SQLAlchemy models + Alembic migrations
- ☐ Auth: register, login, refresh rotation, logout, Argon2, httpOnly cookies
- ☐ Organisations, memberships, roles (owner/admin/analyst/viewer), invite
- ☐ Audit log
- ☐ Rate limiting (Redis), structured logging, error envelope
- ☐ Provider framework (config, encryption, rate limit, cache, attribution, freshness, health check)
- ☐ Integrations settings API + UI
- ☐ Job queue + scheduler worker
- ☐ Design system (tokens, typography, components)
- ☐ App shell: collapsible sidebar, top bar (search, marketplace, notifications, help, profile)
- ☐ Dashboard
- ☐ Demo organisation (clearly labelled)

## Phase 2 — Product intelligence
- ☐ Product model, identifiers (ASIN/EAN/UPC/ISBN), URL parsing
- ☐ Imports: CSV, Product Pilot extension JSON, SP-API catalog, Keepa
- ☐ Product Database: search, 30+ filters, sort, pagination, column chooser, bulk select, export
- ☐ Saved searches and research templates
- ☐ Opportunity score (12 factors) with explanation
- ☐ Opportunity Finder (ranked lists by opportunity type)
- ☐ Product detail page (10 tabs)
- ☐ Product Tracker with groups
- ☐ Product Comparison (≤10)
- ☐ Profit calculator (FBA/FBM, VAT-inclusive/exclusive, scenarios, waterfall)
- ☐ Editable fee database with effective dates; FBA and VAT calculators

## Phase 3 — Historical (Keepa)
- ☐ Keepa client, token accounting, decoder for all csv series, buy-box seller history, offers
- ☐ History storage + analytics (averages, volatility, buy-box stability, BSR movement, seasonality)
- ☐ Keepa Intelligence page with multi-series interactive chart, ranges, export
- ☐ Product Finder (Keepa `/query`)
- ☐ Alert rules + evaluation + in-app + email

## Phase 4 — Keywords & competitors
- ☐ Keyword research (DataForSEO volume, related, difficulty)
- ☐ Reverse ASIN (ranked keywords, overlap, gaps)
- ☐ Rank tracker + keyword tracker (SERP positions, schedule, alerts)
- ☐ Index checker with history
- ☐ Frankenstein keyword processor
- ☐ Listing analyzer + listing optimizer (Scribbles-style)
- ☐ Competitor intelligence
- ☐ Review intelligence (upload/dataset → AI report)
- ☐ Market tracker

## Phase 5 — Supplier intelligence
- ☐ Supplier database, profiles, contacts, products, evidence
- ☐ Companies House, HMRC VAT, VIES verification
- ☐ Brand verification and authorised distributor research with citations
- ☐ Amazon Supplier & Invoice Compliance Checker
- ☐ Supplier scoring and comparison
- ☐ RFQ manager, quotations, samples, purchase orders, communications
- ☐ Eligibility records (manual + SP-API Listings Restrictions)

## Phase 6 — Business intelligence
- ☐ AI research assistant (retrieval + citations + confidence)
- ☐ Inventory manager (forecast, reorder, stockout risk)
- ☐ Sales analytics (report import / SP-API)
- ☐ PPC analytics (report import / Ads API)
- ☐ Reimbursement analysis
- ☐ Reports & exports (CSV, XLSX, PDF)
- ☐ Notifications centre + email

## Phase 7 — Production
- ☐ Unit + integration tests (pytest), e2e (Playwright)
- ☐ Security review, performance pass
- ☐ Setup and deployment docs
