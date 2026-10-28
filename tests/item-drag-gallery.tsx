import React from 'react';
import { createRoot } from 'react-dom/client';
import { Canvas } from '@react-three/fiber';
import { Vector3 } from 'three';
import LiveHiveBees from '../src/game/world/LiveHiveBees';
import HiveItemDrop from '../src/game/world/HiveItemDrop';
import InventoryPanel from '../src/components/InventoryPanel';
import ItemDropConfirmation from '../src/components/ItemDropConfirmation';
import HUD from '../src/components/HUD';
import { useGame } from '../src/game/systems/store';
import map from '../src/game/data/imported-map.json';

export function mountItemDragGallery() {
  const state = useGame.getState();
  state.game.hive = 0;
  state.game.bees = [{ ...state.game.bees[0], id: 'target-a', kind: 'bee-0', bond: 0 }, { ...state.game.bees[0], id: 'target-b', kind: 'bee-4', bond: 0 }];
  state.game.inventory.treat = 5; state.game.inventory.jelly = 5;
  state.game.inventory.starTreat = 1;
  useGame.setState({ menu: 'inventory' }); state.refresh();
  const host = document.createElement('div');
  host.style.cssText = 'position:fixed;inset:0;z-index:1000;background:#c6dcb1';
  document.body.append(host);
  const hive = map.hives[0];
  createRoot(host).render(<>
    <Canvas camera={{ position: [hive.x + 1, 3, hive.z - 8], fov: 42 }} onCreated={({ scene, camera }) => {
      camera.lookAt(hive.x + 1, 3, hive.z + 5);
      (window as any).__dragTarget = () => {
        scene.updateMatrixWorld(true);
        const mesh = scene.getObjectByName('live-hive-bee-target-b')!;
        const point = mesh.getWorldPosition(new Vector3()).project(camera);
        return { x: (point.x + 1) * innerWidth / 2, y: (1 - point.y) * innerHeight / 2 };
      };
    }}><LiveHiveBees /><HiveItemDrop /></Canvas>
    <HUD />
    <div className="reference-ui" style={{ position: 'absolute', top: 110, left: 0, width: 300, height: 520, overflow: 'auto', background: '#eee' }}><InventoryPanel /></div>
    <ItemDropConfirmation />
  </>);
}
