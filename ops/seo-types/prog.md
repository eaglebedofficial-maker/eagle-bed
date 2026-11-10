# Programmatic SEO: size × type collection pages (10 Nov 2026)

Job `prog` from ops/seo-types/PLAN.md. Plan only: **no Shopify writes were made**. The 38 unpublished `beds-<city>` pages found in Shopify (the brief says 41; only 38 exist under that pattern) stay unpublished and were not touched.

## How this was worked out

- **Search volume:** Google Ads Keyword Planner via Supermetrics (account 1980382450), location GB, language en, read 10 Nov 2026. OpenRush returned 402 Insufficient credits for both inspect_keyword and get_search_performance, so it was not used.
- **Search Console:** Google Search Console sc-domain:eaglebed.co.uk via Supermetrics, last 90 days requested but the free plan only returned data from 11 Oct 2026 (about 30 days). Impressions are summed over queries that name the size and the type; position is impression-weighted.
- **Products:** Shopify Admin GraphQL (read-only) products status:active, 187 products; 145 have an Online Store URL; public products.json has the same 145. A product matches a cell when it is a bed (Bed Frame, Ottoman Bed, Divan Bed or Kids Bed), offers that size in its Size option, and is that type by title, product type or tags.
- **Live products** = ACTIVE, on the Online Store, and not tagged `needs-pricing`. Only these show on a collection page, so the gate counts these. 42 ACTIVE products (14 kids beds, 17 divan beds, 4 ottoman beds, 6 bed frames and 1 mattress, including all 9 `needs-pricing` new designs) are not on the Online Store.
- **Gate:** UK Keyword Planner volume >= 200/month AND >= 4 live products (status ACTIVE, published on the Online Store, not tagged needs-pricing) that offer the size and are the type.
- **Opportunity score:** volume x min(liveProducts/12, 1); ties broken by Keyword Planner top-of-page bid.
- **Type rules used for matching:** ottoman = type Ottoman Bed or "Ottoman" in title (the `ottoman 50` tag on bed frames is ignored); storage = ottomans plus divans with "Storage" in the title (the 3 platform divans have no storage and are left out); gas lift = "gas lift" in title or tags; divan = type Divan Bed or "Divan" in title; velvet = "velvet" in title or tags (product descriptions confirm Plush Velvet); teddy bouclé = "teddy"/"bouclé" in title or tags; chesterfield and wingback = in title; kids = type Kids Bed; upholstered bed frame = type Bed Frame.
- **Important pattern:** every live storage bed and divan is offered in all five sizes, nearly all live bed frames are too (one starts at Small Double, two label the single size "Small (3FT)"), and every live kids bed comes in Kids Single, Single and Small Double. So a size × type page shows the same products as its type page. What makes each page worth having is the search intent, the size-specific intro and FAQ, not a different product list.

## Matrix

Volume = UK monthly searches for the keyword shown. GSC = impressions over ~30 days for queries naming the size and type, with average position. Live / Active = matching products.

