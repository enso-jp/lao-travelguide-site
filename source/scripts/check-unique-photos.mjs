#!/usr/bin/env node
/**
 * Crawl the built site and fail if any page repeats an image, or if a card
 * that should have a photo is missing one (empty / monogram / initial placeholders).
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const DIST = join(process.cwd(), 'dist');
const errors = [];
const reports = [];

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

export function normalizeSrc(src) {
  if (!src) return '';
  let value = src.trim();
  try {
    if (value.startsWith('http://') || value.startsWith('https://')) {
      const url = new URL(value);
      value = url.pathname;
    }
  } catch {
    /* keep */
  }
  const q = value.indexOf('?');
  if (q !== -1) value = value.slice(0, q);
  const hash = value.indexOf('#');
  if (hash !== -1) value = value.slice(0, hash);
  value = value.replace(/\/{2,}/g, '/');
  value = value.replace(/-(?:\d+w|\d+x\d+|sm|md|lg|thumb)\.(jpg|jpeg|png|webp|avif)$/i, '.$1');
  return value.toLowerCase();
}

function stripChrome(html) {
  return html
    .replace(/<header\b[\s\S]*?<\/header>/i, '')
    .replace(/<footer\b[\s\S]*?<\/footer>/i, '')
    .replace(/<script\b[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[\s\S]*?<\/style>/gi, '');
}

function pagePath(file) {
  const rel = file.slice(DIST.length).replace(/\\/g, '/').replace(/index\.html$/, '');
  return rel === '/' || rel === '' ? '/' : rel;
}

const PLACEHOLDER_SRC =
  /placeholder|initial|monogram|avatar|letter|blank|missing|no-photo|data:image\/svg/i;

const CARD_NEEDS_PHOTO = [
  { name: 'jg-card', re: /<a[^>]*class="[^"]*\bjg-card\b[^"]*"[^>]*>([\s\S]*?)<\/a>/g },
  { name: 'food-card', re: /<a[^>]*class="[^"]*\bfood-card\b[^"]*"[^>]*>([\s\S]*?)<\/a>/g },
  { name: 'guide-card', re: /<a[^>]*class="[^"]*\bguide-card\b[^"]*"[^>]*>([\s\S]*?)<\/a>/g },
  { name: 'portrait', re: /<a[^>]*class="[^"]*\bportrait\b[^"]*"[^>]*>([\s\S]*?)<\/a>/g },
  { name: 'home-tile', re: /<a[^>]*class="[^"]*\bhome-tile\b[^"]*"[^>]*>([\s\S]*?)<\/a>/g },
  { name: 'editorial-card', re: /<article[^>]*class="[^"]*\beditorial-card\b[^"]*"[^>]*>([\s\S]*?)<\/article>/g },
  { name: 'day-plan-card', re: /<article[^>]*class="[^"]*\bday-plan-card\b[^"]*"[^>]*>([\s\S]*?)<\/article>/g },
  { name: 'aff-row', re: /<a[^>]*class="[^"]*\baff-row\b[^"]*"[^>]*>([\s\S]*?)<\/a>/g },
  { name: 'food-row', re: /<article[^>]*class="[^"]*\bfood-row\b[^"]*"[^>]*>([\s\S]*?)<\/article>/g },
  { name: 'mini-card', re: /<a[^>]*class="[^"]*\bmini-card\b[^"]*"[^>]*>([\s\S]*?)<\/a>/g },
  { name: 'top-card', re: /<a[^>]*class="[^"]*\btop-card\b[^"]*"[^>]*>([\s\S]*?)<\/a>/g },
  { name: 'story-row', re: /<a[^>]*class="[^"]*\bstory-row\b[^"]*"[^>]*>([\s\S]*?)<\/a>/g },
];

if (!existsSync(DIST)) {
  console.error('check-unique-photos skipped: dist/ missing');
  process.exit(1);
}

const pages = walkHtml(DIST);
let pagesWithDupes = 0;
let dupeCount = 0;
let placeholderCount = 0;

for (const file of pages) {
  const rel = pagePath(file);
  const html = readFileSync(file, 'utf8');
  const main = stripChrome(html);
  const srcs = [...main.matchAll(/<img\b([^>]*)>/gi)].map((m) => {
    const raw = m[1].match(/\bsrc="([^"]*)"/i)?.[1] || '';
    return { raw, key: normalizeSrc(raw) };
  }).filter((row) => row.key && !row.key.endsWith('.svg') && !row.key.includes('favicon'));

  const counts = new Map();
  for (const row of srcs) {
    counts.set(row.key, (counts.get(row.key) || 0) + 1);
    if (PLACEHOLDER_SRC.test(row.raw) || PLACEHOLDER_SRC.test(row.key)) {
      placeholderCount += 1;
      errors.push(`${rel} placeholder image ${row.raw}`);
    }
  }
  const repeated = [...counts.entries()].filter(([, n]) => n > 1);
  if (repeated.length) {
    pagesWithDupes += 1;
    dupeCount += repeated.length;
    const detail = repeated.map(([src, n]) => `${src} x${n}`).join(', ');
    reports.push(`${rel}: ${detail}`);
    errors.push(`${rel} repeated images: ${detail}`);
  }

  if (/\bnet-mark\b/.test(main) && /class="[^"]*\bmedia-empty\b/.test(main)) {
    errors.push(`${rel} empty media placeholder`);
  }
  if (/\bmedia-empty\b/.test(main) || /\baff-row--no-photo\b/.test(main)) {
    placeholderCount += 1;
    errors.push(`${rel} empty photo placeholder class`);
  }

  for (const card of CARD_NEEDS_PHOTO) {
    card.re.lastIndex = 0;
    let m;
    while ((m = card.re.exec(main))) {
      if (card.name === 'food-row' && /class="[^"]*\bis-text\b/.test(m[0].slice(0, 80))) continue;
      if (!/<img\b/i.test(m[1])) {
        placeholderCount += 1;
        errors.push(`${rel} .${card.name} missing <img>`);
      }
    }
  }
}

if (errors.length) {
  console.error(`check-unique-photos failed (${errors.length})`);
  console.error(`  pages with repeats: ${pagesWithDupes}  unique-src collisions: ${dupeCount}  placeholders: ${placeholderCount}`);
  for (const err of errors.slice(0, 80)) console.error(`  ${err}`);
  if (errors.length > 80) console.error(`  ... ${errors.length - 80} more`);
  process.exit(1);
}

console.log(
  `check-unique-photos ok (${pages.length} html pages, 0 repeated content images, 0 placeholders)`,
);
