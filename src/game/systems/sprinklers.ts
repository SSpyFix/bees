import { SPRINKLERS } from "../data/support";
import { badgesAtTier } from "./badges";
import { atGuild } from "./crafting";
import { currentField, distance, notify } from "./simulation";
import type { Game } from "./types";

export function buySprinkler(s: Game, tier: number) {
  const def = SPRINKLERS[tier];
  if (
    !def ||
    !Number.isInteger(tier) ||
    !atGuild(s) ||
    tier <= s.sprinkler ||
    s.honey < def.cost ||
    (tier > 0 && badgesAtTier(s, tier + 1) < 10)
  )
    return false;
  s.honey -= def.cost;
  s.stats.spent += def.cost;
  s.sprinkler = tier;
  s.sprinklers = [];
  notify(
    s,
    `${def.name} purchased. Use Sprinkler Builder while standing in a field.`,
  );
  return true;
}
export function placeSprinkler(s: Game) {
  const def = SPRINKLERS[s.sprinkler],
    field = currentField(s);
  if (!def || !field || s.player.y > field.y + 1 || s.bees.length < field.gate)
    return false;
  if (
    s.sprinklers.some(
      (p) => p.field === field.id && distance(p, s.player) < 8 * 1.35,
    )
  ) {
    notify(s, "Cannot place sprinklers this close to each other.");
    return false;
  }
  s.sprinklers.push({
    id: s.nextId++,
    x: s.player.x,
    y: field.y,
    z: s.player.z,
    field: field.id,
    setup: def.setup,
    timer: 0,
    pulse: 0,
  });
  if (s.sprinklers.length > def.count) s.sprinklers.shift();
  notify(s, `Building ${def.name}…`);
  return true;
}
export function tickSprinklers(s: Game, dt: number) {
  const def = SPRINKLERS[s.sprinkler];
  if (!def) return;
  for (const p of s.sprinklers) {
    p.pulse = Math.max(0, p.pulse - dt);
    let available = dt;
    if (p.setup > 0) {
      const consumed = Math.min(p.setup, available);
      p.setup -= consumed;
      available -= consumed;
    }
    p.timer += available;
    while (p.timer >= def.rate) {
      p.timer -= def.rate;
      p.pulse = 1;
      for (const f of s.flowers)
        if (f.field === p.field && distance(f, p) <= def.radius * 1.35)
          f.pollen = Math.min(f.max, f.pollen + def.power);
    }
  }
}
