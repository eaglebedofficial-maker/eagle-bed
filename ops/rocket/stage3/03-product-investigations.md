# Stage 3, part 5: Product abandonment investigations (19 Nov 2026)

Roles: Buyer Walkthrough, Product Pages, Checkout Doctor, Verification. Screenshot prefix `inv` (`shots/inv-*`). No live changes were made.
Method: live `/products/<handle>.js`; Playwright Chromium with `devices['iPhone 13']`; for each bed two baskets added and taken to the on-domain checkout page (nothing typed, nothing submitted); ShopifyQL `FROM sessions` (human only) for traffic. Raw evidence (JSON, scripts) in the session scratchpad folder `inv/` (can be cleared).

Reports: `inv-1-line-bumper.md` · `inv-2-line-ambassador.md` · `inv-3-stone-premium.md` · `inv-4-cloud-teddy.md` · `inv-5-savoy.md` · `inv-6-royal-chesterfield.md` · `inv-7-grand-extra-tall.md`

## 1. Answer in five lines

1. **Line Bumper Ottoman: the ottoman is not in the price.** Named "Ottoman Divan Bed – Gas Lift Storage Bed", pictured open, but the base is a +£119.99–£189.99 optional add-on with nothing pre-selected. A Double with the described end-lift base costs £605.98, not £415.99. VERIFIED.
2. **Line Ambassador has two colour pickers** (Shopify Colour with Cream pre-selected, plus the Easify fabric colour). Their lists differ, and a test order carried two colours ("Grey" and "Latte"). VERIFIED.
3. **Stone and most of the old Line traffic were a September product-feed burst** (`sag_organic`, likely paid clicks; Stage 1). Stone now gets about 6 landings a month. The Line beds now get PMax traffic that adds to basket (13–19%) but almost never reaches checkout. VERIFIED (data).
4. **Basket → checkout is the leak on paid traffic**: Grand 15 PMax carts → 1 checkout, Line Bumper 10 → 1, Line Ambassador 10 → 1, Royal 6 → 1 (last 30 days). On every bed the page price never moves with add-ons, so buyers first see £460–£1,078 in the basket. VERIFIED (mechanism) / HYPOTHESIS (cause).
5. No technical blocker found: all 14 test baskets added correctly, showed every option and price in the basket, and opened checkout with the same total. VERIFIED.

## 2. Comparison table

Prices VERIFIED from `.js`; baskets VERIFIED in Playwright (basket total = checkout total). Basket A = Std Double, Plush Velvet Grey, 50", Metal Ottoman (+£119.99), no mattress, Downstairs. Basket B = King, Teddy Latte, 54", Divan Ottoman Footend Lift (+£189.99), 1000 Pocket 5ft mattress (+£199.99), Room of Choice Assembly (+£69.99), plus required paid extras where the first choice costs more (Stone Golden Strip +£19.99).

| # | Product | From (Single) | Double | King | Basket A | Basket B | B vs King | 90d landings / carts / sales | L30 main source (carts→checkout) | Images (product) | Top VERIFIED issue |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Line Bumper Ottoman | £324.99 | £415.99 | £435.99 | £535.98 | £895.96 | +105% | 441 / 28 / 0 | PMax 73 (10→1) | 7 (one 727 px) | Ottoman not in price; Base optional, none pre-selected |
| 2 | Line Ambassador | £337.99 | £389.99 | £428.99 | £509.98 | £888.96 | +107% | 374 / 26 / 1 | PMax 79 (10→1) | 19 (five 679 px) | Two colour pickers, conflicting colours on order |
| 3 | Stone Premium | £467.99 | £558.99 | £597.99 | £698.97 | £1,077.95 | +80% | 270 / 2 / 0 | 6 sessions total | 5 (WhatsApp, one 448 px) | Weak photos; pictured gold strip +£19.99 hidden; no live traffic |
| 4 | Cloud Teddy Bouclé | £376.99 | £428.99 | £467.99 | £548.98 | £927.96 | +98% | 124 / 16 / 2 | Direct 21 (6→3) | 5 (small landscape) | Storage not in price (Stage 1 O4, still open) |
| 5 | Eagle Savoy Channel | £379.99 | £454.99 | £484.99 | £574.98 | £944.96 | +95% | 36 / 8 / 1 | Direct 16 (4→7) | 7 at 2000 px | Repeat checkouts by the same buyers; Chenille not offered |
| 6 | Royal Chesterfield | £364.99 | £389.99 | £399.99 | £509.98 | £859.96 | +115% | 64 / 11 / 1 | PMax 31 (6→1); ChatGPT sold | 10 at 2000 px | Super King £389.99 < King £399.99 |
| 7 | Grand Extra-Tall | £312.99 | £338.99 | £349.99 | £458.98 | £809.96 | +131% | 116 / 17 / 1 | PMax 105 (15→1) | 9 at 2000 px | No headboard height; 50" default like every bed |

