#!/usr/bin/env node
import { createRequire } from 'node:module';
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { extname, join, relative } from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const EM_DASH = new RegExp(
  `${String.fromCharCode(0x2014)}|${['&', 'mdash;'].join('')}|&#${'8212;'}|&#x${'2014;'}`,
  'i',
);
const EN_CLAUSE = / \u2013 |(?<!\d)\u2013(?!\d)/;
const FILLER =
  /\b(tapestry|symphony|nestled|hidden gem|bustling|vibrant|whether you['’]re a|something for everyone|paradise)\b/i;
const THB_FIGURE = /\d[\d,]*\s*(?:THB|baht)\b|\b(?:THB|baht)\s*\d[\d,]*/i;
const TRANSIT_TIME =
  /\b\d+(?:\.\d+)?\s*(?:to|-)\s*\d+(?:\.\d+)?\s*(?:hours?|hrs?|minutes?|mins?)\b|\b(?:about|under|over)\s+\d+(?:\.\d+)?\s*(?:hours?|hrs?|minutes?|mins?)\b|\b\d+(?:\.\d+)?\s*(?:hours?|hrs?|minutes?|mins?)\b|\b\d+-\d+\s*(?:hours?|hrs?|minutes?|mins?)\b/i;
const WHO_IT_FITS =
  /\b(known for|known as|who it fits|if you|first|for [a-z]|pick|fly|come for|use|land|is the|is a|are a|not a|these are|this is|sleep|stay|fits)\b/i;

const HUBS = new Set([
  '/',
  '/destinations',
  '/itineraries',
  '/plan',
  '/get-there',
  '/interests',
  '/about',
  '/about/ratings',
  '/privacy',
  '/interests/resort-living',
  '/interests/nightlife',
  '/attractions',
]);

const SKIP_MONEY = new Set(['/about', '/about/ratings', '/privacy']);

const DEPTH_2500 = new Set([
  '/phuket',
  '/chiang-mai',
  '/koh-samui',
  '/krabi',
  '/khao-sok',
  '/koh-phangan',
  '/bangkok/sukhumvit',
  '/bangkok/sukhumvit-thonglor',
  '/bangkok/silom-sathon',
  '/bangkok/silom-and-sathorn',
  '/bangkok/rattanakosin',
  '/bangkok/old-city-rattanakosin',
  '/bangkok/chinatown-yaowarat',
  '/chiang-mai/old-city',
  '/chiang-mai/nimmanhaemin',
  '/resort-living/amanpuri',
  '/resort-living/six-senses-yao-noi',
  '/resort-living/six-senses-samui',
  '/resort-living/capella-bangkok',
  '/resort-living/the-siam',
  '/resort-living/four-seasons-chiang-mai',
  '/resort-living/four-seasons-koh-samui',
  '/resort-living/soneva-kiri',
  '/resort-living/rayavadee',
  '/resort-living/vie-hotel-bangkok',
  '/resort-living/veranda-high-chiang-mai',
  '/resort-living/avista-hideaway-phuket',
  '/interests/nightlife/koh-samui-beach-clubs',
  '/interests/nightlife/sukhumvit-soi-11',
  '/interests/nightlife/phuket-beach-clubs',
  '/interests/nightlife/thonglor-ekkamai',
  '/interests/nightlife/charoenkrung-soi-nana',
]);

const SKIP_AFFILIATES = new Set([
  ...HUBS,
  '/plan/visa-and-evisa',
  '/plan/best-time-to-visit',
  '/plan/money-and-sim',
  '/plan/visas-and-tdac',
  '/plan/when-to-go',
  '/plan/monsoon-and-burn-season',
  '/plan/scooters-and-road-rules',
  '/plan/songkran-and-public-holidays',
  '/plan/money-atms-and-promptpay',
  '/plan/esim-and-sim-cards',
]);

const errors = [];

const SKIP_DIRS = new Set(['node_modules', 'dist', '.git', '.astro', '.cursor']);
const PRIVACY_SKIP_DIRS = new Set(['node_modules', '.git', '.astro', '.cursor', 'scripts']);

// Encoded so the published tree never lists these strings in plain text.
const forbiddenPrivacyPatterns = Buffer.from(
  'bnVyYW5vZWwKdGhlYmV5b25kX3RyYXZlbGxlcgplbnNvLWpwCmdpdGh1YlwuY29tCmdpdGh1YlwuaW8KdGFuXHMraGFpCmZpcmViaXJkcwpwcm9qZWN0XHMrZnJlZWRvbQ==',
  'base64',
)
  .toString('utf8')
  .split('\n')
  .map((p) => new RegExp(p, 'i'));
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
]);
const DIST_TEXT_EXT = new Set([...TEXT_EXT, '.xml', '.webmanifest']);

