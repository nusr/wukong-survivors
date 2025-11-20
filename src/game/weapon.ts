import Phaser from "phaser";
import { Player } from "./player";
import { Enemy } from "./enemy";
import i18n from "../i18n";
import { scaleManager } from "./ScaleManager";
import type { WeaponType } from "../types";

interface WeaponConfig {
  damage: number;
  cooldown: number;
  type: WeaponType;
}

interface ProjectileSprite extends Phaser.Physics.Arcade.Sprite {
  damage?: number;
  piercing?: number;
  weaponRef?: Weapon;
}

interface OrbData {
  sprite: Phaser.Physics.Arcade.Sprite;
  offset: number;
  damage?: number;
  weaponRef?: any;
}

// Weapon base class
export abstract class Weapon {
  protected scene: Phaser.Scene;
  protected player: Player;
  public level: number;
  public maxLevel: number;
  public damage: number;
  public cooldown: number;
  protected lastFired: number;
  public type: WeaponType;

  static type: WeaponType;

  constructor(scene: Phaser.Scene, player: Player, config: WeaponConfig) {
    this.scene = scene;
    this.player = player;
    this.level = 1;
    this.maxLevel = 5;
    this.damage = config.damage;
    this.cooldown = config.cooldown;
    this.lastFired = 0;
    Weapon.type = config.type;
    this.type = config.type;
  }

  public update(time: number, enemies: Enemy[]): void {
    if (time - this.lastFired >= this.cooldown) {
      this.fire(enemies);
      this.lastFired = time;
    }
  }

  protected abstract fire(enemies: Enemy[]): void;

  public upgrade(): void {
    if (this.level < this.maxLevel) {
      this.level++;
      this.applyUpgrade();
    }
  }

  protected abstract applyUpgrade(): void;
}

// Magic Missile weapon - auto-attack nearest enemy (renamed to Golden Staff)
export class GoldenStaff extends Weapon {
  public projectiles: Phaser.Physics.Arcade.Group;
  private projectileSpeed: number;
  private piercing: number;

  constructor(scene: Phaser.Scene, player: Player) {
    super(scene, player, {
      damage: 15,
      cooldown: 1000,
      type: "golden_staff",
    });
    this.projectiles = scene.physics.add.group();
    this.projectileSpeed = 300;
    this.piercing = 1;
  }

  protected fire(enemies: Enemy[]): void {
    if (enemies.length === 0) return;

    // Find nearest enemy
    const playerPos = this.player.getPosition();
    let nearestEnemy: Enemy | null = null;
    let nearestDistance = Infinity;

    enemies.forEach((enemy) => {
      if (enemy.isDead) return;
      const dx = enemy.sprite.x - playerPos.x;
      const dy = enemy.sprite.y - playerPos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestEnemy = enemy;
      }
    });

    if (!nearestEnemy) return;

    // Fire projectile using loaded texture with responsive scaling
    const projectileSize = scaleManager.getSpriteSize(24);
    const projectile = this.projectiles.create(
      playerPos.x,
      playerPos.y,
      this.type
    ) as ProjectileSprite;
    projectile.setCircle(projectileSize / 2);
    projectile.setDisplaySize(projectileSize, projectileSize);

    // Set projectile direction
    const targetEnemy: Enemy = nearestEnemy; // Type assertion
    const dx = targetEnemy.sprite.x - playerPos.x;
    const dy = targetEnemy.sprite.y - playerPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    projectile.setVelocity(
      (dx / distance) * this.projectileSpeed,
      (dy / distance) * this.projectileSpeed
    );

    projectile.damage = this.damage;
    projectile.piercing = this.piercing;
    projectile.weaponRef = this;

    // Set lifetime
    this.scene.time.delayedCall(2000, () => {
      if (projectile.active) {
        projectile.destroy();
      }
    });
  }

  protected applyUpgrade(): void {
    this.damage += 5;
    this.cooldown = Math.max(300, this.cooldown - 100);
    if (this.level >= 3) {
      this.piercing = 2;
    }
    if (this.level >= 5) {
      this.piercing = 3;
    }
  }
}

export class FireproofCloak extends Weapon {
  public orbs: OrbData[];
  private orbCount: number;
  private radius: number;
  private rotationSpeed: number;
  private angle: number;

