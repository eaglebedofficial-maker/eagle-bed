# Rocket Stage 8, parts 5 and 6: Google Ads command centre, SEO and AI-search command centre

Prepared 20 Nov 2026 (about 01:00–01:30 UK) by the Google Ads, Google Shopping, Search Console, SEO Drift Watch and AI Search specialists. **Read-only.** Nothing was changed in Google Ads, Merchant Center, Search Console, Shopify, the theme or Gmail. No one was contacted. Order numbers only, no customer personal data. Nothing committed.

**PROFITABILITY NOT VERIFIED — COST DATA PARKED.** Every ROAS below is revenue ÷ ad spend, not profit.

**Files (this folder)**

| File | Contents |
|---|---|
| `ads-performance.csv` | Account and each campaign by window (7 / previous 7 / 30 / previous 30 / 90), real orders, brand vs non-brand, decision, evidence, limitations |
| `ads-order-reconciliation.csv` | Every Google Ads conversion in the last 90 days mapped to a Shopify order, with class |
| `organic-performance.csv` | GSC windows, brand vs non-brand, query classes, Shopify organic funnels and orders (7/30/90), indexing, 3 technical re-checks, CWV, content, backlinks |
| `ai-search-performance.csv` | 4 of the 12 Stage 6 questions re-run today, plus carried-forward results |

**Labels:** VERIFIED (read from the source today) · MATCHED (Ads conversion tied to a Shopify order by click date and exact value; the link is inferred) · PLATFORM-REPORTED (Google says so; Shopify cannot confirm) · ESTIMATE (assumption stated) · UNKNOWN (not available; never 0) · HISTORICAL (earlier stage).

**Extraction:** OpenRush Google Ads and Search Console at 2026-11-20 01:00 UTC (= UK time in November). Shopify Admin GraphQL and ShopifyQL at about 01:05. Gmail at about 01:02. Live site checks at about 01:15.

**Windows (Europe/London).** Ads 7 and 30 days end on yesterday, 19 Nov (complete day, still marked preliminary by Google). The Ads 90-day figures use the API's own window, **23 Aug–20 Nov**, which includes today's £0.05 to 01:00. Search Console has **no data after 17 Nov** (normal 2–3 day lag), so every GSC figure is identical to the Stage 6 pull of 19 Nov.

**Exclusions.** Cancelled orders #1010, #1014 and #1020 and refunded orders #1001 and #1006 are excluded from every paid figure. Only #1014 touches Google Ads (shown separately). Google's conversion values include VAT; ex-VAT = ÷ 1.2 (ESTIMATE until the accountant confirms the VAT scheme; parked).

---

## 0. The answers in brief

