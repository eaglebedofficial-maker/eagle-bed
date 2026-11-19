# Rocket Stage 2, parts 3–5: GA4, Google Ads conversions and Search Console

Prepared 19 Nov 2026. Read-only. Nothing was changed in GA4, Google Ads, Search Console, Merchant Center, Shopify or the theme.

Sources pulled today:
- Live site HTML (`curl https://www.eaglebed.co.uk`), including Shopify's web-pixel list that the page loads.
- OpenRush: Google Ads 198-038-2450, GA4 property 541444498, Search Console for eaglebed.co.uk (6 paid calls, listed at the end).
- Shopify Admin GraphQL (orders #1028–#1043 with journey data) and ShopifyQL (sessions).
- HQ db `seo/gsc-latest` (read only).
- Stage 1 reports 02 and 06 and STAGE1-REPORT.md (reused, not redone).

Window: **23 Oct – 19 Nov 2026** (28 days, UK time). The last 1–3 days are preliminary in every Google tool.

Labels: VERIFIED (pulled today, source named), HISTORICAL (Stage 1 or files), ESTIMATE (maths shown), UNKNOWN (reason given).
No customer personal data is used. Order numbers only.

---

## Answer first

1. **Google Ads purchase tracking is correct and counts each sale once.** Ads shows 6.96 conversions worth £2,591.62. These are 7 real Shopify orders (#1028, #1029, #1030, #1031, #1032, #1040, #1042), total £2,600.52. The £8.90 gap is exactly the part of #1030 that Google credited to a click before 23 Oct. VERIFIED (Ads + Shopify), maths below.
2. **The "£1.05 secondary action" from Stage 1 is not a separate action.** It is data-driven attribution. Google split order #1042 (£578.68) across three clicks by the same buyer: £576.57 on 14 Nov and £1.05 on each of 11 and 12 Nov (0.002 of a conversion each, shown as 0). £576.57 + £1.05 + £1.05 = £578.67 (1p rounding). ESTIMATE, but the sum matches to the penny.
3. **No double counting today.** If two purchase actions (for example the Shopify app and a GA4 import) were both primary, Ads value would be about twice the Shopify value. It is not. VERIFIED by the reconciliation in point 1. Whether a GA4-import action exists as a secondary action is UNKNOWN (conversion-action list not exposed).
4. **One Google tag setup, from the Shopify Google & YouTube app.** The live site sends GA4 `G-C7EZSL4WPV` and Google Ads `AW-18232390122` through one Shopify app pixel, with 11 ecommerce events including `purchase`. There is no hard-coded gtag or GTM in the theme. VERIFIED (site HTML).
5. **A second Google app pixel (Simprosys Google Shopping Feed) also loads on every page, but has no GA4 ID and no Ads conversion ID set.** It sends nothing to GA4 or Ads conversions today, so it is not a duplicate. It does load in a looser sandbox with "unrestricted" customer-data sharing and logs events to the vendor's own server. VERIFIED (site HTML + vendor script).
6. **GA4 currency is USD; the store is GBP.** VERIFIED (OpenRush GA4 metadata). Shopify sends purchase values in GBP; GA4 converts them to USD at the daily rate. So every GA4 revenue figure is in dollars and about a quarter to a third higher than the Shopify £ figure. Sessions and counts are not affected. Fix is one setting, future data only (awaiting approval).
7. **GA4 purchase counts, revenue and transaction IDs could NOT be pulled.** OpenRush's GA4 tool deliberately excludes conversions, revenue and events. The Supermetrics GA4 and Google Ads connectors are connected but the Supermetrics trial expired on 8 Sep 2026, so every query fails. UNKNOWN. Exact owner screenshots are listed in section 5.
8. **No self-referrals from checkout or payment providers.** GA4 shows no checkout.shopify.com or paypal.com sources. Only `klarna / referral` (2 sessions) and `shop_app / referral` (1). VERIFIED (GA4). Low impact.
9. **Post-checkout tracking survived Shopify's 26 Aug 2026 thank-you-page script shutdown.** Purchases are still recorded by the app pixel (Ads purchases on 24 Oct – 14 Nov). VERIFIED.
10. **Organic Google search sold nothing directly in 28 days.** 0 of 16 orders had an organic Google first or last visit. Untagged organic search brought 89 human sessions, 12 carts, 4 checkouts, 0 orders. The best organic product page is Cloud Teddy (10 sessions, 3 carts, 2 checkouts, 0 orders). VERIFIED (Shopify).
11. **Product and collection pages get half of all UK impressions but almost no clicks.** 7,473 impressions, 16 clicks, CTR 0.21%, average position 40. The site as a whole has CTR 1.09%. VERIFIED (GSC).
12. **Mobile search does twice as well as desktop.** Mobile CTR 1.48% at position 20; desktop 0.67% at position 33. UK is 92% of impressions and 93% of clicks. VERIFIED (GSC).

---

## 1. GA4 (part 3)

### 1.1 Property, tag and data collection

| Item | Finding | Label |
|---|---|---|
| GA4 property (OpenRush connection) | 541444498, timezone Europe/London | VERIFIED (OpenRush) |
| Measurement ID on the live site | **G-C7EZSL4WPV** (only real G- ID). The grep also returns "G-20251021", which is part of an image file name (`IMG-20251021-WA0029.jpg`), not a tag | VERIFIED (site HTML) |
| Does G-C7EZSL4WPV belong to property 541444498? | Very likely (the only GA4 ID on the site, and the property records sessions). Not provable through the API | ESTIMATE; owner confirms in GA4 → Admin → Data streams |
| Other Google IDs on the site | Google tags GT-W6N7JF9K and GT-WBL7CRG7; Ads AW-18232390122; Merchant Center IDs MC-287909H1CX and MC-SCY4EGMZHS | VERIFIED (site HTML) |
| How the tag is installed | Shopify **Google & YouTube app** web pixel (app client 1780363). No hard-coded gtag.js, no GTM container in the theme | VERIFIED |
| Domain | www.eaglebed.co.uk; Shopify checkout runs on the same domain | VERIFIED |
| Data collection | Working: 1,689 sessions, 857 engaged (50.7%) in the window | VERIFIED (OpenRush GA4) |
| Currency | **USD** (store is GBP) | VERIFIED (OpenRush GA4 metadata) |
| Consent banner / Consent Mode | Not readable from the HTML (Shopify injects its banner by script). The Google app pixel declares no privacy purposes, which means it handles consent itself | UNKNOWN |

### 1.2 Ecommerce events the site sends to GA4

From the Google & YouTube app pixel configuration in the live HTML (VERIFIED). Each event goes to GA4; some also go to Google Ads and Merchant Center.

| Event | GA4 G-C7EZSL4WPV | Google Ads label | Merchant Center |
|---|---|---|---|
| page_view | yes | yes | both MCs |
| view_item_list | yes | – | – |
| search | yes | yes | one MC |
| view_item | yes | yes | both MCs |
| add_to_cart | yes | yes | one MC |
| remove_from_cart | yes | – | – |
| view_cart | yes | – | – |
| begin_checkout | yes | yes | one MC |
| add_shipping_info | yes | – | – |
| add_payment_info | yes | yes | one MC |
| **purchase** | yes | yes | both MCs |

So all five funnel events the brief asks for (view_item, add_to_cart, begin_checkout, add_payment_info, purchase) are configured. Whether each one actually **arrives** in GA4, and how many, is UNKNOWN (see 1.4).

### 1.3 Other pixels on the site (sender inventory, VERIFIED from site HTML)

| Pixel | What it sends | Duplicate risk for GA4/Ads |
|---|---|---|
| Google & YouTube app | GA4 + Ads + Merchant Center, 11 events | The one real sender |
| Simprosys Google Shopping Feed (app 1558137) | GA4 switched off (`ga4_enabled -1`, no measurement ID). Ads "enabled" but **no conversion ID or labels**, so its `gtag` calls have an empty target. Dynamic remarketing on. Enhanced conversions off. Consent mode setting off. Logs events to the vendor's server. Merchant ID 5756953290 | **None today.** Becomes a duplicate the day someone fills in its GA4 ID or Ads conversion label |
| Meta (Facebook) pixel 504564665962911 | Meta only | n/a (Meta paused since 8 Sep, HISTORICAL) |
| TikTok pixel, Pinterest tag, Omnisend, Judge.me | Their own platforms | n/a |

Two Merchant Center IDs receive events. Which one feeds the live PMax campaign is UNKNOWN. Two accounts can mean two product feeds for the same products (owner check, section 5).

### 1.4 GA4 purchases vs Shopify orders (last 28 days)

**Shopify side (VERIFIED, Admin GraphQL):** 16 orders, #1028–#1043, total £6,947.57. All GBP, all PAID, none cancelled or refunded, no duplicate order numbers. 4 orders (#1035, #1037, #1039, #1041) have no journey data (consent declined or tracking blocked, ESTIMATE).

**GA4 side: UNKNOWN.**
- OpenRush `get_website_analytics` returns sessions and engagement only. It "deliberately reports NO conversions, revenue, or custom events" (tool description).
- Supermetrics has GA4 (and Google Ads, Search Console, Merchant Center) connected under the owner's login, but its free trial expired on 8 Sep 2026. Every data query returns `TRIAL_EXPIRED`. Discovery calls work, so the fields exist: `transactions`, `ecommercePurchases`, `purchaseRevenue`, `transactionId`, `currencyCode`, `addToCarts`, `checkouts`, and a `purchase` key-event count for this property. One paid month would answer section 1.4 completely.

What to expect when the owner sends the screenshot (ESTIMATE):
- GA4 should show **at most 12 purchases**: the 16 orders minus the 4 with no tracking. Fewer is normal if consent is declined.
- More than 16, or two rows with the same transaction ID, would mean duplicates.
- Revenue will be in **US dollars**, roughly £6,947.57 × the GBP/USD rate for the 12 tracked orders' share. Do not compare it with Shopify £ figures directly.
- Transaction ID should be the Shopify order ID. A `(not set)` transaction ID would be a fault.

Checks for each failure mode in the brief:

| Check | Result | Label |
|---|---|---|
| Duplicate purchases | No second GA4 sender exists on the site, so duplicates are unlikely | VERIFIED (sender inventory) / count UNKNOWN |
| Missing purchases | Expect about 4 of 16 missing (no journey data) | ESTIMATE |
| Wrong currency or value | Value sent in GBP; GA4 reports in USD (property setting) | VERIFIED setting |
| Missing transaction_id | Cannot read | UNKNOWN |
| Broken post-checkout tracking | Not broken: the app pixel runs in Shopify checkout, and Ads purchases still arrive after the 26 Aug 2026 script shutdown | VERIFIED |
| Self-referrals | None from checkout.shopify.com or paypal.com; klarna/referral 2 sessions, shop_app/referral 1 | VERIFIED (GA4 source/medium) |

### 1.5 GA4 source / medium, 28 days (VERIFIED, OpenRush)

| Source / medium | Sessions | Engagement rate |
|---|---|---|
| google / cpc | 914 | 53.7% |
| (direct) / (none) | 388 | 29.1% |
| chatgpt.com / ai-assistant | 176 | 67.6% |
| google / organic | 125 | 74.4% |
| (not set) | 37 | 8.1% |
| (data not available) | 13 | 100% |
| facebook.com, m.facebook.com, lm.facebook.com / referral | 18 | |
| facebook / social, ig / social | 5 | |
| klarna / referral | 2 | |
| shop_app / referral | 1 | |
| others (bing, ecosia, yahoo, l.wl.co, integrishield) | 9 | |
| **Total** | **1,689** | 50.7% |

Channel split was already pulled in Stage 1 (report 06) and is not repeated.

### 1.6 Currency: USD vs GBP, and what it changes

- **What is wrong:** GA4 property currency = USD. The shop sends `currency: GBP` with every purchase. GA4 converts each purchase into USD at that day's rate. VERIFIED (setting); conversion behaviour is Google's documented method.
- **Impact:** every GA4 revenue, average order value and item revenue figure is in dollars and looks about 25–35% higher than Shopify (ESTIMATE, depends on the day's rate). Purchase counts, sessions and funnel rates are not affected. Google Ads is not affected, because Ads takes its value from its own tag in GBP. If a GA4 purchase were ever imported into Ads, Ads would convert it back into GBP, so bidding would still be roughly right, with small rate noise.
- **Fix:** see proposal P1 (section 6). The change applies to future data only. Old data stays in USD.

---

## 2. Google Ads conversions (part 4)

### 2.1 What can and cannot be read

| Item | Status |
|---|---|
| Conversion-action list (name, category, primary/secondary, source, value, counting, attribution model) | **UNKNOWN.** OpenRush has no conversion-action report. The Supermetrics `ConversionAction` report has these exact fields but the trial has expired |
| Daily conversions and value by click date | VERIFIED (OpenRush overview) |
| Ads labels the site sends | VERIFIED (site HTML): 7 Google Ads labels on AW-18232390122, one each for page_view, search, view_item, add_to_cart, begin_checkout, add_payment_info and **purchase** (label `p-GGCLm2utYcEOrj8PVD`) |
| Which of the 7 are primary | UNKNOWN. The Shopify Google & YouTube app normally creates its purchase action as primary and the other six as secondary (HISTORICAL, how the app usually works). The reconciliation below shows that only purchase-sized values reach the "Conversions" column, which fits this |
| Attribution model | Data-driven (fractional 0.96 conversion and the £1.05 splits only happen under data-driven). ESTIMATE. OpenRush also says the account "may include view-through" |
| Enhanced Conversions | UNKNOWN. Not visible in the page config. The Simprosys app shows it off, but that app sends no Ads conversions anyway |

### 2.2 Ads purchases vs Shopify orders (VERIFIED, unchanged since Stage 1)

Ads window 23 Oct–19 Nov: spend £719.62 (was £709.44 in Stage 1; late-arriving spend), 1,160 clicks, **6.96 conversions, £2,591.62** (unchanged). No new Ads conversion since 14 Nov.

| Ads click date | Ads conv / value | Shopify order (date) | Order total | Difference |
|---|---|---|---|---|
| 24 Oct | 2 / £619.18 | #1028 (24 Oct) + #1029 (27 Oct) | £362.68 + £256.50 = £619.18 | £0.00 |
| 31 Oct | 0.96 / £238.60 | #1030 (31 Oct) | £247.50 | £8.90 (0.036 conv credited to a click before 23 Oct) |
| 1 Nov | 1 / £323.98 | #1031 | £323.98 | £0.00 |
| 2 Nov | 1 / £274.99 | #1032 | £274.99 | £0.00 |
| 11 Nov | 0 / £1.05 | part of #1042 | | |
| 12 Nov | 0 / £1.05 | part of #1042 | | |
| 13 Nov | 1 / £556.19 | #1040 | £556.19 | £0.00 |
| 14 Nov | 1 / £576.57 | #1042 (14 Nov) | £578.68 | £576.57 + £1.05 + £1.05 = £578.67 |
| **Total** | **6.96 / £2,591.62** | 7 orders | **£2,600.52** | £2,600.52 − £8.90 = **£2,591.62** |

Conclusions:
- **Value = Shopify order total** (including discounts, in GBP). VERIFIED.
- **Each order counts once.** No duplicate purchase action is adding value. VERIFIED.
- **The £1.05 rows are attribution splits of #1042, not a second action.** ESTIMATE (exact to 1p). The Stage 1 recommendation "make the £1.05 action secondary" can be closed, subject to the owner's screenshot.
- **#1033 (£505.98, 3 Nov) is a PMax customer that Ads did not count.** Their first PMax visit was 20 days earlier; the order visit had no referrer. Likely cause: the ad-click cookie was gone (Safari limits such cookies to 7 days or less) and there are no Enhanced Conversions to match the buyer by hashed email. ESTIMATE. This is the case Enhanced Conversions fixes (proposal P2).
- **Shopify total for the window:** 16 orders, £6,947.57. Ads claims 7 (£2,600.52 of order value, 37%). Shopify first-touch PMax: 8 orders, £3,106.50 (the 7 plus #1033). VERIFIED.

### 2.3 Duplicate risk

| Risk | Status |
|---|---|
| GA4-imported purchase AND Shopify-app purchase both primary | Not happening in this window (values would double). Whether a GA4-import action exists at all is UNKNOWN |
| Simprosys app sending a second Ads purchase | No: its Ads conversion ID and purchase label are empty | 
| Thank-you page refresh double-fire | Not a risk: the pixel fires on Shopify's `checkout_completed` event, once per order |
| Counting "Every" vs "One" | UNKNOWN. "Every" is correct for purchases |

### 2.4 Network split, 28 days (VERIFIED, OpenRush; new detail)

| Network | Spend | Clicks | Conv |
|---|---|---|---|
| Google Search (incl. Shopping inside PMax) | £688.57 | 1,062 | 6.96 |
| YouTube | £20.78 | 23 | 0 |
| Search partners | £3.74 | 16 | 0 |
| Gmail | £3.09 | 14 | 0 |
| Display (content) | £2.77 | 41 | 0 |
| Discover, Maps, mixed | £0.67 | 4 | 0 |

The "Eagle Bed | Search | UK" campaign spent £28.84 (58 clicks, 0 sales) in the window before its 28 Oct pause. Search partners and Display are too small to explain Stage 1's GA4 "Paid Search engagement collapse" (211 sessions, 22 engaged). That item stays open. HYPOTHESIS: GA4's split between "Paid Search" and "Cross-network" for PMax clicks, not a traffic-quality change.

### 2.5 Small related finding

Paid PMax clicks land with `utm_campaign=pmax_all_products` **and** `utm_content=sag_organic` (for example #1028, #1029, #1030, #1032, #1042). The Shopify Google channel's "free listing" tag rides inside the feed URL that PMax uses. This supports Stage 1's view that before 28 Sep paid feed clicks were reported as "sag_organic". VERIFIED (order journeys) / ESTIMATE (the inference).

---

## 3. Search Console (part 5, additions only)

Stage 1 (report 02 and HQ `seo/gsc-latest`) already covers totals, top pages, near-win queries and commercial terms. Today's totals (23 Oct–19 Nov): 165 clicks, 15,070 impressions, CTR 1.09%, position 26.5. These agree with Stage 1 (168 clicks for 22 Oct–18 Nov). VERIFIED.

### 3.1 Device (VERIFIED, OpenRush GSC, vs 25 Sep–22 Oct)

| Device | Clicks (change) | Impressions (change) | CTR | Position |
|---|---|---|---|---|
| Mobile | 109 (+16) | 7,363 (+1,884) | 1.48% | 20.1 |
| Desktop | 51 (+12) | 7,561 (+3,349) | 0.67% | 32.8 |
| Tablet | 5 (+3) | 146 (+60) | 3.42% | 18.3 |

Mobile earns two thirds of organic clicks from half the impressions. Desktop impressions grew most, but at deep positions.

### 3.2 Country (VERIFIED)

| Country | Clicks | Impressions | Position |
|---|---|---|---|
| United Kingdom | 153 | 13,928 | 27.4 |
| United States | 0 | 169 | 11.2 |
| Pakistan | 3 | 114 | 10.5 |
| Ireland | 0 | 75 | 20.1 |
| India | 1 | 71 | 48.9 |
| Germany | 0 | 59 | 8.2 |
| Others (top 15 shown) | 8 | about 290 | |

UK = 92% of impressions, 93% of clicks. Non-UK organic search is small, unlike Shopify sessions (about 30% non-UK, mostly bots and direct).

### 3.3 Search appearance and indexing

- **Search appearance: UNKNOWN.** The OpenRush GSC tool can filter by search appearance but cannot list or group by it. Owner: Search Console → Performance → Search results → "Search appearance" tab (screenshot of the table: Product snippets, Merchant listings, Review snippets, etc.).
- **Indexing problems: UNKNOWN.** No URL Inspection or Page-indexing report is exposed by OpenRush. Owner: Search Console → Indexing → Pages → "Why pages aren't indexed" (screenshot of the reason table), and Shopping → Merchant listings / Product snippets (screenshot of invalid items).
- **Evidence of parameter URLs being indexed (VERIFIED):** in the UK product/collection rows, 17 of the top 60 URLs carry `?variant=`, `country=GB&currency=GBP`, `utm_campaign=Google%20Shopping&stkn=…` or `utm_campaign=sag_organic`. Example: `/products/divan-drawer-storage-base` appears as 5 separate URLs (positions 55–82). The `Google Shopping … stkn` tag comes from the old Shopping/feed links. This splits ranking signals; Stage 1 already recommended checking product canonicals (O7, section 8.4).

### 3.4 Product and collection pages: high impressions, low CTR (VERIFIED, UK only, top 60 rows)

All product + collection URLs together: **7,473 impressions, 16 clicks, CTR 0.21%, position 40.3.**

Pages already on page 1–2 that still get almost no clicks (the snippet or offer is the problem, not the ranking):

| Page | Impressions | Clicks | CTR | Position |
|---|---|---|---|---|
| /products/cloud-teddy-boucle-ottoman-gas-lift-storage-bed | 306 | 1 | 0.3% | 10.2 |
| /collections/panel-beds | 153 | 1 | 0.7% | 11.7 |
| /products/panel-line-upholstered-bed-frame | 94 | 1 | 1.1% | 14.0 |
| /collections/upholstered-beds | 75 | 0 | 0% | 9.0 |
| /collections/best-sellers | 56 | 0 | 0% | 1.6 |
| /products/oxygen-upholstered-bed-frame (?variant URL) | 50 | 0 | 0% | 5.9 |
| /products/panel-line-border-upholstered-bed | 50 | 0 | 0% | 7.6 |
| /collections/mattresses | 37 | 0 | 0% | 7.7 |
| /products/chester-wingback-panel-headboard | 32 | 0 | 0% | 10.8 |
| /products/star-upholstered-bed-frame | 28 | 0 | 0% | 5.3 |
| /products/mayfair-bumper-upholstered-bed-frame | 21 | 0 | 0% | 7.7 |

Commercial pages with many impressions but ranking too deep to be clicked (ranking problem):

| Page | Impressions | Clicks | Position |
|---|---|---|---|
| /collections/storage-beds | 985 | 3 | 39.8 |
| /products/memory-foam-mattress-uk | 794 | 1 | 54.6 |
| /collections/divan-beds | 517 | 1 | 51.8 |
| /collections/divan-ottoman-beds | 438 | 0 | 58.7 |
| /collections/ottoman-beds | 355 | 0 | 31.9 |
| /collections/small-double-ottoman-beds | 304 | 0 | 50.1 |
| /collections/wingback-beds | 233 | 0 | 21.3 |
| /products/side-lift-open-ottoman-bed | 203 | 0 | 35.5 |

Commercial queries (from the HQ cache and Stage 1, HISTORICAL, not re-pulled): "gas lift ottoman bed" 117 impressions at 19.1, 0 clicks; "ottoman divan bed" 122 at 70.6; "chesterfield bed" 84 at 52.8; "divan beds uk" 59 at 40.0, 2 clicks; "cloud teddy bed" 30 at 10.6, 0 clicks.

### 3.5 Organic landing pages joined with Shopify orders

**Order level (VERIFIED, Shopify journey per order, 16 orders):**

| First / last visit source | Orders | Value |
|---|---|---|
| Google Ads PMax (first touch) | 8 (#1028–#1033, #1040, #1042) | £3,106.50 |
| Direct | 3 (#1034, #1038, #1043) | £1,874.65 |
| ChatGPT | 1 (#1036, Royal Chesterfield) | £629.96 |
| No journey data | 4 (#1035, #1037, #1039, #1041) | £1,336.46 |
| **Organic Google search (first or last visit)** | **0** | £0 |

**Session level, untagged search referrals, human only (VERIFIED, ShopifyQL):** 89 sessions (58 mobile, 31 desktop), 12 with a cart, 4 reached checkout, 0 completed.

| Organic landing page | Shopify sessions | Carts | Checkouts | Orders | GA4 google/organic sessions | GSC clicks (UK) |
|---|---|---|---|---|---|---|
| / (home) | 24 | 6 | 1 | 0 | 23 | brand, see Stage 1 (31) |
| Cloud Teddy ottoman | 10 | 3 | 2 | 0 | 13 | 1 |
| /blogs/news/how-do-ottoman-beds-work | 6 | 0 | 0 | 0 | 3 | Stage 1: 6 |
| /pages/aftercare-and-feedback | 4 | 1 | 0 | 0 | 4 | Stage 1: 7 |
| /collections/divan-ottoman-beds | 3 | 1 | 0 | 0 | 1 | 0 |
| /collections/wingback-beds | 3 | 0 | 0 | 0 | 2 | 0 |
| /collections/storage-beds | 2 | 0 | 0 | 0 | 2 | 3 |
| Side Lift gas-lift storage bed | 2 | 0 | 0 | 0 | 6 | 0 |

What this means:
- Organic search brings browsers, not buyers, today. The one organic page close to selling is **Cloud Teddy** (2 checkouts, 0 orders).
- The guides and the aftercare page bring visits but no carts.

Limits of the join (why "0 organic orders" may understate SEO):
- **Shopify keeps only the first and the last visit per order.** An organic visit in the middle of a journey is invisible.
- **Last-click hides assists.** A shopper who found Eagle Bed through a guide and came back by typing the address shows as "direct".
- **4 of 16 orders have no journey at all.** Some could be organic.
- **GSC clicks, GA4 sessions and Shopify sessions are different units.** GSC counts clicks in Google; GA4 drops non-consenting and bot visits; Shopify counts sessions including some bots (filtered here to human). GA4's google/organic (125) also includes free Shopping listing clicks, which Shopify files under `sag_organic` UTMs, so the counts will not match.
- **Windows differ by a day** (GSC Pacific time, GA4 and Shopify UK time).

---

## 4. Decisions this report supports

1. Trust Google Ads purchase numbers for bidding: one sale = one conversion, value = order total. VERIFIED.
2. Close the Stage 1 "£1.05 secondary action" item (it is attribution splitting), once the owner's Conversions Summary screenshot confirms there is only one primary purchase action.
3. Do not use GA4 revenue until the currency is GBP and the purchase count is checked against Shopify.
4. For SEO, work on snippets for pages already on page 1–2 (Cloud Teddy, panel beds, upholstered-beds, wingback), not only on rankings.

---

## 5. Owner checks (exact screens and screenshots)

| # | Where | What to screenshot | Answers |
|---|---|---|---|
| S1 | **Google Ads → Goals → Conversions → Summary** | The full table. Add columns: Action optimisation (Primary/Secondary), Conversion source, Status, Count, Click-through window, Attribution model, Conversions, All conv. value. Date range 23 Oct–19 Nov | Names, primary/secondary, source (Shopify app vs GA4 import vs website), counting, attribution. Confirms no second primary purchase |
| S2 | Google Ads → Goals → Conversions → click the **purchase** action | The "Enhanced conversions" panel and the Diagnostics tab | Enhanced Conversions on/off and health |
| S3 | Shopify admin → Apps → **Google & YouTube** → Settings / Conversion tracking | The conversion-tracking and Enhanced conversions status | Which app owns the purchase action |
| S4 | GA4 → Admin → **Property details** | Currency and time zone | Confirms USD |
| S5 | GA4 → Admin → **Data streams** → web stream | Stream URL and Measurement ID | Confirms G-C7EZSL4WPV = property 541444498 |
| S6 | GA4 → Admin → **Key events** and → Product links → **Google Ads links** | List of key events; linked Ads accounts | Whether purchase is a key event and could be imported into Ads |
| S7 | GA4 → Explore → Free form, 23 Oct–19 Nov: rows **Transaction ID**, values **Purchases** and **Purchase revenue** | The table (order IDs only) | GA4 purchase count, duplicates, missing orders, (not set) IDs |
| S8 | GA4 → Reports → Monetization → **Ecommerce purchases**, and Engagement → **Events** | Event counts for view_item, add_to_cart, begin_checkout, add_payment_info, purchase | Funnel events arriving |
| S9 | Search Console → Performance → **Search appearance** tab | The table | Search appearance split |
| S10 | Search Console → Indexing → **Pages** and Shopping → **Merchant listings** | "Why pages aren't indexed" table; invalid items | Indexing problems |
| S11 | Merchant Center (both accounts, if both exist) → Products → Needs attention | Overview | Which MC feeds PMax; duplicate feeds |

Cheaper alternative to screenshots S1, S7 and S8: renew Supermetrics for one month. The connectors are already authorised; the fields needed are confirmed to exist. This is a cost decision for the owner.

---

## 6. Proposed changes (all AWAITING APPROVAL; nothing done)

| # | What changes | Why | System | Benefit | Risk | Rollback | Approval |
|---|---|---|---|---|---|---|---|
| P1 | GA4 property currency USD → **GBP** | Revenue is shown in dollars | GA4 Admin → Property details | GA4 revenue matches Shopify £ from the change date | Very low. Past data stays in USD (one-off break in trend) | Set back to USD | Owner |
| P2 | Turn on **Enhanced Conversions** for the purchase action (in the Google & YouTube app, or Ads → Goals → Settings) | Recover buyers like #1033 whose click cookie expired | Google Ads / Shopify app | More complete PMax measurement; better bidding | Low. Sends hashed email/phone to Google; covered by the privacy policy? (owner checks) | Switch off | Owner |
| P3 | After S1: keep **only one primary purchase action**; any GA4-imported purchase stays secondary | Prevent future double counting | Google Ads | Protects bidding from 2× values | None if done after S1 | Re-set to previous | Owner |
| P4 | Add klarna.com, paypal.com, shop.app (and pay.shopify.com) to GA4 **unwanted referrals** | Hygiene; stops payment returns starting new sessions | GA4 Admin → Data streams → Configure tag settings | Small (3 sessions now) | Very low | Remove entries | Owner |
| P5 | Decide whether the **Simprosys** app still needs its tracking pixel; if only the feed is used, switch its tracking off | It loads on every page with unrestricted customer-data sharing and sends events to its own server, while sending nothing useful to Google | Shopify → Simprosys app settings | Less third-party data sharing; lighter pages; removes a latent duplicate | Low; check that dynamic remarketing is not needed from this app | Switch back on | Owner |
| P6 | Confirm which of the two **Merchant Center** accounts (MC-287909H1CX, MC-SCY4EGMZHS / 5756953290) is live; retire the other | Two feeds for the same products can conflict | Merchant Center / Shopify apps | Cleaner feed and diagnostics | Medium if the wrong one is removed | Re-link | Owner |
| P7 | Add `utm_content={product id}` (or asset group) to the PMax final-URL suffix | Shopify then shows which products sell from ads (Stage 1 O20) | Google Ads | Product-level ROAS | Low; check the existing `sag_organic` content tag is not needed | Remove suffix | Owner |

Verification after P1–P3 (rule from the skills: verify a test conversion arrives): the next real order should appear once in Ads (Conversions column) with the same £ value as Shopify, and once in GA4 Explore with its order ID, in GBP. Check 3 days later.

---

## Limitations

- GA4 purchases, revenue, transaction IDs and funnel event counts are UNKNOWN: OpenRush does not expose them and the Supermetrics trial has expired.
- The Google Ads conversion-action list (names, primary/secondary, source, counting, model, Enhanced Conversions) is UNKNOWN for the same reasons. The "£1.05 = attribution split" finding rests on arithmetic that matches to the penny, not on the action list.
- Consent banner and Consent Mode status are UNKNOWN.
- Search appearance and indexing status are UNKNOWN (not exposed).
- GSC page rows are the top 60 UK product/collection URLs only (truncated); smaller pages are not shown.
- The last 1–3 days in Ads, GA4 and GSC are preliminary. Ads books sales by click date; Shopify by order date.
- Monthly numbers are small (16 orders; 7 Ads sales). One order changes any rate a lot.
- Profit is UNKNOWN (no product costs).

## Credits used

OpenRush, this report: **18 credits** (budget 24).

| # | Call | Credits |
|---|---|---|
| 1 | describe_capabilities | 0 |
| 2 | list_connections | 0 |
| 3 | get_ad_performance (overview: daily trend, campaigns, network; 28 days) | 3 |
| 4 | get_website_analytics (source_medium, 28 days) | 3 |
| 5 | get_website_analytics (landing_page, filter google / organic, 28 days) | 3 |
| 6 | get_search_performance (device, 28 days vs previous) | 3 |
| 7 | get_search_performance (country, 28 days) | 3 |
| 8 | get_search_performance (page, UK, products/collections, 60 rows) | 3 |
| | **Total** | **18** |

Month total: 58 before Stage 2 + 18 = **76 of 2,001**, if no other Stage 2 specialist has spent yet. Reserve of 400 untouched.
Free (no OpenRush credits): site HTML, Shopify GraphQL and ShopifyQL, HQ read, Supermetrics discovery (data queries refused, trial expired).
