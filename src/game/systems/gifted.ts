import { BAGS, FIELDS } from "../data/content";
import type { Game, Bee } from "./types";
export type GiftedBonus = { key: string; value: number; label: string };
const bonus = (key: string, value: number, label: string): GiftedBonus => ({
  key,
  value,
  label,
});
export const GIFTED_BONUSES: GiftedBonus[] = [
  bonus("pollen", 1.2, "×1.2 Pollen"),
  bonus("bomb", 1.1, "×1.1 Bomb Pollen"),
  bonus("attack-add", 1, "+1 Bee Attack"),
  bonus("capacity", 1.1, "×1.1 Capacity"),
  bonus("blue", 1.1, "×1.1 Blue Pollen"),
  bonus("move", 1.15, "+15% Player Movespeed"),
  bonus("critical-power", 0.25, "+25% Critical Power"),
  bonus("red", 1.1, "×1.1 Red Pollen"),
  bonus("red-bomb", 1.25, "×1.25 Red Bomb Pollen"),
  bonus("token-life", 1.15, "+15% Ability Token Lifespan"),
  bonus("bubble", 1.25, "×1.25 Bubble Pollen"),
  bonus("blue-capacity", 1.2, "+20% Blue Field Capacity"),
  bonus("critical-chance", 0.03, "+3% Critical Chance"),
  bonus("buzz-bomb", 1.25, "×1.25 Buzz Bomb Pollen"),
  bonus("white-capacity", 1.2, "+20% White Field Capacity"),
  bonus("flame", 1.25, "×1.25 Flame Pollen"),
  bonus("blue-bomb", 1.25, "×1.25 Blue Bomb Pollen"),
  bonus("honey-token", 1.5, "×1.5 Honey From Tokens"),
  bonus("attack", 1.1, "+10% Bee Attack"),
  bonus("red-capacity", 1.2, "+20% Red Field Capacity"),
  bonus("white", 1.1, "×1.1 White Pollen"),
  bonus("luck", 1.25, "+25% Loot Luck"),
  bonus("tool", 1.25, "×1.25 Tool Pollen"),
  bonus("instant-bomb", 0.2, "+20% Instant Bomb Conversion"),
  bonus("convert", 1.2, "×1.2 Convert Rate"),
  bonus("gifted-pollen", 1.05, "+5% Gifted Bee Pollen"),
  bonus("bee-pollen", 1.25, "+25% Bee Gather Pollen"),
  bonus("bee-speed", 1.05, "+5% Bee Movespeed"),
  bonus("ability-pollen", 1.05, "+5% Bee Ability Pollen"),
  bonus("capacity", 1.2, "×1.2 Capacity"),
  bonus("bomb-power", 1.1, "×1.1 Bomb Power"),
  bonus("super-critical", 0.03, "+3% Super-Crit Chance"),
  bonus("flame-duration", 1.25, "+25% Flame Duration"),
  bonus("bubble-duration", 1.25, "+25% Bubble Duration"),
  bonus("mark-duration", 1.15, "+15% Mark Duration"),
  bonus("pollen", 1.1, "+10% Pollen"),
  bonus("instant-blue", 0.15, "+15% Instant Blue Conversion"),
  bonus("instant-red", 0.15, "+15% Instant Red Conversion"),
  bonus("duplication", 0.01, "+1% Ability Duplication Chance"),
  bonus("hive-convert", 1.25, "×1.25 Convert Rate At Hive"),
  bonus("honey-per-pollen", 1.05, "+5% Honey Per Pollen"),
  bonus("instant", 0.05, "+5% Instant Conversion"),
  bonus("bond", 1.2, "+20% Bond From Treats"),
  bonus("critical-power", 0.5, "+50% Critical Power"),
  bonus("respawn", 0.85, "−15% Monster Respawn Time"),
  bonus(
    "instant-white",
    0.15,
    "+15% Instant White Conversion; ×2 Cloud Boosts",
  ),
];
const additive = new Set([
  "attack-add",
  "critical-power",
  "critical-chance",
  "super-critical",
  "instant-bomb",
  "instant-blue",
  "instant-red",
  "instant-white",
  "instant",
  "duplication",
]);
export function hiveBonus(s: Game, key: string) {
  let total = additive.has(key) ? 0 : 1;
  const seen = new Set<string>();
  for (const b of s.bees)
    if (b.gifted && !seen.has(b.kind)) {
      seen.add(b.kind);
      const value = GIFTED_BONUSES[Number(b.kind.slice(4))];
      if (value?.key === key)
        total = additive.has(key) ? total + value.value : total * value.value;
    }
  return total;
}
export const giftedStats = (b: Bee) => (b.gifted ? 1.5 : 1);
export const giftedBonusLabel = (kind: string) =>
  GIFTED_BONUSES[Number(kind.slice(4))]?.label ?? "";
export function updateCapacity(s: Game) {
  const field = FIELDS.find(
    (f) =>
      Math.abs(f.x - s.player.x) < f.width / 2 &&
      Math.abs(f.z - s.player.z) < f.width / 2 &&
      Math.abs(f.y - s.player.y) < 3,
  );
  let fieldBonus = 1;
  if (field) {
    const color = (["white", "red", "blue"] as const)[
      field.colors.indexOf(Math.max(...field.colors))
    ];
    fieldBonus = hiveBonus(s, `${color}-capacity`);
  }
  // Carried pollen is conserved if a temporary field capacity bonus disappears.
  s.capacity = Math.max(
    s.pollen,
    Math.round(
      (BAGS.find((b) => b.id === s.bag)?.capacity ?? 200) *
        hiveBonus(s, "capacity") *
        fieldBonus,
    ),
  );
}
