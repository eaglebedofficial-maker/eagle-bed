# Investigation 4: Cloud Teddy Bouclé Ottoman Bed (19 Nov 2026)

Handle: `cloud-teddy-boucle-ottoman-gas-lift-storage-bed` · product 15524048699723 · type Ottoman Bed · ACTIVE
Method as in report 1. Stage 1 already reported the slatted-base default on this product (report 03 #5, O4). This report re-checks it and adds traffic and basket totals; it does not repeat the full Stage 1 work.

## 1. Baseline

| Window | Landing sessions | Carts | Checkout | Completed on landing | Orders of this product |
|---|---|---|---|---|---|
| 90 days | 124 | 16 | 5 | 0 | **2** (£977.39 net) |
| Last 30 days | 26 | 8 | 3 | 0 | – |

VERIFIED. The 2 orders came from sessions that did not land on this page (session-level counting).

## 2. Traffic (human, 90 days)

| Source | Sessions | Carts | Checkout |
|---|---|---|---|
| (no UTM: direct / untagged) | **53** | 9 | 5 |
| chatgpt.com | 26 | 3 | 0 |
| facebook / paid / 120251989473090445 | 24 | **0** | 0 |
| google / product_sync / sag_organic | 14 | 2 | 0 |
| google / cpc / pmax_all_products | 5 | 2 | 0 |
| Google Shopping | 2 | 0 | 0 |

By month: Aug 28, Sep 49, Oct 32, Nov 15. Desktop 19 sessions (3 carts, 2 checkouts). VERIFIED.
Reading: unlike the Line beds, Teddy traffic is mostly direct and ChatGPT, people who already know the bed. The Facebook paid ad sent 24 sessions with no carts. ESTIMATE: direct visitors with checkouts are partly returning buyers (Stage 1: abandoned lists include people who later bought).

## 3. Product facts

Sizes: Single £376.99 · Small Double £402.99 · Double £428.99 · King £467.99 · Super-King £532.99, all available (VERIFIED).
Easify: common set; **Base Type optional, nothing pre-selected** (still true today, VERIFIED). The name says "Gas Lift Storage Bed"; the description says "Hydraulic gas lift ottoman storage base" under Key features.

## 4. Headline vs basket (iPhone 13, VERIFIED)

| Basket | Configuration | Total | vs headline |
|---|---|---|---|
| A | Std Double, Plush Velvet Grey, 50", Metal Ottoman, no mattress, Downstairs | **£548.98** | +£119.99 on £428.99 |
| B | King, Teddy Boucle Latte, 54", Divan Ottoman Footend Lift, 1000 Pocket 5ft, Assembly | **£927.96** | +£459.97 on £467.99 |

Checkout reached in both; totals match. Evidence `shots/inv-cloud-teddy-A-*.jpg`, `inv-cloud-teddy-B-*.jpg`.

## 5. Page checks

| Check | Result | Label |
|---|---|---|
| Storage in price | Not included; same issue as Line Bumper | VERIFIED (re-confirmed) |
| Fabric | "Teddy bouclé is the signature look" but Teddy Boucle is one of 5 equal choices with nothing pre-selected; description lists Chenille (not offered) | VERIFIED |
| Images | 5 product images, 4 of them ~1000×600 landscape (small on a phone) + fabric guide | VERIFIED |
| Description | 966 words, longest of the 7; no dimensions; says "Allow headroom" without a height | VERIFIED |
| Title / layout | White H1; sandbox 540 px | VERIFIED / UNVERIFIED |
| Price with add-ons | Does not move | VERIFIED |
| Delivery / assembly / basket | Correct and clear | VERIFIED |
| Reviews | 0 / 1 | VERIFIED |

## 6. Why buyers may not complete

| # | Reason | Label |
|---|---|---|
| 1 | Storage base not in the price of a bed named "Gas Lift Storage Bed" | VERIFIED / HYPOTHESIS (impact) |
| 2 | 5 checkouts from 16 carts is a normal-looking step; the loss is at checkout (0 completed on landing). Possible causes: payment choice (Clearpay promised in basket, not seen at checkout in Stage 1), phone required, delivery cost surprise for non-GB | HYPOTHESIS |
| 3 | Some "abandoned" checkouts are the 2 buyers coming back | ESTIMATE |
| 4 | Facebook ad audience not ready to buy (24 sessions, 0 carts) | VERIFIED (data) / HYPOTHESIS (reason) |
| 5 | Small landscape photos; no dimensions | VERIFIED / HYPOTHESIS |

## 7. Fixes (owner approval needed)

1. **RECOMMENDATION: Stage 1 O4** – include the gas-lift base in the headline price (or rename), and pre-select Teddy Boucle as the fabric that gives the bed its name.
2. **RECOMMENDATION: settle Clearpay** (Stage 1 O3) – the basket on this bed still says "Pay in 3 with Klarna or Clearpay" today (VERIFIED).
3. **RECOMMENDATION: add 2–3 portrait photos** (bed open, storage depth with items, bouclé close-up) and a dimensions block.
4. **RECOMMENDATION: before any recovery email,** match the 5 checkouts against the 2 orders (Stage 1 rule: check for a later order first).
5. **RECOMMENDATION: pause or re-target the Facebook ad** for this bed until tracking is fixed (Stage 2 §6) – owner decision, no change made.

**Test method.** Before/after 4 weeks on the landing funnel; success = at least 1 completed checkout per 5 reached. Read Shopify Abandoned checkouts (admin) for this product to see the step reached (shipping vs payment) – owner only, no customer data copied.

## Limitations
Same as report 1. Abandoned-checkout steps were not read (customer data).

## Credits used
OpenRush 0. ShopifyQL shared.
