import { test, expect, type Page } from "@playwright/test";
import map from "../src/game/data/imported-map.json" with { type: "json" };
const field = (id: string) => map.fields.find((f) => f.id === id)!;
const gate = map.gates.find((g) => g.bees === 5)!;
const saveKey = "pollen-peak-save-v2";
async function prepare(page: Page, seed: Record<string, unknown> = {}) {
  await page.addInitScript(
    ({ key, seed, mapVersion }) => {
      if (!localStorage.getItem(key))
        localStorage.setItem(
          key,
          JSON.stringify({
            version: 2,
            mapVersion: mapVersion,
            settings: { quality: "low", muted: true },
            ...seed,
          }),
        );
    },
    { key: saveKey, seed, mapVersion: map.version },
  );
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Bee Swarm Simulator", exact: true }),
  ).toBeVisible();
  await expect(page.locator('canvas[data-interactive="true"]')).toBeVisible({ timeout: 45000 });
  // Align the test movement axes with the world; the game opens in a diagonal overview.
  await page.mouse.move(500, 450);
  await page.mouse.down({ button: "right" });
  await page.mouse.move(576, 450, { steps: 4 });
  await page.mouse.up({ button: "right" });
}
async function travel(page: Page, position: { x: number; y: number; z: number }) {
  // Place fixtures exercise interactions at each imported landmark. Movement and
  // trail traversal are covered separately against the actual collision mesh.
  await page.addInitScript(({ version, key }) => {
    const next = sessionStorage.getItem("bss-test-position");
    if (!next) return;
    const saved = JSON.parse(localStorage.getItem(key)!);
    saved.position = JSON.parse(next); saved.mapVersion = version;
    localStorage.setItem(key, JSON.stringify(saved));
    sessionStorage.removeItem("bss-test-position");
  }, { version: map.version, key: saveKey });
  await page.evaluate((position) => sessionStorage.setItem("bss-test-position", JSON.stringify(position)), position);
  await prepare(page);
}
async function coord(page: Page, axis: "x" | "z") {
  return Number(
    await page
      .getByTestId("map-player")
      .getAttribute(axis === "x" ? "cx" : "cy"),
  );
}
async function move(
  page: Page,
  key: string,
  axis: "x" | "z",
  end: number,
  less: boolean,
) {
  await page.keyboard.down(key);
  try {
    if (less)
      await expect
        .poll(() => coord(page, axis), {
          timeout: 65000,
          intervals: [100, 150, 200],
        })
        .toBeLessThan(end);
    else
      await expect
        .poll(() => coord(page, axis), {
          timeout: 65000,
          intervals: [100, 150, 200],
        })
        .toBeGreaterThan(end);
  } finally {
    await page.keyboard.up(key);
  }
}
async function amount(page: Page, id: string) {
  return Number((await page.getByTestId(id).innerText()).replaceAll(",", ""));
}

