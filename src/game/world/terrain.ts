import { PLATFORMS, RAMPS, PLACES, FIELDS } from "../data/content";
export function surface(x: number, z: number): number | null {
  let y: number | null = null;
  for (const p of PLATFORMS)
    if (Math.abs(x - p.x) <= p.w / 2 && Math.abs(z - p.z) <= p.d / 2)
      y = Math.max(y ?? -100, p.y);
  for (const r of RAMPS)
    if (Math.abs(x - r.x) <= r.w / 2 && z <= r.startZ && z >= r.endZ) {
      const h =
        r.low + ((r.high - r.low) * (r.startZ - z)) / (r.startZ - r.endZ);
      y = h;
    }
  return y;
}
export function lockedAt(x: number, z: number, bees: number): number {
  // Entire upper regions are protected too, so jumping around a gate cannot bypass it.
  let gate = 0;
  for (const p of PLATFORMS.slice(1))
    if (Math.abs(x - p.x) < p.w / 2 && Math.abs(z - p.z) < p.d / 2)
      gate = Math.max(
        gate,
        p.y === 8
          ? 5
          : p.y === 16
            ? 10
            : p.y === 13
              ? 15
              : p.y === 26
                ? 25
                : 35,
      );
  for (const r of RAMPS)
    if (Math.abs(x - r.x) <= r.w / 2 + 0.6 && z < r.gateZ + 0.65 && z > r.endZ)
      gate = Math.max(gate, r.gate);
  return gate > bees ? gate : 0;
}
export function solidAt(x: number, z: number): boolean {
  for (const f of FIELDS)
    if (Math.abs(Math.abs(x - f.x) - 11.2) < 0.6 && Math.abs(z - f.z) < 11.6)
      return true;
  for (const p of PLACES)
    if (
      (p.kind === "shop" || p.kind === "eggs") &&
      Math.abs(x - p.x) < 3.5 &&
      z > p.z + 0.3 &&
      z < p.z + 5.2
    )
      return true;
  // Hive walls sit behind the conversion apron.
  if (z > 65.3 && z < 68.5 && Math.abs(x) < 8) return true;
  return false;
}
