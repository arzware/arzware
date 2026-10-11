# arzware.net

The Arzware company website. Static, no dependencies, hosted on Cloudflare.

## Build and preview

```sh
node build.mjs                                  # writes dist/
python3 -m http.server 8080 --directory dist    # preview at http://localhost:8080
```

## Deploy (Cloudflare)

- **Cloudflare Pages via Git (recommended):** connect this repo, build command `node build.mjs`, output directory `dist`. Every push to `main` deploys.
- **Or Workers:** `npx wrangler deploy` after building. `wrangler.jsonc` serves `./dist` with clean URLs and the custom 404 page.

Security headers and caching live in `public/_headers`. If you add Cloudflare Web Analytics, add `https://static.cloudflareinsights.com` to `script-src` and `https://cloudflareinsights.com` to `connect-src` in the Content-Security-Policy there.

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

## Rules the copy follows

From `website-decisions.md` and `website-benchmark-and-blueprint.md` in the Arzware Drive:
introduce the company before asking for anything; plain, confident statements; no prices
("we quote after a short conversation"); no founder names, photos or team size; no invented
clients, numbers or testimonials; no compliance claims; Gulf first.

## Before launch

- Privacy and Terms need a lawyer's review (Lebanese Law 81/2018; UAE and Saudi PDPL exposure).
- Founder decisions still open: call length, response-time promise, whether the diagnosis is free or paid, POS position, referral commission disclosure, Digital First Aid scope.
