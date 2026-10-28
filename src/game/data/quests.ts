import type { Objective, Quest } from "./content";
const field = (target: string, amount: number): Objective => ({
  event: "field",
  target,
  amount,
  label: `Collect pollen from ${({ sunflower: "Sunflower Field", dandelion: "Dandelion Field", mushroom: "Mushroom Field", blue: "Blue Flower Field", clover: "Clover Field", bamboo: "Bamboo Field", spider: "Spider Field", pineapple: "Pineapple Patch", strawberry: "Strawberry Field" } as Record<string, string>)[target]}`,
});
const color = (target: string, amount: number): Objective => ({
  event: "color",
  target,
  amount,
  label: `Collect ${target} pollen`,
});
const pollen = (amount: number): Objective => ({
  event: "pollen",
  amount,
  label: "Collect pollen",
});
type Row = [string, number, Objective[], Record<string, number>?];
const rows: Row[] = [
  ["Sunflower Start", 200, [field("sunflower", 100)]],
  ["Dandelion Deed", 400, [field("dandelion", 250)]],
  ["Pollen Fetcher", 500, [pollen(500)]],
  ["Red Request", 650, [color("red", 600)]],
  ["Into The Blue", 750, [color("blue", 1000)]],
  [
    "Variety Fetcher",
    1000,
    [field("mushroom", 1000), field("blue", 1000), field("clover", 1000)],
    { silverEgg: 1 },
  ],
  ["Bamboo Boogie", 2100, [field("bamboo", 4000)]],
  ["Red Request 2", 2500, [color("red", 5000)]],
  ["Cobweb Sweeper", 3200, [field("spider", 6000)]],
  [
    "Leisure Loot",
    10000,
    [
      field("dandelion", 3000),
      field("sunflower", 3000),
      field("mushroom", 3000),
      field("blue", 3000),
    ],
  ],
  ["White Pollen Wrangler", 7500, [color("white", 10000)]],
  ["Pineapple Picking", 10500, [field("pineapple", 13000)]],
  ["Pollen Fetcher 2", 12000, [pollen(16000)]],
  [
    "Weed Wacker",
    25000,
    [
      field("strawberry", 10000),
      field("bamboo", 10000),
      field("clover", 10000),
    ],
  ],
  [
    "Red + Blue = Gold",
    25000,
    [color("blue", 25000), color("red", 25000)],
    { goldEgg: 1 },
  ],
];
// Original short descriptions, with reference quest names, targets and reward values.
export const BLACK_BEAR_QUESTS: Quest[] = rows.map(
  ([name, honey, objectives, rewards], i) => ({
    id: `juniper-${i}`,
    npc: "juniper",
    name,
    honey,
    objectives,
    rewards,
    dialogue:
      i === 0
        ? "Welcome, beekeeper! Start with the Sunflower Field. Gather 100 pollen there, then return for your reward. Your first Silver Egg is six quests away."
        : i === 5
          ? "Visit three different flower fields to finish your first training chain. Your Silver Egg will hatch a Rare bee or better."
          : i === 14
            ? "Finish the red and blue collection goals to earn a Gold Egg. It guarantees an Epic bee or better."
            : "Try these flowers for the next honey blend. Follow each field and color requirement; only pollen collected after accepting counts.",
    gate: 0,
    previous: i ? `juniper-${i - 1}` : undefined,
    egg: 0,
    treat: 0,
    tickets: 0,
  }),
);
