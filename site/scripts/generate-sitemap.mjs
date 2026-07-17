import { readdir, readFile, writeFile } from 'node:fs/promises';
import { relative, resolve, sep } from 'node:path';

const DIST_DIRECTORY = resolve(process.cwd(), 'dist');

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
  if (outputPath.endsWith('.html')) return outputPath.slice(0, -'.html'.length);
  return outputPath;
}

function escapeXml(value) {
  return value.replace(/[<>&'"]/g, (character) => ({
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    "'": '&apos;',
    '"': '&quot;',
  })[character]);
}

function siteUrl() {
  const value = process.env.PUBLIC_SITE_URL;
  return value ? new URL(value) : undefined;
}

async function main() {
  const site = siteUrl();
  const robotsPath = resolve(DIST_DIRECTORY, 'robots.txt');

  if (!site) {
    await writeFile(robotsPath, 'User-agent: *\nDisallow: /\n');
    console.log('PUBLIC_SITE_URL is not set; wrote a blocking robots.txt and skipped sitemap generation.');
    return;
  }

  const pages = (await walk(DIST_DIRECTORY))
    .filter((filePath) => filePath.endsWith('.html'))
    .map(pagePath)
    .filter((pathname) => pathname !== '/404')
    .sort();
  const urls = pages.map((pathname) => new URL(pathname, site).href);
  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map((url) => `  <url><loc>${escapeXml(url)}</loc></url>`),
    '</urlset>',
    '',
  ].join('\n');

  await writeFile(resolve(DIST_DIRECTORY, 'sitemap.xml'), sitemap);
  await writeFile(
    robotsPath,
    `User-agent: *\nAllow: /\n\nSitemap: ${new URL('/sitemap.xml', site).href}\n`,
  );
  console.log(`Generated sitemap.xml with ${urls.length} URLs for ${site.href}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
