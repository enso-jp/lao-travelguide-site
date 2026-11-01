#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const DIST = join(process.cwd(), 'dist');
const PUBLIC = join(process.cwd(), 'public');
const errors = [];

function walkHtml(dir, files = []) {
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

if (!existsSync(DIST)) {
  console.error('check-built-seo skipped: dist/ missing');
  process.exit(1);
}

if (!existsSync(join(DIST, '404.html'))) {
  errors.push('dist/404.html is missing');
} else {
  const html404 = readFileSync(join(DIST, '404.html'), 'utf8');
  if (!/noindex/i.test(html404)) errors.push('dist/404.html must be noindex');
  if (!html404.includes('rel="canonical" href="https://laos-travelguide.com/404.html"')) {
    errors.push('dist/404.html canonical must be https://laos-travelguide.com/404.html');
  }
  if (!/Laos\s+<span>Guide<\/span>/.test(html404)) errors.push('dist/404.html missing site wordmark');
  if (!/name="q"/.test(html404)) errors.push('dist/404.html missing search box');
}
if (!existsSync(join(DIST, 'sitemap.xml'))) {
  errors.push('dist/sitemap.xml is missing');
}
if (existsSync(join(DIST, 'sitemap-index.xml'))) {
  errors.push('dist/sitemap-index.xml must not be produced');
}

const sitemap = existsSync(join(DIST, 'sitemap.xml'))
  ? readFileSync(join(DIST, 'sitemap.xml'), 'utf8')
  : '';
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (locs.length === 0) errors.push('dist/sitemap.xml has no <loc> entries');
const sitemapZero = existsSync(join(DIST, 'sitemap-0.xml'))
  ? readFileSync(join(DIST, 'sitemap-0.xml'), 'utf8')
  : '';
if (sitemapZero && sitemapZero !== sitemap) {
  errors.push('dist/sitemap.xml must match dist/sitemap-0.xml so Search Console gets one urlset');
}
for (const loc of locs) {
  const url = new URL(loc);
  if (!url.pathname.endsWith('/')) {
    errors.push(`sitemap loc missing trailing slash: ${loc}`);
  }
  if (url.pathname === '/404' || url.pathname === '/404/' || url.pathname.endsWith('/404.html')) {
    errors.push(`sitemap must not include 404: ${loc}`);
  }
  if (url.pathname === '/search' || url.pathname === '/search/' || url.pathname.startsWith('/search/')) {
    errors.push(`sitemap must not include search: ${loc}`);
  }
  if (url.pathname.startsWith('/stories/')) {
    const escaped = loc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const dated = new RegExp(`<loc>${escaped}</loc><lastmod>(\\d{4}-\\d{2}-\\d{2})</lastmod>`);
    if (!dated.test(sitemap)) errors.push(`story URL missing YYYY-MM-DD lastmod: ${loc}`);
  }
}
for (const lastmod of sitemap.matchAll(/<lastmod>([^<]*)<\/lastmod>/g)) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(lastmod[1])) {
    errors.push(`sitemap lastmod must be YYYY-MM-DD: ${lastmod[1]}`);
  }
}

const robots = readFileSync(join(DIST, 'robots.txt'), 'utf8');
if (!/Disallow:\s*\/search/.test(robots)) errors.push('dist/robots.txt missing Disallow: /search');
if (!robots.includes('sitemap.xml')) errors.push('dist/robots.txt missing sitemap.xml');
if (/sitemap-index\.xml/.test(robots)) errors.push('dist/robots.txt must not list sitemap-index.xml');

