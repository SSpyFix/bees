import { memo, useEffect, useMemo } from "react";
import * as THREE from "three";
import map from "../data/imported-map.json";
import { BEES } from "../data/content";
import { beeFaceSvg } from "../bees/faces";
import { useGame } from "../systems/store";
import { hiveCellsForSwarm, type HiveCell } from "./hive-layout";
import { useItemDrag } from '../systems/item-drag';

const HivePortrait = memo(function HivePortrait({ cell, kind, id, gifted }: { cell: HiveCell; kind: string; id: string; gifted: boolean }) {
  const bee = BEES.find((b) => b.id === kind) ?? BEES[0];
  const hovered = useItemDrag(state => state.hovered === id);
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 128;
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  useEffect(() => {
    let cancelled = false;
    const image = new Image();
    image.onload = () => {
      if (cancelled) return;
      const context = (texture.image as HTMLCanvasElement).getContext("2d")!;
      context.clearRect(0, 0, 128, 128);
      context.drawImage(image, 0, 0, 128, 128);
      if (gifted) { context.fillStyle = "#ffe23b"; context.font = "bold 29px Arial"; context.fillText("★", 3, 29); }
      texture.needsUpdate = true;
    };
    image.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(beeFaceSvg(bee.face, bee.body));
    return () => { cancelled = true; image.onload = null; };
  }, [texture, bee.face, bee.body, gifted]);
  useEffect(() => () => texture.dispose(), [texture]);
  const matrix = useMemo(() => {
    const r = cell.rotation, p = cell.position, offset = cell.size[2] / 2 + 0.014;
    return new THREE.Matrix4().set(r[0],r[1],r[2],p[0]+r[2]*offset,r[3],r[4],r[5],p[1]+r[5]*offset,r[6],r[7],r[8],p[2]+r[8]*offset,0,0,0,1);
  }, [cell]);
  const size = Math.min(cell.size[0], cell.size[1]) * 0.76;
  return <mesh name={`live-hive-bee-${id}`} matrix={matrix} matrixAutoUpdate={false}>
    <planeGeometry args={[size, size]} />
    <meshBasicMaterial map={texture} transparent toneMapped={false} />
    {hovered && <mesh position={[0, 0, -0.01]}><ringGeometry args={[size * 0.5, size * 0.66, 6]} /><meshBasicMaterial color="#fff57a" side={THREE.DoubleSide} depthTest={false} /></mesh>}
    {cell.extra && <mesh name="extended-hive-cell" position={[0, 0, -0.035]} scale={[1, 0.92, 1]}>
      <circleGeometry args={[size * 0.85, 6]} /><meshBasicMaterial color="#d4a041" side={THREE.DoubleSide} />
    </mesh>}
  </mesh>;
});

/** Empty source boards are populated only from the player's actual saved hive. */
export default function LiveHiveBees() {
  const game = useGame((state) => state.game);
  useGame((state) => state.revision);
  const cells = useMemo(() => hiveCellsForSwarm(map.hiveCells[game.hive] ?? [], game.bees.length), [game.hive, game.bees.length]);
  return <group name="live-hive-bees">{game.bees.slice(0, 50).map((bee, index) => cells[index] &&
    <HivePortrait key={`${game.hive}-${bee.id}`} cell={cells[index]} kind={bee.kind} id={bee.id} gifted={bee.gifted} />
  )}</group>;
}