function walkFiles(dir, files = [], skipDirs = SKIP_DIRS) {
  for (const name of readdirSync(dir)) {
    if (skipDirs.has(name)) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walkFiles(full, files, skipDirs);
    else files.push(full);
  }
  return files;
}

function isUnderScripts(rel) {
  return rel === 'scripts' || rel.startsWith('scripts/') || rel.split(/[\\/]/).includes('scripts');
}

function isScanTextFile(file, allowedExt) {
  const ext = extname(file).toLowerCase();
  return allowedExt.has(ext) || (ext === '' && file.endsWith('_redirects'));
}

function scanPrivacyFile(file, allowedExt = TEXT_EXT) {
  if (!existsSync(file)) return;
  const rel = relative(ROOT, file);
  if (isUnderScripts(rel)) return;
  if (!isScanTextFile(file, allowedExt)) return;
  readFileSync(file, 'utf8')
    .split('\n')
    .forEach((line, i) => {
      for (const pattern of forbiddenPrivacyPatterns) {
        if (pattern.test(line)) {
          fail(rel, `privacy leak on line ${i + 1}`);
          break;
        }
      }
    });
}

function scanPrivacyTree(dir, allowedExt = TEXT_EXT) {
  if (!existsSync(dir)) return;
  for (const file of walkFiles(dir, [], PRIVACY_SKIP_DIRS)) {
    scanPrivacyFile(file, allowedExt);
  }
}

for (const file of walkFiles(ROOT)) {
  const ext = extname(file).toLowerCase();
  if (!TEXT_EXT.has(ext) && !(ext === '' && file.endsWith('_redirects'))) continue;
  const rel = relative(ROOT, file);
  readFileSync(file, 'utf8')
    .split('\n')
    .forEach((line, i) => {
      if (EM_DASH.test(line)) fail(rel, `em dash (U+2014) is not allowed on line ${i + 1}`);
    });
}

function fail(path, message) {
  errors.push(`${path}: ${message}`);
}

