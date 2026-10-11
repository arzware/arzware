/* Arzware site script. No dependencies. Everything here is progressive enhancement:
   the site works without it (content, links and FAQ are plain HTML). */
(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('js');
  var reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* Year in footer */
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* Header: hairline after scroll, mobile menu */
  var header = document.querySelector('.site-header');
  var menuBtn = document.querySelector('.menu-btn');
  function onScroll() { if (header) header.classList.toggle('scrolled', window.scrollY > 24); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  function closeMenu() {
    if (!header || !menuBtn) return;
    header.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.textContent = 'Menu';
  }
  if (menuBtn && header) {
    menuBtn.addEventListener('click', function () {
      var open = header.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      menuBtn.textContent = open ? 'Close' : 'Menu';
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && header.classList.contains('open')) { closeMenu(); menuBtn.focus(); } });
    window.addEventListener('resize', function () { if (window.innerWidth > 960) closeMenu(); });
  }

  /* Reveal once on scroll (staggered 60ms) */
  var rv = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window && !reduceMQ.matches) {
    var io = new IntersectionObserver(function (entries) {
      var i = 0;
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        setTimeout(function () { el.classList.add('in'); }, 60 * i++);
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    rv.forEach(function (el) { io.observe(el); });
  } else {
    rv.forEach(function (el) { el.classList.add('in'); });
  }

  /* Mobile bottom bar: appears after the first screen */
  var bar = document.querySelector('.bottom-bar');
  if (bar) {
    var showBar = function () { bar.classList.toggle('show', window.scrollY > window.innerHeight * 0.8); };
    window.addEventListener('scroll', showBar, { passive: true });
    showBar();
  }

  /* Tabs (WAI-ARIA tabs pattern with arrow keys) */
  document.querySelectorAll('[role="tablist"]').forEach(function (list) {
    var tabs = Array.prototype.slice.call(list.querySelectorAll('[role="tab"]'));
    function select(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) panel.hidden = !on;
      });
      if (focus) tab.focus();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(t, false); });
      t.addEventListener('keydown', function (e) {
        var rtl = getComputedStyle(list).direction === 'rtl';
        var next = { ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1 }[e.key];
        if (next) { e.preventDefault(); select(tabs[(i + next + tabs.length) % tabs.length], true); }
        else if (e.key === 'Home') { e.preventDefault(); select(tabs[0], true); }
        else if (e.key === 'End') { e.preventDefault(); select(tabs[tabs.length - 1], true); }
      });
    });
  });

  /* Contact form: no backend yet, so it opens WhatsApp or email with the message filled in */
  var form = document.querySelector('form.f');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var err = form.querySelector('.err');
      var ok = form.querySelector('.ok');
      var get = function (n) { var el = form.elements[n]; return el ? el.value.trim() : ''; };
      var missing = ['name', 'message'].filter(function (n) { return !get(n); });
      if (missing.length) {
        if (err) { err.hidden = false; err.textContent = 'Please add your name and a short message.'; }
        form.elements[missing[0]].focus();
        return;
      }
      if (err) err.hidden = true;
      var text = 'Hi Arzware, I\'m ' + get('name') +
        (get('business') ? ' from ' + get('business') : '') +
        (get('country') ? ' (' + get('country') + ')' : '') + '.\n\n' + get('message') +
        (get('reach') ? '\n\nBest way to reach me: ' + get('reach') : '');
      var via = get('via') || 'whatsapp';
      var url = via === 'email'
        ? 'mailto:support@arzware.net?subject=' + encodeURIComponent('Enquiry from ' + get('name')) + '&body=' + encodeURIComponent(text)
        : 'https://wa.me/96181901378?text=' + encodeURIComponent(text);
      if (ok) ok.hidden = false;
      window.open(url, via === 'email' ? '_self' : '_blank', 'noopener');
    });
  }

  /* Hero: slow silky ribbons (WebGL). Static poster when reduced motion or no WebGL.
     Pauses off-screen and when the tab is hidden; visible pause button (WCAG 2.2.2). */
  var cv = document.getElementById('ribbon');
  if (!cv) return;
  var gl = null;
  try { gl = cv.getContext('webgl', { antialias: false, premultipliedAlpha: false }); } catch (e) {}
  if (!gl) { cv.remove(); return; }

  var N = 'float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}' +
    'float n(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),u.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),u.x),u.y);}' +
    'float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*n(p);p*=2.03;a*=.5;}return v;}';
  var FS = 'precision mediump float;uniform vec2 r;uniform float t;' + N +
    'void main(){vec2 uv=gl_FragCoord.xy/r;float ar=r.x/r.y;vec2 p=vec2(uv.x*ar,uv.y);float tt=t*.18;' +
    'vec3 bg=mix(vec3(.918,.945,.941),vec3(.969,.961,.941),1.-uv.y);vec3 col=bg;' +
    'for(int k=0;k<3;k++){float fk=float(k);float c=.48+.1*fk+.16*sin(p.x*1.6+tt+fk*1.7)+.08*sin(p.x*3.3-tt*1.3+fk)+.06*(fbm(vec2(p.x*1.2,tt*.4+fk))-.5);' +
    'float d=(p.y-c)*(4.+fk*1.5);float env=exp(-d*d*2.2)*smoothstep(.05,.55,uv.x+.1*fk);' +
    'float lines=.5+.5*sin((p.y-c)*190.+p.x*6.+tt*2.);float shade=.55+.45*sin((p.y-c)*14.+p.x*2.+tt);' +
    'vec3 a=k==0?vec3(1.,.70,.25):(k==1?vec3(1.,.44,.36):vec3(.48,.35,.97));vec3 hi=k==0?vec3(1.,.86,.55):(k==1?vec3(1.,.72,.62):vec3(.72,.68,1.));' +
    'vec3 rib=mix(a,hi,shade)*(.88+.12*lines);col=mix(col,rib,env*(k==2?.55:.85));}' +
    'col=mix(col,bg,smoothstep(.75,.3,uv.x)*.7);gl_FragColor=vec4(col,1.);}';

  function sh(type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; }
  var pr = gl.createProgram();
  gl.attachShader(pr, sh(gl.VERTEX_SHADER, 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}'));
  gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS));
  gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) { cv.remove(); return; }
  gl.useProgram(pr);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  var loc = gl.getAttribLocation(pr, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  var uR = gl.getUniformLocation(pr, 'r'), uT = gl.getUniformLocation(pr, 't');

  var scale = Math.min(window.devicePixelRatio || 1, 2) * 0.5;
  function size() {
    cv.width = Math.max(1, cv.clientWidth * scale | 0);
    cv.height = Math.max(1, cv.clientHeight * scale | 0);
    gl.viewport(0, 0, cv.width, cv.height);
  }
  var clock = 8, last = null, visible = true, paused = false, raf = 0;
  function draw() { gl.uniform2f(uR, cv.width, cv.height); gl.uniform1f(uT, clock); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); }
  function frame(now) {
    raf = 0;
    if (last !== null) clock += Math.min((now - last) / 1000, 0.1);
    last = now;
    draw();
    loop();
  }
  function running() { return visible && !paused && !document.hidden && !reduceMQ.matches; }
  function loop() { if (running() && !raf) raf = requestAnimationFrame(frame); if (!running()) last = null; }

  size(); draw();
  window.addEventListener('resize', function () { size(); draw(); });
  new IntersectionObserver(function (e) { visible = e[0].isIntersecting; loop(); }).observe(cv);
  document.addEventListener('visibilitychange', loop);

  var btn = document.querySelector('.hero .pause');
  if (btn) {
    var label = btn.querySelector('span'), icon = btn.querySelector('svg path');
    var setBtn = function () {
      btn.hidden = reduceMQ.matches;
      btn.setAttribute('aria-pressed', paused ? 'true' : 'false');
      label.textContent = paused ? 'Play animation' : 'Pause animation';
      icon.setAttribute('d', paused ? 'M4 2l8 5-8 5z' : 'M4 2v10M10 2v10');
      icon.setAttribute('fill', paused ? 'currentColor' : 'none');
    };
    btn.addEventListener('click', function () { paused = !paused; setBtn(); loop(); });
    if (reduceMQ.addEventListener) reduceMQ.addEventListener('change', function () { setBtn(); loop(); });
    setBtn();
  }
  loop();
})();
