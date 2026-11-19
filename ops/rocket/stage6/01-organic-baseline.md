# Rocket Stage 6, parts 3 and 15: organic baseline, organic sales attribution, Stage 5 carry-forward

Prepared 19 Nov 2026 (night) by the Search Console, Analytics and Data Verification specialists. Read-only: nothing was changed in GSC, GA4, Shopify, the theme or any feed. Order numbers only, no customer personal data. Nothing committed.

**Files**
| File | Contents |
|---|---|
| `organic-baseline.csv` | GSC totals per window, monthly series, device, country, query classes, brand vs non-brand, top 200 queries (90 days, with class and 28-day values), page types, URL tag types, top 60 pages, GSC/GA4/Shopify reconciliation |
| `organic-revenue-attribution.csv` | Organic funnels (last 30, since 5 Oct, last 90) by landing type, organic landing pages, every order with a Google organic or feed-tag visit since March, summaries |
| `stage5-carry-forward.csv` | The 10 Stage 5 blockers plus the Clearpay check, all re-checked tonight |

**Labels:** VERIFIED (pulled today, source named) · ESTIMATE (rule or assumption stated) · HYPOTHESIS (explanation not yet proven) · UNKNOWN · HISTORICAL (earlier stage).

**Windows used.** GSC data for this property starts on 1 Mar 2026 (first click 3 Mar) and ends on **17 Nov 2026**; the last ~3 days are preliminary. OpenRush's GSC windows end on 19 Nov, so 18–19 Nov hold no data yet. Every window is stated with its dates; windows are never mixed inside one table.

---

## Answers first

**A. Which keywords bring customers?**
- **No search keyword can be tied to an order.** Search Console reports queries in aggregate and Shopify stores only a landing page and referrer per visit. A query-to-order join does not exist. UNKNOWN by design.
- **In the last 30 and the last 90 days, no order came from an organic Google web visit** (first or last visit, untagged Google referrer). VERIFIED (Shopify journeys for every order).
- Since March, only **two** paid, unrefunded orders had an organic web first visit. #1007 (21 Aug, £561.59, Line Kids Velvet) landed on the home page, which suggests a **brand** search (HYPOTHESIS). #1005 (9 Aug, £385.97) landed on a product page, which suggests a **non-brand or product** search (ESTIMATE). Two more home-page organic orders (#1001, #1006) were refunded in full.
- One probable **free Google product listing** order: #1024 (6 Oct, £337.99, 3000 Pocket Sprung Mattress), tagged `sag_organic` after paid campaigns got their own tags. ESTIMATE. The matching GSC query "3000 pocket sprung mattress" has 205 impressions at position 19, with 0 web clicks in 90 days (VERIFIED). The order cannot be proven to come from that query.
- **What brings organic clicks (90 days, VERIFIED):**
  - Brand: 107 clicks ("eagle bed" 88, "eagle beds" 17).
  - Guide queries: "divan vs bed frame" 8, "ottoman bed meaning" 4, "how do ottoman beds work" 2, "what is a divan bed" family about 5.
  - Product names: Cloud/Teddy bouclé 8 ("small double cloud bed" 2, "teddy boucle ottoman bed" 2), "panel line bed" 2.
  - Generic commercial terms are large but rank deep: 808 queries, 6,751 impressions, 32 clicks, position 36.
- **The keywords closest to customers** are the Cloud Teddy product queries. Their landing page is the only organic product page with checkouts (25 sessions, 3 carts, 2 checkouts, 0 orders in 90 days). VERIFIED.

**K. Which organic visits become orders?**
- **Last 30 days (21 Oct–19 Nov), UK human organic sessions: 89 → 15 carts → 4 checkouts → 0 orders.** VERIFIED (ShopifyQL). This includes `sag_organic`.
- **Since 5 Oct** (the cleanest window, because paid clicks now carry their own tags): **136 → 22 → 6 → 1 order**. The one order is #1024 from a free listing (ESTIMATE). Organic web search alone: 105 sessions, 17 carts, 5 checkouts, 0 orders.
- **The home page is where organic visitors act:**
  - 90 days: 324 sessions, 26 carts, 10 checkouts, 0 orders.
  - Since 5 Oct: 48 sessions, 10 carts.
  - Most home landings are brand searches (ESTIMATE: 145 GSC home clicks against 107 brand-query clicks).
  - **HYPOTHESIS:** brand searchers come back and buy through a direct visit. Shopify then records the order as "direct", as with #1007 (first visit Google organic, last visit direct). The 3 direct orders and 4 no-journey orders in the last 28 days may hide such cases.
