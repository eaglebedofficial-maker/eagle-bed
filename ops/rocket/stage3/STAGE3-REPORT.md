# EAGLE BED — PROJECT ROCKET SALES / STAGE 3: WEBSITE CONVERSION DOMINATION

Prepared 19 Nov 2026 by the Manager's report writer. Combines 5 specialist reports (01–05), 7 product investigations, the enquiry templates, the Manager's own checks and a fresh read-only Shopify data pull.
Read-only stage. **No change was made to the website, theme, prices, products, ads or emails.** No customer personal data appears here (order numbers only).

Labels: **VERIFIED** = seen in live data or a live browser test on 19 Nov · **ESTIMATE** = worked out from verified data (method shown) · **UNKNOWN** = we do not have the fact · **RECOMMENDATION** = a proposed change that needs owner approval.

## 0. Verdict in one paragraph

The website loses buyers in three places, and all three are fixable. **First, the product page on Android phones is wider than the screen** (VERIFIED by the Manager with JavaScript switched off: the Side Lift bed page is 1,486 px wide on a 412 px Pixel 7 screen), the product name is white on white on every product page, and the Chat bubble sits on top of the mobile buy buttons. **Second, the price shown is not the price paid**: 16 "storage" beds show a slatted-base price, and add-ons only appear as a total in the basket, which is exactly where paid traffic stops (93 Google Ads baskets → 15 checkouts → 6 orders in 30 days). **Third, trust signals are thin or wrong**: Clearpay is promised on every page but is not offered at checkout, only 2 of 145 products have a review, and 3 Shopify Inbox chat hand-offs never reached HQ (now fixed in the inbox agent). The fixes are mostly small theme and option changes, done on a duplicate theme and published by the owner. With 12–16 orders a month, we will measure "no harm and clearer funnel steps", not promise an uplift.

## 0.1 Key numbers (UK human sessions, bots removed)

Windows: last 30 days (L30) = 20 Oct – 19 Nov 2026 (ShopifyQL `SINCE -30d UNTIL today`, includes part of today). Previous 30 (P30) = 19 Sep – 19 Oct. VERIFIED (ShopifyQL, pulled 19 Nov, read-only).

| Metric | L30 | P30 | Definition |
|---|---|---|---|
| UK human sessions | **1,377** | 2,275 | `human_or_bot_session='human'` and UK |
| Sessions with cart additions | 166 | 98 | session-level |
| Sessions that reached checkout | 45 | 26 | session-level |
| Completed checkouts (tracked) | 12 | 4 | session-level |
| Orders (all Shopify) | **16** | 8 | `FROM sales` |
| Net sales | **£6,857.57** | £2,514.10 | gross − discounts − returns, excl. shipping/tax |
| Conversion A: orders ÷ UK human sessions | **1.16%** | 0.35% | ESTIMATE-grade: 4 orders have no tracked session |
| Conversion B: completed checkouts ÷ UK human sessions | **0.87%** | 0.18% | use this one for funnel comparisons |
| Add-to-cart rate | 12.1% | 4.3% | carts ÷ sessions |
| Cart → checkout | **27.1%** | 26.5% | checkouts ÷ carts |
| Checkout completion | 26.7% | 15.4% | completed ÷ checkouts |
| Revenue per human session | £4.98 | £1.11 | net sales ÷ UK human sessions |

- P30 includes a September product-feed burst (`sag_organic`, likely paid clicks, Stage 1/2). So P30 has more, weaker sessions. Compare rates with care. VERIFIED (source) / ESTIMATE (reading).
- The weakest step is **basket → checkout**: 121 of 166 basket sessions (73%) never reach checkout. VERIFIED.

**By device (L30, UK human).** Orders by device are not in ShopifyQL; "completed" = tracked completed checkouts.

| Device | Sessions | Cart | Checkout | Completed | Add-to-cart | Cart → checkout | Checkout → done | Completed ÷ sessions |
|---|---|---|---|---|---|---|---|---|
| Mobile | 1,157 (84%) | 135 | 36 | 11 | 11.7% | 26.7% | 30.6% | 0.95% |
| Desktop | 202 | 27 | 9 | 1 | 13.4% | 33.3% | 11.1% | 0.50% |
| Tablet | 18 | 4 | 0 | 0 | – | – | – | 0% |
| Mobile P30 | 1,891 | 85 | 21 | 4 | 4.5% | 25.0% | 19.0% | 0.21% |
| Desktop P30 | 342 | 13 | 5 | 0 | 3.8% | 38.5% | 0% | 0% |

VERIFIED. Note: Stage 2 showed 271 desktop sessions because it counted all countries; this table is UK only.

**By source (L30, UK human).**

| Source / medium | Sessions | Cart | Checkout | Completed | Cart → checkout |
|---|---|---|---|---|---|
| google / cpc (Ads, mostly PMax) | 859 | 93 | **15** | 6 | **16.1%** |
| (no UTM: direct, typed, untagged) | 325 | 50 | 27 | 5 | 54.0% |
| chatgpt.com | 166 | 19 | 1 | 1 | 5.3% |
| google / product_sync | 22 | 2 | 0 | 0 | – |
| klarna / referral | 2 | 2 | 2 | 0 | – |

VERIFIED. Paid visitors add to basket at a normal rate but rarely start checkout.

**Top 5 landing products (L30, landing-page attribution only).** "Orders" = completed checkouts in sessions that landed on that page. Product sales from any landing page are shown separately (`FROM sales`).

| Landing product | Sessions | Cart | Checkout | Completed | Product orders, any landing (net £) |
|---|---|---|---|---|---|
| Grand Extra-Tall Panel Bed | 112 | 16 | 1 | 0 | 1 (£539.97) |
| Line Ambassador Bed | 90 | 12 | 1 | 0 | 0 |
| Line Bumper Ottoman Divan Bed | 82 | 13 | 1 | 0 | 0 |
| Ottoman Gas Lift Divan Base | 80 | 5 | 2 | 2 | 4 (£1,399.65) |
| Side Lift Ottoman Storage Base | 64 | 7 | 3 | 1 | 4 (£1,080.48) |

VERIFIED. The three most-visited bed pages produced 45 basket sessions and 0 completed checkouts in 30 days.

**Reviews:** 2 of 145 published products have a review (1 each: Side Lift Ottoman Storage Base, Cambridge Panel Storage Bed) plus 1 store review = **3 reviews, coverage 1.4%**. VERIFIED (Shopify `reviews.rating_count` metafields, Judge.me).

**HQ:** these numbers are saved to HQ `cro/latest` (Conversion dashboard card), with 10 "products needing attention" and 23 open CRO-related tasks in the HQ code queue (Store Designer / CRO 2, Checkout Doctor 14, Product Pages 3, Theme Engineer 4; many are duplicate browser-test requests). VERIFIED.

## 0.2 Manager verification (VERIFIED by Manager, 19 Nov)

1. **Side Lift product page, Pixel 7 viewport, JavaScript DISABLED: page width 1,486 px on a 412 px screen.** With scripts off, blocked third-party scripts cannot be the cause. The overflow is in the theme's own HTML/CSS. This confirms report 01 and **overrules** the "UNVERIFIED, sandbox only" reading in reports 02, 03 and 05. Status: **VERIFIED on Android/Chrome (Chromium)**. iPhone Safari: **UNKNOWN**, to be confirmed by the owner, whose earlier iPhone screenshot looked like it fitted (it may have been a product with 4 or fewer photos, or Safari may lay it out differently).
2. **Side Lift H1 (product title) colour = rgb(255,255,255)** on a white background. VERIFIED.
3. **Inbox agent updated on 19 Nov** to catch Shopify Inbox chat hand-offs and to stop mentioning Clearpay. The social post task also stops mentioning Clearpay. These are the **only** Stage 3 live-adjacent changes: internal automation prompts, **no website change**.

## 0.3 Where the specialist reports disagreed, and the Manager's ruling

| Topic | Reports said | Ruling |
|---|---|---|
| Page wider than phone | 01: VERIFIED cause (CSS), JS off. 02/03/05: UNVERIFIED, sandbox | **VERIFIED on Android** (Manager check, JS off). iPhone: owner check |
| Product reviews shown | 02: 0 of 145 show a review (server-side widget state). 04: 2 product reviews live | **2 products have 1 review each** (metafields). 02 read the page before Judge.me's script loaded |
| Sticky Add to basket | 01: exists, appears late, covered by Chat. 02: never seen | **Exists but late and covered** (01 had Easify rendering; 02 did not) |
| Delivery timeline with weekend dates | 02: still seen. 01/03: not seen today | **UNKNOWN**: owner glances at a product page; remove weekend dates if present |

---

## 1. Full website audit

Source: report 01 (21 findings, 3 devices, 3 products walked to checkout). Severity: P0 stops sales now; P1 big loss or legal risk; P2 friction; P3 polish.

