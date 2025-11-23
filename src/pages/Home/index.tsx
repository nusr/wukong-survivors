import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { CHARACTERS_DATA, getCharacterImagePath } from "../../constant";
import type { CharacterData, Screen } from "../../types";
import {
  useAppStore,
  useSaveStore,
  useTotalGold,
  useUnlockedCharacters,
  useSelectedCharacter,
} from "../../store";
import styles from "./index.module.css";
import { LanguageSelect, Stats, Dialog } from "../../components";

const characterList = Object.values(CHARACTERS_DATA);

interface CharacterSelectProps {
  changeScreen: (screen: Screen) => void;
}

const Home: React.FC<CharacterSelectProps> = ({ changeScreen }) => {
  const [t] = useTranslation();
  const totalGold = useTotalGold();
  const unlockedCharacters = useUnlockedCharacters();
  const [visible, setVisible] = useState(false);

  const characterId = useSelectedCharacter();

  const selectedCharacter = useMemo(() => {
    return useAppStore.getState().getSelectCharacter();
  }, [characterId]);

  const handleCharacterClick = (character: CharacterData) => {
    if (unlockedCharacters.includes(character.id)) {
      useAppStore.getState().selectCharacter(character.id);
    }
  };

  const handleConfirm = () => {
    if (selectedCharacter) {
      useAppStore.getState().selectCharacter(selectedCharacter.id);
      changeScreen("mapSelect");
    }
  };

  const handleResetSave = () => {
    if (window.confirm(t("dialog.resetSaveConfirm"))) {
      useSaveStore.getState().resetAll();
      window.location.reload();
    }
  };

  return (
    <div className={styles.characterSelect}>
      <div className={styles.header}>
        <div className={styles.statsPanel}>
          <span className={styles.statLabel}>💰 {t("stats.gold")}:</span>
          &nbsp;
          <span className={styles.statValue}>{totalGold}</span>
        </div>
        <LanguageSelect />
      </div>
      <div className={styles.charactersGrid}>
        {characterList.map((character) => {
          const isUnlocked = unlockedCharacters.includes(character.id);
          const isSelected = selectedCharacter?.id === character.id;

          return (
            <div
              key={character.id}
              className={`${styles.characterCard} ${isUnlocked ? styles.unlocked : styles.locked} ${isSelected ? styles.selected : ""}`}
              onClick={() => handleCharacterClick(character)}
            >
              <div className={styles.characterIcon}>
                {isUnlocked ? (
                  <img
                    src={getCharacterImagePath(character.id)}
                    alt={t(`characters.${character.id}.name`)}
                    className={styles.unlockedChar}
                    style={{
                      color: character.color,
                    }}
                  />
                ) : (
                  <div className={styles.lockedIcon}>🔒</div>
                )}
              </div>

              <div className={styles.characterName}>
                {isUnlocked ? t(`characters.${character.id}.name`) : "???"}
              </div>

              {!isUnlocked && (
                <div className={styles.unlockCondition}>
                  {t(`unlockConditions.${character.unlockCondition.type}`, {
                    value: character.unlockCondition.value,
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedCharacter && (
        <div className={styles.characterDetail}>
          <h2>{t(`characters.${selectedCharacter.id}.name`)}</h2>
          <p className={styles.description}>
            {t(`characters.${selectedCharacter.id}.description`)}
          </p>
          <div className={styles.stats}>
            <div className={styles.stat}>
              {/* eslint-disable-next-line i18next/no-literal-string */}
              <span className={styles.statName}>❤️ {t("stats.level")}</span>
              <span className={styles.statValue}>
                {selectedCharacter.stats.baseHealth}
              </span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statName}>
                🏃 {t("upgrades.speed.name")}
              </span>
              <span className={styles.statValue}>
                {selectedCharacter.stats.baseSpeed}
              </span>
            </div>
            <div className={styles.stat}>
              {/* eslint-disable-next-line i18next/no-literal-string */}
              <span className={styles.statName}>
                ⚔️ {t("upgrades.attack.name")}
              </span>
              <span className={styles.statValue}>
                {selectedCharacter.stats.baseDamage}
              </span>
            </div>
            <div className={styles.stat}>
              {/* eslint-disable-next-line i18next/no-literal-string */}
              <span className={styles.statName}>
                🛡️ {t("upgrades.armor.name")}
              </span>
              <span className={styles.statValue}>
                {selectedCharacter.stats.baseArmor}
              </span>
            </div>
            <div className={styles.stat}>
              {}
              <span className={styles.statName}>
                🍀 {t("upgrades.luck.name")}
              </span>
              <span className={styles.statValue}>
                {selectedCharacter.stats.baseLuck}
              </span>
            </div>
            {selectedCharacter.startingWeapon && (
              <div className={styles.stat}>
                {/* eslint-disable-next-line i18next/no-literal-string */}
                <span className={styles.statName}>
                  🗡️ {t("characters.specialWeapon")}
                </span>
                <span className={styles.statValue}>
                  {t(`weapons.${selectedCharacter.startingWeapon}.name`)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className={styles.buttons}>
        <button
          className="confirmButton"
          onClick={handleConfirm}
          disabled={!selectedCharacter}
        >
          {t("game.start")}
        </button>

        <button className="backButton" onClick={() => changeScreen("shop")}>
          <img src="./assets/shop.svg" alt={t("shop.title")} />
        </button>

        <button className="backButton" onClick={() => setVisible(true)}>
          {t("game.stats")}
        </button>

        <button className="resetButton" onClick={handleResetSave}>
          {t("game.resetSave")}
        </button>
      </div>
      <Dialog
        title={t("stats.title")}
        visible={visible}
        onCancel={() => setVisible(false)}
        hideButtons
      >
        <Stats />
      </Dialog>
    </div>
  );
};

export default Home;
