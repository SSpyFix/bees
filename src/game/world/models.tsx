import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import ToolModel from "../player/ToolModel";
import PackModel from "../player/PackModel";
import { beeFaceSvg } from "../bees/faces";
export const palette = {
  grass: "#65c411",
  cliff: "#737373",
  wood: "#8d653f",
  cream: "#ffffff",
  forest: "#242424",
  yellow: "#ffe200",
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
    x.rect(2, 2, 1020, 124);
    x.fill();
    x.strokeStyle = color + "55";
    x.lineWidth = 3;
    x.stroke();
    x.fillStyle = color;
    x.font = "bold 49px Arial";
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
          <meshStandardMaterial color="#e51717" />
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
            color="#ffffff"
          />
        ))}
      </group>
    );
  if (kind === "sunflower")
    return (
      <group position={position} scale={scale}>
        <Box position={[0, 2, 0]} scale={[0.2, 4, 0.2]} color="#15972c" />
        {Array.from({ length: 10 }, (_, i) => (
          <Ball
            key={i}
            position={[
              Math.cos((i * Math.PI) / 5) * 1.3,
              4 + Math.sin((i * Math.PI) / 5) * 1.3,
              0,
            ]}
            scale={[0.65, 0.5, 0.25]}
            color="#ffdd00"
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
        <meshStandardMaterial color="#7d4b28" />
      </mesh>
      {kind === "pine" ? (
        [2.6, 4.1, 5.5].map((y, i) => (
          <mesh key={y} position={[0, y, 0]} castShadow>
            <coneGeometry args={[2.9 - i * 0.65, 3.6, 7]} />
            <meshStandardMaterial color={i % 2 ? "#095525" : "#126f25"} />
          </mesh>
        ))
      ) : (
        <>
          <Ball position={[0, 5.4, 0]} scale={[3.1, 2.8, 3]} color="#26a642" />
          <Ball
            position={[-1.8, 4.6, 0.6]}
            scale={[2, 1.8, 2]}
            color="#45b749"
          />
          <Ball position={[1.8, 5, 0]} scale={[1.8, 2, 1.9]} color="#179535" />
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
          color="#ffffff"
        />
      ))}
      <Box
        position={[0, 0.55, 0]}
        scale={[length, 0.18, 0.16]}
        color="#ffffff"
      />
      <Box
        position={[0, 1.2, 0]}
        scale={[length, 0.18, 0.16]}
        color="#ffffff"
      />
    </group>
  );
}
export function BeeModel({
  color = "#f6dd78",
  rarity = "Common",
  face = "basic",
  animate = true,
}: {
  color?: string;
  rarity?: string;
  face?: string;
  animate?: boolean;
}) {
  const wings = useRef<THREE.Group>(null);
  const texture = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 128, 128);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.magFilter = THREE.NearestFilter;
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, 128, 128);
      t.needsUpdate = true;
    };
    img.src =
      "data:image/svg+xml;charset=utf-8," +
      encodeURIComponent(beeFaceSvg(face, color));
    return t;
  }, [face, color]);
  useEffect(() => () => texture.dispose(), [texture]);
  useFrame(({ clock }) => {
    if (wings.current && animate)
      wings.current.children.forEach(
        (w, i) =>
          (w.rotation.z =
            Math.sin(clock.elapsedTime * 42 + i * Math.PI) * 0.45),
      );
  });
  return (
    <group scale={0.8}>
      <Box scale={[1.25, 1.25, 1.25]} color={color} />
      <Box position={[0, 0, -0.3]} scale={[1.27, 1.27, 0.2]} color="#252525" />
      <mesh position={[0, 0, 0.632]}>
        <planeGeometry args={[1.25, 1.25]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      <group ref={wings} position={[0, 0.65, -0.12]}>
        {[-1, 1].map((i) => (
          <mesh
            key={i}
            position={[i * 0.7, 0.05, 0]}
            rotation={[0, 0, i * 0.25]}
            scale={[0.65, 0.06, 0.4]}
          >
            <sphereGeometry args={[1, 6, 3]} />
            <meshStandardMaterial color="#f5faff" transparent opacity={0.7} />
          </mesh>
        ))}
      </group>
      {["demon", "vicious"].includes(face) &&
        [-0.4, 0, 0.4].map((x) => (
          <mesh key={x} position={[x, 0.8, 0]}>
            <coneGeometry args={[0.16, 0.5, 4]} />
            <meshStandardMaterial color="#1b2330" />
          </mesh>
        ))}
      {face === "bear" &&
        [-0.52, 0.52].map((x) => (
          <Ball
            key={x}
            position={[x, 0.6, 0]}
            scale={[0.25, 0.25, 0.2]}
            color="#725030"
          />
        ))}
      {face === "buoyant" && (
        <mesh position={[0, 1.5, 0]}>
          <sphereGeometry args={[0.6, 8, 6]} />
          <meshStandardMaterial color="#5379ce" />
        </mesh>
      )}
      {rarity === "Mythic" && (
        <Box
          position={[0, -0.66, 0]}
          scale={[1.28, 0.06, 1.28]}
          color="#d590eb"
        />
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
  hatLevel = 0,
  bootsLevel = 0,
}: {
  moving?: boolean;
  swing?: number;
  converting?: boolean;
  bagLevel?: number;
  toolLevel?: number;
  hatLevel?: number;
  bootsLevel?: number;
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
              color="#2876c1"
            />
            <Box
              position={[0, -0.7, 0.12]}
              scale={[0.48, 0.25, 0.7]}
              color={bootsLevel ? "#e5dca2" : "#353535"}
            />
          </group>
        ))}
      </group>
      <Box position={[0, 1.4, 0]} scale={[1, 0.95, 0.6]} color="#1c70d1" />
      <Box position={[0, 1.12, 0.33]} scale={[1, 0.12, 0.08]} color="#c6a767" />
      <mesh position={[0, 2.15, 0]} castShadow>
        <cylinderGeometry args={[0.43, 0.43, 0.75, 12]} />
        <meshStandardMaterial color="#ffda8e" />
      </mesh>
      {hatLevel === 1 && (
        <>
          <Box
            position={[0, 2.62, 0]}
            scale={[1.15, 0.15, 1]}
            color="#f7d925"
          />
          <Box
            position={[0, 2.8, 0]}
            scale={[0.85, 0.3, 0.8]}
            color="#448bd1"
          />
          <Box
            position={[0, 3.08, 0]}
            scale={[1.25, 0.08, 0.16]}
            color="#ee2929"
          />
        </>
      )}
      {hatLevel === 2 && (
        <>
          <Box position={[0, 2.62, 0]} scale={[1.35, 0.18, 1.2]} color="#eee" />
          <Box position={[0, 2.8, 0]} scale={[0.85, 0.3, 0.8]} color="#ddd" />
          <Box
            position={[0, 2.1, 0.5]}
            scale={[0.96, 0.75, 0.05]}
            color="#8b9da2"
          />
        </>
      )}
      <Box
        position={[0, 2.15, 0.39]}
        scale={[0.73, 0.52, 0.08]}
        color="#ffda8e"
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
        color="#ffda8e"
      />
      <group ref={arm} position={[0.63, 1.65, 0]}>
        <Box
          position={[0, -0.3, 0]}
          scale={[0.32, 0.85, 0.35]}
          color="#ffda8e"
        />
        <group position={[0, -0.65, 1]}>
          <ToolModel level={toolLevel} />
        </group>
      </group>
      <PackModel level={bagLevel} />
    </group>
  );
}
export function Bear({
  color = "#af8a65",
  variant = "",
}: {
  color?: string;
  variant?: string;
}) {
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
      {variant === "rowan" &&
        [-0.34, 0.34].map((x) => (
          <Ball
            key={x}
            position={[x, 3.18, 0.75]}
            scale={[0.3, 0.36, 0.15]}
            color="#111"
          />
        ))}
      {variant === "sage" && (
        <>
          <Box
            position={[0, 1.5, 0.7]}
            scale={[1.55, 1.65, 0.15]}
            color="#fff"
          />
          <Box
            position={[0, 3.2, 0.9]}
            scale={[1.5, 0.45, 0.1]}
            color="#56c6e7"
          />
          <Box position={[0, 3.2, 1]} scale={[0.18, 0.45, 0.05]} color="#333" />
        </>
      )}
      {variant === "orion" &&
        [0, 1, 2, 3, 4].map((i) => (
          <Ball
            key={i}
            position={[
              Math.cos(i * 1.25) * 0.7,
              3.95,
              Math.sin(i * 1.25) * 0.5,
            ]}
            scale={[0.35, 0.25, 0.3]}
            color={i % 2 ? "#ec98d0" : "#fbec7d"}
          />
        ))}
      {variant === "pippin" && (
        <Box
          position={[0.8, 3.7, 0.2]}
          scale={[0.8, 0.35, 0.3]}
          color="#ed94ad"
        />
      )}
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