const pages = walkHtml(DIST);
const indexable = [];
for (const file of pages) {
  const html = readFileSync(file, 'utf8');
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? '';
  const desc = html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '';
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1] ?? '';
  const rel = file.slice(DIST.length);
  if (title.length < 45 || title.length > 60) {
    errors.push(`${rel} title is ${title.length} chars: ${title}`);
  }
  if (desc.length < 130 || desc.length > 155) {
    errors.push(`${rel} description is ${desc.length} chars`);
  }
  if (canonical && !canonical.endsWith('/')) {
    errors.push(`${rel} canonical missing trailing slash: ${canonical}`);
  }
  const robotsMeta = html.match(/<meta name="robots" content="([^"]*)"/)?.[1] ?? '';
  const decode = (value) => value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'");
  const crumbBlocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map((match) => {
      try { return JSON.parse(match[1]); } catch { return null; }
    })
    .filter((block) => block && block['@type'] === 'BreadcrumbList');
  const nav = html.match(/<nav class="crumbs"[\s\S]*?<\/nav>/);
  const visibleNames = nav
    ? [...nav[0].matchAll(/<a [^>]*>([^<]*)<\/a>/g)].map((match) => decode(match[1]))
    : [];
  if (rel === '/index.html' && crumbBlocks.length) {
    errors.push('/index.html must not emit a one-item BreadcrumbList');
  }
  if (crumbBlocks.length > 1) errors.push(`${rel} has ${crumbBlocks.length} BreadcrumbList blocks`);
  if (crumbBlocks.length === 1) {
    const items = crumbBlocks[0].itemListElement || [];
    const names = items.map((item) => item.name);
    if (items.length < 2) errors.push(`${rel} BreadcrumbList has ${items.length} items`);
    const positions = items.map((item) => item.position);
    if (positions.some((position, index) => position !== index + 1)) {
      errors.push(`${rel} breadcrumb positions are not 1..n`);
    }
    const lastItem = items.length ? items[items.length - 1].item : '';
    if (canonical && lastItem !== canonical) {
      errors.push(`${rel} last breadcrumb item is not the canonical`);
    }
    if (names.join('\n') !== visibleNames.join('\n')) {
      errors.push(`${rel} visible crumbs do not match BreadcrumbList`);
    }
  } else if (visibleNames.length) {
    errors.push(`${rel} has a visible breadcrumb and no BreadcrumbList`);
  }
  if (canonical && !canonical.includes('/search/') && !/noindex/i.test(robotsMeta)) {
    indexable.push(canonical);
  }
  const affRows = [...html.matchAll(/<a[^>]*class="[^"]*\baff-row\b[^"]*"[^>]*>([\s\S]*?)<\/a>/g)];
  for (const m of affRows) {
    if (!/class="[^"]*\baff-photo\b[^"]*"/.test(m[1])) {
      errors.push(`${rel} .aff-row missing .aff-photo`);
    }
  }
  for (const cls of ['jg-card', 'food-card']) {
    const cards = [...html.matchAll(new RegExp(`<a[^>]*class="[^"]*\\\\b${cls}\\\\b[^"]*"[^>]*>([\\\\s\\\\S]*?)<\\\\/a>`, 'g'))];
    for (const m of cards) {
      if (!/<img\b/.test(m[1])) {
        errors.push(`${rel} .${cls} missing <img>`);
      }
    }
  }
  const imgs = [...html.matchAll(/<img\b([^>]*)>/g)];
  for (const img of imgs) {
    const src = img[1].match(/\bsrc="([^"]*)"/)?.[1];
    if (!src) {
      errors.push(`${rel} <img> missing src attribute`);
    } else if (src.startsWith('/') && !existsSync(join(PUBLIC, src))) {
      errors.push(`${rel} <img> references missing file ${src}`);
    }
  }
  if (rel.includes('/itineraries/')) {
    const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] || html;
    const srcs = [...main.matchAll(/<img\b[^>]*\bsrc="([^"]+)"/g)].map((m) => m[1]);
    const seen = new Set();
    for (const src of srcs) {
      if (seen.has(src)) errors.push(`${rel} repeated photo in rendered HTML: ${src}`);
      seen.add(src);
    }
  }
}

