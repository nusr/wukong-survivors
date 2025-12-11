import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Shop from "../index";
import { PERMANENT_UPGRADES } from "../../../constant";
import type { PermanentUpgradeType } from "../../../types";

const DEFAULT_DATA: Record<PermanentUpgradeType, number> = {
  attack: 0,
  health: 0,
  armor: 0,
  speed: 0,
  luck: 0,
  expBonus: 0,
  magnetBonus: 0,
  critRate: 0,
  collectRange: 0,
};

// Mock the store hooks
vi.mock("../../../store", () => ({
  useShopLevel: vi.fn(() => ({
    attack: 1,
    health: 2,
    armor: 0,
    luck: 3,
    speed: 1,
  })),
  useTotalGold: vi.fn(() => 1500),
  useSaveStore: {
    getState: vi.fn(() => ({
      upgradePermanent: vi.fn(() => true),
      resetPermanentUpgrades: vi.fn(),
    })),
  },
}));

describe("Shop Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the shop title", () => {
    render(<Shop onBack={() => {}} />);

    expect(screen.getByTestId("shop-title")).toBeInTheDocument();
    expect(screen.getByTestId("shop-title")).toHaveTextContent(
      "Permanent Upgrades",
    );
  });

  it("should display the gold amount", () => {
    render(<Shop onBack={() => {}} />);

    expect(screen.getByTestId("shop-gold-display")).toBeInTheDocument();
    expect(screen.getByTestId("shop-gold-display")).toHaveTextContent("1500");
  });

  it("should render all upgrade cards", async () => {
    const { useSaveStore } = await import("../../../store");
    const resetPermanentUpgradesMock = vi.fn();

    vi.mocked(useSaveStore.getState).mockReturnValue({
      ...DEFAULT_DATA,
      totalGold: 100,
      totalKills: 0,
      totalPlayTime: 0,
      bestSurvivalTime: 0,
      completedChapters: [],
      language: "en-US",
      enableAutoSelect: false,
      enableUnlockAll: false,
      musicEnabled: true,
      musicVolume: 0.5,
      gameTime: 0,
      upgradePermanent: vi.fn(),
      resetPermanentUpgrades: resetPermanentUpgradesMock,
      addGold: vi.fn(),
      spendGold: vi.fn(() => true),
      addKills: vi.fn(),
      updatePlayTime: vi.fn(),
      setLanguage: vi.fn(),
      resetAll: vi.fn(),
      completeChapter: vi.fn(),
      setMusicVolume: vi.fn(),
      setMusicEnabled: vi.fn(),
      setAutoSelectEnabled: vi.fn(),
      setUnlockAllEnabled: vi.fn(),
      setGameTime: vi.fn(),
    });

    render(<Shop onBack={() => {}} />);

    PERMANENT_UPGRADES.forEach((upgrade) => {
      expect(
        screen.getByTestId(`upgrade-card-${upgrade.id}`),
      ).toBeInTheDocument();
    });
  });

  it("should render correct level for each upgrade", () => {
    render(<Shop onBack={() => {}} />);

    const attackCard = screen.getByTestId("upgrade-card-attack");
    expect(attackCard).toHaveTextContent("1 / ");

    const healthCard = screen.getByTestId("upgrade-card-health");
    expect(healthCard).toHaveTextContent("2 / ");

    const armorCard = screen.getByTestId("upgrade-card-armor");
    expect(armorCard).toHaveTextContent("0 / ");
  });

  it("should call upgradePermanent when purchase button is clicked", async () => {
    const { useSaveStore } = await import("../../../store");
    const upgradePermanentMock = vi.fn(() => true);
    const resetPermanentUpgradesMock = vi.fn();

    vi.mocked(useSaveStore.getState).mockReturnValue({
      ...DEFAULT_DATA,
      totalGold: 100,
      totalKills: 0,
      totalPlayTime: 0,
      bestSurvivalTime: 0,
      completedChapters: [],
      language: "en-US",
      enableAutoSelect: false,
      enableUnlockAll: false,
      musicEnabled: true,
      musicVolume: 0.5,
      gameTime: 0,
      upgradePermanent: upgradePermanentMock,
      resetPermanentUpgrades: resetPermanentUpgradesMock,
      addGold: vi.fn(),
      spendGold: vi.fn(() => true),
      addKills: vi.fn(),
      updatePlayTime: vi.fn(),
      setLanguage: vi.fn(),
      resetAll: vi.fn(),
      completeChapter: vi.fn(),
      setMusicVolume: vi.fn(),
      setMusicEnabled: vi.fn(),
      setAutoSelectEnabled: vi.fn(),
      setUnlockAllEnabled: vi.fn(),
      setGameTime: vi.fn(),
    });

    render(<Shop onBack={() => {}} />);

    const purchaseButton = screen.getByTestId("purchase-button-attack");
    fireEvent.click(purchaseButton);

    expect(upgradePermanentMock).toHaveBeenCalledWith("attack");
  });

  it("should call resetPermanentUpgrades when reset button is clicked", async () => {
    const { useSaveStore } = await import("../../../store");
    const resetPermanentUpgradesMock = vi.fn();
    vi.mocked(useSaveStore.getState).mockReturnValue({
      ...DEFAULT_DATA,
      totalGold: 100,
      totalKills: 0,
      totalPlayTime: 0,
      bestSurvivalTime: 0,
      completedChapters: [],
      language: "en-US",
      enableAutoSelect: false,
      enableUnlockAll: false,
      musicEnabled: true,
      musicVolume: 0.5,
      gameTime: 0,
      upgradePermanent: vi.fn(),
      resetPermanentUpgrades: resetPermanentUpgradesMock,
      addGold: vi.fn(),
      spendGold: vi.fn(() => true),
      addKills: vi.fn(),
      updatePlayTime: vi.fn(),
      setLanguage: vi.fn(),
      resetAll: vi.fn(),
      completeChapter: vi.fn(),
      setMusicVolume: vi.fn(),
      setMusicEnabled: vi.fn(),
      setAutoSelectEnabled: vi.fn(),
      setUnlockAllEnabled: vi.fn(),
      setGameTime: vi.fn(),
    });

    // Mock window.confirm to return true
    window.confirm = vi.fn(() => true);

    render(<Shop onBack={() => {}} />);

    const resetButton = screen.getByTestId("reset-upgrades-button");
    fireEvent.click(resetButton);

    expect(window.confirm).toHaveBeenCalledWith(
      "Reset all upgrades? You will get back 100% of spent gold.",
    );
    expect(resetPermanentUpgradesMock).toHaveBeenCalled();
  });

  it("should not call resetPermanentUpgrades when reset is cancelled", async () => {
    const { useSaveStore } = await import("../../../store");
    const resetPermanentUpgradesMock = vi.fn();
    vi.mocked(useSaveStore.getState).mockReturnValue({
      ...DEFAULT_DATA,
      totalGold: 100,
      totalKills: 0,
      totalPlayTime: 0,
      bestSurvivalTime: 0,
      completedChapters: [],
      language: "en-US",
      enableAutoSelect: false,
      enableUnlockAll: false,
      musicEnabled: true,
      musicVolume: 0.5,
      gameTime: 0,
      upgradePermanent: vi.fn(),
      resetPermanentUpgrades: resetPermanentUpgradesMock,
      addGold: vi.fn(),
      spendGold: vi.fn(() => true),
      addKills: vi.fn(),
      updatePlayTime: vi.fn(),
      setLanguage: vi.fn(),
      resetAll: vi.fn(),
      completeChapter: vi.fn(),
      setMusicVolume: vi.fn(),
      setMusicEnabled: vi.fn(),
      setAutoSelectEnabled: vi.fn(),
      setUnlockAllEnabled: vi.fn(),
      setGameTime: vi.fn(),
    });

    // Mock window.confirm to return false
    window.confirm = vi.fn(() => false);

    render(<Shop onBack={() => {}} />);

    const resetButton = screen.getByTestId("reset-upgrades-button");
    fireEvent.click(resetButton);

    expect(window.confirm).toHaveBeenCalledWith(
      "Reset all upgrades? You will get back 100% of spent gold.",
    );
    expect(resetPermanentUpgradesMock).not.toHaveBeenCalled();
  });

  it("should disable purchase button when cannot afford", async () => {
    const { useTotalGold } = await import("../../../store");
    vi.mocked(useTotalGold).mockReturnValue(0);

    render(<Shop onBack={() => {}} />);

    const purchaseButton = screen.getByTestId("purchase-button-attack");
    expect(purchaseButton).toBeDisabled();
  });

  it("should call onBack when back button is clicked", () => {
    const onBackMock = vi.fn();
    render(<Shop onBack={onBackMock} />);

    const backButton = screen.getByTestId("shop-back-button");
    fireEvent.click(backButton);

    expect(onBackMock).toHaveBeenCalled();
  });
});
