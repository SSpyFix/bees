import { describe, it, expect } from "vitest";
import { BEES, FIELDS, PLACES, TOOLS, BAGS } from "../game/data/content";
import {
  createGame,
  hatch,
  serialize,
  restore,
} from "../game/systems/simulation";
describe("Bee Swarm reference content", () => {
  it("has all 46 named bees, from Basic through the event roster", () => {
    expect(BEES).toHaveLength(46);
    for (const name of [
      "Basic Bee",
      "Bomber Bee",
      "Brave Bee",
      "Cool Bee",
      "Hasty Bee",
      "Riley Bee",
      "Bucko Bee",
      "Baby Bee",
      "Demon Bee",
      "Diamond Bee",
      "Music Bee",
      "Ninja Bee",
      "Shy Bee",
      "Buoyant Bee",
      "Fuzzy Bee",
      "Precise Bee",
      "Spicy Bee",
      "Tadpole Bee",
      "Vector Bee",
      "Bear Bee",
      "Cobalt Bee",
      "Crimson Bee",
      "Digital Bee",
      "Festive Bee",
      "Gummy Bee",
      "Photon Bee",
      "Puppy Bee",
      "Tabby Bee",
      "Vicious Bee",
      "Windy Bee",
    ])
      expect(
        BEES.some((b) => b.name === name),
        name,
      ).toBe(true);
  });
  it("gives every species a stable face identity and individual stats", () => {
    expect(new Set(BEES.map((b) => b.face)).size).toBe(46);
    expect(BEES.find((b) => b.name === "Ninja Bee")!.speed).toBeGreaterThan(
      BEES.find((b) => b.name === "Bumble Bee")!.speed,
    );
    expect(BEES.find((b) => b.name === "Demon Bee")!.attack).toBeGreaterThan(
      BEES.find((b) => b.name === "Basic Bee")!.attack,
    );
  });
  it("uses the original field, keeper and equipment names", () => {
    expect(FIELDS[0].name).toBe("Sunflower Field");
    expect(FIELDS.find((f) => f.id === "mountain")!.name).toBe(
      "Mountain Top Field",
    );
    expect(PLACES.some((p) => p.name === "Black Bear")).toBe(true);
    expect(PLACES.some((p) => p.name === "Science Bear")).toBe(true);
    expect(TOOLS[0].name).toBe("Scooper");
    expect(BAGS[0].name).toBe("Pouch");
  });
  it("starts with a Basic Bee, a 25-slot hive and a 200-pollen pouch", () => {
    const s = createGame();
    expect(s.slots).toBe(25);
    expect(s.capacity).toBe(200);
    expect(BEES.find((b) => b.id === s.bees[0].kind)!.name).toBe("Basic Bee");
  });
  it("keeps existing progression when loading a previous small hive", () => {
    const s = createGame();
    s.honey = 1234;
    const d = JSON.parse(serialize(s));
    d.slots = 3;
    const loaded = restore(JSON.stringify(d));
    expect(loaded.honey).toBe(1234);
    expect(loaded.slots).toBeGreaterThanOrEqual(25);
    expect(loaded.bees.length).toBe(s.bees.length);
  });
  it("can hatch every rarity without an empty species pool", () => {
    const s = createGame();
    s.inventory.egg = 500;
    for (let i = 0; i < 250; i++) {
      s.bees = s.bees.slice(0, 1);
      expect(hatch(s)).toBe(true);
      expect(BEES.some((b) => b.id === s.bees.at(-1)!.kind)).toBe(true);
    }
  });
});

import { claimHive, atHive } from "../game/systems/simulation";
import { HIVE_PADS, PLATFORMS } from "../game/data/content";
describe("reference map interactions", () => {
  it("has six claimable hives and keeps the claimed hive across reload", () => {
    const s = createGame(),
      pad = HIVE_PADS[0];
    expect(HIVE_PADS).toHaveLength(6);
    s.player.x = pad.x;
    s.player.z = pad.z;
    expect(claimHive(s, 0)).toBe(true);
    expect(atHive(s)).toBe(true);
    expect(restore(serialize(s)).hive).toBe(0);
  });
  it("defines gate requirements directly instead of guessing from terrain height", () => {
    expect(PLATFORMS.map((p) => p.gate)).toEqual([0, 5, 10, 15, 25, 35]);
  });
});

