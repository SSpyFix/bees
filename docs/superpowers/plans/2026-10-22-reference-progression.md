# Reference progression and field presentation

**Goal:** Continue the existing browser recreation toward Bee Swarm Simulator, prioritizing observable early gameplay and persistent progression.

**Architecture:** Keep the existing React/Three.js renderer and deterministic simulation. Introduce explicit reference data for collectors, containers, eggs, bond and ability tokens; retain stable save IDs and migrate old saves. Render recognizable token icons and regular flower tiles with the same simulation state.

**Execution:** Native in this session. The user's request explicitly authorizes autonomous continuation while away; do not wait for design approvals. The fresh clone is isolated on `codex/bss-progression-fidelity`.

## Tasks

- [ ] Verify baseline, then add failing tests for purchased-egg pricing independent of hatches, spatial collector tile counts, the six Black Bear silver-egg quests, typed egg rarity distributions, reference bond thresholds, stack limits and save restoration.
- [ ] Replace generated collector statistics and incomplete bag progression with explicit data; implement deterministic tile selection, size-based yield and safe instant conversion.
- [ ] Add Black Bear's first 15 reference quests with field/color conditions and typed egg rewards. Keep existing IDs for save compatibility and preserve other quest chains.
- [ ] Add typed eggs, Star Jelly/Star Treat, gifted stat multipliers, correct bond progression and durable state. Expose these through inventory, hive and ticket shop.
- [ ] Replace generic token buffs with named, stacking effects; add token links and colored bombs, species ability lists, visible icons and short-lived world effects.
- [ ] Replace scattered flowers with flat, regular tile clusters, lower the camera, and inspect screenshots.
- [ ] Run full simulation/build/browser verification, repair material issues, document remaining parity gaps and create a reviewable GitHub branch/PR if credentials allow.

## Review focus

- Loading previous saves preserves gear, bees, quests and honey; new counters have conservative defaults.
- Full bags and instant conversion conserve pollen/honey without creating or dropping resources.
- Failed hatches, gifting and purchases consume nothing; unique Event bees remain protected.
- Repeated token links cannot recurse or double-collect tokens; expired buffs and visuals are removed.
- Browser tests use a portable Chromium installation and exercise the new quest, egg and gifting paths.

## References

- [Collectors](https://bee-swarm-simulator.fandom.com/wiki/Tools), [Noob Shop](https://bee-swarm-simulator.fandom.com/wiki/Noob_Shop), [Pro Shop](https://bee-swarm-simulator.fandom.com/wiki/Pro_Shop)
- [Containers](https://bee-swarm-simulator.fandom.com/wiki/Items), [Basic Egg pricing](https://bee-swarm-simulator.fandom.com/wiki/Basic_Egg_Shop)
- [Black Bear quests](https://bee-swarm-simulator.fandom.com/wiki/Black_Bear?page=6), [Eggs](https://bee-swarm-simulator.fandom.com/wiki/Egg?page=1)
- [Bee bond](https://bee-swarm-simulator.fandom.com/wiki/Bond?page=1), [Stats](https://bee-swarm-simulator.fandom.com/wiki/Stats), [Ability tokens](https://bee-swarm-simulator.fandom.com/wiki/Ability_Tokens?page=2)

## Ledger

Baseline: npm ci, 44 Vitest tests, TypeScript and Vite build pass. Browser screenshot inspected. Current map remains an approximation, with 17 standard fields on connected terraces; do not claim measured 1:1 map parity.

Ruling: Prioritize functional reference progression and stronger field/token visuals over attempting every endgame subsystem at once. Original dialogue/audio/textures are not copied; descriptions and art are authored for the browser recreation.
