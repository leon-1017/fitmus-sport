import { access, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { basename, join, relative, resolve, sep } from 'node:path';

const LEGACY_REPORT_PATH = resolve(process.cwd(), 'reports/legacy-url-comparison.json');
const PARSED_LOCAL_PATH = resolve(process.cwd(), '../data/parsed-local.json');
const PUBLIC_DIRECTORY = resolve(process.cwd(), 'public');
const PRODUCTS_DIRECTORY = resolve(process.cwd(), 'src/content/products');
const POSTS_DIRECTORY = resolve(process.cwd(), 'src/content/posts');
const REPORT_DIRECTORY = resolve(process.cwd(), 'reports');
const JSON_REPORT_PATH = resolve(REPORT_DIRECTORY, 'content-gap-inventory.json');
const MARKDOWN_REPORT_PATH = resolve(REPORT_DIRECTORY, 'content-gap-inventory.md');

const ALLOWED_DECISIONS = ['pending', 'migrate', 'approved-redirect', 'retired', 'done'];
const EXPECTED_PRODUCT_CATEGORIES = [
  'weight-lifting-equipment',
  'body-weight-gymnastic',
  'strength-condition',
  'crossfit-racks-rigs',
  'strongman-equipment',
  'equipment-storage',
  'balance-mobility',
  'cardio-equipment-accessories',
];
const HOMEPAGE_PRIORITY_SLUGS = [
  'wall-mount-rig',
  'wall-mounted-rig-for-crossfit-3-3',
];

function countBy(items, selector) {
  return Object.fromEntries(
    [...new Set(items.map(selector))]
      .sort()
      .map((key) => [key, items.filter((item) => selector(item) === key).length]),
  );
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function publicAssetPath(value) {
  if (typeof value !== 'string' || !value.startsWith('/')) return undefined;
  return value.split(/[?#]/, 1)[0];
}

function bodyImagePaths(bodyHtml = '') {
  return unique(
    [...bodyHtml.matchAll(/\b(?:src|data-src)=["'](\/images\/[^"'?#]+)(?:[?#][^"']*)?["']/g)]
      .map((match) => publicAssetPath(match[1])),
  );
}

async function fileExists(pathname) {
  try {
    await access(pathname);
    return true;
  } catch {
    return false;
  }
}

async function markdownSlugs(directory) {
  if (!(await fileExists(directory))) return new Set();
  return new Set(
    (await readdir(directory, { withFileTypes: true }))
      .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
      .map((entry) => basename(entry.name, '.md')),
  );
}

function filesystemPathForPublicAsset(assetPath) {
  return join(PUBLIC_DIRECTORY, ...assetPath.split('/').filter(Boolean));
}

function expectedCollectionPath(type, slug) {
  const directory = type === 'product' ? PRODUCTS_DIRECTORY : POSTS_DIRECTORY;
  return relative(process.cwd(), resolve(directory, `${slug}.md`)).split(sep).join('/');
}

function itemOrder(item) {
  const phaseOrder = { C1: 0, C2: 1, C3: 2 };
  const homepageIndex = HOMEPAGE_PRIORITY_SLUGS.indexOf(item.slug);
  return [
    phaseOrder[item.executionPhase],
    homepageIndex === -1 ? Number.MAX_SAFE_INTEGER : homepageIndex,
    item.category || '',
    item.slug,
  ];
}

function compareItems(left, right) {
  const leftOrder = itemOrder(left);
  const rightOrder = itemOrder(right);
  for (let index = 0; index < leftOrder.length; index += 1) {
    const result = String(leftOrder[index]).localeCompare(String(rightOrder[index]), 'en', { numeric: true });
    if (result) return result;
  }
  return 0;
}

function checklist(items) {
  return items
    .map((item) => `- [ ] \`${item.originalPath}\` — ${item.title} (\`${item.decision}\`; primary image: \`${item.featuredImage.status}\`)`)
    .join('\n');
}

function validationErrors(inventory, sourceIndex) {
  const errors = [];
  const paths = inventory.items.map((item) => item.originalPath);
  const duplicatePaths = paths.filter((path, index) => paths.indexOf(path) !== index);
  const productCategories = new Set(
    inventory.items.filter((item) => item.type === 'product').map((item) => item.category),
  );

  if (inventory.items.length !== 96) errors.push(`Expected 96 records; found ${inventory.items.length}.`);
  if (inventory.summary.byType.product !== 43) errors.push(`Expected 43 products; found ${inventory.summary.byType.product || 0}.`);
  if (inventory.summary.byType.post !== 53) errors.push(`Expected 53 posts; found ${inventory.summary.byType.post || 0}.`);
  if (duplicatePaths.length) errors.push(`Duplicate legacy paths: ${unique(duplicatePaths).join(', ')}`);
  if (sourceIndex.duplicates.length) errors.push(`Duplicate parsed-local keys: ${sourceIndex.duplicates.join(', ')}`);
  if (inventory.items.some((item) => !ALLOWED_DECISIONS.includes(item.decision))) errors.push('Inventory contains an invalid decision.');
  if (inventory.items.some((item) => item.source.status !== 'available')) errors.push('One or more source records are unavailable.');
  if (inventory.items.some((item) => item.body.status !== 'available')) errors.push('One or more source bodies are unavailable.');
  if (inventory.items.some((item) => item.featuredImage.status !== 'available-local')) errors.push('One or more primary images are unavailable locally.');
  if (inventory.items.filter((item) => item.executionPhase === 'C1').length !== 2) errors.push('C1 must contain exactly two products.');
  if (inventory.items.filter((item) => item.executionPhase === 'C2').length !== 41) errors.push('C2 must contain exactly 41 products.');
  if (inventory.items.filter((item) => item.executionPhase === 'C3').length !== 53) errors.push('C3 must contain exactly 53 posts.');
  for (const category of EXPECTED_PRODUCT_CATEGORIES) {
    if (!productCategories.has(category)) errors.push(`Expected product category is absent: ${category}.`);
  }
  for (const category of productCategories) {
    if (!EXPECTED_PRODUCT_CATEGORIES.includes(category)) errors.push(`Unexpected product category: ${category}.`);
  }

  return errors;
}

async function main() {
  const [legacyContents, parsedContents, productSlugs, postSlugs] = await Promise.all([
    readFile(LEGACY_REPORT_PATH, 'utf8'),
    readFile(PARSED_LOCAL_PATH, 'utf8'),
    markdownSlugs(PRODUCTS_DIRECTORY),
    markdownSlugs(POSTS_DIRECTORY),
  ]);
  const legacyReport = JSON.parse(legacyContents);
  const parsedRecords = JSON.parse(parsedContents);
  const sourceRecords = new Map();
  const sourceDuplicates = [];

  parsedRecords.forEach((record, index) => {
    const key = `${record.type}:${record.slug}`;
    if (sourceRecords.has(key)) sourceDuplicates.push(key);
    sourceRecords.set(key, { record, index });
  });

  const items = [];
  for (const missing of legacyReport.missing) {
    const sourceMatch = sourceRecords.get(`${missing.type}:${missing.slug}`);
    const source = sourceMatch?.record;
    const featuredImagePath = publicAssetPath(source?.ogImage);
    const galleryPaths = unique((source?.gallery || []).map(publicAssetPath));
    const inlineImagePaths = bodyImagePaths(source?.bodyHtml);
    const candidateAssetPaths = unique([featuredImagePath, ...galleryPaths, ...inlineImagePaths]);
    const localAssetPaths = [];
    const missingAssetPaths = [];

    for (const assetPath of candidateAssetPaths) {
      if (await fileExists(filesystemPathForPublicAsset(assetPath))) localAssetPaths.push(assetPath);
      else missingAssetPaths.push(assetPath);
    }

    const isHomepagePriority = HOMEPAGE_PRIORITY_SLUGS.includes(missing.slug);
    const collectionSlugs = missing.type === 'product' ? productSlugs : postSlugs;
    const categories = missing.type === 'post' ? unique(source?.categories || []) : [];
    const item = {
      type: missing.type,
      slug: missing.slug,
      originalUrl: missing.url,
      originalPath: missing.path,
      title: source?.title || source?.h1 || missing.slug,
      category: missing.type === 'product' ? source?.category || 'unknown' : null,
      categories,
      executionPhase: isHomepagePriority ? 'C1' : missing.type === 'product' ? 'C2' : 'C3',
      homepagePriority: isHomepagePriority,
      decision: isHomepagePriority ? 'migrate' : 'pending',
      redirectTarget: missing.redirectTarget,
      source: {
        status: source ? 'available' : 'missing',
        file: 'data/parsed-local.json',
        recordIndex: sourceMatch ? sourceMatch.index : null,
      },
      body: {
        status: source?.bodyHtml?.trim() ? 'available' : 'missing',
        characterCount: source?.bodyHtml?.length || 0,
      },
      featuredImage: {
        path: featuredImagePath || null,
        status: !featuredImagePath
          ? 'not-listed'
          : localAssetPaths.includes(featuredImagePath)
            ? 'available-local'
            : 'missing-local',
      },
      galleryCandidates: {
        status: galleryPaths.length ? (galleryPaths.every((path) => localAssetPaths.includes(path)) ? 'available-local' : 'partial-local') : 'none-listed',
        paths: galleryPaths,
        localCount: galleryPaths.filter((path) => localAssetPaths.includes(path)).length,
        missingCount: galleryPaths.filter((path) => !localAssetPaths.includes(path)).length,
        requiresCuration: galleryPaths.length > 0,
      },
      bodyImages: {
        paths: inlineImagePaths,
        localCount: inlineImagePaths.filter((path) => localAssetPaths.includes(path)).length,
        missingCount: inlineImagePaths.filter((path) => !localAssetPaths.includes(path)).length,
      },
      localAssets: {
        status: !candidateAssetPaths.length
          ? 'none-listed'
          : missingAssetPaths.length
            ? 'partial-local'
            : 'available-local',
        referencedCount: candidateAssetPaths.length,
        localCount: localAssetPaths.length,
        missingCount: missingAssetPaths.length,
        localPaths: localAssetPaths,
        missingPaths: missingAssetPaths,
      },
      collection: {
        status: collectionSlugs.has(missing.slug) ? 'present' : 'absent',
        expectedPath: expectedCollectionPath(missing.type, missing.slug),
      },
      notes: isHomepagePriority
        ? 'Homepage priority; the parsed source, body and primary image are already available locally.'
        : 'Parsed source and primary image are available locally; the Astro collection record has not been generated.',
    };
    items.push(item);
  }

  items.sort(compareItems);
  const allLocalAssets = unique(items.flatMap((item) => item.localAssets.localPaths));
  const allMissingAssets = unique(items.flatMap((item) => item.localAssets.missingPaths));
  const inventory = {
    schemaVersion: 1,
    generatedFrom: [
      'site/reports/legacy-url-comparison.json',
      'data/parsed-local.json',
      'site/src/content/products',
      'site/src/content/posts',
      'site/public/images',
    ],
    allowedDecisions: ALLOWED_DECISIONS,
    summary: {
      total: items.length,
      byType: countBy(items, (item) => item.type),
      byExecutionPhase: countBy(items, (item) => item.executionPhase),
      byDecision: countBy(items, (item) => item.decision),
      productCategories: countBy(items.filter((item) => item.type === 'product'), (item) => item.category),
      sourceRecordsAvailable: items.filter((item) => item.source.status === 'available').length,
      bodiesAvailable: items.filter((item) => item.body.status === 'available').length,
      featuredImagesAvailableLocally: items.filter((item) => item.featuredImage.status === 'available-local').length,
      collectionRecordsAbsent: items.filter((item) => item.collection.status === 'absent').length,
      uniqueLocalAssetsReferenced: allLocalAssets.length,
      uniqueMissingAssetsReferenced: allMissingAssets.length,
    },
    items,
  };

  const errors = validationErrors(inventory, { duplicates: sourceDuplicates });
  const c1Items = items.filter((item) => item.executionPhase === 'C1');
  const c2Items = items.filter((item) => item.executionPhase === 'C2');
  const c3Items = items.filter((item) => item.executionPhase === 'C3');
  const productCategorySections = EXPECTED_PRODUCT_CATEGORIES
    .map((category) => {
      const categoryItems = c2Items.filter((item) => item.category === category);
      return `### ${category} (${categoryItems.length})\n\n${checklist(categoryItems) || '- None'}`;
    })
    .join('\n\n');
  const markdown = `# Content gap completion inventory\n\n` +
    `Generated deterministically from the legacy URL report, parsed local source data, Astro collections and local public assets. The JSON file is the authoritative editable status list.\n\n` +
    `## Baseline\n\n` +
    `- Total missing collection records: ${inventory.summary.total}\n` +
    `- Products: ${inventory.summary.byType.product} (C1: ${inventory.summary.byExecutionPhase.C1}; C2: ${inventory.summary.byExecutionPhase.C2})\n` +
    `- Posts: ${inventory.summary.byType.post} (C3: ${inventory.summary.byExecutionPhase.C3})\n` +
    `- Parsed source records available: ${inventory.summary.sourceRecordsAvailable}\n` +
    `- Source bodies available: ${inventory.summary.bodiesAvailable}\n` +
    `- Primary images available locally: ${inventory.summary.featuredImagesAvailableLocally}\n` +
    `- Collection records currently absent: ${inventory.summary.collectionRecordsAbsent}\n` +
    `- Unique referenced assets already available locally: ${inventory.summary.uniqueLocalAssetsReferenced}\n` +
    `- Unique referenced assets missing locally: ${inventory.summary.uniqueMissingAssetsReferenced}\n\n` +
    `All 96 records have parsed source content and a local primary image. Gallery arrays are candidate evidence only: some include shared 66×66 footer/sidebar thumbnails and must be curated during C1, C2 or C4.\n\n` +
    `## Decision states\n\n` +
    `Allowed values: ${ALLOWED_DECISIONS.map((value) => `\`${value}\``).join(', ')}. The two homepage-priority products start at \`migrate\`; all other records remain \`pending\` until their execution phase.\n\n` +
    `## C1 — homepage-priority products\n\n${checklist(c1Items)}\n\n` +
    `## C2 — remaining products by category\n\n${productCategorySections}\n\n` +
    `## C3 — missing posts\n\n${checklist(c3Items)}\n\n` +
    `## Validation\n\n` +
    (errors.length ? errors.map((error) => `- ERROR: ${error}`).join('\n') : '- Passed: 96 unique paths; 43 products; 53 posts; valid decisions; complete parsed source/body/primary-image baseline; exact C1/C2/C3 allocation.') +
    `\n`;

  await mkdir(REPORT_DIRECTORY, { recursive: true });
  await Promise.all([
    writeFile(JSON_REPORT_PATH, `${JSON.stringify(inventory, null, 2)}\n`),
    writeFile(MARKDOWN_REPORT_PATH, markdown),
  ]);

  console.log(JSON.stringify({ ...inventory.summary, validationErrors: errors }, null, 2));
  if (errors.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
