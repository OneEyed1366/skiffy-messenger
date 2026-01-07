// apps/v2/src/types/preference.ts

/**
 * Preference-related type definitions
 * Migrated from: vendor/desktop/webapp/platform/types/src/preferences.ts
 */

//#region Preference

export type IPreference = {
  category: string;
  name: string;
  user_id: string;
  value: string;
};

//#endregion

//#region Preferences Map

export type IPreferences = {
  [key: string]: IPreference;
};

//#endregion