// Old Trip.com SID 334225872 must never ship. Only the listed links still awaiting a Partner-generated
// replacement are tolerated; remove each entry as soon as its batch link lands.
{
  const OLD_SID_PENDING = [];
  const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : /\.(html|xml|json|js|txt)$/.test(e.name) ? [join(dir, e.name)] : []);
  for (const file of walk(DIST)) {
    const text = readFileSync(file, 'utf8').replace(/&amp;/g, '&');
    for (const m of text.matchAll(/[^"'\s<>]*334225872[^"'\s<>]*/g)) {
      if (!OLD_SID_PENDING.some((k) => m[0].includes(k))) errors.push(`${file.slice(DIST.length)} has old Trip.com SID 334225872: ${m[0].slice(0, 120)}`);
    }
  }
}

// Trip.com hrefs must never carry a raw space; spaces in query values are written as %20.
{
  const walkSp = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walkSp(join(dir, e.name)) : e.name.endsWith('.html') ? [join(dir, e.name)] : []);
  for (const file of walkSp(DIST)) {
    const html = readFileSync(file, 'utf8');
    for (const m of html.matchAll(/href="(https?:\/\/[^"]*trip\.com[^"]*)"/g)) {
      if (/\s/.test(m[1])) errors.push(`${file.slice(DIST.length)} has a raw space in a Trip.com href: ${m[1].slice(0, 120)}`);
    }
  }
}

// Markdown bold must render. Literal ** in visible HTML text means a formatter missed it.
{
  const walkMd = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walkMd(join(dir, e.name)) : e.name.endsWith('.html') ? [join(dir, e.name)] : []);
  for (const file of walkMd(DIST)) {
    const text = readFileSync(file, 'utf8')
      .replace(/<script\b[\s\S]*?<\/script>/gi, '')
      .replace(/<style\b[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ');
    const m = text.match(/.{0,40}\*\*.{0,40}/);
    if (m) errors.push(`${file.slice(DIST.length)} has literal ** in page text: ${m[0].trim()}`);
  }
}

// Walls of text: 3+ consecutive body paragraphs over 60 characters fail the build.
{
  const walkW = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walkW(join(dir, e.name)) : e.name.endsWith('.html') ? [join(dir, e.name)] : []);
  const walls = [];
  for (const file of walkW(DIST)) {
    const html = readFileSync(file, 'utf8');
    const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] || '';
    const runs = main.split(/<\/p>/i);
    let run = 0;
    let hit = false;
    for (const chunk of runs) {
      const m = chunk.match(/<p\b[^>]*>([\s\S]*)$/i);
      const between = m ? chunk.slice(0, chunk.length - m[0].length) : chunk;
      if (between.replace(/<[^>]+>/g, '').trim() || /<(h[1-6]|ul|ol|table|div|section|figure)\b/i.test(between)) run = 0;
      if (!m) { run = 0; continue; }
      const text = m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
      run = text.length > 60 ? run + 1 : 0;
      if (run >= 3) hit = true;
    }
    if (hit) walls.push(file.slice(DIST.length));
  }
  if (walls.length) {
    const msg = `wall-of-text warning: ${walls.length} pages with 3+ long paragraphs in a row (e.g. ${walls.slice(0, 5).join(', ')})`;
    errors.push(msg);
  } else {
    console.log('wall-of-text check ok (0 pages)');
  }
}

const locSet = new Set(locs);
for (const canonical of indexable) {
  if (!locSet.has(canonical)) errors.push(`sitemap missing indexable URL: ${canonical}`);
}
if (indexable.length && locs.length !== indexable.length) {
  errors.push(`sitemap has ${locs.length} URLs but ${indexable.length} indexable pages`);
}

if (errors.length) {
  console.error(`check-built-seo failed (${errors.length})`);
  for (const err of errors.slice(0, 80)) console.error(`  ${err}`);
  if (errors.length > 80) console.error(`  ... ${errors.length - 80} more`);
  process.exit(1);
}

console.log(`check-built-seo ok (${pages.length} html pages, ${locs.length} sitemap urls)`);