| Size | Type | Keyword | UK vol/mo | GSC impr. | GSC pos. | Live | Active | Collection already | Result |
|---|---|---|---:|---:|---:|---:|---:|---|---|
| single | ottoman | single ottoman bed | 22200 | 23 | 33.4 | 11 | 15 | – | passed gate, Held: ops/AUTOPILOT_REGISTRY.md says add single and double ottoman pages only after the 26 Nov Search Console review of the two ottoman size pilots. |
| single | storage | single storage bed | 33100 | 9 | 45.8 | 17 | 38 | – | passed |
| single | gas lift | single gas lift bed | 590 | 0 | – | 11 | 14 | – | passed gate, not recommended (duplicate content) |
| single | divan | single divan bed | 9900 | 6 | 40.2 | 13 | 31 | – | passed |
| single | velvet | single velvet bed | 720 | 0 | – | 94 | 100 | – | passed gate, not recommended (duplicate content) |
| single | teddy boucle | single boucle bed | 140 | 0 | – | 14 | 15 | – | fail: demand under 200/month |
| single | chesterfield | single chesterfield bed | 90 | 10 | 24.6 | 7 | 13 | – | fail: demand under 200/month |
| single | wingback | single wingback bed | 10 | 0 | – | 20 | 29 | – | fail: demand under 200/month |
| single | kids | kids single bed | 22200 | 1 | 49.0 | 6 | 20 | – | passed |
| single | upholstered bed frame | single upholstered bed | 1000 | 1 | 33.0 | 94 | 99 | page single-beds-3ft-uk (published page, no single collection) | covered: page single-beds-3ft-uk (published page, no single collection) |
| small double | ottoman | small double ottoman bed | 27100 | 183 | 45.8 | 11 | 15 | small-double-ottoman-beds | exists: /collections/small-double-ottoman-beds |
| small double | storage | small double storage bed | 12100 | 13 | 36.5 | 17 | 38 | – | passed |
| small double | gas lift | small double gas lift bed | 320 | 6 | 22.7 | 11 | 14 | – | passed gate, not recommended (duplicate content) |
| small double | divan | small double divan bed | 4400 | 25 | 38.2 | 13 | 31 | – | passed |
| small double | velvet | small double velvet bed | 260 | 0 | – | 95 | 101 | – | passed gate, not recommended (duplicate content) |
| small double | teddy boucle | small double boucle bed | 170 | 19 | 11.2 | 14 | 15 | – | fail: demand under 200/month |
| small double | chesterfield | small double chesterfield bed | 50 | 1 | 30.0 | 7 | 13 | – | fail: demand under 200/month |
| small double | wingback | small double wingback bed | 10 | 0 | – | 20 | 29 | – | fail: demand under 200/month |
| small double | kids | kids small double bed | no data | 3 | 68.0 | 6 | 20 | – | fail: no Keyword Planner volume |
| small double | upholstered bed frame | small double upholstered bed | 480 | 2 | 9.5 | 95 | 100 | small-double-beds | covered: small-double-beds |
| double | ottoman | double ottoman bed | 18100 | 18 | 32.9 | 11 | 15 | – | passed gate, Held: ops/AUTOPILOT_REGISTRY.md says add single and double ottoman pages only after the 26 Nov Search Console review of the two ottoman size pilots. |
| double | storage | double storage bed | 22200 | 78 | 55.4 | 17 | 38 | – | passed |
| double | gas lift | double gas lift bed | 720 | 1 | 11.0 | 11 | 14 | – | passed gate, not recommended (duplicate content) |
| double | divan | double divan bed | 9900 | 5 | 37.8 | 13 | 31 | – | passed |
| double | velvet | double velvet bed | 720 | 0 | – | 89 | 95 | – | passed gate, not recommended (duplicate content) |
| double | teddy boucle | double boucle bed | 90 | 2 | 29.0 | 14 | 15 | – | fail: demand under 200/month |
| double | chesterfield | double chesterfield bed | 170 | 22 | 40.4 | 7 | 12 | – | fail: demand under 200/month |
| double | wingback | double wingback bed | 10 | 2 | 25.0 | 18 | 26 | – | fail: demand under 200/month |
| double | kids | kids double bed | 9900 | 0 | – | 0 | 2 | – | fail: under 4 live products |
| double | upholstered bed frame | double upholstered bed | 720 | 3 | 26.0 | 95 | 100 | double-beds | covered: double-beds |
| king | ottoman | king size ottoman bed | 33100 | 46 | 59.3 | 11 | 15 | king-size-ottoman-beds | exists: /collections/king-size-ottoman-beds |
| king | storage | king size storage bed | 1900 | 3 | 56.7 | 17 | 38 | – | passed |
| king | gas lift | king size gas lift bed | 210 | 2 | 62.0 | 11 | 14 | – | passed gate, not recommended (duplicate content) |
| king | divan | king size divan bed | 6600 | 31 | 56.4 | 13 | 31 | – | passed |
| king | velvet | king size velvet bed | 390 | 0 | – | 89 | 95 | – | passed gate, not recommended (duplicate content) |
| king | teddy boucle | king size boucle bed | 50 | 0 | – | 14 | 15 | – | fail: demand under 200/month |
| king | chesterfield | king size chesterfield bed | 170 | 28 | 43.2 | 7 | 12 | – | fail: demand under 200/month |
| king | wingback | king size wingback bed | 90 | 10 | 36.2 | 18 | 26 | – | fail: demand under 200/month |
| king | kids | king size kids bed | no data | 0 | – | 0 | 2 | – | fail: no Keyword Planner volume |
| king | upholstered bed frame | king size upholstered bed | 390 | 62 | 47.9 | 95 | 100 | king-size-beds | covered: king-size-beds |
| super king | ottoman | super king ottoman bed | 9900 | 54 | 52.4 | 11 | 15 | – | passed |
| super king | storage | super king storage bed | 720 | 2 | 47.5 | 17 | 38 | – | passed |
| super king | gas lift | super king gas lift bed | 50 | 1 | 52.0 | 11 | 14 | – | fail: demand under 200/month |
| super king | divan | super king divan bed | 2400 | 2 | 83.5 | 13 | 31 | – | passed |
| super king | velvet | super king velvet bed | 70 | 0 | – | 89 | 95 | – | fail: demand under 200/month |
| super king | teddy boucle | super king boucle bed | 40 | 0 | – | 14 | 15 | – | fail: demand under 200/month |
| super king | chesterfield | super king chesterfield bed | 20 | 29 | 34.5 | 7 | 12 | – | fail: demand under 200/month |
| super king | wingback | super king wingback bed | 30 | 0 | – | 18 | 26 | – | fail: demand under 200/month |
| super king | kids | super king kids bed | no data | 0 | – | 0 | 2 | – | fail: no Keyword Planner volume |
| super king | upholstered bed frame | super king upholstered bed | 260 | 4 | 52.5 | 95 | 100 | super-king-beds | covered: super-king-beds |

