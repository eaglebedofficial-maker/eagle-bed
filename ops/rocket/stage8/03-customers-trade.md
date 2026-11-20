# Stage 8 — 03 Customers, recovery, reviews & trade

Specialists: Customer Finder, Customer Care, Reviews & Trust, Lead Finder, Email Marketing, Sales Closer.
Extracted 20 Nov 2026 01:05 Europe/London (GMT). Read-only: Shopify Admin GraphQL, Gmail search, HQ db, two live-site curls. Nothing was sent, drafted, changed or published. No customer personal data: order numbers and anonymised IDs (C0xx, E0xx) only; trade businesses by business name.
Files: `customer-recovery-performance.csv` (31 metrics), `trade-sales-performance.csv` (19 metrics). HQ: `cmd/customers`, `cmd/trade` (version 1 each).

## 1. Headline

**Nothing has changed since the Stage 7 baseline (20 Nov 00:00).** The window is only about 1 hour 5 minutes: 0 orders, 0 abandoned checkouts, 0 enquiries, 0 reviews, 0 new trade leads or replies. The 20 Nov 10am trade email run has **not happened yet**. Every figure below is the Stage 7 baseline, re-checked live where the API allows.

## 2. Customers and recovery

| Metric | Value | Confidence |
|---|---|---|
| Customer records / with an order / paying buyers | 73 / 41 / 36 | VERIFIED |
| New / returning buyers | 34 / 2 (5.6%) | VERIFIED |
| Repeat orders | 2 of 38 (5.3%) | VERIFIED |
| Paid valid orders, customer revenue | 38, **£15,393.59** gross incl. VAT and add-ons (13 Jul–20 Nov) | VERIFIED |
| Excluded (shown separately) | Cancelled #1010, #1014, #1020 (#1020 still shows paid, refund failed); refunded #1001, #1006 | VERIFIED |
| Profitability | PROFITABILITY NOT VERIFIED — COST DATA PARKED | — |
| Abandoned checkouts (8 Sep–20 Nov) | 21 = 12 bots/tests + 5 bought later/before (4 people) + 1 no contact + **3 real, not bought** | VERIFIED |
| Eligible (real, not bought, subscribed) | **1** (12 Nov checkout) | VERIFIED |
| Automation status | **UNKNOWN** (no API field; no owner confirmation in CHANGELOG or HQ; the 19 Nov daily report still asks the owner to check) | UNKNOWN |
| Recovered orders | 0 visible (10 orders have no journey data) | VERIFIED / UNKNOWN |
| Recovery rate | UNKNOWN (denominator 1) | UNKNOWN |

## 3. Enquiries and aftercare

23 genuine enquiries since 1 Oct (0 new since 20 Nov 00:00: Gmail shows only our own daily report; no new HQ inbox docs). **Median first reply since 12 Nov: 1.5 hours** (9 measurable). VERIFIED.

**Unanswered: 1 (E010). Waiting on us: 7.**

| ID | Since | What they need |
|---|---|---|
| E010 | 7 Nov | Made-to-measure 6ft × 6ft with front-lift ottoman: yes/no, price, lead time. **No reply at all** (chased 11 Nov) |
| E008 | 29 Oct | Cloud Teddy as a drawer bed in King; headboard fixing; were swatches sent (stale) |
| E011 | 10 Nov | Itemised written quote (bespoke end-lift ottoman + firm foam mattress); fit 140 × 190 cm external; delivery 27–30 Nov |
| E019 | 18 Nov | #1040 delivery time slot for Sat 21 Nov: **due this evening (Fri 20 Nov)** |
| E021 | 19 Nov | Shopify Inbox: confirm free delivery to South West England by our own team and how a delivery day is agreed |
| E022 | 19 Nov | King base storage depth, promised by today. Owner fact missing: do not invent it |
| E023 | 19 Nov | Written total, whether the ottoman can open from the side (BLOCKED), easy-clean fabric, warranty, photos, product link |
| E020 | 18 Nov | Owner decision: #1043 assembly — honour written £50 or agree £69.99 before delivery |

