import Phaser from "phaser";
import { WEAPONS, ELIXIRS, RARITY_COLORS, MAX_SELECT_SIZE } from "../constant";
import {
  getRandomWeapons,
  getRandomElixirs,
  getAvailableCrafts,
} from "../util";
import type { RewardOption } from "../types";
import { useAppStore, useSaveStore } from "../store";
import i18n from "../i18n";
import { scaleManager } from "./ScaleManager";

export class RewardSelectionUI {
  private scene: Phaser.Scene;
  private uiElements: Phaser.GameObjects.GameObject[] = [];
  private overlay: Phaser.GameObjects.Rectangle | null = null;
  private refreshCost: number = 10; // Refresh cost in gold
  private onSelectCallback?: (option: RewardOption) => void;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public show(onSelect?: (option: RewardOption) => void): void {
    if (!onSelect) {
      return;
    }

    // Generate random options (mixed weapons and elixirs)
    const options = this.generateOptions();

    if (options.length === 0) {
      return;
    }

    if (this.isVisible()) {
      this.hide();
    }

    this.onSelectCallback = onSelect;

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

    this.uiElements.push(this.overlay);

    // Title
    const title = this.scene.add
      .text(
        centerX,
        centerY - scaleManager.UIScaleValue(220),
        i18n.t("rewards.title"),
        {
          fontSize: scaleManager.getTitleSize(),
          fontFamily: scaleManager.getDefaultFont(),
          color: "#ffd700",
          fontStyle: "bold",
          stroke: "#000000",
          strokeThickness: 6,
        },
      )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(scaleManager.getZIndex());

    this.uiElements.push(title);

    // Create option buttons
    this.createOptionButtons(centerX, centerY, options);

    // Refresh button
    this.createRefreshButton(centerX, centerY);

    // Crafting hint
    this.createCraftHint(centerX, centerY);
  }

  private generateOptions() {
    const options: RewardOption[] = [];

    if (Math.random() > 0.5) {
      // Get random weapons
      const randomWeapons = getRandomWeapons(MAX_SELECT_SIZE);
      randomWeapons.forEach((weaponId) => {
        options.push({
          type: "weapon",
          data: { ...WEAPONS[weaponId] },
        });
      });
    } else {
      // Get random elixirs
      const randomElixirs = getRandomElixirs(MAX_SELECT_SIZE);
      randomElixirs.forEach((elixirId) => {
        options.push({
          type: "elixir",
          data: { ...ELIXIRS[elixirId] },
        });
      });
    }

    // Shuffle order
    options.sort(() => Math.random() - 0.5);

    return options;
  }

  private createOptionButtons(
    centerX: number,
    centerY: number,
    options: RewardOption[],
  ): void {
    const minWidth = Math.floor(
      (this.scene.cameras.main.width - 40) / MAX_SELECT_SIZE,
    );

    const buttonWidth = Math.min(minWidth, scaleManager.UIScaleValue(280));
    const buttonHeight = scaleManager.UIScaleValue(180);
    const spacing = scaleManager.UIScaleValue(30);
    const startX =
      centerX -
      (buttonWidth * options.length + spacing * (options.length - 1)) / 2;
    const depth = scaleManager.getZIndex();

    options.forEach((option, index) => {
      const x = startX + index * (buttonWidth + spacing) + buttonWidth / 2;
      const y = centerY - scaleManager.UIScaleValue(20);

      this.createOptionButton(option, x, y, buttonWidth, buttonHeight, depth);
    });

    if (useSaveStore.getState().enableAutoSelect) {
      const index = Math.floor(Math.random() * options.length);
      this.selectOption(options[index]);
    }
  }

