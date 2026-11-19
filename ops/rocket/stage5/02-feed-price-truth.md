# Stage 5, report 02: Google Shopping feed audit and price truth on landing pages (19 Nov 2026)

Prepared by the Google Shopping, Product Pages, Store Designer/CRO and Verification specialists. Covers part 7 (Merchant Center audit), part 9 (price truth and landing pages), and a status check on workstreams S5-3 and S5-4.

**Read-only.** Nothing was changed in Shopify, Merchant Center, Google Ads, Easify, Simprosys or the theme. The test baskets were made in throwaway browser sessions. No checkout was submitted and no customer was contacted. OpenRush: 0 calls.

Companion files:
- `feed-correction-queue.csv`: 15 prioritised feed corrections. These are proposals only.
- `shots/`: 77 JPEG screenshots, each 150 KB or smaller, named `<product>-<pix|iph|dsk>-<fold|configured|sticky|cart>.jpg`.

Labels: VERIFIED, MATCHED WITH ATTRIBUTION LIMITATIONS, ESTIMATE, UNKNOWN, HISTORICAL (earlier stage).

---

## 1. Answer in fifteen lines

1. **No Merchant Center connector exists, and Shopify blocks feed diagnostics for this app.** `productFeeds` needs `read_product_listings` and `productResourceFeedback` needs `read_resource_feedbacks`; both were denied. Real disapprovals and warnings stay **UNKNOWN** until the owner sends the export in section 7. VERIFIED.
2. **All 145 live products are published to the Google & YouTube channel** (catalog 339816186187). The 42 ACTIVE products that are not on the Online Store are not on Google either. VERIFIED.
3. **Basic Google data is clean.** Every live product has brand "Eagle Bed", a Google category set (505764 beds, 451 headboards, 2696 mattresses, 458 storage box), `condition = new`, at least 2 images with the main image at least 752 px, and `custom_product = true` (so identifier_exists is no and no GTIN is needed). None of this blocks approval. VERIFIED.
4. **Two feed sources are live.** The Simprosys Google Shopping Feed app is installed. Its free-listing links (`utm_medium=product_sync`, `utm_campaign=sag_organic`) still brought **22 sessions in the last 30 days**. The Shopify Google & YouTube channel feeds the same 145 products. PMax is linked to Merchant **5756953290**, the ID set in the Simprosys app (HISTORICAL, Stage 1/2). Duplicate or conflicting offers are a real risk. Whether both sources sit in one Merchant Center account is **UNKNOWN**: owner check P0.
5. **The biggest feed issue is still present.** 9 "Ottoman … Gas Lift Storage Bed" products advertise the **slatted-base size price**, while the title, the first photo (an open ottoman) and the description ("End-opening gas lift ottoman storage base") promise storage. Example, Line Bumper King: ad and page £435.99. With a Metal Ottoman and the 60" headboard the basket is **£595.97**. VERIFIED (live, 3 devices).
6. **Google's automatic price check would pass** (feed price = page price for the variant). The risk is a **misrepresentation or misleading-offer review** and lost buyers, not a price-mismatch disapproval. ESTIMATE (policy reading, not a Google ruling).
7. **The 183 variants without a SKU (37 products) do not affect Google eligibility.** Google uses the Shopify variant ID as the offer ID. They only affect internal reporting. VERIFIED (cosmetic).
8. **Northern Ireland shipping is now correct in Shopify.** A "Northern Ireland - £90" zone exists and #1038 paid £90. #1016 (8 Sep, NIR) paid £0, most likely before the zone existed. That is HISTORICAL; when the zone was added is UNKNOWN. Merchant Center's own shipping table is **UNKNOWN**. The GB free zone also includes "British Forces" (BFPO), which breaks the UK-only rule.
9. **Landing pages fit every screen.** No sideways scroll was found on Pixel 7 (412 px), iPhone 13 (390 px) or desktop on all 9 pages. The live theme is 213270004043. Add to basket worked on all 27 page-device runs (main or sticky button); details in section 5. VERIFIED.
10. **On phones the title and price sit below the first screen.** The large photo gallery fills it. On desktop both are visible at once. VERIFIED.
11. **The running total is still absent.** The main and sticky price only move with Size. Add-ons appear only as "Your selections will add an additional charge of £X" and in the basket. STILL PRESENT.
12. **Every Stage 4 price-truth issue is STILL PRESENT** (table in section 6): ottoman headline, "with Drawers" default, hidden 60"/Golden/Diamond prices (the 60" price appears only as a tooltip after it is chosen), the Royal Chesterfield, Prism and Valentina ladders, the mattress add-on vs standalone gap, Divan Base end vs side opening, the Line Ambassador double colour picker, and the Grand Extra-Tall heights.
13. **S5-3 and S5-4 have not started.** Every approval they depend on (4, 6–15) is PENDING in `owner-decisions.csv` and has no CHANGELOG entry. Nothing on the live site has changed since Stage 4.
14. **Paid traffic is landing on misleading or incomplete pages** (last 30 days, VERIFIED ShopifyQL): Grand Extra-Tall 106 paid landings / 0 orders, Line Ambassador 79 / 0, Line Bumper 72 / 0, Royal Chesterfield 31 / 0. A temporary PMax listing-group exclusion is proposed for owner approval only (section 8).
15. **Owner's next step:** send the Merchant Center diagnostics export (section 7) and confirm which feed source PMax uses. Answer approvals 6, 8 and 10. Until then, keep the four paid-traffic products under watch.

