# Rocket Stage 3, Report 01: Website, mobile and checkout audit (19 Nov 2026)

Roles: Store Designer/CRO, Buyer Walkthrough, Checkout Doctor, Accessibility, Verification/QA.
Scope: brief parts 2 (full website audit), 6 (mobile) and 9 (checkout). Read-only. Nothing was changed on the store.
Method: live site www.eaglebed.co.uk in Playwright Chromium with `devices['iPhone 13']` (390x664), `devices['Pixel 7']` (412x839) and a 1366x800 desktop. Three products were walked end to end on all three devices: Ottoman Gas Lift Divan Base (`ottoman-gas-lift-divan-base`), Side Lift Open Ottoman Bed (`side-lift-open-ottoman-bed`) and Eagle Savoy Channel Bed (`savoy-channel-tufted-bed-frame`). Test baskets were filled and the checkout page was opened. Nothing was typed into checkout. Nothing was submitted or paid.
Screenshots: `ops/rocket/stage3/shots/site-<device>-<page>.jpg` (iph = iPhone 13, pix = Pixel 7, dsk = desktop). Scripts and raw JSON: scratchpad `site3/` (`/tmp/claude-0/-home-user-eagle-bed/4a1dd6da-a4cd-59ea-9c5c-1f83cbb62db3/scratchpad/site3/`, may be cleared).
Stage 1 findings are not repeated in detail. Where a Stage 1 finding was re-tested, the table says so.

---

## 1. Headline

1. **The "page wider than the phone" bug is caused by the theme's own CSS, not by blocked scripts.** It happens with JavaScript fully switched off and with every third-party request blocked. The product photo strip (one 76 px thumbnail per photo, in one row) forces the page column to be as wide as the whole strip. Any product with 5 or more photos overflows a 390 px or 412 px phone: that is 134 of 145 products. This is VERIFIED in Chromium, the engine behind Chrome on Android, Samsung Internet and the Pixel test. It is UNVERIFIED on a real iPhone (Safari uses a different engine, and the owner's screenshot fits). A one-line CSS change fixed it in the test browser.
2. **Product names are invisible in three places, not one.** The product title (H1) on every product page is white on white (contrast 1.0:1). New today: the product names on **collection pages** and in the "related products" row are also white on a light background (1.2:1). Shoppers see photos and prices with no names.
3. **The "Chat" bubble covers the buy buttons on mobile.** It sits on top of the sticky "Add to basket" button on product pages and the sticky "Checkout securely" button in the basket. A tap there opens chat, not checkout. This is new and it sits exactly on the basket → checkout step where paid traffic drops.
4. **Clearpay is still promised and still missing at checkout.** Checkout lists card, Klarna, Shop Pay and PayPal. The product pages, basket, announcement bar and Finance page all say "Clearpay at checkout".
5. **The full price first appears in the basket.** The main price only follows size. A King Savoy shows £379.99 → £484.99 while the shopper builds a £794.96 basket. The add-ons appear only in a small "additional charge" line.

---

## 2. Stage 1 "page wider than phone": cause test

**Verdict: VERIFIED cause (Chromium/Blink). Blocked third-party scripts are NOT the cause. Real iPhone Safari: UNVERIFIED.**

### 2.1 Experiment

Same page, iPhone 13 emulation, three conditions. "scrollWidth" = how wide the page really is. 390 = fits.

| Product (photos) | Normal (sandbox) | JavaScript OFF | All third-party requests aborted | Hide photo gallery | CSS fix applied |
|---|---|---|---|---|---|
| Side Lift Open Ottoman (17) | 1,486–1,495 px | **1,486 px** | 1,495 px | 390–425 px | **390 px** (no JS) / 396 px (with JS) |
| Savoy Channel (9) | 799–1,110 px (varies by run) | 798 px | – | 390–695 px | 390 px (no JS) / 396 px |
| Cloud Teddy (6) | 540 px | 540 px | – | 390–408 px | 390–396 px |
| Chelsea Vertical Panel (5) | – | 454 px | – | 390 px | 390 px |
| Haven Headboard (4) | – | **390 px (fits)** | – | – | – |
| Ottoman Gas Lift Divan Base (4) | 441 px | 441 px | – | 441 px (gallery is not the cause here) | 429 px with grid fix; table fix needed |

Evidence: scratchpad `site3/ctl.js`, `bis.js`, `ov1.js` outputs (VERIFIED, 19 Nov).

### 2.2 What is wide, and why

