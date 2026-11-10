# Video SEO: YouTube Shorts, TikTok and product-page video

Drafted 10 Nov 2026. This is a plan only. Nothing has been posted, nothing in Shopify has changed, and Zapier was not used.
Files: `ops/seo-types/video.json` (data), `ops/seo-types/video-captions.diff` (patch for the caption builder, **not applied**).

## About the data

- **OpenRush returned "402 insufficient credits" for every call** today (Search Console, keyword volumes and the live SERP check). Because of that, the **UK volumes and the "does Google show video results" columns are empty**. They are not guessed. When the credits are topped up, run `research_keywords` and `inspect_serp` (United Kingdom, English) for the 40 keywords below and fill in the gaps.
- The Search Console figures below come from the voice agent's pull earlier today (`voice.json`: question-style queries, last 3 months). These are real impressions on our own site.
- Products, prices, fabrics and sizes come from `products.json` (145 published products) and read-only Shopify queries.

## 1. Keyword plan by bed type

| Type | Main keyword | 3 secondary keywords | UK volume | Video results | Our Search Console evidence (impressions, avg position) |
|---|---|---|---|---|---|
| Ottoman | ottoman bed | ottoman storage bed; king size ottoman bed; small double ottoman bed | not measured | not checked | how do ottoman beds work 128 (7.1); are ottoman beds better than divan beds 108 (7.7); divan vs ottoman 174 (18.4) |
| Gas lift | gas lift ottoman bed | gas lift bed; ottoman bed base; end opening ottoman bed | not measured | not checked | what is gas lift storage bed 69 (11.5); what does gas lift bed mean 37 (9.2); gas lift bed meaning 26 (11.5) |
| Velvet | velvet bed | velvet bed frame; fluted velvet bed; crushed velvet bed | not measured | not checked | only single-figure questions |
| Teddy bouclé | teddy bed | boucle bed; teddy boucle ottoman bed; boucle bed frame | not measured | not checked | none yet (we have 1 teddy product) |
| Chesterfield | chesterfield bed | chesterfield bed frame; button tufted bed; chesterfield divan bed | not measured | not checked | what is a chesterfield bed 122 (25.9) |
| Wingback | wingback bed | wingback bed frame; wingback headboard; king size wingback bed | not measured | not checked | only single-figure questions |
| Divan | divan bed | divan bed with drawers; divan bed with headboard; divan base | not measured | not checked | divan vs bed frame 190 (10.5); platform bed frame vs divan base 152 (7.8); what is a divan bed 126 (18.5) |
| Kids | kids bed | kids upholstered bed; children's single bed; kids single bed | not measured | not checked | none in the question list |
| Headboards | upholstered headboard | fabric headboard; headboard for divan bed; tall headboard | not measured | not checked | made-to-measure headboard cost 11 (2.0) |
| Mattresses | pocket sprung mattress | memory foam mattress; pillow top mattress; 3000 pocket sprung mattress | not measured | not checked | best pillow top mattress uk 14 (54.4); mattress sizes uk 8 (76.4) |

Notes:
- Each keyword matches real products. For example, "end opening" is the Mayfair end-opening ottoman, "crushed velvet" is a listed fabric, and "tall headboard" is the Camden 54" headboard.
- For mattresses, never add "orthopaedic" benefits or "best" to captions. Use the product name only.

## 2. Title, description and hashtag templates

**YouTube Shorts title (70 characters or fewer):** `{short product name}[ – {type keyword}] | Handmade in Dewsbury`
- The type keyword is added only when its words are not already in the name. Mattresses use "Made in the UK".
- If the title is over 70 characters, it ends with "| Eagle Bed" instead. If that is still too long, the suffix is dropped.
- `#shorts` moves from the title into the hashtags, which saves title space. YouTube detects Shorts from the vertical format anyway.

**YouTube description:**
```
[{type keyword}: ]{full product title}, handmade to order in our Dewsbury workshop. From £{price} with free
delivery across Great Britain, 14-day free returns and a 5-year frame warranty.

Shop: {product url}?utm_source=youtube&utm_medium=social&utm_campaign=hq_cinema_{0900|1800}&utm_content={type}
More {collection}: {collection url + same UTM}

Like and follow for a new bed every day, and tell us which colour you'd choose in the comments.

#shorts {3 type hashtags} #eaglebed
```
Mattresses say "made in the UK", "a 5-year guarantee", and ask about "size" instead of "colour".

**TikTok caption:** the same text, with the keyword first when it is missing from the title, then "Link in bio", then 5 hashtags (3 type hashtags + `#eaglebed` + `#handmadeinuk`; mattresses use `#madeinuk`).

