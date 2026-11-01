export const site = {
  name: 'Laos Travel Guide',
  shortName: 'Laos Guide',
  domain: 'laos-travelguide.com',
  url: 'https://laos-travelguide.com',
  description:
    'Plan a first trip to Laos with Luang Prabang, Vientiane, the railway, and the southern river towns. Facts first.',
  locale: 'en_US',
  themeColor: '#ffffff',
  publisher: 'Beyond Guide Network',
} as const;

const STATIC_FILE = /\.[a-z0-9]{2,8}$/i;

/** Internal page href with a trailing slash. Files, hashes, and absolute URLs stay as they are. */
export function pageHref(path: string): string {
  if (!path) return '/';
  if (/^(https?:|mailto:|tel:|data:)/i.test(path)) return path;
  if (path.startsWith('#')) return path;

  const hashIndex = path.indexOf('#');
  const hash = hashIndex >= 0 ? path.slice(hashIndex) : '';
  const beforeHash = hashIndex >= 0 ? path.slice(0, hashIndex) : path;

  const queryIndex = beforeHash.indexOf('?');
  const query = queryIndex >= 0 ? beforeHash.slice(queryIndex) : '';
  let pathname = queryIndex >= 0 ? beforeHash.slice(0, queryIndex) : beforeHash;

  if (!pathname || pathname === '/') return `/${query}${hash}`;
  if (!pathname.startsWith('/')) pathname = `/${pathname}`;
  if (STATIC_FILE.test(pathname)) return `${pathname}${query}${hash}`;
  if (!pathname.endsWith('/')) pathname = `${pathname}/`;
  return `${pathname}${query}${hash}`;
}

export function absUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    try {
      const url = new URL(path);
      if (url.hostname === site.domain || url.hostname === `www.${site.domain}`) {
        url.pathname = pageHref(url.pathname);
        return url.toString();
      }
    } catch {
      return path;
    }
    return path;
  }
  const href = pageHref(path);
  return href.startsWith('/') ? `${site.url}${href}` : href;
}

export type TrailCrumb = { name: string; href: string };

export function trailCrumbs(page: { path: string; crumbs?: TrailCrumb[] }): TrailCrumb[] {
  const crumbs = page.crumbs ?? [];
  if (!page.path || page.path === '/' || crumbs.length === 0) return [];
  if (crumbs.length === 1 && crumbs[0]?.href !== '/') {
    return [{ name: 'Home', href: '/' }, crumbs[0]];
  }
  return crumbs.length >= 2 ? crumbs : [];
}

/** Route key used in page.path and getStaticPaths. Home is `/`; other pages have no trailing slash. */
export function routePath(path: string): string {
  if (!path || path === '/') return '/';
  const clean = path.split('#')[0].split('?')[0].replace(/\/+$/, '');
  return clean.startsWith('/') ? clean : `/${clean}`;
}
