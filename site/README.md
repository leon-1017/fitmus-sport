# Fitmus Sport

Static Astro site for Fitmus Sport, rebuilt from the former WordPress/Avada site. The project is deployed through Cloudflare Pages from the `main` branch of `leon-1017/fitmus-sport`.

## Project layout

- `src/` — Astro pages, layouts, reusable components and content collections.
- `public/` — published images, PDFs and favicon assets.
- `scripts/` — content migration, sitemap generation and build validation tools.
- `reports/` — historical migration and UI audit records.

## Local development

The project requires Node.js `22.12+` within the Node 22 release line. The repository pins `22.23.1` in `.nvmrc`.

```powershell
cd site
npm ci
npx astro dev --background
```

For a production-style verification build, set the confirmed public origin before building:

```powershell
$env:PUBLIC_SITE_URL = 'https://www.fitmus-sport.com'
npm run build
npm run check:seo
npm run check:dist
```

## Deployment

Cloudflare Pages is the deployment target. The Pages project must use `site` as its root directory, `npm run build` as the build command, and `dist` as the output directory.

Before assigning the official domain, configure the Production-only `PUBLIC_SITE_URL` value as `https://www.fitmus-sport.com` and set `NODE_VERSION=22.23.1` for both Production and Preview builds. Full deployment status, verification results, domain cutover steps and rollback guidance are in [DEPLOYMENT.md](./DEPLOYMENT.md).

## Documentation

- [DEPLOYMENT.md](./DEPLOYMENT.md) — current deployment record and operational checklist.
- [reports/content-gap-completion-plan.md](./reports/content-gap-completion-plan.md) — historical content-migration execution plan.
- [reports/remaining-ui-repair-plan.md](./reports/remaining-ui-repair-plan.md) — historical UI repair plan.
