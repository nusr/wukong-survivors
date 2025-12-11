import { useTranslation } from "react-i18next";
import styles from "./index.module.css";
import {
  CHARACTERS_DATA,
  MAPS,
  WEAPONS,
  ELIXIRS,
  ENEMIES_DATA,
} from "../../constant";

const characters = Object.values(CHARACTERS_DATA);
const weapons = Object.values(WEAPONS);
const elixirs = Object.values(ELIXIRS);
const enemies = Object.values(ENEMIES_DATA);

const Wiki = ({ onBack }: { onBack: () => void }) => {
  const [t] = useTranslation();
  return (
    <div className="common-container">
      <button
        className={`backButton closeButton ${styles.closeButton}`}
        onClick={onBack}
        data-testid="back-to-home-button"
      >
        X
      </button>
      <h1 data-testid="page-title">{t("wiki.title")}</h1>

      <details className={styles.details} data-testid="wiki-maps-section">
        <summary className={styles.title}>{t("maps.title")}</summary>
        {MAPS.map((v) => (
          <div key={v.id} className={styles.item}>
            <div className={styles.label}>{t(`maps.${v.id}.name`)}</div>
            <div className={styles.desc}>{t(`maps.${v.id}.description`)}</div>
          </div>
        ))}
      </details>

      <details className={styles.details} data-testid="wiki-characters-section">
        <summary className={styles.title}>{t("characters.title")}</summary>
        {characters.map((v) => (
          <div key={v.id} className={styles.item}>
            <div className={styles.label}>{t(`characters.${v.id}.name`)}</div>
            <div className={styles.desc}>
              {t(`characters.${v.id}.description`)}
            </div>
          </div>
        ))}
      </details>

      <details className={styles.details} data-testid="wiki-weapons-section">
        <summary className={styles.title}>{t("weapons.title")}</summary>
        {weapons.map((v) => (
          <div key={v.id} className={styles.item}>
            <div className={styles.label}>{t(`weapons.${v.id}.name`)}</div>
            <div className={styles.desc}>
              {t(`weapons.${v.id}.description`)}
            </div>
          </div>
        ))}
      </details>

      <details className={styles.details} data-testid="wiki-elixirs-section">
        <summary className={styles.title}>{t("elixirs.title")}</summary>
        {elixirs.map((v) => (
          <div key={v.id} className={styles.item}>
            <div className={styles.label}>{t(`elixirs.${v.id}.name`)}</div>
            <div className={styles.desc}>
              {t(`elixirs.${v.id}.description`)}
            </div>
          </div>
        ))}
      </details>

      <details className={styles.details} data-testid="wiki-enemies-section">
        <summary className={styles.title}>{t("enemies.title")}</summary>
        {enemies.map((v) => (
          <div key={v.id} className={styles.item}>
            <div className={styles.label}>{t(`enemies.${v.id}`)}</div>
          </div>
        ))}
      </details>
    </div>
  );
};

export default Wiki;
