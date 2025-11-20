import styles from "./index.module.css";
import { SupportLanguageCodes, type Language } from "../../i18n";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import { useLanguage } from "../../store";

const LanguageSelect = () => {
  const [t] = useTranslation();
  const language = useLanguage();

  return (
    <div className={styles.languageSelector}>
      <label>{t("settings.language")}:</label>
      <select
        value={language}
        onChange={(e) => i18n.changeLanguage(e.target.value as Language)}
      >
        {SupportLanguageCodes.map((lang) => (
          <option key={lang} value={lang}>
            {t(`settings.${lang}`)}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelect;
