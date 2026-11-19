# Owner request: Google Ads product export (and one optional tracking test)

Prepared 19 Nov 2026 by the Google Ads specialist, Rocket Stage 5. **Nothing has been changed in Google Ads.** This is a request, not an approval.

## Why we need this

We do not know what Google spends on each product. Our tools (OpenRush) can read campaigns, search terms, devices and networks. They cannot read the product (listing group) report.

So **per-product spend, clicks, impressions, conversions and ROAS are UNKNOWN** for all 145 products. The per-product spend figures in `ads-product-attribution.csv` are session-share **ESTIMATES**. They are there only to rank products. Do not use them as costs.

One export from you, about 5 minutes, replaces every one of those estimates with real numbers.

## Export 1 (needed): Performance Max product report

Account: **198-038-2450**. Campaign: **Eagle Bed | PMax | All Products**.

1. Sign in at ads.google.com and open account 198-038-2450.
2. In the left menu, click **Campaigns**. Then click the campaign name **Eagle Bed | PMax | All Products**.
3. In the left page menu, click **Products**. In some layouts it sits under "Campaigns" → **Products**, or under the **Insights and reports** group as "Products".
   - **If you cannot find it:** go to **Insights and reports → Report editor**. Choose **Shopping** as the type and add the dimension **Item ID**.
4. Set the date range (top right) to **Custom: 21 Oct 2026 – 19 Nov 2026**, which is the last 30 days.
5. Click the **Columns** icon and make sure these columns are shown:
   - **Item ID**
   - **Title** (product title)
   - **Impr.** (impressions)
   - **Clicks**
   - **Cost**
   - **Conversions**
   - **Conv. value**
   - Optional, if offered: CTR, Avg. CPC, Conv. value / cost
6. Remove any filter so that **all items** are listed, including those with 0 conversions.
7. Click the **Download** icon and choose **.csv**. Save the file as `pmax-products-last30.csv`.
8. Change the date range to **Custom: 22 Aug 2026 – 19 Nov 2026**, which is the last 90 days. PMax started on 5 Sep, so this covers its whole life. Download it again as `pmax-products-last90.csv`.
9. Optional: download the same two ranges for the paused **Eagle Bed | Shopping | UK** campaign. Name the files `shopping-products-last30.csv` and `shopping-products-last90.csv`. This shows where the £616.62 of Shopping spend went.
10. Put the files in the shared folder, or attach them to the HQ "Owner uploads" item. Do not email customer data.

**File format:** CSV, one row per Item ID. Item IDs look like `shopify_GB_<product id>_<variant id>`. We map them back to products ourselves.

## Export 2 (helpful, 2 minutes): search term categories

In the same campaign, open **Insights** and find **Search term insights**. Set the range to the last 90 days. Download the **search category** table as CSV, with the columns category, impressions, clicks, conversions and conv. value.

This shows what share of PMax spend goes to "eagle bed" brand searches that our report cannot see.

## Optional test (PROPOSAL only, needs your YES): product ID in paid links

**Goal:** have each PMax visit tell Shopify which product was advertised. Product-level ad results would then appear in Shopify every day, without exports.

**Current state:** PMax visits arrive tagged `utm_campaign=pmax_all_products&utm_content=sag_organic`. The `sag_organic` part comes from the Shopify feed link. VERIFIED from order journeys (#1027–#1033, #1042).

**Proposed change**, for one campaign only:

1. Go to Campaign **Eagle Bed | PMax | All Products** → **Settings** → **Campaign URL options** (or "Additional settings → Campaign URL options").
2. **Before changing anything, copy the exact current "Final URL suffix" text into a note.** This is your rollback.
3. Add `&utm_term={product_id}` to the end of the existing suffix.
   - We suggest `utm_term` rather than `utm_content`. The feed link already carries `utm_content=sag_organic`, and a second `utm_content` may be ignored.
   - If you prefer the Stage 2 wording, use `utm_content={product_id}`. The 1-day check below will tell us whether it survives.
4. Save. Do not change budget, bidding, assets or listing groups.

**1-day check (we do this, read-only), on the day after the change:**
- We run Shopify analytics: sessions where `utm_campaign = pmax_all_products`, grouped by landing page and `utm_term` (or `utm_content`).
- **Pass:** at least 80% of PMax product-page sessions carry an item ID that matches the landing product.
- **Fail:**
  - the text `{product_id}` arrives literally, or
  - the parameter is missing, or
  - PMax sessions drop by more than half against the previous day, or
  - Google shows an ad disapproval.

**Rollback:** paste the saved original suffix back into the same field and save. It takes about 1 minute, and nothing else is affected.

**Risks:**
- Google may briefly re-review ads after a URL setting change.
- Google documents `{product_id}` for Shopping ads. Its support inside PMax must be confirmed by this test.
- No cost and no budget change.

**Approval needed:** owner YES. This is Stage 4 question 21 and Stage 2 item U21. **Status: NOT approved, NOT implemented.**
