import { Triangle, Vector3 } from "three";

/** X/Z spatial index over the converted map triangles. Heights are world units. */
export class TriangleTerrain {
  private cells = new Map<string, number[]>();
  private triangle = new Triangle();
  private probe = new Vector3();
  private closest = new Vector3();
  constructor(private vertices: Float32Array, private cellSize = 5) {
    if (vertices.length % 9) throw new Error("Invalid map collision data");
    for (let i = 0; i < vertices.length; i += 9) {
      const x0 = Math.floor(Math.min(vertices[i], vertices[i + 3], vertices[i + 6]) / cellSize);
      const x1 = Math.floor(Math.max(vertices[i], vertices[i + 3], vertices[i + 6]) / cellSize);
      const z0 = Math.floor(Math.min(vertices[i + 2], vertices[i + 5], vertices[i + 8]) / cellSize);
      const z1 = Math.floor(Math.max(vertices[i + 2], vertices[i + 5], vertices[i + 8]) / cellSize);
      for (let x = x0; x <= x1; x++) for (let z = z0; z <= z1; z++) {
        const key = `${x},${z}`, list = this.cells.get(key);
        if (list) list.push(i); else this.cells.set(key, [i]);
      }
    }
  }
  surface(x: number, z: number, feet = Infinity): number | null {
    const v = this.vertices, candidates = this.cells.get(`${Math.floor(x / this.cellSize)},${Math.floor(z / this.cellSize)}`);
    let highest: number | null = null;
    for (const i of candidates ?? []) {
      const ax = v[i], az = v[i + 2], bx = v[i + 3], bz = v[i + 5], cx = v[i + 6], cz = v[i + 8];
      const den = (bz - cz) * (ax - cx) + (cx - bx) * (az - cz);
      if (Math.abs(den) < 0.000001) continue;
      const a = ((bz - cz) * (x - cx) + (cx - bx) * (z - cz)) / den;
      const b = ((cz - az) * (x - cx) + (ax - cx) * (z - cz)) / den;
      if (a < -0.0001 || b < -0.0001 || a + b > 1.0001) continue;
      const y = a * v[i + 1] + b * v[i + 4] + (1 - a - b) * v[i + 7];
      if (y <= feet + 0.8 && (highest === null || y > highest)) highest = y;
    }
    return highest;
  }
  solid(x: number, z: number, feet: number): boolean {
    const v = this.vertices, seen = new Set<number>(), radius = 0.36;
    for (let cx = Math.floor((x - radius) / this.cellSize); cx <= Math.floor((x + radius) / this.cellSize); cx++)
      for (let cz = Math.floor((z - radius) / this.cellSize); cz <= Math.floor((z + radius) / this.cellSize); cz++)
        for (const i of this.cells.get(`${cx},${cz}`) ?? []) {
          if (seen.has(i)) continue;
          seen.add(i);
          const lo = Math.min(v[i + 1], v[i + 4], v[i + 7]), hi = Math.max(v[i + 1], v[i + 4], v[i + 7]);
          if (hi < feet + 0.65 || lo > feet + 2.5) continue;
          this.triangle.a.fromArray(v, i); this.triangle.b.fromArray(v, i + 3); this.triangle.c.fromArray(v, i + 6);
          const normal = this.triangle.getNormal(this.closest);
          if (Math.abs(normal.y) > 0.7) continue;
          for (const dy of [0.65, 1.3, 1.95]) {
            this.probe.set(x, feet + dy, z);
            this.triangle.closestPointToPoint(this.probe, this.closest);
            if (this.closest.distanceToSquared(this.probe) < radius * radius) return true;
          }
        }
    return false;
  }
}

let active = new TriangleTerrain(new Float32Array());
export function installTerrain(vertices: Float32Array) { active = new TriangleTerrain(vertices); }
export const importedSurface = (x: number, z: number, feet?: number) => active.surface(x, z, feet);
export const importedSolid = (x: number, z: number, feet: number) => active.solid(x, z, feet);
