import type { Affiliate, EditorialCard, Page, Portrait } from './content';
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
const stay = (title: string, body: string, href: string, photo: string): Affiliate => ({ title, kicker: 'Trip.com', body, href, cta: 'See stays', photo, partner: 'stay' });
const flight = (title: string, body: string, href: string, photo: string): Affiliate => ({ title, kicker: 'Trip.com', body, href, cta: 'Search flights', photo, partner: 'flights' });
const ride = (title: string, body: string, href: string, photo: string): Affiliate => ({ title, kicker: 'Trip.com', body, href, cta: 'Search trains', photo, partner: 'train' });

function port(title: string, href: string, photo: string): Portrait {
  return { title, href, photo };
}

export const MORE_PAGES: Page[] = [
  {
    path: '/attractions',
    title: 'Attractions',
    metaTitle: T('/attractions', 'Laos Attractions: Falls, Caves, Stupas, and Viewpoints'),
    description: 'Sights.',
    metaDescription: D('The sights first trips actually reach: Kuang Si, Pak Ou, Mount Phousi, That Luang, Patuxai, the Blue Lagoon, Khone Phapheng, and Wat Phou.'),
    lede: L('/attractions', 'These are the sights a first Laos trip is known for, grouped by the town you sleep in. Remote parks can wait for another visit.'),
    schema: 'Article',
    crumbs: crumbs([['Home', '/'], ['Attractions', '/attractions']]),
    facts: [
      { label: 'North', value: 'Kuang Si, Pak Ou, Mount Phousi' },
      { label: 'Capital', value: 'That Luang and Patuxai' },
      { label: 'South', value: 'Wat Phou and Khone Phapheng' },
    ],
    photo: p('attractions'),
    paragraphs: ['Ticket windows in Laos take kip in cash. A sight that is "about 30 minutes" from town often means a half day once you add the ride back.'],
    sections: [{
      id: 'list',
      title: 'Start here',
      cards: [
        card('Luang Prabang', 'Kuang Si Falls', '/attractions/kuang-si-falls', p('kuang-si')),
        card('Luang Prabang', 'Pak Ou Caves', '/attractions/pak-ou-caves', p('pak-ou')),
        card('Luang Prabang', 'Mount Phousi', '/attractions/mount-phousi', p('phousi')),
        card('Vientiane', 'Pha That Luang', '/attractions/pha-that-luang', p('that-luang')),
        card('Vientiane', 'Patuxai', '/attractions/patuxai', p('patuxai')),
        card('Vang Vieng', 'Blue Lagoon', '/attractions/vang-vieng-blue-lagoon', p('blue-lagoon')),
        card('South', 'Khone Phapheng', '/attractions/khone-phapheng-falls', p('khone-phapheng')),
        card('South', 'Wat Phou', '/attractions/wat-phou', p('wat-phou')),
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
    path: '/attractions/kuang-si-falls',
    title: 'Kuang Si Falls',
    metaTitle: T('/attractions/kuang-si-falls', 'Kuang Si Falls: Turquoise Pools South of Town'),
    description: 'Falls.',
    metaDescription: D('Kuang Si is the waterfall day from Luang Prabang. Turquoise pools, a bear centre on the path, and a cash ticket at the lower gate.'),
    lede: L('/attractions/kuang-si-falls', 'Kuang Si is the waterfall Luang Prabang is known for. It fits a morning out of town, with time to swim if the pools are open.'),
    schema: 'TouristDestination',
    crumbs: crumbs([['Home', '/'], ['Attractions', '/attractions'], ['Kuang Si Falls', '/attractions/kuang-si-falls']]),
    facts: [
      { label: 'From town', value: 'About 45 minutes by road' },
      { label: 'Ticket', value: 'Cash kip at the lower gate' },
      { label: 'On the path', value: 'Bear rescue centre' },
    ],
    photo: p('kuang-si'),
    geo: { lat: 19.749, lon: 101.991, containedIn: 'Luang Prabang, Laos' },
    paragraphs: ['Go early. The lower pools are the crowded ones. The trail climbs beside the falls, and the bear centre sits on the way in. Bring kip. Cards are not the plan at the window.'],
    sections: [{
      id: 'plan',
      title: 'How to go',
      bullets: [
        'A shared tuk-tuk or a private car both work. The ride is about 45 minutes.',
        'The published foreign ticket has moved over the years. Pay the figure printed at the gate that day.',
        'Swim only where it is allowed. Some upper pools are look-only.',
      ],
    }],
    faqs: [
      { q: 'Can you combine it with Pak Ou?', a: 'Not in one relaxed day. Kuang Si is south of town by road. Pak Ou is up the Mekong by boat. Split them.' },
    ],
    portraits: [
      port('Luang Prabang', '/luang-prabang', p('luang-prabang')),
      port('Pak Ou', '/attractions/pak-ou-caves', p('pak-ou')),
      port('Mount Phousi', '/attractions/mount-phousi', p('phousi')),
    ],
    affiliates: [
      stay('Luang Prabang hotels', 'Stay in town and leave for the falls after breakfast.', hotelSearchListUrl('luang-prabang'), p('luang-prabang-night')),
      flight('Flights to LPQ', 'Most waterfall days start with a landing at Luang Prabang.', flightLink('BKK', 'LPQ'), p('lpq-airport')),
    ],
    showStay: true,
  },
  {
    path: '/attractions/pak-ou-caves',
    title: 'Pak Ou Caves',
    metaTitle: T('/attractions/pak-ou-caves', 'Pak Ou Caves Guide: Buddha Cliffs on the Mekong'),
    description: 'Caves.',
    metaDescription: D('Pak Ou is the cave trip upriver from Luang Prabang. Two limestone caves of Buddha images, reached by boat in about 2 hours return.'),
    lede: L('/attractions/pak-ou-caves', 'Pak Ou is the cave shrine up the Mekong. It fits a boat morning if you already gave Kuang Si its own day.'),
    schema: 'TouristDestination',
    crumbs: crumbs([['Home', '/'], ['Attractions', '/attractions'], ['Pak Ou Caves', '/attractions/pak-ou-caves']]),
    facts: [
      { label: 'From town', value: 'About 2 hours return by boat' },
      { label: 'Caves', value: 'A lower cave and an upper stair' },
      { label: 'Pay', value: 'Boat hire plus a cave ticket' },
    ],
    photo: p('pak-ou'),
    paragraphs: ['Boats leave from the Luang Prabang riverfront. The lower cave is the easier one. The upper cave is a stair. Buddha images fill both, left by villagers over many years.'],
    sections: [{
      id: 'boat',
      title: 'On the water',
      bullets: [
        'Agree the boat price and the wait time before you board.',
        'The cave ticket is separate and paid in kip.',
        'A full return is about 2 hours plus time inside.',
      ],
    }],
    faqs: [],
    portraits: [
      port('Luang Prabang', '/luang-prabang', p('luang-prabang')),
      port('Kuang Si', '/attractions/kuang-si-falls', p('kuang-si-pools')),
      port('Alms', '/attractions/luang-prabang-alms-giving', p('alms')),
    ],
    affiliates: [
      stay('Luang Prabang hotels', 'A riverfront room makes the morning boat short.', hotelSearchListUrl('luang-prabang'), p('mekong-ferry')),
      ride('Train from Vientiane', 'Reach Luang Prabang by rail, then take the boat the next day.', trainLink('Vientiane', 'Luang Prabang'), p('lcr-train')),
    ],
    showStay: true,
  },
  {
    path: '/attractions/mount-phousi',
    title: 'Mount Phousi',
    metaTitle: T('/attractions/mount-phousi', 'Mount Phousi: Sunset Steps over Luang Prabang'),
    description: 'Hill.',
    metaDescription: D('Mount Phousi is the short climb in the middle of Luang Prabang. Sunset over the Mekong, a modest ticket, and about 20 minutes of stairs.'),
    lede: L('/attractions/mount-phousi', 'Mount Phousi is the hill in the middle of town. It fits sunset, not a full morning, if your knees are fine with the stairs.'),
    schema: 'TouristDestination',
    crumbs: crumbs([['Home', '/'], ['Attractions', '/attractions'], ['Mount Phousi', '/attractions/mount-phousi']]),
    facts: [
      { label: 'Climb', value: 'About 20 minutes of stairs' },
      { label: 'Best light', value: 'Late afternoon' },
      { label: 'Ticket', value: 'A small cash fee at the gate' },
    ],
    photo: p('phousi'),
    paragraphs: ['The view looks over the peninsula, the Mekong, and the far bank. Come down before it is fully dark. The steps are uneven and the town lights are not a handrail.'],
    faqs: [],
    portraits: [
      port('Luang Prabang', '/luang-prabang', p('luang-prabang-palace')),
      port('Wat Xieng Thong', '/attractions/wat-xieng-thong', p('xieng-thong')),
      port('Night market', '/luang-prabang', p('luang-prabang-night')),
    ],
    affiliates: [
      stay('Luang Prabang hotels', 'Sleep on the peninsula so the hill is a walk, not a ride.', hotelSearchListUrl('luang-prabang'), p('alms')),
      flight('Fly to Luang Prabang', 'LPQ is the airport for this hill and the old town.', flightLink('HAN', 'LPQ'), p('lpq-airport')),
    ],
    showStay: true,
  },
  {
    path: '/attractions/luang-prabang-alms-giving',
    title: 'Alms giving',
    metaTitle: T('/attractions/luang-prabang-alms-giving', 'Luang Prabang Alms Giving: Dawn Rules for Visitors'),
    description: 'Alms.',
    metaDescription: D('Tak bat is the dawn alms round in Luang Prabang. Sit low, offer sticky rice bought locally, and give monks room. It starts before sunrise.'),
    lede: L('/attractions/luang-prabang-alms-giving', 'Alms giving is a living rite, not a show. It fits visitors who can be quiet, dressed modestly, and out of the monks\' path.'),
    schema: 'Article',
    crumbs: crumbs([['Home', '/'], ['Attractions', '/attractions'], ['Alms giving', '/attractions/luang-prabang-alms-giving']]),
    facts: [
      { label: 'When', value: 'Before sunrise, most mornings' },
      { label: 'Offer', value: 'Sticky rice, bought that morning' },
      { label: 'Manner', value: 'Sit low. Do not touch the monks' },
    ],
    photo: p('alms'),
    paragraphs: ['Buy rice from a local seller, not from someone pushing a basket into your hands in the street. Women should not touch monks. Step back if you are only watching. Flash is a bad idea.'],
    sections: [{
      id: 'rules',
      title: 'If you take part',
      bullets: [
        'Shoulders and knees covered.',
        'Sit or kneel so you are lower than the line of monks.',
        'Put rice into the bowl. Do not hand it over with a grab.',
        'The round is short. It is not a two-hour event.',
      ],
    }],
    faqs: [],
    portraits: [
      port('Luang Prabang', '/luang-prabang', p('luang-prabang')),
      port('Wat Xieng Thong', '/attractions/wat-xieng-thong', p('xieng-thong')),
      port('Kuang Si', '/attractions/kuang-si-falls', p('kuang-si-pools')),
    ],
    affiliates: [
      stay('Luang Prabang hotels', 'A room in the old streets means you can walk to the route.', hotelSearchListUrl('luang-prabang'), p('luang-prabang-palace')),
      flight('Arrive the day before', 'You will not make dawn alms on a late landing.', flightLink('BKK', 'LPQ'), p('wattay')),
    ],
    showStay: true,
  },
  {
    path: '/attractions/wat-xieng-thong',
    title: 'Wat Xieng Thong',
    metaTitle: T('/attractions/wat-xieng-thong', 'Wat Xieng Thong: The Royal Temple by the Mekong'),
    description: 'Temple.',
    metaDescription: D('Wat Xieng Thong is the temple to see in Luang Prabang if you pick one. Mosaic walls, a quiet compound, and a short walk from the night market.'),
    lede: L('/attractions/wat-xieng-thong', 'Wat Xieng Thong is the temple the old town is known for. It fits a slow hour at the river end of the peninsula.'),
    schema: 'TouristDestination',
    crumbs: crumbs([['Home', '/'], ['Attractions', '/attractions'], ['Wat Xieng Thong', '/attractions/wat-xieng-thong']]),
    facts: [
      { label: 'Where', value: 'River tip of the peninsula' },
      { label: 'Time', value: 'About 1 hour inside' },
      { label: 'Dress', value: 'Cover shoulders and knees' },
    ],
    photo: p('xieng-thong'),
    paragraphs: ['The glass mosaic on the rear wall is the image people come for. Shoes come off at the chapels. A small ticket is collected at the gate in kip.'],
    faqs: [],
    portraits: [
      port('Luang Prabang', '/luang-prabang', p('luang-prabang')),
      port('Mount Phousi', '/attractions/mount-phousi', p('phousi')),
      port('Alms', '/attractions/luang-prabang-alms-giving', p('alms')),
    ],
    affiliates: [
      stay('Luang Prabang hotels', 'Stay on the peninsula and walk to the temple.', hotelSearchListUrl('luang-prabang'), p('luang-prabang-night')),
      ride('Train up from Vientiane', 'The fast trains take about 2 hours.', trainLink('Vientiane', 'Luang Prabang'), p('lcr-station')),
    ],
    showStay: true,
  },
  {
    path: '/attractions/pha-that-luang',
    title: 'Pha That Luang',
    metaTitle: T('/attractions/pha-that-luang', 'Pha That Luang Guide: Golden Stupa in Vientiane'),
    description: 'Stupa.',
    metaDescription: D('Pha That Luang is the national stupa of Laos. The outer plaza is free to walk. The inner cloister has a small foreign-visitor ticket.'),
    lede: L('/attractions/pha-that-luang', 'Pha That Luang is the stupa Vientiane is known for. It fits a late afternoon, when the gold reads against a clear sky.'),
    schema: 'TouristDestination',
    crumbs: crumbs([['Home', '/'], ['Attractions', '/attractions'], ['Pha That Luang', '/attractions/pha-that-luang']]),
    facts: [
      { label: 'Outer plaza', value: 'Free to walk' },
      { label: 'Inner cloister', value: 'A foreign-visitor ticket' },
      { label: 'From center', value: 'About 15 minutes by tuk-tuk' },
    ],
    photo: p('that-luang'),
    paragraphs: ['The great stupa was rebuilt in the 20th century on a much older site. Walk the outer terrace first. The inner ticket, when charged, is cash. Festival days can change the rules, including free entry at Lao New Year.'],
    faqs: [],
    portraits: [
      port('Vientiane', '/vientiane', p('vientiane')),
      port('Patuxai', '/attractions/patuxai', p('patuxai')),
      port('Buddha Park', '/attractions/buddha-park', p('buddha-park')),
    ],
    affiliates: [
      stay('Vientiane hotels', 'A center or river hotel keeps That Luang a short ride.', hotelSearchListUrl('vientiane'), p('vientiane-lane-xang')),
      flight('Fly into Wattay', 'VTE is the airport for this stupa.', flightLink('BKK', 'VTE'), p('wattay')),
    ],
    showStay: true,
  },
  {
    path: '/attractions/patuxai',
    title: 'Patuxai',
    metaTitle: T('/attractions/patuxai', 'Patuxai: The Victory Gate on Lane Xang Avenue'),
    description: 'Gate.',
    metaDescription: D('Patuxai is Vientiane\'s victory monument at the end of Lane Xang. Climb for the city view. The plaza below is the evening walking stretch.'),
    lede: L('/attractions/patuxai', 'Patuxai is the arch at the end of Lane Xang. It fits a short climb and an evening walk, not a half-day outing.'),
    schema: 'TouristDestination',
    crumbs: crumbs([['Home', '/'], ['Attractions', '/attractions'], ['Patuxai', '/attractions/patuxai']]),
    facts: [
      { label: 'Avenue', value: 'Lane Xang, in the center' },
      { label: 'Climb', value: 'A ticket to go up' },
      { label: 'Time', value: 'About 30 minutes' },
    ],
    photo: p('patuxai'),
    paragraphs: ['The monument was built in the 1960s. The view from the top is the point. The ground floor is mostly a walk-through. Pay kip if you want the stairs.'],
    faqs: [],
    portraits: [
      port('Vientiane', '/vientiane', p('vientiane-lane-xang')),
      port('That Luang', '/attractions/pha-that-luang', p('that-luang')),
      port('Railway', '/get-there/laos-china-railway', p('lcr-train')),
    ],
    affiliates: [
      stay('Vientiane hotels', 'Lane Xang hotels put the arch in walking range.', hotelSearchListUrl('vientiane'), p('vientiane')),
      { title: 'Airport car from VTE', kicker: 'Trip.com', body: 'Wattay is a short ride, not a trek.', href: transferLink('VTE'), cta: 'See transfers', photo: p('wattay'), partner: 'transfer' },
    ],
    showStay: true,
  },
  {
    path: '/attractions/buddha-park',
    title: 'Buddha Park',
    metaTitle: T('/attractions/buddha-park', 'Buddha Park: Concrete Sculptures by the Mekong'),
    description: 'Park.',
    metaDescription: D('Xieng Khuan, called Buddha Park, sits by the Mekong southeast of Vientiane. Odd concrete statues, a pumpkin tower, and about 45 minutes by road.'),
    lede: L('/attractions/buddha-park', 'Buddha Park is the sculpture garden by the river. It fits a half day from Vientiane if you like the strange and the concrete.'),
    schema: 'TouristDestination',
    crumbs: crumbs([['Home', '/'], ['Attractions', '/attractions'], ['Buddha Park', '/attractions/buddha-park']]),
    facts: [
      { label: 'From Vientiane', value: 'About 45 minutes by road' },
      { label: 'Also called', value: 'Xieng Khuan' },
      { label: 'Time there', value: 'About 1 hour' },
    ],
    photo: p('buddha-park'),
    paragraphs: ['A monk built the park in the late 1950s. The pumpkin-shaped tower is the climb. The statues are Hindu and Buddhist figures in concrete. It is hot at midday, so morning is kinder.'],
    faqs: [],
    portraits: [
      port('Vientiane', '/vientiane', p('vientiane')),
      port('That Luang', '/attractions/pha-that-luang', p('that-luang')),
      port('Patuxai', '/attractions/patuxai', p('patuxai')),
    ],
    affiliates: [
      stay('Vientiane hotels', 'Base in the city and ride out after breakfast.', hotelSearchListUrl('vientiane'), p('wat-sisaket')),
      flight('Land at Wattay', 'Buddha Park is a city day, not its own flight.', flightLink('BKK', 'VTE'), p('friendship-bridge')),
    ],
    showStay: true,
  },
  {
    path: '/attractions/vang-vieng-blue-lagoon',
    title: 'Blue Lagoon',
    metaTitle: T('/attractions/vang-vieng-blue-lagoon', 'Vang Vieng Blue Lagoon: Swim Stop in the Karst'),
    description: 'Lagoon.',
    metaDescription: D('The Blue Lagoon is the swim stop outside Vang Vieng. Clear water under limestone, a short ticket, and a bumpy ride of about 30 minutes from town.'),
    lede: L('/attractions/vang-vieng-blue-lagoon', 'The Blue Lagoon is the swim Vang Vieng is known for. It fits an afternoon if you can handle a rough approach road.'),
    schema: 'TouristDestination',
    crumbs: crumbs([['Home', '/'], ['Attractions', '/attractions'], ['Blue Lagoon', '/attractions/vang-vieng-blue-lagoon']]),
    facts: [
      { label: 'From town', value: 'About 30 minutes by tuk-tuk' },
      { label: 'Ticket', value: 'A small cash fee' },
      { label: 'Water', value: 'Cool, under the karst' },
    ],
    photo: p('blue-lagoon'),
    paragraphs: ['Several lagoons share the name. Ask for the one your driver means, and the price, before you leave town. The last stretch is a dirt track. Bring a suit and cash.'],
    faqs: [],
    portraits: [
      port('Vang Vieng', '/vang-vieng', p('vang-vieng')),
      port('Nam Song', '/vang-vieng', p('vang-vieng-river')),
      port('Railway', '/get-there/laos-china-railway', p('lcr-train')),
    ],
    affiliates: [
      stay('Vang Vieng hotels', 'Sleep in town and ride out to the lagoon.', hotelSearchListUrl('vang-vieng'), p('hot-air')),
      ride('Train to Vang Vieng', 'Fast trains from Vientiane stop here.', trainLink('Vientiane', 'Vang Vieng'), p('lcr-station')),
    ],
    showStay: true,
  },
  {
    path: '/attractions/khone-phapheng-falls',
    title: 'Khone Phapheng Falls',
    metaTitle: T('/attractions/khone-phapheng-falls', 'Khone Phapheng Falls: Mekong Rapids in the South'),
    description: 'Falls.',
    metaDescription: D('Khone Phapheng is the wide Mekong falls near the Cambodian border. Go from Don Det or Pakse. The water is strongest late in the rains.'),
    lede: L('/attractions/khone-phapheng-falls', 'Khone Phapheng is the Mekong falls the south is known for. It fits a half day from the 4000 Islands or a long day from Pakse.'),
    schema: 'TouristDestination',
    crumbs: crumbs([['Home', '/'], ['Attractions', '/attractions'], ['Khone Phapheng Falls', '/attractions/khone-phapheng-falls']]),
    facts: [
      { label: 'From Don Det', value: 'A short mainland ride' },
      { label: 'From Pakse', value: 'About 3 hours by road' },
      { label: 'Water', value: 'Highest late in the rainy months' },
    ],
    photo: p('khone-phapheng'),
    paragraphs: ['The falls are a series of rapids, not a single drop. Walk the viewing path and pay the ticket in kip. Boats do not run the lip. The French gave up on that idea in the 19th century, which is why the islands have a railway relic instead.'],
    faqs: [],
    portraits: [
      port('4000 Islands', '/4000-islands', p('si-phan-don')),
      port('Don Khon', '/4000-islands', p('don-khon')),
      port('Pakse', '/pakse', p('pakse')),
    ],
    affiliates: [
      stay('Pakse hotels', 'Use Pakse if you are not sleeping on the islands.', hotelSearchListUrl('pakse'), p('pakse-market')),
      flight('Fly to Pakse', 'PKZ is the airport for this part of the Mekong.', flightLink('BKK', 'PKZ'), p('don-det')),
    ],
    showStay: true,
  },
  {
    path: '/attractions/wat-phou',
    title: 'Wat Phou',
    metaTitle: T('/attractions/wat-phou', 'Wat Phou Guide: The Khmer Temple near Champasak'),
    description: 'Temple.',
    metaDescription: D('Wat Phou is the Khmer temple hill south of Pakse. A UNESCO site, a museum, and a shuttle from the gate. Allow about half a day from town.'),
    lede: L('/attractions/wat-phou', 'Wat Phou is the Khmer temple the south is known for. It fits a half day from Pakse, with the museum if you like the stones.'),
    schema: 'TouristDestination',
    crumbs: crumbs([['Home', '/'], ['Attractions', '/attractions'], ['Wat Phou', '/attractions/wat-phou']]),
    facts: [
      { label: 'From Pakse', value: 'About 1 hour by road' },
      { label: 'Status', value: 'UNESCO World Heritage' },
      { label: 'On site', value: 'Museum and a shuttle to the causeway' },
    ],
    photo: p('wat-phou'),
    paragraphs: ['The temple climbs a hill above the plain, facing a baray in the Khmer plan. The ticket has covered the grounds, the museum, and a shuttle in recent seasons. Confirm the kip price at the booth. The steps are real. Go in the morning.'],
    faqs: [],
    portraits: [
      port('Pakse', '/pakse', p('pakse')),
      port('Champasak stones', '/attractions/wat-phou', p('champasak')),
      port('Bolaven', '/bolaven-plateau', p('tad-fane')),
    ],
    affiliates: [
      stay('Pakse hotels', 'Sleep in Pakse and leave for the temple after breakfast.', hotelSearchListUrl('pakse'), p('pakse-market')),
      flight('Fly into Pakse', 'There is no airport at the temple.', flightLink('VTE', 'PKZ'), p('season')),
    ],
    showStay: true,
  },
  {
    path: '/attractions/nong-khiaw-viewpoint',
    title: 'Nong Khiaw viewpoint',
    metaTitle: T('/attractions/nong-khiaw-viewpoint', 'Nong Khiaw Viewpoint: The Climb above the Nam Ou'),
    description: 'View.',
    metaDescription: D('The Nong Khiaw viewpoint is the reason to stay a night. A steep path above the Nam Ou, best early, with the gorge laid out below.'),
    lede: L('/attractions/nong-khiaw-viewpoint', 'The viewpoint is why Nong Khiaw is on a first itinerary at all. It fits an early climb, not a midday stroll.'),
    schema: 'TouristDestination',
    crumbs: crumbs([['Home', '/'], ['Attractions', '/attractions'], ['Nong Khiaw viewpoint', '/attractions/nong-khiaw-viewpoint']]),
    facts: [
      { label: 'Walk', value: 'Steep, about 30 to 40 minutes up' },
      { label: 'Best time', value: 'Early morning' },
      { label: 'Town', value: 'Nong Khiaw, on the Nam Ou' },
    ],
    photo: p('nong-khiaw-view'),
    paragraphs: ['The path starts in town and climbs to a ridge. Take water. The light is better before the haze builds. Coming down is the part people underestimate, so wear shoes with a grip.'],
    faqs: [],
    portraits: [
      port('Nong Khiaw', '/nong-khiaw', p('nong-khiaw')),
      port('Luang Prabang', '/luang-prabang', p('luang-prabang')),
      port('Vang Vieng', '/vang-vieng', p('vang-vieng')),
    ],
    affiliates: [
      stay('Luang Prabang hotels', 'The van north starts here the morning you leave.', hotelSearchListUrl('luang-prabang'), p('luang-prabang-palace')),
      flight('Fly into LPQ first', 'Then ride about 3 hours to Nong Khiaw.', flightLink('BKK', 'LPQ'), p('lpq-airport')),
    ],
    showStay: true,
  },
  {
    path: '/attractions/tad-fane',
    title: 'Tad Fane',
    metaTitle: T('/attractions/tad-fane', 'Tad Fane: The Twin Falls on the Bolaven Plateau'),
    description: 'Falls.',
    metaDescription: D('Tad Fane is the twin waterfall on the Bolaven Plateau, about 1 hour from Pakse. A short walk to the rim. The road is slower in heavy rain.'),
    lede: L('/attractions/tad-fane', 'Tad Fane is the waterfall the Bolaven Plateau is known for. It fits a day from Pakse, paired with Tad Yuang if the roads are dry.'),
    schema: 'TouristDestination',
    crumbs: crumbs([['Home', '/'], ['Attractions', '/attractions'], ['Tad Fane', '/attractions/tad-fane']]),
    facts: [
      { label: 'From Pakse', value: 'About 1 hour by road' },
      { label: 'Shape', value: 'Two streams off one cliff' },
      { label: 'Pair with', value: 'Tad Yuang, nearby' },
    ],
    photo: p('tad-fane'),
    paragraphs: ['A short walk from the ticket area reaches the viewpoint. Spray is part of the visit in the wet months. Do not plan a swim at the lip. The drop is the view.'],
    faqs: [],
    portraits: [
      port('Bolaven Plateau', '/bolaven-plateau', p('bolaven')),
      port('Tad Yuang', '/bolaven-plateau', p('tad-yuang')),
      port('Pakse', '/pakse', p('pakse')),
    ],
    affiliates: [
      stay('Pakse hotels', 'The falls are a day trip, not a hotel zone.', hotelSearchListUrl('pakse'), p('pakse-market')),
      flight('Fly to Pakse', 'Start the waterfall day from PKZ.', flightLink('BKK', 'PKZ'), p('friendship-bridge')),
    ],
    showStay: true,
  },
];
