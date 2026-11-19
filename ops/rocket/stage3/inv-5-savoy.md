# Investigation 5: Eagle Savoy Channel Bed (19 Nov 2026)

Handle: `savoy-channel-tufted-bed-frame` · product 15948310675787 · type Bed Frame · ACTIVE
Method as in report 1. Stage 1 already covered this page's sandbox overflow (1,110 px then; 799 px today) and the abandoned-checkout caveat (#1034).

## 1. Baseline

| Window | Landing sessions | Carts | Checkout | Completed | Orders |
|---|---|---|---|---|---|
| 90 days | 36 | 8 | **9** | 1 | 1 (£823.48 net, #1034) |
| Last 30 days | 20 | 6 | 9 | 1 | – |

VERIFIED. More checkout sessions than cart sessions means the same people came back in new sessions straight to checkout (for example from an abandoned-checkout link or the Klarna app). ESTIMATE.

## 2. Traffic (human, 90 days)

| Source | Sessions | Carts | Checkout | Done |
|---|---|---|---|---|
| (no UTM) | 20 | 5 | **7** | 1 |
| chatgpt.com | 6 | 0 | 0 | 0 |
| sag_organic | 4 | 0 | 0 | 0 |
| pmax_all_products | 3 | 0 | 0 | 0 |
| klarna / referral / klarna-merchantboost | 2 | 2 | 2 | 0 |
| Google Shopping | 1 | 1 | 0 | 0 |

VERIFIED. Almost no ad traffic. The 9 checkouts mostly come from returning direct visitors.

## 3. Product facts

Sizes: Single £379.99 · Small Double £439.99 · Standard Double £454.99 · King £484.99 · Super King £519.99, all available. Size names have no feet ("Single", "King") unlike most beds. VERIFIED.
Easify: common set; Base Type optional. Description: "Plush Velvet or Chenille upholstery"; options offer **5 fabrics and no Chenille**. VERIFIED.

## 4. Headline vs basket (iPhone 13, VERIFIED)

| Basket | Configuration | Total | vs headline |
|---|---|---|---|
| A | Std Double, Plush Velvet Grey, 50", Metal Ottoman, no mattress, Downstairs | **£574.98** | +£119.99 |
| A0 (arithmetic) | Std Double, slatted | £454.99 | matches |
| B | King, Teddy Latte, 54", Divan Ottoman Footend Lift, 1000 Pocket 5ft, Assembly | **£944.96** | +£459.97 |

The single real order was £914.97 gross (Stage 1), close to basket B. VERIFIED.

## 5. Page checks

| Check | Result | Label |
|---|---|---|
| Images | 7 product photos at 2000 px + swatch chart + fabric guide | VERIFIED (good) |
| Description | 352 words; no dimensions; footboard clearly described | VERIFIED |
| Fabric copy | Says Plush Velvet or Chenille; options differ | VERIFIED |
| Title / layout | White H1; sandbox 799 px | VERIFIED / UNVERIFIED |
| Basket / checkout | Clear, totals match, checkout reached | VERIFIED |
| Reviews | 0 / 1 | VERIFIED |

## 6. Why buyers may not complete

| # | Reason | Label |
|---|---|---|
| 1 | The "leak" is mostly the same buyers returning; real loss is small | ESTIMATE (Stage 1 #1034 evidence) |
| 2 | Big-ticket buyers (~£900) pause at payment: Clearpay is promised but was not seen at checkout | VERIFIED (claim) / HYPOTHESIS (impact) |
| 3 | Klarna app visitors (2) reached checkout and did not finish: possible Klarna decline or limit | HYPOTHESIS |
| 4 | Fabric copy mismatch | VERIFIED / HYPOTHESIS |

## 7. Fixes (owner approval needed)

1. **RECOMMENDATION: settle Clearpay** (claim vs checkout) – matters most on £900 baskets.
2. **RECOMMENDATION: phone/WhatsApp follow-up** for Savoy abandoned checkouts, only after checking for a later order (Stage 1 rule).
3. **RECOMMENDATION: fix fabric copy** (Chenille) and add dimensions incl. footboard height.
4. **RECOMMENDATION: use Savoy as a PMax test product** (good photos, proven £900 order) – Ads owner decision.

**Test method.** Count abandoned checkouts vs later orders per customer for 4 weeks (owner, in admin). Success = abandoned Savoy checkouts with no later order ≤ 2 a month.

## Limitations
36 sessions in 90 days is too few for rates. Same sandbox limits as report 1.

## Credits used
OpenRush 0. ShopifyQL shared.
