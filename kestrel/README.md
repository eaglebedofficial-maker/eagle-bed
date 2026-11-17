# Kestrel: Amazon product intelligence & supplier discovery

Kestrel is one workspace for Amazon product research, Keepa-style history, keyword intelligence and supplier sourcing. It starts with Amazon UK and is built for US, DE, FR, IT, ES, NL, CA and AU. It also includes compliance-aware supplier sourcing.

- `api/` — FastAPI, SQLAlchemy 2, Alembic, PostgreSQL 16, Redis, and a background worker.
- `web/` — Next.js 15, React 19, TanStack Query/Table, Tailwind and Recharts.
- `docs/01-architecture.md` — architecture, data providers, schema, roadmap and limitations.
- `docs/02-checklist.md` — the build checklist.

## Run it with Docker

```bash
cp .env.example .env          # set POSTGRES_PASSWORD, JWT_SECRET, SECRET_ENCRYPTION_KEY
docker compose up --build
docker compose exec api python -m app.demo   # optional: fictional demo workspace
```

Open http://localhost:3000. You can create an organisation, or choose **Explore the demo workspace**.

## Run locally (development)

```bash
# API (Python 3.12)
cd api
python -m venv .venv && .venv/bin/pip install -r requirements-dev.txt
cp .env.example .env                      # defaults work with a local Postgres + Redis
.venv/bin/alembic upgrade head
.venv/bin/python -m app.seed              # marketplaces, fee schedules, referral rules
.venv/bin/python -m app.demo              # optional demo workspace
.venv/bin/uvicorn app.main:app --reload --port 8000
.venv/bin/python -m app.worker            # second terminal: tracking, alerts, reports
.venv/bin/pytest -q                       # tests

# Web
cd web && npm install && npm run dev      # http://localhost:3000, proxies /api to :8000
```

## Connecting real data

Kestrel never scrapes Amazon and never makes up data. Each organisation connects its own sources in **Settings → Integrations**. Keys are encrypted at rest, and you can test each connection from that page.

| Source | Unlocks | Cost |
|---|---|---|
| Keepa API | Price, rank, buy-box and offer history, Product Finder, bestsellers | Paid Keepa plan |
| Amazon SP-API | Catalogue, live offers, exact fee estimates, listing restrictions, your inventory and sales | Free with a seller account |
| Amazon Ads API | PPC reports and bid recommendations | Free with an Ads account |
| PA-API 5 | Catalogue search and prices | Free for Associates |
| DataForSEO | Amazon keyword volumes, related keywords, ranked keywords, SERPs | Pay as you go |
| Companies House, HMRC VAT, VIES | Supplier identity and VAT checks | Free (Companies House and HMRC need keys) |
| Brave Search | Supplier and brand discovery with citations | Free tier |
| Anthropic (Claude) | AI assistant, listing drafts, review and invoice analysis | Pay as you go |
| UK Trade Tariff, Frankfurter FX | Duty rates and exchange rates | Free, no key |

If a source isn't connected, the screen that needs it says so and links to Integrations. You can still import CSVs or Product Pilot extension exports.

## Honesty by design

- Every number carries a data classification badge: Official API, Licensed, Public register, Estimated, AI, User or Demo.
- Sales figures are labelled as estimates. Your actual sales appear only from your own SP-API data or imports.
- A supplier is never marked authorised just because it sells a brand. That status needs brand-side evidence.
- Invoice checks are a **documentation assessment** against a policy reference and review date. They are not a promise of Amazon approval.
- The demo workspace is fictional. Its ASINs start with `B0DEMO`, its company names end in "(Demo)", and a banner shows on every page.

## Production notes

- Set `ENVIRONMENT=production`. The API then refuses to start with the development secrets.
- Set `COOKIE_SECURE=true` behind HTTPS and set `WEB_ORIGIN` to your domain.
- Set `DEMO_LOGIN_ENABLED=false` if you don't want public demo access.
- Back up the Postgres volume and the `storage` volume, which holds uploaded documents.
- Run one worker per deployment. It uses Redis locks and `SKIP LOCKED` job claiming, so extra workers are safe but unnecessary.
