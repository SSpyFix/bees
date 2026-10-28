import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { Raycaster, Vector2 } from 'three';
import { BEE_ITEMS } from '../systems/item-actions';
import { endItemDrag, requestBeeItem, useItemDrag } from '../systems/item-drag';

/** HTML inventory drags land on the actual hive portrait under the cursor. */
export default function HiveItemDrop() {
  const { gl, camera, scene } = useThree();
  useEffect(() => {
    const canvas = gl.domElement, ray = new Raycaster(), pointer = new Vector2();
    const hitBee = (event: DragEvent) => {
      const bounds = canvas.getBoundingClientRect();
      pointer.set((event.clientX - bounds.left) / bounds.width * 2 - 1, -(event.clientY - bounds.top) / bounds.height * 2 + 1);
      ray.setFromCamera(pointer, camera);
      const hive = scene.getObjectByName('live-hive-bees');
      if (!hive) return null;
      const hit = ray.intersectObjects(hive.children, true).find(hit => hit.object.name.startsWith('live-hive-bee-'));
      return hit?.object.name.slice('live-hive-bee-'.length) ?? null;
    };
    const over = (event: DragEvent) => {
      const item = useItemDrag.getState().item;
      if (!item || !BEE_ITEMS.has(item)) return;
      event.preventDefault();
      const beeId = hitBee(event);
      event.dataTransfer!.dropEffect = beeId ? 'copy' : 'none';
      useItemDrag.setState({ hovered: beeId });
    };
    const drop = (event: DragEvent) => {
      const item = useItemDrag.getState().item;
      if (!item) return;
      event.preventDefault();
      const beeId = hitBee(event);
      if (beeId) requestBeeItem(item, beeId);
      endItemDrag();
    };
    const leave = () => useItemDrag.setState({ hovered: null });
    canvas.addEventListener('dragover', over); canvas.addEventListener('drop', drop); canvas.addEventListener('dragleave', leave);
    return () => { canvas.removeEventListener('dragover', over); canvas.removeEventListener('drop', drop); canvas.removeEventListener('dragleave', leave); };
  }, [gl, camera, scene]);
  return null;
}
