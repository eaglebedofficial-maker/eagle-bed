# Rocket Stage 1, Part 4: Website buyer journey audit (19 Nov 2026)

Roles: Store Designer/CRO, Checkout Doctor, Buyer Walkthrough, Accessibility, Verification.
Method: real live site www.eaglebed.co.uk in Playwright Chromium. Mobile = `devices['iPhone 13']` (390x664). Desktop = 1366x800. Cache off for each page (first-visit weight). Read-only: items were added to a test basket and the checkout page was opened. Nothing was typed into checkout and nothing was submitted or paid.
Journey tested: home → /collections/ottoman-beds → 5 product pages → size, fabric, colour, headboard, base, mattress, delivery service → add to basket → /cart → checkout page.
Products: `ottoman-gas-lift-divan-base`, `cloud-teddy-boucle-ottoman-gas-lift-storage-bed`, `savoy-channel-tufted-bed-frame` (Eagle Savoy Channel Bed), `side-lift-open-ottoman-bed`, `memory-foam-mattress-uk`.

Evidence folder (scripts, JSON results, screenshots), called `SP` below:
`/tmp/claude-0/-home-user-eagle-bed/4a1dd6da-a4cd-59ea-9c5c-1f83cbb62db3/scratchpad/rocket-cro/`
Main files: `SP/results-mobile.json`, `SP/results-desktop.json`, `SP/add-<device>-<handle>.json`, `SP/perf-mobile-throttled.json`, `SP/axe-mobile.json`, screenshots in `SP/shots/mobile/` and `SP/shots/desktop/`.
Note: the scratchpad can be cleared. If the Manager wants to keep the screenshots, copy the folder before the session ends.

---

## 1. Headline

The basket, the option pricing and the cart are now solid. The October pricing risks (countdown, permanent "was" prices) are gone. But three theme bugs hurt every product page, and two of them hit mobile, where 77% of sessions are:

1. **P0. Mobile product pages are wider than the phone.** On the Side Lift bed the page is 1,495 px wide on a 390 px phone; on the Savoy it is 1,110 px. The photo, price and buttons slide off the right edge, and the sticky "Add to basket" bar sits below the screen.
2. **P1. The product title (H1) is white on white** on every product page, on mobile and desktop. Shoppers see a blank gap where the bed name should be. The "Your basket" heading is white on light grey.
3. **P1. Checkout does not offer Clearpay**, but the product pages, cart and announcement bar promise "Klarna or Clearpay at checkout".

---

## 2. Findings table

Severity: P0 = stops sales now, P1 = big loss or legal/claim risk, P2 = friction, P3 = polish.
Labels: VERIFIED = measured now in Playwright on the live site; HISTORICAL = from repo files; ESTIMATE = reasoned; UNKNOWN = could not test.

