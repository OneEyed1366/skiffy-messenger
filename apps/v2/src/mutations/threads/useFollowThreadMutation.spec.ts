// apps/v2/src/mutations/threads/useFollowThreadMutation.spec.tsx

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor, act } from "@testing-library/react-native";
import React from "react";

import { apiClient } from "@/api";
import { queryKeys } from "@/queries/keys";
import type { IUserThread } from "@/types";

import {
  useFollowThreadMutation,
  followThread,
} from "./useFollowThreadMutation";

//#region Mocks

jest.mock("@/api", () => ({
  apiClient: {
    put: jest.fn(),
    getBaseRoute: jest.fn().mockReturnValue("https://api.example.com/api/v4"),
  },
}));

jest.mock("@/api/urls", () => ({
  getThreadUrl: jest.fn(
    (userId: string, threadId: string) =>
      `https://api.example.com/api/v4/users/${userId}/threads/${threadId}`,
  ),
}));

//#endregion

//#region Test Setup

const mockThread: IUserThread = {
  id: "thread-123",
  reply_count: 5,
  last_reply_at: 1700000000000,
  last_viewed_at: 1700000000000,
  participants: [{ id: "user-456" }],
  unread_replies: 0,
  unread_mentions: 0,
  is_following: true,
  post: {
    channel_id: "channel-789",
    user_id: "user-456",
  },
};

const mockUnfollowedThread: IUserThread = {
  ...mockThread,
  is_following: false,
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

//#region followThread API Function Tests

describe("followThread", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls apiClient.put with correct URL and data for follow", async () => {
    const mockApiPut = apiClient.put as jest.Mock;
    mockApiPut.mockResolvedValueOnce(mockThread);

    const input = {
      user_id: "user-456",
      thread_id: "thread-123",
      following: true,
    };

    const result = await followThread(input);

    expect(mockApiPut).toHaveBeenCalledWith(
      "https://api.example.com/api/v4/users/user-456/threads/thread-123/following",
      { state: true },
    );
    expect(result).toEqual(mockThread);
  });

  it("calls apiClient.put with correct URL and data for unfollow", async () => {
    const mockApiPut = apiClient.put as jest.Mock;
    mockApiPut.mockResolvedValueOnce(mockUnfollowedThread);

    const input = {
      user_id: "user-456",
      thread_id: "thread-123",
      following: false,
    };

    const result = await followThread(input);

    expect(mockApiPut).toHaveBeenCalledWith(
      "https://api.example.com/api/v4/users/user-456/threads/thread-123/following",
      { state: false },
    );
    expect(result).toEqual(mockUnfollowedThread);
  });

  it("propagates API errors", async () => {
    const mockApiPut = apiClient.put as jest.Mock;
    const error = new Error("API Error");
    mockApiPut.mockRejectedValueOnce(error);

    const input = {
      user_id: "user-456",
      thread_id: "thread-123",
      following: true,
    };

    await expect(followThread(input)).rejects.toThrow("API Error");
  });
});

//#endregion

//#region useFollowThreadMutation Hook Tests

describe("useFollowThreadMutation", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = createTestQueryClient();
  });

  afterEach(() => {
    queryClient.clear();
  });

  it("follows a thread successfully", async () => {
    const mockApiPut = apiClient.put as jest.Mock;
    mockApiPut.mockResolvedValueOnce(mockThread);

    const { result } = renderHook(() => useFollowThreadMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({
        user_id: "user-456",
        thread_id: "thread-123",
        following: true,
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockThread);
    expect(result.current.data?.is_following).toBe(true);
  });

  it("unfollows a thread successfully", async () => {
    const mockApiPut = apiClient.put as jest.Mock;
    mockApiPut.mockResolvedValueOnce(mockUnfollowedThread);

    const { result } = renderHook(() => useFollowThreadMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({
        user_id: "user-456",
        thread_id: "thread-123",
        following: false,
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockUnfollowedThread);
    expect(result.current.data?.is_following).toBe(false);
  });

  it("invalidates thread detail query on success", async () => {
    const mockApiPut = apiClient.put as jest.Mock;
    mockApiPut.mockResolvedValueOnce(mockThread);

    const invalidateQueriesSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useFollowThreadMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({
        user_id: "user-456",
        thread_id: "thread-123",
        following: true,
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.threads.detail("user-456", "thread-123"),
    });
  });

  it("calls onSuccess callback when provided", async () => {
    const mockApiPut = apiClient.put as jest.Mock;
    mockApiPut.mockResolvedValueOnce(mockThread);

    const onSuccess = jest.fn();

    const { result } = renderHook(
      () => useFollowThreadMutation({ onSuccess }),
      { wrapper: createWrapper(queryClient) },
    );

    await act(async () => {
      result.current.mutate({
        user_id: "user-456",
        thread_id: "thread-123",
        following: true,
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(onSuccess).toHaveBeenCalledWith(mockThread);
  });

  it("calls onError callback on failure", async () => {
    const mockApiPut = apiClient.put as jest.Mock;
    const error = new Error("Follow failed");
    mockApiPut.mockRejectedValueOnce(error);

    const onError = jest.fn();

    const { result } = renderHook(() => useFollowThreadMutation({ onError }), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({
        user_id: "user-456",
        thread_id: "thread-123",
        following: true,
      });
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(onError).toHaveBeenCalledWith(error);
  });

  it("calls onSettled callback after mutation completes", async () => {
    const mockApiPut = apiClient.put as jest.Mock;
    mockApiPut.mockResolvedValueOnce(mockThread);

    const onSettled = jest.fn();

    const { result } = renderHook(
      () => useFollowThreadMutation({ onSettled }),
      { wrapper: createWrapper(queryClient) },
    );

    await act(async () => {
      result.current.mutate({
        user_id: "user-456",
        thread_id: "thread-123",
        following: true,
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(onSettled).toHaveBeenCalled();
  });

  it("reports isPending state during mutation", async () => {
    const mockApiPut = apiClient.put as jest.Mock;
    let resolvePromise: (value: IUserThread) => void;
    const promise = new Promise<IUserThread>((resolve) => {
      resolvePromise = resolve;
    });
    mockApiPut.mockReturnValueOnce(promise);

    const { result } = renderHook(() => useFollowThreadMutation(), {
      wrapper: createWrapper(queryClient),
    });

    expect(result.current.isPending).toBe(false);

    act(() => {
      result.current.mutate({
        user_id: "user-456",
        thread_id: "thread-123",
        following: true,
      });
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(true);
    });

    await act(async () => {
      resolvePromise!(mockThread);
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });
  });
});

//#endregion
