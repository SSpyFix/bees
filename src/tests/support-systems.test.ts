import { describe, expect, it } from "vitest";
import {
  createGame,
  event,
  serialize,
  restore,
} from "../game/systems/simulation";
import { claimBadge, badgeCount } from "../game/systems/badges";
import { startCraft, finishCraft, tickCraft } from "../game/systems/crafting";
import {
  buySprinkler,
  placeSprinkler,
  tickSprinklers,
} from "../game/systems/sprinklers";

describe("badges", () => {
  it("tracks field pollen outside quests, awards each rank once, and persists it", () => {
    const s = createGame();
    event(s, "field", 250000, "sunflower");
    expect(claimBadge(s, "sunflower")).toBe(true);
    expect(s.inventory.ticket).toBe(5);
    expect(claimBadge(s, "sunflower")).toBe(false);
    event(s, "field", 2250000, "sunflower");
    expect(claimBadge(s, "sunflower")).toBe(true);
    expect(s.inventory.ticket).toBe(15);
    const t = restore(serialize(s));
    expect(t.badges.sunflower).toBe(2);
    expect(badgeCount(t)).toBe(2);
    expect(claimBadge(t, "sunflower")).toBe(false);
  });
  it("rejects invented badge IDs and impossible saved tiers", () => {
    const s = createGame();
    expect(claimBadge(s, "missing")).toBe(false);
    const raw = JSON.parse(serialize(s));
    raw.badges = { sunflower: 500, missing: 10 };
    expect(restore(JSON.stringify(raw)).badges).toEqual({});
  });
});
describe("Blender", () => {
  const atBlender = () => {
    const s = createGame();
    Object.assign(s.player, PLACES.find((p) => p.id === "guild")!);
    s.badges = { sunflower: 5, dandelion: 5, mushroom: 5 };
    for (const f of ["sunflower", "dandelion", "mushroom"])
      event(s, "field", 5e9, f);
    return s;
  };
  it("deducts ingredients atomically, blends in-game, and refunds unfinished items", () => {
    const s = atBlender();
    s.inventory.strawberry = 150;
    s.inventory.jelly = 30;
    expect(startCraft(s, "redExtract", 3)).toBe(true);
    expect(s.inventory.strawberry).toBe(0);
    expect(s.inventory.jelly).toBe(0);
    tickCraft(s, 350);
    expect(finishCraft(s)).toBe(true);
    expect(s.inventory.redExtract).toBe(1);
    expect(s.inventory.strawberry).toBe(100);
    expect(s.inventory.jelly).toBe(20);
    expect(finishCraft(s)).toBe(false);
  });
  it("does not tick while offline, rejects fractional amounts and missing ingredients", () => {
    const s = atBlender();
    s.inventory.blueberry = 50;
    s.inventory.jelly = 9;
    expect(startCraft(s, "blueExtract", 1)).toBe(false);
    expect(s.inventory.blueberry).toBe(50);
    s.inventory.jelly = 10;
    expect(startCraft(s, "blueExtract", 0.5)).toBe(false);
    expect(startCraft(s, "blueExtract", 1)).toBe(true);
    tickCraft(s, 100);
    const raw = JSON.parse(serialize(s));
    raw.savedAt -= 86400000;
    const t = restore(JSON.stringify(raw));
    expect(t.crafting?.elapsed).toBe(100);
    tickCraft(t, 200);
    Object.assign(t.player, PLACES.find((p) => p.id === "guild")!);
    expect(finishCraft(t)).toBe(true);
    expect(t.inventory.blueExtract).toBe(1);
  });
  it("requires recipe materials before buying gear and charges them only once", () => {
    const s = createGame();
    s.honey = 10000;
    expect(buy(s, "boots-1")).toBe(false);
    expect(s.honey).toBe(10000);
    s.inventory.sunflowerSeed = 3;
    s.inventory.blueberry = 3;
    expect(buy(s, "boots-1")).toBe(true);
    expect(s.honey).toBe(5600);
    expect(s.inventory.blueberry).toBe(0);
    expect(buy(s, "boots-1")).toBe(true);
    expect(s.honey).toBe(5600);
  });
});
import { buy } from "../game/systems/simulation";
import { FIELDS, PLACES } from "../game/data/content";
describe("sprinklers", () => {
  it("requires badges and honey, builds in fields and regenerates only nearby flowers", () => {
    const s = createGame();
    s.honey = 2e6;
    Object.assign(s.player, PLACES.find((p) => p.id === "guild")!);
    expect(buySprinkler(s, 0)).toBe(false);
    s.badges = { sunflower: 5, dandelion: 5, mushroom: 5 };
    expect(buySprinkler(s, 0)).toBe(true);
    expect(s.honey).toBe(888889);
    expect(placeSprinkler(s)).toBe(false);
    const tile = s.flowers.find((f) => f.field === FIELDS[0].id)!;
    Object.assign(s.player, { x: tile.x, y: tile.y, z: tile.z });
    expect(placeSprinkler(s)).toBe(true);
    const near = tile,
      far = s.flowers.find((f) => f.field === "dandelion")!;
    near.pollen = far.pollen = 0;
    tickSprinklers(s, 5);
    expect(near.pollen).toBe(0);
    tickSprinklers(s, 6);
    expect(near.pollen).toBeGreaterThan(0);
    expect(far.pollen).toBe(0);
    expect(restore(serialize(s)).sprinkler).toBe(0);
    expect(restore(serialize(s)).sprinklers).toHaveLength(0);
  });
});
