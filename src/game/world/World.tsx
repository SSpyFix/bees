import Flowers from "./Flowers";
import ImportedMap, { ImportedLandmarks } from "./ImportedMap";
import SprinklerModel from "./SprinklerModel";
import TokenModel, { AbilityEffect } from "./TokenModel";
import EnemyModel from "../combat/EnemyModel";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { BEES, ENEMY_TYPES } from "../data/content";
import { useGame } from "../systems/store";
import { beeDefinition } from "../systems/simulation";
import { Box, Label, BeeModel } from "./models";

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
        face={definition.face}
        gifted={bee?.gifted}
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
      <Label plain text={def.name} position={[0, 2.8, 0]} width={5} size={0.55} />
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
        <TokenModel key={t.id} token={t} />
      ))}
      {s.effects.map((e) => (
        <AbilityEffect key={e.id} effect={e} />
      ))}
      {s.floaters.map((f) => (
        <Label
          plain
          key={f.id}
          text={f.text}
          position={[f.x, f.y + (1.6 - f.life) * 1.2, f.z]}
          width={4}
          size={0.55}
          color={f.color}
        />
      ))}
    </>
  );
}
export default function World() {
  const game = useGame((s) => s.game);
  useGame((s) => s.revision);
  return (
    <>
      <ImportedMap />
      <Flowers />
      <ImportedLandmarks />
      {game.sprinklers.map((p) => (
        <SprinklerModel key={p.id} id={p.id} />
      ))}
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