  constructor(scene: Phaser.Scene, player: Player) {
    super(scene, player, {
      damage: 8,
      cooldown: 100,
      type: "fireproof_cloak",
    });
    this.orbs = [];
    this.orbCount = 1;
    this.radius = scaleManager.scaleValue(80);
    this.rotationSpeed = 2;
    this.angle = 0;

    this.createOrbs();
  }

  private createOrbs(): void {
    // Clear old orbs
    this.orbs.forEach((orb) => orb.sprite.destroy());
    this.orbs = [];

    // Create new orbs using loaded texture with responsive scaling
    const orbSize = scaleManager.getSpriteSize(32);
    for (let i = 0; i < this.orbCount; i++) {
      const orb = this.scene.physics.add.sprite(0, 0, this.type);
      orb.setCircle(orbSize / 2);
      orb.setDisplaySize(orbSize, orbSize);

      (orb as any).damage = this.damage;
      (orb as any).weaponRef = this;

      this.orbs.push({
        sprite: orb,
        offset: ((Math.PI * 2) / this.orbCount) * i,
      });
    }
  }

  public update(time: number, enemies: Enemy[]): void {
    console.log("update:", time, enemies);
    // Update orb positions
    this.angle += this.rotationSpeed * 0.016; // Assuming 60fps
    const playerPos = this.player.getPosition();

    this.orbs.forEach((orb) => {
      const angle = this.angle + orb.offset;
      orb.sprite.x = playerPos.x + Math.cos(angle) * this.radius;
      orb.sprite.y = playerPos.y + Math.sin(angle) * this.radius;
    });
  }

  protected fire(enemies: Enemy[]): void {
    // Aura doesn't need fire method as it persists continuously
    console.log("fire:", enemies);
  }

  protected applyUpgrade(): void {
    this.damage += 5;
    if (this.level === 2) {
      this.orbCount = 2;
      this.createOrbs();
    } else if (this.level === 3) {
      this.radius = 100;
    } else if (this.level === 4) {
      this.orbCount = 3;
      this.createOrbs();
    } else if (this.level === 5) {
      this.rotationSpeed = 3;
    }
  }

  public getOrbs(): Phaser.Physics.Arcade.Sprite[] {
    return this.orbs.map((orb) => orb.sprite);
  }
}

// Ruyi Staff - Ultimate form of Golden Staff with enhanced power
export class RuyiStaff extends Weapon {
  public projectiles: Phaser.Physics.Arcade.Group;
  private projectileSpeed: number;
  private piercing: number;
  private projectileCount: number;

  constructor(scene: Phaser.Scene, player: Player) {
    super(scene, player, {
      damage: 50,
      cooldown: 800,
      type: "ruyi_staff",
    });
    this.projectiles = scene.physics.add.group();
    this.projectileSpeed = 400;
    this.piercing = 3;
    this.projectileCount = 1;
  }

  protected fire(enemies: Enemy[]): void {
    if (enemies.length === 0) return;

    const playerPos = this.player.getPosition();

    // Fire multiple projectiles
    for (let i = 0; i < this.projectileCount; i++) {
      let nearestEnemy: Enemy | null = null;
      let nearestDistance = Infinity;

      enemies.forEach((enemy) => {
        if (enemy.isDead) return;
        const dx = enemy.sprite.x - playerPos.x;
        const dy = enemy.sprite.y - playerPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestEnemy = enemy;
        }
      });

      if (!nearestEnemy) continue;

      const projectileSize = scaleManager.getSpriteSize(32);
      const projectile = this.projectiles.create(
        playerPos.x,
        playerPos.y,
        this.type
      ) as ProjectileSprite;
      projectile.setCircle(projectileSize / 2);
      projectile.setDisplaySize(projectileSize, projectileSize);

      const targetEnemy: Enemy = nearestEnemy;
      const dx = targetEnemy.sprite.x - playerPos.x;
      const dy = targetEnemy.sprite.y - playerPos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      projectile.setVelocity(
        (dx / distance) * this.projectileSpeed,
        (dy / distance) * this.projectileSpeed
      );

      projectile.damage = this.damage;
      projectile.piercing = this.piercing;
      projectile.weaponRef = this;

      this.scene.time.delayedCall(3000, () => {
        if (projectile.active) projectile.destroy();
      });
    }
  }

  protected applyUpgrade(): void {
    this.damage += 10;
    this.cooldown = Math.max(500, this.cooldown - 50);
    if (this.level >= 3) this.projectileCount = 2;
    if (this.level >= 5) this.piercing = 5;
  }
}

