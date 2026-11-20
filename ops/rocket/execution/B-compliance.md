# EXEC B-compliance: Batley, orthopaedic claims, "mainland" (20 Nov 2026)

Owner approval: 20 Nov 2026 in chat ("Yes abc" to option B: remove "Batley" 3 times from /pages/beds-west-yorkshire, the 10 live descriptive "orthopaedic" health claims, and the 6 live "mainland" sentences). Source list: `pack-B-compliance.csv` (live rows only). Writes were made with Shopify Admin GraphQL (`pageUpdate`, `collectionUpdate`, `productUpdate`) at about 16:48-16:51 UTC. Nothing was committed.

## Done (9 items, 19 CSV rows)

### (a) Batley: page `beds-west-yorkshire` (gid://shopify/Page/723354288459, published)
The CSV lists 3 visible mentions. The raw HTML had a 4th copy inside the FAQPage JSON-LD (the same FAQ answer), so I changed that too, keeping the schema in line with the visible text.

| Where | Old | New |
|---|---|---|
| H3 | `Beds in Batley and Mirfield` | `Beds in Mirfield` |
| Paragraph | `Batley and Mirfield are close neighbours of Dewsbury.` | `Mirfield is a close neighbour of Dewsbury.` |
| FAQ answer (visible) | `...Wakefield, Huddersfield, Batley, Mirfield and the rest of Great Britain.` | `...Wakefield, Huddersfield, Mirfield and the rest of Great Britain.` |
| FAQ answer (JSON-LD) | the same sentence | the same fix |

The title, handle, published state and all other text are unchanged. The page names no other new town or area.

### (b) Orthopaedic descriptive claims (the 10 HIGH-legal live rows)
The product name "Memory Orthopaedic Mattress" / "Memory Orthopaedic" was kept everywhere: product title, SEO title and description, table cell, links, and the FAQ question. No word was swapped for another health or support claim. The words "support" and "supportive" were removed where they came with the claim.

