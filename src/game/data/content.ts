import { BLACK_BEAR_QUESTS } from "./quests";
import importedMap from "./imported-map.json";
import { importedSurface } from "../world/imported-terrain";
export type Color = "white" | "red" | "blue";
export type Vec = { x: number; y: number; z: number };
export type Field = Vec & {
  id: string;
  name: string;
  gate: number;
  biome: string;
  colors: [number, number, number];
  width: number;
  depth?: number;
};
export const FIELDS: Field[] = importedMap.fields.map((f) => ({ ...f, colors: f.colors as [number, number, number] }));
// Legacy coordinates remain available to the archived procedural scenery component.
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
export { TOOLS, BAGS, EXTRAS, GEAR } from "./equipment";
export type { Gear } from "./equipment";
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
    | "tickets"
    | "guild";
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
    id: "treat-shop",
    name: "Treat Shop",
    kind: "eggs",
    x: -61,
    y: 0,
    z: 44,
    gate: 0,
    accent: "#ad784f",
  },
  {
    id: "jelly-shop",
    name: "Royal Jelly Shop",
    kind: "eggs",
    x: 64,
    y: 0,
    z: 5,
    gate: 0,
    accent: "#79a5e9",
  },
  {
    id: "guild",
    name: "Badge Bearer’s Guild",
    kind: "guild",
    x: 65,
    y: 20,
    z: -108,
    gate: 15,
    accent: "#efdf7a",
  },
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
  tickets?: number;
  rewards?: Record<string, number>;
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
const OTHER_QUESTS: Quest[] = giverIds
  .filter((npc) => npc !== "juniper")
  .flatMap((npc, n) =>
    Array.from({ length: 5 }, (_, i) => {
      n = giverIds.indexOf(npc);
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
export const QUESTS: Quest[] = [...BLACK_BEAR_QUESTS, ...OTHER_QUESTS];
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

// Stable progression IDs now use coordinates measured from the supplied map.
HIVE_PADS.splice(0, HIVE_PADS.length, ...importedMap.hives);
Object.assign(HIVE, HIVE_PADS[2]);
for (const place of PLACES) {
  const measured = importedMap.places[place.id as keyof typeof importedMap.places];
  if (measured) {
    Object.assign(place, measured);
    place.y = importedSurface(place.x, place.z, place.y) ?? place.y;
  }
}
const enemyFields = ["mushroom", "blue", "spider", "bamboo", "pineapple", "rose", "pine", "mountain", "coconut"];
ENEMY_SPAWNS.forEach((enemy, i) => {
  const field = FIELDS.find((f) => f.id === enemyFields[i])!;
  Object.assign(enemy, { x: field.x + 5, y: field.y, z: field.z + 5, gate: field.gate });
});
