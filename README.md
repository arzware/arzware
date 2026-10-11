# arzware.net

The Arzware company website. Static, no dependencies, hosted on Cloudflare.

## Build and preview

```sh
node build.mjs                                  # writes dist/ (for deployment)
PREVIEW=1 node build.mjs                        # writes dist-preview/ with relative links (open from any folder)
python3 -m http.server 8080 --directory dist    # preview at http://localhost:8080
```

## Deploy (Cloudflare)

- **Workers (current config):** `npx wrangler deploy` after building. `wrangler.jsonc` serves `./dist` with clean URLs and the custom 404 page.
- **Or Cloudflare Pages via Git:** build command `node build.mjs`, output directory `dist`.

## Pages

| URL | Purpose |
|---|---|
| `/` | Introduces Arzware first, then the services layer, method, beliefs, where we work, research, community, FAQ, and one invitation at the end |
| `/services/` and 9 service pages | What we do, grouped: Understand · Get found and sell · Run the business · Keep it healthy · On request |
| `/how-we-work/` | The five-step method, a sample diagnosis (labelled), build or connect, principles |
| `/industries/` | Cafés and restaurants, food chains, tech companies, community organisations, other growing businesses |
| `/research/` | Research notes (in preparation) and the Lab (proposed tools) |
| `/digital-first-aid/` | Community programme |
| `/about/` | The name, who we are, mission, values, who we won't work with |
| `/contact/` | Three ways to reach us, what happens next |
| `/privacy/`, `/terms/`, `404` | Legal and error pages |

Later: a Work page for case studies (once clients agree), Join our network, and `/ar/` (Arabic).

## Where things live

| What | Where |
|---|---|
| Page layout (head, header, footer slots) | `src/layout.html` |
| Header, footer, closing invitation, logo | `src/partials/` |
| Pages | `src/pages/` (`about.html` becomes `/about/`) |
| Service pages | `src/data/services.mjs` (copy) + `src/service-template.mjs` (layout) |
| Design system ("Dusk to Day") | `public/assets/styles.css` |
| Menu, reveal, method, hero animation | `public/assets/site.js` |

Placeholders in any page or partial: `{{wa}}` (WhatsApp link with prefilled message), `{{waicon}}`, `{{logo}}`, `{{> partial-name}}`. The build fails if a placeholder is left unreplaced.

## Design system: Dusk to Day

Dark dusk hero, page heads and footer; warm light reading sections. Checked contrast (WCAG 2.2 AA):

| Token | Hex | Use |
|---|---|---|
| night | `#11272A` | Hero, page heads, footer |
| on-night | `#EDE8DF` | Text on night (12.8:1) |
| on-night-2 | `#A8BDB8` | Secondary text on night (7.9:1) |
| shell | `#F6F3EE` | Reading background |
| ink | `#12292C` | Text on shell (13.8:1) |
| ink-2 | `#4E6366` | Secondary text (5.8:1) |
| saffron | `#F2A93B` | Fills only; ink on saffron 7.6:1 |
| saffron-soft | `#F5B04A` | Accent text on night (8.3:1) |
| saffron-deep | `#8A5A00` | Accent text on shell (5.4:1) |
| sea | `#256A62` | Links on shell (5.7:1) |
| rose | `#D9677E` / `#E98A9B` | Decoration / on night (6.4:1) |

Type: Unbounded (English headings) + IBM Plex Sans (body). For Arabic, `:lang(ar)` switches to Alexandria + IBM Plex Sans Arabic (Unbounded has no Arabic). Layout uses CSS logical properties so `/ar/` can mirror with `dir="rtl"`.

Motion: the hero's dusk field runs only on screen, has a pause button, and shows a still image with reduced motion. No rotating words, counters, carousels or marquees.

## Rules the copy follows

From `website-decisions.md` and the website brief in the Arzware Drive: introduce the company before asking for anything; contact in the header and once near the end of key pages; no prices ("we quote after we understand your business"); no founder names, photos or team size; no invented clients, numbers, testimonials, partnerships or badges; no compliance claims; Gulf first, Lebanon second.

## Before launch

- Privacy and Terms need a lawyer's review (Lebanese Law 81/2018; UAE and Saudi PDPL exposure).
- Add `og-image.png` (1200×630) to `public/`.
- Founder decisions still open: see the list in the latest report (scope wording for packages, Digital First Aid scope, Lab tools, research notes, account ownership wording).
