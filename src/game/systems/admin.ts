import { GEAR } from "../data/content";
import { MAX_HIVE_SLOTS } from "../data/hive-slots";
import { SPRINKLERS } from "../data/support";
import { EGGS, TICKET_ITEMS, MAX_BEE_LEVEL, type EggKind } from '../data/progression';
import { MAX_ITEMS, notify, event } from './simulation';
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

export function maxLevelAllBees(s: Game) {
  let levels=0;
  for(const bee of s.bees) {
    levels+=Math.max(0,MAX_BEE_LEVEL-bee.level);
    bee.level=MAX_BEE_LEVEL;
    bee.bond=0;
  }
  if(levels>0){s.stats.levels+=levels;event(s,'level',levels);}
  notify(s,`All bees are now level ${MAX_BEE_LEVEL}.`);
}

export function unlockAllShopItems(s: Game) {
  s.owned=[...new Set([...s.owned,...GEAR.map(item=>item.id)])];
  s.adminShopUnlocks=true;
  s.slots=MAX_HIVE_SLOTS;
  if(s.sprinkler!==SPRINKLERS.length-1)s.sprinklers=[];
  s.sprinkler=SPRINKLERS.length-1;
  const stock=new Set(['egg','treat','jelly','booster','converter',...TICKET_ITEMS.map(item=>item.id)]);
  for(const item of stock)s.inventory[item]=Math.max(s.inventory[item]??0,1);
  notify(s,'All shop equipment unlocked, hive expanded and shop items granted.');
}
