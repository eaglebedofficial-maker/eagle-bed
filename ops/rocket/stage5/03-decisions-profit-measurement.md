# Rocket Stage 5, report 03: owner decisions, profit engine, measurement, catalogue, trust and the kids range (19 Nov 2026, evening)

Prepared by the Decision Council, Profit & Cash, Analytics and Verification for Stage 5 parts 2, 6 and 10 and workstreams S5-1, S5-2, S5-6, S5-7 and S5-8.

This work was read-only on live systems: no change was made to Shopify, the theme, Easify, Ads, policies or Gmail, and no one was contacted. Writes were limited to the HQ docs `costs/schema`, `costs/status` and `cro/programme`, plus the files listed at the end. Nothing was committed.

Labels: **VERIFIED**, **MATCHED WITH ATTRIBUTION LIMITATIONS**, **ESTIMATE**, **UNKNOWN**, **HISTORICAL** (figures from earlier stages), **HYPOTHESIS**. Cancelled orders #1010, #1014 and #1020 are left out of every paid-order count. None of them falls inside the 30-day baseline window.

## 0. Summary

1. **Owner decisions (29 items on the Stage 4 list):** 1 COMPLETED (trading entity and VAT; the policies are verified live), 27 PENDING, 1 NOT APPLICABLE (the £300 placeholder can only be removed once real costs exist). The owner has also completed 4 decisions outside the list: the theme fixes, VAT registration, the base height of 14 in, and assembly / UK only / the marketing checkbox. VERIFIED. File: `owner-decisions.csv`. The 10 questions still open are in `owner-decision-request.md`.
2. **Costs are still at 0%.** The cost workbook has 0 of 831 cost rows filled. VERIFIED. The HQ structure is now in place (`costs/schema`, `costs/status`), but **the verified break-even ROAS is UNKNOWN**. Nothing in this report claims a profit.
3. **Break-even formula now that VAT is confirmed:** break-even ROAS on Google's VAT-inclusive value = **1.2 ÷ contribution margin before ads** (margin measured on ex-VAT revenue). Today's real-order ROAS of 2.34 breaks even only if that margin is **at least 51%**. Non-brand ROAS of about 1.52 needs **at least 79%**. ESTIMATE (the formula is exact; the margin is UNKNOWN).
4. **Measurement:** the HQ doc `cro/programme` holds the read-out dates 27 Nov, 4 Dec and 18 Dec, the same metric definitions as `cro/latest`, and the baseline by store, device, paid/non-paid and the nine products (20 Oct–18 Nov, with 19 Nov excluded). Only a few hours of post-publication data exist, so **no conclusion is drawn.**
5. **Catalogue:** of the 6 MERGE rows, 1 pair is a **likely duplicate**: Chesterfield Tufted and Chester Chesterfield use the same photo files and the same price ladder. The other rows are likely separate products or remain uncertain.
6. **Trust:** reviews are still 3 (2 product + 1 store). No dimensions or storage depth appear on the three ottoman pages. The Stone and Divan Base photos are unchanged. The Clearpay wording is still on every product page. Pages promise "3–5 working days", while two chased orders were told about 8 days.
7. **Kids range:** over 90 days the two kids beds had 439 UK human landings, 18 basket sessions and 2 orders (both Line Kids Velvet). 314 of the 439 landings came from free Google listings (`sag_organic`), which reached a basket only 1.3% of the time. Paid clicks reached a basket about 13% of the time but produced no checkout. The search intent behind these visits is UNKNOWN (no search terms are recorded).

## 1. Owner decisions (part 2)

Evidence sources: `ops/BRIEF.md`, the bottom of `ops/CHANGELOG.md`, the HQ `inbox` (11 docs) and `worklog` (643 docs, searched), and live checks made on 19 Nov at about 20:05 UK time (curl of the policies and 7 product pages, Shopify GraphQL for orders, media and Judge.me metafields, and openpyxl on the cost workbook).