Other volumes checked: "single teddy bed" 70, "single boucle bed" 140, "teddy boucle bed" 390 (no size); "single upholstered bed frame" 320, "double upholstered bed frame" 480, "king size upholstered bed frame" 390; "childrens single bed" 22,200; "kids bed" 33,100; "small double kids bed", "single kids bed", "upholstered kids bed" no data; gas lift ottoman long-tails 10–50 each.

## Pages that pass the gate, ranked

| Rank | Page | UK vol/mo | Live | GSC impr. (pos.) | Score | Status |
|---:|---|---:|---:|---|---:|---|
| 1 | single storage | 33100 | 17 | 9 (45.8) | 33100 | passed |
| 2 | king ottoman | 33100 | 11 | 46 (59.3) | 30342 | exists: /collections/king-size-ottoman-beds |
| 3 | small double ottoman | 27100 | 11 | 183 (45.8) | 24842 | exists: /collections/small-double-ottoman-beds |
| 4 | double storage | 22200 | 17 | 78 (55.4) | 22200 | passed |
| 5 | single ottoman | 22200 | 11 | 23 (33.4) | 20350 | passed gate, Held: ops/AUTOPILOT_REGISTRY.md says add single and double ottoman pages only after the 26 Nov Search Console review of the two ottoman size pilots. |
| 6 | double ottoman | 18100 | 11 | 18 (32.9) | 16592 | passed gate, Held: ops/AUTOPILOT_REGISTRY.md says add single and double ottoman pages only after the 26 Nov Search Console review of the two ottoman size pilots. |
| 7 | small double storage | 12100 | 17 | 13 (36.5) | 12100 | passed |
| 8 | single kids | 22200 | 6 | 1 (49.0) | 11100 | passed |
| 9 | single divan | 9900 | 13 | 6 (40.2) | 9900 | passed |
| 10 | double divan | 9900 | 13 | 5 (37.8) | 9900 | passed |
| 11 | super king ottoman | 9900 | 11 | 54 (52.4) | 9075 | passed |
| 12 | king divan | 6600 | 13 | 31 (56.4) | 6600 | passed |
| 13 | small double divan | 4400 | 13 | 25 (38.2) | 4400 | passed |
| 14 | super king divan | 2400 | 13 | 2 (83.5) | 2400 | passed |
| 15 | king storage | 1900 | 17 | 3 (56.7) | 1900 | passed |
| 16 | single upholstered bed frame | 1000 | 94 | 1 (33.0) | 1000 | covered: page single-beds-3ft-uk (published page, no single collection) |
| 17 | single velvet | 720 | 94 | 0 (–) | 720 | passed gate, not recommended (duplicate content) |
| 18 | double velvet | 720 | 89 | 0 (–) | 720 | passed gate, not recommended (duplicate content) |
| 19 | double upholstered bed frame | 720 | 95 | 3 (26.0) | 720 | covered: double-beds |
| 20 | super king storage | 720 | 17 | 2 (47.5) | 720 | passed |
| 21 | double gas lift | 720 | 11 | 1 (11.0) | 660 | passed gate, not recommended (duplicate content) |
| 22 | single gas lift | 590 | 11 | 0 (–) | 541 | passed gate, not recommended (duplicate content) |
| 23 | small double upholstered bed frame | 480 | 95 | 2 (9.5) | 480 | covered: small-double-beds |
| 24 | king velvet | 390 | 89 | 0 (–) | 390 | passed gate, not recommended (duplicate content) |
| 25 | king upholstered bed frame | 390 | 95 | 62 (47.9) | 390 | covered: king-size-beds |
| 26 | small double gas lift | 320 | 11 | 6 (22.7) | 293 | passed gate, not recommended (duplicate content) |
| 27 | small double velvet | 260 | 95 | 0 (–) | 260 | passed gate, not recommended (duplicate content) |
| 28 | super king upholstered bed frame | 260 | 95 | 4 (52.5) | 260 | covered: super-king-beds |
| 29 | king gas lift | 210 | 11 | 2 (62.0) | 192 | passed gate, not recommended (duplicate content) |

