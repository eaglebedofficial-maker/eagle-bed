# Stage 3, parts 3, 4 and 7: product page scores, ottoman strategy and product page design system

Prepared 19 Nov 2026 by Product Pages, Store Designer/CRO and Verification. Read-only work. Nothing on the live site was changed.

Files:
- `ops/rocket/stage3/product-scores.csv`: one row per product (handle, title, type, score, priority, 20 criteria, sessions, top 3 fixes).
- `ops/rocket/stage3/product-scores.json`: the same, plus a note for every criterion explaining the points, the blockers and the commercial weight.
- Screenshots: `ops/rocket/stage3/shots/pp-mobile-*-fold.jpg` (11 iPhone 13 first screens, 15–23 KB each).

Labels: VERIFIED = seen in live data today. ESTIMATE = a calculation from verified data. UNKNOWN = we do not have the fact. RECOMMENDATION = a proposed change, needs owner approval.

---

## 1. Summary

1. **All 145 published products scored** (VERIFIED data, scoring is a RECOMMENDATION tool, not a fact). Median 71/100, range 57–74. The range is narrow because one product page template serves all 145 pages. Template faults cost every page the same points.
2. **The 5 biggest template-wide gaps** (VERIFIED): no product reviews on any page (0 of 145 show a product review); title white on white (11 of 11 sampled pages); no overall bed dimensions on any page; Clearpay promised on all 145 pages (not confirmed); main price does not change when add-ons are chosen.
3. **21 products are P0** (purchase blockers, VERIFIED from live option data):
   - 16 listings promise storage or drawers in the title, but the headline price is for a slatted base or "No Drawers". The storage costs extra: +£119.99 to +£189.99 for ottoman bases, +£19.99 to +£79.99 for drawers.
   - 4 products have no fabric or colour choice on the page at all: Vegas, Coca, Aurora Luxury Vertical Panel and the Ottoman Storage Box.
   - **Our best seller, the Ottoman Gas Lift Divan Base, has a contradiction.** The description says "end-opening", but the only Base Type choices are "left side opening" and "right side opening". The owner must confirm which is true.
   - "Panel Line Headboard – Upholstered Bed Frame" (£90.99) is typed as a headboard but described as a full bed frame. It is unclear what the price buys.
4. **What works** (VERIFIED): no paid extra is pre-selected anywhere; the only default in the options is "No Mattress" at £0. Assembly is always a paid choice (+£69.99), never free. Returns (14 days) and the 5-year warranty are on all 145 pages. All images have alt text. All 145 pages offer free swatches.
5. **Ottoman strategy:** the two ottoman products that sell are the two bases (£220.99 and £249.99). For both, the price shown is the price of what you buy. Six of the eight "ottoman bed" listings with a headboard show a slatted-base price, and together they had 0 sales in 90 days. Line Bumper alone had 441 landings and 28 carts. The price surprise is a HYPOTHESIS, not tested. Section 5 gives one standard page structure. Storage depth, lift height and mechanism specs are UNKNOWN. The owner must supply them.

---

## 2. How the score works (rubric)

Each product gets 20 criteria × 0–5 points. Missing information scores 0. When a criterion does not apply (N/A), it is left out and the score is rescaled: **score = points earned ÷ (5 × applicable criteria) × 100**, rounded.

Sources per product (all VERIFIED, 19 Nov 2026):
- `products.json?limit=250`: 145 products, all on page 1.
- `/products/<handle>.js`: image sizes and alt text.
- One desktop fetch of each live page, about one request a second. This gave the h1, price, trust list, accordions, description and Judge.me widget state. It also gave the Easify option-set data embedded in the page: group names, required/optional, add-on prices and `is_default` flags.
- Stage 2 `product-intel.json`: landing sessions, carts and units for the last 90 days.

