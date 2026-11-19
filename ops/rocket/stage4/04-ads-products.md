# Rocket Stage 4, part 11: Google Ads product profitability

Prepared 19 Nov 2026 by the Google Ads, Google Shopping, Search Terms and Analytics specialists. Read-only. Nothing was changed in Google Ads, Merchant Center, Shopify, the theme or HQ. No customer personal data appears here (order numbers only).

Companion file: `ops/rocket/stage4/ads-by-product.csv`, with one row per product (145 rows, joined to `stage3/product-scores.csv`).

Sources:
- OpenRush Google Ads 198-038-2450, pulled today. The reports used were campaign, asset_group, date and search_term for the last 3 months (22 Aug–19 Nov). This is 12 credits; the list is at the end.
- Shopify Admin GraphQL: all orders since 20 Aug with line items, variant ids and customer journey.
- ShopifyQL: human sessions by landing page × utm_campaign for `utm_medium=cpc` over 30 and 90 days, plus `utm_campaign=sag_organic` over 90 days.
- Stage 1 report 02, Stage 2 report 02 and product-intel.json, Stage 3 product-scores.csv.

Windows: "30d" means 20 Oct–19 Nov and "90d" means 22 Aug–19 Nov. The last 1–2 days of Ads data are preliminary. Google reports a conversion on the day of the **click**. Shopify reports it on the day of the **order**.

Cancelled or expired orders #1010, #1014 and #1020 are excluded from all sales figures. **Google Ads counted one of them (#1014). See finding 3.**

---

## Key findings

1. **Google Ads has no product-level data for this account through our tools.** OpenRush has no shopping-product or listing-group report. Its asset-group report shows a single "Asset Group 1" holding all £1,340.46 of PMax spend. So per-product impressions, clicks, CTR, cost, conversions and ROAS are **UNKNOWN**. Everything per-product below is rebuilt from Shopify: Ads conversions matched to real orders, plus landing-page sessions tagged `pmax_all_products`. Status: VERIFIED that the data is missing.
2. **All 15 Google Ads conversions in 90 days match 15 real Shopify orders.** This was checked by click date and value, to the penny. The breakdown is PMax 11, Search UK 2 and Shopping UK 2. The orders contain only **10 different products**. Status: ESTIMATE for the match (the arithmetic is exact; the link between click and order is inferred).
3. **One of those conversions is a cancelled order.** Shopping UK's 2 conversions (£739.49) are #1012 (£428.99) plus #1014 (£310.50, cancelled/expired). Google still counts #1014. After removing it:
   - 90-day Ads value is **£5,402.42, not £5,712.92**.
   - Account ROAS is **2.34, not 2.47**.
   - Shopping UK's ROAS is **0.70, not 1.20**.
   Status: ESTIMATE (exact value match).
