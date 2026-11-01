import type { Affiliate, EditorialCard, Page, Portrait } from './content';
import { MORE_PAGES } from './pages-rest';
import { FINAL_PAGES } from './pages-final';
import { LAO_DISHES } from './dishes';
import { flightLink, hotelSearchListUrl, trainLink, transferLink } from './partners';

function D(text: string): string {
  let value = text.replace(/\s+/g, ' ').trim();
  if (value.length < 130) value = `${value} Times below are typical.`;
  if (value.length > 155) {
    const cut = value.slice(0, 155).lastIndexOf(' ');
    value = value.slice(0, cut >= 130 ? cut : 155).trim();
  }
  if (value.length < 130 || value.length > 155) throw new Error(`description ${value.length}: ${value}`);
  return value;
}

function T(path: string, text: string): string {
  if (text.length < 45 || text.length > 60) throw new Error(`${path} title ${text.length}: ${text}`);
  return text;
}

function L(path: string, text: string): string {
  if (text.length < 70 || text.length > 280) throw new Error(`${path} lede ${text.length}: ${text}`);
  if (!/\b(known for|known as|if you|first|for [a-z]|pick|fly|come for|use|land|is the|is a|are a|not a|these are|this is|sleep|stay|fits)\b/i.test(text)) {
    throw new Error(`${path} lede missing who-it-fits`);
  }
  return text;
}

const p = (file: string) => `/photos/${file}.jpg`;

function crumbs(items: [string, string][]): { name: string; href: string }[] {
  return items.map(([name, href]) => ({ name, href }));
}

function card(kicker: string, title: string, href: string, photo: string): EditorialCard {
  return { kicker, title, href, photo, bullets: [] };
}

function stay(title: string, body: string, href: string, photo: string, cta = 'See stays'): Affiliate {
  return { title, kicker: 'Trip.com', body, href, cta, photo, partner: 'stay' };
}

function flight(title: string, body: string, href: string, photo: string): Affiliate {
  return { title, kicker: 'Trip.com', body, href, cta: 'Search flights', photo, partner: 'flights' };
}

const portraits = {
  lp: { title: 'Luang Prabang', href: '/luang-prabang', photo: p('luang-prabang') },
  vte: { title: 'Vientiane', href: '/vientiane', photo: p('vientiane') },
  vv: { title: 'Vang Vieng', href: '/vang-vieng', photo: p('vang-vieng') },
  islands: { title: '4000 Islands', href: '/4000-islands', photo: p('si-phan-don') },
  pakse: { title: 'Pakse', href: '/pakse', photo: p('pakse') },
  bolaven: { title: 'Bolaven Plateau', href: '/bolaven-plateau', photo: p('bolaven') },
  nk: { title: 'Nong Khiaw', href: '/nong-khiaw', photo: p('nong-khiaw') },
  food: { title: 'Lao food', href: '/lao-food', photo: p('lao-food') },
  rail: { title: 'Laos-China Railway', href: '/get-there/laos-china-railway', photo: p('lcr-train') },
} satisfies Record<string, Portrait>;

function rails(keys: (keyof typeof portraits)[]): Portrait[] {
  return keys.map((key) => portraits[key]);
}

