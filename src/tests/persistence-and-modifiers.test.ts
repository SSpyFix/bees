import { describe, expect, it } from "vitest";
import {
  createGame,
  newBee,
  random,
  serialize,
  restore,
  harvest,
  feed,
  collect,
} from "../game/systems/simulation";
import { effectiveCapacity, hiveModifiers } from "../game/systems/modifiers";
import { activateAbility } from "../game/systems/abilities";

describe("persistent state and resource conservation", () => {
  it("preserves the gifted Bear Morph multiplier across reload", () => {
    const s = createGame();
    activateAbility(s, "bear-morph", s.player, 5, true);
    expect(s.buffs.find(b => b.kind === "bear-morph")?.value).toBe(2.5);
    const loaded = restore(serialize(s));
    expect(loaded.buffs.find(b => b.kind === "bear-morph")?.value).toBe(2.5);
  });
  it("continues the random stream after save and reload", () => {
    const s = createGame();
    for (let i = 0; i < 37; i++) random(s);
    const t = restore(serialize(s));
    expect(random(t)).toBe(random(s));
  });
  it("preserves excess pollen as honey when old backpack capacities migrate", () => {
    const s = restore(
      JSON.stringify({
        version: 2,
        honey: 50,
        bag: "bag-6",
        owned: ["bag-6"],
        pollen: 2000000,
      }),
    );
    expect(s.pollen + s.honey).toBe(2000050);
    expect(s.pollen).toBe(s.capacity);
  });
  it("conserves current-map carried pollen when a field capacity bonus disappears on reload", () => {
    const s = createGame();
    s.capacity = s.pollen = 350;
    const loaded = restore(serialize(s));
    expect(loaded.pollen).toBe(350);
    expect(loaded.capacity).toBeGreaterThanOrEqual(350);
    expect(loaded.honey).toBe(0);
  });
  it("accounts for instant conversion before bag capacity and conserves total value", () => {
    const s = createGame();
    s.bag = "bag-4";
    s.capacity = 100;
    s.pollen = 99;
    const f = s.flowers[0];
    f.size = 1;
    f.pollen = f.max = 100;
    f.multiplier = 1;
    const before = s.pollen + s.honey,
      delta = harvest(s, f, 10);
    expect(delta).toBeCloseTo(1 / 0.95);
    expect(s.pollen).toBeCloseTo(100);
    expect(s.pollen + s.honey - before).toBeCloseTo(delta);
  });
});
describe("gifted hive bonuses", () => {
  it("deduplicates each gifted species while applying different species bonuses", () => {
    const s = createGame();
    s.bees[0].gifted = true;
    const duplicate = newBee(s, "bee-0");
    duplicate.gifted = true;
    s.bees.push(duplicate);
    expect(hiveModifiers(s).pollen).toBe(1.2);
    const bear = newBee(s, "bee-35");
    bear.gifted = true;
    s.bees.push(bear);
    expect(hiveModifiers(s).pollen).toBeCloseTo(1.32);
  });
  it("applies capacity, critical chance and attack bonuses from their specific species", () => {
    const s = createGame();
    s.bees = [];
    for (const id of ["bee-3", "bee-12", "bee-2"]) {
      const b = newBee(s, id);
      b.gifted = true;
      s.bees.push(b);
    }
    expect(effectiveCapacity(s)).toBe(220);
    expect(hiveModifiers(s)).toMatchObject({
      criticalChance: 0.03,
      attackFlat: 1,
    });
  });
  it("uses the Puppy gifted bonus for treats without compounding duplicates", () => {
    const s = createGame();
    for (let i = 0; i < 2; i++) {
      const b = newBee(s, "bee-42");
      b.gifted = true;
      s.bees.push(b);
    }
    s.bees[0].level = 2;
    feed(s, s.bees[0].id);
    expect(s.bees[0].bond).toBe(12);
  });
});
describe("reference field flowers", () => {
  it("grows only single and double Sunflower tiles and all-white Spider flowers", () => {
    const s = createGame();
    expect(
      s.flowers
        .filter((f) => f.field === "sunflower")
        .every((f) => f.size <= 2),
    ).toBe(true);
    expect(
      s.flowers
        .filter((f) => f.field === "spider")
        .every((f) => f.color === "white"),
    ).toBe(true);
  });
});
