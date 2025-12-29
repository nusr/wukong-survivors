import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { useSettingStore } from "./store";
import type { Language } from "./types";

// Import translation files
import zhCN from "./locales/zh-CN.json";
import enUS from "./locales/en-US.json";
import jaJP from "./locales/ja-JP.json";
import deDE from "./locales/de-DE.json";
import esES from "./locales/es-ES.json";
import frFR from "./locales/fr-FR.json";
import koKR from "./locales/ko-KR.json";
import ptBR from "./locales/pt-BR.json";
import ruRU from "./locales/ru-RU.json";
import zhTW from "./locales/zh-TW.json";

const resources = {
  "zh-CN": { translation: zhCN },
  "en-US": { translation: enUS },
  "ja-JP": { translation: jaJP },
  "de-DE": { translation: deDE },
  "es-ES": { translation: esES },
  "fr-FR": { translation: frFR },
  "ko-KR": { translation: koKR },
  "pt-BR": { translation: ptBR },
  "ru-RU": { translation: ruRU },
  "zh-TW": { translation: zhTW },
};

export const SupportLanguageCodes = Object.keys(resources) as Language[];

function I18nConfig() {
  const defaultLang = "en-US";

  let currentLanguage: Language = defaultLang;
  let initialized = false;

  const getSelectedLang = (lang = "") => {
    const selectedLang: any =
      lang ||
      useSettingStore.getState().language ||
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
        await initialize(lang);
      } else if (lang && lang !== currentLanguage) {
        currentLanguage = getSelectedLang(lang);
        await i18n.changeLanguage(currentLanguage);
      }

      useSettingStore.getState().setLanguage(currentLanguage);

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
