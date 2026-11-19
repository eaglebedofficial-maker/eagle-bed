# Project Rocket Sales, Stage 4, Parts 1, 3, 4, 9 and 14: evidence register, product database, sales by product, categories and bundles

Prepared 19 Nov 2026 by Analytics + Profit & Cash + Materials & Demand. Read-only. Nothing was changed in Shopify, the theme, ads, Gmail or HQ.
Sources: Shopify Admin GraphQL (`products`, `productsCount`, `orders`, `shop`) and ShopifyQL (`FROM sessions`), pulled 19 Nov 2026 (VERIFIED). Stage 1, 2, 3 and 3.1 reports, read in the original.
No customer personal data: order numbers only. Line-item properties kept only for product options (fabric, colour, base, drawers, mattress, delivery/assembly, headboard height). TEMU marketplace IDs and app-internal keys were dropped.
Labels: VERIFIED / HISTORICAL / ESTIMATE / UNKNOWN / RECOMMENDATION. Profit is UNKNOWN everywhere: there are no costs in any system (see 3.4).

## Files written (all under `ops/rocket/stage4/`)

| File | What it is |
|---|---|
| `evidence-register.csv` | 58 findings from the original Stage 1, 2, 3 and 3.1 reports with source, period, status and owner action |
| `product-db.json` | 257 products with all 1,295 variants nested, category rule, counts |
| `product-db.csv` | One row per variant (1,295 rows) |
| `products-summary.csv` | One row per product (257 rows) |
| `order-lines.csv` | One row per order line: 43 orders, 51 lines (8 are old VO "Selections" add-on lines), with option properties |
| `rankings.json` | Every product × 7 windows: orders, lines, units, gross, discounts, refunds, net, ASP, share, landing sessions, rates, growth |
| `sales-by-product.csv` | Full product list (141 products with any sale or landing session) × all windows |

## Summary

