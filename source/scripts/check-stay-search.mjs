#!/usr/bin/env node
/**
 * Crawl built pages that include the Trip.com stay search card.
 * Laos v1 uses the one Partner search box from the template, not invented city widgets.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const DIST = join(process.cwd(), 'dist');
const errors = [];

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

if (!existsSync(DIST)) {
  console.error('check-stay-search skipped: dist/ missing');
  process.exit(1);
}

const EMBED_HTML = '<iframe border="0" src="https://www.trip.com/partners/ad/S20729725?Allianceid=11105102&SID=334804079&trip_sub1=th_search_box" style="width:320px;height:320px" frameborder="0" scrolling="no" style="border:none" id="S20729725"></iframe>';
const pages = walkHtml(DIST);
let boxes = 0;

for (const file of pages) {
  const html = readFileSync(file, 'utf8');
  const rel = pagePath(file);
  if (!html.includes('data-trip-box')) continue;
  boxes += 1;
  const widgets = html.match(/<iframe[^>]+trip\.com\/partners\/ad\/[^>]*><\/iframe>/gi) || [];
  if (widgets.length !== 1 || widgets[0] !== EMBED_HTML) {
    errors.push(`${rel} must embed the Partner search box S20729725 once (found ${widgets.length})`);
  }
  const cardCount = (html.match(/data-trip-box/g) || []).length;
  if (cardCount !== 1) errors.push(`${rel} expected 1 stay search card, found ${cardCount}`);
}

if (boxes < 8) errors.push(`expected stay search on home, place, and food pages; found ${boxes}`);

if (errors.length) {
  console.error(`check-stay-search failed (${errors.length})`);
  for (const err of errors.slice(0, 40)) console.error(`  ${err}`);
  process.exit(1);
}

console.log(`check-stay-search ok (${boxes} search cards)`);
