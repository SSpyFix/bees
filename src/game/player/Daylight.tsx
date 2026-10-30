import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGame } from "../systems/store";

/** Keep shadow detail around the beekeeper, including the upper mountain fields. */
export default function Daylight({ shadows }: { shadows: boolean }) {
  const sun = useRef<THREE.DirectionalLight>(null);
  const target = useMemo(() => new THREE.Object3D(), []);
  const origin = useMemo(() => new THREE.Vector3(), []);
  useEffect(() => () => { sun.current?.shadow.dispose(); }, []);
  useFrame(() => {
    if (!sun.current) return;
    const { x, y, z } = useGame.getState().game.player;
    // Quantize in light space so a moving shadow camera doesn't shimmer.
    const texel = 96 / 2048;
    const light = sun.current;
    light.position.set(x - 60, y + 95, z + 45);
    target.position.set(x, y, z);
    target.updateMatrixWorld();
    light.updateMatrixWorld();
    light.shadow.updateMatrices(light);
    const camera = light.shadow.camera;
    origin.set(0, 0, 0).applyMatrix4(camera.matrixWorldInverse);
    camera.left = -48 + (origin.x - Math.round(origin.x / texel) * texel);
    camera.right = camera.left + 96;
    camera.bottom = -48 + (origin.y - Math.round(origin.y / texel) * texel);
    camera.top = camera.bottom + 96;
    camera.updateProjectionMatrix();
  });
  return <>
    <ambientLight intensity={0.22} color="#fff4e4" />
    <hemisphereLight args={["#d9ecff", "#8b9868", 0.85]} />
    <primitive object={target} />
    <directionalLight
      ref={sun} target={target} position={[-60, 95, 45]}
      intensity={2.1} color="#fff0d5" castShadow={shadows}
      shadow-mapSize={[2048, 2048]}
      shadow-camera-left={-48} shadow-camera-right={48}
      shadow-camera-top={48} shadow-camera-bottom={-48}
      shadow-camera-near={1} shadow-camera-far={260}
      shadow-bias={-0.00015} shadow-normalBias={0.06}
    />
    <directionalLight position={[35, 30, -60]} color="#c6dfff" intensity={0.35} />
  </>;
}
