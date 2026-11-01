#!/usr/bin/env node
/**
 * FactBar cells stay short. Visible copy has no scraper/source annotations.
 */
import { createRequire } from 'node:module';
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const DIST = join(ROOT, 'dist');
const FACT_MAX = 160;
const errors = [];

const SOURCE_TAG =
  /\(\s*(?:loop(?:\s+page)?|wikipedia|wikivoyage|wikidata|wiki|commons|unesco|dnp(?:\s+category\s+\d+)?|official(?:\s+(?:page|site|source))?|source|research|scrape|park page|seat61)\s*\)/i;
const ARRIVAL_FILLER = /check on arrival/i;

function fail(path, message) {
  errors.push(`${path}: ${message}`);
}

async function loadPages() {
  const require = createRequire(import.meta.url);
  const esbuild = await import(pathToFileURL(require.resolve('esbuild')).href);
  const dir = mkdtempSync(join(tmpdir(), 'ttg-facts-'));
  const outfile = join(dir, 'content.mjs');
  try {
    await esbuild.build({
      entryPoints: [join(ROOT, 'src/lib/audit-api.ts')],
      bundle: true,
      format: 'esm',
      platform: 'node',
      outfile,
      logLevel: 'silent',
    });
    const mod = await import(pathToFileURL(outfile).href);
    return mod.allPages();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function walkHtml(dir, files = []) {
  if (!existsSync(dir)) return files;
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (name === '404') continue;
      walkHtml(full, files);
    } else if (name === 'index.html') files.push(full);
  }
  return files;
}

function pagePath(file) {
  const rel = file.slice(DIST.length).replace(/\\/g, '/').replace(/index\.html$/, '');
  return rel === '/' || rel === '' ? '/' : rel;
}

function visibleMain(html) {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[\s\S]*?<\/style>/gi, '')
    .replace(/<header\b[\s\S]*?<\/header>/i, '')
    .replace(/<footer\b[\s\S]*?<\/footer>/i, '');
}

const pages = await loadPages();
let longFacts = 0;
let annotatedFacts = 0;

for (const page of pages) {
  for (const fact of page.facts || []) {
    const value = String(fact.value || '');
    if (value.length > FACT_MAX) {
      longFacts += 1;
      fail(page.path, `fact "${fact.label}" is ${value.length} chars (max ${FACT_MAX})`);
    }
    if (SOURCE_TAG.test(value) || ARRIVAL_FILLER.test(value)) {
      annotatedFacts += 1;
      fail(page.path, `fact "${fact.label}" still has a source annotation`);
    }
  }
}

if (!existsSync(DIST)) {
  fail('dist', 'dist/ missing; run build before check:facts');
} else {
  for (const file of walkHtml(DIST)) {
    const rel = pagePath(file);
    const html = readFileSync(file, 'utf8');
    const main = visibleMain(html);
    const factHtml = main.match(/<div class="facts"[\s\S]*?<\/div>/);
    const block = factHtml ? factHtml[0] : '';
    for (const m of block.matchAll(/<strong>([\s\S]*?)<\/strong>/g)) {
      const text = m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
      if (text.length > FACT_MAX) {
        longFacts += 1;
        fail(rel, `built fact cell is ${text.length} chars: ${text.slice(0, 80)}`);
      }
    }
    if (SOURCE_TAG.test(main) || ARRIVAL_FILLER.test(main)) {
      annotatedFacts += 1;
      fail(rel, 'visible copy still has a scraper/source annotation');
    }
  }
}

if (errors.length) {
  console.error(`check-facts failed (${errors.length})`);
  console.error(`  long fact cells: ${longFacts}  annotated pages: ${annotatedFacts}`);
  for (const err of errors.slice(0, 80)) console.error(`  ${err}`);
  if (errors.length > 80) console.error(`  ... ${errors.length - 80} more`);
  process.exit(1);
}

console.log(`check-facts ok (${pages.length} pages, 0 long fact cells, 0 source annotations)`);
