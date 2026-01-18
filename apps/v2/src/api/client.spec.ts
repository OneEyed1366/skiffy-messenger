// apps/v2/src/api/client.spec.ts

import { apiClient, ApiError } from "./client";
import type { IApiErrorResponse } from "./types";

//#region Test Setup

// Store original fetch
const originalFetch = global.fetch;

// Mock fetch helper
function mockFetch(
  response: unknown,
  options: { ok?: boolean; status?: number; statusText?: string } = {},
) {
  const { ok = true, status = 200, statusText = "OK" } = options;

  global.fetch = jest.fn().mockResolvedValue({
    ok,
    status,
    statusText,
    json: jest.fn().mockResolvedValue(response),
  });

  return global.fetch as jest.Mock;
}

// Reset between tests
beforeEach(() => {
  apiClient.setUrl("");
  apiClient.setToken("");
  global.fetch = originalFetch;
});

afterAll(() => {
  global.fetch = originalFetch;
});

//#endregion

//#region Configuration Tests

describe("ApiClient Configuration", () => {
  describe("setUrl", () => {
    it("sets the base URL", () => {
      apiClient.setUrl("https://example.com");
      expect(apiClient.getUrl()).toBe("https://example.com");
    });

    it("removes trailing slash from URL", () => {
      apiClient.setUrl("https://example.com/");
      expect(apiClient.getUrl()).toBe("https://example.com");
    });
  });

  describe("setToken", () => {
    it("sets the authentication token", () => {
      apiClient.setToken("test-token-123");
      expect(apiClient.getToken()).toBe("test-token-123");
    });
  });

  describe("clearToken", () => {
    it("clears the authentication token", () => {
      apiClient.setToken("test-token-123");
      apiClient.clearToken();
      expect(apiClient.getToken()).toBe("");
    });
  });
});

//#endregion

//#region Route Builder Tests

describe("ApiClient Route Builders", () => {
  beforeEach(() => {
    apiClient.setUrl("https://api.example.com");
  });

  describe("getBaseRoute", () => {
    it("returns correct base API path", () => {
      expect(apiClient.getBaseRoute()).toBe("https://api.example.com/api/v4");
    });
  });

  describe("getUsersRoute", () => {
    it("returns correct users path", () => {
      expect(apiClient.getUsersRoute()).toBe(
        "https://api.example.com/api/v4/users",
      );
    });
  });

  describe("getUserRoute", () => {
    it("returns correct user path with ID", () => {
      expect(apiClient.getUserRoute("user123")).toBe(
        "https://api.example.com/api/v4/users/user123",
      );
    });
  });

  describe("getPostsRoute", () => {
    it("returns correct posts path", () => {
      expect(apiClient.getPostsRoute()).toBe(
        "https://api.example.com/api/v4/posts",
      );
    });
  });

  describe("getPostRoute", () => {
    it("returns correct post path with ID", () => {
      expect(apiClient.getPostRoute("post456")).toBe(
        "https://api.example.com/api/v4/posts/post456",
      );
    });
  });

  describe("getChannelsRoute", () => {
    it("returns correct channels path", () => {
      expect(apiClient.getChannelsRoute()).toBe(
        "https://api.example.com/api/v4/channels",
      );
    });
  });

  describe("getChannelRoute", () => {
    it("returns correct channel path with ID", () => {
      expect(apiClient.getChannelRoute("channel789")).toBe(
        "https://api.example.com/api/v4/channels/channel789",
      );
    });
  });

  describe("getTeamsRoute", () => {
    it("returns correct teams path", () => {
      expect(apiClient.getTeamsRoute()).toBe(
        "https://api.example.com/api/v4/teams",
      );
    });
  });

  describe("getTeamRoute", () => {
    it("returns correct team path with ID", () => {
      expect(apiClient.getTeamRoute("team101")).toBe(
        "https://api.example.com/api/v4/teams/team101",
      );
    });
  });

  describe("getThreadsRoute", () => {
    it("returns correct threads path for user", () => {
      expect(apiClient.getThreadsRoute("user123")).toBe(
        "https://api.example.com/api/v4/users/user123/threads",
      );
    });
  });

  describe("getConfigRoute", () => {
    it("returns correct config path", () => {
      expect(apiClient.getConfigRoute()).toBe(
        "https://api.example.com/api/v4/config",
      );
    });
  });

  describe("getClientConfigRoute", () => {
    it("returns correct client config path", () => {
      expect(apiClient.getClientConfigRoute()).toBe(
        "https://api.example.com/api/v4/config/client",
      );
    });
  });

  describe("getPreferencesRoute", () => {
    it("returns correct preferences path for user", () => {
      expect(apiClient.getPreferencesRoute("user123")).toBe(
        "https://api.example.com/api/v4/users/user123/preferences",
      );
    });
  });
});

