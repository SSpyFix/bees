import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { FIELDS, RAMPS, PLACES, HIVE_PADS } from "../data/content";
import { useGame } from "../systems/store";
import { beeDefinition } from "../systems/simulation";
import { Box, Ball, Tree, Fence, Label, BeeModel, Bear } from "./models";

function StuddedWall({
  position,
  size,
  color = "#1684a7",
}: {
  position: [number, number, number];
  size: [number, number, number];
  color?: string;
}) {
  const map = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const x = c.getContext("2d")!;
    x.fillStyle = color;
    x.fillRect(0, 0, 64, 64);
    x.fillStyle = "#ffffff1c";
    x.fillRect(17, 12, 30, 27);
    x.fillStyle = "#0000001a";
    x.fillRect(17, 36, 30, 9);
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(size[0] / 3, size[1] / 3);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [color, size[0], size[1]]);
  useEffect(() => () => map.dispose(), [map]);
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial map={map} roughness={1} />
    </mesh>
  );
}
function Cannon({
  position,
  color,
  rotation = 0,
}: {
  position: [number, number, number];
  color: string;
  rotation?: number;
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <Box position={[0, 0.5, 0]} scale={[5, 1, 5]} color="#bbbbbb" />
      <group position={[0, 2.4, 0]} rotation={[0.65, 0, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1.3, 1.1, 6, 10]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <mesh position={[0, 0, 3.05]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1.02, 10]} />
          <meshBasicMaterial color="#111" />
        </mesh>
      </group>
      {[-2, 2].map((x) => (
        <mesh key={x} position={[x, 1.1, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[1.2, 1.2, 0.6, 10]} />
          <meshStandardMaterial color="#292929" />
        </mesh>
      ))}
    </group>
  );
}
function Headquarters({
  position,
  color,
  label,
}: {
  position: [number, number, number];
  color: string;
  label: string;
}) {
  return (
    <group position={position}>
      <Box position={[0, 3.5, 0]} scale={[10, 7, 10]} color={color} />
      <Box position={[0, 7.4, 0]} scale={[12, 1, 12]} color="#efefef" />
      <Box position={[0, 9.5, 0]} scale={[9, 3.5, 9]} color={color} />
      <Box position={[0, 3, 5.05]} scale={[4.2, 5, 0.1]} color="#242424" />
      {[-3.5, 3.5].map((x) => (
        <Box
          key={x}
          position={[x, 5, 5.1]}
          scale={[1.4, 1.4, 0.1]}
          color="#b2ebff"
        />
      ))}
      <Label
        text={label}
        position={[0, 9, 5.2]}
        width={12}
        size={1.25}
        background={color}
      />
    </group>
  );
}
function Shop({ p }: { p: (typeof PLACES)[number] }) {
  if (p.kind === "eggs")
    return (
      <group position={[p.x, p.y, p.z + 1.8]}>
        <Box position={[0, 1.3, 0]} scale={[5, 2.6, 4]} color="#d7d7d7" />
        <Box position={[0, 2.7, 0]} scale={[5.5, 0.3, 4.5]} color="#eeeeee" />
        <mesh position={[0, 4.1, 0]} scale={[1, 1.3, 1]}>
          <sphereGeometry args={[1.45, 12, 10]} />
          <meshStandardMaterial color="#e4b582" />
        </mesh>
        <mesh position={[0, 1.2, -2.1]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.6, 0.6, 0.15, 12]} />
          <meshStandardMaterial color="#ff2020" />
        </mesh>
        <Label
          text="BASIC EGG"
          position={[0, 6.6, 0]}
          width={7}
          size={1}
          background="#202020"
        />
      </group>
    );
  const color =
    p.gate === 0
      ? "#0b81d8"
      : p.gate === 10
        ? "#ff9d13"
        : p.gate === 25
          ? "#ededed"
          : "#68bbdc";
  return (
    <group position={[p.x, p.y, p.z + 2.8]}>
      <Box position={[0, 2.2, 0]} scale={[7, 4.4, 5]} color="#ececec" />
      <Box position={[0, 4.6, 0]} scale={[8.5, 0.6, 6.5]} color={color} />
      <Box position={[0, 5.2, 0]} scale={[6.5, 0.6, 6]} color={color} />
      <Box position={[0, 1.8, -2.6]} scale={[5.7, 2.7, 0.15]} color="#282828" />
      <Box position={[0, 1.5, -3]} scale={[6.5, 0.35, 1.2]} color="#aaaaaa" />
      {[-1.8, 0, 1.8].map((x, i) => (
        <group key={i} position={[x, 2, -2.8]}>
          <Box
            scale={[0.7, 0.85, 0.6]}
            color={["#d1b172", "#7f9ba9", "#ffca22"][i]}
          />
          <Box
            position={[0, 0.6, 0]}
            scale={[0.12, 0.8, 0.12]}
            color="#784e26"
          />
        </group>
      ))}
      <Label
        text={p.name.toUpperCase()}
        position={[0, 6.3, 0]}
        width={10}
        size={1.1}
        background="#2b2b2b"
      />
    </group>
  );
}
export function ReferenceScenery() {
  return (
    <>
      <StuddedWall position={[0, 2, 79]} size={[148, 6, 4]} />
      <StuddedWall position={[-73, 10, -33]} size={[5, 22, 225]} />
      <StuddedWall position={[75, 7, -27]} size={[5, 16, 210]} />
      <Headquarters position={[-63, 0, -8]} color="#153dc7" label="BLUE HQ" />
      <Headquarters position={[63, 0, -8]} color="#e62424" label="RED HQ" />
      <Cannon position={[-60, 8, -28]} color="#e91f24" rotation={-0.6} />
      <Cannon position={[8, 32, -139]} color="#222222" rotation={0.6} />
      <Tree position={[-47, 0, 40]} kind="sunflower" scale={1.8} />
      <Tree position={[47, 0, 39]} kind="mushroom" scale={2.1} />
      <Tree position={[18, 0, 25]} kind="mushroom" scale={1.1} />
      <Tree position={[66, 0, 31]} kind="mushroom" scale={1.5} />
      <Tree position={[-60, 8, -70]} kind="bamboo" scale={1.5} />
      <Box position={[0, 0.02, 55]} scale={[133, 0.05, 3]} color="#dddddd" />
      {FIELDS.map((f, i) => (
        <group key={f.id} position={[f.x, f.y, f.z]}>
          <Box
            position={[0, 0.015, 0]}
            scale={[22, 0.06, 22]}
            color={i % 2 ? "#3a930b" : "#40950a"}
          />
          <Fence position={[-11.2, 0, 0]} length={22} rotation={Math.PI / 2} />
          <Fence position={[11.2, 0, 0]} length={22} rotation={Math.PI / 2} />
          <Box
            position={[0, 1.1, 12.4]}
            scale={[0.18, 2.2, 0.18]}
            color="#80522b"
          />
          <Label
            text={f.name}
            position={[0, 2.4, 12.4]}
            width={10}
            size={0.9}
            color="#fff"
            background="#333333"
          />
          {["pine", "mountain"].includes(f.biome) ? (
            <>
              <Tree position={[-13, 0, -7]} kind="pine" scale={1.2} />
              <Tree position={[13, 0, -7]} kind="pine" scale={1.5} />
            </>
          ) : null}
          {f.biome === "cactus" &&
            [-13, 13].map((x) => (
              <Tree key={x} position={[x, 0, -8]} kind="cactus" scale={1.3} />
            ))}
          {f.biome === "pumpkin" &&
            [-13, 13].map((x) => (
              <group key={x} position={[x, 0, -8]}>
                <Ball
                  position={[0, 1.6, 0]}
                  scale={[2.1, 1.8, 2.1]}
                  color="#ff8814"
                />
                <Box
                  position={[0, 3.4, 0]}
                  scale={[0.3, 1, 0.3]}
                  color="#446d16"
                />
              </group>
            ))}
          {f.biome === "strawberry" && (
            <group position={[13, 0, -9]}>
              <Ball position={[0, 2, 0]} scale={[2, 2.4, 2]} color="#ff202b" />
              <Box position={[0, 4.5, 0]} scale={[3, 0.3, 1]} color="#00a62b" />
            </group>
          )}
          {f.biome === "stump" && (
            <mesh position={[13, 2.8, -7]}>
              <cylinderGeometry args={[3.8, 4.2, 5.6, 12]} />
              <meshStandardMaterial color="#79522f" />
            </mesh>
          )}
          {f.biome === "coconut" &&
            [-13, 13].map((x) => (
              <group key={x} position={[x, 0, -7]}>
                <Box
                  position={[0, 5, 0]}
                  scale={[0.9, 10, 0.9]}
                  color="#946334"
                />
                {[0, 1, 2, 3, 4].map((k) => (
                  <Box
                    key={k}
                    position={[
                      Math.cos(k * 1.26) * 2,
                      10,
                      Math.sin(k * 1.26) * 2,
                    ]}
                    scale={[6, 0.25, 1.3]}
                    rotation={[0.15, k * 1.26, 0.15]}
                    color="#19a438"
                  />
                ))}
                <Ball
                  position={[0.8, 8.5, 0.2]}
                  scale={[0.9, 0.9, 0.9]}
                  color="#714920"
                />
              </group>
            ))}
          {f.biome === "pepper" && (
            <Ball
              position={[13, 2, -8]}
              scale={[1.3, 3, 1.3]}
              color="#ee2015"
            />
          )}
        </group>
      ))}
      {PLACES.filter(
        (p) => p.kind !== "npc" && p.kind !== "cannon" && !p.id.endsWith("-hq"),
      ).map((p) =>
        p.kind === "guild" ? (
          <group key={p.id} position={[p.x, p.y, p.z]}>
            <Box position={[0, 1.5, 4]} scale={[10, 3, 4]} color="#f5d64c" />
            <Box
              position={[0, 3.1, 4]}
              scale={[10.5, 0.25, 4.5]}
              color="#eee8d8"
            />
            <Box position={[-4, 4, 4]} scale={[0.5, 8, 0.5]} color="#ffcf38" />
            <Box position={[4, 4, 4]} scale={[0.5, 8, 0.5]} color="#ffcf38" />
            <Box position={[0, 8, 4]} scale={[9, 0.7, 1]} color="#ffcf38" />
            <mesh position={[0, 4.5, 4]}>
              <cylinderGeometry args={[1.2, 0.8, 2.6, 8]} />
              <meshStandardMaterial color="#b5e4ed" transparent opacity={0.6} />
            </mesh>
            <Box
              position={[0, 3.35, 4]}
              scale={[2.4, 0.4, 2.4]}
              color="#dedede"
            />
            <Box position={[0, 5.9, 4]} scale={[2.6, 0.25, 2.6]} color="#fff" />
            <Label
              text="BADGE BEARER’S GUILD"
              position={[0, 9.3, 4]}
              width={11}
              size={1}
              background="#333"
            />
          </group>
        ) : p.kind === "tickets" ? (
          <group key={p.id} position={[p.x, p.y, p.z]}>
            <Box position={[0, 1.5, 2]} scale={[6, 3, 4]} color="#f4d125" />
            <mesh position={[0, 4, 2]} rotation={[0, Math.PI / 4, 0]}>
              <coneGeometry args={[5, 3, 4]} />
              <meshStandardMaterial color="#f8e247" />
            </mesh>
            <Box
              position={[0, 1.7, -0.15]}
              scale={[3.8, 2.5, 0.12]}
              color="#333"
            />
            <Label
              text="TICKET TENT"
              position={[0, 6, 2]}
              width={9}
              size={1.2}
              background="#383838"
            />
          </group>
        ) : p.kind === "shop" || p.kind === "eggs" ? (
          <Shop key={p.id} p={p} />
        ) : (
          <group key={p.id} position={[p.x, p.y, p.z]}>
            <Box
              position={[0, 1.2, 0]}
              scale={[2.3, 2.4, 2]}
              color={
                p.kind === "boost"
                  ? "#33aaff"
                  : p.kind === "daily"
                    ? "#ffcf14"
                    : "#a87443"
              }
            />
            <Box
              position={[0, 2.5, 0]}
              scale={[2.7, 0.35, 2.5]}
              color="#dedede"
            />
            <Box
              position={[0, 1.1, 1.1]}
              scale={[0.8, 0.5, 0.18]}
              color="#ff1919"
            />
            <Label
              text={p.name}
              position={[0, 3.8, 0]}
              width={7}
              size={0.8}
              background="#333333"
            />
          </group>
        ),
      )}
    </>
  );
}
export function ReferenceHives() {
  const s = useGame((g) => g.game);
  useGame((g) => g.revision);
  return (
    <>
      {HIVE_PADS.map((pad, hi) => (
        <group key={hi} position={[pad.x, 0, 69]}>
          <Box
            position={[0, 5.6, 0.5]}
            scale={[12, 11.2, 0.9]}
            color="#ffdc14"
          />
          {Array.from(
            { length: Math.max(25, hi === s.hive ? s.slots : 25) },
            (_, i) => {
              const col = i % 5,
                row = Math.floor(i / 5),
                b = hi === s.hive ? s.bees[i] : undefined,
                def = b ? beeDefinition(b) : undefined;
              return (
                <group
                  key={i}
                  position={[
                    (col - 2) * 2.05 + (row % 2) * 1.02 - 0.5,
                    1.5 + row * 1.8,
                    -0.12,
                  ]}
                >
                  <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[1.05, 1.05, 0.24, 6]} />
                    <meshStandardMaterial color={def?.body ?? "#eabf13"} />
                  </mesh>
                  {def && (
                    <group
                      position={[0, 0, -0.3]}
                      rotation={[0, Math.PI, 0]}
                      scale={0.85}
                    >
                      <BeeModel
                        color={def.body}
                        face={def.face}
                        rarity={def.rarity}
                        gifted={b?.gifted}
                        animate={false}
                      />
                    </group>
                  )}
                </group>
              );
            },
          )}
          <Box
            position={[0, 0.07, -8]}
            scale={[11, 0.14, 7]}
            color={hi === s.hive ? "#ffe400" : "#eeeeee"}
          />
          <Label
            text={hi === s.hive ? "YOUR HIVE" : "CLAIM HIVE"}
            position={[0, 12, 0]}
            width={10}
            size={1.3}
            background={hi === s.hive ? "#238c24" : "#333333"}
          />
        </group>
      ))}
    </>
  );
}
export function ReferenceGates() {
  const s = useGame((g) => g.game);
  useGame((g) => g.revision);
  return (
    <>
      {RAMPS.map((r, i) => {
        const y =
            r.low +
            ((r.high - r.low) * (r.startZ - r.gateZ)) / (r.startZ - r.endZ),
          open = s.bees.length >= r.gate;
        return (
          <group key={i} position={[r.x, y, r.gateZ]}>
            <Box
              position={[-r.w / 2, 3, 0]}
              scale={[1, 6, 1.3]}
              color="#f2f2f2"
            />
            <Box
              position={[r.w / 2, 3, 0]}
              scale={[1, 6, 1.3]}
              color="#f2f2f2"
            />
            <Box
              position={[0, 6.2, 0]}
              scale={[r.w + 1, 1.2, 1.3]}
              color="#e9e9e9"
            />
            <Label
              text={`${r.gate} BEES`}
              position={[0, 6.3, 0.9]}
              width={r.w - 1}
              size={1.2}
              background="#dddddd"
              color="#111111"
            />
            {!open && (
              <mesh position={[0, 2.9, 0]}>
                <planeGeometry args={[r.w, 5.8]} />
                <meshBasicMaterial
                  color="#bfedff"
                  transparent
                  opacity={0.42}
                  side={THREE.DoubleSide}
                />
              </mesh>
            )}
            <Label
              text={open ? "✓" : String(r.gate)}
              position={[0, 3, 0.1]}
              width={3}
              size={2.7}
              background={open ? "#3d973e" : "#4098d0"}
              color="#ffffff"
            />
          </group>
        );
      })}
    </>
  );
}
export function ReferenceKeepers() {
  return (
    <>
      {PLACES.filter((p) => p.kind === "npc").map((p) => (
        <group key={p.id} position={[p.x, p.y, p.z]}>
          <Bear color={p.accent} variant={p.id} />
          <Label
            text={p.name}
            position={[0, 4.8, 0]}
            width={6}
            size={0.9}
            background="#333333"
          />
          <Label
            text="!"
            position={[0, 6.2, 0]}
            width={1.4}
            size={1.4}
            background="#ffe515"
            color="#222222"
          />
        </group>
      ))}
    </>
  );
}
