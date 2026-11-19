# EAGLE BED — PROJECT ROCKET SALES / STAGE 2: TRACKING & DATA INTELLIGENCE

Prepared 19 Nov 2026 by the Manager's report writer.
Sources: the four Stage 2 specialist reports in this folder (01 to 04), `data-model.json`, `dq-checks.json`, `product-intel.json`, the Stage 1 report, and today's first live run of the data quality monitor (section 10).

Stage 2 was read-only for the specialists. The only live changes are the Manager's own changes listed in section 12. Everything in section 13 is waiting for approval.

Labels used on every finding:
- **VERIFIED**: pulled or measured on 19 Nov 2026 (source named).
- **HISTORICAL**: from Stage 1, a Stage 2 report, or a file (date named).
- **ESTIMATE**: worked out; the maths is shown.
- **UNKNOWN**: not available; the reason is given.

Privacy: no customer names, emails, phones or addresses. Order numbers only.
Profit is **UNKNOWN** everywhere: no product, delivery or labour costs exist in any system yet.

---

## Summary in ten lines

1. **One clean Google route.** GA4 `G-C7EZSL4WPV`, Google Ads `AW-18232390122` and Merchant Center all get their events from the Shopify Google & YouTube app. No GTM, no hard-coded tags, no duplicate GA4. VERIFIED (live HTML, report 01).
2. **Google Ads counts real sales.** 6.96 conversions worth £2,591.62 are exactly 7 real Shopify orders (£2,600.52). Each sale counts once. VERIFIED (report 02).
3. **GA4 revenue is wrong currency.** GA4 reports in USD; the store sells in GBP. GA4 purchases could not be read at all (tools blocked). HISTORICAL 19 Nov / UNKNOWN.
4. **Meta tracking on the site is healthy, but the Meta ad account cannot use it.** The site pixel belongs to Eagle Bed's business ("Tech ABA"). The ad account called "Eagle bed" sits in a "Legend Beds" business and has only optimised on the Legend Beds pixel. VERIFIED (report 03).
5. **Social, email and trade links were mostly untagged.** 0 sessions from HQ-tagged posts in 90 days. The Manager fixed the daily Facebook post, the trade email brief and the GBP tag today (section 12).
6. **UK human funnel (last 30 days):** 1,373 sessions → 166 cart → 45 checkout → 12 completed (0.87%). VERIFIED (report 01).
7. **4 of 16 orders (25%) have no journey at all** (cookies declined or blocked). No tool can say where they came from. VERIFIED.
8. **Product attribution stops at the landing page.** Shopify has no per-product views or carts. 141-row product file built. VERIFIED.
9. **Data quality monitor ran live for the first time today:** 19 checks, 11 PASS, 5 FAIL (1 critical, 1 high, 2 medium, 1 low), 3 UNKNOWN. Health score 71 / 100. VERIFIED (section 10).
10. **Final answer: PARTLY.** Eagle Bed HQ can identify the activities behind real orders for Google Ads PMax and for Shopify first/last visit sources. It cannot yet do so for social, email or trade, nor for profit. See the end of this report.

---

## 1. Existing tracking architecture

### 1.1 Diagram (VERIFIED, live HTML of 4 page types on desktop and mobile, 19 Nov; report 01 A.7)

```
                    www.eaglebed.co.uk  (live theme 212418724171, no hard-coded tags)
                                        |
                Shopify Customer Privacy banner (privacy-banner.js)   settings: UNKNOWN
                                        |
                  Shopify web-pixels-manager (standard customer events)
   +-------------+-------------+-----------+-----------+-----------+----------+------------+
   |             |             |           |           |           |          |            |
 Google &      Meta F&I      TikTok    Pinterest   Omnisend    Judge.me   Simprosys
 YouTube app   channel       pixel     tag         pixel       pixel      feed app pixel
   |             |             |           |           |           |          |
   |-> GA4 G-C7EZSL4WPV  (11 events, currency USD)                            gtag id = ''
   |-> Google Ads AW-18232390122 (7 action labels; purchase = real sales)     sends to
   |-> Merchant Center MC-287909H1CX + MC-SCY4EGMZHS                          NOWHERE
   |             |                                                          (dead tag)
   |             +-> Meta pixel 504564665962911 "tech aba" (browser + CAPI server)
   |                     owned by business Tech ABA (= Eagle Bed)
   |                     NOT visible to ad account 641104701697209 ("Eagle bed",
   |                     inside business "Legend Beds", pixel 890821269640047)
   |
 Shopify Analytics (trekkie / monorail)  -> ShopifyQL sessions + sales = source of truth
 Shopify order journey (customerJourneySummary: first and last visit, UTMs)
 Easify product options -> cart line properties only (no event)
 Dondy WhatsApp chat, CMP Insert Code app (no storefront code)

 Off-site link tagging (where UTMs are written):
   Google Ads final URLs       google / cpc / pmax_all_products  (+ feed's sag_organic)
   Shopify Google feed         google / product_sync / sag_organic
   Scheduled FB photo posts    tagged from 19 Nov (Manager change, section 12)
   Pinterest pins              pinterest / social / pins
   Cinema videos               facebook|youtube / social / hq_cinema_HHMM
   GBP weekly post             google-business-profile / referral (from 19 Nov)
   Trade outreach email        trade-outreach / email (from 19 Nov)
   Customer email flows, WhatsApp, bio links: untagged (awaiting approval)
```

### 1.2 What is absent (VERIFIED)

| Item | Status |
|---|---|
| Google Tag Manager container | None |
| Hard-coded gtag, fbq, ttq or pintrk in the theme | None |
| Second GA4 sender | None |
| Microsoft UET / Bing, Klaviyo | None |
| Merchant custom pixel with code | UNKNOWN (no `read_pixels` scope) |
| Theme file grep | Refused (connector lacks theme read). Rendered HTML used instead |

---

## 2. Shopify tracking audit

Source: report 01 (VERIFIED 19 Nov unless marked).

### 2.1 Money baseline (20 Oct – 19 Nov, ShopifyQL `FROM sales`, re-checked today)

| Metric | Value | Label |
|---|---|---|
| Orders | 16 | VERIFIED |
| Gross sales | £7,472.64 | VERIFIED |
| Discounts | −£615.07 (EAGLE10 on 81% of orders) | VERIFIED / HISTORICAL |
| Net sales | £6,857.57 | VERIFIED |
| Total sales | £6,947.57 (incl. £90 shipping on one NI order) | VERIFIED |
| Average order value | £428.60 | VERIFIED |
| Tax | £0 on all web orders; VAT status UNKNOWN | VERIFIED / UNKNOWN |
| New vs returning | 15 new (£6,351.59 net), 1 returning (£505.98) | VERIFIED |

### 2.2 Standard Shopify customer events

All 12 standard customer events are available and collected by at least one pixel (VERIFIED):
page viewed, product viewed, collection viewed, search submitted, product added to cart, product removed from cart, cart viewed, checkout started, contact info submitted, address info submitted, shipping info submitted, payment info submitted, checkout completed.

Missing: **"Product option selected"** (size, fabric, colour, assembly add-on in Easify). No event exists. Options only reach analytics as cart line properties after add-to-cart. VERIFIED.

### 2.3 What ShopifyQL can and cannot do

