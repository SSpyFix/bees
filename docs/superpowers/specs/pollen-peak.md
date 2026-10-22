# BUILD A COMPLETE 3D BEE SWARM-STYLE BROWSER GAME

You are an expert game developer, Three.js engineer, technical artist, UI designer, and gameplay systems programmer.

Your task is to **actually build a fully playable, polished, single-player 3D browser game inspired by Roblox Bee Swarm Simulator**, using publicly available wiki information and screenshots as visual and gameplay references.

Do not merely generate a plan, explain how to build it, create mockups, or produce a static scene. **Write the complete project code, run it, test it, fix errors, and deliver a playable game.**

Call the project **Pollen Peak**.

The gameplay should feel recognizably similar to Bee Swarm Simulator: a blocky character exploring a colorful mountain, a swarm of individually animated bees, collectible pollen, honey conversion, a customizable hive, eggs, quests, shops, enemies, tokens, increasingly difficult areas, and long-term progression.

Build original procedural models, materials, illustrations, audio, and branding. Use Bee Swarm Simulator screenshots and wiki pages to understand the design and gameplay, but do not ship ripped Roblox assets, copied textures, original music, or copyrighted character models.

## 1. Research the original game

Before implementation, inspect these references if browsing is available:

**Game information:**
- https://bee-swarm-simulator.fandom.com/wiki/Fields
- https://bee-swarm-simulator.fandom.com/wiki/Bees
- https://bee-swarm-simulator.fandom.com/wiki/Shops
- https://bee-swarm-simulator.fandom.com/wiki/Tools
- https://bee-swarm-simulator.fandom.com/wiki/Quest_Givers
- https://bee-swarm-simulator.fandom.com/wiki/Pollen
- https://bee-swarm-simulator.fandom.com/wiki/Buffs_%26_Debuffs
- https://beeswarmsimulatorwiki.com/wiki/mobs/
- https://beeswarmsimulatorwiki.com/wiki/royal-jelly/

**Visual references:**
- https://withthemetaverse.com/wp-content/uploads/2023/10/roblox-bee-swarm-simulator-codes1.jpeg
- https://pbs.twimg.com/media/FMPDdP-XoAEtnk3.jpg
- https://vignette.wikia.nocookie.net/bee-swarm-simulator/images/5/50/Wiki-background/revision/latest?cb=20200418002619

Search for additional reference images showing:
- Full mountain layout and hive area
- Each flower field
- Gates and ramps
- Hive honeycomb arrangement
- Bee models and their animations
- Shop interiors and exterior landmarks
- Backpack, pollen, honey, quests, and inventory UI

Use these references to develop a recognizable, cohesive world layout with original visual assets.

If browsing is unavailable, proceed using the detailed specification below. Never block development because a reference website is inaccessible.

## 2. Technology stack

Use:
- Vite
- TypeScript
- React
- Three.js
- React Three Fiber
- Drei
- Zustand or equivalent state management
- CSS for responsive game HUD
- Browser localStorage or IndexedDB for saves
- Vitest for unit testing
- Playwright for browser testing, if available

The game must run using:

`npm install`

`npm run dev`

And produce a deployable browser application using:

`npm run build`

It must be usable on ordinary desktop browsers without Roblox, Unity, a proprietary game engine, paid APIs, or any external account.

Use real 3D geometry, camera movement, animation, lighting, collision detection, and gameplay simulation. **Do not substitute a 2D map, top-down-only interface, or static illustration.**

Avoid unnecessary dependencies.

## 3. The 3D world and map

This is one of the most important requirements.

Build one large, interconnected mountain environment with the visual structure of Bee Swarm Simulator.

The world must contain:
- A wide starter area at the mountain base
- A row of claimable honeycomb hives
- Multiple flower fields containing individually collectible flowers
- Giant blocky mountains and cliffs
- Elevated grassy platforms
- Walkable paths and ramps between elevations
- Numbered progression gates
- Distinct shops and NPC locations
- White wooden fences, signs, mushrooms, trees, rocks, flowers, giant decorative props, and bridges
- A bright sky, sunlight, soft shadows, and distant scenery
- World boundaries and meaningful collision geometry

