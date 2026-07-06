// scripts/parse-html.mjs
// Parses raw HTML files into structured JSON (title, meta, content, images, etc.)

import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { dirname, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as cheerio from 'cheerio';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(__dirname, '../../data');
const RAW_DIR = resolve(__dirname, '../../raw');

const BASE_URL = 'https://www.fitmus-sport.com';

const CATEGORY_SLUGS = [
  'weight-lifting-equipment',
  'body-weight-gymnastic',
  'strength-condition',
  'crossfit-racks-rigs',
  'strongman-equipment',
  'equipment-storage',
  'balance-mobility',
  'cardio-equipment-accessories',
];

function loadHtml(type, slug) {
  const path = resolve(RAW_DIR, type, `${slug}.html`);
  return readFile(path, 'utf8');
}

function extractMeta($) {
  const title = $('title').first().text().trim() || null;
  const description = $('meta[name="description"]').attr('content')?.trim() || null;
  const ogImage = $('meta[property="og:image"]').attr('content')?.trim() || null;
  const canonical = $('link[rel="canonical"]').attr('href')?.trim() || null;
  const h1 = $('h1').first().text().trim() || null;
  return { title, description, ogImage, canonical, h1 };
}

function pickImageSrc($el) {
  const src = $el.attr('src');
  const dataSrc = $el.attr('data-src');
  // Avada lazy-load uses an SVG placeholder in src and the real image in data-src
  if (src && src.startsWith('data:image/svg') && dataSrc) return dataSrc;
  if (src && !src.startsWith('data:')) return src;
  if (dataSrc && !dataSrc.startsWith('data:')) return dataSrc;
  return src || dataSrc;
}

function isUsefulImage(src) {
  if (!src) return false;
  if (src.startsWith('data:')) return false;
  if (src.includes('spacer.gif')) return false;
  if (src.includes('blank.gif')) return false;
  if (src.includes('placeholder')) return false;
  return true;
}

function absoluteUrl(src) {
  if (!src || src.startsWith('data:')) return src;
  if (src.startsWith('http://') || src.startsWith('https://')) return src;
  if (src.startsWith('//')) return `https:${src}`;
  if (src.startsWith('/')) return `${BASE_URL}${src}`;
  return `${BASE_URL}/${src}`;
}

function extractContent($, selectors) {
  for (const selector of selectors) {
    const el = $(selector).first();
    if (el.length && el.text().trim().length > 50) {
      return el.html().trim();
    }
  }
  return null;
}

function parseProduct($, meta) {
  // Avada portfolio uses .project-description.post-content for the main body
  const selectors = [
    '.project-description.post-content',
    '.post-content',
    '.fusion-text',
    '.fusion-content-tb',
    '.fusion-builder-row-1',
    '#content',
    'main',
  ];
  const bodyHtml = extractContent($, selectors);

  // Gallery images: main product image (first useful image in main content or hero)
  const gallery = [];
  const candidates = $('.project-description .wp-post-image, .project-description img, .images img, .woocommerce-product-gallery__image img, .fusion-imageframe img, .wp-post-image');
  candidates.each((_, el) => {
    const $el = $(el);
    const src = pickImageSrc($el);
    if (isUsefulImage(src)) {
      gallery.push(absoluteUrl(src));
    }
    // If wrapped in a link, also consider the link target as a larger image
    const parentHref = $el.closest('a').attr('href');
    if (parentHref && /\.(jpg|jpeg|png|gif|webp|avif)(\?.*)?$/i.test(parentHref)) {
      gallery.push(absoluteUrl(parentHref));
    }
  });

  // Related projects
  const related = [];
  $('.related-products h3 a, .related-posts h3 a, .related-works h3 a, [class*="related"] h3 a').each((_, el) => {
    const href = $(el).attr('href');
    if (href && href.includes('/product/')) {
      related.push({ title: $(el).text().trim(), url: absoluteUrl(href) });
    }
  });

  // Category from article class (portfolio_category-<slug>) or nav current state
  let category = null;
  const articleClass = $('article[id^="post-"]').attr('class') || '';
  for (const cat of CATEGORY_SLUGS) {
    if (articleClass.includes(`portfolio_category-${cat}`)) {
      category = cat;
      break;
    }
  }
  if (!category) {
    const current = $('.current-menu-parent a[href*="/products/"], .current-menu-item a[href*="/products/"]').first().attr('href');
    if (current) {
      category = new URL(current, BASE_URL).pathname.split('/').filter(Boolean).pop();
    }
  }

  return {
    ...meta,
    type: 'product',
    bodyHtml,
    gallery: [...new Set(gallery)],
    related: [...new Map(related.map((r) => [r.url, r])).values()],
    category,
  };
}

function parsePost($, meta) {
  const selectors = [
    '.post-content',
    '.entry-content',
    '.fusion-text',
    '#content article',
    'main article',
    '#content',
    'main',
  ];
  const bodyHtml = extractContent($, selectors);

  const categories = [];
  $('.post-meta a[href*="/category/"], .entry-meta a[href*="/category/"], a[rel="category tag"]').each((_, el) => {
    const href = $(el).attr('href');
    if (href) categories.push(new URL(href, BASE_URL).pathname.split('/').filter(Boolean).pop());
  });

  return {
    ...meta,
    type: 'post',
    bodyHtml,
    categories: [...new Set(categories)],
  };
}

function parsePage($, meta) {
  const selectors = [
    '.post-content',
    '.entry-content',
    '.fusion-text',
    '#content',
    'main',
  ];
  const bodyHtml = extractContent($, selectors);
  return {
    ...meta,
    type: 'page',
    bodyHtml,
  };
}

async function parseItem(item) {
  let html;
  try {
    html = await loadHtml(item.type, item.slug);
  } catch (err) {
    return { url: item.url, error: `Failed to read raw HTML: ${err.message}` };
  }

  const $ = cheerio.load(html);
  const meta = extractMeta($);

  // Resolve ogImage to absolute
  if (meta.ogImage) meta.ogImage = absoluteUrl(meta.ogImage);

  let parsed;
  switch (item.type) {
    case 'product':
      parsed = parseProduct($, meta);
      break;
    case 'post':
      parsed = parsePost($, meta);
      break;
    case 'page':
      parsed = parsePage($, meta);
      break;
    default:
      parsed = parsePage($, meta);
  }

  return {
    url: item.url,
    slug: item.slug,
    type: item.type,
    category: item.category,
    ...parsed,
  };
}

async function main() {
  const list = JSON.parse(await readFile(resolve(DATA_DIR, 'url-list.json'), 'utf8'));
  const parsedDir = resolve(DATA_DIR, 'parsed');
  await mkdir(parsedDir, { recursive: true });

  const results = [];
  const errors = [];

  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    if ((i + 1) % 50 === 0) console.log(`Parsed ${i + 1}/${list.length}`);
    try {
      const parsed = await parseItem(item);
      if (parsed.error) {
        errors.push(parsed);
      } else {
        results.push(parsed);
      }
    } catch (err) {
      errors.push({ url: item.url, error: err.message });
    }
  }

  await writeFile(resolve(DATA_DIR, 'parsed.json'), JSON.stringify(results, null, 2));
  await writeFile(resolve(DATA_DIR, 'parse-errors.json'), JSON.stringify(errors, null, 2));

  // Summary stats
  const stats = { total: list.length, ok: results.length, errors: errors.length };
  for (const r of results) {
    if (!stats[r.type]) stats[r.type] = 0;
    stats[r.type]++;
  }
  console.log('\nParse summary:', stats);
  console.log(`Empty bodyHtml count: ${results.filter((r) => !r.bodyHtml).length}`);
  console.log(`Wrote data/parsed.json and data/parse-errors.json`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
