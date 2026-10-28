import { describe, it, expect, vi } from "vitest";
import {
  createGame,
  collect,
  convert,
  buy,
  hatch,
  buySlot,
  feed,
  reroll,
  step,
  acceptQuest,
  claimQuest,
  serialize,
  restore,
  movePlayer,
  startConversion,
  useItem,
  interactPlace,
  releaseBee,
  questReady,
  home,
} from "../game/systems/simulation";
import map from "../game/data/imported-map.json";
import { surface } from "../game/world/terrain";
import { FIELDS, TOOLS, BEES, QUESTS, RAMPS } from "../game/data/content";

const inField = () => {
  const s = createGame();
  const f = FIELDS[0];
  s.player.x = f.x;
  s.player.z = f.z;
  s.player.y = f.y;
  return s;
};
describe("spatial gathering and conversion", () => {
  it("collects only actual nearby flowers and respects capacity", () => {
    const s = inField();
    expect(collect(s)).toBeGreaterThan(0);
    s.pollen = s.capacity - 1;
    expect(collect(s)).toBeLessThanOrEqual(1);
    expect(s.pollen).toBeLessThanOrEqual(s.capacity);
  });
  it("does not gather in the hive plaza or from empty flowers", () => {
    const s = createGame();
    expect(collect(s)).toBe(0);
    const f = inField();
    f.flowers.forEach((x) => (x.pollen = 0));
    expect(collect(f)).toBe(0);
  });
  it("regenerates depleted flowers without exceeding their maximum", () => {
    const s = inField();
    s.flowers[0].pollen = 0;
    step(s, 1);
    expect(s.flowers[0].pollen).toBeGreaterThan(0);
    for (let i = 0; i < 100; i++) step(s, 1);
    expect(s.flowers.every((f) => f.pollen <= f.max)).toBe(true);
  });
  it("conserves pollen and honey and refuses conversion away from hive", () => {
    const s = createGame();
    s.pollen = 100;
    Object.assign(s.player, home(s));
    expect(startConversion(s)).toBe(true);
    const before = s.honey;
    convert(s, 1);
    expect(s.honey - before).toBe(100 - s.pollen);
    s.pollen = 0;
    const h = s.honey;
    convert(s, 10);
    expect(s.honey).toBe(h);
    s.player.z = -40;
    expect(startConversion(s)).toBe(false);
  });
  it("interrupts conversion on movement", () => {
    const s = createGame();
    s.pollen = 50;
    startConversion(s);
    movePlayer(s, 1, 0, 0.1);
    expect(s.converting).toBe(false);
  });
});
describe("economy and hive", () => {
  it("blocks insufficient funds without mutation", () => {
    const s = createGame();
    s.honey = 0;
    expect(buy(s, TOOLS[1].id)).toBe(false);
    expect(s.tool).toBe(TOOLS[0].id);
    expect(s.honey).toBe(0);
  });
  it("purchases, equips and applies a better collector", () => {
    const s = inField();
    s.honey = 10000;
    const initial = s.honey;
    expect(buy(s, TOOLS[1].id)).toBe(true);
    expect(s.tool).toBe(TOOLS[1].id);
    expect(s.honey).toBe(initial - TOOLS[1].cost);
    expect(buy(s, TOOLS[1].id)).toBe(true);
    expect(s.honey).toBe(initial - TOOLS[1].cost);
  });
  it("hatches eggs only into available slots and buys more slots", () => {
    const s = createGame();
    s.inventory.egg = 60;
    while (s.bees.length < s.slots) expect(hatch(s)).toBe(true);
    const eggs = s.inventory.egg;
    expect(hatch(s)).toBe(false);
    expect(s.inventory.egg).toBe(eggs);
    s.honey = 100000000;
    expect(buySlot(s)).toBe(true);
    expect(hatch(s)).toBe(true);
  });
  it("feeds bees and applies level stats", () => {
    const s = createGame();
    s.inventory.treat = 100;
    const level = s.bees[0].level;
    for (let i = 0; i < 15; i++) feed(s, s.bees[0].id);
    expect(s.bees[0].level).toBeGreaterThan(level);
  });
  it("rerolls with jelly and consumes the item", () => {
    const s = createGame();
    s.inventory.jelly = 1;
    expect(reroll(s, s.bees[0].id)).toBe(true);
    expect(s.inventory.jelly).toBe(0);
    expect(reroll(s, s.bees[0].id)).toBe(false);
  });
  it("uses consumables only when available", () => {
    const s = createGame();
    s.inventory.booster = 1;
    expect(useItem(s, "booster")).toBe(true);
    expect(s.buffs.some((x) => x.kind.startsWith("field:"))).toBe(true);
    expect(useItem(s, "booster")).toBe(false);
  });
});
describe("independent swarm, quests and combat", () => {
  it("bees gather independently without clicks", () => {
    const s = inField();
    const before = s.pollen;
    for (let i = 0; i < 300; i++) step(s, 0.1);
    expect(s.pollen).toBeGreaterThan(before);
    expect(s.bees[0].state).not.toBe("following");
  });
  it("quest progresses from collection and rewards are claimed once", () => {
    const s = inField();
    const q = QUESTS[0];
    expect(acceptQuest(s, q.id)).toBe(true);
    for (let i = 0; i < 150; i++) {
      collect(s);
      s.pollen = 0;
      s.flowers.forEach((f) => (f.pollen = f.max));
    }
    expect(claimQuest(s, q.id)).toBe(true);
    const h = s.honey;
    expect(claimQuest(s, q.id)).toBe(false);
    expect(s.honey).toBe(h);
  });
  it("bees damage enemies, death drops rewards and cannot duplicate drops", () => {
    const s = inField();
    const e = s.enemies[0];
    s.player.x = e.x;
    s.player.z = e.z;
    s.player.y = e.y;
    e.hp = 1;
    s.bees[0].x = e.x;
    s.bees[0].z = e.z;
    for (let i = 0; i < 80; i++) step(s, 0.1);
    expect(e.hp).toBe(0);
    expect(s.stats.kills).toBe(1);
    expect(s.tokens.length + s.stats.tokens).toBeGreaterThan(0);
    for (let i = 0; i < 20; i++) step(s, 0.1);
    expect(s.stats.kills).toBe(1);
  });
});
describe("world progression and persistence", () => {
  it("has seventeen fields, thirty distinct bees, and thirty quests", () => {
    expect(FIELDS).toHaveLength(17);
    expect(BEES.length).toBeGreaterThanOrEqual(30);
    expect(QUESTS.length).toBeGreaterThanOrEqual(30);
  });
  it("blocks an imported gate and permits the same route with enough bees", () => {
    const s = createGame();
    const r = map.gates.find((g) => g.bees === 5)!;
    s.player.x = r.x;
    s.player.z = r.z + 2;
    s.player.y = surface(s.player.x, s.player.z, r.y - 5) ?? r.y - 5;
    const z = s.player.z;
    for (let i = 0; i < 3; i++) movePlayer(s, 0, -1, 0.1);
    expect(s.player.z).toBeGreaterThanOrEqual(r.z + 1);
    while (s.bees.length < r.bees)
      s.bees.push({ ...s.bees[0], id: "extra" + s.bees.length });
    s.player.z = z;
    for (let i = 0; i < 3; i++) movePlayer(s, 0, -1, 0.1);
    expect(s.player.z).toBeLessThan(r.z);
  });
  it("roundtrips progression without runtime input", () => {
    const s = inField();
    s.honey = 523;
    s.pollen = 12;
    s.inventory.egg = 3;
    hatch(s);
    acceptQuest(s, QUESTS[0].id);
    const r = restore(serialize(s));
    expect(r.honey).toBe(s.honey);
    expect(r.bees.length).toBe(s.bees.length);
    expect(r.pollen).toBe(12);
    expect(r.accepted).toEqual(s.accepted);
  });
  it("recovers from invalid saves and sanitizes negative or nonfinite values", () => {
    expect(restore("{broken").honey).toBeGreaterThanOrEqual(0);
    const s = createGame();
    const raw = JSON.parse(serialize(s));
    raw.honey = -50;
    raw.pollen = 1e50;
    raw.bees = [{ kind: "nonexistent" }];
    const r = restore(JSON.stringify(raw));
    expect(r.honey).toBeGreaterThanOrEqual(0);
    expect(r.pollen).toBeLessThanOrEqual(r.capacity);
    expect(r.bees.length).toBeGreaterThan(0);
    expect(r.bees.every((b) => BEES.some((d) => d.id === b.kind))).toBe(true);
  });
});