---

## 2. What could and could not be read

| Source | Result | Label |
|---|---|---|
| Shopify `publications` | 9 channels incl. Google & YouTube (339816186187). The Simprosys app is not a sales channel, so it reads products through the API | VERIFIED |
| `publishedOnPublication` per product | 145 live products on Online Store **and** Google & YouTube. 42 ACTIVE products on neither | VERIFIED |
| `productFeeds`, `productResourceFeedback` (channel errors) | **Access denied** (scopes `read_product_listings`, `read_resource_feedbacks`) | UNKNOWN |
| Merchant Center diagnostics, disapprovals, item IDs | No connector | UNKNOWN (owner export, section 7) |
| Google metafields `mm-google-shopping.*` | custom_product, google_product_category, condition, custom_label_0/1/2 present on all live products | VERIFIED |
| Delivery profiles | 1 profile, 3 zones (section 3.6) | VERIFIED |
| Live product pages, `/products/*.js`, Easify config | 9 pages × 3 devices, plus `.js` for 13 products and the Easify config | VERIFIED |
| ShopifyQL sessions by UTM, 30 days | Feed sources and paid landings | VERIFIED |

---

## 3. Merchant Center / feed audit (part 7)

### 3.1 Feed sources: one too many

| Source | Evidence | Status |
|---|---|---|
| Shopify **Google & YouTube** channel | Publication 339816186187, all 145 live products published. Its pixel sends to MC-287909H1CX and MC-SCY4EGMZHS (Stage 2) | Active. VERIFIED |
| **Simprosys Google Shopping Feed** (app `google-shopping-feed`) | Installed. App config holds Merchant **5756953290**, the merchant linked to PMax (Stage 1). Its tracking pixel is empty (Stage 2). **Its product links still bring traffic:** `google / product_sync / sag_organic`, 22 sessions, 2 cart sessions in the last 30 days | Active as a feed. VERIFIED |
| PMax `pmax_all_products` | 822 sessions, 91 cart sessions, 15 checkout sessions in 30 days | Final-URL suffix from Ads, so it cannot show which feed served the click |
| `google / cpc / Google Shopping` | 15 sessions in 30 days | Unknown origin. Possibly the Google channel's own tagging or an old Shopping campaign link. UNKNOWN |

**Duplicate listing risk:**
- If both sources submit to Merchant Center 5756953290, the same bed can exist twice: Shopify's `shopify_GB_<product>_<variant>` and Simprosys' own ID format.
- They then compete with each other, split their history, and an edit made in one source can be overwritten by the other.
- If they go to two different Merchant Center accounts, PMax may be serving the Simprosys copy. That copy's titles, labels and refresh timing are not visible to us.
- Either way: **pick one source.** We recommend the Shopify Google & YouTube channel, the one this audit could read. Owner decision; nothing changed.

A small sign of stale data: the old `bcpo` metafield on the Side Lift base still carries the old option prices (assembly £49.99, Memory mattress add-on £55–£115). The page no longer renders it (Easify does), and it is not a feed field. If any feed tool maps it, it would be wrong. LOW, cosmetic.

### 3.2 Product data quality (145 live products, 763 offers)