4. **Correction to Stage 2: #1033 was counted by Ads.** Stage 2 said it was not. Ads credited it to clicks on 10–22 Oct, together with #1027. The click-day values are £596.20, £198.73 and £375.02, which add up to £1,169.95. #1027 (£663.98) plus #1033 (£505.98) is £1,169.96. Stage 2 looked only at a 28-day click window, so it missed this. Status: ESTIMATE (exact sum).
5. **Two products account for 6 of the 9 non-brand Ads orders.**
   - **Ottoman Gas Lift Divan Base**: 3 orders, £1,532.64 (#1027, #1028, #1033).
   - **Side Lift Ottoman Gas Lift Storage Bed**: 3 orders, £778.99 (#1029, #1030, #1032).

   Both are storage/ottoman products, and both land shoppers on their own product page. The ottoman base has a **P0 page blocker** (an end-lift base sold with side-opening options only), so it is class D first.
6. **Brand searches carry a third of Ads revenue at almost no cost.** In 90 days:
   - "eagle bed/beds" searches produced 5 orders worth £2,057.83 (#1011, #1016, #1031, #1040, #1042) on £115.84 of visible spend.
   - The same 5 orders are worth £2,056.78 in Ads (#1042 by its click-day credits).
   - Non-brand: £3,344.59 of real orders on about £2,196.78 spend gives a **non-brand ROAS of about 1.52**.

   The products bought after a brand search (Cloud Teddy, Cambridge Storage, Curved Wingback, Line Ambassador, Memory mattress) were not "sold by the ad". The buyer already knew Eagle Bed. Status: ESTIMATE.
7. **Paid traffic that does not sell.** These product pages received a lot of paid landings but **0 Ads orders** in 90 days, while still collecting baskets:

   | Product | Paid landings | Baskets | Est. 30d PMax cost (ESTIMATE) |
   |---|---|---|---|
   | Line Bumper Ottoman | 128 | 17 | about £70 |
   | Grand Extra-High | 107 | 15 | about £102 |
   | Mini Line Wingback Kids | 50 | 7 | about £20 |
   | Royal Chesterfield | 34 | 6 | about £30 |
   | Grand Princess | 31 | 0 | about £24 |
   | Mini Line Wingback | 25 | 4 | about £14 |
   | Roxy Curved Wingback | 22 | 2 | about £17 |

   Line Ambassador had 134 paid landings and 15 baskets. Its only Ads order (#1016) came from a brand search.
8. **The paused campaigns did sell a little, but never on a non-brand search term that we can see.**
   - Shopping UK: £616.62, 1 valid order (#1012). ROAS 0.70.
   - Search UK: £355.54, 2 orders, both brand ("eagle bed/beds"). About £350 of non-brand Search spend sold nothing.

   Both campaigns are paused today. This is HISTORICAL. The pause was justified on non-brand results.
9. **Stage 1's inference is now supported by Ads data.** Before 28 Sep, paid feed clicks were tagged `sag_organic`. Orders #1012, #1016 and #1018 each landed with only `sag_organic` tags, yet each matches an Ads conversion exactly. Status: ESTIMATE, now strong.
10. **Profit after advertising is UNKNOWN for every product.** No product, delivery or labour costs exist yet (Stage 2 cost fields C1–C9). Every product is class **E**. **Nothing here supports scaling any product on revenue alone.**

---

## 1. Account and campaign level (Google Ads, VERIFIED)

### 1.1 Totals

| Metric | Last 30d (20 Oct–19 Nov, by click date) | Last 90d (22 Aug–19 Nov) |
|---|---|---|
| Spend | £803.57 | £2,312.62 |
| Impressions | 65,823 | 361,245 |
| Clicks | 1,318 | 6,988 |
| CTR | 2.00% | 1.93% |
| Avg CPC | £0.61 | £0.33 |
| Conversions (Ads) | 7.70 | 15 |
| Conversion value (Ads) | £2,966.63 | £5,712.92 |
| ROAS (Ads-reported) | 3.69 | 2.47 |
| Value after removing cancelled #1014 | £2,966.63 | **£5,402.42** |
| ROAS on real, non-cancelled orders | 3.69 | **2.34** |
| Cost per real order | about £104 (7.70 conversions) | **£165.19** (14 orders) |

The 30-day conversions include 0.74 (£375.02) credited to a 22 Oct click for #1027/#1033. That is why this window shows more than Stage 1's 28-day figure (6.96).

### 1.2 By campaign, 90 days

| Campaign | Type | Status today | Spend | Impr. | Clicks | CTR | Conv | Ads value | ROAS (Ads) | Real orders (Shopify) | ROAS on real orders |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Eagle Bed \| PMax \| All Products | Performance Max | Enabled, £25/day | £1,340.46 | 148,275 | 2,788 | 1.88% | 11 | £4,374.45 | 3.26 | 11 orders, £4,374.43 | 3.26 |
| Eagle Bed \| Shopping \| UK | Standard Shopping | Paused | £616.62 | 201,213 | 3,444 | 1.71% | 2 | £739.49 | 1.20 | 1 (#1012) + 1 cancelled (#1014) | **0.70** |
| Eagle Bed \| Search \| UK | Search | Paused 28 Oct | £355.54 | 11,757 | 756 | 6.43% | 2 | £598.98 | 1.68 | 2 (#1011, #1016), both brand | 1.68 (non-brand: 0) |
| Bed Shop in Dewsbury | PMax | Removed | £0 | 0 | 0 | – | 0 | £0 | – | – | – |

PMax ran from 5 Sep, so its 90 days are really 76 days. There is **one asset group** ("Asset Group 1", id 6746837045) holding all PMax spend. VERIFIED.

### 1.3 Which Ads conversion is which order (90 days)

Matched by Google click date and conversion value against Shopify orders, line items and journeys. The value match is exact. The click-to-order link is an ESTIMATE.

| Ads click date(s) | Conv / value | Order | Campaign | Search term (where visible) | Product bought (variant) | Landing page |
|---|---|---|---|---|---|---|
| 25 Aug | 1 / £220.99 | #1011 (30 Aug) | Search UK | "eagle beds" (brand) | Memory Orthopaedic Mattress, King | home (returned direct) |
| 31 Aug | 1 / £428.99 | #1012 | Shopping UK | not shown | Mirror Strip Sunrise, Super King | same product (sag_organic tag) |
| 28 Aug + 1 Sep | 0.04 + 0.96 / £11.58 + £298.92 | **#1014, cancelled** | Shopping UK | not shown | Side Lift Ottoman, Small Double | same product (sag_organic tag) |
| 8 Sep | 1 / £377.99 | #1016 | Search UK | "eagle bed" (brand) | Line Ambassador, Double (+£29.99 add-on line) | same product (sag_organic tag) |
| 15 Sep | 1 / £505.98 | #1018 | PMax | "side guard bed" | Line Kids, Small Double (+£154.99 add-on line) | same product (sag_organic tag) |
| 1 Oct | 1 / £97.99 | #1022 | PMax | not shown | Upholstered Ottoman Storage Box | same product (sag_organic tag) |
| 8 + 12 Oct | 0.02 + 0.02 / £4.45 + £4.45 | part of #1030 | PMax | – | – | – |
| 10, 11, 22 Oct | 0.94 + 0.31 + 0.74 / £1,169.95 | #1027 + #1033 | PMax | not shown | Ottoman Gas Lift Divan Base, Super King and King | same product |
| 24 Oct | 2 / £619.18 | #1028 + #1029 | PMax | not shown | Ottoman Base, Double; Side Lift Ottoman, Double | same products |
| 31 Oct | 0.96 / £238.60 | #1030 | PMax | not shown | Side Lift Ottoman, Small Double | same product, finished via /cart |
| 1 Nov | 1 / £323.98 | #1031 | PMax | "eagle bed" (brand) | Cambridge Storage Panel Bed, Double | home |
| 2 Nov | 1 / £274.99 | #1032 | PMax | "obs beds" (competitor) | Side Lift Ottoman, Small Double | same product |
| 11 + 12 Nov | 0 / £1.05 + £1.05 | part of #1042 | PMax | – | – | – |
| 13 Nov | 1 / £556.19 | #1040 | PMax | "eagle beds" (brand) | Cloud Teddy Bouclé Ottoman, King | /pages/about-us |
| 14 Nov | 1 / £576.57 | #1042 | PMax | "eagle beds" (brand) | Curved Wingback, King | landed on Stone, bought Curved Wingback |

Shopify item ids for Merchant Center and PMax product reports use the form `shopify_GB_<product id>_<variant id>`. These are the item ids of the variants actually bought, so the owner can find them in Ads → Products:

| Product | Item id(s) bought | Orders |
|---|---|---|
| Ottoman Gas Lift Divan Base | shopify_GB_15524049387851_56499363578187 (Super King), _56499363512651 (Double), _56499363545419 (King) | #1027, #1028, #1033 |
| Side Lift Ottoman Gas Lift Storage Bed | shopify_GB_15524047782219_56499358466379 (Double), _56499358433611 (Small Double) | #1029, #1030, #1032 |
| Line Kids Upholstered Bed | shopify_GB_15524048404811_56499359809867 | #1018 |
| Upholstered Ottoman Storage Box | shopify_GB_15524052762955_56499377766731 | #1022 |
| Mirror Strip Sunrise | shopify_GB_15524047880523_56499358761291 | #1012 |
| Line Ambassador | shopify_GB_15524048830795_58014566875467 | #1016 |
| Memory Orthopaedic Mattress | shopify_GB_15524052795723_56499377930571 | #1011 |
| Cambridge Storage Panel Bed | shopify_GB_15948313133387_58242202468683 | #1031 |
| Cloud Teddy Bouclé Ottoman | shopify_GB_15524048699723_56499360891211 | #1040 |
| Curved Wingback | shopify_GB_15524053352779_56499380257099 | #1042 |

Two caveats on these ids:
- They are built from the Shopify ids. The exact id the Google channel sends is not readable here, so the format is ESTIMATE until it is checked against Merchant Center.
- Google credits the **clicked** item, which can differ from the item **bought**. #1042 is an example: the shopper clicked Stone and bought Curved Wingback.

---

## 2. Brand vs non-brand, and PMax vs other campaign types

### 2.1 Search terms, 90 days (VERIFIED, top 300 rows)

The top 300 rows cover £655.86 of £2,312.62 spend (28%). PMax terms below Google's privacy threshold, and Shopping campaign terms, do not appear. All 7 conversions on visible terms:

| Term | Campaign | Spend | Clicks | Conv | Value | Order |
|---|---|---|---|---|---|---|
| eagle bed | PMax | £76.72 | 74 | 1 | £323.98 | #1031 |
| eagle beds | PMax | £34.28 | 44 | 2 | £1,133.82 | #1040, #1042 |
| eagle bed | Search | £2.33 | 5 | 1 | £377.99 | #1016 |
| eagle beds | Search | £1.38 + £1.13 | 6 | 1 | £220.99 | #1011 |
| obs beds (competitor brand) | PMax | £1.47 | 1 | 1 | £274.99 | #1032 |
| side guard bed | PMax | £0.70 | 1 | 1 | £505.98 | #1018 |

The 8 other real orders came from terms that are not visible: #1012, #1022, #1027, #1028, #1029, #1030 and #1033, plus cancelled #1014. They are treated as **non-brand**. That is an ESTIMATE. Each landed directly on a product page from the product feed, which is the usual pattern for a product-type search.

Non-brand product themes with spend but **0 conversions** (visible rows):

| Theme | Rows | Spend | Clicks |
|---|---|---|---|
| "ottoman …" (ottoman beds, ottoman bed, side lift, divan ottoman…) | 62 | £154.75 | 174 |
| "brown …" (brown bed, chocolate brown bed…) | 20 | £43.42 | 59 |
| "… near me" (bed shops, furniture, mattress stores) | 19 | £33.57 | 60 |
| "divan …" | 20 | £28.17 | 42 |
| "headboard …" | 25 | £28.16 | 47 |
| mattress | 11 | £13.55 | 22 |
| chesterfield / wingback / kids / ambassador | 13 | about £28 | 25 |

Note that the ottoman *products* sell, but the generic "ottoman beds" *term* (£38.91 + £17.36) has not converted yet. The ottoman orders came from feed clicks whose terms are hidden.

### 2.2 Brand vs non-brand ROAS

| Segment | Window | Spend | Real orders | Value | ROAS | Status |
|---|---|---|---|---|---|---|
| Brand ("eagle bed/beds"), all campaigns | 90d | £115.84 (visible) | 5 | £2,057.83 | about 17.8 | ESTIMATE |
| Non-brand, all campaigns | 90d | about £2,196.78 | 9 | £3,344.59 | **about 1.52** | ESTIMATE |
| PMax brand | 90d | £111.00 | 3 | £1,458.85 | about 13 | ESTIMATE |
| PMax non-brand | 90d | about £1,229.46 | 8 | £2,915.58 | **about 2.37** | ESTIMATE |
| Shopping UK (all non-brand) | 90d | £616.62 | 1 | £428.99 | **0.70** | ESTIMATE |
| Search UK non-brand | 90d | about £350.70 | 0 | £0 | **0** | ESTIMATE |
| Non-brand, all | 28d (Stage 1) | about £659.77 | about 4 | about £1,133.82 | about 1.7 | HISTORICAL |
| Non-brand, all | 30d (click date) | about £754 (brand spend from Stage 1's £49.67) | – | about £1,508 | about 2.0 | ESTIMATE, very small sample |

Reading:
- PMax's non-brand return, about 2.4 in 90 days, is better than the paused Shopping (0.7) and Search (0) campaigns. **But it rests on 8 orders**, and 6 of them are two ottoman products.
- Brand spend is probably understated, because hidden terms may include brand searches. If so, true non-brand ROAS would be slightly **higher** than shown.

---

## 3. Per-product advertising intelligence

### 3.1 Method (read this before using the numbers)

- **Google per-product metrics** (impressions, clicks, CTR, cost, conversions, value): **UNKNOWN**. They are not exposed by OpenRush for this account. Every row in the CSV says UNKNOWN for them.
- **Ads-matched orders** are the 14 real orders above. Each is credited to the product **bought**, at its full order value (including add-on lines). Status: ESTIMATE.
- **Paid landing sessions** are Shopify human sessions whose first page was the product and that carried `utm_medium=cpc`. The campaigns are PMax, `shopping_uk`, `search_uk` and old `Google Shopping`. Status: VERIFIED. Three limits:
  - Sessions are not clicks: 803 PMax sessions against about 1,300 Ads clicks in 30d.
  - Campaign tags only exist from 28 Sep, so the 90d counts are really about 7.5 weeks.
  - Cart and checkout counts are per session (any item), not per product.
- **`sag_organic` landings (90d)** are mostly before 28 Sep. They mix paid feed clicks (PMax and Shopping) with free listings, and the paid share is UNKNOWN. They are context only.
- **Estimated PMax cost per product (30d)** = £774.73 × (product PMax landings ÷ 803 PMax landings). Status: **ESTIMATE**, with two weaknesses:
  - £774.73 is the 30d account spend (£803.57) minus Search UK's known £28.84. It is an upper bound for PMax.
  - The formula assumes every product has the same cost per click. That is false: brand clicks cost about £1.04, against an account average of £0.61.

  Use it only to rank products, never as a cost fact. The home page alone takes 144 of 803 sessions (18%, about £139). That traffic is mostly brand.
- The order-level **last-click limits**:
  - 3 PMax buyers came back "direct" via /cart (#1027, #1030, #1042).
  - #1042 landed on Stone and bought Curved Wingback.
  - #1040 landed on About Us.
  - 4 orders in 30d have no journey data at all (#1035, #1037, #1039, #1041). Two of them are ottoman products, so ads may have influenced them unseen.

### 3.2 Products with Google Ads evidence

Sorted by class. ROAS is shown only where at least 10 PMax landings exist, and it is **indicative only (1–3 orders)**.

| Class | Product | Page score / priority | PMax landings 30d (carts) | Paid landings 90d (carts / checkouts / done) | sag_organic 90d | Ads orders 30d / 90d | Ads value 90d | Est. PMax cost 30d | Indicative ROAS 30d |
|---|---|---|---|---|---|---|---|---|---|
| **A** | Side Lift Ottoman Gas Lift Storage Bed | 67 / P1 | 28 (4) | 47 (5 / 2 / 1) | 138 | 3 / 3 (#1029 #1030 #1032) | £778.99 | about £27 | about 29 (3 orders) |
| **D** (A after fix) | Ottoman Gas Lift Divan Base | 63 / **P0** | 55 (4) | 94 (8 / 2 / 2) | 459 | 2 / 3 (#1027 #1028 #1033) | £1,532.64 | about £53 | about 16 (2 orders) |
| D | Line Bumper Ottoman Divan Bed | 67 / **P0** | 73 (10) | 128 (17 / 1 / 0) | 289 | 0 / 0 | £0 | about £70 | 0 |
| D | Cloud Teddy Bouclé Ottoman | 70 / **P0** | 3 (1) | 7 (2 / 0 / 0) | <20 | 1 / 1 (#1040, brand) | £556.19 | about £3 | n/a |
| D | Cambridge Storage Panel Bed | 70 / **P0** | 1 (0) | 1 | <20 | 1 / 1 (#1031, brand) | £323.98 | about £1 | n/a |
| D | Upholstered Ottoman Storage Box | 57 / **P0** | 0 | 1 | 24 | 0 / 1 (#1022) | £97.99 | £0 | n/a |
| D | Mayfair Ottoman Divan Bed | 67 / **P0** | 9 (1) | 13 (1 / 0 / 0) | <20 | 0 / 0 | £0 | about £9 | n/a |
| D | Divan Drawer Storage Base | 67 / **P0** | 1 | 4 (1 / 0 / 0) | 105 | 0 / 0 | £0 | about £1 | n/a |
| **C** | Grand Extra-High Vertical Panel | 74 / P1 | 106 (15) | 107 (15 / 1 / 0) | <20 | 0 / 0 | £0 (sold #1043 direct) | about £102 | 0 |
| C | Line Ambassador | 68 / P1 | 79 (10) | 134 (15 / 2 / 0) | 212 | 0 / 1 (#1016, brand) | £377.99 | about £76 | 0 |
| C | Line Kids Upholstered Bed | 71 / P1 | 25 (4) | 45 (6 / 0 / 0) | 134 | 0 / 1 (#1018) | £505.98 | about £24 | 0 |
| C | Curved Wingback | 71 / P1 | 18 (3) | 19 (3 / 1 / 0) | <20 | 1 / 1 (#1042, brand) | £578.68 | about £17 | about 33 (1 brand order) |
| C | Royal Chesterfield Upholstered | 71 / P1 | 31 (6) | 34 (6 / 1 / 0) | <20 | 0 / 0 (sold #1036 via ChatGPT) | £0 | about £30 | 0 |
| C | Mini Line Wingback Kids Bed | 71 / P1 | 21 (2) | 50 (7 / 0 / 0) | 191 | 0 / 0 | £0 | about £20 | 0 |
| C | Mini Line Wingback Upholstered | 71 / P1 | 14 (3) | 25 (4 / 1 / 0) | 27 | 0 / 0 | £0 | about £14 | 0 |
| C | Liberty Wingback | 71 / P2 | 9 (1) | 14 (3 / 0 / 0) | <20 | 0 / 0 | £0 | about £9 | n/a |
| C | Roman Sleigh | 71 / P2 | 9 (2) | 11 (2 / 0 / 0) | <20 | 0 / 0 | £0 | about £9 | n/a |
| C | Monarch Contrast Frame | 69 / P2 | 10 (1) | 10 (1 / 0 / 0) | <20 | 0 / 0 | £0 | about £10 | 0 |
| **B** | Grand Princess | 71 / P1 | 25 (0) | 31 (0 / 0 / 0) | 73 | 0 / 0 | £0 | about £24 | 0 |
| B | Stone Upholstered | 71 / P1 | 3 (1) | 26 (2 / 1 / 0) | 228 | 0 / 0 | £0 | about £3 | n/a |
| B | Roxy Curved Wingback | 71 / P2 | 18 (2) | 22 (2 / 1 / 0) | <20 | 0 / 0 | £0 | about £17 | 0 |
| E only | Memory Orthopaedic Mattress | 68 / P1 | 1 | 7 | <20 | 0 / 1 (#1011, brand Search) | £220.99 | about £1 | n/a |
| E only | Mirror Strip Sunrise | 71 / P1 | 2 | 2 | 31 | 0 / 1 (#1012, Shopping) | £428.99 | about £2 | n/a |
| E only | Cambridge Curved Headboard | 68 / P2 | 14 (0) | 18 (0) | <20 | 0 / 0 | £0 | about £14 | 0 |
| E only | Modern Upholstered Wingback Headboard | 68 / P2 | 11 (1) | 19 (1) | <20 | 0 / 0 | £0 | about £11 | 0 |

Non-product landings (30d PMax): home page 144 sessions (11 carts, 2 orders: #1031 and #1029's return visit), About Us 2 (1 order, #1040). Search UK landed on the home page and collections (`/collections/upholstered-beds` 43, `/collections/ottoman-beds` 30 in 90d) and sold nothing from those landings.

The other 120 or so products have fewer than 10 paid landings and no Ads order. In the CSV they are class E only, with the note "no meaningful Google Ads data" where nothing exists.

### 3.3 Classification rules (applied in the CSV)

| Class | Rule used | Products |
|---|---|---|
| **A**: deserves more advertising investigation | 2 or more non-brand Ads orders in 90d **and** no P0 page blocker (Stage 3 score) | **Side Lift Ottoman** (only one). The Ottoman Gas Lift Divan Base meets the sales test but has a P0 blocker, so it is shown as "A*" inside class D |
| **B**: spend without orders | 20 or more paid landings in 90d (or 100+ `sag_organic` landings) and 0 Ads-matched orders | Grand Princess, Stone, Roxy, plus as secondary flags: Line Bumper, Grand Extra-High, Mini Line Wingback Kids, Royal Chesterfield, Mini Line Wingback, Divan Drawer Base |
| **C**: promising conversion | 10 or more paid landings, a basket rate of 10% or more from those landings, and at most 1 non-brand Ads order | Grand Extra-High (14% basket), Line Ambassador (11%), Line Kids, Curved Wingback, Royal Chesterfield (18%), Mini Line Wingback Kids (14%), Mini Line Wingback (16%), Liberty, Roman Sleigh, Monarch Contrast |
| **D**: needs website fixes first | P0 page blocker (Stage 3) together with paid landings ≥10, an Ads order, or ≥50 `sag_organic` landings | Ottoman Gas Lift Divan Base, Line Bumper, Cloud Teddy, Cambridge Storage, Ottoman Storage Box, Mayfair Ottoman, Divan Drawer Base |
| **E**: profitability unknown | **All 145 products** until costs C1–C9 exist | All |

Primary class order in the CSV: D, then A, then C, then B, then E. A product can carry several flags; for example, Line Bumper is B+C+D.

### 3.4 What the classes mean in practice (RECOMMENDATION, nothing changed)

- **A: Side Lift Ottoman.** First get its unit cost (C1) and delivery cost (C3) to see whether a £250–£280 order survives about £50–£100 of ad cost. **Do not increase budget or push this product on revenue alone.** The owner's rule is no budget increase anyway.
- **D: Ottoman Gas Lift Divan Base and Line Bumper.** These are the two products PMax already sends the most product-page traffic to. Fix the P0 blockers first (Stage 3 fixes: end-lift/side-lift options, and headline price vs title). Until then, every paid click lands on a page that misleads or confuses.
- **C: Grand Extra-High and Line Ambassador.** These are the clearest basket leaks: 15 baskets each, 0 non-brand ad sales. Stage 3 inv-7 and inv-2 name the causes (basket price about +105–131% over the headline, a double colour picker, "extra-tall" not stated). Re-check after the 19 Nov theme publish (measured from 20 Nov) before judging the ads.
- **B: Grand Princess (31 landings, 0 baskets), Roxy and Stone.** Candidates for an owner check in Ads → Products (spend per item). If confirmed, consider excluding them from the PMax listing group. This needs Ads product data first; we are not recommending it from session share alone.
- **Brand:** see Stage 1 recommendation 1 (brand exclusion on PMax). Brand orders should not count towards any product's "ad success".

---

## 4. Contribution after advertising and break-even ROAS

**Contribution after advertising: UNKNOWN for every product.** Product cost, mattress cost, delivery, assembly labour, packaging, returns and VAT status are all missing (Stage 2 cost fields C1–C9). The only known cost line is payment fees, about 2.6% of sales (Stage 2 §3.4, ESTIMATE).

### 4.1 The formula

- Contribution margin (CM) = (net revenue − product cost − delivery − assembly − packaging − payment fees − returns allowance) ÷ net revenue
- **Break-even ROAS = 1 ÷ CM**
- Contribution after advertising = revenue × CM − ad cost

If Eagle Bed is VAT-registered (UNKNOWN, C6), Google's conversion value includes 20% VAT, because it equals the order total. The break-even ROAS measured on Google's numbers is then **1.2 ÷ CM** (where CM is on ex-VAT revenue).

### 4.2 ILLUSTRATIVE examples. These margins are hypothetical, not facts

| Hypothetical CM | Break-even ROAS (not VAT-registered) | Break-even ROAS on Ads values if VAT-registered | 90d non-brand result (ROAS about 1.52): contribution after ads, ILLUSTRATIVE | 90d all-Ads result (£5,402.42 on £2,312.62): contribution after ads, ILLUSTRATIVE |
|---|---|---|---|---|
| 20% | 5.0 | 6.0 | £668.92 − £2,196.78 = **−£1,527.86** | £1,080.48 − £2,312.62 = **−£1,232.14** |
| 30% | 3.33 | 4.0 | £1,003.38 − £2,196.78 = **−£1,193.40** | £1,620.73 − £2,312.62 = **−£691.89** |
| 40% | 2.5 | 3.0 | £1,337.84 − £2,196.78 = **−£858.94** | £2,160.97 − £2,312.62 = **−£151.65** |
| 50% | 2.0 | 2.4 | £1,672.30 − £2,196.78 = **−£524.48** | £2,701.21 − £2,312.62 = **+£388.59** |
| 60% | 1.67 | 2.0 | £2,006.75 − £2,196.78 = **−£190.03** | £3,241.45 − £2,312.62 = **+£928.83** |

The illustrative columns use the not-VAT-registered case.

What this table says, ILLUSTRATIVE only: at the current non-brand ROAS of about 1.5, non-brand advertising breaks even only if the contribution margin is above about 66% (or about 79% if VAT-registered). The whole account, including brand, breaks even at a CM of about 43%. **Which side Eagle Bed is on cannot be known until the owner supplies C1, C3 and C6.**

Per product, the same formula applies with the product's own CM. It cannot be shown per product: there are no costs, and per-product ad cost is UNKNOWN (only the session-share ESTIMATE exists).

---

## 5. What would turn the UNKNOWNs into facts (owner actions, read-only for us)

| # | Action | Unlocks | Owner |
|---|---|---|---|
| 1 | Google Ads → Campaigns → PMax → **Products** (or Insights → Products), last 30 and 90 days, columns Item ID, Impr., Clicks, Cost, Conv., Conv. value. Export to CSV | Real per-product cost, CTR and ROAS. This replaces every ESTIMATE in §3 | Owner (5 minutes) |
| 2 | Ads → Insights → Search terms (PMax) / Search term insights | Hidden term categories, the brand share of PMax | Owner |
| 3 | Cost pack C1 (unit cost per size), C3 (delivery), C6 (VAT status) for at least Side Lift Ottoman, Ottoman Gas Lift Divan Base, Line Bumper, Grand Extra-High and Line Ambassador | Break-even ROAS per product | Owner |
| 4 | Stage 2 U21: one-day `utm_content={product_id}` test on the PMax final-URL suffix | Product-level ad sessions in Shopify going forward | Owner |
| 5 | Confirm whether cancelled orders send a conversion retraction (they do not today: #1014 is still counted) | Cleaner Ads value | Owner / Manager |

---

## Limitations

- No product, listing-group or shopping-item report was available through OpenRush. Per-product Google metrics are UNKNOWN, and per-product cost is a session-share ESTIMATE that assumes equal CPC.
- The order-to-conversion match is by click date and value. It is exact in every case but still inferred (ESTIMATE). #1027 and #1033 are matched only as a pair, because Ads split them across 10–22 Oct.
- Search terms cover only the top 300 rows (28% of spend). Shopping UK terms were not returned. Hidden terms are assumed non-brand.
- Shopify `utm_campaign` tags exist only from about 28 Sep. Before that, paid feed clicks are mixed into `sag_organic`. Session cart and checkout counts are session-level, not product-level.
- 4 orders in 30d (#1035, #1037, #1039, #1041) have no journey data. Ads may have influenced some of them unseen.
- Ads data for the last 1–2 days is preliminary. Ads reports by click date, Shopify by order date.
- Sales figures exclude cancelled #1010, #1014 and #1020. Ads still includes #1014.
- No costs exist, so all profit, contribution and break-even figures are UNKNOWN or ILLUSTRATIVE.
- Stage 3 page scores were taken as given. The 19 Nov theme publish may change basket behaviour from 20 Nov.

## Credits used (OpenRush)

| # | Call | Credits |
|---|---|---|
| 1 | describe_capabilities | 0 |
| 2 | get_ad_performance report=campaign, last_3_months | 3 |
| 3 | get_ad_performance report=search_term, last_3_months, limit 300 | 3 |
| 4 | get_ad_performance report=asset_group, last_3_months | 3 |
| 5 | get_ad_performance report=date, last_3_months | 3 |
| | **Total** | **12 of 15** (month 80 → about 92 of 2,001; the reserve was not touched) |

Other reads (free): Shopify Admin GraphQL × 1 (orders since 20 Aug with lines and journeys), ShopifyQL × 3 (cpc landings 30d, cpc landings 90d, sag_organic landings 90d), and local Stage 1–3 files.