Make it look like a real Roblox-style 3D simulator world, with colorful low-poly geometry, not an empty plane with cubes.

### Map progression

Create approximately 17 main flower fields organized into connected areas.

**Starter area — no gate**
- Sunflower Field
- Dandelion Field
- Mushroom Field
- Blue Flower Field
- Clover Field
- Starting hives
- Basic shop
- Egg shop
- Starter quest characters

**5-bee area**
- Spider Field
- Bamboo Field
- Strawberry Field
- Additional quest NPC
- Small combat encounters

**10-bee area**
- Pineapple Patch
- Stump Field
- Improved equipment shop
- Science-themed NPC
- Raised platforms and pathways

**15-bee area**
- Cactus Field
- Pumpkin Patch
- Pine Tree Forest
- Rose Field
- Red-themed headquarters
- Stronger enemies and expanded quests

**25-bee area**
- Mountain Top Field
- Advanced equipment shop
- Mountain-top combat challenge
- Powerful pollen boosters

**35-bee area**
- Coconut Field
- Pepper Patch
- Endgame equipment and high-level challenges
- Special landmarks and activities

Also implement a separate optional challenge field, such as an Ant Arena, if it can be added without leaving core systems unfinished.

The real game's areas form branching mountain routes rather than six straight sequential rooms. Follow that structure. For example, the 5-bee region should branch toward the 10-bee and 15-bee areas, with higher paths ultimately leading toward the mountaintop.

### Map accuracy and visual design

Study the screenshots and recreate the *overall environmental language*:
- Square flower fields densely packed with colorful blossoms
- Strong green ground and gray cliff contrast
- Oversized mushrooms and flowers
- Blocky ramps built into mountain slopes
- Numerically labeled gates
- Colorful buildings
- A honeycomb hive wall
- Clearly visible landmarks from a distance
- A world with significant vertical height differences

Do not make every field a featureless flat square. Each should have distinct surroundings and landmarks.

Each region must be reachable on foot using properly connected paths, stairs, or ramps. Avoid floating or disconnected terrain.

Store field definitions, positions, bounds, biome properties, and entry requirements in reusable TypeScript data files.

## 4. Player movement and camera

Create an animated, blocky third-person beekeeper avatar with:
- Head, torso, arms, legs
- Walking and running animation
- Jumping and gravity
- Ground and wall collision
- Equippable pollen collection tools
- Visible backpack
- Character rotation toward movement direction

**Controls:**
- WASD: Movement
- Space: Jump
- Mouse: Rotate camera
- Mouse wheel: Zoom in/out
- Left-click/hold: Collect pollen
- E: Interact
- F: Convert at hive
- Q: Quest journal
- Tab: Inventory
- M: World map
- Esc: Settings/pause

Implement smooth third-person camera follow with wall-aware zoom and configurable sensitivity.

Prevent the avatar from falling through terrain or walking through solid obstacles.

## 5. Flower fields and pollen collection

Every field needs hundreds of collectible flowers.

Use InstancedMesh or equivalent GPU-friendly rendering for performance.

Each flower tile should have:
- Position
- Red, blue, or white classification
- Flower size
- Available pollen quantity
- Maximum pollen
- Regeneration rate
- Collection multiplier

Allow different field-specific distributions of flower colors and sizes.

When a player collects pollen:
1. Play a visible tool-swing animation.
2. Find nearby flower tiles within the tool's collection pattern.
3. Reduce their pollen values.
4. Update the backpack.
5. Show floating `+pollen` numbers.
6. Visually deplete affected flowers.
7. Gradually regenerate depleted flowers.

Collection must depend on the actual world position of the player and flowers, not simply increase a counter whenever clicking.

Different collectors must have different ranges, speeds, shapes, and color bonuses.

Pollen collection stops or is capped when the backpack is full. Show a clear notification.

## 6. Bees and hive system

Start the player with a basic bee and an owned hive.

Create a honeycomb-style hive panel with individual hexagonal bee slots.

