import Phaser from "phaser";
import { Player, type WASDKeys } from "./player";
import { EnemySpawner } from "./enemy";
import { WeaponManager, type UpgradeOption } from "./weapon";
import { ExperienceManager } from "./experience";
import { useSaveStore, useAppStore } from "../store";
import {
  PERMANENT_UPGRADES,
  getCharacterImagePath,
  ENEMIES_DATA,
  getEnemyImagePath,
  WEAPONS,
  getWeaponImagePath,
  getMapImagePath,
  GAME_SCENE_KEY,
  EVENT_MAP,
  DEFAULT_GAME_TIME,
  SCREEN_SIZE,
  START_Z_INDEX,
} from "../constant";
import i18n from "../i18n";
import { scaleManager } from "./ScaleManager";
import { RewardSelectionUI } from "./RewardSelectionUI";
import type {
  RewardOption,
  ElixirData,
  CharacterRankType,
  EnemyRank,
  WeaponData,
} from "../types";
import eventBus from "./eventBus";

interface ButtonElement {
  button: Phaser.GameObjects.Rectangle;
  nameText: Phaser.GameObjects.Text;
  descText: Phaser.GameObjects.Text;
}

// Game scene
export class GameScene extends Phaser.Scene {
  private player!: Player;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd?: WASDKeys;
  private enemySpawner?: EnemySpawner;
  private weaponManager?: WeaponManager;
  private experienceManager?: ExperienceManager;
  private rewardUI?: RewardSelectionUI;
  private uiContainer?: Phaser.GameObjects.Container;
  private healthBarBg?: Phaser.GameObjects.Rectangle;
  private healthBar?: Phaser.GameObjects.Rectangle;
  private expBarBg?: Phaser.GameObjects.Rectangle;
  private expBar?: Phaser.GameObjects.Rectangle;
  private levelText?: Phaser.GameObjects.Text;
  private timeText?: Phaser.GameObjects.Text;
  private killText?: Phaser.GameObjects.Text;
  private killsSinceLastReward: number = 0;
  private killsRequiredForReward: number = 10; // Pop reward every 10 kills
  private isPaused: boolean = false;
  private isGameOver: boolean = false;
  private playerDamageCoolDown: number = 0;
  private killCount = 0;
  private gameTime = 0;

  constructor() {
    super({ key: GAME_SCENE_KEY });
  }

  preload(): void {
    // Load experience gem textures - Buddhist beads and spirit essence
    this.load.svg("gem-low", "assets/gem-low.svg", {
      width: 32,
      height: 32,
    });
    this.load.svg("gem-medium", "assets/gem-medium.svg", {
      width: 32,
      height: 32,
    });
    this.load.svg("gem-high", "assets/gem-high.svg", {
      width: 32,
      height: 32,
    });

    const selectedCharacter = useAppStore.getState().getSelectCharacter();

    const characterSize = this.getCharacterSize(selectedCharacter.rank);

    this.load.svg(
      selectedCharacter.id,
      getCharacterImagePath(selectedCharacter.id),
      {
        width: characterSize,
        height: characterSize,
      },
    );

    const selectMap = useAppStore.getState().getSelectMap();

    Object.values(ENEMIES_DATA).forEach((enemy) => {
      if (enemy.chapter === selectMap.id) {
        const size = this.getEnemySize(enemy.rank);
        this.load.svg(enemy.id, getEnemyImagePath(enemy.id), {
          width: size,
          height: size,
        });
      }
    });

    Object.values(WEAPONS).forEach((weapon) => {
      this.load.svg(weapon.id, getWeaponImagePath(weapon.id), {
        width: 32,
        height: 32,
      });
    });

    this.load.svg(selectMap.id, getMapImagePath(selectMap.id), SCREEN_SIZE);
  }

  // 获取角色尺寸
  private getCharacterSize(rank: CharacterRankType): number {
    switch (rank) {
      case "hero":
        return 48;
      case "king":
        return 56;
      case "lord":
        return 44;
      case "boss":
        return 64;
      default:
        return 48;
    }
  }

  // 获取敌人尺寸
  private getEnemySize(rank: EnemyRank): number {
    switch (rank) {
      case "minion":
        return 32;
      case "elite":
        return 40;
      default:
        return 32;
    }
  }

