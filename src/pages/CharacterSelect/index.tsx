import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { CHARACTERS_DATA } from "../../constant/characters";
import { getCharacterImagePath } from "../../util";
import type { CharacterData } from "../../types";
import {
  useAppStore,
  useUnlockedCharacters,
  useSelectedCharacter,
} from "../../store";
import styles from "./index.module.css";

const characterList = Object.values(CHARACTERS_DATA);

interface CharacterSelectProps {
  onConfirm: () => void;
  onBack: () => void;
}

const CharacterSelect: React.FC<CharacterSelectProps> = ({
  onConfirm,
  onBack,
}) => {
  const [t] = useTranslation();
  const unlockedCharacters = useUnlockedCharacters();
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
      onConfirm();
    }
  };

  return (
    <div className="common-container">
      <h1 data-testid="page-title">{t("characters.selectCharacter")}</h1>
      <div className={styles.charactersGrid} data-testid="characters-grid">
        {characterList.map((character) => {
          const isUnlocked = unlockedCharacters.includes(character.id);
          const isSelected = selectedCharacter?.id === character.id;

          return (
            <div
              key={character.id}
              className={`${styles.characterCard} ${isUnlocked ? styles.unlocked : styles.locked} ${isSelected ? styles.selected : ""}`}
              data-testid={`character-card-${character.id}`}
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
                {isUnlocked
                  ? t(`characters.${character.id}.name`)
                  : t(`unlockConditions.${character.unlockCondition.type}`, {
                      value: character.unlockCondition.value,
                    })}
              </div>
            </div>
          );
        })}
      </div>

      {selectedCharacter && (
        <div className={styles.characterDetail} data-testid="character-details">
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

      <div className="button-group">
        <button
          className="confirmButton"
          onClick={handleConfirm}
          disabled={!selectedCharacter}
          data-testid="start-button"
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

export default CharacterSelect;
