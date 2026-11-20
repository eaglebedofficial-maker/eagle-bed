# EAGLE BED — PROJECT ROCKET SALES / STAGE 8 (FINAL): REVENUE COMMAND CENTRE & CONTROLLED SCALING

Manager's report over the four Stage 8 specialist reports and 15 data files, plus the Stage 5–7 owner queues. Prepared Fri 20 Nov 2026 (Europe/London, GMT). Data extracted 20 Nov 01:00–01:30. **Read-only:** nothing live was changed, nobody was contacted, nothing was committed. Order numbers and anonymised IDs only (E0xx, C0xx); trade businesses by business name.

> **PROFITABILITY NOT VERIFIED — COST DATA PARKED.** Every £ figure here is revenue, not profit. ROAS means revenue ÷ ad spend.

**Labels:** [VERIFIED] read from the source on 20 Nov · [MATCHED] Ads conversion tied to a Shopify order by date and exact value · [PLATFORM-REPORTED] the platform says so, Shopify cannot confirm · [ESTIMATE] a calculation on a stated rule · [HYPOTHESIS] still to test · [UNKNOWN] not available (never 0) · [HISTORICAL] earlier stage.

**Files (ops/rocket/stage8/):** `growth-opportunities.csv` (30), `business-risk-register.csv` (20), `owner-approval-queue.csv` (75 rows), `scaling-decisions.csv` (29 rows), `dashboard-test-results.csv` (12 tests, 12 PASS), `reporting-cadence.md`, `cmd-ceo.json` (HQ `cmd/ceo`), plus the specialists' reports 01–04 and their 15 CSVs.

---

## 1. Executive summary

1. **Sales are up, on less traffic.** Last 30 days (21 Oct–19 Nov): **£6,857.57 net from 16 paid orders**, against £2,826.41 from 7 in the previous 30 days (**+142.6%**) [VERIFIED]. UK human sessions fell from 2,045 to 1,356 [PLATFORM-REPORTED]; order conversion rose from 0.34% to 1.18% [VERIFIED]. The growth came from conversion and basket value, not visitors.
2. **The money reconciles to the penny.** All-time paid net **£15,241.97** from 38 orders [VERIFIED]. Shopify Analytics shows £15,515.56 because it still counts cancelled #1020 (£273.59), whose PayPal refund failed [VERIFIED]. Google Ads' 15 conversions (£5,712.92) = 14 real paid orders (£5,402.42) + cancelled #1014 (£310.50) [MATCHED].
3. **Google Ads is at risk tonight.** The card was declined at 22:36 on 19 Nov (insufficient funds). PMax was still serving at 01:00 [VERIFIED]. PMax runs at £25/day: 30-day real ROAS **3.78**, CPA **£102.05**; 90-day ROAS **2.32**, CPA **£165.98** [VERIFIED / MATCHED]. But there has been **no non-brand Ads order since 3 Nov: 18 days of clicks, £441.97 spent** [MATCHED].
4. **Customers and promises are waiting.** #1040 needs its Saturday time slot **this evening**; #1043 has a £50 assembly quote against the £69.99 list price; E010, E011, E021, E022, E023 and the trade lead Ivywell Interiors are waiting on us [VERIFIED].
5. **We cannot scale yet.** Profit is not verified (costs parked), weekly workshop and delivery capacity are UNKNOWN, only #1038 has a real delivered date, and non-brand ads have gone dry. **No budget increase. No channel is cleared for more spend.**
6. **Open work is mostly owner decisions.** Of 142 recommendations from Stages 1–7, 16 are verified complete, 64 await an owner YES/NO and 29 are blocked by missing owner facts [VERIFIED]. The consolidated queue has **13 P0 items for today**.
7. **Live site still carries unsupported claims:** Clearpay on 9 of 13 checked pages, "end-opening" on the Gas Lift Divan Base page, a "two-man courier" line in the refund policy; /pages/trade is still 404 [VERIFIED].

## 2. What was checked

- **Revenue, orders, products, delivery** (specialist 01): Shopify GraphQL + ShopifyQL, 145 published products, 22 orders since 1 Oct, Gmail delivery promises.
- **Google Ads, organic, AI search** (specialist 02): live campaigns, 7/30/90-day performance, order-by-order reconciliation, Search Console (data ends 17 Nov), 3 technical re-checks, 4 AI questions re-run.
- **Customers, recovery, reviews, trade** (specialist 03): customers, abandoned checkouts, 23 enquiries, 3 reviews, 332 trade leads.
- **Continuity, data quality, agents, resources** (specialist 04): 142 past recommendations re-checked, 34 data-quality checks, 66 agents (65 + Manager) and 13 scheduled tasks, OpenRush / Zapier / scheduled-task usage.
- **Manager:** Stage 5 `owner-decisions.csv` and `owner-decision-request.md`, Stage 6 and 7 `owner-approval-queue.csv`, Stage 7 `owner-trade-questions.md`, the Stage 5–7 reports and the CHANGELOG, merged into one queue.
- **Manager actions today (internal only):** BRIEF Clearpay line corrected; the autopilot session was asked to remove Clearpay from its video caption; it declined until the owner confirms (it says the owner told it Clearpay is a payment method) and noted that caption step has been dormant since 9 Nov, so nothing with it is being posted. The Clearpay ON/OFF decision is in the owner queue.

## 3. CEO overview (KPIs)

| KPI | Value | Window | Confidence |
|---|---|---|---|
| Net sales | £6,857.57 | Last 30d (21 Oct–19 Nov) | VERIFIED |
| Net sales, previous 30d | £2,826.41 | 21 Sep–20 Oct | VERIFIED |
| Change in net | +142.6% | 30d vs previous 30d | VERIFIED |
| Paid orders | 16 | Last 30d | VERIFIED |
| AOV (net) | £428.60 | Last 30d | VERIFIED |
| Order conversion (orders ÷ UK human sessions) | 1.18% (was 0.34%) | Last 30d | VERIFIED / PLATFORM-REPORTED |
| UK human sessions | 1,356 (was 2,045) | Last 30d | PLATFORM-REPORTED |
| Net sales | £13,289.78 | Last 90d (22 Aug–19 Nov) | VERIFIED |
| Net sales, all-time | £15,241.97 (38 paid orders) | 13 Jul–20 Nov | VERIFIED |
| Google Ads spend | £785.78 | Last 30d | VERIFIED |
| Real ROAS / CPA | 3.78 / £102.05 | Last 30d | MATCHED |
| Real ROAS / CPA | 2.32 / £165.98 | Last 90d (23 Aug–20 Nov) | MATCHED |
| Non-brand Ads drought | 18 days, £441.97 | Clicks 3–20 Nov | MATCHED |
| Organic orders | 0 | Last 30d | VERIFIED |
| GSC clicks | 165 | 28d to 19 Nov (data to 17 Nov) | VERIFIED |
| AI answers naming Eagle Bed | 0 of 4 | 20 Nov | VERIFIED (tool, date) |
| Customers waiting on us | 7 | 20 Nov 01:05 | VERIFIED |
| Trade revenue | £0.00 | 10–20 Nov | VERIFIED |
| Genuine reviews | 3 (all 5★) | All-time | VERIFIED |
| Real delivered dates | 1 of 22 orders since 1 Oct | 1 Oct–20 Nov | VERIFIED |
| Weekly workshop / delivery capacity | UNKNOWN | – | UNKNOWN |
| Profit / contribution | UNKNOWN (costs parked) | – | UNKNOWN |
| OpenRush credits used | 236 of 2,001 (reserve 400 untouched) | November | VERIFIED (ledger) |

## 4. Revenue

Rules: order date (Europe/London); paid figures exclude cancelled #1010, #1014, #1020 and refunded #1001, #1006. Gross = subtotal + discounts; net = gross − discounts − returns; total = net + shipping + tax. Never mixed.

| Window | Dates | Gross | Discounts | Net | Total | Paid orders | AOV | Previous net | Change | Confidence |
|---|---|---|---|---|---|---|---|---|---|---|
| Yesterday | 19 Nov | £0 | £0 | £0 | £0 | 0 | n/a | £539.97 | n/a | VERIFIED |
| Last 7d | 13–19 Nov | £2,360.89 | £182.07 | £2,178.82 | £2,178.82 | 4 | £544.71 | £2,707.12 | −19.5% | VERIFIED |
| Last 30d | 21 Oct–19 Nov | £7,472.64 | £615.07 | £6,857.57 | £6,947.57 | 16 | £428.60 | £2,826.41 | +142.6% | VERIFIED |
| Previous 30d | 21 Sep–20 Oct | £2,953.88 | £127.47 | £2,826.41 | £2,826.41 | 7 | £403.77 | £3,605.80 | −21.6% | VERIFIED |
| Last 90d | 22 Aug–19 Nov | £14,203.37 | £913.59 | £13,289.78 | £13,379.78 | 33 | £402.72 | £1,952.19 | +580.8% | VERIFIED |
| YTD / all-time | 13 Jul–20 Nov | £16,243.34 | £1,001.37 | £15,241.97 | £15,393.59 | 38 | £401.10 | n/a | n/a | VERIFIED |

