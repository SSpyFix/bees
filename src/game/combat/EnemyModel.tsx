import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { Box, Ball } from "../world/models";

/** Anatomy and movement differ by species; simulation owns all combat state. */
export default function EnemyModel({ type }: { type: number }) {
  const legs = useRef<Group>(null),
    body = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (legs.current)
      legs.current.children.forEach((leg, i) => {
        leg.rotation.y = Math.sin(clock.elapsedTime * 8 + i * Math.PI) * 0.13;
      });
    if (body.current)
      body.current.position.y = Math.sin(clock.elapsedTime * 5) * 0.06;
  });
  const color = [
    "#e72324",
    "#2364d0",
    "#222028",
    "#4ba32a",
    "#c79041",
    "#70757a",
    "#936431",
    "#f8dc38",
  ][type];
  if (type === 5)
    return (
      <group ref={body}>
        <Box position={[0, 1, 0]} scale={[1.3, 1.1, 2]} color={color} />
        <Box position={[0, 1.8, 0.9]} scale={[1.3, 1.3, 1.1]} color={color} />
        <Box
          position={[0, 1.4, 1.7]}
          scale={[0.85, 0.5, 0.8]}
          color="#b7b7b7"
        />
        <Box position={[0, 1.5, 2.1]} scale={[0.5, 0.25, 0.1]} color="#222" />
        {[-0.4, 0.4].map((x) => (
          <group key={x}>
            <mesh position={[x, 2.7, 0.8]}>
              <coneGeometry args={[0.3, 0.8, 4]} />
              <meshStandardMaterial color={color} />
            </mesh>
            <Box
              position={[x, 1.95, 1.48]}
              scale={[0.19, 0.16, 0.06]}
              color="#f4dd20"
            />
            <Box
              position={[x, 1.2, 1.91]}
              scale={[0.12, 0.35, 0.1]}
              color="#fff"
            />
            {[-0.7, 0.7].map((z) => (
              <Box
                key={z}
                position={[x, 0.4, z]}
                scale={[0.45, 0.8, 0.5]}
                color={color}
              />
            ))}
          </group>
        ))}
        <Box
          position={[0, 1.3, -1.4]}
          scale={[0.4, 0.4, 1.3]}
          rotation={[0.5, 0, 0]}
          color={color}
        />
      </group>
    );
  if (type === 7)
    return (
      <group ref={body}>
        <Ball position={[0, 1.7, 0]} scale={[1.6, 1.7, 1.4]} color={color} />
        <Ball position={[0, 3, 0.4]} scale={[1.2, 1.2, 1.1]} color={color} />
        {[-0.55, 0.55].map((x) => (
          <group key={x}>
            <Ball
              position={[x, 3.25, 1.3]}
              scale={[0.16, 0.2, 0.1]}
              color="#121212"
            />
            <Box
              position={[x, 0.2, 0.6]}
              scale={[0.65, 0.3, 1.3]}
              color="#ed8f23"
            />
            <Ball
              position={[x * 3, 1.7, 0]}
              scale={[0.6, 0.9, 0.4]}
              color="#e6ba27"
            />
          </group>
        ))}
        <mesh position={[0, 2.8, 1.5]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.65, 1.3, 4]} />
          <meshStandardMaterial color="#ee8e1a" />
        </mesh>
        {[-0.5, 0, 0.5].map((z) => (
          <Ball
            key={z}
            position={[0, 4, z]}
            scale={[0.28, 0.5, 0.4]}
            color="#e52522"
          />
        ))}
      </group>
    );
  return (
    <group>
      <group ref={body}>
        <Ball
          position={[0, type === 6 ? 1.6 : 0.95, 0]}
          scale={
            type === 4
              ? [0.85, 0.65, 1.6]
              : type === 6
                ? [1.9, 1.6, 1.6]
                : type === 3
                  ? [0.65, 0.8, 1.5]
                  : [1.15, 0.75, 1.4]
          }
          color={color}
        />
        <Ball
          position={[0, 1, 1.15]}
          scale={[0.65, 0.55, 0.65]}
          color={type < 2 ? "#222222" : color}
        />
        {[-0.28, 0.28].map((x) => (
          <group key={x}>
            <Ball
              position={[x, type === 6 ? 2.5 : 1.25, 1.65]}
              scale={[0.14, 0.17, 0.1]}
              color="#fff"
            />
            <Ball
              position={[x, type === 6 ? 2.5 : 1.25, 1.73]}
              scale={[0.07, 0.1, 0.04]}
              color="#111"
            />
          </group>
        ))}
        {type === 0 && (
          <>
            {[-0.65, 0.65].flatMap((x) =>
              [-0.65, 0.2].map((z) => (
                <Ball
                  key={`${x}:${z}`}
                  position={[x, 1.53, z]}
                  scale={[0.24, 0.12, 0.24]}
                  color="#171717"
                />
              )),
            )}
            <Box
              position={[0, 1.7, -0.15]}
              scale={[0.06, 0.09, 1.75]}
              color="#171717"
            />
          </>
        )}
        {type === 1 && (
          <mesh position={[0, 1.6, 1.5]} rotation={[-0.5, 0, 0]}>
            <coneGeometry args={[0.22, 1.1, 5]} />
            <meshStandardMaterial color="#d7e3f7" />
          </mesh>
        )}
        {type === 3 &&
          [-1, 1].map((side) => (
            <group
              key={side}
              position={[side * 0.6, 1.6, 0.9]}
              rotation={[0.2, 0, side * -0.5]}
            >
              <Box
                position={[side * 0.5, 0, 0.5]}
                scale={[1.1, 0.22, 0.25]}
                color={color}
              />
              <Box
                position={[side * 0.9, 0.5, 0.9]}
                scale={[0.18, 1.1, 0.2]}
                rotation={[0.4, 0, side * 0.3]}
                color="#75c746"
              />
            </group>
          ))}
        {type === 4 && (
          <>
            {[0, 1, 2, 3, 4].map((i) => (
              <Ball
                key={i}
                position={[0, 1 + i * 0.46, -1.3 - Math.sin(i * 0.6) * 0.7]}
                scale={[0.32 - i * 0.025, 0.35, 0.36]}
                color={color}
              />
            ))}
            <mesh position={[0, 3.1, -1.5]} rotation={[Math.PI / 2, 0, 0]}>
              <coneGeometry args={[0.2, 0.8, 5]} />
              <meshStandardMaterial color="#442f21" />
            </mesh>
          </>
        )}
        {(type === 4 || type === 6) &&
          [-1, 1].map((side) => (
            <group
              key={side}
              position={[side * (type === 6 ? 1.8 : 1), 1, 1.25]}
            >
              <Box
                position={[side * 0.6, 0, 0.4]}
                scale={[1.3, 0.35, 0.4]}
                rotation={[0, side * -0.5, 0]}
                color={color}
              />
              <Ball
                position={[side * 1.2, 0.1, 0.8]}
                scale={[0.7, 0.5, 0.9]}
                color={type === 6 ? "#b88a52" : color}
              />
              <Box
                position={[side * 1.2, 0.15, 1.5]}
                scale={[0.12, 0.6, 0.5]}
                color="#392618"
              />
            </group>
          ))}
        {type === 6 &&
          [0, 1, 2, 3, 4].map((i) => (
            <Box
              key={i}
              position={[Math.sin(i * 1.25) * 1.25, 2.65, Math.cos(i * 1.25)]}
              scale={[0.08, 0.1, 1]}
              rotation={[0, i * 1.25, 0]}
              color="#c49962"
            />
          ))}
      </group>
      <group ref={legs}>
        {Array.from({ length: type === 2 ? 8 : 6 }, (_, i) => {
          const side = i % 2 ? 1 : -1,
            z = (Math.floor(i / 2) - (type === 2 ? 1.5 : 1)) * 0.65;
          return (
            <group key={i} position={[side * 0.65, 0.7, z]}>
              <Box
                position={[side * 0.65, 0, 0]}
                scale={[1.4, 0.16, 0.19]}
                rotation={[0, side * 0.3, side * -0.3]}
                color={color}
              />
              <Box
                position={[side * 1.3, -0.3, side * 0.2]}
                scale={[0.15, 0.8, 0.15]}
                rotation={[0, 0, side * 0.4]}
                color={color}
              />
            </group>
          );
        })}
      </group>
    </group>
  );
}
