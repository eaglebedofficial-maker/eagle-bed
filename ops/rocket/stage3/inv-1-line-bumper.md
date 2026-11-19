# Investigation 1: Line Bumper Ottoman Divan Bed (19 Nov 2026)

Handle: `line-bumper-ottoman-divan-bed` · product 15524049420619 · type Ottoman Bed · status ACTIVE
Roles: Buyer Walkthrough, Product Pages, Checkout Doctor, Verification. Screenshot prefix `inv`.
Method: `/products/<handle>.js` (live), Playwright Chromium with `devices['iPhone 13']`, two test baskets taken to the checkout page (nothing typed, nothing submitted), ShopifyQL `FROM sessions` (human only, read-only). Common findings for all 7 products are in `03-product-investigations.md` section 3.

## 1. Baseline (session-level signals, not proof)

| Window | Landing sessions | Cart sessions | Reached checkout | Completed | Orders of this product |
|---|---|---|---|---|---|
| 90 days (product-intel.json) | 441 | 28 | 2 | 0 | **0** |
| Last 30 days (ShopifyQL today) | 82 | 13 | 1 | 0 | 0 |

VERIFIED. Cart counts are for the whole session, not proof that this bed was added.

## 2. Where the traffic comes from (ShopifyQL, human, 90 days)

| Source / medium / campaign | Sessions | Carts | Checkout | Done |
|---|---|---|---|---|
| google / product_sync / sag_organic | **289** | 7 | 1 | 0 |
| google / cpc / pmax_all_products | 112 | 15 | 1 | 0 |
| google / cpc / shopping_uk | 16 | 2 | 0 | 0 |
| (no UTM: direct, typed, untagged) | 15 | 1 | 0 | 0 |
| chatgpt.com | 9 | 3 | 0 | 0 |

- By month: Aug 13, **Sep 269** (7 carts), Oct 102 (10 carts), Nov 57 (11 carts). VERIFIED.
- 416 of 441 sessions (94%) are UK mobile. VERIFIED.
- **Reading (ESTIMATE):** two-thirds of the 441 sessions are a September burst from the Google product feed (`sag_organic`). Stage 1 (report 02) found these were very likely paid PMax/Shopping clicks mislabelled as free listings before 28 Sep. That burst had a 2.6% cart rate. Since October the page gets a smaller PMax audience with a 13–19% cart rate, which is healthy. The real problem now is **cart → checkout**: 13 carts in 30 days, 1 checkout.
- **"Kids" intent: UNKNOWN.** ShopifyQL has no search terms and OpenRush budget was 0. The shared "Line" name with the Line Kids Velvet bed makes it possible (HYPOTHESIS). Check in Google Ads → PMax → Insights → Search terms for this product.

## 3. Product facts (live, 19 Nov)

| Size | Price | Available |
|---|---|---|
| Single (3FT) | £324.99 | yes |
| Small Double (4FT) | £402.99 | yes |
| Standard Double (4FT6) | £415.99 | yes |
| King (5FT) | £435.99 | yes |
| Super-King (6FT) | £493.99 | yes |

VERIFIED (`.js`): one Shopify option (Size), 5 variants, all `available: true`, inventory tracked by Shopify, no compare-at prices, SKUs EB-LNBOTT-*.
Note the jump from Single to Small Double is £78, much bigger than the steps above it (£13, £20, £58). VERIFIED. Whether intended: UNKNOWN (owner).

**Easify options (iPhone 13, VERIFIED, identical set on all 7 beds):**

| Group | Required | Choices and prices |
|---|---|---|
| Fabric Type | yes | Plush Velvet, Naples, Galaxy, Conniston, Teddy Boucle |
| Colour (labelled "Fabric Type" again) | yes | 15 / 11 / 9 / 9 / 11 colours per fabric (55 in all) |
| Headboard Height | yes | Standard 50", 54", 60" (no surcharge seen; 54" added £0) |
| **Base Type** | **no, nothing pre-selected** | Slatted Base £0 · Solid Board +£29.99 · Metal Ottoman +£119.99 · Mesh Metal Ottoman +£149.99 · Divan Ottoman Footend Lift +£189.99 · Divan Ottoman Side Lift +£189.99 |
| Mattress Type | no | No Mattress, Memory Orthopedic, 1000/2000/3000 Pocket, Pillow Top; then Mattress Size: 3ft £129.99, 4ft £179.99, 4ft6 £179.99, 5ft £199.99, 6ft £249.99 (1000 pocket) |
| Delivery Service | yes | Downstairs Drop Off £0 · Room of Choice Drop Off +£29.99 · Room of Choice Assembly +£69.99 |