- Blog and guide visits: 16 sessions in 90 days, 0 carts. They earn impressions and AI-style queries, not sales (VERIFIED).

---

## 1. Search Console baseline (VERIFIED, OpenRush GSC, web, all countries)

| Window | Dates | Clicks | Impressions | CTR | Avg position | Previous window | Prev clicks | Prev impr. | Prev pos. |
|---|---|---|---|---|---|---|---|---|---|
| Last 7 days* | 11–17 Nov | 39 | 4,843 | 0.81% | 27.1 | 4–10 Nov | 49 | 4,038 | 26.5 |
| Last 28 days | 23 Oct–19 Nov | 165 | 15,070 | 1.09% | 26.4 | 25 Sep–22 Oct | 134 | 9,777 | 20.8 |
| Last 30 days | 21 Oct–19 Nov | 176 | 15,884 | 1.11% | 26.1 | 21 Sep–20 Oct | 139 | 9,990 | 20.4 |
| Last 90 days | 22 Aug–19 Nov | 471 | 38,145 | 1.23% | 22.1 | 24 May–21 Aug | 266 | 22,002 | 22.9 |
| Last 12 months | 20 Nov 2025–19 Nov 2026 | 778 | 60,492 | 1.29% | 22.3 | none (no data before Mar 2026) | – | – | – |

\*The latest 7 days with data. The API's own "last 7 days" (13–19 Nov) holds only 5 data days.
The 28-day and 90-day totals match the OpenRush summary exactly (165 and 471). Stage 2's 165 for the same window also matches.

**Monthly** (clicks / impressions / position):

| Month | Clicks | Impressions | Position |
|---|---|---|---|
| Mar | 30 | 113 | 8.4 |
| Apr | 9 | 144 | 12.4 |
| May | 7 | 133 | 6.9 |
| Jun | 62 | 1,109 | 33.0 |
| Jul | 98 | 10,850 | 25.3 |
| Aug | 163 | 14,448 | 19.0 |
| Sep | 132 | 10,441 | 17.8 |
| Oct | 163 | 12,592 | 22.9 |
| Nov 1–17 | 114 | 10,662 | 26.9 |

Reading:
- Clicks grew about 77% over 90 days.
- Impressions grew faster than clicks, so average position fell (26 vs 21 in the last 28 days). New deep-ranking commercial queries are the cause, not lost rankings.
- The last 7 days are softer than the 7 before (39 vs 49), but week-to-week noise is large at this volume.

**Device, 90 days:**

| Device | Clicks | Impressions | CTR | Position |
|---|---|---|---|---|
| Mobile | 326 (+159) | 20,733 | 1.57% | 16.8 |
| Desktop | 136 (+38) | 17,077 | 0.80% | 28.7 |
| Tablet | 9 | 335 | 2.69% | 14.2 |

Device for 28 days and country are reused from Stage 2's same-day pull. **UK = 93% of clicks (153 of 165)** and 92% of impressions.

**Search appearance: UNKNOWN.** OpenRush can filter by it but cannot list it. Owner screenshot needed: GSC → Performance → Search appearance.

## 2. Query classes and brand vs non-brand (VERIFIED counts; rule-based classes are ESTIMATE)

Classes: brand (eagle bed/beds, eaglebed, queries starting "eagle"); local (near me, towns, "bed shop"); product (Eagle product names: Cloud/Teddy, Panel Line, Ambassador, Mayfair, Atlantis …); informational (what/how/vs/meaning/questions); commercial (bed-type and size terms); irrelevant (competitors, finance queries, one-word fragments). Rules in the CSV `class` column.

| Class | 90d queries | 90d clicks | 90d impr. | 90d pos. | 28d clicks | 28d impr. |
|---|---|---|---|---|---|---|
| Brand | 10 | **107** (prev 119) | 412 | 2.4 | **17** (prev 42) | 132 |
| Commercial | 808 | 32 | 6,751 | 36.1 | 17 | 3,659 |
| Informational | 96 | 22 | 1,701 | 20.2 | 19 | 759 |
| Product | 26 | 11 | 717 | 10.9 | 2 | 152 |
| Irrelevant | 37 | 10 | 55 | 13.8 | 3 | 12 |
| Local | 23 | 2 | 189 | 28.9 | 1 | 157 |
| **Not in returned rows** (anonymised queries + rows beyond the limit) | – | **287** | 28,320 | – | **106** | 10,199 |

