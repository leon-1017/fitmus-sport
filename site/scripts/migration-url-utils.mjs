import * as cheerio from 'cheerio';

const LEGACY_ORIGIN = 'https://www.fitmus-sport.com';
const LEGACY_HOSTS = new Set(['fitmus-sport.com', 'www.fitmus-sport.com']);
const URL_ATTRIBUTES = ['href', 'src', 'data-src', 'poster', 'data-bg', 'data-bg-url'];

function isSkippableUrl(value) {
  return !value || /^(#|data:|mailto:|tel:|javascript:)/i.test(value);
}

function asLegacyUrl(value) {
  if (isSkippableUrl(value)) return null;

  try {
    const url = new URL(value, LEGACY_ORIGIN);
    if (LEGACY_HOSTS.has(url.hostname) || value.startsWith('/')) return url;
  } catch {
    return null;
  }

  return null;
}

function pathKey(url) {
  return `${url.pathname}${url.search}`;
}

export function createImageLookup(mapping = {}) {
  const lookup = new Map();

  for (const [remote, local] of Object.entries(mapping)) {
    try {
      const url = new URL(remote, LEGACY_ORIGIN);
      lookup.set(url.href, local);
      lookup.set(pathKey(url), local);
    } catch {
      lookup.set(remote, local);
    }
  }

  return lookup;
}

export function rewriteLegacyUrl(value, imageLookup = new Map()) {
  const url = asLegacyUrl(value);
  if (!url) return value;

  const localAsset = imageLookup.get(url.href) || imageLookup.get(pathKey(url));
  if (localAsset) return `${localAsset}${url.hash}`;

  if (url.pathname.startsWith('/wp-content/uploads/')) {
    const localPath = url.pathname
      .replace(/^\/wp-content\/uploads\//, '')
      .replace(/[^a-zA-Z0-9_/.-]/g, '_');
    return `/images/${localPath}${url.search}${url.hash}`;
  }

  return `${url.pathname}${url.search}${url.hash}`;
}

export function rewriteLegacyUrlsInText(text, imageLookup = new Map()) {
  if (!text) return text;

  return text.replace(/https?:\/\/(?:www\.)?fitmus-sport\.com\/[^\s"'<>)]*/gi, (value) =>
    rewriteLegacyUrl(value, imageLookup),
  );
}

function rewriteStyleUrls(style, imageLookup) {
  if (!style) return style;

  return style.replace(/url\((['"]?)([^)'"\s]+)\1\)/gi, (_, quote, value) => {
    const rewritten = rewriteLegacyUrl(value, imageLookup);
    return `url(${quote}${rewritten}${quote})`;
  });
}

function isRemoteLegacyUrl(value) {
  return /^https?:\/\/(?:www\.)?fitmus-sport\.com\//i.test(value || '');
}

function promoteLazyImage($, element, imageLookup) {
  const $element = $(element);
  const dataSrc = $element.attr('data-src');
  const src = $element.attr('src');
  const candidate = dataSrc || src;
  const rewritten = rewriteLegacyUrl(candidate, imageLookup);

  if (rewritten && !/^data:image\/svg/i.test(rewritten)) {
    $element.attr('src', rewritten);
  }

  $element.removeAttr('data-src');
  $element.removeAttr('srcset');
  $element.removeAttr('data-srcset');
  $element.removeAttr('sizes');
  $element.removeAttr('data-sizes');

  const classes = ($element.attr('class') || '')
    .split(/\s+/)
    .filter((className) => className && className !== 'lazyload');
  if (classes.length) $element.attr('class', classes.join(' '));
  else $element.removeAttr('class');
}

export function rewriteHtmlFragment(html, imageLookup = new Map()) {
  if (!html) return html;

  const $ = cheerio.load(html, {}, false);

  $('*').each((_, element) => {
    const $element = $(element);

    for (const attribute of URL_ATTRIBUTES) {
      const value = $element.attr(attribute);
      if (value) $element.attr(attribute, rewriteLegacyUrl(value, imageLookup));
    }

    const style = $element.attr('style');
    if (style) $element.attr('style', rewriteStyleUrls(style, imageLookup));

    const background = $element.attr('data-bg') || $element.attr('data-bg-url');
    if (background) {
      const rewritten = rewriteLegacyUrl(background, imageLookup);
      const existingStyle = $element.attr('style') || '';
      if (!/background-image\s*:/i.test(existingStyle)) {
        $element.attr('style', `${existingStyle}${existingStyle && !existingStyle.endsWith(';') ? ';' : ''}background-image:url("${rewritten}");`);
      }
      $element.removeAttr('data-bg');
      $element.removeAttr('data-bg-url');
    }
  });

  $('img').each((_, element) => promoteLazyImage($, element, imageLookup));

  $('source').each((_, element) => {
    const $element = $(element);
    const srcset = $element.attr('srcset') || $element.attr('data-srcset');
    if (isRemoteLegacyUrl(srcset)) $element.remove();
  });

  return rewriteLegacyUrlsInText($.html(), imageLookup);
}

function normalizedInternalPath(pathname) {
  if (pathname === '/') return pathname;
  return pathname.endsWith('/') ? pathname : `${pathname}/`;
}

function hasFileExtension(pathname) {
  return /\/[^/]+\.[^/]+$/.test(pathname);
}

function fallbackPath(pathname) {
  if (pathname.startsWith('/product/') || pathname.startsWith('/products/')) {
    return '/fitmus-product/';
  }
  if (pathname.startsWith('/in-the-news/') || pathname.split('/').filter(Boolean).length === 1) {
    return '/in-the-news/';
  }
  return '/';
}

export function repairInternalLinks(html, knownInternalPaths) {
  if (!html) return html;

  const $ = cheerio.load(html, {}, false);
  $('a[href]').each((_, element) => {
    const $element = $(element);
    const href = $element.attr('href') || '';

    if (href === '#') {
      $element.attr(
        'href',
        ($element.attr('data-target') || '').includes('contact-us') ? '/contact-us/' : '/fitmus-product/',
      );
      return;
    }
    if (!href || href.startsWith('#') || isSkippableUrl(href)) return;

    const url = asLegacyUrl(href);
    if (!url || hasFileExtension(url.pathname)) return;

    const targetPath = normalizedInternalPath(url.pathname);
    if (knownInternalPaths.has(targetPath)) return;

    $element.attr('href', `${fallbackPath(targetPath)}${url.hash}`);
  });

  return $.html();
}