| # | Finding | Label | Sev |
|---|---|---|---|
| 1 | Product pages with 5+ photos (134 of 145) are wider than the phone. Cause: the thumbnail strip forces the page column to its full width (`.eb3d-pdp__grid` 1fr column, `min-width:auto`). Divan Base overflows from a fixed-width price table | VERIFIED (Android) / UNKNOWN (iPhone) | P0 |
| 2 | Product title (H1) white on white, contrast 1.0:1, all product pages | VERIFIED | P1 |
| 3 | Product names on collection cards and "related products" white on light grey (1.2:1); "Your basket" heading 1.2:1 | VERIFIED | P1 |
| 4 | Shopify "Chat" bubble covers the right half of the mobile sticky "Add to basket" and "Checkout securely" buttons; taps open chat | VERIFIED (Chromium) | P1 |
| 5 | "Klarna or Clearpay at checkout" on product pages, basket, announcement bar, Finance page and 16 site pages. Checkout offers card, Klarna, Shop Pay, PayPal. No Clearpay. 0 Clearpay orders ever | VERIFIED | P1 |
| 6 | Main price changes only with size. Add-ons show only as "additional charge £X". King Savoy shows £484.99, basket £794.96 | VERIFIED | P1 |
| 7 | 16 storage-titled listings show a slatted-base or "No Drawers" price; storage +£119.99 to +£189.99, drawers +£19.99 to +£79.99 | VERIFIED | P1 (P0 per product) |
| 8 | Sticky Add to basket switches on only after 3,000–4,250 px and sits below the screen on overflowing pages | VERIFIED (Chromium) | P1 |
| 9 | Price not on the first mobile screen (862–1,932 px down on 664–839 px screens) | VERIFIED | P2 |
| 10 | Mattress size not tied to bed size: a Single base with a 5ft mattress was accepted | VERIFIED | P2 |
| 11 | Colour group labelled "Fabric Type" twice | VERIFIED | P2 |
| 12 | Delivery page omits the three delivery services and promises email tracking (22 of 23 fulfilments have none) | VERIFIED | P2 |
| 13 | Checkout: phone required, delivery shown only after address, guest checkout yes | VERIFIED | P2 |
| 14 | Checkout showed "Credit and debit card payments aren't available right now" in the sandbox | UNKNOWN (very likely sandbox) | P0 if real |
| 15 | Home page 439–451 px wide on phones (category count badges stick out) | VERIFIED (Chromium) | P3 |
| 16 | Search shows no suggestions while typing; Enter works (78 results for "ottoman") | VERIFIED | P3 |
| 17 | Many tap targets under 44 px (breadcrumbs, phone link, swatch dots, footer) | VERIFIED | P3 |
| 18 | No direct WhatsApp (`wa.me`) link anywhere; Dondy widget content UNKNOWN | VERIFIED / UNKNOWN | P3 |
| 19 | "Orthopedic/Orthopaedic" in a mattress name and option (banned medical word) | VERIFIED | P3 |
| 20 | Easify loads on /cart (408 KB) where it is not used; product page JS 1.26 MB | VERIFIED (lab) | P2 |
| 21 | "Downstairs Drop Off" shows no "(Free)" label | VERIFIED | P3 |

What works (VERIFIED): navigation and mobile menu; search results relevant; required options block an empty add with a clear message; basket lists every option with its price and the total matches checkout; GB delivery shows "Free"; no paid extra is pre-selected anywhere; assembly is always a paid choice (+£69.99); returns and warranty on all 145 pages; FAQ schema on all pages; no "was" prices or countdowns.

## 2. Mobile experience audit

84% of UK human sessions are mobile (VERIFIED, L30). Tested in Chromium with iPhone 13 (390x664) and Pixel 7 (412x839) emulation. WebKit (Safari) could not be installed in the sandbox.

| Check | Result | Label |
|---|---|---|
| Page fits the screen | No on 134 of 145 product pages (Android). Side Lift 1,486 px, Savoy 798 px, Cloud Teddy 540 px, Divan Base 441 px. Collections fit | VERIFIED (Android), UNKNOWN (iPhone) |
| Fix tested in test browser | `minmax(0,1fr)` grid column + `min-width:0` + scrollable tables: Side Lift 1,495 → 396 px; Divan 441 → 412 px. Easify adds ~6 px more (needs `max-width:100%`) | VERIFIED (test browser only, not live) |
| Product name visible | No (white on white) | VERIFIED |
| Price on first screen | No on all 3 bed pages | VERIFIED |
| Add to basket reachable | Main button ~2,500–3,200 px down after ~2,000 px of options; sticky bar late and partly covered by Chat | VERIFIED (Chromium) |
| Basket checkout button | Sticky "Checkout securely" partly covered by Chat | VERIFIED (Chromium) |
| Speed (lab, unthrottled) | Home LCP 1.2–2.6 s; product page 305–353 requests, 2.8–3.4 MB, 1.26 MB JS; throttled (Stage 1) product DOMContentLoaded ~10 s | VERIFIED (lab) |
| Text size / focus | Body 16 px; focus ring visible | VERIFIED |
| Two chat bubbles (Shopify Inbox + Dondy WhatsApp) | Compete with the sticky bar for the bottom of the screen | VERIFIED (code) |

Evidence: `shots/site-pix-sidelift-fold.jpg` (photo blank, page too wide), `shots/site-pix-ottoman-fix-sticky.jpg` (Chat over "Add to basket"), `shots/site-pix-col-ottoman-cards.jpg` (card names unreadable), `shots/site-dsk-savoy-fold.jpg` (blank gap where the title should be).

## 3. Product page scores (all 145)

Source: report 02, `product-scores.csv` (one row per product, 20 criteria, top 3 fixes) and `product-scores.json` (with notes per criterion). Score = points ÷ (5 × applicable criteria) × 100. It is a triage tool (RECOMMENDATION), built from VERIFIED page data. Reviews were scored from the server-rendered widget, so the 2 reviewed products are under-scored by about 1 point (ESTIMATE).

**Distribution** (VERIFIED from the CSV): median 71, mean 69.7, range 57–74. 55–59: 1 · 60–64: 6 · 65–69: 49 · 70–74: 89 · 75+: 0. The range is narrow because one template serves all 145 pages: template faults cost every page the same points.

**Groups:** P0 (purchase blocker) 21 · P1 (top commercial weight) 20 · P2 18 · P3 86.

**Weakest criteria across all pages (average of 5):** reviews 1.0 · dimensions 1.98 · mobile 2.0 · storage info 2.61 (storage depth on 0 of 18 storage pages) · title 3.0 (capped: white on white).

**Top 10 scores**

| # | Product | Type | Score | Group | Landings 90d |
|---|---|---|---|---|---|
| 1 | Eagle Imperial Chesterfield Bed | Bed Frame | 74 | P3 | 7 |
| 2 | Grand Extra-Tall Panel Bed | Bed Frame | 74 | P1 | 116 |
| 3 | Amber Sunrise Panel Bed | Bed Frame | 73 | P3 | 2 |
| 4 | Aurora Fan Panel Bed | Bed Frame | 73 | P3 | 0 |
| 5 | Aurora Line Tufted Bed | Bed Frame | 73 | P3 | 1 |
| 6 | Aurora Vertical Panel Bed | Bed Frame | 73 | P3 | 0 |
| 7 | Eagle Monarch Panel Bed | Bed Frame | 73 | P3 | 4 |
| 8 | Elegant Panel Bed | Bed Frame | 73 | P1 | 19 |
| 9 | Fluted Velvet Bed | Bed Frame | 73 | P3 | 8 |
| 10 | Hampton Panel Bed | Bed Frame | 73 | P3 | 1 |

Note: the highest scorer with real traffic, Grand Extra-Tall, still converted 1 of 15 paid baskets. A high score does not mean the page sells; price clarity and mobile layout are template faults that hit every page.

**Bottom 10 scores**

| # | Product | Type | Score | Group | Landings 90d | Main blocker |
|---|---|---|---|---|---|---|
| 1 | Upholstered Ottoman Storage Box | Storage Box | 57 | P0 | 27 | No fabric/colour choice; no size given |
| 2 | Vegas Luxury Bed | Bed Frame | 60 | P0 | 14 | No options at all |
| 3 | Pillow Top Mattress | Mattress | 61 | P3 | 7 | No dimensions, 2 photos |
| 4 | Coca Designer Bed | Bed Frame | 61 | P0 | 5 | No options at all |
| 5 | Aurora Luxury Vertical Panel Bed | Bed Frame | 62 | P0 | 12 | No options at all |
| 6 | Ottoman Gas Lift Divan Base | Ottoman Bed | 63 | P0 | 605 | Text says end-opening; options offer only side opening |
| 7 | Panel Line Headboard – Upholstered Bed Frame | Headboard | 64 | P0 | 18 | Unclear what £90.99 buys |
| 8 | 1000 Pocket Sprung Mattress | Mattress | 65 | P3 | 9 | No dimensions, 2 photos |
| 9 | Multi Mini Line Divan Ottoman Bed | Divan Bed | 65 | P0 | 4 | Headline is slatted base |
| 10 | Grey Button-Tufted Platform Storage Bed | Divan Bed | 65 | P0 | 0 | "with Drawers" but default No Drawers |

The best seller (Ottoman Gas Lift Divan Base) scores 63: only 3 product photos, none open from the end, and the opening-side contradiction. The cheapest fix for the most important page is new photos plus the option fix. RECOMMENDATION.

Full list: `ops/rocket/stage3/product-scores.csv`. Compact list of all 145: Appendix A.

## 4. Ottoman bed optimisation strategy

