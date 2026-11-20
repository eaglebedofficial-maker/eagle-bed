# Stage 8 · Report 04: continuity, data quality, agents and resources

Specialists: Decision Council, Verification/QA, Data Quality, Weekly Issue Scout. Parts 1, 12, 14 and 15.
Extracted 20 Nov 2026, 01:00–01:15 Europe/London (GMT). Read-only: nothing on any live system was changed. Writes: four files in this folder and HQ `cmd/quality`, `cmd/agents`, `cmd/resources`, `cmd/continuity` (version 1 each).

Files:
- `continuity-register.csv`: 142 rows
- `data-quality-register.csv`: 34 Stage 8 checks plus the 19 HQ `dq/latest` checks, merged
- `agent-performance.csv`: 65 agents, the Manager and 13 scheduled tasks
- `resource-usage.csv`: 30 rows

PROFITABILITY NOT VERIFIED — COST DATA PARKED.

## 1. Summary

1. **Of 142 recommendations from Stages 1–7, 16 are VERIFIED COMPLETE.** 64 are waiting for an owner YES/NO. 29 are blocked because owner facts are missing. 15 are prepared but not implemented. 12 are implemented but not yet measured. 4 are UNKNOWN. 2 were superseded. The website work is done and live. Almost everything else needs an owner decision.
2. **Revenue reconciles to the penny.**
   - Shopify, all-time (13 Jul–20 Nov), read today: 38 paid valid orders, £15,393.59, AOV £405.09. VERIFIED. This matches Stage 7 exactly.
   - This total includes VAT, shipping and discounts. It excludes cancelled orders #1010, #1014 and #1020, and refunded orders #1001 and #1006.
   - No order on 19 Nov or so far on 20 Nov. The last order is #1043 (18 Nov).
3. **#1020 is still PAID with £0 refunded.** It was cancelled on 23 Sep and paid by PayPal. Customer may be owed £273.59. VERIFIED with Shopify at 01:00 today.
4. **Google Ads conversions reconcile only once #1014 is included.**
   - Ads reports 15 conversions worth £5,712.92.
   - Shopify has 14 paid orders worth £5,402.42, plus cancelled #1014 at £310.50, which makes the same £5,712.92.
   - Source: `ads-order-reconciliation.csv` (Stage 8). MATCHED.
