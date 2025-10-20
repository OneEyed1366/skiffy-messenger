import * as Localization from "expo-localization";
import i18next, { Resource } from "i18next";
import Backend from "i18next-chained-backend";
import AsyncStoragePlugin from "i18next-react-native-async-storage";
import { initReactI18next } from "react-i18next";
import { ILanguageKey, LANGUAGES_ARRAY, LANGUAGE_KEYS_SET } from "./locales";

function getMyLocale(): ILanguageKey {
  const { languageCode } = (Localization.getLocales().at(0) ?? {}) as {
    languageCode?: ILanguageKey;
  };
  if (!languageCode || !LANGUAGE_KEYS_SET.has(languageCode)) return "en";
  return languageCode;
}

// eslint-disable-next-line import/no-named-as-default-member
i18next
  .use(Backend)
  .use(AsyncStoragePlugin((cb) => cb(getMyLocale())))
  .use(initReactI18next)
  .init({
    supportedLngs: Array.from(LANGUAGE_KEYS_SET),
    resources: LANGUAGES_ARRAY.reduce(
      (acc, { value, url }) =>
        ({
          ...acc,
          [value]: { translation: url },
        }) satisfies Record<ILanguageKey, Resource>,
      {} as Record<ILanguageKey, Resource>,
    ),
    fallbackLng: "en" satisfies ILanguageKey,
    interpolation: {
      escapeValue: false,
    },
  });

export default i18next;