Users must be able to:
- Open hive management
- View every owned bee
- Purchase additional hive slots
- Purchase or earn eggs
- Hatch eggs into empty slots
- Inspect bee statistics
- Feed bees
- Level bees up
- Reroll eligible bees with a royal-jelly-style item
- Equip or manage bees where appropriate

### Bee rarity system

Include these six rarity categories:
- Common
- Rare
- Epic
- Legendary
- Mythic
- Special/Event-style

Implement a substantial roster, ideally 30–46 distinct bees, using original names/designs where appropriate.

Every bee must have meaningful statistics:
- Gather amount
- Gather interval
- Movement speed
- Attack
- Conversion ability
- Energy
- Level
- Bond/XP
- Preferred pollen color
- Special ability
- Rarity

Do not make every bee mechanically identical with only different colors.

### Bee movement and AI

Bees must exist physically in the 3D world.

Implement a lightweight finite-state machine with:
- Following the player
- Searching for flowers
- Flying to flower tiles
- Gathering pollen
- Returning toward the player
- Attacking nearby enemies
- Returning to the hive
- Resting when energy is depleted

Bees should fly with smooth interpolation, hovering animations, independent timing, and slight differences in formation positions.

Avoid swarms stacking into one identical position.

Bee gathering contributes to the player's pollen.

Bee attacks must actually reduce enemy HP.

### Bee abilities

Build a working ability-token system with:
- Haste
- Focus
- Color boosts
- Pollen bombs
- Honey tokens
- Critical collection
- Rage/attack buffs
- Conversion bonuses
- Temporary collection multipliers

Tokens must appear visibly in the world, have expiration timers, and be collected when the player moves into them.

Display active buffs with durations in the HUD.

## 7. Honey conversion

Pollen and honey are separate currencies.

Pollen is stored in the backpack and honey is spent on upgrades.

At the hive:
1. The player approaches their hive.
2. A conversion prompt appears.
3. Pressing F starts conversion.
4. The character performs a conversion animation.
5. Stored pollen decreases at a rate based on the current equipment, bees, and upgrades.
6. Honey increases accordingly.
7. A visual honey-conversion effect plays.
8. Conversion finishes automatically when pollen reaches zero.

Players must be able to interrupt conversion.

Conversion upgrades should noticeably improve speed.

Never allow negative pollen, negative honey, or duplicated conversion rewards.

## 8. Shops, equipment, and economy

Build fully functional shops containing actual purchasable equipment.

Create several equipment tiers:
- Starter
- Basic
- Intermediate
- Advanced
- Mountaintop
- Endgame

**Collectors**
Implement approximately 10–15 distinct collectors, starting with a basic scooper and progressing toward more powerful rake, magnet, bubble, scythe, staff, and wand-style tools.

**Backpacks**
Implement increasing capacities, from a tiny starter pouch to a large endgame container.

**Other equipment**
Include boots, hats, guards, and passive upgrades when possible.

Every item must have:
- Unique ID
- Name
- Description
- Cost
- Prerequisites
- Statistics
- Visible icon or procedural illustration
- Buy action
- Ownership state
- Equip action

Shops must prevent buying items without sufficient funds.

Purchased gear must influence actual gameplay rather than merely change displayed numbers.

Use a configurable economy with increasing egg prices, hive-slot costs, gear costs, and rewards. Balance the early game so progress feels rewarding within the first 10–20 minutes while later upgrades provide longer-term goals.

Do not use real-money purchases.

## 9. Quests and NPCs

Populate the world with multiple original bear-like or animal-themed quest characters inspired by the roles in Bee Swarm Simulator.

At minimum include:
- Beginner pollen quest giver
- Repeatable resource quest giver
- Bee-leveling quest giver
- Combat quest giver
- Scientific/research quest giver
- Midgame progression quest giver
- Endgame quest giver

NPCs need recognizable 3D models, idle animations, interaction areas, and dialogue UI.

Quest objectives must support:
- Collecting pollen
- Collecting specific colored pollen
- Collecting pollen in specific fields
- Defeating specific enemies
- Hatching bees
- Leveling bees
- Gathering tokens
- Spending or earning honey

