# Pollen Peak Implementation Plan

> Execute inline with superpowers:executing-plans. The user explicitly directed replacement of Polaris and immediate creation; no additional design approval is needed.

**Goal:** A playable original 3D bee swarm adventure with an honest, connected progression loop.
**Architecture:** Testable TypeScript simulation and world/economy data, React Three Fiber procedural rendering, Zustand bridge to a responsive HUD. Simulate at a bounded timestep; persist validated, versioned progression separately from runtime input.
**Tech Stack:** Vite, React, TypeScript, Three.js, R3F, Drei, Zustand, Vitest, Playwright.
**Spec:** docs/superpowers/specs/pollen-peak.md (user-provided full specification).

## Global Constraints
- Original procedural assets; no proprietary engine, accounts, external asset services or paid APIs.
- WASD, jumping, mouse orbit/zoom, spatial gathering, autonomous bees, safe hive conversion.
- Connected branching mountain with 17 fields, real bee-count gates and actual shop transactions.
- Save progression; validate malformed input; never duplicate rewards or exceed pollen capacity.

## Review Focus
- Full backpack and depleted flowers: gathering must not create resources.
- Conversion interruption and repeated clicks: preserve conservation and prevent duplicate payouts.
- Locked gates including jumping and diagonal movement: collision must enforce requirements.
- Corrupted and old save data: recover safely without inaccessible equipment or invalid bees.
- Browser focus and menus: clear keys and resume camera/player controls correctly.

## Tasks
- [x] Simulation/economy: write failing Vitest tests for capacity, spatial collection, regeneration, conversion, buying/equipping, hatching, slots, feeding, quests, combat, gates, saves. Implement pure model/data and run suite.
- [x] World/player: terrain sampling shared by collision and rendering; 17 dense flower fields, branching ramps, gates, shops, procedural props and avatars, orbiting third-person camera. Verify movement and gathering in browser.
- [x] Swarm/progression: independent bee FSM, energy/rest, attacks, tokens and buffs; hive conversion; all equipment and consumables connected to simulation. Verify unit suite and browser loop.
- [x] Interfaces/content: shops, hive, NPC quest chains, journal, inventory, map, settings, notifications and save management. Verify interactions and keyboard handling in browser.
- [x] Validation: production build, unit tests, Playwright movement, gather/convert/purchase/hatch/quest/combat/gates/reload, screenshot review and fix observed errors. Document run instructions and actual limitations.
