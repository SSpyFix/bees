import TokenIcon from "./TokenIcon";
import { abilityInfo, beeAbilities } from "../game/data/abilities";
import type { BeeDefinition } from "../game/data/bees";

const descriptions: Record<string, string> = {
  red: "Increases red pollen. Collect more tokens to stack the boost.",
  blue: "Increases blue pollen. Collect more tokens to stack the boost.",
  white: "Increases white pollen. Collect more tokens to stack the boost.",
  haste: "Increases movement speed. Stacks up to 10 times.",
  focus: "Increases critical chance. Stacks up to 10 times.",
  rage: "Adds bee attack for 45 seconds. Stacks up to 4 times.",
  melody: "Increases critical power for 30 seconds.",
  babyLove: "Doubles pollen for 30 seconds.",
  bomb: "Collects pollen from nearby flowers of every color.",
  bombPlus: "Collects pollen from every color in a larger area.",
  redBomb: "Collects pollen from nearby red flowers.",
  redBombPlus: "Collects red pollen in a larger area.",
  blueBomb: "Collects pollen from nearby blue flowers.",
  blueBombPlus: "Collects blue pollen in a larger area.",
  link: "Collects nearby ability tokens.",
  bubble: "Collects blue pollen and replenishes nearby flowers.",
  flame: "Collects red pollen and damages nearby creatures.",
  pollenMark: "Creates a mark that boosts pollen while you stand inside it.",
  honeyMark: "Creates a mark that converts pollen while you stand inside it.",
  honey: "Grants honey when collected.",
  critical: "Increases critical collection chance.",
  beam: "Collects pollen in beams around the field.",
  goo: "Covers flowers with goo for extra honey from pollen.",
  impale: "Damages a nearby creature with spikes.",
  tornado: "Collects pollen and damages creatures in a swirling area.",
  bearMorph: "Transforms the player and doubles pollen for 30 seconds.",
  inspire: "Gifted ability: increases pollen for 5 seconds. Stacks up to 50 times.",
};
const giftedBonuses: Record<string, string> = {
  basic: "×1.2 Pollen", bomber: "×1.1 Bomb Pollen", brave: "+1 Bee Attack",
  bumble: "×1.1 Capacity", cool: "×1.1 Blue Pollen", hasty: "+15% Player Movespeed",
  looker: "+25% Critical Power", rad: "×1.1 Red Pollen", rascal: "×1.25 Red Bomb Pollen",
  stubborn: "+15% Ability Token Lifespan", bubble: "×1.25 Bubble Pollen",
  bucko: "+20% Blue Field Capacity", commander: "+3% Critical Chance", demo: "×1.25 Buzz Bomb Pollen",
  exhausted: "+20% White Field Capacity", fire: "×1.25 Flame Pollen", frosty: "×1.25 Blue Bomb Pollen",
  honey: "×1.5 Honey From Tokens", rage: "+10% Bee Attack", riley: "+20% Red Field Capacity",
  shocked: "×1.1 White Pollen", carpenter: "×1.25 Tool Pollen", demon: "+20% Instant Bomb Conversion",
  diamond: "×1.2 Convert Rate", lion: "+5% Gifted Bee Pollen", music: "+25% Bee Gather Pollen",
  ninja: "+5% Bee Movespeed", buoyant: "×1.2 Capacity", fuzzy: "×1.1 Bomb Pollen",
  vector: "+15% Mark Duration", bear: "+10% Pollen", cobalt: "+15% Instant Blue Conversion",
  crimson: "+15% Instant Red Conversion", festive: "×1.25 Convert Rate", gummy: "+5% Honey Per Pollen",
  photon: "+5% Instant Conversion", puppy: "+20% Bond From Treats", tabby: "+50% Critical Power",
  vicious: "−15% Monster Respawn Time", windy: "+15% Instant White Conversion",
};
export default function BeeAbilities({ bee, gifted = false, showGifted = false }: {
  bee: BeeDefinition; gifted?: boolean; showGifted?: boolean;
}) {
  const abilities = beeAbilities(bee, gifted || showGifted);
  return <div className="ability-list">
    {abilities.length === 0 && <p>No ability tokens until gifted.</p>}
    {abilities.map(id => <div key={id}>
      <b style={{ color: abilityInfo(id).color }}><TokenIcon kind={id} size={26} />{abilityInfo(id).name}{id === "inspire" ? " ★" : ""}</b>
      <small>{descriptions[id] ?? abilityInfo(id).name}</small>
    </div>)}
    <p className="gifted-bonus">★ {gifted ? "Gifted bonus" : "When gifted"}: +50% gather, conversion and attack.
      {giftedBonuses[bee.face] && <> Hive bonus: {giftedBonuses[bee.face]}. Same-species bonuses apply once.</>}
    </p>
  </div>;
}
