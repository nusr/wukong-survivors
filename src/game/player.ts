import Phaser from "phaser";
import { scaleManager } from "./ScaleManager";
import type { CharacterType } from "../types";
import type { GameScene } from "./GameScene";

/**
 * Interface defining WASD keyboard controls
 */
export interface WASDKeys {
  w?: Phaser.Input.Keyboard.Key;
  a?: Phaser.Input.Keyboard.Key;
  s?: Phaser.Input.Keyboard.Key;
  d?: Phaser.Input.Keyboard.Key;
}

/**
 * Position interface representing x and y coordinates
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * Player class handles player character behavior, stats, and interactions
 */
export class Player {
  public sprite: Phaser.Physics.Arcade.Sprite;
  public maxHealth: number;
  public health: number;
  public speed: number;
  public level: number;
  public experience: number;
  public experienceToNextLevel: number;
  public armor: number;
  public critRate: number;
  public expBonus: number;
  public reviveCount: number;
  public collectRangeBonus: number;
  public magnetBonus: number;
  public scene: GameScene;

  /**
   * Create a new player instance
   * @param scene Game scene reference
   * @param x Initial x position
   * @param y Initial y position
   * @param textureKey Character texture identifier
   */
  constructor(
    scene: GameScene,
    x: number,
    y: number,
    textureKey: CharacterType,
  ) {
    this.scene = scene;

    // Get scaled sprite size
    const spriteSize = scaleManager.scaleValue(48);

    // Create player sprite with loaded texture
    this.sprite = scene.physics.add.sprite(x, y, textureKey);
    this.sprite.setDisplaySize(spriteSize, spriteSize);
    // Set collision body to match sprite size
    this.sprite.body?.setSize(spriteSize, spriteSize);

    // Initialize player attributes
    this.maxHealth = 100;
    this.health = this.maxHealth;
    this.speed = 150;
    this.level = 1;
    this.experience = 0;
    this.experienceToNextLevel = 10;
    this.armor = 0;
    this.critRate = 0;
    this.expBonus = 0;
    this.reviveCount = 0;
    this.collectRangeBonus = 0;
    this.magnetBonus = 0;

    // Set camera to follow with responsive zoom
    scene.cameras.main.startFollow(this.sprite);
    scene.cameras.main.setZoom(scaleManager.getCameraZoom());
  }

  /**
   * Update player state and handle movement based on input
   * @param cursors Optional keyboard cursor keys
   * @param wasd Optional WASD keys
   * @param joystickInput Optional joystick input values
   */
  public update(
    cursors?: Phaser.Types.Input.Keyboard.CursorKeys,
    wasd?: WASDKeys,
    joystickInput?: { x: number; y: number },
  ): void {
    // Reset velocity
    this.sprite.setVelocity(0);

    // Initialize movement velocities
    let velocityX = 0;
    let velocityY = 0;

    // Handle joystick input (higher priority for mobile)
    if (joystickInput && (joystickInput.x !== 0 || joystickInput.y !== 0)) {
      velocityX = joystickInput.x * this.speed;
      velocityY = joystickInput.y * this.speed;
    } else {
      // Handle keyboard input
      if (cursors?.left.isDown || wasd?.a?.isDown) {
        velocityX = -this.speed;
      } else if (cursors?.right.isDown || wasd?.d?.isDown) {
        velocityX = this.speed;
      }

      if (cursors?.up.isDown || wasd?.w?.isDown) {
        velocityY = -this.speed;
      } else if (cursors?.down.isDown || wasd?.s?.isDown) {
        velocityY = this.speed;
      }

      // Normalize diagonal movement speed to maintain consistent speed
      if (velocityX !== 0 && velocityY !== 0) {
        const diagonalFactor = 0.707; // 1/sqrt(2) to maintain same magnitude
        velocityX *= diagonalFactor;
        velocityY *= diagonalFactor;
      }
    }

    // Apply calculated velocity
    this.sprite.setVelocity(velocityX, velocityY);
  }

  /**
   * Handle player taking damage with armor reduction
   * @param damage Raw damage amount to apply
   */
  public takeDamage(damage: number): void {
    // Apply armor reduction, minimum 1 damage
    const actualDamage = Math.max(1, damage - this.armor);
    this.health -= actualDamage;

    // Apply damage visual feedback
    this.sprite.setTint(0xff0000);
    this.scene.time.delayedCall(100, () => {
      this.sprite.clearTint();
    });

    // Check for player death
    if (this.health <= 0) {
      this.health = 0;
      this.handleDeath();
    }
  }

  /**
   * Handle player death logic, including revival checks
   */
  private handleDeath(): void {
    // Check if player can revive
    if (this.reviveCount > 0) {
      // Consume a revive
      this.reviveCount -= 1;
      // Fully restore health
      this.health = this.maxHealth;

      // Apply revival visual feedback
      this.sprite.setTint(0xffff00);
      this.scene.time.delayedCall(500, () => {
        this.sprite.clearTint();
      });
      return;
    }

    // No revives left, trigger game over
    this.scene.gameOver();
  }

  /**
   * Add experience to player, applying any experience bonuses
   * @param amount Base experience amount to add
   */
  public addExperience(amount: number): void {
    // Apply experience bonus multiplier
    const actualExp = Math.floor(amount * (1 + this.expBonus));
    this.experience += actualExp;

    // Check if player should level up
    if (this.experience >= this.experienceToNextLevel) {
      this.levelUp();
    }
  }

  /**
   * Handle player level up logic
   */
  private levelUp(): void {
    this.level++;

    // Carry over excess experience
    this.experience -= this.experienceToNextLevel;

    // Increase experience needed for next level (exponential scaling)
    this.experienceToNextLevel = Math.floor(this.experienceToNextLevel * 1.5);

    // Restore a portion of health on level up
    this.health = Math.min(this.health + 20, this.maxHealth);

    // Show level up selection menu
    this.scene.showLevelUpMenu();
  }
}
