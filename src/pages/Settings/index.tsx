import { LanguageSelect } from "../../components";
import { useTranslation } from "react-i18next";
import {
  useEnableAutoSelect,
  useEnableUnlockAll,
  useMusicEnabled,
  useMusicVolume,
  useGameTime,
  useSettingStore,
  useEnableFullScreen,
} from "../../store";
import styles from "./index.module.css";
import { toggleFullScreen, confirmModal } from "../../util";

export const Settings = ({ onBack }: { onBack: () => void }) => {
  const [t] = useTranslation();
  const enableAutoSelect = useEnableAutoSelect();
  const enableUnlockAll = useEnableUnlockAll();
  const musicEnabled = useMusicEnabled();
  const musicVolume = useMusicVolume();
  const gameTime = Math.floor(useGameTime() / 60);
  const enableFullScreen = useEnableFullScreen();
  return (
    <div className="center-container">
      <button
        className={`backButton closeButton ${styles.closeButton}`}
        onClick={onBack}
        data-testid="back-to-home-button"
      >
        X
      </button>
      <h1 data-testid="page-title">{t("settings.title")}</h1>
      <div className={styles.list}>
        <label htmlFor="select-language">{t("settings.chooseLanguage")}</label>
        <LanguageSelect />
      </div>
      <div className={styles.list}>
        <label htmlFor="auto-select">{t("settings.autoSelect")}</label>
        <input
          type="checkbox"
          id="auto-select"
          name="auto-select"
          checked={enableAutoSelect}
          onChange={(e) =>
            useSettingStore
              .getState()
              .setAutoSelectEnabled(Boolean(e.target.checked))
          }
        />
      </div>
      <div className={styles.list}>
        <label htmlFor="unlock-all">{t("settings.unlockAll")}</label>
        <input
          type="checkbox"
          id="unlock-all"
          name="unlock-all"
          checked={enableUnlockAll}
          onChange={(e) =>
            useSettingStore
              .getState()
              .setUnlockAllEnabled(Boolean(e.target.checked))
          }
        />
      </div>
      <div className={styles.list}>
        <label htmlFor="full-screen">{t("settings.enableFullScreen")}</label>
        <input
          type="checkbox"
          id="full-screen"
          name="full-screen"
          checked={enableFullScreen}
          onChange={(e) => {
            const enable = Boolean(e.target.checked);
            useSettingStore.getState().setFullScreenEnabled(enable);
            toggleFullScreen(enable);
          }}
        />
      </div>
      <div className={styles.list}>
        <label htmlFor="game-time">
          {t("settings.gameTime", { value: gameTime })}
        </label>
        <input
          type="range"
          id="game-time"
          name="game-time"
          min="1"
          max="120"
          value={gameTime}
          step="1"
          onChange={(e) => {
            const value = Number(e.target.value) * 60;
            useSettingStore.getState().setGameTime(value);
          }}
        />
      </div>
      <div className={styles.list}>
        <label htmlFor="enable-music">{t("settings.enableMusic")}</label>
        <input
          type="checkbox"
          id="enable-music"
          name="enable-music"
          checked={musicEnabled}
          onChange={(e) =>
            useSettingStore
              .getState()
              .setMusicEnabled(Boolean(e.target.checked))
          }
        />
      </div>
      <div className={styles.list}>
        <label htmlFor="music-volume">{`${t("settings.musicVolume")}: ${musicVolume}`}</label>
        <input
          type="range"
          id="music-volume"
          name="music-volume"
          min="0"
          max="1"
          value={musicVolume}
          step="0.01"
          onChange={(e) => {
            const value = Number(e.target.value);
            useSettingStore.getState().setMusicVolume(value);
          }}
        />
      </div>
      <button
        className={`resetButton ${styles.resetButton}`}
        onClick={() => {
          if (confirmModal(t("settings.resetConfirm"))) {
            useSettingStore.getState().resetAll();
          }
        }}
        data-testid="reset-setting-button"
      >
        {t("settings.resetSetting")}
      </button>
    </div>
  );
};

export default Settings;
