import Phaser from "phaser";
import { scaleManager } from "./ScaleManager";
import { ENEMIES_DATA, ENEMY_SIZE } from "../constant";
import type { EnemyType } from "../types";
import type { GameScene } from "./GameScene";
import type { Position } from "./player";

/**
 * Enemy class represents hostile entities in the game that target the player
 */
export class Enemy {
  public sprite: Phaser.Physics.Arcade.Sprite;
  public type: EnemyType;
  public maxHealth: number;
  public health: number;
  public speed: number;
  public damage: number;
  public expValue: number;
  public goldValue: number;
  public isDead: boolean;
  private scene: GameScene;

  /**
   * Create a new enemy instance
   * @param scene Game scene reference
   * @param x Initial x position
   * @param y Initial y position
   * @param enemyType Type of enemy to create
   */
  constructor(scene: GameScene, x: number, y: number, enemyType: EnemyType) {
    this.scene = scene;
    this.type = enemyType;
    this.isDead = false;

    // Get enemy data from constants
    const enemyData = ENEMIES_DATA[enemyType];

    // Initialize properties from enemy data
    this.maxHealth = enemyData.health;
    this.health = this.maxHealth;
    this.speed = enemyData.speed;
    this.damage = enemyData.damage;
    this.expValue = enemyData.xpValue;
    this.goldValue = enemyData.goldValue;

    // Create enemy sprite with loaded texture
    this.sprite = scene.physics.add.sprite(x, y, enemyType);

    // Set display size based on enemy rank with responsive scaling
    const baseSize = ENEMY_SIZE[enemyData.rank];
    const displaySize = scaleManager.scaleValue(baseSize);
    this.sprite.setDisplaySize(displaySize, displaySize);

    // Set collision body to match sprite size
    this.sprite.body?.setSize(displaySize, displaySize);
  }

  /**
   * Update enemy behavior - primarily movement towards player
   * @param playerPos Current player position
   */
  public update(playerPos: Position): void {
    if (this.isDead) return;

    // Calculate direction vector towards player
    const dx = playerPos.x - this.sprite.x;
    const dy = playerPos.y - this.sprite.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Normalize direction vector and apply speed
    if (distance > 0) {
      this.sprite.setVelocity(
        (dx / distance) * this.speed,
        (dy / distance) * this.speed,
      );
    }
  }

  /**
   * Apply damage to the enemy
   * @param damage Amount of damage to apply
   * @returns True if enemy was killed, false otherwise
   */
  public takeDamage(damage: number): boolean {
    if (this.isDead) return false;

    // Reduce health
    this.health -= damage;

    // Apply hit visual feedback
    this.sprite.setTint(0xffffff);
    this.scene.time.delayedCall(50, () => {
      if (!this.isDead) {
        this.sprite.clearTint();
      }
    });

    // Check if enemy was killed
    if (this.health <= 0) {
      this.handleDeath();
      return true;
    }
    return false;
  }

  /**
   * Set enemy velocity
   * @param x X component of velocity
   * @param y Y component of velocity
   */
  public setVelocity(x: number, y: number): void {
    if (this.sprite.body && "setVelocity" in this.sprite.body) {
      this.sprite.body.setVelocity(x, y);
    }
  }

  /**
   * Handle enemy death logic
   */
  private handleDeath(): void {
    if (this.isDead) return;
    this.isDead = true;

    // Spawn experience points at enemy position
    this.scene.spawnExperience(this.sprite.x, this.sprite.y, this.expValue);

    // Clean up sprite
    this.sprite.destroy();
  }

  /**
   * Explicitly destroy the enemy
   */
  public destroy(): void {
    this.sprite?.destroy();
  }
}

/**
 * EnemySpawner class handles spawning and managing enemy waves following Vampire Survivors style spawning rules
 */
export class EnemySpawner {
  private scene: GameScene;
  private enemies: Enemy[];
  private spawnTimer: number;
  private spawnInterval: number;
  private baseSpawnInterval: number;
  private enemiesPerWave: number;
  private maxEnemiesOnScreen: number;
  private difficultyTimer: number;
  private availableEnemies: EnemyType[];
  private minSpawnDistance: number;
  private maxSpawnDistance: number;

  /**
   * Create a new enemy spawner
   * @param scene Game scene reference
   * @param availableEnemies Array of enemy types that can be spawned
   */
  constructor(scene: GameScene, availableEnemies: EnemyType[]) {
    this.scene = scene;
    this.enemies = [];
    this.spawnTimer = 0;
    this.baseSpawnInterval = 1500; // Base spawn interval: 1.5 seconds
    this.spawnInterval = this.baseSpawnInterval;
    this.enemiesPerWave = 2; // Start with 2 enemies per wave
    this.maxEnemiesOnScreen = 100; // Max enemies on screen at once
    this.difficultyTimer = 0;
    this.availableEnemies =
      availableEnemies.length > 0 ? availableEnemies : ["wolf_minion"];

    // Spawn distance from player (just outside visible screen)
    this.minSpawnDistance = 500; // Minimum spawn distance
    this.maxSpawnDistance = 700; // Maximum spawn distance
  }

