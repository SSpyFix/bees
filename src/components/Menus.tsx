import TicketShop from "./TicketShop";
import ShopExperience from "./ShopExperience";
import InventoryPanel from "./InventoryPanel";
import BeeAbilities from "./BeeAbilities";
import AutoJelly from "./AutoJelly";
import { abilityNames } from "../game/data/abilities";
import { giftedStats } from "../game/systems/gifted";
import BeeIndex from "./BeeIndex";
import { useState } from "react";
import type { Menu } from "../game/systems/store";
import { useGame, sound } from "../game/systems/store";
import {
  BAGS,
  BEES,
  FIELDS,
  GEAR,
  HIVE_PADS,
  PLACES,
  PLATFORMS,
  QUESTS,
  RAMPS,
  RARITY_COLORS,
} from "../game/data/content";
import {
  acceptQuest,
  atHive,
  releaseBee,
  beeDefinition,
  buy,
  buySlot,
  maxPurchase,
  makeGifted,
  claimQuest,
  eggCost,
  feed,
  hatch,
  interactPlace,
  questReady,
  replayQuest,
  reroll,
  slotCost,
  useItem,
} from "../game/systems/simulation";
import { BeeIcon, GearArt, HoneyIcon } from "./Icons";
import type { Game } from "../game/systems/types";
export const number = (n: number) =>
  n >= 1e6
    ? `${(n / 1e6).toFixed(1)}m`
    : n >= 1e4
      ? `${(n / 1000).toFixed(1)}k`
      : Math.floor(n).toLocaleString();
