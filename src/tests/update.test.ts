import { describe, it, expect } from "vitest";
import * as sim from "../game/systems/simulation";
import { BEES } from "../game/data/content";
import { beeAbilities, ABILITIES } from "../game/data/abilities";
import {
  collectToken,
  activateAbility,
  updateEffects,
  spawnBeeAbilities,
} from "../game/systems/abilities";
import { hiveBonus, updateCapacity } from "../game/systems/gifted";

describe("bulk consumables", () => {
  it("buys one million jelly in a single exact transaction", () => {
    const s = sim.createGame();
    s.honey = 180000001;
    expect(sim.buy(s, "jelly", 1000000)).toBe(true);
    expect(s.honey).toBe(1);
    expect(s.inventory.jelly).toBe(1000000);
    expect(s.stats.spent).toBe(180000000);
    expect(sim.restore(sim.serialize(s)).inventory.jelly).toBe(1000000);
  });
  it("refuses partial, negative, fractional, infinite and unaffordable orders", () => {
    const s = sim.createGame();
    s.honey = 200;
    for (const quantity of [0, -1, 1.5, Infinity, NaN, 1000])
      expect(sim.buy(s, "treat", quantity)).toBe(false);
    expect(s.honey).toBe(200);
    expect(s.inventory.treat).toBe(5);
  });
});

