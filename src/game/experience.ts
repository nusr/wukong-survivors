import Phaser from "phaser";
import { Player } from "./player";
import { scaleManager } from "./ScaleManager";
import {
  GEM_MAP,
  DEFAULT_COLLECT_RADIUS,
  DEFAULT_MAGNET_RADIUS,
  DEFAULT_SPRITE_SIZE,
} from "../constant";
import { useSaveStore } from "../store";
import type { GameScene } from "./GameScene";

interface Position {
  x: number;
  y: number;
}

export type CollectibleType = "coin" | "gem";

// Collectible item base class
export class CollectibleItem {
  public sprite: Phaser.Physics.Arcade.Sprite;
  public type: CollectibleType;
  public value: number;
  private scene: GameScene;
  private magnetized: boolean;
  private collectRadius: number;
  private magnetRadius: number;

  constructor(
    scene: GameScene,
    x: number,
    y: number,
    type: CollectibleType,
    value: number = 0,
  ) {
    this.scene = scene;
    this.type = type;
    this.value = value;
    this.magnetized = false;
    this.collectRadius = DEFAULT_COLLECT_RADIUS;
    this.magnetRadius = DEFAULT_MAGNET_RADIUS;

    // Determine texture based on type and value
    let textureName: string;
    if (type === "coin") {
      textureName = GEM_MAP.coin;
    } else {
      // Gem texture based on value
      if (value >= 5) {
        textureName = GEM_MAP.gemHigh;
      } else if (value >= 3) {
        textureName = GEM_MAP.gemMedium;
      } else {
        textureName = GEM_MAP.gemLow;
      }
    }

    // Create sprite with responsive scaling
    const itemSize = scaleManager.scaleValue(DEFAULT_SPRITE_SIZE);
    this.sprite = scene.physics.add.sprite(x, y, textureName);
    this.sprite.setDisplaySize(itemSize, itemSize);
    // Set collision body to match sprite size
    this.sprite.body?.setSize(itemSize, itemSize);
  }

  public update(
    playerPos: Position,
    collectRangeBonus: number = 0,
    magnetBonus: number = 0,
  ): boolean {
    const dx = playerPos.x - this.sprite.x;
    const dy = playerPos.y - this.sprite.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const collectBonusFactor = 1 + collectRangeBonus;
    const magnetBonusFactor = 1 + magnetBonus;

    // Adjust ranges based on bonuses
    const adjustedCollectRadius = scaleManager.scaleValue(
      this.collectRadius * collectBonusFactor,
    );
    const adjustedMagnetRadius = scaleManager.scaleValue(
      this.magnetRadius * magnetBonusFactor,
    );

    // Collected
    if (distance < adjustedCollectRadius) {
      return true; // Return true to indicate collection
    }

    // Magnetic attraction
    if (distance < adjustedMagnetRadius) {
      this.magnetized = true;
    }

    if (this.magnetized) {
      const speed = 300;
      this.sprite.setVelocity((dx / distance) * speed, (dy / distance) * speed);
    }

    return false;
  }

  public collect(): void {
    // Collection animation
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0,
      scale: 1.5,
      duration: 200,
      onComplete: () => {
        this.sprite.destroy();
      },
    });

    // Handle coin collection immediately
    if (this.type === "coin") {
      useSaveStore.getState().addGold(1);
    }
  }

  public destroy(): void {
    this.sprite?.destroy();
  }
}

// Experience manager
export class ExperienceManager {
  private scene: GameScene;
  private player: Player;
  private collectibles: CollectibleItem[] = [];

  constructor(scene: GameScene, player: Player) {
    this.scene = scene;
    this.player = player;
  }

  // Update all collectibles (gems and coins)
  public update(): void {
    const playerPos = this.scene.getPlayerPosition();
    const collectRangeBonus = this.player?.collectRange || 0;
    const magnetBonus = this.player?.magnetBonus || 0;
    for (let i = this.collectibles.length - 1; i >= 0; i--) {
      const collectible = this.collectibles[i];
      if (collectible.update(playerPos, collectRangeBonus, magnetBonus)) {
        // Item collected
        if (collectible.type === "gem") {
          this.player.addExperience(collectible.value);
        }
        collectible.collect();
        this.collectibles.splice(i, 1);
      }
    }
  }

  // Spawn a gem at specified position with given value
  public spawnGem(x: number, y: number, value: number): void {
    const gem = new CollectibleItem(this.scene, x, y, "gem", value);
    this.collectibles.push(gem);
  }

  // Spawn a gold coin at specified position
  public spawnCoin(x: number, y: number): void {
    const coin = new CollectibleItem(this.scene, x, y, "coin");
    this.collectibles.push(coin);
  }

  // Clear all collectibles
  public clear(): void {
    for (const collectible of this.collectibles) {
      collectible.destroy();
    }
    this.collectibles = [];
  }

  // Collect all remaining items with animation
  public collectAllItems(): Promise<void> {
    if (this.collectibles.length === 0) {
      return Promise.resolve();
    }

    let completedCount = 0;
    const totalCollectibles = this.collectibles.length;

    return new Promise((resolve) => {
      for (const collectible of this.collectibles) {
        const playerPos = this.scene.getPlayerPosition();
        this.scene.tweens.add({
          targets: collectible.sprite,
          x: playerPos.x,
          y: playerPos.y,
          scale: 1.5,
          duration: 1000,
          ease: Phaser.Math.Easing.Quadratic.InOut,
          onComplete: () => {
            // Collect the item after animation completes
            if (collectible.type === "gem") {
              this.player.addExperience(collectible.value);
            }
            collectible.collect();

            // Check if all animations are completed
            completedCount++;
            if (completedCount === totalCollectibles) {
              resolve();
            }
          },
        });
      }
    });
  }
}
