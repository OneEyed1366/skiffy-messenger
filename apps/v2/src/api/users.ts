// apps/v2/src/api/users.ts

/**
 * Users API Functions
 * Provides HTTP operations for user management
 *
 * @module api/users
 */

//#region Imports

import type { IUserProfile, IUserStatus, IUserStatusValue } from "@/types";

import { apiClient } from "./client";
import { getCurrentUserUrl, getUsersUrl, getUserUrl } from "./urls";

//#endregion

//#region Types

/**
 * Parameters for fetching users list
 */
export type IGetUsersParams = {
  page?: number;
  per_page?: number;
  in_team?: string;
  in_channel?: string;
  not_in_channel?: string;
  group_constrained?: boolean;
  without_team?: boolean;
  active?: boolean;
  inactive?: boolean;
  role?: string;
  sort?: "last_activity_at" | "create_at" | "";
};

/**
 * Input type for updating a user profile
 */
export type IUpdateUserInput = Partial<
  Pick<
    IUserProfile,
    | "email"
    | "username"
    | "first_name"
    | "last_name"
    | "nickname"
    | "position"
    | "locale"
    | "notify_props"
  >
>;

/**
 * Input type for updating user status
 */
export type IUpdateStatusInput = {
  status: IUserStatusValue;
  dnd_end_time?: number;
};

//#endregion

//#region API Functions

/**
 * Fetch users list with optional filtering
 * @param params - Optional filter parameters
 * @returns Array of user profiles
 */
export async function getUsers(
  params?: IGetUsersParams,
): Promise<IUserProfile[]> {
  const url = new URL(getUsersUrl());

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        url.searchParams.append(key, String(value));
      }
    });
  }

  return apiClient.get<IUserProfile[]>(url.toString());
}

/**
 * Fetch a single user by ID
 * @param userId - The user ID
 * @returns User profile data
 */
export async function getUser(userId: string): Promise<IUserProfile> {
  return apiClient.get<IUserProfile>(getUserUrl(userId));
}

/**
 * Fetch the current authenticated user
 * @returns Current user profile data
 */
export async function getCurrentUser(): Promise<IUserProfile> {
  return apiClient.get<IUserProfile>(getCurrentUserUrl());
}

/**
 * Update a user's profile
 * @param userId - The user ID
 * @param data - User profile update data
 * @returns Updated user profile
 */
export async function updateUser(
  userId: string,
  data: IUpdateUserInput,
): Promise<IUserProfile> {
  return apiClient.put<IUserProfile>(getUserUrl(userId), data);
}

/**
 * Update a user's status
 * @param userId - The user ID
 * @param data - Status update data
 * @returns Updated user status
 */
export async function updateStatus(
  userId: string,
  data: IUpdateStatusInput,
): Promise<IUserStatus> {
  return apiClient.put<IUserStatus>(`${getUserUrl(userId)}/status`, data);
}

//#endregion
