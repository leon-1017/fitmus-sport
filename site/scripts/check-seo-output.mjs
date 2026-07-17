import { readdir, readFile } from 'node:fs/promises';
import { relative, resolve, sep } from 'node:path';
import * as cheerio from 'cheerio';

const DIST_DIRECTORY = resolve(process.cwd(), 'dist');
const site = process.env.PUBLIC_SITE_URL ? new URL(process.env.PUBLIC_SITE_URL) : undefined;

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const filePath = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(filePath)));
    else files.push(filePath);
  }

  return files;
}

function pagePath(filePath) {
  const outputPath = `/${relative(DIST_DIRECTORY, filePath).split(sep).join('/')}`;
  if (outputPath === '/index.html') return '/';
  if (outputPath.endsWith('/index.html')) return outputPath.slice(0, -'index.html'.length);
  return outputPath.slice(0, -'.html'.length);
}

function content($, selector) {
  return $(selector).first().attr('content') || '';
}

async function main() {
  const htmlFiles = (await walk(DIST_DIRECTORY)).filter((filePath) => filePath.endsWith('.html'));
  const indexablePages = htmlFiles.filter((filePath) => pagePath(filePath) !== '/404');
  const issues = [];

  for (const filePath of htmlFiles) {
    const pathname = pagePath(filePath);
    const $ = cheerio.load(await readFile(filePath, 'utf8'));
    const canonical = $('link[rel="canonical"]');
    const robots = content($, 'meta[name="robots"]');

    if (pathname === '/404') {
      if (!robots.includes('noindex')) issues.push(`${pathname}: 404 must be noindex`);
      continue;
    }

    if (!content($, 'meta[name="description"]')) issues.push(`${pathname}: missing description`);
    if (!content($, 'meta[property="og:title"]')) issues.push(`${pathname}: missing Open Graph title`);
    if (!content($, 'meta[property="og:description"]')) issues.push(`${pathname}: missing Open Graph description`);
    if (!content($, 'meta[name="twitter:card"]')) issues.push(`${pathname}: missing Twitter card`);

    if (!site) {
      if (canonical.length) issues.push(`${pathname}: staging output must not include canonical`);
      if (!robots.includes('noindex')) issues.push(`${pathname}: staging output must be noindex`);
      continue;
    }

    const expectedCanonical = new URL(pathname, site).href;
    if (canonical.length !== 1 || canonical.attr('href') !== expectedCanonical) {
      issues.push(`${pathname}: canonical must equal ${expectedCanonical}`);
    }
    if (content($, 'meta[property="og:url"]') !== expectedCanonical) {
      issues.push(`${pathname}: Open Graph URL must equal canonical`);
    }
    if (robots.includes('noindex')) issues.push(`${pathname}: public output must be indexable`);
  }

  const robots = await readFile(resolve(DIST_DIRECTORY, 'robots.txt'), 'utf8');
  if (!site) {
    if (!robots.includes('Disallow: /')) issues.push('staging robots.txt must block crawling');
  } else {
    const sitemapUrl = new URL('/sitemap.xml', site).href;
    if (!robots.includes(`Sitemap: ${sitemapUrl}`)) issues.push('robots.txt is missing the configured sitemap URL');
    const sitemap = await readFile(resolve(DIST_DIRECTORY, 'sitemap.xml'), 'utf8');
    const locations = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
    const expected = indexablePages.map((filePath) => new URL(pagePath(filePath), site).href).sort();
    if (JSON.stringify(locations.sort()) !== JSON.stringify(expected)) {
      issues.push('sitemap.xml does not match all indexable build pages');
    }
  }

  console.log(JSON.stringify({ htmlPages: htmlFiles.length, indexablePages: indexablePages.length, issues: issues.length }, null, 2));
  for (const issue of issues) console.error(issue);
  if (issues.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
