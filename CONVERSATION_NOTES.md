# Migration Notes — fitmus-sport

## Project Goal

Replicate the content and visual structure of [fitmus-sport.com](https://www.fitmus-sport.com/) (a WordPress + Avada + Yoast SEO site) as a static Astro + Tailwind site. **Pursue pixel-perfect visual fidelity** where feasible. No forms, no JavaScript-rendered interactivity, no server-side logic — just static HTML, content collections, and locally-hosted images.

## Source Inventory

| Type | Count | Source |
| --- | --- | --- |
| Products (`avada_portfolio`) | 408 (sitemaps 175 → grew after re-fetch) | `avada_portfolio-sitemap.xml` |
| Posts (`post`) | 176 | `post-sitemap.xml` |
| Static pages | 6 | `page-sitemap.xml` |
| Product category archives | 8 |  |
| Localized images | 690 | `wp-content/uploads/...` |
| Original `fetch-errors` | 0 (all recovered) | `data/fetch-errors.json` |
| Original `image-errors` | 0 (PDFs mapped locally) | `data/image-errors.json` |

The portfolio CPT is not exposed through WP REST (`401 Cannot view post type`), and posts responses do not include `yoast_head`. We therefore render by `curl`-ing the HTML directly (Avada is server-rendered, shortcodes are already expanded), parsing with cheerio, and rewriting image URLs to local paths.

## Key Design Decisions

1. **Static `curl` over Playwright / REST** — WordPress + Avada is server-rendered; one fetch per URL yields the same HTML a browser would render, in much less time and without the memory cost of a headless browser.
2. **Pipeline in Node scripts** — `fetch-sitemaps.mjs → fetch-html.mjs → parse-html.mjs → download-images.mjs → to-collections.mjs`. Every step reads from / writes to disk; the chat session never needs to load raw HTML.
3. **Content Collections (Astro 5/7 `loader: glob`)** — products and posts become Markdown under `site/src/content/{products,posts}`. Static pages stay in JSON for `set:html` rendering.
4. **`entry.id` not `entry.slug`** — Astro's new content-layer API exposes `id` instead of `slug` on glob entries. Using `entry.slug` produces a "Missing parameter" build error.
5. **`render(entry)` import** — `entry.render()` is not a method; import `render` from `astro:content` and call `await render(entry)`.
6. **URL parity preserved** — every WordPress URL still resolves to a static path under `site/dist/...` so 301 redirects are unnecessary.
7. **Images downloaded locally** — original host can be flaky for a dormant site; local copies in `site/public/images/...` keep the build self-contained.
8. **Forms removed** — contact form and PDF-gate form are stripped from any rendered HTML, both at the parsing stage and as a safety net in the Markdown writer.
9. **PDFs mapped to local** — `Fitmus-Product-catalog.pdf` and `Fitmus-Catalog.pdf` are placed in `site/public/` and the image-mapping rewrites the original `wp-content/uploads/...pdf` URLs to them.
10. **Homepage pixel-perfect cloning** — the Avada markup is deeply nested, but we aim for pixel-perfect visual fidelity. We rebuilt the visible hero / sidebar / 3-column / Diverse Product Chain / 4-tile / Featured Products / Professional Section / Ready For New / Latest Products / Footer as Tailwind components, matching the original's colors, spacing, typography, and layout as closely as possible.

## Project Structure

```
E:\Project\fitmus-sport\
├── site/                                # Astro project root
│   ├── astro.config.mjs
│   ├── package.json
│   ├── tailwind config via @tailwindcss/vite
│   ├── public/
│   │   ├── favicon.svg, favicon.ico
│   │   ├── images/                      # 690 downloaded images
│   │   ├── Fitmus-Product-catalog.pdf
│   │   └── Fitmus-Catalog.pdf
│   ├── src/
│   │   ├── content.config.ts            # products + posts collections
│   │   ├── data/pages.json              # static page bodyHtml
│   │   ├── content/
│   │   │   ├── products/*.md            # 408 files
│   │   │   └── posts/*.md               # 176 files
│   │   ├── components/
│   │   │   ├── Sidebar.astro
│   │   │   ├── Hero.astro
│   │   │   ├── Highlights.astro
│   │   │   ├── DiverseProductChain.astro
│   │   │   ├── Categories.astro
│   │   │   ├── Footer.astro
│   │   │   ├── PageContent.astro
│   │   │   ├── ProductCard.astro
│   │   │   ├── Share.astro
│   │   │   └── Header.astro
│   │   ├── layouts/Layout.astro
│   │   ├── pages/
│   │   │   ├── index.astro
│   │   │   ├── [slug].astro
│   │   │   ├── about-fitmus/, contact-us/, fitmus-product/, in-the-news/
│   │   │   ├── product/[slug].astro, product/index.astro
│   │   │   └── products/index.astro, products/[category]/index.astro
│   │   └── styles/global.css
│   ├── scripts/                         # migration pipeline
│   └── .claude/launch.json
├── data/                                # intermediate JSON (gitignored)
├── raw/                                 # original HTML (gitignored)
├── .gitignore
└── CONVERSATION_NOTES.md                # this file
```

## Build & Run

```bash
cd site
npm install                  # if not already
npm run build                # → site/dist (600 pages)
npm run preview              # http://127.0.0.1:4322 (or auto-port)
```

## Migration Pipeline (one-time / refresh)

```bash
cd site
node scripts/fetch-sitemaps.mjs    # 590 URLs → data/url-list.json
node scripts/fetch-html.mjs        # each URL → raw/<type>/<slug>.html
node scripts/parse-html.mjs        # → data/parsed.json
node scripts/download-images.mjs   # → site/public/images/ + data/parsed-local.json
node scripts/to-collections.mjs    # → site/src/content/**/*.md + site/src/data/pages.json
```

Re-running any step is safe: `download-images` skips files that already exist, and `to-collections` removes the target directories before writing.

## What Was Verified

- `npm run build` completes with 600 pages, no errors.
- `dist/` contains no `<form>`, `<input>`, `<textarea>`, `<select>` (grep verified).
- Sidebar, Hero, 3-column highlights, Diverse Product Chain, Categories, Footer all visible in the preview.
- Local preview served at `http://127.0.0.1:4322/` (or auto-port) and inspected via Playwright.

## Known Visual Gaps vs. the Original (To Be Addressed for Pixel-Perfect Fidelity)

These items require additional work to achieve pixel-perfect fidelity:

- **Hero LayerSlider** — The original uses a LayerSlider with multiple slides and CMS-managed captions. Current implementation: single still image with static caption. **TODO:** Implement slider with 3-5 slides, auto-rotation, navigation arrows, and CMS-synced captions.
- **3-Column highlights image quality** — Currently using small (300×201) `box-background{1,2,3}.jpg` images scaled up. **TODO:** Source or generate higher-resolution crops matching the original's visual quality.
- **Categories tile images** — Currently using generic product images. **TODO:** Identify and use the precise four lifestyle photos from the original site's Categories section.
- **Typography matching** — Original uses specific font weights, sizes, and letter-spacing from Avada theme. **TODO:** Audit all text elements against original and adjust Tailwind classes for exact match.
- **Spacing and padding** — Original uses Avada's custom spacing system. **TODO:** Compare section gaps, card paddings, and margins against original and adjust to pixel-perfect values.
- **Color precision** — Original uses specific hex values from Avada theme options. **TODO:** Extract exact color palette from original site CSS and update Tailwind config.
- **Hover states and transitions** — Original has specific hover animations and transition durations. **TODO:** Match hover effects, shadow changes, and transition timings exactly.
- **Mobile responsiveness** — Original has specific breakpoint behaviors. **TODO:** Test at all breakpoints and match original's responsive design exactly.

## Next Steps Worth Considering

1. Deploy via Cloudflare Pages (recommended) — connect this GitHub repo, set build command `cd site && npm install && npm run build`, output dir `site/dist`.
2. Domain cut-over — point `fitmus-sport.com` to the new Pages site; URL structure matches, so SEO should transfer cleanly.
3. Replace the two PDF files in `site/public/` with the latest catalog versions when available.
4. Re-run the migration pipeline periodically if you want to sync new posts/products from the still-live WordPress site.
5. Add a Cloudflare Worker (or `_redirects`) if you discover any URL changes from the original site.
6. Optional: add sitemap.xml and robots.txt to `site/public/`.

## Git / GitHub

- Repo: <https://github.com/leon-1017/fitmus-sport>
- Branch: `main` (tracks `origin/main`)
- Identity used for the initial commit: `leon-1017 <leon-1017@users.noreply.github.com>`
- Git author config: this identity is repo-local (per-commit `-c` flags were used for the first commit). Set a global `user.name` / `user.email` before future commits to avoid repeating them.