// Fire Lance - Fast piercing spear
export class FireLance extends Weapon {
  public projectiles: Phaser.Physics.Arcade.Group;
  private projectileSpeed: number;
  private piercing: number;

  constructor(scene: Phaser.Scene, player: Player) {
    super(scene, player, {
      damage: 20,
      cooldown: 1200,
      type: "fire_lance",
    });
    this.projectiles = scene.physics.add.group();
    this.projectileSpeed = 500;
    this.piercing = 2;
  }

  protected fire(enemies: Enemy[]): void {
    if (enemies.length === 0) return;

    const playerPos = this.player.getPosition();
    let nearestEnemy: Enemy | null = null;
    let nearestDistance = Infinity;

    enemies.forEach((enemy) => {
      if (enemy.isDead) return;
      const distance = Phaser.Math.Distance.Between(
        playerPos.x,
        playerPos.y,
        enemy.sprite.x,
        enemy.sprite.y
      );
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestEnemy = enemy;
      }
    });

    if (!nearestEnemy) return;

    const projectileSize = scaleManager.getSpriteSize(28);
    const projectile = this.projectiles.create(
      playerPos.x,
      playerPos.y,
      this.type
    ) as ProjectileSprite;
    projectile.setCircle(projectileSize / 2);
    projectile.setDisplaySize(projectileSize, projectileSize);

    const targetEnemy: Enemy = nearestEnemy;
    const angle = Phaser.Math.Angle.Between(
      playerPos.x,
      playerPos.y,
      targetEnemy.sprite.x,
      targetEnemy.sprite.y
    );

    projectile.setVelocity(
      Math.cos(angle) * this.projectileSpeed,
      Math.sin(angle) * this.projectileSpeed
    );
    projectile.setRotation(angle);

    projectile.damage = this.damage;
    projectile.piercing = this.piercing;
    projectile.weaponRef = this;

    this.scene.time.delayedCall(2500, () => {
      if (projectile.active) projectile.destroy();
    });
  }

  protected applyUpgrade(): void {
    this.damage += 6;
    this.cooldown = Math.max(600, this.cooldown - 150);
    if (this.level >= 3) this.piercing = 3;
    if (this.level >= 5) this.projectileSpeed += 100;
  }
}

// Wind Tamer - Area damage pearl
export class WindTamer extends Weapon {
  public orbs: OrbData[];
  private orbCount: number;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  private radius: number;
  private damageRadius: number;

  constructor(scene: Phaser.Scene, player: Player) {
    super(scene, player, {
      damage: 25,
      cooldown: 2000,
      type: "wind_tamer",
    });
    this.orbs = [];
    this.orbCount = 1;
    this.radius = scaleManager.scaleValue(60);
    this.damageRadius = 100;
    this.createOrbs();
  }

  private createOrbs(): void {
    this.orbs.forEach((orb) => orb.sprite.destroy());
    this.orbs = [];

    const orbSize = scaleManager.getSpriteSize(28);
    for (let i = 0; i < this.orbCount; i++) {
      const orb = this.scene.physics.add.sprite(0, 0, this.type);
      orb.setCircle(orbSize / 2);
      orb.setDisplaySize(orbSize, orbSize);
      (orb as any).damage = this.damage;
      (orb as any).weaponRef = this;

      this.orbs.push({
        sprite: orb,
        offset: ((Math.PI * 2) / this.orbCount) * i,
      });
    }
  }

  public update(_time: number, _enemies: Enemy[]): void {
    console.log(_time, _enemies);
    const playerPos = this.player.getPosition();
    this.orbs.forEach((orb) => {
      orb.sprite.x = playerPos.x;
      orb.sprite.y = playerPos.y;
    });
  }

  protected fire(enemies: Enemy[]): void {
    // Wind effect damages all enemies in radius
    const playerPos = this.player.getPosition();
    enemies.forEach((enemy) => {
      if (enemy.isDead) return;
      const distance = Phaser.Math.Distance.Between(
        playerPos.x,
        playerPos.y,
        enemy.sprite.x,
        enemy.sprite.y
      );
      if (distance < this.damageRadius) {
        enemy.takeDamage(this.damage);
      }
    });
  }

