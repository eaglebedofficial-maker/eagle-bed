# Rocket Stage 1: Traffic, SEO and Google Ads audit (Parts 3, 5 and SEO)

Prepared 19 Nov 2026. Read-only. Sources: Shopify ShopifyQL and Admin GraphQL (pulled today), OpenRush (Search Console and Google Ads 198-038-2450, pulled today), HQ db `seo/gsc-latest` and `seo/ranks` (19 Nov cache), repo files.

Periods used:
- Shopify: **current** = 20 Oct–18 Nov 2026, **previous** = 19 Sep–18 Oct 2026, and 90 days = 21 Aug–18 Nov.
- Search Console: 22 Oct–18 Nov vs 24 Sep–21 Oct (28 days, the last 3 days are preliminary).
- Google Ads: 23 Oct–19 Nov vs 25 Sep–22 Oct (28 days, the last 2 days are preliminary).

The windows differ by 1 to 3 days, so compare trends, not exact totals.

---

## Answer first

1. **Sales went up while traffic went down.** Orders were 16 (£6,947.57) in the current period, against 7 (£2,551.01 net) in the previous one. VERIFIED (Shopify `sales` by channel). The fall in sessions is mostly cheap Google clicks that did not buy, plus junk traffic.
2. **Most of the "decline" comes from paid Google clicks and labels, not from lost organic rankings.**
   - Google Ads clicks fell from 2,111 to 1,154 (-957). The Shopping campaign (678 clicks, 0 sales) and the Search campaign (294 clicks, 0 sales) were paused. VERIFIED (OpenRush Ads).
   - Search Console organic clicks went **up**, from 130 to 168 (+29%). VERIFIED (OpenRush GSC).
3. **Until about 28 Sep, paid Shopping/PMax clicks were very likely counted as free "organic" Google listings.** The Shopify Google channel tag `utm_campaign=sag_organic` gave 663 sessions in the week of 21 Sep, then 14 in the week of 5 Oct. Over the same weeks, `pmax_all_products`, `shopping_uk` and `search_uk` tags appear for the first time, even though PMax had run since 5 Sep and Shopping since 16 Jul. ESTIMATE/inference, explained in 3.4.
4. **Which sources bring buyers.** First touch of the 16 current orders:
   - Google Ads PMax: 8 orders, £3,106.50
   - direct: 3 orders, £1,874.65
   - ChatGPT: 1 order, £629.96
   - no tracking data: 4 orders, £1,336.46

   Social, email and organic Google web search brought **0** orders in the current period. VERIFIED (Shopify `customerJourneySummary` per order).
5. **Google Ads conversions are real orders.** All 6.96 conversions (£2,591.62) match 7 real Shopify orders by date and value. They are not duplicated. **However, 3 of the 7 came from people searching "eagle bed / eagle beds"**, who already knew the brand. ROAS without brand searches is about **1.7**, not 3.65. VERIFIED / ESTIMATE.

---

## PART 3: Traffic decline

### 3.1 Headline numbers

| Metric (Shopify) | Current 20 Oct–18 Nov | Previous 19 Sep–18 Oct | Change | Label |
|---|---|---|---|---|
| Sessions (all) | 1,969 | 2,727 | -27.8% | VERIFIED |
| Sessions, United Kingdom only | 1,380 | 2,233 | -38.2% | VERIFIED |
| Sessions with add to cart | 194 | 95 | +104% | VERIFIED |
| Sessions reached checkout | 163 | 31 | see 3.5 (bots) | VERIFIED |
| Sessions completed checkout | 12 | 4 | +200% | VERIFIED |
| Orders (sales schema) | 16 | 7 (+1 adjustment row) | +129% | VERIFIED |
| Total sales | £6,947.57 | £2,551.01 | +172% | VERIFIED |

**About the "1,489 sessions, -37%" figure.** I could not reproduce 1,489 with ShopifyQL. All sessions give 1,969 (-27.8%). UK-only sessions give 1,380 (-38.2%), which is close to the -37% quoted. The 1,489 figure probably came from a different window or filter in the Shopify admin. UNKNOWN which one.

**Weekly sessions over 90 days** (VERIFIED, Shopify):