const BASE_PAGES: Page[] = [
  {
    path: '/',
    title: 'Laos',
    metaTitle: T('/', 'Laos Travel Guide: Towns, Trains, and River Days'),
    description: 'First-trip Laos.',
    metaDescription: D('Plan a first Laos trip around Luang Prabang, Vientiane, and one river town. Trains, eVisa notes, and the dishes to order.'),
    lede: L('/', 'This is the first-trip map: Luang Prabang for temples and a waterfall, Vientiane for the landing, and one extra town if you have the days.'),
    schema: 'Article',
    crumbs: [],
    facts: [
      { label: 'First week', value: 'Luang Prabang plus Vientiane' },
      { label: 'Train', value: 'About 2 hours, Vientiane to Luang Prabang' },
      { label: 'Easy months', value: 'November to February' },
    ],
    chips: ['Luang Prabang', 'Vientiane', 'Railway', 'Food'],
    photo: p('luang-prabang'),
    paragraphs: [],
    faqs: [],
    portraits: rails(['vte', 'vv', 'pakse']),
    showStay: true,
    showMap: true,
  },
  {
    path: '/destinations',
    title: 'Destinations',
    metaTitle: T('/destinations', 'Laos Destinations: River Towns and the Far South'),
    description: 'Towns.',
    metaDescription: D('Compare Luang Prabang, Vientiane, Vang Vieng, Nong Khiaw, Pakse, the Bolaven Plateau, and the 4000 Islands.'),
    lede: L('/destinations', 'These are the places a first trip can actually reach: two cities, one karst stop, a quiet river town, and the south.'),
    schema: 'Article',
    crumbs: crumbs([['Home', '/'], ['Destinations', '/destinations']]),
    facts: [
      { label: 'North base', value: 'Luang Prabang' },
      { label: 'Capital', value: 'Vientiane, Wattay airport' },
      { label: 'South base', value: 'Pakse, then a day out' },
    ],
    photo: p('destinations'),
    paragraphs: ['Pick two bases, not five. The train covers the middle of the country in about 2 hours between Vientiane and Luang Prabang.'],
    sections: [{
      id: 'towns',
      title: 'Towns on this edition',
      cards: [
        card('North', 'Luang Prabang', '/luang-prabang', p('luang-prabang-palace')),
        card('Capital', 'Vientiane', '/vientiane', p('vientiane')),
        card('Karst', 'Vang Vieng', '/vang-vieng', p('vang-vieng')),
        card('River', 'Nong Khiaw', '/nong-khiaw', p('nong-khiaw')),
        card('South', 'Pakse', '/pakse', p('pakse')),
        card('Falls', 'Bolaven Plateau', '/bolaven-plateau', p('tad-fane')),
        card('Islands', '4000 Islands', '/4000-islands', p('don-det')),
      ],
    }],
    faqs: [],
    portraits: [
      portraits.food,
      portraits.rail,
      { title: 'That Luang', href: '/attractions/pha-that-luang', photo: p('that-luang') },
    ],
    showMap: true,
  },
  {
    path: '/luang-prabang',
    title: 'Luang Prabang',
    metaTitle: T('/luang-prabang', 'Luang Prabang Guide: Temples, Falls, and Dawn Alms'),
    description: 'LP.',
    metaDescription: D('Luang Prabang fits a first Laos trip: dawn alms, Kuang Si, Pak Ou, and the night market. About 2 hours by train from Vientiane.'),
    lede: L('/luang-prabang', 'Luang Prabang is the town to stay in first if you want temples, a waterfall day, and a walkable night market on a peninsula.'),
    schema: 'City',
    crumbs: crumbs([['Home', '/'], ['Destinations', '/destinations'], ['Luang Prabang', '/luang-prabang']]),
    facts: [
      { label: 'Airport', value: 'LPQ, about 10 minutes from the old town' },
      { label: 'Train', value: 'About 2 hours from Vientiane' },
      { label: 'Stay', value: 'Old peninsula, near the night market' },
    ],
    chips: ['Kuang Si', 'Alms', 'Pak Ou', 'Night market'],
    photo: p('luang-prabang'),
    geo: { lat: 19.886, lon: 102.135, containedIn: 'Laos' },
    paragraphs: ['The old streets sit between the Mekong and the Nam Khan. Walk them at dawn for alms, and again after 17:00 when the night market fills the main road.'],
    sections: [
      {
        id: 'sights',
        title: 'Top sights',
        cards: [
          card('Falls', 'Kuang Si Falls', '/attractions/kuang-si-falls', p('kuang-si')),
          card('Caves', 'Pak Ou Caves', '/attractions/pak-ou-caves', p('pak-ou')),
          card('Hill', 'Mount Phousi', '/attractions/mount-phousi', p('phousi')),
          card('Dawn', 'Alms giving', '/attractions/luang-prabang-alms-giving', p('alms')),
          card('Temple', 'Wat Xieng Thong', '/attractions/wat-xieng-thong', p('xieng-thong')),
        ],
      },
      {
        id: 'around',
        title: 'Getting around',
        bullets: [
          'The station is outside the old peninsula. Allow about 20 minutes by car.',
          'Tuk-tuks run short hops in town. Agree the price before you sit.',
          'Kuang Si is a half day. Pak Ou is a boat morning.',
        ],
      },
    ],
    faqs: [
      { q: 'How many nights are enough?', a: 'Three nights covers alms, one temple morning, Kuang Si, and a slow afternoon. Add a fourth if you want Pak Ou without rushing.' },
      { q: 'Where should you sleep?', a: 'The peninsula is the point. A room near the night market keeps Kuang Si transfers and the dawn alms walk short.' },
    ],
    portraits: rails(['vte', 'vv', 'nk']),
    affiliates: [
      stay('Luang Prabang hotels', 'Old-town rooms and guesthouses on the peninsula.', hotelSearchListUrl('luang-prabang'), p('luang-prabang-night')),
      flight('Flights into LPQ', 'Bangkok and Hanoi both fly into Luang Prabang.', flightLink('BKK', 'LPQ'), p('lpq-airport')),
    ],
    showStay: true,
  },
  {
    path: '/vientiane',
    title: 'Vientiane',
    metaTitle: T('/vientiane', 'Vientiane Guide: That Luang, Patuxai, and the River'),
    description: 'VTE.',
    metaDescription: D('Vientiane is the easy first landing: Wattay airport, That Luang, Patuxai, and the Mekong promenade. A calm capital, not a rush.'),
    lede: L('/vientiane', 'Vientiane is the capital to land in, see two monuments, and leave by train. It fits a first or last night, not a whole week.'),
    schema: 'City',
    crumbs: crumbs([['Home', '/'], ['Destinations', '/destinations'], ['Vientiane', '/vientiane']]),
    facts: [
      { label: 'Airport', value: 'Wattay (VTE), close to the center' },
      { label: 'Two stations', value: 'Khamsavath and the Laos-China station' },
      { label: 'Train north', value: 'About 2 hours to Luang Prabang' },
    ],
    chips: ['That Luang', 'Patuxai', 'Mekong', 'Wattay'],
    photo: p('vientiane'),
    geo: { lat: 17.975, lon: 102.633, containedIn: 'Laos' },
    paragraphs: ['The riverfront and Lane Xang Avenue are the useful spine. That Luang sits a short ride northeast. Do not plan to walk every sight in one afternoon.'],
    sections: [
      {
        id: 'sights',
        title: 'Top sights',
        cards: [
          card('Stupa', 'Pha That Luang', '/attractions/pha-that-luang', p('that-luang')),
          card('Monument', 'Patuxai', '/attractions/patuxai', p('patuxai')),
          card('Park', 'Buddha Park', '/attractions/buddha-park', p('buddha-park')),
          card('Temple', 'Wat Si Saket', '/vientiane', p('wat-sisaket')),
        ],
      },
      {
        id: 'stations',
        title: 'Two different stations',
        bullets: [
          'Thai trains arrive at Khamsavath, also called Vientiane-Tai.',
          'Laos-China trains use Vientiane Railway Station, on another side of the city.',
          'The road transfer between them is about 30 minutes. Do not book a tight same-day connection.',
        ],
      },
    ],
    faqs: [
      { q: 'Is one night enough?', a: 'Yes, if you are only changing trains or flights. Stay two nights if you want That Luang and Buddha Park without a dawn start.' },
    ],
    portraits: rails(['lp', 'vv', 'pakse']),
    affiliates: [
      stay('Vientiane hotels', 'Riverside and center hotels near the night market.', hotelSearchListUrl('vientiane'), p('vientiane-lane-xang')),
      flight('Flights into VTE', 'Bangkok to Wattay is the usual first hop.', flightLink('BKK', 'VTE'), p('wattay')),
    ],
    showStay: true,
  },
  {
    path: '/vang-vieng',
    title: 'Vang Vieng',
    metaTitle: T('/vang-vieng', 'Vang Vieng Guide: Karst Lagoons and the Nam Song'),
    description: 'VV.',
    metaDescription: D('Vang Vieng fits a night or two between Vientiane and Luang Prabang. Blue lagoons, a viewpoint, and the railway stop in town.'),
    lede: L('/vang-vieng', 'Vang Vieng is the karst stop on the railway. It fits travelers who want a swim and a viewpoint, not a long party weekend.'),
    schema: 'City',
    crumbs: crumbs([['Home', '/'], ['Destinations', '/destinations'], ['Vang Vieng', '/vang-vieng']]),
    facts: [
      { label: 'By train', value: 'Under 1 hour from Vientiane on fast trains' },
      { label: 'Town river', value: 'Nam Song, walkable from most guesthouses' },
      { label: 'Lagoon', value: 'About 30 minutes by tuk-tuk' },
    ],
    chips: ['Blue Lagoon', 'Viewpoint', 'Nam Song', 'Railway'],
    photo: p('vang-vieng'),
    geo: { lat: 18.932, lon: 102.448, containedIn: 'Laos' },
    paragraphs: ['Sleep near the river if you want the balloon dawn and an easy walk to dinner. The lagoons are outside town on rough side roads.'],
    sections: [{
      id: 'sights',
      title: 'Top sights',
      cards: [
        card('Swim', 'Blue Lagoon', '/attractions/vang-vieng-blue-lagoon', p('blue-lagoon')),
        card('View', 'Karst and river', '/vang-vieng', p('pha-ngeun')),
        card('Cave', 'Tham Jang area', '/vang-vieng', p('tham-jang')),
        card('Dawn', 'Balloon hour', '/vang-vieng', p('hot-air')),
      ],
    }],
    faqs: [
      { q: 'Is one night enough?', a: 'One night works if the train times line up and you only want the river. Two nights lets you swim and still make a morning train.' },
    ],
    portraits: rails(['lp', 'vte', 'nk']),
    affiliates: [
      stay('Vang Vieng hotels', 'River and town hotels on the Nam Song.', hotelSearchListUrl('vang-vieng'), p('vang-vieng-river')),
      flight('Then fly from LPQ', 'Continue north by train, or fly out of Luang Prabang.', flightLink('LPQ', 'BKK'), p('lcr-station')),
    ],
    showStay: true,
  },
  {
    path: '/4000-islands',
    title: '4000 Islands',
    metaTitle: T('/4000-islands', '4000 Islands Guide: Don Det, Don Khon, and Falls'),
    description: 'Islands.',
    metaDescription: D('Si Phan Don is the slow Mekong stop in the far south. Don Det for hammocks, Don Khon for the bridge, Khone Phapheng for the falls.'),
    lede: L('/4000-islands', 'The 4000 Islands are for travelers who want the Mekong to slow down. Don Det and Don Khon are the pair most first trips sleep on.'),
    schema: 'TouristDestination',
    crumbs: crumbs([['Home', '/'], ['Destinations', '/destinations'], ['4000 Islands', '/4000-islands']]),
    facts: [
      { label: 'Gateway', value: 'Pakse, then a road south' },
      { label: 'Road time', value: 'About 3 hours, Pakse to the boat pier' },
      { label: 'Main falls', value: 'Khone Phapheng, a separate ticket' },
    ],
    chips: ['Don Det', 'Don Khon', 'Khone Phapheng', 'Mekong'],
    photo: p('si-phan-don'),
    geo: { lat: 13.95, lon: 105.92, containedIn: 'Champasak, Laos' },
    paragraphs: ['Boats from the mainland pier take about 15 minutes to Don Det. The old railway bridge links Don Det to Don Khon on foot or by bicycle.'],
    sections: [{
      id: 'sights',
      title: 'What to do',
      cards: [
        card('Falls', 'Khone Phapheng', '/attractions/khone-phapheng-falls', p('khone-phapheng')),
        card('Island', 'Don Det bank', '/4000-islands', p('don-det')),
        card('Bridge', 'Don Khon bridge', '/4000-islands', p('don-khon')),
      ],
    }],
    faqs: [
      { q: 'Which island should you sleep on?', a: 'Don Det is the busier sunrise-and-hammock island. Don Khon is quieter and closer to the bridge walk. Either works for a first stay of two nights.' },
    ],
    portraits: rails(['pakse', 'bolaven', 'lp']),
    affiliates: [
      stay('Pakse hotels', 'Sleep in Pakse the night you land, then ride south in the morning.', hotelSearchListUrl('pakse'), p('pakse-market')),
      flight('Fly into Pakse', 'Bangkok to Pakse is the short way into the south.', flightLink('BKK', 'PKZ'), p('mekong-ferry')),
    ],
    showStay: true,
  },
  {
    path: '/pakse',
    title: 'Pakse',
    metaTitle: T('/pakse', 'Pakse Guide: Mekong Hub for Wat Phou and Falls'),
    description: 'Pakse.',
    metaDescription: D('Pakse is the southern base. Fly in, sleep by the Mekong, then day-trip to Wat Phou, the Bolaven Plateau, or the 4000 Islands.'),
    lede: L('/pakse', 'Pakse is the southern hub, not the sight itself. It fits a night on the way to Wat Phou, the Bolaven Plateau, or the islands.'),
    schema: 'City',
    crumbs: crumbs([['Home', '/'], ['Destinations', '/destinations'], ['Pakse', '/pakse']]),
    facts: [
      { label: 'Airport', value: 'PKZ, a short ride into town' },
      { label: 'Wat Phou', value: 'About 1 hour south by road' },
      { label: 'Bolaven', value: 'About 1 hour to Tad Fane' },
    ],
    chips: ['Wat Phou', 'Bolaven', 'Mekong', 'Market'],
    photo: p('pakse'),
    geo: { lat: 15.12, lon: 105.799, containedIn: 'Laos' },
    paragraphs: ['The French-era grid is small. Use it for dinner and a market walk, then leave in the morning. A day trip returns before dark on the usual roads.'],
    sections: [{
      id: 'days',
      title: 'Day trips',
      cards: [
        card('Temple', 'Wat Phou', '/attractions/wat-phou', p('wat-phou')),
        card('Falls', 'Tad Fane', '/attractions/tad-fane', p('tad-fane')),
        card('Market', 'Pakse market', '/pakse', p('pakse-market')),
        card('Islands', '4000 Islands', '/4000-islands', p('don-khon')),
      ],
    }],
    faqs: [
      { q: 'Can you see Wat Phou and the falls in one day?', a: 'Not well. Wat Phou is south. Tad Fane is up on the plateau. Give each its own day if both matter.' },
    ],
    portraits: rails(['bolaven', 'islands', 'vte']),
    affiliates: [
      stay('Pakse hotels', 'Mekong-side hotels for the nights between day trips.', hotelSearchListUrl('pakse'), p('champasak')),
      flight('Flights into PKZ', 'Bangkok and Vientiane both connect to Pakse.', flightLink('VTE', 'PKZ'), p('friendship-bridge')),
    ],
    showStay: true,
  },
  {
    path: '/bolaven-plateau',
    title: 'Bolaven Plateau',
    metaTitle: T('/bolaven-plateau', 'Bolaven Plateau Guide: Falls, Coffee, and Cool Air'),
    description: 'Bolaven.',
    metaDescription: D('The Bolaven Plateau is the waterfall day from Pakse. Tad Fane and Tad Yuang sit above coffee country. Roads are slow after rain.'),
    lede: L('/bolaven-plateau', 'The Bolaven Plateau is known for twin waterfalls and coffee. It fits a day from Pakse, or a night if you want the rim at opening time.'),
    schema: 'TouristDestination',
    crumbs: crumbs([['Home', '/'], ['Destinations', '/destinations'], ['Bolaven Plateau', '/bolaven-plateau']]),
    facts: [
      { label: 'From Pakse', value: 'About 1 hour to Tad Fane' },
      { label: 'Main falls', value: 'Tad Fane and Tad Yuang' },
      { label: 'Roads', value: 'Slower after heavy rain' },
    ],
    chips: ['Tad Fane', 'Tad Yuang', 'Coffee', 'Pakse'],
    photo: p('bolaven'),
    geo: { lat: 15.22, lon: 106.25, containedIn: 'Champasak, Laos' },
    paragraphs: ['Most visitors hire a car and driver for the loop. Waterfalls charge a small cash ticket. Coffee stops sit between the falls, not in a single town center.'],
    sections: [{
      id: 'falls',
      title: 'Waterfalls',
      cards: [
        card('Twin falls', 'Tad Fane', '/attractions/tad-fane', p('tad-fane')),
        card('Rim walk', 'Tad Yuang', '/bolaven-plateau', p('tad-yuang')),
        card('Base', 'Pakse', '/pakse', p('pakse-market')),
      ],
    }],
    faqs: [
      { q: 'Do you need your own wheels?', a: 'A driver for the day is the usual plan. The sights are spread out, and the last light goes quickly on the way back to Pakse.' },
    ],
    portraits: rails(['pakse', 'islands', 'lp']),
    affiliates: [
      stay('Pakse hotels', 'The practical bed is in Pakse, not on the plateau rim.', hotelSearchListUrl('pakse'), p('season')),
      flight('Reach the south', 'Fly to Pakse, then drive up the next morning.', flightLink('BKK', 'PKZ'), p('friendship-bridge')),
    ],
    showStay: true,
  },
  {
    path: '/nong-khiaw',
    title: 'Nong Khiaw',
    metaTitle: T('/nong-khiaw', 'Nong Khiaw Guide: Nam Ou Gorge and the Viewpoint'),
    description: 'NK.',
    metaDescription: D('Nong Khiaw is the quiet river town north of Luang Prabang. A viewpoint, the Nam Ou, and about 3 hours by minivan from the old city.'),
    lede: L('/nong-khiaw', 'Nong Khiaw is the gorge town for travelers who already like Luang Prabang and want one quieter night by the Nam Ou.'),
    schema: 'TouristDestination',
    crumbs: crumbs([['Home', '/'], ['Destinations', '/destinations'], ['Nong Khiaw', '/nong-khiaw']]),
    facts: [
      { label: 'From Luang Prabang', value: 'About 3 hours by minivan' },
      { label: 'Viewpoint', value: 'A steep walk above town' },
      { label: 'River', value: 'Nam Ou, under the bridge' },
    ],
    chips: ['Viewpoint', 'Nam Ou', 'Minivan', 'Quiet'],
    photo: p('nong-khiaw'),
    geo: { lat: 20.571, lon: 102.611, containedIn: 'Laos' },
    paragraphs: ['There is no airport and no high-speed station in town. The minivan from Luang Prabang is the normal way in. Sleep two nights if you want the viewpoint without a same-day turnaround.'],
    sections: [{
      id: 'sights',
      title: 'In town',
      cards: [
        card('Climb', 'Viewpoint', '/attractions/nong-khiaw-viewpoint', p('nong-khiaw-view')),
        card('Base', 'Luang Prabang', '/luang-prabang', p('luang-prabang-night')),
        card('South', 'Pakse if you continue', '/pakse', p('pakse')),
      ],
    }],
    faqs: [
      { q: 'Is it on the railway?', a: 'No. The Laos-China line serves Luang Prabang. Nong Khiaw is a road trip north from there, about 3 hours.' },
    ],
    portraits: rails(['lp', 'vv', 'vte']),
    affiliates: [
      stay('Luang Prabang hotels', 'The night before the van is easier in Luang Prabang.', hotelSearchListUrl('luang-prabang'), p('phousi')),
      flight('Fly into LPQ', 'Land in Luang Prabang, then ride north the next morning.', flightLink('HAN', 'LPQ'), p('lpq-airport')),
    ],
    showStay: true,
  },
];

export const PAGES: Page[] = [...BASE_PAGES, ...MORE_PAGES, ...FINAL_PAGES];