  protected applyUpgrade(): void {
    this.damage += 8;
    if (this.level >= 2) this.damageRadius = 120;
    if (this.level >= 3) this.cooldown = 1500;
    if (this.level >= 4) this.damageRadius = 150;
    if (this.level >= 5) this.orbCount = 2;
  }

  public getOrbs(): Phaser.Physics.Arcade.Sprite[] {
    return this.orbs.map((orb) => orb.sprite);
  }
}

// Violet Bell - Sound wave weapon
export class VioletBell extends Weapon {
  private waveCount: number;

  constructor(scene: Phaser.Scene, player: Player) {
    super(scene, player, {
      damage: 30,
      cooldown: 1500,
      type: "violet_bell",
    });
    this.waveCount = 3;
  }

  protected fire(enemies: Enemy[]): void {
    const playerPos = this.player.getPosition();
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
        0.3
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
              enemy.sprite.y
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
    if (this.level >= 3) this.cooldown = 1200;
    if (this.level >= 4) this.waveCount = 5;
    if (this.level >= 5) this.cooldown = 1000;
  }
}

// Twin Blades - Fast dual strike
export class TwinBlades extends Weapon {
  public projectiles: Phaser.Physics.Arcade.Group;
  private projectileSpeed: number;

  constructor(scene: Phaser.Scene, player: Player) {
    super(scene, player, {
      damage: 18,
      cooldown: 800,
      type: "twin_blades",
    });
    this.projectiles = scene.physics.add.group();
    this.projectileSpeed = 450;
  }

