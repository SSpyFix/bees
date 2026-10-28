import { useLayoutEffect, useRef, useState } from 'react';
import { useGame } from '../game/systems/store';
import { EGGS, MAX_BEE_LEVEL, type EggKind } from '../game/data/progression';
import { grantAdminEgg, grantCraftingMaterials, maxLevelAllBees } from '../game/systems/admin';

export default function AdminPanel() {
  const { game, adminUnlocked, adminOpen, setAdminOpen, refresh, save } = useGame();
  const [egg, setEgg] = useState<EggKind>('mythicEgg');
  const [gifted, setGifted] = useState(false);
  const [message, setMessage] = useState('');
  const panel = useRef<HTMLElement>(null);
  const drag = useRef<{x:number;y:number} | null>(null);
  const [position, setPosition] = useState<{x:number;y:number} | null>(null);
  const move = (x:number,y:number) => {
    const box=panel.current?.getBoundingClientRect();
    if(!box) return;
    setPosition({x:Math.max(8,Math.min(x,innerWidth-box.width-8)),y:Math.max(8,Math.min(y,innerHeight-box.height-8))});
  };
  useLayoutEffect(()=>{
    const fit=()=>{
      const box=panel.current?.getBoundingClientRect();
      if(box && (box.right>innerWidth-8 || box.bottom>innerHeight-8 || box.x<8 || box.y<8)) move(box.x,box.y);
    };
    fit(); window.addEventListener('resize',fit);
    return ()=>window.removeEventListener('resize',fit);
  },[adminOpen,adminUnlocked]);
  if (!adminUnlocked) return null;
  const act = (fn: () => void) => { fn(); refresh(); save(); };
  return <aside ref={panel} className="admin-panel" aria-label="Admin menu" style={position ? {left:position.x,top:position.y,right:'auto'} : undefined}>
    <div className="admin-header" tabIndex={0} aria-label="Move admin menu" title="Drag to move. Arrow keys also move the menu."
      onPointerDown={e=>{
        if(e.button!==0 || (e.target as HTMLElement).closest('button')) return;
        const box=panel.current!.getBoundingClientRect();
        drag.current={x:e.clientX-box.x,y:e.clientY-box.y};
        e.currentTarget.setPointerCapture(e.pointerId); e.preventDefault();
      }}
      onPointerMove={e=>{if(drag.current) move(e.clientX-drag.current.x,e.clientY-drag.current.y);}}
      onPointerUp={()=>{drag.current=null;}} onPointerCancel={()=>{drag.current=null;}}
      onKeyDown={e=>{
        if(e.target!==e.currentTarget || !['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)) return;
        e.preventDefault(); e.stopPropagation();
        const box=panel.current!.getBoundingClientRect();
        move(box.x+(e.key==='ArrowLeft'?-10:e.key==='ArrowRight'?10:0),box.y+(e.key==='ArrowUp'?-10:e.key==='ArrowDown'?10:0));
      }}><strong>Admin menu</strong><button className="button secondary" onClick={()=>setAdminOpen(!adminOpen)}>{adminOpen ? 'Hide' : 'Show'}</button></div>
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
      <button className="button secondary" onClick={()=>act(()=>{maxLevelAllBees(game);setMessage(`All bees are now level ${MAX_BEE_LEVEL}.`);})}>Max level all bees</button>
      <p role="status">{message}</p>
    </>}
  </aside>;
}