  public create(): void {
    eventBus.on(EVENT_MAP.SHOW_END_GAME_MODAL, () => {
      this.endGame();
    });

    // Set world bounds
    this.physics.world.setBounds(-2000, -2000, 4000, 4000);

    // Create background
    this.createBackground();

    // Get selected character
    const character = useAppStore.getState().getSelectCharacter();

    // Create player and apply character attributes and permanent upgrades
    this.player = new Player(this, 0, 0, character.id);

    // Apply character base attributes
    this.player.maxHealth = character.stats.baseHealth;
    this.player.health = character.stats.baseHealth;
    this.player.speed = character.stats.baseSpeed;

    // Apply permanent upgrades
    const state = useSaveStore.getState();
    PERMANENT_UPGRADES.forEach((upgrade) => {
      const level = state[upgrade.id] || 0;
      if (level > 0) {
        const effect = upgrade.effect(level);
        switch (upgrade.id) {
          case "attack":
            // Weapon damage will be applied when weapon is created
            break;
          case "health":
            this.player.maxHealth += effect;
            this.player.health += effect;
            break;
          case "armor":
            // Armor will be calculated when taking damage
            break;
          case "luck":
            // Luck will affect drops
            break;
          case "speed":
            this.player.speed += effect;
            break;
        }
      }
    });

    // Input controls
    const cursors = this.input.keyboard?.createCursorKeys();
    if (cursors) {
      this.cursors = cursors;
    }
    this.wasd = {
      w: this.input.keyboard?.addKey("W"),
      a: this.input.keyboard?.addKey("A"),
      s: this.input.keyboard?.addKey("S"),
      d: this.input.keyboard?.addKey("D"),
    };

    // Get selected map and its available enemies
    const selectedMap = useAppStore.getState().getSelectMap();

    // Create enemy spawner with available enemies from selected map
    this.enemySpawner = new EnemySpawner(this, selectedMap.availableEnemies);

    // Create weapon manager
    this.weaponManager = new WeaponManager(this, this.player);

    // Add character's starting weapon
    const startingWeaponId = character.startingWeapon;

    // Get weapon class, default to GoldenStaff if weapon not implemented yet
    const StartingWeaponClass =
      this.weaponManager.getWeaponById(startingWeaponId);
    this.weaponManager.addWeapon(StartingWeaponClass);

    // Save starting weapon to owned weapons if not already there
    if (!useSaveStore.getState().ownedWeapons.includes(startingWeaponId)) {
      useSaveStore.getState().addWeapon(startingWeaponId);
    }

    // Create experience manager
    this.experienceManager = new ExperienceManager(this, this.player);

    // Create reward UI
    this.rewardUI = new RewardSelectionUI(this);

    // Create UI
    this.createUI();

    // Game state
    this.gameTime = DEFAULT_GAME_TIME;
    this.isPaused = false;
    this.isGameOver = false;

    // Player damage cool down
    this.playerDamageCoolDown = 0;

    // Handle window resize
    this.scale.on("resize", this.handleResize, this);
  }

  private handleResize(gameSize: Phaser.Structs.Size): void {
    const width = gameSize.width;

    // Update scale manager
    scaleManager.updateScale();

    // Update camera bounds
    this.cameras.main.setBounds(-2000, -2000, 4000, 4000);

    // Update UI positions and sizes
    this.updateUILayout(width);
  }

  private updateUILayout(width: number): void {
    if (!this.timeText || !this.killText) return;

    const padding = scaleManager.getUIElementSize(20);
    const barWidth = scaleManager.getUIElementSize(200);
    const barHeight = scaleManager.getUIElementSize(20);
    const expBarHeight = scaleManager.getUIElementSize(15);

    // Update health bar
    if (this.healthBarBg && this.healthBar) {
      this.healthBarBg.setPosition(padding, padding);
      this.healthBarBg.setSize(barWidth, barHeight);
      this.healthBar.setPosition(padding, padding);
      this.healthBar.height = barHeight;
    }

    // Update experience bar
    if (this.expBarBg && this.expBar) {
      this.expBarBg.setPosition(padding, padding + barHeight + 5);
      this.expBarBg.setSize(barWidth, expBarHeight);
      this.expBar.setPosition(padding, padding + barHeight + 5);
      this.expBar.height = expBarHeight;
    }

    // Update level text
    if (this.levelText) {
      this.levelText.setPosition(padding + barWidth + 10, padding);
      this.levelText.setFontSize(scaleManager.getFontSize(24));
    }

    // Center the time text at the top
    this.timeText.setPosition(width / 2, padding);
    this.timeText.setFontSize(scaleManager.getFontSize(24));

    // Center the kill count
    this.killText.setPosition(width / 2, padding + barHeight + 10);
    this.killText.setFontSize(scaleManager.getFontSize(18));
  }

