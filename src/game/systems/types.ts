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
  id: number;
  kind: string;
  value: number;
  life: number;
};
export type Buff = { kind: string; remaining: number; value: number };
export type Floater = Vec & {
  id: number;
  text: string;
  color: string;
  life: number;
};
export type Game = {
  version: 2;
  honey: number;
  pollen: number;
  capacity: number;
  tool: string;
  bag: string;
  boots: string;
  hat: string;
  owned: string[];
  slots: number;
  bees: Bee[];
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
  inventory: Record<string, number>;
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
  };
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
  settings: {
    volume: number;
    muted: boolean;
    sensitivity: number;
    quality: "high" | "low";
  };
};
