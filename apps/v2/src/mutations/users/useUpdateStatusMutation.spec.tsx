// apps/v2/src/mutations/users/useUpdateStatusMutation.spec.tsx

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor, act } from "@testing-library/react-native";
import React from "react";

import { apiClient } from "@/api";
import { queryKeys } from "@/queries/keys";
import type { IUserStatus } from "@/types";

import {
  useUpdateStatusMutation,
  updateStatus,
} from "./useUpdateStatusMutation";

//#region Mocks

jest.mock("@/api", () => ({
  apiClient: {
    put: jest.fn(),
    getBaseRoute: jest.fn().mockReturnValue("https://api.example.com/api/v4"),
  },
}));

jest.mock("@/api/urls", () => ({
  getUserUrl: jest.fn(
    (userId: string) => `https://api.example.com/api/v4/users/${userId}`,
  ),
}));

//#endregion

//#region Test Setup

const mockStatus: IUserStatus = {
  user_id: "user-123",
  status: "online",
  manual: false,
  last_activity_at: 1700000000000,
};

const updatedStatus: IUserStatus = {
  user_id: "user-123",
  status: "away",
  manual: true,
  last_activity_at: 1700000001000,
};

const dndStatus: IUserStatus = {
  user_id: "user-123",
  status: "dnd",
  manual: true,
  dnd_end_time: 1700001800000,
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

//#region updateStatus API Function Tests

describe("updateStatus", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls apiClient.put with correct URL and data", async () => {
    const mockApiPut = apiClient.put as jest.Mock;
    mockApiPut.mockResolvedValueOnce(updatedStatus);

    const input = {
      user_id: "user-123",
      status: "away" as const,
    };

    const result = await updateStatus(input);

    expect(mockApiPut).toHaveBeenCalledWith(
      "https://api.example.com/api/v4/users/user-123/status",
      {
        user_id: "user-123",
        status: "away",
        dnd_end_time: undefined,
        manual: true,
      },
    );
    expect(result).toEqual(updatedStatus);
  });

  it("passes dnd_end_time when provided", async () => {
    const mockApiPut = apiClient.put as jest.Mock;
    mockApiPut.mockResolvedValueOnce(dndStatus);

    const input = {
      user_id: "user-123",
      status: "dnd" as const,
      dnd_end_time: 1700001800000,
    };

    await updateStatus(input);

    expect(mockApiPut).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        status: "dnd",
        dnd_end_time: 1700001800000,
        manual: true,
      }),
    );
  });

  it("propagates API errors", async () => {
    const mockApiPut = apiClient.put as jest.Mock;
    const error = new Error("API Error");
    mockApiPut.mockRejectedValueOnce(error);

    const input = {
      user_id: "user-123",
      status: "away" as const,
    };

    await expect(updateStatus(input)).rejects.toThrow("API Error");
  });

  it("sets status to online", async () => {
    const mockApiPut = apiClient.put as jest.Mock;
    const onlineStatus: IUserStatus = {
      user_id: "user-123",
      status: "online",
      manual: true,
    };
    mockApiPut.mockResolvedValueOnce(onlineStatus);

    const input = {
      user_id: "user-123",
      status: "online" as const,
    };

    const result = await updateStatus(input);

    expect(mockApiPut).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ status: "online" }),
    );
    expect(result.status).toBe("online");
  });

  it("sets status to offline", async () => {
    const mockApiPut = apiClient.put as jest.Mock;
    const offlineStatus: IUserStatus = {
      user_id: "user-123",
      status: "offline",
      manual: true,
    };
    mockApiPut.mockResolvedValueOnce(offlineStatus);

    const input = {
      user_id: "user-123",
      status: "offline" as const,
    };

    const result = await updateStatus(input);

    expect(result.status).toBe("offline");
  });
});

//#endregion

//#region useUpdateStatusMutation Hook Tests

