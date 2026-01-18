// apps/v2/src/mutations/posts/useUpdatePostMutation.spec.ts

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor, act } from "@testing-library/react-native";
import React from "react";

import { apiClient } from "@/api";
import { queryKeys } from "@/queries/keys";
import type { IPost } from "@/types";

import { useUpdatePostMutation, updatePost } from "./useUpdatePostMutation";

//#region Mocks

jest.mock("@/api", () => ({
  apiClient: {
    put: jest.fn(),
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
  message: "Original message",
  type: "",
  props: {},
  hashtags: "",
  pending_post_id: "",
  reply_count: 0,
  metadata: {},
};

const updatedPost: IPost = {
  ...mockPost,
  message: "Updated message",
  update_at: 1700000001000,
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

//#region updatePost API Function Tests

describe("updatePost", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls apiClient.put with correct URL and data", async () => {
    const mockApiPut = apiClient.put as jest.Mock;
    mockApiPut.mockResolvedValueOnce(updatedPost);

    const input = {
      post_id: "post-123",
      message: "Updated message",
    };

    const result = await updatePost(input);

    expect(mockApiPut).toHaveBeenCalledWith(
      "https://api.example.com/api/v4/posts/post-123",
      { id: "post-123", message: "Updated message" },
    );
    expect(result).toEqual(updatedPost);
  });

  it("passes is_pinned when provided", async () => {
    const mockApiPut = apiClient.put as jest.Mock;
    mockApiPut.mockResolvedValueOnce({ ...mockPost, is_pinned: true });

    const input = {
      post_id: "post-123",
      is_pinned: true,
    };

    await updatePost(input);

    expect(mockApiPut).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ is_pinned: true }),
    );
  });

  it("propagates API errors", async () => {
    const mockApiPut = apiClient.put as jest.Mock;
    const error = new Error("API Error");
    mockApiPut.mockRejectedValueOnce(error);

    const input = {
      post_id: "post-123",
      message: "Updated message",
    };

    await expect(updatePost(input)).rejects.toThrow("API Error");
  });
});

//#endregion

//#region useUpdatePostMutation Hook Tests

describe("useUpdatePostMutation", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = createTestQueryClient();
  });

  afterEach(() => {
    queryClient.clear();
  });

  it("updates a post successfully", async () => {
    const mockApiPut = apiClient.put as jest.Mock;
    mockApiPut.mockResolvedValueOnce(updatedPost);

    const { result } = renderHook(() => useUpdatePostMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({
        post_id: "post-123",
        message: "Updated message",
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(updatedPost);
  });

  it("performs optimistic update", async () => {
    const mockApiPut = apiClient.put as jest.Mock;
    let resolvePromise: (value: IPost) => void;
    const promise = new Promise<IPost>((resolve) => {
      resolvePromise = resolve;
    });
    mockApiPut.mockReturnValueOnce(promise);

    // Set initial post in cache
    queryClient.setQueryData(queryKeys.posts.detail("post-123"), mockPost);

    const { result } = renderHook(() => useUpdatePostMutation(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.mutate({
        post_id: "post-123",
        message: "Optimistically updated",
      });
    });

    // Check optimistic update was applied
    await waitFor(() => {
      const cachedPost = queryClient.getQueryData<IPost>(
        queryKeys.posts.detail("post-123"),
      );
      expect(cachedPost?.message).toBe("Optimistically updated");
    });

    await act(async () => {
      resolvePromise!(updatedPost);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });

  it("rolls back on error", async () => {
    const mockApiPut = apiClient.put as jest.Mock;
    const error = new Error("Update failed");
    mockApiPut.mockRejectedValueOnce(error);

    // Set initial post in cache
    queryClient.setQueryData(queryKeys.posts.detail("post-123"), mockPost);

    const { result } = renderHook(() => useUpdatePostMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({
        post_id: "post-123",
        message: "This will fail",
      });
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    // Check rollback was applied
    const cachedPost = queryClient.getQueryData<IPost>(
      queryKeys.posts.detail("post-123"),
    );
    expect(cachedPost?.message).toBe("Original message");
  });

  it("invalidates post detail query on success", async () => {
    const mockApiPut = apiClient.put as jest.Mock;
    mockApiPut.mockResolvedValueOnce(updatedPost);

    const invalidateQueriesSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useUpdatePostMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({
        post_id: "post-123",
        message: "Updated message",
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.posts.detail("post-123"),
    });
  });

  it("invalidates posts list query on success", async () => {
    const mockApiPut = apiClient.put as jest.Mock;
    mockApiPut.mockResolvedValueOnce(updatedPost);

    const invalidateQueriesSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useUpdatePostMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({
        post_id: "post-123",
        message: "Updated message",
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.posts.list(updatedPost.channel_id),
    });
  });

  it("calls onSuccess callback when provided", async () => {
    const mockApiPut = apiClient.put as jest.Mock;
    mockApiPut.mockResolvedValueOnce(updatedPost);

    const onSuccess = jest.fn();

    const { result } = renderHook(() => useUpdatePostMutation({ onSuccess }), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({
        post_id: "post-123",
        message: "Updated message",
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(onSuccess).toHaveBeenCalledWith(updatedPost);
  });

  it("calls onError callback with context on failure", async () => {
    const mockApiPut = apiClient.put as jest.Mock;
    const error = new Error("Update failed");
    mockApiPut.mockRejectedValueOnce(error);

    queryClient.setQueryData(queryKeys.posts.detail("post-123"), mockPost);

    const onError = jest.fn();

    const { result } = renderHook(() => useUpdatePostMutation({ onError }), {
      wrapper: createWrapper(queryClient),
    });

    const input = {
      post_id: "post-123",
      message: "This will fail",
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

  it("updates is_pinned optimistically", async () => {
    const mockApiPut = apiClient.put as jest.Mock;
    mockApiPut.mockResolvedValueOnce({ ...mockPost, is_pinned: true });

    queryClient.setQueryData(queryKeys.posts.detail("post-123"), mockPost);

    const { result } = renderHook(() => useUpdatePostMutation(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.mutate({
        post_id: "post-123",
        is_pinned: true,
      });
    });

    // Check optimistic update
    await waitFor(() => {
      const cachedPost = queryClient.getQueryData<IPost>(
        queryKeys.posts.detail("post-123"),
      );
      expect(cachedPost?.is_pinned).toBe(true);
    });
  });
});

//#endregion
