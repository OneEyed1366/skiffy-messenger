// apps/v2/src/mutations/teams/useJoinTeamMutation.spec.tsx

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor, act } from "@testing-library/react-native";
import type { ReactNode } from "react";

import { apiClient } from "@/api";
import { queryKeys } from "@/queries/keys";
import type { ITeamMembership } from "@/types";

import { useJoinTeamMutation } from "./useJoinTeamMutation";

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

const mockMembership: ITeamMembership = {
  team_id: "team-123",
  user_id: "user-456",
  roles: "team_user",
  delete_at: 0,
  scheme_admin: false,
  scheme_guest: false,
  scheme_user: true,
  mention_count: 0,
  mention_count_root: 0,
  msg_count: 0,
  msg_count_root: 0,
};

//#endregion

//#region Tests

describe("useJoinTeamMutation", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createQueryClient();
    jest.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  it("joins a team successfully", async () => {
    mockApiClient.post.mockResolvedValueOnce(mockMembership);

    const { result } = renderHook(() => useJoinTeamMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({
        team_id: "team-123",
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

    const { result } = renderHook(() => useJoinTeamMutation({ onSuccess }), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({
        team_id: "team-123",
        user_id: "user-456",
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(onSuccess).toHaveBeenCalledWith(mockMembership);
  });

  it("invalidates teams list on success", async () => {
    mockApiClient.post.mockResolvedValueOnce(mockMembership);
    const invalidateQueriesSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useJoinTeamMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({
        team_id: "team-123",
        user_id: "user-456",
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.teams.list(),
    });
  });

  it("handles error correctly", async () => {
    const error = new Error("Failed to join team");
    mockApiClient.post.mockRejectedValueOnce(error);
    const onError = jest.fn();

    const { result } = renderHook(() => useJoinTeamMutation({ onError }), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({
        team_id: "team-123",
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

    const { result } = renderHook(() => useJoinTeamMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({
        team_id: "team-123",
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

    const { result } = renderHook(() => useJoinTeamMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({
        team_id: "team-123",
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
