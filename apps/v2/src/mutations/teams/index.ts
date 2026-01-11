// apps/v2/src/mutations/teams/index.ts

/**
 * Barrel export for team mutation hooks
 *
 * @module mutations/teams
 */

//#region Hook Exports

export { useJoinTeamMutation } from "./useJoinTeamMutation";
export { useLeaveTeamMutation } from "./useLeaveTeamMutation";

//#endregion

//#region Type Exports

export type {
  IJoinTeamInput,
  IJoinTeamMutationOptions,
} from "./useJoinTeamMutation";

export type {
  ILeaveTeamInput,
  ILeaveTeamResponse,
  ILeaveTeamMutationOptions,
} from "./useLeaveTeamMutation";

//#endregion
