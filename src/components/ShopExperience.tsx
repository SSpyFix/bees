import { useState } from "react";
import { GEAR } from "../game/data/content";
import type { Gear } from "../game/data/equipment";
import { ITEM_NAMES } from "../game/data/progression";
import { useGame, sound } from "../game/systems/store";
import { buy, maxPurchase, eggCost, jellyCost, purchaseCost } from "../game/systems/simulation";
import ShopPreview from "./ShopPreview";
export default function ShopExperience({
  consumables = false,
  placeIdOverride,
}: {
  consumables?: boolean;
  placeIdOverride?: string;
}) {
  const { game: s, placeId: storePlaceId, refresh, save } = useGame();
  const placeId = placeIdOverride ?? storePlaceId;
  const [selected, setSelected] = useState(0),
    [quantity, setQuantity] = useState("1");
  const [failure, setFailure] = useState("");
  const gear = GEAR.filter((g) => g.shop === placeId);
  const items: (Omit<Gear, "type" | "icon"> & { type: string })[] = consumables
    ? [
        {
          id: "egg",
          name: "Basic Egg",
          type: "egg",
          cost: eggCost(s),
          gate: 0,
          description: "An ordinary bee egg. Usually hatches into a Basic Bee.",
        },
        {
          id: "treat",
          name: "Treat",
          type: "treat",
          cost: 10000,
          gate: 0,
          description:
            "A tasty snack that increases your bee's bond by 10. Use it in your hive to level up your bees.",
        },
        {
          id: "jelly",
          name: "Royal Jelly",
          type: "jelly",
          cost: jellyCost(s),
          gate: 0,
          description:
            "Transforms a bee into a random Rare, Epic, Legendary, or Mythic bee. Has a 1 in 250 chance to make it gifted.",
        },
        {
          id: "booster",
          name: "Field Dice",
          type: "booster",
          cost: 120,
          gate: 0,
          description:
            "Boosts pollen in a randomly selected unlocked field for 15 minutes.",
        },
        {
          id: "converter",
          name: "Micro-Converter",
          type: "converter",
          cost: 90,
          gate: 0,
          description: "Instantly converts all carried pollen into honey.",
        },
      ].filter(item => placeId === "treat-shop" ? item.id === "treat" : placeId === "jelly-shop" ? item.id === "jelly" : item.id === "egg")
    : gear;
  const item = items[selected % items.length];
  const qty = consumables
    ? quantity === "max"
      ? maxPurchase(s, item.id)
      : Number(quantity)
    : 1;
  const equipped =
    !consumables && [s.tool, s.bag, s.boots, s.hat].includes(item.id);
  const owned = !consumables && s.owned.includes(item.id),
    locked = s.bees.length < item.gate;
  const total = consumables ? purchaseCost(s, item.id, qty) : item.cost;
  const missing = !owned && "ingredients" in item && Object.entries(item.ingredients ?? {}).some(([id, n]) => (s.inventory[id] ?? 0) < n);
  const affordable = owned || s.honey >= total;
  const disabled =
    equipped ||
    locked ||
    !affordable ||
    missing ||
    qty < 1 ||
    (consumables && qty > maxPurchase(s, item.id));
  const advance = (delta: number) =>
    setSelected((selected + delta + items.length) % items.length);
  return (
    <div
      className={`shop-experience ${consumables ? "egg-dispenser-view" : "gear-display-view"}`}
    >
      <div className="shop-stage">
        <ShopPreview
          id={item.id}
          type={item.type}
          level={Number(item.id.split("-")[1]) || 0}
        />
      </div>
      <article className="item-card shop-detail-card" aria-live="polite">
        <h3>{item.name}</h3>
        <p className="shop-price">{item.cost.toLocaleString()} Honey</p>
        <p>{item.description}</p>
        {"ingredients" in item && item.ingredients && <ul className="recipe-list">
          {Object.entries(item.ingredients).map(([id, n]) => <li key={id} className={(s.inventory[id] ?? 0) < n ? "missing" : ""}>
            {n.toLocaleString()} {ITEM_NAMES[id] ?? id}<span>{(s.inventory[id] ?? 0).toLocaleString()} owned</span>
          </li>)}
        </ul>}
        {"power" in item && item.power && (
          <p>
            +{Math.round((item.power - 1) * 100)}%{" "}
            {item.type === "hat" ? "Pollen" : "Collection power"}
          </p>
        )}
        {"range" in item && item.range && (
          <p>Collects flowers within {item.range.toFixed(1)} studs.</p>
        )}
        {"capacity" in item && item.capacity && (
          <p>Capacity: {item.capacity.toLocaleString()} pollen</p>
        )}
        {"convert" in item && item.convert && (
          <p>×{item.convert.toFixed(1)} Convert Rate</p>
        )}
        {"speed" in item && item.speed && (
          <p>+{Math.round((item.speed - 1) * 100)}% Movespeed</p>
        )}
        <p>
          {item.gate > 0
            ? `Requires ${item.gate} bees.`
            : "Available to all beekeepers."}
        </p>
        {failure && (
          <p role="alert" className="shop-message">
            {failure}
          </p>
        )}
        {consumables && <p>Owned: {s.inventory[item.id].toLocaleString()}</p>}
        <button
          className={`button shop-purchase ${equipped ? "equipped" : ""} ${!affordable ? "cant-afford" : ""}`}
          disabled={disabled}
          onClick={() => {
            const success = buy(s, item.id, qty);
            setFailure(success ? "" : s.notification);
            refresh();
            save();
            sound();
          }}
        >
          {equipped
            ? "✓ Equipped"
            : locked
              ? `${item.gate} bees required`
              : !affordable
                ? "Can't afford"
                : missing
                  ? "Materials required"
                : consumables
                  ? `Buy ${qty.toLocaleString()}× · ${total.toLocaleString()} Honey`
                  : owned
                    ? "Equip"
                    : `Buy & equip · ${item.cost.toLocaleString()} Honey`}
        </button>
      </article>
      {consumables && (
        <div className="bulk-purchase shop-bulk">
          <label>
            Purchase quantity
            <select
              aria-label="Purchase quantity"
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
          <small>Total: {total.toLocaleString()} Honey</small>
        </div>
      )}
      <div className="shop-carousel-controls">
        <button
          className="shop-arrow"
          aria-label="Previous item"
          onClick={() => advance(-1)}
        >
          <svg viewBox="0 0 32 40" aria-hidden="true">
            <path d="M27 2 4 20l23 18Z" fill="white" />
          </svg>
        </button>
        <div>
          <b>{item.name}</b>
          <span>
            {(selected % items.length) + 1} / {items.length}
          </span>
        </div>
        <button
          className="shop-arrow"
          aria-label="Next item"
          onClick={() => advance(1)}
        >
          <svg viewBox="0 0 32 40" aria-hidden="true">
            <path d="M5 2 28 20 5 38Z" fill="white" />
          </svg>
        </button>
      </div>
      <nav className="shop-selection" aria-label="Shop items">
        {items.map((g, i) => (
          <button
            key={g.id}
            aria-label={`View ${g.name}`}
            className={i === selected % items.length ? "selected" : ""}
            onClick={() => setSelected(i)}
          >
            {g.name}
          </button>
        ))}
      </nav>
    </div>
  );
}
