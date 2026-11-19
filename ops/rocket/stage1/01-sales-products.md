# Project Rocket Sales, Stage 1, Parts 1 and 2: true sales baseline and products

Prepared 19 Nov 2026 by Analytics + Profit & Cash. Read-only. Store 0whctf-mu (GBP).
Sources: Shopify ShopifyQL (`run-analytics-query`) and Shopify Admin GraphQL (`orders`, `products`, `productsCount`), all pulled on 19 Nov 2026.
No customer personal data is in this report. Order numbers only.

Date windows used (inclusive):

| Window | Dates | Note |
|---|---|---|
| Last 30 | 20 Oct to 19 Nov 2026 | Same as owner screenshot |
| Previous 30 | 19 Sep to 19 Oct 2026 | Same as owner screenshot |
| Last 90 | 22 Aug to 19 Nov 2026 | |
| Previous 90 | 24 May to 21 Aug 2026 | First ever order is #1001 on 13 Jul 2026, so this window really holds about 40 days of trading |

19 Nov is today, so the last 30 and last 90 windows contain a part day.

---

## PART 1: True sales baseline

### 1.1 Headline numbers (VERIFIED, ShopifyQL `FROM sales` and `FROM sessions`)

Sessions are **human sessions only** (`human_or_bot_session = 'human'`). This is what the Shopify dashboard shows. All-sessions numbers including bots are in 1.4.

