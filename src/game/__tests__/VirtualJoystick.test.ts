import { describe, it, expect, vi, beforeEach } from "vitest";
import { VirtualJoystick } from "../VirtualJoystick";

describe("VirtualJoystick", () => {
  let mockScene: any;
  let mockContainer: any;
  let mockBaseGraphics: any;
  let mockStickGraphics: any;
  let joystick: VirtualJoystick;

  beforeEach(() => {
    // Clear all mocks
    vi.clearAllMocks();

    // Mock Phaser objects
    mockBaseGraphics = {
      lineStyle: vi.fn().mockReturnThis(),
      fillStyle: vi.fn().mockReturnThis(),
      fillCircle: vi.fn().mockReturnThis(),
      strokeCircle: vi.fn().mockReturnThis(),
      clear: vi.fn().mockReturnThis(),
    };

    mockStickGraphics = {
      lineStyle: vi.fn().mockReturnThis(),
      fillStyle: vi.fn().mockReturnThis(),
      fillCircle: vi.fn().mockReturnThis(),
      strokeCircle: vi.fn().mockReturnThis(),
      clear: vi.fn().mockReturnThis(),
    };

    mockContainer = {
      setScrollFactor: vi.fn().mockReturnThis(),
      setDepth: vi.fn().mockReturnThis(),
      setAlpha: vi.fn().mockReturnThis(),
      setVisible: vi.fn().mockReturnThis(),
      add: vi.fn().mockReturnThis(),
      setInteractive: vi.fn().mockReturnThis(),
      on: vi.fn().mockReturnThis(),
      setPosition: vi.fn().mockReturnThis(),
      destroy: vi.fn(),
    };

    // Mock the scene
    mockScene = {
      add: {
        container: vi.fn().mockReturnValue(mockContainer),
        graphics: vi
          .fn()
          .mockReturnValueOnce(mockBaseGraphics)
          .mockReturnValueOnce(mockStickGraphics),
      },
      input: {
        on: vi.fn(),
      },
    };

    // Create joystick instance
    joystick = new VirtualJoystick(mockScene as any, 100, 100);
  });

  it("should initialize with correct properties", () => {
    // Check if container is created with correct position
    expect(mockScene.add.container).toHaveBeenCalledWith(100, 100);

    // Check container properties
    expect(mockContainer.setScrollFactor).toHaveBeenCalledWith(0);
    expect(mockContainer.setDepth).toHaveBeenCalledWith(3);
    expect(mockContainer.setAlpha).toHaveBeenCalledWith(0.6);
    expect(mockContainer.setVisible).toHaveBeenCalledWith(false);

    // Check base creation
    expect(mockBaseGraphics.lineStyle).toHaveBeenCalledWith(3, 0xffffff, 0.8);
    expect(mockBaseGraphics.fillStyle).toHaveBeenCalledWith(0x000000, 0.3);

    // Check stick creation
    expect(mockStickGraphics.lineStyle).toHaveBeenCalledWith(2, 0xffffff, 0.8);
    expect(mockStickGraphics.fillStyle).toHaveBeenCalledWith(0xffffff, 0.5);

    // Check container content
    expect(mockContainer.add).toHaveBeenCalledWith([
      mockBaseGraphics,
      mockStickGraphics,
    ]);
  });

  it("should handle pointer down event", () => {
    // Get the pointerdown event handler from the mock
    const onPointerDownCall = mockContainer.on.mock.calls.find(
      (call: any) => call[0] === "pointerdown",
    );
    expect(onPointerDownCall).toBeDefined();
    const onPointerDown = onPointerDownCall[1];

    // Mock pointer
    const mockPointer = { id: 1, x: 150, y: 150 };

    // Simulate pointer down
    onPointerDown(mockPointer);

    // Check if joystick is active
    expect((joystick as any).isActive).toBe(true);
    expect((joystick as any).pointer).toBe(mockPointer);

    // Check if opacity increases when active
    expect(mockContainer.setAlpha).toHaveBeenCalledWith(0.9);
  });

  it("should handle pointer move event", () => {
    // Activate the joystick first
    const mockPointer = { id: 1, x: 150, y: 150 };
    (joystick as any).isActive = true;
    (joystick as any).pointer = mockPointer;

    // Get the pointermove event handler from the mock
    const onPointerMoveCall = mockScene.input.on.mock.calls.find(
      (call: any) => call[0] === "pointermove",
    );
    expect(onPointerMoveCall).toBeDefined();
    const onPointerMove = onPointerMoveCall[1];

    // Mock updateStickPosition method
    const mockUpdateStickPosition = vi.spyOn(
      joystick as any,
      "updateStickPosition",
    );

    // Simulate pointer move with the same pointer
    onPointerMove(mockPointer);

    // Check if stick position is updated
    expect(mockUpdateStickPosition).toHaveBeenCalledWith(mockPointer);

    // Clean up
    mockUpdateStickPosition.mockRestore();
  });

  it("should handle pointer up event", () => {
    // Activate the joystick first
    const mockPointer = { id: 1, x: 150, y: 150 };
    (joystick as any).isActive = true;
    (joystick as any).pointer = mockPointer;

    // Get the pointerup event handler from the mock
    const onPointerUpCall = mockScene.input.on.mock.calls.find(
      (call: any) => call[0] === "pointerup",
    );
    expect(onPointerUpCall).toBeDefined();
    const onPointerUp = onPointerUpCall[1];

    // Mock resetStick method
    const mockResetStick = vi.spyOn(joystick as any, "resetStick");

    // Simulate pointer up
    onPointerUp(mockPointer);

    // Check if joystick is deactivated
    expect((joystick as any).isActive).toBe(false);
    expect((joystick as any).pointer).toBe(null);

    // Check if stick is reset
    expect(mockResetStick).toHaveBeenCalled();

    // Check if opacity is restored
    expect(mockContainer.setAlpha).toHaveBeenCalledWith(0.6);

    // Clean up
    mockResetStick.mockRestore();
  });

  it("should update stick position correctly", () => {
    // Mock pointer
    const mockPointer = {
      x: 150, // 50px to the right of joystick center
      y: 150, // 50px below joystick center
    };

    // Mock container position
    (joystick as any).container = {
      ...mockContainer,
      x: 100,
      y: 100,
    };

    // Call updateStickPosition directly
    (joystick as any).updateStickPosition(mockPointer);

    // Check if stick is redrawn
    expect(mockStickGraphics.clear).toHaveBeenCalled();
    expect(mockStickGraphics.fillCircle).toHaveBeenCalled();
    expect(mockStickGraphics.strokeCircle).toHaveBeenCalled();

    // Check if current input is updated
    const input = (joystick as any).currentInput;
    expect(input.x).toBeGreaterThan(0);
    expect(input.y).toBeGreaterThan(0);
  });

  it("should reset stick correctly", () => {
    // Set initial input
    (joystick as any).currentInput = { x: 0.5, y: -0.5 };

    // Call resetStick directly
    (joystick as any).resetStick();

    // Check if stick is redrawn at center
    expect(mockStickGraphics.clear).toHaveBeenCalled();
    expect(mockStickGraphics.fillCircle).toHaveBeenCalledWith(0, 0, 36);
    expect(mockStickGraphics.strokeCircle).toHaveBeenCalledWith(0, 0, 36);

    // Check if input is reset
    expect((joystick as any).currentInput).toEqual({ x: 0, y: 0 });
  });

  it("should get input correctly", () => {
    // Set initial input
    (joystick as any).currentInput = { x: 0.5, y: -0.5 };

    // Call getInput
    const input = joystick.getInput();

    // Check if input is returned correctly
    expect(input).toEqual({ x: 0.5, y: -0.5 });
  });

  it("should check if pressed correctly", () => {
    // Test when not pressed
    (joystick as any).isActive = false;
    expect(joystick.isPressed()).toBe(false);

    // Test when pressed
    (joystick as any).isActive = true;
    expect(joystick.isPressed()).toBe(true);
  });

  it("should show and hide correctly", () => {
    // Test show
    joystick.show();
    expect(mockContainer.setVisible).toHaveBeenCalledWith(true);

    // Test hide when inactive
    joystick.hide();
    expect(mockContainer.setVisible).toHaveBeenCalledWith(false);

    // Test hide when active
    (joystick as any).isActive = true;
    const mockResetStick = vi.spyOn(joystick as any, "resetStick");

    joystick.hide();
    expect(mockContainer.setVisible).toHaveBeenCalledWith(false);
    expect(mockResetStick).toHaveBeenCalled();
    expect((joystick as any).isActive).toBe(false);

    // Clean up
    mockResetStick.mockRestore();
  });

  it("should set position correctly", () => {
    // Call setPosition
    joystick.setPosition(200, 300);

    // Check if container position is updated
    expect(mockContainer.setPosition).toHaveBeenCalledWith(200, 300);
  });

  it("should update size correctly", () => {
    // Mock old values
    (joystick as any).baseRadius = 60;
    (joystick as any).container = {
      ...mockContainer,
      x: 100,
      y: 100,
    };

    // Call updateSize
    joystick.updateSize();

    // Check if graphics are redrawn with new sizes
    expect(mockBaseGraphics.clear).toHaveBeenCalled();
    expect(mockBaseGraphics.fillCircle).toHaveBeenCalled();
    expect(mockBaseGraphics.strokeCircle).toHaveBeenCalled();

    expect(mockStickGraphics.clear).toHaveBeenCalled();
    expect(mockStickGraphics.fillCircle).toHaveBeenCalled();
    expect(mockStickGraphics.strokeCircle).toHaveBeenCalled();

    // Check if hit area is updated
    expect(mockContainer.setInteractive).toHaveBeenCalled();
  });

  it("should destroy correctly", () => {
    // Call destroy
    joystick.destroy();

    // Check if container is destroyed
    expect(mockContainer.destroy).toHaveBeenCalled();
  });
});
