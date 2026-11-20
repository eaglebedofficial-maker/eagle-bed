# Eagle Bed — reporting cadence (Rocket Stage 8)

Prepared 20 Nov 2026 by the Manager. **Design only: nothing was created or changed.** It reuses the scheduled tasks that already exist. The monthly report is a **PROPOSAL that needs owner approval**.

PROFITABILITY NOT VERIFIED — COST DATA PARKED. Every report shows revenue only, and shows UNKNOWN (never 0) where data is missing.

## 1. Existing scheduled tasks (reused, no duplicates)

| Task | ID | Schedule (UK) | Runs/week | Role in reporting |
|---|---|---|---|---|
| Daily autopilot | trig_01JfLktS4EjKHgtArtoHASzv | 07:47 daily | 7 | Morning monitor: site up, alerts, SEO applies, social and video queue check |
| Inbox agent | trig_015kv1BJhoAyGXD4veTMkCTo | every 2 h, 09:07–21:07 | 49 | Customers waiting, drafted replies, phone alert |
| Social posts | trig_01KWcB82NnwV2BbFQhQ3iuhL | 08:41 / 12:41 / 17:41 | 21 | Posts + UTM links (feeds DQ08 untagged-links check) |
| Email Marketing | trig_01QJKSXdVhoLknhemD2qC5Jb | weekdays 09:53 | 5 | Trade sends, bounces, replies (HQ outreach/day-*) |
| Email Marketing top-up | trig_01KjwYApBMKCQsMJCeXvbrr5 | weekdays 14:23 | 5 | Fills the daily shortfall |
| Daily report incl. DQ | trig_01RxMxSftZmA5XFKM8QHTH84 | 23:59 daily | 7 | **The daily CEO report** (email + push) and HQ dq/latest |
| Weekly Search Revenue report | trig_01JT6xGfHqH2K1jH6V5SB8DX | Mon 08:52 | 1 | **The weekly CEO report** (organic + revenue) |
| Weekly Google growth | trig_01P1wKHd5L7Qc9og4T9TS18L | Mon 11:17 | 1 | GSC pull + safe SEO fixes (≤40 OpenRush credits/week) |
| CEO sprint | trig_01GL2DgPpqXmDynATB6eu3xJ | Mon + Thu 10:23 | 2 | Approval-queue review and sprint |
| Cinema videos | trig_016okuWup1wybjbpScFyxw4B | 08:46 / 17:46 | 14 | None while autoCinema is false (see section 6) |

Source: `agent-performance.csv` and `resource-usage.csv` (list_triggers 20 Nov 01:00). `last_run` only proves a wake was delivered, not that the task worked.

## 2. Daily report — owner reads at night (23:59 task) and in the morning (07:47 alerts)

