import Phaser from "phaser";
import { Player } from "./player";
import { Enemy } from "./enemy";
import { scaleManager } from "./ScaleManager";
import type { WeaponType } from "../types";
import i18n from "../i18n";
import {
  MAX_SELECT_SIZE,
  WEAPONS,
  COLLECT_RANGE_BONUS,
  RARITY_SIZE,
} from "../constant";
import type { GameScene } from "./GameScene";

/**
 * Configuration interface for weapon creation
 */
export interface WeaponConfig {
  type: WeaponType;
}

/**
 * Extended projectile sprite with additional weapon-related properties
 */
export interface ProjectileSprite extends Phaser.Physics.Arcade.Sprite {
  damage?: number;
  piercing?: number;
  weaponRef?: Weapon;
}

/**
 * Data structure for orb-type weapon projectiles
 */
export interface OrbData {
  sprite: ProjectileSprite;
  offset: number;
}

// TODO: fix weapon fire logic

/**
 * Abstract base class for all weapons in the game
 * Provides common functionality and defines the interface for weapon implementations
 */
export abstract class Weapon {
  protected scene: GameScene;
  protected player: Player;
  public level: number;
  public maxLevel: number;
  public damage: number;
  public coolDown: number;
  protected lastFired: number;
  public type: WeaponType;
  public orbs: OrbData[] = [];
  public projectiles: Phaser.Physics.Arcade.Group;

  /**
   * Create a new weapon
   * @param scene Game scene reference
   * @param player Player reference
   * @param config Weapon configuration
   */
  constructor(scene: GameScene, player: Player, config: WeaponConfig) {
    // Validate that the weapon texture exists
    if (!scene.textures.exists(config.type)) {
      console.error(
        `Weapon texture '${config.type}' not found. Please ensure the SVG file is preloaded correctly.`,
      );
    }

    const weaponData = WEAPONS[config.type];
    this.scene = scene;
    this.player = player;
    this.level = 1;
    this.maxLevel = 5;
    this.damage = weaponData.baseDamage;
    this.coolDown = weaponData.attackSpeed;
    this.lastFired = 0;
    this.type = config.type;
    this.projectiles = scene.physics.add.group();
  }

  /**
   * Update weapon logic and handle firing
   * @param time Current game time
   * @param enemies Array of active enemies
   */
  public update(time: number, enemies: Enemy[]): void {
    if (time - this.lastFired >= this.coolDown) {
      this.scene.playPlayerFireSound();
      this.fire(enemies);
      this.lastFired = time;
    }
  }

  /**
   * Fire the weapon - must be implemented by subclasses
   * @param enemies Array of enemies to potentially target
   */
  protected abstract fire(enemies: Enemy[]): void;

  /**
   * Upgrade the weapon if not at max level
   */
  public upgrade(): void {
    if (this.level < this.maxLevel) {
      this.level++;
      this.applyUpgrade();
    }
  }

  /**
   * Apply weapon-specific upgrades - must be implemented by subclasses
   */
  protected abstract applyUpgrade(): void;

  /**
   * Get the closest enemy to the player
   * @param enemies Array of enemies to search
   * @returns The closest enemy or undefined if none found
   */
  protected getClosestEnemy(enemies: Enemy[]): Enemy | undefined {
    if (enemies.length === 0) return undefined;

    const playerPos = this.scene.getPlayerPosition();

    let closestEnemy: Enemy | undefined;
    let minDist = Infinity;

    // Loop through all enemies to find the closest one
    enemies.forEach((enemy) => {
      if (enemy.isDead) return;

      const dist = Phaser.Math.Distance.Between(
        playerPos.x,
        playerPos.y,
        enemy.sprite.x,
        enemy.sprite.y,
      );

      if (dist < minDist) {
        minDist = dist;
        closestEnemy = enemy;
      }
    });

    return closestEnemy;
  }

  /**
   * Get all enemies within a specified range of the player
   * @param enemies Array of enemies to filter
   * @param range Maximum distance from player
   * @returns Array of enemies within range
   */
  protected getEnemiesInRange(enemies: Enemy[], range: number): Enemy[] {
    if (enemies.length === 0) return [];

    const playerPos = this.scene.getPlayerPosition();

    return enemies.filter((enemy) => {
      if (enemy.isDead) return false;

      const distance = Phaser.Math.Distance.Between(
        playerPos.x,
        playerPos.y,
        enemy.sprite.x,
        enemy.sprite.y,
      );

      return distance <= range;
    });
  }

  /**
   * Get the player's movement angle based on velocity
   * Returns 0 if player is not moving
   * @returns Angle in radians
   */
  protected getPlayerAngle(): number {
    const velocity = this.player.sprite.body?.velocity;
    return velocity && (velocity.x !== 0 || velocity.y !== 0)
      ? Math.atan2(velocity.y, velocity.x)
      : 0;
  }

  /**
   * Create a projectile with consistent settings
   */
  protected createProjectile(): ProjectileSprite {
    const playerPos = this.scene.getPlayerPosition();

    const weaponData = WEAPONS[this.type];

    const size = RARITY_SIZE[weaponData.rarity];

    // Create projectile with the specified texture
    const projectileSize = scaleManager.scaleValue(size);
    const projectile = this.projectiles.create(
      playerPos.x,
      playerPos.y,
      this.type,
    ) as ProjectileSprite;

    projectile.setCircle(projectileSize / 2);
    projectile.setDisplaySize(projectileSize, projectileSize);
    projectile.damage = this.damage;
    projectile.weaponRef = this;

    return projectile;
  }
}

/**
 * Golden Staff weapon class
 * Fires auto-targeting magic missiles at the closest enemy
 */
export class GoldenStaff extends Weapon {
  private projectileSpeed: number;
  private piercing: number;

  /**
   * Create a new Golden Staff weapon
   * @param scene Game scene reference
   * @param player Player reference
   */
  constructor(scene: GameScene, player: Player) {
    super(scene, player, {
      type: "golden_staff",
    });
    this.projectileSpeed = 300; // Base projectile speed
    this.piercing = 1; // Base piercing value (number of enemies it can hit)
  }

  /**
   * Fire magic missile at the closest enemy
   * @param enemies Array of active enemies
   */
  protected fire(enemies: Enemy[]): void {
    // Check if there are enemies to target
    if (enemies.length === 0) return;

    const playerPos = this.scene.getPlayerPosition();
    const nearestEnemy = this.getClosestEnemy(enemies);

    // Only fire if an enemy was found
    if (!nearestEnemy) return;

    // Create projectile using helper method
    const projectile = this.createProjectile();

    // Set piercing property
    projectile.piercing = this.piercing;

    // Calculate direction towards target enemy
    const targetEnemy: Enemy = nearestEnemy;
    const dx = targetEnemy.sprite.x - playerPos.x;
    const dy = targetEnemy.sprite.y - playerPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Set projectile velocity towards enemy
    projectile.setVelocity(
      (dx / distance) * this.projectileSpeed,
      (dy / distance) * this.projectileSpeed,
    );

    // Set projectile rotation based on direction
    projectile.setRotation(Math.atan2(dy, dx));

    // Set lifetime for the projectile
    this.scene.time.delayedCall(2000, () => {
      if (projectile.active) {
        projectile.destroy();
      }
    });
  }

  /**
   * Apply upgrades when weapon levels up
   */
  protected applyUpgrade(): void {
    // Increase damage with each level
    this.damage += 5;

    // Decrease cool down with each level (capped at 300ms)
    this.coolDown = Math.max(300, this.coolDown - 100);

    // Increase piercing at specific levels
    if (this.level >= 3) {
      this.piercing = 2; // Can pierce through 2 enemies at level 3
    }
    if (this.level >= 5) {
      this.piercing = 3; // Can pierce through 3 enemies at max level
    }
  }
}

/**
 * Fireproof Cloak weapon class
 * Creates rotating fire orbs around the player that deal damage to nearby enemies
 */
export class FireproofCloak extends Weapon {
  private orbCount: number;
  private radius: number;
  private rotationSpeed: number;
  private angle: number;

  /**
   * Create a new Fireproof Cloak weapon
   * @param scene Game scene reference
   * @param player Player reference
   */
  constructor(scene: GameScene, player: Player) {
    super(scene, player, {
      type: "fireproof_cloak",
    });
    this.orbCount = 1; // Start with 1 orb
    this.radius = scaleManager.scaleValue(80); // Initial rotation radius
    this.rotationSpeed = 2; // Initial rotation speed
    this.angle = 0; // Current rotation angle

    // Initialize orbs on creation
    this.createOrbs();
  }

  /**
   * Create orbs for the fireproof cloak
   * Destroys existing orbs and creates new ones based on current orbCount
   */
  private createOrbs(): void {
    // Clear old orbs to prevent memory leaks
    this.orbs.forEach((orb) => orb.sprite.destroy());
    this.orbs = [];

    // Create new orbs with responsive scaling
    const orbSize = scaleManager.scaleValue(32);
    for (let i = 0; i < this.orbCount; i++) {
      // Create orb sprite
      const orb = this.scene.physics.add.sprite(
        0,
        0,
        this.type,
      ) as ProjectileSprite;

      // Set physics and appearance
      orb.setCircle(orbSize / 2);
      orb.setDisplaySize(orbSize, orbSize);

      // Set damage properties
      orb.damage = this.damage;
      orb.weaponRef = this;

      // Calculate angular offset for evenly spaced orbs
      const offset = ((Math.PI * 2) / this.orbCount) * i;

      // Add to orb collection
      this.orbs.push({
        sprite: orb,
        offset: offset,
      });
    }
  }

  /**
   * Update orb positions and rotation
   * @param time Current game time
   * @param _enemies Array of active enemies (not used)
   */
  public update(_time: number, _enemies: Enemy[]): void {
    console.log(_time, _enemies);
    // Update rotation angle (deltaTime approximation)
    this.angle += this.rotationSpeed * 0.016; // Assuming 60fps

    // Get current player position
    const playerPos = this.scene.getPlayerPosition();

    // Update each orb's position around the player
    this.orbs.forEach((orb) => {
      const adjustedAngle = this.angle + orb.offset;
      orb.sprite.x = playerPos.x + Math.cos(adjustedAngle) * this.radius;
      orb.sprite.y = playerPos.y + Math.sin(adjustedAngle) * this.radius;
    });
  }

  /**
   * Fire method implementation (not used for persistent aura weapons)
   * @param _enemies Array of enemies (not used)
   */
  protected fire(_enemies: Enemy[]): void {
    console.log(_enemies);
    // Fireproof Cloak doesn't need a traditional fire method as it persists continuously
  }

  /**
   * Apply upgrades when weapon levels up
   */
  protected applyUpgrade(): void {
    // Increase damage with each level
    this.damage += 5;

    // Update orbs with new damage value
    this.orbs.forEach((orb) => {
      orb.sprite.damage = this.damage;
    });

    // Level-based upgrades
    if (this.level === 2) {
      // Add second orb at level 2
      this.orbCount = 2;
      this.createOrbs();
    } else if (this.level === 3) {
      // Increase radius at level 3
      this.radius = scaleManager.scaleValue(100);
    } else if (this.level === 4) {
      // Add third orb at level 4
      this.orbCount = 3;
      this.createOrbs();
    } else if (this.level === 5) {
      // Increase rotation speed at max level
      this.rotationSpeed = 3;
    }
  }
}

