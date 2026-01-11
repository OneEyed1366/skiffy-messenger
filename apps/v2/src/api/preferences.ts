// apps/v2/src/api/preferences.ts

/**
 * Preferences API Functions for L7 State Management
 *
 * @module api/preferences
 */

//#region Imports

import type { IPreference } from "@/types";

import { apiClient } from "./client";
import { getPreferencesUrl, getPreferencesByCategoryUrl } from "./urls";

//#endregion

//#region Types

/**
 * Input for saving a single preference
 */
export type ISavePreferenceInput = {
  category: string;
  name: string;
  value: string;
};

/**
 * Input for deleting a preference
 */
export type IDeletePreferenceInput = {
  category: string;
  name: string;
};

//#endregion

//#region Preference API Functions

/**
 * Fetch all preferences for a user
 * @param userId - The user ID
 * @returns Array of user preferences
 */
export async function getPreferences(userId: string): Promise<IPreference[]> {
  const url = getPreferencesUrl(userId);
  return apiClient.get<IPreference[]>(url);
}

/**
 * Fetch preferences by category for a user
 * @param userId - The user ID
 * @param category - The preference category
 * @returns Array of preferences in the category
 */
export async function getPreferencesByCategory(
  userId: string,
  category: string,
): Promise<IPreference[]> {
  const url = getPreferencesByCategoryUrl(userId, category);
  return apiClient.get<IPreference[]>(url);
}

/**
 * Save a single preference for a user
 * @param userId - The user ID
 * @param preference - The preference to save
 * @returns The saved preference
 */
export async function savePreference(
  userId: string,
  preference: ISavePreferenceInput,
): Promise<IPreference> {
  const url = getPreferencesUrl(userId);
  const preferences: IPreference[] = [
    {
      user_id: userId,
      category: preference.category,
      name: preference.name,
      value: preference.value,
    },
  ];
  await apiClient.put<void>(url, preferences);
  return preferences[0];
}

/**
 * Save multiple preferences for a user
 * @param userId - The user ID
 * @param preferences - Array of preferences to save
 * @returns void on success
 */
export async function savePreferences(
  userId: string,
  preferences: ISavePreferenceInput[],
): Promise<void> {
  const url = getPreferencesUrl(userId);
  const fullPreferences: IPreference[] = preferences.map((pref) => ({
    user_id: userId,
    category: pref.category,
    name: pref.name,
    value: pref.value,
  }));
  return apiClient.put<void>(url, fullPreferences);
}

/**
 * Delete a preference for a user
 * @param userId - The user ID
 * @param category - The preference category
 * @param name - The preference name
 * @returns void on success
 */
export async function deletePreference(
  userId: string,
  category: string,
  name: string,
): Promise<void> {
  const url = `${getPreferencesByCategoryUrl(userId, category)}/name/${name}`;
  return apiClient.delete<void>(url);
}

//#endregion