## 4. Headline price vs what a buyer pays (Playwright, iPhone 13, VERIFIED)

| Basket | Configuration | Basket total = checkout total | vs headline |
|---|---|---|---|
| A | Standard Double, Plush Velvet Grey, 50", **Metal Ottoman**, no mattress, Downstairs | **£535.98** | +£119.99 on the Double price (£415.99); +65% on "from £324.99" |
| A2 (arithmetic from verified option prices) | Same but **Divan Ottoman Footend Lift**, the end-opening base the description promises | **£605.98** | +£189.99 (+46%) |
| B | King, Teddy Boucle Latte, 54", Divan Ottoman Footend Lift, 1000 Pocket 5ft, Room of Choice Assembly | **£895.96** | +£459.97 on King (£435.99), +105% |
| Minimum (required fields only) | Single, no base chosen | £324.99 | Order line has **no Base Type at all** |

Evidence: `shots/inv-line-bumper-A-options.jpg`, `inv-line-bumper-A-cart.jpg`, `inv-line-bumper-A-checkout.jpg`, `inv-line-bumper-B-options.jpg`, `inv-line-bumper-B-cart.jpg`; raw JSON in the scratchpad `inv/bk-*-line-bumper-ottoman-divan-bed.json`.

**The key finding (VERIFIED):** the product is named "Ottoman Divan Bed – Gas Lift Storage Bed", the description says "The smooth end-opening gas lift base gives you under-bed storage", and the first photo shows the base lifted. But the price of £324.99–£493.99 buys **no ottoman base**. The gas-lift base is an optional add-on of +£119.99 to +£189.99 with nothing pre-selected. A buyer who fills only the required fields orders a bed with no base type recorded.

## 5. Page checks (iPhone 13)

