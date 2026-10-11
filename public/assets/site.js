document.documentElement.classList.add('js');
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Header + nav */
  var header = document.querySelector('.site-header');
  function onScroll() { if (header) header.classList.toggle('scrolled', window.scrollY > 20); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  var btn = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  if (btn && nav) btn.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.textContent = open ? 'Close' : 'Menu';
  });
  var y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();

  /* Reveal on scroll */
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); if (e.target.id === 'map') e.target.classList.add('go'); io.unobserve(e.target); } });
  }, { threshold: 0.15 }) : null;
  document.querySelectorAll('.reveal').forEach(function (el) { io ? io.observe(el) : el.classList.add('in'); });

  /* Rotating headline word */
  var words = document.querySelectorAll('.rotator span');
  if (words.length > 1 && !reduce) {
    var wi = 0;
    setInterval(function () {
      var cur = words[wi]; wi = (wi + 1) % words.length; var nxt = words[wi];
      cur.classList.remove('on'); cur.classList.add('off');
      nxt.classList.remove('off'); nxt.classList.add('on');
      setTimeout(function () { cur.classList.remove('off'); }, 800);
    }, 2600);
  }

  /* Floating chips: mouse parallax */
  var chips = document.querySelectorAll('[data-depth]');
  if (chips.length && !reduce && window.matchMedia('(pointer: fine)').matches) {
    var tx = 0, ty = 0, cx = 0, cy = 0;
    window.addEventListener('pointermove', function (e) { tx = e.clientX / innerWidth - .5; ty = e.clientY / innerHeight - .5; }, { passive: true });
    (function loop() {
      cx += (tx - cx) * .06; cy += (ty - cy) * .06;
      chips.forEach(function (c) { var d = +c.dataset.depth; c.style.transform = 'translate3d(' + (-cx * d) + 'px,' + (-cy * d) + 'px,0)'; });
      requestAnimationFrame(loop);
    })();
  }

  /* Chat chip: typing then reply, on a loop */
  var reply = document.getElementById('chat-reply');
  if (reply && !reduce) {
    var replies = ['Of course. 8:30 pm is free. Shall I confirm it?', 'Done. You are booked for 8:30 pm, table for four.', 'Our menu is here. Would you like to pre-order?'];
    var ri = 0, text = reply.textContent;
    setInterval(function () {
      reply.innerHTML = '<span class="typing"><i></i><i></i><i></i></span>';
      reply.style.padding = '0';
      setTimeout(function () { ri = (ri + 1) % replies.length; reply.textContent = replies[ri]; reply.style.padding = ''; }, 1400);
    }, 4200);
  }

  /* Diagnosis ring */
  var bar = document.getElementById('ring-bar'), step = document.getElementById('scan-step');
  if (bar && step) {
    var steps = ['Reading your customer reviews', 'Checking nearby competitors', 'Mapping how orders flow', 'Listing what to fix first'];
    var si = 0;
    function tick() { bar.style.strokeDashoffset = 151 - 151 * ((si + 1) / steps.length); step.textContent = steps[si]; si = (si + 1) % steps.length; }
    tick(); if (!reduce) setInterval(tick, 2200);
  }

  /* Method words light up with scroll */
  var mw = document.getElementById('method-words');
  if (mw) {
    var items = mw.querySelectorAll('li'), mn = document.getElementById('m-n'), mt = document.getElementById('m-t'), md = document.getElementById('m-d'), last = -1;
    function upd() {
      var mid = innerHeight * .55, idx = 0;
      items.forEach(function (li, i) { if (li.getBoundingClientRect().top < mid) idx = i; });
      if (idx === last) return; last = idx;
      items.forEach(function (li, i) { li.classList.toggle('lit', i <= idx); });
      var li = items[idx]; mn.textContent = 'Step ' + li.dataset.n + ' of 4'; mt.textContent = li.dataset.t; md.textContent = li.dataset.d;
    }
    window.addEventListener('scroll', upd, { passive: true }); upd();
  }

  /* Card glow follows the cursor */
  document.querySelectorAll('.card-x').forEach(function (c) {
    c.addEventListener('pointermove', function (e) { var r = c.getBoundingClientRect(); c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px'); });
  });

  /* Hero field: WebGL flowing dusk */
  var cv = document.getElementById('field');
  if (!cv || reduce) return;
  var gl = cv.getContext('webgl', { antialias: false, premultipliedAlpha: false });
  if (!gl) return;
  var vs = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  var fs = [
    'precision mediump float;uniform vec2 r;uniform float t;uniform vec2 m;',
    'float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
    'float n(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),u.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),u.x),u.y);}',
    'float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p=p*2.02+vec2(1.7,9.2);a*=.5;}return v;}',
    'void main(){vec2 uv=gl_FragCoord.xy/r.xy;vec2 p=uv*vec2(r.x/r.y,1.)*1.6;float tt=t*.06;',
    'vec2 q=vec2(fbm(p+tt),fbm(p+vec2(5.2,1.3)-tt));',
    'vec2 w=vec2(fbm(p+3.*q+vec2(1.7,9.2)+tt*1.4+m*.6),fbm(p+3.*q+vec2(8.3,2.8)-tt));',
    'float f=fbm(p+2.5*w);',
    'vec3 lagoon=vec3(.086,.071,.11),deep=vec3(.16,.105,.15),saff=vec3(.914,.635,.231),flam=vec3(.784,.333,.239),vio=vec3(.42,.2,.3),mint=vec3(.95,.82,.55);',
    'vec3 c=mix(lagoon,deep,smoothstep(.2,.6,f));',
    'c=mix(c,flam,smoothstep(.48,.8,f)*.95*smoothstep(.1,.85,uv.x));',
    'c=mix(c,saff,smoothstep(.55,.9,length(w))*.85*smoothstep(.2,1.,uv.x));',
    'c=mix(c,vio,smoothstep(.55,.85,q.y)*.45);',
    'c+=mint*pow(smoothstep(.75,1.,f),3.)*.25;',
    'gl_FragColor=vec4(c,1.);}'
  ].join('');
  function sh(type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; }
  var pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
  gl.useProgram(pr);
  var buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  var loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  var uR = gl.getUniformLocation(pr, 'r'), uT = gl.getUniformLocation(pr, 't'), uM = gl.getUniformLocation(pr, 'm');
  var scale = Math.min(window.devicePixelRatio || 1, 1.25) * 0.55, mx = 0, my = 0, smx = 0, smy = 0, visible = true, t0 = performance.now();
  function size() { cv.width = Math.max(1, cv.clientWidth * scale | 0); cv.height = Math.max(1, cv.clientHeight * scale | 0); gl.viewport(0, 0, cv.width, cv.height); }
  size(); window.addEventListener('resize', size);
  window.addEventListener('pointermove', function (e) { mx = e.clientX / innerWidth - .5; my = .5 - e.clientY / innerHeight; }, { passive: true });
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }).observe(cv);
  (function frame(now) {
    if (visible && !document.hidden) {
      smx += (mx - smx) * .03; smy += (my - smy) * .03;
      gl.uniform2f(uR, cv.width, cv.height); gl.uniform1f(uT, (now - t0) / 1000 + 20.0); gl.uniform2f(uM, smx, smy);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    requestAnimationFrame(frame);
  })(t0);
})();
