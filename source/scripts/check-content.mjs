#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname, relative } from 'node:path';

const ROOT = process.cwd();
const SKIP_DIRS = new Set([
  'node_modules',
  'dist',
  '.git',
  '.astro',
  '.cursor',
]);
const TEXT_EXT = new Set([
  '.astro',
  '.ts',
  '.tsx',
  '.js',
  '.mjs',
  '.cjs',
  '.md',
  '.css',
  '.json',
  '.html',
  '.yml',
  '.yaml',
  '.txt',
  '.svg',
  '.mjs',
]);

const REQUIRED_ROUTES = [
  '/',
  '/destinations',
  '/luang-prabang',
  '/vientiane',
  '/vang-vieng',
  '/4000-islands',
  '/pakse',
  '/bolaven-plateau',
  '/nong-khiaw',
  '/attractions',
  '/attractions/kuang-si-falls',
  '/attractions/pak-ou-caves',
  '/attractions/mount-phousi',
  '/attractions/luang-prabang-alms-giving',
  '/attractions/wat-xieng-thong',
  '/attractions/pha-that-luang',
  '/attractions/patuxai',
  '/attractions/buddha-park',
  '/attractions/vang-vieng-blue-lagoon',
  '/attractions/khone-phapheng-falls',
  '/attractions/wat-phou',
  '/attractions/nong-khiaw-viewpoint',
  '/attractions/tad-fane',
  '/get-there',
  '/get-there/laos-china-railway',
  '/get-there/bangkok-to-laos',
  '/get-there/hanoi-to-laos',
  '/plan',
  '/plan/visa-and-evisa',
  '/plan/best-time-to-visit',
  '/plan/money-and-sim',
  '/itineraries',
  '/itineraries/7-days',
  '/itineraries/10-days',
  '/lao-food',
  '/about',
  '/about/ratings',
  '/privacy',
];

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, files);
    else files.push(full);
  }
  return files;
}

const errors = [];
const files = walk(ROOT).filter((f) => {
  const ext = extname(f).toLowerCase();
  return TEXT_EXT.has(ext) || ext === '';
});

const emDash = new RegExp(
  String.fromCharCode(0x2014) + '|' + ['&', 'mdash;'].join('') + '|&#' + '8212;' + '|&#x' + '2014;',
  'i',
);

for (const file of files) {
  if (extname(file) === '' && !file.endsWith('_redirects')) continue;
  const text = readFileSync(file, 'utf8');
  const rel = relative(ROOT, file);
  const lines = text.split(/\n/);
  lines.forEach((line, i) => {
    if (emDash.test(line)) {
      errors.push(`${rel}:${i + 1} em dash is not allowed`);
    }
    if (rel.startsWith('src/') && !rel.endsWith('clean-copy.ts') && /check on arrival/i.test(line)) {
      errors.push(`${rel}:${i + 1} Check on arrival filler is not allowed`);
    }
    if (rel.startsWith('src/') && /\(\s*(loop(?:\s+page)?|wikipedia|wikivoyage|dnp(?:\s+category\s+\d+)?)\s*\)/i.test(line)) {
      errors.push(`${rel}:${i + 1} scraper/source annotation is not allowed`);
    }
    if (rel.startsWith('src/')) {
      const banned = [
        ['clean' + ' clock', 'clean clock'],
        ['is a ' + 'roll', 'is a roll'],
        ['Believe' + ' the', 'Believe the'],
        ['GitHub' + ' Pages', 'GitHub Pages'],
        ['return to ' + 'BKK', 'return to BKK'],
      ];
      for (const [needle, label] of banned) {
        if (line.includes(needle)) {
          errors.push(`${rel}:${i + 1} banned phrase is not allowed (${label})`);
        }
      }
    }
  });
}

const routesDir = join(ROOT, 'src/lib');
const routesSource = readdirSync(routesDir)
  .filter((name) => name.endsWith('.ts'))
  .map((name) => readFileSync(join(routesDir, name), 'utf8'))
  .join('\n');
for (const route of REQUIRED_ROUTES) {
  const needles = [`path: '${route}'`, `path: "${route}"`];
  if (!needles.some((needle) => routesSource.includes(needle))) {
    errors.push(`missing required route ${route} in src/lib`);
  }
}

