# Stage 2 / Report 01: Shopify site tracking, events, journey model and product attribution

Prepared 19 Nov 2026 by Tracking & Measurement + Theme Engineer + Analytics (Project Rocket Sales, Stage 2 parts 1, 2, 8, 9).
Read-only. Nothing was changed in Shopify, the theme, Google, Meta or any app. No customer personal data used.

Labels: **VERIFIED** (pulled today, source named) / **HISTORICAL** (Stage 1 or file) / **ESTIMATE** (maths shown) / **UNKNOWN** (reason given).

Companion data file: `ops/rocket/stage2/product-intel.json` (141 rows, see Part D).

---

## 0. The short version

1. **One clean Google route, no duplicate GA4.** Google Analytics 4 (`G-C7EZSL4WPV`), Google Ads (`AW-18232390122`) and two Merchant Center destinations get every event through the **Google & YouTube app pixel only**. The theme has **no hard-coded gtag, GTM, fbq or UTM code**. VERIFIED (live HTML, 4 pages × 2 devices).
2. **Five ad/marketing platforms receive events**: Google (GA4 + Ads + Merchant Center), Meta pixel `504564665962911` (browser + server), TikTok `D8T756BC77U4IS6DJ1H0`, Pinterest `2613451611314`, Omnisend. Plus Judge.me and Shopify's own analytics. VERIFIED.
3. **One dead tag.** The Simprosys Google Shopping Feed app runs a web pixel that loads `gtag/js?id=` with an **empty ID** and sends Google events to an empty `send_to`. It counts nothing, so no double counting, but it is wasted script on every page and checkout. VERIFIED.
4. **Meta is still receiving Purchase events from both browser and server (CAPI)** although all Meta ads are paused since 8 Sep. VERIFIED (Meta Events dataset stats).
5. **No GTM container exists.** VERIFIED.
6. **UK human sessions, the Stage 1 gap, is now closed:** 1,373 of 1,504 human sessions (91.3%) in the last 30 days were UK. UK human conversion 0.87%. VERIFIED.
7. **All 12 standard Shopify customer events are available and collected** by at least one pixel. "Product option selected" (Easify) has **no event at all**. VERIFIED.
8. **Product-level funnel data stops at the landing page.** ShopifyQL has no per-product views, carts or checkouts; product attribution is landing-page only. VERIFIED (ShopifyQL schema docs + queries).

---

## Part A. Tracking architecture (VERIFIED)

### A.1 Method

- `curl` of the live HTML on 19 Nov 2026, desktop Chrome UA and iPhone Safari UA: `/`, `/collections/ottoman-beds`, `/products/side-lift-ottoman-gas-lift-storage-bed`, `/cart`. All returned 200. Desktop and mobile HTML carry the **identical tag set**.
- Parsed the `webPixelsConfigList` that Shopify's web-pixels-manager prints in every page.
- Fetched the Simprosys custom pixel script (`storage.googleapis.com/gsf-scripts/custom-pixels/0whctf-mu.js`).
- Shopify Admin GraphQL (read-only): themes, publications, app installations.
- Meta Events dataset stats (read-only) for pixel `504564665962911`.
- **Theme grep:** `theme_bash` on the live theme was **refused** ("connector requires additional permissions"). Fallback: (a) the rendered HTML of 4 page types, which contains everything `theme.liquid` and its snippets output, and (b) the local copy of the 10 Nov theme (`ops/theme-seo-2026-11-10/new/`, the theme now live as "Eagle Bed SEO fixes 10 Nov - PUBLISH", ID 212418724171) and `theme/`. Both show only `{{ content_for_header }}`. HISTORICAL for the file grep, VERIFIED for the rendered output.

### A.2 Tags and IDs found

