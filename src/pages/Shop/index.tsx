import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { PERMANENT_UPGRADES } from "../../constant";
import { useShopLevel, useTotalGold, useSaveStore } from "../../store";
import styles from "./index.module.css";
import type { PermanentUpgradeType } from "../../types/";
import { upgradeLevelGold } from "../../util";

interface ShopProps {
  onBack: () => void;
}

const ICONS_MAP: Record<PermanentUpgradeType, string> = {
  attack: "⚔️",
  health: "❤️",
  armor: "🛡️",
  luck: "🍀",
  speed: "⚡",
  expBonus: "📈",
  critRate: "🔫",
  magnetBonus: "🧲",
  collectRange: "🔍",
};

const Shop: React.FC<ShopProps> = ({ onBack }) => {
  const [t] = useTranslation();
  const [, setRefresh] = useState(0);
  const totalGold = useTotalGold();

  const save = useShopLevel();

  const handlePurchase = (upgradeId: PermanentUpgradeType) => {
    if (useSaveStore.getState().upgradePermanent(upgradeId)) {
      setRefresh((prev) => prev + 1);
    }
  };

  const handleResetUpgrades = () => {
    if (window.confirm(t("shop.resetConfirm"))) {
      useSaveStore.getState().resetPermanentUpgrades();
      setRefresh((prev) => prev + 1);
    }
  };

  return (
    <div className="common-container">
      <h1 data-testid="shop-title">{t("shop.title")}</h1>

      <div className={styles.goldDisplay} data-testid="shop-gold-display">
        <span className={styles.goldIcon}>💰</span>
        <span className={styles.goldAmount}>{totalGold}</span>
      </div>

      <div className={styles.upgradesGrid} data-testid="upgrades-grid">
        {PERMANENT_UPGRADES.map((upgrade) => {
          const currentLevel = save[upgrade.id] || 0;
          const cost = upgradeLevelGold(currentLevel);
          const isMaxLevel = currentLevel >= upgrade.maxLevel;
          const canAfford = totalGold >= cost;
          const currentEffect = upgrade.effect(currentLevel);
          const nextEffect = upgrade.effect(currentLevel + 1);

          return (
            <div
              key={upgrade.id}
              className={styles.upgradeCard}
              data-testid={`upgrade-card-${upgrade.id}`}
            >
              <h3 className={styles.upgradeName}>
                {ICONS_MAP[upgrade.id]} {t(`upgrades.${upgrade.id}.name`)}
              </h3>
              <p className={styles.upgradeDescription}>
                {t(`upgrades.${upgrade.id}.description`, {
                  value: upgrade.effect(1),
                })}
              </p>

              <div className={styles.upgradeLevel}>
                <span className={styles.levelLabel}>
                  {t("shop.currentLevel", { level: currentEffect })}:
                </span>
                <span className={styles.levelValue}>
                  {currentLevel} / {upgrade.maxLevel}
                </span>
              </div>

              <div className={styles.upgradeEffect}>
                <span className={styles.effectLabel}>
                  {t("shop.currentLevel", { level: currentEffect })}:
                </span>
                <span className={styles.effectValue}>+{currentEffect}</span>
              </div>

              <div className={styles.upgradeNext}>
                <span className={styles.nextLabel}>{t("game.levelUp")}:</span>
                <span className={styles.nextValue}>
                  {isMaxLevel ? t("shop.maxLevel") : `+${nextEffect}`}
                </span>
              </div>

              <button
                className="confirmButton"
                onClick={() => handlePurchase(upgrade.id)}
                disabled={!canAfford || isMaxLevel}
                data-testid={`purchase-button-${upgrade.id}`}
              >
                {isMaxLevel ? t("shop.maxLevel") : `${cost} 💰`}
              </button>
            </div>
          );
        })}
      </div>

      <div className="button-group">
        <button
          className="backButton"
          onClick={onBack}
          data-testid="shop-back-button"
        >
          {t("game.back")}
        </button>
        <button
          className="resetButton"
          onClick={handleResetUpgrades}
          data-testid="reset-upgrades-button"
        >
          {t("shop.resetUpgrades")}
        </button>
      </div>
    </div>
  );
};

export default Shop;
