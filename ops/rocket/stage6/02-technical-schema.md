# Stage 6 · Report 02: Technical SEO, indexing, Core Web Vitals and structured data

Project Rocket Sales, Stage 6, parts 4, 7, 8 and 9. Specialists: Technical SEO, Speed & CWV, Schema Markup, SEO Drift Watch and Verification. Run on 19 Nov 2026 (night). Read-only. Nothing on the live site, theme, apps, feed or Shopify was changed.

Files:
- `technical-seo-issues.csv`: 23 issues (T01–T23), each with evidence, severity, search and commercial impact, owner, proposed fix, size and approval.
- `indexing-audit.csv`: 268 rows. All 224 sitemap URLs, plus 44 test URLs (redirects, parameters, duplicates, 404s).
- `schema-audit.csv`: 224 rows, one per sitemap page, covering JSON-LD types, product offer fields, ratings, shipping and returns, FAQ, breadcrumbs, Article and Organization.

**How I read the questions.** I could not find the Stage 6 question list in the repo; report 04 had the same problem. I read **F** as "Can Google crawl, index and load the site properly, and what is technically holding it back?" and **I** as "Is our structured data correct, complete and honest, and which rich results can we get?"

---

## Answers first

**F. Can Google crawl and index the site, and what is holding it back technically?**

The foundations are sound. Every sitemap URL answers 200, and every one has a self-canonical. No live page links to a 404. All the duplicate URL forms canonicalise correctly. The sitemap matches the store exactly: 145 published products, 21 pages, 26 collections and 26 articles. **The main technical risk is speed on product pages.** Easify puts about 690 KB of option data into the HTML of every product page. On a throttled phone in the lab, that blocks the main thread for about 2 seconds. The smaller issues are housekeeping:
- 2 noindexed collections listed in the sitemap
- 4 empty legacy blogs
- 13 orphan URLs, plus 16 products reachable only through deep pagination
- a duplicate West Yorkshire title
- search-page links in the menu

None of these blocks indexing. Field Core Web Vitals and GSC index coverage are **UNKNOWN**: PageSpeed returned 429, and OpenRush does not expose page indexing.

**I. Is the structured data correct and complete?**

Mostly yes, and better than most small Shopify stores. All 145 products have:
- a Product with one Offer per size, in GBP, InStock, with brand "Eagle Bed"
- **shipping details**: free to England, Scotland and Wales; £90 to Northern Ireland; 3–5 working days
- a **14-day free-return policy**

Collections and products have breadcrumbs. Only real Judge.me data is marked up: 2 products with one 5-star review each. There are 5 problems:
1. **A FurnitureStore with opening hours is output on every page.** That tells Google there is a walk-in shop, and there is none (P2).
2. **The 9 ottoman-named products carry the slatted-base price** (the Stage 5 headline issue). The markup matches the page, so the fix is the owner's offer decision, not schema (P1, BLOCKED).
3. Article dates are backwards: modified before published. Articles also have no image (P2).
4. There is no legal name or company number on the Organization (P3).
5. The FAQPage markup on 161 pages no longer earns any rich result. It does no harm (P3).

### Top fixes, in order (all proposals; approval needed)

| # | Fix | Why | Size | Approval |
|---|---|---|---|---|
| 1 | Ask Easify to stop putting every option set into every product page (T01) | Product-page main thread blocked about 2 s in the lab, so INP is at risk on the pages that sell | M | Owner (app settings) |
| 2 | Decide the ottoman default price/title (T02, Stage 5) | The schema, feed and page all show a slatted-base price on "Ottoman … Gas Lift" products | S once decided | BLOCKED: owner |
| 3 | Swap the sitewide FurnitureStore + opening hours for Organization/OnlineStore (T03) | No walk-in shop (BRIEF) | S | Owner (theme copy) |
| 4 | Hide `new-trending` and `frontpage` properly (seo.hidden) or un-noindex them (T05); delete the 4 empty blogs and 301 them (T06) | Sitemap hygiene | S | Owner |
| 5 | Link the size collections and the 3 orphan pages from the menu, footer and size guide (T08); point menu search links at real collections (T14) | Discovery and internal PageRank | S–M | Owner (menus) |
| 6 | Fix the Article schema dates and image; add breadcrumbs on articles (T09) | Freshness signals | S | Owner (theme copy) |
| 7 | Organization legalName "ABBAS TRADE LTD" and company number; returnPolicyCountry on the return policy (T04, T13) | Entity trust and merchant-listing completeness | S | Owner |

