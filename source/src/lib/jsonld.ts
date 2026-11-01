import { reviewDateFor } from './review-dates';
import { site, absUrl, trailCrumbs } from './site';
import type { Page } from './content';
import { formatInline } from './inline';
import { seoDescription, seoTitle } from './seo';

const SITE_PUBLISHED = '2026-11-01';

function visibleText(text: string): string {
  return formatInline(text)
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"');
}

export function organizationLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${site.url}/#organization`,
    name: site.shortName,
    alternateName: [site.name, site.domain],
    url: `${site.url}/`,
    logo: {
      '@type': 'ImageObject',
      url: `${site.url}/icon-512.png`,
      width: 512,
      height: 512,
    },
    parentOrganization: {
      '@type': 'Organization',
      name: 'Beyond Guide Network',
      url: `${site.url}/about/`,
    },
    publishingPrinciples: `${site.url}/about/ratings/`,
  };
}

export function websiteLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${site.url}/#website`,
    name: site.shortName,
    alternateName: [site.name, site.domain],
    url: `${site.url}/`,
    description: site.description,
    inLanguage: 'en',
    publisher: { '@id': `${site.url}/#organization` },
  };
}

export function breadcrumbLd(page: Page) {
  const crumbs = trailCrumbs(page);
  if (crumbs.length < 2) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      item: absUrl(crumb.href),
    })),
  };
}

const NO_VISIBLE_FAQ = new Set(['/', '/lao-food', '/destinations']);

export function faqLd(page: Page) {
  if (!page.faqs.length || NO_VISIBLE_FAQ.has(page.path.replace(/\/+$/, '') || '/')) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: page.faqs.map((faq) => ({
      '@type': 'Question',
      name: visibleText(faq.q),
      acceptedAnswer: { '@type': 'Answer', text: visibleText(faq.a) },
    })),
  };
}

function isAttractionPath(path: string) {
  return /^\/attractions\/[^/]+\/?$/.test(path);
}

export function pageLd(page: Page) {
  const title = seoTitle(page);
  const description = seoDescription(page);
  const geo = page.geo
    ? { '@type': 'GeoCoordinates', latitude: page.geo.lat, longitude: page.geo.lon }
    : undefined;
  const containedInPlace = page.geo?.containedIn
    ? { '@type': 'Place', name: page.geo.containedIn }
    : undefined;
  let place: Record<string, unknown> | null = null;
  const common = {
    '@context': 'https://schema.org',
    name: title,
    description,
    url: absUrl(page.path),
    image: page.photo ? absUrl(page.photo) : undefined,
  };
  if (isAttractionPath(page.path)) {
    place = { ...common, '@type': 'TouristAttraction', geo, containedInPlace };
  } else if (page.schema === 'City') {
    place = { ...common, '@type': 'City', geo, containedInPlace };
  } else if (page.schema === 'TouristDestination') {
    place = { ...common, '@type': 'TouristDestination', geo, containedInPlace };
  }
  const modified = reviewDateFor(page.path);
  const article = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title.slice(0, 110),
    description,
    url: absUrl(page.path),
    mainEntityOfPage: absUrl(page.path),
    image: page.photo ? absUrl(page.photo) : undefined,
    datePublished: SITE_PUBLISHED,
    dateModified: modified,
    inLanguage: 'en',
    author: {
      '@type': 'Organization',
      name: 'Beyond Guide Network',
      url: `${site.url}/about/`,
    },
    publisher: { '@id': `${site.url}/#organization` },
  };
  return place ? [place, article] : [article];
}

export function jsonLdFor(page: Page) {
  return [organizationLd(), websiteLd(), ...(page.path === '/' ? [] : pageLd(page)), faqLd(page), breadcrumbLd(page)].filter(Boolean);
}
