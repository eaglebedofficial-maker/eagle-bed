# Stage 6 parts 5, 7 and 8: product SEO, collection strategy and on-page audit

Prepared 19 Nov 2026 (night). Read-only: nothing was changed in Shopify, the theme, metadata, collections, feeds or Search Console. All proposals are drafts for the owner.

**Files**
- `product-seo-audit.csv`: all 145 published products, 57 columns, classes A–H, opportunity rank.
- `collection-seo-audit.csv`: all 26 collections, the keyword cluster each one owns, overlap notes and a recommendation.
- `draft-metadata.csv`: current and proposed SEO title and meta description for the top 30 products, Memory Orthopaedic (compliance) and the top 10 collections, with character counts and status (41 rows).

**Sources (all pulled 19 Nov 2026 unless marked HISTORICAL)**
- Shopify Admin GraphQL, read-only: 150 active products, 145 with an Online Store URL (the 145 audited); 26 collections. The 37 other active products have no Online Store URL and are out of scope.
- Live HTML of 145 product pages and 26 collection pages. Fetched at about 1 request per second with a normal browser user agent. robots.txt allows them. One page returned HTTP 500 once and 200 on retry (Curved Wingback).
- OpenRush Search Console, UK only (country = gbr), **22 Aug–19 Nov 2026 (3 months)**:
  - page level: 494 rows, not truncated;
  - page + query level, filtered to category words: 1,000 rows, **truncated**, so it is a sample of the top rows.
  - The last 3 days are preliminary.
- ShopifyQL sessions by landing page, last 90 days, referrer = search, split by UTM medium:
  - "organic web" = no UTM, 633 sessions;
  - "free listing" = `product_sync`/`sag_organic`, 2,191 sessions. Stage 1 showed that before 28 Sep this bucket also held paid Shopping clicks, so it is not all free.
  - `cpc` = 1,116 sessions, excluded.
- ShopifyQL orders with a Google referrer, last 180 days. These cannot be split into paid and organic.
- HISTORICAL: Stage 2 and Stage 1 GSC tables, Stage 3 product scores, Stage 4 sales-by-product (lifetime orders and net), Stage 5 feed price-truth queue (F1–F15), and the ops/CHANGELOG SEO entries for 10–19 Nov.

Labels: VERIFIED = pulled today from the named source. ESTIMATE = calculated, method shown. HYPOTHESIS = needs testing. UNKNOWN = not measurable here. HISTORICAL = earlier stage.

---

## Answer first

1. **Product pages earn impressions but almost no clicks.**
   - In 3 months the 145 product pages had 9,201 UK impressions and 38 clicks: CTR 0.41%. VERIFIED.
   - 92 products had fewer than 10 impressions, and 29 had none. VERIFIED.
   - Organic web search sent 94 sessions to product pages in 90 days, with 7 cart adds and **0 orders**. VERIFIED (ShopifyQL).
   - Product search sales come through Shopping, paid and free. Google-referred orders in 180 days: 18, which cannot be split into paid and organic. VERIFIED.
2. **Signals are split across URL versions.**
   - 87 products appear in GSC under more than one URL: 415 URL versions in total. VERIFIED.
   - The extra versions are `?variant=`, `country=GB&currency=GBP`, `sag_organic` and `Google Shopping … stkn` URLs. They carry 2,876 impressions (31% of all product impressions). VERIFIED.
   - Side Lift Ottoman Storage Base has 24 versions and Divan Storage Base with Drawers has 11.
   - Live canonicals are correct on all 145 pages (self-referencing, no noindex). VERIFIED.
   - So this is Google indexing feed links. Canonical tags will not fix it on their own. The fix is to stop creating new links: one feed source (Stage 5 F2) and checking the `sag_organic` link format. Then the owner uses URL Inspection to confirm which URL Google picked. UNKNOWN until the owner does this.
3. **15 live meta descriptions repeat the misleading storage-price claim** that Stage 5 found in the feed.
   - 9 ottoman-named beds (F1) and 6 "with Drawers" divans (F3) say "storage" or "drawers" and "from £X". £X is the slatted-base or no-drawer price.
   - The drafts remove the price on all of them and mark them BLOCKED until the owner decides on price truth.
4. **Compliance problems in live metadata:**
   - The Memory Orthopaedic Mattress name, H1, title and meta. The name is also cross-linked from about 76 product descriptions, and "orthop" appears on 81 product pages through those links and the menu.
   - "Clearpay" in two metas: Pillow Top and /collections/mattresses.
   - "orthopaedic" in the mattresses collection meta.
   - "solid wood frames" in the upholstered-beds meta: a material claim that needs owner confirmation.
   - "120 x 190 cm" in the small-double-ottoman meta: dimensions that need owner confirmation.
5. **Most products are classed E or G, and only 6 are A.**
   - Primary classes: A 6, B 12, C 12, D 6, E 56, F 8, G 45, H 0.
   - No published product is less than 60 days old; the newest was created 24 Aug.
   - The biggest single SEO wins are snippet fixes on pages that already rank 4–11 with 0–1 clicks:
     - Cloud Teddy;
     - Panel Line Border;
     - Square Panel ("square bed frame");
     - Indigo Line;
     - Multi Mini Line;
     - Mini Line Luxury;
     - Star;
     - Level Lines.
6. **Collections: one owner per cluster is mostly in place, but several near-duplicate pairs remain.**
   - ottoman-beds and divan-ottoman-beds share 32 of their products (Jaccard 0.80).
   - ottoman-beds and storage-beds share all 37 ottoman-beds products (Jaccard 0.82).
   - Three storage size pages list the same 17 products.
   - kids-beds and kids-single-beds are identical.
   - small-double-ottoman-beds and king-size-ottoman-beds are identical.
   - "ottoman beds uk" splits 31/29 between ottoman-beds and storage-beds.
   - "ottoman divan bed" is targeted by 3 URLs: divan-ottoman-beds at position 71, divan-beds at 87, and the Ottoman Gas Lift Divan Base product, retargeted 19 Nov.
