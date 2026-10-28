import { RECIPES } from "../data/support";
import { ITEM_NAMES } from "../data/progression";
import { badgeCount } from "./badges";
import { notify } from "./simulation";
import type { Game } from "./types";
import { PLACES } from "../data/content";

export function atGuild(s: Game) {
  const guild = PLACES.find((p) => p.id === "guild")!;
  return (
    badgeCount(s) >= 15 &&
    Math.hypot(s.player.x - guild.x, s.player.z - guild.z) < 9 &&
    Math.abs(s.player.y - guild.y) < 3
  );
}
export function startCraft(s: Game, item: string, quantity: number) {
  const recipe = RECIPES[item];
  if (
    !recipe ||
    s.crafting ||
    !atGuild(s) ||
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    quantity > 10000
  )
    return false;
  if (
    Object.entries(recipe).some(
      ([id, n]) => (s.inventory[id] ?? 0) < n * quantity,
    )
  )
    return false;
  for (const [id, n] of Object.entries(recipe)) s.inventory[id] -= n * quantity;
  s.crafting = { item, quantity, elapsed: 0 };
  notify(s, `Blending ${quantity} ${ITEM_NAMES[item] ?? item}.`);
  return true;
}
export function tickCraft(s: Game, dt: number) {
  if (s.crafting)
    s.crafting.elapsed = Math.min(
      s.crafting.quantity * 300,
      s.crafting.elapsed + Math.max(0, dt),
    );
}
export function finishCraft(s: Game) {
  const job = s.crafting;
  if (!job || !atGuild(s)) return false;
  const done = Math.min(
      job.quantity,
      Math.floor((job.elapsed + 0.000001) / 300),
    ),
    remaining = job.quantity - done;
  s.inventory[job.item] = (s.inventory[job.item] ?? 0) + done;
  for (const [id, n] of Object.entries(RECIPES[job.item]))
    s.inventory[id] = (s.inventory[id] ?? 0) + n * remaining;
  s.crafting = null;
  notify(
    s,
    `Collected ${done} ${ITEM_NAMES[job.item] ?? job.item}.${remaining ? " Unfinished ingredients returned." : ""}`,
  );
  return true;
}
