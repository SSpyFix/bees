import { useState } from "react";
import { useGame, sound } from "../game/systems/store";
import { RECIPES, SPRINKLERS, BADGE_RANKS } from "../game/data/support";
import { ITEM_NAMES } from "../game/data/progression";
import { badgeCount, badgesAtTier } from "../game/systems/badges";
import { startCraft, finishCraft } from "../game/systems/crafting";
import { buySprinkler } from "../game/systems/sprinklers";
import { ItemIcon } from "./Icons";
export default function GuildPanel() {
  const { game: s, revision } = useGame();
  void revision;
  const [tab, setTab] = useState("sprinklers"),
    [quantity, setQuantity] = useState(1);
  const act = (fn: () => unknown) => {
    fn();
    useGame.getState().refresh();
    useGame.getState().save();
    sound();
  };
  if (badgeCount(s) < 15)
    return (
      <div className="empty-state">
        <h3>Earn 15 badges to enter</h3>
        <p>
          You have {badgeCount(s)} badges. Open Badges to view progress and
          claim earned ranks.
        </p>
        <button
          className="button"
          onClick={() => useGame.getState().open("badges")}
        >
          View Badges
        </button>
      </div>
    );
  return (
    <>
      <div className="tabs">
        {["sprinklers", "blender"].map((id) => (
          <button
            key={id}
            className={tab === id ? "selected" : ""}
            onClick={() => setTab(id)}
          >
            {id === "sprinklers" ? "Sprinkler Shop" : "Blender"}
          </button>
        ))}
      </div>
      {tab === "sprinklers" ? (
        <>
          <p className="menu-intro">
            Buy a permanent Sprinkler Builder, then use it from your inventory
            or press R while standing in a field. Placing beyond your limit
            replaces the oldest sprinkler.
          </p>
          <div className="shop-grid">
            {SPRINKLERS.map((def, tier) => {
              const locked = tier > 0 && badgesAtTier(s, tier + 1) < 10;
              return (
                <article className="item-card" key={def.name}>
                  <div className="sprinkler-art" style={{ color: def.color }}>
                    ⛲
                  </div>
                  <h3>{def.name}</h3>
                  <p>
                    {def.count} placed · {def.radius} flower radius · +
                    {def.power} regeneration every {def.rate}s · {def.setup}s
                    setup
                  </p>
                  <button
                    className="button"
                    disabled={
                      tier <= s.sprinkler || s.honey < def.cost || locked
                    }
                    onClick={() => act(() => buySprinkler(s, tier))}
                  >
                    {tier === s.sprinkler
                      ? "Equipped"
                      : tier < s.sprinkler
                        ? "Upgraded"
                        : locked
                          ? `10 ${BADGE_RANKS[tier + 1]} badges required`
                          : `${def.cost.toLocaleString()} Honey · Buy`}
                  </button>
                </article>
              );
            })}
          </div>
        </>
      ) : (
        <>
          {s.crafting ? (
            <div className="craft-job">
              <ItemIcon kind={s.crafting.item} size={70} />
              <div>
                <h3>
                  Blending {s.crafting.quantity} {ITEM_NAMES[s.crafting.item]}
                </h3>
                <p>
                  {Math.floor(s.crafting.elapsed / 300)} finished ·{" "}
                  {Math.ceil(
                    (s.crafting.quantity * 300 - s.crafting.elapsed) / 60,
                  )}{" "}
                  minutes remaining
                </p>
                <div className="progress">
                  <i
                    style={{
                      width: `${(s.crafting.elapsed / (s.crafting.quantity * 300)) * 100}%`,
                    }}
                  />
                </div>
              </div>
              <button
                className="button"
                onClick={() => act(() => finishCraft(s))}
              >
                {s.crafting.elapsed >= s.crafting.quantity * 300
                  ? "Collect Items"
                  : "End Crafting & Refund Unfinished"}
              </button>
            </div>
          ) : (
            <p className="menu-intro">
              Each item takes 5 minutes of active game time. Ending early
              returns the ingredients for unfinished items. Your queue is saved
              when you leave.
            </p>
          )}
          <label className="craft-quantity">
            Quantity{" "}
            <input
              type="number"
              min="1"
              max="10000"
              step="1"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />
          </label>
          <div className="shop-grid">
            {Object.entries(RECIPES).map(([item, recipe]) => {
              const enough =
                Number.isInteger(quantity) &&
                quantity > 0 &&
                quantity <= 10000 &&
                Object.entries(recipe).every(
                  ([id, n]) => (s.inventory[id] ?? 0) >= n * quantity,
                );
              return (
                <article className="item-card" key={item}>
                  <div className="item-art">
                    <ItemIcon kind={item} size={85} />
                  </div>
                  <h3>{ITEM_NAMES[item] ?? item}</h3>
                  <ul className="recipe-list">
                    {Object.entries(recipe).map(([id, n]) => (
                      <li
                        key={id}
                        className={
                          (s.inventory[id] ?? 0) < n * quantity ? "missing" : ""
                        }
                      >
                        {n * quantity} {ITEM_NAMES[id] ?? id}
                        <span>
                          {(s.inventory[id] ?? 0).toLocaleString()} owned
                        </span>
                      </li>
                    ))}
                  </ul>
                  <button
                    className="button"
                    disabled={!enough || !!s.crafting}
                    onClick={() => act(() => startCraft(s, item, quantity))}
                  >
                    Blend{" "}
                    {Number.isInteger(quantity) && quantity > 0 ? quantity : 1}
                  </button>
                </article>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}
