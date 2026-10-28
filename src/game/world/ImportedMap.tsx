import { memo, useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import map from "../data/imported-map.json";
import { FIELDS, HIVE_PADS, PLACES } from "../data/content";
import { useGame } from "../systems/store";
import { Box, Bear, Label } from "./models";
import LiveHiveBees from "./LiveHiveBees";
import { openFifteenBeeGate } from './gate-opening';

export default memo(function ImportedMap() {
  const { scene } = useGLTF(`${import.meta.env.BASE_URL}map/bss-map.glb`);
  useEffect(() => {
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        const opened=openFifteenBeeGate(object.geometry);
        if(opened!==object.geometry){object.geometry.dispose();object.geometry=opened;}
        object.receiveShadow = true;
        // The imported map is large; dynamic actors provide the moving shadows.
        object.castShadow = false;
      }
    });
  }, [scene]);
  return <primitive object={scene} />;
});

const rebuilt = new Set(["pippin", "tickets", "eggs", "treat-shop", "jelly-shop", "guild", "shop-25", "shop-35", "boost", "treat", "challenge"]);
export function ImportedLandmarks() {
  const game = useGame((s) => s.game);
  useGame((s) => s.revision);
  const stump = map.supplementalStump;
  return <>
    <LiveHiveBees />
    {map.routes.map((r) => {
      const a=new THREE.Vector3(...r.from as [number,number,number]),b=new THREE.Vector3(...r.to as [number,number,number]);
      const direction=b.clone().sub(a), middle=a.clone().add(b).multiplyScalar(0.5);
      const rotation=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,0,1),direction.clone().normalize());
      return <group key={r.name}>
        <mesh position={middle} quaternion={rotation} receiveShadow><boxGeometry args={[r.width,0.25,direction.length()]} /><meshStandardMaterial color="#dfd9bf" /></mesh>
        <Label plain text={`${r.name} · ${r.gate} bees`} position={[r.from[0],r.from[1]+3,r.from[2]]} width={10} size={0.65} />
      </group>;
    })}
    <group position={[stump.x, stump.y - 5, stump.z]}>
      <mesh receiveShadow><cylinderGeometry args={[stump.radius, stump.radius + 1, 10, 32]} /><meshStandardMaterial color="#77502e" /></mesh>
      <mesh position={[0, 5.008, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[stump.radius, 32]} /><meshStandardMaterial color="#b98c55" /></mesh>
    </group>
    <Box position={[162, 22.65, -164]} scale={[22, 0.55, 8]} color="#9b7748" />
    {FIELDS.map((f) => <Label plain key={f.id} text={f.name} position={[f.x, f.y + 3.5, f.z - (f.depth ?? f.width) / 2]} width={Math.min(12, f.width)} size={0.8} />)}
    {PLACES.map((p) => <group key={p.id} position={[p.x, p.y, p.z]}>
      {(p.id === "yellow-cannon" || p.id === "blue-cannon") && <group>
        <Box position={[0, .25, 0]} scale={[3, .5, 3]} color="#555555" />
        <mesh position={[0, 1.5, 0]} rotation={[Math.PI / 4, 0, 0]}>
          <cylinderGeometry args={[.7, .9, 3, 16]} />
          <meshStandardMaterial color={p.accent} />
        </mesh>
        <mesh position={[0, 2.57, -1.07]} rotation={[Math.PI / 4, 0, 0]}>
          <circleGeometry args={[.6, 16]} /><meshStandardMaterial color="#171717" side={THREE.DoubleSide} />
        </mesh>
      </group>}
      {rebuilt.has(p.id) && (p.kind === "npc" ? <Bear color="#997652" /> : <>
        <Box position={[0, 0.45, 0]} scale={[3.2, 0.9, 2.2]} color={p.accent} />
        <Box position={[0, 1.7, 0]} scale={[2.6, 1.6, 1.6]} color="#eee8d5" />
      </>)}
      <Label plain text={p.name} position={[0, 4.5, 0]} width={7} size={0.65} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]}><ringGeometry args={[1.4, 1.65, 24]} /><meshBasicMaterial color={p.accent} side={THREE.DoubleSide} /></mesh>
    </group>)}
    {HIVE_PADS.map((p) => <group key={p.index} position={[p.x, p.y + 0.09, p.z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[2.8, 3.15, 32]} /><meshBasicMaterial color={game.hive === p.index ? "#ffe63b" : "#ffffff"} /></mesh>
    </group>)}
    {map.gates.map((g) => game.bees.length < g.bees && <group key={g.bees} position={[g.x, g.y, g.z]}>
      <mesh><boxGeometry args={[g.width, 10, 0.4]} /><meshStandardMaterial color="#63a5f7" transparent opacity={0.35} /></mesh>
      <Label plain text={`${g.bees} BEES REQUIRED`} position={[0, 1.5, 0.3]} width={Math.min(10, g.width)} size={0.7} />
    </group>)}
  </>;
}
