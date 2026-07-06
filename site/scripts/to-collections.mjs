// scripts/to-collections.mjs
// Converts data/parsed-local.json into Astro Content Collections Markdown files.

import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(__dirname, '../../data');
const CONTENT_DIR = resolve(__dirname, '../../site/src/content');

function frontmatter(obj) {
  const lines = Object.entries(obj).map(([k, v]) => {
    if (v === undefined || v === null) return null;
    if (Array.isArray(v)) {
      if (v.length === 0) return `${k}: []`;
      return `${k}:\n${v.map((x) => `  - ${JSON.stringify(x)}`).join('\n')}`;
    }
    if (typeof v === 'string' && (v.includes('\n') || v.includes('"'))) {
      const escaped = v.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      return `${k}: "${escaped}"`;
    }
    if (typeof v === 'string') return `${k}: "${v}"`;
    return `${k}: ${v}`;
  }).filter(Boolean);
  return '---\n' + lines.join('\n') + '\n---\n';
}

function cleanHtmlBody(html) {
  if (!html) return '';
  return html
    .replace(/<form[\s\S]*?<\/form>/gi, '')
    .replace(/<input[\s\S]*?>/gi, '')
    .replace(/<button[\s\S]*?<\/button>/gi, '')
    .replace(/<textarea[\s\S]*?<\/textarea>/gi, '')
    .replace(/<select[\s\S]*?<\/select>/gi, '')
    .replace(/\n[ \t]+</g, '\n<')
    .replace(/^[ \t]+</gm, '<')
    .trim();
}

async function main() {
  const parsed = JSON.parse(await readFile(resolve(DATA_DIR, 'parsed-local.json'), 'utf8'));

  // Clean target directories
  await rm(resolve(CONTENT_DIR, 'products'), { recursive: true, force: true });
  await rm(resolve(CONTENT_DIR, 'posts'), { recursive: true, force: true });
  await mkdir(resolve(CONTENT_DIR, 'products'), { recursive: true });
  await mkdir(resolve(CONTENT_DIR, 'posts'), { recursive: true });

  let products = 0;
  let posts = 0;
  let pages = 0;

  for (const item of parsed) {
    if (item.error) continue;

    if (item.type === 'product') {
      const fm = {
        title: item.title || item.h1 || item.slug,
        slug: item.slug,
        category: item.category || 'uncategorized',
        date: item.date || undefined,
        seoTitle: item.title || undefined,
        seoDescription: item.description || undefined,
        featuredImage: item.featuredImage || item.ogImage || (item.gallery?.[0]) || undefined,
        gallery: item.gallery || [],
        related: item.related || [],
      };
      await writeFile(resolve(CONTENT_DIR, 'products', `${item.slug}.md`), frontmatter(fm) + '\n' + cleanHtmlBody(item.bodyHtml));
      products++;
    } else if (item.type === 'post') {
      const fm = {
        title: item.title || item.h1 || item.slug,
        slug: item.slug,
        date: item.date || undefined,
        categories: item.categories || [],
        seoTitle: item.title || undefined,
        seoDescription: item.description || undefined,
        featuredImage: item.featuredImage || item.ogImage || undefined,
      };
      await writeFile(resolve(CONTENT_DIR, 'posts', `${item.slug}.md`), frontmatter(fm) + '\n' + cleanHtmlBody(item.bodyHtml));
      posts++;
    } else {
      // Pages are generated as .astro files later; store structured page data for reference
      pages++;
    }
  }

  // Also write pages data for use by page components
  const pagesData = parsed.filter((i) => i.type === 'page' && !i.error).map((i) => ({
    url: i.url,
    slug: i.slug,
    title: i.title || i.h1,
    description: i.description,
    bodyHtml: cleanHtmlBody(i.bodyHtml),
    featuredImage: i.featuredImage || i.ogImage,
  }));
  await writeFile(resolve(DATA_DIR, 'pages.json'), JSON.stringify(pagesData, null, 2));

  const siteDataDir = resolve(__dirname, '../../site/src/data');
  await mkdir(siteDataDir, { recursive: true });
  await writeFile(resolve(siteDataDir, 'pages.json'), JSON.stringify(pagesData, null, 2));

  console.log(`Wrote ${products} products, ${posts} posts, ${pages} pages data.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
