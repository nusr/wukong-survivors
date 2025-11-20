import type { CharacterType, EnemyType, UnlockType } from "./characters";
import type { WeaponType } from "./reward";

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
  unlocked: boolean;
  unlockCondition: {
    type: UnlockType;
    value: number;
  };
  difficulty: number; // 1-6 corresponding to chapters
  availableEnemies: EnemyType[]; // 该章节出现的敌人
  unlockedCharacters: CharacterType[]; // 通关后解锁的角色
}

export type PermanentUpgradeType =
  | "attack"
  | "health"
  | "armor"
  | "luck"
  | "speed";

// Permanent upgrade interface
export interface PermanentUpgrade {
  id: PermanentUpgradeType;
  level: number;
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
  unlockedCharacters: CharacterType[];
  unlockedMaps: MapType[];
  completedChapters: MapType[]; // 已通关的章节
  ownedWeapons: WeaponType[]; // 已拥有的武器
  language: string;
} & Record<PermanentUpgradeType, number>;

export type Screen = "home" | "mapSelect" | "shop" | "game";

export type MessageType = "info" | "warning" | "error" | "success";