| Platform | ID(s) | How it loads | Pages | Consent purposes declared | Label |
|---|---|---|---|---|---|
| Google tag (GA4) | `G-C7EZSL4WPV` | Google & YouTube app web pixel 4990763339 (OPEN sandbox) | all | none declared (app handles consent itself) | VERIFIED |
| Google Ads | `AW-18232390122` with 7 action labels | same pixel | all | same | VERIFIED |
| Google tag containers | `GT-W6N7JF9K`, `GT-WBL7CRG7` | same pixel (`google_tag_ids`) | all | same | VERIFIED |
| Merchant Center | `MC-287909H1CX`, `MC-SCY4EGMZHS` | same pixel | all | same | VERIFIED |
| Simprosys (Google feed app) | account 1089122, Merchant ID 5756953290; **GA4 ID empty, Ads conversion ID empty**, GTM off, consent mode off, Enhanced Conversions off | app web pixel 4480565579 (LAX) + external script | all | none | VERIFIED |
| Meta pixel | `504564665962911` | Facebook & Instagram app pixel 5474124107, "share all events", data sharing "optimized" | all | analytics, marketing, sale of data | VERIFIED |
| TikTok pixel | `D8T756BC77U4IS6DJ1H0` | TikTok channel pixel 5065113931 | all | analytics, marketing, sale of data | VERIFIED |
| Pinterest tag | `2613451611314` | Pinterest channel pixel 5065703755 | all | analytics, marketing, sale of data | VERIFIED |
| Omnisend | brand `6a79d2f68fe54a69c5a4a820` | app pixel 5389353291 + theme app embed `omnisend-in-shop.js` | all | analytics, marketing, sale of data | VERIFIED |
| Judge.me | – | app pixel 4124541259 + app embed loader | all | analytics | VERIFIED |
| Shopify analytics | trekkie / monorail, `shopify-app-pixel`, `shopify-custom-pixel` | built in | all | analytics, marketing | VERIFIED (present). Whether a merchant **custom pixel** with code exists is UNKNOWN (no `read_pixels` scope) |
| Easify Product Options | – | app embed JS | product, cart | – (no tracking events) | VERIFIED |
| Dondy WhatsApp chat | – | app embed JS | all | – | VERIFIED |
| Microsoft UET / Bing | **none** | – | – | – | VERIFIED absent |
| Klaviyo | **none** | – | – | – | VERIFIED absent |
| GTM (`GTM-…`) | **none** | – | – | – | VERIFIED absent |
| Hard-coded gtag / fbq / ttq / pintrk in theme | **none** | – | – | – | VERIFIED (rendered HTML) |
| Consent banner | Shopify **privacy-banner.js** is loaded on every page | Shopify Customer Privacy | all | – | VERIFIED (script present). Banner settings (enabled for UK? auto-managed?) UNKNOWN: `read_privacy_settings` scope missing |
| "CMP Insert Code" (Complianz) app | installed, **no code on the storefront** | – | – | – | VERIFIED |

UTM in theme: only Judge.me review links carry `utm_source=judgeme`. No other UTM code. VERIFIED.

### A.3 Google & YouTube event map (what Google actually receives)

| Google event | GA4 | Google Ads action label | Merchant Center |
|---|---|---|---|
| page_view | yes | `w3OfCMK2utYcEOrj8PVD` | both MC IDs |
| view_item | yes | `svcrCMW2utYcEOrj8PVD` | both |
| view_item_list | yes | – | – |
| search | yes | `HDRpCMi2utYcEOrj8PVD` | MC-SCY4… |
| add_to_cart | yes | `p0VXCL-2utYcEOrj8PVD` | MC-SCY4… |
| remove_from_cart | yes | – | – |
| view_cart | yes | – | – |
| begin_checkout | yes | `wW4hCLy2utYcEOrj8PVD` | MC-SCY4… |
| add_shipping_info | yes | – | – |
| add_payment_info | yes | `R5tECMu2utYcEOrj8PVD` | MC-SCY4… |
| purchase | yes | `p-GGCLm2utYcEOrj8PVD` | both |

So the Google Ads account has **7 conversion actions** from this one tag. Only **purchase** should be Primary. Stage 1 matched all 6.96 Ads conversions to real orders, so the other six are probably Secondary already. ESTIMATE. The £1.05-value action seen in Stage 1 may be one of these six. UNKNOWN which (needs owner view of Ads → Goals → Conversions).

### A.4 Meta pixel delivery (last 28 days, VERIFIED Meta Events)

