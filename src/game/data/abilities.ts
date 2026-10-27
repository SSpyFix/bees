import type { BeeDefinition } from "./bees";
export type AbilityDefinition = {
  name: string;
  description: string;
  color: string;
  battle?: boolean;
  idle?: boolean;
  gifted?: boolean;
};
const gold = "#ffdc55",
  blue = "#6acbff",
  red = "#ff725e",
  white = "#f8f4c8";
export const ABILITIES: Record<string, AbilityDefinition> = {
  "buzz-bomb": {
    name: "Buzz Bomb",
    description: "Collects pollen from all nearby flower colors.",
    color: white,
  },
  "buzz-bomb-plus": {
    name: "Buzz Bomb+",
    description: "Collects pollen in a larger area.",
    color: white,
  },
  "blue-bomb": {
    name: "Blue Bomb",
    description: "Collects pollen from nearby blue flowers.",
    color: blue,
  },
  "blue-bomb-plus": {
    name: "Blue Bomb+",
    description: "A larger blast collecting blue pollen.",
    color: blue,
  },
  "red-bomb": {
    name: "Red Bomb",
    description: "Collects pollen from nearby red flowers.",
    color: red,
  },
  "red-bomb-plus": {
    name: "Red Bomb+",
    description: "A larger blast collecting red pollen.",
    color: red,
  },
  "blue-boost": {
    name: "Blue Boost",
    description: "+20% blue pollen per stack, up to 10 stacks for 15s.",
    color: blue,
  },
  "red-boost": {
    name: "Red Boost",
    description: "+20% red pollen per stack, up to 10 stacks for 15s.",
    color: red,
  },
  "white-boost": {
    name: "White Boost",
    description: "+20% white pollen per stack, up to 10 stacks for 15s.",
    color: white,
  },
  haste: {
    name: "Haste",
    description: "+10% player and bee speed per stack, up to 10 for 20s.",
    color: gold,
    battle: true,
    idle: true,
  },
  focus: {
    name: "Focus",
    description: "+3% critical chance per stack, up to 10 for 20s.",
    color: white,
    battle: true,
  },
  rage: {
    name: "Rage",
    description: "+1 bee attack per stack, up to 3 for 45s.",
    color: red,
    battle: true,
  },
  "honey-gift": {
    name: "Honey Gift",
    description: "Awards honey scaled by bee level.",
    color: gold,
  },
  "honey-gift-plus": {
    name: "Honey Gift+",
    description: "Awards a larger gift of honey.",
    color: gold,
  },
  "token-link": {
    name: "Token Link",
    description:
      "Collects other tokens in the same field, excluding links, and awards honey per token.",
    color: gold,
    battle: true,
  },
  "pollen-mark": {
    name: "Pollen Mark",
    description:
      "Stand inside the mark for 50% more pollen. Up to 3 marks stack.",
    color: white,
  },
  "pollen-mark-plus": {
    name: "Pollen Mark+",
    description: "A larger pollen mark.",
    color: white,
  },
  "honey-mark": {
    name: "Honey Mark",
    description: "Converts carried pollen while you stand inside the mark.",
    color: gold,
  },
  "honey-mark-plus": {
    name: "Honey Mark+",
    description: "A larger honey mark with stronger conversion links.",
    color: gold,
  },
  "baby-love": {
    name: "Baby Love",
    description: "Doubles pollen and increases loot luck for 30s.",
    color: "#ffbce1",
    battle: true,
  },
  melody: {
    name: "Melody",
    description: "+100% critical power for 30s.",
    color: "#c7a7ff",
    battle: true,
  },
  inspire: {
    name: "Inspire",
    description: "+100% pollen per stack for 5s, up to 50 stacks.",
    color: gold,
    gifted: true,
  },
  "inflate-balloons": {
    name: "Inflate Balloons",
    description:
      "Creates balloons that store extra field pollen and return it to the hive.",
    color: blue,
  },
  "surprise-party": {
    name: "Surprise Party",
    description: "Creates a golden balloon and a shower of ability tokens.",
    color: gold,
    gifted: true,
  },
  "fuzz-bombs": {
    name: "Fuzz Bombs",
    description: "Collects pollen and temporarily pollinates nearby flowers.",
    color: "#e8bb7e",
  },
  "pollen-haze": {
    name: "Pollen Haze",
    description: "Pollinates the current field for 30s.",
    color: "#e8bb7e",
    gifted: true,
  },
  "target-practice": {
    name: "Target Practice",
    description:
      "Run through all three targets to earn Precision and instant conversion.",
    color: red,
  },
  "precise-mark": {
    name: "Precise Mark",
    description:
      "A gifted target reward that increases critical and super-critical chance.",
    color: red,
    gifted: true,
  },
  inferno: {
    name: "Inferno",
    description:
      "Summons flames and temporary Fire Bees that gather and fight.",
    color: red,
    battle: true,
  },
  "flame-fuel": {
    name: "Flame Fuel",
    description: "Extends nearby flames and converts carried pollen.",
    color: red,
    battle: true,
    gifted: true,
  },
  "summon-frog": {
    name: "Summon Frog",
    description:
      "A jumping frog collects tokens, attacks enemies, and creates bubbles.",
    color: blue,
    battle: true,
  },
  triangulate: {
    name: "Triangulate",
    description:
      "Forms a triangle between the bee, player, and a third point; collects pollen inside.",
    color: white,
  },
  "mark-surge": {
    name: "Mark Surge",
    description: "Extends existing marks and gathers pollen inside them.",
    color: white,
    gifted: true,
  },
  "bear-morph": {
    name: "Bear Morph",
    description:
      "Become a bear with doubled pollen, more speed and jumping power.",
    color: "#bc8c5e",
    battle: true,
    idle: true,
  },
  "blue-pulse": {
    name: "Blue Pulse",
    description: "Collects blue pollen around your blue bees.",
    color: blue,
  },
  "red-pulse": {
    name: "Red Pulse",
    description: "Collects red pollen around your red bees.",
    color: red,
  },
  "blue-bomb-sync": {
    name: "Blue Bomb Sync",
    description:
      "Blue bombs also collect white pollen and gain instant conversion for 20s.",
    color: blue,
  },
  "red-bomb-sync": {
    name: "Red Bomb Sync",
    description:
      "Red bombs also collect white pollen and gain instant conversion for 20s.",
    color: red,
  },
  glitch: {
    name: "Glitch",
    description:
      "Corrupts a field, giving ability tokens a chance to duplicate.",
    color: "#9affb5",
  },
  "map-corruption": {
    name: "Map Corruption",
    description: "Corrupts multiple fields for 30s.",
    color: "#9affb5",
    gifted: true,
  },
  "mind-hack": {
    name: "Mind Hack",
    description: "Stuns nearby enemies and increases damage they take.",
    color: "#9affb5",
    battle: true,
  },
  "festive-gift": {
    name: "Festive Gift",
    description:
      "Drops honey and treats and grants temporary festive conversion.",
    color: red,
    battle: true,
    idle: true,
  },
  glob: {
    name: "Glob",
    description: "Covers flowers in goo, producing extra honey when harvested.",
    color: "#86ebc2",
  },
  "gumdrop-barrage": {
    name: "Gumdrop Barrage",
    description: "Scatters several patches of goo across a field.",
    color: "#d8a5ee",
  },
  beamstorm: {
    name: "Beamstorm",
    description:
      "A shower of beams gathers pollen; gifted beams instantly convert it.",
    color: gold,
  },
  "puppy-love": {
    name: "Puppy Love",
    description: "Restores energy and awards bond to nearby bees.",
    color: "#c09b6b",
    battle: true,
    idle: true,
  },
  fetch: {
    name: "Fetch",
    description: "Chase a ball for treats and growing fetch rewards.",
    color: "#c09b6b",
    idle: true,
  },
  scratch: {
    name: "Scratch",
    description: "Collects pollen in three lines; strengthens with Tabby Love.",
    color: "#e7ad50",
  },
  "tabby-love": {
    name: "Tabby Love",
    description:
      "Permanently strengthens Tabby Bee, stacking up to 1000 times.",
    color: "#e7ad50",
    battle: true,
    idle: true,
  },
  impale: {
    name: "Impale",
    description:
      "Spikes damage nearby enemies based on their health and bee level.",
    color: "#6d9bbf",
    battle: true,
  },
  "rain-cloud": {
    name: "Rain Cloud",
    description:
      "A drifting cloud waters flowers and increases pollen beneath it.",
    color: white,
  },
  tornado: {
    name: "Tornado",
    description:
      "Consumes Haste stacks to gather pollen, tokens, and damage enemies.",
    color: white,
    battle: true,
  },
};
// Stable roster order matches bees.ts; gifted-only entries are filtered below.
const roster: string[][] = [
  [],
  ["buzz-bomb"],
  [],
  ["blue-bomb"],
  ["blue-boost"],
  ["haste"],
  ["focus"],
  ["red-boost"],
  ["red-bomb"],
  ["pollen-mark"],
  ["blue-bomb"],
  ["blue-boost"],
  ["focus", "buzz-bomb"],
  ["buzz-bomb-plus"],
  ["buzz-bomb", "token-link"],
  ["red-bomb-plus"],
  ["blue-boost", "blue-bomb-plus"],
  ["honey-gift", "honey-mark"],
  ["rage", "token-link"],
  ["red-boost"],
  ["haste", "token-link"],
  ["baby-love"],
  ["honey-mark-plus", "pollen-mark"],
  ["red-bomb-plus", "red-bomb"],
  ["blue-boost", "honey-gift-plus"],
  ["buzz-bomb-plus"],
  ["focus", "melody", "token-link"],
  ["haste", "blue-bomb"],
  ["red-boost", "red-bomb"],
  ["blue-bomb", "inflate-balloons", "surprise-party"],
  ["fuzz-bombs", "pollen-haze"],
  ["target-practice", "precise-mark"],
  ["rage", "inferno", "flame-fuel"],
  ["blue-boost", "summon-frog", "baby-love"],
  ["pollen-mark-plus", "triangulate", "mark-surge"],
  ["bear-morph"],
  ["blue-pulse", "blue-bomb-sync"],
  ["red-pulse", "red-bomb-sync"],
  ["glitch", "mind-hack", "map-corruption"],
  ["festive-gift", "red-bomb", "honey-mark"],
  ["glob", "gumdrop-barrage"],
  ["beamstorm", "haste"],
  ["fetch", "puppy-love"],
  ["scratch", "tabby-love"],
  ["impale", "blue-bomb-plus"],
  ["white-boost", "rain-cloud", "tornado"],
];
export function beeAbilities(bee: BeeDefinition, gifted: boolean): string[] {
  const list = (roster[Number(bee.id.slice(4))] ?? []).filter(
    (id) => !ABILITIES[id].gifted || gifted,
  );
  // Baby Love is a gifted Tadpole ability, not a normal one.
  const usable =
    bee.face === "tadpole" && !gifted
      ? list.filter((id) => id !== "baby-love")
      : list;
  return gifted ? [...usable, "inspire"] : usable;
}
export const PASSIVES: Record<string, string> = {
  bubble: "Bubble Bombs: gathering occasionally releases a bubble.",
  fire: "Gather Flames: gathering occasionally creates a flame.",
  demon: "Gather Flames: gathering occasionally creates a flame.",
  buoyant: "Balloon Enthusiast: collects more pollen while near a balloon.",
  fuzzy: "Fuzzy Coat: occasionally pollinates flowers while gathering.",
  precise: "Gifted Precise Bee can replace Target Practice with Precise Mark.",
  spicy: "Inferno summons temporary Fire Bees.",
  tadpole: "Frogs pop bubbles and gather tokens.",
};
export const abilityNames = (bee: BeeDefinition, gifted = false) =>
  beeAbilities(bee, gifted)
    .map((id) => ABILITIES[id].name)
    .join(", ") || "None";
