import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { GameMap, MapType } from "../../types/types";
import { MAPS } from "../../constant";
import { useUnlockedMaps, useSelectedMap, useAppStore } from "../../store";
import styles from "./index.module.css";

interface MapSelectProps {
  onSelect: () => void;
  onBack: () => void;
}

const MapSelect: React.FC<MapSelectProps> = ({ onSelect, onBack }) => {
  const { t } = useTranslation();
  const unlockedMaps = useUnlockedMaps();

  const mapId = useSelectedMap();

  const selectedMap = useMemo(() => {
    return useAppStore.getState().getSelectMap();
  }, [mapId]);

  const handleMapClick = (map: GameMap) => {
    if (unlockedMaps.includes(map.id)) {
      useAppStore.getState().selectMap(map.id);
    }
  };

  const handleConfirm = () => {
    if (selectedMap) {
      useAppStore.getState().selectMap(selectedMap.id);
      onSelect();
    }
  };

  const getChapterColor = (id: MapType): string => {
    const colors: Record<MapType, string> = {
      chapter1: "#4a6741",
      chapter2: "#c9a227",
      chapter3: "#5b7c99",
      chapter4: "#7b4397",
      chapter5: "#c94b4b",
      chapter6: "#ffd700",
    };
    return colors[id] || "#ffffff";
  };

  return (
    <div className={styles.mapSelect}>
      <h1 className={styles.title}>{t("maps.selectMap")}</h1>

      <div className={styles.mapsGrid}>
        {MAPS.map((map) => {
          const isUnlocked = unlockedMaps.includes(map.id);
          const isSelected = selectedMap?.id === map.id;
          const chapterColor = getChapterColor(map.id);

          return (
            <div
              key={map.id}
              className={`${styles.mapCard} ${isUnlocked ? styles.unlocked : styles.locked} ${isSelected ? styles.selected : ""}`}
              onClick={() => handleMapClick(map)}
              style={{
                borderColor: isSelected ? chapterColor : undefined,
                boxShadow: isSelected
                  ? `0 0 25px ${chapterColor}80`
                  : undefined,
              }}
            >
              <div
                className={styles.chapterBadge}
                style={{ backgroundColor: chapterColor }}
              >
                {t("maps.selectMap")} {map.chapter}
              </div>

              <div className={styles.mapName}>
                {isUnlocked ? t(`maps.${map.id}.name`) : "???"}
              </div>

              {isUnlocked && (
                <div className={styles.difficulty}>
                  {"★".repeat(map.difficulty)}
                </div>
              )}

              {!isUnlocked && (
                <div className={styles.unlockCondition}>
                  {t(`unlockConditions.${map.unlockCondition.type}`, {
                    value: map.unlockCondition.value,
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedMap && (
        <div className={styles.mapDetail}>
          <h2>{t(`maps.chapter${selectedMap.chapter}.name`)}</h2>
          <p className={styles.description}>
            {t(`maps.chapter${selectedMap.chapter}.description`)}
          </p>
          <div className={styles.difficultyInfo}>
            <strong>{t("maps.difficulty")}:</strong>{" "}
            {"★".repeat(selectedMap.difficulty)}
          </div>
        </div>
      )}

      <div className={styles.buttons}>
        <button
          className="confirmButton"
          onClick={handleConfirm}
          disabled={!selectedMap}
        >
          {t("game.start")}
        </button>
        <button className="backButton" onClick={onBack}>
          {t("game.backToHome")}
        </button>
      </div>
    </div>
  );
};

export default MapSelect;