/**
 * Ruyi Staff weapon class
 * Ultimate form of Golden Staff with enhanced power
 * Creates high damage projectiles with piercing capability
 */
export class RuyiStaff extends Weapon {
  private projectileSpeed: number;
  private piercing: number;
  private projectileCount: number;

  /**
   * Create a new Ruyi Staff weapon
   * @param scene Game scene reference
   * @param player Player reference
   */
  constructor(scene: GameScene, player: Player) {
    super(scene, player, {
      type: "ruyi_staff",
    });

    // Initialize weapon properties
    this.projectileSpeed = scaleManager.scaleValue(400); // Responsive projectile speed
    this.piercing = 3; // Can pierce through 3 enemies initially
    this.projectileCount = 1; // Start with 1 projectile per shot
  }

  /**
   * Fire projectiles at the nearest enemies
   * @param enemies Array of active enemies
   */
  protected fire(enemies: Enemy[]): void {
    if (enemies.length === 0) return;

    const playerPos = this.scene.getPlayerPosition();

    // Fire multiple projectiles based on projectileCount
    for (let i = 0; i < this.projectileCount; i++) {
      // Find the nearest enemy using the base class helper method
      const nearestEnemy = this.getClosestEnemy(enemies);
      if (!nearestEnemy) continue;

      // Calculate angle to target enemy
      const angle = Math.atan2(
        nearestEnemy.sprite.y - playerPos.y,
        nearestEnemy.sprite.x - playerPos.x,
      );

      // Use the createProjectile utility method from Weapon base class
      const projectile = this.createProjectile();
      projectile.damage = this.damage;
      projectile.piercing = this.piercing;
      projectile.rotation = angle;
      projectile.setVelocity(
        Math.cos(angle) * this.projectileSpeed,
        Math.sin(angle) * this.projectileSpeed,
      );

      // Set lifetime
      this.scene.time.delayedCall(3000, () => {
        if (projectile.active) projectile.destroy();
      });

      // Track projectile in the weapon's projectile group
      this.projectiles?.add(projectile);
    }
  }

  /**
   * Apply upgrades when weapon levels up
   * Enhances damage, reduces cool down, increases projectile count, and improves piercing
   */
  protected applyUpgrade(): void {
    // Increase damage with each level
    this.damage += 10;

    // Reduce cool down with a minimum of 500ms
    this.coolDown = Math.max(500, this.coolDown - 50);

    // Add second projectile at level 3
    if (this.level >= 3) this.projectileCount = 2;

    // Further increase piercing capability at max level
    if (this.level >= 5) this.piercing = 5;
  }
}

/**
 * Fire Lance weapon class
 * Fast piercing spear that travels quickly and can pierce through multiple enemies
 * at higher levels
 */
export class FireLance extends Weapon {
  private projectileSpeed: number;
  private piercing: number;

  /**
   * Create a new Fire Lance weapon
   * @param scene Game scene reference
   * @param player Player reference
   */
  constructor(scene: GameScene, player: Player) {
    super(scene, player, {
      type: "fire_lance",
    });

    // Initialize weapon properties
    this.projectileSpeed = scaleManager.scaleValue(500); // Responsive projectile speed
    this.piercing = 2; // Can pierce through 2 enemies initially
  }

  /**
   * Fire a fast projectile at the closest enemy
   * @param enemies Array of active enemies
   */
  protected fire(enemies: Enemy[]): void {
    if (enemies.length === 0) return;

    const playerPos = this.scene.getPlayerPosition();

    // Find closest enemy using base class helper method
    const nearestEnemy = this.getClosestEnemy(enemies);
    if (!nearestEnemy) return;

    // Calculate angle to target enemy
    const angle = Phaser.Math.Angle.Between(
      playerPos.x,
      playerPos.y,
      nearestEnemy.sprite.x,
      nearestEnemy.sprite.y,
    );

    // Use createProjectile utility method from Weapon base class
    const projectile = this.createProjectile();
    projectile.damage = this.damage;
    projectile.piercing = this.piercing;
    projectile.rotation = angle;
    projectile.setVelocity(
      Math.cos(angle) * this.projectileSpeed,
      Math.sin(angle) * this.projectileSpeed,
    );

    // Set lifetime
    this.scene.time.delayedCall(2500, () => {
      if (projectile.active) projectile.destroy();
    });

    // Track projectile in the weapon's projectile group
    this.projectiles?.add(projectile);
  }

  /**
   * Apply upgrades when weapon levels up
   * Enhances damage, piercing, speed, and reduces cool down
   */
  protected applyUpgrade(): void {
    // Increase damage with each level
    this.damage += 6;

    // Reduce cool down with a minimum of 600ms
    this.coolDown = Math.max(600, this.coolDown - 150);

    // Increase piercing capability at level 3
    if (this.level >= 3) this.piercing = 3;

    // Increase speed at max level
    if (this.level >= 5) this.projectileSpeed = scaleManager.scaleValue(600);
  }
}

// Wind Tamer - Area damage pearl
export class WindTamer extends Weapon {
  private orbCount: number;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  private radius: number;
  private damageRadius: number;

  constructor(scene: GameScene, player: Player) {
    super(scene, player, {
      type: "wind_tamer",
    });
    this.orbCount = 1;
    this.radius = scaleManager.scaleValue(60);
    this.damageRadius = 100;
    this.createOrbs();
  }

  private createOrbs(): void {
    this.orbs.forEach((orb) => orb.sprite.destroy());
    this.orbs = [];

    const orbSize = scaleManager.scaleValue(28);
    for (let i = 0; i < this.orbCount; i++) {
      const orb = this.scene.physics.add.sprite(
        0,
        0,
        this.type,
      ) as ProjectileSprite;
      orb.setCircle(orbSize / 2);
      orb.setDisplaySize(orbSize, orbSize);
      orb.damage = this.damage;
      orb.weaponRef = this;

      this.orbs.push({
        sprite: orb,
        offset: ((Math.PI * 2) / this.orbCount) * i,
      });
    }
  }

  public update(_time: number, _enemies: Enemy[]): void {
    console.log(_time, _enemies);
    const playerPos = this.scene.getPlayerPosition();
    this.orbs.forEach((orb) => {
      orb.sprite.x = playerPos.x;
      orb.sprite.y = playerPos.y;
    });
  }

  protected fire(enemies: Enemy[]): void {
    // Wind effect damages all enemies in radius
    const playerPos = this.scene.getPlayerPosition();
    enemies.forEach((enemy) => {
      if (enemy.isDead) return;
      const distance = Phaser.Math.Distance.Between(
        playerPos.x,
        playerPos.y,
        enemy.sprite.x,
        enemy.sprite.y,
      );
      if (distance < this.damageRadius) {
        enemy.takeDamage(this.damage);
      }
    });
  }

  protected applyUpgrade(): void {
    this.damage += 8;
    if (this.level >= 2) this.damageRadius = 120;
    if (this.level >= 3) this.coolDown = 1500;
    if (this.level >= 4) this.damageRadius = 150;
    if (this.level >= 5) this.orbCount = 2;
  }
}

// Violet Bell - Sound wave weapon
export class VioletBell extends Weapon {
  private waveCount: number;

  constructor(scene: GameScene, player: Player) {
    super(scene, player, {
      type: "violet_bell",
    });
    this.waveCount = 3;
  }

  protected fire(enemies: Enemy[]): void {
    const playerPos = this.scene.getPlayerPosition();
    const angles = [];

    for (let i = 0; i < this.waveCount; i++) {
      angles.push((Math.PI * 2 * i) / this.waveCount);
    }

    angles.forEach(() => {
      const wave = this.scene.add.circle(
        playerPos.x,
        playerPos.y,
        20,
        0x9370db,
        0.3,
      );

      this.scene.tweens.add({
        targets: wave,
        radius: 150,
        alpha: 0,
        duration: 1000,
        ease: "Power2",
        onUpdate: () => {
          enemies.forEach((enemy) => {
            if (enemy.isDead) return;
            const dist = Phaser.Math.Distance.Between(
              wave.x,
              wave.y,
              enemy.sprite.x,
              enemy.sprite.y,
            );
            if (dist <= wave.radius && dist >= wave.radius - 20) {
              enemy.takeDamage(this.damage);
            }
          });
        },
        onComplete: () => wave.destroy(),
      });
    });
  }

  protected applyUpgrade(): void {
    this.damage += 8;
    if (this.level >= 2) this.waveCount = 4;
    if (this.level >= 3) this.coolDown = 1200;
    if (this.level >= 4) this.waveCount = 5;
    if (this.level >= 5) this.coolDown = 1000;
  }
}

// Twin Blades - Fast dual strike
export class TwinBlades extends Weapon {
  private projectileSpeed: number;

  constructor(scene: GameScene, player: Player) {
    super(scene, player, {
      type: "twin_blades",
    });
    this.projectileSpeed = 450;
  }

  protected fire(enemies: Enemy[]): void {
    if (enemies.length === 0) return;

    const playerPos = this.scene.getPlayerPosition();
    const targets = enemies.filter((e) => !e.isDead).slice(0, 2);

    targets.forEach((target, index) => {
      const projectileSize = scaleManager.scaleValue(24);
      const projectile = this.projectiles?.create(
        playerPos.x + (index === 0 ? -10 : 10),
        playerPos.y,
        this.type,
      );
      projectile.setCircle(projectileSize / 2);
      projectile.setDisplaySize(projectileSize, projectileSize);

      const angle = Phaser.Math.Angle.Between(
        playerPos.x,
        playerPos.y,
        target.sprite.x,
        target.sprite.y,
      );

      projectile.setVelocity(
        Math.cos(angle) * this.projectileSpeed,
        Math.sin(angle) * this.projectileSpeed,
      );
      projectile.setRotation(angle);

      projectile.damage = this.damage;
      projectile.piercing = 1;
      projectile.weaponRef = this;

      this.scene.time.delayedCall(1500, () => {
        if (projectile.active) projectile.destroy();
      });
    });
  }

  protected applyUpgrade(): void {
    this.damage += 5;
    this.coolDown = Math.max(400, this.coolDown - 100);
    if (this.level >= 5) this.projectileSpeed += 150;
  }
}

// Mace - Heavy damage weapon
export class Mace extends Weapon {
  private projectileSpeed: number;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  private stunChance: number;

  constructor(scene: GameScene, player: Player) {
    super(scene, player, {
      type: "mace",
    });
    this.projectileSpeed = 250;
    this.stunChance = 0.3;
  }

  protected fire(enemies: Enemy[]): void {
    if (enemies.length === 0) return;

    const playerPos = this.scene.getPlayerPosition();
    const nearestEnemy = this.getClosestEnemy(enemies);

    if (!nearestEnemy) return;

    const projectileSize = scaleManager.scaleValue(32);
    const projectile = this.projectiles?.create(
      playerPos.x,
      playerPos.y,
      this.type,
    );
    projectile.setCircle(projectileSize / 2);
    projectile.setDisplaySize(projectileSize, projectileSize);

    const targetEnemy: Enemy = nearestEnemy;
    const angle = Phaser.Math.Angle.Between(
      playerPos.x,
      playerPos.y,
      targetEnemy.sprite.x,
      targetEnemy.sprite.y,
    );

    projectile.setVelocity(
      Math.cos(angle) * this.projectileSpeed,
      Math.sin(angle) * this.projectileSpeed,
    );

    projectile.damage = this.damage;
    projectile.piercing = 1;
    projectile.weaponRef = this;

    this.scene.time.delayedCall(2000, () => {
      if (projectile.active) projectile.destroy();
    });
  }

