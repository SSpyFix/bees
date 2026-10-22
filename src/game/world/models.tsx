import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
export const palette = {
  grass: "#79a45c",
  cliff: "#99aaa0",
  wood: "#916f49",
  cream: "#fff1c7",
  forest: "#264c3f",
  yellow: "#f5c753",
};
export function Box({
  position = [0, 0, 0],
  scale = [1, 1, 1],
  color = "#fff",
  rotation = [0, 0, 0],
  ...props
}: {
  position?: [number, number, number];
  scale?: [number, number, number];
  color?: string;
  rotation?: [number, number, number];
  castShadow?: boolean;
  receiveShadow?: boolean;
}) {
  return (
    <mesh
      position={position}
      scale={scale}
      rotation={rotation}
      castShadow
      receiveShadow
      {...props}
    >
      <boxGeometry />
      <meshStandardMaterial color={color} roughness={0.85} />
    </mesh>
  );
}
export function Ball({
  position = [0, 0, 0],
  scale = [1, 1, 1],
  color = "#fff",
  detail = 1,
}: {
  position?: [number, number, number];
  scale?: [number, number, number];
  color?: string;
  detail?: number;
}) {
  return (
    <mesh position={position} scale={scale} castShadow>
      <icosahedronGeometry args={[1, detail]} />
      <meshStandardMaterial color={color} roughness={0.9} />
    </mesh>
  );
}
export function Label({
  text,
  position,
  width = 9,
  color = "#fff5d5",
  background = "#315742",
  size = 0.85,
}: {
  text: string;
  position: [number, number, number];
  width?: number;
  color?: string;
  background?: string;
  size?: number;
}) {
  const map = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = 128;
    const x = c.getContext("2d")!;
    x.fillStyle = background;
    x.beginPath();
    x.roundRect(2, 2, 1020, 124, 20);
    x.fill();
    x.strokeStyle = color + "55";
    x.lineWidth = 3;
    x.stroke();
    x.fillStyle = color;
    x.font = "600 49px Georgia";
    x.textAlign = "center";
    x.textBaseline = "middle";
    x.fillText(text, 512, 66, 970);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [text, color, background]);
  useEffect(() => () => map.dispose(), [map]);
  return (
    <sprite position={position} scale={[width, size, 1]}>
      <spriteMaterial map={map} transparent depthWrite={false} />
    </sprite>
  );
}
export function Tree({
  position,
  kind = "oak",
  scale = 1,
}: {
  position: [number, number, number];
  kind?: string;
  scale?: number;
}) {
  if (kind === "bamboo")
    return (
      <group position={position} scale={scale}>
        {[0, 1, 2].map((i) => (
          <group key={i} position={[i * 0.7, 0, (i % 2) * 0.6]}>
            <mesh position={[0, 3 + i * 0.5, 0]} castShadow>
              <cylinderGeometry args={[0.18, 0.23, 6 + i, 6]} />
              <meshStandardMaterial color="#7d9e53" />
            </mesh>
            {[1.5, 3, 4.5].map((y) => (
              <group key={y}>
                <Box
                  position={[0.4, y, 0]}
                  scale={[1.2, 0.12, 0.5]}
                  color="#729f59"
                  rotation={[0, 0, 0.4]}
                />
                <Box
                  position={[-0.35, y + 0.3, 0]}
                  scale={[1.1, 0.12, 0.5]}
                  color="#9dbb66"
                  rotation={[0, 0, -0.4]}
                />
              </group>
            ))}
          </group>
        ))}
      </group>
    );
  if (kind === "cactus")
    return (
      <group position={position} scale={scale}>
        <mesh position={[0, 2, 0]} castShadow>
          <capsuleGeometry args={[0.65, 3, 3, 6]} />
          <meshStandardMaterial color="#7c9e70" />
        </mesh>
        <Box position={[-0.9, 2, 0]} scale={[1.4, 0.6, 0.6]} color="#7c9e70" />
        <Box position={[0.9, 2.7, 0]} scale={[1.4, 0.6, 0.6]} color="#7c9e70" />
        <Box
          position={[-1.3, 2.5, 0]}
          scale={[0.55, 1.3, 0.55]}
          color="#7c9e70"
        />
        <Ball position={[0, 4.2, 0]} scale={[0.5, 0.3, 0.5]} color="#e99ca1" />
      </group>
    );
  if (kind === "mushroom")
    return (
      <group position={position} scale={scale}>
        <mesh position={[0, 1.2, 0]} castShadow>
          <cylinderGeometry args={[0.55, 0.7, 2.4, 7]} />
          <meshStandardMaterial color="#f3e7ca" />
        </mesh>
        <mesh position={[0, 2.6, 0]} castShadow>
          <sphereGeometry args={[2.2, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#d47965" />
        </mesh>
        {[0, 1, 2, 3, 4].map((i) => (
          <Ball
            key={i}
            position={[
              Math.cos(i * 1.3) * 1.3,
              3.5 + Math.sin(i) * 0.2,
              Math.sin(i * 1.3) * 1.3,
            ]}
            scale={[0.35, 0.12, 0.35]}
            color="#fff3d8"
          />
        ))}
      </group>
    );
  if (kind === "sunflower")
    return (
      <group position={position} scale={scale}>
        <Box position={[0, 2, 0]} scale={[0.2, 4, 0.2]} color="#6f9350" />
        {Array.from({ length: 10 }, (_, i) => (
          <Ball
            key={i}
            position={[
              Math.cos((i * Math.PI) / 5) * 1.3,
              4 + Math.sin((i * Math.PI) / 5) * 1.3,
              0,
            ]}
            scale={[0.65, 0.5, 0.25]}
            color="#f2c74e"
          />
        ))}
        <Ball
          position={[0, 4, 0.15]}
          scale={[0.9, 0.9, 0.35]}
          color="#7e6344"
        />
        <Ball
          position={[-0.5, 1.5, 0]}
          scale={[0.9, 0.22, 0.4]}
          color="#6d9c53"
        />
      </group>
    );
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 2.3, 0]} castShadow>
        <cylinderGeometry args={[0.45, 0.7, 4.6, 6]} />
        <meshStandardMaterial color="#907050" />
      </mesh>
      {kind === "pine" ? (
        [2.6, 4.1, 5.5].map((y, i) => (
          <mesh key={y} position={[0, y, 0]} castShadow>
            <coneGeometry args={[2.9 - i * 0.65, 3.6, 7]} />
            <meshStandardMaterial color={i % 2 ? "#527f60" : "#638d64"} />
          </mesh>
        ))
      ) : (
        <>
          <Ball position={[0, 5.4, 0]} scale={[3.1, 2.8, 3]} color="#7eaa6a" />
          <Ball
            position={[-1.8, 4.6, 0.6]}
            scale={[2, 1.8, 2]}
            color="#94b774"
          />
          <Ball position={[1.8, 5, 0]} scale={[1.8, 2, 1.9]} color="#719d61" />
        </>
      )}
    </group>
  );
}
export function Fence({
  position,
  length = 20,
  rotation = 0,
}: {
  position: [number, number, number];
  length?: number;
  rotation?: number;
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {Array.from({ length: Math.ceil(length / 3) + 1 }, (_, i) => (
        <Box
          key={i}
          position={[
            -length / 2 + (i * length) / Math.ceil(length / 3),
            0.8,
            0,
          ]}
          scale={[0.3, 1.6, 0.3]}
          color="#f5edce"
        />
      ))}
      <Box
        position={[0, 0.55, 0]}
        scale={[length, 0.18, 0.16]}
        color="#efe7ca"
      />
      <Box
        position={[0, 1.2, 0]}
        scale={[length, 0.18, 0.16]}
        color="#f5edce"
      />
    </group>
  );
}
export function BeeModel({
  color = "#efc34e",
  rarity = "Common",
  animate = true,
}: {
  color?: string;
  rarity?: string;
  animate?: boolean;
}) {
  const wings = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (wings.current && animate)
      wings.current.children.forEach(
        (w, i) =>
          (w.rotation.z =
            Math.sin(clock.elapsedTime * 48 + i * Math.PI) * 0.55),
      );
  });
  return (
    <group scale={0.6}>
      <Box scale={[1.35, 0.9, 1.2]} color={color} />
      <Box position={[0, 0, 0.28]} scale={[1.39, 0.93, 0.28]} color="#544839" />
      <Box
        position={[0, 0, -0.35]}
        scale={[1.39, 0.93, 0.23]}
        color="#544839"
      />
      <Box position={[0, 0, 0.66]} scale={[1.1, 0.78, 0.12]} color={color} />
      {[-0.32, 0.32].map((x) => (
        <group key={x}>
          <Box
            position={[x, 0.13, 0.75]}
            scale={[0.14, 0.19, 0.1]}
            color="#343c33"
          />
          <Box
            position={[x, 0.57, 0.4]}
            scale={[0.07, 0.4, 0.07]}
            color="#504536"
          />
          <Ball
            position={[x, 0.8, 0.4]}
            scale={[0.12, 0.12, 0.12]}
            color={color}
          />
        </group>
      ))}
      <group ref={wings} position={[0, 0.42, 0]}>
        {[-1, 1].map((i) => (
          <mesh
            key={i}
            position={[i * 0.76, 0.12, -0.12]}
            rotation={[0.15, 0, i * 0.35]}
            scale={[0.8, 0.09, 0.48]}
          >
            <sphereGeometry args={[1, 8, 4]} />
            <meshStandardMaterial
              color="#eef6e7"
              transparent
              opacity={0.82}
              roughness={0.3}
            />
          </mesh>
        ))}
      </group>
      {rarity !== "Common" && (
        <mesh position={[0, 0.52, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.25, 0.08, 4, 8]} />
          <meshStandardMaterial
            color={rarity === "Mythic" ? "#eab1d4" : "#fff0b3"}
          />
        </mesh>
      )}
    </group>
  );
}
export function KeeperModel({
  moving = false,
  swing = 0,
  converting = false,
  bagLevel = 0,
  toolLevel = 0,
}: {
  moving?: boolean;
  swing?: number;
  converting?: boolean;
  bagLevel?: number;
  toolLevel?: number;
}) {
  const legs = useRef<THREE.Group>(null),
    arm = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (legs.current)
      legs.current.children.forEach(
        (l, i) =>
          (l.rotation.x = moving
            ? Math.sin(clock.elapsedTime * 10 + i * Math.PI) * 0.65
            : 0),
      );
    if (arm.current)
      arm.current.rotation.x =
        swing > 0
          ? -1.1 - Math.sin(swing * 18) * 0.6
          : converting
            ? Math.sin(clock.elapsedTime * 8) * 0.35
            : -0.15;
  });
  return (
    <group>
      <group ref={legs}>
        {[-0.3, 0.3].map((x) => (
          <group key={x} position={[x, 0.85, 0]}>
            <Box
              position={[0, -0.3, 0]}
              scale={[0.4, 0.85, 0.45]}
              color="#4b716c"
            />
            <Box
              position={[0, -0.7, 0.12]}
              scale={[0.48, 0.25, 0.7]}
              color="#495b4c"
            />
          </group>
        ))}
      </group>
      <Box position={[0, 1.4, 0]} scale={[1, 0.95, 0.6]} color="#f3e4ba" />
      <Box position={[0, 1.12, 0.33]} scale={[1, 0.12, 0.08]} color="#c6a767" />
      <Box position={[0, 2.15, 0]} scale={[0.8, 0.75, 0.7]} color="#e6bf95" />
      <Box position={[0, 2.62, 0]} scale={[1.35, 0.18, 1.2]} color="#e6c36d" />
      <Box position={[0, 2.8, 0]} scale={[0.85, 0.3, 0.8]} color="#eed38e" />
      <Box
        position={[0, 2.15, 0.39]}
        scale={[0.73, 0.52, 0.08]}
        color="#748d7b"
      />
      <Box
        position={[-0.18, 2.2, 0.45]}
        scale={[0.09, 0.1, 0.02]}
        color="#2f493b"
      />
      <Box
        position={[0.18, 2.2, 0.45]}
        scale={[0.09, 0.1, 0.02]}
        color="#2f493b"
      />
      <Box
        position={[-0.66, 1.4, 0]}
        scale={[0.32, 0.9, 0.35]}
        color="#e9c092"
      />
      <group ref={arm} position={[0.63, 1.65, 0]}>
        <Box
          position={[0, -0.3, 0]}
          scale={[0.32, 0.85, 0.35]}
          color="#e9c092"
        />
        <mesh
          position={[0, -0.65, 0.7]}
          rotation={[Math.PI / 2, 0, 0]}
          castShadow
        >
          <cylinderGeometry args={[0.07, 0.07, 1.6, 6]} />
          <meshStandardMaterial color="#957245" />
        </mesh>
        <mesh
          position={[0, -0.65, 1.55]}
          rotation={[-Math.PI / 2, 0, 0]}
          castShadow
        >
          <cylinderGeometry
            args={[0.55 + toolLevel * 0.04, 0.4, 0.2, toolLevel % 2 ? 6 : 10]}
          />
          <meshStandardMaterial
            color={toolLevel > 2 ? "#b4d2d2" : "#d5b878"}
            metalness={0.3}
            roughness={0.6}
          />
        </mesh>
      </group>
      <Box
        position={[0, 1.5, -0.63]}
        scale={[0.92 + bagLevel * 0.06, 1 + bagLevel * 0.05, 0.55]}
        color={bagLevel > 1 ? "#b9cfd0" : "#a4b99a"}
      />
      <Box
        position={[0, 1.5, -0.93]}
        scale={[0.58, 0.52, 0.08]}
        color="#f2d891"
      />
      <Box
        position={[0, 1.7, -0.99]}
        scale={[0.36, 0.12, 0.04]}
        color="#6d8261"
      />
    </group>
  );
}
export function Bear({ color = "#af8a65" }: { color?: string }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current)
      ref.current.rotation.y = Math.sin(clock.elapsedTime * 0.8) * 0.09;
  });
  return (
    <group ref={ref}>
      <Ball position={[0, 1.35, 0]} scale={[1.1, 1.4, 0.85]} color={color} />
      <Ball position={[0, 3, 0]} scale={[1, 1, 0.85]} color={color} />
      {[-0.7, 0.7].map((x) => (
        <group key={x}>
          <Ball
            position={[x, 3.8, 0]}
            scale={[0.43, 0.45, 0.3]}
            color={color}
          />
          <Ball
            position={[x, 3.8, 0.23]}
            scale={[0.25, 0.25, 0.1]}
            color="#d7b797"
          />
          <Ball
            position={[x * 1.6, 1.65, 0.1]}
            scale={[0.4, 0.9, 0.4]}
            color={color}
          />
          <Ball
            position={[x * 0.7, 0.35, 0.1]}
            scale={[0.5, 0.5, 0.65]}
            color={color}
          />
          <Ball
            position={[x * 0.48, 3.2, 0.77]}
            scale={[0.09, 0.1, 0.06]}
            color="#3e4437"
          />
        </group>
      ))}
      <Ball
        position={[0, 2.8, 0.74]}
        scale={[0.6, 0.4, 0.28]}
        color="#e5cba0"
      />
      <Ball position={[0, 2.95, 1]} scale={[0.17, 0.13, 0.1]} color="#494739" />
      <Box position={[0, 2, 0.77]} scale={[1.5, 0.25, 0.1]} color="#6a8b6c" />
    </group>
  );
}
export function flowerGeometry() {
  const shape = new THREE.Shape();
  for (let i = 0; i < 20; i++) {
    const angle = (i * Math.PI) / 10,
      r = i % 4 === 0 ? 0.23 : i % 2 === 0 ? 0.53 : 0.44;
    const x = Math.cos(angle) * r,
      y = Math.sin(angle) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  const g = new THREE.ShapeGeometry(shape);
  g.rotateX(-Math.PI / 2);
  return g;
}
