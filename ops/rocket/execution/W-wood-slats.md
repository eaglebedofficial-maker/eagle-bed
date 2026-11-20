# EXEC W: "solid wood" -> "wooden" + wooden slatted base line (20 Nov 2026)

Owner approval: chat, 20 Nov 2026 ("all bed frame wood"; "every bed which is without storage or without drawers comes with a wooden slat and bed frame"; "do whatever is best for me ... please go"). "Solid" was never confirmed, so it is an overclaim.

STATUS: PARTIAL. Collections and pages are finished. 15 of 220 product writes are done. The other 205 product writes are prepared, backed up and ready to run (see "Resume" below).

## Why partial
`bulkOperationRunMutation` is blocked by the Shopify MCP safety policy. Every product description therefore has to be sent in full through `productUpdate`. That is about 560 KB of HTML (5 products per call, 2-6 min per call). It did not fit in one agent run. The work is split into 41 ready-made batch files, so several agents can finish it in parallel.

## Rules applied
- TASK 1: "solid wood/wooden/timber/hardwood" became "wooden" in product descriptionHtml and SEO title/description, collection descriptionHtml and page bodies. "sturdy hardwood frame" became "sturdy wooden frame", because hardwood is also unconfirmed. The table cell "Solid timber, upholstered headboard" became "Wooden frame, upholstered headboard". "100% solid wood frames" became "wooden frames". "built from solid timber" became "built from wood". Nothing else in the copy changed.
- Kept on purpose: in the generic buyer advice on /pages/uk-bed-buying-guide, "Solid timber is strong and can be repaired; some low-cost frames use particle board". It describes timber in general and makes no claim about Eagle Bed.
- TASK 2: products of type Bed Frame or Kids Bed with no ottoman, gas lift, drawer, storage or divan in the title or handle, and no "slat" anywhere in the description, get `<li>Comes with a wooden slatted base</li>` at the end of the Key features list. mirror-strip-sunrise has no list, so it gets `<p>Comes with a wooden slatted base.</p>` after the intro paragraph. 104 products qualify, and 92 of them also get TASK 1 changes in the same write.
- Skipped: memory-orthopaedic-mattress-uk and the mattresses collection (another agent owns them), all Headboard, Mattress, Ottoman Bed, Divan Bed and Storage Box products, and anything already mentioning slats.
- Nothing else was touched: no prices, variants, titles, handles, status, images or theme.
- Freshness: every product, collection and page was re-read just before writing. The latest product updatedAt was 16:49 UTC and no collection was changed after 20:00 UTC, so there was nothing to merge.

## Done (live, verified)
Collections (14), TASK 1: frontpage, upholstered-beds, ottoman-beds, divan-ottoman-beds, divan-beds, headboards, kids-beds, wingback-beds, chesterfield-beds, storage-beds, best-sellers, new-trending, panel-beds, storage-beds-with-drawers.
Pages (8), TASK 1: beds-london, beds-manchester, beds-birmingham, bespoke-beds-uk, about-us, handmade-in-dewsbury, beds-west-yorkshire, uk-bed-buying-guide.
Products (15, all ACTIVE): ambassador-upholstered-bed-frame, amber-sunrise-panel-bed-frame (+SEO), arizona-luxury-upholstered-bed-frame, aurora-geometric-panel-bed-frame, aurora-vertical-line-tufted-upholstered-bed, aurora-vertical-panel-luxury-bed, aurora-vertical-panel-bed (+SEO), black-bumper-upholstered-bed-frame, black-piping-upholstered-bed-frame, black-piping-luxury-upholstered-bed-frame, box-panel-upholstered, brooklyn-divan-upholstered-bed, bumper-ottoman-gas-lift-divan-bed and bumper-upholstered-bed-frame all got T1 only. aria-pleated-velvet-bed got T1+T2.
Full per-product list with task and DONE/PENDING: `ops/rocket/execution/W-products.csv` (220 rows).

## Pending (205 products: 138 ACTIVE, 67 DRAFT)
102 need T1 only, 91 need T1+T2 and 12 need T2 only. 6 still need an SEO description change (patti, sara-grand, florida-panel, aurora-sunrise-panel, royal-chesterfield-upholstered, sunburst-panel-kids). The payloads sit in batches b03-b40.

## Resume (any agent, same container)
For each `ops/rocket/execution/W-work/batches/bNN.json` from b03 to b40: re-read the products in that batch (updatedAt). If any changed after 2026-11-20T21:06Z, rebuild with `transform.py` (`wood()` + `add_slats()`) from the fresh HTML first. Then call `graphql_mutation` with query = the contents of `bNN.gql` and variables = the contents of `bNN.json`, and append "bNN done <time>" to `W-work/progress.txt`. b00-b02 are done. Batches can run in parallel. Backups for all 220 products are already in `backups/W/`. Verify: run a products query with `updated_at:>'2026-11-20T21:00:00Z'` (spilled to a file), then `python3 W-work/verify.py <file>`. A whitespace-only difference after `</li>` is Shopify normalising the HTML.

## Verification so far
- GraphQL re-read of the first 10 products matched the expected HTML (one whitespace-only `\n` difference from Shopify). All mutations returned 0 userErrors.
- curl of all 14 changed collections and 8 changed pages: 0 "solid wood/timber/hardwood" in the description or body text. The only remaining hit is the generic advice sentence kept on uk-bed-buying-guide.
- curl of 10 product pages: the descriptions now read "wooden frame". BUT the live HTML still contains "solid wood" from two sources this task may not touch:
  1. The theme accordion "The Eagle Bed promise" on every product page says "...using solid wood frames and premium upholstery...". This is LIVE THEME text, so it needs an owner or theme-copy change.
  2. Product image alt text such as "<Bed> - solid timber slatted base", where alt text was generated per image. Images were out of scope. Changing it is a follow-up (`productUpdateMedia` alt only).

## Unclear products / owner checks (Task 2)
- These are bed frames with "Optional ottoman gas-lift storage" mentioned in the copy, and the slat line was added to them (pending): chelsea-vertical-panel-bed-frame, kensington-chesterfield-bed-frame, mayfair-vertical-panel-bed-frame, monarch-contrast-frame-bed-frame, regal-gold-trim-vertical-panel-bed-frame, regency-vertical-panel-bed-frame, royal-chesterfield-wingback-bed-frame, valentina-double-arch-upholstered-bed-frame. Their variants are size only, so the product sold is the plain frame. If the owner prefers, change the line to "The standard frame comes with a wooden slatted base."
- pocket-headboard-bed (DRAFT) has fabric pockets in the headboard, not under-bed storage, and was treated as a plain frame. claridge-wraparound-bed-with-upholstered-bedside-tables (DRAFT) was also treated as a plain frame.
- Divan Bed products with no drawers in the copy (brooklyn-divan-upholstered-bed, divan-bed-with-footboard, multi-mini-line-divan-bed, small-line-divan-upholstered-bed) got no slat line, because divans were excluded.
- Seen but NOT changed (out of scope, existing issues): many descriptions say "Klarna or Clearpay" (Clearpay is unconfirmed per BRIEF), and haru-low-boucle-bed plus other drafts say "mainland UK".

## Rollback
Backups are in `ops/rocket/execution/backups/W/`: `product-<handle>.json` (220 files, full descriptionHtml and seo), `collection-<handle>.json` (14) and `page-<handle>.json` (8). To restore:
- products: `productUpdate(product:{id, descriptionHtml, seo:{title, description}})` with the values from the backup
- collections: `collectionUpdate(collection:{id, descriptionHtml})`
- pages: `pageUpdate(id, page:{body})`