  protected applyUpgrade(): void {
    this.damage += 10;
    if (this.level >= 2) this.stunChance = 0.4;
    if (this.level >= 3) this.coolDown = 1500;
    if (this.level >= 4) this.stunChance = 0.5;
    if (this.level >= 5) this.damage += 15;
  }
}

// Bull Horns - Charge attack
export class BullHorns extends Weapon {
  private chargeRadius: number;

  constructor(scene: GameScene, player: Player) {
    super(scene, player, {
      type: "bull_horns",
    });
    this.chargeRadius = 150;
  }

  protected fire(enemies: Enemy[]): void {
    const playerPos = this.scene.getPlayerPosition();

    // Create charge effect
    const circle = this.scene.add.circle(
      playerPos.x,
      playerPos.y,
      this.chargeRadius,
      0x8b0000,
      0.3,
    );

    enemies.forEach((enemy) => {
      if (enemy.isDead) return;
      const distance = Phaser.Math.Distance.Between(
        playerPos.x,
        playerPos.y,
        enemy.sprite.x,
        enemy.sprite.y,
      );
      if (distance < this.chargeRadius) {
        enemy.takeDamage(this.damage);
        const angle = Phaser.Math.Angle.Between(
          playerPos.x,
          playerPos.y,
          enemy.sprite.x,
          enemy.sprite.y,
        );
        if (enemy.sprite.body && "setVelocity" in enemy.sprite.body) {
          enemy.sprite.body?.setVelocity(
            Math.cos(angle) * 300,
            Math.sin(angle) * 300,
          );
        }
      }
    });

    this.scene.tweens.add({
      targets: circle,
      alpha: 0,
      duration: 500,
      onComplete: () => circle.destroy(),
    });
  }

  protected applyUpgrade(): void {
    this.damage += 12;
    if (this.level >= 2) this.chargeRadius = 180;
    if (this.level >= 3) this.coolDown = 2000;
    if (this.level >= 4) this.chargeRadius = 200;
    if (this.level >= 5) this.damage += 20;
  }
}

// Thunder Drum - Lightning strikes
export class ThunderDrum extends Weapon {
  private strikeCount: number;

  constructor(scene: GameScene, player: Player) {
    super(scene, player, {
      type: "thunder_drum",
    });
    this.strikeCount = 3;
  }

  protected fire(enemies: Enemy[]): void {
    if (enemies.length === 0) return;

    const targets = enemies
      .filter((e) => !e.isDead)
      .sort(() => Math.random() - 0.5)
      .slice(0, this.strikeCount);

    targets.forEach((target) => {
      // Lightning strike effect
      const lightning = this.scene.add.rectangle(
        target.sprite.x,
        target.sprite.y - scaleManager.UIScaleValue(100),
        scaleManager.UIScaleValue(10),
        scaleManager.UIScaleValue(100),
        0xffd700,
        0.8,
      );

      this.scene.tweens.add({
        targets: lightning,
        alpha: 0,
        duration: 300,
        onComplete: () => {
          lightning.destroy();
          target.takeDamage(this.damage);
        },
      });
    });
  }

  protected applyUpgrade(): void {
    this.damage += 6;
    if (this.level >= 2) this.strikeCount = 4;
    if (this.level >= 3) this.coolDown = 1300;
    if (this.level >= 4) this.strikeCount = 5;
    if (this.level >= 5) this.damage += 10;
  }
}

// Ice Needle - Slowing projectiles
export class IceNeedle extends Weapon {
  private projectileSpeed: number;
  private projectileCount: number;

  constructor(scene: GameScene, player: Player) {
    super(scene, player, {
      type: "ice_needle",
    });
    this.projectileSpeed = 550;
    this.projectileCount = 3;
  }

  protected fire(enemies: Enemy[]): void {
    if (enemies.length === 0) return;

    const playerPos = this.scene.getPlayerPosition();
    const angleStep = (Math.PI * 2) / this.projectileCount;

    for (let i = 0; i < this.projectileCount; i++) {
      const angle = angleStep * i;
      const projectileSize = scaleManager.scaleValue(20);
      const projectile = this.projectiles?.create(
        playerPos.x,
        playerPos.y,
        this.type,
      );
      projectile.setCircle(projectileSize / 2);
      projectile.setDisplaySize(projectileSize, projectileSize);

      projectile.setVelocity(
        Math.cos(angle) * this.projectileSpeed,
        Math.sin(angle) * this.projectileSpeed,
      );
      projectile.setRotation(angle);

      projectile.damage = this.damage;
      projectile.piercing = 1;
      projectile.weaponRef = this;

      this.scene.time.delayedCall(2000, () => {
        if (projectile.active) projectile.destroy();
      });
    }
  }

  protected applyUpgrade(): void {
    this.damage += 5;
    if (this.level >= 2) this.projectileCount = 4;
    if (this.level >= 3) this.coolDown = 700;
    if (this.level >= 4) this.projectileCount = 5;
    if (this.level >= 5) this.projectileSpeed += 100;
  }
}

// Wind Fire Wheels - Dual spinning wheels
export class WindFireWheels extends Weapon {
  private orbCount: number;
  private radius: number;
  private rotationSpeed: number;
  private angle: number;

  constructor(scene: GameScene, player: Player) {
    super(scene, player, {
      type: "wind_fire_wheels",
    });
    this.orbCount = 2;
    this.radius = scaleManager.scaleValue(70);
    this.rotationSpeed = 4;
    this.angle = 0;
    this.createOrbs();
  }

  private createOrbs(): void {
    this.orbs.forEach((orb) => orb.sprite.destroy());
    this.orbs = [];

    const orbSize = scaleManager.scaleValue(32);
    for (let i = 0; i < this.orbCount; i++) {
      const orb = this.scene.physics.add.sprite(
        0,
        0,
        this.type,
      ) as ProjectileSprite;
      orb.setCircle(orbSize / 2);
      orb.setDisplaySize(orbSize, orbSize);
      orb.damage = this.damage;
      orb.weaponRef = this;

      this.orbs.push({
        sprite: orb,
        offset: ((Math.PI * 2) / this.orbCount) * i,
      });
    }
  }

  public update(_time: number, _enemies: Enemy[]): void {
    console.log(_time, _enemies);
    this.angle += this.rotationSpeed * 0.016;
    const playerPos = this.scene.getPlayerPosition();

    this.orbs.forEach((orb) => {
      const angle = this.angle + orb.offset;
      orb.sprite.x = playerPos.x + Math.cos(angle) * this.radius;
      orb.sprite.y = playerPos.y + Math.sin(angle) * this.radius;
      orb.sprite.setRotation(angle);
    });
  }

  protected fire(_enemies: Enemy[]): void {
    console.log(_enemies);
    // Continuous damage from spinning wheels
  }

  protected applyUpgrade(): void {
    this.damage += 7;
    if (this.level >= 2) this.rotationSpeed = 5;
    if (this.level >= 3) this.radius = 90;
    if (this.level >= 4) this.rotationSpeed = 6;
    if (this.level >= 5) this.orbCount = 3;
  }
}

// Jade Purity Bottle - Suction and damage
export class JadePurityBottle extends Weapon {
  private pullRadius: number;
  private pullStrength: number;

  constructor(scene: GameScene, player: Player) {
    super(scene, player, {
      type: "jade_purity_bottle",
    });
    this.pullRadius = 200;
    this.pullStrength = 150;
  }

  protected fire(enemies: Enemy[]): void {
    const playerPos = this.scene.getPlayerPosition();

    // Create bottle effect
    const bottle = this.scene.add.circle(
      playerPos.x,
      playerPos.y,
      30,
      0x7fffd4,
      0.6,
    );

    enemies.forEach((enemy) => {
      if (enemy.isDead) return;
      const distance = Phaser.Math.Distance.Between(
        playerPos.x,
        playerPos.y,
        enemy.sprite.x,
        enemy.sprite.y,
      );

      if (distance < this.pullRadius) {
        // Pull enemies towards player
        const angle = Phaser.Math.Angle.Between(
          enemy.sprite.x,
          enemy.sprite.y,
          playerPos.x,
          playerPos.y,
        );
        if (enemy.sprite.body && "setVelocity" in enemy.sprite.body) {
          enemy.sprite.body?.setVelocity(
            Math.cos(angle) * this.pullStrength,
            Math.sin(angle) * this.pullStrength,
          );
        }

        if (distance < 80) {
          enemy.takeDamage(this.damage);
        }
      }
    });

    this.scene.tweens.add({
      targets: bottle,
      radius: 50,
      alpha: 0,
      duration: 1500,
      onComplete: () => bottle.destroy(),
    });
  }

  protected applyUpgrade(): void {
    this.damage += 10;
    if (this.level >= 2) this.pullRadius = 250;
    if (this.level >= 3) this.pullStrength = 200;
    if (this.level >= 4) this.coolDown = 1800;
    if (this.level >= 5) this.damage += 15;
  }
}

// Golden Rope - Binding weapon
export class GoldenRope extends Weapon {
  private bindDuration: number;
  private maxTargets: number;

  constructor(scene: GameScene, player: Player) {
    super(scene, player, {
      type: "golden_rope",
    });
    this.bindDuration = 2000;
    this.maxTargets = 2;
  }

  protected fire(enemies: Enemy[]): void {
    if (enemies.length === 0) return;

    const playerPos = this.scene.getPlayerPosition();
    const targets = enemies
      .filter((e) => !e.isDead)
      .sort(
        (a, b) =>
          Phaser.Math.Distance.Between(
            playerPos.x,
            playerPos.y,
            a.sprite.x,
            a.sprite.y,
          ) -
          Phaser.Math.Distance.Between(
            playerPos.x,
            playerPos.y,
            b.sprite.x,
            b.sprite.y,
          ),
      )
      .slice(0, this.maxTargets);

    targets.forEach((target) => {
      // Create projectile using the weapon's SVG texture
      const projectile = this.createProjectile();
      projectile.damage = this.damage;
      projectile.piercing = 0;

      // Move projectile instantly to target
      projectile.setPosition(target.sprite.x, target.sprite.y);

      // Create visual rope effect between player and target
      const rope = this.scene.add.line(
        0,
        0,
        playerPos.x,
        playerPos.y,
        target.sprite.x,
        target.sprite.y,
        0xffd700,
        0.8,
      );
      rope.setLineWidth(3);

      // Slow enemy
      let originalSpeed: number;
      if (target.sprite.body && "speed" in target.sprite.body) {
        originalSpeed = target.sprite.body.speed;
        target.sprite.body.speed = originalSpeed * 0.3;
      }

      target.takeDamage(this.damage);

      this.scene.time.delayedCall(this.bindDuration, () => {
        rope.destroy();
        projectile.destroy();
        if (
          !target.isDead &&
          target.sprite.body &&
          "speed" in target.sprite.body
        ) {
          target.sprite.body.speed = originalSpeed;
        }
      });
    });
  }

  protected applyUpgrade(): void {
    this.damage += 4;
    if (this.level >= 2) this.maxTargets = 3;
    if (this.level >= 3) this.bindDuration = 3000;
    if (this.level >= 4) this.maxTargets = 4;
    if (this.level >= 5) this.coolDown = 1000;
  }
}

// Plantain Fan - Wind blast
export class PlantainFan extends Weapon {
  private fanAngle: number;
  private fanRange: number;

