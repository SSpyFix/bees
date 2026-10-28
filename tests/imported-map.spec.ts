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

for (const id of ['red-cannon', 'yellow-cannon', 'blue-cannon']) {
  test(`${id} activates with E and completes its flight`, async ({page}) => {
    test.setTimeout(150000);
    await openMap(page);
    const destination = await page.evaluate(async id => {
      const {useGame}=await import('/src/game/systems/store.ts');
      const {PLACES}=await import('/src/game/data/content.ts');
      const {newBee}=await import('/src/game/systems/simulation.ts');
      const state=useGame.getState(),s=state.game;
      for(let i=1;i<25;i++)s.bees.push(newBee(s,`bee-${i}`));
      Object.assign(s.player,PLACES.find(p=>p.id===id));
      state.refresh();
      return id==='red-cannon' ? 'mountain' : id==='blue-cannon' ? 'clover' : 'spawn';
    }, id);
    await page.keyboard.press('e');
    await expect.poll(()=>page.evaluate(async()=>!!(await import('/src/game/systems/store.ts')).useGame.getState().game.flight)).toBe(true);
    await expect.poll(()=>page.evaluate(async()=>!!(await import('/src/game/systems/store.ts')).useGame.getState().game.flight),{timeout:120000}).toBe(false);
    const position=await page.evaluate(async()=>{
      const p=(await import('/src/game/systems/store.ts')).useGame.getState().game.player;
      return {x:p.x,z:p.z};
    });
    const target=destination==='spawn' ? map.spawn : map.fields.find(f=>f.id===destination)!;
    expect(position.x).toBeCloseTo(target.x,1);
    expect(position.z).toBeCloseTo(target.z,1);
  });
}

test('movement and jumping work with Settings and Inventory open, but typing does not move', async ({page}) => {
  test.setTimeout(120000);
  await openMap(page);
  for(const menu of ['settings','inventory']) {
    await page.evaluate(async menu => (await import('/src/game/systems/store.ts')).useGame.getState().open(menu),menu);
    const before=await page.evaluate(async()=> (await import('/src/game/systems/store.ts')).useGame.getState().game.player.z);
    await page.keyboard.down('w');
    await expect.poll(()=>page.evaluate(async()=> (await import('/src/game/systems/store.ts')).useGame.getState().game.player.z),{timeout:45000}).toBeLessThan(before-.5);
    await page.keyboard.up('w');
    await expect(page.getByRole('dialog')).toBeVisible();
    if(menu==='settings') {
      await page.keyboard.press('Space');
      await expect.poll(()=>page.evaluate(async()=> (await import('/src/game/systems/store.ts')).useGame.getState().game.player.y),{timeout:45000}).toBeGreaterThan(.3);
    }
  }
});

test('admin code unlocks tools, grants a gifted egg and materials, and saves independent buffs', async ({page}) => {
  test.setTimeout(120000);
  await openMap(page);
  await page.getByRole('button',{name:'Open settings',exact:true}).click();
  const code=page.getByLabel('Admin code',{exact:true});
  const before=await page.evaluate(async()=> (await import('/src/game/systems/store.ts')).useGame.getState().game.player.z);
  await code.pressSequentially('wrong');
  await page.getByRole('button',{name:'Open admin menu',exact:true}).click();
  await expect(page.getByRole('alert')).toHaveText('Incorrect admin code.');
  expect(await page.evaluate(async()=> (await import('/src/game/systems/store.ts')).useGame.getState().game.player.z)).toBe(before);
  await code.fill('4321');
  await page.getByRole('button',{name:'Open admin menu',exact:true}).click();
  const panel=page.getByRole('complementary',{name:'Admin menu',exact:true});
  await expect(panel).toBeVisible();
  await panel.getByLabel('10× pollen',{exact:true}).check();
  await panel.getByLabel('10× honey',{exact:true}).check();
  await panel.getByLabel('10× honey',{exact:true}).uncheck();
  await panel.getByLabel('Admin egg type').selectOption('mythicEgg');
  await panel.getByLabel('Gifted',{exact:true}).check();
  await panel.getByRole('button',{name:'Give selected egg',exact:true}).click();
  await panel.getByRole('button',{name:'+999 crafting materials',exact:true}).click();
  const startZ=await page.evaluate(async()=> (await import('/src/game/systems/store.ts')).useGame.getState().game.player.z);
  await page.keyboard.down('w');
  await expect.poll(()=>page.evaluate(async()=> (await import('/src/game/systems/store.ts')).useGame.getState().game.player.z),{timeout:45000}).toBeLessThan(startZ-.5);
  await page.keyboard.up('w');
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('pollen-peak-save-v2')!));
  expect(saved.adminBoosts).toEqual({pollen:true,honey:false});
  expect(saved.inventory.giftedMythicEgg).toBe(1);
  expect(saved.inventory.turpentine).toBe(999);
  await panel.getByRole('button',{name:'Hide',exact:true}).click();
  await expect(panel.getByRole('button',{name:'Show',exact:true})).toBeVisible();
});

