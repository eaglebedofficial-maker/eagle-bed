# EXEC M: mattress rename (20 Nov 2026)

Owner approval: chat, 20 Nov 2026 ("whatever you always suggest me that's from memory foam mattress do okay ... do it by yourself okay? Go ahead").
Rename: "Memory Orthopaedic Mattress" -> "Firm Memory Foam Mattress". Orthopaedic claims removed (banned).

STATUS: PARTIAL. The product, the mattresses collection and 9 pages are live and verified. Of the 89 other products whose descriptions link to the mattress, 10 are done and 79 are prepared but still pending.

## Done (live, verified by GraphQL read-back)
- Product gid://shopify/Product/15524052795723. Handle `memory-orthopaedic-mattress-uk` is unchanged.
  - Title: "Memory Orthopaedic Mattress – Firm Support Mattress UK" -> "Firm Memory Foam Mattress"
  - SEO title: "Firm Memory Foam Mattress | Eagle Bed" (37 chars)
  - SEO description: "Firm Memory Foam Mattress with a firm support core and memory foam layer, from £142.99. Free delivery across Great Britain, 5-year guarantee." (141 chars)
  - Description: 5 name references renamed ("Memory Orthopaedic" on its own became "Firm Memory Foam"). The description now contains 0 "orthopaedic".
- Collection `mattresses`: the link text in the "Firm" bullet was renamed. Its SEO had no mention.
- Pages (9):
  - bed-and-mattress-bundles. Also "memory foam over an orthopaedic support layer" became "memory foam over a firm support layer".
  - handmade-in-dewsbury, press-and-media and press: "memory orthopaedic mattresses" became "memory foam mattresses".
  - ottoman-bed-storage-guide, uk-bed-size-guide, single-beds-3ft-uk.
  - The unpublished drafts internal-email-drafts and internal-email-retention-playbook.
- Products (10 of 89, link text only): side-lift-ottoman-gas-lift-storage-bed, mirror-strip-sunrise-upholstered-bed-frame, mini-line-sunrise-upholstered-bed-frame, mini-line-wingback-kids-bed, line-kids-upholstered-bed, oxygen-upholstered-bed-frame, cloud-teddy-boucle-ottoman-gas-lift-storage-bed, line-ambassador-upholstered-bed-frame, panel-line-upholstered-bed-frame, divan-drawer-storage-base.

## Pending: 79 product descriptions
Each one links to the mattress with the old name as the anchor text, for example `<a href="/products/memory-orthopaedic-mattress-uk">Memory Orthopaedic Mattress</a>`. The only change is the anchor text, which becomes "Firm Memory Foam Mattress". The link still works.
The payloads are ready in `M-work/b02.*` through `b11.*`, and the handles are listed in `M-work/pending-handles.txt`.
Why it is pending: bulk mutations are blocked by the MCP, so every full description has to be sent through productUpdate. That is about 280 KB of HTML and did not fit in one agent run.
To resume: for each bNN from b02 to b11, first check that none of its products has updatedAt later than 2026-11-20T23:00Z. If one does, rebuild that product's description by replacing "Memory Orthopaedic Mattress" with "Firm Memory Foam Mattress" in the fresh HTML. Then call graphql_mutation with query = bNN.gql and variables = bNN.json. Add a line to M-work/progress.txt after each batch.

## Variant options
No product has a native Shopify option value that contains "Orthopaedic". None of the 90 matched products does, and the mattress itself only has a Size option. If beds offer a mattress choice through Easify or another app, those options are invisible to the Admin API. The owner needs to rename them in the app.

## Not changed (owner or later)
- Product tags on the mattress: "memory orthopaedic mattress uk" and "orthopaedic mattress". Tags were out of scope. Suggest removing them.
- Image alt text on the mattress, e.g. "Memory Orthopaedic Mattress orthopaedic memory foam mattress, studio product photo". Media was out of scope. Fix it with productUpdateMedia, alt only.
- Handle `memory-orthopaedic-mattress-uk` was kept as instructed. The URL still contains "orthopaedic".
- These are dated records and were left as they are: the internal-qa-register-30-sep-2026 and internal-competitor-matrix pages.
- mattress-guide page: the link text "Pocket sprung vs memory foam vs orthopaedic" names a blog article. Blog articles were not checked.
- Possible theme or app text, Google Shopping or Meta feed titles, and ads that still use the old name. None of these were checked.

## Rollback
Backups are in `backups/M/`:
- `mattress-before-2026-11-20.json`: use productUpdate with the title, descriptionHtml and seo.
- `collection-mattresses-before-2026-11-20.json`: use collectionUpdate(collection:{id, descriptionHtml}).
- `pages-before-2026-11-20.json`: use pageUpdate(id, page:{body}).
- `products-linking-before-2026-11-20.json`: use productUpdate with descriptionHtml.