//#endregion

//#region Headers Tests

describe("ApiClient Headers", () => {
  describe("getHeaders", () => {
    it("includes Content-Type header", () => {
      const headers = apiClient.getHeaders();
      expect(headers["Content-Type"]).toBe("application/json");
    });

    it("includes Authorization header when token is set", () => {
      apiClient.setToken("my-token");
      const headers = apiClient.getHeaders();
      expect(headers["Authorization"]).toBe("Bearer my-token");
    });

    it("does not include Authorization header when token is empty", () => {
      apiClient.setToken("");
      const headers = apiClient.getHeaders();
      expect(headers["Authorization"]).toBeUndefined();
    });
  });
});

//#endregion

//#region Fetch Tests

describe("ApiClient Fetch", () => {
  beforeEach(() => {
    apiClient.setUrl("https://api.example.com");
    apiClient.setToken("test-token");
  });

  describe("fetch", () => {
    it("makes request with correct headers", async () => {
      const mockData = { id: "1", name: "Test" };
      const fetchMock = mockFetch(mockData);

      await apiClient.fetch("https://api.example.com/api/v4/users");

      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.example.com/api/v4/users",
        expect.objectContaining({
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer test-token",
          },
        }),
      );
    });

    it("returns parsed JSON response on success", async () => {
      const mockData = { id: "1", name: "Test User" };
      mockFetch(mockData);

      const result = await apiClient.fetch<typeof mockData>(
        "https://api.example.com/api/v4/users/1",
      );

      expect(result).toEqual(mockData);
    });

    it("merges custom headers with default headers", async () => {
      const mockData = { success: true };
      const fetchMock = mockFetch(mockData);

      await apiClient.fetch("https://api.example.com/api/v4/data", {
        headers: { "X-Custom-Header": "custom-value" },
      });

      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.example.com/api/v4/data",
        expect.objectContaining({
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer test-token",
            "X-Custom-Header": "custom-value",
          },
        }),
      );
    });

    it("throws ApiError on error response", async () => {
      const errorResponse: IApiErrorResponse = {
        message: "Not found",
        status_code: 404,
        id: "api.user.not_found",
      };
      mockFetch(errorResponse, {
        ok: false,
        status: 404,
        statusText: "Not Found",
      });

      await expect(
        apiClient.fetch("https://api.example.com/api/v4/users/unknown"),
      ).rejects.toThrow(ApiError);
    });

    it("ApiError contains status code and response", async () => {
      const errorResponse: IApiErrorResponse = {
        message: "Unauthorized",
        status_code: 401,
        detailed_error: "Token expired",
      };
      mockFetch(errorResponse, { ok: false, status: 401 });

      try {
        await apiClient.fetch("https://api.example.com/api/v4/protected");
        fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        const apiError = error as ApiError;
        expect(apiError.statusCode).toBe(401);
        expect(apiError.response.message).toBe("Unauthorized");
        expect(apiError.response.detailed_error).toBe("Token expired");
      }
    });

    it("handles non-JSON error response", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        json: jest.fn().mockRejectedValue(new Error("Invalid JSON")),
      });

      try {
        await apiClient.fetch("https://api.example.com/api/v4/error");
        fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        const apiError = error as ApiError;
        expect(apiError.statusCode).toBe(500);
        expect(apiError.response.message).toBe("Internal Server Error");
      }
    });

    it("handles 204 No Content response", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 204,
        json: jest.fn(),
      });

      const result = await apiClient.fetch(
        "https://api.example.com/api/v4/delete",
      );

      expect(result).toBeUndefined();
    });
  });
});

