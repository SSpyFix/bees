import { describe, expect, it } from "vitest";
import {
  createGame,
  step,
  collect,
  serialize,
  restore,
} from "../game/systems/simulation";
import { applyAbility, stackAbility } from "../game/systems/abilities";

describe("ability tokens", () => {
  it("stacks color boosts, haste and focus to their reference limits", () => {
    const s = createGame();
    for (let i = 0; i < 15; i++) {
      stackAbility(s, "red");
      stackAbility(s, "haste");
      stackAbility(s, "focus");
      stackAbility(s, "rage");
    }
    expect(s.buffs.find((b) => b.kind === "red")).toMatchObject({
      stacks: 10,
      value: 3,
      remaining: 15,
    });
    expect(s.buffs.find((b) => b.kind === "haste")).toMatchObject({
      stacks: 10,
      value: 2,
      remaining: 20,
    });
    expect(s.buffs.find((b) => b.kind === "focus")).toMatchObject({
      stacks: 10,
      value: 0.3,
      remaining: 20,
    });
    expect(s.buffs.find((b) => b.kind === "rage")).toMatchObject({
      stacks: 4,
      value: 4,
      remaining: 45,
    });
    step(s, 1);
    stackAbility(s, "red");
    expect(s.buffs.find((b) => b.kind === "red")?.remaining).toBe(15);
  });
  it("does not multiply ordinary collection by focus", () => {
    const s = createGame(),
      t = createGame();
    for (const state of [s, t]) {
      state.player.x = -27;
      state.player.z = 34;
      state.seed = 100;
    }
    stackAbility(t, "focus");
    // Both rolls exceed the boosted crit chance, so ordinary yields must match.
    s.seed = t.seed = 100000;
    expect(collect(s)).toBeCloseTo(collect(t));
  });
  it("red bombs affect red flowers only and build bomb combo", () => {
    const s = createGame();
    s.player.x = -27;
    s.player.z = 34;
    s.capacity = 1e8;
    const f = s.flowers.find(
      (f) => f.field === "sunflower" && f.color === "red",
    )!;
    applyAbility(s, {
      id: 999,
      x: f.x,
      y: f.y,
      z: f.z,
      kind: "redBomb",
      value: 1,
      life: 10,
    });
    expect(
      s.flowers.filter((f) => f.pollen < f.max).every((f) => f.color === "red"),
    ).toBe(true);
    expect(s.buffs.find((b) => b.kind === "bombCombo")?.stacks).toBe(1);
  });
  it("Token Link collects nearby tokens once, never recursively links, and pays honey", () => {
    const s = createGame();
    s.tokens = [
      { id: 1, x: 0, y: 0, z: 53, kind: "red", value: 1, life: 10 },
      { id: 2, x: 2, y: 0, z: 53, kind: "ticket", value: 2, life: 10 },
      { id: 3, x: 0, y: 0, z: 53, kind: "link", value: 1, life: 10 },
    ];
    applyAbility(s, {
      id: 4,
      x: 0,
      y: 0,
      z: 53,
      kind: "link",
      value: 1,
      life: 10,
    });
    expect(s.inventory.ticket).toBe(2);
    expect(s.stats.tokens).toBe(2);
    expect(s.honey).toBe(70);
    expect(s.tokens).toHaveLength(1);
    expect(s.tokens[0].kind).toBe("link");
    applyAbility(s, {
      id: 5,
      x: 0,
      y: 0,
      z: 53,
      kind: "link",
      value: 1,
      life: 10,
    });
    expect(s.honey).toBe(70);
  });
  it("restores only valid unexpired buffs, with elapsed offline time", () => {
    const s = createGame();
    stackAbility(s, "blue");
    stackAbility(s, "focus");
    const raw = JSON.parse(serialize(s));
    raw.savedAt -= 5000;
    raw.buffs.push({ kind: "unknown", value: 100, remaining: 100000 });
    const t = restore(JSON.stringify(raw));
    expect(t.buffs.find((b) => b.kind === "blue")?.remaining).toBeCloseTo(
      10,
      0,
    );
    expect(t.buffs.find((b) => b.kind === "focus")?.value).toBe(0.03);
    expect(t.buffs.some((b) => b.kind === "unknown")).toBe(false);
  });
});