7. **Do not create new collections now.** The reasons are in §D.4.
   - Side-lift has only 2 products, and the divan base's opening direction is BLOCKED.
   - Velvet and bouclé are fabric choices on almost every bed, so those pages would duplicate upholstered-beds.
   - Bouclé is one product (Cloud Teddy).
   - The gap that does exist is **34 published products that sit in no design collection** (only size or "all beds" lists). They include the Google best seller Mirror Strip Sunrise and the Stone, Oxygen and Tower beds. This is a merchandising fix, not a new page.

---
## C. Product SEO (all 145)

### C.1 Product database (VERIFIED unless noted; full detail in `product-seo-audit.csv`)

| Item | Finding |
|---|---|
| Published products | 145: Bed Frame 95, Headboard 17, Divan Bed 10, Ottoman Bed 10, Kids Bed 6, Mattress 6, Storage Box 1. Vendor "Eagle Bed" on all |
| Created | 96 in Feb, 1 in Mar, 48 on 24 Aug 2026. **None in the last 60 days (class H = 0)** |
| Variants | Mostly 5 sizes (Single–Super King). Kids beds have 3 (Kids Single 2.6ft, Single, Small Double); Grand Luxury has 4. Only Line Ambassador has a Shopify colour option (F6) |
| Availability | All "in stock". Inventory numbers are placeholders (Stage 5 F14) |
| Images | 1,493 images; alt text on 100% (0 duplicates within a product; median 59 characters, descriptive) |
| Image file names | 578 "Gemini_Generated…" on 68 products, 97 WhatsApp/IMG, 61 screenshots, about 590 random strings. Only about 167 have descriptive names |
| SEO title | Set on all 145. Pattern `Name \| Descriptor \| Eagle Bed`. 1 over 60 characters (Prism Geometric, 63) |
| Meta description | Set on all 145. 1 over 160 (Ottoman Gas Lift Divan Base, 173, cut off). 143 contain "from £" |
| H1 | 1 per page, the product title, visible. The 19 Nov white-on-white fix is live: class `eb3d-info__title`, not hidden |
| Canonical / indexable | 145/145 self-canonical, no noindex, HTTP 200 (Curved Wingback had one transient 500) |
| Structured data | Product, BreadcrumbList, FAQPage and FurnitureStore on 144; VideoObject on 1 |
| Description | Median 391 words (Shopify body); median 949 words on the rendered page. **Median 68% of each description is template text** (5-word shingles that appear in 10 or more products); 99 products are 60% or more template. Highest pairwise overlap is 0.80 (Box Panel and Linear Panel headboards). Thin (under 150 words): 0 |
| Internal links | Every product links to 1–4 collections, but mainly to mattresses (107) and upholstered-beds (96). Only 60/145 link to a guide. Links to storage-beds (4) and divan-ottoman-beds (3) are rare |
| GSC (3 months, UK) | 9,201 impressions, 38 clicks, CTR 0.41%. Mattresses: 6 products, 2,848 impressions, 2 clicks. Ottoman: 10 products, 2,009 impressions, 17 clicks. Bed frames: 95 products, 2,679 impressions, 9 clicks |
| Search sessions (90 days) | Organic web: 94 product landings, 7 carts, 0 orders. Free listing + legacy paid (`product_sync`): 2,191 landings, 58 carts, 5 orders |

### C.2 Classes (rule-based, ESTIMATE; the rule for each class is in the table)

| Class | Rule used | Primary (any flag) | Examples |
|---|---|---|---|
| A: high organic revenue opportunity | Proven seller (2+ lifetime orders, a Google order, or £500+ net) **and** visibility (100+ impressions, 50+ search sessions, or £1,000+ net) | 6 (6) | Ottoman Gas Lift Divan Base, Side Lift Ottoman Base, Cloud Teddy, Mirror Strip Sunrise, Line Kids Velvet, 3000 Pocket Sprung |
| B: high impressions, low CTR | 100+ impressions, CTR under 1% | 12 (14) | Divan Storage Base with Drawers (762), Side Lift Open Ottoman (628), Chesterfield Tufted (571), Pillow Top (1,271 at pos 58), Memory Foam (960) |
| C: good rank, weak conversion | Position 12 or better with 30+ impressions, or 40+ search sessions, with 0 orders ever | 12 (14) | Stone Premium (199 free-listing sessions, 0 carts), Mini Line Wingback Kids (167), Line Bumper (268) |
| D: ranking opportunity | Position 8–20, 20+ impressions | 6 (11) | Grand Extra-Tall (10.0), Tower (19.7), Curved Wingback (14.1), Princess (15.8) |
| E: poorly indexed | Created 90+ days ago, under 10 impressions in 3 months | 56 (60) | **Line Bumper (0 web impressions, 268 free-listing sessions), Line Ambassador (3), Mirror Strip Sunrise (2)**, most Feb/Aug panel and line designs |
| F: duplicate or overlapping intent | Description overlap 0.70+ or a known pair | 8 (25) | Chesterfield Tufted / Chester Chesterfield (same photos and prices, Stage 5); Mayfair Ottoman pair; Pillow Top / 2000 Pocket Pillow Top; Memory Foam / Memory Orthopaedic; Box Panel / Linear Panel headboards |
| G: low demand | No other flag | 45 (53) | Most 24 Aug Aurora/Regal/Chesterfield variants |
| H: new (under 60 days) | Created under 60 days ago | 0 | (none) |

The E class is the big one. For the products that sell through Shopping, the HYPOTHESIS is that Google has picked a feed URL as canonical, or has not indexed the page. Line Bumper is the extreme case. **Owner action:** Search Console → URL Inspection on /products/line-bumper-ottoman-divan-bed, /products/line-ambassador-upholstered-bed-frame and /products/mirror-strip-sunrise-upholstered-bed-frame. Screenshot "Google-selected canonical" and the "Page indexing" status. UNKNOWN until then.

### C.3 Top 30 product SEO opportunities

