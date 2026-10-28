import { EGGS, type EggKind } from '../data/progression';
import { MAX_ITEMS, notify } from './simulation';
import type { Game } from './types';

export function grantAdminEgg(s: Game, egg: EggKind, gifted: boolean) {
  if (!Object.hasOwn(EGGS, egg)) return false;
  const key = gifted && !egg.startsWith('gifted')
    ? `gifted${egg[0].toUpperCase()}${egg.slice(1)}` : egg;
  s.inventory[key] = Math.min(MAX_ITEMS, (s.inventory[key] ?? 0) + 1);
  notify(s, `Added 1 ${EGGS[key as EggKind].name}. Hatch it from Inventory.`);
  return true;
}

export function grantCraftingMaterials(s: Game) {
  for (const key of Object.keys(s.inventory))
    if (!(key in EGGS) && !['ticket', 'booster', 'converter', 'starTreat'].includes(key))
      s.inventory[key] = Math.min(MAX_ITEMS, s.inventory[key] + 999);
  notify(s, 'Added 999 of each crafting material.');
}
