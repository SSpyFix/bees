/** Visual regression fixture; not part of the shipped game. */
import React from "react";
import { createRoot } from "react-dom/client";
import { Canvas } from "@react-three/fiber";
import { BeeModel, Label } from "../src/game/world/models";
import AbilityVisual, { TokenVisual } from "../src/game/world/AbilityVisuals";
export function mountTokenGallery() {
  const host = document.createElement("div");
  host.id = "token-gallery";
  host.style.cssText = "position:fixed;inset:0;z-index:999;background:#b7cfab";
  document.body.append(host);
  createRoot(host).render(
    <Canvas
      orthographic
      dpr={1}
      camera={{ position: [0, 8, 21], zoom: 60 }}
      onCreated={({ scene, camera }) => {
        camera.lookAt(0, 0, 0);
        (window as any).__tokenScene = scene;
      }}
    >
      <color attach="background" args={["#b7cfab"]} />
      <ambientLight intensity={2} />
      <directionalLight position={[3, 8, 6]} intensity={2} />
      <group name="bee-under-test" position={[-6, 3, 0]}>
        <BeeModel face="basic" color="#1b2a35" animate={false} />
      </group>
      <group name="number-under-test" position={[-3, 3, 0]}>
        <Label
          text="+36"
          position={[0, 0, 0]}
          width={2}
          size={0.7}
          color="#fff184"
          plain
        />
      </group>
      <group name="token-under-test" position={[0, 3, 0]}>
        <TokenVisual
          token={{
            id: 1,
            x: 0,
            y: 0,
            z: 0,
            kind: "baby-love",
            life: 20,
            value: 1,
          }}
          clock={0}
        />
      </group>
      {["pollen-mark", "honey-mark", "precise-mark"].map((kind, i) => (
        <AbilityVisual
          key={kind}
          effect={{
            id: i + 1,
            kind,
            x: (i - 1) * 5,
            y: 0,
            z: 0,
            life: 20,
            radius: 2,
            level: 5,
            gifted: false,
            tick: 0,
            stored: 0,
          }}
          clock={0}
        />
      ))}
    </Canvas>,
  );
}