describe("terrain and progression edge cases", () => {
  it("can walk on every imported field once unlocked", () => {
    for (const r of FIELDS) {
      const s = createGame();
      while (s.bees.length < r.gate)
        s.bees.push({ ...s.bees[0], id: `r${s.bees.length}` });
      s.player.x = r.x;
      s.player.z = r.z;
      s.player.y = r.y;
      for (let i = 0; i < 3; i++)
        movePlayer(s, 0, -1, 0.1);
      expect(s.player.z, r.id).toBeLessThan(r.z - 1);
      expect(s.player.y, r.id).toBeCloseTo(r.y, 1);
    }
  });
  it("does not delete carried pollen when equipping a smaller bag", () => {
    const s = createGame();
    s.honey = 1000;
    buy(s, "bag-1");
    s.pollen = 500;
    expect(buy(s, "bag-0")).toBe(false);
    expect(s.pollen).toBe(500);
    expect(s.capacity).toBe(750);
  });
  it("does not let players walk through an imported boundary wall", () => {
    const s = createGame();
    Object.assign(s.player,{x:75,z:-26.96,y:surface(75,-26.96,0) ?? 0});
    for (let i=0;i<5;i++) movePlayer(s,1,0,0.1);
    expect(s.player.x).toBeLessThan(75.95);
    expect(s.player.x).toBeGreaterThan(75);
  });
  it("protects against buying nonmatching saved equipment types", () => {
    const s = createGame();
    const d = JSON.parse(serialize(s));
    d.owned.push("bag-1");
    d.tool = "bag-1";
    expect(restore(JSON.stringify(d)).tool).toBe("tool-0");
  });
});

