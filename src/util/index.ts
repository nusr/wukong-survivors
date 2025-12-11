import type {
  WeaponType,
  ElixirType,
  WeaponRarity,
  CharacterType,
  EnemyType,
  MapType,
} from "../types";
import { WEAPONS, ELIXIRS, WEAPON_RECIPES } from "../constant";

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

// ===== Weapon and Elixir Utility Functions =====

// Get weight by rarity
export function getRarityWeight(rarity: WeaponRarity): number {
  const weights: Record<WeaponRarity, number> = {
    common: 50,
    rare: 30,
    epic: 15,
    legendary: 5,
  };
  return weights[rarity];
}

// Helper function for weighted random selection with uniqueness
function getRandomItemsWithWeight<T extends string>(
  items: Record<T, { rarity: WeaponRarity }>,
  count: number,
): T[] {
  // Create weighted items array
  const weightedItems = Object.entries(items).map(([id, item]) => ({
    id: id as T,
    weight: getRarityWeight((item as { rarity: WeaponRarity }).rarity),
  }));

  const selected: T[] = [];
  const availableItems = [...weightedItems];

  // Select random items with guaranteed uniqueness
  while (selected.length < count && availableItems.length > 0) {
    // Calculate total weight
    const totalWeight = availableItems.reduce(
      (sum, item) => sum + item.weight,
      0,
    );

    // Weighted random selection
    let random = Math.random() * totalWeight;
    let selectedIndex = -1;

    for (let i = 0; i < availableItems.length && random > 0; i++) {
      random -= availableItems[i].weight;
      if (random <= 0) {
        selectedIndex = i;
        break;
      }
    }

    if (selectedIndex >= 0) {
      selected.push(availableItems[selectedIndex].id);
      availableItems.splice(selectedIndex, 1); // Remove to prevent duplicates
    }
  }

  return selected;
}

// Image path utility functions
export const getWeaponImagePath = (id: WeaponType): string => {
  return `assets/weapons/${id}.svg`;
};

export const getCharacterImagePath = (id: CharacterType): string => {
  return `assets/characters/${id}.svg`;
};

export const getEnemyImagePath = (id: EnemyType): string => {
  return `assets/enemies/${id}.svg`;
};

export const getMapImagePath = (id: MapType): string => {
  return `assets/maps/${id}.svg`;
};

// Randomly get weapons (considering rarity weight)
export function getRandomWeapons(count: number): WeaponType[] {
  return getRandomItemsWithWeight(WEAPONS, count);
}

// Randomly get elixirs
export function getRandomElixirs(count: number): ElixirType[] {
  return getRandomItemsWithWeight(ELIXIRS, count);
}

// ===== Weapon Crafting Functions =====

// Check if weapon can be crafted
function canCraftWeapon(
  ownedWeapons: WeaponType[],
  recipeKey: string,
): boolean {
  const recipe = WEAPON_RECIPES[recipeKey];
  if (!recipe) return false;

  return recipe.materials.every((material) => ownedWeapons.includes(material));
}

// Get list of craftable weapons
export function getAvailableCrafts(ownedWeapons: WeaponType[]): WeaponType[] {
  const available: WeaponType[] = [];

  Object.entries(WEAPON_RECIPES).forEach(([key, recipe]) => {
    if (
      canCraftWeapon(ownedWeapons, key) &&
      !ownedWeapons.includes(recipe.result)
    ) {
      available.push(recipe.result);
    }
  });

  return available;
}

export const upgradeLevelGold = (level: number) => level * 100 + 100;