//#endregion

//#region HTTP Method Tests

describe("ApiClient HTTP Methods", () => {
  beforeEach(() => {
    apiClient.setUrl("https://api.example.com");
    apiClient.setToken("test-token");
  });

  describe("get", () => {
    it("makes GET request", async () => {
      const mockData = [{ id: "1" }, { id: "2" }];
      const fetchMock = mockFetch(mockData);

      await apiClient.get("https://api.example.com/api/v4/users");

      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.example.com/api/v4/users",
        expect.objectContaining({ method: "GET" }),
      );
    });
  });

  describe("post", () => {
    it("makes POST request with body", async () => {
      const requestData = { name: "New User" };
      const responseData = { id: "123", name: "New User" };
      const fetchMock = mockFetch(responseData);

      await apiClient.post("https://api.example.com/api/v4/users", requestData);

      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.example.com/api/v4/users",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(requestData),
        }),
      );
    });

    it("makes POST request without body", async () => {
      const responseData = { success: true };
      const fetchMock = mockFetch(responseData);

      await apiClient.post("https://api.example.com/api/v4/action");

      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.example.com/api/v4/action",
        expect.objectContaining({
          method: "POST",
          body: undefined,
        }),
      );
    });
  });

  describe("put", () => {
    it("makes PUT request with body", async () => {
      const requestData = { name: "Updated User" };
      const responseData = { id: "123", name: "Updated User" };
      const fetchMock = mockFetch(responseData);

      await apiClient.put(
        "https://api.example.com/api/v4/users/123",
        requestData,
      );

      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.example.com/api/v4/users/123",
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify(requestData),
        }),
      );
    });
  });

  describe("patch", () => {
    it("makes PATCH request with body", async () => {
      const requestData = { status: "active" };
      const responseData = { id: "123", status: "active" };
      const fetchMock = mockFetch(responseData);

      await apiClient.patch(
        "https://api.example.com/api/v4/users/123",
        requestData,
      );

      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.example.com/api/v4/users/123",
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify(requestData),
        }),
      );
    });
  });

  describe("delete", () => {
    it("makes DELETE request", async () => {
      const responseData = { success: true };
      const fetchMock = mockFetch(responseData);

      await apiClient.delete("https://api.example.com/api/v4/users/123");

      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.example.com/api/v4/users/123",
        expect.objectContaining({ method: "DELETE" }),
      );
    });
  });
});

//#endregion

//#region ApiError Tests

describe("ApiError", () => {
  it("extends Error", () => {
    const error = new ApiError(404, { message: "Not found", status_code: 404 });
    expect(error).toBeInstanceOf(Error);
  });

  it("has correct name", () => {
    const error = new ApiError(404, { message: "Not found", status_code: 404 });
    expect(error.name).toBe("ApiError");
  });

  it("uses response message as error message", () => {
    const error = new ApiError(404, {
      message: "User not found",
      status_code: 404,
    });
    expect(error.message).toBe("User not found");
  });

  it("uses fallback message when response message is empty", () => {
    const error = new ApiError(500, { message: "", status_code: 500 });
    expect(error.message).toBe("Request failed with status 500");
  });

  it("stores status code", () => {
    const error = new ApiError(403, { message: "Forbidden", status_code: 403 });
    expect(error.statusCode).toBe(403);
  });

  it("stores full response object", () => {
    const response: IApiErrorResponse = {
      message: "Bad request",
      status_code: 400,
      id: "api.validation.error",
      detailed_error: "Field 'email' is invalid",
      request_id: "req-123",
    };
    const error = new ApiError(400, response);
    expect(error.response).toEqual(response);
  });
});

//#endregion
