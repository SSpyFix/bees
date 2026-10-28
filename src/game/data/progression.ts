export const EGGS = {
  egg: {
    name: "Basic Egg",
    odds: [
      ["Common", 0.87],
      ["Rare", 0.1],
      ["Epic", 0.025],
      ["Legendary", 0.005],
    ],
  },
  silverEgg: {
    name: "Silver Egg",
    odds: [
      ["Rare", 0.649],
      ["Epic", 0.3],
      ["Legendary", 0.05],
      ["Mythic", 0.001],
    ],
  },
  goldEgg: {
    name: "Gold Egg",
    odds: [
      ["Epic", 0.79],
      ["Legendary", 0.2],
      ["Mythic", 0.01],
    ],
  },
  diamondEgg: {
    name: "Diamond Egg",
    odds: [
      ["Legendary", 0.95],
      ["Mythic", 0.05],
    ],
  },
  mythicEgg: { name: "Mythic Egg", odds: [["Mythic", 1]] },
} as const;
export type EggKind = keyof typeof EGGS;
export const BOND_REQUIREMENTS = [
  10, 40, 200, 750, 4000, 15000, 60000, 270000, 450000, 1200000, 2000000,
  4000000, 7000000, 15000000, 120000000, 450000000, 1900000000, 7500000000,
  15000000000, 475000000000, 4500000000000, 95000000000000, 900000000000000,
  9000000000000000,
];
export const bondRequired = (level: number) =>
  BOND_REQUIREMENTS[level - 1] ?? Infinity;
export const TICKET_ITEMS = [
  { id: "silverEgg", cost: 50 },
  { id: "goldEgg", cost: 100 },
  { id: "diamondEgg", cost: 400 },
  { id: "mythicEgg", cost: 2500 },
  { id: "starTreat", cost: 1000 },
];

export const ITEM_NAMES: Record<string, string> = {
  ...Object.fromEntries(
    Object.entries(EGGS).map(([id, egg]) => [id, egg.name]),
  ),
  treat: "Treat",
  jelly: "Royal Jelly",
  starJelly: "Star Jelly",
  starTreat: "Star Treat",
  ticket: "Ticket",
  booster: "Field Dice",
  converter: "Micro-Converter",
  sunflowerSeed: "Sunflower Seed",
  strawberry: "Strawberry",
  blueberry: "Blueberry",
  pineapple: "Pineapple",
  gumdrops: "Gumdrops",
  stinger: "Stinger",
  moonCharm: "Moon Charm",
  glitter: "Glitter",
  glue: "Glue",
  redExtract: "Red Extract",
  blueExtract: "Blue Extract",
  oil: "Oil",
  enzymes: "Enzymes",
  softWax: "Soft Wax",
  magicBean: "Magic Bean",
  coconut: "Coconut",
  tropicalDrink: "Tropical Drink",
  spiritPetal: "Spirit Petal",
  refreshingVial: "Refreshing Vial",
  comfortingVial: "Comforting Vial",
  invigoratingVial: "Invigorating Vial",
  satisfyingVial: "Satisfying Vial",
  hardWax: "Hard Wax",
  causticWax: "Caustic Wax",
  swirledWax: "Swirled Wax",
  superSmoothie: "Super Smoothie",
  turpentine: "Turpentine",
};
