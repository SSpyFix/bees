import { openFifteenBeeGateCollision } from "../src/game/world/gate-opening.ts";
import { readFileSync } from "node:fs";
import { installTerrain } from "../src/game/world/imported-terrain.ts";
const bytes = readFileSync(new URL("../public/map/collision.bin", import.meta.url));
installTerrain(openFifteenBeeGateCollision(new Float32Array(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength))));
