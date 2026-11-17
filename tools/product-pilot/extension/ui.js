/* Product Pilot UI kit — shared CSS, DOM helpers and SVG charts for the panel and the Studio. */
(function (root) {
  "use strict";
  var UI = {};
  UI.CSS = [
    ":host,.pp{--bg:#f4f6f8;--sf:#fff;--sf2:#eef1f5;--ln:#dfe4ea;--fg:#16202b;--mu:#5e6b7a;--fa:#8995a3;--ac:#0f7a6b;--aci:#0b5a4f;--acs:#d8efe9;--gd:#1a8f5e;--gdb:#e4f5ec;--wn:#b4791b;--wnb:#fbf0dc;--bd:#c0462f;--bdb:#fae4df;--c1:#0f7a6b;--c2:#3b6fd8;--c3:#c0462f;--c4:#b4791b;--c5:#7b4fc9}",
    ".pp.dark,:host(.dark) .pp{--bg:#0e141b;--sf:#161f29;--sf2:#1d2833;--ln:#2a3744;--fg:#e6edf3;--mu:#9bacbd;--fa:#6f8092;--ac:#2cc2a8;--aci:#8ff0df;--acs:#17352e;--gd:#3ad492;--gdb:#132a20;--wn:#e0a94a;--wnb:#2b2213;--bd:#f0735a;--bdb:#2d1813;--c1:#2cc2a8;--c2:#7fa6ff;--c3:#f0735a;--c4:#e0a94a;--c5:#b69bff}",
    ".pp{font:13px/1.45 -apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Roboto,sans-serif;color:var(--fg);-webkit-font-smoothing:antialiased;box-sizing:border-box}",
    ".pp *{box-sizing:border-box}.pp a{color:var(--ac);text-decoration:none}.pp a:hover{text-decoration:underline}",
    ".pp h1,.pp h2,.pp h3{margin:0;line-height:1.2;font-weight:700}.pp h2{font-size:15px}.pp h3{font-size:13px}",
    ".pp .card{background:var(--sf);border:1px solid var(--ln);border-radius:12px;padding:14px}",
    ".pp .row{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.pp .grow{flex:1;min-width:0}",
    ".pp .grid{display:grid;gap:10px}.pp .g2{grid-template-columns:repeat(2,minmax(0,1fr))}.pp .g3{grid-template-columns:repeat(3,minmax(0,1fr))}.pp .g4{grid-template-columns:repeat(4,minmax(0,1fr))}.pp .g6{grid-template-columns:repeat(6,minmax(0,1fr))}",
    "@media(max-width:900px){.pp .g4,.pp .g6{grid-template-columns:repeat(2,minmax(0,1fr))}.pp .g3{grid-template-columns:1fr}}",
    ".pp .eb{font-size:10.5px;text-transform:uppercase;letter-spacing:.07em;color:var(--fa);font-weight:700}",
    ".pp .muted{color:var(--mu)}.pp .faint{color:var(--fa)}.pp .small{font-size:11.5px}.pp .good{color:var(--gd)}.pp .warn{color:var(--wn)}.pp .bad{color:var(--bd)}",
    ".pp .kpi{background:var(--sf2);border:1px solid var(--ln);border-radius:10px;padding:9px 11px;min-width:0}",
    ".pp .kpi .l{font-size:10px;text-transform:uppercase;letter-spacing:.05em;color:var(--fa);font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
    ".pp .kpi .n{font-size:18px;font-weight:700;margin-top:2px;font-variant-numeric:tabular-nums;white-space:nowrap}.pp .kpi .s{font-size:10.5px;color:var(--mu)}",
    ".pp .btn{border:0;background:var(--ac);color:#fff;font:inherit;font-weight:700;font-size:12px;padding:7px 12px;border-radius:8px;cursor:pointer;white-space:nowrap}",
    ".pp .btn:hover{background:var(--aci)}.pp .btn:disabled{opacity:.55;cursor:default}",
    ".pp .btn.gh{background:var(--sf2);color:var(--fg);border:1px solid var(--ln)}.pp .btn.gh:hover{background:var(--ln)}.pp .btn.sm{padding:4px 8px;font-size:11px}",
    ".pp input,.pp select,.pp textarea{font:inherit;color:var(--fg);background:var(--sf2);border:1px solid var(--ln);border-radius:8px;padding:6px 9px;outline:none;min-width:0}",
    ".pp input:focus,.pp select:focus,.pp textarea:focus{border-color:var(--ac)}.pp textarea{width:100%;resize:vertical;min-height:80px}",
    ".pp label.f{display:flex;flex-direction:column;gap:3px;font-size:11px;font-weight:600;color:var(--mu)}",
    ".pp .tabs{display:flex;gap:2px;border-bottom:1px solid var(--ln);overflow-x:auto;scrollbar-width:none}",
    ".pp .tab{border:0;background:transparent;color:var(--mu);font:inherit;font-weight:600;padding:8px 12px;cursor:pointer;border-bottom:2px solid transparent;white-space:nowrap}",
    ".pp .tab[aria-selected=true]{color:var(--ac);border-bottom-color:var(--ac)}",
    ".pp .tw{overflow:auto;border:1px solid var(--ln);border-radius:10px;background:var(--sf)}",
    ".pp table.t{border-collapse:collapse;width:100%;font-size:12px}",
    ".pp table.t th{position:sticky;top:0;background:var(--sf2);z-index:1;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:.04em;color:var(--fa);padding:7px 8px;border-bottom:1px solid var(--ln);cursor:pointer;white-space:nowrap;user-select:none}",
    ".pp table.t td{padding:6px 8px;border-bottom:1px solid var(--ln);white-space:nowrap;font-variant-numeric:tabular-nums;vertical-align:middle}",
    ".pp table.t tr:hover td{background:var(--sf2)}.pp table.t td.wrap{white-space:normal;min-width:220px;max-width:340px}",
    ".pp .pill{display:inline-block;min-width:28px;text-align:center;font-weight:800;color:#fff;border-radius:6px;padding:1px 6px;font-size:11px}",
    ".pp .tag{display:inline-block;font-size:10px;font-weight:700;padding:1px 6px;border-radius:999px;background:var(--sf2);color:var(--mu);border:1px solid var(--ln);margin-right:3px}",
    ".pp .tag.sp{background:var(--wnb);color:var(--wn);border-color:transparent}.pp .tag.am{background:var(--bdb);color:var(--bd);border-color:transparent}.pp .tag.fb{background:var(--gdb);color:var(--gd);border-color:transparent}",
    ".pp .dot{display:inline-block;width:7px;height:7px;border-radius:50%;margin-right:4px;vertical-align:middle}",
    ".pp .chip{display:inline-flex;gap:5px;align-items:center;background:var(--sf2);border:1px solid var(--ln);border-radius:999px;padding:3px 9px;font-size:11.5px;margin:0 5px 5px 0;cursor:default}.pp .chip b{color:var(--ac)}",
    ".pp .flag{display:flex;gap:8px;padding:8px 10px;border-radius:9px;font-size:12px;margin-bottom:6px}.pp .flag.g{background:var(--gdb)}.pp .flag.w{background:var(--wnb)}.pp .flag.b{background:var(--bdb)}",
    ".pp .flag b{display:block}.pp .flag .i{font-weight:800}.pp .flag.g .i{color:var(--gd)}.pp .flag.w .i{color:var(--wn)}.pp .flag.b .i{color:var(--bd)}",
    ".pp .bar{height:6px;background:var(--sf2);border-radius:4px;overflow:hidden}.pp .bar i{display:block;height:100%;background:var(--ac);border-radius:4px}",
    ".pp .note{font-size:11px;color:var(--fa);line-height:1.5}",
    ".pp .thumb{width:38px;height:38px;object-fit:contain;background:#fff;border-radius:6px;border:1px solid var(--ln)}",
    ".pp svg{display:block;width:100%;height:auto;overflow:visible}.pp svg text{fill:var(--fa);font-size:10px;font-family:inherit}",
    ".pp .dial{width:64px;height:64px;border-radius:50%;display:grid;place-items:center;position:relative;flex:none}",
    ".pp .dial::before{content:'';position:absolute;inset:6px;border-radius:50%;background:var(--sf)}.pp .dial b{position:relative;font-size:19px}",
    ".pp .spin{display:inline-block;width:12px;height:12px;border:2px solid var(--ln);border-top-color:var(--ac);border-radius:50%;animation:ppspin .8s linear infinite;vertical-align:middle}",
    "@keyframes ppspin{to{transform:rotate(360deg)}}",
    ".pp .hide{display:none!important}"
  ].join("\n");

  UI.esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  UI.scoreColor = function (s) { return s >= 70 ? "var(--gd)" : s >= 50 ? "var(--wn)" : "var(--bd)"; };
  UI.pill = function (s) { return '<span class="pill" style="background:' + UI.scoreColor(s) + '">' + Math.round(s) + "</span>"; };
  UI.dial = function (s, label) { var c = UI.scoreColor(s); return '<div class="dial" style="background:conic-gradient(' + c + " " + s + '%,var(--sf2) 0)"><b style="color:' + c + '">' + Math.round(s) + "</b></div>"; };
  UI.kpi = function (l, n, s, cls) { return '<div class="kpi"><div class="l">' + l + '</div><div class="n ' + (cls || "") + '">' + n + '</div>' + (s ? '<div class="s">' + s + "</div>" : "") + "</div>"; };
  UI.flag = function (lvl, title, text) { return '<div class="flag ' + lvl + '"><span class="i">' + (lvl === "g" ? "✓" : lvl === "w" ? "!" : "✕") + '</span><div><b>' + UI.esc(title) + '</b><span class="muted">' + UI.esc(text) + "</span></div></div>"; };
  UI.date = function (t) { var d = new Date(t); return d.toISOString().slice(0, 10); };

  // Line chart. series: [{name,color,points:[{t,v}]}]. opts: {h, invert, fmt, step}
  UI.lineChart = function (series, opts) {
    opts = opts || {};
    var W = 640, H = opts.h || 200, pl = 52, pr = 12, pt = 12, pb = 26, iw = W - pl - pr, ih = H - pt - pb;
    var pts = []; series.forEach(function (s) { s.points.forEach(function (p) { if (p.v != null && isFinite(p.v)) pts.push(p); }); });
    if (pts.length < 2) return '<div class="note" style="padding:18px;text-align:center">Not enough history yet.</div>';
    var t0 = Math.min.apply(null, pts.map(function (p) { return p.t; })), t1 = Math.max.apply(null, pts.map(function (p) { return p.t; }));
    var v0 = Math.min.apply(null, pts.map(function (p) { return p.v; })), v1 = Math.max.apply(null, pts.map(function (p) { return p.v; }));
    if (v0 === v1) { v0 = v0 * 0.9; v1 = v1 * 1.1 + 1; }
    var pad = (v1 - v0) * 0.08; v0 = Math.max(0, v0 - pad); v1 += pad; if (t0 === t1) t1 = t0 + 1;
    function X(t) { return pl + (t - t0) / (t1 - t0) * iw; }
    function Y(v) { var f = (v - v0) / (v1 - v0); return opts.invert ? pt + f * ih : pt + ih - f * ih; }
    var fmt = opts.fmt || function (v) { return v >= 1000 ? (v / 1000).toFixed(v >= 10000 ? 0 : 1) + "k" : (Math.round(v * 100) / 100).toString(); };
    var g = "";
    for (var i = 0; i <= 4; i++) { var v = v0 + (v1 - v0) * i / 4, y = Y(v); g += '<line x1="' + pl + '" x2="' + (W - pr) + '" y1="' + y.toFixed(1) + '" y2="' + y.toFixed(1) + '" stroke="var(--ln)"/><text x="' + (pl - 6) + '" y="' + (y + 3).toFixed(1) + '" text-anchor="end">' + fmt(v) + "</text>"; }
    for (i = 0; i <= 4; i++) { var t = t0 + (t1 - t0) * i / 4; g += '<text x="' + X(t).toFixed(1) + '" y="' + (H - 7) + '" text-anchor="middle">' + new Date(t).toISOString().slice(2, 10) + "</text>"; }
    series.forEach(function (s) {
      var d = "", started = false, last = null;
      s.points.forEach(function (p) {
        if (p.v == null || !isFinite(p.v)) { started = false; return; }
        var x = X(p.t), y = Y(p.v);
        if (opts.step && started && last != null) d += "L" + x.toFixed(1) + " " + last.toFixed(1) + " ";
        d += (started ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1) + " "; started = true; last = y;
      });
      if (opts.step && last != null) d += "L" + X(t1).toFixed(1) + " " + last.toFixed(1);
      g += '<path d="' + d + '" fill="none" stroke="' + s.color + '" stroke-width="1.8" stroke-linejoin="round"/>';
    });
    var leg = series.length > 1 ? '<div class="row small" style="margin-top:4px">' + series.map(function (s) { return '<span><span class="dot" style="background:' + s.color + '"></span>' + UI.esc(s.name) + "</span>"; }).join("") + "</div>" : "";
    return '<svg viewBox="0 0 ' + W + " " + H + '" role="img">' + g + "</svg>" + leg;
  };
  // Horizontal bars: [{label,value,color}]
  UI.hbars = function (rows, fmt) {
    var mx = Math.max.apply(null, rows.map(function (r) { return r.value || 0; }).concat([1]));
    return rows.map(function (r) {
      return '<div class="row" style="flex-wrap:nowrap;margin-bottom:5px"><span class="small muted" style="width:150px;flex:none;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="' + UI.esc(r.label) + '">' + UI.esc(r.label) + '</span><div class="bar grow"><i style="width:' + (r.value / mx * 100).toFixed(1) + "%;background:" + (r.color || "var(--ac)") + '"></i></div><span class="small" style="width:64px;text-align:right;flex:none">' + (fmt ? fmt(r.value) : r.value) + "</span></div>";
    }).join("");
  };
  // Sparkline
  UI.spark = function (vals, invert) {
    vals = vals.filter(function (v) { return v != null && isFinite(v); });
    if (vals.length < 2) return "";
    var mn = Math.min.apply(null, vals), mx = Math.max.apply(null, vals); if (mn === mx) mx = mn + 1;
    var d = vals.map(function (v, i) { var x = i / (vals.length - 1) * 80, f = (v - mn) / (mx - mn), y = invert ? 2 + f * 18 : 20 - f * 18; return (i ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1); }).join(" ");
    return '<svg viewBox="0 0 80 22" style="width:80px;height:22px"><path d="' + d + '" fill="none" stroke="var(--ac)" stroke-width="1.5"/></svg>';
  };
  // Sortable table. cols: [{key,label,render(row),sort(row)}]; returns html, binds via UI.bindSort
  UI.table = function (id, cols, rows, sort) {
    sort = sort || {};
    var h = '<table class="t" id="' + id + '"><thead><tr>' + cols.map(function (c) { return '<th data-k="' + c.key + '">' + c.label + (sort.key === c.key ? (sort.dir > 0 ? " ▲" : " ▼") : "") + "</th>"; }).join("") + "</tr></thead><tbody>";
    h += rows.map(function (r, i) { return '<tr data-i="' + i + '">' + cols.map(function (c) { var v = c.render ? c.render(r, i) : UI.esc(r[c.key]); return "<td" + (c.wrap ? ' class="wrap"' : "") + ">" + (v == null || v === "" ? '<span class="faint">—</span>' : v) + "</td>"; }).join("") + "</tr>"; }).join("");
    return h + "</tbody></table>";
  };
  UI.sortRows = function (rows, cols, sort) {
    if (!sort || !sort.key) return rows;
    var c = cols.filter(function (x) { return x.key === sort.key; })[0]; if (!c) return rows;
    var f = c.sort || function (r) { return r[c.key]; };
    return rows.slice().sort(function (a, b) { var x = f(a), y = f(b); if (x == null || x === "" || (typeof x === "number" && !isFinite(x))) return 1; if (y == null || y === "" || (typeof y === "number" && !isFinite(y))) return -1; return (typeof x === "string" ? x.localeCompare(y) : x - y) * sort.dir; });
  };
  UI.download = function (filename, text, mime) {
    var blob = new Blob([text], { type: mime || "text/csv;charset=utf-8" });
    var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = filename; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 2000);
  };
  UI.copy = function (text) {
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text);
    var t = document.createElement("textarea"); t.value = text; document.body.appendChild(t); t.select(); try { document.execCommand("copy"); } catch (e) { } t.remove(); return Promise.resolve();
  };
  // Simple concurrency pool
  UI.pool = function (items, n, fn, onEach) {
    var i = 0, done = 0, stopped = false;
    return new Promise(function (resolve) {
      if (!items.length) return resolve();
      function next() {
        if (stopped) return;
        if (i >= items.length) { if (done >= items.length) resolve(); return; }
        var idx = i++;
        Promise.resolve().then(function () { return fn(items[idx], idx); }).then(function (r) { if (r === "STOP") { stopped = true; resolve(); return; } done++; if (onEach) onEach(done, items.length); next(); }, function () { done++; if (onEach) onEach(done, items.length); next(); });
      }
      for (var k = 0; k < Math.min(n, items.length); k++) next();
    });
  };
  UI.sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  root.PPUI = UI;
})(typeof globalThis !== "undefined" ? globalThis : this);
