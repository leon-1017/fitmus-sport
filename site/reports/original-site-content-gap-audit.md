# Original-site content and asset gap audit

> Audit date: 2026-07-17  
> Scope: compare the current rebuilt public pages with `https://www.fitmus-sport.com/`.  
> Goal: identify missing source content, images and key conversion functions for a later completion pass. This is **not** a pixel-perfect replication checklist.

## Executive summary

The core public experience has been rebuilt: the homepage story, product-category navigation, About Fitmus narrative, product/news archives, contact information and representative product/article pages are present. The strongest remaining gaps are historical records and a handful of source-page conversion/detail components rather than the visual shell.

- The legacy URL comparison identifies **43 products** and **53 news posts** that are absent from the local collections. They currently resolve to collection-level fallbacks rather than equivalent detail pages.
- Two of those missing products are still promoted by the original homepage's featured-product area: `wall-mount-rig` and `wall-mounted-rig-for-crossfit-3-3`.
- The current contact page preserves the source contact copy but deliberately hides the migrated WordPress form markup, leaving no working enquiry path.
- Product detail data can contain gallery images, but the current detail template renders only the featured image and has no related-projects block.

## Method and boundaries

Pages compared: Home, About Fitmus, Fitmus Product, In the News, Contact Us, a category archive, `Portable Gym Workout Timer`, and `Portable WOD Timer`.

Evidence was collected from the live original pages and from the current Astro source, generated local HTML and the existing URL coverage report. The original site's image-heavy visual mega menu, legacy WordPress widget styling, and exact animation/spacing are intentional design divergences: the project now uses a light, text-led reusable top navigation and does not target pixel-level matching.

The original site's contact-map implementation exposes a legacy map-plugin diagnostic. Do not migrate its implementation or any embedded credentials; replace it only with an approved map provider or a simple directions link.

## Confirmed backlog

| ID | Priority | Affected pages | Missing content, asset or function | Later completion action |
| --- | --- | --- | --- | --- |
| G-01 | P1 | Homepage featured products; product details | `Wall Mount Rig` (`/product/wall-mount-rig/`) and `Wall mounted Rig for Crossfit 3-3` (`/product/wall-mounted-rig-for-crossfit-3-3/`) are shown on the original homepage but have no equivalent current detail records. Their original primary images are `14feet-free-standing-rig.jpg` and `wall-mounted-rig-3-3.jpg`. | Import both as complete product records (copy, metadata, category, primary image and any available gallery), then restore their exact legacy paths. These are included in the 43-product total below; do not count them twice. |
| G-02 | P1 | Product archive, category archives, old inbound product links | 43 legacy product records are missing from the local product collection. The current redirects/fallbacks send their source URLs to `/fitmus-product/`. | Use `legacy-url-comparison.json` as the authoritative task list. Recover content and media per product, preserve original slugs, and retain a redirect only where a true replacement is approved. |
| G-03 | P1 | In the News, old inbound article links | 53 legacy news posts are missing from the local post collection. Their source URLs currently fall back to `/in-the-news/`. | Use the post section of `legacy-url-comparison.json`; migrate article body, publish date, featured image, categories and canonical slug before removing the fallback. |
| G-04 | P1 | Contact Us | The original page offers an enquiry form, while the rebuilt page hides the imported WordPress Contact Form 7 markup and has no functional submission path. | Design and implement a real, approved enquiry flow (form validation, spam protection, destination/CRM or mail service, privacy notice and success/error states). Do not expose legacy mail settings. |
| G-05 | P1 | Product details | Product front matter can include a gallery, but the current product template renders only its featured image. Original product pages expose additional product imagery and a gallery interaction. | Render a responsive gallery/lightbox only when source media exists; check whether an image is already in `site/public/images` before fetching it again. |
| G-06 | P1 | Product details | The original product template includes `Related Projects`; the rebuilt product template has no equivalent related-product block. | Add curated or category-based related products, with an explicit per-product override for source relationships. Do not populate it with unrelated items merely to fill the layout. |
| G-07 | P2 | Homepage | The original homepage has a dedicated catalogue-download conversion section and a mailing-list gate. The rebuilt homepage has neither page-level call to action nor download flow. | Confirm whether the catalogue should remain public, gated, or be replaced. If retained, verify the PDF, host it locally/CDN-side, and build an accessible CTA/form flow. Source file: `https://fitmus-sport.com/wp-content/uploads/2019/03/Fitmus-Product-catalog.pdf`. |
| G-08 | P2 | Homepage | The original has a dedicated `WATCH OUR VIDEOS` section with explanatory copy and a YouTube call to action. The rebuilt site only retains a footer-level YouTube link. | Add a compact editorial video section or a stable `/videos/` destination after confirming the desired channel/playlist. No video binary migration is required. |
| G-09 | P2 | Homepage and category discovery | The original product-chain area presents explanatory snippets for all eight product categories. The rebuild exposes all eight category links in navigation, but omits that supporting category copy. | Reuse/adapt the category descriptions on category landing pages or an accessible expandable summary; do not restore the legacy image-heavy mega menu. |
| G-10 | P2 | Contact Us | There is no rebuilt location-map/directions module. The original map integration is unreliable and should not be copied. | Confirm the public address and preferred map provider. Add an accessible static location card plus directions link, or an approved provider integration with credentials managed outside source. |
| G-11 | P2 | News/article details | Original article pages surface recent posts and category navigation alongside the article. The rebuild provides the article and shared sidebar but not the original recent-posts module. | Decide whether editorial discovery belongs in the shared sidebar or below articles; implement a small data-driven recent-posts/category module if retained. |
| G-12 | P2 | Product listing | The original archive has legacy category-filter controls and paginated result behavior. The rebuild has the content archive but not a confirmed equivalent filtering/search experience. | Define the desired catalogue UX first (server-rendered category pages, client filtering, or search). This is a functionality decision, not an image-migration requirement. |

