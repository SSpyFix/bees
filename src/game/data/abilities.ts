import { BEES, type BeeDefinition } from "./bees";
export type AbilityDefinition = {
  icon?: string;
  duration?: number;
  cap?: number;
  increment?: number;
  base?: number;
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
export function beeAbilities(bee: BeeDefinition, gifted = false): string[] {
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

const LEGACY_ABILITIES: Record<string, Omit<AbilityDefinition, "description">> = {
  red: {
    name: "Red Boost",
    color: "#e72c31",
    icon: "R",
    duration: 15,
    cap: 10,
    increment: 0.2,
    base: 1,
  },
  blue: {
    name: "Blue Boost",
    color: "#246ded",
    icon: "B",
    duration: 15,
    cap: 10,
    increment: 0.2,
    base: 1,
  },
  white: {
    name: "White Boost",
    color: "#e6e8ed",
    icon: "W",
    duration: 15,
    cap: 10,
    increment: 0.2,
    base: 1,
  },
  haste: {
    name: "Haste",
    color: "#f2e78e",
    icon: "»",
    duration: 20,
    cap: 10,
    increment: 0.1,
    base: 1,
  },
  focus: {
    name: "Focus",
    color: "#8ae587",
    icon: "+",
    duration: 20,
    cap: 10,
    increment: 0.03,
    base: 0,
  },
  rage: {
    name: "Rage",
    color: "#e94128",
    icon: "!",
    duration: 45,
    cap: 4,
    increment: 1,
    base: 0,
  },
  melody: {
    name: "Melody",
    color: "#c5d8f3",
    icon: "♪",
    duration: 30,
    cap: 1,
    increment: 1,
    base: 0,
  },
  babyLove: {
    name: "Baby Love",
    color: "#ffb3d3",
    icon: "♥",
    duration: 30,
    cap: 1,
    increment: 1,
    base: 1,
  },
  bombCombo: {
    name: "Bomb Combo",
    color: "#e7dfc6",
    icon: "✹",
    duration: 5,
    cap: 10,
    increment: 0.25,
    base: 1,
  },
  inspire: {
    name: "Inspire",
    color: "#fff17e",
    icon: "★",
    duration: 5,
    cap: 50,
    increment: 1,
    base: 1,
  },
  pollen: { name: "Pollen Boost", color: "#f8e58e", icon: "✿" },
  convert: { name: "Conversion Boost", color: "#ffd733", icon: "↻" },
  critical: { name: "Precision", color: "#fb748b", icon: "◎" },
  honey: { name: "Honey Gift", color: "#ffce27", icon: "⬡" },
  bomb: { name: "Buzz Bomb", color: "#e3e5dc", icon: "✹" },
  bombPlus: { name: "Buzz Bomb+", color: "#e3e5dc", icon: "✹+" },
  redBomb: { name: "Red Bomb", color: "#ff5148", icon: "✹" },
  redBombPlus: { name: "Red Bomb+", color: "#ff5148", icon: "✹+" },
  blueBomb: { name: "Blue Bomb", color: "#50a5ff", icon: "✹" },
  blueBombPlus: { name: "Blue Bomb+", color: "#50a5ff", icon: "✹+" },
  link: { name: "Token Link", color: "#fff9cf", icon: "∞" },
  bubble: { name: "Bubble", color: "#91e6ff", icon: "○" },
  flame: { name: "Flame", color: "#ff8b23", icon: "♨" },
  pollenMark: { name: "Pollen Mark", color: "#8fe4ac", icon: "✿" },
  honeyMark: { name: "Honey Mark", color: "#ffdc57", icon: "⬡" },
  beam: { name: "Beamstorm", color: "#fffac1", icon: "ϟ" },
  goo: { name: "Gumdrop Barrage", color: "#eda4ff", icon: "●" },
  impale: { name: "Impale", color: "#77b8eb", icon: "▲" },
  tornado: { name: "Tornado", color: "#d1f5fb", icon: "≋" },
  bearMorph: {
    name: "Bear Morph",
    color: "#d49b67",
    icon: "ʕ",
    duration: 30,
    cap: 1,
    increment: 1,
    base: 1,
  },
  ticket: { name: "Ticket", color: "#f9db43", icon: "T" },
  treat: { name: "Treat", color: "#b78252", icon: "•" },
  "extract:red": { name: "Red Extract", color: "#e72c31", icon: "R" },
  "extract:blue": { name: "Blue Extract", color: "#246ded", icon: "B" },
  oil: { name: "Oil", color: "#f6d26b", icon: "»" },
  enzymes: { name: "Enzymes", color: "#f4c95d", icon: "↻" },
  glue: { name: "Glue", color: "#eac8fd", icon: "●" },
  stinger: { name: "Stinger", color: "#819bc6", icon: "▲" },
};

export type AbilityInfo = AbilityDefinition & { icon: string };
Object.assign(ABILITIES.focus, { base: 1 });
Object.assign(ABILITIES.rage, { base: 1, cap: 3 });
Object.assign(ABILITIES.melody, { base: 1 });
Object.assign(ABILITIES["baby-love"], { duration: 30, cap: 1, increment: 1, base: 1 });
Object.assign(ABILITIES["bear-morph"], { duration: 30, cap: 1, increment: 1, base: 1 });
export const ABILITY_ALIASES: Record<string, string> = { red: "red-boost", blue: "blue-boost", white: "white-boost", bomb: "buzz-bomb", bombPlus: "buzz-bomb-plus", blueBomb: "blue-bomb", blueBombPlus: "blue-bomb-plus", redBomb: "red-bomb", redBombPlus: "red-bomb-plus", link: "token-link", babyLove: "baby-love", bearMorph: "bear-morph", pollenMark: "pollen-mark", honeyMark: "honey-mark", beam: "beamstorm", goo: "gumdrop-barrage" };
for (const [id, info] of Object.entries(LEGACY_ABILITIES)) ABILITIES[id] = Object.assign({ description: "" }, info, ABILITIES[id]);
export const abilityInfo = (kind: string): AbilityInfo => Object.assign({ icon: LEGACY_ABILITIES[kind]?.icon ?? "✿", name: kind.startsWith("field:") ? `${kind.slice(6)} Field Boost` : kind, description: "", color: "#ffe976" }, ABILITIES[ABILITY_ALIASES[kind] ?? kind]);
// Compatibility for species summaries; spawning uses beeAbilities and gifted gating.
export const SPECIES_ABILITIES: Record<string, string[]> = Object.fromEntries(BEES.map(bee => [bee.face, beeAbilities(bee, false)]));
