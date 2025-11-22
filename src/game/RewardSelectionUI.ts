import Phaser from "phaser";
import {
  WEAPONS,
  ELIXIRS,
  getRandomWeapons,
  getRandomElixirs,
  RARITY_COLORS,
  getAvailableCrafts,
} from "../constant/rewards";
import type { RewardOption } from "../types/reward";
import { useSaveStore } from "../store";
import i18n from "../i18n";
import { scaleManager } from "./ScaleManager";

interface RewardButton {
  container: Phaser.GameObjects.Container;
  background: Phaser.GameObjects.Rectangle;
  icon: Phaser.GameObjects.Text;
  nameText: Phaser.GameObjects.Text;
  descText: Phaser.GameObjects.Text;
  rarityText: Phaser.GameObjects.Text;
  option: RewardOption;
}

export class RewardSelectionUI {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container | null = null;
  private overlay: Phaser.GameObjects.Rectangle | null = null;
  private currentOptions: RewardOption[] = [];
  private buttons: RewardButton[] = [];
  private refreshCost: number = 10; // Refresh cost in gold
  private onSelectCallback?: (option: RewardOption) => void;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public show(onSelect: (option: RewardOption) => void): void {
    if (this.container) {
      this.hide();
    }

    this.onSelectCallback = onSelect;

    // Generate random options (mixed weapons and elixirs)
    this.generateOptions();

    // Pause game
    this.scene.physics.pause();

    const centerX = this.scene.cameras.main.width / 2;
    const centerY = this.scene.cameras.main.height / 2;

    // Semi-transparent background overlay
    this.overlay = this.scene.add
      .rectangle(
        centerX,
        centerY,
        this.scene.cameras.main.width,
        this.scene.cameras.main.height,
        0x000000,
        0.85,
      )
      .setScrollFactor(0)
      .setDepth(scaleManager.getZIndex());

    this.container = this.scene.add
      .container(0, 0)
      .setScrollFactor(0)
      .setDepth(scaleManager.getZIndex());

    // Title
    const title = this.scene.add
      .text(centerX, centerY - 220, i18n.t("rewards.title"), {
        fontSize: scaleManager.getFontSize(48),
        color: "#ffd700",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    this.container.add(title);

    // Create option buttons
    this.createOptionButtons(centerX, centerY);

    // Refresh button
    this.createRefreshButton(centerX, centerY);

    // Crafting hint
    this.createCraftHint(centerX, centerY);
  }

  private generateOptions(): void {
    this.currentOptions = [];

    // Randomly decide weapon and elixir counts (at least 1, max 3)
    const weaponCount = Math.floor(Math.random() * 2) + 1; // 1-2 weapons
    const elixirCount = 3 - weaponCount; // Remaining are elixirs

    // Get random weapons
    const randomWeapons = getRandomWeapons(weaponCount);
    console.log("randomWeapons", randomWeapons);
    randomWeapons.forEach((weaponId) => {
      this.currentOptions.push({
        type: "weapon",
        data: { ...WEAPONS[weaponId] },
      });
    });

    // Get random elixirs
    const randomElixirs = getRandomElixirs(elixirCount);
    console.log("randomElixirs", randomElixirs);
    randomElixirs.forEach((elixirId) => {
      this.currentOptions.push({
        type: "elixir",
        data: { ...ELIXIRS[elixirId] },
      });
    });

    // Shuffle order
    this.currentOptions.sort(() => Math.random() - 0.5);
  }

  private createOptionButtons(centerX: number, centerY: number): void {
    this.buttons = [];

    const buttonWidth = 280;
    const buttonHeight = 180;
    const spacing = 30;
    const startX =
      centerX -
      (buttonWidth * this.currentOptions.length +
        spacing * (this.currentOptions.length - 1)) /
        2;

    this.currentOptions.forEach((option, index) => {
      const x = startX + index * (buttonWidth + spacing) + buttonWidth / 2;
      const y = centerY - 20;

      const button = this.createOptionButton(
        option,
        x,
        y,
        buttonWidth,
        buttonHeight,
      );
      this.buttons.push(button);
      this.container?.add(button.container);
    });
  }

  private createOptionButton(
    option: RewardOption,
    x: number,
    y: number,
    width: number,
    height: number,
  ): RewardButton {
    const container = this.scene.add.container(x, y);

    // Set color based on rarity
    const rarity = option.data.rarity;
    const color = RARITY_COLORS[rarity];

    // Background
    const background = this.scene.add
      .rectangle(0, 0, width, height, 0x2a2a2a)
      .setStrokeStyle(4, color);

    background.setInteractive({ useHandCursor: true });

    const isWeapon = option.type === "weapon";

    // Icon (using emoji instead of images)
    const icon = this.scene.add
      .text(0, -50, isWeapon ? "⚔️" : "🧪", {
        fontSize: scaleManager.getFontSize(48),
      })
      .setOrigin(0.5);

    const name = isWeapon
      ? i18n.t(`weapons.${option.data.id}.name`)
      : i18n.t(`elixirs.${option.data.id}.name`);

    const description = isWeapon
      ? i18n.t(`weapons.${option.data.id}.description`)
      : i18n.t(`elixirs.${option.data.id}.description`);

    // Name
    const nameText = this.scene.add
      .text(0, 0, name, {
        fontSize: scaleManager.getFontSize(20),
        color: "#ffffff",
        fontStyle: "bold",
        align: "center",
        wordWrap: { width: width - 20 },
      })
      .setOrigin(0.5);

    // Description
    const descText = this.scene.add
      .text(0, 35, description, {
        fontSize: scaleManager.getFontSize(14),
        color: "#cccccc",
        align: "center",
        wordWrap: { width: width - 20 },
      })
      .setOrigin(0.5);

    // Rarity text
    const rarityText = this.scene.add
      .text(0, 70, i18n.t(`rewards.rarity.${rarity}`), {
        fontSize: scaleManager.getFontSize(16),
        color: `#${color.toString(16).padStart(6, "0")}`,
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    container.add([background, icon, nameText, descText, rarityText]);

    // Mouse hover effects
    background.on("pointerover", () => {
      background.setFillStyle(0x3a3a3a);
      this.scene.tweens.add({
        targets: container,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 200,
        ease: "Power2",
      });
    });

    background.on("pointerout", () => {
      background.setFillStyle(0x2a2a2a);
      this.scene.tweens.add({
        targets: container,
        scaleX: 1,
        scaleY: 1,
        duration: 200,
        ease: "Power2",
      });
    });

    background.on("pointerdown", () => {
      // FIXME: 鼠标点击后，没有触发方法 this.selectOption(option)
      this.selectOption(option);
    });

    return {
      container,
      background,
      icon,
      nameText,
      descText,
      rarityText,
      option,
    };
  }

  private createRefreshButton(centerX: number, centerY: number): void {
    const gold = useSaveStore.getState().totalGold;
    const canRefresh = gold >= this.refreshCost;

    const buttonY = centerY + 140;
    const buttonWidth = 200;
    const buttonHeight = 50;

    const refreshBg = this.scene.add
      .rectangle(
        centerX,
        buttonY,
        buttonWidth,
        buttonHeight,
        canRefresh ? 0x4a4a4a : 0x2a2a2a,
      )
      .setStrokeStyle(2, canRefresh ? 0xffd700 : 0x666666);

    if (canRefresh) {
      refreshBg.setInteractive({ useHandCursor: true });
    }

    const refreshText = this.scene.add
      .text(
        centerX,
        buttonY,
        i18n.t("rewards.refreshCost", { cost: this.refreshCost }),
        {
          fontSize: scaleManager.getFontSize(18),
          color: canRefresh ? "#ffffff" : "#666666",
          fontStyle: "bold",
        },
      )
      .setOrigin(0.5);

    if (canRefresh) {
      refreshBg.on("pointerover", () => {
        refreshBg.setFillStyle(0x5a5a5a);
      });

      refreshBg.on("pointerout", () => {
        refreshBg.setFillStyle(0x4a4a4a);
      });

      refreshBg.on("pointerdown", () => {
        // FIXME: 鼠标点击后，没有触发方法  this.refresh();
        this.refresh();
      });
    }

    this.container?.add([refreshBg, refreshText]);
  }

  private createCraftHint(centerX: number, centerY: number): void {
    // Check if there are craft able weapons
    const ownedWeapons = useSaveStore.getState().ownedWeapons || [];
    const availableCrafts = getAvailableCrafts(ownedWeapons);

    if (availableCrafts.length > 0) {
      const hintText = this.scene.add
        .text(
          centerX,
          centerY + 200,
          i18n.t("rewards.craftHint", { count: availableCrafts.length }),
          {
            fontSize: scaleManager.getFontSize(16),
            color: "#ffd700",
            fontStyle: "italic",
          },
        )
        .setOrigin(0.5);

      this.container?.add(hintText);
    }
  }

  private refresh(): void {
    const spendGold = useSaveStore.getState().spendGold;
    console.log("refresh:", spendGold);
    if (spendGold(this.refreshCost)) {
      // Clear old buttons
      this.buttons.forEach((button) => button.container.destroy());
      this.buttons = [];

      // Regenerate options
      this.generateOptions();

      // Recreate buttons
      const centerX = this.scene.cameras.main.width / 2;
      const centerY = this.scene.cameras.main.height / 2;
      this.createOptionButtons(centerX, centerY);

      // Increase refresh cost
      this.refreshCost += 5;

      // Update refresh button
      this.container?.removeAll(true);
      this.show(this.onSelectCallback!);
    }
  }

  private selectOption(option: RewardOption): void {
    console.log("selectOption:", option);
    // Play selection sound (if available)
    this.scene.tweens.add({
      targets: this.container,
      alpha: 0,
      duration: 300,
      ease: "Power2",
      onComplete: () => {
        this.hide();
        if (this.onSelectCallback) {
          this.onSelectCallback(option);
        }
        // Resume game
        this.scene.physics.resume();
      },
    });
  }

  public hide(): void {
    if (this.overlay) {
      this.overlay.destroy();
      this.overlay = null;
    }

    if (this.container) {
      this.container.destroy();
      this.container = null;
    }

    this.buttons = [];
    this.currentOptions = [];
    this.refreshCost = 10; // Reset refresh cost
  }

  public isVisible(): boolean {
    return this.container !== null;
  }
}
