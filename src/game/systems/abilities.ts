import { hiveModifiers } from "./modifiers";
import { ITEM_NAMES } from "../data/progression";
import { ABILITIES, abilityInfo } from "../data/abilities";
import { FIELDS } from "../data/content";
import type { Game, Token } from "./types";
import { distance, event, floating, harvest, buff } from "./simulation";

export function stackAbility(s: Game, kind: string) {
  const def = ABILITIES[kind];
  if (!def?.duration) return false;
  let b = s.buffs.find((b) => b.kind === kind);
  if (!b) {
    b = { kind, stacks: 0, value: 1, remaining: 0 };
    s.buffs.push(b);
  }
  b.stacks = Math.min(def.cap ?? 1, (b.stacks ?? 0) + 1);
  b.value = (def.base ?? 1) + (def.increment ?? 1) * b.stacks;
  b.remaining = def.duration;
  return true;
}
export function effect(
  s: Game,
  t: { x: number; y: number; z: number },
  kind: string,
  radius: number,
  duration: number,
) {
  s.effects.push({
    ...t,
    id: s.nextId++,
    kind,
    radius,
    life: duration,
    duration,
  });
  if (s.effects.length > 40) s.effects.shift();
}

export function applyAbility(s: Game, t: Token) {
  const level = Math.max(1, t.value);
  if (stackAbility(s, t.kind)) return;
  if (t.kind === "honey") {
    const honey = t.value * hiveModifiers(s).honeyToken;
    s.honey += honey;
    s.stats.honey += honey;
    event(s, "earn", honey);
    floating(s, t.x, t.y + 1, t.z, `+${Math.round(t.value)} Honey`);
  } else if (Object.hasOwn(ITEM_NAMES, t.kind)) {
    s.inventory[t.kind] += t.value;
    floating(s, t.x, t.y + 1, t.z, `+${t.value} ${abilityInfo(t.kind).name}`);
  } else if (t.kind === "link") {
    const linked = s.tokens.filter(
      (token) =>
        token.kind !== "link" &&
        token.life > 0 &&
        Math.abs(token.y - t.y) < 3 &&
        distance(token, t) < 35,
    );
    const ids = new Set(linked.map((token) => token.id));
    s.tokens = s.tokens.filter((token) => !ids.has(token.id));
    for (const token of linked) {
      s.stats.tokens++;
      event(s, "token", 1, token.kind);
      if (!Object.hasOwn(ITEM_NAMES, token.kind) && token.kind !== "honey")
        event(s, "ability", 1);
      applyAbility(s, token);
    }
    const honey = linked.length * (25 + 10 * level);
    s.honey += honey;
    s.stats.honey += honey;
    event(s, "earn", honey);
    effect(s, t, "link", 6, 0.65);
  } else if (/bomb/i.test(t.kind)) {
    const color = t.kind.startsWith("red")
      ? "red"
      : t.kind.startsWith("blue")
        ? "blue"
        : null;
    const plus = t.kind.endsWith("Plus"),
      count = plus ? 29 : 19;
    const combo = s.buffs.find((b) => b.kind === "bombCombo")?.value ?? 1;
    const flowers = s.flowers
      .filter(
        (f) =>
          Math.abs(f.y - t.y) < 3 &&
          (!color || f.color === color) &&
          distance(f, t) < 8,
      )
      .sort((a, b) => distance(a, t) - distance(b, t))
      .slice(0, count);
    let amount = 0;
    for (const f of flowers)
      amount += harvest(
        s,
        f,
        (plus ? 10 : 7) *
          (1 + 0.1 * (level - 1)) *
          combo *
          hiveModifiers(s).bomb *
          (color === "red"
            ? hiveModifiers(s).redBomb
            : color === "blue"
              ? hiveModifiers(s).blueBomb
              : hiveModifiers(s).buzzBomb),
      );
    stackAbility(s, "bombCombo");
    effect(s, t, t.kind, plus ? 5 : 3.5, 0.8);
    floating(
      s,
      t.x,
      t.y + 1,
      t.z,
      `+${Math.ceil(amount)} ${abilityInfo(t.kind).name}`,
    );
  } else if (t.kind === "bubble" || t.kind === "goo" || t.kind === "flame") {
    effect(
      s,
      t,
      t.kind,
      t.kind === "goo" ? 5 : 3,
      t.kind === "flame" ? 5 : 1.5,
    );
    for (const f of s.flowers)
      if (distance(f, t) < 4 && Math.abs(f.y - t.y) < 3) {
        harvest(
          s,
          f,
          (t.kind === "bubble" && f.color === "blue" ? 8 : 4) * level,
        );
        if (t.kind === "goo") event(s, "goo", 4 * level);
        if (t.kind === "bubble")
          f.pollen = Math.min(f.max, f.pollen + f.regen * 4);
      }
  } else if (t.kind === "pollenMark" || t.kind === "honeyMark")
    effect(s, t, t.kind, 4, 7 + level);
  else if (t.kind === "beam" || t.kind === "tornado") {
    const flowers = s.flowers
      .filter((f) => distance(f, t) < 12 && Math.abs(f.y - t.y) < 3)
      .sort((a, b) => distance(a, t) - distance(b, t))
      .slice(0, t.kind === "beam" ? 30 : 45);
    for (const f of flowers) {
      harvest(s, f, 15 * level);
      if (t.kind === "beam") effect(s, f, "beam", 0.25, 0.75);
    }
    if (t.kind === "tornado") effect(s, t, "tornado", 4, 4);
  } else if (t.kind === "impale") {
    for (const e of s.enemies)
      if (e.hp > 0 && distance(e, t) < 18 && Math.abs(e.y - t.y) < 3)
        e.hp = Math.max(0.001, e.hp - Math.min(e.maxHp * 0.05, 1000) * level);
    effect(s, t, "impale", 4, 1);
  } else if (t.kind === "critical") buff(s, "critical", 4, 20);
}

/** Validate saved buffs using known limits; offline time cannot extend them. */
export function restoreBuffs(s: Game, saved: unknown, elapsed: number) {
  if (!Array.isArray(saved)) return;
  for (const value of saved.slice(0, 60)) {
    if (
      !value ||
      typeof value.kind !== "string" ||
      typeof value.remaining !== "number" ||
      !Number.isFinite(value.remaining)
    )
      continue;
    const def = ABILITIES[value.kind];
    const field =
      value.kind.startsWith("field:") &&
      FIELDS.some((f) => `field:${f.id}` === value.kind);
    const max = def?.duration ?? (field ? 900 : 600);
    const remaining = Math.min(max, value.remaining) - elapsed;
    if (remaining <= 0 || (!def && !field)) continue;
    if (def?.duration) {
      const stacks =
        typeof value.stacks === "number" && Number.isFinite(value.stacks)
          ? Math.max(1, Math.min(def.cap ?? 1, Math.floor(value.stacks)))
          : 1;
      s.buffs.push({
        kind: value.kind,
        remaining,
        stacks,
        value: (def.base ?? 1) + (def.increment ?? 1) * stacks,
      });
    } else if (typeof value.value === "number" && Number.isFinite(value.value))
      s.buffs.push({
        kind: value.kind,
        remaining,
        value: Math.max(1, Math.min(5, value.value)),
      });
  }
}