5. **Delivery data is not real.**
   - All 13 recent orders (#1031–#1043) were marked fulfilled within 0–6 hours of the order, and none has a delivered date.
   - Older "delivered" stamps were added in bulk on 25 Sep (15 orders), 3 Nov (10) and 19 Oct (3).
   - #1010 and #1014 were cancelled with payment EXPIRED but are marked delivered.
6. **Live claims are still wrong where owner facts are missing.**
   - "Clearpay" appears on 9 of 13 checked pages, but no order has ever been paid with Clearpay.
   - The Gas Lift Divan Base page says "end-opening" 23 times and "side opening" 8 times.
   - The refund policy still says "two-man courier team".
   - "Memory Orthopaedic Mattress" is still a product title.
   - Royal Chesterfield Super King (£389.99) is cheaper than the King (£399.99).
   - `/pages/trade` returns 404.
7. **Trade email outreach produced volume, not value.**
   - 314 emails were sent, and the HQ leads and day docs agree on that number. Result: 1 interested reply, 0 quotes, £0.
   - 251 emails implied free assembly. 312 promised a same-day quote. None carried the privacy line. 9 went to hotels or aparthotels on 19 Nov.
   - The brief was fixed on 19–20 Nov. **HQ `outreach/plan` still steps up to 140 a day on 25 Nov.**
8. **Scheduled tasks wake 280 times a week.** 168 of those are the Trading HQ watchdog, which is not Eagle Bed. 14 are the cinema task, still firing while video is paused because Gemini has no credit (HTTP 402). The social task runs on Opus with 7 connectors, including the Supermetrics connector whose trial expired on 8 Sep.
9. **OpenRush:** 221 used of 2,001, 1,780 left. The 400 reserve is untouched. The log sums exactly to 221. This task used 0 credits.

## 2. Continuity register (part 1)

Method: each P0–P3 queue and approval list from Stages 1–7 (Stage 1 Q1–Q30, Stage 2 §12–13, Stage 3 §11/§14, Stage 4 §22 and `owner-decisions.csv`, Stage 5 §19 and its task queue, Stage 6 §24–25 and §29, Stage 7 §21) was merged into one register. Duplicates were folded into one row; for example, Clearpay appears in 5 stages but has one row. Each row was checked cheaply against:
- the CHANGELOG;
- live curl of 25 URLs;
- `products.json`;
- Shopify GraphQL orders;
- HQ docs (`leads`, `outreach`, `dq`, `usage`, `runs`, `cmd/ads`);
- the scheduled-task list.

| Status | Rows |
|---|---|
| VERIFIED COMPLETE | 16 |
| IMPLEMENTED BUT NOT MEASURED | 12 |
| PREPARED, NOT IMPLEMENTED | 15 |
| AWAITING OWNER APPROVAL | 64 |
| BLOCKED BY MISSING INFORMATION | 29 |
| UNKNOWN | 4 |
| CANCELLED OR SUPERSEDED | 2 |

**Verified complete (live check):**
- CRO theme 213270004043 is live. Page source shows role main.
- Terms and Contact name ABBAS TRADE LTD 16410472. "Eagle bed ltd" appears 0 times.
- Assembly is shown as £69.99 on product and info pages, with 0 "free assembly" on the 12 pages checked.
- The 10–19 Nov pages and collections claimed as published all return 200, with FAQPage markup and the fluted-bed VideoObject.
- The DQ monitor runs daily (`dq/latest` at 00:01).
- Owner answers on links and the GBP address are closed.
- HQ now flags 17 leads doNotContact: 14 bounced and 3 STOPs.

**Most important open items:**
- **C006: trade ramp to 140 a day on 25 Nov.** Stage 1 advised holding at 80 until the legal gate exists. The owner has not decided.
- **C014: #1020 refund.**
- **C002/C003: Clearpay.**
  - Waiting on the owner's ON/OFF answer.
  - `ops/BRIEF.md` line 13 still lists Clearpay.
  - The daily-autopilot prompt, step 6b, still has the caption "Pay with Klarna, Clearpay or cash on delivery". This prompt has not been changed since 4 Nov and could bring the claim back.
- **C064: Gas Lift Divan Base opening direction.** The opening question also blocks the reply to customer E023.
- **C016: real delivered dates.**
- **C108: Google Ads card.** Last decline 19 Nov 22:36. PMax was still serving at 01:00, but is at risk.
- **C111: monthly spam-link / Manual-actions check.** Agreed on 19 Nov, but no scheduled task contains it.
- **C017: privacy line.** It is in the brief, but 0 of 314 sent emails carry it. The first run that should include it is 20 Nov at 09:53.

## 3. Data quality and reconciliation (part 12)

The full register has 34 checks. Each shows both values, the sources, the impact and who should fix it. The 19 HQ `dq/latest` checks are merged below them; that monitor scored 67 at 00:01 today, down from 71. Results: 18 FAIL, 5 WARN, 6 PASS, 5 UNKNOWN.

| Check | Value A | Value B | Status |
|---|---|---|---|
| Shopify orders vs revenue | 38 / £15,393.59 (GraphQL today) | 38 / £15,393.59 (Stage 7) | PASS, VERIFIED |
| #1020 paid vs cancelled | PAID, £0 refunded | Cancelled 23 Sep | FAIL, CRITICAL |
| #1010 / #1014 | Cancelled, EXPIRED | Fulfilled and delivered 19 Oct | FAIL |
| Ads conversions vs orders | 15 / £5,712.92 | 14 paid £5,402.42 + #1014 £310.50 | WARN, MATCHED |
| GA4 purchases vs Shopify | UNKNOWN (GA4 currency is USD) | 38 orders | UNKNOWN |
| GSC clicks vs GA4 organic | 165 clicks (28 days) | GA4 125 sessions; Shopify 70 human sessions | WARN (different units, explained) |
| Merchant Center vs Shopify | UNKNOWN (no export) | 145 live products | UNKNOWN |
| Recovery attribution | Automation status UNKNOWN; 0 recovered orders | 3 real abandoners in 73 days (~45/month withdrawn) | UNKNOWN |
| Trade quotes vs won | 314 sent, 1 interested, 0 quotes | 0 orders, £0 | FAIL (no pipeline fields on 332 leads) |
| Delivered vs fulfilled | Fulfilled within hours, 0 delivered dates on #1031–#1043 | Bulk delivered stamps on older orders | FAIL |
| "Sent N emails" claims vs HQ | 314 by `emailedAt` | 314 in day docs | PASS. Superseded: 292, "292+61", and CHANGELOG "63" (morning only; +9 top-up = 72) |
| Bounces | Gmail: 15 | HQ: 14; Brighton agency still "contacted" | FAIL (minor) |
| "Published" claims vs live | CHANGELOG 10–19 Nov | All 200, content present | PASS |
| Trade email content vs facts | 251 implied free assembly; 312 promised same-day quote | Owner rule: £69.99, never free | FAIL (fixed for future sends) |
| Clearpay claim vs payments | 9 of 13 pages | 0 Clearpay payments | FAIL |
| Bot share 19 Nov | 83.5% | 25.5% on 18 Nov | FAIL (use human-only figures) |
| Social UTM recorded | 09:00 and 13:00 posts have no UTM | 2 tagged sessions arrived | FAIL |
| Stale integrations | Supermetrics expired 8 Sep; Gemini 402 | Both still loaded or scheduled | FAIL |
| Zapier meter | 156 counted from 10 Nov | 1–9 Nov not counted; cap hit on 7 Nov | WARN |
| Scheduled-task `last_run` | All SUCCEEDED | `last_run` means the wake was delivered, not that the task worked | WARN |
| Phone number | Correct number on 13 of 13 pages | Wrong number on 0 pages | PASS (one human reply had the wrong number) |
| Consent validity | 38 subscribed | Box possibly pre-ticked before 19 Nov | UNKNOWN |
| Costs / VAT | 0 of 831 costs; £0 tax recorded | PARKED by owner | FAIL (not re-asked) |
| Duplicate HQ work | Checkout-leak run ×4; AI-plan run ×3 | – | FAIL (low) |

## 4. Agent performance (part 14)

Basis:
- the Stage 1 matrix (`05-trade-agency.md`, HQ runs and worklog, 490 task records);
- the agent sections of Stages 2–7;
- HQ today: 40 runs, `leads`, `outreach`, `usage`;
- `list_triggers`.

Volume was not rewarded.

| Class | Agents |
|---|---|
| Generates opportunities | On-Page SEO, Product Pages, AI Search; Email Marketing (with unsupported claims, now corrected) |
| Saves time | Customer Care via the Inbox task (median first reply fell from 407 h to 1.5 h); Weekly Issue Scout (1 run, 16 Nov) |
| Improves accuracy | Analytics, Verification/QA, Google Ads, Checkout Doctor, Link Scanner, Customer Finder, Decision Council (low volume) and 10 more |
| Repeatedly fails (blocked by data) | Sales Closer, Profit & Cash, Workshop Planner, Delivery & Returns, Seasons, Off-Page & PR and 4 more |
| Duplicates | 20 agents from Stage 1 group 4, plus Lead Finder (coordination gap) |
| Excessive resources | Cinematic Director / Higgsfield / Video Studio / CGI, Social Media task, Marketplaces, Materials, Quality, Brand Voice |

**Quality-check notes:**
- The wrong WhatsApp number (07417 449197) was a human reply, not an agent's.
- Internal notes reached a customer because the owner sent an agent draft unedited. The prompt was fixed on 15 Nov.
- Earlier "free assembly" claims were made by the trade email agent (251 emails) and in social captions. Both were fixed on 19 Nov.
- Clearpay was claimed by older prompts. It is still in BRIEF.md and in the autopilot caption template.
- The "~45 abandoned checkouts a month" figure from Stage 1 was an overestimate. Stage 7 corrected it to about 1.2 real ones a month.
- Stage 7 Decision Council used send totals that did not match HQ (292 + 61 against 314).
- No agent made an unapproved live change.

**Scheduled tasks (runs per week):**

| Task | Runs/week |
|---|---|
| Trading HQ watchdog (not Eagle Bed) | 168 |
| Inbox | 49 |
| Social posts | 21 |
| Cinema (paused but still firing) | 14 |
| Daily autopilot | 7 |
| Daily report | 7 |
| Email Marketing | 5 |
| Email Marketing top-up | 5 |
| CEO sprint | 2 |
| Weekly Search Revenue | 1 |
| Weekly Google growth (first run 23 Nov) | 1 |
| Old social task | disabled |
| **Total** | **280** (Eagle Bed: 112) |

## 5. Resources (part 15)

**OpenRush** (HQ `usage/openrush-2026-11`; VERIFIED except Stage 7):

| Item | Credits |
|---|---|
| Allocation | 2,001 |
| Used | 221 |
| Remaining | 1,780 |
| Reserve (untouched) | 400 |
| Spendable outside the reserve | 1,380 |

| By stage | Credits |
|---|---|
| Before Rocket, 19 Nov | 31 |
| Stage 1 | 27 |
| Stage 2 | 18 |
| Stage 3 | 4 |
| Stage 4 | 12 |
| Stage 5 | 24 |
| Stage 6 | 97 |
| Stage 7 | 8 (ESTIMATE) |
| Stage 8, this task | 0 |

- Repeated research: about 6 Ads credits and about 15 GSC credits were pulled twice for the same windows on 19 Nov. This breaks the "no re-run within 7 days" rule. ESTIMATE.
- Credits spent on failed tasks: 0.
- The planned weekly Google growth task can use up to 40 credits a week from 23 Nov.

**Zapier:**
- 156 of 750 tasks counted since 10 Nov: posts 108, video 21, Pinterest 18, GBP 9.
- About 13 tasks a day, which is about 390 a month at this rate (ESTIMATE).
- 1–9 Nov was not counted, and the reset date is UNKNOWN.

**Claude:** 280 wake-ups a week, as listed in section 4.

## Recommendations (owner decisions, nothing applied)

1. Decide on the 25 Nov step-up to 140 emails a day. Recommendation: hold at 80 until the first compliant send has been checked.
2. Answer five facts:
   - Clearpay on or off
   - #1020 in PayPal
   - Gas Lift opening direction
   - the visiting rule
   - the Christmas cut-off
3. Mark delivered dates for #1031–#1043, and from now on fulfil on dispatch day.
4. Disable the cinema schedule while video is paused. Move the Trading HQ watchdog. Remove Supermetrics from the social task.
5. Approve aligning BRIEF.md and the autopilot caption template with the current Clearpay rule, and adding the monthly spam-link check to a Monday task.

## Limitations

- Gmail, Shopify Inbox and WhatsApp were not re-read. Customer replies E002/E010/E011/E021/E022 and #1040 are UNKNOWN today.
- GA4 and Merchant Center are UNKNOWN.
- The scheduled-task `last_run` only proves the wake was delivered.
- Agent task counts come from the Stage 1 matrix (19 Nov). HQ runs since then were scanned only for duplicates.
- Live checks covered 25 URLs, not all 224.
- The bare-domain redirect test from this sandbox gave no response, so it is inconclusive.

## Credits used

OpenRush: 0. Free reads:
- HQ ArtifactData: 9 reads (`usage` ×2, `dq`, `leads` 332, `outreach` 8, `runs` 40, `cmd` 7)
- 1 HQ batch write (4 `cmd` docs)
- Shopify GraphQL: 1 query
- `list_triggers`: 2 pages
- curl: about 30 live requests

Month total stays at 221 of 2,001.