| Check | Result | Label |
|---|---|---|
| Title visible | H1 computed `rgb(255,255,255)` on white | VERIFIED (style); owner's screenshot also did not clearly show a title |
| Price above the fold | Price sits below the photo. In the sandbox the layout was 712 px wide on a 390 px screen, so fold position is not reliable | UNVERIFIED (sandbox-only overflow, see index §3) |
| Sticky Add to basket | Bar exists (`.eb3d-sticky`, fixed). Scroll activation not re-tested | UNKNOWN on a real phone |
| Price updates with add-ons | No. Main and sticky price stay at the size price (£415.99); only the line "Your selections will add an additional charge of £119.99 GBP" changes | VERIFIED |
| Images | 7 product photos + 1 fabric-guide image. One photo is 727×723 px, rest 1024–2000 px. Alt text present. The hero shows the base open | VERIFIED |
| Description | 571 words. **No dimensions** (no cm, no bed height, no headboard height in cm, no storage depth). Mattress not included is implied ("Order the size that matches your mattress") but never stated | VERIFIED |
| Fabric copy | Description lists "Chenille" and "Coniston"; the options offer no Chenille and spell it "Conniston". The fabric-guide image names Chenille and Crushed velvet, which are not options | VERIFIED |
| Delivery | "Free delivery within 3–5 working days across Great Britain", NI £90, Room of Choice +£29.99, Assembly +£69.99. Correct per BRIEF. No dated timeline seen today (Stage 1 #12 may be gone or not rendered in sandbox) | VERIFIED / UNKNOWN |
| Assembly price clarity | Clear: "(£69.99 GBP)" on the option and in the basket. Never shown as free | VERIFIED |
| Reviews | "Product reviews (0) · Store reviews (1)" | VERIFIED |
| Basket | Every option and add-on price shown on the line (e.g. "Base Type: Metal Ottoman (£119.99 GBP)"). Total correct. Says "Pay in 3 with Klarna or Clearpay" | VERIFIED |
| Checkout | Reached in both baskets; total matched basket. Shipping cost needs an address (not typed) | VERIFIED / UNKNOWN |
| JS errors | Only blocked third-party hosts (TikTok pixel, Dondy chat, wallet telemetry). No theme errors | VERIFIED (sandbox) |
| Copy vs BRIEF | Description names "Pepproyd Street workshop"; BRIEF says to say Dewsbury only | VERIFIED |

## 6. Why buyers may not complete

| # | Reason | Label |
|---|---|---|
| 1 | **The ottoman in the name and photo is not in the price.** The true Double ottoman price is £535.98–£605.98, not £415.99 (and not "from £324.99"). Buyers who add to basket meet the real total only in the basket, because the page price does not move | VERIFIED (mechanism) / HYPOTHESIS (that it causes the drop) |
| 2 | Buyers who skip Base Type may think they bought an ottoman. No order yet, so no evidence of disputes | VERIFIED (possible) / HYPOTHESIS (harm) |
| 3 | Four different ottoman bases (metal, mesh metal, divan end-lift, divan side-lift) on a bed described as end-opening: unclear which one is "the" Line Bumper | VERIFIED (options) / HYPOTHESIS (confusion) |
| 4 | Google feed/PMax ads show the bed with storage at a price that excludes storage, so paid visitors arrive with a wrong price in mind | HYPOTHESIS (feed price per variant not checked; Merchant Center not read) |
| 5 | No dimensions: an ottoman buyer needs bed height and storage depth | VERIFIED (missing) / HYPOTHESIS (impact) |
| 6 | No product reviews on a £500+ bed | VERIFIED / HYPOTHESIS |
| 7 | Invisible title, and possible layout overflow on some phones | VERIFIED (title style) / UNVERIFIED (overflow) |
| 8 | The September traffic burst was low-intent feed traffic, which inflates the "441 sessions, 0 sales" picture | ESTIMATE |
| 9 | "Kids" search intent | UNKNOWN |

## 7. Fixes (all need owner approval; no change made)

1. **RECOMMENDATION: make price and name agree.** Either (a) set the ottoman base the description promises (Divan Ottoman Footend Lift) as the included default and price it into the headline (Double would read £605.98 at today's prices; owner sets the price), or (b) rename to "Line Bumper Bed – Ottoman Storage Base Optional" and change the first photo to the closed bed. Owner chooses.
2. **RECOMMENDATION: make Base Type required** on this product so no order is placed without a base, and show one line under the price: "Ottoman gas-lift base from +£119.99. Choose it under Base Type."
3. **RECOMMENDATION: show a running total** ("Your bed: £535.98") next to the main price and in the sticky bar (Easify setting or theme; Stage 1 #6).
4. **RECOMMENDATION: add a dimensions block** (bed width/length per size, overall height per headboard option, base height, storage depth) and the sentence "Mattress not included unless you add one below." Owner supplies the measurements.
5. **RECOMMENDATION: align fabric copy** with the options (remove Chenille, fix Coniston/Conniston, replace the fabric-guide image or its text) and remove "Pepproyd Street".

**Test method.** Traffic is small (about 80 landings a month), so a split A/B test cannot reach significance. Use a before/after read: for 4 weeks before and 4 weeks after the change, run `FROM sessions SHOW sessions, sessions_with_cart_additions, sessions_that_reached_checkout, sessions_that_completed_checkout WHERE human_or_bot_session='human' AND landing_page_path='/products/line-bumper-ottoman-divan-bed' GROUP BY week`. Success = cart→checkout rate rises from about 1 in 13 to 3+ in 13, with PMax budget unchanged. Also count orders whose line has a Base Type property. Re-run the Playwright basket script to confirm the shown price equals the basket total.

## Limitations
- Sandbox browser blocks shop.app, Judge.me, TikTok, Meta, GTM and wallets. Layout width and fold are UNVERIFIED on a real phone. The shop.app hops before /cart and /checkout were emulated (the on-domain pages were then loaded live).
- Session-level cart counts do not prove this bed was in the basket.
- Merchant Center feed prices, PMax search terms and abandoned-checkout contents were not read.

## Credits used
OpenRush: 0. ShopifyQL: 4 read-only queries (shared across all 7 products). Playwright and public `.js` endpoints: free.
