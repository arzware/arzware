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
      // Move keyboard focus into the menu that just opened (the button sits after the nav in the page).
      if (open) { var first = document.querySelector('#site-nav a'); if (first) first.focus(); }
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

  /* Tabs (WAI-ARIA tabs pattern with arrow keys) */
  document.querySelectorAll('[role="tablist"]').forEach(function (list) {
    var tabs = Array.prototype.slice.call(list.querySelectorAll('[role="tab"]'));
    function select(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) { panel.hidden = !on; panel.classList.toggle('show', on); }
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

  /* Motion: silky ribbon heroes, animated pillar art, rotating word, orbits.
     Always running; only an OS-level "reduce motion" setting shows a still frame. */
  function still() { return reduceMQ.matches; }

  var N = 'float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}' +
    'float n(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),u.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),u.x),u.y);}' +
    'float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*n(p);p*=2.03;a*=.5;}return v;}';
  /* Ribbons: 4 flowing bands with light glints racing along them and drifting sparks */
  function ribbon(fade) {
    return N + 'void main(){vec2 uv=gl_FragCoord.xy/r;float ar=r.x/r.y;vec2 p=vec2(uv.x*ar,uv.y);float tt=t*.55;' +
      'vec3 bg=mix(vec3(.953,.965,.965),vec3(.992,.973,.945),1.-uv.y);vec3 col=bg;float side=smoothstep(.05,.6,uv.x);' +
      'for(int k=0;k<4;k++){float fk=float(k);float c=.4+.1*fk+.16*sin(p.x*1.6+tt+fk*1.7)+.08*sin(p.x*3.3-tt*1.3+fk)+.06*(fbm(vec2(p.x*1.2,tt*.4+fk))-.5);' +
      'float d=(p.y-c)*(4.+fk*1.5);float env=exp(-d*d*2.2)*smoothstep(.05,.55,uv.x+.1*fk);' +
      'float lines=.5+.5*sin((p.y-c)*190.+p.x*6.-tt*6.);float shade=.55+.45*sin((p.y-c)*14.+p.x*2.+tt*1.5);' +
      'vec3 a=k==0?vec3(1.,.70,.25):(k==1?vec3(1.,.44,.38):(k==2?vec3(.43,.36,.99):vec3(.93,.3,.24)));vec3 hi=k==0?vec3(1.,.86,.55):(k==1?vec3(1.,.72,.62):(k==2?vec3(.72,.68,1.):vec3(1.,.6,.5)));' +
      'vec3 rib=mix(a,hi,shade)*(.86+.14*lines);col=mix(col,rib,env*(k==2?.55:(k==3?.5:.85)));' +
      'float g=fract(p.x*.45-t*(.35+.12*fk)+fk*.37);float glint=exp(-pow((g-.5)*14.,2.))*exp(-d*d*9.);col+=vec3(1.,.95,.88)*glint*.75*side;}' +
      'vec2 q=p*vec2(1.,1.)+vec2(-t*.22,sin(p.x*2.+t*.6)*.05);for(int j=0;j<2;j++){float sc=14.+float(j)*10.;vec2 cell=floor(q*sc);vec2 f=fract(q*sc)-.5;' +
      'float rn=h(cell+float(j)*7.);vec2 o=vec2(h(cell+3.1),h(cell+5.7))-.5;float tw=.5+.5*sin(t*4.+rn*40.);' +
      'float dot=smoothstep(.09,.0,length(f-o*.6))*step(.82,rn)*tw;vec3 sp=rn>.94?vec3(.43,.36,.99):(rn>.88?vec3(1.,.44,.38):vec3(1.,.7,.25));col=mix(col,sp,dot*side*.9);}' +
      'col=mix(col,bg,smoothstep(' + fade + ',.25,uv.x)*.6);gl_FragColor=vec4(col,1.);}';
  }
  var SHADERS = {
    ribbon: ribbon('.62'),
    'ribbon-soft': ribbon('.8'),
    art0: 'void main(){vec2 uv=gl_FragCoord.xy/r;vec2 p=(uv-.5)*vec2(r.x/r.y,1.);float d=length(p);float w=.5+.5*sin(d*40.-t*2.);vec3 c=mix(vec3(1.,.95,.86),vec3(1.,.72,.3),smoothstep(.6,.0,d)*w);gl_FragColor=vec4(c,1.);}',
    art1: 'void main(){vec2 uv=gl_FragCoord.xy/r;float y=.5+.18*sin(uv.x*12.-t*2.)*exp(-pow((uv.x-.5)*4.,2.))+.04*sin(uv.x*40.+t*3.);float l=smoothstep(.02,.0,abs(uv.y-y));vec3 c=mix(vec3(1.,.93,.92),vec3(1.,.72,.68),uv.y);c=mix(c,vec3(1.,.36,.3),l);gl_FragColor=vec4(c,1.);}',
    art2: 'void main(){vec2 uv=gl_FragCoord.xy/r;vec2 g=floor(uv*vec2(8.,5.));float on=step(.55,fract(sin(dot(g,vec2(12.9,78.2))+floor(t*.8))*437.5));vec2 f=fract(uv*vec2(8.,5.));float box=step(.08,f.x)*step(.08,f.y)*step(f.x,.92)*step(f.y,.92);vec3 c=mix(vec3(.93,.92,1.),mix(vec3(.8,.78,1.),vec3(.43,.36,.99),on),box);gl_FragColor=vec4(c,1.);}',
    art3: 'void main(){vec2 uv=gl_FragCoord.xy/r;vec2 p=uv*vec2(r.x/r.y,1.);vec3 c=mix(vec3(.9,.98,.96),vec3(.7,.93,.87),uv.y);float m=0.;for(int i=0;i<6;i++){float fi=float(i);vec2 q=vec2(.25+.3*fi*.4+.2*sin(t*.5+fi),.5+.3*sin(t*.7+fi*1.3));q.x*=r.x/r.y*.9;m+=smoothstep(.035,.02,length(p-q));for(int j=0;j<6;j++){if(j<=i)continue;float fj=float(j);vec2 s=vec2(.25+.3*fj*.4+.2*sin(t*.5+fj),.5+.3*sin(t*.7+fj*1.3));s.x*=r.x/r.y*.9;vec2 pa=p-q,ba=s-q;float hh=clamp(dot(pa,ba)/dot(ba,ba),0.,1.);m+=.6*smoothstep(.006,.0,length(pa-ba*hh))*step(length(ba),.5);}}c=mix(c,vec3(.06,.42,.39),clamp(m,0.,1.));gl_FragColor=vec4(c,1.);}'
  };

  var scenes = [];
  function setup(cv) {
    var gl = null;
    try { gl = cv.getContext('webgl', { antialias: false }); } catch (e) {}
    if (!gl) return;
    function sh(type, src) { var o = gl.createShader(type); gl.shaderSource(o, src); gl.compileShader(o); return o; }
    var pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}'));
    gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, '#ifdef GL_FRAGMENT_PRECISION_HIGH\nprecision highp float;\n#else\nprecision mediump float;\n#endif\nuniform vec2 r;uniform float t;' + SHADERS[cv.getAttribute('data-gl')]));
    gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
    gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(pr, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    var sc = { cv: cv, gl: gl, uR: gl.getUniformLocation(pr, 'r'), uT: gl.getUniformLocation(pr, 't'), vis: true,
      scale: /^ribbon/.test(cv.getAttribute('data-gl')) ? 0.6 : 1,
      /* The hero background runs slower so the moving headline word stays the focus. */
      speed: /^ribbon/.test(cv.getAttribute('data-gl')) ? 0.7 : 1 };
    sc.size = function () {
      cv.width = Math.max(1, cv.clientWidth * sc.scale | 0); cv.height = Math.max(1, cv.clientHeight * sc.scale | 0);
      gl.viewport(0, 0, cv.width, cv.height);
    };
    sc.draw = function (time) { gl.uniform2f(sc.uR, cv.width, cv.height); gl.uniform1f(sc.uT, time * sc.speed); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); };
    sc.size();
    new IntersectionObserver(function (e) { sc.vis = e[0].isIntersecting; tick(); }).observe(cv);
    scenes.push(sc);
  }
  document.querySelectorAll('canvas[data-gl]').forEach(setup);

  var clock = 12, last = null, raf = 0, boost = 0, lastY = window.scrollY;
  /* Scrolling briefly speeds the motion up */
  window.addEventListener('scroll', function () {
    var y = window.scrollY; boost = Math.min(boost + Math.abs(y - lastY) / 160, 1); lastY = y;
  }, { passive: true });
  function frame(now) {
    raf = 0;
    if (last !== null) { var dt = Math.min((now - last) / 1000, 0.1); clock += dt * (1 + boost); boost *= Math.pow(0.05, dt); }
    last = now;
    scenes.forEach(function (sc) { if (sc.vis) sc.draw(clock); });
    tick();
  }
  function tick() {
    var any = scenes.some(function (sc) { return sc.vis; });
    if (!still() && !document.hidden && any) { if (!raf) raf = requestAnimationFrame(frame); }
    else last = null;
  }
  function drawAll() { scenes.forEach(function (sc) { sc.draw(clock); }); }
  window.addEventListener('resize', function () { scenes.forEach(function (sc) { sc.size(); }); drawAll(); });
  document.addEventListener('visibilitychange', tick);
  drawAll();

  // Rotating word in the home headline
  var words = document.querySelectorAll('.word > span'), wi = 0;
  if (words.length > 1) setInterval(function () {
    if (still() || document.hidden) return;
    var c = words[wi]; wi = (wi + 1) % words.length; var n = words[wi];
    c.classList.remove('on'); c.classList.add('off'); n.classList.remove('off'); n.classList.add('on');
    setTimeout(function () { c.classList.remove('off'); }, 500);
  }, 1700);

  /* Hero cycling word: loops through the words in data-cycle. The page HTML holds the first
     word, so search engines get one clean sentence. An OS "reduce motion" setting shows a still frame. */
  var cyc = document.querySelector('[data-cycle]');
  if (cyc) {
    var list = cyc.getAttribute('data-cycle').split('|'), ci = 0;
    setInterval(function () {
      if (still() || document.hidden) return;
      cyc.classList.remove('cyc-in'); cyc.classList.add('cyc-out');
      setTimeout(function () {
        ci = (ci + 1) % list.length;
        cyc.textContent = list[ci];
        cyc.classList.remove('cyc-out'); void cyc.offsetWidth; cyc.classList.add('cyc-in');
      }, 280);
    }, 1800);
  }

  if (reduceMQ.addEventListener) reduceMQ.addEventListener('change', function () { drawAll(); tick(); });
  tick();
})();
