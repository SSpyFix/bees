# Supplied map integration

The game uses the supplied `bss.rbxmx` export. Conversion produced local geometry, textures and collision data; running the game needs no Roblox connection. Embedded scripts are never executed.

The converted source contains 17,076 parts. The playable map has 17 fields and 12,206 regenerating flower tiles, using the exported positions and flower artwork. The five source hives are claimable. Existing bee, quest, inventory, equipment, combat, crafting and save systems remain in use, with interactions moved to the new layout.

## Adaptations

- The export has no identifiable Stump field. A connected stump and flower patch were rebuilt beside Pineapple to preserve existing field quests.
- Coconut and Pepper lacked a usable connection to the old main map. Three visible trail segments connect them, requiring 35 bees.
- One invisible old perimeter wall crossed Coconut Field. It is excluded from collision.
- An uncut source wall blocked the five-bee doorway. Conversion opens the doorway in both visible and collision geometry; progression still controls the gate.
- Activities without a source interaction marker use rebuilt stands on clear ground. Other interactions use measured landmarks, with clear nearby approach positions.
- Old saves retain progression and restart at the new spawn. Saves on this map retain their valid position and elevation. Old sixth-hive selections migrate to an existing hive.
- Exported `Bee<number>` rigs and their wings/accessories are removed (42 stray bees, 95 parts). The 42 prefilled hive portraits are cleared. The claimed hive board draws portraits from the actual saved swarm; other hive boards remain empty. Boards extend beyond the source's 40 cells when needed to display all 50 supported bees. Gate statues are retained.

## Asset limits

Roblox returned `401 Unauthorized` for 30 referenced assets. Eighteen unavailable custom mesh assets use primitive geometry; unavailable textures use the part's color. The asset IDs and conversion changes are recorded in `public/map/import-report.json`. This does not bypass asset access restrictions. Source SurfaceGui/ScreenGui layouts, effects, scripts and animations are not converted into executable browser features. The source Robo area is scenery; its separate game mode is not implemented.

Geometry is a roughly 34 MB GLB, divided into 284 draw batches after bee cleanup. Collision data is a separate binary asset loaded before saved state is restored. Flowers use GPU instancing. Rendering remains more demanding than the former procedural approximation; use Low graphics on slower devices.

## Regenerate

The large original XML and download cache are outside Git. Generated runtime assets are included in the project, so normal builds need only Node.js.

With Python available, run:

```sh
python scripts/import_roblox_map.py /path/to/bss.rbxmx
npm run map:build
```

Use `--offline` on the Python command to reuse `.local/roblox-assets`. The converter cleans seven invalid XML control characters in this export, parses model data and requests only numeric Roblox asset IDs. It never evaluates source scripts.

Checks:

```sh
python -m unittest discover -s scripts -p 'test_import*.py'
npm run test:map-geometry
npm test
npm run build
npm run test:browser
```

The format readers are implemented locally. References: [Roblox FileMesh specification](https://devforum.roblox.com/t/roblox-filemesh-format-specification/326114), [CSG data research](https://github.com/Windows81/Roblox-Freedom-Distribution-Guides/blob/main/CSGv3Research/README.md), [RBXM serialization structure](https://github.com/VanillaMeow/roblox-solidmodel-converter-opus-vibe/blob/main/RBXM_FORMAT.md), and [Roblox face directions](https://create.roblox.com/docs/reference/engine/datatypes/Faces).
