import { describe, it, expect } from 'vitest';
import { createGame, newBee, harvest, collect, awardHoney, hatch, serialize, restore } from '../game/systems/simulation';
import { BEES, GEAR } from '../game/data/content';
import { grantAdminEgg, grantCraftingMaterials, maxLevelAllBees, unlockAllShopItems } from '../game/systems/admin';
import { buy } from '../game/systems/simulation';
import { BOND_REQUIREMENTS } from '../game/data/progression';

describe('admin tools', () => {
  it('unlocks and saves all shop gear, slots, sprinklers and consumables without charging or changing the loadout',()=>{
    const s=createGame(),tool=s.tool,bag=s.bag;
    unlockAllShopItems(s);
    expect(GEAR.every(g=>s.owned.includes(g.id))).toBe(true);
    expect(s.slots).toBe(50);expect(s.sprinkler).toBe(4);
    expect(s.inventory.mythicEgg).toBeGreaterThanOrEqual(1);
    expect(s.inventory.starTreat).toBeGreaterThanOrEqual(1);
    expect(s.tool).toBe(tool);expect(s.bag).toBe(bag);expect(s.honey).toBe(0);
    const loaded=restore(serialize(s));
    expect(loaded.adminShopUnlocks).toBe(true);
    const highGear=GEAR.find(g=>g.type==='tool'&&g.gate===35)!;
    expect(buy(loaded,highGear.id)).toBe(true);expect(loaded.tool).toBe(highGear.id);
    expect(loaded.honey).toBe(0);
    const owned=[...s.owned],eggs=s.inventory.mythicEgg;
    unlockAllShopItems(s);expect(s.owned).toEqual(owned);expect(s.inventory.mythicEgg).toBe(eggs);
  });
  it('maxes every owned bee and saves levels without changing species, gifted status or inventory',()=>{
    const s=createGame();s.bees.push(newBee(s,'bee-26'));
    s.bees[1].level=9;s.bees[1].bond=12;s.bees[1].gifted=true;
    const identities=s.bees.map(b=>({id:b.id,kind:b.kind,gifted:b.gifted}));
    const items={...s.inventory},honey=s.honey;
    maxLevelAllBees(s);
    expect(s.bees.every(b=>b.level===BOND_REQUIREMENTS.length+1&&b.bond===0)).toBe(true);
    expect(s.bees.map(b=>({id:b.id,kind:b.kind,gifted:b.gifted}))).toEqual(identities);
    expect(s.inventory).toEqual(items);expect(s.honey).toBe(honey);
    expect(s.stats.levels).toBe(40);
    maxLevelAllBees(s);expect(s.stats.levels).toBe(40);
    expect(restore(serialize(s)).bees.every(b=>b.level===BOND_REQUIREMENTS.length+1)).toBe(true);
  });
  it('gives ten times the pollen from real tiles without depleting them ten times faster',()=>{
    const normal=createGame(),boosted=createGame();
    for(const s of [normal,boosted]) {
      s.capacity=100000;
      Object.assign(s.player,s.flowers[0]);
    }
    boosted.adminBoosts.pollen=true;
    expect(collect(boosted)).toBeCloseTo(collect(normal)*10);
    expect(boosted.flowers.map(f=>f.pollen)).toEqual(normal.flowers.map(f=>f.pollen));
  });
  it('keeps boosted pollen within the remaining bag capacity',()=>{
    const s=createGame();s.adminBoosts.pollen=true;s.pollen=s.capacity-3;
    const before=s.flowers[0].pollen;
    expect(harvest(s,s.flowers[0],100)).toBeCloseTo(3);
    expect(s.pollen).toBe(s.capacity);
    expect(before-s.flowers[0].pollen).toBeCloseTo(.3);
  });
  it('independently toggles pollen and honey multipliers without compounding', () => {
    const normal=createGame(), boosted=createGame();
    for(const s of [normal,boosted]) { s.capacity=100000; s.flowers[0].pollen=10000; }
    boosted.adminBoosts.pollen=true;
    expect(harvest(boosted,boosted.flowers[0],1)).toBeCloseTo(harvest(normal,normal.flowers[0],1)*10);
    awardHoney(boosted,10); expect(boosted.honey).toBe(10);
    boosted.adminBoosts.honey=true;
    awardHoney(boosted,10); expect(boosted.honey).toBe(110);
    boosted.adminBoosts.honey=false;
    awardHoney(boosted,10); expect(boosted.honey).toBe(120);
  });
  it('grants a saved gifted Mythic egg that hatches a gifted Mythic bee', () => {
    const s=createGame();
    grantAdminEgg(s,'mythicEgg',true);
    const loaded=restore(serialize(s));
    expect(hatch(loaded,'giftedMythicEgg')).toBe(true);
    expect(loaded.bees.at(-1)?.gifted).toBe(true);
    expect(BEES.find(b=>b.id===loaded.bees.at(-1)?.kind)?.rarity).toBe('Mythic');
    expect(loaded.inventory.giftedMythicEgg).toBe(0);
  });
  it('adds materials repeatedly without removing existing inventory', () => {
    const s=createGame(), before=s.inventory.jelly;
    grantCraftingMaterials(s); grantCraftingMaterials(s);
    expect(s.inventory.jelly).toBe(before+1998);
    expect(s.inventory.turpentine).toBe(1998);
    expect(s.inventory.egg).toBe(1);
  });
});