| # | Decision | Status | Key evidence |
|---|---|---|---|
| 1 | Trading entity, VAT, Terms/footer | **COMPLETED** | Live Terms and Contact name ABBAS TRADE LTD, company 16410472; "Eagle bed ltd" no longer appears. VAT 520 9622 06 (owner). Still open: the registered office line is not on the site, and Shopify records £0 tax on every order |
| 2 | #1020 refund £273.59 | PENDING | Shopify: cancelled 23 Sep, still **PAID**, £0 refunded, PayPal |
| 3 | Cost sheet | PENDING | 0 of 831 rows filled (file unchanged since 16:35) |
| 4 | Gas Lift Divan Base opening | PENDING | Page says "end-opening"; options offer only "left side" / "right side" opening. **The 14 in height comes from the owner** but is not on the page |
| 5 | #1038 expectation check | PENDING | No owner note |
| 6–15 | Price truth and configuration (ottoman names, drawers default, running total, "from £X", hidden option prices, mattress tie, Ambassador colour, Grand height, size ladders, missing options) | PENDING | No CHANGELOG entry. Royal Chesterfield Super King is still £389.99, below King at £399.99 |
| 16 | 6 MERGE products | PENDING | Read-only analysis in §4 |
| 17 | Headboards | PENDING | 0 orders ever |
| 18 | Retire review after 18 Dec | PENDING | Default holds: nothing has been retired |
| 19 | Clearpay | PENDING | Wording is live on all 7 pages fetched; 0 Clearpay payments ever |
| 20–22 | Ads Products export, `utm_content` test, brand exclusion | PENDING | None supplied or approved |
| 23 | Inventory rule | PENDING | No answer |
| 24 | Dimensions | PENDING (partial) | Base height 14 in from the owner; nothing on the pages |
| 25 | Photos for Divan Base (open) and Stone | PENDING | Divan Base still has 4 media files and Stone 6. Stone's 3 product photos are WhatsApp images dated Feb 2025 |
| 26 | Review requests | PENDING | Precedent: 24 Google review requests were sent on 10 Nov (owner approved). Judge.me still has 3 reviews |
| 27 | Mattress price list | PENDING | No answer |
| 28 | #1016 Northern Ireland, £0 delivery | PENDING | Shopify: shipping £0.00, NIR postcode, delivered 25 Sep |
| 29 | Remove the £300 placeholder cost | NOT APPLICABLE | Depends on real costs existing |

The owner decision request (`owner-decision-request.md`) has 10 questions: #1020 refund, Gas Lift opening, putting the 14 in on the page, 5 key cost cells, Clearpay on/off, the delivery promise, #1016, the Ads Products export, the Line Bumper/Cloud Teddy price display, and the Christmas cut-off date. There is also one optional VAT-scheme question for the accountant.

## 2. Profit engine and break-even ROAS (S5-2, part 6)

### 2.1 What exists

| Input | Value | Label |
|---|---|---|
| Owner cost workbook | 0 of 831 cost rows; delivery, labour and packaging cells empty | VERIFIED |
| HQ `costs/*` before this task | 0 documents | VERIFIED |
| VAT | Registered; website prices include 20%; ex-VAT revenue = price ÷ 1.2 | VERIFIED (owner); scheme not yet stated by the accountant |
| Payment fees | 2.70% of money taken incl. VAT = about **3.24% of ex-VAT revenue** (cards 2% + 25p, Amex 3.1% + 25p, Klarna 4.99% + 30p VERIFIED; PayPal 2.9% + 30p ESTIMATE) | VERIFIED / ESTIMATE mix |
| Real-order ROAS, 90 days | £5,402.42 ÷ £2,312.62 = **2.34** on VAT-inclusive value = **1.95** on ex-VAT value | ESTIMATE (HISTORICAL, Stage 4) |
| Non-brand ROAS, 90 days | about **1.52** incl. VAT (1.27 ex VAT) | ESTIMATE (HISTORICAL) |
| 30-day ROAS | 3.69 incl. VAT (7.70 conversions; small sample) | ESTIMATE (HISTORICAL) |
| Ad cost per real Ads order | 90d £165.19 (14 orders); non-brand £244.09 (9); 30d £104.36 | ESTIMATE |

### 2.2 HQ structure written

- `costs/schema` (v1) defines:
  - **fields:** productId, variantId, size, materials, labour, packaging, delivery per drop, assembly labour, other variable, status, evidence, updatedAt, enteredBy;
  - **statuses:** A Verified actual · B Supplier quotation · C Owner estimate · D Modelled estimate · E Unknown;
  - **the rule:** only A, B or C count towards coverage, and D is never used for a profitability claim;
  - **the HQ calculation:** ex-VAT revenue, fees, contribution, margin, break-even ROAS, maximum CPA, contribution after ads;
  - **the 15 first cells to fill.**
- `costs/status` (v1): coverage 0%, 0 of 763 variants, 0 of 68 add-ons, plus a note.

