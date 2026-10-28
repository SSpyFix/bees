import { describe, expect, it } from 'vitest';
import { createGame, restore, serialize } from '../game/systems/simulation';
import { assignHotbar, applyBeeItem, BEE_ITEMS } from '../game/systems/item-actions';
import { BEES } from '../game/data/content';

describe('inventory shortcuts and bee items', () => {
  it('uses one gifted Mythic egg on the selected bee even in a full hive', () => {
    const game=createGame(); game.slots=game.bees.length;
    game.inventory.giftedMythicEgg=2;
    const target=game.bees[0]; target.level=5; target.bond=20;
    expect(BEE_ITEMS.has('giftedMythicEgg')).toBe(true);
    expect(applyBeeItem(game,'giftedMythicEgg','missing')).toBe(false);
    expect(game.inventory.giftedMythicEgg).toBe(2);
    expect(applyBeeItem(game,'giftedMythicEgg',target.id)).toBe(true);
    expect(game.bees).toHaveLength(1);
    expect(game.bees[0]).toMatchObject({id:target.id,level:5,bond:20,gifted:true});
    expect(BEES.find(b=>b.id===game.bees[0].kind)?.rarity).toBe('Mythic');
    expect(game.inventory.giftedMythicEgg).toBe(1);
  });
  it('keeps the tool in slot 1 and persists assigned items', () => {
    const game = createGame();
    expect(assignHotbar(game, 0, 'jelly')).toBe(false);
    expect(assignHotbar(game, 7, 'jelly')).toBe(true);
    expect(restore(serialize(game)).hotbar[5]).toBe('jelly');
    expect(assignHotbar(game, 3, 'unknown')).toBe(false);
    expect(assignHotbar(game, 2.5, 'treat')).toBe(false);
  });
  it('uses exactly one jelly even with auto-jelly preferences enabled', () => {
    const game = createGame();
    game.inventory.jelly = 10;
    game.settings.jellyRarity = 'Mythic';
    expect(applyBeeItem(game, 'jelly', game.bees[0].id)).toBe(true);
    expect(game.inventory.jelly).toBe(9);
    expect(game.jellyRun?.running).not.toBe(true);
  });
  it('uses a treat only on the requested existing bee', () => {
    const game = createGame();
    game.inventory.treat = 2;
    expect(applyBeeItem(game, 'treat', 'missing')).toBe(false);
    expect(game.inventory.treat).toBe(2);
    const bee = game.bees[0];
    expect(applyBeeItem(game, 'treat', bee.id)).toBe(true);
    expect(game.inventory.treat).toBe(1);
    expect(bee.bond + bee.level * 10).toBeGreaterThan(10);
    expect(applyBeeItem(game, 'converter', bee.id)).toBe(false);
  });
});
