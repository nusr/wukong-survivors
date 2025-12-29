import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { DEFAULT_GAME_TIME, MAPS } from "../constant";
import type { Language } from "../types";
import { useShallow } from "zustand/react/shallow";
import { useSaveStore } from "./save";
import Phaser from "phaser";

export type SettingState = {
  language?: Language;
  musicVolume: number;
  musicEnabled: boolean;
  enableAutoSelect: boolean;
  enableUnlockAll: boolean;
  gameTime: number;
  enableFullScreen: boolean;
};

export const DEFAULT_SETTING: SettingState = {
  musicVolume: 0.5,
  musicEnabled: true,
  enableAutoSelect: false,
  enableUnlockAll: false,
  gameTime: DEFAULT_GAME_TIME,
  enableFullScreen: false,
};

const SAVE_KEY = "wu_kong_survivors_setting";

// Zustand Store interface
interface SettingStore extends SettingState {
  setLanguage: (language: Language) => void;
  resetAll: () => void;
  setMusicVolume: (volume: number) => void;
  setMusicEnabled: (enabled: boolean) => void;
  setAutoSelectEnabled: (enabled: boolean) => void;
  setUnlockAllEnabled: (enabled: boolean) => void;
  setGameTime: (gameTime: number) => void;
  setFullScreenEnabled: (enabled: boolean) => void;
}

export const useSettingStore = create<SettingStore>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTING,
      setFullScreenEnabled(enabled: boolean) {
        set({ enableFullScreen: enabled });
      },
      setGameTime(gameTime: number) {
        set({ gameTime });
      },
      setAutoSelectEnabled(enabled) {
        set({ enableAutoSelect: enabled });
      },
      setUnlockAllEnabled(enabled) {
        set({ enableUnlockAll: enabled });
        if (enabled) {
          useSaveStore.getState().completeChapter(MAPS.map((m) => m.id));
        }
      },
      setMusicVolume(volume) {
        const t = Phaser.Math.Clamp(volume, 0, 1);
        set({ musicVolume: t });
      },
      setMusicEnabled(enabled) {
        set({ musicEnabled: enabled });
      },

      setLanguage: (language) => set({ language }),

      resetAll: () => set({ ...DEFAULT_SETTING }),
    }),
    {
      name: SAVE_KEY,
      merge: (persistedState, currentState) => ({
        ...DEFAULT_SETTING,
        ...currentState,
        ...(persistedState as Partial<SettingState>),
      }),
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

const getLanguage = (state: SettingState) => state.language;
const getEnableAutoSelect = (state: SettingState) => state.enableAutoSelect;
const getEnableUnlockAll = (state: SettingState) => state.enableUnlockAll;
const getMusicEnabled = (state: SettingState) => state.musicEnabled;
const getMusicVolume = (state: SettingState) => state.musicVolume;
const getGameTime = (state: SettingState) => state.gameTime;
const getEnableFullScreen = (state: SettingState) => state.enableFullScreen;

export const useLanguage = () => useSettingStore(useShallow(getLanguage));
export const useEnableAutoSelect = () =>
  useSettingStore(useShallow(getEnableAutoSelect));
export const useEnableUnlockAll = () =>
  useSettingStore(useShallow(getEnableUnlockAll));
export const useMusicEnabled = () =>
  useSettingStore(useShallow(getMusicEnabled));
export const useMusicVolume = () => useSettingStore(useShallow(getMusicVolume));
export const useGameTime = () => useSettingStore(useShallow(getGameTime));
export const useEnableFullScreen = () =>
  useSettingStore(useShallow(getEnableFullScreen));