  constructor(scene: GameScene, player: Player) {
    super(scene, player, {
      type: "plantain_fan",
    });
    this.fanAngle = Math.PI / 3;
    this.fanRange = 250;
  }

  protected fire(enemies: Enemy[]): void {
    const playerPos = this.scene.getPlayerPosition();

    // Find direction to nearest enemy
    let targetAngle = 0;

    const nearest = this.getClosestEnemy(enemies);
    if (nearest) {
      targetAngle = Phaser.Math.Angle.Between(
        playerPos.x,
        playerPos.y,
        nearest.sprite.x,
        nearest.sprite.y,
      );
    }

    // Create fan wind effect
    const graphics = this.scene.add.graphics();
    graphics.fillStyle(0x87ceeb, 0.4);
    graphics.slice(
      playerPos.x,
      playerPos.y,
      this.fanRange,
      targetAngle - this.fanAngle / 2,
      targetAngle + this.fanAngle / 2,
      false,
    );
    graphics.fillPath();

    enemies.forEach((enemy) => {
      if (enemy.isDead) return;

      const distance = Phaser.Math.Distance.Between(
        playerPos.x,
        playerPos.y,
        enemy.sprite.x,
        enemy.sprite.y,
      );
      const angle = Phaser.Math.Angle.Between(
        playerPos.x,
        playerPos.y,
        enemy.sprite.x,
        enemy.sprite.y,
      );

      const angleDiff = Math.abs(Phaser.Math.Angle.Wrap(angle - targetAngle));

      if (distance < this.fanRange && angleDiff < this.fanAngle / 2) {
        enemy.takeDamage(this.damage);
        if (enemy.sprite.body && "setVelocity" in enemy.sprite.body) {
          enemy.sprite.body.setVelocity(
            Math.cos(angle) * 400,
            Math.sin(angle) * 400,
          );
        }
      }
    });

    this.scene.tweens.add({
      targets: graphics,
      alpha: 0,
      duration: 800,
      onComplete: () => graphics.destroy(),
    });
  }

  protected applyUpgrade(): void {
    this.damage += 12;
    if (this.level >= 2) this.fanAngle = Math.PI / 2.5;
    if (this.level >= 3) this.fanRange = 300;
    if (this.level >= 4) this.coolDown = 2500;
    if (this.level >= 5) this.fanAngle = Math.PI / 2;
  }
}

// Three Pointed Blade - Erlang Shen weapon
export class ThreePointedBlade extends Weapon {
  private projectileSpeed: number;
  private slashCount: number;

  constructor(scene: GameScene, player: Player) {
    super(scene, player, {
      type: "three_pointed_blade",
    });
    this.projectileSpeed = 400;
    this.slashCount = 3;
  }

  protected fire(enemies: Enemy[]): void {
    if (enemies.length === 0) return;

    const playerPos = this.scene.getPlayerPosition();
    const projectileSize = scaleManager.scaleValue(32);

    // Three-pronged attack, 120 degree fan shape
    for (let i = 0; i < this.slashCount; i++) {
      const angleOffset = ((i - 1) * Math.PI) / 6; // -30°, 0°, 30°
      const baseAngle = this.getPlayerAngle();
      const targetAngle = baseAngle + angleOffset;

      const projectile = this.projectiles?.create(
        playerPos.x,
        playerPos.y,
        this.type,
      );
      projectile.setCircle(projectileSize / 2);
      projectile.setDisplaySize(projectileSize, projectileSize);
      projectile.setRotation(targetAngle);

      projectile.setVelocity(
        Math.cos(targetAngle) * this.projectileSpeed,
        Math.sin(targetAngle) * this.projectileSpeed,
      );

      projectile.damage = this.damage;
      projectile.weaponRef = this;

      this.scene.time.delayedCall(1500, () => {
        if (projectile.active) projectile.destroy();
      });
    }
  }

  protected applyUpgrade(): void {
    this.damage += 8;
    this.coolDown = Math.max(600, this.coolDown - 100);
    if (this.level >= 4) this.slashCount = 5;
  }
}

// Nine Ring Staff - Tang Monk/Sha Monk's weapon
export class NineRingStaff extends Weapon {
  private soundWaveRadius: number;
  private stunDuration: number;

  constructor(scene: GameScene, player: Player) {
    super(scene, player, {
      type: "nine_ring_staff",
    });
    this.soundWaveRadius = scaleManager.scaleValue(150);
    this.stunDuration = 1000;
  }

  protected fire(enemies: Enemy[]): void {
    const playerPos = this.scene.getPlayerPosition();

    // Create sound wave circle effect
    const graphics = this.scene.add.graphics();
    graphics.lineStyle(4, 0xffd700, 1);
    graphics.strokeCircle(0, 0, this.soundWaveRadius);
    graphics.setPosition(playerPos.x, playerPos.y);

    // Deal damage and brief stun to nearby enemies
    enemies.forEach((enemy) => {
      if (enemy.isDead) return;

      const distance = Phaser.Math.Distance.Between(
        playerPos.x,
        playerPos.y,
        enemy.sprite.x,
        enemy.sprite.y,
      );

      if (distance <= this.soundWaveRadius) {
        enemy.takeDamage(this.damage);
        // Stun effect: brief slowdown
        if (enemy.sprite.body && "setVelocity" in enemy.sprite.body) {
          const originalSpeed = enemy.speed;
          enemy.speed *= 0.3;
          this.scene.time.delayedCall(this.stunDuration, () => {
            enemy.speed = originalSpeed;
          });
        }
      }
    });

    // Sound wave spreading animation
    this.scene.tweens.add({
      targets: graphics,
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0,
      duration: 500,
      onComplete: () => graphics.destroy(),
    });
  }

  protected applyUpgrade(): void {
    this.damage += 7;
    this.soundWaveRadius += scaleManager.scaleValue(20);
    if (this.level >= 3) this.stunDuration = 1500;
    if (this.level >= 5) this.coolDown = 1200;
  }
}

// Crescent Blade - Sha Monk's crescent shovel
export class CrescentBlade extends Weapon {
  private bladeCount: number;
  private returnSpeed: number;

  constructor(scene: GameScene, player: Player) {
    super(scene, player, {
      type: "crescent_blade",
    });
    this.bladeCount = 2;
    this.returnSpeed = 350;
  }

  protected fire(enemies: Enemy[]): void {
    console.log(enemies);
    const playerPos = this.scene.getPlayerPosition();
    const projectileSize = scaleManager.scaleValue(28);
    const baseAngle = this.getPlayerAngle();

    // Launch multiple crescent blades with boomerang effect
    for (let i = 0; i < this.bladeCount; i++) {
      const angleOffset = ((i - 0.5) * Math.PI) / 4;
      const angle = baseAngle + angleOffset;

      const blade = this.projectiles?.create(
        playerPos.x,
        playerPos.y,
        this.type,
      ) as ProjectileSprite;
      blade.setCircle(projectileSize / 2);
      blade.setDisplaySize(projectileSize, projectileSize);

      const speed = this.returnSpeed;
      blade.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
      blade.damage = this.damage;
      blade.weaponRef = this;

      // Boomerang effect
      this.scene.time.delayedCall(800, () => {
        if (blade.active) {
          const dx = playerPos.x - blade.x;
          const dy = playerPos.y - blade.y;
          const returnAngle = Math.atan2(dy, dx);
          blade.setVelocity(
            Math.cos(returnAngle) * speed,
            Math.sin(returnAngle) * speed,
          );
        }
      });

      this.scene.time.delayedCall(1800, () => {
        if (blade.active) blade.destroy();
      });
    }
  }

  protected applyUpgrade(): void {
    this.damage += 7;
    this.returnSpeed += 30;
    if (this.level >= 3) this.bladeCount = 3;
    if (this.level >= 5) this.bladeCount = 4;
  }
}

// Iron Cudgel - Bull Demon King's weapon
export class IronCudgel extends Weapon {
  private smashRadius: number;
  private knockbackForce: number;

  constructor(scene: GameScene, player: Player) {
    super(scene, player, {
      type: "iron_cudgel",
    });
    this.smashRadius = scaleManager.scaleValue(120);
    this.knockbackForce = 500;
  }

  protected fire(enemies: Enemy[]): void {
    const playerPos = this.scene.getPlayerPosition();

    // Heavy strike on the ground, creating a huge shockwave
    const graphics = this.scene.add.graphics();
    graphics.fillStyle(0x8b4513, 0.6);
    graphics.fillCircle(0, 0, this.smashRadius);
    graphics.setPosition(playerPos.x, playerPos.y);

    enemies.forEach((enemy) => {
      if (enemy.isDead) return;

      const distance = Phaser.Math.Distance.Between(
        playerPos.x,
        playerPos.y,
        enemy.sprite.x,
        enemy.sprite.y,
      );

      if (distance <= this.smashRadius) {
        enemy.takeDamage(this.damage);

        // Powerful knockback
        if (enemy.sprite.body && "setVelocity" in enemy.sprite.body) {
          const angle = Phaser.Math.Angle.Between(
            playerPos.x,
            playerPos.y,
            enemy.sprite.x,
            enemy.sprite.y,
          );
          enemy.sprite.body.setVelocity(
            Math.cos(angle) * this.knockbackForce,
            Math.sin(angle) * this.knockbackForce,
          );
        }
      }
    });

    this.scene.tweens.add({
      targets: graphics,
      scaleX: 1.8,
      scaleY: 1.8,
      alpha: 0,
      duration: 600,
      onComplete: () => graphics.destroy(),
    });
  }

  protected applyUpgrade(): void {
    this.damage += 9;
    this.smashRadius += scaleManager.scaleValue(15);
    this.knockbackForce += 50;
    if (this.level >= 5) this.coolDown = 1700;
  }
}

// Seven Star Sword - Daoist weapon
export class SevenStarSword extends Weapon {
  private swordCount: number;
  private orbitRadius: number;
  private swords: ProjectileSprite[];

  constructor(scene: GameScene, player: Player) {
    super(scene, player, {
      type: "seven_star_sword",
    });
    this.swordCount = 3;
    this.orbitRadius = scaleManager.scaleValue(90);
    this.swords = [];
    this.createSwords();
  }

  private createSwords(): void {
    this.swords.forEach((sword) => sword.destroy());
    this.swords = [];

    const swordSize = scaleManager.scaleValue(24);
    for (let i = 0; i < this.swordCount; i++) {
      const sword = this.scene.physics.add.sprite(
        0,
        0,
        this.type,
      ) as ProjectileSprite;
      sword.setCircle(swordSize / 2);
      sword.setDisplaySize(swordSize, swordSize);
      sword.damage = this.damage;
      sword.weaponRef = this;
      this.swords.push(sword);
    }
  }

  public update(time: number, enemies: Enemy[]): void {
    console.log(enemies);
    const playerPos = this.scene.getPlayerPosition();
    const angleStep = (Math.PI * 2) / this.swordCount;
    const rotation = (time / 1000) * 3; // Rotation speed

    this.swords.forEach((sword, index) => {
      const angle = rotation + angleStep * index;
      sword.x = playerPos.x + Math.cos(angle) * this.orbitRadius;
      sword.y = playerPos.y + Math.sin(angle) * this.orbitRadius;
      sword.setRotation(angle + Math.PI / 2);
    });
  }

  protected fire(enemies: Enemy[]): void {
    // Continuous circling attack, no specific firing logic needed
    console.log(enemies);
  }

