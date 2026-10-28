# Imported Roblox map

Use the user's `C:/Users/zacha/Downloads/bss.rbxmx` as the browser game's map. The user approved replacing map-dependent features and retaining existing gameplay where appropriate. Keep React, Three.js and the deterministic simulation; replace procedural scenery and assumed terrace coordinates with converted geometry and measured locations.

Convert offline: never execute embedded Roblox scripts or load XML in the browser. Produce a browser-ready GLB, compact gameplay metadata, and an import report. Preserve positions, rotations, primitive shapes, colors, and accessible meshes/textures; record unsupported or unavailable assets explicitly. Avoid silently substituting every custom mesh with a box. Use spatially indexed collision geometry and migrate old player positions to the new spawn while preserving progression.

Approaches: a scenery overlay would leave invisible old collision and misaligned fields; recreating the scenery manually would discard the supplied layout. Chosen approach: convert the supplied map and remap interactions, fields and terrain together.

Rulings: work in the current feature checkout because its substantial uncommitted gameplay work is the integration target. Do not reset, stash, publish, or commit unrelated changes. Keep the source export outside Git; save a reproducible converter and generated artifacts. Unavailable visual assets and unsupported engine features are documented limitations, not complete fidelity claims.
