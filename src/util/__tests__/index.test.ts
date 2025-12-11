import { describe, it, expect } from "vitest";
import { WEAPONS, ELIXIRS } from "../../constant";
import {
  formatTime,
  getRarityWeight,
  getWeaponImagePath,
  getCharacterImagePath,
  getEnemyImagePath,
  getMapImagePath,
  getRandomWeapons,
  getRandomElixirs,
  getAvailableCrafts,
} from "../index";
import type { WeaponType } from "../../types";

describe("Utility Functions", () => {
  describe("formatTime", () => {
    it("should format seconds correctly", () => {
      expect(formatTime(0)).toBe("00:00");
      expect(formatTime(59)).toBe("00:59");
      expect(formatTime(60)).toBe("01:00");
      expect(formatTime(65)).toBe("01:05");
      expect(formatTime(3600)).toBe("60:00");
      expect(formatTime(3665)).toBe("61:05");
    });
  });

  describe("getRarityWeight", () => {
    it("should return correct weight for each rarity", () => {
      expect(getRarityWeight("common")).toBe(50);
      expect(getRarityWeight("rare")).toBe(30);
      expect(getRarityWeight("epic")).toBe(15);
      expect(getRarityWeight("legendary")).toBe(5);
    });
  });

  describe("Image Path Functions", () => {
    it("should return correct weapon image path", () => {
      expect(getWeaponImagePath("golden_staff")).toBe(
        "assets/weapons/golden_staff.svg",
      );
      expect(getWeaponImagePath("fire_lance")).toBe(
        "assets/weapons/fire_lance.svg",
      );
    });

    it("should return correct character image path", () => {
      expect(getCharacterImagePath("destined_one")).toBe(
        "assets/characters/destined_one.svg",
      );
    });

    it("should return correct enemy image path", () => {
      expect(getEnemyImagePath("wolf_minion")).toBe(
        "assets/enemies/wolf_minion.svg",
      );
    });

    it("should return correct map image path", () => {
      expect(getMapImagePath("chapter1")).toBe("assets/maps/chapter1.svg");
    });
  });

  describe("Random Selection Functions", () => {
    it("should return correct number of random weapons", () => {
      const weapons = getRandomWeapons(3);
      expect(weapons).toHaveLength(3);
      weapons.forEach((weapon) => {
        expect(WEAPONS).toHaveProperty(weapon);
      });
    });

    it("should return unique weapons", () => {
      const weapons = getRandomWeapons(5);
      const uniqueWeapons = new Set(weapons);
      expect(uniqueWeapons.size).toBe(weapons.length);
    });

    it("should not return more weapons than available", () => {
      const weaponCount = Object.keys(WEAPONS).length;
      const weapons = getRandomWeapons(weaponCount + 10);
      expect(weapons).toHaveLength(weaponCount);
    });

    it("should return correct number of random elixirs", () => {
      const elixirs = getRandomElixirs(2);
      expect(elixirs).toHaveLength(2);
      elixirs.forEach((elixir) => {
        expect(ELIXIRS).toHaveProperty(elixir);
      });
    });

    it("should return unique elixirs", () => {
      const elixirs = getRandomElixirs(3);
      const uniqueElixirs = new Set(elixirs);
      expect(uniqueElixirs.size).toBe(elixirs.length);
    });

    it("should not return more elixirs than available", () => {
      const elixirCount = Object.keys(ELIXIRS).length;
      const elixirs = getRandomElixirs(elixirCount + 10);
      expect(elixirs).toHaveLength(elixirCount);
    });
  });

  describe("Weapon Crafting Functions", () => {
    it("should return empty array when no crafts are available", () => {
      const availableCrafts = getAvailableCrafts([]);
      expect(availableCrafts).toEqual([]);
    });

    it("should return available crafts when materials are sufficient", () => {
      // Test ruyi_staff recipe
      const availableCrafts = getAvailableCrafts([
        "golden_staff",
        "thunder_drum",
        "mace",
      ]);
      expect(availableCrafts).toContain("ruyi_staff");
    });

    it("should not return already owned weapons", () => {
      // Already own ruyi_staff
      const availableCrafts = getAvailableCrafts([
        "golden_staff",
        "thunder_drum",
        "mace",
        "ruyi_staff",
      ]);
      expect(availableCrafts).not.toContain("ruyi_staff");
    });

    it("should return multiple available crafts", () => {
      // Set up materials for multiple recipes
      const materials: WeaponType[] = [
        "golden_staff",
        "thunder_drum",
        "mace",
        "violet_bell",
        "wind_tamer",
        "fireproof_cloak",
      ];
      const availableCrafts = getAvailableCrafts(materials);

      // Should have both ruyi_staff and jade_purity_bottle
      expect(availableCrafts).toContain("ruyi_staff");
      expect(availableCrafts).toContain("jade_purity_bottle");
    });

    it("should not return crafts when missing materials", () => {
      // Missing thunder_drum for ruyi_staff recipe
      const availableCrafts = getAvailableCrafts(["golden_staff", "mace"]);
      expect(availableCrafts).not.toContain("ruyi_staff");
    });
  });
});
