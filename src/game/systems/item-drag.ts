import { create } from 'zustand';
import { useGame, sound } from './store';
import { BEE_ITEMS } from './item-actions';
import { useItem } from './simulation';

export const ITEM_DRAG_TYPE = 'application/x-bee-item';
export const useItemDrag = create<{
  item: string | null;
  hovered: string | null;
  pending: { item: string; beeId: string } | null;
}>(() => ({ item: null, hovered: null, pending: null }));

export function beginItemDrag(event: React.DragEvent, item: string) {
  if (!(useGame.getState().game.inventory[item] > 0)) { event.preventDefault(); return; }
  event.dataTransfer.setData(ITEM_DRAG_TYPE, item);
  event.dataTransfer.effectAllowed = 'copy';
  useItemDrag.setState({ item, hovered: null });
}
export function endItemDrag() { useItemDrag.setState({ item: null, hovered: null }); }
export function requestBeeItem(item: string, beeId: string) {
  const game = useGame.getState().game;
  if (!BEE_ITEMS.has(item) || !(game.inventory[item] > 0) || !game.bees.some(bee => bee.id === beeId)) return false;
  useItemDrag.setState({ pending: { item, beeId } });
  return true;
}
export function activateHotbar(slot: number) {
  const state = useGame.getState(), item = state.game.hotbar[slot - 2];
  if (!item || !(state.game.inventory[item] > 0)) return;
  if (BEE_ITEMS.has(item)) {
    useItemDrag.setState({ pending: { item, beeId: '' } });
  } else { useItem(state.game, item); state.refresh(); state.save(); sound(); }
}
