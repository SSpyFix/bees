import TokenIcon from "./TokenIcon";
import { ABILITIES, beeAbilities, PASSIVES } from "../game/data/abilities";
import type { BeeDefinition } from "../game/data/bees";
import { giftedBonusLabel } from "../game/systems/gifted";
export default function BeeAbilities({
  bee,
  gifted = false,
  showGifted = false,
}: {
  bee: BeeDefinition;
  gifted?: boolean;
  showGifted?: boolean;
}) {
  const abilities = beeAbilities(bee, gifted || showGifted);
  return (
    <div className="ability-list">
      {abilities.length === 0 && <p>No ability tokens until gifted.</p>}
      {abilities.map((id) => (
        <div key={id}>
          <b style={{ color: ABILITIES[id].color }}>
            <TokenIcon kind={id} size={26} />
            {ABILITIES[id].name}
            {ABILITIES[id].gifted ? " ★" : ""}
          </b>
          <small>{ABILITIES[id].description}</small>
        </div>
      ))}
      {PASSIVES[bee.face] && <p>{PASSIVES[bee.face]}</p>}
      <p className="gifted-bonus">
        ★ {gifted ? "Gifted hive bonus" : "When gifted"}:{" "}
        {giftedBonusLabel(bee.id)}. Same-species bonuses apply once.
      </p>
    </div>
  );
}
