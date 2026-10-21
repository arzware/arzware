// Arzware site builder. No dependencies: run with `node build.mjs`.
// Pages live in src/pages/*.html. Each starts with a meta comment:
//   <!--meta {"title": "...", "description": "...", "nav": "services", "noindex": false} -->
// Partials in src/partials are included with {{> name}}.
// Output goes to dist/ with clean URLs (services.html -> /services/).
// Service pages (/services/<slug>/) are generated from src/data/services.mjs via src/service-template.mjs.
// Anywhere in a page or partial: {{wa}} = WhatsApp link with prefilled text, {{waicon}} = WhatsApp icon.

import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { createHash } from 'node:crypto';
import { services, renderService } from './src/service-template.mjs';
import { heroCard } from './src/hero-art.mjs';

const SITE = 'https://arzware.net';
const SRC = 'src';
const OUT = 'dist';
const VERSION = Date.now().toString(36);

const read = (p) => readFileSync(p, 'utf8');
const partial = (name) => read(join(SRC, 'partials', `${name}.html`)).trim();
const layout = read(join(SRC, 'layout.html'));
const logo = partial('logo');
const WA = 'https://wa.me/96181901378?text=' + encodeURIComponent("Hi Arzware, I'd like to talk about my business.");
const WA_DFA = 'https://wa.me/96181901378?text=' + encodeURIComponent("Hi Arzware, I'd like to ask about Digital First Aid.");
const WAICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 20.5l1.3-4.2A8.5 8.5 0 1 1 8 19.4z"/><path d="M9 8.6c0 3 2.4 6.4 6.2 6.9l1.2-1.4-1.9-1-1 .8c-1-.4-2-1.4-2.4-2.4l.8-1-1-1.9z"/></svg>';
const SITE_DESCRIPTION = "Arzware researches how a business works, then sets up the websites, WhatsApp assistants, CRM and AI tools it needs. Based in Beirut, working with businesses in Lebanon, the UAE and Saudi Arabia.";

const org = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: 'Arzware',
  url: SITE,
  logo: `${SITE}/icon-512.png`,
  image: `${SITE}/og-image.png`,
  email: 'support@arzware.net',
  telephone: '+96181901378',
  address: { '@type': 'PostalAddress', addressLocality: 'Beirut', addressCountry: 'LB' },
  areaServed: ['LB', 'AE', 'SA'],
  sameAs: ['https://github.com/arzware'],
  contactPoint: [{ '@type': 'ContactPoint', contactType: 'customer support', email: 'support@arzware.net', telephone: '+96181901378', availableLanguage: ['en'] }],
  description: SITE_DESCRIPTION,
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


// Section rhythm: every light section gets white or cream, the opposite of the section above it.
// Dark (bg-ink, proof), saffron (cta-section) and hero sections keep their own colour.
const FIXED = ['hero', 'page-hero', 'bg-ink', 'proof', 'cta-section'];
const TONES = ['bg-white', 'bg-cream', 'bg-warm', 'bg-mist', 'bg-mist2', 'tight'];
function cards(html) {
  return html.replace(/<section class="page-hero"([^>]*)>\s*<div class="wrap">([\s\S]*?)<\/div>\s*<\/section>/g, (_, attrs, inner) => heroCard(attrs, inner.trim()));
}
function rhythm(html) {
  let prev = 'hero';
  return html.replace(/<section class="([^"]*)"/g, (m, cls) => {
    const list = cls.split(/\s+/).filter(Boolean);
    if (list.some((c) => FIXED.includes(c))) {
      prev = list.includes('cta-section') ? 'saffron' : list.some((c) => c === 'hero' || c === 'page-hero') ? 'hero' : 'ink';
      return m;
    }
    const tone = prev === 'white' ? 'cream' : 'white';
    prev = tone;
    return `<section class="${list.filter((c) => !TONES.includes(c)).concat(`bg-${tone}`).join(' ')}"`;
  });
}

const sitemap = [];

