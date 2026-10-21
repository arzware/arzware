/* arzware.net intro loader (home page). Runs in <head>, before the page paints.
   When it plays:
   - every time the home page is opened or reloaded;
   - not when the visitor clicks through to Home from another page of this site;
   - add ?loader to the URL to force it (handy for testing).
   How it ends: it plays the logo animation, then holds on the finished logo until the
   page has fully loaded (window load + web fonts) and fades out, capped at MAX_MS.
   A click, tap or key press skips it. With reduced motion the logo shows still, and the
   loader is removed as soon as the page is ready. Without JavaScript, the CSS timeline
   hides it after about 1.5 s. */
(function () {
  var root = document.documentElement, MAX_MS = 4000, start = Date.now();
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  var force = /[?&]loader\b/.test(location.search), internal = false;
  try {
    var nav = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
    var reload = nav && nav.type === 'reload';
    var ref = document.referrer ? new URL(document.referrer) : null;
    internal = !reload && !!ref && ref.origin === location.origin && ref.pathname !== location.pathname;
  } catch (e) {}
  if (internal && !force) root.classList.add('azl-skip');
  else root.classList.add('azl-on');

  var pageReady = new Promise(function (resolve) {
    function fonts() { (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(resolve, resolve); }
    if (document.readyState === 'complete') fonts();
    else addEventListener('load', fonts, { once: true });
  });

  document.addEventListener('DOMContentLoaded', function () {
    var el = document.getElementById('azl');
    var finished = false;
    function cleanup() {
      if (el && el.parentNode) el.parentNode.removeChild(el);
      root.classList.remove('azl-on');
      removeEventListener('pointerdown', skip, true);
      removeEventListener('keydown', skip, true);
    }
    function skip() { if (reduce) return cleanup(); finished = true; el.classList.add('azl-leave'); }
    if (!el || root.classList.contains('azl-skip')) return cleanup();

    function finish() {
      if (finished) return; finished = true;
      if (reduce) return cleanup();          // no fade with reduced motion
      el.classList.add('azl-done');           // CSS fades it out; animationend removes it
    }
    el.addEventListener('animationend', function (e) {
      if (e.target === el && (el.classList.contains('azl-done') || el.classList.contains('azl-leave'))) cleanup();
    });
    addEventListener('pointerdown', skip, true);
    addEventListener('keydown', skip, true);

    var speed = parseFloat(getComputedStyle(root).getPropertyValue('--azl-speed')) || 1;
    var introMs = reduce ? 600 : 1100 * speed;
    var introDone = new Promise(function (r) { setTimeout(r, Math.max(0, introMs - (Date.now() - start))); });
    Promise.all([introDone, pageReady]).then(finish);
    setTimeout(finish, MAX_MS);
    setTimeout(cleanup, MAX_MS + 1500);       // safety net
  });
})();
