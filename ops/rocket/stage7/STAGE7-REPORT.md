# EAGLE BED — PROJECT ROCKET SALES / STAGE 7: CUSTOMER RECOVERY & TRADE SALES

Prepared 20 Nov 2026 by the Manager's report writer. It consolidates the four Stage 7 specialist reports and their 15 data files, the Stage 6 report (sections 25, 28, 29) and the Manager's verified notes. No new research was done for this report, apart from two read-only checks of the HQ `leads` collection (suppression flags and statuses).

- **Read-only.** Nothing was sent, drafted in Gmail or WhatsApp, switched on, published, imported, discounted or quoted. No customer or prospect was contacted. Nothing was committed.
- **No customer personal data.** Customers appear only as order numbers (#10xx), anonymised buyers (C001–C041) and anonymised enquiries (E001–E023). Trade prospects appear by business name only (B2B), never by a named person.
- **OpenRush:** this report used 0 credits. Stage 7 total is ≤8 credits (ESTIMATE 8); month ≤221 of 2,001; reserve untouched (section 23).
- **Costs and VAT stay PARKED by the owner.** No figure here is a profit, margin or £ forecast.

**Labels**

| Label | Meaning |
|---|---|
| **VERIFIED** | Pulled or checked live on 19–20 Nov from the named source, or verified by the Manager |
| **ESTIMATE** | A calculation or rule-based class, with the rule stated |
| **HYPOTHESIS** | An explanation that still needs testing |
| **UNKNOWN** | The data cannot be seen from here; never shown as 0 |
| **HISTORICAL** | A figure from an earlier stage or date |
| **RECOMMENDATION** | A proposal awaiting owner approval |

**Sources** (all in `ops/rocket/stage7/`)

| File | Contents | Specialists |
|---|---|---|
| `01-customers-recovery.md`, `customer-baseline.csv` (41), `returning-customer-segments.csv` (A–H), `abandoned-checkout-audit.csv` (21), `automation-status.csv` | Customer baseline, abandoned checkouts, automation, returning customers | Customer Finder, Analytics, Checkout Doctor, Email & SMS, Data Quality |
| `02-enquiries-aftercare-reviews.md`, `customer-enquiries.csv` (23), `enquiry-templates-v2.md`, `aftercare-register.csv` (8 cases + journey), `review-opportunities.csv` (43 orders) | Enquiries, reply speed, aftercare, reviews | Customer Care, Sales Closer, Reviews & Trust, Delivery & Returns, Quality Control |
| `03-trade.md`, `trade-market-research.csv` (12), `owner-trade-questions.md` (23 Q), `trade-page-draft.html`, `trade-page-requirements.csv` (32), `landlord-hmo-guide-draft.md`, `trade-lead-register.csv` (332) | Trade funnel, segments, trade page, landlord guide, pipeline | Lead Finder, Email Marketing, Sales Closer, Market Research, Content Creation, Theme Engineer |
| `04-compliance.md`, `compliance-assessment.csv` (29) | UK GDPR and PECR review | Decision Council, Verification |
| **New in this report:** `recovery-opportunities.csv` (20), `owner-approval-queue.csv` (41) | Consolidated from the files above | Manager's report writer |

---

## 1. Executive summary

1. **Five customers are waiting on us today, and a designer has been waiting since 18 Nov.**
   - E010 (made-to-measure Harlington Wingback) has had **no reply for 12 days**, after a chase. VERIFIED.
   - E011 (bespoke end-lift ottoman) was promised an itemised quote on 11 Nov; it is **8 days overdue** and they want delivery 27–30 Nov. VERIFIED.
   - E023 is ready to buy a Regal Gold-Trim-style bed with a side-opening ottoman and **found us through ChatGPT** (the first VERIFIED AI-assistant referral). Our replies gave no price.
   - E022 was promised the King base storage depth "within one working day"; that is **due today**.
   - E021, a Plymouth buyer, is waiting in Shopify Inbox.
   - **Ivywell Interiors** (Bristol designer, our only interested trade reply) was promised fabric metres per size "within one working day" on 17 Nov. **Overdue.** VERIFIED.
2. **A live reply gave the wrong WhatsApp number (07417 449197). The correct number is 07417 439197.** Other reply errors: an internal owner note sent to a customer, £50 cash assembly (list price £69.99), "Yes, we do" to a showroom question. VERIFIED.
3. **The "~45 abandoned checkouts a month" figure is withdrawn.** It counted visits that reached checkout. Shopify holds 21 abandoned checkouts in 73 days: 12 bots/tests, 1 no contact, 5 from 4 people who bought anyway, **3 real people who did not buy (about 1.2 a month)**, of whom **1 is subscribed (about 0.4 a month)**. VERIFIED counts / ESTIMATE rates.
4. **Whether the abandoned-checkout automation is Active is UNKNOWN.** The Admin API has no status field. The owner must read the badge (section 5). No order can be traced to an abandoned-checkout email. Recovery rate UNKNOWN.
5. **Customers:** 73 records, 41 with an order, 36 paying buyers; 38 paid orders = £15,393.59, AOV £405.09. Only 2 buyers have ordered twice (5.6%), both for a second bed. 24 of 33 bed/base orders went out without a mattress. VERIFIED.
6. **Reply speed has transformed; reply quality has not.** Median first reply was 17 days before 12 Nov and **1.5 hours since 12 Nov**. Many replies are one line and do not answer the question. VERIFIED.
7. **Aftercare:** order day → misleading "on the way" email → nothing. No delivered date after #1030. No assembly or gas-lift help on the site. 0 complaints in Gmail since 1 Oct. VERIFIED.
8. **Reviews:** 3 in total (all 5★, Judge.me), 0 replies; Google about 0 (ESTIMATE); no Trustpilot. A delivery-based, incentive-free review plan is ready for approval.
9. **Trade:** 332 prospects, 314 emailed, 15 hard bounces, 1 interested, 3 STOPs, **0 quotes, 0 orders, £0**. 251 of the 314 have no limited-company evidence. VERIFIED.
10. **`/pages/trade` returns 404 because it was never created.** A full draft (24 of 32 requirements ready) waits for approval and owner facts.
11. **Compliance:** cold email only to limited companies/LLPs/plcs/charitable companies/public bodies (now in the agent brief, Manager VERIFIED). **38 Shopify "subscribed" records may rest on a pre-ticked box (HYPOTHESIS)**, so all marketing to subscribers is provisional until Q2 is answered. Not legal advice.
12. **Done during Stage 7 by the Manager (VERIFIED 20 Nov 00:00–00:10):** trade-agent brief legal-form rule + privacy line + "same day" removed; Email Marketing scheduled task aligned; Clearpay removed from abandoned-checkout and swatch drafts; Square Lettings bounce marked doNotContact; 19 Nov daily report sent with the Google Ads card-declined alert. **Everything else is a proposal.**

### Key numbers

| Measure | Value | Label |
|---|---|---|
| Customer records / with an order / paying buyers | 73 / 41 / 36 | VERIFIED |
| Paid valid orders, revenue, AOV (13 Jul–18 Nov) | 38, £15,393.59, £405.09 (median £366.64) | VERIFIED |
| Returning buyers / repeat orders | 2 of 36 (5.6%) / 2 of 38 (5.3%) | VERIFIED |
| Abandoned checkouts held by Shopify (8 Sep–19 Nov) | 21 | VERIFIED |
| … real, not bought / of which subscribed | 3 (≈1.2/month) / 1 (≈0.4/month) | VERIFIED / ESTIMATE rate |
| Automation status / recovered orders / recovery rate | UNKNOWN / 0 visible / UNKNOWN | UNKNOWN |
| Genuine enquiries since 1 Oct | 23 | VERIFIED |
| Unanswered / waiting on us (pre-sale) | 1 / 5 | VERIFIED |
| Median first reply: all / before 12 Nov / since 12 Nov | 103.7 h / 407 h / 1.5 h | VERIFIED |
| Enquiry → order (pre-sale) | 3 of 16 (19%), 1 clearly caused by our reply | ESTIMATE |
| Reviews (all platforms seen) | 3 Judge.me, 5.0★, 0 replies | VERIFIED |
| Complaints / returns / damage in Gmail since 1 Oct | 0 (phone and WhatsApp UNKNOWN) | VERIFIED |
| Trade prospects / emailed / hard bounces / interested / STOP | 332 / 314 / 15 / 1 / 3 | VERIFIED |
| Trade quotes / orders / revenue | 0 / 0 / £0 | VERIFIED |
| Emailed leads without limited-company evidence | 251 of 314 | VERIFIED (HQ text) |
| Shopify "subscribed" (all single opt-in) / never ordered | 38 / 12 | VERIFIED |
| OpenRush, Stage 7 / month | ≤8 (ESTIMATE 8) / ≤221 of 2,001 | ESTIMATE (Manager) |

### Owner actions today (customers waiting)

1. **#1040:** send the Saturday 21 Nov delivery time slot this evening.
2. **#1043:** honour the £50 cash assembly written to the customer and note it on the order (recommended).
3. **E022:** give the King Gas Lift base storage depth, or send the holding line. Due today.
4. **E023:** say whether the ottoman can open from the side; send total price (delivery free; assembly £69.99 optional), 5-year frame warranty and product link.
5. **E010:** reply (T3-CUSTOM) — 12 days without an answer.
6. **E011:** send the itemised quote; their delivery window is 27–30 Nov.
7. **E021:** answer in Shopify Inbox: free delivery to South West England by our own team, day agreed by phone, ask for the move-in date.
8. **Ivywell Interiors:** answer trade Q1–Q3 so the overdue fabric reply (with the assembly correction) goes today.
9. **E002:** send one message with the correct WhatsApp number 07417 439197; check quick replies and signatures.
10. **Abandoned-checkout automation:** read the status badge and send the screenshots (section 5).
11. **Google Ads:** update the declined payment card.

---

## 2. Stage 6 continuity verification

| Stage 6 item | Stage 6 position | Stage 7 finding | Status | Label |
|---|---|---|---|---|
| S28 / OA02: abandoned checkout Active? | "Draft after 19 Nov edit; ~45 real abandoned checkouts a month" | API cannot read status; **~45/month withdrawn** (≈1.2 real, ≈0.4 eligible a month); copy drafts corrected (Clearpay removed by Manager) | OPEN – owner check | UNKNOWN status / VERIFIED counts |
| S28 / OA19: trade page 404 | Approve a trade page once terms exist | Cause found: **never created**; draft + 32 requirements ready | OPEN – approval + owner facts | VERIFIED |
| S28: landlord / HMO guide C13 | Build after C12 | Draft ready, 6 BLOCKED markers (incl. fire documents) | OPEN | VERIFIED |
| S28: trade evidence "292 emails, 1 interested" | HISTORICAL | **314 emailed** per HQ day docs (253 to 18 Nov + 61 on 19 Nov). The 292 figure and the compliance report's "292 + 61" do not reconcile with HQ; 314 is used here | Corrected | VERIFIED (HQ) |
| S28: aftercare / reviews | Aftercare page orphaned; 2 marked-up reviews | 3 reviews (1 store, 2 product); aftercare page orphaned and out of date; no assembly help | OPEN | VERIFIED |
| S28: returning customers "1 of 16 recent orders returning" | HISTORICAL | 2 of 36 buyers returning overall; box unticked since 19 Nov; pre-19 Nov consent questioned | Updated | VERIFIED |
| S29 OA04: GBP address visible | CLOSED | Workshop address used in trade page draft; home address never named | CLOSED | VERIFIED |
| S29 OA06: visiting rule | OPEN – one detail | Still OPEN; a live reply already said "Yes, we do" to a showroom question; trade page says nothing until answered (Q23) | OPEN | VERIFIED |
| S29 OA07: registered office | OPEN – owner/accountant | Not used anywhere in Stage 7 drafts | OPEN | VERIFIED |
| S29 OA01: links | CLOSED – monitor monthly | Not reopened | CLOSED | HISTORICAL |
| S25 OA17: 20-minute fact session | OPEN | Still blocks replies: storage depth, opening direction, strut rating, dimensions, trade terms | OPEN | VERIFIED |
| Stage 5 blockers (10) | All OPEN | Not re-tested in Stage 7; ottoman opening direction (F8) now blocks E023 | OPEN | HISTORICAL |
| Costs / VAT | PARKED | Not reopened | PARKED | VERIFIED |

---

## 3. Updated customer baseline

Source: Shopify Admin GraphQL, 19–20 Nov (`customer-baseline.csv`, `01` §1–5). VERIFIED unless marked.

| Measure | Value |
|---|---|
| Customer records | 73 |
| With ≥1 order (any status) / paying buyers | 41 / 36 |
| No order | 32 (7 bot/test, 5 suspected spam sign-ups, 3 real abandoned checkouts, 1 no-contact checkout, 1 duplicate record, 15 other sign-ups) |
| Orders #1001–#1043 | 43: 38 paid valid, 3 cancelled (#1010, #1014, #1020*), 2 refunded (#1001, #1006) |
| Revenue / AOV / median | £15,393.59 / £405.09 / £366.64 (incl. VAT and add-ons) |
| November 1–18 | 13 orders, £6,080.89, AOV £467.76 (highest month) |
| Returning buyers | 2 (C002, C026), both buying a second bed of the same type |
| Highest lifetime value | C026, £1,169.96 (2 orders) |
| Mattress attached | 9 of 33 bed/base orders (27%) |
| Assembly paid | 7 of 38 orders |
| EAGLE10 used | 24 of 38 (history only; no new discounts) |
| Delivered date confirmed | 1 order (#1038, 17 Nov, owner) — "fulfilled" is not "delivered" |

*#1020 is cancelled but shows PAID with £0 refunded; Stage 1 Q13 still open.

**First-visit source of 36 paying buyers:** no journey data 10, Google Ads PMax 8, Google free listings 7, direct 6, Facebook paid 2, Google organic 1, ChatGPT 1, Temu 1. **No order shows an email source.**

**Segments A–H** (`returning-customer-segments.csv`): A first-time 34 (19 subscribed); B returning 2; C fulfilled 36 (delivered UNKNOWN); D open enquiries 6; E aftercare window 16; F real abandoned checkout 3 (1 subscribed); G trade enquiries 1 company; H do-not-market 19 records.

---

## 4. Abandoned-checkout audit (correcting the ~45/month estimate)

**Shopify returns 21 abandoned checkouts, all created 8 Sep–19 Nov (73 days).** None exist for July–7 Sep; whether purged or never created is UNKNOWN. VERIFIED (`abandoned-checkout-audit.csv`).

| Class | Checkouts | People | Note |
|---|---|---|---|
| Bot / test | 12 | 7 records | 6 fictional-name protonmail patterns; 1 throwaway plus-address with 6 checkouts in pairs |
| No contact | 1 | 1 | £503.97; possibly bought as #1041 (HYPOTHESIS) |
| Bought (later or just before) | 5 | 4 | #1016, #1022 (checkout 5 min **after** the order), #1034, #1035 |
| **Real, not bought** | **3** | **3** | £994.06 in total |

| Real, not bought | Date | Product | Value | Subscribed | Automation-eligible |
|---|---|---|---|---|---|
| 68424854274379 | 19 Sep | Side Lift Ottoman Storage Base, Double | £256.50 | No | No (and 2 months old) |
| 69141680685387 | 12 Nov | Ottoman Gas Lift Divan Base, Small Double | £228.60 | **Yes** | **Yes** — whether emailed UNKNOWN |
| 69333410021707 | 19 Nov | Grand Extra-Tall Panel Bed, Double | £508.96 | No | No |

**Why "~45/month" was wrong.** It was human sessions that reached checkout minus completed (ShopifyQL: Aug 17→7, Sep 14→2, Oct 25→7, Nov 49→9). Most of those sessions never type an email, so no checkout is saved and nobody can be contacted.

**Corrected figure:** about **1.2 real contactable abandoners a month** and **0.4 automation-eligible (subscribed) a month**. VERIFIED counts / ESTIMATE rate. The Stage 1 estimate of about 1 recovered order (£430) a month is **withdrawn**. Correction to Stage 1: the 17 Nov "real bed" checkout matches the bot pattern.

**Recovered orders = 0 visible.** 33 of 43 orders have journey data; none shows an abandoned-cart or Shopify Email UTM. The 3 historic automation sends (Sep–Oct) most likely went to 3 people who bought anyway (HYPOTHESIS). Recovery rate UNKNOWN.

---

## 5. Automation status (UNKNOWN + exact owner check + recommended configuration)

**Status: UNKNOWN (not Draft, not Active).** `marketingActivities` returns 0 records; the Admin API (2026-10) has no automation status field. Marketing event "Your bed is saved in your basket" (Shopify Email) started 11 Feb 11:51 with no end date — an open event does not prove the workflow is Active. The old "Abandoned checkout emails by Shopify" event ended 2 minutes after it started, so the old Settings email is probably OFF (ESTIMATE). Owner edited the workflow on 19 Nov; the editor warned it reverts to Draft; reactivation not confirmed. HISTORICAL performance: 3 sends Sep–Oct, 1 click, 0 orders.

**Exact owner check (2 minutes, screenshots):**
1. Shopify admin → **Marketing** (or **Messaging**) → **Automations** → row **"Recover abandoned checkout"**. Read the **status badge** (Active / Draft / Paused). Screenshot the row.
2. Open it. Screenshot the workflow and note the first **Wait** time, whether a second email exists, and the audience condition ("subscribed to email marketing").
3. Open the email(s). Confirm the live copy has **no "Clearpay"** (Manager removed it from the repo drafts; the live Shopify copy is not verified). If Draft/Paused, fix copy first, then **Turn on**. Screenshot again.
4. **Settings → Notifications → Customer notifications → Abandoned checkout:** confirm it is managed by the automation or "send automatically" is OFF (avoids duplicate sends). Screenshot.
5. Automation report, last 90 days (sends, sessions, orders). Screenshot.

**Recommended configuration (RECOMMENDATION, not applied):**

| Setting | Recommendation |
|---|---|
| Trigger | Customer abandons checkout (email entered, no order) |
| Email 1 | 1 hour: "Your bed is saved" |
| Email 2 | 24 hours, only if still no order: "Questions answered" — "card, PayPal or Klarna"; assembly "+£69.99, optional"; no Clearpay |
| Audience | Subscribed to email marketing only. No soft-opt-in extension until compliance Q1 and Q2 are answered |
| Purchaser exclusion | Add "no order in the last 1 day" if offered; always check for a later order before any manual contact |
| Discounts / urgency | None |
| UTM | Non-checkout links only: `utm_source=shopify-email&utm_medium=email&utm_campaign=ao-abandoned-checkout` |
| Measure | Recovered orders ÷ automation-eligible checkouts per month (expect 0–2 eligible) |
| Bot noise | Turn on checkout bot protection (12 of 21 checkouts are bots) |

---

## 6. Customer enquiry analysis

**23 genuine enquiries since 1 Oct** (`customer-enquiries.csv`). VERIFIED.

| By channel | Count |
|---|---|
| Email (incl. 1 trade reply) | 19 |
| Contact form | 1 (E007, likely scam) |
| Shopify Inbox | 3 (E013, E016 content UNKNOWN; E021) |
| WhatsApp forwards | 0 visible (chats UNKNOWN) |
| Phone | UNKNOWN |

| Class | Count | IDs |
|---|---|---|
| 1 Ready to purchase | 1 | E023 |
| 2 Price / quote | 1 | E011 |
| 3 Configuration (size, dimensions, fabric, swatches, height) | 12 | E001–E006, E008, E010, E012, E014, E015, E022 |
| 4 Delivery | 4 | E007, E017, E019, E021 |
| 5 Assembly | 1 | E020 |
| 6 Trade | 1 | E018 (Ivywell Interiors) |
| 7 Aftercare / 8 Complaint | 0 / 0 | – |
| 9 General | 3 | E009, E013, E016 |

**Objections (what stops people buying):** missing measurements (5), fabric colour / swatches (6), custom builds not shown on site (4), delivery day / area clarity (3), price not given for custom work (2), assembly price/placement/old-bed removal (3), trust (warranty, photos, visiting) (3), slow or one-line replies (8). VERIFIED.

**Conversion (ESTIMATE, small sample):** 3 of 16 pre-sale enquiries ordered (19%): E001 → #1022 and E005 → #1029 ordered before our reply; **only E012 → #1043 clearly followed our reply** (swatches). Closed 28-day window: 1 of 4. Lost-likely after late, incomplete answers: E002, E003, E004, E006, E008.

---

## 7. Customer-service performance

| Group | n | Median first reply | Range |
|---|---|---|---|
| All measurable | 19 | 103.7 h (4.3 days) | 11 min – 41 days |
| Received before 12 Nov | 10 | 407 h (17 days) | all cleared in one batch on 11 Nov |
| Received from 12 Nov | 9 | **1.5 h** | 11 min – 4.3 days |
| Not measurable | 4 | – | E010 no reply (12 days); E013, E016, E021 in Shopify Inbox |

VERIFIED.

**Waiting on us now (20 Nov):**

| ID | Since | Need | Priority |
|---|---|---|---|
| E010 | 7 Nov | Made-to-measure 6ft × 6ft Harlington Wingback with front-lift ottoman: can we, price, lead time. **No reply** | P0 |
| E011 | 10 Nov | Itemised quote (base, headboard, mattress, delivery, assembly £69.99); fit 140 × 190 cm external; delivery 27–30 Nov | P0 |
| E021 | 19 Nov | Plymouth: free delivery by our team? how is the day agreed? | P0 |
| E022 | 19 Nov | King base height (14 in) and storage depth — promised today | P0 |
| E023 | 19 Nov | Total price, side-opening (BLOCKED), easy-clean swatches, warranty, photos, product link | P0 |
| E008 | 29 Oct | Cloud Teddy with drawers; headboard fixing; 15 swatches. Reply was "Sure" | P2 |
| E019 / #1040 | 18 Nov | Time slot for Sat 21 Nov, due this evening | P0 |
| E020 / #1043 | 18 Nov | Owner decision on £50 assembly | P0 |
| E013, E016 | 12, 15 Nov | Content UNKNOWN — open Shopify Inbox | P1 |
| E014 | 12 Nov | Confirm swatches posted; one follow-up | P2 |

**Reply accuracy incidents (VERIFIED, live mail):** wrong WhatsApp number 07417 449197 (E002); "Yes, we do" to visiting before the rule is set (E009); "our own team delivers and assembles" with no price (E011, Ivywell); £50 cash assembly (E020); an internal owner note sent to a customer (E017). **Fix:** `enquiry-templates-v2.md` — 9 classes, holding lines for every unknown, and a 7-point safe-to-send rule (no brackets/placeholders, BRIEF facts only, answer every question, check the phone number is 07417 439197, no internal notes).

---

## 8. Aftercare audit

**Journey today (VERIFIED):**

| Step | What happens | Problem |
|---|---|---|
| Order confirmation | Shopify default | No "made to order" or how delivery is agreed |
| "Fulfilled" + "on the way" | Within hours (16 of last 18 orders within 6 h) | Misleading; caused chasers E017, E019 |
| Dispatch update / delivery confirmation | None | No delivered date after #1030 |
| Aftercare page | Live but orphaned (8 GSC clicks in 90 days); says reviews are not shown; names Clearpay; promises 2-day reply (returns page says 24 h) | Out of date |
| Assembly / gas-lift help | None; `/pages/assembly*` 404 | 260 + 90 monthly searches find nothing of ours |
| Warranty | 5-year frame; "mattresses may carry different terms"; struts not mentioned | Conflicts with BRIEF "mattresses: 5-year guarantee" |
| Review request | Judge.me about 14 days after fulfilment (ESTIMATE) | May arrive before delivery |
| Complaints / returns / damage | 0 in Gmail since 1 Oct | Phone/WhatsApp UNKNOWN |

**Proposed journey (RECOMMENDATION):** J1 order confirmation with made-to-order and "we will call to agree a delivery day"; J2 fulfil only when the van leaves, edited shipping email with no fake tracking; J3 mark delivered on the day (10 seconds); J4 Delivered email links the fixed aftercare page (gas-lift part BLOCKED until strut facts); J5 review request Delivered + 5 days, one reminder; J6 product news only to valid subscribers.

**Open cases:** AC01 #1043 assembly decision; AC02 #1040 slot today; AC03 #1038 mark delivered; AC04 E022 promise; AC05 #1031–#1042 delivered dates; AC06 #1022 DPD; AC07 0 complaints; AC08 no gas-lift help.

---

## 9. Review acquisition plan

**Now (VERIFIED):** 3 Judge.me reviews, all 5★, all store-invitation "Verified", 0 replies, 0 photos. Store 1, Side Lift 1, Cambridge 1. Best sellers with none: Ottoman Gas Lift Divan Base (7 orders), Cloud Teddy, Savoy, Royal Chesterfield, Regal Gold-Trim. Google about 0 (ESTIMATE). Trustpilot: no profile.

**Plan (RECOMMENDATION):**

| Rule | Detail |
|---|---|
| Eligible | Only orders the owner has marked delivered, with the real date |
| Timing | Delivered + 5 days; one reminder at +7 days; nothing more |
| One platform per customer | Judge.me by default (product evidence); Google only where Judge.me can exclude the order (exclusion option UNKNOWN) |
| Priority products | Ottoman Gas Lift Divan Base, Side Lift, Cloud Teddy, Savoy |
| Already asked | The 24 customers asked for a Google review on 10 Nov are **not asked again** |
| No incentives / no gating | No discount, gift or entry; never "were you happy?" first |
| Publish everything | Auto-publish all ratings; remove only abuse, personal data, spam (logged) |
| Respond | Reply to every ≤3★ within 2 working days after phoning; reply to the 3 existing reviews now |
| Verified label | Make "Write a review" verified-buyers-only, or change our page text |
| Show | Stars only on products with 1+ review; no site-wide rating until 10+ |

**Pipeline:** #1038 eligible from 22 Nov (Judge.me). #1034, #1035, #1036, #1039, #1041, #1042 after delivery is confirmed; #1040 after 21 Nov (no email on order — only with consent); #1043 after delivery and the assembly decision; #1037, #1007 have no email. **Expectation:** about 2–3 genuine reviews a month, about 10 by end of February (ESTIMATE).

---

## 10. Returning customer opportunities (consent gate)

**Consent gate (Q2): pre-19 Nov subscriptions may be invalid.** 38 of 73 records are "subscribed", 26 buyers and 12 who never ordered, all single opt-in. A 58% rate fits a checkout box that was pre-ticked before the 19 Nov fix (HYPOTHESIS). If so, those consents are invalid; past buyers might instead fall under the soft opt-in (professional to confirm). **Until Q2 is answered, no marketing email to any subscriber except the existing automation, and every list below is provisional.**

| Opportunity | Customers | Ready? |
|---|---|---|
| Matching mattress for a bed/base bought without one | 9 subscribed (C002, C004, C008, C015, C020, C028, C030, C033, C036); 5 past aftercare | After Q2; after aftercare/delivery |
| Headboard for a base bought without one | 8 subscribed | After Q2 **and** owner confirms headboard fit (UNKNOWN) |
| Base or frame for mattress-only buyers | C010, C022, C023 | Weakest (HYPOTHESIS: already own a bed) |
| Thank-you / "another room?" | Returning C002, C026 | After aftercare, owner's own message |

**Rules:** exact size match only; standalone mattress price (option price is lower — never call it a saving); one plain email per customer, no discount, no urgency, stop on reply; exclude #1040 and #1043 (open issues), refunded/cancelled buyers, the Temu buyer, and the 14 not-subscribed buyers (service messages only). Check gas-strut suitability before suggesting heavy mattresses on gas-lift bases (HYPOTHESIS).

---

## 11. Trade market intelligence

**Funnel 10–20 Nov (VERIFIED, HQ + Gmail):** 332 prospects → 314 emailed (253 to 18 Nov + 61 on 19 Nov) → 15 hard bounces (4.8%) → ≈299 delivered (ESTIMATE) → 4 human replies (1 interested, 3 STOP) → **0 quotes, 0 orders, £0**. 18 never contacted (phone/website only). At least 5 auto-replies.

**19 Nov run (limited companies only):** 61 sent, 61 with Ltd/LLP evidence recorded in HQ (not re-checked at Companies House), 1 hard bounce (Square Lettings, now doNotContact — Manager VERIFIED), 1 auto-reply, 0 human replies after about a day (too early). 8 of the 61 went to independent hotels against Stage 1's "pause" advice; hotels are now excluded in the scheduled-task prompt (Manager VERIFIED).

**Search demand (OpenRush UK, 19 Nov, VERIFIED volumes):** "beds for rent" 390 (mixed intent), "hmo compliant" 90 (informational), "landlord beds" 30; "contract beds" / "hotel contract beds" 880 each but **not usable** (no contract/hotel claims). "hmo beds", "hmo furniture", "trade beds": UNKNOWN (not 0). **Conclusion:** trade search demand is small; the trade page is a landing place for referrals, replies and GBP visitors, not a traffic engine.

**Fire documents:** landlords and agents letting furnished homes must supply beds, headboards and mattresses meeting the 1988 Furniture and Furnishings (Fire) (Safety) Regulations; mattresses/bases are tested to BS 7177; headboards generally need a permanent label. **Eagle Bed has no fire documents on file**, so nothing may claim compliance (Q17–19). General information, not legal advice.

---

## 12. Trade customer segmentation

| Segment | Prospects | Emailed | Bounced | STOP | Interested | Suitability | Channel |
|---|---|---|---|---|---|---|---|
| Interior designers | 23 | 22 | 1 | 0 | **1** | **High** | Inbound + warm replies; COM accepted |
| Letting agents | 92 | 85 | 1 | 0 | 0 | Medium (fix the offer) | Trade page + landlord referral sheet |
| Landlords | 18 | 17 | 1 | 0 | 0 | Medium | Inbound only (many sole traders) |
| HMO operators / agents | 13 | 11 | 1 | 0 | 0 | Medium, **blocked on fire docs** | Inbound (trade page + C13) |
| Home stagers | 7 | 7 | 0 | 0 | 0 | Medium | Inbound |
| Property managers | 7 | 7 | 0 | 0 | 0 | Medium-low | Inbound |
| Developers (show homes) | 8 | 8 | 0 | 0 | 0 | Medium-low | Via designers |
| Holiday lets | 45 | 44 | 1 | 1 | 0 | Low (pause cold email) | Inbound only |
| Serviced accommodation | 29 | 26 | 4 | 0 | 0 | Low | Do not prioritise |
| Small hotels / guest houses / B&Bs | 67 | 66 | 6 | 2 | 0 | Low (excluded) | Inbound only |
| Care homes | 20 | 19 | 0 | 0 | 0 | Hold | Do not promote |
| Furniture-pack firms | 3 | 2 | 0 | 0 | 0 | Owner decision | Partner or competitor |
| **Total** | **332** | **314** | **15** | **3** | **1** | | |

VERIFIED counts; suitability is ESTIMATE. Products by segment: lets/HMOs — Divan Storage Base with Drawers (from £168.99, no-drawers default; quote drawers separately), Ottoman Gas Lift Divan Base (£220.99), Side Lift (£249.99), 1000/3000 Pocket Sprung mattresses; designers/stagers — Mayfair, Chelsea, Fluted Velvet, Savoy, Royal Chesterfield, Harlington, headboards; holiday lets — Hampton, Windsor Chesterfield, 2000 Pillow Top. Never offer "Memory Orthopaedic".

---

## 13. Trade-page requirements (why 404: never created)

**`/pages/trade` returns 404 because the page was never created.** VERIFIED: no page with handle `trade` among all 83 pages (published or not); no redirect; no menu item; no link in site HTML, emails, templates or WhatsApp replies; no CHANGELOG entry; the path first appears in the repo in the Stage 6 reports. A deletion before September cannot be fully ruled out (Admin API does not list deleted pages), but nothing suggests one.

**Draft:** `trade-page-draft.html` — 12 sections (intro, who we work with, what we make, landlords/HMOs, holiday lets, designers, sizes, delivery, enquiry form, how a quote works, contact, FAQ). BRIEF facts only. Not on the page: trade prices or discounts, minimum order, multi-bed lead times, VAT invoice/number, payment terms, trade returns, workshop visits, registered office, any fire-safety, hotel, contract or care wording, hard-coded prices.

**Form:** business name, business type (10), contact name, business email, phone (optional), requirements, quantity (1–999), postcode area (first half only), timeframe, notes; privacy line; separate **unticked** trade-news box; hidden tags `trade,trade-page`; Liquid `{% form 'contact' %}` on an unpublished theme copy so Shopify bot protection applies; GA4 `generate_lead` only on success. Route: Shopify contact → Gmail → Inbox agent → HQ `leads` (stage New) → owner alert.

**Requirements (`trade-page-requirements.csv`):** 32 rows, **24 READY, 8 BLOCKED** (R08 trade price wording, R12 rental products, R13 guide link, R14 multi-address delivery, R17 trade warranty/returns, R26 quote SLA, R27 payment terms, R29 VAT invoice). Owner approval: S7-OA19 (Stage 6 OA19).

---

## 14. Landlord / HMO opportunity

- **Demand:** small and mostly informational (section 11). AI answers for "beds for HMO" name contract specialists (Stage 6 Q12). HYPOTHESIS: an honest checklist plus a trade route can win occasional inbound landlord enquiries.
- **Products that fit:** storage divans and ottomans plus mattresses; 300 kg capacity; 5-year frame warranty.
- **Blocker:** no fire labels or certificates on file. Landlords and agents will ask. Until Q17–19 are answered, the guide gives only "five questions to ask any supplier" and the trade FAQ says "tell us which documents you need".
- **Draft:** `landlord-hmo-guide-draft.md` (C13): room sizes (6.51 m² one-person HMO minimum in England, sourced), storage, wear, replacement planning, delivery to several properties, fire questions, checklist. 6 BLOCKED markers. **Publish only after the trade page.**
- **Channel:** inbound only — many landlords and HMO operators are sole traders (no cold email).

---

## 15. Trade lead management (stages on existing HQ leads)

No new CRM. Pipeline fields are added to the existing HQ `leads` docs (RECOMMENDATION).

| Stage | Meaning |
|---|---|
| New | Inbound enquiry or interested reply |
| Qualified | Type, products, quantity, postcode area, timeframe known (within 1 working day) |
| Awaiting information | `waitingOn` = us / buyer / owner |
| Quote requested → Quote prepared → Quote sent | Sent sets `followUpDue` +3 working days |
| Follow-up due | Day 3 and day 7, then stop |
| Negotiation | Buyer asks for changes |
| Won / Lost / Not suitable | `wonOrder`, `lostReason` |

New fields: `stage`, `stageAt`, `segment`, `channel`, `legalForm`/`legalFormSource`, `lawfulBasis` (pecr-corporate / consent / inbound-enquiry / unknown-do-not-email), `marketingConsent`/`consentAt`, `waitingOn`, `requirements`, `quoteRef`, `quoteSentAt`, `quoteValueExVat`, `quoteValidUntil`, `followUpDue`, `followUps`, `wonOrder`, `lostReason`, `nextAction`, `nextActionDue`, `assignee`, `retentionReviewAt`.

**Mapping today (`trade-lead-register.csv`, 332):** Ivywell → Awaiting information (waitingOn us); 295 contacted → no stage (outreach only; **not** "New", which would fake a pipeline); 15 hard bounces + 3 STOPs → Not suitable; 18 never contacted → no stage. Lawful basis: 63 pecr-corporate, 251 unknown-do-not-email, 18 phone-only.

**HQ suppression today (VERIFIED, HQ read 20 Nov):** `status` bounced 14 (incl. Square Lettings) and "not interested" 3; `doNotContact: true` on only 5 docs. The Brighton agency bounce is still "contacted" (ESTIMATE from 03). Bounce suppression therefore relies on status, not the flag.

**Quote process and SLA (RECOMMENDATION; Q22 decides the customer promise):** acknowledge and qualify within 1 working day → owner prices within 2 working days of Qualified → quote email (lines, options, delivery, total incl. and ex VAT, validity, payment terms, lead time, returns — last four BLOCKED; "ABBAS TRADE LTD trading as Eagle Bed, company 16410472"; no fire claims) → follow-ups day 3 and 7 on the same thread → Won/Lost (no reply 14 days after quote). Monday review of every next action.

---

## 16. UK GDPR & PECR assessment (not legal advice)

**This is a plain-English operating summary, not legal advice.** ICO pages were seen only through search extracts.

| Rule | Meaning for Eagle Bed |
|---|---|
| Corporate subscribers (Ltd, LLP, plc, Scottish partnership, some public bodies) | Cold B2B email allowed without consent: identify ourselves, valid opt-out, honest content, LIA, privacy info |
| Individual subscribers (sole traders, ordinary partnerships, unincorporated bodies) | Marketing email/SMS needs prior consent; cold prospects cannot use the soft opt-in |
| Unknown legal form | Treat as a sole trader: no email |
| Service messages (order, delivery, aftercare, answers) | No consent needed if there is no promotion |
| Review requests | Service if neutral wording (professional to confirm, Q5) |
| Abandoned checkout | Treated as marketing: valid consent only (soft opt-in for checkouts disputed, Q1) |
| Fines | PECR fines at UK GDPR level since 5 Feb 2026 (up to £17.5m / 4%) |
| Complaints procedure | Required from 19 Jun 2026 (30-day acknowledgement) |

**Risks (`compliance-assessment.csv`, 29 activities):** High — earlier batches to likely sole traders/partnerships (C13). Medium — pre-19 Nov consents, unknown legal form of 251 leads, no suppression list across channels, no retention rule, no B2B privacy section, cookies/pixels consent UNKNOWN, misleading-claim history (free assembly, Clearpay).

**Already fixed (Manager VERIFIED 20 Nov):** legal-form rule and privacy line in the trade-agent brief; scheduled task excludes sole traders, partnerships, B&Bs, guest houses, hotels, care homes; bounces → doNotContact, replies → tradeStage New; Clearpay removed from drafts.

**Still to approve:** HQ `suppression` collection (hashed), retention schedule, trade form privacy wording, B2B privacy-policy section, LIA sign-off, Companies House check of 251 leads (no apology email).

**Escalate to a data-protection professional:**
1. Q1 — Can an abandoned checkout count as "negotiations for a sale" for the soft opt-in?
2. Q2 — Was the box pre-ticked before 19 Nov; are those consents invalid; can buyers be marketed under the soft opt-in?
3. Q3 — Is "Companies House / Charity Commission / public body only" an adequate screen; is a CIO corporate?
4. Q4 — Is suppress + no further contact + internal record enough remediation for pre-19 Nov sends?
5. Q5 — Are neutral review requests service messages?
6. Q6 — Does the privacy policy meet Art. 13/14 for B2B and include the DUAA complaints procedure?
7. Q7 — Do ad pixels wait for consent; does any analytics fit the new statistics exemption?
8. Q8 — Is ABBAS TRADE LTD registered with the ICO (fee)? UNKNOWN.

---

## 17. Customer recovery dashboard (definitions A–D, F)

Written to HQ `customers/stage7` (section 24 notes the card). Every unknown is `null`, never 0.

| Card | Metric | Definition | Value 20 Nov | Label |
|---|---|---|---|---|
| A Customers | total | Shopify customer records | 73 | VERIFIED |
| | withOrders / paidCustomers | ≥1 order any status / ≥1 paid, not cancelled or refunded | 41 / 36 | VERIFIED |
| | returning / repeatOrders | buyers with 2+ paid orders / paid orders that are a 2nd+ | 2 / 2 | VERIFIED |
| | revenuePaid / aov | sum of paid valid order totals incl. VAT / ÷ orders | £15,393.59 / £405.09 | VERIFIED |
| B Abandoned | checkouts | Shopify `abandonedCheckouts` in window | 21 | VERIFIED |
| | botsOrTests / boughtLater / realNotBought | pattern classes; same person ordered; real contact, no order | 12 / 5 / 3 | VERIFIED (pattern ESTIMATE) |
| | eligibleSubscribed | real, not bought, subscribed | 1 | VERIFIED |
| | automationStatus | owner badge | "UNKNOWN – owner check" | UNKNOWN |
| | recovered / recoveryRate | orders with abandoned-checkout attribution ÷ eligible | null / null | UNKNOWN |
| C Enquiries | total / unanswered / waitingOnUs | genuine enquiries since 1 Oct / no reply / ball with us (pre-sale) | 23 / 1 / 5 | VERIFIED |
| | medianFirstReplyHours / medianSince12Nov | first human reply in thread | 103.7 / 1.5 | VERIFIED |
| | conversion | pre-sale enquirer later ordered ÷ pre-sale enquiries | 3/16 (19%) | ESTIMATE |
| D Reviews | totalReviews / avgRating / productsWithReviews | published Judge.me reviews | 3 / 5.0 / 2 (+1 store) | VERIFIED |
| | eligibleAfterDelivery | orders that become eligible once delivered | 9 (#1038 from 22 Nov) | VERIFIED |
| | complaintsOpen | complaints/returns/damage threads open (Gmail) | 0 (phone/WhatsApp UNKNOWN) | VERIFIED |
| F Compliance | subscribed / singleOptIn | Shopify email marketing state | 38 / 38 | VERIFIED |
| | preFixConsentRisk | subscribed before 19 Nov (all) | 38 (12 never ordered) | VERIFIED count / HYPOTHESIS risk |
| | suppressionCount | HQ leads with status bounced or not interested | 17 (doNotContact flag on 5) | VERIFIED |
| | retentionPolicy | | "proposed" | RECOMMENDATION |

---

## 18. Trade sales dashboard (E)

| Metric | Definition | Value | Label |
|---|---|---|---|
| leads | HQ `leads` docs | 332 | VERIFIED |
| emailed | docs with `emailedAt` (= day docs 314) | 314 | VERIFIED |
| delivered | emailed − hard bounces (no receipts) | 299 | ESTIMATE |
| bounced | hard bounces (Gmail) | 15 | VERIFIED |
| replies | human replies (excl. auto-replies) | 4 | VERIFIED |
| interested | replies asking about buying | 1 | VERIFIED |
| quotes / orders / revenue | | 0 / 0 / £0 | VERIFIED |
| stagesInUse | HQ statuses now: contacted 297, new 18, bounced 14, not interested 3, replied 1 (pipeline stages proposed, not yet in use) | – | VERIFIED (HQ read) |

Weekly additions once the page and pipeline exist: trade-page sessions, form submissions (`generate_lead` on success), time to qualify, time to quote, quote → won rate, STOP rate per segment (stop the segment above 2%).

---

## 19. Top 20 opportunities

Full detail: **`recovery-opportunities.csv`** (evidence, target, problem, action, direction of impact, agents, integrations, compliance, approval, success measure). Ranked by customers already waiting first, then by reach and dependency. No £ forecasts.

| # | Opportunity | Stream | Direction | Approval |
|---|---|---|---|---|
| RO01 | Clear the five customers waiting on us today | Recovery | Up | Owner facts |
| RO02 | Ivywell: overdue COM reply with assembly correction | Trade | Up | Q1–Q3 |
| RO03 | Confirm abandoned-checkout automation Active with corrected copy | Recovery | Up, very small | Owner check |
| RO04 | Safe-to-send rule; correct WhatsApp number | Recovery | Up | Owner |
| RO05 | Fulfil on dispatch, mark delivered on delivery | Recovery | Up | Owner |
| RO06 | Back-fill delivered dates #1031–#1042, #1038 | Recovery | Up | Owner |
| RO07 | Judge.me Delivered + 5; reply to 3 reviews | Recovery | Up | Owner |
| RO08 | First reviews on best sellers with none | Recovery | Up | Owner |
| RO09 | Route Shopify Inbox chats into HQ | Recovery | Up | Owner |
| RO10 | Create /pages/trade | Trade | Up | OA19 |
| RO11 | Owner trade facts session | Trade | Up | Owner |
| RO12 | Pipeline stages on HQ leads | Trade | Up | Owner |
| RO13 | Companies House check of 251 leads | Trade | Down on risk | Owner |
| RO14 | Suppression list, LIA, retention | Trade | Down on risk | Owner |
| RO15 | Settle consent question Q2 | Recovery | Down on risk; unlocks RO16 | Owner + professional |
| RO16 | Matching mattress for 9 subscribed buyers | Recovery | Up, small | After Q2 |
| RO17 | Headboard compatibility facts | Recovery | Up, small | Owner |
| RO18 | Owner-measured dimensions on product pages | Recovery | Up | Owner |
| RO19 | Aftercare page fix + gas-lift help | Recovery | Up | Owner |
| RO20 | Landlord/HMO guide after trade page and fire answers | Trade | Up, small | Owner |

---

## 20. Top 20 problems

| # | Problem | Evidence | Severity | Label |
|---|---|---|---|---|
| 1 | Customers waiting on us (E010, E011, E021, E022, E023) | 12 days, 8 days overdue, promises due today | P0 | VERIFIED |
| 2 | Ivywell COM reply overdue | Promised 17 Nov | P0 | VERIFIED |
| 3 | Wrong WhatsApp number in a live reply | 07417 449197 vs 07417 439197 | P0 | VERIFIED |
| 4 | Google Ads card declined | 19 Nov daily report | P0 | VERIFIED (Manager) |
| 5 | Abandoned-checkout automation status unknown | No API field; possible Draft | P0 | UNKNOWN |
| 6 | Off-list prices and internal notes in replies | £50 assembly; note sent to customer | P1 | VERIFIED |
| 7 | "Free assembly" implied to trade (13 Nov cold email, Ivywell reply, E011) | Assembly is £69.99 optional | P1 | VERIFIED |
| 8 | Misleading "on the way" email on order day | 16 of 18 fulfilled within 6 h | P1 | VERIFIED |
| 9 | No delivered dates since #1030 | Reviews and claims have no data | P1 | VERIFIED |
| 10 | Review requests can precede delivery | Judge.me ~14 days after fulfilment | P1 | ESTIMATE |
| 11 | Pre-19 Nov marketing consents possibly invalid | 38 single opt-in; 12 non-buyers | P1 | HYPOTHESIS |
| 12 | 251 emailed leads with unknown legal form | No Companies House evidence | P1 | VERIFIED |
| 13 | Suppression relies on status; doNotContact flag on 5 docs; Brighton bounce unmarked | HQ read | P1 | VERIFIED / ESTIMATE |
| 14 | No trade pricing basis, payment terms or lead times | 0 quotes possible | P1 | VERIFIED |
| 15 | /pages/trade never created | 404 | P1 | VERIFIED |
| 16 | No fire documents on file | Landlord/HMO segment blocked | P1 | UNKNOWN (owner) |
| 17 | Shopify Inbox chats invisible to HQ | E013, E016 UNKNOWN | P2 | VERIFIED |
| 18 | Product dimensions missing | Top objection | P2 | VERIFIED |
| 19 | Aftercare page out of date; no assembly/gas-lift help | Clearpay, "no reviews" | P2 | VERIFIED |
| 20 | Bot checkouts pollute data | 12 of 21 | P2 | VERIFIED |

---

## 21. Owner approval queue

Full queue: **`owner-approval-queue.csv`** — **41 items: 11 P0, 18 P1, 9 P2, 3 P3**, each answerable YES or NO. P0 and main P1:

| ID | P | Decision (YES / NO) |
|---|---|---|
| S7-OA01 | P0 | Will you send the #1040 time slot for Sat 21 Nov this evening? |
| S7-OA02 | P0 | Will you honour the £50 cash assembly written for #1043 and note it on the order? |
| S7-OA03 | P0 | Will you reply today to E010 (made to measure, 12 days unanswered)? |
| S7-OA04 | P0 | Will you send E011 the itemised quote today (delivery wanted 27–30 Nov)? |
| S7-OA05 | P0 | Can the Regal Gold-Trim ottoman open from the side (E023), and will you reply today with price, warranty and link? |
| S7-OA06 | P0 | Will you give the King base storage depth today (E022), or approve the holding line? |
| S7-OA07 | P0 | Will you answer the Plymouth buyer (E021) in Shopify Inbox today? |
| S7-OA08 | P0 | Will you answer trade Q1–Q3 so Ivywell gets its reply today? |
| S7-OA09 | P0 | Will you check the abandoned-checkout status badge and send the 5 screenshots? |
| S7-OA10 | P0 | Will you send E002 the correct WhatsApp number and check quick replies? |
| S7-OA11 | P0 | Will you update the Google Ads payment card today? |
| S7-OA12 | P1 | Do you approve the recommended abandoned-checkout configuration? |
| S7-OA13 | P1 | Will you mark delivered dates for #1031–#1042 by 23 Nov? |
| S7-OA14 | P1 | Do you approve fulfil-on-dispatch and the edited notifications (J1–J3)? |
| S7-OA15/16 | P1 | Do you approve the Judge.me changes and the review rules? |
| S7-OA17 | P1 | Will you give the five reply facts (storage depth, opening, visiting, removal, struts)? |
| S7-OA19 | P1 | Do you approve creating /pages/trade from the draft? |
| S7-OA20–24 | P1 | Trade facts Q4–16/20–21; "next working day" quotes; visiting wording; fire Q17–19; pipeline fields |
| S7-OA25–29 | P1 | 251 leads do-not-email until checked; suppression collection; LIA + retention; consent Q2 + professional; ICO fee |

P2/P3: add-on emails after Q2, headboard fit, aftercare page, gas-strut facts, C13 publishing, continue limited-company email at a modest cap, dimensions, bot protection, #1020, furniture-pack firms, phone leads, Trustpilot.

---

## 22. Agent performance

| Report | Specialists | Delivered | Outputs | OpenRush | Manager's quality notes |
|---|---|---|---|---|---|
| 01 | Customer Finder, Analytics, Checkout Doctor, Email & SMS, Data Quality | Parts 2, 3, 7 | 1 report, 4 CSVs (41 + 9 + 21 + 22 rows) | 0 | Corrected the ~45/month figure and a Stage 1 bot misclassification; clean anonymisation. Status UNKNOWN by API design |
| 02 | Customer Care, Sales Closer, Reviews & Trust, Delivery & Returns, Quality Control | Parts 4, 5, 6 | 1 report, 3 CSVs (23 + 20 + 43 rows), templates v2 | 0 | Found the wrong phone number and reply incidents in live mail; Inbox/WhatsApp/phone remain blind spots |
| 03 | Lead Finder, Email Marketing, Sales Closer, Market Research, Content Creation, Theme Engineer | Parts 8–12 | 1 report, 4 CSVs (12 + 32 + 332 rows + page), 23 owner questions, guide draft | 2 calls, ≤8 (cost not reported) | Proved the 404 cause; reconciled 314 sends to HQ day docs. Did not report credit cost per call |
| 04 | Decision Council, Verification (compliance) | Part 13 | 1 report, 1 CSV (29 rows) | 0 | Thorough, sourced, labelled not legal advice. Used reported send totals (292 + 61) that do not match HQ (314); said the agent brief lacked the legal-form rule — since fixed by the Manager |
| Operating agents | Email Marketing scheduled task; Inbox agent | 19 Nov run 61 sends; inbox logging | – | 0 | Run respected limited-company rule; 8 hotel sends against advice (prompt now aligned). Inbox agent does not see Shopify Inbox chats |
| Manager | Brief, prompt, drafts, HQ fix, daily report | 5 actions, VERIFIED 20 Nov 00:00–00:10 | – | 0 | See section 1, item 12 |
| Manager writer | Report writer | Consolidation | This report, 2 CSVs, HQ doc, HTML | 0 | 2 HQ reads (suppression); 1 HQ write |

**Conflicts resolved here:** sends 314 (HQ) over 292/353; hard bounces 15 (Gmail) over 13 (HQ status at Stage 1); trade-brief status as fixed by the Manager.

---

## 23. OpenRush usage

| Item | Credits | Label |
|---|---|---|
| Report 03: 2 × `research_keywords` (UK; "beds for landlords", "hmo beds") | ≤8 (cost not reported; recorded as 8) | ESTIMATE |
| Reports 01, 02, 04 | 0 | VERIFIED |
| This report | 0 | VERIFIED |
| **Stage 7 total** | **≤8 (ESTIMATE 8)** | ESTIMATE |
| **Month to date** | **≤221 of 2,001** (213 + 8) | ESTIMATE (Manager) |
| Protected reserve (400) | untouched | VERIFIED (Manager) |

Free sources used across Stage 7: Shopify Admin GraphQL and ShopifyQL (about 22 read queries), Gmail read-only (about 28 searches/reads), HQ reads, WebSearch (16), site fetches (about 21).

---

## 24. Stage 8 preparation (Revenue command centre & controlled scaling)

Stage 8 needs one trustworthy daily view of revenue, demand and capacity before any scaling. What is still missing:

| Data / decision | Why Stage 8 needs it | Owner / source | Label |
|---|---|---|---|
| Costs and VAT treatment | Profit, margin, ROAS limits — no scaling decision without them | Owner (PARKED) | UNKNOWN |
| Google Ads payment fixed; product-level Ads spend export | Paid channel must run before it can be scaled; spend per product | Owner | UNKNOWN |
| Merchant Center diagnostics; feed source decision (Stage 5) | Free listings drive 7 of 36 first visits | Owner exports | UNKNOWN |
| Real delivered dates and workshop lead time / capacity per week | Scaling must not outrun the workshop; delivery promises | Owner | UNKNOWN |
| Automation status + monthly recovery report | Recovery card (B) | Owner screenshot | UNKNOWN |
| Consent answer Q2 | Size of the marketable list | Owner + professional | HYPOTHESIS |
| Trade terms (Q4–Q16, Q20–22) and fire answers (Q17–19) | Trade revenue line and segment choices | Owner | UNKNOWN |
| Pipeline fields live in HQ leads | Trade card (E) with stages | HQ / agents | RECOMMENDATION |
| Shopify Inbox, WhatsApp and phone enquiry counts | Enquiry card (C) is a floor today | Owner routing | UNKNOWN |
| Stage 5 F1/F3/F8 (ottoman price, drawers, opening direction) | Highest-traffic products cannot be pushed until truthful | Owner | OPEN |
| Christmas delivery cut-off | Seasonal demand vs capacity | Owner | UNKNOWN |
| Registered office line / visiting rule | Trust and legal disclosure on scaled pages | Owner / accountant | OPEN |

**HQ dashboard:** `customers/stage7` (cards A–F, labels map, 10 owner asks) is ready to feed the Stage 8 revenue command centre; Stage 8 should add daily orders, revenue, ad spend and capacity alongside it.

---

## Owner's questions A–M

**A. Are abandoned-checkout messages actually active?**
- **UNKNOWN.** Shopify's Admin API has no automation status field. The owner edited the workflow on 19 Nov and the editor warned it reverts to Draft; reactivation was not confirmed.
- Evidence it has worked before: 3 sends Sep–Oct, 1 click, 0 orders (HISTORICAL). No order since 1 Jul shows an abandoned-checkout or Shopify Email source (VERIFIED).
- **Owner check:** Marketing → Automations → "Recover abandoned checkout" → read the badge, check no Clearpay in the live email, turn on if needed, screenshot (section 5).

**B. How many abandoned checkouts are recoverable?**
- Of 21 checkouts in 73 days: 12 bots, 1 no contact, 5 bought anyway, **3 real people who did not buy** (≈1.2 a month). **Only 1 is subscribed** and so eligible for the automation (≈0.4 a month). VERIFIED counts / ESTIMATE rates.
- The **~45/month figure is withdrawn**: it counted sessions reaching checkout, most of which never leave an email.
- Recovery will be small (well under 1 order a quarter, ESTIMATE). Worth having because it is free; not a growth lever.

**C. Which customers have unanswered enquiries?** (anonymised)
- **Unanswered:** E010 (made-to-measure 6ft × 6ft Harlington Wingback, 12 days).
- **Waiting on us:** E011 (bespoke quote, 8 days overdue, delivery 27–30 Nov), E021 (Plymouth, Shopify Inbox), E022 (storage depth due today), E023 (ready to buy, came via ChatGPT), E008 (stale since 29 Oct).
- **Post-sale due:** #1040 time slot tonight; #1043 assembly decision.
- **Trade:** Ivywell Interiors (COM metres overdue since 18 Nov).
- **Unknown:** E013 and E016 (Shopify Inbox; content not visible).

**D. How can we improve customer aftercare?**
1. Fulfil only when the van leaves; edit the shipping email (no fake tracking).
2. Mark delivered on the day; back-fill #1031–#1042.
3. Order confirmation: made to order in Dewsbury, we call to agree the day, free to the door, optional £29.99 drop-off / £69.99 assembly.
4. Delivered email links a corrected aftercare page (warranty, returns, how to report a problem, care); add gas-lift help once strut facts exist.
5. Log every complaint, return and damage in HQ (0 so far in Gmail).

**E. How can we collect more genuine customer reviews?**
- Ask only after confirmed delivery: Delivered + 5 days, one reminder, one platform per customer (Judge.me first for best sellers, Google where Judge.me can exclude the order).
- No incentives, no gating, publish every rating, reply to every ≤3★ within 2 working days, reply to the 3 existing reviews now, ask for a photo without reward.
- Do not re-ask the 24 customers asked on 10 Nov. Expect about 2–3 reviews a month (ESTIMATE).

**F. How can we increase repeat customer purchases responsibly?**
- First settle **consent Q2** (pre-19 Nov subscriptions may be invalid).
- Then one plain, size-matched email per subscribed customer after delivery and aftercare: matching mattress for the 9 who bought a bed/base without one; headboard for 8 base buyers once fit is confirmed.
- Standalone price, no discount, no urgency, stop on reply. Service messages only to the 14 non-subscribed buyers. Excluded: open issues, refunds/cancellations, the Temu buyer.

**G. Which UK business segments are most relevant for trade sales?**
- **High:** interior designers (only interested reply; COM accepted).
- **Medium:** letting agents (fix the offer), landlords and HMO operators (inbound only; HMO blocked on fire documents), home stagers.
- **Medium-low:** property managers, developers (via designers).
- **Low / pause:** holiday lets, serviced accommodation, small hotels/B&Bs. **Hold:** care homes. **Owner decision:** furniture-pack firms.

**H. Why is the trade page returning 404?**
- **Because it was never created.** No page, redirect, menu item or link has ever existed for `/pages/trade` (VERIFIED across 83 pages, redirects, 4 menus, site HTML, emails and git). It was not deleted and it is not a wrong handle. Fix: create it from `trade-page-draft.html` once approved (S7-OA19).

**I. What trade information is still required from the owner?** (`owner-trade-questions.md`)
- **Urgent:** Q1 fabric metres per size; Q2 COM charge; Q3 where to send fabric.
- **Prices:** Q4 price basis; Q5 minimum order; Q6 incl./excl. VAT.
- **Paperwork:** Q7 VAT invoice and from which system; Q8 payment terms; Q9 account or quote per order.
- **Delivery:** Q10 lead times 1/5/10+ beds; Q11 several addresses; Q12 multi-bed assembly price; Q13 set-day delivery.
- **Products:** Q14 rental products; Q15 hard-wearing fabric; Q16 non-standard sizes.
- **Fire:** Q17 BS 7177 labels; Q18 permanent labels; Q19 supplier certificates.
- **Returns:** Q20 14-day returns for trade; Q21 damage process.
- **Decisions:** Q22 "next working day" quote promise; Q23 workshop visits.

**J. How should the trade enquiry and quotation process work?**
1. Enquiry (trade form, email, WhatsApp, phone) → Inbox agent creates/updates the HQ lead at stage **New** within 2 hours and alerts the owner.
2. Qualify within 1 working day (design, size, quantity, postcode area, timeframe, fabric) using the trade template; stage **Qualified** or **Awaiting information**.
3. Owner prices within 2 working days: live prices + options + trade basis; delivery free in England, Scotland and Wales (£90 NI/Channel Islands/IoM).
4. Written quote: lines, options, delivery, totals incl. and ex VAT, validity, payment terms, lead time, returns, company details; no fire claims. Stage **Quote sent**.
5. Follow up day 3 and day 7 on the same thread, then stop. **Won** (order number) or **Lost** (reason; no reply 14 days after quote). Weekly Monday review.

**K. How can we contact businesses lawfully?** (not legal advice)
- **Limited companies, LLPs, plcs, charitable companies, public bodies:** cold email to published role addresses is allowed. Check and record the company number, say who we are, include the privacy line and STOP line, one email plus at most one follow-up, check suppression first, keep a signed LIA.
- **Sole traders and ordinary partnerships** (most B&Bs, guest houses, holiday cottages, private landlords): no cold email or text. Use the trade page, GBP, post, or phone after TPS screening. Reply and quote when they contact us.
- **Unknown legal form = sole trader.** The 251 earlier leads without evidence get nothing more until checked; no apology email.
- **Anyone who says stop** goes on the suppression list for every channel.

**L. What are the 20 highest-value customer recovery and trade opportunities?**
- See section 19 and `recovery-opportunities.csv`. Top five: (1) clear the five waiting customers today; (2) Ivywell COM reply; (3) confirm the abandoned-checkout automation with corrected copy; (4) safe-to-send rule and correct WhatsApp number; (5) fulfil on dispatch and mark delivered. The trade page (RO10) and owner trade facts (RO11) unlock every later trade sale.

**M. What must be ready before Stage 8?**
- All P0 items in section 21 cleared (customers answered, Ads card fixed, automation status known).
- Delivered dates recorded and a workshop capacity/lead-time figure.
- Consent answer Q2 and the suppression list live.
- Trade terms and fire answers, or a decision to scale consumer only.
- Costs/VAT un-parked (or Stage 8 runs on revenue only, labelled), Ads spend by product, Merchant Center diagnostics, Stage 5 F1/F3/F8.
- Enquiry routing (Shopify Inbox, WhatsApp) into HQ so the dashboards are complete.

---

## Limitations

- Automation status, send log, delay and audience cannot be read through the Admin API (UNKNOWN until screenshots).
- Abandoned checkouts before 8 Sep are not returned. Bot classes are pattern-based (ESTIMATE intent).
- Shopify Inbox, WhatsApp and phone enquiries are not visible; enquiry counts are a floor. Judge.me admin and GBP reviews not visible.
- Delivered status is UNKNOWN for most November orders.
- Trade legal form is from HQ text, not re-checked at Companies House. Delivered trade emails (299) is an ESTIMATE.
- Compliance is general guidance from search extracts and law-firm commentary — not legal advice.
- Send totals reported elsewhere (292 / 353) do not reconcile with HQ (314); HQ is used.
- OpenRush credit cost for the 2 trade calls was not reported; recorded as 8 (ESTIMATE).
- Costs and VAT PARKED: no profit figures.

## Credits used

- **This report:** 0 OpenRush credits. Stage 7 ≤8 (ESTIMATE 8); month ≤221 of 2,001; reserve untouched.
- **HQ (ArtifactData):** 3 reads (`customers/stage7` existence, `leads` suppression flags, `leads` statuses); 1 write, `customers/stage7` (new document).
- **Files written:** `ops/rocket/stage7/STAGE7-REPORT.md`, `recovery-opportunities.csv`, `owner-approval-queue.csv`; HTML summary `rocket-stage7.html` in the session scratchpad. Nothing published or committed.
