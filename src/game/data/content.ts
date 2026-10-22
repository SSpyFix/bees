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
    "Sunflower Meadow",
    -27,
    34,
    0,
    0,
    "sunflower",
    [0.8, 0.1, 0.1],
  ),
  field(
    "dandelion",
    "Dandelion Lawn",
    0,
    8,
    0,
    0,
    "dandelion",
    [0.7, 0.15, 0.15],
  ),
  field(
    "mushroom",
    "Mushroom Grove",
    31,
    34,
    0,
    0,
    "mushroom",
    [0.25, 0.65, 0.1],
  ),
  field("blue", "Bluebell Garden", -46, -3, 0, 0, "blue", [0.2, 0.1, 0.7]),
  field("clover", "Clover Commons", 44, -4, 0, 0, "clover", [0.5, 0.25, 0.25]),
  field(
    "spider",
    "Silkwood Glade",
    -43,
    -37,
    8,
    5,
    "spider",
    [0.7, 0.15, 0.15],
  ),
  field("bamboo", "Bamboo Terrace", -55, -65, 8, 5, "bamboo", [0.2, 0.1, 0.7]),
  field(
    "strawberry",
    "Strawberry Rise",
    -24,
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
  field(
    "stump",
    "Old Stump Hollow",
    -26,
    -109,
    16,
    10,
    "stump",
    [0.8, 0.1, 0.1],
  ),
  field("cactus", "Cactus Ridge", 25, -38, 13, 15, "cactus", [0.4, 0.35, 0.25]),
  field(
    "pumpkin",
    "Pumpkin Hollow",
    54,
    -38,
    13,
    15,
    "pumpkin",
    [0.4, 0.35, 0.25],
  ),
  field("pine", "Pinewood Forest", 25, -67, 13, 15, "pine", [0.15, 0.1, 0.75]),
  field("rose", "Wild Rose Terrace", 54, -67, 13, 15, "rose", [0.1, 0.8, 0.1]),
  field(
    "mountain",
    "Mountain Crown",
    0,
    -157,
    26,
    25,
    "mountain",
    [0.34, 0.33, 0.33],
  ),
  field(
    "coconut",
    "Coconut Cove",
    22,
    -218,
    38,
    35,
    "coconut",
    [0.7, 0.15, 0.15],
  ),
  field("pepper", "Pepper Summit", 57, -218, 38, 35, "pepper", [0.1, 0.8, 0.1]),
];
export const PLATFORMS = [
  { x: 0, z: 30, w: 140, d: 100, y: 0 },
  { x: -39, z: -50, w: 62, d: 60, y: 8 },
  { x: -42, z: -107, w: 58, d: 54, y: 16 },
  { x: 39, z: -51, w: 62, d: 62, y: 13 },
  { x: 0, z: -155, w: 82, d: 42, y: 26 },
  { x: 43, z: -210, w: 82, d: 68, y: 38 },
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
    x: 12,
    w: 12,
    startZ: -8,
    endZ: -48,
    low: 0,
    high: 13,
    gate: 15,
    gateZ: -19,
  },
  {
    x: -23,
    w: 12,
    startZ: -117,
    endZ: -153,
    low: 16,
    high: 26,
    gate: 25,
    gateZ: -133,
  },
  {
    x: 27,
    w: 12,
    startZ: -67,
    endZ: -153,
    low: 13,
    high: 26,
    gate: 25,
    gateZ: -108,
  },
  {
    x: 24,
    w: 14,
    startZ: -159,
    endZ: -205,
    low: 26,
    high: 38,
    gate: 35,
    gateZ: -178,
  },
];
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
  "Woodland Scoop",
  "Copper Rake",
  "Petal Magnet",
  "Bubble Catcher",
  "Crimson Scythe",
  "Honey Dipper",
  "Amber Staff",
  "Storm Rake",
  "Moon Scepter",
  "Mountain Wand",
  "Coconut Crusher",
  "Pepper Prism",
];
const costs = [
  0, 120, 450, 1300, 4500, 12000, 35000, 80000, 180000, 400000, 950000, 2200000,
];
export const TOOLS: Gear[] = names.map((name, i) => ({
  id: `tool-${i}`,
  name,
  description: [
    "A trusty scoop for small beginnings.",
    "Sweeps a broad line of blossoms.",
    "Draws pollen from a wider circle.",
    "Blue flowers yield extra pollen.",
    "A focused sweep with a red bonus.",
    "A golden scoop for growing swarms.",
    "A long-reaching staff of amber.",
    "Gather across a whole swath.",
    "White flowers shine in moonlight.",
    "A collector worthy of the crown.",
    "Crack open an ocean of pollen.",
    "Harness the heat of the summit.",
  ][i],
  cost: costs[i],
  gate: i < 4 ? 0 : i < 6 ? 5 : i < 8 ? 10 : i < 9 ? 15 : i < 10 ? 25 : 35,
  icon: ["♧", "⋔", "⊙", "◌", "☽", "♜", "✧", "ϟ", "☾", "✦", "◈", "❖"][i],
  type: "tool",
  range: 2.8 + i * 0.48,
  power: 3 + i * 2.3,
  interval: Math.max(0.18, 0.65 - i * 0.035),
  shape: i % 3 === 1 ? "line" : i % 3 === 2 ? "cone" : "circle",
  color: i % 3 === 0 ? "white" : i % 3 === 1 ? "red" : "blue",
}));
export const BAGS: Gear[] = [
  "Canvas Pouch",
  "Trail Satchel",
  "Copper Canister",
  "Beekeeper Pack",
  "Honey Tank",
  "Alpine Vessel",
  "Coconut Vault",
  "Summit Silo",
].map((name, i) => ({
  id: `bag-${i}`,
  name,
  description: `Carry ${[250, 700, 1800, 5000, 14000, 40000, 120000, 400000][i].toLocaleString()} pollen. Improves conversion speed.`,
  cost: [0, 90, 400, 1500, 7000, 30000, 140000, 650000][i],
  gate: [0, 0, 0, 5, 10, 15, 25, 35][i],
  type: "bag",
  icon: "▣",
  capacity: [250, 700, 1800, 5000, 14000, 40000, 120000, 400000][i],
  convert: 1 + i * 0.6,
}));
export const EXTRAS: Gear[] = [
  {
    id: "boots-1",
    name: "Meadow Boots",
    description: "Move 20% faster on every trail.",
    cost: 350,
    gate: 0,
    type: "boots",
    icon: "♟",
    speed: 1.2,
  },
  {
    id: "boots-2",
    name: "Alpine Boots",
    description: "Move 45% faster. Made for long climbs.",
    cost: 15000,
    gate: 10,
    type: "boots",
    icon: "♟",
    speed: 1.45,
  },
  {
    id: "hat-1",
    name: "Honeycomb Veil",
    description: "Gather 15% more pollen.",
    cost: 600,
    gate: 0,
    type: "hat",
    icon: "♙",
    power: 1.15,
  },
  {
    id: "hat-2",
    name: "Summit Crown",
    description: "Gather 40% more pollen.",
    cost: 45000,
    gate: 15,
    type: "hat",
    icon: "♛",
    power: 1.4,
  },
];
export const GEAR = [...TOOLS, ...BAGS, ...EXTRAS];
export type BeeDef = {
  id: string;
  name: string;
  rarity: string;
  color: Color;
  body: string;
  gather: number;
  interval: number;
  speed: number;
  attack: number;
  conversion: number;
  energy: number;
  ability: string;
};
const beeNames = [
  "Bumble",
  "Daisy",
  "Honeydew",
  "Ember",
  "Brook",
  "Clover",
  "Drowsy",
  "Bramble",
  "Frost",
  "Swift",
  "Velvet",
  "Cobalt",
  "Ruby",
  "Moss",
  "Copper",
  "Blossom",
  "Thunder",
  "Crystal",
  "Marigold",
  "Glacier",
  "Orchid",
  "Prism",
  "Phoenix",
  "Moonbeam",
  "Tempest",
  "Nectar",
  "Aurora",
  "Saffron",
  "Comet",
  "Equinox",
  "Solstice",
  "Stardust",
];
const rarities = ["Common", "Rare", "Epic", "Legendary", "Mythic", "Special"];
export const BEES: BeeDef[] = beeNames.map((name, i) => {
  const tier =
    i < 3 ? 0 : i < 10 ? 1 : i < 18 ? 2 : i < 24 ? 3 : i < 29 ? 4 : 5;
  return {
    id: `bee-${i}`,
    name: `${name} Bee`,
    rarity: rarities[tier],
    color: (["white", "red", "blue"] as Color[])[i % 3],
    body: ["#f4c94d", "#ef8e73", "#75b6cf", "#9dc995", "#c6a2d7", "#f3d6a0"][
      i % 6
    ],
    gather: 3 + tier * 3 + (i % 4),
    interval: 2.4 + (i % 5) * 0.35,
    speed: 6 + (i % 5),
    attack: 2 + tier * 3 + (i % 3),
    conversion: 2 + tier * 2,
    energy: 40 + tier * 12,
    ability: [
      "haste",
      "focus",
      "red",
      "blue",
      "bomb",
      "honey",
      "critical",
      "rage",
      "convert",
      "pollen",
    ][i % 10],
  };
});
export type Place = Vec & {
  id: string;
  name: string;
  kind: "shop" | "eggs" | "npc" | "boost" | "treat" | "daily" | "challenge";
  gate: number;
  role?: string;
  accent: string;
};
export const PLACES: Place[] = [
  {
    id: "shop",
    name: "The Little Supply Co.",
    kind: "shop",
    x: -17,
    y: 0,
    z: 61,
    gate: 0,
    accent: "#ecb75e",
  },
  {
    id: "eggs",
    name: "The Hatchery",
    kind: "eggs",
    x: 18,
    y: 0,
    z: 61,
    gate: 0,
    accent: "#92c7c1",
  },
  {
    id: "juniper",
    name: "Juniper",
    kind: "npc",
    role: "Meadow keeper",
    x: -12,
    y: 0,
    z: 21,
    gate: 0,
    accent: "#ba8d64",
  },
  {
    id: "maple",
    name: "Maple",
    kind: "npc",
    role: "Forager",
    x: 55,
    y: 0,
    z: 49,
    gate: 0,
    accent: "#ba7259",
  },
  {
    id: "pippin",
    name: "Pippin",
    kind: "npc",
    role: "Bee guardian",
    x: -57,
    y: 0,
    z: 28,
    gate: 0,
    accent: "#b6a37c",
  },
  {
    id: "rowan",
    name: "Rowan",
    kind: "npc",
    role: "Trail ranger",
    x: -32,
    y: 8,
    z: -25,
    gate: 5,
    accent: "#779f79",
  },
  {
    id: "sage",
    name: "Professor Sage",
    kind: "npc",
    role: "Field researcher",
    x: -40,
    y: 16,
    z: -91,
    gate: 10,
    accent: "#92b9b1",
  },
  {
    id: "hazel",
    name: "Hazel",
    kind: "npc",
    role: "Ridge explorer",
    x: 63,
    y: 13,
    z: -24,
    gate: 15,
    accent: "#c797a6",
  },
  {
    id: "orion",
    name: "Orion",
    kind: "npc",
    role: "Summit keeper",
    x: 0,
    y: 26,
    z: -138,
    gate: 25,
    accent: "#a3a4d1",
  },
  {
    id: "shop-10",
    name: "Alpine Outfitters",
    kind: "shop",
    x: -64,
    y: 16,
    z: -91,
    gate: 10,
    accent: "#91babe",
  },
  {
    id: "shop-25",
    name: "Crown & Comb",
    kind: "shop",
    x: -29,
    y: 26,
    z: -164,
    gate: 25,
    accent: "#bc9dcc",
  },
  {
    id: "shop-35",
    name: "Summit Workshop",
    kind: "shop",
    x: 77,
    y: 38,
    z: -196,
    gate: 35,
    accent: "#eaa48a",
  },
  {
    id: "boost",
    name: "Meadow Booster",
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
    x: -61,
    y: 0,
    z: 57,
    gate: 0,
    accent: "#dfb88f",
  },
  {
    id: "daily",
    name: "Daily Honey Pot",
    kind: "daily",
    x: 40,
    y: 0,
    z: 65,
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
          label: `Gather in ${i % 2 ? "Wild Rose" : "Pinewood"}`,
        },
      ];
    if (n === 6)
      objectives = [
        {
          event: "field",
          target: "mountain",
          amount: 2000 * (i + 1),
          label: "Gather at Mountain Crown",
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
  Special: "#80cdb7",
};
export const ENEMY_TYPES = [
  {
    id: "ladybug",
    name: "Spotted Crawler",
    color: "#d97560",
    hp: 25,
    damage: 5,
    speed: 2.4,
    reward: 35,
  },
  {
    id: "beetle",
    name: "Moss Beetle",
    color: "#6f9671",
    hp: 45,
    damage: 8,
    speed: 2,
    reward: 65,
  },
  {
    id: "spider",
    name: "Silk Spinner",
    color: "#8e7c9c",
    hp: 90,
    damage: 12,
    speed: 3.5,
    reward: 140,
  },
  {
    id: "mantis",
    name: "Leaf Mantis",
    color: "#a1ba70",
    hp: 160,
    damage: 16,
    speed: 3,
    reward: 230,
  },
  {
    id: "scorpion",
    name: "Amber Scorpion",
    color: "#c6a06a",
    hp: 240,
    damage: 18,
    speed: 3,
    reward: 380,
  },
  {
    id: "wolf",
    name: "Pine Guardian",
    color: "#939fa4",
    hp: 360,
    damage: 22,
    speed: 4,
    reward: 600,
  },
  {
    id: "boss",
    name: "The Crown Colossus",
    color: "#b68a62",
    hp: 1800,
    damage: 30,
    speed: 2.7,
    reward: 3500,
  },
];
export const ENEMY_SPAWNS = [
  { type: 0, x: 43, z: 14, y: 0, gate: 0 },
  { type: 1, x: -53, z: 13, y: 0, gate: 0 },
  { type: 2, x: -44, z: -48, y: 8, gate: 5 },
  { type: 3, x: -30, z: -78, y: 8, gate: 5 },
  { type: 1, x: -40, z: -123, y: 16, gate: 10 },
  { type: 4, x: 40, z: -43, y: 13, gate: 15 },
  { type: 5, x: 39, z: -73, y: 13, gate: 15 },
  { type: 6, x: 15, z: -163, y: 26, gate: 25 },
  { type: 6, x: 38, z: -221, y: 38, gate: 35 },
];
