import Phaser from "phaser";
import { Player, type WASDKeys } from "./player";
import { EnemySpawner } from "./enemy";
import { WeaponManager, type UpgradeOption } from "./weapon";
import { ExperienceManager } from "./experience";
import { AudioManager, SoundEffect } from "./AudioManager";
import { VirtualJoystick } from "./VirtualJoystick";
import { useSaveStore, useAppStore } from "../store";
import {
  ENEMIES_DATA,
  WEAPONS,
  EVENT_MAP,
  PERMANENT_UPGRADES,
  GEM_MAP,
  WORLD_SIZE,
  CHARACTER_SIZE,
  ENEMY_SIZE,
  DEFAULT_SPRITE_SIZE,
} from "../constant";
import {
  getCharacterImagePath,
  getEnemyImagePath,
  getWeaponImagePath,
  getMapImagePath,
} from "../util";
import i18n from "../i18n";
import { scaleManager } from "./ScaleManager";
import { RewardSelectionUI } from "./RewardSelectionUI";
import type { RewardOption, ElixirData, WeaponData } from "../types";
import eventBus from "./eventBus";
import { formatTime } from "../util";
import type { ProjectileSprite } from "./weapon";

const GOLD_DROP_PERCENTAGE = 0.1;

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
  private audioManager?: AudioManager;
  private uiContainer?: Phaser.GameObjects.Container;
  private healthBarBg?: Phaser.GameObjects.Rectangle;
  private healthBar?: Phaser.GameObjects.Rectangle;
  private expBarBg?: Phaser.GameObjects.Rectangle;
  private expBar?: Phaser.GameObjects.Rectangle;
  private levelText?: Phaser.GameObjects.Text;
  private timeText?: Phaser.GameObjects.Text;
  private goldText?: Phaser.GameObjects.Text;
  private closeButton?: Phaser.GameObjects.Rectangle;
  private closeButtonText?: Phaser.GameObjects.Text;
  private killsSinceLastReward: number = 0;
  private killsRequiredForReward: number = 10; // Pop reward every 10 kills
  private isPaused: boolean = false;
  private isGameOver: boolean = false;
  private playerDamageCoolDown: number = 0;
  private killCount = 0;
  private gameTime = 0;
  private virtualJoystick?: VirtualJoystick;
  private isTouchDevice: boolean = false;

  constructor() {
    super({ key: "GameScene" });
  }

  public getPlayTime() {
    return Math.floor(useSaveStore.getState().gameTime - this.gameTime);
  }

  public playPlayerFireSound = () => {
    this.audioManager?.playSfx(SoundEffect.PLAYER_FIRE);
  };

  public getPlayerPosition() {
    return {
      x: this.player.sprite.x,
      y: this.player.sprite.y,
    };
  }

  preload(): void {
    // Load audio assets
    AudioManager.preloadAudio(this);

    const commonSize = scaleManager.scaleValue(DEFAULT_SPRITE_SIZE);

    // Load experience gem textures - Buddhist beads and spirit essence
    Object.values(GEM_MAP).forEach((gem) => {
      this.load.svg(gem, `assets/${gem}.svg`, {
        width: commonSize,
        height: commonSize,
      });
    });

    const selectedCharacter = useAppStore.getState().getSelectCharacter();

    const characterSize = scaleManager.scaleValue(
      CHARACTER_SIZE[selectedCharacter.rank],
    );

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
        const size = scaleManager.scaleValue(ENEMY_SIZE[enemy.rank]);
        this.load.svg(enemy.id, getEnemyImagePath(enemy.id), {
          width: size,
          height: size,
        });
      }
    });

    Object.values(WEAPONS).forEach((weapon) => {
      this.load.svg(weapon.id, getWeaponImagePath(weapon.id), {
        width: commonSize,
        height: commonSize,
      });
    });

    const worldSize = scaleManager.scaleValue(WORLD_SIZE);

    this.load.svg(selectMap.id, getMapImagePath(selectMap.id), {
      width: worldSize,
      height: worldSize,
    });
  }

  public create(): void {
    // Initialize audio manager
    this.audioManager = new AudioManager(this);

    eventBus.on(EVENT_MAP.SHOW_END_GAME_MODAL, () => {
      this.endGame();
    });

    const worldSize = scaleManager.scaleValue(WORLD_SIZE);

    const worldX = Math.floor(worldSize / 2);

    // Set world bounds
    this.physics.world.setBounds(-worldX, -worldX, worldSize, worldSize);

    // Load and display chapter map background
    const selectedMap = useAppStore.getState().getSelectMap();

    // Add the map image as background
    const mapImage = this.add.image(0, 0, selectedMap.id);
    mapImage.setOrigin(0.5, 0.5);
    mapImage.setDepth(-2);

    // Get selected character
    const character = useAppStore.getState().getSelectCharacter();

    // Create player and apply character attributes and permanent upgrades
    this.player = new Player(this, 0, 0, character.id);

    // Apply character base attributes
    this.player.maxHealth = character.stats.baseHealth;
    this.player.health = character.stats.baseHealth;
    this.player.speed = character.stats.baseSpeed;
    this.player.luck = character.stats.baseLuck;
    this.player.armor = character.stats.baseArmor;
    this.player.attack = character.stats.baseDamage;

    // Apply permanent upgrades
    const state = useSaveStore.getState();
    PERMANENT_UPGRADES.forEach((upgrade) => {
      const level = state[upgrade.id] || 0;
      if (level > 0) {
        const effect = upgrade.effect(level);
        this.player.upgrade(upgrade.id, effect, effect);
      }
    });

    // Detect touch device
    this.isTouchDevice = this.sys.game.device.input.touch;

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

    // Initialize virtual joystick for touch devices
    if (this.isTouchDevice) {
      const padding = scaleManager.UIScaleValue(20);
      const joystickRadius = scaleManager.UIScaleValue(60);
      this.virtualJoystick = new VirtualJoystick(
        this,
        padding + joystickRadius,
        this.cameras.main.height - padding - joystickRadius,
      );
      this.virtualJoystick.show();
    }

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

    useAppStore.getState().addWeapon(startingWeaponId);

    // Create experience manager
    this.experienceManager = new ExperienceManager(this, this.player);

    // Create reward UI
    this.rewardUI = new RewardSelectionUI(this);

    // Create UI
    this.createUI();

    // Game state
    this.gameTime = useSaveStore.getState().gameTime;
    this.isPaused = false;
    this.isGameOver = false;

    // Player damage cool down
    this.playerDamageCoolDown = 0;

    // Handle window resize
    this.scale.on("resize", this.handleResize, this);
  }

  private handleResize(gameSize: Phaser.Structs.Size): void {
    const width = gameSize.width;
    const height = gameSize.height;

    // Update scale manager
    scaleManager.updateScale();

    // Update camera bounds
    const worldSize = scaleManager.scaleValue(WORLD_SIZE);
    const worldX = Math.floor(worldSize / 2);
    this.cameras.main.setBounds(-worldX, -worldX, worldSize, worldSize);
    this.cameras.main.setZoom(scaleManager.getCameraZoom());

    // Update UI positions and sizes
    this.updateUILayout(width);

    // Update virtual joystick position and size
    if (this.virtualJoystick && this.isTouchDevice) {
      this.virtualJoystick.updateSize();
      const padding = scaleManager.UIScaleValue(20);
      const joystickRadius = scaleManager.UIScaleValue(60);
      this.virtualJoystick.setPosition(
        padding + joystickRadius,
        height - padding - joystickRadius,
      );
    }
  }

  private updateUILayout(width: number): void {
    const padding = scaleManager.UIScaleValue(20);
    const barWidth = scaleManager.UIScaleValue(200);
    const barHeight = scaleManager.UIScaleValue(20);
    const expBarHeight = scaleManager.UIScaleValue(15);

    // Update health bar
    if (this.healthBarBg && this.healthBar) {
      this.healthBarBg.setPosition(padding, padding);
      this.healthBarBg.setSize(barWidth, barHeight);
      this.healthBar.setPosition(padding, padding);
      this.healthBar.height = barHeight;
    }

    // Update experience bar
    if (this.expBarBg && this.expBar) {
      this.expBarBg.setPosition(
        padding,
        padding + barHeight + scaleManager.UIScaleValue(5),
      );
      this.expBarBg.setSize(barWidth, expBarHeight);
      this.expBar.setPosition(
        padding,
        padding + barHeight + scaleManager.UIScaleValue(5),
      );
      this.expBar.height = expBarHeight;
    }

    // Update level text
    if (this.levelText) {
      this.levelText.setPosition(
        padding + barWidth + scaleManager.UIScaleValue(10),
        padding,
      );
      this.levelText.setFontSize(scaleManager.getNameSize());
    }

    const timeX = scaleManager.isMobile()
      ? width - padding - scaleManager.UIScaleValue(40)
      : width / 2;

    // Center the time text at the top
    this.timeText?.setPosition(
      timeX,
      padding - scaleManager.UIScaleValue(16) / 4,
    );
    this.timeText?.setFontSize(scaleManager.getNameSize());

    // Center the kill count
    const goldTextY = padding + barHeight + scaleManager.UIScaleValue(5);
    this.goldText?.setPosition(timeX, goldTextY);
    this.goldText?.setFontSize(scaleManager.getDescSize());

    const buttonHeight = scaleManager.UIScaleValue(40);
    const buttonWidth = scaleManager.UIScaleValue(60);
    const x = scaleManager.isMobile()
      ? timeX
      : this.cameras.main.width - padding - buttonWidth / 2;
    const y = scaleManager.isMobile()
      ? goldTextY + expBarHeight * 2 + padding
      : padding + buttonHeight / 2;

    this.closeButton?.setPosition(x, y);
    this.closeButtonText?.setPosition(x, y);
  }

  private createUI(): void {
    // UI container (fixed on screen)
    this.uiContainer = this.add
      .container(0, 0)
      .setScrollFactor(0)
      .setDepth(scaleManager.getZIndex());

    // Responsive UI sizing
    const barWidth = scaleManager.UIScaleValue(200);
    const barHeight = scaleManager.UIScaleValue(20);
    const expBarHeight = scaleManager.UIScaleValue(15);
    const padding = scaleManager.UIScaleValue(20);

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
      padding + barHeight + scaleManager.UIScaleValue(5),
      barWidth,
      expBarHeight,
      0x000000,
      0.7,
    );
    this.expBarBg.setOrigin(0, 0);
    this.expBar = this.add.rectangle(
      padding,
      padding + barHeight + scaleManager.UIScaleValue(5),
      barWidth,
      expBarHeight,
      0x00ff00,
    );
    this.expBar.setOrigin(0, 0);

    // Level text
    this.levelText = this.add.text(
      padding + barWidth + scaleManager.UIScaleValue(10),
      padding,
      i18n.t("game.level", { level: 1 }),
      {
        fontSize: scaleManager.getNameSize(),
        fontFamily: scaleManager.getDefaultFont(),
        color: "#ffffff",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 3,
      },
    );

    // Time text (centered at top) - Countdown from 30 minutes
    const timeX = scaleManager.isMobile()
      ? this.cameras.main.width - padding - scaleManager.UIScaleValue(40)
      : this.cameras.main.width / 2;
    this.timeText = this.add.text(
      timeX,
      padding - scaleManager.UIScaleValue(16) / 4,
      "00:00",
      {
        fontSize: scaleManager.getNameSize(),
        fontFamily: scaleManager.getDefaultFont(),
        color: "#ffffff",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 3,
      },
    );
    this.timeText.setOrigin(0.5, 0);

    const goldTextY = padding + barHeight + scaleManager.UIScaleValue(5);

    // Kill count
    this.goldText = this.add.text(
      timeX,
      goldTextY,
      `${i18n.t("stats.gold")}: ${useSaveStore.getState().totalGold}`,
      {
        fontSize: scaleManager.getDescSize(),
        fontFamily: scaleManager.getDefaultFont(),
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 2,
      },
    );
    this.goldText.setOrigin(0.5, 0);

    this.killCount = 0;

    const buttonHeight = scaleManager.UIScaleValue(40);
    const buttonWidth = scaleManager.UIScaleValue(60);
    const x = scaleManager.isMobile()
      ? timeX
      : this.cameras.main.width - padding - buttonWidth / 2;
    const y = scaleManager.isMobile()
      ? goldTextY + expBarHeight * 2 + buttonHeight / 2
      : padding + buttonHeight / 2;
    // Back to menu button
    this.closeButton = this.add
      .rectangle(x, y, buttonWidth, buttonHeight, 0x333333, 0.7)
      .setStrokeStyle(3, 0xffffff)
      .setInteractive({ useHandCursor: true })
      .setScrollFactor(0)
      .setDepth(scaleManager.getZIndex());

    this.closeButtonText = this.add
      .text(x, y, "X", {
        fontSize: scaleManager.getNameSize(),
        fontFamily: scaleManager.getDefaultFont(),
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(scaleManager.getZIndex());

    this.closeButton.on("pointerover", () => {
      this.closeButton?.setFillStyle(0x555555);
    });

    this.closeButton.on("pointerout", () => {
      this.closeButton?.setFillStyle(0x333333);
    });

    this.closeButton.on("pointerdown", () => {
      this.endGame();
    });

    this.uiContainer.add([
      this.healthBarBg,
      this.healthBar,
      this.expBarBg,
      this.expBar,
      this.levelText,
      this.timeText,
      this.goldText,
      this.closeButton,
      this.closeButtonText,
    ]);

    // Emit event to indicate game initialization is complete
    eventBus.emit(EVENT_MAP.GAME_INITIALIZED);
  }

  private endGame(): void {
    // Save game data
    useSaveStore.getState().addKills(this.killCount);
    useSaveStore.getState().updatePlayTime(this.getPlayTime());

    this.showModal({
      title: i18n.t("game.endGameTitle"),
      titleColor: "#ff0000",
      description: i18n.t("game.endGameDesc"),
      cancelText: i18n.t("shop.cancel"),
      onCancel: () => {
        this.audioManager?.stopMusic();
        this.resume();
      },
      okText: i18n.t("game.endGame"),
      onOk: () => {
        this.audioManager?.stopMusic();
        eventBus.emit(EVENT_MAP.BACK_TO_HOME);
      },
    });
  }

  private updateUI(): void {
    // Update health bar
    const healthPercent = this.player.health / this.player.maxHealth;
    const barWidth = scaleManager.UIScaleValue(200);
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
    this.timeText?.setText(formatTime(this.gameTime));

    // Change color based on remaining time
    if (this.gameTime < 60) {
      this.timeText?.setColor("#ff0000"); // Red when less than 1 minute
    } else if (this.gameTime < 300) {
      this.timeText?.setColor("#ffff00"); // Yellow when less than 5 minutes
    } else {
      this.timeText?.setColor("#ffffff"); // White otherwise
    }

    // Update kill count
    this.goldText?.setText(
      `${i18n.t("stats.gold")}: ${useSaveStore.getState().totalGold}`,
    );
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

    // Update player with joystick input
    const joystickInput = this.virtualJoystick?.getInput();
    this.player.update(this.cursors, this.wasd, joystickInput);

    // Update enemies
    const playerPos = this.getPlayerPosition();
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

    const playerPos = this.getPlayerPosition();

    enemies.forEach((enemy) => {
      if (enemy.isDead) return;

      const distance = Phaser.Math.Distance.Between(
        playerPos.x,
        playerPos.y,
        enemy.sprite.x,
        enemy.sprite.y,
      );

      if (distance < 30 && this.playerDamageCoolDown <= 0) {
        this.player.takeDamage(enemy.damage);
        this.audioManager?.playSfx(SoundEffect.PLAYER_HIT);
        this.playerDamageCoolDown = 500; // 0.5 seconds of invincibility
      }
    });

    // Weapon and enemy collision
    for (const weapon of this.weaponManager?.getWeapons() || []) {
      // Magic missile collision
      weapon.projectiles.children.entries.forEach((item) => {
        const projectile = item as ProjectileSprite;
        if (!projectile.active) return;

        enemies.forEach((enemy) => {
          if (enemy.isDead) return;

          const distance = Phaser.Math.Distance.Between(
            projectile.x,
            projectile.y,
            enemy.sprite.x,
            enemy.sprite.y,
          );

          if (distance < projectile.distance) {
            const killed = enemy.takeDamage(projectile.damage);
            if (killed) {
              this.killCount++;
              this.killsSinceLastReward++;
              this.checkRewardTrigger();
              this.spawnGoldCoin(
                enemy.sprite.x,
                enemy.sprite.y,
                enemy.goldValue,
              );
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

          if (distance < orb.distance) {
            const killed = enemy.takeDamage(orb.damage);
            if (killed) {
              this.killCount++;
              this.killsSinceLastReward++;
              this.checkRewardTrigger();
              this.spawnGoldCoin(
                enemy.sprite.x,
                enemy.sprite.y,
                enemy.goldValue,
              );
            }
          }
        });
      });
    }
  }

  private spawnGoldCoin(x: number, y: number, value: number): void {
    const dropRate = GOLD_DROP_PERCENTAGE + this.player.luck * 0.01;
    if (Math.random() < dropRate) {
      this.experienceManager?.spawnCoin(x, y, value);
    }
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
    if (this.isGameOver || this.rewardUI?.isVisible()) return;
    this.audioManager?.playSfx(SoundEffect.LEVEL_UP);
    this.pause();

    this.rewardUI?.show((option: RewardOption) => {
      this.handleRewardSelection(option);
      this.resume();
    });
  }

  private handleRewardSelection(option: RewardOption): void {
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
        useAppStore.getState().addWeapon(weaponData.id);
      } else {
        // If already owned, upgrade it
        const weapon = this.weaponManager?.getWeapon(WeaponClass);
        weapon?.upgrade();
      }

      return;
    }

    if (option.type === "elixir") {
      // Apply elixir effects
      const elixir = option.data as ElixirData;

      const effect =
        elixir.id === "jade_dew"
          ? Math.min(
              this.player.maxHealth,
              this.player.health + this.player.maxHealth * elixir.effect.value,
            )
          : elixir.effect.value;

      this.player.upgrade(elixir.effect.type, effect, this.player.maxHealth);
    }
  }

  public showLevelUpMenu(): void {
    if (this.isGameOver) {
      return;
    }
    // Get upgrade options
    const options = this.weaponManager?.getUpgradeOptions() || [];

    if (options.length === 0) {
      return;
    }

    this.audioManager?.playSfx(SoundEffect.LEVEL_UP);
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
      .text(
        centerX,
        centerY - scaleManager.UIScaleValue(150),
        i18n.t("game.levelUp"),
        {
          fontSize: scaleManager.getTitleSize(),
          fontFamily: scaleManager.getDefaultFont(),
          color: "#ffff00",
          fontStyle: "bold",
          stroke: "#000000",
          strokeThickness: 4,
        },
      )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(textDepth);

    // Create option buttons
    const buttons: ButtonElement[] = [];

    const selectOption = (option: UpgradeOption) => {
      this.selectUpgrade(option);
      // Clear menu
      overlay.destroy();
      title.destroy();
      buttons.forEach((btn) => {
        btn.button.destroy();
        btn.nameText.destroy();
        btn.descText.destroy();
      });
    };

    const width = Math.min(
      scaleManager.UIScaleValue(500),
      this.cameras.main.width - 40,
    );

    options.forEach((option, index) => {
      const y =
        centerY -
        scaleManager.UIScaleValue(50) +
        index * scaleManager.UIScaleValue(100);

      const button = this.add
        .rectangle(centerX, y, width, scaleManager.UIScaleValue(80), 0x333333)
        .setStrokeStyle(3, 0xffffff)
        .setInteractive({ useHandCursor: true })
        .setScrollFactor(0)
        .setDepth(textDepth);

      const nameText = this.add
        .text(centerX, y - scaleManager.UIScaleValue(15), option.name, {
          fontSize: scaleManager.getNameSize(),
          fontFamily: scaleManager.getDefaultFont(),
          color: "#ffffff",
          fontStyle: "bold",
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(endDepth);

      const descText = this.add
        .text(centerX, y + scaleManager.UIScaleValue(15), option.description, {
          fontSize: scaleManager.getDescSize(),
          fontFamily: scaleManager.getDefaultFont(),
          color: "#cccccc",
          wordWrap: { width: width - 20 },
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
        selectOption(option);
      });

      buttons.push({ button, nameText, descText });
    });

    if (useSaveStore.getState().enableAutoSelect) {
      const index = Math.floor(Math.random() * options.length);
      selectOption(options[index]);
    }
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
      .text(centerX, centerY - scaleManager.UIScaleValue(100), title, {
        fontSize: scaleManager.getTitleSize(),
        color: titleColor,
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 6,
        fontFamily: scaleManager.getDefaultFont(),
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(textDepth);

    result.push(titleText);

    if (description) {
      const descText = this.add
        .text(centerX, centerY, description, {
          fontSize: scaleManager.getNameSize(),
          color: "#ffffff",
          align: "center",
          stroke: "#000000",
          strokeThickness: 3,
          fontFamily: scaleManager.getDefaultFont(),
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(textDepth);
      result.push(descText);
    }

    const paddingY = scaleManager.UIScaleValue(120);

    const okButton = this.add
      .rectangle(
        centerX - scaleManager.UIScaleValue(110),
        centerY + paddingY,
        scaleManager.UIScaleValue(180),
        scaleManager.UIScaleValue(60),
        0x333333,
      )
      .setStrokeStyle(3, 0xffffff)
      .setInteractive({ useHandCursor: true })
      .setScrollFactor(0)
      .setDepth(textDepth);

    result.push(okButton);

    const paddingX = scaleManager.UIScaleValue(110);

    const okObj = this.add
      .text(centerX - paddingX, centerY + paddingY, okText, {
        fontSize: scaleManager.getNameSize(),
        color: "#ffffff",
        fontStyle: "bold",
        fontFamily: scaleManager.getDefaultFont(),
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
      .rectangle(
        centerX + paddingX,
        centerY + paddingY,
        scaleManager.UIScaleValue(180),
        scaleManager.UIScaleValue(60),
        0x333333,
      )
      .setStrokeStyle(3, 0xffffff)
      .setInteractive({ useHandCursor: true })
      .setScrollFactor(0)
      .setDepth(textDepth);

    result.push(cancelButton);

    const cancelTextObj = this.add
      .text(centerX + paddingX, centerY + paddingY, cancelText, {
        fontSize: scaleManager.getNameSize(),
        color: "#ffffff",
        fontStyle: "bold",
        fontFamily: scaleManager.getDefaultFont(),
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

  private getEndGameDesc() {
    return `${i18n.t("stats.survivalTime")}: ${this.getPlayTime()}\n${i18n.t(
      "stats.kills",
    )}: ${this.killCount}\n${i18n.t("stats.level")}: ${this.player.level}\n${i18n.t("stats.gold")}: ${useSaveStore.getState().totalGold}`;
  }

  public async showVictory(): Promise<void> {
    if (this.isGameOver) return;
    this.isGameOver = true;

    this.audioManager?.playSfx(SoundEffect.VICTORY_THEME);

    // Collect all remaining items with animation
    await this.experienceManager?.collectAllItems();

    // Save game data
    useSaveStore.getState().addKills(this.killCount);
    useSaveStore.getState().updatePlayTime(this.getPlayTime());

    // Complete the chapter and unlock characters
    const selectedMap = useAppStore.getState().getSelectMap();
    useSaveStore.getState().completeChapter([selectedMap.id]);

    this.showModal({
      title: i18n.t("game.chapterComplete"),
      titleColor: "#00ff00",
      description: this.getEndGameDesc(),
      cancelText: i18n.t("game.backToHome"),
      onCancel: () => {
        this.audioManager?.stopMusic();
        eventBus.emit(EVENT_MAP.BACK_TO_HOME);
      },
      okText: i18n.t("game.restart"),
      onOk: () => {
        this.isGameOver = false;
        this.audioManager?.stopMusic();
        this.scene.restart();
      },
    });
  }

  public gameOver(): void {
    if (this.isGameOver) return;
    this.isGameOver = true;

    this.audioManager?.playSfx(SoundEffect.PLAYER_DEATH);

    // Save game data
    useSaveStore.getState().addKills(this.killCount);
    useSaveStore.getState().updatePlayTime(this.getPlayTime());

    this.showModal({
      title: i18n.t("game.gameOver"),
      titleColor: "#ff0000",
      description: this.getEndGameDesc(),
      cancelText: i18n.t("game.backToHome"),
      onCancel: () => {
        this.audioManager?.stopMusic();
        eventBus.emit(EVENT_MAP.BACK_TO_HOME);
      },
      okText: i18n.t("game.restart"),
      onOk: () => {
        this.audioManager?.stopMusic();

        this.scene.restart();
      },
    });
  }
}
