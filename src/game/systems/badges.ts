import { BADGES, BADGE_RANKS, BADGE_TICKETS } from "../data/support";
import type { Game } from "./types";
import { notify } from "./simulation";

export const badgeCount = (s: Game) =>
  Object.values(s.badges).reduce((a, b) => a + b, 0);
export const badgesAtTier = (s: Game, tier: number) =>
  Object.values(s.badges).filter((rank) => rank >= tier).length;
export function badgeProgress(s: Game, id: string) {
  const b = BADGES.find((b) => b.id === id);
  if (!b) return 0;
  if (id === "honey") return Math.max(s.stats.honey, s.lifetime.earn ?? 0);
  if (id === "playtime") return s.stats.time;
  if (id === "quests")
    return Math.max(s.completed.length, s.lifetime.quest ?? 0);
  return s.lifetime[b.counter] ?? 0;
}
export function claimBadge(s: Game, id: string) {
  const def = BADGES.find((b) => b.id === id),
    rank = s.badges[id] ?? 0;
  if (!def || rank >= 5 || badgeProgress(s, id) < def.thresholds[rank])
    return false;
  s.badges[id] = rank + 1;
  s.inventory.ticket += BADGE_TICKETS[rank];
  notify(
    s,
    `${def.name} Badge — ${BADGE_RANKS[rank + 1]}! +${BADGE_TICKETS[rank]} Tickets`,
  );
  return true;
}