- The grid rule in `eb3d.css` for screens up to 990 px is `.eb3d-pdp__grid{grid-template-columns:1fr}`. A `1fr` column cannot shrink below the smallest width of its content.
- The gallery contains `.eb3d-thumbs`, a single flex row of 76 px thumbnails with a 10 px gap. It is meant to scroll sideways (`overflow-x:auto`), but the gallery box around it has the default `min-width:auto`. So the whole page column grows to the full strip width: 17 thumbnails = 1,456 px column. Measured: `gridTemplateColumns: "1456px"` on Side Lift and `"768px"` on Savoy (9 thumbnails).
- Rule of thumb, VERIFIED on 5 products: 4 photos fit, 5 or more overflow on both a 390 px and a 412 px phone. **134 of 145 published products have 5 or more images** (`/products.json`, VERIFIED), so almost every product page is affected.
- Ottoman Gas Lift Divan Base (4 photos) overflows for a second reason: a size price table in the description ("From price £220.99, £249.99 …") with fixed-width columns. It is server-rendered, so it also overflows with JavaScript off.
- Easify Product Options adds a small extra overflow (6–18 px) and, in 2 of 4 Savoy runs, a larger one (1,110 px vs 799 px). This part varies by load timing. It is the only part linked to scripts, and Easify loaded normally in the sandbox.
- No canvas, 3D or iframe element was wide. The 3D preview has one canvas, inside the gallery, and it is not the cause.

### 2.3 Why the owner's iPhone may look fine (UNVERIFIED)

- iPhone Safari uses WebKit, not Chromium. WebKit could not be installed in this sandbox (download blocked), so Safari was not tested.
- The screenshot may show a product with 4 or fewer photos (11 products), which fit in every browser.
- **Android buyers use Chrome or Samsung Internet (Chromium).** The Pixel 7 run shows the same overflow (Side Lift 1,486 px, Savoy 798 px, Divan 441 px). Treat it as real on Android until a real Android phone shows otherwise.

### 2.4 Fix tested in the browser (not on the live theme)

```css
@media (max-width:990px){ .eb3d-pdp__grid{grid-template-columns:minmax(0,1fr)} }
.eb3d-pdp__grid > *{min-width:0}
.eb3d-info table{display:block;max-width:100%;overflow-x:auto}
```

Result in the test browser: Side Lift 1,495 → 396 px and Divan 441 → 412 px on Pixel. The thumbnail strip then scrolls inside itself, as designed. The 6 px left over comes from Easify and needs one more `max-width:100%` on `.po-options-root`. Test on a duplicate theme only. The owner publishes.

**30-second owner test on real phones:** open `/products/side-lift-open-ottoman-bed` (17 photos). (1) Can the whole page be dragged left? (2) Does the row of small photos under the main photo scroll on its own, with the page staying still? (3) Is the bed name visible above the price? Do this on an iPhone **and** an Android phone.

---

## 3. Findings

Severity: P0 = stops or blocks sales now; P1 = big loss, or a claim/legal risk; P2 = friction; P3 = polish.
Labels: VERIFIED = measured today in Playwright on the live site. UNVERIFIED = seen only in the sandbox, cause not proven. ESTIMATE = reasoned. UNKNOWN = could not test. RECOMMENDATION = proposed change.
"Metric to watch" uses Shopify's UK human sessions (Stage 2 model). Monthly volumes are small (about 12–16 orders), so compare matched 28-day windows and expect noise. No uplift % is claimed.

