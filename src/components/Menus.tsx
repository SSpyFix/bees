import { useState } from "react";
import { useGame, sound } from "../game/systems/store";
import {
  BAGS,
  BEES,
  FIELDS,
  GEAR,
  HIVE,
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
        <div className="objective" key={i}>
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
          treats
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
function Shop() {
  const s = useGame((g) => g.game);
  useGame((g) => g.revision);
  const placeId = useGame((g) => g.placeId);
  const [tab, setTab] = useState("tool");
  const tier = PLACES.find((p) => p.id === placeId)?.gate ?? 0;
  const items = GEAR.filter(
    (g) =>
      (tab === "other"
        ? g.type === "boots" || g.type === "hat"
        : g.type === tab) &&
      g.gate <= (tier === 0 ? 5 : tier === 10 ? 15 : tier === 25 ? 25 : 35),
  );
  return (
    <>
      <div className="shop-banner">
        <span className="illustration">
          <GearArt type="tool" level={2} />
        </span>
        <div>
          <h3>Good gear. Greater adventures.</h3>
          <p>Every upgrade makes a difference out in the meadow.</p>
        </div>
        <div className="wallet">
          <HoneyIcon />
          {number(s.honey)}
        </div>
      </div>
      <div className="tabs">
        {[
          ["tool", "Collectors"],
          ["bag", "Backpacks"],
          ["other", "Outfits"],
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
      <div className="shop-grid">
        {items.map((g) => {
          const owned = s.owned.includes(g.id),
            equipped = [s.tool, s.bag, s.boots, s.hat].includes(g.id),
            locked = s.bees.length < g.gate;
          return (
            <article className="item-card" key={g.id}>
              <div className="item-art">
                <GearArt type={g.type} level={Number(g.id.split("-")[1])} />
                <span className="item-tier">
                  {g.gate ? `${g.gate} BEE GEAR` : "MEADOW ESSENTIAL"}
                </span>
              </div>
              <h3>{g.name}</h3>
              <p>{g.description}</p>
              <div className="item-stats">
                {g.range && (
                  <>
                    <span>
                      Reach <b>{g.range.toFixed(1)}m</b>
                    </span>
                    <span>
                      Power <b>{g.power?.toFixed(1)}</b>
                    </span>
                    <span>
                      Pattern <b>{g.shape}</b>
                    </span>
                  </>
                )}
                {g.capacity && (
                  <>
                    <span>
                      Capacity <b>{number(g.capacity)}</b>
                    </span>
                    <span>
                      Conversion <b>×{g.convert?.toFixed(1)}</b>
                    </span>
                  </>
                )}
                {g.speed && (
                  <span>
                    Movement <b>×{g.speed}</b>
                  </span>
                )}
                {g.type === "hat" && (
                  <span>
                    Pollen <b>×{g.power}</b>
                  </span>
                )}
              </div>
              <button
                className={`button ${equipped ? "equipped" : owned ? "secondary" : ""}`}
                disabled={equipped || locked || (!owned && s.honey < g.cost)}
                onClick={() => action(() => buy(s, g.id))}
              >
                {equipped
                  ? "✓ Equipped"
                  : locked
                    ? `${g.gate} bees required`
                    : owned
                      ? "Equip"
                      : `✦ ${number(g.cost)} · Buy & equip`}
              </button>
            </article>
          );
        })}
      </div>
    </>
  );
}
function EggShop() {
  const s = useGame((g) => g.game);
  useGame((g) => g.revision);
  const items = [
    {
      id: "egg",
      name: "Meadow Egg",
      cost: eggCost(s),
      description:
        "A new friend, waiting to hatch. Common through Special rarity. Prices grow with your swarm.",
      type: "egg",
    },
    {
      id: "treat",
      name: "Clover Treat",
      cost: 12,
      description:
        "Feed a bee for 25 bond and a little energy. Bond unlocks stronger levels.",
      type: "bag",
    },
    {
      id: "jelly",
      name: "Royal Nectar",
      cost: 180,
      description:
        "Transform a bee into a new Rare or better species. Keeps its level.",
      type: "egg",
    },
    {
      id: "booster",
      name: "Flower Tonic",
      cost: 120,
      description:
        "Double all pollen collection for 60 seconds. Use from your inventory.",
      type: "tool",
    },
    {
      id: "converter",
      name: "Pocket Converter",
      cost: 90,
      description:
        "Instantly turn your carried pollen into honey, wherever you are.",
      type: "bag",
    },
  ];
  return (
    <>
      <p className="menu-intro">
        A tiny egg. An extraordinary possibility. Your hive has room for{" "}
        {s.slots - s.bees.length} more{" "}
        {s.slots - s.bees.length === 1 ? "bee" : "bees"}.
      </p>
      <div className="shop-grid">
        {items.map((x, i) => (
          <article className="item-card" key={x.id}>
            <div className="item-art">
              <GearArt type={x.type} level={i} />
              <span className="item-tier">OWNED · {s.inventory[x.id]}</span>
            </div>
            <h3>{x.name}</h3>
            <p>{x.description}</p>
            <button
              className="button"
              disabled={s.honey < x.cost}
              onClick={() => action(() => buy(s, x.id))}
            >
              ✦ {number(x.cost)} · Buy
            </button>
          </article>
        ))}
      </div>
      <div className="menu-footer">
        <span>
          Meadow Egg odds: Common 45% · Rare 30% · Epic 16% · Legendary 7% ·
          Mythic 1.8% · Special 0.2%
        </span>
      </div>
    </>
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
          <b>{s.bees.length}</b> bees · <b>{s.slots}</b> hive slots ·{" "}
          <b>{s.inventory.egg}</b> eggs
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
      <div className="hive-layout">
        <div className="honeycomb">
          {Array.from({ length: Math.max(15, s.slots) }, (_, i) => {
            const bee = s.bees[i],
              d = bee ? beeDefinition(bee) : null;
            return (
              <button
                key={i}
                className={`hex ${bee?.id === b.id ? "active" : ""} ${i >= s.slots ? "locked" : ""}`}
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
                    <BeeIcon color={d.body} />
                    <span>Lv. {bee!.level}</span>
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
            <BeeIcon color={def.body} size={96} />
          </div>
          <h3>{def.name}</h3>
          <p>
            Level {b.level} · Loves {def.color} pollen
          </p>
          <div className="stat-table">
            <span>
              Gather<b>{(def.gather * (1 + (b.level - 1) * 0.2)).toFixed(1)}</b>
            </span>
            <span>
              Gather interval<b>{def.interval.toFixed(1)}s</b>
            </span>
            <span>
              Attack<b>{(def.attack + b.level * 1.5).toFixed(1)}</b>
            </span>
            <span>
              Convert<b>{def.conversion * b.level}/s</b>
            </span>
            <span>
              Energy
              <b>
                {Math.ceil(b.energy)} / {def.energy}
              </b>
            </span>
            <span>
              Ability<b>{def.ability}</b>
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
            disabled={s.inventory.jelly < 1 || def.rarity === "Special"}
            onClick={() => action(() => reroll(s, b.id))}
          >
            Use Royal Nectar · {s.inventory.jelly} left
          </button>
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
function Inventory() {
  const s = useGame((g) => g.game);
  useGame((g) => g.revision);
  const descriptions: Record<string, [string, string, string]> = {
    egg: ["Meadow Egg", "Hatch a new friend into an empty hive slot.", "Hatch"],
    treat: [
      "Clover Treat",
      "Give 25 bond to your first bee. Use Hive to choose a different bee.",
      "Feed first bee",
    ],
    jelly: [
      "Royal Nectar",
      "Transform your first bee. Use Hive to choose a different bee.",
      "Transform first bee",
    ],
    booster: [
      "Flower Tonic",
      "Double pollen collection for 60 seconds.",
      "Drink tonic",
    ],
    converter: [
      "Pocket Converter",
      "Instantly convert all carried pollen into honey.",
      "Convert pollen",
    ],
  };
  return (
    <>
      <p className="menu-intro">
        A few useful things for the trail. All consumables are used once.
      </p>
      <div className="inventory-list">
        {Object.entries(descriptions).map(
          ([id, [name, description, label]], i) => (
            <article className="inventory-item" key={id}>
              <div className="inventory-art">
                <GearArt type={id === "egg" ? "egg" : "bag"} level={i} />
              </div>
              <div>
                <h3>
                  {name} <span className="count">× {s.inventory[id]}</span>
                </h3>
                <p>{description}</p>
              </div>
              <button
                className="button small"
                disabled={
                  s.inventory[id] < 1 ||
                  (id === "egg" && s.bees.length >= s.slots) ||
                  (id === "converter" && s.pollen === 0)
                }
                onClick={() =>
                  action(() =>
                    id === "treat"
                      ? feed(s, s.bees[0].id)
                      : id === "jelly"
                        ? reroll(s, s.bees[0].id)
                        : useItem(s, id),
                  )
                }
              >
                {label}
              </button>
            </article>
          ),
        )}
      </div>
      <div className="collection-roster">
        <h3>
          The field guide{" "}
          <span className="subtle">
            {new Set(s.bees.map((b) => b.kind)).size} / {BEES.length} species in
            your hive
          </span>
        </h3>
        <div>
          {BEES.map((b) => (
            <span
              key={b.id}
              title={`${b.name} · ${b.rarity} · ${b.ability}`}
              className={
                s.bees.some((x) => x.kind === b.id) ? "discovered" : ""
              }
            >
              <BeeIcon
                color={s.bees.some((x) => x.kind === b.id) ? b.body : "#c8cbb4"}
                size={32}
              />
              <small>{b.name.replace(" Bee", "")}</small>
            </span>
          ))}
        </div>
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
            Visit Juniper near Dandelion Lawn. Press E to talk and accept your
            first quest.
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
      <rect
        x={HIVE.x - 6}
        y={HIVE.z - 4}
        width="12"
        height="6"
        fill="#d1a75c"
      />
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
          Exploration happens on foot. No fast travel.
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
export default function Menus() {
  const menu = useGame((s) => s.menu),
    open = useGame((s) => s.open),
    placeId = useGame((s) => s.placeId);
  if (!menu) return null;
  const titles = {
    shop: PLACES.find((p) => p.id === placeId)?.name ?? "The Little Supply Co.",
    eggs: "The Hatchery",
    hive: "A home for your swarm",
    quests: "Your field journal",
    inventory: "Your trail bag",
    map: "The mountain trails",
    settings: "Take a breather",
    npc: PLACES.find((p) => p.id === placeId)?.name ?? "Mountain keeper",
  };
  return (
    <div
      className="modal-backdrop"
      onPointerDown={(e) => e.stopPropagation()}
      onClick={() => open(null)}
    >
      <section
        className={`modal modal-${menu}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="menu-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal-header">
          <div>
            <span className="eyebrow">
              POLLEN PEAK ·{" "}
              {menu === "shop" || menu === "eggs"
                ? "MOUNTAIN MERCHANTS"
                : menu === "npc"
                  ? "A KEEPER’S STORY"
                  : "YOUR ADVENTURE"}
            </span>
            <h2 id="menu-title">{titles[menu]}</h2>
          </div>
          <button
            className="close-button"
            aria-label="Close menu"
            onClick={() => {
              open(null);
              useGame.getState().save();
            }}
          >
            ×
          </button>
        </header>
        <div className="modal-content">
          {menu === "shop" ? (
            <Shop />
          ) : menu === "eggs" ? (
            <EggShop />
          ) : menu === "hive" ? (
            <Hive />
          ) : menu === "quests" ? (
            <Journal />
          ) : menu === "inventory" ? (
            <Inventory />
          ) : menu === "map" ? (
            <MapMenu />
          ) : menu === "npc" ? (
            <NPC />
          ) : (
            <Settings />
          )}
        </div>
        <footer className="modal-bottom">
          <span>✦ A little progress, a little wonder.</span>
          <button className="text-button" onClick={() => open(null)}>
            ESC · Back to the mountain
          </button>
        </footer>
      </section>
    </div>
  );
}
