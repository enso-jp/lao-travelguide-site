export const homeMedia = {
  lead: {
    href: '/luang-prabang',
    photo: '/photos/luang-prabang.jpg',
    kicker: 'Laos travel guide',
    title: 'Temples at dawn, a fast train, and the Mekong in the south',
    sub: 'Start in Luang Prabang or Vientiane. Add Vang Vieng if you want karst and a swim. Save Pakse for waterfalls or the islands.',
    when: '8 min read',
  },
  sheet: [
    { href: '/attractions/kuang-si-falls', kicker: 'Waterfall', title: 'Kuang Si before the pools fill', when: 'Half a day', photo: '/photos/kuang-si.jpg' },
    { href: '/get-there/laos-china-railway', kicker: 'Train', title: 'Vientiane to Luang Prabang by rail', when: 'About 2 hours', photo: '/photos/lcr-train.jpg' },
    { href: '/lao-food', kicker: 'Food', title: 'Sticky rice, laap, and a morning soup', when: '15 dishes', photo: '/photos/dish-laap.jpg' },
  ],
  collage: [
    { spot: 'collage-lead', href: '/vientiane', kicker: 'Capital', title: 'Vientiane', photo: '/photos/vientiane.jpg' },
    { spot: 'collage-top', href: '/vang-vieng', kicker: 'Karst', title: 'Vang Vieng', photo: '/photos/vang-vieng.jpg' },
    { spot: 'collage-mid', href: '/4000-islands', kicker: 'Mekong', title: '4000 Islands', photo: '/photos/si-phan-don.jpg' },
    { spot: 'collage-wide', href: '/pakse', kicker: 'South', title: 'Pakse', photo: '/photos/pakse.jpg' },
    { spot: 'collage-end', href: '/nong-khiaw', kicker: 'River', title: 'Nong Khiaw', photo: '/photos/nong-khiaw.jpg' },
  ],
  topPlaces: [
    { name: 'Luang Prabang', href: '/luang-prabang', photo: '/photos/luang-prabang-palace.jpg', dots: 5, line: 'Dawn alms, Kuang Si, and a walkable peninsula.' },
    { name: 'Vientiane', href: '/vientiane', photo: '/photos/vientiane-lane-xang.jpg', dots: 4, line: 'That Luang, Patuxai, and Wattay airport.' },
    { name: 'Vang Vieng', href: '/vang-vieng', photo: '/photos/vang-vieng-river.jpg', dots: 4, line: 'A railway stop and a lagoon afternoon.' },
    { name: '4000 Islands', href: '/4000-islands', photo: '/photos/don-det.jpg', dots: 4, line: 'Don Det, Don Khon, and Khone Phapheng.' },
    { name: 'Bolaven Plateau', href: '/bolaven-plateau', photo: '/photos/tad-fane.jpg', dots: 4, line: 'Twin falls and coffee country from Pakse.' },
    { name: 'Nong Khiaw', href: '/nong-khiaw', photo: '/photos/nong-khiaw-view.jpg', dots: 4, line: 'A viewpoint above the Nam Ou.' },
  ],
  plan: [
    { href: '/plan/best-time-to-visit', title: 'Best time to visit', text: 'Cool months, then the rains that fill the falls.', icon: 'calendar' },
    { href: '/plan/visa-and-evisa', title: 'Visa and eVisa', text: '30-day tourist stay. Print the approval letter.', icon: 'passport' },
    { href: '/get-there/laos-china-railway', title: 'Laos-China Railway', text: 'Fastest link from Vientiane to Luang Prabang.', icon: 'train' },
    { href: '/get-there/bangkok-to-laos', title: 'From Bangkok', text: 'Flight, or the sleeper to Khamsavath.', icon: 'ferry' },
    { href: '/plan/money-and-sim', title: 'Kip and a SIM', text: 'Cash for markets. Passport for a local SIM.', icon: 'wallet' },
    { href: '/itineraries/7-days', title: 'First 7 days', text: 'Luang Prabang, the train, then Vientiane.', icon: 'route' },
  ],
  interests: [
    { href: '/lao-food', label: 'Lao food', photo: '/photos/lao-food.jpg' },
    { href: '/attractions/pha-that-luang', label: 'Temples', photo: '/photos/that-luang.jpg' },
    { href: '/4000-islands', label: 'The Mekong', photo: '/photos/mekong-ferry.jpg' },
  ],
  stories: [
    { href: '/plan/best-time-to-visit', kicker: 'Season', title: 'When the air is easy, and when the falls are full', when: 'Nov to Feb', photo: '/photos/plan.jpg', summary: 'Cool, dry months for towns. Late rains for Kuang Si and the Bolaven.' },
    { href: '/attractions/wat-phou', kicker: 'South', title: 'Wat Phou, then a night in Pakse', when: 'Half a day', photo: '/photos/wat-phou.jpg', summary: 'The Khmer hill temple is the reason to fly south.' },
    { href: '/attractions/khone-phapheng-falls', kicker: 'Falls', title: 'Khone Phapheng at the end of the islands', when: 'From Don Det', photo: '/photos/khone-phapheng.jpg', summary: 'The Mekong drops in a wide set of rapids near the border.' },
  ],
};

export function homePhotoList(): string[] {
  const m = homeMedia;
  return [
    m.lead.photo,
    ...m.sheet.map((row) => row.photo),
    ...m.collage.map((row) => row.photo),
    ...m.topPlaces.map((row) => row.photo),
    ...m.interests.map((row) => row.photo),
    ...m.stories.map((row) => row.photo),
  ];
}
