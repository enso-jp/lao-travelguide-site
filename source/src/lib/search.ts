import { allPages, type Page } from './content';
import { pageHref } from './site';

export type SearchItem = {
  title: string;
  sub: string;
  group: string;
  href: string;
  text: string;
};

function groupFor(page: Page): string {
  if (page.path.startsWith('/attractions')) return 'Attractions';
  if (page.path.startsWith('/lao-food')) return 'Food';
  if (page.path.startsWith('/get-there') || page.path.startsWith('/itineraries')) return 'Routes';
  if (page.path.startsWith('/plan')) return 'Practical';
  if (page.schema === 'City' || page.schema === 'TouristDestination' || page.path === '/destinations') return 'Places';
  return 'Practical';
}

export function searchIndex(): SearchItem[] {
  return allPages()
    .filter((page) => page.path !== '/')
    .map((page) => ({
      title: page.title,
      sub: page.metaDescription,
      group: groupFor(page),
      href: pageHref(page.path),
      text: [page.title, page.lede, page.metaDescription, ...(page.chips || [])].join(' ').toLowerCase(),
    }));
}