### 2.3 The formulas (VAT confirmed)

- Google conversion value **V** = order total incl. VAT.
- Ex-VAT revenue **R** = V ÷ 1.2.
- Contribution before ads **C** = R − (product + add-ons + packaging + delivery + assembly labour if sold + payment fees + other variable).
- Contribution margin **m** = C ÷ R.
- **Break-even ROAS (on Google's value) = V ÷ C = 1.2 ÷ m.**
- **Maximum affordable CPA = C per order** = m × (average order value incl. VAT ÷ 1.2).
- Target ROAS for a profit share **p** of contribution kept after ads = 1.2 ÷ (m × (1 − p)).

### 2.4 Worked table: ILLUSTRATIVE margins only (these are not Eagle Bed's margins, which are UNKNOWN)

The maximum CPA uses the last-30-day average order value of £428.60 incl. VAT (£357.17 ex VAT, VERIFIED).

| Illustrative margin m (ex VAT, before ads) | Break-even ROAS on Google value (1.2 ÷ m) | Break-even ROAS ex VAT (1 ÷ m) | Maximum CPA per order (m × £357.17) | Real 90d ROAS 2.34 would be… |
|---|---|---|---|---|
| 20% | 6.00 | 5.00 | £71.43 | loss-making |
| 30% | 4.00 | 3.33 | £107.15 | loss-making |
| 40% | 3.00 | 2.50 | £142.87 | loss-making |
| 50% | 2.40 | 2.00 | £178.58 | just below break-even |
| 60% | 2.00 | 1.67 | £214.30 | above break-even |
| 70% | 1.71 | 1.43 | £250.02 | above break-even |
| 80% | 1.50 | 1.25 | £285.74 | above break-even |

The real ROAS figures imply these break-even margins (ESTIMATE, arithmetic only):

| ROAS (incl. VAT) | Margin needed to break even (1.2 ÷ ROAS) |
|---|---|
| 90-day real orders, 2.34 | 51.3% |
| Non-brand, 1.52 | 78.9% |
| 30-day, 3.69 (small sample) | 32.5% |

The margin is capped by fees: m can never exceed about 96.8% (100% − 3.24%), even before any product or delivery cost.

**Verified break-even ROAS: UNKNOWN.** What is needed to unlock it (`missing-costs.md` §3):

1. VAT status: answered YES on 19 Nov.
2. Delivery cost per drop.
3. Assembly labour.
4. Mesh Metal Ottoman.
5. PayPal rate.
6. 60" headboard.
7. Memory mattress 4ft6.
8. Footend Lift.
9. Ottoman Base King.
10. Ottoman Base Super King.
11. Cloud Teddy King.
12. Solid Board.
13. Savoy King.
14. Pillow Top King.
15. Side Lift Small Double.

Together with the 9 P1 products' size rows, these cover 17 of 34 orders (46% of 90-day revenue). The minimum first step is the 5 cells in owner question 4, which would give a first ESTIMATE-grade break-even for the two ottoman bases. **No profitability claim is made.**

## 3. Measurement programme (S5-1, part 10)

HQ `cro/programme` (v1) was written.

**Periods:**

| Period | Dates | Notes |
|---|---|---|
| POST | 20 Nov–17 Dec | Measurement window |
| PRE-A | 20 Oct–18 Nov (30 days) | Main baseline; 19 Nov, the publication day, is excluded |
| PRE-B | 22 Oct–18 Nov | Same length as POST |
| PRE-C | 24 Sep–21 Oct | Trend check |

**Read-outs:** 27 Nov (guardrails only), 4 Dec (directional), 18 Dec (final).

**Metric definitions** are copied from `cro/latest`:

| Metric | Definition |
|---|---|
| Population | UK human sessions |
| Add-to-cart rate (ATC) | cart sessions ÷ sessions |
| Basket → checkout | reached checkout ÷ cart sessions |
| Completion | completed ÷ reached checkout |
| Completed-checkout rate | completed ÷ sessions |
| Conversion | all orders ÷ sessions |
| Revenue per session | net sales ÷ sessions |
| Product funnels | landing-page attribution only |

Note: `cro/latest` counted 1,377 sessions because it included part of 19 Nov; the programme uses 1,360.

**Segments:** before/after; paid (`utm_medium = cpc`) vs non-paid; mobile/desktop/tablet.

**Store baseline, 20 Oct–18 Nov (VERIFIED, ShopifyQL):**

| Segment | Sessions | Carts | Checkouts | Completed | ATC | Basket → checkout | Completion |
|---|---|---|---|---|---|---|---|
| Store | 1,360 | 164 | 45 | 12 | 12.1% | 27.4% | 26.7% |
| Mobile | 1,143 | 134 | 36 | 11 | 11.7% | 26.9% | 30.6% |
| Desktop | 199 | 26 | 9 | 1 | 13.1% | 34.6% | 11.1% |
| Paid (cpc) | 852 | 92 | 15 | 6 | 10.8% | 16.3% | 40.0% |
| Non-paid | 508 | 72 | 30 | 6 | 14.2% | 41.7% | 20.0% |

Store orders were 16, with net sales of £6,857.57 (VAT-inclusive), revenue per session of £5.04, and EAGLE10 used on 13 of the 16 orders.

**Nine-product baseline:** landing sessions / carts / checkouts / completed, then product orders from any landing (file `product-funnel-baseline.csv`, which also splits paid and mobile):

| Product | Landings | Carts | Checkouts | Completed | Product orders / net |
|---|---|---|---|---|---|
| Grand Extra-Tall | 112 | 16 | 1 | 0 | 1 / £539.97 |
| Line Ambassador | 89 | 12 | 1 | 0 | 0 |
| Line Bumper | 81 | 13 | 1 | 0 | 0 |
| Ottoman Gas Lift Divan Base | 78 | 5 | 2 | 2 | 4 / £1,399.65 |
| Side Lift Ottoman Storage Base | 62 | 7 | 3 | 1 | 4 / £1,080.48 |
| Royal Chesterfield | 55 | 10 | 2 | 1 | 1 / £629.96 |
| Cloud Teddy | 22 | 7 | 3 | 0 | 2 / £977.39 |
| Savoy | 19 | 6 | **9** | 1 | 1 / £823.48 |
| Stone | 6 | 2 | 1 | 0 | 0 |

Savoy shows 9 checkouts from 6 baskets, which points to checkout probing on 15–17 Nov. Exclude it from rate judgements.

**Confounders to report alongside every read-out:**
- **Black Friday (27 Nov) and Cyber Monday (30 Nov)** fall only in POST. Compare rates, not volumes, and report 26 Nov–2 Dec separately.
- **EAGLE10** was used on 81% of baseline orders. Track its share and log any new promotion.
- **The Christmas delivery cut-off** (date UNKNOWN, asked in owner question 10) may pull orders forward and then stop them in mid-December.
- PMax spend of £25/day, with every change dated.
- Product fixes, each measured from its own change date.
- Bot traffic and checkout probing.

**Claim rules:**
- No claim before 18 Dec.
- A store-level claim needs ≥ 1,000 sessions and ≥ 100 cart sessions in POST.
- A product-level claim needs ≥ 100 POST landings.
- Every result is DIRECTIONAL.

Post-publication data on 19 Nov evening amounts to hours only, with 0 orders since publication at the time of the check. **No conclusion.**

## 4. Catalogue focus: the 6 MERGE rows (S5-6)

The comparison used Shopify GraphQL titles, descriptions, media file names and price ladders, read-only. The images themselves could not be opened, because this container cannot download from cdn.shopify.com, so they were judged by file name and source.

| Row | Compared with | Titles / descriptions | Photos | Price ladder S/SD/D/K/SK | Likely duplicate? |
|---|---|---|---|---|---|
| Chesterfield Tufted Bed | Chester Chesterfield Bed | Both "deep-button tufted" headboard, solid frame. Copy is near-identical apart from "Chester style" and a different fabric list | **The same 3 WhatsApp source photos (IMG-20251021-WA0022/28/29)** on both; only the AI front image differs | Identical: £324.99/350.99/363.99/389.99/415.99 | **YES (likely)** |
| Chester Chesterfield Bed | Chesterfield Tufted Bed | as above | as above | as above | **YES (likely)**; same pair |
| Aurora Luxury Vertical Panel | Aurora Vertical Panel | Luxury says it is "the deeper-filled version of the standard Aurora" with thicker foam and heavier fabrics | Different photo sets (files 166–177 vs 106–115) | Same except King: £493.99 vs £489.99 | **NO**: a deliberate upgrade of the same design. Could become one listing with a "deep fill" option (owner choice). Luxury still lacks the normal option set (approval 15) |
| Aurora Vertical Panel | Aurora Luxury | as above | as above | as above | **NO** (as above) |
| Hampton Panel Bed | Elegant Panel Bed (KEEP, sold) | Both short-headboard vertical panels. Hampton is "shorter than Aurora or Monarch"; Elegant has "simplified construction" | Different photo sets (116–125 vs 49–57) | Same except King: £351.99 vs £349.99 | **UNCERTAIN**: same positioning and near-same price. The owner should say whether the workshop builds them differently. Hampton had 1 landing in 90 days |
| Mayfair Ottoman Storage Bed (End-Opening) | Mayfair Ottoman Divan Bed (and Mayfair Bumper Ottoman) | Both "Mayfair headboard + end-opening gas lift base" | Different AI-generated sets. They share a spec screenshot (Screenshot_2025-12-22_161449), but **the same screenshot also appears on Stone**, so it proves nothing | **Different ladders:** £363.99–£597.99 vs £337.99–£519.99 | **UNCERTAIN, leaning YES** (same described product at two prices). Owner to say whether the headboards differ. If they do not, the two prices for one bed are themselves a problem |

**Headboard question for the owner (approval 17):** there are 17 standalone headboards, with 213 landings and 0 orders ever, and no delivery option on them. Choose STANDALONE (we add a delivery choice), OPTION ONLY (sold only as an upgrade on beds, with the listings kept for search), or LATER (decide after 18 Dec). RECOMMENDATION: LATER, because the theme read-out comes first.

**25 CONSIDER RETIRING frames:** reviewed only after the 18 Dec read-out. Nothing changes before then.

## 5. Trust and proof (S5-7)

| Item | Status 19 Nov (live) | Label | Owner ask |
|---|---|---|---|
| Reviews | **3 total** (Side Lift 1, Cambridge Storage 1, store 1), average 5.0. Only Side Lift shows a review count in its page data | VERIFIED | Approve a review-request batch for orders delivered after 3 Nov (genuine, no incentives) |
| Ottoman dimensions / storage depth / lift height | **Not on** the Gas Lift Divan Base, Side Lift or Line Bumper pages (Side Lift lists mattress sizes only). The owner has stated base height 14 in (Gas Lift, King) | VERIFIED | Q3: approve "14 in"; measure storage depth and overall height (approval 24) |
| Gas Lift opening | Text says end; options say left/right side | VERIFIED | Q2 |
| Stone photos | 6 media; 3 product photos are WhatsApp images (Feb 2025, about 1,000 px); unchanged | VERIFIED | Approval 25 |
| Divan Base photos | 4 media; none shows the base open from the end; unchanged | VERIFIED | Approval 25, after Q2 |
| Clearpay wording | **Still present**: "Spread the cost with Klarna or Clearpay at checkout" and "Pay with Klarna or Clearpay" on all 7 product pages fetched. 0 Clearpay payments ever (HISTORICAL, Stage 1) | VERIFIED | Q5 |
| Delivery promise | Pages say "Free delivery within 3–5 working days" plus a dated estimate ("Delivered 22 Nov – 24 Nov" for an order today). Two chased orders (#1038, #1040) were told about **8 calendar days**. Real lead time is UNKNOWN because no delivery dates are recorded | VERIFIED (wording) / ESTIMATE (8 days) | Q6; record real delivery dates |

## 6. Kids range (S5-8)

Window: 90 days, 21 Aug–18 Nov. UK human sessions. VERIFIED (ShopifyQL).

| Source | Mini Line Wingback Kids: landings / carts / checkouts / completed | Line Kids Velvet: landings / carts / checkouts / completed |
|---|---|---|
| Google free listings (`product_sync`, `sag_organic`) | 185 / 2 / 0 / 0 | 129 / 2 / 0 / 1 |
| Google Ads (`cpc`, PMax/Shopping) | 50 / 7 / 0 / 0 | 45 / 6 / 0 / 0 |
| Direct, no UTM | 7 / 0 / 0 / 0 | 14 / 1 / 1 / 1 |
| ChatGPT, Facebook, other | 0 | 9 / 0 / 0 / 0 |
| **Total** | **242 / 9 / 0 / 0** | **197 / 9 / 1 / 2** |
| Device | 227 mobile, 14 desktop | 183 mobile, 13 desktop |

Notes on the figures:
- Line Kids Velvet product orders: 2 in this window (#1007 on 21 Aug, 2 × Single, £561.59, no referrer; and #1018 on 15 Sep, Small Double, £505.98 incl. add-on, via search). Stage 4 counted 1 because its window starts on 22 Aug.
- Mini Line Wingback Kids: 0 orders ever.
- Cancelled orders: none involve these products.
- The "completed" column counts sessions, not product orders, so it is MATCHED WITH ATTRIBUTION LIMITATIONS.

**Prices against size** (both beds identical, VERIFIED):

| Size | Price |
|---|---|
| Kids Single 2ft6 | £285.99 |
| Single 3ft | £311.99 |
| Small Double 4ft | £350.99 |

The kids Single (£311.99) costs about the same as an adult frame Single (for example Grand Extra-Tall Single £312.99). The kids frame is a plain slatted frame with no storage and no guard rail. Competitor kids price points are **not in the Stage 1 or Stage 3 files**: UNKNOWN, and no OpenRush credits were spent to find them.

**Page readiness** (Stage 3, HISTORICAL): both pages score 71 with priority P1. Missing items are reviews (0), a dimensions table, and a mobile layout issue that the 19 Nov theme fix addresses. They have 5+ photos and the descriptions are adequate.

**Search intent clues:**
- No `utm_term` is recorded, so the landing search terms are UNKNOWN.
- The only known term is "side guard bed", the PMax search behind #1018 (Line Kids, HISTORICAL, Stage 4 `04-ads-products.md`).
- 72% of landings are cheap free-listing clicks that convert to a basket at 1.3%. Paid clicks convert to a basket at 13–14% but have produced no checkout in 90 days.

**Hypotheses (unverified):**

| | Hypothesis |
|---|---|
| H1 | Free-listing visitors are browsing broadly (image-led Shopping), not shopping for this bed. The low basket rate reflects intent, not the page |
| H2 | Parents compare against cheaper mass-market kids beds. An upholstered kids Single at about the price of an adult frame loses at the basket, where the price rises with options |
| H3 | Some searchers want safety features (side guards, low height, a storage drawer) that these frames do not offer or do not state ("side guard bed" is the only term seen) |
| H4 | The non-standard 2ft6 "Kids Single" mattress size raises a question the page does not answer (which mattress fits?) |
| H5 | Reviews and dimensions are missing, as on every page (store-wide) |

**Read-only recommendations:**
1. Get the PMax search terms and the Products export (owner question 8) and tag kids-intent terms before changing anything.
2. Add a dimensions table and the frame height (owner to measure), and state clearly what the bed does not have (no guard rail) or what it can have, if the workshop can add one.
3. Answer "which mattress fits 2ft6" on the page.
4. Keep both beds as TEST/IMPROVE until 18 Dec. No price change is proposed (the owner sets prices, and costs are UNKNOWN).
5. Do not add kids ad spend: there have been 0 paid checkouts in 90 days.

## Limitations

- The HQ worklog and inbox were searched by keyword. An owner decision given only by phone or WhatsApp would not appear in them.
- A #1020 refund made directly in PayPal would not show in Shopify.
- Product funnels are measured by landing session; ShopifyQL has no per-product cart data.
- ROAS figures are from Stage 4 (HISTORICAL ESTIMATE). Google Ads was not re-queried.
- Duplicate judgements are based on file names and text; the images themselves were not viewed.
- Baseline totals differ slightly from `cro/latest` (1,360 vs 1,377 sessions) because 19 Nov is excluded here.
- Kids search intent is UNKNOWN: no `utm_term` data.
- Every margin in §2.4 is illustrative. Eagle Bed's margins are UNKNOWN.

## Credits used

- **OpenRush: 0** (describe_capabilities and list_connections were not called either). Month total unchanged at 92 / 2,001; reserve untouched.
- **Shopify (read-only):** 4 GraphQL queries (the 8 MERGE-related products; reviews metafields; orders #1016/#1020/#1038/#1040; Stone and Divan Base media) and 12 ShopifyQL queries.
- **HQ (ArtifactData):** reads of `cro/latest`, `costs` (empty), `cro/programme` (absent), `inbox` (11 docs) and `worklog` (643 docs). One atomic batch write: `costs/schema` v1, `costs/status` v1, `cro/programme` v1.
- **Live site:** 11 page fetches with curl from www.eaglebed.co.uk.
- **Files written:**
  - `ops/rocket/stage5/03-decisions-profit-measurement.md`
  - `ops/rocket/stage5/owner-decisions.csv`
  - `ops/rocket/stage5/owner-decision-request.md`
  - `ops/rocket/stage5/product-funnel-baseline.csv`
- Nothing was committed.
