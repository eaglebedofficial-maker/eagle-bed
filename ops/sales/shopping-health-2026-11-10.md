# Shopping health check – 10 Nov 2026

Scope: Google free listings / Shopping (Google & YouTube channel) and the Facebook & Instagram shop for www.eaglebed.co.uk (Shopify 0whctf-mu).

## 1. Channel publishing (live products = ACTIVE + on Online Store, not tagged needs-pricing)

| | Before | After |
|---|---|---|
| ACTIVE products (all) | 187 | 187 |
| Live on Online Store | 145 | 145 |
| Live products also on Google & YouTube | 145 / 145 | 145 / 145 |
| Live products also on Facebook & Instagram | 145 / 145 | 145 / 145 |
| needs-pricing products on Online Store | 0 | 0 |

No publishablePublish was needed: every live product was already on both channels.

42 ACTIVE products are not on the Online Store (so not on Google/Meta either). They were left alone, as the rules say:
- 9 tagged `needs-pricing` (new designs, e.g. seraphina-scalloped-velvet-bed-frame, aria-pleated-velvet-bed, windermere-velvet-sleigh-ottoman-bed, soho-smart-ottoman-bed-with-bluetooth-speakers-usb-charging, hybrid-pocket-sprung-mattress-medium-firm).
- 33 others with no needs-pricing tag: Chesterfield, fluted and panel divan/drawer beds, wingback frames, and 12 kids beds (e.g. luxury-chesterfield-upholstered-bed, balmoral-chesterfield-wingback-divan-bed-with-storage, vertical-channelled-upholstered-kids-bed). The owner should decide whether to put these on the Online Store. Once they are on it, they should go to Google and Facebook too.

## 2. Product data quality (145 live products)

| Check | Before | After |
|---|---|---|
| Has image (min 2 media each) | 145 / 145 | 145 / 145 |
| Has description | 145 / 145 | 145 / 145 |
| Has product type | 145 / 145 | 145 / 145 |
| Vendor = "Eagle Bed" | 145 / 145 | 145 / 145 |
| SEO title present | 144 / 145 | 145 / 145 |
| SEO description present | 145 / 145 | 145 / 145 |
| Standard category set | 145 / 145 | 145 / 145 |

Categories found: 121 Beds & Bed Frames (including the Divan, Panel and Platform subcategories), 17 Headboards, 6 Mattresses, and 1 Ottomans (upholstered-ottoman-storage-box, which is correct for a storage box). No category changes were needed. No product has a £0 price.

### Changes made
- `luxury-geometric-upholstered-bed` (Prism Geometric Bed): the SEO title was empty, so it is now set to "Prism Geometric Bed | Angular Upholstered Bed Frame | Eagle Bed". The SEO description is unchanged. Backup: ops/backups/seo-luxury-geometric-upholstered-bed-2026-11-10.json.

No prices, drafts, themes or vendors were changed.

## 3. Meta catalog

- **Eagle Bed catalog:** "Shopify Product Catalog" 1311394936570400. Its owning business in Meta is named **"Tech ABA"** (498070783385123). It is connected to the Facebook & Instagram channel through a Shopify partner integration for store 0whctf-mu: status connected, last successful sync 9 Nov 2026 04:00 PT, next sync 10 Nov 20:21 PT, no fatal sync errors. The data source shows "error", which reflects item health (see below), not the connection.
- **Item count:** 767 items (variants). 763 are Eagle Bed, making up **145 product groups, which matches the 145 live Shopify products**.
- **4 items do not belong to Eagle Bed:** styleaba.com teeth-whitening products (HiSmile Fast Whitening Bundle, Teeth Whiteniing Strips, Hismile Teeth Whitening, HISMILE V34 TEETH). They are published and eligible.
- **Diagnostics:**
  - MUST FIX, Policy violation (PRODUCT_NOT_APPROVED / SHOPS_POLICY_VIOLATION), 3 items, Shops channel only: three variants of `memory-orthopaedic-mattress-uk` (Memory Orthopaedic Mattress, retailer ids 56499377832267, 56499377865035, 56499377897803). The likely trigger is the word "Orthopaedic", which Meta reads as a health claim. The page already says it is not a medical device. I made no Shopify change: renaming would change the product title and SEO, and that is the owner's call.
  - Opportunity: 62 items have fewer than 2 images and 60 have duplicate images. Every Shopify product has at least 2 images. These flags are per variant (the variant image repeats the main image), so they are not an error and there is no Shopify fix.
  - No missing-price or missing-image errors.
- **Second catalog:** 1138454554959873 ("Shopify Product Catalog", business "Legend Beds", legendbeds.co.uk, 151 products) is visible to this login but is not Eagle Bed's. Nothing was touched.

## 4. Owner actions

1. **Meta Commerce Manager, catalog 1311394936570400:** delete the 4 styleaba teeth-whitening items. They are not Eagle Bed products and are published in the shop catalog.
2. **Meta Commerce Manager:** for the 3 rejected Memory Orthopaedic Mattress variants, request a second review. If it is refused, decide whether to rename the product (for example "Memory Foam Firm Mattress") in Shopify. A rename changes the title and SEO, so it needs your approval.
3. **Meta Business settings:** the catalog's business is named "Tech ABA". Check that this is your own business account and rename it to Eagle Bed if you wish.
4. **Shopify:** decide on the 33 ACTIVE products that are not on the Online Store (list in section 1). Put them on the Online Store if they should be on sale, then add them to Google & YouTube and Facebook & Instagram.
5. **Google Merchant Center:** this tool cannot read Merchant Center diagnostics. Open Merchant Center → Products → Needs attention and check for disapprovals. All 145 products are published to the Google & YouTube channel with images, categories and descriptions.
