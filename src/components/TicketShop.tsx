import { BEES, EVENT_OFFERS } from "../game/data/content";
import { useState } from "react";
import { buyEventBee, buyTicketItem, buyStarTreats, MAX_ITEMS } from "../game/systems/simulation";
import { abilityNames } from "../game/data/abilities";
import { TICKET_ITEMS, ITEM_NAMES } from "../game/data/progression";
import { useGame, sound } from "../game/systems/store";
import { BeeIcon, ItemIcon } from "./Icons";
export default function TicketShop() {
  const { game: s, revision } = useGame();
  const [quantity, setQuantity] = useState("1");
  const starCount = quantity === "max" ? Math.min(Math.floor(s.inventory.ticket / 1000), MAX_ITEMS - s.inventory.starTreat) : Number(quantity);
  void revision;
  return (
    <>
      <div className="shop-banner">
        <div>
          <h3>Ticket Tent</h3>
          <p>Earn tickets from quests, enemy loot and the daily dispenser.</p>
        </div>
        <div className="wallet">🎟 {s.inventory.ticket} tickets</div>
      </div>
      <div className="shop-grid">
        {TICKET_ITEMS.map((o) => (
          <article className="item-card" key={o.id}>
            <div className="item-art">
              <ItemIcon kind={o.id} size={100} />
            </div>
            <h3>{ITEM_NAMES[o.id]}</h3>
            <p>
              {o.id === "starTreat"
                ? "Makes a bee Gifted. Choose the bee in your hive."
                : "Hatch from your inventory or select this egg in your hive."}
            </p>
            {o.id === "starTreat" && <label className="bulk-purchase">
              Star Treat quantity
              <select aria-label="Star Treat quantity" value={quantity} onChange={e => setQuantity(e.target.value)}>
                {[1, 10, 100, 1000, 10000, 100000, 1000000].map(n => <option key={n} value={n}>{n.toLocaleString()}×</option>)}
                <option value="max">Buy max</option>
              </select>
            </label>}
            <button
              className="button"
              disabled={s.inventory.ticket < o.cost * (o.id === "starTreat" ? starCount : 1) || (o.id === "starTreat" && starCount < 1)}
              onClick={() => {
                if (o.id === "starTreat") buyStarTreats(s, starCount);
                else buyTicketItem(s, o.id);
                useGame.getState().refresh();
                useGame.getState().save();
                sound();
              }}
            >
              🎟 {(o.cost * (o.id === "starTreat" ? starCount : 1)).toLocaleString()} · Buy{o.id === "starTreat" ? ` ${starCount.toLocaleString()} Star Treats` : ""}
            </button>
          </article>
        ))}
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
