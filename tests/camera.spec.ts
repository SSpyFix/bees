import { test, expect } from "@playwright/test";
test("camera and player keep a stable relative position while walking", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      "pollen-peak-save-v2",
      JSON.stringify({ version: 2, settings: { quality: "low", muted: true } }),
    ),
  );
  await page.goto("/");
  await expect(page.locator('canvas[data-interactive="true"]')).toBeVisible();
  await page.waitForTimeout(700);
  await page.keyboard.down("w");
  const samples = await page.evaluate(async () => {
    const { sampleCameraFrames } = await import("/tests/camera-sampling.ts");
    return sampleCameraFrames(35);
  });
  await page.keyboard.up("w");
  const positions = samples.map((s) => s.position[2]);
  expect(Math.max(...positions) - Math.min(...positions)).toBeGreaterThan(0.5);
  for (let axis = 0; axis < 3; axis++) {
    const offsets = samples.map((s) => s.offset[axis]);
    expect(Math.max(...offsets) - Math.min(...offsets)).toBeLessThan(0.005);
  }
});