function creditKey(photo) {
  return String(photo)
    .replace(/^\/photos\//, '')
    .replace(/\.[^.]+$/, '');
}

function walkStrings(value, visit) {
  if (typeof value === 'string') visit(value);
  else if (Array.isArray(value)) value.forEach((item) => walkStrings(item, visit));
  else if (value && typeof value === 'object') {
    for (const item of Object.values(value)) walkStrings(item, visit);
  }
}

function pageText(page) {
  const parts = [];
  walkStrings(page, (text) => parts.push(text));
  return parts.join('\n');
}

function bodyText(page) {
  const parts = [
    ...(page.paragraphs || []),
    ...(page.sections || []).flatMap((section) => [
      ...(section.paragraphs || []),
      ...(section.table?.headers || []),
      ...(section.table?.rows || []).flat(),
      ...(section.cards || []).flatMap((card) => [
        card.kicker,
        card.title,
        card.lead || '',
        ...(card.bullets || []),
      ]),
    ]),
    ...(page.sections || []).flatMap((section) => section.bullets || []),
    ...(page.days || []).map((day) => `${day.title} ${day.body}`),
    ...(page.faqs || []).map((faq) => `${faq.q} ${faq.a}`),
    ...(page.facts || []).map((fact) => `${fact.label} ${fact.value}`),
  ];
  return parts.join('\n');
}

function photosOf(page) {
  const out = [];
  if (page.photo) out.push(page.photo);
  for (const item of page.portraits || []) if (item.photo) out.push(item.photo);
  for (const item of page.affiliates || []) if (item.photo) out.push(item.photo);
  for (const item of page.days || []) if (item.photo) out.push(item.photo);
  for (const section of page.sections || []) {
    for (const card of section.cards || []) if (card.photo) out.push(card.photo);
  }
  return out;
}

function internalHrefs(page) {
  const hrefs = [];
  for (const crumb of page.crumbs || []) hrefs.push({ kind: 'breadcrumb', href: crumb.href });
  for (const item of page.portraits || []) hrefs.push({ kind: 'PortraitRail', href: item.href });
  for (const tab of page.tabs || []) hrefs.push({ kind: 'tab', href: tab.href });
  for (const section of page.sections || []) {
    walkStrings(section, (text) => {
      for (const match of text.matchAll(/\]\((\/[a-z0-9\-\/]+)\)/gi)) {
        hrefs.push({ kind: 'section', href: match[1] });
      }
    });
    for (const card of section.cards || []) {
      if (card.href) hrefs.push({ kind: 'section', href: card.href });
    }
  }
  return hrefs;
}

function isInternalPath(href) {
  return typeof href === 'string' && href.startsWith('/') && !href.startsWith('//') && !href.startsWith('/photos/');
}

function isCommercial(page) {
  if (SKIP_AFFILIATES.has(page.path)) return false;
  return (
    page.path.startsWith('/get-there/') ||
    page.path.startsWith('/itineraries/') ||
    page.path.startsWith('/resort-living/') ||
    page.path.startsWith('/interests/nightlife/') ||
    page.path.startsWith('/lao-food') ||
    page.path.startsWith('/attractions/') ||
    page.path.startsWith('/plan/') ||
    page.schema === 'City' ||
    page.schema === 'TouristDestination'
  );
}

function needsKnownForLead(page) {
  return !['/about', '/about/ratings', '/privacy'].includes(page.path);
}

function decodeAffiliate(url) {
  try {
    const parsed = new URL(url);
    const nested = parsed.searchParams.get('u');
    return nested ? `${url}\n${decodeURIComponent(nested)}` : url;
  } catch {
    return url;
  }
}