---

## 1. What I checked and how (VERIFIED unless labelled)

- **Crawl.** My own Python crawler with a Chrome user agent, ≤1 request per second. I covered:
  - robots.txt and the sitemap index, with 6 child sitemaps
  - all 224 content URLs in the sitemaps, plus HEAD status checks
  - 26 collections with all their pagination pages (70 pages)
  - blog pagination pages 2–4
  - 44 test URLs for redirects, duplicates and 404s

  Internal links were taken from the static HTML of all 224 pages. Links injected later by JavaScript are not counted.
- **Shopify Admin (read-only GraphQL).** Product, page and collection counts, page publish status, all 54 URL redirects, and the live theme ID.
- **GSC.** I reused today's Stage 6 OpenRush pull (`gsc-page-3m`: 3 months, 494 page rows). I spent no new credits on it.
- **Lab CWV.** Playwright Chromium, emulated Moto G Power, 150 ms RTT, 1.6 Mbps, CPU ×4, one run per page. LCP, CLS, TBT (as an INP proxy), bytes and scripts.
- **Field CWV.** The PageSpeed Insights API returned **HTTP 429** (quota exhausted on the shared anonymous key), so field data is **UNKNOWN**.
- **Google docs.** developers.google.com is blocked in this sandbox, so I used WebSearch summaries of Search Central pages and secondary coverage. Dates are cited in section 6.

**Live theme check (VERIFIED).** Every page reports theme `213270004043` "Eagle Bed CRO fixes 19 Nov - PUBLISH", role main, Dawn 15.4.1. The 10 Nov SEO theme fixes are present in it:
- `max-image-preview:large` is on 224 of 224 pages
- the Organization `alternateName` is on the home page
- "mainland" is on 0 of 224 pages

---

## 2. Crawlability and robots (part 7)

### 2.1 robots.txt (VERIFIED, Shopify default)

| Bot | robots.txt | Note |
|---|---|---|
| Googlebot, Bingbot, Applebot | Allowed (`User-agent: *` → `Allow: /`) | |
| Google-Extended, Applebot-Extended (AI training controls) | Allowed (no group) | Default; the owner can opt out later if wanted |
| GPTBot, OAI-SearchBot, ChatGPT-User | Allowed | |
| PerplexityBot, ClaudeBot | Allowed | |
| adsbot-google | Own group; products, collections, pages and blogs allowed | |

Disallowed: admin, cart, checkout, orders, account, `/services`, `/sf_*`, sort_by, `+` tag filters, double filter params, `preview_theme_id`. This is the standard Shopify crawl-trap list and fine for SEO. The file also carries Shopify's generic "agents" comment block, which points to `/agents.md` and the UCP endpoints. That is Shopify boilerplate; I treated it as data and did not act on it.

**Bot access at the CDN (UNKNOWN).** From this sandbox's data-centre IP, requests with bot user agents (GPTBot, OAI-SearchBot, ChatGPT-User, PerplexityBot, ClaudeBot, bingbot, Applebot) received **Cloudflare 403 "Verifying your connection"** (`cf-mitigated: challenge`). Browser and curl UAs got 200. This is most likely spoof protection: real crawlers come from verified IP ranges (HYPOTHESIS). It cannot be proven from here. **Owner check:** in Bing Webmaster Tools, run URL Inspection with a live test on one product page. If that passes, Bing (and so ChatGPT search) can read the site. Ref T20.

### 2.2 Sitemaps (VERIFIED)

