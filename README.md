# arzware.net

The Arzware company website. Static, no dependencies, hosted on Cloudflare.

## Build and preview

```sh
node build.mjs                                  # writes dist/
python3 -m http.server 8080 --directory dist    # preview at http://localhost:8080
```

## Deploy (Cloudflare)

- **Workers (current config):** `npx wrangler deploy` after building. `wrangler.jsonc` serves `./dist` with clean URLs and the custom 404 page.
- **Or Cloudflare Pages via Git:** build command `node build.mjs`, output directory `dist`.

## Where things live

| What | Where |
|---|---|
| Page layout (head, header, footer slots) | `src/layout.html` |
| Header, footer, closing CTA, logo | `src/partials/` |
| Pages | `src/pages/` (`about.html` becomes `/about/`) |
| The 9 service pages | `src/data/services.mjs` (copy) + `src/service-template.mjs` (layout) |
| Design system | `public/assets/styles.css` |
| Hero animation, menu, tabs, contact form | `public/assets/site.js` |

Placeholders available in any page or partial: `{{wa}}` (WhatsApp link with prefilled message), `{{waicon}}`, `{{logo}}`, `{{> partial-name}}`. The build fails if a placeholder is left unreplaced.

## Rules the copy follows

From `website-benchmark-and-blueprint.md` and `website-decisions.md` in the Arzware Drive:
no prices ("we quote after a short conversation"), no founder names, photos or team size,
no invented clients, numbers or testimonials, no compliance claims, Gulf first.

## Before launch

- Privacy and Terms need a lawyer's review (Lebanese Law 81/2018; UAE and Saudi PDPL exposure).
- Add `og-image.png` (1200×630) to `public/`.
- Founder decisions still open: call length, response-time promise, whether the diagnosis is free or paid, POS position, referral commission disclosure, Digital First Aid scope.