Ranked by an ESTIMATE score, built from three parts:
- **Missing clicks:** impressions × (target CTR for the position − actual CTR). Target CTR is 5% at positions 1–10, 2% at 11–20, 0.8% at 21–40 and 0.3% beyond.
- **Commercial weight:** × (1 + log of lifetime net/£100 + half the log of search sessions).
- **Bonuses:** +5 for class A, +3 for class D, plus 1.5 × log(search sessions).

Drafts for each row are in `draft-metadata.csv`. "Orders ever" is HISTORICAL (Stage 4).

| # | Product (class) | Evidence (GSC 3m UK; Shopify 90d) | Pos | Intent | Action | Effort | Risk | Agent | Dependencies / BLOCKED | Approval | Success metric |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Cloud Teddy Bouclé Ottoman Bed (AD) | 903 impr, 9 clicks (7 URL versions); web 28 / free-listing 12 sessions; 2 orders ever | 10.9 | teddy/bouclé ottoman bed (commercial) | Meta without price; consolidate 7 URL versions (canonical check by owner in GSC); add link to /collections/ottoman-beds anchor 'gas lift ottoman beds' | S | Med | Product Pages + On-Page SEO | F1 price truth (approvals 6, 9) **BLOCKED** | Owner (meta + F1) | CTR 1.0% to 2.5% at pos ~11 by 17 Feb |
| 2 | Panel Line Border Bed (BC) | 248 impr, 1 clicks (4 URL versions); web 4 / free-listing 0 sessions; 0 orders ever | 7.3 | panel bed (commercial) | Snippet test (new title/meta); add link to /collections/panel-beds | S | Low | On-Page SEO | none | Owner (metadata) | CTR 0.4% to 2% at pos 7 |
| 3 | Square Panel Luxury Bed (BCD) | 234 impr, 1 clicks (6 URL versions); web 0 / free-listing 1 sessions; 0 orders ever | 9.1 | 'square bed frame' (commercial) | Title to 'Square Panel Bed Frame'; link from panel-beds | S | Low | On-Page SEO | none | Owner | Clicks 1 to 5+ per 90d for 'square bed frame' |
| 4 | Ottoman Gas Lift Divan Base (AB) | 137 impr, 0 clicks (10 URL versions); web 5 / free-listing 398 sessions; 7 orders ever | 25.4 | ottoman divan base (commercial, top seller) | Meta trimmed to 155 chars + 14in height; keep 19 Nov title; 10 URL versions -> canonical | S | Low | Product Pages | F8 opening direction (approval 4) **BLOCKED** | Owner | Pos 25 to <15 for 'ottoman divan bed' by 17 Feb; no regression in orders |
| 5 | Indigo Line Bed (CD) | 96 impr, 0 clicks (8 URL versions); web 0 / free-listing 14 sessions; 0 orders ever | 8.9 | line/panel bed (commercial) | New meta; add to panel-beds (orphan check); decide on 12 Gemini images | S | Low | On-Page SEO + Merch | Owner Q17 Gemini images | Owner | First clicks at pos ~9 |
| 6 | 3000 Pocket Sprung Mattress (AB) | 247 impr, 0 clicks (7 URL versions); web 0 / free-listing 4 sessions; 3 orders ever | 20.5 | 3000 pocket sprung mattress (commercial) | Title pattern 'UK | All Sizes'; link from mattresses + bed pages (already 107 links to /collections/mattresses) | S | Low | On-Page SEO | none | Owner | Pos 20 to <12 |
| 7 | Grand Extra-Tall Panel Bed (D) | 63 impr, 0 clicks (5 URL versions); web 1 / free-listing 1 sessions; 1 orders ever | 10.0 | tall headboard bed (commercial) | Rename/heights decision, then title/meta | S | Med | Product Pages | F7 heights (owner) **BLOCKED** | Owner | Claim matches options; CTR >1% |
| 8 | Stone Premium Bed (CD) | 50 impr, 0 clicks (7 URL versions); web 1 / free-listing 199 sessions; 0 orders ever | 19.8 | premium upholstered bed | Meta tidy; real issue is conversion (199 free-listing sessions, 0 carts) - CRO | M | Low | CRO + Product Pages | Stage 3 inv-3 | Owner | Cart rate >2% from search sessions |
| 9 | Line Kids Velvet Bed (A) | 13 impr, 2 clicks (7 URL versions); web 2 / free-listing 119 sessions; 3 orders ever | 21.4 | velvet kids bed (commercial) | Title/meta; link to /collections/kids-beds and kids guide | S | Low | On-Page SEO | none | Owner | Organic web sessions 2 to 10+ per 90d |
| 10 | Side Lift Ottoman Storage Base (A) | 258 impr, 6 clicks (24 URL versions); web 2 / free-listing 114 sessions; 7 orders ever | 33.0 | side lift ottoman base (commercial, top seller) | Retitle as 'Base' to stop competing with Side Lift Open Ottoman Bed; 24 URL versions -> canonical | S | Med (top seller - change title only, keep handle) | Product Pages | none (price is the base) | Owner | Each side-lift page holds its own query; orders unchanged |
| 11 | Oxygen Luxury Bed (C) | 52 impr, 0 clicks (3 URL versions); web 0 / free-listing 42 sessions; 0 orders ever | 6.1 | geometric headboard bed | Meta; canonical (ranks via ?variant URL at pos 6); add to a design collection (orphan) | S | Low | On-Page SEO | GSC canonical check (owner) | Owner | Clean URL indexed; clicks >0 |
| 12 | Mirror Strip Sunrise Bed (AE) | 2 impr, 0 clicks (2 URL versions); web 0 / free-listing 18 sessions; 3 orders ever | 24.5 | sunrise/mirror bed (proven seller) | Add to panel-beds/upholstered design collection + links from 2 guides; meta | S | Low | Topic Clusters + Merch | none | Owner (collection membership) | Web impressions >100 per 90d |
| 13 | Divan Storage Base with Drawers (B) | 762 impr, 1 clicks (11 URL versions); web 0 / free-listing 95 sessions; 1 orders ever | 55.4 | divan base with drawers (commercial) | Owner fixes drawer default, then title/meta; 11 URL versions -> canonical | S | Med | Product Pages | F3 (approvals 10-15) **BLOCKED** | Owner | Pos 55 to <25 for 'divan base with drawers' |
| 14 | Side Lift Open Ottoman Bed (B) | 628 impr, 2 clicks (7 URL versions); web 4 / free-listing 3 sessions; 0 orders ever | 33.7 | side lift ottoman bed (commercial) | Single owner of 'side lift ottoman bed'; meta without price; H2 'side lift' section on ottoman-beds links here | S | Med | Product Pages + On-Page SEO | F1 **BLOCKED** | Owner | Pos 28 to <15; CTR >1% |
| 15 | Level Lines Luxury Bed (CD) | 89 impr, 0 clicks (5 URL versions); web 1 / free-listing 0 sessions; 0 orders ever | 10.7 | horizontal line bed | Title/meta (dimension removed) | S | Low | On-Page SEO | none | Owner | First clicks at pos ~11 |
| 16 | Multi Mini Line Luxury Bed (CF) | 61 impr, 0 clicks (4 URL versions); web 2 / free-listing 2 sessions; 0 orders ever | 4.5 | line bed | Meta; differentiate description (71% template overlap with Ambassador) | M | Low | Copywriting | none | Owner | CTR >2% at pos 4.5 |
| 17 | Chesterfield Tufted Bed (BF) | 571 impr, 1 clicks (7 URL versions); web 2 / free-listing 0 sessions; 0 orders ever | 28.8 | chesterfield bed frame | Pick one of the duplicate pair to target 'chesterfield bed frame'; other gets distinct name/angle | M | Med | Product Pages | Approval 16 (duplicate pair) | Owner | One chesterfield product URL with clicks; collection keeps 'chesterfield bed' |
| 18 | Tower Bed (D) | 96 impr, 0 clicks (6 URL versions); web 0 / free-listing 0 sessions; 0 orders ever | 19.7 | tall headboard bed | Meta; add to panel-beds (orphan) | S | Low | On-Page SEO + Merch | none | Owner | Pos 19.7 to <12 |
| 19 | Curved Wingback Bed (D) | 45 impr, 1 clicks (8 URL versions); web 1 / free-listing 10 sessions; 1 orders ever | 14.1 | curved wingback bed | Meta; ensure link to wingback-beds; watch the transient 500 | S | Low | On-Page SEO | none | Owner | Pos 14 to <10 |
| 20 | Princess Luxury Bed (D) | 58 impr, 2 clicks (5 URL versions); web 1 / free-listing 6 sessions; 0 orders ever | 15.8 | luxury tall bed | Meta | S | Low | On-Page SEO | none | Owner | Clicks 2 to 5+ |
| 21 | Panel Line Headboard (B) | 340 impr, 1 clicks (5 URL versions); web 2 / free-listing 8 sessions; 0 orders ever | 22.0 | panel line headboard | Rename as headboard everywhere (title 'Bed' + £90.99 misleads) | S | Med | Product Pages | F13 + approval 17 | Owner | No 'bed from £90.99' snippet |
| 22 | Mini Line Luxury Bed (C) | 63 impr, 0 clicks (5 URL versions); web 0 / free-listing 1 sessions; 0 orders ever | 5.8 | line bed | Meta | S | Low | On-Page SEO | none | Owner | CTR >2% at pos 5.8 |
| 23 | Line Ambassador Bed (E) | 3 impr, 0 clicks (2 URL versions); web 2 / free-listing 169 sessions; 1 orders ever | 3.0 | panel bed (ad-driven seller) | Meta without '12 colours'; URL Inspection (3 web impressions) | S | Low | Product Pages | F6 **BLOCKED** | Owner | Web impressions >50 per 90d |
| 24 | Star Unique Bed (C) | 78 impr, 0 clicks (3 URL versions); web 0 / free-listing 0 sessions; 0 orders ever | 5.9 | panel bed | Meta | S | Low | On-Page SEO | none | Owner | CTR >2% at pos 5.9 |
| 25 | Pillow Top Mattress (BF) | 1271 impr, 0 clicks (8 URL versions); web 0 / free-listing 0 sessions; 0 orders ever | 58.1 | pillow top mattress (commercial) | Remove Clearpay; owner explains difference vs 2000 Pocket Sprung Pillow Top | S | Med | Product Pages | Owner product facts | Owner | 1,271 impr at pos 58: pos <30 |
| 26 | Line Bumper Ottoman Divan Bed (CE) | 0 impr, 0 clicks (0 URL versions); web 0 / free-listing 268 sessions; 0 orders ever | None | ottoman bed (ad-driven) | URL Inspection: 0 web impressions in 3 months; F1 price truth; meta without price/end-opening | M | High (policy) | Product Pages | F1 (approvals 6, 9) **BLOCKED** | Owner | Indexed + web impressions >0; F1 fixed |
| 27 | Mini Line Wingback Kids Bed (C) | 16 impr, 0 clicks (1 URL versions); web 0 / free-listing 167 sessions; 0 orders ever | 34.4 | wingback kids bed | Meta; CRO (167 free-listing sessions, 0 orders) | S | Low | CRO + On-Page SEO | none | Owner | Cart rate from search >3% |
| 28 | Grand Luxury Bed (D) | 25 impr, 0 clicks (4 URL versions); web 0 / free-listing 0 sessions; 0 orders ever | 14.2 | large luxury bed | Meta without 'oversized' | S | Low | On-Page SEO | none | Owner | First clicks at pos 14 |
| 29 | Gold V Cross Line Bed (D) | 21 impr, 0 clicks (2 URL versions); web 0 / free-listing 0 sessions; 0 orders ever | 15.9 | metallic strip bed | Meta; confirm strip is standard (F4) | S | Low | Product Pages | F4 option prices | Owner | First clicks at pos 16 |
| 30 | Chester Wingback Headboard (B) | 239 impr, 1 clicks (6 URL versions); web 0 / free-listing 13 sessions; 0 orders ever | 22.1 | wingback headboard | Hold until headboard decision; meta without fit/delivery claims | S | Low | Product Pages | Approval 17 | Owner | Decision made; CTR >1% |

