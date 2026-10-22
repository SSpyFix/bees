import { useEffect, useState } from "react";
import { useGame, sound } from "../game/systems/store";
import {
  atHive,
  currentField,
  nearestPlace,
  nearbyHive,
  claimHive,
  interactPlace,
  startConversion,
  useItem,
  feed,
  reroll,
} from "../game/systems/simulation";
import { TOOLS, QUESTS, PLACES } from "../game/data/content";
import { BeeIcon, GearArt, HoneyIcon } from "./Icons";
import { MountainMap, number } from "./Menus";
import type { Menu } from "../game/systems/store";
export default function HUD() {
  const { game: s, menu, open, revision, saveStatus } = useGame();
  void revision;
  const field = currentField(s),
    near = nearestPlace(s),
    hive = atHive(s),
    pad = nearbyHive(s),
    tool = TOOLS.find((t) => t.id === s.tool)!;
  const [notice, setNotice] = useState(true);
  useEffect(() => {
    setNotice(true);
    const timer = setTimeout(() => setNotice(false), 5000);
    return () => clearTimeout(timer);
  }, [s.noticeId]);
  useEffect(() => {
    const save = () => useGame.getState().save();
    const hide = () => {
      if (document.hidden) save();
    };
    window.addEventListener("pagehide", save);
    document.addEventListener("visibilitychange", hide);
    return () => {
      window.removeEventListener("pagehide", save);
      document.removeEventListener("visibilitychange", hide);
    };
  }, []);
  const perform = (fn: () => unknown) => {
    fn();
    sound();
    useGame.getState().refresh();
    useGame.getState().save();
  };
  const interact = () => {
    if (near) {
      if (["shop", "eggs", "npc", "tickets"].includes(near.kind))
        open(near.kind as Menu, near.id);
      else perform(() => interactPlace(s, near.id));
    } else if (pad && pad.index !== s.hive)
      perform(() => claimHive(s, pad.index));
    else if (hive) open("hive");
  };
  const slots = [
    {
      key: "1",
      label: tool.name,
      type: "tool",
      level: Number(s.tool.split("-")[1]),
      fn: () => sound(500),
      count: undefined,
    },
    {
      key: "2",
      label: "Basic Egg",
      type: "egg",
      level: 0,
      fn: () => perform(() => useItem(s, "egg")),
      count: s.inventory.egg,
    },
    {
      key: "3",
      label: "Field Dice",
      type: "bag",
      level: 2,
      fn: () => perform(() => useItem(s, "booster")),
      count: s.inventory.booster,
    },
    {
      key: "4",
      label: "Micro-Converter",
      type: "bag",
      level: 1,
      fn: () => perform(() => useItem(s, "converter")),
      count: s.inventory.converter,
    },
    {
      key: "5",
      label: "Treat",
      type: "bag",
      level: 0,
      fn: () => perform(() => feed(s, s.bees[0].id)),
      count: s.inventory.treat,
    },
    {
      key: "6",
      label: "Royal Jelly",
      type: "egg",
      level: 2,
      fn: () => perform(() => reroll(s, s.bees[0].id)),
      count: s.inventory.jelly,
    },
  ];
  return (
    <div className={`hud ${menu ? "menu-is-open" : ""}`}>
      <header className="top-hud">
        <div className="brand">
          <BeeIcon size={30} />
          <div>
            <h1>Bee Swarm Simulator</h1>
            <small>Browser recreation</small>
          </div>
        </div>
        <div className="resource-bar">
          <div className="resource honey">
            <HoneyIcon />
            <div>
              <span>Honey</span>
              <strong data-testid="honey">{number(s.honey)}</strong>
            </div>
          </div>
          <div className="resource pollen">
            <div className="capacity-track">
              <i
                style={{
                  width: `${Math.min(100, (s.pollen / s.capacity) * 100)}%`,
                }}
              />
            </div>
            <div className="pollen-content">
              <span>Pollen</span>
              <b>
                <span data-testid="pollen">{number(s.pollen)}</span> /{" "}
                {number(s.capacity)}
              </b>
            </div>
          </div>
        </div>
        <div className="top-actions">
          <button
            className="swarm-button"
            onClick={() => open("hive")}
            aria-label="Open hive"
          >
            <BeeIcon size={26} />
            <b data-testid="bee-count">{s.bees.length}</b>
          </button>
          <button
            className="round-button"
            aria-label="Open settings"
            onClick={() => open("settings")}
          >
            ⚙
          </button>
        </div>
      </header>
      <nav className="side-toolbar" aria-label="Game menus">
        {[
          { menu: "inventory", icon: "▣", label: "Inventory", key: "TAB" },
          { menu: "quests", icon: "!", label: "Quests", key: "Q" },
          { menu: "bees", icon: "bee", label: "Bees", key: "B" },
          { menu: "hive", icon: "⬡", label: "Hive", key: "H" },
          { menu: "map", icon: "⌁", label: "Map", key: "M" },
          { menu: "settings", icon: "⚙", label: "Settings", key: "ESC" },
        ].map((t) => (
          <button
            key={t.menu}
            onClick={() => open(t.menu as Menu)}
            title={`${t.label} (${t.key})`}
            aria-label={`Show ${t.label.toLowerCase()}`}
          >
            <span>{t.icon === "bee" ? <BeeIcon size={32} /> : t.icon}</span>
            <small>{t.label}</small>
          </button>
        ))}
      </nav>
      <aside className="quest-tracker">
        <h2>
          Quests{" "}
          <button
            onClick={() => open("quests")}
            aria-label="Open quest journal"
          >
            +
          </button>
        </h2>
        {Object.entries(s.accepted).length ? (
          Object.entries(s.accepted)
            .slice(0, 3)
            .map(([id, progress]) => {
              const q = QUESTS.find((q) => q.id === id)!;
              return (
                <button
                  key={id}
                  className="tracked-quest"
                  onClick={() => open("quests")}
                >
                  <b>
                    {PLACES.find((p) => p.id === q.npc)?.name}: {q.name}
                  </b>
                  {q.objectives.map((o, i) => (
                    <div key={i}>
                      <span>
                        {o.label}: {number(progress[i])}/{number(o.amount)}
                      </span>
                      <div className="progress">
                        <i
                          style={{
                            width: `${(progress[i] / o.amount) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </button>
              );
            })
        ) : (
          <p>
            Talk to Black Bear near Dandelion Field to get your first quest.
            <br />
            <br />
            Collect pollen, make honey, and grow your swarm.
          </p>
        )}
      </aside>
      <aside className="right-hud">
        <div className="field-location" data-testid="scene-status">
          {field?.name ?? "Hive Grounds"}
        </div>
        <button
          className="map-widget"
          onClick={() => open("map")}
          aria-label="Open world map"
        >
          <MountainMap mini />
        </button>
        <div className="health">
          <span>♥</span>
          <div>
            <i style={{ width: `${s.player.hp}%` }} />
          </div>
          <b>{Math.ceil(s.player.hp)}</b>
        </div>
        <small className="save-label">{saveStatus || "Autosave enabled"}</small>
      </aside>
      <div className="buffs">
        {s.buffs.map((b) => (
          <div key={b.kind}>
            <b>
              {b.kind} ×{b.value}
            </b>
            <span>{Math.ceil(b.remaining)}s</span>
          </div>
        ))}
      </div>
      {s.challenge && (
        <div className="challenge-banner">
          Clover Challenge: {number(s.challenge.gathered)} /{" "}
          {s.challenge.target} pollen · {Math.ceil(s.challenge.remaining)}s
        </div>
      )}
      <div className={`notification ${notice ? "visible" : ""}`} role="status">
        {s.notification}
      </div>
      <div className="interaction-area">
        {s.converting ? (
          <button
            className="interaction converting"
            onClick={() =>
              perform(() => {
                s.converting = false;
              })
            }
          >
            <kbd>F</kbd> Stop Making Honey
          </button>
        ) : near ? (
          <button className="interaction" onClick={interact}>
            <kbd>E</kbd>
            {near.kind === "npc"
              ? `Talk to ${near.name}`
              : near.kind === "shop" ||
                  near.kind === "eggs" ||
                  near.kind === "tickets"
                ? `Open ${near.name}`
                : near.name}
          </button>
        ) : pad && pad.index !== s.hive ? (
          <button className="interaction" onClick={interact}>
            <kbd>E</kbd>Claim Hive
          </button>
        ) : hive ? (
          <>
            <button
              className="interaction"
              disabled={s.pollen <= 0}
              onClick={() => perform(() => startConversion(s))}
            >
              <kbd>F</kbd>Make Honey
            </button>
            <button className="hive-manage" onClick={() => open("hive")}>
              E · Open Hive
            </button>
          </>
        ) : null}
      </div>
      <footer className="bottom-hud">
        <div className="control-hints">
          WASD · Move &nbsp; Space · Jump &nbsp; Hold click · Collect
          <br />
          Right-drag · Camera &nbsp; Scroll · Zoom
        </div>
        <nav className="hotbar" aria-label="Item hotbar">
          {slots.map((slot, i) => (
            <button
              className={i === 0 ? "selected-tool" : ""}
              key={slot.key}
              onClick={slot.fn}
              title={slot.label}
              aria-label={slot.label}
            >
              <span className="hotkey">{slot.key}</span>
              <GearArt type={slot.type} level={slot.level} />
              {slot.count !== undefined && (
                <b className="item-count">{slot.count}</b>
              )}
            </button>
          ))}
          {[
            { key: "7", label: "Inventory", icon: "▣", menu: "inventory" },
            { key: "8", label: "Hive", icon: "⬡", menu: "hive" },
            { key: "9", label: "Bees", icon: "bee", menu: "bees" },
            { key: "0", label: "Map", icon: "⌁", menu: "map" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => open(t.menu as Menu)}
              title={t.label}
              aria-label={t.label}
            >
              <span className="hotkey">{t.key}</span>
              {t.icon === "bee" ? (
                <BeeIcon size={32} />
              ) : (
                <span className="hotbar-icon">{t.icon}</span>
              )}
            </button>
          ))}
        </nav>
      </footer>
      <span className="sr-only" data-testid="player-height">
        {s.player.y.toFixed(1)}
      </span>
    </div>
  );
}
