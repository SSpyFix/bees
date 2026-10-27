import TokenIcon from "./TokenIcon";
import { MenuIcon, ItemIcon } from "./GameIcons";
import { ABILITIES } from "../game/data/abilities";
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
  const { game: s, menu, open, revision, saveStatus, shopContext } = useGame();
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
    <div
      className={`hud ${menu ? "menu-is-open" : ""} ${shopContext ? "in-shop" : ""}`}
    >
      <h1 className="sr-only">Bee Swarm Simulator</h1>
      <header className="top-hud">
        <div className="resource-bar">
          <div className="resource honey">
            <span className="resource-name">Honey</span>
            <strong data-testid="honey">
              {Math.floor(s.honey).toLocaleString()}
            </strong>
          </div>
          <div className="resource pollen">
            <span className="resource-name">Pollen</span>
            <div className="capacity-track">
              <i
                style={{
                  width: `${Math.min(100, (s.pollen / s.capacity) * 100)}%`,
                }}
              />
            </div>
            <b>
              <span data-testid="pollen">
                {Math.floor(s.pollen).toLocaleString()}
              </span>
              /{Math.floor(s.capacity).toLocaleString()}
            </b>
          </div>
        </div>
      </header>
      <div className="system-buttons">
        <button aria-label="Open hive" onClick={() => open("hive")}>
          <BeeIcon size={22} />
          <b data-testid="bee-count">{s.bees.length}</b>
        </button>
        <button aria-label="Open settings" onClick={() => open("settings")}>
          ☰
        </button>
      </div>
      <div className="buffs">
        {s.buffs.map((b) => (
          <div
            key={b.kind}
            title={`${ABILITIES[b.kind]?.name ?? b.kind}: ${Math.ceil(b.remaining)}s`}
          >
            <TokenIcon kind={b.kind} size={26} />
            <span>×{Number(b.value.toFixed(2))}</span>
          </div>
        ))}
      </div>
      <nav className="side-toolbar" aria-label="Game menus">
        {[
          { menu: "inventory", label: "Inventory", icon: "inventory" },
          { menu: "quests", label: "Quests", icon: "quests" },
          { menu: "bees", label: "Bees", icon: "bees" },
          { menu: "hive", label: "Hive", icon: "hive" },
          { menu: "settings", label: "Settings", icon: "settings" },
          { menu: "map", label: "Map", icon: "map" },
        ].map((t) => (
          <button
            key={t.menu}
            title={t.label}
            aria-label={`Show ${t.label.toLowerCase()}`}
            className={menu === t.menu ? "active" : ""}
            onClick={() => open(menu === t.menu ? null : (t.menu as Menu))}
          >
            <MenuIcon kind={t.icon} />
          </button>
        ))}
        <button
          title="Nearby shop"
          aria-label="Open nearby shop"
          onClick={() => {
            if (near && ["shop", "eggs", "tickets"].includes(near.kind))
              interact();
            else
              perform(() => {
                s.notification =
                  "Walk to a shop and press E to browse its items.";
                s.noticeId++;
              });
          }}
        >
          <MenuIcon kind="shop" />
        </button>
      </nav>
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
            <kbd>F</kbd>Stop Making Honey
          </button>
        ) : near ? (
          <button className="interaction" onClick={interact}>
            <kbd>E</kbd>
            {near.kind === "npc"
              ? `Talk to ${near.name}`
              : ["shop", "eggs", "tickets"].includes(near.kind)
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
              disabled={s.pollen <= 0 && s.balloonPollen <= 0}
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
        <nav className="hotbar" aria-label="Item hotbar">
          {slots.map((slot, i) => (
            <button
              key={slot.key}
              aria-label={slot.label}
              title={slot.label}
              onClick={slot.fn}
              className={i === 0 ? "selected-tool" : ""}
            >
              <span className="hotkey">{slot.key}</span>
              {i === 0 ? (
                <GearArt type="tool" level={slot.level} />
              ) : (
                <ItemIcon
                  id={
                    ["tool", "egg", "booster", "converter", "treat", "jelly"][i]
                  }
                />
              )}
              <b className="item-count">
                {slot.count === undefined ? "" : number(slot.count)}
              </b>
            </button>
          ))}
          {[
            {
              key: "7",
              label: "Inventory",
              icon: "inventory",
              menu: "inventory",
            },
            { key: "8", label: "Hive", icon: "hive", menu: "hive" },
            { key: "9", label: "Bees", icon: "bees", menu: "bees" },
            { key: "0", label: "Map", icon: "map", menu: "map" },
          ].map((t) => (
            <button
              key={t.key}
              aria-label={t.label}
              title={t.label}
              onClick={() => open(t.menu as Menu)}
            >
              <span className="hotkey">{t.key}</span>
              <MenuIcon kind={t.icon} />
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
