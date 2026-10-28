import React from "react";
import ReactDOM from "react-dom/client";
import { installTerrain } from "./game/world/imported-terrain";
import "./style.css";
import "./reference-ui.css";
async function start() {
  const host = document.getElementById("root")!;
  host.textContent = "Loading the mountain…";
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}map/collision.bin`);
    if (!response.ok) throw new Error("The map could not be loaded. Please reload.");
    installTerrain(new Float32Array(await response.arrayBuffer()));
    // Restore saves only after the new collision geometry is available.
    const { default: App } = await import("./App");
    ReactDOM.createRoot(host).render(<React.StrictMode><App /></React.StrictMode>);
  } catch (error) {
    host.textContent = error instanceof Error ? error.message : "Could not load the mountain. Please reload.";
  }
}
void start();
