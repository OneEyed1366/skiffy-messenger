// apps/v2/src/api/channels.ts

/**
 * Channels API Functions
 * Provides HTTP operations for channel management
 *
 * @module api/channels
 */

//#region Imports

import type { IChannel, IChannelMembership } from "@/types";

import { apiClient } from "./client";
import {
  getChannelMembersUrl,
  getChannelUrl,
  getTeamChannelsUrl,
} from "./urls";

//#endregion

//#region Types

/**
 * Input type for creating a channel
 */
export type ICreateChannelInput = {
  display_name: string;
  name: string;
  type: "O" | "P";
  purpose?: string;
  header?: string;
};

/**
 * Input type for updating a channel
 */
export type IUpdateChannelInput = Partial<
  Pick<IChannel, "display_name" | "name" | "purpose" | "header">
>;

/**
 * Response type for join/leave operations
 */
export type IChannelMemberResponse = IChannelMembership;

//#endregion

//#region API Functions

/**
 * Fetch all channels for a team
 * @param teamId - The team ID
 * @returns Array of channels
 */
export async function getChannels(teamId: string): Promise<IChannel[]> {
  return apiClient.get<IChannel[]>(getTeamChannelsUrl(teamId));
}

/**
 * Fetch a single channel by ID
 * @param channelId - The channel ID
 * @returns Channel data
 */
export async function getChannel(channelId: string): Promise<IChannel> {
  return apiClient.get<IChannel>(getChannelUrl(channelId));
}

/**
 * Fetch members of a channel
 * @param channelId - The channel ID
 * @returns Array of channel memberships
 */
export async function getChannelMembers(
  channelId: string,
): Promise<IChannelMembership[]> {
  return apiClient.get<IChannelMembership[]>(getChannelMembersUrl(channelId));
}

/**
 * Create a new channel in a team
 * @param teamId - The team ID
 * @param channel - Channel creation data
 * @returns Created channel
 */
export async function createChannel(
  teamId: string,
  channel: ICreateChannelInput,
): Promise<IChannel> {
  return apiClient.post<IChannel>(getTeamChannelsUrl(teamId), channel);
}

/**
 * Update an existing channel
 * @param channelId - The channel ID
 * @param channel - Channel update data
 * @returns Updated channel
 */
export async function updateChannel(
  channelId: string,
  channel: IUpdateChannelInput,
): Promise<IChannel> {
  return apiClient.put<IChannel>(getChannelUrl(channelId), channel);
}

/**
 * Delete (archive) a channel
 * @param channelId - The channel ID
 * @returns Void on success
 */
export async function deleteChannel(channelId: string): Promise<void> {
  return apiClient.delete<void>(getChannelUrl(channelId));
}

/**
 * Join a channel (add current user as member)
 * @param channelId - The channel ID
 * @returns Channel membership
 */
export async function joinChannel(
  channelId: string,
): Promise<IChannelMemberResponse> {
  return apiClient.post<IChannelMemberResponse>(
    getChannelMembersUrl(channelId),
  );
}

/**
 * Leave a channel (remove current user from members)
 * @param channelId - The channel ID
 * @returns Void on success
 */
export async function leaveChannel(channelId: string): Promise<void> {
  return apiClient.delete<void>(`${getChannelMembersUrl(channelId)}/me`);
}

//#endregion
