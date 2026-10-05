/* Eagle Bed "Design your dream bed" configurator. Draws a parametric SVG bed from the form state. */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var SIZES = {
    single: { w: 250, cm: '90 × 190 cm', label: 'Single (3FT)' },
    small: { w: 320, cm: '120 × 190 cm', label: 'Small Double (4FT)' },
    double: { w: 360, cm: '135 × 190 cm', label: 'Standard Double (4FT6)' },
    king: { w: 400, cm: '150 × 200 cm', label: 'King (5FT)' },
    superking: { w: 470, cm: '180 × 200 cm', label: 'Super-King (6FT)' },
    custom: { w: 430, cm: 'Your measurements', label: 'Custom size' }
  };
  /* top = headboard top (y) at 54" height. Lower y = taller. */
  var STYLES = {
    modern: { top: 150, kind: 'channels' }, minimalist: { top: 210, kind: 'plain' }, traditional: { top: 150, kind: 'arch' },
    chesterfield: { top: 150, kind: 'tuft' }, wingback: { top: 140, kind: 'wing' }, sleigh: { top: 165, kind: 'sleigh' },
    panel: { top: 150, kind: 'panels' }, ottoman: { top: 160, kind: 'channels', storage: 'ottoman' }, storage: { top: 175, kind: 'plain', storage: 'drawers2' },
    tv: { top: 150, kind: 'tv' }, luxury: { top: 105, kind: 'luxury' }
  };
  var MATTRESS = { none: 0, p1000: 38, p2000: 46, p3000: 48, memory: 42, ortho: 40, pillow: 52 };

  function shade(hex, amt) {
    var h = String(hex || '#888888').replace('#', ''); if (h.length === 3) h = h.replace(/./g, '$&$&');
    var n = parseInt(h, 16), r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    function c(v) { return Math.max(0, Math.min(255, Math.round(v * (1 + amt)))); }
    return '#' + ((1 << 24) + (c(r) << 16) + (c(g) << 8) + c(b)).toString(16).slice(1);
  }
  function el(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) if (attrs[k] != null) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e); return e;
  }

  function defs(svg) {
    var d = el('defs', {}, svg);
    var g = el('linearGradient', { id: 'srSheen', x1: '0', y1: '0', x2: '1', y2: '1' }, d);
    el('stop', { offset: '0', 'stop-color': '#fff', 'stop-opacity': '.35' }, g);
    el('stop', { offset: '.45', 'stop-color': '#fff', 'stop-opacity': '0' }, g);
    el('stop', { offset: '1', 'stop-color': '#000', 'stop-opacity': '.18' }, g);
    var p;
    p = el('pattern', { id: 'srLinen', width: 6, height: 6, patternUnits: 'userSpaceOnUse' }, d);
    el('path', { d: 'M0 3h6M3 0v6', stroke: '#fff', 'stroke-opacity': '.16', 'stroke-width': '.8' }, p);
    p = el('pattern', { id: 'srChenille', width: 7, height: 7, patternUnits: 'userSpaceOnUse' }, d);
    el('circle', { cx: 2, cy: 2, r: '.9', fill: '#fff', 'fill-opacity': '.18' }, p); el('circle', { cx: 5.5, cy: 5, r: '.7', fill: '#000', 'fill-opacity': '.12' }, p);
    p = el('pattern', { id: 'srBoucle', width: 11, height: 10, patternUnits: 'userSpaceOnUse' }, d);
    el('circle', { cx: 3, cy: 3, r: 1.6, fill: 'none', stroke: '#fff', 'stroke-opacity': '.16', 'stroke-width': '1' }, p);
    el('circle', { cx: 8.5, cy: 7, r: 1.3, fill: 'none', stroke: '#fff', 'stroke-opacity': '.12', 'stroke-width': '1' }, p);
    el('circle', { cx: 6, cy: 1.5, r: 1, fill: 'none', stroke: '#000', 'stroke-opacity': '.08', 'stroke-width': '.8' }, p);
    p = el('pattern', { id: 'srWoven', width: 6, height: 6, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(35)' }, d);
    el('path', { d: 'M0 0v6', stroke: '#000', 'stroke-opacity': '.12', 'stroke-width': '1.4' }, p);
    p = el('pattern', { id: 'srTuft', width: 34, height: 34, patternUnits: 'userSpaceOnUse' }, d);
    el('path', { d: 'M0 17L17 0L34 17L17 34Z', fill: 'none', stroke: '#000', 'stroke-opacity': '.22', 'stroke-width': '1.2' }, p);
    el('circle', { cx: 17, cy: 0, r: 2.2, fill: '#000', 'fill-opacity': '.35' }, p); el('circle', { cx: 0, cy: 17, r: 2.2, fill: '#000', 'fill-opacity': '.35' }, p);
    el('circle', { cx: 34, cy: 17, r: 2.2, fill: '#000', 'fill-opacity': '.35' }, p); el('circle', { cx: 17, cy: 34, r: 2.2, fill: '#000', 'fill-opacity': '.35' }, p);
    var f = el('filter', { id: 'srBlur', x: '-20%', y: '-50%', width: '140%', height: '200%' }, d);
    el('feGaussianBlur', { stdDeviation: 10 }, f);
  }

  var TEX = { velvet: 'url(#srSheen)', linen: 'url(#srLinen)', chenille: 'url(#srChenille)', boucle: 'url(#srBoucle)', woven: 'url(#srWoven)' };

  /* Draw one upholstered shape: base colour + texture overlay. */
  function up(g, tag, attrs, s, dark) {
    var a = Object.assign({}, attrs, { 'class': dark ? 'fab-d' : 'fab' });
    el(tag, a, g);
    var t = Object.assign({}, attrs, { fill: TEX[s.fabric] || 'none', 'pointer-events': 'none' });
    el(tag, t, g);
    if (s.fabric !== 'velvet' && s.fabric !== 'boucle') el(tag, Object.assign({}, attrs, { fill: 'url(#srSheen)', opacity: '.45', 'pointer-events': 'none' }), g);
  }

  function draw(layer, s) {
    var sz = SIZES[s.size] || SIZES.king, st = STYLES[s.style] || STYLES.modern;
    var W = sz.w, x0 = 400 - W / 2, baseTop = 360, baseH = 70;
    var legs = (s.style === 'modern' || s.style === 'minimalist' || s.style === 'luxury' || s.style === 'traditional' || s.style === 'panel') && s.storage === 'none';
    if (legs) { baseTop = 368; baseH = 46; }
    var top = st.top;
    if (s.head === '24') top = 245; else if (s.head === 'xl') top = st.top - 45;
    var mh = MATTRESS[s.mattress] == null ? 44 : MATTRESS[s.mattress];

    el('ellipse', { cx: 400, cy: 440, rx: W / 2 + 60, ry: 16, fill: '#3a2a20', opacity: '.28', filter: 'url(#srBlur)' }, layer);

    /* headboard */
    var hb = el('g', {}, layer), hx = x0 - 8, hw = W + 16, hy = top, hh = baseTop + 6 - top;
    switch (st.kind) {
      case 'plain': up(hb, 'rect', { x: hx, y: hy, width: hw, height: hh, rx: 10 }, s); break;
      case 'channels':
        up(hb, 'rect', { x: hx, y: hy, width: hw, height: hh, rx: 16 }, s);
        for (var cx = hx + 26; cx < hx + hw - 10; cx += 30) el('path', { d: 'M' + cx + ' ' + (hy + 10) + 'V' + (hy + hh - 6), stroke: '#000', 'stroke-opacity': '.2', 'stroke-width': '2', 'stroke-linecap': 'round' }, hb);
        break;
      case 'panels':
        up(hb, 'rect', { x: hx, y: hy, width: hw, height: hh, rx: 6 }, s);
        var ph = (hh - 20) / 3; for (var i = 0; i < 3; i++) el('rect', { x: hx + 10, y: hy + 8 + i * ph, width: hw - 20, height: ph - 6, rx: 4, fill: 'none', stroke: '#000', 'stroke-opacity': '.18', 'stroke-width': '2' }, hb);
        break;
      case 'arch':
        var ad = 'M' + hx + ' ' + (hy + hh) + 'V' + (hy + 50) + 'Q' + hx + ' ' + (hy + 20) + ' ' + (hx + 40) + ' ' + (hy + 18) + 'Q400 ' + (hy - 26) + ' ' + (hx + hw - 40) + ' ' + (hy + 18) + 'Q' + (hx + hw) + ' ' + (hy + 20) + ' ' + (hx + hw) + ' ' + (hy + 50) + 'V' + (hy + hh) + 'Z';
        up(hb, 'path', { d: ad }, s);
        el('path', { d: ad, fill: 'none', stroke: '#000', 'stroke-opacity': '.25', 'stroke-width': '3' }, hb);
        break;
      case 'tuft':
        up(hb, 'rect', { x: hx, y: hy, width: hw, height: hh, rx: 8 }, s);
        el('rect', { x: hx + 8, y: hy + 8, width: hw - 16, height: hh - 16, rx: 4, fill: 'url(#srTuft)' }, hb);
        el('rect', { x: hx, y: hy, width: hw, height: hh, rx: 8, fill: 'none', stroke: '#000', 'stroke-opacity': '.25', 'stroke-width': '3' }, hb);
        break;
      case 'wing':
        up(hb, 'rect', { x: hx + 18, y: hy, width: hw - 36, height: hh, rx: 14 }, s);
        for (var wx = hx + 46; wx < hx + hw - 40; wx += 32) el('path', { d: 'M' + wx + ' ' + (hy + 12) + 'V' + (hy + hh - 8), stroke: '#000', 'stroke-opacity': '.18', 'stroke-width': '2', 'stroke-linecap': 'round' }, hb);
        break;
      case 'sleigh':
        var sd = 'M' + hx + ' ' + (hy + hh) + 'V' + (hy + 46) + 'Q' + hx + ' ' + (hy + 18) + ' ' + (hx - 18) + ' ' + (hy + 12) + 'Q' + (hx - 26) + ' ' + hy + ' ' + (hx - 8) + ' ' + (hy - 4) + 'Q400 ' + (hy - 18) + ' ' + (hx + hw + 8) + ' ' + (hy - 4) + 'Q' + (hx + hw + 26) + ' ' + hy + ' ' + (hx + hw + 18) + ' ' + (hy + 12) + 'Q' + (hx + hw) + ' ' + (hy + 18) + ' ' + (hx + hw) + ' ' + (hy + 46) + 'V' + (hy + hh) + 'Z';
        up(hb, 'path', { d: sd }, s);
        el('path', { d: 'M' + (hx + 6) + ' ' + (hy + 26) + 'Q400 ' + (hy + 12) + ' ' + (hx + hw - 6) + ' ' + (hy + 26), fill: 'none', stroke: '#000', 'stroke-opacity': '.18', 'stroke-width': '3', 'stroke-linecap': 'round' }, hb);
        break;
      case 'tv':
        up(hb, 'rect', { x: hx, y: hy, width: hw, height: hh, rx: 12 }, s);
        for (var tx = hx + 30; tx < hx + hw - 10; tx += 34) el('path', { d: 'M' + tx + ' ' + (hy + 10) + 'V' + (hy + hh - 6), stroke: '#000', 'stroke-opacity': '.16', 'stroke-width': '2' }, hb);
        break;
      case 'luxury':
        var ld = 'M' + hx + ' ' + (hy + hh) + 'V' + (hy + 70) + 'C' + hx + ' ' + (hy + 20) + ' ' + (hx + 50) + ' ' + hy + ' ' + (hx + 90) + ' ' + hy + 'H' + (hx + hw - 90) + 'C' + (hx + hw - 50) + ' ' + hy + ' ' + (hx + hw) + ' ' + (hy + 20) + ' ' + (hx + hw) + ' ' + (hy + 70) + 'V' + (hy + hh) + 'Z';
        up(hb, 'path', { d: ld }, s);
        el('path', { d: ld, fill: 'none', stroke: '#C9A266', 'stroke-width': '4' }, hb);
        for (var lx = hx + 60; lx < hx + hw - 50; lx += 44) el('circle', { cx: lx, cy: hy + 60, r: 3, fill: '#C9A266' }, hb);
        break;
    }

    /* wings sit in front of the headboard, beside the mattress */
    if (st.kind === 'wing') {
      var wt = top + 40, wb = baseTop + 4;
      up(layer, 'path', { d: 'M' + (x0 - 36) + ' ' + wb + 'V' + (wt + 24) + 'Q' + (x0 - 36) + ' ' + wt + ' ' + (x0 - 12) + ' ' + wt + 'H' + (x0 + 16) + 'V' + wb + 'Z' }, s, true);
      up(layer, 'path', { d: 'M' + (x0 + W + 36) + ' ' + wb + 'V' + (wt + 24) + 'Q' + (x0 + W + 36) + ' ' + wt + ' ' + (x0 + W + 12) + ' ' + wt + 'H' + (x0 + W - 16) + 'V' + wb + 'Z' }, s, true);
    }

    /* base */
    var base = el('g', {}, layer);
    if (s.storage === 'ottoman') el('rect', { x: x0 + 8, y: baseTop - 2, width: W - 16, height: 26, rx: 4, fill: '#2a2328' }, base);
    up(base, 'rect', { x: x0, y: baseTop, width: W, height: baseH, rx: 8 }, s);
    el('rect', { x: x0, y: baseTop + baseH - 8, width: W, height: 8, rx: 4, fill: '#000', opacity: '.14' }, base);
    if (legs) {
      [x0 + 18, x0 + W - 30].forEach(function (lx) { el('rect', { x: lx, y: baseTop + baseH, width: 12, height: 440 - baseTop - baseH, rx: 3, fill: '#3b2f28' }, base); });
    }
    if (s.storage === 'drawers2' || s.storage === 'drawers4') {
      var n = s.storage === 'drawers4' ? 4 : 2, dw = (W - 30 - (n - 1) * 10) / n;
      for (var k = 0; k < n; k++) {
        var dx = x0 + 15 + k * (dw + 10), dg = el('g', { 'class': 'drawer' }, base);
        up(dg, 'rect', { x: dx, y: baseTop + 12, width: dw, height: baseH - 26, rx: 5 }, s, true);
        el('rect', { x: dx + dw / 2 - 16, y: baseTop + baseH / 2 - 7, width: 32, height: 4, rx: 2, fill: '#C9A266' }, dg);
      }
    }
    if (s.storage === 'ottoman') {
      [x0 + 26, x0 + W - 32].forEach(function (sx) { el('rect', { 'class': 'strut', x: sx, y: baseTop - 58, width: 5, height: 60, rx: 2, fill: '#9a9aa0' }, layer); });
    }

    /* lid: mattress + bedding lift together on ottoman */
    var lid = el('g', { 'class': s.storage === 'ottoman' ? 'lid' : '' }, layer);
    if (mh > 0) {
      var my = baseTop - mh + 4;
      el('rect', { x: x0 + 4, y: my, width: W - 8, height: mh, rx: 12, fill: '#F6F2EC', stroke: '#d9cfc2', 'stroke-width': '1.5' }, lid);
      if (s.mattress === 'pillow' || s.mattress === 'p2000') el('rect', { x: x0 + 8, y: my - 6, width: W - 16, height: 16, rx: 8, fill: '#FBF8F3', stroke: '#e0d6ca', 'stroke-width': '1.2' }, lid);
      for (var q = x0 + 34; q < x0 + W - 20; q += 34) el('circle', { cx: q, cy: my + mh / 2, r: 1.6, fill: '#c8bcae' }, lid);
      el('rect', { x: x0 + 4, y: my + mh - 10, width: W - 8, height: 4, fill: s.mattress === 'ortho' ? '#6B2350' : '#cfc3b4', opacity: '.7' }, lid);
      /* pillows + accent cushion in the bed fabric */
      var np = W > 300 ? 2 : 1, pw = (W - 40 - (np - 1) * 14) / np;
      for (var pi = 0; pi < np; pi++) el('rect', { x: x0 + 20 + pi * (pw + 14), y: my - 32, width: pw, height: 36, rx: 15, fill: '#FFFFFF', stroke: '#e3dacf', 'stroke-width': '1.2' }, lid);
      up(lid, 'rect', { x: 400 - Math.min(70, W * 0.18), y: my - 18, width: Math.min(140, W * 0.36), height: 26, rx: 12 }, s, true);
      /* duvet top */
      el('path', { d: 'M' + (x0 + 2) + ' ' + (my + 2) + 'Q400 ' + (my - 6) + ' ' + (x0 + W - 2) + ' ' + (my + 2) + 'V' + (my + mh * 0.55) + 'H' + (x0 + 2) + 'Z', fill: '#FBF9F5', stroke: '#e6ddd1', 'stroke-width': '1' }, lid);
      /* throw draped across the foot */
      el('path', { d: 'M' + (x0 - 2) + ' ' + (my + mh * 0.38) + 'H' + (x0 + W + 2) + 'V' + (my + mh + 16) + 'Q' + (x0 + W * 0.75) + ' ' + (my + mh + 22) + ' 400 ' + (my + mh + 17) + 'Q' + (x0 + W * 0.25) + ' ' + (my + mh + 12) + ' ' + (x0 - 2) + ' ' + (my + mh + 18) + 'Z', fill: '#CDBDA8' }, lid);
      el('path', { d: 'M' + (x0 - 2) + ' ' + (my + mh * 0.38 + 6) + 'H' + (x0 + W + 2), stroke: '#FFFFFF', 'stroke-opacity': '.55', 'stroke-width': '2' }, lid);
    } else {
      el('rect', { x: x0 + 4, y: baseTop - 8, width: W - 8, height: 10, rx: 4, fill: '#d9cfc2' }, lid);
    }

    /* sleigh / tv footboards */
    if (st.kind === 'sleigh') {
      var fy = baseTop + 6;
      up(layer, 'path', { d: 'M' + (x0 - 10) + ' ' + (baseTop + baseH) + 'V' + (fy + 14) + 'Q' + (x0 - 10) + ' ' + fy + ' ' + (x0 - 24) + ' ' + (fy - 4) + 'Q' + (x0 - 16) + ' ' + (fy - 14) + ' ' + x0 + ' ' + (fy - 10) + 'Q400 ' + (fy - 20) + ' ' + (x0 + W) + ' ' + (fy - 10) + 'Q' + (x0 + W + 16) + ' ' + (fy - 14) + ' ' + (x0 + W + 24) + ' ' + (fy - 4) + 'Q' + (x0 + W + 10) + ' ' + fy + ' ' + (x0 + W + 10) + ' ' + (fy + 14) + 'V' + (baseTop + baseH) + 'Z' }, s, true);
    }
    if (st.kind === 'tv') {
      el('rect', { 'class': 'tvlift', x: 400 - W * 0.32, y: baseTop - 12, width: W * 0.64, height: 72, rx: 4, fill: '#111', stroke: '#333', 'stroke-width': '3' }, layer);
      up(layer, 'rect', { x: x0 - 6, y: baseTop - 20, width: W + 12, height: baseH + 20, rx: 10 }, s, true);
    }
  }

  function init(root) {
    if (root.__srCfg) return; root.__srCfg = true;
    var form = root.querySelector('[data-sr-cfg-form]'), svg = root.querySelector('.sr-cfg__svg'), stage = root.querySelector('.sr-cfg__stage');
    if (!form || !svg) return;
    defs(svg);
    var cur = null;
    function state() {
      var fd = new FormData(form), s = {};
      fd.forEach(function (v, k) { s[k] = v; });
      var c = form.querySelector('[name="colour"]:checked');
      s.hex = c ? c.getAttribute('data-hex') : '#8a8d91';
      s.colourName = c ? c.value : '';
      s.throwc = shade(s.hex, 0.35);
      return s;
    }
    function label(name) { var i = form.querySelector('[name="' + name + '"]:checked'); return i ? (i.getAttribute('data-label') || i.value) : ''; }
    var lastKey = '';
    function render(fromStyle) {
      var s = state();
      if (fromStyle && STYLES[s.style] && STYLES[s.style].storage) {
        var forced = form.querySelector('[name="storage"][value="' + STYLES[s.style].storage + '"]');
        if (forced && !forced.checked) { forced.checked = true; s = state(); }
      }
      root.style.setProperty('--fab', s.hex); root.style.setProperty('--fab-d', shade(s.hex, -0.18));
      var key = [s.size, s.style, s.head, s.storage, s.mattress, s.fabric].join('|');
      if (key !== lastKey) {
        lastKey = key;
        var g = document.createElementNS(NS, 'g'); g.setAttribute('class', 'sr-cfg__layer is-entering');
        draw(g, s); svg.appendChild(g);
        var old = cur; cur = g;
        requestAnimationFrame(function () { requestAnimationFrame(function () { g.classList.remove('is-entering'); }); });
        if (old) { old.classList.add('is-leaving'); setTimeout(function () { if (old.parentNode) old.parentNode.removeChild(old); }, 480); }
        root.classList.remove('is-open');
        if (s.storage === 'ottoman' || s.storage.indexOf('drawers') === 0 || s.style === 'tv') setTimeout(function () { root.classList.add('is-open'); setTimeout(function () { root.classList.remove('is-open'); }, 1800); }, 500);
      }
      var liftBtn = root.querySelector('[data-sr-cfg-lift]'); if (liftBtn) liftBtn.hidden = !(s.storage !== 'none' || s.style === 'tv');
      var room = root.querySelector('.sr-cfg__room'); if (room) room.setAttribute('data-room', s.room || 'day');
      if (stage) stage.style.setProperty('--lamp', s.lamp === 'off' ? 0 : (s.room === 'night' ? 1 : 0.55));
      var sz = SIZES[s.size] || SIZES.king;
      var dim = root.querySelector('[data-sr-cfg-dim]'); if (dim) dim.textContent = sz.cm;
      [].forEach.call(form.querySelectorAll('output[data-for]'), function (o) { o.textContent = label(o.getAttribute('data-for')); });
      var tags = root.querySelector('[data-sr-cfg-tags]');
      if (tags) tags.innerHTML = '<span>' + label('style') + '</span><span>' + label('fabric') + '</span>' + (s.storage !== 'none' ? '<span>' + label('storage') + '</span>' : '');
      var parts = [sz.label, label('style') + ' bed', 'in ' + s.colourName + ' ' + label('fabric').toLowerCase(), label('head') + ' headboard', label('storage'), label('mattress')];
      var sum = root.querySelector('[data-sr-cfg-summary]'); if (sum) sum.textContent = parts.filter(Boolean).join(' · ');
      var shop = root.querySelector('[data-sr-cfg-shop]');
      if (shop) { var url = root.getAttribute('data-url-' + s.style) || root.getAttribute('data-url-default'); if (url) shop.setAttribute('href', url); }
      root.__state = { type: label('style'), size: sz.label, colour: s.colourName, material: label('fabric'), headboard: label('head'), storage: label('storage'), mattress: label('mattress'), details: 'Designed in the online configurator: ' + parts.join(' · ') };
    }
    form.addEventListener('change', function (e) { render(e.target.name === 'style'); if (window.srTrack) window.srTrack('configurator_change', { option: e.target.name, value: e.target.value }); });
    var lift = root.querySelector('[data-sr-cfg-lift]');
    if (lift) lift.addEventListener('click', function () { root.classList.toggle('is-open'); });
    var quote = root.querySelector('[data-sr-cfg-quote]');
    if (quote) quote.addEventListener('click', function () {
      try { sessionStorage.setItem('sr-bespoke', JSON.stringify(root.__state || {})); } catch (e) {}
      if (window.srTrack) window.srTrack('configurator_quote', root.__state || {});
    });
    render(false);
  }
  function boot() { [].forEach.call(document.querySelectorAll('[data-sr-cfg]'), init); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  document.addEventListener('shopify:section:load', boot);
})();