| Week of | Sessions | Carts | Reached checkout | Completed checkout |
|---|---|---|---|---|
| 17 Aug (part) | 302 | 5 | 4 | 2 |
| 24 Aug | 854 | 23 | 9 | 2 |
| 31 Aug | 688 | 17 | 2 | 2 |
| 7 Sep | 659 | 18 | 2 | 0 |
| 14 Sep | 1,021 | 24 | 3 | 1 |
| 21 Sep | 928 | 16 | 6 | 0 |
| 28 Sep | 680 | 22 | 11 | 1 |
| 5 Oct | 356 | 24 | 7 | 2 |
| 12 Oct | 469 | 27 | 5 | 1 |
| 19 Oct | 627 | 39 | 8 | 1 |
| 26 Oct | 321 | 30 | 7 | 3 |
| 2 Nov | 406 | 66 | 40 | 4 |
| 9 Nov | 484 | 55 | 40 | 3 |
| 16 Nov (part) | 245 | 16 | 71 | 1 |

The peak weeks in September added very few carts. The weeks since 26 Oct have fewer sessions but 2 to 3 times more carts. Traffic quality rose as volume fell.

### 3.2 Sessions by referrer source (VERIFIED, Shopify `sessions`)

| Source | Sessions now | Before | Carts now / before | Completed checkout now / before |
|---|---|---|---|---|
| direct | 1,111 | 1,221 | 92 / 27 | 7 / 2 |
| search (Google, Bing etc.) | 804 | 1,353 | 99 / 64 | 5 / 2 |
| social | 26 | 27 | 1 / 0 | 0 / 0 |
| unknown | 13 | 124 | 0 / 4 | 0 / 0 |
| (blank) | 7 | 0 | 1 / 0 | 0 / 0 |
| email | 6 | 1 | 1 / 0 | 0 / 0 |
| paid | 2 | 1 | 0 / 0 | 0 / 0 |

- "search" lost 549 sessions. All of the loss is Google: 800 now against 1,346 before.
- The "paid" channel is almost empty because Shopify files Google Ads clicks under "search". The UTM table (3.3) is the only reliable way to separate paid from free traffic.
- Junk referrers last period: syndicatedsearch 53, googlesyndication 29, 996kk 3, and one or two sessions each from vivoooo, appleeee, oneplussss, mercanacar, zzpnbn and others. These total about 100. They are gone in the current period: syndicatedsearch 0, googlesyndication 5, the "unknown" source fell from 124 to 13. VERIFIED. So about 100 of the 758 lost sessions were junk.

### 3.3 Sessions by UTM campaign: the real split of Google traffic (VERIFIED, Shopify)

| utm source / medium / campaign | What it is | Now | Before | Carts now | Checkouts completed now |
|---|---|---|---|---|---|
| (none) | direct, organic web, bots | 881 | 966 | 74 | 5 |
| google / cpc / pmax_all_products | Google Ads PMax | **809** | 356 | 89 | 6 |
| chatgpt.com | ChatGPT links | **188** | 61 | 23 | 1 |
| google / cpc / search_uk | Ads Search (paused 28 Oct) | 44 | 115 | 0 | 0 |
| google / product_sync / sag_organic | Free Google listings (Shopify Google channel) | **22** | **1,149** | 2 | 0 |
| google / cpc / Google Shopping | older feed-tagged Shopping links (`stkn` param) | 15 | 13 | 3 | 0 |
| google / cpc / shopping_uk | Ads Shopping (paused) | 4 | 59 | 1 | 0 |
| klarna / referral | Klarna merchant boost | 2 | 0 | 2 | 0 |

**Weekly sag_organic sessions:**

| Week of | 24 Aug | 31 Aug | 7 Sep | 14 Sep | 21 Sep | 28 Sep | 5 Oct | 12 Oct | Nov weeks |
|---|---|---|---|---|---|---|---|---|---|
| Sessions | 342 | 414 | 329 | 699 | 663 | 248 | **14** | 8 | 1–8 |

**First week each paid tag appears (shopping_uk, search_uk, pmax_all_products): 28 Sep.** VERIFIED.

### 3.4 Is the decline real or measurement?

