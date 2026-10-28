import { hiveModifiers, effectiveCapacity, updateCapacity } from "./modifiers";
import { followBee } from './bee-follow';
import { BADGES, RECIPES, SPRINKLERS } from "../data/support";
import { badgeProgress } from "./badges";
import { tickCraft } from "./crafting";
import { tickSprinklers } from "./sprinklers";
import { applyAbility, stackAbility, restoreBuffs, collectToken, updateEffects, spawnBeeAbilities, gatherPassive, areaMultiplier } from "./abilities";
import {
  EGGS,
  ITEM_NAMES,
  TICKET_ITEMS,
  bondRequired,
  type EggKind,
} from "../data/progression";
import { collectorTargets } from "./collector";
import importedMap from "../data/imported-map.json";
export { bondRequired } from "../data/progression";
import {
  FIELDS,
  EVENT_OFFERS,
  BEES,
  GEAR,
  BAGS,
  TOOLS,
  HIVE,
  HIVE_PADS,
  QUESTS,
  ENEMY_SPAWNS,
  ENEMY_TYPES,
  PLACES,
} from "../data/content";
import type { Color } from "../data/content";
import { hiveBonus, giftedStats } from "./gifted";
import type { Game, Bee, Flower, Enemy } from "./types";
import { surface, solidAt, lockedAt } from "../world/terrain";
export type { Game, Bee, Flower } from "./types";
export const distance = (
  a: { x: number; z: number },
  b: { x: number; z: number },
) => Math.hypot(a.x - b.x, a.z - b.z);
const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));
export function random(s: Game) {
  s.seed = (Math.imul(s.seed, 1664525) + 1013904223) >>> 0;
  return s.seed / 4294967296;
}
export function notify(s: Game, text: string) {
  s.notification = text;
  s.noticeId++;
}
export function floating(
  s: Game,
  x: number,
  y: number,
  z: number,
  text: string,
  color = "#f9e79a",
) {
  s.floaters.push({ id: s.nextId++, x, y, z, text, color, life: 1.6 });
  if (s.floaters.length > 35) s.floaters.shift();
}
export function beeDefinition(b: Bee) {
  return BEES.find((x) => x.id === b.kind) ?? BEES[0];
}
export function newBee(s: Game, kind: string): Bee {
  const d = BEES.find((x) => x.id === kind) ?? BEES[0];
  if (!s.discoveredBees.includes(d.id)) s.discoveredBees.push(d.id);
  return {
    id: `b${s.nextId++}`,
    kind: d.id,
    level: 1,
    gifted: false,
    bond: 0,
    energy: d.energy,
    state: "following",
    x: s.player.x + (random(s) - 0.5) * 4,
    y: s.player.y + 2.5,
    z: s.player.z + 2,
    phase: random(s) * Math.PI * 2,
    target: -1,
    timer: random(s) * 1.5,
    abilityTimer: 12 + random(s) * 15,
  };
}
export function createGame(): Game {
  const s: Game = {
    version: 2,
    hive: 3,
    honey: 0,
    adminBoosts: { pollen: false, honey: false },
    pollen: 0,
    capacity: 200,
    tool: "tool-0",
    bag: "bag-0",
    boots: "",
    hat: "",
    owned: ["tool-0", "bag-0"],
    slots: 25,
    eggsPurchased: 0,
    jelliesPurchased: 0,
    lifetime: {},
    badges: {},
    crafting: null,
    sprinkler: -1,
    sprinklers: [],
    bees: [],
    discoveredBees: [],
    player: {
      ...importedMap.spawn,
      yaw: Math.PI,
      vy: 0,
      hp: 100,
      invulnerable: 0,
      moving: false,
      grounded: true,
      swing: 0,
    },
    flowers: [],
    enemies: [],
    tokens: [],
    buffs: [],
    floaters: [],
    effects: [],
    beeProgress: { tabbyLove: 0, fetch: 0 },
    balloonPollen: 0,
    hotbar: ['egg', 'booster', 'converter', 'treat', 'jelly', null, null, null, null],
    inventory: {
      egg: 1,
      treat: 5,
      jelly: 0,
      booster: 0,
      converter: 0,
      ticket: 0,
      silverEgg: 0,
      goldEgg: 0,
      diamondEgg: 0,
      mythicEgg: 0,
      giftedEgg: 0, giftedSilverEgg: 0, giftedGoldEgg: 0, giftedDiamondEgg: 0, giftedMythicEgg: 0,
      starJelly: 0,
      starTreat: 0,
      sunflowerSeed: 0,
      strawberry: 0,
      blueberry: 0,
      pineapple: 0,
      gumdrops: 0,
      stinger: 0,
      moonCharm: 0,
      glitter: 0,
      glue: 0,
      redExtract: 0,
      blueExtract: 0,
      oil: 0,
      enzymes: 0,
      softWax: 0,
      magicBean: 0,
      coconut: 0,
      tropicalDrink: 0,
      spiritPetal: 0,
      refreshingVial: 0,
      comfortingVial: 0,
      invigoratingVial: 0,
      satisfyingVial: 0,
      hardWax: 0,
      causticWax: 0,
      swirledWax: 0,
      superSmoothie: 0,
      turpentine: 0,
    },
    accepted: {},
    completed: [],
    unlocks: [0],
    stats: {
      pollen: 0,
      honey: 0,
      spent: 0,
      kills: 0,
      tokens: 0,
      hatches: 0,
      levels: 0,
      time: 0,
      jellyRolls: 0,
    },
    flight: null,
    converting: false,
    clock: 0,
    gatherCooldown: 0,
    lastFull: -10,
    seed: 42719,
    nextId: 1,
    notification: "Welcome to the meadow. Black Bear has a quest for you.",
    noticeId: 1,
    cooldowns: {},
    challenge: null,
    jellyRun: null,
    settings: { volume: 0.35, muted: false, sensitivity: 1, quality: "high", jellyRarity: "Any", jellyGifted: false },
  };
  for (const [x, y, z, fieldIndex, colorIndex, size, texture, width] of importedMap.flowers) {
    const field = importedMap.fields[fieldIndex], max = 12 * size * (1 + field.gate * 0.1);
    s.flowers.push({ id: s.flowers.length, field: field.id, x, y, z,
      color: (["white", "red", "blue"] as Color[])[colorIndex], size, texture, width,
      pollination: 0, goo: 0, pollen: max, max, regen: 0.8 + size * 0.3, multiplier: 1 + field.gate * 0.025 });
  }
  s.bees.push(newBee(s, "bee-0"));
  s.enemies = ENEMY_SPAWNS.map((e, i) => ({
    ...e,
    id: i,
    homeX: e.x,
    homeZ: e.z,
    hp: ENEMY_TYPES[e.type].hp,
    maxHp: ENEMY_TYPES[e.type].hp,
    cooldown: 0,
    respawn: 0,
    hit: 0,
    windup: 0,
  }));
  return s;
}
export function event(s: Game, kind: string, amount: number, target?: string) {
  if (!Number.isFinite(amount) || amount <= 0) return;
  const key = target ? `${kind}:${target}` : kind;
  s.lifetime[key] = (s.lifetime[key] ?? 0) + amount;
  for (const [id, progress] of Object.entries(s.accepted)) {
    const q = QUESTS.find((q) => q.id === id);
    if (!q) continue;
    q.objectives.forEach((o, i) => {
      if (o.event === kind && (!o.target || o.target === target))
        progress[i] = Math.min(o.amount, (progress[i] ?? 0) + amount);
    });
  }
}
export function buff(s: Game, kind: string, value: number, seconds: number) {
  const b = s.buffs.find((b) => b.kind === kind);
  if (b) {
    b.remaining = Math.max(b.remaining, seconds);
    b.value = Math.max(b.value, value);
  } else s.buffs.push({ kind, value, remaining: seconds });
}
export function multiplier(s: Game, kind: string) {
  return s.buffs.find((b) => b.kind === kind)?.value ?? 1;
}
export function awardHoney(s: Game, amount: number) {
  if (amount <= 0 || !Number.isFinite(amount)) return;
  amount *= s.adminBoosts.honey ? 10 : 1;
  s.honey += amount;
  s.stats.honey += amount;
  // Repeated fractional conversion ticks must not leave 120 as 119.9999999999.
  if (Math.abs(s.honey - Math.round(s.honey)) < 1e-9)
    s.honey = Math.round(s.honey);
  if (Math.abs(s.stats.honey - Math.round(s.stats.honey)) < 1e-9)
    s.stats.honey = Math.round(s.stats.honey);
  event(s, "earn", amount);
}
export function convertCarried(s: Game, amount: number, honeyMultiplier = 1) {
  const converted = Math.min(s.pollen, Math.max(0, amount));
  s.pollen -= converted;
  awardHoney(s, converted * hiveBonus(s, "honey-per-pollen") * honeyMultiplier);
  event(s, "convert", converted);
  return converted;
}
export function criticalMultiplier(s: Game) {
  const precision =
    (s.buffs.find((b) => b.kind === "precision")?.value ?? 1) - 1;
  const chance = Math.min(
    1,
    0.05 * multiplier(s, "critical") +
      ((s.buffs.find((b) => b.kind === "focus")?.value ?? 1) - 1) +
      hiveBonus(s, "critical-chance") +
      precision,
  );
  if (random(s) >= chance) return 1;
  const power =
    2 + hiveBonus(s, "critical-power") + multiplier(s, "melody") - 1;
  return (
    power * (random(s) < hiveBonus(s, "super-critical") + precision ? 2 : 1)
  );
}
export function beeAttack(s: Game, b: Bee) {
  const def = beeDefinition(b);
  return def.attack > 0
    ? (def.attack +
        b.level * 1.5 +
        hiveBonus(s, "attack-add") +
        multiplier(s, "rage") -
        1) *
        giftedStats(b) *
        hiveBonus(s, "attack") *
        criticalMultiplier(s) * multiplier(s, "stinger")
    : 0;
}
export function harvest(s: Game, f: Flower, amount: number, instantBonus = 0) {
  if ((FIELDS.find((field) => field.id === f.field)?.gate ?? Infinity) > s.bees.length) return 0;
  const adminPollen = s.adminBoosts.pollen ? 10 : 1;
  const hat = GEAR.find((g) => g.id === s.hat)?.power ?? 1;
  const mods = hiveModifiers(s);
  const bag = GEAR.find((b) => b.id === s.bag);
  const instantRate = Math.min(
    1,
    instantBonus + (!bag?.color || bag.color === f.color ? (bag?.instant ?? 0) : 0) +
      (s.buffs.some((b) => b.kind === "enzymes") ? 0.1 : 0) +
      mods.instant +
      mods[
        f.color === "red"
          ? "instantRed"
          : f.color === "blue"
            ? "instantBlue"
            : "instantWhite"
      ],
  );
  const value = Math.min(
    instantRate >= 1
      ? Infinity
      : Math.max(0, s.capacity - s.pollen) / (1 - instantRate),
    f.pollen * adminPollen,
    amount *
      f.size *
      f.multiplier *
      hat *
      multiplier(s, "pollen") *
      adminPollen *
      multiplier(s, "baby-love") *
      multiplier(s, "bear-morph") *
      multiplier(s, "inspire") *
      mods.pollen *
      mods[f.color] *
      (s.effects.some(
        (e) =>
          e.kind === "pollenMark" &&
          Math.abs(e.y - f.y) < 3 &&
          distance(e, s.player) < e.radius,
      )
        ? 1.5
        : 1) *
      multiplier(s, `field:${f.field}`) *
      multiplier(s, f.color) *
      multiplier(s, `extract:${f.color}`) *
      multiplier(s, "glue") *
      (f.pollination > 0 ? 1.5 : 1) *
      areaMultiplier(s, "pollen", s.player) *
      criticalMultiplier(s),
  );
  if (value <= 0) return 0;
  f.pollen = Math.max(0, f.pollen - value / adminPollen);
  const instant = value * instantRate;
  s.pollen += value - instant;
  awardHoney(s, instant * mods.honeyPerPollen);
  s.stats.pollen += value;
  if (f.goo > 0) { awardHoney(s, value * (s.bees.some(b => b.gifted && b.kind === "bee-40") ? 0.1 : 0.05)); event(s, "goo", value); }
  const balloon = s.effects.find(e => e.kind === "balloon" && e.life > 0 && distance(e, f) < e.radius && Math.abs(e.y - f.y) < 4);
  if (balloon) balloon.stored += value * (balloon.gifted ? 0.5 : 0.25);
  event(s, "pollen", value);
  event(s, "color", value, f.color);
  event(s, "field", value, f.field);
  if (s.challenge) s.challenge.gathered += value;
  if (random(s) < 0.004 && s.tokens.length < 60) {
    const drops: Record<string, string> = {
      sunflower: "sunflowerSeed",
      dandelion: "treat",
      mushroom: "strawberry",
      blue: "blueberry",
      clover: "jelly",
      spider: "treat",
      bamboo: "blueberry",
      strawberry: "strawberry",
      pineapple: "pineapple",
      pumpkin: "gumdrops",
      cactus: "stinger",
      pine: "blueberry",
      rose: "strawberry",
      coconut: "coconut",
      pepper: "strawberry",
      stump: "glue",
      mountain: "moonCharm",
    };
    spawnToken(s, f.x, f.y, f.z, drops[f.field] ?? "treat", 1);
  }
  return value;
}
export function collect(s: Game) {
  if (s.converting || s.flight) return 0;
  const tool = TOOLS.find((t) => t.id === s.tool) ?? TOOLS[0];
  s.player.swing = 0.3;
  if (s.pollen >= s.capacity) {
    if (s.clock - s.lastFull > 4) {
      notify(s, "Your pack is full! Return to your hive and press F.");
      s.lastFull = s.clock;
    }
    return 0;
  }
  let total = 0;
  for (const f of collectorTargets(s, tool)) {
    total += harvest(
      s,
      f,
      (tool.power ?? 2) *
        hiveModifiers(s).tool *
        (tool.color === f.color ? (tool.colorMultiplier ?? 1) : 1),
    );
  }
  if (total > 0)
    floating(
      s,
      s.player.x,
      s.player.y + 2.8,
      s.player.z,
      `+${Math.ceil(total)} pollen`,
    );
  return total;
}
export const home = (s: Game) => HIVE_PADS[s.hive ?? 3] ?? HIVE;
export function nearbyHive(s: Game) {
  return HIVE_PADS.find((p) => distance(s.player, p) < 5.5 && Math.abs(s.player.y - p.y) < 2);
}
export function claimHive(s: Game, index: number) {
  const pad = HIVE_PADS[index];
  if (!pad || distance(s.player, pad) > 5.5 || Math.abs(s.player.y - pad.y) > 2) return false;
  s.hive = index;
  s.converting = false;
  notify(s, "Hive claimed! Your bees will make honey here.");
  return true;
}
export function atHive(s: Game) {
  return distance(s.player, home(s)) < 6 && Math.abs(s.player.y - home(s).y) < 2;
}
export function startConversion(s: Game) {
  if (!atHive(s) || (s.pollen <= 0 && s.balloonPollen <= 0) || s.flight)
    return false;
  s.converting = true;
  s.bees.forEach((b) => {
    b.state = "hive";
  });
  notify(s, "Making honey… Move or press F to stop.");
  return true;
}
export function convert(s: Game, dt: number) {
  if (!s.converting) return;
  if (!atHive(s) || (s.pollen <= 0 && s.balloonPollen <= 0)) {
    s.converting = false;
    return;
  }
  const rate =
    (12 +
      s.bees.reduce(
        (v, b) =>
          v +
          beeDefinition(b).conversion *
            b.level *
            giftedStats(b) *
            (beeDefinition(b).face === "tabby"
              ? 1 + s.beeProgress.tabbyLove * 0.01
              : 1),
        0,
      )) *
    (GEAR.find((b) => b.id === s.bag)?.convert ?? 1) *
    multiplier(s, "convert") *
    hiveBonus(s, "convert") *
    hiveBonus(s, "hive-convert") *
    multiplier(s, "festive-blessing") * multiplier(s, "enzymes");
  const carried = convertCarried(s, rate * dt, hiveModifiers(s).honeyAtHive);
  const balloon = Math.min(s.balloonPollen, Math.max(0, rate * dt - carried));
  s.balloonPollen -= balloon;
  awardHoney(s, balloon * hiveBonus(s, "honey-per-pollen") * hiveModifiers(s).honeyAtHive);
  event(s, "convert", balloon);
  if (s.pollen < 0.00001 && s.balloonPollen < 0.00001) {
    s.pollen = 0;
    s.balloonPollen = 0;
    s.converting = false;
    notify(s, "Sweet work! Your pollen is now honey.");
  }
}
function moveOnTerrain(s: Game, x: number, z: number) {
  const p = s.player,
    startX = p.x,
    startZ = p.z,
    steps = Math.max(1, Math.ceil(Math.hypot(x - p.x, z - p.z) / 0.2));
  for (let i = 1; i <= steps; i++) {
    const nx = startX + ((x - startX) * i) / steps,
      nz = startZ + ((z - startZ) * i) / steps,
      h = surface(nx, nz, p.y),
      locked = lockedAt(nx, nz, s.bees.length, p.y);
    if (locked) {
      if (s.clock - s.lastFull > 3) {
        notify(
          s,
          `This trail needs ${locked} bees. Grow your hive at the Basic Egg Shop.`,
        );
        s.lastFull = s.clock;
      }
      break;
    }
    if (
      h === null ||
      solidAt(nx, nz, p.y) ||
      (h > p.y + 0.8 && p.vy <= 0)
    )
      break;
    p.x = nx;
    p.z = nz;
    if (p.grounded && h > p.y && h <= p.y + 0.8) p.y = h;
  }
}
export function resetCharacter(s: Game) {
  Object.assign(s.player, importedMap.spawn, {
    yaw: Math.PI, vy: 0, hp: 100, invulnerable: 3,
    moving: false, grounded: true, swing: 0,
  });
  s.flight = null;
  s.converting = false;
  notify(s, "Character reset to spawn.");
}