| Field | Finding | Impact class |
|---|---|---|
| id / item_group_id | Shopify variant / product (Stage 4: `shopify_GB_<pid>_<vid>`, format ESTIMATE until MC export) | n/a |
| title | Product title, 37–78 characters. 9 ottoman-named beds promise storage that is not in the price (3.3). "Panel Line Headboard – Upholstered Bed Frame" is categorised as a headboard (451) but titled as a bed frame | eligibility risk (ottoman) / cosmetic (headboard) |
| description | All present. Several describe a gas-lift base that is optional (Line Bumper, Cloud Teddy). Divan Base text says "end-opening" while the options offer only left or right **side** opening | eligibility risk / performance |
| brand | vendor "Eagle Bed" on all | ok |
| GTIN / MPN | No barcodes. `custom_product = true` on all 145 → identifier_exists = no | **ok** for own-made beds. Check the 5 mattresses are Eagle Bed's own (F12) |
| google_product_category | 505764 Beds & Bed Frames (121), 451 Headboards (17), 2696 Mattresses (6), 458 Ottomans (storage box) | ok |
| condition | new | ok |
| custom labels | label_0 range (ottoman, upholstered, kids, …), label_1 seller / non-seller, label_2 price band (<300, 300-450, 450+) | useful for PMax listing groups (section 8) |
| images | 2–20 per product. Main image at least 752 px on the 100 products checked (most 1024×1024). Ottoman beds lead with an **open ottoman** photo | ok technically. **Expectation driver** for 3.3 |
| price | variant price, VAT included, no compare-at prices | see 3.3 / 3.5 |
| availability | All 763 available (`.js`). Stock counts are placeholders 997–12,000. Policies are mixed (454 continue / 241 deny / 68 untracked) | ok today. Latent risk if a DENY variant reaches 0 (F14) |
| variants | 5 sizes per bed (3 for kids). **Line Ambassador 60 offers** (5 sizes × 12 Shopify colours, each with its own colour image), while the page asks for the fabric colour again in Easify. Shopify colours (Red, Pink, Beige, White) are not in the Easify colour list | performance (F6) |
| SKU | 183 variants / 37 products blank (3.4) | cosmetic for Google |

### 3.3 The big one: size-variant price vs ottoman title (VERIFIED live, 19 Nov)

What the shopper sees in the ad (feed) and then on the page, versus what the title and photo describe:

| Product | Feed/page price, Double | Same with the cheapest ottoman (Metal +£119.99) | With the base the text describes (gas-lift divan +£189.99) | 30d paid landings / orders |
|---|---|---|---|---|
| Line Bumper Ottoman Divan Bed – Gas Lift Storage Bed | £415.99 | £535.98 | £605.98 | 72 / 0 |
| Cloud Teddy Bouclé Ottoman Bed – Gas Lift Storage Bed | £428.99 | £548.98 | £618.98 | 3 / 0 (2 orders any channel) |
| Mayfair Ottoman Divan Bed | £441.99 | £561.98 | £631.98 | 9 (HISTORICAL S4) |
| Side Lift Open Ottoman Bed | £493.99 | £613.98 | £683.98 | 0 |
| Mayfair Bumper Ottoman, Mayfair Ottoman End-Opening, Multi Mini Line Divan Ottoman, Florida Ottoman, Bumper Ottoman | £415.99–£480.99 | +£119.99 | +£189.99 | 0–2 each |

Prices are from live `/products/*.js` and the Easify config on 19 Nov; unchanged since Stage 4.

**Why it matters for Google:**
- Google checks that the feed price equals the landing-page price. It does, because the page shows the same slatted-base size price. So an automatic **price mismatch** disapproval is unlikely.
- The risk is the **Misrepresentation / unclear offer** standard. The title says "Ottoman … Gas Lift Storage Bed" and the image shows an open ottoman. The price buys a bed on a slatted base, and the page does not say "ottoman base optional, from +£119.99" near the price. A manual review or a user complaint could disapprove these items or, in the worst case, flag the account.
- This is a policy reading (ESTIMATE), not a Google decision. The Merchant Center diagnostics export will show whether anything is flagged today.

**Expectation gap (VERIFIED):**
- Line Bumper: 72 paid landings, 10 cart sessions, 1 checkout, 0 orders in 30 days.
- #1038 (Cloud Teddy *Ottoman* Bed) was ordered with `Base Type: Slatted Base` (HISTORICAL, Stage 4).

Correction options are in F1 of the queue. (A) Make the default price include storage, which needs an owner price decision. (B) Retitle in the feed or Shopify ("… Bed Frame – Ottoman Base Optional") and print "ottoman storage from +£119.99" next to the price. Interim: listing-group exclusion (section 8).

The same pattern, smaller: 6 "with Drawers" divans default to "No Drawers" £0 (F3).

### 3.4 The 183 variants without SKU (VERIFIED, `product-db.csv` re-counted)

