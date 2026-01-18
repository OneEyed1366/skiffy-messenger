// apps/v2/src/mutations/posts/useReactionMutation.spec.ts

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor, act } from "@testing-library/react-native";
import React from "react";

import { apiClient } from "@/api";
import { queryKeys } from "@/queries/keys";
import type { IPost, IReaction } from "@/types";

import {
  useAddReactionMutation,
  useRemoveReactionMutation,
  addReaction,
  removeReaction,
} from "./useReactionMutation";

//#region Mocks

jest.mock("@/api", () => ({
  apiClient: {
    post: jest.fn(),
    delete: jest.fn(),
    getPostsRoute: jest
      .fn()
      .mockReturnValue("https://api.example.com/api/v4/posts"),
    getUsersRoute: jest
      .fn()
      .mockReturnValue("https://api.example.com/api/v4/users"),
  },
}));

//#endregion

//#region Test Setup

const mockReaction: IReaction = {
  user_id: "user-456",
  post_id: "post-123",
  emoji_name: "+1",
  create_at: 1700000000000,
};

const mockPost: IPost = {
  id: "post-123",
  create_at: 1700000000000,
  update_at: 1700000000000,
  edit_at: 0,
  delete_at: 0,
  is_pinned: false,
  user_id: "user-789",
  channel_id: "channel-abc",
  root_id: "",
  original_id: "",
  message: "Test message",
  type: "",
  props: {},
  hashtags: "",
  pending_post_id: "",
  reply_count: 0,
  metadata: {
    reactions: [],
  },
};

const mockPostWithReaction: IPost = {
  ...mockPost,
  metadata: {
    ...mockPost.metadata,
    reactions: [mockReaction],
  },
};

function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(
      QueryClientProvider,
      { client: queryClient },
      children,
    );
  };
}

//#endregion

//#region addReaction API Function Tests

describe("addReaction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls apiClient.post with correct URL and data", async () => {
    const mockApiPost = apiClient.post as jest.Mock;
    mockApiPost.mockResolvedValueOnce(mockReaction);

    const input = {
      post_id: "post-123",
      emoji_name: "+1",
      user_id: "user-456",
    };

    const result = await addReaction(input);

    expect(mockApiPost).toHaveBeenCalledWith(
      "https://api.example.com/api/v4/posts/post-123/reactions",
      {
        user_id: "user-456",
        post_id: "post-123",
        emoji_name: "+1",
      },
    );
    expect(result).toEqual(mockReaction);
  });

  it("propagates API errors", async () => {
    const mockApiPost = apiClient.post as jest.Mock;
    const error = new Error("API Error");
    mockApiPost.mockRejectedValueOnce(error);

    const input = {
      post_id: "post-123",
      emoji_name: "+1",
      user_id: "user-456",
    };

    await expect(addReaction(input)).rejects.toThrow("API Error");
  });
});

//#endregion

//#region removeReaction API Function Tests

describe("removeReaction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls apiClient.delete with correct URL", async () => {
    const mockApiDelete = apiClient.delete as jest.Mock;
    mockApiDelete.mockResolvedValueOnce({ status: "OK" });

    const input = {
      post_id: "post-123",
      emoji_name: "+1",
      user_id: "user-456",
    };

    const result = await removeReaction(input);

    expect(mockApiDelete).toHaveBeenCalledWith(
      "https://api.example.com/api/v4/users/user-456/posts/post-123/reactions/+1",
    );
    expect(result).toEqual({ status: "OK" });
  });

  it("propagates API errors", async () => {
    const mockApiDelete = apiClient.delete as jest.Mock;
    const error = new Error("API Error");
    mockApiDelete.mockRejectedValueOnce(error);

    const input = {
      post_id: "post-123",
      emoji_name: "+1",
      user_id: "user-456",
    };

    await expect(removeReaction(input)).rejects.toThrow("API Error");
  });
});

//#endregion

//#region useAddReactionMutation Hook Tests