  protected fire(enemies: Enemy[]): void {
    if (enemies.length === 0) return;

    const playerPos = this.player.getPosition();
    const targets = enemies.filter((e) => !e.isDead).slice(0, 2);

    targets.forEach((target, index) => {
      const projectileSize = scaleManager.getSpriteSize(24);
      const projectile = this.projectiles.create(
        playerPos.x + (index === 0 ? -10 : 10),
        playerPos.y,
        this.type
      ) as ProjectileSprite;
      projectile.setCircle(projectileSize / 2);
      projectile.setDisplaySize(projectileSize, projectileSize);

      const angle = Phaser.Math.Angle.Between(
        playerPos.x,
        playerPos.y,
        target.sprite.x,
        target.sprite.y
      );

      projectile.setVelocity(
        Math.cos(angle) * this.projectileSpeed,
        Math.sin(angle) * this.projectileSpeed
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
    this.cooldown = Math.max(400, this.cooldown - 100);
    if (this.level >= 5) this.projectileSpeed += 150;
  }
}

// Mace - Heavy damage weapon
export class Mace extends Weapon {
  public projectiles: Phaser.Physics.Arcade.Group;
  private projectileSpeed: number;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  private stunChance: number;

  constructor(scene: Phaser.Scene, player: Player) {
    super(scene, player, {
      damage: 35,
      cooldown: 1800,
      type: "mace",
    });
    this.projectiles = scene.physics.add.group();
    this.projectileSpeed = 250;
    this.stunChance = 0.3;
  }

  protected fire(enemies: Enemy[]): void {
    if (enemies.length === 0) return;

    const playerPos = this.player.getPosition();
    let nearestEnemy: Enemy | null = null;
    let nearestDistance = Infinity;

    enemies.forEach((enemy) => {
      if (enemy.isDead) return;
      const distance = Phaser.Math.Distance.Between(
        playerPos.x,
        playerPos.y,
        enemy.sprite.x,
        enemy.sprite.y
      );
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestEnemy = enemy;
      }
    });

    if (!nearestEnemy) return;

    const projectileSize = scaleManager.getSpriteSize(32);
    const projectile = this.projectiles.create(
      playerPos.x,
      playerPos.y,
      this.type
    ) as ProjectileSprite;
    projectile.setCircle(projectileSize / 2);
    projectile.setDisplaySize(projectileSize, projectileSize);

    const targetEnemy: Enemy = nearestEnemy;
    const angle = Phaser.Math.Angle.Between(
      playerPos.x,
      playerPos.y,
      targetEnemy.sprite.x,
      targetEnemy.sprite.y
    );

    projectile.setVelocity(
      Math.cos(angle) * this.projectileSpeed,
      Math.sin(angle) * this.projectileSpeed
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
    if (this.level >= 3) this.cooldown = 1500;
    if (this.level >= 4) this.stunChance = 0.5;
    if (this.level >= 5) this.damage += 15;
  }
}

// Bull Horns - Charge attack
export class BullHorns extends Weapon {
  private chargeRadius: number;

  constructor(scene: Phaser.Scene, player: Player) {
    super(scene, player, {
      damage: 40,
      cooldown: 2500,
      type: "bull_horns",
    });
    this.chargeRadius = 150;
  }

  protected fire(enemies: Enemy[]): void {
    const playerPos = this.player.getPosition();

    // Create charge effect
    const circle = this.scene.add.circle(
      playerPos.x,
      playerPos.y,
      this.chargeRadius,
      0x8b0000,
      0.3
    );

    enemies.forEach((enemy) => {
      if (enemy.isDead) return;
      const distance = Phaser.Math.Distance.Between(
        playerPos.x,
        playerPos.y,
        enemy.sprite.x,
        enemy.sprite.y
      );
      if (distance < this.chargeRadius) {
        enemy.takeDamage(this.damage);
        // Knockback effect
        const angle = Phaser.Math.Angle.Between(
          playerPos.x,
          playerPos.y,
          enemy.sprite.x,
          enemy.sprite.y
        );
        (enemy.sprite.body as Phaser.Physics.Arcade.Body).setVelocity(
          Math.cos(angle) * 300,
          Math.sin(angle) * 300
        );
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
    if (this.level >= 3) this.cooldown = 2000;
    if (this.level >= 4) this.chargeRadius = 200;
    if (this.level >= 5) this.damage += 20;
  }
}

// Thunder Drum - Lightning strikes
export class ThunderDrum extends Weapon {
  private strikeCount: number;

  constructor(scene: Phaser.Scene, player: Player) {
    super(scene, player, {
      damage: 22,
      cooldown: 1600,
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
        target.sprite.y - 100,
        10,
        100,
        0xffd700,
        0.8
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
    if (this.level >= 3) this.cooldown = 1300;
    if (this.level >= 4) this.strikeCount = 5;
    if (this.level >= 5) this.damage += 10;
  }
}

// Ice Needle - Slowing projectiles
export class IceNeedle extends Weapon {
  public projectiles: Phaser.Physics.Arcade.Group;
  private projectileSpeed: number;
  private projectileCount: number;

  constructor(scene: Phaser.Scene, player: Player) {
    super(scene, player, {
      damage: 16,
      cooldown: 900,
      type: "ice_needle",
    });
    this.projectiles = scene.physics.add.group();
    this.projectileSpeed = 550;
    this.projectileCount = 3;
  }

  protected fire(enemies: Enemy[]): void {
    if (enemies.length === 0) return;

    const playerPos = this.player.getPosition();
    const angleStep = (Math.PI * 2) / this.projectileCount;

    for (let i = 0; i < this.projectileCount; i++) {
      const angle = angleStep * i;
      const projectileSize = scaleManager.getSpriteSize(20);
      const projectile = this.projectiles.create(
        playerPos.x,
        playerPos.y,
        this.type
      ) as ProjectileSprite;
      projectile.setCircle(projectileSize / 2);
      projectile.setDisplaySize(projectileSize, projectileSize);

      projectile.setVelocity(
        Math.cos(angle) * this.projectileSpeed,
        Math.sin(angle) * this.projectileSpeed
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
    if (this.level >= 3) this.cooldown = 700;
    if (this.level >= 4) this.projectileCount = 5;
    if (this.level >= 5) this.projectileSpeed += 100;
  }
}

// Wind Fire Wheels - Dual spinning wheels
export class WindFireWheels extends Weapon {
  public orbs: OrbData[];
  private orbCount: number;
  private radius: number;
  private rotationSpeed: number;
  private angle: number;

  constructor(scene: Phaser.Scene, player: Player) {
    super(scene, player, {
      damage: 28,
      cooldown: 100,
      type: "wind_fire_wheels",
    });
    this.orbs = [];
    this.orbCount = 2;
    this.radius = scaleManager.scaleValue(70);
    this.rotationSpeed = 4;
    this.angle = 0;
    this.createOrbs();
  }

  private createOrbs(): void {
    this.orbs.forEach((orb) => orb.sprite.destroy());
    this.orbs = [];

    const orbSize = scaleManager.getSpriteSize(32);
    for (let i = 0; i < this.orbCount; i++) {
      const orb = this.scene.physics.add.sprite(0, 0, this.type);
      orb.setCircle(orbSize / 2);
      orb.setDisplaySize(orbSize, orbSize);
      (orb as any).damage = this.damage;
      (orb as any).weaponRef = this;

      this.orbs.push({
        sprite: orb,
        offset: ((Math.PI * 2) / this.orbCount) * i,
      });
    }
  }

  public update(_time: number, _enemies: Enemy[]): void {
    console.log(_time, _enemies);
    this.angle += this.rotationSpeed * 0.016;
    const playerPos = this.player.getPosition();

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

  public getOrbs(): Phaser.Physics.Arcade.Sprite[] {
    return this.orbs.map((orb) => orb.sprite);
  }
}

// Jade Purity Bottle - Suction and damage
export class JadePurityBottle extends Weapon {
  private pullRadius: number;
  private pullStrength: number;

  constructor(scene: Phaser.Scene, player: Player) {
    super(scene, player, {
      damage: 32,
      cooldown: 2200,
      type: "jade_purity_bottle",
    });
    this.pullRadius = 200;
    this.pullStrength = 150;
  }

  protected fire(enemies: Enemy[]): void {
    const playerPos = this.player.getPosition();

    // Create bottle effect
    const bottle = this.scene.add.circle(
      playerPos.x,
      playerPos.y,
      30,
      0x7fffd4,
      0.6
    );

    enemies.forEach((enemy) => {
      if (enemy.isDead) return;
      const distance = Phaser.Math.Distance.Between(
        playerPos.x,
        playerPos.y,
        enemy.sprite.x,
        enemy.sprite.y
      );

      if (distance < this.pullRadius) {
        // Pull enemies towards player
        const angle = Phaser.Math.Angle.Between(
          enemy.sprite.x,
          enemy.sprite.y,
          playerPos.x,
          playerPos.y
        );
        (enemy.sprite.body as Phaser.Physics.Arcade.Body).setVelocity(
          Math.cos(angle) * this.pullStrength,
          Math.sin(angle) * this.pullStrength
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
    this.damage += 10;
    if (this.level >= 2) this.pullRadius = 250;
    if (this.level >= 3) this.pullStrength = 200;
    if (this.level >= 4) this.cooldown = 1800;
    if (this.level >= 5) this.damage += 15;
  }
}

// Golden Rope - Binding weapon
export class GoldenRope extends Weapon {
  private bindDuration: number;
  private maxTargets: number;

  constructor(scene: Phaser.Scene, player: Player) {
    super(scene, player, {
      damage: 12,
      cooldown: 1400,
      type: "golden_rope",
    });
    this.bindDuration = 2000;
    this.maxTargets = 2;
  }

  protected fire(enemies: Enemy[]): void {
    if (enemies.length === 0) return;

    const playerPos = this.player.getPosition();
    const targets = enemies
      .filter((e) => !e.isDead)
      .sort(
        (a, b) =>
          Phaser.Math.Distance.Between(
            playerPos.x,
            playerPos.y,
            a.sprite.x,
            a.sprite.y
          ) -
          Phaser.Math.Distance.Between(
            playerPos.x,
            playerPos.y,
            b.sprite.x,
            b.sprite.y
          )
      )
      .slice(0, this.maxTargets);

    targets.forEach((target) => {
      // Rope binding effect
      const rope = this.scene.add.line(
        0,
        0,
        playerPos.x,
        playerPos.y,
        target.sprite.x,
        target.sprite.y,
        0xffd700,
        0.8
      );
      rope.setLineWidth(3);

      // Slow enemy
      const originalSpeed = (target.sprite.body as Phaser.Physics.Arcade.Body)
        .speed;
      (target.sprite.body as Phaser.Physics.Arcade.Body).speed =
        originalSpeed * 0.3;

      target.takeDamage(this.damage);

      this.scene.time.delayedCall(this.bindDuration, () => {
        rope.destroy();
        if (!target.isDead) {
          (target.sprite.body as Phaser.Physics.Arcade.Body).speed =
            originalSpeed;
        }
      });
    });
  }

  protected applyUpgrade(): void {
    this.damage += 4;
    if (this.level >= 2) this.maxTargets = 3;
    if (this.level >= 3) this.bindDuration = 3000;
    if (this.level >= 4) this.maxTargets = 4;
    if (this.level >= 5) this.cooldown = 1000;
  }
}

// Plantain Fan - Wind blast
export class PlantainFan extends Weapon {
  private fanAngle: number;
  private fanRange: number;

  constructor(scene: Phaser.Scene, player: Player) {
    super(scene, player, {
      damage: 45,
      cooldown: 3000,
      type: "plantain_fan",
    });
    this.fanAngle = Math.PI / 3;
    this.fanRange = 250;
  }

  protected fire(enemies: Enemy[]): void {
    const playerPos = this.player.getPosition();

    // Find direction to nearest enemy
    let targetAngle = 0;
    if (enemies.length > 0) {
      const nearest = enemies
        .filter((e) => !e.isDead)
        .sort(
          (a, b) =>
            Phaser.Math.Distance.Between(
              playerPos.x,
              playerPos.y,
              a.sprite.x,
              a.sprite.y
            ) -
            Phaser.Math.Distance.Between(
              playerPos.x,
              playerPos.y,
              b.sprite.x,
              b.sprite.y
            )
        )[0];
      if (nearest) {
        targetAngle = Phaser.Math.Angle.Between(
          playerPos.x,
          playerPos.y,
          nearest.sprite.x,
          nearest.sprite.y
        );
      }
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
      false
    );
    graphics.fillPath();

    enemies.forEach((enemy) => {
      if (enemy.isDead) return;

      const distance = Phaser.Math.Distance.Between(
        playerPos.x,
        playerPos.y,
        enemy.sprite.x,
        enemy.sprite.y
      );
      const angle = Phaser.Math.Angle.Between(
        playerPos.x,
        playerPos.y,
        enemy.sprite.x,
        enemy.sprite.y
      );

      const angleDiff = Math.abs(Phaser.Math.Angle.Wrap(angle - targetAngle));

      if (distance < this.fanRange && angleDiff < this.fanAngle / 2) {
        enemy.takeDamage(this.damage);
        // Knockback
        (enemy.sprite.body as Phaser.Physics.Arcade.Body).setVelocity(
          Math.cos(angle) * 400,
          Math.sin(angle) * 400
        );
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
    if (this.level >= 4) this.cooldown = 2500;
    if (this.level >= 5) this.fanAngle = Math.PI / 2;
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
  | typeof PlantainFan;
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
};

// Weapon Manager
export class WeaponManager {
  private scene: Phaser.Scene;
  private player: Player;
  public weapons: Weapon[];
  private availableWeapons: WeaponClass[];

  constructor(scene: Phaser.Scene, player: Player) {
    this.scene = scene;
    this.player = player;
    this.weapons = [];
    this.availableWeapons = [
      GoldenStaff,
      RuyiStaff,
      FireLance,
      WindTamer,
      VioletBell,
      FireproofCloak,
      TwinBlades,
      Mace,
      BullHorns,
      ThunderDrum,
      IceNeedle,
      WindFireWheels,
      JadePurityBottle,
      GoldenRope,
      PlantainFan,
    ];
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
    this.availableWeapons.forEach((weaponInfo) => {
      if (!this.hasWeapon(weaponInfo)) {
        const type = weaponInfo.type;
        options.push({
          type: "new",
          weaponClass: weaponInfo,
          name: i18n.t(`weapons.${type}.name`),
          description: i18n.t(`weapons.${type}.description`),
        });
      }
    });

    // Randomly select 3 options
    const shuffled = options.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  }

  public clear(): void {
    this.weapons.forEach((weapon) => {
      if ((weapon as any).projectiles) {
        (weapon as any).projectiles.clear(true, true);
      }
      if ((weapon as any).orbs) {
        (weapon as any).orbs.forEach((orb: OrbData) => orb.sprite.destroy());
      }
    });
    this.weapons = [];
  }
}
