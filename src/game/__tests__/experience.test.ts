import { vi, describe, it, expect, beforeEach } from "vitest";
import { ExperienceManager, CollectibleItem } from "../experience";

// Mock functions
const mockAddGold = vi.fn();
const mockGetState = vi.fn(() => ({
  musicEnabled: true,
  musicVolume: 0.5,
  addGold: (value: number) => mockAddGold(value),
}));

// Mock external dependencies
vi.mock("../../store", () => {
  return {
    useSaveStore: {
      addGold: () => mockAddGold(),
      getState: () => mockGetState(),
    },
  };
});

describe("CollectibleItem", () => {
  let mockScene: any;
  let collectible: CollectibleItem;

  beforeEach(() => {
    // Reset mocks
    mockAddGold.mockClear();

    // Create mock scene with physics
    mockScene = {
      physics: {
        add: {
          sprite: vi.fn().mockReturnValue({
            setDisplaySize: vi.fn().mockReturnThis(),
            body: { setSize: vi.fn() },
            setVelocity: vi.fn(),
            setTint: vi.fn().mockReturnThis(),
            alpha: 1,
            scale: 1,
            x: 100,
            y: 100,
            destroy: vi.fn(),
            scene: mockScene, // Add scene reference
          }),
        },
      },
      tweens: {
        add: vi.fn().mockImplementation((config) => {
          if (config.onComplete) {
            config.onComplete();
          }
          return { play: vi.fn() };
        }),
      },
    };

    // Create collectible
    collectible = new CollectibleItem(mockScene, 100, 100, "gem", 10);
  });

  it("should create collectible with correct properties", () => {
    expect(collectible.type).toBe("gem");
    expect(collectible.value).toBe(10);
    expect(collectible.sprite).toBeDefined();
  });

  it("should create coin with correct texture", () => {
    // Create a coin collectible
    const coin = new CollectibleItem(mockScene, 100, 100, "coin");

    expect(coin.type).toBe("coin");
    expect(coin.value).toBe(0);
  });

  it("should create gem with correct texture based on value", () => {
    // Create gems with different values
    const lowGem = new CollectibleItem(mockScene, 100, 100, "gem", 2);
    const mediumGem = new CollectibleItem(mockScene, 100, 100, "gem", 3);
    const highGem = new CollectibleItem(mockScene, 100, 100, "gem", 5);

    expect(lowGem.type).toBe("gem");
    expect(mediumGem.type).toBe("gem");
    expect(highGem.type).toBe("gem");
  });

  it("should return true when player is in collect range", () => {
    const playerPos = { x: 100, y: 100 };
    const result = collectible.update(playerPos);
    expect(result).toBe(true);
  });

  it("should return false when player is outside collect range", () => {
    const playerPos = { x: 1000, y: 1000 };
    const result = collectible.update(playerPos);
    expect(result).toBe(false);
  });

  it("should handle coin collection and add gold", () => {
    // Create coin
    const coin = new CollectibleItem(mockScene, 100, 100, "coin", 10);

    // Call collect method
    coin.collect();

    // Verify gold was added
    expect(mockAddGold).toHaveBeenCalledWith(10);

    // Verify sprite.destroy was called via onComplete callback
    expect(coin.sprite.destroy).toHaveBeenCalled();
  });

  it("should destroy collectible when destroy method is called", () => {
    // Create mock destroy function
    const mockDestroy = vi.fn();
    collectible.sprite.destroy = mockDestroy;
    collectible.sprite.scene = mockScene; // Ensure scene exists for the condition check

    // Call destroy method
    collectible.destroy();

    // Verify destroy was called
    expect(mockDestroy).toHaveBeenCalled();
  });

  it("should activate magnetic attraction within magnet range", () => {
    // Position the collectible 150 pixels away (within magnet range but outside collect range)
    collectible.sprite.x = 200;
    collectible.sprite.y = 200;

    // Update with player at (100, 100)
    const playerPos = { x: 100, y: 100 };
    const result = collectible.update(playerPos, 0, 1.5); // 150% magnet bonus

    // Verify item is not collected yet
    expect(result).toBe(false);

    // Check internal state (using any type since it's a private property)
    expect((collectible as any).magnetized).toBe(true);

    // Verify velocity was set for magnetic attraction
    expect(collectible.sprite.setVelocity).toHaveBeenCalled();
  });
});

