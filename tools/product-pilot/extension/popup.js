(function () {
  var $ = function (id) { return document.getElementById(id); };
  chrome.storage.local.get(["settings"], function (v) { if (v.settings && v.settings.market) $("mkt").value = v.settings.market; });
  function go() {
    var q = $("q").value.trim(), m = $("mkt").value; if (!q) return;
    var asin = PP.extractAsin(q), host = PP.MARKETS[m].host;
    chrome.storage.local.get(["settings"], function (v) { var s = v.settings || {}; s.market = m; chrome.storage.local.set({ settings: s }); });
    chrome.tabs.create({ url: asin && (q.length <= 12 || /amazon\./.test(q)) ? "https://" + host + "/dp/" + asin : "https://" + host + "/s?k=" + encodeURIComponent(q) + "&pp=1" });
  }
  $("go").onclick = go; $("q").onkeydown = function (e) { if (e.key === "Enter") go(); };
  function active(cb) { chrome.tabs.query({ active: true, currentWindow: true }, function (t) { cb(t[0]); }); }
  $("here").onclick = function () { active(function (t) { chrome.tabs.sendMessage(t.id, { type: "pp-open" }, function () { if (chrome.runtime.lastError) $("msg").textContent = "Open an Amazon search, best-seller or product page first."; else window.close(); }); }); };
  $("copy").onclick = function () { active(function (t) { chrome.tabs.sendMessage(t.id, { type: "pp-export" }, function (r) { if (chrome.runtime.lastError || !r) { $("msg").textContent = "Open an Amazon search or product page first."; return; } navigator.clipboard.writeText(r.data).then(function () { $("msg").textContent = "Copied ✓ — paste it into Product Pilot → Import."; }); }); }); };
  Array.prototype.forEach.call(document.querySelectorAll("[data-s]"), function (b) { b.onclick = function () { chrome.tabs.create({ url: chrome.runtime.getURL("studio.html#" + b.getAttribute("data-s")) }); }; });
})();
