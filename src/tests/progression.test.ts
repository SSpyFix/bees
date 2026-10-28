import { describe, expect, it } from "vitest";
import { BAGS, TOOLS, QUESTS, FIELDS, PLACES } from "../game/data/content";
import {
  createGame,
  buy,
  eggCost,
  jellyCost,
  hatch,
  event,
  acceptQuest,
  claimQuest,
  feed,
  serialize,
  restore,
  collect,
  step,
  newBee,
  giftBee,
  reroll,
  bondRequired,
  buyTicketItem,
} from "../game/systems/simulation";

describe("reference progression", () => {
  it("prices Royal Jelly purchases separately and never sells invented cheap dice", () => {
    const s = createGame();
    s.honey = 2e6;
    expect(jellyCost(s)).toBe(250000);
    expect(buy(s, "jelly")).toBe(true);
    expect(jellyCost(s)).toBe(260000);
    expect(buy(s, "booster")).toBe(false);
    expect(jellyCost(restore(serialize(s)))).toBe(260000);
  });
  it("purchases typed Ticket Tent items with tickets only, at the tent", () => {
    const s = createGame();
    s.inventory.ticket = 1000;
    expect(buyTicketItem(s, "starTreat")).toBe(false);
    Object.assign(s.player, PLACES.find((p) => p.id === "tickets")!);
    expect(buyTicketItem(s, "starTreat")).toBe(true);
    expect(s.inventory.starTreat).toBe(1);
    expect(s.inventory.ticket).toBe(0);
    expect(buyTicketItem(s, "silverEgg")).toBe(false);
    expect(s.inventory.silverEgg).toBe(0);
  });
  it("prices purchased Basic Eggs independently of hatches, tickets and reward eggs", () => {
    const s = createGame();
    s.honey = 1e9;
    expect(eggCost(s)).toBe(1000);
    hatch(s);
    expect(eggCost(s)).toBe(1000);
    for (const cost of [1000, 2500, 4250, 6708, 10313]) {
      expect(eggCost(s)).toBe(cost);
      expect(buy(s, "egg")).toBe(true);
    }
    const loaded = restore(serialize(s));
    expect(eggCost(loaded)).toBe(15669);
    for (let i = 0; i < 25; i++) buy(loaded, "egg");
    expect(eggCost(loaded)).toBe(10000000);
  });
  it("includes the intermediate Pro Shop containers and corrected prices", () => {
    for (const [name, capacity, cost] of [
      ["Mega-Jug", 25000, 50000],
      ["Compressor", 50000, 160000],
      ["Elite Barrel", 125000, 650000],
      ["Port-O-Hive", 250000, 1250000],
      ["Porcelain Port-O-Hive", 600000, 250000000],
    ] as const) {
      expect(BAGS.find((b) => b.name === name)).toMatchObject({
        capacity,
        cost,
      });
    }
    expect(TOOLS.find((t) => t.name === "Super-Scooper")).toMatchObject({
      cost: 40000,
      gate: 10,
      power: 4,
      interval: 0.5,
    });
  });
  it("requires Sunflower pollen for Sunflower Start and rewards exactly once", () => {
    const s = createGame();
    expect(QUESTS.find((q) => q.id === "juniper-0")?.name).toBe(
      "Sunflower Start",
    );
    acceptQuest(s, "juniper-0");
    event(s, "field", 100, "dandelion");
    event(s, "pollen", 100);
    expect(claimQuest(s, "juniper-0")).toBe(false);
    event(s, "field", 100, "sunflower");
    expect(claimQuest(s, "juniper-0")).toBe(true);
    expect(s.honey).toBe(200);
    expect(s.inventory.ticket).toBe(0);
    expect(claimQuest(s, "juniper-0")).toBe(false);
  });
  it("completes the full Silver Egg chain and hatches its actual reward", () => {
    const s = createGame();
    for (let i = 0; i < 6; i++) {
      const q = QUESTS.find((q) => q.id === `juniper-${i}`)!;
      expect(acceptQuest(s, q.id)).toBe(true);
      q.objectives.forEach((o) => event(s, o.event, o.amount, o.target));
      expect(claimQuest(s, q.id)).toBe(true);
    }
    expect(s.inventory.silverEgg).toBe(1);
    expect(hatch(s, "silverEgg")).toBe(true);
    expect(s.inventory.silverEgg).toBe(0);
    expect(s.bees[1].kind).not.toBe("bee-0");
    expect(s.honey).toBe(3500);
  });
  it("hatches typed eggs within their rarity bounds and consumes nothing on full hives", () => {
    const s = createGame();
    for (const [egg, rarities] of [
      ["silverEgg", ["Rare", "Epic", "Legendary", "Mythic"]],
      ["goldEgg", ["Epic", "Legendary", "Mythic"]],
      ["diamondEgg", ["Legendary", "Mythic"]],
      ["mythicEgg", ["Mythic"]],
    ] as const) {
      s.inventory[egg] = 100;
      for (let i = 0; i < 100; i++) {
        s.bees = s.bees.slice(0, 1);
        expect(hatch(s, egg)).toBe(true);
        const kind = s.bees[1].kind;
        expect(rarities).toContain(awaitRarity(kind));
      }
    }
    s.slots = s.bees.length;
    s.inventory.goldEgg = 1;
    expect(hatch(s, "goldEgg")).toBe(false);
    expect(s.inventory.goldEgg).toBe(1);
  });
  it("feeds 10 bond per treat using original next-level requirements", () => {
    const s = createGame();
    expect(bondRequired(1)).toBe(10);
    expect(bondRequired(2)).toBe(40);
    expect(bondRequired(3)).toBe(200);
    feed(s, s.bees[0].id);
    expect(s.bees[0]).toMatchObject({ level: 2, bond: 0 });
    for (let i = 0; i < 4; i++) feed(s, s.bees[0].id);
    expect(s.bees[0]).toMatchObject({ level: 3, bond: 0 });
  });
  it("gifts a chosen bee once, preserves it across saves and protects Event bees", () => {
    const s = createGame();
    s.inventory.starTreat = 2;
    expect(giftBee(s, s.bees[0].id)).toBe(true);
    expect(giftBee(s, s.bees[0].id)).toBe(false);
    expect(s.inventory.starTreat).toBe(1);
    expect(restore(serialize(s)).bees[0].gifted).toBe(true);
    s.bees[0].kind = "bee-41";
    s.inventory.starJelly = 1;
    expect(reroll(s, s.bees[0].id, "starJelly")).toBe(false);
    expect(s.inventory.starJelly).toBe(1);
  });
});
import { BEES } from "../game/data/content";
const awaitRarity = (kind: string) => BEES.find((b) => b.id === kind)!.rarity;

describe("reference spatial collection", () => {
  it.each([
    ["tool-0", 2],
    ["tool-1", 3],
    ["tool-2", 1],
    ["tool-3", 9],
    ["tool-4", 13],
  ])("%s affects exactly %i flower tiles", (tool, count) => {
    const s = createGame();
    Object.assign(s.player, FIELDS[0]);
    s.player.yaw = 0;
    s.tool = tool;
    s.capacity = 1e6;
    s.flowers.forEach((f) => {
      f.pollen = f.max = 1000;
      f.multiplier = 1;
      f.size = 1;
    });
    collect(s);
    expect(s.flowers.filter((f) => f.pollen < f.max)).toHaveLength(count);
  });
  it("Basic bees never generate an invented pollen ability", () => {
    const s = createGame();
    Object.assign(s.player, FIELDS[0]);
    s.capacity = 1e9;
    s.bees[0] = newBee(s, "bee-0");
    for (let i = 0; i < 1000; i++) step(s, 0.1);
    expect(s.tokens.filter((t) => t.kind === "pollen")).toHaveLength(0);
    expect(s.buffs.filter((b) => b.kind === "pollen")).toHaveLength(0);
  });
});
