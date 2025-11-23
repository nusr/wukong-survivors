import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { PERMANENT_UPGRADES } from "../../constant";
import { useShopLevel, useTotalGold, useSaveStore } from "../../store";
import styles from "./index.module.css";
import type { PermanentUpgradeType } from "../../types/types";

interface ShopProps {
  onBack: () => void;
}

const Shop: React.FC<ShopProps> = ({ onBack }) => {
  const { t } = useTranslation();
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

  const getUpgradeIcon = (stat: PermanentUpgradeType): string => {
    const icons: Record<PermanentUpgradeType, string> = {
      attack: "⚔️",
      health: "❤️",
      armor: "🛡️",
      luck: "🍀",
      speed: "⚡",
    };
    return icons[stat] || "📦";
  };

  return (
    <div className={styles.shop}>
      <h1>{t("shop.title")}</h1>

      <div className={styles.goldDisplay}>
        <span className={styles.goldIcon}>💰</span>
        <span className={styles.goldAmount}>{totalGold}</span>
      </div>

      <div className={styles.upgradesGrid}>
        {PERMANENT_UPGRADES.map((upgrade) => {
          const currentLevel = save[upgrade.id] || 0;
          const cost = upgrade.cost(currentLevel);
          const isMaxLevel = currentLevel >= upgrade.maxLevel;
          const canAfford = totalGold >= cost;
          const currentEffect = upgrade.effect(currentLevel);
          const nextEffect = upgrade.effect(currentLevel + 1);

          return (
            <div key={upgrade.id} className={styles.upgradeCard}>
              <h3 className={styles.upgradeName}>
                {getUpgradeIcon(upgrade.id)} {t(`upgrades.${upgrade.id}.name`)}
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

              {!isMaxLevel && (
                <div className={styles.upgradeNext}>
                  <span className={styles.nextLabel}>{t("game.levelUp")}:</span>
                  <span className={styles.nextValue}>+{nextEffect}</span>
                </div>
              )}

              <button
                className="confirmButton"
                onClick={() => handlePurchase(upgrade.id)}
                disabled={!canAfford || isMaxLevel}
              >
                {isMaxLevel ? t("shop.maxLevel") : `${cost} 💰`}
              </button>
            </div>
          );
        })}
      </div>

      <div className={styles.shopFooter}>
        <button className="backButton" onClick={onBack}>
          {t("game.backToHome")}
        </button>
        <button className="resetButton" onClick={handleResetUpgrades}>
          {t("shop.resetUpgrades")}
        </button>
      </div>
    </div>
  );
};

export default Shop;
