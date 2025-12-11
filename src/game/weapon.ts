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
  RARITY_DURATION,
  RARITY_SPEED,
  RARITY_DAMAGE,
  RARITY_MAX_LEVEL,
  ENABLE_DEBUG,
} from "../constant";
import type { GameScene } from "./GameScene";

/**
 * Configuration interface for weapon creation
 */
export interface WeaponConfig {
  type: WeaponType;
  isOrb?: boolean;
}

/**
 * Extended projectile sprite with additional weapon-related properties
 */
export interface ProjectileSprite extends Phaser.Physics.Arcade.Sprite {
  damage: number;
  piercing: number;
  distance: number;
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
  private _damage: number;
  public coolDown: number;
  private lastFired: number;
  public type: WeaponType;
  public orbs: OrbData[] = [];
  public projectiles: Phaser.Physics.Arcade.Group;
  private collectRangeBonus: number = 0;
  public projectileCount: number = 1;
  public projectileSpeed: number;
  public piercing: number = 1;
  public isOrb: boolean = false;
  public rotationSpeed = 0;
  public rotationAngle = 0;
  public rotationRadius = 0;

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
    this.maxLevel = RARITY_MAX_LEVEL[weaponData.rarity] ?? 5;
    this._damage = weaponData.baseDamage ?? 0;
    this.coolDown = weaponData.attackSpeed ?? 0;
    this.lastFired = 0;
    this.type = config.type;
    this.projectiles = scene.physics.add.group();
    this.projectileSpeed = RARITY_SPEED[weaponData.rarity] ?? 0;
    this.isOrb = config.isOrb ?? false;
  }

  public get damage(): number {
    const isCrit =
      this.player.critRate > 0 && Math.random() <= this.player.critRate;

    const damage = this._damage + this.player.attack;

    return isCrit ? damage * 1.5 : damage;
  }

  public set damage(value: number) {
    this._damage = value;
  }

  /**
   * Update weapon logic and handle firing
   * @param time Current game time
   * @param enemies Array of active enemies
   */
  public update(time: number, enemies: Enemy[]): void {
    if (this.isOrb) {
      this.rotationAngle += this.rotationSpeed * 0.016; // Assuming 60fps
      const playerPos = this.scene.getPlayerPosition();

      const radius = scaleManager.scaleValue(this.rotationRadius);

      // Update each orb's position around the player
      this.orbs.forEach((orb) => {
        const adjustedAngle = this.rotationAngle + orb.offset;
        orb.sprite.x = playerPos.x + Math.cos(adjustedAngle) * radius;
        orb.sprite.y = playerPos.y + Math.sin(adjustedAngle) * radius;
      });
      return;
    }

    if (time - this.lastFired >= this.coolDown) {
      if (enemies.length > 0) {
        this.scene.playPlayerFireSound();
      }
      this.fire(enemies);
      this.lastFired = time;
    }
  }

  /**
   * Upgrade the weapon if not at max level
   */
  public upgrade(): void {
    if (this.level < this.maxLevel) {
      this.level++;
      this._damage += RARITY_DAMAGE[WEAPONS[this.type].rarity];
      this.applyUpgrade();
    }
  }

  /**
   * Apply weapon-specific upgrades - must be implemented by subclasses
   */
  protected abstract applyUpgrade(): void;

  /**
   * Get all enemies within a specified range of the player
   */
  protected getEnemiesInRange(enemies: Enemy[], range: number): Enemy[] {
    if (enemies.length === 0) return [];

    const playerPos = this.scene.getPlayerPosition();

    return enemies.filter((enemy) => {
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

  protected createProjectile(x?: number): ProjectileSprite {
    const playerPos = this.scene.getPlayerPosition();

    const weaponData = WEAPONS[this.type];

    const projectileSize = scaleManager.scaleValue(
      RARITY_SIZE[weaponData.rarity],
    );

    let projectile: ProjectileSprite;

    let distance = 20;

    if (this.isOrb) {
      distance = 25;
      projectile = this.scene.physics.add.sprite(
        0,
        0,
        this.type,
      ) as ProjectileSprite;
    } else {
      projectile = this.projectiles.create(
        x ?? playerPos.x,
        playerPos.y,
        this.type,
      ) as ProjectileSprite;
    }

    projectile.setCircle(projectileSize / 2);
    projectile.setDisplaySize(projectileSize, projectileSize);
    projectile.damage = this.damage;
    projectile.piercing = this.piercing;
    projectile.distance = distance;

    return projectile;
  }

  protected createOrbs(): void {
    if (this.orbs.length === this.projectileCount) {
      return;
    }

    this.orbs.forEach((orb) => orb.sprite.destroy());
    this.orbs = [];

    for (let i = 0; i < this.projectileCount; i++) {
      const orb = this.createProjectile();
      this.orbs.push({
        sprite: orb,
        offset: ((Math.PI * 2) / this.projectileCount) * i,
      });
    }
  }

  protected generateProjectileAngle(_index: number, enemy?: Enemy): number {
    if (!enemy) {
      return 0;
    }
    const playerPos = this.scene.getPlayerPosition();
    return Phaser.Math.Angle.Between(
      playerPos.x,
      playerPos.y,
      enemy.sprite.x,
      enemy.sprite.y,
    );
  }

  // Fire the weapon
  protected fire(enemies: Enemy[]): void {
    if (this.projectileCount === 0 || this.isOrb) {
      return;
    }

    const playerPos = this.scene.getPlayerPosition();
    const weaponData = WEAPONS[this.type];
    const duration = RARITY_DURATION[weaponData.rarity];

    for (let i = 0; i < this.projectileCount; i++) {
      const angle = this.generateProjectileAngle(i, enemies[i]);
      const projectile = this.createProjectile(
        playerPos.x + (i === 0 ? -10 : 10),
      );

      projectile.setVelocity(
        Math.cos(angle) * this.projectileSpeed,
        Math.sin(angle) * this.projectileSpeed,
      );
      projectile.setRotation(angle);

      this.scene.time.delayedCall(duration, () => {
        if (projectile.active) projectile.destroy();
      });
    }
  }

  protected updateCollectRange(): void {
    this.player.collectRange -= this.collectRangeBonus;

    this.collectRangeBonus = COLLECT_RANGE_BONUS * this.level;

    this.player.collectRange += this.collectRangeBonus;
  }
}

/**
 * Golden Staff weapon class
 * Fires auto-targeting magic missiles at the closest enemy
 */
export class GoldenStaff extends Weapon {
  constructor(scene: GameScene, player: Player) {
    super(scene, player, {
      type: "golden_staff",
    });
  }

  /**
   * Apply upgrades when weapon levels up
   */
  protected applyUpgrade(): void {
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
  constructor(scene: GameScene, player: Player) {
    super(scene, player, {
      type: "fireproof_cloak",
      isOrb: true,
    });
    this.rotationRadius = 80;
    this.rotationSpeed = 2; // Initial rotation speed

    // Initialize orbs on creation
    this.createOrbs();
  }

  protected fire() {}

  /**
   * Apply upgrades when weapon levels up
   */
  protected applyUpgrade(): void {
    // Update orbs with new damage value
    this.orbs.forEach((orb) => {
      orb.sprite.damage = this.damage;
    });

    // Level-based upgrades
    if (this.level === 2) {
      // Add second orb at level 2
      this.projectileCount = 2;
      this.createOrbs();
    } else if (this.level === 3) {
      // Increase radius at level 3
      this.rotationRadius = 100;
    } else if (this.level === 4) {
      // Add third orb at level 4
      this.projectileCount = 3;
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
  constructor(scene: GameScene, player: Player) {
    super(scene, player, {
      type: "ruyi_staff",
    });
    this.piercing = 3; // Can pierce through 3 enemies initially
  }

  /**
   * Apply upgrades when weapon levels up
   * Enhances damage, reduces cool down, increases projectile count, and improves piercing
   */
  protected applyUpgrade(): void {
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
  constructor(scene: GameScene, player: Player) {
    super(scene, player, {
      type: "fire_lance",
    });
    this.piercing = 2; // Can pierce through 2 enemies initially
  }

  /**
   * Apply upgrades when weapon levels up
   * Enhances damage, piercing, speed, and reduces cool down
   */
  protected applyUpgrade(): void {
    // Reduce cool down with a minimum of 600ms
    this.coolDown = Math.max(600, this.coolDown - 150);

    // Increase piercing capability at level 3
    if (this.level >= 3) this.piercing = 3;

    // Increase speed at max level
    if (this.level >= 5) this.projectileSpeed = 600;
  }
}

// Wind Tamer - Area damage pearl
export class WindTamer extends Weapon {
  constructor(scene: GameScene, player: Player) {
    super(scene, player, {
      type: "wind_tamer",
      isOrb: true,
    });
    this.rotationSpeed = 2;
    this.rotationRadius = 60;
    this.createOrbs();
  }

  protected fire() {}

  protected applyUpgrade(): void {
    if (this.level >= 2) this.rotationSpeed = 3;
    if (this.level >= 3) {
      this.rotationRadius = 80;
    }
    if (this.level >= 4) this.rotationSpeed = 4;
    if (this.level >= 5) {
      this.projectileCount = 2;
      this.createOrbs();
    }
  }
}

// Violet Bell - Sound wave weapon
export class VioletBell extends Weapon {
  constructor(scene: GameScene, player: Player) {
    super(scene, player, {
      type: "violet_bell",
    });
    this.projectileCount = 3;
  }

  protected fire(enemies: Enemy[]): void {
    const playerPos = this.scene.getPlayerPosition();
    const angles = [];

    for (let i = 0; i < this.projectileCount; i++) {
      angles.push((Math.PI * 2 * i) / this.projectileCount);
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
    if (this.level >= 2) this.projectileCount = 4;
    if (this.level >= 3) this.coolDown = 1200;
    if (this.level >= 4) this.projectileCount = 5;
    if (this.level >= 5) this.coolDown = 1000;
  }
}

// Twin Blades - Fast dual strike
export class TwinBlades extends Weapon {
  constructor(scene: GameScene, player: Player) {
    super(scene, player, {
      type: "twin_blades",
    });
    this.projectileCount = 2;
  }

  protected applyUpgrade(): void {
    this.coolDown = Math.max(400, this.coolDown - 100);
    if (this.level >= 5) this.projectileSpeed += 150;
  }
}

// Mace - Heavy damage weapon
export class Mace extends Weapon {
  constructor(scene: GameScene, player: Player) {
    super(scene, player, {
      type: "mace",
    });
  }

  protected applyUpgrade(): void {
    if (this.level >= 3) this.coolDown = 1500;
    if (this.level >= 5) this.damage += 5;
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

    this.getEnemiesInRange(enemies, this.chargeRadius).forEach((enemy) => {
      enemy.takeDamage(this.damage);
      const angle = Phaser.Math.Angle.Between(
        playerPos.x,
        playerPos.y,
        enemy.sprite.x,
        enemy.sprite.y,
      );
      enemy.setVelocity(Math.cos(angle) * 300, Math.sin(angle) * 300);
    });

    this.scene.tweens.add({
      targets: circle,
      alpha: 0,
      duration: 500,
      onComplete: () => circle.destroy(),
    });
  }

  protected applyUpgrade(): void {
    if (this.level >= 2) this.chargeRadius = 180;
    if (this.level >= 3) this.coolDown = 2000;
    if (this.level >= 4) this.chargeRadius = 200;
    if (this.level >= 5) this.damage += 5;
  }
}

// Thunder Drum - Lightning strikes
export class ThunderDrum extends Weapon {
  constructor(scene: GameScene, player: Player) {
    super(scene, player, {
      type: "thunder_drum",
    });
    this.projectileCount = 3;
  }

  protected fire(enemies: Enemy[]): void {
    const targets = enemies
      .sort(() => Math.random() - 0.5)
      .slice(0, this.projectileCount);

    targets.forEach((target) => {
      // Lightning strike effect
      const lightning = this.scene.add.image(
        target.sprite.x,
        target.sprite.y,
        this.type,
      );

      lightning.setScale(2);

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
    if (this.level >= 2) this.projectileCount = 4;
    if (this.level >= 3) this.coolDown = 1300;
    if (this.level >= 4) this.projectileCount = 5;
    if (this.level >= 5) this.damage += 5;
  }
}

// Ice Needle - Slowing projectiles
export class IceNeedle extends Weapon {
  constructor(scene: GameScene, player: Player) {
    super(scene, player, {
      type: "ice_needle",
    });
    this.projectileCount = 3;
  }

  protected generateProjectileAngle(i: number): number {
    return ((Math.PI * 2) / this.projectileCount) * i;
  }

  protected applyUpgrade(): void {
    if (this.level >= 2) this.projectileCount = 4;
    if (this.level >= 3) this.coolDown = 700;
    if (this.level >= 4) this.projectileCount = 5;
    if (this.level >= 5) this.projectileSpeed += 100;
  }
}

// Wind Fire Wheels - Dual spinning wheels
export class WindFireWheels extends Weapon {
  constructor(scene: GameScene, player: Player) {
    super(scene, player, {
      type: "wind_fire_wheels",
      isOrb: true,
    });
    this.projectileCount = 2;
    this.rotationRadius = 70;
    this.rotationSpeed = 4;
    this.createOrbs();
  }

  protected fire() {}

  protected applyUpgrade(): void {
    if (this.level >= 2) this.rotationSpeed = 5;
    if (this.level >= 3) this.rotationRadius = 90;
    if (this.level >= 4) this.rotationSpeed = 6;
    if (this.level >= 5) this.projectileCount = 3;
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

        enemy.setVelocity(
          Math.cos(angle) * this.pullStrength,
          Math.sin(angle) * this.pullStrength,
        );

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
    if (this.level >= 2) this.pullRadius = 250;
    if (this.level >= 3) this.pullStrength = 200;
    if (this.level >= 4) this.coolDown = 1800;
    if (this.level >= 5) this.damage += 5;
  }
}

// Golden Rope - Binding weapon
export class GoldenRope extends Weapon {
  constructor(scene: GameScene, player: Player) {
    super(scene, player, {
      type: "golden_rope",
    });
    this.projectileCount = 2;
  }

  protected applyUpgrade(): void {
    if (this.level >= 2) this.projectileCount = 3;
    if (this.level >= 4) this.projectileCount = 4;
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

    const nearest = enemies[0];
    if (!nearest) {
      return;
    }

    const targetAngle = Phaser.Math.Angle.Between(
      playerPos.x,
      playerPos.y,
      nearest.sprite.x,
      nearest.sprite.y,
    );

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

        enemy.setVelocity(Math.cos(angle) * 400, Math.sin(angle) * 400);
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
    if (this.level >= 2) this.fanAngle = Math.PI / 2.5;
    if (this.level >= 3) this.fanRange = 300;
    if (this.level >= 4) this.coolDown = 2500;
    if (this.level >= 5) this.fanAngle = Math.PI / 2;
  }
}

// Three Pointed Blade - Erlang Shen weapon
export class ThreePointedBlade extends Weapon {
  constructor(scene: GameScene, player: Player) {
    super(scene, player, {
      type: "three_pointed_blade",
    });
    this.projectileCount = 3;
  }

  protected generateProjectileAngle(i: number): number {
    return this.getPlayerAngle() + ((i - 1) * Math.PI) / 6;
  }

  protected applyUpgrade(): void {
    this.coolDown = Math.max(600, this.coolDown - 100);
    if (this.level >= 4) this.projectileCount = 5;
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

    this.getEnemiesInRange(enemies, this.soundWaveRadius).forEach((enemy) => {
      enemy.takeDamage(this.damage);

      const originalSpeed = enemy.speed;
      enemy.speed *= 0.3;
      this.scene.time.delayedCall(this.stunDuration, () => {
        enemy.speed = originalSpeed;
      });
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
    this.soundWaveRadius += scaleManager.scaleValue(20);
    if (this.level >= 3) this.stunDuration = 1500;
    if (this.level >= 5) this.coolDown = 1200;
  }
}

// Crescent Blade - Sha Monk's crescent shovel
export class CrescentBlade extends Weapon {
  constructor(scene: GameScene, player: Player) {
    super(scene, player, {
      type: "crescent_blade",
    });
    this.projectileCount = 2;
  }

  protected generateProjectileAngle(i: number): number {
    return this.getPlayerAngle() + ((i - 0.5) * Math.PI) / 4;
  }

  protected applyUpgrade(): void {
    this.projectileSpeed += 30;
    if (this.level >= 3) this.projectileCount = 3;
    if (this.level >= 5) this.projectileCount = 4;
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

    this.getEnemiesInRange(enemies, this.smashRadius).forEach((enemy) => {
      enemy.takeDamage(this.damage);

      const angle = Phaser.Math.Angle.Between(
        playerPos.x,
        playerPos.y,
        enemy.sprite.x,
        enemy.sprite.y,
      );
      enemy.setVelocity(
        Math.cos(angle) * this.knockbackForce,
        Math.sin(angle) * this.knockbackForce,
      );
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
    this.smashRadius += scaleManager.scaleValue(15);
    this.knockbackForce += 50;
    if (this.level >= 5) this.coolDown = 1700;
  }
}

// Seven Star Sword - Daoist weapon
export class SevenStarSword extends Weapon {
  constructor(scene: GameScene, player: Player) {
    super(scene, player, {
      type: "seven_star_sword",
      isOrb: true,
    });
    this.projectileCount = 3;
    this.rotationRadius = 90;
    this.createOrbs();
  }

  protected fire() {}

  public update(time: number): void {
    const playerPos = this.scene.getPlayerPosition();
    const rotation = (time / 1000) * 3;

    const radius = scaleManager.scaleValue(this.rotationRadius);

    this.orbs.forEach((orb) => {
      const angle = rotation + orb.offset;
      orb.sprite.x = playerPos.x + Math.cos(angle) * radius;
      orb.sprite.y = playerPos.y + Math.sin(angle) * radius;
      orb.sprite.setRotation(angle + Math.PI / 2);
    });
  }
  protected applyUpgrade(): void {
    this.rotationRadius += 10;
    if (this.level >= 3) {
      this.projectileCount = 5;
      this.createOrbs();
    }
    if (this.level >= 5) {
      this.projectileCount = 7;
      this.createOrbs();
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

    this.getEnemiesInRange(enemies, scaleManager.scaleValue(100)).forEach(
      (enemy) => {
        enemy.takeDamage(this.damage);
      },
    );
  }

  protected applyUpgrade(): void {
    this.healAmount += 10;
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

  protected fire(): void {
    const targetAngle = this.getPlayerAngle();

    const circle = this.createProjectile();

    // Fly straight
    circle.setVelocity(
      Math.cos(targetAngle) * this.circleSpeed,
      Math.sin(targetAngle) * this.circleSpeed,
    );

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
    this.circleSpeed += 50;
    if (this.level >= 5) this.returnDelay = 1500;
  }
}

// Red Armillary Sash - Nezha's weapon
export class RedArmillarySash extends Weapon {
  constructor(scene: GameScene, player: Player) {
    super(scene, player, {
      type: "red_armillary_sash",
    });
    this.projectileCount = 3;
  }

  protected generateProjectileAngle(i: number): number {
    return this.getPlayerAngle() + ((i - 1) * Math.PI) / 4;
  }

  protected applyUpgrade(): void {
    this.projectileSpeed += 25;
    if (this.level >= 3) this.projectileCount = 4;
    if (this.level >= 5) this.projectileCount = 5;
  }
}

// Purple Gold Gourd - Golden/Silver Horn's weapon
export class PurpleGoldGourd extends Weapon {
  private absorbRadius: number;
  private absorbDuration: number;

  constructor(scene: GameScene, player: Player) {
    super(scene, player, {
      type: "purple_gold_gourd",
    });
    this.absorbRadius = scaleManager.scaleValue(180);
    this.absorbDuration = 2000;
  }

  protected fire(enemies: Enemy[]): void {
    const playerPos = this.scene.getPlayerPosition();

    // Create absorption effect
    const graphics = this.scene.add.graphics();
    graphics.lineStyle(4, 0x9932cc, 1);
    graphics.strokeCircle(0, 0, this.absorbRadius);
    graphics.setPosition(playerPos.x, playerPos.y);

    this.getEnemiesInRange(enemies, this.absorbRadius).forEach((enemy) => {
      enemy.takeDamage(this.damage);

      const angle = Phaser.Math.Angle.Between(
        enemy.sprite.x,
        enemy.sprite.y,
        playerPos.x,
        playerPos.y,
      );
      enemy.setVelocity(Math.cos(angle) * 200, Math.sin(angle) * 200);
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
    this.absorbRadius += scaleManager.scaleValue(20);
    if (this.level >= 3) this.absorbDuration = 1500;
    if (this.level >= 5) this.coolDown = 2800;

    // Increase collect range bonus with each level
    this.updateCollectRange();
  }
}

// Golden Rope Immortal - Immortality Binding Rope (Taishang Laojun)
export class GoldenRopeImmortal extends Weapon {
  constructor(scene: GameScene, player: Player) {
    super(scene, player, {
      type: "golden_rope_immortal",
    });
    this.projectileCount = 3;
  }

  protected applyUpgrade(): void {
    this.projectileSpeed += 30;
    if (this.level >= 3) this.projectileCount = 4;
    if (this.level >= 5) this.projectileCount = 5;
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
    this.critBonus = 1.1;
  }

  protected fire(enemies: Enemy[]): void {
    const playerPos = this.scene.getPlayerPosition();

    // Create demon mirror aura
    const graphics = this.scene.add.graphics();
    graphics.lineStyle(3, 0xffffff, 1);
    graphics.strokeCircle(0, 0, this.revealRadius);
    graphics.setPosition(playerPos.x, playerPos.y);

    this.getEnemiesInRange(enemies, this.revealRadius).forEach((enemy) => {
      enemy.takeDamage(this.damage * this.critBonus);

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
    this.revealRadius += scaleManager.scaleValue(25);
    if (this.level >= 2) this.critBonus = 1.2;
    if (this.level >= 3) this.critBonus = 1.3;
    if (this.level >= 5) this.critBonus = 1.4;
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

    const startAngle = targetAngle - this.sweepAngle / 2;
    const endAngle = targetAngle + this.sweepAngle / 2;

    const isLeft = Math.random() < 0.5;

    graphics.slice(
      0,
      0,
      this.sweepRange,
      isLeft ? -startAngle : startAngle,
      isLeft ? -endAngle : endAngle,
      false,
    );
    graphics.fillPath();
    graphics.setPosition(playerPos.x, playerPos.y);

    enemies.forEach((enemy) => {
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

        enemy.setVelocity(Math.cos(angle) * 600, Math.sin(angle) * 600);
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

    this.getEnemiesInRange(enemies, this.furnaceRadius).forEach((enemy) => {
      enemy.takeDamage(this.damage);

      // Apply continuous burning effect
      const maxBurnTicks = Math.floor(this.burnDuration / 500);

      this.scene.time.addEvent({
        delay: 500,
        repeat: maxBurnTicks - 1,
        callback: () => {
          enemy.takeDamage(this.burnDamagePerTick);
        },
      });
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
    const closestEnemy = enemies[0];
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

            enemy.setVelocity(
              Math.cos(angle) * this.pullStrength,
              Math.sin(angle) * this.pullStrength,
            );
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
    this.tornadoRadius += scaleManager.scaleValue(30);
    if (this.level >= 3) this.pullStrength = 200;
    if (this.level >= 5) this.coolDown = 1800;
  }
}

// Seven Treasure Tree - Zhunti's magical tree
export class SevenTreasureTree extends Weapon {
  constructor(scene: GameScene, player: Player) {
    super(scene, player, {
      type: "seven_treasure_tree",
    });
    this.projectileCount = 7;
  }

  protected applyUpgrade(): void {
    this.projectileSpeed += 40;
    if (this.level >= 3) this.projectileCount = 8;
    if (this.level >= 5) this.coolDown = 2500;
  }
}

// Immortal Slaying Blade - Lu Ya's weapon
export class ImmortalSlayingBlade extends Weapon {
  constructor(scene: GameScene, player: Player) {
    super(scene, player, {
      type: "immortal_slaying_blade",
    });
  }

  protected fire(enemies: Enemy[]): void {
    let target: Enemy = enemies[0];
    for (const item of enemies) {
      if (item.health > target.health) {
        target = item;
      }
    }

    if (!target) return;

    super.fire([target]);
  }

  protected applyUpgrade(): void {
    this.projectileSpeed += 50;
    if (this.level >= 5) this.coolDown = 3000;
  }
}

// Diamond Snare - Supreme Elder's weapon
export class DiamondSnare extends Weapon {
  private armorBreak: number;

  constructor(scene: GameScene, player: Player) {
    super(scene, player, {
      type: "diamond_snare",
    });
    this.armorBreak = 0.5; // Ignore 50% defense
  }

  protected fire(enemies: Enemy[]): void {
    super.fire(enemies);
    this.projectiles.children.entries.forEach((item) => {
      (item as ProjectileSprite).damage = this.damage * (1 + this.armorBreak);
    });
  }

  protected applyUpgrade(): void {
    this.projectileSpeed += 50;
    if (this.level >= 2) this.armorBreak = 0.6;
    if (this.level >= 3) this.armorBreak = 0.7;
    if (this.level >= 5) this.armorBreak = 1.0; // Level 5 ignores all defense

    this.updateCollectRange();
  }
}

// Exquisite Pagoda - Li Jing's Pagoda
export class ExquisitePagoda extends Weapon {
  constructor(scene: GameScene, player: Player) {
    super(scene, player, {
      type: "exquisite_pagoda",
    });
  }

  protected applyUpgrade(): void {
    if (this.level >= 3) this.projectileSpeed = 250;
    if (this.level >= 5) this.projectileCount = 2;
  }
}

// Nine Tooth Rake - Zhu Bajie's weapon
export class NineToothRake extends Weapon {
  constructor(scene: GameScene, player: Player) {
    super(scene, player, {
      type: "nine_tooth_rake",
    });
    this.projectileCount = 4;
  }

  protected applyUpgrade(): void {
    this.projectileSpeed += 20;
    this.projectileCount = this.level + 4;
    if (this.level >= 5) this.coolDown = 1200;
  }
}

// Dragon Scale Sword - White Dragon Horse's weapon
export class DragonScaleSword extends Weapon {
  constructor(scene: GameScene, player: Player) {
    super(scene, player, {
      type: "dragon_scale_sword",
    });
  }

  protected applyUpgrade(): void {
    this.projectileSpeed += 50;
    if (this.level >= 2) this.projectileCount = 2;
    if (this.level >= 4) this.projectileCount = 3;
    if (this.level >= 5) {
      this.projectileCount = 3;
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
  private weapons: Weapon[];

  constructor(scene: GameScene, player: Player) {
    this.scene = scene;
    this.player = player;
    this.weapons = [];
  }

  public update(time: number, enemies: Enemy[]): void {
    const playerPos = this.player.sprite;
    const list = enemies.filter((e) => !e.isDead);
    const sortedEnemies = list.sort((a, b) => {
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
    });
    this.weapons.forEach((weapon) => {
      weapon.update(time, sortedEnemies);
    });
  }

  public addWeapon(WeaponClass: WeaponClass): Weapon {
    const weapon = new WeaponClass(this.scene, this.player);
    this.weapons.push(weapon);
    if (ENABLE_DEBUG) {
      console.log("addWeapon", weapon);
    }

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

  /**
   * Get all weapons managed by this manager
   * @returns Array of all weapons
   */
  public getWeapons(): Weapon[] {
    return this.weapons;
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
