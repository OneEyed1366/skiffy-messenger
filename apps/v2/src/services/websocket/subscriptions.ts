// apps/v2/src/services/websocket/subscriptions.ts

import { Subscription } from "rxjs";
import { QueryClient, InfiniteData } from "@tanstack/react-query";

import { queryKeys } from "@/queries/keys";
import { useConnectionStore } from "@/stores/connection";
import { useTypingStore } from "@/stores/ephemeral/useTypingStore";
import { usePresenceStore, type IUserPresence } from "@/stores/ephemeral/usePresenceStore";
import { useDraftsStore } from "@/stores/ephemeral/useDraftsStore";
import type { IPost, IReaction, IUserStatusValue } from "@/types";

import {
  posts$,
  typing$,
  channels$,
  users$,
  teams$,
  reactions$,
  threads$,
  preferences$,
  drafts$,
  sidebar$,
  system$,
  type IPostEventPayload,
  type ITypingEventPayload,
  type IChannelEventPayload,
  type IUserEventPayload,
  type ITeamEventPayload,
  type IReactionEventPayload,
  type IThreadEventPayload,
  type IPreferenceEventPayload,
  type IDraftEventPayload,
  type ISidebarEventPayload,
  type ISystemEventPayload,
} from "./streams";

//#region Types

type ISubscriptionContext = {
  queryClient: QueryClient;
  currentUserId: string | null;
  currentTeamId: string | null;
};

type IPaginatedPostList = {
  order: string[];
  posts: Record<string, IPost>;
  next_post_id?: string;
  prev_post_id?: string;
};

//#endregion Types

//#region Helpers

function updatePostInInfiniteData(
  data: InfiniteData<IPaginatedPostList> | undefined,
  post: IPost,
): InfiniteData<IPaginatedPostList> | undefined {
  if (!data) return data;

  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      posts: page.posts[post.id]
        ? { ...page.posts, [post.id]: post }
        : page.posts,
    })),
  };
}

function removePostFromInfiniteData(
  data: InfiniteData<IPaginatedPostList> | undefined,
  postId: string,
): InfiniteData<IPaginatedPostList> | undefined {
  if (!data) return data;

  return {
    ...data,
    pages: data.pages.map((page) => {
      const { [postId]: _removed, ...remainingPosts } = page.posts;
      return {
        ...page,
        order: page.order.filter((id) => id !== postId),
        posts: remainingPosts,
      };
    }),
  };
}

function mapStatusToPresence(status: IUserStatusValue): IUserPresence {
  switch (status) {
    case "online":
      return "online";
    case "away":
      return "away";
    case "dnd":
      return "dnd";
    default:
      return "offline";
  }
}

//#endregion Helpers

//#region Server State Subscriptions (TanStack Query)

function initPostsSubscription(ctx: ISubscriptionContext): Subscription {
  return posts$.subscribe((event: IPostEventPayload) => {
    const { channelId, post, type } = event;
    if (!channelId || !post) return;

    switch (type) {
      case "posted":
        ctx.queryClient.setQueryData<InfiniteData<IPaginatedPostList>>(
          queryKeys.posts.infinite(channelId),
          (old) => {
            if (!old?.pages?.[0]) return old;
            const firstPage = old.pages[0];
            return {
              ...old,
              pages: [
                {
                  ...firstPage,
                  order: [post.id, ...firstPage.order],
                  posts: { ...firstPage.posts, [post.id]: post },
                },
                ...old.pages.slice(1),
              ],
            };
          },
        );
        break;

      case "post_edited":
        ctx.queryClient.setQueryData<InfiniteData<IPaginatedPostList>>(
          queryKeys.posts.infinite(channelId),
          (old) => updatePostInInfiniteData(old, post),
        );
        ctx.queryClient.setQueryData(queryKeys.posts.detail(post.id), post);
        break;

      case "post_deleted":
        ctx.queryClient.setQueryData<InfiniteData<IPaginatedPostList>>(
          queryKeys.posts.infinite(channelId),
          (old) => removePostFromInfiniteData(old, post.id),
        );
        break;
    }
  });
}