function emit(url, meta, body, pageJsonld = []) {
  const canonical = `${SITE}${url === '/404.html' ? '/' : url}`;
  const noindex = meta.noindex || url === '/404.html';
  const expand = (t) => t.replace(/\{\{>\s*([\w-]+)\s*\}\}/g, (_, n) => expand(partial(n)));
  const header = partial('header').replace(/\{\{cur:(\w+)\}\}/g, (_, k) => (k === meta.nav ? ' aria-current="page"' : ''));
  const crumbs = [];
  if (url === '/') {
    crumbs.push({ '@context': 'https://schema.org', '@type': 'WebSite', name: 'Arzware', url: `${SITE}/`, inLanguage: 'en', publisher: { '@type': 'Organization', name: 'Arzware', url: SITE } });
  } else if (url !== '/404.html') {
    const parts = url.split('/').filter(Boolean);
    const items = [{ name: 'Home', item: `${SITE}/` }];
    if (parts[0] === 'services' && parts.length > 1) items.push({ name: 'Services', item: `${SITE}/services/` });
    items.push({ name: meta.crumb || meta.title.split(' · ')[0].split(':')[0], item: canonical });
    crumbs.push({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.map((x, i) => ({ '@type': 'ListItem', position: i + 1, name: x.name, item: x.item })) });
  }
  const extra = (meta.jsonld ? [].concat(meta.jsonld) : []).concat(pageJsonld, crumbs)
    .map((j) => `<script type="application/ld+json">${JSON.stringify(j)}</script>`).join('\n');

  const html = layout
    .replace('{{header}}', () => header)
    .replace('{{footer}}', () => partial('footer'))
    .replace('{{content}}', () => rhythm(cards(expand(body))).trim())
    .replace('{{pagejsonld}}', () => extra)
    .replace('{{pagehead}}', () => (meta.loader ? `<script src="/assets/loader.js?v=${VERSION}"></script>` : ''))
    .replace('{{loader}}', () => (meta.loader ? partial('loader') : ''))
    .replace('{{pagescripts}}', () => (meta.scripts || []).map((src) => `<script src="${src}?v=${VERSION}" defer></script>`).join('\n'))
    .replace('{{jsonld}}', () => JSON.stringify(org))
    .replaceAll('{{logo}}', logo)
    .replaceAll('{{wa-dfa}}', WA_DFA.replace(/'/g, '%27'))
    .replaceAll('{{wa}}', WA.replace(/'/g, '%27'))
    .replaceAll('{{waicon}}', WAICON)
    .replaceAll('{{title}}', meta.title)
    .replaceAll('{{description}}', meta.description.replace(/"/g, '&quot;'))
    .replaceAll('{{canonical}}', canonical)
    .replaceAll('{{robots}}', noindex ? 'noindex, follow' : 'index, follow')
    .replaceAll('{{lang}}', meta.lang || 'en')
    .replaceAll('{{dir}}', meta.dir || 'ltr')
    .replaceAll('{{version}}', VERSION);

  // The 404 page is not a copy of Home: no canonical or og:url.
  const finalHtml = url === '/404.html'
    ? html.replace(/<link rel="canonical"[^>]*>\n/, '').replace(/<meta property="og:url"[^>]*>\n/, '')
    : html;
  const left = finalHtml.match(/\{\{[^}]+\}\}/);
  if (left) throw new Error(`Unreplaced placeholder ${left[0]} in ${url}`);
  const out = outFor(url);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, finalHtml);
  if (!noindex) sitemap.push(canonical);
  console.log(`built ${url}`);
}

for (const file of pagesIn(join(SRC, 'pages'))) {
  const src = read(file);
  const m = src.match(/^<!--meta\s+([\s\S]*?)\s*-->/);
  if (!m) throw new Error(`Missing meta comment in ${file}`);
  emit(urlFor(file), JSON.parse(m[1]), src.slice(m[0].length));
}

for (const s of services) {
  const { meta, content, jsonld } = renderService(s);
  emit(`/services/${s.slug}/`, meta, content, jsonld);
}

// No <lastmod>: the build date is not the date a page's content changed.
writeFileSync(
  join(OUT, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemap
    .map((u) => `  <url><loc>${u}</loc></url>`)
    .join('\n')}\n</urlset>\n`
);
if (!existsSync(join(OUT, 'robots.txt'))) {
  writeFileSync(join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`);
}
// Keep the CSP script hash in dist/_headers in sync with the inline script in the layout.
{
  const inline = (layout.match(/<script>([^<]*)<\/script>/) || [])[1];
  const hp = join(OUT, '_headers');
  if (inline && existsSync(hp)) {
    const hash = createHash('sha256').update(inline).digest('base64');
    writeFileSync(hp, read(hp).replace(/'sha256-[^']+'/, `'sha256-${hash}'`));
  }
}
// Minify the stylesheet in dist (comments and whitespace only; keeps descendant spaces before ':').
{
  const cssPath = join(OUT, 'assets', 'styles.css');
  const before = read(cssPath);
  const min = before
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{};,>])\s*/g, '$1')
    .replace(/:\s+/g, ':')
    .replace(/;}/g, '}')
    .trim();
  writeFileSync(cssPath, min);
  console.log(`css ${before.length} -> ${min.length} bytes`);
}
console.log(`done: ${sitemap.length} pages in sitemap`);
