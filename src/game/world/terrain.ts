import map from "../data/imported-map.json";
import { importedSolid, importedSurface } from "./imported-terrain";

function routePosition(r: (typeof map.routes)[number], x: number, z: number) {
  const dx=r.to[0]-r.from[0], dz=r.to[2]-r.from[2];
  const t=((x-r.from[0])*dx+(z-r.from[2])*dz)/(dx*dx+dz*dz);
  if(t<0||t>1||Math.hypot(x-r.from[0]-t*dx,z-r.from[2]-t*dz)>r.width/2) return null;
  return r.from[1]+t*(r.to[1]-r.from[1]);
}

export function surface(x: number, z: number, feet = Infinity): number | null {
  let y = importedSurface(x, z, feet);
  for(const r of map.routes) {
    const h=routePosition(r,x,z);
    if(h!==null && h<=feet+0.8) y=Math.max(y??-Infinity,h);
  }
  for (const f of map.fields)
    if (Math.abs(x - f.x) <= f.width / 2 && Math.abs(z - f.z) <= f.depth / 2 && f.y <= feet + 0.8)
      y = Math.max(y ?? -Infinity, f.y);
  const stump = map.supplementalStump;
  if (Math.hypot(x - stump.x, z - stump.z) <= stump.radius && stump.y <= feet + 0.8)
    y = Math.max(y ?? -Infinity, stump.y);
  if (x >= 151 && x <= 173 && z >= -168 && z <= -160 && 22.925 <= feet + 0.8)
    y = Math.max(y ?? -Infinity, 22.925);
  return y;
}
export function lockedAt(x: number, z: number, bees: number, feet = Infinity): number {
  let required = 0;
  for(const r of map.routes) {
    const h=routePosition(r,x,z);
    if(h!==null && Math.abs(feet-h)<4) required=Math.max(required,r.gate);
  }
  for (const f of map.fields)
    if (Math.abs(x - f.x) <= f.width / 2 + 0.4 && Math.abs(z - f.z) <= f.depth / 2 + 0.4 && Math.abs(feet - f.y) < 4)
      required = Math.max(required, f.gate);
  for (const g of map.gates)
    if (Math.abs(x - g.x) < g.width / 2 && Math.abs(z - g.z) < 1 && Math.abs(feet - (g.y - 5)) < 7)
      required = Math.max(required, g.bees);
  return required > bees ? required : 0;
}
export function solidAt(x: number, z: number, feet = 0): boolean {
  return importedSolid(x, z, feet);
}