| Type (code key) | Example YouTube title (from the patched code) | YouTube hashtags | TikTok hashtags |
|---|---|---|---|
| ottoman | Florida Ottoman Bed \| Handmade in Dewsbury | #shorts #ottomanbed #storagebed #gasliftbed #eaglebed | #ottomanbed #storagebed #gasliftbed #eaglebed #handmadeinuk |
| gaslift | Ottoman Gas Lift Divan Base – Gas Lift Ottoman Bed \| Eagle Bed | #shorts #gasliftbed #ottomanbed #storagebed #eaglebed | #gasliftbed #ottomanbed #storagebed #eaglebed #handmadeinuk |
| velvet | Fluted Velvet Bed \| Handmade in Dewsbury | #shorts #velvetbed #velvetbedframe #upholsteredbed #eaglebed | #velvetbed #velvetbedframe #upholsteredbed #eaglebed #handmadeinuk |
| teddy | Cloud Teddy Bouclé Ottoman Bed \| Handmade in Dewsbury | #shorts #teddybed #bouclebed #ottomanbed #eaglebed | #teddybed #bouclebed #ottomanbed #eaglebed #handmadeinuk |
| chesterfield | Royal Chesterfield Bed \| Handmade in Dewsbury | #shorts #chesterfieldbed #chesterfield #upholsteredbed #eaglebed | same minus #shorts, plus #handmadeinuk |
| wingback | Eagle Harlington Wingback Bed \| Handmade in Dewsbury | #shorts #wingbackbed #upholsteredbed #bedframe #eaglebed | same minus #shorts, plus #handmadeinuk |
| divan | Oxford Wingback Storage Bed with Drawers – Upholstered Divan Bed | #shorts #divanbed #storagebed #upholsteredbed #eaglebed | same minus #shorts, plus #handmadeinuk |
| kids | Line Kids Velvet Bed \| Handmade in Dewsbury | #shorts #kidsbed #kidsbedroom #upholsteredbed #eaglebed | same minus #shorts, plus #handmadeinuk |
| headboard | Haven Upholstered Headboard \| Handmade in Dewsbury | #shorts #headboard #upholsteredheadboard #bedroomdecor #eaglebed | same minus #shorts, plus #handmadeinuk |
| mattress | 3000 Pocket Sprung Mattress \| Made in the UK | #shorts #mattress #mattressuk #newmattress #eaglebed | #mattress #mattressuk #newmattress #eaglebed #madeinuk |
| upholstered (fallback) | Elegant Panel Bed – Upholstered Bed Frame \| Handmade in Dewsbury | #shorts #upholsteredbed #bedframe #bedroomdecor #eaglebed | same minus #shorts, plus #handmadeinuk |

I tested the builder on all 145 published products. The longest title is exactly 70 characters, and no caption contains a banned word ("mainland", "hotel", "best-selling", "leading", "award", "DivideBuy", "0%").

How the products split by type: upholstered 71, headboard 17, wingback 16, divan 10, chesterfield 7, ottoman 7, mattress 6, kids 6, gas lift 2, velvet 1, teddy 1.

### The patch (`ops/seo-types/video-captions.diff`)

The patch changes only `captions()` and three lines in `main()` of `tools/cinema/autovideo.py`. `git apply --check` passes, and applying it to a copy gives exactly the tested file.
- It adds `SEO_TYPES` (keyword, 3 hashtags and collection for each type), `seo_type(p)` and `with_keyword()`.
- The captions JSON gains `seoType`, `seoKeyword` and `hashtags`. `youtubeTitle` follows the template above.
- The YouTube description gains a collection link and `utm_content={type}`, so GA4 can show sales by bed type.
- Instagram and Facebook keep their current format.
- **It also fixes a real fact error:** today the mattress videos and captions say "handmade in our Dewsbury workshop" and "5-year frame warranty". All 6 mattress pages say "made in the UK" and "5-year guarantee", and none says Dewsbury. With the patch, mattress captions, the first on-screen line ("MADE IN THE UK") and the fact cards ("5-year guarantee") match the pages.
- The posting steps in the runbook need no change: Publer still uses `youtubeTitle` and `youtube`.

To apply, from the repo root: `git apply ops/seo-types/video-captions.diff`, then back up and log it in `ops/CHANGELOG.md`.

## 3. YouTube channel setup (owner does this in YouTube Studio)

