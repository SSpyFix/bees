import { placeSprinkler } from "../game/systems/sprinklers";
import { SPRINKLERS } from "../game/data/support";
import { useState } from "react";
import { EGGS, ITEM_NAMES } from "../game/data/progression";
import { useGame, sound } from "../game/systems/store";
import { useItem } from "../game/systems/simulation";
import { ItemIcon } from "./GameIcons";
import { ItemIcon as MaterialIcon } from "./Icons";
import { beginItemDrag, endItemDrag, useItemDrag } from '../game/systems/item-drag';
import { BEE_ITEMS } from '../game/systems/item-actions';

const descriptions: Record<string, string> = {
  egg: "Usually hatches a Basic Bee. Rare, Epic and Legendary bees are possible.",
  silverEgg: "64.9% Rare · 30% Epic · 5% Legendary · 0.1% Mythic.",
  goldEgg: "79% Epic · 20% Legendary · 1% Mythic.",
  diamondEgg: "95% Legendary · 5% Mythic.",
  mythicEgg: "Always hatches a Mythic bee.",
  treat: "Gives a bee 10 bond. Open your hive to choose a bee.",
  jelly:
    "Transform a bee into a random Rare, Epic, Legendary or Mythic species.",
  starJelly:
    "Transform a bee into a random Gifted Rare or better. Choose a bee in your hive.",
  starTreat:
    "Guarantees Gifted status for your chosen bee. Use it in your hive.",
  booster: "Doubles pollen from a random unlocked field for 15 minutes.",
  converter: "Instantly converts your entire bag of pollen into honey.",
};
export default function InventoryPanel() {
  const { game: s, revision, open } = useGame();
  void revision;
  const [tab, setTab] = useState("items");
  const core = [
    "egg",
    "silverEgg",
    "goldEgg",
    "diamondEgg",
    "mythicEgg",
    "treat",
    "jelly",
    "starJelly",
    "starTreat",
    "booster",
    "converter",
  ];
  const ids =
    tab === "items"
      ? core
      : Object.keys(s.inventory).filter(
          (id) => !core.includes(id) && id !== "ticket",
        );
  return (
    <>
      <div className="inventory-heading">
        <ItemIcon id="ticket" />
        <b>{s.inventory.ticket.toLocaleString()} Tickets</b>
        <span>
          Drag items to the hotbar. Drop treats or jelly onto a bee in your hive.
        </span>
      </div>
      <div className="tabs">
        {[
          ["items", "Eggs & Items"],
          ["materials", "Materials"],
        ].map(([id, label]) => (
          <button
            key={id}
            className={tab === id ? "selected" : ""}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>
      {s.sprinkler >= 0 && (
        <article className="inventory-item">
          <div className="sprinkler-art">⛲</div>
          <div>
            <h3>Sprinkler Builder</h3>
            <p>
              {SPRINKLERS[s.sprinkler].name} · {s.sprinklers.length}/
              {SPRINKLERS[s.sprinkler].count} placed · Press R in a field
            </p>
          </div>
          <button
            className="button small"
            onClick={() => {
              placeSprinkler(s);
              useGame.getState().refresh();
              open(null);
            }}
          >
            Place Sprinkler
          </button>
        </article>
      )}
      <div className="bss-inventory-list">
        {ids.map((id) => {
          const usable =
            BEE_ITEMS.has(id) ||
            !!descriptions[id] ||
            [
              "redExtract",
              "blueExtract",
              "oil",
              "enzymes",
              "glue",
              "glitter",
              "stinger",
              "gumdrops",
            ].includes(id);
          return (
            <article className="bss-inventory-row" key={id} data-inventory-item={id}
              draggable={(s.inventory[id] ?? 0) > 0}
              onDragStart={event => beginItemDrag(event, id)} onDragEnd={endItemDrag}>
              <div className="inventory-art">
                {["egg", "treat", "jelly", "booster", "converter", "starTreat"].includes(id)
                  ? <ItemIcon id={id} />
                  : <MaterialIcon kind={id} size={58} />}
                <strong>×{(s.inventory[id] ?? 0).toLocaleString()}</strong>
              </div>
              <div className="inventory-copy">
                <h3>
                  {ITEM_NAMES[id] ?? id}
                </h3>
                <p>
                  {descriptions[id] ??
                    (usable
                      ? "Use this item for a temporary field or hive benefit."
                      : "Crafting material. Collect more from fields, creatures and quests.")}
                </p>
              {usable && (
                <button
                  className="button small"
                  disabled={
                    !s.inventory[id] ||
                    (id === "jelly" && !!s.jellyRun?.running) ||
                    !!(id in EGGS && s.bees.length >= s.slots) ||
                    (id === "converter" && s.pollen === 0)
                  }
                  onClick={() => {
                    if (BEE_ITEMS.has(id)) {
                      useItemDrag.setState({ pending: { item: id, beeId: '' } });
                      return;
                    }
                    useItem(s, id);
                    useGame.getState().refresh();
                    useGame.getState().save();
                    sound();
                  }}
                >
                  {BEE_ITEMS.has(id)
                    ? "Choose bee"
                    : id in EGGS
                      ? "Hatch"
                      : "Use"}
                </button>
              )}
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