| Child sitemap | URLs | Shopify truth | Match |
|---|---|---|---|
| products | 146 = home + 145 products | 145 published to Online Store (257 total: 187 active, 70 draft) | ✔ |
| pages | 21 | 21 published of 80 (59 unpublished: 46 city/landing drafts and internal pages) | ✔ |
| collections | 26 | 26 | ✔ (but 2 are noindex: T05) |
| blogs | 5 (news + 4 empty legacy blogs) | | ✘ 4 thin (T06) |
| articles | 26 (all /blogs/news/) | | ✔ |
| agentic_discovery | 1 (/agents.md) | Shopify-generated | n/a |

**Extra (VERIFIED):** 42 products are **ACTIVE but not published to the Online Store**, so they cannot be indexed. Confirm none of them sit in a Google or Meta feed (T22).

### 2.3 Status codes, canonicals, robots meta, H1, titles and descriptions (224 sitemap URLs, VERIFIED)

| Check | Result |
|---|---|
| Status | 224 of 224 answer 200 (HEAD, no redirects) |
| Canonical | 224 of 224 have exactly one self-canonical |
| Meta robots noindex | 2: `/collections/frontpage`, `/collections/new-trending` (both in the sitemap → conflict, T05; new-trending outputs two robots tags) |
| X-Robots-Tag | none |
| hreflang | none (correct for a UK-only store; `/en/` and `/en-us/` return 404, so there are no Markets duplicates) |
| H1 | 215 pages have exactly one; **9 pages have two** (contact, delivery-information, returns-policy, bespoke-beds-uk, ottoman-bed-frame-buying-guide, share-your-bedroom, handmade-in-dewsbury, press-and-media, single-beds-3ft-uk) (T16) |
| Title | all present; 4 over 60 characters (3 articles have a line break before "– Eagle Bed"); 1 duplicate pair (West Yorkshire page vs article, T07) |
| Meta description | 4 missing (the 4 empty blogs); 9 over 160 characters, 4 of them 320-character auto-excerpts (T16) |
| Thin pages | the 4 empty legacy blogs (~333 words = header and footer only) |
| Images | 8,268 `<img>`; 5,906 have empty alt. They are mostly mega-menu and thumbnail images in the theme (`eb3d-drop__img`, `eb3d-thumb`), i.e. decorative duplicates. Main product photos have alt text (report 03). P3 only |

### 2.4 Redirects, duplicates and parameters (VERIFIED, live tests)

| URL form | Result | OK? |
|---|---|---|
| `http://www.` | 301 → `https://www.` (1 hop) | ✔ |
| `https://eaglebed.co.uk` (non-www) | Not testable: sandbox proxy blocks the bare host | UNKNOWN (owner check, T23) |
| `/products/x?variant=…`, `?utm_…`, `?country=GB&currency=GBP` | 200, canonical → `/products/x` | ✔ |
| `/collections/ottoman-beds/products/x` | 200, canonical → `/products/x`; collection grids link the clean `/products/x` (0 collection-scoped links found) | ✔ |
| `/products/x/` and `/products/X-UPPER` | 200, canonical → clean lowercase URL | ✔ |
| `/collections/x?sort_by=…`, `?filter.…` | 200, canonical → clean collection; sort_by also blocked in robots | ✔ |
| `/collections/x?page=2` | 200, self-canonical (Shopify default; fine) | ✔ |
| `/collections/x?page=99` | 200, empty grid, self-canonical: possible soft 404, never linked | P3 (T18) |
| `/collections/all` (+ pages) | 200, `noindex, follow`; linked from 3 pages; GSC still shows 177 impressions in 3 months | P3 (T15) |
| `/search?q=…` | 200, `noindex, follow`; **the menu links 5 search URLs on every page**; GSC 110 impressions | P3 (T14) |
| `/collections/vendors?q=…` | 200, indexable, self-canonical (Shopify default, not linked) | P3 |
| Unpublished internal pages (`/pages/internal-email-drafts`, `kpi-baseline-…`) | 404 | ✔ (no leak) |
| Retired city pages (`/pages/beds-london`, `-leeds` …) | 301 → `/pages/bespoke-beds-uk` (54 Shopify redirects in total, all sampled ones work) | ✔ (T19) |
| Old handles (`/collections/upholdersted-bed`, `/collections/beds`, `/blogs/news/uk-bed-size-guide`, `/pages/divan-beds`) | single 301 to the live target, no chains or loops | ✔ |
| `/blogs/news/tagged/ottoman`, `/collections/types?q=Beds`, `/products/does-not-exist` | 404 with the real 404 status | ✔ |

