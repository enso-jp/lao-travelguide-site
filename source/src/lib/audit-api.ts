import { allPages } from './content';
import { LAO_DISHES } from './dishes';
import { homePhotoList } from './home';
import { tripCities } from './partners';

export const allDishes = LAO_DISHES;
export { allPages, tripCities };

export const CITY_FOOD_PATHS = new Set<string>();
export const WAVE23_ITINERARY_PAGES: unknown[] = [];

export function isDishPhoto(photo: string): boolean {
  return photo.includes('/dish-') || photo.endsWith('/lao-food.jpg') || photo.endsWith('/lao-coffee.jpg');
}

export function signatureDishesFor(reserved: string[] = []) {
  const skip = new Set(reserved);
  return allDishes
    .filter((dish) => !skip.has(dish.photo))
    .map((dish) => ({
      title: dish.title,
      nameLocal: dish.nameLocal,
      line: dish.line,
      photo: dish.photo,
      href: '/lao-food',
      find: `${dish.title} ${dish.nameLocal}`,
    }));
}

export function foodRowsFor(): unknown[] {
  return [];
}

export function mainPhotosFor(page: { path: string; photo?: string; portraits?: { photo?: string }[]; affiliates?: { photo?: string }[]; days?: { photo?: string }[]; sections?: { cards?: { photo?: string }[] }[] }): string[] {
  if (page.path === '/') return homePhotoList().filter(Boolean);
  const out: string[] = [];
  if (page.photo) out.push(page.photo);
  for (const item of page.portraits || []) if (item.photo) out.push(item.photo);
  for (const item of page.affiliates || []) if (item.photo) out.push(item.photo);
  for (const day of page.days || []) if (day.photo) out.push(day.photo);
  for (const section of page.sections || []) {
    for (const card of section.cards || []) if (card.photo) out.push(card.photo);
  }
  return out;
}
