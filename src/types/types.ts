import type { EnemyType } from "./characters";

export type MapType =
  | "chapter1"
  | "chapter2"
  | "chapter3"
  | "chapter4"
  | "chapter5"
  | "chapter6";

// Map interface definition
export interface GameMap {
  id: MapType;
  chapter: number;
  unlockCondition: {
    type: "default" | "chapter";
    value: number;
  };
  difficulty: number; // 1-6 corresponding to chapters
  availableEnemies: EnemyType[];
}

export type PermanentUpgradeType =
  | "attack"
  | "health"
  | "armor"
  | "luck"
  | "speed"
  | "expBonus"
  | "critRate"
  | "magnetBonus"
  | "collectRange";

// Permanent upgrade interface
export interface PermanentUpgrade {
  id: PermanentUpgradeType;
  maxLevel: number;
  cost: (level: number) => number;
  effect: (level: number) => number;
}

// Game save interface
export type GameSave = {
  totalGold: number;
  totalKills: number;
  totalPlayTime: number;
  bestSurvivalTime: number;
  completedChapters: MapType[];
  language?: Language;
  musicVolume: number;
  musicEnabled: boolean;
  enableAutoSelect: boolean;
  enableUnlockAll: boolean;
  gameTime: number;
} & Record<PermanentUpgradeType, number>;

export type Screen =
  | "home"
  | "mapSelect"
  | "shop"
  | "game"
  | "characterSelect"
  | "settings"
  | "stats"
  | "wiki";

export type MessageType = "info" | "warning" | "error" | "success";

export type Language =
  | "en-US"
  | "zh-CN"
  | "ja-JP"
  | "de-DE"
  | "es-ES"
  | "fr-FR"
  | "ko-KR"
  | "pt-BR"
  | "ru-RU"
  | "zh-TW";
