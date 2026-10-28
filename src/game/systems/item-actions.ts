import type { Game } from './types';
import { EGGS, type EggKind } from '../data/progression';
import { feed, giftBee, reroll, hatch } from './simulation';

export const BEE_ITEMS = new Set([...Object.keys(EGGS), 'treat', 'jelly', 'starJelly', 'starTreat', 'sunflowerSeed', 'strawberry', 'blueberry', 'pineapple']);
/** Public slots are 1–10; the tool always occupies slot 1. */
export function assignHotbar(game: Game, slot: number, item: string | null) {
  if (!Number.isInteger(slot) || slot < 2 || slot > 10 ||
      (item !== null && !Object.hasOwn(game.inventory, item))) return false;
  game.hotbar[slot - 2] = item;
  return true;
}
export function applyBeeItem(game: Game, item: string, beeId: string) {
  if (!game.bees.some(bee => bee.id === beeId) || !(game.inventory[item] > 0) || game.jellyRun?.running) return false;
  if (Object.hasOwn(EGGS,item)) return hatch(game,item as EggKind,beeId);
  if (['treat', 'sunflowerSeed', 'strawberry', 'blueberry', 'pineapple'].includes(item)) return feed(game, beeId, item);
  if (item === 'starTreat') return giftBee(game, beeId);
  if (item === 'jelly' || item === 'starJelly') return reroll(game, beeId, item, true);
  return false;
}
