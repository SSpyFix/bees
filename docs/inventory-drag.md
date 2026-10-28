# Inventory and world UI update

Inventory rows with owned items can be dragged with the mouse. Drop an item onto hotbar slots 2–0 to create a saved shortcut. Slot 1 always holds the equipped tool. Right-click another slot to clear its shortcut. Number keys activate the matching slot; inventory and other menus remain available through their toolbar icons and existing letter shortcuts.

Treats, fruit, Royal Jelly, Star Jelly, and Star Treats can also be dragged from inventory or the hotbar onto an owned bee portrait on the physical hive. The hovered portrait gets a yellow outline. Releasing opens a confirmation naming the bee, level, and hive slot. Cancelling consumes nothing. Confirming uses one item on that bee; a single Royal Jelly confirmation does not start auto-jelly. Clicking a bee item shortcut instead offers a bee selector.

HTML drag events bridge to a Three.js raycast against the live hive portraits. No imported decorative bee can receive items. Dragging and confirmation clear movement/gather input. Ephemeral drag and confirmation state is separate from saved game data. Saved hotbar assignments are validated during restoration; existing saves get the default assignments.

Removed permanent claim/owned-hive world panels. World names and pollen/reward numbers now use compact outlined text without opaque plates. The hotbar uses a centered viewport-wide container and responsive slot widths.

Regression coverage is in `src/tests/item-drag.test.ts` and `tests/item-drag.spec.ts`, including real mouse drags, a specific second hive bee, cancellation, one-item consumption, tool slot protection, persistence, and centering at widths 1100, 823, 390, and 320.