test("keeps the published compact UI and inventory overlays over the same 3D shop", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", e => errors.push(e.message));
  await prepare(page, { position: map.places.shop, honey: 10000 });
  await expect(page.locator(".quest-tracker")).toHaveCount(0);
  await expect(page.locator(".top-hud")).toHaveCSS("height", "28px");
  await expect(page.getByRole("button", { name: "Show badges" })).toBeVisible();
  await page.screenshot({ path: "test-results/current-ui-world.png" });
  await page.keyboard.press("e");
  await page.getByRole("button", { name: "View Rake", exact: true }).click();
  await expect(page.locator(".shop-stage canvas")).toBeVisible();
  await page.getByRole("button", { name: "Show inventory", exact: true }).click();
  await expect(page.locator(".ui-inventory .modal")).toBeVisible();
  await expect(page.locator(".ui-shop.shop-background")).toBeVisible();
  await expect(page.locator(".shop-detail-card h3")).toHaveText("Rake");
  await page.screenshot({ path: "test-results/current-ui-shop-inventory.png" });
  await page.keyboard.press("Escape");
  await expect(page.locator(".ui-inventory")).toHaveCount(0);
  await expect(page.locator(".shop-detail-card h3")).toHaveText("Rake");
  await page.keyboard.press("e");
  await expect(page.locator(".shop-experience")).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("loads the 3D world, moves, jumps, orbits, zooms and resumes after menus", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await prepare(page);
  await page.screenshot({ path: "test-results/pollen-peak-world.png" });
  const startZ = await coord(page,"z");
  await move(page, "w", "z", startZ - 2, true);
  const ground = await page.evaluate(async () => {
    const { useGame } = await import("/src/game/systems/store.ts");
    const { surface } = await import("/src/game/world/terrain.ts");
    const p = useGame.getState().game.player;
    return surface(p.x, p.z, p.y) ?? p.y;
  });
  await page.keyboard.press("Space");
  await expect.poll(async () => Number(await page.getByTestId("player-height").innerText())).toBeGreaterThan(ground + 0.5);
  await expect(page.getByTestId("player-height")).toHaveText(ground.toFixed(1));
  await page.mouse.move(600, 400);
  await page.mouse.down({ button: "right" });
  await page.mouse.move(690, 440, { steps: 10 });
  await page.mouse.up({ button: "right" });
  await page.mouse.wheel(0, -150);
  await page.keyboard.press("m");
  await expect(page.getByRole("heading", { name: "World Map" })).toBeVisible();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Show inventory", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Inventory" })).toBeVisible();
  await page.keyboard.press("Escape");
  await page
    .getByRole("button", { name: "Open settings", exact: true })
    .click();
  await page.getByRole("slider").first().focus();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  const z = await coord(page, "z");
  await move(page, "w", "z", z - 1, true);
  expect(errors).toEqual([]);
});

