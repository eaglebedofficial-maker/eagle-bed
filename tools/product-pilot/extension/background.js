/* Product Pilot service worker: cross-origin fetches, daily tracking (Keepa-style history), studio launcher. */
importScripts("engine.js");

var OFFSCREEN = "offscreen.html";

chrome.runtime.onInstalled.addListener(function () {
  scheduleTracking();
  chrome.contextMenus && chrome.contextMenus.create({ id: "pp-open", title: "Open Product Pilot Studio", contexts: ["action"] });
});
chrome.runtime.onStartup && chrome.runtime.onStartup.addListener(scheduleTracking);
chrome.contextMenus && chrome.contextMenus.onClicked.addListener(function (i) { if (i.menuItemId === "pp-open") openStudio(); });

function openStudio(hash) { chrome.tabs.create({ url: chrome.runtime.getURL("studio.html" + (hash ? "#" + hash : "")) }); }

function scheduleTracking() {
  chrome.storage.local.get(["settings"], function (v) {
    var h = (v.settings && +v.settings.trackHours) || 24;
    chrome.alarms.create("pp-track", { periodInMinutes: Math.max(60, h * 60), delayInMinutes: 5 });
  });
}

chrome.runtime.onMessage.addListener(function (msg, sender, reply) {
  if (!msg || !msg.type) return;
  if (msg.type === "fetchText") {
    if (!allowed(msg.url)) { reply({ error: "Host not allowed" }); return; }
    fetch(msg.url, { credentials: "omit" }).then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.text(); })
      .then(function (t) { reply({ data: t }); }, function (e) { reply({ error: e.message }); });
    return true;
  }
  if (msg.type === "imageData") {
    if (!allowed(msg.url)) { reply({ error: "Host not allowed" }); return; }
    fetch(msg.url).then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.blob(); }).then(function (b) {
      return new Promise(function (res, rej) { var fr = new FileReader(); fr.onload = function () { res(fr.result); }; fr.onerror = rej; fr.readAsDataURL(b); });
    }).then(function (d) { reply({ data: d }); }, function (e) { reply({ error: e.message }); });
    return true;
  }
  if (msg.type === "openStudio") { openStudio(msg.hash); reply({ data: true }); return; }
  if (msg.type === "trackNow") { runTracking().then(function (n) { reply({ data: n }); }, function (e) { reply({ error: e.message }); }); return true; }
  if (msg.type === "reschedule") { scheduleTracking(); reply({ data: true }); return; }
});

function allowed(url) {
  try { var h = new URL(url).hostname; return /(^|\.)amazon\.(com|co\.uk|de|fr|it|es|ca)$/.test(h) || /(^|\.)keepa\.com$/.test(h) || /camelcamelcamel\.com$/.test(h) || /media-amazon\.com$/.test(h); } catch (e) { return false; }
}

chrome.alarms.onAlarm.addListener(function (a) { if (a.name === "pp-track") runTracking(); });

// ---- offscreen parsing (service workers have no DOMParser)
function ensureOffscreen() {
  return chrome.offscreen.hasDocument().then(function (has) {
    if (has) return;
    return chrome.offscreen.createDocument({ url: OFFSCREEN, reasons: ["DOM_PARSER"], justification: "Parse Amazon product pages for price and rank tracking" });
  });
}
function parseRemote(kind, mkt, arg) {
  return ensureOffscreen().then(function () {
    return new Promise(function (res, rej) {
      chrome.runtime.sendMessage({ target: "offscreen", kind: kind, mkt: mkt, arg: arg }, function (r) {
        var err = chrome.runtime.lastError; if (err) return rej(new Error(err.message));
        if (!r || r.error) return rej(new Error(r ? r.error : "no response")); res(r.data);
      });
    });
  });
}
function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
function get(keys) { return new Promise(function (r) { chrome.storage.local.get(keys, r); }); }
function set(o) { return new Promise(function (r) { chrome.storage.local.set(o, r); }); }

var running = false;
function runTracking() {
  if (running) return Promise.resolve(0);
  running = true;
  var count = 0;
  return get(["tracked", "ranktrack", "settings", "trackLog"]).then(function (v) {
    var tracked = v.tracked || {}, rt = v.ranktrack || [], settings = v.settings || {}, log = v.trackLog || [];
    var keys = Object.keys(tracked);
    var chain = Promise.resolve();
    keys.forEach(function (k) {
      chain = chain.then(function () {
        var t = tracked[k];
        if (settings.keepaKey && t.useKeepa) return; // Keepa-backed items refresh on demand
        return parseRemote("product", t.mkt, t.asin).then(function (p) {
          var est = PP.estimateSales({ bsr: p.bsr, category: p.category, mkt: t.mkt, bought: p.bought });
          t.history = t.history || [];
          t.history.push({ t: Date.now(), price: p.price || null, bsr: p.bsr || null, reviews: p.reviews || null, rating: p.rating || null, offers: p.offers || null, bought: p.bought || null, sales: est.units || null, sellerType: p.sellerType || "" });
          if (t.history.length > 1500) t.history = t.history.slice(-1500);
          t.title = t.title || p.title; t.image = t.image || p.image; t.category = p.category; t.last = Date.now(); t.error = "";
          count++;
        }, function (e) { t.error = e.message; }).then(function () { return sleep(2500 + Math.random() * 2500); });
      });
    });
    rt.forEach(function (r) {
      chain = chain.then(function () {
        return parseRemote("rank", r.mkt, { asin: r.asin, kw: r.kw }).then(function (res) {
          r.history = r.history || []; r.history.push({ t: Date.now(), organic: res.organic, sponsored: res.sponsored, results: res.resultCount });
          if (r.history.length > 1000) r.history = r.history.slice(-1000);
          r.last = Date.now(); r.error = ""; count++;
        }, function (e) { r.error = e.message; }).then(function () { return sleep(3000 + Math.random() * 3000); });
      });
    });
    return chain.then(function () {
      log.unshift({ t: Date.now(), updated: count, products: keys.length, keywords: rt.length }); log = log.slice(0, 50);
      return set({ tracked: tracked, ranktrack: rt, trackLog: log });
    });
  }).then(function () { running = false; return count; }, function (e) { running = false; throw e; });
}