describe("save positions and time safety", () => {
  it("restores valid terrain positions and rejects a saved position inside a locked region", () => {
    const s = inField();
    const r = restore(serialize(s));
    expect(r.player.x).toBe(s.player.x);
    expect(r.player.z).toBe(s.player.z);
    const d = JSON.parse(serialize(s));
    const locked = FIELDS.find((f) => f.id === "mountain")!;
    d.position = { x: locked.x, y: locked.y, z: locked.z };
    const safe = restore(JSON.stringify(d));
    expect(safe.player.z).toBe(map.spawn.z);
  });
  it("ignores invalid flower positions when gathering from above", () => {
    const s = inField();
    s.player.y = 20;
    expect(collect(s)).toBe(0);
  });
});

describe("review regressions", () => {
  it("sweeps combat knockback instead of tunneling through a fence", () => {
    const s = createGame();
    s.player.x = 54.5;
    s.player.z = 6;
    const e = s.enemies[0];
    e.x = 53;
    e.z = 6;
    step(s, 1 / 30);
    expect(s.player.x).toBeLessThan(54.7);
  });
  it("sweeps fast movement across an imported wall", () => {
    const s = createGame();
    Object.assign(s.player,{x:75,z:-26.96,y:surface(75,-26.96,0) ?? 0});
    s.boots = "boots-2";
    s.buffs.push({ kind: "haste", value: 1.35, remaining: 20 });
    movePlayer(s, 1, 0, 0.1);
    expect(s.player.x).toBeLessThan(75.95);
    expect(s.player.x).toBeGreaterThan(75);
  });
  it("daily cooldown uses wall time and saving never extends its deadline", () => {
    const now = vi.spyOn(Date, "now").mockReturnValue(1700000000000);
    try {
      const s = createGame();
      expect(interactPlace(s, "daily")).toBe(true);
      const first = JSON.parse(serialize(s)).cooldowns.daily;
      now.mockReturnValue(1700003600000);
      expect(JSON.parse(serialize(s)).cooldowns.daily).toBe(first);
      expect(interactPlace(s, "daily")).toBe(false);
      now.mockReturnValue(1700086401000);
      expect(interactPlace(s, "daily")).toBe(true);
    } finally {
      now.mockRestore();
    }
  });
  it("a full hive can release a bee at home and hatch for an accepted quest", () => {
    const s = createGame();
    Object.assign(s.player,home(s));
    s.slots = 50;
    while (s.bees.length < 50)
      s.bees.push({ ...s.bees[0], id: "full-" + s.bees.length });
    expect(acceptQuest(s, "pippin-0")).toBe(true);
    expect(releaseBee(s, s.bees[10].id)).toBe(true);
    expect(hatch(s)).toBe(true);
    expect(questReady(s, "pippin-0")).toBe(true);
  });
  it("protects the last bee and refuses release away from the hive", () => {
    const s = createGame();
    expect(releaseBee(s, s.bees[0].id)).toBe(false);
    s.inventory.egg = 1;
    hatch(s);
    s.player.z = 0;
    expect(releaseBee(s, s.bees[1].id)).toBe(false);
    expect(s.bees.length).toBe(2);
  });
});