**Open aftercare cases: 7** (AC01 #1043 assembly; AC02 #1040 slot; AC03 #1038 still not marked delivered in Shopify; AC04 E022 storage depth; AC05 delivered dates #1031–#1042; AC06 #1022 DPD; AC08 no assembly or gas-lift help). Complaints in Gmail: 0.

**Delivered orders (verified):** 24 valid orders carry a Shopify DELIVERED mark (#1002–#1005, #1007–#1009, #1011–#1013, #1015–#1019, #1021, #1023–#1030). Their dates are bulk stamps (25 Sep, 3 Nov), not real delivery dates. #1038 was delivered on 17 Nov, but that is owner-reported only. 14 valid orders are not marked (#1022, #1031–#1043).

## 4. Reviews

| Metric | Value | Confidence |
|---|---|---|
| Genuine reviews | **3** Judge.me, all 5★ (1 store, Side Lift 1, Cambridge 1); 0 replies | VERIFIED (shop metafield `all_reviews_count` 3, updated 15 Nov; live Side Lift page reviewCount 1) |
| Products with reviews | 2 | VERIFIED |
| Review requests sent | UNKNOWN. Judge.me invitations do go out (all 3 reviews came through store invitations), but the send log can't be read. The 24 Google asks on 10 Nov are an ESTIMATE | UNKNOWN / ESTIMATE |
| Google / Trustpilot | about 0 (ESTIMATE) / no profile | ESTIMATE |

**Who can be asked for a review once delivery is verified (one request and one reminder each, no incentive):**

- #1038 is eligible from 22 Nov, once it is marked delivered on 17 Nov.
- #1034, #1035, #1036, #1039, #1041 and #1042 can be asked after the owner confirms delivery.
- #1040 can be asked from 26 Nov, if it is delivered on 21 Nov and the customer agrees to add an email.
- #1043 can be asked after the assembly decision and delivery.
- #1037 has no email, so it gets no request.
- The 24 orders asked on 10 Nov are not asked again.

Expectation: about 2–3 reviews a month (ESTIMATE).

## 5. Consent

38 "subscribed" records (12 never ordered), all single opt-in. The figure comes from Stage 7. A live re-count was not possible because the Shopify customer-count filter returned the unfiltered 73. **The risk that the box was pre-ticked before 19 Nov is still unresolved (Q2, HYPOTHESIS).** All marketing to subscribers stays provisional.

## 6. Customer-service controls (for every reply)

1. Phone/WhatsApp is **07417 439197** only. Check it in every reply; 07417 449197 was sent once.
2. No internal or owner notes in customer replies.
3. Never invent measurements, storage depth, opening direction, workshop visits or delivery dates. Use a holding line and ask the owner.
4. **Assembly is never free.** Live Easify price checked 20 Nov 01:00 on the Ottoman Gas Lift Divan Base and Side Lift Ottoman pages (6 option sets each): **Room of Choice Assembly £69.99**, Room of Choice Drop Off £29.99, Downstairs Drop Off £0. No £49.99 or £50 assembly option exists. VERIFIED.
5. No Clearpay. Payment is by card, PayPal or Klarna.
6. Recovery messages: no discount, no urgency, subscribed customers only until Q1 and Q2 are answered.
7. No customer names in HQ or reports.

## 7. Trade

| Metric | Value | Confidence |
|---|---|---|
| Total leads (HQ `leads`) | 332 (314 emailed, 18 never contacted) | VERIFIED |
| Verified company leads | **63** (61 emailed, 2 never contacted). Evidence: Ltd/Limited/LLP/plc or a company registration number in "why". Not re-checked at Companies House | VERIFIED (HQ text) |
| Unknown legal form | 269 (**253 emailed**; Stage 7 said 251, a counting-method difference) | VERIFIED |
| Suppressed | **17** (14 bounced + 3 not interested; all now have doNotContact = true) | VERIFIED |
| Hard bounces (Gmail) / human replies | 15 / 4 (1 interested, 3 STOP) | VERIFIED |
| New inbound since 20 Nov | 0 | VERIFIED |
| Qualified | 0 | VERIFIED |
| Awaiting information | 1 (Ivywell Interiors) | VERIFIED |
| Quote requested / prepared / sent | 0 / 0 / 0 | VERIFIED |
| Follow-ups due | 1: Ivywell. The fabric-metres reply promised on 17 Nov is overdue; it is blocked on owner trade Q1–Q3 | VERIFIED |
| Won / lost | 0 / 0 | VERIFIED |
| Trade revenue | **£0.00** (no order is clearly trade) | VERIFIED |
| 20 Nov 10am run | **Not yet run** at 01:05 (`outreach/day-2026-11-20` absent). Re-check after 10:00 | VERIFIED |
| Last run (19 Nov) | 61 sent, 61/61 limited-company evidence, 1 bounce (Square Lettings, doNotContact), 1 auto-reply, 0 human replies | VERIFIED |
| `/pages/trade` | **404** (curl 20 Nov 01:00; `/pages/assembly` also 404) | VERIFIED |
| Blocked trade-page requirements | **8 of 32** (R08, R12, R13, R14, R17, R26, R27, R29). No owner answers yet | VERIFIED |

**Warnings:**

- The Brighton agency bounce still shows status "contacted" (ESTIMATE).
- Gmail sent "delay" notices on 19 Nov for a Leicester aparthotel and a Camberwell agent. Whether they will fail permanently is UNKNOWN; re-check before any follow-up.
- HQ leads have no pipeline stage fields yet (RO12 is still a proposal).
- Trade emails invite replies, but the trade page is still a 404.

## Limitations

- The "since 20 Nov 00:00" window is about 1 hour, so all deltas are 0 by construction. Re-run after the 10am trade run and after today's deliveries.
- Shopify's customer-count query filter (`email_marketing_state`, `orders_count`, `updated_at`) was ignored and returned 73, so the subscribed count (38) is Stage 7's 19 Nov figure, not a live re-count.
- The Admin API cannot read the automation status, the Judge.me send log or Shopify Inbox message text (E013 and E016 content UNKNOWN).
- Delivered marks in Shopify are bulk stamps, not delivery dates.
- Legal form comes from HQ "why" text only, with no Companies House check.

## Credits used

OpenRush: **0** credits (none called). Month total unchanged (≤221/2,001; reserve 400 intact). Other calls: Shopify GraphQL 5 read queries; Gmail 2 searches; HQ db 5 reads + 1 batch write (cmd/customers, cmd/trade); 6 curls to eaglebed.co.uk.
