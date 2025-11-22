import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  DEFAULT_SAVE,
  CHARACTERS_DATA,
  PERMANENT_UPGRADES,
  MAPS,
} from "../constant";
import type {
  GameSave,
  WeaponType,
  PermanentUpgradeType,
  MapType,
  CharacterType,
} from "../types";
import { useShallow } from "zustand/react/shallow";

const SAVE_KEY = "wukong_survivors_save_1";

// Helper function to check unlock conditions
const checkUnlocks = (state: GameSave): Partial<GameSave> => {
  const { unlockedCharacters, unlockedMaps } = state;

  // Check character unlock
  Object.values(CHARACTERS_DATA).forEach((char) => {
    if (!unlockedCharacters.includes(char.id)) {
      let unlocked = false;

      switch (char.unlockCondition.type) {
        case "kills":
          unlocked = state.totalKills >= char.unlockCondition.value;
          break;
        case "time":
          unlocked = state.bestSurvivalTime >= char.unlockCondition.value;
          break;
        case "gold":
          unlocked = state.totalGold >= char.unlockCondition.value;
          break;
      }

      if (unlocked) {
        unlockedCharacters.push(char.id);
      }
    }
  });

  // Check map unlock
  MAPS.forEach((map) => {
    if (!unlockedMaps.includes(map.id)) {
      let unlocked = false;

      switch (map.unlockCondition.type) {
        case "kills":
          unlocked = state.totalKills >= map.unlockCondition.value;
          break;
        case "time":
          unlocked = state.bestSurvivalTime >= map.unlockCondition.value;
          break;
        case "gold":
          unlocked = state.totalGold >= map.unlockCondition.value;
          break;
      }

      if (unlocked) {
        unlockedMaps.push(map.id);
      }
    }
  });

  return { unlockedCharacters, unlockedMaps };
};

// Zustand Store interface
interface SaveStore extends GameSave {
  // Actions
  addGold: (amount: number) => void;
  spendGold: (amount: number) => boolean;
  addKills: (amount: number) => void;
  updatePlayTime: (seconds: number) => void;
  upgradePermanent: (upgradeId: PermanentUpgradeType) => boolean;
  resetPermanentUpgrades: () => void;
  setLanguage: (language: string) => void;
  resetAll: () => void;
  updateSave: (newSave: Partial<GameSave>) => void;
  checkUnlocks: () => void;
  addWeapon: (weaponId: WeaponType) => void;
  getOwnedWeapons: () => string[];
  completeChapter: (map: MapType) => void;
}

