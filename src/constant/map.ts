import type { GameMap, PermanentUpgrade, GameSave } from "../types";
import { upgradeLevelGold } from "../util";

export const DEFAULT_GAME_TIME = 30 * 60; // 30 minutes in seconds
// Map data - Wukong chapters
export const MAPS: GameMap[] = [
  {
    id: "chapter1",
    chapter: 1,
    unlockCondition: {
      type: "default",
      value: 0,
    },
    difficulty: 1,
    availableEnemies: [
      "wolf_minion",
      "ghost_minion",
      "bear_elite",
      "snake_elite",
    ],
  },
  {
    id: "chapter2",
    chapter: 2,
    unlockCondition: {
      type: "chapter",
      value: 1,
    },
    difficulty: 2,
    availableEnemies: [
      "rat_minion",
      "sand_minion",
      "tiger_elite",
      "wind_elite",
    ],
  },
  {
    id: "chapter3",
    chapter: 3,
    unlockCondition: {
      type: "chapter",
      value: 2,
    },
    difficulty: 3,
    availableEnemies: [
      "monk_minion",
      "spider_minion",
      "centipede_elite",
      "scorpion_elite",
    ],
  },
  {
    id: "chapter4",
    chapter: 4,
    unlockCondition: {
      type: "chapter",
      value: 3,
    },
    difficulty: 4,
    availableEnemies: [
      "spider_woman_minion",
      "centipede_minion",
      "violet_spider_elite",
      "poison_centipede_elite",
    ],
  },
  {
    id: "chapter5",
    chapter: 5,
    unlockCondition: {
      type: "chapter",
      value: 4,
    },
    difficulty: 5,
    availableEnemies: [
      "fire_demon_minion",
      "bull_soldier_minion",
      "fire_general_elite",
      "bull_captain_elite",
    ],
  },
  {
    id: "chapter6",
    chapter: 6,
    unlockCondition: {
      type: "chapter",
      value: 5,
    },
    difficulty: 6,
    availableEnemies: [
      "celestial_guard_minion",
      "thunder_minion",
      "celestial_general_elite",
      "dragon_guardian_elite",
    ],
  },
];
// Permanent upgrade configuration

export const BASE_UPGRADE_PERCENTAGE = 0.02;
export const MAX_UPGRADE_LEVEL = 10;

export const PERMANENT_UPGRADES: PermanentUpgrade[] = [
  {
    id: "attack",
    maxLevel: MAX_UPGRADE_LEVEL,
    cost: upgradeLevelGold,
    effect: (level) => level * 3,
  },
  {
    id: "health",
    maxLevel: MAX_UPGRADE_LEVEL,
    cost: upgradeLevelGold,
    effect: (level) => level * 10,
  },
  {
    id: "armor",
    maxLevel: MAX_UPGRADE_LEVEL,
    cost: upgradeLevelGold,
    effect: (level) => level * 2,
  },
  {
    id: "luck",
    maxLevel: MAX_UPGRADE_LEVEL,
    cost: upgradeLevelGold,
    effect: (level) => level * 2,
  },
  {
    id: "speed",
    maxLevel: MAX_UPGRADE_LEVEL,
    cost: upgradeLevelGold,
    effect: (level) => level * 5,
  },
  {
    id: "expBonus",
    maxLevel: MAX_UPGRADE_LEVEL,
    cost: upgradeLevelGold,
    effect: (level) => level * BASE_UPGRADE_PERCENTAGE,
  },
  {
    id: "critRate",
    maxLevel: MAX_UPGRADE_LEVEL,
    cost: upgradeLevelGold,
    effect: (level) => level * BASE_UPGRADE_PERCENTAGE,
  },
  {
    id: "magnetBonus",
    maxLevel: MAX_UPGRADE_LEVEL,
    cost: upgradeLevelGold,
    effect: (level) => level * BASE_UPGRADE_PERCENTAGE,
  },
  {
    id: "collectRange",
    maxLevel: MAX_UPGRADE_LEVEL,
    cost: upgradeLevelGold,
    effect: (level) => level * BASE_UPGRADE_PERCENTAGE,
  },
];
// Default save data

export const DEFAULT_SAVE: GameSave = {
  totalGold: 0,
  totalKills: 0,
  bestSurvivalTime: 0,
  totalPlayTime: 0,
  completedChapters: [],
  attack: 0,
  health: 0,
  armor: 0,
  luck: 0,
  speed: 0,
  expBonus: 0,
  critRate: 0,
  magnetBonus: 0,
  collectRange: 0,
  musicVolume: 0.5,
  musicEnabled: true,
  enableAutoSelect: false,
  enableUnlockAll: false,
  gameTime: DEFAULT_GAME_TIME,
};

export const WORLD_SIZE = 4000;
