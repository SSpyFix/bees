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
import type { Game, Bee, Flower, Enemy } from "./types";
import { surface, solidAt, lockedAt } from "../world/terrain";
import { hiveBonus, giftedStats, updateCapacity } from "./gifted";
import {
  collectToken,
  updateEffects,
  spawnBeeAbilities,
  gatherPassive,
  areaMultiplier,
} from "./abilities";
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
  return {
    id: `b${s.nextId++}`,
    kind: d.id,
    gifted: false,
    level: 1,
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
    pollen: 0,
    capacity: 200,
    tool: "tool-0",
    bag: "bag-0",
    boots: "",
    hat: "",
    owned: ["tool-0", "bag-0"],
    slots: 25,
    bees: [],
    player: {
      x: 0,
      y: 0,
      z: 53,
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
    effects: [],
    beeProgress: { tabbyLove: 0, fetch: 0 },
    balloonPollen: 0,
    floaters: [],
    inventory: {
      egg: 1,
      treat: 5,
      jelly: 0,
      booster: 0,
      converter: 0,
      ticket: 0,
      starTreat: 0,
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
    settings: {
      volume: 0.35,
      muted: false,
      sensitivity: 1,
      quality: "high",
      jellyRarity: "Any",
      jellyGifted: false,
    },
  };
  for (const f of FIELDS)
    for (let iz = -7; iz <= 7; iz++)
      for (let ix = -7; ix <= 7; ix++) {
        const roll = random(s),
          color: Color =
            roll < f.colors[0]
              ? "white"
              : roll < f.colors[0] + f.colors[1]
                ? "red"
                : "blue";
        const size = 1 + Math.floor(random(s) * 3),
          max = 12 * size * (1 + f.gate * 0.1);
        s.flowers.push({
          id: s.flowers.length,
          field: f.id,
          x: f.x + ix * 1.35 + (random(s) - 0.5) * 0.25,
          y: f.y,
          z: f.z + iz * 1.35 + (random(s) - 0.5) * 0.25,
          color,
          size,
          pollen: max,
          max,
          regen: 0.8 + size * 0.3,
          multiplier: 1 + f.gate * 0.025,
          pollination: 0,
          goo: 0,
        });
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
  s.honey += amount;
  s.stats.honey += amount;
  // Repeated fractional conversion ticks must not leave 120 as 119.9999999999.
  if (Math.abs(s.honey - Math.round(s.honey)) < 1e-9)
    s.honey = Math.round(s.honey);
  if (Math.abs(s.stats.honey - Math.round(s.stats.honey)) < 1e-9)
    s.stats.honey = Math.round(s.stats.honey);
  event(s, "earn", amount);
}
export function convertCarried(s: Game, amount: number) {
  const converted = Math.min(s.pollen, Math.max(0, amount));
  s.pollen -= converted;
  awardHoney(s, converted * hiveBonus(s, "honey-per-pollen"));
  event(s, "convert", converted);
  return converted;
}
export function criticalMultiplier(s: Game) {
  const precision =
    (s.buffs.find((b) => b.kind === "precision")?.value ?? 1) - 1;
  const chance = Math.min(
    1,
    0.05 +
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
        criticalMultiplier(s)
    : 0;
}
export function harvest(s: Game, f: Flower, amount: number, instant = 0) {
  const hat = GEAR.find((g) => g.id === s.hat)?.power ?? 1;
  const critical = criticalMultiplier(s);
  const value = Math.min(
    s.capacity - s.pollen,
    f.pollen,
    amount *
      f.multiplier *
      hat *
      multiplier(s, "pollen") *
      multiplier(s, `field:${f.field}`) *
      multiplier(s, f.color) *
      hiveBonus(s, "pollen") *
      hiveBonus(s, f.color) *
      multiplier(s, "baby-love") *
      multiplier(s, "inspire") *
      multiplier(s, "bear-morph") *
      (f.pollination > 0 ? 1.5 : 1) *
      areaMultiplier(s, "pollen", s.player) *
      critical,
  );
  if (value <= 0) return 0;
  f.pollen -= value;
  s.pollen += value;
  s.stats.pollen += value;
  const instantRate = Math.min(
    1,
    instant + hiveBonus(s, "instant") + hiveBonus(s, `instant-${f.color}`),
  );
  if (instantRate > 0) convertCarried(s, value * instantRate);
  if (f.goo > 0)
    awardHoney(
      s,
      value *
        (s.bees.some((b) => b.gifted && b.kind === "bee-40") ? 0.1 : 0.05),
    );
  const balloons = s.effects.filter(
    (e) =>
      e.kind === "balloon" &&
      e.life > 0 &&
      distance(e, f) < e.radius &&
      Math.abs(e.y - f.y) < 4,
  );
  if (balloons.length)
    balloons[0].stored += value * (balloons[0].gifted ? 0.5 : 0.25);
  event(s, "pollen", value);
  event(s, "color", value, f.color);
  event(s, "field", value, f.field);
  if (s.challenge) s.challenge.gathered += value;
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
  const fx = Math.sin(s.player.yaw),
    fz = Math.cos(s.player.yaw);
  for (const f of s.flowers) {
    const dx = f.x - s.player.x,
      dz = f.z - s.player.z;
    if (
      Math.abs(f.y - s.player.y) > 2 ||
      dx * dx + dz * dz > (tool.range ?? 3) ** 2
    )
      continue;
    const dot = dx * fx + dz * fz,
      cross = Math.abs(dx * fz - dz * fx);
    if (tool.shape === "line" && cross > 1.15) continue;
    if (tool.shape === "cone" && dot < -0.6) continue;
    total += harvest(
      s,
      f,
      (tool.power ?? 3) *
        (tool.color === f.color ? 1.35 : 1) *
        hiveBonus(s, "tool"),
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
  return HIVE_PADS.find((p) => distance(s.player, p) < 9 && s.player.y < 2);
}
export function claimHive(s: Game, index: number) {
  const pad = HIVE_PADS[index];
  if (!pad || distance(s.player, pad) > 9 || s.player.y > 2) return false;
  s.hive = index;
  s.converting = false;
  notify(s, "Hive claimed! Your bees will make honey here.");
  return true;
}
export function atHive(s: Game) {
  return distance(s.player, home(s)) < 12 && s.player.y < 2;
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
    (BAGS.find((b) => b.id === s.bag)?.convert ?? 1) *
    multiplier(s, "convert") *
    hiveBonus(s, "convert") *
    hiveBonus(s, "hive-convert") *
    multiplier(s, "festive-blessing");
  const carried = convertCarried(s, rate * dt);
  const balloon = Math.min(s.balloonPollen, Math.max(0, rate * dt - carried));
  s.balloonPollen -= balloon;
  awardHoney(s, balloon * hiveBonus(s, "honey-per-pollen"));
  event(s, "convert", balloon);
  if (s.pollen < 0.00001 && s.balloonPollen < 0.00001) {
    s.pollen = 0;
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
      h = surface(nx, nz),
      current = surface(p.x, p.z) ?? 0,
      locked = lockedAt(nx, nz, s.bees.length);
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
      solidAt(nx, nz) ||
      h - current > 1.1 ||
      (h > p.y + 0.7 && p.vy <= 0)
    )
      break;
    p.x = nx;
    p.z = nz;
  }
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
      p.y = surface(p.x, p.z) ?? 0;
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
    hiveBonus(s, "move") *
    (multiplier(s, "bear-morph") > 1 ? 1.3 : 1);
  const move = (x: number, z: number) => moveOnTerrain(s, x, z);
  move(p.x + dx * speed * dt, p.z);
  move(p.x, p.z + dz * speed * dt);
  const ground = surface(p.x, p.z) ?? 0;
  if (jump && p.grounded) {
    p.vy = multiplier(s, "bear-morph") > 1 ? 11 : 8;
    p.grounded = false;
  }
  p.vy -= 22 * dt;
  p.y += p.vy * dt;
  if (p.y <= ground) {
    p.y = ground;
    p.vy = 0;
    p.grounded = true;
  }
  if (p.y < ground - 6) {
    p.y = ground;
    p.vy = 0;
  }
}
export function eggCost(s: Game) {
  return Math.min(10000000, Math.floor(1000 * 1.5 ** s.stats.hatches));
}
export function slotCost(s: Game) {
  return Math.floor(3000000 * 1.5 ** (s.slots - 25));
}
export const MAX_ITEMS = 1000000000000;
export function consumableCost(s: Game, id: string) {
  return (
    {
      egg: eggCost(s),
      treat: 12,
      jelly: 180,
      booster: 120,
      converter: 90,
    } as Record<string, number>
  )[id];
}
export function maxPurchase(s: Game, id: string) {
  const cost = consumableCost(s, id);
  return cost
    ? Math.max(
        0,
        Math.min(
          Math.floor(s.honey / cost),
          MAX_ITEMS - (s.inventory[id] ?? 0),
        ),
      )
    : 0;
}
export function buy(s: Game, id: string, quantity = 1) {
  if (!Number.isSafeInteger(quantity) || quantity < 1) return false;
  const item = GEAR.find((g) => g.id === id);
  if (item) {
    if (quantity !== 1) return false;
    if (item.type === "bag" && s.pollen > (item.capacity ?? 200)) {
      notify(s, "Convert some pollen before equipping a smaller pack.");
      return false;
    }
    if (s.bees.length < item.gate) {
      notify(s, `${item.gate} bees required.`);
      return false;
    }
    if (!s.owned.includes(id)) {
      if (s.honey < item.cost) {
        notify(s, "Not quite enough honey. A few more flowers!");
        return false;
      }
      s.honey -= item.cost;
      s.stats.spent += item.cost;
      s.owned.push(id);
      event(s, "spend", item.cost);
    }
    if (item.type === "tool") s.tool = id;
    if (item.type === "bag") {
      s.bag = id;
      s.capacity = item.capacity ?? 200;
    }
    if (item.type === "boots") s.boots = id;
    if (item.type === "hat") s.hat = id;
    notify(s, `${item.name} equipped.`);
    return true;
  }
  const unitCost = consumableCost(s, id),
    cost = unitCost * quantity;
  if (
    unitCost === undefined ||
    quantity > maxPurchase(s, id) ||
    !Number.isSafeInteger(cost)
  ) {
    notify(s, "Not enough honey for this item.");
    return false;
  }
  s.honey -= cost;
  s.stats.spent += cost;
  event(s, "spend", cost);
  s.inventory[id] = (s.inventory[id] ?? 0) + quantity;
  notify(
    s,
    `${quantity.toLocaleString()} ${id === "egg" ? "Basic Egg" : id} added to your inventory.`,
  );
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
export function hatch(s: Game) {
  if (s.inventory.egg < 1) {
    notify(s, "Visit the Basic Egg Shop to buy a Basic Egg.");
    return false;
  }
  if (s.bees.length >= s.slots) {
    notify(s, "Your hive is full. Buy another hive slot first.");
    return false;
  }
  const r = random(s);
  const tier = r < 0.87 ? 0 : r < 0.97 ? 1 : r < 0.995 ? 2 : 3;
  const choices = BEES.filter(
    (b) =>
      b.rarity ===
      ["Common", "Rare", "Epic", "Legendary", "Mythic", "Event"][tier],
  );
  const def = choices[Math.floor(random(s) * choices.length)];
  s.inventory.egg--;
  const hatched = newBee(s, def.id);
  hatched.gifted = random(s) < (def.rarity === "Common" ? 1 / 287 : 0.004);
  s.bees.push(hatched);
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
export function feed(s: Game, id: string) {
  const b = s.bees.find((b) => b.id === id);
  if (!b || s.inventory.treat < 1) return false;
  s.inventory.treat--;
  b.energy = Math.min(beeDefinition(b).energy, b.energy + 10);
  event(s, "feed", 1);
  addBond(s, b, 25 * hiveBonus(s, "bond"));
  return true;
}
export function addBond(s: Game, b: Bee, amount: number) {
  b.bond += amount;
  while (b.bond >= 30 * b.level ** 1.5) {
    b.bond -= 30 * b.level ** 1.5;
    b.level++;
    s.stats.levels++;
    event(s, "level", 1);
    notify(s, `${beeDefinition(b).name} reached level ${b.level}!`);
  }
}
export function buyStarTreats(s: Game, quantity = 1) {
  const tent = PLACES.find((p) => p.id === "tickets")!;
  if (
    !Number.isSafeInteger(quantity) ||
    quantity < 1 ||
    quantity > MAX_ITEMS - s.inventory.starTreat ||
    s.inventory.ticket < 1000 * quantity ||
    distance(s.player, tent) > 7 ||
    Math.abs(s.player.y - tent.y) > 2.5
  )
    return false;
  s.inventory.ticket -= 1000 * quantity;
  s.inventory.starTreat += quantity;
  notify(
    s,
    `${quantity.toLocaleString()} Star Treats added to your inventory.`,
  );
  return true;
}
export function makeGifted(s: Game, id: string) {
  const b = s.bees.find((b) => b.id === id);
  if (!b || b.gifted || s.inventory.starTreat < 1 || s.jellyRun?.running)
    return false;
  s.inventory.starTreat--;
  b.gifted = true;
  updateCapacity(s);
  notify(s, `Gifted ${beeDefinition(b).name}! Its hive bonus is now active.`);
  return true;
}
const JELLY_POOLS = ["Rare", "Epic", "Legendary", "Mythic"].map((r) =>
  BEES.filter((b) => b.rarity === r),
);
function jellyRoll(s: Game, b: Bee) {
  s.inventory.jelly--;
  s.stats.jellyRolls++;
  const r = random(s);
  // Disjoint probabilities: 69.996%, 27%, 3%, 0.004%.
  const pool =
    JELLY_POOLS[r < 0.69996 ? 0 : r < 0.96996 ? 1 : r < 0.99996 ? 2 : 3];
  b.kind = pool[Math.floor(random(s) * pool.length)].id;
  b.gifted = random(s) < 0.004;
  b.energy = beeDefinition(b).energy;
  b.target = -1;
  b.state = "following";
  b.timer = 0;
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
    jellyRoll(s, b);
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
export function reroll(s: Game, id: string) {
  const b = s.bees.find((b) => b.id === id);
  if (
    !b ||
    s.inventory.jelly < 1 ||
    beeDefinition(b).rarity === "Event" ||
    s.jellyRun?.running
  )
    return false;
  if (s.settings.jellyRarity !== "Any" || s.settings.jellyGifted) {
    s.jellyRun = {
      beeId: id,
      used: 0,
      running: true,
      rarity: s.settings.jellyRarity,
      gifted: s.settings.jellyGifted,
    };
    updateAutoJelly(s);
  } else {
    jellyRoll(s, b);
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
  s.honey += q.honey;
  s.stats.honey += q.honey;
  s.inventory.egg += q.egg;
  s.inventory.treat += q.treat;
  s.inventory.ticket += 5 + q.gate;
  event(s, "earn", q.honey);
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
  if (id === "egg") return hatch(s);
  if (id === "booster") {
    s.inventory[id]--;
    const fields = FIELDS.filter((f) => f.gate <= s.bees.length),
      field = fields[Math.floor(random(s) * fields.length)];
    buff(s, `field:${field.id}`, 2, 900);
    notify(s, `Field Dice: ${field.name} pollen ×2 for 15 minutes.`);
    return true;
  }
  if (id === "converter") {
    if (!s.pollen) return false;
    s.inventory[id]--;
    const value = s.pollen;
    s.honey += value;
    s.stats.honey += value;
    s.pollen = 0;
    event(s, "convert", value);
    event(s, "earn", value);
    notify(s, "Micro-Converter turned your pollen into honey.");
    return true;
  }
  return false;
}
export function interactPlace(s: Game, id: string) {
  if (id === "red-cannon" || id === "mountain-cannon") {
    const cannon = PLACES.find((p) => p.id === id)!;
    if (
      s.flight ||
      distance(s.player, cannon) > 7 ||
      Math.abs(s.player.y - cannon.y) > 2.5
    )
      return false;
    const gate = id === "red-cannon" ? 25 : 0;
    if (s.bees.length < gate) {
      notify(s, `${gate} bees required to use this cannon.`);
      return false;
    }
    const to =
      id === "red-cannon"
        ? { x: 0, y: 32, z: -145 }
        : { x: home(s).x, y: 0, z: 53 };
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
    s.honey += 150;
    s.stats.honey += 150;
    event(s, "earn", 150);
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
  if (random(s) < 0.3 * luck)
    spawnToken(s, enemy.x, enemy.y, enemy.z, "treat", 2);
  notify(s, `${ENEMY_TYPES[enemy.type].name} defeated! Collect the honey.`);
}
function swarm(s: Game, dt: number) {
  const field = FIELDS.find(
    (f) =>
      Math.abs(s.player.x - f.x) < f.width / 2 + 3 &&
      Math.abs(s.player.z - f.z) < f.width / 2 + 3 &&
      Math.abs(s.player.y - f.y) < 3 &&
      s.bees.length >= f.gate,
  );
  s.bees.forEach((b, index) => {
    const def = beeDefinition(b),
      speed = def.speed * multiplier(s, "haste") * hiveBonus(s, "bee-speed");
    b.timer -= dt;
    b.abilityTimer -= dt;
    if (b.energy <= 0 && b.state !== "resting") b.state = "hive";
    if (b.state === "hive" || b.state === "resting" || s.converting) {
      if (
        fly(
          b,
          home(s).x + ((index % 7) - 3) * 0.8,
          1.5 + Math.floor(index / 7) * 0.75,
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
      const angle = index * 2.399 + s.clock * 0.12;
      fly(
        b,
        s.player.x + Math.cos(angle) * (2.5 + (index % 3)),
        s.player.y + 2.4 + (index % 3) * 0.45,
        s.player.z + Math.sin(angle) * (2.5 + (index % 3)),
        dt,
        speed,
      );
      return;
    }
    if (
      ["following", "returning", "attacking", "searching"].includes(b.state) &&
      b.timer <= 0
    ) {
      b.state = "searching";
      let best: Flower | undefined,
        bestScore = Infinity;
      for (const f of s.flowers)
        if (
          f.field === field.id &&
          f.pollen > 1 &&
          distance(f, s.player) < 13
        ) {
          const score =
            distance(f, b) + (f.color === def.color ? -3 : 3) + random(s) * 4;
          if (score < bestScore) {
            bestScore = score;
            best = f;
          }
        }
      if (best) {
        b.target = best.id;
        b.state = "flying";
      } else {
        b.timer = 1;
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
      b.timer = 0.45;
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
      b.state = "returning";
      b.timer = def.interval;
      if (value > 0 && index < 5)
        floating(s, b.x, b.y + 1, b.z, `+${Math.ceil(value)}`, "#d1eea3");
      gatherPassive(s, b);
      spawnBeeAbilities(s, b, "gather");
    }
    if (b.state === "returning")
      fly(
        b,
        s.player.x + Math.cos(b.phase) * 2,
        s.player.y + 2.5,
        s.player.z + Math.sin(b.phase) * 2,
        dt,
        speed,
      );
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
      p.y = Math.max(p.y, surface(p.x, p.z) ?? p.y);
      if (p.hp <= 0) {
        p.x = home(s).x;
        p.y = 0;
        p.z = home(s).z - 8;
        p.hp = 100;
        p.invulnerable = 5;
        s.pollen = Math.floor(s.pollen * 0.8);
        s.converting = false;
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
  s.stats.time += dt;
  s.gatherCooldown -= dt;
  s.player.swing = Math.max(0, s.player.swing - dt);
  s.player.invulnerable = Math.max(0, s.player.invulnerable - dt);
  for (const f of s.flowers)
    if (f.pollen < f.max) f.pollen = Math.min(f.max, f.pollen + f.regen * dt);
  s.buffs = s.buffs.filter((b) => (b.remaining -= dt) > 0);
  s.floaters = s.floaters.filter((f) => (f.life -= dt) > 0);
  updateCapacity(s);
  updateEffects(s, dt);
  convert(s, dt);
  swarm(s, dt);
  enemies(s, dt);
  tokens(s, dt);
  if (atHive(s)) s.player.hp = Math.min(100, s.player.hp + dt * 7);
  if (s.challenge) {
    s.challenge.remaining -= dt;
    if (s.challenge.gathered >= s.challenge.target) {
      s.honey += 250;
      s.stats.honey += 250;
      s.inventory.egg++;
      event(s, "earn", 250);
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
      s.bees.length >= p.gate &&
      Math.abs(p.y - s.player.y) < 2.5 &&
      distance(p, s.player) < 7,
  ).sort((a, b) => distance(a, s.player) - distance(b, s.player))[0];
}
export function currentField(s: Game) {
  return FIELDS.find(
    (f) =>
      Math.abs(s.player.x - f.x) < 12 &&
      Math.abs(s.player.z - f.z) < 12 &&
      Math.abs(s.player.y - f.y) < 3,
  );
}
export function serialize(s: Game) {
  return JSON.stringify({
    version: 2,
    position: { x: s.player.x, z: s.player.z },
    hive: s.hive,
    honey: s.honey,
    pollen: s.pollen,
    tool: s.tool,
    bag: s.bag,
    boots: s.boots,
    hat: s.hat,
    owned: s.owned,
    slots: s.slots,
    bees: s.bees.map(({ kind, level, bond, energy, gifted }) => ({
      kind,
      level,
      bond,
      energy,
      gifted,
    })),
    inventory: s.inventory,
    beeProgress: s.beeProgress,
    balloonPollen:
      s.balloonPollen +
      s.effects
        .filter((e) => e.kind === "balloon")
        .reduce((n, e) => n + e.stored, 0),
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
    s.hive = Math.floor(num(d.hive, 3, 5));
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
    s.capacity = BAGS.find((b) => b.id === s.bag)?.capacity ?? 200;
    s.pollen = num(d.pollen, 0, s.capacity * 2);
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
          gifted: b.gifted === true,
          level: Math.max(1, Math.floor(num(b.level, 1, 50))),
          bond: num(b.bond, 0, 1e6),
          energy: num(
            b.energy,
            BEES.find((d) => d.id === b.kind)!.energy,
            BEES.find((d) => d.id === b.kind)!.energy,
          ),
        }));
    }
    for (const k of Object.keys(s.inventory))
      s.inventory[k] = Math.floor(
        num(d.inventory?.[k], s.inventory[k], MAX_ITEMS),
      );
    s.beeProgress = {
      tabbyLove: Math.floor(num(d.beeProgress?.tabbyLove, 0, 1000)),
      fetch: Math.floor(num(d.beeProgress?.fetch, 0, 10)),
    };
    s.balloonPollen = num(d.balloonPollen, 0);
    updateCapacity(s);
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
    s.settings = {
      volume: num(d.settings?.volume, 0.35, 1),
      muted: d.settings?.muted === true,
      sensitivity: clamp(num(d.settings?.sensitivity, 1, 2), 0.3, 2),
      quality: d.settings?.quality === "low" ? "low" : "high",
      jellyRarity: ["Legendary", "Mythic"].includes(d.settings?.jellyRarity)
        ? d.settings.jellyRarity
        : "Any",
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
      d.position &&
      typeof d.position.x === "number" &&
      typeof d.position.z === "number" &&
      Number.isFinite(d.position.x) &&
      Number.isFinite(d.position.z)
    ) {
      const { x, z } = d.position;
      const h = surface(x, z);
      if (h !== null && !solidAt(x, z) && !lockedAt(x, z, s.bees.length)) {
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
    s.seed = Math.floor(num(d.seed, s.seed, 4294967295));
    updateCapacity(s);
    s.unlocks = [0, ...[5, 10, 15, 25, 35].filter((n) => s.bees.length >= n)];
    s.notification = "Welcome back, keeper. Your mountain is waiting.";
    return s;
  } catch {
    return s;
  }
}
