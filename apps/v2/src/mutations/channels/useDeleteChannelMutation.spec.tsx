// apps/v2/src/mutations/channels/useDeleteChannelMutation.spec.tsx

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor, act } from "@testing-library/react-native";
import type { ReactNode } from "react";

import { apiClient } from "@/api";
import { queryKeys } from "@/queries/keys";

import {
  useDeleteChannelMutation,
  type IDeleteChannelResponse,
} from "./useDeleteChannelMutation";

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

const mockResponse: IDeleteChannelResponse = {
  status: "OK",
};

//#endregion

//#region Tests

describe("useDeleteChannelMutation", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createQueryClient();
    jest.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  it("deletes a channel successfully", async () => {
    mockApiClient.delete.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useDeleteChannelMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({
        channel_id: "channel-123",
        team_id: "team-456",
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
      () => useDeleteChannelMutation({ onSuccess }),
      {
        wrapper: createWrapper(queryClient),
      },
    );

    await act(async () => {
      result.current.mutate({
        channel_id: "channel-123",
        team_id: "team-456",
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(onSuccess).toHaveBeenCalledWith(mockResponse);
  });

  it("invalidates channel list on success", async () => {
    mockApiClient.delete.mockResolvedValueOnce(mockResponse);
    const invalidateQueriesSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useDeleteChannelMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({
        channel_id: "channel-123",
        team_id: "team-456",
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.channels.list("team-456"),
    });
  });

  it("invalidates channel detail on success", async () => {
    mockApiClient.delete.mockResolvedValueOnce(mockResponse);
    const invalidateQueriesSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useDeleteChannelMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({
        channel_id: "channel-123",
        team_id: "team-456",
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.channels.detail("channel-123"),
    });
  });

  it("handles error correctly", async () => {
    const error = new Error("Failed to delete channel");
    mockApiClient.delete.mockRejectedValueOnce(error);
    const onError = jest.fn();

    const { result } = renderHook(() => useDeleteChannelMutation({ onError }), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({
        channel_id: "channel-123",
        team_id: "team-456",
      });
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(onError).toHaveBeenCalledWith(error);
  });

  it("calls API with correct channel URL", async () => {
    mockApiClient.delete.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useDeleteChannelMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({
        channel_id: "channel-123",
        team_id: "team-456",
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockApiClient.delete).toHaveBeenCalledWith(
      expect.stringContaining("channel-123"),
    );
  });
});

//#endregion
