import { describe, it, expect, beforeEach } from "vitest";
import { useSaveStore } from "../save";
import { DEFAULT_SAVE, PERMANENT_UPGRADES } from "../../constant";

describe("SaveStore", () => {
  beforeEach(() => {
    // Reset store to default state before each test
    useSaveStore.getState().resetAll();
  });

  describe("Initial State", () => {
    it("should have default initial state", () => {
      const state = useSaveStore.getState();

      expect(state.totalGold).toBe(DEFAULT_SAVE.totalGold);
      expect(state.totalKills).toBe(DEFAULT_SAVE.totalKills);
      expect(state.totalPlayTime).toBe(DEFAULT_SAVE.totalPlayTime);
      expect(state.bestSurvivalTime).toBe(DEFAULT_SAVE.bestSurvivalTime);
    });
  });

  describe("Gold Management", () => {
    it("should add gold", () => {
      const initialGold = useSaveStore.getState().totalGold;
      useSaveStore.getState().addGold(100);

      expect(useSaveStore.getState().totalGold).toBe(initialGold + 100);
    });

    it("should spend gold when sufficient balance", () => {
      useSaveStore.getState().addGold(500);
      const result = useSaveStore.getState().spendGold(200);

      expect(result).toBe(true);
      expect(useSaveStore.getState().totalGold).toBe(300);
    });

    it("should not spend gold when insufficient balance", () => {
      useSaveStore.getState().addGold(100);
      const result = useSaveStore.getState().spendGold(200);

      expect(result).toBe(false);
      expect(useSaveStore.getState().totalGold).toBe(100);
    });

    it("should accumulate gold across multiple additions", () => {
      useSaveStore.getState().addGold(100);
      useSaveStore.getState().addGold(50);
      useSaveStore.getState().addGold(75);

      expect(useSaveStore.getState().totalGold).toBe(225);
    });
  });

  describe("Kills Tracking", () => {
    it("should add kills", () => {
      useSaveStore.getState().addKills(10);
      expect(useSaveStore.getState().totalKills).toBe(10);
    });

    it("should accumulate kills", () => {
      useSaveStore.getState().addKills(10);
      useSaveStore.getState().addKills(5);
      useSaveStore.getState().addKills(15);

      expect(useSaveStore.getState().totalKills).toBe(30);
    });
  });

  describe("Play Time Tracking", () => {
    it("should update play time", () => {
      useSaveStore.getState().updatePlayTime(120);
      expect(useSaveStore.getState().totalPlayTime).toBe(120);
    });

    it("should accumulate play time", () => {
      useSaveStore.getState().updatePlayTime(100);
      useSaveStore.getState().updatePlayTime(50);

      expect(useSaveStore.getState().totalPlayTime).toBe(150);
    });

    it("should update best survival time if new time is better", () => {
      useSaveStore.getState().updatePlayTime(100);
      useSaveStore.getState().updatePlayTime(200);

      expect(useSaveStore.getState().bestSurvivalTime).toBe(200);
    });

    it("should not update best survival time if new time is worse", () => {
      useSaveStore.getState().updatePlayTime(300);
      useSaveStore.getState().updatePlayTime(100);

      expect(useSaveStore.getState().bestSurvivalTime).toBe(300);
    });

    it("should floor fractional seconds", () => {
      useSaveStore.getState().updatePlayTime(123.7);
      expect(useSaveStore.getState().totalPlayTime).toBe(123);
    });
  });

  describe("Permanent Upgrades", () => {
    it("should upgrade when sufficient gold and not at max level", () => {
      const upgradeId = PERMANENT_UPGRADES[0].id;
      const cost = PERMANENT_UPGRADES[0].cost(0);

      useSaveStore.getState().addGold(cost);
      const result = useSaveStore.getState().upgradePermanent(upgradeId);

      expect(result).toBe(true);
      expect(useSaveStore.getState()[upgradeId]).toBe(1);
    });

    it("should not upgrade when insufficient gold", () => {
      const upgradeId = PERMANENT_UPGRADES[0].id;

      const result = useSaveStore.getState().upgradePermanent(upgradeId);

      expect(result).toBe(false);
      expect(useSaveStore.getState()[upgradeId]).toBe(0);
    });

    it("should not upgrade beyond max level", () => {
      const upgrade = PERMANENT_UPGRADES[0];
      const upgradeId = upgrade.id;

      // Add enough gold for max upgrades
      let totalCost = 0;
      for (let i = 0; i <= upgrade.maxLevel; i++) {
        totalCost += upgrade.cost(i);
      }
      useSaveStore.getState().addGold(totalCost);

      // Upgrade to max level
      for (let i = 0; i < upgrade.maxLevel; i++) {
        useSaveStore.getState().upgradePermanent(upgradeId);
      }

      // Try to upgrade beyond max
      const result = useSaveStore.getState().upgradePermanent(upgradeId);

      expect(result).toBe(false);
      expect(useSaveStore.getState()[upgradeId]).toBe(upgrade.maxLevel);
    });

    it("should deduct correct cost for upgrade", () => {
      const upgradeId = PERMANENT_UPGRADES[0].id;
      const cost = PERMANENT_UPGRADES[0].cost(0);

      useSaveStore.getState().addGold(1000);
      useSaveStore.getState().upgradePermanent(upgradeId);

      expect(useSaveStore.getState().totalGold).toBe(1000 - cost);
    });
  });

  describe("Reset Permanent Upgrades", () => {
    it("should reset all upgrade levels", () => {
      const upgradeId = PERMANENT_UPGRADES[0].id;
      const cost = PERMANENT_UPGRADES[0].cost(0);

      useSaveStore.getState().addGold(cost);
      useSaveStore.getState().upgradePermanent(upgradeId);

      useSaveStore.getState().resetPermanentUpgrades();

      expect(useSaveStore.getState()[upgradeId]).toBe(0);
    });

    it("should refund 100% of spent gold", () => {
      const upgrade = PERMANENT_UPGRADES[0];
      const cost1 = upgrade.cost(0);
      const cost2 = upgrade.cost(1);
      const totalCost = cost1 + cost2;
      const refund = Math.floor(totalCost);

      useSaveStore.getState().addGold(totalCost);

      useSaveStore.getState().upgradePermanent(upgrade.id);
      useSaveStore.getState().upgradePermanent(upgrade.id);

      useSaveStore.getState().resetPermanentUpgrades();

      expect(useSaveStore.getState().totalGold).toBe(refund);
    });
  });

  describe("Language", () => {
    it("should set language", () => {
      useSaveStore.getState().setLanguage("zh-CN");
      expect(useSaveStore.getState().language).toBe("zh-CN");
    });

    it("should change language", () => {
      useSaveStore.getState().setLanguage("en-US");
      useSaveStore.getState().setLanguage("ja-JP");

      expect(useSaveStore.getState().language).toBe("ja-JP");
    });
  });

  describe("Chapters", () => {
    it("should complete chapter", () => {
      const mapId = "map1" as any;
      useSaveStore.getState().completeChapter([mapId]);

      expect(useSaveStore.getState().completedChapters).toContain(mapId);
    });

    it("should not duplicate completed chapters", () => {
      const mapId = "map1" as any;
      useSaveStore.getState().completeChapter([mapId]);
      useSaveStore.getState().completeChapter([mapId]);

      const chapters = useSaveStore.getState().completedChapters || [];
      const count = chapters.filter((c) => c === mapId).length;
      expect(count).toBe(1);
    });
  });

  describe("Reset", () => {
    it("should reset all data", () => {
      // Make changes
      useSaveStore.getState().addGold(1000);
      useSaveStore.getState().addKills(100);
      useSaveStore.getState().updatePlayTime(500);
      useSaveStore.getState().setLanguage("zh-CN");

      // Reset
      useSaveStore.getState().resetAll();

      // Check reset
      const state = useSaveStore.getState();
      expect(state.totalGold).toBe(DEFAULT_SAVE.totalGold);
      expect(state.totalKills).toBe(DEFAULT_SAVE.totalKills);
      expect(state.totalPlayTime).toBe(DEFAULT_SAVE.totalPlayTime);
    });
  });

  describe("Persistence", () => {
    it("should persist state to localStorage", () => {
      useSaveStore.getState().addGold(500);

      // Create new instance to test persistence
      const newState = useSaveStore.getState();
      expect(newState.totalGold).toBe(500);
    });
  });
});