Why some passing pages are not in the top 5:
- **King and small double ottoman** already exist (the two pilots).
- **Single and double ottoman** are held: ops/AUTOPILOT_REGISTRY.md (26 Nov) says to add them only if the two pilots get impressions. They are next in line after that review.
- **Gas lift × size** would list exactly the same 11 beds as the ottoman page for that size, so it would be a duplicate. Better to use "gas lift" wording inside the ottoman pages.
- **Velvet × size** would list 89–95 beds, nearly the whole size collection, so it adds nothing over /collections/double-beds etc.
- **Upholstered bed frame × size** is already what /collections/small-double-beds, double-beds, king-size-beds and super-king-beds show; single is served by the published page /pages/single-beds-3ft-uk (there is no single collection).
- **Teddy bouclé, chesterfield, wingback** have real products but fail on demand (every size is under 200 a month).
- **Kids double** has demand (9,900) but no live kids bed comes in Standard Double.

## Top 5 new collections

Top 5 = the highest-scoring pages with status "passed". The 5th place is a tie between single and double divan (both 9,900); double divan wins on the higher Keyword Planner top-of-page bid (£1.55 vs £1.14).

Rules use the Shopify `ruleSet` input that `collectionCreate` still accepts (columns TYPE, TITLE, VARIANT_TITLE; relations EQUALS, CONTAINS, STARTS_WITH; Shopify conditions are not case-sensitive). The 2026-10 Admin API shows these back as `sources` conditions. Each rule set was checked against all 187 ACTIVE products: it selects exactly the live products counted, and nothing else that is live.

### 1. Single Storage Beds  (`/collections/single-storage-beds`)

- Target search: "single storage bed", 33,100 a month in the UK
- SEO title (59 characters): Single Storage Beds 3ft | Ottoman & Drawer Beds | Eagle Bed
- Meta description (155 characters): Handmade single storage beds in 3ft: gas lift ottomans and drawer divans, upholstered in Dewsbury. Free delivery across Great Britain, 14-day free returns.
- Rules (products must match **any** conditions, appliedDisjunctively = true):
  - TYPE EQUALS "Ottoman Bed"
  - TITLE CONTAINS "Storage Bed"
  - TITLE CONTAINS "Storage Base"
  - TITLE CONTAINS "Divan Ottoman"
- Expected live products (17): bumper-ottoman-gas-lift-divan-bed, cambridge-storage-panel-bed-frame, cloud-teddy-boucle-ottoman-gas-lift-storage-bed, divan-drawer-storage-base, florida-ottoman-gas-lift-divan-bed, line-bumper-ottoman-divan-bed, mayfair-bumper-ottoman-gas-lift-divan-bed, mayfair-ottoman-divan-bed, mayfair-ottoman-gas-lift-divan-bed, multi-mini-line-divan-bed, ottoman-gas-lift-divan-base, oxford-divan-storage-bed-frame, oxford-storage-panel-bed-frame, side-lift-open-ottoman-bed, side-lift-ottoman-gas-lift-storage-bed, sussex-storage-panel-bed-frame, upholstered-storage-platform-bed
- The rule also picks up 21 ACTIVE products that are not on the Online Store; they will show automatically if they are published later: luxury-chesterfield-divan-bed-wingback-with-storage-drawer, luxury-chesterfield-divan-bed-with-storage-drawer, luxury-vertical-fluted-divan-bed-wingback-with-storage-drawer, luxury-vertical-fluted-divan-bed-with-storage-drawer, modern-wide-vertical-panel-wingback-bed-frame-with-storage-drawers, modern-horizontal-panel-wingback-bed-frame-with-storage-drawers, modern-horizontal-panel-bed-frame-with-storage-drawers, luxury-chesterfield-wingback-divan-bed-with-storage, luxury-panelled-upholstered-divan-bed-with-storage, chesterfield-ottoman-divan-bed-with-storage, luxury-panelled-divan-bed-with-storage, luxury-sunburst-panelled-divan-bed-with-storage, windsor-chesterfield-divan-bed-with-storage, luxury-horizontal-panelled-divan-bed-with-storage, kensington-chesterfield-wingback-divan-bed-with-storage, luxury-curved-chesterfield-divan-bed-with-storage, luxury-modern-panelled-divan-bed-with-storage, balmoral-chesterfield-wingback-divan-bed-with-storage, soho-smart-ottoman-bed-with-bluetooth-speakers-usb-charging, duchess-crystal-button-crushed-velvet-ottoman-bed, windermere-velvet-sleigh-ottoman-bed

Intro (163 words, HTML):

