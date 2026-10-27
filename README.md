# Bee Swarm Simulator — browser recreation

A playable single-player browser recreation, rebuilt around the Bee Swarm map, bee roster and interface references. Models, species face drawings, flower geometry, equipment illustrations and audio are generated in code. No Roblox installation, asset CDNs, accounts or game servers are required.

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

Start with one Basic Bee, a Scooper, a 200-pollen Pouch, an extra egg, five treats, and 25 hive slots. Visit Black Bear beside Dandelion Field for the first quest. Gather flowers, return to your claimed hive, make honey, then visit the Basic Shop for a bigger bag or collector. Hatch your spare egg in the hive panel. Five bees open the first mountain trail; later trails require 10, 15, 25 and 35 bees.

The game saves to this browser after transactions, every 15 seconds, and when the page is hidden. Settings includes manual save and a confirmed reset. Storage is local to the browser and origin; private browsing or clearing site data can erase progress. Settings also offers volume, mute, camera sensitivity and lighter graphics.

## Implemented systems

- 17 flower fields with 225 individually depleted and regenerating flowers each; branching mountain terraces and walkable ramps.
- Blocky animated beekeeper, gravity, jumping, terrain/wall/fence/gate collision and a following third-person camera.
- 46 named bee species across six rarities, with distinct square face drawings and explicit stats; independently timed flower search, flight, collection, following, combat, hive return and energy recovery.
- Spatial collector patterns, red/blue/white preferences, 19 collectors, eight backpacks, boots and hats that affect simulation and character equipment.
- Six claimable hives with persistent ownership and continuous hive conversion; functional equipment, HQ, egg/consumable and Ticket Tent shops; hive slots, hatching, feeding/leveling and Royal Jelly transformations.
- Seven named quest givers and 35 event-driven quests, including repeatable final quests.
- Eight enemy types with distinct procedural silhouettes, patrol/chase/attack, damage, invulnerability, safe respawn, bee attacks, loot and enemy respawn timers.
- Species-specific ability tokens, persistent field effects, gifted hive bonuses, and timed stackable boosts.
- Field Dice boosts a selected field; two working cannon flight routes; earned tickets, six unique Event-bee purchases, field booster, treat dispenser, daily honey reward and a timed pollen sprint; contextual interaction prompts and world map.
- Versioned, validated local saves; offline cooldown restoration; sound effects synthesized with Web Audio.

Rendering and simulation are separate. Static procedural scenery is merged by material; flowers use GPU instancing. Low graphics disables shadows and lowers pixel density. No GPU performance claim is made from cloud software rendering.

## Checks

```sh
npm test
npm run build
npm run test:browser
```

The original rebuild included 44 simulation tests and nine Chromium gameplay scenarios; the 1.1 update adds Royal Jelly, bulk purchase, gifted, and ability regression coverage. Vitest exercises resource limits, conversion conservation, gathering and regeneration, purchases, hive progression, quests, combat rewards, gate requirements, connected ramps and invalid-save recovery. Playwright drives the application in Chromium. The cloud test configuration uses `/usr/bin/chromium` with software WebGL; set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to another Chromium installation when needed.

## Scope notes

This is a standalone browser recreation, not the official Roblox client. It is not yet a verified complete 1:1 of the live game: map dimensions, quest chains, economy and many species abilities remain simplified. The 46-bee roster includes the six Mythic bees and newer Event bees, including Digital Bee. It has a compact shared enemy behavior system, with a larger telegraphed area attack for bosses. Robo Bear, planters, crafting, mutation mechanics, the optional Ant Arena and a separate obstacle-course activity are not implemented. Five Event bees (Bear, Digital, Gummy, Vicious and Windy) appear in the index but their acquisition systems are not yet implemented. Saves are local; cloud sync and multiplayer are outside this project.

## Publish on GitHub Pages

The repository includes `.github/workflows/deploy-pages.yml`. This optional workflow can be started manually from GitHub Actions after Pages is enabled. It runs the simulation tests, builds the game, and deploys `dist/`. Vercel is the primary automatic deployment for pushes to `main`.

In the repository's **Settings → Pages**, choose **GitHub Actions** as the build source. After the deployment workflow completes, GitHub shows the live website URL. For `SSpyFix/bees`, the standard project URL is `https://sspyfix.github.io/bees/`.

Assets use relative paths so the game works under the repository subdirectory and on a custom domain. A private repository needs a GitHub plan that supports Pages for private repositories; alternatively the owner can choose to make it public. Repository visibility is never changed by this workflow.

## Publish on Vercel

Import the public GitHub repository `SSpyFix/bees` into Vercel, or connect it to an existing Vercel project. Use the repository root as **Root Directory**. The checked-in `vercel.json` selects the **Vite** framework, installs locked dependencies with `npm ci`, builds with `npm run build`, and publishes **dist**. No environment variables or backend services are required.