export function movePlayer(
  s: Game,
  dx: number,
  dz: number,
  dt: number,
  jump = false,
) {
  const p = s.player;
  dt = clamp(dt, 0, 0.1);
  if (s.flight) {
    const f = s.flight;
    f.elapsed = Math.min(f.duration, f.elapsed + dt);
    const t = f.elapsed / f.duration;
    p.x = f.from.x + (f.to.x - f.from.x) * t;
    p.z = f.from.z + (f.to.z - f.from.z) * t;
    p.y = f.from.y + (f.to.y - f.from.y) * t + Math.sin(t * Math.PI) * 35;
    p.yaw = Math.atan2(f.to.x - f.from.x, f.to.z - f.from.z);
    p.grounded = false;
    p.moving = false;
    p.vy = 0;
    if (t >= 1) {
      p.y = surface(p.x, p.z, f.to.y) ?? f.to.y;
      p.grounded = true;
      s.flight = null;
      notify(s, "Landed safely.");
    }
    return;
  }
  const len = Math.hypot(dx, dz);
  p.moving = len > 0.01;
  if (len > 0) {
    dx /= len;
    dz /= len;
    s.converting = false;
    p.yaw = Math.atan2(dx, dz);
  }
  const speed =
    8 *
    (GEAR.find((g) => g.id === s.boots)?.speed ?? 1) *
    multiplier(s, "haste") *
    multiplier(s, "oil") *
    (multiplier(s, "bear-morph") > 1 ? 1.3 : 1) *
    hiveModifiers(s).playerSpeed;
  const move = (x: number, z: number) => moveOnTerrain(s, x, z);
  move(p.x + dx * speed * dt, p.z);
  move(p.x, p.z + dz * speed * dt);
  const ground = surface(p.x, p.z, p.y) ?? -50;
  if (jump && p.grounded) {
    p.vy = multiplier(s, "bear-morph") > 1 ? 13 : 10.5;
    p.grounded = false;
  }
  p.vy -= 22 * dt;
  p.y += p.vy * dt;
  if (p.y <= ground) {
    p.y = ground;
    p.vy = 0;
    p.grounded = true;
  }
  if (p.y < -45) {
    Object.assign(p, importedMap.spawn);
    p.vy = 0;
  }
}
export function eggCost(s: Game) {
  let cost = 1000;
  for (let i = 0; i < Math.min(22, s.eggsPurchased); i++)
    cost = cost * 1.5 + 1000 / (i + 1);
  return Math.min(10000000, Math.round(cost));
}
export function slotCost(s: Game) {
  return Math.floor(3000000 * 1.5 ** (s.slots - 25));
}
export function jellyCost(s: Game) {
  return Math.min(1000000, 250000 + s.jelliesPurchased * 10000);
}
export const MAX_ITEMS = 1000000000000;
export function consumableCost(s: Game, id: string) {
  return ({ egg: eggCost(s), treat: 10000, jelly: jellyCost(s) } as Record<string, number>)[id];
}
/** Charge the same amount as successive individual purchases, including price caps. */
export function purchaseCost(s: Game, id: string, quantity = 1) {
  if (!Number.isSafeInteger(quantity) || quantity < 0 || consumableCost(s, id) === undefined) return Infinity;
  if (quantity === 0) return 0;
  if (id === "egg") {
    const increasing = Math.min(quantity, Math.max(0, 22 - s.eggsPurchased));
    let total = 0;
    for (let i = 0; i < increasing; i++) total += eggCost({ ...s, eggsPurchased: s.eggsPurchased + i });
    return total + (quantity - increasing) * eggCost({ ...s, eggsPurchased: s.eggsPurchased + increasing });
  }
  if (id === "jelly") {
    const increasing = Math.min(quantity, Math.max(0, 75 - s.jelliesPurchased));
    return increasing * jellyCost(s) + increasing * (increasing - 1) * 5000 + (quantity - increasing) * 1000000;
  }
  return consumableCost(s, id) * quantity;
}
export function maxPurchase(s: Game, id: string) {
  const cost = consumableCost(s, id);
  if (!cost) return 0;
  let low = 0, high = Math.max(0, Math.min(Math.floor(s.honey / cost), MAX_ITEMS - (s.inventory[id] ?? 0)));
  while (low < high) {
    const middle = Math.ceil((low + high) / 2);
    if (purchaseCost(s, id, middle) <= s.honey) low = middle;
    else high = middle - 1;
  }
  return low;
}
export function buy(s: Game, id: string, quantity = 1) {
  if (!Number.isSafeInteger(quantity) || quantity < 1) return false;
  const item = GEAR.find((g) => g.id === id);
  if (item) {
    if (quantity !== 1) return false;
    if (item.type === "bag" && s.pollen > effectiveCapacity(s, item.id)) {
      notify(s, "Convert some pollen before equipping a smaller pack.");
      return false;
    }
    if (s.bees.length < item.gate) {
      notify(s, `${item.gate} bees required.`);
      return false;
    }
    if (!s.owned.includes(id)) {
      if (
        Object.entries(item.ingredients ?? {}).some(
          ([key, n]) => (s.inventory[key] ?? 0) < n,
        )
      ) {
        notify(s, "Collect the required crafting materials first.");
        return false;
      }
      if (s.honey < item.cost) {
        notify(s, "Not quite enough honey. A few more flowers!");
        return false;
      }
      s.honey -= item.cost;
      for (const [key, n] of Object.entries(item.ingredients ?? {}))
        s.inventory[key] -= n;
      s.stats.spent += item.cost;
      s.owned.push(id);
      event(s, "spend", item.cost);
    }
    if (item.type === "tool") s.tool = id;
    if (item.type === "bag") {
      s.bag = id;
      updateCapacity(s);
    }
    if (item.type === "boots") s.boots = id;
    if (item.type === "hat") s.hat = id;
    notify(s, `${item.name} equipped.`);
    return true;
  }
  const cost = purchaseCost(s, id, quantity);
  if (quantity > maxPurchase(s, id) || !Number.isSafeInteger(cost) || cost > s.honey) {
    notify(s, "Not enough honey for this item.");
    return false;
  }
  s.honey -= cost;
  s.stats.spent += cost;
  event(s, "spend", cost);
  s.inventory[id] = (s.inventory[id] ?? 0) + quantity;
  if (id === "egg") s.eggsPurchased += quantity;
  if (id === "jelly") s.jelliesPurchased += quantity;
  notify(s, quantity.toLocaleString() + " " + (ITEM_NAMES[id] ?? id) + " added to your inventory.");
  return true;
}

