import BeeAbilities from "./BeeAbilities";
import { abilityNames } from "../game/data/abilities";
import { useState } from "react";
import { BEES, RARITY_COLORS } from "../game/data/content";
import { BeeIcon } from "./Icons";
import { useGame } from "../game/systems/store";
export default function BeeIndex() {
  const [chosen, setChosen] = useState(BEES[0]);
  const s = useGame((g) => g.game);
  return (
    <div className="bee-index">
      <div className="face-grid">
        {BEES.map((b) => (
          <button
            className={chosen.id === b.id ? "selected" : ""}
            key={b.id}
            onClick={() => setChosen(b)}
            title={b.name}
            aria-label={b.name}
          >
            <BeeIcon face={b.face} color={b.body} size={64} />
            <small>{b.name.replace(" Bee", "")}</small>
            {s.bees.some((x) => x.kind === b.id) && <i>✓</i>}
          </button>
        ))}
      </div>
      <aside className="bee-detail">
        <BeeIcon face={chosen.face} color={chosen.body} size={128} />
        <h3>{chosen.name}</h3>
        <span
          className="rarity"
          style={{ background: RARITY_COLORS[chosen.rarity] }}
        >
          {chosen.rarity}
        </span>
        <p>
          {chosen.color === "white"
            ? "Colorless"
            : chosen.color === "red"
              ? "Red"
              : "Blue"}{" "}
          Bee
        </p>
        <div className="stat-table">
          {[
            ["Gather", `${chosen.gather} pollen / ${chosen.interval}s`],
            ["Convert", `${chosen.conversion} / s`],
            ["Speed", chosen.speed],
            ["Attack", chosen.attack],
            ["Energy", chosen.energy > 10000 ? "∞" : chosen.energy],
            ["Abilities", abilityNames(chosen)],
          ].map(([k, v]) => (
            <span key={k}>
              {k}
              <b>{v}</b>
            </span>
          ))}
        </div>
        <BeeAbilities bee={chosen} showGifted />
        <p>
          {s.bees.some((x) => x.kind === chosen.id)
            ? "In your hive"
            : "Not in your hive yet"}
        </p>
      </aside>
    </div>
  );
}
