// apps/v2/src/mutations/posts/useCreatePostMutation.spec.ts

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor, act } from "@testing-library/react-native";
import React from "react";

import { apiClient } from "@/api";
import { queryKeys } from "@/queries/keys";
import type { IPost } from "@/types";

import { useCreatePostMutation, createPost } from "./useCreatePostMutation";

//#region Mocks

jest.mock("@/api", () => ({
  apiClient: {
    post: jest.fn(),
    getBaseRoute: jest.fn().mockReturnValue("https://api.example.com/api/v4"),
  },
}));

jest.mock("@/api/urls", () => ({
  getChannelPostsUrl: jest.fn(
    (channelId: string) =>
      `https://api.example.com/api/v4/channels/${channelId}/posts`,
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

//#region createPost API Function Tests

describe("createPost", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls apiClient.post with correct URL and data", async () => {
    const mockApiPost = apiClient.post as jest.Mock;
    mockApiPost.mockResolvedValueOnce(mockPost);

    const input = {
      channel_id: "channel-789",
      message: "Test message",
    };

    const result = await createPost(input);

    expect(mockApiPost).toHaveBeenCalledWith(
      "https://api.example.com/api/v4/channels/channel-789/posts",
      input,
    );
    expect(result).toEqual(mockPost);
  });

  it("passes file_ids when provided", async () => {
    const mockApiPost = apiClient.post as jest.Mock;
    mockApiPost.mockResolvedValueOnce(mockPost);

    const input = {
      channel_id: "channel-789",
      message: "Test message",
      file_ids: ["file-1", "file-2"],
    };

    await createPost(input);

    expect(mockApiPost).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ file_ids: ["file-1", "file-2"] }),
    );
  });

  it("passes root_id for replies", async () => {
    const mockApiPost = apiClient.post as jest.Mock;
    mockApiPost.mockResolvedValueOnce(mockPost);

    const input = {
      channel_id: "channel-789",
      message: "Reply message",
      root_id: "parent-post-123",
    };

    await createPost(input);

    expect(mockApiPost).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ root_id: "parent-post-123" }),
    );
  });

  it("propagates API errors", async () => {
    const mockApiPost = apiClient.post as jest.Mock;
    const error = new Error("API Error");
    mockApiPost.mockRejectedValueOnce(error);

    const input = {
      channel_id: "channel-789",
      message: "Test message",
    };

    await expect(createPost(input)).rejects.toThrow("API Error");
  });
});

//#endregion

//#region useCreatePostMutation Hook Tests

describe("useCreatePostMutation", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = createTestQueryClient();
  });

  afterEach(() => {
    queryClient.clear();
  });

  it("creates a post successfully", async () => {
    const mockApiPost = apiClient.post as jest.Mock;
    mockApiPost.mockResolvedValueOnce(mockPost);

    const { result } = renderHook(() => useCreatePostMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({
        channel_id: "channel-789",
        message: "Test message",
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockPost);
  });

  it("invalidates posts list query on success", async () => {
    const mockApiPost = apiClient.post as jest.Mock;
    mockApiPost.mockResolvedValueOnce(mockPost);

    const invalidateQueriesSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useCreatePostMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({
        channel_id: "channel-789",
        message: "Test message",
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
    const mockApiPost = apiClient.post as jest.Mock;
    mockApiPost.mockResolvedValueOnce(mockPost);

    const invalidateQueriesSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useCreatePostMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({
        channel_id: "channel-789",
        message: "Test message",
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.posts.infinite("channel-789"),
    });
  });

  it("calls onSuccess callback when provided", async () => {
    const mockApiPost = apiClient.post as jest.Mock;
    mockApiPost.mockResolvedValueOnce(mockPost);

    const onSuccess = jest.fn();

    const { result } = renderHook(() => useCreatePostMutation({ onSuccess }), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({
        channel_id: "channel-789",
        message: "Test message",
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(onSuccess).toHaveBeenCalledWith(mockPost);
  });

  it("calls onError callback on failure", async () => {
    const mockApiPost = apiClient.post as jest.Mock;
    const error = new Error("Create failed");
    mockApiPost.mockRejectedValueOnce(error);

    const onError = jest.fn();

    const { result } = renderHook(() => useCreatePostMutation({ onError }), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({
        channel_id: "channel-789",
        message: "Test message",
      });
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(onError).toHaveBeenCalledWith(error);
  });

  it("calls onSettled callback after mutation completes", async () => {
    const mockApiPost = apiClient.post as jest.Mock;
    mockApiPost.mockResolvedValueOnce(mockPost);

    const onSettled = jest.fn();

    const { result } = renderHook(() => useCreatePostMutation({ onSettled }), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({
        channel_id: "channel-789",
        message: "Test message",
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(onSettled).toHaveBeenCalled();
  });

  it("reports isPending state during mutation", async () => {
    const mockApiPost = apiClient.post as jest.Mock;
    let resolvePromise: (value: IPost) => void;
    const promise = new Promise<IPost>((resolve) => {
      resolvePromise = resolve;
    });
    mockApiPost.mockReturnValueOnce(promise);

    const { result } = renderHook(() => useCreatePostMutation(), {
      wrapper: createWrapper(queryClient),
    });

    expect(result.current.isPending).toBe(false);

    act(() => {
      result.current.mutate({
        channel_id: "channel-789",
        message: "Test message",
      });
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(true);
    });

    await act(async () => {
      resolvePromise!(mockPost);
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });
  });
});

//#endregion