async function loadPages() {
  const require = createRequire(import.meta.url);
  const esbuild = await import(pathToFileURL(require.resolve('esbuild')).href);
  const dir = mkdtempSync(join(tmpdir(), 'ttg-audit-'));
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
    return {
      pages: mod.allPages(),
      allDishes: mod.allDishes,
      mainPhotosFor: mod.mainPhotosFor,
      foodRowsFor: mod.foodRowsFor,
      signatureDishesFor: mod.signatureDishesFor,
      isDishPhoto: mod.isDishPhoto,
      CITY_FOOD_PATHS: mod.CITY_FOOD_PATHS,
      tripCities: mod.tripCities,
      WAVE23_ITINERARY_PAGES: mod.WAVE23_ITINERARY_PAGES,
    };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const {
  pages,
  allDishes,
  mainPhotosFor,
  foodRowsFor,
  signatureDishesFor,
  isDishPhoto,
  CITY_FOOD_PATHS,
  tripCities,
  WAVE23_ITINERARY_PAGES,
} =
  await loadPages();
if (pages.length < 30) {
  fail('site', `expected 30+ routes, found ${pages.length}`);
}

const PLACE_MARKERS = /ตลาด|ถนน|ท่าเรือ|(?<!ข้าว)ซอย|ร้าน/;
const FOOD_NAME_OK = new Set([
  'อาหารทะเลย่าง',
  'อาหารทะเล',
  'อาหารทะเลปักษ์ใต้',
  'อาหารฮาลาล',
  'บุฟเฟ่ต์อาหารทะเล',
  'บาร์บีคิวอาหารทะเล',
]);
const AREA_NAMES = [
  'ปากช่อง', 'บางเบ้า', 'หาดทรายขาว', 'บ้านตาขุน', 'เขาสก', 'เชี่ยวหลาน', 'ราไวย์', 'กะตะ', 'กะรน',
  'ในหาน', 'กมลา', 'สุรินทร์', 'ป่าตอง', 'หลาดใหญ่', 'อ่างทอง', 'บ่อผุด', 'หน้าทอน', 'บางปอ', 'ละไม',
  'เฉวง', 'มหาราช', 'เจ้าฟ้า', 'อ่าวนาง', 'ณเรศ', 'เขาตะเกียบ', 'เทพประสิทธิ์', 'จอมเทียน', 'นาเกลือ',
  'เกาะล้าน', 'ร่องขุ่น', 'อู่ทอง', 'ศรีสัชนาลัย', 'เมืองเก่า', 'นางนวล', 'วอล์คกิ้ง', 'ยูดีทาวน์',
  'ไร่เลย์', 'แถวน้ำ', 'กินดี', 'เจ๊เอียว', 'ลาบร้อยเอ็ด', 'โคโค่', 'ราฟเฟิลเซีย', 'วันจันทร์', 'จัดจ้าน',
  'ห้าถ้วย', 'หอนาฬิกา', 'พ่อใจ', 'ป้าเล็ก', 'อุทยาน', 'หลังสี่ทุ่ม', 'โกเบนซ์', 'อ่าวสลัด', 'โขง',
  'อยุธยา', 'หัวหิน', 'กระบี่', 'กุ๊กชัย', 'เจ้าพรหม', 'บาซาร์',
];

function nameLocalNamesPlace(nameLocal) {
  const name = String(nameLocal || '');
  if (!name || FOOD_NAME_OK.has(name)) return false;
  if (PLACE_MARKERS.test(name)) return true;
  if (name.includes('อาหาร')) return true;
  return AREA_NAMES.some((area) => name.includes(area));
}

if (!Array.isArray(allDishes) || !allDishes.length) {
  fail('src/lib/dish-pages.ts', 'allDishes is empty');
}
for (const dish of allDishes || []) {
  if (dish.orderLocal) continue;
  if (!nameLocalNamesPlace(dish.nameLocal)) continue;
  fail(
    `/thai-food/${dish.city}--${dish.slug}`,
    `nameLocal names a place (${dish.nameLocal}) and orderLocal is missing`,
  );
}

const paths = new Set(pages.map((page) => page.path));
const credits = JSON.parse(readFileSync(join(ROOT, 'public/photos/credits.json'), 'utf8'));

const verifiedPath = join(ROOT, 'src/lib/trip-cities.verified.json');
if (!existsSync(verifiedPath)) {
  fail('src/lib/trip-cities.verified.json', 'verified Trip.com city list is missing');
} else {
  const verified = JSON.parse(readFileSync(verifiedPath, 'utf8'));
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(verified.verifiedOn || ''))) {
    fail('src/lib/trip-cities.verified.json', 'verifiedOn must be an ISO date (YYYY-MM-DD)');
  }
  const listed = verified.cities || {};
  const liveKeys = Object.keys(tripCities || {});
  if (!liveKeys.length) fail('src/lib/partners.ts', 'tripCities export is empty');
  for (const key of liveKeys) {
    const live = tripCities[key];
    const row = listed[key];
    if (!row) {
      fail('src/lib/partners.ts', `tripCities.${key} has no verified-ID entry`);
      continue;
    }
    if (!Number.isInteger(live.id) || live.id <= 0) {
      fail('src/lib/partners.ts', `tripCities.${key} lacks a verified numeric id`);
    }
    if (row.id !== live.id) {
      fail('src/lib/partners.ts', `tripCities.${key} id ${live.id} does not match verified id ${row.id}`);
    }
    if (!row.slug || row.slug !== live.slug) {
      fail('src/lib/partners.ts', `tripCities.${key} slug must match verified list (${row.slug})`);
    }
    if (!/^https:\/\/www\.trip\.com\/hotels\/[a-z0-9-]+-hotels-list-\d+\/$/.test(String(row.source || ''))) {
      fail('src/lib/trip-cities.verified.json', `${key} source must be a Trip.com hotels-list URL`);
    }
    if (!String(row.title || '').trim()) {
      fail('src/lib/trip-cities.verified.json', `${key} is missing a verification title`);
    }
  }
  for (const key of Object.keys(listed)) {
    if (!tripCities[key]) fail('src/lib/trip-cities.verified.json', `${key} is not a tripCities key`);
  }
}

