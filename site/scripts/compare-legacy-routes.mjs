import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const LEGACY_URLS_PATH = resolve(process.cwd(), '../data/url-list.json');
const SITEMAP_PATH = resolve(process.cwd(), 'dist/sitemap.xml');
const REPORT_DIRECTORY = resolve(process.cwd(), 'reports');

function normalizePathname(value) {
  if (value === '/') return value;
  return value.endsWith('/') ? value : `${value}/`;
}

function byType(items) {
  return Object.fromEntries(
    [...new Set(items.map((item) => item.type))]
      .sort()
      .map((type) => [type, items.filter((item) => item.type === type).length]),
  );
}

function redirectTarget(item) {
  if (item.type === 'post') return '/in-the-news/';
  if (item.type === 'product') return '/fitmus-product/';
  return undefined;
}

function markdownList(items) {
  return items.length ? items.map((item) => `- \`${item.path}\` → \`${item.redirectTarget}\``).join('\n') : '- None';
}

async function main() {
  const [legacyContents, sitemap] = await Promise.all([
    readFile(LEGACY_URLS_PATH, 'utf8'),
    readFile(SITEMAP_PATH, 'utf8'),
  ]);
  const legacy = JSON.parse(legacyContents);
  const sitemapPaths = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)]
    .map((match) => normalizePathname(new URL(match[1]).pathname));
  const sitemapPathSet = new Set(sitemapPaths);
  const legacyPathSet = new Set(legacy.map((item) => normalizePathname(item.path)));
  const preserved = legacy.filter((item) => sitemapPathSet.has(normalizePathname(item.path)));
  const missing = legacy
    .filter((item) => !sitemapPathSet.has(normalizePathname(item.path)))
    .map((item) => ({ ...item, redirectTarget: redirectTarget(item) }));
  const unexplainedMissing = missing.filter((item) => !item.redirectTarget);
  const generatedRoutes = sitemapPaths.filter((pathname) => !legacyPathSet.has(pathname));
  const report = {
    sourceUrlCount: legacy.length,
    sitemapUrlCount: sitemapPaths.length,
    preservedUrlCount: preserved.length,
    expectedLegacyOmissions: byType(missing.filter((item) => item.redirectTarget)),
    unexplainedMissing,
    generatedRoutes,
    missing,
  };

  const markdown = `# Legacy URL coverage report\n\n` +
    `Generated from \`data/url-list.json\` and the current public-mode \`dist/sitemap.xml\`.\n\n` +
    `- Source URLs: ${report.sourceUrlCount}\n` +
    `- Sitemap URLs: ${report.sitemapUrlCount}\n` +
    `- Preserved legacy URLs: ${report.preservedUrlCount}\n` +
    `- Expected legacy omissions: ${missing.length} (${Object.entries(report.expectedLegacyOmissions).map(([type, count]) => `${count} ${type}`).join(', ') || 'none'})\n` +
    `- Unexplained missing URLs: ${unexplainedMissing.length}\n` +
    `- Generated catalog routes absent from the legacy list: ${generatedRoutes.length}\n\n` +
    `## Expected legacy omissions\n\n` +
    `The migration has intentionally not recreated source records that are absent from the local collection data. Configure deployment redirects to the listed collection landing pages before retiring the old site. The full machine-readable list is in \`legacy-url-comparison.json\`.\n\n` +
    `### Posts redirect to \`/in-the-news/\`\n\n` +
    markdownList(missing.filter((item) => item.type === 'post')) +
    `\n\n### Products redirect to \`/fitmus-product/\`\n\n` +
    markdownList(missing.filter((item) => item.type === 'product')) +
    `\n\n## Unexplained missing URLs\n\n` +
    (unexplainedMissing.length ? unexplainedMissing.map((item) => `- \`${item.path}\``).join('\n') : '- None') +
    `\n\n## Generated catalog routes\n\n` +
    (generatedRoutes.length ? generatedRoutes.map((pathname) => `- \`${pathname}\``).join('\n') : '- None') +
    `\n`;

  await mkdir(REPORT_DIRECTORY, { recursive: true });
  await Promise.all([
    writeFile(resolve(REPORT_DIRECTORY, 'legacy-url-comparison.json'), `${JSON.stringify(report, null, 2)}\n`),
    writeFile(resolve(REPORT_DIRECTORY, 'legacy-url-comparison.md'), markdown),
  ]);
  console.log(JSON.stringify({ ...report, missing: missing.length }, null, 2));
  if (unexplainedMissing.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