test('gifted eggs work from Inventory and replace a selected bee in a full hive', async ({page}) => {
  test.setTimeout(120000);
  await openMap(page,{inventory:{giftedMythicEgg:1}});
  const target=await page.evaluate(async()=>{
    const state=(await import('/src/game/systems/store.ts')).useGame.getState();
    state.game.slots=state.game.bees.length;
    state.refresh();
    return state.game.bees[0].id;
  });
  await page.getByRole('button',{name:'Show inventory',exact:true}).click();
  const row=page.locator('[data-inventory-item="giftedMythicEgg"]');
  await row.getByRole('button',{name:'Choose bee',exact:true}).click();
  await page.getByLabel('Target bee').selectOption(target);
  await expect(page.getByRole('dialog',{name:'Use item on bee'})).toContainText('This replaces its species.');
  await page.getByRole('button',{name:'Cancel',exact:true}).click();
  await page.getByRole('button',{name:'Show hive',exact:true}).click();
  await page.getByLabel('Egg type',{exact:true}).selectOption('giftedMythicEgg');
  await page.getByRole('button',{name:'Use egg on selected bee',exact:true}).click();
  await page.getByRole('button',{name:'Use 1 Gifted Mythic Egg',exact:true}).click();
  const result=await page.evaluate(async()=>{
    const s=(await import('/src/game/systems/store.ts')).useGame.getState().game;
    const {BEES}=await import('/src/game/data/content.ts');
    return {id:s.bees[0].id,gifted:s.bees[0].gifted,rarity:BEES.find(b=>b.id===s.bees[0].kind)?.rarity,count:s.bees.length,eggs:s.inventory.giftedMythicEgg};
  });
  expect(result).toEqual({id:target,gifted:true,rarity:'Mythic',count:1,eggs:0});
});

test('collapsed admin menu can be dragged and stays visible when reopened', async ({page}) => {
  test.setTimeout(120000);
  await openMap(page);
  await page.getByRole('button',{name:'Open settings',exact:true}).click();
  await page.getByLabel('Admin code',{exact:true}).fill('4321');
  await page.getByRole('button',{name:'Open admin menu',exact:true}).click();
  const panel=page.getByRole('complementary',{name:'Admin menu',exact:true});
  await panel.getByRole('button',{name:'Hide',exact:true}).click();
  const before=(await panel.boundingBox())!;
  const title=panel.getByText('Admin menu',{exact:true});
  const handle=(await title.boundingBox())!;
  await page.mouse.move(handle.x+20,handle.y+8);
  await page.mouse.down();
  await page.mouse.move(handle.x-300,handle.y+280,{steps:10});
  await page.mouse.up();
  await expect.poll(async()=> (await panel.boundingBox())!.x).toBeLessThan(before.x-100);
  await panel.getByRole('button',{name:'Show',exact:true}).click();
  const expanded=(await panel.boundingBox())!;
  expect(expanded.x).toBeGreaterThanOrEqual(0);
  expect(expanded.y+expanded.height).toBeLessThanOrEqual(800);
});