How to read it:
- All "Owner" approvals are metadata or collection changes. Under Stage 6 safety no agent makes them.
- **BLOCKED** = the copy depends on an open Stage 5 price-truth decision: F1 ottoman storage price, F3 drawer default, F6 colours, F7 heights, F8 opening direction, F13 headboard naming, approval 16 duplicate pair, approval 17 headboards.
- Success metrics are measured in GSC 28 days after a change. Compare against this 22 Aug–19 Nov baseline.

---
## D. Collections, keyword clusters and cannibalisation

### D.1 All 26 collections (VERIFIED; full detail and recommendations in `collection-seo-audit.csv`)

All 26 return HTTP 200, have one H1, are self-canonical and have an SEO title and meta set. Every collection carries BreadcrumbList and FurnitureStore schema; none has CollectionPage or ItemList schema. "Total" products include unpublished and draft items: upholstered-beds lists 192 but only 117 are live.

| Collection | Products (published / total) | Words | Title chars | Meta chars | Impressions / clicks / pos (3 months) | Organic web sessions 90d | Owns |
|---|---|---|---|---|---|---|---|
| storage-beds | 45 / 64 | 702 | 51 | 147 | 1099 / 4 / 39.7 | 3 | storage beds; beds with storage; storage bed UK |
| ottoman-beds | 37 / 44 | 975 | 60 | 156 | 1003 / 0 / 31.4 | 27 | ottoman bed(s); gas lift ottoman bed; gas lift bed; ottoman storage bed |
| wingback-beds | 24 / 33 | 593 | 50 | 151 | 790 / 0 / 25.2 | 5 | wingback bed(s); wingback panel bed |
| divan-beds | 34 / 35 | 768 | 50 | 151 | 770 / 1 / 45.8 | 21 | divan bed(s); divan beds UK; upholstered divan bed; divan bed with storage |
| chesterfield-beds | 7 / 14 | 713 | 58 | 156 | 684 / 0 / 32.3 | 2 | chesterfield bed(s) |
| divan-ottoman-beds | 35 / 35 | 434 | 54 | 141 | 548 / 0 / 57.3 | 6 | ottoman divan bed(s); divan ottoman |
| small-double-ottoman-beds | 10 / 18 | 295 | 54 | 145 | 304 / 0 / 50.1 | 0 | small double ottoman bed; 4ft ottoman bed |
| best-sellers | 37 / 37 | 323 | 52 | 160 | 263 / 0 / 19.8 | 3 | (none - merchandising) |
| mattresses | 6 / 10 | 415 | 55 | 156 | 195 / 0 / 14.0 | 4 | mattresses UK; buy mattress UK |
| upholstered-beds | 117 / 192 | 558 | 53 | 152 | 167 / 0 / 6.8 | 34 | upholstered beds UK; upholstered bed frames; handmade beds; velvet bed (until a velvet page exists) |
| panel-beds | 37 / 51 | 496 | 56 | 154 | 166 / 1 / 11.8 | 2 | panel bed(s); panel bed frame; upholstered panel bed |
| headboards | 17 / 17 | 449 | 48 | 151 | 157 / 0 / 54.4 | 1 | upholstered headboards UK; handmade headboards |
| new-trending | 23 / 102 | 304 | 45 | 157 | 150 / 0 / 2.3 | 0 | (none) |
| storage-beds-with-drawers | 6 / 13 | 413 | 56 | 157 | 135 / 0 / 32.0 | 0 | storage beds with drawers; beds with drawers; divan bed with drawers |
| frontpage | 30 / 30 | 296 | 58 | 161 | 84 / 0 / 2.1 | 1 | (none) |
| super-king-beds | 115 / 204 | 259 | 51 | 148 | 81 / 0 / 53.7 | 0 | super king bed frame |
| king-size-beds | 115 / 204 | 234 | 50 | 147 | 68 / 0 / 51.7 | 0 | king size bed frame |
| kids-beds | 6 / 26 | 463 | 59 | 150 | 59 / 0 / 14.2 | 5 | kids beds; children's upholstered beds |
| double-storage-beds | 17 / 42 | 287 | 60 | 143 | 34 / 0 / 28.6 | 0 | double storage bed |
| small-double-beds | 121 / 229 | 298 | 52 | 149 | 32 / 0 / 35.3 | 0 | small double bed 4ft |
| small-double-storage-beds | 17 / 42 | 330 | 52 | 143 | 16 / 0 / 57.1 | 0 | small double storage bed |
| double-divan-beds | 13 / 32 | 288 | 55 | 152 | 9 / 0 / 21.6 | 0 | double divan bed |
| king-size-ottoman-beds | 10 / 18 | 340 | 51 | 148 | 1 / 0 / 28.0 | 0 | king size ottoman bed |
| kids-single-beds | 6 / 25 | 241 | 56 | 147 | 1 / 0 / 11.0 | 0 | (duplicate of kids-beds) |
| double-beds | 115 / 204 | 221 | 47 | 145 | 0 / 0 / - | 0 | double bed frame |
| single-storage-beds | 17 / 42 | 310 | 59 | 155 | 0 / 0 / - | 0 | single storage bed |

