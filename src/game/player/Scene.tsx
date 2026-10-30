import GliderModel from "./GliderModel";
import Daylight from "./Daylight";
import { placeSprinkler } from "../systems/sprinklers";
import { Suspense, useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import World from "../world/World";
import { KeeperModel } from "../world/models";
import { useGame, sound } from "../systems/store";
import {
  atHive,
  nearbyHive,
  claimHive,
  collect,
  movePlayer,
  toggleGlider,
  nearestPlace,
  step,
  startConversion,
  interactPlace,
  updateAutoJelly,
} from "../systems/simulation";
import { surface, solidAt } from "../world/terrain";
import { TOOLS } from "../data/content";
import HiveItemDrop from '../world/HiveItemDrop';
import { activateHotbar, useItemDrag } from '../systems/item-drag';

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
    yaw: 0.38,
    pitch: 0.52,
    distance: 24,
    target: new THREE.Vector3(game.player.x, game.player.y + 2, game.player.z),
    previous: new THREE.Vector3(game.player.x, game.player.y, game.player.z),
    rendered: new THREE.Vector3(game.player.x, game.player.y, game.player.z),
    orbit: new THREE.Vector3(Math.sin(.38)*Math.cos(.52)*24,Math.sin(.52)*24,Math.cos(.38)*Math.cos(.52)*24),
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
    const focusInput = (e: FocusEvent) => { if ((e.target as HTMLElement)?.matches("input:not([type=checkbox]), select, textarea, [contenteditable=true]")) clear(); };
    const keydown = (e: KeyboardEvent) => {
      if (e.code === "Space" && (e.target as HTMLElement)?.matches("input[type=checkbox]")) return;
      if (
        e.code !== "Escape" &&
        (e.target as HTMLElement)?.matches("input:not([type=checkbox]), select, textarea, [contenteditable=true]")
      )
        return;
      if (
        ["Space", "Tab", "KeyQ", "KeyM", "KeyF", "KeyE", "Escape"].includes(
          e.code,
        )
      )
        e.preventDefault();
      const state = useGame.getState();
      if (useItemDrag.getState().pending) {
        if (e.code === 'Escape') useItemDrag.setState({ pending: null });
        clear();
        return;
      }
      if (e.code === "Escape") {
        state.open(state.menu ? null : "settings");
        clear();
        return;
      }
      if (e.repeat) return;
      if (e.code === "KeyJ") {
        state.open(state.menu === "badges" ? null : "badges");
        clear();
        return;
      }
      if (e.code === "KeyR" && !state.menu) {
        placeSprinkler(game);
        state.refresh();
        return;
      }
      if (
        e.code === "KeyQ" ||
        e.code === "Tab" ||
        e.code === "KeyM" ||
        e.code === "KeyH" ||
        e.code === "KeyB"
      ) {
        const menu =
          e.code === "KeyQ"
            ? "quests"
            : e.code === "Tab"
              ? "inventory"
              : e.code === "KeyH"
                ? "hive"
                : e.code === "KeyB"
                  ? "bees"
                  : "map";
        state.open(state.menu === menu ? null : menu);
        clear();
        return;
      }
      if (e.code === "KeyE" && state.shopContext) {
        state.leaveShop();
        state.save();
        clear();
        return;
      }
      if (["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.code)) {
        e.preventDefault();
        inp.keys.add(e.code);
        if(e.code === 'Space') {
          if(!game.player.grounded && toggleGlider(game)){state.refresh();}
          else inp.jumpQueued = true;
        }
        return;
      }
      if (state.menu) return;
      if (e.code.startsWith("Digit")) {
        const n = Number(e.code.slice(5));
        if (n !== 1) activateHotbar(n === 0 ? 10 : n);
        state.refresh();
        state.save();
        return;
      }
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
          if (
            p.kind === "shop" ||
            p.kind === "eggs" ||
            p.kind === "npc" ||
            p.kind === "tickets" ||
            p.kind === "guild"
          )
            state.open(p.kind, p.id);
          else {
            interactPlace(game, p.id);
            sound(820);
            state.refresh();
          }
        } else if (atHive(game)) state.open("hive");
        else {
          const h = nearbyHive(game);
          if (h) claimHive(game, h.index);
        }
        clear();
      }
    };
    const keyup = (e: KeyboardEvent) => {
      inp.keys.delete(e.code);
    };
    const down = (e: PointerEvent) => {
      if (useGame.getState().menu || useItemDrag.getState().pending || useItemDrag.getState().item) return;
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
    document.addEventListener("focusin", focusInput);
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
      document.removeEventListener("focusin", focusInput);
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
    if (state.menu) i.gather = false;
    if (useItemDrag.getState().pending || useItemDrag.getState().item) {
      i.keys.clear();
      i.gather = false;
      i.jumpQueued = false;
    }
    updateAutoJelly(game,10000);
    {
      i.tick += dt;
      let ticks = 0;
      while (i.tick >= 1 / 30 && ticks++ < 8) {
        i.previous.set(game.player.x,game.player.y,game.player.z);
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
          i.jumpQueued,
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
    const current = new THREE.Vector3(game.player.x, game.player.y, game.player.z);
    if (i.previous.distanceToSquared(current)>64) i.previous.copy(current);
    const alpha=THREE.MathUtils.clamp(i.tick/(1/30),0,1);
    i.rendered.copy(i.previous).lerp(current,alpha);
    if (body.current) { body.current.position.copy(i.rendered); body.current.rotation.y=game.player.yaw; }
    i.target.copy(i.rendered); i.target.y+=1.8;
    let dist = i.distance;
    // Keep a low camera on the conversion apron in front of the hive boards.
    // Higher overview angles remain free to look across the whole world.
    // Sample the camera ray against the same terrain used by player collision.
    for (let t = 2; t < dist; t += 2) {
      const x = i.target.x + Math.sin(i.yaw) * Math.cos(i.pitch) * t,
        z = i.target.z + Math.cos(i.yaw) * Math.cos(i.pitch) * t,
        y = i.target.y + Math.sin(i.pitch) * t;
      const h = surface(x, z, y);
      if ((h !== null && h > y - 1) || solidAt(x, z, y - 0.65)) {
        dist = Math.max(3, t - 1);
        break;
      }
    }
    const desired = new THREE.Vector3(
      i.target.x + Math.sin(i.yaw) * Math.cos(i.pitch) * dist,
      i.target.y + Math.sin(i.pitch) * dist,
      i.target.z + Math.cos(i.yaw) * Math.cos(i.pitch) * dist,
    );
    i.orbit.lerp(desired.sub(i.target),1-Math.exp(-dt*7));
    camera.position.copy(i.target).add(i.orbit);
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
    <group ref={body} name="player">
      <KeeperModel
        moving={game.player.moving && !game.player.gliding}
        swing={game.player.swing}
        converting={game.converting}
        bagLevel={Number(game.bag.split("-")[1])}
        toolLevel={Number(game.tool.split("-")[1])}
        hatLevel={Number(game.hat.split("-")[1]) || 0}
        bootsLevel={Number(game.boots.split("-")[1]) || 0}
      />
      {game.player.gliding && <GliderModel id={game.glider} />}
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
      shadows={quality === "high" ? "soft" : false}
      dpr={quality === "low" ? 1 : [1, 1.5]}
      camera={{ position: [12, 17, 24], fov: 50, near: 0.2, far: 850 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.setClearColor("#b5d8f5");
        gl.toneMapping = THREE.NeutralToneMapping;
        gl.toneMappingExposure = 1;
      }}
    >
      <color attach="background" args={["#b5d8f5"]} />
      <fog attach="fog" args={["#b5d8f5", 180, 600]} />
      <Daylight shadows={quality === "high"} />
      <Suspense fallback={null}>
        <HiveItemDrop />
        <World />
        <Controller />
      </Suspense>
    </Canvas>
  );
}
