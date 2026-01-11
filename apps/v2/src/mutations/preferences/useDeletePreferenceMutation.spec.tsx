// apps/v2/src/mutations/preferences/useDeletePreferenceMutation.spec.tsx

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor, act } from "@testing-library/react-native";
import React from "react";

import { deletePreference } from "@/api/preferences";
import { queryKeys } from "@/queries/keys";
import type { IPreference } from "@/types";

import { useDeletePreferenceMutation } from "./useDeletePreferenceMutation";

//#region Mocks

jest.mock("@/api/preferences", () => ({
  deletePreference: jest.fn(),
}));

//#endregion

//#region Test Setup

const mockExistingPreferences: IPreference[] = [
  {
    user_id: "user-123",
    category: "theme",
    name: "dark_mode",
    value: "true",
  },
  {
    user_id: "user-123",
    category: "theme",
    name: "accent_color",
    value: "blue",
  },
  {
    user_id: "user-123",
    category: "notifications",
    name: "email",
    value: "enabled",
  },
];

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

//#region useDeletePreferenceMutation Hook Tests

describe("useDeletePreferenceMutation", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = createTestQueryClient();
  });

  afterEach(() => {
    queryClient.clear();
  });

  it("deletes a preference successfully", async () => {
    const mockDeletePreference = deletePreference as jest.Mock;
    mockDeletePreference.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useDeletePreferenceMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({
        userId: "user-123",
        category: "theme",
        name: "dark_mode",
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockDeletePreference).toHaveBeenCalledWith(
      "user-123",
      "theme",
      "dark_mode",
    );
  });

  it("performs optimistic delete", async () => {
    const mockDeletePreference = deletePreference as jest.Mock;
    let resolvePromise: () => void;
    const promise = new Promise<void>((resolve) => {
      resolvePromise = resolve;
    });
    mockDeletePreference.mockReturnValueOnce(promise);

    // Set initial preferences in cache
    queryClient.setQueryData(
      queryKeys.preferences.all,
      mockExistingPreferences,
    );

    const { result } = renderHook(() => useDeletePreferenceMutation(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.mutate({
        userId: "user-123",
        category: "theme",
        name: "dark_mode",
      });
    });

    // Check optimistic delete was applied
    await waitFor(() => {
      const cachedPreferences = queryClient.getQueryData<IPreference[]>(
        queryKeys.preferences.all,
      );
      const deletedPref = cachedPreferences?.find(
        (p) => p.category === "theme" && p.name === "dark_mode",
      );
      expect(deletedPref).toBeUndefined();
      expect(cachedPreferences?.length).toBe(2);
    });

    await act(async () => {
      resolvePromise!();
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });

  it("rolls back on error", async () => {
    const mockDeletePreference = deletePreference as jest.Mock;
    const error = new Error("Delete failed");
    mockDeletePreference.mockRejectedValueOnce(error);

    // Set initial preferences in cache
    queryClient.setQueryData(
      queryKeys.preferences.all,
      mockExistingPreferences,
    );

    const { result } = renderHook(() => useDeletePreferenceMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({
        userId: "user-123",
        category: "theme",
        name: "dark_mode",
      });
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    // Check rollback was applied
    const cachedPreferences = queryClient.getQueryData<IPreference[]>(
      queryKeys.preferences.all,
    );
    expect(cachedPreferences).toEqual(mockExistingPreferences);
    expect(cachedPreferences?.length).toBe(3);
  });

  it("invalidates preferences query on success", async () => {
    const mockDeletePreference = deletePreference as jest.Mock;
    mockDeletePreference.mockResolvedValueOnce(undefined);

    const invalidateQueriesSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useDeletePreferenceMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({
        userId: "user-123",
        category: "theme",
        name: "dark_mode",
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.preferences.all,
    });
  });

  it("calls onSuccess callback with input", async () => {
    const mockDeletePreference = deletePreference as jest.Mock;
    mockDeletePreference.mockResolvedValueOnce(undefined);

    const onSuccess = jest.fn();

    const { result } = renderHook(
      () => useDeletePreferenceMutation({ onSuccess }),
      { wrapper: createWrapper(queryClient) },
    );

    const input = {
      userId: "user-123",
      category: "theme",
      name: "dark_mode",
    };

    await act(async () => {
      result.current.mutate(input);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(onSuccess).toHaveBeenCalledWith(input);
  });

  it("calls onError callback with context on failure", async () => {
    const mockDeletePreference = deletePreference as jest.Mock;
    const error = new Error("Delete failed");
    mockDeletePreference.mockRejectedValueOnce(error);

    queryClient.setQueryData(
      queryKeys.preferences.all,
      mockExistingPreferences,
    );

    const onError = jest.fn();

    const { result } = renderHook(
      () => useDeletePreferenceMutation({ onError }),
      { wrapper: createWrapper(queryClient) },
    );

    const input = {
      userId: "user-123",
      category: "theme",
      name: "dark_mode",
    };

    await act(async () => {
      result.current.mutate(input);
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(onError).toHaveBeenCalledWith(
      error,
      input,
      expect.objectContaining({
        previousPreferences: mockExistingPreferences,
        deletedPreference: mockExistingPreferences[0],
      }),
    );
  });

  it("calls onSettled callback after mutation completes", async () => {
    const mockDeletePreference = deletePreference as jest.Mock;
    mockDeletePreference.mockResolvedValueOnce(undefined);

    const onSettled = jest.fn();

    const { result } = renderHook(
      () => useDeletePreferenceMutation({ onSettled }),
      { wrapper: createWrapper(queryClient) },
    );

    await act(async () => {
      result.current.mutate({
        userId: "user-123",
        category: "theme",
        name: "dark_mode",
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(onSettled).toHaveBeenCalled();
  });

  it("handles deletion of non-existent preference gracefully", async () => {
    const mockDeletePreference = deletePreference as jest.Mock;
    mockDeletePreference.mockResolvedValueOnce(undefined);

    queryClient.setQueryData(
      queryKeys.preferences.all,
      mockExistingPreferences,
    );

    const { result } = renderHook(() => useDeletePreferenceMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({
        userId: "user-123",
        category: "nonexistent",
        name: "pref",
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Cache should remain unchanged except for the optimistic removal attempt
    expect(mockDeletePreference).toHaveBeenCalledWith(
      "user-123",
      "nonexistent",
      "pref",
    );
  });

  it("preserves other preferences after deletion", async () => {
    const mockDeletePreference = deletePreference as jest.Mock;
    mockDeletePreference.mockResolvedValueOnce(undefined);

    queryClient.setQueryData(
      queryKeys.preferences.all,
      mockExistingPreferences,
    );

    const { result } = renderHook(() => useDeletePreferenceMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({
        userId: "user-123",
        category: "theme",
        name: "dark_mode",
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Before invalidation, check the optimistic state
    // The accent_color and email preferences should still be there
    const cachedPreferences = queryClient.getQueryData<IPreference[]>(
      queryKeys.preferences.all,
    );

    const accentColor = cachedPreferences?.find(
      (p) => p.category === "theme" && p.name === "accent_color",
    );
    const email = cachedPreferences?.find(
      (p) => p.category === "notifications" && p.name === "email",
    );

    expect(accentColor).toBeDefined();
    expect(email).toBeDefined();
  });
});

//#endregion
