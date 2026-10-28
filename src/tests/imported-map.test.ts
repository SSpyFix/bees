import { describe, expect, it } from "vitest";
import { TriangleTerrain } from "../game/world/imported-terrain";
import map from "../game/data/imported-map.json";
import { FIELDS, PLACES, HIVE_PADS } from "../game/data/content";
import { createGame, restore, serialize, movePlayer, collect } from "../game/systems/simulation";
import { solidAt, surface, lockedAt } from "../game/world/terrain";

const floor = (y: number) => [-5,y,-5, 5,y,5, 5,y,-5, -5,y,-5, -5,y,5, 5,y,5];
describe("imported collision geometry", () => {
  it("selects the floor beneath the player rather than an overhead bridge", () => {
    const terrain = new TriangleTerrain(new Float32Array([...floor(0), ...floor(8)]));
    expect(terrain.surface(0, 0, 0)).toBeCloseTo(0);
    expect(terrain.surface(0, 0, 8)).toBeCloseTo(8);
    expect(terrain.surface(20, 20, 0)).toBeNull();
  });
  it("detects a wall at body height without treating the floor as a wall", () => {
    const terrain = new TriangleTerrain(new Float32Array([...floor(0), 1,0,-5, 1,4,-5, 1,4,5, 1,0,-5, 1,4,5, 1,0,5]));
    expect(terrain.solid(0, 0, 0)).toBe(false);
    expect(terrain.solid(0.8, 0, 0)).toBe(true);
    expect(terrain.solid(0.8, 0, 6)).toBe(false);
  });
});

describe("playable imported map", () => {
  it("places flowers inside all seventeen live fields", () => {
    const game = createGame();
    expect(game.flowers).toHaveLength(map.flowers.length);
    for (const f of FIELDS) {
      expect(game.flowers.filter((p) => p.field === f.id).length, f.name).toBeGreaterThan(200);
      expect(surface(f.x, f.z, f.y), f.name).toBeCloseTo(f.y, 1);
    }
  });
  it("has clear interaction positions on visible ground", () => {
    const blocked = PLACES.filter((p) => solidAt(p.x, p.z, p.y)).map((p) => p.id);
    expect(blocked).toEqual([]);
    for (const p of PLACES) expect(surface(p.x, p.z, p.y), p.id).not.toBeNull();
  });
  it("walks from the exported spawn and gathers from the measured flower tiles", () => {
    const s = createGame(), start = s.player.z;
    for (let i=0;i<12;i++) movePlayer(s,0,-1,0.1);
    expect(s.player.z).toBeLessThan(start-2);
    Object.assign(s.player, FIELDS[0]);
    expect(collect(s)).toBeGreaterThan(0);
  });
  it("migrates old map positions while preserving bees and purchases", () => {
    const s = createGame();s.honey=12345;
    const data=JSON.parse(serialize(s));delete data.mapVersion;data.position={x:-27,z:34};
    const loaded=restore(JSON.stringify(data));
    expect(loaded.honey).toBe(12345);expect(loaded.bees[0].kind).toBe(s.bees[0].kind);
    expect(loaded.player.x).toBe(map.spawn.x);expect(loaded.player.z).toBe(map.spawn.z);
  });
  it("keeps locked fields protected at their measured elevations", () => {
    for(const f of FIELDS.filter(f=>f.gate>0)) {
      expect(lockedAt(f.x,f.z,1,f.y),f.id).toBe(f.gate);
      expect(lockedAt(f.x,f.z,50,f.y),f.id).toBe(0);
    }
  });
  it("rejects harvesting a locked field even if the player falls into it", () => {
    const s=createGame();Object.assign(s.player,FIELDS.find(f=>f.id==='coconut')!);
    expect(collect(s)).toBe(0);
  });
  it("migrates an old sixth-hive selection to an existing imported hive", () => {
    const raw=JSON.parse(serialize(createGame()));raw.hive=5;
    expect(HIVE_PADS[restore(JSON.stringify(raw)).hive]).toBeDefined();
  });
  it("walks each rebuilt trail to the added upper map areas", () => {
    for(const r of map.routes) {
      const s=createGame();while(s.bees.length<50)s.bees.push({...s.bees[0],id:`test-${s.bees.length}`});
      Object.assign(s.player,{x:r.from[0],y:r.from[1],z:r.from[2]});
      const dx=r.to[0]-r.from[0],dz=r.to[2]-r.from[2],length=Math.hypot(dx,dz);
      for(let i=0;i<Math.floor(length/.8);i++) movePlayer(s,dx,dz,.1);
      expect(Math.hypot(s.player.x-r.to[0],s.player.z-r.to[2]),`${r.name}: ${s.player.x},${s.player.y},${s.player.z}`).toBeLessThan(1.5);
      expect(s.player.y,r.name).toBeGreaterThan(r.to[1]-1.5);
    }
  });
  it("walks across the source gate approach with five bees", () => {
    const g=map.gates.find(g=>g.bees===5)!,s=createGame();
    while(s.bees.length<5)s.bees.push({...s.bees[0],id:`b-${s.bees.length}`});
    const saved=JSON.parse(serialize(s));saved.position={x:g.x,y:g.y-5,z:g.z+3};
    const loaded=restore(JSON.stringify(saved));
    for(let i=0;i<120;i++) movePlayer(loaded,0,-1,1/30);
    expect(loaded.player.z,JSON.stringify(loaded.player)).toBeLessThan(g.z-3);
  });
});