test("preserves the gather → quest → convert → purchase → hatch → save loop at imported landmarks", async ({
  page,
}) => {
  test.setTimeout(240000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await prepare(page, { position: map.places.juniper, honey: 2000 });
  await page.keyboard.press("e");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Accept quest", exact: true }).click();
  await page.keyboard.press("Escape");
  await travel(page, field("sunflower"));
  await expect(page.getByTestId("scene-status")).toHaveText("Sunflower Field");
  // No clicks: the first bee must independently choose a flower, fly there and gather.
  await expect
    .poll(() => amount(page, "pollen"), { timeout: 45000 })
    .toBeGreaterThan(0);
  await page.mouse.move(640, 440);
  await page.mouse.down();
  await expect
    .poll(() => amount(page, "pollen"), { timeout: 45000 })
    .toBeGreaterThanOrEqual(185);
  await page.mouse.up();
  await page.keyboard.press("q");
  await page.getByRole("button", { name: "Claim reward", exact: true }).click();
  await expect.poll(() => amount(page, "honey")).toBeGreaterThanOrEqual(150);
  await page.keyboard.press("Escape");
  await travel(page, map.hives[3]);
  await page.keyboard.press("f");
  await expect.poll(() => amount(page, "pollen"), { timeout: 60000 }).toBe(0);
  await expect.poll(() => amount(page, "honey")).toBeGreaterThan(2300);
  await travel(page, map.places.shop);
  await page.keyboard.press("e");
  await expect(
    page.getByRole("heading", { name: "Basic Shop", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "View Rake", exact: true }).click();
  const rake = page.locator(".item-card").filter({
    has: page.getByRole("heading", { name: "Rake", exact: true }),
  });
  await rake.getByRole("button").click();
  await expect(rake.getByRole("button")).toHaveText("✓ Equipped");
  await page.screenshot({ path: "test-results/pollen-peak-shop.png" });
  await page.keyboard.press("Escape");
  await page.keyboard.press("h");
  const count = await amount(page, "bee-count");
  await page
    .getByRole("button", { name: "Hatch an egg", exact: false })
    .click();
  await expect(page.getByTestId("bee-count")).toHaveText(String(count + 1));
  await page
    .getByRole("button", { name: "Feed a treat", exact: false })
    .click();
  await page.screenshot({ path: "test-results/pollen-peak-hive.png" });
  await page.keyboard.press("Escape");
  await page
    .getByRole("button", { name: "Open settings", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Save adventure", exact: true })
    .click();
  const saved = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    saveKey,
  );
  expect(saved.tool).toBe("tool-1");
  expect(saved.bees).toHaveLength(2);
  expect(saved.completed).toContain("juniper-0");
  expect(saved.honey).toBeGreaterThan(0);
  await page.reload();
  await expect(page.getByTestId("bee-count")).toHaveText("2");
  expect(errors).toEqual([]);
});

test("shop refuses poor purchases and gates physically block an undersized swarm", async ({
  page,
}) => {
  test.setTimeout(120000);
  await prepare(page, { position: map.places.shop });
  await travel(page, map.places.shop);
  await page.keyboard.press("e");
  await page.getByRole("button", { name: "View Rake", exact: true }).click();
  const rake = page.locator(".item-card").filter({
    has: page.getByRole("heading", { name: "Rake", exact: true }),
  });
  await expect(rake.getByRole("button")).toBeDisabled();
  await page.keyboard.press("Escape");
  await travel(page, { x: gate.x, y: gate.y - 5, z: gate.z + 3 });
  await page.keyboard.down("w");
  await page.waitForTimeout(2500);
  await page.keyboard.up("w");
  expect(await coord(page, "z")).toBeGreaterThanOrEqual(gate.z + 1);
});

test("a five-bee save unlocks the imported gate", async ({
  page,
}) => {
  test.setTimeout(120000);
  await prepare(page, {
    bees: Array.from({ length: 5 }, (_, i) => ({
      kind: `bee-${i}`,
      level: 1,
      energy: 40,
      bond: 0,
    })),
    slots: 5,
    position: { x: gate.x, y: gate.y - 5, z: gate.z + 3 },
  });
  await move(page, "w", "z", gate.z - 3, true);
  await expect
    .poll(async () =>
      Number(await page.getByTestId("player-height").innerText()),
    )
    .toBeGreaterThanOrEqual(5);
  await page.keyboard.press("m");
  await expect(page.getByRole("heading", { name: "World Map" })).toBeVisible();
  await page.screenshot({ path: "test-results/pollen-peak-map.png" });
});

test("bees defeat a creature and its loot rewards actual honey", async ({
  page,
}) => {
  test.setTimeout(90000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await prepare(page, {
    slots: 5,
    bees: Array.from({ length: 5 }, () => ({
      kind: "bee-23",
      level: 3,
      bond: 0,
      energy: 80,
    })),
    position: { x: field("mushroom").x + 5, y: field("mushroom").y, z: field("mushroom").z + 5 },
    accepted: { "rowan-0": [0] },
  });
  await expect
    .poll(() => amount(page, "honey"), { timeout: 60000 })
    .toBeGreaterThanOrEqual(35);
  await page.getByRole("button", { name: "Open settings" }).click();
  await page
    .getByRole("button", { name: "Save adventure", exact: true })
    .click();
  const saved = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    saveKey,
  );
  expect(saved.stats.kills).toBeGreaterThan(0);
  expect(saved.stats.tokens).toBeGreaterThan(0);
  expect(saved.accepted["rowan-0"][0]).toBe(1);
  expect(errors).toEqual([]);
});

test("shows the current 46-bee portrait roster and saves a newly claimed hive", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await prepare(page, { position: map.hives[0], pollen: 100 });
  await page.keyboard.press("e");
  await expect(page.getByRole("status")).toContainText("Hive claimed");
  await page.keyboard.press("f");
  await expect.poll(() => amount(page, "pollen"), { timeout: 45000 }).toBe(0);
  await page.keyboard.press("b");
  await expect(
    page.getByRole("heading", { name: "Bees", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".face-grid>button")).toHaveCount(46);
  await page.getByRole("button", { name: "Digital Bee", exact: true }).click();
  await expect(page.locator(".bee-index h3")).toHaveText("Digital Bee");
  await page.screenshot({
    path: "test-results/bee-roster.png",
  });
  await page.keyboard.press("Escape");
  await page.keyboard.press("m");
  await page.screenshot({ path: "test-results/map.png" });
  await page.keyboard.press("Escape");
  await page
    .getByRole("button", { name: "Open settings", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Save adventure", exact: true })
    .click();
  const saved = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    saveKey,
  );
  expect(saved.hive).toBe(0);
  expect(saved.pollen).toBe(0);
  expect(errors).toEqual([]);
});

test("Ticket Tent spends earned tickets on a unique functional Event bee", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await prepare(page, {
    position: map.places.tickets,
    inventory: { ticket: 500 },
  });
  await page.keyboard.press("e");
  await expect(
    page.getByRole("heading", { name: "Ticket Tent", exact: true }).first(),
  ).toBeVisible();
  const photon = page.locator(".item-card").filter({
    has: page.getByRole("heading", { name: "Photon Bee", exact: true }),
  });
  await photon.getByRole("button").click();
  await expect(page.getByTestId("bee-count")).toHaveText("2");
  await expect(photon.getByRole("button")).toHaveText("In your hive");
  await expect(photon.getByRole("button")).toBeDisabled();
  await page.screenshot({
    path: "test-results/ticket-tent.png",
  });
  await page.reload();
  await expect(page.getByTestId("bee-count")).toHaveText("2");
  const saved = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    saveKey,
  );
  expect(saved.inventory.ticket).toBe(0);
  expect(saved.bees.some((b: { kind: string }) => b.kind === "bee-41")).toBe(
    true,
  );
  expect(errors).toEqual([]);
});

test("cannon launches an eligible swarm through a visible arc to the mountain", async ({
  page,
}) => {
  test.setTimeout(90000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await prepare(page, {
    position: map.places["red-cannon"],
    bees: Array.from({ length: 25 }, (_, i) => ({
      kind: `bee-${i}`,
      level: 1,
      bond: 0,
      energy: 40,
    })),
  });
  await page.keyboard.press("e");
  await expect(page.getByRole("status")).toContainText("Cannon launched");
  await expect
    .poll(
      async () => Number(await page.getByTestId("player-height").innerText()),
      { timeout: 45000 },
    )
    .toBeGreaterThan(35);
  await expect
    .poll(() => coord(page, "z"), { timeout: 60000 })
    .toBeLessThan(field("mountain").z + 1);
  await expect(page.getByTestId("player-height")).toHaveText(field("mountain").y.toFixed(1), {
    timeout: 30000,
  });
  await page.screenshot({
    path: "test-results/mountain.png",
  });
  expect(errors).toEqual([]);
});

test("Blue HQ opens a real color-specific equipment shop and equips its purchase", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await prepare(page, {
    position: map.places["blue-hq"],
    honey: 4000000,
    bees: Array.from({ length: 10 }, () => ({
      kind: "bee-0",
      level: 1,
      bond: 0,
      energy: 40,
    })),
  });
  await page.keyboard.press("e");
  await expect(
    page.getByRole("heading", { name: "Blue HQ", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "View Bubble Wand", exact: true }).click();
  const wand = page.locator(".item-card").filter({
    has: page.getByRole("heading", { name: "Bubble Wand", exact: true }),
  });
  await wand.getByRole("button").click();
  await expect(wand.getByRole("button")).toHaveText("✓ Equipped");
  const saved = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    saveKey,
  );
  expect(saved.tool).toBe("tool-10");
  expect(saved.honey).toBe(500000);
  await page.screenshot({
    path: "test-results/blue-hq.png",
  });
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  expect(errors).toEqual([]);
});

test("Ticket Tent Star Treat gifts the chosen bee and survives reload", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await prepare(page, {
    position: map.places.tickets,
    inventory: { ticket: 1000 },
  });
  await page.keyboard.press("e");
  const card = page
    .locator(".item-card")
    .filter({
      has: page.getByRole("heading", { name: "Star Treat", exact: true }),
    });
  await card.getByRole("button").click();
  await page.keyboard.press("Escape");
  await page.keyboard.press("h");
  await page
    .getByRole("button", { name: "★ Give Star Treat", exact: false })
    .click();
  await expect(page.locator(".bee-detail h3")).toHaveText("★ Gifted Basic Bee");
  await page.screenshot({ path: "test-results/gifted-hive.png" });
  await page.reload();
  await expect(page.locator('canvas[data-interactive="true"]')).toBeVisible({ timeout: 45000 });
  await page.keyboard.press("h");
  await expect(page.locator(".bee-detail h3")).toHaveText("★ Gifted Basic Bee");
  const save = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    saveKey,
  );
  expect(save.inventory.starTreat).toBe(0);
  expect(save.inventory.ticket).toBe(0);
  expect(save.bees[0].gifted).toBe(true);
  expect(errors).toEqual([]);
});

