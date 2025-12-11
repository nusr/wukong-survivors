import { describe, it, expect, beforeEach } from "vitest";
import { useAppStore } from "../app";

describe("useAppStore", () => {
  beforeEach(() => {
    // Reset store state before each test
    useAppStore.setState({
      selectedCharacterId: "destined_one",
      selectedMapId: "chapter1",
    });
  });

  describe("selectCharacter", () => {
    it("should select an unlocked character", () => {
      const { selectCharacter } = useAppStore.getState();

      selectCharacter("erlang_shen");
      const state = useAppStore.getState();

      expect(state.selectedCharacterId).toBe("destined_one");
    });

    it("should not select a locked character", () => {
      const { selectCharacter } = useAppStore.getState();
      const initialCharacter = useAppStore.getState().selectedCharacterId;

      selectCharacter("some_locked_character" as any);
      const state = useAppStore.getState();

      expect(state.selectedCharacterId).toBe(initialCharacter);
    });
  });

  describe("selectMap", () => {
    it("should select an unlocked map", () => {
      const { selectMap } = useAppStore.getState();

      selectMap("chapter2");
      const state = useAppStore.getState();

      expect(state.selectedMapId).toBe("chapter1");
    });

    it("should not select a locked map", () => {
      const { selectMap } = useAppStore.getState();
      const initialMap = useAppStore.getState().selectedMapId;

      selectMap("some_locked_map" as any);
      const state = useAppStore.getState();

      expect(state.selectedMapId).toBe(initialMap);
    });
  });

  describe("getSelectCharacter", () => {
    it("should return the selected character data", () => {
      const { getSelectCharacter } = useAppStore.getState();

      const characterData = getSelectCharacter();

      expect(characterData).toBeDefined();
      expect(characterData).toHaveProperty("id");
    });

    it("should return default character when selected character is invalid", () => {
      useAppStore.setState({ selectedCharacterId: "invalid_character" as any });
      const { getSelectCharacter } = useAppStore.getState();

      const characterData = getSelectCharacter();

      expect(characterData).toBeDefined();
      expect(characterData.id).toBe("destined_one");
    });
  });

  describe("getSelectMap", () => {
    it("should return the selected map data", () => {
      const { getSelectMap } = useAppStore.getState();

      const mapData = getSelectMap();

      expect(mapData).toBeDefined();
      expect(mapData).toHaveProperty("id");
    });

    it("should return the first map when selected map is invalid", () => {
      useAppStore.setState({ selectedMapId: "invalid_map" as any });
      const { getSelectMap } = useAppStore.getState();

      const mapData = getSelectMap();

      expect(mapData).toBeDefined();
      expect(mapData).toHaveProperty("id");
    });
  });
});
