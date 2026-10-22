export type Color = "white" | "red" | "blue";
export type Vec = { x: number; y: number; z: number };
export type Field = Vec & {
  id: string;
  name: string;
  gate: number;
  biome: string;
  colors: [number, number, number];
  width: number;
};
const field = (
  id: string,
  name: string,
  x: number,
  z: number,
  y: number,
  gate: number,
  biome: string,
  colors: [number, number, number],
): Field => ({ id, name, x, z, y, gate, biome, colors, width: 21 });
export const FIELDS: Field[] = [
  field(
    "sunflower",
    "Sunflower Field",
    -27,
    34,
    0,
    0,
    "sunflower",
    [0.8, 0.1, 0.1],
  ),
  field(
    "dandelion",
    "Dandelion Field",
    0,
    8,
    0,
    0,
    "dandelion",
    [0.7, 0.15, 0.15],
  ),
  field(
    "mushroom",
    "Mushroom Field",
    31,
    34,
    0,
    0,
    "mushroom",
    [0.25, 0.65, 0.1],
  ),
  field("blue", "Blue Flower Field", -46, -3, 0, 0, "blue", [0.2, 0.1, 0.7]),
  field("clover", "Clover Field", 44, -4, 0, 0, "clover", [0.5, 0.25, 0.25]),
  field("spider", "Spider Field", 0, -37, 8, 5, "spider", [0.7, 0.15, 0.15]),
  field("bamboo", "Bamboo Field", -46, -65, 8, 5, "bamboo", [0.2, 0.1, 0.7]),
  field(
    "strawberry",
    "Strawberry Field",
    44,
    -65,
    8,
    5,
    "strawberry",
    [0.15, 0.75, 0.1],
  ),
  field(
    "pineapple",
    "Pineapple Patch",
    -52,
    -112,
    16,
    10,
    "pineapple",
    [0.6, 0.2, 0.2],
  ),
  field("stump", "Stump Field", -26, -109, 16, 10, "stump", [0.8, 0.1, 0.1]),
  field("cactus", "Cactus Field", 25, -93, 20, 15, "cactus", [0.4, 0.35, 0.25]),
  field(
    "pumpkin",
    "Pumpkin Patch",
    54,
    -93,
    20,
    15,
    "pumpkin",
    [0.4, 0.35, 0.25],
  ),
  field(
    "pine",
    "Pine Tree Forest",
    25,
    -122,
    20,
    15,
    "pine",
    [0.15, 0.1, 0.75],
  ),
  field("rose", "Rose Field", 54, -122, 20, 15, "rose", [0.1, 0.8, 0.1]),
  field(
    "mountain",
    "Mountain Top Field",
    0,
    -157,
    32,
    25,
    "mountain",
    [0.34, 0.33, 0.33],
  ),
  field(
    "coconut",
    "Coconut Field",
    22,
    -218,
    44,
    35,
    "coconut",
    [0.7, 0.15, 0.15],
  ),
  field("pepper", "Pepper Patch", 57, -218, 44, 35, "pepper", [0.1, 0.8, 0.1]),
];
export const PLATFORMS = [
  { x: 0, z: 30, w: 140, d: 100, y: 0, gate: 0 },
  { x: 0, z: -50, w: 140, d: 60, y: 8, gate: 5 },
  { x: -42, z: -107, w: 58, d: 54, y: 16, gate: 10 },
  { x: 43, z: -107, w: 60, d: 54, y: 20, gate: 15 },
  { x: 0, z: -155, w: 82, d: 42, y: 32, gate: 25 },
  { x: 43, z: -210, w: 82, d: 68, y: 44, gate: 35 },
];
export const RAMPS = [
  {
    x: -12,
    w: 12,
    startZ: -8,
    endZ: -43,
    low: 0,
    high: 8,
    gate: 5,
    gateZ: -19,
  },
  {
    x: -47,
    w: 12,
    startZ: -65,
    endZ: -101,
    low: 8,
    high: 16,
    gate: 10,
    gateZ: -79,
  },
  {
    x: 48,
    w: 12,
    startZ: -65,
    endZ: -101,
    low: 8,
    high: 20,
    gate: 15,
    gateZ: -79,
  },
  {
    x: -23,
    w: 12,
    startZ: -117,
    endZ: -153,
    low: 16,
    high: 32,
    gate: 25,
    gateZ: -133,
  },
  {
    x: 27,
    w: 12,
    startZ: -117,
    endZ: -153,
    low: 20,
    high: 32,
    gate: 25,
    gateZ: -133,
  },
  {
    x: 24,
    w: 14,
    startZ: -159,
    endZ: -205,
    low: 32,
    high: 44,
    gate: 35,
    gateZ: -178,
  },
];
export const HIVE_PADS = [-60, -40, -20, 0, 20, 40].map((x, index) => ({
  x,
  y: 0,
  z: 61,
  index,
}));
export const HIVE = { x: 0, y: 0, z: 61 };
export type Gear = {
  id: string;
  name: string;
  description: string;
  cost: number;
  gate: number;
  icon: string;
  type: "tool" | "bag" | "boots" | "hat";
  range?: number;
  power?: number;
  interval?: number;
  shape?: "circle" | "line" | "cone";
  color?: Color;
  capacity?: number;
  speed?: number;
  convert?: number;
};
const names = [
  "Scooper",
  "Rake",
  "Clippers",
  "Magnet",
  "Vacuum",
  "Super-Scooper",
  "Pulsar",
  "Electro-Magnet",
  "Scissors",
  "Honey Dipper",
  "Bubble Wand",
  "Scythe",
  "Golden Rake",
  "Spark Staff",
  "Porcelain Dipper",
  "Petal Wand",
  "Tide Popper",
  "Dark Scythe",
  "Gummyballer",
];
const costs = [
  0, 800, 2200, 5500, 14000, 32000, 125000, 300000, 850000, 1500000, 3500000,
  3500000, 20000000, 60000000, 150000000, 1500000000, 2500000000000,
  2500000000000, 10000000000000,
];
export const TOOLS: Gear[] = names.map((name, i) => ({
  id: `tool-${i}`,
  name,
  description: `${name}: collects nearby flower tiles using a ${i % 3 === 1 ? "line" : i % 3 === 2 ? "cone" : "circle"} pattern.`,
  cost: costs[i],
  gate: i < 6 ? 0 : i < 12 ? 10 : i < 15 ? 25 : 35,
  icon: "",
  type: "tool",
  range: 2.8 + i * 0.35,
  power: 2 + i * 2,
  interval: Math.max(0.18, 0.8 - i * 0.035),
  shape: i % 3 === 1 ? "line" : i % 3 === 2 ? "cone" : "circle",
  color: i === 10 ? "blue" : i === 11 || i === 17 ? "red" : "white",
}));
export const BAGS: Gear[] = [
  "Pouch",
  "Jar",
  "Backpack",
  "Canister",
  "Port-O-Hive",
  "Porcelain Port-O-Hive",
  "Coconut Canister",
  "Coconut Belt",
].map((name, i) => ({
  id: `bag-${i}`,
  name,
  description: `Capacity: ${[200, 750, 3500, 10000, 250000, 500000, 2500000, 5000000][i].toLocaleString()} pollen.`,
  cost: [0, 650, 5500, 22000, 250000, 250000000, 25000000000, 7500000000000][i],
  gate: [0, 0, 0, 0, 10, 25, 35, 35][i],
  type: "bag",
  icon: "",
  capacity: [200, 750, 3500, 10000, 250000, 500000, 2500000, 5000000][i],
  convert: 1 + i * 0.6,
}));
export const EXTRAS: Gear[] = [
  {
    id: "boots-1",
    name: "Basic Boots",
    description: "Move 20% faster on every trail.",
    cost: 350,
    gate: 0,
    type: "boots",
    icon: "♟",
    speed: 1.2,
  },
  {
    id: "boots-2",
    name: "Beekeeper’s Boots",
    description: "Move 45% faster. Made for long climbs.",
    cost: 15000,
    gate: 10,
    type: "boots",
    icon: "♟",
    speed: 1.45,
  },
  {
    id: "hat-1",
    name: "Propeller Hat",
    description: "Gather 15% more pollen.",
    cost: 600,
    gate: 0,
    type: "hat",
    icon: "♙",
    power: 1.15,
  },
  {
    id: "hat-2",
    name: "Beekeeper’s Mask",
    description: "Gather 40% more pollen.",
    cost: 45000,
    gate: 15,
    type: "hat",
    icon: "♛",
    power: 1.4,
  },
];
export const GEAR = [...TOOLS, ...BAGS, ...EXTRAS];
export { BEES } from "./bees";
export type { BeeDefinition as BeeDef } from "./bees";
export type Place = Vec & {
  id: string;
  name: string;
  kind:
    | "shop"
    | "eggs"
    | "npc"
    | "boost"
    | "treat"
    | "daily"
    | "challenge"
    | "cannon"
    | "tickets";
  gate: number;
  role?: string;
  accent: string;
};
export const EVENT_OFFERS = [
  { kind: "bee-36", cost: 250 },
  { kind: "bee-37", cost: 250 },
  { kind: "bee-39", cost: 500 },
  { kind: "bee-41", cost: 500 },
  { kind: "bee-42", cost: 500 },
  { kind: "bee-43", cost: 500 },
];
export const PLACES: Place[] = [
  {
    id: "tickets",
    name: "Ticket Tent",
    kind: "tickets",
    x: -28,
    y: 0,
    z: 49,
    gate: 0,
    accent: "#ffcf21",
  },
  {
    id: "blue-hq",
    name: "Blue HQ",
    kind: "shop",
    x: -63,
    y: 0,
    z: -1,
    gate: 0,
    accent: "#153dc7",
  },
  {
    id: "red-hq",
    name: "Red HQ",
    kind: "shop",
    x: 63,
    y: 0,
    z: -1,
    gate: 0,
    accent: "#e62424",
  },
  {
    id: "red-cannon",
    name: "Red Cannon · Mountain Top",
    kind: "cannon",
    x: -60,
    y: 8,
    z: -28,
    gate: 5,
    accent: "#e91f24",
  },
  {
    id: "mountain-cannon",
    name: "Return Cannon · Hive Grounds",
    kind: "cannon",
    x: 8,
    y: 32,
    z: -139,
    gate: 25,
    accent: "#222222",
  },
  {
    id: "shop",
    name: "Basic Shop",
    kind: "shop",
    x: -48,
    y: 0,
    z: 55,
    gate: 0,
    accent: "#ecb75e",
  },
  {
    id: "eggs",
    name: "Basic Egg Shop",
    kind: "eggs",
    x: 55,
    y: 0,
    z: 55,
    gate: 0,
    accent: "#92c7c1",
  },
  {
    id: "juniper",
    name: "Black Bear",
    kind: "npc",
    role: "Meadow keeper",
    x: -12,
    y: 0,
    z: 21,
    gate: 0,
    accent: "#202020",
  },
  {
    id: "maple",
    name: "Brown Bear",
    kind: "npc",
    role: "Forager",
    x: 55,
    y: 0,
    z: 49,
    gate: 0,
    accent: "#85542d",
  },
  {
    id: "pippin",
    name: "Mother Bear",
    kind: "npc",
    role: "Bee guardian",
    x: -57,
    y: 0,
    z: 28,
    gate: 0,
    accent: "#8d6748",
  },
  {
    id: "rowan",
    name: "Panda Bear",
    kind: "npc",
    role: "Trail ranger",
    x: -32,
    y: 8,
    z: -25,
    gate: 5,
    accent: "#ececec",
  },
  {
    id: "sage",
    name: "Science Bear",
    kind: "npc",
    role: "Field researcher",
    x: -40,
    y: 16,
    z: -91,
    gate: 10,
    accent: "#a0c96b",
  },
  {
    id: "hazel",
    name: "Polar Bear",
    kind: "npc",
    role: "Ridge explorer",
    x: 63,
    y: 20,
    z: -86,
    gate: 15,
    accent: "#f4f4f4",
  },
  {
    id: "orion",
    name: "Spirit Bear",
    kind: "npc",
    role: "Summit keeper",
    x: 0,
    y: 32,
    z: -138,
    gate: 25,
    accent: "#cfb7d0",
  },
  {
    id: "shop-10",
    name: "Pro Shop",
    kind: "shop",
    x: -64,
    y: 16,
    z: -91,
    gate: 10,
    accent: "#91babe",
  },
  {
    id: "shop-25",
    name: "Mountain Top Shop",
    kind: "shop",
    x: -29,
    y: 32,
    z: -164,
    gate: 25,
    accent: "#bc9dcc",
  },
  {
    id: "shop-35",
    name: "Coconut Shop",
    kind: "shop",
    x: 77,
    y: 44,
    z: -196,
    gate: 35,
    accent: "#eaa48a",
  },
  {
    id: "boost",
    name: "Field Booster",
    kind: "boost",
    x: 18,
    y: 0,
    z: 12,
    gate: 0,
    accent: "#95b8dd",
  },
  {
    id: "treat",
    name: "Treat Dispenser",
    kind: "treat",
    x: -64,
    y: 0,
    z: 18,
    gate: 0,
    accent: "#dfb88f",
  },
  {
    id: "daily",
    name: "Honey Dispenser",
    kind: "daily",
    x: 60,
    y: 0,
    z: 15,
    gate: 0,
    accent: "#f0ca68",
  },
  {
    id: "challenge",
    name: "Clover Sprint",
    kind: "challenge",
    x: 59,
    y: 0,
    z: 8,
    gate: 0,
    accent: "#e5a97e",
  },
];
export type Objective = {
  event: string;
  amount: number;
  target?: string;
  label: string;
};
export type Quest = {
  id: string;
  npc: string;
  name: string;
  dialogue: string;
  gate: number;
  previous?: string;
  objectives: Objective[];
  honey: number;
  egg: number;
  treat: number;
  repeat?: boolean;
};
const giverIds = [
  "juniper",
  "maple",
  "pippin",
  "rowan",
  "sage",
  "hazel",
  "orion",
];
const questTitles = [
  [
    "A little pollen",
    "A golden beginning",
    "Meadow medley",
    "The honey trail",
    "Keeper of the meadow",
  ],
  [
    "Red letter day",
    "Into the blue",
    "Wildflower harvest",
    "A pocketful of sunshine",
    "Forager’s bounty",
  ],
  [
    "A growing family",
    "A sweet treat",
    "Bonding time",
    "A bigger swarm",
    "Friends for life",
  ],
  [
    "Trail trouble",
    "Token trail",
    "Ranger patrol",
    "Wings of courage",
    "The wild watch",
  ],
  [
    "A field study",
    "Color theory",
    "Hive chemistry",
    "Natural selection",
    "The grand experiment",
  ],
  [
    "Ridge wanderer",
    "Rose-colored days",
    "The high harvest",
    "A braver beekeeper",
    "Above the clouds",
  ],
  [
    "A crown of pollen",
    "Summit research",
    "Mountain guardian",
    "Golden legacy",
    "Endless summer",
  ],
];
export const QUESTS: Quest[] = giverIds.flatMap((npc, n) =>
  Array.from({ length: 5 }, (_, i) => {
    let objectives: Objective[] = [
      {
        event: "pollen",
        amount: (n + 1) * (i + 1) * 100,
        label: "Gather pollen",
      },
    ];
    if (n === 1)
      objectives = [
        {
          event: "color",
          target: i % 2 ? "blue" : "red",
          amount: (i + 1) * 120,
          label: `Gather ${i % 2 ? "blue" : "red"} pollen`,
        },
      ];
    if (n === 2)
      objectives = [
        i % 2 === 0
          ? { event: "hatch", amount: 1 + i, label: "Hatch bees" }
          : { event: "feed", amount: 3 * (i + 1), label: "Feed treats" },
      ];
    if (n === 3)
      objectives = [
        {
          event: i % 2 ? "token" : "kill",
          amount: i % 2 ? 5 * (i + 1) : i + 1,
          label: i % 2 ? "Collect tokens" : "Defeat enemies",
        },
      ];
    if (n === 4)
      objectives = [
        { event: "pollen", amount: 800 * (i + 1), label: "Gather pollen" },
        {
          event: "convert",
          amount: 300 * (i + 1),
          label: "Convert pollen to honey",
        },
      ];
    if (n === 5)
      objectives = [
        {
          event: "field",
          target: i % 2 ? "rose" : "pine",
          amount: 1000 * (i + 1),
          label: `Gather in ${i % 2 ? "Rose Field" : "Pine Tree Forest"}`,
        },
      ];
    if (n === 6)
      objectives = [
        {
          event: "field",
          target: "mountain",
          amount: 2000 * (i + 1),
          label: "Gather at Mountain Top Field",
        },
        { event: "kill", amount: i + 2, label: "Defeat mountain creatures" },
      ];
    return {
      id: `${npc}-${i}`,
      npc,
      name: questTitles[n][i],
      dialogue: [
        "Every great swarm starts with a single blossom. Find a meadow and let your bees lead the way.",
        "Follow the colors. Our mountain has a flower for every kind of bee.",
        "Your bees are family. Give them a little time, a good meal, and room to grow.",
        "These trails need a brave beekeeper. Keep an eye out for creatures and their treasures.",
        "Observation, collection, discovery. The mountain is our living laboratory.",
        "There is always another path to explore. Meet me among the high flowers.",
        "You have come a long way, little keeper. Let us see what your swarm can really do.",
      ][n],
      gate: [0, 0, 0, 5, 10, 15, 25][n],
      previous: i ? `${npc}-${i - 1}` : undefined,
      objectives,
      honey: (n + 1) * (i + 1) * 150,
      egg: i === 1 || i === 4 ? 1 : 0,
      treat: (i + 1) * 3,
      repeat: i === 4,
    };
  }),
);
export const RARITY_COLORS: Record<string, string> = {
  Common: "#a9b9a2",
  Rare: "#74b9d5",
  Epic: "#b19bd9",
  Legendary: "#e3bd56",
  Mythic: "#eb879a",
  Event: "#80cdb7",
};
export const ENEMY_TYPES = [
  {
    id: "ladybug",
    name: "Ladybug",
    color: "#d97560",
    hp: 25,
    damage: 5,
    speed: 2.4,
    reward: 35,
  },
  {
    id: "beetle",
    name: "Rhino Beetle",
    color: "#6f9671",
    hp: 45,
    damage: 8,
    speed: 2,
    reward: 65,
  },
  {
    id: "spider",
    name: "Spider",
    color: "#8e7c9c",
    hp: 90,
    damage: 12,
    speed: 3.5,
    reward: 140,
  },
  {
    id: "mantis",
    name: "Mantis",
    color: "#a1ba70",
    hp: 160,
    damage: 16,
    speed: 3,
    reward: 230,
  },
  {
    id: "scorpion",
    name: "Scorpion",
    color: "#c6a06a",
    hp: 240,
    damage: 18,
    speed: 3,
    reward: 380,
  },
  {
    id: "wolf",
    name: "Werewolf",
    color: "#939fa4",
    hp: 360,
    damage: 22,
    speed: 4,
    reward: 600,
  },
  {
    id: "boss",
    name: "Coconut Crab",
    color: "#b68a62",
    hp: 1800,
    damage: 30,
    speed: 2.7,
    reward: 3500,
  },
  {
    id: "mondo",
    name: "Mondo Chick",
    color: "#f8dc38",
    hp: 1600,
    damage: 25,
    speed: 2,
    reward: 3000,
  },
];
export const ENEMY_SPAWNS = [
  { type: 0, x: 43, z: 14, y: 0, gate: 0 },
  { type: 1, x: -53, z: 13, y: 0, gate: 0 },
  { type: 2, x: -44, z: -48, y: 8, gate: 5 },
  { type: 3, x: -30, z: -78, y: 8, gate: 5 },
  { type: 1, x: -40, z: -123, y: 16, gate: 10 },
  { type: 4, x: 40, z: -98, y: 20, gate: 15 },
  { type: 5, x: 39, z: -126, y: 20, gate: 15 },
  { type: 7, x: 15, z: -163, y: 32, gate: 25 },
  { type: 6, x: 38, z: -221, y: 44, gate: 35 },
];
