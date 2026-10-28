import { BEES } from '../game/data/content';
import { ITEM_NAMES, EGGS } from '../game/data/progression';
import { useGame, sound } from '../game/systems/store';
import { useItemDrag } from '../game/systems/item-drag';
import { applyBeeItem } from '../game/systems/item-actions';

export default function ItemDropConfirmation() {
  const pending = useItemDrag(state => state.pending);
  const { game, refresh, save } = useGame();
  if (!pending) return null;
  const bee = game.bees.find(bee => bee.id === pending.beeId);
  const name = bee && BEES.find(def => def.id === bee.kind)?.name;
  const cancel = () => useItemDrag.setState({ pending: null });
  return <div className="item-confirm-backdrop" onKeyDown={event => {
    event.stopPropagation();
    if (event.key === 'Escape') cancel();
  }}>
    <section role="dialog" aria-modal="true" aria-label="Use item on bee" className="item-confirm">
      <h3>Use {ITEM_NAMES[pending.item] ?? pending.item}?</h3>
      {bee ? <p>Give 1 to {name}, level {bee.level} (hive slot {game.bees.indexOf(bee) + 1})?{pending.item in EGGS || pending.item.includes('Jelly') || pending.item === 'jelly' ? ' This replaces its species.' : ''}</p> : <label>Choose a bee<select aria-label="Target bee" value="" onChange={event => useItemDrag.setState({ pending: { ...pending, beeId: event.target.value } })}>
        <option value="">Select a hive slot</option>{game.bees.map((bee, i) => <option key={bee.id} value={bee.id}>Slot {i + 1} · {BEES.find(def => def.id === bee.kind)?.name} · Level {bee.level}</option>)}
      </select></label>}
      <div><button autoFocus onClick={cancel}>Cancel</button><button disabled={!bee || !(game.inventory[pending.item] > 0)} onClick={() => {
        if (applyBeeItem(game, pending.item, pending.beeId)) { sound(); refresh(); save(); cancel(); }
        else { game.notification = 'This item cannot be used on that bee right now.'; game.noticeId++; refresh(); cancel(); }
      }}>Use 1 {ITEM_NAMES[pending.item] ?? pending.item}</button></div>
    </section>
  </div>;
}
