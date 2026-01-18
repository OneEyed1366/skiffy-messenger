// apps/v2/src/mutations/teams/useLeaveTeamMutation.spec.tsx

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor, act } from "@testing-library/react-native";
import type { ReactNode } from "react";

import { apiClient } from "@/api";
import { queryKeys } from "@/queries/keys";

import {
  useLeaveTeamMutation,
  type ILeaveTeamResponse,
} from "./useLeaveTeamMutation";

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

const mockResponse: ILeaveTeamResponse = {
  status: "OK",
};

//#endregion

//#region Tests

describe("useLeaveTeamMutation", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createQueryClient();
    jest.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  it("leaves a team successfully", async () => {
    mockApiClient.delete.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useLeaveTeamMutation(), {
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

    expect(mockApiClient.delete).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual(mockResponse);
  });

  it("calls onSuccess callback with response", async () => {
    mockApiClient.delete.mockResolvedValueOnce(mockResponse);
    const onSuccess = jest.fn();

    const { result } = renderHook(() => useLeaveTeamMutation({ onSuccess }), {
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

    expect(onSuccess).toHaveBeenCalledWith(mockResponse);
  });

  it("invalidates teams list on success", async () => {
    mockApiClient.delete.mockResolvedValueOnce(mockResponse);
    const invalidateQueriesSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useLeaveTeamMutation(), {
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
    const error = new Error("Failed to leave team");
    mockApiClient.delete.mockRejectedValueOnce(error);
    const onError = jest.fn();

    const { result } = renderHook(() => useLeaveTeamMutation({ onError }), {
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

  it("includes user_id in delete URL", async () => {
    mockApiClient.delete.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useLeaveTeamMutation(), {
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

    expect(mockApiClient.delete).toHaveBeenCalledWith(
      expect.stringContaining("user-456"),
    );
  });

  it("calls correct members URL with user_id", async () => {
    mockApiClient.delete.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useLeaveTeamMutation(), {
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

    expect(mockApiClient.delete).toHaveBeenCalledWith(
      expect.stringContaining("members"),
    );
  });
});

//#endregion
