# Investigation 2: Line Ambassador Bed (19 Nov 2026)

Handle: `line-ambassador-upholstered-bed-frame` · product 15524048830795 · type Bed Frame · ACTIVE
Method as in report 1 (iPhone 13 Playwright, 2 baskets to checkout page, `.js`, ShopifyQL). Common findings: `03-product-investigations.md` §3.

## 1. Baseline

| Window | Landing sessions | Carts | Checkout | Completed | Orders |
|---|---|---|---|---|---|
| 90 days | 374 | 26 | 2 | 0 | 1 (Std Double, White, £351.00 net, 8 Sep) |
| Last 30 days | 90 | 12 | 1 | 0 | 0 |

VERIFIED (session-level).

## 2. Traffic (human, 90 days)

| Source | Sessions | Carts | Checkout | Done |
|---|---|---|---|---|
| google / product_sync / sag_organic | **212** | 8 | 0 | 0 |
| google / cpc / pmax_all_products | 129 | 14 | 2 | 0 |
| (no UTM) | 17 | 2 | 0 | 0 |
| chatgpt.com | 10 | 1 | 0 | 0 |
| shopping_uk 4 · Pinterest organic 4 · Google Shopping 1 · shop_app 1 | 10 | 1 | 0 | 0 |

By month: Aug 68, Sep 151, Oct 105, Nov 54 (11 carts). Last 30 days PMax: 79 sessions, 10 carts, 1 checkout. 324 of 374 UK mobile. VERIFIED.
ESTIMATE: as with Line Bumper, the older volume is product-feed traffic; today it is mainly PMax with a 13% cart rate and almost no checkouts.

## 3. Product facts

| Size | Price | Available |
|---|---|---|
| Single (3FT) | £337.99 | yes |
| Small Double (4FT) | £376.99 | yes |
| Standard Double (4FT6) | £389.99 | yes |
| King (5FT) | £428.99 | yes |
| Super-King (6FT) | £506.99 | yes |

VERIFIED: **two Shopify options, Size × Colour** (Cream, Silver, Grey, Steel, Beige, Red, Green, White, Black, Blue, Pink, Brown) = 60 variants, all available, price depends on size only. **Cream is pre-selected.**
Easify options: the same set as every bed (Fabric Type 5 fabrics, then a second "Fabric Type" group with 9–15 colours, Headboard Height, optional Base Type, Mattress, Delivery Service). VERIFIED.

## 4. Headline vs basket (iPhone 13, VERIFIED)

| Basket | Configuration | Total (basket = checkout) | vs headline |
|---|---|---|---|
| A | Std Double, Shopify colour Grey, Plush Velvet Grey, 50", Metal Ottoman, no mattress, Downstairs | **£509.98** | +£119.99 on £389.99 |
| A0 (arithmetic) | Same with Slatted Base (a typical frame buyer) | £389.99 | matches headline |
| B | King, Shopify colour **Grey**, Teddy Boucle **Latte**, 54", Divan Ottoman Footend Lift, 1000 Pocket 5ft, Assembly | **£888.96** | +£459.97 on £428.99 |

Basket B's order line reads **"King (5FT) / Grey"** and also **"Teddy Boucle Colors: Latte"**. Two different colours on one order. VERIFIED (`shots/inv-line-ambassador-B-cart.jpg`).
For a frame buyer the headline price is honest when they take the slatted base and no mattress.

## 5. Page checks

| Check | Result | Label |
|---|---|---|
| **Two colour pickers** | Shopify "Colour" (12 pills, Cream pre-selected) and Easify fabric colour (55 colourways). Their lists do not match: Shopify offers Red, Green, Brown, Steel, Beige; Plush Velvet offers Claret, Emerald, Mocca, Mustard, Duck Egg etc. A buyer who only uses the Easify picker still orders "/ Cream" | VERIFIED |
| Colour photos | 12 colour renders (Red, Green, Brown…) tied to the Shopify colour, which may not exist as a fabric | VERIFIED (mismatch) / UNKNOWN (what the workshop makes) |
| Title | H1 white on white | VERIFIED (style) |
| Layout | Widest of the 7 in the sandbox: 1,757 px on 390 px (columns inherit the width; the photo is 1,508 px wide) | UNVERIFIED (sandbox; must be checked on a real phone first for this product) |
| Images | 19 product images + fabric guide. 5 at only 679×679 px; others 1024 px | VERIFIED |
| Description | 581 words, no dimensions, no headboard height in cm. Says "12 colours" and lists Chenille/Coniston fabrics not offered as options. Mattress not included only implied | VERIFIED |
| Cross-link | "Royal Chesterfield Wingback Bed (from £324.99)" price not checked | UNKNOWN |
| Price with add-ons | Main price does not move with add-ons | VERIFIED |
| Delivery / assembly | Correct, assembly £69.99 clearly priced | VERIFIED |
| Reviews | 0 product, 1 store | VERIFIED |
| Basket / checkout | Options and prices shown; checkout reached; totals match | VERIFIED |
| JS errors | Third-party blocked hosts only | VERIFIED (sandbox) |

## 6. Why buyers may not complete

| # | Reason | Label |
|---|---|---|
| 1 | **Double colour choice**: two pickers, two different colour lists, one pre-selected. Buyers may not know which colour they will get, or think they must pick twice | VERIFIED (mechanism) / HYPOTHESIS (impact) |
| 2 | Photos in colours (Red, Green, Brown) that are not in the fabric list | VERIFIED / HYPOTHESIS |
| 3 | Sandbox overflow is far worse here than on other beds; if any real phones reproduce it, this page breaks first | UNVERIFIED |
| 4 | Basket total rises with base/mattress/assembly without the page price moving (sticker shock at the basket) | VERIFIED (mechanism) / HYPOTHESIS |
| 5 | No dimensions or headboard height in cm for a bed sold on its "tall headboard" | VERIFIED / HYPOTHESIS |
| 6 | No reviews | VERIFIED / HYPOTHESIS |
| 7 | Low-res images (679 px) look soft on phones | VERIFIED (size) / HYPOTHESIS |

## 7. Fixes (owner approval needed)

1. **RECOMMENDATION: one colour picker.** Remove the Shopify Colour option (keep Size only, as on the other beds) or remove the Easify colour group for this product. Keep the colour photos only if each colour maps to a real fabric.
2. **RECOMMENDATION: test this page on the owner's iPhone first** (sideways scroll? photo cut?), because the sandbox width here is 4× the screen.
3. **RECOMMENDATION: running total** next to the price (Stage 1 #6).
4. **RECOMMENDATION: dimensions block** with headboard height in cm for 50"/54"/60", and "Mattress not included unless you add one."
5. **RECOMMENDATION: replace the five 679 px photos** with 1500 px+ versions and align the fabric copy with the options.

**Test method.** Before/after 4 weeks on the ShopifyQL landing funnel for this path (as in report 1). Success = cart→checkout from about 1 in 10 to 3 in 10 at the same PMax budget. Verify in Playwright that a basket has one colour only and the shown total equals the basket.

## Limitations
Same as report 1. The colour actually built when two colours are given is UNKNOWN (ask the workshop how the 8 Sep order, Std Double "White", was read and which fabric was used).

## Credits used
OpenRush 0. ShopifyQL shared (4 queries across all 7).
