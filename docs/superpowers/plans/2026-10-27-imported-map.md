# Imported Map Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the supplied Roblox map playable in the browser recreation.

**Architecture:** Offline conversion creates a static GLB and compact map metadata. A spatial collision index serves the existing deterministic simulation; measured field and interaction coordinates replace the old approximation.

**Tech Stack:** Python standard library conversion, React, Three.js, TypeScript, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-10-27-imported-map-design.md`

## Global Constraints

- Preserve existing uncommitted gameplay work and save progression.
- Never execute embedded scripts; no Roblox services at game runtime.
- Generate assets offline and record unsupported assets.

## Review Focus

- Invalid XML control characters must not corrupt transforms or execute source scripts.
- Collisions must permit bridges and lower floors without teleporting players to overhead scenery.
- Flower locations, hives and interaction prompts must match visible geometry.
- Old saves must respawn on valid ground without losing purchases or bees.
- Missing assets must be bounded failures with visible import diagnostics.

## Tasks

- [x] Convert and inspect geometry: add converter fixture tests for transforms, XML cleaning, asset identifiers, and script exclusion; run red, implement, run green; generate GLB and metadata from the supplied file.
- [x] Integrate gameplay locations and collisions: test imported field bounds, spawn, height-aware collision and save migration; implement spatial index, imported field tiles and measured places; run simulation suite.
- [x] Replace scenery and navigation: load generated GLB, render live flowers and hive/gate status, update camera/minimap; verify TypeScript/build and browser gameplay with screenshots.
- [x] Review changes, repair significant defects, document asset gaps and verification. Leave changes reviewable without committing unrelated files.

## Ledger

- Baseline: 77 Vitest tests pass. Existing checkout is `codex/bss-progression-fidelity` with substantial uncommitted changes.
- User approved full-map integration and rebuilding map-dependent features.
- Export: 106,038,871 bytes; seven invalid control characters; 16,231 Parts, 229 MeshParts, 559 UnionOperations, 13,312 Decals; 96 scripts treated as inert source data.
- Converted 17,076 parts to a 34,275,820-byte GLB with 308 draw batches, local textures and 81,762 collision triangles. Runtime has 12,206 flower tiles in 17 fields and the five actual exported hives.
- Ruling: recreate the absent Stump field beside Pineapple, retain the source Rose field's five-bee elevation/progression, rebuild stands without identifiable source interaction markers, and connect Coconut/Pepper with three visible 35-bee trail segments.
- Ruling: remove the invisible old perimeter wall intersecting Coconut Field and cut a doorway through the unbroken source wall ahead of the five-bee gate. Both were reproduced as movement failures before repair.
- Review: independent reviewer found reversed Front/Back decal planes, affecting 238 source decals. A geometry fixture failed before correction and passed after; GLB regenerated. Reviewer found no other high/medium issues and verified numerical access to all fields.
- Verification so far: 88 Vitest checks, three Python converter fixtures, three Node geometry fixtures, TypeScript/Vite build and whitespace check pass. Initial full browser run: 14 passed, two failures (gate-wall collision and an input fired before reload finished); both repaired, full rerun in progress.
- Keep existing uncommitted progression work in place. No commit, push, merge or publication is part of this import.
- Final verification: all 16 Chromium scenarios passed in the complete rerun (3.2 minutes), including the repaired gate and reload cases. Production preview serves the GLB, collision binary and textures successfully at `http://127.0.0.1:4173/`.