  protected applyUpgrade(): void {
    this.damage += 5;
    this.orbitRadius += scaleManager.scaleValue(10);
    if (this.level >= 3) {
      this.swordCount = 5;
      this.createSwords();
    }
    if (this.level >= 5) {
      this.swordCount = 7;
      this.createSwords();
    }
  }
}

// Ginseng Fruit - Special recovery type
export class GinsengFruit extends Weapon {
  private healAmount: number;
  private maxHealthBonus: number;

  constructor(scene: GameScene, player: Player) {
    super(scene, player, {
      type: "ginseng_fruit",
    });
    this.healAmount = 20;
    this.maxHealthBonus = 0;
  }

  protected fire(enemies: Enemy[]): void {
    // Heal player
    const currentHealth = this.player.health;
    const maxHealth = this.player.maxHealth;
    const newHealth = Math.min(currentHealth + this.healAmount, maxHealth);
    this.player.health = newHealth;

    // Create healing effect
    const playerPos = this.scene.getPlayerPosition();
    const graphics = this.scene.add.graphics();
    graphics.fillStyle(0x90ee90, 0.8);
    graphics.fillCircle(0, 0, scaleManager.scaleValue(40));
    graphics.setPosition(playerPos.x, playerPos.y);

    this.scene.tweens.add({
      targets: graphics,
      scaleX: 2,
      scaleY: 2,
      alpha: 0,
      duration: 1000,
      onComplete: () => graphics.destroy(),
    });

    // Deal minor damage to nearby enemies (immortal aura deterrence)
    enemies.forEach((enemy) => {
      if (enemy.isDead) return;

      const distance = Phaser.Math.Distance.Between(
        playerPos.x,
        playerPos.y,
        enemy.sprite.x,
        enemy.sprite.y,
      );

      if (distance <= scaleManager.scaleValue(100)) {
        enemy.takeDamage(this.damage);
      }
    });
  }

  protected applyUpgrade(): void {
    this.healAmount += 10;
    this.damage += 5;
    if (this.level >= 2) this.maxHealthBonus = 20;
    if (this.level >= 3) this.coolDown = 4000;
    if (this.level >= 4) this.maxHealthBonus = 40;
    if (this.level >= 5) this.healAmount = 100;

    // Increase maximum health
    if (this.maxHealthBonus > 0) {
      this.player.maxHealth = this.player.maxHealth + this.maxHealthBonus;
      this.maxHealthBonus = 0; // Only add once when upgrading
    }
  }
}

// Heaven Earth Circle - Nezha's weapon
export class HeavenEarthCircle extends Weapon {
  private circleSpeed: number;
  private returnDelay: number;

  constructor(scene: GameScene, player: Player) {
    super(scene, player, {
      type: "heaven_earth_circle",
    });
    this.circleSpeed = 450;
    this.returnDelay = 1000;
  }

  protected fire(enemies: Enemy[]): void {
    if (enemies.length === 0) return;

    const playerPos = this.scene.getPlayerPosition();
    const targetAngle = this.getPlayerAngle();
    const projectileSize = scaleManager.scaleValue(36);

    const circle = this.projectiles?.create(
      playerPos.x,
      playerPos.y,
      this.type,
    ) as ProjectileSprite;
    circle.setCircle(projectileSize / 2);
    circle.setDisplaySize(projectileSize, projectileSize);

    // Fly straight
    circle.setVelocity(
      Math.cos(targetAngle) * this.circleSpeed,
      Math.sin(targetAngle) * this.circleSpeed,
    );
    circle.damage = this.damage;
    circle.weaponRef = this;

    // Return logic
    this.scene.time.delayedCall(this.returnDelay, () => {
      if (circle.active) {
        const checkReturn = () => {
          if (!circle.active) return;

          const currentPlayerPos = this.scene.getPlayerPosition();
          const dx = currentPlayerPos.x - circle.x;
          const dy = currentPlayerPos.y - circle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 30) {
            circle.destroy();
            return;
          }

          const returnAngle = Math.atan2(dy, dx);
          circle.setVelocity(
            Math.cos(returnAngle) * this.circleSpeed * 1.2,
            Math.sin(returnAngle) * this.circleSpeed * 1.2,
          );

          this.scene.time.delayedCall(50, checkReturn);
        };
        checkReturn();
      }
    });

    this.scene.time.delayedCall(3000, () => {
      if (circle.active) circle.destroy();
    });
  }

  protected applyUpgrade(): void {
    this.damage += 8;
    this.circleSpeed += 50;
    if (this.level >= 5) this.returnDelay = 1500;
  }
}

// Red Armillary Sash - Nezha's weapon
export class RedArmillarySash extends Weapon {
  private sashLength: number;
  private whipCount: number;

  constructor(scene: GameScene, player: Player) {
    super(scene, player, {
      type: "red_armillary_sash",
    });
    this.sashLength = scaleManager.scaleValue(200);
    this.whipCount = 3;
  }

  protected fire(enemies: Enemy[]): void {
    const playerPos = this.scene.getPlayerPosition();
    const baseAngle = this.getPlayerAngle();

    // Whip attack, fan-shaped swing
    for (let i = 0; i < this.whipCount; i++) {
      const angle = baseAngle + ((i - 1) * Math.PI) / 8;
      const endX = playerPos.x + Math.cos(angle) * this.sashLength;
      const endY = playerPos.y + Math.sin(angle) * this.sashLength;

      // Create whip trajectory
      const graphics = this.scene.add.graphics();
      graphics.lineStyle(6, 0xff4444, 0.8);
      graphics.lineBetween(playerPos.x, playerPos.y, endX, endY);

      // Detect nearby enemies
      enemies.forEach((enemy) => {
        if (enemy.isDead) return;

        const distance = Phaser.Math.Distance.Between(
          playerPos.x,
          playerPos.y,
          enemy.sprite.x,
          enemy.sprite.y,
        );

        if (distance <= this.sashLength) {
          const enemyAngle = Phaser.Math.Angle.Between(
            playerPos.x,
            playerPos.y,
            enemy.sprite.x,
            enemy.sprite.y,
          );
          const angleDiff = Math.abs(
            Phaser.Math.Angle.Wrap(enemyAngle - angle),
          );

          if (angleDiff < Math.PI / 12) {
            enemy.takeDamage(this.damage);
            // Binding effect: slowdown
            if (enemy.sprite.body && "setVelocity" in enemy.sprite.body) {
              const originalSpeed = enemy.speed;
              enemy.speed *= 0.5;
              this.scene.time.delayedCall(800, () => {
                enemy.speed = originalSpeed;
              });
            }
          }
        }
      });

      this.scene.tweens.add({
        targets: graphics,
        alpha: 0,
        duration: 400,
        delay: i * 100,
        onComplete: () => graphics.destroy(),
      });
    }
  }

  protected applyUpgrade(): void {
    this.damage += 6;
    this.sashLength += scaleManager.scaleValue(25);
    if (this.level >= 3) this.whipCount = 4;
    if (this.level >= 5) this.whipCount = 5;
  }
}

// Purple Gold Gourd - Golden/Silver Horn's weapon
export class PurpleGoldGourd extends Weapon {
  private absorbRadius: number;
  private absorbDuration: number;
  private collectRangeBonus: number;

  constructor(scene: GameScene, player: Player) {
    super(scene, player, {
      type: "purple_gold_gourd",
    });
    this.absorbRadius = scaleManager.scaleValue(180);
    this.absorbDuration = 2000;
    this.collectRangeBonus = 0;
    this.applyCollectRangeBonus();
  }

  protected fire(enemies: Enemy[]): void {
    const playerPos = this.scene.getPlayerPosition();

    // Create absorption effect
    const graphics = this.scene.add.graphics();
    graphics.lineStyle(4, 0x9932cc, 1);
    graphics.strokeCircle(0, 0, this.absorbRadius);
    graphics.setPosition(playerPos.x, playerPos.y);

    const absorbedEnemies: Enemy[] = [];

    enemies.forEach((enemy) => {
      if (enemy.isDead) return;

      const distance = Phaser.Math.Distance.Between(
        playerPos.x,
        playerPos.y,
        enemy.sprite.x,
        enemy.sprite.y,
      );

      if (distance <= this.absorbRadius) {
        absorbedEnemies.push(enemy);
        // Attraction effect
        if (enemy.sprite.body && "setVelocity" in enemy.sprite.body) {
          const angle = Phaser.Math.Angle.Between(
            enemy.sprite.x,
            enemy.sprite.y,
            playerPos.x,
            playerPos.y,
          );
          enemy.sprite.body.setVelocity(
            Math.cos(angle) * 200,
            Math.sin(angle) * 200,
          );
        }
      }
    });

    // Delayed burst damage
    this.scene.time.delayedCall(this.absorbDuration, () => {
      absorbedEnemies.forEach((enemy) => {
        if (!enemy.isDead) {
          enemy.takeDamage(this.damage);
        }
      });
    });

    this.scene.tweens.add({
      targets: graphics,
      scaleX: 0.5,
      scaleY: 0.5,
      alpha: 0,
      duration: this.absorbDuration,
      onComplete: () => graphics.destroy(),
    });
  }

  protected applyUpgrade(): void {
    this.damage += 10;
    this.absorbRadius += scaleManager.scaleValue(20);
    if (this.level >= 3) this.absorbDuration = 1500;
    if (this.level >= 5) this.coolDown = 2800;

    // Increase collect range bonus with each level
    this.updateCollectRangeBonus();
  }

  private updateCollectRangeBonus(): void {
    // Remove old bonus
    this.player.collectRangeBonus -= this.collectRangeBonus;

    this.collectRangeBonus = COLLECT_RANGE_BONUS * this.level;

    // Apply new bonus
    this.applyCollectRangeBonus();
  }

  private applyCollectRangeBonus(): void {
    this.player.collectRangeBonus += this.collectRangeBonus;
  }
}

// Golden Rope Immortal - Immortality Binding Rope (Taishang Laojun)
export class GoldenRopeImmortal extends Weapon {
  private ropeChains: number;
  private chainLength: number;

  constructor(scene: GameScene, player: Player) {
    super(scene, player, {
      type: "golden_rope_immortal",
    });
    this.ropeChains = 3;
    this.chainLength = scaleManager.scaleValue(250);
  }

