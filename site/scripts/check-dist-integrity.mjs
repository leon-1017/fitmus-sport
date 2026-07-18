import { readdir, readFile, stat } from 'node:fs/promises';
import { extname, relative, resolve, sep } from 'node:path';
import * as cheerio from 'cheerio';

const LOCAL_ORIGIN = 'https://fitmus.local';
const LEGACY_HOSTS = new Set(['fitmus-sport.com', 'www.fitmus-sport.com']);
const DIST_DIRECTORY = resolve(process.cwd(), process.argv[2] || 'dist');

async function walk(directory) {
  const entries = await readdir(directory);
  const files = [];

  for (const entry of entries) {
    const filePath = resolve(directory, entry);
    if ((await stat(filePath)).isDirectory()) files.push(...(await walk(filePath)));
    else files.push(filePath);
  }

  return files;
}

function toOutputPath(filePath) {
  return `/${relative(DIST_DIRECTORY, filePath).split(sep).join('/')}`;
}

function toPagePath(filePath) {
  const outputPath = toOutputPath(filePath);
  if (outputPath === '/index.html') return '/';
  if (outputPath.endsWith('/index.html')) return outputPath.slice(0, -'index.html'.length);
  return outputPath.slice(0, -'.html'.length);
}

function hasFileExtension(pathname) {
  return Boolean(extname(pathname));
}

function normalizePagePath(pathname) {
  if (pathname === '/') return pathname;
  return pathname.endsWith('/') ? pathname : `${pathname}/`;
}

function parseSrcset(value) {
  return value
    .split(',')
    .map((candidate) => candidate.trim().split(/\s+/)[0])
    .filter(Boolean);
}

function styleUrls(value) {
  return [...value.matchAll(/url\(\s*(['"]?)([^)'"\s]+)\1\s*\)/gi)].map((match) => match[2]);
}

function decodePathname(pathname) {
  try {
    return decodeURIComponent(pathname);
  } catch {
    return pathname;
  }
}

function isSkippable(value) {
  return /^(data:|mailto:|tel:)/i.test(value);
}

async function main() {
  const files = await walk(DIST_DIRECTORY);
  const htmlFiles = files.filter((filePath) => filePath.endsWith('.html'));
  const pagePaths = new Set(htmlFiles.map(toPagePath));
  const outputPaths = new Set(files.map(toOutputPath));
  const issues = [];

  function report(pagePath, attribute, value, reason) {
    issues.push({ pagePath, attribute, value, reason });
  }

  function checkReference(pagePath, attribute, rawValue, referenceType, { allowOfficialMetadata = false } = {}) {
    const value = rawValue.trim();
    if (!value) {
      report(pagePath, attribute, rawValue, 'empty reference');
      return;
    }
    if (/^javascript:/i.test(value)) {
      report(pagePath, attribute, value, 'javascript URL');
      return;
    }
    if (value === '#') {
      report(pagePath, attribute, value, 'placeholder link');
      return;
    }
    if (value.startsWith('#') || isSkippable(value)) return;

    let url;
    try {
      url = new URL(value, `${LOCAL_ORIGIN}${pagePath}`);
    } catch {
      report(pagePath, attribute, value, 'invalid URL');
      return;
    }

    if (LEGACY_HOSTS.has(url.hostname) && allowOfficialMetadata) return;
    if (LEGACY_HOSTS.has(url.hostname)) {
      report(pagePath, attribute, value, 'legacy Fitmus host');
      return;
    }
    if (url.origin !== LOCAL_ORIGIN) return;

    const pathname = decodePathname(url.pathname);
    const expectsFile = referenceType === 'resource' || hasFileExtension(pathname);
    if (expectsFile) {
      if (!outputPaths.has(pathname)) report(pagePath, attribute, value, 'missing local resource');
      return;
    }

    const targetPath = normalizePagePath(pathname);
    if (!pagePaths.has(targetPath)) report(pagePath, attribute, value, 'missing internal page');
  }

  for (const filePath of htmlFiles) {
    const pagePath = toPagePath(filePath);
    const $ = cheerio.load(await readFile(filePath, 'utf8'));

    $('a[href]').each((_, element) => checkReference(pagePath, 'href', $(element).attr('href') || '', 'page'));
    $('link[href]').each((_, element) => {
      const rel = ($(element).attr('rel') || '').toLowerCase().split(/\s+/);
      checkReference(pagePath, 'href', $(element).attr('href') || '', 'resource', {
        allowOfficialMetadata: rel.includes('canonical'),
      });
    });
    $('[src]').each((_, element) => checkReference(pagePath, 'src', $(element).attr('src') || '', 'resource'));
    $('[poster]').each((_, element) => checkReference(pagePath, 'poster', $(element).attr('poster') || '', 'resource'));
    $('[srcset]').each((_, element) => {
      for (const candidate of parseSrcset($(element).attr('srcset') || '')) {
        checkReference(pagePath, 'srcset', candidate, 'resource');
      }
    });
    $('[style]').each((_, element) => {
      for (const candidate of styleUrls($(element).attr('style') || '')) {
        checkReference(pagePath, 'style url()', candidate, 'resource');
      }
    });
  }

  const summary = { htmlPages: htmlFiles.length, checkedFiles: files.length, issues: issues.length };
  console.log(JSON.stringify(summary, null, 2));
  for (const issue of issues) console.error(`${issue.reason}: ${issue.pagePath} ${issue.attribute}=${issue.value}`);
  if (issues.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
