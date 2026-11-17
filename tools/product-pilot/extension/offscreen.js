/* Offscreen document: fetch + DOM-parse Amazon pages for the background tracker. */
chrome.runtime.onMessage.addListener(function (msg, sender, reply) {
  if (!msg || msg.target !== "offscreen") return;
  var NET = PPNET, PP = globalThis.PP;
  var job;
  if (msg.kind === "product") {
    var url = "https://" + PP.MARKETS[msg.mkt].host + "/dp/" + msg.arg + "?th=1&psc=1";
    job = NET.doc(url).then(function (d) { var p = PP.parseProduct(d, msg.mkt, url); delete p.details; return p; });
  } else if (msg.kind === "rank") {
    job = NET.rankOf(msg.mkt, msg.arg.asin, msg.arg.kw, 3);
  } else job = Promise.reject(new Error("unknown job"));
  job.then(function (d) { reply({ data: d }); }, function (e) { reply({ error: e.message }); });
  return true;
});
