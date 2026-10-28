import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Token, WorldEffect } from "../systems/types";
import { abilityInfo } from "../data/abilities";

const textures = new Map<string, THREE.CanvasTexture>();
function tokenTexture(kind: string) {
  const cached = textures.get(kind);
  if (cached) return cached;
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const x = c.getContext("2d")!,
    def = abilityInfo(kind);
  x.fillStyle = def.color;
  x.beginPath();
  x.arc(64, 64, 59, 0, Math.PI * 2);
  x.fill();
  x.strokeStyle = "#fff9dd";
  x.lineWidth = 7;
  x.stroke();
  x.strokeStyle = "#3b352a";
  x.lineWidth = 3;
  x.beginPath();
  x.arc(64, 64, 49, 0, Math.PI * 2);
  x.stroke();
  x.font = `bold ${def.icon.length > 1 ? 50 : 72}px Arial`;
  x.textAlign = "center";
  x.textBaseline = "middle";
  x.fillStyle = "#292929";
  x.fillText(def.icon, 64, 67);
  const texture = new THREE.CanvasTexture(c);
  texture.colorSpace = THREE.SRGBColorSpace;
  textures.set(kind, texture);
  return texture;
}
export default function TokenModel({ token: t }: { token: Token }) {
  const ref = useRef<THREE.Sprite>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.y =
        t.y + 0.45 + Math.sin(clock.elapsedTime * 3 + t.id) * 0.16;
      ref.current.material.opacity =
        t.life < 3
          ? 0.45 + 0.55 * Math.abs(Math.sin(clock.elapsedTime * 9))
          : 1;
    }
  });
  return (
    <group position={[t.x, 0, t.z]}>
      <sprite ref={ref} position={[0, t.y + 0.45, 0]} scale={[1.25, 1.25, 1]}>
        <spriteMaterial
          map={tokenTexture(t.kind)}
          transparent
          depthWrite={false}
        />
      </sprite>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, t.y - 0.65, 0]}>
        <ringGeometry args={[0.35, 0.48, 20]} />
        <meshBasicMaterial
          color={abilityInfo(t.kind).color}
          transparent
          opacity={0.5}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
export function AbilityEffect({ effect: e }: { effect: WorldEffect }) {
  const ref = useRef<THREE.Group>(null),
    material = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(() => {
    if (ref.current) {
      const progress = 1 - e.life / e.duration;
      ref.current.scale.setScalar(e.kind.endsWith("Mark") ? 1 : 0.3 + progress);
      ref.current.rotation.y = progress * Math.PI * 2;
    }
    if (material.current) material.current.opacity = Math.min(0.65, e.life * 2);
  });
  const color = abilityInfo(e.kind).color;
  return (
    <group ref={ref} position={[e.x, e.y + 0.16, e.z]}>
      {e.kind === "beam" ? (
        <mesh position={[0, 5, 0]}>
          <cylinderGeometry args={[0.08, 0.24, 10, 5]} />
          <meshBasicMaterial
            ref={material}
            color={color}
            transparent
            opacity={0.65}
            depthWrite={false}
          />
        </mesh>
      ) : e.kind === "bubble" ? (
        <mesh position={[0, 0.8, 0]}>
          <sphereGeometry args={[e.radius * 0.6, 12, 8]} />
          <meshBasicMaterial
            ref={material}
            color={color}
            transparent
            opacity={0.4}
            wireframe
            depthWrite={false}
          />
        </mesh>
      ) : e.kind === "impale" ? (
        <mesh position={[0, 1, 0]}>
          <coneGeometry args={[1, 4, 4]} />
          <meshBasicMaterial
            ref={material}
            color={color}
            transparent
            opacity={0.6}
          />
        </mesh>
      ) : (
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[e.radius * 0.85, e.radius, 32]} />
          <meshBasicMaterial
            ref={material}
            color={color}
            transparent
            opacity={0.65}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
      {e.kind.endsWith("Mark") && (
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[e.radius * 0.84, 32]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.15}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
}