function initChannelsSubscription(ctx: ISubscriptionContext): Subscription {
  return channels$.subscribe((event: IChannelEventPayload) => {
    const { type, channel, channelId } = event;

    switch (type) {
      case "channel_created":
        if (channel) {
          ctx.queryClient.invalidateQueries({
            queryKey: queryKeys.channels.list(channel.team_id),
          });
        }
        break;

      case "channel_updated":
        if (channel) {
          ctx.queryClient.setQueryData(
            queryKeys.channels.detail(channel.id),
            channel,
          );
        }
        break;

      case "channel_deleted":
        if (channelId) {
          ctx.queryClient.removeQueries({
            queryKey: queryKeys.channels.detail(channelId),
          });
          ctx.queryClient.invalidateQueries({
            queryKey: queryKeys.channels.all,
          });
        }
        break;

      case "channel_member_updated":
        if (channelId) {
          ctx.queryClient.invalidateQueries({
            queryKey: queryKeys.channels.members(channelId),
          });
        }
        break;

      case "direct_added":
      case "group_added":
        ctx.queryClient.invalidateQueries({
          queryKey: queryKeys.channels.all,
        });
        break;
    }
  });
}

function initUsersSubscription(ctx: ISubscriptionContext): Subscription {
  return users$.subscribe((event: IUserEventPayload) => {
    const { type, user, userId, status } = event;

    switch (type) {
      case "user_updated":
        if (user) {
          ctx.queryClient.setQueryData(queryKeys.users.detail(user.id), user);
          if (ctx.currentUserId === user.id) {
            ctx.queryClient.setQueryData(queryKeys.users.current(), user);
          }
        }
        break;

      case "status_change":
        if (userId && status) {
          usePresenceStore.getState().setPresence(userId, mapStatusToPresence(status));
        }
        break;

      case "user_added":
      case "user_removed":
        ctx.queryClient.invalidateQueries({
          queryKey: queryKeys.users.all,
        });
        break;
    }
  });
}

function initTeamsSubscription(ctx: ISubscriptionContext): Subscription {
  return teams$.subscribe((event: ITeamEventPayload) => {
    const { type, team, teamId } = event;

    switch (type) {
      case "added_to_team":
      case "join_team":
      case "new_user":
        ctx.queryClient.invalidateQueries({ queryKey: queryKeys.teams.list() });
        break;

      case "update_team":
        if (team) {
          ctx.queryClient.setQueryData(queryKeys.teams.detail(team.id), team);
        }
        break;

      case "leave_team":
      case "delete_team":
        if (teamId) {
          ctx.queryClient.removeQueries({
            queryKey: queryKeys.teams.detail(teamId),
          });
          ctx.queryClient.invalidateQueries({ queryKey: queryKeys.teams.list() });
        }
        break;
    }
  });
}

function initThreadsSubscription(ctx: ISubscriptionContext): Subscription {
  return threads$.subscribe((event: IThreadEventPayload) => {
    const { type, thread } = event;
    if (!ctx.currentUserId) return;

    switch (type) {
      case "thread_updated":
        if (thread) {
          ctx.queryClient.setQueryData(
            queryKeys.threads.detail(ctx.currentUserId, thread.id),
            thread,
          );
          ctx.queryClient.invalidateQueries({ queryKey: queryKeys.threads.all });
        }
        break;

      case "thread_follow_changed":
      case "thread_read_changed":
        ctx.queryClient.invalidateQueries({ queryKey: queryKeys.threads.all });
        break;
    }
  });
}

function initReactionsSubscription(ctx: ISubscriptionContext): Subscription {
  return reactions$.subscribe((event: IReactionEventPayload) => {
    const { type, reaction, postId } = event;
    if (!postId || !reaction) return;

    switch (type) {
      case "reaction_added":
        ctx.queryClient.setQueryData<IReaction[]>(
          queryKeys.reactions.forPost(postId),
          (old) => (old ? [...old, reaction] : [reaction]),
        );
        break;

      case "reaction_removed":
        ctx.queryClient.setQueryData<IReaction[]>(
          queryKeys.reactions.forPost(postId),
          (old) =>
            old?.filter(
              (r) =>
                !(
                  r.user_id === reaction.user_id &&
                  r.emoji_name === reaction.emoji_name
                ),
            ),
        );
        break;
    }
  });
}

function initPreferencesSubscription(ctx: ISubscriptionContext): Subscription {
  return preferences$.subscribe((event: IPreferenceEventPayload) => {
    const { type, preferences } = event;

    if (type === "preferences_deleted" || preferences.length > 0) {
      ctx.queryClient.invalidateQueries({ queryKey: queryKeys.preferences.all });
      preferences.forEach((pref) => {
        ctx.queryClient.invalidateQueries({
          queryKey: queryKeys.preferences.byCategory(pref.category),
        });
      });
    }
  });
}

