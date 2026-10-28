import React from "react";
import { createRoot } from "react-dom/client";
import { Canvas } from "@react-three/fiber";
import LiveHiveBees from "../src/game/world/LiveHiveBees";
import { useGame } from "../src/game/systems/store";
import map from "../src/game/data/imported-map.json";

/** Visual fixture: source hive coordinates populated only from the live save. */
export function mountHiveCleanupGallery() {
  const state = useGame.getState();
  state.game.hive = 0;
  state.game.bees = [{ ...state.game.bees[0], id: "owned-basic", kind: "bee-0", gifted: false }, { ...state.game.bees[0], id: "owned-cool", kind: "bee-4", gifted: false }];
  useGame.setState({ menu: "settings" });
  state.refresh();
  const host = document.createElement("div");
  host.id = "hive-cleanup-gallery";
  host.style.cssText = "position:fixed;inset:0;z-index:1000;background:#c6dcb1";
  document.body.append(host);
  const hive = map.hives[0];
  createRoot(host).render(<Canvas camera={{ position: [hive.x + 1, 3, hive.z - 8], fov: 42 }} onCreated={({ scene, camera }) => {
    camera.lookAt(hive.x + 1, 3, hive.z + 5);
    (window as any).__hiveCleanupScene = scene;
    (window as any).__hiveCleanupCamera = camera;
  }}><color attach="background" args={["#c6dcb1"]} /><LiveHiveBees /></Canvas>);
}
