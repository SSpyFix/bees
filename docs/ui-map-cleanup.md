# Current UI restoration and map bee cleanup

The initial map import used local base `7dac33f`; the published game had advanced to `b0c6c22` in a separate checkout. The local map preview therefore retained the older HUD and menus. GitHub was fetched without resetting the working tree, and the published reference UI was restored around the imported map and current local progression.

Restored compact resource counters, white icon toolbar, reference font, narrow side panels, yellow bee cards, full 3D shop previews and shop overlay behavior. Kept the map-aware minimap, badges, guild/crafting, rare eggs, materials and sprinklers. Compatibility support preserves increasing item prices, bulk purchase totals, auto-jelly filters/cancellation, and large saved inventories. Current front-only bee faces are restored without the old added ornaments.

The source export contained 42 `Bee<number>` rigs (95 geometry parts including wings/accessories) and 42 visible prefilled hive portraits. Conversion now excludes those rigs and clears hive-cell artwork, preserving gate monuments and empty hive geometry. Live hive portraits come from the actual saved swarm. Additional cells support bees 41–50.

Verification: 99 simulation/unit checks, six Node conversion/cleanup checks, Python converter fixtures and production build pass. Browser verification covered all 18 scenarios: 17 passed in the complete run; the movement check exposed a stale rounded-height assertion, which was corrected to compare landing against the actual terrain height, then passed in a focused rerun. The cleaned hive visual fixture verifies both two owned bees and all 50 owned bees, including ten added cells.

Independent reviews found the 40-cell clipping issue (fixed with a failing-then-passing regression); the UI review found no additional actionable functional issues. Changes remain local, with no commit, push or publication.
