import { test, expect } from "@playwright/test";

test("generated map removes source bees and hive portraits while real owned hive bees render", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const report = await (await page.request.get("/map/import-report.json")).json();
  expect(report.excludedBeeModels).toHaveLength(42);
  expect(report.excludedBeeParts).toBe(95);
  expect(report.clearedHivePortraits).toBe(42);
  await page.addInitScript(() => localStorage.setItem("pollen-peak-save-v2", JSON.stringify({ version: 2, settings: { quality: "low", muted: true } })));
  await page.goto("/");
  await expect(page.locator('canvas[data-interactive="true"]')).toBeVisible({ timeout: 45000 });
  await page.evaluate(async () => {
    const fixture = await import("/tests/hive-cleanup-gallery.tsx");
    fixture.mountHiveCleanupGallery();
  });
  await expect.poll(() => page.evaluate(() => {
    const scene = (window as any).__hiveCleanupScene;
    const group = scene?.getObjectByName("live-hive-bees");
    return group?.children.map((mesh: any) => mesh.name).sort() ?? [];
  })).toEqual(["live-hive-bee-owned-basic", "live-hive-bee-owned-cool"]);
  await expect.poll(() => page.evaluate(() => {
    const group = (window as any).__hiveCleanupScene?.getObjectByName("live-hive-bees");
    return group?.children.filter((mesh: any) => mesh.material?.map?.image?.getContext("2d").getImageData(64,64,1,1).data[3] > 0).length ?? 0;
  })).toBe(2);
  await page.screenshot({ path: "test-results/clean-hive-owned-bees.png" });
  await page.evaluate(async () => {
    const { useGame } = await import("/src/game/systems/store.ts");
    const { default: map } = await import("/src/game/data/imported-map.json");
    const state = useGame.getState();
    state.game.slots = 50;
    state.game.bees = Array.from({ length: 50 }, (_, index) => ({ ...state.game.bees[0], id: `owned-${index}` }));
    state.refresh();
    const camera = (window as any).__hiveCleanupCamera, hive = map.hives[0];
    camera.position.set(hive.x + 1, 6.5, hive.z - 13);
    camera.lookAt(hive.x + 1, 6.5, hive.z + 5);
  });
  await expect.poll(() => page.evaluate(() => (window as any).__hiveCleanupScene?.getObjectByName("live-hive-bees")?.children.length ?? 0)).toBe(50);
  await expect.poll(() => page.evaluate(() => {
    let extra = 0;
    (window as any).__hiveCleanupScene?.traverse((object: any) => { if (object.name === "extended-hive-cell") extra++; });
    return extra;
  })).toBe(10);
  await expect.poll(() => page.evaluate(() => {
    const group = (window as any).__hiveCleanupScene?.getObjectByName("live-hive-bees");
    return group?.children.filter((mesh: any) => mesh.material?.map?.image?.getContext("2d").getImageData(64,64,1,1).data[3] > 0).length ?? 0;
  })).toBe(50);
  await page.screenshot({ path: "test-results/clean-hive-full-swarm.png" });
  expect(errors).toEqual([]);
});
