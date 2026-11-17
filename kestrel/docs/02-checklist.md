# Feature checklist and status

Legend:
- ☑ built and tested
- ◐ built, partly
- ⊘ built, needs credentials to run live (interface, config and tests with recorded fixtures)
- ☐ not started

Checks behind ☑ (updated 17 Nov 2026):
- 28 backend tests pass (`pytest`).
- The production web build passes (`next build`, 41 routes).
- The end-to-end smoke test passes: `npm run e2e` opens all 38 routes in the demo workspace with no JavaScript errors or API 5xx responses.
- Each screen was reviewed by screenshot in dark, light and 390 px mobile layouts.

## Phase 1 — Foundation
- ☑ Monorepo, Docker Compose (Postgres, Redis, API, worker, web), `.env.example`
  - The Compose file is written, but `docker compose up` has not been run here because the container has no Docker.
- ☑ SQLAlchemy models + Alembic migrations (52 tables)
- ☑ Auth: register, login, refresh rotation with reuse detection, logout, Argon2, httpOnly cookies, demo sign-in
- ◐ Organisations, memberships, roles (owner/admin/analyst/viewer). Members are added directly; there is no email invitation flow.
- ☑ Audit log
- ☑ Rate limiting (Redis), structured logging, error envelope
- ☑ Provider framework (config, encryption, rate limit, cache, attribution, freshness, health check)
- ☑ Integrations settings API + UI
- ☑ Job queue + scheduler worker
- ☑ Design system (tokens, typography, components, charts)
- ☑ App shell: collapsible sidebar, top bar (⌘K search, marketplace, notifications, help, theme, profile)
- ☑ Dashboard
- ☑ Demo organisation
  - Fictional data, `demo` classification on every record, and a banner on every page.

## Phase 2 — Product intelligence
- ☑ Product model, identifiers (ASIN/EAN/UPC/ISBN), URL parsing
- ◐ Imports
  - Done and tested: CSV and Product Pilot extension JSON.
  - Needs credentials: SP-API catalog and Keepa (⊘).
- ☑ Product Database: search, about 40 filters, sort, server paging, column chooser, bulk select, CSV/XLSX export
- ◐ Saved searches and research templates. Create, use and delete work; renaming does not.
- ☑ Opportunity score (12 factors) with explanation; factors with no data are left out rather than guessed
- ☑ Opportunity Finder
- ☑ Product detail page (10 tabs)
- ◐ Product Tracker with groups. Moving a product to another group or setting a target price needs a PATCH endpoint.
- ☑ Product Comparison (≤10)
- ☑ Profit calculator (FBA/FBM, VAT-inclusive and VAT-exclusive, scenarios, waterfall, FX, duty lookup)
- ☑ Editable fee database with effective dates; FBA and VAT calculators

## Phase 3 — Historical (Keepa)
- ⊘ Keepa client, token accounting, decoder, buy-box seller history, offers
- ☑ History storage + analytics (averages, volatility, buy-box share, BSR movement, seasonality)
- ☑ Keepa Intelligence page with multi-series chart, ranges, toggles, brush zoom
- ⊘ Product Finder (Keepa `/query`), best sellers
- ◐ Alert rules, evaluation and in-app notifications work. Email needs SMTP, and existing rules can only be paused or deleted, not edited.

## Phase 4 — Keywords & competitors
- ⊘ Keyword research (DataForSEO volume, related keywords, SERP)
- ⊘ Reverse ASIN (ranked keywords, overlap, gaps)
- ⊘ Rank tracker + keyword tracker. Batches of more than 5 keywords run in the worker.
- ⊘ Index checker with history (8 searches run in parallel)
- ☑ Keyword processor (Frankenstein-style)
- ☑ Listing analyzer + builder
- ⊘ AI listing writer (needs an Anthropic key)
- ☑ Competitor sets (≤10, enforced server-side) and Market tracker
- ◐ Review intelligence: import and statistics work; the AI report needs an Anthropic key (⊘). Kestrel never generates reviews.

## Phase 5 — Supplier intelligence
- ☑ Supplier database, profiles, contacts, products, evidence, communications
- ⊘ Companies House and HMRC VAT verification (need keys)
- ☑ VIES verification (no key needed)
- ◐ Brand verification and authorised-distributor research. Records and evidence work; web discovery needs Brave and Anthropic keys.
- ☑ Amazon Supplier & Invoice Compliance Checker
  - Documentation assessment, 6 categories and integrity indicators.
  - AI field extraction needs an Anthropic key; rule checks run without one.
- ☑ Supplier scoring and comparison. Authorisation is never inferred without brand-side evidence; a test enforces this.
- ☑ RFQ manager, quotations, purchase orders
- ⊘ Eligibility records: manual entry is ☑; the SP-API Listings Restrictions check needs credentials.

## Phase 6 — Business intelligence
- ⊘ AI research assistant: retrieval, citations, confidence, assumptions, missing information and risks (needs an Anthropic key)
- ☑ Inventory manager (days of cover, reorder point, restock); SP-API sync is ⊘
- ☑ Sales analytics from report import; SP-API sync is ⊘
- ☑ PPC analytics from report import; Ads API is ⊘
- ☑ Reimbursement analysis
- ☑ Reports & exports (CSV, XLSX, PDF). Generation is synchronous.
- ◐ Notifications centre works; email needs SMTP.

## Phase 7 — Production
- ☑ Backend unit and integration tests (pytest), plus an end-to-end smoke test (`npm run e2e`)
- ◐ Security
  - Done: auth throttling, RBAC on every route, encrypted credentials, production refuses development secrets, uploads limited in size and type.
  - Not done: an external penetration test.
- ◐ Performance pass: indexes and server paging are done; no load testing yet.
- ☑ Setup and deployment docs (`README.md`)

## Outstanding work
1. Live verification of every paid provider with real keys. The adapters follow each provider's documented API and are tested with recorded fixtures.
2. Missing edit actions:
   - tracked products (group, target price)
   - saved searches (rename)
   - alert rules (edit condition)
   - saved profit calculations (rename)
   - brands and purchase orders (delete)
3. Expose SP-API `getMyFeesEstimate` in the profit and FBA calculators; it is currently used only during product refresh.
4. Flat Rate VAT in the profit engine (the VAT calculator already supports it).
5. Background generation for large reports.
6. Email invitations for team members.
