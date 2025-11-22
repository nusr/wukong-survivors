import type {
  GameMap,
  PermanentUpgrade,
  GameSave,
  MapType,
} from "../types/types";

// Map data - Wukong chapters
export const MAPS: GameMap[] = [
  {
    id: "chapter1",
    chapter: 1,
    unlocked: true,
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
    unlockedCharacters: ["black_bear_guai", "lingxuzi", "wandering_wight"],
  },
  {
    id: "chapter2",
    chapter: 2,
    unlocked: false,
    unlockCondition: {
      type: "kills",
      value: 50,
    },
    difficulty: 2,
    availableEnemies: [
      "rat_minion",
      "sand_minion",
      "tiger_elite",
      "wind_elite",
    ],
    unlockedCharacters: [
      "yellow_wind_sage",
      "tiger_vanguard",
      "stone_vanguard",
      "king_of_flowing_sand",
    ],
  },
  {
    id: "chapter3",
    chapter: 3,
    unlocked: false,
    unlockCondition: {
      type: "kills",
      value: 150,
    },
    difficulty: 3,
    availableEnemies: [
      "monk_minion",
      "spider_minion",
      "centipede_elite",
      "scorpion_elite",
    ],
    unlockedCharacters: [
      "yellow_brow_king",
      "hundred_eyed",
      "mad_tiger",
      "kang_jin_loong",
    ],
  },
  {
    id: "chapter4",
    chapter: 4,
    unlocked: false,
    unlockCondition: {
      type: "time",
      value: 300,
    },
    difficulty: 4,
    availableEnemies: [
      "spider_woman_minion",
      "centipede_minion",
      "violet_spider_elite",
      "poison_centipede_elite",
    ],
    unlockedCharacters: [
      "spider_celestial",
      "hundred_eyed_daoist",
      "elder_jinchi",
      "hundred_eyed_daoist_master",
    ],
  },
  {
    id: "chapter5",
    chapter: 5,
    unlocked: false,
    unlockCondition: {
      type: "kills",
      value: 400,
    },
    difficulty: 5,
    availableEnemies: [
      "fire_demon_minion",
      "bull_soldier_minion",
      "fire_general_elite",
      "bull_captain_elite",
    ],
    unlockedCharacters: ["bull_king", "red_boy", "rakshasa", "yaksha_king"],
  },
  {
    id: "chapter6",
    chapter: 6,
    unlocked: false,
    unlockCondition: {
      type: "kills",
      value: 800,
    },
    difficulty: 6,
    availableEnemies: [
      "celestial_guard_minion",
      "thunder_minion",
      "celestial_general_elite",
      "dragon_guardian_elite",
    ],
    unlockedCharacters: [
      "erlang_shen",
      "great_sage_heaven",
      "golden_cicada",
      "stone_monkey",
    ],
  },
];

// Permanent upgrade configuration
export const PERMANENT_UPGRADES: PermanentUpgrade[] = [
  {
    id: "attack",
    level: 0,
    maxLevel: 10,
    cost: (level) => 50 + level * 50,
    effect: (level) => level * 2,
  },
  {
    id: "health",
    level: 0,
    maxLevel: 10,
    cost: (level) => 40 + level * 40,
    effect: (level) => level * 10,
  },
  {
    id: "armor",
    level: 0,
    maxLevel: 10,
    cost: (level) => 60 + level * 60,
    effect: (level) => level * 1,
  },
  {
    id: "luck",
    level: 0,
    maxLevel: 10,
    cost: (level) => 80 + level * 80,
    effect: (level) => level * 2,
  },
  {
    id: "speed",
    level: 0,
    maxLevel: 5,
    cost: (level) => 100 + level * 100,
    effect: (level) => level * 10,
  },
];

// Default save data
export const DEFAULT_SAVE: GameSave = {
  totalGold: 0,
  totalKills: 0,
  bestSurvivalTime: 0,
  totalPlayTime: 0,
  unlockedCharacters: ["destined_one"],
  unlockedMaps: ["chapter1"],
  completedChapters: [],
  ownedWeapons: ["golden_staff"],
  language: "en-US",
  attack: 0,
  health: 0,
  armor: 0,
  luck: 0,
  speed: 0,
};

export const getMapImagePath = (id: MapType): string => {
  return `assets/maps/${id}.svg`;
};

export const EVENT_MAP = {
  BACK_TO_HOME: "BACK_TO_HOME",
  SHOW_END_GAME_MODAL: "SHOW_END_GAME_MODAL",
};

export const GAME_SCENE_KEY = "GameScene";

export const DEFAULT_GAME_TIME = 30 * 60; // 30 minutes in seconds

export const SCREEN_SIZE = {
  width: window.innerWidth,
  height: window.innerHeight,
};

export const START_Z_INDEX = 2;

export * from "./characters";
export * from "./enemies";
export * from "./rewards";