### 4.1 What the data says (VERIFIED, 90 days, report 02 §5)

| Product | Headline buys | Landings | Carts | Units sold | Net £ |
|---|---|---|---|---|---|
| Ottoman Gas Lift Divan Base | the base itself (£220.99) | 605 | 27 | 7 | £2,666.63 |
| Side Lift Ottoman Storage Base | the base itself (£249.99) | 275 | 19 | 6 | £1,603.38 |
| Cloud Teddy Bouclé Ottoman Bed | slatted base (£376.99) | 124 | 16 | 2 | £977.39 |
| Line Bumper Ottoman Divan Bed | slatted base (£324.99) | 441 | 28 | 0 | £0 |
| 8 other ottoman-named beds | slatted base | 4–28 each | 0–1 | 0 | £0 |

- The two ottoman products that sell are the bases, where **the price shown is the price of what the title names**. VERIFIED.
- Every full "ottoman bed" with a headboard shows a slatted-base price; the ottoman costs +£119.99 to +£189.99 extra and nothing is pre-selected. VERIFIED.
- HYPOTHESIS (not tested): Line Bumper and Cloud Teddy lose buyers when the real price appears. Too little traffic for an A/B test; treat the fix as a price-honesty fix (CMA drip-pricing risk), then monitor.

### 4.2 Strategy (RECOMMENDATION, owner decides)

1. **Price truth first.** For each ottoman-named bed: (a) make the ottoman base the required default and show that price, or (b) rename honestly ("[Design] Bed – Ottoman Storage Option +£119.99") and make Base Type required. Owner decision 14.6.
2. **Fix the best seller's options.** Ottoman Gas Lift Divan Base: confirm end-opening vs side-opening, then make the options match the text (decision 14.12).
3. **Photos that show the storage.** At least 5 real photos per ottoman: closed, open, side, detail, fabric, in a room. 1,500 px+. The best seller has 3.
4. **Owner-measured facts.** Storage depth, lift height and headroom, overall size per bed size, base height, mattress depth limit, platform type. Today all are UNKNOWN. Blank rows say "Ask us: 07417 439197", never a guess.
5. **Cross-links.** End lift ↔ side lift ↔ drawer divan ↔ storage box on every ottoman page.

### 4.3 Standard ottoman page structure (RECOMMENDATION)

| # | Block | Rule |
|---|---|---|
| 1 | Gallery | 5+ real photos incl. **storage open**; AI colour previews labelled "colour preview" |
| 2 | Title (dark ink) | Names an ottoman only if the price includes it |
| 3 | Price + running total | "From £X Single (3FT)"; "Your bed: £X" updates with every paid choice |
| 4 | What you buy | One line: headboard, ottoman base (opening side), mattress not included |
| 5 | Why it helps | Gas struts lift the whole platform; end lift vs side lift in plain words |
| 6 | Storage features | Opening side, mechanism, depth (owner), lift height (owner) |
| 7 | Sizes | Pills with feet + cm; overall size per bed size (owner) |
| 8 | Fabric then Colour | Two steps, labelled "Fabric" and "Colour"; free swatches button beside |
| 9 | Included vs optional | Table: included base/headboard/free downstairs GB delivery; optional mattress (size tied to bed), Room of Choice Drop Off +£29.99, Room of Choice Assembly +£69.99 (optional, never free) |
| 10 | Delivery | Free across Great Britain by our own team, usually 3–5 working days; NI, Jersey, Guernsey, IoM £90; working days only |
| 11 | Returns and warranty | 14-day free returns (unused, original packaging); 5-year frame warranty |
| 12 | Verified specs table | Owner-confirmed rows only |
| 13 | Reviews | Genuine Judge.me reviews only; stars near title once they exist |
| 14 | FAQs | How does it open, which side, what fits inside (measured), mattress depth, stairs |
| 15 | Related | Other storage options |

## 5. Seven priority product investigations

Source: report 03 and `inv-1…inv-7` files. 14 test baskets were built on iPhone 13 emulation and taken to the checkout page (nothing typed, nothing paid). VERIFIED unless marked.

