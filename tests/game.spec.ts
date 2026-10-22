import { test, expect, type Page } from "@playwright/test";
const saveKey = "pollen-peak-save-v2";
async function prepare(page: Page, seed: Record<string, unknown> = {}) {
  await page.addInitScript(
    ({ key, seed }) => {
      if (!localStorage.getItem(key))
        localStorage.setItem(
          key,
          JSON.stringify({
            version: 2,
            settings: { quality: "low", muted: true },
            ...seed,
          }),
        );
    },
    { key: saveKey, seed },
  );
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Pollen Peak", exact: true }),
  ).toBeVisible();
  await expect(page.locator('canvas[data-interactive="true"]')).toBeVisible();
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

test("loads the 3D world, moves, jumps, orbits, zooms and resumes after menus", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await prepare(page);
  await page.screenshot({ path: "test-results/pollen-peak-world.png" });
  await move(page, "w", "z", 50, true);
  await page.keyboard.press("Space");
  await expect(page.getByTestId("player-height")).not.toHaveText("0.0");
  await expect(page.getByTestId("player-height")).toHaveText("0.0");
  await page.mouse.move(600, 400);
  await page.mouse.down({ button: "right" });
  await page.mouse.move(690, 440, { steps: 10 });
  await page.mouse.up({ button: "right" });
  await page.mouse.wheel(0, -150);
  await page.keyboard.press("m");
  await expect(
    page.getByRole("heading", { name: "The mountain trails" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await page.locator(".hotbar button").filter({ hasText: "Bag" }).click();
  await expect(
    page.getByRole("heading", { name: "Your trail bag" }),
  ).toBeVisible();
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

test("plays the actual gather → quest → convert → purchase → hatch → save loop", async ({
  page,
}) => {
  test.setTimeout(240000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await prepare(page, { position: { x: -7, z: 19.5 } });
  await page.keyboard.press("e");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Accept quest", exact: true }).click();
  await page.keyboard.press("Escape");
  await move(page, "d", "x", 0, false);
  await expect(page.getByTestId("scene-status")).toHaveText("Dandelion Lawn");
  // No clicks: the first bee must independently choose a flower, fly there and gather.
  await expect
    .poll(() => amount(page, "pollen"), { timeout: 45000 })
    .toBeGreaterThan(0);
  await page.mouse.move(640, 440);
  await page.mouse.down();
  await expect
    .poll(() => amount(page, "pollen"), { timeout: 45000 })
    .toBeGreaterThanOrEqual(230);
  await page.mouse.up();
  await page.keyboard.press("q");
  await page.getByRole("button", { name: "Claim reward", exact: true }).click();
  await expect.poll(() => amount(page, "honey")).toBeGreaterThanOrEqual(150);
  await page.keyboard.press("Escape");
  await move(page, "s", "z", 52, false);
  await page.keyboard.press("f");
  await expect.poll(() => amount(page, "pollen"), { timeout: 60000 }).toBe(0);
  await expect.poll(() => amount(page, "honey")).toBeGreaterThan(350);
  await move(page, "a", "x", -16, true);
  await move(page, "s", "z", 57, false);
  await page.keyboard.press("e");
  await expect(
    page.getByRole("heading", { name: "The Little Supply Co.", exact: true }),
  ).toBeVisible();
  const rake = page
    .locator(".item-card")
    .filter({
      has: page.getByRole("heading", { name: "Copper Rake", exact: true }),
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
  await prepare(page, { position: { x: -12, z: 53 } });
  await move(page, "a", "x", -16, true);
  await move(page, "s", "z", 57, false);
  await page.keyboard.press("e");
  const rake = page
    .locator(".item-card")
    .filter({
      has: page.getByRole("heading", { name: "Copper Rake", exact: true }),
    });
  await expect(rake.getByRole("button")).toBeDisabled();
  await page.keyboard.press("Escape");
  await move(page, "d", "x", -13, false);
  await move(page, "w", "z", -17, true);
  await page.keyboard.down("w");
  await page.waitForTimeout(2500);
  await page.keyboard.up("w");
  expect(await coord(page, "z")).toBeGreaterThanOrEqual(-18.35);
});

test("a five-bee save unlocks the connected ramp and survives reload", async ({
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
    position: { x: -12, z: -14 },
  });
  await move(page, "w", "z", -44, true);
  await expect
    .poll(async () =>
      Number(await page.getByTestId("player-height").innerText()),
    )
    .toBeGreaterThanOrEqual(8);
  await page.keyboard.press("m");
  await expect(
    page.getByRole("heading", { name: "The mountain trails" }),
  ).toBeVisible();
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
    position: { x: 43, z: 14 },
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
