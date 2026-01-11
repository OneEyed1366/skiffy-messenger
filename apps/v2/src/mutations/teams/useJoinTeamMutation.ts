// apps/v2/src/mutations/teams/useJoinTeamMutation.ts

/**
 * Join Team Mutation Hook
 * Adds the current user to a team and invalidates the teams list cache
 *
 * @module mutations/teams/useJoinTeamMutation
 */

//#region Imports

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/api";
import { getTeamMembersUrl } from "@/api/urls";
import { queryKeys } from "@/queries/keys";
import type { ITeamMembership } from "@/types";

//#endregion

//#region Types

/**
 * Input data for joining a team
 */
export type IJoinTeamInput = {
  team_id: string;
  user_id: string;
};

/**
 * Options for useJoinTeamMutation
 */
export type IJoinTeamMutationOptions = {
  onSuccess?: (membership: ITeamMembership) => void;
  onError?: (error: Error) => void;
};

//#endregion

//#region API Function

/**
 * Join a team via API
 * @param input - Team join data
 * @returns Team membership
 */
async function joinTeam(input: IJoinTeamInput): Promise<ITeamMembership> {
  const url = getTeamMembersUrl(input.team_id);
  return apiClient.post<ITeamMembership>(url, { user_id: input.user_id });
}

//#endregion

//#region Hook

/**
 * Hook for joining a team
 *
 * @example
 * ```typescript
 * const { mutate, isPending } = useJoinTeamMutation();
 *
 * mutate({
 *   team_id: 'team123',
 *   user_id: 'user123',
 * });
 * ```
 */
export function useJoinTeamMutation(options?: IJoinTeamMutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: joinTeam,
    onSuccess: (membership) => {
      // Invalidate the teams list to refetch with updated membership
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.list(),
      });
      options?.onSuccess?.(membership);
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}

//#endregion
