import Phaser from "phaser";
import { Player } from "./player";
import { scaleManager } from "./ScaleManager";

interface Position {
  x: number;
  y: number;
}

interface GemSprite extends Phaser.Physics.Arcade.Sprite {
  gemRef?: ExperienceGem;
}

// Experience gem class
export class ExperienceGem {
  public sprite: GemSprite;
  public value: number;
  private scene: Phaser.Scene;
  private magnetized: boolean;
  private collectRadius: number;
  private magnetRadius: number;

  constructor(scene: Phaser.Scene, x: number, y: number, value: number) {
    this.scene = scene;
    this.value = value;
    this.magnetized = false;
    this.collectRadius = scaleManager.scaleValue(30);
    this.magnetRadius = scaleManager.scaleValue(150);

    // Determine texture based on value
    let textureName = "gem-low"; // Green - low value
    if (value >= 5) {
      textureName = "gem-high"; // Blue - high value
    } else if (value >= 3) {
      textureName = "gem-medium"; // Purple - medium value
    }

    // Create experience gem sprite using loaded texture with responsive scaling
    const gemSize = scaleManager.getSpriteSize(32);
    this.sprite = scene.physics.add.sprite(x, y, textureName) as GemSprite;
    this.sprite.setDisplaySize(gemSize, gemSize);
    // Set collision body to match sprite size
    this.sprite.body?.setSize(gemSize, gemSize);

    this.sprite.gemRef = this;
  }

  public update(playerPos: Position): boolean {
    const dx = playerPos.x - this.sprite.x;
    const dy = playerPos.y - this.sprite.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Collected
    if (distance < this.collectRadius) {
      return true; // Return true to indicate collection
    }

    // Magnetic attraction
    if (distance < this.magnetRadius) {
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
  }

  public destroy(): void {
    if (this.sprite && this.sprite.scene) {
      this.sprite.destroy();
    }
  }
}

// Experience manager
export class ExperienceManager {
  private scene: Phaser.Scene;
  private player: Player;
  private gems: ExperienceGem[];

  constructor(scene: Phaser.Scene, player: Player) {
    this.scene = scene;
    this.player = player;
    this.gems = [];
  }

  public update(): void {
    const playerPos = this.player.getPosition();

    // Update all gems
    this.gems = this.gems.filter((gem) => {
      const shouldCollect = gem.update(playerPos);

      if (shouldCollect) {
        this.player.addExperience(gem.value);
        gem.collect();
        return false; // Remove from array
      }

      return true;
    });
  }

  public spawnGem(x: number, y: number, value: number): void {
    const gem = new ExperienceGem(this.scene, x, y, value);
    this.gems.push(gem);
  }

  public clear(): void {
    this.gems.forEach((gem) => gem.destroy());
    this.gems = [];
  }
}
