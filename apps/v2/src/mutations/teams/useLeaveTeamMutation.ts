// apps/v2/src/mutations/teams/useLeaveTeamMutation.ts

/**
 * Leave Team Mutation Hook
 * Removes the current user from a team and invalidates the teams list cache
 *
 * @module mutations/teams/useLeaveTeamMutation
 */

//#region Imports

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/api";
import { getTeamMembersUrl } from "@/api/urls";
import { queryKeys } from "@/queries/keys";

//#endregion

//#region Types

/**
 * Input data for leaving a team
 */
export type ILeaveTeamInput = {
  team_id: string;
  user_id: string;
};

/**
 * Response from leave team API
 */
export type ILeaveTeamResponse = {
  status: string;
};

/**
 * Options for useLeaveTeamMutation
 */
export type ILeaveTeamMutationOptions = {
  onSuccess?: (response: ILeaveTeamResponse) => void;
  onError?: (error: Error) => void;
};

//#endregion

//#region API Function

/**
 * Leave a team via API
 * @param input - Team leave data
 * @returns Leave status response
 */
async function leaveTeam(input: ILeaveTeamInput): Promise<ILeaveTeamResponse> {
  const url = `${getTeamMembersUrl(input.team_id)}/${input.user_id}`;
  return apiClient.delete<ILeaveTeamResponse>(url);
}

//#endregion

//#region Hook

/**
 * Hook for leaving a team
 *
 * @example
 * ```typescript
 * const { mutate, isPending } = useLeaveTeamMutation();
 *
 * mutate({
 *   team_id: 'team123',
 *   user_id: 'user123',
 * });
 * ```
 */
export function useLeaveTeamMutation(options?: ILeaveTeamMutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: leaveTeam,
    onSuccess: (response) => {
      // Invalidate the teams list to refetch without the user
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.list(),
      });
      options?.onSuccess?.(response);
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}

//#endregion