// Create Zustand Store with persist middleware
export const useSaveStore = create<SaveStore>()(
  persist(
    (set, get) => ({
      // Initial state
      ...DEFAULT_SAVE,

      // Actions
      addGold: (amount: number) => {
        const { totalGold } = get();

        set({ totalGold: totalGold + amount });
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
        const state = get();

        const newState = checkUnlocks({
          ...state,
          totalKills: state.totalKills + amount,
        });
        set(newState);
      },

      updatePlayTime: (seconds: number) => {
        seconds = Math.floor(seconds);

        const state = get();

        const newPlayTime = state.totalPlayTime + seconds;
        const newBestTime =
          seconds > state.bestSurvivalTime ? seconds : state.bestSurvivalTime;
        const newState = checkUnlocks({
          ...state,
          totalPlayTime: newPlayTime,
          bestSurvivalTime: newBestTime,
        });
        return newState;
      },

      upgradePermanent: (upgradeId: PermanentUpgradeType) => {
        const state = get();
        const upgrade = PERMANENT_UPGRADES.find((u) => u.id === upgradeId);
        if (!upgrade) return false;

        const currentLevel = state[upgradeId] || 0;
        if (currentLevel >= upgrade.maxLevel) return false;

        const cost = upgrade.cost(currentLevel);
        if (state.totalGold >= cost) {
          set((state) => ({
            totalGold: state.totalGold - cost,
            [upgradeId]: currentLevel + 1,
          }));
          return true;
        }
        return false;
      },

      resetPermanentUpgrades: () =>
        set((state) => {
          // Calculate refund (70%)
          let refund = 0;

          PERMANENT_UPGRADES.forEach((item) => {
            const level = state[item.id] || 0;
            for (let i = 0; i < level; i++) {
              refund += item.cost(i);
            }
          });

          refund = Math.floor(refund * 0.7);

          // Reset all levels
          const resetUpgrades: Partial<Record<PermanentUpgradeType, number>> =
            {};
          PERMANENT_UPGRADES.forEach((item) => {
            resetUpgrades[item.id] = 0;
          });

          return {
            ...resetUpgrades,
            totalGold: state.totalGold + refund,
          };
        }),

      setLanguage: (language) => set({ language }),

      resetAll: () => set({ ...DEFAULT_SAVE }),

      updateSave: (newSave) => set(newSave),
      checkUnlocks: () => {
        set(checkUnlocks(get()));
      },

      // Complete chapter and unlock corresponding characters
      completeChapter: (chapter: MapType) => {
        const { completedChapters = [], unlockedCharacters = [] } = get();

        if (completedChapters.includes(chapter)) {
          return;
        }

        completedChapters.push(chapter);
        // Unlock characters for this chapter
        const map = MAPS.find((m) => m.id === chapter);
        if (map && map.unlockedCharacters) {
          const newUnlockedCharacters = [...unlockedCharacters];
          map.unlockedCharacters.forEach((charId) => {
            if (!newUnlockedCharacters.includes(charId)) {
              newUnlockedCharacters.push(charId);
            }
          });

          set({
            completedChapters: [...completedChapters],
            unlockedCharacters: newUnlockedCharacters,
          });
          return;
        }

        set({ completedChapters: [...completedChapters] });
      },

      // Manually unlock character
      unlockCharacter: (characterId: CharacterType) => {
        const { unlockedCharacters } = get();

        if (!unlockedCharacters.includes(characterId)) {
          set({ unlockedCharacters: [...unlockedCharacters, characterId] });
        }
      },

      // Add weapon to owned weapons
      addWeapon: (weaponId) => {
        const { ownedWeapons } = get();

        if (!ownedWeapons.includes(weaponId)) {
          set({ ownedWeapons: [...ownedWeapons, weaponId] });
        }
      },

      // Get owned weapons
      getOwnedWeapons: () => {
        return get().ownedWeapons;
      },
    }),
    {
      name: SAVE_KEY,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

const getTotalGold = (state: GameSave) => state.totalGold;
const getTotalKills = (state: GameSave) => state.totalKills;
const getBestSurvivalTime = (state: GameSave) => state.bestSurvivalTime;
const getTotalPlayTime = (state: GameSave) => state.totalPlayTime;

const getUnlockedCharacters = (state: GameSave) => state.unlockedCharacters;
const getUnlockedMaps = (state: GameSave) => state.unlockedMaps;
const getCompletedChapters = (state: GameSave) => state.completedChapters;
const getLanguage = (state: GameSave) => state.language;

const getShopLevel = (state: GameSave) => ({
  attack: state.attack,
  health: state.health,
  armor: state.armor,
  speed: state.speed,
  luck: state.luck,
});

export const useTotalGold = () => useSaveStore(useShallow(getTotalGold));
export const useTotalKills = () => useSaveStore(useShallow(getTotalKills));
export const useBestSurvivalTime = () =>
  useSaveStore(useShallow(getBestSurvivalTime));
export const useTotalPlayTime = () =>
  useSaveStore(useShallow(getTotalPlayTime));

export const useUnlockedCharacters = () =>
  useSaveStore(useShallow(getUnlockedCharacters));
export const useUnlockedMaps = () => useSaveStore(useShallow(getUnlockedMaps));
export const useCompletedChapters = () =>
  useSaveStore(useShallow(getCompletedChapters));
export const useLanguage = () => useSaveStore(useShallow(getLanguage));

export const useShopLevel = () => useSaveStore(useShallow(getShopLevel));
