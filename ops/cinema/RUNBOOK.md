# Eagle Bed Cinema autopilot (twice daily, 09:00 and 18:00 UK)

Goal: every morning and evening post one professional, cinematic 4K vertical video of a DIFFERENT
real Eagle Bed product to Instagram (Reel), Facebook (Page video), YouTube (Shorts) and TikTok,
with the product link and a like/follow call to action. HQ: https://claude.ai/artifact/H8ECqvxQbUQSABuMUK1iki

Rules (from ops/BRIEF.md): only real products and real facts; no "hotel", "best-selling", "leading",
award or medical claims; music is only the Eagle Bed originals in tools/cinema/music; never fake a
post: record exactly what happened. Never change prices, ads or the theme in this job.

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
   - Publer (connection in ops/BRIEF.md): `upload_media` from the url (one at a time), then create
     a post for YouTube 6ada6553da10209b23547110 (title = youtubeTitle, text = youtube caption) and
     TikTok 6ada61643266bfdcc843c976 (text = tiktok caption), publish now.
   Update the videos doc: per platform `ig`, `fb`, `yt`, `tt` true/false, `status` "posted" if at
   least Instagram or Facebook went out, else "failed" with `error`. If Zapier says the task limit is
   reached, write that exact reason, set `status` "failed", and do not keep retrying this run.
6. **Monday 09:00 run only:** also run `python3 tools/aivis/check.py --out /tmp/aivis.json` and
   ArtifactData `set` aivis/latest from it (fields at, date, model, asked, named, cited, topSources,
   rows[prompt, named, cited, sources, answer]) so HQ shows how often AI assistants recommend Eagle Bed.
7. Add one line to ops/QUEUE.md (date, slot, product, platforms posted or the blocker) and push.

## Costs
Each video uses 3 Gemini 3 Pro Image 4K images on the owner's Gemini key plus one Claude Code run.
Pause any time: HQ → Social → Cinema autopilot → switch off (sets settings/main.autoCinema = false).

## Upgrade path
When OpenHiggsfield has a platform key (HF_API_BASE_URL + id:secret) or the Gemini key gets Veo,
replace step 3's scenes with real AI motion clips (Kling 3.0 4K / Seedance 2.0 4K image-to-video from
the same product photos); hosting and posting stay the same.
