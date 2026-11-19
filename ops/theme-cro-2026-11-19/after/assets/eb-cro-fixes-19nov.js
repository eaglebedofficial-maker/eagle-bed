/* Eagle Bed CRO fixes, 19 Nov 2026 (Rocket Stage 3). Loaded once from layout/theme.liquid.
   1) Mobile sticky "Add to basket" bar shows as soon as the price has scrolled off
      the screen and the main Add to basket button is not on screen (was: only after
      the main button had passed the top, ~3,000-4,250 px down).
   2) A tap on the sticky button presses the real Add to basket button, so Easify
      checks the required options exactly as the main button does (adds, or scrolls
      to the first missing option).
   3) Adds html.eb-cro-lift-chat while a mobile sticky bar is on screen (fallback for
      browsers without :has()), so the CSS lifts the Chat bubble above it. */
(function () {
  'use strict';
  function init(root) {
    if (!root || root.__ebCro) return;
    var bar = root.querySelector('[data-sticky]');
    var main = root.querySelector('[data-add-main]');
    if (!bar || !main) return;
    root.__ebCro = true;
    var mainBtn = main.querySelector('button[type="submit"], [name="add"]');
    var price = root.querySelector('.eb3d-info [data-price]') || root.querySelector('[data-price]');
    var html = document.documentElement;
    var mainVisible = false;
    var ticking = false;
    function update() {
      ticking = false;
      var mr = main.getBoundingClientRect();
      mainVisible = mr.bottom > 0 && mr.top < window.innerHeight;
      var pastPrice = price ? price.getBoundingClientRect().bottom < 0 : window.scrollY > 900;
      var on = !mainVisible && (pastPrice || mr.bottom <= 0);
      bar.classList.toggle('is-on', on);
      var shown = on && window.getComputedStyle(bar).display !== 'none';
      html.classList.toggle('eb-cro-lift-chat', shown);
    }
    function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function () { onScroll(); }).observe(main);
    }
    update();
    if (mainBtn) {
      /* capture phase on the bar runs before the theme's own click handler on the button */
      bar.addEventListener('click', function (e) {
        var b = e.target && e.target.closest ? e.target.closest('[data-add]') : null;
        if (!b) return;
        e.preventDefault();
        e.stopPropagation();
        if (mainBtn.disabled) return;
        mainBtn.click();
      }, true);
    }
  }
  function boot() {
    var list = document.querySelectorAll('[data-pdp]');
    for (var i = 0; i < list.length; i++) init(list[i]);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  document.addEventListener('shopify:section:load', boot);
})();