describe("ExperienceManager", () => {
  let experienceManager: ExperienceManager;
  let mockScene: any;
  let mockPlayer: any;

  beforeEach(() => {
    // Reset mocks
    mockAddGold.mockClear();

    // Create mock player
    mockPlayer = {
      addExperience: vi.fn(),
      collectRangeBonus: 0,
      magnetBonus: 0,
    };

    // Create mock scene
    mockScene = {
      getPlayerPosition: vi.fn().mockReturnValue({ x: 500, y: 300 }),
      physics: {
        add: {
          sprite: vi.fn().mockReturnValue({
            setDisplaySize: vi.fn().mockReturnThis(),
            body: { setSize: vi.fn() },
            setVelocity: vi.fn(),
            setTint: vi.fn().mockReturnThis(),
            alpha: 1,
            scale: 1,
            x: 0,
            y: 0,
            destroy: vi.fn(),
            scene: mockScene, // Add scene reference
          }),
        },
      },
      tweens: {
        add: vi.fn().mockImplementation((config) => {
          if (config.onComplete) {
            config.onComplete();
          }
          return { play: vi.fn() };
        }),
      },
    };

    // Create experience manager with both scene and player
    experienceManager = new ExperienceManager(mockScene, mockPlayer);
  });

  it("should initialize with empty collectibles array", () => {
    expect((experienceManager as any).collectibles).toEqual([]);
  });

  it("should spawn gems using spawnGem method", () => {
    // Spawn a gem
    experienceManager.spawnGem(100, 100, 5);

    // Verify gem was created
    const collectibles = (experienceManager as any).collectibles;
    expect(collectibles.length).toBe(1);
    expect(collectibles[0]).toBeInstanceOf(CollectibleItem);
    expect(collectibles[0].type).toBe("gem");
    expect(collectibles[0].value).toBe(5);
  });

  it("should spawn coins using spawnCoin method", () => {
    // Spawn a coin
    experienceManager.spawnCoin(200, 200, 1);

    // Verify coin was created
    const collectibles = (experienceManager as any).collectibles;
    expect(collectibles.length).toBe(1);
    expect(collectibles[0]).toBeInstanceOf(CollectibleItem);
    expect(collectibles[0].type).toBe("coin");
  });

  it("should update all collectibles", () => {
    // Spawn two collectibles
    experienceManager.spawnGem(100, 100, 5);
    experienceManager.spawnCoin(200, 200, 1);

    // Mock update method of collectibles
    const collectibles = (experienceManager as any).collectibles;
    collectibles[0].update = vi.fn().mockReturnValue(false);
    collectibles[1].update = vi.fn().mockReturnValue(false);

    // Update experience manager
    experienceManager.update();

    // Verify both collectibles were updated
    expect(collectibles[0].update).toHaveBeenCalled();
    expect(collectibles[1].update).toHaveBeenCalled();
  });

  it("should remove collected gems from collectibles array", () => {
    // Spawn a gem
    experienceManager.spawnGem(100, 100, 5);

    // Get reference to the collectible from the array
    const collectibles = (experienceManager as any).collectibles;
    const mockCollect = vi.fn();

    // Mock update to return true (collected)
    collectibles[0].update = vi.fn().mockReturnValue(true);
    collectibles[0].collect = mockCollect;

    // Update experience manager
    experienceManager.update();

    // Verify gem was removed
    expect((experienceManager as any).collectibles.length).toBe(0);
    expect(mockPlayer.addExperience).toHaveBeenCalledWith(5);
    expect(mockCollect).toHaveBeenCalled();
  });

  it("should remove collected coins from collectibles array", () => {
    // Spawn a coin
    experienceManager.spawnCoin(100, 100, 1);

    // Get reference to the collectible from the array
    const collectibles = (experienceManager as any).collectibles;
    const mockCollect = vi.fn();

    // Mock update to return true (collected)
    collectibles[0].update = vi.fn().mockReturnValue(true);
    collectibles[0].collect = mockCollect;

    // Update experience manager
    experienceManager.update();

    // Verify coin was removed
    expect((experienceManager as any).collectibles.length).toBe(0);
    expect(mockCollect).toHaveBeenCalled();
  });

  it("should clear all collectibles with clear method", () => {
    // Spawn three collectibles
    experienceManager.spawnGem(100, 100, 5);
    experienceManager.spawnGem(200, 200, 10);
    experienceManager.spawnCoin(300, 300, 1);

    // Mock destroy method for each collectible
    const collectibles = (experienceManager as any).collectibles;
    collectibles[0].destroy = vi.fn();
    collectibles[1].destroy = vi.fn();
    collectibles[2].destroy = vi.fn();

    // Clear all items
    experienceManager.clear();

    // Verify all items were destroyed and array is empty
    expect(collectibles[0].destroy).toHaveBeenCalled();
    expect(collectibles[1].destroy).toHaveBeenCalled();
    expect(collectibles[2].destroy).toHaveBeenCalled();
    expect((experienceManager as any).collectibles.length).toBe(0);
  });

  it("should collect all items with collectAllItems method", async () => {
    // Spawn three collectibles
    experienceManager.spawnGem(100, 100, 5);
    experienceManager.spawnGem(200, 200, 10);
    experienceManager.spawnCoin(300, 300, 1);

    // Save original collectibles
    const collectibles = [...(experienceManager as any).collectibles];

    // Mock collect method for each collectible
    collectibles[0].collect = vi.fn();
    collectibles[1].collect = vi.fn();
    collectibles[2].collect = vi.fn();

    // Mock tweens with onComplete
    mockScene.tweens.add.mockImplementation((config: any) => {
      if (config.onComplete) {
        config.onComplete();
      }
      return { play: vi.fn() };
    });

    // Collect all items
    await experienceManager.collectAllItems();

    // Verify addExperience was called for gems
    expect(mockPlayer.addExperience).toHaveBeenCalledTimes(2);
    expect(mockPlayer.addExperience).toHaveBeenNthCalledWith(1, 5);
    expect(mockPlayer.addExperience).toHaveBeenNthCalledWith(2, 10);

    // Verify collect was called for all items
    expect(collectibles[0].collect).toHaveBeenCalled();
    expect(collectibles[1].collect).toHaveBeenCalled();
    expect(collectibles[2].collect).toHaveBeenCalled();

    // Verify tweens were created for all items
    expect(mockScene.tweens.add).toHaveBeenCalledTimes(3);
  });

  it("should return immediately when no collectibles to collect", async () => {
    // Mock tweens
    const mockTweensAdd = vi.fn();
    mockScene.tweens.add = mockTweensAdd;

    // Collect all items (none should exist)
    await experienceManager.collectAllItems();

    // Verify no tweens were created
    expect(mockTweensAdd).not.toHaveBeenCalled();
  });
});
