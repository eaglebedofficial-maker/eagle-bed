/* Eagle Bed showroom runtime: reveal, parallax, tilt, rails, process story, wishlist, lightbox, analytics. No dependencies. */
(function () {
  'use strict';
  var d = document, w = window;
  var reduce = w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = w.matchMedia && w.matchMedia('(hover: hover) and (pointer: fine)').matches;
  d.documentElement.classList.add('sr-js');
  d.documentElement.classList.remove('sr-nojs');

  /* ---------- analytics: dataLayer + Shopify customer events ---------- */
  w.dataLayer = w.dataLayer || [];
  var track = w.srTrack = function (event, data) {
    data = data || {};
    try { w.dataLayer.push(Object.assign({ event: event }, data)); } catch (e) {}
    try { if (w.Shopify && Shopify.analytics && Shopify.analytics.publish) Shopify.analytics.publish('sr_' + event, data); } catch (e) {}
  };
  d.addEventListener('click', function (e) {
    var t = e.target.closest('[data-sr-track]');
    if (t) track(t.getAttribute('data-sr-track') || 'cta_click', { label: (t.getAttribute('data-sr-label') || t.textContent || '').trim().slice(0, 80), href: t.getAttribute('href') || '' });
  });
  d.addEventListener('submit', function (e) {
    var f = e.target;
    var act = (f.getAttribute('action') || '');
    if (act.indexOf('/cart/add') > -1) {
      var id = f.querySelector('[name="id"]');
      track('add_to_cart_click', { variant_id: id ? id.value : '' });
    } else if (act.indexOf('/search') > -1) {
      var q = f.querySelector('[name="q"]');
      track('search', { search_term: q ? q.value : '' });
    }
  }, true);
  var pageType = d.body && d.body.getAttribute('data-sr-template');
  if (pageType === 'collection') track('category_view', { collection: d.body.getAttribute('data-sr-handle') || '' });

  /* ---------- reveal ---------- */
  function onIn(els, cb, opts) {
    if (!('IntersectionObserver' in w) || reduce) { [].forEach.call(els, function (el) { cb(el); }); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { cb(en.target); io.unobserve(en.target); } });
    }, opts || { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    [].forEach.call(els, function (el) { io.observe(el); });
  }
  function initReveal(root) {
    var groups = (root || d).querySelectorAll('[data-sr-stagger]');
    [].forEach.call(groups, function (g) {
      [].forEach.call(g.querySelectorAll('[data-sr-reveal]'), function (el, i) { el.style.setProperty('--sr-i', i % 8); });
    });
    onIn((root || d).querySelectorAll('[data-sr-reveal]:not(.is-in)'), function (el) { el.classList.add('is-in'); });
  }
  w.srReveal = initReveal;

  /* ---------- rAF helper ---------- */
  function raf(fn) { var busy = false; return function () { var a = arguments; if (busy) return; busy = true; requestAnimationFrame(function () { busy = false; fn.apply(null, a); }); }; }

  /* ---------- hero parallax (pointer + scroll), transforms only ---------- */
  function initHero() {
    [].forEach.call(d.querySelectorAll('[data-sr-hero]'), function (hero) {
      if (reduce) return;
      var media = hero.querySelector('.sr-hero__media'), copy = hero.querySelector('.sr-hero__copy'), card = hero.querySelector('.sr-hero__card');
      var px = 0, py = 0, sy = 0;
      function paint() {
        if (media) media.style.transform = 'translate3d(' + (px * -14) + 'px,' + (py * -10 + sy * 0.25) + 'px,0)';
        if (copy) copy.style.transform = 'translate3d(' + (px * 8) + 'px,' + (py * 6 - sy * 0.08) + 'px,0)';
        if (card) card.style.transform = 'translate3d(' + (px * 16) + 'px,' + (py * 12 - sy * 0.12) + 'px,0)';
      }
      var p = raf(paint);
      if (fine) hero.addEventListener('pointermove', function (e) {
        var r = hero.getBoundingClientRect();
        px = (e.clientX - r.left) / r.width - 0.5; py = (e.clientY - r.top) / r.height - 0.5; p();
      }, { passive: true });
      var visible = true;
      if ('IntersectionObserver' in w) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }).observe(hero);
      w.addEventListener('scroll', function () { if (!visible) return; sy = Math.min(w.scrollY, 900); p(); }, { passive: true });
    });
  }

  /* ---------- tilt cards ---------- */
  function initTilt() {
    if (!fine || reduce) return;
    [].forEach.call(d.querySelectorAll('[data-sr-tilt]'), function (el) {
      var paint = raf(function (x, y) {
        el.style.setProperty('--ry', (x * 8).toFixed(2) + 'deg');
        el.style.setProperty('--rx', (y * -8).toFixed(2) + 'deg');
        el.style.setProperty('--gx', ((x + 0.5) * 100).toFixed(0) + '%');
        el.style.setProperty('--gy', ((y + 0.5) * 100).toFixed(0) + '%');
      });
      el.addEventListener('pointermove', function (e) { var r = el.getBoundingClientRect(); paint((e.clientX - r.left) / r.width - 0.5, (e.clientY - r.top) / r.height - 0.5); }, { passive: true });
      el.addEventListener('pointerleave', function () { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); });
    });
  }

  /* ---------- rails ---------- */
  function initRails() {
    [].forEach.call(d.querySelectorAll('[data-sr-rail]'), function (box) {
      var track = box.querySelector('.sr-rail');
      if (!track) return;
      [].forEach.call(box.querySelectorAll('[data-sr-dir]'), function (b) {
        b.addEventListener('click', function () {
          var item = track.firstElementChild; var step = item ? item.getBoundingClientRect().width + 20 : 300;
          track.scrollBy({ left: step * Number(b.getAttribute('data-sr-dir')) * (w.innerWidth > 990 ? 2 : 1), behavior: reduce ? 'auto' : 'smooth' });
        });
      });
    });
  }

  /* ---------- announcement rotation (mobile) ---------- */
  function initAnn() {
    [].forEach.call(d.querySelectorAll('[data-sr-ann]'), function (bar) {
      var msgs = bar.querySelectorAll('.sr-ann__msg'); if (msgs.length < 2) return;
      var i = 0, mq = w.matchMedia('(min-width: 990px)');
      setInterval(function () {
        if (mq.matches || d.hidden) return;
        var cur = msgs[i]; i = (i + 1) % msgs.length; var nxt = msgs[i];
        cur.classList.add('is-out'); cur.classList.remove('is-on');
        nxt.classList.remove('is-out'); nxt.classList.add('is-on');
        setTimeout(function () { cur.classList.remove('is-out'); }, 700);
      }, 4200);
    });
  }

  /* ---------- process story: scroll-linked progress ---------- */
  function initProcess() {
    [].forEach.call(d.querySelectorAll('[data-sr-proc]'), function (sec) {
      var list = sec.querySelector('.sr-proc'), line = sec.querySelector('.sr-proc__line'), steps = sec.querySelectorAll('.sr-proc__s'), imgs = sec.querySelectorAll('.sr-proc__media img');
      if (!list) return;
      var update = raf(function () {
        var r = list.getBoundingClientRect(), vh = w.innerHeight;
        var p = Math.min(1, Math.max(0, (vh * 0.6 - r.top) / r.height));
        if (line) line.style.setProperty('--p', p.toFixed(3));
        var active = 0;
        [].forEach.call(steps, function (s, i) { var sr = s.getBoundingClientRect(); var on = sr.top < vh * 0.62; s.classList.toggle('is-on', on); if (on) active = i; });
        [].forEach.call(imgs, function (im, i) { im.classList.toggle('is-on', i === Math.min(active, imgs.length - 1)); });
      });
      if (reduce) { [].forEach.call(steps, function (s) { s.classList.add('is-on'); }); if (line) line.style.setProperty('--p', 1); if (imgs[0]) imgs[0].classList.add('is-on'); return; }
      var on = false;
      if ('IntersectionObserver' in w) new IntersectionObserver(function (es) { on = es[0].isIntersecting; if (on) update(); }).observe(sec);
      w.addEventListener('scroll', function () { if (on) update(); }, { passive: true });
      update();
    });
  }

  /* ---------- wishlist (localStorage, per device) ---------- */
  var WKEY = 'sr-wishlist';
  function wl() { try { return JSON.parse(localStorage.getItem(WKEY) || '[]'); } catch (e) { return []; } }
  function wlSave(a) { try { localStorage.setItem(WKEY, JSON.stringify(a)); } catch (e) {} }
  function wlPaint() {
    var list = wl();
    [].forEach.call(d.querySelectorAll('[data-sr-wish]'), function (b) { b.setAttribute('aria-pressed', list.indexOf(b.getAttribute('data-sr-wish')) > -1 ? 'true' : 'false'); });
    [].forEach.call(d.querySelectorAll('[data-sr-wish-count]'), function (c) { c.textContent = list.length; c.hidden = !list.length; });
  }
  d.addEventListener('click', function (e) {
    var b = e.target.closest('[data-sr-wish]'); if (!b) return;
    e.preventDefault(); e.stopPropagation();
    var h = b.getAttribute('data-sr-wish'), list = wl(), i = list.indexOf(h);
    if (i > -1) list.splice(i, 1); else { list.unshift(h); track('add_to_wishlist', { handle: h }); }
    wlSave(list.slice(0, 60)); wlPaint();
  });
  function initWishPage() {
    var box = d.querySelector('[data-sr-wishlist]'); if (!box) return;
    var list = wl(), empty = box.querySelector('[data-sr-wish-empty]'), grid = box.querySelector('.sr-grid');
    if (!list.length) { if (empty) empty.hidden = false; return; }
    var root = (w.Shopify && Shopify.routes && Shopify.routes.root) || '/';
    Promise.all(list.map(function (h) {
      return fetch(root + 'products/' + encodeURIComponent(h) + '?view=sr-card', { credentials: 'same-origin' }).then(function (r) { return r.ok ? r.text() : ''; }).catch(function () { return ''; });
    })).then(function (html) {
      grid.innerHTML = html.join('');
      if (!grid.children.length && empty) empty.hidden = false;
      wlPaint(); initReveal(grid);
    });
  }

  /* ---------- gallery lightbox ---------- */
  d.addEventListener('click', function (e) {
    var a = e.target.closest('[data-sr-lightbox]'); if (!a) return;
    e.preventDefault();
    var lb = d.createElement('div'); lb.className = 'sr-lb sr'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', 'Image viewer');
    lb.innerHTML = '<img alt=""><button type="button" aria-label="Close">×</button>';
    lb.querySelector('img').src = a.getAttribute('href'); lb.querySelector('img').alt = a.getAttribute('data-alt') || '';
    d.body.appendChild(lb); requestAnimationFrame(function () { lb.classList.add('is-on'); });
    var btn = lb.querySelector('button'); btn.focus();
    function close() { lb.classList.remove('is-on'); setTimeout(function () { lb.remove(); a.focus(); }, 300); d.removeEventListener('keydown', key); }
    function key(ev) { if (ev.key === 'Escape') close(); }
    btn.addEventListener('click', close); lb.addEventListener('click', function (ev) { if (ev.target === lb) close(); }); d.addEventListener('keydown', key);
  });

  /* ---------- bespoke form: prefill from configurator / product, track submit ---------- */
  function initBespoke() {
    var forms = d.querySelectorAll('[data-sr-bespoke-form]'); if (!forms.length) return;
    var pre = {};
    try { pre = JSON.parse(sessionStorage.getItem('sr-bespoke') || '{}'); } catch (e) {}
    var qs = new URLSearchParams(w.location.search);
    qs.forEach(function (v, k) { if (k.indexOf('b_') === 0) pre[k.slice(2)] = v; });
    [].forEach.call(forms, function (f) {
      Object.keys(pre).forEach(function (k) {
        var el = f.querySelector('[data-sr-key="' + k + '"]'); if (!el || !pre[k]) return;
        if (el.tagName === 'SELECT') { var ok = [].some.call(el.options, function (o) { if (o.value === pre[k] || o.text === pre[k]) { el.value = o.value; return true; } }); if (!ok) { var o = new Option(pre[k], pre[k], true, true); el.add(o); } }
        else if (!el.value) el.value = pre[k];
      });
      f.addEventListener('submit', function () {
        track('bespoke_submit', { bed_type: (f.querySelector('[data-sr-key="type"]') || {}).value || '', size: (f.querySelector('[data-sr-key="size"]') || {}).value || '' });
        try { sessionStorage.removeItem('sr-bespoke'); } catch (e) {}
      });
    });
    if (d.querySelector('.sr-alert--ok')) track('bespoke_submitted', {});
  }

  /* ---------- PDP: bespoke link carries product + view_item ---------- */
  function initPdp() {
    var json = d.querySelector('[data-product-json]');
    if (json) { try { var p = JSON.parse(json.textContent); track('view_item', { product_id: p.id, product: p.title, price: (p.price || 0) / 100, type: p.type }); } catch (e) {} }
    [].forEach.call(d.querySelectorAll('.eb3d-info .sr-bespoke-cta'), function (a) {
      var info = a.closest('.eb3d-info'), anchor = info.querySelector('.eb3d-dynamic') || info.querySelector('.eb3d-buy');
      if (anchor) anchor.insertAdjacentElement('afterend', a);
    });
    [].forEach.call(d.querySelectorAll('[data-sr-bespoke-link]'), function (a) {
      a.addEventListener('click', function () {
        var info = a.closest('.eb3d-info') || d;
        var size = info.querySelector('[data-eb3d-variants] input:checked');
        try { sessionStorage.setItem('sr-bespoke', JSON.stringify({ type: a.getAttribute('data-type') || '', size: size ? size.value : '', details: 'Based on: ' + (a.getAttribute('data-title') || '') + ' (' + w.location.pathname + ')' })); } catch (e) {}
        track('bespoke_start', { source: 'pdp', product: a.getAttribute('data-title') || '' });
      });
    });
  }

  /* ---------- delivery ETA (3–5 working days, skips weekends) ---------- */
  function initEta() {
    [].forEach.call(d.querySelectorAll('[data-sr-eta]'), function (el) {
      var from = Number(el.getAttribute('data-from') || 3), to = Number(el.getAttribute('data-to') || 5);
      function add(n) { var t = new Date(); var c = 0; while (c < n) { t.setDate(t.getDate() + 1); var g = t.getDay(); if (g !== 0 && g !== 6) c++; } return t; }
      var f = { weekday: 'short', day: 'numeric', month: 'short' };
      try { el.textContent = add(from).toLocaleDateString('en-GB', f) + ' – ' + add(to).toLocaleDateString('en-GB', f); } catch (e) {}
    });
  }

  function boot() { initReveal(); initHero(); initTilt(); initRails(); initAnn(); initProcess(); wlPaint(); initWishPage(); initBespoke(); initPdp(); initEta(); }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', boot); else boot();
  d.addEventListener('shopify:section:load', function (e) { initReveal(e.target); initHero(); initTilt(); initRails(); initProcess(); initEta(); wlPaint(); });
})();