1. **Sales reconcile exactly with Stage 1** (VERIFIED). From the 43 GraphQL orders: last 90 days gross £15,158.33, discounts £1,009.06, net £13,563.37; last 30 days 16 orders, net £6,857.57. Excluding the 3 cancelled orders (#1010, #1014, #1020) as Stage 4 requires: last 90 = 33 orders, net **£13,289.78**; previous 30 = 7 orders, net £2,826.41. See 4.1 for the bridge.
2. **The catalogue is 257 products**: 145 published, 42 active but unpublished, 70 drafts, 0 archived. 1,295 variants. Only Line Ambassador has a Shopify colour option; every other product varies by size only. Fabric, colour, base, mattress, delivery and headboard height are Easify options stored as line-item properties.
3. **Shopify stock and cost fields are not real** (VERIFIED). Every published variant shows 997–12,000 units (placeholders for made-to-order). Unit cost is blank on 386 and £0 on 358 published variants; 19 variants show £300 on every size of 4 products (not a believable per-size cost). Cost = UNKNOWN.
4. **Ottoman products carry the business.** Ottoman category: 15 of 33 orders and £5,247.40 (39%) of last-90 net; last 30 +249% vs previous 30. The two ottoman *bases* (Gas Lift Divan Base, Side Lift Storage Base) are 8 of 16 orders in the last 30 days.
5. **Paid options are a quarter of revenue.** £1,959.80 of £7,472.64 gross in the last 30 days (26%) is Easify options (storage base, mattress, assembly, headboard height, gold strip). 21 of 35 bed orders ever carried at least one paid option.
6. **Mattress attachment is 26% of bed orders** (9 of 35, lifetime; 4 of 16 in the last 30 days), all through the Easify mattress option or the old VO add-on, never as a separate mattress product in the same order. Stage 1's "mattresses sold nothing in the last 30 days" is true for mattress *products* only: £679.96 of mattress options sold on bed orders in that window.
7. **Biggest unconverted demand** (last 90 days, landing sessions with a cart but no completed checkout): Line Bumper Ottoman 28, Line Ambassador 26, Ottoman Gas Lift Divan Base 25, Grand Extra-Tall 17, Side Lift 16, Cloud Teddy 16.
8. **Headboards: 17 live, 213 landing sessions in 90 days, 2 cart sessions, 0 orders ever.** No order has ever contained two products; "bed + headboard" has never happened.
9. **Evidence register:** 58 findings; 5 CRO theme fixes PUBLISHED 19 Nov (2 verified live by the Manager, 3 specialist-tested); 36 findings still open with an owner action, including Clearpay, storage-bed pricing, running total, #1020 refund and costs.

---

## Part 1. Evidence register

Full table: `evidence-register.csv` (columns: id, finding, source_file, source_section, report_date, reporting_period, historical_or_current, fixed, fix_published, fix_verified, remaining_owner_action, stage4_check_note). All source reports are dated 19 Nov 2026.

Theme status used (COMMON-BRIEF, VERIFIED by the Manager): theme 213270004043 "Eagle Bed CRO fixes 19 Nov - PUBLISH" was PUBLISHED by the owner on 19 Nov 2026 after ~15:30 UTC; live product pages measured 412 px (Pixel 7) and 390 px (iPhone 13 size) with a dark h1. Previous live theme 212418724171. Post-publication sales measurement starts 20 Nov 2026. Not fixed: Clearpay wording, storage-bed pricing/naming, running total, Easify on basket, tap targets, real Safari testing, desktop CLS.

| ID | Finding (short) | Source | Status | Fixed / published / verified | Remaining owner action |
|---|---|---|---|---|---|
| E01 | Last 30 days best month ever: 16 orders, net £6,857.57, AOV £428.60; orders +100%, net +173% vs previous 30 | stage1/01-sales-products §1.1 | current (baseline) | n/a | None. Baseline for post-publication measurement from 20 Nov |
| E02 | Last 90 days: 36 orders, gross £15,158.33, net £13,563.37 (includes cancelled #1020, which Shopify never reversed) | stage1/01-sales-products §1.1 / 1.3 | current | n/a | Settle #1020 (E03); then Shopify net becomes £13,289.78 |
| E03 | #1020 cancelled 18 min after purchase but still PAID; PayPal captured £273.59 and all 3 refund attempts FAILED | stage1/STAGE1-REPORT §16 #7 (and 06-gap-closure) | current (open money risk) | No | P0: owner checks PayPal and refunds the customer if still owed |
| E04 | #1010 and #1014 marked FULFILLED although payment EXPIRED, then cancelled 25 Sep (these are the £585.90 "returns") | stage1/STAGE1-REPORT §16 #7 | historical | No (process) | Rule: confirm payment before fulfilling |
| E05 | EAGLE10 (10%) used on 13 of 16 recent orders; £1,154.02 given away since July; only code in use | stage1/01-sales-products §1.6 | current | No (decision) | Review once product costs (C1) are known |
| E06 | "Fulfilled" means accepted, not shipped; 0 of last 16 orders have tracking | stage1/01-sales-products §1.7 | current | No | Decide on dispatch/tracking step; stop promising email tracking (E30) |
| E07 | All web orders show £0 tax; VAT registration status UNKNOWN (only TEMU #1003 carried VAT) | stage1/01-sales-products §1.3 #5 | current | No | Owner/accountant confirms VAT status (cost field C6) |
| E08 | 4 of 16 orders have no tracked session; Shopify CR (0.81%) under-counts real buying (~1.07%) | stage1/01-sales-products §1.4 | current | Partly unfixable (consent) | Consider a post-purchase "how did you hear" question |
| E09 | 24% of sessions are bots; bots "reached checkout" 106 times vs 57 humans | stage1/01-sales-products §1.4 | current | Yes (reporting rule: human filter) / n/a (reporting) | None |
| E10 | Checkout probing 15-17 Nov (97 checkout sessions vs 14 carts); no orders, no failed charges | stage1/STAGE1-REPORT §5.5 | current | No | P1: check Settings > Checkout bot protection and Payments for declines |
| E11 | Sessions -38.7% explained by Sept spike, junk referrers and sag_organic tag change; organic GSC clicks +29% | stage1/STAGE1-REPORT §5.1 | historical | n/a | None |
| E12 | PMax first-touch on 8 of 16 orders; non-brand ROAS about 1.7 (ESTIMATE); brand clicks bought by PMax | stage1/STAGE1-REPORT §1 #4 | current | No | Decide brand exclusion on PMax + negative list (no budget increase) |
| E13 | No product-level ad cost (no listing-group report, no utm_content) | stage2/STAGE2-REPORT §9.3 | current | No | Approve U21 utm_content test |
| E14 | Only 20 of 145 live products sold in 90 days; all 17 headboards sold 0 | stage1/STAGE1-REPORT §4.2 (F) | current | n/a | Range decision (Stage 4 part 9) |
| E15 | Line Bumper Ottoman 441 landings / 28 carts / 0 sales; Line Ambassador 373 / 26 / 1 | stage1/STAGE1-REPORT §4.2 (E) | current | No | Storage price truth (E25) and single colour picker (E53) |
| E16 | 42 active products unpublished and 70 drafts | stage1/STAGE1-REPORT §4.2 notes | current | n/a | Decide publish/archive |
| E17 | Mattresses sold nothing in the last 30 days | stage1/STAGE1-REPORT §3 | current (needs correction) | n/a | None |
| E18 | Size mix moved to King and Super King (53% of units in 90 days); no single beds since 21 Aug | stage1/STAGE1-REPORT §3 | current | n/a | None |
| E19 | Product pages wider than the phone on 134 of 145 PDPs (Side Lift 1,486 px on 412 px Pixel 7) | stage3/STAGE3-REPORT §0.2 #1 | historical (fixed) | Yes / PUBLISHED 19 Nov / Manager-verified | Real Safari test on owner iPhone (still open) |
| E20 | Product title (h1) white on white on every PDP (1.0:1) | stage3/STAGE3-REPORT §0.2 #2 | historical (fixed) | Yes / PUBLISHED 19 Nov / Manager-verified | None |
| E21 | Collection card / related names and "Your basket" heading at 1.0-1.2:1 contrast | stage3/STAGE3-REPORT §1 #3 | historical (fixed) | Yes / PUBLISHED 19 Nov / specialist-tested | None |
| E22 | Shopify Chat bubble covered right half of mobile sticky Add to basket and Checkout securely | stage3/STAGE3-REPORT §1 #4 | historical (fixed) | Yes / PUBLISHED 19 Nov / specialist-tested | Owner glance on own phone |
| E23 | Sticky Add to basket appeared only after 2,700-4,250 px, off-screen; taps failed (0/8) | stage3/STAGE3-REPORT §1 #8 | historical (fixed) | Yes / PUBLISHED 19 Nov / specialist-tested | None |
| E24 | Clearpay promised on PDPs, basket and 16 pages; not offered at checkout; 0 of 43 orders used it | stage3/STAGE3-REPORT §1 #5 | current | No | P0/P1 owner decision: switch Clearpay on or remove the wording |
| E25 | 16 storage-titled listings show a slatted-base price; ottoman +£119.99 to +£189.99, nothing pre-selected | stage3/STAGE3-REPORT §1 #7 | current | No | Owner decision 14.6: price the storage in or rename honestly |
| E26 | Main price changes only with size; add-ons appear only as "additional charge" (no running total) | stage3/STAGE3-REPORT §1 #6 | current | No | Approve running total (Easify/app) |
| E27 | Price not on first mobile screen | stage3/STAGE3-REPORT §1 #9 | current | No | Theme decision |
| E28 | Mattress size not tied to bed size (Single base + 5ft mattress accepted) | stage3/STAGE3-REPORT §1 #10 | current | No | Easify conditional logic |
| E29 | Colour group labelled "Fabric Type" twice | stage3/STAGE3-REPORT §1 #11 | current | No | Rename in Easify |
| E30 | Delivery page omits the three delivery services and promises email tracking | stage3/STAGE3-REPORT §1 #12 | current | No | Approve page copy |
| E31 | Easify loads on /cart (408 KB) where unused; PDP JS 1.26 MB | stage3/STAGE3-REPORT §1 #20 | current | No | Approve unload on cart |
| E32 | Many tap targets under 44 px | stage3/STAGE3-REPORT §1 #17 | current | No | Theme decision |
| E33 | Desktop PDP layout shift (CLS up to 0.47) from late Easify | stage1/STAGE1-REPORT §6.2 #9 | current | No | Reserve height for options block |
| E34 | "Orthopedic/Orthopaedic" (medical word) in a mattress name and option | stage3/STAGE3-REPORT §1 #19 | current | No | Approve rename |
| E35 | Paid (google/cpc) UK human L30: 93 basket sessions -> 15 checkouts -> 6 completed | stage3/STAGE3-REPORT §6.2 | current (pre-publication baseline) | n/a | Measure again from 20 Nov |
| E36 | Reviews: 2 of 145 products have one Judge.me review each (+1 store review) | stage1/STAGE1-REPORT §16 #4 | current | No | Approve ethical review requests |
| E37 | Checkout card field said "card payments aren't available" in the sandbox | stage3/STAGE3-REPORT §6.3 | current (UNKNOWN) | n/a | Owner check 5 on a real phone |
| E38 | 253 trade emails implied free assembly; owner rule: assembly is never free (£69.99 option) | stage1/STAGE1-REPORT §1 #7 | historical (site fixed) | Yes for site pages, WhatsApp and agent prompts / Yes (19 Nov, Manager) | Sent emails cannot be recalled; owner decides on any correction |
| E39 | GA4 property currency is USD; GA4 purchases unreadable | stage2/STAGE2-REPORT §3 | current | No | T1 switch GA4 currency to GBP |
| E40 | Meta ad account sits in "Legend Beds" business and cannot see the Eagle Bed pixel/catalogue | stage2/STAGE2-REPORT §6.1 | current | No | P0 before any Meta spend (T5) |
| E41 | 4 styleaba.com items in the Meta catalogue | stage2/STAGE2-REPORT §R10 | current | No | Delete items (T6) |
| E42 | Simprosys feed app loads gtag with an empty ID on every page | stage2/STAGE2-REPORT §2.4 S1 | current | No | Switch off Simprosys pixel (T4) |
| E43 | Order lines without SKU (4) and one deleted variant (#1009) | stage2/STAGE2-REPORT §DQ06 | current | No | Fill SKUs (T17) |
| E44 | Social, trade-email and GBP links untagged; tagging added 19 Nov | stage2/STAGE2-REPORT §12a-c | historical (fixed) | Yes / Yes (task prompts, 19 Nov) | None |
| E45 | Profit UNKNOWN: no product, mattress, delivery, assembly, VAT or fee costs (C1-C9) | stage2/STAGE2-REPORT §13 T14 | current | No | P1 owner cost pack C1, C2, C3, C6 |
| E46 | Product attribution stops at landing page (no per-product views/carts; Easify choices not tracked) | stage2/STAGE2-REPORT §9 | current | No | Approve option_selected event (T9) |
| E47 | Cookie banner settings unreadable; CMP Insert Code app installed with no code | stage2/STAGE2-REPORT §2.4 S2-S3 | current | No | Owner checks banner (T8) |
| E48 | Two Merchant Center IDs; which feeds PMax unknown | stage2/STAGE2-REPORT §R13 | current | No | Choose live MC (T11) |
| E49 | 3 Shopify Inbox chat hand-offs never reached HQ | stage3/STAGE3-REPORT §0.2 #3 | historical (fixed) | Yes (inbox agent prompt) / Yes (internal automation, 19 Nov) | None |
| E50 | Ottoman Gas Lift Divan Base text vs options mismatch (end- vs side-opening) | stage3/STAGE3-REPORT §4.2 #2 (decision 14.12) | current | No | Owner confirms opening and aligns options |
| E51 | Royal Chesterfield Super King £389.99 is cheaper than King £399.99 | stage3/STAGE3-REPORT §5 (inv-6) | current | No | Owner price decision |
| E52 | Grand Extra-Tall: "extra-tall" never stated (same 50/54/60" as every bed); no SKUs; clearest basket leak (PMax 15 carts -> 1 checkout) | stage3/STAGE3-REPORT §5 (inv-7) | current | No | Owner states real headboard height; fill SKUs |
| E53 | Line Ambassador has two colour pickers (Shopify Colour variant with Cream pre-selected + Easify colour) | stage3/STAGE3-REPORT §5 (inv-2) | current | No | Remove Shopify Colour option or Easify colour |
| E54 | "Pepproyd Street workshop" named in 4 descriptions (BRIEF: say Dewsbury only) | stage3/STAGE3-REPORT §5 common findings | current | No | Approve description edits |
| E55 | Delivery timeline shows weekend / next-day dates against "3-5 working days" | stage1/STAGE1-REPORT §6.2 #12 | current (UNKNOWN) | No | Owner glance at a PDP |
| E56 | ChatGPT is the fastest-growing source (61 -> 188 sessions, 1 order £629.96) | stage1/STAGE1-REPORT §5.3 | current | n/a | None |
| E57 | Meta ads paused since 8 Sep (£0 spend 9 Sep-18 Nov) | stage1/STAGE1-REPORT §16 #1 | current | n/a | Fix E40 before any restart |
| E58 | Abandoned-checkout lists include people who later bought (#1034) | stage1/STAGE1-REPORT §6.1 C | current (rule) | Yes (rule: check for later order first) / n/a | None |

Count: 48 current, 10 historical. 5 fixes published in the theme (E19–E23), 3 other fixes done by the Manager in internal prompts or pages (E38, E44, E49) and 1 reporting rule (E09). 36 findings have "No" in the fixed column.

---

## Part 3. Product database

### 3.1 Counts (VERIFIED, GraphQL `productsCount` and full product pull)

| Status | Products | Variants |
|---|---|---|
| Active and published to the Online Store | 145 | 763 |
| Active, not published | 42 | 137 |
| Draft | 70 | 395 |
| Archived | 0 | 0 |
| **Total** | **257** | **1,295** |

Vendor field: "Eagle Bed" on all 257 (no supplier information in Shopify). Compare-at price: none on any variant (0 of 1,295).

### 3.2 Category mapping rule

Rule (also stored in `product-db.json` → `category_rule`): Applied in order to Shopify productType + product name (title text before the first ' – ' dash): 1 productType Mattress -> mattresses; 2 productType Headboard -> headboards; 3 productType Kids Bed or 'kids' in title -> kids beds; 4 productType Storage Box -> accessories/other; 5 'ottoman' in title -> ottoman beds; 6 title has 'storage bed' or 'drawers' but not 'base'/'divan' -> storage beds (drawers); 7 productType Divan Bed or 'divan' in title -> divan beds/bases; 8 'storage'/'drawer' in title -> storage beds (drawers); 9 everything else (productType Bed Frame) -> upholstered bed frames. Order lines with no product (VO 'Selections' add-on lines) inherit the parent product's category.

| Category | Published | All statuses | Shopify product types inside |
|---|---|---|---|
| Upholstered bed frames | 95 | 158 | Bed Frame |
| Headboards | 17 | 17 | Headboard |
| Ottoman beds | 11 | 19 | Ottoman Bed (18) + 1 Divan Bed titled "Multi Mini Line Divan Ottoman Bed" |
| Kids beds | 6 | 25 | Kids Bed |
| Mattresses | 6 | 10 | Mattress |
| Storage beds (drawers) | 5 | 22 | Divan Bed titled "... Storage Bed (with Drawers)" |
| Divan beds/bases | 4 | 5 | Divan Bed |
| Accessories/other | 1 | 1 | Storage Box |

Note: ottoman bases (Ottoman Gas Lift Divan Base, Side Lift Ottoman Storage Base) sit in "ottoman beds" because "ottoman" is in the name. Several bed frames are titled "... Ottoman Bed – Gas Lift Storage" but sell at a slatted-base price (E25); they are in "ottoman beds" by name, which is what the shopper sees.

### 3.3 Data quality (published products, VERIFIED)

| Check | Result |
|---|---|
| Images | median 9 per product; 11 of 145 have fewer than 5; 0 have none (1 unpublished product has none) |
| Description length | median 2,348 characters; none under 300 |
| Tags | every product tagged |
| SKUs | 183 of 763 published variants have no SKU (37 products: all 17 headboards, Grand Extra-Tall, Curved Wingback, Regal Gold-Trim, Hilton, Side Lift Open Ottoman Bed and others). No duplicate SKUs |
| Options | 1,235 variants Size only; 60 variants Size × Colour (Line Ambassador only); 2 single-variant products |
| Size spelling | mixed ("Super-King (6FT)", "SUPER KING (6FT)", "Super King", "King 5FT"); normalised in the files to Kids Single / Single / Small Double / Double / King / Super King |

### 3.4 Inventory and cost fields (VERIFIED: they do not hold real values)

| Field | Published variants | Reading |
|---|---|---|
| inventoryItem.tracked = true | 695 | Quantities 997–12,000: placeholder stock for made-to-order beds. Not meaningful |
| tracked = false | 68 | Shopify still returns ~1,000 |
| inventoryPolicy DENY (stop at 0) | 241 | Harmless today because quantities are ~1,000; would block sales if anyone set real stock |
| inventoryItem.unitCost | readable: blank on 386, £0 on 358, £300 on 19 | The £300 rows are the same on every size of Curved Wingback, Princess, Grand Princess and Grand Luxury beds: not a real per-size cost. **Cost = UNKNOWN** |

So Shopify cannot answer stock, lead time or margin questions. RECOMMENDATION: keep costs in HQ `costs/*` (Stage 2 T14) rather than in Shopify until the owner has real numbers.

### 3.5 Easify (and old VO Product Options) custom options

These are **not Shopify variants**. They are saved on the order line as properties. Two generations exist in the orders:

| Era | Orders | How options appear | Keys seen |
|---|---|---|---|
| VO Product Options (13 Jul–29 Sep) | web orders #1001–#1021 carry the choices on the bed line (free choices only); paid choices became draft orders #1002, #1005, #1008, #1013, #1014, #1016, #1018, #1020 (tagged `vopo`) | Free choices on the bed line; paid choices on a separate "– Selections" line with no product, priced at the option total | Colour Option, Bed cloth type, Base variations, Add divan drawers, Headboard height, Mattress, Delivery Service |
| Easify (#1019, 18 Sep, and all web orders since #1025, 8 Oct) | web orders | Same line as the bed; the line price already includes the options | Fabric Type, [fabric] colour, Base Type, Headboard Height, Button Type, Strip Colour, Mattress Type, Mattress Size …, Delivery Service (some with a leading "_") |

Option prices are written inside the values, e.g. "Mesh Metal Ottoman (£149.99 GBP)". Stage 4 parsed these to measure option revenue. Assembly shows as £49.99 on past orders (the price before the owner's 19 Nov change to £69.99).

---

## Part 4. Order lines and product rankings

### 4.1 Reconciliation with Stage 1 (VERIFIED)

`order-lines.csv`: 43 orders (#1001 13 Jul 2026 to #1043 18 Nov 2026), 51 lines. Every web order has one bed line; the 8 VO draft orders have a bed line plus a "Selections" add-on line. No order has ever contained two different products.

| Window (UK) | Stage 1 (ShopifyQL) | Rebuilt from orders, same rules | Stage 4 basis (cancelled orders excluded) | Why different |
|---|---|---|---|---|
| Last 30, 20 Oct–19 Nov | 16 orders, gross £7,472.64, disc £615.07, net £6,857.57 | identical | identical (no cancellations) | – |
| Prev 30, 19 Sep–19 Oct | 8 orders, net £2,514.10 | gross £3,257.86, disc £157.86, returns £585.90 | 7 orders, gross £2,953.88, disc £127.47, net £2,826.41 | Shopify counts #1020 (£273.59, never reversed) and books the 25 Sep cancellations of #1010/#1014 (−£585.90) in this window. £2,514.10 − £273.59 + £585.90 = £2,826.41 |
| Last 90, 22 Aug–19 Nov | 36 orders, gross £15,158.33, disc £1,009.06, returns £585.90, net £13,563.37 | identical | 33 orders, gross £14,203.37, disc £913.59, net £13,289.78 | Removes the 3 cancelled orders (gross £954.96, disc £95.47). £13,563.37 − £273.59 = £13,289.78 (= Stage 1's ESTIMATE, now VERIFIED) |
| Prev 90, 24 May–21 Aug | 7 orders, net £1,952.19 | identical | identical | Refunds #1001, #1006 (£514.80, same-day) kept as refunds |
| Lifetime, 13 Jul–19 Nov | – | 43 orders, gross £17,770.28 | 40 orders, gross £16,815.32, disc £1,058.55, refunds £514.80, net £15,241.97 | – |

Shipping: £90.00 on #1038 only. Tax: £61.62 on TEMU #1003 only. Neither is in net sales.

### 4.2 Definitions used in the rankings

- Basis: order creation date in UK time. Cancelled orders excluded. Refunds deducted in the order's window (both refunds were the same day as the order).
- Orders = non-cancelled orders containing the product. Order lines exclude VO "Selections" add-on lines; their money is added to the parent product (column `of_which_vo_selections_addon` in `rankings.json`).
- Gross = line price × quantity, including paid options. Discounts = EAGLE10 allocated to the line. Net = gross − discounts − refunds.
- ASP = net ÷ units. "ASP/AOV" = product ASP ÷ store AOV in the same window (the "share of AOV" measure; above 1.0x means the product lifts the average order). "Share of net" = product net ÷ store net.
- Landing sessions = **human** sessions that landed on that product page (ShopifyQL `FROM sessions`, `landing_page_type = 'Product'`, by day, summed). Cart sessions = those sessions with any cart addition (any product). "Orders ÷ landing" = product orders from any landing page ÷ landing sessions: an upper-bound proxy, not true conversion. Products bought after landing elsewhere (mattresses, low-traffic beds) look inflated.
- Last 180 days (23 May–19 Nov) contains every order ever, so its sales equal lifetime; only sessions differ.
- Refund rate is meaningful only lifetime: 2 refunded units of 41 (4.9%): Finger Panel Bed (#1001, 1 of 1) and Line Kids Velvet Bed (#1006, 1 of 4 units). Both in July–August, none since.

### 4.3 Top 20 per window (full list: `sales-by-product.csv`)

Ranked by net, then landing sessions. Growth = net vs the previous window ("new" = no sales before).

#### Last 7 (13 Nov 2026 – 19 Nov 2026, UK time)

Store (excl. cancelled): 4 orders, 4 units, gross £2,360.89, discounts £182.07, refunds £0.00, net £2,178.82, AOV £544.71; product landing sessions 215.

| # | Product | Cat | Orders | Units | Gross | Disc | Refunds | Net | ASP | Share of net | ASP/AOV | Landing sess. | Cart sess. | Orders ÷ landing |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Curved Wingback Bed | upholstered | 1 | 1 | £642.97 | £64.29 | £0.00 | £578.68 | £578.68 | 26.6% | 1.06x | 3 | 1 | 33.3% |
| 2 | Cloud Teddy Bouclé Ottoman Bed | ottoman | 1 | 1 | £617.98 | £61.79 | £0.00 | £556.19 | £556.19 | 25.5% | 1.02x | 7 | 1 | 14.3% |
| 3 | Grand Extra-Tall Panel Bed | upholstered | 1 | 1 | £539.97 | £0.00 | £0.00 | £539.97 | £539.97 | 24.8% | 0.99x | 34 | 4 | 2.9% |
| 4 | Eagle Regal Gold-Trim Bed | upholstered | 1 | 1 | £559.97 | £55.99 | £0.00 | £503.98 | £503.98 | 23.1% | 0.93x | 1 | 0 | 100.0% |
| 5 | Ottoman Gas Lift Divan Base | ottoman | 0 | 0 | 0 | 0 | 0 | 0 | – | 0.0% | – | 25 | 0 | 0.0% |
| 6 | Line Bumper Ottoman Divan Bed | ottoman | 0 | 0 | 0 | 0 | 0 | 0 | – | 0.0% | – | 19 | 2 | 0.0% |
| 7 | Line Ambassador Bed | upholstered | 0 | 0 | 0 | 0 | 0 | 0 | – | 0.0% | – | 15 | 5 | 0.0% |
| 8 | Side Lift Ottoman Storage Base | ottoman | 0 | 0 | 0 | 0 | 0 | 0 | – | 0.0% | – | 11 | 0 | 0.0% |
| 9 | Royal Chesterfield Bed | upholstered | 0 | 0 | 0 | 0 | 0 | 0 | – | 0.0% | – | 8 | 1 | 0.0% |
| 10 | Mini Line Wingback Bed | upholstered | 0 | 0 | 0 | 0 | 0 | 0 | – | 0.0% | – | 7 | 2 | 0.0% |
| 11 | Liberty Wingback Bed | upholstered | 0 | 0 | 0 | 0 | 0 | 0 | – | 0.0% | – | 6 | 0 | 0.0% |
| 12 | Line Kids Velvet Bed | kids | 0 | 0 | 0 | 0 | 0 | 0 | – | 0.0% | – | 5 | 1 | 0.0% |
| 13 | Elegant Panel Bed | upholstered | 0 | 0 | 0 | 0 | 0 | 0 | – | 0.0% | – | 5 | 0 | 0.0% |
| 14 | Grand Princess Luxury Bed | upholstered | 0 | 0 | 0 | 0 | 0 | 0 | – | 0.0% | – | 4 | 0 | 0.0% |
| 15 | Modern Wingback Upholstered Headboard | headboards | 0 | 0 | 0 | 0 | 0 | 0 | – | 0.0% | – | 4 | 0 | 0.0% |
| 16 | Mini Line Wingback Kids Bed | kids | 0 | 0 | 0 | 0 | 0 | 0 | – | 0.0% | – | 4 | 0 | 0.0% |
| 17 | Black Piping Art Deco Bed | upholstered | 0 | 0 | 0 | 0 | 0 | 0 | – | 0.0% | – | 4 | 0 | 0.0% |
| 18 | Roxy Curved Wingback Bed | upholstered | 0 | 0 | 0 | 0 | 0 | 0 | – | 0.0% | – | 3 | 2 | 0.0% |
| 19 | Aurora Luxury Vertical Panel Bed | upholstered | 0 | 0 | 0 | 0 | 0 | 0 | – | 0.0% | – | 3 | 1 | 0.0% |
| 20 | Side Lift Open Ottoman Bed | ottoman | 0 | 0 | 0 | 0 | 0 | 0 | – | 0.0% | – | 2 | 0 | 0.0% |

#### Last 30 (20 Oct 2026 – 19 Nov 2026, UK time)

Store (excl. cancelled): 16 orders, 16 units, gross £7,472.64, discounts £615.07, refunds £0.00, net £6,857.57, AOV £428.60; product landing sessions 1,012.

| # | Product | Cat | Orders | Units | Gross | Disc | Refunds | Net | ASP | Share of net | ASP/AOV | Landing sess. | Cart sess. | Orders ÷ landing | Growth net |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Ottoman Gas Lift Divan Base | ottoman | 4 | 4 | £1,498.92 | £99.27 | £0.00 | £1,399.65 | £349.91 | 20.4% | 0.82x | 81 | 5 | 4.9% | +41% |
| 2 | Side Lift Ottoman Storage Base | ottoman | 4 | 4 | £1,169.95 | £89.47 | £0.00 | £1,080.48 | £270.12 | 15.8% | 0.63x | 65 | 7 | 6.2% | new |
| 3 | Cloud Teddy Bouclé Ottoman Bed | ottoman | 2 | 2 | £1,085.97 | £108.58 | £0.00 | £977.39 | £488.70 | 14.2% | 1.14x | 26 | 8 | 7.7% | new |
| 4 | Eagle Savoy Channel Bed | upholstered | 1 | 1 | £914.97 | £91.49 | £0.00 | £823.48 | £823.48 | 12.0% | 1.92x | 20 | 6 | 5.0% | new |
| 5 | Royal Chesterfield Bed | upholstered | 1 | 1 | £699.95 | £69.99 | £0.00 | £629.96 | £629.96 | 9.2% | 1.47x | 60 | 11 | 1.7% | new |
| 6 | Curved Wingback Bed | upholstered | 1 | 1 | £642.97 | £64.29 | £0.00 | £578.68 | £578.68 | 8.4% | 1.35x | 21 | 4 | 4.8% | new |
| 7 | Grand Extra-Tall Panel Bed | upholstered | 1 | 1 | £539.97 | £0.00 | £0.00 | £539.97 | £539.97 | 7.9% | 1.26x | 113 | 16 | 0.9% | new |
| 8 | Eagle Regal Gold-Trim Bed | upholstered | 1 | 1 | £559.97 | £55.99 | £0.00 | £503.98 | £503.98 | 7.3% | 1.18x | 6 | 0 | 16.7% | new |
| 9 | Cambridge Panel Storage Bed with Drawers | storage | 1 | 1 | £359.97 | £35.99 | £0.00 | £323.98 | £323.98 | 4.7% | 0.76x | 7 | 1 | 14.3% | new |
| 10 | Line Ambassador Bed | upholstered | 0 | 0 | 0 | 0 | 0 | 0 | – | 0.0% | – | 90 | 12 | 0.0% | – |
| 11 | Line Bumper Ottoman Divan Bed | ottoman | 0 | 0 | 0 | 0 | 0 | 0 | – | 0.0% | – | 82 | 13 | 0.0% | – |
| 12 | Line Kids Velvet Bed | kids | 0 | 0 | 0 | 0 | 0 | 0 | – | 0.0% | – | 32 | 5 | 0.0% | – |
| 13 | Cambridge Curved Headboard | headboards | 0 | 0 | 0 | 0 | 0 | 0 | – | 0.0% | – | 28 | 0 | 0.0% | – |
| 14 | Grand Princess Luxury Bed | upholstered | 0 | 0 | 0 | 0 | 0 | 0 | – | 0.0% | – | 26 | 0 | 0.0% | – |
| 15 | Mini Line Wingback Kids Bed | kids | 0 | 0 | 0 | 0 | 0 | 0 | – | 0.0% | – | 21 | 2 | 0.0% | – |
| 16 | Roxy Curved Wingback Bed | upholstered | 0 | 0 | 0 | 0 | 0 | 0 | – | 0.0% | – | 19 | 2 | 0.0% | – |
| 17 | Mini Line Wingback Bed | upholstered | 0 | 0 | 0 | 0 | 0 | 0 | – | 0.0% | – | 16 | 4 | 0.0% | – |
| 18 | Modern Wingback Upholstered Headboard | headboards | 0 | 0 | 0 | 0 | 0 | 0 | – | 0.0% | – | 16 | 1 | 0.0% | – |
| 19 | Elegant Panel Bed | upholstered | 0 | 0 | 0 | 0 | 0 | 0 | – | 0.0% | – | 16 | 1 | 0.0% | -100% |
| 20 | Eagle Monarch Two-Tone Frame Bed | upholstered | 0 | 0 | 0 | 0 | 0 | 0 | – | 0.0% | – | 14 | 1 | 0.0% | – |

#### Prev 30 (19 Sep 2026 – 19 Oct 2026, UK time)

Store (excl. cancelled): 7 orders, 7 units, gross £2,953.88, discounts £127.47, refunds £0.00, net £2,826.41, AOV £403.77; product landing sessions 1,708.

| # | Product | Cat | Orders | Units | Gross | Disc | Refunds | Net | ASP | Share of net | ASP/AOV | Landing sess. | Cart sess. | Orders ÷ landing |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Ottoman Gas Lift Divan Base | ottoman | 2 | 2 | £1,027.97 | £36.39 | £0.00 | £991.58 | £495.79 | 35.1% | 1.23x | 193 | 9 | 1.0% |
| 2 | 3000 Pocket Sprung Mattress | mattresses | 2 | 2 | £623.98 | £28.59 | £0.00 | £595.39 | £297.70 | 21.1% | 0.74x | 7 | 1 | 28.6% |
| 3 | Regal Luxe Panel Bed | upholstered | 1 | 1 | £578.97 | £0.00 | £0.00 | £578.97 | £578.97 | 20.5% | 1.43x | 6 | 0 | 16.7% |
| 4 | Elegant Panel Bed | upholstered | 1 | 1 | £624.97 | £62.49 | £0.00 | £562.48 | £562.48 | 19.9% | 1.39x | 3 | 1 | 33.3% |
| 5 | Upholstered Ottoman Storage Box | accessories/other | 1 | 1 | £97.99 | £0.00 | £0.00 | £97.99 | £97.99 | 3.5% | 0.24x | 14 | 1 | 7.1% |
| 6 | Line Bumper Ottoman Divan Bed | ottoman | 0 | 0 | 0 | 0 | 0 | 0 | – | 0.0% | – | 278 | 14 | 0.0% |
| 7 | Stone Premium Bed | upholstered | 0 | 0 | 0 | 0 | 0 | 0 | – | 0.0% | – | 127 | 0 | 0.0% |
| 8 | Line Ambassador Bed | upholstered | 0 | 0 | 0 | 0 | 0 | 0 | – | 0.0% | – | 116 | 6 | 0.0% |
| 9 | Line Kids Velvet Bed | kids | 0 | 0 | 0 | 0 | 0 | 0 | – | 0.0% | – | 87 | 1 | 0.0% |
| 10 | Side Lift Ottoman Storage Base | ottoman | 0 | 0 | 0 | 0 | 0 | 0 | – | 0.0% | – | 75 | 3 | 0.0% |
| 11 | Mini Line Wingback Kids Bed | kids | 0 | 0 | 0 | 0 | 0 | 0 | – | 0.0% | – | 72 | 7 | 0.0% |
| 12 | Eagle Royal Chesterfield Wingback Bed | upholstered | 0 | 0 | 0 | 0 | 0 | 0 | – | 0.0% | – | 42 | 1 | 0.0% |
| 13 | Divan Storage Base with Drawers | divan | 0 | 0 | 0 | 0 | 0 | 0 | – | 0.0% | – | 33 | 1 | 0.0% |
| 14 | Grand Princess Luxury Bed | upholstered | 0 | 0 | 0 | 0 | 0 | 0 | – | 0.0% | – | 32 | 0 | 0.0% |
| 15 | Cloud Teddy Bouclé Ottoman Bed | ottoman | 0 | 0 | 0 | 0 | 0 | 0 | – | 0.0% | – | 28 | 5 | 0.0% |
| 16 | Eagle Chelsea Panel Bed | upholstered | 0 | 0 | 0 | 0 | 0 | 0 | – | 0.0% | – | 27 | 0 | 0.0% |
| 17 | Small Line Divan Bed | divan | 0 | 0 | 0 | 0 | 0 | 0 | – | 0.0% | – | 24 | 0 | 0.0% |
| 18 | Star Unique Bed | upholstered | 0 | 0 | 0 | 0 | 0 | 0 | – | 0.0% | – | 21 | 0 | 0.0% |
| 19 | Mirror Panel Luxury Bed | upholstered | 0 | 0 | 0 | 0 | 0 | 0 | – | 0.0% | – | 20 | 0 | 0.0% |
| 20 | Modern Padded Horizontal Channel Headboard | headboards | 0 | 0 | 0 | 0 | 0 | 0 | – | 0.0% | – | 20 | 0 | 0.0% |

#### Last 90 (22 Aug 2026 – 19 Nov 2026, UK time)

Store (excl. cancelled): 33 orders, 33 units, gross £14,203.37, discounts £913.59, refunds £0.00, net £13,289.78, AOV £402.72; product landing sessions 4,613.

| # | Product | Cat | Orders | Units | Gross | Disc | Refunds | Net | ASP | Share of net | ASP/AOV | Landing sess. | Cart sess. | Orders ÷ landing | Growth net |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Ottoman Gas Lift Divan Base | ottoman | 7 | 7 | £2,832.88 | £166.25 | £0.00 | £2,666.63 | £380.95 | 20.1% | 0.95x | 606 | 27 | 1.2% | new |
| 2 | Side Lift Ottoman Storage Base | ottoman | 6 | 6 | £1,750.93 | £147.55 | £0.00 | £1,603.38 | £267.23 | 12.1% | 0.66x | 276 | 19 | 2.2% | +601% |
| 3 | Cloud Teddy Bouclé Ottoman Bed | ottoman | 2 | 2 | £1,085.97 | £108.58 | £0.00 | £977.39 | £488.70 | 7.3% | 1.21x | 124 | 16 | 1.6% | new |
| 4 | Eagle Savoy Channel Bed | upholstered | 1 | 1 | £914.97 | £91.49 | £0.00 | £823.48 | £823.48 | 6.2% | 2.04x | 36 | 8 | 2.8% | new |
| 5 | Royal Chesterfield Bed | upholstered | 1 | 1 | £699.95 | £69.99 | £0.00 | £629.96 | £629.96 | 4.7% | 1.56x | 64 | 11 | 1.6% | new |
| 6 | 3000 Pocket Sprung Mattress | mattresses | 2 | 2 | £623.98 | £28.59 | £0.00 | £595.39 | £297.70 | 4.5% | 0.74x | 11 | 1 | 18.2% | +93% |
| 7 | Regal Luxe Panel Bed | upholstered | 1 | 1 | £578.97 | £0.00 | £0.00 | £578.97 | £578.97 | 4.4% | 1.44x | 10 | 0 | 10.0% | new |
| 8 | Curved Wingback Bed | upholstered | 1 | 1 | £642.97 | £64.29 | £0.00 | £578.68 | £578.68 | 4.3% | 1.44x | 38 | 4 | 2.6% | new |
| 9 | Elegant Panel Bed | upholstered | 1 | 1 | £624.97 | £62.49 | £0.00 | £562.48 | £562.48 | 4.2% | 1.40x | 19 | 2 | 5.3% | new |
| 10 | Eagle Sunrise Fan Panel Bed | upholstered | 1 | 1 | £549.98 | £0.00 | £0.00 | £549.98 | £549.98 | 4.1% | 1.37x | 6 | 0 | 16.7% | new |
| 11 | Grand Extra-Tall Panel Bed | upholstered | 1 | 1 | £539.97 | £0.00 | £0.00 | £539.97 | £539.97 | 4.1% | 1.34x | 117 | 17 | 0.9% | new |
| 12 | Line Kids Velvet Bed | kids | 1 | 1 | £505.98 | £0.00 | £0.00 | £505.98 | £505.98 | 3.8% | 1.26x | 205 | 8 | 0.5% | -10% |
| 13 | Eagle Regal Gold-Trim Bed | upholstered | 1 | 1 | £559.97 | £55.99 | £0.00 | £503.98 | £503.98 | 3.8% | 1.25x | 36 | 1 | 2.8% | new |
| 14 | Mirror Strip Sunrise Bed | upholstered | 1 | 1 | £428.99 | £0.00 | £0.00 | £428.99 | £428.99 | 3.2% | 1.07x | 39 | 1 | 2.6% | -50% |
| 15 | Line Ambassador Bed | upholstered | 1 | 1 | £419.98 | £41.99 | £0.00 | £377.99 | £377.99 | 2.8% | 0.94x | 374 | 26 | 0.3% | new |
| 16 | Hilton Wingback Bed | upholstered | 1 | 1 | £403.98 | £40.39 | £0.00 | £363.59 | £363.59 | 2.7% | 0.90x | 14 | 1 | 7.1% | new |
| 17 | Divan Storage Base with Drawers | divan | 1 | 1 | £359.98 | £0.00 | £0.00 | £359.98 | £359.98 | 2.7% | 0.89x | 119 | 2 | 0.8% | new |
| 18 | Cambridge Panel Storage Bed with Drawers | storage | 1 | 1 | £359.97 | £35.99 | £0.00 | £323.98 | £323.98 | 2.4% | 0.80x | 10 | 1 | 10.0% | new |
| 19 | Memory Orthopaedic Mattress | mattresses | 1 | 1 | £220.99 | £0.00 | £0.00 | £220.99 | £220.99 | 1.7% | 0.55x | 22 | 0 | 4.5% | new |
| 20 | Upholstered Ottoman Storage Box | accessories/other | 1 | 1 | £97.99 | £0.00 | £0.00 | £97.99 | £97.99 | 0.7% | 0.24x | 27 | 1 | 3.7% | new |

#### Prev 90 (24 May 2026 – 21 Aug 2026, UK time)

Store (excl. cancelled): 7 orders, 8 units, gross £2,611.95, discounts £144.96, refunds £514.80, net £1,952.19, AOV £278.88; product landing sessions 1,435.

| # | Product | Cat | Orders | Units | Gross | Disc | Refunds | Net | ASP | Share of net | ASP/AOV | Landing sess. | Cart sess. | Orders ÷ landing |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Mirror Strip Sunrise Bed | upholstered | 2 | 2 | £853.93 | £0.00 | £0.00 | £853.93 | £426.97 | 43.7% | 1.53x | 32 | 4 | 6.2% |
| 2 | Line Kids Velvet Bed | kids | 2 | 3 | £909.97 | £90.98 | £257.40 | £561.59 | £187.20 | 28.8% | 0.67x | 39 | 2 | 5.1% |
| 3 | 3000 Pocket Sprung Mattress | mattresses | 1 | 1 | £308.07 | £0.00 | £0.00 | £308.07 | £308.07 | 15.8% | 1.10x | 6 | 0 | 16.7% |
| 4 | Side Lift Ottoman Storage Base | ottoman | 1 | 1 | £253.99 | £25.39 | £0.00 | £228.60 | £228.60 | 11.7% | 0.82x | 51 | 4 | 2.0% |
| 5 | Line Ambassador Bed | upholstered | 0 | 0 | 0 | 0 | 0 | 0 | – | 0.0% | – | 305 | 2 | 0.0% |
| 6 | Mini Line Wingback Kids Bed | kids | 0 | 0 | 0 | 0 | 0 | 0 | – | 0.0% | – | 132 | 2 | 0.0% |
| 7 | Ottoman Gas Lift Divan Base | ottoman | 0 | 0 | 0 | 0 | 0 | 0 | – | 0.0% | – | 90 | 2 | 0.0% |
| 8 | Stone Premium Bed | upholstered | 0 | 0 | 0 | 0 | 0 | 0 | – | 0.0% | – | 82 | 3 | 0.0% |
| 9 | Mayfair Stud Bed | upholstered | 0 | 0 | 0 | 0 | 0 | 0 | – | 0.0% | – | 76 | 0 | 0.0% |
| 10 | Divan Storage Base with Drawers | divan | 0 | 0 | 0 | 0 | 0 | 0 | – | 0.0% | – | 51 | 1 | 0.0% |
| 11 | Oxygen Luxury Bed | upholstered | 0 | 0 | 0 | 0 | 0 | 0 | – | 0.0% | – | 39 | 1 | 0.0% |
| 12 | Grand Princess Luxury Bed | upholstered | 0 | 0 | 0 | 0 | 0 | 0 | – | 0.0% | – | 30 | 0 | 0.0% |
| 13 | Line Bumper Ottoman Divan Bed | ottoman | 0 | 0 | 0 | 0 | 0 | 0 | – | 0.0% | – | 22 | 1 | 0.0% |
| 14 | Star Unique Bed | upholstered | 0 | 0 | 0 | 0 | 0 | 0 | – | 0.0% | – | 22 | 1 | 0.0% |
| 15 | Line Wingback Kids Bed | kids | 0 | 0 | 0 | 0 | 0 | 0 | – | 0.0% | – | 20 | 1 | 0.0% |
| 16 | Black Piping Art Deco Bed | upholstered | 0 | 0 | 0 | 0 | 0 | 0 | – | 0.0% | – | 19 | 0 | 0.0% |
| 17 | Liberty Wingback Bed | upholstered | 0 | 0 | 0 | 0 | 0 | 0 | – | 0.0% | – | 18 | 2 | 0.0% |
| 18 | Upholstered Ottoman Storage Box | accessories/other | 0 | 0 | 0 | 0 | 0 | 0 | – | 0.0% | – | 17 | 0 | 0.0% |
| 19 | Curved Wingback Bed | upholstered | 0 | 0 | 0 | 0 | 0 | 0 | – | 0.0% | – | 16 | 0 | 0.0% |
| 20 | Sunrise Luxury Bed | upholstered | 0 | 0 | 0 | 0 | 0 | 0 | – | 0.0% | – | 15 | 1 | 0.0% |

#### Last 180 (23 May 2026 – 19 Nov 2026, UK time)

Store (excl. cancelled): 40 orders, 41 units, gross £16,815.32, discounts £1,058.55, refunds £514.80, net £15,241.97, AOV £381.05; product landing sessions 6,048.

| # | Product | Cat | Orders | Units | Gross | Disc | Refunds | Net | ASP | Share of net | ASP/AOV | Landing sess. | Cart sess. | Orders ÷ landing |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Ottoman Gas Lift Divan Base | ottoman | 7 | 7 | £2,832.88 | £166.25 | £0.00 | £2,666.63 | £380.95 | 17.5% | 1.00x | 696 | 29 | 1.0% |
| 2 | Side Lift Ottoman Storage Base | ottoman | 7 | 7 | £2,004.92 | £172.94 | £0.00 | £1,831.98 | £261.71 | 12.0% | 0.69x | 327 | 23 | 2.1% |
| 3 | Mirror Strip Sunrise Bed | upholstered | 3 | 3 | £1,282.92 | £0.00 | £0.00 | £1,282.92 | £427.64 | 8.4% | 1.12x | 71 | 5 | 4.2% |
| 4 | Line Kids Velvet Bed | kids | 3 | 4 | £1,415.95 | £90.98 | £257.40 | £1,067.57 | £266.89 | 7.0% | 0.70x | 244 | 10 | 1.2% |
| 5 | Cloud Teddy Bouclé Ottoman Bed | ottoman | 2 | 2 | £1,085.97 | £108.58 | £0.00 | £977.39 | £488.70 | 6.4% | 1.28x | 137 | 16 | 1.5% |
| 6 | 3000 Pocket Sprung Mattress | mattresses | 3 | 3 | £932.05 | £28.59 | £0.00 | £903.46 | £301.15 | 5.9% | 0.79x | 17 | 1 | 17.6% |
| 7 | Eagle Savoy Channel Bed | upholstered | 1 | 1 | £914.97 | £91.49 | £0.00 | £823.48 | £823.48 | 5.4% | 2.16x | 36 | 8 | 2.8% |
| 8 | Royal Chesterfield Bed | upholstered | 1 | 1 | £699.95 | £69.99 | £0.00 | £629.96 | £629.96 | 4.1% | 1.65x | 64 | 11 | 1.6% |
| 9 | Regal Luxe Panel Bed | upholstered | 1 | 1 | £578.97 | £0.00 | £0.00 | £578.97 | £578.97 | 3.8% | 1.52x | 10 | 0 | 10.0% |
| 10 | Curved Wingback Bed | upholstered | 1 | 1 | £642.97 | £64.29 | £0.00 | £578.68 | £578.68 | 3.8% | 1.52x | 54 | 4 | 1.8% |
| 11 | Elegant Panel Bed | upholstered | 1 | 1 | £624.97 | £62.49 | £0.00 | £562.48 | £562.48 | 3.7% | 1.48x | 19 | 2 | 5.3% |
| 12 | Eagle Sunrise Fan Panel Bed | upholstered | 1 | 1 | £549.98 | £0.00 | £0.00 | £549.98 | £549.98 | 3.6% | 1.44x | 6 | 0 | 16.7% |
| 13 | Grand Extra-Tall Panel Bed | upholstered | 1 | 1 | £539.97 | £0.00 | £0.00 | £539.97 | £539.97 | 3.5% | 1.42x | 117 | 17 | 0.9% |
| 14 | Eagle Regal Gold-Trim Bed | upholstered | 1 | 1 | £559.97 | £55.99 | £0.00 | £503.98 | £503.98 | 3.3% | 1.32x | 36 | 1 | 2.8% |
| 15 | Line Ambassador Bed | upholstered | 1 | 1 | £419.98 | £41.99 | £0.00 | £377.99 | £377.99 | 2.5% | 0.99x | 679 | 28 | 0.1% |
| 16 | Hilton Wingback Bed | upholstered | 1 | 1 | £403.98 | £40.39 | £0.00 | £363.59 | £363.59 | 2.4% | 0.95x | 18 | 1 | 5.6% |
| 17 | Divan Storage Base with Drawers | divan | 1 | 1 | £359.98 | £0.00 | £0.00 | £359.98 | £359.98 | 2.4% | 0.94x | 170 | 3 | 0.6% |
| 18 | Cambridge Panel Storage Bed with Drawers | storage | 1 | 1 | £359.97 | £35.99 | £0.00 | £323.98 | £323.98 | 2.1% | 0.85x | 10 | 1 | 10.0% |
| 19 | Memory Orthopaedic Mattress | mattresses | 1 | 1 | £220.99 | £0.00 | £0.00 | £220.99 | £220.99 | 1.5% | 0.58x | 27 | 0 | 3.7% |
| 20 | Upholstered Ottoman Storage Box | accessories/other | 1 | 1 | £97.99 | £0.00 | £0.00 | £97.99 | £97.99 | 0.6% | 0.26x | 44 | 1 | 2.3% |

#### Lifetime (13 Jul 2026 – 19 Nov 2026, UK time)

Store (excl. cancelled): 40 orders, 41 units, gross £16,815.32, discounts £1,058.55, refunds £514.80, net £15,241.97, AOV £381.05; product landing sessions 6,026.

| # | Product | Cat | Orders | Units | Gross | Disc | Refunds | Net | ASP | Share of net | ASP/AOV | Landing sess. | Cart sess. | Orders ÷ landing |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Ottoman Gas Lift Divan Base | ottoman | 7 | 7 | £2,832.88 | £166.25 | £0.00 | £2,666.63 | £380.95 | 17.5% | 1.00x | 695 | 29 | 1.0% |
| 2 | Side Lift Ottoman Storage Base | ottoman | 7 | 7 | £2,004.92 | £172.94 | £0.00 | £1,831.98 | £261.71 | 12.0% | 0.69x | 325 | 23 | 2.1% |
| 3 | Mirror Strip Sunrise Bed | upholstered | 3 | 3 | £1,282.92 | £0.00 | £0.00 | £1,282.92 | £427.64 | 8.4% | 1.12x | 71 | 5 | 4.2% |
| 4 | Line Kids Velvet Bed | kids | 3 | 4 | £1,415.95 | £90.98 | £257.40 | £1,067.57 | £266.89 | 7.0% | 0.70x | 244 | 10 | 1.2% |
| 5 | Cloud Teddy Bouclé Ottoman Bed | ottoman | 2 | 2 | £1,085.97 | £108.58 | £0.00 | £977.39 | £488.70 | 6.4% | 1.28x | 136 | 16 | 1.5% |
| 6 | 3000 Pocket Sprung Mattress | mattresses | 3 | 3 | £932.05 | £28.59 | £0.00 | £903.46 | £301.15 | 5.9% | 0.79x | 17 | 1 | 17.6% |
| 7 | Eagle Savoy Channel Bed | upholstered | 1 | 1 | £914.97 | £91.49 | £0.00 | £823.48 | £823.48 | 5.4% | 2.16x | 36 | 8 | 2.8% |
| 8 | Royal Chesterfield Bed | upholstered | 1 | 1 | £699.95 | £69.99 | £0.00 | £629.96 | £629.96 | 4.1% | 1.65x | 64 | 11 | 1.6% |
| 9 | Regal Luxe Panel Bed | upholstered | 1 | 1 | £578.97 | £0.00 | £0.00 | £578.97 | £578.97 | 3.8% | 1.52x | 10 | 0 | 10.0% |
| 10 | Curved Wingback Bed | upholstered | 1 | 1 | £642.97 | £64.29 | £0.00 | £578.68 | £578.68 | 3.8% | 1.52x | 53 | 4 | 1.9% |
| 11 | Elegant Panel Bed | upholstered | 1 | 1 | £624.97 | £62.49 | £0.00 | £562.48 | £562.48 | 3.7% | 1.48x | 19 | 2 | 5.3% |
| 12 | Eagle Sunrise Fan Panel Bed | upholstered | 1 | 1 | £549.98 | £0.00 | £0.00 | £549.98 | £549.98 | 3.6% | 1.44x | 6 | 0 | 16.7% |
| 13 | Grand Extra-Tall Panel Bed | upholstered | 1 | 1 | £539.97 | £0.00 | £0.00 | £539.97 | £539.97 | 3.5% | 1.42x | 117 | 17 | 0.9% |
| 14 | Eagle Regal Gold-Trim Bed | upholstered | 1 | 1 | £559.97 | £55.99 | £0.00 | £503.98 | £503.98 | 3.3% | 1.32x | 36 | 1 | 2.8% |
| 15 | Line Ambassador Bed | upholstered | 1 | 1 | £419.98 | £41.99 | £0.00 | £377.99 | £377.99 | 2.5% | 0.99x | 678 | 28 | 0.1% |
| 16 | Hilton Wingback Bed | upholstered | 1 | 1 | £403.98 | £40.39 | £0.00 | £363.59 | £363.59 | 2.4% | 0.95x | 18 | 1 | 5.6% |
| 17 | Divan Storage Base with Drawers | divan | 1 | 1 | £359.98 | £0.00 | £0.00 | £359.98 | £359.98 | 2.4% | 0.94x | 170 | 3 | 0.6% |
| 18 | Cambridge Panel Storage Bed with Drawers | storage | 1 | 1 | £359.97 | £35.99 | £0.00 | £323.98 | £323.98 | 2.1% | 0.85x | 10 | 1 | 10.0% |
| 19 | Memory Orthopaedic Mattress | mattresses | 1 | 1 | £220.99 | £0.00 | £0.00 | £220.99 | £220.99 | 1.5% | 0.58x | 27 | 0 | 3.7% |
| 20 | Upholstered Ottoman Storage Box | accessories/other | 1 | 1 | £97.99 | £0.00 | £0.00 | £97.99 | £97.99 | 0.6% | 0.26x | 44 | 1 | 2.3% |

### 4.4 Reading the rankings (VERIFIED unless marked)

- **Best sellers:** Ottoman Gas Lift Divan Base (7 orders, £2,666.63 L90; 4 orders L30, +41%) and Side Lift Ottoman Storage Base (7 lifetime, 4 in L30). Their ASP is below the store AOV (0.82x and 0.63x in L30): they bring orders, not order size.
- **Order-size lifters:** Savoy (2.04x AOV), Royal Chesterfield (1.56x), Curved Wingback, Regal Luxe, Elegant Panel, Sunrise Fan, Grand Extra-Tall (1.3–1.4x). Each sold once; all high values come from paid options (storage base, mattress, assembly).
- **Last 7 days (13–19 Nov):** 4 orders, £2,178.82 net, AOV £544.71 (#1040 Cloud Teddy, #1041 Regal Gold-Trim, #1042 Curved Wingback, #1043 Grand Extra-Tall).
- **Traffic without sales, lifetime:** Line Ambassador 678 landings → 1 order; Line Bumper 0 orders; Mini Line Wingback Kids 0; Stone Premium 0; Grand Princess 0.
- Growth 90 vs prev 90 overstates momentum: the previous 90 days held only about 40 trading days (first order 13 Jul).

---

## Part 9. Category intelligence

### 9.1 Category table (VERIFIED; L = last, P = previous; landing figures human sessions)

| Category | Live (all) products | Sold any, L90 | Orders L90 | Units L90 | Net L90 | Net L30 | Net P30 | Growth 30 | Net lifetime | Landing sess. L90 | Landing cart sess. L90 | Landing completed L90 | Orders ÷ landing L90 | Unconverted carts L90 (cart sess. − completed) | Landing sess. L30 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| ottoman beds | 11 (19) | 3 | 15 | 15 | £5,247.40 | £3,457.52 | £991.58 | +249% | £5,476.00 | 1516 | 93 | 5 | 1.0% | 88 | 276 |
| divan beds/bases | 4 (5) | 1 | 1 | 1 | £359.98 | £0.00 | £0.00 | – | £359.98 | 215 | 3 | 0 | 0.5% | 3 | 8 |
| upholstered bed frames | 95 (158) | 11 | 11 | 11 | £5,938.07 | £3,076.07 | £1,141.45 | +169% | £6,792.00 | 2012 | 124 | 6 | 0.5% | 118 | 585 |
| storage beds (drawers) | 5 (22) | 1 | 1 | 1 | £323.98 | £323.98 | £0.00 | new | £323.98 | 60 | 5 | 0 | 1.7% | 5 | 15 |
| headboards | 17 (17) | 0 | 0 | 0 | £0.00 | £0.00 | £0.00 | – | £0.00 | 213 | 2 | 0 | 0.0% | 2 | 56 |
| mattresses | 6 (10) | 2 | 3 | 3 | £816.38 | £0.00 | £595.39 | -100% | £1,124.45 | 55 | 1 | 1 | 5.5% | 0 | 15 |
| kids beds | 6 (25) | 1 | 1 | 1 | £505.98 | £0.00 | £0.00 | – | £1,067.57 | 513 | 20 | 1 | 0.2% | 19 | 56 |
| accessories/other | 1 (1) | 1 | 1 | 1 | £97.99 | £0.00 | £97.99 | -100% | £97.99 | 27 | 1 | 1 | 3.7% | 0 | 1 |

"Live (all)": published products (all statuses in brackets). "Unconverted carts" = landing sessions with a cart addition that did not complete checkout (bots excluded; a session may hold several products, and a buyer may finish later in another session, so this is a pointer, not lost orders).

Collection landing pages (human, L90, VERIFIED): upholstered-beds 112 sessions / 5 cart / 0 completed; ottoman-beds 101 / 5 / 0; all 67 / 0 / 0; divan-beds 46 / 1 / 0; divan-ottoman-beds 27 / 3 / 0; mattresses 13 / 0 / 0; kids-beds 9 / 0 / 0; headboards 7 / 0 / 0. Total 420 collection landings, 0 completed checkouts.

### 9.2 Unconverted demand by landing product (products with 5+ landing cart sessions, L90)

| Landing product | Category | L90 landing sess. | L90 cart sess. | L90 checkout sess. | L90 completed | Unconverted cart sess. L90 | Product orders L90 (any landing) | L30 landing / cart / orders |
|---|---|---|---|---|---|---|---|---|
| Line Bumper Ottoman Divan Bed | ottoman beds | 441 | 28 | 2 | 0 | 28 | 0 | 82 / 13 / 0 |
| Line Ambassador Bed | upholstered bed frames | 374 | 26 | 2 | 0 | 26 | 1 | 90 / 12 / 0 |
| Ottoman Gas Lift Divan Base | ottoman beds | 606 | 27 | 3 | 2 | 25 | 7 | 81 / 5 / 4 |
| Grand Extra-Tall Panel Bed | upholstered bed frames | 117 | 17 | 2 | 0 | 17 | 1 | 113 / 16 / 1 |
| Side Lift Ottoman Storage Base | ottoman beds | 276 | 19 | 6 | 3 | 16 | 6 | 65 / 7 / 4 |
| Cloud Teddy Bouclé Ottoman Bed | ottoman beds | 124 | 16 | 5 | 0 | 16 | 2 | 26 / 8 / 2 |
| Royal Chesterfield Bed | upholstered bed frames | 64 | 11 | 3 | 1 | 10 | 1 | 60 / 11 / 1 |
| Mini Line Wingback Kids Bed | kids beds | 248 | 10 | 0 | 0 | 10 | 0 | 21 / 2 / 0 |
| Mini Line Wingback Bed | upholstered bed frames | 55 | 7 | 2 | 0 | 7 | 0 | 16 / 4 / 0 |
| Line Kids Velvet Bed | kids beds | 205 | 8 | 0 | 1 | 7 | 1 | 32 / 5 / 0 |
| Eagle Savoy Channel Bed | upholstered bed frames | 36 | 8 | 9 | 1 | 7 | 1 | 20 / 6 / 1 |

Cloud Teddy and Savoy show more checkout sessions than completions: buyers come back several times before paying (Stage 3 inv-4, inv-5).

### 9.3 Insufficient traffic (published products, L90)

| Category | Published products with landing data | of which < 30 landing sessions in 90 days |
|---|---|---|
| upholstered bed frames | 92 | 75 |
| mattresses | 6 | 6 |
| ottoman beds | 11 | 7 |
| kids beds | 6 | 4 |
| accessories/other | 1 | 1 |
| storage beds (drawers) | 4 | 4 |
| divan beds/bases | 4 | 2 |
| headboards | 17 | 15 |

4 published products have no landing session and no sale at all since 23 May. With under 30 landing sessions in 90 days, a product's conversion cannot be judged: 114 of 141 published products with data are in that state, including all 6 mattresses, all 4 storage beds and 15 of 17 headboards. RECOMMENDATION: judge these by category, not one by one.

### 9.4 Category readings

| Category | Reading | Label |
|---|---|---|
| Ottoman beds | 45% of L90 orders (15 of 33), growing fastest (+249% L30). Sales come from the two bases; full ottoman beds with headboards (Line Bumper, Cloud Teddy) gather carts but convert weakly (price truth, E25) | VERIFIED / HYPOTHESIS for cause |
| Upholstered bed frames | Highest revenue (£5,938.07 L90, 45%), 11 different frames sold once each; 75 of 92 frames under 30 landings | VERIFIED |
| Divan beds/bases | 1 order ever (#1008, VO, with drawers and mattress) | VERIFIED |
| Storage beds (drawers) | 1 order (#1031 Cambridge, L30); 17 of 22 unpublished | VERIFIED |
| Headboards | 0 orders ever, 2 cart sessions in 90 days | VERIFIED |
| Mattresses | 4 standalone orders lifetime (one TEMU), 0 since 6 Oct; but 9 bed orders added a mattress option | VERIFIED |
| Kids beds | 3 orders lifetime (one refunded), 0 since 15 Sep despite 513 landing sessions in L90 | VERIFIED |

### 9.5 Mattress attachment (order-line data only)

Rule: a bed order "includes a mattress" if it has a separate mattress product line, **or** an Easify/VO mattress option other than "No"/"No Mattress". "Recorded" = the order carries any mattress choice (some pages, e.g. Cloud Teddy and the early Side Lift orders, had no mattress option, so nothing was recorded).

| Window / group | Bed orders | With mattress | Attachment (all bed orders) | Orders where a mattress choice was recorded | Attachment (where recorded) | Mattress option value (gross, from property prices) |
|---|---|---|---|---|---|---|
| last 30 | 16 | 4 | 25.0% | 12 | 33.3% | £679.96 |
| prev 30 | 4 | 2 | 50.0% | 3 | 66.7% | £549.98 |
| last 90 | 29 | 9 | 31.0% | 23 | 39.1% | £1,629.93 |
| lifetime | 35 | 9 | 25.7% | 29 | 31.0% | £1,629.93 |
| lifetime – ottoman beds | 16 | 3 | 18.8% | 11 | 27.3% | £599.97 |
| lifetime – upholstered bed frames | 14 | 4 | 28.6% | 13 | 30.8% | £829.96 |
| lifetime – divan beds/bases | 1 | 1 | 100.0% | 1 | 100.0% | £75.00 |
| lifetime – storage beds (drawers) | 1 | 0 | 0.0% | 1 | 0.0% | £0.00 |
| lifetime – kids beds | 3 | 1 | 33.3% | 3 | 33.3% | £125.00 |

| Order | Date | Bed | Category | Mattress | Mattress option price |
|---|---|---|---|---|---|
| #1008 | 2026-08-24 | Divan Storage Base with Drawers | divan beds/bases | yes | £75.00 |
| #1018 | 2026-09-15 | Line Kids Velvet Bed | kids beds | yes | £125.00 |
| #1019 | 2026-09-18 | Eagle Sunrise Fan Panel Bed | upholstered bed frames | yes | £199.99 |
| #1025 | 2026-10-08 | Elegant Panel Bed | upholstered bed frames | yes | £249.99 |
| #1027 | 2026-10-14 | Ottoman Gas Lift Divan Base | ottoman beds | yes | £299.99 |
| #1028 | 2026-10-24 | Ottoman Gas Lift Divan Base | ottoman beds | yes | £99.99 |
| #1033 | 2026-11-03 | Ottoman Gas Lift Divan Base | ottoman beds | yes | £199.99 |
| #1034 | 2026-11-06 | Eagle Savoy Channel Bed | upholstered bed frames | yes | £279.99 |
| #1036 | 2026-11-07 | Royal Chesterfield Bed | upholstered bed frames | yes | £99.99 |

Readings:
- Separate mattress + bed in one order: **0 of 40** orders. All attachment is through the option.
- The option is worth about £181 on average (gross, before EAGLE10): Pillow Top £249.99–£279.99, 1000/2000 Pocket £199.99, 3000 Pocket £299.99, Memory £99.99. These prices are the Easify option prices on the order, not the standalone mattress product prices.
- Mattress option buyers chose 5 different mattress types; the cheap Memory option (£99.99) was picked twice.
- Mattress size is not tied to bed size (E28); in the 9 orders the chosen mattress size matches the bed size in every case where both are readable (VERIFIED by reading the properties).

### 9.6 Option mix (non-cancelled orders; L90 and lifetime)


**Size mix (bed orders, units = orders here)**

| Value | last_90 | lifetime |
|---|---|---|
| King (5ft) | 10 (34%) | 10 (29%) |
| Double (4ft6) | 8 (28%) | 9 (26%) |
| Small Double (4ft) | 7 (24%) | 8 (23%) |
| Super King (6ft) | 4 (14%) | 4 (11%) |
| Single (3ft) | 0 (0%) | 3 (9%) |
| Kids Single (2ft6) | 0 (0%) | 1 (3%) |

**Fabric family (bed orders)**

| Value | last_90 | lifetime |
|---|---|---|
| Plush Velvet | 15 (52%) | 21 (60%) |
| Naples | 6 (21%) | 6 (17%) |
| Conniston | 5 (17%) | 5 (14%) |
| Teddy Boucle | 3 (10%) | 3 (9%) |

**Base type / storage choice (bed orders; the two ottoman bases are themselves the storage)**

| Value | last_90 | lifetime |
|---|---|---|
| (not recorded / option not on page) | 10 (34%) | 11 (31%) |
| Slatted base (included) | 5 (17%) | 9 (26%) |
| Divan ottoman, side opening | 4 (14%) | 4 (11%) |
| Mesh metal ottoman | 4 (14%) | 4 (11%) |
| Board base | 2 (7%) | 3 (9%) |
| Divan ottoman, end lift | 2 (7%) | 2 (6%) |
| Drawers | 1 (3%) | 1 (3%) |
| Metal ottoman | 1 (3%) | 1 (3%) |

**Delivery / assembly choice (all orders)**

| Value | last_90 | lifetime |
|---|---|---|
| Downstairs Drop Off (free) | 22 (67%) | 26 (65%) |
| Room of Choice Assembly | 5 (15%) | 7 (18%) |
| (not recorded / option not on page) | 4 (12%) | 5 (12%) |
| Room of Choice Drop Off | 2 (6%) | 2 (5%) |

**Headboard height (bed orders with a headboard)**

| Value | last_90 | lifetime |
|---|---|---|
| 54" | 5 (33%) | 10 (50%) |
| 50" (standard) | 5 (33%) | 5 (25%) |
| 60" | 3 (20%) | 3 (15%) |
| (not recorded / option not on page) | 1 (7%) | 1 (5%) |
| 50" floor standing | 1 (7%) | 1 (5%) |

**Drawer add-on (old VO option)**

| Value | last_90 | lifetime |
|---|---|---|
| (not recorded / option not on page) | 25 (86%) | 26 (74%) |
| NO | 3 (10%) | 6 (17%) |
| 2 DRAWERS FOOTEND – £49.99 | 0 (0%) | 2 (6%) |
| 4 DRAWERS – £89.99 | 1 (3%) | 1 (3%) |

Notes: "Base type" is blank for the two ottoman bases, which are themselves the storage. 13 of 35 bed orders paid for a storage or board base upgrade (average +£109.22). Delivery choice: 2 in 3 orders take the free downstairs drop-off; 7 paid for assembly, all at the old £49.99 price.

---

## Part 14. Bundling from real orders

All figures: non-cancelled orders, lifetime (13 Jul–19 Nov), 35 bed orders. "Added revenue" is the option price written on the order (gross, before EAGLE10). VERIFIED unless marked. Margins UNKNOWN.

| Pair | Orders | Share of bed orders | Added revenue per order | Avg order gross with vs without | Orders |
|---|---|---|---|---|---|
| Bed + mattress (any) | 9 | 26% | £181.10 | £580.97 vs £397.52 | #1008, #1018, #1019, #1025, #1027, #1028, #1033, #1034, #1036 |
| Ottoman + mattress | 3 of 16 ottoman orders | 19% | £199.99 | £524.31 vs £437.23 | #1027, #1028, #1033 (all Ottoman Gas Lift Divan Base) |
| Bed frame + mattress | 4 of 14 frame orders | 29% | £207.49 | £697.47 vs £412.08 | #1019, #1025, #1034, #1036 |
| Divan + mattress | 1 of 1 | – | £75.00 | – | #1008 (VO era) |
| Bed + storage/board base upgrade | 13 | 37% | £109.22 | £542.66 vs £386.80 | #1002, #1005, #1008, #1016, #1018, #1026, #1031, #1034, #1036, #1040, #1041, #1042, #1043 |
| Bed + Room of Choice Assembly | 7 | 20% | £49.99 (old price) | £533.68 vs £422.45 | #1002, #1005, #1025, #1026, #1036, #1037, #1042 |
| Bed + Room of Choice Drop Off | 2 | 6% | £29.99 | – | #1028, #1039 |
| Bed + taller headboard (60" or floor standing) | 4 | 11% | £34.99 | – | #1013, #1031, #1036, #1043 |
| Bed + separate headboard product | 0 | 0% | – | – | never happened |
| Mattress + accessories | 0 | – | – | – | 4 mattress-only orders (#1003 TEMU, #1011, #1023, #1024), none with anything else; no accessory products exist except the storage box |

Bundle proposals (RECOMMENDATION only; no discounts proposed or invented; owner decides; margins UNKNOWN until C1–C4 exist):

| Proposal | Evidence | Customer benefit | Operational notes |
|---|---|---|---|
| "Ottoman bed, ready to sleep": ottoman base + matching-size mattress shown as one configured choice | 3 of 16 ottoman orders already add a mattress; the bases are the best sellers | One delivery, one decision, mattress fits the base | Needs Easify mattress size tied to bed size (E28) first; mattress make/buy cost C2 UNKNOWN |
| "Complete bed" on frames: frame + storage base + mattress shown as a priced set (no discount) | Savoy (#1034) and Royal Chesterfield (#1036) bought all three; frames with a mattress average £697 gross | The real total is visible on the page (fixes E25/E26 too) | Pure display/option-default change; check stock-free make times |
| Assembly suggested next to the delivery choice at £69.99 | 7 of 35 bed orders (20%) paid for assembly at £49.99 | Clear, optional, never free (BRIEF) | Assembly labour cost C4 UNKNOWN; measure uptake after the price rise |
| Do **not** build bed + headboard or mattress + accessory bundles yet | 0 orders ever | – | Not enough demand to test |

---

## Limitations

- 40 valid orders in 4 months: one order moves any product figure. Most products sold once.
- Landing-session cart and checkout counts are session-level, not product-level; product orders can come from any landing page.
- Human/bot classification is Shopify's and changes after the fact (L90 product landings 4,613 today vs 4,608 in Stage 2).
- Option revenue is parsed from the text of the order properties; a value without a "£" price counts as £0.
- VO "Selections" lines have no product id; they were tied to the bed line of the same draft order. #1014's bed line also has no product id (deleted variant); it is cancelled and excluded.
- Variant ids are missing on #1004 and #1009 (deleted colour variants of Side Lift); the product id is present.
- Profit, margin, lead time, stock and supplier: UNKNOWN (no data in any system). Nothing here is a cost or margin estimate.
- Post-publication effect of the 19 Nov theme cannot be measured yet (from 20 Nov).

## Credits used

OpenRush: **0** (none needed). Shopify: 12 GraphQL queries, 2 schema lookups and 3 ShopifyQL queries (no Shopify credit cost). No writes anywhere except the files listed above.
