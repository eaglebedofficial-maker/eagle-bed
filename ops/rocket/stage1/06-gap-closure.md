# Project Rocket Sales, Stage 1: report 06, gap closure (19 Nov 2026, afternoon)

Verification/QA + Analytics. Read-only. No writes to Shopify, Meta, Gmail, HQ or anywhere else. No customer names, emails or phones (order numbers only). Pulls made 19 Nov 2026, about 12:00–13:30 UTC.

## Summary table

| # | Gap | Status | One-line finding |
|---|---|---|---|
| 1 | Meta ads reporting | **CLOSED** | All 12 Meta campaigns are PAUSED. Last spend 8 Sep 2026. £0 spend from 9 Sep to 18 Nov. Last 90 days: £166.51, all from the August campaign. |
| 1b | Meta catalogue health | **CLOSED** | 3 items rejected for policy (Facebook/Instagram Shops). 60 items have duplicate images, 62 have fewer than 2 images. |
| 2 | Social reach and link clicks | **STILL UNKNOWN** | Supermetrics Facebook/Instagram Insights are not connected. Meta Ads tools do not read organic Page insights. GA4 proxy: Organic Social 23 sessions vs 27. |
| 3 | GA4 sessions by channel | **CLOSED** | 1,688 sessions vs 1,841 (−8.3%). Paid Search sessions up but engaged sessions fell 133 → 22. AI Assistant 61 → 176. Cost 3 credits. |
| 4 | Reviews | **CLOSED** | 145 published products. 2 have a Judge.me review (1 each, both 5 stars). Total 2 product reviews. |
| 5 | Payments / Clearpay | **PARTLY** | 0 Clearpay payments in all 43 orders since July. Wallets on: Shop Pay, Apple Pay, Google Pay. The Clearpay on/off switch itself cannot be read (no API permission). |
| 6 | Bot / card-testing check | **PARTLY** | 0 orders, 0 failed transactions, 1 abandoned checkout (a real product) on 15–17 Nov. Declined attempts that never became orders cannot be read. No sign of money impact. |
| 7 | Order #1020 | **CLOSED (new risk)** | £273.59 was captured by PayPal. Three refund attempts (23 Sep, 29 Sep twice) all FAILED. No refund succeeded in Shopify. |
| 8 | Legal (PECR B2B, DUAA 2025) | **PARTLY** | ICO split confirmed: companies/LLPs = corporate; sole traders and most partnerships = individual (consent or soft opt-in needed). DUAA raised PECR fines to £17.5m or 4% of turnover. Exact commencement date not confirmed; ICO site blocked by this session's network. |
| 9 | Gmail 244 vs HQ 253 | **CLOSED** | The 9 missing threads are bounced sends from 11–13 Nov that were moved to Trash. 244 + 9 = 253. |
| 10 | Fulfilment tracking | **CLOSED** (re-verified) | 0 of the last 16 orders (#1028–#1043) have tracking. Only 2 of 43 orders ever had tracking (#1003 Evri, #1022 DPD). |

---

## 1. Meta ads (Part 3/5)

**Status: CLOSED.** Source: Meta Ads MCP `ads_get_ad_accounts`, `ads_get_ad_entities` (read-only). VERIFIED.

- The user can see 6 ad accounts. The Eagle Bed account is **641104701697209 "Eagle bed"** (GBP, ACTIVE, payment method on file). A second GBP account (648147397688148) spent £0 in the last 90 days. The other 4 accounts belong to unrelated businesses (2 are not queryable) and were not read.
- **12 campaigns, all PAUSED.** Lifetime spend £10,039.75. The biggest was a 2025 link-click campaign (£6,951.07).
- **Last spend: 8 Sep 2026** (£1.29). Campaign "Eagle Bed | Sales | Wingback & Storage Beds" (120251989473090445) ran 24 Aug–8 Sep 2026, then was paused (last updated 8 Sep 16:50).
- **Last 90 days (21 Aug–18 Nov): £166.51, 23,718 impressions, 438 link clicks.** All of it from that one campaign. **£0 from 9 Sep to 18 Nov.** So Meta paid ads had no part in the October–November sales.
- Meta reports **no pixel purchases** for that campaign. Shopify journey data (report 02) shows 2 orders (#1008, #1009, 24 Aug) with a Facebook-ads first touch. ESTIMATE: the Meta purchase event was not being received or matched in August. Current pixel/CAPI health was not checked (not needed for a paused account).
- No `next_actions` were returned by the entity reads, so no follow-up calls were needed. Nothing was changed.

### 1b. Meta catalogue 1311394936570400

**Status: CLOSED.** Source: `ads_catalog_get_diagnostics`. VERIFIED. Counts are variants/SKUs, not products.

| Issue | Severity | Items | Channel |
|---|---|---|---|
| Policy violation (item rejected) | must fix | 3 | Facebook/Instagram Shops |
| Duplicate images (main image repeated in extra images) | opportunity | 60 | all |
| Fewer than 2 images | opportunity | 62 | all |

- The catalogue syncs from Shopify in real time (feed upload count 0). Fixes belong in Shopify, not in Meta.
- Matters only if Meta Shops or catalogue ads restart. Low priority while ads are paused.

## 2. Social reporting (Facebook Page / Instagram reach, link clicks)

**Status: STILL UNKNOWN.**

- Supermetrics: Facebook Insights (FB) and Instagram Insights (IGI) show `NOT_AUTHENTICATED`. No data can be pulled until the owner logs in to Supermetrics for those sources.
- Meta Ads MCP has no organic Page/IG insights tool (reach, profile visits, link clicks).
- Proxy, VERIFIED (GA4, below): **Organic Social 23 sessions** (23 Oct–19 Nov) vs 27 the 28 days before, 6.6 s average engagement. Shopify (report 02) already showed 0 social buyers in 90 days.

## 3. GA4 sessions by channel

**Status: CLOSED.** Source: OpenRush `get_website_analytics` (GA4 property 541444498), report = channel, last 28 days (23 Oct–19 Nov) vs previous 28 (25 Sep–22 Oct). **Cost: 3 credits.** VERIFIED, last 1–2 days preliminary.

| Channel | Sessions | Previous | Change | Engaged sessions (prev) |
|---|---|---|---|---|
| Cross-network (PMax) | 715 | 754 | −39 | 481 (413) |
| Direct | 387 | 235 | +152 | 113 (84) |
| Paid Search | 211 | 194 | +17 | **22 (133)** |
| AI Assistant (ChatGPT etc.) | 176 | 61 | +115 | 119 (41) |
| Organic Search | 94 | 93 | +1 | 68 (72) |
| Organic Shopping | 37 | 36 | +1 | 29 (32) |
| Unassigned | 37 | 9 | +28 | 3 (4) |
| Organic Social | 23 | 27 | −4 | 14 (17) |
| Referral | 6 | 5 | +1 | 6 (3) |
| Paid Shopping | 2 | 430 | −428 | 1 (307) |
| **Total** | **1,688** | **1,841** | **−8.3%** | 857 (1,106) |

What this adds:
- **GA4 shows −8% sessions; Shopify showed −37% to −39%.** GA4 filters known bots and most non-consenting traffic, so the gap supports the Manager's view that much of Shopify's fall is bots and non-UK noise. ESTIMATE (two tools, different definitions).
- **Paid traffic total 928 vs 1,378 (−33%).** Most of the drop is "Paid Shopping" (430 → 2). In GA4, PMax traffic moved into "Cross-network". That is a labelling change, not a real loss. ESTIMATE.
- **Paid Search quality fell sharply:** 211 sessions, but only 22 engaged (10%, was 69%), 7 s average engagement. Something in search ads now brings visits that leave at once. Possible causes: search partner sites, broad-match junk terms, or bots on ad clicks. HYPOTHESIS. Check in Google Ads (network split and search terms) in Stage 2.
- **AI Assistant traffic nearly tripled** (61 → 176), engagement 68%. Agrees with report 02 (ChatGPT 61 → 188 in Shopify).
- The GA4 property currency is set to **USD**, while the store is GBP. It does not affect sessions. It would matter if revenue were ever imported into GA4. Fix in Stage 2 (owner, GA4 admin).

## 4. Reviews (Judge.me)

**Status: CLOSED.** Source: Shopify GraphQL, all published products, metafields `reviews.rating_count`, `reviews.rating` and namespace `judgeme` (badge). VERIFIED.

- **145 published products** read (100 + 45, no more pages).
- **2 products have a review. 1 review each, both 5.0 stars:**
  - Side Lift Ottoman storage bed (`side-lift-ottoman-gas-lift-storage-bed`, the 90-day best seller).
  - Cambridge Storage Panel Bed Frame (`cambridge-storage-panel-bed-frame`).
- **143 products: 0 reviews.** Total product reviews = **2**.
- Every product carries Judge.me metafields, so the app is installed and syncing.
- Store-level reviews ("Store reviews (1)", report 03) are not stored on products and were not re-read.
- **Correction:** earlier text said "about 1 product review". The correct figure is 2.

## 5. Payments and Clearpay

**Status: PARTLY.** Sources: Shopify GraphQL `shop.paymentSettings`, order transactions; ShopifyQL `payments`. VERIFIED.

- Digital wallets switched on: **Shop Pay, Apple Pay, Google Pay**.
- Payment methods actually used, 1 Jul–19 Nov (ShopifyQL, by method):

| Gateway | Method | Transactions | Gross |
|---|---|---|---|
| Shopify Payments | card | 29 | £11,000.86 |
| Shopify Payments | Klarna | 6 | £2,263.82 |
| PayPal | PayPal | 6 | £2,079.65 |
| Shop Pay Instalments | Shop Pay Instalments | 1 | £467.96 |
| (blank, manual) | – | 1 | £369.69 (#1003) |

- **No Clearpay (Afterpay) payment in any of the 43 orders since the store opened.**
- `shopifyPaymentsAccount` and `paymentCustomizations` were refused: the app lacks `read_shopify_payments` and `read_payment_customizations`. So **the Clearpay on/off setting cannot be read.**
- Together with report 03 (checkout showed Card, Klarna, Shop Pay instalments and PayPal, no Clearpay), the evidence that Clearpay is **not offered** is now strong. ESTIMATE (two independent signs, setting not seen). The product page and cart promise of "Klarna or Clearpay" should be treated as unsupported until the owner shows Clearpay on in Settings → Payments.

## 6. Bot / card-testing check, 15–17 Nov

**Status: PARTLY.** Sources: Shopify GraphQL orders, transactions, abandonedCheckouts; ShopifyQL `payments`. VERIFIED counts.

- **Orders created 15–17 Nov: 0.** (Last orders: #1042 on 14 Nov, #1043 on 18 Nov.)
- **Failed or declined transactions on orders, 15–17 Nov: 0.** ShopifyQL payments 14–18 Nov: 2 successful sales only.
- **Cancelled tiny orders, 15–17 Nov: 0.** No order in the store's history is under £97.
- **Abandoned checkouts created 15–17 Nov: 1** (17 Nov, £285.99, a real product). Shopify lists an abandoned checkout only when contact details were entered.
- **Not readable:** card declines that never became an order (where card testing shows up) sit in Shopify Payments, which this app cannot read.
- Reading: the 97 "reached checkout" sessions of 15–17 Nov left no order, no transaction and no contact details. That fits automated probing of the Shop Pay login page more than real card testing. ESTIMATE. **No money impact found.** Suggest moving Q3 from P0 to P1, but the owner should still glance at Shopify Payments for declines and check bot protection.

Side finding, all orders (VERIFIED): **4 of the last 16 orders had a failed first card attempt before a successful retry** (#1031 authentication required, #1034 cancelled payment, #1035 authentication failed, #1038 do not honor). Earlier: #1013, #1018. This is normal 3-D Secure friction, but it means some buyers hit a failed payment. How many gave up after a failure is UNKNOWN.

## 7. Order #1020

**Status: CLOSED. This is a new risk, not just a bookkeeping gap.** Source: Shopify GraphQL order + transactions. VERIFIED.

- Created 23 Sep 13:15 UTC, £273.59, PayPal. Cancelled 23 Sep 13:33, reason "customer".
- Transactions:
  - SALE, PayPal, **SUCCESS**, £273.59 (23 Sep 13:15). **The money was captured.**
  - REFUND, PayPal, **FAILURE** (PROCESSING_ERROR), 23 Sep 13:33.
  - REFUND, PayPal, **FAILURE** (PROCESSING_ERROR), 29 Sep 10:51.
  - REFUND, PayPal, **FAILURE** (PROCESSING_ERROR), 29 Sep 10:56.
- Totals: received £273.59, refunded £0.00, net £273.59. Financial status PAID.
- So: **Shopify has never refunded this customer.** Either the owner refunded directly inside PayPal (which Shopify would not see), or **a customer who cancelled 8 weeks ago is still out of pocket £273.59.** UNKNOWN which. **Owner to check PayPal today (P0).** If it was refunded in PayPal, the previous-30 net sales should use £2,240.51 (the adjusted figure already in section 2).

Related, VERIFIED: **#1010 and #1014** (PayPal) had their payment FAIL (no money taken), yet both were marked **fulfilled** (28 Aug and 3 Sep) before being cancelled on 25 Sep (status EXPIRED). Orders are being marked fulfilled without checking that payment succeeded. This supports the "fulfilled ≠ shipped" finding.

## 8. Legal: PECR B2B email and DUAA 2025

**Status: PARTLY.** Source: web search, 19 Nov 2026 (result summaries only; the ICO site and law-firm pages could not be opened because this session's network blocks those hosts). Treat as HISTORICAL-grade until a person reads the pages.

ICO position on electronic mail marketing (PECR regulation 22):
- **Corporate subscribers** (limited companies, LLPs, Scottish partnerships, government bodies): the consent / soft opt-in rule for email **does not apply**. You must still say who you are and give a valid contact address. The ICO advises keeping a "do not email" list and honouring objections. UK GDPR still applies to named staff emails (e.g. firstname@company) — lawful basis, privacy information, right to object.
- **Individual subscribers** include **sole traders and partnerships other than LLPs/Scottish partnerships** (England, Wales, NI). For them you need **prior consent**, or the **soft opt-in** (only for your own customers, similar products, opt-out offered at collection and in every message). Cold emails to sole traders are therefore not allowed.
- This confirms the report-05 gap: the trade agency must check legal form (Companies House) before sending.

Data (Use and Access) Act 2025:
- **PECR fines** are raised to the UK GDPR level: **up to £17.5 million or 4% of global annual turnover**, whichever is higher (previously £500,000).
- **Soft opt-in extended to charities** ("charitable purpose soft opt-in"). No change found to the commercial soft opt-in or to the corporate/individual split.
- Commencement: search results say the ICO updated its guidance in **June 2026** to say all DUAA data-protection provisions are now in force, and another source cites Commencement No. 6 Regulations. **The exact commencement date of the PECR fine and soft opt-in changes was not confirmed.** UNKNOWN.

Sources (search date 19 Nov 2026):
- ICO, Business-to-business marketing: https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/business-to-business-marketing/
- ICO, What are the rules on direct marketing using electronic mail: https://ico.org.uk/for-organisations/guide-to-pecr/guidance-on-direct-marketing-using-electronic-mail/what-are-the-rules-on-direct-marketing-using-electronic-mail
- ICO, The charitable purpose soft opt-in: https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/the-charitable-purpose-soft-opt-in/
- ICO, The DUAA 2025, what does it mean for organisations: https://cy.ico.org.uk/about-the-ico/what-we-do/legislation-we-cover/data-use-and-access-act-2025/the-data-use-and-access-act-2025-what-does-it-mean-for-organisations/
- Mills & Reeve (29 Jul 2025), DUAA 2025 increased maximum fines for cookies and direct marketing: https://www.mfmac.com/insights/data-protection/data-use-and-access-act-2025-increased-maximum-fines-for-cookies-and-direct-marketing-practices/
- Mishcon de Reya, data protection and e-privacy reform: https://www.mishcon.com/news/data-protection-and-electronic-privacy-reform-whats-hot-and-whats-not
- Blake Morgan, DUAA 2025 and PECR: https://www.blakemorgan.co.uk/data-use-and-access-act-2025-privacy-and-electronic-communications-regulations/

Not legal advice. Get the points confirmed by a solicitor or by reading the ICO pages before relying on them.

## 9. Gmail 244 vs HQ 253

**Status: CLOSED.** Sources: Gmail `search_threads` (read only), HQ `leads` collection (read only). VERIFIED.

- Gmail `in:sent subject:"Beds for" before:2026/11/19`: **244 threads** (5 pages, IDs only, no duplicates).
- HQ leads with `emailedAt` before 19 Nov (UTC): **253**.
- Per day (send date from Gmail thread IDs vs HQ `emailedAt`):

| Day | HQ | Gmail sent | Gap |
|---|---|---|---|
| 11 Nov | 38 | 34 | 4 |
| 12 Nov | 36 | 32 | 4 |
| 13 Nov | 33 | 32 | 1 |
| 16 Nov | 35 | 35 | 0 |
| 17 Nov | 39 | 39 | 0 |
| 18 Nov | 72 | 72 | 0 |
| **Total** | **253** | **244** | **9** |

- Gmail `in:trash subject:"Beds for"` returns **exactly 9 threads**, all sent 11–13 Nov (4, 4, 1), each with a "Mail Delivery Subsystem" bounce. Someone (or an agent) moved those bounce threads to Trash, which also removes them from Sent. **244 + 9 = 253. Gap explained.**
- Gmail will delete Trash after 30 days. Bounce evidence for 11–13 Nov will be gone around 11–13 Dec. HQ already records the bounces.
- Small data issue: on 11 Nov Gmail has 4 bounces but HQ marks only 3 leads "bounced". One bounced lead (a Brighton lettings agency) is still "contacted" in HQ. Fix the status in Stage 2 so it is never re-mailed.
- New fact: HQ shows **39 more trade emails sent on 19 Nov** (292 in total so far). Stage 1 recommended holding the ramp until the PECR legal-form gate exists. The owner may want to pause sends now.

## 10. Fulfilment tracking

**Status: CLOSED (re-verified).** Source: Shopify GraphQL fulfillments.trackingInfo, all 43 orders. VERIFIED.

- Last 16 orders (#1028–#1043): **0 with tracking.** All marked fulfilled.
- Whole store history: **2 of 43** orders have tracking (#1003 Evri, #1022 DPD).
- #1010 and #1014 were marked fulfilled although their payment failed (see gap 7).

---

## Changes this makes to STAGE1-REPORT.md

- Reviews: "about 1" → **2 product reviews on 145 products**.
- Clearpay: from "not seen at checkout" → **0 Clearpay payments ever; wallets list has no Clearpay; switch not readable**. Claim treated as unsupported.
- #1020: from "refund UNKNOWN" → **paid, 3 refund attempts failed; customer may still be owed £273.59. P0 owner check in PayPal.**
- Card testing: **no money impact found**; suggest Q3 becomes P1.
- Meta: **all paused, £0 since 8 Sep**; catalogue issues listed.
- GA4 added: **−8% sessions** (vs Shopify −37/−39%); Paid Search engagement collapse; AI traffic ×2.9.
- Gmail gap: **explained (9 bounced threads in Trash)**.
- Legal: ICO split and DUAA fine level confirmed by search; commencement date open.

## Limitations

- Supermetrics social sources are not connected, so organic Facebook/Instagram reach and clicks remain UNKNOWN.
- The Shopify app cannot read Shopify Payments or payment customisations. Clearpay's switch and declined non-order card attempts are UNKNOWN.
- Legal sources are web-search summaries. ico.org.uk and law-firm sites could not be opened from this session (network). Commencement date of the DUAA PECR changes is UNKNOWN.
- GA4 last 1–2 days are preliminary. GA4 and Shopify define sessions differently; compare trends, not totals.
- Gmail send dates come from thread IDs (they encode the send time). Day totals match HQ exactly for 16–18 Nov, which supports the method.
- Meta pixel/CAPI health was not checked (account paused).
- Whether #1020 was refunded inside PayPal is UNKNOWN until the owner checks.

## Credits used

| Call | Tool | Credits |
|---|---|---|
| list_connections | OpenRush | 0 |
| describe_capabilities (to confirm cost) | OpenRush | 0 |
| get_website_analytics (channel, 28 days vs previous) | OpenRush | 3 |
| **Total this report** | | **3** (budget 10) |

Month total: 55 + 3 = **58 of 2,001**. Reserve of 400 untouched. Meta, Shopify, Gmail, Supermetrics discovery, HQ reads and web search cost no OpenRush credits.
