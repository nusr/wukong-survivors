import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { useSaveStore } from "./store";

// Import translation files
import zhCN from "./locales/zh-CN.json";
import enUS from "./locales/en-US.json";
import jsJP from "./locales/ja-JP.json";

export type Language = "en-US" | "zh-CN" | "ja-JP";

const resources = {
  "zh-CN": { translation: zhCN },
  "en-US": { translation: enUS },
  "ja-JP": { translation: jsJP },
};

export const SupportLanguageCodes = Object.keys(resources) as Language[];

function I18nConfig() {
  const defaultLang = "en-US";

  let currentLanguage: Language = defaultLang;
  let initialized = false;

  const getSelectedLang = (lang = "") => {
    const selectedLang: any =
      lang ||
      useSaveStore.getState().language ||
      navigator.language ||
      defaultLang;

    if (SupportLanguageCodes.includes(selectedLang)) {
      return selectedLang;
    }

    const findLang = SupportLanguageCodes.find((item) =>
      item.toLocaleLowerCase().includes(selectedLang.toLocaleLowerCase()),
    );
    if (findLang) return findLang;

    return defaultLang;
  };

  const initialize = async (lang = "") => {
    initialized = true;

    currentLanguage = getSelectedLang(lang);

    await i18n.use(initReactI18next).init({
      lng: currentLanguage,
      fallbackLng: defaultLang,
      resources,
      supportedLngs: SupportLanguageCodes,
      interpolation: {
        escapeValue: false,
        prefix: "{",
        suffix: "}",
      },
      react: {
        useSuspense: false,
      },
    });

    return currentLanguage;
  };

  return {
    changeLanguage: async (lang?: Language) => {
      if (!initialized) {
        return await initialize(lang);
      }
      if (lang === currentLanguage) {
        return currentLanguage;
      }

      currentLanguage = getSelectedLang(lang);
      await i18n.changeLanguage(currentLanguage);
      useSaveStore.getState().setLanguage(currentLanguage);
      return currentLanguage;
    },
    t: i18n.t,
    get language(): Language {
      return currentLanguage;
    },
  };
}

const i18nConfig = I18nConfig();

export default i18nConfig;
