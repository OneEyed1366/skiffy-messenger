// apps/v2/src/mutations/channels/useCreateChannelMutation.spec.tsx

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor, act } from "@testing-library/react-native";
import type { ReactNode } from "react";

import { apiClient } from "@/api";
import { queryKeys } from "@/queries/keys";
import type { IChannel } from "@/types";

import { useCreateChannelMutation } from "./useCreateChannelMutation";

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

const mockChannel: IChannel = {
  id: "channel-123",
  create_at: 1700000000000,
  update_at: 1700000000000,
  delete_at: 0,
  team_id: "team-456",
  type: "O",
  display_name: "General",
  name: "general",
  header: "",
  purpose: "",
  last_post_at: 0,
  last_root_post_at: 0,
  creator_id: "user-789",
  scheme_id: "",
  group_constrained: false,
};

//#endregion

//#region Tests

describe("useCreateChannelMutation", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createQueryClient();
    jest.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  it("creates a channel successfully", async () => {
    mockApiClient.post.mockResolvedValueOnce(mockChannel);

    const { result } = renderHook(() => useCreateChannelMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({
        team_id: "team-456",
        name: "general",
        display_name: "General",
        type: "O",
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockApiClient.post).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual(mockChannel);
  });

  it("calls onSuccess callback with created channel", async () => {
    mockApiClient.post.mockResolvedValueOnce(mockChannel);
    const onSuccess = jest.fn();

    const { result } = renderHook(
      () => useCreateChannelMutation({ onSuccess }),
      {
        wrapper: createWrapper(queryClient),
      },
    );

    await act(async () => {
      result.current.mutate({
        team_id: "team-456",
        name: "general",
        display_name: "General",
        type: "O",
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(onSuccess).toHaveBeenCalledWith(mockChannel);
  });

  it("invalidates channel list on success", async () => {
    mockApiClient.post.mockResolvedValueOnce(mockChannel);
    const invalidateQueriesSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useCreateChannelMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({
        team_id: "team-456",
        name: "general",
        display_name: "General",
        type: "O",
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.channels.list("team-456"),
    });
  });

  it("handles error correctly", async () => {
    const error = new Error("Failed to create channel");
    mockApiClient.post.mockRejectedValueOnce(error);
    const onError = jest.fn();

    const { result } = renderHook(() => useCreateChannelMutation({ onError }), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({
        team_id: "team-456",
        name: "general",
        display_name: "General",
        type: "O",
      });
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(onError).toHaveBeenCalledWith(error);
  });

  it("sends optional fields when provided", async () => {
    mockApiClient.post.mockResolvedValueOnce(mockChannel);

    const { result } = renderHook(() => useCreateChannelMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({
        team_id: "team-456",
        name: "general",
        display_name: "General",
        type: "O",
        purpose: "Main channel",
        header: "Welcome!",
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockApiClient.post).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        purpose: "Main channel",
        header: "Welcome!",
      }),
    );
  });
});

//#endregion