**Broken internal links: 0 (VERIFIED for static HTML).** Every internal link target across the 224 pages resolves to 200 or a single 301. One product links to `/collections/beds` (301). Three pages link to noindex `/collections/all`.

### 2.5 Parameter URLs in GSC (Stage 2 follow-up)

Stage 2 found 17 of the top 60 URLs with parameters (HISTORICAL). Today's 3-month GSC page pull (reused, 494 rows) shows **330 of 494 rows with parameters, but only 22 clicks and 3,478 impressions** (VERIFIED). By parameter: variant 185, currency 59, country 45, `_pos` 38, page 3.

The site canonicals are correct (section 2.4). These rows most likely come from **Merchant or free listings**, whose feed links carry `?variant=…&country=GB&currency=GBP`, and from Shopify's search tracking (`_pos`) (HYPOTHESIS). They are a reporting artefact, not an indexing split. **Owner check:** GSC → Performance → Search appearance → "Merchant listings" filter on these URLs. No site change is needed. The feed link format is a Stage 5 item.

### 2.6 Orphans and internal linking (VERIFIED for static HTML)

| Group | URLs | How Google can reach them today |
|---|---|---|
| Orphan pages | `/pages/share-your-bedroom`, `/pages/aftercare-and-feedback`, `/pages/single-beds-3ft-uk` | Sitemap only |
| Orphan size collections | `kids-single-beds`, `single-storage-beds`, `double-storage-beds`, `small-double-storage-beds`, `double-divan-beds` (+ `frontpage`, noindex) | Sitemap only |
| Empty legacy blogs | `delivery-informaction`, `contact`, `delivery-returns`, `warranty` | Sitemap only (delete + 301, T06) |
| Products only on deep pagination | 16 (e.g. Tower, Sunrise, Coca, Arizona, Grand Luxury, Roman Sleigh, Patti, Black Bumper, Rio Ambassador, Double Arrow, Level Lines) | Page 3–5 of upholstered or size collections, or noindex `/collections/all` |
| Articles only on blog page 2–3 | best-beds-near-me…, ottoman-storage…how-much-storage…, beds-in-west-yorkshire… | Blog pagination |
| Weakly linked (1–2 links) | 50 URLs incl. about-us, reviews, why-buy-from-eagle-bed, uk-bed-buying-guide, best-sellers | |

Size collections by product count:

| Size collection | Products | Grid pages |
|---|---|---|
| small-double-beds | 121 | 6 |
| double, king, super-king | 115 each | 5 each |
| single-storage, double-storage, small-double-storage | 17 each | 1 each |
| kids-single-beds | 6 | 1 |

None are thin; there are **no "no products" soft-404 collections**. The smallest are mattresses, kids-beds and storage-beds-with-drawers, with 6 products each.

### 2.7 GSC index coverage (UNKNOWN)

OpenRush has no page-indexing tool; `describe_capabilities` lists none, and inspect_search_visibility is rankings only at 14 credits, so I did not call it. **Owner export needed:**
- Search Console → **Indexing → Pages** → Export (Google Sheets or CSV). It must include the "Why pages aren't indexed" table and drill-down exports for "Crawled – currently not indexed", "Discovered – currently not indexed", "Duplicate, Google chose different canonical", "Alternate page with proper canonical tag", "Excluded by 'noindex' tag" and "Soft 404".
- **Enhancements → Product snippets, Merchant listings, Breadcrumbs**: export the valid, invalid and warnings lists.
- **Experience → Core Web Vitals**: mobile and desktop URL groups.