Implement at least 30 complete quests across these NPCs, including repeatable quests.

Each quest requires:
- Unique ID
- Quest giver
- Dialogue
- Prerequisites
- Objectives
- Progress tracking
- Completion conditions
- Claimable rewards
- Next quest or repeat rules

Quests must progress from actual gameplay events, not fake timers.

Allow several accepted quests simultaneously. One collection action may count for multiple quests when applicable.

Quest rewards should include honey, eggs, treats, crafting materials, and consumables.

## 10. Enemies and combat

Create several hostile enemy types:
- Ladybug-like insect
- Beetle-like enemy
- Spider
- Mantis
- Scorpion
- Wolf-like field guardian
- Large field boss

Use original stylized models.

Each enemy needs:
- HP
- Attack damage
- Detection radius
- Movement behavior
- Attack cooldown
- Level
- Respawn timer
- Reward table

Enemies should patrol or defend their fields.

When a player enters an enemy's detection range, it can chase and attack.

The player's bees automatically engage enemies within combat range.

Show:
- Enemy health bars
- Hit animations
- Damage numbers
- Death animation
- Dropped loot tokens
- Respawn indicators where useful

Implement player HP, knockback or brief hit invulnerability, death, and safe respawning at the hive.

Bosses should have multiple attacks and meaningful rewards.

## 11. World interactions and activities

Add functional versions of:
- Field boosters
- Egg dispenser
- Treat dispenser
- Inventory item usage
- Collectible honey tokens
- Resource pickups
- Bee gates
- Simple obstacle course
- Daily/repeatable reward
- One timed combat or pollen challenge
- World map with current player position

Interactions must show contextual prompts and provide feedback.

Bee-count gates need real requirements. Locked gates should show the required number of bees and prevent access until unlocked.

## 12. User interface

Create an attractive game-like HUD, not a generic developer dashboard.

The interface should contain:

**Top HUD**
- Honey counter with formatted values
- Pollen counter and maximum capacity
- Animated capacity bar
- Optional collection-per-second indicator

**Left side**
- Current quest summary
- Expandable quest journal
- Objective progress bars

**Bottom**
- Tool and item hotbar
- Selected item
- Interaction hints

**Other interface**
- Inventory
- Hive management
- Bee information
- Shop menu
- NPC dialogue
- Settings
- World map
- Notifications
- Buff indicators

Use a cheerful, readable design with rounded panels, bright accents, recognizable icons, subtle gradients, and smooth transitions.

Support 16:9 desktop resolutions and adapt reasonably to smaller browser windows.

Do not allow UI menus to prevent character controls from resuming after they close.

## 13. Graphics and polish

Visual quality matters.

Use:
- Soft shadows
- Ambient and directional lighting
- Bright sky gradient
- Ambient particles
- Hovering bees
- Animated flower collection
- Honey-colored particle trails
- Floating rewards
- Collectible token animations
- Tool swing animations
- NPC idle animations
- Health and pollen feedback
- Subtle environmental movement

Create procedural low-poly models for objects such as:
- Sunflowers
- Mushrooms
- Pine trees
- Bamboo
- Cacti
- Honeycomb hive panels
- Buildings
- Shop signs
- Wooden fences
- Bees
- Bugs
- Backpacks

Use original generated geometry rather than leaving everything as plain boxes.

Optional sound should use original synthesized effects or properly licensed assets. Provide mute and volume controls.

Optimize for approximately 60 FPS on a typical desktop, with a graceful reduction of detail for weaker hardware.

## 14. Save system

Implement persistent offline saves.

Persist:
- Honey
- Owned bees
- Bee levels and bond
- Hive slots
- Tools and equipment
- Pollen and backpack
- Unlocked areas
- Inventory
- Accepted and completed quests
- Enemy respawn timers, where appropriate
- Statistics
- Settings

Use versioned save data with migration support.

Autosave after important actions and at regular intervals.

Include manual save and reset-save functionality with confirmation.

Reloading the browser should restore meaningful progression, not restart the game.

Validate imported or loaded data to prevent corrupted saves from breaking the game.

## 15. Architecture

Use a modular folder structure such as:

