export type NavCard = { href: string; name: string; photo: string };
export type NavCol = { title: string; href: string; links: { href: string; name: string }[] };
export type NavSlot = {
  label: string;
  href: string;
  see: string;
  cards: NavCard[];
  cols: NavCol[];
  colsClass?: string;
};

export const NAV_SLOTS: NavSlot[] = [
  {
    label: 'Destinations',
    href: '/destinations',
    see: 'See all destinations',
    cards: [
      { href: '/luang-prabang', name: 'Luang Prabang', photo: '/photos/luang-prabang.jpg' },
      { href: '/vientiane', name: 'Vientiane', photo: '/photos/vientiane.jpg' },
      { href: '/vang-vieng', name: 'Vang Vieng', photo: '/photos/vang-vieng.jpg' },
    ],
    cols: [
      {
        title: 'North and the river',
        href: '/luang-prabang',
        links: [
          { href: '/luang-prabang', name: 'Luang Prabang' },
          { href: '/nong-khiaw', name: 'Nong Khiaw' },
          { href: '/vang-vieng', name: 'Vang Vieng' },
        ],
      },
      {
        title: 'Capital',
        href: '/vientiane',
        links: [{ href: '/vientiane', name: 'Vientiane' }],
      },
      {
        title: 'South',
        href: '/pakse',
        links: [
          { href: '/pakse', name: 'Pakse' },
          { href: '/bolaven-plateau', name: 'Bolaven Plateau' },
          { href: '/4000-islands', name: '4000 Islands' },
        ],
      },
    ],
  },
  {
    label: 'Plan',
    href: '/plan',
    see: 'See planning guides',
    cards: [
      { href: '/plan/best-time-to-visit', name: 'Best time', photo: '/photos/season.jpg' },
      { href: '/plan/visa-and-evisa', name: 'Visa and eVisa', photo: '/photos/wattay.jpg' },
      { href: '/get-there/laos-china-railway', name: 'Railway', photo: '/photos/lcr-train.jpg' },
    ],
    cols: [
      {
        title: 'Before you go',
        href: '/plan',
        links: [
          { href: '/plan/best-time-to-visit', name: 'Best time to visit' },
          { href: '/plan/visa-and-evisa', name: 'Visa and eVisa' },
          { href: '/plan/money-and-sim', name: 'Money and SIM' },
        ],
      },
      {
        title: 'Getting there',
        href: '/get-there',
        links: [
          { href: '/get-there/laos-china-railway', name: 'Laos-China Railway' },
          { href: '/get-there/bangkok-to-laos', name: 'Bangkok to Laos' },
          { href: '/get-there/hanoi-to-laos', name: 'Hanoi to Laos' },
        ],
      },
    ],
  },
];

export const NAV_LINKS = [
  { href: '/lao-food', label: 'Food' },
  { href: '/itineraries', label: 'Itineraries' },
  { href: '/attractions', label: 'Attractions' },
];
