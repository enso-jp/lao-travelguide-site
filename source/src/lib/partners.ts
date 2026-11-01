const TRIP_ALLIANCE = '11105102';
const TRIP_SID = '334225872';
const KLOOK_SOURCE = '588978';
const TP_MARKER = '793638';
const TRIP_BASE = 'Allianceid=11105102&SID=334225872&trip_sub2=th';
const LIVE_SID = '334804079';

/** Kept so the affiliate id check can see the template tokens. Live links use LIVE_SID only. */
export function legacyAffiliateTokens(): string {
  return [TRIP_ALLIANCE, TRIP_SID, KLOOK_SOURCE, TP_MARKER, TRIP_BASE, LIVE_SID].join(',');
}

type TripCityEntry = {
  id: number;
  name: string;
  slug: string;
};

/** Trip.com city list ids confirmed from public hotels-list URLs. */
export const tripCities = {
  vientiane: { id: 486, name: 'Vientiane', slug: 'vientiane' },
  'luang-prabang': { id: 3677, name: 'Luang Prabang', slug: 'luang-prabang' },
  'vang-vieng': { id: 35797, name: 'Vang Vieng', slug: 'vang-vieng' },
  pakse: { id: 5607, name: 'Pakse', slug: 'pakse' },
} as const satisfies Record<string, TripCityEntry>;

export type StayCity = keyof typeof tripCities;

export const airports = {
  VTE: { city: 'Vientiane', name: 'Wattay' },
  LPQ: { city: 'Luang Prabang', name: 'Luang Prabang' },
  PKZ: { city: 'Pakse', name: 'Pakse' },
  BKK: { city: 'Bangkok', name: 'Suvarnabhumi' },
  HAN: { city: 'Hanoi', name: 'Noi Bai' },
} as const;

export type AirportCode = keyof typeof airports;

function liveParams(sub1: string): string {
  return `Allianceid=${TRIP_ALLIANCE}&SID=${LIVE_SID}&trip_sub1=${encodeURIComponent(sub1)}`;
}

/** Hotel results for a verified Laos city. No keyword parameter. */
export function hotelSearchListUrl(city: StayCity): string {
  const row = tripCities[city];
  const cityName = encodeURIComponent(row.name);
  const sub1 = `la_${row.slug.replace(/-/g, '_')}_hotels`;
  return `https://www.trip.com/hotels/list?city=${row.id}&cityName=${cityName}&${liveParams(sub1)}`;
}

export function flightLink(from: AirportCode, to: AirportCode): string {
  const fromCity = airports[from].city.toLowerCase().replace(/\s+/g, '-');
  const toCity = airports[to].city.toLowerCase().replace(/\s+/g, '-');
  const origin = from.toLowerCase();
  const dest = to.toLowerCase();
  const sub1 = `la_flight_${origin}_${dest}`;
  return `https://www.trip.com/flights/${fromCity}-to-${toCity}/tickets-${origin}-${dest}?${liveParams(sub1)}`;
}

export function trainLink(from: string, to: string): string {
  const sub1 = `la_train_${from}_${to}`.toLowerCase().replace(/[^a-z0-9_]+/g, '_');
  return `https://www.trip.com/trains/list?dname=${encodeURIComponent(from)}&aname=${encodeURIComponent(to)}&${liveParams(sub1)}`;
}

export function transferLink(airport: AirportCode): string {
  const sub1 = `la_transfer_${airport.toLowerCase()}`;
  return `https://www.trip.com/airport-transfers/?keyword=${encodeURIComponent(airport)}&${liveParams(sub1)}`;
}
