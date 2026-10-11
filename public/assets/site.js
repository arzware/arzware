/* Arzware site script. No dependencies. Progressive enhancement only:
   every page works without it (content, links and FAQ are plain HTML). */
(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) root.classList.add('reduce');

  /* Footer year */
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* Header: hairline after scroll, mobile menu */
  var header = document.querySelector('.site-header');
  var menuBtn = document.querySelector('.menu-btn');
  function onScroll() { if (header) header.classList.toggle('scrolled', window.scrollY > 16); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  function closeMenu() {
    if (!header || !menuBtn) return;
    header.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.textContent = menuBtn.getAttribute('data-open') || 'Menu';
  }
  if (menuBtn && header) {
    menuBtn.setAttribute('data-open', menuBtn.textContent);
    menuBtn.addEventListener('click', function () {
      var open = header.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      menuBtn.textContent = open ? (menuBtn.getAttribute('data-close') || 'Close') : menuBtn.getAttribute('data-open');
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && header.classList.contains('open')) { closeMenu(); menuBtn.focus(); } });
    window.addEventListener('resize', function () { if (window.innerWidth > 960) closeMenu(); });
  }

  /* Reveal once on scroll */
  var rv = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      var i = 0;
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        setTimeout(function () { el.classList.add('in'); }, 70 * i++);
        if (el.id === 'map') el.classList.add('go');
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    rv.forEach(function (el) { io.observe(el); });
  } else {
    rv.forEach(function (el) { el.classList.add('in'); });
  }

  /* Method: the step under the reading line lights up and fills the detail card */
  var mw = document.getElementById('method-words');
  if (mw && !reduce) {
    var items = mw.querySelectorAll('li');
    var card = { n: document.getElementById('m-n'), t: document.getElementById('m-t'), d: document.getElementById('m-d'), g: document.getElementById('m-g') };
    var last = -1;
    var update = function () {
      var line = window.innerHeight * 0.55, idx = 0;
      items.forEach(function (li, i) { if (li.getBoundingClientRect().top < line) idx = i; });
      if (idx === last) return;
      last = idx;
      items.forEach(function (li, i) { li.classList.toggle('lit', i <= idx); });
      var li = items[idx];
      if (card.n) card.n.textContent = li.getAttribute('data-step');
      if (card.t) card.t.textContent = li.getAttribute('data-title');
      if (card.d) card.d.textContent = li.getAttribute('data-desc');
      if (card.g) card.g.innerHTML = '<b>' + li.getAttribute('data-gives-label') + '</b> ' + li.getAttribute('data-gives');
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* Hero: the dusk field (WebGL). The CSS poster underneath is the still version.
     Paused off-screen, in background tabs, by the pause button, and never run with reduced motion. */
  var hero = document.querySelector('.hero');
  var cv = document.getElementById('field');
  var pauseBtn = document.querySelector('.pause');
  if (!hero || !cv || reduce) return;
  var gl = cv.getContext('webgl', { antialias: false, premultipliedAlpha: false });
  var paused = false;
  if (pauseBtn) {
    pauseBtn.hidden = false;
    var label = pauseBtn.querySelector('span');
    pauseBtn.addEventListener('click', function () {
      paused = !paused;
      hero.classList.toggle('motion-paused', paused);
      pauseBtn.setAttribute('aria-pressed', paused ? 'true' : 'false');
      if (label) label.textContent = paused ? (pauseBtn.getAttribute('data-play') || 'Play animation') : (pauseBtn.getAttribute('data-pause') || 'Pause animation');
    });
  }
  if (!gl) return;
  var vs = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  var fs = [
    'precision mediump float;uniform vec2 r;uniform float t;',
    'float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
    'float n(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),u.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),u.x),u.y);}',
    'float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p=p*2.02+vec2(1.7,9.2);a*=.5;}return v;}',
    'void main(){vec2 uv=gl_FragCoord.xy/r.xy;vec2 p=uv*vec2(r.x/r.y,1.)*1.5;float tt=t*.035;',
    'vec2 q=vec2(fbm(p+tt),fbm(p+vec2(5.2,1.3)-tt));',
    'vec2 w=vec2(fbm(p+3.*q+vec2(1.7,9.2)+tt*1.3),fbm(p+3.*q+vec2(8.3,2.8)-tt));',
    'float f=fbm(p+2.5*w);',
    'vec3 night=vec3(.067,.153,.165),deep=vec3(.086,.196,.208),saff=vec3(.96,.69,.29),rose=vec3(.91,.54,.61),mint=vec3(.66,.86,.82);',
    'vec3 c=mix(night,deep,smoothstep(.2,.6,f));',
    'c=mix(c,rose,smoothstep(.5,.82,f)*.7*smoothstep(.15,.9,uv.x));',
    'c=mix(c,saff,smoothstep(.58,.92,length(w))*.6*smoothstep(.25,1.,uv.x));',
    'c+=mint*pow(smoothstep(.72,1.,f),3.)*.18;',
    'gl_FragColor=vec4(c,1.);}'
  ].join('');
  function sh(type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; }
  var pr = gl.createProgram();
  gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs));
  gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
  gl.useProgram(pr);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  var loc = gl.getAttribLocation(pr, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  var uR = gl.getUniformLocation(pr, 'r'), uT = gl.getUniformLocation(pr, 't');
  var scale = Math.min(window.devicePixelRatio || 1, 1.25) * 0.5;
  function size() { cv.width = Math.max(1, cv.clientWidth * scale | 0); cv.height = Math.max(1, cv.clientHeight * scale | 0); gl.viewport(0, 0, cv.width, cv.height); }
  size();
  window.addEventListener('resize', size);
  var visible = true, clock = 20, prev = performance.now(), first = true;
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }).observe(hero);
  (function frame(now) {
    var dt = Math.min(now - prev, 100) / 1000; prev = now;
    if (visible && !document.hidden && (!paused || first)) {
      if (!paused) clock += dt;
      gl.uniform2f(uR, cv.width, cv.height);
      gl.uniform1f(uT, clock);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      if (first) { cv.classList.add('ready'); first = false; }
    }
    requestAnimationFrame(frame);
  })(prev);
})();