  protected fire(enemies: Enemy[]): void {
    if (enemies.length === 0) return;

    const playerPos = this.scene.getPlayerPosition();
    const sortedEnemies = enemies
      .filter((e) => !e.isDead)
      .sort((a, b) => {
        const distA = Phaser.Math.Distance.Between(
          playerPos.x,
          playerPos.y,
          a.sprite.x,
          a.sprite.y,
        );
        const distB = Phaser.Math.Distance.Between(
          playerPos.x,
          playerPos.y,
          b.sprite.x,
          b.sprite.y,
        );
        return distA - distB;
      })
      .slice(0, this.ropeChains);

    sortedEnemies.forEach((enemy) => {
      const distance = Phaser.Math.Distance.Between(
        playerPos.x,
        playerPos.y,
        enemy.sprite.x,
        enemy.sprite.y,
      );

      if (distance <= this.chainLength) {
        // Create projectile using the weapon's SVG texture
        const projectile = this.createProjectile();
        projectile.piercing = 0;

        // Move projectile instantly to target
        projectile.setPosition(enemy.sprite.x, enemy.sprite.y);
        projectile.setActive(false).setVisible(false);

        // Create visual rope effect between player and target
        const graphics = this.scene.add.graphics();
        graphics.lineStyle(3, 0xffd700, 0.9);
        graphics.lineBetween(
          playerPos.x,
          playerPos.y,
          enemy.sprite.x,
          enemy.sprite.y,
        );

        enemy.takeDamage(this.damage);

        // Powerful binding: Significantly slow down and deal continuous damage
        if (enemy.sprite.body && "setVelocity" in enemy.sprite.body) {
          const originalSpeed = enemy.speed;
          enemy.speed *= 0.2;

          const bindDuration = 1500;
          const tickDamage = this.damage * 0.2;
          const tickInterval = 300;

          const damageInterval = this.scene.time.addEvent({
            delay: tickInterval,
            repeat: Math.floor(bindDuration / tickInterval),
            callback: () => {
              if (!enemy.isDead) {
                enemy.takeDamage(tickDamage);
              }
            },
          });

          this.scene.time.delayedCall(bindDuration, () => {
            if (!enemy.isDead) {
              enemy.speed = originalSpeed;
            }
            damageInterval.remove();
            projectile.destroy(); // Destroy the projectile when the effect ends
          });
        } else {
          projectile.destroy(); // Destroy the projectile if no effect is applied
        }

        this.scene.tweens.add({
          targets: graphics,
          alpha: 0,
          duration: 1500,
          onComplete: () => graphics.destroy(),
        });
      }
    });
  }

  protected applyUpgrade(): void {
    this.damage += 6;
    this.chainLength += scaleManager.scaleValue(30);
    if (this.level >= 3) this.ropeChains = 4;
    if (this.level >= 5) this.ropeChains = 5;
  }
}

// Demon Revealing Mirror - Monster Revealing Mirror
export class DemonRevealingMirror extends Weapon {
  private revealRadius: number;
  private critBonus: number;

  constructor(scene: GameScene, player: Player) {
    super(scene, player, {
      type: "demon_revealing_mirror",
    });
    this.revealRadius = scaleManager.scaleValue(200);
    this.critBonus = 1.5; // Critical hit multiplier
  }

  protected fire(enemies: Enemy[]): void {
    const playerPos = this.scene.getPlayerPosition();

    // Create demon mirror aura
    const graphics = this.scene.add.graphics();
    graphics.lineStyle(3, 0xffffff, 1);
    graphics.strokeCircle(0, 0, this.revealRadius);
    graphics.setPosition(playerPos.x, playerPos.y);

    enemies.forEach((enemy) => {
      if (enemy.isDead) return;

      const distance = Phaser.Math.Distance.Between(
        playerPos.x,
        playerPos.y,
        enemy.sprite.x,
        enemy.sprite.y,
      );

      if (distance <= this.revealRadius) {
        // Critical hit damage
        const isCrit = Math.random() < 0.6; // 60% critical hit chance
        const finalDamage = isCrit ? this.damage * this.critBonus : this.damage;
        enemy.takeDamage(finalDamage);

        // Weakness marking effect
        const marker = this.scene.add.graphics();
        marker.lineStyle(2, 0xff0000, 1);
        marker.strokeCircle(0, 0, 20);
        marker.setPosition(enemy.sprite.x, enemy.sprite.y - 30);

        this.scene.tweens.add({
          targets: marker,
          alpha: 0,
          y: enemy.sprite.y - 50,
          duration: 1000,
          onComplete: () => marker.destroy(),
        });
      }
    });

    this.scene.tweens.add({
      targets: graphics,
      scaleX: 1.3,
      scaleY: 1.3,
      alpha: 0,
      duration: 800,
      onComplete: () => graphics.destroy(),
    });
  }

  protected applyUpgrade(): void {
    this.damage += 5;
    this.revealRadius += scaleManager.scaleValue(25);
    if (this.level >= 2) this.critBonus = 1.7;
    if (this.level >= 3) this.critBonus = 2.0;
    if (this.level >= 5) this.critBonus = 2.5;
  }
}

// Sea Calming Needle - Ocean Pacifying Needle (Golden Cudgel's ultimate form)
export class SeaCalmingNeedle extends Weapon {
  private sweepRange: number;
  private sweepAngle: number;

  constructor(scene: GameScene, player: Player) {
    super(scene, player, {
      type: "sea_calming_needle",
    });
    this.sweepRange = scaleManager.scaleValue(300);
    this.sweepAngle = Math.PI; // 180 degrees
  }

  protected fire(enemies: Enemy[]): void {
    const playerPos = this.scene.getPlayerPosition();
    const targetAngle = this.getPlayerAngle();

    // Create huge sweeping effect
    const graphics = this.scene.add.graphics();
    graphics.fillStyle(0xffd700, 0.5);
    graphics.slice(
      0,
      0,
      this.sweepRange,
      targetAngle - this.sweepAngle / 2,
      targetAngle + this.sweepAngle / 2,
      false,
    );
    graphics.fillPath();
    graphics.setPosition(playerPos.x, playerPos.y);

    enemies.forEach((enemy) => {
      if (enemy.isDead) return;

      const distance = Phaser.Math.Distance.Between(
        playerPos.x,
        playerPos.y,
        enemy.sprite.x,
        enemy.sprite.y,
      );
      const angle = Phaser.Math.Angle.Between(
        playerPos.x,
        playerPos.y,
        enemy.sprite.x,
        enemy.sprite.y,
      );

      const angleDiff = Math.abs(Phaser.Math.Angle.Wrap(angle - targetAngle));

      if (distance < this.sweepRange && angleDiff < this.sweepAngle / 2) {
        enemy.takeDamage(this.damage);

        // Giant force knockback
        if (enemy.sprite.body && "setVelocity" in enemy.sprite.body) {
          enemy.sprite.body.setVelocity(
            Math.cos(angle) * 600,
            Math.sin(angle) * 600,
          );
        }
      }
    });

    this.scene.tweens.add({
      targets: graphics,
      alpha: 0,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 600,
      onComplete: () => graphics.destroy(),
    });
  }

  protected applyUpgrade(): void {
    this.damage += 12;
    this.sweepRange += scaleManager.scaleValue(30);
    if (this.level >= 3) this.sweepAngle = Math.PI * 1.2;
    if (this.level >= 5) this.coolDown = 1500;
  }
}

// Eight Trigrams Furnace - Supreme Elder's weapon
export class EightTrigramsFurnace extends Weapon {
  private furnaceRadius: number;
  private burnDuration: number;
  private burnDamagePerTick: number;

  constructor(scene: GameScene, player: Player) {
    super(scene, player, {
      type: "eight_trigrams_furnace",
    });
    this.furnaceRadius = scaleManager.scaleValue(250);
    this.burnDuration = 5000; // 5 seconds burning duration
    this.burnDamagePerTick = 5;
  }

  protected fire(enemies: Enemy[]): void {
    const playerPos = this.scene.getPlayerPosition();

    // Create Eight Trigrams Furnace effect - eight fire pillars
    const furnaceGraphics = this.scene.add.graphics();
    furnaceGraphics.setPosition(playerPos.x, playerPos.y);

    // Draw flames in eight directions
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      const x = Math.cos(angle) * this.furnaceRadius;
      const y = Math.sin(angle) * this.furnaceRadius;

      furnaceGraphics.fillStyle(0xff6600, 0.7);
      furnaceGraphics.fillCircle(x, y, 30);
    }

    // Center flame
    furnaceGraphics.fillStyle(0xff0000, 0.5);
    furnaceGraphics.fillCircle(0, 0, this.furnaceRadius);

    enemies.forEach((enemy) => {
      if (enemy.isDead) return;

      const distance = Phaser.Math.Distance.Between(
        playerPos.x,
        playerPos.y,
        enemy.sprite.x,
        enemy.sprite.y,
      );

      if (distance < this.furnaceRadius) {
        enemy.takeDamage(this.damage);

        // Apply continuous burning effect
        const maxBurnTicks = Math.floor(this.burnDuration / 500);

        this.scene.time.addEvent({
          delay: 500,
          repeat: maxBurnTicks - 1,
          callback: () => {
            if (!enemy.isDead) {
              enemy.takeDamage(this.burnDamagePerTick);
            }
          },
        });
      }
    });

    this.scene.tweens.add({
      targets: furnaceGraphics,
      alpha: 0,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 1500,
      onComplete: () => furnaceGraphics.destroy(),
    });
  }

  protected applyUpgrade(): void {
    this.damage += 7;
    this.burnDamagePerTick += 2;
    if (this.level >= 3) this.furnaceRadius = scaleManager.scaleValue(300);
    if (this.level >= 5) this.burnDuration = 7000;
  }
}

// Dragon Staff - Guanyin's weapon
export class DragonStaff extends Weapon {
  private tornadoRadius: number;
  private pullStrength: number;

  constructor(scene: GameScene, player: Player) {
    super(scene, player, {
      type: "dragon_staff",
    });
    this.tornadoRadius = scaleManager.scaleValue(220);
    this.pullStrength = 150;
  }

  protected fire(enemies: Enemy[]): void {
    if (enemies.length === 0) return;

    const closestEnemy = this.getClosestEnemy(enemies);
    if (!closestEnemy) return;

    const targetX = closestEnemy.sprite.x;
    const targetY = closestEnemy.sprite.y;

    // Create tornado
    const tornado = this.scene.add.graphics();
    tornado.setPosition(targetX, targetY);

    // Draw tornado spiral
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4 + this.scene.time.now * 0.01;
      const radius = this.tornadoRadius * (1 - i / 10);
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      tornado.fillStyle(0x00ffff, 0.4 - i * 0.05);
      tornado.fillCircle(x, y, 25);
    }

    // Tornado effect - continuous damage and pulling
    const tornadoDuration = 3000;
    const damageInterval = 300;
    const damageTicks = tornadoDuration / damageInterval;

    this.scene.time.addEvent({
      delay: damageInterval,
      repeat: damageTicks - 1,
      callback: () => {
        enemies.forEach((enemy) => {
          if (enemy.isDead) return;

          const distance = Phaser.Math.Distance.Between(
            targetX,
            targetY,
            enemy.sprite.x,
            enemy.sprite.y,
          );

          if (distance < this.tornadoRadius) {
            enemy.takeDamage(this.damage / damageTicks);

            // Pull towards center
            const angle = Phaser.Math.Angle.Between(
              enemy.sprite.x,
              enemy.sprite.y,
              targetX,
              targetY,
            );
            if (enemy.sprite.body && "setVelocity" in enemy.sprite.body) {
              enemy.sprite.body.setVelocity(
                Math.cos(angle) * this.pullStrength,
                Math.sin(angle) * this.pullStrength,
              );
            }
          }
        });
      },
    });

    this.scene.tweens.add({
      targets: tornado,
      rotation: Math.PI * 6,
      alpha: 0,
      duration: tornadoDuration,
      onComplete: () => tornado.destroy(),
    });
  }

  protected applyUpgrade(): void {
    this.damage += 8;
    this.tornadoRadius += scaleManager.scaleValue(30);
    if (this.level >= 3) this.pullStrength = 200;
    if (this.level >= 5) this.coolDown = 1800;
  }
}

// Seven Treasure Tree - Zhunti's magical tree
export class SevenTreasureTree extends Weapon {
  private sweepRange: number;
  private purifyRadius: number;