37 live products × 5 variants (Grand Luxury and Mayfair Wingback 2 Line × 4).

| Group | Products |
|---|---|
| Ottoman / storage | Side Lift Open Ottoman Bed; Florida Ottoman Bed |
| Bed frames (original range) | Sara Grand; Roman Sleigh; Curved Wingback; Arizona; Hilton Wingback; Florida Wingback; Eric Wingback; Black Bumper; Charlie; Black Piping Art Deco; Grand Luxury; Mayfair Wingback 2 Line |
| Aug–Oct "Eagle" range | Monarch Two-Tone; Mayfair Panel; Regency Wingback Panel; Regal Gold-Trim; Valentina Arch; Royal Chesterfield Wingback; Kensington Chesterfield; Imperial Chesterfield; **Grand Extra-Tall** |
| Headboards | Linear Panel; Elite Horizontal Panel; Box Panel; Slim Horizontal; Elegant Framed; Modern Wingback; Modern Padded Horizontal Channel; Camden 54"; Cambridge Curved; Elite Horizontal Detail; Trinity; Harrow Button; Kensington Framed; Haven |

**Eligibility verdict:** no effect.
- The Google channel's offer ID is built from Shopify IDs.
- SKU is not a Google attribute requirement (MPN is only needed with a GTIN-less branded product that is *not* custom; here custom_product = true).

