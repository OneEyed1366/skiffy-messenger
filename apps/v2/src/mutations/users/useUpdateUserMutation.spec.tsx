// apps/v2/src/mutations/users/useUpdateUserMutation.spec.tsx

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor, act } from "@testing-library/react-native";
import React from "react";

import { apiClient } from "@/api";
import { queryKeys } from "@/queries/keys";
import type { IUserProfile, IUserNotifyProps } from "@/types";

import { useUpdateUserMutation, updateUser } from "./useUpdateUserMutation";

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

const mockNotifyProps: IUserNotifyProps = {
  desktop: "all",
  desktop_sound: "true",
  email: "true",
  mark_unread: "all",
  push: "all",
  push_status: "online",
  comments: "any",
  first_name: "false",
  channel: "true",
  mention_keys: "",
  highlight_keys: "",
};

const mockUser: IUserProfile = {
  id: "user-123",
  create_at: 1700000000000,
  update_at: 1700000000000,
  delete_at: 0,
  username: "johndoe",
  auth_service: "",
  email: "john@example.com",
  nickname: "John",
  first_name: "John",
  last_name: "Doe",
  position: "Developer",
  roles: "system_user",
  props: {},
  notify_props: mockNotifyProps,
  last_password_update: 1700000000000,
  last_picture_update: 0,
  locale: "en",
  mfa_active: false,
  last_activity_at: 1700000000000,
  is_bot: false,
  bot_description: "",
  terms_of_service_id: "",
  terms_of_service_create_at: 0,
};

const updatedUser: IUserProfile = {
  ...mockUser,
  nickname: "Johnny",
  position: "Senior Developer",
  update_at: 1700000001000,
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

//#region updateUser API Function Tests

describe("updateUser", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls apiClient.put with correct URL and data", async () => {
    const mockApiPut = apiClient.put as jest.Mock;
    mockApiPut.mockResolvedValueOnce(updatedUser);

    const input = {
      user_id: "user-123",
      nickname: "Johnny",
      position: "Senior Developer",
    };

    const result = await updateUser(input);

    expect(mockApiPut).toHaveBeenCalledWith(
      "https://api.example.com/api/v4/users/user-123",
      { id: "user-123", nickname: "Johnny", position: "Senior Developer" },
    );
    expect(result).toEqual(updatedUser);
  });

  it("passes email when provided", async () => {
    const mockApiPut = apiClient.put as jest.Mock;
    mockApiPut.mockResolvedValueOnce({ ...mockUser, email: "new@example.com" });

    const input = {
      user_id: "user-123",
      email: "new@example.com",
    };

    await updateUser(input);

    expect(mockApiPut).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ email: "new@example.com" }),
    );
  });

  it("propagates API errors", async () => {
    const mockApiPut = apiClient.put as jest.Mock;
    const error = new Error("API Error");
    mockApiPut.mockRejectedValueOnce(error);

    const input = {
      user_id: "user-123",
      nickname: "Johnny",
    };

    await expect(updateUser(input)).rejects.toThrow("API Error");
  });
});

//#endregion

//#region useUpdateUserMutation Hook Tests

