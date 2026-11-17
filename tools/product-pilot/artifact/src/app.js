/* Product Pilot artifact app. Uses PP (engine.js, inlined above). */
(function () {
  "use strict";
  var PP = window.PP;
  var $ = function (id) { return document.getElementById(id); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = PP.esc;
  var MAIN = $("main");
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  // ---------------------------------------------------------------- local convenience storage
  function lsGet(k, d) { try { var v = localStorage.getItem("pp2:" + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
  function lsSet(k, v) { try { localStorage.setItem("pp2:" + k, JSON.stringify(v)); } catch (e) { } }

  var MKT = lsGet("mkt", "UK");
  $("qm").value = MKT;
  function cur() { return PP.MARKETS[MKT].cur; }
  function money(n, m) { return PP.money(n, m || MKT); }
  function kmoney(n, m) { return PP.kmoney(n, m || MKT); }

  // ---------------------------------------------------------------- capabilities
  var CAP = { sample: null, mcp: null, downloads: null, db: null, user: null, ready: false };
  var BR = "host:claude_browser";
  var BROWSER = { ok: null, tabId: null, why: "" };
  if (window.claude && claude.use) {
    Promise.all(["sample", "mcp", "downloads", "db", "user"].map(function (n) { return claude.use(n).catch(function () { return null; }); })).then(function (r) {
      CAP.sample = r[0]; CAP.mcp = r[1]; CAP.downloads = r[2]; CAP.db = r[3]; CAP.user = r[4]; CAP.ready = true;
      BROWSER.ok = CAP.mcp ? null : false;
      loadSaved().then(function () { render(); });
    });
  } else { CAP.ready = true; BROWSER.ok = false; }

  // ---------------------------------------------------------------- UI atoms
  function scoreColor(s) { return s >= 70 ? "var(--good)" : s >= 50 ? "var(--warn)" : "var(--bad)"; }
  function pill(s) { return '<span class="pill" style="background:' + scoreColor(s) + '">' + Math.round(s || 0) + "</span>"; }
  function dial(s) { var c = scoreColor(s); return '<div class="dial" style="background:conic-gradient(' + c + " " + s + '%,var(--surface-2) 0)"><b style="color:' + c + '">' + Math.round(s) + "</b></div>"; }
  function kpi(l, n, s, cls) { return '<div class="kpi"><div class="l">' + l + '</div><div class="n ' + (cls || "") + '">' + n + "</div>" + (s ? '<div class="s">' + s + "</div>" : "") + "</div>"; }
  function flag(l, t, d) { return '<div class="flag ' + l + '"><span class="i">' + (l === "g" ? "✓" : l === "w" ? "!" : "✕") + "</span><div><b>" + esc(t) + "</b><span>" + esc(d) + "</span></div></div>"; }
  function hbars(rows, fmt) { var mx = Math.max.apply(null, rows.map(function (r) { return r.value || 0; }).concat([1])); return rows.map(function (r) { return '<div class="hb"><span class="lb" title="' + esc(r.label) + '">' + esc(r.label) + '</span><span class="tr"><i style="width:' + ((r.value || 0) / mx * 100).toFixed(1) + "%;background:" + (r.color || "var(--accent)") + '"></i></span><span class="v">' + (fmt ? fmt(r.value) : r.value) + "</span></div>"; }).join(""); }
  function head(eyebrow, title, text, right) { return '<div class="vh"><div><div class="eb">' + eyebrow + "</div><h1>" + title + "</h1>" + (text ? "<p>" + text + "</p>" : "") + "</div>" + (right || "") + "</div>"; }
  function tabs(id, list, active) { return '<div class="tabs" id="' + id + '" role="tablist">' + list.map(function (t) { return '<button class="tab" role="tab" data-t="' + t[0] + '" aria-selected="' + (t[0] === active) + '">' + t[1] + "</button>"; }).join("") + "</div>"; }
  function md(s) {
    var lines = esc(s || "").split("\n"), out = [], list = null;
    function inl(t) { return t.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/`([^`]+)`/g, "<code>$1</code>"); }
    lines.forEach(function (l) {
      var m;
      if ((m = l.match(/^\s*[-*•]\s+(.*)/))) { if (list !== "ul") { if (list) out.push("</" + list + ">"); out.push("<ul>"); list = "ul"; } out.push("<li>" + inl(m[1]) + "</li>"); return; }
      if ((m = l.match(/^\s*\d+[.)]\s+(.*)/))) { if (list !== "ol") { if (list) out.push("</" + list + ">"); out.push("<ol>"); list = "ol"; } out.push("<li>" + inl(m[1]) + "</li>"); return; }
      if (list) { out.push("</" + list + ">"); list = null; }
      if ((m = l.match(/^#{1,4}\s+(.*)/))) { out.push("<h3>" + inl(m[1]) + "</h3>"); return; }
      if (l.trim()) out.push("<p>" + inl(l) + "</p>");
    });
    if (list) out.push("</" + list + ">");
    return out.join("");
  }
  function lineChart(series, opts) {
    opts = opts || {}; var W = 640, H = opts.h || 220, pl = 54, pr = 14, pt = 12, pb = 28, iw = W - pl - pr, ih = H - pt - pb;
    var xs = opts.xs, n = xs.length; if (n < 2) return "";
    var all = []; series.forEach(function (s) { s.v.forEach(function (v) { if (isFinite(v)) all.push(v); }); });
    var v0 = opts.min != null ? opts.min : Math.min.apply(null, all), v1 = Math.max.apply(null, all); if (v1 === v0) v1 = v0 + 1;
    function X(i) { return pl + i / (n - 1) * iw; } function Y(v) { var f = (v - v0) / (v1 - v0); return opts.invert ? pt + f * ih : pt + ih - f * ih; }
    var fmt = opts.fmt || function (v) { return PP.knum(v); }, g = "";
    for (var i = 0; i <= 4; i++) { var v = v0 + (v1 - v0) * i / 4, y = Y(v); g += '<line x1="' + pl + '" x2="' + (W - pr) + '" y1="' + y.toFixed(1) + '" y2="' + y.toFixed(1) + '" stroke="var(--line)"/><text x="' + (pl - 6) + '" y="' + (y + 3).toFixed(1) + '" text-anchor="end">' + fmt(v) + "</text>"; }
    var step = Math.max(1, Math.ceil(n / 7)); for (i = 0; i < n; i += step) g += '<text x="' + X(i).toFixed(1) + '" y="' + (H - 8) + '" text-anchor="middle">' + esc(xs[i]) + "</text>";
    series.forEach(function (s) {
      var d = s.v.map(function (v, i) { return (i ? "L" : "M") + X(i).toFixed(1) + " " + Y(v).toFixed(1); }).join(" ");
      if (s.area) g += '<path d="' + d + " L" + X(n - 1) + " " + (pt + ih) + " L" + pl + " " + (pt + ih) + ' Z" fill="' + s.color + '" fill-opacity="0.12"/>';
      g += '<path d="' + d + '" fill="none" stroke="' + s.color + '" stroke-width="2" stroke-linejoin="round"/>';
      if (s.mark != null) g += '<circle cx="' + X(s.mark).toFixed(1) + '" cy="' + Y(s.v[s.mark]).toFixed(1) + '" r="4.5" fill="' + s.color + '" stroke="var(--surface)" stroke-width="2"/>';
    });
    return '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="' + esc(opts.label || "chart") + '">' + g + "</svg>";
  }
  function copyText(text, btn) {
    try { navigator.clipboard.writeText(text).then(function () { if (btn) btn.textContent = "Copied ✓"; }, function () { fallback(); }); } catch (e) { fallback(); }
    function fallback() { var t = document.createElement("textarea"); t.value = text; t.className = "in"; t.style.marginTop = "8px"; if (btn) btn.insertAdjacentElement("afterend", t); t.select(); if (btn) btn.textContent = "Press Ctrl/Cmd+C"; }
  }
  function saveFile(name, data, btn) {
    if (!CAP.downloads) { copyText(typeof data === "string" ? data : "", btn); return; }
    CAP.downloads.save({ filename: name, data: data }).then(function (r) { if (btn) btn.textContent = "Saved ✓"; }, function (e) { if (btn) btn.textContent = e && e.code === "dismissed" ? "Cancelled" : "Couldn't save"; if (typeof data === "string" && e && e.code !== "dismissed") copyText(data, btn); });
  }
  function aiError(e) {
    var c = e && e.code;
    return c === "not_granted" ? "Claude wasn't allowed for this page. Allow it from the artifact's Permissions menu to use AI features." :
      c === "rate_limited" ? "Too many Claude requests right now — wait a minute and try again." :
      c === "prompt_too_large" ? "That's too much text for one request — paste less." :
      c === "invalid_json" ? "Claude's answer couldn't be read as data. Try again." :
      c === "cancelled" ? "Stopped." : "Claude couldn't answer (" + (c || "error") + "). Try again.";
  }
  function needAI(el) { if (CAP.sample) return true; el.innerHTML = '<div class="banner w">AI features run on Claude and work when this page is opened inside Claude (claude.ai or the Claude app).</div>'; return false; }

  // ---------------------------------------------------------------- state
  var DATA = lsGet("data", null);    // {mkt, query, kind, source, t, resultCount, items:[]}
  var PROD = lsGet("prod", null);    // single product
  var SAVED = { items: [], searches: [] };
  var UIS = { xtab: "products", sort: { key: "revenue", dir: -1 }, f: { hideSp: false, minSales: "", maxRev: "", pmin: "", pmax: "", text: "" }, ptab: "overview", busy: false, log: "" };
  if (!DATA) DATA = exampleData();
  function setData(d) { d.items.forEach(function (x) { PP.enrich(x, d.mkt, settings()); }); DATA = d; lsSet("data", { mkt: d.mkt, query: d.query, kind: d.kind, source: d.source, t: d.t, resultCount: d.resultCount, items: d.items.map(compactItem) }); }
  function compactItem(x) { var o = {}; ["asin", "title", "brand", "price", "listPrice", "bsr", "rankCategory", "category", "bought", "reviews", "rating", "sellerType", "offers", "weightKg", "dims", "variations", "images", "video", "aplus", "dateFirstAvailable", "sponsored", "position", "organicPosition", "badge", "image", "enriched"].forEach(function (k) { if (x[k] != null) o[k] = x[k]; }); return o; }
  function settings() { return lsGet("settings", { costPct: 25, acos: 12 }); }
  DATA.items.forEach(function (x) { PP.enrich(x, DATA.mkt, settings()); });

  // ---------------------------------------------------------------- saved (db, else this browser)
  var DBP = null;
  function loadSaved() {
    if (CAP.db && CAP.user) {
      return Promise.resolve(CAP.user.id()).then(function (id) {
        if (!id) throw new Error("no id");
        DBP = "data/users/" + id;
        var timer = sleep(10000).then(function () { throw new Error("timeout"); });
        return Promise.race([CAP.db.collection(DBP).get(), timer]);
      }).then(function (snap) {
        var docs = (snap && snap.docs) || [];
        SAVED.items = []; SAVED.searches = [];
        docs.forEach(function (d) { var v = typeof d.data === "function" ? d.data() : d.data; if (!v) return; v._id = d.id; (v.kind === "search" ? SAVED.searches : SAVED.items).push(v); });
      }).catch(function () { DBP = null; SAVED = lsGet("saved", { items: [], searches: [] }); });
    }
    SAVED = lsGet("saved", { items: [], searches: [] });
    return Promise.resolve();
  }
  function putSaved(kind, obj) {
    var id = (kind === "search" ? "s-" : "p-") + (obj.asin ? obj.mkt + "-" + obj.asin : Date.now().toString(36));
    obj.kind = kind; obj._id = id; obj.savedAt = Date.now();
    var list = kind === "search" ? SAVED.searches : SAVED.items;
    for (var i = list.length - 1; i >= 0; i--) if (list[i]._id === id) list.splice(i, 1);
    list.unshift(obj);
    if (DBP) { var c = JSON.parse(JSON.stringify(obj)); delete c._id; return CAP.db.doc(DBP + "/" + id).set(c).catch(function () { lsSet("saved", SAVED); }); }
    lsSet("saved", SAVED); return Promise.resolve();
  }
  function delSaved(kind, id) {
    var list = kind === "search" ? SAVED.searches : SAVED.items;
    for (var i = list.length - 1; i >= 0; i--) if (list[i]._id === id) list.splice(i, 1);
    if (DBP) return CAP.db.doc(DBP + "/" + id).delete().catch(function () { });
    lsSet("saved", SAVED); return Promise.resolve();
  }

  // ---------------------------------------------------------------- live browser (Claude desktop app)
  function resText(r) {
    if (r == null) return "";
    if (typeof r.payload === "string") return r.payload;
    var t = (r.content || []).filter(function (b) { return b.type === "text"; }).map(function (b) { return b.text; }).join("\n");
    if (!t && r.payload != null) t = JSON.stringify(r.payload);
    return t;
  }
  function br(tool, input) { return CAP.mcp.callTool(BR, tool, input); }
  function browse(url, wantStructure) {
    if (!CAP.mcp) return Promise.reject({ code: "no_browser" });
    var p;
    if (BROWSER.tabId != null) p = br("navigate", { url: url, tabId: BROWSER.tabId }).catch(function () { BROWSER.tabId = null; return open(); });
    else p = open();
    function open() {
      return br("preview_start", { url: url }).then(function (r) {
        var t = resText(r), pl = r && r.payload, id = pl && typeof pl === "object" && (pl.tabId != null ? pl.tabId : pl.tab_id);
        if (id == null) { var m = t.match(/tab\s*_?id["'\s:=]*["']?(\d+)/i) || t.match(/\btab\D{0,12}(\d{3,})/i); if (m) id = +m[1]; }
        BROWSER.tabId = id != null ? id : null;
        return r;
      });
    }
    return p.then(function () { return sleep(2200); }).then(function () {
      var a = BROWSER.tabId != null ? { tabId: BROWSER.tabId } : {};
      return br("get_page_text", a).then(function (r) {
        var text = resText(r);
        if (!wantStructure) return { text: text, structure: "" };
        return br("read_page", a).then(function (r2) { return { text: text, structure: resText(r2) }; }, function () { return { text: text, structure: "" }; });
      });
    }).then(function (res) { BROWSER.ok = true; return res; }, function (e) { BROWSER.ok = false; BROWSER.why = (e && (e.code || e.message)) || "error"; throw e; });
  }
  function asinsIn(s) { var out = [], seen = {}, re = /\/(?:dp|gp\/product)\/([A-Z0-9]{10})/g, m; while ((m = re.exec(s || ""))) { if (!seen[m[1]]) { seen[m[1]] = 1; out.push(m[1]); } } return out; }

  var SEARCH_SCHEMA = 'Reply with only JSON: {"kind":"search","resultCount":number|null,"items":[{"asin":string|null,"title":string,"brand":string|null,"price":number|null,"listPrice":number|null,"rating":number|null,"reviews":number|null,"bought":number|null,"sponsored":boolean,"badge":string|null}]}. "bought" is the number in "X+ bought in past month" (1K+ = 1000, 50+ = 50), else null. Keep page order. Prices are plain numbers without currency.';
  var PRODUCT_SCHEMA = 'Reply with only JSON: {"kind":"product","asin":string|null,"title":string,"brand":string|null,"price":number|null,"listPrice":number|null,"rating":number|null,"reviews":number|null,"bought":number|null,"bsr":number|null,"rankCategory":string|null,"subRanks":[{"rank":number,"category":string}],"dims":string|null,"weight":string|null,"dateFirstAvailable":string|null,"soldBy":string|null,"shipsFrom":string|null,"offers":number|null,"variations":number|null,"images":number|null,"video":boolean|null,"aplus":boolean|null,"bullets":[string],"description":string|null,"histogram":{"5":number,"4":number,"3":number,"2":number,"1":number}|null,"customersSay":string|null,"reviews_on_page":[{"rating":number,"title":string,"body":string}]}. bsr = the main Best Sellers Rank number; histogram = percentages. Use null when the page does not show a value — never guess.';
  function aiExtract(text, structure, kindHint) {
    var asins = asinsIn(structure + "\n" + text);
    var prompt = "You extract Amazon page data for a seller research tool. " + (kindHint === "product" ? "This is a product detail page. " + PRODUCT_SCHEMA : kindHint === "search" ? "This is a search results page. " + SEARCH_SCHEMA : "Decide whether this is an Amazon SEARCH RESULTS page or a PRODUCT DETAIL page. For search: " + SEARCH_SCHEMA + " For product: " + PRODUCT_SCHEMA) +
      (asins.length ? "\nASINs found in the page's links, in page order: " + asins.slice(0, 80).join(", ") + ". Match each product to its ASIN only when the link structure makes it clear; otherwise null." : "") +
      (structure ? "\n\nPAGE STRUCTURE (links):\n" + structure.slice(0, 60000) : "") + "\n\nPAGE TEXT:\n" + text.slice(0, 90000);
    return CAP.sample.json(prompt, { modelTier: "quick" }).then(function (j) {
      if (!j || typeof j !== "object") throw { code: "invalid_json" };
      if (j.kind !== "product" && Array.isArray(j.items) && asins.length) {
        var used = {}; j.items.forEach(function (x) { if (x.asin) used[x.asin] = 1; });
        var free = asins.filter(function (a) { return !used[a]; }), k = 0;
        if (j.items.every(function (x) { return !x.asin; }) && asins.length >= j.items.length) j.items.forEach(function (x) { x.asin = free[k++]; });
      }
      return j;
    });
  }
  function normItems(list) {
    var pos = 0, org = 0;
    return (list || []).filter(function (x) { return x && x.title; }).map(function (x) {
      pos++; if (!x.sponsored) org++;
      return { asin: x.asin || "", title: String(x.title), brand: x.brand || "", price: +x.price || 0, listPrice: +x.listPrice || 0, rating: +x.rating || 0, reviews: +x.reviews || 0, bought: +x.bought || 0, sponsored: !!x.sponsored, badge: x.badge || "", position: pos, organicPosition: x.sponsored ? null : org };
    });
  }
  function productFromAI(j, mkt) {
    var p = { mkt: mkt, asin: j.asin || "", title: j.title || "", brand: j.brand || "", price: +j.price || 0, listPrice: +j.listPrice || 0, rating: +j.rating || 0, reviews: +j.reviews || 0, bought: +j.bought || 0, bsr: +j.bsr || 0, rankCategory: j.rankCategory || "", subRanks: j.subRanks || [], dimsText: j.dims || "", weightText: j.weight || "", dateFirstAvailable: j.dateFirstAvailable || "", soldBy: j.soldBy || "", shipsFrom: j.shipsFrom || "", offers: +j.offers || 0, variations: +j.variations || 0, images: j.images != null ? +j.images : null, video: j.video, aplus: j.aplus, bullets: j.bullets || [], description: j.description || "", histogram: j.histogram || {}, customersSay: j.customersSay || "", topReviews: (j.reviews_on_page || []).map(function (r) { return { rating: +r.rating || 0, title: r.title || "", body: r.body || "" }; }) };
    p.dims = PP.parseDimsCm(p.dimsText); p.weightKg = PP.parseWeightKg(p.weightText || p.dimsText);
    p.category = PP.matchCategory(p.rankCategory);
    p.sellerType = /^amazon/i.test(p.soldBy) ? "AMZ" : /amazon/i.test(p.shipsFrom) ? "FBA" : p.soldBy ? "FBM" : "";
    return p;
  }

  // ---------------------------------------------------------------- search entry point
  $("qform").addEventListener("submit", function (e) { e.preventDefault(); runSearch($("q").value.trim()); });
  $("qm").addEventListener("change", function () { MKT = $("qm").value; lsSet("mkt", MKT); render(); });
  function runSearch(q) {
    if (!q) return;
    var asin = PP.extractAsin(q);
    if (asin && (q.length <= 12 || /amazon\.|\/dp\//i.test(q))) { go("product"); productLive(asin); return; }
    go("search"); searchLive(q);
  }
  function setLog(t) { UIS.log = t; var e = $("live-log"); if (e) e.innerHTML = t; }
  function searchLive(q) {
    UIS.pendingQuery = q;
    if (!CAP.mcp || !CAP.sample) { UIS.noLive = true; render(); return; }
    UIS.busy = true; UIS.noLive = false; render();
    setLog('<span class="spin"></span> Opening Amazon search in the Claude browser…');
    var url = PP.urls(MKT, "").search(q);
    browse(url, true).then(function (res) {
      if (!res.text || res.text.length < 200) throw { code: "empty_page" };
      if (/Enter the characters you see below|robot/i.test(res.text.slice(0, 1500))) throw { code: "captcha" };
      setLog('<span class="spin"></span> Reading ' + PP.knum(res.text.length) + " characters of results with Claude…");
      return aiExtract(res.text, res.structure, "search");
    }).then(function (j) {
      var items = normItems(j.items);
      if (!items.length) throw { code: "no_items" };
      setData({ mkt: MKT, query: q, kind: "search", source: "live", t: Date.now(), resultCount: j.resultCount || null, items: items });
      UIS.busy = false; UIS.xtab = "products"; setLog(""); render();
    }).catch(function (e) {
      UIS.busy = false;
      var c = e && e.code;
      UIS.noLive = true;
      UIS.liveErr = c === "captcha" ? "Amazon showed a robot check in the Claude browser. Solve it there (it's visible in the browser pane), then search again." :
        c === "no_items" || c === "empty_page" ? "The browser opened Amazon but no products could be read. Check the browser pane for a cookie or location prompt, then search again." :
        (c && /server_not_connected|not_in_manifest|unavailable|no_browser/.test(c)) ? "" : aiError(e);
      render();
    });
  }
  function productLive(asin) {
    UIS.pendingAsin = asin;
    if (!CAP.mcp || !CAP.sample) { UIS.pNoLive = true; render(); return; }
    UIS.pbusy = true; UIS.pNoLive = false; render();
    var url = PP.urls(MKT, asin).amazon;
    browse(url, false).then(function (res) {
      if (!res.text || res.text.length < 200) throw { code: "empty_page" };
      return aiExtract(res.text, "", "product");
    }).then(function (j) { var p = productFromAI(j, MKT); if (!p.asin) p.asin = asin; setProduct(p, "live"); UIS.pbusy = false; render(); })
      .catch(function (e) { UIS.pbusy = false; UIS.pNoLive = true; var c = e && e.code; UIS.pErr = (c && /server_not_connected|not_in_manifest|unavailable|no_browser/.test(c)) ? "" : c === "empty_page" ? "The product page didn't load in the Claude browser." : aiError(e); render(); });
  }
  function deepScan(n) {
    var todo = DATA.items.filter(function (x) { return x.asin && !x.enriched && !x.sponsored; }).slice(0, n);
    if (!todo.length) return;
    UIS.deep = true; render();
    var i = 0, chain = Promise.resolve();
    todo.forEach(function (it) {
      chain = chain.then(function () {
        if (!UIS.deep) return;
        i++; setLog('<span class="spin"></span> Reading product ' + i + " of " + todo.length + ": " + esc(it.title.slice(0, 50)) + "…");
        return browse(PP.urls(DATA.mkt, it.asin).amazon, false).then(function (res) { return aiExtract(res.text, "", "product"); }).then(function (j) {
          var p = productFromAI(j, DATA.mkt);
          ["bsr", "rankCategory", "category", "sellerType", "offers", "variations", "images", "video", "aplus", "dateFirstAvailable", "weightKg", "dims"].forEach(function (k) { if (p[k] != null && p[k] !== "" && !(typeof p[k] === "number" && isNaN(p[k]))) it[k] = p[k]; });
          if (!it.bought && p.bought) it.bought = p.bought; it.enriched = true;
          PP.enrich(it, DATA.mkt, settings());
          setData(DATA); render();
        }, function () { it.enriched = true; });
      });
    });
    chain.then(function () { UIS.deep = false; setLog(""); render(); });
  }

  // ---------------------------------------------------------------- import / paste
  function importAny(text, html) {
    text = (text || "").trim();
    if (/^\{/.test(text)) {
      try {
        var j = JSON.parse(text);
        if (j && j.items) {
          if (j.kind === "product" && j.items[0]) { var p = j.items[0]; p.mkt = j.mkt || MKT; setProduct(p, "extension"); return Promise.resolve("product"); }
          MKT = j.mkt || MKT; lsSet("mkt", MKT); $("qm").value = MKT;
          setData({ mkt: MKT, query: j.query || "Imported", kind: j.kind || "search", source: "extension", t: j.t || Date.now(), resultCount: j.resultCount || null, items: j.items });
          return Promise.resolve("search");
        }
      } catch (e) { }
    }
    if (/^"?(#|ASIN)"?,/i.test(text) || /^"?#"?,"?ASIN/i.test(text)) { var items = csvItems(text); if (items.length) { setData({ mkt: MKT, query: "Imported CSV", kind: "search", source: "extension", t: Date.now(), items: items }); return Promise.resolve("search"); } }
    if (html) {
      var d = new DOMParser().parseFromString(html, "text/html");
      if (d.querySelector("#productTitle")) { var pr = PP.parseProduct(d, MKT, ""); if (pr.title) { setProduct(pr, "pasted"); return Promise.resolve("product"); } }
      var r = PP.parseSearch(d, MKT);
      if (r.items.length >= 3) { setData({ mkt: MKT, query: UIS.pendingQuery || "Pasted search", kind: "search", source: "pasted", t: Date.now(), resultCount: r.resultCount, items: r.items }); return Promise.resolve("search"); }
    }
    if (!CAP.sample) return Promise.reject({ code: "no_ai" });
    return aiExtract(text, html ? linksFromHtml(html) : "", null).then(function (j) {
      if (j.kind === "product") { var p = productFromAI(j, MKT); setProduct(p, "pasted"); return "product"; }
      var items = normItems(j.items); if (!items.length) throw { code: "no_items" };
      setData({ mkt: MKT, query: UIS.pendingQuery || "Pasted search", kind: "search", source: "pasted", t: Date.now(), resultCount: j.resultCount, items: items });
      return "search";
    });
  }
  function linksFromHtml(html) { var d = new DOMParser().parseFromString(html, "text/html"); return $$("a[href]", d).map(function (a) { return (a.textContent || "").trim().slice(0, 120) + " -> " + a.getAttribute("href"); }).filter(function (s) { return /\/dp\//.test(s); }).join("\n"); }
  function csvItems(text) {
    var rows = parseCSV(text); if (rows.length < 2) return [];
    var h = rows[0].map(function (x) { return x.toLowerCase().trim(); });
    function ix(n) { return h.indexOf(n); }
    var map = { asin: ix("asin"), title: ix("title"), brand: ix("brand"), price: ix("price"), bsr: ix("bsr"), rankCategory: ix("category"), bought: ix("bought past month badge"), reviews: ix("reviews"), rating: ix("rating"), sellerType: ix("seller type"), offers: ix("offers"), weightKg: ix("weight kg"), variations: ix("variations"), images: ix("images"), dateFirstAvailable: ix("date first available"), sponsored: ix("sponsored"), position: ix("#") };
    return rows.slice(1).filter(function (r) { return r[map.asin]; }).map(function (r) {
      var o = {}; Object.keys(map).forEach(function (k) { if (map[k] < 0) return; var v = r[map[k]]; o[k] = ["price", "bsr", "bought", "reviews", "rating", "offers", "weightKg", "variations", "images", "position"].indexOf(k) > -1 ? (parseFloat(v) || 0) : k === "sponsored" ? v === "yes" : v; }); o.enriched = !!o.bsr; return o;
    });
  }
  function parseCSV(text) {
    var rows = [], row = [], c = "", q = false;
    for (var i = 0; i < text.length; i++) { var ch = text[i]; if (q) { if (ch === '"') { if (text[i + 1] === '"') { c += '"'; i++; } else q = false; } else c += ch; } else if (ch === '"') q = true; else if (ch === "," || ch === "\t") { row.push(c); c = ""; } else if (ch === "\n") { row.push(c); rows.push(row); row = []; c = ""; } else if (ch !== "\r") c += ch; }
    if (c || row.length) { row.push(c); rows.push(row); }
    return rows;
  }
  function pasteBox(id, placeholder) { return '<textarea class="in" id="' + id + '" style="min-height:120px" placeholder="' + esc(placeholder) + '"></textarea>'; }
  function bindPaste(id, btnId, msgId, after) {
    var html = "";
    $(id).addEventListener("paste", function (e) { try { html = e.clipboardData.getData("text/html") || ""; } catch (er) { html = ""; } });
    $(btnId).onclick = function () {
      var t = $(id).value; if (!t.trim() && !html) { $(msgId).innerHTML = '<span class="warn">Paste something first.</span>'; return; }
      $(msgId).innerHTML = '<span class="spin"></span> Reading…';
      importAny(t, html).then(function (kind) { html = ""; after(kind); }, function (e) {
        var c = e && e.code;
        $(msgId).innerHTML = '<span class="bad">' + (c === "no_ai" ? "Couldn't recognise this paste. Paste the JSON from the extension's “Copy for Product Pilot” button, or open this page inside Claude so Claude can read raw page text." : c === "no_items" ? "No Amazon products found in that text. Copy the whole Amazon page (Ctrl+A, then Ctrl+C) and paste again." : aiError(e)) + "</span>";
      });
    };
  }

  // ---------------------------------------------------------------- routing
  var VIEWS = { search: vSearch, product: vProduct, analyst: vAnalyst, keywords: vKeywords, reviews: vReviews, profit: vProfit, sales: vSales, ppc: vPpc, launch: vLaunch, listing: vListing, suppliers: vSuppliers, risk: vRisk, saved: vSaved, store: vStore, extension: vExtension, map: vMap };
  var VIEW = (location.hash || "#search").slice(1); if (!VIEWS[VIEW]) VIEW = "search";
  function go(v) { if (location.hash.slice(1) !== v) location.hash = v; else { VIEW = v; render(); } }
  window.addEventListener("hashchange", function () { var v = location.hash.slice(1); VIEW = VIEWS[v] ? v : "search"; render(); window.scrollTo(0, 0); });
  $$(".nb").forEach(function (b) { b.addEventListener("click", function () { go(b.getAttribute("data-v")); }); });
  function render() {
    $$(".nb").forEach(function (b) { b.setAttribute("aria-current", b.getAttribute("data-v") === VIEW ? "true" : "false"); });
    VIEWS[VIEW]();
  }
  $("theme").addEventListener("click", function () { var r = document.documentElement, d = r.getAttribute("data-theme") === "dark" || (!r.getAttribute("data-theme") && matchMedia("(prefers-color-scheme: dark)").matches); r.setAttribute("data-theme", d ? "light" : "dark"); });

  // ================================================================ SEARCH & X-RAY
  function sourceTag(s) { return { live: '<span class="tag fb">● Live from Amazon</span>', extension: '<span class="tag fb">● From the extension</span>', pasted: '<span class="tag fb">● From a pasted Amazon page</span>', example: '<span class="tag ex">Example data — search to replace</span>' }[s] || ""; }
  function vSearch() {
    var h = head("Research", "Search &amp; X-Ray", "Type a product or keyword in the bar above. Product Pilot reads page 1 of Amazon, estimates every listing's sales and revenue, adds FBA fees and margin, and scores the niche — Helium 10 X-Ray, Jungle Scout and Keepa in one view.");
    if (UIS.busy || UIS.deep) h += '<div class="banner" style="margin-bottom:14px"><div id="live-log">' + (UIS.log || '<span class="spin"></span> Working…') + "</div>" + (UIS.deep ? '<button class="btn gh sm" id="deep-stop" style="margin-left:auto">Stop</button>' : "") + "</div>";
    if (UIS.noLive) h += liveHelp();
    if (DATA) h += xray();
    MAIN.innerHTML = '<section class="view on">' + h + "</section>";
    bindSearch();
  }
  function liveHelp() {
    var q = UIS.pendingQuery || "", url = PP.urls(MKT, "").search(q);
    return '<div class="card" style="margin-bottom:16px"><div class="row" style="margin-bottom:10px"><h2 class="grow" style="font-size:17px">Get the live results for “' + esc(q) + '”</h2>' + (UIS.liveErr ? '<span class="bad small">' + esc(UIS.liveErr) + "</span>" : "") + '</div><div class="ways">' +
      '<div class="way"><div class="st good">Best · full data</div><h3>1. Chrome extension</h3><p class="small muted">Open the search on Amazon. The extension reads every product page (BSR, fees, sellers) and its <b>Copy for Product Pilot</b> button copies everything.</p><a class="btn gh" target="_blank" rel="noopener" href="' + esc(url) + '">Open “' + esc(q.slice(0, 30)) + '” on Amazon ↗</a><button class="btn gh" data-go="extension">Get the extension</button></div>' +
      '<div class="way"><div class="st">No install</div><h3>2. Copy the Amazon page</h3><p class="small muted">Open the search on Amazon, press <b>Ctrl+A</b> then <b>Ctrl+C</b> (Cmd on Mac) and paste below. Claude reads the page.</p><a class="btn gh" target="_blank" rel="noopener" href="' + esc(url) + '">Open on Amazon ↗</a></div>' +
      '<div class="way"><div class="st">Automatic</div><h3>3. Claude desktop app</h3><p class="small muted">Open this page in the Claude desktop app and Product Pilot drives its built-in browser for you: search, product pages and Amazon suggestions, no copying.</p>' + (CAP.mcp ? '<button class="btn gh" id="retry-live">Try live search again</button>' : '<span class="small faint">Not available in this window.</span>') + "</div></div>" +
      '<div style="margin-top:14px">' + pasteBox("s-paste", "Paste the extension JSON, the extension CSV, or a whole copied Amazon page…") + '<div class="row" style="margin-top:8px"><button class="btn" id="s-import">Analyze paste</button><span id="s-msg" class="small"></span></div></div></div>';
  }
  function xFiltered() {
    var f = UIS.f, t = (f.text || "").toLowerCase();
    return DATA.items.filter(function (x) {
      if (f.hideSp && x.sponsored) return false;
      if (f.minSales !== "" && (x.sales || 0) < +f.minSales) return false;
      if (f.maxRev !== "" && (x.reviews || 0) > +f.maxRev) return false;
      if (f.pmin !== "" && (x.price || 0) < +f.pmin) return false;
      if (f.pmax !== "" && (x.price || 0) > +f.pmax) return false;
      if (t && ((x.title || "") + " " + (x.brand || "")).toLowerCase().indexOf(t) < 0) return false;
      return true;
    });
  }
  var XCOLS = [
    ["position", "#"], ["title", "Product"], ["price", "Price"], ["bsr", "BSR"], ["sales", "Sales/mo"], ["revenue", "Revenue/mo"], ["reviews", "Reviews"], ["rating", "★"], ["sellerType", "Seller"], ["fbaFee", "FBA fee"], ["netEst", "Net/unit*"], ["score", "Score"]
  ];
  function sortRows(rows, s) { return rows.slice().sort(function (a, b) { var x = a[s.key], y = b[s.key]; var nx = x == null || x === "" || (typeof x === "number" && !isFinite(x)), ny = y == null || y === "" || (typeof y === "number" && !isFinite(y)); if (nx && ny) return 0; if (nx) return 1; if (ny) return -1; return (typeof x === "string" ? x.localeCompare(y) : x - y) * s.dir; }); }
  function xray() {
    var m = DATA.mkt, rows = xFiltered(), sum = PP.marketSummary(rows, m);
    var enrichedN = DATA.items.filter(function (x) { return x.enriched; }).length;
    var h = '<div class="card" style="margin-bottom:14px"><div class="row"><div class="grow"><div class="row"><h2 style="font-size:19px">“' + esc(DATA.query) + '”</h2>' + sourceTag(DATA.source) + '</div><div class="small muted">' + PP.MARKETS[m].host + " · " + DATA.items.length + " listings" + (DATA.resultCount ? " · " + DATA.resultCount.toLocaleString() + " results" : "") + " · " + enrichedN + " with full product detail · " + new Date(DATA.t).toLocaleString() + "</div></div>" +
      '<button class="btn gh sm" id="x-save">☆ Save search</button><button class="btn gh sm" id="x-csv">Export CSV</button><button class="btn gh sm" data-go="analyst">✦ Ask AI</button>' + (DATA.source === "live" && enrichedN < DATA.items.length ? '<button class="btn sm" id="x-deep">Read product pages (top 10)</button>' : "") + "</div></div>";
    h += '<div class="kg k6" style="margin-bottom:14px"><div class="kpi row" style="flex-wrap:nowrap">' + dial(sum.score) + '<div class="grow"><div class="l">Niche</div><div class="small" style="font-weight:600">' + esc(sum.verdict.split(" — ")[0]) + "</div></div></div>" +
      kpi("Page-1 revenue /mo", kmoney(sum.totalRevenue, m), PP.knum(sum.totalSales) + " units est.") + kpi("Avg sales /mo", PP.knum(sum.avgSales), "per listing") + kpi("Avg price", money(sum.avgPrice, m), "median " + money(sum.medianPrice, m)) + kpi("Avg reviews", PP.knum(sum.avgReviews), "median " + PP.knum(sum.medianReviews) + (sum.avgRating ? " · " + sum.avgRating.toFixed(1) + "★" : "")) + kpi("Top 3 share", Math.round(sum.top3Share * 100) + "%", "of page revenue") + "</div>";
    h += tabs("xt", [["products", "Products"], ["market", "Market analysis"], ["compare", "Compare"], ["keywords", "Keywords"], ["verdict", "AI verdict"]], UIS.xtab);
    if (UIS.xtab === "products") {
      var f = UIS.f;
      h += '<div class="row" style="margin-bottom:10px"><input class="in" id="f-text" placeholder="Filter title or brand" value="' + esc(f.text) + '" style="max-width:190px"><input class="in" id="f-minSales" type="number" placeholder="Min sales" value="' + esc(f.minSales) + '" style="max-width:110px"><input class="in" id="f-maxRev" type="number" placeholder="Max reviews" value="' + esc(f.maxRev) + '" style="max-width:120px"><input class="in" id="f-pmin" type="number" placeholder="Min price" value="' + esc(f.pmin) + '" style="max-width:105px"><input class="in" id="f-pmax" type="number" placeholder="Max price" value="' + esc(f.pmax) + '" style="max-width:105px"><label class="small"><input type="checkbox" id="f-hideSp"' + (f.hideSp ? " checked" : "") + "> Hide sponsored</label></div>";
      var sorted = sortRows(rows, UIS.sort);
      h += '<div class="tw"><table class="t" id="xtbl"><thead><tr>' + XCOLS.map(function (c) { return '<th data-k="' + c[0] + '">' + c[1] + (UIS.sort.key === c[0] ? (UIS.sort.dir > 0 ? " ▲" : " ▼") : "") + "</th>"; }).join("") + "<th></th></tr></thead><tbody>" +
        sorted.map(function (r) {
          var src = r.salesSource === "badge+rank" ? "var(--good)" : r.salesSource === "badge" ? "var(--s2)" : "var(--warn)";
          return '<tr data-asin="' + esc(r.asin) + '"><td>' + (r.position || "") + '</td><td class="wrap"><div class="row" style="flex-wrap:nowrap;align-items:flex-start">' + (r.image ? '<img class="thumb" src="' + esc(r.image) + '" alt="" loading="lazy">' : "") + '<div class="grow"><a href="#product" data-open="' + esc(r.asin) + '">' + esc((r.title || "").slice(0, 95)) + '</a><div class="small faint"><span class="mono">' + esc(r.asin || "no ASIN") + "</span>" + (r.brand ? " · " + esc(r.brand) : "") + "</div>" + (r.sponsored ? '<span class="tag sp">Sponsored</span> ' : "") + (r.badge ? '<span class="tag">' + esc(r.badge) + "</span>" : "") + "</div></div></td>" +
            "<td>" + (r.price ? money(r.price, m) : "—") + "</td><td>" + (r.bsr ? "#" + r.bsr.toLocaleString() + '<div class="small faint">' + esc((r.rankCategory || "").slice(0, 24)) + "</div>" : '<span class="faint">—</span>') + "</td>" +
            "<td>" + (r.sales ? '<span class="dot" style="background:' + src + '" title="' + esc(r.salesSource) + '"></span>' + r.sales.toLocaleString() + '<div class="small faint">' + PP.knum(r.salesLow) + "–" + PP.knum(r.salesHigh) + "</div>" : '<span class="faint">—</span>') + "</td>" +
            "<td>" + (r.revenue ? kmoney(r.revenue, m) : "—") + "</td><td>" + (r.reviews ? r.reviews.toLocaleString() : "—") + "</td><td>" + (r.rating ? r.rating.toFixed(1) : "—") + "</td>" +
            "<td>" + (r.sellerType ? '<span class="tag ' + (r.sellerType === "AMZ" ? "am" : r.sellerType === "FBA" ? "fb" : "") + '">' + r.sellerType + "</span>" : '<span class="faint">—</span>') + "</td>" +
            "<td>" + (r.fbaFee != null && (r.dims || isFinite(r.weightKg)) ? money(r.fbaFee, m) + '<div class="small faint">' + esc(r.sizeTier) + "</div>" : '<span class="faint">needs size</span>') + "</td>" +
            "<td>" + (r.netEst != null && (r.dims || isFinite(r.weightKg)) ? '<span class="' + (r.netEst > 0 ? "good" : "bad") + '">' + money(r.netEst, m) + "</span>" : '<span class="faint">—</span>') + "</td><td>" + pill(r.score) + '</td><td><button class="btn gh sm" data-star="' + esc(r.asin) + '" title="Save product">☆</button></td></tr>';
        }).join("") + "</tbody></table></div>";
      h += '<p class="note">' + rows.length + " of " + DATA.items.length + ' shown. Sales dot: <span class="dot" style="background:var(--good)"></span>rank model checked against Amazon\'s “bought in past month” badge · <span class="dot" style="background:var(--s2)"></span>badge only · <span class="dot" style="background:var(--warn)"></span>rank model only. Listings without a rank or badge need their product page read (extension, or “Read product pages”). *Net/unit assumes cost = ' + settings().costPct + "% of price and " + settings().acos + "% ACoS — set your real cost in the Product analyzer. Estimates, not Amazon figures.</p>";
    } else if (UIS.xtab === "market") h += marketTab(rows, sum, m);
    else if (UIS.xtab === "keywords") h += keywordTab(rows);
    else if (UIS.xtab === "compare") h += compareTab(rows, m);
    else h += '<div class="card"><div class="row"><h2 class="grow" style="font-size:16px">Claude\'s read of this niche</h2><button class="btn" id="v-go">' + (UIS.verdict ? "Ask again" : "Get verdict") + '</button></div><div id="v-out" class="md" style="margin-top:10px">' + (UIS.verdict && UIS.verdictFor === DATA.query ? md(UIS.verdict) : '<p class="note">Claude reviews the numbers above — demand, review walls, price bands, brand concentration and gaps — and tells you whether to enter, how, and at what price.</p>') + "</div></div>";
    return h;
  }
  function marketTab(rows, sum, m) {
    var top = rows.slice().sort(function (a, b) { return (b.revenue || 0) - (a.revenue || 0); }).slice(0, 10);
    var bw = sum.avgPrice > 150 ? 50 : sum.avgPrice > 40 ? 10 : 5, bands = {};
    rows.forEach(function (r) { if (!r.price) return; var b = Math.floor(r.price / bw) * bw; bands[b] = bands[b] || 0; bands[b] += r.revenue || 0; });
    var bandRows = Object.keys(bands).map(Number).sort(function (a, b) { return a - b; }).map(function (b) { return { label: PP.money(b, m).replace(/\.00$/, "") + "–" + PP.money(b + bw, m).replace(/\.00$/, ""), value: bands[b] }; });
    var revB = [[0, 50], [50, 200], [200, 1000], [1000, 5000], [5000, 1e12]].map(function (r) { return { label: r[1] > 1e11 ? "5,000+ reviews" : r[0] + "–" + r[1].toLocaleString() + " reviews", value: rows.filter(function (x) { return (x.reviews || 0) >= r[0] && (x.reviews || 0) < r[1]; }).length }; });
    var brands = {}; rows.forEach(function (r) { var b = r.brand || "Unknown"; brands[b] = (brands[b] || 0) + (r.revenue || 0); });
    var brandRows = Object.keys(brands).map(function (b) { return { label: b, value: brands[b] }; }).sort(function (a, b) { return b.value - a.value; }).slice(0, 8);
    var fl = [];
    fl.push(sum.newcomers >= 3 ? flag("g", sum.newcomers + " newcomers selling well", "Listings under 100 reviews already sell 150+/month.") : flag("w", "Few newcomers break in", sum.newcomers + " listing(s) under 100 reviews sell 150+/month."));
    fl.push(sum.top3Share > 0.6 ? flag("b", "Top 3 take " + Math.round(sum.top3Share * 100) + "% of revenue", "Demand is concentrated.") : flag("g", "Revenue is spread out", "Top 3 take " + Math.round(sum.top3Share * 100) + "%."));
    if (sum.amazonSells >= 2) fl.push(flag("b", "Amazon itself sells " + sum.amazonSells, "Price pressure and buy-box loss."));
    if (sum.lowRated >= 2) fl.push(flag("g", sum.lowRated + " listings under 4.2★", "Unhappy buyers — read their reviews in Review intelligence."));
    if (sum.avgReviews > 1500) fl.push(flag("b", "Big review wall", "Average " + PP.knum(sum.avgReviews) + " reviews.")); else if (sum.avgReviews && sum.avgReviews < 400) fl.push(flag("g", "Low review wall", "Average " + PP.knum(sum.avgReviews) + " reviews."));
    if (sum.topBrandShare > 0.4) fl.push(flag("w", "“" + sum.topBrand + "” holds " + Math.round(sum.topBrandShare * 100) + "%", "One brand dominates page 1."));
    if (sum.sponsored >= 4) fl.push(flag("w", sum.sponsored + " sponsored slots", "Expect real PPC spend to get seen."));
    return '<div class="g2"><div class="card"><div class="eb">Opportunity read</div><div class="flags" style="margin-top:10px">' + fl.join("") + '</div><p class="note">' + esc(sum.verdict) + ". Sellers: " + sum.amazonSells + " Amazon · " + sum.fba + " FBA · " + sum.fbm + " FBM · " + sum.brandCount + " brands.</p></div>" +
      '<div class="card"><div class="eb">Revenue by listing (top 10)</div><div style="margin-top:10px">' + hbars(top.map(function (r) { return { label: r.title, value: r.revenue || 0 }; }), function (v) { return kmoney(v, m); }) + "</div></div>" +
      '<div class="card"><div class="eb">Revenue by price band</div><div style="margin-top:10px">' + hbars(bandRows, function (v) { return kmoney(v, m); }) + '</div><p class="note">The band earning the most is the price shoppers accept.</p></div>' +
      '<div class="card"><div class="eb">Review walls</div><div style="margin-top:10px">' + hbars(revB, function (v) { return v + " listings"; }) + '</div><div class="eb" style="margin-top:14px">Brand share of revenue</div><div style="margin-top:8px">' + hbars(brandRows, function (v) { return kmoney(v, m); }) + "</div></div></div>";
  }
  function compareTab(rows, m) {
    var pick = rows.filter(function (r) { return UIS.cmp && UIS.cmp[r.asin]; });
    if (pick.length < 2) pick = rows.filter(function (r) { return !r.sponsored; }).slice().sort(function (a, b) { return (b.revenue || 0) - (a.revenue || 0); }).slice(0, 5);
    var F = [["Price", "price", function (v) { return money(v, m); }, -1], ["BSR", "bsr", function (v) { return "#" + v.toLocaleString(); }, -1], ["Sales / mo", "sales", function (v) { return v.toLocaleString(); }, 1], ["Revenue / mo", "revenue", function (v) { return kmoney(v, m); }, 1], ["Reviews", "reviews", function (v) { return v.toLocaleString(); }, -1], ["Rating", "rating", function (v) { return v.toFixed(1) + "★"; }, 1], ["Offers", "offers", function (v) { return v; }, -1], ["Variations", "variations", function (v) { return v; }, 1], ["Images", "images", function (v) { return v; }, 1], ["FBA fee", "fbaFee", function (v) { return money(v, m); }, -1], ["Net / unit*", "netEst", function (v) { return money(v, m); }, 1], ["Score", "score", function (v) { return Math.round(v); }, 1]];
    var h = '<div class="card"><div class="eb">Side by side</div><p class="note">Best value in each row is green. Tick listings below to choose who to compare (default: top 5 by revenue).</p><div class="tw" style="margin-top:8px"><table class="t"><thead><tr><th>Metric</th>' + pick.map(function (r) { return '<th style="white-space:normal;min-width:140px;text-transform:none;letter-spacing:0">' + esc((r.brand ? r.brand + " — " : "") + (r.title || "").slice(0, 50)) + "</th>"; }).join("") + "</tr></thead><tbody>";
    F.forEach(function (f) { var vals = pick.map(function (r) { return +r[f[1]]; }).filter(function (v) { return isFinite(v) && v > 0; }); var best = vals.length ? (f[3] > 0 ? Math.max.apply(null, vals) : Math.min.apply(null, vals)) : null; h += '<tr><td class="muted">' + f[0] + "</td>" + pick.map(function (r) { var v = +r[f[1]]; return "<td" + (isFinite(v) && v === best ? ' class="good" style="font-weight:700"' : "") + ">" + (isFinite(v) && v > 0 ? f[2](v) : '<span class="faint">—</span>') + "</td>"; }).join("") + "</tr>"; });
    h += '</tbody></table></div><div style="margin-top:12px">' + rows.map(function (r) { return '<label class="chip"><input type="checkbox" data-cmp="' + esc(r.asin) + '"' + (UIS.cmp && UIS.cmp[r.asin] ? " checked" : "") + "> " + esc((r.title || r.asin).slice(0, 40)) + "</label>"; }).join("") + "</div>";
    var minRev = Math.min.apply(null, pick.map(function (r) { return r.reviews || 1e9; })), weak = pick.filter(function (r) { return r.rating && r.rating < 4.3; });
    h += '<div class="flags" style="margin-top:10px">' + (minRev < 150 ? flag("g", "Low review wall", "The weakest of these has " + minRev + " reviews — a new listing can break in.") : minRev < 600 ? flag("w", "Moderate review wall", "Weakest has " + minRev + " reviews; plan a launch push.") : flag("b", "High review wall", "Even the weakest has " + minRev.toLocaleString() + " reviews.")) + (weak.length ? flag("g", weak.length + " under 4.3★", "Attack their complaints with a better product.") : "") + "</div></div>";
    return h;
  }
  function keywordTab(rows) {
    var grams = PP.ngrams(rows.map(function (r) { return r.title; }), 3).filter(function (g) { return g.words > 1 || g.docs >= 3; }).slice(0, 50);
    return '<div class="card"><div class="row"><div class="grow"><div class="eb">Phrases competitors target</div><p class="note">Phrases that appear in the most page-1 titles — the terms Amazon links to this niche. Expand them in the Keyword lab.</p></div><button class="btn gh sm" id="kw-copy">Copy all</button><button class="btn gh sm" data-go="keywords">Open Keyword lab</button></div><div class="tw" style="margin-top:8px"><table class="t"><thead><tr><th>Phrase</th><th>In titles</th><th>Uses</th></tr></thead><tbody>' +
      grams.map(function (g) { return "<tr><td>" + esc(g.term) + "</td><td>" + g.docs + " / " + rows.length + "</td><td>" + g.count + "</td></tr>"; }).join("") + "</tbody></table></div></div>";
  }
  function bindSearch() {
    $$("[data-go]").forEach(function (b) { b.onclick = function () { go(b.getAttribute("data-go")); }; });
    if ($("s-paste")) bindPaste("s-paste", "s-import", "s-msg", function (kind) { UIS.noLive = false; UIS.liveErr = ""; if (kind === "product") go("product"); else render(); });
    var rl = $("retry-live"); if (rl) rl.onclick = function () { searchLive(UIS.pendingQuery); };
    var ds = $("deep-stop"); if (ds) ds.onclick = function () { UIS.deep = false; };
    if (!DATA) return;
    $$("#xt .tab").forEach(function (b) { b.onclick = function () { UIS.xtab = b.getAttribute("data-t"); render(); }; });
    $$("#xtbl th[data-k]").forEach(function (th) { th.onclick = function () { var k = th.getAttribute("data-k"); if (UIS.sort.key === k) UIS.sort.dir *= -1; else UIS.sort = { key: k, dir: k === "title" || k === "position" ? 1 : -1 }; render(); }; });
    ["text", "minSales", "maxRev", "pmin", "pmax"].forEach(function (k) { var e = $("f-" + k); if (e) e.onchange = function () { UIS.f[k] = e.value; render(); }; });
    var hs = $("f-hideSp"); if (hs) hs.onchange = function () { UIS.f.hideSp = hs.checked; render(); };
    $$("[data-open]").forEach(function (a) { a.onclick = function (e) { e.preventDefault(); var it = DATA.items.filter(function (x) { return x.asin === a.getAttribute("data-open"); })[0]; if (it) { setProduct(Object.assign({ mkt: DATA.mkt }, it), DATA.source === "example" ? "example" : "search"); go("product"); } }; });
    $$("[data-star]").forEach(function (b) { b.onclick = function () { var it = DATA.items.filter(function (x) { return x.asin === b.getAttribute("data-star"); })[0]; if (!it) return; putSaved("product", Object.assign(compactItem(it), { mkt: DATA.mkt, sales: it.sales, revenue: it.revenue, score: it.score, query: DATA.query })).then(function () { b.textContent = "★"; }); }; });
    var sv = $("x-save"); if (sv) sv.onclick = function () { putSaved("search", { mkt: DATA.mkt, query: DATA.query, source: DATA.source, t: DATA.t, resultCount: DATA.resultCount, summary: PP.marketSummary(DATA.items, DATA.mkt), items: DATA.items.map(compactItem) }).then(function () { sv.textContent = "★ Saved"; }); };
    var cs = $("x-csv"); if (cs) cs.onclick = function () { DATA.items.forEach(function (x) { x.mkt = DATA.mkt; }); saveFile("product-pilot-" + DATA.query.replace(/\W+/g, "-").toLowerCase() + "-" + DATA.mkt + ".csv", PP.toCSV(sortRows(xFiltered(), UIS.sort), PP.XRAY_COLS), cs); };
    var dp = $("x-deep"); if (dp) dp.onclick = function () { deepScan(10); };
    $$("[data-cmp]").forEach(function (c) { c.onchange = function () { UIS.cmp = UIS.cmp || {}; UIS.cmp[c.getAttribute("data-cmp")] = c.checked; render(); }; });
    var kc = $("kw-copy"); if (kc) kc.onclick = function () { copyText(PP.ngrams(xFiltered().map(function (r) { return r.title; }), 3).slice(0, 50).map(function (g) { return g.term; }).join("\n"), kc); };
    var vg = $("v-go"); if (vg) vg.onclick = function () {
      var out = $("v-out"); if (!needAI(out)) return;
      vg.disabled = true; out.innerHTML = '<p class="note"><span class="spin"></span> Thinking…</p>';
      CAP.sample(nicheContext() + "\n\nYou are an experienced Amazon FBA product researcher. Using ONLY the data above, give a decisive verdict on entering this niche as a new private-label seller. Structure: ### Verdict (Enter / Enter with a twist / Avoid, one line why) ### What the numbers say (4–6 bullets citing the figures) ### The gap to attack (concrete product angle, from low ratings, price bands, review walls) ### Target price & launch (price, units/month you could expect, review target) ### Risks. Note where figures are estimates. Be concise; use the marketplace currency.", { onText: function (o) { out.innerHTML = md(o.text); }, cache: false }).then(function (r) { UIS.verdict = r.text; UIS.verdictFor = DATA.query; vg.disabled = false; vg.textContent = "Ask again"; }, function (e) { out.innerHTML = '<p class="bad">' + esc(aiError(e)) + "</p>"; vg.disabled = false; });
    };
  }
  function nicheContext() {
    if (!DATA) return "No search loaded.";
    var s = PP.marketSummary(DATA.items, DATA.mkt), m = DATA.mkt;
    var lines = DATA.items.slice(0, 40).map(function (x) { return [x.position, x.sponsored ? "AD" : "", '"' + (x.title || "").slice(0, 90) + '"', x.brand, x.price ? money(x.price, m) : "", x.bsr ? "BSR " + x.bsr : "", x.sales ? "~" + x.sales + "/mo" : "", x.bought ? "badge " + x.bought + "+" : "", x.reviews + " reviews", x.rating ? x.rating + "★" : "", x.sellerType || "", x.dateFirstAvailable || ""].filter(Boolean).join(" | "); });
    return "Amazon " + m + " search: \"" + DATA.query + "\" (" + (DATA.source === "example" ? "EXAMPLE DATA" : "data source: " + DATA.source) + ")\nNiche score " + s.score + "/100. Page-1 revenue est " + kmoney(s.totalRevenue, m) + "/mo, avg sales " + Math.round(s.avgSales) + "/mo, avg price " + money(s.avgPrice, m) + ", avg reviews " + Math.round(s.avgReviews) + ", avg rating " + s.avgRating.toFixed(2) + ", top-3 revenue share " + Math.round(s.top3Share * 100) + "%, top brand " + s.topBrand + " (" + Math.round(s.topBrandShare * 100) + "%), newcomers selling well " + s.newcomers + ", Amazon-sold " + s.amazonSells + ".\nListings (pos | ad | title | brand | price | BSR | est sales | Amazon badge | reviews | rating | seller | listed):\n" + lines.join("\n");
  }

  // ================================================================ PRODUCT ANALYZER
  var CALC = null;
  function setProduct(p, source) {
    p.mkt = p.mkt || MKT; p.source = source;
    var est = PP.estimateSales({ bsr: p.bsr, category: p.category || PP.matchCategory(p.rankCategory), mkt: p.mkt, bought: p.bought });
    p.category = p.category || PP.matchCategory(p.rankCategory);
    p.sales = est.units; p.salesLow = est.low; p.salesHigh = est.high; p.salesSource = est.source; p.revenue = p.sales * (p.price || 0);
    PROD = p; CALC = null; UIS.ptab = "overview"; UIS.pAI = "";
    try { lsSet("prod", p); } catch (e) { }
  }
  function calcInit() {
    var p = PROD, s = settings(), saved = lsGet("cost:" + p.mkt + ":" + p.asin, null);
    CALC = saved || { price: p.price || 0, cost: +((p.price || 0) * s.costPct / 100).toFixed(2), freight: 0, prep: 0, weightKg: isFinite(p.weightKg) ? +(+p.weightKg).toFixed(2) : 1, l: p.dims ? +p.dims.l.toFixed(1) : 30, w: p.dims ? +p.dims.w.toFixed(1) : 20, h: p.dims ? +p.dims.h.toFixed(1) : 10, acos: s.acos, returns: 3, storageMonths: 1.5, fbm: false, shipFbm: 0, vat: false, cat: p.category || "Home & Kitchen" };
  }
  function calc(c, m) { return PP.profit({ price: c.price, cost: c.cost, freight: c.freight, prep: c.prep, catName: c.cat, mkt: m, weightKg: c.weightKg, dims: { l: +c.l, w: +c.w, h: +c.h }, acos: c.acos, returns: c.returns, storageMonths: c.storageMonths, fbm: c.fbm, shipFbm: c.shipFbm, vatRegistered: c.vat }); }
  function vProduct() {
    var h = head("Research", "Product analyzer", "One product, every angle: sales and revenue, your real profit, listing quality, reviews, price history and where it ranks.");
    h += '<div class="card" style="margin-bottom:14px"><div class="row"><input class="in grow" id="p-asin" placeholder="ASIN or Amazon product link" value="' + esc(UIS.pendingAsin || (PROD && PROD.asin) || "") + '" style="max-width:420px"><button class="btn" id="p-go">Analyze</button><button class="btn gh" id="p-man">Enter manually</button></div>' +
      (UIS.pMan ? '<div class="fg f3" style="margin-top:12px"><label class="f">Product name<input class="in" id="m-title"></label><label class="f">Price<input class="in" id="m-price" type="number"></label><label class="f">Best Sellers Rank<input class="in" id="m-bsr" type="number"></label><label class="f">Category<select class="in" id="m-cat">' + PP.catNames.map(function (n) { return "<option>" + n + "</option>"; }).join("") + '</select></label><label class="f">Reviews<input class="in" id="m-rev" type="number"></label><label class="f">Rating<input class="in" id="m-rat" type="number" step="0.1"></label><label class="f">“Bought in past month”<input class="in" id="m-bought" type="number"></label><label class="f">Weight kg<input class="in" id="m-kg" type="number"></label><label class="f">Size L×W×H cm<input class="in" id="m-dims" placeholder="190 x 135 x 30"></label></div><button class="btn" id="m-go" style="margin-top:10px">Score it</button>' : "") +
      (UIS.pbusy ? '<p class="note"><span class="spin"></span> Reading the product page in the Claude browser…</p>' : "") +
      (UIS.pNoLive ? '<div style="margin-top:12px">' + (UIS.pErr ? '<p class="bad small">' + esc(UIS.pErr) + "</p>" : "") + '<p class="small muted">Open the product on Amazon' + (UIS.pendingAsin ? ' (<a target="_blank" rel="noopener" href="' + esc(PP.urls(MKT, UIS.pendingAsin).amazon) + '">open it ↗</a>)' : "") + ", then either press <b>Copy for Product Pilot</b> in the extension popup, or select the whole page (Ctrl+A, Ctrl+C) and paste here.</p>" + pasteBox("p-paste", "Paste the product page or the extension JSON…") + '<div class="row" style="margin-top:8px"><button class="btn" id="p-import">Analyze paste</button><span id="p-msg" class="small"></span></div></div>' : "") + "</div>";
    if (!PROD) { h += '<div class="card"><p class="note">Pick a product from Search &amp; X-Ray, or enter an ASIN above.</p></div>'; MAIN.innerHTML = '<section class="view on">' + h + "</section>"; bindProduct(); return; }
    if (!CALC) calcInit();
    var p = PROD, m = p.mkt, r = calc(CALC, m);
    p.margin = r.margin; p.score = PP.productScore(p);
    var grade = PP.gradeListing({ title: p.title, bullets: p.bullets || [], description: p.description, images: p.images, video: p.video, aplus: p.aplus, rating: p.rating, reviews: p.reviews, keywords: [] });
    h += '<div class="card" style="margin-bottom:14px"><div class="row" style="align-items:flex-start;flex-wrap:nowrap">' + (p.image ? '<img class="thumb" style="width:64px;height:64px" src="' + esc(p.image) + '" alt="">' : "") + '<div class="grow"><h2 style="font-size:17px">' + esc(p.title || p.asin) + '</h2><div class="small muted"><span class="mono">' + esc(p.asin) + "</span>" + (p.brand ? " · " + esc(p.brand) : "") + " · " + PP.MARKETS[m].host + " " + (p.source === "example" ? '<span class="tag ex">Example</span>' : "") + '</div><div class="row" style="margin-top:8px"><a class="btn gh sm" target="_blank" rel="noopener" href="' + esc(PP.urls(m, p.asin).amazon) + '">Amazon ↗</a><a class="btn gh sm" target="_blank" rel="noopener" href="' + esc(PP.urls(m, p.asin).keepa) + '">Keepa history ↗</a><a class="btn gh sm" target="_blank" rel="noopener" href="' + esc(PP.urls(m, p.asin).camel) + '">CamelCamelCamel ↗</a><button class="btn gh sm" id="p-star">☆ Save</button></div></div>' + dial(p.score) + "</div></div>";
    h += '<div class="kg k6" style="margin-bottom:14px">' + kpi("BSR", p.bsr ? "#" + p.bsr.toLocaleString() : "—", esc(p.rankCategory || "not read yet")) + kpi("Est. sales /mo", p.sales ? p.sales.toLocaleString() : "—", p.sales ? PP.knum(p.salesLow) + "–" + PP.knum(p.salesHigh) + " · " + p.salesSource : "needs BSR or badge") + kpi("Revenue /mo", p.revenue ? kmoney(p.revenue, m) : "—", p.price ? "at " + money(p.price, m) : "") + kpi("Net / unit", money(r.net, m), Math.round(r.margin) + "% margin", r.net > 0 ? "good" : "bad") + kpi("Profit /mo", p.sales ? kmoney(r.net * p.sales, m) : "—", "at your cost") + kpi("Listing grade", grade.score + "/100", (p.images != null ? p.images + " images" : "")) + "</div>";
    h += tabs("pt", [["overview", "Overview"], ["profit", "Profit calculator"], ["listing", "Listing"], ["reviews", "Reviews"], ["history", "Price & rank history"]], UIS.ptab);
    h += '<div id="ptb">' + ({ overview: pOverview, profit: pProfit, listing: pListing, reviews: pReviews, history: pHistory }[UIS.ptab])(p, r, grade) + "</div>";
    MAIN.innerHTML = '<section class="view on">' + h + "</section>";
    bindProduct();
  }
  function pOverview(p, r) {
    var m = p.mkt, f = [];
    if (p.sales >= 300) f.push(flag("g", "Proven demand", "~" + p.sales.toLocaleString() + " units a month.")); else if (p.sales > 0) f.push(flag("w", "Modest demand", "~" + p.sales + " units a month.")); else f.push(flag("w", "No sales signal yet", "Read the product page (BSR) to estimate sales."));
    if (p.reviews && p.reviews < 200) f.push(flag("g", "Beatable review count", p.reviews + " reviews.")); else if (p.reviews >= 2000) f.push(flag("b", "Huge review moat", p.reviews.toLocaleString() + " reviews."));
    if (p.rating && p.rating < 4.2) f.push(flag("g", "Rating gap " + p.rating.toFixed(1) + "★", "Customers are unhappy — the Reviews tab shows why."));
    if (p.sellerType === "AMZ") f.push(flag("b", "Amazon is the seller", "Hard to win the buy box."));
    if (p.offers > 5) f.push(flag("w", p.offers + " sellers on the listing", "Buy-box rotation and price wars."));
    f.push(r.margin >= 25 ? flag("g", "Healthy margin " + Math.round(r.margin) + "%", "At a cost of " + money(CALC.cost, m) + ".") : flag(r.margin > 10 ? "w" : "b", "Margin " + Math.round(r.margin) + "%", "Enter your real supplier cost in the Profit calculator tab."));
    var det = [["Category", p.rankCategory || p.category], ["Sub-ranks", (p.subRanks || []).map(function (x) { return "#" + x.rank + " in " + x.category; }).join(" · ")], ["Price", p.price ? money(p.price, m) + (p.listPrice ? " (list " + money(p.listPrice, m) + ")" : "") : ""], ["Rating", p.rating ? p.rating.toFixed(1) + "★ · " + (p.reviews || 0).toLocaleString() + " ratings" : ""], ["Amazon badge", p.bought ? p.bought.toLocaleString() + "+ bought in past month" : ""], ["Seller", [p.soldBy, p.sellerType].filter(Boolean).join(" · ")], ["Ships from", p.shipsFrom], ["Offers", p.offers], ["Variations", p.variations], ["Size", p.dimsText || (p.dims ? p.dims.l.toFixed(0) + "×" + p.dims.w.toFixed(0) + "×" + p.dims.h.toFixed(0) + " cm" : "")], ["Weight", isFinite(p.weightKg) && p.weightKg ? (+p.weightKg).toFixed(2) + " kg" : ""], ["FBA size tier", r.tier], ["First available", p.dateFirstAvailable]];
    return '<div class="g2"><div class="card"><div class="eb">Verdict</div><div class="flags" style="margin-top:10px">' + f.join("") + '</div></div><div class="card"><div class="eb">Product data</div><table class="t" style="margin-top:6px">' + det.filter(function (d) { return d[1]; }).map(function (d) { return '<tr><td class="muted" style="width:130px">' + d[0] + '</td><td class="wrap">' + esc(d[1]) + "</td></tr>"; }).join("") + "</table></div></div>";
  }
  function numF(k, label, step) { return '<label class="f">' + label + '<input class="in" data-c="' + k + '" type="number" step="' + (step || "0.01") + '" value="' + esc(CALC[k]) + '"></label>'; }
  function pProfit(p, r) { return profitPanel(CALC, p.mkt, r, p.sales); }
  function profitPanel(C, m, r, units) {
    var c = PP.MARKETS[m].cur;
    var catOpts = PP.catNames.map(function (n) { return "<option" + (n === C.cat ? " selected" : "") + ">" + n + "</option>"; }).join("");
    var save = C === CALC ? '<button class="btn sm" id="c-save">Save for this ASIN</button>' : "";
    return '<div class="g2"><div class="card"><div class="eb">Your numbers</div><div class="fg f3" style="margin-top:10px">' + numF2(C, "price", "Sell price " + c) + numF2(C, "cost", "Product cost " + c) + numF2(C, "freight", "Freight / unit " + c) + numF2(C, "prep", "Prep & labels " + c) + numF2(C, "acos", "Ad spend (ACoS %)", "1") + numF2(C, "returns", "Return rate %", "0.5") + numF2(C, "weightKg", "Weight kg") + numF2(C, "l", "Length cm", "0.1") + numF2(C, "w", "Width cm", "0.1") + numF2(C, "h", "Height cm", "0.1") + numF2(C, "storageMonths", "Months in storage", "0.5") + '<label class="f">Category<select class="in" id="c-cat">' + catOpts + "</select></label></div>" +
      '<div class="row" style="margin-top:10px"><label class="small"><input type="checkbox" id="c-fbm"' + (C.fbm ? " checked" : "") + "> Merchant fulfilled (FBM)</label>" + (C.fbm ? numF2(C, "shipFbm", "Your shipping / unit") : "") + (m !== "US" && m !== "CA" ? '<label class="small"><input type="checkbox" id="c-vat"' + (C.vat ? " checked" : "") + "> VAT registered</label>" : "") + save + '</div><p class="note">Amazon ' + (m === "US" || m === "CA" ? "US 2025" : "UK/EU 2025") + " size tiers and referral rates, approximate. Confirm with Amazon's Revenue Calculator before ordering stock.</p></div>" +
      '<div class="card"><div class="eb">Per unit</div><table class="t" style="margin-top:6px">' + [["Sell price", money(r.price, m)], r.vat ? ["VAT", "−" + money(r.vat, m)] : null, ["Referral fee", "−" + money(r.referral, m)], ["Fulfilment · " + r.tier, "−" + money(r.fba, m)], ["Storage", "−" + money(r.storage, m)], ["Landed cost", "−" + money(r.landed, m)], ["Advertising", "−" + money(r.ads, m)], ["Returns", "−" + money(r.returns, m)]].filter(Boolean).map(function (x) { return '<tr><td class="muted">' + esc(x[0]) + '</td><td style="text-align:right">' + x[1] + "</td></tr>"; }).join("") +
      '<tr><td><b>Net profit</b></td><td style="text-align:right;font-family:var(--display);font-size:18px" class="' + (r.net > 0 ? "good" : "bad") + '"><b>' + money(r.net, m) + '</b></td></tr></table><div class="kg" style="margin-top:12px">' + kpi("Margin", Math.round(r.margin) + "%") + kpi("ROI", Math.round(r.roi) + "%") + kpi("Profit /mo", units ? kmoney(r.net * units, m) : "—", units ? "at " + units.toLocaleString() + " units" : "") + kpi("Break-even price", isFinite(r.breakEvenPrice) ? money(r.breakEvenPrice, m) : "—") + kpi("Break-even ACoS", isFinite(r.breakEvenAcos) ? Math.max(0, Math.round(r.breakEvenAcos)) + "%" : "—") + kpi("Max CPC @10% CVR", money(Math.max(0, r.net + r.ads) * 0.1, m)) + "</div></div></div>";
  }
  function numF2(C, k, label, step) { return '<label class="f">' + label + '<input class="in" data-c="' + k + '" type="number" step="' + (step || "0.01") + '" value="' + esc(C[k]) + '"></label>'; }
  function bindCalc(C, rerender) {
    $$("[data-c]").forEach(function (e) { e.onchange = function () { C[e.getAttribute("data-c")] = parseFloat(e.value) || 0; rerender(); }; });
    var ct = $("c-cat"); if (ct) ct.onchange = function () { C.cat = ct.value; rerender(); };
    var fb = $("c-fbm"); if (fb) fb.onchange = function () { C.fbm = fb.checked; rerender(); };
    var vt = $("c-vat"); if (vt) vt.onchange = function () { C.vat = vt.checked; rerender(); };
  }
  function pListing(p, r, g) {
    var parts = { title: 15, bullets: 15, images: 15, video: 5, aplus: 10, desc: 5, reviews: 15, keywords: 15 };
    var dens = PP.ngrams([(p.title || "") + " " + (p.bullets || []).join(" ")], 1).concat(PP.ngrams([p.title || "", (p.bullets || []).join(" ")], 2)).sort(function (a, b) { return b.count - a.count; }).slice(0, 24);
    return '<div class="g2"><div class="card"><div class="row">' + dial(g.score) + '<div><h2 style="font-size:16px">Listing grade</h2><div class="small muted">' + (p.title || "").length + " title characters · " + (p.bullets || []).length + " bullets" + (p.images != null ? " · " + p.images + " images" : "") + (p.video ? " · video" : "") + (p.aplus ? " · A+" : "") + "</div></div></div>" +
      '<div style="margin-top:12px">' + Object.keys(parts).map(function (k) { return '<div class="hb"><span class="lb">' + k + '</span><span class="tr"><i style="width:' + ((g.parts[k] || 0) / parts[k] * 100) + '%"></i></span><span class="v">' + (g.parts[k] || 0) + "/" + parts[k] + "</span></div>"; }).join("") + '</div><div class="flags" style="margin-top:10px">' + (g.tips.length ? g.tips.map(function (t) { return flag(t[0], t[1], t[2]); }).join("") : flag("g", "Covers the basics", "No major issues.")) + '</div><button class="btn gh sm" style="margin-top:10px" data-go="listing">Rewrite it in the Listing builder</button></div>' +
      '<div class="card"><div class="eb">Keyword density</div><div style="margin-top:8px">' + (dens.length ? dens.map(function (d) { return '<span class="chip">' + esc(d.term) + " <b>" + d.count + "</b></span>"; }).join("") : '<p class="note">No bullets read yet.</p>') + '</div><div class="eb" style="margin-top:10px">Bullets</div>' + (p.bullets || []).map(function (b) { return '<p class="small" style="margin:6px 0"><span class="faint">[' + b.length + "]</span> " + esc(b) + "</p>"; }).join("") + "</div></div>";
  }
  function pReviews(p) {
    var hist = p.histogram || {}, has = Object.keys(hist).length;
    var bars = [5, 4, 3, 2, 1].map(function (s) { return { label: s + " star", value: +hist[s] || 0, color: s >= 4 ? "var(--good)" : s === 3 ? "var(--warn)" : "var(--bad)" }; });
    var tr = p.topReviews || [];
    var th = PP.reviewThemes(tr.map(function (x) { return x.title + ". " + x.body; }).join("\n"));
    return '<div class="g2"><div class="card"><div class="eb">Rating breakdown</div><div style="margin-top:10px">' + (has ? hbars(bars, function (v) { return v + "%"; }) : '<p class="note">Not read yet.</p>') + "</div>" + (p.customersSay ? '<div class="eb" style="margin-top:12px">Amazon “Customers say”</div><p>' + esc(p.customersSay) + "</p>" : "") + '<div class="eb" style="margin-top:10px">Themes in on-page reviews</div><div style="margin-top:6px">' + th.negative.slice(0, 10).map(function (x) { return '<span class="chip neg">' + esc(x[0]) + " <b>" + x[1] + "</b></span>"; }).join("") + th.positive.slice(0, 10).map(function (x) { return '<span class="chip pos">' + esc(x[0]) + " <b>" + x[1] + "</b></span>"; }).join("") + "</div></div>" +
      '<div class="card"><div class="eb">Reviews on the page</div>' + (tr.length ? tr.slice(0, 8).map(function (x) { return '<div style="padding:8px 0;border-bottom:1px solid var(--line)"><b>' + (x.rating ? x.rating + "★ " : "") + esc(x.title) + '</b><div class="small muted">' + esc((x.body || "").slice(0, 400)) + "</div></div>"; }).join("") : '<p class="note">None read. For a full analysis, copy the product\'s reviews page into Review intelligence.</p>') + '<button class="btn gh sm" style="margin-top:10px" data-go="reviews">Deep review analysis</button></div></div>';
  }
  function pHistory(p) {
    var u = PP.urls(p.mkt, p.asin);
    return '<div class="card"><div class="eb">Price, rank and sales history</div><p class="small muted" style="max-width:70ch">Amazon does not publish history, so every tool reads it from a tracker. Product Pilot gives you three routes:</p><div class="ways" style="margin-top:10px">' +
      '<div class="way"><h3>Keepa (free view)</h3><p class="small muted">Full price, Best Sellers Rank, offer count and buy-box graphs. Free to view on the site.</p><a class="btn gh" target="_blank" rel="noopener" href="' + esc(u.keepa) + '">Open Keepa graph ↗</a></div>' +
      '<div class="way"><h3>CamelCamelCamel</h3><p class="small muted">Free Amazon and third-party price history with lowest and highest prices.</p><a class="btn gh" target="_blank" rel="noopener" href="' + esc(u.camel) + '">Open price history ↗</a></div>' +
      '<div class="way"><h3>Extension tracker</h3><p class="small muted">Press 📈 Track on the product page. It records price, rank, reviews and sellers daily and alerts you on big moves. With a Keepa key, the product panel draws the full 1-year history inline.</p><button class="btn gh" data-go="extension">Get the extension</button></div></div></div>';
  }
  function bindProduct() {
    $$("[data-go]").forEach(function (b) { b.onclick = function () { go(b.getAttribute("data-go")); }; });
    $("p-go").onclick = function () { var a = PP.extractAsin($("p-asin").value); if (!a) { $("p-asin").focus(); return; } productLive(a); };
    $("p-asin").onkeydown = function (e) { if (e.key === "Enter") $("p-go").click(); };
    $("p-man").onclick = function () { UIS.pMan = !UIS.pMan; render(); };
    var mg = $("m-go"); if (mg) mg.onclick = function () { function v(id) { return parseFloat($(id).value) || 0; } var cat = $("m-cat").value; setProduct({ mkt: MKT, asin: "MANUAL", title: $("m-title").value || "Manual product", price: v("m-price"), bsr: v("m-bsr"), rankCategory: cat, category: cat, reviews: v("m-rev"), rating: v("m-rat"), bought: v("m-bought"), weightKg: v("m-kg") || NaN, dims: PP.parseDimsCm($("m-dims").value), bullets: [], topReviews: [], histogram: {} }, "manual"); UIS.pMan = false; render(); };
    if ($("p-paste")) bindPaste("p-paste", "p-import", "p-msg", function (kind) { UIS.pNoLive = false; if (kind === "search") go("search"); else render(); });
    if (!PROD) return;
    $$("#pt .tab").forEach(function (b) { b.onclick = function () { UIS.ptab = b.getAttribute("data-t"); render(); }; });
    bindCalc(CALC, render);
    var cs = $("c-save"); if (cs) cs.onclick = function () { lsSet("cost:" + PROD.mkt + ":" + PROD.asin, CALC); cs.textContent = "Saved ✓"; };
    var st = $("p-star"); if (st) st.onclick = function () { putSaved("product", Object.assign(compactItem(PROD), { mkt: PROD.mkt, sales: PROD.sales, revenue: PROD.revenue, score: PROD.score, margin: PROD.margin })).then(function () { st.textContent = "★ Saved"; }); };
  }

  // ================================================================ AI ANALYST
  var CHAT = [];
  var QUICK = ["Should I sell in this niche? Give me a clear yes or no.", "What product should I launch here, and how is it better than page 1?", "Write a one-page product brief for my supplier.", "What price should I launch at, and how many units should my first order be?", "Plan my first 90 days: PPC, reviews, price.", "Which listing on page 1 is the weakest and why?"];
  function vAnalyst() {
    var h = head("Research", "AI analyst", "Ask Claude anything about the search and product you have loaded. It sees the real numbers on this page — prices, ranks, sales estimates, reviews — and answers like a senior Amazon consultant.");
    h += '<div class="card" style="margin-bottom:12px"><div class="small muted">Context: ' + (DATA ? "search “" + esc(DATA.query) + "” (" + DATA.items.length + " listings" + (DATA.source === "example" ? ", example data" : "") + ")" : "no search") + (PROD ? " · product " + esc(PROD.asin) : "") + '</div><div class="row" style="margin-top:8px">' + QUICK.map(function (q, i) { return '<button class="btn gh sm wrapbtn" data-q="' + i + '">' + esc(q) + "</button>"; }).join("") + "</div></div>";
    h += '<div id="chat">' + CHAT.map(function (m) { return '<div class="msg ' + (m.role === "user" ? "u" : "a") + '"><div class="md">' + (m.role === "user" ? "<p>" + esc(m.content) + "</p>" : md(m.content)) + "</div></div>"; }).join("") + "</div>";
    h += '<div class="card"><textarea class="in" id="a-in" placeholder="e.g. What would make a divan bed stand out from these listings?" style="min-height:70px"></textarea><div class="row" style="margin-top:8px"><button class="btn" id="a-send">Ask</button><button class="btn gh" id="a-stop" hidden>Stop</button><button class="btn gh" id="a-clear">Clear chat</button><span id="a-msg" class="small"></span></div></div>';
    MAIN.innerHTML = '<section class="view on">' + h + "</section>";
    $$("[data-q]").forEach(function (b) { b.onclick = function () { $("a-in").value = QUICK[+b.getAttribute("data-q")]; ask(); }; });
    $("a-send").onclick = ask; $("a-clear").onclick = function () { CHAT = []; render(); };
    $("a-in").onkeydown = function (e) { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) ask(); };
  }
  var CTL = null;
  function ask() {
    var q = $("a-in").value.trim(); if (!q) return;
    if (!CAP.sample) { $("a-msg").innerHTML = '<span class="warn">AI answers work when this page is open inside Claude.</span>'; return; }
    CHAT.push({ role: "user", content: q }); $("a-in").value = "";
    var box = document.createElement("div"); box.className = "msg u"; box.innerHTML = '<div class="md"><p>' + esc(q) + "</p></div>"; $("chat").appendChild(box);
    var ans = document.createElement("div"); ans.className = "msg a"; ans.innerHTML = '<div class="md"><p class="note"><span class="spin"></span> Thinking…</p></div>'; $("chat").appendChild(ans);
    var ctx = "You are Product Pilot's analyst: a senior Amazon FBA/private-label consultant. The seller sells in the Amazon " + (DATA ? DATA.mkt : MKT) + " marketplace (their business: beds and mattresses, Eagle Bed UK — mention when advice differs for bulky items). Use the data below; say clearly when a figure is an estimate or example data. Be specific, practical and concise; use headings and bullets.\n\n" + nicheContext() + (PROD ? "\n\nFocused product: " + JSON.stringify(compactItem(PROD)).slice(0, 4000) + (CALC ? "\nSeller's unit economics: " + JSON.stringify(calc(CALC, PROD.mkt)) : "") : "");
    var turns = [{ role: "user", content: ctx }].concat(CHAT.slice(-10));
    CTL = new AbortController(); $("a-stop").hidden = false; $("a-stop").onclick = function () { CTL.abort(); };
    CAP.sample(turns, { onText: function (o) { ans.firstChild.innerHTML = md(o.text); }, signal: CTL.signal, cache: false }).then(function (r) { CHAT.push({ role: "assistant", content: r.text }); }, function (e) { if (e && e.text) { ans.firstChild.innerHTML = md(e.text); CHAT.push({ role: "assistant", content: e.text }); } else ans.firstChild.innerHTML = '<p class="bad">' + esc(aiError(e)) + "</p>"; }).then(function () { var s = $("a-stop"); if (s) s.hidden = true; });
  }

  // ================================================================ KEYWORD LAB
  var KW = { seed: "", rows: [], sugg: [] };
  function vKeywords() {
    var h = head("Research", "Keyword lab", "Build the keyword list a listing and PPC campaign need: phrases page-1 competitors use, live Amazon search suggestions, Claude's buyer-intent expansion, a keyword processor and a backend search-terms builder.");
    var seed = KW.seed || (DATA ? DATA.query : "");
    h += '<div class="card" style="margin-bottom:14px"><div class="row"><input class="in grow" id="k-seed" value="' + esc(seed) + '" placeholder="Seed keyword, e.g. divan bed" style="max-width:360px"><button class="btn" id="k-ai">Expand with Claude</button><button class="btn gh" id="k-live">Amazon suggestions (live)</button><span id="k-st" class="small muted"></span></div><p class="note">Amazon suggestions are what shoppers really type (read through the Claude desktop app\'s browser, or the extension\'s Keyword research for an A–Z sweep). Claude\'s volume levels are judgement, not Amazon data — Amazon publishes search volume to no one; paid tools model it too.</p></div>';
    var grams = DATA ? PP.ngrams(DATA.items.map(function (r) { return r.title; }), 3).filter(function (g) { return g.words > 1; }).slice(0, 30) : [];
    h += '<div class="g2"><div class="card"><div class="row"><div class="eb grow">Keyword list (' + KW.rows.length + ")</div><button class=\"btn gh sm\" id=\"k-copy\">Copy</button><button class=\"btn gh sm\" id=\"k-csv\">Export CSV</button><button class=\"btn gh sm\" id=\"k-tolist\">Use in Listing builder</button></div>" +
      (KW.rows.length ? '<div class="tw" style="margin-top:8px;max-height:480px;overflow:auto"><table class="t"><thead><tr><th>Keyword</th><th>Source</th><th>Intent</th><th>Demand</th><th>Relevance</th></tr></thead><tbody>' + KW.rows.map(function (r) { return "<tr><td>" + esc(r.keyword) + '</td><td class="small muted">' + esc(r.source) + "</td><td>" + esc(r.intent || "") + "</td><td>" + (r.demand ? '<span class="tag ' + (r.demand === "high" ? "fb" : r.demand === "low" ? "" : "sp") + '">' + esc(r.demand) + "</span>" : "") + "</td><td>" + (r.relevance != null ? r.relevance + "/10" : "") + "</td></tr>"; }).join("") + "</tbody></table></div>" : '<p class="note" style="margin-top:8px">Expand a seed to build the list.</p>') + "</div>" +
      '<div class="card"><div class="eb">From page-1 titles' + (DATA ? " (“" + esc(DATA.query) + "”)" : "") + '</div><div style="margin-top:8px">' + (grams.length ? grams.map(function (g) { return '<span class="chip">' + esc(g.term) + " <b>" + g.docs + "</b></span>"; }).join("") + '<div><button class="btn gh sm" id="k-addgrams">Add these to the list</button></div>' : '<p class="note">Run a search first.</p>') + "</div></div></div>";
    h += '<div class="card" style="margin-top:14px"><h2 style="font-size:16px">Keyword processor</h2><p class="note">Paste any keyword dump. It removes duplicates and stop words, ranks root words and builds backend search terms that fit Amazon\'s 249-byte limit.</p><textarea class="in" id="fr-in" placeholder="One keyword or title per line…">' + esc(KW.rows.map(function (r) { return r.keyword; }).join("\n")) + '</textarea><div class="row" style="margin-top:8px"><button class="btn sm" id="fr-go">Process</button></div><div id="fr-out" style="margin-top:10px"></div></div>';
    MAIN.innerHTML = '<section class="view on">' + h + "</section>";
    function add(list, source) { var have = {}; KW.rows.forEach(function (r) { have[r.keyword] = 1; }); list.forEach(function (x) { var k = String(x.keyword || x).toLowerCase().trim(); if (k && !have[k]) { have[k] = 1; KW.rows.push({ keyword: k, source: source, intent: x.intent, demand: x.demand, relevance: x.relevance }); } }); }
    $("k-ai").onclick = function () {
      var s = $("k-seed").value.trim(); if (!s) return; KW.seed = s; var st = $("k-st");
      if (!CAP.sample) { st.innerHTML = '<span class="warn">Needs this page open inside Claude.</span>'; return; }
      st.innerHTML = '<span class="spin"></span> Claude is expanding…';
      CAP.sample.json('You are an Amazon ' + MKT + ' keyword researcher. Seed: "' + s + '". ' + (DATA ? "Competitor titles for context:\n" + DATA.items.slice(0, 20).map(function (x) { return "- " + x.title; }).join("\n") + "\n" : "") + 'List 45 keyword phrases Amazon shoppers in this marketplace type when looking for this product (local spelling and sizes, e.g. UK "4ft6 double"): head terms, long-tail, sizes, materials, features, use cases, gift/audience terms; no brand names of competitors. Reply with only a JSON array of {"keyword":string,"intent":"buy"|"compare"|"research","demand":"high"|"medium"|"low","relevance":1-10}. demand is your relative judgement of search popularity.', { modelTier: "default" }).then(function (arr) { if (!Array.isArray(arr)) throw { code: "invalid_json" }; add(arr, "Claude"); vKeywords(); }, function (e) { st.innerHTML = '<span class="bad">' + esc(aiError(e)) + "</span>"; });
    };
    $("k-live").onclick = function () {
      var s = $("k-seed").value.trim(); if (!s) return; KW.seed = s; var st = $("k-st");
      if (!CAP.mcp) { st.innerHTML = '<span class="warn">Live suggestions need the Claude desktop app (or use the extension\'s Keyword research).</span>'; return; }
      var m = PP.MARKETS[MKT], prefixes = [s, s + " "].concat("abcdefghijklmnopqrstuvwxyz".split("").slice(0, 12).map(function (c) { return s + " " + c; })), got = [], i = 0, chain = Promise.resolve();
      prefixes.forEach(function (pf) { chain = chain.then(function () { i++; st.innerHTML = '<span class="spin"></span> Amazon suggestions ' + i + "/" + prefixes.length; var url = "https://" + m.completion + "/api/2017/suggest?limit=11&prefix=" + encodeURIComponent(pf) + "&suggestion-type=KEYWORD&page-type=Search&alias=aps&site-variant=desktop&version=3&lop=" + m.lang + "&mid=" + m.mid + "&plain-mid=1&client-info=amazon-search-ui"; return browse(url, false).then(function (r) { var t = r.text, j0 = t.indexOf("{"); try { var j = JSON.parse(t.slice(j0, t.lastIndexOf("}") + 1)); (j.suggestions || []).forEach(function (x) { got.push({ keyword: x.value }); }); } catch (e) { } }); }); });
      chain.then(function () { add(got, "Amazon"); st.innerHTML = '<span class="good">✓ ' + got.length + " suggestions</span>"; vKeywords(); }, function (e) { st.innerHTML = '<span class="bad">Live suggestions failed (' + esc((e && (e.code || e.message)) || "error") + ").</span>"; });
    };
    var ag = $("k-addgrams"); if (ag) ag.onclick = function () { add(grams.map(function (g) { return g.term; }), "Page-1 titles"); vKeywords(); };
    $("k-copy").onclick = function () { copyText(KW.rows.map(function (r) { return r.keyword; }).join("\n"), $("k-copy")); };
    $("k-csv").onclick = function () { saveFile("keywords-" + (KW.seed || "list").replace(/\W+/g, "-") + ".csv", PP.toCSV(KW.rows, [{ label: "Keyword", key: "keyword" }, { label: "Source", key: "source" }, { label: "Intent", key: "intent" }, { label: "Demand (judgement)", key: "demand" }, { label: "Relevance", key: "relevance" }]), $("k-csv")); };
    $("k-tolist").onclick = function () { LST.bank = KW.rows.map(function (r) { return r.keyword; }).join("\n"); go("listing"); };
    $("fr-go").onclick = function () {
      var phrases = $("fr-in").value.split(/[\n,;]+/).map(function (s) { return s.trim().toLowerCase(); }).filter(Boolean), uniq = Array.from(new Set(phrases));
      var words = PP.ngrams(uniq, 1), words2 = PP.ngrams(uniq, 2).filter(function (g) { return g.words === 2; });
      var all = []; uniq.forEach(function (p) { PP.tokens(p).forEach(function (w) { if (all.indexOf(w) < 0) all.push(w); }); });
      var back = ""; all.forEach(function (w) { if (new Blob([(back + " " + w).trim()]).size <= 249) back = (back + " " + w).trim(); });
      $("fr-out").innerHTML = '<div class="g2"><div><div class="eb">Root words</div><div style="margin-top:6px">' + words.slice(0, 60).map(function (w) { return '<span class="chip">' + esc(w.term) + " <b>" + w.count + "</b></span>"; }).join("") + '</div><div class="eb" style="margin-top:8px">Top phrases</div><div style="margin-top:6px">' + words2.slice(0, 30).map(function (w) { return '<span class="chip">' + esc(w.term) + " <b>" + w.count + "</b></span>"; }).join("") + '</div></div><div><div class="eb">Unique phrases (' + uniq.length + " of " + phrases.length + ')</div><textarea class="in" style="min-height:110px">' + esc(uniq.join("\n")) + '</textarea><div class="eb" style="margin-top:8px">Backend search terms (' + new Blob([back]).size + ' / 249 bytes)</div><textarea class="in" style="min-height:80px">' + esc(back) + "</textarea></div></div>";
    };
  }

  // ================================================================ REVIEW INTELLIGENCE
  var RV = { text: "", ai: null };
  function vReviews() {
    var h = head("Research", "Review intelligence", "Paste competitor reviews (open a product's “See all reviews” page, select all and copy). Product Pilot counts the complaint and praise themes; Claude turns them into the product you should make and the listing angles that sell it.");
    h += '<div class="card"><textarea class="in" id="rv-in" style="min-height:180px" placeholder="Paste reviews here…">' + esc(RV.text || (PROD && PROD.topReviews ? PROD.topReviews.map(function (r) { return (r.rating ? r.rating + " out of 5 stars " : "") + r.title + "\n" + r.body; }).join("\n\n") : "")) + '</textarea><div class="row" style="margin-top:8px"><button class="btn" id="rv-go">Count themes</button><button class="btn gh" id="rv-ai">Deep analysis with Claude</button><span id="rv-st" class="small"></span></div></div><div id="rv-out" style="margin-top:14px"></div><div id="rv-ai-out" style="margin-top:14px"></div>';
    MAIN.innerHTML = '<section class="view on">' + h + "</section>";
    $("rv-go").onclick = function () {
      var t = $("rv-in").value; RV.text = t; if (!t.trim()) return;
      var th = PP.reviewThemes(t), stars = (t.match(/(\d(?:[.,]\d)?) out of 5 stars/g) || []).map(function (s) { return parseFloat(s.replace(",", ".")); });
      var dist = [5, 4, 3, 2, 1].map(function (s) { return { label: s + "★", value: stars.filter(function (x) { return Math.round(x) === s; }).length, color: s >= 4 ? "var(--good)" : s === 3 ? "var(--warn)" : "var(--bad)" }; });
      $("rv-out").innerHTML = '<div class="g2"><div class="card"><div class="eb">Complaints</div><div style="margin-top:8px">' + (th.negative.map(function (x) { return '<span class="chip neg">' + esc(x[0]) + " <b>" + x[1] + "</b></span>"; }).join("") || '<span class="note">None found.</span>') + '</div><div class="eb" style="margin-top:10px">Praise</div><div style="margin-top:8px">' + (th.positive.map(function (x) { return '<span class="chip pos">' + esc(x[0]) + " <b>" + x[1] + "</b></span>"; }).join("") || '<span class="note">None found.</span>') + '</div></div><div class="card"><div class="eb">Star mix (' + stars.length + ' reviews with a rating)</div><div style="margin-top:8px">' + (stars.length ? hbars(dist) : '<p class="note">No “x out of 5 stars” lines found.</p>') + '</div><div class="eb" style="margin-top:10px">Common phrases</div><div style="margin-top:6px">' + th.terms.slice(0, 24).map(function (x) { return '<span class="chip">' + esc(x.term) + " <b>" + x.count + "</b></span>"; }).join("") + "</div></div></div>";
    };
    $("rv-ai").onclick = function () {
      var t = $("rv-in").value; RV.text = t; if (!t.trim()) return; var st = $("rv-st");
      if (!CAP.sample) { st.innerHTML = '<span class="warn">Needs this page open inside Claude.</span>'; return; }
      st.innerHTML = '<span class="spin"></span> Claude is reading ' + PP.knum(t.length) + " characters…";
      CAP.sample.json("Analyse these Amazon customer reviews for a seller who wants to launch a better competing product. Reply with only JSON: {\"summary\":string,\"complaints\":[{\"theme\":string,\"share\":number (percent of reviews mentioning it),\"quote\":string,\"fix\":string}],\"praise\":[{\"theme\":string,\"share\":number,\"quote\":string}],\"buyers\":[{\"who\":string,\"why\":string}],\"product_improvements\":[string],\"listing_angles\":[string],\"questions_buyers_ask\":[string]}. Quotes must be verbatim from the reviews. Up to 8 complaints, 6 praise.\n\nREVIEWS:\n" + t.slice(0, 120000), { modelTier: "default" }).then(function (j) {
        st.innerHTML = "";
        function list(a, f) { return (a || []).map(f).join(""); }
        $("rv-ai-out").innerHTML = '<div class="card" style="margin-bottom:14px"><div class="eb">Claude\'s summary</div><p>' + esc(j.summary || "") + '</p></div><div class="g2"><div class="card"><div class="eb">Complaints to fix</div><div class="flags" style="margin-top:8px">' + list(j.complaints, function (c) { return '<div class="flag b"><span class="i">' + Math.round(c.share || 0) + '%</span><div><b>' + esc(c.theme) + "</b><span>“" + esc(c.quote) + "”</span><span class=\"good\" style=\"display:block\">Fix: " + esc(c.fix) + "</span></div></div>"; }) + '</div></div><div class="card"><div class="eb">What buyers love</div><div class="flags" style="margin-top:8px">' + list(j.praise, function (c) { return '<div class="flag g"><span class="i">' + Math.round(c.share || 0) + "%</span><div><b>" + esc(c.theme) + "</b><span>“" + esc(c.quote) + "”</span></div></div>"; }) + '</div><div class="eb" style="margin-top:12px">Who buys</div>' + list(j.buyers, function (b) { return '<p class="small"><b>' + esc(b.who) + "</b> — " + esc(b.why) + "</p>"; }) + '</div><div class="card"><div class="eb">Build a better product</div><ul class="small">' + list(j.product_improvements, function (x) { return "<li>" + esc(x) + "</li>"; }) + '</ul></div><div class="card"><div class="eb">Listing angles</div><ul class="small">' + list(j.listing_angles, function (x) { return "<li>" + esc(x) + "</li>"; }) + '</ul><div class="eb">Questions buyers ask (answer them in bullets &amp; images)</div><ul class="small">' + list(j.questions_buyers_ask, function (x) { return "<li>" + esc(x) + "</li>"; }) + "</ul></div></div>";
        RV.ai = j;
      }, function (e) { st.innerHTML = '<span class="bad">' + esc(aiError(e)) + "</span>"; });
    };
  }

  // ================================================================ PROFIT (standalone)
  var PC = null;
  function vProfit() {
    if (!PC) PC = { price: 249.99, cost: 70, freight: 12, prep: 1, weightKg: 35, l: 190, w: 60, h: 30, acos: 12, returns: 4, storageMonths: 1.5, fbm: false, shipFbm: 25, vat: true, cat: "Furniture", units: 60 };
    var r = calc(PC, MKT);
    var h = head("Numbers", "Profit calculator", "Full Amazon unit economics: referral fee, FBA size tier and fee, storage, VAT, ads and returns, with break-even price and ACoS. Switch to FBM to compare shipping beds yourself.");
    h += '<div class="card" style="margin-bottom:12px"><div class="row"><label class="f" style="max-width:160px">Units / month<input class="in" id="pc-units" type="number" value="' + PC.units + '"></label><span class="note">Opens with a 4ft6 divan as an example — replace with your numbers. Marketplace follows the selector at the top.</span></div></div>';
    h += profitPanel(PC, MKT, r, PC.units);
    MAIN.innerHTML = '<section class="view on">' + h + "</section>";
    bindCalc(PC, render); $("pc-units").onchange = function () { PC.units = +$("pc-units").value || 0; render(); };
  }

  // ================================================================ SALES ESTIMATOR
  var SE = { bsr: 2500, cat: "Home & Kitchen", price: 199, bought: 0 };
  function vSales() {
    var s = PP.estimateSales({ bsr: SE.bsr, category: SE.cat, mkt: MKT, bought: SE.bought });
    var h = head("Numbers", "Sales estimator", "Turn a Best Sellers Rank into monthly sales, tuned per category and marketplace — and checked against Amazon's own “bought in past month” badge when you enter it.");
    var xs = [], v = [], mark = null, ranks = [10, 30, 100, 300, 1000, 3000, 10000, 30000, 100000, 300000];
    ranks.forEach(function (b, i) { xs.push(b >= 1000 ? (b / 1000) + "k" : String(b)); v.push(PP.salesFromBsr(b, SE.cat, MKT)); });
    h += '<div class="g2"><div class="card"><div class="fg"><label class="f">Best Sellers Rank<input class="in" id="se-bsr" type="number" value="' + SE.bsr + '"></label><label class="f">Category<select class="in" id="se-cat">' + PP.catNames.map(function (n) { return "<option" + (n === SE.cat ? " selected" : "") + ">" + n + "</option>"; }).join("") + '</select></label><label class="f">Price<input class="in" id="se-price" type="number" value="' + SE.price + '"></label><label class="f">“Bought in past month” badge <i>optional, e.g. 200</i><input class="in" id="se-bought" type="number" value="' + (SE.bought || "") + '"></label></div>' +
      '<div class="kg k4" style="margin-top:14px">' + kpi("Per day", (s.units / 30).toFixed(s.units / 30 < 10 ? 1 : 0)) + kpi("Per month", s.units.toLocaleString(), PP.knum(s.low) + "–" + PP.knum(s.high)) + kpi("Revenue /mo", kmoney(s.units * SE.price)) + kpi("Per year", PP.knum(s.units * 12)) + '</div><p class="note">Source: ' + esc(s.source) + ". Model: category power curve through typical rank/sales points, scaled to the " + MKT + " marketplace. Use it to compare products; confirm a winner with Keepa rank drops or a week of tracking.</p></div>" +
      '<div class="card"><div class="eb">Monthly units vs rank — ' + esc(SE.cat) + " (" + MKT + ')</div><div style="margin-top:10px">' + lineChart([{ v: v, color: "var(--accent)", area: true }], { xs: xs, h: 230, min: 0, label: "Sales by rank" }) + '</div><p class="note">Rank along the bottom (log steps), estimated units per month up the side.</p></div></div>';
    MAIN.innerHTML = '<section class="view on">' + h + "</section>";
    ["bsr", "price", "bought"].forEach(function (k) { $("se-" + k).onchange = function () { SE[k] = parseFloat($("se-" + k).value) || 0; render(); }; });
    $("se-cat").onchange = function () { SE.cat = $("se-cat").value; render(); };
  }

  // ================================================================ PPC PLANNER
  var PPC = { price: 249.99, net: 55, cvr: 8, tacos: 20, kws: "" };
  function vPpc() {
    var be = PPC.price > 0 ? PPC.net / PPC.price * 100 : 0, maxcpc = PPC.net * PPC.cvr / 100, bid = maxcpc * 0.7, pOrder = PPC.net - PPC.price * PPC.tacos / 100, m = MKT;
    var kws = (PPC.kws || (KW.rows.length ? KW.rows.slice(0, 12).map(function (r) { return r.keyword; }).join(", ") : DATA ? DATA.query : "")).split(",").map(function (s) { return s.trim(); }).filter(Boolean);
    var h = head("Numbers", "PPC planner", "Know the numbers before you spend: break-even ACoS, the highest bid you can afford, profit at your target ACoS and a ready campaign structure.");
    h += '<div class="g2"><div class="card"><div class="fg"><label class="f">Sell price<input class="in" data-p="price" type="number" value="' + PPC.price + '"></label><label class="f">Profit / unit before ads<input class="in" data-p="net" type="number" value="' + PPC.net + '"></label><label class="f">Conversion rate %<input class="in" data-p="cvr" type="number" value="' + PPC.cvr + '"></label><label class="f">Target ACoS %<input class="in" data-p="tacos" type="number" value="' + PPC.tacos + '"></label></div><label class="f" style="margin-top:10px">Keywords (comma-separated)<input class="in" id="pp-kw" value="' + esc(kws.join(", ")) + '"></label></div>' +
      '<div class="card"><div class="kg">' + kpi("Break-even ACoS", be.toFixed(0) + "%", "above this, ads lose money") + kpi("Max CPC", money(maxcpc, m), "at break-even") + kpi("Start bid", money(bid, m), "70% of max") + "</div>" + '<div class="flags" style="margin-top:12px">' + (PPC.tacos >= be ? flag("b", "Target ACoS is above break-even", "Each ad sale loses " + money(-pOrder, m) + ". Lower the target or raise the margin.") : flag("g", "Target ACoS is profitable", "You keep " + money(pOrder, m) + " per ad sale.")) + "</div></div></div>";
    h += '<div class="card" style="margin-top:14px"><div class="eb">Campaign structure</div><div class="flags" style="margin-top:10px">' + flag("g", "1. Auto — discovery", "Close match, loose match, substitutes, complements. Start bid " + money(bid, m) + ". Run 2 weeks, then harvest converting search terms.") + flag("w", "2. Manual exact", kws.map(function (k) { return "[" + k + "]"; }).join("  ") + " — highest bids on proven terms.") + flag("w", "3. Manual phrase", kws.map(function (k) { return '"' + k + '"'; }).join("  ") + " — close variations.") + flag("w", "4. Manual broad", kws.join(" · ") + " — reach and new search terms at low bids.") + flag("w", "5. Product targeting", "Target competitor ASINs with weaker ratings or higher prices (from Search & X-Ray).") + flag("b", "Weekly", "Add search terms with clicks but no sales as negative exact; move winners from auto to exact.") + "</div></div>";
    MAIN.innerHTML = '<section class="view on">' + h + "</section>";
    $$("[data-p]").forEach(function (e) { e.onchange = function () { PPC[e.getAttribute("data-p")] = parseFloat(e.value) || 0; render(); }; });
    $("pp-kw").onchange = function () { PPC.kws = $("pp-kw").value; render(); };
  }

  // ================================================================ LAUNCH PLANNER
  var LP = { sup: 70, qty: 100, freight: 1200, duty: 4, insp: 150, prep: 1, photo: 400, brand: 250, ppc: 1000, cont: 10, price: 249.99, net: 55, m1: 30, grow: 20, acos: 20 };
  function vLaunch() {
    var L = LP, m = MKT, per = L.sup * (1 + L.duty / 100) + L.prep + (L.qty > 0 ? (L.freight + L.insp) / L.qty : 0), tot = per * L.qty, cap = (tot + L.photo + L.brand + L.ppc) * (1 + L.cont / 100);
    var rows = "", cum = -cap, xs = [], cumS = [];
    for (var i = 1; i <= 12; i++) { var u = Math.round(L.m1 * Math.pow(1 + L.grow / 100, i - 1)), rev = u * L.price, ad = rev * L.acos / 100, pr = u * L.net - ad; cum += pr; xs.push("M" + i); cumS.push(cum); rows += "<tr><td>Month " + i + "</td><td>" + u.toLocaleString() + "</td><td>" + kmoney(rev, m) + "</td><td>" + kmoney(ad, m) + '</td><td class="' + (pr < 0 ? "bad" : "good") + '">' + kmoney(pr, m) + '</td><td class="' + (cum < 0 ? "bad" : "good") + '"><b>' + kmoney(cum, m) + "</b></td></tr>"; }
    function f(k, l) { return '<label class="f">' + l + '<input class="in" data-l="' + k + '" type="number" value="' + L[k] + '"></label>'; }
    var h = head("Numbers", "Launch planner", "From supplier quote to the cash you need and the month you get it back: landed cost, launch budget and a 12-month cash curve.");
    h += '<div class="g2"><div class="card"><div class="eb">Landed cost</div><div class="fg f3" style="margin-top:10px">' + f("sup", "Supplier price / unit") + f("qty", "Order quantity") + f("freight", "Freight (total)") + f("duty", "Import duty %") + f("insp", "Inspection (total)") + f("prep", "Prep & packaging / unit") + '</div><div class="eb" style="margin-top:14px">Launch budget</div><div class="fg f3" style="margin-top:10px">' + f("photo", "Photography") + f("brand", "Branding & design") + f("ppc", "Launch PPC") + f("cont", "Contingency %") + '</div><div class="eb" style="margin-top:14px">Sales</div><div class="fg f3" style="margin-top:10px">' + f("price", "Sell price") + f("net", "Profit / unit before ads") + f("m1", "Month-1 units") + f("grow", "Growth / month %") + f("acos", "ACoS %") + "</div></div>" +
      '<div class="card"><div class="kg">' + kpi("Landed / unit", money(per, m)) + kpi("Stock cost", kmoney(tot, m)) + kpi("Cash needed", kmoney(cap, m), "to launch") + '</div><div class="eb" style="margin-top:14px">Cumulative cash after launch spend</div><div style="margin-top:8px">' + lineChart([{ v: cumS, color: "var(--accent)", area: true, mark: cumS.findIndex(function (v) { return v >= 0; }) > -1 ? cumS.findIndex(function (v) { return v >= 0; }) : null }], { xs: xs, h: 200, fmt: function (v) { return kmoney(v, m); }, label: "Cumulative cash" }) + '</div><p class="note">' + (cumS.some(function (v) { return v >= 0; }) ? "Cash positive in month " + (cumS.findIndex(function (v) { return v >= 0; }) + 1) + " (marked)." : "Not cash positive within 12 months at these numbers.") + "</p></div></div>";
    h += '<div class="tw" style="margin-top:14px"><table class="t"><thead><tr><th>Month</th><th>Units</th><th>Revenue</th><th>Ad spend</th><th>Profit</th><th>Cumulative cash</th></tr></thead><tbody>' + rows + "</tbody></table></div>";
    MAIN.innerHTML = '<section class="view on">' + h + "</section>";
    $$("[data-l]").forEach(function (e) { e.onchange = function () { LP[e.getAttribute("data-l")] = parseFloat(e.value) || 0; render(); }; });
  }

  // ================================================================ LISTING BUILDER
  var LST = { title: "", bullets: ["", "", "", "", ""], desc: "", backend: "", bank: "", facts: "" };
  function vListing() {
    if (!LST.bank && KW.rows.length) LST.bank = KW.rows.map(function (r) { return r.keyword; }).join("\n");
    var h = head("Build &amp; source", "Listing builder", "Write the listing against your keyword bank with live character and byte limits, a grade, and a Claude draft that uses your keywords and fixes competitors' complaints.");
    h += '<div class="g2 wide-l"><div class="card"><label class="f">Title <i id="lc-t"></i><textarea class="in" id="lb-title" style="min-height:56px">' + esc(LST.title) + "</textarea></label>" + LST.bullets.map(function (b, i) { return '<label class="f" style="margin-top:8px">Bullet ' + (i + 1) + ' <i id="lc-b' + i + '"></i><textarea class="in" data-b="' + i + '" style="min-height:58px">' + esc(b) + "</textarea></label>"; }).join("") + '<label class="f" style="margin-top:8px">Description <i id="lc-d"></i><textarea class="in" id="lb-desc">' + esc(LST.desc) + '</textarea></label><label class="f" style="margin-top:8px">Backend search terms <i id="lc-k"></i><textarea class="in" id="lb-back" style="min-height:56px">' + esc(LST.backend) + '</textarea></label><div class="row" style="margin-top:8px"><button class="btn gh sm" id="lb-copy">Copy listing</button><button class="btn gh sm" id="lb-fill">Fill backend with unused words</button></div></div>' +
      '<div class="stack"><div class="card"><label class="f">Product facts for Claude <i>sizes, materials, what\'s in the box, your edge</i><textarea class="in" id="lb-facts" style="min-height:80px" placeholder="e.g. 4ft6 double divan, grey plush velvet, 2 drawers, 54-inch headboard, 10-year frame guarantee, made in UK">' + esc(LST.facts) + '</textarea></label><button class="btn" id="lb-ai" style="margin-top:8px">Write it with Claude</button> <span id="lb-st" class="small"></span></div><div class="card"><label class="f">Keyword bank <i>one per line</i><textarea class="in" id="lb-bank" style="min-height:110px">' + esc(LST.bank) + '</textarea></label><div id="lb-cov" style="margin-top:8px"></div></div><div class="card" id="lb-grade"></div></div></div>';
    MAIN.innerHTML = '<section class="view on">' + h + "</section>";
    function read() { LST.title = $("lb-title").value; LST.bullets = $$("[data-b]").map(function (t) { return t.value; }); LST.desc = $("lb-desc").value; LST.backend = $("lb-back").value; LST.bank = $("lb-bank").value; LST.facts = $("lb-facts").value; }
    function upd() {
      read(); var full = (LST.title + " " + LST.bullets.join(" ") + " " + LST.desc + " " + LST.backend).toLowerCase(), kws = LST.bank.split("\n").map(function (x) { return x.trim().toLowerCase(); }).filter(Boolean);
      $("lc-t").textContent = LST.title.length + " / 200"; $("lc-t").className = LST.title.length > 200 ? "bad" : "";
      LST.bullets.forEach(function (b, i) { $("lc-b" + i).textContent = b.length + " / 500"; });
      $("lc-d").textContent = LST.desc.length + " / 2000"; var by = new Blob([LST.backend]).size; $("lc-k").textContent = by + " / 249 bytes"; $("lc-k").className = by > 249 ? "bad" : "";
      var used = kws.filter(function (k) { return full.indexOf(k) > -1; });
      $("lb-cov").innerHTML = '<div class="small muted" style="margin-bottom:6px">' + used.length + " of " + kws.length + " keywords used</div>" + kws.map(function (k) { var u = full.indexOf(k) > -1; return '<span class="chip' + (u ? " pos" : "") + '">' + (u ? "✓ " : "") + esc(k) + "</span>"; }).join("");
      var g = PP.gradeListing({ title: LST.title, bullets: LST.bullets.filter(Boolean), description: LST.desc, keywords: kws.slice(0, 15) });
      $("lb-grade").innerHTML = '<div class="row">' + dial(g.score) + '<div><h2 style="font-size:16px">Copy grade</h2><div class="small muted">Text only — images, video and A+ are graded on the live listing.</div></div></div><div class="flags" style="margin-top:10px">' + g.tips.filter(function (t) { return !/image|video|A\+|Rating/i.test(t[1]); }).map(function (t) { return flag(t[0], t[1], t[2]); }).join("") + "</div>";
    }
    $$("#main textarea").forEach(function (t) { t.oninput = upd; }); upd();
    $("lb-copy").onclick = function () { read(); copyText("TITLE\n" + LST.title + "\n\nBULLETS\n" + LST.bullets.map(function (b) { return "• " + b; }).join("\n") + "\n\nDESCRIPTION\n" + LST.desc + "\n\nBACKEND SEARCH TERMS\n" + LST.backend, $("lb-copy")); };
    $("lb-fill").onclick = function () { read(); var have = {}; PP.tokens(LST.title + " " + LST.bullets.join(" ") + " " + LST.desc).forEach(function (w) { have[w] = 1; }); var out = ""; LST.bank.split("\n").forEach(function (k) { PP.tokens(k).forEach(function (w) { if (!have[w] && (" " + out + " ").indexOf(" " + w + " ") < 0 && new Blob([(out + " " + w).trim()]).size <= 249) out = (out + " " + w).trim(); }); }); $("lb-back").value = out; upd(); };
    $("lb-ai").onclick = function () {
      read(); var st = $("lb-st"); if (!CAP.sample) { st.innerHTML = '<span class="warn">Needs this page open inside Claude.</span>'; return; }
      st.innerHTML = '<span class="spin"></span> Writing…';
      CAP.sample.json("Write an Amazon " + MKT + " product listing that ranks and converts. Follow Amazon style rules: title ≤ 200 characters with the main keyword first, no promotional claims like 'best'; 5 bullets of 150–250 characters each starting with a short CAPS benefit label; description ≤ 1500 characters; backend search terms ≤ 240 bytes, lowercase, no commas, no words already in the title, no competitor brands. Use as many bank keywords as read naturally. Address the complaints competitors get.\n\nPRODUCT FACTS:\n" + (LST.facts || "(none given — infer from keywords)") + "\n\nKEYWORD BANK:\n" + LST.bank.slice(0, 4000) + (RV.ai ? "\n\nCOMPETITOR COMPLAINTS:\n" + (RV.ai.complaints || []).map(function (c) { return "- " + c.theme + ": " + c.fix; }).join("\n") : "") + (DATA ? "\n\nCOMPETITOR TITLES:\n" + DATA.items.slice(0, 10).map(function (x) { return "- " + x.title; }).join("\n") : "") + '\n\nReply with only JSON: {"title":string,"bullets":[5 strings],"description":string,"backend":string}', { modelTier: "default" }).then(function (j) {
        LST.title = j.title || ""; LST.bullets = (j.bullets || []).concat(["", "", "", "", ""]).slice(0, 5); LST.desc = j.description || ""; LST.backend = j.backend || ""; vListing(); var s2 = $("lb-st"); if (s2) s2.innerHTML = '<span class="good">✓ Draft written — edit freely</span>';
      }, function (e) { st.innerHTML = '<span class="bad">' + esc(aiError(e)) + "</span>"; });
    };
  }

  // ================================================================ SUPPLIERS
  var SUP = { q: "", brand: "", mode: "generic" };
  function vSuppliers() {
    var q = SUP.q || (PROD ? PP.titlePhrases(PROD.title || "", [], 1)[0] || "" : DATA ? DATA.query : ""), brand = SUP.brand, e = encodeURIComponent, region = MKT === "US" ? "USA" : MKT === "CA" ? "Canada" : MKT === "UK" ? "UK" : "Europe";
    function lc(n, u, t) { return '<a class="kpi" target="_blank" rel="noopener" href="' + esc(u) + '" style="text-decoration:none;color:var(--fg)"><b>' + esc(n) + '</b><div class="s">' + esc(t) + " ↗</div></a>"; }
    function gq(s) { return "https://www.google.com/search?q=" + e(s); }
    var h = head("Build &amp; source", "Supplier finder", "Find factories for your own brand, or a brand's authorised distributor to resell legally — and check an invoice will pass Amazon ungating before you pay.");
    h += '<div class="card" style="margin-bottom:14px"><div class="fg"><label class="f">Product<input class="in" id="sp-q" value="' + esc(q) + '"></label><label class="f">Brand to resell <i>leave blank for own brand</i><input class="in" id="sp-b" value="' + esc(brand) + '"></label></div><div class="row" style="margin-top:10px"><button class="btn" id="sp-go">Update searches</button></div></div>';
    h += '<div class="card" style="margin-bottom:14px"><div class="eb">Manufacturers</div><div class="kg k4" style="margin-top:10px">' + lc("Alibaba", "https://www.alibaba.com/trade/search?SearchText=" + e(q), "Global factories · Trade Assurance") + lc("1688", "https://s.1688.com/selloffer/offer_search.htm?keywords=" + e(q), "China domestic · cheapest") + lc("Made-in-China", "https://www.made-in-china.com/productdirectory.do?word=" + e(q), "Audited suppliers") + lc("Global Sources", "https://www.globalsources.com/searchList/products?keyWord=" + e(q), "Verified exporters") + lc("IndiaMART", "https://dir.indiamart.com/search.mp?ss=" + e(q), "Indian manufacturers") + lc("Europages", "https://www.europages.co.uk/en/search?q=" + e(q), "EU / UK makers") + lc("ThomasNet", "https://www.thomasnet.com/suppliers/?searchterm=" + e(q), "US manufacturers") + lc("Google: factories", gq(q + " manufacturer " + region), "Local makers") + "</div></div>";
    h += '<div class="card" style="margin-bottom:14px"><div class="eb">Wholesale &amp; brands</div><div class="kg k4" style="margin-top:10px">' + lc("Faire", "https://www.faire.com/search?q=" + e(q), "Wholesale brands") + lc("Ankorstore", "https://www.ankorstore.com/en-gb/search?q=" + e(q), "EU / UK wholesale") + lc("Esources", "https://www.esources.co.uk/", "UK wholesale directory") + lc("Kompass", "https://www.kompass.com/en/searchCompanies?text=" + e(q), "Company directory") + (brand ? lc("“" + brand + "” distributor", gq('"' + brand + '" authorised distributor ' + region), "Official route") + lc("“" + brand + "” trade account", gq(brand + " trade account wholesale " + region), "Apply to stock") + lc("“" + brand + "” stockist", gq(brand + " become a stockist"), "Stockist programme") : "") + "</div></div>";
    var INV = ["From a manufacturer or authorised distributor (not a shop)", "It's an invoice — not a receipt or order confirmation", "Shows the supplier's name, address and phone or website", "Shows your business name and address, matching Seller Central", "Covers at least 10 units", "Dated within the last 180 days", "Lists the brand and product clearly", "Nothing crossed out, hidden or edited"];
    h += '<div class="g2"><div class="card"><div class="eb">Will this invoice pass ungating?</div><div style="margin-top:8px">' + INV.map(function (t, i) { return '<label class="row small" style="flex-wrap:nowrap;align-items:flex-start;padding:4px 0"><input type="checkbox" class="inv" id="inv' + i + '"> <span>' + esc(t) + "</span></label>"; }).join("") + '</div><div id="inv-out" class="note"></div></div><div class="card"><div class="eb">Outreach email</div><textarea class="in" id="sp-mail" style="min-height:190px">' + esc("Subject: Trade account enquiry — " + (brand || q) + "\n\nHello,\n\nI run an online retail business in the " + region + " and would like to stock " + (brand || q) + ". Could you tell me:\n\n1. Your trade price list and minimum order quantity\n2. Lead time and shipping terms to the " + region + "\n3. Whether you issue a VAT / commercial invoice (needed for marketplace approval)\n4. Whether samples are available\n\n[Business name] · [Address] · [Website] · [VAT number]\n\nThank you,\n[Your name]") + '</textarea><button class="btn gh sm" id="sp-copy" style="margin-top:8px">Copy email</button></div></div>';
    MAIN.innerHTML = '<section class="view on">' + h + "</section>";
    $("sp-go").onclick = function () { SUP.q = $("sp-q").value; SUP.brand = $("sp-b").value; render(); };
    $("sp-copy").onclick = function () { copyText($("sp-mail").value, $("sp-copy")); };
    function inv() { var n = $$(".inv").filter(function (c) { return c.checked; }).length, p = Math.round(n / INV.length * 100); $("inv-out").innerHTML = "<b class=\"" + (p === 100 ? "good" : p >= 70 ? "warn" : "bad") + '">' + p + "% ready</b> — " + (p === 100 ? "meets Amazon's documented invoice rules." : "Amazon rejects an invoice that misses any one of these."); }
    $$(".inv").forEach(function (c) { c.onchange = inv; }); inv();
  }

  // ================================================================ RISK
  var RK = { f: [1, 1, 1, 1, 1, 1, 1], c: {}, v: { 0: 1, 1: 1, 2: 1, 3: 1, 4: 1, 5: 1 } };
  function vRisk() {
    var RF = [["Competition intensity", 2], ["Brand dominance", 2], ["Price-war risk", 1.5], ["Seasonality", 1], ["Returns / damage in transit", 1.5], ["IP, trademark or gating", 2], ["Single supplier dependency", 1]];
    var COMP = ["Fire safety labelling (UK furniture & mattresses)", "Batteries or electrical", "Children's product", "Skin contact / cosmetic", "Food or supplement", "Medical or health claim", "Hazmat / flammable", "Brand or category gated", "Needs UKCA / CE / FCC marking"];
    var VAL = ["Demand proven", "Profit / unit healthy", "Margin ≥ 20%", "Clear differentiation", "Supplier sampled", "Within budget"];
    var sum = 0, mx = 0; RF.forEach(function (f, i) { sum += f[1] * RK.f[i]; mx += f[1] * 2; }); var risk = Math.round(sum / mx * 100);
    var comp = Object.keys(RK.c).filter(function (k) { return RK.c[k]; }).length, val = Object.keys(RK.v).filter(function (k) { return RK.v[k]; }).length;
    var goS = Math.round(val / VAL.length * 70 + (100 - risk) / 100 * 30); if (comp) goS = Math.min(goS, 72);
    var verdict = goS >= 65 && risk < 60 ? ["GO", "Fundamentals clear — move to sourcing."] : goS >= 45 ? ["REVIEW", "Close the gaps before committing cash."] : ["AVOID", "Too many red flags for now."];
    var h = head("Build &amp; source", "Risk check", "The last gate before you spend: a weighted risk score, a compliance checklist and a GO / REVIEW / AVOID verdict.");
    h += '<div class="g2"><div class="card"><div class="row"><div class="eb grow">Risk factors</div><span class="pill" style="background:' + scoreColor(100 - risk) + '">' + risk + "%</span></div>" + RF.map(function (f, i) { return '<label class="f" style="margin-top:8px">' + f[0] + '<select class="in" data-rf="' + i + '"><option value="0"' + (RK.f[i] === 0 ? " selected" : "") + '>Low</option><option value="1"' + (RK.f[i] === 1 ? " selected" : "") + '>Medium</option><option value="2"' + (RK.f[i] === 2 ? " selected" : "") + ">High</option></select></label>"; }).join("") + "</div>" +
      '<div class="stack"><div class="card"><div class="eb">Compliance (UK/EU/US)</div>' + COMP.map(function (t, i) { return '<label class="row small" style="flex-wrap:nowrap;padding:3px 0"><input type="checkbox" data-rc="' + i + '"' + (RK.c[i] ? " checked" : "") + "> " + esc(t) + "</label>"; }).join("") + '<p class="note">' + (comp ? comp + " item(s) need approval, testing or certification — budget time and money, and check with a professional. Not legal advice." : "Nothing flagged — still confirm the category isn't gated in Seller Central.") + '</p></div><div class="card"><div class="eb">Validation</div><div class="row" style="margin-top:6px">' + VAL.map(function (t, i) { return '<label class="small"><input type="checkbox" data-rv="' + i + '"' + (RK.v[i] ? " checked" : "") + "> " + esc(t) + "</label>"; }).join("") + '</div><div class="row" style="margin-top:12px">' + dial(goS) + "<div><h2>" + verdict[0] + '</h2><div class="small muted">' + verdict[1] + "</div></div></div></div></div></div>";
    MAIN.innerHTML = '<section class="view on">' + h + "</section>";
    $$("[data-rf]").forEach(function (s) { s.onchange = function () { RK.f[+s.getAttribute("data-rf")] = +s.value; render(); }; });
    $$("[data-rc]").forEach(function (s) { s.onchange = function () { RK.c[s.getAttribute("data-rc")] = s.checked; render(); }; });
    $$("[data-rv]").forEach(function (s) { s.onchange = function () { RK.v[s.getAttribute("data-rv")] = s.checked; render(); }; });
  }

  // ================================================================ SAVED
  function vSaved() {
    var h = head("Yours", "Saved", "Products and searches you saved" + (DBP ? ", kept in your Claude account so they follow you between devices." : " in this browser."));
    var items = SAVED.items.slice().sort(function (a, b) { return (b.score || 0) - (a.score || 0); });
    h += '<div class="card" style="margin-bottom:14px"><div class="row"><h2 class="grow" style="font-size:16px">Products (' + items.length + ')</h2><button class="btn gh sm" id="sv-csv">Export CSV</button></div>' + (items.length ? '<div class="tw" style="margin-top:10px"><table class="t"><thead><tr><th>Score</th><th>Product</th><th>Price</th><th>BSR</th><th>Sales/mo</th><th>Revenue/mo</th><th>Reviews</th><th>Saved</th><th></th></tr></thead><tbody>' + items.map(function (x) { return "<tr><td>" + pill(x.score || 0) + '</td><td class="wrap"><a href="#product" data-sv="' + esc(x._id) + '">' + esc((x.title || x.asin).slice(0, 80)) + '</a><div class="small faint"><span class="mono">' + esc(x.asin) + "</span> · " + esc(x.mkt) + "</div></td><td>" + (x.price ? money(x.price, x.mkt) : "") + "</td><td>" + (x.bsr ? "#" + x.bsr.toLocaleString() : "") + "</td><td>" + (x.sales || "") + "</td><td>" + (x.revenue ? kmoney(x.revenue, x.mkt) : "") + "</td><td>" + (x.reviews || "") + "</td><td>" + new Date(x.savedAt).toISOString().slice(0, 10) + '</td><td><button class="btn gh sm" data-del="' + esc(x._id) + '" data-k="product">✕</button></td></tr>'; }).join("") + "</tbody></table></div>" : '<p class="note">Press ☆ on a product in Search &amp; X-Ray.</p>') + "</div>";
    h += '<div class="card"><h2 style="font-size:16px">Searches (' + SAVED.searches.length + ")</h2>" + (SAVED.searches.length ? '<div class="tw" style="margin-top:10px"><table class="t"><thead><tr><th>Search</th><th>Market</th><th>Niche</th><th>Page revenue</th><th>Avg reviews</th><th>Saved</th><th></th></tr></thead><tbody>' + SAVED.searches.map(function (s) { var su = s.summary || {}; return '<tr><td><a href="#search" data-ss="' + esc(s._id) + '">' + esc(s.query) + "</a></td><td>" + esc(s.mkt) + "</td><td>" + pill(su.score || 0) + "</td><td>" + kmoney(su.totalRevenue || 0, s.mkt) + "</td><td>" + PP.knum(su.avgReviews || 0) + "</td><td>" + new Date(s.savedAt).toISOString().slice(0, 10) + '</td><td><button class="btn gh sm" data-del="' + esc(s._id) + '" data-k="search">✕</button></td></tr>'; }).join("") + "</tbody></table></div>" : '<p class="note">Press “Save search” on a result to keep the whole niche snapshot.</p>') + "</div>";
    MAIN.innerHTML = '<section class="view on">' + h + "</section>";
    $$("[data-del]").forEach(function (b) { b.onclick = function () { delSaved(b.getAttribute("data-k"), b.getAttribute("data-del")).then(render); }; });
    $$("[data-sv]").forEach(function (a) { a.onclick = function (e) { e.preventDefault(); var x = SAVED.items.filter(function (i) { return i._id === a.getAttribute("data-sv"); })[0]; if (x) { setProduct(JSON.parse(JSON.stringify(x)), "saved"); go("product"); } }; });
    $$("[data-ss]").forEach(function (a) { a.onclick = function (e) { e.preventDefault(); var s = SAVED.searches.filter(function (i) { return i._id === a.getAttribute("data-ss"); })[0]; if (s) { MKT = s.mkt; $("qm").value = MKT; setData({ mkt: s.mkt, query: s.query, kind: "search", source: s.source, t: s.t, resultCount: s.resultCount, items: JSON.parse(JSON.stringify(s.items)) }); go("search"); } }; });
    $("sv-csv").onclick = function () { items.forEach(function (x) { x.mkt = x.mkt || MKT; }); saveFile("product-pilot-saved.csv", PP.toCSV(items, PP.XRAY_COLS), $("sv-csv")); };
  }

  // ================================================================ STORE DATA
  function vStore() {
    var h = head("Yours", "My store data", "Your real Amazon numbers, privately: download a Business Report from Seller Central (Reports → Business Reports → Detail Page Sales and Traffic by Child Item → Download CSV) and open it here. The file is read in your browser and never uploaded.");
    h += '<div class="card"><input type="file" id="st-file" accept=".csv,.tsv,.txt"><textarea class="in" id="st-paste" style="margin-top:10px;min-height:80px" placeholder="…or paste the CSV"></textarea><div class="row" style="margin-top:8px"><button class="btn" id="st-go">Analyze</button><span id="st-msg" class="small"></span></div></div><div id="st-out" style="margin-top:14px"></div>';
    MAIN.innerHTML = '<section class="view on">' + h + "</section>";
    function run(text) {
      var rows = parseCSV(text).filter(function (r) { return r.some(function (c) { return c && c.trim(); }); });
      if (rows.length < 2) { $("st-msg").innerHTML = '<span class="bad">No rows found. Export the report as CSV.</span>'; return; }
      var hd = rows[0].map(function (x) { return (x || "").toLowerCase().trim(); });
      function find(ps) { for (var i = 0; i < hd.length; i++) for (var j = 0; j < ps.length; j++) if (hd[i].indexOf(ps[j]) > -1) return i; return -1; }
      var iA = find(["(child) asin", "child asin", "asin"]), iT = find(["title"]), iU = find(["units ordered", "units"]), iS = find(["ordered product sales", "product sales", "sales"]), iSe = find(["sessions - total", "sessions"]), iB = find(["featured offer", "buy box percentage", "buy box"]);
      function n(r, i) { return i < 0 ? 0 : parseFloat(String(r[i] || "").replace(/[^0-9.\-]/g, "")) || 0; }
      var data = rows.slice(1).map(function (r) { return { asin: iA >= 0 ? r[iA] : "", title: iT >= 0 ? r[iT] : "", units: n(r, iU), sales: n(r, iS), sessions: n(r, iSe), bb: n(r, iB) }; }).filter(function (d) { return d.units || d.sales || d.sessions; });
      if (!data.length) { $("st-msg").innerHTML = '<span class="bad">No sales or units columns found. Use the “Detail Page Sales and Traffic” report.</span>'; return; }
      var tu = 0, ts = 0, tse = 0; data.forEach(function (d) { tu += d.units; ts += d.sales; tse += d.sessions; });
      $("st-msg").innerHTML = '<span class="good">✓ ' + data.length + " products</span>";
      data.sort(function (a, b) { return b.sales - a.sales; });
      var weak = data.filter(function (d) { return d.sessions >= 100 && d.units / d.sessions < 0.05; });
      $("st-out").innerHTML = '<div class="kg k4" style="margin-bottom:14px">' + kpi("Products", data.length) + kpi("Units", tu.toLocaleString()) + kpi("Sales", kmoney(ts)) + kpi("Conversion", tse ? (tu / tse * 100).toFixed(1) + "%" : "—", "units / sessions") + '</div><div class="g2"><div class="card"><div class="eb">Top products by sales</div><div style="margin-top:10px">' + hbars(data.slice(0, 10).map(function (d) { return { label: d.title || d.asin, value: d.sales }; }), function (v) { return kmoney(v); }) + '</div></div><div class="card"><div class="eb">Fix first: traffic but low conversion</div>' + (weak.length ? weak.slice(0, 8).map(function (d) { return flag("w", (d.title || d.asin).slice(0, 60), d.sessions + " sessions, " + (d.units / d.sessions * 100).toFixed(1) + "% conversion" + (d.bb ? ", featured offer " + d.bb + "%" : "")); }).join("") : '<p class="note">No product with 100+ sessions converts under 5%.</p>') + "</div></div>" +
        '<div class="tw" style="margin-top:14px"><table class="t"><thead><tr><th>ASIN</th><th>Product</th><th>Units</th><th>Sales</th><th>Sessions</th><th>Conversion</th></tr></thead><tbody>' + data.slice(0, 50).map(function (d) { return '<tr><td class="mono">' + esc(d.asin) + '</td><td class="wrap">' + esc((d.title || "").slice(0, 70)) + "</td><td>" + d.units + "</td><td>" + kmoney(d.sales) + "</td><td>" + (d.sessions || "") + "</td><td>" + (d.sessions ? (d.units / d.sessions * 100).toFixed(1) + "%" : "") + "</td></tr>"; }).join("") + "</tbody></table></div>";
    }
    $("st-file").onchange = function (e) { var f = e.target.files && e.target.files[0]; if (!f) return; var r = new FileReader(); r.onload = function () { run(r.result); }; r.readAsText(f); };
    $("st-go").onclick = function () { run($("st-paste").value); };
  }

  // ================================================================ EXTENSION
  function vExtension() {
    var h = head("Yours", "Chrome extension", "The extension does the heavy reading on Amazon itself: it opens every product page behind a search, so you get real Best Sellers Ranks, sellers, sizes and fees for the whole of page 1 — then hands it all to this page.");
    h += '<div class="g2"><div class="card"><h2 style="font-size:16px">Install (2 minutes)</h2><ol class="small" style="line-height:1.8;padding-left:18px"><li><button class="btn sm" id="ext-dl">Download the extension (.zip)</button> <span id="ext-msg" class="small"></span></li><li>Unzip it to a folder you keep (e.g. Documents/product-pilot-extension).</li><li>In Chrome open <span class="mono">chrome://extensions</span> and switch on <b>Developer mode</b> (top right).</li><li>Click <b>Load unpacked</b> and choose the unzipped folder.</li><li>Pin <b>Product Pilot</b> from the puzzle-piece menu. Open any Amazon search — the <b>X-Ray this page</b> button appears bottom-right.</li></ol><p class="note">Version 2.0. If you installed the old version, remove it first in chrome://extensions.</p></div>' +
      '<div class="card"><h2 style="font-size:16px">What it adds on Amazon</h2><ul class="small" style="line-height:1.7;padding-left:18px"><li><b>X-Ray</b> on every search and Best Sellers page: rank, sales, revenue, fees, sellers, niche score, CSV, page 2–3.</li><li><b>Product card</b> under every product title: BSR, sales, revenue, FBA fee, your net profit, listing grade.</li><li><b>Product panel</b>: profit calculator, price history (CamelCamelCamel, Keepa with your key), reviews, keyword rank check, sourcing.</li><li><b>Studio</b>: product database scans, keyword research from live Amazon suggestions, reverse ASIN, index checker, daily product &amp; keyword-rank trackers with alerts, listing builder.</li><li><b>Copy for Product Pilot</b>: sends any page here with one paste.</li></ul></div></div>';
    MAIN.innerHTML = '<section class="view on">' + h + "</section>";
    $("ext-dl").onclick = function () {
      var b64 = window.PP_EXT_ZIP; if (!b64) { $("ext-msg").textContent = "Package missing."; return; }
      var bin = atob(b64), u8 = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
      if (!CAP.downloads) { $("ext-msg").innerHTML = '<span class="warn">Downloads work when this page is opened in Claude. Ask Claude in chat for the extension zip instead.</span>'; return; }
      saveFile("product-pilot-extension-v2.zip", new Blob([u8], { type: "application/zip" }), $("ext-dl"));
    };
  }

  // ================================================================ FEATURE MAP
  var FM = [
    ["Keepa", "Price history (Amazon, 3rd-party, buy box)", "Product analyzer → History; extension panel (Keepa key)", "full"],
    ["Keepa", "Best Sellers Rank history & rank drops", "Extension panel / Studio tracker with Keepa key; daily tracker without", "full"],
    ["Keepa", "Offer count & seller history", "Extension tracker (daily) · Keepa key for history", "full"],
    ["Keepa", "Monthly sold history", "Extension with Keepa key (Amazon badge history)", "full"],
    ["Keepa", "Price & rank alerts", "Extension tracker desktop alerts", "full"],
    ["Keepa", "Product Finder / Category bestsellers", "Studio → Product research (searches + Best Sellers URLs)", "full"],
    ["Keepa", "Deals feed", "Not included — use Keepa.com/deals", "none"],
    ["Keepa", "Stock tracking (stock levels)", "Availability text only; exact stock counts need cart tricks Amazon blocks", "partial"],
    ["Jungle Scout", "Chrome extension (sales, revenue, fees on search pages)", "Extension X-Ray", "full"],
    ["Jungle Scout", "Product Database", "Studio → Product research with filters + winners preset", "full"],
    ["Jungle Scout", "Opportunity Finder (niche score)", "Search & X-Ray niche score + market analysis + AI verdict", "full"],
    ["Jungle Scout", "Product Tracker", "Extension daily tracker", "full"],
    ["Jungle Scout", "Sales Estimator", "Sales estimator (rank model + Amazon badge)", "estimate"],
    ["Jungle Scout", "Keyword Scout (search volume)", "Keyword lab + Studio keyword research — real Amazon suggestions; volume is an index, not Amazon data", "estimate"],
    ["Jungle Scout", "Listing Builder & grader", "Listing builder + Claude writer; listing grade on every product", "full"],
    ["Jungle Scout", "Supplier Database (customs records)", "Supplier finder links + vetting; import records need a paid customs feed", "partial"],
    ["Jungle Scout", "Review Automation / Sales Analytics / Inventory Manager", "Needs Seller Central API access — My store data reads your Business Report CSV instead", "partial"],
    ["Jungle Scout", "Rank Tracker", "Extension keyword rank tracker (daily)", "full"],
    ["Helium 10", "Xray", "Extension X-Ray + this page's Search & X-Ray", "full"],
    ["Helium 10", "Black Box", "Studio → Product research", "full"],
    ["Helium 10", "Cerebro (reverse ASIN)", "Studio → Reverse ASIN (real positions for up to 4 ASINs)", "full"],
    ["Helium 10", "Magnet (keyword research)", "Studio keyword research (A–Z Amazon suggestions, page-1 demand) + Keyword lab", "full"],
    ["Helium 10", "Frankenstein & Scribbles", "Keyword processor + Listing builder (249-byte backend check)", "full"],
    ["Helium 10", "Listing Analyzer", "Product analyzer → Listing grade, keyword density", "full"],
    ["Helium 10", "Index Checker", "Studio → Reverse ASIN → Index checker", "full"],
    ["Helium 10", "Keyword Tracker", "Extension keyword rank tracker", "full"],
    ["Helium 10", "Profitability Calculator", "Profit calculator (FBA/FBM, VAT, storage, break-even)", "full"],
    ["Helium 10", "Review Insights", "Review intelligence (themes + Claude analysis)", "full"],
    ["Helium 10", "Market Tracker", "Saved niches — re-run the search to compare", "partial"],
    ["Helium 10", "Adtomic (PPC management)", "PPC planner for bids & structure; live campaign management needs Amazon Ads API", "partial"],
    ["Helium 10", "Refund Genie / Inventory Protector / Follow-Up emails", "Need Seller Central API access with your credentials and a server — not possible in a browser tool", "none"]
  ];
  function vMap() {
    var lab = { full: ['<span class="tag fb">Included</span>', 0], estimate: ['<span class="tag sp">Included · estimate</span>', 1], partial: ['<span class="tag">Partly</span>', 2], none: ['<span class="tag am">Not possible here</span>', 3] };
    var cnt = { full: 0, estimate: 0, partial: 0, none: 0 }; FM.forEach(function (f) { cnt[f[3]]++; });
    var h = head("Yours", "Feature map", "Every paid feature of Keepa, Jungle Scout and Helium 10, and where it lives in Product Pilot — including what can't be done without Amazon's seller APIs.");
    h += '<div class="kg k4" style="margin-bottom:14px">' + kpi("Included", cnt.full) + kpi("Included as estimate", cnt.estimate) + kpi("Partly", cnt.partial) + kpi("Not possible here", cnt.none) + "</div>";
    h += '<div class="tw fm"><table class="t"><thead><tr><th>Tool</th><th>Paid feature</th><th>Status</th><th>Where in Product Pilot</th></tr></thead><tbody>' + FM.map(function (f) { return "<tr><td><b>" + f[0] + '</b></td><td class="wrap">' + esc(f[1]) + "</td><td>" + lab[f[3]][0] + '</td><td class="wrap small">' + esc(f[2]) + "</td></tr>"; }).join("") + '</tbody></table></div><p class="note">“Estimate” means the paid tools estimate it too: Amazon publishes neither unit sales nor search volume. Product Pilot shows Amazon\'s own “bought in past month” badge beside every estimate so you can see how close it is.</p>';
    MAIN.innerHTML = '<section class="view on">' + h + "</section>";
  }

  // ---------------------------------------------------------------- example data
  function exampleData() {
    var raw = [
      ["B0EXMPL001", "Grey Velvet Divan Bed Double 4ft6 with 2 Drawers and Headboard", "Example Beds", 249.99, 1523, "Home & Kitchen", 200, 1284, 4.3, "FBA", 3, 42, [190, 135, 30], "12 Jan 2025"],
      ["B0EXMPL002", "Ottoman Storage Bed Frame Double Gas Lift Plush Fabric", "Example Sleep", 329, 4820, "Home & Kitchen", 0, 412, 4.6, "FBM", 1, 55, [200, 140, 35], "3 Mar 2024", true],
      ["B0EXMPL003", "Small Double Divan Bed with Mattress and Headboard 4ft Crushed Velvet", "Example Home", 199, 9950, "Home & Kitchen", 50, 87, 4.1, "FBA", 2, 38, [190, 120, 30], "20 Jun 2026"],
      ["B0EXMPL004", "Double Divan Bed Base Only 4ft6 Black Faux Leather 4 Drawers", "Example Beds", 179.99, 640, "Home & Kitchen", 1000, 2031, 3.9, "AMZ", 1, 35, [190, 135, 28], "1 Feb 2022"],
      ["B0EXMPL005", "King Size Divan Bed Set with Memory Foam Mattress Grey Linen", "Example Nordic", 389, 15400, "Home & Kitchen", 0, 56, 4.5, "FBM", 1, 60, [200, 150, 30], "5 Aug 2026"],
      ["B0EXMPL006", "Single Divan Bed with Storage 3ft Cream Chenille", "Example Home", 139.95, 3100, "Home & Kitchen", 100, 3450, 4.4, "FBA", 4, 28, [190, 90, 30], "9 Sep 2020"],
      ["B0EXMPL007", "Double Divan Bed with Orthopaedic Mattress 4ft6 Sprung", "Example Rest", 289, 2240, "Home & Kitchen", 300, 640, 4.2, "FBA", 2, 48, [190, 135, 32], "14 May 2023"],
      ["B0EXMPL008", "Upholstered Divan Bed with Winged Headboard Super King 6ft", "Example Luxe", 459, 21000, "Home & Kitchen", 0, 33, 4.7, "FBM", 1, 70, [200, 180, 32], "2 Oct 2026"]
    ];
    var items = raw.map(function (r, i) { return { asin: r[0], title: r[1], brand: r[2], price: r[3], bsr: r[4], rankCategory: r[5], bought: r[6], reviews: r[7], rating: r[8], sellerType: r[9], offers: r[10], weightKg: r[11], dims: { l: r[12][0], w: r[12][1], h: r[12][2] }, dateFirstAvailable: r[13], sponsored: !!r[14], position: i + 1, organicPosition: r[14] ? null : i + 1, enriched: true }; });
    var o = 0; items.forEach(function (x) { if (!x.sponsored) x.organicPosition = ++o; });
    return { mkt: "UK", query: "divan bed (example)", kind: "search", source: "example", t: Date.now(), resultCount: 30000, items: items };
  }

  render();
})();