**Performance:** none known. **Internal:** order lines without SKU (#1043 Grand) weaken product reporting. Class: cosmetic (F11).

### 3.5 Prices vs what a shopper configures (VERIFIED)

| Price signal | Live 19 Nov | Feed effect |
|---|---|---|
| Size ladders | Royal Chesterfield SK £389.99 < K £399.99; Prism Geometric K £444.99 < D £504.99; Valentina Single £419.99 > SD £389.99 | Odd cheap offers. Possible margin loss (F5) |
| Mattress add-on vs mattress page (Double) | Memory £99.99 vs £194.99; 1000 Pocket £179.99 vs £233.99; 3000 Pocket £229.99 vs £259.99; Pillow Top £249.99 vs £389.99. Add-on 2000 Pocket 4ft £169.99 < 1000 Pocket 4ft £179.99 | Mattress ads show the higher standalone price. Shoppers who find the bed add-on later may feel over-charged |
| Paid add-ons with no price on the button | 60" shows `60"` (the +£39.99 appears as a tooltip only after it is selected); Golden Strip and Diamond Button swatches have no price; Easify has no total-price display configured (only a "Total price include tax" label string, unused) | Basket shows more than the ad and page price |

### 3.6 Shipping (Shopify delivery profile, VERIFIED)

| Zone | Covers | Rate |
|---|---|---|
| Great Britain - Free Delivery | GB provinces England, Scotland, Wales **and British Forces (BFP)** | Free Standard Delivery (3–5 Days) £0 |
| Northern Ireland - £90 | GB province NIR | £90 |
| Islands & Remote Areas - £90 | Jersey, Guernsey, Isle of Man | £90 |

- **#1016** (8 Sep, NIR) took "Free Standard Delivery" at £0. **#1038** (9 Nov, NIR) took "Northern Ireland Delivery - £90". So the NI zone works today, and #1016 most likely predates it. HISTORICAL, under-charge of £90 if the owner expected it; the owner decides (approval 28).
- **Merchant Center shipping** is UNKNOWN. If MC has one GB service "free" with no BT postcode exception, NI shoppers see free delivery in ads and £90 at checkout. That is a shipping-mismatch risk, low volume (F9).
- **BFPO in the free zone** contradicts "UK only". Shipping to a forces address abroad would be free. Owner decision (F9).
- **Handling time:** MC delivery estimates should match the real 5–8 day promises seen in Stage 4 (#1038/#1040), not just "3–5" (F10).

### 3.7 Issue classification summary

| Class | Issues |
|---|---|
| **Affects eligibility (risk of disapproval / account review)** | F1 ottoman price vs title/image; F3 "with Drawers" default; F7 Grand "Extra-Tall" claim not supported on the page; F9 NI shipping if MC says free; F2 duplicate sources if one carries stale data |
| **Affects performance** | F2 duplicate offers; F4 hidden add-on prices / no running total; F5 ladders; F6 Ambassador 60 offers + double picker; F8 Divan Base opening text; F10 handling time; F13 headboard titled as bed frame |
| **Cosmetic** | F11 183 SKUs; F12 GTIN (correctly none); F14 stock placeholders (today); F15 empty Simprosys gtag |

Full queue with evidence, fix location and approval need: `feed-correction-queue.csv`.

---

## 4. Landing-page method (part 9)

- Live site www.eaglebed.co.uk, theme **213270004043** (checked in every run via `Shopify.theme.id`).
- Playwright Chromium with device profiles **Pixel 7** (412×839), **iPhone 13** (390×664) and **desktop** 1366×800. en-GB locale, cookie banner declined.
- For each of the 9 products:
  1. Load the page and record fit (scrollWidth vs viewport), H1 and price in the first screen, all Easify groups with their visible labels, delivery text.
  2. Choose **King**, fill every required option, then add a **Metal Ottoman** (or Mesh), **60"** headboard, and Golden Strip / Diamond Button where offered.
  3. Read the main and sticky price, then add to basket. Phones use the sticky button; desktop uses the main button. If a sticky test fails, the main button is tried.
  4. Read `/cart.js` and the cart page.
- Feed price = Shopify variant price (the Google channel sends variant price). Advertised feed price per size is therefore the same number as the page's size price. VERIFIED by `.js`.
- Limits: shop.app (Shop Pay) is blocked by the sandbox proxy, so "Buy with Shop" express checkout was **not tested**. No order was placed.

## 5. Landing-page results: 9 priority products × 3 devices (VERIFIED, live, 19 Nov evening)

"Shown" is the main price on the page for Single (first load) and for King. "Configured King" is King + Metal Ottoman (+£119.99) + 60" (+£39.99), plus the first strip or button swatch where the product requires one. The main and sticky price show the King size price only; the basket shows the configured total.

| Product | Fits P / i / D | Title + price in first screen (phones / desktop) | Shown Single → King | Main + sticky after options | Basket, configured King | Gap | Add to basket |
|---|---|---|---|---|---|---|---|
| Ottoman Gas Lift Divan Base | 412 / 390 / 1366 ✔ | no / yes | £220.99 → £305.99 | £305.99 (no paid options chosen) | £305.99 | 0% | sticky ✔ P, i; main ✔ D |
| Side Lift Ottoman Storage Base | ✔ | no / yes | £249.99 → £334.99 | £334.99 | £334.99 | 0% | sticky ✔ P, i; main ✔ D |
| Cloud Teddy Bouclé Ottoman | ✔ | no / yes | £376.99 → £467.99 | **£467.99** | **£627.97** | +34% | sticky ✔ P, i; main ✔ D |
| Line Bumper Ottoman | ✔ | no / yes | £324.99 → £435.99 | **£435.99** | **£595.97** | +37% | sticky ✔ P, i; main ✔ P, D |
| Line Ambassador | ✔ | no / yes | £337.99 → £428.99 | **£428.99** | **£588.97** | +37% | sticky ✔ P, i; main ✔ P, D |
| Savoy Channel | ✔ | no / yes | £379.99 → £484.99 | **£484.99** | **£644.97** | +33% | sticky ✔ P, i; main ✔ P, D |
| Royal Chesterfield | ✔ | no / yes | £364.99 → £399.99 | **£399.99** | **£559.97** | +40% | sticky ✔ P, i; main ✔ P, D |
| Grand Extra-Tall | ✔ | no / yes | £312.99 → £349.99 | **£349.99** | **£509.97** | +46% | sticky ✔ P, i; main ✔ P, D |
| Stone Premium | ✔ | no / yes | £467.99 → £597.99 | **£597.99** | **£777.96** (incl. Golden Strip +£19.99) | +30% | sticky ✔ P, i; main ✔ P, D |

Common to all 9 pages:
- **Fit.** No horizontal scroll on any device. The H1 is dark (rgb 22,22,25). The Report 3.1 fixes are live. VERIFIED.
- **First screen on phones.** Breadcrumb, Photos / 3D toggle and the gallery fill the first 664–839 px, so the title and price start just below. On desktop both are in the first screen. VERIFIED (`*-pix-fold.jpg`, `*-iph-fold.jpg`, `*-dsk-fold.jpg`).
- **Advertised price vs page.** The feed sends the variant price. The page shows the same number for the same size, so there is no feed/page price mismatch. VERIFIED (`.js` + render).
- **Configuration is understandable** for fabric, colour, base (base prices are printed under each swatch) and delivery (prices in the labels). Not understandable for:
  - 60" headboard: the button reads `60"`, and on phones a "£39.99 GBP" tooltip appears only after you tap it. Desktop shows no price at all after selection (`linebumper-dsk-configured.jpg`).
  - Strip Colour and Button Type: image swatches with **no name and no price**. On Stone the **first swatch is the paid Golden Strip (+£19.99)**. A shopper who taps the first swatch pays £19.99 more while the sticky bar still says £467.99. Our sticky test added Stone at £487.98 (`stone-pix-configured.jpg`).
- **Running total: absent.** Only the line "Your selections will add an additional charge of £159.98 GBP" appears (£179.97 on Stone). The main and sticky prices stay on the size price (`linebumper-iph-sticky.jpg`, `cloudteddy-pix-configured.jpg`). The basket carries the right total and every option as a line property (cart.js).
- **Delivery info.** "Free delivery across Great Britain in 3–5 working days · 14-day free returns" next to the button. Delivery Service has a required picker (Downstairs free / Room of Choice +£29.99 / Assembly +£69.99). Northern Ireland £90 is stated only inside the description (1–3 mentions per page), not next to the price. Every page also says "Spread the cost with Klarna or Clearpay at checkout". Clearpay has not appeared at checkout so far (Stage 1, approval 19 PENDING).
- **Sticky bar** works on Pixel 7 and iPhone 13 once the main button is scrolled away. Tapping it adds the configured item and opens the basket.
  - On iPhone the sandbox then hits a Shop-account redirect (shop.app is blocked here). The basket was confirmed through `/cart.js`. This is a test-environment artefact, not a site fault.
- **"Buy with Shop" express button** sits under Add to basket. **Not tested** (shop.app blocked). Whether it keeps the Easify add-on charges and the required options is UNKNOWN. Worth one owner test purchase-to-payment-screen on a phone.

---

## 6. Stage 4 price-truth issues: still present or fixed?

| # | Issue (Stage 4) | Status 19 Nov evening | Evidence |
|---|---|---|---|
| 1 | Ottoman-named beds: headline excludes the storage | **STILL PRESENT** | Line Bumper £324.99 / King £435.99 with Slatted Base. First photo shows an open ottoman. Description lists "End-opening gas lift ottoman storage base" as a key feature. No "base optional" wording on any of the 9 ottoman-named pages (`.js` description search). `linebumper-iph-fold.jpg`, `linebumper-dsk-configured.jpg` |
| 2 | 6 "with Drawers" divans default to "No Drawers" £0 | **STILL PRESENT** | Live Easify config: "No Drawers=0" first in the drawer group. Divan Storage Base with Drawers headline £168.99 (Stage 5 owner-decisions, live). Titles unchanged (GraphQL) |
| 3 | Hidden upgrade prices (60", Golden Strip, Diamond Button) | **STILL PRESENT** (partly mitigated on phones) | Labels `Standard 50"` `54"` `60"`. Strip and button swatches have empty labels. A phone tooltip "£39.99 GBP" appears only after 60" is selected. `stone-pix-configured.jpg`, `cloudteddy-pix-configured.jpg`, `linebumper-dsk-configured.jpg` |
| 4 | Running total absent | **STILL PRESENT** | Main and sticky stay at the King price on all 7 configurable beds. Basket +30% to +46% |
| 5 | Royal Chesterfield SK < K | **STILL PRESENT** | `.js`: K £399.99, SK £389.99 |
| 6 | Prism Geometric K < D | **STILL PRESENT** | `.js`: D £504.99, K £444.99 |
| 7 | Valentina Single > SD | **STILL PRESENT** | `.js`: Single £419.99, SD £389.99 |
| 8 | Mattress add-on vs standalone; 2000P 4ft < 1000P 4ft | **STILL PRESENT** | Easify config: 1000P 4ft £179.99, 2000P 4ft £169.99. Double add-on vs mattress page: Memory £99.99 vs £194.99, 1000P £179.99 vs £233.99, 3000P £229.99 vs £259.99, Pillow Top £249.99 vs £389.99. Mattress size still not tied to bed size |
| 9 | Gas Lift Divan Base: end vs side opening text | **STILL PRESENT** | Description: "end-opening gas lift ottoman bed base" (several times). Base Type options: "Divan Ottoman left side opening" / "Right side opening" only, and Base Type is **not required**, so an order can carry no opening at all. Owner's 14 in height is **not on the page**. Same two side options on the Side Lift base (consistent there) |
| 10 | Line Ambassador double colour picker | **STILL PRESENT** | Shopify Colour (12 values, Cream pre-selected) plus Easify Fabric colour (15). 60 feed offers |
| 11 | Grand Extra-Tall heights | **STILL PRESENT** | Only Standard 50" / 54" / 60" rendered on all devices. No height in the description. No SKUs |
| 12 | #1016 NI £0 shipping | **Config now correct; historical order unresolved** | NI zone £90 live; #1038 paid £90; #1016 £0 (8 Sep). Approval 28 PENDING |

**Nothing from the Stage 4 price-truth list has been fixed.** That matches `owner-decisions.csv`: approvals 4 and 6–15 are PENDING.

---

## 7. The exact Merchant Center export the owner should send

Do this for **each** Merchant Center account you can open. We expect 5756953290, and possibly a second one linked to the Shopify Google & YouTube app. About 10 minutes.

1. Go to **merchants.google.com**. In the top bar, check the account name and **ID**. Write it down.
2. Left menu: **Products → All products**. Note the totals at the top: Approved / Limited / Not approved / Under review / Pending.
3. Click the **Needs attention** tab (in the new Merchant Center it may be a filter called "Needs attention" or "Status: Not approved / Limited").
4. Click **Download** (the down-arrow icon above the table) and choose **CSV** (or Google Sheets).
   - The file must include the columns **Item ID, Title, Status, Issue(s) / Diagnostics, Affected destinations (Shopping ads, Free listings), Price, Availability, Data source / Feed**.
   - If a column is missing, use **Columns** to add it, then download again.
5. Left menu: **Products → Diagnostics** (old interface), or **Overview → "Fix" / "Product issues"** (new interface):
   - At the top of Diagnostics, open **Item issues** and click **Download** (CSV). This lists every issue type with its item count.
   - Also open **Account issues**. Take a screenshot if anything is listed (e.g. misrepresentation, shipping, or a website claim).
6. Left menu: **Settings (gear) → Data sources** (old: **Products → Feeds**). Take one screenshot of the list. We need to see whether **Simprosys** and/or **Shopify (Google & YouTube)** feed this account, and how many items each holds.
7. **Settings → Shipping and returns:** a screenshot of the GB delivery service (cost, delivery time, any Northern Ireland / BT postcode rule).
8. **Settings → Linked accounts → Google Ads:** a screenshot showing that 198-038-2450 is linked.

Send the two CSVs and the screenshots by email or in HQ. No passwords are needed, and nothing is changed by downloading.

What we will do with it: map each Item ID (`shopify_GB_<product>_<variant>` or the Simprosys format) to our products. Mark every flagged item eligibility / performance / cosmetic. Confirm or rule out duplicate sources. Re-rank `feed-correction-queue.csv`.

---

## 8. Paid traffic currently landing on misleading or incomplete pages

Last 30 days (20 Oct–18 Nov), Shopify sessions with utm_medium=cpc landing on the product. Source: `product-funnel-baseline.csv` (Stage 5, ShopifyQL). VERIFIED at session level. Per-product ad cost is **UNKNOWN**; the Stage 4 cost figure is a session-share ESTIMATE, HISTORICAL.

| Product | Paid landings | Paid carts | Paid checkouts | Orders | What is misleading / incomplete | Est. PMax cost 30d (S4, ESTIMATE) |
|---|---|---|---|---|---|---|
| Grand Extra-Tall | 106 | 15 | 1 | 0 | "Extra-Tall" not supported (50/54/60" only, no height); +46% basket gap | ~£102 |
| Line Ambassador | 79 | 11 | 1 | 0 | Double colour picker; feed offer colour ≠ fabric colour; +37% gap | ~£76 |
| Line Bumper Ottoman | 72 | 10 | 1 | 0 | Ottoman title/photo, slatted price; +37% to the storage configuration | ~£70 |
| Royal Chesterfield | 31 | 6 | 1 | 0 | SK cheaper than K; hidden Diamond price; +40% gap | ~£30 |
| Cloud Teddy Bouclé Ottoman | 3 | 1 | 0 | 0 (2 any channel) | Ottoman not in price (#1038 bought without one) | ~£3 |
| Stone Premium | 5 | 2 | 1 | 0 | First (unlabelled) strip swatch costs +£19.99 | ~£3 |
| Ottoman Gas Lift Divan Base | 58 | 4 | 2 | 2 | Opening text vs options (end vs side) | ~£53 |
| Side Lift Ottoman Storage Base | 28 | 4 | 2 | 1 | Fine (price includes the storage) | ~£27 |

**Proposed temporary restrictions. These are owner approval requests only; nothing has been changed:**

| # | Request | Why | How (Google Ads, by owner) | Undo |
|---|---|---|---|---|
| R1 | **Exclude the 9 ottoman-named beds** (custom_label_0 = `ottoman`, *except* Ottoman Gas Lift Divan Base and Side Lift Ottoman Storage Base) from the PMax listing group until F1 is fixed | Policy risk (misrepresentation) + 72 paid landings / 0 orders on Line Bumper | PMax → Asset group 1 → Listing groups → subdivide by Item ID or custom label 0 → exclude the 9 item groups | Re-include |
| R2 | **Exclude Grand Extra-Tall** until its height is stated and the tall set shows (F7) | Highest estimated spend, 0 paid orders, title claim not on page | Same, by Item ID (5 offers) | Re-include |
| R3 | **Optional: exclude Line Ambassador's 48 non-Cream colour offers** (keep 1 colour × 5 sizes) until the double picker is fixed (F6) | Shoppers click a colour the page then asks for again | By Item ID | Re-include |
| R4 | **Do not** exclude the two storage bases (they sell and their price is true). Keep Royal Chesterfield and Stone live, but fix the ladder and the swatch price first (F5, F4) | They convert to baskets; the fix is cheap | — | — |

**Budget effect:** none requested. PMax stays at £25/day. The same budget moves to the remaining products. **Measurement:** compare PMax conversions and ROAS for 14 days before vs after (Stage 4 section 15 method). This needs the Products export (approval 20) to see per-item spend. Decide R1–R3 only with that export in hand if the owner prefers; the policy risk in R1 is the reason to consider it sooner.

---

## 9. Workstreams S5-3 and S5-4: status only

| Workstream | Scope | Depends on approvals | Status 19 Nov evening | Evidence |
|---|---|---|---|---|
| **S5-3 Ottoman price truth** | Option 6 on Line Bumper + Cloud Teddy, then the other 7; Divan Base opening; running total; "from £X with base" | 4, 6, 8, 9 | **NOT STARTED, blocked: all 4 approvals PENDING** | `owner-decisions.csv` rows 4, 6, 8, 9; no CHANGELOG entry after Stage 4; live render (section 6 rows 1, 4, 9) |
| **S5-4 Configuration clean-up** | Ambassador picker; Grand height/set/SKUs; ladders; hidden prices; mattress tie; missing options | 10–15 | **NOT STARTED, blocked: approvals 10–15 PENDING** | `owner-decisions.csv` rows 10–15; live render (section 6 rows 3, 5–8, 10, 11) |

No theme, Easify, price or product change has been made since Stage 4. The live theme is still 213270004043.

---

## 10. Limitations

- **Merchant Center itself was not readable.** No connector; Shopify feed scopes were denied. Disapprovals, the item ID format, which source feeds PMax, and MC shipping settings are UNKNOWN until the export in section 7 arrives.
- The policy assessment in 3.3 is our reading of Google's Shopping policies (misrepresentation, clear offer). It is not a Google decision and not legal advice.
- Image checks covered the main image of 100 of the 145 live products (size only, not content or overlays). Data-quality checks on the remaining 45 rely on Stage 1 (HISTORICAL) plus the metafield scan (all 145).
- Landing tests used a sandbox browser. shop.app is blocked, so the iPhone post-add redirect and the "Buy with Shop" express button could not be tested. Basket contents were confirmed by `/cart.js`. No checkout was submitted.
- Paid-landing counts are session-level (landing page), not product-level ad clicks. Per-product ad cost is UNKNOWN (Stage 4 cost per product is an ESTIMATE).
- When the NI zone was created is UNKNOWN. #1016 may also have been a manual or legacy rate.
- The 22 `sag_organic` sessions prove Simprosys product links are live. They do not prove Simprosys items serve in paid PMax.

## 11. Credits used

- **OpenRush: 0** (no calls; month ledger unchanged).
- Shopify Admin GraphQL (read-only): about 12 queries (publications/apps, delivery profiles, 2 orders' shipping lines (#1016, #1038, no personal data), 1 product with metafields, products × 3 pages, Line Ambassador variants, featured images). 3 rejected for deprecated fields, 2 denied for scope. No mutations.
- ShopifyQL: 1 query (sessions by UTM, 30 days).
- Public storefront: 18 `/products/*.js` fetches, 1 product page HTML (Easify config).
- Playwright: 9 products × 3 devices plus re-runs (about 45 page loads) and 11 sticky re-tests. Test baskets only, in throwaway sessions.
- Files written: `ops/rocket/stage5/02-feed-price-truth.md`, `ops/rocket/stage5/feed-correction-queue.csv`, `ops/rocket/stage5/shots/*.jpg` (all ≤150 KB). Scratch: the session scratchpad `s5/`.