  private createBackground(): void {
    // Load and display chapter map background
    const selectedMap = useAppStore.getState().getSelectMap();

    // Add the map image as background
    const mapImage = this.add.image(0, 0, selectedMap.id);
    mapImage.setOrigin(0.5, 0.5);
    mapImage.setDepth(-2);

    // Scale the map to cover the world bounds
    const scaleX = 4000 / 1280;
    const scaleY = 4000 / 720;
    mapImage.setScale(Math.max(scaleX, scaleY));

    // Add a semi-transparent overlay grid for gameplay clarity
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x333333, 0.2);

    const gridSize = 50;
    for (let x = -2000; x <= 2000; x += gridSize) {
      graphics.moveTo(x, -2000);
      graphics.lineTo(x, 2000);
    }
    for (let y = -2000; y <= 2000; y += gridSize) {
      graphics.moveTo(-2000, y);
      graphics.lineTo(2000, y);
    }
    graphics.strokePath();
    graphics.setDepth(-1);
  }

  private createUI(): void {
    // UI container (fixed on screen)
    this.uiContainer = this.add
      .container(0, 0)
      .setScrollFactor(0)
      .setDepth(scaleManager.getZIndex());

    // Responsive UI sizing
    const barWidth = scaleManager.getUIElementSize(200);
    const barHeight = scaleManager.getUIElementSize(20);
    const expBarHeight = scaleManager.getUIElementSize(15);
    const padding = scaleManager.getUIElementSize(20);

    // Health bar
    this.healthBarBg = this.add.rectangle(
      padding,
      padding,
      barWidth,
      barHeight,
      0x000000,
      0.7,
    );
    this.healthBarBg.setOrigin(0, 0);
    this.healthBar = this.add.rectangle(
      padding,
      padding,
      barWidth,
      barHeight,
      0xff0000,
    );
    this.healthBar.setOrigin(0, 0);

    // Experience bar
    this.expBarBg = this.add.rectangle(
      padding,
      padding + barHeight + 5,
      barWidth,
      expBarHeight,
      0x000000,
      0.7,
    );
    this.expBarBg.setOrigin(0, 0);
    this.expBar = this.add.rectangle(
      padding,
      padding + barHeight + 5,
      barWidth,
      expBarHeight,
      0x00ff00,
    );
    this.expBar.setOrigin(0, 0);

    // Level text
    this.levelText = this.add.text(
      padding + barWidth + 10,
      padding,
      i18n.t("game.level", { level: 1 }),
      {
        fontSize: scaleManager.getFontSize(24),
        color: "#ffffff",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 3,
      },
    );

    // Time text (centered at top) - Countdown from 30 minutes
    const centerX = this.cameras.main.width / 2;
    this.timeText = this.add.text(centerX, padding, "00:00", {
      fontSize: scaleManager.getFontSize(24),
      color: "#ffffff",
      fontStyle: "bold",
      stroke: "#000000",
      strokeThickness: 3,
    });
    this.timeText.setOrigin(0.5, 0);

    // Kill count
    this.killText = this.add.text(
      centerX,
      padding + barHeight + 10,
      `${i18n.t("stats.kills")}: 0`,
      {
        fontSize: scaleManager.getFontSize(18),
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 2,
      },
    );
    this.killText.setOrigin(0.5, 0);
    this.killCount = 0;

    const buttonHeight = scaleManager.getUIElementSize(40);
    const buttonWidth = scaleManager.getUIElementSize(60);

    const x = this.cameras.main.width - padding - buttonWidth / 2;
    const y = padding + buttonHeight / 2;

    // Back to menu button
    const menuButton = this.add
      .rectangle(x, y, buttonWidth, buttonHeight, 0x333333, 0.7)
      .setStrokeStyle(3, 0xffffff)
      .setInteractive({ useHandCursor: true })
      .setScrollFactor(0)
      .setDepth(scaleManager.getZIndex());

    this.add
      .text(x, y, "X", {
        fontSize: scaleManager.getFontSize(24),
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(scaleManager.getZIndex());

    menuButton.on("pointerover", () => {
      menuButton.setFillStyle(0x555555);
    });

    menuButton.on("pointerout", () => {
      menuButton.setFillStyle(0x333333);
    });

    menuButton.on("pointerdown", () => {
      this.endGame();
    });

    this.uiContainer.add([
      this.healthBarBg,
      this.healthBar,
      this.expBarBg,
      this.expBar,
      this.levelText,
      this.timeText,
      this.killText,
      menuButton,
    ]);
  }

  private endGame(): void {
    // Save game data
    useSaveStore.getState().addKills(this.killCount);
    useSaveStore.getState().updatePlayTime(DEFAULT_GAME_TIME - this.gameTime);

    this.showModal({
      title: i18n.t("game.endGame"),
      titleColor: "#ff0000",
      description: i18n.t("game.endGameTitle"),
      cancelText: i18n.t("shop.cancel"),
      onCancel: () => {
        this.resume();
      },
      okText: i18n.t("game.endGame"),
      onOk: () => {
        eventBus.emit(EVENT_MAP.BACK_TO_HOME);
      },
    });
  }

  private updateUI(): void {
    // Update health bar
    const healthPercent = this.player.health / this.player.maxHealth;
    const barWidth = scaleManager.getUIElementSize(200);
    if (this.healthBar) {
      this.healthBar.width = barWidth * healthPercent;
    }

    // Update experience bar
    const expPercent =
      this.player.experience / this.player.experienceToNextLevel;

    if (this.expBar) {
      this.expBar.width = barWidth * expPercent;
    }

    // Update level
    this.levelText?.setText(
      i18n.t("game.level", { level: this.player?.level }),
    );

    // Update time

    const minutes = Math.floor(this.gameTime / 60);
    const seconds = Math.floor(this.gameTime % 60);
    this.timeText?.setText(
      `${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`,
    );

    // Change color based on remaining time
    if (this.gameTime < 60) {
      this.timeText?.setColor("#ff0000"); // Red when less than 1 minute
    } else if (this.gameTime < 300) {
      this.timeText?.setColor("#ffff00"); // Yellow when less than 5 minutes
    } else {
      this.timeText?.setColor("#ffffff"); // White otherwise
    }

    // Update kill count
    this.killText?.setText(`${i18n.t("stats.kills")}: ${this.killCount}`);
  }

  public update(time: number, delta: number): void {
    if (this.isPaused || this.isGameOver) return;

    // Update game time (countdown)

    this.gameTime -= delta / 1000;

    // Check for victory when time runs out
    if (this.gameTime <= 0) {
      this.showVictory();
      return;
    }

    // Update player
    this.player.update(this.cursors, this.wasd);

    // Update enemies
    const playerPos = this.player.getPosition();
    this.enemySpawner?.update(time, delta, playerPos);

    // Update weapons
    const enemies = this.enemySpawner?.getEnemies() || [];
    this.weaponManager?.update(time, enemies);

    // Update experience
    this.experienceManager?.update();

    // Collision detection
    this.checkCollisions(delta);

    // Update UI
    this.updateUI();
  }

  private checkCollisions(delta: number): void {
    const enemies = this.enemySpawner?.getEnemies() || [];

    // Player and enemy collision
    this.playerDamageCoolDown = Math.max(0, this.playerDamageCoolDown - delta);

    enemies.forEach((enemy) => {
      if (enemy.isDead) return;

      const distance = Phaser.Math.Distance.Between(
        this.player.sprite.x,
        this.player.sprite.y,
        enemy.sprite.x,
        enemy.sprite.y,
      );

      if (distance < 30 && this.playerDamageCoolDown <= 0) {
        this.player.takeDamage(enemy.damage);
        this.playerDamageCoolDown = 500; // 0.5 seconds of invincibility
      }
    });

    // Weapon and enemy collision
    this.weaponManager?.weapons.forEach((weapon) => {
      // Magic missile collision

      weapon.projectiles?.children.entries.forEach((projectile: any) => {
        if (!projectile.active) return;

        enemies.forEach((enemy) => {
          if (enemy.isDead) return;

          const distance = Phaser.Math.Distance.Between(
            projectile.x,
            projectile.y,
            enemy.sprite.x,
            enemy.sprite.y,
          );

          if (distance < 20) {
            const killed = enemy.takeDamage(projectile.damage);
            if (killed) {
              this.killCount++;
              this.killsSinceLastReward++;
              this.checkRewardTrigger();
              // Drop gold coin (10% chance)
              if (Math.random() < 0.1) {
                this.spawnGoldCoin(enemy.sprite.x, enemy.sprite.y);
              }
            }

            projectile.piercing--;
            if (projectile.piercing <= 0) {
              projectile.destroy();
            }
          }
        });
      });

      // Holy Aura collision

      weapon.orbs.forEach(({ sprite: orb }) => {
        enemies.forEach((enemy) => {
          if (enemy.isDead) return;

          const distance = Phaser.Math.Distance.Between(
            orb.x,
            orb.y,
            enemy.sprite.x,
            enemy.sprite.y,
          );

          if (distance < 25 && typeof orb.damage === "number") {
            const killed = enemy.takeDamage(orb.damage);
            if (killed) {
              this.killCount++;
              this.killsSinceLastReward++;
              this.checkRewardTrigger();
              // Drop gold coin (10% chance)
              if (Math.random() < 0.1) {
                this.spawnGoldCoin(enemy.sprite.x, enemy.sprite.y);
              }
            }
          }
        });
      });
    });
  }

  private spawnGoldCoin(x: number, y: number): void {
    const coin = this.add.circle(x, y, 8, 0xffd700).setDepth(START_Z_INDEX);
    this.physics.add.existing(coin);

    // Coin automatically flies towards player
    this.time.addEvent({
      delay: 100,
      callback: () => {
        const dx = this.player.sprite.x - coin.x;
        const dy = this.player.sprite.y - coin.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 50) {
          coin.destroy();
          useSaveStore.getState().addGold(1);
        } else if (distance < 300) {
          const speed = 200;
          if (coin.body && "setVelocity" in coin.body) {
            coin.body.setVelocity(
              (dx / distance) * speed,
              (dy / distance) * speed,
            );
          }
        }
      },
      loop: true,
    });
  }

  public spawnExperience(x: number, y: number, value: number): void {
    this.experienceManager?.spawnGem(x, y, value);
  }

  private checkRewardTrigger(): void {
    if (this.killsSinceLastReward >= this.killsRequiredForReward) {
      this.killsSinceLastReward = 0;
      // Increase required kills for next reward to make game more challenging
      this.killsRequiredForReward = Math.min(
        30,
        this.killsRequiredForReward + 2,
      );
      this.showRewardSelection();
    }
  }

  public pause() {
    this.isPaused = true;
    this.physics.pause();
  }

  public resume() {
    this.isPaused = false;
    this.physics.resume();
  }

  private showRewardSelection(): void {
    if (this.rewardUI?.isVisible() || this.isPaused) return;
    this.pause();

    this.rewardUI?.show((option: RewardOption) => {
      this.handleRewardSelection(option);
      this.resume();
    });
  }

  private handleRewardSelection(option: RewardOption): void {
    console.log("handleRewardSelection:", option);
    if (option.type === "weapon") {
      const weaponData = option.data as WeaponData;

      const WeaponClass = this.weaponManager?.getWeaponById(weaponData.id);
      if (!WeaponClass) {
        return;
      }

      // Add weapon to manager if not already owned
      if (!this.weaponManager?.hasWeapon(WeaponClass)) {
        this.weaponManager?.addWeapon(WeaponClass);
        // Save to store
        useSaveStore.getState().addWeapon(weaponData.id);
      } else {
        // If already owned, upgrade it
        const weapon = this.weaponManager?.getWeapon(WeaponClass);
        if (weapon && weapon.level < weapon.maxLevel) {
          weapon.upgrade();
        }
      }

      return;
    }

    if (option.type === "elixir") {
      // Apply elixir effects
      const elixir = option.data as ElixirData;

      switch (elixir.effect.type) {
        case "health":
          if (elixir.id === "jade_dew") {
            // Jade Dew: Restore health
            this.player.health = Math.min(
              this.player.maxHealth,
              this.player.health + this.player.maxHealth * elixir.effect.value,
            );
          } else {
            // Peach of Immortality: Increase max health
            this.player.maxHealth += elixir.effect.value;
            this.player.health += elixir.effect.value;
          }
          break;
        case "damage":
          // Golden Elixir: Increase attack power
          this.weaponManager?.weapons.forEach((weapon) => {
            weapon.damage *= 1 + elixir.effect.value;
          });
          break;
        case "armor":
          // Tiger Bone Wine/Dragon Scale: Increase armor
          this.player.armor += elixir.effect.value;
          break;
        case "speed":
          // Phoenix Feather: Increase movement speed
          this.player.speed += elixir.effect.value;
          break;
        case "exp":
          // Spirit Mushroom: Increase experience gain
          this.player.expBonus += elixir.effect.value;
          break;
        case "crit":
          // Soul Bead: Increase critical rate
          this.player.critRate += elixir.effect.value;
          break;
        case "all":
          // Inner Elixir: Increase all stats
          this.player.maxHealth += this.player.maxHealth * elixir.effect.value;
          this.player.health += this.player.maxHealth * elixir.effect.value;
          this.player.speed += this.player.speed * elixir.effect.value;
          this.weaponManager?.weapons.forEach((weapon) => {
            weapon.damage *= 1 + elixir.effect.value;
          });
          break;
        case "revive":
          // Resurrection Pill: Revive upon death
          this.player.hasRevive = true;
          break;
      }
    }
  }

  public showLevelUpMenu(): void {
    if (this.isPaused) {
      return;
    }
    this.pause();
    const startDepth = scaleManager.getZIndex();
    const textDepth = scaleManager.getZIndex();
    const endDepth = scaleManager.getZIndex();

    // Create level up menu
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    // Semi-transparent background
    const overlay = this.add
      .rectangle(
        centerX,
        centerY,
        this.cameras.main.width,
        this.cameras.main.height,
        0x000000,
        0.8,
      )
      .setScrollFactor(0)
      .setDepth(startDepth);

    // Title
    const title = this.add
      .text(centerX, centerY - 150, i18n.t("game.levelUp"), {
        fontSize: scaleManager.getFontSize(48),
        color: "#ffff00",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(textDepth);

    // Get upgrade options
    const options = this.weaponManager?.getUpgradeOptions() || [];

    // Create option buttons
    const buttons: ButtonElement[] = [];
    options.forEach((option, index) => {
      const y = centerY - 50 + index * 100;

      const button = this.add
        .rectangle(centerX, y, 500, 80, 0x333333)
        .setStrokeStyle(3, 0xffffff)
        .setInteractive({ useHandCursor: true })
        .setScrollFactor(0)
        .setDepth(textDepth);

      const nameText = this.add
        .text(centerX, y - 15, option.name, {
          fontSize: scaleManager.getFontSize(24),
          color: "#ffffff",
          fontStyle: "bold",
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(endDepth);

      const descText = this.add
        .text(centerX, y + 15, option.description, {
          fontSize: scaleManager.getFontSize(14),
          color: "#cccccc",
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(endDepth);

      button.on("pointerover", () => {
        button.setFillStyle(0x555555);
      });

      button.on("pointerout", () => {
        button.setFillStyle(0x333333);
      });

      button.on("pointerdown", () => {
        this.selectUpgrade(option);
        // Clear menu
        overlay.destroy();
        title.destroy();
        buttons.forEach((btn) => {
          btn.button.destroy();
          btn.nameText.destroy();
          btn.descText.destroy();
        });
      });

      buttons.push({ button, nameText, descText });
    });
  }

  public selectUpgrade(option: UpgradeOption): void {
    if (option.type === "upgrade" && option.weapon) {
      option.weapon.upgrade();
    } else if (option.type === "new" && option.weaponClass) {
      this.weaponManager?.addWeapon(option.weaponClass);
    }

    this.resume();
  }

  private showModal({
    title,
    titleColor,
    description,
    cancelText,
    onCancel,
    okText,
    onOk,
  }: {
    title: string;
    titleColor: string;
    description?: string;
    cancelText: string;
    onCancel: () => void;
    okText: string;
    onOk: () => void;
  }) {
    const result: Array<
      Phaser.GameObjects.Text | Phaser.GameObjects.Rectangle
    > = [];

    if (this.isPaused) {
      return result;
    }

    this.pause();

    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    const startDepth = scaleManager.getZIndex();
    const textDepth = scaleManager.getZIndex();
    const endDepth = scaleManager.getZIndex();

    const container = this.add
      .rectangle(
        centerX,
        centerY,
        this.cameras.main.width,
        this.cameras.main.height,
        0x000000,
        0.9,
      )
      .setScrollFactor(0)
      .setDepth(startDepth);

    result.push(container);

    const titleText = this.add
      .text(centerX, centerY - 100, title, {
        fontSize: scaleManager.getFontSize(64),
        color: titleColor,
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 6,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(textDepth);

    result.push(titleText);

    if (description) {
      const descText = this.add
        .text(centerX, centerY, description, {
          fontSize: scaleManager.getFontSize(28),
          color: "#ffffff",
          align: "center",
          stroke: "#000000",
          strokeThickness: 3,
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(textDepth);
      result.push(descText);
    }

    const okButton = this.add
      .rectangle(centerX - 110, centerY + 120, 180, 60, 0x333333)
      .setStrokeStyle(3, 0xffffff)
      .setInteractive({ useHandCursor: true })
      .setScrollFactor(0)
      .setDepth(textDepth);

    result.push(okButton);

    const okObj = this.add
      .text(centerX - 110, centerY + 120, okText, {
        fontSize: scaleManager.getFontSize(20),
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(endDepth);

    result.push(okObj);

    okButton.on("pointerover", () => {
      okButton.setFillStyle(0x555555);
    });

    okButton.on("pointerout", () => {
      okButton.setFillStyle(0x333333);
    });

    okButton.on("pointerdown", () => {
      onOk();
    });

    const cancelButton = this.add
      .rectangle(centerX + 110, centerY + 120, 180, 60, 0x333333)
      .setStrokeStyle(3, 0xffffff)
      .setInteractive({ useHandCursor: true })
      .setScrollFactor(0)
      .setDepth(textDepth);

    result.push(cancelButton);

    const cancelTextObj = this.add
      .text(centerX + 110, centerY + 120, cancelText, {
        fontSize: scaleManager.getFontSize(20),
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(endDepth);

    result.push(cancelTextObj);

    cancelButton.on("pointerover", () => {
      cancelButton.setFillStyle(0x555555);
    });

    cancelButton.on("pointerout", () => {
      cancelButton.setFillStyle(0x333333);
    });

    cancelButton.on("pointerdown", () => {
      result.forEach((item) => {
        item.destroy();
      });
      onCancel();
    });

    return result;
  }

  public showVictory(): void {
    if (this.isGameOver) return;
    this.isGameOver = true;

    // Save game data
    useSaveStore.getState().addKills(this.killCount);
    useSaveStore.getState().updatePlayTime(DEFAULT_GAME_TIME - this.gameTime);

    // Complete the chapter and unlock characters
    const selectedMap = useAppStore.getState().getSelectMap();
    useSaveStore.getState().completeChapter(selectedMap.id);

    const desc = `${i18n.t("stats.kills")}: ${this.killCount}\n${i18n.t(
      "stats.level",
    )}: ${this.player.level}`;

    this.showModal({
      title: i18n.t("game.chapterComplete"),
      titleColor: "#00ff00",
      description: desc,
      cancelText: i18n.t("game.backToHome"),
      onCancel: () => {
        eventBus.emit(EVENT_MAP.BACK_TO_HOME);
      },
      okText: i18n.t("game.restart"),
      onOk: () => {
        this.scene.restart();
      },
    });
  }

  public gameOver(): void {
    if (this.isGameOver) return;
    this.isGameOver = true;

    // Save game data
    useSaveStore.getState().addKills(this.killCount);
    useSaveStore.getState().updatePlayTime(DEFAULT_GAME_TIME - this.gameTime);

    const minutes = Math.floor(this.gameTime / 60);
    const seconds = Math.floor(this.gameTime % 60);
    const timeStr = `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;

    const desc = `${i18n.t("stats.survivalTime")}: ${timeStr}\n${i18n.t(
      "stats.kills",
    )}: ${this.killCount}\n${i18n.t("stats.level")}: ${this.player.level}`;

    this.showModal({
      title: i18n.t("game.gameOver"),
      titleColor: "#ff0000",
      description: desc,
      cancelText: i18n.t("game.backToHome"),
      onCancel: () => {
        eventBus.emit(EVENT_MAP.BACK_TO_HOME);
      },
      okText: i18n.t("game.restart"),
      onOk: () => {
        this.scene.restart();
      },
    });
  }
}
