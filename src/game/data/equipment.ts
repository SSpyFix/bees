import type { Color } from "./content";

export type Gear = {
  id: string;
  name: string;
  description: string;
  cost: number;
  gate: number;
  icon: string;
  type: "tool" | "bag" | "boots" | "hat" | "glider";
  glideSpeed?: number;
  glideFallSpeed?: number;
  range?: number;
  power?: number;
  interval?: number;
  shape?: "circle" | "line" | "cone" | "square" | "single";
  tiles?: number;
  color?: Color;
  colorMultiplier?: number;
  whiteMultiplier?: number;
  capacity?: number;
  speed?: number;
  convert?: number;
  instant?: number;
  shop?: string;
  ingredients?: Record<string, number>;
};

// Stable IDs deliberately follow the previous save order. Sticker-Seeker is appended.
type ToolRow = [
  string,
  number,
  number,
  number,
  number,
  NonNullable<Gear["shape"]>,
  number,
  string,
  Color?,
  number?,
];
const collectors: ToolRow[] = [
  ["Scooper", 0, 0, 2, 0.8, "line", 2, "shop"],
  ["Rake", 800, 0, 2, 0.7, "line", 3, "shop"],
  ["Clippers", 2200, 0, 9, 0.6, "single", 1, "shop"],
  ["Magnet", 5500, 0, 2, 0.8, "square", 9, "shop"],
  ["Vacuum", 14000, 0, 2, 0.8, "circle", 13, "shop"],
  ["Super-Scooper", 40000, 10, 4, 0.5, "line", 5, "shop-10"],
  ["Pulsar", 125000, 10, 2, 1, "circle", 29, "shop-10"],
  ["Electro-Magnet", 300000, 10, 4, 0.5, "square", 9, "shop-10"],
  ["Scissors", 850000, 10, 60, 0.5, "single", 1, "shop-10"],
  ["Honey Dipper", 1500000, 10, 2, 0.9, "circle", 49, "shop-10"],
  ["Bubble Wand", 3500000, 0, 6, 0.8, "circle", 16, "blue-hq", "blue", 2],
  ["Scythe", 3500000, 0, 7, 0.5, "cone", 17, "red-hq", "red", 2],
  ["Golden Rake", 20000000, 25, 5, 0.6, "line", 5, "shop-25"],
  ["Spark Staff", 60000000, 25, 60, 0.5, "circle", 3, "shop-25"],
  [
    "Porcelain Dipper",
    150000000,
    25,
    3,
    0.7,
    "circle",
    49,
    "shop-25",
    "white",
    1.5,
  ],
  ["Petal Wand", 1500000000, 35, 5, 0.7, "cone", 37, "petal"],
  [
    "Tide Popper",
    2500000000000,
    35,
    10,
    0.5,
    "circle",
    49,
    "blue-hq",
    "blue",
    3,
  ],
  ["Dark Scythe", 2500000000000, 35, 10, 0.5, "cone", 49, "red-hq", "red", 3],
  ["Gummyballer", 10000000000000, 35, 10, 1, "circle", 81, "gummy"],
  ["Sticker-Seeker", 7000000, 0, 10, 0.5, "circle", 13, "shop"],
];
export const TOOLS: Gear[] = collectors.map(
  (
    [
      name,
      cost,
      gate,
      power,
      interval,
      shape,
      tiles,
      shop,
      color,
      colorMultiplier,
    ],
    i,
  ) => ({
    id: `tool-${i}`,
    name,
    cost,
    gate,
    power,
    interval,
    shape,
    tiles,
    shop,
    color,
    colorMultiplier,
    range: Math.max(2.8, Math.sqrt(tiles) * 1.35),
    type: "tool",
    icon: "",
    description: `Collects ${power} pollen from ${tiles} flower tile${tiles === 1 ? "" : "s"} every ${interval} seconds.${color ? ` ×${colorMultiplier} from ${color} flowers.` : ""}`,
  }),
);
type BagRow = [number, string, number, number, number, number, string, number?];
const containers: BagRow[] = [
  [0, "Pouch", 0, 200, 0, 1, "shop"],
  [1, "Jar", 650, 750, 0, 1, "shop"],
  [2, "Backpack", 5500, 3500, 0, 1, "shop"],
  [3, "Canister", 22000, 10000, 0, 1.3, "shop"],
  [8, "Mega-Jug", 50000, 25000, 10, 1.4, "shop-10"],
  [9, "Compressor", 160000, 50000, 10, 1.55, "shop-10"],
  [10, "Elite Barrel", 650000, 125000, 10, 1.7, "shop-10"],
  [4, "Port-O-Hive", 1250000, 250000, 10, 2, "shop-10", 0.05],
  [11, "Blue Port-O-Hive", 12500000, 400000, 0, 2.5, "blue-hq", 0.1],
  [12, "Red Port-O-Hive", 12500000, 400000, 0, 2.5, "red-hq", 0.1],
  [5, "Porcelain Port-O-Hive", 250000000, 600000, 25, 3.5, "shop-25", 0.1],
  [6, "Coconut Canister", 25000000000, 1000000, 35, 3, "shop-35", 0.1],
];
export const BAGS: Gear[] = containers.map(
  ([id, name, cost, capacity, gate, convert, shop, instant]) => ({
    id: `bag-${id}`,
    name,
    cost,
    capacity,
    gate,
    convert,
    shop,
    instant,
    type: "bag",
    icon: "",
    color: id === 11 ? "blue" : id === 12 ? "red" : undefined,
    description: `Holds ${capacity.toLocaleString()} pollen.${convert > 1 ? ` +${Math.round((convert - 1) * 100)}% convert rate.` : ""}${instant ? ` ${Math.round(instant * 100)}% instant conversion.` : ""}`,
  }),
);
// An older version misclassified Coconut Belt as bag-7. Keep the owned save usable.
export const LEGACY_BAG: Gear = {
  ...BAGS.find((b) => b.id === "bag-6")!,
  id: "bag-7",
  name: "Coconut Canister",
  shop: "legacy",
};
export const EXTRAS: Gear[] = [
  {
    id: "boots-1",
    name: "Basic Boots",
    description: "Collect a little pollen as you walk through flowers.",
    cost: 4400,
    gate: 0,
    type: "boots",
    icon: "",
    speed: 1.125,
    shop: "shop",
  },
  {
    id: "boots-2",
    name: "Beekeeper’s Boots",
    description: "Faster movement on the mountain trails.",
    cost: 15000000,
    gate: 25,
    type: "boots",
    icon: "",
    speed: 1.375,
    shop: "shop-25",
  },
  {
    id: "hat-1",
    name: "Propeller Hat",
    description: "+15% pollen.",
    cost: 2500000,
    gate: 10,
    type: "hat",
    icon: "",
    power: 1.15,
    shop: "shop-10",
  },
  {
    id: "hat-2",
    name: "Beekeeper’s Mask",
    description: "+20% pollen.",
    cost: 20000000,
    gate: 25,
    type: "hat",
    icon: "",
    power: 1.2,
    shop: "shop-25",
  },
];
// Roblox speeds converted using the imported map's 0.35 world scale.
export const GLIDERS: Gear[] = [
 {id:'glider-0',name:'Parachute',type:'glider',icon:'',cost:500000,gate:10,shop:'shop-10',glideSpeed:10.5,glideFallSpeed:4.9,description:'Glide down the mountain and reach new places. Press Space again while airborne to open; press again to fold.'},
 {id:'glider-1',name:'Glider',type:'glider',icon:'',cost:5000000,gate:25,shop:'shop-25',glideSpeed:24.5,glideFallSpeed:8.4,description:'The upgraded Mountain Top glider: much faster flight and longer range than the Parachute. Press Space while airborne to open or fold.'},
];
export const GEAR = [...TOOLS, ...BAGS, LEGACY_BAG, ...EXTRAS, ...GLIDERS];
const recipes: Record<string, Record<string, number>> = {
  "boots-1": { sunflowerSeed: 3, blueberry: 3 },
  "hat-1": { gumdrops: 25, pineapple: 100, moonCharm: 5 },
  "bag-11": { blueExtract: 2, softWax: 2 },
  "bag-12": { redExtract: 2, softWax: 2 },
  "bag-5": { glitter: 3, softWax: 3, moonCharm: 10 },
  "bag-6": {
    tropicalDrink: 150,
    coconut: 250,
    redExtract: 150,
    blueExtract: 150,
    refreshingVial: 2,
  },
  "tool-15": { spiritPetal: 1, starJelly: 10, glitter: 25, enzymes: 75 },
  "tool-16": {
    blueExtract: 1500,
    stinger: 150,
    tropicalDrink: 150,
    swirledWax: 75,
    superSmoothie: 50,
    comfortingVial: 3,
  },
  "tool-17": {
    redExtract: 1500,
    stinger: 150,
    hardWax: 100,
    causticWax: 50,
    superSmoothie: 50,
    invigoratingVial: 3,
  },
  "tool-18": {
    glue: 1500,
    gumdrops: 2000,
    causticWax: 50,
    superSmoothie: 50,
    turpentine: 5,
    satisfyingVial: 3,
  },
};
for (const gear of GEAR)
  if (recipes[gear.id]) gear.ingredients = recipes[gear.id];