---

## 3. Core Web Vitals (part 8)

**FIELD (CrUX): UNKNOWN.** PageSpeed Insights API: `429 RESOURCE_EXHAUSTED` (daily quota on the shared key). No CrUX key is available in this session.

**LAB (VERIFIED, one run each, throttled mobile as above).** Third-party hosts blocked by the sandbox (GTM, Meta, TikTok, Omnisend API, Judge.me tracking, Dondy API, shop.app) are not loaded. The real site is therefore **heavier** than these numbers.

| Page | TTFB | FCP | LCP | LCP element | CLS | TBT (INP proxy) | Long tasks | DCL | Requests | Weight | JS | HTML |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Home | 958 ms | 2.1 s | **3.9 s** | hero webp (preloaded, fetchpriority high) | 0.015 | 827 ms | 14 | 5.4 s | 164 | 1.9 MB | 593 KB | 341 KB |
| /collections/ottoman-beds | 241 ms | 1.2 s | **3.7 s** | collection banner webp | 0.014 | 706 ms | 11 | 4.2 s | 172 | 2.0 MB | 581 KB | 360 KB |
| /products/ottoman-gas-lift-divan-base | 243 ms | 1.3 s | 2.4 s | product photo | 0.003 | **2,363 ms** | 30 | 10.2 s | 250 | 2.7 MB | 1.24 MB | ~1.05 MB |
| /products/cloud-teddy-boucle-ottoman-gas-lift-storage-bed | 237 ms | 1.2 s | 3.1 s (3.6 s on a re-run) | product photo | 0.003 | **2,139 ms** (2,000 re-run) | 34 | 9.8 s | 272 | 2.8 MB | 1.25 MB | 1.07 MB |
| /products/savoy-channel-tufted-bed-frame | 336 ms | 1.3 s | **6.1 s** | product photo 247.jpg (1200 px jpg) | 0.003 | **1,941 ms** | 28 | 10.6 s | 261 | 2.9 MB | 1.24 MB | ~1.05 MB |

Google's "good" thresholds are LCP ≤ 2.5 s, INP ≤ 200 ms and CLS ≤ 0.1. In the lab:
- **CLS is good** everywhere.
- **LCP misses on slow 4G** on home, collection and the Savoy page.
- **Product pages carry ~2 s of main-thread blocking**, which makes a poor INP likely on phones (HYPOTHESIS until field data).

These figures are consistent with Stage 1 and Stage 3 (HISTORICAL: home LCP 5.3 s throttled, PDP DCL ~10 s).

**JS by app on a product page (Cloud Teddy, LAB, compressed bytes):**

| Source | Files | KB | Note |
|---|---|---|---|
| **Easify Product Options** | 4 | **387** | Plus a **693 KB inline `option_set` script in the HTML of every PDP**. This is the single biggest cost |
| Shopify core / other | 51 | 306 | |
| Judge.me | 50 | 186 | Loads the full review widget for 2 reviews in the whole store |
| Theme assets | 17 | 98 | |
| Shopify Inbox (chat web components) | 9 | 89 | |
| Shopify wallets | 1 | 83 | |
| Dondy WhatsApp | 1 | 70 | |
| Shopify web pixels (GA4/Meta/TikTok loaders) | 2 | 12 | Destinations blocked here |
| Simprosys (`storage.googleapis.com/gsf-scripts/custom-pixels/0whctf-mu.js`) | 1 | 7 | Loads on every page. Stage 1 called it an "empty tag"; its content was not checked |
| Omnisend | 1 | 1 | Loader only; the main script is blocked here |

