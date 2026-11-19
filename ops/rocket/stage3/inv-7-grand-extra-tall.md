# Investigation 7: Grand Extra-Tall Panel Bed (19 Nov 2026)

Handle: `grand-extra-high-vertical-panel-upholstered-bed-frame` · product 15948341281099 · type Bed Frame · ACTIVE
Method as in report 1. Baseline from `ops/rocket/stage2/product-intel.json`.

## 1. Baseline

| Window | Landing sessions | Carts | Checkout | Completed on landing | Orders |
|---|---|---|---|---|---|
| 90 days | 116 | 17 | 2 | 0 | 1 (#1043, King, £539.97, 18 Nov, no discount; came after a swatch request on 12 Nov) |
| Last 30 days | 112 | 16 | 1 | 0 | – |

VERIFIED. Top product landing page of the last 30 days.

## 2. Traffic (human, 90 days)

| Source | Sessions | Carts | Checkout |
|---|---|---|---|
| google / cpc / pmax_all_products | **105** | 15 | 1 |
| (no UTM) | 9 | 2 | 1 |
| Google Shopping 1 · sag_organic 1 | 2 | 0 | 0 |

By month: Oct 16, **Nov 100**. 106 of 116 UK mobile. VERIFIED.
Reading: PMax found this bed in November and visitors like it (14% cart rate), but **15 PMax carts led to 1 checkout**. This is the clearest basket-to-checkout leak of the 7. VERIFIED (data), cause HYPOTHESIS.

## 3. Product facts

Sizes: Single 3FT £312.99 · Small Double 4FT £324.99 · Standard Double 4FT6 £338.99 · King 5FT £349.99 · Super King 6FT £389.99, all available. **No SKUs on any variant** (only bed of the 7 without). VERIFIED.
Easify: the common set. **Headboard Height offers the same Standard 50" / 54" / 60" as every other bed, with Standard 50" first.** The page never says how tall the "extra-tall" headboard is. VERIFIED.
Description: "Solid timber frame with a slatted base"; "Optional ottoman gas-lift storage… Call 07417 439197 to confirm", while Base Type already sells it. Fabrics named: Plush Velvet, Naples, Chenille, Linen, Crushed Velvet (3 not offered). VERIFIED.

## 4. Headline vs basket (iPhone 13, VERIFIED)

| Basket | Configuration | Total | vs headline |
|---|---|---|---|
| A | Std Double 4FT6, Plush Velvet Grey, 50", Metal Ottoman, no mattress, Downstairs | **£458.98** | +£119.99 on £338.99 |
| A0 (arithmetic) | Std Double, slatted | £338.99 | matches |
| B | King 5FT, Teddy Latte, 54", Divan Ottoman Footend Lift, 1000 Pocket 5ft, Assembly | **£809.96** | +£459.97 on £349.99 (+131%) |

The real order #1043 (King) was £539.97 = £349.99 + £189.99 base, a buyer who chose an ottoman base. ESTIMATE (arithmetic; option lines not re-read).
This is the cheapest bed of the 7, so add-ons more than double its price in basket B.

## 5. Page checks

| Check | Result | Label |
|---|---|---|
| Images | 9 product photos at 2000 px + swatch chart + fabric guide | VERIFIED (good) |
| Description | 382 words; no dimensions; no headboard height | VERIFIED |
| Title / layout | White H1; sandbox 972 px | VERIFIED / UNVERIFIED |
| Price with add-ons | Does not move | VERIFIED |
| Basket / checkout | Clear, totals match, checkout reached | VERIFIED |
| Reviews | 0 / 1 | VERIFIED |

## 6. Why buyers may not complete

| # | Reason | Label |
|---|---|---|
| 1 | **Sticker shock in the basket**: from £312.99 in the ad to £459–£810 in the basket; the page price never shows the add-ons | VERIFIED (mechanism) / HYPOTHESIS (cause of 15→1) |
| 2 | "Extra-tall" with no height given, and a 50" default that is the same as other beds: buyers may doubt what they get | VERIFIED / HYPOTHESIS |
| 3 | Buyers want to see the colour first: the one sale came after swatches | VERIFIED (1 case) / HYPOTHESIS |
| 4 | FAQ asks buyers to phone about storage already on the page | VERIFIED / HYPOTHESIS |
| 5 | Payment surprise at checkout (Clearpay) | HYPOTHESIS |
| 6 | Missing SKUs may affect feed/stock reporting (not the buyer) | VERIFIED / UNKNOWN impact |

## 7. Fixes (owner approval needed)

1. **RECOMMENDATION: state the headboard height in cm** for each option and make the extra-tall height the default if that is what the photos show (owner supplies sizes).
2. **RECOMMENDATION: running total** next to the price and in the sticky bar (Stage 1 #6), so the basket matches what was seen.
3. **RECOMMENDATION: swatch call-to-action near Add to basket** ("Free fabric swatches – see the colour first"), since the only sale came via swatches.
4. **RECOMMENDATION: rewrite the storage FAQ and fabric list** to match Base Type and the 5 fabrics.
5. **RECOMMENDATION: add SKUs** (e.g. EB-GRAND-3FT…) for feed and stock reporting.

**Test method.** This bed has the most PMax traffic, so it is the best place for a timed before/after: 3 weeks before vs 3 weeks after the running-total + height change, PMax budget fixed. Success = PMax cart→checkout from 1/15 to 4+/15. Track swatch requests naming this bed in HQ.

## Limitations
Same as report 1. The option lines of order #1043 were not re-read.

## Credits used
OpenRush 0. ShopifyQL shared.
