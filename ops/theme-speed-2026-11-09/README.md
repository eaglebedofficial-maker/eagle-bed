# PageSpeed fix, 9 Nov 2026 (theme "Eagle Bed PageSpeed fix 9 Nov - PUBLISH", id 212291486027)

Why PageSpeed failed (DEADLINE_EXCEEDED) and mobile scored 35:
- The 3D hero bed rendered every frame forever (auto-spin, 2048px soft shadows). On Google's test machines (software WebGL) the CPU never went idle.
- The hero photo was hidden (opacity 0) until the 3D scripts loaded, so LCP was 12.3 s.
- three.js was loaded up front twice on the home page.
- Easify options app put ~680 KB of option data on every page (app embed, page paths empty).

Changes (unpublished copy of the live theme):
- assets/eb3d-bed.js: three.js loaded only when 3D starts; 3D skipped on software renderers and Save-Data; phones get a "View in 3D" button; desktop starts after load + idle when visible; render loop stops 6 s after last interaction; shadow map 1024, pixel ratio max 1.5; runs once even if included twice.
- sections/eb3d-hero.liquid: photo visible immediately with fetchpriority=high; three.js tag removed.
- sections/eb3d-studio.liquid: three.js tag removed.
- config/settings_data.json: Easify app embed limited to product pages and cart.
Originals: original/ (sections are as in the live theme 210754699595).
