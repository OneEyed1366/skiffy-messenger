// apps/v2/src/mutations/preferences/useSavePreferenceMutation.spec.tsx

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor, act } from "@testing-library/react-native";
import React from "react";

import { savePreference, savePreferences } from "@/api/preferences";
import { queryKeys } from "@/queries/keys";
import type { IPreference } from "@/types";

import {
  useSavePreferenceMutation,
  useSavePreferencesMutation,
} from "./useSavePreferenceMutation";

//#region Mocks

jest.mock("@/api/preferences", () => ({
  savePreference: jest.fn(),
  savePreferences: jest.fn(),
}));

//#endregion

//#region Test Setup

const mockPreference: IPreference = {
  user_id: "user-123",
  category: "theme",
  name: "dark_mode",
  value: "true",
};

const mockExistingPreferences: IPreference[] = [
  {
    user_id: "user-123",
    category: "theme",
    name: "dark_mode",
    value: "false",
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

//#region useSavePreferenceMutation Hook Tests

describe("useSavePreferenceMutation", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = createTestQueryClient();
  });

  afterEach(() => {
    queryClient.clear();
  });

  it("saves a preference successfully", async () => {
    const mockSavePreference = savePreference as jest.Mock;
    mockSavePreference.mockResolvedValueOnce(mockPreference);

    const { result } = renderHook(() => useSavePreferenceMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({
        userId: "user-123",
        preference: {
          category: "theme",
          name: "dark_mode",
          value: "true",
        },
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockSavePreference).toHaveBeenCalledWith("user-123", {
      category: "theme",
      name: "dark_mode",
      value: "true",
    });
  });

  it("performs optimistic update for existing preference", async () => {
    const mockSavePreference = savePreference as jest.Mock;
    let resolvePromise: (value: IPreference) => void;
    const promise = new Promise<IPreference>((resolve) => {
      resolvePromise = resolve;
    });
    mockSavePreference.mockReturnValueOnce(promise);

    // Set initial preferences in cache
    queryClient.setQueryData(
      queryKeys.preferences.all,
      mockExistingPreferences,
    );

    const { result } = renderHook(() => useSavePreferenceMutation(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.mutate({
        userId: "user-123",
        preference: {
          category: "theme",
          name: "dark_mode",
          value: "true",
        },
      });
    });

    // Check optimistic update was applied
    await waitFor(() => {
      const cachedPreferences = queryClient.getQueryData<IPreference[]>(
        queryKeys.preferences.all,
      );
      const updatedPref = cachedPreferences?.find(
        (p) => p.category === "theme" && p.name === "dark_mode",
      );
      expect(updatedPref?.value).toBe("true");
    });

    await act(async () => {
      resolvePromise!(mockPreference);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });

  it("adds new preference optimistically", async () => {
    const mockSavePreference = savePreference as jest.Mock;
    let resolvePromise: (value: IPreference) => void;
    const promise = new Promise<IPreference>((resolve) => {
      resolvePromise = resolve;
    });
    mockSavePreference.mockReturnValueOnce(promise);

    // Set initial preferences in cache (without the new preference)
    queryClient.setQueryData(
      queryKeys.preferences.all,
      mockExistingPreferences,
    );

    const { result } = renderHook(() => useSavePreferenceMutation(), {
      wrapper: createWrapper(queryClient),
    });

    const newPreference = {
      category: "theme",
      name: "accent_color",
      value: "blue",
    };

    act(() => {
      result.current.mutate({
        userId: "user-123",
        preference: newPreference,
      });
    });

    // Check optimistic update added the new preference
    await waitFor(() => {
      const cachedPreferences = queryClient.getQueryData<IPreference[]>(
        queryKeys.preferences.all,
      );
      const addedPref = cachedPreferences?.find(
        (p) => p.category === "theme" && p.name === "accent_color",
      );
      expect(addedPref?.value).toBe("blue");
    });

    await act(async () => {
      resolvePromise!({
        user_id: "user-123",
        ...newPreference,
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });

  it("rolls back on error", async () => {
    const mockSavePreference = savePreference as jest.Mock;
    const error = new Error("Save failed");
    mockSavePreference.mockRejectedValueOnce(error);

    // Set initial preferences in cache
    queryClient.setQueryData(
      queryKeys.preferences.all,
      mockExistingPreferences,
    );

    const { result } = renderHook(() => useSavePreferenceMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({
        userId: "user-123",
        preference: {
          category: "theme",
          name: "dark_mode",
          value: "true",
        },
      });
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    // Check rollback was applied
    const cachedPreferences = queryClient.getQueryData<IPreference[]>(
      queryKeys.preferences.all,
    );
    const pref = cachedPreferences?.find(
      (p) => p.category === "theme" && p.name === "dark_mode",
    );
    expect(pref?.value).toBe("false"); // Original value
  });

  it("invalidates preferences query on success", async () => {
    const mockSavePreference = savePreference as jest.Mock;
    mockSavePreference.mockResolvedValueOnce(mockPreference);

    const invalidateQueriesSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useSavePreferenceMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({
        userId: "user-123",
        preference: {
          category: "theme",
          name: "dark_mode",
          value: "true",
        },
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.preferences.all,
    });
  });

  it("calls onSuccess callback with saved preference", async () => {
    const mockSavePreference = savePreference as jest.Mock;
    mockSavePreference.mockResolvedValueOnce(mockPreference);

    const onSuccess = jest.fn();

    const { result } = renderHook(
      () => useSavePreferenceMutation({ onSuccess }),
      { wrapper: createWrapper(queryClient) },
    );

    await act(async () => {
      result.current.mutate({
        userId: "user-123",
        preference: {
          category: "theme",
          name: "dark_mode",
          value: "true",
        },
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(onSuccess).toHaveBeenCalledWith(mockPreference);
  });

  it("calls onError callback on failure", async () => {
    const mockSavePreference = savePreference as jest.Mock;
    const error = new Error("Save failed");
    mockSavePreference.mockRejectedValueOnce(error);

    queryClient.setQueryData(
      queryKeys.preferences.all,
      mockExistingPreferences,
    );

    const onError = jest.fn();

    const { result } = renderHook(
      () => useSavePreferenceMutation({ onError }),
      { wrapper: createWrapper(queryClient) },
    );

    const input = {
      userId: "user-123",
      preference: {
        category: "theme",
        name: "dark_mode",
        value: "true",
      },
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
      }),
    );
  });

  it("calls onSettled callback after mutation completes", async () => {
    const mockSavePreference = savePreference as jest.Mock;
    mockSavePreference.mockResolvedValueOnce(mockPreference);

    const onSettled = jest.fn();

    const { result } = renderHook(
      () => useSavePreferenceMutation({ onSettled }),
      { wrapper: createWrapper(queryClient) },
    );

    await act(async () => {
      result.current.mutate({
        userId: "user-123",
        preference: {
          category: "theme",
          name: "dark_mode",
          value: "true",
        },
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(onSettled).toHaveBeenCalled();
  });
});

//#endregion

//#region useSavePreferencesMutation Hook Tests

describe("useSavePreferencesMutation", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = createTestQueryClient();
  });

  afterEach(() => {
    queryClient.clear();
  });

  it("saves multiple preferences successfully", async () => {
    const mockSavePreferences = savePreferences as jest.Mock;
    mockSavePreferences.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useSavePreferencesMutation(), {
      wrapper: createWrapper(queryClient),
    });

    const preferences = [
      { category: "theme", name: "dark_mode", value: "true" },
      { category: "theme", name: "accent_color", value: "blue" },
    ];

    await act(async () => {
      result.current.mutate({
        userId: "user-123",
        preferences,
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockSavePreferences).toHaveBeenCalledWith("user-123", preferences);
  });

  it("performs optimistic update for multiple preferences", async () => {
    const mockSavePreferences = savePreferences as jest.Mock;
    let resolvePromise: () => void;
    const promise = new Promise<void>((resolve) => {
      resolvePromise = resolve;
    });
    mockSavePreferences.mockReturnValueOnce(promise);

    // Set initial preferences in cache
    queryClient.setQueryData(
      queryKeys.preferences.all,
      mockExistingPreferences,
    );

    const { result } = renderHook(() => useSavePreferencesMutation(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.mutate({
        userId: "user-123",
        preferences: [
          { category: "theme", name: "dark_mode", value: "true" },
          { category: "theme", name: "accent_color", value: "red" },
        ],
      });
    });

    // Check optimistic update was applied
    await waitFor(() => {
      const cachedPreferences = queryClient.getQueryData<IPreference[]>(
        queryKeys.preferences.all,
      );
      const darkMode = cachedPreferences?.find(
        (p) => p.category === "theme" && p.name === "dark_mode",
      );
      const accentColor = cachedPreferences?.find(
        (p) => p.category === "theme" && p.name === "accent_color",
      );
      expect(darkMode?.value).toBe("true");
      expect(accentColor?.value).toBe("red");
    });

    await act(async () => {
      resolvePromise!();
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });

  it("rolls back on error", async () => {
    const mockSavePreferences = savePreferences as jest.Mock;
    const error = new Error("Save failed");
    mockSavePreferences.mockRejectedValueOnce(error);

    // Set initial preferences in cache
    queryClient.setQueryData(
      queryKeys.preferences.all,
      mockExistingPreferences,
    );

    const { result } = renderHook(() => useSavePreferencesMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({
        userId: "user-123",
        preferences: [{ category: "theme", name: "dark_mode", value: "true" }],
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
  });

  it("invalidates preferences query on success", async () => {
    const mockSavePreferences = savePreferences as jest.Mock;
    mockSavePreferences.mockResolvedValueOnce(undefined);

    const invalidateQueriesSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useSavePreferencesMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({
        userId: "user-123",
        preferences: [{ category: "theme", name: "dark_mode", value: "true" }],
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.preferences.all,
    });
  });

  it("calls onSuccess callback", async () => {
    const mockSavePreferences = savePreferences as jest.Mock;
    mockSavePreferences.mockResolvedValueOnce(undefined);

    const onSuccess = jest.fn();

    const { result } = renderHook(
      () => useSavePreferencesMutation({ onSuccess }),
      { wrapper: createWrapper(queryClient) },
    );

    await act(async () => {
      result.current.mutate({
        userId: "user-123",
        preferences: [{ category: "theme", name: "dark_mode", value: "true" }],
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(onSuccess).toHaveBeenCalled();
  });

  it("calls onSettled callback after mutation completes", async () => {
    const mockSavePreferences = savePreferences as jest.Mock;
    mockSavePreferences.mockResolvedValueOnce(undefined);

    const onSettled = jest.fn();

    const { result } = renderHook(
      () => useSavePreferencesMutation({ onSettled }),
      { wrapper: createWrapper(queryClient) },
    );

    await act(async () => {
      result.current.mutate({
        userId: "user-123",
        preferences: [{ category: "theme", name: "dark_mode", value: "true" }],
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(onSettled).toHaveBeenCalled();
  });
});

//#endregion
