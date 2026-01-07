// apps/v2/src/utils/id.ts

/**
 * ID generation utilities
 * Migrated from: vendor/desktop/webapp/channels/src/utils/utils.tsx
 */

import { v4 as uuidv4 } from "uuid";

//#region ID Generation

/**
 * Generates a RFC-4122 version 4 compliant globally unique identifier.
 * Uses the uuid package for cryptographically secure random generation.
 *
 * @returns A UUID v4 string in format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 *
 * @example
 * ```typescript
 * const id = generateId();
 * // => "550e8400-e29b-41d4-a716-446655440000"
 * ```
 */
export function generateId(): string {
  return uuidv4();
}

//#endregion
