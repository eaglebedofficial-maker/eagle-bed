# Stage 8 · 01 — Revenue baseline, product intelligence, delivery & capacity

Specialists: Analytics, Profit & Cash (revenue-only mode), Product Pages, Workshop Planner, Delivery & Returns.
Parts covered: 2 (baseline + metric dictionary), 3 (Shopify revenue command centre), 4 (product revenue intelligence), 9 (delivery & capacity), 10 Mode A.
Extracted: **20 Nov 2026 01:00 GMT** (Europe/London = GMT). Read-only: Shopify GraphQL + ShopifyQL, Gmail search/read. No changes to any live system.

**PROFITABILITY NOT VERIFIED — COST DATA PARKED.** Every money figure below is revenue. None of it is profit.

## Files

| File | What it holds |
|---|---|
| `metric-dictionary.csv` | 52 KPIs for the command centre: definition, calculation, source, window, last_updated, data_quality, confidence. Covers revenue, orders, AOV, customers, sessions, funnel, ads, organic, recovery, trade, delivery, reviews, credits and profit. |
| `ceo-revenue-baseline.csv` | 240 rows: 24 metrics × 10 windows, each with the previous-period value, % change, source, confidence, data quality and extracted_at. |
| `revenue-trend.csv` | Daily rows from 13 Jul to 20 Nov and weekly rows (weeks start Monday): gross, discounts, net, paid orders, AOV, excluded orders, sessions and funnel. |
| `product-performance.csv` | All 145 published products: catalogue fields, 90-day funnel and sales, organic (Stage 6), paid attribution (Stage 5, keeping its confidence class), classes A–H and every warning. |
| `delivery-capacity.csv` | The 22 orders since 1 Oct, plus a weekly demand vs capacity block (capacity UNKNOWN). |
| HQ db `cmd/revenue`, `cmd/products`, `cmd/delivery` | Command-centre documents (version 1, written 20 Nov). |

## 1. Rules used

- **Basis:** order date (Europe/London). Paid figures exclude the cancelled orders **#1010, #1014 and #1020** and the refunded orders **#1001 and #1006**. Those five are shown separately.
- **Windows:** complete days end yesterday (19 Nov). "Today" is partial, up to 01:00.
  - last 7d: 13–19 Nov
  - last 28d: 23 Oct–19 Nov
  - last 30d: 21 Oct–19 Nov
  - previous 30d: 21 Sep–20 Oct
  - last 90d: 22 Aug–19 Nov
  - previous 90d: 24 May–21 Aug
  - YTD: 1 Jan–20 Nov
  - all-time: 13 Jul–20 Nov
- **Revenue terms:**
  - Gross = subtotal + discounts.
  - Net = gross − discounts − returns.
  - Total = net + shipping + tax.
  - These are never mixed.
- **Sessions:** ShopifyQL, UK only, sessions Shopify flags as human.
- **Conversion, two definitions:**
  - (a) paid orders ÷ sessions (the business view).
  - (b) completed-checkout sessions ÷ sessions (the Shopify view).
  - (a) is higher because draft, phone and TEMU orders have no web session.
- **Shopify Analytics comparison:** Shopify reports all-time net sales of £15,515.56. That is **£273.59 higher** than our paid net because it still counts #1020: the order was cancelled, but the PayPal refund failed. Shopify also books the #1010 and #1014 cancellations as returns on 25 Sep. Reconciled to the penny.

## 2. Revenue baseline (part 2/3)