export function buySlot(s: Game) {
  const cost = slotCost(s);
  if (s.slots >= 50 || s.honey < cost) {
    notify(
      s,
      s.slots >= 50
        ? "Your hive is fully expanded."
        : "You need more honey for a hive slot.",
    );
    return false;
  }
  s.honey -= cost;
  s.stats.spent += cost;
  s.slots++;
  event(s, "spend", cost);
  notify(s, "A new hexagon. A new possibility.");
  return true;
}
export function hatch(s: Game, egg: EggKind = "egg", replaceBeeId?: string) {
  const replacement = replaceBeeId ? s.bees.findIndex(b=>b.id===replaceBeeId) : -1;
  if (replaceBeeId && replacement < 0) return false;
  if (!EGGS[egg] || (s.inventory[egg] ?? 0) < 1) {
    notify(s, "Visit the Basic Egg Shop to buy a Basic Egg.");
    return false;
  }
  if (replacement < 0 && s.bees.length >= s.slots) {
    notify(s, "Your hive is full. Buy another hive slot first.");
    return false;
  }
  const r = random(s);
  let threshold = 0;
  const odds = EGGS[egg].odds;
  const rarity =
    odds.find(([, chance]) => (threshold += chance) > r)?.[0] ??
    odds[odds.length - 1][0];
  const choices = BEES.filter((b) => b.rarity === rarity);
  const def = choices[Math.floor(random(s) * choices.length)];
  s.inventory[egg]--;
  const bee = newBee(s, def.id);
  bee.gifted = egg.startsWith("gifted") || random(s) < 1 / 250;
  if (replacement >= 0) {
    const previous=s.bees[replacement];
    Object.assign(bee,{id:previous.id,level:previous.level,bond:previous.bond});
    s.bees[replacement]=bee;
  } else s.bees.push(bee);
  s.stats.hatches++;
  event(s, "hatch", 1);
  for (const gate of [5, 10, 15, 25, 35])
    if (s.bees.length >= gate && !s.unlocks.includes(gate)) {
      s.unlocks.push(gate);
      notify(s, `The ${gate}-bee trails are open!`);
    }
  notify(s, `${def.rarity} ${def.name} joined your swarm!`);
  return true;
}
export function buyEventBee(s: Game, kind: string) {
  const offer = EVENT_OFFERS.find((o) => o.kind === kind),
    tent = PLACES.find((p) => p.id === "tickets")!;
  if (
    !offer ||
    s.inventory.ticket < offer.cost ||
    s.bees.some((b) => b.kind === kind) ||
    s.bees.length >= s.slots ||
    distance(s.player, tent) > 7 ||
    Math.abs(s.player.y - tent.y) > 2.5
  )
    return false;
  s.inventory.ticket -= offer.cost;
  s.bees.push(newBee(s, kind));
  s.stats.hatches++;
  event(s, "hatch", 1);
  notify(s, `${BEES.find((b) => b.id === kind)!.name} joined your hive!`);
  return true;
}
export function buyTicketItem(s: Game, id: string, quantity = 1) {
  const offer = TICKET_ITEMS.find((o) => o.id === id),
    tent = PLACES.find((p) => p.id === "tickets")!;
  if (
    !offer ||
    !Number.isSafeInteger(quantity) || quantity < 1 ||
    quantity > MAX_ITEMS - (s.inventory[id] ?? 0) ||
    s.inventory.ticket < offer.cost * quantity ||
    distance(s.player, tent) > 7 ||
    Math.abs(s.player.y - tent.y) > 2.5
  )
    return false;
  s.inventory.ticket -= offer.cost * quantity;
  s.inventory[id] = (s.inventory[id] ?? 0) + quantity;
  notify(s, `${ITEM_NAMES[id]} added to your inventory.`);
  return true;
}
export function buyStarTreats(s: Game, quantity = 1) {
  return buyTicketItem(s, "starTreat", quantity);
}
export function releaseBee(s: Game, id: string) {
  if (s.jellyRun?.running && s.jellyRun.beeId === id) return false;
  if (s.bees.length <= 1 || !atHive(s) || !s.bees.some((b) => b.id === id))
    return false;
  s.bees = s.bees.filter((b) => b.id !== id);
  notify(
    s,
    "Your bee has returned to the wildflowers. The hive slot is now empty.",
  );
  return true;
}
export function feed(s: Game, id: string, item = 'treat') {
  const bond = ({ treat: 10, sunflowerSeed: 25, strawberry: 25, blueberry: 25, pineapple: 50 } as Record<string, number>)[item];
  const b = s.bees.find((b) => b.id === id);
  if (!bond || !b || !(s.inventory[item] > 0)) return false;
  s.inventory[item]--;
  b.bond += bond * hiveModifiers(s).bond;
  b.energy = Math.min(beeDefinition(b).energy, b.energy + 10);
  event(s, "feed", 1);
  addBond(s, b, 0);
  return true;
}
export function addBond(s: Game, b: Bee, amount: number) {
  b.bond += amount;
  while (b.bond >= bondRequired(b.level)) {
    b.bond -= bondRequired(b.level);
    b.level++;
    s.stats.levels++;
    event(s, "level", 1);
    notify(s, `${beeDefinition(b).name} reached level ${b.level}!`);
  }
}
export function giftBee(s: Game, id: string) {
  const bee = s.bees.find((b) => b.id === id);
  if (!bee || bee.gifted || s.inventory.starTreat < 1 || s.jellyRun?.running) return false;
  s.inventory.starTreat--;
  bee.gifted = true;
  updateCapacity(s);
  notify(s, `${beeDefinition(bee).name} is now Gifted!`);
  return true;
}
export const makeGifted = giftBee;