  /**
   * Update spawner logic and all active enemies
   * @param _time Current game time
   * @param delta Time since last update in milliseconds
   * @param playerPos Current player position
   */
  public update(_time: number, delta: number, playerPos: Position): void {
    // Update all active enemies
    this.enemies.forEach((enemy) => {
      if (!enemy.isDead) {
        enemy.update(playerPos);
      }
    });

    // Clean up dead enemies to free resources
    this.enemies = this.enemies.filter((enemy) => !enemy.isDead);

    // Handle enemy spawning if below max limit
    if (this.enemies.length < this.maxEnemiesOnScreen) {
      this.spawnTimer += delta;
      if (this.spawnTimer >= this.spawnInterval) {
        this.spawnTimer = 0;
        this.spawnWave(playerPos);
      }
    }

    // Increase difficulty over time (Vampire Survivors style)
    this.difficultyTimer += delta;
    if (this.difficultyTimer >= 30000) {
      // Every 30 seconds
      this.difficultyTimer = 0;
      this.increaseDifficulty();
    }
  }

  /**
   * Increase game difficulty by adjusting spawn parameters
   */
  private increaseDifficulty(): void {
    // Increase enemies per wave (capped at 10)
    this.enemiesPerWave = Math.min(10, this.enemiesPerWave + 1);

    // Decrease spawn interval for faster spawning (minimum 500ms)
    this.spawnInterval = Math.max(500, this.spawnInterval - 100);

    // Increase max enemies on screen (capped at 300)
    this.maxEnemiesOnScreen = Math.min(300, this.maxEnemiesOnScreen + 20);
  }

  /**
   * Spawn a wave of enemies based on current game state
   * @param playerPos Current player position
   */
  private spawnWave(playerPos: Position): void {
    // Calculate actual spawn count based on game time (scales with minutes played)
    const timeBasedMultiplier =
      1 + Math.floor(this.scene.getPlayTime() / 60000); // +1 per minute

    // Ensure we don't exceed max enemies on screen
    const spawnCount = Math.min(
      this.enemiesPerWave * timeBasedMultiplier,
      this.maxEnemiesOnScreen - this.enemies.length,
    );

    // Spawn each enemy in the wave
    for (let i = 0; i < spawnCount; i++) {
      this.spawnEnemy(playerPos);
    }
  }

  /**
   * Spawn a single enemy at a random position around the player
   * @param playerPos Current player position
   */
  private spawnEnemy(playerPos: Position): void {
    // Calculate random spawn position outside visible screen
    const angle = Math.random() * Math.PI * 2; // Random angle around player

    // Random distance between min and max spawn distance
    const distance =
      this.minSpawnDistance +
      Math.random() * (this.maxSpawnDistance - this.minSpawnDistance);

    // Calculate spawn coordinates
    const x = playerPos.x + Math.cos(angle) * distance;
    const y = playerPos.y + Math.sin(angle) * distance;

    // Select appropriate enemy type based on game progression
    const enemyType = this.selectEnemyType();

    // Create and add enemy
    const enemy = new Enemy(this.scene, x, y, enemyType);
    this.enemies.push(enemy);
  }

  /**
   * Select enemy type based on game time and difficulty
   * @returns EnemyType to spawn
   */
  private selectEnemyType(): EnemyType {
    // Increase elite spawn chance as game progresses (capped at 30%)
    const eliteChance = Math.min(0.3, this.scene.getPlayTime() / 300000);

    // Filter enemies by rank for balanced spawning
    const minions = this.availableEnemies.filter(
      (type) => ENEMIES_DATA[type].rank === "minion",
    );
    const elites = this.availableEnemies.filter(
      (type) => ENEMIES_DATA[type].rank === "elite",
    );

    // Decide whether to spawn elite or minion
    const spawnElite = elites.length > 0 && Math.random() < eliteChance;

    // Select appropriate enemy pool based on decision
    const pool = spawnElite
      ? elites
      : minions.length > 0
        ? minions
        : this.availableEnemies;

    // Randomly select from the determined pool
    return pool[Math.floor(Math.random() * pool.length)];
  }

  /**
   * Get all active (non-dead) enemies
   * @returns Array of active enemies
   */
  public getEnemies(): Enemy[] {
    return this.enemies.filter((enemy) => !enemy.isDead);
  }

  /**
   * Clear all enemies from the spawner
   */
  public clear(): void {
    // Destroy all enemy sprites
    this.enemies.forEach((enemy) => enemy.destroy());
    // Clear the enemy array
    this.enemies = [];
  }
}
