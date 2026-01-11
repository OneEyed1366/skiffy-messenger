// apps/v2/src/mutations/posts/useDeletePostMutation.spec.ts

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor, act } from "@testing-library/react-native";
import React from "react";

import { apiClient } from "@/api";
import { queryKeys } from "@/queries/keys";
import type { IPost } from "@/types";

import { useDeletePostMutation, deletePost } from "./useDeletePostMutation";

//#region Mocks

jest.mock("@/api", () => ({
  apiClient: {
    delete: jest.fn(),
    getBaseRoute: jest.fn().mockReturnValue("https://api.example.com/api/v4"),
  },
}));

jest.mock("@/api/urls", () => ({
  getPostUrl: jest.fn(
    (postId: string) => `https://api.example.com/api/v4/posts/${postId}`,
  ),
}));

//#endregion

//#region Test Setup

const mockPost: IPost = {
  id: "post-123",
  create_at: 1700000000000,
  update_at: 1700000000000,
  edit_at: 0,
  delete_at: 0,
  is_pinned: false,
  user_id: "user-456",
  channel_id: "channel-789",
  root_id: "",
  original_id: "",
  message: "Test message",
  type: "",
  props: {},
  hashtags: "",
  pending_post_id: "",
  reply_count: 0,
  metadata: {},
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

//#region deletePost API Function Tests

describe("deletePost", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls apiClient.delete with correct URL", async () => {
    const mockApiDelete = apiClient.delete as jest.Mock;
    mockApiDelete.mockResolvedValueOnce({ status: "OK" });

    const input = {
      post_id: "post-123",
      channel_id: "channel-789",
    };

    const result = await deletePost(input);

    expect(mockApiDelete).toHaveBeenCalledWith(
      "https://api.example.com/api/v4/posts/post-123",
    );
    expect(result).toEqual({ status: "OK" });
  });

  it("propagates API errors", async () => {
    const mockApiDelete = apiClient.delete as jest.Mock;
    const error = new Error("API Error");
    mockApiDelete.mockRejectedValueOnce(error);

    const input = {
      post_id: "post-123",
      channel_id: "channel-789",
    };

    await expect(deletePost(input)).rejects.toThrow("API Error");
  });
});

//#endregion

//#region useDeletePostMutation Hook Tests

describe("useDeletePostMutation", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = createTestQueryClient();
  });

  afterEach(() => {
    queryClient.clear();
  });

  it("deletes a post successfully", async () => {
    const mockApiDelete = apiClient.delete as jest.Mock;
    mockApiDelete.mockResolvedValueOnce({ status: "OK" });

    const { result } = renderHook(() => useDeletePostMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({
        post_id: "post-123",
        channel_id: "channel-789",
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });

  it("performs optimistic delete", async () => {
    const mockApiDelete = apiClient.delete as jest.Mock;
    let resolvePromise: (value: { status: string }) => void;
    const promise = new Promise<{ status: string }>((resolve) => {
      resolvePromise = resolve;
    });
    mockApiDelete.mockReturnValueOnce(promise);

    // Set initial post in cache
    queryClient.setQueryData(queryKeys.posts.detail("post-123"), mockPost);

    const { result } = renderHook(() => useDeletePostMutation(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.mutate({
        post_id: "post-123",
        channel_id: "channel-789",
      });
    });

    // Check optimistic delete was applied
    await waitFor(() => {
      const cachedPost = queryClient.getQueryData<IPost>(
        queryKeys.posts.detail("post-123"),
      );
      expect(cachedPost?.state).toBe("DELETED");
      expect(cachedPost?.delete_at).toBeGreaterThan(0);
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
    const error = new Error("Delete failed");
    mockApiDelete.mockRejectedValueOnce(error);

    // Set initial post in cache
    queryClient.setQueryData(queryKeys.posts.detail("post-123"), mockPost);

    const { result } = renderHook(() => useDeletePostMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({
        post_id: "post-123",
        channel_id: "channel-789",
      });
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    // Check rollback was applied
    const cachedPost = queryClient.getQueryData<IPost>(
      queryKeys.posts.detail("post-123"),
    );
    expect(cachedPost?.state).toBeUndefined();
    expect(cachedPost?.delete_at).toBe(0);
  });

  it("removes post from cache on success", async () => {
    const mockApiDelete = apiClient.delete as jest.Mock;
    mockApiDelete.mockResolvedValueOnce({ status: "OK" });

    queryClient.setQueryData(queryKeys.posts.detail("post-123"), mockPost);

    const removeQueriesSpy = jest.spyOn(queryClient, "removeQueries");

    const { result } = renderHook(() => useDeletePostMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({
        post_id: "post-123",
        channel_id: "channel-789",
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(removeQueriesSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.posts.detail("post-123"),
    });
  });

  it("invalidates posts list query on success", async () => {
    const mockApiDelete = apiClient.delete as jest.Mock;
    mockApiDelete.mockResolvedValueOnce({ status: "OK" });

    const invalidateQueriesSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useDeletePostMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({
        post_id: "post-123",
        channel_id: "channel-789",
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.posts.list("channel-789"),
    });
  });

  it("invalidates infinite query on success", async () => {
    const mockApiDelete = apiClient.delete as jest.Mock;
    mockApiDelete.mockResolvedValueOnce({ status: "OK" });

    const invalidateQueriesSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useDeletePostMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({
        post_id: "post-123",
        channel_id: "channel-789",
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.posts.infinite("channel-789"),
    });
  });

  it("calls onSuccess callback with postId", async () => {
    const mockApiDelete = apiClient.delete as jest.Mock;
    mockApiDelete.mockResolvedValueOnce({ status: "OK" });

    const onSuccess = jest.fn();

    const { result } = renderHook(
      () => useDeletePostMutation({ onSuccess }),
      { wrapper: createWrapper(queryClient) },
    );

    await act(async () => {
      result.current.mutate({
        post_id: "post-123",
        channel_id: "channel-789",
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(onSuccess).toHaveBeenCalledWith("post-123");
  });

  it("calls onError callback with context on failure", async () => {
    const mockApiDelete = apiClient.delete as jest.Mock;
    const error = new Error("Delete failed");
    mockApiDelete.mockRejectedValueOnce(error);

    queryClient.setQueryData(queryKeys.posts.detail("post-123"), mockPost);

    const onError = jest.fn();

    const { result } = renderHook(
      () => useDeletePostMutation({ onError }),
      { wrapper: createWrapper(queryClient) },
    );

    const input = {
      post_id: "post-123",
      channel_id: "channel-789",
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

  it("calls onSettled callback after mutation completes", async () => {
    const mockApiDelete = apiClient.delete as jest.Mock;
    mockApiDelete.mockResolvedValueOnce({ status: "OK" });

    const onSettled = jest.fn();

    const { result } = renderHook(
      () => useDeletePostMutation({ onSettled }),
      { wrapper: createWrapper(queryClient) },
    );

    await act(async () => {
      result.current.mutate({
        post_id: "post-123",
        channel_id: "channel-789",
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(onSettled).toHaveBeenCalled();
  });
});

//#endregion