| # | Problem | URL / device | Evidence | Customer impact | Sev | Recommended fix | Complexity | Owner approval |
|---|---|---|---|---|---|---|---|---|
| 1 | **Mobile product pages overflow sideways.** Page width on a 390 px phone: Side Lift 1,495 px, Savoy 1,110 px, Cloud Teddy 540 px, Ottoman Divan Base 441 px, home 439 px. The mattress page, collection and cart are fine (390 px). The product grid column (`.eb3d-pdp__grid`) grows to the min-content width of the info column (accordions plus Easify options). | /products/side-lift-open-ottoman-bed, /products/savoy-channel-tufted-bed-frame, /products/cloud-teddy-…, /products/ottoman-gas-lift-divan-base · mobile | VERIFIED. `SP/vp.js` output (innerWidth 1495/1110/540/441 vs clientWidth 390). Screenshots `SP/shots/mobile/side-lift-open-ottoman-bed-fold.png` (photo pushed right: a blank white box), `SP/shots/mobile/savoy-addbutton-area.png` (Add to basket and Shop Pay cut off), `SP/shots/mobile/cloud-teddy-boucle-ottoman-gas-lift-storage-bed-scrolled.png` ("£149.99 GBP" clipped) | The photo is cropped or blank. Price, options and buttons fall off-screen or need sideways scrolling. This matches the October funnel leak (2,679 mobile sessions → 65 add-to-carts → 2 orders, HISTORICAL). | **P0** | Add `.eb3d-pdp__grid > * { min-width: 0 }` and `.eb3d-info * { overflow-wrap: anywhere }`. A browser-side test brought Side Lift from 1,495 px to 390 px. Savoy only fell to 689 px, so something else on that page also overflows. Find it in the theme and test all 145 PDPs at 360 px and 390 px before publishing. | Low (CSS), plus a sweep | Yes (theme) |
| 2 | **Sticky buy bar never appears on overflowing pages.** It works on the mattress page: hidden at the top, shown from 1,800 px of scroll. On the Teddy bed it never gets its `is-on` class, and it is fixed at the bottom of a 920 px-tall layout viewport, below the 664 px visible screen. | Teddy, Savoy, Side Lift · mobile | VERIFIED. `SP/sticky.js` output; `SP/shots/mobile/memory-foam-mattress-uk-sticky-test.png` vs `SP/shots/mobile/cloud-teddy-boucle-ottoman-gas-lift-storage-bed-sticky-test.png` | Shoppers lose the thumb-zone "Add to basket" on the long bed pages, where it matters most. | P0 (same root cause as #1) | Fixing #1 should fix it. Re-test the sticky bar after the fix. | Low | Yes (theme) |
| 3 | **Product title invisible.** `h1.eb3d-info__title` is computed `rgb(255,255,255)` on a white background. The colour comes from Dawn base `h1 {color: rgb(var(--color-foreground))}` in a dark colour scheme, and the eb3d info block does not override it. The basket H1 "Your basket" is white on #eceae6 (contrast 1.2:1). The cart's "Order summary" title also seems blank. | All 5 PDPs + /cart · mobile and desktop | VERIFIED. `SP/h1b.js` (matched CSS rule), `results-*.json → sig.h1style`, axe `color-contrast` on /cart. Screenshots `SP/shots/desktop/cloud-teddy-boucle-ottoman-gas-lift-storage-bed-fold.png` (gap between "Eagle Bed" and price), `SP/shots/desktop/cloud-teddy-boucle-ottoman-gas-lift-storage-bed-after-add.png` | Shoppers cannot see which bed they are on (above the price, the key spot). It fails WCAG 1.4.3 and looks broken. Screen readers still read it. | **P1** | Set `.eb3d-info__title, .eb3d h1, .eb3d h2 { color: var(--eb-ink) }` (or the theme's dark ink token) in eb3d.css, or change the section colour scheme. | Low | Yes (theme) |
| 4 | **"Clearpay at checkout" claim not true at checkout.** The checkout payment list shows: Credit card, Klarna, Shop Pay (pay in full or in instalments), PayPal. No Clearpay. The claim appears on every PDP ("Spread the cost with Klarna or Clearpay at checkout"), in the cart ("Pay in 3 with Klarna or Clearpay"), in the trust list and in the BRIEF. | Checkout · both (test basket £305.99) | VERIFIED. `results-mobile.json → pages.checkout.fields/text`; `SP/shots/mobile/checkout-full.png`. The card field could not load here (proxy), but the method list is server-rendered. | A shopper who chose Eagle Bed for Clearpay finds it missing at the last step. This is also a misleading-claim risk (CMA / DMCC Act). | **P1** | Owner: check Shopify Payments → Clearpay. If it is not active, either switch it on or remove "Clearpay" from the theme copy, product descriptions and the facts file. Test again with a £300+ basket. | Low | Yes (checkout/payment) |
| 5 | **"Gas lift storage bed" headline price leaves out the storage base.** The Cloud Teddy is named "… Gas Lift Storage Bed", but Base Type defaults to "Slatted Base" (no storage), and a lift-up base costs +£119.99 (Metal Ottoman) to +£189.99 (Divan Ottoman). Base Type is optional with nothing pre-selected. The same option set is on Savoy and Side Lift. A King Teddy with Metal Ottoman, a 1000 pocket mattress and assembly is £857.96, against £467.99 shown. | /products/cloud-teddy-…, /products/side-lift-open-ottoman-bed · both | VERIFIED. `SP/shots/desktop/cloud-teddy-boucle-ottoman-gas-lift-storage-bed-options-filled.png`, cart line props in `SP/add-desktop-cloud-teddy-…json` | A shopper who expects storage at £376.99 meets a +£119.99 surprise, or orders a slatted bed by mistake. This is price-transparency risk (CMA "drip pricing" guidance) and likely returns or disputes. | **P1** | Either (a) price the gas-lift variant into the headline and make the ottoman the default, or (b) rename these listings so they do not promise storage at the base price, and make Base Type required with a clear default. Owner decides the price. | Medium | Yes (price) |
| 6 | **Main price and sticky price do not move with add-ons.** Size changes do update the price (Teddy £376.99 → £467.99 for King). Fabric, base, mattress and delivery add-ons do not. The only total is a line at the bottom of the options: "Your selections will add an additional charge of £389.97 GBP". | All bed PDPs · both | VERIFIED. `add-*.json → steps[].price`, `addonText` | Shoppers do not see the real total until the basket, which looks like a hidden cost. | P2 | Ask Easify support (or use the theme) to show "Total: £X" next to the main price and in the sticky bar. | Medium | Yes (theme/app) |
| 7 | **Colour picker labelled "Fabric Type" twice.** After choosing a fabric, a second group appears, also titled "Fabric Type *", holding the colours (Blue, Grey, Cream, …). In the order the colour is saved as `"Plush Velvet": "Grey"`. | All bed PDPs · both | VERIFIED. `SP/shots/desktop/cloud-teddy-boucle-ottoman-gas-lift-storage-bed-options-filled.png`; cart props | Confusing. Shoppers may think they already chose and miss the colour, then hit "This is a required field". | P2 | In Easify, rename the conditional groups "Colour" (or "Plush Velvet colour"). | Low | Yes (app settings) |
| 8 | **Mattress size is a separate required pick.** Adding a mattress opens "Mattress Size *" (3ft £129.99 … 6ft £249.99) that does not follow the bed size. A shopper can order a King bed with a Single mattress. | Bed PDPs · both | VERIFIED. `add-*.json → mattressSizeShown` | Wrong-size orders and an extra required step. | P2 | Set Easify conditional logic so each bed size shows only its matching mattress price, or show a warning. | Medium | Yes (app/price) |
| 9 | **Layout shift on desktop product pages.** CLS 0.47 (Teddy, Divan Base) in one run and 0.31–0.48 (Teddy, Savoy, Side Lift) in another. The cause is the accordion block (`.eb3d-acc`, `.eb3d-trust`) jumping about 2.3 s after load when Easify injects its options. Other runs measured 0.06. Mobile CLS was about 0. | PDPs · desktop | VERIFIED (lab, varies by run). `results-desktop.json → perf.shifts` | Text and buttons jump while the shopper reads or taps. Above 0.25 is "poor" in Core Web Vitals and can affect Google ranking. | P2 | Reserve height for the Easify block (`min-height` on `#easify-product-options` per template), or render the accordions above the options. | Low–Med | Yes (theme) |
| 10 | **Heavy product pages, mostly from apps.** Mobile PDP: 300–360 requests, 2.5–3.4 MB transferred, about 1.26 MB of JavaScript. Easify Product Options is 412 KB transferred across 7 files (its main bundle is 379 KB compressed; the brief's 692 KB is likely the uncompressed size), and it also loads on /cart (409 KB) where it is not needed. With Lighthouse-style mobile throttling (150 ms RTT, 1.6 Mbps, CPU x4) the PDP DOMContentLoaded is 9.9–10.8 s, the home LCP 5.3 s and the collection LCP 4.9 s. Product-page LCP was 1.5–2.1 s throttled because the image is preloaded (good). | All · mobile | VERIFIED (lab). `SP/perf-mobile-throttled.json`, `results-*.json → net`. GTM, Meta, TikTok, Omnisend, Judge.me tracking and the WhatsApp widget API were blocked by this sandbox, so real weight is **higher** than measured. | Slow interactivity on 4G. Taps on options can lag. | P2 | Stop Easify loading on /cart and non-product templates. Defer the chat and WhatsApp widgets until first interaction. Review the 15 third-party hosts. Compress home hero images (home LCP 5.3 s throttled). | Medium | Yes (theme/apps) |
| 11 | **Phone number is required at checkout.** "Phone [REQUIRED] — In case we need to contact you about your order." | Checkout · both | VERIFIED. `results-*.json → pages.checkout.fields` | Extra friction and a privacy worry. Baymard-type studies often show required phone fields cause drop-off. For a delivered and assembled bed, the delivery team does need a number, so this is a trade-off. | P2 | Keep it required only if the delivery team truly needs it. Then improve the help text to: "Our own delivery team calls you to book a day." Settings → Checkout. | Low | Yes (checkout) |
| 12 | **Delivery timeline promises faster than the policy and shows a Sunday.** On 19 Nov (Thu) the PDP timeline reads Ready 20–21 Nov, Delivered 22–24 Nov (Sun–Tue). The same box says "Free delivery within 3–5 working days", which is 24–26 Nov. Handmade to order ready next day is also doubtful. | All PDPs · both | VERIFIED. `SP/shots/desktop/memory-foam-mattress-uk-fold.png` | Over-promise leads to complaints. It also clashes with the "3–5 working days" claim. | P2 | Make the timeline skip weekends and use the real make time from the owner (for example, ready +2–5 working days, delivered +3–5). | Low | Yes (theme, owner gives lead time) |
| 13 | **Reviews are almost empty.** PDPs show "Product reviews (0) · Store reviews (1)". There are no stars near the title and no review proof on the homepage. | All PDPs, home · both | VERIFIED. `sig.reviews` | Weak social proof for a £400–£900 purchase from a small brand. | P2 | Turn on the Judge.me review-request emails for past orders, and add real customer photos. Never add fake reviews. | Low | Yes (app/email) |
| 14 | **No direct WhatsApp link.** There are no `wa.me` links on any page tested. WhatsApp is only via the Dondy "Chat" bubble, whose API was blocked here, so its content could not be checked. Phone links (`tel:07417439197`) are present on every page. | All · both | VERIFIED (links) / UNKNOWN (widget) | Mobile shoppers who prefer WhatsApp get one generic "Chat" bubble. | P3 | Add a plain "WhatsApp us: 07417 439197" link (`https://wa.me/447417439197`) near the Add to basket button and in the cart. Check on a real phone that the Chat bubble opens WhatsApp. | Low | Yes (theme) |
| 15 | **Mattress page has no delivery-service option.** The Memory Foam Mattress PDP has no Easify options at all (no Room of Choice Drop Off). It adds to basket directly. The BRIEF says the delivery options are "on all products". | /products/memory-foam-mattress-uk · both | VERIFIED. `groups0` empty | Fine for a mattress, but it does not match the BRIEF. A heavy mattress may need room-of-choice delivery. | P3 | Owner decides whether mattresses need Room of Choice Drop Off. | Low | Yes |
| 16 | **Two Product JSON-LD blocks on each PDP** (theme `Product+BreadcrumbList+FAQPage` and a second `Product`, likely from Easify). | PDPs | VERIFIED. `sig.jsonld` | Google may read conflicting product data. | P3 | Turn off the app's schema or the theme's, so there is one Product per page. Check in Rich Results Test. | Low | Yes (theme/app) |
| 17 | **Accessibility (axe-core 4.10, WCAG 2.1 AA, mobile).** Home: `aria-hidden-focus` (hidden slides still focusable). Home, collection and cart: `scrollable-region-focusable` (announcement-bar slider). PDP: vendor line "Eagle Bed" #b08a45 on white is 3.19:1 (needs 4.5:1). Cart: H1 contrast 1.2:1. Images: 0 missing alt on all pages. `<html lang="en">` (better `en-GB`). Delivery Service uses checkboxes that behave like radio buttons (single choice), which screen readers announce wrongly. | Home, collection, Teddy PDP, cart · mobile | VERIFIED. `SP/axe-mobile.json` | Harder for keyboard and screen-reader users. Small legal risk (Equality Act). | P2–P3 | Fix contrast tokens; add `tabindex=-1`/`inert` on hidden slides; set `lang="en-GB"`; ask Easify to use radio inputs for single-choice groups. | Low | Yes (theme) |
| 18 | **Checkout first goes to shop.app.** `/checkout` 302-redirects to `shop.app/checkout/…/shoppay` (Shopify's Shop Pay universal redirect), which then sends non-Shop users back to `www.eaglebed.co.uk/checkouts/cn/…`. The end-to-end time from cart to checkout page was 17 s here, inflated by the sandbox proxy. | Cart → checkout | VERIFIED (redirect) / UNKNOWN (real-world delay; shop.app blocked here) | One extra hop before checkout. This is standard Shopify behaviour and usually fast. | P3 | No action. Check on a real phone that checkout opens in under 3 s. | – | No |

---

## 3. What works well (keep it)

- **Required options block add to basket clearly.** On all 4 beds, pressing "Add to basket" with nothing chosen keeps the basket at 0 and shows "This is a required field" under each missing group (VERIFIED, `SP/shots/desktop/*-add-blank.png`). The mattress, which has no required options, adds straight to the basket.
- **Add-on prices reach the basket correctly.** King Teddy: £467.99 + Metal Ottoman £119.99 + 5ft 1000 pocket mattress £199.99 + Room of Choice Assembly £69.99 = **£857.96**, matching the basket line exactly (VERIFIED, desktop and mobile). Divan Base King + mattress + assembly = £575.97 ✓. The basket lists every choice on the line (`SP/shots/desktop/cloud-teddy-…-after-add.png`).
- **Delivery options are right.** Downstairs Drop Off (free), Room of Choice Drop Off (£29.99) and Room of Choice Assembly (£69.99) are shown on every bed. They act as a single choice (ticking Assembly unticks Downstairs; boxes went `[true,false,false]` → `[false,false,true]`). Assembly is never shown as free. The "Good to know" copy matches the BRIEF.
- **Size changes update the price** in the main price and the sticky bar (for example Divan Base £220.99 → £305.99).
- **No countdowns and no "was" prices.** There is no countdown or "ends in" text on any page, and 0 of 145 products have a compare-at price (VERIFIED from `/products.json`). No line-through prices were found.
- **The EAGLE10 bar is honest and the code works.** "10% off your order with code EAGLE10 at checkout" rotates in the announcement bar. `/discount/EAGLE10` took £30.59 off a £305.99 basket (total £275.40), shown as a cart line (VERIFIED, `SP/shots/desktop/cart-eagle10.png`). The code was created 19 Nov 2026 05:08 UTC. Watch that it does not become a permanent "fake sale" (see the Limitations section).
- **Delivery, returns, phone and finance are above the fold** on all pages through the announcement bar ("Free delivery across Great Britain in 3–5 working days · 14-day free returns", "Call 07417 439197"). On desktop PDPs, "Spread the cost with Klarna or Clearpay" sits right under the price (see #4 for the Clearpay problem).
- **The basket is good.** It has a clear progress line (Basket → Delivery details → Payment), free GB delivery stated, NI £90 stated, 14-day returns, a 5-year frame warranty, Shop Pay express, and a "Complete the room" headboard cross-sell.
- **Product LCP is fast** (lab: 0.75–1.3 s unthrottled, 1.5–2.1 s throttled on PDPs) thanks to the preloaded hero image. Collection and home CLS are about 0.
- **Checkout** is the standard Shopify one-page checkout. It has express checkout, a discount box, guest checkout (Sign in is optional), and Klarna, Shop Pay instalments, PayPal and cards. The country defaults to United Kingdom.
- **Images:** 0 images missing an `alt` attribute on any page tested.

---

## 4. Re-check of the 5 Oct findings (docs/01-showroom-blueprint.md, section 0)

| # | Oct finding | Status 19 Nov | Evidence |
|---|---|---|---|
| 1 | No `<html lang>`, empty canonical before `<head>`, blank preload | **Fixed.** `<html class="js" lang="en">`, one canonical inside `<head>` on every page tested, and the hero preload is a real image (`Gemini_Generated_Image_…webp`). | VERIFIED, `SP/home.html`, `sig.canon/canonInHead` |
| 2 | No Product JSON-LD | **Fixed.** Product + BreadcrumbList + FAQPage are on PDPs. New issue: a second Product block (#16). | VERIFIED `sig.jsonld` |
| 3 | No Breadcrumb/FAQ schema on collections/articles | **Partly fixed.** Collection has BreadcrumbList. Articles were not checked in this task. | VERIFIED (collection) / UNKNOWN (articles) |
| 4 | "Summer sale" countdown + permanent 50% compare-at | **Fixed.** No countdown, 0/145 compare-at prices. The collection intro now says "Shopping for a new bed this Black Friday?" (copy only, no sale claim). | VERIFIED |
| 5 | Mobile funnel leak (77% mobile, 2 orders) | **Still open, with a new cause:** mobile PDP overflow (#1), sticky bar off-screen (#2), invisible title (#3). The sticky bar, the phone link and the delivery/finance lines now exist. | VERIFIED (UI) / HISTORICAL (funnel numbers) |
| 6 | Google Ads auto-tagging / organic drop | Not in scope here (traffic agent, 02-traffic-seo-ads.md). | – |
| 7 | Bot referrers | Not in scope here. | – |
| 8 | 44 thin city pages, duplicate posts | **Improved.** The pages sitemap now lists 1 "deliver…" page. The articles sitemap still has `velvet-bed-frames-uk-style-guide` and `best-velvet-bed-colours-2025` (may be different topics) and 1 wingback guide. Full check belongs to the SEO agent. | VERIFIED (sitemap counts) |

---

## 5. Measurements by page (lab, Playwright Chromium, cache off)

Unthrottled. TTFB / FCP / LCP in ms. Weight = bytes transferred. Requests to sandbox-blocked hosts count as requests but carry 0 bytes.

| Page | Device | TTFB | FCP | LCP | CLS | Requests | Weight | JS | Easify |
|---|---|---|---|---|---|---|---|---|---|
| Home | mobile | 687 | 1,268 | 1,404 | 0 | 219 | 2.28 MB | 621 KB | – |
| Home | desktop | 474 | 1,016 | 1,236 | 0.05 | 228 | 2.08 MB | 617 KB | – |
| Ottoman beds collection | mobile | 244 | 916 | 1,016 | 0.005 | 230 | 2.38 MB | 606 KB | – |
| Ottoman Divan Base | mobile | 242 | 568 | 756 | 0 | 318 | 2.86 MB | 1,264 KB | 412 KB |
| Ottoman Divan Base | desktop | 271 | 584 | 860 | **0.47** | 316 | 2.92 MB | 1,260 KB | 412 KB |
| Cloud Teddy | mobile | 353 | 708 | 892 | 0 | 328 | 2.90 MB | 1,264 KB | 412 KB |
| Cloud Teddy | desktop | 630 | 1,156 | 1,288 | **0.47** | 320 | 2.95 MB | 1,260 KB | 412 KB |
| Savoy Channel | mobile | 324 | 652 | 820* | 0 | 355 | 3.40 MB | 1,229 KB | 412 KB |
| Side Lift | mobile | 306 | 876 | 1,000* | 0 | 362 | 3.42 MB | 1,263 KB | 412 KB |
| Memory Foam Mattress | mobile | 270 | 780 | 780 | 0.001 | 308 | 2.54 MB | 1,263 KB | 412 KB |
| Cart | mobile | 511 | 1,116 | 1,220 | 0.003 | 257 | 2.36 MB | 1,072 KB | 409 KB |
| Checkout (on-domain) | mobile | 149 | 324 | 324 | 0.05 | – | – | – | – |

\* The LCP element was the (invisible) H1 because the product photo is pushed off-screen by the overflow (#1).

Throttled mobile (150 ms RTT, 1.6 Mbps, CPU x4): Home LCP 5,272 ms, load 7.3 s · Collection LCP 4,944 ms · Teddy LCP 1,540 ms, DCL 9.9 s · Savoy DCL 10.8 s · Mattress LCP 2,068 ms, DCL 10.0 s.

Largest scripts on a PDP: Easify bundle 379 KB · Shopify web-pixels 88 KB · portable wallets 83 KB · Dondy WhatsApp widget 70 KB · Shopify chat agent 47 KB · Judge.me 32 KB.

Console errors: 20–80 per page, almost all `ERR_TUNNEL_CONNECTION_FAILED` to hosts this sandbox blocks (googletagmanager, connect.facebook.net, analytics.tiktok.com, omnisnippet1.com, widget-view.dondy.net, tracking.aws.judge.me, shop.app, *.shopifysvc.com, pay.google.com, paypal.com). **No theme JavaScript errors were seen.** Real-browser console state for those third-party scripts is UNKNOWN.

---

## 6. Checklist answers

| Question | Answer |
|---|---|
| Does price update when options change? | Size: yes (main + sticky). Add-ons: no, only an "additional charge of £X" line under the options. The basket total is correct. (#6) |
| Do required options block add-to-cart with a clear message? | Yes. "This is a required field" under each group; basket stays empty. |
| Sticky buy bar? | Exists (`.eb3d-sticky`). Works on the mattress page. Broken (off-screen, never activates) on overflowing bed pages (#2). |
| Delivery / returns / finance above the fold? | Delivery + returns + phone: yes (announcement bar, every page). Finance: desktop PDP yes; mobile PDP below the photo (and the photo is broken, #1). |
| Contact options | `tel:07417439197` on every page; "Call 07417 439197" in the bar and trust list; Dondy "Chat" bubble; no direct WhatsApp link (#14). |
| Trust signals | Handmade in Dewsbury, 5-year frame warranty, 14-day free returns, free swatches. Reviews: 0 product / 1 store (#13). |
| EAGLE10 bar | Present on all pages; code works (−10%). |
| Compare-at / countdown | None. |
| Payment options shown | PDP: Klarna, Clearpay (text), "More payment options" / Buy with Shop. Cart: Shop Pay button, Klarna/Clearpay text. Checkout: Card, Klarna, Shop Pay instalments, PayPal. **No Clearpay at checkout** (#4). PayPal/Google Pay express buttons could not render here (hosts blocked). |
| Checkout friction | Email or phone (required), full address, **phone required** (#11), optional marketing box (unticked by default: good). Guest checkout allowed. |
| `.json` vs page options | `/products/<handle>.json` has only the Size option (5 variants each). Fabric, colour, headboard, base, mattress and delivery live only in Easify. Savoy uses "Single / Small Double / Standard Double / King / Super King" while other beds use "Single (3FT) … Super-King (6FT)". The inconsistent size names matter for Google Shopping and the size filter (P3). No variant has a compare-at price. Fabric spelling: the option says "Conniston", the description says "Coniston", and the description mentions "Chenille", which is not an option (P3 copy fix). |

---

## 7. Suggested order of work (all need owner approval; theme changes on a copy first, owner publishes)

1. #1 + #2 mobile overflow CSS fix, tested on all PDPs at 360 and 390 px (P0, about 1 hour).
2. #3 title colour (P1, minutes).
3. #4 Clearpay: switch it on or remove the claim everywhere (P1, owner decision).
4. #5 Storage-bed headline price and Base Type default (P1, owner price decision).
5. #7 and #8 Easify labels and mattress-size logic; #6 running total.
6. #9 and #10 performance (reserve Easify height, unload Easify from cart, defer chat widgets).
7. #11–#17 friction, claims, accessibility polish.

---

## Limitations

- Lab tests in headless Chromium with iPhone 13 emulation, not a real iPhone or Safari. The overflow (#1) is measured layout, but iOS Safari may show it slightly differently (for example zooming out instead of sideways scroll). Check on a real phone.
- The sandbox proxy blocks shop.app, Google Tag Manager, Meta, TikTok, Omnisend, Judge.me tracking, the Dondy WhatsApp API, PayPal and Google Pay buttons and Shopify's card-field host. Page weight and console-error counts therefore **under-state** the real site. The WhatsApp widget, express wallet buttons and card form could not be tested (UNKNOWN).
- Timings come from one run per page from a data-centre network through a proxy. They are directional, not field data (CrUX). CLS on desktop PDPs varied between runs (0.06 to 0.48).
- Checkout was opened through the on-domain URL that Shopify's shop.app redirect points back to. Shipping methods only show after an address is entered, and nothing was typed, so delivery rates at checkout are UNKNOWN.
- Whether EAGLE10 is time-limited is UNKNOWN (Shopify discounts were not read). If it never ends, "10% off" is in effect the normal price. Keep the wording as a code offer, not a "sale".
- Test baskets were left in throwaway browser sessions. No order, checkout submission or customer data was created.
- Profit impact: UNKNOWN (product costs not known).

## Credits used

OpenRush: **0 credits** (no OpenRush calls). Data came from Playwright on the live site, public `/products/*.json` and `/cart.js`, and axe-core 4.10.2 (npm, run locally).
