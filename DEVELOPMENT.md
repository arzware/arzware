# arzware.net: developer notes

The Arzware company website. Static, no dependencies, hosted on Cloudflare.

## Build and preview

```sh
node build.mjs                                  # writes dist/
python3 -m http.server 8080 --directory dist    # preview at http://localhost:8080
```

## Publish (Cloudflare Pages, about 5 minutes)

1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git** → pick `arzware/arzware`.
2. Production branch `main`. Framework preset **None**. Build command `node build.mjs`. Build output directory `dist`.
3. **Save and Deploy.** Then **Custom domains** → add `arzware.net` (and `www.arzware.net`, redirected to the apex).
4. In the domain's DNS, remove any old record that points arzware.net at the previous site so the Pages project takes over.
5. Google Search Console: add the `arzware.net` domain property, then submit `https://arzware.net/sitemap.xml`.

Every push to `main` redeploys automatically.

## Deploy options (Cloudflare)

- **Cloudflare Pages via Git (recommended):** connect this repo, build command `node build.mjs`, output directory `dist`. Every push to `main` deploys.
- **Or Workers:** `npx wrangler deploy` after building. `wrangler.jsonc` serves `./dist` with clean URLs and the custom 404 page.

Security headers and caching live in `public/_headers`. The build keeps the Content-Security-Policy hash for the one inline script (in `src/layout.html`) in sync automatically, and minifies `styles.css` in `dist`. If you add Cloudflare Web Analytics, add `https://static.cloudflareinsights.com` to `script-src` and `https://cloudflareinsights.com` to `connect-src` in the Content-Security-Policy there.

## Where things live

| What | Where |
|---|---|
| Page layout (head, header, footer slots) | `src/layout.html` |
| Header (with announcement bar), footer, closing CTA, logo | `src/partials/` |
| Pages | `src/pages/` (`about.html` becomes `/about/`) |
| The 9 service pages | `src/data/services.mjs` (copy) + `src/service-template.mjs` (layout) |
| Design system | `public/assets/styles.css` |
| Motion (WebGL ribbons and pillar art, rotating word), menu, tabs, contact form | `public/assets/site.js` |
| Social share image and app icons | `public/og-image.png`, `public/icon-*.png`, `public/apple-touch-icon.png` |

Placeholders available in any page or partial: `{{wa}}` (WhatsApp link with prefilled message), `{{waicon}}`, `{{logo}}`, `{{> partial-name}}`. The build fails if a placeholder is left unreplaced.

## SEO built in

- Unique title and meta description per page (`<!--meta {...} -->` at the top of each page; service pages from `src/data/services.mjs`).
- Canonical URLs, Open Graph and Twitter cards with `og-image.png` (1200 × 630).
- Structured data: `ProfessionalService` on every page, `WebSite` and `FAQPage` on Home, `Service` and `FAQPage` on service pages, `BreadcrumbList` on inner pages.
- `sitemap.xml` and `robots.txt` generated at build; the 404 page is `noindex`.

## Rules the copy follows

From `website-decisions.md` and `website-benchmark-and-blueprint.md` in the Arzware Drive:
introduce the company before asking for anything; plain, confident statements; no prices
("we quote after a short conversation"); no founder names, photos or team size; no invented
clients, numbers or testimonials; no compliance claims; Gulf first.

## Before launch

- Privacy and Terms need a lawyer's review (Lebanese Law 81/2018; UAE and Saudi PDPL exposure).
- Founder decisions still open: call length, response-time promise, whether the diagnosis is free or paid, POS position, referral commission disclosure, Digital First Aid scope.
