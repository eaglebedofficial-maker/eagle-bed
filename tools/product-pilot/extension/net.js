/* Product Pilot network layer — fetch + parse Amazon pages, autocomplete, Keepa, with caching and throttling. */
(function (root) {
  "use strict";
  var PP = root.PP, NET = {};
  var isExtPage = location.protocol === "chrome-extension:";
  var lastReq = 0, GAP = 450;

  function bg(msg) {
    return new Promise(function (resolve, reject) {
      try {
        chrome.runtime.sendMessage(msg, function (res) {
          var err = chrome.runtime.lastError;
          if (err) return reject(new Error(err.message));
          if (!res) return reject(new Error("No response"));
          if (res.error) return reject(new Error(res.error));
          resolve(res.data);
        });
      } catch (e) { reject(e); }
    });
  }
  NET.bg = bg;

  function throttle() {
    var now = Date.now(), wait = Math.max(0, lastReq + GAP - now);
    lastReq = now + wait;
    return new Promise(function (r) { setTimeout(r, wait + Math.random() * 150); });
  }

  // Fetch text. Same-origin (content script on that Amazon host) or extension page → direct; else via background.
  NET.text = function (url, opts) {
    opts = opts || {};
    var sameOrigin = false;
    try { sameOrigin = new URL(url, location.href).origin === location.origin; } catch (e) { }
    var p = (opts.noThrottle ? Promise.resolve() : throttle()).then(function () {
      if (isExtPage || sameOrigin || typeof chrome === "undefined" || !chrome.runtime || !chrome.runtime.sendMessage) {
        return fetch(url, { credentials: sameOrigin ? "include" : "omit", headers: opts.headers || {} }).then(function (r) {
          if (!r.ok) throw new Error("HTTP " + r.status);
          return r.text();
        });
      }
      return bg({ type: "fetchText", url: url });
    });
    return p;
  };
  NET.doc = function (url) {
    return NET.text(url).then(function (html) {
      var d = new DOMParser().parseFromString(html, "text/html");
      if (PP.isCaptcha(d)) { var e = new Error("Amazon showed a robot check (captcha). Open amazon in a tab, solve it, then retry."); e.captcha = true; throw e; }
      return d;
    });
  };

  // storage helpers (chrome.storage.local, fallback localStorage)
  var hasChrome = typeof chrome !== "undefined" && chrome.storage && chrome.storage.local;
  NET.get = function (keys) {
    if (hasChrome) return new Promise(function (r) { chrome.storage.local.get(keys, function (v) { r(v || {}); }); });
    var o = {}; [].concat(keys).forEach(function (k) { try { var v = localStorage.getItem("pp:" + k); if (v != null) o[k] = JSON.parse(v); } catch (e) { } }); return Promise.resolve(o);
  };
  NET.set = function (obj) {
    if (hasChrome) return new Promise(function (r) { chrome.storage.local.set(obj, r); });
    Object.keys(obj).forEach(function (k) { try { localStorage.setItem("pp:" + k, JSON.stringify(obj[k])); } catch (e) { } }); return Promise.resolve();
  };
  NET.remove = function (keys) { if (hasChrome) return new Promise(function (r) { chrome.storage.local.remove(keys, r); }); [].concat(keys).forEach(function (k) { localStorage.removeItem("pp:" + k); }); return Promise.resolve(); };
  NET.settings = function () {
    return NET.get(["settings"]).then(function (v) {
      var s = v.settings || {};
      return Object.assign({ market: "UK", costPct: 25, acos: 12, returns: 3, keepaKey: "", trackHours: 24, autoXray: false, autoCard: true, theme: "auto", vatRegistered: false }, s);
    });
  };
  NET.saveSettings = function (s) { return NET.set({ settings: s }); };

  // Product detail page (cached 12h)
  NET.product = function (mkt, asin, opts) {
    opts = opts || {};
    var key = "pc:" + mkt + ":" + asin, TTL = 12 * 3600 * 1000;
    return NET.get([key]).then(function (v) {
      var c = v[key];
      if (c && !opts.fresh && Date.now() - c.t < TTL) return c.p;
      var url = "https://" + PP.MARKETS[mkt].host + "/dp/" + asin + "?th=1&psc=1";
      return NET.doc(url).then(function (d) {
        var p = PP.parseProduct(d, mkt, url);
        if (!p.asin) p.asin = asin;
        delete p.details; // keep cache small
        p.fetchedAt = Date.now();
        var o = {}; o[key] = { t: Date.now(), p: p };
        return NET.set(o).then(function () { return p; });
      });
    });
  };
  // Search results page
  NET.search = function (mkt, q, page) {
    var url = "https://" + PP.MARKETS[mkt].host + "/s?k=" + encodeURIComponent(q) + (page > 1 ? "&page=" + page : "");
    return NET.doc(url).then(function (d) { var r = PP.parseSearch(d, mkt); r.url = url; return r; });
  };
  NET.bestsellers = function (url) { return NET.doc(url).then(function (d) { return PP.parseBestsellers(d); }); };

  // Amazon autocomplete (real Amazon search suggestions)
  NET.suggest = function (mkt, prefix) {
    var m = PP.MARKETS[mkt];
    var url = "https://" + m.completion + "/api/2017/suggest?limit=11&prefix=" + encodeURIComponent(prefix) + "&suggestion-type=KEYWORD&page-type=Search&alias=aps&site-variant=desktop&version=3&event=onkeypress&wc=&lop=" + m.lang + "&last-prefix=&avg-ks-time=0&fb=1&session-id=&request-id=&mid=" + m.mid + "&plain-mid=1&client-info=amazon-search-ui";
    return NET.text(url, { noThrottle: true }).then(function (t) {
      var j = JSON.parse(t); return (j.suggestions || []).map(function (s) { return s.value; }).filter(Boolean);
    });
  };
  // Alphabet-soup expansion (Magnet-style). Returns [{kw, depth, rank}]
  NET.expand = function (mkt, seed, opts, onProgress) {
    opts = opts || {};
    var prefixes = [seed, seed + " "];
    "abcdefghijklmnopqrstuvwxyz".split("").forEach(function (c) { prefixes.push(seed + " " + c); });
    if (opts.deep) "abcdefghijklmnopqrstuvwxyz".split("").forEach(function (c) { prefixes.push(c + " " + seed); });
    if (opts.deep) ["best ", "for ", "with ", "without ", "under ", "kids ", "large ", "small "].forEach(function (w) { prefixes.push(seed + " " + w); });
    var out = {}, order = 0;
    return root.PPUI.pool(prefixes, 4, function (pf, i) {
      return NET.suggest(mkt, pf).then(function (list) {
        list.forEach(function (kw, rank) { kw = kw.toLowerCase().trim(); if (!out[kw]) out[kw] = { kw: kw, from: pf, rank: rank + 1, hits: 0, order: order++ }; out[kw].hits++; });
      });
    }, onProgress).then(function () { return Object.keys(out).map(function (k) { return out[k]; }); });
  };

  // Keepa API (needs the user's own key; token cost ≈1–2 per product)
  NET.keepaProduct = function (key, mkt, asins) {
    var url = "https://api.keepa.com/product?key=" + encodeURIComponent(key) + "&domain=" + PP.MARKETS[mkt].keepa + "&asin=" + [].concat(asins).join(",") + "&stats=180&history=1&rating=1&buybox=1&days=365";
    return NET.text(url, { noThrottle: true }).then(function (t) {
      var j = JSON.parse(t);
      if (j.error) throw new Error("Keepa: " + (j.error.message || j.error.type));
      return { products: (j.products || []).map(function (p) { return PP.fromKeepa(p, mkt); }), tokensLeft: j.tokensLeft, refillIn: j.refillIn };
    });
  };
  NET.keepaTokens = function (key) { return NET.text("https://api.keepa.com/token?key=" + encodeURIComponent(key), { noThrottle: true }).then(function (t) { return JSON.parse(t); }); };
  NET.camelChart = function (mkt, asin) { return bg({ type: "imageData", url: PP.urls(mkt, asin).camelChart }); };

  // Organic + sponsored position of an ASIN for a keyword (pages 1..maxPages)
  NET.rankOf = function (mkt, asin, kw, maxPages) {
    maxPages = maxPages || 2;
    var result = { kw: kw, organic: null, sponsored: null, page: null, resultCount: null, checkedAt: Date.now() };
    var page = 1, offset = 0;
    function step() {
      return NET.search(mkt, kw, page).then(function (r) {
        if (page === 1) result.resultCount = r.resultCount;
        var orgOffset = offset;
        r.items.forEach(function (it) {
          if (it.asin === asin) {
            if (it.sponsored && result.sponsored == null) result.sponsored = (page - 1) * 100 + it.position;
            if (!it.sponsored && result.organic == null) { result.organic = orgOffset + it.organicPosition; result.page = page; }
          }
        });
        offset += r.items.filter(function (x) { return !x.sponsored; }).length;
        if (result.organic == null && page < maxPages && r.items.length) { page++; return step(); }
        result.competitors = r.items.filter(function (x) { return !x.sponsored; }).slice(0, 10).map(function (x) { return x.asin; });
        return result;
      });
    }
    return step();
  };

  // Full X-Ray enrichment for search items: fetch product pages, merge, enrich.
  NET.enrichItems = function (mkt, items, settings, onProgress, shouldStop) {
    var captcha = false;
    return root.PPUI.pool(items, 3, function (it) {
      if (captcha || (shouldStop && shouldStop())) return "STOP";
      return NET.product(mkt, it.asin).then(function (p) {
        it.bsr = p.bsr; it.rankCategory = p.rankCategory; it.subRanks = p.subRanks; it.category = p.category;
        it.brand = it.brand || p.brand; it.sellerType = p.sellerType; it.offers = p.offers; it.weightKg = p.weightKg; it.dims = p.dims;
        it.variations = p.variations; it.images = p.images; it.video = p.video; it.aplus = p.aplus; it.dateFirstAvailable = p.dateFirstAvailable;
        if (!it.price && p.price) it.price = p.price; if (!it.rating && p.rating) it.rating = p.rating; if (!it.reviews && p.reviews) it.reviews = p.reviews;
        if (!it.bought && p.bought) it.bought = p.bought; it.parentAsin = p.parentAsin; it.enriched = true;
        PP.enrich(it, mkt, { costPct: settings.costPct, acos: settings.acos });
      }, function (e) { if (e && e.captcha) { captcha = true; it.error = "captcha"; return "STOP"; } it.error = e ? e.message : "failed"; PP.enrich(it, mkt, settings); });
    }, onProgress).then(function () { return { captcha: captcha }; });
  };

  root.PPNET = NET;
})(typeof globalThis !== "undefined" ? globalThis : this);
