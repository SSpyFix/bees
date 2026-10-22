import { Suspense, useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import World from "../world/World";
import { KeeperModel } from "../world/models";
import { useGame, sound } from "../systems/store";
import {
  atHive,
  collect,
  movePlayer,
  nearestPlace,
  step,
  startConversion,
  interactPlace,
} from "../systems/simulation";
import { surface } from "../world/terrain";
import { TOOLS } from "../data/content";

function Controller() {
  const { gl, camera } = useThree();
  const body = useRef<THREE.Group>(null);
  const game = useGame((s) => s.game);
  useGame((s) => s.revision);
  const input = useRef({
    keys: new Set<string>(),
    gather: false,
    rotate: false,
    jumpQueued: false,
    yaw: 0,
    pitch: 0.55,
    distance: 62,
    target: new THREE.Vector3(0, 2, 44),
    tick: 0,
    ui: 0,
    save: 0,
  });
  useEffect(() => {
    const inp = input.current;
    const clear = () => {
      inp.keys.clear();
      inp.gather = false;
      inp.rotate = false;
      inp.jumpQueued = false;
    };
    const keydown = (e: KeyboardEvent) => {
      if (
        e.code !== "Escape" &&
        (e.target as HTMLElement)?.matches("input, select, textarea")
      )
        return;
      if (
        ["Space", "Tab", "KeyQ", "KeyM", "KeyF", "KeyE", "Escape"].includes(
          e.code,
        )
      )
        e.preventDefault();
      const state = useGame.getState();
      if (e.code === "Escape") {
        state.open(state.menu ? null : "settings");
        clear();
        return;
      }
      if (e.repeat) return;
      if (
        e.code === "KeyQ" ||
        e.code === "Tab" ||
        e.code === "KeyM" ||
        e.code === "KeyH"
      ) {
        const menu =
          e.code === "KeyQ"
            ? "quests"
            : e.code === "Tab"
              ? "inventory"
              : e.code === "KeyH"
                ? "hive"
                : "map";
        state.open(state.menu === menu ? null : menu);
        clear();
        return;
      }
      if (state.menu) return;
      inp.keys.add(e.code);
      if (e.code === "Space") inp.jumpQueued = true;
      if (e.code === "KeyF") {
        if (game.converting) game.converting = false;
        else if (!startConversion(game)) interactPlace(game, "invalid");
        state.refresh();
      }
      if (e.code === "KeyE") {
        const p = nearestPlace(game);
        if (p) {
          if (p.kind === "shop" || p.kind === "eggs" || p.kind === "npc")
            state.open(p.kind, p.id);
          else {
            interactPlace(game, p.id);
            sound(820);
            state.refresh();
          }
        } else if (atHive(game)) state.open("hive");
        clear();
      }
    };
    const keyup = (e: KeyboardEvent) => {
      inp.keys.delete(e.code);
    };
    const down = (e: PointerEvent) => {
      if (useGame.getState().menu) return;
      if (e.button === 0) {
        inp.gather = true;
        sound(630);
      }
      if (e.button === 2) {
        inp.rotate = true;
        gl.domElement.setPointerCapture(e.pointerId);
      }
    };
    const up = (e: PointerEvent) => {
      if (e.button === 0) inp.gather = false;
      if (e.button === 2) inp.rotate = false;
    };
    const pointer = (e: PointerEvent) => {
      if (inp.rotate && !useGame.getState().menu) {
        inp.yaw -= e.movementX * 0.005 * game.settings.sensitivity;
        inp.pitch = THREE.MathUtils.clamp(
          inp.pitch + e.movementY * 0.004 * game.settings.sensitivity,
          0.22,
          1.27,
        );
      }
    };
    const wheel = (e: WheelEvent) => {
      if (useGame.getState().menu) return;
      e.preventDefault();
      inp.distance = THREE.MathUtils.clamp(
        inp.distance + e.deltaY * 0.025,
        10,
        70,
      );
    };
    const context = (e: Event) => e.preventDefault();
    window.addEventListener("keydown", keydown);
    window.addEventListener("keyup", keyup);
    window.addEventListener("blur", clear);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointermove", pointer);
    gl.domElement.addEventListener("pointerdown", down);
    gl.domElement.addEventListener("wheel", wheel, { passive: false });
    gl.domElement.addEventListener("contextmenu", context);
    gl.domElement.dataset.interactive = "true";
    return () => {
      delete gl.domElement.dataset.interactive;
      window.removeEventListener("keydown", keydown);
      window.removeEventListener("keyup", keyup);
      window.removeEventListener("blur", clear);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointermove", pointer);
      gl.domElement.removeEventListener("pointerdown", down);
      gl.domElement.removeEventListener("wheel", wheel);
      gl.domElement.removeEventListener("contextmenu", context);
      clear();
    };
  }, [game, gl]);
  useFrame((_, frameDt) => {
    const state = useGame.getState(),
      i = input.current;
    const dt = Math.min(frameDt, 0.25);
    const paused = state.menu === "settings";
    if (state.menu) {
      i.keys.clear();
      i.gather = false;
    }
    if (!paused) {
      i.tick += dt;
      let ticks = 0;
      while (i.tick >= 1 / 30 && ticks++ < 8) {
        const f =
          Number(i.keys.has("KeyW") || i.keys.has("ArrowUp")) -
          Number(i.keys.has("KeyS") || i.keys.has("ArrowDown"));
        const r =
          Number(i.keys.has("KeyD") || i.keys.has("ArrowRight")) -
          Number(i.keys.has("KeyA") || i.keys.has("ArrowLeft"));
        movePlayer(
          game,
          r * Math.cos(i.yaw) - f * Math.sin(i.yaw),
          -f * Math.cos(i.yaw) - r * Math.sin(i.yaw),
          1 / 30,
          i.jumpQueued || i.keys.has("Space"),
        );
        i.jumpQueued = false;
        if (i.gather && game.gatherCooldown <= 0) {
          collect(game);
          game.gatherCooldown =
            TOOLS.find((t) => t.id === game.tool)?.interval ?? 0.65;
        }
        step(game, 1 / 30);
        i.tick -= 1 / 30;
      }
    }
    if (body.current) {
      body.current.position.set(game.player.x, game.player.y, game.player.z);
      body.current.rotation.y = game.player.yaw;
    }
    const aim = new THREE.Vector3(
      game.player.x,
      game.player.y + 1.8,
      game.player.z - 15,
    );
    i.target.lerp(aim, 1 - Math.exp(-dt * 5));
    let dist = i.distance;
    // Sample the camera ray against the same terrain used by player collision.
    for (let t = 2; t < i.distance; t += 2) {
      const x = i.target.x + Math.sin(i.yaw) * Math.cos(i.pitch) * t,
        z = i.target.z + Math.cos(i.yaw) * Math.cos(i.pitch) * t,
        y = i.target.y + Math.sin(i.pitch) * t;
      const h = surface(x, z);
      if (h !== null && h > y - 1) {
        dist = Math.max(7, t - 2);
        break;
      }
    }
    const desired = new THREE.Vector3(
      i.target.x + Math.sin(i.yaw) * Math.cos(i.pitch) * dist,
      i.target.y + Math.sin(i.pitch) * dist,
      i.target.z + Math.cos(i.yaw) * Math.cos(i.pitch) * dist,
    );
    camera.position.lerp(desired, 1 - Math.exp(-dt * 7));
    camera.lookAt(i.target);
    i.ui += dt;
    i.save += dt;
    if (i.ui > 0.12) {
      state.refresh();
      i.ui = 0;
    }
    if (i.save > 15) {
      state.save();
      i.save = 0;
    }
  });
  return (
    <group ref={body}>
      <KeeperModel
        moving={game.player.moving}
        swing={game.player.swing}
        converting={game.converting}
        bagLevel={Number(game.bag.split("-")[1])}
        toolLevel={Number(game.tool.split("-")[1])}
      />
      {game.converting && (
        <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.7, 2, 24]} />
          <meshBasicMaterial color="#f3cd60" transparent opacity={0.75} />
        </mesh>
      )}
    </group>
  );
}
export default function Scene() {
  const quality = useGame((s) => s.game.settings.quality);
  return (
    <Canvas
      shadows={quality === "high"}
      dpr={quality === "low" ? 1 : [1, 1.5]}
      camera={{ position: [0, 35, 91], fov: 50, near: 0.2, far: 650 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.setClearColor("#d7e9d8");
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 0.92;
      }}
    >
      <color attach="background" args={["#d7e9d8"]} />
      <fog attach="fog" args={["#d7e9d8", 110, 340]} />
      <ambientLight intensity={0.55} />
      <hemisphereLight args={["#fff7df", "#718557", 1.05]} />
      <directionalLight
        position={[-35, 65, 25]}
        intensity={2.1}
        color="#fff1cf"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-75}
        shadow-camera-right={75}
        shadow-camera-top={80}
        shadow-camera-bottom={-80}
        shadow-camera-near={1}
        shadow-camera-far={160}
        shadow-bias={-0.0004}
        shadow-normalBias={0.1}
      />
      <Suspense fallback={null}>
        <World />
        <Controller />
      </Suspense>
    </Canvas>
  );
}
