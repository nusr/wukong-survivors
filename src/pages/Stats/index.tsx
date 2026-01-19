import React from "react";
import { useTranslation } from "react-i18next";
import {
  useUnlockedCharacters,
  useTotalGold,
  useTotalKills,
  useBestSurvivalTime,
  useTotalPlayTime,
  useCompletedChapters,
} from "../../store";
import { CHARACTERS_DATA } from "../../constant";
import { MAPS } from "../../constant/map";
import styles from "./index.module.css";
import { formatTime } from "../../util";

const chatterList = Object.keys(CHARACTERS_DATA);

const Stats: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [t] = useTranslation();
  const unlockedCharacters = useUnlockedCharacters();
  const completedChapters = useCompletedChapters();
  const totalGold = useTotalGold();
  const totalKills = useTotalKills();
  const bestSurvivalTime = useBestSurvivalTime();
  const totalPlayTime = useTotalPlayTime();

  return (
    <div className="center-container">
      <button
        className={`backButton closeButton ${styles.closeButton}`}
        onClick={onBack}
        data-testid="back-to-home-button"
      >
        X
      </button>
      <h1 data-testid="page-title">{t("stats.title")}</h1>
      <div className={styles.stat} data-testid="stat-gold">
        <span className={styles.statLabel} data-testid="stat-gold-label">
          💰 {t("stats.gold")}:
        </span>
        <span className={styles.statValue} data-testid="stat-gold-value">
          {totalGold}
        </span>
      </div>
      <div className={styles.stat} data-testid="stat-total-kills">
        {/* eslint-disable-next-line i18next/no-literal-string */}
        <span className={styles.statLabel} data-testid="stat-total-kills-label">
          ⚔️ {t("stats.totalKills")}:
        </span>
        <span className={styles.statValue} data-testid="stat-total-kills-value">
          {totalKills}
        </span>
      </div>
      <div className={styles.stat} data-testid="stat-best-survival">
        <span
          className={styles.statLabel}
          data-testid="stat-best-survival-label"
          // eslint-disable-next-line i18next/no-literal-string
        >
          ⏱️ {t("stats.bestSurvival")}:
        </span>
        <span
          className={styles.statValue}
          data-testid="stat-best-survival-value"
        >
          {formatTime(bestSurvivalTime)}
        </span>
      </div>
      <div className={styles.stat} data-testid="stat-total-play-time">
        <span
          className={styles.statLabel}
          data-testid="stat-total-play-time-label"
        >
          🕒 {t("stats.totalPlayTime")}:
        </span>
        <span
          className={styles.statValue}
          data-testid="stat-total-play-time-value"
        >
          {formatTime(totalPlayTime)}
        </span>
      </div>
      <div className={styles.stat} data-testid="stat-unlocked-characters">
        <span
          className={styles.statLabel}
          data-testid="stat-unlocked-characters-label"
        >
          {t("characters.unlockCharacter")}:
        </span>
        <span
          className={styles.statValue}
          data-testid="stat-unlocked-characters-value"
        >
          {unlockedCharacters.length}/{chatterList.length}
        </span>
      </div>
      <div className={styles.stat} data-testid="stat-completed-chapters">
        <span
          className={styles.statLabel}
          data-testid="stat-completed-chapters-label"
        >
          {t("game.completeChapters")}:
        </span>
        <span
          className={styles.statValue}
          data-testid="stat-completed-chapters-value"
        >
          {completedChapters.length}/{MAPS.length}
        </span>
      </div>
    </div>
  );
};

export default React.memo(Stats);
