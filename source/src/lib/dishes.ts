export type Dish = {
  slug: string;
  city: string;
  title: string;
  nameLocal: string;
  line: string;
  photo: string;
  orderLocal?: string;
};

/** Fifteen dishes a first trip actually meets. Photos are the dish, not a place sign. */
export const LAO_DISHES: Dish[] = [
  { slug: 'laap', city: 'laos', title: 'Laap', nameLocal: 'ລາບ', line: 'Minced meat, herbs, lime, and roasted rice powder. The plate to order first.', photo: '/photos/dish-laap.jpg' },
  { slug: 'tam-mak-hoong', city: 'laos', title: 'Tam mak hoong', nameLocal: 'ຕໍາຫມາກຫຸ່ງ', line: 'Green papaya salad, pounded to order, often hotter than you expect.', photo: '/photos/dish-tam-mak-hoong.jpg' },
  { slug: 'khao-niao', city: 'laos', title: 'Khao niao', nameLocal: 'ເຂົ້າໜຽວ', line: 'Sticky rice in a basket. It is the staple, not a side.', photo: '/photos/dish-khao-niao.jpg' },
  { slug: 'sai-oua', city: 'laos', title: 'Sai oua', nameLocal: 'ໄສ້ອ່ວ', line: 'Herb sausage, grilled, and cut into coins for sharing.', photo: '/photos/dish-sai-oua.jpg' },
  { slug: 'mok-pa', city: 'laos', title: 'Mok pa', nameLocal: 'ຫມົກປາ', line: 'Fish steamed in a banana leaf with herbs and coconut or broth.', photo: '/photos/dish-mok-pa.jpg' },
  { slug: 'khao-piak-sen', city: 'laos', title: 'Khao piak sen', nameLocal: 'ເຂົ້າປຽກເສັ້ນ', line: 'Soft rice-noodle soup for breakfast, often with chicken.', photo: '/photos/dish-khao-piak-sen.jpg' },
  { slug: 'feu', city: 'laos', title: 'Feu', nameLocal: 'ເຝີ', line: 'Clear noodle soup with herbs. The Lao bowl beside Vietnamese pho.', photo: '/photos/dish-feu.jpg' },
  { slug: 'ping-kai', city: 'laos', title: 'Ping kai', nameLocal: 'ປີ້ງໄກ່', line: 'Grilled chicken, eaten with sticky rice and a chili dip.', photo: '/photos/dish-ping-kai.jpg' },
  { slug: 'nam-tok', city: 'laos', title: 'Ping sin nam tok', nameLocal: 'ປີ້ງຊີ້ນນ້ຳຕົກ', line: 'Grilled beef sliced into a lime and herb salad.', photo: '/photos/dish-nam-tok.jpg' },
  { slug: 'sin-dad', city: 'laos', title: 'Lao hot pot', nameLocal: 'ຊີ້ນດາດ', line: 'A table grill or hot pot for a group, with meat and greens.', photo: '/photos/dish-sin-dad.jpg' },
  { slug: 'khao-jee', city: 'laos', title: 'Khao jee', nameLocal: 'ເຂົ້າຈີ່', line: 'Sticky rice paste grilled on a stick, often with egg.', photo: '/photos/dish-khao-jee.jpg' },
  { slug: 'khao-poon', city: 'laos', title: 'Khao poon', nameLocal: 'ເຂົ້າປຸ້ນ', line: 'Rice vermicelli with a coconut or tomato broth and herbs.', photo: '/photos/dish-khao-poon.jpg' },
  { slug: 'gaeng-nor-mai', city: 'laos', title: 'Bamboo soup', nameLocal: 'ແກງຫນໍ່ໄມ້', line: 'Bamboo shoots in a light broth. A market lunch, not a showpiece.', photo: '/photos/dish-bamboo.jpg' },
  { slug: 'miang', city: 'laos', title: 'Miang', nameLocal: 'ເມື່ອງ', line: 'Bites wrapped in leaves with ginger, chili, and lime.', photo: '/photos/dish-miang.jpg' },
  { slug: 'khao-tom', city: 'laos', title: 'Khao tom', nameLocal: 'ເຂົ້າຕົ້ມ', line: 'Banana-leaf packets of rice, sweet or savory, from the morning market.', photo: '/photos/dish-khao-tom.jpg' },
];

export function allDishes(): Dish[] {
  return LAO_DISHES;
}
