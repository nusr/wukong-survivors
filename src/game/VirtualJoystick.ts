import Phaser from "phaser";
import { scaleManager } from "./ScaleManager";
import type { GameScene } from "./GameScene";

export interface JoystickInput {
  x: number; // -1 to 1
  y: number; // -1 to 1
}

/**
 * Virtual Joystick for mobile/tablet touch controls
 * Follows best practices for mobile game input:
 * - Semi-transparent UI that doesn't block gameplay view
 * - Visual feedback with stick movement
 * - Normalized output values for consistent movement
 * - Responsive sizing based on screen size
 */
export class VirtualJoystick {
  private scene: GameScene;
  private base: Phaser.GameObjects.Graphics;
  private stick: Phaser.GameObjects.Graphics;
  private container: Phaser.GameObjects.Container;
  private baseRadius: number;
  private stickRadius: number;
  private maxDistance: number;
  private isActive: boolean = false;
  private currentInput: JoystickInput = { x: 0, y: 0 };
  private pointer: Phaser.Input.Pointer | null = null;

  constructor(scene: GameScene, x: number, y: number) {
    this.scene = scene;

    // Responsive sizing
    this.baseRadius = scaleManager.UIScaleValue(60);
    this.stickRadius = scaleManager.UIScaleValue(30);
    this.maxDistance = this.baseRadius - this.stickRadius;

    // Create container
    this.container = scene.add
      .container(x, y)
      .setScrollFactor(0)
      .setDepth(scaleManager.getZIndex())
      .setAlpha(0.6);

    // Create base (outer circle)
    this.base = scene.add.graphics();
    this.base.lineStyle(3, 0xffffff, 0.8);
    this.base.fillStyle(0x000000, 0.3);
    this.base.fillCircle(0, 0, this.baseRadius);
    this.base.strokeCircle(0, 0, this.baseRadius);

    // Create stick (inner circle)
    this.stick = scene.add.graphics();
    this.stick.lineStyle(2, 0xffffff, 0.8);
    this.stick.fillStyle(0xffffff, 0.5);
    this.stick.fillCircle(0, 0, this.stickRadius);
    this.stick.strokeCircle(0, 0, this.stickRadius);

    this.container.add([this.base, this.stick]);

    // Setup touch input
    this.setupInput();

    // Hide by default (will be shown on touch devices)
    this.container.setVisible(false);
  }

  private setupInput(): void {
    // Make the base interactive
    const hitArea = new Phaser.Geom.Circle(0, 0, this.baseRadius);
    this.container.setInteractive(hitArea, Phaser.Geom.Circle.Contains);

    // Handle pointer down
    this.container.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      this.isActive = true;
      this.pointer = pointer;
      this.updateStickPosition(pointer);
      this.container.setAlpha(0.9); // Increase opacity when active
    });

    // Handle pointer move
    this.scene.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      if (this.isActive && this.pointer === pointer) {
        this.updateStickPosition(pointer);
      }
    });

    // Handle pointer up
    this.scene.input.on("pointerup", (pointer: Phaser.Input.Pointer) => {
      if (this.pointer === pointer) {
        this.isActive = false;
        this.pointer = null;
        this.resetStick();
        this.container.setAlpha(0.6); // Restore opacity
      }
    });
  }

  private updateStickPosition(pointer: Phaser.Input.Pointer): void {
    // Get pointer position relative to container
    const localX = pointer.x - this.container.x;
    const localY = pointer.y - this.container.y;

    // Calculate distance and angle
    const distance = Math.sqrt(localX * localX + localY * localY);
    const angle = Math.atan2(localY, localX);

    // Clamp to max distance
    const clampedDistance = Math.min(distance, this.maxDistance);

    // Calculate stick position
    const stickX = Math.cos(angle) * clampedDistance;
    const stickY = Math.sin(angle) * clampedDistance;

    // Update stick graphics
    this.stick.clear();
    this.stick.lineStyle(2, 0xffffff, 0.8);
    this.stick.fillStyle(0xffffff, 0.5);
    this.stick.fillCircle(stickX, stickY, this.stickRadius);
    this.stick.strokeCircle(stickX, stickY, this.stickRadius);

    // Calculate normalized input (-1 to 1)
    this.currentInput.x = stickX / this.maxDistance;
    this.currentInput.y = stickY / this.maxDistance;
  }

  private resetStick(): void {
    // Reset stick to center
    this.stick.clear();
    this.stick.lineStyle(2, 0xffffff, 0.8);
    this.stick.fillStyle(0xffffff, 0.5);
    this.stick.fillCircle(0, 0, this.stickRadius);
    this.stick.strokeCircle(0, 0, this.stickRadius);

    // Reset input
    this.currentInput.x = 0;
    this.currentInput.y = 0;
  }

  public getInput(): JoystickInput {
    return this.currentInput;
  }

  public isPressed(): boolean {
    return this.isActive;
  }

  public show(): void {
    this.container.setVisible(true);
  }

  public hide(): void {
    this.container.setVisible(false);
    if (this.isActive) {
      this.resetStick();
      this.isActive = false;
    }
  }

  public setPosition(x: number, y: number): void {
    this.container.setPosition(x, y);
  }

  public updateSize(): void {
    // Update sizes based on current scale
    const oldBaseRadius = this.baseRadius;
    this.baseRadius = scaleManager.UIScaleValue(60);
    this.stickRadius = scaleManager.UIScaleValue(30);
    this.maxDistance = this.baseRadius - this.stickRadius;

    // Update graphics
    this.base.clear();
    this.base.lineStyle(3, 0xffffff, 0.8);
    this.base.fillStyle(0x000000, 0.3);
    this.base.fillCircle(0, 0, this.baseRadius);
    this.base.strokeCircle(0, 0, this.baseRadius);

    this.resetStick();

    // Update hit area
    const hitArea = new Phaser.Geom.Circle(0, 0, this.baseRadius);
    this.container.setInteractive(hitArea, Phaser.Geom.Circle.Contains);

    // Adjust position if needed to maintain relative screen position
    const scale = this.baseRadius / oldBaseRadius;
    this.container.x *= scale;
    this.container.y *= scale;
  }

  public destroy(): void {
    this.container.destroy();
  }
}
