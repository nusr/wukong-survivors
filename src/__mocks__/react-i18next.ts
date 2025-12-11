import enUS from "../locales/en-US.json";
import get from "lodash/get";

type T = (key: string, options: any) => string;

const t = (key: string, options: any): string => {
  const template: string = get(enUS, key) || key;

  return template.replace(/{{([^}]+)}}/g, (match, key) => {
    return options[key] !== undefined ? options[key] : match;
  });
};

const moreLanguageInfo = {
  language: "en-US",
};

const useTranslation = (): [T, typeof moreLanguageInfo] => {
  return [t, moreLanguageInfo];
};

const initReactI18next = {};

const init = () => {};

export const mockChangeLanguage = vi.fn();

vi.mock("react-i18next", () => {
  return {
    useTranslation,
    initReactI18next,
  };
});

vi.mock("i18next", () => {
  return {
    default: {
      t,
      use: () => ({ init }),
      changeLanguage: (...args: unknown[]) => mockChangeLanguage(...args),
    },
  };
});

export { useTranslation, initReactI18next, t };