**CWV proposals (protect the published CRO theme: test on an unpublished copy only):**
1. **Easify (biggest win).** Ask Easify support to load option sets per product or on demand instead of inlining all sets on every PDP. Remove unused option sets. Target product-page HTML under 300 KB.
2. **Judge.me.** Use the lightweight "preview badge only" and load the review widget on scroll or click. With 2 reviews store-wide, the full widget adds 50 files for almost nothing.
3. **Chat.** Shopify Inbox and Dondy are two chat widgets. Keep one, and load it after first interaction. This links to the Stage 1 WhatsApp decision.
4. **LCP images.** The Savoy hero is a 1200 px JPG (6.1 s LCP in the lab). Serve WebP and cap the mobile width (e.g. width=800 for the 412 px viewport) in the theme copy. The home hero is already preloaded; cap its mobile srcset at 900.
5. **Re-measure with field data** (owner: pagespeed.web.dev, Mobile, the same 5 URLs; or GSC → Core Web Vitals) before and after each change.

---

## 4. Structured data (part 9)

### 4.1 What is on each page type (VERIFIED, all 224 pages parsed, 0 JSON-LD parse errors)

| Page type | JSON-LD found | Microdata |
|---|---|---|
| Home | Organization (+alternateName, contact point, address, logo, sameAs FB/IG/TikTok), WebSite + SearchAction, FurnitureStore | none |
| Collections (26) | FurnitureStore, BreadcrumbList (2 items). No ItemList (optional) | none |
| Products (145) | FurnitureStore, Product (theme) + BreadcrumbList (3 items) + FAQPage (4–9 Q); 2nd/3rd Product node from Easify (additionalProperty) and Judge.me (rating) on 135 PDPs; VideoObject on 1 (Fluted Velvet) | none |
| Articles (26) | FurnitureStore, Article; FAQPage on 7 | none |
| Pages (21) | FurnitureStore; FAQPage on 9 (request-a-swatch, warranty, delivery-information, returns-policy, finance-options, about-us, bed-sizes-guide, beds-west-yorkshire, uk-bed-buying-guide). `/pages/faq` itself has no FAQPage | none |

**FAQPage count.** The brief said FAQPage was on 13 pages. **In fact it is on 161: all 145 products plus 16 pages and articles** (VERIFIED).

### 4.2 Product markup against Google's merchant listing / product snippet fields

| Field | Status (145 PDPs) | Label |
|---|---|---|
| name, image (≤6 × 1200 px), description, url | ✔ all | VERIFIED |
| offers: one Offer per size variant, price, priceCurrency GBP, availability InStock, itemCondition New, seller → Organization | ✔ all | VERIFIED |
| Schema price = page price (og:price) | ✔ 145/145 match (min price) | VERIFIED |
| Schema price = feed price | Stage 5 found page = feed for sampled items | HISTORICAL (Stage 5) |
| brand "Eagle Bed" | ✔ all | VERIFIED |
| sku | 109 ✔ / **36 missing** (blank variant SKUs: headboards, Royal/Kensington/Imperial Chesterfield, Valentina, Monarch, Grand Extra-High …) | VERIFIED (T12) |
| gtin / mpn | none. Acceptable for handmade goods; Google uses brand + sku | VERIFIED |
| shippingDetails (OfferShippingDetails) | ✔ **present**: £0 to GB ENG/SCT/WLS, £90 NIR, handling 1–2 + transit 2–3 business days | VERIFIED |
| hasMerchantReturnPolicy | ✔ **present**: 14 days, FreeReturn, applicableCountry GB, link to the refund policy. Missing `returnPolicyCountry` (reported as required by Google since 2025, secondary source) and `returnMethod` | VERIFIED (T13) |
| priceValidUntil | not set (optional) | VERIFIED |
| ProductGroup / hasVariant / variesBy | not used. Variants are separate Offers in one Product; valid, but no variant-level rich results | VERIFIED |
| aggregateRating / review | **2 products only**, Judge.me real data: Side Lift Ottoman Storage Base 5.0 (1 review) and Cambridge Storage Panel Bed 5.0 (1 review). No invented ratings. (The store has 3 Judge.me reviews in total, per the brief; the third is a store review, not marked up) | VERIFIED |
| Duplicate Product nodes | 135 PDPs have 2–3 Product nodes sharing one @id; the Easify node has an empty name; the Judge.me node uses a relative @id | VERIFIED (T11); effect in GSC UNKNOWN |