`src/game/world/`

`src/game/player/`

`src/game/bees/`

`src/game/flowers/`

`src/game/combat/`

`src/game/economy/`

`src/game/quests/`

`src/game/systems/`

`src/game/data/`

`src/components/hud/`

`src/components/menus/`

`src/assets/`

`src/tests/`

Keep rendering, simulation logic, world data, economy, and UI separated.

Use deterministic or testable pure functions for important economy and progression calculations.

Avoid putting all game logic inside one React component.

Clean up Three.js resources and event listeners correctly.

Use a fixed or well-controlled simulation timestep where appropriate.

## 16. Implementation order

Work in these stages, but continue implementing rather than stopping after each stage.

**Stage A — Playable foundation**

Set up the project and render a 3D world. Implement the character, camera, collisions, starter field, one hive, pollen collection, and honey conversion.

Immediately verify that the gather → convert → upgrade loop works.

**Stage B — World construction**

Build all mountain regions, fields, landmarks, gates, terrain, and paths. Ensure all reachable areas connect properly.

**Stage C — Swarm and economy**

Implement bee behavior, egg hatching, hive slots, equipment shops, and progression.

**Stage D — Gameplay systems**

Implement NPC quests, enemies, combat, loot tokens, consumables, buffs, and special activities.

**Stage E — Polish and verification**

Improve the UI, sound, animations, performance, persistence, and gameplay balance.

Do not use future stages as an excuse to leave earlier features as placeholders.

If time or context is constrained, finish complete vertical slices rather than creating numerous fake UI buttons.

## 17. Automated and manual testing

Create tests for:
- Pollen never exceeding capacity
- Honey conversion
- Buying and equipping tools
- Insufficient funds
- Egg hatching
- Hive slot purchases
- Bee leveling
- Quest completion
- Enemy death and rewards
- Locked and unlocked gates
- Save/load round trips
- Correct flower regeneration

Use Playwright when available to launch the application and perform browser tests.

Verify that:
1. The page loads without console errors.
2. The character can move and jump.
3. The camera can orbit and zoom.
4. The player can gather pollen.
5. Bees autonomously gather pollen.
6. The player can return to the hive and convert pollen.
7. Honey increases.
8. A shop purchase reduces honey and equips the item.
9. An egg can hatch a bee.
10. The additional bee follows the player.
11. An NPC quest can be completed and claimed.
12. Enemies can be defeated by bees.
13. Locked gates refuse entry.
14. Sufficient bees unlock new areas.
15. Saving and reloading preserves progress.

Fix discovered runtime or build errors rather than merely reporting them.

## 18. Important restrictions

DO NOT:
- Deliver a static demo instead of a game.
- Create a generic webpage with collection buttons.
- Substitute a 2D illustration for the 3D world.
- Use placeholders saying "coming soon" for core mechanics.
- Make bees decorative followers only.
- Make shops decorative buildings only.
- Make NPC quests unfinishable.
- Let the player walk through walls or locked gates.
- Require Roblox.
- Require paid services.
- Depend on unavailable third-party game assets.
- Stop after generating a project outline.
- Claim features work without implementing them.

## 19. Definition of done

The game is complete when a player can:

Start in the hive area, hatch or use their first bee, move around a visually detailed mountain, collect pollen from real flower tiles, watch bees work autonomously, return to the hive, convert pollen into honey, purchase improved tools and bags, expand the hive, acquire stronger bees, complete NPC quests, battle enemies, collect ability tokens, unlock progressively higher fields, and save their progress.

The result should feel like a substantial standalone browser game, not a prototype.

Prioritize coherent gameplay, a well-constructed 3D map, responsive controls, and real working systems over an excessive quantity of shallow features.

## 20. Start now

Inspect the current repository.

If empty, initialize the project.

Implement all required files directly in the workspace. Run the app, test it, make corrections, and continue until the primary gameplay loop and all major systems work together.

When finished, provide:
- Brief instructions to run the game
- The local development URL
- A summary of implemented features
- Any remaining limitations, without falsely claiming full completion

**Begin implementing the actual game now. Do not respond with only a plan.**