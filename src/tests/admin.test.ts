import { describe, it, expect } from 'vitest';
import { createGame, harvest, awardHoney, hatch, serialize, restore } from '../game/systems/simulation';
import { BEES } from '../game/data/content';
import { grantAdminEgg, grantCraftingMaterials } from '../game/systems/admin';

describe('admin tools', () => {
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
