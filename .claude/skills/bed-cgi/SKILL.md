---
name: bed-cgi
description: Generate high-quality, photorealistic CGI lifestyle and product images of Eagle Bed beds and mattresses from reference photos, using the connected Canva image generator. Use when the user asks for CGI images, room scenes, lifestyle shots, product renders, new backgrounds, Instagram/website visuals, or "make images from this photo" for a bed, headboard, ottoman or mattress.
---

# Bed CGI

Turn a real product photo into photorealistic CGI scenes while keeping the bed itself faithful to the reference. Generation runs on Canva's image model through the Canva connector, so it works from the cloud with no GPU or API key.

## Tools

Load these with ToolSearch before the first call:
`mcp__Shopify__search_products`, `mcp__Canva__upload-asset-from-url`, `mcp__Canva__create-upload-url`, `mcp__Canva__generate-image`, `mcp__Canva__get-generate-image-job`.

If the Canva tools are missing, tell the user the Canva connector is not connected and stop; do not invent images.

## Workflow

1. **Get the reference image(s).**
   - Product named or "one of my beds": find it with `mcp__Shopify__search_products` and use `featuredMedia.preview.image.url`.
   - Public image URL: use it as given.
   - Chat attachment or local file: `create-upload-url`, then POST the raw bytes with `Content-Type: application/octet-stream`.
   Import URLs with `upload-asset-from-url` (name it `Eagle Bed - <product> (reference)`) and keep each returned media id. Use several angles of the same bed as separate references when available — fidelity improves.

2. **Pick the scene.** If the user gave none, default to set A below. For a batch, generate up to 4 different scenes, one job per scene.

3. **Write the prompt** from the template, filling in the product's real details (headboard style, fabric, colour, size) from the Shopify description:

   > Photorealistic high-end CGI interior render of the exact bed shown in the reference image, keeping its headboard design, stitching/panel details, fabric texture and colour, proportions and legs identical. Place it in {SCENE}. {LIGHT}. Shot at eye level, {LENS}, magazine-quality product photography, ultra detailed, realistic materials and soft shadows, no text, no logos, no people.

   Fidelity rules: always say "the exact bed shown in the reference image"; never ask for a different colour or design unless the user wants a variant; keep bedding neutral so the frame stays the hero.

4. **Generate** with `generate-image` (`imageReferences` = one MEDIA entry per reference). Aspect ratio by use:
   - Website product/collection: `SQUARE_1_1` or `LANDSCAPE_4_3`
   - Instagram feed: `PORTRAIT_4_5`; Reels/Stories/TikTok: `PORTRAIT_9_16`
   - Website hero / YouTube thumbnail: `LANDSCAPE_16_9`

5. **Collect results.** If no widget is shown, poll `get-generate-image-job` until SUCCESS or FAILURE. Show every image with its "Open generated image" link. On FAILURE report `failureType`/`failureMessage`; on a quota error, say the Canva AI allowance is used up.

6. **Check fidelity** before handing over: compare each result to the reference. Flag any image where the headboard shape, fabric colour, legs or details changed, and offer to regenerate it; never present a changed bed as the real product.

## Scene presets

- **A — Luxury UK master bedroom:** warm neutral walls, oak floor, bedside tables with brass lamps, white bedding and a textured throw; soft natural morning light; 35mm lens, shallow depth of field.
- **B — Studio cut-out:** seamless light-grey studio backdrop, soft box lighting, gentle floor shadow; 50mm lens. Good for marketplace listings.
- **C — Modern grey apartment:** charcoal panelled wall, concrete-look floor, minimalist decor, large window with city view at dusk; warm lamp light.
- **D — Cosy Scandinavian:** white walls, light wood, linen bedding, plants, wool rug; bright overcast daylight.
- **E — Boutique hotel suite:** dark moody walls, statement pendant lights, velvet accents, evening ambient light; 24mm wide lens.
- **F — Kids/guest room** (single and small double): soft pastel walls, playful but tidy decor, daylight.
- **G — Ottoman reveal** (storage beds): same as A, with the base lifted open showing the storage space.

## Notes

- Canva AI generation uses the connected Canva account's AI allowance; it is not unlimited.
- Generated images are saved in the user's Canva uploads, ready for designs, Instagram posts or Shopify.
- Do not upload generated images to Shopify products unless the user explicitly asks; CGI must not replace real product photos without approval.