**The ottoman price problem in schema (T02, P1).** On the 9 ottoman-named products (e.g. Line Bumper Ottoman Divan Bed: Single £324.99), the Offer price is the bed on a **slatted base**. It is the same price the page headline and the feed show. The markup is technically "correct" because it matches the page. The commercial problem is the Stage 5 one: an "Ottoman … Gas Lift Storage Bed" title and an open-ottoman photo are shown with a price that does not include the ottoman. **Do not fix this in schema alone.** Follow the Stage 5 owner decision (ottoman default or title change), and the schema will follow the variant price. BLOCKED.

### 4.3 Organization, store and local markup

| Item | Found | Issue | Proposal |
|---|---|---|---|
| Organization name | "Eagle Bed" + alternateName "EagleBed", "Eagle Bed Dewsbury" | No `legalName` (ABBAS TRADE LTD), no `identifier` (company 16410472), no `vatID`; email is gmail | Add legalName and Companies House identifier. Add vatID only if the owner wants it public (T04) |
| sameAs | Facebook, Instagram, TikTok | No Pinterest or YouTube | Add the Pinterest profile and the YouTube channel once known |
| **FurnitureStore on every page** | address WF13 1PA, openingHours Mon–Fri 09–18, priceRange ££, areaServed UK | **Implies a walk-in shop. BRIEF: no showroom/shop for walk-in customers** | Replace with `OnlineStore` (an Organization subtype) or keep only Organization. Move hours to `ContactPoint.hoursAvailable` (phone hours) (T03, P2) |
| WebSite + SearchAction | present | Google retired the sitelinks search box (reported Nov 2024). Harmless | Keep or drop; no effect |

### 4.4 Articles and FAQ

- **Article (26 of 26).** `datePublished` is 2026-06-09 (the import date) but `dateModified` is 2025-01-01 … 2025-01-26, i.e. **before** publication. There is no `image`. The author is Organization "Eagle Bed" (fine). There is no BreadcrumbList on articles or pages. Proposal: in the theme copy, use `article.published_at`, `article.updated_at` and `article.image`, and add breadcrumbs (T09).
- **FAQPage.** Google limited FAQ rich results to well-known government and health sites on 8 Aug 2023 (Search Central blog). Secondary sources report that Google stopped showing FAQ rich results for all sites on **7 May 2026**, removing the Search Console reports in June 2026 and API support in August 2026. That date is not verified on developers.google.com, which is blocked here. The markup is **harmless but earns no rich result**. Keep the visible Q&A, which AI answers can quote, and add no more FAQPage work (T10).

### 4.5 Price consistency: schema vs page vs feed

| Product | Schema Offer (min) | Page og:price | Shopify min | Feed (Stage 5) |
|---|---|---|---|---|
| Line Bumper Ottoman Divan Bed | £324.99 | £324.99 | £324.99 | slatted-base size price (HISTORICAL S5) |
| Cloud Teddy Bouclé Ottoman Bed | £376.99 | £376.99 | £376.99 | same |
| Ottoman Gas Lift Divan Base | £220.99 | £220.99 | £220.99 | same |
| All 145 products | schema min = og:price on 145/145 | | | |

---

## 5. SEO drift baseline (for the Drift Watch)

Baseline captured 19 Nov 2026 from live HTML (VERIFIED). Re-check after any theme or app change:

| Element | Baseline |
|---|---|
| Live theme | 213270004043 "Eagle Bed CRO fixes 19 Nov - PUBLISH" |
| Sitemap counts | products 145, pages 21, collections 26, blogs 5, articles 26 |
| Status / canonical | 224 × 200, 224 self-canonical |
| noindex pages | 2 (frontpage, new-trending) |
| JSON-LD | Product 145, BreadcrumbList 171, FAQPage 161, Article 26, Organization+WebSite home, FurnitureStore 224, VideoObject 1, AggregateRating 2 |
| Shipping/returns markup | 145 / 145 |
| Robots meta | `max-image-preview:large` 224 / 224 |
| Lab PDP | HTML ~1.05 MB, TBT ~2 s, CLS ≤ 0.003 |