```html
<p>Looking for a single storage bed that frees up space in a small bedroom? Every bed on this page comes in Single 3ft, which takes a standard UK single mattress of 90 x 190cm, and each one has storage built into the base.</p>
<p>There are two kinds. Gas lift ottoman beds raise the whole mattress platform on hydraulic struts to open one large compartment underneath: choose end lift if you have clear floor at the foot of the bed, or side lift if the foot of the bed sits against a wall. Divan storage beds have pull-out drawers instead, so there is no lifting, but leave at least 60cm of clear floor on the drawer side.</p>
<p>Each bed is handmade to order in our Dewsbury workshop. Most designs can be upholstered in solid colours, stripes or two-tone, and free fabric swatches let you check the colour at home. Delivery is free across Great Britain by our own team, usually in 3–5 working days.</p>
```

FAQ:

- **What size is a single storage bed?** Single is 3ft wide and takes a standard UK single mattress of 90 x 190cm. Every bed on this page is available in that size.
- **Ottoman or drawers: which is better for a single bed?** A gas lift ottoman lifts the whole mattress platform and gives the most storage, but it needs clear height above the bed. Drawers need no lifting and suit rooms with a sloping ceiling or a shelf over the bed, but need about 60cm of clear floor in front of them.
- **How much is delivery?** Delivery is free across England, Scotland and Wales by our own team, usually in 3–5 working days. Northern Ireland, Jersey, Guernsey and the Isle of Man are £90.
- **Can I return a storage bed?** Yes. You have 14 days for free returns if the bed is unused, unassembled and in its original packaging. Every bed frame also has a 5-year warranty.

### 2. Double Storage Beds  (`/collections/double-storage-beds`)

- Target search: "double storage bed", 22,200 a month in the UK
- SEO title (60 characters): Double Storage Beds 4ft6 | Ottoman & Drawer Beds | Eagle Bed
- Meta description (143 characters): Double storage beds in 4ft6, handmade in Dewsbury: gas lift ottoman beds and divans with drawers. Free GB delivery and a 5-year frame warranty.
- Rules (products must match **any** conditions, appliedDisjunctively = true):
  - TYPE EQUALS "Ottoman Bed"
  - TITLE CONTAINS "Storage Bed"
  - TITLE CONTAINS "Storage Base"
  - TITLE CONTAINS "Divan Ottoman"
- Expected live products (17): bumper-ottoman-gas-lift-divan-bed, cambridge-storage-panel-bed-frame, cloud-teddy-boucle-ottoman-gas-lift-storage-bed, divan-drawer-storage-base, florida-ottoman-gas-lift-divan-bed, line-bumper-ottoman-divan-bed, mayfair-bumper-ottoman-gas-lift-divan-bed, mayfair-ottoman-divan-bed, mayfair-ottoman-gas-lift-divan-bed, multi-mini-line-divan-bed, ottoman-gas-lift-divan-base, oxford-divan-storage-bed-frame, oxford-storage-panel-bed-frame, side-lift-open-ottoman-bed, side-lift-ottoman-gas-lift-storage-bed, sussex-storage-panel-bed-frame, upholstered-storage-platform-bed
- The rule also picks up 21 ACTIVE products that are not on the Online Store; they will show automatically if they are published later: luxury-chesterfield-divan-bed-wingback-with-storage-drawer, luxury-chesterfield-divan-bed-with-storage-drawer, luxury-vertical-fluted-divan-bed-wingback-with-storage-drawer, luxury-vertical-fluted-divan-bed-with-storage-drawer, modern-wide-vertical-panel-wingback-bed-frame-with-storage-drawers, modern-horizontal-panel-wingback-bed-frame-with-storage-drawers, modern-horizontal-panel-bed-frame-with-storage-drawers, luxury-chesterfield-wingback-divan-bed-with-storage, luxury-panelled-upholstered-divan-bed-with-storage, chesterfield-ottoman-divan-bed-with-storage, luxury-panelled-divan-bed-with-storage, luxury-sunburst-panelled-divan-bed-with-storage, windsor-chesterfield-divan-bed-with-storage, luxury-horizontal-panelled-divan-bed-with-storage, kensington-chesterfield-wingback-divan-bed-with-storage, luxury-curved-chesterfield-divan-bed-with-storage, luxury-modern-panelled-divan-bed-with-storage, balmoral-chesterfield-wingback-divan-bed-with-storage, soho-smart-ottoman-bed-with-bluetooth-speakers-usb-charging, duchess-crystal-button-crushed-velvet-ottoman-bed, windermere-velvet-sleigh-ottoman-bed

Intro (163 words, HTML):

```html
<p>A double storage bed keeps spare bedding, towels and out-of-season clothes under the bed instead of in the wardrobe. Every bed here is offered in Standard Double 4ft6, the size that takes a UK double mattress of 135 x 190cm. If your room is tight, the same designs also come in Small Double 4ft.</p>
<p>Pick a gas lift ottoman for the biggest storage space: the full mattress platform rises on hydraulic struts and opens from the end or, on our side lift models, from the side. Pick a divan with drawers if there is a low window, a sloping ceiling or a shelf above the bed, because drawers pull out rather than lift up.</p>
<p>Every bed is made to order and upholstered by hand in Dewsbury, West Yorkshire. Most designs can be upholstered in solid colours, stripes or two-tone, and free fabric swatches let you check the colour at home. Pay by card, PayPal, Klarna or Clearpay, with free delivery across Great Britain.</p>
```

