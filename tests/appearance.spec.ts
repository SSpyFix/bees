import { test, expect } from "@playwright/test";
test("renders every reference face without WebGL errors", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.addInitScript(() =>
    localStorage.setItem(
      "pollen-peak-save-v2",
      JSON.stringify({
        version: 2,
        settings: { quality: "low", muted: true },
        bees: [{ kind: "bee-15", level: 7, bond: 12, gifted: true }],
        inventory: { jelly: 2000000 },
      }),
    ),
  );
  await page.goto("/");
  await page.getByRole("button", { name: "Show bees", exact: true }).click();
  await expect(page.locator(".face-grid>button")).toHaveCount(46);
  const faces = await page
    .locator(".face-grid>button>svg")
    .evaluateAll((icons) => icons.map((icon) => icon.innerHTML));
  expect(new Set(faces).size).toBe(46);
  await page.getByRole("button", { name: "Music Bee", exact: true }).click();
  await expect(page.locator(".bee-detail h3")).toHaveText("Music Bee");
  await page.screenshot({ path: "/workspace/work/bee-1.1.1/bee-index.png" });
  await page.evaluate(async () => {
    const { mountBeeGallery } = await import("/tests/appearance-gallery.tsx");
    mountBeeGallery();
  });
  await expect(page.locator("#appearance-gallery canvas")).toBeVisible();
  // SVG textures load asynchronously into Three.js; allow their first rendered frame.
  await page.waitForTimeout(700);
  await page.screenshot({
    path: "/workspace/work/bee-1.1.1/species-models.png",
  });
  expect(errors).toEqual([]);
  const save = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("pollen-peak-save-v2")!),
  );
  expect(save.bees[0].kind).toBe("bee-15");
  expect(save.bees[0].gifted).toBe(true);
  expect(save.inventory.jelly).toBe(2000000);
});