| Can | Cannot |
|---|---|
| Sessions, carts, checkouts, completions per session | Product views per product |
| Human vs bot filter (`human_or_bot_session`) | Cart additions per product |
| UTM source, medium, campaign | Checkouts per product |
| Landing page type and path | Middle-of-journey visits |
| AI referrals (`agentic_referring_channel`) | Cost or profit |

### 2.4 Problems found

| # | Problem | Impact | Label |
|---|---|---|---|
| S1 | Simprosys feed app loads `gtag/js?id=` with an **empty ID** on every page and checkout | Wasted script; latent duplicate if someone fills the ID | VERIFIED |
| S2 | Cookie banner script loads, but its settings cannot be read | UK GDPR/PECR status unproven | UNKNOWN |
| S3 | "CMP Insert Code" app installed with no code on the storefront | Confusion over which consent tool is live | VERIFIED |
| S4 | 4 of 16 orders have no session (consent or blocked) | Conversion rate undercounts; 25% of orders unattributable | VERIFIED |
| S5 | 106 bot "checkouts" in 30 days, 0 orders | Raw checkout counts are useless without the bot filter | VERIFIED |
| S6 | 4 order lines without SKU, 1 without variant (DQ06) | Product reporting gaps | VERIFIED today |

---

## 3. GA4 tracking audit

Source: report 02 (OpenRush GA4, live HTML).

| Item | Finding | Label |
|---|---|---|
| Property | 541444498, time zone Europe/London | VERIFIED |
| Measurement ID on site | `G-C7EZSL4WPV` only | VERIFIED |
| ID belongs to property 541444498 | Very likely; owner confirms in GA4 → Data streams | ESTIMATE |
| Install | Google & YouTube app pixel; no gtag in theme; no GTM | VERIFIED |
| Events configured | page_view, view_item_list, search, view_item, add_to_cart, remove_from_cart, view_cart, begin_checkout, add_shipping_info, add_payment_info, purchase | VERIFIED |
| Events arriving (counts) | Not readable | UNKNOWN |
| Sessions, 23 Oct – 19 Nov | 1,689 (50.7% engaged) | VERIFIED |
| **Currency** | **USD** (store GBP). GA4 revenue looks about 25–35% higher than Shopify £ | VERIFIED (setting) / ESTIMATE (size) |
| Purchases, revenue, transaction IDs | Not readable: OpenRush excludes them; Supermetrics trial expired 8 Sep | UNKNOWN |
| Self-referrals | None from checkout.shopify.com or paypal.com; klarna/referral 2, shop_app 1 | VERIFIED |
| Post-checkout tracking after Shopify's 26 Aug script shutdown | Still works (Ads purchases arrive) | VERIFIED |
| Consent Mode | Not readable | UNKNOWN |

### 3.1 GA4 source / medium, 28 days (VERIFIED, OpenRush)

| Source / medium | Sessions | Engagement |
|---|---|---|
| google / cpc | 914 | 53.7% |
| (direct) / (none) | 388 | 29.1% |
| chatgpt.com / ai-assistant | 176 | 67.6% |
| google / organic | 125 | 74.4% |
| (not set) | 37 | 8.1% |
| facebook referrals | 18 | – |
| facebook / social, ig / social | 5 | – |
| klarna / referral | 2 | – |
| others | 24 | – |
| **Total** | **1,689** | 50.7% |

### 3.2 What to expect when GA4 purchases become readable (ESTIMATE)

- At most 12 purchases for the 16 orders (4 have no tracking).
- More than 16, or a repeated transaction ID, would mean duplicates.
- Revenue in USD until the currency is changed. Do not compare with Shopify £.

**Decision:** do not use GA4 revenue for any business decision until the currency is GBP and the purchase count has been checked against Shopify.

---

## 4. Google Ads conversion audit

Source: report 02 (OpenRush Google Ads 198-038-2450 + Shopify order journeys).

### 4.1 Tag and actions

- One Ads tag `AW-18232390122`, sent by the Google & YouTube app, with 7 action labels: page_view, search, view_item, add_to_cart, begin_checkout, add_payment_info, **purchase**. VERIFIED (HTML).
- Which actions are Primary: UNKNOWN (no conversion-action report available). The reconciliation shows that only purchase values reach the Conversions column. ESTIMATE.
- Attribution model: data-driven (fractional conversions prove it). ESTIMATE.
- Enhanced Conversions: UNKNOWN.

### 4.2 Ads conversions = real orders (VERIFIED, 23 Oct – 19 Nov)

Spend £719.62, 1,160 clicks, **6.96 conversions, £2,591.62.**

| Ads click date | Conv / value | Shopify order | Order total |
|---|---|---|---|
| 24 Oct | 2 / £619.18 | #1028 + #1029 | £362.68 + £256.50 |
| 31 Oct | 0.96 / £238.60 | #1030 | £247.50 (0.04 credited to an earlier click) |
| 1 Nov | 1 / £323.98 | #1031 | £323.98 |
| 2 Nov | 1 / £274.99 | #1032 | £274.99 |
| 11 + 12 Nov | 0 / £1.05 + £1.05 | part of #1042 | – |
| 13 Nov | 1 / £556.19 | #1040 | £556.19 |
| 14 Nov | 1 / £576.57 | #1042 | £578.68 |
| **Total** | **6.96 / £2,591.62** | **7 orders** | **£2,600.52 − £8.90 = £2,591.62** |

