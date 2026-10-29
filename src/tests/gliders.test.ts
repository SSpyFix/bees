import {describe,it,expect} from 'vitest';
import {createGame,newBee,buy,serialize,restore,movePlayer,toggleGlider,resetCharacter} from '../game/systems/simulation';
import {GEAR,FIELDS} from '../game/data/content';
function airborne(id='glider-0') {
 const s=createGame();s.owned.push(id);s.glider=id;
 Object.assign(s.player,{x:0,y:40,z:0,grounded:false,vy:-10});return s;
}
describe('gliding equipment',()=>{
 it('sells and saves Parachute and Mountain Top Glider in the correct shops',()=>{
  expect(GEAR.find(g=>g.id==='glider-0')).toMatchObject({name:'Parachute',cost:500000,shop:'shop-10',gate:10});
  expect(GEAR.find(g=>g.id==='glider-1')).toMatchObject({name:'Glider',cost:5000000,shop:'shop-25',gate:25});
  const s=createGame();while(s.bees.length<25)s.bees.push(newBee(s,'bee-0'));
  s.honey=5500000;expect(buy(s,'glider-0')).toBe(true);expect(buy(s,'glider-1')).toBe(true);
  expect(restore(serialize(s)).glider).toBe('glider-1');expect(s.honey).toBe(0);
 });
 it('includes new gliders when loading a previously unlocked admin save',()=>{
  const s=createGame();s.adminShopUnlocks=true;s.owned=GEAR.filter(g=>g.type!=='glider').map(g=>g.id);
  const loaded=restore(serialize(s));
  expect(loaded.owned).toEqual(expect.arrayContaining(['glider-0','glider-1']));
  expect(buy(loaded,'glider-1')).toBe(true);expect(loaded.honey).toBe(0);
 });
 it('requires owned equipment and being airborne to deploy',()=>{
  const s=createGame();expect(toggleGlider(s)).toBe(false);
  s.glider='glider-0';s.owned.push(s.glider);expect(toggleGlider(s)).toBe(false);
  s.player.grounded=false;expect(toggleGlider(s)).toBe(true);
  expect(s.player.gliding).toBe(true);expect(toggleGlider(s)).toBe(true);expect(s.player.gliding).toBe(false);
 });
 it('can deploy after walking off a ledge',()=>{
  const s=airborne();s.player.grounded=true;movePlayer(s,0,0,.1);
  expect(s.player.grounded).toBe(false);expect(toggleGlider(s)).toBe(true);
 });
 it('uses separate fixed glide speeds and sink rates, unaffected by walking buffs',()=>{
  for(const [id,speed,sink] of [['glider-0',10.5,4.9],['glider-1',24.5,8.4]] as const) {
   const s=airborne(id);s.buffs.push({kind:'haste',value:3,remaining:60});
   expect(toggleGlider(s)).toBe(true);
   for(let i=0;i<10;i++)movePlayer(s,1,0,.1);
   expect(s.player.x).toBeCloseTo(speed);expect(s.player.y).toBeCloseTo(40-sink);
  }
 });
 it('lets the player leave a cannon arc and automatically folds on landing or reset',()=>{
  const s=airborne();s.flight={from:{x:0,y:0,z:0},to:{x:20,y:0,z:0},elapsed:1,duration:3.5};
  expect(toggleGlider(s)).toBe(true);expect(s.flight).toBeNull();
  s.player.y=.1;for(let i=0;i<5;i++)movePlayer(s,0,0,.1);
  expect(s.player.grounded).toBe(true);expect(s.player.gliding).toBe(false);
  s.player.grounded=false;toggleGlider(s);resetCharacter(s);expect(s.player.gliding).toBe(false);
 });
 it('does not bypass a locked field by landing from above',()=>{
  const s=airborne(),f=FIELDS.find(f=>f.id==='coconut')!;
  Object.assign(s.player,{x:f.x,y:f.y+.1,z:f.z,grounded:false});toggleGlider(s);
  movePlayer(s,0,0,.1);expect(s.player.x).toBe(0);expect(s.player.z).toBe(0);
  expect(s.player.gliding).toBe(false);
 });
});