| Metric | Last 30 | Prev 30 | Change | Last 90 | Prev 90 | Change |
|---|---|---|---|---|---|---|
| Orders | 16 | 8 | +100% | 36 | 7 | +414% |
| Paid (financial status PAID) | 16 | 8 (1 of them cancelled, see 1.3) | | 34 | 5 | |
| Cancelled | 0 | 1 (#1020) | | 3 (#1010, #1014, #1020) | 0 | |
| Refunded | 0 | 0 | | 0 | 2 (#1001, #1006) | |
| Fulfilled (status FULFILLED) | 16 | 7 (+1 "not required") | | 35 (incl. 2 cancelled) | 7 | |
| Gross sales | £7,472.64 | £3,257.86 | +129.4% | £15,158.33 | £2,611.95 | +480% |
| Discounts | -£615.07 | -£157.86 | +289.6% | -£1,009.06 | -£144.96 | |
| Returns (reversals) | £0.00 | -£585.90 | | -£585.90 | -£514.80 | |
| Net sales | £6,857.57 | £2,514.10 | +172.8% | £13,563.37 | £1,952.19 | +595% |
| Shipping | £90.00 | £0.00 | | £90.00 | £0.00 | |
| Taxes | £0.00 | £0.00 | | £0.00 | £61.62 (TEMU order #1003) | |
| Total sales | £6,947.57 | £2,514.10 | +176.3% | £13,653.37 | £2,013.81 | +578% |
| AOV (Shopify: gross minus discounts / orders) | £428.60 | £387.50 | +10.6% | £393.04 | £352.43 | +11.5% |
| Sessions (human) | 1,489 | 2,431 | -38.7% | 6,447 | 2,112 | +205% |
| Online store visitors (human) | 1,144 | 2,176 | -47.4% | 5,478 | 1,783 | |
| Sessions with add to cart | 180 | 100 | +80% | 353 | 65 | |
| Sessions reached checkout | 57 | 27 | +111% | 95 | 15 | |
| Sessions completed checkout | 12 | 4 | +200% | 21 | 6 | |
| Shopify conversion rate | 0.81% | 0.16% | +390% | 0.33% | 0.28% | |
| New customer orders | 15 | 8 | | 35 | 6 | |
| Returning customer orders | 1 | 0 | | 1 | 1 | |
| Returning customer rate | 6.25% | 0% | | 2.86% | 16.7% | |

Plain English: the last 30 days were the best month the store has had. 16 orders, £6,857.57 net. The last 90 days hold 36 of the store's 43 orders ever.

### 1.2 Owner screenshot check (HISTORICAL screenshot vs VERIFIED pull)

| Metric | Screenshot | Shopify now | Match? |
|---|---|---|---|
| Gross sales | £7,472.64 | £7,472.64 | Yes |
| Discounts | -£615.07 | -£615.07 | Yes |
| Net sales | £6,857.57 | £6,857.57 | Yes |
| Shipping | £90 | £90.00 | Yes |
| Total sales | £6,947.57 | £6,947.57 | Yes |
| Orders | 16 | 16 | Yes |
| Sessions | 1,489 | 1,489 human (1,972 incl. bots) | Yes, human only |
| Conversion rate | 0.8% | 0.81% (12 / 1,489) | Yes |
| AOV | £428.59 | £428.60 (£6,857.57 / 16 = £428.598) | Yes (rounding) |
| Returning customer rate | 6.25% | 6.25% (1 of 16) | Yes |
| Fulfilled orders | 16 | 16 | Yes |
| Gross change | +129% | +129.4% | Yes |
| Net change | +173% | +172.8% | Yes |
| Orders change | +100% | +100% | Yes |
| Sessions change | -37% | -38.7% (2,431 to 1,489) | Close, not exact |
| CR change | +378% | +390% (0.165% to 0.806%) | Close, not exact |
| AOV change | +11% | +10.6% | Yes |

Why sessions and CR change differ a little: the screenshot implies about 2,360 previous-period human sessions. Shopify now says 2,431. Shopify re-classifies sessions as bot or human after the fact, and the screenshot may have been taken earlier in the day. The gap is about 70 sessions (3%). It does not change any conclusion. Cause = ESTIMATE.

### 1.3 Things the headline hides (VERIFIED from GraphQL orders)

1. **The previous-30 "returns" of -£585.90 are not product returns.** They are two old orders cancelled on 25 Sep: #1010 (£275.40, placed 26 Aug) and #1014 (£310.50, placed 1 Sep). Both show payment status EXPIRED, so the money was probably never captured. Both were also marked FULFILLED before being cancelled.
2. **#1020 (23 Sep, £273.59) was cancelled 18 minutes after it was placed, but still shows PAID with £0 refunded.** Shopify's sales totals did not reverse it: three cancellations total £859.49, but reported returns are £585.90. The £273.59 gap is exactly #1020. So previous-30 and last-90 net sales are overstated by £273.59, unless the money was refunded outside Shopify. Status: UNKNOWN. **Owner should check #1020.**
   - Adjusted previous-30 net sales: £2,514.10 - £273.59 = £2,240.51 (ESTIMATE). That would make the net change +206%, not +173%.
   - Adjusted last-90 net sales: £13,563.37 - £273.59 = £13,289.78 (ESTIMATE).
3. **The only refunds ever are 2 orders in July and August** (#1001 Finger Panel bed £257.40, #1006 Line Kids bed £257.40). There have been no refunds since 21 Aug.
4. **Draft orders.** 8 of the 43 orders are draft orders tagged `vopo` / `selections-addon` (the VO Product Options app adds paid options as a separate "Selections" line with no product). Six of them are in the last 90 days and none are in the last 30. The add-on lines total £656.55 net in 90 days. They show in reports as a blank product.
5. **One TEMU order** (#1003, 30 Jul, £369.69 including £61.62 VAT). It is the only order with tax recorded. All web orders show £0 tax. Whether prices include VAT or the store is not VAT-registered is UNKNOWN from Shopify data.
6. **Shipping:** £90 comes from one order (#1038, Cloud Teddy King). Every other order shipped free.
7. **Sales channel:** all 16 last-30 orders are Online Store, web checkout.

### 1.4 Conversion rate: Shopify CR vs orders / sessions (VERIFIED)

| Measure | Last 30 | Prev 30 | Last 90 |
|---|---|---|---|
| Shopify CR = sessions that completed checkout / human sessions | 12 / 1,489 = **0.81%** | 4 / 2,431 = 0.16% | 21 / 6,447 = 0.33% |
| Orders / human sessions | 16 / 1,489 = **1.07%** | 8 / 2,431 = 0.33% | 36 / 6,447 = 0.56% |
| Orders / all sessions incl. bots | 16 / 1,972 = 0.81% | 8 / 2,841 = 0.28% | 36 / 7,888 = 0.46% |
| `num_orders` in sessions data (last 30) | 12 | | |

Why 16 orders but only 12 converting sessions:
- The sessions data itself only links 12 orders to a visit (`num_orders` = 12). So 4 of the 16 orders have no matching online store session.
- Likely causes (ESTIMATE): visitors who declined cookies or block tracking, so Shopify cannot tie the order to a session; a checkout completed in a session that started outside the window; or a customer who completed checkout from a link (for example a recovered abandoned-checkout email). Draft orders explain the gap in earlier months, but there are none in the last 30.
- Shopify's CR therefore **under-counts real buying**. True orders per human session is about 1.07% in the last 30 days.

Bot traffic matters:
- 483 of 1,972 sessions in the last 30 days (24%) are bots.
- **Bots "reached checkout" 106 times, compared with 57 for humans.** Any abandoned-checkout or "reached checkout" figure that includes bots is badly inflated. Most of it is desktop (127 desktop checkouts reached in total, only 21 human).

### 1.5 The 21 Sep 2026 sessions measurement change

- HISTORICAL (owner note): Shopify changed how sessions are measured on 21 Sep 2026. I could not find Shopify's own write-up of this change through the docs tool, so the exact effect is UNKNOWN.
- VERIFIED (daily human sessions): there is **no clear step on 21 Sep**. Daily sessions ran at 100 to 170 from 13 Sep to 29 Sep (with a peak of 210 on 26 Sep). They then fell to 36 to 80 a day from 30 Sep / 1 Oct.
- Weekly human sessions: 986 (w/c 14 Sep), 900 (21 Sep), 531 (28 Sep), 257 (5 Oct), 391 (12 Oct), 419 (19 Oct), 279, 354, 363.
- Meaning: the previous-30 window (19 Sep to 19 Oct) contains the tail of a mid-September traffic spike. "Sessions -37%" mostly compares a spike with normal traffic. It is not a collapse. Search referrals fell from 1,364 to 782 and direct visits from 928 to 678 (human, VERIFIED).
- Because the change date falls inside the previous-30 window, session comparisons across 21 Sep should be treated with caution. Sales and order numbers are not affected.

### 1.6 Discount codes (VERIFIED, ShopifyQL `GROUP BY discount_code` + GraphQL)

| Window | Code | Orders | Gross on those orders | Discount cost | Share of all orders |
|---|---|---|---|---|---|
| Last 30 | EAGLE10 | 13 | £6,151.70 | **£615.07** | 81% (13/16) |
| Last 30 | none | 3 | £1,320.94 | £0 | |
| Prev 30 | EAGLE10 | 4 (incl. cancelled #1020) | £1,578.93 | £157.86 | 50% |
| Last 90 | EAGLE10 | 24 | £10,092.54 | **£1,009.06** | 67% (24/36) |
| Prev 90 | EAGLE10 | 4 | | £144.96 | 57% |
| Prev 90 | "discount" (TEMU import) | 1 | | £0 | |

- EAGLE10 is the **only** code that costs money. It is 10% off and is 100% of all discounts.
- Since 13 Jul the store has given away **£1,154.02** through EAGLE10 (£1,009.06 + £144.96).
- It is used on 4 out of 5 recent orders. It works as a standard price cut, not as a targeted offer. Whether those buyers would have paid full price is UNKNOWN.

### 1.7 Fulfilment timing (VERIFIED, GraphQL `fulfillments.createdAt` vs `order.createdAt`)

These are handmade beds, yet most orders are marked "fulfilled" within hours of purchase.

| Last-30 order | Placed to marked fulfilled | Carrier / tracking |
|---|---|---|
| #1042 | 8 min | none |
| #1038 | 19 min | none |
| #1041 | 37 min | none |
| #1033 | 38 min | none |
| #1039 | 38 min | none |
| #1032 | 42 min | none |
| #1035 | 1 h 25 min | none |
| #1029 | 2 h 14 min | none |
| #1034 | 3 h 22 min | none |
| #1043 | 3 h 36 min | none |
| #1031 | 4 h 57 min | none |
| #1040 | 5 h 17 min | none |
| #1036 | 5 h 42 min | none |
| #1037 | 5 h 48 min | none |
| #1030 | 21 h 44 min | none |
| #1028 | 2 days 2 h | none |

- Median: about 2 h 48 min. 6 of 16 were marked fulfilled within 1 hour, and 14 of 16 within 6 hours.
- None of the 16 has tracking. Across all 43 orders, only #1003 (TEMU, EVRI) and #1022 (DPD) have a carrier.
- Cancelled orders #1010 and #1014 were also marked fulfilled.
- Meaning: in this store, "fulfilled" means "accepted / in production". It does not mean "shipped" or "delivered". Shopify's fulfilment reports and the customer's "your order has shipped" email (if it is turned on) do not reflect real delivery. Real lead time and delivery dates are UNKNOWN from Shopify.

### 1.8 Device split (VERIFIED, human sessions, ShopifyQL `GROUP BY session_device_type`)

| Device | Window | Sessions | Share | Add to cart | Reached checkout | Completed checkout | CR |
|---|---|---|---|---|---|---|---|
| Mobile | Last 30 | 1,204 | 80.9% | 139 | 36 | **11** | 0.91% |
| Desktop | Last 30 | 265 | 17.8% | 37 | 21 | 1 | 0.38% |
| Tablet | Last 30 | 20 | 1.3% | 4 | 0 | 0 | 0% |
| Mobile | Prev 30 | 2,005 | 82.5% | 87 | 22 | 4 | 0.20% |
| Desktop | Prev 30 | 383 | 15.8% | 13 | 5 | 0 | 0% |
| Tablet | Prev 30 | 42 | 1.7% | 0 | 0 | 0 | 0% |
| Mobile | Last 90 | 5,508 | 85.4% | 292 | 67 | 20 | 0.36% |
| Desktop | Last 90 | 853 | 13.2% | 57 | 28 | 1 | 0.12% |

**5 Oct finding revisited:**
- I re-ran 5 Sep to 4 Oct. Mobile had 2,598 human + 79 bot = 2,677 sessions, 65 carts, 12 checkouts and 2 orders. This matches the 5 Oct figures (2,679 → 65 → 12 → 2), so that finding is confirmed (VERIFIED).
- Now mobile is about 81% of human sessions and produced **11 of the 12** converting sessions in the last 30 days. Mobile CR rose from 0.20% to 0.91% (about 4.5x). Mobile add-to-cart rate rose from 4.3% to 11.5%. Mobile is no longer the leak it was.
- Desktop is now the weaker funnel: 21 human checkouts reached → 1 order. Small numbers, so treat this with caution.
- Contributing site changes after 5 Oct are listed in CHANGELOG. Cause and effect is not proven here.

### 1.9 Order list, last 30 days (VERIFIED, no customer data)

| Order | Date | Product | Size | Code | Total |
|---|---|---|---|---|---|
| #1028 | 24 Oct | Ottoman Gas Lift Divan Base | Std Double 4FT6 | EAGLE10 | £362.68 |
| #1029 | 27 Oct | Side Lift Ottoman Storage Base | Std Double 4FT6 | EAGLE10 | £256.50 |
| #1030 | 31 Oct | Side Lift Ottoman Storage Base | Small Double 4FT | EAGLE10 | £247.50 |
| #1031 | 1 Nov | Cambridge Panel Storage Bed | Std Double 4FT6 | EAGLE10 | £323.98 |
| #1032 | 2 Nov | Side Lift Ottoman Storage Base | Small Double 4FT | none | £274.99 |
| #1033 | 3 Nov | Ottoman Gas Lift Divan Base | King | none (returning customer) | £505.98 |
| #1034 | 6 Nov | Eagle Savoy Channel Bed | King | EAGLE10 | £823.48 |
| #1035 | 6 Nov | Ottoman Gas Lift Divan Base | King | EAGLE10 | £275.40 |
| #1036 | 7 Nov | Royal Chesterfield Bed | Std Double | EAGLE10 | £629.96 |
| #1037 | 8 Nov | Side Lift Ottoman Storage Base | Std Double 4FT6 | EAGLE10 | £301.49 |
| #1038 | 9 Nov | Cloud Teddy Bouclé Ottoman Bed | King | EAGLE10 | £511.20 (incl. £90 shipping) |
| #1039 | 10 Nov | Ottoman Gas Lift Divan Base | Small Double 4FT | EAGLE10 | £255.59 |
| #1040 | 13 Nov | Cloud Teddy Bouclé Ottoman Bed | King | EAGLE10 | £556.19 |
| #1041 | 13 Nov | Eagle Regal Gold-Trim Bed | Super King | EAGLE10 | £503.98 |
| #1042 | 14 Nov | Curved Wingback Bed | King | EAGLE10 | £578.68 |
| #1043 | 18 Nov | Grand Extra-Tall Panel Bed | King 5FT | none | £539.97 |

The same product at the same size sells at different prices (for example Ottoman Gas Lift King at £275.40, £505.98 and £663.98 across orders). These are option/upgrade choices built into the line price. Not investigated further here.

---

## PART 2: Products

### 2.1 Catalogue size (VERIFIED, GraphQL `productsCount`)

| Status | Count |
|---|---|
| Active | 187 |
| Active and published (live on store) | **145** |
| Active but unpublished | 42 (24 Aug "storage divan" and "kids" batch, plus all 9 from 6 Oct) |
| Draft | 70 |
| Archived | 0 |

### 2.2 Sales by product, last 90 days (VERIFIED, ShopifyQL `FROM sales GROUP BY product_title`)

ASP = net sales / net units. "Selections" add-on lines are shown separately.

| # | Product | Product ID | Type | Units ordered | Net units | Orders | Gross | Discounts | Returns | Net | ASP | Sizes sold (net units) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Ottoman Gas Lift Divan Base | 15524049387851 | Ottoman Bed | 9 | 7 | 9 | £3,392.86 | -£222.23 | -£504.00 | £2,666.63 | £380.95 | King 3, SK 2, 4FT6 1, 4FT 1 |
| 2 | Side Lift Ottoman Storage Base | 15524047782219 | Ottoman Bed | 7 | 6 | 7 | £2,025.92 | -£175.04 | -£247.50 | £1,603.38 | £267.23 | 4FT 3, 4FT6 2, King 1 |
| 3 | Cloud Teddy Bouclé Ottoman Bed | 15524048699723 | Ottoman Bed | 2 | 2 | 2 | £1,085.97 | -£108.58 | £0 | £977.39 | £488.70 | King 2 |
| 4 | Eagle Savoy Channel Bed | 15948310675787 | Bed Frame | 1 | 1 | 1 | £914.97 | -£91.49 | £0 | £823.48 | £823.48 | King |
| 5 | Royal Chesterfield Bed | 15948324307275 | Bed Frame | 1 | 1 | 1 | £699.95 | -£69.99 | £0 | £629.96 | £629.96 | Std Double |
| 6 | 3000 Pocket Sprung Mattress | 15524053942603 | Mattress | 2 | 2 | 2 | £623.98 | -£28.59 | £0 | £595.39 | £297.70 | King 1, SK 1 |
| 7 | Regal Luxe Panel Bed | 15948322898251 | Bed Frame | 1 | 1 | 1 | £578.97 | £0 | £0 | £578.97 | £578.97 | Std Double |
| 8 | Curved Wingback Bed | 15524053352779 | Bed Frame | 1 | 1 | 1 | £642.97 | -£64.29 | £0 | £578.68 | £578.68 | King |
| 9 | Elegant Panel Bed | 15948329189707 | Bed Frame | 1 | 1 | 1 | £624.97 | -£62.49 | £0 | £562.48 | £562.48 | Small Double |
| 10 | Eagle Sunrise Fan Panel Bed | 15948310249803 | Bed Frame | 1 | 1 | 1 | £549.98 | £0 | £0 | £549.98 | £549.98 | King |
| 11 | Grand Extra-Tall Panel Bed | 15948341281099 | Bed Frame | 1 | 1 | 1 | £539.97 | £0 | £0 | £539.97 | £539.97 | King |
| 12 | Eagle Regal Gold-Trim Bed | 15948309987659 | Bed Frame | 1 | 1 | 1 | £559.97 | -£55.99 | £0 | £503.98 | £503.98 | Super King |
| 13 | Mirror Strip Sunrise Bed | 15524047880523 | Bed Frame | 1 | 1 | 1 | £428.99 | £0 | £0 | £428.99 | £428.99 | Super King |
| 14 | Line Ambassador Bed | 15524048830795 | Bed Frame | 1 | 1 | 1 | £389.99 | -£38.99 | £0 | £351.00 | £351.00 | Std Double (White) |
| 15 | Line Kids Velvet Bed | 15524048404811 | Kids Bed | 1 | 1 | 1 | £350.99 | £0 | £0 | £350.99 | £350.99 | Small Double |
| 16 | Hilton Wingback Bed | 15524053549387 | Bed Frame | 1 | 1 | 1 | £363.99 | -£36.39 | £0 | £327.60 | £327.60 | Small Double |
| 17 | Cambridge Panel Storage Bed with Drawers | 15948313133387 | Divan Bed | 1 | 1 | 1 | £359.97 | -£35.99 | £0 | £323.98 | £323.98 | Std Double |
| 18 | Memory Orthopaedic Mattress | 15524052795723 | Mattress | 1 | 1 | 1 | £220.99 | £0 | £0 | £220.99 | £220.99 | King |
| 19 | Divan Storage Base with Drawers | 15524049256779 | Divan Bed | 1 | 1 | 1 | £194.99 | £0 | £0 | £194.99 | £194.99 | Std Double |
| 20 | Upholstered Ottoman Storage Box | 15524052762955 | Storage Box | 1 | 1 | 1 | £97.99 | £0 | £0 | £97.99 | £97.99 | n/a |
| – | "Selections" add-on lines (no product) | – | – | 6 | 4 | 6 | £509.95 | -£19.00 | +£165.60 | £656.55 | – | – |
| | **Total** | | | 42 | 37 | 36 | £15,158.33 | -£1,009.06 | -£585.90 | £13,563.37 | | |

All 20 products are active and published. Product-level returns do not reconcile neatly because the add-on lines carry a positive +£165.60 reversal. The totals are correct at order level, apart from the #1020 issue in 1.3.

**By product type, last 90 days:**

| Type | Net units | Net sales | Share |
|---|---|---|---|
| Ottoman Bed | 15 | £5,247.40 | 38.7% |
| Bed Frame | 11 | £5,875.09 | 43.3% |
| Mattress | 3 | £816.38 | 6.0% |
| Divan Bed | 2 | £518.97 | 3.8% |
| Kids Bed | 1 | £350.99 | 2.6% |
| Storage Box | 1 | £97.99 | 0.7% |
| Add-on selections | 4 | £656.55 | 4.8% |

### 2.3 Sales by product, last 30 vs previous 30 (VERIFIED)

| Product | Last 30 net units | Last 30 net | Prev 30 net units | Prev 30 net | Direction |
|---|---|---|---|---|---|
| Ottoman Gas Lift Divan Base | 4 | £1,399.65 | 1 (3 ordered, 1 cancel reversal) | £716.18 | Up |
| Side Lift Ottoman Storage Base | 4 | £1,080.48 | -1 (cancel reversal of #1014) | -£247.50 | Up strongly |
| Cloud Teddy Bouclé Ottoman Bed | 2 | £977.39 | 0 | £0 | New seller |
| Eagle Savoy Channel Bed | 1 | £823.48 | 0 | £0 | New seller |
| Royal Chesterfield Bed | 1 | £629.96 | 0 | £0 | New seller |
| Curved Wingback Bed | 1 | £578.68 | 0 | £0 | New seller |
| Grand Extra-Tall Panel Bed | 1 | £539.97 | 0 | £0 | New seller |
| Eagle Regal Gold-Trim Bed | 1 | £503.98 | 0 | £0 | New seller |
| Cambridge Panel Storage Bed | 1 | £323.98 | 0 | £0 | New seller |
| 3000 Pocket Sprung Mattress | 0 | £0 | 2 | £595.39 | Down |
| Regal Luxe Panel Bed | 0 | £0 | 1 | £578.97 | Down |
| Elegant Panel Bed | 0 | £0 | 1 | £562.48 | Down |
| Upholstered Ottoman Storage Box | 0 | £0 | 1 | £97.99 | Down |
| Add-on selections | 0 | £0 | -1 | £210.59 | – |

Last 30 days: 9 products sold. Ottoman beds (3 products) were 10 of 16 orders and £3,457.52 of £6,857.57 net (50%).

### 2.4 Previous 90 days (24 May to 21 Aug; VERIFIED, about 40 trading days)

| Product | Net units | Net |
|---|---|---|
| Line Kids Velvet Bed | 3 (1 later refunded; refunds are booked to the blank line) | £818.99 |
| Mirror Strip Sunrise Bed | 2 | £623.98 |
| 3000 Pocket Sprung Mattress (TEMU) | 1 | £308.07 |
| Finger Panel Bed (refunded) | 1 | £257.40 |
| Side Lift Ottoman Storage Base | 1 | £228.60 |
| Add-ons / refunds line | 2 | -£284.85 |
| **Total** | 10 | £1,952.19 |

### 2.5 Product landing-page traffic (VERIFIED, ShopifyQL `FROM sessions`, human, `landing_page_type = 'Product'`)

Limitation: ShopifyQL here gives sessions by **landing page** only (the first page of a visit). It does not give all product page views. Product landing pages started 4,597 of 6,447 human sessions (71%) in 90 days.

**Last 90 days, top product landing pages:**

| Landing page | Sessions | Carts | Reached checkout | Completed | Units sold (90d, any route) |
|---|---|---|---|---|---|
| ottoman-gas-lift-divan-base | 604 | 27 | 3 | 2 | 7 net (9 orders) |
| line-bumper-ottoman-divan-bed | 441 | 28 | 2 | 0 | **0** |
| line-ambassador-upholstered-bed-frame | 373 | 26 | 2 | 0 | 1 |
| side-lift-ottoman-gas-lift-storage-bed | 274 | 19 | 6 | 3 | 6 net |
| stone-upholstered-bed-frame | 270 | 2 | 1 | 0 | **0** |
| mini-line-wingback-kids-bed | 248 | 10 | 0 | 0 | **0** |
| line-kids-upholstered-bed | 205 | 8 | 0 | 1 | 1 |
| cloud-teddy-boucle-ottoman-gas-lift-storage-bed | 124 | 16 | 5 | 0 | 2 |
| divan-drawer-storage-base | 119 | 2 | 0 | 0 | 1 |
| grand-extra-high-vertical-panel-upholstered-bed-frame | 116 | 17 | 2 | 0 | 1 |
| grand-princess-upholstered-bed-frame | 109 | 2 | 0 | 0 | **0** |
| royal-chesterfield-upholstered-bed | 64 | 11 | 3 | 1 | 1 |
| royal-chesterfield-wingback-bed-frame | 61 | 1 | 1 | 0 | **0** |
| small-line-divan-upholstered-bed | 61 | 0 | 0 | 0 | **0** |
| mini-line-wingback-upholstered-bed | 55 | 7 | 2 | 0 | **0** |
| oxygen-upholstered-bed-frame | 47 | 3 | 0 | 0 | **0** |
| cambridge-curved-headboard | 42 | 1 | 0 | 0 | **0** |
| modern-upholstered-wingback-bed-headboard | 40 | 1 | 0 | 0 | **0** |
| savoy-channel-tufted-bed-frame | 36 | 8 | **9** | 1 | 1 |
| kensington-chesterfield-bed-frame | 34 | 0 | 0 | 0 | **0** |
| roxy-curved-wingback-upholstered-bed | 33 | 2 | 1 | 0 | **0** |

**Last 30 days, top product landing pages:** Grand Extra-Tall 112 (16 carts, 1 sale), Line Ambassador 89 (12 carts, 0 sales), Line Bumper Ottoman 82 (13 carts, 0 sales), Ottoman Gas Lift 79 (2 completed), Side Lift 63, Royal Chesterfield 60 (11 carts), Line Kids 32, Cambridge Curved Headboard 27, Grand Princess 26, Cloud Teddy 26 (8 carts, 3 checkouts), Curved Wingback 21, Mini Line Wingback Kids 21, Savoy 20 (6 carts, 9 checkouts reached, 1 sale).

### 2.6 Categories A to G

**A. Best sellers (units, 90 days):**
1. Ottoman Gas Lift Divan Base: 7 net units, 9 orders.
2. Side Lift Ottoman Storage Base: 6 net units, 7 orders.
3. Cloud Teddy Bouclé Ottoman Bed and 3000 Pocket Sprung Mattress: 2 each.
4. Everything else: 1 unit.

**B. Highest revenue (net, 90 days):**
1. Ottoman Gas Lift £2,666.63
2. Side Lift Ottoman £1,603.38
3. Cloud Teddy £977.39
4. Savoy Channel £823.48
5. Royal Chesterfield £629.96

**C. Growing (last 30 vs previous 30):**
- Side Lift Ottoman (0 → 4).
- Ottoman Gas Lift (1 → 4 net).
- Cloud Teddy (0 → 2).
- Plus first sales for Savoy, Royal Chesterfield, Curved Wingback, Grand Extra-Tall, Regal Gold-Trim and Cambridge Storage.

**D. Declining:**
- 3000 Pocket Sprung Mattress (2 → 0). Mattresses sold nothing in the last 30 days.
- Regal Luxe, Elegant Panel and the Ottoman Storage Box each went from 1 to 0.
- Earlier sellers that have faded since July and August: Line Kids Velvet (3 in previous 90, 1 in last 90, 0 in last 60), Mirror Strip Sunrise (2 → 1), Finger Panel (1 refunded → 0).

**E. Traffic but weak sales (90 days, human landing sessions, at most 1 sale):**

| Product page | Sessions | Carts | Sales |
|---|---|---|---|
| Line Bumper Ottoman Divan Bed | 441 | 28 | 0 |
| Line Ambassador Bed | 373 | 26 | 1 |
| Stone Premium Bed | 270 | 2 | 0 |
| Mini Line Wingback Kids Bed | 248 | 10 | 0 |
| Line Kids Velvet Bed | 205 | 8 | 1 |
| Grand Princess Bed | 109 | 2 | 0 |
| Divan Storage Base with Drawers | 119 | 2 | 1 |
| Grand Extra-Tall Panel Bed | 116 | 17 | 1 |

- Line Bumper Ottoman and Line Ambassador both get many carts but no sales. That points to a price, option or delivery-cost surprise, not low interest. This is a HYPOTHESIS, not tested.
- Savoy is a special case: 9 sessions reached checkout from 36 landings, but only 1 sale. That is a checkout leak on the highest-value product.

**F. No meaningful sales:**
- **125 of the 145 live (published) products (86%) sold nothing in the last 90 days.** Only 20 products sold.
- Only 9 products sold in the last 30 days, so 136 of 145 (94%) sold nothing in the last 30 days.
- All 42 active-but-unpublished products also sold nothing (expected, they are not on the store).
- Whole types with zero sales in 90 days: Headboards (17 live headboards, 0 sales), Pillow Top / Memory Foam / 1000 / 2000 pocket mattresses, and all kids beds except Line Kids Velvet.

**G. New products to watch:**
- 8 of the bed frames added on 24 Aug have sold: Savoy, Royal Chesterfield, Regal Luxe, Elegant Panel, Eagle Sunrise Fan, Grand Extra-Tall, Regal Gold-Trim and Cambridge Storage.
- Together that is **£4,512.80 net (33% of 90-day net)** at an average of £564 per unit, well above the store AOV.
- Watch Grand Extra-Tall (the top landing page in the last 30 days, with 16 carts) and Royal Chesterfield (11 carts from 60 landings).
- The 9 products added on 6 Oct are all unpublished, so they have no data.

### 2.7 Top 20 by commercial performance (90 days, ranked by net sales; VERIFIED)

Only 20 products sold in 90 days, so the top 20 is every product that sold.

| Rank | Product | Net | Net units | Product landing sessions (90d) | Trend (L30 vs P30) |
|---|---|---|---|---|---|
| 1 | Ottoman Gas Lift Divan Base | £2,666.63 | 7 | 604 | Up |
| 2 | Side Lift Ottoman Storage Base | £1,603.38 | 6 | 274 | Up |
| 3 | Cloud Teddy Bouclé Ottoman Bed | £977.39 | 2 | 124 | New |
| 4 | Eagle Savoy Channel Bed | £823.48 | 1 | 36 | New |
| 5 | Royal Chesterfield Bed | £629.96 | 1 | 64 | New |
| 6 | 3000 Pocket Sprung Mattress | £595.39 | 2 | under 12 | Down |
| 7 | Regal Luxe Panel Bed | £578.97 | 1 | under 12 | Down |
| 8 | Curved Wingback Bed | £578.68 | 1 | 38 | New |
| 9 | Elegant Panel Bed | £562.48 | 1 | 19 | Down |
| 10 | Eagle Sunrise Fan Panel Bed | £549.98 | 1 | under 12 | Flat (sold 18 Sep) |
| 11 | Grand Extra-Tall Panel Bed | £539.97 | 1 | 116 | New |
| 12 | Eagle Regal Gold-Trim Bed | £503.98 | 1 | 36 | New |
| 13 | Mirror Strip Sunrise Bed | £428.99 | 1 | 39 | Flat (sold 31 Aug) |
| 14 | Line Ambassador Bed | £351.00 | 1 | 373 | Flat (sold 8 Sep) |
| 15 | Line Kids Velvet Bed | £350.99 | 1 | 205 | Flat (sold 15 Sep) |
| 16 | Hilton Wingback Bed | £327.60 | 1 | 14 | Flat (sold 31 Aug) |
| 17 | Cambridge Panel Storage Bed | £323.98 | 1 | 7 (L30) | New |
| 18 | Memory Orthopaedic Mattress | £220.99 | 1 | 22 | Flat (sold 30 Aug) |
| 19 | Divan Storage Base with Drawers | £194.99 | 1 | 119 | Flat (sold 24 Aug) |
| 20 | Upholstered Ottoman Storage Box | £97.99 | 1 | 27 | Down |

"Under 12" means the page was not in the top 60 landing pages, so it had fewer than 12 human landing sessions.

### 2.8 Size mix (VERIFIED, net units of sized products, excluding storage box and add-ons)

| Size | Last 90 units | Share | Last 30 units | Prev 90 (orders #1001 to #1007) |
|---|---|---|---|---|
| King (5FT) | 12 | 37.5% | 7 | 1 (TEMU mattress) |
| Super King (6FT) | 5 | 15.6% | 1 | 0 |
| Standard Double (4FT6) | 8 | 25.0% | 5 | 1 |
| Small Double (4FT) | 7 | 21.9% | 3 | 1 |
| Single / Kids Single | 0 | 0% | 0 | 5 (2 refunded) |
| **Total** | 32 | | 16 | 8 |

- King and Super King together are 53% of units in 90 days and 50% in the last 30.
- No single beds have sold since 21 Aug. The mix has moved from singles and kids beds (July and August) to King-size adult beds and ottomans.

### 2.9 Profit

Profit per product, per order or per month = **UNKNOWN**. Product costs, materials, labour, delivery cost and payment fees are not in Shopify. Only revenue is reported here.

---

## Limitations

- Product traffic is by **landing page only**. Product views that were not the first page of a visit are not counted. A full product-view report was not available through the ShopifyQL fields I could confirm.
- The 21 Sep 2026 Shopify sessions measurement change could not be confirmed from Shopify documentation via the tools. Its effect is UNKNOWN. Daily data shows no visible step on that date.
- The previous-90 window is only about 40 days of trading (first order 13 Jul), so 90-day growth percentages overstate real momentum.
- #1020: whether the £273.59 was refunded outside Shopify is UNKNOWN. Net sales may be overstated by that amount.
- Product-level "returns" do not reconcile line by line, because the VO Product Options add-on lines carry odd reversals. Order-level totals are reliable.
- The difference in sessions -37% vs -38.7% between the screenshot and the live pull is probably Shopify reclassifying bots after the fact. Not proven.
- The 4 last-30 orders without a linked session: the cause is ESTIMATE (cookie consent or blocked tracking most likely).
- "Fulfilled" does not mean shipped. Real lead times and delivery are UNKNOWN from Shopify.
- Small numbers: 16 orders a month means one order moves any product ranking or CR noticeably.
- Profit, margins and product costs: UNKNOWN.
- Last-30 and last-90 windows include today (19 Nov), a part day.

## Credits used

- OpenRush: **0 credits** (no OpenRush calls made). Budget was 0.
- Shopify ShopifyQL: about 25 read-only queries. Shopify Admin GraphQL: 5 read-only queries (orders since 24 May; active products in 2 pages; product counts by status; unpublished active products). No mutations.
