// apps/v2/src/api/types.ts

/**
 * API Types for L7 State Management
 *
 * @module api/types
 */

//#region Error Types

/**
 * API error response shape from server
 */
export type IApiError = {
  status: number;
  message: string;
  details?: unknown;
};

/**
 * Extended error response with optional server-specific fields
 */
export type IApiErrorResponse = {
  id?: string;
  message: string;
  detailed_error?: string;
  request_id?: string;
  status_code: number;
};

/**
 * Custom error class for API errors
 * Contains status code and parsed error response
 */
export class ApiError extends Error {
  readonly status: number;
  readonly statusCode: number;
  readonly details?: unknown;
  readonly response: IApiErrorResponse;

  constructor(
    status: number,
    body: { message?: string; [key: string]: unknown },
  ) {
    // Use || to treat empty string as falsy (fallback to default message)
    const message = body.message || `Request failed with status ${status}`;
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.statusCode = status;
    this.details = body;
    this.response = {
      message,
      status_code: status,
      id: typeof body.id === "string" ? body.id : undefined,
      detailed_error:
        typeof body.detailed_error === "string"
          ? body.detailed_error
          : undefined,
      request_id:
        typeof body.request_id === "string" ? body.request_id : undefined,
    };
  }
}

//#endregion

//#region Request Types

/**
 * Request options extending fetch options
 */
export type IRequestOptions = Omit<RequestInit, "headers"> & {
  headers?: Record<string, string>;
};

//#endregion
