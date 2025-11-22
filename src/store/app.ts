import { create } from "zustand";
import type { CharacterType, MapType, CharacterData, GameMap } from "../types";
import { useSaveStore } from "./save";
import { useShallow } from "zustand/react/shallow";
import { MAPS, CHARACTERS_DATA } from "../constant";

type States = {
  selectedCharacter: CharacterType;
  selectedMap: MapType;
};

type Actions = {
  selectCharacter: (characterId: CharacterType) => void;
  selectMap: (mapId: MapType) => void;
  getSelectCharacter: () => CharacterData;
  getSelectMap: () => GameMap;
};

type Store = States & Actions;

export const useAppStore = create<Store>((set, get) => {
  return {
    selectedCharacter: "destined_one",
    selectedMap: "chapter1",
    selectCharacter: (characterId: CharacterType) => {
      const { unlockedCharacters } = useSaveStore.getState();
      if (unlockedCharacters.includes(characterId)) {
        set({ selectedCharacter: characterId });
      }
    },

    selectMap: (mapId: MapType) => {
      const { unlockedMaps } = useSaveStore.getState();
      if (unlockedMaps.includes(mapId)) {
        set({ selectedMap: mapId });
      }
    },
    getSelectCharacter() {
      const { selectedCharacter } = get();

      return (
        CHARACTERS_DATA[selectedCharacter] || CHARACTERS_DATA["destined_one"]
      );
    },
    getSelectMap() {
      const { selectedMap } = get();

      return MAPS.find((map) => map.id === selectedMap) || MAPS[0];
    },
  };
});

const getSelectedCharacter = (state: Store) => state.selectedCharacter;
const getSelectedMap = (state: Store) => state.selectedMap;

export const useSelectedCharacter = () =>
  useAppStore(useShallow(getSelectedCharacter));
export const useSelectedMap = () => useAppStore(useShallow(getSelectedMap));
