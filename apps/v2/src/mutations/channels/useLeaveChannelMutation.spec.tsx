// apps/v2/src/mutations/channels/useLeaveChannelMutation.spec.ts

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor, act } from "@testing-library/react-native";
import type { ReactNode } from "react";

import { apiClient } from "@/api";
import { queryKeys } from "@/queries/keys";

import {
  useLeaveChannelMutation,
  type ILeaveChannelResponse,
} from "./useLeaveChannelMutation";

//#region Mocks

jest.mock("@/api", () => ({
  apiClient: {
    delete: jest.fn(),
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

const mockResponse: ILeaveChannelResponse = {
  status: "OK",
};

//#endregion

//#region Tests

describe("useLeaveChannelMutation", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createQueryClient();
    jest.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  it("leaves a channel successfully", async () => {
    mockApiClient.delete.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useLeaveChannelMutation(), {
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

    expect(mockApiClient.delete).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual(mockResponse);
  });

  it("calls onSuccess callback with response", async () => {
    mockApiClient.delete.mockResolvedValueOnce(mockResponse);
    const onSuccess = jest.fn();

    const { result } = renderHook(
      () => useLeaveChannelMutation({ onSuccess }),
      {
        wrapper: createWrapper(queryClient),
      },
    );

    await act(async () => {
      result.current.mutate({
        channel_id: "channel-123",
        user_id: "user-456",
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(onSuccess).toHaveBeenCalledWith(mockResponse);
  });

  it("invalidates channel members on success", async () => {
    mockApiClient.delete.mockResolvedValueOnce(mockResponse);
    const invalidateQueriesSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useLeaveChannelMutation(), {
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
    const error = new Error("Failed to leave channel");
    mockApiClient.delete.mockRejectedValueOnce(error);
    const onError = jest.fn();

    const { result } = renderHook(() => useLeaveChannelMutation({ onError }), {
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

  it("includes user_id in delete URL", async () => {
    mockApiClient.delete.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useLeaveChannelMutation(), {
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

    expect(mockApiClient.delete).toHaveBeenCalledWith(
      expect.stringContaining("user-456"),
    );
  });

  it("calls correct members URL with user_id", async () => {
    mockApiClient.delete.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useLeaveChannelMutation(), {
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

    expect(mockApiClient.delete).toHaveBeenCalledWith(
      expect.stringContaining("members"),
    );
  });
});

//#endregion