  private createOptionButton(
    option: RewardOption,
    x: number,
    y: number,
    width: number,
    height: number,
    depth: number,
  ) {
    // Set color based on rarity
    const rarity = option.data.rarity;
    const color = RARITY_COLORS[rarity];

    // Background - this will be the interactive element
    const background = this.scene.add
      .rectangle(x, y, width, height, 0x2a2a2a)
      .setStrokeStyle(4, color)
      .setScrollFactor(0)
      .setDepth(depth)
      .setInteractive({ useHandCursor: true });

    this.uiElements.push(background);

    const isWeapon = option.type === "weapon";

    // Icon (using emoji instead of images)
    const icon = this.scene.add
      .text(x, y - scaleManager.UIScaleValue(60), isWeapon ? "⚔️" : "🧪", {
        fontSize: scaleManager.getNameSize(),
        fontFamily: scaleManager.getDefaultFont(),
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(depth + 1);

    this.uiElements.push(icon);

    const name = isWeapon
      ? i18n.t(`weapons.${option.data.id}.name`)
      : i18n.t(`elixirs.${option.data.id}.name`);

    const description = isWeapon
      ? i18n.t(`weapons.${option.data.id}.description`)
      : i18n.t(`elixirs.${option.data.id}.description`);

    // Name
    const nameText = this.scene.add
      .text(x, y - scaleManager.UIScaleValue(10), name, {
        fontSize: scaleManager.getNameSize(),
        fontFamily: scaleManager.getDefaultFont(),
        color: "#ffffff",
        fontStyle: "bold",
        align: "center",
        wordWrap: { width: width - 20 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(depth + 1);

    this.uiElements.push(nameText);

    let descText: Phaser.GameObjects.Text | null = null;

    if (!scaleManager.isMobile()) {
      // Description
      descText = this.scene.add
        .text(x, y + scaleManager.UIScaleValue(30), description, {
          fontSize: scaleManager.getDescSize(),
          fontFamily: scaleManager.getDefaultFont(),
          color: "#cccccc",
          align: "center",
          wordWrap: { width: width - 20 },
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(depth + 1);

      this.uiElements.push(descText);
    }

    // Rarity text
    const rarityText = this.scene.add
      .text(
        x,
        y + scaleManager.UIScaleValue(70),
        i18n.t(`rewards.rarity.${rarity}`),
        {
          fontSize: scaleManager.getDescSize(),
          fontFamily: scaleManager.getDefaultFont(),
          color: `#${color.toString(16).padStart(6, "0")}`,
          fontStyle: "bold",
        },
      )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(depth + 1);

    this.uiElements.push(rarityText);

    // Store all text elements for animation

    const allElements = [background, icon, nameText, rarityText];

    if (descText) {
      allElements.push(descText);
    }

    // Mouse hover effects
    background.on("pointerover", () => {
      background.setFillStyle(0x3a3a3a);
      this.scene.tweens.add({
        targets: allElements,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 200,
        ease: "Power2",
      });
    });

    background.on("pointerout", () => {
      background.setFillStyle(0x2a2a2a);
      this.scene.tweens.add({
        targets: allElements,
        scaleX: 1,
        scaleY: 1,
        duration: 200,
        ease: "Power2",
      });
    });

    background.on("pointerdown", () => {
      this.selectOption(option);
    });
  }

  private createRefreshButton(centerX: number, centerY: number): void {
    const gold = useSaveStore.getState().totalGold;
    const canRefresh = gold >= this.refreshCost;

    const buttonY = centerY + scaleManager.UIScaleValue(140);
    const buttonWidth = scaleManager.UIScaleValue(200);
    const buttonHeight = scaleManager.UIScaleValue(50);

    const refreshBg = this.scene.add
      .rectangle(
        centerX,
        buttonY,
        buttonWidth,
        buttonHeight,
        canRefresh ? 0x4a4a4a : 0x2a2a2a,
      )
      .setStrokeStyle(2, canRefresh ? 0xffd700 : 0x666666)
      .setScrollFactor(0)
      .setDepth(scaleManager.getZIndex());

    this.uiElements.push(refreshBg);

    const refreshText = this.scene.add
      .text(
        centerX,
        buttonY,
        i18n.t("rewards.refreshCost", { cost: this.refreshCost }),
        {
          fontSize: scaleManager.getNameSize(),
          fontFamily: scaleManager.getDefaultFont(),
          color: canRefresh ? "#ffffff" : "#666666",
          fontStyle: "bold",
        },
      )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(scaleManager.getZIndex());

    this.uiElements.push(refreshText);

    if (canRefresh) {
      refreshBg.setInteractive({ useHandCursor: true });

      refreshBg.on("pointerover", () => {
        refreshBg.setFillStyle(0x5a5a5a);
      });

      refreshBg.on("pointerout", () => {
        refreshBg.setFillStyle(0x4a4a4a);
      });

      refreshBg.on("pointerdown", () => {
        this.refresh();
      });
    }
  }

  private createCraftHint(centerX: number, centerY: number): void {
    // Check if there are craft able weapons
    const ownedWeapons = useAppStore.getState().ownedWeapons || [];
    const availableCrafts = getAvailableCrafts(ownedWeapons);

    if (availableCrafts.length > 0) {
      const hintText = this.scene.add
        .text(
          centerX,
          centerY + scaleManager.UIScaleValue(200),
          i18n.t("rewards.craftHint", { count: availableCrafts.length }),
          {
            fontSize: scaleManager.getDescSize(),
            fontFamily: scaleManager.getDefaultFont(),
            color: "#ffd700",
            fontStyle: "italic",
          },
        )
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(scaleManager.getZIndex());

      this.uiElements.push(hintText);
    }
  }

  private refresh(): void {
    if (useSaveStore.getState().spendGold(this.refreshCost)) {
      // Increase refresh cost before recreating UI

      // Store  new cost
      const newCost = this.refreshCost + 5;
      // Hide current UI
      this.hide();

      // Restore the cost and show new UI
      this.refreshCost = newCost;
      this.show(this.onSelectCallback);
    }
  }

  private selectOption(option: RewardOption): void {
    // Play selection sound (if available)
    this.scene.tweens.add({
      targets: this.uiElements,
      alpha: 0,
      duration: 300,
      ease: "Power2",
      onComplete: () => {
        this.hide();

        this.onSelectCallback?.(option);

        // Resume game
        this.scene.physics.resume();
      },
    });
  }

  public hide(): void {
    this.overlay?.destroy();
    this.overlay = null;

    // Destroy all UI elements
    this.uiElements.forEach((element) => {
      if (element && element.active) {
        element.destroy();
      }
    });

    this.uiElements = [];
    this.refreshCost = 10; // Reset refresh cost
  }

  public isVisible(): boolean {
    return Boolean(this.overlay && this.uiElements.length > 0);
  }
}