**Channel description (877 characters):**
> Eagle Bed makes upholstered beds by hand in our own workshop in Dewsbury, West Yorkshire. Every bed is made to order on a solid wood frame: ottoman and gas lift storage beds, Chesterfield, wingback, panel and fluted beds, divan beds with drawers, kids beds and headboards. We also sell UK-made mattresses.
>
> New Shorts twice a day: a different real bed from our range each time, with the link to shop it.
>
> Fabrics include plush velvet, chenille, linen and teddy boucle in solid colours, stripes and two-tone. Free fabric swatches let you check the colour at home.
>
> Free delivery across Great Britain by our own team, usually in 3-5 working days. 14-day free returns. 5-year frame warranty (mattresses: 5-year guarantee). Pay by card, PayPal, Klarna or Clearpay.
>
> Shop: https://www.eaglebed.co.uk
> Call: 07417 439197 (Mon-Fri 9am-6pm)
> Instagram @eaglebed.co.uk | TikTok @eagle.bed

**Channel keywords:** Eagle Bed, upholstered beds, handmade beds UK, Dewsbury, ottoman bed, gas lift ottoman bed, storage bed, chesterfield bed, wingback bed, velvet bed, teddy boucle bed, divan bed, divan bed with drawers, kids bed, upholstered headboard, pocket sprung mattress, bed frame UK, king size bed, bedroom ideas.

**Playlists (6, by style):**
1. **Ottoman & Gas Lift Storage Beds** (types ottoman, gaslift, teddy): "Ottoman beds with gas lift storage, handmade to order in Dewsbury. The whole mattress platform lifts on gas struts to open the storage underneath. Free delivery across Great Britain." Link: /collections/ottoman-beds
2. **Chesterfield Beds**: "Button-tufted Chesterfield beds, upholstered by hand in our Dewsbury workshop on a solid wood frame." Link: /collections/chesterfield-beds
3. **Wingback Beds**: "Wingback beds with wrap-around headboard wings, handmade to order in Dewsbury in the fabric and colour you choose." Link: /collections/wingback-beds
4. **Panel, Fluted & Velvet Beds** (types velvet, upholstered): "Panel, fluted, channel and line headboard beds, in plush velvet and other fabrics. Free fabric swatches." Link: /collections/upholstered-beds
5. **Divan Beds with Drawers**: "Upholstered divan beds and storage beds with drawers, handmade in Dewsbury." Link: /collections/divan-beds
6. **Kids Beds**: "Upholstered kids beds, handmade to order in Dewsbury, in kids single, single and small double sizes." Link: /collections/kids-beds

Add a 7th playlist, "Headboards & Mattresses", once there are 3 or more of those Shorts. Publer does not add posts to playlists. The caption's `seoType` says which playlist a Short belongs in, so the owner (or a later weekly job) can add each Short in YouTube Studio.

**Channel trailer idea (30-40 s, vertical, from footage we already host):**
- Footage: the 4K Fluted Velvet Bed clip (9 Nov), the 4K Sussex Panel Storage Bed clip (10 Nov), `eb-short-handmade.mp4`, `eb-short-swatches.mp4` and `eagle-bed-free-delivery-short.mp4`.
- End on the Eagle Bed end card ("eaglebed.co.uk", "Like & follow for a new bed every day").
- On-screen lines: Handmade in Dewsbury / Free fabric swatches / Free delivery across Great Britain / New beds twice a day.
- Music: an Eagle Bed original from `tools/cinema/music`.
- Caveat: I could not watch the older clips, because this container cannot open cdn.shopify.com, so the owner should check them first. The cinema clips are AI-styled scenes made from our own photos, so the trailer must not suggest they were filmed in customers' homes.

## 4. Product-page video

**What blocks this now:** the live product template (`sections/eb3d-product.liquid`, theme 212291486027) shows only photos and 3D models. **If we add a video to a product, it will not appear on the page.** The owner needs to publish a small theme change first, made in an unpublished copy. Live-theme writes are the owner's job.

Suggested theme change: put this in `eb3d-product.liquid`, after the `eb3d-thumbs` block:
```liquid
{%- for m in product.media -%}
  {%- if m.media_type == 'video' -%}
    <div class="eb3d-pdp-video">
      {{ m | video_tag: controls: true, muted: true, playsinline: true, preload: 'none', image_size: '1400x' }}
      <p class="eb3d-pdp-video__note">Styled scenes made from our product photos</p>
    </div>
    {%- break -%}
  {%- endif -%}
{%- endfor -%}
```
`preload: 'none'` keeps the PageSpeed gains, and the main photo stays the first media item and LCP image.

