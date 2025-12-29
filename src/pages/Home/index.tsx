import type { Screen } from "../../types";
import { useTranslation } from "react-i18next";
import { useSaveStore } from "../../store";
import { confirmModal } from "../../util";

interface HomeProps {
  changeScreen: (screen: Screen) => void;
}

export const Home = ({ changeScreen }: HomeProps) => {
  const [t] = useTranslation();

  const handleResetSave = () => {
    if (confirmModal(t("dialog.resetSaveConfirm"))) {
      useSaveStore.getState().resetAll();
      window.location.reload();
    }
  };

  return (
    <div className="center-container">
      <h1 data-testid="page-title">{t("game.title")}</h1>
      <button
        className="confirmButton"
        onClick={() => changeScreen("characterSelect")}
        data-testid="start-button"
      >
        {t("game.start")}
      </button>
      <button
        className="backButton"
        onClick={() => {
          changeScreen("shop");
        }}
        data-testid="shop-button"
      >
        {t("shop.title")}
      </button>

      <button
        className="backButton"
        onClick={() => {
          changeScreen("stats");
        }}
        data-testid="stats-button"
      >
        {t("stats.title")}
      </button>

      <button
        className="backButton"
        onClick={() => {
          changeScreen("settings");
        }}
        data-testid="settings-button"
      >
        {t("settings.title")}
      </button>

      <button
        className="backButton"
        onClick={() => {
          changeScreen("wiki");
        }}
        data-testid="wiki-button"
      >
        {t("wiki.title")}
      </button>

      <button
        className="resetButton"
        onClick={handleResetSave}
        data-testid="reset-save-button"
      >
        {t("game.resetSave")}
      </button>
    </div>
  );
};

export default Home;
