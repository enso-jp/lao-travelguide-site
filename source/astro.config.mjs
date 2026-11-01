import { copyFileSync, existsSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const SITE = 'https://laos-travelguide.com';

/** Publication or update date from story frontmatter. Google uses lastmod only when it is real. */
function storyLastmodByUrl() {
  const dir = join(process.cwd(), 'src/content/stories');
  const map = new Map();
  if (!existsSync(dir)) return map;
  let newest = '';
  for (const name of readdirSync(dir)) {
    if (!name.endsWith('.md')) continue;
    const text = readFileSync(join(dir, name), 'utf8');
    if (/^draft:\s*true\s*$/m.test(text)) continue;
    const date = text.match(/^date:\s*(\d{4}-\d{2}-\d{2})\s*$/m)?.[1];
    const updated = text.match(/^updated:\s*(\d{4}-\d{2}-\d{2})\s*$/m)?.[1];
    const lastmod = [date, updated].filter(Boolean).sort().at(-1);
    if (!lastmod) continue;
    map.set(`${SITE}/stories/${name.slice(0, -3)}/`, lastmod);
    if (lastmod > newest) newest = lastmod;
  }
  if (newest) map.set(`${SITE}/stories/`, newest);
  return map;
}

function xmlEscape(value) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Rewrite Astro's urlset so Search Console can read sitemap.xml directly, with lastmod on dated stories. */
function writeSearchConsoleSitemap(dir) {
  const sitemapZero = join(dir, 'sitemap-0.xml');
  if (!existsSync(sitemapZero)) return;
  const raw = readFileSync(sitemapZero, 'utf8');
  const locs = [...raw.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  const lastmods = storyLastmodByUrl();
  const urls = locs.map((loc) => {
    const lastmod = lastmods.get(loc);
    const locXml = xmlEscape(loc);
    return lastmod
      ? `  <url><loc>${locXml}</loc><lastmod>${lastmod}</lastmod></url>`
      : `  <url><loc>${locXml}</loc></url>`;
  });
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;
  writeFileSync(sitemapZero, xml);
  writeFileSync(join(dir, 'sitemap.xml'), xml);

  const indexPath = join(dir, 'sitemap-index.xml');
  if (existsSync(indexPath)) unlinkSync(indexPath);
}

function trailingSlashRedirects() {
  return {
    name: 'trailing-slash-redirects',
    hooks: {
      'astro:build:done': ({ dir, pages }) => {
        const lines = [
          '# Force trailing slashes on HTML pages so Google does not split impressions.',
        ];
        for (const page of pages) {
          const withSlash = page.pathname.endsWith('/') ? page.pathname : `${page.pathname}/`;
          const noSlash = withSlash.replace(/\/+$/, '');
          if (!noSlash || noSlash === '' || noSlash === '/404' || noSlash === '404') continue;
          lines.push(`${noSlash} ${withSlash} 301`);
        }
        writeFileSync(join(dir.pathname, '_redirects'), `${lines.join('\n')}\n`);
        const html404 = join(dir.pathname, '404.html');
        const nested404 = join(dir.pathname, '404', 'index.html');
        if (!existsSync(html404) && existsSync(nested404)) {
          copyFileSync(nested404, html404);
        }
        writeSearchConsoleSitemap(dir.pathname);
      },
    },
  };
}

export default defineConfig({
  site: 'https://laos-travelguide.com',
  trailingSlash: 'always',
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/search') && !page.includes('/404') && !page.includes('/embed/'),
      serialize(item) {
        const url = new URL(item.url);
        if (!/\.[a-z0-9]{2,8}$/i.test(url.pathname) && !url.pathname.endsWith('/')) {
          url.pathname = `${url.pathname}/`;
          item.url = url.toString();
        }
        return item;
      },
    }),
    trailingSlashRedirects(),
  ],
  compressHTML: true,
  build: { inlineStylesheets: 'always' },
});