Publication: wingback-beds and chesterfield-beds are on 5 sales channels, and panel-beds, the storage-with-drawers page and the size pages are on 1. The rest are on 9. They are all on the Online Store. Check that they are also on the Google & YouTube channel (UNKNOWN which channel is missing).

### D.2 One owner page per cluster

The cluster share comes from the page+query sample (1,000 rows, truncated), UK, 3 months.

| Cluster | Impressions in sample, share by page | Owner page (recommended) | Supporting pages | Never target it with |
|---|---|---|---|---|
| ottoman / ottoman storage bed | 3,399: ottoman-beds 17%, divan-ottoman-beds 15%, how-do-ottoman-beds-work 15%, ottoman-vs-divan blog 12%, storage-beds 11%, small-double-ottoman 8% | **/collections/ottoman-beds** | how-do-ottoman-beds-work (informational, pos ~9), ottoman-bed-vs-divan-bed-uk | storage-beds title (drop "Ottoman" from its lead; draft provided) |
| gas lift | 1,093: ottoman-beds 68%, how-do-ottoman-beds-work 29% | **/collections/ottoman-beds** | how-do-ottoman-beds-work | divan-ottoman-beds |
| side lift | 157: side-lift-open-ottoman-bed 73%, small-double-ottoman 22% | **/products/side-lift-open-ottoman-bed** for "side lift ottoman bed"; the base product for "side lift ottoman base" | small-double-ottoman-beds ("End lift or side lift?" H2) | Side Lift Ottoman Storage Base (its SEO title now says "Side Lift Ottoman Bed": change it to "Base", draft) |
| ottoman divan bed / divan ottoman | about 500 across 6 query forms: divan-ottoman-beds pos 57–71, divan-beds pos 60–87 | **/collections/divan-ottoman-beds** | Ottoman Gas Lift Divan Base product (owns "ottoman divan base") | divan-beds (keep only the 19 Nov comparison H2) |
| divan beds | 3,212 (incl. informational): divan-bed-vs-bed-frame blog 41%, divan-beds 20% | **/collections/divan-beds** ("divan beds uk", "divan bed with storage") | divan-bed-vs-bed-frame-uk (informational, 14 clicks: the site's best organic page after home) | — |
| divan bases | divan-drawer-storage-base product (762 impressions, pos 55) | **Products**: Divan Storage Base with Drawers ("divan base with drawers"); Ottoman Gas Lift Divan Base | storage-beds-with-drawers | — |
| storage | 1,242: storage-beds 47%, divan-beds 17% | **/collections/storage-beds** | best-beds-for-small-bedrooms, storage-bed-small-uk-bedroom-guide | — |
| drawers | 39 | **/collections/storage-beds-with-drawers** | product above | — |
| upholstered / bed frame | upholstered 248; bed frame 832 (73% to the divan-vs-bed-frame blog) | **/collections/upholstered-beds** | panel-beds | — |
| velvet | 13 (blogs only) | **/collections/upholstered-beds** (velvet is a fabric option on about 125 products) | velvet-bed-frames-uk-style-guide, best-velvet-bed-colours-2025 | no new collection |
| bouclé / teddy | 153, all to Cloud Teddy | **/products/cloud-teddy-boucle-ottoman-gas-lift-storage-bed** | ottoman-beds | no new collection (1 product) |
| chesterfield | 714: chesterfield-beds 94% | **/collections/chesterfield-beds** | chesterfield-beds-uk-buying-guide | the two duplicate chesterfield products should not both chase "chesterfield bed" |
| wingback | 44 in sample (truncated) | **/collections/wingback-beds** | wingback-bed-buying-guide-uk (old wingback blogs already 301 here, VERIFIED) | — |
| panel | 164: panel-beds 90% | **/collections/panel-beds** | panel line products | — |
| kids | 48: kids-beds 94% | **/collections/kids-beds** | kids-upholstered-beds-uk-guide | kids-single-beds (identical list) |
| mattresses | 221 (sample); product pages hold the rest | **/collections/mattresses** for "mattress UK"; each product for its type; "memory foam mattress" → **memory-foam-mattress-uk** | pocket-sprung-vs-memory-foam blog | Memory Orthopaedic product |
| orthopaedic | 5 | **No page.** Do not target. Rename "Memory Orthopaedic Mattress" (BLOCKED, owner) | — | everything |
| headboards | 251: headboards 61% | **/collections/headboards** | — | hold until approval 17 |
| small double / king ottoman | small-double-ottoman 304 impressions | **/collections/small-double-ottoman-beds**, **/collections/king-size-ottoman-beds** | — | — |
| bed sizes | /pages/bed-sizes-guide 294 (pos 58); old blog uk-bed-size-guide 455 (pos 30) now **301s to the page** (VERIFIED) | **/pages/bed-sizes-guide** | /pages/single-beds-3ft-uk (537 impressions, pos 43; **2 H1s**) | — |

### D.3 Cannibalisation and duplicate pages (VERIFIED unless marked)

| # | Overlap | Evidence | Recommendation | Approval |
|---|---|---|---|---|
| 1 | ottoman-beds vs storage-beds (Stage 2) | "ottoman beds uk" 31 vs 29 impressions; "ottoman storage bed(s)" 132 impressions go to storage-beds; all 37 ottoman-beds products are in storage-beds | Keep both (different intents). Storage-beds title and meta lead with "storage / drawers / lift-up", not "Ottoman". Keep the cross-link | Owner (metadata) |
| 2 | ottoman-beds vs divan-ottoman-beds | 32 of 37 products shared (Jaccard 0.80); "ottoman gas lift divan bed" split 24/13 | divan-ottoman-beds owns "ottoman divan" only. Re-measure 17 Dec. If still past position 50, owner decides on merge + 301 into ottoman-beds | Owner |
| 3 | "ottoman divan bed" on 3 URLs | divan-ottoman-beds (pos 71), divan-beds (pos 87), divan base product (retargeted 19 Nov) | Do not change again before 17 Dec (avoid flip-flopping). The product's title stays "base"-led | — |
| 4 | Side Lift Ottoman Storage Base vs Side Lift Open Ottoman Bed | Both SEO titles start "Side Lift Ottoman Bed" | Base is titled "…Ottoman Base" (draft) | Owner |
| 5 | Size collections | single-, double- and small-double-storage-beds list the same 17 products; kids-beds = kids-single-beds (6); small-double-ottoman = king-size-ottoman (10). Impressions 0–34 | No more size pages. Review 10 Feb. Merge + 301 any under 50 impressions into the parent. Dimensions in size copy BLOCKED until confirmed | Owner |
| 6 | Blog vs blog: ottoman-bed-vs-divan-bed vs …-uk | Old URL already **301 → -uk** (VERIFIED). GSC still shows 225 impressions on the old URL (lag) | No action; consolidation in progress | — |
| 7 | Ottoman guides: /pages/ottoman-bed-frame-buying-guide (**2 H1s**) vs /blogs/news/best-ottoman-beds-uk-2025 ("Ottoman Beds UK: Complete Buying Guide") vs how-do-ottoman-beds-work | 6 / 12 / 805 impressions | Keep how-do-ottoman-beds-work as the informational owner. Merge the two "buying guides" into one, 301 the other. The URL `best-ottoman-beds-…` contains "best" (banned word in copy; the URL slug is legacy) | Owner |
| 8 | Small-room guides: best-beds-for-small-bedrooms (1,351 impressions, refreshed 19 Nov) vs storage-bed-small-uk-bedroom-guide (33) | Overlapping intent | Fold the smaller one into the refreshed article + 301 | Owner |
| 9 | Velvet blogs: velvet-bed-frames-uk-style-guide vs best-velvet-bed-colours-2025 | 7 / 8 impressions; a third velvet post already 301s | Low priority; keep (colour vs buying intent) | — |
| 10 | Product duplicates | Chesterfield Tufted / Chester Chesterfield (Stage 5 approval 16); Mayfair Ottoman pair (uncertain); Memory Foam / Memory Orthopaedic; Pillow Top / 2000 Pocket Pillow Top (owner to state the difference) | Decide the pair, then give each a distinct angle | Owner |
| 11 | City pages | /pages/beds-manchester, -nottingham, -belfast, -leicester now **301 to /pages/bespoke-beds-uk** (VERIFIED); still show impressions (lag) | No action. Do not recreate city pages (no showroom) | — |
| 12 | /collections/all (177 impressions, pos 1.2), /search (110), /collections/frontpage (84) | Shopify system pages in results for brand-type queries | Low priority | — |

### D.4 New collections: recommendation is **none now**

| Candidate | Evidence | Verdict |
|---|---|---|
| Side-lift ottoman beds | "side lift ottoman bed" 114 impressions at pos 28, plus about 30 impressions on small-double side-lift variants (VERIFIED). Only **2** products are side-lift. The divan base offers left/right side opening in the configurator but its page says end-opening (F8, BLOCKED) | **Not now.** A 2-product collection is thin and would compete with the product that already ranks. Instead: one "Side lift ottoman beds" H2 section on ottoman-beds linking both products. Revisit if F8 confirms side opening on more bases (4 or more products) |
| Velvet beds | Velvet named in 125 product descriptions as a fabric choice; 13 impressions in the sample; no search volume pulled (no credits) | **No.** It would list nearly the whole range = duplicate of upholstered-beds. Use upholstered-beds + velvet guides. HYPOTHESIS to revisit with a keyword-volume check (research_keywords, 4 credits) in a later budget |
| Bouclé beds | 1 product (Cloud Teddy) | **No.** The product page is the owner |
| Single beds (3ft) | /pages/single-beds-3ft-uk exists (537 impressions); "3ft bed frame" / "3ft single bed" about 150 impressions in the HQ cache (HISTORICAL) | **No new collection.** Improve the page (fix its 2 H1s) |
| The 34 orphan products | In no design collection (only size or "all"): Mirror Strip Sunrise, Oxygen, Stone, Tower, Grand Luxury, Princess, Level Lines, Mini Line Luxury, Gold V Cross, Roman Sleigh and others | **Add them to existing design collections** (panel-beds / wingback-beds / a later "line" grouping), as a merch decision. This is the real gap |

---
## E. On-page audit and draft improvements

### E.1 Findings (VERIFIED from live HTML and Shopify, 19 Nov)

| Area | Finding | Impact | Fix (draft / owner) |
|---|---|---|---|
| Title pattern | Products: `Name \| Descriptor \| Eagle Bed`, 145/145 set, 144 within 60 characters. Descriptors are often generic ("Upholstered Bed Frame"). Collections: `Keyword UK \| Qualifier \| Eagle Bed`, all 45–60 characters | Titles are fine; the low CTR is about the offer and the snippet more than length | 41 drafts: lead with the searched term where GSC shows it ("square bed frame", "side lift ottoman bed", "ottoman beds") |
| Meta pattern | 143/145 products: "…handmade in Dewsbury from £X. Free delivery across Great Britain." 1 cut off (173 characters) | **15 metas pair a storage claim with a price that excludes storage (F1 ×9, F3 ×6).** Line Ambassador says "12 colours" (F6). Grand says "tallest" (F7). Panel Line Headboard reads as "bed from £90.99" (F13) | Drafts drop the price wherever it excludes what the title promises; all marked BLOCKED |
| Banned or unconfirmed claims | "Memory Orthopaedic" (product name, H1, title, meta, about 76 description cross-links); "Clearpay" (Pillow Top, /collections/mattresses); "orthopaedic" (mattresses meta); "solid wood frames" (upholstered-beds meta); "120 x 190 cm" (small-double-ottoman meta); "fits standard UK divan bases" (Chester Wingback Headboard); "54 inch" headboard heights in several metas | Compliance and accuracy risk | Drafts remove all of them. The product rename is BLOCKED (owner) |
| H1 | 1 visible H1 per product and collection page. The 19 Nov fix is live (dark ink, not white) | OK | — |
| H1 on pages | /pages/single-beds-3ft-uk and /pages/ottoman-bed-frame-buying-guide each have **2 H1s** | Minor | Owner/theme: make one an H2 |
| H2 structure (products) | 105 products have the same 9-H2 template. "Customization options — {name}" uses **US spelling on 135 pages**. "More from {collection}" names a size collection on some pages (for example "More from Double Beds" on Mirror Strip Sunrise) | Template H2s add no topical signal; US spelling on a UK site | Theme/app (Easify) label → "Customisation options". The "More from" block should use the product's design collection. Owner/theme, not done here |
| Thin / duplicate descriptions | None thin (median 391 body words). **But a median 68% of each description is shared template text**; 99 products are 60% or more template. Highest pair 0.80 (Box Panel / Linear Panel headboards) | Google may treat near-identical pages as one; unique value per product is small | Copywriting: a 60–80 word unique opening per product (design, who it suits, what makes it different), facts only. Start with the top 30 (the 19 Nov pattern used on Cloud Teddy, Side Lift Open, Panel Line ×2 and Memory Foam) |
| Internal links product → collection | Every product links to 1–4 collections, but 107 go to /collections/mattresses and 96 to upholstered-beds. Few go to the design or storage owner (storage-beds 4, divan-ottoman-beds 3). 34 products are in no design collection | Owner pages get little link equity from products | Add a "Shop more {design} beds" link to the owner collection per product type; fix collection membership |
| Product → guide | 60/145 link a guide (mostly how-to-choose-upholstered-bed 11, how-to-measure 9, how-do-ottoman-beds-work 8) | Missing the topic-cluster loop | Ottoman products → how-do-ottoman-beds-work; divans → divan-bed-vs-bed-frame-uk; chesterfield → chesterfield guide; kids → kids guide |
| Collection → guide → product | Collections link 0–2 guides. The 12 collections got answer paragraphs on 11 Nov, and ottoman/storage/divan got FAQs on 19 Nov | OK; keep | — |
| Images | Alt text 100% (good). File names: 578 "Gemini_Generated…" (68 products), 97 WhatsApp/IMG, 61 screenshots, about 590 random strings; about 167 descriptive | File names are a weak signal; the bigger issue is **whether the AI images show the real product** (Stage 3 owner Q17) | Owner answers Q17 first. If kept, rename on re-upload as `{product}-{colour}-{view}.jpg`. Do not mass re-upload (it resets image indexing; low value) |
| Delivery and trust on page | Free delivery, 14-day returns and 5-year warranty text appear on 145/145 product pages; Dewsbury on 140 | Good. Free delivery means to the door/downstairs (owner, 19 Nov) | Drafts say "free GB delivery" only, never "we carry/assemble" |
| Headboards | 17 standalone headboards, no delivery option, 0 orders ever (Stage 5) | Metas promise delivery that cannot be chosen | Draft headboard metas carry no delivery claim; HOLD (approval 17) |

### E.2 Draft metadata (`draft-metadata.csv`, 41 rows)

| Status | Products | Collections |
|---|---|---|
| READY for owner review | 19 | 10 (2 of them note F1: no prices) |
| BLOCKED / HOLD (needs an owner decision first) | 12: Cloud Teddy, Side Lift Open, Line Bumper (F1); Divan Drawer Base (F3); Grand Extra-Tall (F7); Ottoman Divan Base (F8 opening; meta only is ready); Line Ambassador (F6, wording ready); Chesterfield Tufted (approval 16); Panel Line Headboard (F13/17); Chester Wingback Headboard (17); Gold V Cross (F4 check); Memory Orthopaedic (rename) | 0 |

Every draft:
- uses UK English and facts from BRIEF.md or the product's own Shopify data (sizes from options, "from £" = Shopify minimum variant price);
- has a title of 60 characters or fewer and a meta of 120–155 characters;
- contains none of: Clearpay, best, leading, orthopaedic (except where naming the BLOCKED product), interest-free, mainland, assembly, dimensions or materials.
- Two titles changed on 19 Nov (Cloud Teddy, Ottoman Divan Base). The drafts keep those titles unchanged until 17 Dec, so the 19 Nov change can be measured.

### E.3 Suggested order of work (all need owner approval; nothing applied)

1. **Compliance now (low effort):** the mattresses collection meta, the Pillow Top meta, upholstered-beds and small-double-ottoman metas, the 15 F1/F3 metas with prices removed, the Chester Wingback and Panel Line headboard metas. Owner approval: metadata only.
2. **Snippet tests** on the 9 pages ranking at position 4–11 with 0–1 clicks. Measure on 17 Dec and 14 Jan.
3. **Indexing:** the owner runs URL Inspection on Line Bumper, Line Ambassador and Mirror Strip Sunrise. Then fix the feed link source (Stage 5 F2).
4. **Merchandising:** add the 34 orphan products to design collections. Add the side-lift H2 on ottoman-beds.
5. **Consolidation decisions** (two ottoman buying guides, the small-room guides, size collection review 10 Feb, divan-ottoman-beds 17 Dec).
6. **Unique 60–80 word openings** for the top 30 products (Copywriting).
7. **Owner decisions** that unblock copy: F1 (price-in or "base optional"), F3, F7, F8, approvals 16 and 17, the Memory Orthopaedic rename and Q17 (AI images).

---

## Limitations

- **GSC data:**
  - The page+query sample is truncated (1,000 rows, category words only). Cluster shares are indicative.
  - The page-level pull is complete (494 rows) but UK only. Its site summary line (429 clicks) is the whole property, not the UK filter; the page rows add up to 173 clicks.
  - The last 3 days are preliminary.
- **Session data:**
  - "Free listing" sessions (`product_sync`) include paid Shopping clicks before 28 Sep (Stage 1), so they are not purely organic.
  - Google-referrer orders cannot be split into paid and organic.
  - "Orders ever" is HISTORICAL (Stage 4).
- **Not measured here:** search volumes (no keyword research credits used), Search Console indexing, Google-selected canonicals, and the Search appearance report. All UNKNOWN; owner screenshots are listed in Stage 2 (S9, S10).
- **Classifications and scores:** class rules and the opportunity score are rule-based ESTIMATEs. Thresholds are stated in §C.2–C.3.
- **Description duplication:** measured on Shopify body text (5-word shingles), not the rendered page.
- **Images:** not viewed (the container cannot download cdn.shopify.com). Image findings come from file names and alt text only.
- **Fetch error:** one product page returned HTTP 500 once (200 on retry). Other pages may have intermittent errors that this single crawl did not catch.

## Credits used

| Call | Parameters | Credits |
|---|---|---|
| OpenRush get_search_performance | group_by page, last_3_months, country gbr, limit 1000, compare none | 3 |
| OpenRush get_search_performance | group_by page+query, last_3_months, country gbr, query regex (category words), limit 1000 | 3 |
| **Total** | Budget was 6 at most; the protected reserve was not touched | **6** |

Free calls: Shopify GraphQL (4 product pages, 1 collections query), ShopifyQL (5 queries), HQ db read (seo/gsc-latest), and 171 + 25 polite page fetches.