- **Excluded money (shown separately):** cancelled £859.49 (#1010 £275.40, #1014 £310.50, #1020 £273.59); refunded £514.80 (#1001, #1006) [VERIFIED].
- **Ex-VAT (÷ 1.2):** last 30d £5,714.64; last 90d £11,074.82 [ESTIMATE — Shopify records £0 tax on every order except #1003; VAT items parked].
- **Months (net / orders):** Jul £776 / 2; Aug £2,825 / 8; Sep £2,284 / 6; Oct £3,365 / 9; Nov to the 19th £5,991 / 13 [VERIFIED].
- **Highest weeks:** w/c 2 Nov £2,811.30 (6 orders); w/c 9 Nov £2,315.64 (5) [VERIFIED].
- **Seasonality:** cannot be measured (first order 13 Jul, no previous year) [UNKNOWN].
- Full detail: `ceo-revenue-baseline.csv` (240 rows), `revenue-trend.csv`.

## 5. Orders

- **Paid orders:** 38 all-time; 16 in the last 30d; 4 in the last 7d; **0 on 19 Nov and 0 so far on 20 Nov**. Last order **#1043 (18 Nov)** [VERIFIED].
- **Zero-order days are normal here:** 99 of 131 days had no paid order; longest gap 11 days [VERIFIED]. 19 Nov was the first full day on the new theme — too early to judge (review 3 Dec).
- **Weekly intake (orders received):** w/c 28 Sep 1 · 5 Oct 4 · 12 Oct 1 · 19 Oct 1 · 26 Oct 3 · 2 Nov **6** · 9 Nov 5 · 16 Nov 1 (partial) [VERIFIED].
- **Cancellations / refunds:** 3 cancelled (all Aug–Sep) and 2 refunded (Jul–Aug); none since 23 Sep [VERIFIED].
- **New vs returning:** 15 new / 1 returning in the last 30d; 2 returning buyers all-time (#1005, #1033) [VERIFIED].
- **"Fulfilled" means accepted, not dispatched:** all 38 are Fulfilled, a median of about 3 hours after the order [VERIFIED].

## 6. Products

- **Catalogue:** 145 published products; 257 in admin (187 active, 70 draft) [VERIFIED].
- **Classes (90d):** A 1 · B 11 · C 2 · D 4 · E 34 · F 60 · G 7 · **H 26 (blocked or flagged by a configuration or information issue)** [VERIFIED].
- **Top revenue (90d net):** Ottoman Gas Lift Divan Base £2,666.63, 7 orders [H] · Side Lift Ottoman Storage Base £1,603.38, 6 [A] · Cloud Teddy Bouclé Ottoman £977.39, 2 [H] · Savoy Channel £823.48 · Royal Chesterfield £629.96 [H] [VERIFIED]. 20 products sold in 90 days.
- **Only large-sample converter:** Side Lift, 2.25% on 267 landings [VERIFIED].
- **Carts that do not become orders (90d, landings / cart sessions / orders):** Line Bumper 432 / 28 / **0** [H] · Line Ambassador 370 / 26 / 1 [H] · Gas Lift Divan Base 593 / 27 / 7 [H] · Grand Extra-Tall 118 / 18 / 1 [H] · Cloud Teddy 109 / 14 / 2 [H] [VERIFIED]. Price truth on the H products remains the largest product lever (mechanism VERIFIED; cause HYPOTHESIS).
- **Paid-attributed:** only 10 products have paid-order evidence; per-product Ads spend is UNKNOWN [MATCHED / UNKNOWN].
- **No profit ranking:** 0 of 763 variants costed [VERIFIED].
- Full detail: `product-performance.csv`, HQ `cmd/products`.

## 7. Google Ads

| Window | Dates | Spend | Real paid orders | Real value | Real ROAS (ex-VAT) | Real CPA | Confidence |
|---|---|---|---|---|---|---|---|
| Last 7 | 13–19 Nov | £183.34 | 2 (#1040, #1042 — both brand) | £1,134.87 | 6.19 (5.16) | £91.67 | VERIFIED / MATCHED |
| Previous 7 | 6–12 Nov | £200.42 | 0 | £0 | none | – | VERIFIED |
| Last 30 | 21 Oct–19 Nov | £785.78 | 7.70 | £2,966.63 | 3.78 (3.15) | £102.05 | VERIFIED / MATCHED |
| Previous 30 | 21 Sep–20 Oct | £750.72 | 2.29 | £901.82 | 1.20 (1.00) | £327.83 | VERIFIED / MATCHED |
| Last 90 | 23 Aug–20 Nov | £2,323.67 | 14 (+#1014 cancelled) | £5,402.42 | 2.32 (1.94) | £165.98 | VERIFIED / MATCHED |

- **Live:** PMax "All Products" ENABLED at **£25.00/day**, limited by budget (this is not a recommendation to raise it); Search UK (£5) and Shopping UK (£15) PAUSED; one PMax removed. Total inside the £30/day cap [VERIFIED].
- **Card:** £500 payment received 19 Nov 22:33, then **declined 22:36** (Visa ••0882, insufficient funds). No later success, stop or suspension email to 01:02 [VERIFIED]. Balance due UNKNOWN.
- **By campaign (90d):** PMax real ROAS 3.23 (CPA £122.94); Shopping 0.70; Search 1.69 (both orders brand) [MATCHED].
- **Brand vs non-brand (90d):** brand 5 orders, ROAS 17.8 on ~£115.84 visible spend; **non-brand 9 orders, ROAS ≈1.52 (1.27 ex-VAT)** [ESTIMATE — search terms cover 28% of spend].
- **Reconciliation:** 9 directly matched, 4 assisted, 1 platform-reported only, 1 cancelled (#1014), **0 unmatched** [MATCHED]. Enhanced Conversions, Merchant Center diagnostics, location and product spend are UNKNOWN.
- **Decisions:** PMax **HOLD + fix tracking**; Shopping and Search **keep paused**; feed **fix first**. No campaign is a scale candidate.

## 8. Organic SEO

- **Search Console (28d to 19 Nov, data to 17 Nov):** 165 clicks (was 134), 15,070 impressions (was 9,777), position 26.5 (was 20.8) [VERIFIED]. **Brand clicks fell from 42 to 17** [VERIFIED]; non-brand ≈148 [ESTIMATE]. Nothing new since Stage 6 (Google lag).
- **Organic orders:** **0 in the last 7 and 30 days; 1 in 90 days** (#1024, £337.99, probable free listing) [VERIFIED / ESTIMATE]. #1036 (£629.96) came from chatgpt.com, an AI referral [VERIFIED].
- **Near-wins (0 clicks):** "cloud bed small double" position 7.9; "gas lift ottoman bed" 18.0; "gas lift bed" 25.3 [VERIFIED].
- **Technical:** T05, T06 and T03 re-checked — all still open; 23 of 23 Stage 6 technical items open; no metadata draft live (expected) [VERIFIED].
- **Indexing and field Core Web Vitals:** UNKNOWN until owner exports.

## 9. AI search

- **Re-run today (WebSearch tool, not a UK SERP):** Eagle Bed **named 0 of 4, cited 0 of 4** (Stage 6: 0 of 12) [VERIFIED for this tool and date].
- One answer named an eBay seller in Dewsbury selling a velvet Chesterfield wingback bed; whether that is Eagle Bed is UNKNOWN.
- Google AI Overview sample (19 Nov): eaglebed.co.uk cited 5 times in the sampled corpus [HISTORICAL, directional]. ChatGPT, Perplexity, Copilot and AI Mode: UNKNOWN.
- **What answers reward:** published numbers (strut rating, storage depth, guarantee years, delivery exceptions) and third-party mentions. **Inclusion cannot be promised.**

## 10. Customers

- **Records / with an order / paying buyers:** 73 / 41 / 36; new 34, returning 2 (5.6%); repeat orders 2 of 38 [VERIFIED].
- **Enquiries:** 23 genuine since 1 Oct; **median first reply since 12 Nov: 1.5 hours** (was 407 h before 12 Nov) [VERIFIED].
- **Waiting on us (7):** E010 (no reply since 7 Nov), E008 (stale since 29 Oct), E011 (quote overdue; delivery wanted 27–30 Nov), E019 (#1040 slot tonight), E021 (South West delivery), E022 (storage depth due today), E023 (ready to buy; side opening?) [VERIFIED]. E020 = the #1043 assembly decision.
- **Open aftercare cases:** 7 (AC01–AC06, AC08); complaints in Gmail: 0 [VERIFIED].
- **Consent:** 38 subscribed (12 never ordered), all single opt-in; the risk that the box was pre-ticked before 19 Nov is unresolved [HYPOTHESIS].
- **Controls for every reply:** 07417 439197 only; no internal notes; never invent measurements or dates; assembly is an optional £69.99 add-on (verified live 20 Nov); no Clearpay.

## 11. Recovery

- **Abandoned checkouts (8 Sep–20 Nov):** 21 = 12 bots/tests + 5 bought anyway (4 people) + 1 no contact + **3 real, not bought** [VERIFIED].
- **Eligible (real, subscribed):** **1** (≈0.4 a month) [VERIFIED count / ESTIMATE rate]. The old "~45 a month" figure is withdrawn.
- **Automation status: UNKNOWN** (no API field; editing on 19 Nov may have left it in Draft). Recovered orders 0 visible; recovery rate UNKNOWN.
- **Owner check today:** Marketing → Automations → "Recover abandoned checkout" → Set to active.

## 12. Trade sales

| Measure | Value | Confidence |
|---|---|---|
| Leads / emailed / never contacted | 332 / 314 / 18 | VERIFIED |
| Verified limited-company leads | 63 | VERIFIED (HQ text) |
| Emailed with unknown legal form | 253 (Stage 7 counted 251) | VERIFIED |
| Suppressed (doNotContact) | 17 (14 bounced + 3 STOP) | VERIFIED |
| Human replies | 4 (1 interested, 3 STOP) | VERIFIED |
| Quotes / won / trade revenue | 0 / 0 / £0.00 | VERIFIED |
| Follow-ups due | 1 — Ivywell Interiors (overdue; blocked on Q1–Q3) | VERIFIED |
| /pages/trade | 404 | VERIFIED |
| Outreach plan | steps up to 140/day on 25 Nov | VERIFIED |

- **Recommendation: hold at 80 a day** until the first compliant sends (with the privacy line) have been checked and the trade page exists. 0 of 314 past emails carried the privacy line; 251 carried an incorrect assembly claim; 312 promised a same-day quote (all fixed for future sends) [VERIFIED].

## 13. Delivery & capacity

- **22 orders since 1 Oct:** delivered with a real date **1** (#1038, 17 Nov, owner-confirmed — took 8 days against a 3–5 working-day promise); dispatched with tracking 1 (#1022, DPD); awaiting manufacture / ready **UNKNOWN**; unknown 20 [VERIFIED].
- **Estimate by age:** 12 orders (#1022–#1033) probably delivered; 9 (#1034–#1043 except #1038) probably still open [ESTIMATE].
- **Open promises:** #1040 slot due **this evening** for Sat 21 Nov (no customer email on the order); #1043 assembly £50 vs £69.99, no date given; #1038 delivered but not marked; E011 wants delivery 27–30 Nov [VERIFIED].
- **Service mix since 1 Oct:** Downstairs Drop Off 12; Room of Choice Assembly 5 (at the old £49.99); Room of Choice Drop Off 2; none recorded 3 [VERIFIED].
- **Weekly delivery capacity: UNKNOWN. Workshop capacity: UNKNOWN.** Owner questions: beds per week; delivery runs per week (days, areas); real order-to-delivery days.

## 14. Reviews

- **Genuine reviews:** 3 Judge.me, all 5★ (1 store, Side Lift 1, Cambridge 1); 0 replies [VERIFIED]. Google ≈0 [ESTIMATE]; no Trustpilot profile.
- **Next eligible (after confirmed delivery; one request + one reminder; no incentive):** #1038 from 22 Nov once marked delivered; #1034, #1035, #1036, #1039, #1041, #1042 after delivery is confirmed; #1040 from 26 Nov if delivered 21 Nov and an email is added; #1043 after the assembly decision; #1037 has no email. The 24 asked on 10 Nov are not asked again.
- **Expectation:** about 2–3 reviews a month [ESTIMATE].

## 15. Agents (65 + Manager) performance

| Class | Agents | Confidence |
|---|---|---|
| Duplicates | 21 (20 + Lead Finder coordination gap) | VERIFIED (Stage 1 matrix + HQ) |
| Improves accuracy | 18 (incl. 1 low volume) | VERIFIED |
| Repeatedly fails (blocked by missing data) | 10 | VERIFIED |
| Excessive resources | 10 | VERIFIED |
| Generates opportunities | 4 (incl. Email Marketing, claims corrected) | VERIFIED |
| Saves time | 2 + Manager (mixed: saves time / duplicates) | VERIFIED |

- **Saves time:** the Inbox task cut median first reply from 407 h to 1.5 h.
- **Quality notes:** the wrong WhatsApp number was a human reply; internal notes reached a customer via an unedited draft (prompt fixed 15 Nov); past incorrect assembly claims came from trade emails (251) and social captions (fixed 19 Nov); Clearpay remained in the autopilot caption template (change requested today). **No agent made an unapproved live change** [VERIFIED].
- Full matrix: `agent-performance.csv` (66 agent rows + 13 scheduled tasks).

## 16. Automations & scheduled tasks

| Task | Schedule (UK) | Runs/week | Status / note | Confidence |
|---|---|---|---|---|
| Inbox agent (trig_015kv1BJhoAyGXD4veTMkCTo) | every 2 h, 09:07–21:07 | 49 | Keep | VERIFIED |
| Social posts (trig_01KWcB82NnwV2BbFQhQ3iuhL) | 08:41 / 12:41 / 17:41 | 21 | Opus + 7 connectors incl. dead Supermetrics — trim | VERIFIED |
| Cinema videos (trig_016okuWup1wybjbpScFyxw4B) | 08:46 / 17:46 | 14 | **Fires while autoCinema is false** — disable | VERIFIED |
| Daily autopilot (trig_01JfLktS4EjKHgtArtoHASzv) | 07:47 | 7 | Caption template had Clearpay — change requested | VERIFIED |
| Daily report incl. DQ (trig_01RxMxSftZmA5XFKM8QHTH84) | 23:59 | 7 | Keep; feeds dq/latest | VERIFIED |
| Email Marketing (trig_01QJKSXdVhoLknhemD2qC5Jb) | weekdays 09:53 | 5 | Ramp decision before 25 Nov | VERIFIED |
| Email Marketing top-up (trig_01KjwYApBMKCQsMJCeXvbrr5) | weekdays 14:23 | 5 | Keep only if volume is kept | VERIFIED |
| CEO sprint (trig_01GL2DgPpqXmDynATB6eu3xJ) | Mon + Thu 10:23 | 2 | Overlaps autopilot as a queue runner | VERIFIED |
| Weekly Search Revenue (trig_01JT6xGfHqH2K1jH6V5SB8DX) | Mon 08:52 | 1 | Overlaps weekly Google growth | VERIFIED |
| Weekly Google growth (trig_01P1wKHd5L7Qc9og4T9TS18L) | Mon 11:17 | 1 | First run 23 Nov; ≤40 credits | VERIFIED |
| Trading HQ watchdog (**not Eagle Bed**) | hourly | 168 | 60 percent of all wake-ups — move or slow | VERIFIED |

- **Total 280 wake-ups a week; Eagle Bed 112** [VERIFIED]. `last_run` only proves the wake was delivered, not that the task worked.
- **Abandoned-checkout automation:** UNKNOWN (owner check). **Zapier:** see section 19.
- No new scheduled task is proposed. The monthly report (section 23) is a proposal folded into an existing task.

## 17. Data quality & reconciliation

| Check | Result | Status |
|---|---|---|
| Shopify paid orders vs revenue | 38 / £15,393.59 in both sources | PASS [VERIFIED] |
| Shopify net vs paid net | £15,515.56 − £273.59 (#1020) = £15,241.97 | Explained [VERIFIED] |
| #1020 paid but cancelled | PAID, £0 refunded | FAIL (critical) |
| #1010 / #1014 | cancelled but marked delivered | FAIL |
| Ads conversions vs orders | 15 / £5,712.92 = 14 paid + #1014 | WARN [MATCHED] |
| Delivered vs fulfilled | no real dates on #1031–#1043 except #1038 | FAIL |
| Clearpay claim vs payments | 9 of 13 pages vs 0 payments | FAIL |
| GA4 purchases | GA4 currency is USD | UNKNOWN |
| Merchant Center vs Shopify | no export | UNKNOWN |
| Consent validity | 38 subscribed, possible pre-tick | UNKNOWN |
| Phone number | correct on 13 of 13 pages | PASS |
| Costs / VAT | 0 costs; £0 tax recorded | FAIL (parked, not re-asked) |

- **Totals (34 Stage 8 checks, `data-quality-register.csv`):** **18 FAIL, 6 WARN, 6 PASS, 4 UNKNOWN** [VERIFIED count of the file]. The HQ `dq/latest` monitor (19 more checks, merged in the same file) scored 67 at 00:01 today, down from 71.

## 18. Metric dictionary

- `metric-dictionary.csv` holds **52 KPIs**, each with definition, calculation, source, window, last-updated time, data quality and confidence [VERIFIED].
- Groups: revenue (gross, discounts, returns, net, Shopify-reported net, shipping, tax, total); orders (paid, cancelled, refunded, fulfilled, delivered verified, AOV, new / returning); traffic and funnel (UK human sessions, cart, checkout, completed, two conversion definitions, product landings); Google Ads (spend, conversion value, real orders, real ROAS, paid product attribution); organic (GSC, sessions, landings, orders); recovery; enquiries; trade; delivery (open orders, days open, hours to fulfil, promises, capacity); reviews; credits; profitability.
- Confidence mix: 27 VERIFIED, 10 PLATFORM-REPORTED, 4 MATCHED, 3 ESTIMATE, 3 UNKNOWN, 5 mixed labels [VERIFIED count of the file].
- **Two conversion definitions are kept apart:** orders ÷ sessions (business view) and completed-checkout sessions ÷ sessions (Shopify view).

## 19. Resource usage

| Resource | Value | Confidence |
|---|---|---|
| OpenRush allocation (renews 19 Dec) | 2,001 credits | VERIFIED |
| OpenRush used this month | **236** (221 before Stage 8 + 15 Stage 8) | VERIFIED (ledger) |
| OpenRush remaining / protected reserve | 1,765 / **400 untouched** | VERIFIED (calculation) |
| Spendable outside the reserve | 1,365 | VERIFIED (calculation) |
| Planned: weekly Google growth task | ≤40 a week from 23 Nov | PLATFORM-REPORTED (task prompt) |
| Repeated research on 19 Nov | ≈6 Ads + ≈15 GSC credits pulled twice | ESTIMATE |
| Zapier | 156 of 750 counted since 10 Nov; ≈13 a day (≈390 a month); 1–9 Nov not counted; reset date UNKNOWN | PLATFORM-REPORTED / ESTIMATE |
| Scheduled tasks | 280 wake-ups a week (Eagle Bed 112; Trading HQ 168) | VERIFIED |
| Gemini (video) / Supermetrics | out of credit (HTTP 402) / trial expired 8 Sep | VERIFIED |

## 20. Top 30 opportunities

Ranked by money already in reach and by dependency. Impact is ESTIMATE or UNKNOWN — no £ forecasts. Full detail: `growth-opportunities.csv`.

| # | ID | Opportunity | Area | Decision | Expected impact | Confidence |
|---|---|---|---|---|---|---|
| 1 | OP01 | Keep Google Ads serving: fix the declined payment card | Google Ads | FIX FIRST | ESTIMATE: protects the 2–3 brand orders a fortnight that ads capture (02 §2.5); £ value UNKNOWN | VERIFIED / MATCHED |
| 2 | OP02 | Answer the waiting pre-sale customers (E010, E011, E021, E022, E023) | Customers | READY FOR OWNER APPROVAL | ESTIMATE: 0–5 orders (one per waiting buyer); £ value UNKNOWN | VERIFIED |
| 3 | OP03 | Keep the open delivery promises (#1040 slot tonight; #1043 assembly price) | Delivery | FIX FIRST | Protects 2 paid orders already taken; £ at risk UNKNOWN beyond #1040 £556.19 | VERIFIED |
| 4 | OP04 | First trade quote: reply to Ivywell Interiors (fabric metres, COM charge, where to send) | Trade | READY FOR OWNER APPROVAL | UNKNOWN (first trade quote; no trade order yet) | VERIFIED |
| 5 | OP05 | Price truth on the high-traffic flagged ottoman beds (Line Bumper, Line Ambassador, Cloud Teddy, Grand Extra-Tall) | Products / CRO | FIX FIRST | UNKNOWN (largest product lever per 01 §4; no forecast) | VERIFIED (mechanism) / HYPOTHESIS (cause) |
| 6 | OP06 | Confirm the Ottoman Gas Lift Divan Base opening direction and fix the page | Products | FIX FIRST | UNKNOWN (removes a contradiction on the top seller page) | VERIFIED |
| 7 | OP07 | Remove or confirm the Clearpay claim | Compliance / CRO | READY FOR OWNER APPROVAL | Risk reduction; sales impact UNKNOWN | VERIFIED |
| 8 | OP08 | Confirm the abandoned-checkout automation is Active | Recovery | READY FOR OWNER APPROVAL | ESTIMATE: very small (≈0.4 eligible checkouts a month) | UNKNOWN / VERIFIED |
| 9 | OP09 | Record real delivered dates and fulfil on dispatch day | Delivery / Reviews | READY FOR OWNER APPROVAL | Unlocks review timing; fewer where-is-my-order chasers (UNKNOWN size) | VERIFIED |
| 10 | OP10 | Genuine review requests after confirmed delivery (Judge.me Delivered + 5 days) | Reviews | READY FOR OWNER APPROVAL | ESTIMATE: about 2–3 reviews a month | VERIFIED |
| 11 | OP11 | Organic snippet quick wins: Cloud Teddy, Panel Line Border, Square Panel | Organic SEO | READY FOR OWNER APPROVAL | UNKNOWN (CTR uplift; no forecast) | VERIFIED (GSC to 17 Nov) |
| 12 | OP12 | Sitemap clean-up: hide 2 noindexed collections, remove 4 empty legacy blogs (301) | Organic SEO | READY FOR OWNER APPROVAL | UNKNOWN (crawl hygiene) | VERIFIED |
| 13 | OP13 | Clean Ads conversion data: retract cancelled #1014, one primary purchase action, Enhanced Conversions | Google Ads / Tracking | FIX FIRST | Accuracy only; no direct sales impact | VERIFIED / MATCHED |
| 14 | OP14 | PMax brand exclusion + negative list (measure non-brand honestly) | Google Ads | TEST WITH APPROVAL | UNKNOWN (may lower reported ROAS; clarifies true non-brand return) | MATCHED / ESTIMATE |
| 15 | OP15 | One Google feed source + Merchant Center diagnostics export | Feed / Free listings | FIX FIRST | UNKNOWN | HISTORICAL / UNKNOWN |
| 16 | OP16 | Export Google Ads PMax → Products (30 and 90 days) | Google Ads | READY FOR OWNER APPROVAL | Enables product-level ad decisions; £ UNKNOWN | UNKNOWN |
| 17 | OP17 | Create /pages/trade from the Stage 7 draft (on an unpublished theme copy) | Trade | READY FOR OWNER APPROVAL | UNKNOWN (inbound trade route) | VERIFIED |
| 18 | OP18 | Hold trade emails at 80 a day; Companies House check of the 251 leads without company evidence | Trade / Compliance | HOLD | Risk reduction; volume beyond 80/day has produced no quote | VERIFIED |
| 19 | OP19 | Get weekly workshop and delivery capacity (beds per week, delivery runs, lead time) | Capacity | FIX FIRST | Gate for any scaling; no £ impact on its own | UNKNOWN |
| 20 | OP20 | Owner-measured dimensions and storage depth on product pages | Products | FIX FIRST | UNKNOWN (fewer pre-sale questions) | VERIFIED (gap) |
| 21 | OP21 | Side Lift Ottoman Storage Base: keep it first in merchandising and organic work | Products | SCALE CANDIDATE | UNKNOWN (no extra ad spend proposed) | VERIFIED / MATCHED |
| 22 | OP22 | Fix live wording that owner facts do not support (refund policy 'two-man courier', mattress title with banned wording, size price ladder) | Compliance | READY FOR OWNER APPROVAL | Risk reduction | VERIFIED |
| 23 | OP23 | Route Shopify Inbox chats into HQ | Customers | READY FOR OWNER APPROVAL | UNKNOWN (no lost chats) | VERIFIED (gap) |
| 24 | OP24 | Correct the WhatsApp number with customer E002 and check quick replies | Customers | FIX FIRST | Recovers one lost contact | VERIFIED |
| 25 | OP25 | Settle #1020 in PayPal (£273.59, cancelled 23 Sep, still PAID with £0 refunded) | Finance | FIX FIRST | Removes a dispute risk; makes Shopify net match paid net | VERIFIED |
| 26 | OP26 | Stop scheduled-task waste: cinema task while autoCinema is false; move the Trading HQ watchdog | Automations | READY FOR OWNER APPROVAL | ESTIMATE: 14–182 fewer wake-ups a week | VERIFIED |
| 27 | OP27 | Social post task: default model, drop the dead Supermetrics connector | Automations | READY FOR OWNER APPROVAL | Lower resource use; sales impact UNKNOWN | VERIFIED |
| 28 | OP28 | Send the 4 drafted PR pitches (earned mentions) | Organic / AI search | READY FOR OWNER APPROVAL | UNKNOWN (inclusion cannot be promised) | VERIFIED |
| 29 | OP29 | Matching mattress / headboard email to subscribed buyers | Repeat sales | HOLD | UNKNOWN (small) | VERIFIED / HYPOTHESIS |
| 30 | OP30 | Raise ad budget or re-enable Shopping UK / Search UK | Google Ads | NOT SUITABLE | UNKNOWN; could lose money | VERIFIED / MATCHED |


### Top 10 in detail

**1. Keep Google Ads serving: fix the declined payment card** (OP01, FIX FIRST)

- Evidence: Card Visa ••0882 declined 19 Nov 22:36 (insufficient funds); ads still serving at 01:00 20 Nov; last 7 days 2 real orders (#1040, #1042), both brand [VERIFIED / MATCHED]
- Now: 30d real ROAS 3.78, CPA £102.05 (PMax £25/day)
- Impact: ESTIMATE: protects the 2–3 brand orders a fortnight that ads capture (02 §2.5); £ value UNKNOWN · Effort: 10 min · Risk: Low
- Owner action: Pay the balance or add a card in Google Ads → Billing

**2. Answer the waiting pre-sale customers (E010, E011, E021, E022, E023)** (OP02, READY FOR OWNER APPROVAL)

- Evidence: E010 unanswered since 7 Nov; E011 quote overdue, delivery wanted 27–30 Nov; E022 storage depth due 20 Nov; E023 ready to buy; E021 asks about South West delivery [VERIFIED]
- Now: 7 enquiries waiting on us; 1 with no reply at all
- Impact: ESTIMATE: 0–5 orders (one per waiting buyer); £ value UNKNOWN · Effort: 1–2 h · Risk: Low (replies must not invent facts)
- Owner action: Send the replies (drafts in HQ inbox); give the missing facts

**3. Keep the open delivery promises (#1040 slot tonight; #1043 assembly price)** (OP03, FIX FIRST)

- Evidence: #1040 (£556.19) promised delivery Sat 21 Nov, time slot due Fri 20 Nov evening, order has no customer email; #1043 quoted £50 cash assembly vs £69.99 list [VERIFIED]
- Now: 2 open promises; 1 of 22 orders since 1 Oct has a real delivered date
- Impact: Protects 2 paid orders already taken; £ at risk UNKNOWN beyond #1040 £556.19 · Effort: 15 min · Risk: Low
- Owner action: Send the #1040 slot; decide £50 or £69.99 for #1043

**4. First trade quote: reply to Ivywell Interiors (fabric metres, COM charge, where to send)** (OP04, READY FOR OWNER APPROVAL)

- Evidence: Interested reply 17 Nov; promised answer overdue; blocked on owner trade Q1–Q3 [VERIFIED]
- Now: 1 interested lead of 314 emailed; 0 quotes; £0 trade revenue
- Impact: UNKNOWN (first trade quote; no trade order yet) · Effort: 15 min · Risk: Low
- Owner action: Answer trade questions Q1–Q3

**5. Price truth on the high-traffic flagged ottoman beds (Line Bumper, Line Ambassador, Cloud Teddy, Grand Extra-Tall)** (OP05, FIX FIRST)

- Evidence: Line Bumper 432 landings / 28 cart sessions / 0 orders; Line Ambassador 370 / 26 / 1; Cloud Teddy 109 / 14 / 2; Grand 118 / 18 / 1 (90d); Stage 5 F1/F6/F7 open [VERIFIED (mechanism) / HYPOTHESIS (cause)]
- Now: 26 products in class H (blocked by a configuration or information issue)
- Impact: UNKNOWN (largest product lever per 01 §4; no forecast) · Effort: Owner decisions + 1–2 h edits · Risk: Medium (price changes need owner)
- Owner action: Choose A (base price in headline) or B (rename) per Stage 5 Q9; F6/F7 facts

**6. Confirm the Ottoman Gas Lift Divan Base opening direction and fix the page** (OP06, FIX FIRST)

- Evidence: Top product by 90d net (£2,666.63, 7 orders) but page says end-opening 23 times and side opening 8 times; options are left/right side [VERIFIED]
- Now: Class H (F8)
- Impact: UNKNOWN (removes a contradiction on the top seller page) · Effort: 5 min answer + edit · Risk: Low
- Owner action: Answer END / SIDE / BOTH

**7. Remove or confirm the Clearpay claim** (OP07, READY FOR OWNER APPROVAL)

- Evidence: Clearpay text on 9 of 13 checked pages; 0 Clearpay payments in 43 orders; BRIEF corrected 20 Nov; autopilot caption: waits for the owner Clearpay decision (step dormant since 9 Nov) [VERIFIED]
- Now: 9 of 13 pages
- Impact: Risk reduction; sales impact UNKNOWN · Effort: 5 min answer + edits · Risk: Low
- Owner action: Read Settings → Payments: ON or OFF

**8. Confirm the abandoned-checkout automation is Active** (OP08, READY FOR OWNER APPROVAL)

- Evidence: Editor opened 19 Nov puts it in Draft; status not readable by API [UNKNOWN / VERIFIED]
- Now: Status UNKNOWN; 3 real abandoners in 73 days, 1 subscribed
- Impact: ESTIMATE: very small (≈0.4 eligible checkouts a month) · Effort: 2 min · Risk: Low
- Owner action: Open Marketing → Automations and tap Set to active if Draft

**9. Record real delivered dates and fulfil on dispatch day** (OP09, READY FOR OWNER APPROVAL)

- Evidence: All 22 orders since 1 Oct marked Fulfilled within a median ~3 h; only #1038 has a real delivered date; 'on the way' email goes out on order day [VERIFIED]
- Now: 1 real delivered date
- Impact: Unlocks review timing; fewer where-is-my-order chasers (UNKNOWN size) · Effort: 30 min, then 1 min per order · Risk: Low
- Owner action: Mark #1031–#1043 delivered dates; fulfil only when the van leaves

**10. Genuine review requests after confirmed delivery (Judge.me Delivered + 5 days)** (OP10, READY FOR OWNER APPROVAL)

- Evidence: 3 genuine reviews (all 5★), 0 replies; #1038 eligible from 22 Nov; #1034–#1042 after delivery confirmed [VERIFIED]
- Now: 3 reviews
- Impact: ESTIMATE: about 2–3 reviews a month · Effort: 30 min setup · Risk: Low (no incentives, no gating)
- Owner action: Approve S7-OA15/16 rules



## 21. Top 20 risks

Full detail: `business-risk-register.csv`.

| # | ID | Risk | Severity | Likelihood / impact | Mitigation | Owner | Due | Status |
|---|---|---|---|---|---|---|---|---|
| 1 | R01 | Google Ads stops serving because the card was declined | P0 | High / High | Update card / pay balance today; check Billing → Summary | Owner | 2026-11-20 | OPEN |
| 2 | R02 | #1040 delivery promise broken (slot due tonight, no customer email on order) | P0 | Medium / High | Send the slot by phone/WhatsApp tonight | Owner | 2026-11-20 | OPEN |
| 3 | R03 | Waiting customers lost (E010, E011, E021, E022, E023) | P0 | High / Medium | Reply today; holding line where a fact is missing | Owner | 2026-11-20 | OPEN |
| 4 | R04 | Trade emails step up to 140/day on 25 Nov without the compliance gate | P0 | High (automatic) / High | Owner says HOLD at 80; Companies House check first | Owner | 2026-11-24 | OPEN |
| 5 | R05 | #1020 customer may be owed £273.59 (PayPal dispute) | P0 | Medium / Medium | Owner checks PayPal and records outcome | Owner | 2026-11-20 | OPEN |
| 6 | R06 | Live claims not supported by owner facts (Clearpay 9/13 pages; 'end-opening' on Gas Lift Divan Base; 'two-man courier' in refund policy) | P1 | High (live now) / Medium | Owner answers Clearpay and opening direction; approve wording fixes | Owner | 2026-11-23 | OPEN |
| 7 | R07 | #1043 assembly price dispute (£50 quoted vs £69.99 list) | P1 | Medium / Low | Decide and note on the order before delivery | Owner | 2026-11-20 | OPEN |
| 8 | R08 | Demand outruns the workshop (capacity UNKNOWN) | P1 | Medium / High | Owner gives beds/week, runs/week, lead time; no scaling until then | Owner | 2026-11-23 | OPEN |
| 9 | R09 | Ad spend may not be profitable (costs parked) | P1 | UNKNOWN / High | No budget increase; hold PMax at £25/day | Owner | When costs unparked | PARKED |
| 10 | R10 | Non-brand paid search has stopped selling | P1 | Medium / Medium | Hold; brand exclusion test after approval; review 23 Nov (conversion lag up to ~20 days) | Manager | 2026-11-23 | OPEN |
| 11 | R11 | Delivery data is not real (fulfilled ≠ shipped) | P1 | High / Medium | Fulfil on dispatch; mark delivered on the day; back-fill #1031–#1043 | Owner | 2026-11-23 | OPEN |
| 12 | R12 | Abandoned-checkout emails may be off (automation in Draft) | P1 | Medium / Low | Owner reads the badge and sets Active | Owner | 2026-11-20 | OPEN |
| 13 | R13 | Marketing consents before 19 Nov may be invalid (pre-ticked box) | P1 | UNKNOWN / Medium | No marketing to these until Q2 answered | Owner + professional | 2026-11-27 | OPEN |
| 14 | R14 | Christmas cut-off unknown while December demand cannot be read | P1 | High / Medium | Owner sets the last order date for Christmas delivery | Owner | 2026-11-27 | OPEN |
| 15 | R15 | Shopify records £0 tax though VAT registered | P1 | High (current) / Medium | Accountant item (parked); ex-VAT figures stay ESTIMATE | Owner + accountant | When VAT unparked | PARKED |
| 16 | R16 | Revenue concentrated in two ottoman bases | P2 | Medium / Medium | Fix Gas Lift opening text; keep Side Lift healthy; price truth on other ottomans | Owner | 2026-11-27 | OPEN |
| 17 | R17 | Ads reports overstate results (#1014 still counted; 7 actions; Enhanced Conversions UNKNOWN) | P2 | High (current) / Low | Retract #1014; one primary action | Owner | 2026-11-27 | OPEN |
| 18 | R18 | Stale prompts and automations repeat old claims or waste runs | P2 | High (current) / Low | Autopilot session edits its caption; disable cinema; trim social task | Manager + owner | 2026-11-23 | OPEN |
| 19 | R19 | Trade enquiries land on a 404 trade page | P2 | High (current) / Low | Create page from draft after trade facts | Owner | 2026-11-27 | OPEN |
| 20 | R20 | Weak trust signals: 3 reviews; not named in AI answers (0 of 4) | P2 | High (current) / Medium | Review requests after real delivery; publish owner facts; PR pitches | Owner | 2026-12-03 | OPEN |


## 22. Controlled scaling decisions

Labels: HOLD / FIX FIRST / TEST WITH APPROVAL / READY FOR OWNER APPROVAL / SCALE CANDIDATE / NOT SUITABLE. Conditions to change and review dates: `scaling-decisions.csv`.

| Item | Decision | Reason | Next review |
|---|---|---|---|
| Google Ads PMax (£25/day) | HOLD | Only live campaign; 30d real ROAS 3.78, CPA £102.05, but 90d ROAS 2.32 and no non-brand order from 18 days of clicks; profitability not verified; card declined | 2026-11-23 |
| Google Ads Search UK (paused) | NOT SUITABLE | 2 orders, both brand; ~£350 non-brand spend sold nothing | 2026-12-18 |
| Google Ads Shopping UK (paused) | NOT SUITABLE | Real ROAS 0.70; PMax serves the same feed with priority | 2026-12-18 |
| Ad budget increase above £25/day | NOT SUITABLE | PROFITABILITY NOT VERIFIED — COST DATA PARKED; capacity UNKNOWN; cap £30/day | 2026-12-18 |
| PMax brand exclusion / negatives | TEST WITH APPROVAL | Brand ≈5% of spend, 38% of real Ads value; non-brand ROAS ≈1.52 | 2026-11-23 |
| Ads conversion tracking clean-up | FIX FIRST | #1014 cancelled still counted; 7 actions; Enhanced Conversions UNKNOWN | 2026-11-23 |
| Merchant Center / feed (free listings) | FIX FIRST | Two feed sources; diagnostics UNKNOWN; free listings drive most product organic sessions | 2026-11-27 |
| Organic SEO quick wins (metas, snippets) | READY FOR OWNER APPROVAL | Positions 4–11 with few clicks; 0 organic orders in 30d; drafts ready | 2026-11-23 |
| Organic technical clean-up | READY FOR OWNER APPROVAL | T05/T06/T03 still open; 23 of 23 technical items open | 2026-11-23 |
| AI search visibility | HOLD | Named 0 of 4, cited 0 of 4 today; answers reward published numbers Eagle Bed lacks | 2026-12-07 |
| Trade outreach email | HOLD | 314 sent → 1 interested, 0 quotes, £0; 0 privacy lines on past sends; plan steps to 140/day on 25 Nov | 2026-11-24 |
| Trade page /pages/trade | READY FOR OWNER APPROVAL | 404; draft ready; 8 of 32 requirements blocked | 2026-11-27 |
| Abandoned checkout recovery | FIX FIRST | Automation status UNKNOWN; ≈0.4 eligible a month | 2026-11-23 |
| Review requests | READY FOR OWNER APPROVAL | 3 reviews; #1038 eligible 22 Nov once marked delivered | 2026-11-23 |
| Returning-customer emails | HOLD | Consent Q2 unresolved; 2 returning of 36 | 2026-11-27 |
| Social posts (3 a day) | HOLD | 0 direct social orders in 90 days (Stage 1); 21 runs/week on Opus with a dead connector | 2026-12-03 |
| Cinema videos | NOT SUITABLE | Paused (Gemini 402, autoCinema false) but task still fires 14×/week | 2026-12-03 |
| CRO theme 213270004043 | HOLD | Published 19 Nov; 0 orders 19 Nov — too early to judge; 2-week watch | 2026-12-03 |
| Side Lift Ottoman Storage Base | SCALE CANDIDATE | 2.25% on 267 landings, 6 orders, £1,603.38 90d net, class A, no blocker | 2026-11-23 |
| Ottoman Gas Lift Divan Base | FIX FIRST | Top 90d revenue £2,666.63 (7 orders) but opening direction contradicts itself | 2026-11-23 |
| Line Bumper Ottoman | FIX FIRST | 432 landings, 28 cart sessions, 0 orders; F1 price truth | 2026-11-27 |
| Line Ambassador | FIX FIRST | 370 landings, 26 cart sessions, 1 order; two colour pickers (F6) | 2026-11-27 |
| Cloud Teddy Bouclé Ottoman | FIX FIRST | 109 landings, 14 carts, 2 orders; F1; organic 'cloud bed small double' pos 7.9 | 2026-11-27 |
| Savoy Channel | HOLD | 3.03% on 33 landings (small sample); 1 order | 2026-12-18 |
| New products (70 drafts) | HOLD | Capacity UNKNOWN; costs parked; catalogue review deferred to 18 Dec | 2026-12-18 |
| PR pitches (earned mentions) | READY FOR OWNER APPROVAL | 0 independent mentions; 4 pitches drafted | 2026-12-07 |
| Landlord / HMO guide | HOLD | Draft has 6 blocked markers; fire answers missing | 2026-12-07 |
| Phone outreach to 18 local leads | NOT SUITABLE | TPS/CTPS screening cost UNKNOWN; Stage 7 recommends NO for now | 2026-12-18 |
| Meta ads | NOT SUITABLE | £0 spend since 8 Sep; pixel/catalogue issues open (C037, C044) | 2026-12-18 |


- **One SCALE CANDIDATE only — Side Lift Ottoman Storage Base — and only for merchandising and organic priority.** No extra ad spend for anything until costs, capacity and the card are sorted.

## 23. Reporting cadence

Full design: `reporting-cadence.md`. It **reuses the existing scheduled tasks**; nothing new is created.

- **Daily:** 23:59 daily report (orders, revenue, Ads spend and billing alerts, DQ score) + inbox agent every 2 h (customers waiting) + 07:47 autopilot (site and alert checks) + weekday Email Marketing (trade sends, bounces).
- **Weekly:** Mon 08:52 Search Revenue report; Mon 11:17 Google growth (≤40 credits); CEO sprint Mon/Thu 10:23 (approval queue).
- **Monthly (PROPOSAL — needs owner approval, not created):** first Monday of the month inside the Mon 08:52 task: month revenue vs previous, real ROAS, organic, AI test, reviews, trade, capacity, spam-link / Manual-actions check, credits.
- **Gaps:** capacity and delivered dates (owner data), Ads balance (email only), automation status, trade pipeline stages, no task refreshes the `cmd/*` docs, monthly spam-link check not scheduled.
- **Waste (recommendation only):** disable the cinema task while autoCinema is false (14/week); move the Trading HQ watchdog (168/week); social task on the default model without Supermetrics.

## 24. Consolidated owner approval queue

One queue from Stages 5–8, de-duplicated (for example, the #1020 refund appeared in Stages 5, 6 and 7 and is one row here). Full file: `owner-approval-queue.csv` — **75 rows: P0 13 · P1 18 · P2 20 · P3 12 open · 2 parked · 10 decided.**

### P0 — today

| ID | Item | What the owner does | Time |
|---|---|---|---|
| AQ01 | Google Ads payment card | Google Ads → Billing → Payment methods: add funds or a new card, then check Summary for a balance | 10 min |
| AQ02 | #1040 delivery time slot (Sat 21 Nov) – due this evening | Phone or WhatsApp the buyer the Saturday time slot tonight | 5 min |
| AQ03 | #1043 assembly: honour the written £50 or ask £69.99 (list price) | Decide £50 or £69.99 and write it on the order notes | 5 min |
| AQ04 | Reply to E010 (made-to-measure 6ft × 6ft with front-lift ottoman) | Send the HQ draft today (yes/no, price when known) | 10 min |
| AQ05 | Send E011 the itemised written quote (delivery wanted 27–30 Nov) | Send the quote with assembly as optional £69.99; no date promise you cannot keep | 15 min |
| AQ06 | Reply to E023 (ready to buy; can the ottoman open from the side?) | Answer the opening question and send total, warranty and link | 10 min |
| AQ07 | Give E022 the King base storage depth (promised by today) | Measure and send, or approve the holding line | 10 min |
| AQ08 | Answer E021 in Shopify Inbox (South West delivery) | Confirm free delivery to South West England by our own team; day agreed by phone | 5 min |
| AQ09 | Ivywell Interiors: answer trade questions Q1–Q3 (fabric per size, COM charge, where to send) | Fill in Q1–Q3 (one line each) | 10 min |
| AQ10 | Send E002 one corrected message with 07417 439197 | Send the correction and check quick replies/signatures | 5 min |
| AQ11 | Hold trade emails at 80/day (plan steps up to 140/day on 25 Nov) | Reply HOLD AT 80 before Wed 25 Nov | 1 min |
| AQ12 | PayPal refund for #1020 (£273.59) | Check PayPal; refund or tell us it was refunded | 10 min |
| AQ13 | Abandoned-cart automation is Active | Marketing → Automations → Recover abandoned checkout → Set to active (send a screenshot) | 2 min |


### P1 — this week

| ID | Item | What the owner does | Time |
|---|---|---|---|
| AQ14 | Weekly workshop and delivery capacity; real lead time; is '3–5 working days' still right? | Write: beds per week, delivery runs per week (days/areas), order-to-delivery days | 10 min |
| AQ15 | Clearpay: ON or OFF at checkout | Read Settings → Payments and reply ON or OFF | 2 min |
| AQ16 | Ottoman Gas Lift Divan Base opening direction | Reply END / SIDE / BOTH | 1 min |
| AQ17 | Workshop visiting rule (open hours or by appointment) | Reply NO / BY APPOINTMENT / HOURS ___ | 1 min |
| AQ18 | 20-minute fact session: storage depth, lift height, outside dimensions, strut rating, old-bed removal | Measure and send the facts list | 20 min |
| AQ19 | Christmas last order date | Write the date | 1 min |
| AQ20 | Mark real delivered dates #1031–#1043 (#1038 = 17 Nov) and fulfil only on dispatch | Mark dates in Shopify by 23 Nov; approve the fulfil-on-dispatch rule | 30 min |
| AQ21 | Ottoman price truth: headline A (base price) or B (rename); 'with Drawers' default; Ambassador colour picker; Grand height | Choose A or B and answer F3/F6/F7 | 15 min |
| AQ22 | Trade questions Q4–Q16 and Q20–Q21 (price basis, minimum, VAT invoice, payment, lead times, returns) | Fill in the sheet | 20 min |
| AQ23 | Trade questions Q17–Q19 (fire labels and supplier test certificates) | Answer YES / NO / DON'T KNOW | 5 min |
| AQ24 | Create /pages/trade from the Stage 7 draft (unpublished theme copy) | Reply YES; publish after review | 5 min |
| AQ25 | Treat the 251 emailed leads without limited-company evidence as do-not-email until a Companies House check | Reply YES | 1 min |
| AQ26 | Consent Q2 (was the box pre-ticked before 19 Nov?) and ICO fee | Answer Q2; confirm ICO registration | 10 min |
| AQ27 | Google Ads conversion hygiene: retract #1014, one primary purchase action, Enhanced Conversions | Reply YES to Stage 5 E6/O9 | 2 min |
| AQ28 | Owner exports: Ads PMax → Products (30/90d) and Merchant Center diagnostics | Download both and drop in HQ | 15 min |
| AQ29 | One Google feed source (keep one, pause the other) | Choose which source stays | 5 min |
| AQ30 | Remove live wording owner facts do not support: refund-policy 'two-man courier', mattress title with banned wording, Clearpay in metas | Reply YES and give the new mattress name | 5 min |
| AQ31 | Reply to E008 (Cloud Teddy drawer bed in King; swatches) | Send one reply or close | 10 min |


### P2 and P3

| ID | P | Item | What the owner does |
|---|---|---|---|
| AQ32 | P2 | Stop the cinema task while autoCinema is false; move the Trading HQ watchdog | Reply YES (Manager disables trig_016okuWup1wybjbpScFyxw4B; you move the watchdog) |
| AQ33 | P2 | Registered office (via the accountant): move to the workshop with form AD01, then show it | Ask the accountant to file AD01 |
| AQ34 | P2 | PMax brand exclusion + negative list + listing-group exclusions R1/R2 | Reply YES / NO |
| AQ35 | P2 | Judge.me Delivered + 5 days, one reminder, reply to the 3 reviews; review rules (no incentives, no gating) | Reply YES |
| AQ36 | P2 | Recommended abandoned-checkout setup (1 h + 24 h, subscribers only, no discount, no Clearpay) | Reply YES |
| AQ37 | P2 | Route Shopify Inbox chats into HQ | Reply YES and log the 12 and 15 Nov chats |
| AQ38 | P2 | Apply the 19 product + 10 collection meta drafts | Reply YES or list exceptions |
| AQ39 | P2 | Technical SEO clean-up: sitemap (T05/T06), redirects, menu links, Article schema | Reply YES |
| AQ40 | P2 | Size price fixes (Royal Chesterfield Super King £389.99 < King £399.99; Prism King; Valentina Single) | Set the prices |
| AQ41 | P2 | Easify: running total, inline option data, mattress size tied to bed size | Reply YES to a support ticket |
| AQ42 | P2 | Checkout bot protection | Settings → Checkout → turn on |
| AQ43 | P2 | Trade quotes promise 'by the end of the next working day' | Reply YES |
| AQ44 | P2 | Pipeline fields, suppression collection, LIA and retention schedule for trade | Reply YES and sign the LIA |
| AQ45 | P2 | Clear 'confirm your business details' in Google Business Profile | Open GBP and confirm |
| AQ46 | P2 | Schema: legalName ABBAS TRADE LTD + company number; physical-business schema on the workshop with the visiting rule | Reply YES after AQ17 |
| AQ47 | P2 | Owner checks: GSC indexing/CWV exports, URL Inspection (3 products), Bing live test, bare-domain redirect | Send screenshots |
| AQ48 | P2 | Aftercare page fix and gas-strut facts for a help section | Reply YES; give strut facts |
| AQ49 | P2 | Base height 14 in on the Gas Lift Divan Base page | Reply YES |
| AQ50 | P2 | Batley named as a delivery town on /pages/beds-west-yorkshire | Reply KEEP or REMOVE |
| AQ51 | P2 | GA4 property currency USD → GBP | Change in GA4 admin |
| AQ52 | P3 | Send the drafted PR pitches; lend a sample bed if asked | Reply YES / NO |
| AQ53 | P3 | Monthly checks: manual AI test (first Monday) and Search Console Manual actions / spam-link count | Reply YES (added to the Monday Search Revenue task) |
| AQ54 | P3 | Social post task on the default model with fewer connectors | Reply YES |
| AQ55 | P3 | Matching mattress email to 9 subscribed buyers (after consent Q2) | Reply YES after AQ26 |
| AQ56 | P3 | Headboard fit by base/height; headboards standalone or option | Give the fit list |
| AQ57 | P3 | #1016 Northern Ireland £0 delivery: intended? | Reply YES / NO |
| AQ58 | P3 | Remove BFPO from the free GB zone | Reply YES / NO |
| AQ59 | P3 | Yell categories; Apple Business name; FreeIndex activation | Reply YES |
| AQ60 | P3 | New photos (Divan Base open, Stone); do the Gemini images show the real product? | Take photos; answer YES / NO |
| AQ61 | P3 | Feed hygiene: 36 blank SKUs, one inventory rule, one mattress price list, orphan products to collections, one chat widget | Reply YES |
| AQ62 | P3 | Trade segment rules: furniture-pack firms as partners; phone the 18 phone-only leads (after TPS/CTPS) | Reply (recommended: NO phoning for now) |
| AQ63 | P3 | Landlord/HMO guide only after the trade page and Q17–Q19 | Reply YES |


### Parked and already decided (never re-asked)

| ID | Item | Status | Date |
|---|---|---|---|
| AQ64 | Product costs, delivery cost per drop, VAT treatment, Shopify tax settings | PARKED | 2026-11-19 |
| AQ65 | Revisit the 25 'consider retiring' frames, 6 possible duplicates, chesterfield naming | PARKED | 2026-11-19 |
| AQ66 | CRO theme 213270004043 published | DECIDED | 2026-11-19 |
| AQ67 | Terms / Contact name ABBAS TRADE LTD 16410472; VAT reg 520 9622 06 | DECIDED | 2026-11-19 |
| AQ68 | Phone / WhatsApp 07417 439197 only | DECIDED | 2026-11-20 |
| AQ69 | No bought links: leave spam links, no disavow, monitor monthly | DECIDED | 2026-11-19 |
| AQ70 | Workshop address (Pepproyd Street, Dewsbury) on GBP; home address never | DECIDED | 2026-11-19 |
| AQ71 | Trade emails to limited companies only, with privacy line | DECIDED | 2026-11-19 |
| AQ72 | Assembly optional £69.99, never free (Room of Choice Drop Off £29.99) | DECIDED | 2026-11-19 |
| AQ73 | Gas Lift Divan Base base height 14 in | DECIDED | 2026-11-19 |
| AQ74 | UK only; marketing box unticked by default | DECIDED | 2026-11-19 |
| AQ75 | Customer-supplied fabric (COM) accepted | DECIDED | 2026-11-17 |


## 25. Dashboard

- **HQ CEO tab:** https://claude.ai/artifact/H8ECqvxQbUQSABuMUK1iki — HQ db collection `cmd`: `ceo` (this report's summary), `revenue`, `products`, `delivery`, `ads`, `organic`, `customers`, `trade`, `quality`, `agents`, `resources`, `continuity`.
- **Test results:** 12 of 12 PASS (20 Nov, Chromium, 390 px and 1366 px, real cmd/* data): CEO tab loads, all 18 sections render, UNKNOWN never shown as 0, 0 JS errors, no sideways scroll, timestamps and profitability banner shown, revenue matches the baseline to the penny, 63 open + 10 decided approval items, 20 risks, 30 opportunities. Details: `dashboard-test-results.csv`.

## 26. CEO VERDICT

### 1. What is working
- Sales: **£6,857.57 net from 16 orders in the last 30 days, +142.6%** on fewer visitors [VERIFIED].
- PMax at £25/day: **30-day real ROAS 3.78, CPA £102.05** — revenue, not profit [MATCHED].
- Customer replies: median first reply **1.5 hours** since 12 Nov [VERIFIED].
- The books reconcile: £15,241.97 paid net; 0 unmatched Ads conversions [VERIFIED / MATCHED].
- Website fixes are live: CRO theme, ABBAS TRADE LTD on Terms, assembly shown as an optional £69.99 add-on [VERIFIED].

### 2. What is not working
- Non-brand ads: **no order from 18 days of clicks (£441.97)**; 90-day non-brand ROAS ≈1.52 [MATCHED / ESTIMATE].
- Organic: **0 orders in 30 days**; AI answers name us **0 of 4** [VERIFIED].
- Trade email: **314 sent → 1 interested, 0 quotes, £0** [VERIFIED].
- High-traffic ottomans lose buyers at the basket: Line Bumper 432 landings, 28 carts, 0 orders [VERIFIED].
- Delivery records: only **1 real delivered date** in 22 orders [VERIFIED].

### 3. What is unknown
- Profit (costs and VAT parked) · weekly workshop and delivery capacity · whether abandoned-cart emails are on · whether Clearpay is on · Google Ads balance after the decline · Enhanced Conversions and Merchant Center health · consent validity before 19 Nov · the new theme's effect (too early).

### 4. Fix immediately
- Google Ads card (today) · #1040 time slot (this evening) · #1043 assembly price (before delivery) · replies to E010, E011, E021, E022, E023, E002 and Ivywell · PayPal #1020 · abandoned-cart automation Active · say HOLD AT 80 before 25 Nov.

### 5. Safe to scale
- **Nothing with money.** Profitability is not verified and capacity is unknown.
- £0-cost work only: keep Side Lift first in merchandising and organic work (SCALE CANDIDATE, no extra spend); organic snippet drafts; review requests after real delivery.

### 6. Hold
- PMax at £25/day (no increase; Search and Shopping stay paused) · trade emails at 80/day · social posts as they are · CRO theme until the 3 Dec read-out · new products until 18 Dec · returning-customer emails until consent Q2 · cinema task off while video is paused.

### 7. Owner's next steps (today first)
1. **Today:** Google Ads → Billing: add funds or a new card; check for a balance due.
2. **Today:** reply to E010, E011, E021, E022, E023; send E002 the correct number (07417 439197); answer trade Q1–Q3 for Ivywell.
3. **Today:** decide #1043 assembly (£50 written or £69.99) and note it on the order.
4. **Today:** check the abandoned-cart automation badge says Active.
5. **This evening:** send the #1040 time slot for Saturday 21 Nov.
6. **By Mon 23 Nov:** check PayPal for #1020 (£273.59); mark delivered dates for #1031–#1043.
7. **Before Wed 25 Nov:** reply "HOLD AT 80" for trade emails.
8. **This week:** weekly capacity (beds, delivery runs, lead time); Christmas last order date; Clearpay ON/OFF; Gas Lift Divan Base opening direction; workshop visiting rule.
9. **This week:** approve stopping the cinema task while autoCinema is false.
10. **When you see the accountant:** registered office (form AD01 to the workshop), costs and VAT.


## Limitations

- Every £ figure is revenue; profit, contribution and break-even ROAS are UNKNOWN (costs and VAT parked by the owner).
- Search Console has no data after 17 Nov; Ads data for 19–20 Nov is preliminary; conversion lag of up to ~20 days may partly fill the non-brand drought.
- Ads-to-order links are inferred from click date and exact value; the brand split rests on search terms covering 28% of spend.
- Delivery, capacity and production status are not recorded anywhere; promises made by phone or WhatsApp are not visible.
- Abandoned-checkout automation status, Judge.me send log, Shopify Inbox content, Merchant Center, Enhanced Conversions, GA4 purchases and field Core Web Vitals are UNKNOWN.
- AI search was tested with one web-search tool on 4 questions; it is not a UK SERP or an AI assistant.
- The "since 20 Nov 00:00" customer window was about one hour, so customer deltas are 0 by construction.
- Data-quality counts: the specialist text (5 WARN / 5 UNKNOWN) and the register file (6 WARN / 4 UNKNOWN) differ by one row; the file is used.

## Credits used

- **Stage 8:** 15 OpenRush credits (specialist 02: Ads campaigns, Ads by date, Ads by campaign, GSC by date, GSC by query — 3 each). Specialists 01, 03, 04 and the Manager: 0.
- **Month:** **236 of 2,001**; protected reserve of 400 untouched.
- Manager: local file reads and writes, plus 1 HQ write (`cmd/ceo`).