test('bees wander independently near the player and follow when walking', async ({page}) => {
  test.setTimeout(150000);
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  await openMap(page);
  await page.evaluate(async()=>{
    const state=(await import('/src/game/systems/store.ts')).useGame.getState();
    const {newBee}=await import('/src/game/systems/simulation.ts');
    while(state.game.bees.length<8)state.game.bees.push(newBee(state.game,'bee-0'));
    state.refresh();
  });
  await expect.poll(()=>page.evaluate(async()=> (await import('/src/game/systems/store.ts')).useGame.getState().game.bees.filter(b=>b.wander).length),{timeout:45000}).toBe(8);
  const before=await page.evaluate(async()=>{
    const s=(await import('/src/game/systems/store.ts')).useGame.getState().game;
    return {clock:s.clock,targets:s.bees.map(b=>JSON.stringify([b.wander?.x,b.wander?.z])),z:s.player.z};
  });
  await expect.poll(()=>page.evaluate(async()=> (await import('/src/game/systems/store.ts')).useGame.getState().game.clock),{timeout:90000}).toBeGreaterThan(before.clock+4);
  const after=await page.evaluate(async()=>{
    const s=(await import('/src/game/systems/store.ts')).useGame.getState().game;
    return {targets:s.bees.map(b=>JSON.stringify([b.wander?.x,b.wander?.z])),radius:Math.max(...s.bees.map(b=>Math.hypot(b.x-s.player.x,b.z-s.player.z)))};
  });
  expect(after.targets.filter((t,i)=>t!==before.targets[i]).length).toBeGreaterThan(3);
  expect(after.radius).toBeLessThan(12);
  await page.screenshot({path:'test-results/swarm-wandering.png'});
  await page.keyboard.down('w');
  await expect.poll(()=>page.evaluate(async()=> (await import('/src/game/systems/store.ts')).useGame.getState().game.player.z),{timeout:45000}).toBeLessThan(before.z-2);
  await page.keyboard.up('w');
  expect(errors).toEqual([]);
});

test('all bees work concurrently on separate flowers and show collection feedback', async ({page})=>{
 test.setTimeout(150000);await openMap(page);
 await page.evaluate(async()=>{
  const {useGame}=await import('/src/game/systems/store.ts');
  const {newBee}=await import('/src/game/systems/simulation.ts');
  const {FIELDS,BAGS}=await import('/src/game/data/content.ts');
  const state=useGame.getState(),s=state.game;
  Object.assign(s.player,FIELDS[0]);s.enemies=[];
  s.bag=BAGS.at(-1)!.id;s.owned.push(s.bag);
  while(s.bees.length<8)s.bees.push(newBee(s,'bee-0'));
  for(const b of s.bees)Object.assign(b,{x:s.player.x,y:s.player.y+.8,z:s.player.z,timer:0,abilityTimer:Infinity});
  state.refresh();
 });
 await expect.poll(()=>page.evaluate(async()=>{
  const s=(await import('/src/game/systems/store.ts')).useGame.getState().game;
  return s.bees.filter(b=>b.energy<20).length;
 }),{timeout:90000}).toBe(8);
 const result=await page.evaluate(async()=>{
  const s=(await import('/src/game/systems/store.ts')).useGame.getState().game;
  return {pollen:s.stats.pollen,floaters:s.floaters.filter(f=>f.color==='#d1eea3').length,targets:new Set(s.bees.filter(b=>b.target>=0).map(b=>b.target)).size};
 });
 expect(result.pollen).toBeGreaterThan(0);
 expect(result.floaters).toBeGreaterThan(5);
 await page.screenshot({path:'test-results/concurrent-bee-gathering.png'});
});

for(const gate of map.gates) test(`walks through the actual ${gate.bees}-bee doorway at its requirement`,async({page})=>{
 test.setTimeout(120000);
 const g=gate;
 await openMap(page,{bees:Array.from({length:g.bees},()=>({kind:'bee-0',level:1})),position:{x:g.x,y:g.y-5,z:g.z+4}});
 await page.keyboard.down('w');
 await expect.poll(()=>page.evaluate(async()=> (await import('/src/game/systems/store.ts')).useGame.getState().game.player.z),{timeout:60000}).toBeLessThan(g.z-3);
 await page.keyboard.up('w');
 await page.screenshot({path:`test-results/${g.bees}-bee-gate-open.png`});
});


test('admin max-level button upgrades every owned bee and saves it',async({page})=>{
 test.setTimeout(120000);
 await openMap(page,{bees:[{kind:'bee-0',level:1},{kind:'bee-26',level:7,gifted:true}]});
 await page.getByRole('button',{name:'Open settings',exact:true}).click();
 await page.getByLabel('Admin code',{exact:true}).fill('4321');
 await page.getByRole('button',{name:'Open admin menu',exact:true}).click();
 await page.getByRole('button',{name:'Max level all bees',exact:true}).click();
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('pollen-peak-save-v2')!));
 expect(saved.bees.map((b:any)=>b.level)).toEqual([25,25]);
 expect(saved.bees.map((b:any)=>b.kind)).toEqual(['bee-0','bee-26']);
 expect(saved.bees.map((b:any)=>b.gifted)).toEqual([false,true]);
 await expect(page.getByRole('complementary',{name:'Admin menu'})).toContainText('All bees are now level 25.');
});