FAQ:

- **Is a double storage bed 4ft6?** Yes. A standard UK double is 4ft6 and takes a 135 x 190cm mattress. A small double is 4ft (120 x 190cm). Our bed sizes guide explains the difference.
- **Does an ottoman bed need space above it?** Yes. The whole platform swings up, so check that nothing fixed above the bed, such as a shelf or a low window, stops it opening fully. Drawer beds do not need this clearance.
- **Can I see the fabric before I order?** Yes. Free fabric swatches are available, so you can check the colour and feel at home before you choose.
- **What warranty do you give?** Every bed frame has a 5-year warranty, and you have 14 days for free returns if the bed is unused, unassembled and in its original packaging.

### 3. Small Double Storage Beds  (`/collections/small-double-storage-beds`)

- Target search: "small double storage bed", 12,100 a month in the UK
- SEO title (52 characters): Small Double Storage Beds 4ft | Handmade | Eagle Bed
- Meta description (143 characters): Small double storage beds in 4ft: side lift and end lift ottomans plus drawer divans, handmade in Dewsbury. Free delivery across Great Britain.
- Rules (products must match **any** conditions, appliedDisjunctively = true):
  - TYPE EQUALS "Ottoman Bed"
  - TITLE CONTAINS "Storage Bed"
  - TITLE CONTAINS "Storage Base"
  - TITLE CONTAINS "Divan Ottoman"
- Expected live products (17): bumper-ottoman-gas-lift-divan-bed, cambridge-storage-panel-bed-frame, cloud-teddy-boucle-ottoman-gas-lift-storage-bed, divan-drawer-storage-base, florida-ottoman-gas-lift-divan-bed, line-bumper-ottoman-divan-bed, mayfair-bumper-ottoman-gas-lift-divan-bed, mayfair-ottoman-divan-bed, mayfair-ottoman-gas-lift-divan-bed, multi-mini-line-divan-bed, ottoman-gas-lift-divan-base, oxford-divan-storage-bed-frame, oxford-storage-panel-bed-frame, side-lift-open-ottoman-bed, side-lift-ottoman-gas-lift-storage-bed, sussex-storage-panel-bed-frame, upholstered-storage-platform-bed
- The rule also picks up 21 ACTIVE products that are not on the Online Store; they will show automatically if they are published later: luxury-chesterfield-divan-bed-wingback-with-storage-drawer, luxury-chesterfield-divan-bed-with-storage-drawer, luxury-vertical-fluted-divan-bed-wingback-with-storage-drawer, luxury-vertical-fluted-divan-bed-with-storage-drawer, modern-wide-vertical-panel-wingback-bed-frame-with-storage-drawers, modern-horizontal-panel-wingback-bed-frame-with-storage-drawers, modern-horizontal-panel-bed-frame-with-storage-drawers, luxury-chesterfield-wingback-divan-bed-with-storage, luxury-panelled-upholstered-divan-bed-with-storage, chesterfield-ottoman-divan-bed-with-storage, luxury-panelled-divan-bed-with-storage, luxury-sunburst-panelled-divan-bed-with-storage, windsor-chesterfield-divan-bed-with-storage, luxury-horizontal-panelled-divan-bed-with-storage, kensington-chesterfield-wingback-divan-bed-with-storage, luxury-curved-chesterfield-divan-bed-with-storage, luxury-modern-panelled-divan-bed-with-storage, balmoral-chesterfield-wingback-divan-bed-with-storage, soho-smart-ottoman-bed-with-bluetooth-speakers-usb-charging, duchess-crystal-button-crushed-velvet-ottoman-bed, windermere-velvet-sleigh-ottoman-bed

Intro (145 words, HTML):

```html
<p>A small double storage bed suits a box room, a guest room or a first flat. At 4ft wide it takes a 120 x 190cm mattress, 15cm narrower than a standard double, and the space underneath can do the job of a chest of drawers.</p>
<p>Every bed on this page comes in Small Double 4ft. Our side lift ottomans open from the side, so the bed can sit foot-to-wall in a narrow room and still open fully; leave about 60cm of walking space down one side. End-opening ottomans need clear floor at the foot instead. Prefer not to lift anything? The drawer divans let you open one drawer at a time.</p>
<p>Only want lift-up storage? See our <a href="/collections/small-double-ottoman-beds">small double ottoman beds</a>. Every bed is handmade to order in Dewsbury, with free delivery across Great Britain by our own team, usually in 3–5 working days.</p>
```

