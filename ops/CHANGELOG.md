# Eagle Bed change log (rebuilt 4 Nov 2026; earlier log lost with the scratchpad — see git history and HQ memory notes)
## 4 Nov 2026
- FB/IG: posted 4 Nov 18:00 Vegas Luxury Bed (IG carousel id 18119848231975266; FB post 466446689880866_122226457142559693).
- HQ posts 1–4 Nov (11) marked status "skipped" (social post task did not run) so they are not posted late in a burst.
- HQ captions fixed (no hotel claims): 2026-11-09_0900, 2026-11-11_0900, 2026-11-16_0900; typo 2026-11-08_0900.
- HQ videos: 2026-11-08..11 video days created (waiting for phone photos).
- Publer TikTok: 5 Nov 13:00 Oxford Panel Storage Bed; 6 Nov 09:00 Side Lift Ottoman Storage Base.
- ops/ files rebuilt in the repo (AUTOPILOT_REGISTRY, BRIEF, QUEUE, CHANGELOG).
## 5 Nov 2026
- FB/IG: posted 5 Nov 09:00 Florida Panel Bed carousel (IG 18144878680719401; FB 466446689880866_122226548456559693); HQ post marked posted.
## 6 Nov 2026 (Cinema Studio)
- OpenHiggsfield installed (Next.js studio, pnpm; 38 models). HQ v31: Cinema Studio card in Social, new agent Cinematic AI Director (Social & Video), skill open-higgsfield in the Claude Code queue, db collection `cinema`.
- HQ v32: Higgsfield AI Studio agent (plans weekly films and image sets into `cinema`), Facebook video platform, multi-photo start frame + reference images from the website, image mode (8 image models), highest-resolution default (Kling 3.0 4K).
## 9 Nov 2026 (PageSpeed + HQ progress memory)
- PageSpeed: unpublished theme copy "Eagle Bed PageSpeed fix 9 Nov - PUBLISH" (212291486027) made from live 210754699595. Changed: assets/eb3d-bed.js (lazy three.js, no 3D on software GPUs, tap-to-3D on phones, render loop stops when idle, lighter shadows), sections/eb3d-hero.liquid (photo visible at once, fetchpriority high, no three.js tag), sections/eb3d-studio.liquid (no three.js tag), snippets/meta-tags.liquid (preload home banner photo, wingback-beds collection image), config/settings_data.json (Easify embed page_paths "/products\n/cart"). Backups + files: ops/theme-speed-2026-11-09. Lighthouse mobile real-throttled LCP 7.5 s -> 4.2 s; home HTML 1.0 MB -> 341 KB. NOT published: owner publishes.
- HQ v33: progress memory (db memory/progress). Manager planning, chat and every agent read WORK ALREADY DONE + AGREED NEXT STEPS; the Manager writes done/next after every order in the same call as lessons. Seeded with Cinema Studio (6 Nov) and PageSpeed (9 Nov).
- HQ v34 (9 Nov): done tracker + Weekly Issue Scout. Finished orders (runs status done, matched by actionKey or order text) hide their button (leak fix, CEO review, SEO/ECC/order chips, watchdog alert) until the first Monday at least 4 days later; it returns only if still a problem. Owner can Mark done / Show again (db memory/actions). Monday 8:30+: Weekly Issue Scout writes db weekly/<monday> with up to 8 issues; one Fix button starts an order (runs.issueIds); fixed issues drop off. Replaces the automatic Monday CEO review start. Board defaults to To do (DONE hidden).
## 9 Nov 2026 (cinema autopilot + AI recommendations)
- Cinema autopilot: scheduled task "Eagle Bed cinematic 4K videos 9am & 6pm" (trig_016okuWup1wybjbpScFyxw4B, 08:46 + 17:46 UK, fires into the daily autopilot session). Runbook ops/cinema/RUNBOOK.md; tools/cinema/autovideo.py (Gemini 3 Pro Image 4K scenes from website photos -> 2160x3840 h264 ~10 MB, product link + like/follow CTA, original music), tools/cinema/staged_upload.py (Shopify Files as FILE keeps 4K; VIDEO transcodes to 606x1080). First video: Fluted Velvet Bed, HQ videos/2026-11-10_0900cine1, https://cdn.shopify.com/s/files/1/1021/5410/9259/files/eagle-bed-fluted-velvet-bed-4k_5d5d12dc-81d8-462e-b097-290eb3736fff.mp4
- Gemini key: no Veo access (no AI motion); the environment network secret for generativelanguage uses header x-api-key, which Gemini ignores, so scripts use GEMINI_API_KEY with x-goog-api-key.
- "Eagle Bed social post" task: 09:00/18:00 photo posts set to "replaced" while settings/main.autoCinema is not false; 13:00 photo post unchanged. Daily autopilot told (message) to stop phone-photo video nagging.
- AI recommendation checker tools/aivis/check.py; baseline 9 Nov 0/12 named; HQ aivis/latest; HQ v35: Cinema autopilot card (Social, on/off switch), AI recommendations card (Office) + AI Recommendations agent + "AI recommendation plan" order (done-tracked).

