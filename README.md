# Bee Swarm Simulator — browser recreation

A playable single-player browser recreation using the supplied Roblox map export, with browser-native gameplay, bee portraits, equipment illustrations and audio. Converted map geometry and textures are served locally with the game. No Roblox installation, account or game server is required.

## Run

Requires Node.js 24.

```sh
npm install
npm run dev
```

Open http://localhost:5173. For a production bundle, run `npm run build`; `npm run preview` serves the result.

## Play

WASD / arrows move; Space jumps. Hold the left mouse button over the world to collect pollen from nearby flowers. Hold the right mouse button and drag to orbit; scroll to zoom.

Press E near a keeper, merchant, or dispenser. Press F near your hive to convert pollen into honey; movement or F interrupts conversion. Q opens the quest journal, Tab the inventory, H the hive, B the 46-bee index, M the world map, and Escape closes menus or pauses the game.

Start with one Basic Bee, a Scooper, a 200-pollen Pouch, an extra egg, five treats, and 25 hive slots. Visit Black Bear west of the hive grounds for the first quest. Gather flowers, return to your claimed hive, make honey, then visit the Basic Shop for a bigger bag or collector. Hatch your spare egg in the hive panel. Five bees open the first mountain trail; later trails require 10, 15, 25 and 35 bees.

The game saves to this browser after transactions, every 15 seconds, and when the page is hidden. Settings includes manual save and a confirmed reset. Storage is local to the browser and origin; private browsing or clearing site data can erase progress. Settings also offers volume, mute, camera sensitivity and lighter graphics.

If you get stuck, open Settings and click **Reset character to spawn**. This returns your character to the starting area and keeps your bees, honey, pollen, inventory, and quests.

## Implemented systems

- 17 flower fields with 12,206 individually depleted and regenerating flower tiles at measured map locations; imported terrain and rebuilt upper-area trails.
- Blocky animated beekeeper, gravity, jumping, terrain/wall/fence/gate collision and a following third-person camera.
- 46 named bee species across six rarities, with distinct square face drawings and explicit stats; independently timed flower search, flight, collection, following, combat, hive return and energy recovery.
- Spatial collector patterns, red/blue/white preferences, 19 collectors, eight backpacks, boots and hats that affect simulation and character equipment.
- Five exported claimable hives with persistent ownership and continuous hive conversion; functional equipment, HQ, egg/consumable and Ticket Tent shops; hive slots, hatching, feeding/leveling and Royal Jelly transformations.
- Seven named quest givers and 35 event-driven quests, including repeatable final quests.
- Eight enemy types with distinct procedural silhouettes, patrol/chase/attack, damage, invulnerability, safe respawn, bee attacks, loot and enemy respawn timers.
- Version 1.1.2 icon tokens, ground marker posts, reference bee faces and camera interpolation; species abilities including balloons, frogs, flames, targets, pollination and token links.
- Gifted bees and hive bonuses, typed eggs, bulk purchases, configurable auto-jelly, draggable inventory items, saved hotbar shortcuts and confirmation before applying items to a bee.
- Earned badges, purchasable sprinklers, crafting recipes and a Blender queue with cancellation refunds.
- Field Dice boosts a selected field; two working cannon flight routes; earned tickets, six unique Event-bee purchases, field booster, treat dispenser, daily honey reward and a timed pollen sprint; contextual interaction prompts and world map.
- Versioned, validated local saves; offline cooldown restoration; sound effects synthesized with Web Audio.

Rendering and simulation are separate. Converted map scenery is batched into a GLB; flowers use GPU instancing. Low graphics disables shadows and lowers pixel density. Collision uses a spatial triangle index. See [map import notes](docs/map-import.md) for rebuilt connections, unavailable assets and regeneration commands.

## Checks

```sh
npm test
npm run build
npm run test:browser
```

Vitest covers resource conservation, progression, gathering, collision layers, imported gates and trails, interactions and save migration. Playwright covers the imported world and gameplay in Chromium. `npm run test:map-geometry` checks decal orientation and doorway conversion; the Python converter also has XML and transform fixtures. The cloud browser configuration uses `/usr/bin/chromium` with software WebGL; set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to another Chromium installation when needed.

## Scope notes

This is a standalone browser recreation, not the official Roblox client. It is not yet a verified complete 1:1 of the live game: map dimensions, quest chains, economy and many species abilities remain simplified. The 46-bee roster includes the six Mythic bees and newer Event bees, including Digital Bee. It has a compact shared enemy behavior system, with a larger telegraphed area attack for bosses. Robo Bear gameplay, planters, mutations, the optional Ant Arena and a separate obstacle-course activity are not implemented. Five Event bees (Bear, Digital, Gummy, Vicious and Windy) appear in the index but their acquisition systems are not yet implemented. Saves are local; cloud sync and multiplayer are outside this project.

