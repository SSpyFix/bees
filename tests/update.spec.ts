import { test, expect } from "@playwright/test";
import map from "../src/game/data/imported-map.json" with { type: "json" };
const key = "pollen-peak-save-v2";
test("HUD converts balloon cargo when the pack is empty", async ({ page }) => {
  await page.addInitScript(
    ({key, mapVersion, position}) =>
      localStorage.setItem(
        key,
        JSON.stringify({
          version: 2,
          mapVersion, position, hive: 3,
          balloonPollen: 120,
          pollen: 0,
          settings: { quality: "low", muted: true },
        }),
      ),
    {key, mapVersion: map.version, position: {...map.hives[3], z: map.hives[3].z - 5}},
  );
  await page.goto("/");
  const button = page.getByRole("button", { name: /Make Honey/i });
  await expect(button).toBeEnabled();
  await button.click();
  await expect
    .poll(async () =>
      Number((await page.getByTestId("honey").innerText()).replaceAll(",", "")),
    )
    .toBe(120);
});
test.beforeEach(async ({ page }) => {
  await page.addInitScript(
    ({key, mapVersion, position}) =>
      localStorage.setItem(
        key,
        JSON.stringify({
          version: 2,
          mapVersion,
          honey: 2000000000000,
          inventory: { jelly: 1000000, treat: 10 },
          position,
          bees: [{ kind: "bee-26", level: 4, gifted: true }],
          settings: { quality: "low", muted: true },
        }),
      ),
    {key, mapVersion: map.version, position: map.places.eggs},
  );
  await page.goto("/");
  await expect(page.locator('canvas[data-interactive="true"]')).toBeVisible();
});
test("large purchases charge the displayed total and preserve inventory", async ({
  page,
}) => {
  await page.evaluate(async position => {
    const {useGame} = await import("/src/game/systems/store.ts");
    Object.assign(useGame.getState().game.player, position);
    useGame.getState().refresh();
  }, map.places["jelly-shop"]);
  await page.keyboard.press("e");
  await expect(
    page.getByRole("heading", { name: "Royal Jelly Shop", exact: true }),
  ).toBeVisible();
  await page.getByLabel("Purchase quantity").selectOption("1000000");
  const jelly = page.locator(".item-card").filter({
    has: page.getByRole("heading", { name: "Royal Jelly", exact: true }),
  });
  await expect(jelly.getByRole("button")).toContainText("1,000,000");
  await jelly.getByRole("button").click();
  const saved = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    key,
  );
  expect(saved.inventory.jelly).toBe(2000000);
  expect(saved.honey).toBe(2000000000000 - 999971500000);
  await page.screenshot({ path: "test-results/bulk-shop.png" });
});
test("reference layout uses compact icon tabs and a narrow left inventory panel", async ({
  page,
}) => {
  await page
    .getByRole("button", { name: "Show inventory", exact: true })
    .click();
  const panel = await page.getByRole("dialog").boundingBox();
  expect(panel!.x).toBeLessThanOrEqual(8);
  expect(panel!.width).toBeLessThanOrEqual(330);
  const tabs = await page
    .getByRole("navigation", { name: "Game menus" })
    .boundingBox();
  expect(tabs!.height).toBeLessThan(60);
  expect(tabs!.width).toBeGreaterThan(200);
  await expect(
    page.getByRole("heading", { name: "Royal Jelly", exact: true }),
  ).toBeVisible();
});
test("gifted status and combined auto-jelly filters are visible and saved", async ({
  page,
}) => {
  await page.keyboard.press("h");
  await expect(
    page.getByRole("heading", { name: "★ Gifted Music Bee", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".bee-detail")).toContainText("Token Link");
  await page.screenshot({ path: "test-results/gifted-hive.png" });
  await page.keyboard.press("Escape");
  await page
    .getByRole("button", { name: "Open settings", exact: true })
    .click();
  await page.getByLabel("Auto Royal Jelly rarity").selectOption("Mythic");
  await page.getByLabel("Require gifted").check();
  await expect(page.getByTestId("jelly-target")).toContainText("Gifted Mythic");
  const saved = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    key,
  );
  expect(saved.settings.jellyRarity).toBe("Mythic");
  expect(saved.settings.jellyGifted).toBe(true);
});
test("auto jelly can be cancelled and does not continue spending", async ({
  page,
}) => {
  await page
    .getByRole("button", { name: "Open settings", exact: true })
    .click();
  await page.getByLabel("Auto Royal Jelly rarity").selectOption("Mythic");
  await page.getByLabel("Require gifted").check();
  await page.keyboard.press("Escape");
  await page.keyboard.press("h");
  await page.getByRole("button", { name: /Use Royal Jelly/ }).click();
  await page
    .getByRole("button", { name: "Stop auto Royal Jelly", exact: true })
    .click();
  const remaining = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!).inventory.jelly,
    key,
  );
  await page.waitForTimeout(400);
  await page.keyboard.press("Escape");
  await page
    .getByRole("button", { name: "Open settings", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Save adventure", exact: true })
    .click();
  expect(
    await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)!).inventory.jelly,
      key,
    ),
  ).toBe(remaining);
});