{
  const dishes = readFileSync(join(ROOT, 'src/lib/dishes.ts'), 'utf8');
  const count = (dishes.match(/slug: '/g) || []).length;
  if (count < 15) errors.push(`Lao dish catalog has ${count} slugs; need at least 15`);
  if (!dishes.includes("slug: 'laap'")) errors.push('missing laap dish');
  if (!dishes.includes("slug: 'khao-niao'")) errors.push('missing khao-niao dish');
}

const partners = readFileSync(join(ROOT, 'src/lib/partners.ts'), 'utf8');
for (const token of ['11105102', '334225872', '334804079', '588978', '793638']) {
  if (!partners.includes(token)) {
    errors.push(`partners.ts missing affiliate token ${token}`);
  }
}
// Old Trip.com SID 334225872: only the two fallback constants may hold it (used solely for links
// still awaiting a Partner-generated replacement). Any other occurrence in src fails the build.
{
  const { readdirSync: rd } = await import('node:fs');
  const ALLOWED = ["const TRIP_SID = '334225872';", "const TRIP_BASE = 'Allianceid=11105102&SID=334225872&trip_sub2=th';"];
  const walk = (dir) => rd(dir, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]);
  for (const file of walk(join(ROOT, 'src'))) {
    readFileSync(file, 'utf8').split('\n').forEach((line, n) => {
      if (line.includes('334225872') && !ALLOWED.includes(line.trim())) errors.push(`${file.slice(ROOT.length)}:${n + 1} has old Trip.com SID 334225872`);
    });
  }
}
if (!partners.includes('hotelSearchListUrl') || !partners.includes('/hotels/list?')) {
  errors.push('partners.ts must export hotelSearchListUrl using /hotels/list?');
}
const tripSearch = readFileSync(join(ROOT, 'src/components/TripSearch.astro'), 'utf8');
const ALLOWED_SEARCH_BOX = 'trip.com/partners/ad/S20729725?Allianceid=11105102&SID=334804079&trip_sub1=th_search_box';
if (!tripSearch.includes(ALLOWED_SEARCH_BOX)) {
  errors.push('TripSearch.astro must embed the Partner search box S20729725');
}
if ((tripSearch.match(/partners\/ad\//g) || []).length !== 1) {
  errors.push('TripSearch.astro may only reference the S20729725 Partner search box');
}
const cityBoxes = readFileSync(join(ROOT, 'src/lib/trip-searchboxes.ts'), 'utf8');
const cityBoxIds = [...cityBoxes.matchAll(/partners\/ad\/(S\d+)\?Allianceid=11105102&SID=334804079&/g)].map((m) => m[1]);
if (cityBoxIds.length !== 0) {
  errors.push('trip-searchboxes.ts must not invent extra Partner city search boxes');
}
if (!existsSync(join(ROOT, 'scripts/check-stay-search.mjs')) || !existsSync(join(ROOT, 'scripts/check-unique-photos.mjs')) || !existsSync(join(ROOT, 'scripts/check-facts.mjs'))) {
  errors.push('missing check-stay-search, check-unique-photos, or check-facts script');
}

const astroConfig = readFileSync(join(ROOT, 'astro.config.mjs'), 'utf8');
if (!astroConfig.includes("trailingSlash: 'always'")) {
  errors.push('astro.config.mjs must set trailingSlash: always');
}
if (!astroConfig.includes('sitemap.xml')) {
  errors.push('astro.config.mjs must copy sitemap-0.xml to sitemap.xml');
}

const siteSrc = readFileSync(join(ROOT, 'src/lib/site.ts'), 'utf8');
if (!siteSrc.includes('export function pageHref') || !siteSrc.includes("endsWith('/')")) {
  errors.push('src/lib/site.ts must export pageHref that adds trailing slashes');
}

const robots = readFileSync(join(ROOT, 'public/robots.txt'), 'utf8');
if (!/Disallow:\s*\/search/.test(robots)) {
  errors.push('public/robots.txt must Disallow /search');
}
if (!robots.includes('laos-travelguide.com/sitemap.xml')) {
  errors.push('public/robots.txt must point to sitemap.xml');
}

const baseSrc = readFileSync(join(ROOT, 'src/layouts/Base.astro'), 'utf8');
if (!baseSrc.includes('seoTitle') || !baseSrc.includes('seoDescription')) {
  errors.push('src/layouts/Base.astro must render seoTitle and seoDescription');
}

const wave23Dir = join(ROOT, 'src/lib');
const wave23Files = readdirSync(wave23Dir).filter((name) => /^wave23-[a-g]\.ts$/.test(name));
const DAYS_COVER = /\b(?:One|Two|Three|Four|Five|Six|Seven|Eight|Nine|Ten|Eleven|Twelve|Fourteen|Sixteen|Twenty-one)\s+(?:[A-Za-z-]+\s+){0,3}days cover\b/;
const THEN_IS_KIND =
  /\bthen\b[^.]{0,90}\bis the\b[^.]{0,50}\b(?:trip|week|pair)\b/i;
const OPENER_TICKET_RUN =
  /Palace 500 THB[\s\S]{0,80}Wat Pho[\s\S]{0,40}300 THB[\s\S]{0,50}(?:ferry|Tha Tien)[\s\S]{0,40}5 THB[\s\S]{0,40}Wat Arun[\s\S]{0,40}200 THB/i;
const ticketRunPages = [];
for (const name of wave23Files) {
  const rel = `src/lib/${name}`;
  const text = readFileSync(join(wave23Dir, name), 'utf8');
  text.split('\n').forEach((line, i) => {
    if (DAYS_COVER.test(line)) {
      errors.push(`${rel}:${i + 1} templated itinerary opener ("days cover")`);
    }
    if (THEN_IS_KIND.test(line) && /^\s+'/.test(line)) {
      errors.push(`${rel}:${i + 1} templated itinerary opener ("then ... is the trip/week/pair")`);
    }
    if (OPENER_TICKET_RUN.test(line) && /^\s+'/.test(line) && !/\/photos\//.test(line)) {
      ticketRunPages.push(`${rel}:${i + 1}`);
    }
  });
}
if (ticketRunPages.length >= 3) {
  errors.push(
    `identical Bangkok ticket list repeated across ${ticketRunPages.length} itinerary openers (${ticketRunPages.join(', ')})`,
  );
}

{
  const { createRequire } = await import('node:module');
  const { mkdtempSync, rmSync } = await import('node:fs');
  const { tmpdir } = await import('node:os');
  const { pathToFileURL } = await import('node:url');
  const require = createRequire(join(ROOT, 'package.json'));
  const esbuild = await import(pathToFileURL(require.resolve('esbuild')).href);
  const dir = mkdtempSync(join(tmpdir(), 'ttg-itinerary-photos-'));
  const outfile = join(dir, 'bundle.mjs');
  try {
    await esbuild.build({
      entryPoints: [join(ROOT, 'src/lib/audit-api.ts')],
      bundle: true,
      format: 'esm',
      platform: 'node',
      outfile,
      logLevel: 'silent',
    });
    const inlineOut = join(dir, 'inline.mjs');
    await esbuild.build({
      entryPoints: [join(ROOT, 'src/lib/inline.ts')],
      bundle: true,
      format: 'esm',
      platform: 'node',
      outfile: inlineOut,
      logLevel: 'silent',
    });
    const inlineMod = await import(pathToFileURL(inlineOut).href);
    const formatInline = inlineMod.formatInline;
    const RAW_MD_LINK = /\]\(https?:|\]\(\//;
    const mod = await import(pathToFileURL(outfile).href);
    const pages = typeof mod.allPages === 'function' ? mod.allPages() : [];
    const mainPhotosFor = mod.mainPhotosFor;
    const rawWave23 = Array.isArray(mod.WAVE23_ITINERARY_PAGES) ? mod.WAVE23_ITINERARY_PAGES : [];
    const toCheck = new Map();
    for (const page of rawWave23) toCheck.set(page.path, page);
    for (const page of pages) {
      if (!String(page.path || '').startsWith('/itineraries/')) continue;
      if (!toCheck.has(page.path)) toCheck.set(page.path, page);
    }
    function walkStrings(value, visit) {
      if (typeof value === 'string') visit(value);
      else if (Array.isArray(value)) value.forEach((item) => walkStrings(item, visit));
      else if (value && typeof value === 'object') {
        for (const item of Object.values(value)) walkStrings(item, visit);
      }
    }
    if (typeof formatInline === 'function') {
      for (const page of pages) {
        walkStrings(page, (text) => {
          if (RAW_MD_LINK.test(formatInline(text))) {
            errors.push(`${page.path} raw markdown link after formatInline`);
          }
        });
      }
    }
    for (const page of pages) {
      if (!String(page.path || '').startsWith('/itineraries/') || typeof mainPhotosFor !== 'function') continue;
      const rendered = mainPhotosFor(page).filter(Boolean);
      const seenRendered = new Set();
      for (const photo of rendered) {
        if (seenRendered.has(photo)) {
          errors.push(`${page.path} repeated photo in rendered itinerary page: ${photo}`);
        }
        seenRendered.add(photo);
      }
    }
    for (const page of toCheck.values()) {
      const source = [];
      if (page.photo) source.push(page.photo);
      for (const item of page.portraits || []) if (item.photo) source.push(item.photo);
      for (const item of page.affiliates || []) if (item.photo) source.push(item.photo);
      for (const item of page.days || []) if (item.photo) source.push(item.photo);
      for (const section of page.sections || []) {
        for (const card of section.cards || []) if (card.photo) source.push(card.photo);
      }
      const seenSource = new Set();
      for (const photo of source) {
        if (seenSource.has(photo)) {
          errors.push(`${page.path} repeated photo on itinerary page: ${photo}`);
        }
        seenSource.add(photo);
      }
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function scanBuiltHtmlForMarkdown(label) {
  const dist = join(ROOT, 'dist');
  if (!existsSync(dist)) return;
  const htmlFiles = [];
  function walkHtml(dir) {
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      const st = statSync(full);
      if (st.isDirectory()) walkHtml(full);
      else if (name.endsWith('.html')) htmlFiles.push(full);
    }
  }
  walkHtml(dist);
  const leak = /\]\(https?:|\]\(\//;
  for (const file of htmlFiles) {
    const text = readFileSync(file, 'utf8');
    if (leak.test(text)) {
      errors.push(`${relative(ROOT, file)} ${label}: raw markdown link fragment in built HTML`);
    }
  }
}

scanBuiltHtmlForMarkdown('check:content');

if (errors.length) {
  console.error(`check:content failed (${errors.length} error${errors.length === 1 ? '' : 's'})`);
  for (const err of errors) console.error(`  ${err}`);
  process.exit(1);
}

console.log(`check:content ok (${files.length} files, ${REQUIRED_ROUTES.length} required routes, 0 em dashes)`);