All 35 size variants (and Ambassador's 60 colour variants) are `available: true`. No compare-at prices. VERIFIED.

## 3. Common findings (all 7 beds)

| # | Finding | Label |
|---|---|---|
| C1 | Identical Easify option set on every bed: 5 fabrics (Plush Velvet 15, Naples 11, Galaxy 9, Conniston 9, Teddy Boucle 11 colours), headboard 50"/54"/60" at no extra cost, 6 base types (£0–£189.99), 6 mattress types with a separate size pick (3ft £129.99 … 6ft £249.99 for 1000 pocket), 3 delivery services | VERIFIED |
| C2 | Main and sticky price change with size only; add-ons appear only as "Your selections will add an additional charge of £X GBP" (Stage 1 #6, still open) | VERIFIED |
| C3 | Colour group titled "Fabric Type" again (Stage 1 #7, still open); colour typos "Charoal", "Tumeric"; basket labels mix "Plush Velvet: Grey" and "Teddy Boucle Colors: Latte" | VERIFIED |
| C4 | Description fabric lists do not match options on all 7 (Chenille, Linen, Crushed Velvet named but not offered; "Coniston" vs "Conniston"); the shared fabric-guide image also names Chenille and Crushed velvet | VERIFIED |
| C5 | No dimensions (cm) in any of the 7 descriptions; "mattress not included" never stated, only implied | VERIFIED |
| C6 | H1 title computed white on white on all 7 (owner's phone screenshot also did not clearly show it) | VERIFIED (style) |
| C7 | Sandbox layout wider than the 390 px screen on all 7 (540–1,757 px). Owner's real iPhone shows a product page fitting the width, so this is **UNVERIFIED** and likely caused by blocked third-party scripts. Line Ambassador (1,757 px) should be the first page checked on a real phone | UNVERIFIED |
| C8 | Basket shows every option and add-on price; totals correct; checkout reached on all 14 baskets with the same total; shipping rate needs an address (not typed) | VERIFIED / UNKNOWN (rates) |
| C9 | Basket says "Pay in 3 with Klarna or Clearpay"; Clearpay not confirmed (Stage 1 O3, still open) | VERIFIED (text) |
| C10 | Delivery options correct (Downstairs free, Room of Choice +£29.99, Assembly +£69.99); assembly never shown as free | VERIFIED |
| C11 | Reviews: "Product reviews (0) · Store reviews (1)" on all 7 | VERIFIED |
| C12 | New: on a second visit with items in the basket, `/cart` redirects through `shop.app/accounts/sur` (Shop sign-in recognition, `source: second_visit`) before showing the basket. Checkout also hops via shop.app (Stage 1 #18). The sandbox blocks shop.app, so both hops were emulated here; real-world delay UNKNOWN | VERIFIED (redirect) / UNKNOWN (impact) |
| C13 | JS errors: only from sandbox-blocked third parties (TikTok pixel, Dondy chat, wallet telemetry). No theme errors | VERIFIED (sandbox) |
| C14 | Four descriptions (Line Bumper, Line Ambassador, Stone, Cloud Teddy) name "Pepproyd Street workshop"; BRIEF says to say Dewsbury only | VERIFIED |
| C15 | No dated delivery timeline was seen on the page today (Stage 1 #12). Either removed or not rendered in the sandbox | UNKNOWN |

## 4. Priority fixes across products (owner approval needed)

| Priority | Fix | Products | Why |
|---|---|---|---|
| 1 | Price the ottoman base into ottoman-named beds, or rename; make Base Type required | Line Bumper, Cloud Teddy | Name, photo and price disagree (VERIFIED) |
| 2 | Running total next to price and in sticky bar | All | Basket is the first place the real price appears (VERIFIED) |
| 3 | One colour picker on Line Ambassador | Line Ambassador | Two colours on one order (VERIFIED) |
| 4 | Dimensions block + "mattress not included" line; headboard heights in cm | All, esp. Grand Extra-Tall | Missing on all 7 (VERIFIED) |
| 5 | Align fabric copy and the fabric-guide image with the 5 real fabrics; fix typos | All | Mismatch on all 7 (VERIFIED) |
| 6 | Owner checks Royal Chesterfield Super King price | Royal | £389.99 < King £399.99 (VERIFIED) |
| 7 | New photos for Stone; show +£19.99 on strip/button swatches | Stone, Royal | (VERIFIED) |
| 8 | Real-phone check of Line Ambassador page width and title | Line Ambassador, all | Sandbox-only finding (UNVERIFIED) |

**Test method (all).** Traffic per product is 6–112 landings a month, too small for split A/B tests. Use before/after windows of 3–4 weeks with PMax budget unchanged, reading the human landing funnel per path in ShopifyQL by week (query in report 1). Primary metric: cart→checkout sessions per landing page; secondary: completed checkouts and order lines with a Base Type. Re-run the Playwright basket script (scratchpad `inv/basket.js`) after each change to confirm shown price = basket = checkout.

## Limitations
- Sandbox browser blocks shop.app, Judge.me, TikTok, Meta, GTM, wallets and Shopify telemetry. Layout width, fold position and sticky-bar activation are UNVERIFIED on real phones. The shop.app hops before /cart and /checkout were emulated in the test browser (the store's own pages then loaded live).
- Cart and checkout counts are per session, not per product; landing counts include only sessions whose first page was the product.
- PMax search terms, Merchant Center feed prices, abandoned-checkout steps and the workshop's reading of conflicting options were not available (UNKNOWN). "Kids" intent on Line Bumper is UNKNOWN.
- One run per basket from a data-centre network.
- 14 test baskets were left in throwaway browser sessions; no checkout was submitted and no personal data typed.

## Credits used
- OpenRush: **0** (no calls; budget 0).
- Shopify ShopifyQL: 4 read-only queries (sessions by landing page × UTM, × device/country, × month, last-30 × campaign). No mutations.
- Playwright: about 30 page runs on the live site; public `/products/*.js` and `/cart.js`.
