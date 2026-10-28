import { test, expect } from '@playwright/test';

test('inventory drags assign saved shortcuts and confirm items on the physical target bee', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => localStorage.setItem('pollen-peak-save-v2', JSON.stringify({ version: 2, settings: { quality: 'low', muted: true } })));
  await page.goto('/');
  await expect(page.locator('canvas[data-interactive="true"]')).toBeVisible({ timeout: 45000 });
  await page.evaluate(async () => (await import('/tests/item-drag-gallery.tsx')).mountItemDragGallery());
  const host = page.locator('body > div').last();
  const treat = host.locator('[data-inventory-item="treat"]');
  await expect(treat).toBeVisible();
  await treat.dragTo(host.locator('[data-hotbar-slot="7"]'));
  await expect(host.locator('[data-hotbar-slot="7"]')).toHaveAttribute('aria-label', 'Treat');
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('pollen-peak-save-v2')!).hotbar[5])).toBe('treat');
  await treat.dragTo(host.locator('[data-hotbar-slot="1"]'));
  await expect(host.locator('[data-hotbar-slot="1"]')).toHaveClass('selected-tool');
  const row = await host.locator('.hotbar').boundingBox();
  expect(Math.abs(row!.x + row!.width / 2 - 550)).toBeLessThan(1);

  const dropOnBee = async (item: string) => {
    const sourceItem = host.locator(`[data-inventory-item="${item}"]`);
    await sourceItem.scrollIntoViewIfNeeded();
    const target = await page.evaluate(() => (window as any).__dragTarget());
    const source = await sourceItem.boundingBox();
    await page.mouse.move(source!.x + 35, source!.y + 30);
    await page.mouse.down();
    await page.mouse.move(source!.x + 50, source!.y + 30, { steps: 5 });
    await page.mouse.move(target.x, target.y, { steps: 15 });
    await page.mouse.move(target.x + 1, target.y + 1);
    await page.mouse.up();
  };
  await dropOnBee('treat');
  await expect(host.getByRole('dialog')).toContainText('hive slot 2');
  expect(await page.evaluate(async () => (await import('/src/game/systems/store.ts')).useGame.getState().game.inventory.treat)).toBe(5);
  await host.getByRole('button', { name: 'Cancel', exact: true }).click();
  await dropOnBee('treat');
  await host.getByRole('button', { name: 'Use 1 Treat', exact: true }).click();
  const result = await page.evaluate(async () => {
    const game = (await import('/src/game/systems/store.ts')).useGame.getState().game;
    return { treats: game.inventory.treat, firstBond: game.bees[0].bond, secondBond: game.bees[1].bond, secondLevel: game.bees[1].level };
  });
  expect(result.treats).toBe(4); expect(result.firstBond).toBe(0);
  expect(result.secondBond > 0 || result.secondLevel > 1).toBe(true);
  await dropOnBee('jelly');
  await expect(host.getByRole('dialog')).toContainText('hive slot 2');
  await host.getByRole('button', { name: 'Use 1 Royal Jelly', exact: true }).click();
  expect(await page.evaluate(async () => {
    const game = (await import('/src/game/systems/store.ts')).useGame.getState().game;
    return { jelly: game.inventory.jelly, firstKind: game.bees[0].kind };
  })).toEqual({ jelly: 4, firstKind: 'bee-0' });
  await host.locator('[data-hotbar-slot="7"]').click();
  await expect(host.getByLabel('Target bee')).toBeVisible();
  await host.getByRole('button', { name: 'Cancel', exact: true }).click();
  await page.screenshot({ path: 'test-results/item-drag-ui.png' });
  expect(errors).toEqual([]);
});

test('actual game hotbar stays centered on desktop and narrow screens', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('navigation', { name: 'Item hotbar' })).toBeVisible();
  for (const width of [1100, 823, 390, 320]) {
    await page.setViewportSize({ width, height: 800 });
    const box = await page.getByRole('navigation', { name: 'Item hotbar' }).boundingBox();
    expect(Math.abs(box!.x + box!.width / 2 - width / 2)).toBeLessThan(1);
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(width);
  }
  await page.setViewportSize({ width: 1100, height: 800 });
  await expect(page.locator('canvas[data-interactive="true"]')).toBeVisible({ timeout: 45000 });
  await page.screenshot({ path: 'test-results/compact-map-ui.png' });
});