| Question | Answer | Label |
|---|---|---|
| Is PMax still £25/day? | **Yes.** "Eagle Bed \| PMax \| All Products" is ENABLED, LIMITED (budget constrained), £25.00 daily, standard delivery, Maximise conversions with no target, optimisation score 70.1%. Search UK (£5) and Shopping UK (£15) are PAUSED. "Bed Shop in Dewsbury" is removed. | VERIFIED |
| Is the card problem solved? | **No evidence that it is.** Since 1 Nov Gmail holds exactly two billing emails: **19 Nov 22:33 "payment received £500.00"** and **19 Nov 22:36 "payment was declined"** (Visa ending 0882, reason: *insufficient funds*; "service may continue to run for a brief period"). No later success, no "ads stopped" and no suspension email up to 01:02 on 20 Nov. The campaign was still serving at 01:00 (18 impressions, £0.05 today). | VERIFIED |
| Last 7 days (13–19 Nov) | £183.34 spend, 277 clicks, 2 conversions = **2 real paid orders (#1040, #1042), both brand**, £1,134.87. Real ROAS 6.19 (5.16 ex-VAT). | VERIFIED / MATCHED |
| Last 30 days (21 Oct–19 Nov) | £785.78, 7.70 conversions = 7.70 real orders, £2,966.63. Real ROAS **3.78** (3.15 ex-VAT), real CPA **£102.05**. | VERIFIED / MATCHED |
| Last 90 days (23 Aug–20 Nov) | £2,323.67, Google says 15 conversions / £5,712.92. **Real: 14 paid orders, £5,402.42**, ROAS **2.32** (1.94 ex-VAT), CPA **£165.98**. The difference is cancelled #1014 (£310.50), still counted by Google. | VERIFIED / MATCHED |
| Non-brand | **No non-brand Ads order from any click between 3 and 20 Nov: 18 days, £441.97 spent.** Last non-brand sale: #1032, click 2 Nov. 90-day non-brand ROAS stays about 1.52 (1.27 ex-VAT). | MATCHED / ESTIMATE |
| Reconciliation | 15 Google conversions (90d) → 9 directly matched orders, 4 assisted, 1 platform-reported only, 1 cancelled (#1014), **0 unmatched**. 2 feed-tagged Shopify orders were never counted by Ads (#1013, #1024). | MATCHED |
| Organic (Search Console) | 28 days (23 Oct–19 Nov, data to 17 Nov): 165 clicks (+23%), 15,070 impressions (+54%), position 26.5 (was 20.8). Brand clicks 17 (was 42, −60%). Non-brand about 148. **Unchanged since Stage 6: GSC has no newer days.** | VERIFIED |
| Organic orders | **0 in the last 7 and 30 days. 1 in 90 days** (#1024, £337.99, probable free product listing). | VERIFIED / ESTIMATE |
| Technical fixes since Stage 6? | **None.** 3 cheap re-checks (T05 noindexed collections in sitemap, T06 empty blogs in sitemap, T03 FurnitureStore schema) are all still open. No Stage 6 metadata draft is live (expected: read-only stage). | VERIFIED |
| AI search | 4 of 12 questions re-run with WebSearch: **Eagle Bed named 0/4, cited 0/4.** One answer names an eBay seller in Dewsbury selling a velvet Chesterfield wingback bed; whether that is Eagle Bed is UNKNOWN. Inclusion in AI answers cannot be promised. | VERIFIED (tool, date) |

**Campaign decisions:** PMax = **HOLD + FIX TRACKING** (do not scale; fix the card first). Shopping UK = **PAUSE CANDIDATE** (keep paused). Search UK = **PAUSE CANDIDATE** (keep paused). Merchant Center / feed = **FIX FEED**. Brand/non-brand reporting = **TEST** (measurement only). No campaign is a SCALE CANDIDATE: profitability is unverified and non-brand has been dry for 18 days.

---

## 1. Google Ads: live account (VERIFIED, 20 Nov 01:00 UTC)

| Campaign | Type | Status | Daily budget | Bidding | Other |
|---|---|---|---|---|---|
| Eagle Bed \| PMax \| All Products (24218981435) | Performance Max | **ENABLED – LIMITED: BUDGET_CONSTRAINED** | **£25.00** (standard, not shared) | Maximise conversions, no target | Started 5 Sep; Merchant 5756953290; UK presence; all languages; opt. score 70.1%; image extraction opted out |
| Eagle Bed \| Search \| UK (24034402493) | Search | PAUSED | £5.00 | Target spend, max CPC £2.00 | Google Search only; AI Max off |
| Eagle Bed \| Shopping \| UK (24044219251) | Standard Shopping | PAUSED | £15.00 | Target spend, max CPC £0.80 | Same Merchant feed |
| Bed Shop in Dewsbury (24029277249) | PMax | REMOVED | – | – | £0 ever |

Account negative: content label "parked domains" only. PMax negatives, asset group, search themes and sitelinks were read in Stage 5 on 19 Nov and were not re-pulled (no change is possible in a read-only stage).

**Live spend total = £25/day, inside the owner's £30/day cap.** Google flags "limited by budget". **This is not a recommendation to raise it.**

## 2. Google Ads performance by window

Definitions: spend, impressions, clicks, conversions and value are Google-reported. Real paid orders and real value come from Shopify (paid, not cancelled, not refunded) via `ads-order-reconciliation.csv`. Real ROAS = real value ÷ spend. Ex-VAT = real value ÷ 1.2 ÷ spend. Real CPA = spend ÷ real paid orders.

| Window | Dates | Spend | Impr. | Clicks | CTR | CPC | Ads conv. | Ads value | Ads ROAS | Real paid orders | Real value | Real ROAS | Ex-VAT | Real CPA |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Last 7 | 13–19 Nov | £183.34 | 15,094 | 277 | 1.84% | £0.66 | 2 | £1,132.76 | 6.18 | 2 (#1040, #1042; **both brand**) | £1,134.87 | 6.19 | 5.16 | £91.67 |
| Previous 7 | 6–12 Nov | £200.42 | 16,408 | 313 | 1.91% | £0.64 | 0 | £2.10 | 0.01 | 0 | £0 | 0 | 0 | – |
| Last 30 | 21 Oct–19 Nov | £785.78 | 64,098 | 1,294 | 2.02% | £0.61 | 7.70 | £2,966.63 | 3.78 | 7.70 | £2,966.63 | **3.78** | 3.15 | **£102.05** |
| Previous 30 | 21 Sep–20 Oct | £750.72 | 121,645 | 2,538 | 2.09% | £0.30 | 2.29 | £901.82 | 1.20 | 2.29 | £901.82 | 1.20 | 1.00 | £327.83 |
| Last 90 (API) | 23 Aug–20 Nov | £2,323.67 | 361,880 | 7,005 | 1.94% | £0.33 | 15 | £5,712.92 | 2.46 | **14** (+#1014 cancelled) | £5,402.42 | **2.32** | **1.94** | **£165.98** |
| Non-brand drought | clicks 3–20 Nov | £441.97 | 36,819 | 701 | 1.90% | £0.63 | 2 | £1,134.86 | 2.57 | 2 (**both brand**) | £1,134.87 | – | – | – |

What changed since Stage 5 (19 Nov, 20:04 UTC pull): 19 Nov is now a full day (£27.25, 41 clicks, 0 conversions), so the 7-day spend rose from £176.11 to £183.34. **No new conversion and no new Shopify order since #1043 (18 Nov, direct).** The non-brand drought grew from 17 to 18 days.

### 2.1 By campaign (90 days, 23 Aug–20 Nov, VERIFIED + MATCHED)

| Campaign | Spend | Clicks | Google conv. / value | Real paid orders | Real value | Real ROAS | Ex-VAT | Real CPA | Brand / non-brand orders |
|---|---|---|---|---|---|---|---|---|---|
| PMax (since 5 Sep) | £1,352.36 | 2,812 | 11 / £4,374.45 | 11 | £4,374.43 | **3.23** | **2.70** | **£122.94** | 3 / 8 |
| Shopping UK (paused) | £616.14 | 3,438 | 2 / £739.49 | **1** (#1012) + #1014 cancelled | £428.99 | **0.70** | 0.58 | £616.14 | 0 / 1 |
| Search UK (paused 28 Oct) | £355.17 | 755 | 2 / £598.98 | 2 (#1011, #1016) | £598.98 | 1.69 | 1.41 | £177.59 | **2 / 0** |
| Removed PMax | £0 | 0 | 0 | 0 | – | – | – | – | – |
| **Account** | **£2,323.67** | **7,005** | **15 / £5,712.92** | **14** | **£5,402.42** | **2.32** | **1.94** | **£165.98** | **5 / 9** |

PMax 30-day spend is an ESTIMATE of **≤ £756.94** (account £785.78 minus Search UK's ≥ £28.84 on 23–27 Oct; Search's 21–22 Oct spend is not split). All 30-day conversions are PMax.

**Type split (90d):** PMax £1,352.36 (58%), Standard Shopping £616.14 (27%), Search £355.17 (15%), other £0. Only PMax spends today.

### 2.2 Brand vs non-brand (reused from Stage 5, 19 Nov; still current: no new orders)

Brand = a search term containing "eagle bed(s)". Search terms cover only 28% of 90-day spend; hidden terms are assumed non-brand, so brand spend is a floor (ESTIMATE).

| Segment | Window | Spend | Orders | Real value | ROAS | Ex-VAT | CPA |
|---|---|---|---|---|---|---|---|
| Brand | 90d | ~£115.84 (visible) | 5 (#1011, #1016, #1031, #1040, #1042) | £2,057.83 | 17.8 | 14.8 | ~£23 |
| Non-brand | 90d | ~£2,201 | 9 | £3,344.59 | **1.52** | **1.27** | ~£245 |
| PMax non-brand | 90d | ~£1,234 | 8 | £2,915.60 | 2.36 | 1.97 | ~£154 |
| Brand | last 7 (13–19 Nov) | UNKNOWN (no new term pull) | 2 | £1,134.87 | – | – | – |
| Non-brand | last 7 | ~£183 (most of the spend) | **0** | £0 | 0 | 0 | – |

Search terms were **not** re-pulled: Stage 5's pull is 1 day old (rule: only if > 7 days).

### 2.3 Device and location

- **Device (90d, Stage 5, HISTORICAL 1 day):** mobile 86% of spend, 12 conversions; desktop 11%, 1; tablet 3%, 2 (the #1027/#1033 pair). PMax has no device bid lever.
- **Location: UNKNOWN.** Google's location report is not exposed through OpenRush. Proxy (Stage 5, Shopify paid sessions 90d): England 1,211 sessions / 5 checkouts; Scotland 99 / 0; Wales 68 / 1; Northern Ireland 34 / 0 (NI delivery £90 vs "free GB" in ads).

### 2.4 Conversion quality, Enhanced Conversions, Merchant Center

| Item | Status | Label |
|---|---|---|
| Real share of conversions | 14 of 15 by count (93%), £5,402.42 of £5,712.92 by value (95%) | MATCHED |
| Cancelled order counted (#1014, £310.50, Shopping, 28 Aug + 1 Sep clicks) | **Still counted**, never retracted. Stage 5 P4 / O9 open | VERIFIED (Shopify status) |
| Conversion actions | 7 actions from one tag; a secondary action adds £1.05 values (11 and 12 Nov) | HISTORICAL (Stage 2 T3) |
| Enhanced Conversions | **UNKNOWN** (not exposed) | UNKNOWN |
| Disapproved ads / Merchant Center item issues | **UNKNOWN** (not exposed; owner export pending) | UNKNOWN |
| Two feed sources (sag_organic + Simprosys "stkn") | Open | HISTORICAL (Stage 5/6) |
| Product-level spend | UNKNOWN until the owner's PMax Products export | UNKNOWN |

### 2.5 Billing (Gmail, read-only search, 1–20 Nov)

| Time (UK) | Email | Content |
|---|---|---|
| 19 Nov 22:33 | "Google Ads: We've received your payment for 198-038-2450" | £500.00 applied on 19 Nov |
| 19 Nov 22:36 | "Google Ads: Payment was declined for 198-038-2450" | Visa ending 0882; reason "insufficient funds"; "service may continue to run for a brief period … update your primary form of payment and pay any outstanding balances" |
| 20 Nov 00:03 | Eagle Bed daily report (own) | Flags the decline as urgent |

No other Google Ads billing email since 1 Nov: **no later successful payment, no "ads stopped", no suspension notice** (searched to 01:02, 20 Nov). Ads were still serving at 01:00. **Status: AT RISK.** Whether an outstanding balance remains after the £500 payment, and whether the account uses automatic or manual payments, is UNKNOWN from email.

**Owner action (P0):** sort the funds on Visa ••0882 or add another card in Google Ads → Billing → Payment methods, then check Billing → Summary for any balance due. If the account is suspended, PMax stops and the 2–3 brand orders a fortnight that ads currently capture are at risk.

## 3. Ads → Shopify reconciliation (90 days)

Full table: `ads-order-reconciliation.csv`. Classes:
- **Directly matched:** exact value, plausible click date, and the Shopify journey carries a paid Google tag on first and last visit.
- **Assisted:** exact value; first visit paid Google; the buyer returned direct (often via /cart) to pay.
- **Platform-reported only:** Google reports it, the order exists at the exact value, but Shopify's journey cannot show Google (untagged Search clicks before 28 Sep).
- **Cancelled/refunded**, **unmatched**, **unknown**.

| Class | Orders | Ads conv. | Value incl. VAT |
|---|---|---|---|
| Directly matched | #1012, #1018, #1022, #1028, #1029, #1031, #1032, #1033, #1040 | 9 (≈) | see CSV |
| Assisted | #1016, #1027, #1030, #1042 | 4 (≈) | see CSV |
| Platform-reported only | #1011 | 1 | £220.99 |
| **Real paid total** | **14** | **14** | **£5,402.42** |
| Cancelled (counted by Google) | **#1014** | 1 | **£310.50** |
| Refunded | none in Ads (only #1001, #1006, not Ads) | 0 | £0 |
| Unmatched Ads conversions | **none** | 0 | £0 |
| Shopify-only, never counted by Ads (unknown) | #1013 (31 Aug, £363.59, feed tag, draft order), #1024 (6 Oct, £337.99, probable free listing) | 0 | – |

Check: £5,402.42 + £310.50 = £5,712.92 = Google's 90-day value (1p rounding on #1042 and the #1027/#1033 pair). #1027 and #1033 match only as a pair; data-driven fractions are listed in the CSV.

**Cancelled-order attribution (#1014):** Shopping UK, click 28 Aug (0.04, £11.58) and 1 Sep (0.96, £298.92), order cancelled/expired 25 Sep. It still inflates Shopping's reported ROAS (1.20 vs real 0.70) and the account's Google ROAS (2.46 vs real 2.32). Fix = retract (owner, Stage 5 O9).

## 4. Campaign decisions

| Campaign | Decision | Evidence | Limitations |
|---|---|---|---|
| PMax \| All Products | **HOLD + FIX TRACKING** | Only live campaign; 90d real ROAS 3.23 (2.70 ex-VAT), CPA £122.94; 30d ROAS 3.78. But non-brand 90d ROAS ~2.36 (1.97 ex-VAT) and **0 non-brand orders from 18 days of clicks (£441.97)**. Budget confirmed £25 | Profitability NOT VERIFIED (costs parked) → no scaling. Card declined → fix first. #1014 still counted; Enhanced Conversions UNKNOWN; 7 conversion actions; product spend UNKNOWN. Conversion lag up to ~20 days means the drought may partly fill in |
| Shopping UK | **PAUSE CANDIDATE** (already paused; keep) | Real ROAS 0.70 (0.58 ex-VAT); £0 since 22 Oct; PMax serves the same feed with priority | – |
| Search UK | **PAUSE CANDIDATE** (already paused; keep) | 2 orders, both brand; ~£350 non-brand spend sold nothing | A brand-only Search test would need a budget decision; not proposed |
| Merchant Center / feed | **FIX FEED** | Two feed sources; Gas Lift Divan Base opening-direction P0; ottoman headline prices; NI shipping | Diagnostics UNKNOWN until owner export |
| Brand/non-brand reporting | **TEST** (measurement) | Brand = ~5% of spend, 38% of real Ads value | Needs a search-term pull weekly (3 credits) |

No SCALE CANDIDATE. Every live change remains an owner decision; Stage 5's queue (E1 negatives/themes, E2 product-ID suffix, E6 Enhanced Conversions + single primary action) is unchanged and unstarted.

---

## 5. Organic search (Search Console + Shopify)

### 5.1 Search Console (VERIFIED; data ends 17 Nov)

| Window | Dates | Clicks | Impr. | CTR | Position | Previous | Prev clicks | Prev impr. | Prev pos. |
|---|---|---|---|---|---|---|---|---|---|
| Last 7 data days | 11–17 Nov | 39 | 4,843 | 0.81% | 27.1 | 4–10 Nov | 49 | 4,038 | 26.5 |
| Last 28 (API) | 23 Oct–19 Nov | 165 | 15,070 | 1.09% | 26.5 | 25 Sep–22 Oct | 134 | 9,777 | 20.8 |
| Last 90 (API) | 22 Aug–19 Nov | 471 | 38,145 | 1.23% | 22.1 | 24 May–21 Aug | 266 | 22,002 | 22.9 |

**Nothing new since Stage 6:** the API returned the same totals (165 / 471) because Google has not published 18–19 Nov yet.

**Brand vs non-brand (28d):** brand 17 clicks (132 impr, position ~2.4) vs 42 before: **−60%**. Non-brand ≈ 148 vs ≈ 92: +61% (ESTIMATE; 106 of 165 clicks sit in anonymised queries, assumed non-brand).

**Query classes in the 300 returned 28-day rows (rule-based, ESTIMATE):** commercial 232 queries / 19 clicks / 3,739 impr (prev 10 clicks); informational 32 / 17 / 589 (prev 6); product names 11 / 2 / 166 (prev 0); local 12 / 1 / 157.

**Commercial/product near-wins (28d):** "gas lift ottoman bed" 114 impr, pos 18.0; "gas lift bed" 103, 25.3; "beds for small rooms" 97, 23.7; "cloud bed small double" 37, **7.9**; "3000 pocket sprung mattress" 59, 24.5; "chesterfield beds" 60, 29.9. All 0 clicks. The 19 Nov ottoman/storage content edits (CHANGELOG) are too recent to show in GSC.

### 5.2 Organic sessions and orders (Shopify)

ShopifyQL sessions by referrer and utm_medium. **Definition differs from Stage 6:** all countries, bots not removed, so these are higher than Stage 6's UK-human counts.

| Window | Google, no UTM (sessions → carts → checkouts → completed) | Free listing `product_sync` | Bing | Organic orders (paid) | Organic revenue incl. VAT |
|---|---|---|---|---|---|
| Last 7 (13–19 Nov) | 20 → 2 → 2 → 0 | 2 → 0 | 4 | **0** | £0 |
| Last 30 (21 Oct–19 Nov) | 106 → 14 → 4 → 0 | 19 → 2 → 0 → 0 | 5 | **0** | £0 |
| Last 90 (22 Aug–19 Nov) | 609 → 42 → 15 → 0 | 2,190 → 58 → 7 → 5 (mostly paid clicks before 5 Oct) | 9 | **1** (#1024, ESTIMATE free listing) | £337.99 |

Orders are read from each order's journey (Shopify Admin GraphQL, all orders since 20 Aug). #1013 (feed tag, 31 Aug) is paid-or-free UNKNOWN and excluded. Note: #1036 (7 Nov, £629.96) came from **chatgpt.com**, an AI referral, not Google organic.

### 5.3 Indexing, technical, CWV, content, backlinks

| Item | Status | Label |
|---|---|---|
| Product and collection indexing | **UNKNOWN – owner export** (GSC Page indexing screenshot) | UNKNOWN |
| T05 noindexed collections in sitemap | **Still open.** /collections/new-trending and /collections/frontpage are "noindex, follow" and still in sitemap_collections_1.xml (26 URLs) | VERIFIED today |
| T06 empty legacy blogs in sitemap | **Still open.** delivery-informaction, contact, delivery-returns, warranty still in sitemap_blogs_1.xml | VERIFIED today |
| T03 FurnitureStore schema with opening hours | **Still open.** Home JSON-LD still FurnitureStore + Organization | VERIFIED today |
| Stage 6 technical register | **23 of 23 open** (3 re-checked, 20 assumed open; no approvals since 19 Nov) | VERIFIED / HISTORICAL |
| CWV field (CrUX) | **UNKNOWN** (PSI 429 in Stage 6; owner screenshot needed) | UNKNOWN |
| CWV lab (19 Nov, throttled mobile) | Home LCP 3.9 s, TBT 827 ms; ottoman collection LCP 3.7 s; product pages TBT 1.9–2.4 s (Easify inline option data). CLS good | HISTORICAL (lab) |
| Stage 6 metadata drafts (41) | **None published** (as expected in read-only stages). Spot check: Panel Line Border still has its old title | VERIFIED (1 check) |
| Backlinks | Carried forward: no links bought (owner); leave the 31 spam domains, no disavow; monthly Manual-actions check. Earned-mention pitches drafted 10 Nov, not sent | VERIFIED (owner) |

**Top quick wins (unchanged; owner approval needed, £0):**
1. Cloud Teddy snippet and URL consolidation (only organic product page with checkouts; "cloud bed small double" at 7.9).
2. Panel Line Border snippet test (draft READY; position 7.3, CTR 0.4%).
3. Square Panel retitle for "square bed frame" (position 8.2).
4. Hide /collections/frontpage and /collections/new-trending from the sitemap (seo.hidden) (T05).
5. Delete the 4 empty legacy blogs and 301 them (T06).

---

## 6. AI search

Re-run today with the WebSearch tool (standard mode; US-based index, Bing-like; **not a UK SERP and not ChatGPT/Gemini/AI Overviews**). Same wording as Stage 6, so it can be repeated.

| ID | Question | Eagle Bed appears? | Cited? | Named instead | vs 19 Nov |
|---|---|---|---|---|---|
| Q01 | Where can I buy an ottoman bed in the UK? | No | No | Flitch, Furniture Village, DFS, Homebase, Bensons, Lee Longlands, Better Bed Co, Get Laid Beds, Sleepeezee, Fishpools | Same |
| Q03 | Where can I buy a gas lift divan base in the UK? | No | No | Divan Base Direct, Land of Beds, Mattress Supermarket, Archers, Furniture Village (Vispring), MyNextMattress, Bedguru | Same; answer leans on piston ratings (600–700 N), which Eagle Bed does not publish |
| Q08 | handmade beds UK | No | No | Handmade Bed Co, Revival, Wrought Iron & Brass, Woods, Get Laid, Willow & Hall, Wooden Bed Co, Beevers & Co, Long Eaton Sofas | Same; guarantees of 12–25 years and press mentions win |
| Q11 | Where can I buy a Chesterfield bed in Yorkshire? | No (domain) | No | **An eBay listing by a seller in Dewsbury** (velvet Chesterfield wingback bed, £314.99), Designersofas4u, 1stdibs | Changed: 19 Nov named Pascal Beds / Fleming Howland. Whether the Dewsbury eBay seller is Eagle Bed is **UNKNOWN** |

Totals: **named 0/4, cited 0/4 today**; Stage 6 (19 Nov): 0/12 and 0/12 in WebSearch. Google AI Overview sample (19 Nov): eaglebed.co.uk cited 5 times in the sampled corpus (directional). Gemini (10 Nov): named in 1 of 30. ChatGPT, Perplexity, Copilot and AI Mode: UNKNOWN (cannot be queried from this session; owner manual script in stage6/05 H6). **No inclusion in any AI answer can be promised.** What the answers reward: published numbers (strut rating, storage depth, guarantee years, delivery exceptions) and third-party mentions.

---

## 7. HQ documents written (collection "cmd")

- `cmd/ads`: extractedAt, windows, campaigns (name, type, status, budget, spend30, realOrders90, decision, evidence), brand, nonBrand, reconciliation, billing, warnings.
- `cmd/organic`: extractedAt, GSC windows, organic orders (30/90), technicalOpen, indexing "UNKNOWN – owner export", topQuickWins, ai (tests, named, lastTested).

## Limitations

- GSC has no data after 17 Nov. Every GSC figure equals Stage 6's.
- Ads 90 days uses the API window 23 Aug–20 Nov (90 days including a partial today) and does not include 22 Aug. 19 and 20 Nov are preliminary.
- Order matching uses click date and exact value; the click → order link is inferred. #1027/#1033 match only as a pair.
- Brand vs non-brand rests on search terms covering 28% of spend (Stage 5, 19 Nov); hidden terms assumed non-brand.
- Location, Enhanced Conversions, Merchant Center diagnostics, disapprovals, product-level spend and indexing are UNKNOWN (not exposed).
- Billing status comes from email only. Google Ads → Billing was not visible; any outstanding balance is UNKNOWN.
- ShopifyQL organic sessions here include bots and all countries, so they do not match Stage 6's UK-human definition.
- WebSearch is not a UK Google SERP and not an AI assistant. AI answers vary between runs.
- No costs: profit after ads is UNKNOWN. Ex-VAT = ÷ 1.2 (VAT scheme parked).

## Credits used (OpenRush)

| # | Call | Credits |
|---|---|---|
| 1 | get_ad_campaigns (all campaigns: status, budget, bidding) | 3 |
| 2 | get_ad_performance report=date, last_3_months (daily rows → exact 7/30/90 windows) | 3 |
| 3 | get_ad_performance report=campaign, last_3_months | 3 |
| 4 | get_search_performance group_by=date, last_3_months | 3 |
| 5 | get_search_performance group_by=query, last_28_days vs previous (300 rows) | 3 |
| | **Total** | **15 of 21** |

Not called (saved): search terms (Stage 5 is 1 day old), device/network (reused), GSC 7-day query pull (pointless: GSC has no data after 17 Nov), any paid AI-visibility call. Month ledger: ≤ 221 before this task + 15 = **≤ 236 of 2,001**; the protected reserve of 400 is untouched.

Free reads: Shopify Admin GraphQL × 1 (all orders since 20 Aug with status and journeys), ShopifyQL × 3 (sessions 7/30/90), Gmail × 4 (searches + 1 thread), WebSearch × 4, live site fetches × 10 (browser user agent, ≥ 1 s apart).
