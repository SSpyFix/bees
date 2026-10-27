import { ABILITIES, beeAbilities } from "../data/abilities";
import { FIELDS, BEES } from "../data/content";
import type { Vec } from "../data/content";
import type { Game, Bee, AbilityEffect } from "./types";
import {
  addBond,
  random,
  distance,
  harvest,
  buff,
  multiplier,
  spawnToken,
  beeDefinition,
  floating,
  event,
  awardHoney,
  convertCarried,
  damageEnemy,
} from "./simulation";
import { hiveBonus } from "./gifted";
const sameHeight = (a: Vec, b: Vec) => Math.abs(a.y - b.y) < 3;
const inField = (p: Vec) =>
  FIELDS.find(
    (f) =>
      Math.abs(p.x - f.x) < f.width / 2 + 1 &&
      Math.abs(p.z - f.z) < f.width / 2 + 1 &&
      sameHeight(p, f),
  );
export function areaMultiplier(s: Game, kind: string, p: Vec) {
  const marks = s.effects.filter(
    (e) =>
      e.kind === (kind === "pollen" ? "pollen-mark" : "honey-mark") &&
      distance(e, p) < e.radius &&
      sameHeight(e, p) &&
      e.life > 0,
  ).length;
  const clouds = s.effects.some(
    (e) =>
      e.kind === "cloud" &&
      distance(e, p) < e.radius &&
      sameHeight(e, p) &&
      e.life > 0,
  );
  return (
    (1 + 0.5 * Math.min(3, marks)) *
    (kind === "pollen" && clouds
      ? s.bees.some((b) => b.kind === "bee-45" && b.gifted)
        ? 2
        : 1.25
      : 1)
  );
}
function stack(
  s: Game,
  kind: string,
  amount: number,
  max: number,
  seconds: number,
) {
  const b = s.buffs.find((b) => b.kind === kind);
  if (b) {
    b.value = Math.min(max, b.value + amount);
    b.remaining = seconds;
  } else s.buffs.push({ kind, value: 1 + amount, remaining: seconds });
}
function effect(
  s: Game,
  kind: string,
  p: Vec,
  level: number,
  gifted: boolean,
  life: number,
  radius: number,
) {
  const e: AbilityEffect = {
    ...p,
    id: s.nextId++,
    kind,
    level,
    gifted,
    life,
    radius,
    tick: 0,
    stored: 0,
  };
  s.effects.push(e);
  // Finish balloon cargo before retiring old visuals; never silently discard stored pollen.
  if (s.effects.length > 160) {
    const old = s.effects.shift()!;
    if (old.kind === "balloon") s.balloonPollen += old.stored;
  }
  return e;
}
function area(
  s: Game,
  p: Vec,
  radius: number,
  amount: number,
  color?: string,
  instant = 0,
) {
  let total = 0;
  for (const f of s.flowers)
    if (
      distance(f, p) < radius &&
      sameHeight(f, p) &&
      (!color || f.color === color)
    )
      total += harvest(s, f, amount * hiveBonus(s, "ability-pollen"), instant);
  return total;
}
function pollinate(s: Game, p: Vec, radius: number, seconds: number) {
  for (const f of s.flowers)
    if (distance(f, p) < radius && sameHeight(f, p)) {
      f.pollination = Math.max(f.pollination, seconds);
      f.pollen = Math.min(f.max, f.pollen + f.max * 0.3);
    }
}
function goo(s: Game, p: Vec, radius: number) {
  for (const f of s.flowers)
    if (distance(f, p) < radius && sameHeight(f, p))
      f.goo = Math.max(f.goo, 20);
  effect(s, "goo", p, 1, false, 20, radius);
}
export function activateAbility(
  s: Game,
  kind: string,
  p: Vec,
  level = 1,
  gifted = false,
) {
  const power = 1 + level * 0.15;
  if (
    kind.includes("bomb") &&
    !kind.includes("sync") &&
    kind !== "fuzz-bombs"
  ) {
    const color = kind.startsWith("blue")
      ? "blue"
      : kind.startsWith("red")
        ? "red"
        : undefined;
    const radius =
      (kind.endsWith("plus") ? 7 : 4.5) * hiveBonus(s, "bomb-power");
    const amount =
      12 *
      power *
      hiveBonus(s, "bomb") *
      hiveBonus(s, `${color ?? "buzz"}-bomb`);
    const instant =
      hiveBonus(s, "instant-bomb") +
      (color && multiplier(s, `${color}-bomb-sync`) > 1 ? 0.1 : 0);
    area(s, p, radius, amount, color, instant);
    if (color && multiplier(s, `${color}-bomb-sync`) > 1)
      area(s, p, radius, amount, "white", instant);
    effect(s, "blast", p, level, gifted, 0.6, radius);
    return;
  }
  switch (kind) {
    case "blue":
    case "red":
    case "pollen":
    case "convert":
    case "critical":
      buff(s, kind, 2, 20);
      break;
    case "bomb":
      activateAbility(s, "buzz-bomb", p, level, gifted);
      break;
    case "blue-boost":
    case "red-boost":
    case "white-boost":
      stack(s, kind.split("-")[0], 0.2, 3, 15);
      break;
    case "haste":
      stack(s, "haste", 0.1, 2, 20);
      break;
    case "focus":
      stack(s, "focus", 0.03, 1.3, 20);
      break;
    case "rage":
      stack(s, "rage", 1, 4, 45);
      break;
    case "melody":
      buff(s, "melody", 2, 30);
      break;
    case "inspire":
      stack(s, "inspire", 1, 51, 5);
      break;
    case "baby-love":
      buff(s, "baby-love", 2, 30);
      buff(s, "luck", 1.5, 30);
      break;
    case "honey-gift":
    case "honey-gift-plus":
      awardHoney(
        s,
        (kind.endsWith("plus") ? 50 : 25) * level * hiveBonus(s, "honey-token"),
      );
      break;
    case "pollen-mark":
    case "pollen-mark-plus":
    case "honey-mark":
    case "honey-mark-plus": {
      const plus = kind.endsWith("plus");
      effect(
        s,
        kind.startsWith("pollen") ? "pollen-mark" : "honey-mark",
        p,
        level,
        gifted,
        (7 + level * 0.2 + (plus ? 1 : 0)) * hiveBonus(s, "mark-duration"),
        plus ? 7 : 5,
      );
      break;
    }
    case "inflate-balloons": {
      const balloon = effect(s, "balloon", p, level, gifted, 45, 7);
      balloon.stored = 20 * level;
      for (const e of s.effects)
        if (e.kind === "balloon" && sameHeight(e, p) && e.id !== balloon.id)
          e.stored *= 1.1;
      break;
    }
    case "surprise-party": {
      effect(s, "balloon", p, level, true, 55, 9).stored = 100 * level;
      const choices = [
        "blue-boost",
        "white-boost",
        "haste",
        "token-link",
        "melody",
      ];
      for (let i = 0; i < 8; i++)
        spawnToken(
          s,
          p.x + Math.cos(i) * 5,
          p.y,
          p.z + Math.sin(i) * 5,
          choices[i % choices.length],
          level,
        );
      break;
    }
    case "fuzz-bombs":
      pollinate(s, p, 7, 20);
      area(s, p, 7, 20 * power * hiveBonus(s, "bomb"));
      effect(s, "haze", p, level, gifted, 3, 7);
      break;
    case "pollen-haze": {
      const f = inField(p);
      if (f) pollinate(s, f, 16, 30);
      effect(s, "haze", f ?? p, level, gifted, 30, 14);
      break;
    }
    case "target-practice": {
      const group = s.nextId++;
      for (let i = 0; i < 3; i++) {
        const a = (i * Math.PI * 2) / 3;
        const target = effect(
          s,
          "target",
          { x: p.x + Math.cos(a) * 4, y: p.y, z: p.z + Math.sin(a) * 4 },
          level,
          gifted,
          12,
          1.7,
        );
        target.group = group;
      }
      break;
    }
    case "precise-mark":
      effect(s, "precise-mark", p, level, gifted, 10 + level * 0.2, 5);
      break;
    case "inferno":
      for (let i = 0; i < 6; i++)
        effect(
          s,
          "flame",
          { x: p.x + Math.cos(i) * 4, y: p.y, z: p.z + Math.sin(i) * 4 },
          level,
          gifted,
          8 * hiveBonus(s, "flame-duration"),
          2.5,
        );
      for (let i = 0; i < 2; i++)
        effect(
          s,
          "fire-bee",
          { x: p.x + i * 2, y: p.y, z: p.z },
          level,
          gifted,
          15,
          3,
        );
      break;
    case "flame-fuel":
      for (const e of s.effects)
        if (e.kind === "flame" && sameHeight(e, p))
          e.life = Math.min(30, e.life + 5);
      convertCarried(
        s,
        s.bees.reduce(
          (sum, b) => sum + beeDefinition(b).conversion * b.level,
          0,
        ) * 0.2,
      );
      break;
    case "summon-frog":
      effect(s, "frog", p, level, gifted, 20, 4);
      break;
    case "triangulate": {
      const e = effect(s, "triangle", p, level, gifted, 3, 8);
      e.points = [
        { x: p.x, z: p.z },
        { x: s.player.x, z: s.player.z },
        { x: (p.x + s.player.x) / 2 + 6, z: (p.z + s.player.z) / 2 - 6 },
      ];
      // Avoid degenerate geometry when the player collects the token directly beneath the bee.
      if (distance(e.points[0], e.points[1]) < 2)
        e.points[1] = { x: p.x - 6, z: p.z + 4 };
      for (const f of s.flowers)
        if (sameHeight(f, p) && insideTriangle(f, e.points))
          harvest(s, f, 30 * power * hiveBonus(s, "ability-pollen"));
      break;
    }
    case "mark-surge":
      for (const e of s.effects)
        if (e.kind.includes("mark") && sameHeight(e, p)) {
          e.life = Math.min(30, e.life + 5);
          area(s, e, e.radius, 20 * power);
        }
      break;
    case "bear-morph":
      buff(s, "bear-morph", gifted ? 2.5 : 2, 30);
      break;
    case "blue-pulse":
    case "red-pulse": {
      const color = kind.split("-")[0];
      for (const b of s.bees)
        if (beeDefinition(b).color === color && sameHeight(b, p))
          area(s, b, 4, 15 * power, color);
      effect(s, "pulse", p, level, gifted, 1, 8);
      break;
    }
    case "blue-bomb-sync":
    case "red-bomb-sync":
      buff(s, kind, 1.1, 20);
      buff(s, kind.split("-")[0], 1.1, 20);
      break;
    case "glitch": {
      const f = inField(p);
      if (f) buff(s, `corrupt:${f.id}`, 1.2, 20);
      effect(s, "glitch", p, level, gifted, 20, 10);
      break;
    }
    case "map-corruption":
      for (const f of FIELDS.filter((f) => f.gate <= s.bees.length).slice(
        0,
        3 + Math.floor(level / 5),
      ))
        buff(s, `corrupt:${f.id}`, 1.2, 30);
      break;
    case "mind-hack":
      for (const e of s.enemies
        .filter((e) => e.hp > 0 && sameHeight(e, p) && distance(e, p) < 16)
        .slice(0, 3 + Math.floor(level / 3))) {
        buff(s, `hacked:${e.id}`, 1.25, 3 + level * 0.1);
        effect(s, "hack", e, level, gifted, 3, 2);
      }
      break;
    case "festive-gift":
      for (let i = 0; i < 4; i++)
        spawnToken(
          s,
          p.x + Math.cos(i * 1.6) * 3,
          p.y,
          p.z + Math.sin(i * 1.6) * 3,
          "honey",
          25 * level,
        );
      spawnToken(s, p.x + 1, p.y, p.z + 1, "treat", gifted ? 5 : 2);
      buff(s, "convert", gifted ? 2 : 1.5, 10);
      if (gifted) buff(s, "festive-blessing", 2, 10);
      break;
    case "glob":
      goo(s, p, gifted ? 7 : 4);
      break;
    case "gumdrop-barrage":
      for (let i = 0; i < 5; i++)
        goo(
          s,
          {
            x: p.x + (random(s) - 0.5) * 14,
            y: p.y,
            z: p.z + (random(s) - 0.5) * 14,
          },
          3,
        );
      break;
    case "beamstorm":
      for (let i = 0; i < 8; i++) {
        const pos = {
          x: p.x + (random(s) - 0.5) * 15,
          y: p.y,
          z: p.z + (random(s) - 0.5) * 15,
        };
        area(s, pos, 2.5, 35 * power, undefined, gifted ? 1 : 0);
        effect(s, "beam", pos, level, gifted, 0.8, 1);
      }
      break;
    case "puppy-love":
      for (const b of s.bees)
        if (distance(b, p) < 15) {
          b.energy = Math.min(beeDefinition(b).energy, b.energy + 15);
          addBond(s, b, 10 * level);
        }
      break;
    case "fetch":
      effect(s, "ball", { x: p.x + 4, y: p.y, z: p.z }, level, gifted, 15, 2);
      break;
    case "tabby-love":
      s.beeProgress.tabbyLove = Math.min(1000, s.beeProgress.tabbyLove + 1);
      break;
    case "scratch": {
      const amount =
        18 * power * (1 + s.beeProgress.tabbyLove * 0.01) * (gifted ? 2 : 1);
      for (const f of s.flowers)
        if (
          sameHeight(f, p) &&
          Math.abs(f.z - p.z) < 6 &&
          [-2, 0, 2].some((x) => Math.abs(f.x - p.x - x) < 0.7)
        )
          harvest(s, f, amount * hiveBonus(s, "ability-pollen"));
      effect(s, "scratch", p, level, gifted, 1, 6);
      break;
    }
    case "impale":
      for (const e of s.enemies)
        if (e.hp > 0 && sameHeight(e, p) && distance(e, p) < 16) {
          damageEnemy(
            s,
            e,
            Math.max(level * 5, Math.min(e.maxHp * 0.05, level * 100)),
          );
          effect(s, "spike", e, level, gifted, 0.8, 1);
        }
      break;
    case "rain-cloud":
      effect(s, "cloud", p, level, gifted, 25, 6);
      break;
    case "tornado": {
      const haste = s.buffs.find((b) => b.kind === "haste");
      const stacks = Math.round(((haste?.value ?? 1) - 1) * 10);
      if (!stacks) {
        floating(s, p.x, p.y + 2, p.z, "Tornado needs Haste");
        break;
      }
      s.buffs = s.buffs.filter((b) => b.kind !== "haste");
      effect(s, "tornado", p, level, gifted, 5 + stacks, 5);
      break;
    }
  }
}
function insideTriangle(
  p: { x: number; z: number },
  v: { x: number; z: number }[],
) {
  const sign = (a: typeof p, b: typeof p, c: typeof p) =>
    (a.x - c.x) * (b.z - c.z) - (b.x - c.x) * (a.z - c.z);
  const a = sign(p, v[0], v[1]),
    b = sign(p, v[1], v[2]),
    c = sign(p, v[2], v[0]);
  return !((a < 0 || b < 0 || c < 0) && (a > 0 || b > 0 || c > 0));
}
export function collectToken(s: Game, id: number) {
  const t = s.tokens.find((t) => t.id === id);
  if (!t || t.life <= 0) return;
  s.tokens = s.tokens.filter((x) => x.id !== id);
  s.stats.tokens++;
  event(s, "token", 1);
  if (t.kind === "honey") {
    awardHoney(s, t.value * hiveBonus(s, "honey-token"));
    return;
  }
  if (t.kind === "treat" || t.kind === "ticket") {
    s.inventory[t.kind] += t.value;
    return;
  }
  if (t.kind === "token-link") {
    const f = inField(t),
      ids = s.tokens
        .filter(
          (x) =>
            x.kind !== "token-link" &&
            x.life > 0 &&
            sameHeight(x, t) &&
            (f ? inField(x)?.id === f.id : distance(x, t) < 18),
        )
        .map((x) => x.id);
    for (const linked of ids) {
      collectToken(s, linked);
      awardHoney(s, (25 + 10 * t.value) * hiveBonus(s, "honey-token"));
    }
  } else activateAbility(s, t.kind, t, t.value, t.gifted ?? false);
}
export function spawnBeeAbilities(
  s: Game,
  b: Bee,
  mode: "gather" | "battle" | "idle",
) {
  if (b.abilityTimer > 0) return;
  const choices = beeAbilities(beeDefinition(b), b.gifted).filter((id) =>
    mode === "gather"
      ? id !== "impale" && id !== "mind-hack"
      : mode === "battle"
        ? ABILITIES[id].battle
        : ABILITIES[id].idle,
  );
  if (!choices.length) return;
  const kind = choices[Math.floor(random(s) * choices.length)];
  spawnToken(s, b.x, s.player.y, b.z, kind, b.level, b.gifted, b.id);
  const f = inField(b),
    duplication =
      hiveBonus(s, "duplication") +
      (f ? multiplier(s, `corrupt:${f.id}`) - 1 : 0);
  if (random(s) < duplication)
    spawnToken(s, b.x + 2, s.player.y, b.z + 1, kind, b.level, b.gifted, b.id);
  b.abilityTimer = 14 + random(s) * 18;
}
export function gatherPassive(s: Game, b: Bee) {
  const def = beeDefinition(b);
  if (def.face === "bubble" && random(s) < 0.25)
    effect(
      s,
      "bubble",
      b,
      b.level,
      b.gifted,
      12 * hiveBonus(s, "bubble-duration"),
      3,
    );
  if (["fire", "demon"].includes(def.face) && random(s) < 0.2)
    effect(
      s,
      "flame",
      b,
      b.level,
      b.gifted,
      7 * hiveBonus(s, "flame-duration"),
      2.5,
    );
  if (def.face === "fuzzy" && random(s) < 0.3) pollinate(s, b, 3, 15);
}
export function updateEffects(s: Game, dt: number) {
  for (const f of s.flowers) {
    f.pollination = Math.max(0, f.pollination - dt);
    f.goo = Math.max(0, f.goo - dt);
  }
  const expired = new Set<number>();
  for (const e of s.effects) {
    e.life -= dt;
    if (e.life <= 0) {
      if (e.kind === "balloon") {
        s.balloonPollen += e.stored;
        e.stored = 0;
      }
      expired.add(e.id);
    }
  }
  s.effects = s.effects.filter((e) => !expired.has(e.id));
  for (const e of [...s.effects]) {
    e.tick -= dt;
    const near = distance(s.player, e) < e.radius && sameHeight(s.player, e);
    if (e.kind === "bubble" && near) {
      area(s, e, 4, 15 * (1 + e.level * 0.15) * hiveBonus(s, "bubble"));
      pollinate(s, e, 4, 3);
      expired.add(e.id);
    }
    if (e.kind === "target" && near) {
      expired.add(e.id);
      stack(s, "red", 0.2, 3, 15);
      convertCarried(s, 10 * e.level);
      if (
        !s.effects.some(
          (x) =>
            x.kind === "target" && x.group === e.group && !expired.has(x.id),
        )
      ) {
        stack(s, "precision", 0.03, 1.3, 60);
        if (e.gifted) effect(s, "precise-mark", e, e.level, true, 12, 5);
      }
    }
    if (e.kind === "ball" && near) {
      s.beeProgress.fetch = Math.min(10, s.beeProgress.fetch + 1);
      s.inventory.treat += 1 + s.beeProgress.fetch;
      e.x += 3 * Math.cos(s.beeProgress.fetch);
      e.z += 3 * Math.sin(s.beeProgress.fetch);
      if (s.beeProgress.fetch === 10) expired.add(e.id);
    }
    if (e.tick > 0) continue;
    e.tick = 1;
    if (e.kind === "honey-mark" && near) convertCarried(s, 20 * e.level);
    if (e.kind === "precise-mark" && near) buff(s, "precision", 1.1, 2);
    if (e.kind === "flame")
      area(s, e, e.radius, 8 * hiveBonus(s, "flame"), "red");
    if (e.kind === "cloud") {
      pollinate(s, e, e.radius, 2);
      e.x += Math.sin(s.clock + e.id) * 0.2;
    }
    if (["frog", "tornado", "fire-bee"].includes(e.kind)) {
      const a = random(s) * Math.PI * 2;
      e.x += Math.cos(a) * 2;
      e.z += Math.sin(a) * 2;
      const f = inField(s.player);
      if (f) {
        e.x = Math.max(f.x - 9, Math.min(f.x + 9, e.x));
        e.z = Math.max(f.z - 9, Math.min(f.z + 9, e.z));
      }
      area(
        s,
        e,
        e.radius,
        (e.kind === "tornado" ? 20 : 6) * e.level,
        e.kind === "fire-bee" ? "red" : undefined,
      );
      for (const enemy of s.enemies)
        if (
          enemy.hp > 0 &&
          distance(enemy, e) < e.radius + 3 &&
          sameHeight(enemy, e)
        )
          damageEnemy(s, enemy, e.level * (e.kind === "tornado" ? 8 : 3));
      if (e.kind !== "fire-bee")
        for (const t of [...s.tokens])
          if (distance(t, e) < e.radius && sameHeight(t, e))
            collectToken(s, t.id);
      if (e.kind === "frog") {
        effect(
          s,
          "bubble",
          e,
          e.level,
          e.gifted,
          8 * hiveBonus(s, "bubble-duration"),
          3,
        );
        if (e.gifted) convertCarried(s, 5 * e.level);
      }
    }
  }
  s.effects = s.effects.filter((e) => !expired.has(e.id));
}