**VideoObject:** add this only after the video shows on the page, inside the `eagle-product-schema` snippet. Because it is wrapped in a check, it only appears on products that have a video:
```liquid
{%- assign eb_video = nil -%}
{%- for m in product.media -%}{%- if m.media_type == 'video' -%}{%- assign eb_video = m -%}{%- break -%}{%- endif -%}{%- endfor -%}
{%- if eb_video -%}
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"VideoObject",
 "name": {{ product.title | append: ' video' | json }},
 "description": {{ product.description | strip_html | truncate: 300 | json }},
 "thumbnailUrl": {{ eb_video.preview_image | image_url: width: 1280 | prepend: 'https:' | json }},
 "uploadDate": {{ product.metafields.custom.video_upload_date | default: product.published_at | date: '%Y-%m-%d' | json }},
 "contentUrl": {{ eb_video.sources.first.url | json }},
 "duration": "PT{{ eb_video.duration | divided_by: 1000 }}S"}
</script>
{%- endif -%}
```
A plain-English caveat: Google now mostly shows video thumbnails for pages where the video is the main content, and a product page usually is not. So a product-page video mainly helps shoppers decide and may appear in Google's video tab. For "short videos" in normal search results, YouTube Shorts with the keyword titles above are the main route.

**Owner-approval list (Shopify product media from the CDN file URL):**

| Product | Type | Video we already have | Action |
|---|---|---|---|
| luxury-fluted-velvet-upholstered-bed-frame | velvet | Shopify Video `gid://shopify/Video/75361333576011` (READY) and the 4K file `eagle-bed-fluted-velvet-bed-4k_5d5d12dc-….mp4` | Attach as media position 2 (the Video already exists in Files, so no new upload is needed) |
| sussex-storage-panel-bed-frame | divan | `eagle-bed-sussex-storage-panel-bed-4k.mp4` (10 Nov) | `productCreateMedia` with originalSource = CDN URL, mediaContentType VIDEO |

**Next videos to make**, so every type has one (`autovideo.py --handle …`), then attach after approval: cloud-teddy-boucle-ottoman-gas-lift-storage-bed, florida-ottoman-gas-lift-divan-bed, mayfair-ottoman-gas-lift-divan-bed, ottoman-gas-lift-divan-base, royal-chesterfield-upholstered-bed, harlington-wingback-vertical-panel-bed-frame, oxford-divan-storage-bed-frame, line-kids-upholstered-bed, haven-upholstered-headboard, 3000-pocket-sprung-mattress-uk. These were picked to cover each type, not by sales.

Right now no product on the store has video media: I checked all of them. The older category clips (`eb-v-ottoman`, `eb-v-divan`, `eb-v-wingback`, `eb-v-mattress`, `eb-music-kids`, `eb-music-chesterfield`) suit the matching collection pages better than single products, once the owner has checked them.

## 5. Longer-video ideas (real facts only)

1. **Ottoman bed or divan bed? How a gas lift bed works.** Gas struts lift the whole mattress platform on a hinge, so you reach the storage without taking the mattress off. A divan is an upholstered box base, usually with drawers. The gas lift base starts at £220.99 in Single 3ft. Demand: "divan vs ottoman" 174 and "how do ottoman beds work" 128 impressions. Footage: the owner films a real lift in the workshop.
2. **What is a Chesterfield bed? Chesterfield, wingback and panel styles.** Button-tufted Chesterfield headboards, wingback side wings, and panel or fluted headboards, all fully upholstered on solid wood frames. The Chesterfield collection has 14 products and the Wingback collection 33. Demand: "what is a chesterfield bed" 122 impressions at position 25.9.
3. **UK bed sizes explained.** Single 3ft 90×190cm, Small Double 4ft 120×190cm, Double 4ft6 135×190cm, King 5ft 150×200cm, Super King 6ft 180×200cm. Kids Single is 2.6ft. Ends on a link to the bed sizes guide.
4. **Choosing your fabric.** Plush Velvet, Naples, Chenille, Linen, Crushed Velvet, Coniston, Galaxy and Teddy Bouclé, in solid colours, stripes or two-tone only, with free fabric swatches. Starts from `eb-short-swatches.mp4`.
5. **From our Dewsbury workshop to your door.** Built on solid wood frames and upholstered by hand, to order. Free delivery across Great Britain by our own team, usually 3-5 working days; Northern Ireland, Jersey, Guernsey and the Isle of Man £90. 14-day free returns (unused, unassembled, in the original packaging; we collect). 5-year frame warranty, or 5-year guarantee for mattresses. Klarna, Clearpay, card, PayPal or cash on delivery. Say "Dewsbury" only; no street or house details on camera.

## Side note for the owner

The product section's default settings and its hard-coded delivery-timeline footnote say "mainland UK", which is a banned term. The live page does not show it today (I checked the fluted velvet page), probably because the saved settings override the defaults and the timeline is switched off. Worth changing the defaults to "Great Britain" in the next theme copy.