import {
  interactPlace,
  movePlayer,
  newBee,
  buyEventBee,
  useItem,
  buff,
  collect,
  claimQuest,
  acceptQuest,
  event,
} from "../game/systems/simulation";
import { solidAt, surface } from "../game/world/terrain";
describe("rebuilt landmarks and progression", () => {
  it("launches only an eligible nearby swarm and lands on the mountaintop safely", () => {
    const s = createGame();
    s.player.x = -60;
    s.player.y = 8;
    s.player.z = -28;
    expect(interactPlace(s, "red-cannon")).toBe(false);
    while (s.bees.length < 25) s.bees.push(newBee(s, "bee-0"));
    expect(interactPlace(s, "red-cannon")).toBe(true);
    movePlayer(s, 1, 1, 0.1);
    expect(s.player.y).toBeGreaterThan(8);
    for (let i = 0; i < 40; i++) movePlayer(s, 0, 0, 0.1);
    expect(s.flight).toBeNull();
    expect(s.player.y).toBe(surface(s.player.x, s.player.z));
    expect(s.player.z).toBe(-145);
    expect(s.player.grounded).toBe(true);
    expect(solidAt(s.player.x, s.player.z)).toBe(false);
  });
  it("rejects remote cannon activation and keeps the Coconut Shop reachable", () => {
    const s = createGame();
    expect(interactPlace(s, "mountain-cannon")).toBe(false);
    expect(solidAt(77, -199)).toBe(false);
    expect(surface(77, -199)).toBe(44);
  });
  it("requires earned tickets, enforces unique event bees, and persists the purchase", () => {
    const s = createGame();
    s.player.x = -28;
    s.player.z = 49;
    expect(buyEventBee(s, "bee-41")).toBe(false);
    s.inventory.ticket = 1000;
    expect(buyEventBee(s, "bee-41")).toBe(true);
    expect(s.inventory.ticket).toBe(500);
    expect(buyEventBee(s, "bee-41")).toBe(false);
    const loaded = restore(serialize(s));
    expect(loaded.inventory.ticket).toBe(500);
    expect(loaded.bees.some((b) => b.kind === "bee-41")).toBe(true);
    expect(
      loaded.bees.find((b) => b.kind === "bee-41")!.energy,
    ).toBeGreaterThan(10000);
  });
  it("pays tickets from completed gameplay quests", () => {
    const s = createGame();
    acceptQuest(s, "juniper-0");
    event(s, "pollen", 100);
    expect(claimQuest(s, "juniper-0")).toBe(true);
    expect(s.inventory.ticket).toBe(5);
    expect(claimQuest(s, "juniper-0")).toBe(false);
    expect(s.inventory.ticket).toBe(5);
  });
  it("boosts only the field selected by Field Dice", () => {
    const a = createGame(),
      b = createGame();
    a.player.x = b.player.x = 0;
    a.player.z = b.player.z = 8;
    a.seed = b.seed = 1;
    buff(a, "field:dandelion", 2, 900);
    expect(collect(a)).toBeGreaterThan(collect(b));
    const s = createGame();
    s.inventory.booster = 1;
    useItem(s, "booster");
    expect(s.buffs[0].kind.startsWith("field:")).toBe(true);
    expect(s.buffs[0].remaining).toBe(900);
    expect(FIELDS.find((f) => `field:${f.id}` === s.buffs[0].kind)!.gate).toBe(
      0,
    );
  });
  it("basic eggs never hatch Event or Mythic bees", () => {
    const s = createGame();
    s.inventory.egg = 1000;
    for (let i = 0; i < 1000; i++) {
      s.bees = s.bees.slice(0, 1);
      hatch(s);
      expect(["Common", "Rare", "Epic", "Legendary"]).toContain(
        BEES.find((b) => b.id === s.bees[1].kind)!.rarity,
      );
    }
  });
});

it("uses matching shop and headquarters collision footprints with clear entrances", () => {
  expect(solidAt(-63, -8)).toBe(true);
  expect(solidAt(-63, -1)).toBe(false);
  expect(solidAt(-28, 51)).toBe(true);
  expect(solidAt(-28, 49)).toBe(false);
});
