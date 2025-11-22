import Phaser from "phaser";
import { scaleManager } from "./ScaleManager";
import type { CharacterType } from "../types";
import type { GameScene } from "./GameScene";

export interface WASDKeys {
  w?: Phaser.Input.Keyboard.Key;
  a?: Phaser.Input.Keyboard.Key;
  s?: Phaser.Input.Keyboard.Key;
  d?: Phaser.Input.Keyboard.Key;
}

interface Position {
  x: number;
  y: number;
}

// Player class
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
  public hasRevive: boolean;
  private scene: GameScene;

  constructor(
    scene: GameScene,
    x: number,
    y: number,
    textureKey: CharacterType,
  ) {
    this.scene = scene;

    // Get scaled sprite size
    const spriteSize = scaleManager.getSpriteSize(48);

    // Create player sprite with loaded texture
    this.sprite = scene.physics.add.sprite(x, y, textureKey);
    this.sprite.setDisplaySize(spriteSize, spriteSize);
    // Set collision body to match sprite size
    this.sprite.body?.setSize(spriteSize, spriteSize);

    // Player attributes
    this.maxHealth = 100;
    this.health = this.maxHealth;
    this.speed = 150;
    this.level = 1;
    this.experience = 0;
    this.experienceToNextLevel = 10;
    this.armor = 0;
    this.critRate = 0;
    this.expBonus = 0;
    this.hasRevive = false;

    // Set camera to follow with responsive zoom
    scene.cameras.main.startFollow(this.sprite);
  }

  public update(
    cursors?: Phaser.Types.Input.Keyboard.CursorKeys,
    wasd?: WASDKeys,
  ): void {
    // Reset velocity
    this.sprite.setVelocity(0);

    // Movement control
    let velocityX = 0;
    let velocityY = 0;

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

    // Normalize diagonal movement speed
    if (velocityX !== 0 && velocityY !== 0) {
      velocityX *= 0.707;
      velocityY *= 0.707;
    }

    this.sprite.setVelocity(velocityX, velocityY);
  }

  public takeDamage(damage: number): void {
    // Apply armor reduction
    const actualDamage = Math.max(1, damage - this.armor);
    this.health -= actualDamage;

    // Damage flash effect
    this.sprite.setTint(0xff0000);
    this.scene.time.delayedCall(100, () => {
      this.sprite.clearTint();
    });

    if (this.health <= 0) {
      this.health = 0;
      this.die();
    }
  }

  private die(): void {
    // Check for revive
    if (this.hasRevive) {
      this.hasRevive = false;
      this.health = this.maxHealth;
      // Visual effect for revival
      this.sprite.setTint(0xffff00);
      this.scene.time.delayedCall(500, () => {
        this.sprite.clearTint();
      });
      return;
    }
    // Game over logic
    this.scene.gameOver();
  }

  public addExperience(amount: number): void {
    // Apply experience bonus
    const actualExp = Math.floor(amount * (1 + this.expBonus));
    this.experience += actualExp;

    if (this.experience >= this.experienceToNextLevel) {
      this.levelUp();
    }
  }

  private levelUp(): void {
    this.level++;
    this.experience -= this.experienceToNextLevel;
    this.experienceToNextLevel = Math.floor(this.experienceToNextLevel * 1.5);

    // Restore a small amount of health
    this.health = Math.min(this.health + 20, this.maxHealth);

    // Show level up selection menu
    this.scene.showLevelUpMenu();
  }

  public getPosition(): Position {
    return { x: this.sprite.x, y: this.sprite.y };
  }
}
