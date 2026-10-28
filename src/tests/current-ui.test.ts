import { afterEach, describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import HUD from "../components/HUD";
import { useGame } from "../game/systems/store";
import * as simulation from "../game/systems/simulation";
import { beeFaceMarkup } from "../game/bees/faces";
import { PLACES } from "../game/data/content";

afterEach(() => vi.unstubAllGlobals());

describe("current published interface compatibility", () => {
  it("uses the current face sheet palette for the Basic Bee portrait", () => {
    expect(beeFaceMarkup("basic", "#f6dd78")).toContain("#1b2a35");
  });
  it("renders compact counters and icon menus without the old quest tracker", () => {
    const html = renderToStaticMarkup(createElement(HUD));
    expect(html).toContain('class="system-buttons"');
    expect(html).toContain('aria-label="Show badges"');
    expect(html).not.toContain('class="quest-tracker"');
    expect(html).not.toContain('class="brand"');
  });

  it("returns to the same shop after closing its inventory overlay", () => {
    vi.stubGlobal("document", { activeElement: null });
    vi.stubGlobal("HTMLElement", class {});
    const store = useGame.getState();
    store.open("shop", "blue-hq");
    store.open("inventory");
    expect(useGame.getState().shopContext).toEqual({ menu: "shop", placeId: "blue-hq" });
    store.open(null);
    expect(useGame.getState().menu).toBe("shop");
    expect(useGame.getState().placeId).toBe("blue-hq");
    useGame.getState().leaveShop();
    expect(useGame.getState().shopContext).toBeNull();
    expect(useGame.getState().menu).toBeNull();
  });

  it("bulk purchases charge every increasing egg and Royal Jelly price", () => {
    const s = simulation.createGame();
    s.honey = 1_000_000;
    expect(simulation.buy(s, "egg", 3)).toBe(true);
    expect(s.eggsPurchased).toBe(3);
    expect(s.honey).toBe(1_000_000 - 1000 - 2500 - 4250);
    const before = s.honey;
    expect(simulation.buy(s, "jelly", 2)).toBe(true);
    expect(s.honey).toBe(before - 250_000 - 260_000);
    expect(s.jelliesPurchased).toBe(2);
  });

  it("buy max respects increasing prices, inventory limits and invalid quantities", () => {
    const s = simulation.createGame();
    s.honey = 7000;
    expect(simulation.maxPurchase(s, "egg")).toBe(2);
    expect(simulation.buy(s, "egg", 3)).toBe(false);
    expect(s.honey).toBe(7000);
    expect(simulation.buy(s, "treat", NaN)).toBe(false);
    expect(simulation.buy(s, "treat", 0.5)).toBe(false);
    s.honey = 100_000;
    s.inventory.treat = simulation.MAX_ITEMS - 1;
    expect(simulation.maxPurchase(s, "treat")).toBe(1);
  });

  it("bulk Star Treat purchases spend tickets at the Ticket Tent", () => {
    const s = simulation.createGame();
    s.inventory.ticket = 5000;
    Object.assign(s.player, PLACES.find(p => p.id === "tickets"));
    expect(simulation.buyStarTreats(s, 3)).toBe(true);
    expect(s.inventory.starTreat).toBe(3);
    expect(s.inventory.ticket).toBe(2000);
    expect(simulation.buyStarTreats(s, 3)).toBe(false);
    expect(simulation.buyStarTreats(s, 0)).toBe(false);
    expect(s.inventory.starTreat).toBe(3);
  });

  it("restores auto-jelly settings and preserves bulk inventory quantities", () => {
    const s = simulation.createGame();
    s.settings.jellyRarity = "Legendary";
    s.settings.jellyGifted = true;
    s.inventory.jelly = 1_000_001;
    const restored = simulation.restore(simulation.serialize(s));
    expect(restored.settings.jellyRarity).toBe("Legendary");
    expect(restored.settings.jellyGifted).toBe(true);
    expect(restored.inventory.jelly).toBe(1_000_001);
    expect(restored.jellyRun).toBeNull();
  });

  it("auto-jelly uses actual rolls until the target or inventory is exhausted", () => {
    const s = simulation.createGame();
    s.inventory.jelly = 20;
    s.settings.jellyRarity = "Mythic";
    s.settings.jellyGifted = true;
    expect(simulation.reroll(s, s.bees[0].id)).toBe(true);
    expect(s.jellyRun?.used).toBe(20);
    expect(s.jellyRun?.running).toBe(false);
    expect(s.inventory.jelly).toBe(0);
    expect(s.bees[0].level).toBe(1);
  });

  it("cancelled auto-jelly stops spending and still supports Star Jelly", () => {
    const s = simulation.createGame();
    s.inventory.jelly = 100_000;
    s.settings.jellyRarity = "Mythic";
    s.settings.jellyGifted = true;
    simulation.reroll(s, s.bees[0].id);
    expect(s.jellyRun?.running).toBe(true);
    simulation.cancelAutoJelly(s);
    const left = s.inventory.jelly;
    simulation.updateAutoJelly(s);
    expect(s.inventory.jelly).toBe(left);
    s.inventory.starJelly = 1;
    expect(simulation.reroll(s, s.bees[0].id, "starJelly")).toBe(true);
    expect(s.bees[0].gifted).toBe(true);
    expect(s.inventory.starJelly).toBe(0);
  });
});
