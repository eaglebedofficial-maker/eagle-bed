# EXEC D-ads: stop wasted Google Ads spend (PMax negatives)

20 Nov 2026, 03:15–03:35 UK. Account 198-038-2450. Tool: Zapier Google Ads "Make API Mutating Request" (already enabled; Google Ads API v23). OpenRush: 0 credits used. Zapier: 11 tasks (3 of them failed calls), logged in HQ usage/zapier-2026-11.

**Not touched:** budgets (PMax still £25/day), bids/bidding strategy, campaign status (PMax ENABLED, Search 24034402493 still PAUSED), brand ("eagle bed" not negated), search themes, assets, Shopify.

## 1. Done

**30 negative keywords added LIVE to the PMax campaign** "Eagle Bed | PMax | All Products" (24218981435), as campaign-level negative keywords. First a `validateOnly` dry run (no errors), then the live run (30 of 30 created), then a re-read: the campaign now has 45 negative keywords (15 old + 30 new), all ENABLED, and the campaign is still ENABLED.

| Group | Negatives (match) | Visible cost, last 30 days |
|---|---|---|
| Bargain / clearance | clearance, outlet, warehouse sale, discount code, pay weekly, cheap (phrase) | £6.15 (unique; "bed clearance outlet" matches two) |
| Not sold | toddler, bedding (phrase) | £2.95 |
| DIY / research / info | how to, bedroom ideas (phrase); super king size bed size (exact) | £6.85 |
| Store visit / non-UK | jysk, cama tapizada (phrase) | £2.61 |
| Other bed shops' names (exact only) | hale and hale, sosoftbeds, sosoft beds, moorcroft beds, pristine beds, zora beds, zora bed, living comfort bedz, bedscraft, style beds ltd, comforest, bedroomking, bedroom king, lorinza living, elgen beds, barron beds, hdbeds | £33.46 |
| **Total (56 search terms matched, 42 clicks, 0 conversions)** | | **£52.02** |

Full list with reasons, matched terms and criterion IDs: `ops/rocket/execution/D-ads-negatives.csv`.

**Safety checks:** none of the 56 terms that are now blocked had a conversion; no brand term is blocked. Terms deliberately **not** negated: "obs beds" (sold #1032; competitor names in general can convert, so I only negated exact store names with 0 sales), kids / side guard (#1018), TV bed (Kingston Ottoman TV Bed is sold), sleigh, mirror, drawers, memory foam (all sold: checked against live Shopify titles, 187 active products; no toddler, bunk, daybed, cot, sofa bed or bedding products exist), "near me" and town names (Stage 5 E1 says remove the local search themes first, and that is an owner decision), "assembly" terms (we sell assembly at £69.99).

## 2. Search terms analysed (VERIFIED, Google Ads API, PMax, last 30 days = 21 Oct–19 Nov)

- 1,000 rows returned (the cap), sorted by cost. 351 of them had any cost; the rest are £0, so every term that cost money was covered.
- Visible search-term spend **£379.07**, 550 clicks, 5.0 conversions (£1,989.29). PMax spends about £757 in 30 days (Stage 8 ESTIMATE), so about **50% of spend shows a search term**. The rest goes to hidden terms, Shopping/Display/YouTube placements and so on.
- Classification: BRAND 2 terms, £51.02, 3.0 conversions ("eagle bed", "eagle beds"). IRRELEVANT (now negated) 56 terms, £52.02, 0 conversions. RELEVANT / review 942 terms, £276.04, 2.0 conversions ("obs beds" £274.99; "double ottoman bed side opening" £256.50).
- Biggest relevant spenders with 0 conversions: ottoman beds £35.80, ottoman bed £14.91, side lift ottoman bed £8.66. These are relevant, so leave them. They point to the ottoman landing-page and price-truth fixes (Stage 5), not to negatives.
- Classified file: `ops/rocket/execution/backups/D-ads/pmax-search-terms-last30-classified.csv` (raw copy alongside).

## 3. Estimated monthly waste stopped (ESTIMATE)

- **Floor (visible only):** £52.02 in 30 days → £52.02 × 30.4 / 30 ≈ **£53 a month**.
- **Upper (scaled to hidden terms):** irrelevant share of visible spend = 52.02 / 379.07 = 13.7%. If the hidden half of search spend has the same share: 13.7% × ~£757 ≈ **£104 a month**. Hidden terms tend to be rarer long-tail searches, so the true figure is probably nearer the floor.
- **Range: about £50–£100 a month (about 7–14% of PMax spend). Use about £50 as the planning figure.**
- **This does not reduce total spend.** PMax is budget-limited at £25/day, so the money is spent on other searches instead (mostly relevant ones). The gain is better use of the same £25/day. It is not a saving on the bill.

## 4. Ads serving and billing

| Date | Impr. | Clicks | Cost | Conv. | Label |
|---|---|---|---|---|---|
| 17 Nov | 1,808 | 35 | £22.90 | 0 | VERIFIED |
| 18 Nov | 2,454 | 35 | £26.92 | 0 | VERIFIED |
| 19 Nov | 2,126 | 41 | £27.25 | 0 | VERIFIED (preliminary) |
| 20 Nov (to 03:29 UK) | 67 | 0 | £0.20 | 0 | VERIFIED |

- **Ads served yesterday (19 Nov, spend > 0) and are still serving today:** 67 impressions by 03:29, up from 18 at 01:00 (Stage 8). PMax primary status is LIMITED (budget). The campaign is not suspended.
- **Billing:** the API shows billing setup 8421488381 as **APPROVED** (payments account "Google Ads 198-038-2450", since 15 Jul). The API does **not** show whether the card was declined or whether a balance is due. The 19 Nov 22:36 decline (Visa ••0882, insufficient funds; Stage 8, from Gmail) is still **UNRESOLVED as far as we can see**. "Service may continue briefly" is consistent with ads still serving now. Status: **AT RISK**.

## 5. Rollback

In Google Ads, open the PMax campaign → Settings (or Tools → Negative keywords) → Negative keywords and remove any of the 30 keywords. Or use the API: `POST v23/customers/1980382450/campaignCriteria:mutate` with `{"operations":[{"remove":"customers/1980382450/campaignCriteria/24218981435~<criterion_id>"}]}`. The IDs are in the CSV and in `backups/D-ads/pmax-negatives-after-2026-11-20.json`; the before-state is in `backups/D-ads/pmax-negatives-before-2026-11-20.json`.

## 6. Owner follow-ups

1. **P0 billing:** Google Ads → Billing → Summary: check for a balance due. Then Billing → Payment methods: fund Visa ••0882 or add another card. If payment fails, PMax will stop.
2. **Check in 14 days (4 Dec):** Google Ads → Campaigns → PMax → Insights → Search terms. Look at whether any blocked theme is still appearing, and whether impressions dropped more than about 10% (not expected).
3. Still owner decisions, not done here: remove the local, negated-competitor and "eagle bed" search themes (Stage 5 E1/O6); whether to negate "near me"; brand exclusion (Stage 5 says keep brand); budget.
4. Optional: the Search-term insights export (category view) would show the hidden ~50%.
