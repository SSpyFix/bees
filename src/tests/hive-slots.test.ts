import {describe,it,expect} from 'vitest';
import {createGame,newBee,slotCost,buySlot,serialize,restore} from '../game/systems/simulation';
import {HIVE_SLOT_PRICES} from '../game/data/hive-slots';
import {PLACES} from '../game/data/content';
function atShop(){const s=createGame();while(s.bees.length<25)s.bees.push(newBee(s,'bee-0'));Object.assign(s.player,PLACES.find(p=>p.id==='shop-25'));return s;}
describe('Mountain Top hive slots',()=>{
 it('uses the researched slot prices and stops at fifty',()=>{
  const s=atShop();
  expect(HIVE_SLOT_PRICES).toHaveLength(25);
  expect(HIVE_SLOT_PRICES.reduce((a,b)=>a+b,0)).toBe(3421214977088);
  for(const [slots,price] of [[25,3000000],[26,7750000],[39,894566712],[48,767503162196],[49,2169203229760]]){s.slots=slots;expect(slotCost(s)).toBe(price);}
  s.slots=50;expect(slotCost(s)).toBe(Infinity);
 });
 it('charges for one extra capacity slot, updates the next price and saves it',()=>{
  const s=atShop();s.honey=10750000;
  expect(buySlot(s)).toBe(true);expect(s.slots).toBe(26);expect(s.bees).toHaveLength(25);expect(s.honey).toBe(7750000);
  expect(buySlot(s)).toBe(true);expect(s.slots).toBe(27);expect(s.honey).toBe(0);
  expect(restore(serialize(s)).slots).toBe(27);
 });
 it('rejects remote, under-gated, unaffordable and capped purchases without spending honey',()=>{
  const s=atShop();s.honey=3000000;
  const position={...s.player};s.player.x=0;s.player.z=0;
  expect(buySlot(s)).toBe(false);Object.assign(s.player,position);
  s.bees.pop();expect(buySlot(s)).toBe(false);s.bees.push(newBee(s,'bee-0'));
  s.honey=2999999;expect(buySlot(s)).toBe(false);expect(s.slots).toBe(25);expect(s.honey).toBe(2999999);
  s.slots=50;s.honey=1e15;expect(buySlot(s)).toBe(false);expect(s.honey).toBe(1e15);
 });
});
