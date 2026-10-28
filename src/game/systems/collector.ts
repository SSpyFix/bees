import type { Gear } from "../data/content";
import type { Flower, Game } from "./types";

/** Snap to the field grid, then rotate the reference pattern with the beekeeper. */
export function collectorTargets(s: Game, tool: Gear): Flower[] {
  const near = s.flowers.filter(
    (f) =>
      Math.abs(f.y - s.player.y) < 2 &&
      Math.hypot(f.x - s.player.x, f.z - s.player.z) < 1.8,
  );
  const anchor = near.sort(
    (a, b) =>
      Math.hypot(a.x - s.player.x, a.z - s.player.z) -
      Math.hypot(b.x - s.player.x, b.z - s.player.z),
  )[0];
  if (!anchor) return [];
  const fx = Math.sin(s.player.yaw),
    fz = Math.cos(s.player.yaw);
  const count = tool.tiles ?? 2;
  const candidates = s.flowers
    .filter((f) => f.field === anchor.field)
    .map((f) => {
      const dx = f.x - anchor.x,
        dz = f.z - anchor.z;
      const forward = dx * fx + dz * fz,
        cross = Math.abs(dx * fz - dz * fx);
      let score = dx * dx + dz * dz;
      if (tool.shape === "single") score = (forward - 1.35) ** 2 + cross ** 2;
      if (tool.shape === "line")
        score = (forward - 0.68) ** 2 + cross ** 2 * 100;
      if (tool.shape === "square")
        score = Math.max(Math.abs(dx), Math.abs(dz)) ** 2 + score * 0.001;
      if (tool.shape === "cone") score += forward < -0.1 ? 1000 : cross * 0.2;
      return { f, score };
    });
  const reach = Math.max(2.8, (tool.range ?? 3) + 1.35);
  return candidates
    .filter(({ f }) => Math.hypot(f.x - anchor.x, f.z - anchor.z) <= reach)
    .sort((a, b) => a.score - b.score || a.f.id - b.f.id)
    .slice(0, count)
    .map((x) => x.f);
}