describe("useUpdateUserMutation", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = createTestQueryClient();
  });

  afterEach(() => {
    queryClient.clear();
  });

  it("updates a user successfully", async () => {
    const mockApiPut = apiClient.put as jest.Mock;
    mockApiPut.mockResolvedValueOnce(updatedUser);

    const { result } = renderHook(() => useUpdateUserMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({
        user_id: "user-123",
        nickname: "Johnny",
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(updatedUser);
  });

  it("performs optimistic update on user detail", async () => {
    const mockApiPut = apiClient.put as jest.Mock;
    let resolvePromise: (value: IUserProfile) => void;
    const promise = new Promise<IUserProfile>((resolve) => {
      resolvePromise = resolve;
    });
    mockApiPut.mockReturnValueOnce(promise);

    // Set initial user in cache
    queryClient.setQueryData(queryKeys.users.detail("user-123"), mockUser);

    const { result } = renderHook(() => useUpdateUserMutation(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.mutate({
        user_id: "user-123",
        nickname: "Optimistic Nick",
      });
    });

    // Check optimistic update was applied
    await waitFor(() => {
      const cachedUser = queryClient.getQueryData<IUserProfile>(
        queryKeys.users.detail("user-123"),
      );
      expect(cachedUser?.nickname).toBe("Optimistic Nick");
    });

    await act(async () => {
      resolvePromise!(updatedUser);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });

  it("performs optimistic update on current user if matching", async () => {
    const mockApiPut = apiClient.put as jest.Mock;
    let resolvePromise: (value: IUserProfile) => void;
    const promise = new Promise<IUserProfile>((resolve) => {
      resolvePromise = resolve;
    });
    mockApiPut.mockReturnValueOnce(promise);

    // Set current user in cache (same as the user being updated)
    queryClient.setQueryData(queryKeys.users.current(), mockUser);
    queryClient.setQueryData(queryKeys.users.detail("user-123"), mockUser);

    const { result } = renderHook(() => useUpdateUserMutation(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.mutate({
        user_id: "user-123",
        position: "Optimistic Position",
      });
    });

    // Check optimistic update was applied to current user
    await waitFor(() => {
      const cachedCurrentUser = queryClient.getQueryData<IUserProfile>(
        queryKeys.users.current(),
      );
      expect(cachedCurrentUser?.position).toBe("Optimistic Position");
    });

    await act(async () => {
      resolvePromise!(updatedUser);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });

  it("rolls back on error", async () => {
    const mockApiPut = apiClient.put as jest.Mock;
    const error = new Error("Update failed");
    mockApiPut.mockRejectedValueOnce(error);

    // Set initial user in cache
    queryClient.setQueryData(queryKeys.users.detail("user-123"), mockUser);

    const { result } = renderHook(() => useUpdateUserMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({
        user_id: "user-123",
        nickname: "This will fail",
      });
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    // Check rollback was applied
    const cachedUser = queryClient.getQueryData<IUserProfile>(
      queryKeys.users.detail("user-123"),
    );
    expect(cachedUser?.nickname).toBe("John");
  });

  it("rolls back current user on error if matching", async () => {
    const mockApiPut = apiClient.put as jest.Mock;
    const error = new Error("Update failed");
    mockApiPut.mockRejectedValueOnce(error);

    // Set current user in cache (same as the user being updated)
    queryClient.setQueryData(queryKeys.users.current(), mockUser);
    queryClient.setQueryData(queryKeys.users.detail("user-123"), mockUser);

    const { result } = renderHook(() => useUpdateUserMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({
        user_id: "user-123",
        nickname: "This will fail",
      });
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    // Check rollback was applied to current user
    const cachedCurrentUser = queryClient.getQueryData<IUserProfile>(
      queryKeys.users.current(),
    );
    expect(cachedCurrentUser?.nickname).toBe("John");
  });

  it("invalidates user detail query on success", async () => {
    const mockApiPut = apiClient.put as jest.Mock;
    mockApiPut.mockResolvedValueOnce(updatedUser);

    const invalidateQueriesSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useUpdateUserMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({
        user_id: "user-123",
        nickname: "Johnny",
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.users.detail("user-123"),
    });
  });

  it("invalidates current user query on success", async () => {
    const mockApiPut = apiClient.put as jest.Mock;
    mockApiPut.mockResolvedValueOnce(updatedUser);

    const invalidateQueriesSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useUpdateUserMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({
        user_id: "user-123",
        nickname: "Johnny",
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.users.current(),
    });
  });

  it("calls onSuccess callback when provided", async () => {
    const mockApiPut = apiClient.put as jest.Mock;
    mockApiPut.mockResolvedValueOnce(updatedUser);

    const onSuccess = jest.fn();

    const { result } = renderHook(() => useUpdateUserMutation({ onSuccess }), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({
        user_id: "user-123",
        nickname: "Johnny",
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(onSuccess).toHaveBeenCalledWith(updatedUser);
  });

  it("calls onError callback with context on failure", async () => {
    const mockApiPut = apiClient.put as jest.Mock;
    const error = new Error("Update failed");
    mockApiPut.mockRejectedValueOnce(error);

    queryClient.setQueryData(queryKeys.users.detail("user-123"), mockUser);

    const onError = jest.fn();

    const { result } = renderHook(() => useUpdateUserMutation({ onError }), {
      wrapper: createWrapper(queryClient),
    });

    const input = {
      user_id: "user-123",
      nickname: "This will fail",
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
      expect.objectContaining({ previousUser: mockUser }),
    );
  });

  it("calls onSettled callback", async () => {
    const mockApiPut = apiClient.put as jest.Mock;
    mockApiPut.mockResolvedValueOnce(updatedUser);

    const onSettled = jest.fn();

    const { result } = renderHook(() => useUpdateUserMutation({ onSettled }), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({
        user_id: "user-123",
        nickname: "Johnny",
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(onSettled).toHaveBeenCalled();
  });

  it("updates timezone optimistically", async () => {
    const mockApiPut = apiClient.put as jest.Mock;
    mockApiPut.mockResolvedValueOnce({
      ...mockUser,
      timezone: { manualTimezone: "America/New_York" },
    });

    queryClient.setQueryData(queryKeys.users.detail("user-123"), {
      ...mockUser,
      timezone: { manualTimezone: "UTC" },
    });

    const { result } = renderHook(() => useUpdateUserMutation(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.mutate({
        user_id: "user-123",
        timezone: { manualTimezone: "America/New_York" },
      });
    });

    // Check optimistic update
    await waitFor(() => {
      const cachedUser = queryClient.getQueryData<IUserProfile>(
        queryKeys.users.detail("user-123"),
      );
      expect(cachedUser?.timezone?.manualTimezone).toBe("America/New_York");
    });
  });
});

//#endregion
