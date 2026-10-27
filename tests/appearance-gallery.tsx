/** Browser-only visual QA fixture; not imported by the shipped application. */
import React from "react";
import { createRoot } from "react-dom/client";
import { Canvas } from "@react-three/fiber";
import { BEES } from "../src/game/data/content";
import { BeeModel, Label } from "../src/game/world/models";
export function mountBeeGallery() {
  const host = document.createElement("div");
  host.id = "appearance-gallery";
  host.style.cssText = "position:fixed;inset:0;z-index:999;background:#c5ccce";
  document.body.append(host);
  createRoot(host).render(
    <Canvas
      orthographic
      dpr={1}
      camera={{ position: [0, 3, 32], zoom: 34, near: 0.1, far: 100 }}
      onCreated={({ camera }) => camera.lookAt(0, 0, 0)}
    >
      <color attach="background" args={["#c5ccce"]} />
      <ambientLight intensity={2} />
      <directionalLight position={[5, 9, 10]} intensity={2} />
      {BEES.map((b, i) => (
        <group
          key={b.id}
          position={[((i % 7) - 3) * 3.6, (3 - Math.floor(i / 7)) * 3.1, 0]}
        >
          <BeeModel
            color={b.body}
            face={b.face}
            rarity={b.rarity}
            animate={false}
          />
          <Label
            text={b.name}
            position={[0, -1.03, 0.1]}
            width={3.1}
            size={0.3}
            color="#172a35"
            background="#edf3f2"
          />
        </group>
      ))}
    </Canvas>,
  );
}
