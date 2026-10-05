/* Eagle Bed mattress finder: scores the store's own mattresses against the shopper's answers. */
(function () {
  'use strict';
  var TARGET = { soft: 3, medium: 5, mfirm: 7, firm: 8.5 };
  var SIZE_RX = { single: /^single/i, small: /small/i, double: /standard double|^double/i, king: /^king/i, superking: /super/i };

  function money(cents, fmt) {
    var v = (cents / 100).toFixed(2);
    return (fmt || '£{{amount}}').replace(/\{\{\s*amount[^}]*\}\}/, v.replace(/\B(?=(\d{3})+(?!\d))/g, ','));
  }
  function score(m, a) {
    var s = 0, why = [];
    var t = TARGET[a.firm];
    if (t) { var diff = Math.abs(m.firm - t); s -= diff * 2; if (diff <= 1.5) why.push('the ' + (a.firm === 'mfirm' ? 'medium-firm' : a.firm) + ' feel you asked for'); }
    if (a.pos && m.pos.indexOf(a.pos) > -1) { s += 3; why.push('suits ' + (a.pos === 'combo' ? 'people who change position' : a.pos + ' sleepers')); }
    if (a.support === 'soft' && m.firm <= 5) { s += 2; why.push('softer, cushioned support'); }
    if (a.support === 'firm' && m.firm >= 6.5) { s += 2; why.push('firmer support'); }
    if (a.partner === 'two' && m.partner) { s += 2; why.push('less partner disturbance'); }
    if (a.build && a.build !== 'any') { if (m.type === a.build) { s += 4; why.push(a.build === 'pocket' ? 'pocket springs' : a.build === 'memory' ? 'memory foam' : 'springs with a comfort top'); } else s -= 1; }
    return { s: s, why: why };
  }
  function init(root) {
    if (root.__srQuiz) return; root.__srQuiz = true;
    var data; try { data = JSON.parse(root.querySelector('[data-sr-quiz-data]').textContent); } catch (e) { return; }
    var steps = root.querySelectorAll('.sr-quiz__step'), bar = root.querySelector('.sr-quiz__bar i'), back = root.querySelector('.sr-quiz__back');
    var res = root.querySelector('[data-sr-quiz-results]'), answers = {}, i = 0;
    function show(n) {
      i = n;
      [].forEach.call(steps, function (s, k) { s.classList.toggle('is-on', k === n); });
      if (bar) bar.style.setProperty('--p', (n / (steps.length - 1)).toFixed(3));
      if (back) back.hidden = n === 0 || n === steps.length - 1;
      var h = steps[n] && steps[n].querySelector('h3, .sr-quiz__q'); if (h && n > 0) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
    }
    function finish() {
      var ranked = data.items.map(function (m) { var r = score(m, answers); return { m: m, s: r.s, why: r.why }; }).sort(function (a, b) { return b.s - a.s; }).slice(0, 2);
      var rx = SIZE_RX[answers.size];
      res.innerHTML = ranked.map(function (r, k) {
        var m = r.m, price = m.price, sizeLabel = '';
        if (rx) m.v.forEach(function (v) { if (rx.test(v.t)) { price = v.p; sizeLabel = v.t; } });
        var bars = ''; for (var b = 1; b <= 10; b++) bars += '<i class="' + (b <= Math.round(m.firm) ? 'on' : '') + '"></i>';
        var why = r.why.length ? 'Why: ' + r.why.slice(0, 3).join(', ') + '.' : (m.note || '');
        return '<a class="sr-rec' + (k === 0 ? ' sr-rec--top' : '') + '" href="' + m.url + '" data-sr-track="quiz_result_click" data-sr-label="' + m.title.replace(/"/g, '') + '">' +
          (k === 0 ? '<span class="sr-badge sr-badge--plum">Best match</span>' : '') +
          (m.img ? '<img src="' + m.img + '" alt="" loading="lazy" width="96" height="96">' : '<span></span>') +
          '<span><h4>' + m.title + '</h4><span class="sr-firm" role="img" aria-label="Firmness ' + Math.round(m.firm) + ' out of 10">' + bars + '</span><p>' + why + '</p><b>' + money(price, data.fmt) + (sizeLabel ? ' <small style="font-weight:600;color:var(--sr-mute)">' + sizeLabel + '</small>' : '') + '</b></span></a>';
      }).join('');
      if (window.srTrack) window.srTrack('quiz_complete', { answers: answers, top: ranked[0] && ranked[0].m.title });
    }
    root.addEventListener('click', function (e) {
      var o = e.target.closest('.sr-quiz__opt');
      if (o) {
        var step = o.closest('.sr-quiz__step');
        [].forEach.call(step.querySelectorAll('.sr-quiz__opt'), function (x) { x.setAttribute('aria-pressed', x === o ? 'true' : 'false'); });
        answers[step.getAttribute('data-q')] = o.getAttribute('data-v');
        setTimeout(function () { if (i === steps.length - 2) finish(); show(Math.min(i + 1, steps.length - 1)); }, 220);
        return;
      }
      if (e.target.closest('.sr-quiz__back')) show(Math.max(0, i - 1));
      if (e.target.closest('[data-sr-quiz-restart]')) { answers = {}; [].forEach.call(root.querySelectorAll('.sr-quiz__opt'), function (x) { x.setAttribute('aria-pressed', 'false'); }); show(0); }
    });
    show(0);
  }
  function boot() { [].forEach.call(document.querySelectorAll('[data-sr-quiz]'), init); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  document.addEventListener('shopify:section:load', boot);
})();
