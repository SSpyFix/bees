import { test, expect, type Page } from "@playwright/test";
import map from "../src/game/data/imported-map.json" with { type: "json" };

async function openMap(page: Page, seed: Record<string, unknown> = {}) {
  await page.addInitScript(({ seed, version }) => localStorage.setItem("pollen-peak-save-v2", JSON.stringify({ version: 2, mapVersion: version, settings: { quality: "low", muted: true }, ...seed })), { seed, version: map.version });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Bee Swarm Simulator", exact: true })).toBeVisible();
  await expect(page.locator('canvas[data-interactive="true"]')).toBeVisible({ timeout: 45000 });
}

test("renders the imported map and moves from the exported spawn", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await openMap(page);
  const marker = page.getByTestId("map-player");
  const before = Number(await marker.getAttribute("cy"));
  await page.keyboard.down("w");
  await expect.poll(async () => Number(await marker.getAttribute("cy")), { timeout: 45000 }).toBeLessThan(before - 2);
  await page.keyboard.up("w");
  await page.keyboard.press("Space");
  const height = page.getByTestId("player-height");
  await expect.poll(async () => Number(await height.innerText())).toBeGreaterThan(0.3);
  await page.screenshot({ path: "test-results/imported-map-spawn.png" });
  await page.keyboard.press("m");
  await expect(page.getByRole("heading", { name: "World Map" })).toBeVisible();
  await page.screenshot({ path: "test-results/imported-map-overview.png" });
  expect(errors).toEqual([]);
});

test("gathers on the imported Dandelion field and saves the new map position", async ({ page }) => {
  const f = map.fields.find((f) => f.id === "dandelion")!;
  await openMap(page, { position: { x: f.x, y: f.y, z: f.z } });
  await expect(page.getByTestId("scene-status")).toHaveText("Dandelion Field");
  await page.mouse.move(550, 420);await page.mouse.down();
  await expect.poll(async () => Number((await page.getByTestId("pollen").innerText()).replaceAll(",", "")), { timeout: 45000 }).toBeGreaterThan(10);
  await page.mouse.up();
  await page.screenshot({ path: "test-results/imported-map-field.png" });
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Save adventure", exact: true }).click();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("pollen-peak-save-v2")!));
  expect(saved.mapVersion).toBe(map.version);
  expect(saved.position.x).toBeCloseTo(f.x, 1);
});

test("Settings resets only the character to spawn and saves the result", async ({ page }) => {
  const field = map.fields.find((f) => f.id === "clover")!;
  await openMap(page, { honey: 1234, pollen: 80, position: { x: field.x, y: field.y, z: field.z } });
  await page.getByRole("button", { name: "Open settings", exact: true }).click();
  await expect(page.getByRole("button", { name: "Reset character to spawn", exact: true })).toBeVisible();
  const before = await page.evaluate(async () => {
    const { useGame } = await import("/src/game/systems/store.ts");
    const { serialize } = await import("/src/game/systems/simulation.ts");
    return JSON.parse(serialize(useGame.getState().game));
  });
  await page.getByRole("button", { name: "Reset character to spawn", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Settings", exact: true })).not.toBeVisible();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("pollen-peak-save-v2")!));
  expect(saved.position).toEqual(map.spawn);
  for (const key of ["honey", "pollen", "bees", "inventory", "quests", "owned", "hive"])
    expect(saved[key], key).toEqual(before[key]);
});

test("converts pollen at an exported hive and opens a relocated quest giver", async ({ page }) => {
  const hive = map.hives[2];
  await openMap(page, { hive: 2, pollen: 100, position: hive });
  await page.keyboard.press("f");
  await expect.poll(async () => Number((await page.getByTestId("honey").innerText()).replaceAll(",", "")), { timeout: 45000 }).toBeGreaterThan(0);
  const bear = map.places.juniper;
  await openMap(page, { position: bear });
  await page.keyboard.press("e");
  await expect(page.getByRole("button", { name: "Accept quest", exact: true })).toBeVisible();
});
