# EAGLE BED — PROJECT ROCKET SALES / STAGE 6: GOOGLE SEO & AI SEARCH GROWTH

Prepared 19 Nov 2026 (night) by the Manager's report writer. It consolidates the five Stage 6 specialist reports and their 15 data files, plus the Manager's verified notes. No new research was done for this report.

- **Read-only.** Nothing was changed in Search Console, GA4, Shopify, the theme, metadata, collections, robots, redirects, feeds, GBP, Yell or any listing. No outreach was sent. Order numbers only; no customer personal data. Nothing was published or committed.
- **OpenRush:** this report used 0 credits. Stage 6 total is 97 credits (section 27).
- **Owner position (Manager, VERIFIED):** costs and the VAT/accountant items were PARKED by the owner on 19 Nov. **Profit stays UNKNOWN.** No figure in this report is a profit or ROI claim.

**Labels**

| Label | Meaning |
|---|---|
| **VERIFIED** | Pulled or checked live on 19 Nov from the named source, or verified by the Manager |
| **ESTIMATE** | A calculation or rule-based class, with the rule stated in the source file |
| **HYPOTHESIS** | An explanation that still needs testing |
| **UNKNOWN** | The data does not exist here or needs an owner export |
| **HISTORICAL** | A figure from an earlier stage or date |

**Sources** (all in `ops/rocket/stage6/`)

| File | Contents | Specialist report |
|---|---|---|
| `01-organic-baseline.md`, `organic-baseline.csv`, `organic-revenue-attribution.csv`, `stage5-carry-forward.csv` | GSC windows, query classes, pages, GSC/GA4/Shopify reconciliation, organic funnels and orders, Stage 5 blockers | Search Console, Analytics, Data Verification |
| `02-technical-schema.md`, `technical-seo-issues.csv` (T01–T23), `indexing-audit.csv` (268 URLs), `schema-audit.csv` (224 pages) | Crawl, indexing, lab CWV, structured data, drift baseline | Technical SEO, Speed & CWV, Schema Markup, SEO Drift Watch, Verification |
| `03-product-collection-onpage.md`, `product-seo-audit.csv` (145), `collection-seo-audit.csv` (26), `draft-metadata.csv` (41) | Product classes A–H, top 30 products, clusters, cannibalisation, on-page, draft metadata | Product Pages, On-Page SEO, Copywriting, Topic Clusters, Merchandising, CRO |
| `04-keywords-competitors-backlinks.md`, `keyword-intelligence.csv` (148), `competitor-keywords.csv` (51), `backlink-opportunities.csv` (36) | UK volumes, SERPs, competitors, link profile, authority register | Keyword Research, Spy Agent, Market Research, Off-Page & PR, Link Scanner |
| `05-ai-local-content.md`, `ai-search-tests.csv` (20), `content-calendar.csv` (17) | AI crawler access, AI visibility, entity, local, 90-day calendar, Stage 7 inputs | AI Search, AI Recommendations, AI Platforms, Agentic SEO, Local SEO, Content Creation, Video & Voice SEO, Lead Finder |
| **New in this report:** `seo-opportunity-register.csv` (30), `owner-approval-queue.csv` | Consolidated from the files above | Manager's report writer |

---

## 1. Executive summary