## Page-by-page findings

### Home

Retained: hero message, three capability highlights, product-chain narrative, product category access, featured/latest product content, news highlights and footer contact/social links.

Missing for a later pass: G-01, G-07, G-08 and G-09. The homepage is not missing the new required navigation hierarchy; its simplified light top navigation is the intended current design.

### About Fitmus

The current page retains the main brand narrative and the source themes around quality control, opportunity, foundry and market awareness. No confirmed source-copy or image gap requires a separate task here. Any remaining difference is predominantly layout and presentation, which is out of scope for the non-pixel-perfect goal.

### Fitmus Product and category pages

The archive and category route structure exist, but G-02 means the collection is not content-complete. The 43 missing records should be assigned to their correct categories during migration rather than treated as a generic archive redirect. G-12 can be evaluated after content completeness is restored.

### In the News and article detail

Representative news content and article detail pages are present. G-03 is the content-completeness gap, while G-11 is a lower-priority editorial-discovery enhancement.

### Contact Us

The address, contact details, business-hours and social-contact copy are retained. The important omission is G-04: no live enquiry capture. Treat G-10 as a separate, credential-safe replacement for the unreliable original map.

### Product detail

The key product copy and featured image can render, but G-05 and G-06 mean source image depth and related-product discovery are incomplete. These should be implemented from structured product data rather than by reintroducing WordPress markup.

## Content and asset handling rules for the completion pass

1. Start from [`legacy-url-comparison.json`](./legacy-url-comparison.json) and mark every one of the 96 expected omissions as **migrated**, **approved redirect**, or **intentionally retired**.
2. Before downloading any asset, check whether its normalized version already exists under `site/public/images`; avoid duplicate copies and never hotlink original WordPress images in production.
3. For every migrated product/post, retain the original slug, title, source body, featured image, SEO fields and a source URL note. Recreate only images that are actually referenced by the final page/gallery.
4. Do not copy legacy API keys, WordPress form settings, map scripts or tracking credentials into this repository.
5. Treat image alt text, image dimensions, loading behavior and mobile gallery interaction as part of each product's completion criteria.

## Recommended execution order

1. **G-04:** agree the enquiry destination and ship a functional, protected contact form.
2. **G-01 + G-02:** recover the two homepage-promoted products first, then work through the remaining 41 product records grouped by category.
3. **G-03:** migrate the 53 articles, prioritising inbound links and commercially useful evergreen posts.
4. **G-05 + G-06:** expose verified gallery media and related products as structured detail-page components.
5. **G-07 to G-12:** make the catalogue, video, category-copy, map and discovery UX decisions; implement only the approved variants.

## Completion checks

- Re-run `site/reports/legacy-url-comparison.md` after each migration batch; reduce expected omissions and keep unexplained missing URLs at zero.
- Verify every restored legacy path returns a direct detail page, and every approved redirect has a documented target.
- Confirm all images are served locally or from the approved production asset host; no `fitmus-sport.com/wp-content/uploads` hotlinks remain.
- Test the contact form end-to-end in the deployed environment, including validation, spam handling and successful delivery.
- Check desktop and mobile presentation for product galleries, related-product cards and navigation; exact old WordPress styling is not an acceptance criterion.

## Source references

- [Original home](https://www.fitmus-sport.com/)
- [Original About Fitmus](https://www.fitmus-sport.com/about-fitmus/)
- [Original Fitmus Product archive](https://www.fitmus-sport.com/fitmus-product/)
- [Original In the News archive](https://www.fitmus-sport.com/in-the-news/)
- [Original Contact Us page](https://www.fitmus-sport.com/contact-us/)
- [Current legacy URL coverage report](./legacy-url-comparison.md)
