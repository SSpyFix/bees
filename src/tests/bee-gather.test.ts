import {describe,it,expect} from 'vitest';
import {createGame,newBee,step} from '../game/systems/simulation';
import {FIELDS} from '../game/data/content';
function workingSwarm(count:number) {
 const s=createGame();Object.assign(s.player,FIELDS[0]);s.enemies=[];
 while(s.bees.length<count)s.bees.push(newBee(s,'bee-0'));
 for(const b of s.bees)Object.assign(b,{x:s.player.x,y:s.player.y+.8,z:s.player.z,timer:0,abilityTimer:Infinity});
 return s;
}
describe('concurrent bee gathering',()=>{
 it('assigns separate flowers instead of stacking every bee on the nearest tile',()=>{
  const s=workingSwarm(10);step(s,.1);
  expect(new Set(s.bees.map(b=>b.target)).size).toBe(10);
 });
 it('lets every bee gather at its interval without adding a return trip to the timer',()=>{
  const s=workingSwarm(8),times=Array.from({length:8},()=>[] as number[]);
  for(let i=0;i<220;i++) {
   const previous=s.bees.map(b=>b.energy);s.pollen=0;step(s,.1);
   s.bees.forEach((b,j)=>{if(b.energy<previous[j])times[j].push(s.clock);});
  }
  for(const visits of times) {
   expect(visits.length).toBeGreaterThanOrEqual(5);
   for(let i=1;i<visits.length;i++) {
    expect(visits[i]-visits[i-1]).toBeGreaterThanOrEqual(3.9);
    expect(visits[i]-visits[i-1]).toBeLessThanOrEqual(4.21);
   }
  }
 });
 it('shows collection feedback for bees beyond the first five',()=>{
  const s=workingSwarm(8);
  for(const b of s.bees){b.state='hive';b.energy=0;}
  const b=s.bees[7],f=s.flowers.find(f=>f.field==='sunflower'&&Math.hypot(f.x-s.player.x,f.z-s.player.z)<3)!;
  Object.assign(b,{state:'gathering',energy:20,target:f.id,x:f.x,y:f.y+.8,z:f.z,timer:0});
  step(s,.1);
  expect(s.floaters.some(f=>f.text.startsWith('+')&&Math.hypot(f.x-b.x,f.z-b.z)<1)).toBe(true);
 });
});
