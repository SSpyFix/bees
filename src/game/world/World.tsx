import AbilityVisual, { TokenVisual } from "./AbilityVisuals";
import EnemyModel from "../combat/EnemyModel";
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
import {
  ReferenceScenery,
  ReferenceHives,
  ReferenceGates,
  ReferenceKeepers,
} from "./ReferenceWorld";

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
            color={i % 3 ? "#747474" : "#858585"}
          />
          <Box
            position={[p.x, p.y - 0.13, p.z]}
            scale={[p.w, 0.3, p.d]}
            color={palette.grass}
          />
          <Box
            position={[p.x, p.y - 0.5, p.z]}
            scale={[p.w, 0.45, p.d]}
            color="#666666"
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
        <meshStandardMaterial color="#dedede" side={THREE.DoubleSide} />
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
              color="#ffffff"
            />
            <Box
              position={[r.x + r.w / 2 + 0.1, y + 0.7, z]}
              scale={[0.28, 1.4, 0.28]}
              color="#ffffff"
            />
            <Box
              position={[r.x, y + 0.025, z]}
              scale={[r.w, 0.035, 0.28]}
              color="#bbbbbb"
            />
          </group>
        );
      })}
    </group>
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
          ? "#ff5050"
          : f.color === "blue"
            ? "#6badff"
            : "#ffffff",
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
        scale = (0.7 + f.size * 0.15) * full * (f.pollination > 0 ? 1.3 : 1);
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
        <meshStandardMaterial color="#286915" />
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
      <BeeModel
        color={definition.body}
        rarity={definition.rarity}
        gifted={bee?.gifted}
        face={definition.face}
      />
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
      (enemy.type >= 6 ? 2.3 : 1) *
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
    <group ref={ref} scale={enemy.type >= 6 ? 2.3 : 1}>
      <EnemyModel type={enemy.type} />
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
        <TokenVisual key={t.id} token={t} clock={s.clock} />
      ))}
      {s.effects.map((e) => (
        <AbilityVisual key={e.id} effect={e} clock={s.clock} />
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
  StaticScenery = memo(ReferenceScenery);
export default function World() {
  const game = useGame((s) => s.game);
  useGame((s) => s.revision);
  return (
    <>
      <StaticBatch>
        <StaticGround />
        <StaticScenery />
      </StaticBatch>
      <Flowers />
      <ReferenceGates />
      <ReferenceHives />
      <ReferenceKeepers />
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
