# Stage 7 · Parts 4, 5 and 6: Enquiries & sales conversion, aftercare & trust, genuine reviews

Specialists: Customer Care, Sales Closer, Reviews & Trust, Delivery & Returns, Quality Control. Date: 20 Nov 2026. This work was read-only. Nothing was sent, drafted in Gmail, labelled, published or changed in Shopify, Judge.me or HQ. No customer names, emails, phone numbers or addresses appear in any file. Customers are identified only by order number or anonymised ID (E001…).

Files:
- `customer-enquiries.csv`: 23 enquiries, E001–E023
- `enquiry-templates-v2.md`: 9-class system, safe-to-send rule, holding lines, templates
- `aftercare-register.csv`: 8 open or recorded cases, plus the current and proposed customer journey
- `review-opportunities.csv`: all 43 orders #1001–#1043, with delivery, review and request status and a platform suggestion

Labels used: VERIFIED (seen in live data today), ESTIMATE (reasoned from evidence), HYPOTHESIS, UNKNOWN (cannot be seen from here; never counted as 0), RECOMMENDATION. HISTORICAL marks earlier-stage figures.

---

## Summary (read this first)

1. **23 genuine enquiries since 1 Oct.** By source: 19 email (one is a trade reply), 1 contact form and 3 Shopify Inbox hand-offs. 0 WhatsApp forwards are visible (no "WhatsApp from" mail exists). Phone calls are UNKNOWN. By type, configuration dominates: 12 of 23 are about size, dimensions, fabric or swatches. VERIFIED.
2. **Reply speed has changed sharply.** Median first reply across the 19 measurable enquiries is 104 hours (4.3 days). Before 12 Nov the median was 17 days (10 enquiries, all cleared in one batch on 11 Nov). From 12 Nov it is 1.5 hours (9 enquiries). VERIFIED. Quality has not caught up with speed: many replies are one line ("Sure", "Yes we can do"), and none of them answered the question asked.
3. **One enquiry is still unanswered and five are waiting on us now.** Unanswered: E010, the 7 Nov made-to-measure request. Waiting on us: E011 (bespoke quote), E021 (the Plymouth Inbox lead), E022 (King gas-lift height and storage depth, promised for today), E023 (the bespoke Regal Goldline-style bed) and E008 (a stale configuration request). Owner decision: E020 (#1043 assembly at £50). Section C.3 has the details.
4. **Conversion from enquiry to order is 3 of 16 pre-sale enquiries (19%).** Two of the three ordered before we replied (#1022, and #1029 as an ESTIMATE). Only 1 order clearly followed our reply: E012, swatches, then #1043. Closed 28-day window (enquiries up to 22 Oct): 1 of 4. The sample is tiny, so treat these as ESTIMATES.
5. **The top objection is missing measurements.** Five enquiries asked for dimensions, room fit or height that the product page does not give. Next are fabric and swatches (6), and custom builds the site does not show (4). VERIFIED.
6. **Reply accuracy problems found in live mail.** They are: a wrong WhatsApp number in one reply (07417 449197); "Yes, we do" to a showroom question before the visiting rule is confirmed; "our own team delivers and assembles" with no £69.99 price; assembly quoted at £50 cash; and one reply sent with an internal owner note still in it. VERIFIED. The v2 templates and the safe-to-send rule address each of these.
7. **The aftercare journey today has three steps:** order confirmation, then a misleading "on the way" email within hours, then nothing. There is no dispatch update, no delivery confirmation, no tracking for own-team deliveries, and no assembly or gas-lift help anywhere on the site. The aftercare page is orphaned and out of date. VERIFIED. Gmail shows 0 complaints, returns or damage reports since 1 Oct. Open cases: #1043, #1040, #1038 and E022, plus a data gap (no delivered dates since #1030).
8. **Reviews: 3 in total, all 5 stars, all "Verified", all collected through Judge.me invitations, 0 replied to.** Product reviews exist only for Side Lift and Cambridge. Google Business Profile: about 0 reviews (ESTIMATE; Google's 18 Nov email says "reach 5 reviews"). Trustpilot: no profile found. VERIFIED.
9. **The review plan for approval:** ask only after the owner confirms delivery. Each customer gets one request and one reminder, on one platform. No incentives. Every review is published, and every review of 3 stars or less gets a reply. The 24 customers asked on Google on 10 Nov are not asked again. Products that need first evidence get Judge.me product reviews: the two ottoman bases, Cloud Teddy and Savoy. `review-opportunities.csv` lists 9 orders (#1034–#1043, excluding #1037, which has no email) that become eligible once delivered.

---

## C. Enquiries and sales conversion (part 4)

### C.1 Sources and method

| Source | What was read | Enquiries found | Label |
|---|---|---|---|
| Gmail inbox threads from customers (personal-address senders + business senders in Primary) | 30+ threads since 1 Oct, read in full | 18 (+1 trade reply) | VERIFIED |
| Shopify contact form ("New customer message") | 1 | 1 (E007, likely scam) | VERIFIED |
| Shopify Inbox hand-offs ("You have a new message from …") | 3 conversations (12, 15, 19 Nov) | 3 (only the 19 Nov messages are visible in the notifications) | VERIFIED / UNKNOWN content |
| WhatsApp forwards ("WhatsApp from") | Search returned 0 | 0 visible. WhatsApp chats themselves are UNKNOWN | VERIFIED (0 forwards) |
| HQ `inbox` (11 docs) | All read; fields with names were not copied | 0 new. All 11 overlap with Gmail | VERIFIED |
| Excluded | Vendor pitches, including one that opened by pretending the site was blank. Also trade-outreach bounces, auto-replies, STOP replies, and our own 6 Oct post-order message to a mattress buyer | n/a | VERIFIED |

Outcome matching: each enquirer was compared with Shopify order emails and names in memory only. Nothing was written down.

### C.2 Counts

**By source:** Email 19 · Contact form 1 · Shopify Inbox 3 · WhatsApp 0 visible · Phone UNKNOWN.

**By type (main class):**

| Class | Count | IDs |
|---|---|---|
| 1 Ready to purchase | 1 | E023 |
| 2 Price / quote | 1 | E011 |
| 3 Configuration (size, dimensions, fabric, swatches, height) | 12 | E001–E006, E008, E010, E012, E014, E015, E022 |
| 4 Delivery | 4 | E007 (likely scam), E017 and E019 (post-order), E021 (pre-order) |
| 5 Assembly | 1 | E020 |
| 6 Trade | 1 | E018 (Ivywell Interiors, customer-supplied fabric) |
| 7 Aftercare | 0 | – |
| 8 Complaint | 0 | – |
| 9 General | 3 | E009 (showroom), E013 and E016 (Inbox, content UNKNOWN) |

Secondary themes appear in other classes too: assembly in 3 more (E011, E020, E023), price in 2 more (E010, E023) and ready-to-buy signals in 2 more (E004, E021).

**First response time (from our first reply in the thread), VERIFIED:**

| Group | n | Median | Range |
|---|---|---|---|
| All measurable | 19 | **103.7 h (4.3 days)** | 11 min to 41 days |
| Received before 12 Nov | 10 | 407 h (17 days) | 1.5 days to 41 days (all answered 11 Nov) |
| Received 12 Nov onwards | 9 | **1.5 h** | 11 min to 4.3 days |
| Not measurable | 4 | – | E010 has had no reply for 12 days. E013, E016 and E021 are in Shopify Inbox, where reply times are UNKNOWN |

**Enquiry → order conversion (ESTIMATE, small sample):**

| Measure | Result |
|---|---|
| Pre-sale enquiries (excluding scam, trade, post-sale and the unknown Inbox chats) | 16 |
| Same customer later ordered | 3: E001 → #1022 (ordered 2 minutes after writing, before our reply); E005 → #1029 (ESTIMATE, same name on a different email; ordered before our reply; then left the 11 Nov 5-star review); E012 → #1043 (after swatches) |
| Conversion, all pre-sale | 3 / 16 = 19% (windows still open for 11 of them) |
| Conversion, closed 28-day window (enquiries up to 22 Oct) | 1 / 4 = 25% |
| Conversion clearly caused by our reply | 1 / 16 (E012) |
| Swatch enquiries | 6 → 1 order so far (3 still open: E014, E015, E004 lapsed) |
| Lost-likely (no reply from the customer for 3+ weeks after a late, incomplete answer) | E002, E003, E004, E006, E008 (ESTIMATE) |

### C.3 UNANSWERED or WAITING-ON-US now (20 Nov)

| ID | Date | Channel | What they need (no names) | Priority | Template |
|---|---|---|---|---|---|
| **E010** | 7 Nov (chased 11 Nov) | Email | Harlington Wingback, made to measure 6ft × 6ft with a front-lift ottoman: can we make it, the price and the lead time. **No reply for 12 days** | P0 today | T3-CUSTOM, then owner price |
| **E021** | 19 Nov | Shopify Inbox | Plymouth area (South West England) buyer who will order once a move-in date is set. Needs: confirmation of free delivery there by our own team, how a delivery day is agreed, and an invitation to share the move-in date. The first answer seems to have confused them (they quoted "free delivery across Great Britain" back to us) | P0 today | T4-AREA short version, sent inside Shopify Inbox |
| **E023** | 19 Nov | Email | Regal Goldline-style Double (customer's name for it; our product is Eagle Regal Gold-Trim), deep olive, gold stripes, **side-opening ottoman**. Needs: a written total price (bed + options; delivery free; optional £69.99 assembly), whether it can open from the side (BLOCKED until the owner confirms), easy-clean fabric swatches, the 5-year frame warranty, photos of finished beds, a product link, and whether assembly includes placing the bed. Also asked about removal of an old bed (owner said no in a reply). Came via ChatGPT | P0 today | T1 + T3-OTTOMAN + T3-SWATCH |
| **E022** | 19 Nov | Email | King Ottoman Gas Lift Divan Base: we promised the exact 5ft base height and storage depth "within one working day", **due today**. Storage depth is BLOCKED | P0 today | T3-HEIGHT, or a second holding line |
| **E011** | 10 Nov | Email | Bespoke end-lift ottoman with Chesterfield headboard and firm foam mattress, max 140 × 190 cm external, delivery wanted 27–30 Nov. **Itemised quote promised 11 Nov, not sent** (8 days) | P0 (their date is close) | T2, with owner prices |
| E008 | 29 Oct | Email | Cloud Teddy King with drawers instead of the ottoman; does a separate headboard fix to the base; 15 swatches. Our reply was "Sure" | P2 (stale, 3 weeks) | T3-OTTOMAN once, then stop |
| E019 / AC02 | 18 Nov | Email (post-sale) | #1040: delivery time slot for Sat 21 Nov, **due Fri 20 Nov evening** | P0 today | Short message |
| E020 / AC01 | 18 Nov | Email (post-sale) | #1043: owner decides whether to honour the £50 cash assembly written in our reply, or agree £69.99 before delivery | P0 owner | – |
| E013, E016 | 12 and 15 Nov | Shopify Inbox | Content UNKNOWN. Owner to open Shopify Inbox, log the questions and check they were answered | P1 | – |
| E014 | 12 Nov | Email | Confirm the 7 swatches were posted. Then one follow-up 5 days later | P2 | T3-SWATCH-FOLLOW-UP |

### C.4 Objection themes (what stops people buying)

| Theme | Enquiries | Fix |
|---|---|---|
| Measurements / fit not on the product page | E001, E002, E003, E005, E022 (5) | Owner-measured dimensions per size on the product page (Stage 5/6 BLOCKED). Until then, use T3-SIZE-FIT and answer within 1 day |
| Fabric colour: wants to see it first | E004, E006, E008, E012, E014, E015 (6) | Swatches are the best converter (1 order). Post within 1 day and follow up once |
| Custom build not shown on site (drawers instead of ottoman, side-opening, 6ft × 6ft, 140 × 190 cm) | E008, E010, E011, E023 (4) | T3-CUSTOM / T3-OTTOMAN. Owner gives prices within 1 day. Opening direction BLOCKED |
| Delivery day / area clarity | E017, E019, E021 (3) | Stop the order-day "on the way" email. Use T4 templates. Agree the date by phone |
| Price not given for custom work | E011, E023 (2) | Written itemised quote, never "depends what the customer wants" |
| Assembly (price, placement, removal of an old bed) | E011, E020, E023 (3) | Always "£69.99 optional". Removal wording to be added to BRIEF |
| Trust: warranty detail, photos, wants to visit | E005, E009, E023 (3) | 5-year frame warranty wording. Real photos of finished beds (owner). Visiting rule BLOCKED |
| Slow or one-line replies | E001–E008 (8) | Safe-to-send rule: answer every question |

Note: E023 found us through ChatGPT (the customer said so). This is the first VERIFIED AI-assistant referral. Stage 6 AI-visibility work can count it.

### C.5 Classification system and templates

See `enquiry-templates-v2.md`. It is built on the 17 Stage 3 templates, which were improved rather than duplicated. It covers the 9 classes, a 7-point safe-to-send rule (no brackets or placeholders, BRIEF facts only, answer every question, check the phone number) and holding lines for every unknown. The unknowns are: workshop visits (BLOCKED), storage depth (BLOCKED), opening direction (BLOCKED), exact dimensions, gas-strut cover, custom prices, customer-fabric quantity, trade terms, and removal of an old bed. New facts used: Gas Lift Divan Base 14 in, ABBAS TRADE LTD (16410472, VAT 520 9622 06), assembly £69.99, drop-off £29.99, no Clearpay.

---

## D. Aftercare and trust (part 5)

### D.1 The journey today (VERIFIED)

| Step | What happens | Problem |
|---|---|---|
| Order confirmation | Shopify default email | Does not say "made to order" or how delivery is agreed |
| "Fulfilled" + "A shipment … is on the way" | Sent within hours of the order. #1043 was fulfilled 3.6 h after ordering, and the customer replied to that "on the way" email. 16 of the last 18 orders were fulfilled within 6 h (Stage 3/4) | Misleading. The bed is not made yet, and there is no tracking for own-team deliveries (only #1022 by DPD has any). It caused the chasers E017 (#1038) and E019 (#1040) |
| Dispatch update | None | – |
| Delivery confirmation | None. No order after #1030 has a delivered date. Earlier dates are bulk stamps (25 Sep, 19 Oct, 3 Nov). #1038 was delivered 17 Nov per the owner but is not marked | Review timing and delivery-time claims have no reliable data |
| Aftercare page `/pages/aftercare-and-feedback` | Live. Orphaned (8 GSC clicks in 90 days, Stage 6). Says "does not yet display customer reviews" (3 are live), names Clearpay, and promises a reply "within two working days" (returns page says 24 h). Mentions "replacement fittings for assembly" but gives no instructions | Out of date, and nobody is sent to it |
| Assembly instructions | None. `/pages/assembly-instructions` and `/pages/assembly` return 404. No page or blog post covers assembly or gas lifts. "How do ottoman beds work" has no strut or troubleshooting content | 260 searches/month for "gas lift ottoman bed assembly instructions" and 90 for "…gas lift not working" (Stage 6, VERIFIED) find nothing of ours |
| Warranty wording | `/pages/warranty`: 5-year limited manufacturer warranty on frame and structural parts. Excludes misuse, accidents, **incorrect assembly** and wear. "Mattresses … may carry different terms" | Conflicts with the BRIEF "mattresses: 5-year guarantee". Gas struts are not mentioned (E005 asked) |
| Review request | Judge.me invitation about 14 days after **fulfilment** (ESTIMATE, Stage 3). All 3 reviews carry "review_collected_via_store_invitation" | Can arrive before or just after delivery |
| Complaints / returns / damage | 0 threads in Gmail since 1 Oct | VERIFIED. Phone and WhatsApp are UNKNOWN |

### D.2 Proposed journey (for owner approval; nothing switched on)

| # | Step | Trigger | System | Owner effort |
|---|---|---|---|---|
| 1 | Order confirmation: made to order in Dewsbury; we will contact you to agree a delivery day (usually 3–5 working days); free to the door; optional £29.99 drop-off and £69.99 assembly | Order paid | Shopify Notifications (paste block, `ops/email/flows/post-purchase.md` Email 1) | 5 min once |
| 2 | Dispatch update "Your bed is on its way today with our own team. We will call before we arrive." No tracking link when there is none | Owner marks **Fulfilled on the day the van leaves** | Shopify Shipping confirmation (edited) | Habit change |
| 3 | Delivery confirmation | Driver or owner taps **Mark as delivered** on the day | Shopify app + Delivered notification | 10 s per order |
| 4 | Aftercare + assembly guidance: warranty, returns, how to report a problem, care, gas-lift care (**BLOCKED** until the owner gives strut facts) | Same Delivered email links to the fixed aftercare page | Shopify + website (owner publishes) | Page text once |
| 5 | Review invitation | **Delivered + 5 days**. Fallback 10 days after fulfilment (which then means dispatch). One reminder at +7 days | Judge.me Request scheduling | 10 min once |
| 6 | Future product information | Only for customers who ticked marketing consent (box unticked by default since 19 Nov) | Email tool segment | Later |

The register rows J0–J6 in `aftercare-register.csv` hold the owner, system and status for each step.

### D.3 Open aftercare cases (anonymised, `aftercare-register.csv`)

| Case | Order | Issue | Next action | Due |
|---|---|---|---|---|
| AC01 | #1043 | Assembly promised at £50 cash; order paid for downstairs drop-off; list price £69.99 | Owner decides (honour £50 recommended, as it is in writing); note it on the order | Before delivery |
| AC02 | #1040 | Saturday 21 Nov delivery; time slot promised for Friday evening; no email on the order | Send slot; add email with consent; mark delivered | Today |
| AC03 | #1038 | Delivered 17 Nov per owner; not marked. A reply with an internal note was sent by mistake on 15 Nov | Mark delivered; never send a reply that still contains notes | 21 Nov |
| AC04 | E022 | Exact King height and storage depth promised for today | Owner fact, or a second holding line | Today |
| AC05 | #1031–#1037, #1039, #1041, #1042 | No delivered date; status UNKNOWN | Owner marks the real delivered dates | 23 Nov |
| AC06 | #1022 | DPD parcel never marked delivered | Mark from tracking | 27 Nov |
| AC07 | All | 0 complaints, returns or damage since 1 Oct | Keep logging | – |
| AC08 | All ottoman buyers | No assembly or gas-lift help on the site | Owner strut facts → care page section (Stage 6 C16) | 4 Dec |

---

## E. Genuine review system (part 6)

### E.1 What exists (VERIFIED unless marked)

| Platform | Count | Rating | Detail |
|---|---|---|---|
| Judge.me, all | **3** | 5.00 | Unchanged since 15 Nov (shop metafields `all_reviews_count` 3) |
| Judge.me, store review | 1 | 5 | 20 Sep: "very sturdy… easy to put together… colour is lovely" |
| Judge.me, Side Lift Ottoman Storage Base | 1 | 5 | 11 Nov: "great service… bed made well". ESTIMATE: order #1029, whose customer had first asked about length and gas-strut warranty (E005) |
| Judge.me, Cambridge Panel Storage Bed | 1 | 5 | 15 Nov: "quick delivery, packaged very securely, solid base, easy fixings" (#1031, the only Cambridge order) |
| Judge.me, all other products | 0 | – | Including the best sellers Ottoman Gas Lift Divan Base (7 orders), Cloud Teddy (2), Savoy, Royal Chesterfield, Regal Gold-Trim, Grand Extra-Tall and Curved Wingback |
| Google Business Profile | ESTIMATE about 0 | – | Google's 18 Nov email "reach 5 reviews"; no "new review" email since 10 Nov |
| Trustpilot | none | – | Web search finds no profile. Local Dewsbury rivals (Safe Beds, Fabric Beds Yorkshire, The Bed Crafters) do have Trustpilot pages |

- **Distribution:** 5★ 3, 4★ 0, 3★ 0, 2★ 0, 1★ 0. Average 5.0 from 3 reviews, which is too few to show a site-wide rating.
- **Themes:** solid and well made (3), easy to assemble yourself (2), delivery speed and packaging (1), colour (1), price (1). Photos 0. Replies from us 0.
- **Live widget:** Judge.me product widget at the bottom of the product page. Coupons off, gating off, auto-publish on. "Write a review" is open to everyone, which conflicts with the "verified buyers only" text on our pages (Stage 3, still true).
- **Request timing:** invitations go out about 14 days after **fulfilment** (Stage 3 ESTIMATE, strong). Fulfilment happens on order day, so for #1034–#1043 the timer fires on about 20 Nov to 2 Dec, whether or not the bed has arrived. #1032 and #1033 were probably invited on about 16–17 Nov with no confirmed delivery.

### E.2 Review acquisition plan (for owner approval)

| Rule | Detail |
|---|---|
| Eligible | Only orders the **owner has marked delivered**, with the real date |
| Timing | Judge.me trigger = Delivered + 5 days. One reminder 7 days later. Nothing more |
| One platform per customer | Default is Judge.me, which gives product evidence on the product page. Google goes to orders whose product is not a priority for product evidence, and **only if** Judge.me can exclude that order (owner checks Judge.me's exclusion option, UNKNOWN). Otherwise Judge.me only |
| Products needing evidence first (Judge.me) | Ottoman Gas Lift Divan Base, Side Lift Ottoman Storage Base, Cloud Teddy Boucle Ottoman, Eagle Savoy Channel Bed |
| Already asked | The 24 customers emailed for a Google review on 10 Nov (#1002/#1005, #1004, #1008, #1009, #1011–#1013, #1015–#1019, #1021–#1032, #1027/#1033; reconstructed, ESTIMATE). Most also got a Judge.me invitation. **Do not ask again** |
| No incentives | No discount, gift, entry or refund for a review. No gating: never ask "were you happy?" first, and never skip unhappy customers |
| Publish everything | Keep auto-publish on for all star ratings. Remove only abuse, personal data or spam, and log each removal with a reason |
| Respond | Reply publicly to every review of 3 stars or less within 2 working days, after phoning the customer. Reply to the 3 existing 5-star reviews now (Stage 3 R-reply-positive) |
| Photos | Ask for a photo of the bed in the room, with no reward |
| Verified label | Make "Write a review" verified-buyers-only, or change our page text to match reality |
| Show it | Star badge under the title only on products with 1+ reviews. No site-wide rating claim until 10+ reviews |

**Eligible pipeline now** (`review-opportunities.csv`):
- #1038 is eligible from 22 Nov (owner-confirmed delivery 17 Nov). It goes to Judge.me.
- #1034, #1035, #1036, #1039, #1041 and #1042 depend on the owner confirming delivery.
- #1040 delivers 21 Nov. It has no email on the order, so add one only with the customer's consent.
- #1043 waits until after delivery and the assembly decision.
- #1037 and #1007 have no email, so they get no request.

Suggested split: Judge.me for #1034, #1035, #1038, #1039 and #1040. Google for #1036, #1041, #1042 and #1043, but only if Judge.me can exclude them.

**Realistic expectation (ESTIMATE):** about 4 deliveries a week, and 10–20% of customers reply to a well-timed request plus reminder. That gives about 2–3 new reviews a month and about 10 by the end of February. No target should tempt anyone to cut corners.

---

## Owner actions (priority)

| P | Action | Effort |
|---|---|---|
| P0 | Reply today to E010, E021 (in Shopify Inbox), E022, E023 and E011, using the v2 templates and the owner facts named in each | 30–40 min |
| P0 | #1040 time slot tonight. #1043 assembly decision | 5 min |
| P0 | Check every reply against the safe-to-send rule. In particular the phone number is 07417 439197, and replies must contain no internal notes | Habit |
| P1 | Give the facts that unblock replies: storage depth, opening direction per ottoman, visiting rule (hours or appointment), old-bed removal (yes/no), gas-strut warranty cover | 20 min |
| P1 | Fulfil on dispatch day. Mark delivered on delivery day, including back-filling #1031–#1042. Edit the order and shipping notifications | 10 min + habit |
| P1 | Judge.me: Delivered + 5 days, 1 reminder, verified-buyers-only or fix the page text; reply to the 3 reviews | 20 min |
| P1 | Open Shopify Inbox and log the 12 and 15 Nov chats. Choose one chat channel, or route Inbox into HQ (Stage 3 §6.3) | 15 min |
| P2 | Fix `/pages/aftercare-and-feedback` (reviews sentence, Clearpay, reply promise) and link it from the delivered email and footer. Add care and gas-lift help once the strut facts exist | Text |
| P2 | Add owner-measured dimensions to product pages (biggest objection) | Owner measuring |

---

## Limitations

- WhatsApp chats, phone calls and Shopify Inbox conversation text cannot be read from here. Inbox content is known only from email notifications (the 19 Nov chat in part; the 12 and 15 Nov chats only as "agent transferred"). Counts by channel are therefore a floor.
- The Judge.me admin was not accessible. Request timing, reminders and exclusion options are ESTIMATE/UNKNOWN. Which of the 24 Google requests went to whom was reconstructed from order data and the CHANGELOG (ESTIMATE).
- Google Business Profile reviews are not visible. "About 0" is an ESTIMATE from Google's own emails. The Trustpilot result is from web search only.
- Enquiry-to-order matching used emails and names in memory. The E005 → #1029 match uses a different email address (ESTIMATE). Most conversion windows are still open.
- Delivery status for most November orders is UNKNOWN because Shopify has no delivered dates.
- Shopify notification templates were not read. The "on the way" email is VERIFIED from the customer's reply to it.

## Credits used

- OpenRush: **0** (budget 0).
- Gmail: about 22 read-only searches and thread reads. Shopify: 4 read-only GraphQL queries. HQ ArtifactData: 1 read (`inbox`). WebSearch: 2. Plain page fetches of eaglebed.co.uk: about 12. Zapier: 0. No writes anywhere except the 5 files in `ops/rocket/stage7/` named above.