function action(fn: () => unknown) {
  fn();
  const s = useGame.getState();
  s.refresh();
  s.save();
  sound(780);
}
export function QuestCard({
  id,
  allowAccept = false,
}: {
  id: string;
  allowAccept?: boolean;
}) {
  const s = useGame((g) => g.game);
  useGame((g) => g.revision);
  const q = QUESTS.find((x) => x.id === id)!;
  const active = !!s.accepted[id],
    done = s.completed.includes(id),
    ready = questReady(s, id);
  return (
    <article className={`quest-card ${ready ? "ready" : ""}`}>
      <div className="eyebrow">
        {PLACES.find((p) => p.id === q.npc)?.name}’s request{" "}
        {done && " · COMPLETE"}
      </div>
      <h3>{q.name}</h3>
      {allowAccept && <p>{q.dialogue}</p>}
      {q.objectives.map((o, i) => (
        <div
          className={`objective quest-objective ${done || (active && s.accepted[id][i] >= o.amount) ? "complete" : ""}`}
          key={i}
        >
          <div>
            <span>{o.label}</span>
            <b>
              {number(active ? s.accepted[id][i] : done ? o.amount : 0)} /{" "}
              {number(o.amount)}
            </b>
          </div>
          <div className="progress">
            <i
              style={{
                width: `${Math.min(100, ((active ? s.accepted[id][i] : done ? o.amount : 0) / o.amount) * 100)}%`,
              }}
            />
          </div>
        </div>
      ))}
      <div className="quest-reward">
        <span>
          ✦ {number(q.honey)} honey {q.egg > 0 && " · 🥚 1 egg"} · {q.treat}{" "}
          treats · {5 + q.gate} tickets
        </span>
        {ready ? (
          <button
            className="button small"
            onClick={() => action(() => claimQuest(s, id))}
          >
            Claim reward
          </button>
        ) : !active && !done && allowAccept ? (
          <button
            className="button small"
            onClick={() => action(() => acceptQuest(s, id))}
          >
            Accept quest
          </button>
        ) : done && q.repeat && allowAccept ? (
          <button
            className="button small secondary"
            onClick={() => action(() => replayQuest(s, id))}
          >
            Play again
          </button>
        ) : active ? (
          <span className="subtle">In progress</span>
        ) : null}
      </div>
    </article>
  );
}
function Hive() {
  const s = useGame((g) => g.game);
  useGame((g) => g.revision);
  const [selected, setSelected] = useState(s.bees[0].id);
  const [releaseConfirm, setReleaseConfirm] = useState(false);
  const b = s.bees.find((b) => b.id === selected) ?? s.bees[0],
    def = beeDefinition(b);
  return (
    <>
      <div className="hive-tools">
        <span>
          <b>{s.bees.length}</b> {s.bees.length === 1 ? "bee" : "bees"} ·{" "}
          <b>{s.slots}</b> hive slots · <b>{s.inventory.egg}</b> eggs
        </span>
        <button
          className="button small"
          disabled={s.inventory.egg < 1 || s.bees.length >= s.slots}
          onClick={() => action(() => hatch(s))}
        >
          🥚 Hatch an egg
        </button>
        <button
          className="button small secondary"
          disabled={s.honey < slotCost(s) || s.slots >= 50}
          onClick={() => action(() => buySlot(s))}
        >
          + Hive slot · ✦ {number(slotCost(s))}
        </button>
      </div>
      {s.balloonPollen > 0 && (
        <p className="menu-intro">
          Balloon pollen at hive: {Math.floor(s.balloonPollen).toLocaleString()}{" "}
          · Press F at your hive to convert.
        </p>
      )}
      <div className="hive-layout">
        <div className="honeycomb">
          {Array.from({ length: Math.max(15, s.slots) }, (_, i) => {
            const bee = s.bees[i],
              d = bee ? beeDefinition(bee) : null;
            return (
              <button
                key={i}
                className={`hex ${bee?.gifted ? "gifted" : ""} ${bee?.id === b.id ? "active" : ""} ${i >= s.slots ? "locked" : ""}`}
                style={
                  d
                    ? ({ "--bee-color": d.body } as React.CSSProperties)
                    : undefined
                }
                disabled={!bee}
                onClick={() => setSelected(bee.id)}
                aria-label={
                  d
                    ? `Inspect ${d.name} level ${bee!.level}`
                    : i >= s.slots
                      ? "Locked hive slot"
                      : "Empty hive slot"
                }
              >
                {d ? (
                  <>
                    <BeeIcon face={d.face} color={d.body} />
                    <span>
                      {bee!.gifted ? "★ " : ""}Lv. {bee!.level}
                    </span>
                  </>
                ) : (
                  <span>{i >= s.slots ? "♧" : "+"}</span>
                )}
              </button>
            );
          })}
        </div>
        <aside className="bee-detail">
          <span
            className="rarity"
            style={{ background: RARITY_COLORS[def.rarity] }}
          >
            {def.rarity}
          </span>
          <div className="big-bee">
            <BeeIcon face={def.face} color={def.body} size={96} />
          </div>
          <h3>
            {b.gifted ? "Gifted " : ""}
            {def.name}
          </h3>
          <p>
            Level {b.level} · Loves {def.color} pollen
          </p>
          <div className="stat-table">
            <span>
              Gather
              <b>
                {(
                  def.gather *
                  giftedStats(b) *
                  (1 + (b.level - 1) * 0.2)
                ).toFixed(1)}
              </b>
            </span>
            <span>
              Gather interval<b>{def.interval.toFixed(1)}s</b>
            </span>
            <span>
              Attack
              <b>
                {(def.attack > 0
                  ? (def.attack + b.level * 1.5) * giftedStats(b)
                  : 0
                ).toFixed(1)}
              </b>
            </span>
            <span>
              Convert<b>{def.conversion * b.level * giftedStats(b)}/s</b>
            </span>
            <span>
              Energy
              <b>
                {Math.ceil(b.energy)} / {def.energy}
              </b>
            </span>
            <span>
              Ability<b>{abilityNames(def, b.gifted)}</b>
            </span>
            <span>
              Current state<b>{b.state}</b>
            </span>
          </div>
          <div className="objective">
            <div>
              <span>Bond to next level</span>
              <b>
                {Math.floor(b.bond)} / {Math.ceil(30 * b.level ** 1.5)}
              </b>
            </div>
            <div className="progress">
              <i
                style={{ width: `${(b.bond / (30 * b.level ** 1.5)) * 100}%` }}
              />
            </div>
          </div>
          <button
            className="button"
            disabled={s.inventory.treat < 1}
            onClick={() => action(() => feed(s, b.id))}
          >
            Feed a treat · {s.inventory.treat} left
          </button>
          <button
            className="button secondary"
            disabled={
              s.inventory.jelly < 1 ||
              def.rarity === "Event" ||
              !!s.jellyRun?.running
            }
            onClick={() => action(() => reroll(s, b.id))}
          >
            Use Royal Jelly · {s.inventory.jelly.toLocaleString()} left
          </button>
          <button
            className="button secondary"
            disabled={
              b.gifted || s.inventory.starTreat < 1 || !!s.jellyRun?.running
            }
            onClick={() => action(() => makeGifted(s, b.id))}
          >
            ★ Make gifted · {s.inventory.starTreat.toLocaleString()} Star Treats
            left
          </button>
          <AutoJelly />
          <BeeAbilities bee={def} gifted={b.gifted} />
          {releaseConfirm ? (
            <div className="release-confirm">
              <p>
                Release {def.name}? Its level and bond will be lost. Your hive
                slot stays open.
              </p>
              <button
                className="button danger"
                onClick={() => {
                  action(() => releaseBee(s, b.id));
                  setReleaseConfirm(false);
                }}
              >
                Confirm release
              </button>
              <button
                className="text-button"
                onClick={() => setReleaseConfirm(false)}
              >
                Keep this bee
              </button>
            </div>
          ) : (
            <button
              className="text-button release-bee"
              disabled={s.bees.length <= 1 || !atHive(s)}
              onClick={() => setReleaseConfirm(true)}
            >
              Release bee {atHive(s) ? "" : "· at hive only"}
            </button>
          )}
        </aside>
      </div>
    </>
  );
}
function Journal() {
  const s = useGame((g) => g.game);
  useGame((g) => g.revision);
  const active = Object.keys(s.accepted);
  return (
    <>
      <p className="menu-intro">
        Good things grow one little task at a time. Visit the mountain keepers
        to discover their stories.
      </p>
      {active.length === 0 && (
        <div className="empty-state">
          <span>❀</span>
          <h3>A fresh page</h3>
          <p>
            Visit Black Bear near Dandelion Field. Press E to talk and accept
            your first quest.
          </p>
        </div>
      )}
      <div className="quest-grid">
        {active.map((id) => (
          <QuestCard key={id} id={id} />
        ))}
      </div>
      <h3 className="section-title">Mountain keepers</h3>
      <div className="keeper-list">
        {PLACES.filter((p) => p.kind === "npc").map((p) => (
          <div key={p.id}>
            <span style={{ background: p.accent }}>♟</span>
            <div>
              <b>{p.name}</b>
              <small>
                {p.role} ·{" "}
                {s.completed.filter((id) => id.startsWith(p.id)).length}/5
                stories
              </small>
            </div>
            <em>{p.gate ? `${p.gate} bee trail` : "Meadow trails"}</em>
          </div>
        ))}
      </div>
    </>
  );
}
function NPC() {
  const s = useGame((g) => g.game);
  useGame((g) => g.revision);
  const placeId = useGame((g) => g.placeId);
  const p = PLACES.find((x) => x.id === placeId)!;
  const quests = QUESTS.filter((q) => q.npc === p.id);
  const next = quests.find((q) => !s.completed.includes(q.id));
  const repeat = quests.at(-1)!;
  return (
    <>
      <div className="npc-greeting">
        <span style={{ background: p.accent }}>♟</span>
        <div>
          <div className="eyebrow">{p.role}</div>
          <h3>“There you are, little keeper.”</h3>
          <p>
            {next?.dialogue ??
              "Look at everything you and your bees have accomplished. There is always more to discover."}
          </p>
        </div>
      </div>
      {next ? (
        <QuestCard id={next.id} allowAccept />
      ) : (
        <>
          <p>
            You have completed all my stories. Would you like another challenge?
          </p>
          <QuestCard id={repeat.id} allowAccept />
        </>
      )}
    </>
  );
}
export function MountainMap({ mini = false }: { mini?: boolean }) {
  const s = useGame((g) => g.game);
  useGame((g) => g.revision);
  return (
    <svg
      className={mini ? "mini-map" : "mountain-map"}
      viewBox="-90 -255 190 345"
      role="img"
      aria-label="World map showing fields, trails, gates and your current position"
    >
      <rect x="-90" y="-255" width="190" height="345" rx="10" fill="#e3e6c9" />
      {PLATFORMS.map((p, i) => (
        <rect
          key={i}
          x={p.x - p.w / 2}
          y={p.z - p.d / 2}
          width={p.w}
          height={p.d}
          fill={
            ["#b2c58e", "#a5b77f", "#9bae7b", "#b7bf81", "#bdc194", "#bac9a2"][
              i
            ]
          }
          stroke="#8da078"
          strokeWidth="1.2"
          rx="2"
        />
      ))}
      {RAMPS.map((r, i) => (
        <g key={i}>
          <path
            d={`M${r.x} ${r.startZ}V${r.endZ}`}
            stroke="#f5e6b9"
            strokeWidth="6"
          />
          <circle
            cx={r.x}
            cy={r.gateZ}
            r={4}
            fill={s.bees.length >= r.gate ? "#537c5b" : "#b58a5d"}
          />
          {!mini && (
            <text
              x={r.x}
              y={r.gateZ + 1.5}
              textAnchor="middle"
              fill="white"
              fontSize="4"
            >
              {r.gate}
            </text>
          )}
        </g>
      ))}
      {FIELDS.map((f) => (
        <g key={f.id} opacity={s.bees.length >= f.gate ? 1 : 0.5}>
          <rect
            x={f.x - 10}
            y={f.z - 10}
            width={20}
            height={20}
            rx="1.5"
            fill={
              f.colors[1] > 0.5
                ? "#d5a698"
                : f.colors[2] > 0.5
                  ? "#9dbabd"
                  : "#e0cc8b"
            }
            stroke="#ffffff77"
          />
          {!mini && (
            <text
              x={f.x}
              y={f.z + 0.8}
              textAnchor="middle"
              fontSize="3.5"
              fill="#34523e"
            >
              {f.name.split(" ")[0]}
            </text>
          )}
        </g>
      ))}
      {!mini &&
        PLACES.map((p) => (
          <circle
            key={p.id}
            cx={p.x}
            cy={p.z}
            r="1.6"
            fill={p.kind === "npc" ? "#8d7157" : "#647f6b"}
          />
        ))}
      {HIVE_PADS.map((h) => (
        <rect
          key={h.index}
          x={h.x - 6}
          y={h.z - 4}
          width="12"
          height="6"
          fill={h.index === s.hive ? "#ffe000" : "#d1a75c"}
        />
      ))}
      <circle
        data-testid={mini ? "map-player" : undefined}
        cx={s.player.x}
        cy={s.player.z}
        r={mini ? 4 : 3}
        fill="#2f5c4b"
        stroke="#fff6d9"
        strokeWidth="1.4"
      />
      <path
        d="M-82 62v-12m-3 4 3-4 3 4"
        stroke="#748868"
        fill="none"
        strokeWidth="1"
      />
      <text x="-82" y="68" fontSize="5" textAnchor="middle" fill="#748868">
        N
      </text>
    </svg>
  );
}
function MapMenu() {
  const s = useGame((g) => g.game);
  useGame((g) => g.revision);
  return (
    <div className="map-layout">
      <MountainMap />
      <aside>
        <div className="eyebrow">ONE MOUNTAIN · MANY LITTLE ADVENTURES</div>
        <h3>Find your next favorite meadow.</h3>
        <p>
          Follow the cream trails up the mountain. Grow your hive to open new
          paths.
        </p>
        {[0, 5, 10, 15, 25, 35].map((n) => (
          <div className="map-region" key={n}>
            <span className={s.bees.length >= n ? "open" : "closed"}>
              {s.bees.length >= n ? "✓" : "♧"}
            </span>
            <div>
              <b>{n === 0 ? "Meadow trails" : `${n}-bee trails`}</b>
              <small>
                {FIELDS.filter((f) => f.gate === n)
                  .map((f) => f.name.split(" ")[0])
                  .join(" · ")}
              </small>
            </div>
          </div>
        ))}
        <p className="map-legend">
          ● You &nbsp; ◼ Flower fields &nbsp; · Shops & keepers
          <br />
          Walk the branching ramps or use the cannons.
        </p>
      </aside>
    </div>
  );
}
function Settings() {
  const s = useGame((g) => g.game),
    save = useGame((g) => g.save),
    reset = useGame((g) => g.reset),
    status = useGame((g) => g.saveStatus);
  useGame((g) => g.revision);
  const [confirm, setConfirm] = useState(false);
  return (
    <>
      <p className="menu-intro">
        A quiet moment on the mountain. Your adventure is paused.
      </p>
      <div className="settings-grid">
        <label>
          Sound effects{" "}
          <input
            type="checkbox"
            checked={!s.settings.muted}
            onChange={(e) =>
              action(() => {
                s.settings.muted = !e.target.checked;
              })
            }
          />
        </label>
        <label>
          Volume{" "}
          <input
            type="range"
            min="0"
            max="1"
            step=".05"
            value={s.settings.volume}
            onChange={(e) => {
              s.settings.volume = Number(e.target.value);
              useGame.getState().refresh();
            }}
          />
        </label>
        <label>
          Camera sensitivity{" "}
          <input
            type="range"
            min=".3"
            max="2"
            step=".1"
            value={s.settings.sensitivity}
            onChange={(e) => {
              s.settings.sensitivity = Number(e.target.value);
              useGame.getState().refresh();
            }}
          />
        </label>
        <label>
          Graphics{" "}
          <select
            value={s.settings.quality}
            onChange={(e) =>
              action(() => {
                s.settings.quality = e.target.value as "high" | "low";
              })
            }
          >
            <option value="high">High · soft shadows</option>
            <option value="low">Low · lighter rendering</option>
          </select>
        </label>
      </div>
      <AutoJelly settings />
      <div className="settings-save">
        <div>
          <h3>Your mountain, remembered.</h3>
          <p>
            Autosaves every 15 seconds and after purchases. Stored in this
            browser.
          </p>
          <small>{status}</small>
        </div>
        <button className="button" onClick={save}>
          Save adventure
        </button>
      </div>
      <div className="controls-grid">
        {[
          ["W A S D", "Move"],
          ["SPACE", "Jump"],
          ["HOLD CLICK", "Gather pollen"],
          ["RIGHT DRAG", "Orbit camera"],
          ["SCROLL", "Zoom"],
          ["E", "Talk / interact"],
          ["F", "Make honey at hive"],
          ["Q", "Quest journal"],
          ["TAB", "Inventory"],
          ["M", "World map"],
        ].map(([key, label]) => (
          <div key={key}>
            <kbd>{key}</kbd>
            <span>{label}</span>
          </div>
        ))}
      </div>
      <div className="danger-zone">
        {confirm ? (
          <>
            <p>
              Start over? Your bees, honey, and quests in this browser will be
              permanently reset.
            </p>
            <button
              className="button danger"
              onClick={() => {
                reset();
                save();
              }}
            >
              Yes, start a new adventure
            </button>
            <button
              className="button secondary"
              onClick={() => setConfirm(false)}
            >
              Keep my adventure
            </button>
          </>
        ) : (
          <button className="text-button" onClick={() => setConfirm(true)}>
            Reset saved adventure
          </button>
        )}
      </div>
    </>
  );
}
function MenuPanel({
  menu,
  placeId,
  background = false,
}: {
  menu: Exclude<Menu, null>;
  placeId: string;
  background?: boolean;
}) {
  const open = useGame((s) => s.open);
  const titles = {
    shop: PLACES.find((p) => p.id === placeId)?.name ?? "Basic Shop",
    eggs: "Basic Egg Shop",
    tickets: "Ticket Tent",
    hive: "Your Hive",
    bees: "Bees",
    quests: "Quests",
    inventory: "Inventory",
    map: "World Map",
    settings: "Settings",
    npc: PLACES.find((p) => p.id === placeId)?.name ?? "Mountain keeper",
  };
  return (
    <div
      className={`modal-backdrop reference-ui ui-${menu} ${background ? "shop-background" : ""}`}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={() => open(null)}
    >
      <section
        className={`modal modal-${menu}`}
        role={background ? "region" : "dialog"}
        aria-modal={
          background
            ? undefined
            : menu !== "inventory" && menu !== "quests" && menu !== "bees"
        }
        aria-labelledby={`${menu}-title`}
        onClick={(e) => e.stopPropagation()}
      >
        {(menu === "shop" || menu === "eggs") && (
          <button
            className="leave-shop"
            onClick={() => {
              useGame.getState().leaveShop();
              useGame.getState().save();
            }}
          >
            <kbd>E</kbd> Leave Shop
          </button>
        )}
        <header className="modal-header">
          <div>
            <span className="eyebrow">
              BEE SWARM SIMULATOR ·{" "}
              {menu === "shop" || menu === "eggs"
                ? "MOUNTAIN MERCHANTS"
                : menu === "npc"
                  ? "A KEEPER’S STORY"
                  : "YOUR ADVENTURE"}
            </span>
            <h2 id={`${menu}-title`}>{titles[menu]}</h2>
          </div>
          <button
            className="close-button"
            aria-label={background ? "Close shop" : "Close menu"}
            onClick={() => {
              if (background) useGame.getState().leaveShop();
              else open(null);
              useGame.getState().save();
            }}
          >
            ×
          </button>
        </header>
        <div className="modal-content">
          {menu === "tickets" ? (
            <TicketShop />
          ) : menu === "bees" ? (
            <BeeIndex />
          ) : menu === "shop" ? (
            <ShopExperience key={placeId} placeIdOverride={placeId} />
          ) : menu === "eggs" ? (
            <ShopExperience consumables />
          ) : menu === "hive" ? (
            <Hive />
          ) : menu === "quests" ? (
            <Journal />
          ) : menu === "inventory" ? (
            <InventoryPanel />
          ) : menu === "map" ? (
            <MapMenu />
          ) : menu === "npc" ? (
            <NPC />
          ) : (
            <Settings />
          )}
        </div>
        <footer className="modal-bottom">
          <span>Bee Swarm Simulator · Browser recreation</span>
          <button className="text-button" onClick={() => open(null)}>
            ESC · Back to game
          </button>
        </footer>
      </section>
    </div>
  );
}

export default function Menus() {
  const { menu, placeId, shopContext } = useGame();
  return (
    <>
      {shopContext && (
        <MenuPanel
          menu={shopContext.menu}
          placeId={shopContext.placeId}
          background={menu !== shopContext.menu}
        />
      )}
      {menu && menu !== "shop" && menu !== "eggs" && (
        <MenuPanel menu={menu} placeId={placeId} />
      )}
    </>
  );
}