Pushes to `main` trigger the connected Vercel production deployment. A deployment marked **Blocked** must be reviewed in the Vercel dashboard; the repository cannot grant account access or override deployment approval. The existing project domain is `https://juuuuice.vercel.app/`; a newly imported project receives its own Vercel URL.

## Bee abilities and gifted update (1.1)

Every species now has its own ability set in the bee index and Hive panel. Basic and Brave have no normal tokens. Token Link collects other tokens in the same field (excluding other links); colored bombs, stackable boosts, Focus, Rage, Melody, Baby Love, and spatial pollen/honey marks have distinct effects. Mythic bees use balloons, flower pollination, target practice, flames and summoned Fire Bees, frogs and bubbles, or triangulation. Event abilities include morphs, pulses and bomb sync, corruption and hacking, festive gifts, goo, beams, fetch, Tabby Love, spikes, clouds, and tornadoes. Effects use the browser game's map scale and economy; timings, geometry, summoned helpers, balloons, and rewards are adaptations rather than a verified exact recreation of the live Roblox simulation. Beequips, mutations, Digital Bee drives, and multiplayer ability sharing are outside this update.

Gifted bees have 1.5× gathering, conversion, and attack, a species-specific hive bonus (duplicate gifted species do not stack), Inspire, and applicable gifted abilities. A star appears in the hive and above the bee. Royal Jelly can roll gifted Rare, Epic, Legendary, and Mythic bees; Basic Eggs can also hatch gifted bees. Star Treats cost 1,000 tickets at the Ticket Tent and can make any bee gifted without changing species or level. The existing six Event-bee acquisition offers are retained.

Consumable purchase quantities are 1, 10, 100, 1,000, 10,000, 100,000, and 1,000,000, plus Buy max. The shop charges the exact displayed total at its existing unit prices and rejects orders that cannot be paid in full. Inventories retain up to one trillion of each item across reloads.

Settings → Auto Royal Jelly has a rarity selector and a Require gifted checkbox. With both selected, the result must match both requirements: Legendary + gifted means exactly a gifted Legendary; Mythic + gifted means a gifted Mythic. With no filters, using Royal Jelly spends one. Auto mode rolls in bounded batches, displays its consumption and remaining stock, and can be stopped in Hive or Settings. It stops on the first matching roll or when stock runs out, keeps the last result, and never resumes spending automatically after a reload. Rerolls keep level and bond, reroll gifted status, and cannot transform Event bees.

Royal Jelly rarity probabilities are 69.996% Rare, 27% Epic, 3% Legendary, and 0.004% Mythic. Each roll independently has a 0.4% gifted chance. Therefore a Mythic averages 25,000 RJ, a gifted Legendary approximately 8,333 RJ, and a gifted Mythic 6,250,000 RJ; none is guaranteed at its average. References: [Royal Jelly](https://beeswarmsimulatorwiki.com/wiki/royal-jelly/), [ability tokens](https://beeswarmsimulatorwiki.com/wiki/ability-tokens/), [gifted bonuses](https://bee-swarm-simulator.fandom.com/wiki/Gifted_Bee?page=1).

Existing version 1/2 local saves are migrated in place. Gifted flags, filter preferences, random sequence, Tabby Love, Star Treats, and balloon cargo persist. Temporary ability effects expire on reload; balloon cargo is retained at the hive.

## Reference UI revamp

The HUD uses compact Honey/Pollen counters, silhouette tabs, a local Hammersmith One font, and outlined item icons. Inventory and quests open in narrow scrolling panels; quest progress uses green over red rows. Bee detail cards use the yellow layout and expose stats, abilities, gifted bonuses, feeding, and jelly controls.

Equipment shops and the egg dispenser now show a large preview, blue item description/stats card, previous/next arrows, direct item selectors, and purchase/equip status. Drag 3D previews to inspect them. Opening a sidebar keeps the selected shop and quantity behind it; Escape returns to shopping and E leaves. Shop failures appear inline. Inventory Royal Jelly opens Hive selection before any jelly is spent. The layout also adapts to narrow screens. Artwork and models are drawn procedurally; the bundled font includes its OFL license.

## 1.1.1 — Bee appearance update

All 46 faces were redrawn from the supplied reference sheet, with matching species colors shared by the index, hive, and 3D models. Bee faces are visible on the front and top surfaces. Species details include Frosty's top hat, Carpenter's hammer, Demon horns, Diamond's crystal, Lion's mane, Ninja's headband, Buoyant's balloon, Spicy's exhaust pipes, animal ears, Digital's antenna, Festive's ribbon, Vicious spikes, and other distinctive shapes. These are local vector and mesh recreations; no remote asset downloads are required during play. Existing bee IDs, abilities, stats, gifted state, and saved progression remain compatible.