function jellyRoll(
  s: Game,
  id: string,
  item: "jelly" | "starJelly" = "jelly",
) {
  const b = s.bees.find((b) => b.id === id);
  if (!b || s.inventory[item] < 1 || beeDefinition(b).rarity === "Event")
    return false;
  s.inventory[item]--;
  s.stats.jellyRolls++;
  const r = random(s);
  const rarity =
    r < 0.7 ? "Rare" : r < 0.97 ? "Epic" : r < 0.99996 ? "Legendary" : "Mythic";
  const pool = BEES.filter((x) => x.rarity === rarity);
  b.kind = pool[Math.floor(random(s) * pool.length)].id;
  for (const kind of s.bees.map(bee=>bee.kind)) if (!s.discoveredBees.includes(kind)) s.discoveredBees.push(kind);
  b.energy = beeDefinition(b).energy;
  b.gifted = item === "starJelly" || random(s) < 1 / 250;
  b.state = "following";
  b.target = -1;
  b.timer = 0;
  notify(s, `A little magic: ${beeDefinition(b).name}!`);
  return true;
}
export function cancelAutoJelly(s: Game) {
  if (s.jellyRun?.running) {
    s.jellyRun.running = false;
    notify(
      s,
      `Auto Royal Jelly stopped after ${s.jellyRun.used.toLocaleString()} RJ.`,
    );
  }
}
export function updateAutoJelly(s: Game, batch = 1000) {
  const run = s.jellyRun;
  if (!run?.running) return;
  const b = s.bees.find((b) => b.id === run.beeId);
  if (!b || beeDefinition(b).rarity === "Event") {
    cancelAutoJelly(s);
    return;
  }
  for (
    let i = 0;
    i < Math.min(10000, Math.max(0, Math.floor(batch))) &&
    s.inventory.jelly > 0;
    i++
  ) {
    jellyRoll(s, b.id);
    run.used++;
    if (
      (run.rarity === "Any" || beeDefinition(b).rarity === run.rarity) &&
      (!run.gifted || b.gifted)
    ) {
      run.running = false;
      notify(
        s,
        `Found ${b.gifted ? "Gifted " : ""}${beeDefinition(b).name} (${beeDefinition(b).rarity}) · ${run.used.toLocaleString()} RJ used.`,
      );
      return;
    }
  }
  if (s.inventory.jelly === 0) {
    run.running = false;
    notify(
      s,
      `Out of Royal Jelly after ${run.used.toLocaleString()} rolls. Last result: ${b.gifted ? "Gifted " : ""}${beeDefinition(b).name}.`,
    );
  }
}
export function reroll(s: Game, id: string, item: "jelly" | "starJelly" = "jelly", single = false) {
  if (item === "starJelly") return s.jellyRun?.running ? false : jellyRoll(s, id, item);
  const b = s.bees.find((b) => b.id === id);
  if (
    !b ||
    s.inventory.jelly < 1 ||
    beeDefinition(b).rarity === "Event" ||
    s.jellyRun?.running
  )
    return false;
  if (!single && (s.settings.jellyRarity !== "Any" || s.settings.jellyGifted)) {
    s.jellyRun = {
      beeId: id,
      used: 0,
      running: true,
      rarity: s.settings.jellyRarity,
      gifted: s.settings.jellyGifted,
    };
    updateAutoJelly(s);
  } else {
    jellyRoll(s, b.id);
    notify(
      s,
      `A little magic: ${b.gifted ? "Gifted " : ""}${beeDefinition(b).name}!`,
    );
  }
  return true;
}
export function acceptQuest(s: Game, id: string) {
  const q = QUESTS.find((q) => q.id === id);
  if (
    !q ||
    s.accepted[id] ||
    s.completed.includes(id) ||
    s.bees.length < q.gate ||
    (q.previous && !s.completed.includes(q.previous))
  )
    return false;
  s.accepted[id] = q.objectives.map(() => 0);
  notify(s, `Quest accepted: ${q.name}`);
  return true;
}
export function questReady(s: Game, id: string) {
  const q = QUESTS.find((q) => q.id === id);
  return (
    !!q &&
    !!s.accepted[id] &&
    q.objectives.every((o, i) => (s.accepted[id][i] ?? 0) >= o.amount - 0.001)
  );
}
export function claimQuest(s: Game, id: string) {
  const q = QUESTS.find((q) => q.id === id);
  if (!q || !questReady(s, id)) return false;
  delete s.accepted[id];
  s.completed.push(id);
  event(s, "quest", 1);
  awardHoney(s, q.honey);
  s.inventory.egg += q.egg;
  s.inventory.treat += q.treat;
  s.inventory.ticket += q.tickets ?? 5 + q.gate;
  for (const [item, amount] of Object.entries(q.rewards ?? {}))
    s.inventory[item] = (s.inventory[item] ?? 0) + amount;

  notify(s, `Quest complete! +${q.honey} honey${q.egg ? " +1 egg" : ""}`);
  return true;
}
export function replayQuest(s: Game, id: string) {
  const q = QUESTS.find((q) => q.id === id);
  if (!q?.repeat || !s.completed.includes(id) || s.accepted[id]) return false;
  s.completed = s.completed.filter((x) => x !== id);
  return acceptQuest(s, id);
}
export function useItem(s: Game, id: string) {
  if ((s.inventory[id] ?? 0) < 1) return false;
  if (id in EGGS) return hatch(s, id as EggKind);
  if (id === "booster") {
    s.inventory[id]--;
    const fields = FIELDS.filter((f) => f.gate <= s.bees.length),
      field = fields[Math.floor(random(s) * fields.length)];
    buff(s, `field:${field.id}`, 2, 900);
    notify(s, `Field Dice: ${field.name} pollen ×2 for 15 minutes.`);
    return true;
  }
  const boosts: Record<string, [string, number]> = {
    redExtract: ["extract:red", 1.25],
    blueExtract: ["extract:blue", 1.25],
    oil: ["oil", 1.2],
    enzymes: ["enzymes", 1.25],
    glue: ["glue", 1.25],
    stinger: ["stinger", 1.5],
  };
  if (boosts[id]) {
    s.inventory[id]--;
    buff(s, boosts[id][0], boosts[id][1], id === "stinger" ? 30 : 600);
    notify(s, `${ITEM_NAMES[id]} activated.`);
    return true;
  }
  if (id === "gumdrops" || id === "glitter") {
    const field = currentField(s);
    if (!field) return false;
    s.inventory[id]--;
    if (id === "glitter")
      buff(
        s,
        `field:${field.id}`,
        Math.min(5, multiplier(s, `field:${field.id}`) + 1),
        900,
      );
    else
      applyAbility(s, {
        id: s.nextId++,
        x: s.player.x,
        y: s.player.y,
        z: s.player.z,
        kind: "goo",
        value: 1,
        life: 1,
      });
    return true;
  }
  if (id === "converter") {
    if (!s.pollen) return false;
    s.inventory[id]--;
    const value = s.pollen;
    awardHoney(s, value);
    s.pollen = 0;
    event(s, "convert", value);
    notify(s, "Micro-Converter turned your pollen into honey.");
    return true;
  }
  return false;
}
export function interactPlace(s: Game, id: string) {
  if (["red-cannon", "yellow-cannon", "blue-cannon"].includes(id)) {
    const cannon = PLACES.find((p) => p.id === id)!;
    if (
      s.flight ||
      distance(s.player, cannon) > 7 ||
      Math.abs(s.player.y - cannon.y) > 8
    )
      return false;
    const required = id === "red-cannon" ? 25 : id === "yellow-cannon" ? 12 : 16;
    const discovered = new Set([...s.discoveredBees, ...s.bees.map(b=>b.kind)]).size;
    if (discovered < required) {
      notify(s, `${required} discovered bee types required (${discovered}/${required}).`);
      return false;
    }
    const now = Date.now()/1000;
    if ((s.cooldowns.cannon ?? 0) > now) {
      notify(s, `Cannon ready in ${Math.ceil(s.cooldowns.cannon-now)} seconds.`);
      return false;
    }
    const field = FIELDS.find(f=>f.id===(id==='red-cannon' ? 'mountain' : 'clover'))!;
    if (id==='red-cannon' && s.bees.length<25) {
      notify(s, 'Mountain Top also requires 25 bees in your hive.');
      return false;
    }
    const to = id==='yellow-cannon' ? { ...importedMap.spawn } : {x:field.x,y:field.y,z:field.z};
    s.cooldowns.cannon = now+5;
    s.flight = {
      from: { x: s.player.x, y: s.player.y, z: s.player.z },
      to,
      elapsed: 0,
      duration: 3.5,
    };
    s.converting = false;
    notify(s, "Cannon launched!");
    return true;
  }
  const now = Date.now() / 1000;
  if ((s.cooldowns[id] ?? 0) > now) {
    notify(s, `Ready again in ${Math.ceil(s.cooldowns[id] - now)} seconds.`);
    return false;
  }
  if (id === "boost") {
    buff(s, "pollen", 2, 60);
    s.cooldowns[id] = now + 180;
    notify(s, "Meadow boost! Double pollen for one minute.");
    return true;
  }
  if (id === "treat") {
    s.inventory.treat += 3;
    s.cooldowns[id] = now + 120;
    notify(s, "Three fresh treats for your bees.");
    return true;
  }
  if (id === "daily") {
    s.inventory.ticket += 5;
    awardHoney(s, 150);

    s.cooldowns[id] = now + 86400;
    notify(s, "Daily harvest: +150 honey and 5 tickets!");
    return true;
  }
  if (id === "challenge") {
    if (s.challenge) {
      notify(s, "A sprint is already running!");
      return false;
    }
    s.challenge = { remaining: 60, gathered: 0, target: 500 };
    notify(
      s,
      "Clover Challenge: gather 500 pollen in 60 seconds! Reward: 250 honey + an egg.",
    );
    return true;
  }
  return false;
}
function fly(
  b: Bee,
  x: number,
  y: number,
  z: number,
  dt: number,
  speed: number,
) {
  const d = Math.hypot(x - b.x, y - b.y, z - b.z),
    t = Math.min(1, (dt * speed) / Math.max(d, 0.01));
  b.x += (x - b.x) * t;
  b.y += (y - b.y) * t;
  b.z += (z - b.z) * t;
  return d < 1;
}
export function spawnToken(
  s: Game,
  x: number,
  y: number,
  z: number,
  kind: string,
  value = 1,
  gifted = false,
  source?: string,
) {
  s.tokens.push({
    id: s.nextId++,
    x,
    y: y + 0.7,
    z,
    kind,
    value,
    gifted,
    source,
    life: 25 * (source ? hiveBonus(s, "token-life") : 1),
  });
  if (s.tokens.length > 70) s.tokens.shift();
}
export function damageEnemy(s: Game, enemy: Enemy, amount: number) {
  if (enemy.hp <= 0 || amount <= 0) return;
  const damage = amount * multiplier(s, `hacked:${enemy.id}`);
  enemy.hp = Math.max(0, enemy.hp - damage);
  enemy.hit = 0.3;
  floating(
    s,
    enemy.x,
    enemy.y + 3,
    enemy.z,
    `−${Math.round(damage)}`,
    "#f7b4a5",
  );
  if (enemy.hp > 0) return;
  s.stats.kills++;
  event(s, "battle", [1, 1, 5, 5, 5, 25, 500, 100][enemy.type] ?? 1);
  event(s, "kill", 1, ENEMY_TYPES[enemy.type].id);
  enemy.respawn =
    s.clock + (enemy.type >= 6 ? 120 : 45) * hiveBonus(s, "respawn");
  enemy.hit = 0.6;
  const luck = hiveBonus(s, "luck") * multiplier(s, "luck");
  for (let i = 0; i < 3; i++)
    spawnToken(
      s,
      enemy.x + Math.cos(i * 2) * 1.7,
      enemy.y,
      enemy.z + Math.sin(i * 2) * 1.7,
      "honey",
      ENEMY_TYPES[enemy.type].reward / 3,
    );
  spawnToken(s, enemy.x, enemy.y, enemy.z, "ticket", enemy.type >= 6 ? 10 : 1);
  const fruit = ["strawberry", "blueberry", "treat", "pineapple", "strawberry", "moonCharm", "coconut", "gumdrops"][enemy.type];
  spawnToken(s, enemy.x + 1, enemy.y, enemy.z, fruit, enemy.type >= 6 ? 10 : 2);
  if (random(s) < 0.1 * luck) spawnToken(s, enemy.x - 1, enemy.y, enemy.z, "jelly", 1);
  if (random(s) < 0.3 * luck) spawnToken(s, enemy.x, enemy.y, enemy.z, "treat", 2);
  notify(s, `${ENEMY_TYPES[enemy.type].name} defeated! Collect the honey.`);
}
function swarm(s: Game, dt: number) {
  const claimed = new Set(s.bees.filter(b=>b.state==="flying" || b.state==="gathering").map(b=>b.target));
  const field = FIELDS.find(
    (f) =>
      Math.abs(s.player.x - f.x) < f.width / 2 + 3 &&
      Math.abs(s.player.z - f.z) < (f.depth ?? f.width) / 2 + 3 &&
      Math.abs(s.player.y - f.y) < 3 &&
      s.bees.length >= f.gate,
  );
  s.bees.forEach((b, index) => {
    const def = beeDefinition(b),
      speed = def.speed * (1 + (b.level - 1) * 0.03) * multiplier(s, "oil") * multiplier(s, "haste") * hiveBonus(s, "bee-speed");
    b.timer -= dt;
    b.abilityTimer -= dt;
    if (b.energy <= 0 && b.state !== "resting") b.state = "hive";
    if (b.state === "hive" || b.state === "resting" || s.converting) {
      if (
        fly(
          b,
          home(s).x + ((index % 7) - 3) * 0.8,
          home(s).y + 1.5 + Math.floor(index / 7) * 0.75,
          home(s).z - 1,
          dt,
          speed,
        )
      ) {
        b.state = "resting";
        b.energy = Math.min(def.energy, b.energy + dt * 10);
        if (!s.converting && b.energy >= def.energy * 0.95) {
          b.state = "following";
          b.timer = 0.5;
        }
      }
      return;
    }
    const enemy = s.enemies.find(
      (e) =>
        e.hp > 0 &&
        e.gate <= s.bees.length &&
        Math.abs(e.y - s.player.y) < 3 &&
        distance(e, s.player) < 14,
    );
    if (enemy) {
      spawnBeeAbilities(s, b, "battle");
      b.state = "attacking";
      if (
        fly(
          b,
          enemy.x + Math.cos(b.phase) * 1.4,
          enemy.y + 1.2,
          enemy.z + Math.sin(b.phase) * 1.4,
          dt,
          speed,
        ) &&
        b.timer <= 0
      ) {
        const dmg = beeAttack(s, b);
        damageEnemy(s, enemy, dmg);
        b.timer = 0.9;
        b.energy -= 0.3;
      }
      return;
    }
    if (!field || s.pollen >= s.capacity || distance(b, s.player) > 24) {
      spawnBeeAbilities(s, b, field ? "gather" : "idle");
      b.state = "following";
      followBee(s,b,dt,speed,()=>random(s));
      return;
    }
    if (b.state === "following" && b.timer > 0) {
      followBee(s,b,dt,speed,()=>random(s));
      return;
    }
    if (
      b.state === "searching" ||
      (["following", "returning", "attacking"].includes(b.state) && b.timer <= 0)
    ) {
      b.state = "searching";
      let best: Flower | undefined,
        bestScore = Infinity;
      for (const f of s.flowers)
        if (
          f.field === field.id &&
          f.pollen > 1 &&
          !claimed.has(f.id) &&
          distance(f, s.player) < 13
        ) {
          const score =
            distance(f, b) + (f.color === def.color ? -3 : 3) + (1 - f.pollen / f.max) * 6 + random(s) * 4;
          if (score < bestScore) {
            bestScore = score;
            best = f;
          }
        }
      if (best) {
        b.target = best.id;
        claimed.add(best.id);
        b.state = "flying";
      } else {
        b.state = "following";
        b.target = -1;
        b.timer = 0.5;
        return;
      }
    }
    const target = s.flowers[b.target];
    if (!target || target.field !== field.id || distance(b, s.player) > 24) {
      b.state = "searching";
      b.timer = 0;
      return;
    }
    if (
      b.state === "flying" &&
      fly(b, target.x, target.y + 0.8, target.z, dt, speed)
    ) {
      b.state = "gathering";
      b.timer = Math.max(b.timer, 0.15);
    }
    if (b.state === "gathering" && b.timer <= 0) {
      const value = harvest(
        s,
        target,
        def.gather *
          giftedStats(b) *
          hiveBonus(s, "bee-pollen") *
          (b.gifted ? hiveBonus(s, "gifted-pollen") : 1) *
          (def.face === "tabby" ? 1 + s.beeProgress.tabbyLove * 0.01 : 1) *
          (def.face === "buoyant" &&
          s.effects.some((e) => e.kind === "balloon" && distance(e, b) < 8)
            ? 1.25
            : 1) *
          (1 + (b.level - 1) * 0.2) *
          (target.color === def.color ? 1.5 : 1),
      );
      b.energy -= 0.75;
      claimed.delete(b.target);
      b.target = -1;
      b.state = "searching";
      b.timer = def.interval;
      if (value > 0)
        floating(s, b.x, b.y + 1, b.z, `+${Math.ceil(value)}`, "#d1eea3");
      gatherPassive(s, b);
      spawnBeeAbilities(s, b, "gather");
    }
    if (b.state === "returning") followBee(s,b,dt,speed,()=>random(s));
  });
}
function enemies(s: Game, dt: number) {
  const p = s.player;
  for (const e of s.enemies) {
    e.hit = Math.max(0, e.hit - dt);
    e.cooldown -= dt;
    if (e.hp <= 0) {
      if (s.clock >= e.respawn) {
        e.hp = e.maxHp;
        e.x = e.homeX;
        e.z = e.homeZ;
      }
      continue;
    }
    if (e.gate > s.bees.length || multiplier(s, `hacked:${e.id}`) > 1) continue;
    const d = distance(e, p),
      def = ENEMY_TYPES[e.type],
      near =
        !s.flight &&
        d < 12 &&
        Math.abs(e.y - p.y) < 2 &&
        distance(e, { x: e.homeX, z: e.homeZ }) < 18;
    const tx = near ? p.x : e.homeX + Math.sin(s.clock * 0.3 + e.id) * 3,
      tz = near ? p.z : e.homeZ + Math.cos(s.clock * 0.3 + e.id) * 3;
    const dist = Math.hypot(tx - e.x, tz - e.z);
    if (dist > 1.4) {
      e.x += ((tx - e.x) / dist) * dt * def.speed;
      e.z += ((tz - e.z) / dist) * dt * def.speed;
    }
    if (near && e.type >= 6 && e.cooldown < 0.65 && e.cooldown > 0)
      e.windup = 0.7;
    else e.windup = Math.max(0, e.windup - dt);
    if (
      near &&
      d < (e.type >= 6 ? 5 : 2.3) &&
      e.cooldown <= 0 &&
      p.invulnerable <= 0
    ) {
      p.hp = Math.max(0, p.hp - def.damage);
      p.invulnerable = 1.2;
      e.cooldown = e.type >= 6 ? 3 : 1.8;
      floating(s, p.x, p.y + 3, p.z, `−${def.damage} HP`, "#ef8d7b");
      const nx = p.x + ((p.x - e.x) / Math.max(d, 0.1)) * 1.5,
        nz = p.z + ((p.z - e.z) / Math.max(d, 0.1)) * 1.5;
      moveOnTerrain(s, nx, nz);
      p.y = Math.max(p.y, surface(p.x, p.z, p.y) ?? p.y);
      if (p.hp <= 0) {
        p.x = home(s).x;
        p.y = home(s).y;
        p.z = home(s).z - 8;
        p.hp = 100;
        p.invulnerable = 5;
        s.pollen = Math.floor(s.pollen * 0.8);
        s.converting = false;
        s.sprinklers = [];
        notify(
          s,
          "Back at the hive. Your bees saved you! You kept 80% of your pollen.",
        );
      }
    }
  }
}
function tokens(s: Game, dt: number) {
  for (const t of s.tokens) t.life -= dt;
  s.tokens = s.tokens.filter((t) => t.life > 0);
  for (const t of [...s.tokens])
    if (distance(t, s.player) < 2.6 && Math.abs(t.y - s.player.y) < 3)
      collectToken(s, t.id);
}
export function step(s: Game, dt: number) {
  dt = clamp(dt, 0, 1);
  s.clock += dt;
  updateCapacity(s);
  s.stats.time += dt;
  tickCraft(s, dt);
  tickSprinklers(s, dt);
  s.gatherCooldown -= dt;
  s.player.swing = Math.max(0, s.player.swing - dt);
  s.player.invulnerable = Math.max(0, s.player.invulnerable - dt);
  for (const f of s.flowers)
    if (f.pollen < f.max) f.pollen = Math.min(f.max, f.pollen + f.regen * dt);
  s.buffs = s.buffs.filter((b) => (b.remaining -= dt) > 0);
  s.floaters = s.floaters.filter((f) => (f.life -= dt) > 0);
  updateEffects(s, dt);
  convert(s, dt);
  swarm(s, dt);
  enemies(s, dt);
  tokens(s, dt);
  if (atHive(s)) s.player.hp = Math.min(100, s.player.hp + dt * 7);
  if (s.challenge) {
    s.challenge.remaining -= dt;
    if (s.challenge.gathered >= s.challenge.target) {
      awardHoney(s, 250);
      s.inventory.egg++;

      s.challenge = null;
      s.cooldowns.challenge = Date.now() / 1000 + 120;
      notify(s, "Sprint complete! +250 honey and a Basic Egg.");
    } else if (s.challenge.remaining <= 0) {
      s.challenge = null;
      s.cooldowns.challenge = Date.now() / 1000 + 30;
      notify(
        s,
        "Time is up. Unload your pack and try the Clover Challenge again.",
      );
    }
  }
}
export function nearestPlace(s: Game) {
  return PLACES.filter(
    (p) =>
      (p.kind === "cannon" || s.bees.length >= p.gate) &&
      Math.abs(p.y - s.player.y) < (p.kind === "cannon" ? 8 : 2.5) &&
      distance(p, s.player) < 7,
  ).sort((a, b) => distance(a, s.player) - distance(b, s.player))[0];
}
export function currentField(s: Game) {
  return FIELDS.find(
    (f) =>
      Math.abs(s.player.x - f.x) < f.width / 2 &&
      Math.abs(s.player.z - f.z) < (f.depth ?? f.width) / 2 &&
      Math.abs(s.player.y - f.y) < 3,
  );
}
export function serialize(s: Game) {
  return JSON.stringify({
    version: 2,
    mapVersion: importedMap.version,
    adminBoosts: s.adminBoosts,
    position: { x: s.player.x, y: s.player.y, z: s.player.z },
    hive: s.hive,
    honey: s.honey,
    pollen: s.pollen,
    tool: s.tool,
    bag: s.bag,
    boots: s.boots,
    hat: s.hat,
    owned: s.owned,
    slots: s.slots,
    eggsPurchased: s.eggsPurchased,
    jelliesPurchased: s.jelliesPurchased,
    lifetime: s.lifetime,
    badges: s.badges,
    crafting: s.crafting,
    sprinkler: s.sprinkler,
    progressionVersion: 1,
    discoveredBees: [...new Set([...s.discoveredBees, ...s.bees.map(b=>b.kind)])],
    bees: s.bees.map(({ kind, level, bond, energy, gifted }) => ({
      kind,
      level,
      bond,
      energy,
      gifted,
    })),
    inventory: s.inventory,
    beeProgress: s.beeProgress,
    balloonPollen: s.balloonPollen + s.effects.filter(e => e.kind === "balloon").reduce((n, e) => n + e.stored, 0),
    hotbar: s.hotbar,
    buffs: s.buffs,
    accepted: s.accepted,
    completed: s.completed,
    stats: s.stats,
    settings: s.settings,
    seed: s.seed,
    cooldowns: Object.fromEntries(
      Object.entries(s.cooldowns).map(([k, v]) => [k, v * 1000]),
    ),
    savedAt: Date.now(),
    enemyRespawns: s.enemies.map((e) =>
      e.hp <= 0 ? Date.now() + Math.max(0, e.respawn - s.clock) * 1000 : 0,
    ),
  });
}
export function restore(raw: string | null): Game {
  const s = createGame();
  if (!raw) return s;
  try {
    const d = JSON.parse(raw);
    if (!d || typeof d !== "object" || ![1, 2].includes(d.version)) return s;
    const num = (v: unknown, fallback: number, max = 1e15) =>
      typeof v === "number" && Number.isFinite(v) ? clamp(v, 0, max) : fallback;
    s.honey = num(d.honey, 0);
    s.eggsPurchased = Math.floor(num(d.eggsPurchased, 0, MAX_ITEMS));
    s.jelliesPurchased = Math.floor(num(d.jelliesPurchased, 0, MAX_ITEMS));
    s.hive = Math.floor(num(d.hive, 3, HIVE_PADS.length - 1));
    s.slots = Math.floor(num(d.slots, 3, 50));
    s.slots = Math.max(25, s.slots);
    s.owned = Array.isArray(d.owned)
      ? [
          ...new Set([
            "tool-0",
            "bag-0",
            ...d.owned.filter(
              (v: unknown) =>
                typeof v === "string" && GEAR.some((g) => g.id === v),
            ),
          ]),
        ]
      : s.owned;
    for (const key of ["tool", "bag", "boots", "hat"] as const) {
      if (
        typeof d[key] === "string" &&
        s.owned.includes(d[key]) &&
        GEAR.some(
          (g) =>
            g.id === d[key] &&
            g.type === (key === "tool" ? "tool" : key === "bag" ? "bag" : key),
        )
      )
        s[key] = d[key];
    }
    s.adminBoosts = { pollen: d.adminBoosts?.pollen === true, honey: d.adminBoosts?.honey === true };
    s.capacity = GEAR.find((b) => b.id === s.bag)?.capacity ?? 200;
    s.pollen = num(d.pollen, 0, s.capacity);
    if (Array.isArray(d.bees)) {
      const valid = d.bees
        .filter(
          (b: Record<string, unknown>) =>
            b && BEES.some((def) => def.id === b.kind),
        )
        .slice(0, s.slots);
      if (valid.length)
        s.bees = valid.map((b: Record<string, unknown>) => ({
          ...newBee(s, String(b.kind)),
          level: Math.max(1, Math.floor(num(b.level, 1, 50))),
          bond: num(b.bond, 0, 1e16),
          gifted: b.gifted === true,
          energy: num(
            b.energy,
            BEES.find((d) => d.id === b.kind)!.energy,
            BEES.find((d) => d.id === b.kind)!.energy,
          ),
        }));
    }
    if (Array.isArray(d.discoveredBees)) s.discoveredBees = [...new Set([...s.discoveredBees, ...d.discoveredBees.filter((kind: unknown)=>BEES.some(b=>b.id===kind))])];
    for (const k of Object.keys(s.inventory))
      s.inventory[k] = Math.floor(
        num(d.inventory?.[k], s.inventory[k], MAX_ITEMS),
      );
    if (Array.isArray(d.hotbar)) s.hotbar = Array.from({ length: 9 }, (_, index) =>
      typeof d.hotbar[index] === 'string' && Object.hasOwn(s.inventory, d.hotbar[index]) ? d.hotbar[index] : null);
    s.beeProgress = { tabbyLove: Math.floor(num(d.beeProgress?.tabbyLove, 0, 1000)), fetch: Math.floor(num(d.beeProgress?.fetch, 0, 10)) };
    s.balloonPollen = num(d.balloonPollen, 0);
    s.completed = Array.isArray(d.completed)
      ? [
          ...new Set<string>(
            d.completed.filter((v: unknown) => QUESTS.some((q) => q.id === v)),
          ),
        ]
      : [];
    if (d.accepted && typeof d.accepted === "object")
      for (const [id, progress] of Object.entries(d.accepted)) {
        const q = QUESTS.find((q) => q.id === id);
        if (q && Array.isArray(progress) && !s.completed.includes(id))
          s.accepted[id] = q.objectives.map((o, i) =>
            num(progress[i], 0, o.amount),
          );
      }
    for (const k of Object.keys(s.stats) as (keyof Game["stats"])[])
      s.stats[k] = num(d.stats?.[k], 0);
    const validCounters = new Set([
      ...BADGES.map((b) => b.counter),
      "color:red",
      "color:blue",
      "color:white",
      "pollen",
      "convert",
      "kill",
      "token",
      "earn",
      "quest",
      "ability",
      "battle",
      "goo",
    ]);
    if (d.lifetime && typeof d.lifetime === "object")
      for (const [k, v] of Object.entries(d.lifetime))
        if (validCounters.has(k)) s.lifetime[k] = num(v, 0, 1e16);
    if (d.badges && typeof d.badges === "object")
      for (const [id, v] of Object.entries(d.badges)) {
        const def = BADGES.find((b) => b.id === id);
        if (
          def &&
          typeof v === "number" &&
          Number.isInteger(v) &&
          v >= 1 &&
          v <= 5 &&
          badgeProgress(s, id) >= def.thresholds[v - 1]
        )
          s.badges[id] = v;
      }
    if (
      typeof d.sprinkler === "number" &&
      Number.isInteger(d.sprinkler) &&
      d.sprinkler >= 0 &&
      d.sprinkler < SPRINKLERS.length
    )
      s.sprinkler = d.sprinkler;
    const job = d.crafting;
    if (
      job &&
      RECIPES[job.item] &&
      Number.isInteger(job.quantity) &&
      job.quantity >= 1 &&
      job.quantity <= 10000
    )
      s.crafting = {
        item: job.item,
        quantity: job.quantity,
        elapsed: num(job.elapsed, 0, job.quantity * 300),
      };
    s.settings = {
      volume: num(d.settings?.volume, 0.35, 1),
      muted: d.settings?.muted === true,
      sensitivity: clamp(num(d.settings?.sensitivity, 1, 2), 0.3, 2),
      quality: d.settings?.quality === "low" ? "low" : "high",
      jellyRarity: ["Legendary", "Mythic"].includes(d.settings?.jellyRarity) ? d.settings.jellyRarity : "Any",
      jellyGifted: d.settings?.jellyGifted === true,
    };
    if (d.cooldowns && typeof d.cooldowns === "object")
      for (const [k, v] of Object.entries(d.cooldowns))
        if (PLACES.some((p) => p.id === k)) s.cooldowns[k] = num(v, 0) / 1000;
    if (Array.isArray(d.enemyRespawns))
      s.enemies.forEach((e, i) => {
        const seconds = (num(d.enemyRespawns[i], 0) - Date.now()) / 1000;
        if (seconds > 0) {
          e.hp = 0;
          e.respawn = seconds;
        }
      });
    if (
      d.mapVersion === importedMap.version && d.position &&
      typeof d.position.x === "number" &&
      typeof d.position.z === "number" &&
      Number.isFinite(d.position.x) &&
      Number.isFinite(d.position.z)
    ) {
      const { x, z } = d.position;
      const feet = typeof d.position.y === "number" && Number.isFinite(d.position.y) ? d.position.y : 0;
      const h = surface(x, z, feet);
      if (h !== null && !solidAt(x, z, h) && !lockedAt(x, z, s.bees.length, h)) {
        s.player.x = x;
        s.player.z = z;
        s.player.y = h;
        s.bees.forEach((b, i) => {
          b.x = x + Math.cos(i) * 2;
          b.y = h + 2.5;
          b.z = z + Math.sin(i) * 2;
        });
      }
    }
    s.unlocks = [0, ...[5, 10, 15, 25, 35].filter((n) => s.bees.length >= n)];
    s.capacity = effectiveCapacity(s);
    const storedPollen = num(d.pollen, 0);
    s.pollen = d.progressionVersion === 1 ? storedPollen : Math.min(storedPollen, s.capacity);
    s.capacity = Math.max(s.capacity, s.pollen);
    if (d.progressionVersion !== 1 && storedPollen > s.capacity) {
      s.honey += storedPollen - s.capacity;
    }
    restoreBuffs(
      s,
      d.buffs,
      Math.max(0, (Date.now() - num(d.savedAt, Date.now())) / 1000),
    );
    s.seed = Math.floor(num(d.seed, s.seed, 4294967295));
    s.notification = "Welcome back, keeper. Your mountain is waiting.";
    return s;
  } catch {
    return s;
  }
}
