import Phaser from "phaser";
import { scaleManager } from "./ScaleManager";
import { ENEMIES_DATA } from "../constant/enemies";
import type { EnemyType, EnemyRank } from "../types";
import type { GameScene } from "./GameScene";

interface Position {
  x: number;
  y: number;
}

interface EnemySprite extends Phaser.Physics.Arcade.Sprite {
  enemyRef?: Enemy;
}

// Enemy class
export class Enemy {
  public sprite: EnemySprite;
  public type: EnemyType;
  public maxHealth: number = 0;
  public health: number = 0;
  public speed: number = 0;
  public damage: number = 0;
  public expValue: number = 0;
  public goldValue: number = 0;
  public isDead: boolean;
  private scene: GameScene;

  constructor(scene: GameScene, x: number, y: number, enemyType: EnemyType) {
    this.scene = scene;
    this.type = enemyType;
    this.isDead = false;

    // Get enemy data from constants
    const enemyData = ENEMIES_DATA[enemyType];

    // Set properties from enemy data
    this.maxHealth = enemyData.health;
    this.health = this.maxHealth;
    this.speed = enemyData.speed;
    this.damage = enemyData.damage;
    this.expValue = enemyData.xpValue;
    this.goldValue = enemyData.goldValue;

    // Create enemy sprite with loaded texture using enemy ID
    this.sprite = scene.physics.add.sprite(x, y, enemyType) as EnemySprite;

    // Set display size based on enemy rank with responsive scaling
    const baseSize = this.getEnemySizeByRank(enemyData.rank);
    const displaySize = scaleManager.getSpriteSize(baseSize);
    this.sprite.setDisplaySize(displaySize, displaySize);

    // Set collision body to match sprite size
    this.sprite.body?.setSize(displaySize, displaySize);

    // Store reference
    this.sprite.enemyRef = this;
  }

  private getEnemySizeByRank(rank: EnemyRank): number {
    switch (rank) {
      case "minion":
        return 32;
      case "elite":
        return 40;
      default:
        return 32;
    }
  }

  public update(playerPos: Position): void {
    if (this.isDead) return;

    // Track player
    const dx = playerPos.x - this.sprite.x;
    const dy = playerPos.y - this.sprite.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
      this.sprite.setVelocity(
        (dx / distance) * this.speed,
        (dy / distance) * this.speed,
      );
    }
  }

  public takeDamage(damage: number): boolean {
    if (this.isDead) return false;

    this.health -= damage;

    // Damage effect
    this.sprite.setTint(0xffffff);
    this.scene.time.delayedCall(50, () => {
      if (!this.isDead) {
        this.sprite.clearTint();
      }
    });

    if (this.health <= 0) {
      this.die();
      return true;
    }
    return false;
  }

  private die(): void {
    if (this.isDead) return;
    this.isDead = true;

    // Drop experience
    this.scene.spawnExperience(this.sprite.x, this.sprite.y, this.expValue);

    // Destroy enemy
    this.sprite.destroy();
  }

  public destroy(): void {
    if (this.sprite && this.sprite.scene) {
      this.sprite.destroy();
    }
  }
}

// Enemy spawner
export class EnemySpawner {
  private scene: GameScene;
  private enemies: Enemy[];
  private spawnTimer: number;
  private spawnInterval: number;
  private enemiesPerWave: number;
  private difficultyTimer: number;
  private availableEnemies: EnemyType[];

  constructor(scene: GameScene, availableEnemies: EnemyType[]) {
    this.scene = scene;
    this.enemies = [];
    this.spawnTimer = 0;
    this.spawnInterval = 2000; // Spawn a wave every 2 seconds
    this.enemiesPerWave = 3;
    this.difficultyTimer = 0;
    this.availableEnemies =
      availableEnemies.length > 0 ? availableEnemies : ["wolf_minion"];
  }

  public update(_time: number, delta: number, playerPos: Position): void {
    // Update all enemies
    this.enemies.forEach((enemy) => {
      if (!enemy.isDead) {
        enemy.update(playerPos);
      }
    });

    // Clean up dead enemies
    this.enemies = this.enemies.filter((enemy) => !enemy.isDead);

    // Spawn new enemies
    this.spawnTimer += delta;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this.spawnWave(playerPos);
    }

    // Increase difficulty
    this.difficultyTimer += delta;
    if (this.difficultyTimer >= 30000) {
      // Increase difficulty every 30 seconds
      this.difficultyTimer = 0;
      this.enemiesPerWave += 1;
      this.spawnInterval = Math.max(1000, this.spawnInterval - 100);
    }
  }

  private spawnWave(playerPos: Position): void {
    for (let i = 0; i < this.enemiesPerWave; i++) {
      this.spawnEnemy(playerPos);
    }
  }

  private spawnEnemy(playerPos: Position): void {
    // Spawn at random position outside player's view
    const angle = Math.random() * Math.PI * 2;
    const distance = 400 + Math.random() * 200;

    const x = playerPos.x + Math.cos(angle) * distance;
    const y = playerPos.y + Math.sin(angle) * distance;

    // Randomly select enemy type from available enemies
    const randomIndex = Math.floor(
      Math.random() * this.availableEnemies.length,
    );
    const enemyType = this.availableEnemies[randomIndex];

    const enemy = new Enemy(this.scene, x, y, enemyType);
    this.enemies.push(enemy);
  }

  public getEnemies(): Enemy[] {
    return this.enemies.filter((enemy) => !enemy.isDead);
  }

  public clear(): void {
    this.enemies.forEach((enemy) => enemy.destroy());
    this.enemies = [];
  }
}
