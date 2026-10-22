import { create } from "zustand";
import { createGame, restore, serialize, notify } from "./simulation";
import type { Game } from "./types";
export const SAVE_KEY = "pollen-peak-save-v2";
function load() {
  try {
    return restore(localStorage.getItem(SAVE_KEY));
  } catch {
    return createGame();
  }
}
export type Menu =
  | null
  | "shop"
  | "eggs"
  | "tickets"
  | "hive"
  | "bees"
  | "quests"
  | "inventory"
  | "map"
  | "settings"
  | "npc";
export const useGame = create<{
  game: Game;
  revision: number;
  menu: Menu;
  placeId: string;
  saveStatus: string;
  refresh: () => void;
  open: (menu: Menu, place?: string) => void;
  save: () => void;
  reset: () => void;
}>((set, get) => ({
  game: load(),
  revision: 0,
  menu: null,
  placeId: "",
  saveStatus: "",
  refresh: () => set((x) => ({ revision: x.revision + 1 })),
  open: (menu, placeId = "") => {
    if (!menu && document.activeElement instanceof HTMLElement)
      document.activeElement.blur();
    set({ menu, placeId });
  },
  save: () => {
    try {
      localStorage.setItem(SAVE_KEY, serialize(get().game));
      set({ saveStatus: "Saved just now" });
    } catch {
      set({ saveStatus: "Save failed — browser storage is unavailable" });
      notify(get().game, "Could not save. Check browser storage permissions.");
    }
  },
  reset: () => {
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch {
      /* Storage unavailable; a fresh in-memory game still works. */
    }
    set({
      game: createGame(),
      revision: 0,
      menu: null,
      saveStatus: "New adventure",
    });
  },
}));
let ctx: AudioContext | undefined;
export function sound(freq = 680) {
  const s = useGame.getState().game;
  if (s.settings.muted || s.settings.volume === 0) return;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
    const osc = ctx.createOscillator(),
      gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(
      freq * 0.6,
      ctx.currentTime + 0.13,
    );
    gain.gain.setValueAtTime(s.settings.volume * 0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16);
    osc.start();
    osc.stop(ctx.currentTime + 0.17);
  } catch {
    /* Audio is optional. */
  }
}
