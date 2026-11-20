# Feed 404 check: do ad feeds point at dead product pages? (20 Nov 2026)

READ-ONLY check. Nothing changed in Shopify, Meta, Google Ads or the theme. Not committed.
Data: `feed-404-check.csv` (257 rows, one per Shopify product).

## Answer
**0 feed products return 404.** The Google Shopping/PMax feed and the Meta catalogue hold the same 145 products, and all 145 live pages return HTTP 200. The 112 products that return 404 (the ~120 in D3.md) are **not in either feed**, so no ad money is reaching dead pages.

| Check | Result |
|---|---|
| Shopify products (all statuses) | 257: 187 ACTIVE, 70 DRAFT |
| On Online Store (live URL) | 145 (all ACTIVE) |
| On Google & YouTube channel | 145, exactly the same 145 as Online Store |
| On Facebook & Instagram channel | 145, the same 145 |
| ACTIVE but on no sales channel | 42 (not on Online Store, Google, Meta, TikTok or Pinterest) |
| DRAFT | 70 (on no channel) |
| Products in a feed whose page returns 404 | **0** |
| Products not in a feed whose page returns 404 | 112 (42 ACTIVE + 70 DRAFT), as expected |

## Sources and method
1. **Shopify Admin GraphQL** (3 pages, 257 products): `status`, `handle`, and `publishedOnPublication` for Online Store, Facebook & Instagram, Google & YouTube, TikTok and Pinterest. Every product on Google or Meta is also on Online Store; no product is on an ad channel without being on Online Store.
2. **Meta catalogue** "Shopify Product Catalog" 1311394936570400 (business Tech ABA, checkout URL www.eaglebed.co.uk): 767 items in 149 product groups. 145 groups are Eagle Bed products, the same handles as the 145 live Shopify products. All are `in stock` and `published`. The other catalogue the login can see (1138454554959873, business Legend Beds) holds legendbeds.co.uk products, not Eagle Bed, so it was not checked further.
3. **Google Ads** account 1980382450, read-only GAQL `shopping_performance_view`, last 30 days (Zapier API request; Supermetrics returned "trial expired" and was not used; 0 OpenRush units used). **145 distinct products** got impressions, every one of them a live Shopify product (matched by product ID against the public `/products.json`). No product item ID points to a draft or unpublished product.
4. **curl** of all 257 product URLs at `https://www.eaglebed.co.uk/products/<handle>`: 145 return 200 (all feed products), 112 return 404 (none in a feed).

## Ad exposure
- **Exposure on dead pages: £0.** No impressions, clicks or spend on any 404 product.
- PMax shopping placements, last 30 days: 78,388 impressions, 1,021 clicks, £622.94 across the 145 live products, plus £0.33 not tied to a product. All of it reached 200 pages.
- Top spend (all 200 OK): Grand Extra-High Vertical Panel £78.10 (175 clicks); Line Ambassador £72.75 (94); Line Bumper Ottoman Divan £70.29 (110); Side Lift Ottoman Storage Base £66.05 (78); Ottoman Gas Lift Divan Base £51.50 (79).
- Meta: all campaigns paused (ROADMAP 19 Nov), so the catalogue has £0 current exposure.

## Other findings (not 404s)
1. **4 stray non-Eagle Bed items still in the Eagle Bed Meta catalogue**: `styleaba.com/products/hismile-fast-whitening-bundle`, `teeth-whiteniing-strips`, `hismile-teeth-whitening`, `hismile-v34-teeth` (teeth-whitening products from another store, `in stock`, `published`). This was flagged on 10 Nov (CHANGELOG) and has not been fixed. These URLs could not be tested here because the sandbox proxy blocks styleaba.com. If a Meta catalogue (Advantage+ / DPA) campaign is switched back on, these could show next to Eagle Bed products. **Suggested fix (owner, in Commerce Manager):** delete the 4 items or remove their data source from catalogue 1311394936570400, or exclude them with a product set filter (domain contains eaglebed.co.uk).
2. **42 ACTIVE products are on no channel at all**: the kids range (14, including Rainbow and Cloud), the divan/storage-drawer range (18), and 10 others (Luxury Chesterfield, Modern Wide Vertical Panel, Luxury Fluted Wingback with footboard, Seraphina, Aria, Soho Smart, Duchess, Windermere, Nimbus, Hybrid mattress). They make no money and cost nothing. **Suggestion only:** if the owner wants them sold, publish to Online Store first, then add Google & YouTube and Facebook & Instagram, in that order, so no feed ever points at a 404.
3. **70 DRAFT products** (scout ideas, mostly without prices): leave as they are. Shopify will not send them to any feed while they are drafts.

## Guard for the future
The current set-up is safe because the Google and Meta channel lists match the Online Store list exactly. The risk only appears if a product is added to Google & YouTube or Facebook & Instagram while it is still off the Online Store, or is changed back to DRAFT after it has been in a feed. Re-run this check after any bulk publish or unpublish.