1. **Organic search is growing, but it does not yet sell.**
   - GSC clicks: 471 in 90 days (22 Aug–19 Nov), up from 266 in the 90 days before. Impressions 38,145. VERIFIED.
   - Shopify, last 30 days: 89 UK organic sessions → 15 carts → 4 checkouts → **0 orders**. VERIFIED.
   - Since 5 Oct (the clean window after paid clicks got their own tags): 136 → 22 → 6 → **1 order** (#1024, £337.99, a probable free product listing; ESTIMATE).
   - Since March, 3 paid, unrefunded orders had a Google organic or free-listing touch: £1,285.55 in total (ESTIMATE set).
2. **No keyword can be tied to an order.** GSC reports queries in aggregate and Shopify stores only the landing page. UNKNOWN by design.
3. **The site is technically sound. The problems are commercial and content problems.**
   - All 224 sitemap URLs return 200 with a self-canonical, and there are 0 broken internal links. VERIFIED.
   - Product structured data includes shipping and returns on 145/145 pages. VERIFIED.
   - The biggest technical cost is Easify: about 693 KB of option data inlined in every product page. That gives about 2 s of main-thread blocking in the lab. VERIFIED (lab); field data UNKNOWN.
4. **Product pages rank but are not clicked.** 145 products had 9,201 UK impressions and 38 clicks in 3 months (CTR 0.41%). 56 products are "poorly indexed" (class E). 87 products are split across 415 URL versions created by feed links. VERIFIED counts / ESTIMATE classes.
5. **The fastest wins are snippets on pages already at position 4–11:** Cloud Teddy, Panel Line Border, Square Panel ("square bed frame"), Indigo Line, Multi Mini Line, Mini Line Luxury, Star, Level Lines and Oxygen, plus "panel bed" (10.7) and "wingback panel bed" (9.3). Drafts are ready in `draft-metadata.csv`.
6. **The biggest money terms are out of reach for now.** For example "ottoman bed" (90,500/month), "king size ottoman bed" (33,100) and "divan bed" (33,100). Eagle ranks 34–76 or not at all (VERIFIED volumes and positions). Several are **blocked by the Stage 5 ottoman price/config issues**: do not push traffic there until prices are truthful.
7. **Authority is close to zero.** 34 referring domains, of which 1 is genuine (Yell, with wrong categories). The other 33 are spam: 31 "PBN backlinks" advert domains and 2 agency testimonial pages. VERIFIED. Domain rank 0.
8. **AI search barely sees Eagle Bed.**
   - Google AI Overviews cite eaglebed.co.uk 5 times in OpenRush's UK sample, against dreams.co.uk 11,750. Confidence 0.4, directional. VERIFIED tool output.
   - Eagle appeared in 0 of 12 commercial discovery searches (WebSearch, US index).
   - No independent mentions were found. That is the main reason.
9. **Several live signals contradict the "no walk-in shop" fact:** the sitewide FurnitureStore schema with opening hours, GBP (49 direction requests in October, "confirm your business details" pending), and Yell categories. Owner decisions are needed (section 25).
10. **Nothing was completed in Stage 6 except the reports and datasets.** Every fix is a proposal awaiting approval (section 24). All 10 Stage 5 blockers remain OPEN.

### Key numbers

| Measure | Value | Label |
|---|---|---|
| GSC clicks / impressions, 90 days (22 Aug–19 Nov) | 471 / 38,145, CTR 1.23%, position 22.1 | VERIFIED |
| GSC clicks, last 28 days (23 Oct–19 Nov) | 165 (UK 153), position 26.4 | VERIFIED |
| Brand share of clicks, 90 days | 107 of 471 = 23% | VERIFIED counts / ESTIMATE share |
| Organic brand clicks, 28 days vs previous 28 | 17 vs 42 (−60%) | VERIFIED |
| Product-listing (feed URL) clicks, 90 days | about 97 (21% of clicks) | VERIFIED counts / ESTIMATE meaning |
| UK organic funnel, last 30 days | 89 sessions → 15 carts → 4 checkouts → 0 orders | VERIFIED |
| UK organic funnel, since 5 Oct | 136 → 22 → 6 → 1 order (#1024) | VERIFIED / ESTIMATE (free listing) |
| Orders with an organic touch since March | 3, £1,285.55 | ESTIMATE |
| Product pages, 3 months UK | 9,201 impressions, 38 clicks, CTR 0.41% | VERIFIED |
| Referring domains / genuine / spam | 34 / 1 / 33 | VERIFIED |
| AI Overview citations (OpenRush sample) | 5 (6th of 10 domains) | VERIFIED, confidence 0.4 |
| AI discovery searches naming Eagle | 0 of 12 | VERIFIED (WebSearch tool) |
| Lab product-page main-thread block (TBT) | 1.9–2.4 s | VERIFIED (lab); field UNKNOWN |
| OpenRush credits, Stage 6 / month | 97 / 213 of 2,001; reserve untouched | VERIFIED (Manager) |

### P0 owner actions

1. **Confirm in writing that nobody has ever bought links or an "SEO package" for eaglebed.co.uk.** 31 domains carry the anchor "High Quality Dofollow Backlinks DA 50 PA 40 Premium PBN…". The answer decides between "leave them and check monthly" and a domain-level disavow file (section 18).
2. **Check that Shopify Messaging "You left items at checkout" is Active.** It went into draft when it was edited on 19 Nov. About 45 real abandoned checkouts a month are not followed up while it is in draft (ESTIMATE, Stage 1).
3. **Google Business Profile:** clear "Action required: confirm your business details", and decide whether to become a service-area business with the address hidden. There is no walk-in shop, yet there were 49 direction requests in October.
4. **Fix the Yell categories.** Remove "office furniture", "fitted bedrooms" and "fitted furniture"; set beds / bed manufacturer.
5. **Decide the compliance wording:** rename "Memory Orthopaedic Mattress" and remove "memory orthopaedic" from `/pages/handmade-in-dewsbury` and `/pages/press-and-media`.
6. **Approve replacing the sitewide FurnitureStore + opening-hours schema** with Organization/OnlineStore, on an unpublished theme copy.
7. **Decide the registered-office line** with the accountant (UK trading disclosure). The aggregator lists a Batley address, and the BRIEF forbids naming Batley. A registered-office service address is one option.
8. **`/pages/trade` returns 404.** Approve a trade page for Stage 7 once trade terms are given.

---

## 2. Stage 5 continuity verification

All 10 Stage 5 blockers were re-checked on 19 Nov (night). **All 10 remain OPEN.** None is claimed resolved. Source: `stage5-carry-forward.csv`.

| # | Blocker | Status | Evidence tonight | Label | SEO effect |
|---|---|---|---|---|---|
| 1 | £0 tax on orders despite VAT registration | OPEN, **PARKED by owner** | #1043 (18 Nov) tax £0.00; every web order since #1001 £0; only TEMU #1003 has tax | VERIFIED | Ex-VAT figures are ESTIMATE (÷1.2) |
| 2 | Costs 0/831 | OPEN, **PARKED by owner** | 0 of 100 sampled variants have a cost above £0 | VERIFIED sample | No profit/ROI claim for organic |
| 3 | Product-level Ads spend | OPEN | No export in repo | UNKNOWN | Cannot separate paid and organic halo |
| 4 | Merchant Center diagnostics | OPEN | Listings get clicks (97 in 90 days); diagnostics not visible | UNKNOWN | Free-listing health cannot be audited |
| 5 | Ottoman price/config issues | OPEN | Line Bumper King still £435.99 (last updated 27 Oct) | VERIFIED spot check | 15 metas repeat the misleading price; copy BLOCKED |
| 6 | Gas Lift Divan Base end vs side opening | OPEN | Text says "end-opening"; options say left/right side opening; page edited 19 Nov 13:18, conflict remains | VERIFIED | Opening-direction copy BLOCKED; the ottoman guide repeats "end-opening" |
| 7 | Two feed sources | OPEN | Simprosys script on every page; GSC has both `sag_organic` and `Google Shopping…stkn` URLs | VERIFIED | Creates parameter URLs that split product signals |
| 8 | #1014 counted by Ads | OPEN | Not re-checked | HISTORICAL | None |
| 9 | Brand exclusion pending | OPEN | Organic brand clicks 42 → 17 (28 days) | VERIFIED (GSC) / UNKNOWN (Ads setting) | Brand organic keeps moving to paid |
| 10 | Ads Products export outstanding | OPEN | No file | VERIFIED absent | Product paid vs organic UNKNOWN |
| + | Clearpay wording (0 Clearpay payments) | OPEN | Home, FAQ, Gas Lift (13 mentions), Line Bumper (8); Pillow Top and /collections/mattresses metas | VERIFIED | Banned in new copy until confirmed |

**Earlier SEO work checked:** the live theme 213270004043 contains the 10 Nov SEO fixes (`max-image-preview:large` on 224/224 pages, Organization `alternateName` present, "mainland" on 0 pages). VERIFIED. The brief said FAQ blocks were live on 13 pages; **FAQPage markup is actually on 161 pages** (145 product templates plus 16 pages and articles). VERIFIED.

---

## 3. Organic search baseline

GSC data starts on 1 Mar 2026 and ends on 17 Nov; the last ~3 days are preliminary. VERIFIED (OpenRush GSC, web, all countries).

| Window | Dates | Clicks | Impressions | CTR | Position | Previous clicks | Previous position |
|---|---|---|---|---|---|---|---|
| Last 7 days with data | 11–17 Nov | 39 | 4,843 | 0.81% | 27.1 | 49 | 26.5 |
| Last 28 days | 23 Oct–19 Nov | 165 | 15,070 | 1.09% | 26.4 | 134 | 20.8 |
| Last 90 days | 22 Aug–19 Nov | 471 | 38,145 | 1.23% | 22.1 | 266 | 22.9 |
| Last 12 months | 20 Nov 2025–19 Nov 2026 | 778 | 60,492 | 1.29% | 22.3 | n/a | n/a |

- Clicks grew about 77% over 90 days. Impressions grew faster, so average position fell. The cause is new deep-ranking commercial queries, not lost rankings. VERIFIED / ESTIMATE reading.
- UK = 93% of clicks (153 of 165, 28 days). Mobile 326 clicks at position 16.8; desktop 136 at 28.7 (90 days). VERIFIED.
- **Measure organic from 5 Oct onward.** Before then, paid clicks also arrived untagged or tagged `sag_organic`. HYPOTHESIS, consistent with Stage 1.

**Why GSC, GA4 and Shopify differ (last 28/30 days):** GSC 165 clicks; GA4 `google / organic` 125 sessions; Shopify UK human untagged Google 70 sessions. The reasons are different units, consent (GA4 needs consent; Consent Mode status UNKNOWN), bots, paid clicks hidden in "organic" before tagging, auto-tagging, and time zones. Details are in `01-organic-baseline.md` §4.

---

## 4. GSC performance

| Query class (rule-based, ESTIMATE) | 90d queries | 90d clicks | 90d impressions | 90d position | 28d clicks |
|---|---|---|---|---|---|
| Brand | 10 | 107 | 412 | 2.4 | 17 (previous 42) |
| Commercial | 808 | 32 | 6,751 | 36.1 | 17 |
| Informational | 96 | 22 | 1,701 | 20.2 | 19 |
| Product (Eagle product names) | 26 | 11 | 717 | 10.9 | 2 |
| Local | 23 | 2 | 189 | 28.9 | 1 |
| Irrelevant | 37 | 10 | 55 | 13.8 | 3 |
| Not in returned rows (anonymised + row limit) | – | 287 | 28,320 | – | 106 |

- The returned rows hold only 39% of 90-day clicks. VERIFIED.
- **Page types, 90 days:** product 208 clicks / 14,684 impressions (pos 20.4); home 145 (pos 5.9); blog 50 / 10,775 (pos 15.6); pages 41; collections 31 / 8,913 (pos 29.9). VERIFIED.
- **Top non-home pages by clicks:** Cloud Teddy 34; how-do-ottoman-beds-work 17 (3,800 impressions, pos 8.0); divan-bed-vs-bed-frame-uk 14; aftercare-and-feedback 8; reviews 8. VERIFIED.
- **Free product listings:** feed-tagged URLs got about 97 clicks at position about 2 in 90 days, against 4 in the 90 days before. This is a new organic channel. VERIFIED counts / ESTIMATE meaning.
- **Search appearance: UNKNOWN.** Owner screenshot needed (GSC → Performance → Search appearance).

---

## 5. Organic keyword intelligence

UK volumes come from OpenRush `research_keywords` (19 Nov; close variants share one grouped volume, so do not add them up). Positions are GSC 22 Oct–18 Nov. **SEO difficulty is UNKNOWN on every row** (OpenRush gives paid competition only). Full set: `keyword-intelligence.csv`, 148 keywords (32 P1, 59 P2, 47 P3, 10 Skip).

| Cluster | Biggest terms (volume, VERIFIED) | Eagle today | Owner page |
|---|---|---|---|
| Ottoman head | ottoman bed 90,500; ottoman storage bed 8,100; ottoman bed frame 6,600 | Not top 20 for "ottoman bed uk" (HISTORICAL); "ottoman beds uk" 21.1 | /collections/ottoman-beds |
| Ottoman by size | king size ottoman bed 33,100; small double ottoman bed 27,100; single 22,200; double 18,100 | small double 69.6; 4ft 33.6; king not ranking | size ottoman collections (BLOCKED by Stage 5 prices) |
| Ottoman divan | ottoman divan bed / divan ottoman bed 4,400 | 70.6 / 70.7 | /collections/divan-ottoman-beds |
| Gas lift | gas lift ottoman bed 880; assembly instructions 260; not working 90 | #38 with a *base* product page; GSC 19.1, 117 impressions, 0 clicks | /collections/ottoman-beds; support terms → /pages/aftercare-and-feedback |
| Divan | divan bed 33,100; double divan bed 9,900 | divan bed 76.4; divan beds uk 40.0 | /collections/divan-beds |
| Upholstered | upholstered bed 2,900; upholstered bed frame 2,400 | not top 20 (HISTORICAL) | /collections/upholstered-beds |
| Style | chesterfield, wingback, panel, velvet, bouclé: volume UNKNOWN | panel bed 10.7; wingback panel bed 9.3; cloud bed small double 8.0; chesterfield bed 52.8 | panel-beds, wingback-beds, chesterfield-beds, Cloud Teddy |
| Brand | eagle bed / eagle beds (volume UNKNOWN) | 2.3 | home |

Near-win terms at positions 5–20 (90 days, VERIFIED): small double cloud bed (182 impressions, 8.1), teddy boucle ottoman bed (129, 11.0), wingback headboard (124, 19.6), chesterfield upholstered bed (100, 17.6), cloud ottoman bed (85, 12.7), panel line bed (66, 6.3), border bed (58, 6.9), square bed frame (54, 8.2), 3000 pocket sprung mattress (205, 19.1).

---

## 6. Technical SEO audit

23 issues in `technical-seo-issues.csv`: 0 P0, 2 P1, 8 P2, 13 P3. VERIFIED (own crawl of 224 URLs, 70 collection pages and 44 test URLs at ≤1 request per second).

| ID | Issue | Severity | Approval |
|---|---|---|---|
| T01 | Easify inlines 693 KB option data on every PDP; lab TBT 1.9–2.4 s | P1 | Owner (app settings) |
| T02 | 9 ottoman-named products: schema price = slatted-base price (Stage 5 F1) | P1 | BLOCKED: owner |
| T03 | FurnitureStore with opening hours on all 224 pages implies a walk-in shop | P2 | Owner (theme copy) |
| T05 | new-trending and frontpage are noindex but listed in the sitemap | P2 | Owner |
| T06 | 4 empty legacy blogs in the sitemap (one with a typo handle) | P2 | Owner |
| T07 | Duplicate title: West Yorkshire page vs West Yorkshire article | P2 | Owner |
| T08 | 8 orphan URLs, 16 products only on deep pagination, 50 URLs with 1–2 links | P2 | Owner (menus) |
| T09 | Article dateModified earlier than datePublished; no image; no breadcrumbs | P2 | Owner (theme) |
| T20 | AI-bot access at the CDN unconfirmed (see the conflict note in section 15) | P2 | Owner check |
| T21 | Lab LCP 3.9 s home, 3.7 s ottoman collection | P2 | Owner (field data) |
| T04, T10–T19, T22, T23 | Organization legalName; FAQPage earns nothing; duplicate Product nodes; 36 PDPs without sku; returnPolicyCountry; menu /search links; links to 301 and noindex; 2 H1s on 9 pages; parameter URLs; out-of-range pagination; city redirects; 42 active-but-unpublished products; bare-domain check | P3 | Owner |

**What is sound (VERIFIED):** 224/224 return 200, all self-canonical; 0 broken internal links; duplicate URL forms (`?variant=`, utm, uppercase, trailing slash, collection-scoped products) all canonicalise correctly; 54 redirects work without chains; robots.txt is Shopify's default; no hreflang needed (UK only); sitemap counts match Shopify (145 products, 21 pages, 26 collections, 26 articles).

---

## 7. Indexing & crawlability

- **Crawl:** every sitemap URL is reachable and indexable apart from the 2 intentional noindex collections. VERIFIED (`indexing-audit.csv`, 268 rows).
- **Orphans:** `/pages/share-your-bedroom`, `/pages/aftercare-and-feedback` (8 GSC clicks), `/pages/single-beds-3ft-uk` (537 impressions), and 5 size collections are reachable only through the sitemap. 16 products appear only on page 3–5 of collections. VERIFIED (static HTML; JavaScript links not counted, so this is an upper bound).
- **Parameter URLs:** 330 of 494 GSC page rows carry parameters, but only 22 clicks. 87 products appear under 415 URL versions (31% of product impressions). Canonicals are correct, so these come from feed links (HYPOTHESIS). The fix is one feed source (Stage 5 blocker 7), not a site change.
- **Possibly unindexed sellers (class E, 56 products):** Line Bumper (0 web impressions, 268 free-listing sessions), Line Ambassador (3 impressions), Mirror Strip Sunrise (2). The owner needs to run URL Inspection on these three. UNKNOWN until then.
- **GSC Page indexing report: UNKNOWN.** OpenRush has no indexing tool. Owner export needed: Indexing → Pages with the "Why pages aren't indexed" drill-downs, plus Enhancements (Product snippets, Merchant listings, Breadcrumbs).
- **42 products are ACTIVE but not on the Online Store,** so they cannot be indexed. Confirm none sits in a feed (T22).

---

## 8. Core Web Vitals (lab vs field)

**FIELD (CrUX) data is UNKNOWN.** The PageSpeed API returned 429 (shared quota). Every number below is **LAB** (one run, throttled Moto G Power, sandbox-blocked third parties, so real pages are heavier). VERIFIED (lab).

| Page | LCP | CLS | TBT (INP proxy) | Weight | HTML |
|---|---|---|---|---|---|
| Home | 3.9 s | 0.015 | 827 ms | 1.9 MB | 341 KB |
| /collections/ottoman-beds | 3.7 s | 0.014 | 706 ms | 2.0 MB | 360 KB |
| Ottoman Gas Lift Divan Base | 2.4 s | 0.003 | 2,363 ms | 2.7 MB | ~1.05 MB |
| Cloud Teddy | 3.1–3.6 s | 0.003 | 2,000–2,139 ms | 2.8 MB | 1.07 MB |
| Savoy Channel Tufted | 6.1 s | 0.003 | 1,941 ms | 2.9 MB | ~1.05 MB |

- CLS is good everywhere. LCP misses 2.5 s on slow 4G on home, collection and Savoy. Product pages carry about 2 s of blocking, so poor INP on phones is likely (HYPOTHESIS until field data).
- **Biggest cost:** Easify (387 KB JS plus the 693 KB inline script). Then Judge.me (50 files, 186 KB, for 2 reviews), two chat widgets (Inbox 89 KB, Dondy 70 KB). VERIFIED (lab).
- **Proposals (test on an unpublished theme copy only):** Easify per-product loading; Judge.me badge-only; one chat widget loaded on interaction; WebP and capped mobile widths for the Savoy hero; then **re-measure with field data** (owner: pagespeed.web.dev or GSC Core Web Vitals).

---

## 9. Product SEO audit (145 products)

| Item | Finding | Label |
|---|---|---|
| Published products | 145 (Bed Frame 95, Headboard 17, Divan 10, Ottoman 10, Kids 6, Mattress 6, Storage Box 1); none created in the last 60 days | VERIFIED |
| Titles / metas | Set on 145/145; 1 title over 60 characters; 1 meta cut off (173 characters); 143 metas contain "from £" | VERIFIED |
| Misleading metas | 15 metas pair storage or drawers with a price that excludes them (F1 ×9, F3 ×6) | VERIFIED |
| Compliance | "Memory Orthopaedic" name/H1/title/meta, cross-linked from about 76 descriptions ("orthop" on 81 pages); Clearpay in 2 metas; "solid wood frames"; "120 x 190 cm" | VERIFIED |
| Images | 1,493 images, alt text 100%; 578 "Gemini_Generated" file names on 68 products (Stage 3 owner Q17: do they show the real product?) | VERIFIED |
| Descriptions | Median 391 body words; median **68% template text**; 99 products ≥60% template | VERIFIED (shingle method) |
| Search performance | 9,201 UK impressions, 38 clicks, CTR 0.41%; 92 products under 10 impressions, 29 with none | VERIFIED |
| Organic web landings | 94 sessions, 7 carts, 0 orders (90 days) | VERIFIED |

**Classes (ESTIMATE, rules in `03` §C.2):** A high organic revenue opportunity 6 · B high impressions, low CTR 12 · C good rank, weak conversion 12 · D ranking opportunity 6 · E poorly indexed 56 · F duplicate/overlapping 8 · G low demand 45 · H new 0.

---

## 10. Top 30 product SEO opportunities

Ranked by the ESTIMATE score in `03` §C.3 (missing clicks × commercial weight). Evidence is GSC 3 months UK. "BLOCKED" = waits on a Stage 5 owner decision. Every row needs owner approval for metadata.

| # | Product (class) | Impr / clicks | Pos | Action | Blocked by |
|---|---|---|---|---|---|
| 1 | Cloud Teddy Bouclé Ottoman Bed (AD) | 903 / 9 | 10.9 | Meta without price; consolidate 7 URL versions; link to ottoman-beds | F1 **BLOCKED** |
| 2 | Panel Line Border Bed (BC) | 248 / 1 | 7.3 | Snippet test; link to panel-beds | – |
| 3 | Square Panel Luxury Bed (BCD) | 234 / 1 | 9.1 | Title "Square Panel Bed Frame" | – |
| 4 | Ottoman Gas Lift Divan Base (AB) | 137 / 0 | 25.4 | Trim meta to 155 characters; keep 19 Nov title | F8 opening **BLOCKED** (meta ready) |
| 5 | Indigo Line Bed (CD) | 96 / 0 | 8.9 | New meta; add to panel-beds | Q17 images |
| 6 | 3000 Pocket Sprung Mattress (AB) | 247 / 0 | 20.5 | Title "UK, all sizes" pattern | – |
| 7 | Grand Extra-Tall Panel Bed (D) | 63 / 0 | 10.0 | Heights decision, then title/meta | F7 **BLOCKED** |
| 8 | Stone Premium Bed (CD) | 50 / 0 | 19.8 | Meta; CRO (199 free-listing sessions, 0 carts) | – |
| 9 | Line Kids Velvet Bed (A) | 13 / 2 | 21.4 | Title/meta; link to kids-beds and kids guide | – |
| 10 | Side Lift Ottoman Storage Base (A) | 258 / 6 | 33.0 | Retitle as "Base" (stops competing with the bed) | – |
| 11 | Oxygen Luxury Bed (C) | 52 / 0 | 6.1 | Meta; canonical check; add to a design collection | Owner GSC check |
| 12 | Mirror Strip Sunrise Bed (AE) | 2 / 0 | 24.5 | Add to a design collection; guide links | – |
| 13 | Divan Storage Base with Drawers (B) | 762 / 1 | 55.4 | Drawer default fix, then title/meta | F3 **BLOCKED** |
| 14 | Side Lift Open Ottoman Bed (B) | 628 / 2 | 33.7 | Single owner of "side lift ottoman bed" | F1 **BLOCKED** |
| 15 | Level Lines Luxury Bed (CD) | 89 / 0 | 10.7 | Title/meta | – |
| 16 | Multi Mini Line Luxury Bed (CF) | 61 / 0 | 4.5 | Meta; unique opening copy | – |
| 17 | Chesterfield Tufted Bed (BF) | 571 / 1 | 28.8 | Pick one of the duplicate pair | Approval 16 |
| 18 | Tower Bed (D) | 96 / 0 | 19.7 | Meta; add to panel-beds | – |
| 19 | Curved Wingback Bed (D) | 45 / 1 | 14.1 | Meta; link to wingback-beds | – |
| 20 | Princess Luxury Bed (D) | 58 / 2 | 15.8 | Meta | – |
| 21 | Panel Line Headboard (B) | 340 / 1 | 22.0 | Rename as headboard everywhere | F13 / approval 17 |
| 22 | Mini Line Luxury Bed (C) | 63 / 0 | 5.8 | Meta | – |
| 23 | Line Ambassador Bed (E) | 3 / 0 | 3.0 | Meta without "12 colours"; URL Inspection | F6 **BLOCKED** |
| 24 | Star Unique Bed (C) | 78 / 0 | 5.9 | Meta | – |
| 25 | Pillow Top Mattress (BF) | 1,271 / 0 | 58.1 | Remove Clearpay; owner explains vs 2000 Pocket Pillow Top | Owner facts |
| 26 | Line Bumper Ottoman Divan Bed (CE) | 0 / 0 | – | URL Inspection; price truth | F1 **BLOCKED** |
| 27 | Mini Line Wingback Kids Bed (C) | 16 / 0 | 34.4 | Meta; CRO (167 free-listing sessions, 0 orders) | – |
| 28 | Grand Luxury Bed (D) | 25 / 0 | 14.2 | Meta without "oversized" | – |
| 29 | Gold V Cross Line Bed (D) | 21 / 0 | 15.9 | Meta; confirm strip is standard | F4 |
| 30 | Chester Wingback Headboard (B) | 239 / 1 | 22.1 | Hold until the headboard decision | Approval 17 |

Success is measured in GSC 28 days after each change, against the 22 Aug–19 Nov baseline. Draft titles and metas: `draft-metadata.csv` (19 product drafts READY, 12 BLOCKED/HOLD, 10 collection drafts READY).

---

## 11. Collection page strategy

All 26 collections return 200, have one H1, are self-canonical and have SEO title and meta set. None has ItemList schema. VERIFIED.

| Collection | Published products | Impr / clicks / pos (3 months) | Organic web sessions 90d | Owns |
|---|---|---|---|---|
| storage-beds | 45 | 1,099 / 4 / 39.7 | 3 | storage beds; beds with storage |
| ottoman-beds | 37 | 1,003 / 0 / 31.4 | 27 | ottoman bed(s); gas lift ottoman bed |
| wingback-beds | 24 | 790 / 0 / 25.2 | 5 | wingback bed(s); wingback panel bed |
| divan-beds | 34 | 770 / 1 / 45.8 | 21 | divan bed(s); divan beds uk |
| chesterfield-beds | 7 | 684 / 0 / 32.3 | 2 | chesterfield bed(s) |
| divan-ottoman-beds | 35 | 548 / 0 / 57.3 | 6 | ottoman divan bed |
| upholstered-beds | 117 | 167 / 0 / 6.8 | 34 | upholstered beds UK; velvet (until a velvet page exists) |
| panel-beds | 37 | 166 / 1 / 11.8 | 2 | panel bed(s) |

**Develop (existing pages, no new collections):**
1. **ottoman-beds** as the single hub for ottoman and gas-lift terms, with a "Side lift ottoman beds" H2 linking the 2 side-lift products. Wait until Stage 5 prices are truthful before pushing traffic.
2. **chesterfield-beds:** the SERP is weak (#4 is a URL called "dummy-product"); first decide the duplicate chesterfield product pair.
3. **panel-beds** and **wingback-beds:** already near page 1; add the orphan line/panel designs and a sharper snippet.
4. **storage-beds-with-drawers** and **divan-beds:** after the drawer-default fix (F3).

**Do not create now:** side-lift (2 products, F8 BLOCKED), velvet (fabric on about 125 products, duplicates upholstered-beds), bouclé (1 product). **The real gap is merchandising:** 34 published products sit in no design collection, including Mirror Strip Sunrise (3 orders ever), Stone, Oxygen and Tower. Size collections: review on 10 Feb and merge any under 50 impressions (dimensions copy BLOCKED).

---

## 12. Keyword cannibalisation

| # | Overlap | Evidence (VERIFIED) | Recommendation |
|---|---|---|---|
| 1 | ottoman-beds vs storage-beds | "ottoman beds uk" 31 vs 29 impressions; all 37 ottoman products are in storage-beds (Jaccard 0.82) | Keep both; storage-beds title leads with storage/drawers, not "Ottoman" |
| 2 | ottoman-beds vs divan-ottoman-beds | 32 of 37 products shared (Jaccard 0.80) | divan-ottoman-beds owns "ottoman divan" only; re-measure 17 Dec; merge + 301 if still past position 50 |
| 3 | "ottoman divan bed" on 3 URLs | divan-ottoman-beds pos 71, divan-beds pos 87, divan base product (retargeted 19 Nov) | No change before 17 Dec |
| 4 | Side Lift Ottoman Storage Base vs Side Lift Open Ottoman Bed | Both SEO titles start "Side Lift Ottoman Bed" | Retitle the base as "…Ottoman Base" |
| 5 | Size collections | 3 storage size pages list the same 17 products; kids-beds = kids-single-beds; small-double-ottoman = king-size-ottoman | No more size pages; review 10 Feb |
| 6 | Two ottoman "buying guides" + how-do-ottoman-beds-work | 6 / 12 / 805 impressions; the page guide has 2 H1s and repeats unconfirmed "end-opening" | One guide (C02); 301 the other; BLOCKED on opening direction |
| 7 | Small-room guides | best-beds-for-small-bedrooms 1,351 impressions vs storage-bed-small-uk-bedroom-guide 33 | Fold the smaller one in + 301 |
| 8 | West Yorkshire page vs article | Identical title (T07) | Page is the target; 301 the article (C01) |
| 9 | Product duplicates | Chesterfield Tufted / Chester Chesterfield; Memory Foam / Memory Orthopaedic; Pillow Top pair | Owner decides each pair |

---

## 13. On-page audit

| Area | Finding (VERIFIED) | Proposal |
|---|---|---|
| Titles | Pattern "Name · Descriptor · Eagle Bed"; descriptors often generic | Lead with the searched term where GSC shows it |
| Metas | 15 storage metas with a non-storage price; Ambassador "12 colours"; Grand "tallest"; Panel Line Headboard reads "bed from £90.99" | Drafts drop the price wherever it excludes what the title promises (BLOCKED) |
| H1 | 1 per product and collection (19 Nov white-on-white fix live); 9 pages have 2 H1s | Body H1 → H2 |
| H2 template | 105 products share a 9-H2 template; "Customization" (US spelling) on 135 pages; "More from {size collection}" | "Customisation"; "More from" should use the design collection |
| Internal links | 107 products link to mattresses, 96 to upholstered-beds, only 4 to storage-beds; 60/145 link a guide | "Shop more {design} beds" link per type; product → guide links |
| Trust | Free delivery, 14-day returns, 5-year warranty on 145/145; Dewsbury on 140 | Keep; drafts say "free GB delivery" only |
| Announcement bar | "10% off your order with code EAGLE10" live (owner-set) | Drafts never use discount percentages |

---

## 14. Structured data audit

224 pages parsed, 0 JSON-LD parse errors. VERIFIED (`schema-audit.csv`).

| Item | Status | Label |
|---|---|---|
| Product + Offer per size, GBP, InStock, brand Eagle Bed | 145/145; schema price = page price on 145/145 | VERIFIED |
| shippingDetails (£0 GB, £90 NI, 1–2 + 2–3 days) | 145/145 | VERIFIED |
| hasMerchantReturnPolicy (14 days, free) | 145/145; missing returnPolicyCountry and returnMethod (T13) | VERIFIED |
| sku | 109 present / 36 missing (blank variant SKUs) | VERIFIED |
| aggregateRating | 2 products, real Judge.me data, 1 review each; no invented ratings | VERIFIED |
| Duplicate Product nodes | 135 PDPs carry 2–3 nodes (Easify empty name; Judge.me relative @id); effect in GSC UNKNOWN | VERIFIED / UNKNOWN |
| FurnitureStore + opening hours | All 224 pages: **implies a walk-in shop** (T03) | VERIFIED |
| Organization | No legalName (ABBAS TRADE LTD) or company number 16410472; sameAs lacks Pinterest/YouTube (T04) | VERIFIED |
| Article | 26/26 with dateModified before datePublished; no image; no breadcrumbs (T09) | VERIFIED |
| FAQPage | 161 pages; earns no rich result (Google limited it in Aug 2023; secondary reports say ended for all sites on 7 May 2026). Harmless; add no more | VERIFIED markup / secondary source |

The ottoman price problem (T02) is **not a schema fix**: the markup correctly follows the page. It follows the Stage 5 owner decision.

---

## 15. AI search visibility

| Measure | Result | Label |
|---|---|---|
| robots.txt | Shopify default; every AI crawler allowed | VERIFIED |
| AI-bot access at the CDN | **Conflicting tests.** Report 02: bot user agents got a Cloudflare 403 challenge. Report 05: the same bots got 200 and the full page. Manager re-test (19 Nov, ~23:00 UTC): a GPTBot user agent, a Googlebot user agent and a phone browser all got 200 on a product page, so the 403 was most likely temporary rate-limiting. Real-bot access is still best confirmed with a Bing Webmaster live URL test. Both used spoofed agents from a data-centre IP | UNKNOWN (real bots) |
| Google AI Overview citations (OpenRush UK sample) | eaglebed.co.uk 5 (6th of 10); dreams.co.uk 11,750; happybeds.co.uk 2,799; bedkingdom.co.uk 1,808; divanbasedirect.co.uk 120; pascalbeds.co.uk 104 | VERIFIED tool output, confidence 0.4 |
| WebSearch discovery questions | 0 of 12 named Eagle Bed (US Bing-like index) | VERIFIED |
| Gemini | Named in 1 of 30 questions, cited in 2 (10 Nov); 0 of 12 on 9 Nov | HISTORICAL |
| ChatGPT, Perplexity, Copilot, Google AI Mode | Not testable here | UNKNOWN |
| Independent mentions | None found in 4 searches | VERIFIED |
| Agentic commerce | Shopify publishes /llms.txt, /agents.md, UCP/MCP and an agentic sitemap. AI agents can read products and build carts, **so the Stage 5 price problems reach AI agents unfiltered** | VERIFIED |
| /llms.txt content | Shopify boilerplate only; no brand facts | VERIFIED |

**Conversational queries already reach the site** (GSC, VERIFIED): "divan base with drawers or an ottoman with gas lift — which holds more?" (41 impressions, pos 6.3); "ottoman beds — how does the gas-lift mechanism actually work?" (32, pos 1.6). They get 0 clicks. HYPOTHESIS: AI Mode or AI-assisted searches.

**Owner check to settle the crawler conflict:** Bing Webmaster Tools → URL Inspection → live test on one product page. If it passes, Bing (and so ChatGPT search) can read the site. No robots change is needed.

---

## 16. AI content opportunities

What AI answers reward (pattern across the 12 tests): concrete numbers (strut rating, maximum mattress weight, storage depth, guarantee years, delivery exceptions), third-party mentions, and clear terms. Eagle publishes none of the numbers, and two key specs are owner-BLOCKED.

| Opportunity | Status |
|---|---|
| Owner's 20-minute fact session (opening direction, storage depth, strut rating, mattress weights, drawer configs and base heights, fabric composition, kids dimensions, Christmas cut-off, trade terms, any fire certificates) | Unblocks C02–C15. Owner |
| 40–60 word answer-first paragraph under each guide H1, then a table | Standard for every calendar item |
| Entity facts: legalName, company number, sameAs (Facebook, Instagram, TikTok, YouTube, Pinterest) in schema; registered office in the Terms | Owner approval (theme) + accountant |
| Factual "About Eagle Bed" block in llms.txt, if Shopify allows it; otherwise in /pages/about-us | Proposal; customisation UNKNOWN |
| Earned mentions: Yorkshire Post "Made in Yorkshire", Make it British, Ideal Home, IndyBest (pitches already drafted 10 Nov) | Owner sends |
| Real reviews: GBP, Trustpilot, Judge.me (no incentives, no gating) | Owner |
| Monthly 10-minute manual AI test (3 fixed prompts × ChatGPT, Perplexity, Copilot, AI Mode) | Owner, first Monday of each month |

---

## 17. Competitor SEO intelligence

| Query (UK) | Top results | Eagle | Label |
|---|---|---|---|
| gas lift ottoman bed | Facebook posts (17 of 47), luxcampervans #3, livingwithluxury #4, rebeldreams #6, amazon #8, bedroomking #10 | #38 | VERIFIED |
| divan bed with drawers | next #1, Facebook (19 of 48), sognarebeds #3, ukonlinefurniture #4, divanbedking #7, Independent round-up #9 | not in top 48 | VERIFIED |
| chesterfield bed | ebay #1, amazon #2, bedcreed #4 ("dummy-product"), craftedbeds #5 | not in top 48 | VERIFIED |
| ottoman bed uk | somnibeds #1, furniture123 #3, bedwick #4, ukbedsdirect #5 | not in top 20 | HISTORICAL (Stage 1) |
| upholstered bed uk | next, amazon, johnlewis, made.com, ukbedsdirect and others | not in top 20 | HISTORICAL (Stage 1) |

**Why they outrank Eagle (observed in titles and snippets):** a dedicated page per search angle (gas lift, size-split ottomans, drawer divans); a definition paragraph on the collection; price-led guides and tools; review platforms (PSCL Trustpilot about 2,276, HISTORICAL); local directories and editorial round-ups. Pascal (PSCL) was not seen in any of the 5 SERPs; its edge is reviews and brand. Competitor traffic and backlink counts are UNKNOWN (no paid gap tool used). **Beatable results (HYPOTHESIS):** bedcreed "dummy-product", luxcampervans, URL-only results without snippets, Facebook seller posts.

---

## 18. Backlink & authority audit

| Measure | Value | Label |
|---|---|---|
| Domain rank | 0 | VERIFIED |
| Referring domains / backlinks | 34 / 58 | VERIFIED |
| Genuine | 1 (yell.com, 21 nofollow links, wrong categories) | VERIFIED |
| Spam | 31 "PBN backlinks" advert domains (dofollow, spam score 60–75, first seen 4 Aug–14 Nov, still arriving) + 2 "Linkly agency" testimonial pages (nofollow) | VERIFIED |
| Lost links | Not pulled | UNKNOWN |
| Brand mentions | None found | VERIFIED |

**Spam PBN links: decision tree** (Google ignores most spam links on its own; disavow is for links you paid for or that risk a manual action)

| Step | Question | If YES | If NO |
|---|---|---|---|
| 1 | Has anyone ever paid for links, "SEO packages" or link building for eaglebed.co.uk? | Go to step 4 | Go to step 2 |
| 2 | Search Console → Security & Manual actions → Manual actions: is there a manual action? | Go to step 4 | Go to step 3 |
| 3 | No purchase, no manual action | **Leave the 33 domains alone.** Do not contact the sites. Re-check the referring-domain count and Manual actions monthly. Ignore sellers who email | – |
| 4 | Links were bought, or there is a manual action | Prepare a **domain-level disavow file** for the 31 PBN domains (+2 testimonial domains); the owner uploads it in Search Console; if there is a manual action, file a reconsideration request after cleanup | – |

The Manager's recommendation is step 3, **subject to the owner's written answer.** Never buy "DA 50 / PBN / dofollow" packages.

**Legitimate authority register** (`backlink-opportunities.csv`, 36 rows): P1 = Yell categories (B01), GBP reviews (B02), Trustpilot free profile (B03), Judge.me post-delivery requests (B04), Facebook About fix (B09), the 4 drafted pitches (B12, B17, B19, B25), the spam decision (B34). P2 = Apple and FreeIndex activation, Dewsbury Reporter "findit", Made in Britain, further pitches. All are £0 or UNKNOWN cost; no outreach was sent.

---

## 19. Local & UK search

| Fact | Status | Label |
|---|---|---|
| Delivery | Free across Great Britain to the door/downstairs; £90 to NI, Jersey, Guernsey, Isle of Man; usually 3–5 working days, own team; UK only | VERIFIED (delivery page) |
| BFPO | Still in the free GB zone (Stage 5 F9 PENDING) | HISTORICAL, open |
| Walk-in customers | **None.** No showroom | VERIFIED (BRIEF) |
| Conflicting signals | FurnitureStore schema with opening hours on every page; GBP 49 direction requests in October and "confirm your business details" pending since 5 Nov; Yell lists "office furniture" / "fitted bedrooms" across 6 towns | VERIFIED / HISTORICAL |
| Registered office | Not on the website; the aggregator lists a Batley address; the BRIEF forbids naming Batley; `/pages/beds-west-yorkshire` names Batley 3 times as a delivery town | VERIFIED / ESTIMATE (aggregator) |
| Local queries (28 days) | beds dewsbury 33 impressions, pos 26.9; handmade beds yorkshire 31, pos 20.5; beds made in yorkshire 23, pos 40; all 0 clicks | VERIFIED |
| Listings | GBP fixed 10 Nov; Yell live (wrong categories); Bing Places live; Apple "Eagle bed" unverified; FreeIndex pending; Thomson Local UNKNOWN; Trustpilot none | HISTORICAL / VERIFIED |

**Position to hold:** "made in Dewsbury, delivered free across Great Britain by our own team". No city doorway pages, no "visit us", no "bed shop near me" targeting. The GBP service-area change may reduce local-pack visibility; that trade-off is the owner's decision.

---

## 20. 90-day content calendar

20 Nov 2026 – 18 Feb 2027, full detail in `content-calendar.csv`. Stage 6 publishes nothing. 4 items READY, 13 BLOCKED on owner facts.

| # | Date | Item | Type | Priority | Status |
|---|---|---|---|---|---|
| C01 | 24 Nov | West Yorkshire: one page, not two | Consolidate | P1 | READY (decision) |
| C02 | 27 Nov | Ottoman hub: correct opening-direction row, one guide per job | Consolidate | P0 | BLOCKED (opening direction) |
| C03 | 1 Dec | Side lift, end lift, gas lift: what the words mean | New | P1 | BLOCKED |
| C04 | 4 Dec | Which mattress works on an ottoman bed | New | P1 | BLOCKED (strut rating, weights) |
| C05 | 8 Dec | Ordering a bed before Christmas | Seasonal FAQ | P0 | BLOCKED (owner dates) |
| C06 | 11 Dec | Delivery and assembly: what happens on the day | Refresh | P1 | READY after BFPO decision |
| C07 | 15 Dec | How much storage an ottoman gives, by size | Refresh | P0 | BLOCKED (storage depth) |
| C08 | 5 Jan | Divan base buying guide | New | P2 | BLOCKED |
| C09 | 8 Jan | Velvet or bouclé for a bed | New | P2 | BLOCKED (fabric specs) |
| C10 | 12 Jan | Kids single 2ft6 vs single 3ft | Refresh | P2 | BLOCKED |
| C11 | 15 Jan | Memory foam vs pocket sprung | Refresh | P2 | READY |
| C12 | 19 Jan | Trade page: landlords, agents, holiday lets | New | P1 | BLOCKED (trade terms) |
| C13 | 22 Jan | Choosing beds for a rental or HMO | New | P2 | BLOCKED (needs C12) |
| C14 | 26 Jan | UK bed sizes guide refresh | Refresh | P2 | BLOCKED |
| C15 | 29 Jan | Chesterfield guide refresh | Refresh | P2 | BLOCKED (size-price anomaly) |
| C16 | 9 Feb | Caring for an upholstered bed + aftercare | Refresh | P2 | READY (basics) |
| C17 | 16 Feb | Handmade in Dewsbury: real workshop photos | Refresh | P1 | BLOCKED (owner photos) |

Every item follows the quality standard in `05` §J2: answer first, owner facts only, banned-word list, real photos, one job per URL, human checklist and owner sign-off. Volumes exist for only five calendar terms (ottoman bed 90,500; ottoman bed frame 6,600; gas lift ottoman bed 880; assembly instructions 260; not working 90). All others are UNKNOWN.

---

## 21. Organic revenue attribution

Rules: cancelled orders (#1010, #1014, #1020) excluded; refunded orders shown at net £0; prices include VAT; no profit claims. VERIFIED journeys (Shopify keeps first and last visit only).

| Window | Sessions | Carts | Checkouts | Orders | Label |
|---|---|---|---|---|---|
| Last 30 days (21 Oct–19 Nov) | 89 | 15 | 4 | 0 | VERIFIED |
| Since 5 Oct (clean tags) | 136 | 22 | 6 | 1 (#1024) | VERIFIED / ESTIMATE |
| Last 90 days | 2,627 | 97 | 21 | 5 | Inflated by paid `sag_organic`; do not use |

| Order | Date | Landing | Journey | Value | Class |
|---|---|---|---|---|---|
| #1005 | 9 Aug | Liberty Wingback product | Google organic → `sag_organic` | £385.97 | Organic first touch, probably non-brand (ESTIMATE) |
| #1007 | 21 Aug | Home | Google organic → direct | £561.59 | Organic first touch, probably brand (HYPOTHESIS) |
| #1024 | 6 Oct | 3000 Pocket Sprung Mattress | `sag_organic` → `sag_organic` | £337.99 | Probable free listing (ESTIMATE) |

- Since March: **3 orders, £1,285.55** (about £1,071.29 ex-VAT, ESTIMATE). Last 30 days: £0. For scale, all 16 orders in 23 Oct–19 Nov totalled £6,947.57 (Stage 2, HISTORICAL).
- #1001 and #1006 (home, organic) were refunded in full: net £0.
- **The home page is where organic visitors act** (last 30 days: 28 sessions, 7 carts). HYPOTHESIS: brand searchers come back direct and buy, so last-click under-credits organic.
- Blog/guide visits: 16 sessions in 90 days, 0 carts (VERIFIED). Guides earn impressions, not sales.

---

## 22. Top 30 SEO opportunities

Full register with evidence, intent, effort, risk, agent, dependencies, approval, success metric and label: **`seo-opportunity-register.csv`**. Priority order is the Manager's ESTIMATE (commercial relevance × readiness × effort).

| # | Opportunity | Target | Now | Effort | Approval / dependency | Label |
|---|---|---|---|---|---|---|
| O01 | Cloud Teddy snippet + URL consolidation | "teddy boucle ottoman bed" / product | pos 10.9, 903 impr, 9 clicks | S | Owner; meta waits on F1 | VERIFIED |
| O02 | Panel Line Border snippet | "panel line bed", "border bed" | pos 7.3, 248 impr, 1 click | S | Owner (meta) | VERIFIED |
| O03 | Square Panel retitle | "square bed frame" | pos 9.1, 234 impr | S | Owner | VERIFIED |
| O04 | panel-beds collection snippet + orphan designs | "panel bed" | pos 10.7 | S | Owner | VERIFIED |
| O05 | wingback-beds snippet | "wingback panel bed" | pos 9.3, 103 impr, 0 clicks | S | Owner | VERIFIED |
| O06 | Snippet tests on 3 products at pos 4.5–5.9 | Multi Mini Line, Mini Line Luxury, Star | 202 impr, 0 clicks | S | Owner | VERIFIED |
| O07 | Snippet tests on 3 products at pos 6.1–10.7 | Oxygen, Indigo Line, Level Lines | 237 impr, 0 clicks | S | Owner; Oxygen canonical check | VERIFIED |
| O08 | Compliance metadata clean-up | 15 price metas, Clearpay ×2, orthopaedic, solid wood, 120x190 | live misleading text | S | Owner (meta) | VERIFIED |
| O09 | 3000 Pocket Sprung Mattress title | "3000 pocket sprung mattress" | pos 19–20.5, 205–247 impr | S | Owner | VERIFIED |
| O10 | Ottoman Gas Lift Divan Base meta trim | top seller (7 orders ever) | 173-char meta cut off | S | Owner; opening copy F8 BLOCKED | VERIFIED |
| O11 | Side Lift base retitle "…Base" | "side lift ottoman base" | 2 products share a title start | S | Owner | VERIFIED |
| O12 | Add 34 orphan products to design collections | Mirror Strip Sunrise, Stone, Oxygen, Tower… | no design collection | S–M | Owner (merch) | VERIFIED |
| O13 | Link size collections, 3 orphan pages; menu /search links → collections | T08, T14 | sitemap-only discovery | S–M | Owner (menus) | VERIFIED |
| O14 | Product → guide → collection links; product blocks on ranking guides | how-do-ottoman-beds-work (3,800 impr, pos 8) | 60/145 link a guide | M | Owner | VERIFIED / HYPOTHESIS effect |
| O15 | URL Inspection on 3 indexed-poorly sellers | Line Bumper, Line Ambassador, Mirror Strip Sunrise | 0–3 web impressions | S | Owner check | UNKNOWN |
| O16 | One feed source (stop new parameter URLs) | 87 products / 415 URL versions | 31% of product impressions on extra URLs | M | Stage 5 blocker 7 | VERIFIED / HYPOTHESIS cause |
| O17 | Merchant Center free-listing health | ~97 clicks in 90 days | diagnostics UNKNOWN | S | Stage 5 blocker 4 | UNKNOWN |
| O18 | Easify per-product option loading | 145 PDPs | lab TBT ~2 s | M | Owner (app) | VERIFIED lab |
| O19 | FurnitureStore → Organization/OnlineStore + legalName | 224 pages | implies walk-in shop | S | Owner (theme copy) | VERIFIED |
| O20 | Brand exclusion decision | "eagle bed" | organic brand clicks −60% | S | Stage 5 blocker 9 | VERIFIED / UNKNOWN Ads |
| O21 | ottoman-beds as the single ottoman/gas-lift hub | "gas lift ottoman bed" (880) | #38 with a base page | M | F1 BLOCKED for traffic push | VERIFIED |
| O22 | chesterfield-beds hub after duplicate decision | "chesterfield bed(s)" | 684 impr, pos 32; weak SERP | M | Approval 16 | VERIFIED / HYPOTHESIS beatable |
| O23 | Divan drawer base after drawer default fix | "divan base with drawers" | 762 impr, pos 55 | S | F3 BLOCKED | VERIFIED |
| O24 | GBP: confirm details + reviews from real customers | GBP / local | 0 calls, 49 directions (Oct) | S | Owner | HISTORICAL |
| O25 | Yell categories + Apple/FreeIndex activation | citations | wrong categories | S | Owner | VERIFIED |
| O26 | Trustpilot + Judge.me genuine review flow | reviews | 2 product reviews | S | Owner | VERIFIED |
| O27 | Send the 4 drafted PR pitches | Make it British, Ideal Home, IndyBest, Yorkshire Post | 0 mentions | S | Owner | VERIFIED (0 mentions) |
| O28 | Entity facts for AI (schema sameAs, About, llms.txt) | AI answers | 0/12 named | S | Owner | VERIFIED |
| O29 | Owner fact session → ottoman content (C02–C04, C07) | conversational ottoman questions | pos 1.6–6.3, 0 clicks | M | Owner facts | VERIFIED / HYPOTHESIS |
| O30 | Christmas ordering block (C05) | seasonal | time-critical | S | Owner dates | HYPOTHESIS |

---

## 23. Top 20 SEO problems

| # | Problem | Evidence | URL / scope | Severity | Commercial effect | Correction | Agent | Approval |
|---|---|---|---|---|---|---|---|---|
| 1 | Ottoman/drawer offers are misleading in metas, schema and feed | 15 metas pair storage with a non-storage price; schema = slatted-base price on 9 products | /products/line-bumper-ottoman-divan-bed and 14 more | P1 | Price surprise, possible Merchant disapproval | Stage 5 F1/F3 decision; drafts without price | Product Pages | BLOCKED: owner |
| 2 | Product pages rank but are not clicked | 9,201 impressions, 38 clicks, CTR 0.41%; 0 orders from 94 organic web landings | 145 PDPs | P1 | Lost demand on pages that sell | Snippet drafts (O01–O07) | On-Page SEO | Owner (meta) |
| 3 | Product signals split across feed URLs | 87 products, 415 URL versions, 31% of product impressions; 2 feed tags | e.g. Side Lift base (24 versions) | P1 | Weaker rankings for sellers | One feed source; URL Inspection | Feed agent + Technical SEO | Owner (Stage 5 #7) |
| 4 | Ad-driven sellers barely indexed in web search | Line Bumper 0 web impressions (268 free-listing sessions); 56 class E | /products/line-bumper-ottoman-divan-bed etc. | P1 | Dependence on paid | URL Inspection; links; collections | Technical SEO | Owner check |
| 5 | Product pages heavy | 693 KB inline Easify data; lab TBT 1.9–2.4 s; DCL ~10 s | 145 PDPs | P1 | Poor INP likely on phones (HYPOTHESIS) | Easify per-product loading | Speed & CWV | Owner (app) |
| 6 | Organic brand clicks falling | 42 → 17 in 28 days while PMax bids on brand | "eagle bed" | P1 | Paying for clicks organic used to win | Brand exclusion decision | Ads / Data Verification | Owner (Stage 5 #9) |
| 7 | Spam link profile | 33 of 34 referring domains are spam; still arriving | eaglebed.co.uk | P1 | Risk only if links were bought | Decision tree (section 18) | Link Scanner | Owner answer |
| 8 | No independent mentions or reviews | 0 mentions; 2 marked-up reviews; AI Overview citations 5 vs 11,750 | brand | P1 | Not named by AI; weak trust | Reviews, pitches, citations | Off-Page & PR | Owner |
| 9 | Walk-in shop implied | FurnitureStore + opening hours on 224 pages; GBP 49 direction requests; confirm details pending | sitewide, GBP | P1 | Customers may travel to a workshop; trust risk | Schema change; GBP service-area decision | Schema Markup + Local SEO | Owner |
| 10 | Banned/unconfirmed wording live | Memory Orthopaedic (81 pages); "memory orthopaedic" on 2 info pages; Clearpay; solid wood; 120x190; unconfirmed "end-opening" in the ottoman guide | product, /pages/handmade-in-dewsbury, /pages/press-and-media, /pages/ottoman-bed-frame-buying-guide | P1 | Compliance and accuracy risk | Rename + meta drafts | Copywriting | Owner |
| 11 | Commercial terms rank deep | 808 commercial queries, pos 36.1; chesterfield 764 impressions at about 32; divan bed 76.4 | collections | P2 | Little non-brand demand captured | Hub pages, internal links, authority | On-Page SEO | Owner |
| 12 | Ottoman cannibalisation | Jaccard 0.80–0.82; "ottoman divan bed" on 3 URLs at pos 57–87 | ottoman-beds, storage-beds, divan-ottoman-beds | P2 | Split signals | One owner per cluster; re-measure 17 Dec | Topic Clusters | Owner |
| 13 | Orphans and deep products | 34 products in no design collection; 16 only on page 3–5; 8 orphan URLs | collections, menus | P2 | Proven sellers hidden | Merch + menu links | Merchandising | Owner |
| 14 | Template descriptions | Median 68% template; 99 products ≥60% | 145 PDPs | P2 | Pages look alike to Google | 60–80 word unique openings (top 30 first) | Copywriting | Owner |
| 15 | Entity gaps | No legalName/company number in schema; registered office not on site; Batley conflict | Organization, Terms | P2 | Weaker trust and disclosure risk | Schema + Terms after accountant | Schema Markup | Owner + accountant |
| 16 | Yell wrong categories | office furniture, fitted bedrooms, fitted furniture across 6 towns | yell.com | P2 | Wrong local signals | Re-categorise | Local SEO | Owner |
| 17 | Key Google data missing | Field CWV, index coverage, Merchant diagnostics, search appearance all UNKNOWN | GSC, MC | P2 | Decisions made blind | Owner exports | Data Verification | Owner |
| 18 | Slow LCP in the lab | 3.7–3.9 s home/collection; 6.1 s Savoy (1200 px JPG) | /, /collections/ottoman-beds, Savoy | P2 | Mobile bounce | WebP, capped widths, re-measure | Speed & CWV | Owner (theme copy) |
| 19 | Sitemap and template hygiene | 2 noindex collections in sitemap; 4 empty blogs; 5 menu /search links; 9 pages with 2 H1s; article dates backwards; West Yorkshire duplicate title | T05–T09, T14, T16 | P3 | Small | Housekeeping batch | Technical SEO | Owner |
| 20 | No inbound trade route | /pages/trade returns 404; 292 cold emails → 1 interested | /pages/trade | P2 | Trade searchers have nowhere to land | Trade page in Stage 7 (C12) | Lead Finder + Content | Owner (trade terms) |

---

## 24. Technical implementation queue

**Completed in Stage 6:** reports and datasets only. **Nothing on any live system was changed.**

| Task ID | Status | Item |
|---|---|---|
| S6-R01 | COMPLETED | `01-organic-baseline.md` + 3 CSVs |
| S6-R02 | COMPLETED | `02-technical-schema.md` + 3 CSVs |
| S6-R03 | COMPLETED | `03-product-collection-onpage.md` + 3 CSVs (41 draft metas, not applied) |
| S6-R04 | COMPLETED | `04-keywords-competitors-backlinks.md` + 3 CSVs |
| S6-R05 | COMPLETED | `05-ai-local-content.md` + 2 CSVs |
| S6-R06 | COMPLETED | This report, `seo-opportunity-register.csv`, `owner-approval-queue.csv`, HQ `seo/stage6` |

**Proposed (none started; every task needs the stated approval):**

| Task ID | P | Agent | Evidence | URL / dataset | Action | Expected outcome | Dependencies | Approval | Completion criteria |
|---|---|---|---|---|---|---|---|---|---|
| S6-01 | P0 | Owner | Messaging automation went to draft on 19 Nov | Shopify Messaging | Check "You left items at checkout" is Active | Abandoned checkouts followed up | – | Owner | Status Active (screenshot) |
| S6-02 | P0 | Link Scanner | 31 PBN-anchor domains | backlink-opportunities B34 | Owner answer → decision tree | No penalty risk | Owner answer | Owner | Written answer + Manual actions screenshot |
| S6-03 | P0 | Local SEO | GBP "confirm details" since 5 Nov; 49 directions | GBP | Confirm details; decide service-area | Accurate local profile | – | Owner | GBP shows no action required |
| S6-04 | P0 | Copywriting | Memory Orthopaedic on 81 pages | product + 2 pages | Rename and remove wording | Compliance | Owner name choice | Owner | 0 "orthop" in live HTML |
| S6-05 | P1 | Schema Markup | T03, T04 | theme copy | Organization/OnlineStore, legalName, identifier, sameAs; drop opening hours | No walk-in signal | Unpublished theme copy | Owner | Rich Results Test passes; no FurnitureStore |
| S6-06 | P1 | On-Page SEO | 19 READY product + 10 collection drafts | draft-metadata.csv | Apply READY metas | CTR up at pos 4–11 | – | Owner (meta) | Live titles match drafts; GSC CTR at 28 days |
| S6-07 | P1 | On-Page SEO | 15 price metas, Clearpay, orthopaedic | draft-metadata.csv | Apply compliance metas | No misleading snippets | – | Owner | 0 banned terms in metas |
| S6-08 | P1 | Speed & CWV | T01 | 145 PDPs | Easify support ticket; per-product option sets | PDP HTML < 300 KB | Easify | Owner (app) | Lab TBT < 600 ms on 3 PDPs |
| S6-09 | P1 | Technical SEO | E class, T17 | 3 products | URL Inspection; report canonical | Know indexing state | – | Owner check | Screenshots received |
| S6-10 | P1 | Data Verification | UNKNOWN fields | GSC, MC, PSI | Owner exports (Pages, Enhancements, CWV, Search appearance, MC diagnostics, PSI field) | Close UNKNOWNs | – | Owner | Files in ops/rocket/stage6/owner-exports/ |
| S6-11 | P1 | Merchandising | 34 orphan products | collection-seo-audit.csv | Add to design collections | Proven sellers discoverable | – | Owner | 0 published beds outside a design collection |
| S6-12 | P1 | Local SEO | B01 | Yell | Fix categories | Correct citation | – | Owner | Yell shows beds categories |
| S6-13 | P1 | Technical SEO | T20 + conflict | Bing Webmaster | Live URL Inspection on 1 PDP | AI crawler access confirmed | – | Owner check | Live test passes |
| S6-14 | P2 | Technical SEO | T08, T14, T15 | menus/footer | Link size collections and orphan pages; replace /search links | Discovery | – | Owner (menus) | 0 orphan sitemap URLs |
| S6-15 | P2 | Technical SEO | T05, T06 | collections, blogs | seo.hidden on 2 collections; delete 4 blogs + 301 | Clean sitemap | – | Owner | Sitemap without them |
| S6-16 | P2 | Topic Clusters | T07, cannibalisation 6–8 | pages/blogs | 301 West Yorkshire article; merge ottoman guides; fold small-room guide | One URL per intent | C02 BLOCKED for the ottoman guide | Owner | Redirects live; GSC single URL |
| S6-17 | P2 | Schema Markup | T09, T13 | theme copy | Article dates/image/breadcrumbs; returnPolicyCountry | Correct markup | Returns method confirmed | Owner | Rich Results Test passes |
| S6-18 | P2 | Speed & CWV | T21, lab table | theme copy | Judge.me badge-only; one chat widget; WebP hero caps | LCP < 2.5 s lab | Field data first | Owner | Field CWV "good" |
| S6-19 | P2 | Copywriting | 68% template | top 30 products | 60–80 word unique openings | Distinct pages | Owner facts | Owner | Template share < 50% on top 30 |
| S6-20 | P2 | Off-Page & PR | B02–B04, B12–B25 | listings, pitches | Reviews flow; send pitches | Mentions and reviews | Owner time | Owner | First earned mention / reviews live |
| S6-21 | P2 | Content Creation | content-calendar.csv | C01–C17 | Draft READY items; hold BLOCKED | Answer-first guides | Owner facts session | Owner per item | Checklist ticked per item |
| S6-22 | P3 | Feed agent | T12, T22 | Shopify SKUs, 42 products | Fill 36 SKUs; confirm 42 unpublished not in feeds | Feed hygiene | Stage 5 feed work | Owner | 0 PDPs without sku |
| S6-23 | P3 | Technical SEO | T16, T23 | 9 pages; bare domain | Body H1 → H2; check bare-domain redirect | Hygiene | – | Owner | 1 H1 per page |
| S6-24 | P3 | AI Search | H6 | 4 AI platforms | Monthly manual AI test | Trend of AI mentions | – | Owner | Monthly CSV rows |

---

## 25. Outstanding owner decisions

The full queue, worded for YES/NO answers with priority: **`owner-approval-queue.csv`** (38 items: 9 P0, 17 P1, 10 P2, 2 P3). The main P0 and P1 items are below; OA38 (P0) is the Stage 5 F1/F3/F6/F7/F8 decision, and OA20–OA37 cover redirects, brand exclusion, pitches, reviews, housekeeping and owner checks.

| ID | P | Decision (answer YES or NO) |
|---|---|---|
| OA01 | P0 | Can you confirm nobody has ever paid for links or an "SEO package" for eaglebed.co.uk? |
| OA02 | P0 | Is the Shopify Messaging "You left items at checkout" automation now set to Active? |
| OA03 | P0 | Will you clear "confirm your business details" in Google Business Profile this week? |
| OA04 | P0 | Should GBP become a service-area business with the Dewsbury address hidden (no walk-in shop)? |
| OA05 | P0 | Do you approve renaming "Memory Orthopaedic Mattress" and removing "memory orthopaedic" from the 2 info pages? |
| OA06 | P0 | Do you approve replacing the sitewide FurnitureStore + opening hours schema with Organization/OnlineStore (theme copy first)? |
| OA07 | P0 | Will you and the accountant choose the registered-office address to show on the site (not Batley as the trading address)? |
| OA08 | P0 | Do you approve fixing the Yell categories to beds / bed manufacturer? |
| OA09 | P1 | Do you approve the 19 READY product and 10 collection meta drafts? |
| OA10 | P1 | Do you approve the compliance meta fixes (prices removed from 15 storage metas, Clearpay, orthopaedic, solid wood, 120x190)? |
| OA11 | P1 | Do you approve asking Easify support to stop inlining every option set on every product page? |
| OA12 | P1 | Do you approve adding the 34 orphan products to existing design collections? |
| OA13 | P1 | Will you run URL Inspection on Line Bumper, Line Ambassador and Mirror Strip Sunrise and send screenshots? |
| OA14 | P1 | Will you send the GSC and Merchant Center exports listed in S6-10? |
| OA15 | P1 | Will you run the Bing Webmaster live URL test on one product page? |
| OA16 | P1 | Do you approve adding legalName ABBAS TRADE LTD and company number 16410472 to the schema? |
| OA17 | P1 | Will you give the 20-minute fact session (opening direction, storage depth, strut rating, weights, fabrics, kids sizes, Christmas cut-off, trade terms)? |
| OA18 | P1 | Is it fine to keep Batley named as a delivery town on /pages/beds-west-yorkshire? |
| OA19 | P1 | Do you approve a trade page for Stage 7 (fixing the /pages/trade 404) once trade terms are written? |

Stage 5 decisions that still block SEO copy: F1 ottoman price truth, F3 drawer default, F6 colours, F7 heights, F8 opening direction, approvals 16 and 17, Q17 AI images, brand exclusion, BFPO, Clearpay. **Costs and VAT are PARKED by the owner and are not asked again here.**

---

## 26. Existing agent performance

| Report | Specialists | Parts delivered | Outputs | Credits | Manager's quality notes |
|---|---|---|---|---|---|
| 01 | Search Console, Analytics, Data Verification | 3 (baseline), 15 (attribution), Stage 5 carry-forward | 1 report, 3 CSVs (325 + 52 + 12 rows) | 18 | Strong reconciliation of GSC, GA4 and Shopify; clean 5 Oct window. Assumed a 116 starting ledger |
| 02 | Technical SEO, Speed & CWV, Schema Markup, SEO Drift Watch, Verification | 4, 7, 8, 9 | 1 report, 3 CSVs (23 + 268 + 224 rows), drift baseline | 0 (own crawl replaced audit_site) | Thorough, saved 9 credits. Could not find the question list. Its CDN finding (403 for bot UAs) **conflicts** with report 05 (200) |
| 03 | Product Pages, On-Page SEO, Copywriting, Topic Clusters, Merchandising, CRO | 5, 7, 8 (products, collections, on-page) | 1 report, 3 CSVs (145 + 26 + 41 rows) | 6 | Full 145-product audit and 41 compliant drafts. GSC figures are UK-only (report 01 uses all countries) |
| 04 | Keyword Research, Spy Agent, Market Research, Off-Page & PR, Link Scanner | 6, 11, 12 | 1 report, 3 CSVs (148 + 51 + 36 rows) | 48 | Real volumes; found the spam links and Yell categories. Difficulty UNKNOWN by tool design. Could not find the question list |
| 05 | AI Search, AI Recommendations, AI Platforms, Agentic SEO, Local SEO, Content Creation, Video & Voice SEO, Lead Finder | 10, 13, 14, 23 | 1 report, 2 CSVs (20 + 17 rows), owner AI test script | 25 | Found GBP, entity and wording issues. Gemini not re-run (402) |
| Manager writer | Report writer | Consolidation | This report, 2 new CSVs, HQ doc, HTML | 0 | No new research |

---

## 27. Resource & credit usage

| Item | Credits | Label |
|---|---|---|
| Baseline (report 01: 6 GSC/GA4 calls) | 18 | VERIFIED (Manager) |
| Keywords, competitors, backlinks (report 04: 6 research_keywords, 3 inspect_serp, 1 inspect_backlinks) | 48 | VERIFIED (Manager) |
| AI visibility (report 05: 1 inspect_ai_visibility) | 25 | VERIFIED (Manager) |
| Product pages (report 03: 2 GSC calls) | 6 | VERIFIED (Manager) |
| Technical (report 02) | 0 | VERIFIED (Manager) |
| **Stage 6 total** | **97** | VERIFIED (Manager) |
| **Month to date** | **213 of 2,001** | VERIFIED (Manager) |
| Protected reserve (400) | untouched | VERIFIED (Manager) |

Each specialist reported its own ledger from a 116 starting point; the Manager's combined figure (116 + 97 = 213) supersedes them. Free sources used: Shopify Admin GraphQL and ShopifyQL (read-only), HQ reads, WebSearch, Playwright, about 600 polite site requests in total, PageSpeed API (1 call, 429). Not used: audit_site, compare_keyword_coverage (30), compare_backlink_gap (60), a second inspect_backlinks for lost links (15).

---

## 28. Stage 7 preparation (customer recovery & trade)

| Item | Evidence | Stage 7 needs | Label |
|---|---|---|---|
| **Abandoned checkout Active check** | Shopify Messaging "You left items at checkout" went to draft when edited on 19 Nov; about 45 real abandoned checkouts a month; one listed customer had already ordered (#1034) | Owner sets it Active; always check for a later order before any manual contact | VERIFIED (Manager) / ESTIMATE (volume, Stage 1) |
| **Trade page 404** | `/pages/trade` returns 404; no inbound trade route | Trade terms (pricing basis, minimum order, VAT invoice, lead time, COM metres per size); quote form or WhatsApp CTA; no "hotel supplier"; no fire claims without documents | VERIFIED |
| **Landlord / HMO guide** (C13) | Q12 "beds for HMO / landlords": Eagle not named; competitors are contract specialists | Built after C12; links to the trade page; checklist format | HYPOTHESIS (volume UNKNOWN) |
| **Trade evidence** | Stage 1: 253 emails 11–18 Nov, 1 interested, 0 orders; Manager's latest count 292 emails, 1 interested (Ivywell Interiors asked about COM); trade emails to companies only (Stage 5 X4); PECR risk for sole traders | Inbound route instead of more cold email | HISTORICAL |
| **Aftercare / reviews** | /pages/aftercare-and-feedback gets 8 GSC clicks but is an orphan; 2 marked-up reviews; gas-lift support terms ("assembly instructions" 260, "not working" 90) | Link aftercare from the delivery confirmation; Judge.me/GBP/Trustpilot requests after delivery, no incentives (C16) | VERIFIED / HYPOTHESIS |
| **Returning customers** | 1 of 16 recent orders returning (Stage 1); marketing box unticked by default since 19 Nov | Consent-based segments; add-on headboards/mattresses with correct option prices | HISTORICAL |

---

## Owner's questions A–O

**A. Which keywords are bringing customers to Eagle Bed?**
- **No keyword can be tied to an order.** GSC reports queries in aggregate; Shopify stores only the landing page. UNKNOWN by design.
- **Clicks (90 days, VERIFIED):** brand "eagle bed"/"eagle beds" 107; guide queries ("divan vs bed frame" 8, "ottoman bed meaning" 4, "what is a divan bed" family about 5); Cloud Teddy product terms 8; 808 generic commercial queries gave only 32 clicks at position 36.
- **Orders with an organic touch since March:** #1007 (home landing, probably brand, HYPOTHESIS), #1005 (product landing, probably non-brand, ESTIMATE), #1024 (free listing for the 3000 Pocket Sprung Mattress, ESTIMATE). Last 30 days: 0.
- The keywords closest to customers are the **Cloud Teddy** product queries: the only organic product page with checkouts (25 sessions, 3 carts, 2 checkouts, 0 orders in 90 days). VERIFIED.

**B. Which valuable commercial keywords are we missing?** (UK volumes VERIFIED; difficulty UNKNOWN)
- **Ottoman:** ottoman bed 90,500 (not top 20); king size ottoman bed 33,100 (not ranking); small double ottoman bed 27,100 (69.6); ottoman divan bed 4,400 (70.6); gas lift ottoman bed 880 (#38 with the wrong page). **BLOCKED for traffic pushes until Stage 5 ottoman prices are truthful.**
- **Divan:** divan bed 33,100 (76.4); divan bed/base with drawers (52–64; BLOCKED by F3).
- **Upholstered:** upholstered bed 2,900 and upholstered bed frame 2,400 (not top 20).
- **Chesterfield** (volume UNKNOWN; 764 impressions at about 32; weak SERP).
- Long tail that fits: gas lift ottoman bed assembly instructions 260, ottoman bed gas lift not working 90.

**C. Which products have the greatest organic sales potential?** (class A, ESTIMATE rules)
- Ottoman Gas Lift Divan Base (7 orders ever; 398 free-listing sessions), Side Lift Ottoman Storage Base (7 orders), **Cloud Teddy** (903 impressions at 10.9, the only organic product checkouts), Mirror Strip Sunrise (3 orders, almost invisible in web search), Line Kids Velvet (3 orders), 3000 Pocket Sprung Mattress (3 orders, 1 probable free-listing order).
- Near-page-1 designs with no clicks yet: Panel Line Border, Square Panel, Indigo Line, Star, Mini Line Luxury, Multi Mini Line, Oxygen, Level Lines.

**D. Which product pages need SEO improvement?**
- The top 30 in section 10, led by Cloud Teddy, Panel Line Border, Square Panel, Ottoman Gas Lift Divan Base and Indigo Line.
- The 15 metas with storage claims and non-storage prices (BLOCKED on F1/F3), Memory Orthopaedic (rename), Pillow Top (Clearpay).
- 56 class E pages (poorly indexed), starting with Line Bumper, Line Ambassador and Mirror Strip Sunrise (URL Inspection first).
- All 145 share a median 68% template description; start unique openings on the top 30.

**E. Which collection pages should we develop?**
- **Existing pages only; no new collections now.** ottoman-beds (single ottoman/gas-lift hub, after price truth), chesterfield-beds (after the duplicate-pair decision), panel-beds and wingback-beds (already near page 1), storage-beds-with-drawers and divan-beds (after F3).
- Add the 34 orphan products to design collections. Review size collections on 10 Feb.

**F. What is preventing Google from indexing or ranking important pages?**
- Not crawl errors: 224/224 URLs return 200, self-canonical, 0 broken links. VERIFIED.
- **Ranking blockers:** feed links split signals (415 URL versions, two feeds); weak internal linking (34 orphan products, 8 orphan URLs, menu /search links); cannibalisation in the ottoman cluster; template descriptions; almost no genuine links (1 of 34); heavy product pages (lab TBT ~2 s).
- **Unknowns:** GSC index coverage, Google-selected canonicals, field CWV. Owner exports needed.

**G. Which competitors are outranking us and why?**
- Ottoman: somnibeds, furniture123, bedwick, ukbedsdirect (HISTORICAL); gas lift: Facebook seller posts, livingwithluxury, rebeldreams, bedroomking. Drawers: next, sognarebeds, divanbedking. Chesterfield: ebay, amazon, bedcreed, craftedbeds. VERIFIED SERPs 19 Nov.
- **Why:** one dedicated page per search angle, definition paragraphs, price-led guides, review platforms (PSCL Trustpilot about 2,276), directories and editorial round-ups. AI answers favour dreams, happybeds and bedkingdom.

**H. How can Eagle Bed become more discoverable through AI search?**
- Publish the concrete facts AI answers quote (storage depth, strut rating, mattress weight, opening direction) once the owner confirms them.
- Earn independent mentions and real reviews (pitches already drafted; GBP, Trustpilot, Judge.me).
- Make the entity consistent: legalName, company number, sameAs, registered office, Yell and Apple fixes.
- Fix the Stage 5 prices: AI shopping agents read Shopify's product data directly.
- Confirm real crawler access (Bing live test) and run the monthly manual AI test.

**I. Which structured-data and technical improvements matter most?**
1. Easify per-product option loading (T01).
2. Ottoman offer truth (T02, Stage 5).
3. Replace FurnitureStore + opening hours with Organization/OnlineStore (T03).
4. One feed source to stop parameter URLs (blocker 7).
5. Internal links for orphans and size collections (T08, T14).
6. Article dates, image and breadcrumbs (T09); legalName and identifier (T04); returnPolicyCountry (T13).
Add no more FAQPage markup.

**J. Which content can attract people who are ready to purchase?**
- Product and collection snippets first (pages already at position 4–11).
- Ottoman decision content: storage by size (C07), side/end/gas lift explained (C03), mattress compatibility (C04), one ottoman hub (C02). All BLOCKED on owner facts.
- Christmas ordering block (C05, time-critical), delivery-day explainer (C06), product blocks on guides that already rank (how-do-ottoman-beds-work, divan-vs-bed-frame).
- Trade page (C12) for landlords and agents.
Guides alone produced 0 carts in 90 days (VERIFIED), so every guide must link to products and collections.

**K. Which organic visits actually become Shopify orders?**
- Last 30 days: **none** (89 sessions, 15 carts, 4 checkouts, 0 orders). VERIFIED.
- Since 5 Oct: **1** (#1024, free listing, ESTIMATE).
- Since March: 3 orders, £1,285.55 (ESTIMATE). Home-page landings (most likely brand) produce most carts; brand buyers may return direct and buy (HYPOTHESIS).

**L. What are the 30 highest-value SEO opportunities?**
Section 22 and `seo-opportunity-register.csv`. The top 10: Cloud Teddy snippet; Panel Line Border; Square Panel "square bed frame"; panel-beds; wingback-beds; 3 products at pos 4.5–5.9; 3 products at 6.1–10.7; compliance meta clean-up; 3000 Pocket Sprung title; Ottoman Gas Lift Divan Base meta.

**M. What are the 20 biggest SEO problems?**
Section 23. The top 5: misleading ottoman/drawer offers in metas, schema and feed; product pages ranked but not clicked; signals split across feed URLs; ad-driven sellers barely in web search; heavy product pages.

**N. What can we improve without increasing advertising expenditure?**
Everything in sections 22–24 is £0 ad spend. Snippet and compliance metas; orphan products into collections; menu and internal links; Easify ticket; schema changes; GBP, Yell, Apple and FreeIndex; real reviews; the 4 drafted PR pitches; content once owner facts arrive; free product listings health; and the brand-exclusion decision, which could **move brand clicks back to free organic**.

**O. What must be completed before Stage 7?**
1. Abandoned-checkout automation Active (OA02).
2. Owner answer on bought links (OA01).
3. GBP "confirm details" and the service-area decision (OA03, OA04).
4. Trade terms for the trade page; `/pages/trade` currently 404 (OA19).
5. The owner fact session (OA17), which unblocks the ottoman content and the Christmas block.
6. Approval of the READY meta drafts and compliance fixes (OA09, OA10).
7. Stage 5 F1/F3 decisions, which stay the biggest blocker for both Ads and SEO.
8. Owner exports (GSC indexing/enhancements/CWV, Merchant Center) to close the UNKNOWNs.

---

## Limitations

- GSC query rows cover 39% of 90-day clicks; class shares outside listed rows are ESTIMATE. Report 03 uses UK-only GSC; report 01 uses all countries.
- No query-to-order link exists; brand/non-brand per order is inferred from the landing page.
- Field CWV, index coverage, Merchant diagnostics, search appearance, Google-selected canonicals, ChatGPT/Perplexity/Copilot/AI Mode visibility: UNKNOWN.
- The AI-crawler CDN result conflicts between reports 02 and 05; both used spoofed agents from a data-centre IP.
- Volumes exist only for ottoman, divan, bed-frame, upholstered and gas-lift families; chesterfield, wingback, velvet, bouclé, kids and mattress volumes are UNKNOWN. SEO difficulty is UNKNOWN everywhere.
- Competitor sites were blocked; competitor structure comes from SERP titles and snippets only.
- Classes, opportunity scores and the register order are rule-based ESTIMATEs.
- Costs and VAT are PARKED by the owner, so profit is UNKNOWN.

## Credits used

- **This report:** 0 OpenRush credits. Stage 6 total **97**; month **213 of 2,001**; reserve untouched (Manager, VERIFIED).
- **HQ (ArtifactData):** 1 write, `seo/stage6` (new document, under 100 KB).
- **Files written:** `ops/rocket/stage6/STAGE6-REPORT.md`, `seo-opportunity-register.csv`, `owner-approval-queue.csv`; HTML summary `rocket-stage6.html` in the session scratchpad. Nothing published or committed.
