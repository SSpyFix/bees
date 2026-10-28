import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGame } from "../systems/store";
import { SPRINKLERS } from "../data/support";
import { Box } from "./models";
export default function SprinklerModel({ id }: { id: number }) {
  const game = useGame((s) => s.game),
    group = useRef<THREE.Group>(null),
    head = useRef<THREE.Group>(null),
    water = useRef<THREE.Group>(null);
  const p = game.sprinklers.find((p) => p.id === id),
    def = SPRINKLERS[game.sprinkler];
  useFrame(({ clock }) => {
    if (!p || !def) return;
    if (group.current)
      group.current.scale.y = Math.max(0.08, 1 - p.setup / def.setup);
    if (head.current) head.current.rotation.y = clock.elapsedTime * 3;
    if (water.current) {
      water.current.visible = p.setup <= 0;
      water.current.rotation.y = clock.elapsedTime;
    }
  });
  if (!p || !def) return null;
  return (
    <group position={[p.x, p.y, p.z]} ref={group}>
      <Box position={[0, 0.12, 0]} scale={[1, 0.24, 1]} color={def.color} />
      <mesh position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.13, 0.18, 1.2, 8]} />
        <meshStandardMaterial color="#8b979f" metalness={0.5} roughness={0.4} />
      </mesh>
      <group ref={head} position={[0, 1.25, 0]}>
        <Box scale={[1.4, 0.23, 0.3]} color={def.color} />
        <Box scale={[0.3, 0.23, 1.4]} color={def.color} />
      </group>
      <group ref={water}>
        {Array.from({ length: 16 }, (_, i) => {
          const a = (i * Math.PI) / 4,
            r = 0.7 + (i % 4) * 0.7;
          return (
            <mesh
              key={i}
              position={[
                Math.cos(a) * r,
                1.3 + Math.sin(r) * 0.7,
                Math.sin(a) * r,
              ]}
            >
              <sphereGeometry args={[0.08, 4, 3]} />
              <meshBasicMaterial color="#a4e7ff" transparent opacity={0.65} />
            </mesh>
          );
        })}
      </group>
      {p.pulse > 0 && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.13, 0]}>
          <ringGeometry
            args={[
              def.radius * 1.35 * (1 - p.pulse),
              def.radius * 1.35 * (1 - p.pulse) + 0.15,
              48,
            ]}
          />
          <meshBasicMaterial
            color="#9ce7ff"
            transparent
            opacity={p.pulse * 0.5}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
}
