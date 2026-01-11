// apps/v2/src/mutations/channels/index.ts

/**
 * Barrel export for channel mutation hooks
 *
 * @module mutations/channels
 */

//#region Hook Exports

export { useCreateChannelMutation } from "./useCreateChannelMutation";
export { useUpdateChannelMutation } from "./useUpdateChannelMutation";
export { useDeleteChannelMutation } from "./useDeleteChannelMutation";
export { useJoinChannelMutation } from "./useJoinChannelMutation";
export { useLeaveChannelMutation } from "./useLeaveChannelMutation";

//#endregion

//#region Type Exports

export type {
  ICreateChannelInput,
  ICreateChannelMutationOptions,
} from "./useCreateChannelMutation";

export type {
  IUpdateChannelInput,
  IUpdateChannelMutationOptions,
} from "./useUpdateChannelMutation";

export type {
  IDeleteChannelInput,
  IDeleteChannelResponse,
  IDeleteChannelMutationOptions,
} from "./useDeleteChannelMutation";

export type {
  IJoinChannelInput,
  IJoinChannelMutationOptions,
} from "./useJoinChannelMutation";

export type {
  ILeaveChannelInput,
  ILeaveChannelResponse,
  ILeaveChannelMutationOptions,
} from "./useLeaveChannelMutation";

//#endregion
