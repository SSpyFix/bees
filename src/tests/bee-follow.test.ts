import { describe, it, expect } from 'vitest';
import { createGame, newBee, random } from '../game/systems/simulation';
import { followBee } from '../game/systems/bee-follow';

describe('wandering swarm',()=>{
  it('chooses independent destinations and keeps roaming near an idle player',()=>{
    const s=createGame();
    while(s.bees.length<8)s.bees.push(newBee(s,'bee-0'));
    const destinations=new Set<string>(); let widest=0;
    for(let i=0;i<300;i++) for(const b of s.bees) {
      followBee(s,b,.1,10,()=>random(s));
      destinations.add(`${b.wander?.x.toFixed(1)},${b.wander?.z.toFixed(1)}`);
      const d=Math.hypot(b.x-s.player.x,b.z-s.player.z);
      widest=Math.max(widest,d); expect(d).toBeLessThan(12);
    }
    expect(destinations.size).toBeGreaterThan(30);
    expect(widest).toBeGreaterThan(5);
    expect(new Set(s.bees.map(b=>b.y.toFixed(1))).size).toBeGreaterThan(2);
  });
  it('catches up to a moving player and regroups after a teleport',()=>{
    const s=createGame(),b=s.bees[0]; s.player.moving=true;
    for(let i=0;i<100;i++) {s.player.x+=.6;followBee(s,b,.1,10,()=>random(s));}
    expect(Math.hypot(b.x-s.player.x,b.z-s.player.z)).toBeLessThan(12);
    s.player.x+=150;s.player.y=30;
    followBee(s,b,.1,10,()=>random(s));
    expect(Math.hypot(b.x-s.player.x,b.z-s.player.z)).toBeLessThan(12);
    expect(b.y).toBeGreaterThan(30);
  });
});
