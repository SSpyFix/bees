import { abilityNames } from "../game/data/abilities";
import { BEES, EVENT_OFFERS } from "../game/data/content";
import { useState } from "react";
import {
  buyEventBee,
  buyStarTreats,
  MAX_ITEMS,
} from "../game/systems/simulation";
import { useGame, sound } from "../game/systems/store";
import { BeeIcon } from "./Icons";
export default function TicketShop() {
  const { game: s, revision } = useGame();
  void revision;
  const [quantity, setQuantity] = useState("1");
  const starCount =
    quantity === "max"
      ? Math.min(
          Math.floor(s.inventory.ticket / 1000),
          MAX_ITEMS - s.inventory.starTreat,
        )
      : Number(quantity);
  return (
    <>
      <div className="shop-banner">
        <div>
          <h3>Ticket Tent</h3>
          <p>Earn tickets from quests, enemy loot and the daily dispenser.</p>
        </div>
        <div className="wallet">🎟 {s.inventory.ticket} tickets</div>
      </div>
      <article className="bulk-purchase">
        <h3>★ Star Treat</h3>
        <p>
          Makes any bee gifted without changing its species or level. Costs
          1,000 tickets each.
        </p>
        <label>
          Star Treat quantity
          <select
            aria-label="Star Treat quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          >
            {[1, 10, 100, 1000, 10000, 100000, 1000000].map((n) => (
              <option key={n} value={n}>
                {n.toLocaleString()}×
              </option>
            ))}
            <option value="max">Buy max</option>
          </select>
        </label>
        <p>Owned: {s.inventory.starTreat.toLocaleString()}</p>
        <button
          className="button"
          disabled={starCount < 1 || s.inventory.ticket < starCount * 1000}
          onClick={() => {
            buyStarTreats(s, starCount);
            useGame.getState().refresh();
            useGame.getState().save();
          }}
        >
          Buy {starCount.toLocaleString()} Star Treats ·{" "}
          {(starCount * 1000).toLocaleString()} tickets
        </button>
      </article>
      <div className="shop-grid">
        {EVENT_OFFERS.map((o) => {
          const b = BEES.find((b) => b.id === o.kind)!,
            owned = s.bees.some((b) => b.kind === o.kind);
          return (
            <article className="item-card" key={o.kind}>
              <div className="item-art">
                <BeeIcon face={b.face} color={b.body} size={110} />
              </div>
              <h3>{b.name}</h3>
              <p>
                {b.color === "white"
                  ? "Colorless"
                  : b.color === "red"
                    ? "Red"
                    : "Blue"}{" "}
                Event bee · {abilityNames(b)}
                <br />
                Gather {b.gather} · Convert {b.conversion}/s · Attack {b.attack}
              </p>
              <button
                className="button"
                disabled={
                  owned ||
                  s.inventory.ticket < o.cost ||
                  s.bees.length >= s.slots
                }
                onClick={() => {
                  buyEventBee(s, o.kind);
                  useGame.getState().refresh();
                  useGame.getState().save();
                  sound();
                }}
              >
                {owned
                  ? "In your hive"
                  : s.bees.length >= s.slots
                    ? "Hive is full"
                    : `🎟 ${o.cost} · Get ${b.name}`}
              </button>
            </article>
          );
        })}
      </div>
    </>
  );
}