FAQ:

- **What size is a small double bed?** A small double is 4ft wide and takes a standard UK small double mattress of 120 x 190cm. A standard double is 4ft6 (135 x 190cm).
- **Will a storage bed fit in a box room?** Measure first. A side lift ottoman can sit with its foot against a wall but needs about 60cm of walking space on one side. A drawer bed needs about 60cm of clear floor on the drawer side.
- **Do the beds take a standard mattress?** Yes. Each base takes a standard UK mattress in the size you order, and our mattresses come in Small Double 4ft too.
- **Can I spread the cost?** Yes, with Klarna or Clearpay at checkout. You can also pay by card or PayPal.

### 4. Kids Single Beds  (`/collections/kids-single-beds`)

- Target search: "kids single bed", 22,200 a month in the UK
- SEO title (56 characters): Kids Single Beds 3ft | Upholstered Kids Beds | Eagle Bed
- Meta description (147 characters): Upholstered kids single beds in 3ft, handmade to order in Dewsbury. Padded headboards, free fabric swatches and free delivery across Great Britain.
- Rules (products must match **all** conditions, appliedDisjunctively = false):
  - TYPE EQUALS "Kids Bed"
  - VARIANT_TITLE STARTS_WITH "Single"
- Expected live products (6): chester-kids-upholstered-bed, line-kids-upholstered-bed, line-wingback-kids-upholstered-bed, mayfair-kids-upholstered-bed, middle-lines-kids-upholstered-bed, mini-line-wingback-kids-bed
- The rule also picks up 14 ACTIVE products that are not on the Online Store; they will show automatically if they are published later: vertical-channelled-upholstered-kids-bed, chesterfield-button-tufted-upholstered-kids-bed, chevron-panel-upholstered-kids-bed, vertical-fluted-upholstered-kids-bed, scalloped-fan-panel-upholstered-kids-bed, square-panel-upholstered-kids-bed, sunburst-panel-upholstered-kids-bed, scalloped-shell-panel-upholstered-kids-bed, horizontal-channelled-upholstered-kids-bed, framed-panel-upholstered-kids-bed, wingback-horizontal-channel-upholstered-kids-bed, scalloped-upholstered-kids-bed, rainbow-upholstered-kids-bed, cloud-upholstered-kids-bed

Intro (153 words, HTML):

```html
<p>Our kids single beds are fully upholstered children's beds, handmade to order in our Dewsbury workshop. Every bed on this page comes in Single 3ft, which takes a standard UK single mattress of 90 x 190cm. Each design is also offered in Kids Single 2'6 for a smaller room and Small Double 4ft for more space.</p>
<p>The padded headboards are upholstered by hand over a solid frame, in styles from a classic buttoned panel to clean lines and soft wingbacks. Choose solid colours, stripes or two-tone, or ask about a custom fabric and colour, and order free swatches to check the colour at home first.</p>
<p>Delivery is free across Great Britain by our own team, usually in 3–5 working days, and you have 14 days for free returns if the bed is unused, unassembled and in its original packaging. Questions about sizes? Call us on 07417 439197, Monday to Friday, 9am to 6pm.</p>
```

FAQ:

- **What sizes do your kids beds come in?** Kids Single 2'6, Single 3ft and Small Double 4ft. This page shows the Single 3ft option, which takes a 90 x 190cm mattress.
- **Can I choose the colour?** Yes. Pick solid colours, stripes or two-tone, or ask about a custom fabric and colour. Free fabric swatches are available.
- **Do you sell a mattress to fit?** Yes. Our mattresses come in Single 3ft and Small Double 4ft, so order the size that matches the bed.
- **How long does delivery take?** Usually 3–5 working days by our own team. Delivery is free across England, Scotland and Wales; Northern Ireland, Jersey, Guernsey and the Isle of Man are £90.

### 5. Double Divan Beds  (`/collections/double-divan-beds`)

- Target search: "double divan bed", 9,900 a month in the UK
- SEO title (55 characters): Double Divan Beds 4ft6 | Upholstered Divans | Eagle Bed
- Meta description (152 characters): Upholstered double divan beds in 4ft6: platform, drawer and gas lift ottoman divans, handmade in Dewsbury. Free GB delivery and a 5-year frame warranty.
- Rules (products must match **any** conditions, appliedDisjunctively = true):
  - TYPE EQUALS "Divan Bed"
  - TITLE CONTAINS "Divan"
