import { useMemo } from "react";
import * as THREE from "three";
import { ABILITIES } from "../data/abilities";
import type { AbilityEffect, Token } from "../systems/types";
import { Box, Ball, Label, BeeModel } from "./models";
export function TokenVisual({
  token: t,
  clock,
}: {
  token: Token;
  clock: number;
}) {
  const definition = ABILITIES[t.kind];
  const color =
    definition?.color ??
    (t.kind === "honey"
      ? "#ffdc55"
      : t.kind === "ticket"
        ? "#fff0ba"
        : "#dfb884");
  return (
    <group position={[t.x, t.y + Math.sin(clock * 3 + t.id) * 0.15, t.z]}>
      <mesh rotation={[Math.PI / 2, 0, clock]}>
        <cylinderGeometry args={[0.65, 0.65, 0.16, 12]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.15}
        />
      </mesh>
      <Label
        text={definition?.name ?? t.kind}
        position={[0, 0.75, 0]}
        width={3}
        size={0.32}
        color={color}
        background="#303a30"
      />
    </group>
  );
}
export default function AbilityVisual({
  effect: e,
  clock,
}: {
  effect: AbilityEffect;
  clock: number;
}) {
  const triangles = useMemo(
    () =>
      e.points
        ? new Float32Array(
            e.points.flatMap((p) => [p.x - e.x, 0.05, p.z - e.z]),
          )
        : null,
    [e.points],
  );
  const mark = e.kind.includes("mark"),
    blue = ["bubble", "frog", "balloon"].includes(e.kind);
  const color =
    e.kind === "precise-mark" || e.kind === "target" || e.kind === "flame"
      ? "#ff7054"
      : e.kind === "honey-mark"
        ? "#ffdf4b"
        : e.kind === "goo"
          ? "#c58ce3"
          : blue
            ? "#65cfff"
            : "#fff4ae";
  return (
    <group position={[e.x, e.y + 0.12, e.z]}>
      {(mark ||
        [
          "blast",
          "pulse",
          "goo",
          "haze",
          "glitch",
          "hack",
          "target",
          "scratch",
        ].includes(e.kind)) && (
        <>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry
              args={[Math.max(0.1, e.radius - 0.18), e.radius, 32]}
            />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={Math.min(0.8, e.life)}
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[e.radius, 24]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={e.kind === "goo" ? 0.35 : 0.12}
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>
        </>
      )}
      {e.kind === "balloon" && (
        <group position={[0, 6 + Math.sin(clock) * 0.3, 0]}>
          <Ball
            scale={[1.4, 1.9, 1.4]}
            color={e.gifted ? "#ffdb50" : "#64a5f0"}
          />
          <Box position={[0, -2, 0]} scale={[0.04, 2, 0.04]} color="#faf1bc" />
          <Label
            text={`${e.gifted ? "★ " : ""}${Math.floor(e.stored).toLocaleString()} pollen`}
            position={[0, 2.3, 0]}
            width={5}
            size={0.4}
          />
        </group>
      )}
      {e.kind === "bubble" && (
        <mesh position={[0, 0.8, 0]}>
          <sphereGeometry args={[1.1, 12, 8]} />
          <meshStandardMaterial
            color="#83deff"
            transparent
            opacity={0.45}
            wireframe
          />
        </mesh>
      )}
      {e.kind === "frog" && (
        <group position={[0, 0.6 + Math.abs(Math.sin(clock * 5)) * 0.8, 0]}>
          <Ball
            scale={[0.85, 0.6, 0.85]}
            color={e.gifted ? "#ffdb50" : "#61bd7a"}
          />
          {[-0.45, 0.45].map((x) => (
            <group key={x} position={[x, 0.5, 0.4]}>
              <Ball scale={[0.25, 0.28, 0.25]} color="#fff" />
              <Ball
                position={[0, 0, 0.2]}
                scale={[0.12, 0.15, 0.1]}
                color="#172c28"
              />
            </group>
          ))}
        </group>
      )}
      {e.kind === "flame" && (
        <mesh
          position={[0, 0.8, 0]}
          scale={[1, 1 + Math.sin(clock * 9) * 0.2, 1]}
        >
          <coneGeometry args={[0.7, 2, 6]} />
          <meshBasicMaterial color="#ff7132" transparent opacity={0.8} />
        </mesh>
      )}
      {e.kind === "fire-bee" && (
        <group position={[0, 1.5, 0]} scale={0.7}>
          <BeeModel color="#f23826" face="fire" />
        </group>
      )}
      {e.kind === "cloud" && (
        <group position={[0, 5, 0]}>
          {[-1, 0, 1].map((x) => (
            <Ball
              key={x}
              position={[x * 1.5, 0, 0]}
              scale={[1.7, 0.8, 1.2]}
              color="#eef9ff"
            />
          ))}
          {[-2, 0, 2].map((x) => (
            <Box
              key={x}
              position={[x, -2.2 + Math.sin(clock * 3 + x), 0]}
              scale={[0.06, 0.7, 0.06]}
              color="#8edfff"
            />
          ))}
        </group>
      )}
      {e.kind === "tornado" && (
        <group rotation={[0, clock * 8, 0]}>
          {[0, 1, 2, 3].map((y) => (
            <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.8 + y * 0.5, 0.18, 6, 16]} />
              <meshBasicMaterial color="#e1edf2" />
            </mesh>
          ))}
        </group>
      )}
      {e.kind === "triangle" && triangles && (
        <mesh>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[triangles, 3]}
            />
          </bufferGeometry>
          <meshBasicMaterial
            color="#fff18a"
            transparent
            opacity={0.45}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
      {e.kind === "spike" && (
        <mesh position={[0, 1, 0]}>
          <coneGeometry args={[0.6, 3, 4]} />
          <meshStandardMaterial color="#24435d" />
        </mesh>
      )}
      {e.kind === "beam" && (
        <Box position={[0, 5, 0]} scale={[0.5, 10, 0.5]} color="#fff7a5" />
      )}
      {e.kind === "ball" && (
        <Ball position={[0, 0.5, 0]} scale={[0.7, 0.7, 0.7]} color="#f3c34c" />
      )}
      {e.kind === "target" && (
        <Label
          text="◎"
          position={[0, 0.7, 0]}
          width={2}
          size={1.2}
          color="#ff6b52"
        />
      )}
    </group>
  );
}