| # | URL / device | Exact issue | Customer impact | Evidence | Sev | Proposed solution (RECOMMENDATION) | Metric to watch | How to test |
|---|---|---|---|---|---|---|---|---|
| 1 | All product pages with 5+ photos (134 of 145), plus Divan Base (table) · Pixel 7, iPhone 13 emulation | Page wider than the phone: Side Lift 1,486–1,495 px, Savoy 798–1,110 px, Divan 441 px, Chelsea 454 px. Cause in section 2. **Stage 1 #1 re-tested: cause now VERIFIED (CSS).** | The photo is cropped or blank on the first screen (`site-iph-sidelift-fold.jpg`), and the page can slide sideways. The main photo grows as tall as the strip is wide (1,456 px), so title and price start at about 1,900 px on Side Lift. | VERIFIED (Chromium): section 2 table; `site-iph-sidelift-fold.jpg`, `site-pix-ottoman-nofix-fold.jpg` vs `site-pix-ottoman-fix-fold.jpg`. Real iPhone: UNVERIFIED | **P0** (Android); confirm iPhone | CSS in 2.4 on a duplicate theme, then a 145-PDP sweep at 360, 390 and 412 px | Sweep: scrollWidth = clientWidth on 145/145 PDPs. Business: mobile PDP-landing add-to-cart rate and mobile checkout-reached rate, 28 days before and after | Playwright sweep script (scratchpad `ctl.js`) on the preview theme; owner's 30-second real-phone test (2.4) |
| 2 | Same pages · mobile | Sticky "Add to basket" bar sits partly or fully below the visible screen. Pixel Divan: bar at 818–888 px on an 839 px screen. iPhone Side Lift: bar at 2,452 px. It only switches on after 3,000–4,250 px of scrolling. A tap on it hits the page text underneath, and the add failed. **Stage 1 #2 re-tested.** | The thumb-zone buy button is missing on long bed pages | VERIFIED (Chromium): `fix.js` output "click failed … `<p>` intercepts"; with the CSS fix the bar moves fully on screen (Pixel 759–829 px) | **P1** (fixed by #1) | Fix #1. Then show the bar once the main button scrolls out of view (about 1,000 px), not at 3,000 px | Sticky-bar add-to-cart clicks (needs a GA4/Shopify custom event) | Re-run `fix.js` on the preview theme; real-phone check |
| 3 | All product pages · all 3 devices | Product title H1 `.eb3d-info__title` is `rgb(255,255,255)` on `rgb(255,255,255)`, contrast **1.0:1**, on 3 of 3 products × 3 devices. On mobile, the only visible name is the small grey breadcrumb at the top and the sticky bar. **Stage 1 #3 re-tested.** | On desktop there is a blank gap between "Eagle Bed" and the price (`site-dsk-savoy-fold.jpg`). Shoppers cannot confirm which bed they are on. Fails WCAG 1.4.3 | VERIFIED: `out/pdp-*.json → vis.h1` | **P1** | `.eb3d-info__title{color:#161619}` (the theme ink already used for the price, rgb(22,22,25)). Tested: the CSS in 2.4 plus this rule gives rgb(22,22,25) | axe `color-contrast` = 0 on PDP; real-phone screenshot shows the name | axe-core run plus a screenshot on preview |
| 4 | **New.** `/collections/*` (ottoman, storage, divan, kids) and the "related products" row on every PDP · all devices | Product card names `.eb3d-card__title` are white on light grey `rgb(236,234,230)`, contrast about **1.2:1**. On PDPs the related-products heading and names are blank (white on white). | In the collection grid shoppers see a photo and a price but can hardly read the bed name (`site-pix-col-ottoman-cards.jpg`). Related products show prices with no names (`site-dsk-savoy-related-cards.jpg`). Collection landings: 116 sessions, 10 carts, **0 checkouts** in the last 30 days (Stage 2, VERIFIED); cause UNKNOWN, but this does not help | VERIFIED: `cards2.js`/`cards3.js` output; same 42 low-contrast elements counted on the ottoman, storage and divan collections | **P1** | Same token fix: `.eb3d-card__title{color:#161619}` where the card sits on a light background | Collection → PDP click-through; collection-landing add-to-cart rate | axe on 4 collections; screenshot |
| 5 | **New.** PDP sticky bar and `/cart` sticky checkout bar · mobile | The Shopify "Chat" bubble (`<shopify-chat>`, bottom right) covers the sticky buttons. Cart (Pixel): a hit-test at the right end of "Checkout securely" lands on `SHOPIFY-CHAT`. PDP (with the CSS fix): a tap on the centre of "Add to basket" is taken by `<shopify-chat>` and nothing is added. | A shopper who taps the right half of the main button opens chat instead of checkout or add-to-basket, right at the step where paid traffic drops (#M below) | VERIFIED (Chromium): `site-pix-cart-fold.jpg`, `site-pix-ottoman-fix-sticky.jpg` ("Add" visible, the rest under "Chat"); `fix.js` "shopify-chat intercepts pointer events" | **P1** | On mobile, move the chat launcher up above the sticky bars (for example `bottom: 96px`), or hide it on `/cart` and while the sticky bar is shown. Shopify Inbox settings allow the button position | Cart → checkout rate (google/cpc, mobile); chat opens from `/cart` | Real phone: tap the right side of "Checkout securely"; Playwright hit-test |
| 6 | PDPs, `/cart`, announcement bar, `/pages/finance-options` → checkout · all | Text promises Clearpay: "Spread the cost with Klarna or Clearpay at checkout" (PDP), "Pay in 3 with Klarna or Clearpay" (cart), "Select Clearpay at checkout" (Finance page). Checkout lists: Credit card, Klarna, Shop Pay (pay in full or instalments), PayPal. **No Clearpay** on 2 devices, baskets £495.97 and £794.96. **Stage 1 #4 re-tested.** | A finance shopper finds Clearpay missing at the last step. Misleading-claim risk (CMA / DMCC Act). 0 of 43 orders used Clearpay (Stage 1, VERIFIED) | VERIFIED: `out/pdp-pix-savoy.json → checkout.pay`, `site-dsk-checkout-full.jpg` | **P1** | Owner checks Shopify → Settings → Payments. If Clearpay is off, remove it from theme copy, the Finance page, product descriptions and the facts file, or switch it on | Count of pages that mention "Clearpay" = 0 (or Clearpay shown at checkout) | `grep -i clearpay` over the live site pages; checkout screenshot |
| 7 | All bed PDPs · all | The main price and the sticky price change only with size. Fabric, base, mattress and delivery add-ons only update a line under the options: "Your selections will add an additional charge of £309.97 GBP". Example King Savoy: main price £484.99, basket **£794.96**. Side Lift: £532.99 → basket £842.96. Divan: £305.99 → £495.97. **Stage 1 #6 re-tested; raised to P1** because it sits right before the weak cart → checkout step. | The first full total the shopper sees is in the basket: a "sticker shock" moment | VERIFIED: step logs in `out/log-*` (price after each step) | **P1** | Show "Your total: £X" next to the main price and in the sticky bar, updated on every option (Easify "total price" setting or a small theme script reading the Easify total) | Cart → checkout rate; PDP add-to-cart rate (both should not fall) | Pre/post windows; Playwright step log shows the main price = basket total |
| 8 | Side Lift, Savoy (and other "storage" beds) · all | Base Type is optional and starts at "Slatted Base". Storage costs +£119.99 (Metal Ottoman) to +£189.99 (Divan Ottoman). The name says "Gas Lift Storage Bed". **Stage 1 #5 re-tested: unchanged.** | A shopper expects storage at £415.99 and meets a +£119.99 add-on, or orders a bed with no storage | VERIFIED: `out/pdp-*-sidelift.json → vis.groups` | **P1** | Owner decision: price storage into the headline, or rename so the base price does not promise storage, and make Base Type required | Returns or messages about "no storage"; add-to-cart rate | Copy and option check on preview |
| 9 | All 3 PDPs · iPhone 13 and Pixel 7 | Price is **not on the first screen**. Price top: Divan 896 px, Savoy 1,278 px, Side Lift 1,932 px (with overflow); 862–897 px even after the CSS fix. Screens are 664 px (iPhone 13) and 839 px (Pixel 7). Above it: breadcrumb, "Photos / 3D colour preview" toggle, photo, (invisible) title. Desktop is fine (price at 345–393 px) | The shopper must scroll to see the price and name | VERIFIED: `vis.price.top`; `site-iph-divan-fold.jpg` | **P2** | On mobile, put a compact name + price line directly under the photo, or above it. Shrink the 40 px "Photos / 3D" toggle row into the photo corner | PDP scroll depth; add-to-cart rate (mobile) | Screenshot on preview at 390x664 |
| 10 | Bed PDPs · all | Mattress size does not follow the bed size. In the iPhone run the size tap did not register, and the basket accepted a **Single (3FT) Divan Base with a 5ft King mattress** (£410.97). **Stage 1 #8 re-tested.** | Wrong-size orders and remakes | VERIFIED: `out/pdp-iph-divan.json → add.lines` | **P2** | Easify conditional logic: show only the matching mattress size, or warn when sizes differ | Order notes or changes for mattress size | Add mismatched sizes on preview; it should be blocked or warned |
| 11 | Bed PDPs · all | The colour group is titled "Fabric Type *" a second time (17 colours). **Stage 1 #7 re-tested.** | Confusing; some miss the colour and hit "This is a required field" | VERIFIED: `site-dsk-divan-options.jpg` | P2 | Rename to "Colour" in Easify | Required-field errors per add attempt (needs event) | Visual check |
| 12 | Bed PDPs · all | The Delivery Service shows "Downstairs Drop Off" with no "Free" label; the others show "(£29.99 GBP)" and "(£69.99 GBP)". The options work: one choice at a time, add-on goes £239.98 → £269.97 (+£29.99) → £309.97 (Assembly replaces Drop Off) | Small doubt over whether downstairs is free | VERIFIED: `site-dsk-divan-options.jpg`, step logs | P3 | Label "Downstairs Drop Off (Free)" | – | Visual check |
| 13 | `/pages/delivery-information` · all | The page never mentions Downstairs Drop Off, Room of Choice Drop Off (+£29.99) or Room of Choice Assembly (+£69.99). It says "Our delivery team will bring your bed to your front door" and "you'll receive tracking information by email" (0 of the last 16 orders had tracking: Stage 1, VERIFIED) | Shoppers who check delivery before buying do not learn about the room-of-choice options. The tracking promise is not met | VERIFIED: page text, 19 Nov | **P2** | Add a short table of the three delivery services with prices, and change the tracking line to what really happens (for example "our team calls you to book a day") | Delivery page → PDP clicks; delivery questions by phone | Text check |
| 14 | Checkout · Pixel 7, desktop | Fields: Email or mobile number (required), country, first and last name, address, city, postcode, **Phone (required)** "In case we need to contact you about your order". Delivery method and charge are hidden until an address is typed ("Enter your shipping address to view available shipping methods"). Guest checkout: yes (Sign in optional). Discount box: desktop in the summary; mobile behind "Order summary → Add discount". **Stage 1 #11 re-tested.** | Required phone adds friction. NI/Channel Islands/IoM shoppers see £90 only after typing an address (it is stated earlier in the basket) | VERIFIED: `checkout.inputs`, `site-pix-checkout-fold.jpg`, `site-dsk-checkout-full.jpg` | P2 | Keep phone required only if the van team needs it, with help text "Our delivery team calls to book your day". Add a free GB shipping rate name such as "Free GB delivery by our own team (3–5 working days)" | Checkout → order rate | Real checkout with a test address on a dev store or the owner's own card (owner only) |
| 15 | Checkout · sandbox | Checkout showed "Credit and debit card payments aren't available right now. Refresh this page or try again later." | If real, card buyers (29 of 43 past orders) could not pay | **UNVERIFIED (very likely sandbox):** the card field depends on hosts this sandbox blocks; Stage 1 saw the same; card orders keep arriving | P0 if real | Owner opens checkout on a real phone today and confirms the card field shows | – | Real phone |
| 16 | `/` home · iPhone 13, Pixel 7 | Home page is 439–451 px wide. Cause: the "7 designs" count badges on the category cards (`.eb3d-cat__count`) stick out past the edge | A slight sideways wobble on the home page | VERIFIED (Chromium): `home2.js` | P3 | `.eb3d-cat{overflow:hidden}` or move the badge inside the card | scrollWidth = 390 on home | Playwright |
| 17 | Header search · mobile and desktop | Typing "ottoman" in the search overlay shows only "Popular" chips. No product suggestions appear, and no `/search/suggest` request is made. Pressing Enter works: `/search?q=ottoman` gives **78 results**, relevant first (Side Lift Ottoman Storage Base, Upholstered Ottoman Storage Box, Cloud Teddy Ottoman), with "Filter and sort" | Slower search on mobile; shoppers must press Enter | VERIFIED: `site-iph-search-predictive.jpg`, `site-iph-search-fold.jpg` | P3 | Re-enable Shopify predictive search in the custom overlay | Search → PDP clicks | Type in preview |
| 18 | Many pages · mobile | Tap targets under 44 px: breadcrumb links 18 px tall; colour dots on cards 28x26; "Call 07417 439197" and "Free fabric swatches" links on the PDP 18 px tall; quantity 40x24; footer links 19–21 px; mattress-size checkboxes. The mobile menu items are fine (49–58 px tall). Focus ring is visible (2 px gold outline + purple ring) | Mis-taps for older shoppers | VERIFIED: `taps` in `out/site-*.json` | P3 | Pad these links to 44 px tall (padding, not bigger text) | axe `target-size` | axe and Lighthouse on preview |
| 19 | All pages · all | No direct WhatsApp link (`wa.me`) anywhere and no "WhatsApp" text. Phone `tel:` links: 4–5 per page. Email `mailto:eaglebedofficial@gmail.com` on PDP, contact and delivery pages. Contact page shows phone, email and "Mon-Fri 9AM-6PM". The Dondy chat widget API is blocked here, so its WhatsApp content is UNKNOWN. **Stage 1 #14 re-tested.** | Mobile shoppers who prefer WhatsApp have no direct route | VERIFIED (links) / UNKNOWN (widget) | P3 | Add "WhatsApp us: 07417 439197" (`https://wa.me/447417439197`) near Add to basket and in the basket | WhatsApp chats started | Real phone |
| 20 | PDP option and product names · all | Mattress option "Memory Orthopedic Mattress" and the linked product "Memory Orthopaedic Mattress". The brief bans orthopaedic claims in copy | Claim risk in copy | VERIFIED (text) | P3 (owner/copy decision) | Copy owner reviews the product and option names | – | Text check |
| 21 | Cart and PDPs · mobile | Easify Product Options still loads on `/cart` (408 KB) where it is not needed. PDP JavaScript is 1.26 MB. **Stage 1 #10 re-tested: unchanged.** | Slower pages on 4G | VERIFIED (lab) | P2 | As Stage 1: load Easify only on product templates; defer chat widgets | JS KB on /cart | Network panel |

**Re-checks where the Stage 1 finding has changed:**
- Stage 1 #12 (PDP delivery timeline showing Sunday dates): **no longer shown.** No "Ready / Delivered / Order today" text was found on the 3 PDPs. VERIFIED.
- "Your basket" heading: still white on `#eceae6` (1.2:1). VERIFIED (`cart.h1`).

---

## 4. Walkthrough answers (A–P)

| Step | What we saw (VERIFIED unless marked) |
|---|---|
| A Homepage | Announcement bar rotates "10% off your order with code EAGLE10 at checkout", "Free delivery across Great Britain in 3–5 working days · 14-day free returns", "Handmade in West Yorkshire · Call 07417 439197". Dark hero with a large photo, then the headline "Deep-buttoned, the traditional way". H1 "Handmade Upholstered Beds" contrast 4.24:1. Mobile page is slightly too wide (#16). LCP 1.2–2.6 s unthrottled. `site-iph-home-fold.jpg` |
| B Navigation | Desktop: Beds, Storage Beds, Headboards (drop-downs), Mattresses, Kids Beds, Contact, Finance. Mobile drawer: the same plus "Log in", items 49–58 px tall (good). `site-iph-menu.jpg` |
| C Search "ottoman" | 78 results, relevant first, Filter and sort. No suggestions while typing (#17). |
| D Collections | `/collections/ottoman-beds`, `storage-beds`, `divan-beds`, `kids-beds` all fit the phone (390/412 px). Dark intro, category chips, Filter and "Best selling" sort, then a 2-column grid. Product names hard to read (#4). Copy mentions "Black Friday" (no sale claim). LCP 1.2–1.7 s, CLS ≤ 0.014 |
| E Gallery | "Photos / 3D colour preview" toggle; "See it in your colour" badge; thumbnail strip causes the overflow (#1); "View full size" link |
| F Title visibility | H1 white on white, 1.0:1, 9 of 9 runs (#3). Product card names 1.2:1 (#4) |
| G Price above the fold | Desktop: yes (345–393 px). Mobile: no on all 3 products (#9) |
| H Size | Pill buttons (Single … Super King). Price and sticky price update (Divan £220.99 → £305.99, Side Lift £415.99 → £532.99, Savoy £379.99 → £484.99). Savoy uses different size names ("King", not "King (5FT)") |
| I Fabric / colour | 5 fabrics (Plush Velvet, Naples, Galaxy, Conniston, Teddy Boucle), then 17 colours in a second "Fabric Type *" group (#11) |
| J Base type (storage) | Side Lift and Savoy: Slatted Base (default, £0), Solid Board +£29.99, Metal Ottoman +£119.99, Mesh Metal Ottoman +£149.99, Divan Ottoman Footend Lift +£189.99, Divan Ottoman Side Lift +£189.99 (#8). Divan Base: left or right side opening (no price) |
| K Mattress and delivery | Mattress Type (6 choices incl. "No Mattress"), then Mattress Size 3ft £89.99 … 6ft £149.99 (not linked to bed size, #10). Delivery Service required: Downstairs Drop Off (no price shown, #12), Room of Choice Drop Off £29.99, Room of Choice Assembly £69.99. Single choice works. Main price does not move with add-ons (#7) |
| K Required fields | "Add to basket" with nothing chosen keeps the basket at 0 and shows "This is a required field" under Fabric Type, Headboard Height (Side Lift, Savoy) and Delivery Service. The page scrolls to the first error. Good |
| K Sticky add-to-cart | Exists (`.eb3d-sticky`: name, price, "Add to basket"). Hidden on desktop. On mobile it switches on only after 3,000–4,250 px of scroll, sits below the visible screen on overflowing pages (#2) and is covered by the Chat bubble (#5). Add via sticky failed in every mobile run; the main button worked |
| L Delivery info | `/pages/delivery-information`: free GB, 3–5 working days, NI/Jersey/Guernsey/IoM £90, 14-day free returns. Missing: the three delivery services and their prices (#13) |
| M Basket | Line shows every option with add-on prices, for example "Base Type: Metal Ottoman (£119.99 GBP) · Mattress Size: 5ft King (£119.99 GBP) · Delivery Service: Room of Choice Assembly (£69.99 GBP) · £794.96 each". Summary: Subtotal, "Delivery: Free across Great Britain", Total (= checkout total). Delivery estimate: "typically within 3–5 working days" (no date). EAGLE10: only in the rotating announcement bar ("at checkout"); no code box in the basket. Mobile sticky bar "Order total £X · Checkout securely", partly covered by Chat (#5). Progress line Basket → Delivery details → Payment. Heading "Your basket" invisible. Clearpay text (#6). Shop Pay express button |
| N Checkout load | `/checkout` → 302 to `shop.app/checkout/…` → back to `www.eaglebed.co.uk/checkouts/cn/…` (one extra hop; Shopify standard). On-domain checkout load about 9 s here (sandbox, blocked hosts time out; real time UNKNOWN). Guest checkout: yes. Express: Shop Pay button rendered; PayPal listed, its button blocked here; Apple Pay / Google Pay UNKNOWN (Safari only / blocked). Phone required: yes. Delivery methods: hidden until address. Payment methods: Credit card (+5 brands), Klarna, Shop Pay (full or instalments), PayPal. **Clearpay: absent** |
| O Payment view | Card field showed "not available right now" in the sandbox (#15, UNVERIFIED). "Remember me / Save my information" Shop block and "By paying, you agree to create a Shop account" text below payment. "Pay now £X" button. Totals match the basket |
| P Contact | Phone in the announcement bar, PDP trust list, footer, contact page; email on contact and PDP; hours Mon-Fri 9AM-6PM on the contact page; Chat bubble on every page; no WhatsApp link (#19) |

---

## 5. Paid traffic: 93 carts → 15 checkouts (google/cpc, UK human, last 30 days)

Source: Stage 2 section 8.3, VERIFIED (861 sessions, 93 with cart additions, 15 reached checkout, 6 completed).

### 5.1 Friction between "added to basket" and "reached checkout": VERIFIED today

Every add on a bed page takes the shopper straight to the `/cart` page (no drawer). Then:

| # | Friction point | Evidence | Label |
|---|---|---|---|
| 1 | **First sight of the real total.** The PDP price never includes add-ons. A King Savoy "£484.99" becomes £794.96 in the basket; Side Lift £532.99 → £842.96. | Finding #7, step logs | VERIFIED (mechanism); effect on drop-off UNKNOWN |
| 2 | **Storage is extra on "storage" beds.** +£119.99 to +£189.99 appears as a line in the basket. | Finding #8 | VERIFIED |
| 3 | **Chat bubble covers the right part of the mobile "Checkout securely" button.** 81% of human sessions are mobile (Stage 2). | Finding #5, `site-pix-cart-fold.jpg` | VERIFIED (Chromium) |
| 4 | **Basket heading invisible** ("Your basket" 1.2:1), so the page opens with a blank band. | `cart.h1` | VERIFIED |
| 5 | **Clearpay promised in the basket** ("Pay in 3 with Klarna or Clearpay"). This hits at checkout, not before it, but it can stop finance shoppers who check checkout and leave. | Finding #6 | VERIFIED |
| 6 | **Redirect via shop.app** before the checkout page. One extra hop. | `firstRedirect` | VERIFIED (hop) / UNKNOWN (real delay) |
| 7 | **Heavy basket page**: 215 requests, 2.2 MB, 988 KB JavaScript, including 408 KB of Easify that the basket does not use. | Section 6 | VERIFIED (lab) |
| 8 | **EAGLE10** is advertised as "at checkout", but there is no code box in the basket, so a shopper cannot see the discounted total before checkout. Low risk (the code is in the bar). | Cart text | VERIFIED |

Not friction (checked): the basket shows all options and add-on prices; Subtotal = Total = checkout total; GB delivery shows "Free"; NI £90 is stated; the checkout button text is clear; quantity and remove work; no surprise fees appear between basket and checkout.

### 5.2 UNKNOWN (cannot be closed from the site alone)

- How many of the 93 "cart" sessions were real intent. Some may come from PMax product landings where shoppers add to see the total because the PDP does not show it (ESTIMATE, not proven).
- Whether shoppers tap the Chat bubble by accident on the cart (no chat-open event by page).
- Real-phone checkout load time and whether the shop.app hop is slow on iOS.
- Whether Apple Pay shows in the basket and checkout on real iPhones.
- Whether Shopify counts "reached checkout" correctly when consent is refused (Stage 2: 4 orders had no session).
- Which step inside checkout loses the 9 of 15 who reached it and did not finish (no field-level checkout data).
- **To close these:** fire custom events `cart_viewed`, `checkout_button_click`, `chat_open` (with page) and `sticky_add_click` through Shopify Customer Events (Stage 2 tracking plan). Then compare `checkout_button_click` with `checkout_started` for google/cpc.

---

## 6. Mobile performance (lab, unthrottled, cache off, one run per page type)

Today's numbers match Stage 1 within about 5%, so Stage 1's throttled figures (150 ms RTT, 1.6 Mbps, CPU x4) still apply: home LCP 5.3 s, collection LCP 4.9 s, PDP DOMContentLoaded 9.9–10.8 s. VERIFIED (lab). Field data (CrUX) UNKNOWN.

| Page | Device | TTFB ms | FCP ms | LCP ms | CLS | Requests | Weight | JS | Easify |
|---|---|---|---|---|---|---|---|---|---|
| Home | iPhone 13 | 627 | 2,564 | 2,564 | 0 | 214 | 2.28 MB | 623 KB | – |
| Home | Pixel 7 | 538 | 1,168 | 1,248 | 0 | 215 | 2.08 MB | 619 KB | – |
| Search "ottoman" | iPhone 13 | 815 | 1,352 | 1,744 | 0.033 | 234 | 2.05 MB | 613 KB | – |
| Collection ottoman | iPhone 13 | 302 | 1,092 | 1,312 | 0.005 | 220 | 2.36 MB | 608 KB | – |
| Collection kids | iPhone 13 | 285 | 972 | 1,288 | 0.005 | 215 | 1.99 MB | 610 KB | – |
| PDP Divan Base | Pixel 7 | 399 | 940 | 1,164 | 0 | 305 | 2.84 MB | 1,261 KB | 411 KB |
| PDP Side Lift | Pixel 7 | 392 | 940 | 1,216* | 0 | 353 | 3.40 MB | 1,264 KB | 411 KB |
| Cart (with item) | Pixel 7 | 291 | 620 | 728 | 0.006 | 215 | 2.23 MB | 988 KB | 408 KB |
| Delivery info | iPhone 13 | 262 | 760 | 800 | 0.003 | 186 | 1.45 MB | 605 KB | – |
| Checkout | Pixel 7 | – | – | – | – | – | – | – | load event about 9 s in the sandbox (UNKNOWN real) |

\* The LCP element was a text paragraph because the photo is pushed off-screen by the overflow (#1).
Desktop CLS on PDPs: not re-measured; Stage 1 found 0.06–0.48 by run (Easify injects late).
Blocked hosts (GTM, Meta, TikTok, Omnisend, Judge.me tracking, Dondy, shop.app, PayPal, Google Pay) carry 0 bytes here, so real weight is **higher**.

---

## 7. Assessments

- **Sticky add-to-cart: high value, currently not working on mobile bed pages.** On long bed pages, Add to basket is about 3,000 px down, after roughly 2,000 px of options (the options block alone is about 1,960 px tall on a phone). A working sticky bar is the main way a thumb reaches the button. Today it switches on late, sits below the screen on overflowing pages and is covered by Chat. Fix #1, show it earlier, and move Chat. When the required options are empty, a sticky tap should scroll to the first missing option (the main button already does this).
- **Expandable info sections: good structure.** Description, Delivery and returns, Delivery day and care, The Eagle Bed promise. Description is open by default and long (two near-duplicate paragraphs about gas lifts on the Divan Base). RECOMMENDATION: open by default only a 3-line summary, and keep long copy collapsed.
- **Page crowding (mobile PDP):** breadcrumb, a 40 px Photos/3D toggle, "See it in your colour" badge, the photo, then an invisible title, then the price at about 860–900 px. Then 6 option groups and about 22 fabric/colour swatches. The trust list (free delivery, 5-year warranty, handmade, Klarna/Clearpay, swatches, phone) is useful but sits below the options. RECOMMENDATION: name + total price + "Free GB delivery, 3–5 working days" directly under the photo; the trust list next to the Add to basket button.
- **Accessibility:** contrast failures on the PDP title (1.0:1), card titles (1.2:1) and basket heading (1.2:1). Focus ring visible and strong. Mobile menu targets fine; many small links (#18). No text under 12 px found. Stage 1 axe items (hidden focusable slides, `lang="en"`, checkboxes used as radio buttons, gold vendor text 3.19:1) were not re-run.
- **Readable text:** body text 16 px on mobile; descriptions readable. Option labels wrap to 3–4 lines ("Divan Ottoman left side opening") in narrow tiles.

---

## 8. Suggested order (all need owner approval; duplicate theme first, owner publishes)

1. CSS overflow fix (#1), which also helps #2 and #9. Sweep all 145 PDPs at 360/390/412 px.
2. Colour token for the H1 and card titles (#3, #4). Minutes.
3. Move the Chat launcher above the sticky bars on mobile (#5).
4. Owner: Clearpay switch or copy removal (#6). Owner: check the card field on a real phone (#15).
5. Running total next to the price and in the sticky bar (#7); storage-bed base decision (#8).
6. Mobile name/price under the photo (#9); delivery-service table on the delivery page (#13); "(Free)" label (#12).
7. Easify fixes (#10, #11); then P3 polish.

---

## Limitations

- Lab tests in headless Chromium with iPhone 13 and Pixel 7 emulation. **WebKit (Safari) could not be installed here**, so iPhone results show Chromium layout with an iPhone screen size. Android results are the closer match.
- The sandbox proxy blocks shop.app, Shopify telemetry, GTM, Meta, TikTok, Omnisend, Judge.me tracking, Dondy (WhatsApp widget), PayPal and Google Pay. The card field, wallet buttons, WhatsApp widget, real checkout speed and Apple Pay are UNKNOWN.
- iPhone-emulated sessions could not load a second page once Shopify cookies were set (proxy tunnel errors, sandbox only). So the iPhone basket and checkout were not opened. Basket and checkout were observed on Pixel 7 and desktop. One iPhone size tap did not register (test coordinates; not reproduced as a site fault).
- `/pages/delivery` returned 429 (rate limit) once during parallel tests; the real page is `/pages/delivery-information`.
- One run per page for timings; directional only. Funnel numbers are from Stage 2 and are small.
- Checkout delivery rates need an address, which was not typed. Profit impact UNKNOWN.
- Test baskets were left in throwaway browser sessions. No order, form submission or customer data was created. No live change was made.

## Credits used

OpenRush: **0 credits** (no OpenRush calls; budget 0). Data came from Playwright on the live site, public `/products.json`, `/cart.js` and page HTML, and Stage 1 and Stage 2 files.