- Expected live products (13): brooklyn-divan-upholstered-bed, cambridge-storage-panel-bed-frame, divan-bed-with-footboard, divan-drawer-storage-base, line-bumper-ottoman-divan-bed, mayfair-ottoman-divan-bed, multi-mini-line-divan-bed, ottoman-gas-lift-divan-base, oxford-divan-storage-bed-frame, oxford-storage-panel-bed-frame, small-line-divan-upholstered-bed, sussex-storage-panel-bed-frame, upholstered-storage-platform-bed
- The rule also picks up 18 ACTIVE products that are not on the Online Store; they will show automatically if they are published later: luxury-chesterfield-divan-bed-wingback-with-storage-drawer, luxury-chesterfield-divan-bed-with-storage-drawer, luxury-vertical-fluted-divan-bed-wingback-with-storage-drawer, luxury-vertical-fluted-divan-bed-with-storage-drawer, modern-wide-vertical-panel-wingback-bed-frame-with-storage-drawers, modern-horizontal-panel-wingback-bed-frame-with-storage-drawers, modern-horizontal-panel-bed-frame-with-storage-drawers, luxury-chesterfield-wingback-divan-bed-with-storage, luxury-panelled-upholstered-divan-bed-with-storage, chesterfield-ottoman-divan-bed-with-storage, luxury-panelled-divan-bed-with-storage, luxury-sunburst-panelled-divan-bed-with-storage, windsor-chesterfield-divan-bed-with-storage, luxury-horizontal-panelled-divan-bed-with-storage, kensington-chesterfield-wingback-divan-bed-with-storage, luxury-curved-chesterfield-divan-bed-with-storage, luxury-modern-panelled-divan-bed-with-storage, balmoral-chesterfield-wingback-divan-bed-with-storage

Intro (159 words, HTML):

```html
<p>A divan is an upholstered box base that supports your mattress across its whole top, and every divan on this page comes in Standard Double 4ft6 for a 135 x 190cm mattress.</p>
<p>There are three kinds of base. Platform divans have a firm top and no built-in storage, for the simplest look. Drawer divans add pull-out drawers in the base, so you can reach bedding without lifting anything. Ottoman divans raise the whole mattress platform on hydraulic gas struts and give the most storage of the three. Some beds are complete sets with a matching upholstered headboard; the plain bases can be paired with one of our headboards.</p>
<p>Every divan is handmade to order in our Dewsbury workshop. Most designs can be upholstered in solid colours, stripes or two-tone, and free fabric swatches let you check the colour at home. Delivery is free across Great Britain, usually within 3–5 working days, and every bed frame has a 5-year warranty.</p>
```

FAQ:

- **What is the difference between a divan and an ottoman bed?** A divan is an upholstered box base, either with drawers or with no storage. An ottoman is a divan whose whole mattress platform lifts on gas struts, opening the full footprint of the bed as storage.
- **What size is a double divan?** A standard double divan is 4ft6 and takes a UK double mattress of 135 x 190cm.
- **Does a divan come with a headboard?** Some of our divans are complete sets with a matching upholstered headboard; the plain bases can be paired with one of our headboards. Each product page says what is included.
- **How do returns work?** You have 14 days for free returns if the bed is unused, unassembled and in its original packaging, and we collect it. Every bed frame has a 5-year warranty.

### Notes on the rules

- **Storage and divan pages use "match any".** Shopify cannot mix AND and OR in one rule set, and there is no single tag or title word that covers every storage bed or every divan. So these rules pick by type and title and do not check the size. That is safe today because every live storage bed and divan is offered in all five sizes. If a product without that size is added later, it would appear on the page, so check the page after adding new storage beds or divans.
- **Kids single beds use "match all"**, so the size is checked (VARIANT_TITLE STARTS_WITH "Single" matches "Single (3FT)" but not "Kids Single (2.6FT)").
- The storage rule uses "Storage Bed" and "Storage Base" rather than "Storage" so that the Upholstered Ottoman Storage Box is not picked up.
- Overlap to know about: /collections/storage-beds, /collections/divan-beds and /collections/kids-beds show the same live products without a size. The small double storage intro links to /collections/small-double-ottoman-beds.

## Things found along the way (not changed)

- OpenRush has no credits (402), so volumes and Search Console data came from Supermetrics instead. Its free plan only returns Search Console data from 11 Oct 2026.
- 9 products tagged `needs-pricing` are ACTIVE but not on the Online Store. They are not counted.
- 2 bed frames label the single size "Small (3FT)" instead of "Single (3FT)". This does not affect the top 5.
- Search Console shows "small double cloud bed" / "teddy boucle small double ottoman bed" queries at average positions of about 5–12, the best rankings in this data. They most likely land on the Cloud Teddy Bouclé Ottoman Bed (not checked by page), so a separate teddy bouclé page is not needed.
- Live kids beds: 6 of 20 ACTIVE. Publishing more kids beds to the Online Store would make the kids single page much stronger (owner decision).
