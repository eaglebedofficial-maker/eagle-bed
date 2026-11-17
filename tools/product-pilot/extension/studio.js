/* Product Pilot Studio — the full research workspace (extension page). */
(function () {
  "use strict";
  var PP = globalThis.PP, UI = globalThis.PPUI, NET = globalThis.PPNET;
  var esc = UI.esc, S = null, V = document.getElementById("view");
  document.getElementById("uicss").textContent = UI.CSS;
  function $(id) { return document.getElementById(id); }
  function $$(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); }
  function M() { return S.market; }
  function money(n, m) { return PP.money(n, m || M()); }
  function kmoney(n, m) { return PP.kmoney(n, m || M()); }
  function mktSelect(id, val) { return '<select id="' + id + '">' + Object.keys(PP.MARKETS).map(function (k) { return "<option" + (k === (val || M()) ? " selected" : "") + ">" + k + "</option>"; }).join("") + "</select>"; }
  function head(t, p) { return '<div class="vh"><h1>' + t + "</h1><p>" + p + "</p></div>"; }
  function params() { var h = location.hash.slice(1), i = h.indexOf("?"), o = {}; if (i > -1) h.slice(i + 1).split("&").forEach(function (kv) { var p = kv.split("="); o[p[0]] = decodeURIComponent(p[1] || ""); }); return o; }

  var VIEWS = { dashboard: vDashboard, research: vResearch, keywords: vKeywords, reverse: vReverse, tracker: vTracker, ranks: vRanks, profit: vProfit, listing: vListing, reviews: vReviews, settings: vSettings };
  function route() {
    var v = (location.hash.slice(1).split("?")[0]) || "dashboard"; if (!VIEWS[v]) v = "dashboard";
    $$(".nb").forEach(function (b) { b.setAttribute("aria-current", b.getAttribute("data-v") === v ? "true" : "false"); });
    VIEWS[v](params()); window.scrollTo(0, 0);
  }
  $$(".nb").forEach(function (b) { b.onclick = function () { location.hash = b.getAttribute("data-v"); }; });
  window.addEventListener("hashchange", route);

  // ================================================================ DASHBOARD
  function vDashboard() {
    NET.get(["shortlist", "tracked", "ranktrack", "niches", "trackLog"]).then(function (v) {
      var sl = v.shortlist || [], tr = v.tracked || {}, rt = v.ranktrack || [], ni = v.niches || [], log = v.trackLog || [];
      var h = head("Dashboard", "Everything you've saved: shortlisted products, niches you X-Rayed, and what the daily tracker is watching.");
      h += '<div class="grid g4" style="margin-bottom:14px">' + UI.kpi("Shortlisted", sl.length, "products") + UI.kpi("Tracked products", Object.keys(tr).length, "daily price & rank") + UI.kpi("Tracked keywords", rt.length, "daily rank") + UI.kpi("Last tracker run", log[0] ? new Date(log[0].t).toLocaleString() : "never", log[0] ? log[0].updated + " updates" : "") + "</div>";
      h += '<div class="card" style="margin-bottom:14px"><div class="row"><div class="grow"><h2>Shortlist</h2><div class="small muted">Products you starred from X-Ray or product pages, ranked by opportunity score.</div></div><button class="btn gh sm" id="sl-csv">Export CSV</button><button class="btn gh sm" id="sl-copy">Copy for Product Pilot</button></div>';
      var cols = [
        { key: "score", label: "Score", render: function (r) { return UI.pill(r.score || 0); } },
        { key: "title", label: "Product", wrap: true, render: function (r) { return (r.image ? '<img class="thumb" style="float:left;margin-right:8px" src="' + esc(r.image) + '">' : "") + '<a target="_blank" href="' + esc(PP.urls(r.mkt, r.asin).amazon) + '">' + esc((r.title || r.asin).slice(0, 90)) + '</a><div class="small faint">' + r.mkt + " · " + r.asin + "</div>"; } },
        { key: "price", label: "Price", render: function (r) { return r.price ? money(r.price, r.mkt) : ""; } },
        { key: "bsr", label: "BSR", render: function (r) { return r.bsr ? "#" + r.bsr.toLocaleString() : ""; } },
        { key: "sales", label: "Sales/mo", render: function (r) { return r.sales ? r.sales.toLocaleString() : ""; } },
        { key: "revenue", label: "Revenue/mo", render: function (r) { return r.revenue ? kmoney(r.revenue, r.mkt) : ""; } },
        { key: "reviews", label: "Reviews", render: function (r) { return r.reviews ? r.reviews.toLocaleString() : ""; } },
        { key: "rating", label: "★", render: function (r) { return r.rating ? r.rating.toFixed(1) : ""; } },
        { key: "savedAt", label: "Saved", render: function (r) { return new Date(r.savedAt).toISOString().slice(0, 10); } },
        { key: "x", label: "", render: function (r, i) { return '<button class="btn gh sm" data-del="' + i + '">✕</button>'; } }
      ];
      var rows = sl.slice().sort(function (a, b) { return (b.score || 0) - (a.score || 0); });
      h += rows.length ? '<div class="tw" style="margin-top:10px;max-height:50vh">' + UI.table("sltbl", cols, rows) + "</div>" : '<p class="note">Nothing yet — on Amazon, open X-Ray and press ☆ on a product.</p>';
      h += "</div>";
      h += '<div class="card"><h2>Saved niches</h2><div class="small muted">Search pages you X-Rayed and saved.</div>';
      h += ni.length ? '<div class="tw" style="margin-top:10px"><table class="t"><thead><tr><th>Keyword</th><th>Market</th><th>Niche score</th><th>Page revenue</th><th>Avg sales</th><th>Avg price</th><th>Avg reviews</th><th>Saved</th><th></th></tr></thead><tbody>' + ni.map(function (n, i) { var s = n.summary; return "<tr><td><b>" + esc(n.q) + "</b></td><td>" + n.mkt + "</td><td>" + UI.pill(s.score) + "</td><td>" + kmoney(s.totalRevenue, n.mkt) + "</td><td>" + PP.knum(s.avgSales) + "</td><td>" + money(s.avgPrice, n.mkt) + "</td><td>" + PP.knum(s.avgReviews) + "</td><td>" + new Date(n.t).toISOString().slice(0, 10) + '</td><td><button class="btn gh sm" data-ncsv="' + i + '">CSV</button> <button class="btn gh sm" data-ncopy="' + i + '">Copy</button> <button class="btn gh sm" data-ndel="' + i + '">✕</button></td></tr>'; }).join("") + "</tbody></table></div>" : '<p class="note">None yet — press “Save niche” in X-Ray.</p>';
      h += "</div>";
      V.innerHTML = h;
      $$("[data-del]").forEach(function (b) { b.onclick = function () { var r = rows[+b.getAttribute("data-del")]; sl = sl.filter(function (x) { return !(x.asin === r.asin && x.mkt === r.mkt); }); NET.set({ shortlist: sl }).then(vDashboard); }; });
      $$("[data-ndel]").forEach(function (b) { b.onclick = function () { ni.splice(+b.getAttribute("data-ndel"), 1); NET.set({ niches: ni }).then(vDashboard); }; });
      $$("[data-ncsv]").forEach(function (b) { b.onclick = function () { var n = ni[+b.getAttribute("data-ncsv")]; n.items.forEach(function (x) { x.mkt = n.mkt; }); UI.download("niche-" + n.q.replace(/\W+/g, "-") + ".csv", PP.toCSV(n.items, PP.XRAY_COLS)); }; });
      $$("[data-ncopy]").forEach(function (b) { b.onclick = function () { var n = ni[+b.getAttribute("data-ncopy")]; UI.copy(JSON.stringify({ source: "product-pilot-extension", v: 2, kind: "search", mkt: n.mkt, query: n.q, t: n.t, items: n.items })).then(function () { b.textContent = "Copied ✓"; }); }; });
      var c = $("sl-csv"); if (c) c.onclick = function () { UI.download("shortlist.csv", PP.toCSV(rows, PP.XRAY_COLS)); };
      var cp = $("sl-copy"); if (cp) cp.onclick = function () { UI.copy(JSON.stringify({ source: "product-pilot-extension", v: 2, kind: "shortlist", mkt: M(), t: Date.now(), items: rows })).then(function () { cp.textContent = "Copied ✓"; }); };
    });
  }

  // ================================================================ PRODUCT RESEARCH (database / Black Box style)
  var R = { items: [], sort: { key: "score", dir: -1 }, f: { minSales: 300, maxRev: 400, pmin: "", pmax: "", minScore: "", maxKg: "", noAmz: true, minRating: "", maxRating: "" }, running: false };
  function vResearch() {
    var h = head("Product research", "Your own product database: scan any number of Amazon searches or Best Seller pages, read every product's rank, sales, fees and competition, then filter down to the winners — high demand, low competition, healthy margin.");
    h += '<div class="card"><div class="grid g2"><label class="f">Keywords to scan (one per line)<textarea id="r-kw" placeholder="divan bed\nottoman bed double\nupholstered headboard\nbed frame with storage">' + esc(R.lastKw || "") + '</textarea></label>' +
      '<div><label class="f">…or Best Sellers / New Releases URLs (one per line)<textarea id="r-bs" placeholder="https://www.amazon.co.uk/gp/bestsellers/kitchen/...">' + esc(R.lastBs || "") + '</textarea></label>' +
      '<div class="row" style="margin-top:8px"><label class="f">Market' + mktSelect("r-m") + '</label><label class="f">Pages / keyword<select id="r-pages"><option>1</option><option>2</option><option>3</option></select></label><label class="f">Detail<select id="r-deep"><option value="1">Read every product page (BSR, fees)</option><option value="0">Fast (search data only)</option></select></label></div></div></div>' +
      '<div class="row" style="margin-top:10px"><button class="btn" id="r-go">Scan</button><button class="btn gh" id="r-stop">Stop</button><span id="r-st" class="small muted"></span></div></div>';
    h += '<div class="card" style="margin-top:14px"><div class="row" style="margin-bottom:10px">' +
      '<label class="f">Min sales<input id="rf-minSales" type="number" style="width:90px" value="' + esc(R.f.minSales) + '"></label><label class="f">Max reviews<input id="rf-maxRev" type="number" style="width:90px" value="' + esc(R.f.maxRev) + '"></label><label class="f">Min price<input id="rf-pmin" type="number" style="width:80px" value="' + esc(R.f.pmin) + '"></label><label class="f">Max price<input id="rf-pmax" type="number" style="width:80px" value="' + esc(R.f.pmax) + '"></label><label class="f">Min score<input id="rf-minScore" type="number" style="width:80px" value="' + esc(R.f.minScore) + '"></label><label class="f">Max weight kg<input id="rf-maxKg" type="number" style="width:90px" value="' + esc(R.f.maxKg) + '"></label><label class="f">Rating from<input id="rf-minRating" type="number" step="0.1" style="width:70px" value="' + esc(R.f.minRating) + '"></label><label class="f">to<input id="rf-maxRating" type="number" step="0.1" style="width:70px" value="' + esc(R.f.maxRating) + '"></label>' +
      '<label class="small"><input type="checkbox" id="rf-noAmz"' + (R.f.noAmz ? " checked" : "") + '> Exclude Amazon-sold</label><span class="grow"></span><button class="btn gh sm" id="r-win">⚡ Winners preset</button><button class="btn gh sm" id="r-clear">Clear filters</button><button class="btn gh sm" id="r-csv">Export CSV</button><button class="btn sm" id="r-copy">Copy for Product Pilot</button></div><div id="r-out"></div></div>';
    V.innerHTML = h;
    var m = $("r-m"); m.value = R.mkt || M();
    $("r-go").onclick = runResearch; $("r-stop").onclick = function () { R.stop = true; };
    Object.keys(R.f).forEach(function (k) { var e = $("rf-" + k); if (!e) return; e.onchange = function () { R.f[k] = e.type === "checkbox" ? e.checked : e.value; renderResearch(); }; });
    $("r-win").onclick = function () { R.f = { minSales: 300, maxRev: 300, pmin: 20, pmax: "", minScore: 55, maxKg: "", noAmz: true, minRating: "", maxRating: "" }; vResearch(); };
    $("r-clear").onclick = function () { R.f = { minSales: "", maxRev: "", pmin: "", pmax: "", minScore: "", maxKg: "", noAmz: false, minRating: "", maxRating: "" }; vResearch(); };
    $("r-csv").onclick = function () { UI.download("product-research.csv", PP.toCSV(rFiltered(), PP.XRAY_COLS)); };
    $("r-copy").onclick = function (e) { UI.copy(JSON.stringify({ source: "product-pilot-extension", v: 2, kind: "research", mkt: R.mkt, query: (R.lastKw || "").split("\n").join(", "), t: Date.now(), items: rFiltered() })).then(function () { e.target.textContent = "Copied ✓"; }); };
    renderResearch();
  }
  function rFiltered() {
    var f = R.f;
    return R.items.filter(function (x) {
      if (f.minSales !== "" && (x.sales || 0) < +f.minSales) return false;
      if (f.maxRev !== "" && (x.reviews || 0) > +f.maxRev) return false;
      if (f.pmin !== "" && (x.price || 0) < +f.pmin) return false;
      if (f.pmax !== "" && (x.price || 0) > +f.pmax) return false;
      if (f.minScore !== "" && (x.score || 0) < +f.minScore) return false;
      if (f.maxKg !== "" && isFinite(x.weightKg) && x.weightKg > +f.maxKg) return false;
      if (f.minRating !== "" && (x.rating || 0) < +f.minRating) return false;
      if (f.maxRating !== "" && (x.rating || 0) > +f.maxRating) return false;
      if (f.noAmz && x.sellerType === "AMZ") return false;
      return true;
    });
  }
  var RCOLS = [
    { key: "score", label: "Score", render: function (r) { return UI.pill(r.score || 0); } },
    { key: "title", label: "Product", wrap: true, render: function (r) { return (r.image ? '<img class="thumb" style="float:left;margin-right:8px" src="' + esc(r.image) + '">' : "") + '<a target="_blank" href="' + esc(PP.urls(r.mkt, r.asin).amazon) + '">' + esc((r.title || "").slice(0, 80)) + '</a><div class="small faint">' + r.asin + (r.brand ? " · " + esc(r.brand) : "") + " · " + esc(r.from || "") + "</div>"; } },
    { key: "price", label: "Price", render: function (r) { return r.price ? money(r.price, r.mkt) : ""; } },
    { key: "bsr", label: "BSR", render: function (r) { return r.bsr ? "#" + r.bsr.toLocaleString() : ""; } },
    { key: "category", label: "Category", render: function (r) { return esc(r.rankCategory || r.category || ""); } },
    { key: "sales", label: "Sales/mo", render: function (r) { return r.sales ? r.sales.toLocaleString() : ""; } },
    { key: "revenue", label: "Revenue/mo", render: function (r) { return r.revenue ? kmoney(r.revenue, r.mkt) : ""; } },
    { key: "reviews", label: "Reviews", render: function (r) { return r.reviews ? r.reviews.toLocaleString() : ""; } },
    { key: "rating", label: "★", render: function (r) { return r.rating ? r.rating.toFixed(1) : ""; } },
    { key: "sellerType", label: "Seller", render: function (r) { return r.sellerType ? '<span class="tag ' + (r.sellerType === "AMZ" ? "am" : r.sellerType === "FBA" ? "fb" : "") + '">' + r.sellerType + "</span>" : ""; } },
    { key: "fbaFee", label: "FBA fee", render: function (r) { return r.fbaFee != null ? money(r.fbaFee, r.mkt) : ""; } },
    { key: "margin", label: "Margin*", render: function (r) { return r.margin != null ? Math.round(r.margin) + "%" : ""; } },
    { key: "weightKg", label: "kg", render: function (r) { return isFinite(r.weightKg) ? r.weightKg.toFixed(1) : ""; } },
    { key: "dateFirstAvailable", label: "Listed", render: function (r) { return esc(r.dateFirstAvailable || ""); }, sort: function (r) { var d = Date.parse(r.dateFirstAvailable); return isFinite(d) ? d : null; } },
    { key: "a", label: "", render: function (r) { return '<button class="btn gh sm" data-star="' + r.asin + '">☆</button>'; } }
  ];
  function renderResearch() {
    var out = $("r-out"); if (!out) return;
    var rows = UI.sortRows(rFiltered(), RCOLS, R.sort);
    if (!R.items.length) { out.innerHTML = '<p class="note">No scan yet. Add keywords above and press Scan. Tip: scan 5–20 related keywords to build a real database for a category.</p>'; return; }
    var sum = PP.marketSummary(rows, R.mkt);
    out.innerHTML = '<div class="grid g6" style="margin-bottom:10px">' + UI.kpi("Matches", rows.length + " / " + R.items.length) + UI.kpi("Avg sales", PP.knum(sum.avgSales)) + UI.kpi("Avg revenue", kmoney(sum.avgRevenue, R.mkt)) + UI.kpi("Avg price", money(sum.avgPrice, R.mkt)) + UI.kpi("Avg reviews", PP.knum(sum.avgReviews)) + UI.kpi("Avg rating", sum.avgRating ? sum.avgRating.toFixed(2) : "—") + "</div>" +
      '<div class="tw" style="max-height:62vh">' + UI.table("rtbl", RCOLS, rows, R.sort) + '</div><p class="note">*Margin assumes cost = ' + S.costPct + "% of price, " + S.acos + "% ACoS. Change in Settings.</p>";
    $$("#rtbl th").forEach(function (th) { th.onclick = function () { var k = th.getAttribute("data-k"); if (R.sort.key === k) R.sort.dir *= -1; else { R.sort.key = k; R.sort.dir = k === "title" ? 1 : -1; } renderResearch(); }; });
    $$("[data-star]").forEach(function (b) { b.onclick = function () { var it = R.items.filter(function (x) { return x.asin === b.getAttribute("data-star"); })[0]; star(it).then(function () { b.textContent = "★"; }); }; });
  }
  function star(it) {
    return NET.get(["shortlist"]).then(function (v) { var a = v.shortlist || []; if (!a.some(function (x) { return x.asin === it.asin && x.mkt === it.mkt; })) a.unshift({ asin: it.asin, mkt: it.mkt, title: it.title, image: it.image, price: it.price, bsr: it.bsr, sales: it.sales, revenue: it.revenue, reviews: it.reviews, rating: it.rating, score: it.score, margin: it.margin, category: it.category, brand: it.brand, savedAt: Date.now() }); return NET.set({ shortlist: a }); });
  }
  function runResearch() {
    if (R.running) return;
    var mkt = $("r-m").value, pages = +$("r-pages").value, deep = $("r-deep").value === "1";
    var kws = $("r-kw").value.split("\n").map(function (s) { return s.trim(); }).filter(Boolean);
    var bss = $("r-bs").value.split("\n").map(function (s) { return s.trim(); }).filter(function (s) { return /^https?:\/\//.test(s); });
    R.lastKw = $("r-kw").value; R.lastBs = $("r-bs").value; R.mkt = mkt;
    if (!kws.length && !bss.length) { $("r-st").textContent = "Add at least one keyword or URL."; return; }
    R.running = true; R.stop = false; R.items = [];
    var seen = {}, st = $("r-st");
    var jobs = [];
    kws.forEach(function (k) { for (var p = 1; p <= pages; p++) jobs.push({ kind: "s", q: k, p: p }); });
    bss.forEach(function (u) { jobs.push({ kind: "b", url: u }); });
    var chain = Promise.resolve(), n = 0;
    jobs.forEach(function (j) {
      chain = chain.then(function () {
        if (R.stop) return;
        n++; st.innerHTML = '<span class="spin"></span> Scanning ' + n + "/" + jobs.length + ": " + esc(j.q || j.url.slice(0, 60));
        var pr = j.kind === "s" ? NET.search(mkt, j.q, j.p) : NET.bestsellers(j.url);
        return pr.then(function (r) {
          r.items.forEach(function (it) { if (seen[it.asin] || it.sponsored) return; seen[it.asin] = 1; it.from = j.q || "best sellers"; it.mkt = mkt; PP.enrich(it, mkt, S); R.items.push(it); });
          renderResearch();
        }, function (e) { st.innerHTML = '<span class="bad">' + esc(e.message) + "</span>"; if (e.captcha) R.stop = true; });
      });
    });
    chain.then(function () {
      if (!deep || R.stop) return;
      var todo = R.items.slice();
      var last = 0;
      return NET.enrichItems(mkt, todo, S, function (d, t) { st.innerHTML = '<span class="spin"></span> Reading product pages ' + d + "/" + t; if (Date.now() - last > 1500) { last = Date.now(); renderResearch(); } }, function () { return R.stop; }).then(function (r) { if (r.captcha) st.innerHTML = '<span class="bad">Amazon robot check — open amazon in a tab, solve it, then scan again.</span>'; });
    }).then(function () { R.running = false; if (!/bad/.test(st.innerHTML)) st.innerHTML = '<span class="good">✓ Done — ' + R.items.length + " products</span>"; renderResearch(); });
  }

  // ================================================================ KEYWORD RESEARCH (Magnet + Frankenstein)
  var K = { rows: [], sort: { key: "opp", dir: -1 }, sel: {} };
  function vKeywords(p) {
    var h = head("Keyword research", "Expand a seed into every phrase Amazon shoppers actually type (live Amazon autocomplete, A–Z), then analyze each keyword's page 1: result count, real “bought in past month” demand, prices, review walls and an opportunity score.");
    h += '<div class="card"><div class="row"><label class="f grow">Seed keyword<input id="k-seed" value="' + esc(p.q || K.seed || "") + '" placeholder="e.g. divan bed"></label><label class="f">Market' + mktSelect("k-m", p.m) + '</label><label class="f">Depth<select id="k-deep"><option value="0">Standard (A–Z)</option><option value="1">Deep (prefix + modifiers)</option></select></label><button class="btn" id="k-go" style="align-self:flex-end">Find keywords</button></div>' +
      '<div class="row" style="margin-top:10px"><button class="btn gh sm" id="k-an">Analyze top 25</button><button class="btn gh sm" id="k-ansel">Analyze selected</button><button class="btn gh sm" id="k-csv">Export CSV</button><button class="btn gh sm" id="k-copy">Copy keywords</button><button class="btn gh sm" id="k-tolist">Send to Listing builder</button><span id="k-st" class="small muted"></span></div></div>';
    h += '<div class="card" style="margin-top:14px"><div id="k-out"></div><p class="note">Demand = sum of Amazon\'s own “bought in past month” badges on page 1 (a real floor, not a model) plus the rank of the suggestion. Competition = review wall and result count. These are relative indexes — Amazon does not publish search volume to anyone; paid tools estimate it too.</p></div>';
    h += '<div class="card" style="margin-top:14px"><h2>Keyword processor (Frankenstein)</h2><p class="note">Paste any keyword dump — competitor titles, exports, ideas. It cleans, de-duplicates, removes stop words and ranks root words and phrases.</p><textarea id="fr-in" style="min-height:120px"></textarea><div class="row" style="margin-top:8px"><button class="btn sm" id="fr-go">Process</button><label class="small"><input type="checkbox" id="fr-dedupe" checked> De-duplicate words for backend search terms</label></div><div id="fr-out" style="margin-top:10px"></div></div>';
    V.innerHTML = h;
    $("k-go").onclick = function () {
      var seed = $("k-seed").value.trim(); if (!seed) return; K.seed = seed; K.mkt = $("k-m").value; K.rows = []; K.sel = {};
      $("k-st").innerHTML = '<span class="spin"></span> Asking Amazon…';
      NET.expand(K.mkt, seed.toLowerCase(), { deep: $("k-deep").value === "1" }, function (d, n) { $("k-st").innerHTML = '<span class="spin"></span> ' + d + "/" + n + " prefixes"; }).then(function (list) {
        K.rows = list.map(function (x) { return { kw: x.kw, hits: x.hits, rank: x.rank, words: x.kw.split(" ").length }; });
        K.rows.forEach(function (r) { r.sugg = Math.round(Math.min(100, r.hits * 12 + (12 - r.rank) * 3 + (r.kw === seed.toLowerCase() ? 30 : 0))); });
        K.sort = { key: "sugg", dir: -1 };
        $("k-st").innerHTML = '<span class="good">✓ ' + K.rows.length + " keywords</span>"; renderK();
      }, function (e) { $("k-st").innerHTML = '<span class="bad">' + esc(e.message) + "</span>"; });
    };
    $("k-an").onclick = function () { analyzeK(UI.sortRows(K.rows, KCOLS, { key: "sugg", dir: -1 }).slice(0, 25)); };
    $("k-ansel").onclick = function () { analyzeK(K.rows.filter(function (r) { return K.sel[r.kw]; })); };
    $("k-csv").onclick = function () { UI.download("keywords-" + (K.seed || "").replace(/\W+/g, "-") + ".csv", PP.toCSV(K.rows, [{ label: "Keyword", key: "kw" }, { label: "Words", key: "words" }, { label: "Suggestion strength", key: "sugg" }, { label: "Results", key: "results" }, { label: "Page-1 bought/mo (badges)", key: "bought" }, { label: "Est page-1 sales/mo", key: "sales" }, { label: "Avg price", key: "avgPrice" }, { label: "Avg reviews", key: "avgReviews" }, { label: "Sponsored on page 1", key: "sponsored" }, { label: "Demand", key: "demand" }, { label: "Competition", key: "comp" }, { label: "Opportunity", key: "opp" }])); };
    $("k-copy").onclick = function (e) { UI.copy(K.rows.map(function (r) { return r.kw; }).join("\n")).then(function () { e.target.textContent = "Copied ✓"; }); };
    $("k-tolist").onclick = function () { NET.set({ kwbank: K.rows.map(function (r) { return r.kw; }) }).then(function () { location.hash = "listing"; }); };
    $("fr-go").onclick = frank;
    renderK();
    if (p.q && !K.rows.length) $("k-go").click();
  }
  var KCOLS = [
    { key: "sel", label: "✓", render: function (r) { return '<input type="checkbox" data-sel="' + esc(r.kw) + '"' + (K.sel[r.kw] ? " checked" : "") + ">"; }, sort: function (r) { return K.sel[r.kw] ? 1 : 0; } },
    { key: "kw", label: "Keyword", render: function (r) { return '<a target="_blank" href="' + esc(PP.urls(K.mkt, "").search(r.kw)) + '">' + esc(r.kw) + "</a>"; } },
    { key: "words", label: "Words" },
    { key: "sugg", label: "Suggest strength", render: function (r) { return '<div class="bar" style="width:70px;display:inline-block;vertical-align:middle"><i style="width:' + r.sugg + '%"></i></div> ' + r.sugg; } },
    { key: "results", label: "Results", render: function (r) { return r.loading ? '<span class="spin"></span>' : r.results != null ? r.results.toLocaleString() : ""; } },
    { key: "bought", label: "Page-1 bought/mo", render: function (r) { return r.bought != null ? PP.knum(r.bought) + "+" : ""; } },
    { key: "sales", label: "Page-1 sales est", render: function (r) { return r.sales != null ? PP.knum(r.sales) : ""; } },
    { key: "avgPrice", label: "Avg price", render: function (r) { return r.avgPrice ? money(r.avgPrice, K.mkt) : ""; } },
    { key: "avgReviews", label: "Avg reviews", render: function (r) { return r.avgReviews != null ? PP.knum(r.avgReviews) : ""; } },
    { key: "sponsored", label: "Ads", render: function (r) { return r.sponsored != null ? r.sponsored : ""; } },
    { key: "demand", label: "Demand", render: function (r) { return r.demand != null ? UI.pill(r.demand) : ""; } },
    { key: "comp", label: "Competition", render: function (r) { return r.comp != null ? '<span class="pill" style="background:' + UI.scoreColor(100 - r.comp) + '">' + r.comp + "</span>" : ""; } },
    { key: "opp", label: "Opportunity", render: function (r) { return r.opp != null ? UI.pill(r.opp) : ""; } }
  ];
  function renderK() {
    var out = $("k-out"); if (!out) return;
    if (!K.rows.length) { out.innerHTML = '<p class="note">Enter a seed keyword and press Find keywords.</p>'; return; }
    out.innerHTML = '<div class="tw" style="max-height:60vh">' + UI.table("ktbl", KCOLS, UI.sortRows(K.rows, KCOLS, K.sort), K.sort) + "</div>";
    $$("#ktbl th").forEach(function (th) { th.onclick = function () { var k = th.getAttribute("data-k"); if (K.sort.key === k) K.sort.dir *= -1; else { K.sort.key = k; K.sort.dir = k === "kw" ? 1 : -1; } renderK(); }; });
    $$("[data-sel]").forEach(function (c) { c.onchange = function () { K.sel[c.getAttribute("data-sel")] = c.checked; }; });
  }
  function analyzeK(list) {
    if (!list.length) { $("k-st").textContent = "Nothing to analyze."; return; }
    list.forEach(function (r) { r.loading = true; }); renderK();
    var chain = Promise.resolve(), i = 0;
    list.forEach(function (r) {
      chain = chain.then(function () {
        i++; $("k-st").innerHTML = '<span class="spin"></span> Analyzing ' + i + "/" + list.length;
        return NET.search(K.mkt, r.kw, 1).then(function (s) {
          var org = s.items.filter(function (x) { return !x.sponsored; });
          org.forEach(function (x) { PP.enrich(x, K.mkt, S); });
          r.results = s.resultCount; r.sponsored = s.items.length - org.length;
          r.bought = org.reduce(function (a, x) { return a + (x.bought || 0); }, 0);
          r.sales = org.reduce(function (a, x) { return a + (x.sales || 0); }, 0);
          var pr = org.filter(function (x) { return x.price; }); r.avgPrice = pr.length ? pr.reduce(function (a, x) { return a + x.price; }, 0) / pr.length : 0;
          var top = org.slice(0, 10); r.avgReviews = top.length ? Math.round(top.reduce(function (a, x) { return a + (x.reviews || 0); }, 0) / top.length) : 0;
          r.demand = Math.round(PP.clamp(Math.log10(Math.max(r.bought + r.sugg * 20, 1)) / Math.log10(30000), 0, 1) * 100);
          r.comp = Math.round(PP.clamp(Math.log10(Math.max(r.avgReviews, 1)) / Math.log10(5000), 0, 1) * 70 + PP.clamp(Math.log10(Math.max(r.results || 1, 1)) / 6, 0, 1) * 30);
          r.opp = Math.round(PP.clamp(r.demand * 0.6 + (100 - r.comp) * 0.4, 0, 100));
        }, function (e) { r.error = e.message; }).then(function () { r.loading = false; renderK(); });
      });
    });
    chain.then(function () { $("k-st").innerHTML = '<span class="good">✓ Analyzed ' + list.length + "</span>"; K.sort = { key: "opp", dir: -1 }; renderK(); });
  }
  function frank() {
    var t = $("fr-in").value, dd = $("fr-dedupe").checked;
    var phrases = t.split(/[\n,;]+/).map(function (s) { return s.trim().toLowerCase(); }).filter(Boolean);
    var uniq = Array.from(new Set(phrases));
    var words = PP.ngrams(uniq, 1), bi = PP.ngrams(uniq, 2).filter(function (g) { return g.words === 2; });
    var allWords = []; uniq.forEach(function (p) { PP.tokens(p).forEach(function (w) { if (!dd || allWords.indexOf(w) < 0) allWords.push(w); }); });
    var backend = allWords.join(" "), bytes = new Blob([backend]).size;
    $("fr-out").innerHTML = '<div class="grid g2"><div><div class="eb">Root words</div><div style="margin-top:6px">' + words.slice(0, 80).map(function (w) { return '<span class="chip">' + esc(w.term) + " <b>" + w.count + "</b></span>"; }).join("") + '</div><div class="eb" style="margin-top:10px">Top phrases</div><div style="margin-top:6px">' + bi.slice(0, 40).map(function (w) { return '<span class="chip">' + esc(w.term) + " <b>" + w.count + "</b></span>"; }).join("") + '</div></div><div><div class="eb">Unique phrases (' + uniq.length + ' of ' + phrases.length + ')</div><textarea style="min-height:120px">' + esc(uniq.join("\n")) + '</textarea><div class="eb" style="margin-top:8px">Backend search terms (' + bytes + ' bytes — Amazon limit 249)</div><textarea style="min-height:80px">' + esc(backend) + "</textarea></div></div>";
  }

  // ================================================================ REVERSE ASIN (Cerebro-lite)
  var RA = { rows: [], asins: [] };
  function vReverse() {
    var h = head("Reverse ASIN", "Find the keywords a product ranks for. Product Pilot builds candidate keywords from the listing and Amazon's own suggestions, then checks the real search results for each one — organic and sponsored position — for your ASIN and up to 3 competitors.");
    h += '<div class="card"><div class="row"><label class="f">Market' + mktSelect("ra-m") + '</label><label class="f grow">ASIN or product URL<input id="ra-a" value="' + esc(RA.asins[0] || "") + '"></label><label class="f grow">Competitor ASINs (optional, comma-separated)<input id="ra-c" value="' + esc(RA.asins.slice(1).join(", ")) + '"></label></div><label class="f" style="margin-top:8px">Extra keywords to check (optional, one per line)<textarea id="ra-x" style="min-height:60px"></textarea></label><div class="row" style="margin-top:8px"><label class="f">Max keywords<select id="ra-n"><option>25</option><option selected>40</option><option>60</option></select></label><label class="f">Pages<select id="ra-p"><option value="1">Page 1</option><option value="2" selected>Pages 1–2</option></select></label><button class="btn" id="ra-go" style="align-self:flex-end">Run reverse ASIN</button><button class="btn gh" id="ra-stop" style="align-self:flex-end">Stop</button><button class="btn gh" id="ra-csv" style="align-self:flex-end">Export CSV</button><span id="ra-st" class="small muted"></span></div></div><div class="card" style="margin-top:14px" id="ra-out"><p class="note">Results appear here.</p></div>' +
      '<div class="card" style="margin-top:14px"><h2>Index checker</h2><p class="note">Is your ASIN indexed for a keyword? Product Pilot searches Amazon for “ASIN + keyword”; if the product appears, Amazon has the keyword attached to the listing (title, bullets or backend). Not indexed = Amazon will never show you for that search.</p><div class="row"><label class="f">ASIN<input id="ix-a" value="' + esc(RA.asins[0] || "") + '"></label><label class="f grow">Keywords (one per line)<textarea id="ix-k" style="min-height:60px"></textarea></label><button class="btn" id="ix-go" style="align-self:flex-end">Check index</button></div><div id="ix-out" style="margin-top:10px"></div></div>';
    V.innerHTML = h;
    $("ra-go").onclick = runReverse; $("ra-stop").onclick = function () { RA.stop = true; };
    $("ra-csv").onclick = function () { var cols = [{ label: "Keyword", key: "kw" }, { label: "Results", key: "results" }].concat(RA.asins.map(function (a) { return { label: a + " organic", get: function (r) { return r.pos[a] && r.pos[a].organic || ""; } }; })).concat(RA.asins.map(function (a) { return { label: a + " sponsored", get: function (r) { return r.pos[a] && r.pos[a].sponsored || ""; } }; })); UI.download("reverse-asin-" + RA.asins[0] + ".csv", PP.toCSV(RA.rows, cols)); };
    if (RA.rows.length) renderReverse();
    $("ix-go").onclick = function () {
      var a = PP.extractAsin($("ix-a").value), mkt = $("ra-m").value, kws = $("ix-k").value.split("\n").map(function (x) { return x.trim(); }).filter(Boolean);
      if (!a || !kws.length) { $("ix-out").textContent = "Enter an ASIN and at least one keyword."; return; }
      var res = kws.map(function (k) { return { kw: k, st: "…" }; }), out = $("ix-out");
      function draw() { out.innerHTML = '<table class="t"><thead><tr><th>Keyword</th><th>Indexed</th></tr></thead><tbody>' + res.map(function (r) { return "<tr><td>" + esc(r.kw) + "</td><td>" + (r.st === true ? '<b class="good">✓ Indexed</b>' : r.st === false ? '<b class="bad">✕ Not indexed</b>' : esc(r.st)) + "</td></tr>"; }).join("") + "</tbody></table>"; }
      draw();
      var chain = Promise.resolve();
      res.forEach(function (r) { chain = chain.then(function () { return NET.search(mkt, a + " " + r.kw, 1).then(function (s) { r.st = s.items.some(function (x) { return x.asin === a; }); }, function (e) { r.st = e.message; }).then(draw); }); });
    };
  }
  function runReverse() {
    var mkt = $("ra-m").value, a = PP.extractAsin($("ra-a").value); if (!a) { $("ra-st").textContent = "Enter a valid ASIN."; return; }
    var comps = $("ra-c").value.split(/[,\s]+/).map(PP.extractAsin).filter(Boolean).slice(0, 3);
    RA.asins = [a].concat(comps); RA.mkt = mkt; RA.rows = []; RA.stop = false;
    var maxN = +$("ra-n").value, pages = +$("ra-p").value, st = $("ra-st");
    st.innerHTML = '<span class="spin"></span> Reading the listing…';
    NET.product(mkt, a).then(function (p) {
      RA.title = p.title;
      var cands = PP.titlePhrases(p.title, p.bullets, 15);
      var seeds = cands.slice(0, 3);
      st.innerHTML = '<span class="spin"></span> Getting Amazon suggestions…';
      return Promise.all(seeds.map(function (s) { return NET.suggest(mkt, s).catch(function () { return []; }); })).then(function (lists) {
        var extra = $("ra-x").value.split("\n").map(function (s) { return s.trim().toLowerCase(); }).filter(Boolean);
        var all = extra.concat(lists.reduce(function (a, l) { return a.concat(l); }, [])).concat(cands).map(function (s) { return s.toLowerCase(); });
        all = Array.from(new Set(all)).slice(0, maxN);
        RA.rows = all.map(function (k) { return { kw: k, pos: {}, loading: true }; });
        renderReverse();
        var chain = Promise.resolve(), i = 0;
        RA.rows.forEach(function (r) {
          chain = chain.then(function () {
            if (RA.stop) { r.loading = false; return; }
            i++; st.innerHTML = '<span class="spin"></span> Checking ' + i + "/" + RA.rows.length + ": " + esc(r.kw);
            return checkMulti(mkt, r.kw, RA.asins, pages).then(function (res) { r.pos = res.pos; r.results = res.results; r.loading = false; renderReverse(); }, function (e) { r.error = e.message; r.loading = false; if (e.captcha) RA.stop = true; renderReverse(); });
          });
        });
        return chain;
      });
    }).then(function () { st.innerHTML = RA.stop ? "Stopped." : '<span class="good">✓ Done</span>'; renderReverse(); }, function (e) { st.innerHTML = '<span class="bad">' + esc(e.message) + "</span>"; });
  }
  function checkMulti(mkt, kw, asins, pages) {
    var pos = {}, results = null, offset = 0;
    asins.forEach(function (a) { pos[a] = { organic: null, sponsored: null }; });
    function page(p) {
      return NET.search(mkt, kw, p).then(function (r) {
        if (p === 1) results = r.resultCount;
        r.items.forEach(function (it) { var o = pos[it.asin]; if (!o) return; if (it.sponsored) { if (o.sponsored == null) o.sponsored = (p - 1) * 100 + it.position; } else if (o.organic == null) o.organic = offset + it.organicPosition; });
        offset += r.items.filter(function (x) { return !x.sponsored; }).length;
        var missing = asins.some(function (a) { return pos[a].organic == null; });
        if (missing && p < pages && r.items.length) return page(p + 1);
      });
    }
    return page(1).then(function () { return { pos: pos, results: results }; });
  }
  function renderReverse() {
    var out = $("ra-out"); if (!out) return;
    var ranked = RA.rows.filter(function (r) { var o = r.pos[RA.asins[0]]; return o && o.organic; }).length;
    var top10 = RA.rows.filter(function (r) { var o = r.pos[RA.asins[0]]; return o && o.organic && o.organic <= 10; }).length;
    var h = '<div class="grid g4" style="margin-bottom:10px">' + UI.kpi("Keywords checked", RA.rows.filter(function (r) { return !r.loading; }).length + "/" + RA.rows.length) + UI.kpi("Ranks organically", ranked) + UI.kpi("Top 10", top10) + UI.kpi("Sponsored on", RA.rows.filter(function (r) { var o = r.pos[RA.asins[0]]; return o && o.sponsored; }).length) + "</div>";
    if (RA.title) h += '<p class="small muted">' + esc(RA.title) + "</p>";
    h += '<div class="tw" style="max-height:62vh"><table class="t"><thead><tr><th>Keyword</th><th>Results</th>' + RA.asins.map(function (a, i) { return "<th>" + (i ? "Comp " + i : "Your ASIN") + "<br>" + a + "</th>"; }).join("") + "</tr></thead><tbody>" +
      RA.rows.map(function (r) { return '<tr><td><a target="_blank" href="' + esc(PP.urls(RA.mkt, "").search(r.kw)) + '">' + esc(r.kw) + "</a></td><td>" + (r.results ? r.results.toLocaleString() : "") + "</td>" + RA.asins.map(function (a) { var o = r.pos[a]; if (r.loading) return '<td><span class="spin"></span></td>'; if (r.error) return '<td class="bad small">' + esc(r.error) + "</td>"; return "<td>" + (o && o.organic ? '<b class="' + (o.organic <= 10 ? "good" : o.organic <= 30 ? "warn" : "") + '">#' + o.organic + "</b>" : '<span class="faint">—</span>') + (o && o.sponsored ? ' <span class="tag sp">ad #' + o.sponsored + "</span>" : "") + "</td>"; }).join("") + "</tr>"; }).join("") + "</tbody></table></div>";
    h += '<p class="note">Positions are what Amazon showed this browser just now (organic counts exclude ads). Rankings vary by location and personalisation — exactly like the paid tools, treat them as a snapshot. Add winners to the daily Keyword rank tracker.</p>';
    out.innerHTML = h;
  }

  // ================================================================ PRODUCT TRACKER (Keepa-lite)
  function vTracker(p) {
    NET.get(["tracked", "trackLog"]).then(function (v) {
      var t = v.tracked || {}, keys = Object.keys(t), log = v.trackLog || [];
      var h = head("Product tracker", "Your own Keepa: every tracked product is re-read automatically every " + S.trackHours + " hours (while Chrome is open) — price, Best Sellers Rank, reviews, rating, offers and Amazon's sales badge — so you build a history and spot trends. With a Keepa key you can also pull a full 1-year history instantly.");
      h += '<div class="card"><div class="row"><label class="f">Market' + mktSelect("t-m") + '</label><label class="f grow">Add ASINs (comma or new line)<input id="t-add"></label><button class="btn" id="t-addb" style="align-self:flex-end">Track</button><button class="btn gh" id="t-now" style="align-self:flex-end">Check all now</button><span id="t-st" class="small muted"></span></div><p class="note">Last run: ' + (log[0] ? new Date(log[0].t).toLocaleString() + " · " + log[0].updated + " updated" : "not yet") + "</p></div>";
      var rows = keys.map(function (k) { var x = t[k], H = x.history || [], last = H[H.length - 1] || {}, first = H[0] || {}; return { k: k, x: x, last: last, first: first, H: H }; });
      h += '<div class="card" style="margin-top:14px">' + (rows.length ? '<div class="tw"><table class="t"><thead><tr><th>Product</th><th>Price</th><th>Δ price</th><th>BSR</th><th>Δ BSR</th><th>Rank trend</th><th>Est sales</th><th>Reviews</th><th>★</th><th>Offers</th><th>Points</th><th>Updated</th><th></th></tr></thead><tbody>' +
        rows.map(function (r) {
          var dp = r.last.price && r.first.price ? r.last.price - r.first.price : null, db = r.last.bsr && r.first.bsr ? r.last.bsr - r.first.bsr : null;
          return '<tr><td class="wrap">' + (r.x.image ? '<img class="thumb" style="float:left;margin-right:8px" src="' + esc(r.x.image) + '">' : "") + '<a href="#tracker?d=' + encodeURIComponent(r.k) + '">' + esc((r.x.title || r.x.asin).slice(0, 70)) + '</a><div class="small faint">' + r.x.mkt + " · " + r.x.asin + (r.x.error ? ' · <span class="bad">' + esc(r.x.error) + "</span>" : "") + "</div></td><td>" + (r.last.price ? money(r.last.price, r.x.mkt) : "") + "</td><td>" + (dp ? '<span class="' + (dp > 0 ? "good" : "bad") + '">' + (dp > 0 ? "+" : "") + dp.toFixed(2) + "</span>" : "") + "</td><td>" + (r.last.bsr ? "#" + r.last.bsr.toLocaleString() : "") + "</td><td>" + (db ? '<span class="' + (db < 0 ? "good" : "bad") + '">' + (db > 0 ? "+" : "") + db.toLocaleString() + "</span>" : "") + "</td><td>" + UI.spark(r.H.map(function (x) { return x.bsr; }), true) + "</td><td>" + (r.last.sales || "") + "</td><td>" + (r.last.reviews || "") + "</td><td>" + (r.last.rating || "") + "</td><td>" + (r.last.offers || "") + "</td><td>" + r.H.length + "</td><td>" + (r.x.last ? new Date(r.x.last).toISOString().slice(5, 16).replace("T", " ") : "") + '</td><td><button class="btn gh sm" data-kp="' + esc(r.k) + '"' + (S.keepaKey ? "" : " disabled title='Add a Keepa key in Settings'") + '>Keepa</button> <button class="btn gh sm" data-rm="' + esc(r.k) + '">✕</button></td></tr>';
        }).join("") + "</tbody></table></div>" : '<p class="note">No products tracked yet. Add ASINs above or press 📈 in X-Ray / on a product page.</p>') + '</div><div id="t-detail"></div>';
      V.innerHTML = h;
      $("t-addb").onclick = function () {
        var m = $("t-m").value, asins = $("t-add").value.split(/[\s,]+/).map(PP.extractAsin).filter(Boolean);
        asins.forEach(function (a) { var k = m + ":" + a; if (!t[k]) t[k] = { mkt: m, asin: a, added: Date.now(), history: [] }; });
        $("t-st").innerHTML = '<span class="spin"></span> Reading…';
        var chain = Promise.resolve();
        asins.forEach(function (a) { chain = chain.then(function () { return NET.product(m, a, { fresh: true }).then(function (pp) { var k = m + ":" + a, e = PP.estimateSales({ bsr: pp.bsr, category: pp.category, mkt: m, bought: pp.bought }); t[k].title = pp.title; t[k].image = pp.image; t[k].last = Date.now(); t[k].history.push({ t: Date.now(), price: pp.price || null, bsr: pp.bsr || null, reviews: pp.reviews || null, rating: pp.rating || null, offers: pp.offers || null, bought: pp.bought || null, sales: e.units || null }); }, function (er) { t[m + ":" + a].error = er.message; }); }); });
        chain.then(function () { return NET.set({ tracked: t }); }).then(function () { vTracker({}); });
      };
      $("t-now").onclick = function () { $("t-st").innerHTML = '<span class="spin"></span> Running tracker in the background… (a few seconds per product)'; NET.bg({ type: "trackNow" }).then(function (n) { $("t-st").innerHTML = '<span class="good">✓ ' + n + " updates</span>"; vTracker({}); }, function (e) { $("t-st").textContent = e.message; }); };
      $$("[data-rm]").forEach(function (b) { b.onclick = function () { delete t[b.getAttribute("data-rm")]; NET.set({ tracked: t }).then(function () { vTracker({}); }); }; });
      $$("[data-kp]").forEach(function (b) { b.onclick = function () { location.hash = "tracker?d=" + encodeURIComponent(b.getAttribute("data-kp")) + "&k=1"; }; });
      if (p && p.d && t[p.d]) trackerDetail(t[p.d], p.k === "1", t);
    });
  }
  function trackerDetail(x, keepa, all) {
    var el = $("t-detail"), H = x.history || [];
    function series(f) { return H.map(function (h) { return { t: h.t, v: h[f] }; }); }
    var h = '<div class="card" style="margin-top:14px"><div class="row"><h2 class="grow">' + esc(x.title || x.asin) + '</h2><a class="btn gh sm" target="_blank" href="' + esc(PP.urls(x.mkt, x.asin).amazon) + '">Amazon ↗</a><a class="btn gh sm" target="_blank" href="' + esc(PP.urls(x.mkt, x.asin).keepa) + '">Keepa ↗</a><button class="btn gh sm" id="td-csv">Export history CSV</button></div>';
    h += '<div class="grid g2" style="margin-top:10px"><div><div class="small muted">Price</div>' + UI.lineChart([{ name: "Price", color: "var(--c2)", points: series("price") }], { step: true, h: 170, fmt: function (v) { return PP.money(v, x.mkt); } }) + '</div><div><div class="small muted">Best Sellers Rank</div>' + UI.lineChart([{ name: "BSR", color: "var(--c4)", points: series("bsr") }], { invert: true, h: 170 }) + '</div><div><div class="small muted">Reviews</div>' + UI.lineChart([{ name: "Reviews", color: "var(--c5)", points: series("reviews") }], { h: 150 }) + '</div><div><div class="small muted">Estimated sales / month</div>' + UI.lineChart([{ name: "Sales", color: "var(--c1)", points: series("sales") }], { h: 150 }) + "</div></div>";
    h += '<div id="td-keepa" style="margin-top:12px"></div></div>';
    el.innerHTML = h;
    $("td-csv").onclick = function () { UI.download(x.asin + "-history.csv", PP.toCSV(H, [{ label: "Date", get: function (r) { return new Date(r.t).toISOString(); } }, { label: "Price", key: "price" }, { label: "BSR", key: "bsr" }, { label: "Reviews", key: "reviews" }, { label: "Rating", key: "rating" }, { label: "Offers", key: "offers" }, { label: "Bought badge", key: "bought" }, { label: "Est sales", key: "sales" }])); };
    if (keepa && S.keepaKey) {
      var k = $("td-keepa"); k.innerHTML = '<span class="spin"></span> Loading 1-year history from Keepa…';
      NET.keepaProduct(S.keepaKey, x.mkt, x.asin).then(function (r) {
        var kp = r.products[0]; if (!kp) { k.innerHTML = '<p class="note">No Keepa data.</p>'; return; }
        var hs = kp.history, st = kp.stats || {};
        k.innerHTML = '<h3>Keepa history</h3><div class="grid g4" style="margin:8px 0">' + UI.kpi("Rank drops 30d", st.salesRankDrops30 != null ? st.salesRankDrops30 : "—", "≈ number of sales") + UI.kpi("Rank drops 90d", st.salesRankDrops90 != null ? st.salesRankDrops90 : "—") + UI.kpi("Rank drops 180d", st.salesRankDrops180 != null ? st.salesRankDrops180 : "—") + UI.kpi("Listed since", kp.listedSince || "—") + '</div><div class="grid g2"><div>' + UI.lineChart([{ name: "Amazon", color: "var(--c3)", points: hs.amazon }, { name: "New", color: "var(--c2)", points: hs.new }, { name: "Buy box", color: "var(--c1)", points: hs.buybox }], { step: true, h: 190, fmt: function (v) { return PP.money(v, x.mkt); } }) + "</div><div>" + UI.lineChart([{ name: "BSR", color: "var(--c4)", points: hs.rank }], { invert: true, h: 190 }) + "</div><div>" + UI.lineChart([{ name: "Monthly sold (Amazon badge)", color: "var(--c1)", points: kp.monthlySoldHistory }], { step: true, h: 160 }) + "</div><div>" + UI.lineChart([{ name: "Reviews", color: "var(--c5)", points: hs.reviews }, { name: "Offers", color: "var(--c2)", points: hs.offers }], { step: true, h: 160 }) + '</div></div><div class="row"><button class="btn sm" id="td-merge">Merge Keepa history into tracker</button><span class="note">Keepa tokens left: ' + r.tokensLeft + "</span></div>";
        $("td-merge").onclick = function () {
          var rank = hs.rank.filter(function (p) { return p.v != null; }), pts = rank.map(function (p) { var pr = nearest(hs.buybox.length ? hs.buybox : hs.new, p.t); return { t: p.t, bsr: p.v, price: pr, keepa: true }; });
          x.history = pts.concat(H.filter(function (h) { return !h.keepa; })).sort(function (a, b) { return a.t - b.t; });
          NET.set({ tracked: all }).then(function () { vTracker({ d: x.mkt + ":" + x.asin }); });
        };
      }, function (e) { k.innerHTML = '<p class="bad">' + esc(e.message) + "</p>"; });
    }
  }
  function nearest(series, t) { var v = null; for (var i = 0; i < series.length; i++) { if (series[i].t > t) break; v = series[i].v; } return v; }

  // ================================================================ KEYWORD RANK TRACKER
  function vRanks() {
    NET.get(["ranktrack"]).then(function (v) {
      var rt = v.ranktrack || [];
      var h = head("Keyword rank tracker", "Daily organic and sponsored position of your ASINs on the keywords that matter (Helium 10 Keyword Tracker style). Checked automatically with the product tracker.");
      h += '<div class="card"><div class="row"><label class="f">Market' + mktSelect("rk-m") + '</label><label class="f">ASIN<input id="rk-a"></label><label class="f grow">Keywords (comma-separated)<input id="rk-k"></label><button class="btn" id="rk-add" style="align-self:flex-end">Add</button><button class="btn gh" id="rk-now" style="align-self:flex-end">Check all now</button><span id="rk-st" class="small muted"></span></div></div>';
      var groups = {}; rt.forEach(function (r, i) { r._i = i; (groups[r.mkt + ":" + r.asin] = groups[r.mkt + ":" + r.asin] || []).push(r); });
      h += Object.keys(groups).length ? Object.keys(groups).map(function (g) {
        var list = groups[g];
        return '<div class="card" style="margin-top:14px"><h3>' + esc(list[0].title || g) + ' <span class="small faint">' + esc(g) + '</span></h3><div class="tw" style="margin-top:8px"><table class="t"><thead><tr><th>Keyword</th><th>Organic</th><th>Change</th><th>Trend</th><th>Sponsored</th><th>Results</th><th>Checked</th><th></th></tr></thead><tbody>' + list.map(function (r) {
          var H = r.history || [], l = H[H.length - 1] || {}, f = H.length > 1 ? H[H.length - 2] : null, ch = l.organic && f && f.organic ? f.organic - l.organic : null;
          return "<tr><td>" + esc(r.kw) + "</td><td>" + (l.organic ? "<b>#" + l.organic + "</b>" : '<span class="faint">' + (H.length ? "not top 3 pages" : "pending") + "</span>") + "</td><td>" + (ch ? '<span class="' + (ch > 0 ? "good" : "bad") + '">' + (ch > 0 ? "▲" : "▼") + Math.abs(ch) + "</span>" : "") + "</td><td>" + UI.spark(H.map(function (x) { return x.organic; }), true) + "</td><td>" + (l.sponsored ? "#" + l.sponsored : "") + "</td><td>" + (l.results ? l.results.toLocaleString() : "") + "</td><td>" + (r.last ? new Date(r.last).toISOString().slice(5, 16).replace("T", " ") : "") + (r.error ? ' <span class="bad small">' + esc(r.error) + "</span>" : "") + '</td><td><button class="btn gh sm" data-rkdel="' + r._i + '">✕</button></td></tr>';
        }).join("") + "</tbody></table></div></div>";
      }).join("") : '<div class="card" style="margin-top:14px"><p class="note">Nothing tracked yet.</p></div>';
      V.innerHTML = h;
      $("rk-add").onclick = function () {
        var a = PP.extractAsin($("rk-a").value), m = $("rk-m").value; if (!a) { $("rk-st").textContent = "Enter an ASIN."; return; }
        $("rk-k").value.split(",").map(function (s) { return s.trim().toLowerCase(); }).filter(Boolean).forEach(function (k) { if (!rt.some(function (r) { return r.asin === a && r.kw === k && r.mkt === m; })) rt.push({ id: Date.now() + Math.random(), mkt: m, asin: a, kw: k, history: [] }); });
        NET.set({ ranktrack: rt }).then(vRanks);
      };
      $("rk-now").onclick = function () { $("rk-st").innerHTML = '<span class="spin"></span> Checking (a few seconds per keyword)…'; NET.bg({ type: "trackNow" }).then(function () { vRanks(); }, function (e) { $("rk-st").textContent = e.message; }); };
      $$("[data-rkdel]").forEach(function (b) { b.onclick = function () { rt.splice(+b.getAttribute("data-rkdel"), 1); rt.forEach(function (r) { delete r._i; }); NET.set({ ranktrack: rt }).then(vRanks); }; });
    });
  }

  // ================================================================ PROFIT CALCULATOR
  var PC = null;
  function vProfit() {
    if (!PC) PC = { mkt: M(), price: 29.99, cost: 6, freight: 1.2, prep: 0.4, weightKg: 0.45, l: 25, w: 18, h: 6, acos: S.acos, returns: S.returns, storageMonths: 1.5, cat: "Home & Kitchen", fbm: false, shipFbm: 0, vat: !!S.vatRegistered, units: 300 };
    var r = PP.profit({ price: PC.price, cost: PC.cost, freight: PC.freight, prep: PC.prep, catName: PC.cat, mkt: PC.mkt, weightKg: PC.weightKg, dims: { l: PC.l, w: PC.w, h: PC.h }, acos: PC.acos, returns: PC.returns, storageMonths: PC.storageMonths, fbm: PC.fbm, shipFbm: PC.shipFbm, vatRegistered: PC.vat });
    var m = PC.mkt;
    function f(k, l, st) { return '<label class="f">' + l + '<input data-pc="' + k + '" type="number" step="' + (st || "0.01") + '" value="' + PC[k] + '"></label>'; }
    var h = head("Profit calculator", "Full FBA (or FBM) unit economics with Amazon's size tiers, referral rates, storage, VAT, ads and returns — plus break-even price and ACoS.");
    h += '<div class="grid g2"><div class="card"><div class="grid g3">' + '<label class="f">Market' + mktSelect("pc-m", m) + "</label>" + '<label class="f">Category<select id="pc-cat">' + PP.catNames.map(function (n) { return "<option" + (n === PC.cat ? " selected" : "") + ">" + n + "</option>"; }).join("") + "</select></label>" + f("units", "Units / month", "1") +
      f("price", "Sell price") + f("cost", "Product cost") + f("freight", "Freight / unit") + f("prep", "Prep / unit") + f("acos", "ACoS %", "1") + f("returns", "Returns %", "0.5") + f("weightKg", "Weight kg") + f("l", "Length cm", "0.1") + f("w", "Width cm", "0.1") + f("h", "Height cm", "0.1") + f("storageMonths", "Months stored", "0.5") + f("shipFbm", "FBM shipping / unit") +
      '</div><div class="row" style="margin-top:10px"><label class="small"><input type="checkbox" id="pc-fbm"' + (PC.fbm ? " checked" : "") + '> Merchant fulfilled</label><label class="small"><input type="checkbox" id="pc-vat"' + (PC.vat ? " checked" : "") + "> VAT registered (UK/EU)</label></div></div>" +
      '<div class="card"><table class="t">' + [["Sell price", money(r.price, m)], ["VAT", r.vat ? "-" + money(r.vat, m) : "—"], ["Referral fee", "-" + money(r.referral, m)], ["Fulfilment · " + esc(r.tier), "-" + money(r.fba, m)], ["Storage", "-" + money(r.storage, m)], ["Landed cost", "-" + money(r.landed, m)], ["Advertising", "-" + money(r.ads, m)], ["Returns", "-" + money(r.returns, m)]].map(function (x) { return '<tr><td class="muted">' + x[0] + '</td><td style="text-align:right">' + x[1] + "</td></tr>"; }).join("") + '<tr><td><b>Net profit / unit</b></td><td style="text-align:right;font-size:18px" class="' + (r.net > 0 ? "good" : "bad") + '"><b>' + money(r.net, m) + "</b></td></tr></table>" +
      '<div class="grid g3" style="margin-top:10px">' + UI.kpi("Margin", Math.round(r.margin) + "%") + UI.kpi("ROI", Math.round(r.roi) + "%") + UI.kpi("Profit / month", kmoney(r.net * PC.units, m)) + UI.kpi("Break-even price", isFinite(r.breakEvenPrice) ? money(r.breakEvenPrice, m) : "—") + UI.kpi("Break-even ACoS", isFinite(r.breakEvenAcos) ? Math.max(0, Math.round(r.breakEvenAcos)) + "%" : "—") + UI.kpi("Cash for 3 months stock", kmoney(r.landed * PC.units * 3, m)) + "</div></div></div>";
    V.innerHTML = h;
    $$("[data-pc]").forEach(function (e) { e.onchange = function () { PC[e.getAttribute("data-pc")] = parseFloat(e.value) || 0; vProfit(); }; });
    $("pc-m").onchange = function (e) { PC.mkt = e.target.value; vProfit(); }; $("pc-cat").onchange = function (e) { PC.cat = e.target.value; vProfit(); };
    $("pc-fbm").onchange = function (e) { PC.fbm = e.target.checked; vProfit(); }; $("pc-vat").onchange = function (e) { PC.vat = e.target.checked; vProfit(); };
  }

  // ================================================================ LISTING BUILDER
  function vListing() {
    NET.get(["kwbank", "listingDraft"]).then(function (v) {
      var d = v.listingDraft || { title: "", bullets: ["", "", "", "", ""], desc: "", backend: "", bank: (v.kwbank || []).join("\n") };
      if (v.kwbank && v.kwbank.length && !d.bank) d.bank = v.kwbank.join("\n");
      var h = head("Listing builder", "Write the listing against your keyword bank. Every keyword turns green when it's used; character and byte limits are checked live (Scribbles-style).");
      h += '<div class="grid g2"><div class="card"><label class="f">Title <span id="lc-t" class="faint"></span><textarea id="lb-title" style="min-height:60px">' + esc(d.title) + "</textarea></label>" + d.bullets.map(function (b, i) { return '<label class="f" style="margin-top:8px">Bullet ' + (i + 1) + ' <span id="lc-b' + i + '" class="faint"></span><textarea data-b="' + i + '" style="min-height:56px">' + esc(b) + "</textarea></label>"; }).join("") + '<label class="f" style="margin-top:8px">Description <span id="lc-d" class="faint"></span><textarea id="lb-desc">' + esc(d.desc) + '</textarea></label><label class="f" style="margin-top:8px">Backend search terms <span id="lc-k" class="faint"></span><textarea id="lb-back" style="min-height:56px">' + esc(d.backend) + '</textarea></label><div class="row" style="margin-top:8px"><button class="btn sm" id="lb-save">Save draft</button><button class="btn gh sm" id="lb-copy">Copy listing</button><button class="btn gh sm" id="lb-fill">Fill backend with unused keywords</button></div></div>' +
        '<div><div class="card"><label class="f">Keyword bank (one per line — from Keyword research or paste)<textarea id="lb-bank" style="min-height:120px">' + esc(d.bank) + '</textarea></label><div id="lb-cov" style="margin-top:8px"></div></div><div class="card" style="margin-top:12px" id="lb-grade"></div></div></div>';
      V.innerHTML = h;
      function state() { return { title: $("lb-title").value, bullets: $$("[data-b]").map(function (t) { return t.value; }), desc: $("lb-desc").value, backend: $("lb-back").value, bank: $("lb-bank").value }; }
      function upd() {
        var s = state(), full = (s.title + " " + s.bullets.join(" ") + " " + s.desc + " " + s.backend).toLowerCase();
        var kws = s.bank.split("\n").map(function (x) { return x.trim().toLowerCase(); }).filter(Boolean);
        $("lc-t").textContent = s.title.length + "/200"; $("lc-t").className = s.title.length > 200 ? "bad" : "faint";
        s.bullets.forEach(function (b, i) { $("lc-b" + i).textContent = b.length + "/500"; });
        $("lc-d").textContent = s.desc.length + "/2000";
        var bytes = new Blob([s.backend]).size; $("lc-k").textContent = bytes + "/249 bytes"; $("lc-k").className = bytes > 249 ? "bad" : "faint";
        var used = kws.filter(function (k) { return full.indexOf(k) > -1; });
        $("lb-cov").innerHTML = '<div class="small muted">' + used.length + " of " + kws.length + " keywords used</div>" + kws.map(function (k) { var u = full.indexOf(k) > -1; return '<span class="chip" style="' + (u ? "border-color:var(--gd);color:var(--gd)" : "") + '">' + (u ? "✓ " : "") + esc(k) + "</span>"; }).join("");
        var g = PP.gradeListing({ title: s.title, bullets: s.bullets.filter(Boolean), description: s.desc, keywords: kws.slice(0, 15) });
        $("lb-grade").innerHTML = '<div class="row">' + UI.dial(g.score) + '<div><h2>Copy score</h2><div class="small muted">Text-only grade (images, video and A+ are scored on the live listing)</div></div></div><div style="margin-top:8px">' + g.tips.filter(function (t) { return !/image|video|A\+|Rating/i.test(t[1]); }).map(function (t) { return UI.flag(t[0], t[1], t[2]); }).join("") + "</div>";
      }
      $$("#view textarea").forEach(function (t) { t.oninput = upd; });
      $("lb-save").onclick = function (e) { NET.set({ listingDraft: state() }).then(function () { e.target.textContent = "Saved ✓"; }); };
      $("lb-copy").onclick = function (e) { var s = state(); UI.copy("TITLE\n" + s.title + "\n\nBULLETS\n" + s.bullets.map(function (b) { return "• " + b; }).join("\n") + "\n\nDESCRIPTION\n" + s.desc + "\n\nBACKEND\n" + s.backend).then(function () { e.target.textContent = "Copied ✓"; }); };
      $("lb-fill").onclick = function () {
        var s = state(), front = (s.title + " " + s.bullets.join(" ") + " " + s.desc).toLowerCase(), have = {};
        PP.tokens(front).forEach(function (w) { have[w] = 1; });
        var words = []; s.bank.split("\n").forEach(function (k) { PP.tokens(k).forEach(function (w) { if (!have[w] && words.indexOf(w) < 0) words.push(w); }); });
        var out = ""; words.forEach(function (w) { if (new Blob([(out + " " + w).trim()]).size <= 249) out = (out + " " + w).trim(); });
        $("lb-back").value = out; upd();
      };
      upd();
    });
  }

  // ================================================================ REVIEW ANALYZER
  function vReviews() {
    var h = head("Review analyzer", "Paste competitor reviews (from any product's “See all reviews” page). Product Pilot finds the recurring complaints and praise — the gaps your product should fix.");
    h += '<div class="card"><textarea id="rv-in" style="min-height:200px" placeholder="Paste reviews here…"></textarea><div class="row" style="margin-top:8px"><button class="btn" id="rv-go">Analyze</button></div></div><div id="rv-out" style="margin-top:14px"></div>';
    V.innerHTML = h;
    $("rv-go").onclick = function () {
      var t = $("rv-in").value; if (!t.trim()) return;
      var th = PP.reviewThemes(t), stars = (t.match(/(\d(?:[.,]\d)?) out of 5 stars/g) || []).map(function (s) { return parseFloat(s.replace(",", ".")); });
      var dist = [5, 4, 3, 2, 1].map(function (s) { return { label: s + "★", value: stars.filter(function (x) { return Math.round(x) === s; }).length, color: s >= 4 ? "var(--gd)" : s === 3 ? "var(--wn)" : "var(--bd)" }; });
      var sentences = t.split(/(?<=[.!?])\s+|\n+/).filter(function (s) { return s.length > 25; });
      var negS = sentences.filter(function (s) { var l = s.toLowerCase(); return th.negative.slice(0, 6).some(function (n) { return l.indexOf(n[0]) > -1; }); }).slice(0, 12);
      $("rv-out").innerHTML = '<div class="grid g3"><div class="card"><div class="eb">Complaints</div><div style="margin-top:8px">' + th.negative.slice(0, 20).map(function (x) { return '<span class="chip" style="border-color:var(--bd)">' + esc(x[0]) + " <b>" + x[1] + "</b></span>"; }).join("") + '</div></div><div class="card"><div class="eb">Praise</div><div style="margin-top:8px">' + th.positive.slice(0, 20).map(function (x) { return '<span class="chip" style="border-color:var(--gd)">' + esc(x[0]) + " <b>" + x[1] + "</b></span>"; }).join("") + '</div></div><div class="card"><div class="eb">Star mix (' + stars.length + " found)</div><div style=\"margin-top:8px\">" + (stars.length ? UI.hbars(dist) : '<p class="note">No “x out of 5 stars” lines in the paste.</p>') + '</div></div></div><div class="grid g2" style="margin-top:12px"><div class="card"><div class="eb">What customers say when they complain</div>' + negS.map(function (s) { return '<p class="small" style="margin:6px 0">“' + esc(s.slice(0, 300)) + "”</p>"; }).join("") + '</div><div class="card"><div class="eb">Common phrases</div><div style="margin-top:8px">' + th.terms.map(function (x) { return '<span class="chip">' + esc(x.term) + " <b>" + x.count + "</b></span>"; }).join("") + '</div><p class="note">For a written gap analysis and product improvement brief, paste the same reviews into the Product Pilot artifact → AI Analyst.</p></div></div>';
    };
  }

  // ================================================================ SETTINGS
  function vSettings() {
    var h = head("Settings", "Defaults used by X-Ray, the product card and every calculator.");
    h += '<div class="grid g2"><div class="card"><div class="grid g2">' +
      '<label class="f">Default marketplace' + mktSelect("s-market", S.market) + "</label>" +
      '<label class="f">Theme<select id="s-theme"><option value="auto">Auto</option><option value="light">Light</option><option value="dark">Dark</option></select></label>' +
      '<label class="f">Assumed product cost (% of price)<input id="s-costPct" type="number" value="' + S.costPct + '"></label>' +
      '<label class="f">Default ACoS %<input id="s-acos" type="number" value="' + S.acos + '"></label>' +
      '<label class="f">Default return rate %<input id="s-returns" type="number" value="' + S.returns + '"></label>' +
      '<label class="f">Tracker frequency (hours)<input id="s-trackHours" type="number" min="1" value="' + S.trackHours + '"></label></div>' +
      '<div style="margin-top:10px"><label class="small"><input type="checkbox" id="s-autoXray"' + (S.autoXray ? " checked" : "") + '> Open X-Ray automatically on every search page</label><br><label class="small"><input type="checkbox" id="s-autoCard"' + (S.autoCard ? " checked" : "") + '> Show the profit card on product pages</label><br><label class="small"><input type="checkbox" id="s-alerts"' + (S.alerts !== false ? " checked" : "") + '> Desktop alerts when a tracked price moves ≥ <input id="s-alertPct" type="number" style="width:52px" value="' + (S.alertPct || 5) + '">%, rank halves/doubles or new sellers join</label><br><label class="small"><input type="checkbox" id="s-vatRegistered"' + (S.vatRegistered ? " checked" : "") + "> I'm VAT registered (UK/EU profit deducts VAT)</label></div>" +
      '<button class="btn" id="s-save" style="margin-top:12px">Save settings</button></div>' +
      '<div class="card"><h2>Keepa API (optional)</h2><p class="note">Adds full 1-year price, Best Sellers Rank, review, offer and Amazon “monthly sold” history to every product — exactly what the Keepa extension shows. Get a key at keepa.com → API (paid plan). The key is stored only in this browser.</p><label class="f">API key<input id="s-keepa" type="password" value="' + esc(S.keepaKey) + '"></label><div class="row" style="margin-top:8px"><button class="btn sm" id="s-ktest">Save &amp; test</button><span id="s-kst" class="small muted"></span></div>' +
      '<h2 style="margin-top:18px">Your data</h2><p class="note">Shortlist, trackers, saved niches and drafts live in this Chrome profile only.</p><div class="row"><button class="btn gh sm" id="s-exp">Export backup</button><label class="btn gh sm">Import backup<input type="file" id="s-imp" accept=".json" style="display:none"></label><button class="btn gh sm" id="s-cache">Clear product cache</button></div><span id="s-dst" class="small muted"></span></div></div>';
    V.innerHTML = h;
    $("s-theme").value = S.theme;
    $("s-save").onclick = function (e) {
      ["market", "theme"].forEach(function (k) { S[k] = $("s-" + k).value; });
      ["costPct", "acos", "returns", "trackHours"].forEach(function (k) { S[k] = parseFloat($("s-" + k).value) || 0; });
      ["autoXray", "autoCard", "vatRegistered", "alerts"].forEach(function (k) { S[k] = $("s-" + k).checked; }); S.alertPct = parseFloat($("s-alertPct").value) || 5;
      NET.saveSettings(S).then(function () { NET.bg({ type: "reschedule" }).catch(function () { }); applyTheme(); e.target.textContent = "Saved ✓"; });
    };
    $("s-ktest").onclick = function () {
      S.keepaKey = $("s-keepa").value.trim(); NET.saveSettings(S);
      if (!S.keepaKey) { $("s-kst").textContent = "Key removed."; return; }
      $("s-kst").innerHTML = '<span class="spin"></span>';
      NET.keepaTokens(S.keepaKey).then(function (j) { $("s-kst").innerHTML = j.tokensLeft != null ? '<span class="good">✓ Connected — ' + j.tokensLeft + " tokens, +" + (j.refillRate || "?") + "/min</span>" : '<span class="bad">' + esc(JSON.stringify(j.error || j)) + "</span>"; }, function (e) { $("s-kst").innerHTML = '<span class="bad">' + esc(e.message) + "</span>"; });
    };
    $("s-exp").onclick = function () { NET.get(["shortlist", "tracked", "ranktrack", "niches", "listingDraft", "kwbank", "settings"]).then(function (v) { if (v.settings) v.settings.keepaKey = ""; UI.download("product-pilot-backup.json", JSON.stringify(v), "application/json"); }); };
    $("s-imp").onchange = function (e) { var f = e.target.files[0]; if (!f) return; f.text().then(function (t) { var o = JSON.parse(t); delete o.settings; return NET.set(o); }).then(function () { $("s-dst").textContent = "Imported ✓"; }, function (er) { $("s-dst").textContent = "Import failed: " + er.message; }); };
    $("s-cache").onclick = function () { chrome.storage.local.get(null, function (all) { var ks = Object.keys(all).filter(function (k) { return /^pc:/.test(k); }); chrome.storage.local.remove(ks, function () { $("s-dst").textContent = "Cleared " + ks.length + " cached products."; }); }); };
  }

  function applyTheme() {
    var d = S.theme === "dark" || (S.theme !== "light" && matchMedia("(prefers-color-scheme: dark)").matches);
    document.body.classList.toggle("dark", d); document.getElementById("app").classList.toggle("dark", d);
  }
  NET.settings().then(function (s) { S = s; applyTheme(); route(); });
})();
