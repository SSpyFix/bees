import { test, expect } from "@playwright/test";
test("front-only bee faces, transparent popups, icon tokens and ground marker posts", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.addInitScript(() =>
    localStorage.setItem(
      "pollen-peak-save-v2",
      JSON.stringify({ version: 2, settings: { quality: "low", muted: true } }),
    ),
  );
  await page.goto("/");
  await page.evaluate(async () => {
    const { mountTokenGallery } = await import("/tests/token-gallery.tsx");
    mountTokenGallery();
  });
  await expect(page.locator("#token-gallery canvas")).toBeVisible();
  await page.waitForTimeout(700);
  const info = await page.evaluate(() => {
    const scene = (window as any).__tokenScene;
    let faces = 0,
      textAlpha = -1,
      iconMaps = 0,
      posts = 0;
    scene.getObjectByName("bee-under-test").traverse((o: any) => {
      if (
        o.geometry?.type === "PlaneGeometry" &&
        o.material?.map?.image?.width === 128
      )
        faces++;
    });
    scene.getObjectByName("number-under-test").traverse((o: any) => {
      const image = o.material?.map?.image;
      if (image?.getContext)
        textAlpha = image.getContext("2d").getImageData(4, 4, 1, 1).data[3];
    });
    scene.getObjectByName("token-under-test").traverse((o: any) => {
      if (o.material?.map?.image?.width === 128) iconMaps++;
    });
    scene.traverse((o: any) => {
      if (o.name === "mark-post") posts++;
    });
    return { faces, textAlpha, iconMaps, posts };
  });
  await page.screenshot({
    path: "/workspace/work/bee-1.1.2/marks-and-tokens.png",
  });
  expect(info.faces).toBe(1);
  expect(info.textAlpha).toBe(0);
  expect(info.iconMaps).toBeGreaterThan(0);
  expect(info.posts).toBe(3);
  expect(errors).toEqual([]);
});
