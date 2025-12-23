import * as Localization from "expo-localization";
import i18next, { Resource, ResourceLanguage } from "i18next";
import Backend from "i18next-chained-backend";
import AsyncStoragePlugin from "i18next-react-native-async-storage";
import { initReactI18next } from "react-i18next";
import { ILanguageKey, ILanguageTranslations, LANGUAGES_ARRAY, LANGUAGE_KEYS_SET } from "./locales";

const NS = 'translation' as const

declare module 'i18next' {
  type IDefaultNS = typeof NS

  interface CustomTypeOptions {
    enableSelector: false;
    defaultNS: IDefaultNS;
    resources:  Record<IDefaultNS, ILanguageTranslations>;
  }
}

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
          [value]: { [NS]: url } satisfies ResourceLanguage,
        } satisfies Resource),
      {} as Resource,
    ),
    fallbackLng: "en" satisfies ILanguageKey,
    interpolation: {
      escapeValue: false,
    },
  });

export default i18next;