for (const page of pages) {
  const text = pageText(page);
  const body = bodyText(page);

  if (EM_DASH.test(text)) fail(page.path, 'em dash (U+2014) is not allowed');
  if (EN_CLAUSE.test(text)) fail(page.path, 'en dash used as a clause separator');
  const filler = text.match(FILLER);
  if (filler) fail(page.path, `banned filler "${filler[0]}"`);

  const desc = page.description || '';
  const lede = page.lede || '';
  if (desc.length < 60 || desc.length > 230) {
    fail(page.path, `description must be 60-230 chars (now ${desc.length})`);
  }
  if (lede.length < 70 || lede.length > 280) {
    fail(page.path, `lede must be 70-280 chars (now ${lede.length})`);
  }
  if (needsKnownForLead(page) && desc === lede) {
    fail(page.path, 'lede must not copy the description');
  }
  if (needsKnownForLead(page) && !WHO_IT_FITS.test(lede)) {
    fail(page.path, 'lede must name what this is known for and who it fits');
  }

  if (!page.facts?.length) fail(page.path, 'factBar is empty');
  for (const fact of page.facts || []) {
    if (!String(fact.label || '').trim() || !String(fact.value || '').trim()) {
      fail(page.path, 'factBar has an empty label or value');
    }
    if (String(fact.value).length > 90) fail(page.path, `factBar value is too long: ${fact.label}`);
  }
  if (page.chips && page.chips.length === 0) fail(page.path, 'quickFacts chips are empty');
  if ((page.schema === 'City' || page.schema === 'TouristDestination') && !page.chips?.length) {
    fail(page.path, 'quickFacts chips are required on destination pages');
  }

  if (!SKIP_MONEY.has(page.path) && !THB_FIGURE.test(body) && !TRANSIT_TIME.test(body)) {
    fail(page.path, 'body needs a 2026 THB figure or a transit timing');
  }
  if (DEPTH_2500.has(page.path) && body.length < 2500) {
    fail(page.path, `Wave 13 depth page must be 2500+ chars (now ${body.length})`);
  }
  if (!page.portraits?.length) fail(page.path, 'portraits are empty');
  const days = page.days || [];
  const dayPhotos = days.map((day) => day.photo).filter(Boolean);
  if (new Set(dayPhotos).size !== dayPhotos.length) {
    fail(page.path, 'duplicate day-card photo on this page');
  }
  for (const photo of dayPhotos) {
    if (page.photo && photo === page.photo) {
      fail(page.path, `day card photo matches hero (${photo})`);
    }
  }

  for (const { kind, href } of internalHrefs(page)) {
    if (!isInternalPath(href)) continue;
    const clean = href.replace(/\/$/, '') || '/';
    if (!paths.has(clean) && !paths.has(href)) {
      fail(page.path, `invalid ${kind} href ${href}`);
    }
  }

  const pagePhotos = mainPhotosFor(page);
  for (const photo of new Set([...photosOf(page), ...pagePhotos])) {
    if (!photo.startsWith('/photos/')) {
      fail(page.path, `photo path must be under /photos/: ${photo}`);
      continue;
    }
    const file = join(ROOT, 'public', photo.replace(/^\//, ''));
    if (!existsSync(file)) fail(page.path, `missing photo file ${photo}`);
    const key = creditKey(photo);
    if (!credits[key]) fail(page.path, `missing credits.json entry for ${photo} (key ${key})`);
  }

  const seenPhotos = new Set();
  for (const photo of pagePhotos) {
    if (seenPhotos.has(photo)) fail(page.path, `duplicate <main> photo on page: ${photo}`);
    seenPhotos.add(photo);
  }

  const rendered = body.replace(/\[[^\]]+\]\((\/[a-z0-9\-\/]+)\)/gi, '$1').replace(/`[^`]+`/g, 'TERM').replace(/\*\*[^*]+\*\*/g, 'BOLD');
  if (/\]\(\//.test(rendered)) fail(page.path, 'raw markdown link leaked into rendered fields');
  if (/`/.test(rendered)) fail(page.path, 'raw backtick leaked into rendered fields');
  if (/planner spine|click-outs that matter|ATM fee is often 220 THB|They are not ranked/i.test(text)) {
    fail(page.path, 'leaked meta-copy or unranked disclaimer');
  }
  const visibleBits = [
    page.title,
    page.description,
    page.lede,
    page.photoCredit,
    page.bookingCta?.stayLabel,
    page.bookingCta?.stayNote,
    page.bookingCta?.tourLabel,
    page.bookingCta?.tourNote,
    ...(page.paragraphs || []),
    ...(page.chips || []),
    ...(page.facts || []).flatMap((fact) => [fact.label, fact.value]),
    ...(page.faqs || []).flatMap((faq) => [faq.q, faq.a]),
    ...(page.days || []).flatMap((day) => [day.title, day.body]),
    ...(page.affiliates || []).flatMap((row) => [row.title, row.kicker, row.body, row.cta]),
    ...(page.sections || []).flatMap((section) => [
      section.title,
      ...(section.paragraphs || []),
      ...(section.bullets || []),
      ...(section.table?.headers || []),
      ...(section.table?.rows || []).flat(),
      ...(section.cards || []).flatMap((card) => [
        card.kicker,
        card.title,
        card.lead,
        ...(card.bullets || []),
      ]),
    ]),
    ...(page.portraits || []).map((item) => item.title),
    ...(page.crumbs || []).map((crumb) => crumb.name),
  ]
    .filter(Boolean)
    .join('\n');
  if (page.path.startsWith('/itineraries/')) {
    if (
      /\b(our flight tool|Thai flight tool|flightLink|tagged Thai flight|nightlife-crawl H1|\bH1\b|this page does not (state|invent)|do not invent visa|invented airport pair|invented law|visa math)\b/i.test(
        visibleBits,
      )
    ) {
      fail(page.path, 'agent-instruction or internal tooling text leaked into reader copy');
    }
    if (/https?:\/\/vietnam-travelguide\.com\/\s*\./.test(visibleBits)) {
      fail(page.path, 'raw Vietnam TravelGuide URL with a space before the period');
    }
  }
  const affPhotos = (page.affiliates || []).map((row) => row.photo).filter(Boolean);
  if (page.photo && affPhotos.includes(page.photo)) {
    fail(page.path, `Hero photo == AffRow photo (${page.photo})`);
  }
  if (affPhotos.length >= 2 && new Set(affPhotos.slice(0, 2)).size < 2) {
    fail(page.path, 'first two AffRow photos are not distinct');
  }
  if (/11105102|334225872|334804079|793638|588978|city 62195|click-out|stays scannable/i.test(visibleBits)) {
    fail(page.path, 'affiliate IDs or meta-copy leaked into visible text');
  }

  if (page.path === '/lao-food') {
    const dishes = signatureDishesFor(page.photo ? [page.photo] : []);
    const dishPhotos = dishes.map((dish) => dish.photo).filter(Boolean);
    if (new Set(dishPhotos).size !== dishPhotos.length) {
      fail(page.path, 'duplicate signature-dish photo on this page');
    }
    for (const dish of dishes) {
      if (dish.photo && !isDishPhoto(dish.photo)) {
        fail(page.path, `signature dish "${dish.title}" uses a non-dish photo (${dish.photo})`);
      }
    }
  }
  if (CITY_FOOD_PATHS.has(page.path)) {
    const rows = foodRowsFor(page.path, page.photo ? [page.photo] : []);
    const rowPhotos = rows.map((row) => row.photo).filter(Boolean);
    if (new Set(rowPhotos).size !== rowPhotos.length) {
      fail(page.path, 'duplicate food-row photo on this page');
    }
    for (const row of rows) {
      if (row.kind === 'dish' && row.photo && !isDishPhoto(row.photo)) {
        fail(page.path, `dish row "${row.title}" uses a non-dish photo (${row.photo})`);
      }
    }
  }

  if (isCommercial(page) && !page.affiliates?.length) {
    fail(page.path, 'commercial page needs partner booking links');
  }
  for (const row of page.affiliates || []) {
    const href = row.href || '';
    const decoded = decodeAffiliate(href);
    const trip = /trip\.com/i.test(decoded);
    const klookShort = /^https:\/\/klook\.tpx\.li\/[A-Za-z0-9]+$/.test(href);
    const klook = !klookShort && /klook\.com|tp\.media/i.test(decoded);
    if (trip && (!decoded.includes('Allianceid=11105102') || !/SID=(334225872|334804079)\b/.test(decoded))) {
      fail(page.path, `Trip.com URL missing Allianceid=11105102 or SID=334225872/334804079 (${row.title})`);
    }
    if (klook && (!decoded.includes('588978') || !decoded.includes('793638'))) {
      fail(page.path, `Klook/Travelpayouts URL missing 588978 or 793638 (${row.title})`);
    }
    if (!trip && !klook && !klookShort) fail(page.path, `affiliate href is not Trip.com or Klook (${row.title})`);
  }
}