  constructor(scene: GameScene, player: Player) {
    super(scene, player, {
      type: "seven_treasure_tree",
    });
    this.sweepRange = scaleManager.scaleValue(280);
    this.purifyRadius = scaleManager.scaleValue(350);
  }

  protected fire(enemies: Enemy[]): void {
    const playerPos = this.scene.getPlayerPosition();
    const targetAngle = this.getPlayerAngle();

    // Create Seven Treasure Tree refresh effect
    const treeGraphics = this.scene.add.graphics();
    treeGraphics.setPosition(playerPos.x, playerPos.y);

    // Draw seven-colored rays
    const colors = [
      0xff0000, 0xff7f00, 0xffff00, 0x00ff00, 0x0000ff, 0x4b0082, 0x9400d3,
    ];
    colors.forEach((color, index) => {
      const angle = targetAngle + (index - 3) * (Math.PI / 8);
      const endX = Math.cos(angle) * this.sweepRange;
      const endY = Math.sin(angle) * this.sweepRange;

      treeGraphics.lineStyle(8, color, 0.7);
      treeGraphics.lineBetween(0, 0, endX, endY);
    });

    // Center purification circle
    treeGraphics.lineStyle(3, 0xffffff, 0.8);
    treeGraphics.strokeCircle(0, 0, this.purifyRadius);

    enemies.forEach((enemy) => {
      if (enemy.isDead) return;

      const distance = Phaser.Math.Distance.Between(
        playerPos.x,
        playerPos.y,
        enemy.sprite.x,
        enemy.sprite.y,
      );

      // Enemies in range take damage
      if (distance < this.purifyRadius) {
        const damageMultiplier = distance < this.sweepRange ? 1.5 : 1.0;
        enemy.takeDamage(this.damage * damageMultiplier);

        // Purification effect - remove buffs (expandable in game)
        // Only damage and knockback here
        const angle = Phaser.Math.Angle.Between(
          playerPos.x,
          playerPos.y,
          enemy.sprite.x,
          enemy.sprite.y,
        );
        if (enemy.sprite.body && "setVelocity" in enemy.sprite.body) {
          enemy.sprite.body.setVelocity(
            Math.cos(angle) * 300,
            Math.sin(angle) * 300,
          );
        }
      }
    });

    this.scene.tweens.add({
      targets: treeGraphics,
      alpha: 0,
      rotation: Math.PI / 2,
      duration: 1200,
      onComplete: () => treeGraphics.destroy(),
    });
  }

  protected applyUpgrade(): void {
    this.damage += 9;
    this.purifyRadius += scaleManager.scaleValue(40);
    if (this.level >= 3) this.sweepRange = scaleManager.scaleValue(350);
    if (this.level >= 5) this.coolDown = 2500;
  }
}

// Immortal Slaying Blade - Lu Ya's weapon
export class ImmortalSlayingBlade extends Weapon {
  private lockOnDuration: number;
  private bladeSpeed: number;

  constructor(scene: GameScene, player: Player) {
    super(scene, player, {
      type: "immortal_slaying_blade",
    });
    this.lockOnDuration = 1500; // 1.5 seconds lock-on duration
    this.bladeSpeed = 400;
  }

  protected fire(enemies: Enemy[]): void {
    if (enemies.length === 0) return;

    // Lock onto enemy with highest HP
    const target = enemies.reduce(
      (highest, enemy) => {
        if (enemy.isDead) return highest;
        return !highest || enemy.health > highest.health ? enemy : highest;
      },
      null as Enemy | null,
    );

    if (!target) return;

    const playerPos = this.scene.getPlayerPosition();

    // Create "Treasure, please turn" lock-on effect
    const lockGraphics = this.scene.add.graphics();
    lockGraphics.lineStyle(3, 0xff0000, 1);
    lockGraphics.strokeCircle(target.sprite.x, target.sprite.y, 50);
    lockGraphics.lineStyle(2, 0xffff00, 1);
    lockGraphics.strokeCircle(target.sprite.x, target.sprite.y, 60);

    this.scene.tweens.add({
      targets: lockGraphics,
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0,
      duration: this.lockOnDuration,
      onComplete: () => {
        lockGraphics.destroy();

        // Fire decisive blade after lock-on
        if (target.isDead) return;

        const projectileSize = scaleManager.scaleValue(28);
        const blade = this.projectiles?.create(
          playerPos.x,
          playerPos.y,
          this.type,
        ) as ProjectileSprite;

        blade.setCircle(projectileSize / 2);
        blade.setDisplaySize(projectileSize, projectileSize);
        blade.damage = this.damage;
        blade.weaponRef = this;
        blade.setTint(0xff0000);

        // Track target
        const trackBlade = () => {
          if (!blade.active || target.isDead) {
            if (blade.active) blade.destroy();
            return;
          }

          const dx = target.sprite.x - blade.x;
          const dy = target.sprite.y - blade.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 20) {
            // Decisive effect - bonus damage
            target.takeDamage(this.damage * 2);
            blade.destroy();
            return;
          }

          const angle = Math.atan2(dy, dx);
          blade.setVelocity(
            Math.cos(angle) * this.bladeSpeed,
            Math.sin(angle) * this.bladeSpeed,
          );
          blade.setRotation(angle);

          this.scene.time.delayedCall(50, trackBlade);
        };

        trackBlade();

        // Timeout protection
        this.scene.time.delayedCall(5000, () => {
          if (blade.active) blade.destroy();
        });
      },
    });
  }

  protected applyUpgrade(): void {
    this.damage += 12;
    this.bladeSpeed += 50;
    if (this.level >= 3) this.lockOnDuration = 1000;
    if (this.level >= 5) this.coolDown = 3000;
  }
}

// Diamond Snare - Supreme Elder's weapon
export class DiamondSnare extends Weapon {
  private snareSpeed: number;
  private armorBreak: number;
  private collectRangeBonus: number;

  constructor(scene: GameScene, player: Player) {
    super(scene, player, {
      type: "diamond_snare",
    });
    this.snareSpeed = 500;
    this.armorBreak = 0.5; // Ignore 50% defense
    this.collectRangeBonus = 0;
    this.applyCollectRangeBonus();
  }

  protected fire(enemies: Enemy[]): void {
    if (enemies.length === 0) return;

    const closestEnemy = this.getClosestEnemy(enemies);
    if (!closestEnemy) return;

    const playerPos = this.scene.getPlayerPosition();
    const angle = Phaser.Math.Angle.Between(
      playerPos.x,
      playerPos.y,
      closestEnemy.sprite.x,
      closestEnemy.sprite.y,
    );

    const projectileSize = scaleManager.scaleValue(32);
    const snare = this.projectiles?.create(
      playerPos.x,
      playerPos.y,
      this.type,
    ) as ProjectileSprite;

    snare.setCircle(projectileSize / 2);
    snare.setDisplaySize(projectileSize, projectileSize);
    snare.setVelocity(
      Math.cos(angle) * this.snareSpeed,
      Math.sin(angle) * this.snareSpeed,
    );
    snare.damage = this.damage * (1 + this.armorBreak); // Armor penetration bonus
    snare.weaponRef = this;
    snare.setTint(0xffd700);

    // Rotation effect
    this.scene.tweens.add({
      targets: snare,
      rotation: Math.PI * 4,
      duration: 2000,
    });

    this.scene.time.delayedCall(2000, () => {
      if (snare.active) snare.destroy();
    });
  }

  protected applyUpgrade(): void {
    this.damage += 7;
    this.snareSpeed += 50;
    if (this.level >= 2) this.armorBreak = 0.6;
    if (this.level >= 3) this.armorBreak = 0.7;
    if (this.level >= 5) this.armorBreak = 1.0; // Level 5 ignores all defense

    // Increase collect range bonus with each level
    this.updateCollectRangeBonus();
  }

  private updateCollectRangeBonus(): void {
    // Remove old bonus
    this.player.collectRangeBonus -= this.collectRangeBonus;

    this.collectRangeBonus = COLLECT_RANGE_BONUS * this.level;

    // Apply new bonus
    this.applyCollectRangeBonus();
  }

  private applyCollectRangeBonus(): void {
    this.player.collectRangeBonus += this.collectRangeBonus;
  }
}

// Exquisite Pagoda - Li Jing's Pagoda
export class ExquisitePagoda extends Weapon {
  private pagodaRadius: number;
  private imprisonDuration: number;
  private damageOverTime: number;

  constructor(scene: GameScene, player: Player) {
    super(scene, player, {
      type: "exquisite_pagoda",
    });
    this.pagodaRadius = scaleManager.scaleValue(200);
    this.imprisonDuration = 4000;
    this.damageOverTime = 8;
  }

  protected fire(enemies: Enemy[]): void {
    if (enemies.length === 0) return;

    const closestEnemy = this.getClosestEnemy(enemies);
    if (!closestEnemy) return;

    const targetX = closestEnemy.sprite.x;
    const targetY = closestEnemy.sprite.y;

    // Create pagoda suppression effect
    const pagoda = this.scene.add.graphics();
    pagoda.setPosition(targetX, targetY);

    // Draw multi-layer pagoda
    for (let layer = 0; layer < 5; layer++) {
      const layerRadius = this.pagodaRadius * (1 - layer * 0.15);
      const layerHeight = -layer * 40;

      pagoda.lineStyle(4, 0xffd700, 0.8);
      pagoda.strokeRect(-layerRadius / 2, layerHeight - 20, layerRadius, 20);
    }

    // Seal array at pagoda base
    pagoda.lineStyle(3, 0xff6600, 0.7);
    pagoda.strokeCircle(0, 0, this.pagodaRadius);
    pagoda.lineStyle(2, 0xffff00, 0.7);
    pagoda.strokeCircle(0, 0, this.pagodaRadius * 0.7);

    // Suppression effect
    const imprisonedEnemies: Enemy[] = [];
    enemies.forEach((enemy) => {
      if (enemy.isDead) return;

      const distance = Phaser.Math.Distance.Between(
        targetX,
        targetY,
        enemy.sprite.x,
        enemy.sprite.y,
      );

      if (distance < this.pagodaRadius) {
        imprisonedEnemies.push(enemy);
        enemy.takeDamage(this.damage);

        // Imprisonment - significant slowdown
        if (enemy.sprite.body && "setVelocity" in enemy.sprite.body) {
          enemy.sprite.body.setVelocity(0, 0);
        }
      }
    });

    // Continuous suppression damage
    const imprisonTicks = Math.floor(this.imprisonDuration / 500);
    this.scene.time.addEvent({
      delay: 500,
      repeat: imprisonTicks - 1,
      callback: () => {
        imprisonedEnemies.forEach((enemy) => {
          if (!enemy.isDead) {
            enemy.takeDamage(this.damageOverTime);
            // Maintain imprisonment
            if (enemy.sprite.body && "setVelocity" in enemy.sprite.body) {
              enemy.sprite.body.setVelocity(0, 0);
            }
          }
        });
      },
    });

    this.scene.tweens.add({
      targets: pagoda,
      alpha: 0,
      scaleX: 0.8,
      scaleY: 0.8,
      duration: this.imprisonDuration,
      onComplete: () => pagoda.destroy(),
    });
  }

  protected applyUpgrade(): void {
    this.damage += 9;
    this.damageOverTime += 3;
    if (this.level >= 3) this.pagodaRadius = scaleManager.scaleValue(250);
    if (this.level >= 5) this.imprisonDuration = 5500;
  }
}

// Nine Tooth Rake - Zhu Bajie's weapon
export class NineToothRake extends Weapon {
  private rakeRange: number;