Collection `mattresses` (gid://shopify/Collection/682715414859), 3 rows:

| Field | Old | New |
|---|---|---|
| descriptionHtml | `Choose pocket sprung, memory foam, orthopaedic or pillow top` | `Choose pocket sprung, memory foam or pillow top` |
| descriptionHtml (types list) | `<strong>Orthopaedic</strong> — a firmer, more supportive feel.` | `<strong>Firm</strong> — a firmer feel.` (the link to the Memory Orthopaedic Mattress is kept) |
| seo.description | `Mattresses UK: pocket sprung, memory foam, orthopaedic, pillow top, ... Klarna and Clearpay available.` | **final:** the Pack A approved meta `Pocket sprung, memory foam and pillow top mattresses, Single to Super King, with a 5-year guarantee. Free GB delivery. Pay with Klarna or PayPal.` (see the conflict note below) |

The SEO title and the rest of the description text are unchanged. Clearpay wording in descriptionHtml is untouched.

**Conflict with EXEC A (resolved).** The A-seo agent wrote the Pack A meta to this collection at about the same time. My collectionUpdate (16:48:52 UTC) sent seo.description from my earlier read with only "orthopaedic" removed, and that overwrote Pack A's text (A-seo.md, "CONFLICT" section). Pack A's approved meta also contains no "orthopaedic", so at about 16:53 UTC I restored it with `collectionUpdate(seo:{title, description: <Pack A proposed_meta>})`. The live `<meta name="description">` on /collections/mattresses now shows the Pack A text. The Manager can drop A-seo.md's follow-up to re-run that write. Rollback for this field belongs to Pack A (`backups/A-seo/`), not to B.

Product `memory-orthopaedic-mattress-uk` (gid://shopify/Product/15524052795723, ACTIVE), descriptionHtml only, 7 rows covering 5 places:

| Old | New |
|---|---|
| `...Mattress pairs an orthopaedic support core with a memory foam comfort layer` | `...Mattress pairs a firm core with a memory foam comfort layer` |
| `<h3>What is an orthopaedic mattress?</h3><p>An orthopaedic mattress is a firmer mattress built around a supportive core. The Eagle Bed Memory Orthopaedic adds...` | `<h3>How does it feel?</h3><p>The Eagle Bed Memory Orthopaedic adds...` (the unsupported definition sentence is deleted and the heading is neutral) |
| `<h3>Orthopaedic or pocket sprung: which one?</h3>` | `<h3>Firm memory foam or pocket sprung: which one?</h3>` |
| `<li>Orthopaedic support core</li>` | `<li>Firm core</li>` |
| FAQ: `It has an orthopaedic support core with a memory foam comfort layer` | `It has a firm core with a memory foam comfort layer` |

The title, SEO, prices, size table, the "not a medical device" disclaimer and the Clearpay line are unchanged. One existing table cell, "Firm support core with a memory foam top", was not one of the 10 rows, so it was left as it is.

### (c) "mainland" → "England, Scotland and Wales" (6 ACTIVE products, seo.description only)
Each change: `free UK mainland delivery` → `free delivery across England, Scotland and Wales`. The SEO titles are unchanged. Nothing else was edited.

| Handle | New SEO description (length) |
|---|---|
| aria-pleated-velvet-bed | `...Single to Super King, free delivery across England, Scotland and Wales, 5-year warranty.` (175) |
| nimbus-puffer-headboard-bed | `...Handmade to order, free delivery across England, Scotland and Wales, 5-year warranty.` (169) |
| rainbow-upholstered-kids-bed | `...Single to Super King, free delivery across England, Scotland and Wales.` (169) |
| seraphina-scalloped-velvet-bed-frame | `...free delivery across England, Scotland and Wales, 5-year warranty, free fabric swatches.` (175) |
| soho-smart-ottoman-bed-with-bluetooth-speakers-usb-charging | `...Handmade to order, free delivery across England, Scotland and Wales.` (163) |
| windermere-velvet-sleigh-ottoman-bed | `...Handmade to order, free delivery across England, Scotland and Wales.` (163) |

Note: the new descriptions are 163-175 characters, so Google may cut them off after about 155. Pack A or a later SEO pass can shorten them.

## Verified
- GraphQL mutations returned no userErrors. The re-read after the writes shows the new values, every status still ACTIVE, the page still published, and the handles and titles unchanged.
- Diff old (backup) vs new: a character-level diff shows only the targeted phrases changed on each item (page: 4 Batley spots; collection descriptionHtml: 2 spots; product: 5 spots; 6 SEO descriptions: one phrase each). The collection SEO description ends as the Pack A text (see the conflict note above).
- Live storefront, curled at 16:51 UTC:
  - `/pages/beds-west-yorkshire` returned 200. The new body is present verbatim. grep -i finds batley 0, orthop 0, mainland 0.
  - `/products/memory-orthopaedic-mattress-uk.json` body_html is identical to the intended new HTML. On `/collections/mattresses.json` the description is identical too. On the product page grep -i finds batley 0 and mainland 0. The remaining "orthop" hits are all the product name, URL, theme JSON, variant option labels "Memory Orthopedic Mattress", and an image alt text (see follow-ups).
  - The 6 "mainland" products return **404** on the storefront. They are ACTIVE but not published to the Online Store (`onlineStoreUrl` null, `publishedAt` null), so I verified them by GraphQL re-read only. The new text applies wherever they are published later.

## Rollback
The backups are in `ops/rocket/execution/backups/B-compliance/`:
- `page-beds-west-yorkshire.json` → `pageUpdate(id, page:{body: <backup body>})`
- `collection-mattresses.json` → `collectionUpdate(collection:{id, descriptionHtml, seo:{title, description}})`
- `product-memory-orthopaedic-mattress-uk.json` → `productUpdate(product:{id, descriptionHtml})`
- `product-<handle>.json` (6 files) → `productUpdate(product:{id, seo:{title, description}})`

## Skipped (out of scope, owner decisions)
- **Clearpay**: 346 rows, including the whole `finance-options` section. Is Clearpay really live? (It also still appears on the pages and items edited here.)
- **Product name "Memory Orthopaedic Mattress"**: 115 name references (title, SEO title and description, cross-links on 99 products, collection link). The owner will choose a new name. This also covers the 3 MED rows on the `handmade-in-dewsbury` (2) and `press-and-media` (1) pages ("memory orthopaedic mattresses"), plus the product's image alt text ("...orthopaedic memory foam mattress, studio product photo") and the variant option labels "Memory Orthopedic Mattress" (product-options app).
- **"solid wood frames"**: 117+ active products, plus 14 collections and 2 pages. Needs owner confirmation.
- **Blog articles**: not yet scanned for these phrases (e.g. a "...vs Orthopaedic" title, several "best" titles).
- The 84 "mainland" rows on drafts and hidden pages, and the 36 LOW rows, were not part of this approval.
