import Flowers from "./Flowers";
import ImportedMap, { ImportedLandmarks } from "./ImportedMap";
import SprinklerModel from "./SprinklerModel";
import AbilityVisual, { TokenVisual } from "./AbilityVisuals";
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
  const target = useRef(new THREE.Vector3());
  const initialized = useRef(false);
  const game = useGame((s) => s.game);
  const bee = game.bees.find((b) => b.id === id);
  const definition = bee ? beeDefinition(bee) : BEES[0];
  useFrame((_,dt) => {
    const b = game.bees.find((b) => b.id === id);
    const actor=group.current;
    if (actor && b) {
      const oldX=actor.position.x, oldZ=actor.position.z;
      target.current.set(b.x,b.y+Math.sin(game.clock*(4.2+b.phase%1.1)+b.phase)*.12,b.z);
      if(!initialized.current || actor.position.distanceToSquared(target.current)>35*35) {
        actor.position.copy(target.current); initialized.current=true;
      } else actor.position.lerp(target.current,1-Math.exp(-dt*14));
      const dx=actor.position.x-oldX,dz=actor.position.z-oldZ;
      if(Math.hypot(dx,dz)>.002) {
        const desired=Math.atan2(dx,dz);
        const turn=Math.atan2(Math.sin(desired-actor.rotation.y),Math.cos(desired-actor.rotation.y));
        actor.rotation.y+=turn*(1-Math.exp(-dt*9));
        actor.rotation.z=THREE.MathUtils.lerp(actor.rotation.z,THREE.MathUtils.clamp(-turn*.15,-.15,.15),1-Math.exp(-dt*7));
      } else actor.rotation.z=THREE.MathUtils.lerp(actor.rotation.z,0,1-Math.exp(-dt*7));
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
        <TokenVisual key={t.id} token={t} clock={s.clock} />
      ))}
      {s.effects.map((e) => (
        <AbilityVisual key={e.id} effect={e} clock={s.clock} />
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
