import type { Color, Vec } from "../data/content";
export type Flower = Vec & {
  id: number;
  field: string;
  color: Color;
  size: number;
  pollen: number;
  max: number;
  regen: number;
  multiplier: number;
  pollination: number;
  goo: number;
  texture?: number;
  width?: number;
};
export type BeeState =
  | "following"
  | "searching"
  | "flying"
  | "gathering"
  | "returning"
  | "attacking"
  | "hive"
  | "resting";
export type Bee = Vec & {
  id: string;
  kind: string;
  level: number;
  bond: number;
  energy: number;
  state: BeeState;
  target: number;
  timer: number;
  abilityTimer: number;
  phase: number;
  wander?: { x: number; y: number; z: number; remaining: number };
  gifted: boolean;
};
export type Enemy = Vec & {
  id: number;
  type: number;
  homeX: number;
  homeZ: number;
  hp: number;
  maxHp: number;
  gate: number;
  cooldown: number;
  respawn: number;
  hit: number;
  windup: number;
};
export type Token = Vec & {
  gifted?: boolean;
  source?: string;
  id: number;
  kind: string;
  value: number;
  life: number;
};
export type AbilityEffect = Vec & {
  id: number;
  kind: string;
  life: number;
  radius: number;
  level: number;
  gifted: boolean;
  tick: number;
  stored: number;
  duration?: number;
  group?: number;
  points?: { x: number; z: number }[];
};
export type Buff = {
  kind: string;
  remaining: number;
  value: number;
  stacks?: number;
};
export type Floater = Vec & {
  id: number;
  text: string;
  color: string;
  life: number;
};
export type WorldEffect = Vec & {
  id: number;
  kind: string;
  radius: number;
  life: number;
  duration: number;
};
export type Game = {
  adminShopUnlocks: boolean;
  adminBoosts: { pollen: boolean; honey: boolean };
  version: 2;
  hive: number;
  honey: number;
  pollen: number;
  capacity: number;
  tool: string;
  bag: string;
  boots: string;
  hat: string;
  owned: string[];
  slots: number;
  eggsPurchased: number;
  jelliesPurchased: number;
  lifetime: Record<string, number>;
  badges: Record<string, number>;
  crafting: { item: string; quantity: number; elapsed: number } | null;
  sprinkler: number;
  sprinklers: (Vec & {
    id: number;
    field: string;
    setup: number;
    timer: number;
    pulse: number;
  })[];
  bees: Bee[];
  discoveredBees: string[];
  player: Vec & {
    yaw: number;
    vy: number;
    hp: number;
    invulnerable: number;
    moving: boolean;
    grounded: boolean;
    swing: number;
  };
  flowers: Flower[];
  enemies: Enemy[];
  tokens: Token[];
  buffs: Buff[];
  floaters: Floater[];
  effects: AbilityEffect[];
  beeProgress: { tabbyLove: number; fetch: number };
  balloonPollen: number;
  inventory: Record<string, number>;
  hotbar: (string | null)[];
  accepted: Record<string, number[]>;
  completed: string[];
  unlocks: number[];
  stats: {
    pollen: number;
    honey: number;
    spent: number;
    kills: number;
    tokens: number;
    hatches: number;
    levels: number;
    time: number;
    jellyRolls: number;
  };
  flight: { from: Vec; to: Vec; elapsed: number; duration: number } | null;
  converting: boolean;
  clock: number;
  gatherCooldown: number;
  lastFull: number;
  seed: number;
  nextId: number;
  notification: string;
  noticeId: number;
  cooldowns: Record<string, number>;
  challenge: { remaining: number; gathered: number; target: number } | null;
  jellyRun: { beeId: string; used: number; running: boolean; rarity: "Any" | "Legendary" | "Mythic"; gifted: boolean } | null;
  settings: {
    volume: number;
    muted: boolean;
    sensitivity: number;
    quality: "high" | "low";
    jellyRarity: "Any" | "Legendary" | "Mythic";
    jellyGifted: boolean;
  };
};