const NUMBER_WORDS =
  'one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty(?:-one|-two|-three|-four|-five|-six|-seven|-eight|-nine)?';
const KIND_WORDS =
  'first-timer|family|couples|backpacker|honeymoon|dive|kids|slow|classic';
const HUB_CARD_PHOTOS = new Set([
  '/photos/plan.jpg',
  '/photos/itineraries.jpg',
  '/photos/destinations.jpg',
  '/photos/interests.jpg',
  '/photos/about.jpg',
  '/photos/privacy.jpg',
]);

function visiblePlain(text) {
  return String(text || '')
    .replace(/\[[^\]]+\]\(([^)]+)\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

function firstSentence(text) {
  const plain = visiblePlain(text);
  const match = plain.match(/^[\s\S]+?[.!?](?=\s|$)/);
  return (match ? match[0] : plain).trim();
}

function openerFrame(sentence) {
  return sentence
    .toLowerCase()
    .replace(new RegExp(`\\b(?:${NUMBER_WORDS})\\b`, 'g'), 'N')
    .replace(/\b\d+(?:-\d+)?\b/g, 'N')
    .replace(new RegExp(`\\b(?:${KIND_WORDS})\\b`, 'g'), 'KIND')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const openerFrames = new Map();
const openerTicketRuns = new Map();
for (const page of WAVE23_ITINERARY_PAGES || []) {
  const opener = firstSentence((page.paragraphs || [])[0] || page.lede || '');
  const frame = openerFrame(opener);
  if (/\bdays cover\b/i.test(opener) || /\bN(?: KIND)? days cover\b/.test(frame)) {
    fail(page.path, `templated itinerary opener ("days cover"): ${opener}`);
  }
  if (/\bthen\b[^.]{0,90}\bis the\b[^.]{0,50}\b(?:trip|week|pair)\b/i.test(opener)) {
    fail(page.path, `templated itinerary opener ("then ... is the trip/week/pair"): ${opener}`);
  }
  const openerBody = visiblePlain((page.paragraphs || [])[0] || '');
  const ticketRun = openerBody.match(
    /palace 500 thb[\s\S]{0,80}wat pho[\s\S]{0,40}300 thb[\s\S]{0,50}(?:ferry|tha tien)[\s\S]{0,40}5 thb[\s\S]{0,40}wat arun[\s\S]{0,40}200 thb/i,
  );
  if (ticketRun) {
    const key = ticketRun[0].replace(/\s+/g, ' ').toLowerCase();
    if (!openerTicketRuns.has(key)) openerTicketRuns.set(key, []);
    openerTicketRuns.get(key).push(page.path);
  }
  if (frame) {
    if (!openerFrames.has(frame)) openerFrames.set(frame, []);
    openerFrames.get(frame).push(page.path);
  }
  const prefix = frame.split(' ').slice(0, 7).join(' ');
  if (prefix.split(' ').length >= 6) {
    const key = `prefix:${prefix}`;
    if (!openerFrames.has(key)) openerFrames.set(key, []);
    openerFrames.get(key).push(page.path);
  }

  const sourcePhotos = [
    page.photo,
    ...(page.days || []).map((day) => day.photo),
    ...(page.portraits || []).map((item) => item.photo),
    ...(page.affiliates || []).map((row) => row.photo),
  ].filter(Boolean);
  const seen = new Set();
  for (const photo of sourcePhotos) {
    if (seen.has(photo)) {
      fail(page.path, `itinerary source photo repeats on this page: ${photo}`);
    }
    seen.add(photo);
    if (HUB_CARD_PHOTOS.has(photo)) {
      fail(page.path, `generic hub photo used on an itinerary card: ${photo}`);
    }
  }
}

for (const [frame, paths] of openerFrames) {
  const unique = [...new Set(paths)];
  if (unique.length >= 2) {
    fail(unique[0], `repeated itinerary opener frame across ${unique.join(', ')} (${frame})`);
  }
}

for (const [run, paths] of openerTicketRuns) {
  const unique = [...new Set(paths)];
  if (unique.length >= 3) {
    fail(
      unique[0],
      `identical Bangkok ticket list repeated across ${unique.join(', ')} (${run})`,
    );
  }
}

scanPrivacyTree(join(ROOT, 'src'));
scanPrivacyTree(join(ROOT, 'public'));
scanPrivacyFile(join(ROOT, 'README.md'));
scanPrivacyTree(join(ROOT, 'dist'), DIST_TEXT_EXT);

{
  const dist = join(ROOT, 'dist');
  if (existsSync(dist)) {
    const leak = /\]\(https?:|\]\(\//;
    const htmlFiles = [];
    function walkHtml(dir) {
      for (const name of readdirSync(dir)) {
        const full = join(dir, name);
        if (statSync(full).isDirectory()) walkHtml(full);
        else if (name.endsWith('.html')) htmlFiles.push(full);
      }
    }
    walkHtml(dist);
    for (const file of htmlFiles) {
      if (leak.test(readFileSync(file, 'utf8'))) {
        fail(relative(ROOT, file), 'raw markdown link fragment in built HTML');
      }
    }
  }
}

if (errors.length) {
  console.error(`audit:content failed (${errors.length} error${errors.length === 1 ? '' : 's'})`);
  for (const err of errors) console.error(`  ${err}`);
  process.exit(1);
}

console.log(`audit:content ok (${pages.length} routes)`);
