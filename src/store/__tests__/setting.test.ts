import { describe, it, expect, beforeEach } from "vitest";
import { useSettingStore, DEFAULT_SETTING } from "../setting";
import { useSaveStore } from "../save";
import { MAPS } from "../../constant";

describe("useSettingStore", () => {
  beforeEach(() => {
    useSettingStore.getState().resetAll();
    useSaveStore.getState().resetAll();
  });

  it("should have default initial state", () => {
    const state = useSettingStore.getState();
    expect(state.musicVolume).toBe(DEFAULT_SETTING.musicVolume);
    expect(state.musicEnabled).toBe(DEFAULT_SETTING.musicEnabled);
    expect(state.enableAutoSelect).toBe(DEFAULT_SETTING.enableAutoSelect);
    expect(state.enableUnlockAll).toBe(DEFAULT_SETTING.enableUnlockAll);
    expect(state.gameTime).toBe(DEFAULT_SETTING.gameTime);
    expect(state.enableFullScreen).toBe(DEFAULT_SETTING.enableFullScreen);
  });

  it("should set language", () => {
    useSettingStore.getState().setLanguage("zh-CN");
    expect(useSettingStore.getState().language).toBe("zh-CN");
  });

  it("should set full screen enabled", () => {
    useSettingStore.getState().setFullScreenEnabled(true);
    expect(useSettingStore.getState().enableFullScreen).toBe(true);
  });

  it("should set game time", () => {
    useSettingStore.getState().setGameTime(30);
    expect(useSettingStore.getState().gameTime).toBe(30);
  });

  it("should set auto select enabled", () => {
    useSettingStore.getState().setAutoSelectEnabled(true);
    expect(useSettingStore.getState().enableAutoSelect).toBe(true);
  });

  it("should set music enabled", () => {
    useSettingStore.getState().setMusicEnabled(false);
    expect(useSettingStore.getState().musicEnabled).toBe(false);
  });

  it("should clamp music volume between 0 and 1", () => {
    useSettingStore.getState().setMusicVolume(1.5);
    expect(useSettingStore.getState().musicVolume).toBe(1);

    useSettingStore.getState().setMusicVolume(-0.5);
    expect(useSettingStore.getState().musicVolume).toBe(0);

    useSettingStore.getState().setMusicVolume(0.3);
    expect(useSettingStore.getState().musicVolume).toBe(0.3);
  });

  it("should complete all chapters when unlock all is enabled", () => {
    useSettingStore.getState().setUnlockAllEnabled(true);

    expect(useSettingStore.getState().enableUnlockAll).toBe(true);
    MAPS.forEach((m) => {
      expect(useSaveStore.getState().completedChapters).toContain(m.id);
    });
  });

  it("should not complete chapters when unlock all is disabled", () => {
    useSettingStore.getState().setUnlockAllEnabled(false);

    expect(useSettingStore.getState().enableUnlockAll).toBe(false);
    expect(useSaveStore.getState().completedChapters).toHaveLength(0);
  });

  it("should reset all settings to default", () => {
    useSettingStore.getState().setMusicVolume(0.1);
    useSettingStore.getState().setGameTime(99);
    useSettingStore.getState().setFullScreenEnabled(true);

    useSettingStore.getState().resetAll();

    expect(useSettingStore.getState()).toMatchObject(DEFAULT_SETTING);
  });
});
