// apps/v2/src/mutations/channels/useUpdateChannelMutation.spec.tsx

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor, act } from "@testing-library/react-native";
import type { ReactNode } from "react";

import { apiClient } from "@/api";
import { queryKeys } from "@/queries/keys";
import type { IChannel } from "@/types";

import { useUpdateChannelMutation } from "./useUpdateChannelMutation";

//#region Mocks

jest.mock("@/api", () => ({
  apiClient: {
    put: jest.fn(),
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

const mockChannel: IChannel = {
  id: "channel-123",
  create_at: 1700000000000,
  update_at: 1700000001000,
  delete_at: 0,
  team_id: "team-456",
  type: "O",
  display_name: "Updated Name",
  name: "general",
  header: "New header",
  purpose: "Updated purpose",
  last_post_at: 0,
  last_root_post_at: 0,
  creator_id: "user-789",
  scheme_id: "",
  group_constrained: false,
};

//#endregion

//#region Tests

describe("useUpdateChannelMutation", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createQueryClient();
    jest.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  it("updates a channel successfully", async () => {
    mockApiClient.put.mockResolvedValueOnce(mockChannel);

    const { result } = renderHook(() => useUpdateChannelMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({
        channel_id: "channel-123",
        display_name: "Updated Name",
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockApiClient.put).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual(mockChannel);
  });

  it("calls onSuccess callback with updated channel", async () => {
    mockApiClient.put.mockResolvedValueOnce(mockChannel);
    const onSuccess = jest.fn();

    const { result } = renderHook(
      () => useUpdateChannelMutation({ onSuccess }),
      {
        wrapper: createWrapper(queryClient),
      },
    );

    await act(async () => {
      result.current.mutate({
        channel_id: "channel-123",
        display_name: "Updated Name",
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(onSuccess).toHaveBeenCalledWith(mockChannel);
  });

  it("invalidates channel detail on success", async () => {
    mockApiClient.put.mockResolvedValueOnce(mockChannel);
    const invalidateQueriesSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useUpdateChannelMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({
        channel_id: "channel-123",
        display_name: "Updated Name",
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
    const error = new Error("Failed to update channel");
    mockApiClient.put.mockRejectedValueOnce(error);
    const onError = jest.fn();

    const { result } = renderHook(() => useUpdateChannelMutation({ onError }), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({
        channel_id: "channel-123",
        display_name: "Updated Name",
      });
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(onError).toHaveBeenCalledWith(error);
  });

  it("sends only provided fields to API", async () => {
    mockApiClient.put.mockResolvedValueOnce(mockChannel);

    const { result } = renderHook(() => useUpdateChannelMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({
        channel_id: "channel-123",
        display_name: "Updated Name",
        purpose: "New purpose",
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockApiClient.put).toHaveBeenCalledWith(expect.any(String), {
      display_name: "Updated Name",
      purpose: "New purpose",
    });
  });

  it("does not include channel_id in request body", async () => {
    mockApiClient.put.mockResolvedValueOnce(mockChannel);

    const { result } = renderHook(() => useUpdateChannelMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({
        channel_id: "channel-123",
        display_name: "Updated Name",
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    const callArgs = mockApiClient.put.mock.calls[0];
    expect(callArgs[1]).not.toHaveProperty("channel_id");
  });
});

//#endregion
