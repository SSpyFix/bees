import { useEffect, useState } from "react";
import { useGame, sound } from "../game/systems/store";
import {
  atHive,
  currentField,
  interactPlace,
  nearestPlace,
  startConversion,
} from "../game/systems/simulation";
import { PLACES, TOOLS } from "../game/data/content";
import { BeeIcon, GearArt, HoneyIcon } from "./Icons";
import { MountainMap, number } from "./Menus";
export default function HUD() {
  const { game: s, menu, open, revision, saveStatus } = useGame();
  void revision;
  const f = currentField(s),
    near = nearestPlace(s),
    hive = atHive(s),
    pct = Math.min(100, (s.pollen / s.capacity) * 100),
    tool = TOOLS.find((t) => t.id === s.tool)!;
  const [notice, setNotice] = useState(true);
  useEffect(() => {
    setNotice(true);
    const t = setTimeout(() => setNotice(false), 5500);
    return () => clearTimeout(t);
  }, [s.noticeId]);
  useEffect(() => {
    const save = () => useGame.getState().save();
    window.addEventListener("pagehide", save);
    const hide = () => {
      if (document.visibilityState === "hidden") save();
    };
    document.addEventListener("visibilitychange", hide);
    return () => {
      window.removeEventListener("pagehide", save);
      document.removeEventListener("visibilitychange", hide);
    };
  }, []);
  const interact = () => {
    if (near) {
      if (["shop", "eggs", "npc"].includes(near.kind))
        open(near.kind as "shop" | "eggs" | "npc", near.id);
      else interactPlace(s, near.id);
    } else if (hive) open("hive");
    sound();
    useGame.getState().refresh();
    useGame.getState().save();
  };
  return (
    <div className={`hud ${menu ? "menu-is-open" : ""}`}>
      <header className="top-hud">
        <div className="brand">
          <div className="brand-mark">
            <BeeIcon size={43} />
          </div>
          <div>
            <div className="brand-overline">A SWARM-SIZED ADVENTURE</div>
            <h1>
              Pollen Peak<span aria-hidden="true">✦</span>
            </h1>
          </div>
        </div>
        <div className="resource-bar">
          <div className="resource honey">
            <HoneyIcon />
            <div>
              <span>YOUR HONEY</span>
              <strong data-testid="honey">{number(s.honey)}</strong>
            </div>
            <span className="resource-detail">a little liquid sunshine</span>
          </div>
          <div className="resource pollen">
            <div className="pollen-flower">❀</div>
            <div className="pollen-content">
              <div>
                <span>POLLEN PACK</span>
                <b>
                  <span data-testid="pollen">{number(s.pollen)}</span>
                  <em> / {number(s.capacity)}</em>
                </b>
              </div>
              <div className={`capacity-track ${pct > 95 ? "full" : ""}`}>
                <i style={{ width: `${pct}%` }} />
              </div>
            </div>
          </div>
        </div>
        <div className="top-actions">
          <button
            className="swarm-button"
            onClick={() => open("hive")}
            title="Your hive"
          >
            <BeeIcon size={25} />
            <b data-testid="bee-count">{s.bees.length}</b>
            <span>your swarm</span>
          </button>
          <button
            className="round-button"
            aria-label={s.settings.muted ? "Unmute sound" : "Mute sound"}
            onClick={() => {
              s.settings.muted = !s.settings.muted;
              useGame.getState().refresh();
            }}
          >
            {s.settings.muted ? "♩̸" : "♪"}
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
      <aside className="left-hud">
        <div className="location-label">
          <span className="location-dot" />
          <div>
            <span>YOU ARE EXPLORING</span>
            <strong data-testid="scene-status">
              {f?.name ?? "Meadow trails"}
            </strong>
          </div>
        </div>
        <section className="journal-widget">
          <header>
            <span>❧ FIELD NOTES</span>
            <button
              title="Quest journal (Q)"
              aria-label="Open quest journal"
              onClick={() => open("quests")}
            >
              ↗
            </button>
          </header>
          {Object.keys(s.accepted).length ? (
            Object.entries(s.accepted)
              .slice(0, 3)
              .map(([id, progress]) => (
                <QuestSummary key={id} id={id} progress={progress} />
              ))
          ) : (
            <>
              <div className="eyebrow">CHAPTER ONE</div>
              <h2>
                Small wings.
                <br />
                Big possibilities.
              </h2>
              <p>
                The mountain is full of little wonders. Let’s find your first
                one.
              </p>
              <ul className="first-steps">
                <li className={s.stats.pollen > 0 ? "done" : ""}>
                  <span>{s.stats.pollen > 0 ? "✓" : "1"}</span>Gather a little
                  pollen
                </li>
                <li className={s.stats.honey > 0 ? "done" : ""}>
                  <span>{s.stats.honey > 0 ? "✓" : "2"}</span>Make honey at your
                  hive
                </li>
                <li className={s.stats.spent > 0 ? "done" : ""}>
                  <span>{s.stats.spent > 0 ? "✓" : "3"}</span>Visit the Supply
                  Co.
                </li>
              </ul>
              <div className="keeper-hint">
                <span className="tiny-bear">♟</span>
                <div>
                  <b>Meet Juniper</b>
                  <small>
                    By the Dandelion Lawn
                    <br />
                    Press E to say hello.
                  </small>
                </div>
              </div>
            </>
          )}
        </section>
        <div className="altitude">
          <span>↟ {Math.max(0, Math.round(s.player.y))} m elevation</span>
          <span>{s.completed.length} stories told</span>
        </div>
      </aside>
      <aside className="right-hud">
        <button
          className="map-widget"
          onClick={() => open("map")}
          aria-label="Open world map"
        >
          <div>
            <span>THE MOUNTAIN</span>
            <kbd>M</kbd>
          </div>
          <MountainMap mini />
          <span className="map-caption">There’s a whole world up there. ↗</span>
        </button>
        <div className="health">
          <span>♥</span>
          <div>
            <i style={{ width: `${s.player.hp}%` }} />
          </div>
          <b>{Math.ceil(s.player.hp)}</b>
        </div>
      </aside>
      <div className="buffs">
        {s.buffs.map((b) => (
          <div key={b.kind}>
            <span>✧</span>
            <div>
              <b>
                {b.kind} ×{b.value}
              </b>
              <small>{Math.ceil(b.remaining)}s</small>
            </div>
          </div>
        ))}
      </div>
      {s.challenge && (
        <div className="challenge-banner">
          ❀ Clover Sprint{" "}
          <b>
            {number(s.challenge.gathered)} / {s.challenge.target} pollen
          </b>
          <span>{Math.ceil(s.challenge.remaining)}s</span>
        </div>
      )}
      <div className={`notification ${notice ? "visible" : ""}`} role="status">
        <span>✦</span>
        {s.notification}
      </div>
      <div className="interaction-area">
        {s.converting ? (
          <button
            className="interaction converting"
            onClick={() => {
              s.converting = false;
              useGame.getState().refresh();
            }}
          >
            <span className="keycap">F</span>
            <div>
              <b>Making a little sunshine…</b>
              <small>Move or press F to stop conversion</small>
            </div>
            <span>✦</span>
          </button>
        ) : near ? (
          <button className="interaction" onClick={interact}>
            <span className="keycap">E</span>
            <div>
              <b>
                {near.kind === "npc"
                  ? `Talk to ${near.name}`
                  : near.kind === "shop" || near.kind === "eggs"
                    ? `Browse ${near.name}`
                    : near.name}
              </b>
              <small>
                {near.kind === "npc"
                  ? near.role
                  : near.kind === "shop"
                    ? "Better gear for bigger adventures"
                    : near.kind === "eggs"
                      ? "A new friend is waiting to hatch"
                      : "A little help for your adventure"}
              </small>
            </div>
            <span>↗</span>
          </button>
        ) : hive ? (
          <div className="hive-prompts">
            <button
              className="interaction"
              onClick={() => {
                startConversion(s);
                useGame.getState().refresh();
              }}
              disabled={s.pollen <= 0}
            >
              <span className="keycap">F</span>
              <div>
                <b>
                  {s.pollen > 0
                    ? "Turn pollen into honey"
                    : "Your hive, sweet hive"}
                </b>
                <small>
                  {s.pollen > 0
                    ? `${number(s.pollen)} pollen ready to convert`
                    : "Gather flowers to fill your pollen pack"}
                </small>
              </div>
              <span>✦</span>
            </button>
            <button className="hive-manage" onClick={() => open("hive")}>
              E · Manage hive
            </button>
          </div>
        ) : null}
      </div>
      <footer className="bottom-hud">
        <div className="trail-tip">
          <span>✧ A LITTLE FIELD WISDOM</span>
          <p>
            {s.pollen >= s.capacity
              ? "Full pack? Follow the trail home."
              : s.bees.length < 5
                ? "Your bees gather on their own. Let them wander."
                : "More bees open more mountain trails."}
          </p>
        </div>
        <nav className="hotbar" aria-label="Adventure tools">
          <div className="selected-tool">
            <span className="hotkey">LMB</span>
            <GearArt type="tool" level={Number(s.tool.split("-")[1])} />
            <div>
              <b>{tool.name}</b>
              <small>Hold click to gather</small>
            </div>
          </div>
          <div className="hotbar-divider" />
          {[
            { key: "Q", icon: "▤", name: "Journal", menu: "quests" },
            { key: "TAB", icon: "▣", name: "Bag", menu: "inventory" },
            { key: "H", icon: "⬡", name: "Hive", menu: "hive" },
            { key: "M", icon: "⌁", name: "Map", menu: "map" },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() =>
                open(item.menu as "quests" | "inventory" | "hive" | "map")
              }
            >
              <span className="hotkey">{item.key}</span>
              <span className="hotbar-icon">{item.icon}</span>
              <span>{item.name}</span>
            </button>
          ))}
        </nav>
        <div className="control-hints">
          <span>
            <kbd>W A S D</kbd> Move <kbd>SPACE</kbd> Jump
          </span>
          <span>Right-drag to look · Scroll to zoom</span>
          <small title={saveStatus}>● Saved on this browser</small>
        </div>
      </footer>
      <span className="sr-only" data-testid="player-height">
        {s.player.y.toFixed(1)}
      </span>
    </div>
  );
}
import { QUESTS } from "../game/data/content";
function QuestSummary({ id, progress }: { id: string; progress: number[] }) {
  const q = QUESTS.find((x) => x.id === id)!;
  const open = useGame((s) => s.open);
  const ready = q.objectives.every((o, i) => progress[i] >= o.amount - 0.001);
  return (
    <button className="mini-quest" onClick={() => open("quests")}>
      <span className="eyebrow">
        {ready ? "READY TO CLAIM" : "A KEEPER’S REQUEST"}
      </span>
      <h3>{q.name}</h3>
      {q.objectives.map((o, i) => (
        <div key={i}>
          <span>
            {o.label}
            <b>
              {number(progress[i])} / {number(o.amount)}
            </b>
          </span>
          <div className="progress">
            <i style={{ width: `${(progress[i] / o.amount) * 100}%` }} />
          </div>
        </div>
      ))}
    </button>
  );
}