- **Coverage:** the 1,000 returned 90-day query rows hold only 184 of 471 clicks (39%). The 300 returned 28-day rows hold 59 of 165. Most clicks come from queries that GSC anonymises or that fall below the row limit.
- **Brand vs non-brand:**
  - 90 days: brand 107 clicks (23%); non-brand about 364 (77%).
  - 28 days: brand 17 (10%); non-brand about 148 (90%).
  - The non-brand figures assume the anonymised queries are non-brand. This is reasonable, because brand terms are high-volume and always listed. ESTIMATE.
- **Organic brand clicks fell 60% in 28 days (42 → 17)** while PMax bids on the brand (Stage 1/5). This is Stage 5 blocker 9 (brand exclusion pending).
- **Local:** "beds dewsbury" (34 impressions, position 29), "chesterfield beds manchester" (32, position 13), "beds belfast" (1 click). There is no showroom, so local copy must not imply walk-in visits.
- **Irrelevant:** includes finance queries ("dreams 0 finance", "bedding buy now pay later"). They are likely drawn by the Klarna/Clearpay wording (HYPOTHESIS). The one-word queries at position 1 ("sage", "emerald green", "take me to it") look like follow-up prompts from Google's AI or shopping surfaces (HYPOTHESIS).
- **Near-win commercial and product queries (position 5–20, 90 days):**
  - "small double cloud bed" (182 impressions, position 8.1)
  - "teddy boucle ottoman bed" (129, 11.0)
  - "wingback headboard" (124, 19.6)
  - "chesterfield upholstered bed" (100, 17.6)
  - "cloud ottoman bed" (85, 12.7)
  - "panel line bed" (66, 6.3)
  - "border bed" (58, 6.9)
  - "square bed frame" (54, 8.2)
  - "3000 pocket sprung mattress" (205, 19.1)
- **Biggest impression terms ranking deep:** "chesterfield bed/beds" (764 impressions, about position 32), "divan base with drawers" (249, 45), "side opening ottoman bed" (220, 34), "beds for small rooms" (171, 38).

## 3. Pages and Shopping / free-listing visibility (VERIFIED, 90 days, 500 page rows)

| Page type | URLs | Clicks | Impressions | CTR | Position |
|---|---|---|---|---|---|
| Product | 396 | 208 | 14,684 | 1.42% | 20.4 |
| Home | 1 | 145 | 954 | 15.2% | 5.9 |
| Blog | 34 | 50 | 10,775 | 0.46% | 15.6 |
| Pages | 37 | 41 | 2,644 | 1.55% | 27.3 |
| Collection | 29 | 31 | 8,913 | 0.35% | 29.9 |

Top pages by clicks:

| Page | Clicks | Impressions | Position |
|---|---|---|---|
| Home | 145 | – | – |
| Cloud Teddy ottoman | 34 | 2,831 | 9.6 |
| how-do-ottoman-beds-work | 17 | 3,800 | 8.0 |
| divan-bed-vs-bed-frame-uk | 14 | – | – |
| /pages/aftercare-and-feedback | 8 | – | – |
| /pages/reviews | 8 | – | – |
| /pages/beds-belfast | 7 | – | – |
| /collections/storage-beds | 6 | 1,228 | 37.9 |
| side-lift-open-ottoman-bed | 6 | – | – |
| ottoman-bed-vs-divan-bed-uk | 6 | – | – |
| /collections/kids-beds | 6 | – | – |

**Product listings in Google (free listings / merchant listings), by URL tag:**

| URL tag | URLs | Clicks | Impressions | CTR | Position |
|---|---|---|---|---|---|
| Clean URLs | 188 | 352 | 33,180 | 1.06% | 21.8 |
| `sag_organic` feed URLs | 55 | **54** | 193 | 28% | 2.6 |
| `Google Shopping … stkn` feed URLs | 52 | **43** | 346 | 12% | 2.3 |
| Other parameters (`?variant=`, `country=GB`) | 205 | 27 | 4,328 | 0.6% | 21.1 |

