/* Arzware globe: dotted Earth turning gently around the Middle East, with arcs travelling
   from Beirut to cities across the Gulf and the region. Canvas 2D, no dependencies.
   Land mask generated from Natural Earth (public domain) via johan/world.geo.json. */
(function () {
  'use strict';
  var cv = document.getElementById('globe');
  if (!cv || !cv.getContext) return;
  var ctx = cv.getContext('2d');
  /* The sphere and land dots barely move, so they are drawn to an offscreen layer
     5 times a second and copied each frame; only the arcs and pins are redrawn. */
  var layer = document.createElement('canvas'), lctx = layer.getContext('2d'), layerKey = null;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var LAND = "-58.5:125:7d|-57:131:83|-55.5:136:88|-54:141:2a.2.61|-52.5:146:2b.2.65|-51:151:2c.3.68|-49.5:156:2d.4.3b.1.2f|-48:161:2f.4.6e|-46.5:165:30.4.71|-45:170:32.4.6e.2.4|-43.5:174:34.3.72.2.3|-42:178:34.5.68.1.c.1.3|-40.5:182:36.6.7a|-39:187:37.6.6c.1.e.2.1|-37.5:190:38.9.68.5.d.1.2|-36:194:3a.8.6a.6.10|-34.5:198:3b.8.1.1.5e.1.9.1.1.7.10|-33:201:3d.a.28.5.31.5.5.a.10|-31.5:205:3e.b.28.6.31.16.f|-30:208:3f.c.27.8.30.17.f|-28.5:211:40.d.26.9.31.16.10|-27:214:41.d.26.a.31.17.10|-25.5:217:42.d.26.b.31.18.10|-24:219:43.e.25.d.5.2.29.17.11|-22.5:222:44.11.23.d.5.3.28.17.12|-21:224:44.13.21.e.5.3.2a.15.9.1.9|-19.5:226:45.13.21.e.6.3.2d.11.14|-18:228:45.14.20.10.5.3.2e.10.13.1.1|-16.5:230:44.16.20.12.3.4.2f.9.2.3.15.1|-15:232:43.18.21.12.4.2.31.6.4.3.d.1.8|-13.5:233:43.18.22.12.5.1.34.4.3.1.18|-12:235:43.1a.21.12.3c.1.1.1.3.1.18|-10.5:236:43.1b.21.11.48.1.13|-9:237:43.1c.20.11.33.1.5.1.9.2.2.1.8.1.c|-7.5:238:42.1e.20.11.2d.4.10.6.16|-6:239:42.1e.20.11.2d.1.14.6.1.2.2.1.10|-4.5:239:42.1d.20.13.2a.2.a.1.8.7.4.1.12|-3:240:43.1a.22.14.29.3.3.4.1.1.1.1.3.2.1.7.19|-1.5:240:42.18.24.16.27.3.3.5.2.2.6.1.1f|0:240:43.13.28.17.25.3.4.5.2a|1.5:240:43.14.27.18.24.2.5.6.6.1.22|3:240:44.12.29.18.22.2.1.1.6.3.2a|4.5:239:44.11.1d.1.8.1c.20.2.1.2.7.3.29|6:239:44.e.1e.8.3.1d.22.2.9.1.4.1.24|7.5:238:41.1.1.d.1f.29.14.1.1b.3.23|9:237:3f.1.1.2.1.b.1f.2a.11.1.1.1.b.1.11.1.23|10.5:236:3e.1.6.6.1.1.1f.2b.11.2.10.2.30|12:235:3d.2.7.1.24.27.15.3.c.1.2.4.2e|13.5:233:3a.4.2c.29.12.3.c.7.9.1.24|15:232:38.6.2b.25.2.5.f.4.b.7.7.1.26|16.5:230:34.7.2d.24.2.7.d.5.8.9.8.1.25|18:228:31.9.7.1.5.1.20.22.2.a.a.7.7.7.9.1.25|19.5:226:f.1.1f.6.3.2.9.2.22.21.3.a.a.7.6.7.2.2.2b|21:224:2e.5.5.2.5.2.24.22.1.d.7.a.3.a.1.1.2b|22.5:222:2e.5.8.3.27.20.2.d.6.1c.3.1.24|24:219:2a.1.1.6.32.1f.2.b.7.1e.26|25.5:217:29.1.1.7.32.1d.2.9.4.24.25|27:214:27.1.1.8.9.1.28.1c.1.9.2.1.1.26.23|28.5:211:28.9.8.1.29.23.1.2a.22|30:208:25.1.1.d.4.1.29.22.1.29.22|31.5:205:24.1.1.12.29.e.3.4.4.32.21|33:201:23.15.28.b.d.30.5.2.1a|34.5:198:21.17.27.a.e.2e.6.3.18|36:194:1f.19.29.6.d.2e.3.2.3.3.15|37.5:190:1e.19.23.4.8.1.3.1.2.c.2.24.3.1.5.1.15|39:187:1d.19.23.4.b.1.2.c.2.22.1.1.2.1.6.1.14|40.5:182:1c.19.22.4.4.1.2.2.1.2.1.1.1.a.2.22.1.3.6.1.13|42:178:1c.1a.1f.5.3.1.1.1.2.5.7.3.3.25.5.1.13|43.5:174:1b.1a.1e.2.1.4.2.2.1.6.5.4.2.28.3.2.11|45:170:1a.1b.1.2.1c.7.1.7.2.6.2.29.14|46.5:165:1a.1b.1d.11.1.5.2.27.13|48:161:1a.17.1.1.3.3.15.41.12|49.5:156:17.1a.1.1.2.1.18.3d.1.1.f|51:151:16.1d.17.3c.1.1.f|52.5:146:13.1.1.13.1.9.13.1.1.3.1.38.5.1.9|54:141:12.1.1.12.2.8.13.1.1.1.4.32.8.1.8|55.5:136:12.12.3.6.15.1.4.2.3.2c.7.2.7|57:131:8.2.7.10.5.5.14.2.5.1.2.2b.6.3.6|58.5:125:8.1.6.f.5.6.18.3.3.29.6.1.6|60:120:4.7.2.f.6.3.1.1.17.4.4.2a.2.2.4|61.5:115:4.18.5.2.7.2.f.4.1.2d.1.3.2|63:109:5.16.6.2.4.3.f.3.1.30|64.5:103:5.15.1.1.1.4.4.3.5.2.8.6.1.28.1|66:98:0.3.1.16.3.1.1.1.2.5.3.1.1.1.7.3.1.2.2.26|67.5:92:0.1.3.15.1.4.2.6.c.6.1.23|69:86:4.b.1.1.1.3.2.1.1.2.4.6.a.5.6.2.1.16.1.2|70.5:80:4.2.9.2.2.6.3.6.b.2.8.1.1.12.5|72:74:b.1.1.2.1.1.1.4.4.6.13.c.3.2.6|73.5:68:b.1.3.4.4.7.e.1.4.7.1.1.2.1.7|75:62:c.1.1.3.4.6.13.4.5.2.5|76.5:56:9.1.2.4.1.8.d.1.5.1.b|78:50:9.1.1.1.1.1.1.7.5.1.16";
  var RAD = Math.PI / 180;

  function vec(lat, lon) { var p = lat * RAD, l = lon * RAD; return [Math.cos(p) * Math.sin(l), Math.sin(p), Math.cos(p) * Math.cos(l), lat, lon]; }

  // Decode land rows (lat:count:runs) into unit vectors
  var dots = [];
  LAND.split('|').forEach(function (row) {
    var parts = row.split(':'), lat = +parts[0], n = +parts[1], runs = parts[2].split('.'), k = 0, land = false;
    runs.forEach(function (r) {
      var len = parseInt(r, 16);
      if (land) for (var i = 0; i < len; i++) dots.push(vec(lat, -180 + (k + i + 0.5) * 360 / n));
      k += len; land = !land;
    });
  });

  var ME = vec(27, 45);
  dots.forEach(function (d) {
    var ang = Math.acos(Math.max(-1, Math.min(1, d[0] * ME[0] + d[1] * ME[1] + d[2] * ME[2]))) / RAD;
    d[5] = Math.max(0, Math.min(1, (24 - ang) / 12));
  });

  var HOME = { name: 'Beirut', lat: 33.89, lon: 35.5 };
  var CITIES = [
    { name: 'Riyadh', lat: 24.71, lon: 46.68, label: 'below' },
    { name: 'Dubai', lat: 25.2, lon: 55.27, label: 'right' },
    { name: 'Jeddah', lat: 21.49, lon: 39.19, label: 'left' },
    { name: 'Doha', lat: 25.29, lon: 51.53 },
    { name: 'Kuwait City', lat: 29.38, lon: 47.98 }
  ];
  var home = vec(HOME.lat, HOME.lon);
  CITIES.forEach(function (c, i) {
    c.v = vec(c.lat, c.lon);
    var d = Math.acos(Math.max(-1, Math.min(1, home[0] * c.v[0] + home[1] * c.v[1] + home[2] * c.v[2])));
    c.ang = d; c.offset = i * 0.9; c.speed = 1 / 4.5;
  });

  function slerp(a, b, ang, t) {
    if (ang < 1e-6) return a;
    var s = Math.sin(ang), wa = Math.sin((1 - t) * ang) / s, wb = Math.sin(t * ang) / s;
    return [a[0] * wa + b[0] * wb, a[1] * wa + b[1] * wb, a[2] * wa + b[2] * wb];
  }

  var W, H, R, RS, CX, CY, dpr, ZOOM = 1.75;
  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = cv.clientWidth, h = cv.clientHeight;
    cv.width = Math.max(1, w * dpr | 0); cv.height = Math.max(1, h * dpr | 0);
    W = cv.width; H = cv.height; layer.width = W; layer.height = H; layerKey = null; R = Math.min(W, H) * 0.42; RS = R * ZOOM; CX = W / 2; CY = H * 0.5;
  }

  var lon0, sinT, cosT;
  function rot(v, lift) {
    var c = Math.cos(-lon0 * RAD), s = Math.sin(-lon0 * RAD);
    var x = v[0] * c + v[2] * s, z = -v[0] * s + v[2] * c, y = v[1];
    var y2 = y * cosT - z * sinT, z2 = y * sinT + z * cosT, k = lift || 1;
    return [CX + RS * x * k, CY - RS * y2 * k, z2];
  }

  function draw(t) {
    var tq = Math.floor(t * 5) / 5; // rotation advances in 0.2 s steps (about 0.1 degree each)
    lon0 = 45 + Math.sin(tq * 0.07) * 7;
    var tilt = (27 + Math.sin(tq * 0.05) * 2) * RAD; sinT = Math.sin(tilt); cosT = Math.cos(tilt);
    if (layerKey !== tq) { drawLayer(); layerKey = tq; }
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(layer, 0, 0);
    ctx.save(); ctx.beginPath(); ctx.arc(CX, CY, R - dpr, 0, 7); ctx.clip();
    drawLive(t);
  }

  function drawLayer() {
    var ctx = lctx;
    ctx.clearRect(0, 0, W, H);

    // sphere: flat, no glow or shading
    ctx.fillStyle = '#13292c'; ctx.beginPath(); ctx.arc(CX, CY, R, 0, 7); ctx.fill();
    ctx.save(); ctx.beginPath(); ctx.arc(CX, CY, R - dpr, 0, 7); ctx.clip();

    // land dots, batched into a few paths by colour and brightness (one fill per bucket)
    var dr = Math.max(1, RS / 300), B = 6, cool = [], warm = [];
    for (var b = 0; b < B; b++) { cool.push(new Path2D()); warm.push(new Path2D()); }
    for (var i = 0; i < dots.length; i++) {
      var d = dots[i], p = rot(d);
      if (p[2] <= 0) continue;
      var bi = Math.min(B - 1, p[2] * B | 0), path = (d[5] > 0.5 ? warm : cool)[bi];
      path.moveTo(p[0] + dr, p[1]); path.arc(p[0], p[1], dr, 0, 6.2832);
    }
    for (var q = 0; q < B; q++) {
      var z = (q + 0.5) / B;
      ctx.fillStyle = 'rgba(170,215,208,' + (0.08 + 0.38 * z) + ')'; ctx.fill(cool[q]);
      ctx.fillStyle = 'rgba(255,190,110,' + (0.22 + 0.5 * z) + ')'; ctx.fill(warm[q]);
    }
    ctx.restore();
  }

  function drawLive(t) {

    // arcs: Beirut to each city in turn
    var hp = rot(home), CYCLE = CITIES.length * 0.9 / (1 / 4.5) ;
    CITIES.forEach(function (c) {
      var lift = 0.03 + c.ang * 0.9, N = 48, pts = [];
      for (var j = 0; j <= N; j++) { var u = j / N, v = slerp(home, c.v, c.ang, u); pts.push(rot(v, 1 + lift * Math.sin(Math.PI * u))); }
      ctx.strokeStyle = 'rgba(255,178,63,0.32)'; ctx.lineWidth = 1.2 * dpr; ctx.setLineDash([2 * dpr, 5 * dpr]); ctx.beginPath();
      pts.forEach(function (q, j) { j ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }); ctx.stroke(); ctx.setLineDash([]);
      var prog = reduce ? 1 : (((t + c.offset * 4.5) % CYCLE) / 4.5) * 1.6 - 0.1;
      if (reduce || (prog > 0 && prog < 1.6)) {
        var head = Math.min(Math.max(prog, 0), 1), tail = Math.max(0, head - 0.55);
        var A = Math.floor(tail * N), Bn = Math.ceil(head * N);
        if (prog < 1.35 || reduce) for (var k = A; k < Bn; k++) {
          var f = (k - A) / Math.max(1, Bn - A), fade = prog > 1 && !reduce ? Math.max(0, 1 - (prog - 1) / 0.35) : 1;
          ctx.strokeStyle = 'rgba(255,190,90,' + ((reduce ? 0.7 : 0.1 + 0.9 * f) * fade) + ')';
          ctx.lineWidth = (1.2 + 2.4 * f) * dpr; ctx.lineCap = 'round'; ctx.beginPath();
          ctx.moveTo(pts[k][0], pts[k][1]); ctx.lineTo(pts[k + 1][0], pts[k + 1][1]); ctx.stroke();
        }
        if (!reduce && prog < 1) {
          var hq = pts[Math.round(head * N)];
          ctx.fillStyle = '#ffd99a'; ctx.beginPath(); ctx.arc(hq[0], hq[1], 3 * dpr, 0, 7); ctx.fill();
          ctx.fillStyle = '#fff3dc'; ctx.beginPath(); ctx.arc(hq[0], hq[1], 2.2 * dpr, 0, 7); ctx.fill();
        }
      }
      var cp = rot(c.v);
      if (cp[2] > 0) {
        if (!reduce && prog > 1 && prog < 1.6) {
          var r = (prog - 1) / 0.6; ctx.strokeStyle = 'rgba(255,111,91,' + (0.9 * (1 - r)) + ')'; ctx.lineWidth = 1.5 * dpr;
          ctx.beginPath(); ctx.arc(cp[0], cp[1], (3 + 16 * r) * dpr, 0, 7); ctx.stroke();
        }
        ctx.fillStyle = 'rgba(10,23,26,0.9)'; ctx.beginPath(); ctx.arc(cp[0], cp[1], 4.4 * dpr, 0, 7); ctx.fill();
        ctx.fillStyle = '#ff6f5b'; ctx.beginPath(); ctx.arc(cp[0], cp[1], 2.8 * dpr, 0, 7); ctx.fill();
        if (c.label) label(c.name, cp, c.label);
      }
    });

    // Beirut
    if (hp[2] > 0) {
      var pr = reduce ? 0.5 : (t * 0.45) % 1;
      ctx.strokeStyle = 'rgba(255,178,63,' + (1 - pr) + ')'; ctx.lineWidth = 2 * dpr;
      ctx.beginPath(); ctx.arc(hp[0], hp[1], (5 + 14 * pr) * dpr, 0, 7); ctx.stroke();
      ctx.fillStyle = 'rgba(10,23,26,0.9)'; ctx.beginPath(); ctx.arc(hp[0], hp[1], 7 * dpr, 0, 7); ctx.fill();
      ctx.fillStyle = '#ffb23f'; ctx.beginPath(); ctx.arc(hp[0], hp[1], 4.6 * dpr, 0, 7); ctx.fill();
      label(HOME.name, hp, 'home');
    }
    ctx.restore();
    ctx.strokeStyle = 'rgba(160,230,220,0.18)'; ctx.lineWidth = 1.2 * dpr; ctx.beginPath(); ctx.arc(CX, CY, R, 0, 7); ctx.stroke();
  }

  function label(text, p, where) {
    var strong = where === 'home';
    ctx.font = (strong ? '600 ' : '500 ') + ((strong ? 13 : 12) * dpr) + 'px "DM Sans", system-ui, sans-serif';
    ctx.fillStyle = strong ? '#ffb23f' : 'rgba(255,255,255,0.85)';
    ctx.textBaseline = 'middle';
    var w = ctx.measureText(text).width, x = p[0], y = p[1];
    if (strong) { x -= w + 12 * dpr; y -= 2 * dpr; }
    else if (where === 'below') { x -= w / 2; y += 14 * dpr; }
    else if (where === 'left') { x -= w + 9 * dpr; }
    else if (where === 'above') { x -= w / 2; y -= 14 * dpr; }
    else { x += 9 * dpr; }
    ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 6 * dpr; ctx.fillText(text, x, y); ctx.shadowBlur = 0;
  }

  size();
  window.addEventListener('resize', function () { size(); if (reduce) draw(0); });
  if (reduce) { draw(0); return; }
  var visible = true, t0 = performance.now();
  if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }).observe(cv);
  var last = 0;
  (function frame(now) {
    if (visible && !document.hidden && now - last > 32) { last = now; draw((now - t0) / 1000); }
    requestAnimationFrame(frame);
  })(t0);
})();
