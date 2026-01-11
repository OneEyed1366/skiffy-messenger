// apps/v2/src/api/client.ts

/**
 * API Client for L7 State Management
 * Provides HTTP communication with the server API
 *
 * @module api/client
 */

//#region Imports

import type { IApiErrorResponse, IRequestOptions } from "./types";
import { ApiError } from "./types";

//#endregion

//#region Re-exports

// Re-export types and ApiError for backward compatibility
export { ApiError };
export type { IApiErrorResponse, IRequestOptions };

//#endregion

//#region ApiClient

/**
 * API Client singleton for making authenticated requests
 *
 * Usage:
 * ```typescript
 * import { apiClient } from "@/api";
 *
 * apiClient.setUrl("https://example.com");
 * apiClient.setToken("bearer-token");
 *
 * const users = await apiClient.fetch<IUser[]>(apiClient.getUsersRoute());
 * ```
 */
class ApiClient {
  private baseUrl = "";
  private token = "";

  //#region Configuration

  /**
   * Set the base URL for API requests
   * @param url - The server base URL (e.g., "https://example.com")
   */
  setUrl(url: string): void {
    this.baseUrl = url.replace(/\/$/, ""); // Remove trailing slash
  }

  /**
   * Get the current base URL
   */
  getUrl(): string {
    return this.baseUrl;
  }

  /**
   * Set the authentication token for API requests
   * @param token - The bearer token
   */
  setToken(token: string): void {
    this.token = token;
  }

  /**
   * Get the current token
   */
  getToken(): string {
    return this.token;
  }

  /**
   * Clear token (for logout)
   */
  clearToken(): void {
    this.token = "";
  }

  //#endregion

  //#region Route Builders

  /**
   * Get the base API route
   * @returns Base API path (e.g., "https://example.com/api/v4")
   */
  getBaseRoute(): string {
    return `${this.baseUrl}/api/v4`;
  }

  /**
   * Get the users API route
   * @returns Users endpoint path
   */
  getUsersRoute(): string {
    return `${this.getBaseRoute()}/users`;
  }

  /**
   * Get a specific user's route
   * @param userId - The user ID
   * @returns User endpoint path
   */
  getUserRoute(userId: string): string {
    return `${this.getUsersRoute()}/${userId}`;
  }

  /**
   * Get the posts API route
   * @returns Posts endpoint path
   */
  getPostsRoute(): string {
    return `${this.getBaseRoute()}/posts`;
  }

  /**
   * Get a specific post's route
   * @param postId - The post ID
   * @returns Post endpoint path
   */
  getPostRoute(postId: string): string {
    return `${this.getPostsRoute()}/${postId}`;
  }

  /**
   * Get the channels API route
   * @returns Channels endpoint path
   */
  getChannelsRoute(): string {
    return `${this.getBaseRoute()}/channels`;
  }

  /**
   * Get a specific channel's route
   * @param channelId - The channel ID
   * @returns Channel endpoint path
   */
  getChannelRoute(channelId: string): string {
    return `${this.getChannelsRoute()}/${channelId}`;
  }

  /**
   * Get the teams API route
   * @returns Teams endpoint path
   */
  getTeamsRoute(): string {
    return `${this.getBaseRoute()}/teams`;
  }

  /**
   * Get a specific team's route
   * @param teamId - The team ID
   * @returns Team endpoint path
   */
  getTeamRoute(teamId: string): string {
    return `${this.getTeamsRoute()}/${teamId}`;
  }

  /**
   * Get the threads API route for a user
   * @param userId - The user ID
   * @returns Threads endpoint path
   */
  getThreadsRoute(userId: string): string {
    return `${this.getUserRoute(userId)}/threads`;
  }

  /**
   * Get the config API route
   * @returns Config endpoint path
   */
  getConfigRoute(): string {
    return `${this.getBaseRoute()}/config`;
  }

  /**
   * Get the client config route
   * @returns Client config endpoint path
   */
  getClientConfigRoute(): string {
    return `${this.getConfigRoute()}/client`;
  }

  /**
   * Get the preferences API route for a user
   * @param userId - The user ID
   * @returns Preferences endpoint path
   */
  getPreferencesRoute(userId: string): string {
    return `${this.getUserRoute(userId)}/preferences`;
  }

  //#endregion

  //#region Headers

  /**
   * Get default headers for API requests
   * @returns Headers object with Authorization and Content-Type
   */
  getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    return headers;
  }

  //#endregion

  //#region Fetch Methods

  /**
   * Make an authenticated API request
   * @param url - The full URL to fetch
   * @param options - Fetch options
   * @returns Parsed JSON response
   * @throws {ApiError} When response is not ok
   */
  async fetch<T>(url: string, options?: IRequestOptions): Promise<T> {
    const mergedHeaders = {
      ...this.getHeaders(),
      ...options?.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers: mergedHeaders,
    });

    if (!response.ok) {
      let errorResponse: IApiErrorResponse;

      try {
        errorResponse = (await response.json()) as IApiErrorResponse;
      } catch {
        errorResponse = {
          message: response.statusText || "Unknown error",
          status_code: response.status,
        };
      }

      throw new ApiError(response.status, errorResponse);
    }

    // Handle empty responses (204 No Content)
    if (response.status === 204) {
      return undefined as T;
    }

    return response.json() as Promise<T>;
  }

  /**
   * Make a GET request
   * @param url - The full URL to fetch
   * @param options - Additional fetch options
   * @returns Parsed JSON response
   */
  async get<T>(url: string, options?: IRequestOptions): Promise<T> {
    return this.fetch<T>(url, { ...options, method: "GET" });
  }

  /**
   * Make a POST request
   * @param url - The full URL to post to
   * @param data - Request body data
   * @param options - Additional fetch options
   * @returns Parsed JSON response
   */
  async post<T>(
    url: string,
    data?: unknown,
    options?: IRequestOptions,
  ): Promise<T> {
    return this.fetch<T>(url, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * Make a PUT request
   * @param url - The full URL
   * @param data - Request body data
   * @param options - Additional fetch options
   * @returns Parsed JSON response
   */
  async put<T>(
    url: string,
    data?: unknown,
    options?: IRequestOptions,
  ): Promise<T> {
    return this.fetch<T>(url, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * Make a PATCH request
   * @param url - The full URL
   * @param data - Request body data
   * @param options - Additional fetch options
   * @returns Parsed JSON response
   */
  async patch<T>(
    url: string,
    data?: unknown,
    options?: IRequestOptions,
  ): Promise<T> {
    return this.fetch<T>(url, {
      ...options,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * Make a DELETE request
   * @param url - The full URL
   * @param options - Additional fetch options
   * @returns Parsed JSON response
   */
  async delete<T>(url: string, options?: IRequestOptions): Promise<T> {
    return this.fetch<T>(url, { ...options, method: "DELETE" });
  }

  //#endregion
}

//#endregion

//#region Singleton Export

/**
 * Singleton instance of the API client
 */
export const apiClient = new ApiClient();

//#endregion
