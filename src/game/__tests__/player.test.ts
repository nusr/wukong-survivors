import { describe, it, expect, vi, beforeEach } from "vitest";
import { Player, WASDKeys } from "../player";

describe("Player", () => {
  let mockScene: any;
  let player: Player;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock scene with all required properties
    mockScene = {
      physics: {
        add: {
          sprite: vi.fn().mockReturnValue({
            setDisplaySize: vi.fn(),
            body: {
              setSize: vi.fn(),
              setVelocity: vi.fn(),
              velocity: { x: 0, y: 0 },
            },
            setTint: vi.fn(),
            clearTint: vi.fn(),
            setVelocity: vi.fn(),
            setCollideWorldBounds: vi.fn(),
            x: 0,
            y: 0,
          }),
        },
      },
      cameras: {
        main: {
          startFollow: vi.fn(),
          setZoom: vi.fn(),
        },
      },
      time: {
        delayedCall: vi.fn((_delay, callback) => callback()),
      },
      gameOver: vi.fn(),
      showLevelUpMenu: vi.fn(),
    };

    player = new Player(mockScene, 100, 100, "black_bear_guai");
  });

  it("should initialize with correct properties", () => {
    expect(player).toBeInstanceOf(Player);
    expect(player.sprite).toBeDefined();
    expect(player.maxHealth).toBe(100);
    expect(player.health).toBe(100);
    expect(player.speed).toBe(150);
    expect(player.level).toBe(1);
    expect(player.experience).toBe(0);
    expect(player.experienceToNextLevel).toBe(10);
    expect(player.armor).toBe(0);
    expect(player.critRate).toBe(0);
    expect(player.expBonus).toBe(0);
    expect(player.reviveCount).toBe(0);
    expect(player.collectRange).toBe(0);
    expect(player.magnetBonus).toBe(0);
  });

  it("should update movement with cursor keys", () => {
    const mockCursors = {
      left: { isDown: true },
      right: { isDown: false },
      up: { isDown: false },
      down: { isDown: false },
    };

    // Store the mock function
    const mockSetVelocity = vi.fn();
    player.sprite.setVelocity = mockSetVelocity;

    player.update(mockCursors as any);

    expect(mockSetVelocity).toHaveBeenCalledWith(-player.speed, 0);
  });

  it("should update movement with WASD keys", () => {
    const mockWASD: WASDKeys = {
      a: { isDown: true } as any,
      d: { isDown: false } as any,
      w: { isDown: false } as any,
      s: { isDown: false } as any,
    };

    // Store the mock function
    const mockSetVelocity = vi.fn();
    player.sprite.setVelocity = mockSetVelocity;

    player.update(undefined, mockWASD);

    expect(mockSetVelocity).toHaveBeenCalledWith(-player.speed, 0);
  });

  it("should update movement with joystick input", () => {
    const mockJoystickInput = { x: 1, y: 0 };

    // Store the mock function
    const mockSetVelocity = vi.fn();
    player.sprite.setVelocity = mockSetVelocity;

    player.update(undefined, undefined, mockJoystickInput);

    expect(mockSetVelocity).toHaveBeenCalledWith(player.speed, 0);
  });

  it("should handle keyboard movement in all directions", () => {
    // Store the mock function
    const mockSetVelocity = vi.fn();
    player.sprite.setVelocity = mockSetVelocity;

    // Test left movement (line 112-113)
    mockSetVelocity.mockClear();
    player.update(
      {
        up: { isDown: false },
        down: { isDown: false },
        left: { isDown: true },
        right: { isDown: false },
      } as any,
      {
        w: { isDown: false },
        a: { isDown: false },
        s: { isDown: false },
        d: { isDown: false },
      } as any,
      undefined,
    );
    expect(mockSetVelocity).toHaveBeenCalledWith(-player.speed, 0);

    // Test right movement
    mockSetVelocity.mockClear();
    player.update(
      {
        up: { isDown: false },
        down: { isDown: false },
        left: { isDown: false },
        right: { isDown: true },
      } as any,
      {
        w: { isDown: false },
        a: { isDown: false },
        s: { isDown: false },
        d: { isDown: false },
      } as any,
      undefined,
    );
    expect(mockSetVelocity).toHaveBeenCalledWith(player.speed, 0);

    // Test up movement
    mockSetVelocity.mockClear();
    player.update(
      {
        up: { isDown: true },
        down: { isDown: false },
        left: { isDown: false },
        right: { isDown: false },
      } as any,
      {
        w: { isDown: false },
        a: { isDown: false },
        s: { isDown: false },
        d: { isDown: false },
      } as any,
      undefined,
    );
    expect(mockSetVelocity).toHaveBeenCalledWith(0, -player.speed);

    // Test down movement (line 119)
    mockSetVelocity.mockClear();
    player.update(
      {
        up: { isDown: false },
        down: { isDown: true },
        left: { isDown: false },
        right: { isDown: false },
      } as any,
      {
        w: { isDown: false },
        a: { isDown: false },
        s: { isDown: false },
        d: { isDown: false },
      } as any,
      undefined,
    );
    expect(mockSetVelocity).toHaveBeenCalledWith(0, player.speed);

    // Test WASD keys as well
    // Test A key (left)
    mockSetVelocity.mockClear();
    player.update(
      {
        up: { isDown: false },
        down: { isDown: false },
        left: { isDown: false },
        right: { isDown: false },
      } as any,
      {
        w: { isDown: false },
        a: { isDown: true },
        s: { isDown: false },
        d: { isDown: false },
      } as any,
      undefined,
    );
    expect(mockSetVelocity).toHaveBeenCalledWith(-player.speed, 0);

    // Test D key (right)
    mockSetVelocity.mockClear();
    player.update(
      {
        up: { isDown: false },
        down: { isDown: false },
        left: { isDown: false },
        right: { isDown: false },
      } as any,
      {
        w: { isDown: false },
        a: { isDown: false },
        s: { isDown: false },
        d: { isDown: true },
      } as any,
      undefined,
    );
    expect(mockSetVelocity).toHaveBeenCalledWith(player.speed, 0);

    // Test W key (up)
    mockSetVelocity.mockClear();
    player.update(
      {
        up: { isDown: false },
        down: { isDown: false },
        left: { isDown: false },
        right: { isDown: false },
      } as any,
      {
        w: { isDown: true },
        a: { isDown: false },
        s: { isDown: false },
        d: { isDown: false },
      } as any,
      undefined,
    );
    expect(mockSetVelocity).toHaveBeenCalledWith(0, -player.speed);

    // Test S key (down)
    mockSetVelocity.mockClear();
    player.update(
      {
        up: { isDown: false },
        down: { isDown: false },
        left: { isDown: false },
        right: { isDown: false },
      } as any,
      {
        w: { isDown: false },
        a: { isDown: false },
        s: { isDown: true },
        d: { isDown: false },
      } as any,
      undefined,
    );
    expect(mockSetVelocity).toHaveBeenCalledWith(0, player.speed);
  });

  it("should normalize diagonal movement speed", () => {
    // Store the mock function
    const mockSetVelocity = vi.fn();
    player.sprite.setVelocity = mockSetVelocity;

    player.update(
      {
        up: { isDown: true },
        down: { isDown: false },
        left: { isDown: true },
        right: { isDown: false },
      } as any,
      {
        w: { isDown: false },
        a: { isDown: false },
        s: { isDown: false },
        d: { isDown: false },
      } as any,
      undefined,
    );

    const expectedSpeed = -player.speed * 0.707;
    expect(mockSetVelocity).toHaveBeenCalledWith(expectedSpeed, expectedSpeed);
  });

  it("should take damage with armor reduction", () => {
    player.armor = 5;
    player.health = 100;

    player.takeDamage(10);

    expect(player.health).toBe(95); // 10 damage - 5 armor = 5 damage
    expect(player.sprite.setTint).toHaveBeenCalledWith(0xff0000);
    expect(player.sprite.clearTint).toHaveBeenCalled();
  });

  it("should take minimum 1 damage with high armor", () => {
    player.armor = 20;
    player.health = 100;

    player.takeDamage(10);

    expect(player.health).toBe(99); // Minimum 1 damage even with high armor
  });

  it("should trigger game over when health reaches zero with no revives", () => {
    player.health = 1;
    player.reviveCount = 0;

    player.takeDamage(10);

    expect(player.health).toBe(0);
    expect(mockScene.gameOver).toHaveBeenCalled();
  });

  it("should revive when health reaches zero with available revives", () => {
    player.health = 1;
    player.reviveCount = 1;

    player.takeDamage(10);

    expect(player.health).toBe(player.maxHealth);
    expect(player.reviveCount).toBe(0);
    expect(player.sprite.setTint).toHaveBeenCalledWith(0xffff00);
    expect(player.sprite.clearTint).toHaveBeenCalled();
    expect(mockScene.gameOver).not.toHaveBeenCalled();
  });

  it("should add experience with bonus", () => {
    player.experience = 0;
    player.expBonus = 0.5; // 50% bonus

    // Override levelUp to prevent it from being called
    const mockLevelUp = vi
      .spyOn(player as any, "levelUp")
      .mockImplementation(() => {});

    player.addExperience(10);

    // Check the actual exp calculation - it should be 10 * 1.5 = 15
    expect(player.experience).toBe(15);

    mockLevelUp.mockRestore();
  });

  it("should level up when enough experience is gained", () => {
    player.experience = 5;
    player.experienceToNextLevel = 10;
    player.health = player.maxHealth - 30; // Set to below max health

    player.addExperience(6); // Total experience: 11, which is more than 10

    expect(player.level).toBe(2);
    expect(player.experience).toBe(1); // Carry over excess experience
    expect(player.health).toBe(player.maxHealth - 10); // Health increased by 20
    expect(mockScene.showLevelUpMenu).toHaveBeenCalled();
  });

  it("should increase experience requirement for next level", () => {
    player.experienceToNextLevel = 10;
    const initialReq = player.experienceToNextLevel;

    player.experience = 10;
    player.addExperience(0); // Just trigger level up

    expect(player.experienceToNextLevel).toBe(Math.floor(initialReq * 1.5));
  });
});
