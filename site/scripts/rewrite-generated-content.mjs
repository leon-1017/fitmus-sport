import { readdir, readFile, writeFile } from 'node:fs/promises';
import { basename, dirname, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  createImageLookup,
  repairInternalLinks,
  rewriteHtmlFragment,
  rewriteLegacyUrl,
  rewriteLegacyUrlsInText,
} from './migration-url-utils.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = resolve(__dirname, '../src/content');
const PAGES_PATH = resolve(__dirname, '../src/data/pages.json');
const MAPPING_PATH = resolve(__dirname, '../../data/image-mapping.json');
const LEGACY_URL_PATTERN = /https?:\/\/(?:www\.)?fitmus-sport\.com\//gi;

function splitFrontmatter(source) {
  const match = source.match(/^(---\r?\n[\s\S]*?\r?\n---\r?\n?)([\s\S]*)$/);
  return match ? { frontmatter: match[1], body: match[2] } : { frontmatter: '', body: source };
}

async function markdownFiles(directory) {
  const names = await readdir(directory);
  return names.filter((name) => name.endsWith('.md')).map((name) => resolve(directory, name));
}

function routeForFile(prefix, filePath) {
  return `${prefix}/${basename(filePath, extname(filePath))}/`;
}

async function knownInternalPaths(productFiles, postFiles, pages) {
  const paths = new Set([
    '/',
    '/about-fitmus/',
    '/contact-us/',
    '/fitmus-product/',
    '/in-the-news/',
    '/product/',
    '/products/',
  ]);

  for (const filePath of productFiles) {
    paths.add(routeForFile('/product', filePath));
    const source = await readFile(filePath, 'utf8');
    const category = source.match(/^category:\s*["']?([^"'\r\n]+)/m)?.[1]?.trim();
    if (category) paths.add(`/products/${category}/`);
  }
  for (const filePath of postFiles) paths.add(routeForFile('', filePath));
  for (const page of pages) paths.add(rewriteLegacyUrl(page.url, new Map()));

  return paths;
}

function countLegacyUrls(value) {
  return (value.match(LEGACY_URL_PATTERN) || []).length;
}

async function rewriteMarkdown(filePath, imageLookup, paths) {
  const original = await readFile(filePath, 'utf8');
  const { frontmatter, body } = splitFrontmatter(original);
  const rewritten = rewriteLegacyUrlsInText(
    `${frontmatter}${repairInternalLinks(rewriteHtmlFragment(body, imageLookup), paths)}`,
    imageLookup,
  );

  if (rewritten !== original) await writeFile(filePath, rewritten);
  return { changed: rewritten !== original, before: countLegacyUrls(original), after: countLegacyUrls(rewritten) };
}

async function main() {
  const mapping = JSON.parse(await readFile(MAPPING_PATH, 'utf8'));
  const imageLookup = createImageLookup(mapping);
  const productFiles = await markdownFiles(resolve(CONTENT_DIR, 'products'));
  const postFiles = await markdownFiles(resolve(CONTENT_DIR, 'posts'));
  const files = [...productFiles, ...postFiles];
  const pages = JSON.parse(await readFile(PAGES_PATH, 'utf8'));
  const paths = await knownInternalPaths(productFiles, postFiles, pages);

  const stats = { files: files.length, changedFiles: 0, before: 0, after: 0, pagesChanged: 0 };
  for (const filePath of files) {
    const result = await rewriteMarkdown(filePath, imageLookup, paths);
    stats.changedFiles += Number(result.changed);
    stats.before += result.before;
    stats.after += result.after;
  }

  for (const page of pages) {
    const rewritten = repairInternalLinks(rewriteHtmlFragment(page.bodyHtml, imageLookup), paths);
    const rewrittenUrl = rewriteLegacyUrl(page.url, imageLookup);
    stats.before += countLegacyUrls(page.bodyHtml || '');
    stats.after += countLegacyUrls(rewritten || '');
    if (rewritten !== page.bodyHtml || rewrittenUrl !== page.url) {
      page.bodyHtml = rewritten;
      page.url = rewrittenUrl;
      stats.pagesChanged++;
    }
  }
  await writeFile(PAGES_PATH, `${JSON.stringify(pages, null, 2)}\n`);

  console.log(JSON.stringify(stats, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
