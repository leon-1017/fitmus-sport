// scripts/fetch-sitemaps.mjs
// Reads WordPress sitemap_index.xml and all sub-sitemaps, classifies URLs,
// and writes a sorted JSON list to ../../data/url-list.json

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(__dirname, '../../data');
const SITEMAP_INDEX = 'https://www.fitmus-sport.com/sitemap_index.xml';

const CATEGORY_SLUGS = new Set([
  'weight-lifting-equipment',
  'body-weight-gymnastic',
  'strength-condition',
  'crossfit-racks-rigs',
  'strongman-equipment',
  'equipment-storage',
  'balance-mobility',
  'cardio-equipment-accessories',
]);

async function fetchXml(url) {
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

function parseUrls(xml) {
  const matches = xml.matchAll(/<loc>([^<]+)<\/loc>/g);
  return [...matches].map((m) => m[1].trim());
}

function classifyUrl(url) {
  const parsed = new URL(url);
  const path = parsed.pathname.replace(/\/$/, ''); // strip trailing slash for classification
  const segments = path.split('/').filter(Boolean);

  // Portfolio / product detail
  if (segments[0] === 'product' && segments.length === 2) {
    return { type: 'product', category: null };
  }

  // Product category archive
  if (segments[0] === 'products' && segments.length === 2) {
    const cat = segments[1];
    if (CATEGORY_SLUGS.has(cat)) {
      return { type: 'category', category: cat };
    }
    return { type: 'page', category: null };
  }

  // Product root archive
  if (segments[0] === 'product' && segments.length === 1) {
    return { type: 'page', category: null };
  }

  // Static pages we explicitly know
  const staticSlugs = new Set([
    'about-fitmus',
    'fitmus-product',
    'in-the-news',
    'contact-us',
  ]);
  if (segments.length === 1 && staticSlugs.has(segments[0])) {
    return { type: 'page', category: null };
  }

  // Blog posts: either /YYYY-MM-DD-slug/ or top-level article style (REST returned 174 posts;
  // sitemap has a mix of /20xx-... and short slugs). Treat non-product non-page as post.
  if (segments.length >= 1) {
    return { type: 'post', category: null };
  }

  return { type: 'page', category: null };
}

async function main() {
  await mkdir(DATA_DIR, { recursive: true });

  const indexXml = await fetchXml(SITEMAP_INDEX);
  const sitemapUrls = parseUrls(indexXml);

  console.log(`Found ${sitemapUrls.length} sub-sitemaps`);

  const allUrls = [];
  for (const sitemapUrl of sitemapUrls) {
    // Skip attachment sitemaps (images) and author/category archives for now;
    // images are discovered during HTML parsing.
    if (/attachment|author|category|portfolio_category/.test(sitemapUrl)) {
      console.log(`Skipping ${sitemapUrl}`);
      continue;
    }
    try {
      const xml = await fetchXml(sitemapUrl);
      const urls = parseUrls(xml);
      console.log(`  ${sitemapUrl}: ${urls.length} URLs`);
      allUrls.push(...urls);
    } catch (err) {
      console.error(`Failed ${sitemapUrl}: ${err.message}`);
    }
  }

  const items = allUrls
    .filter((url) => url.startsWith('https://www.fitmus-sport.com/'))
    .map((url) => {
      const { type, category } = classifyUrl(url);
      const parsed = new URL(url);
      const slug = parsed.pathname.replace(/\/$/, '').split('/').pop() || 'index';
      return {
        url,
        type,
        slug,
        category,
        path: parsed.pathname,
      };
    })
    .sort((a, b) => a.url.localeCompare(b.url));

  // Deduplicate by URL
  const seen = new Set();
  const unique = items.filter((it) => {
    if (seen.has(it.url)) return false;
    seen.add(it.url);
    return true;
  });

  const counts = {};
  for (const it of unique) {
    counts[it.type] = (counts[it.type] || 0) + 1;
  }

  await writeFile(resolve(DATA_DIR, 'url-list.json'), JSON.stringify(unique, null, 2));
  console.log(`\nWrote ${unique.length} unique URLs to data/url-list.json`);
  console.log('Counts:', counts);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