test("renders Mythic and Event ability effects without runtime errors", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.evaluate(async () => {
    const { useGame } = await import("/src/game/systems/store.ts");
    const { activateAbility } = await import("/src/game/systems/abilities.ts");
    const s = useGame.getState().game;
    s.player.x = 0;
    s.player.z = 8;
    s.player.y = 0;
    for (const id of [
      "inflate-balloons",
      "fuzz-bombs",
      "target-practice",
      "inferno",
      "summon-frog",
      "triangulate",
      "rain-cloud",
      "glob",
      "beamstorm",
    ])
      activateAbility(s, id, s.player, 5, true);
    useGame.getState().refresh();
  });
  await page.screenshot({
    path: "test-results/ability-effects.png",
  });
  expect(errors).toEqual([]);
});

test("keeps the shop behind inventory and supports item browsing and leaving", async ({
  page,
}) => {
  await page.evaluate(async () => (await import("/src/game/systems/store.ts")).useGame.getState().open("shop", "shop"));
  await page.getByRole("button", { name: "Next item", exact: true }).click();
  await expect(page.locator(".shop-detail-card h3")).toHaveText("Rake");
  await page
    .getByRole("button", { name: "Previous item", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Show inventory", exact: true })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Inventory", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Basic Shop", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Next item", exact: true }),
  ).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: "test-results/shop-with-inventory.png",
  });
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("dialog", { name: "Basic Shop", exact: true }),
  ).toBeVisible();
  await page.keyboard.press("e");
  await expect(page.getByRole("dialog")).not.toBeVisible();
});

test("mobile reference panel stays within the viewport", async ({ page }) => {
  await page.setViewportSize({ width: 409, height: 749 });
  await page
    .getByRole("button", { name: "Show inventory", exact: true })
    .click();
  const panel = await page.getByRole("dialog").boundingBox();
  expect(panel!.x + panel!.width).toBeLessThanOrEqual(409);
  expect(panel!.y + panel!.height).toBeLessThanOrEqual(749);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: "test-results/mobile-inventory.png",
  });
});

test("inventory Royal Jelly opens bee selection without spending", async ({
  page,
}) => {
  await page
    .getByRole("button", { name: "Show inventory", exact: true })
    .click();
  await page
    .locator('[data-inventory-item="jelly"]').getByRole("button", {name:"Choose bee", exact:true})
    .click();
  await expect(
    page.getByRole("dialog", { name: "Use item on bee", exact: true }),
  ).toBeVisible();
  const remaining = await page.evaluate(async () => {
    const { useGame } = await import("/src/game/systems/store.ts");
    return useGame.getState().game.inventory.jelly;
  });
  expect(remaining).toBe(1000000);
});

test("shop explains a refused smaller backpack equip", async ({ page }) => {
  await page.evaluate(async () => {
    const { useGame } = await import("/src/game/systems/store.ts");
    const s = useGame.getState().game;
    s.owned.push("bag-1");
    s.bag = "bag-1";
    s.capacity = 750;
    s.pollen = 250;
    useGame.getState().open("shop", "shop");
  });
  await page.getByRole("button", { name: "View Pouch", exact: true }).click();
  await page.getByRole("button", { name: "Equip", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("Convert some pollen");
});