Raw data from this run, temporary: `/tmp/claude-0/-home-user-eagle-bed/4a1dd6da-a4cd-59ea-9c5c-1f83cbb62db3/scratchpad/s6tech/` (crawl.json, schema.json, status.json, redir.json, collpages.json, lab.json, lab_pdp.json).

---

## 6. Google requirements used (sources and dates)

- FAQ rich results were limited to authoritative government and health sites: Google Search Central blog, ["Changes to HowTo and FAQ rich results"](https://developers.google.com/search/blog/2023/08/howto-faq-changes), 8 Aug 2023.
- FAQ rich results were ended for all sites on 7 May 2026, according to secondary reports: [ppc.land](https://ppc.land/google-kills-faq-rich-results-what-seos-saw-coming-since-2019/) and [Search Engine Land, "The rise and fall of FAQ schema"](https://searchengineland.com/faq-schema-rise-fall-seo-today-463993). Not confirmed on developers.google.com, which is blocked in this sandbox.
- Return policy markup can sit under Organization (store-wide) or under Offer (product-specific): [Google, MerchantReturnPolicy structured data](https://developers.google.com/search/docs/appearance/structured-data/return-policy). `returnPolicyCountry` was added as required in March 2025, according to [ppc.land](https://ppc.land/google-expands-shipping-policy-options-for-online-merchants/) (secondary source). Shipping and return policies can also be set in Search Console: [Search Engine Land](https://searchengineland.com/google-shipping-and-returns-policies-in-search-console-or-using-new-markup-464560).
- Merchant listing fields (name, image, offers with price and currency; recommended: brand, sku/gtin, shippingDetails, hasMerchantReturnPolicy): [Google, Merchant listing structured data](https://developers.google.com/search/docs/appearance/structured-data/merchant-listing). Read through search summaries only; page text not fetched.

---

## Limitations

- **Field CWV: UNKNOWN.** The PSI API returned 429. Lab numbers come from one run per page from a data-centre network, with several third-party hosts blocked, so the real pages are heavier.
- **GSC index coverage, Product snippet / Merchant listing reports and Core Web Vitals report: UNKNOWN.** The owner exports listed in 2.7 are needed.
- **The bare domain `eaglebed.co.uk` could not be tested** because the sandbox proxy blocks it. Real AI-crawler access is also UNKNOWN: spoofed bot UAs are challenged by Cloudflare from this IP.
- **Internal links come from the static HTML.** Links injected by JavaScript (e.g. recommendations, app widgets) are not counted, so orphan counts are an upper bound.
- **Google documentation pages could not be opened directly** (developers.google.com is blocked). Requirements were taken from search summaries and secondary coverage; dates are cited above.
- **The Simprosys custom-pixel content was not inspected**; only its size (7 KB) is known. I did not compare the feed directly; I relied on Stage 5 (HISTORICAL).
- **The shared scratchpad is used by parallel specialists.** My crawl summary file was overwritten once, so I re-parsed from my saved HTML and re-checked status codes. Results are unaffected.
- **Nothing was changed on any live system.** All fixes are proposals needing owner approval. The published CRO theme was not touched.

## Credits used

| Call | Credits |
|---|---|
| OpenRush describe_capabilities | 0 |
| OpenRush audit_site | **not called**. My own full crawl of all 224 URLs, 70 collection pages and 44 test URLs covered everything audit_site samples (max 20 pages), so it would add no value |
| GSC page data | reused today's Stage 6 pull (0 new credits) |
| **Total OpenRush credits this task** | **0 of 9 budget** (month stays 116/2,001 from this task) |

Other tools used: Shopify Admin GraphQL (read-only, 4 queries), WebSearch (4 searches), PageSpeed API (1 call, 429), Playwright (6 page loads), about 400 site requests at ≤1 request per second.
