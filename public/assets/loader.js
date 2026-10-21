/* arzware.net intro loader (home page).
   Runs in <head> before the page paints:
   - plays once per browser session (sessionStorage), then is skipped on later page views;
   - plays the logo animation, then holds on the finished logo until the page has fully
     loaded (window load + web fonts), and only then fades out; capped so a slow
     connection never waits more than MAX_MS;
   - a click, tap or key press skips it; reduced-motion users never see it;
   - without JavaScript the CSS timeline still hides it after about 1.5s. */
(function () {
  var root = document.documentElement, KEY = 'azl-seen', MAX_MS = 4000;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  try {
    if (sessionStorage.getItem(KEY)) root.classList.add('azl-skip');
    else sessionStorage.setItem(KEY, '1');
  } catch (e) {}
  if (!root.classList.contains('azl-skip') && !reduce) root.classList.add('azl-on');

  var start = Date.now();
  var pageReady = new Promise(function (resolve) {
    function fonts() { (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(resolve, resolve); }
    if (document.readyState === 'complete') fonts();
    else addEventListener('load', fonts, { once: true });
  });

  document.addEventListener('DOMContentLoaded', function () {
    var el = document.getElementById('azl');
    if (!el) { root.classList.remove('azl-on'); return; }
    function cleanup() {
      if (el.parentNode) el.parentNode.removeChild(el);
      root.classList.remove('azl-on');
      removeEventListener('pointerdown', skip, true);
      removeEventListener('keydown', skip, true);
    }
    if (root.classList.contains('azl-skip') || reduce) return cleanup();

    var speed = parseFloat(getComputedStyle(root).getPropertyValue('--azl-speed')) || 1;
    var introMs = 1100 * speed, finished = false;
    function finish() {
      if (finished) return; finished = true;
      el.classList.add('azl-done');
    }
    function skip() { finished = true; el.classList.add('azl-leave'); }
    el.addEventListener('animationend', function (e) {
      if (e.target === el && (el.classList.contains('azl-done') || el.classList.contains('azl-leave'))) cleanup();
    });
    addEventListener('pointerdown', skip, true);
    addEventListener('keydown', skip, true);

    // Leave when BOTH the intro has played and the page is ready, or at the cap.
    var introDone = new Promise(function (r) { setTimeout(r, Math.max(0, introMs - (Date.now() - start))); });
    Promise.all([introDone, pageReady]).then(finish);
    setTimeout(finish, MAX_MS);
    setTimeout(cleanup, MAX_MS + 1500);
  });
})();
