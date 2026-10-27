---
name: bed-cgi
description: Generate ultra-realistic, branded CGI views of Eagle Bed products (foot end, left side, right side, headboard close-up, ottoman open) from the product's own photos and add them to the Shopify product before the fabric guide. Use for CGI images, multi-angle product images, room scenes, lifestyle shots, "make images for every product", or when the Daily Autopilot / Eagle Bed HQ asks for the next CGI batch.
---

# Bed CGI

Every live upholstered product (not mattresses, not drafts) gets a set of CGI views that keep the bed identical to its real photos, styled in a realistic UK bedroom, branded Eagle Bed, and placed in the gallery **before** the Eagle Bed fabric guide, which always stays the last image.

## Engines

Pick the first that is available:

1. **Gemini** (`GEMINI_API_KEY` set in the environment): fast, full resolution, local branding. Paid per image (check Google's pricing page), so only use it when the owner has added the key.
2. **Canva** (connected Canva account, free within the owner's Canva Pro AI allowance): one image at a time; on `quota_cooldown` stop the batch, record progress and resume next run. Never retry in a loop.

If neither works, report it and stop. Never fake or reuse another product's images.

## Views per product

Generate in this order (skip a view the product already has as a good real photo):

| Key | View | Aspect |
|---|---|---|
| `foot` | Straight on from the foot end, centred, eye level | 1:1 |
| `left` | Three-quarter from the left, full side profile | 1:1 |
| `right` | Three-quarter from the right, full side profile | 1:1 |
| `head` | Headboard close-up showing stitching and fabric texture | 1:1 |
| `open` | Ottoman beds only: base lifted open showing storage | 1:1 |

Prompt template (fill `{VIEW}` from the table and `{DETAILS}` with the real headboard style, fabric, colour, footboard, legs and trims from the product title and description):

> Ultra-realistic high-end CGI interior photograph of the exact bed shown in the reference images, {VIEW}. Keep the bed identical to the references: {DETAILS}, same fabric texture, colour, proportions and legs. Luxurious modern UK master bedroom, warm greige walls, light oak floor, matching bedside tables with brass lamps, crisp white bedding with a soft throw, soft natural window light, realistic soft shadows. Magazine-quality interior photography, 35mm lens (85mm for close-ups), perfectly sharp, no text, no logos, no people.

Kids beds: bright child's bedroom, soft pastel walls, tidy toys. Keep bedding neutral so the frame stays the hero. Use up to 3 of the product's existing photos as references (front first) for fidelity.

## Workflow for one product

1. Read the product (`mcp__Shopify__graphql_query`): title, description, productType, media (ids, urls, alt). Skip mattresses and drafts.
2. References: import 2–3 product photo URLs into the engine (Canva: `upload-asset-from-url`).
3. Generate each view (Canva: `generate-image` with `imageReferences`, then `get-generate-image-job`).
4. **Fidelity check** (mandatory): compare each result with the reference photos. Reject and regenerate once if the headboard shape, panel/pleat pattern, colour, footboard, trims or legs changed. If it fails twice, skip that view and log it. Never publish a render that misrepresents the product.
5. **Brand**: Gemini path — run `python3 tools/brand_image.py <in> <out>` (adds a small "EAGLE BED" corner mark and © Eagle Bed copyright metadata). Canva path — add the same corner mark as text in the export design before exporting. Never put marks on the first (main) product image: Google Shopping disapproves watermarked main images.
6. **Upload to Shopify** (full resolution only, never the chat preview):
   - local file: `stagedUploadsCreate` (IMAGE, POST) → `curl -F` each parameter then `file=@<path>` to the target → `fileCreate` with `originalSource` = `resourceUrl`;
   - public export URL (Canva): `fileCreate` with `originalSource` = that URL.
   Alt text: `<Product name> in <colour>, <view> view, Eagle Bed handmade upholstered bed`. Filename: `<handle>-<view>.jpg`.
7. Attach with `fileUpdate` `referencesToAdd: [productId]`, then `productReorderMedia` so the fabric guide (`gid://shopify/MediaImage/75026432098635`) is last again.
8. Log the product in `brand/cgi-progress.json` (`done`, `views`, `skipped`, `date`) and commit.

## Batches

Work through `brand/cgi-progress.json` in order, best sellers first. Canva: as many as the allowance gives per run (stop at the first cooldown). Gemini: up to 10 products per run. Report each batch to the owner with one image per product and the product links.

## Fabric guide

`brand/eagle-bed-fabric-guide.jpg` (made by `tools/make_fabric_chart.py` from `brand/fabrics.json`) is Shopify file `gid://shopify/MediaImage/75026432098635`. New upholstered products get it with one `fileUpdate referencesToAdd`. If the fabrics change, edit `fabrics.json`, rerun the script and replace the file with `fileUpdate originalSource` so every product updates at once.

## Rules

- Only real facts about the bed; CGI must match the real product.
- Do not delete or reorder the owner's existing photos except to keep the fabric guide last.
- Ask the owner before removing images or changing the main image.