23 Oct to 18 Nov: 7,147 PageView, 3,281 ViewContent, 458 AddToCart, 167 InitiateCheckout, 21 Purchase events. Purchase arrives from **both BROWSER and SERVER** (CAPI). Shopify had 16 orders in the same days. Purchase events appear on 12 of the 14 order days. Whether Meta deduplicates each browser/server pair is **UNKNOWN** (needs Events Manager "Deduplicated" view). Meta ads are paused, so this data only builds audiences.

### A.5 Duplicates and conflicts

| Check | Result | Label |
|---|---|---|
| Same GA4 ID loaded twice | **No.** `G-C7EZSL4WPV` only through Google & YouTube | VERIFIED |
| gtag in theme **and** via app | **No** gtag in theme | VERIFIED |
| Two senders of Google Ads purchase | **No.** Simprosys has Google Ads "enabled" but **no conversion ID or label**, so it sends nothing usable | VERIFIED |
| Simprosys loads gtag with empty ID | **Yes, dead tag.** `gtag/js?id=` and `gtag('config','')` on every page | VERIFIED |
| Two Merchant Center IDs | `MC-287909H1CX` and `MC-SCY4EGMZHS` both receive events; Simprosys feeds Merchant **5756953290**. Whether these are one or two MC accounts is UNKNOWN | VERIFIED / UNKNOWN |
| Two Google tag containers | `GT-W6N7JF9K` and `GT-WBL7CRG7`. Normal for Google & YouTube (one per linked product). Not a double count | VERIFIED / ESTIMATE |
| Meta browser + server | both send Purchase; dedup status UNKNOWN | VERIFIED / UNKNOWN |
| GA4 currency | USD while store is GBP (Stage 1) | HISTORICAL |

### A.6 Sales channels (publications, VERIFIED)

Online Store, Shop, Point of Sale, Facebook & Instagram, Google & YouTube, Inbox, TikTok, Pinterest, Temu. Also installed: Agentic (Shopify), Marketplace Connect, Shopify ChatGPT and Claude connector apps, Forms, Messaging, WhatsApp by Meta, Dondy WhatsApp, TinySEO, Easify, Judge.me, Omnisend, Simprosys, CMP Insert Code, "color agent".

### A.7 Architecture diagram

```
                         www.eaglebed.co.uk (theme 212418724171, no hard-coded tags)
                                          |
                 Shopify Customer Privacy (privacy-banner.js)  -- settings UNKNOWN
                                          |
                     Shopify web-pixels-manager (standard customer events)
   +-----------------+---------------+-------------+-------------+-------------+-----------+
   |                 |               |             |             |             |           |
Google & YouTube   Meta F&I       TikTok       Pinterest     Omnisend      Judge.me    Simprosys
 app pixel          app pixel      pixel        tag           pixel         pixel       pixel (LAX)
   |                 |               |             |             |             |           |
   |-> GA4 G-C7EZSL4WPV   all std events     all std events  email/SMS   review       gtag id='' 
   |   (11 events)   (browser +       (ads not         (no ads     flows &      requests     -> sends to
   |-> Google Ads    server CAPI)     verified)        verified)   tracking                  NOWHERE
   |   AW-18232390122  pixel 504564665962911                                                  (dead tag)
   |   7 actions (purchase = real)  -> Meta ads PAUSED since 8 Sep
   |-> Merchant Center MC-287909H1CX, MC-SCY4EGMZHS
   +-> server-side purchase import (Google Data Manager, per Shopify docs; not visible from here: UNKNOWN)

Shopify Analytics (trekkie/monorail) -> ShopifyQL sessions/sales (source of truth for orders)
Easify options -> cart line properties only (no event)
```

---

## Part B. Shopify metrics and events

### B.1 Money and order metrics (definitions, sources, limits)

Numbers are the Stage 1 baseline (20 Oct–19 Nov), re-checked today: orders 16, gross £7,472.64, discounts −£615.07, net £6,857.57, total £6,947.57, AOV £428.60. VERIFIED (ShopifyQL `FROM sales`, identical today).

