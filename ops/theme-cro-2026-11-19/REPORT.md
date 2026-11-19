# Eagle Bed CRO theme fixes: report (19 Nov 2026)

Owner approval: 19 Nov 2026, "Fix the website" (Stage 3 group A1–A5). Nothing is live yet: the fixes are in an unpublished copy of the live theme, and the owner publishes it.

- Live theme (unchanged): "Eagle Bed SEO fixes 10 Nov - PUBLISH", id 212418724171 (theme.liquid checksum unchanged).
- New copy with the fixes: "Eagle Bed CRO fixes 19 Nov - PUBLISH", id 213270004043 (unpublished; theme slots 16 of 20).
- Preview: https://www.eaglebed.co.uk/products/side-lift-open-ottoman-bed?preview_theme_id=213270004043 (home: https://www.eaglebed.co.uk/?preview_theme_id=213270004043)

## 1. What changed
| # | Problem (Stage 3) | Fix in the copy | Result |
|---|---|---|---|
| 1 | Product pages wider than the phone (photo strip, Divan table, Easify swatches); home slightly too wide | Product column can shrink (minmax(0,1fr), min-width:0); photo strip and description tables scroll in their own box; Easify swatch rows 3-across under 411 px; home cards can shrink | Page = screen width on 145/145 product pages at 390 px and 360 px, plus home, collection and basket on Pixel 7, iPhone 13 and desktop |
| 2 | Product name white on white (1.0:1); card/related names 1.0–1.2:1; "Your basket" 1.2:1 | Theme ink #161619 on light backgrounds; card names follow their card colour | H1 18.1:1; collection cards 15.0:1; related 18.1:1; basket 15.0:1; dark home rails unchanged |
| 3 | Chat bubble covered the right half of sticky Add to basket and Checkout securely | On phones, while a bar shows and on the basket page, the Chat layer is raised 80 px | Hit tests left/centre/right land on the buttons |
| 4 | Sticky bar appeared after 2,700–4,050 px, off-screen, taps failed | Shows once price and main button are off screen; tap presses the real Add to basket (Easify validation unchanged) | Shows at 900–1,050 px; adds 8/8; with options missing it scrolls to the first required field |
| 5 | Copy (Clearpay, prices, storage names) | Not changed (owner decisions) | Clearpay text still present |

Files: assets/eb-cro-fixes-19nov.css (new), assets/eb-cro-fixes-19nov.js (new), 3 lines in layout/theme.liquid (after base.css). Before/after copies in before/ and after/. No product, price, Easify, checkout or payment change.

## 2. Tests (Playwright Chromium; Pixel 7, iPhone 13 size, desktop 1366x800)
| Page | Pixel 7 width before → after | iPhone 13 before → after |
|---|---|---|
| Home | 451 → 412 | 439 → 390 |
| Ottoman Gas Lift Divan Base | 441 → 412 | 441 → 390 |
| Side Lift Open Ottoman Bed | 1,486 → 412 | 1,495 → 390 |
| Eagle Savoy Channel Bed | 799 → 412 | 799 → 390 |
| Line Ambassador Bed | 1,744 → 412 | 1,757 → 390 |
| All 145 product pages (after) | fit at 360 and 390 px | fit |

- Sticky tap adds the bed: 0/8 before → 8/8 after. Basket "Checkout securely" fully clear of Chat after.
- Basket totals identical live vs copy (same choices: £1,752.96); all Divan sizes + Room of Choice Assembly = size price + £69.99.
- Mobile CLS 0.003–0.026 after. No console errors from the new files.
- Manager re-check (19 Nov, after hand-back): Side Lift and Divan Base on the preview: width 412/412 (Pixel 7) and 390/390 (iPhone 13), h1 colour rgb(22,22,25), fix stylesheet loaded.

## 3. Limits
- Real Safari not tested (WebKit unavailable here): owner checks on his own iPhone before publishing.
- Dondy WhatsApp bubble and the Chat panel could not load in the sandbox (hosts blocked).
- Desktop product-page CLS stays high on live and copy alike (Easify loads late); not caused or fixed here.
- Not done (separate owner decisions): Clearpay, storage-bed price/naming, running total, Easify on /cart, tap targets.
- Any theme-editor change made to the live theme after 19 Nov ~14:45 UTC is not in the copy.

## 4. Owner steps
Check on your iPhone first (preview link above): no sideways sliding; bed name dark above the price; scroll down, the Add to basket bar appears with Chat above it; Add to basket from the bar opens the basket; "Checkout securely" fully clear of Chat (do not pay).
Publish: Shopify admin > Online Store > Themes > "Eagle Bed CRO fixes 19 Nov - PUBLISH" > Publish.
Roll back: Shopify admin > Online Store > Themes > "Eagle Bed SEO fixes 10 Nov - PUBLISH" > Publish (about 1 minute).
After publishing: HQ CRO dashboard tracks mobile add-to-basket and basket → checkout for 2 weeks.
