import { BEES, EVENT_OFFERS } from "../game/data/content";
import { buyEventBee } from "../game/systems/simulation";
import { useGame, sound } from "../game/systems/store";
import { BeeIcon } from "./Icons";
export default function TicketShop() {
  const { game: s, revision } = useGame();
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
                Event bee · {b.ability} tokens
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
