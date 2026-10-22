# Bee Swarm Simulator rebuild

The user changed the goal from the original Pollen Peak specification to a full visual rebuild following current Bee Swarm Simulator, including newer areas and bees. Keep functioning gameplay and existing local progression. The supplied aerial image and bee-face sheet guide the reconstruction.

- [x] Replace generated bee names with the 46-species roster, six rarity groups, explicit species statistics and procedural portraits shared by world models and UI.
- [x] Replace woodland presentation with strong green terrain, cyan studded boundary walls, six claimable golden hives, actual field/NPC/shop names, giant mushrooms and flowers, headquarters and cannons.
- [x] Replace parchment HUD with rectangular counters, toolbar, square portraits and hotbar. Retain inventory, shop, quest, hive, map and settings actions.
- [x] Update starter equipment, 25-slot hives, Basic Egg rarity distribution and preserve old saves.
- [x] Add functional HQ merchants, cannon flight, ticket rewards and Ticket Tent event-bee purchases. Give equipment and enemies distinct procedural models.
- [x] Verify core browser interactions, correct hive-wall camera obstruction and retain connected gated terrain.
- [x] Finish final test pass: 44 Vitest tests, nine Chromium gameplay scenarios, successful production build and screenshot inspection.
- [ ] Publish the verified production revision.

## Comparison with the original request

Working systems retained: 17 fields / 3,825 individually depleted and regenerating flowers; position-dependent collector patterns; independent bee flight/search/gather/combat/rest; capped bags; continuous pollen/honey conversion; purchasable and equippable gear; hatching, hive expansion, feeding, leveling and Royal Jelly; seven NPCs / 35 event-driven quests; enemies, damage, loot, ability tokens and buffs; dispensers, repeatable challenge, settings and validated browser saves.

Replaced in this revision: original invented identity, bee roster and face art, soft map treatment, single fixed hive, repeated collector silhouettes, shared enemy model, decorative HQ/cannons, generic global Field Dice bonus and inaccurate Event/Mythic Basic Egg outcomes.

Remaining limitations: the live Roblox map dimensions, complete quest chains, exact equipment economy, gifted/mutation mechanics and full per-species abilities are not reproduced exactly. Robo Bear, planters, crafting, Ant Challenge, a dedicated obstacle course, multiplayer and cloud accounts are not implemented. Bear/Digital/Gummy/Vicious/Windy acquisition paths remain incomplete; the six Ticket Tent species can be earned and bought. Existing quest chains and combat are functional simplified versions. No claim of complete current-game 1:1 parity is justified by the available references.
