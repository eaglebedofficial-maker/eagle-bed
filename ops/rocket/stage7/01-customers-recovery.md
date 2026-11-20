# Stage 7, parts 2, 3 and 7: Customer baseline, abandoned-checkout recovery (P0), returning customers (20 Nov 2026)

Specialists: Customer Finder, Analytics, Checkout Doctor, Email & SMS, Data Quality.
Read-only. Nothing was switched on, sent, drafted in Gmail, imported or changed in Shopify. No customer names, emails, phones or addresses appear in any file. Customers are anonymised as C001–C041 (ordered by first order). Checkouts are identified only by their Shopify checkout ID.

Files: `customer-baseline.csv` (41 buyers, anonymised), `returning-customer-segments.csv` (segments A–H), `abandoned-checkout-audit.csv` (21 checkouts), `automation-status.csv` (automation fields + owner checks + recommended configuration).

Sources: Shopify Admin GraphQL (orders, customers, abandonedCheckouts, marketingActivities, marketingEvents), ShopifyQL `sessions`, HQ db `inbox` (11 docs), Stage 1–6 reports. Pulled 19–20 Nov 2026.

---

## Summary

1. **There are 73 customer records. 41 have an order and 32 do not.** 36 people have a paid order that was not cancelled or refunded. Only 2 of them have ordered twice (5.6%). VERIFIED.
2. **The 38 paid orders total £15,393.59, so the average order is £405.09.** November so far has 13 orders, the highest month, with an average order of £467.76. VERIFIED.
3. **The "~45 abandoned checkouts a month" figure is wrong.** It counted visits that reached checkout, not checkouts we can contact. Shopify holds 21 abandoned checkouts from 8 Sep to 19 Nov:
   - 12 are bots or tests.
   - 1 has no contact details.
   - 5 belong to 4 people who bought anyway.
   - **3 are real people who did not buy.**

   That is about 1.2 a month. **Only 1 of the 3 is subscribed to email marketing,** so the Shopify automation could reach about 0.4 people a month. VERIFIED (counts) / ESTIMATE (monthly rate).
4. **Shopify does not let us read whether the abandoned-checkout automation is on.** Its status is UNKNOWN. The owner must look at the status badge (section 5). No order so far can be traced to an abandoned-checkout email. Recovery rate = UNKNOWN.
5. **Fixing the automation is still worth doing, but it will bring very few orders.** It costs nothing and protects the occasional real buyer. Realistic value: well under 1 order a quarter (ESTIMATE). The Stage 1 estimate of about 1 order (£430) a month should be withdrawn.
6. **Returning-customer opportunities are small and depend on consent:**
   - 9 subscribed buyers bought a bed or base without a mattress. 5 of them are past their aftercare window.
   - 8 subscribed buyers bought a base with no headboard. Whether a headboard fits those bases is UNKNOWN.
   - All of these wait for the compliance answer on whether the pre-19 Nov subscriptions are valid.

---

# ANSWER A: Who are our customers? (Part 2, customer baseline)

## 1. Records and orders (VERIFIED, Shopify GraphQL, 20 Nov)