| Possible cause | Verdict | Evidence |
|---|---|---|
| Paid clicks counted as organic before 28 Sep | **Likely, and the biggest single factor in the "organic collapse".** Status: ESTIMATE (inference). | PMax started on 5 Sep and Shopping on 16 Jul (VERIFIED, OpenRush). Yet 0 sessions carried their campaign tags before 28 Sep. Shopping and PMax ads use the product feed link, and the Shopify Google channel adds `sag_organic` to that link, so before campaign tags were added, paid product clicks landed as "sag_organic". The week the campaign tags appear, sag_organic falls from 663 to 14 per week. Search Console's own product URLs with `sag_organic` get only about 1 click each, so true free-listing traffic was always small. To confirm: Google Ads → Settings → tracking template / final URL suffix history (change history around 28 Sep) and Merchant Center → Performance → free listings clicks. |
| Paid Google clicks really fell | **Real.** | Ads clicks went from 2,111 to 1,154 (-957). Shopping UK went from 678 clicks to 0, Search UK from 294 to 58. Both were paused and had 0 conversions (VERIFIED, OpenRush Ads). This volume was cheap (Shopping CPC about £0.15) and did not sell. |
| Organic web search fell | **No, it rose.** | GSC clicks 168 vs 130 (+29%), impressions 14,916 vs 9,569 (+56%). Average position worsened from 20.7 to 26.6 because many more deep, low-ranking queries now show (VERIFIED, OpenRush GSC; the HQ cache `seo/gsc-latest` agrees: 168 clicks, +38). |
| Brand search fell | **Partly real, partly moved to paid.** | GSC "eagle bed" went from 34 to 16 organic clicks and "eagle beds" from 5 to 3. In the same 28 days PMax bought 54 brand clicks (£49.67) on "eagle bed/beds" (VERIFIED). Paid brand ads now take clicks that used to be free. |
| Bot and junk referrers (vivoooo, appleeee, oneplussss …) | **Small. They inflated the previous period by about 100 sessions.** | See 3.2. They are not in the current period. |
| Shopify's 21 Sep 2026 sessions change | **UNKNOWN size. Not the main driver.** | I cannot read Shopify's definition change through the API. The weekly drop lines up with 28 Sep–5 Oct (the tag change), not with 21 Sep. Sessions in the week of 21 Sep (928) were still near the peak. Status: HISTORICAL claim, not verified. |
| New bot traffic hitting checkout (15–17 Nov) | **Real junk. It inflates "reached checkout".** | 97 "reached checkout" sessions on 15–17 Nov against only 14 cart sessions. They are desktop, "direct", land straight on `/checkout/…/shoppay_login`, and come from the US, Brazil, Bangladesh, Vietnam, Venezuela and Argentina. US sessions in the current period: 303, with 52 "reached checkout" and 0 orders. This looks like automated checkout probing, for example card-testing. Owner action: Shopify → Settings → Checkout → bot protection, and watch Payments for small failed charges. |

**Plain answer.**
- About 960 fewer paid clicks: the Shopping and Search campaigns, which sold nothing, were paused.
- About 100 fewer junk sessions.
- A tagging change that makes it look as if "free Google listings" collapsed.

Real organic Google search grew. The loss that matters is brand clicks moving from free to paid, which costs money and adds no buyers.

### 3.5 Device and country (VERIFIED, Shopify)

| Device | Sessions now / before | Carts | Reached checkout | Completed |
|---|---|---|---|---|
| Mobile | 1,327 / 1,996 | 139 / 77 | 36 / 21 | **11** / 4 |
| Desktop | 618 / 681 | 51 / 18 | 127 / 10 (bots) | **1** / 0 |
| Tablet | 20 / 42 | 4 / 0 | 0 | 0 |

Mobile is where buyers are: 11 of 12 completed checkouts. Desktop "reached checkout" is mostly the bot pattern.

| Country | Sessions now | Before |
|---|---|---|
| United Kingdom | 1,380 | 2,233 |
| United States | 303 | 339 |
| China | 18 | 25 |
| Brazil | 16 | 12 |
| Others | about 250 | |

About 30% of sessions are non-UK, and Eagle Bed sells only in the UK. These sessions dilute every conversion-rate figure.

### 3.6 Landing pages (VERIFIED, Shopify, top 30)

| Landing page | Sessions now / before | Carts now | Completed now |
|---|---|---|---|
| / (home) | 438 / 716 | 28 | 3 |
| /products/grand-extra-high-vertical-panel-upholstered-bed-frame | 112 / 5 | 16 | 0 |
| /products/line-ambassador-upholstered-bed-frame | 93 / 112 | 12 | 0 |
| /products/line-bumper-ottoman-divan-bed | 87 / **278** | 13 | 0 |
| /products/ottoman-gas-lift-divan-base | 84 / 192 | 5 | **2** |
| /products/side-lift-ottoman-gas-lift-storage-bed | 67 / 77 | 7 | 1 |
| /products/royal-chesterfield-upholstered-bed | 63 / 3 | 11 | 1 |
| /cart | 55 / 24 | 8 | 1 |
| /products/cloud-teddy-boucle-ottoman-gas-lift-storage-bed | 38 / 26 | 8 | 0 |
| /collections/ottoman-beds | 36 / 42 | 2 | 0 |
| /collections/upholstered-beds | 35 / 58 | 3 | 0 |
| /products/line-kids-upholstered-bed | 33 / 87 | 5 | 0 |
| /products/mini-line-wingback-kids-bed | 22 / 72 | 2 | 0 |
| /products/savoy-channel-tufted-bed-frame | 21 / 12 | 6 | 1 |
| /products/curved-wingback-upholstered-bed-frame | 21 / 6 | 4 | 1 |