| Metric | Source | Definition (Shopify) | Limitation |
|---|---|---|---|
| Orders | `FROM sales SHOW orders` | Orders placed in the window, any channel | Includes orders later cancelled (#1020 is in previous-30). Counted on order date |
| Paid | Admin GraphQL `displayFinancialStatus` (Stage 1) | Financial status PAID | Not in ShopifyQL sales; #1020 shows PAID though refunds failed |
| Cancelled | Admin GraphQL `cancelledAt` (Stage 1) | Order cancelled | Cancelled value shows as "returns" (sales_reversals) on the cancel date |
| Refunded | `sales_reversals` (sales) / `refunded_payments` (payments) | Value reversed on the refund/cancel date | Refunds land in the window they happen, not the order's window |
| Gross sales | `gross_sales` | Product price × quantity before discounts, excl. shipping and tax | Add-on "Selections" lines from the options app count here without a product |
| Discounts | `discounts` | Line and order discounts | EAGLE10 is 81% of orders (Stage 1) |
| Net sales | `net_sales` | Gross − discounts − returns | Excludes shipping and tax |
| Shipping | `shipping_charges` | Shipping charged | £90 (one NI order) |
| Taxes | `taxes` | Tax charged | £0 on all web orders; VAT status UNKNOWN |
| Total sales | `total_sales` | Net + shipping + taxes (+ duties) | – |
| AOV | `average_order_value` | (Gross − discounts) / orders | Small base: 1 order moves it ±£25 |
| Conversion rate | `FROM sessions conversion_rate` | Sessions that completed checkout / sessions | 4 of 16 orders have no session (consent/blocked), so CR undercounts. Orders per human session = 16/1,504 = 1.06% |
| Returning rate | `returning_customer_rate` / `new_or_returning_customer` | Orders by customers with an earlier order | Guest checkouts with new email look "new" |

New vs returning (VERIFIED today): last 30 days 15 new orders (£6,351.59 net) and 1 returning (£505.98). Previous 30: 8 new, 0 returning.

### B.2 Journey events in ShopifyQL (VERIFIED)

| ShopifyQL field (FROM sessions) | Available | Note |
|---|---|---|
| sessions, online_store_visitors | yes | |
| sessions_with_cart_additions | yes | Session-level, not per product |
| sessions_that_reached_checkout | yes | Bots inflate it (106 bot checkouts in L30) |
| sessions_that_completed_checkout | yes | |
| human_or_bot_session | yes | Bot filter works |
| landing_page_type / landing_page_path | yes | First page only |
| pageviews, bounces, collections_viewed, products_added_to_cart, products_in_started_checkouts | yes (metrics) | Counts, not per product |
| agentic_referring_channel (ChatGPT, Gemini, Copilot, Shop) | yes (dimension) | Not used yet; useful for AI traffic |
| Product views by product | **NOT AVAILABLE** | No sessions/products schema with per-product views in ShopifyQL 2026-10 (Sessions & behaviour schemas: sessions, searches, search conversions, recommendations) |
| Cart additions / checkouts by product | **NOT AVAILABLE** | Only `FROM sales` per product (orders) |

### B.3 Standard Shopify customer events available to pixels

"Collected" means at least one installed pixel subscribes to it. Evidence: Google & YouTube event map (A.3), Meta "share_all_events", Simprosys `analytics.subscribe('all_standard_events')`, Meta Events stats (A.4).

| Event | Status | Who collects it (evidence) |
|---|---|---|
| page_viewed | AVAILABLE-AND-COLLECTED | GA4/Ads/MC page_view; Meta PageView (7,000/28d) |
| product_viewed | AVAILABLE-AND-COLLECTED | GA4/Ads/MC view_item; Meta ViewContent |
| collection_viewed | AVAILABLE-AND-COLLECTED | GA4 view_item_list; Meta (all events) |
| search_submitted | AVAILABLE-AND-COLLECTED | GA4/Ads search; Meta Search |
| product_added_to_cart | AVAILABLE-AND-COLLECTED | GA4/Ads add_to_cart; Meta AddToCart |
| product_removed_from_cart | AVAILABLE-AND-COLLECTED | GA4 remove_from_cart |
| cart_viewed | AVAILABLE-AND-COLLECTED | GA4 view_cart |
| checkout_started | AVAILABLE-AND-COLLECTED | GA4/Ads begin_checkout; Meta InitiateCheckout |
| checkout_contact_info_submitted | AVAILABLE-AND-COLLECTED (weakly) | Not in Google map; Meta/TikTok/Pinterest/Simprosys subscribe to all events. No report uses it |
| checkout_address_info_submitted | AVAILABLE-AND-COLLECTED (weakly) | as above |
| checkout_shipping_info_submitted | AVAILABLE-AND-COLLECTED | GA4 add_shipping_info |
| payment_info_submitted | AVAILABLE-AND-COLLECTED | GA4/Ads add_payment_info; Meta AddPaymentInfo |
| checkout_completed | AVAILABLE-AND-COLLECTED | GA4/Ads/MC purchase; Meta Purchase (browser + server) |
| Product option selected (Easify: size, fabric, colour, delivery/assembly add-on) | **NOT AVAILABLE** | Easify emits no standard event; the theme publishes no custom event (no `Shopify.analytics.publish` in theme). Options reach analytics only as cart line properties at add-to-cart |

---

## Part C. Journey model (part 8), human sessions

Windows: last 30 = 20 Oct–19 Nov 2026 (includes part of today), previous 30 = 19 Sep–19 Oct. Same windows as Stage 1. VERIFIED (ShopifyQL `FROM sessions WHERE human_or_bot_session='human'`).
Columns: sessions → cart (% of sessions) → reached checkout (% of sessions) → completed (% of sessions) | cart→checkout | checkout→completed.

Note: human sessions are 1,504 today vs 1,489 in Stage 1 because today's part day has grown.

### C.1 Overall, UK and bots

| Segment | Sessions | Cart | Checkout | Completed | Cart→Chk | Chk→Done |
|---|---|---|---|---|---|---|
| All human L30 | 1,504 | 181 (12.0%) | 57 (3.8%) | 12 (0.8%) | 31.5% | 21.1% |
| All human P30 | 2,431 | 100 (4.1%) | 27 (1.1%) | 4 (0.2%) | 27.0% | 14.8% |
| **UK human L30** | **1,373** | 166 (12.1%) | 45 (3.3%) | 12 (0.9%) | 27.1% | 26.7% |
| UK human P30 | 2,275 | 98 (4.3%) | 26 (1.1%) | 4 (0.2%) | 26.5% | 15.4% |
| Bots L30 (excluded) | 519 | 15 | 106 | 0 | – | – |
| Bots P30 (excluded) | 410 | 7 | 7 | 0 | – | – |

- Bots: 519 of 2,023 sessions (25.7%) last 30 days, and 106 "checkouts" with 0 orders. Always filter them. VERIFIED.
- Non-UK human sessions: 131 (8.7%) last 30. Stage 1's "about 30% non-UK" was for all sessions including bots. VERIFIED.
- All 12 completed checkouts were UK.

### C.2 By device

| Device | Sessions | Cart | Checkout | Completed | Cart→Chk | Chk→Done |
|---|---|---|---|---|---|---|
| Mobile L30 | 1,213 | 139 (11.5%) | 36 (3.0%) | 11 (0.9%) | 25.9% | 30.6% |
| Mobile P30 | 2,005 | 87 (4.3%) | 22 (1.1%) | 4 (0.2%) | 25.3% | 18.2% |
| Desktop L30 | 271 | 38 (14.0%) | 21 (7.7%) | 1 (0.4%) | 55.3% | 4.8% |
| Desktop P30 | 383 | 13 (3.4%) | 5 (1.3%) | 0 | 38.5% | 0% |
| Tablet L30 | 20 | 4 | 0 | 0 | – | – |
| Tablet P30 | 42 | 0 | 0 | 0 | – | – |

Desktop reaches checkout often but finishes 1 in 21. Some of those 21 may be human-labelled checkout probes (Stage 1 §5.5). ESTIMATE.

### C.3 By referrer source (Shopify `referrer_source`, all 6 sources)

| Source | Sessions | Cart | Checkout | Completed | Cart→Chk | Chk→Done |
|---|---|---|---|---|---|---|
| search L30 | 787 | 99 (12.6%) | 17 (2.2%) | 5 (0.6%) | 17.2% | 29.4% |
| search P30 | 1,364 | 69 (5.1%) | 16 (1.2%) | 2 (0.1%) | 23.2% | 12.5% |
| direct L30 | 687 | 80 (11.6%) | 40 (5.8%) | 7 (1.0%) | 50.0% | 17.5% |
| direct P30 | 928 | 27 (2.9%) | 9 (1.0%) | 2 (0.2%) | 33.3% | 22.2% |
| unknown L30 | 15 | 0 | 0 | 0 | – | – |
| unknown P30 | 121 | 4 | 2 | 0 | – | – |
| social L30 | 7 | 1 | 0 | 0 | – | – |
| social P30 | 15 | 0 | 0 | 0 | – | – |
| email L30 | 6 | 1 | 0 | 0 | – | – |
| email P30 | 1 | 0 | 0 | 0 | – | – |
| paid L30 | 2 | 0 | 0 | 0 | – | – |
| paid P30 | 2 | 0 | 0 | 0 | – | – |

Shopify files Google Ads under "search" and ChatGPT mostly under "direct". The UTM view separates them:

| UTM source / medium | Sessions | Cart | Checkout | Completed | Cart→Chk | Chk→Done |
|---|---|---|---|---|---|---|
| google / cpc L30 | 861 | 93 (10.8%) | 15 (1.7%) | 6 (0.7%) | 16.1% | 40.0% |
| google / cpc P30 | 577 | 35 (6.1%) | 5 (0.9%) | 0 | 14.3% | 0% |
| (no UTM) L30 | 431 | 61 (14.2%) | 38 (8.8%) | 5 (1.2%) | 62.3% | 13.2% |
| (no UTM) P30 | 636 | 30 (4.7%) | 13 (2.0%) | 2 (0.3%) | 43.3% | 15.4% |
| chatgpt.com L30 | 185 | 23 (12.4%) | 2 (1.1%) | 1 (0.5%) | 8.7% | 50.0% |
| chatgpt.com P30 | 65 | 6 (9.2%) | 1 (1.5%) | 0 | – | – |
| google / product_sync L30 | 22 | 2 | 0 | 0 | – | – |
| google / product_sync P30 | 1,148 | 29 (2.5%) | 8 (0.7%) | 2 (0.2%) | 27.6% | 25.0% |
| klarna / referral L30 | 2 | 2 | 2 | 0 | – | – |

- `referrer_name = chatgpt` shows only 2 sessions while `utm_source = chatgpt.com` shows 185. ChatGPT strips the referrer, so **track it by UTM or by `agentic_referring_channel`**. VERIFIED.
- Google Ads: cart rate is fine (10.8%) but only 16% of carts reach checkout. That is the weakest step for paid traffic. VERIFIED.

### C.4 By landing page type

| Landing type | Sessions | Cart | Checkout | Completed | Cart→Chk | Chk→Done |
|---|---|---|---|---|---|---|
| Product L30 | 1,007 | 123 (12.2%) | 30 (3.0%) | 7 (0.7%) | 24.4% | 23.3% |
| Product P30 | 1,708 | 76 (4.4%) | 19 (1.1%) | 3 (0.2%) | 25.0% | 15.8% |
| Home L30 | 254 | 26 (10.2%) | 7 (2.8%) | 3 (1.2%) | 26.9% | 42.9% |
| Home P30 | 530 | 14 (2.6%) | 5 (0.9%) | 0 | 35.7% | 0% |
| Collection L30 | 116 | 10 (8.6%) | 0 | 0 | 0% | – |
| Collection P30 | 137 | 4 (2.9%) | 1 (0.7%) | 0 | – | – |
| Blog (article + index) L30 | 23 | 0 | 0 | 0 | – | – |
| Blog P30 | 13 | 0 | 0 | 0 | – | – |
| Other L30 (cart 54, custom page 34, checkout 13, search 1, blank 2) | 104 | 22 (21.2%) | 20 (19.2%) | 2 (1.9%) | – | – |
| Other P30 | 43 | 6 | 2 | 1 | – | – |

- **Collection landings: 116 sessions, 10 carts, 0 checkouts** in 30 days. Weakest entry page. VERIFIED.
- **Blog: 0 carts** in both windows. VERIFIED.
- "Checkout" and "cart" landings are people returning by a saved or emailed link. That is why checkout can exceed cart in some rows (the cart was built in an earlier session).

### C.5 New vs returning (orders, `FROM sales`)

| | L30 orders | L30 net | P30 orders | P30 net |
|---|---|---|---|---|
| New | 15 | £6,351.59 | 8 | £2,514.10 |
| Returning | 1 | £505.98 | 0 | £0 |

Visitor-level new/returning sessions were not used: no such sessions dimension in the docs read. UNKNOWN.

### C.6 Reconciliation

- Sessions completed checkout (12) vs orders (16): 4 orders have no session (consent declined or blocked). HISTORICAL (Stage 1) / VERIFIED (counts).
- Sum of device rows = sum of source rows = 1,504 sessions and 12 completions. VERIFIED.
- Funnel steps are not strictly nested (a session can reach checkout without a cart add in that session). No step was invented.

---

## Part D. Product attribution (part 9)

File: `/home/user/eagle-bed/ops/rocket/stage2/product-intel.json`. VERIFIED (19 Nov 2026).

- Window 22 Aug–19 Nov 2026 (90 days, same as Stage 1).
- 141 rows: 140 product landing pages with at least 1 human landing session, plus 1 "Selections" add-on row. All 20 products that sold are included.
- Cross-check: totals reconcile with Stage 1 (gross £15,158.33, net £13,563.37, 4,608 product landing sessions). VERIFIED.
- Fields: product_id, handle, title, status, landing_sessions, landing_sessions_with_cart_additions, landing_sessions_reached_checkout, landing_sessions_completed_checkout, `sessions_with_cart_additions: null`, `checkouts: null` (not attributable per product), orders, units, net_units, gross, discounts, net, refunds (sales_reversals), `ad_cost: null`, `contribution: null`, landing_cart_rate, classification, data_quality.
- One handle (`mayfair-ottoman-divan-bed-copy`, 2 sessions) no longer exists; product_id null.

**Classification rules** (a product can carry several): attracting visitors = 100+ landing sessions; buying intent = 5+ landing cart sessions and cart rate 8%+; completing orders = 1+ net unit; high abandonment = 3+ landing checkouts with under half completed, or 10+ landing carts with no landing completion and at most 1 sale; weak sales despite traffic = 100+ landing sessions and at most 1 net unit.

| Class | Products (90 days) |
|---|---|
| Attracting visitors and completing orders | Ottoman Gas Lift Divan Base (605 landings, 7 net units, £2,666.63); Side Lift Ottoman (275, 6, £1,603.38) |
| Buying intent + completing, but high abandonment | Cloud Teddy Bouclé Ottoman (124, 16 carts, 5 checkouts, 0 landing completions, 2 sold); Savoy Channel (36, 8 carts, 9 checkouts, 1 sold); Royal Chesterfield (64, 11 carts, 3 checkouts, 1 sold); Grand Extra-Tall (116, 17 carts, 1 sold) |
| Weak sales despite traffic (watch list) | Line Bumper Ottoman (441, 28 carts, 0 sold); Line Ambassador (374, 26 carts, 1 sold); Stone Premium (270, 2 carts, 0); Mini Line Wingback Kids (248, 10 carts, 0); Line Kids Velvet (205, 1 sold); Grand Princess (109, 2 carts, 0); Divan Drawer Storage Base (119, 1 sold) |
| Buying intent, no sale yet | Mini Line Wingback Bed (55 landings, 7 carts, 2 checkouts) |
| Completing orders with few landings (buyers came via other pages) | 3000 Pocket mattress, Regal Luxe, Sunrise Fan, Hilton, Cambridge Storage, Memory Orthopaedic and others |
| No signal | 112 other landing pages with little traffic and no sale |

Caution: landing cart/checkout counts are for the **whole session**, not the product. A Cloud Teddy landing session that bought a Side Lift counts as a Cloud Teddy cart. So "high abandonment" is a pointer for a walk-through, not proof. Stage 1 also showed some Savoy checkouts are the same buyer.

---

## Proposed changes (all AWAITING APPROVAL; nothing done)

| # | What changes | Why | System | Benefit | Risk | Rollback | Approval |
|---|---|---|---|---|---|---|---|
| P1 | Remove the empty Google tag from Simprosys: in Simprosys settings, leave Google Ads/GA4 tracking **off** (it has no IDs) and keep the feed only | Dead `gtag/js?id=` on every page and checkout | Simprosys app | Less JS, cleaner audits, no risk of a future half-configured second Ads sender | Low; feed unaffected | Turn the setting back on | Owner |
| P2 | In Google Ads → Goals, confirm only "Purchase" (Google & YouTube) is **Primary**; the six other G&Y actions and the £1.05 action **Secondary** | 7 actions come from one tag | Google Ads | Bidding counts only real sales | Low | Flip back | Owner (in Ads) |
| P3 | Turn on Enhanced Conversions in the Google & YouTube app | Not confirmed (Stage 1); Simprosys shows it off | Google & YouTube app | Better match of orders to clicks, more of the 4 "no session" orders credited | Low; uses hashed checkout data, needs privacy text | Toggle off | Owner |
| P4 | Check Meta Events Manager → Purchase → "Deduplicated" for browser + server pairs | Both senders active | Meta | Clean audience and future ad data | None (check) | – | Owner check |
| P5 | Grant `read_privacy_settings` and `read_pixels` scopes to the Claude connector, and the theme read permission | Banner settings, custom-pixel code and theme files could not be read | Shopify connector | Close 3 UNKNOWNs | Low (read only) | Revoke scopes | Owner |
| P6 | Confirm the Shopify cookie banner is set for UK visitors (UK GDPR/PECR) and decide whether to remove the unused CMP Insert Code app | Banner script loads; settings unknown; second CMP app has no effect | Shopify Settings → Customer privacy | Legal certainty; one CMP | Low–medium (banner on can lower tracked sessions) | Revert setting | Owner |
| P7 | Change GA4 reporting currency to GBP | GA4 in USD | GA4 admin | Revenue matches Shopify | Low; history not restated | Change back | Owner |
| P8 | Add a theme custom event for Easify option choices (e.g. `option_selected` with option name/value) via `Shopify.analytics.publish`, read by a custom pixel | No event for size/fabric/assembly choices | Theme copy + custom pixel | See which options cause drop-off | Medium (theme change; owner publishes) | Unpublish theme copy / delete pixel | Owner (theme publish) |
| P9 | Add `utm_content={product_id}` (or ad group) to PMax/Shopping final URLs | Product-level ad cost is null | Google Ads | Fill `ad_cost` in product-intel | Low | Remove suffix | Owner |
| P10 | Weekly report: UK + human funnel and `agentic_referring_channel` for AI traffic | Stage 1 gap closed with a query; ChatGPT hidden in "direct" | ShopifyQL (read) | One trusted number set | None | – | None (read only) |
| P11 | Confirm which Merchant Center account(s) `MC-287909H1CX`, `MC-SCY4EGMZHS` and Merchant 5756953290 are | Possibly two MC accounts fed | Google Merchant Center | Avoid split or duplicate feeds | None (check) | – | Owner check |

---

## Limitations

- `theme_bash` was refused (connector permission). The theme check relies on the rendered HTML of 4 page types and the local copy of the 10 Nov theme. A snippet that renders only on other templates (e.g. blog, search, account pages) was not seen.
- Checkout and thank-you pages cannot be fetched without buying. Their tags are inferred from the pixel config (web pixels run there by design). No test order was placed, so no conversion was proven to arrive end to end (skill rule: "verify a test conversion arrives" is **not met**).
- Consent banner settings, custom-pixel code and Shopify Payments data are UNKNOWN (missing scopes).
- Meta browser/server dedup, Google Ads Primary/Secondary status and Enhanced Conversions status are UNKNOWN without the owner's screens.
- ShopifyQL product data is landing-page only. Per-product views, carts and checkouts do not exist in ShopifyQL.
- The last-30 window includes part of 19 Nov (open window), same as Stage 1, so it can be compared with Stage 1. Small numbers: one order moves any rate.
- Profit and contribution are UNKNOWN (no costs).

## Credits used

- OpenRush: **0** (budget 0). No OpenRush calls.
- Other read-only calls: Shopify ShopifyQL 10 queries, Admin GraphQL 8 queries (2 refused for scopes), Meta Events stats 2, Shopify docs search 3, curl 8 page fetches + 5 script fetches.