function initSidebarSubscription(ctx: ISubscriptionContext): Subscription {
  return sidebar$.subscribe((event: ISidebarEventPayload) => {
    const { teamId } = event;
    if (!ctx.currentUserId || !teamId) return;

    ctx.queryClient.invalidateQueries({
      queryKey: queryKeys.categories.forTeam(ctx.currentUserId, teamId),
    });
  });
}

//#endregion Server State Subscriptions

//#region Client State Subscriptions (Zustand)

function initTypingSubscription(): Subscription {
  return typing$.subscribe((event: ITypingEventPayload) => {
    const { channelId, userId, isTyping } = event;
    const store = useTypingStore.getState();

    if (isTyping) {
      // Username will be resolved from user cache if needed
      store.addTyping(channelId, userId, "");
    } else {
      store.removeTyping(channelId, userId);
    }
  });
}

function initSystemSubscription(): Subscription {
  return system$.subscribe((event: ISystemEventPayload) => {
    const { type, connectionId } = event;
    const store = useConnectionStore.getState();

    if (type === "hello" && connectionId) {
      store.setConnectionId(connectionId);
    }
  });
}

function initDraftsSubscription(): Subscription {
  return drafts$.subscribe((event: IDraftEventPayload) => {
    const { type, draft, channelId } = event;
    if (!draft) return;

    const store = useDraftsStore.getState();
    const key = draft.root_id
      ? store.getThreadDraftKey(channelId, draft.root_id)
      : store.getChannelDraftKey(channelId);

    switch (type) {
      case "draft_created":
      case "draft_updated":
        store.setDraft(key, draft.message);
        break;
      case "draft_deleted":
        store.removeDraft(key);
        break;
    }
  });
}

//#endregion Client State Subscriptions

//#region Reconnection Recovery

function initReconnectionRecovery(ctx: ISubscriptionContext): () => void {
  let previousStatus = useConnectionStore.getState().status;

  return useConnectionStore.subscribe((state) => {
    const status = state.status;
    if (previousStatus === "reconnecting" && status === "connected") {
      // Invalidate potentially stale queries after reconnection
      ctx.queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
      ctx.queryClient.invalidateQueries({ queryKey: queryKeys.channels.all });
      ctx.queryClient.invalidateQueries({ queryKey: queryKeys.threads.all });
      ctx.queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      console.log("[WS Recovery] Invalidated stale queries after reconnect");
    }
    previousStatus = status;
  });
}

//#endregion Reconnection Recovery

//#region Main Orchestration

/**
 * Initialize all WebSocket subscriptions.
 * Should be called from StateProvider after user authentication.
 *
 * @param queryClient - TanStack Query client instance
 * @param options - Current user context
 * @returns Cleanup function to unsubscribe all handlers
 */
export function initWebSocketSubscriptions(
  queryClient: QueryClient,
  options?: {
    currentUserId?: string | null;
    currentTeamId?: string | null;
  },
): () => void {
  const ctx: ISubscriptionContext = {
    queryClient,
    currentUserId: options?.currentUserId ?? null,
    currentTeamId: options?.currentTeamId ?? null,
  };

  const subscriptions: Subscription[] = [
    // Server state subscriptions (TanStack Query)
    initPostsSubscription(ctx),
    initChannelsSubscription(ctx),
    initUsersSubscription(ctx),
    initTeamsSubscription(ctx),
    initThreadsSubscription(ctx),
    initReactionsSubscription(ctx),
    initPreferencesSubscription(ctx),
    initSidebarSubscription(ctx),
    // Client state subscriptions (Zustand)
    initTypingSubscription(),
    initSystemSubscription(),
    initDraftsSubscription(),
  ];

  // Reconnection recovery (returns unsubscribe function)
  const unsubscribeRecovery = initReconnectionRecovery(ctx);

  console.log(`[WS Subscriptions] Initialized ${subscriptions.length} handlers`);

  return () => {
    subscriptions.forEach((sub) => sub.unsubscribe());
    unsubscribeRecovery();
    console.log(`[WS Subscriptions] Cleaned up ${subscriptions.length} handlers`);
  };
}

//#endregion Main Orchestration
