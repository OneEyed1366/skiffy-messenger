// apps/v2/src/mutations/users/useUpdateUserMutation.ts

/**
 * Mutation hook for updating user profile
 *
 * @module mutations/users/useUpdateUserMutation
 */

//#region Imports

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/api";
import { getUserUrl } from "@/api/urls";
import { queryKeys } from "@/queries/keys";
import type { IUserProfile, IUserNotifyProps, IUserTimezone } from "@/types";

//#endregion

//#region Types

/**
 * Input for updating a user profile
 */
export type IUpdateUserInput = {
  user_id: string;
  username?: string;
  email?: string;
  nickname?: string;
  first_name?: string;
  last_name?: string;
  position?: string;
  locale?: string;
  timezone?: Partial<IUserTimezone>;
  notify_props?: Partial<IUserNotifyProps>;
  props?: Record<string, string>;
};

/**
 * Context for optimistic update rollback
 */
type IUpdateUserContext = {
  previousUser: IUserProfile | undefined;
  previousCurrentUser: IUserProfile | undefined;
};

/**
 * Options for useUpdateUserMutation hook
 */
export type IUseUpdateUserMutationOptions = {
  onSuccess?: (user: IUserProfile) => void;
  onError?: (
    error: Error,
    variables: IUpdateUserInput,
    context: IUpdateUserContext | undefined,
  ) => void;
  onSettled?: () => void;
};

//#endregion

//#region API Function

/**
 * Update user profile via API
 * @param input - User update input
 * @returns Updated user profile
 */
export async function updateUser(
  input: IUpdateUserInput,
): Promise<IUserProfile> {
  const { user_id, ...updateData } = input;
  const url = getUserUrl(user_id);
  return apiClient.put<IUserProfile>(url, { id: user_id, ...updateData });
}

//#endregion

//#region Hook

/**
 * Hook for updating user profiles with optimistic updates and cache invalidation
 *
 * Invalidates:
 * - queryKeys.users.detail(userId) - The user detail query
 * - queryKeys.users.current() - The current user query (in case updating self)
 *
 * @example
 * ```typescript
 * const { mutate: updateUser, isPending } = useUpdateUserMutation({
 *   onSuccess: (user) => console.log('Updated:', user.id),
 * });
 *
 * updateUser({
 *   user_id: 'user-123',
 *   nickname: 'NewNickname',
 *   position: 'Developer',
 * });
 * ```
 */
export function useUpdateUserMutation(options?: IUseUpdateUserMutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUser,
    onMutate: async (input) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.users.detail(input.user_id),
      });
      await queryClient.cancelQueries({
        queryKey: queryKeys.users.current(),
      });

      // Snapshot the previous values
      const previousUser = queryClient.getQueryData<IUserProfile>(
        queryKeys.users.detail(input.user_id),
      );
      const previousCurrentUser = queryClient.getQueryData<IUserProfile>(
        queryKeys.users.current(),
      );

      // Optimistically update the user detail
      if (previousUser) {
        queryClient.setQueryData<IUserProfile>(
          queryKeys.users.detail(input.user_id),
          {
            ...previousUser,
            username: input.username ?? previousUser.username,
            email: input.email ?? previousUser.email,
            nickname: input.nickname ?? previousUser.nickname,
            first_name: input.first_name ?? previousUser.first_name,
            last_name: input.last_name ?? previousUser.last_name,
            position: input.position ?? previousUser.position,
            locale: input.locale ?? previousUser.locale,
            timezone:
              input.timezone && previousUser.timezone
                ? ({
                    ...previousUser.timezone,
                    ...input.timezone,
                  } as IUserTimezone)
                : previousUser.timezone,
            notify_props: input.notify_props
              ? { ...previousUser.notify_props, ...input.notify_props }
              : previousUser.notify_props,
            props: input.props ?? previousUser.props,
            update_at: Date.now(),
          },
        );
      }

      // Optimistically update current user if it matches
      if (previousCurrentUser && previousCurrentUser.id === input.user_id) {
        queryClient.setQueryData<IUserProfile>(queryKeys.users.current(), {
          ...previousCurrentUser,
          username: input.username ?? previousCurrentUser.username,
          email: input.email ?? previousCurrentUser.email,
          nickname: input.nickname ?? previousCurrentUser.nickname,
          first_name: input.first_name ?? previousCurrentUser.first_name,
          last_name: input.last_name ?? previousCurrentUser.last_name,
          position: input.position ?? previousCurrentUser.position,
          locale: input.locale ?? previousCurrentUser.locale,
          timezone:
            input.timezone && previousCurrentUser.timezone
              ? ({
                  ...previousCurrentUser.timezone,
                  ...input.timezone,
                } as IUserTimezone)
              : previousCurrentUser.timezone,
          notify_props: input.notify_props
            ? { ...previousCurrentUser.notify_props, ...input.notify_props }
            : previousCurrentUser.notify_props,
          props: input.props ?? previousCurrentUser.props,
          update_at: Date.now(),
        });
      }

      return { previousUser, previousCurrentUser };
    },
    onSuccess: (user) => {
      // Invalidate the user detail
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.detail(user.id),
      });

      // Invalidate current user query
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.current(),
      });

      options?.onSuccess?.(user);
    },
    onError: (error: Error, variables, context) => {
      // Roll back on error
      if (context?.previousUser) {
        queryClient.setQueryData(
          queryKeys.users.detail(variables.user_id),
          context.previousUser,
        );
      }
      if (context?.previousCurrentUser) {
        queryClient.setQueryData(
          queryKeys.users.current(),
          context.previousCurrentUser,
        );
      }

      options?.onError?.(error, variables, context);
    },
    onSettled: () => {
      options?.onSettled?.();
    },
  });
}

//#endregion
