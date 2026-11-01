import type { Affiliate, DayPlan, EditorialCard, Page, Portrait } from './content';
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
const crumbs = (items: [string, string][]) => items.map(([name, href]) => ({ name, href }));
const card = (kicker: string, title: string, href: string, photo: string): EditorialCard => ({ kicker, title, href, photo, bullets: [] });
const port = (title: string, href: string, photo: string): Portrait => ({ title, href, photo });
const stay = (title: string, body: string, href: string, photo: string): Affiliate => ({ title, kicker: 'Trip.com', body, href, cta: 'See stays', photo, partner: 'stay' });
const flight = (title: string, body: string, href: string, photo: string): Affiliate => ({ title, kicker: 'Trip.com', body, href, cta: 'Search flights', photo, partner: 'flights' });
const ride = (title: string, body: string, href: string, photo: string): Affiliate => ({ title, kicker: 'Trip.com', body, href, cta: 'Search trains', photo, partner: 'train' });
const day = (n: number, title: string, body: string, photo: string): DayPlan => ({ n, title, body, photo });

export const FINAL_PAGES: Page[] = [
  {
    path: '/get-there',
    title: 'Getting there',
    metaTitle: T('/get-there', 'Getting to Laos: Flights, the Railway, and the Bridge'),
    description: 'Routes.',
    metaDescription: D('Most trips start with a flight from Bangkok or Hanoi, or the sleeper to Vientiane. The Laos-China Railway then links the capital to Luang Prabang.'),
    lede: L('/get-there', 'Getting to Laos is a flight or an overnight train, then the Laos-China Railway if your towns sit on that line. This hub is the map.'),
    schema: 'Article',
    crumbs: crumbs([['Home', '/'], ['Getting there', '/get-there']]),
    facts: [
      { label: 'From Bangkok', value: 'About 1 to 2 hours by air' },
      { label: 'Sleeper', value: 'Bangkok to Khamsavath, overnight' },
      { label: 'Inside Laos', value: 'About 2 hours by fast train' },
    ],
    photo: p('get-there'),
    paragraphs: ['Khamsavath station is not the Laos-China station. Budget about 30 minutes by road if you connect the two in Vientiane, and do not book them on the same tight morning.'],
    sections: [{
      id: 'routes',
      title: 'Routes',
      cards: [
        card('Rail', 'Laos-China Railway', '/get-there/laos-china-railway', p('lcr-train')),
        card('Bangkok', 'Bangkok to Laos', '/get-there/bangkok-to-laos', p('friendship-bridge')),
        card('Hanoi', 'Hanoi to Laos', '/get-there/hanoi-to-laos', p('lpq-airport')),
      ],
    }],
    faqs: [],
    portraits: [
      port('Luang Prabang', '/luang-prabang', p('luang-prabang')),
      port('Vientiane', '/vientiane', p('vientiane')),
      port('Pakse', '/pakse', p('pakse')),
    ],
  },
  {
    path: '/get-there/laos-china-railway',
    title: 'Laos-China Railway',
    metaTitle: T('/get-there/laos-china-railway', 'Laos-China Railway: Vientiane to Luang Prabang'),
    description: 'Train.',
    metaDescription: D('The Laos-China Railway links Vientiane, Vang Vieng, and Luang Prabang in about 2 hours on the fastest trains. Book ahead on busy days.'),
    lede: L('/get-there/laos-china-railway', 'The Laos-China Railway is the fast way between Vientiane and Luang Prabang. It fits anyone who would rather not spend the day on a bus.'),
    schema: 'Article',
    crumbs: crumbs([['Home', '/'], ['Getting there', '/get-there'], ['Laos-China Railway', '/get-there/laos-china-railway']]),
    facts: [
      { label: 'Opened', value: '3 December 2021' },
      { label: 'Fastest VTE to LP', value: 'About 1 hour 46 minutes' },
      { label: 'Also stops', value: 'Vang Vieng, then Boten' },
    ],
    photo: p('lcr-train'),
    paragraphs: ['Passenger service runs up to 160 km/h on the Lao side. A timetable checked in late October 2026 showed several Vientiane to Luang Prabang trains, including a fast morning run of about 1 hour 46 minutes. Times move. Check them when you buy.'],
    sections: [{
      id: 'notes',
      title: 'Before you ride',
      bullets: [
        'Vientiane Railway Station is not Khamsavath, where the Thai sleeper ends.',
        'Vang Vieng is a stop. Nong Khiaw is not.',
        'International trains continue to Kunming. That is a separate ticket and a border stop at Boten.',
        'Passport out. The station process takes longer than the platform photo.',
      ],
      cards: [
        card('Station', 'Boten station hall', '/get-there/laos-china-railway', p('lcr-station')),
        card('Window', 'The ride itself', '/get-there', p('get-there')),
        card('Stop', 'Vang Vieng', '/vang-vieng', p('vang-vieng')),
      ],
    }],
    faqs: [
      { q: 'Can you buy the ticket the same morning?', a: 'Sometimes. Popular trains sell out. If the day matters, book ahead or go to the station the day before.' },
    ],
    portraits: [
      port('Luang Prabang', '/luang-prabang', p('luang-prabang')),
      port('Vientiane', '/vientiane', p('vientiane')),
      port('Vang Vieng', '/vang-vieng', p('vang-vieng-river')),
    ],
    affiliates: [
      ride('Vientiane to Luang Prabang', 'Search rail tickets for the fast trains.', trainLink('Vientiane', 'Luang Prabang'), p('phousi')),
      stay('Luang Prabang hotels', 'Arrive by train and sleep on the peninsula.', hotelSearchListUrl('luang-prabang'), p('luang-prabang-palace')),
    ],
    showStay: true,
  },
  {
    path: '/get-there/bangkok-to-laos',
    title: 'Bangkok to Laos',
    metaTitle: T('/get-there/bangkok-to-laos', 'Bangkok to Laos: Flight, Sleeper, or Friendship Bridge'),
    description: 'Bangkok.',
    metaDescription: D('From Bangkok, fly to Vientiane, Luang Prabang, or Pakse in about 1 to 2 hours, or take the overnight train to Khamsavath station.'),
    lede: L('/get-there/bangkok-to-laos', 'Bangkok is the usual jump-off. Fly if the clock matters. Take the sleeper if you want to land in Vientiane without a morning airport.'),
    schema: 'Article',
    crumbs: crumbs([['Home', '/'], ['Getting there', '/get-there'], ['Bangkok to Laos', '/get-there/bangkok-to-laos']]),
    facts: [
      { label: 'Flights', value: 'BKK or DMK to VTE, LPQ, or PKZ' },
      { label: 'Sleeper', value: 'About 12 hours to Khamsavath' },
      { label: 'Bridge', value: 'First Thai-Lao Friendship Bridge' },
    ],
    photo: p('friendship-bridge'),
    paragraphs: ['The direct sleeper reaches Khamsavath, about 7 km from central Vientiane. A 2026 pattern has train 133 leaving Bangkok in the evening and arriving the next morning around 09:05. Confirm the current board before you travel.'],
    sections: [{
      id: 'choices',
      title: 'Three ways',
      bullets: [
        'Flight: about 1 to 2 hours, depending on the Lao airport.',
        'Sleeper: evening departure, morning arrival, then a ride into town.',
        'The Friendship Bridge is the rail and road crossing. You still clear both borders.',
      ],
    }],
    faqs: [
      { q: 'Does the Bangkok train continue to Luang Prabang?', a: 'No. It ends at Khamsavath. The Laos-China train leaves from a different station. Sleep in Vientiane if you can.' },
    ],
    portraits: [
      port('Vientiane', '/vientiane', p('vientiane')),
      port('Luang Prabang', '/luang-prabang', p('luang-prabang')),
      port('Pakse', '/pakse', p('pakse')),
    ],
    affiliates: [
      flight('Bangkok to Vientiane', 'The short flight into Wattay.', flightLink('BKK', 'VTE'), p('wattay')),
      flight('Bangkok to Luang Prabang', 'Skip the capital if the north is the point.', flightLink('BKK', 'LPQ'), p('lpq-airport')),
    ],
    showStay: true,
  },
  {
    path: '/get-there/hanoi-to-laos',
    title: 'Hanoi to Laos',
    metaTitle: T('/get-there/hanoi-to-laos', 'Hanoi to Laos: Flights to Luang Prabang and Vientiane'),
    description: 'Hanoi.',
    metaDescription: D('From Hanoi, the practical hop is a flight to Luang Prabang or Vientiane, about 1 hour in the air. Overland buses take a full day or night.'),
    lede: L('/get-there/hanoi-to-laos', 'Hanoi to Laos is a short flight if you pick the air bridge. It fits a north-first trip that starts in Luang Prabang the same day.'),
    schema: 'Article',
    crumbs: crumbs([['Home', '/'], ['Getting there', '/get-there'], ['Hanoi to Laos', '/get-there/hanoi-to-laos']]),
    facts: [
      { label: 'Flight time', value: 'About 1 hour to LPQ or VTE' },
      { label: 'Best landing', value: 'Luang Prabang for a first north trip' },
      { label: 'By road', value: 'A full day or an overnight bus' },
    ],
    photo: p('lpq-airport'),
    paragraphs: ['Overland buses exist, including long routes toward Luang Prabang, but they are the slow choice. If you only have a week, fly. The Laos-China Railway does not start in Hanoi. It starts on the Lao side after you are already in the country.'],
    faqs: [],
    portraits: [
      port('Luang Prabang', '/luang-prabang', p('luang-prabang')),
      port('Vientiane', '/vientiane', p('vientiane')),
      port('Nong Khiaw', '/nong-khiaw', p('nong-khiaw')),
    ],
    affiliates: [
      flight('Hanoi to Luang Prabang', 'The useful first flight for a north trip.', flightLink('HAN', 'LPQ'), p('luang-prabang-palace')),
      flight('Hanoi to Vientiane', 'Land in the capital if the train south is the plan.', flightLink('HAN', 'VTE'), p('wattay')),
    ],
    showStay: true,
  },
  {
    path: '/plan',
    title: 'Plan',
    metaTitle: T('/plan', 'Plan a Laos Trip: Season, Visa, Money, and the SIM'),
    description: 'Plan.',
    metaDescription: D('Start with the cool months, the eVisa or a visa exemption, kip for markets, and a local SIM. This hub links the practical pages.'),
    lede: L('/plan', 'Planning Laos is four checks: the month, the visa, the cash, and how you move between towns. This page is the index.'),
    schema: 'Article',
    crumbs: crumbs([['Home', '/'], ['Plan', '/plan']]),
    facts: [
      { label: 'Easy months', value: 'November to February' },
      { label: 'eVisa stay', value: '30 days, tourist T-B3' },
      { label: 'Cash', value: 'Kip for markets and tickets' },
    ],
    photo: p('plan'),
    paragraphs: ['Read the visa page before you buy a flight. Some passports are exempt for a short stay. Others need the eVisa letter in hand at a listed port.'],
    sections: [{
      id: 'guides',
      title: 'Practical guides',
      cards: [
        card('Season', 'Best time to visit', '/plan/best-time-to-visit', p('season')),
        card('Entry', 'Visa and eVisa', '/plan/visa-and-evisa', p('wattay')),
        card('Cash', 'Money and SIM', '/plan/money-and-sim', p('money')),
      ],
    }],
    faqs: [],
    portraits: [
      port('7 days', '/itineraries/7-days', p('itineraries')),
      port('Railway', '/get-there/laos-china-railway', p('lcr-train')),
      port('Food', '/lao-food', p('lao-food')),
    ],
  },
  {
    path: '/plan/visa-and-evisa',
    title: 'Visa and eVisa',
    metaTitle: T('/plan/visa-and-evisa', 'Laos Visa and eVisa: Ports, Stay, and the Letter'),
    description: 'Visa.',
    metaDescription: D('The Lao eVisa is a 30-day tourist stay applied for on the official portal. Print the approval letter and enter only through the listed ports.'),
    lede: L('/plan/visa-and-evisa', 'The eVisa is the tourist route for passports that are not exempt. It is a 30-day stay, and the letter is what the officer wants to see.'),
    schema: 'Article',
    crumbs: crumbs([['Home', '/'], ['Plan', '/plan'], ['Visa and eVisa', '/plan/visa-and-evisa']]),
    facts: [
      { label: 'Stay', value: '30 days from the day you enter' },
      { label: 'Letter valid', value: '60 days from approval' },
      { label: 'Processing', value: 'About 3 working days' },
    ],
    photo: p('wattay'),
    paragraphs: ['Apply on the official portal, laoevisa.gov.la. The fee depends on nationality and is non-refundable. Use an ordinary passport with at least 6 months of validity and a blank page. Print the approval letter. A phone screenshot is a weak backup, not the plan.'],
    sections: [{
      id: 'ports',
      title: 'eVisa ports',
      bullets: [
        'Wattay airport in Vientiane, Luang Prabang airport, and Pakse airport.',
        'Friendship Bridge I at Vientiane, Bridge II at Savannakhet, and Bridge IV in Bokeo.',
        'Boten checkpoint and Boten railway station.',
        'Khamsavath railway station in Vientiane.',
      ],
    }, {
      id: 'exempt',
      title: 'If you might be exempt',
      paragraphs: ['Some passports enter visa-free for a short stay. The list and the number of days change. Check the current exemption before you skip the eVisa. A visa exemption is not the same document as an eVisa letter.'],
    }],
    faqs: [
      { q: 'Does an eVisa guarantee entry?', a: 'No. The letter lets you ask. Immigration can still refuse entry. Carry proof of a way out and enough funds for the stay.' },
    ],
    portraits: [
      port('Wattay and Vientiane', '/vientiane', p('vientiane')),
      port('Luang Prabang', '/luang-prabang', p('luang-prabang')),
      port('From Bangkok', '/get-there/bangkok-to-laos', p('friendship-bridge')),
    ],
  },
  {
    path: '/plan/best-time-to-visit',
    title: 'Best time to visit',
    metaTitle: T('/plan/best-time-to-visit', 'Best Time to Visit Laos: Cool Months and Full Falls'),
    description: 'Season.',
    metaDescription: D('November to February is the easy season. March to May runs hot. June to October brings rain and full waterfalls. Pi Mai falls in mid-April.'),
    lede: L('/plan/best-time-to-visit', 'The best time for a first trip is the cool, dry stretch. November to February fits towns, the river, and long walks without a storm plan.'),
    schema: 'Article',
    crumbs: crumbs([['Home', '/'], ['Plan', '/plan'], ['Best time to visit', '/plan/best-time-to-visit']]),
    facts: [
      { label: 'Cool and dry', value: 'November to February' },
      { label: 'Hot', value: 'March to May' },
      { label: 'Rain', value: 'June to October' },
    ],
    photo: p('season'),
    paragraphs: ['Waterfalls look stronger late in the rains and into the start of the cool season. Roads on the Bolaven Plateau and out to lagoons get slower when the rain is heavy. Smoke and heat build toward April.'],
    sections: [{
      id: 'year',
      title: 'The year',
      bullets: [
        'November to February: the default. Book Luang Prabang early around Christmas and lunar new year.',
        'Mid-April: Pi Mai, the Lao new year. In 2026 the public holidays run 14 to 16 April. Towns party. Offices close.',
        'June to October: green, wet, fewer visitors. Kuang Si and Khone Phapheng earn the rain.',
      ],
    }],
    faqs: [],
    portraits: [
      port('Kuang Si', '/attractions/kuang-si-falls', p('kuang-si')),
      port('Bolaven', '/bolaven-plateau', p('tad-fane')),
      port('Luang Prabang', '/luang-prabang', p('luang-prabang')),
    ],
  },
  {
    path: '/plan/money-and-sim',
    title: 'Money and SIM',
    metaTitle: T('/plan/money-and-sim', 'Money and SIM Cards in Laos: Kip, ATMs, and Data'),
    description: 'Money.',
    metaDescription: D('Laos runs on kip. Use ATMs in the main towns, carry cash for boats and markets, and buy a Unitel, Lao Telecom, or ETL SIM with your passport.'),
    lede: L('/plan/money-and-sim', 'Money in Laos is kip first. Cards work in many city hotels. Markets, boats, and ticket windows still want cash, so this page is the setup.'),
    schema: 'Article',
    crumbs: crumbs([['Home', '/'], ['Plan', '/plan'], ['Money and SIM', '/plan/money-and-sim']]),
    facts: [
      { label: 'Currency', value: 'Lao kip (LAK)' },
      { label: 'ATMs', value: 'Reliable in VTE, LP, Pakse' },
      { label: 'SIM', value: 'Passport required in the shop' },
    ],
    photo: p('money'),
    paragraphs: ['ATMs from BCEL and other banks are common in the hubs and thin out in Nong Khiaw and on the islands. Machines add their own fee on top of your bank\'s. Take a larger amount when it works. US dollars and Thai baht are accepted at some hotels. Change comes back in kip.'],
    sections: [{
      id: 'sim',
      title: 'SIM and data',
      bullets: [
        'Unitel, Lao Telecom, and ETL are the networks you will see.',
        'Airport counters and town shops both sell tourist SIMs. Bring your passport.',
        'eSIMs exist, including from Unitel and from travel brands. Install before you need the map.',
        'Coverage is fine in the hubs and patchy on plateau back roads.',
      ],
    }],
    faqs: [
      { q: 'Should you rely on a card?', a: 'For the hotel, often yes. For Kuang Si, a boat, or a night-market snack, no. Keep a stack of small kip notes.' },
    ],
    portraits: [
      port('Luang Prabang', '/luang-prabang', p('luang-prabang-night')),
      port('Vientiane', '/vientiane', p('vientiane')),
      port('Pakse market', '/pakse', p('pakse-market')),
    ],
  },
  {
    path: '/itineraries',
    title: 'Itineraries',
    metaTitle: T('/itineraries', 'Laos Itineraries: 7 Days and 10 Days for a First Trip'),
    description: 'Routes.',
    metaDescription: D('Two first-trip routes: a week for Luang Prabang and Vientiane, or 10 days that adds the south. Both use the railway where it saves a day.'),
    lede: L('/itineraries', 'Two routes cover a first trip. Seven days fits the north and the capital. Ten days is the same spine plus Pakse.'),
    schema: 'Article',
    crumbs: crumbs([['Home', '/'], ['Itineraries', '/itineraries']]),
    facts: [
      { label: '7 days', value: 'Luang Prabang, Vang Vieng, Vientiane' },
      { label: '10 days', value: 'That, plus Pakse and one south day' },
      { label: 'Train', value: 'About 2 hours between the cities' },
    ],
    photo: p('itineraries'),
    paragraphs: ['Do not try the islands and Nong Khiaw in the same week. The road time eats the point of both.'],
    sections: [{
      id: 'routes',
      title: 'Choose a length',
      cards: [
        card('Week', '7 days', '/itineraries/7-days', p('luang-prabang')),
        card('Longer', '10 days', '/itineraries/10-days', p('wat-phou')),
        card('Rail', 'The train in the middle', '/get-there/laos-china-railway', p('lcr-train')),
      ],
    }],
    faqs: [],
    portraits: [
      port('Luang Prabang', '/luang-prabang', p('luang-prabang-palace')),
      port('Vientiane', '/vientiane', p('that-luang')),
      port('Pakse', '/pakse', p('pakse')),
    ],
  },
  {
    path: '/itineraries/7-days',
    title: '7 days in Laos',
    metaTitle: T('/itineraries/7-days', '7-Day Laos Itinerary: Luang Prabang to Vientiane'),
    description: 'Week.',
    metaDescription: D('A first week lands in Luang Prabang, rides the train via Vang Vieng, and ends in Vientiane. One waterfall day, one cave morning, then the capital.'),
    lede: L('/itineraries/7-days', 'Seven days is the first-trip length if you want Luang Prabang properly and still see Vientiane. It is not the trip for the far south.'),
    schema: 'Article',
    crumbs: crumbs([['Home', '/'], ['Itineraries', '/itineraries'], ['7 days', '/itineraries/7-days']]),
    facts: [
      { label: 'Nights', value: '3 Luang Prabang, 1 Vang Vieng, 2 Vientiane' },
      { label: 'Train', value: 'About 2 hours, or less to Vang Vieng' },
      { label: 'Skip', value: 'Pakse and the islands' },
    ],
    photo: p('destinations'),
    paragraphs: ['Land in Luang Prabang if you can. You get the dawn rite on day two instead of spending day one in a transfer.'],
    days: [
      day(1, 'Land in Luang Prabang', 'Airport to the peninsula in about 10 minutes. Walk the river and eat on the night market street. Sleep early if you want alms.', p('luang-prabang')),
      day(2, 'Dawn, then a temple', 'Alms at first light if you are joining. Wat Xieng Thong later, when you are awake. Mount Phousi at sunset if the legs agree.', p('alms')),
      day(3, 'Kuang Si', 'Leave after breakfast. The ride is about 45 minutes. Swim where it is allowed, and be back before the night market if you still want it.', p('kuang-si')),
      day(4, 'Train to Vang Vieng', 'A fast train is well under 2 hours from Luang Prabang once you are at the station. Drop bags and walk the Nam Song.', p('vang-vieng')),
      day(5, 'Lagoon, then Vientiane', 'Blue Lagoon in the morning if the road is open, about 30 minutes out. Afternoon train to Vientiane, under an hour on the fast services.', p('blue-lagoon')),
      day(6, 'That Luang and Patuxai', 'The stupa in the morning, the arch when the light is lower. The two stations are only relevant if you are leaving by rail tomorrow.', p('that-luang')),
      day(7, 'Out of Wattay', 'The airport is close. If the flight is late, Buddha Park is the half-day add, about 45 minutes by road.', p('wattay')),
    ],
    faqs: [],
    portraits: [
      port('10 days', '/itineraries/10-days', p('pakse')),
      port('Railway', '/get-there/laos-china-railway', p('lcr-train')),
      port('Food', '/lao-food', p('lao-food')),
    ],
    affiliates: [
      stay('Luang Prabang hotels', 'The first three nights.', hotelSearchListUrl('luang-prabang'), p('luang-prabang-night')),
      flight('Fly home from VTE', 'Or reverse the route and fly out of LPQ.', flightLink('VTE', 'BKK'), p('vientiane')),
    ],
    showStay: true,
  },
  {
    path: '/itineraries/10-days',
    title: '10 days in Laos',
    metaTitle: T('/itineraries/10-days', '10-Day Laos Itinerary: North First, Then the South'),
    description: 'Ten days.',
    metaDescription: D('Ten days covers Luang Prabang, a train south, Vientiane, then a flight to Pakse for Wat Phou and either the Bolaven Plateau or the 4000 Islands.'),
    lede: L('/itineraries/10-days', 'Ten days is the route if the south matters. It is the northern week plus Pakse, not a dash through every province.'),
    schema: 'Article',
    crumbs: crumbs([['Home', '/'], ['Itineraries', '/itineraries'], ['10 days', '/itineraries/10-days']]),
    facts: [
      { label: 'North', value: 'Luang Prabang and one train day' },
      { label: 'Capital', value: 'Two nights is enough' },
      { label: 'South', value: 'Fly VTE to PKZ, about 1 hour' },
    ],
    photo: p('champasak'),
    paragraphs: ['Choose Bolaven or the islands, not both, unless you drop a Luang Prabang day. The road from Pakse to the islands is about 3 hours before the boat.'],
    days: [
      day(1, 'Luang Prabang', 'Land and walk. Night market for dinner, not for a schedule.', p('luang-prabang-palace')),
      day(2, 'Alms and Xieng Thong', 'Dawn if you are taking part. The temple when the heat is still low.', p('xieng-thong')),
      day(3, 'Kuang Si', 'Half a day south of town. About 45 minutes each way.', p('kuang-si-pools')),
      day(4, 'Train south', 'To Vang Vieng or all the way to Vientiane. Fast trains are about 2 hours end to end.', p('lcr-station')),
      day(5, 'Vientiane', 'That Luang and the river. Patuxai if the evening is free.', p('that-luang')),
      day(6, 'Fly to Pakse', 'About 1 hour in the air. Sleep by the Mekong.', p('pakse')),
      day(7, 'Wat Phou', 'About 1 hour from Pakse. The hill and the museum are the day.', p('wat-phou')),
      day(8, 'Bolaven or the islands', 'Tad Fane is about 1 hour up. The islands are about 3 hours south, plus a boat.', p('tad-fane')),
      day(9, 'Second south day', 'The sight you did not pick yesterday, or a slow Pakse market morning.', p('tad-yuang')),
      day(10, 'Fly out', 'PKZ back to Bangkok, or to Vientiane if the ticket home leaves from there.', p('friendship-bridge')),
    ],
    faqs: [],
    portraits: [
      port('7 days', '/itineraries/7-days', p('vang-vieng')),
      port('4000 Islands', '/4000-islands', p('don-det')),
      port('Food', '/lao-food', p('dish-laap')),
    ],
    affiliates: [
      stay('Pakse hotels', 'The southern nights.', hotelSearchListUrl('pakse'), p('pakse-market')),
      flight('Vientiane to Pakse', 'The hop that makes ten days possible.', flightLink('VTE', 'PKZ'), p('wattay')),
    ],
    showStay: true,
  },
  {
    path: '/lao-food',
    title: 'Lao food',
    metaTitle: T('/lao-food', 'Lao Food Guide: Fifteen Dishes to Order First'),
    description: 'Food.',
    metaDescription: D('Order laap, tam mak hoong, and sticky rice first. Then feu, khao piak sen, sai oua, and mok pa. This hub shows fifteen dishes travelers meet.'),
    lede: L('/lao-food', 'Lao food is sticky rice plus a plate of herbs and heat. This hub is for a first table: fifteen dishes you can point at without a speech.'),
    schema: 'Article',
    crumbs: crumbs([['Home', '/'], ['Lao food', '/lao-food']]),
    facts: [
      { label: 'Staple', value: 'Khao niao, sticky rice' },
      { label: 'Order first', value: 'Laap and tam mak hoong' },
      { label: 'Breakfast', value: 'Khao piak sen or feu' },
    ],
    photo: p('lao-food'),
    paragraphs: ['Markets open early. A bowl of noodles is the breakfast. Dinner can be grilled meat and a basket of rice. Tell the cook if you want the chili pulled back. "Not spicy" is a request, not a guarantee.'],
    sections: [{
      id: 'dishes',
      title: 'Fifteen dishes',
      cards: LAO_DISHES.map((dish) => card(dish.nameLocal, dish.title, '/lao-food', dish.photo)),
    }],
    faqs: [
      { q: 'Is laap the same as Thai larb?', a: 'They are cousins. Lao laap is the one to ask for here, often with sticky rice and a sharper herb pile. Order it where the kitchen pounds it to order.' },
    ],
    portraits: [
      port('Luang Prabang', '/luang-prabang', p('luang-prabang-night')),
      port('Vientiane', '/vientiane', p('vientiane-lane-xang')),
      port('Pakse market', '/pakse', p('pakse-market')),
    ],
    affiliates: [
      stay('Luang Prabang hotels', 'The night market is the easy first dinner.', hotelSearchListUrl('luang-prabang'), p('lao-coffee')),
      stay('Vientiane hotels', 'River restaurants and morning noodle shops.', hotelSearchListUrl('vientiane'), p('season')),
    ],
    showStay: true,
  },
  {
    path: '/about',
    title: 'About',
    metaTitle: T('/about', 'About This Laos Guide and Beyond Guide Network'),
    description: 'About.',
    metaDescription: D('Beyond Guide Network publishes this Laos guide for first trips. Pages name the town, the train, and the dish. The publisher is the network, not a shop.'),
    lede: L('/about', 'This guide is a Beyond Guide Network publication. It is written for a first trip to Laos, with the towns people already know.'),
    schema: 'Article',
    crumbs: crumbs([['Home', '/'], ['About', '/about']]),
    facts: [
      { label: 'Publisher', value: 'Beyond Guide Network' },
      { label: 'Edition', value: 'First Laos edition' },
      { label: 'Checked', value: '1 Nov 2026' },
    ],
    photo: p('luang-prabang-palace'),
    paragraphs: ['Pages say how long a ride takes and what to order. They do not rank hotels for a fee. Sister guides in the network cover Thailand and Vietnam when a trip crosses a border.'],
    faqs: [],
    portraits: [
      port('Luang Prabang', '/luang-prabang', p('luang-prabang')),
      port('Vientiane', '/vientiane', p('vientiane')),
      port('Food', '/lao-food', p('dish-khao-niao')),
    ],
  },
  {
    path: '/about/ratings',
    title: 'Ratings',
    metaTitle: T('/about/ratings', 'How This Guide Rates Towns, Sights, and Routes'),
    description: 'Ratings.',
    metaDescription: D('Ratings here are editorial, from 1 to 5, for how well a place fits a first trip. They are not sold placements. Read the scale before you compare towns.'),
    lede: L('/about/ratings', 'A rating here is an editorial note on how well a place fits a first trip. It is not a prize and it is not for sale.'),
    schema: 'Article',
    crumbs: crumbs([['Home', '/'], ['About', '/about'], ['Ratings', '/about/ratings']]),
    facts: [
      { label: 'Scale', value: '1 to 5, first-trip fit' },
      { label: '5', value: 'Worth building the route around' },
      { label: '3', value: 'Fine as a night, not the reason' },
    ],
    photo: p('about'),
    paragraphs: ['Luang Prabang rates high because a first week works without a car. A viewpoint town rates lower if the road eats the day. The number is a planning hint. It is not a review score from a checkout survey.'],
    faqs: [],
    portraits: [
      port('About', '/about', p('luang-prabang-palace')),
      port('Destinations', '/destinations', p('destinations')),
      port('Plan', '/plan', p('plan')),
    ],
  },
  {
    path: '/privacy',
    title: 'Privacy',
    metaTitle: T('/privacy', 'Privacy, Terms, and Affiliate Disclosure Page'),
    description: 'Privacy.',
    metaDescription: D('This page covers privacy, the terms of using the guide, and the affiliate disclosure for booking links. Read it once. The guides themselves stay plain.'),
    lede: L('/privacy', 'This is the privacy and terms page, and the affiliate disclosure. The travel pages do not repeat a sales line.'),
    schema: 'Article',
    crumbs: crumbs([['Home', '/'], ['Privacy', '/privacy']]),
    facts: [
      { label: 'Publisher', value: 'Beyond Guide Network' },
      { label: 'Cookies', value: 'Used for measurement' },
      { label: 'Booking links', value: 'See the disclosure below' },
    ],
    photo: p('wat-sisaket'),
    paragraphs: ['We store the pages you request in ordinary server logs, and a measurement tag may set a cookie. Do not send passport numbers or payment details through this site. There is no account to create here.'],
    sections: [{
      id: 'booking',
      title: 'Affiliate disclosure',
      paragraphs: ['Some links to hotels, flights, trains, and airport cars are partner links. If you book through them, the partner may pay this guide a commission. The price you see is the partner\'s price. Guides do not add a line about that on every page. This is the one disclosure.'],
    }, {
      id: 'terms',
      title: 'Terms',
      paragraphs: ['Timetables, fees, and visa rules change. Check the operator or the official portal before you travel. The text is for planning, not a contract with an airline, a railway, or an immigration desk.'],
    }],
    faqs: [],
    portraits: [
      port('About', '/about', p('about')),
      port('Visa', '/plan/visa-and-evisa', p('plan')),
      port('Home', '/', p('luang-prabang')),
    ],
  },
];
