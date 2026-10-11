// Arzware site builder. No dependencies: run with `node build.mjs`.
// Pages live in src/pages/*.html. Each starts with a meta comment:
//   <!--meta {"title": "...", "description": "...", "nav": "services", "noindex": false} -->
// Partials in src/partials are included with {{> name}}.
// Output goes to dist/ with clean URLs (services.html -> /services/).

import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';

const SITE = 'https://arzware.net';
const SRC = 'src';
const OUT = 'dist';
const VERSION = Date.now().toString(36);

const read = (p) => readFileSync(p, 'utf8');
const partial = (name) => read(join(SRC, 'partials', `${name}.html`)).trim();
const layout = read(join(SRC, 'layout.html'));
const logo = partial('logo');

const org = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: 'Arzware',
  url: SITE,
  logo: `${SITE}/brand/mark-path.svg`,
  email: 'support@arzware.net',
  telephone: '+96181901378',
  address: { '@type': 'PostalAddress', addressLocality: 'Hamra, Beirut', addressCountry: 'LB' },
  areaServed: ['AE', 'SA', 'QA', 'KW', 'BH', 'OM', 'LB'],
  description: 'Business development and digital solutions: research, diagnosis, websites, WhatsApp automation, CRM, AI setup and more.',
};

function pagesIn(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? pagesIn(p) : f.endsWith('.html') ? [p] : [];
  });
}

function urlFor(file) {
  const rel = relative(join(SRC, 'pages'), file).replace(/\\/g, '/');
  if (rel === 'index.html') return '/';
  if (rel === '404.html') return '/404.html';
  if (rel.endsWith('/index.html')) return `/${rel.slice(0, -'index.html'.length)}`;
  return `/${rel.replace(/\.html$/, '')}/`;
}

function outFor(url) {
  if (url === '/404.html') return join(OUT, '404.html');
  return join(OUT, url, 'index.html');
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
cpSync('public', OUT, { recursive: true });

const sitemap = [];

for (const file of pagesIn(join(SRC, 'pages'))) {
  let src = read(file);
  const m = src.match(/^<!--meta\s+([\s\S]*?)\s*-->/);
  if (!m) throw new Error(`Missing meta comment in ${file}`);
  const meta = JSON.parse(m[1]);
  src = src.slice(m[0].length);

  const url = urlFor(file);
  const canonical = `${SITE}${url === '/404.html' ? '/' : url}`;
  const noindex = meta.noindex || url === '/404.html';

  let content = src.replace(/\{\{>\s*([\w-]+)\s*\}\}/g, (_, n) => partial(n));
  let header = partial('header').replace(/\{\{cur:(\w+)\}\}/g, (_, k) => (k === meta.nav ? ' aria-current="page"' : ''));

  const html = layout
    .replace('{{header}}', header)
    .replace('{{footer}}', partial('footer'))
    .replace('{{content}}', content.trim())
    .replaceAll('{{logo}}', logo)
    .replaceAll('{{title}}', meta.title)
    .replaceAll('{{description}}', meta.description)
    .replaceAll('{{canonical}}', canonical)
    .replaceAll('{{robots}}', noindex ? 'noindex, follow' : 'index, follow')
    .replaceAll('{{lang}}', meta.lang || 'en')
    .replaceAll('{{dir}}', meta.dir || 'ltr')
    .replaceAll('{{version}}', VERSION)
    .replace('{{jsonld}}', JSON.stringify(org));

  const out = outFor(url);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html);
  if (!noindex) sitemap.push(canonical);
  console.log(`built ${url}`);
}

const today = new Date().toISOString().slice(0, 10);
writeFileSync(
  join(OUT, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemap
    .map((u) => `  <url><loc>${u}</loc><lastmod>${today}</lastmod></url>`)
    .join('\n')}\n</urlset>\n`
);
if (!existsSync(join(OUT, 'robots.txt'))) {
  writeFileSync(join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`);
}
console.log(`done: ${sitemap.length} pages in sitemap`);