describe("useUpdateStatusMutation", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = createTestQueryClient();
  });

  afterEach(() => {
    queryClient.clear();
  });

  it("updates status successfully", async () => {
    const mockApiPut = apiClient.put as jest.Mock;
    mockApiPut.mockResolvedValueOnce(updatedStatus);

    const { result } = renderHook(() => useUpdateStatusMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({
        user_id: "user-123",
        status: "away",
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(updatedStatus);
  });

  it("updates to DND with end time", async () => {
    const mockApiPut = apiClient.put as jest.Mock;
    mockApiPut.mockResolvedValueOnce(dndStatus);

    const { result } = renderHook(() => useUpdateStatusMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({
        user_id: "user-123",
        status: "dnd",
        dnd_end_time: 1700001800000,
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(dndStatus);
  });

  it("invalidates user detail query on success", async () => {
    const mockApiPut = apiClient.put as jest.Mock;
    mockApiPut.mockResolvedValueOnce(updatedStatus);

    const invalidateQueriesSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useUpdateStatusMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({
        user_id: "user-123",
        status: "away",
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.users.detail("user-123"),
    });
  });

  it("calls onSuccess callback when provided", async () => {
    const mockApiPut = apiClient.put as jest.Mock;
    mockApiPut.mockResolvedValueOnce(updatedStatus);

    const onSuccess = jest.fn();

    const { result } = renderHook(
      () => useUpdateStatusMutation({ onSuccess }),
      { wrapper: createWrapper(queryClient) },
    );

    await act(async () => {
      result.current.mutate({
        user_id: "user-123",
        status: "away",
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(onSuccess).toHaveBeenCalledWith(updatedStatus);
  });

  it("calls onError callback on failure", async () => {
    const mockApiPut = apiClient.put as jest.Mock;
    const error = new Error("Update failed");
    mockApiPut.mockRejectedValueOnce(error);

    const onError = jest.fn();

    const { result } = renderHook(() => useUpdateStatusMutation({ onError }), {
      wrapper: createWrapper(queryClient),
    });

    const input = {
      user_id: "user-123",
      status: "away" as const,
    };

    await act(async () => {
      result.current.mutate(input);
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(onError).toHaveBeenCalledWith(error, input, expect.any(Object));
  });

  it("calls onSettled callback", async () => {
    const mockApiPut = apiClient.put as jest.Mock;
    mockApiPut.mockResolvedValueOnce(updatedStatus);

    const onSettled = jest.fn();

    const { result } = renderHook(
      () => useUpdateStatusMutation({ onSettled }),
      { wrapper: createWrapper(queryClient) },
    );

    await act(async () => {
      result.current.mutate({
        user_id: "user-123",
        status: "away",
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(onSettled).toHaveBeenCalled();
  });

  it("handles multiple status updates", async () => {
    const mockApiPut = apiClient.put as jest.Mock;

    const awayStatus: IUserStatus = {
      ...mockStatus,
      status: "away",
      manual: true,
    };
    const onlineStatus: IUserStatus = {
      ...mockStatus,
      status: "online",
      manual: true,
    };

    mockApiPut
      .mockResolvedValueOnce(awayStatus)
      .mockResolvedValueOnce(onlineStatus);

    const { result } = renderHook(() => useUpdateStatusMutation(), {
      wrapper: createWrapper(queryClient),
    });

    // First update: set to away
    await act(async () => {
      result.current.mutate({
        user_id: "user-123",
        status: "away",
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.status).toBe("away");

    // Second update: set back to online
    await act(async () => {
      result.current.mutate({
        user_id: "user-123",
        status: "online",
      });
    });

    await waitFor(() => {
      expect(result.current.data?.status).toBe("online");
    });
  });

  it("handles ooo status", async () => {
    const mockApiPut = apiClient.put as jest.Mock;
    const oooStatus: IUserStatus = {
      user_id: "user-123",
      status: "ooo",
      manual: true,
    };
    mockApiPut.mockResolvedValueOnce(oooStatus);

    const { result } = renderHook(() => useUpdateStatusMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({
        user_id: "user-123",
        status: "ooo",
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.status).toBe("ooo");
  });

  it("isPending is true while mutation is in flight", async () => {
    const mockApiPut = apiClient.put as jest.Mock;
    let resolvePromise: (value: IUserStatus) => void;
    const promise = new Promise<IUserStatus>((resolve) => {
      resolvePromise = resolve;
    });
    mockApiPut.mockReturnValueOnce(promise);

    const { result } = renderHook(() => useUpdateStatusMutation(), {
      wrapper: createWrapper(queryClient),
    });

    expect(result.current.isPending).toBe(false);

    act(() => {
      result.current.mutate({
        user_id: "user-123",
        status: "away",
      });
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(true);
    });

    await act(async () => {
      resolvePromise!(updatedStatus);
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

//#endregion