test("earned badges can be claimed once for tickets", async ({ page }) => {
  await prepare(page, { lifetime: { "field:sunflower": 250000 } });
  await page.keyboard.press("j");
  const card = page
    .locator(".badge-card")
    .filter({
      has: page.getByRole("heading", { name: "Sunflower Badge", exact: true }),
    });
  await card.getByRole("button", { name: "Claim Cadet", exact: false }).click();
  await expect(card.getByRole("button")).toHaveText("Next: Hotshot");
  await expect(card.getByRole("button")).toBeDisabled();
  const save = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    saveKey,
  );
  expect(save.inventory.ticket).toBe(5);
  expect(save.badges.sunflower).toBe(1);
  await page.screenshot({ path: "test-results/badges.png" });
});

test("guild buys a sprinkler and Blender refunds unfinished ingredients", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await prepare(page, {
    position: map.places.guild,
    honey: 2000000,
    bees: Array.from({ length: 15 }, () => ({
      kind: "bee-0",
      level: 1,
      bond: 0,
      energy: 20,
    })),
    badges: { sunflower: 5, dandelion: 5, mushroom: 5 },
    lifetime: {
      "field:sunflower": 5e9,
      "field:dandelion": 5e9,
      "field:mushroom": 5e9,
    },
    inventory: { jelly: 10, strawberry: 50 },
  });
  await page.keyboard.press("e");
  await expect(
    page.getByRole("heading", { name: "Badge Bearer’s Guild", exact: true }),
  ).toBeVisible();
  const sprinkler = page
    .locator(".item-card")
    .filter({
      has: page.getByRole("heading", { name: "Basic Sprinkler", exact: true }),
    });
  await sprinkler.getByRole("button").click();
  await expect(sprinkler.getByRole("button")).toHaveText("Equipped");
  await page.getByRole("button", { name: "Blender", exact: true }).click();
  const extract = page
    .locator(".item-card")
    .filter({
      has: page.getByRole("heading", { name: "Red Extract", exact: true }),
    });
  await extract.getByRole("button").click();
  await expect(
    page.getByRole("heading", { name: "Blending 1 Red Extract", exact: true }),
  ).toBeVisible();
  await page.screenshot({ path: "test-results/blender.png" });
  await page
    .getByRole("button", {
      name: "End Crafting & Refund Unfinished",
      exact: true,
    })
    .click();
  const save = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    saveKey,
  );
  expect(save.sprinkler).toBe(0);
  expect(save.honey).toBe(888889);
  expect(save.crafting).toBe(null);
  expect(save.inventory.strawberry).toBe(50);
  expect(save.inventory.jelly).toBe(10);
  expect(errors).toEqual([]);
});

test("a purchased Sprinkler Builder places a visible sprinkler in a field", async ({
  page,
}) => {
  await prepare(page, { position: field("sunflower"), sprinkler: 0 });
  await page.keyboard.press("r");
  await expect(page.getByRole("status")).toContainText(
    "Building Basic Sprinkler",
  );
  await page.getByRole("button", { name: "Show inventory", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Sprinkler Builder", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".inventory-item").first()).toContainText(
    "1/1 placed",
  );
  await page.keyboard.press("Escape");
  await page.screenshot({ path: "test-results/sprinkler-field.png" });
});
