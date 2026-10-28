import { useState } from 'react';
import { useGame } from '../game/systems/store';
import { EGGS, type EggKind } from '../game/data/progression';
import { grantAdminEgg, grantCraftingMaterials } from '../game/systems/admin';

export default function AdminPanel() {
  const { game, adminUnlocked, adminOpen, setAdminOpen, refresh, save } = useGame();
  const [egg, setEgg] = useState<EggKind>('mythicEgg');
  const [gifted, setGifted] = useState(false);
  const [message, setMessage] = useState('');
  if (!adminUnlocked) return null;
  const act = (fn: () => void) => { fn(); refresh(); save(); };
  return <aside className="admin-panel" aria-label="Admin menu">
    <div className="admin-header"><strong>Admin menu</strong><button className="button secondary" onClick={()=>setAdminOpen(!adminOpen)}>{adminOpen ? 'Hide' : 'Show'}</button></div>
    {adminOpen && <>
      {(['pollen', 'honey'] as const).map(kind=><label className="admin-toggle" key={kind}>
        <span>10× {kind}</span><input type="checkbox" checked={game.adminBoosts[kind]} onChange={e=>act(()=>{game.adminBoosts[kind]=e.target.checked;})} />
      </label>)}
      <label>Egg type<select aria-label="Admin egg type" value={egg} onChange={e=>setEgg(e.target.value as EggKind)}>
        {Object.entries(EGGS).filter(([id])=>!id.startsWith('gifted')).map(([id,egg])=><option key={id} value={id}>{egg.name}</option>)}
      </select></label>
      <label className="admin-toggle">Gifted<input type="checkbox" checked={gifted} onChange={e=>setGifted(e.target.checked)} /></label>
      <button className="button" onClick={()=>act(()=>{grantAdminEgg(game,egg,gifted);setMessage('Egg added. Hatch it from Inventory.');})}>Give selected egg</button>
      <button className="button secondary" onClick={()=>act(()=>{grantCraftingMaterials(game);setMessage('Added 999 of every crafting material.');})}>+999 crafting materials</button>
      <p role="status">{message}</p>
    </>}
  </aside>;
}