| # | Product | 90d landings / carts / sales | L30 main source (carts → checkouts) | Basket B vs King headline | Key finding | File |
|---|---|---|---|---|---|---|
| 1 | Line Bumper Ottoman | 441 / 28 / 0 | PMax 73 (10 → 1) | +105% | Ottoman not in price; Base optional, nothing pre-selected. A Double with an end-lift base is £605.98, not £415.99 | `inv-1-line-bumper.md` |
| 2 | Line Ambassador | 374 / 26 / 1 | PMax 79 (10 → 1) | +107% | Two colour pickers (Shopify Colour with Cream pre-selected + Easify colour); a test order carried "Grey" and "Latte" | `inv-2-line-ambassador.md` |
| 3 | Stone Premium | 270 / 2 / 0 | 6 sessions | +80% | Traffic was a September feed burst; now ~6 landings a month. Weak photos (WhatsApp images); gold strip +£19.99 not shown on swatch | `inv-3-stone-premium.md` |
| 4 | Cloud Teddy Bouclé | 124 / 16 / 2 | Direct 21 (6 → 3) | +98% | Storage not in price (Stage 1 finding still open); Facebook ad sent 24 sessions, 0 carts | `inv-4-cloud-teddy.md` |
| 5 | Eagle Savoy Channel | 36 / 8 / 1 | Direct 16 (4 → 7) | +95% | Returning buyers re-enter checkout; description offers Chenille, options do not | `inv-5-savoy.md` |
| 6 | Royal Chesterfield | 64 / 11 / 1 | PMax 31 (6 → 1); ChatGPT sold | +115% | Super King £389.99 is cheaper than King £399.99; Diamond Button +£19.99 not shown on swatch | `inv-6-royal-chesterfield.md` |
| 7 | Grand Extra-Tall | 116 / 17 / 1 | PMax 105 (15 → 1) | +131% | Clearest basket leak; "extra-tall" headboard height never stated (same 50/54/60" as every bed); no SKUs | `inv-7-grand-extra-tall.md` |

Common to all 7 (VERIFIED): page price moves only with size; colour group labelled "Fabric Type"; description fabrics do not match the 5 real fabrics; no dimensions in cm; "Pepproyd Street workshop" named in 4 descriptions (BRIEF says Dewsbury only); basket says "Pay in 3 with Klarna or Clearpay". No technical blocker: all 14 baskets added correctly and reached checkout with the same total.

## 6. Checkout audit

### 6.1 What the checkout does (VERIFIED, Pixel 7 and desktop)

- `/checkout` → shop.app → back to `eaglebed.co.uk/checkouts/…` (one extra hop, Shopify standard). Guest checkout yes. Phone required. Delivery methods hidden until an address is typed.
- Payment methods shown: card (5 brands), Klarna, Shop Pay (full or instalments), PayPal. **No Clearpay.**
- Totals in checkout match the basket on every test. No surprise fees between basket and checkout.
- Shop Pay express button in the basket. Apple Pay / Google Pay: UNKNOWN (sandbox blocks them).

### 6.2 Paid traffic: 93 baskets → 15 checkouts → 6 completed (google/cpc, UK human, L30, VERIFIED today)

| Step | Count | Rate |
|---|---|---|
| Sessions | 859 | – |
| Basket | 93 | 10.8% of sessions (normal) |
| Reached checkout | **15** | **16.1% of baskets** (direct visitors: 54%) |
| Completed | 6 | 40% of checkouts |

Friction between "added to basket" and "checkout" (VERIFIED mechanism; effect on drop-off UNKNOWN):
1. **First sight of the real total** in the basket. Savoy King £484.99 on the page → £794.96 basket; Grand King +131% in test basket B.
2. **Storage is extra on storage beds** (+£119.99 to +£189.99), visible only as an option line.
3. **Chat bubble covers the right half of "Checkout securely"** on mobile (84% of sessions are mobile).
4. **Basket heading invisible** (white on light grey).
5. **Clearpay promised in the basket**, absent at checkout.
6. **Heavy basket page** (215 requests, 988 KB JS incl. 408 KB unused Easify) and one shop.app hop.
7. **EAGLE10 code** advertised "at checkout"; no code box in the basket, so the discounted total is not visible before checkout (low risk).

Still UNKNOWN: how many of the 93 were real intent (some may add to see the total because the page does not show it, ESTIMATE); accidental chat taps; real-phone checkout speed; which checkout step loses 9 of 15. To close: custom events `cart_viewed`, `checkout_button_click`, `chat_open`, `sticky_add_click` (Stage 2 tracking plan).

### 6.3 Owner check: "card payments aren't available"

In the sandbox the checkout card field said "Credit and debit card payments aren't available right now". **UNKNOWN, very likely a sandbox artefact**: the card field loads from hosts the sandbox blocks, Stage 1 saw the same, and card orders keep arriving (#1043 on 18 Nov was a card sale). **If it were real it would be P0** (29 of 43 past orders were card). Owner: open checkout on a real phone today and confirm the card number field appears (Owner check 5).

## 7. Review system audit

### 7.1 Today (VERIFIED unless marked)

- 3 reviews in total, all 5 stars, all "Verified": Side Lift Ottoman Storage Base (11 Nov), Cambridge Panel Storage Bed (15 Nov), 1 store review (20 Sep). Coverage 2 of 145 products.
- Google reviews: ESTIMATE 0. 24 honest Google review emails were sent by hand on 10 Nov; 0 replies.
- Judge.me requests appear to fire 14 days after "fulfilled" (ESTIMATE, strong, from review timestamps).
- **"Fulfilled" is not "delivered"**: 16 of the last 18 orders were marked fulfilled within 6 hours of purchase, so Shopify sends "Your order is on the way" on order day and review timers start before the bed exists. No real delivery dates are recorded.
- Good ethics settings: no coupons for reviews, no review gating, auto-publish on, Verified badge on.
- Problems: no stars near the title; widget at the very bottom; US date format; "Write a review" open to **everyone** while our pages say "verified buyers only"; /pages/reviews says "zero published reviews" (wrong).

### 7.2 Ethical collection plan (RECOMMENDATION; DMCC Act 2024 and CMA208 compliant)

1. **Fulfil on dispatch day**, not order day. **Mark delivered** on delivery day (10 seconds on the phone).
2. Judge.me trigger = **Delivered + 5 days**; fallback 10 days after fulfilment; **1 reminder** at 7 days; no third email.
3. **Every buyer gets the same request.** No "were you happy?" screen, no incentives of any kind, no excluding complaint orders.
4. One platform per customer (Judge.me for all; Google for even order numbers, or Judge.me's Google sync). Never re-ask the 24 customers from 10 Nov.
5. "Write a review" = verified buyers only (or label non-buyer reviews).
6. Publish everything except abuse/spam/personal data; log every removal in HQ.
7. Reply publicly to every 1–3 star review within 2 working days (phone the customer first).
8. Show stars under the title only when that product has a review; move the widget up; UK date format. No site-wide star claim until 10+ reviews.
9. Edit the shipping-confirmation email ("Our team will be with you on the date we agreed"; no tracking link when there is none).
10. Fix /pages/reviews and /pages/aftercare-and-feedback text (report 04 §3.6).

Realistic target (ESTIMATE): about 2–3 new reviews a month, ~10 by end of February at current order volume. No target that tempts anyone to cut corners.

## 8. Customer enquiry improvements

### 8.1 Today (VERIFIED, report 04 §5)

- Enquiries arrive in 5 places (Gmail, contact form, Shopify Inbox chat with an AI agent, Dondy WhatsApp bubble, phone). Until today HQ saw 2.
- 14 enquiries since 1 Nov: fabric/swatches 3 (+1 customer fabric), delivery date after order 2, delivery area 2 (+1 likely scam), size/custom 2, assembly 1, trade 1, showroom 1, unknown (Inbox) 2.
- **Reply speed loses sales**: a made-to-measure enquiry from 7 Nov had no reply after 12 days; a contact-form message waited 14 days. The site promises "24 hours" on one page and "two working days" on another.
- Swatch requests convert: enquiry → swatches → order #1043 (£539.97).
- Assembly quoted at £50 cash on 18 Nov (#1043) against the listed £69.99.

### 8.2 Done in Stage 3 (VERIFIED by Manager)

- **Shopify Inbox fix:** the HQ inbox agent now catches Shopify Inbox chat hand-off notifications, so the 3 hand-offs a week no longer vanish. It also no longer mentions Clearpay. Internal prompt change only; no website change.

### 8.3 Next (RECOMMENDATION)

| Item | Detail |
|---|---|
| Templates | `ops/rocket/stage3/enquiry-templates.md`: 16 reply templates (delivery area, delivery date before/after order, fabric, fabric follow-up, own fabric, mattress, assembly, custom size, price, quote follow-up, trade, showroom, payment, returns/warranty, spam check) + 5 review templates. BRIEF facts only; no Clearpay, never free assembly, assembly always £69.99 |
| Reply promise | One promise everywhere: "We reply within one working day, Monday to Friday" |
| Today | Reply to the 7 Nov made-to-measure enquiry and the 19 Nov South West chat lead (T-size, T-delivery-area) |
| One chat | Either turn off Shopify Inbox (keep WhatsApp) or turn off its AI agent; one bubble, placed above the sticky bars |
| "Ask about this bed" | WhatsApp button under Add to basket, prefilled with product and size; "Order free swatches" as a second button |
| Contact form | Add "What is it about?", bed, size, postcode area (first half only) |
| HQ tracking | `enquiries` collection (channel, type, status, first reply time, quote, won/lost; no names stored) + Monday card: enquiry → order in 28 days (closed windows), median first reply |

## 9. Competitor UX benchmark

Source: report 05. **No competitor page could be opened** (proxy blocked all 6 domains); competitor facts are search-index copies of their own pages (crawl date UNKNOWN). Visual items (layout, sticky buttons, basket) are UNKNOWN for rivals.

| Element | Eagle Bed (VERIFIED) | Rivals (indexed text) |
|---|---|---|
| Delivery | Free GB by own team, usually 3–5 working days | Stylo 7–10, UK Beds Direct 7–14, PSCL 5–10 working days |
| Assembly | Optional +£69.99 by own team | Somni and Dunelm flat-pack self-assembly |
| Swatches | Free (but no button) | UK Beds Direct £3.99 each |
| 3D colour preview | Yes | None found |
| Reviews near title | None | PSCL 4.95 from 399 on one bed; Stylo "4.9/5 from 1800+" |
| Storage facts | No cm on Line Bumper / Cloud Teddy | Dunelm storage area + depth; PSCL base height per base type |
| Storage pricing | "Storage Bed" titles default to slatted | PSCL puts "Optional Ottoman Storage" in the name |
| "Was" prices | None (keep it that way) | PSCL, UKBD, Somni use was/reg prices |

Reading: Eagle Bed's offer (speed, own team, assembly, free swatches, 3D preview) is stronger than its page shows. The gaps are reviews, clarity of price and storage facts. Next free step: a 15-minute owner look at 2 rival pages on a real phone (report 05 §3). Ideas I1–I9 use only Eagle facts and generic patterns; nothing is copied.

## 10. Top 20 conversion improvements

Rules: every item needs owner approval; theme work on a duplicate theme, owner publishes. **No uplift is promised.** "Metric to watch" compares 4 weeks before vs after, UK human sessions, same definitions as section 0.1. Effort: S < 1 h, M = half a day, L = 1+ day.

| # | Improvement | Evidence | Label | Metric to watch | Effort | Risk | Approval |
|---|---|---|---|---|---|---|---|
| 1 | CSS overflow fix on product pages (+ table + Easify width) | 1,486 px on 412 px, JS off (Manager) | VERIFIED → RECOMMENDATION | Sweep: page width = screen width on 145/145 pages at 360/390/412 px; mobile product-landing add-to-cart rate | S | Low (CSS only; test all 145) | Owner (A1) |
| 2 | Product title dark ink | rgb(255,255,255) on white | VERIFIED | Contrast check passes; product landing → cart | S | Very low | Owner (A2) |
| 3 | Collection card names, related products, "Your basket" heading dark ink | 1.2:1 contrast | VERIFIED | Collection → product clicks; collection landing add-to-cart (now 10 carts, 0 checkouts per 116 sessions, Stage 2) | S | Very low | Owner (A3) |
| 4 | Move Chat above sticky bars on mobile (or hide on /cart) | Hit-test lands on chat | VERIFIED (Chromium) | Mobile cart → checkout rate (now 26.7%; paid 16.1%) | S | Low | Owner (A4) |
| 5 | Sticky Add to basket shows after ~1,000 px and scrolls to the first missing option | Appears at 3,000–4,250 px | VERIFIED (Chromium) | Mobile add-to-cart rate; sticky taps (new event) | M | Low | Owner (A5) |
| 6 | Clearpay: switch on, or remove from all pages | Not at checkout; 0 orders | VERIFIED | Pages mentioning Clearpay = 0 (or Clearpay at checkout); checkout completion | M (copy on ~20 pages) | Low; legal risk if left | Owner (B3) |
| 7 | Honest pricing/naming of 16 storage-titled listings; Base Type required | Slatted default | VERIFIED | Cart → checkout on these pages; share of storage-bed orders with a lift base; price-surprise messages | M | Medium (higher shown price may cut carts – that is honest) | Owner (B1, B2) |
| 8 | Running total next to price and in sticky bar | £484.99 page → £794.96 basket | VERIFIED | Cart → checkout (paid first) | M | Low | Owner (A6) |
| 9 | Gas Lift Divan Base: options match the real opening | Text end, options side | VERIFIED | Order notes/changes about opening; this page's add-to-cart (80 landings → 5 carts) | S | Low | Owner (C6) |
| 10 | Card payments check on a real phone | Sandbox message | UNKNOWN | Card orders continue | S | P0 if real | Owner check 5 |
| 11 | Name + price line directly under the photo on mobile | Price 862–1,932 px down | VERIFIED | Mobile add-to-cart rate | M | Low | Owner (A7) |
| 12 | Mattress size follows bed size (or warning) | Single base + 5ft mattress accepted | VERIFIED | Orders needing a mattress-size correction = 0 | M | Low | Owner (C2) |
| 13 | Rename colour group "Colour"; align fabric copy with the 5 real fabrics; fix "Charoal", "Tumeric", "Coniston" | Mismatch on all 7 investigated beds | VERIFIED | "Required field" errors (event); fabric questions | S–M | Low | Owner (C3) |
| 14 | Add option sets to Vegas, Coca, Aurora Luxury Vertical Panel, Storage Box | No colour choice | VERIFIED | Add-to-cart on these 4 pages; follow-up calls | M | Low | Owner (C8) |
| 15 | One colour picker on Line Ambassador | Two colours on one test order | VERIFIED | Orders with conflicting colours = 0 | S | Low | Owner (C9) |
| 16 | Owner-measured dimensions and storage facts (+ "mattress not included") | No cm on 0/145 overall sizes; storage depth 0/18 | VERIFIED gap | Size/fit enquiries; add-to-cart on ottoman pages | L (owner measures) | Low (no guesses) | Owner (C1) |
| 17 | Genuine reviews: fulfil on dispatch, mark delivered, Judge.me timing, stars under title | 3 reviews; fulfilled ≈ ordered | VERIFIED | Reviews per month; products with ≥1 review (now 2/145) | S + habit | Low; legal if done wrong | Owner (D1–D4) |
| 18 | "Ask about this bed" WhatsApp + "Order free swatches" buttons | No wa.me link; swatches convert | VERIFIED | WhatsApp clicks and swatch requests per 100 product sessions (new events); enquiry → order | M | Low (owner reply capacity) | Owner (F1) |
| 19 | Delivery page: 3 delivery services with prices; replace "tracking by email"; "Downstairs Drop Off (Free)" label | Page omits them; 22/23 no tracking | VERIFIED | "Where is my order?" messages; delivery-page → product clicks | S | Very low | Owner (E3, A9) |
| 20 | One chat entry point + HQ enquiries tracking + reply within 1 working day | 14-day and 12-day waits; Inbox hand-offs lost | VERIFIED | Median first reply (target ≤ 8 working hours, ESTIMATE); enquiry → order in 28 days | M | Low | Owner (F2, G1) |

## 11. Prioritised implementation queue

Owner agents are HQ agent names. "Done when" is the completion test. Nothing starts without the approval named.

### P0 (this week)

| # | Task | Owner agent | Depends on | Approval | Done when |
|---|---|---|---|---|---|
| P0-1 | Owner real-phone checks (section 15), incl. card payments at checkout | Owner | – | none (reading only) | 5 answers logged in HQ |
| P0-2 | Back up: duplicate the live theme, record IDs (section 12) | Theme Engineer | – | A0 | Duplicate exists; IDs written in HQ worklog |
| P0-3 | CSS overflow fix on the duplicate | Theme Engineer | P0-2 | A1 | 145/145 product pages fit at 360/390/412 px in preview; owner's iPhone + an Android pass the 30-second test |
| P0-4 | Clearpay decision applied (switch on or remove everywhere incl. BRIEF, WhatsApp `/pay`) | Store Designer / CRO + Owner | Owner checks Settings → Payments | B3 | `grep -i clearpay` over live pages = 0, or Clearpay shows at checkout |
| P0-5 | Reply to the 7 Nov custom-size and 19 Nov South West leads; decide #1043 assembly £50 | Sales Closer + Owner | Templates | G2 | Both replied; #1043 note added |
| P0-6 | Gas Lift Divan Base opening: confirm and fix options or text | Product Pages | Owner answer | C6 | Options and text say the same opening |

### P1 (next 2 weeks)

| # | Task | Owner agent | Depends on | Approval | Done when |
|---|---|---|---|---|---|
| P1-1 | Title, card-name and basket-heading colour | Theme Engineer | P0-2 | A2, A3 | Contrast ≥ 4.5:1 on product, collection, basket pages |
| P1-2 | Chat launcher above sticky bars on mobile | Theme Engineer | P0-2 | A4 | Tap test: "Checkout securely" right half opens checkout |
| P1-3 | Sticky bar earlier + scroll to missing option | Theme Engineer | P0-3 | A5 | Bar visible after ~1,000 px on 3 bed pages, real phones |
| P1-4 | Storage-bed pricing/naming on 16 listings | Product Pages + Owner | Owner choice per listing | B1, B2 | Headline price buys what the title names on 16/16 |
| P1-5 | Running total next to price | Theme Engineer + Store Designer / CRO | P0-2 | A6 | Page total = basket total in the Playwright step log |
| P1-6 | Fulfilment practice + Judge.me timing + shipping email text | Owner + Reviews & Trust | – | D1–D3 | Next 5 orders fulfilled on dispatch day and marked delivered |
| P1-7 | Trust page corrections (reviews, aftercare, reply promise, NI/islands, warranty mattress line, refund "courier") | Store Designer / CRO | – | E1–E4 | Text matches BRIEF on all listed pages |
| P1-8 | Company details in footer and Terms | Owner | Company number confirmed | E5 | Registered name, number, office shown |
| P1-9 | One chat entry point | Store Designer / CRO | – | F2 | One chat bubble on the site |

### P2 (weeks 3–6)

| # | Task | Owner agent | Depends on | Approval | Done when |
|---|---|---|---|---|---|
| P2-1 | Mobile name + price under photo | Theme Engineer | P0-3 | A7 | Price visible on first screen at 390x664 |
| P2-2 | Easify: mattress size tied to bed size; "Colour" label; option sets for 4 products; Ambassador single picker | Product Pages | – | C2, C3, C8, C9 | Mismatched mattress blocked/warned; 4 products have colour choice |
| P2-3 | Fabric copy + typos; "Pepproyd Street" → Dewsbury | Product Pages | – | C3 | 5 real fabrics named everywhere |
| P2-4 | Owner-measured dimensions/storage block (ottomans first) | Owner + Product Pages | Measurements | C1 | Table on Divan Base, Side Lift Base, Line Bumper, Cloud Teddy |
| P2-5 | WhatsApp "Ask about this bed" + swatch button + contact form fields | Store Designer / CRO | P1-9 | F1, F3 | Buttons live; events firing |
| P2-6 | Custom events (cart_viewed, checkout_button_click, chat_open, sticky_add_click, enquiry_click) | Tracking & Measurement | – | G3 | Events visible in Shopify Customer Events / GA4 |
| P2-7 | HQ `enquiries` collection + Monday card | Tracking & Measurement | – | G1 | Card shows reply time and 28-day enquiry → order |
| P2-8 | Delivery page services table | Store Designer / CRO | – | E3 | Page lists 3 services with prices |
| P2-9 | Easify off /cart; defer chat widgets | Theme Engineer | P0-2 | A8 | /cart JS down by ~400 KB |

### P3 (later)

| # | Task | Owner agent | Depends on | Approval | Done when |
|---|---|---|---|---|---|
| P3-1 | Tap targets ≥ 44 px; home badge overflow; predictive search | Theme Engineer | P0-2 | A9 | Lighthouse target-size passes |
| P3-2 | New photos: Divan Base (open, end), Stone; label AI colour previews | Owner + Product Pages | Photos | C4 | 5+ real photos on best sellers |
| P3-3 | Collection mapping "More from Divan Beds" on bed frames | Product Pages | – | – | Correct related heading |
| P3-4 | Mattress name without "Orthopaedic" | Product Pages | – | C5 | Name changed (with redirect) |
| P3-5 | Usability round 1 (5 users) | Store Designer / CRO | P1 done | G4 | Notes logged; problems seen by 2+ users fixed |
| P3-6 | Delete old unused themes (15 of 20 slots used) | Theme Engineer | P0-2 | A10 | Fewer than 10 themes; live + backup kept |

## 12. Backup and rollback plan

**Live theme, VERIFIED today (Shopify GraphQL `themes`, read-only):** `gid://shopify/OnlineStoreTheme/212418724171`, name **"Eagle Bed SEO fixes 10 Nov - PUBLISH"**, role MAIN, updated 10 Nov 2026 22:37 UTC.

**Correction:** theme 212291486027 ("Eagle Bed PageSpeed fix 9 Nov - PUBLISH") is **not live**; it is UNPUBLISHED. Do not use it as the "original" for rollback. VERIFIED.

The store holds 15 themes (Shopify limit 20). VERIFIED. Several are old copies; tidy later (P3-6).

### 12.1 Before any change

1. In Shopify → Online Store → Themes, on the live theme choose **Duplicate**. Name it "BACKUP live 212418724171 – [date]". Do not edit it ever.
2. Duplicate again for work: "Rocket S3 – CSS fixes – [date]". All edits go here.
3. Write both theme IDs, names and the date in HQ worklog.
4. Easify and Judge.me settings are app settings, not theme files: screenshot each setting page before changing it.
5. Product data (titles, options, prices): export the affected products (Shopify → Products → Export CSV) before editing.

### 12.2 Test checklist on the work theme (preview link), before the owner publishes

| # | Test | Pass when |
|---|---|---|
| 1 | Desktop 1366 px: home, collection, 3 product pages | Name, price, photos visible; no layout break |
| 2 | Mobile 360, 390, 412 px: same pages, all 145 product pages swept | Page width = screen width; thumbnails scroll inside the strip |
| 3 | Real iPhone (Safari) and real Android (Chrome) | 30-second test passes (section 15) |
| 4 | All variants: each size on 3 beds; each base type, mattress type and size, delivery service | Price and total update; required-field errors still show |
| 5 | Add to basket: main button and sticky button | Item in basket with every option and correct line total |
| 6 | Basket | Heading visible; total = page total; "Checkout securely" tappable on both halves |
| 7 | Checkout transition | Checkout opens with the same total; card field, Klarna, PayPal shown; nothing typed or paid |
| 8 | Chat | Opens from its new position; does not cover buttons |
| 9 | Speed | Product page not slower than before (Lighthouse mobile, 2 runs) |

### 12.3 Rollback

- **Theme:** Shopify → Themes → on "BACKUP live 212418724171 – [date]" choose **Publish**. Takes about a minute. Then check the home page and one product page on a phone.
- **App settings:** restore from the screenshots.
- **Product data:** re-import the exported CSV for the changed products.
- Rollback trigger: any test in 12.2 fails after publishing, card payments fail, or any guardrail in section 13 is breached two weekly checks in a row.

## 13. Conversion experiment roadmap

Source: report 05 §2. **Sample-size reality (ESTIMATE, standard two-proportion test, 95% / 80% power):**

| Metric (baseline) | To detect a 50% change | To detect a doubling |
|---|---|---|
| UK session → order (0.87%) | ~17,800 sessions ≈ 388 days | ~116 days |
| Paid basket → checkout (16.1%) | ~776 baskets ≈ 250 days | ~71 days |
| UK session → basket (12.1%) | ~1,100 sessions ≈ 24 days | ~7 days |

These are detection limits, not forecasts. **A/B tests on orders are not practical** at 12–16 orders a month. So:

1. **Ship the FIX items, then monitor** (no test needed): X1 title, X2 storage price, X11 Clearpay wording, X8 working-day delivery estimate, plus the overflow fix and chat position.
2. **Usability rounds, 5 users each** (own phones, 15-minute task: "find a king ottoman in grey velvet with storage and assembly; tell me the total and delivery; go to checkout but stop"). Round 1 = current site; round 2 after X1/X2/X4/X8; round 3 after X6/X7/X12. Fix anything 2+ users hit.
3. **Before/after monitored rollouts**, 4 weeks each side, UK human sessions, paid and non-paid shown separately, one change per area at least 2 weeks apart, logged in HQ with date and baseline.
4. **Guardrails (pre-registered):** UK checkout → order not below 15% over any 4 weeks; no rise in price-surprise messages; mobile LCP not worse on a real phone; refunds not above the 90-day level.
5. **Decision rule:** keep if the usability problem is gone and no guardrail breached; roll back if a guardrail is breached two weeks running. Report "no harm seen" or "harm seen", never "uplift of X%".
6. **True A/B test** only on add-to-cart, only with an approved split-test app, only for reversible non-compliance changes (for example swatch button wording).
7. **Investigations, not tests:** X9 Line Bumper intent (read PMax search terms), X10 desktop checkout friction (UK desktop: 9 checkouts → 1 order in L30).
8. Session recording (e.g. Microsoft Clarity) only with owner approval, after consent, inputs masked, never on checkout.

| Rank | ID | Change | Type |
|---|---|---|---|
| 1 | X1 | Visible product title | FIX |
| 2 | X2 | Honest storage-base price | FIX |
| 3 | X11 | Finance wording = checkout | FIX |
| 4 | X3 | Mobile sticky Add to basket | VALIDATE (overflow now VERIFIED on Android) |
| 5 | X4 | Running total + basket clarity | VALIDATE |
| 6 | X8 | Delivery estimate in working days | FIX |
| 7 | X6 | Free swatch button | VALIDATE |
| 8 | X7 | "Ask about this bed" WhatsApp | VALIDATE |
| 9 | X12 | Size and storage facts block | VALIDATE |
| 10 | X9 | Line Bumper intent | INVESTIGATE |
| 11 | X5 | Real reviews, then stars | FIX then VALIDATE |
| 12 | X10 | Desktop checkout friction | INVESTIGATE |

## 14. Owner approval list

Answer each with **YES** or **NO** (or a short note). Nothing changes on the live site until you approve and you publish.

### A. Theme CSS fixes (on a duplicate theme, you publish)

0. YES / NO: Duplicate the live theme (212418724171) as an untouched backup and a second copy to work on.
1. YES / NO: Fix the **page overflow** on product pages (grid column + table + Easify width CSS).
2. YES / NO: Make the **product title** dark ink (#161619).
3. YES / NO: Make **collection card names, related product names and the "Your basket" heading** dark ink.
4. YES / NO: Move the **Chat bubble** above the sticky bars on mobile (or hide it on /cart).
5. YES / NO: Show the **sticky Add to basket bar** earlier (~1,000 px) and make it scroll to the first missing option.
6. YES / NO: Show a **running total** ("Your bed: £X") next to the price and in the sticky bar.
7. YES / NO: Put the **name + price** directly under the photo on mobile.
8. YES / NO: Stop loading Easify on /cart and defer the chat widgets.
9. YES / NO: Small polish: "(Free)" on Downstairs Drop Off, 44 px tap targets, home badge overflow, search suggestions.
10. YES / NO: Delete old unused themes after the backup exists (keep live + backup).

### B. Pricing display and naming of storage beds

11. For the ottoman-titled beds whose headline price is a slatted base (Line Bumper, Cloud Teddy, Side Lift Open, Mayfair Ottoman Divan, Mayfair Bumper, Mayfair End-Opening, Florida, Bumper, Multi Mini Line), which fix? **(a)** storage base is the required default and in the headline price, or **(b)** rename to "… – Ottoman Storage Option (+£X)" and make Base Type required. (a / b / per product)
12. YES / NO: For the 6 "with Drawers" listings whose default is "No Drawers", apply the same choice as 11.
13. **Clearpay:** is Clearpay switched on in Settings → Payments? If NO: YES / NO to remove "Clearpay" from all pages, the theme, the WhatsApp `/pay` reply and the BRIEF.

### C. Product data

14. YES / NO: Measure and supply **overall dimensions** per size, base height, storage depth, lift height and mattress depth limit (ottomans first). Unknown rows will say "Ask us".
15. YES / NO: **Mattress size follows bed size** automatically (or a warning when they differ).
16. YES / NO: Rename the colour group to "Colour" and align **fabric copy** with the 5 real fabrics (Plush Velvet, Naples, Galaxy, Conniston, Teddy Boucle); fix typos; replace "Pepproyd Street workshop" with "Dewsbury workshop".
17. **Gemini images:** do the 578 images named "Gemini_Generated…" on 68 products show what you really make? YES / NO. If unsure: YES / NO to label them "colour preview".
18. YES / NO: Rename **"Memory Orthopaedic Mattress"** (and the "Orthopedic" option) to a name without the medical word (with a redirect).
19. **Royal Chesterfield Super King** is £389.99, cheaper than King £399.99. Is that intended? YES / NO (if NO, what is the right price?)
20. **Ottoman Gas Lift Divan Base:** is it made **end-opening** (as the text says) or **side-opening** (as the options say)? END / SIDE / BOTH.
21. YES / NO: Add fabric/colour options to Vegas, Coca, Aurora Luxury Vertical Panel and the Ottoman Storage Box.
22. YES / NO: Line Ambassador keeps **one colour picker** (remove the Shopify Colour option or the Easify one).
23. Panel Line Headboard (£90.99): is it a **headboard** or a **full bed frame**? HEADBOARD / BED.
24. YES / NO: Show the +£19.99 price on the Stone gold strip and Royal Diamond Button swatches.

### D. Fulfilment and review timing

25. YES / NO: Mark orders **fulfilled on dispatch day**, not order day.
26. YES / NO: **Mark delivered** on the day of delivery.
27. YES / NO: Judge.me: request 5 days after delivery, fallback 10 days after fulfilment, 1 reminder at 7 days, write-review = verified buyers only, UK date format, stars under the title, widget higher.
28. YES / NO: Edit the shipping-confirmation and order-confirmation emails (no tracking link when there is none; "we contact you to agree a delivery day").

### E. Trust page corrections

29. YES / NO: Fix /pages/reviews and /pages/aftercare-and-feedback (wrong "zero reviews" and "verified only" statements; illegal-reviews sentence).
30. YES / NO: One reply promise everywhere: "We reply within one working day, Monday to Friday."
31. YES / NO: Delivery page: list the 3 delivery services with prices and replace "tracking information by email" with "we contact you to agree a delivery day"; add Jersey, Guernsey and IoM where only NI is named.
32. YES / NO: Refund policy "two-man courier team" → "our own team"; add the mattress 5-year line to the warranty page.
33. Company details: is **Eagle Bed Ltd, company no. 17084410**, correct? YES / NO. If yes: YES / NO to show name, number and registered office in the footer and Terms.
34. YES / NO: Keep the full workshop address in the footer (recommended).

### F. WhatsApp and chat

35. YES / NO: Add an **"Ask about this bed" WhatsApp button** (07417 439197, prefilled with product and size) and an "Order free swatches" button on product pages.
36. One chat: **(a)** turn off Shopify Inbox and keep WhatsApp, or **(b)** keep Shopify Inbox but turn off its AI agent. (a / b)
37. YES / NO: Add "What is it about?", bed, size and postcode area (first half) to the contact form.

### G. Enquiry tracking and measurement

38. YES / NO: Create the HQ **`enquiries`** tracker (no names stored) and the Monday enquiry card.
39. YES / NO: Honour the £50 assembly quoted in writing on #1043, and quote only £69.99 from now on.
40. YES / NO: Add the custom events (basket viewed, checkout button, chat open, sticky add, enquiry click).
41. YES / NO: Run usability round 1 with 5 recruited users (small voucher).

## 15. Owner checks on a real phone (5 quick checks, about 10 minutes)

Write down the phone model and the date for each.

1. **Page width (iPhone and, if possible, an Android):** open `eaglebed.co.uk/products/side-lift-open-ottoman-bed`. Can you drag the page sideways? Does the first photo show fully? (Android expected: fails today, VERIFIED. iPhone: UNKNOWN.)
2. **Product name:** on the same page, is the bed name visible above the price? (Expected: no.)
3. **Chat over buttons:** add any bed to the basket, go to the basket, tap the **right-hand end** of "Checkout securely". Does checkout open, or chat?
4. **Clearpay:** Shopify admin → Settings → Payments. Is Clearpay listed and switched on? Then look at the checkout payment list.
5. **Card payments at checkout:** on the checkout page (do not pay), is the **card number field** shown, or a message "Credit and debit card payments aren't available right now"? If the message shows on a real phone, tell the Manager at once (P0).

## 16. Limitations

- Lab tests ran in headless Chromium; **Safari (WebKit) could not be installed**, so iPhone layout is UNKNOWN. Android findings match real Chrome (same engine) and were confirmed by the Manager with JavaScript off.
- The sandbox blocks shop.app, Judge.me tracking, Dondy, PayPal, Google Pay, GTM, Meta, TikTok. Card field, wallets, chat widget content and real checkout speed are UNKNOWN.
- **No competitor page was seen directly** (all blocked); competitor facts are indexed text, crawl date UNKNOWN.
- Funnel counts are per session, not per product; product rows are landing-page attribution only. 4 of 16 orders have no tracked session. P30 includes a feed-traffic burst.
- Monthly volumes are small (12–16 orders). No uplift is claimed anywhere.
- Scores are a rule-based triage tool with equal weights.
- Judge.me admin, Shopify Inbox conversations, WhatsApp and phone logs were not readable; review timing is an ESTIMATE.
- Profit impact: UNKNOWN (no product cost data).

## 17. Credits and data used

- **OpenRush: Stage 3 used 4 credits** (1 `inspect_page` call, report 05). **Month total 80 / 2,001**; 400 reserve untouched. This report used 0.
- This report: ShopifyQL × 6 (sessions totals, device, landing page, source; sales totals; sales by product), Shopify Admin GraphQL × 3 (review metafields × 2, themes × 1), HQ reads × 2 (`cro/latest` check, `codequeue`), HQ write × 1 (`cro/latest` set, new document). All read-only except the HQ write. No live store change.

---

## Appendix A. All 145 product page scores (compact)

Sorted by score, then title. Group = priority (P0 blocker, P1 top commercial, P2 low score or traffic, P3 rest). Full criteria and fixes: `product-scores.csv`.

| # | Product | Score | Group |
|---|---|---|---|
| 1 | Eagle Imperial Chesterfield Bed – Button Tufted Upholstered Bed Frame | 74 | P3 |
| 2 | Grand Extra-Tall Panel Bed – Tall Headboard Upholstered Frame | 74 | P1 |
| 3 | Amber Sunrise Panel Bed – Fan Panel Upholstered Bed Frame | 73 | P3 |
| 4 | Aurora Fan Panel Bed – Geometric Upholstered Bed Frame | 73 | P3 |
| 5 | Aurora Line Tufted Bed – Vertical Channel Upholstered Frame | 73 | P3 |
| 6 | Aurora Vertical Panel Bed – Tall Panel Upholstered Bed Frame | 73 | P3 |
| 7 | Eagle Monarch Panel Bed – Tall Panel Upholstered Bed Frame | 73 | P3 |
| 8 | Elegant Panel Bed – Short-Headboard Upholstered Frame | 73 | P1 |
| 9 | Fluted Velvet Bed – Vertical Fluted Upholstered Bed Frame | 73 | P3 |
| 10 | Hampton Panel Bed – Short-Headboard Upholstered Bed Frame | 73 | P3 |
| 11 | Regal Goldline Panel Bed – Gold Pinstripe Upholstered Bed Frame | 73 | P3 |
| 12 | Regal Haven Bed – Rounded Panel Upholstered Bed Frame | 73 | P3 |
| 13 | Regal Luxe Panel Bed – Mid-Height Upholstered Bed Frame | 73 | P3 |
| 14 | Regal Panel Bed – Straight-Edge Upholstered Bed Frame | 73 | P3 |
| 15 | Windsor Button-Tufted Chesterfield Bed – Upholstered Bed Frame | 73 | P3 |
| 16 | Black Piping Contrast Bed – Upholstered Bed Frame | 72 | P2 |
| 17 | Eagle Regal Gold-Trim Bed – Vertical Panel Upholstered Bed Frame | 72 | P1 |
| 18 | Eagle Royal Chesterfield Wingback Bed – Tufted Upholstered Bed Frame | 72 | P1 |
| 19 | Eagle Sunrise Fan Panel Bed – Upholstered Bed Frame | 72 | P3 |
| 20 | Hilton Wingback Bed – Traditional Upholstered Bed Frame | 72 | P1 |
| 21 | Panel Line Border Bed – Upholstered Bed Frame | 72 | P3 |
| 22 | Sunrise Luxury Bed – Upholstered Bed Frame | 72 | P3 |
| 23 | Tower Bed – Tall Headboard Upholstered Bed Frame | 72 | P3 |
| 24 | Ambassador Grand Bed – Upholstered Bed Frame | 71 | P3 |
| 25 | Arizona Luxury Bed – Upholstered Bed Frame, Statement Headboard | 71 | P3 |
| 26 | Black Bumper Bed – Modern Upholstered Bed Frame | 71 | P3 |
| 27 | Black Piping Art Deco Bed – Upholstered Bed Frame | 71 | P3 |
| 28 | Brooklyn Divan Bed – Art Deco Upholstered Divan Bed | 71 | P3 |
| 29 | Bumper Padded Bed – Upholstered Bed Frame | 71 | P2 |
| 30 | Charlie Elegant Bed – Panel Headboard Upholstered Bed Frame | 71 | P3 |
| 31 | Chester Kids Bed – Handmade Upholstered Kids Bed | 71 | P2 |
| 32 | Curved Wingback Bed – Upholstered Fabric Bed Frame | 71 | P1 |
| 33 | Deep Line Luxury Bed – Upholstered Bed Frame | 71 | P3 |
| 34 | Divan Bed with Footboard – Upholstered Divan Bed | 71 | P2 |
| 35 | Double Arrow Bed – Upholstered Bed Frame | 71 | P3 |
| 36 | Eagle Chelsea Panel Bed – Vertical Panel Upholstered Bed Frame | 71 | P2 |
| 37 | Eagle Harlington Wingback Bed – Panel Upholstered Bed Frame | 71 | P3 |
| 38 | Eagle Kensington Chesterfield Bed – Diamond Tufted Bed Frame | 71 | P2 |
| 39 | Eagle Savoy Channel Bed – Channel Tufted Upholstered Bed Frame | 71 | P1 |
| 40 | Eric Wingback Bed – Contemporary Upholstered Bed Frame | 71 | P3 |
| 41 | Finger Panel Bed – Unique Upholstered Panel Bed Frame | 71 | P3 |
| 42 | Florida Panel Bed – Upholstered Panel Bed Frame | 71 | P3 |
| 43 | Florida Wingback Bed – Classic Upholstered Bed Frame | 71 | P3 |
| 44 | Gold Silver Strip Bed – Upholstered Bed Frame | 71 | P3 |
| 45 | Grand Princess Luxury Bed – Tall Upholstered Bed Frame | 71 | P1 |
| 46 | Indigo Line Bed – Panel Headboard Upholstered Bed Frame | 71 | P2 |
| 47 | L.R Panel Bed – Upholstered Panel Bed Frame | 71 | P3 |
| 48 | Level Lines Luxury Bed – Upholstered Bed Frame | 71 | P3 |
| 49 | Liberty Wingback Bed – Classic Upholstered Wingback Bed Frame | 71 | P2 |
| 50 | Line Kids Velvet Bed – Handmade Upholstered Kids Bed | 71 | P1 |
| 51 | Line Wingback Kids Bed – Handmade Upholstered Kids Bed | 71 | P3 |
| 52 | Luxury Mini Line Bed – Upholstered Bed Frame | 71 | P3 |
| 53 | Mayfair Bumper Bed – Upholstered Bed Frame | 71 | P3 |
| 54 | Mayfair Kids Bed – Handmade Upholstered Kids Bed | 71 | P3 |
| 55 | Mayfair Middle Line Bed – Upholstered Panel Bed Frame | 71 | P3 |
| 56 | Mayfair Stud Bed – Chrome Stud Upholstered Bed Frame | 71 | P2 |
| 57 | Mayfair Upholstered Bed – Luxury Bed Frame | 71 | P3 |
| 58 | Mayfair V X Wingback Bed – Upholstered Wingback Bed Frame | 71 | P3 |
| 59 | Mayfair Wingback 2 Line Bed – Upholstered Wingback Bed | 71 | P3 |
| 60 | Mayfair Wingback Bed – Plush Velvet Upholstered Bed Frame | 71 | P3 |
| 61 | Middle Lines Kids Bed – Handmade Upholstered Kids Bed | 71 | P3 |
| 62 | Mini Line Luxury Bed – Upholstered Bed Frame | 71 | P3 |
| 63 | Mini Line Sunrise Bed – Upholstered Bed Frame | 71 | P3 |
| 64 | Mini Line Wingback Bed – Upholstered Bed Frame | 71 | P1 |
| 65 | Mini Line Wingback Kids Bed – Handmade Upholstered Kids Bed | 71 | P1 |
| 66 | Mirror Panel Luxury Bed – Upholstered Bed Frame with Mirror Detail | 71 | P2 |
| 67 | Mirror Strip Sunrise Bed – Upholstered Bed Frame | 71 | P1 |
| 68 | Oxygen Luxury Bed – Upholstered Bed Frame | 71 | P1 |
| 69 | Patti Classic Bed – Upholstered Bed Frame | 71 | P3 |
| 70 | Princess Luxury Bed – Upholstered Bed Frame | 71 | P3 |
| 71 | Rio Ambassador Bed – Upholstered Bed Frame | 71 | P3 |
| 72 | Rio Bumper Bed – Upholstered Bed Frame with Footboard | 71 | P3 |
| 73 | Roman Sleigh Bed – Upholstered Sleigh Bed Frame | 71 | P2 |
| 74 | Romeo Wingback Bed – Upholstered Wingback Bed Frame | 71 | P3 |
| 75 | Roxy Curved Wingback Bed – Upholstered Bed Frame | 71 | P2 |
| 76 | Royal Chesterfield Bed – Button-Tufted Upholstered Bed Frame | 71 | P1 |
| 77 | Sara Grand Luxury Bed – Upholstered Bed Frame | 71 | P3 |
| 78 | Side Line Wingback Bed – Upholstered Bed Frame | 71 | P3 |
| 79 | Small Line Divan Bed – Upholstered Divan Bed UK | 71 | P1 |
| 80 | Square Panel Luxury Bed – Upholstered Bed Frame | 71 | P3 |
| 81 | Star Unique Bed – Upholstered Bed Frame with Panel Headboard | 71 | P2 |
| 82 | Stone Premium Bed – Upholstered Bed Frame | 71 | P1 |
| 83 | Strip Line Bed with Footboard – Upholstered Bed Frame | 71 | P3 |
| 84 | Verona Italian Style Bed – Statement Upholstered Bed Frame | 71 | P3 |
| 85 | Victoria Art Deco Bed – Upholstered Bed Frame | 71 | P3 |
| 86 | William Elegant Bed – Upholstered Panel Bed Frame | 71 | P3 |
| 87 | Wingback Piping Bed – Upholstered Wingback Bed with Contrast Piping | 71 | P3 |
| 88 | Cambridge Panel Storage Bed with Drawers – Upholstered Divan Bed | 70 | P0 |
| 89 | Cloud Teddy Bouclé Ottoman Bed – Gas Lift Storage Bed | 70 | P0 |
| 90 | 3000 Pocket Sprung Mattress – Single to Super King | 69 | P1 |
| 91 | Centre Point Line Bed – Upholstered Bed Frame | 69 | P3 |
| 92 | Chester Chesterfield Bed – Deep Button Upholstered Bed Frame | 69 | P3 |
| 93 | Chesterfield Tufted Bed – Deep Button Chesterfield Bed Frame | 69 | P3 |
| 94 | Eagle Mayfair Panel Bed – Vertical Panel Upholstered Bed Frame | 69 | P3 |
| 95 | Eagle Monarch Two-Tone Frame Bed – Upholstered Contrast Bed Frame | 69 | P2 |
| 96 | Eagle Regency Wingback Panel Bed – Upholstered Wingback Bed Frame | 69 | P3 |
| 97 | Grand Luxury Bed – Oversized Upholstered Bed Frame | 69 | P3 |
| 98 | Luxury Wingback Bed – Upholstered Bed Frame | 69 | P3 |
| 99 | Multi Mini Line Luxury Bed – Upholstered Bed Frame | 69 | P3 |
| 100 | Multi Small Lines Bed – Upholstered Bed Frame | 69 | P3 |
| 101 | Side Lift Open Ottoman Bed – Gas Lift Storage Bed | 69 | P0 |
| 102 | 2000 Pocket Sprung Pillow Top Mattress – Single to Super King | 68 | P3 |
| 103 | Box Panel Upholstered Headboard – Handmade Fabric Headboard | 68 | P3 |
| 104 | Cambridge Curved Headboard – Handmade Upholstered Headboard | 68 | P2 |
| 105 | Eagle Valentina Arch Bed – Double Arch Upholstered Bed Frame | 68 | P3 |
| 106 | Elegant Framed Upholstered Headboard – Handmade Fabric Headboard | 68 | P3 |
| 107 | Elite Horizontal Detail Headboard – Handmade Upholstered Headboard | 68 | P3 |
| 108 | Elite Horizontal Panel Headboard – Handmade Upholstered Headboard | 68 | P3 |
| 109 | Gold V Cross Line Bed – Upholstered Bed with Metallic Strips | 68 | P3 |
| 110 | Harrow Button Panel Headboard – Buttoned Upholstered Headboard | 68 | P3 |
| 111 | Kensington Framed Panel Headboard – Handmade Upholstered Headboard | 68 | P3 |
| 112 | Line Ambassador Bed – Upholstered Bed Frame | 68 | P1 |
| 113 | Linear Panel Upholstered Headboard – Handmade UK Headboard | 68 | P3 |
| 114 | Memory Orthopaedic Mattress – Firm Support Mattress UK | 68 | P1 |
| 115 | Modern Padded Horizontal Channel Headboard – Fabric Headboard UK | 68 | P2 |
| 116 | Modern Wingback Upholstered Headboard – Winged Fabric Headboard | 68 | P2 |
| 117 | Prism Geometric Bed – Angular Upholstered Bed Frame | 68 | P3 |
| 118 | Slim Horizontal Panel Headboard – Low-Profile Upholstered Headboard | 68 | P3 |
| 119 | Trinity Panel Upholstered Headboard – Handmade Fabric Headboard | 68 | P3 |
| 120 | Bumper Ottoman Storage Bed – Gas Lift Ottoman Bed | 67 | P0 |
| 121 | Camden Vertical Panel Upholstered Headboard – 54" Tall Headboard | 67 | P3 |
| 122 | Chester Wingback Headboard – Handmade Upholstered Headboard | 67 | P2 |
| 123 | Divan Storage Base with Drawers – Upholstered Divan Bed | 67 | P0 |
| 124 | Florida Ottoman Bed – Gas Lift Storage Bed with Headboard | 67 | P0 |
| 125 | Haven Upholstered Headboard – Handmade Fabric Headboard | 67 | P3 |
| 126 | Line Bumper Ottoman Divan Bed – Gas Lift Storage Bed | 67 | P0 |
| 127 | Lines Panel Headboard – Handmade Upholstered Headboard | 67 | P3 |
| 128 | Mayfair Bumper Ottoman Storage Bed – Gas Lift Ottoman Bed | 67 | P0 |
| 129 | Mayfair Ottoman Divan Bed – Gas Lift Storage Bed | 67 | P0 |
| 130 | Mayfair Ottoman Storage Bed – End-Opening Gas Lift Ottoman Bed | 67 | P0 |
| 131 | Oxford Panel Storage Bed with Drawers – Upholstered Divan Bed | 67 | P0 |
| 132 | Oxford Wingback Storage Bed with Drawers – Upholstered Divan Bed | 67 | P0 |
| 133 | Side Lift Ottoman Storage Base | 67 | P1 |
| 134 | Sussex Panel Storage Bed with Drawers – Upholstered Divan Bed | 67 | P0 |
| 135 | Memory Foam Mattress – Body-Contouring Mattress UK | 66 | P3 |
| 136 | 1000 Pocket Sprung Mattress – Single to Super King | 65 | P3 |
| 137 | Grey Button-Tufted Platform Storage Bed – Upholstered with Drawers | 65 | P0 |
| 138 | Multi Mini Line Divan Ottoman Bed – Complete Divan Set with Headboard | 65 | P0 |
| 139 | Panel Line Headboard – Upholstered Bed Frame | 64 | P0 |
| 140 | Ottoman Gas Lift Divan Base | 63 | P0 |
| 141 | Aurora Luxury Vertical Panel Bed – Deep-Fill Tall Headboard Bed Frame | 62 | P0 |
| 142 | Coca Designer Bed – Contemporary Upholstered Bed Frame | 61 | P0 |
| 143 | Pillow Top Mattress – Plush Comfort Mattress UK | 61 | P3 |
| 144 | Vegas Luxury Bed – Statement Upholstered Bed Frame | 60 | P0 |
| 145 | Upholstered Ottoman Storage Box | 57 | P0 |