| # | Criterion | How points are given (exact rule) | N/A when |
|---|---|---|---|
| 1 | Title clarity | Start at 5. −1 if over 70 characters. −1 if it does not say what the product is. −1 if it uses "Orthopaedic", a banned medical word. −2 if it is a headboard titled "bed frame". **Capped at 3 on every page, because the h1 is white on white.** This was VERIFIED on 11 of 11 sampled pages, and there is one template. | never |
| 2 | Photo count | 1 point per real product photo, maximum 5. Shared generic images (fabric guide, swatch chart, delivery banner, colour chart) are not counted. | never |
| 3 | Image quality | Up to 3 points for the share of product photos with a longest side of at least 1,500 px. +2 if every image has alt text and all alt texts are different (+1 if all filled but repeated). | never |
| 4 | Description | 3 points for 300+ words (2 for 150+, 1 for 50+). +1 for 3+ headings. +1 for a "Key features" list. −1 if the text has a risky claim: Clearpay (unconfirmed), a link to a product named "Orthopaedic", or "best" in link text. | never |
| 5 | Dimensions | Beds: 5 = overall bed dimensions; 3 = headboard height plus mattress-size cm; 2 = one of those; 1 = feet sizes only; 0 = none. Mattresses: 3 for size in cm, +2 for depth. Storage box: 5 if box size given. | never |
| 6 | Mattress compatibility | Beds: 3 = "takes a standard UK mattress" (or similar), +2 if a mattress depth limit is stated. Headboards: 4 = says how it fits (divan, struts, wall-mounted). Mattresses: 3 = which beds it fits, +2 for depth. | storage box |
| 7 | Storage info | 2 = how it opens (gas lift, side/end, drawers, hinged lid). +1 = what it is for. +2 = storage depth or capacity stated as a measured fact. | products without storage, ottoman, drawers or gas lift in the title or type (127 products) |
| 8 | Material | Beds: 3 = fabrics named, +2 = frame material stated. Mattresses: 3 = springs/foam, +2 = layers or cover. Our own wording is taken as stated, not checked. | never |
| 9 | Colour/fabric options | 4 = an Easify fabric and colour choice on the page, +1 = free swatches offered. 1 = swatches only, with no option to pick a colour. | mattresses |
| 10 | Variants sensible | Start at 5. −2 if prices do not rise with size. −1 if size names lack feet (e.g. "Single" instead of "Single (3FT)"). −1 if colour groups are labelled "Fabric Type". −1 if mattress size is not tied to bed size. −1 for fewer than 3 sizes. −2 for the end-lift base offered only with side-opening choices. | never |
| 11 | Delivery | 3 = free GB delivery in 3–5 working days stated on the page. +2 = Delivery Service choice with prices. −1 on every page because the delivery timeline shows weekend dates and "Order Ready" the next day (Stage 1 #12; seen again today: "Delivered 22 Nov – 24 Nov"). | never |
| 12 | Assembly | 4 = "Room of Choice Assembly +£69.99" shown as a paid choice. +1 = also explained in the text. Headboards: 2 if fitting is explained but there is no option. 0 = no information, or assembly called free. | mattresses, storage box |
| 13 | Returns | 4 = 14-day free returns stated. +1 = link to the returns policy. | never |
| 14 | Warranty | 5 = 5-year warranty or guarantee stated, else 0. | never |
| 15 | Trust | 1 point each: handmade/workshop, phone number, payment options, swatches, family-run. −1 for the unconfirmed Clearpay claim. | never |
| 16 | Reviews | 5 = 10+ product reviews; 4 = 5–9; 3 = 2–4; 2 = 1; 1 = 0 product reviews but the store-review fallback shows; 0 = nothing. | never |
| 17 | Mobile presentation | **Template-level, the same for all 145 pages:** 2/5. See section 3. | never |
| 18 | Add-to-cart visibility | 0 = no button. 4 = button present with at most 1 always-required option before it. 3 = more required options before it. The button is below the first mobile screen on every sampled page. | never |
| 19 | Pricing clarity | Start at 4: −1 template-wide because the main price does not update with add-ons. Set to 1 if the title promises storage or drawers but the headline price is for "Slatted Base" or "No Drawers". Set to 1 if the title mixes "Headboard" and "Bed Frame". −2 if a paid extra is pre-selected (none found). | never |
| 20 | Checkout accessibility | 4 = Add to basket present, plus guest checkout, card, Klarna, PayPal and Shop Pay (Stage 1 VERIFIED). −1 for the Clearpay mismatch is already inside the 4. −2 more if there is no fabric choice, because the order then needs a follow-up call. | never |

**Commercial weight** (used for P1): 90-day landing sessions + 40 × net units sold + 3 × landing sessions with a cart. ESTIMATE of commercial potential from Stage 2 data.

**Priority groups:**
- **P0** = a purchase blocker on the page: headline price does not match the title, no colour/fabric choice, no add to basket, or a contradiction in what is sold.
- **P1** = the top 20 non-P0 products by commercial weight.
- **P2** = score under 60, or 20+ landing sessions in 90 days.
- **P3** = the rest.

---

## 3. Mobile check (iPhone 13, Playwright, 11 representative pages)

One template serves all 145 pages: `template--33623068639563__main` and Easify `template = 'product'` on every page (VERIFIED, 145 of 145). The result below is therefore applied to all 145 products as a template-level score (criterion 17 = 2/5, criterion 18 = 3–4/5).

| Product | Page width in sandbox (px, phone 390) | h1 white on white | Title top (px) | Price top | Add to basket top | Sticky bar seen after scroll |
|---|---|---|---|---|---|---|
| ottoman-gas-lift-divan-base | 441 | yes | 814 | 896 | 2,561 | no |
| side-lift-ottoman-gas-lift-storage-bed | 1,321 | yes | 1,711 | 1,760 | 3,168 | no |
| cloud-teddy-boucle-ottoman-gas-lift-storage-bed | 540 | yes | 937 | 1,020 | 2,893 | no |
| line-bumper-ottoman-divan-bed | 712 | yes | 1,109 | 1,192 | 2,970 | no |
| savoy-channel-tufted-bed-frame | 1,110 | yes | 1,195 | 1,278 | 2,984 | no |
| amber-sunrise-panel-bed-frame | 1,350 | yes | 1,367 | 1,416 | 3,085 | no |
| divan-drawer-storage-base | 884 | yes | 1,281 | 1,330 | 3,234 | no |
| chester-wingback-panel-headboard | 972 | yes | 1,307 | 1,390 | 2,283 | no |
| 3000-pocket-sprung-mattress-uk | 390 | yes | 721 | 837 | 1,330 | no |
| line-kids-upholstered-bed | 540 | yes | 937 | 1,020 | 2,841 | no |
| upholstered-ottoman-storage-box | 390 | yes | 721 | 804 | 1,091 | no |

What this means:
- **Title white on white: VERIFIED on 11 of 11 pages.** Computed colour rgb(255,255,255) on rgb(255,255,255). This matches Stage 1 #3 and the owner's screenshot, which did not clearly show the title. Treat it as **likely on real phones**.
- **Sideways overflow: UNVERIFIED.** Pages were 441 to 1,350 px wide in the sandbox. Run to run, the widths matched Stage 1. But the sandbox blocks shop.app, Judge.me and other third-party scripts, Easify did not render here (option block height 0 on all 11), and the owner's own iPhone shows the page fitting the screen. This is not scored as a fault.
- **Title, price and Add to basket sit below the first screen.** iPhone 13 shows 664 px of page. Even on the two pages with no overflow (mattress and storage box), the title starts at 721 px and Add to basket at 1,091–1,330 px. VERIFIED for those two pages. On the bed pages, the real distance will be larger once Easify draws its option groups. ESTIMATE.
- **The sticky add-to-basket bar was never seen**, even on the 390 px pages after scrolling 2,500 px. UNVERIFIED on a real phone. Owner check.
- Screenshots: `shots/pp-mobile-<handle>-fold.jpg`.

---

## 4. Score tables

### 4.1 Score distribution (145 products)

| Score | Products |
|---|---|
| 55–59 | 1 |
| 60–64 | 6 |
| 65–69 | 49 |
| 70–74 | 89 |
| 75+ | 0 |

Median 71, mean 69.7. No page reaches 75 until the template faults are fixed (title, reviews, dimensions, timeline, running total). ESTIMATE: fixing the title colour, removing or confirming Clearpay, fixing the delivery timeline, and adding a running total would add about 3–5 points to every page.

| Type | Products | Average | Min | Max |
|---|---|---|---|---|
| Bed Frame | 95 | 71 | 60 | 74 |
| Divan Bed | 10 | 68 | 65 | 71 |
| Headboard | 17 | 68 | 64 | 68 |
| Kids Bed | 6 | 71 | 71 | 71 |
| Mattress | 6 | 66 | 61 | 69 |
| Ottoman Bed | 10 | 67 | 63 | 70 |
| Storage Box | 1 | 57 | 57 | 57 |

### 4.2 Average points per criterion (out of 5)

| Criterion | Avg | Products scored | Main reason (VERIFIED) |
|---|---|---|---|
| 1 Title | 3.00 | 145 | All capped: h1 white on white |
| 2 Photos | 4.61 | 145 | 38 products have fewer than 5 product photos. 68 products carry 578 image files named "Gemini_Generated…" |
| 3 Image quality | 3.09 | 145 | 86 products have no photo at least 1,500 px. Alt text is complete and unique everywhere |
| 4 Description | 3.98 | 145 | Long and structured (mostly 350–450 words), but every page repeats the Clearpay claim |
| 5 Dimensions | 1.98 | 145 | **No page gives overall bed dimensions.** Most give headboard height (Easify) only |
| 6 Mattress | 3.08 | 144 | "Standard UK mattress" is stated. No page gives a mattress depth limit |
| 7 Storage | 2.61 | 18 | Mechanism described. **Storage depth or capacity is on 0 of 18 pages** |
| 8 Material | 4.52 | 145 | Fabrics named. Frame material missing on some |
| 9 Colour/fabric | 4.88 | 139 | 135 have the Easify fabric and colour choice. 4 have no colour choice |
| 10 Variants | 3.01 | 145 | Colour group labelled "Fabric Type". Mattress size not tied to bed size |
| 11 Delivery | 3.63 | 145 | Mattresses, headboards and the box have no Delivery Service choice. The timeline shows weekend delivery |
| 12 Assembly | 3.70 | 138 | Paid +£69.99 choice on 118 products. Not on headboards or 3 bed frames |
| 13 Returns | 5.00 | 145 | Complete |
| 14 Warranty | 5.00 | 145 | Complete |
| 15 Trust | 3.03 | 145 | Same 6-item trust list on all pages. Includes Clearpay. No "family-run" on 140 pages |
| 16 Reviews | 1.00 | 145 | **0 product reviews on all 145 pages** (Judge.me widget renders `empty_widget`). Only the store-review fallback shows |
| 17 Mobile | 2.00 | 145 | Template-level, section 3 |
| 18 Add to basket | 3.07 | 145 | Present everywhere, but below the first mobile screen |
| 19 Pricing clarity | 3.67 | 145 | 16 pages scored 1 (P0). The other 129 lose 1 point for no running total |
| 20 Checkout | 3.94 | 145 | Guest checkout fine. Clearpay mismatch |

### 4.3 Lowest 20 scores

| # | Product | Type | Score | Priority | Landings 90d | Weakest criteria |
|---|---|---|---|---|---|---|
| 1 | Upholstered Ottoman Storage Box | Storage Box | 57 | P0 | 27 | dimensions 0, colour/fabric 1, reviews 1 |
| 2 | Vegas Luxury Bed – Statement Upholstered Bed Frame | Bed Frame | 60 | P0 | 14 | assembly 0, dimensions 1, colour/fabric 1 |
| 3 | Pillow Top Mattress – Plush Comfort Mattress UK | Mattress | 61 | P3 | 7 | dimensions 1, reviews 1, photos 2 |
| 4 | Coca Designer Bed – Contemporary Upholstered Bed Frame | Bed Frame | 61 | P0 | 5 | assembly 0, dimensions 1, colour/fabric 1 |
| 5 | Aurora Luxury Vertical Panel Bed – Deep-Fill Tall Headboard | Bed Frame | 62 | P0 | 12 | assembly 0, dimensions 1, colour/fabric 1 |
| 6 | Ottoman Gas Lift Divan Base | Ottoman Bed | 63 | P0 | 605 | variants 1, reviews 1, image quality 2 |
| 7 | Panel Line Headboard – Upholstered Bed Frame | Headboard | 64 | P0 | 18 | assembly 1, reviews 1, pricing clarity 1 |
| 8 | 1000 Pocket Sprung Mattress – Single to Super King | Mattress | 65 | P3 | 9 | dimensions 1, reviews 1, photos 2 |
| 9 | Multi Mini Line Divan Ottoman Bed – Complete Divan Set | Divan Bed | 65 | P0 | 4 | reviews 1, pricing clarity 1, image quality 2 |
| 10 | Grey Button-Tufted Platform Storage Bed – Upholstered with Drawers | Divan Bed | 65 | P0 | 0 | reviews 1, pricing clarity 1, dimensions 2 |
| 11 | Memory Foam Mattress – Body-Contouring Mattress UK | Mattress | 66 | P3 | 1 | dimensions 1, reviews 1, photos 2 |
| 12 | Side Lift Ottoman Storage Base | Ottoman Bed | 67 | P1 | 275 | reviews 1, image quality 2, dimensions 2 |
| 13 | Line Bumper Ottoman Divan Bed – Gas Lift Storage Bed | Ottoman Bed | 67 | P0 | 441 | reviews 1, pricing clarity 1, dimensions 2 |
| 14 | Divan Storage Base with Drawers – Upholstered Divan Bed | Divan Bed | 67 | P0 | 119 | reviews 1, pricing clarity 1, image quality 2 |
| 15 | Mayfair Ottoman Divan Bed – Gas Lift Storage Bed | Ottoman Bed | 67 | P0 | 28 | reviews 1, pricing clarity 1, image quality 2 |
| 16 | Sussex Panel Storage Bed with Drawers – Upholstered Divan Bed | Divan Bed | 67 | P0 | 23 | reviews 1, pricing clarity 1, dimensions 2 |
| 17 | Oxford Wingback Storage Bed with Drawers – Upholstered Divan | Divan Bed | 67 | P0 | 16 | reviews 1, pricing clarity 1, dimensions 2 |
| 18 | Chester Wingback Headboard – Handmade Upholstered Headboard | Headboard | 67 | P2 | 20 | reviews 1, dimensions 2, delivery 2 |
| 19 | Oxford Panel Storage Bed with Drawers – Upholstered Divan | Divan Bed | 67 | P0 | 11 | reviews 1, pricing clarity 1, dimensions 2 |
| 20 | Mayfair Bumper Ottoman Storage Bed – Gas Lift Ottoman Bed | Ottoman Bed | 67 | P0 | 9 | reviews 1, pricing clarity 1, image quality 2 |

### 4.4 Top 20 by commercial weight (Stage 2, 90 days)

| # | Product | Score | Priority | Landings | Landing carts | Net units | Net £ | First fix |
|---|---|---|---|---|---|---|---|---|
| 1 | Ottoman Gas Lift Divan Base | 63 | P0 | 605 | 27 | 7 | £2,666.63 | Confirm end vs side opening; make the options match |
| 2 | Side Lift Ottoman Storage Base | 67 | P1 | 275 | 19 | 6 | £1,603.38 | Genuine reviews from its 6 buyers; storage specs from owner |
| 3 | Line Bumper Ottoman Divan Bed – Gas Lift Storage Bed | 67 | P0 | 441 | 28 | 0 | £0.00 | Headline price = slatted base; price the ottoman in or rename |
| 4 | Line Ambassador Bed | 68 | P1 | 374 | 26 | 1 | £351.00 | Option labels; mattress size tied to bed size |
| 5 | Mini Line Wingback Kids Bed | 71 | P1 | 248 | 10 | 0 | £0.00 | Reviews; dimensions |
| 6 | Stone Premium Bed | 71 | P1 | 270 | 2 | 0 | £0.00 | Reviews; dimensions |
| 7 | Line Kids Velvet Bed | 71 | P1 | 205 | 8 | 1 | £350.99 | Reviews; dimensions |
| 8 | Cloud Teddy Bouclé Ottoman Bed – Gas Lift Storage Bed | 70 | P0 | 124 | 16 | 2 | £977.39 | Headline price = slatted base (+£119.99–£189.99 for storage) |
| 9 | Grand Extra-Tall Panel Bed | 74 | P1 | 116 | 17 | 1 | £539.97 | Reviews; dimensions |
| 10 | Divan Storage Base with Drawers | 67 | P0 | 119 | 2 | 1 | £194.99 | Title "with Drawers" but default "No Drawers" |
| 11 | Royal Chesterfield Bed | 71 | P1 | 64 | 11 | 1 | £629.96 | Option labels; reviews |
| 12 | Grand Princess Luxury Bed | 71 | P1 | 109 | 2 | 0 | £0.00 | Reviews; dimensions |
| 13 | Eagle Savoy Channel Bed | 71 | P1 | 36 | 8 | 1 | £823.48 | Reviews; running total |
| 14 | 3000 Pocket Sprung Mattress | 69 | P1 | 11 | 1 | 2 | £595.39 | Reviews; mattress depth; more photos |
| 15 | Curved Wingback Bed | 71 | P1 | 38 | 4 | 1 | £578.68 | Reviews; dimensions |
| 16 | Mirror Strip Sunrise Bed | 71 | P1 | 39 | 1 | 1 | £428.99 | Reviews; dimensions |
| 17 | Eagle Regal Gold-Trim Bed | 72 | P1 | 36 | 1 | 1 | £503.98 | Reviews; dimensions |
| 18 | Mini Line Wingback Bed | 71 | P1 | 55 | 7 | 0 | £0.00 | Reviews; dimensions |
| 19 | Upholstered Ottoman Storage Box | 57 | P0 | 27 | 1 | 1 | £97.99 | Add a fabric and colour choice |
| 20 | Elegant Panel Bed | 73 | P1 | 19 | 2 | 1 | £562.48 | Reviews; dimensions |

The P1 list also includes Royal Chesterfield Wingback, Memory Orthopaedic Mattress, Small Line Divan, Hilton Wingback and Oxygen. See the CSV.

### 4.5 P0 list (21 products)

| Product | Handle | Score | Landings 90d | Units 90d | Blocker (VERIFIED from live option data) |
|---|---|---|---|---|---|
| Ottoman Gas Lift Divan Base | `ottoman-gas-lift-divan-base` | 63 | 605 | 7 | Description and table say **end-opening**. The only Base Type choices are "Divan Ottoman left side opening / Right side opening", the same as on the Side Lift base. Wrong-order risk on the best seller. Owner to confirm |
| Line Bumper Ottoman Divan Bed – Gas Lift Storage Bed | `line-bumper-ottoman-divan-bed` | 67 | 441 | 0 | £324.99 headline is for a slatted base. Ottoman base +£119.99 to +£189.99 |
| Cloud Teddy Bouclé Ottoman Bed – Gas Lift Storage Bed | `cloud-teddy-boucle-ottoman-gas-lift-storage-bed` | 70 | 124 | 2 | Same: £376.99 is slatted. Storage +£119.99 to +£189.99 |
| Divan Storage Base with Drawers | `divan-drawer-storage-base` | 67 | 119 | 1 | Title "with Drawers". Default "No Drawers". Drawers +£19.99 to +£79.99 |
| Upholstered Ottoman Storage Box | `upholstered-ottoman-storage-box` | 57 | 27 | 1 | No fabric or colour choice on the page, but the text says "choose your fabric and colour when you order" |
| Cambridge Panel Storage Bed with Drawers | `cambridge-storage-panel-bed-frame` | 70 | 10 | 1 | Title "with Drawers". Default "No Drawers" |
| Mayfair Ottoman Divan Bed – Gas Lift Storage Bed | `mayfair-ottoman-divan-bed` | 67 | 28 | 0 | Headline is for a slatted base |
| Sussex Panel Storage Bed with Drawers | `sussex-storage-panel-bed-frame` | 67 | 23 | 0 | Title "with Drawers". Default "No Drawers" |
| Oxford Wingback Storage Bed with Drawers | `oxford-divan-storage-bed-frame` | 67 | 16 | 0 | Title "with Drawers". Default "No Drawers" |
| Panel Line Headboard – Upholstered Bed Frame | `panel-line-upholstered-bed-frame` | 64 | 18 | 0 | Type "Headboard", title says headboard and bed frame, text describes a full bed with slatted base at £90.99. What does £90.99 buy? |
| Aurora Luxury Vertical Panel Bed | `aurora-vertical-panel-luxury-bed` | 62 | 12 | 0 | No Easify options at all: no fabric or colour, no Delivery Service, no assembly choice |
| Oxford Panel Storage Bed with Drawers | `oxford-storage-panel-bed-frame` | 67 | 11 | 0 | Title "with Drawers". Default "No Drawers" |
| Vegas Luxury Bed | `vegas-luxury-upholstered-bed-frame` | 60 | 14 | 0 | No Easify options at all |
| Mayfair Bumper Ottoman Storage Bed – Gas Lift Ottoman Bed | `mayfair-bumper-ottoman-gas-lift-divan-bed` | 67 | 9 | 0 | Headline is for a slatted base |
| Side Lift Open Ottoman Bed – Gas Lift Storage Bed | `side-lift-open-ottoman-bed` | 69 | 11 | 0 | Headline £415.99 is for a slatted base. Side-lift base +£189.99 |
| Florida Ottoman Bed – Gas Lift Storage Bed with Headboard | `florida-ottoman-gas-lift-divan-bed` | 67 | 6 | 0 | Headline is for a slatted base |
| Bumper Ottoman Storage Bed – Gas Lift Ottoman Bed | `bumper-ottoman-gas-lift-divan-bed` | 67 | 6 | 0 | Headline is for a slatted base |
| Mayfair Ottoman Storage Bed – End-Opening Gas Lift Ottoman Bed | `mayfair-ottoman-gas-lift-divan-bed` | 67 | 5 | 0 | Headline is for a slatted base |
| Coca Designer Bed | `coca-upholstered-bed-frame` | 61 | 5 | 0 | No Easify options at all |
| Multi Mini Line Divan Ottoman Bed – Complete Divan Set | `multi-mini-line-divan-bed` | 65 | 4 | 0 | Headline is for a slatted base |
| Grey Button-Tufted Platform Storage Bed – Upholstered with Drawers | `upholstered-storage-platform-bed` | 65 | 0 | 0 | Title "with Drawers". Default "No Drawers" |

RECOMMENDATION (owner decides; price changes need approval):
- For each "storage" listing, choose one of two fixes. (a) Make the storage base the required, priced-in default, so the headline price buys what the title says. (b) Rename it honestly, for example "Line Bumper Bed – Gas Lift Ottoman Storage Option (+£119.99)".
- Set the Easify option set on Vegas, Coca, Aurora Luxury Vertical Panel and the Storage Box.

### 4.6 Other verified findings (P2–P3 unless noted)

- **0 product reviews show on any of the 145 pages.** The Judge.me widget is in `empty_widget` state everywhere, with store reviews "1", average 5.00 from 3. Stage 1 counted 2 product reviews in Judge.me admin. They may be unpublished. UNKNOWN why.
- **578 image files on 68 products are named "Gemini_Generated_Image…".** They are probably AI renders of colour variants. The owner must confirm they show the real product. Trading-standards risk if a render differs from what is made. RECOMMENDATION: label them "colour preview" or replace them with photos. The page already says "3D colour preview, shape is illustrative" for the 3D viewer.
- **Clearpay is promised on all 145 pages:** the trust list, the line under the price, and most descriptions. It is NOT confirmed (0 Clearpay orders). P1 copy fix once the owner confirms.
- "Orthopaedic" appears in a product name (Memory Orthopaedic Mattress) and is linked from 76 descriptions. Banned medical-claim word. Owner to decide on a rename.
- The fabric names in the options do not match the guide image. The options say "Plush Velvet, Naples, Galaxy, Conniston, Teddy Boucle". The fabric-guide image alt (139 products) says "Plush, Chenille, Crushed velvet and Linoso". Some descriptions say "Coniston" or "Linen". Spelling "Charoal" in a colour list.
- "Handmade to order in West Yorkshire" and "premium upholstery" are on every page. Handmade/Dewsbury is a fact in the brief. "Premium" is not banned but is vague.
- 20 bed frames show "More from Divan Beds" as the related-products heading. The collection mapping looks wrong (P3).
- No overall bed dimensions anywhere. The 3-5 cm and walkway notes are useful. Real external sizes are UNKNOWN: the owner must measure.
- FAQ: an FAQ block in the description and FAQPage schema on 145 of 145 pages (VERIFIED). Related products: 5–13 cards on every page.

---

## 5. Ottoman strategy (part 4)

### 5.1 The range side by side (VERIFIED, 90 days)

| Product | From £ (headline buys) | Landings | Landing carts | Net units | Net £ | Product photos (AI-named) | Words | Score |
|---|---|---|---|---|---|---|---|---|
| **Ottoman Gas Lift Divan Base** | £220.99 (the base itself) | 605 | 27 | **7** | **£2,666.63** | 3 (0) | 1,223 | 63 |
| **Side Lift Ottoman Storage Base** | £249.99 (the base itself) | 275 | 19 | **6** | **£1,603.38** | 14 (0) | 1,096 | 67 |
| Cloud Teddy Bouclé Ottoman Bed | £376.99 (**slatted**) | 124 | 16 | 2 | £977.39 | 5 (0) | 966 | 70 |
| Line Bumper Ottoman Divan Bed | £324.99 (**slatted**) | 441 | 28 | **0** | £0 | 7 (0) | 571 | 67 |
| Upholstered Ottoman Storage Box | £97.99 (no colour choice) | 27 | 1 | 1 | £97.99 | 2 (0) | 516 | 57 |
| Mayfair Ottoman Divan Bed | £337.99 (slatted) | 28 | 1 | 0 | £0 | 13 (10) | 453 | 67 |
| Side Lift Open Ottoman Bed | £415.99 (slatted) | 11 | 0 | 0 | £0 | 15 (12) | 904 | 69 |
| Mayfair Bumper Ottoman Storage Bed | £363.99 (slatted) | 9 | 1 | 0 | £0 | 14 (11) | 479 | 67 |
| Florida Ottoman Bed | £357.99 (slatted) | 6 | 1 | 0 | £0 | 16 (12) | 383 | 67 |
| Bumper Ottoman Storage Bed | £376.99 (slatted) | 6 | 0 | 0 | £0 | 15 (12) | 446 | 67 |
| Mayfair Ottoman Storage Bed (End-Opening) | £363.99 (slatted) | 5 | 0 | 0 | £0 | 15 (12) | 466 | 67 |
| Multi Mini Line Divan Ottoman Bed | £324.99 (slatted) | 4 | 0 | 0 | £0 | 16 (12) | 499 | 65 |

What the best pages do that the weaker ones do not (VERIFIED from page content):
1. **The price buys the thing in the title.** Both bases sell at their headline price. Every full "ottoman bed" lists a slatted base as the price, and storage costs +£119.99 to +£189.99.
2. **They answer "which one is right for me?"** End lift vs side lift vs drawers vs plain frame, with a price for each, plus a "Will it fit?" section with walkway and headroom notes. 1,100–1,200 words. Weaker pages have 380–570 words.
3. **They name the mechanism plainly** ("whole platform lifts from the end/side on gas struts") and say what goes in it (bedding, suitcases, seasonal clothes).

What even the best pages lack (UNKNOWN; the owner must supply):
- Storage depth or internal height.
- Lift height and headroom needed.
- Overall bed dimensions per size.
- Base height from the floor.
- Mattress depth limit.
- Whether the base is solid or sprung platform (the side lift text says "sprung platform base").
- Strut type and weight rating.
- Which way the base opens on the end-lift product (see P0).

The Ottoman Gas Lift Divan Base has only 3 product photos, none at least 1,500 px, and none showing it open from the end. That is the cheapest fix for the best seller. RECOMMENDATION.

Hypothesis (not tested): Line Bumper (441 landings, 28 carts, 0 sales) and Cloud Teddy (16 carts, 5 checkouts, 2 sales) lose buyers when the ottoman base adds £119.99 to £189.99 in the options, or at the basket. Test: give one page an honest headline price (storage included) for 4 weeks and compare cart-to-order with the other. Small numbers: treat any result as a direction.

### 5.2 Standard premium ottoman page structure (RECOMMENDATION)

Use these blocks in this order on every ottoman, gas lift, side lift and storage product page. Copy uses owner facts only. Gaps are marked UNKNOWN until the owner supplies them.

| # | Block | Content rule | Status today |
|---|---|---|---|
| 1 | Gallery | At least 5 real photos: closed, **open (showing the storage)**, side, headboard detail, fabric close-up, in a room. 1,500 px+. AI colour previews labelled as previews | Base: 3 photos, none open from the end |
| 2 | Title (visible, dark ink) | "[Design] Ottoman Bed – Gas Lift Storage, End Opening" only if the price includes the ottoman base. Otherwise "[Design] Bed – Ottoman Storage Option" | White on white |
| 3 | Price | The headline price is for exactly what the title names, at the size shown. "From £X Single (3FT)" | 16 P0 listings fail |
| 4 | What you buy | One line: "Headboard, upholstered gas lift ottoman base (end opening), slats/platform. Mattress not included." | UNKNOWN per design: owner confirms |
| 5 | Why it is useful | 2–3 lines from our own descriptions: "the whole mattress platform lifts on gas struts so you reach the storage without moving the mattress"; end lift for clear floor at the foot, side lift for beds with the foot against a wall | Present on the two bases |
| 6 | Storage features | Opening side (end / left / right), lift mechanism (gas struts), **storage depth: UNKNOWN**, **lift height and headroom needed: UNKNOWN**, base height: UNKNOWN | Depth on 0 of 18 storage pages |
| 7 | Sizes | Size pills with feet and cm mattress sizes. **Overall bed dimensions per size: UNKNOWN** | Mattress sizes only |
| 8 | Finishes | Fabric → colour (label it "Colour"), free swatches link, customer-supplied fabric accepted ("we will confirm the fabric quantity for your size") | Colour group is labelled "Fabric Type" |
| 9 | Included vs optional | Table. Included: base, headboard (if named), free downstairs delivery in GB. Optional: mattress (size tied to bed), Room of Choice Drop Off +£29.99, **Room of Choice Assembly +£69.99 (optional, never free)** | Spread across the options |
| 10 | Delivery | Free across Great Britain by our own team, usually 3–5 working days. NI, Jersey, Guernsey, IoM £90. Timeline must skip weekends | Timeline shows weekend dates |
| 11 | Assembly | "Optional room-of-choice assembly is available for £69.99." | Option only, rarely in text |
| 12 | Returns and warranty | 14-day free returns (unused, original packaging). 5-year frame warranty | Present |
| 13 | Verified specs table | Only owner-confirmed rows. Blank rows show "Ask us: 07417 439197" instead of guesses | Missing |
| 14 | Reviews | Judge.me product reviews, genuine only | 0 shown |
| 15 | FAQs | How does it open? Which side? What fits inside (owner-measured)? Mattress depth? Delivery and stairs? | Present (no measured facts) |
| 16 | Related | End lift ↔ side lift ↔ drawer divan ↔ storage box | Present on the two bases |

Owner data needed before rollout (UNKNOWN today): storage depth per base type, lift height, headroom, overall dimensions per size, base height, mattress depth limit, platform type, which opening each product is actually made with, and whether AI-named images match the real product.

---

## 6. Product page design system (part 7, RECOMMENDATION)

One structure for every product page: beds, ottomans, divans, kids beds, headboards, mattresses and the box. Blocks that do not apply are hidden, not left empty.

| Order | Block | Rule |
|---|---|---|
| 1 | Gallery | Real photos first. At least 5 for beds. 1,500 px+. Alt text "[Product] – [view]". AI or 3D previews labelled. Generic guide images go last |
| 2 | Title | Dark ink, readable on phone (contrast 4.5:1 or more). States what you buy. No banned words (orthopaedic, best, etc.) |
| 3 | Clear price | "From £X" for the size shown. **It is the price of what the title names.** A running total ("Your bed: £X") updates with every paid choice, next to the price and in the sticky bar |
| 4 | Verified highlights | 3–5 bullets from owner facts only: handmade to order in our Dewsbury workshop, family-run, free GB delivery by our own team (usually 3–5 working days), 14-day free returns, 5-year frame warranty, free swatches. Clearpay only if confirmed |
| 5 | Size | Pills with feet, e.g. "Double (4FT6)". One naming standard for all products |
| 6 | Fabric then Colour | Two steps, labelled "Fabric" and "Colour". Free swatch link beside them |
| 7 | Base / storage (beds only) | The default is the cheapest option and is named in the price, unless the title promises storage (then storage is the default and is in the price) |
| 8 | Mattress | "No mattress" default. The mattress size follows the bed size automatically |
| 9 | Delivery Service | Downstairs Drop Off (free) default; Room of Choice Drop Off +£29.99; **Room of Choice Assembly +£69.99, marked "optional"**. Never "free assembly" |
| 10 | Add to basket | Visible within the first two screens on a 390 px phone. A sticky bar appears after scrolling past it and shows the running total |
| 11 | Delivery, returns, warranty | One short block with owner facts and links to the policies. Timeline in working days only |
| 12 | Specs | Verified rows only (dimensions, materials as stated by us, storage). Unknown rows say "Ask us" |
| 13 | Reviews | Judge.me product reviews. Never invented. Stars near the title once there are 3 or more |
| 14 | FAQs | 4–6 questions from real customer calls. FAQPage schema (already present) |
| 15 | Related | Same collection, and the correct one (fix "More from Divan Beds" on bed frames). Storage alternatives for ottomans |

**Price rule (hard rule):**
1. The shopper must be able to see the final price, including every paid choice, **before** reaching checkout: on the product page (running total) and in the basket.
2. **No paid extra is ever pre-selected.** VERIFIED today: no option set pre-selects a paid extra. The only default is "No Mattress" at £0. Keep it that way. Check it in each Easify change.
3. A title must not name a paid extra (ottoman, gas lift, drawers, mattress) unless the headline price includes it.

Rollout order (RECOMMENDATION, all need owner approval; theme work is done on a copy and published by the owner):
1. Template: title colour; running total next to the price; delivery timeline in working days; Clearpay wording (after owner check).
2. Easify: rename the colour groups "Colour"; tie mattress size to bed size; add option sets to Vegas, Coca, Aurora Luxury Vertical Panel and the Storage Box; confirm end vs side opening on the gas lift base.
3. Pricing decision on the 16 storage-titled listings (price in, or rename).
4. Owner data: dimensions, storage specs, real photos of the open base. Then the specs block.
5. Reviews: Judge.me requests to past buyers (only after the "already bought" check from Stage 1).

---

## Limitations

- The scores come from a rule-based reading of page HTML and the embedded option data. They are a consistent triage tool, not a measure of conversion. The 20 criteria have equal weight, as the brief asked.
- Easify, Judge.me and other third-party scripts did not render in the sandbox browser. Option data was read from the option-set JSON and the no-script summary embedded in each page (VERIFIED), not from what a shopper sees after the scripts run.
- The mobile result is template-level, from 11 pages. Page overflow is UNVERIFIED (the sandbox blocks third-party scripts, and the owner's phone shows the page fitting). Sticky-bar behaviour is UNVERIFIED. Title contrast is VERIFIED in the sandbox and likely on real phones.
- "Storage", "material" and "upholstery" points use our own wording as stated. Nothing was checked physically.
- Review counts: the server-side widget state was read. Reviews loaded later by Judge.me scripts (if any) were not seen.
- Commercial weight uses 90-day landing-page data. Cart and checkout counts are per session, not per product (Stage 2 caveat).
- Nothing was typed into checkout. No basket was created in this task. The checkout criterion relies on Stage 1 VERIFIED findings.

## Credits used

- OpenRush: 0 calls, 0 credits.
- Live site reads: 145 product page fetches, 145 `.js` fetches and 2 `products.json` calls, throttled to about 1 request a second. 23 Playwright iPhone 13 page-load attempts for 11 products. 10 of the first batch failed with a proxy tunnel error and were rerun one per process. No Shopify Admin or GraphQL calls. No writes.
