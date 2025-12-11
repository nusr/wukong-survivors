import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { DEFAULT_SAVE, PERMANENT_UPGRADES, MAPS } from "../constant";
import type {
  GameSave,
  PermanentUpgradeType,
  MapType,
  Language,
} from "../types";
import { useShallow } from "zustand/react/shallow";
import { useAppStore } from "./app";
import Phaser from "phaser";

const SAVE_KEY = "wu_kong_survivors_save_1";

// Zustand Store interface
interface SaveStore extends GameSave {
  // Actions
  addGold: (amount: number) => void;
  spendGold: (amount: number) => boolean;
  addKills: (amount: number) => void;
  updatePlayTime: (seconds: number) => void;
  upgradePermanent: (upgradeId: PermanentUpgradeType) => boolean;
  resetPermanentUpgrades: () => void;
  setLanguage: (language: Language) => void;
  resetAll: () => void;
  completeChapter: (map: MapType[]) => void;
  setMusicVolume: (volume: number) => void;
  setMusicEnabled: (enabled: boolean) => void;
  setAutoSelectEnabled: (enabled: boolean) => void;
  setUnlockAllEnabled: (enabled: boolean) => void;
  setGameTime: (gameTime: number) => void;
}

// Create Zustand Store with persist middleware
export const useSaveStore = create<SaveStore>()(
  persist(
    (set, get) => ({
      ...DEFAULT_SAVE,
      setGameTime(gameTime: number) {
        set({ gameTime });
      },
      setAutoSelectEnabled(enabled) {
        set({ enableAutoSelect: enabled });
      },
      setUnlockAllEnabled(enabled) {
        const { completeChapter } = get();
        set({ enableUnlockAll: enabled });
        if (enabled) {
          completeChapter(MAPS.map((m) => m.id));
        }
      },
      setMusicVolume(volume) {
        const t = Phaser.Math.Clamp(volume, 0, 1);
        set({ musicVolume: t });
      },
      setMusicEnabled(enabled) {
        set({ musicEnabled: enabled });
      },

      // Actions
      addGold: (amount: number) => {
        set({ totalGold: get().totalGold + amount });
        useAppStore.getState().checkUnlocks();
      },

      spendGold: (amount: number) => {
        const state = get();
        if (state.totalGold >= amount) {
          set({ totalGold: state.totalGold - amount });
          return true;
        }
        return false;
      },

      addKills: (amount: number) => {
        set({
          totalKills: get().totalKills + amount,
        });
        useAppStore.getState().checkUnlocks();
      },

      updatePlayTime: (seconds: number) => {
        seconds = Math.floor(seconds);

        const state = get();

        const newPlayTime = state.totalPlayTime + seconds;
        const newBestTime =
          seconds > state.bestSurvivalTime ? seconds : state.bestSurvivalTime;
        set({
          totalPlayTime: newPlayTime,
          bestSurvivalTime: newBestTime,
        });
        useAppStore.getState().checkUnlocks();
      },

      upgradePermanent: (upgradeId: PermanentUpgradeType) => {
        const state = get();
        const upgrade = PERMANENT_UPGRADES.find((u) => u.id === upgradeId);
        if (!upgrade) return false;

        const currentLevel = state[upgradeId] || 0;
        if (currentLevel >= upgrade.maxLevel) return false;

        const cost = upgrade.cost(currentLevel);
        if (state.totalGold >= cost) {
          set({
            totalGold: state.totalGold - cost,
            [upgradeId]: currentLevel + 1,
          });
          return true;
        }
        return false;
      },

      resetPermanentUpgrades: () => {
        const state = get();
        let refund = 0;

        PERMANENT_UPGRADES.forEach((item) => {
          const level = state[item.id] || 0;
          for (let i = 0; i < level; i++) {
            refund += item.cost(i);
          }
        });

        refund = Math.floor(refund);

        // Reset all levels
        const resetUpgrades: Partial<Record<PermanentUpgradeType, number>> = {};
        PERMANENT_UPGRADES.forEach((item) => {
          resetUpgrades[item.id] = 0;
        });

        set({
          ...resetUpgrades,
          totalGold: state.totalGold + refund,
        });
      },

      setLanguage: (language) => set({ language }),

      resetAll: () => set({ ...DEFAULT_SAVE }),

      // Complete chapter and unlock corresponding characters
      completeChapter: (chapters) => {
        const { completedChapters = [] } = get();

        const list = Array.from(new Set([...completedChapters, ...chapters]));

        set({ completedChapters: list });

        useAppStore.getState().checkUnlocks();
      },
    }),
    {
      name: SAVE_KEY,
      merge: (persistedState, currentState) => ({
        ...DEFAULT_SAVE,
        ...currentState,
        ...(persistedState as Partial<GameSave>),
      }),
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

const getTotalGold = (state: GameSave) => state.totalGold;
const getTotalKills = (state: GameSave) => state.totalKills;
const getBestSurvivalTime = (state: GameSave) => state.bestSurvivalTime;
const getTotalPlayTime = (state: GameSave) => state.totalPlayTime;

const getCompletedChapters = (state: GameSave) => state.completedChapters;
const getLanguage = (state: GameSave) => state.language;
const getEnableAutoSelect = (state: GameSave) => state.enableAutoSelect;
const getEnableUnlockAll = (state: GameSave) => state.enableUnlockAll;
const getMusicEnabled = (state: GameSave) => state.musicEnabled;
const getMusicVolume = (state: GameSave) => state.musicVolume;
const getGameTime = (state: GameSave) => state.gameTime;

const getShopLevel = (
  state: GameSave,
): Record<PermanentUpgradeType, number> => ({
  attack: state.attack,
  health: state.health,
  armor: state.armor,
  speed: state.speed,
  luck: state.luck,
  expBonus: state.expBonus,
  critRate: state.critRate,
  magnetBonus: state.magnetBonus,
  collectRange: state.collectRange,
});

export const useTotalGold = () => useSaveStore(useShallow(getTotalGold));
export const useTotalKills = () => useSaveStore(useShallow(getTotalKills));
export const useBestSurvivalTime = () =>
  useSaveStore(useShallow(getBestSurvivalTime));
export const useTotalPlayTime = () =>
  useSaveStore(useShallow(getTotalPlayTime));

export const useCompletedChapters = () =>
  useSaveStore(useShallow(getCompletedChapters));
export const useLanguage = () => useSaveStore(useShallow(getLanguage));

export const useShopLevel = () => useSaveStore(useShallow(getShopLevel));
export const useEnableAutoSelect = () =>
  useSaveStore(useShallow(getEnableAutoSelect));
export const useEnableUnlockAll = () =>
  useSaveStore(useShallow(getEnableUnlockAll));
export const useMusicEnabled = () => useSaveStore(useShallow(getMusicEnabled));
export const useMusicVolume = () => useSaveStore(useShallow(getMusicVolume));
export const useGameTime = () => useSaveStore(useShallow(getGameTime));
