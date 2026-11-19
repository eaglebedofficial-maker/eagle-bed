# Investigation 6: Royal Chesterfield Bed (19 Nov 2026)

Handle: `royal-chesterfield-upholstered-bed` · product 15948324307275 · type Bed Frame · ACTIVE
(Not to be confused with `royal-chesterfield-wingback-bed-frame`, a different product: 61 landings, 1 cart, 0 sales.)
Method as in report 1. Baseline from `ops/rocket/stage2/product-intel.json`.

## 1. Baseline

| Window | Landing sessions | Carts | Checkout | Completed | Orders |
|---|---|---|---|---|---|
| 90 days | 64 | 11 | 3 | 1 | 1 (#1036, Std Double, £629.96 net, from ChatGPT) |
| Last 30 days | 60 | 11 | 3 | 1 | – |

VERIFIED. Almost all traffic is from the last 30 days.

## 2. Traffic (human, 90 days)

| Source | Sessions | Carts | Checkout | Done |
|---|---|---|---|---|
| google / cpc / pmax_all_products | 34 | 6 | 1 | 0 |
| chatgpt.com | 16 | 3 | 2 | **1** |
| (no UTM) | 13 | 1 | 0 | 0 |
| sag_organic | 1 | 1 | 0 | 0 |

VERIFIED. ChatGPT visitors convert best here.

## 3. Product facts

| Size | Price |
|---|---|
| Single | £364.99 |
| Small Double | £374.99 |
| Standard Double | £389.99 |
| King | £399.99 |
| **Super King** | **£389.99 – cheaper than King** |

VERIFIED (`.js` and the description both say £389.99). All available. Very small steps between sizes (£10–£15). Whether the Super King price is an error: UNKNOWN (owner).
Easify: common set plus **Button Type (required)**: Matching Fabric Button £0, **Diamond Button +£19.99** (price not printed on the image swatch). **Base Type is required** (slatted £0). VERIFIED.
Description: "value Chesterfield option"; fabrics "Plush Velvet, Naples, Chenille, Linen or Crushed Velvet" – options are Plush Velvet, Naples, Galaxy, Conniston, Teddy Boucle (3 named fabrics not offered, 3 offered fabrics not named). FAQ says "Contact us to confirm" ottoman storage, while the page already sells it under Base Type. VERIFIED.

## 4. Headline vs basket (iPhone 13, VERIFIED)

| Basket | Configuration | Total | vs headline |
|---|---|---|---|
| A | Std Double, Plush Velvet Grey, 50", Matching Button, Metal Ottoman, no mattress, Downstairs | **£509.98** | +£119.99 |
| A0 (arithmetic) | Std Double, matching button, slatted | £389.99 | matches |
| Diamond button check | Single, Diamond Button, slatted | £384.98 | +£19.99 (VERIFIED basket) |
| B | King, Teddy Latte, 54", Matching Button, Divan Ottoman Footend Lift, 1000 Pocket 5ft, Assembly | **£859.96** | +£459.97 |

The real order #1036 was £699.95 gross for a Std Double, i.e. the buyer added about £310 of options. VERIFIED (Stage 1 data).

## 5. Page checks

| Check | Result | Label |
|---|---|---|
| Images | 10 product photos at 2000 px + swatch chart + fabric guide | VERIFIED (good) |
| Description | 408 words; no dimensions; footboard mentioned | VERIFIED |
| Title / layout | White H1; sandbox 1,059 px | VERIFIED / UNVERIFIED |
| Basket / checkout | Clear, totals match, checkout reached | VERIFIED |
| Reviews | 0 / 1 | VERIFIED |

## 6. Why buyers may not complete

| # | Reason | Label |
|---|---|---|
| 1 | Super King cheaper than King looks like an error and can lower trust | VERIFIED (price) / HYPOTHESIS (impact) |
| 2 | Fabric list in the copy does not match the options (Linen, Crushed Velvet, Chenille) | VERIFIED / HYPOTHESIS |
| 3 | Diamond button +£19.99 hidden on an image swatch | VERIFIED / HYPOTHESIS |
| 4 | PMax visitors add to basket (6/34) but stall before checkout (1) – store-wide pattern for Ads carts (Stage 2 §8.3) | VERIFIED (data) / HYPOTHESIS (cause) |
| 5 | FAQ tells buyers to "contact us" about storage that is already on the page – adds doubt | VERIFIED / HYPOTHESIS |

## 7. Fixes (owner approval needed)

1. **RECOMMENDATION: owner confirms the Super King price** (£389.99 vs King £399.99) and corrects it if wrong (price change = owner decision).
2. **RECOMMENDATION: align fabric copy** with the five offered fabrics.
3. **RECOMMENDATION: print "+£19.99" on the Diamond Button swatch** (Easify label).
4. **RECOMMENDATION: rewrite the storage FAQ** to point to Base Type with its prices.
5. **RECOMMENDATION: keep this product in ChatGPT/AI-visibility work** (1 of 1 sales from ChatGPT).

**Test method.** Before/after 4 weeks on the landing funnel; success = PMax cart→checkout ≥ 3 in 10. Re-run the Playwright basket check after any Easify label change.

## Limitations
Small numbers (64 sessions). Same sandbox limits as report 1.

## Credits used
OpenRush 0. ShopifyQL shared.
