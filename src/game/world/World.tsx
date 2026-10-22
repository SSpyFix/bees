import { memo, useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  FIELDS,
  PLATFORMS,
  RAMPS,
  PLACES,
  BEES,
  ENEMY_TYPES,
} from "../data/content";
import { useGame } from "../systems/store";
import { beeDefinition } from "../systems/simulation";
import {
  Box,
  Ball,
  Label,
  Tree,
  Fence,
  Bear,
  BeeModel,
  flowerGeometry,
  palette,
} from "./models";
import StaticBatch from "./StaticBatch";

function Ground() {
  const tiles = useMemo(
    () =>
      PLATFORMS.flatMap((p) => {
        const cuts = RAMPS.filter(
          (r) =>
            r.low < p.y &&
            r.high >= p.y &&
            Math.abs(r.x - p.x) < p.w / 2 + r.w / 2 &&
            r.startZ > p.z - p.d / 2 &&
            r.endZ < p.z + p.d / 2,
        );
        const xs = [
          p.x - p.w / 2,
          p.x + p.w / 2,
          ...cuts.flatMap((r) => [
            Math.max(p.x - p.w / 2, r.x - r.w / 2),
            Math.min(p.x + p.w / 2, r.x + r.w / 2),
          ]),
        ].sort((a, b) => a - b);
        const zs = [
          p.z - p.d / 2,
          p.z + p.d / 2,
          ...cuts.map((r) =>
            Math.max(p.z - p.d / 2, Math.min(p.z + p.d / 2, r.endZ)),
          ),
        ].sort((a, b) => a - b);
        const out: { x: number; z: number; w: number; d: number; y: number }[] =
          [];
        for (let i = 1; i < xs.length; i++)
          for (let j = 1; j < zs.length; j++) {
            const x = (xs[i] + xs[i - 1]) / 2,
              z = (zs[j] + zs[j - 1]) / 2,
              w = xs[i] - xs[i - 1],
              d = zs[j] - zs[j - 1];
            if (
              w < 0.01 ||
              d < 0.01 ||
              cuts.some(
                (r) =>
                  Math.abs(x - r.x) < r.w / 2 && z > r.endZ && z < r.startZ,
              )
            )
              continue;
            out.push({ x, z, w, d, y: p.y });
          }
        return out;
      }),
    [],
  );
  return (
    <>
      {tiles.map((p, i) => (
        <group key={i}>
          <Box
            position={[p.x, (p.y - 8) / 2 - 0.2, p.z]}
            scale={[p.w, p.y + 8, p.d]}
            color={i % 3 ? "#9ba99c" : "#a4b1a0"}
          />
          <Box
            position={[p.x, p.y - 0.13, p.z]}
            scale={[p.w, 0.3, p.d]}
            color={palette.grass}
          />
          <Box
            position={[p.x, p.y - 0.5, p.z]}
            scale={[p.w, 0.45, p.d]}
            color="#6b905c"
          />
        </group>
      ))}
      {RAMPS.map((r, i) => (
        <Ramp key={i} ramp={r} />
      ))}
    </>
  );
}
function Ramp({ ramp: r }: { ramp: (typeof RAMPS)[number] }) {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(
        [
          r.x - r.w / 2,
          r.low,
          r.startZ,
          r.x + r.w / 2,
          r.low,
          r.startZ,
          r.x - r.w / 2,
          r.high,
          r.endZ,
          r.x + r.w / 2,
          r.high,
          r.endZ,
        ],
        3,
      ),
    );
    g.setIndex([0, 1, 2, 1, 3, 2]);
    g.computeVertexNormals();
    return g;
  }, [r]);
  return (
    <group>
      <mesh geometry={geo} receiveShadow>
        <meshStandardMaterial color="#d7c89b" side={THREE.DoubleSide} />
      </mesh>
      {Array.from({ length: 9 }, (_, i) => {
        const t = i / 8,
          y = r.low + (r.high - r.low) * t,
          z = r.startZ + (r.endZ - r.startZ) * t;
        return (
          <group key={i}>
            <Box
              position={[r.x - r.w / 2 - 0.1, y + 0.7, z]}
              scale={[0.28, 1.4, 0.28]}
              color="#efe9cd"
            />
            <Box
              position={[r.x + r.w / 2 + 0.1, y + 0.7, z]}
              scale={[0.28, 1.4, 0.28]}
              color="#efe9cd"
            />
            <Box
              position={[r.x, y + 0.025, z]}
              scale={[r.w, 0.035, 0.28]}
              color="#b2a77f"
            />
          </group>
        );
      })}
    </group>
  );
}
function Gates() {
  const game = useGame((s) => s.game),
    revision = useGame((s) => s.revision);
  void revision;
  return (
    <>
      {RAMPS.map((r, i) => {
        const unlocked = game.bees.length >= r.gate,
          y =
            r.low +
            ((r.high - r.low) * (r.startZ - r.gateZ)) / (r.startZ - r.endZ);
        return (
          <group key={i} position={[r.x, y, r.gateZ]}>
            <Box
              position={[-r.w / 2, 2.6, 0]}
              scale={[0.9, 5.4, 1]}
              color="#e5d9ac"
            />
            <Box
              position={[r.w / 2, 2.6, 0]}
              scale={[0.9, 5.4, 1]}
              color="#e5d9ac"
            />
            <Box
              position={[0, 5.2, 0]}
              scale={[r.w + 1, 1.4, 1]}
              color={unlocked ? "#688d69" : "#537965"}
            />
            <Label
              text={`${r.gate}  BEE TRAIL${unlocked ? "  ·  OPEN" : ""}`}
              position={[0, 5.25, 0.65]}
              width={r.w - 0.6}
              size={1.1}
            />
            {!unlocked && (
              <>
                <mesh position={[0, 2.2, 0]}>
                  <planeGeometry args={[r.w, 4.4]} />
                  <meshStandardMaterial
                    color="#d0e7b8"
                    transparent
                    opacity={0.2}
                    side={THREE.DoubleSide}
                  />
                </mesh>
                {[-3, 0, 3].map((x) => (
                  <Box
                    key={x}
                    position={[x, 2.3, 0]}
                    scale={[0.12, 4.4, 0.12]}
                    color="#e8db9d"
                  />
                ))}
                <Label
                  text={`GROW YOUR SWARM TO ${r.gate}`}
                  position={[0, 2.6, 0.3]}
                  width={9}
                  size={0.8}
                  background="#42634d"
                />
              </>
            )}
          </group>
        );
      })}
    </>
  );
}
function Flowers() {
  const game = useGame((s) => s.game),
    flowers = useRef<THREE.InstancedMesh>(null),
    centers = useRef<THREE.InstancedMesh>(null),
    stems = useRef<THREE.InstancedMesh>(null);
  const geom = useMemo(flowerGeometry, []),
    dummy = useMemo(() => new THREE.Object3D(), []),
    color = useMemo(() => new THREE.Color(), []);
  const elapsed = useRef(1);
  useEffect(() => {
    if (!stems.current || !flowers.current) return;
    for (let i = 0; i < game.flowers.length; i++) {
      const f = game.flowers[i];
      dummy.position.set(f.x, f.y + 0.24, f.z);
      dummy.scale.set(0.055, 0.5, 0.055);
      dummy.updateMatrix();
      stems.current.setMatrixAt(i, dummy.matrix);
      color.set(
        f.color === "red"
          ? "#e99889"
          : f.color === "blue"
            ? "#9ab9d7"
            : "#fff0bc",
      );
      flowers.current.setColorAt(i, color);
    }
    stems.current.instanceMatrix.needsUpdate = true;
    flowers.current.instanceColor!.needsUpdate = true;
  }, [game, dummy, color]);
  useFrame((_, dt) => {
    elapsed.current += dt;
    if (elapsed.current < 0.15 || !flowers.current || !centers.current) return;
    elapsed.current = 0;
    for (let i = 0; i < game.flowers.length; i++) {
      const f = game.flowers[i],
        full = 0.35 + (0.65 * f.pollen) / f.max,
        scale = (0.7 + f.size * 0.15) * full;
      dummy.position.set(f.x, f.y + 0.48 * full + 0.06, f.z);
      dummy.rotation.set(0, f.id * 2.399, 0);
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();
      flowers.current.setMatrixAt(i, dummy.matrix);
      dummy.position.y += 0.1 * scale;
      dummy.scale.set(0.13 * scale, 0.08 * scale, 0.13 * scale);
      dummy.updateMatrix();
      centers.current.setMatrixAt(i, dummy.matrix);
    }
    flowers.current.instanceMatrix.needsUpdate = true;
    centers.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <group>
      <instancedMesh
        ref={stems}
        args={[undefined, undefined, game.flowers.length]}
        frustumCulled={false}
      >
        <cylinderGeometry args={[1, 1, 1, 3, 1, true]} />
        <meshStandardMaterial color="#587c48" />
      </instancedMesh>
      <instancedMesh
        ref={flowers}
        args={[geom, undefined, game.flowers.length]}
        frustumCulled={false}
        receiveShadow
      >
        <meshStandardMaterial roughness={0.9} side={THREE.DoubleSide} />
      </instancedMesh>
      <instancedMesh
        ref={centers}
        args={[undefined, undefined, game.flowers.length]}
        frustumCulled={false}
      >
        <tetrahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#e4b657" />
      </instancedMesh>
    </group>
  );
}
function FieldScenery() {
  return (
    <>
      {FIELDS.map((f, i) => (
        <group key={f.id} position={[f.x, f.y, f.z]}>
          <Box
            position={[0, 0.015, 0]}
            scale={[22, 0.05, 22]}
            color={
              i % 3 === 0 ? "#73995a" : i % 3 === 1 ? "#7ea363" : "#779d60"
            }
          />
          <Box
            position={[0, 0.055, 10.8]}
            scale={[22, 0.08, 0.3]}
            color="#b3bc83"
          />
          <Box
            position={[0, 0.055, -10.8]}
            scale={[22, 0.08, 0.3]}
            color="#b3bc83"
          />
          <Fence position={[-11.2, 0, 0]} length={22} rotation={Math.PI / 2} />
          <Fence position={[11.2, 0, 0]} length={22} rotation={Math.PI / 2} />
          <Box position={[0, 1, 12.3]} scale={[0.18, 2, 0.2]} color="#98784f" />
          <Label
            text={f.name.toUpperCase()}
            position={[0, 2.15, 12.3]}
            width={11}
            size={0.85}
          />
          <Tree
            position={[-13.5, 0, -7.5]}
            kind={
              f.biome === "mushroom"
                ? "mushroom"
                : f.biome === "sunflower"
                  ? "sunflower"
                  : f.biome === "bamboo"
                    ? "bamboo"
                    : f.biome === "cactus"
                      ? "cactus"
                      : f.biome === "pine"
                        ? "pine"
                        : "oak"
            }
            scale={0.7 + (i % 3) * 0.12}
          />
          {[
            "pumpkin",
            "pineapple",
            "strawberry",
            "coconut",
            "pepper",
            "stump",
            "rose",
          ].includes(f.biome) && <BiomeProp biome={f.biome} />}
        </group>
      ))}
    </>
  );
}
function BiomeProp({ biome }: { biome: string }) {
  if (biome === "stump")
    return (
      <group position={[13, 0, -9]}>
        <mesh position={[0, 2, 0]} castShadow>
          <cylinderGeometry args={[2, 2.4, 4, 9]} />
          <meshStandardMaterial color="#967451" />
        </mesh>
        <mesh position={[0, 4.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.6, 1.8, 9]} />
          <meshStandardMaterial color="#ceb082" side={THREE.DoubleSide} />
        </mesh>
      </group>
    );
  return (
    <group position={[13, 0, -9]}>
      <Ball
        position={[0, 1.4, 0]}
        scale={[2, biome === "pepper" ? 2.8 : 1.5, 2]}
        color={
          biome === "pumpkin"
            ? "#dda263"
            : biome === "strawberry" || biome === "pepper"
              ? "#ca7469"
              : biome === "coconut"
                ? "#ba9a68"
                : "#d7b86c"
        }
      />
      {[0, 1, 2, 3, 4].map((i) => (
        <Box
          key={i}
          position={[Math.cos(i * 1.2) * 0.5, 3, Math.sin(i * 1.2) * 0.5]}
          scale={[0.3, 1.7, 0.3]}
          color="#6b975e"
          rotation={[0.4 * i, 0, 0.5]}
        />
      ))}
    </group>
  );
}
function Building({ place: p }: { place: (typeof PLACES)[number] }) {
  return (
    <group position={[p.x, p.y, p.z + 3]}>
      <Box position={[0, 1.8, 0.3]} scale={[7, 3.6, 4.8]} color="#f1e4ba" />
      <Box position={[0, 1.5, -2.2]} scale={[5.8, 2.3, 0.12]} color="#6c8f7a" />
      <Box position={[0, 1.45, -2.4]} scale={[4.7, 0.2, 1]} color="#ceb58a" />
      <Box
        position={[0, 3.6, -0.8]}
        scale={[7.8, 0.4, 7]}
        color={p.accent}
        rotation={[0.15, 0, 0]}
      />
      <Box
        position={[0, 4.7, 0.4]}
        scale={[7.8, 0.35, 3.5]}
        color={p.accent}
        rotation={[0.42, 0, 0]}
      />
      <Box
        position={[0, 4.7, 2.7]}
        scale={[7.8, 0.35, 3.5]}
        color={p.accent}
        rotation={[-0.42, 0, 0]}
      />
      {[-3, 3].map((x) => (
        <Box
          key={x}
          position={[x, 1.6, -3]}
          scale={[0.24, 3.2, 0.24]}
          color="#b49565"
        />
      ))}
      {Array.from({ length: 8 }, (_, i) => (
        <Box
          key={i}
          position={[-3.3 + i * 0.94, 3.15, -3.1]}
          scale={[0.47, 0.8, 0.16]}
          color={i % 2 ? p.accent : "#fff0cf"}
        />
      ))}
      <Label
        text={p.name}
        position={[0, 5.7, -1.8]}
        width={12}
        size={1.2}
        background="#315a49"
      />
      {[-1.7, 0, 1.7].map((x, i) => (
        <group key={i} position={[x, 1.7, -2.45]}>
          {p.kind === "eggs" ? (
            <mesh>
              <sphereGeometry args={[0.42, 10, 8]} />
              <meshStandardMaterial
                color={["#f7df9e", "#afcbcb", "#d4b2cc"][i]}
              />
            </mesh>
          ) : (
            <Box
              scale={[0.7, 0.6, 0.5]}
              color={["#e6c665", "#afc1a2", "#d7ab91"][i]}
            />
          )}
        </group>
      ))}
    </group>
  );
}
function Landmarks() {
  return (
    <>
      {PLACES.filter((p) => p.kind !== "npc").map((p) => (
        <group key={p.id}>
          {p.kind === "shop" || p.kind === "eggs" ? (
            <Building place={p} />
          ) : p.kind === "npc" ? (
            <group position={[p.x, p.y, p.z]} rotation={[0, 0.2, 0]}>
              <Bear color={p.accent} />
              <Label
                text={p.name}
                position={[0, 4.7, 0]}
                width={5.5}
                size={0.8}
              />
              <Label
                text="E · TALK"
                position={[0, 5.6, 0]}
                width={3.3}
                size={0.55}
                background="#9b956b"
              />
            </group>
          ) : (
            <group position={[p.x, p.y, p.z]}>
              <Box
                position={[0, 0.45, 0]}
                scale={[2.4, 0.9, 2.4]}
                color="#d9cd9d"
              />
              <mesh position={[0, 1.5, 0]} castShadow>
                <cylinderGeometry args={[0.9, 1.05, 1.6, 8]} />
                <meshStandardMaterial color={p.accent} />
              </mesh>
              <Ball
                position={[0, 2.5, 0]}
                scale={[0.9, 0.45, 0.9]}
                color="#f3d794"
              />
              <Label
                text={p.name}
                position={[0, 3.8, 0]}
                width={8}
                size={0.85}
              />
            </group>
          )}
        </group>
      ))}
    </>
  );
}
function Hives() {
  const s = useGame((g) => g.game);
  useGame((g) => g.revision);
  return (
    <>
      {[-20, 0, 20].map((x, hi) => (
        <group key={x} position={[x, 0, 69]}>
          <Box position={[-4.3, 4, 0]} scale={[0.5, 8, 0.6]} color="#a98955" />
          <Box position={[4.3, 4, 0]} scale={[0.5, 8, 0.6]} color="#a98955" />
          <Box position={[0, 8, 0]} scale={[9, 0.5, 0.6]} color="#a98955" />
          <Box position={[0, 0.3, 0]} scale={[9, 0.6, 0.6]} color="#a98955" />
          {Array.from({ length: 25 }, (_, i) => {
            const col = i % 5,
              row = Math.floor(i / 5);
            const b = hi === 1 ? s.bees[i] : undefined,
              def = b ? beeDefinition(b) : undefined;
            return (
              <group
                key={i}
                position={[
                  (col - 2) * 1.42 + (row % 2) * 0.7 - 0.3,
                  1.2 + row * 1.25,
                  -0.7,
                ]}
              >
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.76, 0.76, 0.25, 6]} />
                  <meshStandardMaterial
                    color={def?.body ?? (hi === 1 ? "#e4bf65" : "#a9a17a")}
                  />
                </mesh>
                {def && (
                  <BeeModel
                    color={def.body}
                    rarity={def.rarity}
                    animate={false}
                  />
                )}
              </group>
            );
          })}
          <Label
            text={hi === 1 ? "YOUR HIVE · F TO MAKE HONEY" : "MEADOW HIVE"}
            position={[0, 8.6, 0]}
            width={12}
            size={1}
          />
          <Box
            position={[0, 0.05, -7]}
            scale={[10, 0.08, 8]}
            color={hi === 1 ? "#d8bf76" : "#adb78b"}
          />
        </group>
      ))}
    </>
  );
}
function DistantScenery() {
  return (
    <>
      {Array.from({ length: 14 }, (_, i) => (
        <group key={i} position={[-140 + i * 25, -12, -250 - Math.sin(i) * 35]}>
          <mesh castShadow rotation={[0, i, 0]}>
            <coneGeometry
              args={[30 + Math.sin(i) * 10, 85 + (i % 4) * 20, 4]}
            />
            <meshStandardMaterial color={i % 2 ? "#a6beb3" : "#b6c9bc"} />
          </mesh>
          <mesh position={[0, 28 + (i % 4) * 10, 0]} rotation={[0, i, 0]}>
            <coneGeometry args={[12, 28, 4]} />
            <meshStandardMaterial color="#ecebd8" />
          </mesh>
        </group>
      ))}
      {Array.from({ length: 24 }, (_, i) => {
        const side = i % 2 ? -1 : 1;
        return (
          <Tree
            key={`t${i}`}
            position={[
              side * (62 + (i % 3) * 3),
              0,
              75 - Math.floor(i / 2) * 7,
            ]}
            scale={1 + (i % 3) * 0.2}
            kind={i % 4 === 0 ? "pine" : "oak"}
          />
        );
      })}
      <mesh position={[0, -9, -60]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1000, 1000]} />
        <meshStandardMaterial color="#bfd0b3" />
      </mesh>
    </>
  );
}
function Trail() {
  return (
    <>
      <Box position={[0, 0.025, 41]} scale={[8, 0.06, 45]} color="#d6c79e" />
      <Box position={[0, 0.035, 20]} scale={[110, 0.06, 5]} color="#d6c79e" />
      <Box position={[0, 0.025, 55]} scale={[112, 0.06, 4]} color="#d6c79e" />
      <Box position={[-12, 0.025, 5]} scale={[7, 0.06, 28]} color="#d6c79e" />
      <Box position={[12, 0.025, 5]} scale={[7, 0.06, 28]} color="#d6c79e" />
      <Fence position={[-68, 0, 42]} length={65} rotation={Math.PI / 2} />
      <Fence position={[68, 0, 42]} length={65} rotation={Math.PI / 2} />
      <Label
        text="P O L L E N   P E A K"
        position={[0, 8, -10]}
        width={21}
        size={1.8}
        background="#365d45"
      />
      <Box position={[-10, 3.5, -10]} scale={[0.4, 7, 0.4]} color="#9d855b" />
      <Box position={[10, 3.5, -10]} scale={[0.4, 7, 0.4]} color="#9d855b" />
    </>
  );
}
function BeeActor({ id }: { id: string }) {
  const group = useRef<THREE.Group>(null);
  const game = useGame((s) => s.game);
  const bee = game.bees.find((b) => b.id === id);
  const definition = bee ? beeDefinition(bee) : BEES[0];
  useFrame(() => {
    const b = game.bees.find((b) => b.id === id);
    if (group.current && b) {
      const old = group.current.position.clone();
      group.current.position.set(
        b.x,
        b.y + Math.sin(game.clock * 5 + b.phase) * 0.12,
        b.z,
      );
      const dx = b.x - old.x,
        dz = b.z - old.z;
      if (Math.abs(dx) + Math.abs(dz) > 0.001)
        group.current.rotation.y = Math.atan2(dx, dz);
    }
  });
  return (
    <group ref={group}>
      <BeeModel color={definition.body} rarity={definition.rarity} />
    </group>
  );
}
function EnemyActor({ id }: { id: number }) {
  const ref = useRef<THREE.Group>(null),
    health = useRef<THREE.Mesh>(null);
  const game = useGame((s) => s.game),
    enemy = game.enemies[id],
    def = ENEMY_TYPES[enemy.type];
  useFrame(() => {
    if (!ref.current) return;
    ref.current.visible = enemy.hp > 0 || enemy.hit > 0;
    ref.current.scale.setScalar(
      (enemy.type === 6 ? 2.3 : 1) *
        (enemy.hp > 0 ? 1 : Math.max(0.01, enemy.hit / 0.6)),
    );
    ref.current.position.set(
      enemy.x,
      enemy.y + (enemy.hit > 0 ? 0.18 : 0),
      enemy.z,
    );
    ref.current.rotation.y = Math.atan2(
      game.player.x - enemy.x,
      game.player.z - enemy.z,
    );
    if (health.current)
      health.current.scale.x = Math.max(0.001, enemy.hp / enemy.maxHp);
  });
  return (
    <group ref={ref} scale={enemy.type === 6 ? 2.3 : 1}>
      <Ball position={[0, 0.9, 0]} scale={[1.1, 0.7, 1.5]} color={def.color} />
      <Ball position={[0, 1, 1.1]} scale={[0.75, 0.6, 0.6]} color="#4e5848" />
      {[-0.3, 0.3].map((x) => (
        <Ball
          key={x}
          position={[x, 1.2, 1.63]}
          scale={[0.12, 0.13, 0.08]}
          color="#f3e9c5"
        />
      ))}
      {Array.from({ length: enemy.type === 2 ? 8 : 6 }, (_, i) => {
        const side = i % 2 ? 1 : -1;
        return (
          <Box
            key={i}
            position={[side, 0.35, (Math.floor(i / 2) - 1) * 0.7]}
            scale={[1, 0.16, 0.18]}
            color="#4f614a"
            rotation={[0, side * 0.35, side * -0.4]}
          />
        );
      })}
      {enemy.type === 0 &&
        [-0.5, 0.5].map((x) => (
          <Ball
            key={x}
            position={[x, 1.45, -0.2]}
            scale={[0.2, 0.09, 0.2]}
            color="#584940"
          />
        ))}
      <Box position={[0, 2.25, 0]} scale={[2.2, 0.15, 0.13]} color="#504c3e" />
      <mesh ref={health} position={[0, 2.25, 0.08]}>
        <boxGeometry args={[2.2, 0.16, 0.1]} />
        <meshBasicMaterial color="#a7c779" />
      </mesh>
      <Label text={def.name} position={[0, 2.8, 0]} width={5} size={0.55} />
      {enemy.windup > 0 && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
          <ringGeometry args={[1.8, 2.2, 20]} />
          <meshBasicMaterial color="#f09b7f" side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}
function Rewards() {
  const s = useGame((g) => g.game);
  useGame((g) => g.revision);
  return (
    <>
      {s.tokens.map((t) => (
        <group
          key={t.id}
          position={[t.x, t.y + 0.25 + Math.sin(s.clock * 3 + t.id) * 0.2, t.z]}
          rotation={[0, s.clock, Math.PI / 2]}
        >
          <mesh>
            <cylinderGeometry args={[0.6, 0.6, 0.16, 6]} />
            <meshStandardMaterial
              color={
                t.kind === "honey"
                  ? "#f3c651"
                  : t.kind === "blue"
                    ? "#89bdd7"
                    : t.kind === "red"
                      ? "#e99480"
                      : "#d4e296"
              }
              emissive="#ac8e45"
              emissiveIntensity={0.15}
            />
          </mesh>
        </group>
      ))}
      {s.floaters.map((f) => (
        <Label
          key={f.id}
          text={f.text}
          position={[f.x, f.y + (1.6 - f.life) * 1.2, f.z]}
          width={5}
          size={0.65}
          color={f.color}
          background="#315541"
        />
      ))}
    </>
  );
}
const StaticGround = memo(Ground),
  StaticScenery = memo(DistantScenery),
  StaticTrail = memo(Trail),
  StaticFields = memo(FieldScenery),
  StaticLandmarks = memo(Landmarks);
function Keepers() {
  return (
    <>
      {PLACES.filter((p) => p.kind === "npc").map((p) => (
        <group key={p.id} position={[p.x, p.y, p.z]}>
          <Bear color={p.accent} />
          <Label text={p.name} position={[0, 4.7, 0]} width={5.5} size={0.8} />
          <Label
            text="E · TALK"
            position={[0, 5.6, 0]}
            width={3.3}
            size={0.55}
            background="#9b956b"
          />
        </group>
      ))}
    </>
  );
}
export default function World() {
  const game = useGame((s) => s.game);
  useGame((s) => s.revision);
  return (
    <>
      <StaticBatch>
        <StaticGround />
        <StaticScenery />
        <StaticTrail />
        <StaticFields />
        <StaticLandmarks />
      </StaticBatch>
      <Flowers />
      <Gates />
      <Keepers />
      <Hives />
      {game.bees.map((b) => (
        <BeeActor key={b.id} id={b.id} />
      ))}
      {game.enemies.map((e) => (
        <EnemyActor key={e.id} id={e.id} />
      ))}
      <Rewards />
    </>
  );
}
