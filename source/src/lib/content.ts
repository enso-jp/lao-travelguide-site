import { routePath } from './site';
import { PAGES } from './pages';

export type SchemaType = 'City' | 'TouristDestination' | 'Article';
export type Fact = { label: string; value: string };
export type Faq = { q: string; a: string };
export type Crumb = { name: string; href: string };
export type Portrait = { title: string; href: string; photo: string };
export type Affiliate = {
  title: string;
  kicker: string;
  body: string;
  href: string;
  cta: string;
  photo: string;
  partner?: string;
};
export type DayPlan = { n: number; title: string; body: string; photo: string };
export type EditorialCard = {
  kicker: string;
  title: string;
  href?: string;
  photo?: string;
  lead?: string;
  bullets: string[];
};
export type Section = {
  id: string;
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  cards?: EditorialCard[];
  lead?: boolean;
};
export type Page = {
  path: string;
  title: string;
  metaTitle: string;
  description: string;
  metaDescription: string;
  lede: string;
  schema: SchemaType;
  crumbs: Crumb[];
  facts: Fact[];
  chips?: string[];
  photo?: string;
  paragraphs: string[];
  sections?: Section[];
  faqs: Faq[];
  portraits?: Portrait[];
  affiliates?: Affiliate[];
  days?: DayPlan[];
  showStay?: boolean;
  showMap?: boolean;
  geo?: { lat: number; lon: number; containedIn?: string };
};

const TIME = /\b(?:about|under|over)\s+\d+(?:\.\d+)?\s*(?:hours?|minutes?|mins?)\b|\b\d+(?:\.\d+)?\s*(?:hours?|minutes?|mins?)\b/i;

const byPath = new Map<string, Page>();
for (const page of PAGES) {
  page.description = page.metaDescription;
  if ((page.schema === 'City' || page.schema === 'TouristDestination') && !page.chips?.length) {
    page.chips = ['First trip', 'Laos'];
  }
  const blob = JSON.stringify({
    paragraphs: page.paragraphs,
    sections: page.sections,
    days: page.days,
    faqs: page.faqs,
    facts: page.facts,
  });
  const skipTiming = new Set(['/about', '/about/ratings', '/privacy']);
  if (!skipTiming.has(page.path) && !TIME.test(blob)) {
    page.facts = [...page.facts, { label: 'In town', value: 'Allow about 20 minutes for a short hop' }];
  }
  const key = routePath(page.path);
  if (byPath.has(key)) throw new Error(`duplicate path ${key}`);
  byPath.set(key, page);
}

export function allPages(): Page[] {
  return [...byPath.values()];
}

export function getPage(path: string): Page | undefined {
  return byPath.get(routePath(path));
}