The biggest landing-page losses were the home page (-278), line-bumper-ottoman-divan-bed (-191), ottoman-gas-lift-divan-base (-108), the two kids beds (-104) and /collections/upholstered-beds. These are the products that were fed by cheap Shopping/sag clicks. Collections still get very few landings (35–36 sessions each).

### 3.7 Which sources bring buyers (VERIFIED, order-level `customerJourneySummary`)

**90 days, 21 Aug–19 Nov:** 37 orders, of which 3 were cancelled or expired (#1010, #1014, #1020). The 34 valid orders by first touch:

| First touch | Valid orders | Order numbers |
|---|---|---|
| Google Ads PMax (`pmax_all_products`) | **9** | #1027 #1028 #1029 #1030 #1031 #1032 #1033 #1040 #1042 |
| Google product feed `sag_organic` (paid or free, see 3.4) | 6 | #1012 #1013 #1016 #1018 #1022 #1024 (all before 7 Oct) |
| Direct | 5 | #1011 #1025 #1034 #1038 #1043 |
| Facebook paid ads (Aug campaign 120251989473090445) | 2 | #1008 #1009 |
| ChatGPT | 1 | #1036 (Royal Chesterfield, £629.96) |
| Google organic web (SEO) | 1 | #1007 (Aug) |
| No journey data (cookie consent declined, or phone/draft orders) | 10 | #1015 #1017 #1019 #1021 #1023 #1026 #1035 #1037 #1039 #1041 |

**Current period only (16 orders, £6,947.57):**

| First touch | Orders | Value |
|---|---|---|
| PMax | 8 | £3,106.50 |
| Direct | 3 | £1,874.65 |
| ChatGPT | 1 | £629.96 |
| Unknown | 4 | £1,336.46 |

- Social organic, email, Pinterest and organic web search: **0 orders in 90 days**, apart from 1 SEO order in August.
- Several PMax buyers came back "direct" through /cart to finish (#1027 #1030 #1042). Their last-touch "direct" is really an ads customer.
- #1040 landed on /pages/about-us from a PMax ad: a brand search.

**Honest answer:** today the buyers come from **Google Ads (PMax)**, people who already know the brand (direct and brand search), and a growing **ChatGPT** stream: 188 sessions, 23 carts and 1 order in the current period, against 61 sessions before. Organic SEO brings browsers, mostly blog readers, but almost no buyers yet. Social has sold nothing directly in 90 days.

---

## PART 5: Google Ads (account 198-038-2450, read-only)

### 5.1 Campaigns as configured now (VERIFIED, OpenRush `get_ad_campaigns`, 19 Nov 04:27 UTC)

| Campaign | Type | Status | Budget | Bidding | Notes |
|---|---|---|---|---|---|
| Eagle Bed \| PMax \| All Products (24218981435) | Performance Max | **ENABLED, LIMITED (budget constrained)** | **£25/day** | Maximise conversions (no tROAS) | Started 5 Sep. Merchant 5756953290. UK presence-only targeting. All languages. Optimisation score 74.9%. Image extraction opted out. |
| Eagle Bed \| Search \| UK (24034402493) | Search | PAUSED (28 Oct) | £5/day | Max clicks, CPC cap £2 | Search network only |
| Eagle Bed \| Shopping \| UK (24044219251) | Standard Shopping | PAUSED | £15/day | Max clicks, CPC cap £0.80 | |
| Bed Shop in Dewsbury (24029277249) | PMax | Removed or ended (0 activity) | n/a | n/a | Appears in reports only |

Account negatives: only the "parked domains" content exclusion. **Yes, PMax is still £25/day**, and the total is within the £30/day cap.

### 5.2 Performance: last 28 days vs previous 28 days (VERIFIED, OpenRush `get_ad_performance`)

| Metric | 23 Oct–19 Nov | 25 Sep–22 Oct | Change |
|---|---|---|---|
| Spend | £709.44 | £674.41 | +£35.03 |
| Impressions | 57,923 | 100,925 | -43,002 |
| Clicks | 1,154 | 2,111 | -957 |
| CTR | 1.99% | 2.09% | |
| Avg CPC | £0.61 | £0.32 | +91% |
| Conversions | 6.96 | 3.04 | +3.92 |
| Conversion value | £2,591.62 | £1,276.85 | +£1,314.77 |
| Cost per conversion | £101.87 | £221.85 | -54% |
| ROAS (value / spend) | **3.65** | 1.89 | |

The previous-period row is derived from the deltas OpenRush returned (current minus delta).

**By campaign, current 28 days:**

| Campaign | Spend | Clicks | Conv | Value | ROAS | Previous spend / clicks / conv |
|---|---|---|---|---|---|---|
| PMax | £680.60 | 1,096 | 6.96 | £2,591.62 | 3.81 | £433.25 / 1,139 / 3.04 |
| Search UK | £28.84 (23–28 Oct) | 58 | 0 | £0 | 0 | £136.95 / 294 / 0 |
| Shopping UK | £0 | 0 | 0 | £0 | n/a | £104.21 / 678 / 0 |

**By network (PMax and Search):**

| Network | Spend | Clicks | Conversions |
|---|---|---|---|
| Search (includes Shopping placements) | £678.85 | 1,057 | all 6.96 |
| YouTube | £20.67 | 23 | 0 |
| Search partners | £3.39 | 15 | 0 |
| Gmail | £3.09 | 14 | 0 |
| Display | £2.77 | 41 | 0 |
| Discover | £0.63 | 3 | 0 |

**Daily pattern:** spend is £12–45 a day, with an average of about £25. **No conversions from 3 Nov to 12 Nov** (10 days, about £255). Only 6 of 28 days had a sale.

**Product-level performance:** OpenRush has no product or listing-group report. Status: UNKNOWN. A proxy from Shopify PMax first-touch orders shows that ottoman / gas-lift products lead:
- ottoman-gas-lift-divan-base: 3 orders (#1027, #1028, #1033)
- side-lift-ottoman-gas-lift-storage-bed: 3 (#1029, #1030, #1032)
- stone-upholstered-bed-frame / curved wingback: 1 (#1042)
- home or about-us page: 2 (#1031, #1040)

### 5.3 Search terms (VERIFIED, OpenRush `search_term`, top 60 rows = £225.76 of £709.44)

| Term | Spend | Clicks | Conv | Value |
|---|---|---|---|---|
| ottoman beds | £35.80 | 18 | 0 | £0 |
| **eagle bed** | £29.34 | 28 | 1 | £323.98 |
| **eagle beds** | £20.33 | 26 | 2 | £1,133.82 |
| side lift ottoman bed | £8.66 | 5 | 0 | |
| hale and hale (competitor) | £6.90 | 1 | 0 | |
| brown wingback bed frame | £6.03 | 2 | 0 | |
| brown bed / chocolate brown bed / brown double / brown king | £13.50 | 22 | 0 | |
| ottoman divan beds | £5.03 | 4 | 0 | |
| large headboard double bed | £3.85 | 11 | 0 | |
| obs beds (competitor) | £1.47 | 1 | **1** | £274.99 |
| Competitor and other brands: sosoftbeds, sosoft beds, moorcroft, pristine, jysk wakefield, zora, living comfort bedz, bedscraft, bed heaven, legend bed, style beds ltd, comforest, bedroomking, lorinza, elgen | about £30 | about 18 | 0 | |
| toddler bed with side rails, white tv beds, king size bed frame no headboard, red bed | small | | 0 | Off-range: Eagle Bed does not sell TV beds or toddler rails |

### 5.4 Are Google Ads conversions real Shopify orders?

Matched by click date and value (VERIFIED: Ads daily trend against Shopify orders):

| Ads day | Ads conv / value | Shopify order | Order total | First touch |
|---|---|---|---|---|
| 24 Oct | 2 / £619.18 | #1028 (24 Oct) + #1029 (27 Oct, 3 days to convert) | £362.68 + £256.50 = £619.18 | PMax |
| 31 Oct | 0.96 / £238.60 | #1030 | £247.50 | PMax |
| 1 Nov | 1 / £323.98 | #1031 | £323.98 | PMax ("eagle bed") |
| 2 Nov | 1 / £274.99 | #1032 | £274.99 | PMax ("obs beds") |
| 13 Nov | 1 / £556.19 | #1040 | £556.19 | PMax ("eagle beds", landed on about-us) |
| 14 Nov | 1 / £576.57 | #1042 | £578.68 | PMax ("eagle beds") |
| 11 and 12 Nov | 0 conv / £1.05 each | n/a | n/a | A secondary action that carries value |

**Verdict:**
- **Yes, they are real orders.** There is no double counting.
- Values equal the order totals, with small differences on #1030 and #1042.
- Fractional 0.96 means data-driven attribution.
- Google reports by click date, not order date.
- OpenRush flags that the account's attribution "may include view-through". None of the 7 looks like a view-through, because every one has a PMax-tagged click in Shopify.
- #1033 (3 Nov, £505.98, repeat customer, PMax first touch 20 days earlier) is in Shopify but **not** in Ads. This is a slight under-count.

**Conversion-tracking clues:**
- Values match Shopify order totals. That points to the Shopify Google & YouTube app purchase conversion. Status: ESTIMATE; conversion action names are not readable via OpenRush.
- A second action records £1.05 values: probably a micro-conversion with a default value. It should be secondary-only. UNKNOWN which action this is.
- Auto-tagging/UTMs: campaign UTMs (`utm_campaign=pmax_all_products`) were added around 28 Sep. Shopify's "paid" channel still shows only 2 sessions, so Shopify does not classify gclid clicks as paid. Use the UTM report.

**Brand vs non-brand:**
- 3 of 7 Ads sales (£1,457.80) came from "eagle bed/beds" searches that cost £49.67.
- Non-brand: about £1,133.82 value from about £659.77 spend, a **ROAS of about 1.72**. Cost per non-brand sale is about £165 (£659.77 / 4).
- Status: ESTIMATE. Assumes the 2 sales not in the top-60 search terms (24 and 31 Oct) were non-brand.
- Profit = UNKNOWN, because product costs are not known.

### 5.5 Shopping feed / Merchant data

- Products on the Google & YouTube channel: 145/145 live products, with vendor "Eagle Bed", category, images and descriptions. HISTORICAL (ops/sales/shopping-health-2026-11-10.md).
- **GTIN/barcodes: none set.** A sample of active variants (side-lift ottoman, 5 sizes) has empty barcodes. VERIFIED. This is normal for handmade products; brand + MPN/SKU with "identifier exists = no" is fine. **I could not read whether the Google channel sends `identifier_exists=false`.** Status: UNKNOWN.
- 1,295 variants exist in Shopify (VERIFIED, count).
- **Not readable:**
  - Merchant Center diagnostics: disapprovals, price mismatch, misrepresentation, free-listing clicks.
  - Google channel product statuses.
  - PMax listing-group/product report.
  - Conversion action list.

  Neither the Shopify Admin API nor OpenRush exposes these.
- Search Console shows 29 product URLs with `?variant=` or `utm=` parameters collecting impressions. Google is indexing feed/variant URLs as separate pages. This splits ranking signals; check the canonicals on product templates.

### 5.6 Top 10 Ads problems and opportunities

1. **Brand cannibalisation.** PMax spends on "eagle bed/beds" and takes 3 of 7 conversions. Organic brand clicks fell from 34 to 16. Add a brand exclusion to PMax (brand list) and let organic or a £1–2/day brand Search campaign cover it. Report non-brand ROAS (about 1.7) as the real number.
2. **Budget-limited at £25/day with no ROAS target.** "Limited by budget" plus Maximise conversions means Google chases cheap clicks. Average CPC doubled to £0.61 as the low-quality Shopping clicks left. Do not raise the budget (that is the owner's rule). Consider a tROAS once there are 15+ conversions in 30 days.
3. **Competitor-brand and off-range search terms** (about £30+ in the visible top 60): sosoftbeds, moorcroft, jysk, legend bed, toddler rails, TV beds, "brown/red bed". Add an account-level negative list. PMax accepts account negatives.
4. **"ottoman beds" is the single biggest paid term (£35.80, 0 sales) and organic rank for it is about 43.** Push the landing page to /collections/ottoman-beds with strong collection copy, and make sure the PMax final-URL expansion is not sending these users to random products.
5. **10-day no-sale stretch (3–12 Nov).** Monitor weekly. With roughly 7 sales a month, a single week tells little.
6. **YouTube, Display, Gmail and Discover spent £27 for 0 sales.** This is minor. PMax cannot exclude these fully; consider a Shopping-only PMax setup (feed-only asset group) later.
7. **Secondary £1.05 conversion action.** Confirm it is set to "secondary" so it does not steer bidding.
8. **#1033-type repeat or long-window buyers are not counted.** Enable Enhanced Conversions for web in the Google & YouTube app (free).
9. **Campaign-level UTMs exist but are ad-group/product blind.** Add `utm_content={product_id}` or `{adgroupid}` through the final URL suffix so Shopify can show which products sell from ads.
10. **Merchant Center unknowns.** The owner should open Merchant Center → Products → Needs attention and Performance → free listings. Check whether free listings are still live and whether "price mismatch" warnings exist (the permanent compare-at prices noted in docs/02-organic-growth-plan.md can trigger them).

---

## SEO opportunity section (Search Console, VERIFIED via OpenRush, 22 Oct–18 Nov)

Site total: 168 clicks (+38), 14,916 impressions (+5,347), CTR 1.13%, average position 26.6. The HQ cache `seo/gsc-latest` (same window) matches exactly.

### Top pages by organic clicks

| Page | Clicks (Δ) | Impressions | Position |
|---|---|---|---|
| / | 31 (-16) | 400 | 8.3 |
| /blogs/news/divan-bed-vs-bed-frame-uk | 14 (+14) | 827 | 17.8 |
| /products/cloud-teddy-boucle-ottoman-gas-lift-storage-bed | 9 (+6) | 933 | 9.2 |
| /pages/aftercare-and-feedback | 7 | 71 | 7.7 |
| /blogs/news/how-do-ottoman-beds-work | 6 | 1,291 | 7.8 |
| /pages/reviews | 6 | 27 | 2.2 |
| /collections/storage-beds | 5 (+4) | 1,066 | 38.7 |
| /blogs/news/ottoman-bed-vs-divan-bed-uk | 5 | 138 | 16.9 |
| /collections/panel-beds | 3 | 299 | 11.2 |
| /collections/divan-beds | 3 | 564 | 50.8 |
| /products/memory-foam-mattress-uk | 1 | 788 | 55.0 |
| /blogs/news/best-beds-for-small-bedrooms | 1 | 741 | 35.4 |

**Queries that lost clicks:** only brand terms lost: "eagle bed" -18 and "eagle beds" -2 (see 5.6 #1). No non-brand query lost more than 1 click.

### Near-win queries (positions 8–20) with the page that ranks

| Query | Page | Impressions | Position | Clicks |
|---|---|---|---|---|
| wingback panel bed | /collections/wingback-beds | 103 | 9.3 | 0 |
| what is a divan bed | /blogs/news/divan-bed-vs-bed-frame-uk | 101 | 18.6 | 1 |
| gas lift ottoman bed | /collections/ottoman-beds (query total 117) | 27 | 25.2 page / 19.1 query | 0 |
| divan vs bed frame | /blogs/news/divan-bed-vs-bed-frame-uk | 72 | 12.7 | 8 |
| panel bed / panel beds / panel bed frame | /collections/panel-beds | 51 / 25 / 25 | 10.7 / 14.2 / 16.6 | 1 |
| what is a divan bed base | divan-bed-vs-bed-frame-uk | 39 | 14.2 | 1 |
| chesterfield upholstered bed | /products/chesterfield-upholstered-bed-frame (plus a ?variant URL) | 34 | 18–19 | 0 |
| how does an ottoman bed work / how do ottoman beds work | /blogs/news/how-do-ottoman-beds-work | 33 / 30 | 9.3 / 8.1 | 0 |
| handmade beds yorkshire | (site) | 33 | 19.9 | 0 |
| cloud teddy bed / teddy cloud bed / cloud ottoman bed / teddy boucle ottoman bed | /products/cloud-teddy-boucle-ottoman-gas-lift-storage-bed | 30 / 22 / 13 / 13 | 10–13 | 0 |
| boucle small double ottoman bed | same Cloud product | 21 | 11.3 | 1 |
| beds for small bedrooms | /blogs/news/best-beds-for-small-bedrooms | 21 | 15.8 | 0 |
| upholstered divan bed | /collections/divan-beds | 18 | 16.1 | 0 |
| ottoman bed kit | /collections/storage-beds | 17 | 14.9 | 0 |
| curved wingback bed | (site) | 8 | 9.8 | 0 |
| handmade headboards | /collections/headboards | 9 | 13.9 | 0 |

### Commercial terms: current position and matching page

| Term | Ranking page | Impressions (28d) | Position | Label |
|---|---|---|---|---|
| ottoman beds (plural) | /collections/storage-beds | 7 (HQ ranks cache) | 43.3 | HISTORICAL (HQ `seo/ranks`) |
| ottoman beds uk | /collections/storage-beds | 30 | 21.1 | VERIFIED |
| ottoman storage beds | /collections/storage-beds | 84 | 24.8 | VERIFIED |
| ottoman storage bed | /collections/storage-beds | 53 | 47.9 | VERIFIED |
| gas lift ottoman bed | /collections/ottoman-beds | 117 (query) | 19.1 | VERIFIED |
| 4ft ottoman bed | /collections/small-double-ottoman-beds | 37 | 33.7 | VERIFIED |
| small double ottoman bed | /collections/small-double-ottoman-beds | 34 | 69.6 | VERIFIED |
| super king ottoman bed | /collections/super-king-beds | 15 | 61.7 | VERIFIED |
| king size ottoman / king size ottoman bed | none in top 250 rows | n/a | not ranking | UNKNOWN (below data threshold) |
| ottoman divan bed / divan ottoman bed | /collections/divan-ottoman-beds | 122 / 76 | 68–71 | VERIFIED |
| storage beds uk | /collections/storage-beds | 13 | 32.5 | VERIFIED |
| double storage bed | /collections/storage-beds | 15–18 | 68–72 | VERIFIED |
| divan beds / divan bed | /collections/divan-beds | 40 / 26 | 74.6 / 76.4 | VERIFIED |
| divan beds uk | /collections/divan-beds | 59 | 40.0 | VERIFIED |
| divan bed base with drawers | /products/divan-drawer-storage-base (+3 variant URLs) | 56 | 50–83 | VERIFIED |
| upholstered beds uk | none | 0 | not ranking | HISTORICAL (HQ ranks cache: 0 impressions) |
| king size upholstered bed frame | /collections/king-size-beds | 13 | 43.4 | VERIFIED |
| chesterfield bed / beds | /products/chesterfield-upholstered-bed-frame, /collections/chesterfield-beds, plus 4 variant URLs of chester-style | 84 / 66 | 21–84 (split) | VERIFIED |
| wingback bed / beds | /collections/wingback-beds | 20 / 14 | 26.6 / 27.1 | VERIFIED |
| panel bed | /collections/panel-beds | 51 | **10.7** | VERIFIED |

### SEO findings

1. **Ottoman terms are split between /collections/storage-beds and /collections/ottoman-beds.** Google ranks storage-beds for "ottoman beds uk / ottoman storage beds" and ottoman-beds for "gas lift ottoman bed". Pick one ottoman hub and point internal links at it.
2. **Chesterfield and divan base rankings are split across up to 5 URLs each**, including `?variant=` URLs. 29 parameterised URLs earn impressions. Check that product canonicals point to the clean URL.
3. **Fastest wins (positions 8–15 with impressions):**
   - /collections/panel-beds ("panel bed" at 10.7)
   - /collections/wingback-beds ("wingback panel bed" at 9.3, 103 impressions)
   - the Cloud teddy ottoman product (10–13)
   - the two ottoman/divan guides (8–18)

   Better titles and meta descriptions, plus internal links from the home page and guides, can move these onto page 1.
4. **The guides earn the clicks but do not sell.** The blog has 0 orders in 90 days. Add product/collection blocks and "from £…" links inside the top 3 guides.
5. **Mattress pages rank deep** (memory foam at 55–62 with about 790 impressions). This is low priority. These are not core products.
6. **AI-assistant style long queries** ("help me choose between a divan…", "i'm moving into a new flat…") rank at positions 2–8. Together with the ChatGPT referral growth (188 sessions, 1 order of £629.96), this shows the FAQ/guide format works for AI answers.

---

## Limitations

- The ShopifyQL `sessions` schema cannot count orders per referrer. Buyer sources come from per-order journey data, and 10 of 34 valid 90-day orders have none (consent declined or phone/draft orders).
- The "1,489 sessions" headline could not be reproduced. The cause of the gap is UNKNOWN.
- Shopify's 21 Sep 2026 session-definition change cannot be measured through the API.
- The "paid counted as sag_organic before 28 Sep" conclusion is an inference from tag timing. It needs confirming in Google Ads change history (tracking template / final URL suffix) and Merchant Center free-listing performance.
- Merchant Center diagnostics, Google channel product statuses, PMax product/listing-group reports, conversion-action settings and auto-tagging status could not be read.
- Ads previous-period figures are derived from OpenRush deltas.
- Ads, GSC and Shopify windows differ by 1–3 days.
- The last 2–3 days of GSC and Ads data are preliminary.
- Search-term data covers only the top 60 rows (£225.76 of £709.44 spend). PMax hides terms below the privacy threshold.
- Order totals include VAT and delivery extras. Profit = UNKNOWN (product costs unknown).
- GSC commercial-term rows come from the top 300 queries and the top 250 page+query pairs. Terms not shown may still have a few impressions.

## Credits used

OpenRush, total **18 credits** (task budget 30):

| # | Call | Cost |
|---|---|---|
| 1 | get_search_performance (28d vs previous, by page, 60 rows) | 3 |
| 2 | get_search_performance (28d vs previous, by query, 300 rows) | 3 |
| 3 | get_search_performance (28d, page + query, commercial regex filter, 250 rows) | 3 |
| 4 | get_ad_campaigns (all campaigns) | 3 |
| 5 | get_ad_performance (overview, 28d vs previous) | 3 |
| 6 | get_ad_performance (search_term, 28d, 60 rows) | 3 |
| | **Total** | **18** |

Shopify (ShopifyQL and GraphQL) and the HQ database reads cost no OpenRush credits. No writes were made anywhere.
