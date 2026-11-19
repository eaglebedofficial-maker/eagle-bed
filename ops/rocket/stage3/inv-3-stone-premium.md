# Investigation 3: Stone Premium Bed (19 Nov 2026)

Handle: `stone-upholstered-bed-frame` · product 15524051091787 · type Bed Frame · ACTIVE
Method as in report 1. Common findings: `03-product-investigations.md` §3.

## 1. Baseline

| Window | Landing sessions | Carts | Checkout | Completed | Orders |
|---|---|---|---|---|---|
| 90 days | 270 | **2** (brief said 0; product-intel.json and ShopifyQL say 2) | 1 | 0 | 0 |
| Last 30 days | 6 | 2 | 1 | 0 | 0 |

VERIFIED.

## 2. Traffic (human, 90 days)

| Source | Sessions | Carts |
|---|---|---|
| google / product_sync / sag_organic | **228** | 0 |
| google / cpc / shopping_uk | 17 | 1 |
| (no UTM) | 16 | 0 |
| google / cpc / pmax_all_products | 9 | 1 (reached checkout) |

By month: Aug 36, **Sep 196**, Oct 36, **Nov 2**. Non-UK sessions: 17 (US 8, others). VERIFIED.
**Reading (ESTIMATE):** Stone's 270 sessions are almost all the September product-feed burst (Stage 1 found that tag likely covered paid PMax/Shopping clicks before 28 Sep). That traffic added nothing to basket. In the last 30 days Stone gets about 6 landings, so **Stone has no live traffic problem to fix; it has a "no demand at this price" signal from a cheap-click burst**. It is the most expensive of the 7 beds.

## 3. Product facts

| Size | Price | Available |
|---|---|---|
| Single (3FT) | £467.99 | yes |
| Small Double (4FT) | £545.99 | yes |
| Standard Double (4FT6) | £558.99 | yes |
| King (5FT) | £597.99 | yes |
| Super-King (6FT) | £649.99 | yes |

VERIFIED. Easify: same common set plus **Strip Colour (required)**: Golden Strip **+£19.99**, Silver Strip £0. **Base Type is required** here (slatted £0). The strip swatches are images only; the £19.99 is not printed on the swatch (unlike the base prices). VERIFIED (`shots/inv-stone-upholstered-A-options.jpg`).

## 4. Headline vs basket (iPhone 13, VERIFIED)

| Basket | Configuration | Total | vs headline |
|---|---|---|---|
| A | Std Double, Plush Velvet Grey, 50", **Golden Strip**, Metal Ottoman, no mattress, Downstairs | **£698.97** | +£139.98 on £558.99 |
| A0 (arithmetic) | Std Double, Golden Strip (as photographed), slatted | £578.98 | +£19.99 |
| Minimum | Single, Silver Strip, slatted, required fields only | £467.99 | matches |
| B | King, Teddy Latte, 54", Golden Strip, Divan Ottoman Footend Lift, 1000 Pocket 5ft, Assembly | **£1,077.95** | +£479.96 on £597.99 |

**The hero photo shows gold strips** (`shots/inv-stone-upholstered-mobile-fold.jpg`). The bed as pictured costs £19.99 more than the price shown, and the surcharge is visible only in the "additional charge" line and in the basket. VERIFIED.

## 5. Page checks

| Check | Result | Label |
|---|---|---|
| Images | Only 5 product photos + fabric guide. Three are WhatsApp images (994–1020 px), one is a **448×501 screenshot**. Lowest image quality of the 7 | VERIFIED |
| Photo vs description | Photo shows a matching footboard; description never mentions a footboard | VERIFIED / UNKNOWN (is a footboard included?) |
| Description | 553 words; no dimensions; tags include "beds near me uk", "made in yorkshire", "teddy boucle bed" (tag hygiene only) | VERIFIED |
| Title / layout | White H1; sandbox 540 px wide | VERIFIED (style) / UNVERIFIED (layout) |
| Price with add-ons | Does not move | VERIFIED |
| Delivery / assembly | Correct | VERIFIED |
| Reviews | 0 / 1 | VERIFIED |
| Basket / checkout | Shows "Strip Colour: Golden Strip (£19.99 GBP)"; checkout reached; totals match | VERIFIED |

## 6. Why buyers may not complete

| # | Reason | Label |
|---|---|---|
| 1 | Traffic was cheap feed clicks in one month; little real demand tested since | ESTIMATE (from VERIFIED data) |
| 2 | Highest price of the 7 (Double £558.99 frame only) with the weakest photos (WhatsApp/screenshot) | VERIFIED (facts) / HYPOTHESIS (cause) |
| 3 | Pictured gold strip is a hidden +£19.99 required choice | VERIFIED / HYPOTHESIS |
| 4 | Footboard unclear | HYPOTHESIS |
| 5 | No dimensions, no reviews | VERIFIED / HYPOTHESIS |

## 7. Fixes (owner approval needed)

1. **RECOMMENDATION: new photography** (or proper studio renders) at 1500 px+, replacing the WhatsApp images and the 448 px screenshot, before spending any ad money on this bed.
2. **RECOMMENDATION: show the strip surcharge on the swatch** ("Golden Strip +£19.99") or make the pictured gold version the base price. Owner decides price.
3. **RECOMMENDATION: state whether the footboard is included** and add dimensions.
4. **RECOMMENDATION: decide whether to advertise Stone at all.** With 6 landings a month, keep it out of PMax asset focus until photos are fixed (Ads owner decision; no spend change made).
5. **RECOMMENDATION: tidy tags** ("beds near me uk", "teddy boucle bed") so the feed and search show the right bed.

**Test method.** No meaningful test at 6 sessions a month. After new photos, give it a fixed, small test window in PMax (owner-approved) and read landing cart rate after 100 landings; success = cart rate ≥ 8% (store PDP average is about 12%).

## Limitations
Same as report 1. Whether Golden Strip is the more common choice is UNKNOWN (no orders).

## Credits used
OpenRush 0. ShopifyQL shared.