| Measure | Value | Note |
|---|---|---|
| Customer records | **73** | `customersCount` |
| … with at least 1 order (any status) | **41** | |
| … with a paid order that was not cancelled or refunded | **36** | |
| … with no order | **32** | 7 bot/test, 5 suspected spam sign-ups, 3 real abandoned checkouts, 1 no-contact checkout, 1 duplicate record of a buyer, 15 other sign-ups (Shop login / account) |
| Orders (#1001–#1043) | **43** | 13 Jul – 18 Nov |
| Paid, valid | **38** | 31 web, 6 draft orders, 1 Temu marketplace (#1003) |
| Cancelled | **3** | #1010 and #1014 (payment EXPIRED, no money taken); **#1020 is cancelled but shows PAID with £0 refunded.** Stage 1's refund check (Q13) is still open |
| Refunded | **2** | #1001, #1006 (both refunded in full) |
| Marked "fulfilled" | **42 of 43** | Includes 4 of the 5 cancelled or refunded orders. **"Fulfilled" does not mean delivered** (Stage 1/3/4). A delivery date is confirmed for one order only (#1038, delivered 17 Nov, owner via HQ inbox) |

## 2. Revenue, AOV, repeat (VERIFIED; order totals including VAT and delivery add-ons, before later adjustments)

| Month | Paid orders | Revenue | AOV |
|---|---|---|---|
| Jul | 2 | £837.65 | £418.82 |
| Aug | 8 | £2,825.11 | £353.14 |
| Sep | 6 | £2,284.45 | £380.74 |
| Oct | 9 | £3,365.49 | £373.94 |
| Nov (1–18) | 13 | £6,080.89 | £467.76 |
| **Total** | **38** | **£15,393.59** | **£405.09** (median £366.64) |

**New vs returning:**
- 34 buyers have ordered once. 2 have ordered twice: C002 (#1002 + #1005, 16 days apart, both draft orders) and C026 (#1027 + #1033, 20 days apart).
- So 2 of 38 paid orders (5.3%) are repeat orders.
- **Both repeat orders were for a second bed of the same type in another size.** No one has come back for an add-on.
- One more person bought under a second customer record: the 6 Nov abandoned checkout and order #1035 are the same person, matched internally. This is not a repeat order.

**Lifetime value per anonymised customer** is in `customer-baseline.csv`:
- The highest is C026 at £1,169.96 (2 orders).
- The typical buyer has 1 order of about £250–£580.

## 3. Where buyers first came from (first visit of the first order, 36 paid buyers; VERIFIED `customerJourneySummary`)

| First-visit source | Buyers |
|---|---|
| No journey data (cookies declined, phone or draft order) | 10 |
| Google Ads PMax (`pmax_all_products`) | 8 |
| Google free product listings (`sag_organic`) | 7 |
| Direct | 6 |
| Facebook paid ad (Aug campaign) | 2 |
| Google organic search | 1 |
| ChatGPT referral | 1 |
| Temu marketplace | 1 |

None of the 43 orders shows an email source.

## 4. What they buy (38 paid orders; VERIFIED from order lines and Easify options)

- **Order types:**
  - 18 bed frames, average £513.94.
  - 15 ottoman or divan bases, average £323.91.
  - 4 mattresses on their own, average £296.52.
  - 1 storage box.
- **A mattress was added to only 9 of 33 bed or base orders (27%).** The other 24 went out without one.
- **Room-of-choice assembly was paid on 7 of 38 orders.** Most of these were at the old £49.99 price.
- **The EAGLE10 code was used on 24 of 38 paid orders.** This is a fact about history only. No new discounts are proposed.
- **Sizes:**

  | King | Double 4ft6 | Small Double 4ft | Super King | Single |
  |---|---|---|---|---|
  | 13 | 9 | 8 | 5 | 2 |

## 5. Segments A–H

Full table: `returning-customer-segments.csv`. Consent below means the email marketing state on the customer record.

| Seg | Count | Subscribed | Definition / key point |
|---|---|---|---|
| A First-time | 34 | 19 | 1 paid order. Includes the Temu buyer, who is not ours to market |
| B Returning | 2 | 2 | 2 paid orders each |
| C Fulfilled | 36 (38 orders) | 21 | Marked fulfilled. **Delivered = UNKNOWN except #1038.** Do not trigger review or aftercare emails from "fulfilled" |
| D Open enquiries | 6 | UNKNOWN | HQ inbox: bespoke end-lift ottoman (price owed), made-to-measure bed (no reply yet), 2 swatch requests, a Plymouth delivery chat, a base-height question. Service replies only |
| E Aftercare window | 16 (17 orders) | 8 | Ordered 20 Oct–19 Nov. Open issues: #1043 assembly promised but not paid; #1040 time slot due. Service messages only |
| F Abandoned checkout (real, not bought) | 3 | 1 | See Answer B |
| G Trade enquiries | 1 company | UNKNOWN (B2B) | Ivywell Interiors (customer's own material, COM). Waiting for their sizes |
| H Unqualified / do not market | 19 records | – | 7 bot/test, 5 suspected spam sign-ups (created 14–15 Sep, now unsubscribed), 1 no-contact checkout, 1 duplicate record, 5 refunded/cancelled-only buyers (review one by one) |

**Consent caveat:** 26 buyers and 12 people who never ordered are "subscribed". All are single opt-in. Compliance (`04-compliance.md`, Q2) suspects the checkout box was pre-ticked before 19 Nov. If so, these consents may be invalid. **Treat "subscribed" as provisional until that is answered.**

---

# ANSWER B: Is abandoned-checkout recovery working? (Part 3, P0)

## 6. All abandoned checkouts (VERIFIED, `abandonedCheckouts`, 20 Nov)

**The API returns 21 checkouts, all created 8 Sep–19 Nov, so every one is inside the last 90 days.** None is returned for July to 7 September, even though Shopify recorded 17 human checkout sessions in August. Whether earlier checkouts never existed or have been purged = UNKNOWN.

| Class | Checkouts | People | Value |
|---|---|---|---|
| Bot / test | 12 | 7 records | – |
| No contact (no email or phone stored) | 1 | 1 | £503.97 (possibly bought as #1041, HYPOTHESIS) |
| Bought (later, or just before) | 5 | 4 | #1016, #1022, #1034, #1035 |
| **Real, not bought** | **3** | **3** | **£994.06 total** |

**Bot/test patterns:**
- 6 protonmail addresses in the form "mail" + 7 digits, each with a fictional name: Harry Potter, Tolkien, Simpsons and Star Wars mixes.
- 1 throwaway plus-addressed record with no name or address that opened 6 checkouts in pairs 30 seconds apart (28 Sep and 28 Oct).

**Correction to Stage 1:** the 17 Nov checkout (£285.99) that Stage 1 called "a real bed" matches the protonmail bot pattern.

**Bought cases:**
- **#1016:** bought by the same customer 2 hours after the checkout, by draft order.
- **#1022:** the checkout was opened 5 minutes *after* this order, so Shopify's "purchaser" exclusion could not stop it.
- **#1034:** the Stage 1 case. Checkouts on 29 Oct and 5 Nov, order on 6 Nov.
- **#1035:** the same person checked out with a work (public-sector) email, then ordered 18 minutes later with a personal email. This is not a trade lead.

**The 3 real, not-bought checkouts:**

| Checkout | Date | Product | Value | Marketing state | Eligible for Shopify automation |
|---|---|---|---|---|---|
| 68424854274379 | 19 Sep | Side Lift Ottoman Storage Base, Double 4ft6 | £256.50 | not subscribed | No (and 2 months old) |
| 69141680685387 | 12 Nov | Ottoman Gas Lift Divan Base, Small Double 4ft | £228.60 | **subscribed** | **Yes**. Whether it was emailed = UNKNOWN |
| 69333410021707 | 19 Nov | Grand Extra-Tall Panel Bed, Double 4ft6 | £508.96 | not subscribed | No |

The 19 Sep checkout matches order #1029 on product, size and price, but the buyer is a different person (checked internally). It stays "not bought".

## 7. Eligible per month: the ~45/month estimate is not supported

| Month | All checkouts | Bots | Bought | No contact | Real, not bought | Of which subscribed |
|---|---|---|---|---|---|---|
| Sep | 6 | 4 | 1 | 0 | 1 | 0 |
| Oct | 8 | 6 | 2 | 0 | 0 | 0 |
| Nov (1–19) | 7 | 2 | 2 (1 person) | 1 | 2 | 1 |
| **8 Sep–19 Nov (73 days)** | **21** | **12** | **5** | **1** | **3 (about 1.2 a month)** | **1 (about 0.4 a month)** |

**Why Stage 1/6 said ~45:**
- That figure is human *sessions* that reached checkout minus completed ones. ShopifyQL, human sessions:

  | Month | Reached checkout | Completed |
  |---|---|---|
  | Aug | 17 | 7 |
  | Sep | 14 | 2 |
  | Oct | 25 | 7 |
  | Nov | 49 | 9 |

- **Most of those sessions never type an email**, so Shopify keeps no abandoned checkout and nobody can be emailed.
- The real count of people we can contact is about 1–2 a month. Only about 0.4 a month are subscribed. VERIFIED (counts) / ESTIMATE (rate).

**Recovered orders = 0 visible.**
- 33 of 43 orders have journey data. None shows an abandoned-cart or Shopify Email UTM, or a marketing event.
- ShopifyQL shows 0 sessions with an email UTM since 1 Jul.
- 10 orders have no journey data, so for those: UNKNOWN.
- HQ Stage 1 recorded 3 sends Sep–Oct, 1 click and 0 orders. **Those 3 sends match the 3 subscribed checkouts of 8 Sep, 1 Oct and 29 Oct** (HYPOTHESIS: the count and dates fit, but the send log cannot be read). **All 3 people bought anyway, and one had already bought 5 minutes earlier.**
- **Recovery rate = UNKNOWN** (0 attributed out of 1 currently eligible; too few to measure).

## 8. Automation status (`automation-status.csv`)

**What the API returns:**
- `marketingActivities` returns 0 records.
- The Admin API (2026-10) has no automation or workflow status field.
- Two marketing events exist:
  - **Messaging email "Your bed is saved in your basket"** (Shopify Email): started 11 Feb 2026 11:51, end date empty. An open event does not prove the workflow is Active.
  - **Old "Abandoned checkout emails by Shopify"** (Online Store, `utm_campaign=shopify_cart_reminder`): started 11 Feb 11:49 and **ended 11:51**. So the old Settings → Notifications email was replaced two minutes later. Probably OFF (ESTIMATE). The duplicate-send risk looks low, but confirm.

**Status = UNKNOWN (not Draft, not Active).**

**Known facts (HISTORICAL):**
- The owner edited the workflow on 19 Nov, and the editor warned it reverts to Draft.
- The owner has not confirmed turning it back on.
- The audience is "Customers subscribed to email marketing".
- It made 3 sends in Sep–Oct: 1 click, 0 orders.

**Owner check (2 minutes, screenshot):**
1. Shopify admin → **Marketing** (or **Messaging**) → **Automations** → row **"Recover abandoned checkout"** (email "Your bed is saved in your basket" / "You left items at checkout"). Read the **status badge** (Active / Draft / Paused). Screenshot the row.
2. Open it and screenshot the workflow. Note:
   - the first **Wait** time;
   - whether a second email exists;
   - the audience condition ("subscribed to email marketing").
3. If the badge says Draft or Paused, apply the corrected copy below first (or at least remove "Clearpay"), then click **Turn on**. Screenshot again.
4. **Settings → Notifications → Customer notifications → Abandoned checkout.** Confirm it is managed by the automation, or that automatic sending is OFF. Screenshot.
5. Look at the automation report for the last 90 days (sends, sessions, orders). Screenshot.

## 9. Recommended configuration (for owner approval; NOT applied)

| Setting | Recommendation |
|---|---|
| Trigger | Customer abandons checkout (email entered, no order) |
| Email 1 | **1 hour** after abandonment: "Your bed is saved" |
| Email 2 | **24 hours** after abandonment, only if there is still no order: "Questions answered" (corrected copy below) |
| Audience | **Subscribed to email marketing only** (as now). Sending to non-subscribers under the PECR soft opt-in is **not** recommended until compliance answers Q1 (`04-compliance.md`). Also wait for Q2 (pre-ticked box) |
| Purchaser exclusion | Shopify stops the flow when that checkout completes. **Add a condition "customer has not placed an order in the last 1 day"** if the editor offers one. The 1 Oct case shows a buyer can open a new checkout after ordering. Before any manual contact, always check for a later order (Stage 1 Q4) |
| Discounts | None |
| UTM | On non-checkout links only: `?utm_source=shopify-email&utm_medium=email&utm_campaign=ao-abandoned-checkout&utm_content=swatch-link`. Leave the built-in checkout button link alone |
| Measure | Recovered orders ÷ automation-eligible checkouts each month. Expect 0–2 eligible a month |

**Corrections to `ops/email/flows/abandoned-checkout.md`.** This is a proposal: that file belongs to Email & SMS and was not edited.

- **Email 2 preview text:** replace "Free delivery, Klarna or Clearpay, 14-day free returns and a 5-year frame warranty." with **"Free delivery, card, PayPal or Klarna, 14-day free returns and a 5-year frame warranty."**
- **Email 2 "Paying" line:** replace "card, PayPal, Klarna or Clearpay at checkout" with **"card, PayPal or Klarna at checkout."**
- **Email 2 "Delivery" line:** keep "Room of choice drop off is +£29.99 and room of choice assembly is +£69.99, both optional." This matches BRIEF. Never write that assembly is free or included.
- **Email 1 swatch link:** `www.eaglebed.co.uk/pages/request-a-swatch?utm_source=shopify-email&utm_medium=email&utm_campaign=ao-abandoned-checkout&utm_content=swatch-link`
- Everything else stays as drafted: no discount, no countdown, no "only X left", no delivery-date promise.

**Bot noise:** 57% of abandoned checkouts are bots. Bot protection is already queued (Stage 1 Q3: Settings → Checkout → bot protection). Bot checkouts are not subscribed, so they do not trigger the automation, but they pollute every checkout count.

---

# ANSWER F: Returning customers (Part 7)

## 10. What the order lines show

- **Repeat buying is rare (2 of 36 buyers) and is "another bed in another size", not add-ons.**
- Real, size-specific compatibility gaps:

  | Gap | All buyers | Subscribed |
  |---|---|---|
  | Bed or base bought without a mattress | 24 orders | 9 customers |
  | Base bought without a headboard | – | 8 customers |

- **Marketing is limited to subscribed customers.** The 14 not-subscribed or no-email buyers who bought without a mattress get service messages only.
- Aftercare messages (delivery, assembly, care, one review request after confirmed delivery) are a separate service stream. They are not marketing.

## 11. Compatibility opportunities (subscribed, paid orders only; held until compliance Q2)

| Customer | Order(s) | Bought | Size | Compatible add-on | Ready? |
|---|---|---|---|---|---|
| C002 | #1002, #1005 | 2 Mirror Strip Sunrise frames, no mattress | 4ft6 + 3ft | Mattress 4ft6 and 3ft | Yes (Jul/Aug orders) |
| C004 | #1004 | Side Lift ottoman base, no mattress | Small Double 4ft | Mattress 4ft; headboard 4ft | Yes |
| C008 | #1009 | Side Lift ottoman base, no mattress | King 5ft | Mattress 5ft; headboard 5ft | Yes |
| C015 | #1016 | Line Ambassador frame, no mattress | Double 4ft6 | Mattress 4ft6 | Yes |
| C020 | #1021 | Gas-lift divan base, no mattress | Super King 6ft | Mattress 6ft; headboard 6ft | Yes |
| C007 | #1008 | Divan storage base + mattress | Double 4ft6 | Headboard 4ft6 | Yes |
| C026 | #1027, #1033 | 2 gas-lift bases + mattresses | 6ft + 5ft | Headboards 6ft / 5ft | Yes |
| C027 | #1028 | Gas-lift base + mattress | Double 4ft6 | Headboard 4ft6 | After delivery is confirmed |
| C028 | #1029 | Side Lift base, no mattress | Double 4ft6 | Mattress 4ft6; headboard 4ft6 | After aftercare |
| C030 | #1031 | Cambridge drawer bed, no mattress | Double 4ft6 | Mattress 4ft6 | After aftercare |
| C033 | #1035 | Gas-lift base, no mattress | King 5ft | Mattress 5ft; headboard 5ft | After aftercare |
| C036 | #1038 | Cloud Teddy King frame, no mattress | King 5ft | Mattress 5ft | After aftercare + review (delivered 17 Nov) |
| C010 / C022 / C023 | #1011, #1023, #1024 | Mattress only | King / King / Super King | Base or frame in the same size | Weakest. They probably already have a bed (HYPOTHESIS) |

**Compatibility notes:**
- **Size must match the bed exactly.** The bed page lets shoppers pick any mattress size (Stage 1, finding 8). In any message, name the matching size only.
- **Headboard fit is UNKNOWN.**
  - Bases are sold without a headboard. Headboards are sold separately (Panel Line, Lines Panel, Chester Wingback, Trinity Panel).
  - Owner to confirm the bases take a strut or bolt-on headboard, and which heights suit ottoman bases.
  - Ask before messaging; the customer may already own a headboard.
- **Gas-lift ottoman bases:** confirm that mattress depth and weight suit the gas struts before suggesting a heavy pillow-top. HYPOTHESIS that this matters.
- **Price:** a mattress added as a bed option costs less than the same mattress bought on its own. For example, a 1000 pocket King is £199.99 as an option and £259.99 standalone (Stage 4 data). A returning customer can only buy the standalone product. Quote the standalone price, or ask the owner whether the option price can be offered. Never call the difference a saving or a discount.
- No margin-based ranking was used. Costs are PARKED.

**Eligible actions (after compliance Q2 and owner approval):**
- One plain, size-specific email per customer from the owner, sent after delivery and aftercare are confirmed: "the matching 5ft mattress for your bed".
- No discount and no urgency.
- One message only. Stop on any reply.
- Excluded: E-window customers with open issues (#1040, #1043); refunded or cancelled buyers; the Temu buyer.

---

## Limitations

- **Automation status, send log, delay and audience** cannot be read through the Admin API. Status is UNKNOWN until the owner sends a screenshot.
- **Abandoned checkouts before 8 Sep** are not returned. Whether they were purged or never existed is UNKNOWN.
- **Bot classification** uses patterns (fake-name protonmail, throwaway plus-addresses). It is VERIFIED as a pattern and an ESTIMATE as intent.
- **Matches between checkouts and orders** use the customer record, plus an internal name check for #1035 and #1029. The #1041 match is a HYPOTHESIS: that record has no email.
- **Consent** is the current Shopify state. Whether pre-19 Nov subscriptions are valid is UNKNOWN (compliance Q2).
- **Delivered dates are unreliable.** "Fulfilled" is not "delivered".
- **10 of 43 orders have no journey data**, so first-visit source and email attribution are UNKNOWN for them.
- **Revenue** is order totals including VAT and add-ons, before chargebacks or later edits. #1020 money status is open.
- **D (enquiries)** was not matched to Shopify customers on purpose, to avoid processing more personal data. Their consent = UNKNOWN.

## Credits used

- OpenRush: **0**.
- Shopify Admin GraphQL: about 12 read queries.
- ShopifyQL: 2.
- HQ db: 1 read (inbox).
- Gmail: 0.
- Nothing written to HQ, Shopify or Gmail. Nothing committed.