describe("useAddReactionMutation", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = createTestQueryClient();
  });

  afterEach(() => {
    queryClient.clear();
  });

  it("adds a reaction successfully", async () => {
    const mockApiPost = apiClient.post as jest.Mock;
    mockApiPost.mockResolvedValueOnce(mockReaction);

    const { result } = renderHook(() => useAddReactionMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({
        post_id: "post-123",
        emoji_name: "+1",
        user_id: "user-456",
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockReaction);
  });

  it("performs optimistic add reaction", async () => {
    const mockApiPost = apiClient.post as jest.Mock;
    let resolvePromise: (value: IReaction) => void;
    const promise = new Promise<IReaction>((resolve) => {
      resolvePromise = resolve;
    });
    mockApiPost.mockReturnValueOnce(promise);

    // Set initial post in cache
    queryClient.setQueryData(queryKeys.posts.detail("post-123"), mockPost);

    const { result } = renderHook(() => useAddReactionMutation(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.mutate({
        post_id: "post-123",
        emoji_name: "+1",
        user_id: "user-456",
      });
    });

    // Check optimistic update was applied
    await waitFor(() => {
      const cachedPost = queryClient.getQueryData<IPost>(
        queryKeys.posts.detail("post-123"),
      );
      expect(cachedPost?.metadata?.reactions).toHaveLength(1);
      expect(cachedPost?.metadata?.reactions?.[0].emoji_name).toBe("+1");
    });

    await act(async () => {
      resolvePromise!(mockReaction);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });

  it("does not add duplicate reaction optimistically", async () => {
    const mockApiPost = apiClient.post as jest.Mock;
    mockApiPost.mockResolvedValueOnce(mockReaction);

    // Set post with existing reaction
    queryClient.setQueryData(
      queryKeys.posts.detail("post-123"),
      mockPostWithReaction,
    );

    const { result } = renderHook(() => useAddReactionMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({
        post_id: "post-123",
        emoji_name: "+1",
        user_id: "user-456",
      });
    });

    // Should still have only 1 reaction (no duplicate)
    const cachedPost = queryClient.getQueryData<IPost>(
      queryKeys.posts.detail("post-123"),
    );
    expect(cachedPost?.metadata?.reactions).toHaveLength(1);
  });

  it("rolls back on error", async () => {
    const mockApiPost = apiClient.post as jest.Mock;
    const error = new Error("Add reaction failed");
    mockApiPost.mockRejectedValueOnce(error);

    // Set initial post in cache
    queryClient.setQueryData(queryKeys.posts.detail("post-123"), mockPost);

    const { result } = renderHook(() => useAddReactionMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({
        post_id: "post-123",
        emoji_name: "+1",
        user_id: "user-456",
      });
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    // Check rollback was applied
    const cachedPost = queryClient.getQueryData<IPost>(
      queryKeys.posts.detail("post-123"),
    );
    expect(cachedPost?.metadata?.reactions).toHaveLength(0);
  });

  it("invalidates post detail query on success", async () => {
    const mockApiPost = apiClient.post as jest.Mock;
    mockApiPost.mockResolvedValueOnce(mockReaction);

    const invalidateQueriesSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useAddReactionMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({
        post_id: "post-123",
        emoji_name: "+1",
        user_id: "user-456",
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.posts.detail("post-123"),
    });
  });

  it("calls onSuccess callback with reaction", async () => {
    const mockApiPost = apiClient.post as jest.Mock;
    mockApiPost.mockResolvedValueOnce(mockReaction);

    const onSuccess = jest.fn();

    const { result } = renderHook(() => useAddReactionMutation({ onSuccess }), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({
        post_id: "post-123",
        emoji_name: "+1",
        user_id: "user-456",
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(onSuccess).toHaveBeenCalledWith(mockReaction);
  });

  it("calls onError callback with context on failure", async () => {
    const mockApiPost = apiClient.post as jest.Mock;
    const error = new Error("Add reaction failed");
    mockApiPost.mockRejectedValueOnce(error);

    queryClient.setQueryData(queryKeys.posts.detail("post-123"), mockPost);

    const onError = jest.fn();

    const { result } = renderHook(() => useAddReactionMutation({ onError }), {
      wrapper: createWrapper(queryClient),
    });

    const input = {
      post_id: "post-123",
      emoji_name: "+1",
      user_id: "user-456",
    };

    await act(async () => {
      result.current.mutate(input);
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(onError).toHaveBeenCalledWith(
      error,
      input,
      expect.objectContaining({ previousPost: mockPost }),
    );
  });
});

//#endregion

//#region useRemoveReactionMutation Hook Tests

describe("useRemoveReactionMutation", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = createTestQueryClient();
  });

  afterEach(() => {
    queryClient.clear();
  });

  it("removes a reaction successfully", async () => {
    const mockApiDelete = apiClient.delete as jest.Mock;
    mockApiDelete.mockResolvedValueOnce({ status: "OK" });

    const { result } = renderHook(() => useRemoveReactionMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({
        post_id: "post-123",
        emoji_name: "+1",
        user_id: "user-456",
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });

  it("performs optimistic remove reaction", async () => {
    const mockApiDelete = apiClient.delete as jest.Mock;
    let resolvePromise: (value: { status: string }) => void;
    const promise = new Promise<{ status: string }>((resolve) => {
      resolvePromise = resolve;
    });
    mockApiDelete.mockReturnValueOnce(promise);

    // Set post with existing reaction
    queryClient.setQueryData(
      queryKeys.posts.detail("post-123"),
      mockPostWithReaction,
    );

    const { result } = renderHook(() => useRemoveReactionMutation(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.mutate({
        post_id: "post-123",
        emoji_name: "+1",
        user_id: "user-456",
      });
    });

    // Check optimistic removal was applied
    await waitFor(() => {
      const cachedPost = queryClient.getQueryData<IPost>(
        queryKeys.posts.detail("post-123"),
      );
      expect(cachedPost?.metadata?.reactions).toHaveLength(0);
    });

    await act(async () => {
      resolvePromise!({ status: "OK" });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });

  it("rolls back on error", async () => {
    const mockApiDelete = apiClient.delete as jest.Mock;
    const error = new Error("Remove reaction failed");
    mockApiDelete.mockRejectedValueOnce(error);

    // Set post with existing reaction
    queryClient.setQueryData(
      queryKeys.posts.detail("post-123"),
      mockPostWithReaction,
    );

    const { result } = renderHook(() => useRemoveReactionMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({
        post_id: "post-123",
        emoji_name: "+1",
        user_id: "user-456",
      });
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    // Check rollback was applied
    const cachedPost = queryClient.getQueryData<IPost>(
      queryKeys.posts.detail("post-123"),
    );
    expect(cachedPost?.metadata?.reactions).toHaveLength(1);
    expect(cachedPost?.metadata?.reactions?.[0].emoji_name).toBe("+1");
  });

  it("invalidates post detail query on success", async () => {
    const mockApiDelete = apiClient.delete as jest.Mock;
    mockApiDelete.mockResolvedValueOnce({ status: "OK" });

    const invalidateQueriesSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useRemoveReactionMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({
        post_id: "post-123",
        emoji_name: "+1",
        user_id: "user-456",
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.posts.detail("post-123"),
    });
  });

  it("calls onSuccess callback", async () => {
    const mockApiDelete = apiClient.delete as jest.Mock;
    mockApiDelete.mockResolvedValueOnce({ status: "OK" });

    const onSuccess = jest.fn();

    const { result } = renderHook(
      () => useRemoveReactionMutation({ onSuccess }),
      { wrapper: createWrapper(queryClient) },
    );

    await act(async () => {
      result.current.mutate({
        post_id: "post-123",
        emoji_name: "+1",
        user_id: "user-456",
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(onSuccess).toHaveBeenCalled();
  });

  it("calls onError callback with context on failure", async () => {
    const mockApiDelete = apiClient.delete as jest.Mock;
    const error = new Error("Remove reaction failed");
    mockApiDelete.mockRejectedValueOnce(error);

    queryClient.setQueryData(
      queryKeys.posts.detail("post-123"),
      mockPostWithReaction,
    );

    const onError = jest.fn();

    const { result } = renderHook(
      () => useRemoveReactionMutation({ onError }),
      { wrapper: createWrapper(queryClient) },
    );

    const input = {
      post_id: "post-123",
      emoji_name: "+1",
      user_id: "user-456",
    };

    await act(async () => {
      result.current.mutate(input);
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(onError).toHaveBeenCalledWith(
      error,
      input,
      expect.objectContaining({ previousPost: mockPostWithReaction }),
    );
  });

  it("calls onSettled callback after mutation completes", async () => {
    const mockApiDelete = apiClient.delete as jest.Mock;
    mockApiDelete.mockResolvedValueOnce({ status: "OK" });

    const onSettled = jest.fn();

    const { result } = renderHook(
      () => useRemoveReactionMutation({ onSettled }),
      { wrapper: createWrapper(queryClient) },
    );

    await act(async () => {
      result.current.mutate({
        post_id: "post-123",
        emoji_name: "+1",
        user_id: "user-456",
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(onSettled).toHaveBeenCalled();
  });

  it("only removes matching reaction by user and emoji", async () => {
    const mockApiDelete = apiClient.delete as jest.Mock;
    mockApiDelete.mockResolvedValueOnce({ status: "OK" });

    const otherReaction: IReaction = {
      user_id: "other-user",
      post_id: "post-123",
      emoji_name: "+1",
      create_at: 1700000000000,
    };

    const postWithMultipleReactions: IPost = {
      ...mockPost,
      metadata: {
        ...mockPost.metadata,
        reactions: [mockReaction, otherReaction],
      },
    };

    queryClient.setQueryData(
      queryKeys.posts.detail("post-123"),
      postWithMultipleReactions,
    );

    const { result } = renderHook(() => useRemoveReactionMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({
        post_id: "post-123",
        emoji_name: "+1",
        user_id: "user-456",
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Check only the matching reaction was removed
    const cachedPost = queryClient.getQueryData<IPost>(
      queryKeys.posts.detail("post-123"),
    );
    expect(cachedPost?.metadata?.reactions).toHaveLength(1);
    expect(cachedPost?.metadata?.reactions?.[0].user_id).toBe("other-user");
  });
});

//#endregion
