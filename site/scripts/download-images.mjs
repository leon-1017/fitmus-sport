// scripts/download-images.mjs
// Downloads all referenced images from data/parsed.json into public/images/
// and rewrites remote URLs to local paths in data/parsed-local.json.
// Robust version: streams to disk, skips existing files, limits concurrency.

import { createWriteStream } from 'node:fs';
import { readFile, writeFile, access, mkdir } from 'node:fs/promises';
import { dirname, resolve, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { Readable } from 'node:stream';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(__dirname, '../../data');
const IMAGES_DIR = resolve(__dirname, '../../site/public/images');

const CONCURRENCY = 4;
const MAX_BYTES = 8 * 1024 * 1024; // skip files larger than 8 MB

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function normalizeUrl(url) {
  if (!url) return url;
  if (url.startsWith('//')) return `https:${url}`;
  return url;
}

function localPathForImage(url) {
  try {
    const u = new URL(url);
    let pathname = u.pathname.replace(/^\/wp-content\/uploads\//, '');
    pathname = pathname.replace(/\?.*$/, '');
    if (!extname(pathname)) pathname += '.jpg';
    const safe = pathname.replace(/[^a-zA-Z0-9_/.-]/g, '_');
    return `images/${safe}`;
  } catch {
    const hash = createHash('sha256').update(url).digest('hex').slice(0, 16);
    const ext = extname(url.split('?')[0]) || '.jpg';
    return `images/${hash}${ext}`;
  }
}

function publicPath(localPath) {
  return '/' + localPath;
}

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function downloadImage(url, localPath) {
  const outPath = resolve(__dirname, '../../site/public', localPath);
  if (await exists(outPath)) {
    return { ok: true, skipped: true };
  }

  let res;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      redirect: 'follow',
      signal: controller.signal,
    });
    clearTimeout(timeout);
  } catch (err) {
    return { ok: false, error: err.message };
  }

  if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };

  const contentLength = res.headers.get('content-length');
  if (contentLength && parseInt(contentLength, 10) > MAX_BYTES) {
    return { ok: false, error: 'too large' };
  }

  try {
    await mkdir(dirname(outPath), { recursive: true });
    const nodeStream = Readable.fromWeb(res.body);
    await new Promise((resolvePromise, reject) => {
      nodeStream
        .pipe(createWriteStream(outPath))
        .on('finish', resolvePromise)
        .on('error', reject);
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: `write error: ${err.message}` };
  }
}

function collectImageUrls(item) {
  const urls = new Set();
  if (item.featuredImage) urls.add(normalizeUrl(item.featuredImage));
  if (item.ogImage) urls.add(normalizeUrl(item.ogImage));
  (item.gallery || []).forEach((u) => urls.add(normalizeUrl(u)));
  if (item.bodyHtml) {
    const matches = item.bodyHtml.matchAll(/(src|data-src|href)="([^"]+)"/g);
    for (const m of matches) {
      const val = m[2];
      if (/\.(jpg|jpeg|png|gif|webp|avif|svg)(\?.*)?$/i.test(val) || val.includes('/wp-content/uploads/')) {
        urls.add(normalizeUrl(val));
      }
    }
  }
  return [...urls].filter((u) => u && (u.startsWith('http://') || u.startsWith('https://')));
}

function rewriteHtml(html, mapping) {
  if (!html) return html;
  let out = html;
  for (const [remote, local] of Object.entries(mapping)) {
    const escaped = remote.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    out = out.replace(new RegExp(`(src|data-src|href)="${escaped}"`, 'g'), `$1="${local}"`);
  }
  return out;
}

async function processOne(task, mapping, errors, stats) {
  const result = await downloadImage(task.url, task.localPath);
  if (result.ok) {
    mapping[task.url] = publicPath(task.localPath);
    if (result.skipped) stats.skipped++;
    else stats.downloaded++;
  } else {
    errors.push({ url: task.url, error: result.error });
    stats.failed++;
  }
}

async function runTasks(tasks, mapping, errors, stats) {
  let index = 0;
  async function worker() {
    while (index < tasks.length) {
      const task = tasks[index++];
      await processOne(task, mapping, errors, stats);
      if (index % 50 === 0) {
        console.log(`  ${index}/${tasks.length} images processed (downloaded ${stats.downloaded}, skipped ${stats.skipped}, failed ${stats.failed})`);
      }
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
}

async function main() {
  const parsed = JSON.parse(await readFile(resolve(DATA_DIR, 'parsed.json'), 'utf8'));

  const urlMap = new Map();
  for (const item of parsed) {
    for (const url of collectImageUrls(item)) {
      if (!urlMap.has(url)) {
        urlMap.set(url, localPathForImage(url));
      }
    }
  }

  console.log(`Found ${urlMap.size} unique image URLs`);

  const pdfMapping = {
    'https://fitmus-sport.com/wp-content/uploads/2019/03/Fitmus-Product-catalog.pdf': '/Fitmus-Product-catalog.pdf',
    'https://www.fitmus-sport.com/wp-content/uploads/2019/03/Fitmus-Product-catalog.pdf': '/Fitmus-Product-catalog.pdf',
    'https://fitmus-sport.com/wp-content/uploads/2016/04/Fitmus-Catalog.pdf': '/Fitmus-Catalog.pdf',
    'https://www.fitmus-sport.com/wp-content/uploads/2016/04/Fitmus-Catalog.pdf': '/Fitmus-Catalog.pdf',
  };
  for (const url of Object.keys(pdfMapping)) urlMap.delete(url);

  const mapping = { ...pdfMapping };
  const errors = [];
  const stats = { downloaded: 0, skipped: 0, failed: 0 };

  const tasks = [...urlMap.entries()].map(([url, localPath]) => ({ url, localPath }));

  await runTasks(tasks, mapping, errors, stats);

  const localParsed = parsed.map((item) => ({
    ...item,
    featuredImage: item.featuredImage ? mapping[normalizeUrl(item.featuredImage)] || item.featuredImage : undefined,
    ogImage: item.ogImage ? mapping[normalizeUrl(item.ogImage)] || item.ogImage : undefined,
    gallery: (item.gallery || []).map((u) => mapping[normalizeUrl(u)] || u),
    bodyHtml: rewriteHtml(item.bodyHtml, mapping),
  }));

  await writeFile(resolve(DATA_DIR, 'parsed-local.json'), JSON.stringify(localParsed, null, 2));
  await writeFile(resolve(DATA_DIR, 'image-mapping.json'), JSON.stringify(mapping, null, 2));
  await writeFile(resolve(DATA_DIR, 'image-errors.json'), JSON.stringify(errors, null, 2));

  console.log(`\nDone. Downloaded: ${stats.downloaded}, Skipped: ${stats.skipped}, Failed: ${stats.failed}`);
  console.log('Wrote data/parsed-local.json, data/image-mapping.json, data/image-errors.json');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
