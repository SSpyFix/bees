import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGame } from "../systems/store";
import { useTexture } from "@react-three/drei";
import map from "../data/imported-map.json";
import type { Flower } from "../systems/types";

function FlowerTiles({ texture, entries }: { texture: THREE.Texture; entries: Flower[] }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const timer = useRef(1);
  const update = () => {
    if (!ref.current) return;
    for (let i = 0; i < entries.length; i++) {
      const f = entries[i], remaining = 0.5 + 0.5 * Math.max(0.04, f.pollen / f.max);
      dummy.position.set(f.x, f.y + 0.018, f.z);
      dummy.rotation.set(-Math.PI / 2, 0, 0);
      dummy.scale.setScalar((f.width ?? 1.4) * remaining);
      dummy.updateMatrix(); ref.current.setMatrixAt(i, dummy.matrix);
    }
    ref.current.instanceMatrix.needsUpdate = true;
    ref.current.computeBoundingSphere();
  };
  useEffect(update, [entries, dummy]);
  useFrame((_, dt) => { timer.current += dt; if (timer.current > 0.2) { timer.current = 0; update(); } });
  return <instancedMesh ref={ref} args={[undefined, undefined, entries.length]} receiveShadow>
    <planeGeometry /><meshStandardMaterial map={texture} roughness={1} side={THREE.DoubleSide} polygonOffset polygonOffsetFactor={-1} />
  </instancedMesh>;
}

export default function Flowers() {
  const game = useGame((s) => s.game);
  const textures = useTexture(map.textureIds.map((id) => `${import.meta.env.BASE_URL}map/textures/${id}.png`));
  const groups = useMemo(() => map.textureIds.map((_, index) => game.flowers.filter((f) => f.texture === index)), [game]);
  for (const texture of textures) texture.colorSpace = THREE.SRGBColorSpace;
  return <>{textures.map((texture, i) => <FlowerTiles key={map.textureIds[i]} texture={texture} entries={groups[i]} />)}</>;
}