| Window | Gross | Discounts | Net | Shipping | Tax | Total | Paid orders | Cancelled / refunded | AOV | New / returning | UK sessions | Cart | Checkout | Completed | CR (orders) | CR (Shopify) | Previous net (orders) | Change in net |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Today (partial) | £0 | £0 | £0 | £0 | £0 | £0 | 0 | 0/0 | n/a | 0/0 | 3 | 0 | 0 | 0 | 0% | 0% | £1,060.17 (2) | n/a (partial day) |
| Yesterday 19 Nov | £0 | £0 | £0 | £0 | £0 | £0 | 0 | 0/0 | n/a | 0/0 | 45 | 7 | 1 | 0 | 0% | 0% | £539.97 (1) | −100% |
| Last 7d | £2,360.89 | £182.07 | **£2,178.82** | £0 | £0 | £2,178.82 | 4 | 0/0 | £544.71 | 4/0 | 276 | 39 | 11 | 3 | 1.45% | 1.09% | £2,707.12 (6) | −19.5% |
| Last 28d | £7,472.64 | £615.07 | **£6,857.57** | £90.00 | £0 | £6,947.57 | 16 | 0/0 | £428.60 | 15/1 | 1,267 | 156 | 45 | 12 | 1.26% | 0.95% | £2,826.41 (7) | +142.6% |
| Last 30d | £7,472.64 | £615.07 | **£6,857.57** | £90.00 | £0 | £6,947.57 | 16 | 0/0 | £428.60 | 15/1 | 1,356 | 166 | 45 | 12 | 1.18% | 0.88% | £2,826.41 (7) | +142.6% |
| Previous 30d | £2,953.88 | £127.47 | £2,826.41 | £0 | £0 | £2,826.41 | 7 | 1/0 | £403.77 | 7/0 | 2,045 | 97 | 25 | 4 | 0.34% | 0.20% | £3,605.80 (10) | −21.6% |
| Last 90d | £14,203.37 | £913.59 | **£13,289.78** | £90.00 | £0 | £13,379.78 | 33 | 3/0 | £402.72 | 32/1 | 6,029 | 341 | 83 | 21 | 0.55% | 0.35% | £1,952.19 (5) | +580.8% |
| Previous 90d | £2,039.97 | £87.78 | £1,952.19 | £0 | £61.62 | £2,013.81 | 5 | 0/2 | £390.44 | 4/1 | 1,805 | 64 | 15 | 6 | 0.28% | 0.33% | n/a | n/a |
| YTD | £16,243.34 | £1,001.37 | **£15,241.97** | £90.00 | £61.62 | £15,393.59 | 38 | 3/2 | £401.10 | 36/2 | 7,837 | 405 | 98 | 27 | 0.48% | 0.34% | n/a (no 2025 trading) | n/a |
| All-time | same as YTD | | £15,241.97 | | | £15,393.59 | 38 | 3/2 | £401.10 | 36/2 | 7,750* | 385 | 93 | 27 | 0.49% | 0.35% | n/a | n/a |

\* All-time sessions start on 13 Jul. YTD sessions are counted from 24 May (the query window); traffic before July is negligible.

Notes on what the table can and cannot show:

- **Fulfilled:** all 38 paid orders are "Fulfilled" in Shopify. Here, Fulfilled means **accepted, not dispatched**: orders are marked within a median of about 3 hours.
- **Delivered (real date only):** 1 order, **#1038** (17 Nov, owner-confirmed). The Shopify delivered stamps on 25 Sep, 19 Oct and 3 Nov are bulk dates, so they are **not used**.
- **Excluded money:**
  - Cancelled: £859.49 (#1010 £275.40, #1014 £310.50, #1020 £273.59 — #1020's PayPal refund still failed, Stage 1 P0).
  - Refunded: £514.80 (#1001 and #1006).
- **£0 tax issue:** Shopify records £0 tax on **every order except #1003** (a TEMU order, £61.62), even though ABBAS TRADE LTD is VAT registered (520 9622 06). This is an accountant item and is PARKED. Every ex-VAT figure is an ESTIMATE (÷ 1.2).
- **Shipping:** the only charge is £90 on #1038 (Northern Ireland). Delivery is free across Great Britain.
- **Returning customers:** 2 to date (#1005 and #1033).

**Headline (VERIFIED):** the last 30 days brought £6,857.57 net from 16 paid orders, against £2,826.41 from 7 in the previous 30 days.

- UK human sessions **fell** from 2,045 to 1,356 (−33.7%).
- Order conversion rose from 0.34% to 1.18%.
- The rise in sales came from more orders on less traffic: better conversion and higher-value baskets. It did not come from more visitors.

## 3. Trends (revenue-trend.csv)

- **Best weeks:**
  - w/c 2 Nov: £2,811.30 (6 orders)
  - w/c 9 Nov: £2,315.64 (5)
  - w/c 5 Oct: £1,736.84 (4)
  - w/c 14 Sep: £1,055.96 (2)
  - w/c 31 Aug: £1,040.08 (3)
- **Best days:**
  - 6 Nov: £1,098.88 (2)
  - 13 Nov: £1,060.17 (2)
  - 31 Aug: £792.58 (2)
  - 14 Oct: £663.98
- **Months (net / orders / sessions):**
  - Jul: £776 / 2 / 592
  - Aug: £2,825 / 8 / 1,968
  - Sep: £2,284 / 6 / 2,897
  - Oct: £3,365 / 9 / 1,424
  - Nov (19 days): £5,991 / 13 / 869
- **Day of week (all-time):**
  - Friday: 8 orders, £4,318 (highest)
  - Tuesday: 8 orders, £2,825
  - Thursday: 3 orders (lowest)
  - The sample is too small to act on.
- **Seasonality:** cannot be measured. There are only about 4 months of history (first order 13 Jul) and no previous year. Expect a UK January sales peak and a quieter December, but this is HYPOTHESIS; nothing in the data shows it yet.
- **Order rhythm:** 99 of 131 days had no paid order. The longest gap was **11 days**. Zero-order runs of 2–7 days are normal for this store.
- **Cancellations and refunds:**
  - Cancellations: 3, all in Aug–Sep. Two were expired payments on draft or web orders (#1010, #1014), both wrongly marked fulfilled. One was a PayPal order cancelled 18 minutes after placing (#1020), and its refund failed.
  - Refunds: 2 (#1001 on 13 Jul and #1006 on 20 Aug). Both were Single beds with the EAGLE10 code.
  - None since 23 Sep. None is supply-related.
- **Unusual changes:**
  - (1) **0 orders on 19 Nov**, the first full day after the CRO theme was published, and none so far on 20 Nov. **Too early to judge.** Gaps like this happened 30+ times before the theme change. Yesterday had 7 cart sessions and 1 checkout session from 45 sessions, a normal cart rate. Review on 3 Dec (2-week CRO watch, HQ cro/latest).
  - (2) Sessions fell sharply after September while orders grew. Stage 1 found Shopify's earlier totals were bot-inflated; this baseline uses the human flag, but the Aug–Sep surge (up to 209 a day) may still contain unflagged low-quality traffic. ESTIMATE.
  - (3) The last 7 days were 19.5% below the previous 7 (4 vs 6 orders), but AOV rose to £544.71.

## 4. Products (product-performance.csv, cmd/products)

**Live catalogue (GraphQL, 20 Nov):** 145 products published to the Online Store. Admin holds 257 products: 187 ACTIVE (42 of them active but not published) and 70 DRAFT. This matches Stage 4/5. No new orders since #1043 (18 Nov), so the Stage 4 order lines equal live data.

**Classes** (90 days, 22 Aug–19 Nov). H takes precedence; each product's A–G performance class stays in the CSV.

| Class | Rule | Count (performance class before H) |
|---|---|---|
| A | 3 or more paid orders | 1 (2) |
| B | 1–2 paid orders | 11 (18) |
| C | 50 or more landings, 5 or more cart sessions, 0 orders | 2 (3) |
| D | 50 or more landings, fewer than 5 carts, 0 orders | 4 (4) |
| E | 10–49 landings, 0 orders | 34 (41) |
| F | 1–9 landings, 0 orders | 60 (69) |
| G | 0 landings | 7 (8) |
| **H** | **Blocked or flagged by a configuration or information issue** (Stage 4/5 price-truth list: F1 storage not priced on 9 ottoman beds; F3 six "with Drawers" divans default to £0 No Drawers; F5 price ladders; F6 Ambassador's two colour pickers; F7 Grand Extra-Tall; F8 Divan Base opening; F13; R8 no options on Aurora Luxury/Vegas/Coca; Storage Box) | **26** |

All warnings are kept, including those that apply to every product: F2 (two feed sources), F4 (no running total), F12 (no GTIN), F14 (placeholder inventory) and the parked costs (0 of 763 variants costed).

**Top 20 lists** (full lists in `cmd/products` and the CSV). No profit ranking.

- **Revenue, 90d net:**
  1. Ottoman Gas Lift Divan Base: £2,666.63, 7 orders [H]
  2. Side Lift Ottoman Storage Base: £1,603.38, 6 [A]
  3. Cloud Teddy Bouclé Ottoman: £977.39, 2 [H]
  4. Savoy Channel: £823.48 [B]
  5. Royal Chesterfield: £629.96 [H]
  6. 3000 Pocket Sprung Mattress: £595.39, 2 [B]
  7. Regal Luxe: £578.97
  8. Curved Wingback: £578.68
  9. Elegant Panel: £562.48
  10. Sunrise Fan Panel: £549.98
  - 20 products sold in 90 days.
- **Orders:** same leaders (7, 6, 2, 2). Every other product had 1 order.
- **Conversion** (30 or more landings; orders ÷ landing sessions):
  - Savoy: 3.03% (33 landings)
  - Regal Gold-Trim: 2.94%
  - Curved Wingback: 2.86%
  - Mirror Strip Sunrise: 2.63%
  - **Side Lift Ottoman: 2.25% on 267 landings** — the only large sample
  - Cloud Teddy: 1.83%
  - Royal Chesterfield: 1.69%
  - Ottoman Divan Base: 1.18% on 593
  - Single-order products are noise; treat them as ESTIMATE.
- **Organic** (Stage 6; 90d organic web + Google free listings):
  - Ottoman Divan Base: 403
  - Line Bumper: 268
  - Stone: 200
  - Line Ambassador: 171
  - Mini Line Wingback Kids: 167
  - Line Kids: 121
  - Side Lift: 116
  - Divan Drawer Base: 95
  - Almost all of this is free listings. Pure organic web is small; Cloud Teddy is the largest at 28 sessions and 9 GSC clicks.
- **Paid-attributed** (Stage 5, all class "B MATCHED"; only 10 products have evidence):
  - Ottoman Divan Base: 3 (#1027, #1028, #1033, non-brand PMax)
  - Side Lift: 3 (#1029, #1030, #1032, non-brand)
  - Cloud Teddy: #1040 (brand)
  - Curved Wingback: #1042 (brand)
  - Line Kids: #1018
  - Mirror Strip: #1012
  - Line Ambassador: #1016 (brand)
  - Cambridge: #1031 (brand)
  - Memory Orthopaedic: #1011 (brand)
  - Storage Box: #1022
  - Per-product Ads spend is UNKNOWN.
- **Improvement opportunities** (cart sessions that did not become orders, 30 or more landings):
  1. **Line Bumper Ottoman**: 432 landings / 28 carts / 2 checkouts / **0 orders** [H, F1 price truth]
  2. **Line Ambassador**: 370 / 26 / 2 / 1 [H, F6]
  3. Ottoman Divan Base: 593 / 27 / 3 / 7 [H, F8]
  4. Grand Extra-Tall: 118 / 18 / 3 / 1 [H, F7]
  5. Side Lift: 267 / 19 / 6 / 6
  6. Cloud Teddy: 109 / 14 / 4 / 2 [H, F1]
  7. Mini Line Wingback Kids: 244 / 9 / 0 / 0
  8. Royal Chesterfield: 59 / 10 / 2 / 1 [H, F5]
  9. Line Kids: 194 / 8 / 0 / 1
  10. Mini Line Wingback: 53 / 7 / 2 / 0
  - Also high traffic with almost no carts: Stone (255 / 2) and Grand Princess (107 / 2).
  - Fixing price truth on the H products is still the largest lever. Cause: HYPOTHESIS. Mechanism: VERIFIED in Stage 4/5.

Caveats:

- Carts and checkouts are **landing-session** measures, not product-level adds.
- Savoy shows 9 checkout sessions against 8 cart sessions, which is a platform quirk.
- One landing path, `mayfair-ottoman-divan-bed-copy` (2 sessions), matches no published product.

## 5. Delivery and capacity (delivery-capacity.csv, cmd/delivery)

There are 22 orders since 1 Oct (#1022–#1043). Postcode district only; no addresses.

- **Status buckets:**
  - Delivered (real date): **1** (#1038, 17 Nov, owner)
  - Dispatched (tracking): **1** (#1022, DPD parcel)
  - Awaiting manufacture / ready: **UNKNOWN** (no system records production)
  - Unknown: **20**
  - Shopify shows all 22 as Fulfilled, between 0.1 h and 99 h after the order (median about 3 h). In this store, fulfilled is not shipped.
- **ESTIMATE by age:**
  - 12 orders older than 14 days (#1022–#1033) are probably delivered. No chasers; #1023–#1030 carry the bulk 3 Nov stamp; #1031 was asked for a review.
  - 9 orders (#1034–#1043, except #1038) are probably still open.
- **Days open, to 20 Nov:**
  - #1034 and #1035: 14 days
  - #1036: 13
  - #1037: 12
  - #1039: 10
  - #1040 and #1041: 7
  - #1042: 6
  - #1043: 2
  - #1038 took **8 days** to delivery. The site promises 3–5 working days.
- **Delivery service mix (orders since 1 Oct):**
  - Downstairs Drop Off: 12
  - Room of Choice Assembly: 5 (at the old £49.99 price)
  - Room of Choice Drop Off: 2
  - No option recorded: 3 (mattresses and storage box)
- **Districts:** spread across England, Wales, Scotland (EH54) and Northern Ireland (BT71).
- **Tracking:** 1 of 22 orders (#1022, DPD).
- **Customer-notified delivery dates found in Gmail** (read-only):
  - **#1040: Saturday 21 Nov.** The time slot was promised for **Friday 20 Nov evening (due today)**. The order has no customer email, so Shopify updates do not reach the customer.
  - No date found for any other order.
- **Outstanding promises and alerts:**
  - (1) #1040: Friday slot message due today, delivery Saturday.
  - (2) #1043: assembly was quoted at **£50 cash on delivery** against the £69.99 list price (owner decision AC01). No delivery date has been given.
  - (3) #1038: delivered 17 Nov but not marked delivered in Shopify.
  - (4) #1031–#1043: no real delivered dates recorded. These feed review timing.
  - (5) The "on the way" email goes out on order day and drives chasers.
  - (6) Pre-sale E011 asks for delivery between 27 and 30 Nov; its quote is still unsent (Stage 7).
- **Weekly order intake (workshop demand), by week commencing:**
  - 28 Sep: 1
  - 5 Oct: 4
  - 12 Oct: 1
  - 19 Oct: 1
  - 26 Oct: 3
  - 2 Nov: **6**
  - 9 Nov: 5
  - 16 Nov: 1 (partial)
- **Weekly delivery capacity = UNKNOWN. Workshop capacity = UNKNOWN.** Owner questions:
  - How many beds can the workshop make per week?
  - How many delivery runs or drops per week, on which days, and to which areas per run?
  - What is the real lead time from order to delivery?
  - Until these are answered, ad scaling cannot be planned against capacity.

## 6. Mode A (part 10): revenue-only position

- **Revenue:** last 30 days £6,857.57 net (VERIFIED); last 90 days £13,289.78; all-time £15,241.97 net from 38 paid orders.
- **Ex-VAT** (ESTIMATE, ÷ 1.2): last 30 days £5,714.64; last 90 days £11,074.82. Shopify's £0 tax means this basis is unconfirmed.
- **Ads revenue ROAS** (Stage 5): real-order ROAS 2.34 over 90 days, about 1.52 on non-brand. This is **revenue ROAS, not profit**.
- **Profit, contribution and break-even ROAS:** **not calculated**. Costs for 0 of 763 variants are known, and the owner has PARKED costs and VAT.
- Result: **PROFITABILITY NOT VERIFIED — COST DATA PARKED.** No budget increase is supported by profit evidence.

## Limitations

- Sessions are Shopify-flagged human UK sessions. Unflagged bots may remain, especially in Aug–Sep.
- Paid orders include draft, phone and TEMU orders that have no session, so the two conversion definitions differ.
- Seasonality cannot be measured: there is no history before 13 Jul.
- Real delivered dates exist for 1 order only. Production status is not recorded, so "awaiting manufacture" and "ready" counts are UNKNOWN, not 0.
- Gmail was searched by order numbers and delivery wording. Promises made by phone or WhatsApp are not visible.
- Product conversion is landing-level and most products have very small samples.
- Organic per-product figures come from Stage 6 (19 Nov) and are mostly free listings.
- Paid attribution comes from Stage 5 (19 Nov) at its stated confidence. Per-product Ads spend is UNKNOWN.
- The £0 tax issue affects every ex-VAT figure.
- Housekeeping: several working files in the shared scratchpad used generic names (`orders.json`, `products.json`) and may have replaced same-named files from other agents. Nothing in the repository or the HQ database was affected.

## Credits used

- OpenRush: **0** (task budget 0; month total unchanged at ≤221/2,001; reserve 400 intact).
- Shopify:
  - 4 GraphQL reads: orders, and products in 3 pages (page 2 queried twice).
  - 3 ShopifyQL reads: daily sales, daily sessions, and product landings over 90 days.
- Gmail: 2 searches and 1 thread read.
- HQ: 1 batch write (cmd/revenue, cmd/products, cmd/delivery, all version 1).
