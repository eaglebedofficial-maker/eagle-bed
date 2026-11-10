# Eagle Bed Cinema autopilot (twice daily, 09:00 and 18:00 UK)

Goal: every morning and evening post one professional, cinematic 4K vertical video of a DIFFERENT
real Eagle Bed product to Instagram (Reel), Facebook (Page video), YouTube (Shorts) and TikTok,
with the product link and a like/follow call to action. HQ: https://claude.ai/artifact/H8ECqvxQbUQSABuMUK1iki

Rules (from ops/BRIEF.md): only real products and real facts; no "hotel", "best-selling", "leading",
award or medical claims; music is only the Eagle Bed originals in tools/cinema/music; never fake a
post: record exactly what happened. Never change prices, ads or the theme in this job.

## Zapier budget (owner, 10 Nov 2026): 750 tasks a month, keep them for selling
- Before posting, ArtifactData `get` usage/zapier-YYYY-MM (UK month). count = tasks used so far.
  Safe per day = (750 - count - 40) / days left in the month (owner can change the cap in HQ: settings/main.zapierCap).
- A video costs 4 tasks: Instagram 1, Facebook 1, Publer upload 1, ONE Publer post for YouTube + TikTok together 1.
  If safe-per-day < 8, post the 18:00 video only (skip 09:00 posting; still save the video in HQ).
  If safe-per-day < 4, post to Instagram + Facebook only (2 tasks). If count >= cap - 10, post nothing; mark "saved, Zapier budget".
- After EVERY Zapier call that ran, add 1 to usage/zapier-YYYY-MM: ArtifactData `update` with count+1,
  days.<YYYY-MM-DD> +1, kinds.video +1 (read the doc first, pin if_version, retry once on conflict).
- Never retry a failed Zapier post more than once per run. Never use Zapier for reading data another connector has.

## Steps for one run (slot = 09:00 or 18:00, whichever is next)
1. **Switch check.** ArtifactData `get` settings/main on the HQ URL. If `autoCinema` is `false`, stop.
2. **Already made?** ArtifactData `query` collection `videos` where `autoCinema == true`. If a doc for
   today and this slot already has `status` "posted", stop. If one exists with a `url` and status
   "queued", skip to step 5 and post it.
3. **Make the video.** Build the exclude list from the `product` handles of autoCinema videos in the
   last 60 days (field `handle`, or the end of `productUrl`). Run:
   `python3 tools/cinema/autovideo.py --slot HH:MM --exclude h1,h2,... --out /tmp/cine`
   (needs GEMINI_API_KEY; about 3 minutes; prints JSON with the mp4 and captions paths).
   If Gemini fails twice, record `status: "failed"` with the error in a videos doc and stop.
4. **Host it.**
   a. Artifact tool: `publish` with `url` = HQ URL, `asset: true`, `file_path` = the mp4. Keep the id.
   b. Shopify `stagedUploadsCreate` with resource **FILE**, mimeType video/mp4, the exact fileSize,
      httpMethod POST. Save the stagedTargets entry as JSON and run
      `python3 tools/cinema/staged_upload.py target.json VIDEO.mp4`.
   c. Shopify `fileCreate` (originalSource = resourceUrl, contentType FILE). Query the GenericFile
      until `url` answers HTTP 200: that public cdn.shopify.com URL is the video URL (full 4K).
   d. ArtifactData `set` videos/<YYYY-MM-DD>_<HHMM>cine with: date, slot, title, product, handle,
      productUrl, images [], music, caption (= captions.instagram), facebookCaption,
      tiktokCaption, youtubeTitle, youtubeDescription, platforms ["YouTube Shorts","TikTok",
      "Instagram Reel","Facebook"], status "queued", render "done", aspect "9:16",
      resolution "2160x3840", source "Eagle Bed Cinema autopilot", assetId, assetUrl
      "/_blob/<id>", url (the CDN URL), autoCinema true, createdAt.
5. **Post** (Zapier; one call each; never retry a post that reported success):
   - Instagram for Business `publish_video`: instagramPageId 17841470771106154, video = url,
     caption = captions.instagram.
   - Facebook Pages `page_video` (create page video): page 466446689880866, title = product name,
     description = captions.facebook, source = url.
   - Publer (connection in ops/BRIEF.md): `upload_media` from the url (one call), then ONE create_post
     for both accounts YouTube 6ada6553da10209b23547110 and TikTok 6ada61643266bfdcc843c976
     (title = youtubeTitle, text = youtube caption; TikTok uses the same text), publish now.
   Update the videos doc: per platform `ig`, `fb`, `yt`, `tt` true/false, `status` "posted" if at
   least Instagram or Facebook went out, else "failed" with `error`. If Zapier says the task limit is
   reached, write that exact reason, set `status` "failed", and do not keep retrying this run.
6. **Monday 09:00 run only:** ArtifactData `get` growth/main, write its `questions` list to /tmp/questions.json, then run `python3 tools/aivis/check.py --prompts /tmp/questions.json --out /tmp/aivis.json` and
   ArtifactData `set` aivis/latest from it (fields at, date, model, asked, named, cited, topSources,
   rows[prompt, named, cited, sources, answer]) so HQ shows how often AI assistants recommend Eagle Bed.
   Also refresh the Google page-1 tracker: OpenRush get_search_performance (last_28_days, group_by query, limit 1000,
   compare_to none), match growth/main.keywords and ArtifactData `set` seo/ranks {at, period, rows[q,pos,imp,clk]}.
6b. **Monday 09:00 run only: one Google Business Profile post** (1 Zapier task; skip if safe-per-day < 4).
   Zapier Google Business Profile `create_post` (tool google_business_profile_create_post): location
   `locations/9500753489661593239`, topic_type STANDARD, call_to_action_type SHOP, call_to_action_url = the
   product URL + `?utm_source=google&utm_medium=organic&utm_campaign=gbp_post`, photo_source_url = the product's
   first products.json image, post_summary = 2-3 plain sentences with real facts only (what it is, sizes,
   handmade in Dewsbury, free GB delivery, 14-day free returns, 5-year frame warranty or, for mattresses,
   5-year guarantee). NO prices, offers, discounts, phone numbers or "sale" words in the text: Google removed
   an offer-style post on 20 Oct. Use this run's product. Count the task in usage/zapier-YYYY-MM (kinds.gbp +1).
6c. **Every 09:00 run: one Pinterest pin** (1 Zapier task; skip if safe-per-day < 8). Open
   ops/seo-types/pin-queue.json, take the FIRST pin with posted false, and call Zapier Pinterest `create_pin`
   (tool pinterest_create_pin) with board_id = boardId, image_url = image, source_url = link, title, description.
   Then set that pin's posted true, pinId and postedAt in the file and commit it with the QUEUE line. When all
   20 are posted, stop this step. Count the task in usage/zapier-YYYY-MM (kinds.pinterest +1).
7. Add one line to ops/QUEUE.md (date, slot, product, platforms posted or the blocker) and push.

## Costs
Each video uses 3 Gemini 3 Pro Image 4K images on the owner's Gemini key plus one Claude Code run.
Pause any time: HQ → Social → Cinema autopilot → switch off (sets settings/main.autoCinema = false).

## Upgrade path
When OpenHiggsfield has a platform key (HF_API_BASE_URL + id:secret) or the Gemini key gets Veo,
replace step 3's scenes with real AI motion clips (Kling 3.0 4K / Seedance 2.0 4K image-to-video from
the same product photos); hosting and posting stay the same.