- The two feed-tagged groups show very high CTR at position about 2. This pattern fits free product listings shown in Search, not blue links (ESTIMATE).
- **About 97 organic clicks in 90 days (21%) are product-listing clicks.** Only 4 came in the previous 90 days, so free-listing visibility is new. VERIFIED counts / ESTIMATE meaning.
- Two different feed tags confirm that **two feed sources** are live (Stage 5 blocker 7).
- 205 parameter URLs collect impressions. This repeats the Stage 2 canonical finding: 17 of the top 60 URLs carried `?variant=`.

**Shopify `sag_organic` sessions: keep the caveat.**
- Before about 28 Sep–5 Oct, paid PMax/Shopping clicks carried `sag_organic` (Stage 1/2, ESTIMATE).
- Weekly UK human `sag_organic` sessions: 558 (week of 14 Sep), 377, 190, then **5, 6, 7, 3, 7, 2, 1**.
- **True free-listing traffic since 5 Oct is 31 sessions, 5 carts, 1 order (#1024).** VERIFIED (ShopifyQL); the paid/free split is an ESTIMATE.
- PMax clicks still carry `utm_content=sag_organic` together with `utm_medium=cpc` (for example #1042). These are counted as paid here.

## 4. GSC vs GA4 vs Shopify (why the numbers differ)

| Source and unit | Last 90 days (22 Aug–19 Nov) | Last 28/30 days |
|---|---|---|
| GSC clicks, all countries | 471 (97 on feed-tagged product URLs) | 165 (UK 153), 23 Oct–19 Nov |
| GA4 `google / organic` sessions, all countries | **386** (prev 90 days: 64) | 125, 23 Oct–19 Nov (Stage 2) |
| GA4 `google / product_sync` sessions | 1 | – |
| Shopify UK human, referrer Google, no UTM | 501 | 70, 21 Oct–19 Nov |
| Shopify UK human, `sag_organic` | 2,126 (mostly paid before 5 Oct) | 19 |

Sources: OpenRush GA4 (1 call, VERIFIED), ShopifyQL (VERIFIED).

Why the numbers differ:
1. **Units differ.** GSC counts clicks in Google, including from visitors who refuse cookies. GA4 and Shopify count sessions, and only where tracking runs.
2. **Consent.** GA4 needs analytics consent; Consent Mode status is UNKNOWN (Stage 2). Shopify analytics may also drop sessions without consent (UNKNOWN). This is the most likely reason GA4 (125) and Shopify (89) sit below GSC (165). HYPOTHESIS.
3. **Bots.** Shopify bot sessions are excluded here (Stage 2: 25.7% of all sessions are bots). Bots are negligible inside Google-referred sessions (≤5 a week). VERIFIED.
4. **Paid clicks hidden in "organic" before tagging.**
   - Shopify untagged Google sessions fell from 60–100 a week (Aug–Sep) to 11–19 a week (from 5 Oct), while GSC clicks rose.
   - The likeliest cause: before about 28 Sep, clicks on the paid Search campaign carried no UTM and were filed as organic. The same happened with `sag_organic` for PMax. HYPOTHESIS, consistent with Stage 1 §3.4.
   - Use **5 Oct onwards** as the clean Shopify organic baseline: about 15 untagged UK sessions a week.
5. **GA4 auto-tagging.** Paid feed clicks carry a gclid, which GA4 turns into `google / cpc`. So GA4 shows only 1 `product_sync` session against Shopify's 2,126 `sag_organic`. Free-listing clicks without a gclid reach GA4 only with consent.
6. **google.co.uk vs google.com.** Shopify records referrer name `google` for both. Order journeys show `https://www.google.com/` even for UK buyers, because Google sends only its origin. Splitting by Google domain is not meaningful. VERIFIED (journeys).
7. **Attribution model.** OpenRush GA4 is session-scoped; GA4 conversion reports use last non-direct click. Shopify order attribution keeps first and last visit only, so an organic visit in the middle of a journey is invisible. Last-click therefore under-credits brand and organic research visits.
8. **Time zones.** GSC uses Pacific time; GA4 and Shopify use UK time. Windows differ by up to a day.

## 5. Organic sales attribution (Shopify, VERIFIED journeys; sales rules as in Stages 2–5)

Rules: cancelled orders excluded (#1010, #1014, #1020); refunded orders shown with net £0; prices include VAT; no profit claims (costs 0/831).

**Funnel, UK human organic sessions** (no-UTM Google referrer + `sag_organic`):

| Window | Sessions | Carts | Checkouts | Orders | Cart rate | Checkout rate |
|---|---|---|---|---|---|---|
| Last 30 days (21 Oct–19 Nov) | 89 | 15 | 4 | 0 | 16.9% | 4.5% |
| Since 5 Oct (clean tags) | 136 | 22 | 6 | 1 (#1024, ESTIMATE free listing) | 16.2% | 4.4% |
| Last 90 days (22 Aug–19 Nov) | 2,627 | 97 | 21 | 5 | 3.7% | 0.8% |

The 90-day row is inflated by paid clicks carrying `sag_organic`, so do not use it as the organic rate.

**By landing type, last 30 days** (sessions / carts / checkouts / orders):

| Landing type | Sessions | Carts | Checkouts | Orders |
|---|---|---|---|---|
| Home | 28 | 7 | 1 | 0 |
| Product (no UTM) | 20 | 3 | 3 | 0 |
| Product (`sag_organic`) | 19 | 2 | 0 | 0 |
| Collection | 10 | 2 | 0 | 0 |
| Page | 9 | 1 | 0 | 0 |
| Blog | 3 | 0 | 0 | 0 |

**By landing type, 90 days, no UTM:**

| Landing type | Sessions | Carts | Checkouts | Orders |
|---|---|---|---|---|
| Home | 324 | 26 | 10 | 0 |
| Collection | 90 | 6 | 0 | 0 |
| Product | 57 | 6 | 4 | 0 |
| Blog | 16 | 0 | 0 | 0 |
| Page | 14 | 2 | 0 | 0 |

- Top collections: upholstered-beds 30 sessions and 0 carts; ottoman-beds 24 and 2; divan-beds 18 and 0.
- Top product: Cloud Teddy, 25 sessions, 3 carts, 2 checkouts.

**Orders with a Google organic touch (first or last visit), since 1 Mar 2026:**

| Order | Date | Landing | First → last visit | Value | Classification |
|---|---|---|---|---|---|
| #1005 | 9 Aug | Liberty Wingback product | Google organic → `sag_organic` | £385.97 | Organic first touch; probably a non-brand or product query (ESTIMATE). Returning customer (2 orders) |
| #1007 | 21 Aug | Home | Google organic → direct | £561.59 | Organic first touch; probably brand (HYPOTHESIS) |
| #1024 | 6 Oct | 3000 Pocket Sprung Mattress | `sag_organic` → `sag_organic` | £337.99 | Probable free listing (ESTIMATE) |
| #1001, #1006 | 13 Jul, 20 Aug | Home | Google organic | £257.40 each | Refunded in full: net £0, excluded |
| #1002, #1012, #1013, #1016, #1018 | Jul–Sep | Product pages | `sag_organic` | – | Treated as **paid** (pre-tag-switch caveat) |
| #1022 | 1 Oct | Ottoman Storage Box | `sag_organic` | £97.99 | Switch week: paid or free UNKNOWN |
| #1014 | 1 Sep | Side Lift | `sag_organic` | – | Cancelled: excluded |

**Totals**
- Last 30 days: **0 orders, £0**.
- Last 90 days: **1 order, £337.99** (#1024, ESTIMATE).
- Since March: **3 orders, £1,285.55, AOV £428.52** (ESTIMATE set). Ex-VAT about £1,071.29 (÷1.2; ESTIMATE, see carry-forward 1).
- For scale: all 16 orders in 23 Oct–19 Nov totalled £6,947.57 (Stage 2).
- Returning customers: 1 of the 3 (#1005). VERIFIED (customer order count; counted today, not at the time of the order).
- **Branded vs non-branded organic orders:** brand 1 (#1007, HYPOTHESIS), non-brand/product 1 (#1005, ESTIMATE), product listing 1 (#1024). The GSC query cannot be joined to orders.

## 6. Stage 5 carry-forward (all OPEN; details in `stage5-carry-forward.csv`)

| # | Blocker | Status | Checked tonight |
|---|---|---|---|
| 1 | £0 tax on orders (VAT registered) | OPEN (owner parked) | #1043 (18 Nov) tax £0.00; every web/draft order since #1001 £0; only TEMU #1003 has tax. VERIFIED |
| 2 | Costs 0/831 | OPEN (owner parked) | 0 of 100 sampled variants have a cost > £0. VERIFIED sample |
| 3 | Product-level Ads spend | OPEN | No export in repo. UNKNOWN |
| 4 | Merchant Center diagnostics | OPEN | Listings get clicks (97 in 90 days); diagnostics UNKNOWN |
| 5 | Ottoman price/config issues | OPEN | Line Bumper King still £435.99 (product last updated 27 Oct). VERIFIED spot check |
| 6 | Gas Lift Divan Base end vs side | OPEN | Live text "end-opening"; options "left/right side opening". Page edited 19 Nov 13:18, conflict remains. VERIFIED |
| 7 | Two feed sources | OPEN | Simprosys script on every page; GSC has both `sag_organic` and `Google Shopping…stkn` URLs. VERIFIED |
| 8 | #1014 counted by Ads | OPEN | Not re-checked (no Ads call). HISTORICAL |
| 9 | Brand exclusion pending | OPEN | Organic brand clicks 42 → 17 (28 days). Ads setting UNKNOWN |
| 10 | Ads Products export outstanding | OPEN | No file. VERIFIED absent |
| + | Clearpay wording (0 Clearpay payments) | OPEN | Live on home, FAQ, Gas Lift (13 mentions), Line Bumper (8). VERIFIED |

SEO copy rule: any draft on ottoman opening direction, ottoman "from" prices or Clearpay stays **BLOCKED** until these items close.

## 7. What this baseline means for Stage 6 (proposals only, nothing done)

1. **Measure organic from 5 Oct onward**, with the definition used here: UK human, Google referrer, no UTM, plus `sag_organic` without `cpc`. Earlier weeks mix in paid clicks.
2. **Product queries and product pages are where organic search turns into intent.** Prioritise the Cloud Teddy, Panel Line and Ambassador snippets, plus "chesterfield bed" and "side opening ottoman bed" rankings. Blog pages earn impressions but not carts.
3. **Free product listings are a new and real organic channel** (about 97 clicks in 90 days, 1 probable order). Merchant Center health (blocker 4) and the duplicate feeds (blocker 7) now matter for SEO, not only for Ads.
4. **Brand:** organic brand clicks fall while PMax buys them. Decide the brand exclusion (blocker 9) before judging organic growth.
5. Owner screenshots that would close gaps:
   - GSC Search appearance tab.
   - GSC Page indexing.
   - Merchant Center free-listing performance.
   - Shopify → Settings → Customer privacy (does analytics wait for consent?).

## Limitations

- Query rows cover only 39% of 90-day clicks (anonymised queries plus the row limit). Class shares outside the listed rows are ESTIMATE.
- No query-to-order link exists. Brand/non-brand per order is inferred from the landing page only.
- Shopify keeps first and last visit only; 4 of the last 16 orders have no journey at all.
- The paid/free split of `sag_organic`, and of untagged Google sessions before October, rests on tag timing (ESTIMATE/HYPOTHESIS), not on Ads change history.
- GA4 holds no purchases or revenue through OpenRush, and its currency is USD (Stage 2). GA4 is used for sessions only.
- Country and 28-day device figures are reused from Stage 2's same-day pull. Search appearance and indexing are UNKNOWN.
- GSC has data only since March 2026, so there is no year-on-year comparison. The last 3 days of every source are preliminary.
- Volumes are small: 1 order changes any rate a lot. No profit claims (costs 0/831; VAT basis unconfirmed).

## Credits used

OpenRush, this task: **18 credits** (budget 18, UK property data; GSC/GA4 calls have no location parameter).

| # | Call | Credits |
|---|---|---|
| 1 | describe_capabilities | 0 |
| 2 | get_search_performance: date, last 16 months, no compare (daily series, used for the 7d/28d/30d/90d/12m windows) | 3 |
| 3 | get_search_performance: query, last 28 days vs previous, 300 rows | 3 |
| 4 | get_search_performance: query, last 3 months vs previous, 1,000 rows | 3 |
| 5 | get_search_performance: page, last 3 months vs previous, 500 rows | 3 |
| 6 | get_search_performance: device, last 3 months vs previous | 3 |
| 7 | get_website_analytics: source_medium, last 3 months vs previous | 3 |
| | **Total** | **18** |

Month ledger: 116 + 18 = **134 of 2,001**, if no other Stage 6 specialist has spent yet (the CHANGELOG mentions a separate "ledger 31" count). Protected reserve of 400 untouched.

Free calls: HQ `seo/gsc-latest` (read), ShopifyQL ×7, Shopify Admin GraphQL ×2 (orders since March; Line Bumper prices + 100-variant cost sample), and 4 live page fetches plus robots.txt (browser UA, more than 1 second apart).