  constructor(scene: GameScene, player: Player) {
    super(scene, player, {
      type: "nine_tooth_rake",
    });
    this.rakeRange = scaleManager.scaleValue(200);
  }

  protected fire(enemies: Enemy[]): void {
    const playerPos = this.scene.getPlayerPosition();
    const targetAngle = this.getPlayerAngle();

    // Create nine-tooth rake sweep effect - fan-shaped attack
    const graphics = this.scene.add.graphics();
    graphics.setPosition(playerPos.x, playerPos.y);

    // Draw the nine teeth of the rake
    const teethCount = 5 + Math.floor(this.level / 2); // 5-7 teeth
    const spreadAngle = Math.PI / 4; // 45 degree fan shape

    for (let i = 0; i < teethCount; i++) {
      const angle =
        targetAngle + (i - (teethCount - 1) / 2) * (spreadAngle / teethCount);
      const startX = Math.cos(angle) * 30;
      const startY = Math.sin(angle) * 30;
      const endX = Math.cos(angle) * this.rakeRange;
      const endY = Math.sin(angle) * this.rakeRange;

      graphics.lineStyle(6, 0xffa500, 0.8);
      graphics.lineBetween(startX, startY, endX, endY);

      // Tooth tips
      graphics.fillStyle(0xff8c00, 1);
      graphics.fillCircle(endX, endY, 8);
    }

    // Fan-shaped coverage area
    graphics.fillStyle(0xffa500, 0.3);
    graphics.slice(
      0,
      0,
      this.rakeRange,
      targetAngle - spreadAngle / 2,
      targetAngle + spreadAngle / 2,
      false,
    );
    graphics.fillPath();

    // Deal damage to enemies in range
    enemies.forEach((enemy) => {
      if (enemy.isDead) return;

      const distance = Phaser.Math.Distance.Between(
        playerPos.x,
        playerPos.y,
        enemy.sprite.x,
        enemy.sprite.y,
      );
      const angle = Phaser.Math.Angle.Between(
        playerPos.x,
        playerPos.y,
        enemy.sprite.x,
        enemy.sprite.y,
      );

      const angleDiff = Math.abs(Phaser.Math.Angle.Wrap(angle - targetAngle));

      if (distance < this.rakeRange && angleDiff < spreadAngle / 2) {
        enemy.takeDamage(this.damage);

        // Rake effect: pull enemies backward (rake effect)
        const pullAngle = Phaser.Math.Angle.Between(
          enemy.sprite.x,
          enemy.sprite.y,
          playerPos.x,
          playerPos.y,
        );
        if (enemy.sprite.body && "setVelocity" in enemy.sprite.body) {
          enemy.sprite.body.setVelocity(
            Math.cos(pullAngle) * 200,
            Math.sin(pullAngle) * 200,
          );
        }
      }
    });

    this.scene.tweens.add({
      targets: graphics,
      alpha: 0,
      rotation: 0.3,
      duration: 400,
      onComplete: () => graphics.destroy(),
    });
  }

  protected applyUpgrade(): void {
    this.damage += 8;
    this.rakeRange += scaleManager.scaleValue(20);
    if (this.level >= 5) this.coolDown = 1200;
  }
}

// Dragon Scale Sword - White Dragon Horse's weapon
export class DragonScaleSword extends Weapon {
  private swordSpeed: number;
  private swordCount: number;

  constructor(scene: GameScene, player: Player) {
    super(scene, player, {
      type: "dragon_scale_sword",
    });
    this.swordSpeed = 450;
    this.swordCount = 1;
  }

  protected fire(enemies: Enemy[]): void {
    if (enemies.length === 0) return;

    const playerPos = this.scene.getPlayerPosition();

    // Find closest enemy
    const closestEnemy = this.getClosestEnemy(enemies);

    if (!closestEnemy) return;

    const baseAngle = Phaser.Math.Angle.Between(
      playerPos.x,
      playerPos.y,
      closestEnemy.sprite.x,
      closestEnemy.sprite.y,
    );

    // Launch multiple dragon scale sword qi
    for (let i = 0; i < this.swordCount; i++) {
      const angle = baseAngle + (i - (this.swordCount - 1) / 2) * 0.2;
      const projectileSize = scaleManager.scaleValue(32);

      const sword = this.projectiles?.create(
        playerPos.x,
        playerPos.y,
        this.type,
      ) as ProjectileSprite;

      sword.setCircle(projectileSize / 2);
      sword.setDisplaySize(projectileSize, projectileSize);
      sword.setVelocity(
        Math.cos(angle) * this.swordSpeed,
        Math.sin(angle) * this.swordSpeed,
      );
      sword.damage = this.damage;
      sword.weaponRef = this;
      sword.setRotation(angle);
      sword.setTint(0x00ffff); // Cyan dragon light

      // Dragon scale sword qi effect - spiral trajectory
      let spiralAngle = 0;
      const spiralRadius = 15;
      const updateSpiral = () => {
        if (!sword.active) return;

        spiralAngle += 0.3;
        const offsetX = Math.cos(spiralAngle) * spiralRadius;
        const offsetY = Math.sin(spiralAngle) * spiralRadius;

        // Create sword qi trajectory
        const trail = this.scene.add.graphics();
        trail.fillStyle(0x00ffff, 0.5);
        trail.fillCircle(sword.x + offsetX, sword.y + offsetY, 5);

        this.scene.tweens.add({
          targets: trail,
          alpha: 0,
          scaleX: 0.5,
          scaleY: 0.5,
          duration: 300,
          onComplete: () => trail.destroy(),
        });

        this.scene.time.delayedCall(50, updateSpiral);
      };
      updateSpiral();

      // Lifetime
      this.scene.time.delayedCall(2000, () => {
        if (sword.active) sword.destroy();
      });
    }
  }

  protected applyUpgrade(): void {
    this.damage += 6;
    this.swordSpeed += 50;
    if (this.level >= 2) this.swordCount = 2;
    if (this.level >= 4) this.swordCount = 3;
    if (this.level >= 5) {
      this.swordCount = 3;
      this.coolDown = 900;
    }
  }
}

// Weapon types
export type WeaponClass =
  | typeof GoldenStaff
  | typeof RuyiStaff
  | typeof FireLance
  | typeof WindTamer
  | typeof VioletBell
  | typeof FireproofCloak
  | typeof TwinBlades
  | typeof Mace
  | typeof BullHorns
  | typeof ThunderDrum
  | typeof IceNeedle
  | typeof WindFireWheels
  | typeof JadePurityBottle
  | typeof GoldenRope
  | typeof PlantainFan
  | typeof ThreePointedBlade
  | typeof NineRingStaff
  | typeof CrescentBlade
  | typeof IronCudgel
  | typeof SevenStarSword
  | typeof GinsengFruit
  | typeof HeavenEarthCircle
  | typeof RedArmillarySash
  | typeof PurpleGoldGourd
  | typeof GoldenRopeImmortal
  | typeof DemonRevealingMirror
  | typeof SeaCalmingNeedle
  | typeof EightTrigramsFurnace
  | typeof DragonStaff
  | typeof SevenTreasureTree
  | typeof ImmortalSlayingBlade
  | typeof DiamondSnare
  | typeof ExquisitePagoda
  | typeof NineToothRake
  | typeof DragonScaleSword;
export interface UpgradeOption {
  type: "upgrade" | "new";
  weapon?: Weapon;
  weaponClass?: WeaponClass;
  name: string;
  description: string;
}

export const WEAPON_MAP: Record<WeaponType, WeaponClass> = {
  golden_staff: GoldenStaff,
  fireproof_cloak: FireproofCloak,
  ruyi_staff: RuyiStaff,
  fire_lance: FireLance,
  wind_tamer: WindTamer,
  violet_bell: VioletBell,
  twin_blades: TwinBlades,
  mace: Mace,
  bull_horns: BullHorns,
  thunder_drum: ThunderDrum,
  ice_needle: IceNeedle,
  wind_fire_wheels: WindFireWheels,
  jade_purity_bottle: JadePurityBottle,
  golden_rope: GoldenRope,
  plantain_fan: PlantainFan,
  three_pointed_blade: ThreePointedBlade,
  nine_ring_staff: NineRingStaff,
  crescent_blade: CrescentBlade,
  iron_cudgel: IronCudgel,
  seven_star_sword: SevenStarSword,
  ginseng_fruit: GinsengFruit,
  heaven_earth_circle: HeavenEarthCircle,
  red_armillary_sash: RedArmillarySash,
  purple_gold_gourd: PurpleGoldGourd,
  golden_rope_immortal: GoldenRopeImmortal,
  demon_revealing_mirror: DemonRevealingMirror,
  sea_calming_needle: SeaCalmingNeedle,
  eight_trigrams_furnace: EightTrigramsFurnace,
  dragon_staff: DragonStaff,
  seven_treasure_tree: SevenTreasureTree,
  immortal_slaying_blade: ImmortalSlayingBlade,
  diamond_snare: DiamondSnare,
  exquisite_pagoda: ExquisitePagoda,
  nine_tooth_rake: NineToothRake,
  dragon_scale_sword: DragonScaleSword,
};

// Weapon Manager
export class WeaponManager {
  private scene: GameScene;
  private player: Player;
  public weapons: Weapon[];

  constructor(scene: GameScene, player: Player) {
    this.scene = scene;
    this.player = player;
    this.weapons = [];
  }

  public update(time: number, enemies: Enemy[]): void {
    this.weapons.forEach((weapon) => {
      weapon.update(time, enemies);
    });
  }

  public addWeapon(WeaponClass: WeaponClass): Weapon {
    const weapon = new WeaponClass(this.scene, this.player);
    this.weapons.push(weapon);
    return weapon;
  }

  public hasWeapon(WeaponClass: WeaponClass): boolean {
    return this.weapons.some((weapon) => weapon instanceof WeaponClass);
  }

  public getWeapon(WeaponClass: WeaponClass): Weapon | undefined {
    return this.weapons.find((weapon) => weapon instanceof WeaponClass);
  }

  public getWeaponById(id: WeaponType): WeaponClass {
    return WEAPON_MAP[id] || GoldenStaff;
  }

  public getUpgradeOptions(): UpgradeOption[] {
    const options: UpgradeOption[] = [];

    // Upgrade options for existing weapons
    this.weapons.forEach((weapon) => {
      if (weapon.level < weapon.maxLevel) {
        const name = i18n.t(`weapons.${weapon.type}.name`);
        options.push({
          type: "upgrade",
          weapon: weapon,
          name: i18n.t("weapons.upgradeToLevel", {
            name,
            level: weapon.level + 1,
          }),
          description: i18n.t("weapons.upgrade", { name }),
        });
      }
    });

    // New weapon options
    Object.entries(WEAPON_MAP).forEach(([type, weaponClass]) => {
      if (!this.hasWeapon(weaponClass)) {
        options.push({
          type: "new",
          weaponClass: weaponClass,
          name: i18n.t(`weapons.${type}.name`),
          description: i18n.t(`weapons.${type}.description`),
        });
      }
    });

    // Randomly select 3 options
    const shuffled = options.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, MAX_SELECT_SIZE);
  }

  public clear(): void {
    this.weapons.forEach((weapon) => {
      weapon.projectiles?.clear(true, true);

      weapon.orbs.forEach((orb: OrbData) => orb.sprite.destroy());
    });
    this.weapons = [];
  }
}
