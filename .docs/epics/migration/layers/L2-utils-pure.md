# L2: Pure Utils

## Overview

Pure utility functions with no external dependencies (no React, no state, no platform-specific code).

## Source Location

`vendor/desktop/webapp/channels/src/utils/`

## Target Location

`apps/v2/src/utils/`

## Dependencies

- L0: Types
- L1: Constants

## Tasks

| ID                                           | Name           | Status  | Parallel | Est. | Assignee |
| -------------------------------------------- | -------------- | ------- | -------- | ---- | -------- |
| [T2.01](../tasks/T2.01-utils-generate-id.md) | generateId     | pending | ✓        | 0.5h | -        |
| [T2.02](../tasks/T2.02-utils-latinise.md)    | latinise       | pending | ✓        | 0.5h | -        |
| [T2.03](../tasks/T2.03-utils-string.md)      | String utils   | pending | ✓        | 0.5h | -        |
| [T2.04](../tasks/T2.04-utils-color.md)       | Color utils    | pending | ✓        | 0.5h | -        |
| [T2.05](../tasks/T2.05-utils-file-size.md)   | File size      | pending | ✓        | 0.5h | -        |
| [T2.06](../tasks/T2.06-utils-object.md)      | Object utils   | pending | ✓        | 0.5h | -        |
| [T2.07](../tasks/T2.07-utils-math.md)        | Math utils     | pending | ✓        | 0.5h | -        |
| [T2.10](../tasks/T2.10-utils-array.md)       | Array utils    | pending | ✓        | 0.5h | -        |
| [T2.11](../tasks/T2.11-utils-date.md)        | Date utils     | pending | ✓        | 0.5h | -        |
| [T2.12](../tasks/T2.12-utils-timer.md)       | Timer utils    | pending | ✓        | 0.5h | -        |
| [T2.13](../tasks/T2.13-utils-timezone.md)    | Timezone utils | pending | ✓        | 0.5h | -        |

> **Note:** Task file names updated to match broader utility domains (e.g., `utils-string.md` instead of `utils-to-title-case.md`). Each task file may contain multiple related functions.

## Progress

- Total: 11
- Done: 0
- In Progress: 0
- Pending: 11

## File Structure

```
apps/v2/src/utils/
├── id.ts        # T2.01 - generateId
├── string.ts    # T2.02, T2.03 - latinise, toTitleCase
├── color.ts     # T2.04 - toRgbValues
├── file.ts      # T2.05 - fileSizeToString
├── object.ts    # T2.06, T2.10 - isEmptyObject, deleteKeysFromObject
├── math.ts      # T2.07 - mod
├── date.ts      # T2.11 - date formatting
├── timer.ts     # T2.12 - debounce, throttle
├── timezone.ts  # T2.13 - timezone utils
└── index.ts     # Re-exports
```

## Implementation Notes

### generateId (T2.01)

```typescript
// Use React Native's crypto or uuid package
import { v4 as uuidv4 } from "uuid";

export function generateId(): string {
  return uuidv4();
}
```

### latinise (T2.02)

```typescript
// Character map for accent removal
const LATIN_MAP: Record<string, string> = {
  À: "A",
  Á: "A",
  Â: "A" /* ... */,
};

export function latinise(input: string): string {
  return input.replace(/[^\u0000-\u007E]/g, (char) => LATIN_MAP[char] || char);
}
```

### Date Utils (T2.11)

```typescript
export function formatDate(date: Date, format: string): string {
  // Pure date formatting without timezone concerns
}

export function isToday(date: Date): boolean {
  const today = new Date();
  return date.toDateString() === today.toDateString();
}
```

### Timer Utils (T2.12)

```typescript
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
```

### Timezone Utils (T2.13)

```typescript
export function getTimezoneOffset(): number {
  return new Date().getTimezoneOffset();
}

export function formatTimezone(offset: number): string {
  const hours = Math.floor(Math.abs(offset) / 60);
  const minutes = Math.abs(offset) % 60;
  const sign = offset <= 0 ? "+" : "-";
  return `UTC${sign}${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}
```

## Notes

- All functions must be pure (no side effects)
- No React imports
- No platform-specific code
- Unit tests required for each function
- Clipboard moved to L3 (platform-specific)
