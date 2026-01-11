import i18next, { Resource, ResourceLanguage } from "i18next";
import { initReactI18next } from "react-i18next";
import { ILanguageKey, LANGUAGES_ARRAY, LANGUAGE_KEYS_SET } from "./locales";

const NS = "translation" as const;

// eslint-disable-next-line import/no-named-as-default-member
i18next.use(initReactI18next).init({
  supportedLngs: Array.from(LANGUAGE_KEYS_SET),
  resources: LANGUAGES_ARRAY.reduce(
    (acc, { value, url }) =>
      ({
        ...acc,
        [value]: { [NS]: url } satisfies ResourceLanguage,
      }) satisfies Resource,
    {} as Resource,
  ),
  fallbackLng: "en" satisfies ILanguageKey,
  interpolation: {
    escapeValue: false,
  },
});

export default i18next;
