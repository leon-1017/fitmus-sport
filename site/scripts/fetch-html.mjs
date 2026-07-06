// scripts/fetch-html.mjs
// Fetches every URL in data/url-list.json and saves the raw HTML to raw/<type>/<slug>.html

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(__dirname, '../../data');
const RAW_DIR = resolve(__dirname, '../../raw');

const CONCURRENCY = 6;
const RETRIES = 3;
const DELAY_MS = 250;

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchHtml(url, attempt = 1) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
      },
      redirect: 'follow',
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    return await res.text();
  } catch (err) {
    if (attempt < RETRIES) {
      await sleep(DELAY_MS * attempt);
      return fetchHtml(url, attempt + 1);
    }
    throw err;
  }
}

async function processBatch(items) {
  const errors = [];
  for (const item of items) {
    const dir = resolve(RAW_DIR, item.type);
    await mkdir(dir, { recursive: true });
    const outPath = resolve(dir, `${item.slug}.html`);

    try {
      const html = await fetchHtml(item.url);
      await writeFile(outPath, html, 'utf8');
      process.stdout.write(`OK  ${item.url}\n`);
    } catch (err) {
      process.stderr.write(`ERR ${item.url} -> ${err.message}\n`);
      errors.push({ url: item.url, error: err.message });
    }
  }
  return errors;
}

async function main() {
  const listPath = resolve(DATA_DIR, 'url-list.json');
  const items = JSON.parse(await readFile(listPath, 'utf8'));
  console.log(`Fetching ${items.length} URLs with concurrency ${CONCURRENCY}`);

  const batches = [];
  for (let i = 0; i < items.length; i += CONCURRENCY) {
    batches.push(items.slice(i, i + CONCURRENCY));
  }

  const allErrors = [];
  for (const batch of batches) {
    const errs = await processBatch(batch);
    allErrors.push(...errs);
    await sleep(DELAY_MS);
  }

  await writeFile(resolve(DATA_DIR, 'fetch-errors.json'), JSON.stringify(allErrors, null, 2));
  console.log(`\nDone. Errors: ${allErrors.length} / ${items.length}`);
  if (allErrors.length) {
    console.log('See data/fetch-errors.json');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
