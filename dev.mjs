// Local dev server: rebuilds on save and reloads the browser. No dependencies.
// Usage: npm run dev   (or: node dev.mjs [port])
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { watch, existsSync, statSync, readFileSync } from 'node:fs';
import { join, extname, normalize } from 'node:path';

const PORT = Number(process.argv[2]) || 8080;
const DIST = 'dist';
const WATCH = ['src', 'public', 'build.mjs'];
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon', '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8', '.webmanifest': 'application/manifest+json', '.woff2': 'font/woff2',
};
const RELOAD = '<script>new EventSource("/__reload").onmessage=function(){location.reload()}</script>';

const clients = new Set();
let building = false, again = false;

function build() {
  if (building) { again = true; return; }
  building = true;
  const t = Date.now();
  const p = spawn(process.execPath, ['build.mjs'], { stdio: ['ignore', 'ignore', 'inherit'] });
  p.on('close', (code) => {
    building = false;
    if (code === 0) {
      console.log(`\x1b[32m✓ rebuilt in ${Date.now() - t}ms\x1b[0m`);
      clients.forEach((res) => res.write('data: reload\n\n'));
    } else console.log('\x1b[31m✗ build failed (see error above). Fix it and save again.\x1b[0m');
    if (again) { again = false; build(); }
  });
}

let timer;
for (const w of WATCH) {
  if (!existsSync(w)) continue;
  watch(w, { recursive: statSync(w).isDirectory() }, () => { clearTimeout(timer); timer = setTimeout(build, 120); });
}

createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  if (url === '/__reload') {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
    res.write('\n'); clients.add(res); req.on('close', () => clients.delete(res));
    return;
  }
  let file = normalize(join(DIST, url));
  if (!file.startsWith(normalize(DIST))) { res.writeHead(403).end(); return; }
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  else if (!existsSync(file) && existsSync(file + '.html')) file += '.html';
  let status = 200;
  if (!existsSync(file)) { status = 404; file = join(DIST, '404.html'); }
  if (!existsSync(file)) { res.writeHead(404).end('Not found (is the build finished?)'); return; }
  const type = TYPES[extname(file).toLowerCase()] || 'application/octet-stream';
  let body;
  try { body = readFileSync(file); } catch { res.writeHead(503).end('Rebuilding, refresh in a moment'); return; }
  if (type.startsWith('text/html')) body = body.toString().replace('</body>', RELOAD + '</body>');
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  res.end(body);
}).listen(PORT, () => {
  console.log(`\nArzware dev server: http://localhost:${PORT}`);
  console.log('Watching src/ and public/. Save a file and the browser reloads. Ctrl+C to stop.\n');
});

build();
