export type BeeDefinition = {
  id: string;
  name: string;
  rarity: string;
  color: "white" | "red" | "blue";
  body: string;
  face: string;
  gather: number;
  interval: number;
  speed: number;
  attack: number;
  conversion: number;
  energy: number;
  ability: string;
};
// Stable numeric IDs preserve owned bees in existing browser saves. Face identities are
// species names, shared by the canvas portraits and the physical cube-face textures.
type Row = [
  string,
  string,
  "white" | "red" | "blue",
  string,
  number,
  number,
  number,
  number,
  number,
  number,
  string,
];
const rows: Row[] = [
  ["Basic", "Common", "white", "#f6dd78", 10, 4, 14, 1, 20, 20, "pollen"],
  ["Bomber", "Rare", "white", "#f6f4dc", 10, 4, 15.4, 2, 30, 20, "bomb"],
  ["Brave", "Rare", "white", "#dfd8cb", 10, 4, 16.8, 5, 50, 30, "rage"],
  ["Bumble", "Rare", "blue", "#6595d2", 10, 4, 10.5, 1, 20, 40, "blue"],
  ["Cool", "Rare", "blue", "#6dc5f2", 10, 4, 14, 1, 20, 20, "blue"],
  ["Hasty", "Rare", "white", "#f1e9c9", 10, 3, 19.6, 1, 27, 20, "haste"],
  ["Looker", "Rare", "white", "#dddac8", 10, 4, 14, 1, 40, 20, "focus"],
  ["Rad", "Rare", "red", "#e9453a", 10, 4, 14, 1, 20, 20, "red"],
  ["Rascal", "Rare", "red", "#f06b49", 10, 4, 16.1, 3, 20, 20, "bomb"],
  ["Stubborn", "Rare", "white", "#f6efda", 10, 4, 11.9, 2, 20, 20, "pollen"],
  ["Bubble", "Epic", "blue", "#54b9ee", 10, 4, 16.8, 3, 20, 20, "blue"],
  ["Bucko", "Epic", "blue", "#3956ba", 10, 4, 15.4, 5, 20, 20, "blue"],
  ["Commander", "Epic", "white", "#a1a6a8", 10, 4, 14, 4, 20, 30, "focus"],
  ["Demo", "Epic", "white", "#d8e1e0", 10, 4, 14, 3, 50, 20, "bomb"],
  ["Exhausted", "Epic", "white", "#b4bdc9", 10, 6, 10.5, 1, 40, 999999, "bomb"],
  ["Fire", "Epic", "red", "#f23826", 10, 4, 11.2, 4, 20, 20, "red"],
  ["Frosty", "Epic", "blue", "#b5e7fa", 10, 4, 14, 1, 20, 25, "blue"],
  ["Honey", "Epic", "white", "#ffc928", 10, 4, 14, 1, 80, 20, "honey"],
  ["Rage", "Epic", "red", "#d52722", 10, 4, 15.4, 4, 20, 20, "rage"],
  ["Riley", "Epic", "red", "#b51e25", 10, 4, 15.4, 5, 20, 20, "red"],
  ["Shocked", "Epic", "white", "#e7e2bc", 10, 3, 19.6, 2, 27, 20, "haste"],
  ["Baby", "Legendary", "white", "#b4d8f7", 10, 5, 10.5, 0, 16, 15, "pollen"],
  [
    "Carpenter",
    "Legendary",
    "white",
    "#c0a080",
    10,
    3,
    14,
    2,
    27,
    25,
    "convert",
  ],
  ["Demon", "Legendary", "red", "#a90f17", 10, 4, 11.9, 8, 20, 20, "red"],
  ["Diamond", "Legendary", "blue", "#6dceef", 10, 4, 14, 1, 250, 20, "convert"],
  ["Lion", "Legendary", "white", "#f6c530", 20, 4, 19.6, 8, 40, 60, "bomb"],
  ["Music", "Legendary", "white", "#b7c4d0", 10, 4, 16.8, 1, 60, 20, "focus"],
  ["Ninja", "Legendary", "blue", "#26365a", 10, 2, 21, 4, 40, 20, "haste"],
  ["Shy", "Legendary", "red", "#ed665e", 10, 4, 18.2, 2, 20, 40, "red"],
  ["Buoyant", "Mythic", "blue", "#638adb", 10, 4, 14, 4, 20, 60, "honey"],
  ["Fuzzy", "Mythic", "white", "#eac17a", 10, 4, 11.9, 3, 20, 50, "pollen"],
  ["Precise", "Mythic", "red", "#b12930", 10, 3, 16.8, 8, 27, 40, "critical"],
  ["Spicy", "Mythic", "red", "#e84418", 10, 4, 14, 5, 20, 20, "rage"],
  ["Tadpole", "Mythic", "blue", "#67c3df", 10, 4, 11.2, 0, 20, 10, "blue"],
  ["Vector", "Mythic", "white", "#e7e0b5", 10, 4, 16.8, 5, 20, 50, "focus"],
  ["Bear", "Event", "white", "#b4875c", 50, 3, 14, 5, 67, 35, "pollen"],
  ["Cobalt", "Event", "blue", "#246de0", 10, 4, 18.2, 3, 20, 20, "blue"],
  ["Crimson", "Event", "red", "#da233a", 10, 4, 18.2, 3, 20, 20, "red"],
  ["Digital", "Event", "white", "#a2b5ab", 20, 4, 16.8, 1, 30, 40, "critical"],
  ["Festive", "Event", "red", "#e44c40", 40, 4, 16.1, 1, 30, 20, "honey"],
  ["Gummy", "Event", "white", "#91e8cb", 10, 4, 14, 3, 20, 20, "pollen"],
  ["Photon", "Event", "white", "#fff9a0", 20, 2, 21, 2, 40, 999999, "convert"],
  ["Puppy", "Event", "white", "#ac825e", 10, 4, 16.8, 2, 20, 40, "haste"],
  ["Tabby", "Event", "white", "#e7b15b", 10, 4, 16.8, 4, 40, 28, "focus"],
  ["Vicious", "Event", "blue", "#30658d", 10, 4, 17.5, 8, 20, 50, "rage"],
  ["Windy", "Event", "white", "#e4edf1", 10, 3, 19.6, 3, 27, 20, "haste"],
];
export const BEES: BeeDefinition[] = rows.map(
  (
    [
      name,
      rarity,
      color,
      body,
      gather,
      interval,
      speed,
      attack,
      conversion,
      energy,
      ability,
    ],
    i,
  ) => ({
    id: `bee-${i}`,
    name: `${name} Bee`,
    face: name.toLowerCase(),
    rarity,
    color,
    body,
    gather,
    interval,
    speed,
    attack,
    conversion,
    energy,
    ability,
  }),
);
