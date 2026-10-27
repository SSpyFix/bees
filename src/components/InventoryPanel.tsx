import { useGame } from "../game/systems/store";
import { ItemIcon } from "./GameIcons";
import { feed, makeGifted, useItem } from "../game/systems/simulation";
const rows = [
  {
    id: "ticket",
    name: "Ticket",
    description: "Used to activate and purchase special things!",
    action: "Find the Ticket Tent",
  },
  {
    id: "treat",
    name: "Treat",
    description: "Increases your bee's bond. A happy bee is a helpful bee!",
    action: "Feed first bee",
  },
  {
    id: "converter",
    name: "Micro-Converter",
    description: "Instantly converts all pollen in your bag to Honey.",
    action: "Use Micro-Converter",
  },
  {
    id: "booster",
    name: "Field Dice",
    description: "Boosts a random field for 15 minutes. +100% pollen!",
    action: "Roll Field Dice",
  },
  {
    id: "egg",
    name: "Basic Egg",
    description: "An ordinary bee egg. Usually hatches into a Basic Bee.",
    action: "Hatch an egg",
  },
  {
    id: "jelly",
    name: "Royal Jelly",
    description:
      "Choose a bee in your hive to transform. Uses your Auto Royal Jelly settings.",
    action: "Choose bee for Royal Jelly",
  },
  {
    id: "starTreat",
    name: "Star Treat",
    description:
      "Transforms a bee into a Gifted bee! Doesn't change its species.",
    action: "Make first bee gifted",
  },
];
export default function InventoryPanel() {
  const { game: s, refresh, save, open } = useGame();
  return (
    <div className="bss-inventory-list">
      {rows.map((item) => (
        <article key={item.id} className="bss-inventory-row">
          <div className="inventory-art">
            <ItemIcon id={item.id} />
            <strong
              style={{ fontSize: s.inventory[item.id] >= 1000000 ? 12 : 16 }}
            >
              ×{s.inventory[item.id].toLocaleString()}
            </strong>
          </div>
          <div className="inventory-copy">
            <h3>{item.name}</h3>
            <p>{item.description}</p>
            <button
              title={item.action}
              disabled={
                item.id !== "ticket" &&
                (s.inventory[item.id] < 1 ||
                  (item.id === "jelly" && !!s.jellyRun?.running))
              }
              onClick={() => {
                if (item.id === "ticket") {
                  open("map");
                  return;
                }
                if (item.id === "treat") feed(s, s.bees[0].id);
                else if (item.id === "jelly") {
                  open("hive");
                  return;
                } else if (item.id === "starTreat") makeGifted(s, s.bees[0].id);
                else useItem(s, item.id);
                refresh();
                save();
              }}
            >
              {item.action}
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
