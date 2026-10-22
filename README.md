# Pollen Peak

An original single-player 3D beekeeping adventure. All world models, flower geometry, characters, equipment illustrations, sounds, and branding are generated in code. No accounts, asset CDNs, or game servers are required.

## Run

Requires Node.js 22.12+ (verified with Node 24).

```sh
npm install
npm run dev
```

Open http://localhost:5173. For a production bundle, run `npm run build`; `npm run preview` serves the result.

## Play

WASD / arrows move; Space jumps. Hold the left mouse button over the world to collect pollen from nearby flowers. Hold the right mouse button and drag to orbit; scroll to zoom.

Press E near a keeper, merchant, or dispenser. Press F near your hive to convert pollen into honey; movement or F interrupts conversion. Q opens the quest journal, Tab the inventory, H the hive, M the mountain map, and Escape closes menus or pauses the game.

Start with one Bumble Bee, an extra egg, five treats, and three hive slots. Visit Juniper beside Dandelion Lawn for the first quest. Gather flowers, return to your hive, make honey, then visit the Supply Co. for a bigger bag or collector. Hatch your spare egg in the hive panel. Five bees open the first mountain trail; later trails require 10, 15, 25 and 35 bees.

The game saves to this browser after transactions, every 15 seconds, and when the page is hidden. Settings includes manual save and a confirmed reset. Storage is local to the browser and origin; private browsing or clearing site data can erase progress. Settings also offers volume, mute, camera sensitivity and lighter graphics.

## Implemented systems

- 17 flower fields with 225 individually depleted and regenerating flowers each; branching mountain terraces and walkable ramps.
- Blocky animated beekeeper, gravity, jumping, terrain/wall/fence/gate collision and a following third-person camera.
- 32 original bee species across six rarities; independently timed flower search, flight, collection, following, combat, hive return and energy recovery.
- Spatial collector patterns, red/blue/white preferences, 12 collectors, eight backpacks, boots and hats that affect simulation and character equipment.
- Continuous hive conversion; functional equipment and egg/consumable shops; hive slots, hatching, feeding/leveling and Royal Nectar transformations.
- Seven animal keepers and 35 event-driven quests, including repeatable final quests.
- Seven enemy types with patrol/chase/attack, damage, invulnerability, safe respawn, bee attacks, loot and enemy respawn timers.
- Expiring collectible ability tokens and timed haste, focus, color, attack, critical, conversion and pollen buffs.
- Field booster, treat dispenser, daily honey reward and a timed pollen sprint; contextual interaction prompts and world map.
- Versioned, validated local saves; offline cooldown restoration; sound effects synthesized with Web Audio.

Rendering and simulation are separate. Static procedural scenery is merged by material; flowers use GPU instancing. Low graphics disables shadows and lowers pixel density. No GPU performance claim is made from cloud software rendering.

## Checks

```sh
npm test
npm run build
npm run test:browser
```

Vitest exercises resource limits, conversion conservation, gathering and regeneration, purchases, hive progression, quests, combat rewards, gate requirements, connected ramps and invalid-save recovery. Playwright drives the application in Chromium. The cloud test configuration uses `/usr/bin/chromium` with software WebGL; set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to another Chromium installation when needed.

## Scope notes

This is an original standalone game, not a reproduction of proprietary game assets or the exact Roblox map. It has a compact shared enemy behavior system, with a larger telegraphed area attack for bosses. The optional Ant Arena and a separate obstacle-course activity are not implemented. Saves are local; cloud sync and multiplayer are outside this project.

## Publish on GitHub Pages

The repository includes `.github/workflows/deploy-pages.yml`. This optional workflow can be started manually from GitHub Actions after Pages is enabled. It runs the simulation tests, builds the game, and deploys `dist/`. Vercel is the primary automatic deployment for pushes to `main`.

In the repository's **Settings → Pages**, choose **GitHub Actions** as the build source. After the deployment workflow completes, GitHub shows the live website URL. For `SSpyFix/bees`, the standard project URL is `https://sspyfix.github.io/bees/`.

Assets use relative paths so the game works under the repository subdirectory and on a custom domain. A private repository needs a GitHub plan that supports Pages for private repositories; alternatively the owner can choose to make it public. Repository visibility is never changed by this workflow.


## Publish on Vercel

Import the public GitHub repository `SSpyFix/bees` into Vercel, or connect it to an existing Vercel project. Use the repository root as **Root Directory**. The checked-in `vercel.json` selects the **Vite** framework, installs locked dependencies with `npm ci`, builds with `npm run build`, and publishes **dist**. No environment variables or backend services are required.

Pushes to `main` trigger the connected Vercel production deployment. A deployment marked **Blocked** must be reviewed in the Vercel dashboard; the repository cannot grant account access or override deployment approval. The existing project domain is `https://juuuuice.vercel.app/`; a newly imported project receives its own Vercel URL.