| Section | Produced by | Data / HQ doc | Status |
|---|---|---|---|
| Orders and net revenue: yesterday, today, last 7d vs previous 7d | Daily report 23:59 | Shopify orders; same rules as `ceo-revenue-baseline.csv` (exclude #1010 #1014 #1020 #1001 #1006) | Exists |
| Google Ads spend and real orders (yesterday, 7d) | Daily report 23:59 | Ads + Shopify journeys | Exists (spend); real-order match = weekly |
| **Ads billing alert** (declined card, suspension) | Daily report 23:59 | Gmail billing emails | Exists (flagged the 19 Nov decline) |
| Data quality score and FAIL list | Daily report 23:59 | HQ dq/latest (19 checks) | Exists |
| Customers waiting (IDs, hours waiting, promises due today) | Inbox agent (every 2 h) → daily report | HQ inbox | Exists |
| Trade outreach sent / bounced / replied | Email Marketing 09:53 + 14:23 → daily report | HQ outreach/day-*, leads | Exists |
| Site, theme and alert checks | Daily autopilot 07:47 | live site | Exists |
| Delivery promises due tomorrow; orders open > 10 days | **GAP** | needs owner delivered dates | Gap (G1) |
| PROFITABILITY banner | Daily report 23:59 | fixed text | Add to template (G7) |

## 3. Weekly report — Monday morning

| Section | Produced by | Data / HQ doc | Status |
|---|---|---|---|
| Revenue last 7d / 28d vs previous; weekly intake | Weekly Search Revenue (Mon 08:52) | Shopify; `revenue-trend.csv` rules | Exists (add weekly intake) |
| Organic: GSC clicks, brand vs non-brand, organic orders | Weekly Search Revenue (Mon 08:52) + Google growth (Mon 11:17) | seo/gsc-latest | Exists (overlap — one should read the other's pull) |
| Google Ads: real ROAS, CPA, brand vs non-brand, non-brand drought days | Weekly Search Revenue (Mon 08:52) | Ads + `ads-order-reconciliation.csv` method | Add (3 credits/week for search terms) |
| Product top lists and class H blockers | Weekly Search Revenue | Shopify landings | Add |
| Approval queue: P0/P1 open, new decisions | CEO sprint (Mon + Thu 10:23) | `owner-approval-queue.csv`, HQ cmd/ceo | Exists (queue runner) |
| Reviews, abandoned checkouts, trade pipeline | CEO sprint (Mon) | Judge.me count, HQ leads | Partly (pipeline fields not yet approved, G4) |
| Credits: OpenRush week and month, Zapier tasks | Weekly Google growth (Mon 11:17) | HQ usage/openrush-2026-11, usage/zapier-2026-11 | Exists |

## 4. Monthly report — PROPOSAL (needs owner approval; not created)

- **When:** the first Monday of each month, as an extra section of the existing Mon 08:52 Weekly Search Revenue task (no new scheduled task). First run would be Mon 7 Dec 2026.
- **Contents:** month net revenue and paid orders vs previous month; AOV; real ROAS and CPA (brand vs non-brand); organic clicks and orders; AI test (Stage 6 questions, manual owner script for ChatGPT/Perplexity); reviews gained; trade quotes and revenue; delivery capacity vs orders received (when the owner supplies capacity); Search Console Manual actions + spam-link count (agreed 19 Nov, currently in no task); OpenRush month (renews 19 Dec; reserve 400) and Zapier month; scaling-decision review against `scaling-decisions.csv`.
- **Owner decision:** YES / NO (approval queue AQ53).

## 5. Gaps (no existing task produces these)

| ID | Gap | Why | Fix (proposal) |
|---|---|---|---|
| G1 | Delivered dates and open-order age | Only #1038 has a real delivered date | Owner marks delivered on the day; daily report then lists orders open > 10 days |
| G2 | Weekly workshop / delivery capacity | UNKNOWN | Owner answers AQ14 once; weekly report shows intake vs capacity |
| G3 | Abandoned-checkout automation status | No API field | Owner screenshot monthly |
| G4 | Trade pipeline stages | No fields on HQ leads | AQ44 (fields on existing docs, no new CRM) |
| G5 | HQ `cmd/*` command-centre docs | Written once by Stage 8; no task refreshes them | Daily report 23:59 refreshes cmd/revenue KPIs; weekly report refreshes cmd/ads, cmd/organic (proposal) |
| G6 | Monthly spam-link / Manual-actions check | Agreed 19 Nov, not scheduled | Monthly section above |
| G7 | Profitability banner and UNKNOWN-not-0 rule in report templates | Consistency | Add fixed text to the 23:59 and 08:52 prompts |
| G8 | Shopify Inbox and WhatsApp enquiries | Not readable | AQ37 routing |
| G9 | Ads balance due | Email only | Owner check after each decline |

## 6. Scheduled-task waste (recommendation only — nothing changed)

1. **Cinema task (trig_016okuWup1wybjbpScFyxw4B)** fires 14 times a week while autoCinema is false and video is paused (Gemini HTTP 402). Recommend disabling it until video credit returns (AQ32).
2. **Trading HQ watchdog** (not Eagle Bed) makes **168 of 280** weekly wake-ups (60 percent). Recommend moving it to its own project or slowing it (AQ32).
3. **Social posts task** runs 21 times a week on Opus with 7 connectors, including Supermetrics (trial expired 8 Sep). Recommend the default model and only the connectors it uses (AQ54).
4. **Overlaps:** CEO sprint and daily autopilot both run the HQ queue; Weekly Search Revenue and Weekly Google growth both pull GSC on Monday. Recommend one reads the other's output.
5. The disabled old social task can be deleted (housekeeping).

Eagle Bed's own wake-ups: 112 a week. After items 1–2: 98 Eagle Bed wake-ups and no Trading HQ wake-ups in this account (ESTIMATE).
