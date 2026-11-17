/* Product Pilot content script — X-Ray panel on search / best-seller pages, profit card + deep panel on product pages. */
(function () {
  "use strict";
  if (window.__ppLoaded) return; window.__ppLoaded = true;
  var PP = globalThis.PP, UI = globalThis.PPUI, NET = globalThis.PPNET;
  var MKT = PP.marketFromHost(location.hostname);
  if (!MKT) return;
  var path = location.pathname;
  var isProduct = /\/(dp|gp\/product|gp\/aw\/d)\/[A-Z0-9]{10}/i.test(path);
  var isBest = /\/(gp\/)?(bestsellers|new-releases|movers-and-shakers|most-wished-for|zgbs)/i.test(path);
  var isSearch = !isProduct && (/^\/s(\/|$)/.test(path) || (/^\/s/.test(path) && /[?&](k|keywords)=/.test(location.search)));
  if (!isProduct && !isBest && !isSearch) return;

  var S = null; // settings
  var host = document.createElement("div"); host.id = "product-pilot-host";
  host.style.cssText = "all:initial;position:relative;z-index:2147483646";
  var shadow = host.attachShadow({ mode: "open" });
  var dark = false;
  var PANEL_CSS = [
    ".launch{position:fixed;right:18px;bottom:18px;z-index:2147483646;display:flex;align-items:center;gap:8px;background:#0f7a6b;color:#fff;border:0;border-radius:999px;padding:10px 16px 10px 12px;font:700 13px -apple-system,Segoe UI,sans-serif;box-shadow:0 6px 24px rgba(0,0,0,.25);cursor:pointer}",
    ".launch .m{width:22px;height:22px;border-radius:6px;background:#fff;color:#0f7a6b;display:grid;place-items:center;font-weight:800}",
    ".panel{position:fixed;inset:3vh 2vw;z-index:2147483647;background:var(--bg);border:1px solid var(--ln);border-radius:16px;box-shadow:0 30px 80px rgba(0,0,0,.35);display:flex;flex-direction:column;overflow:hidden}",
    ".ph{display:flex;align-items:center;gap:10px;padding:10px 14px;background:var(--sf);border-bottom:1px solid var(--ln)}",
    ".ph .logo{width:28px;height:28px;border-radius:7px;background:linear-gradient(135deg,var(--ac),var(--aci));color:#fff;display:grid;place-items:center;font-weight:800}",
    ".pb{flex:1;overflow:auto;padding:14px}.x{border:0;background:var(--sf2);color:var(--mu);width:30px;height:30px;border-radius:8px;cursor:pointer;font-size:16px}",
    ".card-inline{margin:10px 0 14px;border:1px solid var(--ln);border-radius:12px;background:var(--sf);padding:12px;box-shadow:0 2px 10px rgba(0,0,0,.06)}",
    ".prog{height:4px;background:var(--sf2);border-radius:3px;overflow:hidden;flex:1;min-width:80px;max-width:240px}.prog i{display:block;height:100%;background:var(--ac);transition:width .2s}"
  ].join("\n");
  function mount() {
    var st = document.createElement("style"); st.textContent = UI.CSS + "\n" + PANEL_CSS; shadow.appendChild(st);
    document.documentElement.appendChild(host);
  }
  function wrap(html) { return '<div class="pp' + (dark ? " dark" : "") + '">' + html + "</div>"; }
  var esc = UI.esc, money = function (n) { return PP.money(n, MKT); }, kmoney = function (n) { return PP.kmoney(n, MKT); };

  // ------------------------------------------------------------------ panel shell
  var panelEl = null, launchEl = null;
  function openPanel(title, sub, bodyHtml) {
    closePanel();
    panelEl = document.createElement("div");
    panelEl.innerHTML = wrap('<div class="panel"><div class="ph"><div class="logo">P</div><div class="grow"><b>' + esc(title) + '</b><div class="small muted">' + sub + '</div></div><span id="pp-status" class="small muted"></span><button class="btn gh sm" id="pp-studio">Open Studio ↗</button><button class="x" id="pp-close" title="Close">✕</button></div><div class="pb" id="pp-body">' + bodyHtml + "</div></div>");
    shadow.appendChild(panelEl);
    $("#pp-close").onclick = closePanel;
    $("#pp-studio").onclick = function () { NET.bg({ type: "openStudio" }); };
    document.addEventListener("keydown", escKey);
  }
  function escKey(e) { if (e.key === "Escape") closePanel(); }
  function closePanel() { if (panelEl) { panelEl.remove(); panelEl = null; document.removeEventListener("keydown", escKey); } }
  function $(sel) { return shadow.querySelector(sel); }
  function $$(sel) { return Array.prototype.slice.call(shadow.querySelectorAll(sel)); }
  function status(t) { var e = $("#pp-status"); if (e) e.innerHTML = t; }
  function launcher(label, fn) {
    launchEl = document.createElement("div");
    launchEl.innerHTML = '<button class="launch" title="Product Pilot"><span class="m">P</span>' + esc(label) + "</button>";
    shadow.appendChild(launchEl);
    launchEl.querySelector("button").onclick = fn;
  }
  function tabs(id, list, active) { return '<div class="tabs" id="' + id + '">' + list.map(function (t) { return '<button class="tab" data-t="' + t[0] + '" aria-selected="' + (t[0] === active) + '">' + t[1] + "</button>"; }).join("") + "</div>"; }

  // ------------------------------------------------------------------ storage actions
  function addShortlist(item) {
    return NET.get(["shortlist"]).then(function (v) {
      var a = v.shortlist || []; if (a.some(function (x) { return x.asin === item.asin && x.mkt === MKT; })) return false;
      a.unshift({ asin: item.asin, mkt: MKT, title: item.title, image: item.image, price: item.price, bsr: item.bsr, sales: item.sales, revenue: item.revenue, reviews: item.reviews, rating: item.rating, score: item.score, margin: item.margin, category: item.category, brand: item.brand, savedAt: Date.now() });
      return NET.set({ shortlist: a.slice(0, 500) }).then(function () { return true; });
    });
  }
  function addTracked(item) {
    return NET.get(["tracked"]).then(function (v) {
      var t = v.tracked || {}, k = MKT + ":" + item.asin;
      if (!t[k]) t[k] = { mkt: MKT, asin: item.asin, title: item.title, image: item.image, added: Date.now(), history: [] };
      if (item.price || item.bsr) t[k].history.push({ t: Date.now(), price: item.price || null, bsr: item.bsr || null, reviews: item.reviews || null, rating: item.rating || null, offers: item.offers || null, bought: item.bought || null, sales: item.sales || null });
      return NET.set({ tracked: t });
    });
  }

  // ================================================================== X-RAY (search + best sellers)
  var X = { items: [], query: "", sort: { key: "revenue", dir: -1 }, f: { hideSp: false, minSales: "", maxRev: "", pmin: "", pmax: "", text: "" }, tab: "products", page: 1, running: false, stop: false, resultCount: null, suggestions: null };

  function readPage() {
    if (isBest) {
      var b = PP.parseBestsellers(document);
      X.query = b.title || "Best Sellers";
      return b.items.map(function (x, i) { x.position = x.rank || i + 1; x.organicPosition = x.position; return x; });
    }
    var r = PP.parseSearch(document, MKT);
    X.resultCount = r.resultCount;
    var u = new URL(location.href); X.query = u.searchParams.get("k") || u.searchParams.get("keywords") || "";
    return r.items;
  }
  function startXray() {
    if (!X.items.length) { X.items = readPage(); X.items.forEach(function (it) { PP.enrich(it, MKT, S); }); }
    openPanel("X-Ray: " + (X.query || "this page"), PP.MARKETS[MKT].host + " · " + X.items.length + " products" + (X.resultCount ? " · " + X.resultCount.toLocaleString() + " results" : ""), '<div id="xr"></div>');
    renderX();
    if (!X.items.some(function (i) { return i.enriched; })) enrichAll();
  }
  function enrichAll() {
    if (X.running) return;
    var todo = X.items.filter(function (i) { return !i.enriched; });
    if (!todo.length) return;
    X.running = true; X.stop = false;
    status('<span class="spin"></span> Reading product pages <span class="prog" style="display:inline-block;vertical-align:middle;width:120px"><i id="pp-prog" style="width:0"></i></span> <span id="pp-pc">0/' + todo.length + '</span> <button class="btn gh sm" id="pp-stop">Stop</button>');
    var sb = $("#pp-stop"); if (sb) sb.onclick = function () { X.stop = true; };
    var lastRender = 0;
    NET.enrichItems(MKT, todo, S, function (d, n) {
      var p = $("#pp-prog"); if (p) p.style.width = (d / n * 100) + "%"; var c = $("#pp-pc"); if (c) c.textContent = d + "/" + n;
      if (Date.now() - lastRender > 900) { lastRender = Date.now(); renderX(); }
    }, function () { return X.stop; }).then(function (r) {
      X.running = false;
      status(r.captcha ? '<span class="bad">Amazon showed a robot check — solve it in a tab, then press “Re-scan”.</span>' : '<span class="good">✓ Data loaded</span>');
      renderX();
    });
  }
  function filtered() {
    var f = X.f, t = (f.text || "").toLowerCase();
    return X.items.filter(function (x) {
      if (f.hideSp && x.sponsored) return false;
      if (f.minSales !== "" && (x.sales || 0) < +f.minSales) return false;
      if (f.maxRev !== "" && (x.reviews || 0) > +f.maxRev) return false;
      if (f.pmin !== "" && (x.price || 0) < +f.pmin) return false;
      if (f.pmax !== "" && (x.price || 0) > +f.pmax) return false;
      if (t && (x.title + " " + (x.brand || "")).toLowerCase().indexOf(t) < 0) return false;
      return true;
    });
  }
  var XCOLS = [
    { key: "position", label: "#", render: function (r) { return r.position; } },
    { key: "img", label: "", render: function (r) { return r.image ? '<img class="thumb" src="' + esc(r.image) + '" loading="lazy">' : ""; }, sort: function () { return 0; } },
    { key: "title", label: "Product", wrap: true, render: function (r) {
      return '<a href="' + esc(PP.urls(MKT, r.asin).amazon) + '" target="_blank" title="' + esc(r.title) + '">' + esc((r.title || r.asin).slice(0, 90)) + '</a><div class="small faint">' + esc(r.asin) + (r.brand ? " · " + esc(r.brand) : "") + "</div>" +
        (r.sponsored ? '<span class="tag sp">Sponsored</span>' : "") + (r.badge ? '<span class="tag">' + esc(r.badge) + "</span>" : "") + (r.error ? '<span class="tag am" title="' + esc(r.error) + '">no detail</span>' : "");
    } },
    { key: "price", label: "Price", render: function (r) { return r.price ? money(r.price) : ""; } },
    { key: "bsr", label: "BSR", render: function (r) { return r.bsr ? "#" + r.bsr.toLocaleString() + '<div class="small faint" style="max-width:120px;overflow:hidden;text-overflow:ellipsis">' + esc(r.rankCategory || "") + "</div>" : (r.enriched ? "" : '<span class="spin"></span>'); } },
    { key: "sales", label: "Sales/mo", render: function (r) { if (!r.sales) return r.enriched ? "" : '<span class="spin"></span>'; var c = r.salesSource === "badge+rank" ? "var(--gd)" : r.salesSource === "badge" ? "var(--c2)" : "var(--wn)"; return '<span class="dot" style="background:' + c + '" title="' + esc(r.salesSource) + '"></span>' + r.sales.toLocaleString() + '<div class="small faint">' + PP.knum(r.salesLow) + "–" + PP.knum(r.salesHigh) + "</div>"; } },
    { key: "revenue", label: "Revenue/mo", render: function (r) { return r.revenue ? kmoney(r.revenue) : ""; } },
    { key: "reviews", label: "Reviews", render: function (r) { return r.reviews ? r.reviews.toLocaleString() : ""; } },
    { key: "rating", label: "★", render: function (r) { return r.rating ? r.rating.toFixed(1) : ""; } },
    { key: "sellerType", label: "Seller", render: function (r) { return r.sellerType ? '<span class="tag ' + (r.sellerType === "AMZ" ? "am" : r.sellerType === "FBA" ? "fb" : "") + '">' + r.sellerType + "</span>" : ""; } },
    { key: "offers", label: "Offers", render: function (r) { return r.offers || ""; } },
    { key: "fbaFee", label: "FBA fee", render: function (r) { return r.fbaFee != null ? money(r.fbaFee) + '<div class="small faint">' + esc(r.sizeTier || "") + "</div>" : ""; } },
    { key: "netEst", label: "Net/unit*", render: function (r) { return r.netEst != null ? '<span class="' + (r.netEst > 0 ? "good" : "bad") + '">' + money(r.netEst) + "</span>" : ""; } },
    { key: "variations", label: "Var.", render: function (r) { return r.variations || ""; } },
    { key: "dateFirstAvailable", label: "Listed", render: function (r) { return esc(r.dateFirstAvailable || ""); }, sort: function (r) { var d = Date.parse(r.dateFirstAvailable); return isFinite(d) ? d : null; } },
    { key: "score", label: "Score", render: function (r) { return UI.pill(r.score || 0); } },
    { key: "act", label: "", render: function (r, i) { return '<button class="btn gh sm" data-act="star" data-a="' + r.asin + '" title="Shortlist">☆</button> <button class="btn gh sm" data-act="track" data-a="' + r.asin + '" title="Track daily">📈</button> <a class="btn gh sm" href="' + esc(PP.urls(MKT, r.asin).keepa) + '" target="_blank" title="Keepa">K</a>'; }, sort: function () { return 0; } }
  ];
  function renderX() {
    var root = $("#xr"); if (!root) return;
    var rows = filtered(), sum = PP.marketSummary(rows, MKT);
    var h = '<div class="grid g6" style="margin-bottom:12px">' +
      '<div class="kpi" style="display:flex;gap:10px;align-items:center">' + UI.dial(sum.score) + '<div><div class="l">Niche score</div><div class="small" style="font-weight:600">' + esc(sum.verdict.split(" — ")[0]) + "</div></div></div>" +
      UI.kpi("Page revenue /mo", kmoney(sum.totalRevenue), PP.knum(sum.totalSales) + " units") +
      UI.kpi("Avg sales /mo", PP.knum(sum.avgSales), "per listing") +
      UI.kpi("Avg price", money(sum.avgPrice), "median " + money(sum.medianPrice)) +
      UI.kpi("Avg reviews", PP.knum(sum.avgReviews), "median " + PP.knum(sum.medianReviews) + " · " + (sum.avgRating ? sum.avgRating.toFixed(1) + "★" : "")) +
      UI.kpi("Top 3 share", Math.round(sum.top3Share * 100) + "%", "of page revenue") + "</div>";
    h += tabs("xt", [["products", "Products"], ["market", "Market analysis"], ["keywords", "Keywords"]], X.tab);
    if (X.tab === "products") {
      h += '<div class="row" style="margin:12px 0">' +
        '<input id="f-text" placeholder="Filter title/brand" value="' + esc(X.f.text) + '" style="width:170px">' +
        '<input id="f-min" type="number" placeholder="Min sales" value="' + esc(X.f.minSales) + '" style="width:95px">' +
        '<input id="f-rev" type="number" placeholder="Max reviews" value="' + esc(X.f.maxRev) + '" style="width:105px">' +
        '<input id="f-pmin" type="number" placeholder="Min price" value="' + esc(X.f.pmin) + '" style="width:90px">' +
        '<input id="f-pmax" type="number" placeholder="Max price" value="' + esc(X.f.pmax) + '" style="width:90px">' +
        '<label class="small"><input type="checkbox" id="f-sp"' + (X.f.hideSp ? " checked" : "") + "> Hide sponsored</label>" +
        '<span class="grow"></span>' +
        (isSearch ? '<button class="btn gh sm" id="x-more">+ Load page ' + (X.page + 1) + "</button>" : "") +
        '<button class="btn gh sm" id="x-rescan">Re-scan</button><button class="btn gh sm" id="x-csv">Export CSV</button><button class="btn sm" id="x-copy">Copy for Product Pilot</button><button class="btn gh sm" id="x-save">Save niche</button></div>';
      var sorted = UI.sortRows(rows, XCOLS, X.sort);
      h += '<div class="tw" style="max-height:58vh">' + UI.table("xtbl", XCOLS, sorted, X.sort) + "</div>";
      h += '<p class="note">Showing ' + rows.length + " of " + X.items.length + ". Sales: <span class='dot' style='background:var(--gd)'></span>rank model checked against Amazon's “bought in past month” badge · <span class='dot' style='background:var(--c2)'></span>badge only · <span class='dot' style='background:var(--wn)'></span>rank model only. *Net/unit assumes product cost = " + S.costPct + "% of price and " + S.acos + "% ACoS (change in Studio → Settings). Estimates, not Amazon figures.</p>";
      X._sorted = sorted;
    } else if (X.tab === "market") {
      h += renderMarket(rows, sum);
    } else {
      h += renderKeywords(rows);
    }
    root.innerHTML = h;
    bindX();
  }
  function renderMarket(rows, sum) {
    var top = rows.slice().sort(function (a, b) { return (b.revenue || 0) - (a.revenue || 0); }).slice(0, 10);
    var bands = {}, bw = sum.avgPrice > 100 ? 50 : sum.avgPrice > 40 ? 10 : 5;
    rows.forEach(function (r) { if (!r.price) return; var b = Math.floor(r.price / bw) * bw; bands[b] = bands[b] || { n: 0, rev: 0 }; bands[b].n++; bands[b].rev += r.revenue || 0; });
    var bandRows = Object.keys(bands).map(Number).sort(function (a, b) { return a - b; }).map(function (b) { return { label: PP.money(b, MKT).replace(/\.00$/, "") + "–" + PP.money(b + bw, MKT).replace(/\.00$/, ""), value: bands[b].rev }; });
    var revB = [[0, 50], [50, 200], [200, 1000], [1000, 5000], [5000, 1e9]].map(function (r) { return { label: r[1] > 1e8 ? r[0].toLocaleString() + "+ reviews" : r[0] + "–" + r[1].toLocaleString() + " reviews", value: rows.filter(function (x) { return (x.reviews || 0) >= r[0] && (x.reviews || 0) < r[1]; }).length }; });
    var brands = {}; rows.forEach(function (r) { var b = r.brand || "Unknown"; brands[b] = (brands[b] || 0) + (r.revenue || 0); });
    var brandRows = Object.keys(brands).map(function (b) { return { label: b, value: brands[b] }; }).sort(function (a, b) { return b.value - a.value; }).slice(0, 8);
    var flags = [];
    if (sum.newcomers >= 3) flags.push(UI.flag("g", sum.newcomers + " newcomers selling well", "Listings under 100 reviews already doing 150+ sales/mo — the niche rewards new entrants."));
    else flags.push(UI.flag("w", "Few newcomers break in", "Only " + sum.newcomers + " listing(s) under 100 reviews sell 150+/mo."));
    if (sum.top3Share > 0.6) flags.push(UI.flag("b", "Top 3 take " + Math.round(sum.top3Share * 100) + "% of revenue", "Demand is concentrated — hard to take share.")); else flags.push(UI.flag("g", "Revenue is spread out", "Top 3 take " + Math.round(sum.top3Share * 100) + "% — room for more sellers."));
    if (sum.amazonSells >= 3) flags.push(UI.flag("b", "Amazon sells " + sum.amazonSells + " of these", "Competing with Amazon retail means price pressure and buy-box loss."));
    if (sum.lowRated >= 3) flags.push(UI.flag("g", sum.lowRated + " listings under 4.2★", "Customers are unhappy — a better product can win. Read their 1–3★ reviews."));
    if (sum.topBrandShare > 0.4) flags.push(UI.flag("w", "“" + sum.topBrand + "” holds " + Math.round(sum.topBrandShare * 100) + "%", "One dominant brand on page 1."));
    if (sum.avgReviews > 1500) flags.push(UI.flag("b", "Average " + PP.knum(sum.avgReviews) + " reviews", "Big review moat — expensive to rank.")); else if (sum.avgReviews < 400) flags.push(UI.flag("g", "Low review wall", "Average " + PP.knum(sum.avgReviews) + " reviews."));
    if (sum.avgPrice < 15) flags.push(UI.flag("w", "Low average price", "Fees eat most of the margin under " + PP.money(15, MKT) + "."));
    return '<div class="grid g2" style="margin-top:12px"><div class="card"><div class="eb">Opportunity read</div><div style="margin-top:8px">' + flags.join("") + '</div><p class="note">' + esc(sum.verdict) + ". Seller mix: " + sum.amazonSells + " Amazon · " + sum.fba + " FBA · " + sum.fbm + " FBM · " + sum.brandCount + " brands.</p></div>" +
      '<div class="card"><div class="eb">Revenue by listing (top 10)</div><div style="margin-top:10px">' + UI.hbars(top.map(function (r) { return { label: r.brand ? r.brand + " — " + r.title : r.title, value: r.revenue || 0 }; }), kmoney) + "</div></div>" +
      '<div class="card"><div class="eb">Revenue by price band</div><div style="margin-top:10px">' + UI.hbars(bandRows, kmoney) + '</div><p class="note">The band with most revenue per listing is the price buyers accept.</p></div>' +
      '<div class="card"><div class="eb">Review distribution</div><div style="margin-top:10px">' + UI.hbars(revB, function (v) { return v + " listings"; }) + '</div><div class="eb" style="margin-top:14px">Brand share of revenue</div><div style="margin-top:8px">' + UI.hbars(brandRows, kmoney) + "</div></div></div>";
  }
  function renderKeywords(rows) {
    var grams = PP.ngrams(rows.map(function (r) { return r.title; }), 3).filter(function (g) { return g.words > 1 || g.docs >= 3; }).slice(0, 60);
    var h = '<div class="grid g2" style="margin-top:12px"><div class="card"><div class="eb">Keywords competitors target</div><p class="note">Phrases that appear in the most page-1 titles — the terms Amazon associates with this niche.</p><div class="tw" style="max-height:52vh;margin-top:8px"><table class="t"><thead><tr><th>Phrase</th><th>In titles</th><th>Uses</th></tr></thead><tbody>' +
      grams.map(function (g) { return "<tr><td>" + esc(g.term) + "</td><td>" + g.docs + "/" + rows.length + "</td><td>" + g.count + "</td></tr>"; }).join("") + "</tbody></table></div></div>";
    h += '<div class="card"><div class="eb">Amazon search suggestions</div><p class="note">Live from Amazon autocomplete for “' + esc(X.query) + '” — what shoppers actually type.</p><div id="sugg" style="margin-top:8px">' + (X.suggestions ? X.suggestions.map(function (s) { return '<span class="chip">' + esc(s.kw) + "</span>"; }).join("") || '<span class="note">No suggestions.</span>' : '<button class="btn sm" id="x-sugg">Load suggestions (A–Z)</button>') + '</div><div class="row" style="margin-top:10px"><button class="btn gh sm" id="x-kwcopy">Copy all keywords</button><button class="btn gh sm" id="x-kwstudio">Deep keyword research in Studio ↗</button></div></div></div>';
    return h;
  }
  function bindX() {
    $$("#xt .tab").forEach(function (b) { b.onclick = function () { X.tab = b.getAttribute("data-t"); renderX(); }; });
    $$("#xtbl th").forEach(function (th) { th.onclick = function () { var k = th.getAttribute("data-k"); if (X.sort.key === k) X.sort.dir *= -1; else { X.sort.key = k; X.sort.dir = k === "title" || k === "position" ? 1 : -1; } renderX(); }; });
    function fb(id, key, isCb) { var e = $("#" + id); if (!e) return; e.onchange = function () { X.f[key] = isCb ? e.checked : e.value; renderX(); var n = $("#" + id); if (n && !isCb) { n.focus(); } }; }
    fb("f-text", "text"); fb("f-min", "minSales"); fb("f-rev", "maxRev"); fb("f-pmin", "pmin"); fb("f-pmax", "pmax"); fb("f-sp", "hideSp", true);
    $$("#xtbl [data-act]").forEach(function (b) {
      b.onclick = function () {
        var it = X.items.filter(function (x) { return x.asin === b.getAttribute("data-a"); })[0]; if (!it) return;
        if (b.getAttribute("data-act") === "star") addShortlist(it).then(function (ok) { b.textContent = ok ? "★" : "✓"; });
        else addTracked(it).then(function () { b.textContent = "✓"; });
      };
    });
    var m = $("#x-more"); if (m) m.onclick = function () {
      m.disabled = true; m.innerHTML = '<span class="spin"></span>';
      NET.search(MKT, X.query, X.page + 1).then(function (r) {
        X.page++; var have = {}; X.items.forEach(function (i) { have[i.asin] = 1; });
        var base = X.items.length;
        r.items.forEach(function (it) { if (have[it.asin]) return; it.position = base + it.position; PP.enrich(it, MKT, S); X.items.push(it); });
        renderX(); enrichAll();
      }, function (e) { status('<span class="bad">' + esc(e.message) + "</span>"); m.disabled = false; m.textContent = "Retry"; });
    };
    var rs = $("#x-rescan"); if (rs) rs.onclick = function () { X.items.forEach(function (i) { if (i.error) { i.enriched = false; i.error = ""; } }); enrichAll(); };
    var c = $("#x-csv"); if (c) c.onclick = function () { UI.download("xray-" + (X.query || "page").replace(/\W+/g, "-") + "-" + MKT + ".csv", PP.toCSV(X._sorted || X.items, PP.XRAY_COLS)); };
    var cp = $("#x-copy"); if (cp) cp.onclick = function () { UI.copy(exportJSON()).then(function () { cp.textContent = "Copied ✓ — paste into Product Pilot"; }); };
    var sv = $("#x-save"); if (sv) sv.onclick = function () {
      NET.get(["niches"]).then(function (v) { var a = v.niches || []; a.unshift({ q: X.query, mkt: MKT, t: Date.now(), summary: PP.marketSummary(filtered(), MKT), items: compact(X.items) }); return NET.set({ niches: a.slice(0, 100) }); }).then(function () { sv.textContent = "Saved ✓"; });
    };
    var sg = $("#x-sugg"); if (sg) sg.onclick = function () {
      sg.disabled = true; sg.innerHTML = '<span class="spin"></span> Asking Amazon…';
      NET.expand(MKT, X.query || "", {}, function (d, n) { sg.innerHTML = '<span class="spin"></span> ' + d + "/" + n; }).then(function (list) { X.suggestions = list.sort(function (a, b) { return b.hits - a.hits || a.rank - b.rank; }); renderX(); }, function (e) { sg.textContent = "Failed: " + e.message; });
    };
    var kc = $("#x-kwcopy"); if (kc) kc.onclick = function () { var g = PP.ngrams(filtered().map(function (r) { return r.title; }), 3).slice(0, 60).map(function (x) { return x.term; }); var s = (X.suggestions || []).map(function (x) { return x.kw; }); UI.copy(s.concat(g).join("\n")).then(function () { kc.textContent = "Copied ✓"; }); };
    var ks = $("#x-kwstudio"); if (ks) ks.onclick = function () { NET.bg({ type: "openStudio", hash: "keywords?q=" + encodeURIComponent(X.query) + "&m=" + MKT }); };
  }
  function compact(items) { return items.map(function (x) { return { asin: x.asin, title: x.title, brand: x.brand, price: x.price, bsr: x.bsr, rankCategory: x.rankCategory, category: x.category, sales: x.sales, salesLow: x.salesLow, salesHigh: x.salesHigh, salesSource: x.salesSource, bought: x.bought, revenue: Math.round(x.revenue || 0), reviews: x.reviews, rating: x.rating, sellerType: x.sellerType, offers: x.offers, fbaFee: x.fbaFee, sizeTier: x.sizeTier, weightKg: isFinite(x.weightKg) ? +x.weightKg.toFixed(3) : null, dims: x.dims, variations: x.variations, images: x.images, video: x.video, aplus: x.aplus, dateFirstAvailable: x.dateFirstAvailable, sponsored: x.sponsored, position: x.position, organicPosition: x.organicPosition, badge: x.badge, image: x.image, score: x.score }; }); }
  function exportJSON() { return JSON.stringify({ source: "product-pilot-extension", v: 2, kind: isBest ? "bestsellers" : "search", mkt: MKT, query: X.query, url: location.href, t: Date.now(), resultCount: X.resultCount, items: compact(X.items) }); }

  // ================================================================== PRODUCT PAGE
  var P = null, PT = "overview", CALC = null;
  function initProduct() {
    P = PP.parseProduct(document, MKT, location.href);
    if (!P.asin) return;
    var est = PP.estimateSales({ bsr: P.bsr, category: P.category, mkt: MKT, bought: P.bought });
    P.sales = est.units; P.salesLow = est.low; P.salesHigh = est.high; P.salesSource = est.source; P.revenue = P.sales * (P.price || 0);
    var fee = PP.fbaFee({ weightKg: P.weightKg, dims: P.dims, price: P.price, mkt: MKT });
    P.fbaFee = isFinite(fee.fee) ? fee.fee : null; P.sizeTier = fee.tier;
    NET.get(["cost:" + MKT + ":" + P.asin]).then(function (v) {
      var saved = v["cost:" + MKT + ":" + P.asin] || {};
      CALC = Object.assign({ price: P.price || 0, cost: +((P.price || 0) * S.costPct / 100).toFixed(2), freight: 0, prep: 0, weightKg: isFinite(P.weightKg) ? +P.weightKg.toFixed(3) : 0.5, l: P.dims ? +P.dims.l.toFixed(1) : 30, w: P.dims ? +P.dims.w.toFixed(1) : 20, h: P.dims ? +P.dims.h.toFixed(1) : 10, acos: S.acos, returns: S.returns, storageMonths: 1.5, fbm: false, shipFbm: 0, vatRegistered: !!S.vatRegistered, category: P.category }, saved);
      if (!saved.price && P.price) CALC.price = P.price;
      P.grade = PP.gradeListing({ title: P.title, bullets: P.bullets, description: P.description, images: P.images, video: P.video, aplus: P.aplus, rating: P.rating, reviews: P.reviews, keywords: [] });
      inlineCard();
      launcher("Analyze product", function () { openProductPanel("overview"); });
    });
  }
  function calcResult() {
    return PP.profit({ price: CALC.price, cost: CALC.cost, freight: CALC.freight, prep: CALC.prep, catName: CALC.category, mkt: MKT, weightKg: CALC.weightKg, dims: { l: +CALC.l, w: +CALC.w, h: +CALC.h }, acos: CALC.acos, returns: CALC.returns, storageMonths: CALC.storageMonths, fbm: CALC.fbm, shipFbm: CALC.shipFbm, vatRegistered: CALC.vatRegistered });
  }
  function inlineCard() {
    if (!S.autoCard) return;
    var anchor = document.querySelector("#titleSection") || document.querySelector("#title_feature_div") || document.querySelector("#centerCol");
    if (!anchor) return;
    var box = document.createElement("div"); box.id = "pp-inline-host";
    var sh = box.attachShadow({ mode: "open" });
    var st = document.createElement("style"); st.textContent = UI.CSS + "\n" + PANEL_CSS; sh.appendChild(st);
    var r = calcResult();
    P.margin = r.margin; P.score = PP.productScore(P);
    var div = document.createElement("div");
    div.innerHTML = wrap('<div class="card-inline"><div class="row" style="margin-bottom:8px"><b style="color:var(--ac)">Product Pilot</b><span class="small muted">' + MKT + " · " + esc(P.asin) + '</span><span class="grow"></span>' + UI.pill(P.score) + '<span class="small muted">opportunity</span></div><div class="grid g6">' +
      UI.kpi("BSR", P.bsr ? "#" + P.bsr.toLocaleString() : "—", esc(P.rankCategory || "no rank shown")) +
      UI.kpi("Est. sales /mo", P.sales ? P.sales.toLocaleString() : "—", P.sales ? PP.knum(P.salesLow) + "–" + PP.knum(P.salesHigh) + " · " + P.salesSource : "") +
      UI.kpi("Revenue /mo", P.revenue ? kmoney(P.revenue) : "—", P.price ? "at " + money(P.price) : "") +
      UI.kpi("FBA fee", P.fbaFee != null ? money(P.fbaFee) : "—", esc(P.sizeTier || "")) +
      UI.kpi("Net / unit", money(r.net), Math.round(r.margin) + "% margin · cost " + money(CALC.cost), r.net > 0 ? "good" : "bad") +
      UI.kpi("Listing grade", P.grade.score + "/100", P.images + " img · " + (P.video ? "video" : "no video") + " · " + (P.aplus ? "A+" : "no A+")) +
      '</div><div class="row small muted" style="margin-top:8px">' +
      "<span>Seller: <b>" + esc(P.sellerType || "?") + "</b></span><span>Offers: <b>" + (P.offers || "?") + "</b></span><span>Variations: <b>" + (P.variations || 0) + "</b></span>" + (P.dateFirstAvailable ? "<span>Listed: <b>" + esc(P.dateFirstAvailable) + "</b></span>" : "") + (P.bought ? "<span>Amazon badge: <b>" + P.bought.toLocaleString() + "+ bought last month</b></span>" : "") +
      '<span class="grow"></span><button class="btn sm" id="c-open">Full analysis</button><button class="btn gh sm" id="c-track">📈 Track</button><button class="btn gh sm" id="c-star">☆ Shortlist</button><a class="btn gh sm" target="_blank" href="' + esc(PP.urls(MKT, P.asin).keepa) + '">Keepa</a></div></div>');
    sh.appendChild(div);
    anchor.parentNode.insertBefore(box, anchor.nextSibling);
    div.querySelector("#c-open").onclick = function () { openProductPanel("overview"); };
    div.querySelector("#c-track").onclick = function (e) { addTracked(P).then(function () { e.target.textContent = "✓ Tracking"; }); };
    div.querySelector("#c-star").onclick = function (e) { addShortlist(P).then(function (ok) { e.target.textContent = ok ? "★ Saved" : "✓ Saved"; }); };
  }
  function openProductPanel(tab) {
    PT = tab || PT;
    openPanel(P.title ? P.title.slice(0, 90) : P.asin, PP.MARKETS[MKT].host + " · " + esc(P.asin) + (P.brand ? " · " + esc(P.brand) : ""), '<div id="pr"></div>');
    renderP();
  }
  function renderP() {
    var root = $("#pr"); if (!root) return;
    var h = tabs("pt", [["overview", "Overview"], ["profit", "Profit calculator"], ["history", "Price & rank history"], ["reviews", "Reviews"], ["listing", "Listing"], ["keywords", "Keywords & rank"], ["sourcing", "Sourcing"]], PT);
    h += '<div style="margin-top:12px" id="ptb">' + ({ overview: pOverview, profit: pProfit, history: pHistory, reviews: pReviews, listing: pListing, keywords: pKeywords, sourcing: pSourcing }[PT])() + "</div>";
    root.innerHTML = h;
    $$("#pt .tab").forEach(function (b) { b.onclick = function () { PT = b.getAttribute("data-t"); renderP(); }; });
    var fn = { profit: bindProfit, history: bindHistory, listing: bindListing, keywords: bindKeywords }[PT]; if (fn) fn();
  }
  function pOverview() {
    var r = calcResult();
    var flags = [];
    if (P.sales >= 300) flags.push(UI.flag("g", "Proven demand", "~" + P.sales.toLocaleString() + " units/month.")); else if (P.sales > 0) flags.push(UI.flag("w", "Modest demand", "~" + P.sales + " units/month."));
    if (P.reviews > 0 && P.reviews < 200) flags.push(UI.flag("g", "Beatable review count", P.reviews + " reviews.")); else if (P.reviews >= 2000) flags.push(UI.flag("b", "Huge review moat", P.reviews.toLocaleString() + " reviews."));
    if (P.rating > 0 && P.rating < 4.2) flags.push(UI.flag("g", "Rating gap " + P.rating.toFixed(1) + "★", "Customers are unhappy — see the Reviews tab for why."));
    if (P.sellerType === "AMZ") flags.push(UI.flag("b", "Amazon is the seller", "Hard to win the buy box against Amazon retail."));
    if (P.offers > 5) flags.push(UI.flag("w", P.offers + " sellers on this listing", "Buy-box rotation; possible price war."));
    if (r.margin >= 25) flags.push(UI.flag("g", "Healthy margin " + Math.round(r.margin) + "%", "At your cost of " + money(CALC.cost) + ".")); else flags.push(UI.flag(r.margin > 10 ? "w" : "b", "Margin " + Math.round(r.margin) + "%", "Check the Profit tab with your real supplier cost."));
    if (/oversize|bulky|Extra-large/i.test(P.sizeTier || "")) flags.push(UI.flag("w", "Oversize item", (P.sizeTier || "") + " — higher fees and storage."));
    var det = [["ASIN", P.asin], ["Parent ASIN", P.parentAsin], ["Brand", P.brand], ["Manufacturer", P.manufacturer], ["Model", P.model], ["Category", P.breadcrumbs.join(" › ")], ["Best Sellers Rank", P.ranks.map(function (x) { return "#" + x.rank.toLocaleString() + " in " + x.category; }).join(" · ")], ["Price", P.price ? money(P.price) + (P.listPrice ? " (list " + money(P.listPrice) + ")" : "") : ""], ["Rating", P.rating ? P.rating.toFixed(1) + "★ from " + P.reviews.toLocaleString() : ""], ["Sold by", P.soldBy], ["Ships from", P.shipsFrom], ["Offers", P.offers], ["Variations", P.variations], ["Dimensions", P.dimsText], ["Weight", P.weightText && isFinite(P.weightKg) ? P.weightKg.toFixed(2) + " kg" : ""], ["Size tier", P.sizeTier], ["Date first available", P.dateFirstAvailable], ["Badges", P.badges.join(", ")], ["Availability", P.availability]];
    return '<div class="grid g4" style="margin-bottom:12px">' + UI.kpi("Est. sales /mo", P.sales ? P.sales.toLocaleString() : "—", P.salesSource) + UI.kpi("Revenue /mo", P.revenue ? kmoney(P.revenue) : "—") + UI.kpi("Net profit /mo", P.sales ? kmoney(r.net * P.sales) : "—", money(r.net) + "/unit") + UI.kpi("Opportunity", (P.score || PP.productScore(P)) + "/100", PP.scoreLabel(P.score || 0)) + "</div>" +
      '<div class="grid g2"><div class="card"><div class="eb">Verdict</div><div style="margin-top:8px">' + flags.join("") + '</div></div><div class="card"><div class="eb">Product data</div><table class="t" style="margin-top:6px">' + det.filter(function (d) { return d[1]; }).map(function (d) { return '<tr><td class="muted" style="width:150px">' + d[0] + '</td><td class="wrap">' + esc(d[1]) + "</td></tr>"; }).join("") + "</table></div></div>";
  }
  function field(id, label, val, step, suf) { return '<label class="f">' + label + '<input id="' + id + '" type="number" step="' + (step || "0.01") + '" value="' + esc(val) + '">' + (suf ? '<span class="faint" style="font-weight:400">' + suf + "</span>" : "") + "</label>"; }
  function pProfit() {
    var r = calcResult(), c = PP.MARKETS[MKT].cur;
    var catOpts = PP.catNames.map(function (n) { return "<option" + (n === CALC.category ? " selected" : "") + ">" + n + "</option>"; }).join("");
    return '<div class="grid g2"><div class="card"><div class="eb">Your numbers</div><div class="grid g3" style="margin-top:10px">' +
      field("c-price", "Sell price " + c, CALC.price) + field("c-cost", "Product cost " + c, CALC.cost) + field("c-freight", "Freight /unit " + c, CALC.freight) +
      field("c-prep", "Prep & labels " + c, CALC.prep) + field("c-acos", "Ad spend (ACoS %)", CALC.acos, "1") + field("c-ret", "Return rate %", CALC.returns, "0.5") +
      field("c-wt", "Weight kg", CALC.weightKg, "0.01") + field("c-l", "Length cm", CALC.l, "0.1") + field("c-w", "Width cm", CALC.w, "0.1") + field("c-h", "Height cm", CALC.h, "0.1") + field("c-stm", "Months in storage", CALC.storageMonths, "0.5") +
      '<label class="f">Category<select id="c-cat">' + catOpts + "</select></label>" +
      '</div><div class="row" style="margin-top:10px"><label class="small"><input type="checkbox" id="c-fbm"' + (CALC.fbm ? " checked" : "") + '> Merchant fulfilled (FBM)</label><input id="c-ship" type="number" step="0.01" placeholder="Your shipping cost" value="' + esc(CALC.shipFbm || "") + '" style="width:150px">' + (MKT !== "US" && MKT !== "CA" ? '<label class="small"><input type="checkbox" id="c-vat"' + (CALC.vatRegistered ? " checked" : "") + "> VAT registered (deduct VAT)</label>" : "") + '<button class="btn sm" id="c-save">Save for this ASIN</button></div><p class="note">Fees use Amazon\'s published ' + (MKT === "US" ? "US 2025" : "UK/EU 2025") + " size tiers and referral rates (approximate — confirm in Amazon's Revenue Calculator before ordering stock).</p></div>" +
      '<div class="card"><div class="eb">Per unit</div><table class="t" style="margin-top:6px">' +
      [["Sell price", money(r.price)], r.vat ? ["VAT", "-" + money(r.vat)] : null, ["Referral fee", "-" + money(r.referral)], ["Fulfilment (" + esc(r.tier) + ")", "-" + money(r.fba)], ["Storage", "-" + money(r.storage)], ["Landed cost", "-" + money(r.landed)], ["Advertising", "-" + money(r.ads)], ["Returns", "-" + money(r.returns)]].filter(Boolean).map(function (x) { return '<tr><td class="muted">' + x[0] + '</td><td style="text-align:right">' + x[1] + "</td></tr>"; }).join("") +
      '<tr><td><b>Net profit</b></td><td style="text-align:right;font-size:16px" class="' + (r.net > 0 ? "good" : "bad") + '"><b>' + money(r.net) + "</b></td></tr></table>" +
      '<div class="grid g3" style="margin-top:10px">' + UI.kpi("Margin", Math.round(r.margin) + "%") + UI.kpi("ROI", Math.round(r.roi) + "%") + UI.kpi("Profit /mo", P.sales ? kmoney(r.net * P.sales) : "—", P.sales ? "at " + P.sales + " units" : "") + UI.kpi("Break-even price", isFinite(r.breakEvenPrice) ? money(r.breakEvenPrice) : "—") + UI.kpi("Break-even ACoS", isFinite(r.breakEvenAcos) ? Math.max(0, Math.round(r.breakEvenAcos)) + "%" : "—") + UI.kpi("Max CPC @10% CVR", money(Math.max(0, r.net + r.ads) * 0.1)) + "</div></div></div>";
  }
  function bindProfit() {
    var map = { "c-price": "price", "c-cost": "cost", "c-freight": "freight", "c-prep": "prep", "c-acos": "acos", "c-ret": "returns", "c-wt": "weightKg", "c-l": "l", "c-w": "w", "c-h": "h", "c-stm": "storageMonths", "c-ship": "shipFbm" };
    Object.keys(map).forEach(function (id) { var e = $("#" + id); if (e) e.onchange = function () { CALC[map[id]] = parseFloat(e.value) || 0; renderP(); }; });
    $("#c-cat").onchange = function (e) { CALC.category = e.target.value; renderP(); };
    $("#c-fbm").onchange = function (e) { CALC.fbm = e.target.checked; renderP(); };
    var v = $("#c-vat"); if (v) v.onchange = function (e) { CALC.vatRegistered = e.target.checked; renderP(); };
    $("#c-save").onclick = function (e) { var o = {}; o["cost:" + MKT + ":" + P.asin] = CALC; NET.set(o).then(function () { e.target.textContent = "Saved ✓"; }); };
  }
  function pHistory() {
    return '<div class="grid g2"><div class="card"><div class="eb">Price history — CamelCamelCamel (free)</div><div id="h-camel" style="margin-top:10px;min-height:120px"><span class="spin"></span> loading chart…</div><p class="note"><a target="_blank" href="' + esc(PP.urls(MKT, P.asin).camel) + '">Open full history on CamelCamelCamel ↗</a></p></div>' +
      '<div class="card"><div class="eb">Keepa — price, rank, sales &amp; offers</div><div id="h-keepa" style="margin-top:10px"></div></div>' +
      '<div class="card" style="grid-column:1/-1"><div class="eb">Your own tracking history</div><div id="h-own" style="margin-top:10px"></div></div></div>';
  }
  function bindHistory() {
    NET.camelChart(MKT, P.asin).then(function (d) { var e = $("#h-camel"); if (e) e.innerHTML = '<img src="' + d + '" style="width:100%;border-radius:8px;background:#fff">'; }, function () { var e = $("#h-camel"); if (e) e.innerHTML = '<p class="note">CamelCamelCamel has no chart for this product yet (it starts tracking after someone looks it up). Use the link below.</p>'; });
    var k = $("#h-keepa");
    if (!S.keepaKey) { k.innerHTML = '<p class="note">Add your Keepa API key in Studio → Settings to draw full 1-year price, Best Sellers Rank, review-count, offer-count and monthly-sold history here — the same data the Keepa extension shows.</p><a class="btn gh sm" target="_blank" href="' + esc(PP.urls(MKT, P.asin).keepa) + '">Open on Keepa.com (free view) ↗</a>'; }
    else {
      k.innerHTML = '<span class="spin"></span> Fetching from Keepa…';
      NET.keepaProduct(S.keepaKey, MKT, P.asin).then(function (r) {
        var kp = r.products[0]; if (!kp) { k.innerHTML = '<p class="note">Keepa has no data for this ASIN.</p>'; return; }
        var hs = kp.history, st = kp.stats || {};
        var drops = st.salesRankDrops30 != null ? '<div class="grid g4" style="margin-bottom:8px">' + UI.kpi("Rank drops 30d", st.salesRankDrops30, "≈ sales events") + UI.kpi("Rank drops 90d", st.salesRankDrops90) + UI.kpi("Monthly sold (Amazon)", kp.bought ? kp.bought + "+" : "—") + UI.kpi("Listed since", kp.listedSince || "—") + "</div>" : "";
        k.innerHTML = drops + '<div class="small muted">Price</div>' + UI.lineChart([{ name: "Amazon", color: "var(--c3)", points: hs.amazon }, { name: "New 3rd party", color: "var(--c2)", points: hs.new }, { name: "Buy box", color: "var(--c1)", points: hs.buybox }], { step: true, h: 180, fmt: function (v) { return PP.money(v, MKT); } }) +
          '<div class="small muted" style="margin-top:10px">Best Sellers Rank (lower is better)</div>' + UI.lineChart([{ name: "BSR", color: "var(--c4)", points: hs.rank }], { invert: true, h: 160 }) +
          (kp.monthlySoldHistory.length ? '<div class="small muted" style="margin-top:10px">Bought in past month (Amazon badge history)</div>' + UI.lineChart([{ name: "Monthly sold", color: "var(--c1)", points: kp.monthlySoldHistory }], { step: true, h: 140 }) : "") +
          '<div class="small muted" style="margin-top:10px">Reviews &amp; offers</div>' + UI.lineChart([{ name: "Review count", color: "var(--c5)", points: hs.reviews }, { name: "New offers", color: "var(--c2)", points: hs.offers }], { step: true, h: 140 }) +
          '<p class="note">Keepa tokens left: ' + r.tokensLeft + "</p>";
      }, function (e) { k.innerHTML = '<p class="bad">' + esc(e.message) + "</p>"; });
    }
    NET.get(["tracked"]).then(function (v) {
      var t = (v.tracked || {})[MKT + ":" + P.asin], e = $("#h-own"); if (!e) return;
      if (!t || !t.history || t.history.length < 2) { e.innerHTML = '<p class="note">' + (t ? "Tracking started — the chart appears after the next daily check." : "Not tracked yet.") + ' Tracking records price, rank, reviews and offers every day so you build your own Keepa-style history.</p>' + (t ? "" : '<button class="btn sm" id="h-track">📈 Start tracking</button>'); var b = $("#h-track"); if (b) b.onclick = function () { addTracked(P).then(function () { b.textContent = "✓ Tracking"; }); }; return; }
      var H = t.history;
      e.innerHTML = '<div class="grid g2"><div>' + UI.lineChart([{ name: "Price", color: "var(--c2)", points: H.map(function (x) { return { t: x.t, v: x.price }; }) }], { step: true, h: 150, fmt: function (v) { return PP.money(v, MKT); } }) + "</div><div>" + UI.lineChart([{ name: "BSR", color: "var(--c4)", points: H.map(function (x) { return { t: x.t, v: x.bsr }; }) }], { invert: true, h: 150 }) + "</div></div>";
    });
  }
  function pReviews() {
    var hist = P.histogram, tot = 0; for (var k in hist) tot += hist[k];
    var bars = [5, 4, 3, 2, 1].map(function (s) { return { label: s + " star", value: hist[s] || 0, color: s >= 4 ? "var(--gd)" : s === 3 ? "var(--wn)" : "var(--bd)" }; });
    var text = P.topReviews.map(function (r) { return r.title + ". " + r.body; }).join("\n");
    var neg = P.topReviews.filter(function (r) { return r.rating && r.rating <= 3; }).map(function (r) { return r.title + ". " + r.body; }).join("\n");
    var th = PP.reviewThemes(neg || text), thAll = PP.reviewThemes(text);
    return '<div class="grid g2"><div class="card"><div class="eb">Rating breakdown</div><div style="margin-top:10px">' + (tot ? UI.hbars(bars, function (v) { return v + "%"; }) : '<p class="note">Histogram not shown on this page.</p>') + "</div>" +
      (P.customersSay ? '<div class="eb" style="margin-top:12px">Amazon “Customers say” summary</div><p>' + esc(P.customersSay) + "</p>" : "") +
      (P.aspects.length ? '<div class="eb" style="margin-top:8px">Aspects</div><div>' + P.aspects.map(function (a) { return '<span class="chip">' + esc(a) + "</span>"; }).join("") + "</div>" : "") +
      '<p class="note" style="margin-top:10px">' + P.topReviews.length + ' reviews are on this page. For a deeper read, open <a target="_blank" href="' + esc(PP.urls(MKT, P.asin).reviews) + '">all reviews</a>, copy them and paste into Studio → Review analyzer or the Product Pilot artifact (Claude analysis).</p></div>' +
      '<div class="card"><div class="eb">Complaint themes ' + (neg ? "(1–3★ reviews)" : "(all on-page reviews)") + '</div><div style="margin-top:8px">' + (th.negative.length ? th.negative.slice(0, 14).map(function (x) { return '<span class="chip" style="border-color:var(--bd)">' + esc(x[0]) + " <b>" + x[1] + "</b></span>"; }).join("") : '<span class="note">None detected.</span>') + "</div>" +
      '<div class="eb" style="margin-top:12px">Praise themes</div><div style="margin-top:8px">' + (thAll.positive.length ? thAll.positive.slice(0, 14).map(function (x) { return '<span class="chip" style="border-color:var(--gd)">' + esc(x[0]) + " <b>" + x[1] + "</b></span>"; }).join("") : '<span class="note">None detected.</span>') + "</div></div>" +
      '<div class="card" style="grid-column:1/-1"><div class="eb">Reviews on this page</div>' + (P.topReviews.length ? P.topReviews.map(function (r) { return '<div style="padding:8px 0;border-bottom:1px solid var(--ln)"><b>' + (r.rating ? r.rating + "★ " : "") + esc(r.title) + '</b> <span class="small faint">' + esc(r.date) + (r.verified ? " · verified" : "") + '</span><div class="small muted">' + esc(r.body.slice(0, 600)) + "</div></div>"; }).join("") : '<p class="note">No reviews rendered on this page.</p>') + "</div></div>";
  }
  var LKW = null;
  function pListing() {
    if (!LKW) LKW = [];
    var g = PP.gradeListing({ title: P.title, bullets: P.bullets, description: P.description, images: P.images, video: P.video, aplus: P.aplus, rating: P.rating, reviews: P.reviews, keywords: LKW });
    var dens = PP.ngrams([P.title + " " + P.bullets.join(" ") + " " + P.description], 1).concat(PP.ngrams([P.title, P.bullets.join(" "), P.description], 2)).sort(function (a, b) { return b.count - a.count; }).slice(0, 30);
    var parts = { title: 15, bullets: 15, images: 15, video: 5, aplus: 10, desc: 5, reviews: 15, keywords: 15 };
    return '<div class="grid g2"><div class="card"><div class="row">' + UI.dial(g.score) + '<div><h2>Listing grade</h2><div class="small muted">' + P.title.length + " title chars · " + P.bullets.length + " bullets · " + P.images + " images" + (P.video ? " · video" : "") + (P.aplus ? " · A+" : "") + "</div></div></div>" +
      '<div style="margin-top:10px">' + Object.keys(parts).map(function (k) { return '<div class="row" style="flex-wrap:nowrap;margin-bottom:5px"><span class="small muted" style="width:90px">' + k + '</span><div class="bar grow"><i style="width:' + ((g.parts[k] || 0) / parts[k] * 100) + '%"></i></div><span class="small" style="width:44px;text-align:right">' + (g.parts[k] || 0) + "/" + parts[k] + "</span></div>"; }).join("") + "</div>" +
      '<label class="f" style="margin-top:10px">Target keywords (comma-separated) — checks coverage<input id="l-kw" value="' + esc(LKW.join(", ")) + '" placeholder="e.g. divan bed, double bed with storage"></label>' +
      '<div style="margin-top:10px">' + (g.tips.length ? g.tips.map(function (t) { return UI.flag(t[0], t[1], t[2]); }).join("") : UI.flag("g", "No major issues", "This listing covers the basics.")) + "</div></div>" +
      '<div class="card"><div class="eb">Keyword density</div><div style="margin-top:8px">' + dens.map(function (d) { return '<span class="chip">' + esc(d.term) + " <b>" + d.count + "</b></span>"; }).join("") + '</div><div class="eb" style="margin-top:12px">Bullets</div>' + P.bullets.map(function (b) { return '<p class="small" style="margin:6px 0"><span class="faint">[' + b.length + "]</span> " + esc(b) + "</p>"; }).join("") + "</div></div>";
  }
  function bindListing() { var e = $("#l-kw"); if (e) e.onchange = function () { LKW = e.value.split(",").map(function (s) { return s.trim(); }).filter(Boolean); renderP(); }; }
  var KW = { list: null, ranks: {} };
  function pKeywords() {
    if (!KW.list) KW.list = PP.titlePhrases(P.title, P.bullets, 12);
    var rows = KW.list.map(function (k) { var r = KW.ranks[k]; return "<tr><td>" + esc(k) + "</td><td>" + (r ? (r.loading ? '<span class="spin"></span>' : r.error ? '<span class="bad small">' + esc(r.error) + "</span>" : r.organic ? "<b>#" + r.organic + "</b> (page " + r.page + ")" : '<span class="faint">not in top 2 pages</span>') : "") + "</td><td>" + (r && r.sponsored ? "#" + r.sponsored : "") + "</td><td>" + (r && r.resultCount ? r.resultCount.toLocaleString() : "") + '</td><td><button class="btn gh sm" data-rt="' + esc(k) + '">Track</button></td></tr>'; }).join("");
    return '<div class="card"><div class="row"><div class="grow"><div class="eb">Keyword rank check (reverse ASIN)</div><p class="note">Where this ASIN ranks on Amazon search for each phrase — organic and sponsored, pages 1–2. Phrases come from the title and bullets; add your own.</p></div></div>' +
      '<div class="row" style="margin:8px 0"><input id="k-add" placeholder="Add keywords, comma-separated" class="grow"><button class="btn gh sm" id="k-addb">Add</button><button class="btn gh sm" id="k-sugg">+ Amazon suggestions</button><button class="btn sm" id="k-run">Check ranks</button></div>' +
      '<div class="tw"><table class="t"><thead><tr><th>Keyword</th><th>Organic rank</th><th>Sponsored</th><th>Results</th><th></th></tr></thead><tbody>' + rows + "</tbody></table></div></div>";
  }
  function bindKeywords() {
    $("#k-addb").onclick = function () { $("#k-add").value.split(",").map(function (s) { return s.trim().toLowerCase(); }).filter(Boolean).forEach(function (k) { if (KW.list.indexOf(k) < 0) KW.list.push(k); }); renderP(); };
    $("#k-sugg").onclick = function (e) { var seed = KW.list[0] || P.title.split(" ").slice(0, 3).join(" "); e.target.innerHTML = '<span class="spin"></span>'; NET.suggest(MKT, seed).then(function (s) { s.forEach(function (k) { k = k.toLowerCase(); if (KW.list.indexOf(k) < 0) KW.list.push(k); }); renderP(); }, function (er) { e.target.textContent = er.message; }); };
    $("#k-run").onclick = function () {
      var todo = KW.list.filter(function (k) { return !KW.ranks[k] || KW.ranks[k].error; });
      todo.forEach(function (k) { KW.ranks[k] = { loading: true }; }); renderP();
      var chain = Promise.resolve();
      todo.forEach(function (k) { chain = chain.then(function () { return NET.rankOf(MKT, P.asin, k, 2).then(function (r) { KW.ranks[k] = r; }, function (e) { KW.ranks[k] = { error: e.message }; }).then(function () { if (PT === "keywords") renderP(); }); }); });
    };
    $$("[data-rt]").forEach(function (b) { b.onclick = function () { var kw = b.getAttribute("data-rt"); NET.get(["ranktrack"]).then(function (v) { var a = v.ranktrack || []; if (!a.some(function (x) { return x.asin === P.asin && x.kw === kw && x.mkt === MKT; })) { var r = KW.ranks[kw]; a.push({ id: Date.now() + Math.random(), mkt: MKT, asin: P.asin, title: P.title, kw: kw, history: r && !r.error && !r.loading ? [{ t: Date.now(), organic: r.organic, sponsored: r.sponsored, results: r.resultCount }] : [] }); } return NET.set({ ranktrack: a }); }).then(function () { b.textContent = "✓"; }); }; });
  }
  function pSourcing() {
    var q = PP.titlePhrases(P.title, [], 1)[0] || P.title.split(" ").slice(0, 4).join(" ");
    var e = encodeURIComponent;
    var links = [["Alibaba", "https://www.alibaba.com/trade/search?SearchText=" + e(q)], ["1688 (China domestic)", "https://s.1688.com/selloffer/offer_search.htm?keywords=" + e(q)], ["Made-in-China", "https://www.made-in-china.com/productdirectory.do?word=" + e(q)], ["Global Sources", "https://www.globalsources.com/searchList/products?keyWord=" + e(q)], ["IndiaMART", "https://dir.indiamart.com/search.mp?ss=" + e(q)], ["Alibaba image search tip", "https://www.alibaba.com/"], ["Google: “" + q + "” manufacturer", "https://www.google.com/search?q=" + e(q + " manufacturer")], ["Faire (wholesale brands)", "https://www.faire.com/search?q=" + e(q)]];
    if (P.brand) links.unshift(["“" + P.brand + "” authorised distributor", "https://www.google.com/search?q=" + e('"' + P.brand + '" authorised distributor wholesale')]);
    return '<div class="card"><div class="eb">Find a supplier for “' + esc(q) + '”</div><div class="grid g4" style="margin-top:10px">' + links.map(function (l) { return '<a class="kpi" target="_blank" href="' + esc(l[1]) + '"><b>' + esc(l[0]) + '</b><div class="s">open search ↗</div></a>'; }).join("") + '</div><p class="note">Tip: on Alibaba, use the camera icon and upload the main product image for an exact-match factory search. Always order samples and check the supplier has Trade Assurance.</p></div>';
  }

  // ------------------------------------------------------------------ boot
  NET.settings().then(function (s) {
    S = s;
    dark = s.theme === "dark" || (s.theme !== "light" && window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches);
    mount();
    if (isProduct) initProduct();
    else {
      launcher("X-Ray this page", startXray);
      if (s.autoXray || /[?&]pp=1/.test(location.search)) setTimeout(startXray, 800);
    }
  });
  chrome.runtime.onMessage.addListener(function (m, s, reply) {
    if (m && m.type === "pp-open") { if (isProduct && P) openProductPanel("overview"); else startXray(); reply({ data: true }); }
    if (m && m.type === "pp-export") { if (!X.items.length) { X.items = readPage(); X.items.forEach(function (it) { PP.enrich(it, MKT, S); }); } reply({ data: isProduct && P ? JSON.stringify({ source: "product-pilot-extension", v: 2, kind: "product", mkt: MKT, t: Date.now(), items: [P] }) : exportJSON() }); }
  });
})();
