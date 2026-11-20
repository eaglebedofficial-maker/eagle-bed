# EXEC A-seo: SEO titles/meta descriptions + sitemap hide (20 Nov 2026)

Owner approval: chat 20 Nov 2026, "Yes abc" to pack A (33 title/description changes on 23 products + 10 collections, hide 2 thin pages from Google's sitemap). Source: `pack-A-seo.csv`. Nothing committed.

## Done
- **31 of 33 rows applied** (21 products via `productUpdate(product:{id, seo})`, 10 collections via `collectionUpdate(collection:{id, seo})`; schema input is `collection:`, not `input:`). All 31 had still_valid = Y and banned_check = PASS, and a GraphQL re-read immediately before writing matched `current_title`/`current_meta` exactly. 0 userErrors. Only `seo.title`/`seo.description` touched: no handles, prices, status, descriptions.
- **Sitemap hide**: `metafieldsSet` seo.hidden = 1 (number_integer) on `/collections/new-trending` (697411043659, metafield 203405332808011) and `/collections/frontpage` (682286973259, metafield 203405332840779). Neither had a seo.hidden metafield before.
- Backup (every old seo value for all 35 items + prior metafield state = none): `backups/A-seo/A-seo-before-2026-11-20.json`.

## Skipped
| handle | why |
|---|---|
| chesterfield-upholstered-bed-frame | conditional row, waits on approval 16 (duplicate decision); left unchanged per task |
| gold-v-cross-line-upholstered-bed | conditional row, waits on F4 (metallic strip paid option?); left unchanged per task |

No row was skipped for a pre-write mismatch.

## Applied
| type | handle | title | new seo title | verified |
|---|---|---|---|---|
| product | panel-line-border-upholstered-bed | changed | Panel Line Border Upholstered Bed Frame | Eagle Bed | OK |
| product | square-panel-upholstered-bed-frame | changed | Square Panel Bed Frame | Upholstered Headboard | Eagle Bed | OK |
| product | ottoman-gas-lift-divan-base | kept | Ottoman Divan Bed Base with Gas Lift Storage | Eagle Bed | OK |
| product | indigo-line-upholstered-bed-frame | changed | Indigo Line Bed | Upholstered Panel Bed Frame | Eagle Bed | OK |
| product | 3000-pocket-sprung-mattress-uk | changed | 3000 Pocket Sprung Mattress UK | All Sizes | Eagle Bed | OK |
| product | stone-upholstered-bed-frame | kept | Stone Premium Bed | Upholstered Bed Frame | Eagle Bed | OK |
| product | line-kids-upholstered-bed | changed | Line Kids Velvet Bed | Upholstered Kids Bed | Eagle Bed | OK |
| product | side-lift-ottoman-gas-lift-storage-bed | changed | Side Lift Ottoman Base | Gas Lift Storage Base | Eagle Bed | OK |
| product | oxygen-upholstered-bed-frame | kept | Oxygen Luxury Bed | Upholstered Bed Frame | Eagle Bed | OK |
| product | mirror-strip-sunrise-upholstered-bed-frame | changed | Mirror Strip Sunrise Bed | Upholstered Bed Frame | Eagle Bed | OK |
| product | level-lines-upholstered-bed-frame | changed | Level Lines Bed | Horizontal Line Upholstered | Eagle Bed | OK |
| product | multi-mini-line-luxury-upholstered-bed | changed | Multi Mini Line Luxury Bed | Upholstered Frame | Eagle Bed | OK |
| product | tower-upholstered-bed-frame | kept | Tower Bed | Tall Headboard Bed Frame | Eagle Bed | OK |
| product | curved-wingback-upholstered-bed-frame | kept | Curved Wingback Bed | Upholstered Bed Frame | Eagle Bed | OK |
| product | princess-luxury-upholstered-bed-frame | kept | Princess Luxury Bed | Upholstered Bed Frame | Eagle Bed | OK |
| product | mini-line-luxury-upholstered-bed | kept | Mini Line Luxury Bed | Upholstered Bed | Eagle Bed | OK |
| product | line-ambassador-upholstered-bed-frame | changed | Line Ambassador Bed | Upholstered Panel Bed | Eagle Bed | OK |
| product | star-upholstered-bed-frame | kept | Star Unique Bed | Upholstered Panel Bed | Eagle Bed | OK |
| product | pillow-top-mattress-uk | changed | Pillow Top Mattress UK | Single to Super King | Eagle Bed | OK |
| product | mini-line-wingback-kids-bed | changed | Mini Line Wingback Kids Bed | Upholstered | Eagle Bed | OK |
| product | grand-luxury-upholstered-bed-frame | changed | Grand Luxury Bed | Large Upholstered Bed Frame | Eagle Bed | OK |
| collection | storage-beds | changed | Storage Beds UK | Drawer & Lift-Up Storage Beds | Eagle Bed | OK |
| collection | ottoman-beds | changed | Ottoman Beds UK | Gas Lift Storage Beds | Eagle Bed | OK |
| collection | wingback-beds | changed | Wingback Beds UK | Upholstered Wingback Frames | Eagle Bed | OK |
| collection | divan-beds | changed | Divan Beds UK | Upholstered Divans with Storage | Eagle Bed | OK |
| collection | chesterfield-beds | kept | Chesterfield Beds UK | Chesterfield Bed Frames | Eagle Bed | OK |
| collection | divan-ottoman-beds | changed | Ottoman Divan Beds UK | Gas Lift Divan Storage | Eagle Bed | OK |
| collection | small-double-ottoman-beds | changed | Small Double Ottoman Beds 4ft | Gas Lift | Eagle Bed | OK |
| collection | mattresses | kept | Mattresses UK | Pocket Sprung & Memory Foam | Eagle Bed | title OK; description OVERWRITTEN by concurrent B-compliance write (see below) |
| collection | upholstered-beds | kept | Upholstered Beds UK | Handmade Bed Frames | Eagle Bed | OK |
| collection | panel-beds | kept | Panel Beds UK | Upholstered Panel Bed Frames | Eagle Bed | OK |

(All 31 descriptions changed. "kept" = proposed title equal to the old title, so only the description changed.)

## CONFLICT: collections/mattresses description
My write succeeded (mutation returned the new description), but a GraphQL re-read minutes later showed a different description: `Mattresses UK: pocket sprung, memory foam, pillow top, Single to Super King. Free delivery across Great Britain, Klarna and Clearpay available.` (collection updatedAt 2026-11-20T16:48:52Z). This is the OLD meta with only "orthopaedic" removed, i.e. the concurrent **B-compliance** agent (backup `backups/B-compliance/collection-mattresses.json`) wrote seo.description from its own earlier read and overwrote pack A's text. The A title is still live. I did **not** re-write it, to avoid a ping-pong with B. Manager follow-up: the live text still says "Clearpay" (unconfirmed, banned until owner confirms). To restore the approved pack-A meta, re-run once B is finished:
`collectionUpdate(collection:{id:"gid://shopify/Collection/682715414859", seo:{description:"Pocket sprung, memory foam and pillow top mattresses, Single to Super King, with a 5-year guarantee. Free GB delivery. Pay with Klarna or PayPal."}})`

## Verification
- GraphQL re-read of all 33 rows + 2 hidden collections: 30/31 applied rows match proposed exactly; mattresses = conflict above; the 2 conditional products are unchanged; both seo.hidden metafields = "1".
- Live curl (`<title>` and `<meta name="description">`) on 6 pages, all served the new values: products/panel-line-border-upholstered-bed, products/side-lift-ottoman-gas-lift-storage-bed, products/pillow-top-mattress-uk, collections/storage-beds, collections/ottoman-beds; collections/mattresses showed the A title + the B-overwritten description.
- Sitemap: `sitemap.xml` -> `sitemap_collections_1.xml?from=682286973259&to=710502580555` now lists 24 collections and **neither new-trending nor frontpage** (both were present in PREP). Shopify picked it up immediately; Google will drop them on its next sitemap fetch. Both pages still carry `noindex, follow` and return 200 (unchanged).

## Rollback
- SEO: for any item, run `productUpdate(product:{id, seo:{title, description}})` / `collectionUpdate(collection:{id, seo:{title, description}})` with the `seo` values in `backups/A-seo/A-seo-before-2026-11-20.json` (same as the CSV current_* columns).
- Sitemap: `metafieldsDelete(metafields:[{ownerId:"gid://shopify/Collection/697411043659", namespace:"seo", key:"hidden"}, {ownerId:"gid://shopify/Collection/682286973259", namespace:"seo", key:"hidden"}])`.

## Owner / Manager follow-ups
- Decide approval 16 and F4, then apply the two conditional rows.
- Mattresses collection meta conflict with B-compliance (above), plus the Clearpay mention.
- Rankings can move for a few weeks after snippet changes; check Search Console CTR on these 31 URLs in ~4 weeks.