## Publish on GitHub Pages

The repository includes `.github/workflows/deploy-pages.yml`. This optional workflow can be started manually from GitHub Actions after Pages is enabled. It runs the simulation tests, builds the game, and deploys `dist/`. Vercel is the primary automatic deployment for pushes to `main`.

In the repository's **Settings → Pages**, choose **GitHub Actions** as the build source. After the deployment workflow completes, GitHub shows the live website URL. For `SSpyFix/bees`, the standard project URL is `https://sspyfix.github.io/bees/`.

Assets use relative paths so the game works under the repository subdirectory and on a custom domain. A private repository needs a GitHub plan that supports Pages for private repositories; alternatively the owner can choose to make it public. Repository visibility is never changed by this workflow.

## Publish on Vercel

Import the public GitHub repository `SSpyFix/bees` into Vercel, or connect it to an existing Vercel project. Use the repository root as **Root Directory**. The checked-in `vercel.json` selects the **Vite** framework, installs locked dependencies with `npm ci`, builds with `npm run build`, and publishes **dist**. No environment variables or backend services are required.

Pushes to `main` trigger the connected Vercel production deployment. A deployment marked **Blocked** must be reviewed in the Vercel dashboard; the repository cannot grant account access or override deployment approval. The existing project domain is `https://juuuuice.vercel.app/`; a newly imported project receives its own Vercel URL.

## Transport cannons

Approach a cannon and press **E** (or click its interaction button). Red launches to Mountain Top and requires 25 discovered bee types plus 25 bees for the destination gate. Yellow returns to spawn after discovering 12 types; Blue launches to Clover after discovering 16 types. Discoveries persist across transformations and reloads. The cannons share a five-second cooldown. Old saves start their discovery record from their current swarm.

Yellow and Blue have rebuilt launchers near Science Bear and the Pine/Rose approach in this converted map. Their routes use the browser game's controlled flight arc; steering/gliders and exact Roblox launch physics are not implemented.

## Admin tools and menus

In Settings, enter `4321` under **Admin code**. The top-right admin panel has independent 10× pollen and honey toggles, an egg selector with a Gifted option, and **+999 crafting materials**. Granted eggs go to Inventory and use the normal hatch action; gifted eggs guarantee gifted status. Inventory and boost choices save locally. Enter the code again after reloading to reopen the controls.

WASD/arrows and jumping work while menus are open, including Settings. Typing in a text field or using a selector keeps those keystrokes out of character movement.

## Bee wandering

Idle bees choose independent nearby destinations with varied heights, brief pauses and local spacing. Walking draws the swarm into a loose trailing cluster; distant bees catch up, and teleports regroup them. Gathering, combat and hive resting still take priority. Rendered flight and turns ease between simulation updates.

Visual reference: [original-game field screenshots](https://thenerdstash.com/7-must-know-tips-to-grow-your-hive-fast-in-roblox-bee-swarm-simulator/). The browser simulation uses its own movement model.

## Hive slot purchases

Hives begin with 25 slots. At the Mountain Top Shop, select **Hive Slot** to buy one additional empty slot, up to 50. The first costs 3,000,000 honey, the second 7,750,000; later purchases use the published individual BSS prices. Buying capacity does not hatch a bee. Slot purchases require being at the shop with at least 25 bees. Existing purchased capacity is retained.

Price reference: [BSS hive slot table, slots 26–50](https://mobilematters.gg/roblox/get-more-bee-slots-bee-swarm-simulator).

The admin panel's **Unlock all shop items** button grants all equipment, 50 hive slots, the top sprinkler, and at least one of each shop consumable. It preserves your equipped gear; choose an unlocked item in its shop and select **Equip**. Admin-granted equipment can be equipped without bee-count, material or honey requirements. This ownership and permission save locally.

## Parachute and Glider

Buy the **Parachute** for 500,000 honey in the Pro Shop (10 bees), or the faster **Glider** for 5,000,000 honey in the Mountain Top Shop (25 bees). Purchasing equips the item; both ownership and selection save locally. Admin **Unlock all shop items** includes both.

Press Space to jump, then press Space again while airborne to deploy. WASD/arrows steer; with no direction held, you continue forward. Press Space again to fold, or land to close automatically. Deploying during a cannon launch exits its preset arc so you can steer yourself. Gliding does not bypass locked areas.

Original stats and controls: [Parachute](https://beeswarmsimulatorwiki.com/wiki/parachute/) and [Glider](https://beeswarmsimulatorwiki.com/wiki/glider/). Original glide speed/float values are converted at the imported map's 0.35 scale and are independent of walking speed buffs.
