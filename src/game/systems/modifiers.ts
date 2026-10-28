import { GEAR, FIELDS, BEES } from "../data/content";
import type { Game } from "./types";
export function hasGift(s: Game, face: string) {
  return s.bees.some(
    (b) => b.gifted && BEES.find((d) => d.id === b.kind)?.face === face,
  );
}
export function hiveModifiers(s: Game) {
  const faces = new Set(
    s.bees
      .filter((b) => b.gifted)
      .map((b) => BEES.find((d) => d.id === b.kind)?.face),
  );
  const has = (face: string) => faces.has(face),
    rank = (id: string) => s.badges[id] ?? 0;
  return {
    pollen: (has("basic") ? 1.2 : 1) * (has("bear") ? 1.1 : 1),
    red: (has("rad") ? 1.1 : 1) * (1 + rank("strawberry") * 0.05),
    blue: (has("cool") ? 1.1 : 1) * (1 + rank("bamboo") * 0.05),
    white:
      (has("shocked") ? 1.1 : 1) *
      (rank("spider") ? 1.05 + rank("spider") * 0.05 : 1) *
      (1 + rank("coconut") * 0.04),
    tool: (has("carpenter") ? 1.25 : 1) * (1 + rank("stump") * 0.05),
    gather: has("music") ? 1.25 : 1,
    giftedGather: (has("lion") ? 1.05 : 1) * (1 + rank("mountain") * 0.01),
    beeSpeed: 1 + (has("ninja") ? 0.05 : 0) + rank("playtime") * 0.01,
    playerSpeed: has("hasty") ? 1.15 : 1,
    attackFlat: has("brave") ? 1 : 0,
    attack: has("rage") ? 1.1 : 1,
    criticalChance: has("commander") ? 0.03 : 0,
    criticalPower:
      (has("looker") ? 0.25 : 0) +
      (has("tabby") ? 0.5 : 0) +
      [0, 0.1, 0.2, 0.4, 0.7, 1][rank("battle")],
    honeyPerPollen: 1 + (has("gummy") ? 0.05 : 0) + rank("goo") * 0.02,
    honeyAtHive: 1 + rank("dandelion") * 0.03,
    conversion:
      (has("diamond") ? 1.2 : 1) *
      (has("festive") ? 1.25 : 1) *
      (1 + rank("honey") * 0.3) *
      (1 + rank("pumpkin") * 0.2),
    honeyToken: has("honey") ? 1.5 : 1,
    instant: (has("photon") ? 0.05 : 0) + rank("cactus") * 0.01,
    instantRed: (has("crimson") ? 0.15 : 0) + rank("mushroom") * 0.03,
    instantBlue: (has("cobalt") ? 0.15 : 0) + rank("blue") * 0.03,
    instantWhite: (has("windy") ? 0.15 : 0) + rank("pineapple") * 0.03,
    bomb: (has("bomber") ? 1.1 : 1) * (has("fuzzy") ? 1.1 : 1),
    redBomb: has("rascal") ? 1.25 : 1,
    blueBomb: has("frosty") ? 1.25 : 1,
    buzzBomb: has("demo") ? 1.25 : 1,
    bombInstant: has("demon") ? 0.2 : 0,
    bubble: has("bubble") ? 1.25 : 1,
    flame: (has("fire") ? 1.25 : 1) * (1 + rank("pepper") * 0.05),
    lifespan: has("stubborn") ? 1.15 : 1,
    markDuration: has("vector") ? 1.15 : 1,
    bond: has("puppy") ? 1.2 : 1,
    respawn: has("vicious") ? 0.85 : 1,
  };
}
export function effectiveCapacity(s: Game, bagId = s.bag) {
  const base = GEAR.find((g) => g.id === bagId)?.capacity ?? 200;
  const bonus = [0, 25000, 50000, 100000, 150000, 250000][
    s.badges.ability ?? 0
  ];
  let capacity =
    (base + bonus) *
    (1 + (s.badges.quests ?? 0) * 0.25) *
    (1 + (s.badges.sunflower ?? 0) * 0.1) *
    (hasGift(s, "bumble") ? 1.1 : 1) *
    (hasGift(s, "buoyant") ? 1.2 : 1);
  const field = FIELDS.find(
    (f) =>
      Math.abs(f.x - s.player.x) < f.width / 2 &&
      Math.abs(f.z - s.player.z) < (f.depth ?? f.width) / 2 &&
      Math.abs(f.y - s.player.y) < 3,
  );
  if (field) {
    const color = field.colors.indexOf(Math.max(...field.colors));
    if (color === 0) capacity *= 1 + (hasGift(s, "exhausted") ? 0.2 : 0);
    if (color === 1)
      capacity *=
        1 + (hasGift(s, "riley") ? 0.2 : 0) + (s.badges.rose ?? 0) * 0.05;
    if (color === 2)
      capacity *=
        1 + (hasGift(s, "bucko") ? 0.2 : 0) + (s.badges.pine ?? 0) * 0.05;
  }
  return Math.floor(capacity);
}
export function updateCapacity(s: Game) {
  s.capacity = Math.max(s.pollen, effectiveCapacity(s));
}