Conclusions:
- Value = Shopify order total in GBP. Each order counts once. No double counting. VERIFIED.
- The "£1.05 secondary action" from Stage 1 is not a separate action. It is data-driven attribution splitting #1042 across three clicks (£576.57 + £1.05 + £1.05 = £578.67). ESTIMATE, exact to 1p. Stage 1 item closed, subject to the owner's Conversions screenshot.
- **#1033 (£505.98)** first came from PMax 20 days before ordering, but Ads did not count it. Likely cause: click cookie expired and no Enhanced Conversions. ESTIMATE.
- Shopify first-touch PMax: 8 orders, £3,106.50 (the 7 plus #1033). VERIFIED.

### 4.3 Network split (VERIFIED)

| Network | Spend | Clicks | Conv |
|---|---|---|---|
| Google Search (incl. Shopping inside PMax) | £688.57 | 1,062 | 6.96 |
| YouTube | £20.78 | 23 | 0 |
| Search partners | £3.74 | 16 | 0 |
| Gmail | £3.09 | 14 | 0 |
| Display | £2.77 | 41 | 0 |
| Discover, Maps, mixed | £0.67 | 4 | 0 |

### 4.4 Side finding

PMax clicks carry both `utm_campaign=pmax_all_products` and `utm_content=sag_organic` (the feed's tag rides inside the PMax feed URL). So `utm_content` cannot hold a product ID until a test proves the suffix survives. VERIFIED (order journeys).

---

## 5. Search Console audit

Source: report 02 (OpenRush GSC, 23 Oct – 19 Nov), additions to Stage 1 only.

| Measure | Value | Label |
|---|---|---|
| Clicks / impressions | 165 / 15,070 | VERIFIED |
| CTR / average position | 1.09% / 26.5 | VERIFIED |
| UK share | 92% of impressions, 93% of clicks | VERIFIED |
| Mobile | 109 clicks, CTR 1.48%, position 20.1 | VERIFIED |
| Desktop | 51 clicks, CTR 0.67%, position 32.8 | VERIFIED |
| Product + collection pages (UK, top 60 rows) | 7,473 impressions, 16 clicks, CTR 0.21%, position 40.3 | VERIFIED |
| Parameter URLs in results | 17 of the top 60 URLs carry `?variant=`, currency or old UTM tags | VERIFIED |
| Search appearance, indexing reasons | Not exposed by tools | UNKNOWN |

Pages on page 1–2 that still get almost no clicks (snippet problem): Cloud Teddy ottoman (306 impressions, position 10.2, 1 click), /collections/panel-beds (153, 11.7, 1), /collections/upholstered-beds (75, 9.0, 0), /collections/best-sellers (56, 1.6, 0). VERIFIED.

Pages with many impressions ranked too deep: /collections/storage-beds (985, 39.8), memory foam mattress (794, 54.6), /collections/divan-beds (517, 51.8). VERIFIED.

**Organic search sold nothing directly in 28 days:** 0 of 16 orders had an organic Google first or last visit. Human organic sessions: 89 → 12 carts → 4 checkouts → 0 orders. VERIFIED (Shopify journeys + ShopifyQL). Caveat: Shopify keeps only the first and last visit, so organic assists in the middle are invisible.

---

## 6. Meta tracking audit

Source: report 03 (Meta Ads MCP read tools, Shopify GraphQL, live HTML).

### 6.1 The main fault (P0 before any Meta spend)

| Asset | ID | Business | Fires on |
|---|---|---|---|
| Site pixel (healthy) | 504564665962911 "tech aba" | Tech ABA 498070783385123 (= Eagle Bed) | www.eaglebed.co.uk |
| Ad account "Eagle bed" | 641104701697209 | **Legend Beds** 2040644216402486 | – |
| Only pixel that ad account sees | 890821269640047 "legend beds" | Legend Beds | **legendbeds.co.uk** |
| Eagle Bed catalogue | 1311394936570400 | Tech ABA | Shopify sync |

Past Eagle Bed purchase ad sets (July and August 2026) optimised on the Legend Beds pixel. The March 2026 ad set used a Legend Beds catalogue product set. This explains why Meta logged 0 purchases while Shopify showed 2 Facebook-ad buyers (#1008, #1009). VERIFIED.

### 6.2 Pixel health (VERIFIED)

| Check | Result |
|---|---|
| How it loads | Once, via the Shopify Facebook & Instagram channel web pixel. No hard-coded fbq |
| Conversions API | ON (server events for every funnel step) |
| Purchase Event Match Quality | 8.0 / 10 |
| Purchases caught, 23 Oct – 18 Nov | 12 of 16 orders (75%), about £5,611 of £6,947.57 (ESTIMATE after dedup) |
| Orders missed | #1035, #1037, #1039, #1041: the same 4 orders with no journey in Shopify |
| Raw Purchase events | 21 (10 browser + 11 server), before deduplication |
| Deduplication rate | UNKNOWN (Events Manager only); likely fine |
| Purchase value / currency inside Meta | UNKNOWN (no read tool) |
| InitiateCheckout | Inflated by bots on 5, 15, 16 Nov (server 2.2× browser). Do not use as a KPI |

### 6.3 Catalogue (VERIFIED)

| Check | Result |
|---|---|
| Sync | Shopify integration, last sync 19 Nov 01:53 UTC succeeded |
| Items | 767 = 763 Eagle Bed variants (exact match with Shopify) + **4 styleaba.com teeth-whitening items** |
| Prices | 10 of 10 spot checks match Shopify, GBP |
| Rejected | 3 Memory Orthopaedic Mattress variants (policy: "orthopaedic" read as a health claim) |
| Dynamic ads readiness | Blocked (policy violations, shop visibility) |
| Event sources | Live pixel + a dead pixel 911849111119381 (silent since Jan 2025) |
| Custom conversions | 0 |

---

## 7. UTM standard

Source: report 04 §1. Adopted as the HQ standard on 19 Nov.

### 7.1 Rules

1. Lowercase and hyphens only. No spaces, underscores or capitals.
2. `utm_source` = the platform or sender, one spelling: `facebook`, `instagram`, `tiktok`, `pinterest`, `youtube`, `google-business-profile`, `whatsapp`, `trade-outreach`, `shopify-email`, `customer-service`.
3. `utm_medium` is one of: `social`, `paid-social`, `email`, `cpc`, `referral`, `affiliate`.
4. `utm_campaign` = `yyyy-mm-<theme>` for dated activity (`2026-11-photo-posts`), or `ao-<theme>` for always-on links (bio links, GBP website button, email flows).
5. `utm_content` = the post or creative ID (`post-2026-11-19-0900`, `pin-p11`, `type-a`).
6. `utm_term` for paid keywords only.
7. **No personal data** in any value.
8. Third-party tags (`sag_organic`, `chatgpt.com`, `klarna`, `ig`, `shop_app`) are left alone and mapped in reports.
9. Test one live click per platform before rollout.

### 7.2 Channel table

| Channel | source | medium | campaign | content |
|---|---|---|---|---|
| Facebook organic post | facebook | social | yyyy-mm-photo-posts / yyyy-mm-cinema | post-YYYY-MM-DD-HHMM |
| Meta ads (when restarted) | `{{site_source_name}}` | paid-social | `{{campaign.name}}` | `{{ad.id}}` |
| Instagram / TikTok bio | instagram / tiktok | social | ao-bio-link | bio |
| Pinterest | pinterest | social | yyyy-mm-pins | pin-pNN |
| YouTube Shorts | youtube | social | yyyy-mm-cinema | video-YYYY-MM-DD-HHMM |
| GBP post | google-business-profile | referral | yyyy-mm-gbp-posts | gbp-YYYY-MM-DD |
| GBP website button | google-business-profile | referral | ao-profile-website | website-button |
| Google Ads | google | cpc | pmax_all_products (kept as exception) | test `{product_id}` |
| Trade email | trade-outreach | email | yyyy-mm-trade-outreach | type-a / b / c |
| Customer email flows | shopify-email | email | ao-flow-<name> | button / swatch-link |
| WhatsApp quick replies | whatsapp | social | ao-quick-replies | pay / swatch / away |

### 7.3 What was wrong (VERIFIED, report 04)

- 0 sessions with campaign `hq_post_*` in 90 days. The scheduled photo-post task wrote `Shop: <url>` with no UTM.
- 5 spellings for organic social sources; mediums mixed `social` and `organic`.
- GBP tagged `google / organic`, which merges with organic search in GA4.
- 292 trade emails sent with plain URLs.
- History is not rewritten. The channel map in `data-model.json` normalises old values (`ig` → instagram, `Pinterest` → pinterest, `gbp_post` → Google Business Profile).

---

## 8. Customer journey measurement model

Base population: **UK human sessions** (`human_or_bot_session = 'human' AND session_country = 'United Kingdom'`). Windows: last 30 days (L30) = 20 Oct – 19 Nov; previous 30 (P30) = 19 Sep – 19 Oct. Rates divide matching windows only. VERIFIED (ShopifyQL, report 01).

### 8.1 The funnel

| Segment | Sessions | Cart | Checkout | Completed | Cart→Checkout | Checkout→Done |
|---|---|---|---|---|---|---|
| **UK human L30** | **1,373** | **166 (12.1%)** | **45 (3.3%)** | **12 (0.87%)** | 27.1% | 26.7% |
| UK human P30 | 2,275 | 98 (4.3%) | 26 (1.1%) | 4 (0.2%) | 26.5% | 15.4% |
| All human L30 | 1,504 | 181 (12.0%) | 57 (3.8%) | 12 (0.8%) | 31.5% | 21.1% |
| Bots L30 (excluded) | 519 | 15 | 106 | 0 | – | – |

- Orders (16) exceed tracked completions (12): 4 orders had no session. Orders per UK human session ≈ 16 / 1,373 = 1.17%. ESTIMATE (assumes all 4 untracked orders came from UK sessions; the store sells only in the UK, but this is not proven).
- Bots were 25.7% of all sessions. Always filter them.
- Non-UK human sessions: 131 (8.7%).

### 8.2 By device (human, L30)

| Device | Sessions | Cart | Checkout | Completed |
|---|---|---|---|---|
| Mobile | 1,213 | 139 (11.5%) | 36 (3.0%) | 11 (0.9%) |
| Desktop | 271 | 38 (14.0%) | 21 (7.7%) | 1 (0.4%) |
| Tablet | 20 | 4 | 0 | 0 |

Desktop reaches checkout often but finishes 1 in 21. Some may be checkout probes. ESTIMATE.

### 8.3 By UTM source (human, L30)

| Source / medium | Sessions | Cart | Checkout | Completed |
|---|---|---|---|---|
| google / cpc | 861 | 93 (10.8%) | 15 (1.7%) | 6 (0.7%) |
| (no UTM) | 431 | 61 (14.2%) | 38 (8.8%) | 5 (1.2%) |
| chatgpt.com | 185 | 23 (12.4%) | 2 (1.1%) | 1 (0.5%) |
| google / product_sync | 22 | 2 | 0 | 0 |
| klarna / referral | 2 | 2 | 2 | 0 |

Weakest step for paid traffic: only 16% of Google Ads carts reach checkout. VERIFIED.

### 8.4 By landing page (human, L30)

| Landing type | Sessions | Cart | Checkout | Completed |
|---|---|---|---|---|
| Product | 1,007 | 123 (12.2%) | 30 (3.0%) | 7 (0.7%) |
| Home | 254 | 26 (10.2%) | 7 (2.8%) | 3 (1.2%) |
| Collection | 116 | 10 (8.6%) | **0** | 0 |
| Blog | 23 | **0** | 0 | 0 |
| Other (cart, custom page, checkout links) | 104 | 22 | 20 | 2 |

### 8.5 Orders by journey source (16 orders, 23 Oct – 18 Nov)

| First-visit source | Orders | Value | Label |
|---|---|---|---|
| Google Ads PMax | 8 (#1028–#1033, #1040, #1042) | £3,106.50 | VERIFIED |
| Direct | 3 (#1034, #1038, #1043) | £1,874.65 | VERIFIED |
| ChatGPT | 1 (#1036) | £629.96 | VERIFIED |
| No journey (consent / blocked) | 4 (#1035, #1037, #1039, #1041) | £1,336.46 | VERIFIED today |
| Organic Google, social, email, trade | 0 | £0 | VERIFIED |
| **Total** | **16** | **£6,947.57** | sums match |

Note: report 03 quotes £1,336.86 for the 4 untracked orders. Today's GraphQL pull gives £275.40 + £301.49 + £255.59 + £503.98 = **£1,336.46**. The four groups then add up exactly to £6,947.57.

### 8.6 Weekly pulse

UK human sessions by week: 225 / 258 / 326 / 341 (report 04, VERIFIED). Last 7 days 12–18 Nov: 295 UK human sessions, 4 orders, £2,178.82 total. VERIFIED today.

---

## 9. Product attribution model

File: `ops/rocket/stage2/product-intel.json` (141 rows, 22 Aug – 19 Nov). VERIFIED.

### 9.1 How it works

- One row per product landing page with at least one human landing session, plus the "Selections" add-on row.
- Fields: landing sessions, landing-session carts / checkouts / completions, orders, units, gross, discounts, net, refunds.
- `sessions_with_cart_additions` and `checkouts` per product are **null**: Shopify does not attribute them per product.
- `ad_cost` and `contribution` are **null**: no product-level ad cost and no product costs.
- Totals reconcile with Stage 1: gross £15,158.33, net £13,563.37, 4,608 product landing sessions.

### 9.2 Classes (90 days)

| Class | Products |
|---|---|
| Attracting visitors and completing orders | Ottoman Gas Lift Divan Base (605 landings, 7 net units, £2,666.63); Side Lift Ottoman (275, 6, £1,603.38) |
| Buying intent, but high abandonment | Cloud Teddy Bouclé Ottoman (124, 16 carts, 5 checkouts); Savoy Channel (36, 8 carts, 9 checkouts); Royal Chesterfield (64, 11 carts); Grand Extra-Tall (116, 17 carts) |
| Weak sales despite traffic | Line Bumper Ottoman (441 landings, 28 carts, 0 sold); Line Ambassador (374, 26 carts, 1 sold); Stone Premium (270, 0); Mini Line Wingback Kids (248, 0); Line Kids Velvet (205, 1); Grand Princess (109, 0); Divan Drawer Storage Base (119, 1) |
| Buying intent, no sale yet | Mini Line Wingback Bed (55 landings, 7 carts, 2 checkouts) |
| Sells with few landings | 3000 Pocket mattress, Regal Luxe, Sunrise Fan, Hilton, Cambridge Storage, Memory Orthopaedic and others |
| No signal | 112 low-traffic pages |

Caution: landing cart and checkout counts belong to the whole session, not the product. "High abandonment" is a pointer for a walk-through, not proof.

### 9.3 What is missing to make it a profit model

1. Product-level ad cost: needs a tested `utm_content={product_id}` on PMax, or a product report from Ads.
2. Product cost per size (owner, C1–C2).
3. Per-product option choices (Easify event).

---

## 10. Data quality monitoring system

### 10.1 Design (report 04, `dq-checks.json`)

- 16 checks. Daily checks use only Shopify and HQ data (0 OpenRush credits). Weekly checks compare Shopify with GA4, Google Ads and Meta (6 credits a week, 9 at most).
- Severity: CRITICAL (money or sales data wrong now, act today), HIGH (decision number wrong, fix in 2 days), MEDIUM (fix within a week), LOW (monthly hygiene).
- Output: HQ `dq/latest` (and history in `dq-log/<date>` from the next run). HQ "Tracking health" card. Daily-report section listing FAIL items only. CRITICAL items also send one push line.
- Two checks were split today so each part keeps its own severity: DQ04 (orders vs GA4 currency) and DQ06 (product, variant and SKU). That makes 19 results.

### 10.2 First live run, 19 Nov 2026 12:55 UTC

Written to HQ: `dq/latest` (version 1) and the data model to `dq/model` (version 1, full 24.7 KB file). 0 OpenRush credits used.
Daily checks cover **18 Nov 2026** (the last closed UK day) unless stated. Weekly GA4, Ads and Meta checks use Stage 2 report values dated 19 Nov 2026 and are labelled HISTORICAL.

| ID | Check | Severity | Status | Value | Threshold | Evidence |
|---|---|---|---|---|---|---|
| DQ01 | Orders vs payments | HIGH | **PASS** | 1 paid order (#1043, £539.97) = 1 card sale £539.97 | any mismatch | VERIFIED GraphQL + ShopifyQL payments |
| DQ02 | Duplicate orders | HIGH | **PASS** | 0 pairs (also 0 in all 37 orders since 21 Aug) | ≥1 pair | VERIFIED GraphQL |
| DQ03 | Paid-but-cancelled / failed refund / fulfilled-unpaid | CRITICAL | **FAIL** | #1020 cancelled, still PAID, 3 failed refunds (£273.59); #1010, #1014 cancelled, EXPIRED, FULFILLED. Nothing new in 2 days | ≥1 order | VERIFIED GraphQL full scan |
| DQ04a | Order currency | CRITICAL | **PASS** | 37 of 37 orders GBP | any non-GBP | VERIFIED GraphQL |
| DQ04b | GA4 currency | HIGH | **FAIL** | USD | ≠ GBP | HISTORICAL 19 Nov (report 02) |
| DQ05 | Revenue sanity | MEDIUM | **PASS** | £539.97 order; totals match to 1p; 7-day discounts 7.7% | £20–£3,000; ±£1; ≤15% | VERIFIED ShopifyQL sales + GraphQL |
| DQ06a | Product id missing | HIGH | **PASS** | 0 lines (5 "Selections" add-on lines excluded by design) | ≥1 | VERIFIED GraphQL |
| DQ06b | Variant id missing | MEDIUM | **FAIL** | 1 line: #1009 (24 Aug) | ≥1 | VERIFIED GraphQL |
| DQ06c | SKU missing | LOW | **FAIL** | 4 lines: #1043 (yesterday), #1042, #1041, #1013 | ≥1 | VERIFIED GraphQL |
| DQ07 | Non-standard UTMs | MEDIUM | **PASS** | 18 Nov rows all allowlisted; 1 session on old capitalised `Google Shopping` | ≥1 non-allowlisted | VERIFIED ShopifyQL sessions |
| DQ08 | Untagged links on posts | MEDIUM | **FAIL** | 3 of 3 Facebook photo posts on 18 Nov had untagged `Shop: <url>`; pin P09 tagged; 2 cinema videos failed (no post) | ≥1 untagged | VERIFIED HQ posts/videos/pins |
| DQ09 | Tracking drop | CRITICAL | **PASS** | 31 UK human sessions vs 44.25 mean of last 4 Wednesdays (−29.9%); 6 carts; 4 orders in 7 days | −40% / 0 | VERIFIED ShopifyQL |
| DQ10 | Unattributed orders (14 days) | MEDIUM | **PASS** | 4 of 10 = 40.0%, exactly at the limit | >40% | VERIFIED GraphQL journeys |
| DQ11 | Checkout bot spike | MEDIUM | **PASS** | 51 sessions, 25.5% bots; 2 checkouts vs 6 carts | >3× carts and >30; bots >40% | VERIFIED ShopifyQL |
| DQ12 | Non-UK share (weekly) | LOW | **PASS** | 11.9% (40 of 335, 12–18 Nov) | >40% | VERIFIED ShopifyQL |
| DQ13 | Shopify vs GA4 (weekly) | HIGH | **UNKNOWN** | GA4 purchases unreadable | gap >40% etc. | HISTORICAL 19 Nov (report 02) |
| DQ14 | Shopify vs Google Ads (weekly) | HIGH | **PASS** | 7 real orders; Ads value / Shopify Ads-touched = 0.83 | >1.3× etc. | HISTORICAL 19 Nov (report 02) |
| DQ15 | Shopify vs Meta (weekly) | HIGH | **UNKNOWN** | skipped: Meta spend £0 since 8 Sep | spend >0 with 0 sessions | HISTORICAL 19 Nov (report 03) |
| DQ16 | Freshness | MEDIUM | **UNKNOWN** | first run; no earlier `dq/latest` existed | >36 h | VERIFIED ArtifactData |

**Result counts:** 19 checks. **11 PASS. 5 FAIL: 1 critical (DQ03), 1 high (DQ04b), 2 medium (DQ06b, DQ08), 1 low (DQ06c). 3 UNKNOWN** (DQ13, DQ15, DQ16).

Notes on the run:
- DQ03 scanned all orders since 21 Aug, not only the last 2 days, so the three known open items stay visible until fixed. They are not new.
- DQ06c found one more SKU gap than report 04 knew: **#1041** (Eagle Regal Gold-Trim). VERIFIED.
- DQ08 is already fixed for future posts by the Manager's task change today (section 12a). Tomorrow's run should pass.
- DQ10 is exactly at the 40% threshold. If one more untracked order arrives in the next 14 days, it fails.
- DQ14: the two £1.05 rows would trip the "< £5 value" sub-rule, but they are data-driven fractions of #1042 (0.002 conversions), not a separate action. Proposal: change the sub-rule to "any conversion of 0.5 or more worth less than £5". The spend-doubling sub-rule could not be tested from a 28-day total.

### 10.3 Health score methodology

**Score = 100 × (sum of weights of PASS checks) ÷ (sum of weights of checks with a known status).**
Weights: CRITICAL 4, HIGH 3, MEDIUM 2, LOW 1. UNKNOWN checks are left out (not counted as pass or fail). Split checks count separately at their own severity.

Today: PASS weight = DQ01 3 + DQ02 3 + DQ04a 4 + DQ05 2 + DQ06a 3 + DQ07 2 + DQ09 4 + DQ10 2 + DQ11 2 + DQ12 1 + DQ14 3 = **29**. FAIL weight = DQ03 4 + DQ04b 3 + DQ06b 2 + DQ08 2 + DQ06c 1 = **12**. Known weight = 41.
**Score = 100 × 29 / 41 = 70.7, shown as 71 / 100.** ESTIMATE (method), VERIFIED (inputs).

Why weighted: a failing critical money check should pull the score down more than a missing SKU. Why UNKNOWN is excluded: counting it as a pass would hide blind spots, counting it as a fail would punish tools we cannot reach. The UNKNOWN count is shown next to the score instead.
Limits: the score measures data hygiene. It does not measure how well sales are attributed. Old open items (#1020, #1010, #1014, #1009) will hold the score down until they are fixed in Shopify.

### 10.4 Where it runs from now

- HQ "Tracking health" card reads `dq/latest` (being added by the Manager now).
- The 23:59 daily report gets a daily data-quality step (being added by the Manager now).
- Weekly GA4/Ads/Meta checks: proposed for the Monday Search Revenue report, reusing its own pulls (awaiting approval, section 13).

---

## 11. Missing tracking events

| # | Missing event or data | Why it matters | Fix | Label |
|---|---|---|---|---|
| E1 | Product option selected (size, fabric, colour, assembly) | Cannot see which options make people leave | Theme custom event via `Shopify.analytics.publish` + custom pixel (T9) | VERIFIED missing |
| E2 | GA4 purchases, revenue, transaction IDs (readable copy) | Cannot cross-check GA4 with Shopify | Supermetrics month or owner screenshots (T13) | UNKNOWN |
| E3 | Google Ads conversion-action list | Cannot prove one primary purchase action | Owner screenshot S1 (T3) | UNKNOWN |
| E4 | Enhanced Conversions | Buyers like #1033 go uncredited | Turn on (T2) | UNKNOWN status |
| E5 | Per-product ad cost | Product ROAS impossible | Tested `utm_content` on PMax (T12) | VERIFIED missing |
| E6 | Organic social clicks before 19 Nov | No history for Facebook posts | Fixed from 19 Nov; history lost | VERIFIED |
| E7 | Trade email clicks before 19 Nov | 292 sends unmeasured | Fixed from 19 Nov | VERIFIED |
| E8 | Customer email flow, WhatsApp, bio link clicks | Unmeasured | U16–U19 (T12) | VERIFIED missing |
| E9 | Meta purchase value, currency, dedup rate | Meta numbers unproven | Owner Events Manager check (T15) | UNKNOWN |
| E10 | Organic social reach | Cannot judge posting | Supermetrics FB/IG Insights | UNKNOWN |
| E11 | Consent banner configuration | Legal status and tracked-share unknown | `read_privacy_settings` scope + owner check (T7, T8) | UNKNOWN |
| E12 | Trade order tag rule | Trade orders cannot be counted | Tag rule `trade-<ref>` on quote-led orders (no personal data) | VERIFIED missing |
| E13 | 4 of 16 orders with no journey | 25% of revenue unattributable | Enhanced Conversions helps Ads only; a post-purchase "How did you hear about us?" question would cover all channels | VERIFIED |
| E14 | End-to-end test conversion | Skill rule "verify a test conversion arrives" not met | One real order after T1–T3, checked in Ads and GA4 within 3 days | VERIFIED gap |

---

## 12. Implementation changes completed

Done by the Manager on 19 Nov 2026. These are the only live changes in Stage 2.

| # | Change | System | Report item | Status |
|---|---|---|---|---|
| a | The scheduled "Eagle Bed social post" task now tags the Facebook link with `utm_source=facebook&utm_medium=social&utm_campaign=<YYYY-MM>-photo-posts&utm_content=post-<date>-<slot>`. Bare URLs are removed from captions (Instagram and TikTok say "Link in bio"). Captions stop mentioning Clearpay until it is confirmed | Scheduled task prompt | U1, U2 (+ Stage 1 Q2/Q9 Clearpay) | Done |
| b | Trade email brief: product links now carry `utm_source=trade-outreach&utm_medium=email` (campaign and template content per the standard) | `ops/email/trade-agent-brief.txt` | U14 | Done |
| c | GBP post tag changed from `google / organic / gbp_post` to `google-business-profile / referral` | `ops/cinema/RUNBOOK.md` | U7 | Done |
| d | Data quality monitor first run saved to HQ `dq/latest`; data model saved to HQ `dq/model` | HQ ArtifactData | Report 04 part 10–11 | Done (section 10) |
| e | HQ "Tracking health" card, and a daily data-quality step in the 23:59 daily report | HQ page + daily report task | Report 04 alert route | Being added by the Manager now |
| f | Earlier on 19 Nov (before/after Stage 1): assembly wording made £69.99 optional on 17 site pages, WhatsApp texts and all agent prompts; 5 top product pages rewritten (backed up); UK marketing box no longer pre-ticked at checkout (owner); Stage 1 safeguards on trade emails (companies only, no B&Bs/care homes) | Shopify pages, prompts, checkout setting | Stage 1 queue | Done |

What to check tomorrow (20 Nov):
- DQ08 should PASS (the 09:00, 13:00, 18:00 Facebook posts carry the tag).
- The first `facebook / social / 2026-11-photo-posts` sessions may appear in ShopifyQL within a few days.
- `dq/latest` should be refreshed by the daily step, so DQ16 gets a real value.

---

## 13. Implementation changes awaiting approval

One table, merged and de-duplicated from reports 01–04. Nothing here has been done. Priority: P0 = before the related spend or within a day; P1 = this week; P2 = this month; P3 = when convenient.

| ID | What | Why | System | Benefit | Risk | Rollback | Approval | Pri | From |
|---|---|---|---|---|---|---|---|---|---|
| T1 | Change GA4 property currency USD → GBP | GA4 revenue is in dollars | GA4 Admin → Property details | GA4 revenue matches Shopify £ from the change date | Very low; old data stays USD (one trend break) | Set back to USD | Owner (GA4 admin) | P1 | 01 P7, 02 P1 |
| T2 | Turn on Enhanced Conversions for the purchase action | Buyers like #1033 lost when the click cookie expires | Google & YouTube app or Ads → Goals | More complete PMax measurement, better bidding | Low; sends hashed email/phone; privacy policy must cover it | Switch off | Owner | P1 | 01 P3, 02 P2, S1 Q23 |
| T3 | Screenshot Ads → Goals → Conversions (S1); keep **one primary purchase action**, all others secondary | 7 actions come from one tag; prevents future double counting | Google Ads | Bidding counts only real sales | None if done after the screenshot | Re-set previous | Owner | P1 | 01 P2, 02 P3 |
| T4 | Switch off the Simprosys tracking pixel (keep the feed) | Empty gtag on every page; unrestricted data sharing to the vendor | Simprosys app | Lighter pages; no latent duplicate | Low; check dynamic remarketing is not needed from it | Switch back on | Owner | P2 | 01 P1, 02 P5 |
| T5 | **Fix Meta pixel / ad account (Legend Beds).** Option A: share pixel 504564665962911 and catalogue 1311394936570400 from Tech ABA to ad account 641104701697209. Option B (cleaner): a new GBP ad account inside Tech ABA. Never reuse the Legend Beds pixel | Every Eagle Bed purchase campaign optimised on another site's pixel | Meta Business Manager | Meta can optimise and report on real Eagle Bed buyers | Low; Option A gives data to a business you may not control: confirm who owns "Legend Beds" first | Remove asset share / close account | Owner (business admin) | P0 before any Meta spend | 03 F1 |
| T6 | Catalogue clean-up: delete the 4 styleaba.com teeth-whitening items; request review of the 3 Memory Orthopaedic variants (title change only with approval); detach dead pixel 911849111119381 | Foreign items eligible for Eagle Bed ads and Shops; DA readiness blocked | Meta Commerce Manager | Clean, ad-ready catalogue | None for deletion; title change affects Google listings | Re-add / restore title | Owner (catalogue admin) | P1 | 03 F2, F3, F5 |
| T7 | Grant the Claude Shopify connector `read_pixels`, `read_privacy_settings` and theme read | Banner settings, custom pixels and theme files unreadable | Shopify app permissions | Closes 3 UNKNOWNs | Low (read only) | Revoke scopes | Owner | P2 | 01 P5 |
| T8 | Check the Shopify cookie banner is on and set for UK visitors; decide on removing the unused CMP Insert Code app | Legal certainty under UK GDPR/PECR; one consent tool | Shopify → Settings → Customer privacy | Legal certainty; clearer setup | Low–medium: a stricter banner lowers tracked sessions | Revert setting | Owner | P1 | 01 P6 |
| T9 | Add an `option_selected` custom event for Easify choices (theme copy + custom pixel) | No data on size/fabric/assembly drop-off | Theme copy + Shopify custom pixel | See which options lose buyers | Medium (theme change) | Unpublish copy / delete pixel | Owner (theme publish) | P3 | 01 P8 |
| T10 | Add klarna.com, paypal.com, shop.app, pay.shopify.com to GA4 unwanted referrals | Payment returns start new sessions | GA4 → Data streams → Tag settings | Small, cleaner sources | Very low | Remove entries | Owner | P3 | 02 P4 |
| T11 | Choose the live Merchant Center (MC-287909H1CX vs MC-SCY4EGMZHS / 5756953290); retire the other | Two feeds for the same products may conflict | Merchant Center / Shopify apps | Clean feed and diagnostics | Medium if the wrong one is removed | Re-link | Owner | P2 | 01 P11, 02 P6, S1 Q17 |
| T12 | Remaining UTM items: U3 (daily autopilot video), U4–U6 (cinema code), U8 (pins P11–P20), U9–U13 (HQ buttons, agent prompt), U16 (email flows), U17 (WhatsApp), U18 (GBP website button), U19 (bio links), U20 (Meta ad parameters on restart), U21 (PMax `utm_content` 1-day test), U22 (GA4 custom channel group) | Full channel coverage under one standard | Task prompts, code, HQ, owner apps, Ads, GA4 | Every owned link measurable | Low; U21 medium (test 1 day) | Revert / republish / remove suffix | Owner (U3–U13 Manager after approval; U16–U22 owner screens) | P2 (U21 P3) | 04 §1.6, 01 P9, 02 P7 |
| T13 | GA4 and Ads read access: renew Supermetrics for one month, or send screenshots S1–S8 | GA4 purchases, Ads action list unreadable | Supermetrics (cost) or owner | Closes DQ13 and the Ads action list | Cost only | Cancel | Owner (cost decision) | P2 | 02 §5 |
| T14 | Owner cost data C1–C9: product cost per size (C1), mattress cost (C2), delivery by region (C3), assembly labour (C4), payment fee confirmation (C5), VAT status (C6), packaging/swatches (C7), monthly tools (C8), returns (C9) | Profit, contribution and break-even ROAS are UNKNOWN | Owner → HQ `costs/*` | Unlocks every profit field and EAGLE10 review | None | – | Owner | P1 (C1, C2, C3, C6) | 04 §3.3 |
| T15 | Owner Meta checks: Purchase dedup %, value/currency/content_ids sample; confirm no Meta custom pixel in Shopify; catalogue match rate | Proves Meta numbers before any spend | Meta Events Manager, Shopify | Meta data trusted | None (read) | – | Owner (5 min) | P2 | 01 P4, 03 F6 |
| T16 | Weekly DQ13–DQ15 in the Monday Search Revenue report; save the daily autopilot's Ads pull to HQ so DQ14 costs 0 | Cross-platform checks at little or no extra cost | Scheduled task prompts | Weekly proof that Ads/GA4/Meta agree with Shopify | Low | Remove step | Owner (task prompts) | P2 | 04 §2 |
| T17 | Fill in missing SKUs on the variants of Grand Extra-Tall Panel, Curved Wingback, Eagle Regal Gold-Trim, Hilton Wingback | DQ06c fails | Shopify products | Clean product reporting | Very low | Clear field | Owner or Manager after approval | P3 | DQ run today |
| T18 | Amend DQ14 "< £5" sub-rule to whole conversions (≥ 0.5) | Data-driven fractions cause false alarms | `dq-checks.json` | Fewer false alerts | None | Restore rule | Manager | P3 | DQ run today |

Business items outside tracking that the DQ run keeps flagging (owner, already in Stage 1): **#1020** refund (£273.59, P0), and **#1010 / #1014** marked fulfilled with failed payment.

Owner decisions needed, shortest list:
1. Meta: which business and ad account runs Eagle Bed ads (T5). Who owns "Legend Beds"?
2. GA4 currency to GBP (T1) and Enhanced Conversions (T2): two switches.
3. Send the Ads Conversions screenshot (T3).
4. Supermetrics month or screenshots (T13).
5. Cost pack C1, C2, C3, C6 (T14).
6. Cookie banner check (T8).
7. Delete the 4 styleaba items (T6).
8. #1020 refund in PayPal (Stage 1 P0).

---

## 14. Verification evidence

What the Manager independently verified, and how.

| # | Claim | How it was verified | Result | Label |
|---|---|---|---|---|
| V1 | Google Ads conversions are real orders | Ads conversions by click date (OpenRush get_ad_performance) matched one by one with Shopify orders and order journeys | 6.96 conv / £2,591.62 = 7 orders (#1028, #1029, #1030, #1031, #1032, #1040, #1042), £2,600.52 − £8.90 earlier-click share = £2,591.62 | VERIFIED |
| V2 | Tag inventory (no duplicates) | curl of 4 live page types on desktop and iPhone user agents; parse of `webPixelsConfigList`; Simprosys script fetched | One Google sender, one Meta sender, empty Simprosys tag, no GTM, no hard-coded tags | VERIFIED |
| V3 | UK human funnel | ShopifyQL `FROM sessions` with human + UK filter, matching windows; device and source rows sum to the totals | 1,373 → 166 → 45 → 12 (0.87%) | VERIFIED |
| V4 | Meta catalogue in sync | Meta catalogue item count vs Shopify variants published to Facebook & Instagram; 10 price spot checks | 763 = 763 exact; 4 foreign extras; prices match in GBP | VERIFIED |
| V5 | Meta catches the tracked orders | Meta per-day Purchase counts (browser and server) matched to Shopify order days | 12 of 16; the 4 missed = the 4 with no Shopify journey | VERIFIED / ESTIMATE (day matching) |
| V6 | Data quality run | 8 Shopify reads (GraphQL orders ×3, ShopifyQL payments, sales, sessions ×4) + 5 HQ reads; results written to `dq/latest` and `dq/model` | 11 PASS, 5 FAIL, 3 UNKNOWN; score 71 | VERIFIED today |
| V7 | Untracked-order value | GraphQL totals of #1035, #1037, #1039, #1041 | £1,336.46 (corrects £1,336.86 in report 03) | VERIFIED today |
| V8 | Order currency | GraphQL currencyCode and presentmentCurrencyCode on 37 orders since 21 Aug | All GBP | VERIFIED today |

Not verified (stated plainly):
- No test order was placed. No conversion was proven end to end in GA4.
- GA4 purchase counts, the Ads conversion-action list, Meta dedup and the cookie banner settings were not readable.
- Live Meta firing was not observed in a browser (third-party hosts are blocked in this environment).

---

## 15. Remaining problems

| # | Problem | Severity | Owner of fix | Label |
|---|---|---|---|---|
| R1 | Meta ad account cannot see the Eagle Bed pixel or catalogue | P0 before Meta spend | Owner (T5) | VERIFIED |
| R2 | #1020: customer may be owed £273.59; #1010 and #1014 fulfilled with failed payment | P0 (money) | Owner | VERIFIED |
| R3 | GA4 revenue in USD; GA4 purchases unreadable | High | Owner (T1, T13) | VERIFIED / UNKNOWN |
| R4 | 4 of 16 orders (£1,336.46) have no journey; DQ10 sits at the 40% limit | Medium | Partly T2; consider a post-purchase source question | VERIFIED |
| R5 | Profit unknown: no product, delivery, labour or VAT data | High | Owner (T14) | UNKNOWN |
| R6 | Social, email and trade attribution only starts from 19 Nov; no history | Medium | Time + T12 | VERIFIED |
| R7 | Product-level ad cost missing | Medium | T12 (U21 test) | VERIFIED |
| R8 | Cookie banner settings unknown | Medium (legal) | Owner (T7, T8) | UNKNOWN |
| R9 | Ads conversion-action list and Enhanced Conversions status unknown | Medium | Owner (T2, T3) | UNKNOWN |
| R10 | 4 styleaba.com items in the Eagle Bed catalogue | Medium (brand) | Owner (T6) | VERIFIED |
| R11 | Bots inflate raw checkouts (Shopify 106 in 30 days; Meta InitiateCheckout) | Low if filtered | Reporting rule (human filter) | VERIFIED |
| R12 | Missing SKUs (4 lines) and one deleted variant (#1009) | Low | T17 | VERIFIED |
| R13 | Two Merchant Center IDs; which one feeds PMax is unknown | Low–medium | Owner (T11) | UNKNOWN |
| R14 | Cinema videos failing (Gemini credits depleted, HTTP 402) on 18 Nov | Low (content, not tracking) | Owner (billing) | VERIFIED (HQ videos) |
| R15 | Organic search sells nothing directly; collection and blog landings produce 0 checkouts | Business, not tracking | SEO / CRO work | VERIFIED |

---

## CAN EAGLE BED HQ ACCURATELY IDENTIFY WHICH ACTIVITIES GENERATE REAL COMPLETED ORDERS?

### Answer: **PARTLY.**

**Yes, for these:**
- **Google Ads Performance Max.** Every Ads conversion in the last 28 days is a real Shopify order: 6.96 conversions = 7 orders, value matched to the penny after the £8.90 earlier-click share. Shopify first-touch shows 8 PMax-started orders worth £3,106.50. VERIFIED.
- **Shopify first and last visit source for 12 of 16 orders.** PMax 8, direct 3, ChatGPT 1 (£629.96). VERIFIED (order journeys).
- **ChatGPT traffic**, through `utm_source=chatgpt.com` (185 human sessions, 1 order). VERIFIED.
- **Product sales and landing pages**, through `product-intel.json` (141 rows, reconciled with Stage 1). VERIFIED.

**No, not yet, for these:**
- **Social, email and trade.** Until today their links had no UTMs. 0 tagged social sessions in 90 days; 292 trade emails unmeasured. Tagging started on 19 Nov for Facebook posts, trade emails and GBP posts. Answers need about 4–8 weeks of tagged clicks (ESTIMATE: at about 1 order every 2 days, a channel needs that long to show even a few orders).
- **Profit.** No product, delivery, labour or VAT costs exist. HQ can say which activity brings revenue, not which brings profit.
- **GA4.** Revenue is in USD and purchase counts cannot be read. GA4 cannot be used to judge any activity yet.
- **Meta ads.** The ad account is tied to the Legend Beds pixel and catalogue. Any Meta campaign launched today would report and optimise on the wrong site.
- **4 of 16 orders (25%, £1,336.46)** have no journey at all because of declined cookies or blocking. No tool can assign them.
- **Middle-of-journey touches** (an organic guide visit between an ad click and the purchase) are invisible; Shopify keeps only first and last visit.

### Evidence summary

| Activity | Can HQ tie it to real orders? | Evidence | Label |
|---|---|---|---|
| Google Ads PMax | Yes | 7 of 7 Ads conversions = Shopify orders | VERIFIED |
| Direct / returning | Yes (as a source) | 3 orders, £1,874.65 | VERIFIED |
| ChatGPT | Yes | 1 order, £629.96 | VERIFIED |
| Organic Google | Yes for last/first touch (0 orders); assists unknown | 0 of 16 orders | VERIFIED / UNKNOWN |
| Facebook / Instagram organic | Not yet (tagging from 19 Nov) | 0 tagged sessions in 90 days | VERIFIED |
| Meta ads | No (wrong pixel on the ad account) | Report 03 | VERIFIED |
| Trade email | Not yet (tagging from 19 Nov) | 0 trade orders, no trade tag | VERIFIED |
| Customer email, WhatsApp | No (untagged) | Report 04 | VERIFIED |
| Pinterest, YouTube, GBP | Tagged, but 0 sessions so far | Report 04 | VERIFIED |
| Any activity's profit | No | No cost data | UNKNOWN |

### Exactly what is missing, and how to resolve it

| Missing | Resolve by | Who | When |
|---|---|---|---|
| Tagged clicks from social, trade and GBP | Changes (a)–(c) are live; wait for data; HQ "Tracking health" + DQ08 confirm daily | Manager (done) | 4–8 weeks of data |
| Tags on email flows, WhatsApp, bio links, videos, pins | T12 (U3–U19) | Owner approval, then Manager / owner | This month |
| GA4 in GBP and readable | T1 (currency) + T13 (Supermetrics or screenshots) | Owner | This week |
| Recover cookie-less Ads buyers | T2 Enhanced Conversions | Owner | This week |
| Proof of one primary purchase action | T3 screenshot | Owner | This week |
| Meta usable for ads | T5 pixel/account fix, then T15 checks | Owner | Before any Meta spend |
| Profit per order, product and channel | T14 cost pack C1–C9 into HQ `costs/*` | Owner | C1, C2, C3, C6 this week |
| Product-level ad cost | U21 one-day `utm_content` test on PMax | Owner (Ads) | This month |
| Trade orders counted | Tag quote-led orders `trade-<ref>` | Sales Closer | From the first trade quote |
| Untracked 25% of orders | Enhanced Conversions (Ads only) + a simple "How did you hear about us?" post-purchase question | Owner approval | This month |
| Daily proof the numbers stay right | DQ monitor daily + weekly (T16) | Manager (daily live), owner (weekly approval) | Daily from today |

---

## Limitations

- GA4 purchases, revenue and transaction IDs, the Ads conversion-action list, Enhanced Conversions status, Meta dedup and event parameters, the cookie banner settings and custom pixels were not readable. They stay UNKNOWN.
- No test order was placed. The skill rule "verify a test conversion arrives" is not met.
- Weekly DQ checks (DQ13–DQ15) use Stage 2 report values dated 19 Nov, not a new pull.
- DQ03 and DQ06 were run over all orders since 21 Aug so that known items stay visible; the strict daily window would have shown PASS for DQ03.
- DQ08 relies on the HQ `url` field and the task prompt text for Facebook captions; the live Facebook post text was not fetched.
- Small numbers: 16 orders in 30 days. One order moves any rate.
- Meta per-day matching is by Pacific date; Shopify is UK time.
- The theme was checked through rendered HTML, not the theme files (permission refused).
- Profit is UNKNOWN throughout.

## Credits used

- **Stage 2 total: 18 OpenRush credits** (all in report 02: 1 × get_ad_performance, 2 × get_website_analytics, 3 × get_search_performance, 3 credits each). Reports 01, 03, 04 and this report: 0.
- **Month total: 76 of 2,001.** The 400-credit reserve is untouched.
- This report and the DQ run (free reads): Shopify Admin GraphQL × 3, ShopifyQL × 6, HQ ArtifactData reads × 4, HQ writes × 1 batch (`dq/latest`, `dq/model`).