describe("bee abilities and gifted hive", () => {
  function fieldGame() {
    const s = sim.createGame();
    s.player.x = 0;
    s.player.y = 0;
    s.player.z = 8;
    s.capacity = 100000;
    s.enemies = [];
    return s;
  }
  it("settles expired balloon cargo once when a frog spawns at the effect limit", () => {
    const s = fieldGame();
    activateAbility(s, "inflate-balloons", s.player, 1, false);
    s.effects[0].life = 0.1;
    s.effects[0].stored = 20;
    activateAbility(s, "summon-frog", s.player, 1, false);
    for (let i = 0; i < 158; i++)
      activateAbility(s, "pollen-mark", s.player, 1, false);
    updateEffects(s, 1.1);
    expect(s.balloonPollen).toBe(20);
  });
  it("Puppy Love immediately processes bond into levels", () => {
    const s = fieldGame();
    activateAbility(s, "puppy-love", s.bees[0], 10, false);
    expect(s.bees[0].level).toBe(2);
    expect(s.bees[0].bond).toBe(70);
    expect(s.stats.levels).toBe(1);
  });
  it("gives Token Link to its four species and uses actual support abilities", () => {
    for (const i of [14, 18, 20, 26])
      expect(beeAbilities(BEES[i], false)).toContain("token-link");
    expect(beeAbilities(BEES[0], false)).toEqual([]);
    expect(beeAbilities(BEES[2], false)).toEqual([]);
    expect(beeAbilities(BEES[9], false)).toContain("pollen-mark");
    expect(beeAbilities(BEES[21], false)).toContain("baby-love");
    for (const def of BEES)
      for (const id of beeAbilities(def, true))
        expect(ABILITIES[id]).toBeDefined();
  });
  it("Token Link collects same-field tokens once and leaves other links and distant loot", () => {
    const s = fieldGame();
    s.tokens = [
      { id: 1, x: 0, y: 0.7, z: 8, kind: "token-link", value: 5, life: 20 },
      { id: 2, x: 8, y: 0.7, z: 8, kind: "honey", value: 10, life: 20 },
      { id: 3, x: -8, y: 0.7, z: 8, kind: "focus", value: 1, life: 20 },
      { id: 4, x: 8, y: 0.7, z: 8, kind: "token-link", value: 1, life: 20 },
      { id: 5, x: 100, y: 0.7, z: 8, kind: "ticket", value: 1, life: 20 },
    ];
    collectToken(s, 1);
    expect(s.tokens.map((t) => t.id)).toEqual([4, 5]);
    expect(s.stats.tokens).toBe(3);
    expect(s.honey).toBe(160);
    expect(s.buffs.some((b) => b.kind === "focus")).toBe(true);
    collectToken(s, 1);
    expect(s.honey).toBe(160);
  });
  it("blue bombs harvest blue flowers only and plus bombs have greater reach", () => {
    const s = fieldGame();
    const p = { x: 0, y: 0, z: 8 };
    const red = s.flowers.filter((f) => f.color === "red").map((f) => f.pollen);
    activateAbility(s, "blue-bomb", p, 1, false);
    expect(s.pollen).toBeGreaterThan(0);
    expect(
      s.flowers.filter((f) => f.color === "red").map((f) => f.pollen),
    ).toEqual(red);
    const small = fieldGame(),
      large = fieldGame();
    activateAbility(small, "buzz-bomb", p, 1, false);
    activateAbility(large, "buzz-bomb-plus", p, 1, false);
    expect(large.pollen).toBeGreaterThan(small.pollen);
  });
  it("marks grant pollen only while standing inside their area", () => {
    const a = fieldGame(),
      b = fieldGame();
    a.seed = b.seed = 5;
    activateAbility(a, "pollen-mark", { x: 0, y: 0, z: 8 }, 1, false);
    expect(sim.collect(a)).toBeGreaterThan(sim.collect(b));
    a.player.x = b.player.x = 9;
    a.player.z = b.player.z = 8;
    a.pollen = b.pollen = 0;
    a.flowers = b.flowers.map((f) => ({ ...f }));
    a.seed = b.seed = 9;
    expect(sim.collect(a)).toBe(sim.collect(b));
  });
  it("mythics create distinct balloons, pollinated flowers, targets, flames, frogs and triangles", () => {
    for (const [id, kind] of [
      ["inflate-balloons", "balloon"],
      ["target-practice", "target"],
      ["inferno", "flame"],
      ["summon-frog", "frog"],
      ["triangulate", "triangle"],
    ]) {
      const s = fieldGame();
      activateAbility(s, id, { x: 0, y: 0, z: 8 }, 5, false);
      expect(s.effects.some((e) => e.kind === kind)).toBe(true);
    }
    const s = fieldGame();
    activateAbility(s, "fuzz-bombs", { x: 0, y: 0, z: 8 }, 5, false);
    expect(s.flowers.some((f) => f.pollination > 0)).toBe(true);
  });
  it("gifted-only abilities are gated and abilities spawn during combat", () => {
    expect(beeAbilities(BEES[29], false)).not.toContain("surprise-party");
    expect(beeAbilities(BEES[29], true)).toContain("surprise-party");
    const s = fieldGame();
    s.bees[0].kind = "bee-44";
    s.bees[0].abilityTimer = 0;
    spawnBeeAbilities(s, s.bees[0], "battle");
    expect(s.tokens.some((t) => t.kind === "impale")).toBe(true);
  });
  it("persistent effects expire and do not exceed storage or capacity", () => {
    const s = fieldGame();
    activateAbility(s, "summon-frog", { x: 0, y: 0, z: 8 }, 1, false);
    for (let i = 0; i < 60; i++) updateEffects(s, 1);
    expect(s.effects).toHaveLength(0);
    expect(s.pollen).toBeLessThanOrEqual(s.capacity);
  });
  it("gifted hive bonuses apply once per species and update capacity", () => {
    const s = sim.createGame();
    s.bees[0].gifted = true;
    expect(hiveBonus(s, "pollen")).toBeCloseTo(1.2);
    const duplicate = sim.newBee(s, "bee-0");
    duplicate.gifted = true;
    s.bees.push(duplicate);
    expect(hiveBonus(s, "pollen")).toBeCloseTo(1.2);
    const b = sim.newBee(s, "bee-3");
    b.gifted = true;
    s.bees.push(b);
    updateCapacity(s);
    expect(s.capacity).toBe(220);
    const loaded = sim.restore(sim.serialize(s));
    expect(loaded.capacity).toBe(220);
  });
  it("an ability kill awards loot and quest progress only once", () => {
    const s = sim.createGame();
    const enemy = s.enemies[0];
    s.player.x = enemy.x;
    s.player.y = enemy.y;
    s.player.z = enemy.z;
    enemy.hp = 1;
    activateAbility(s, "impale", enemy, 10, false);
    expect(enemy.hp).toBe(0);
    expect(s.stats.kills).toBe(1);
    expect(s.tokens.some((t) => t.kind === "ticket")).toBe(true);
    activateAbility(s, "impale", enemy, 10, false);
    expect(s.stats.kills).toBe(1);
  });
  it("balloon pollen survives reload and can be converted with an empty pack", () => {
    const s = sim.createGame();
    s.balloonPollen = 120;
    s.pollen = 0;
    const loaded = sim.restore(sim.serialize(s));
    expect(loaded.balloonPollen).toBe(120);
    expect(sim.startConversion(loaded)).toBe(true);
    sim.convert(loaded, 100);
    expect(loaded.balloonPollen).toBe(0);
    expect(loaded.honey).toBe(120);
  });
  it("honey marks convert carried pollen rather than create extra pollen", () => {
    const s = fieldGame();
    s.pollen = 100;
    activateAbility(s, "honey-mark", s.player, 2, false);
    updateEffects(s, 1);
    expect(s.pollen).toBe(60);
    expect(s.honey).toBe(40);
  });
  it("walking through all targets awards Precision", () => {
    const s = fieldGame();
    activateAbility(s, "target-practice", s.player, 1, false);
    for (const target of [...s.effects]) {
      s.player.x = target.x;
      s.player.z = target.z;
      updateEffects(s, 0.1);
    }
    expect(s.effects.filter((e) => e.kind === "target")).toHaveLength(0);
    expect(s.buffs.some((b) => b.kind === "precision")).toBe(true);
  });
  it("every roster ability runs without corrupting resources", () => {
    for (const def of BEES) {
      const s = fieldGame();
      s.bees[0].kind = def.id;
      s.bees[0].gifted = true;
      for (const id of beeAbilities(def, true))
        activateAbility(s, id, s.player, 5, true);
      for (let i = 0; i < 3; i++) updateEffects(s, 0.5);
      expect(Number.isFinite(s.honey)).toBe(true);
      expect(Number.isFinite(s.pollen)).toBe(true);
      expect(s.pollen).toBeGreaterThanOrEqual(0);
      expect(s.pollen).toBeLessThanOrEqual(s.capacity);
    }
  });
  it("Focus and Melody increase combat critical hits and gifted stats scale attack", () => {
    const s = sim.createGame(),
      b = s.bees[0];
    s.seed = 1;
    s.buffs = [{ kind: "focus", value: 2, remaining: 20 }];
    expect(sim.beeAttack(s, b)).toBe(5);
    sim.buff(s, "melody", 2, 20);
    expect(sim.beeAttack(s, b)).toBe(7.5);
    b.gifted = true;
    expect(sim.beeAttack(s, b)).toBe(11.25);
  });
});

