// apps/v2/src/mutations/channels/useJoinChannelMutation.spec.ts

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor, act } from "@testing-library/react-native";
import type { ReactNode } from "react";

import { apiClient } from "@/api";
import { queryKeys } from "@/queries/keys";
import type { IChannelMembership } from "@/types";

import { useJoinChannelMutation } from "./useJoinChannelMutation";

//#region Mocks

jest.mock("@/api", () => ({
  apiClient: {
    post: jest.fn(),
  },
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

//#endregion

//#region Test Setup

function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

const mockMembership: IChannelMembership = {
  channel_id: "channel-123",
  user_id: "user-456",
  roles: "channel_user",
  last_viewed_at: 1700000000000,
  msg_count: 0,
  msg_count_root: 0,
  mention_count: 0,
  mention_count_root: 0,
  urgent_mention_count: 0,
  notify_props: {},
  last_update_at: 1700000000000,
  scheme_user: true,
  scheme_admin: false,
};

//#endregion

//#region Tests

describe("useJoinChannelMutation", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createQueryClient();
    jest.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  it("joins a channel successfully", async () => {
    mockApiClient.post.mockResolvedValueOnce(mockMembership);

    const { result } = renderHook(() => useJoinChannelMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({
        channel_id: "channel-123",
        user_id: "user-456",
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockApiClient.post).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual(mockMembership);
  });

  it("calls onSuccess callback with membership", async () => {
    mockApiClient.post.mockResolvedValueOnce(mockMembership);
    const onSuccess = jest.fn();

    const { result } = renderHook(() => useJoinChannelMutation({ onSuccess }), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({
        channel_id: "channel-123",
        user_id: "user-456",
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(onSuccess).toHaveBeenCalledWith(mockMembership);
  });

  it("invalidates channel members on success", async () => {
    mockApiClient.post.mockResolvedValueOnce(mockMembership);
    const invalidateQueriesSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useJoinChannelMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({
        channel_id: "channel-123",
        user_id: "user-456",
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.channels.members("channel-123"),
    });
  });

  it("handles error correctly", async () => {
    const error = new Error("Failed to join channel");
    mockApiClient.post.mockRejectedValueOnce(error);
    const onError = jest.fn();

    const { result } = renderHook(() => useJoinChannelMutation({ onError }), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({
        channel_id: "channel-123",
        user_id: "user-456",
      });
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(onError).toHaveBeenCalledWith(error);
  });

  it("sends user_id in request body", async () => {
    mockApiClient.post.mockResolvedValueOnce(mockMembership);

    const { result } = renderHook(() => useJoinChannelMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({
        channel_id: "channel-123",
        user_id: "user-456",
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockApiClient.post).toHaveBeenCalledWith(expect.any(String), {
      user_id: "user-456",
    });
  });

  it("calls correct members URL", async () => {
    mockApiClient.post.mockResolvedValueOnce(mockMembership);

    const { result } = renderHook(() => useJoinChannelMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({
        channel_id: "channel-123",
        user_id: "user-456",
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockApiClient.post).toHaveBeenCalledWith(
      expect.stringContaining("members"),
      expect.any(Object),
    );
  });
});

//#endregion
