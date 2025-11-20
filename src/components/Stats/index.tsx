import { useTranslation } from "react-i18next";
import {
  useUnlockedCharacters,
  useTotalGold,
  useTotalKills,
  useBestSurvivalTime,
  useTotalPlayTime,
} from "../../store";
import { CHARACTERS_DATA } from "../../constant";
import styles from "./index.module.css";

const chatterList = Object.keys(CHARACTERS_DATA);

const Stats = () => {
  const [t] = useTranslation();
  const unlockedCharacters = useUnlockedCharacters();
  const totalGold = useTotalGold();
  const totalKills = useTotalKills();
  const bestSurvivalTime = useBestSurvivalTime();
  const totalPlayTime = useTotalPlayTime();

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className={styles.statsGrid}>
      <div className={styles.stat}>
        <span className={styles.statLabel}>💰 {t("stats.gold")}:</span>
        <span className={styles.statValue}>{totalGold}</span>
      </div>
      <div className={styles.stat}>
        {/* eslint-disable-next-line i18next/no-literal-string */}
        <span className={styles.statLabel}>⚔️ {t("stats.totalKills")}:</span>
        <span className={styles.statValue}>{totalKills}</span>
      </div>
      <div className={styles.stat}>
        {/* eslint-disable-next-line i18next/no-literal-string */}
        <span className={styles.statLabel}>⏱️ {t("stats.bestSurvival")}:</span>
        <span className={styles.statValue}>{formatTime(bestSurvivalTime)}</span>
      </div>
      <div className={styles.stat}>
        <span className={styles.statLabel}>🕒 {t("stats.totalPlayTime")}:</span>
        <span className={styles.statValue}>{formatTime(totalPlayTime)}</span>
      </div>
      <div className={styles.stat}>
        <span className={styles.statLabel}>
          {t("characters.unlockCharacter")}:
        </span>
        <span className={styles.statValue}>
          {unlockedCharacters.length}/{chatterList.length}
        </span>
      </div>
    </div>
  );
};

export default Stats;
