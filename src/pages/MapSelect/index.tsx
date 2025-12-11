import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { GameMap, MapType } from "../../types/types";
import { MAPS } from "../../constant/map";
import { useUnlockedMaps, useSelectedMap, useAppStore } from "../../store";
import styles from "./index.module.css";

interface MapSelectProps {
  onConfirm: () => void;
  onBack: () => void;
}

const MAP_COLORS: Record<MapType, string> = {
  chapter1: "#4a6741",
  chapter2: "#c9a227",
  chapter3: "#5b7c99",
  chapter4: "#7b4397",
  chapter5: "#c94b4b",
  chapter6: "#ffd700",
};

const MapSelect: React.FC<MapSelectProps> = ({ onConfirm, onBack }) => {
  const [t] = useTranslation();
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
      onConfirm();
    }
  };

  return (
    <div className="common-container">
      <h1 className={styles.title} data-testid="page-title">
        {t("maps.selectMap")}
      </h1>

      <div className={styles.mapsGrid} data-testid="maps-grid">
        {MAPS.map((map) => {
          const isUnlocked = unlockedMaps.includes(map.id);
          const isSelected = selectedMap?.id === map.id;
          const chapterColor = MAP_COLORS[map.id];

          return (
            <div
              key={map.id}
              className={`${styles.mapCard} ${isUnlocked ? styles.unlocked : styles.locked} ${isSelected ? styles.selected : ""}`}
              data-testid={`map-card-${map.id}`}
              onClick={() => handleMapClick(map)}
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
        <div className={styles.mapDetail} data-testid="map-details">
          <h2>{t(`maps.${selectedMap.id}.name`)}</h2>
          <p className={styles.description}>
            {t(`maps.${selectedMap.id}.description`)}
          </p>
          <div className={styles.difficultyInfo}>
            <strong>{t("maps.difficulty")}:</strong>{" "}
            {"★".repeat(selectedMap.difficulty)}
          </div>
        </div>
      )}

      <div className="button-group">
        <button
          className="confirmButton"
          onClick={handleConfirm}
          disabled={!selectedMap}
          data-testid="start-game-button"
        >
          {t("game.start")}
        </button>
        <button
          className="backButton"
          onClick={onBack}
          data-testid="back-to-home-button"
        >
          {t("game.back")}
        </button>
      </div>
    </div>
  );
};

export default MapSelect;