describe("gifted and royal jelly", () => {
  it("finishes fractional conversion ticks at an exact spendable honey amount", () => {
    const s = sim.createGame();
    s.balloonPollen = 120;
    sim.startConversion(s);
    for (let i = 0; i < 300; i++) sim.convert(s, 1 / 30);
    expect(s.balloonPollen).toBe(0);
    expect(s.honey).toBe(120);
    expect(sim.buy(s, "booster")).toBe(true);
  });
  it("continues the same random roll sequence after saving and reloading", () => {
    const s = sim.createGame();
    s.inventory.jelly = 100;
    for (let i = 0; i < 10; i++) sim.reroll(s, s.bees[0].id);
    const loaded = sim.restore(sim.serialize(s));
    for (let i = 0; i < 20; i++) {
      sim.reroll(s, s.bees[0].id);
      sim.reroll(loaded, loaded.bees[0].id);
      expect(loaded.bees[0].kind).toBe(s.bees[0].kind);
      expect(loaded.bees[0].gifted).toBe(s.bees[0].gifted);
    }
  });
  it("buys Star Treats with tickets and gifts an Event bee without rerolling it", () => {
    const s = sim.createGame();
    s.player.x = -28;
    s.player.z = 49;
    s.inventory.ticket = 10000;
    expect(sim.buyStarTreats(s, 10)).toBe(true);
    expect(s.inventory.ticket).toBe(0);
    s.bees[0].kind = "bee-41";
    s.bees[0].level = 9;
    expect(sim.makeGifted(s, s.bees[0].id)).toBe(true);
    expect(s.bees[0].gifted).toBe(true);
    expect(s.bees[0].kind).toBe("bee-41");
    expect(s.bees[0].level).toBe(9);
    expect(s.inventory.starTreat).toBe(9);
    expect(sim.makeGifted(s, s.bees[0].id)).toBe(false);
    expect(s.inventory.starTreat).toBe(9);
  });
  it("preserves gifted status and jelly preferences across reloads, defaulting old saves safely", () => {
    const s = sim.createGame();
    s.bees[0].gifted = true;
    s.settings.jellyRarity = "Mythic";
    s.settings.jellyGifted = true;
    const loaded = sim.restore(sim.serialize(s));
    expect(loaded.bees[0].gifted).toBe(true);
    expect(loaded.settings.jellyRarity).toBe("Mythic");
    expect(loaded.settings.jellyGifted).toBe(true);
    expect(
      sim.restore(JSON.stringify({ version: 2, bees: [{ kind: "bee-0" }] }))
        .bees[0].gifted,
    ).toBe(false);
  });
  it("single-use jelly consumes exactly one and preserves level and bond", () => {
    const s = sim.createGame();
    s.inventory.jelly = 100;
    s.bees[0].level = 8;
    s.bees[0].bond = 123;
    sim.reroll(s, s.bees[0].id);
    expect(s.inventory.jelly).toBe(99);
    expect(s.stats.jellyRolls).toBe(1);
    expect(s.bees[0].level).toBe(8);
    expect(s.bees[0].bond).toBe(123);
  });
  it("auto jelly stops at the first exact matching result and charges every roll", () => {
    const auto = sim.createGame(),
      manual = sim.createGame();
    auto.inventory.jelly = manual.inventory.jelly = 100000;
    auto.settings.jellyRarity = "Legendary";
    auto.settings.jellyGifted = true;
    let rolls = 0;
    do {
      sim.reroll(manual, manual.bees[0].id);
      rolls++;
    } while (
      rolls < 100000 &&
      !(
        sim.beeDefinition(manual.bees[0]).rarity === "Legendary" &&
        manual.bees[0].gifted
      )
    );
    sim.reroll(auto, auto.bees[0].id);
    while (auto.jellyRun?.running) sim.updateAutoJelly(auto, 1000);
    expect(auto.inventory.jelly).toBe(100000 - rolls);
    expect(auto.bees[0].kind).toBe(manual.bees[0].kind);
    expect(auto.bees[0].gifted).toBe(true);
    expect(auto.stats.jellyRolls).toBe(rolls);
  });
  it("keeps Mythics rare and rolls gifted independently of rarity", () => {
    const s = sim.createGame();
    s.inventory.jelly = 500000;
    let mythics = 0,
      gifted = 0,
      legendary = 0;
    for (let i = 0; i < 500000; i++) {
      sim.reroll(s, s.bees[0].id);
      if (sim.beeDefinition(s.bees[0]).rarity === "Mythic") mythics++;
      if (sim.beeDefinition(s.bees[0]).rarity === "Legendary") legendary++;
      if (s.bees[0].gifted) gifted++;
    }
    expect(mythics).toBeGreaterThan(5);
    expect(mythics).toBeLessThan(40);
    expect(gifted).toBeGreaterThan(1750);
    expect(gifted).toBeLessThan(2250);
    expect(legendary).toBeGreaterThan(14000);
    expect(legendary).toBeLessThan(16000);
  });
  it("auto jelly runs in bounded batches, can stop, and never spends beyond inventory", () => {
    const s = sim.createGame();
    s.settings.jellyRarity = "Mythic";
    s.settings.jellyGifted = true;
    s.inventory.jelly = 10000;
    sim.reroll(s, s.bees[0].id);
    expect(s.inventory.jelly).toBeGreaterThanOrEqual(9000);
    sim.cancelAutoJelly(s);
    const left = s.inventory.jelly;
    sim.updateAutoJelly(s, 1000);
    expect(s.inventory.jelly).toBe(left);
    s.inventory.jelly = 2;
    sim.reroll(s, s.bees[0].id);
    while (s.jellyRun?.running) sim.updateAutoJelly(s, 1000);
    expect(s.inventory.jelly).toBe(0);
    expect(s.jellyRun?.running).toBe(false);
  });
  it("refuses Royal Jelly on Event bees", () => {
    const s = sim.createGame();
    s.bees[0].kind = "bee-41";
    s.inventory.jelly = 50;
    expect(sim.reroll(s, s.bees[0].id)).toBe(false);
    expect(s.inventory.jelly).toBe(50);
  });
});
