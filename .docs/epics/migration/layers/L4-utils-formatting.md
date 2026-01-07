# L4: Formatting Utils

## Overview

Pure formatting utilities for dates, text, numbers, URLs, and content processing.

## Source Locations

- `vendor/desktop/webapp/channels/src/utils/datetime.ts`
- `vendor/desktop/webapp/channels/src/utils/timezone.tsx`
- `vendor/desktop/webapp/channels/src/utils/url.tsx`
- `vendor/desktop/webapp/channels/src/utils/text_formatting.tsx`
- `vendor/desktop/webapp/channels/src/utils/markdown.ts`
- `vendor/desktop/webapp/channels/src/utils/post_utils.ts`
- `vendor/desktop/webapp/channels/src/utils/emoticons.tsx`
- `vendor/desktop/webapp/channels/src/utils/file_utils.tsx`
- `vendor/desktop/webapp/channels/src/utils/utils.tsx`

## Target Location

`apps/v2/src/utils/`

## Dependencies

| Layer | Dependency                |
| ----- | ------------------------- |
| L0    | Types (IPost, IFileInfo)  |
| L2    | Pure Utils (string utils) |

## Tasks

| ID                                               | Name              | Status  | Parallel | Est. | Assignee |
| ------------------------------------------------ | ----------------- | ------- | -------- | ---- | -------- |
| [T4.01](../tasks/T4.01-utils-datetime.md)        | DateTime utils    | pending | ✓        | 3h   | -        |
| [T4.02](../tasks/T4.02-utils-text-formatting.md) | Text formatting   | pending | ✓        | 4h   | -        |
| [T4.03](../tasks/T4.03-utils-markdown.md)        | Markdown utils    | pending | ✓        | 6h   | -        |
| [T4.04](../tasks/T4.04-utils-post-formatting.md) | Post formatting   | pending | ✓        | 3h   | -        |
| [T4.05](../tasks/T4.05-utils-timezone.md)        | Timezone utils    | pending | ✓        | 2h   | -        |
| [T4.06](../tasks/T4.06-utils-url.md)             | URL utils         | pending | ✓        | 2h   | -        |
| [T4.07](../tasks/T4.07-utils-file-size.md)       | File size utils   | pending | ✓        | 1h   | -        |
| [T4.08](../tasks/T4.08-utils-number.md)          | Number formatting | pending | ✓        | 1h   | -        |
| [T4.09](../tasks/T4.09-utils-username.md)        | Username utils    | pending | ✓        | 1h   | -        |
| [T4.10](../tasks/T4.10-utils-password.md)        | Password utils    | pending | ✓        | 1h   | -        |
| [T4.11](../tasks/T4.11-utils-emoji.md)           | Emoji utils       | pending | ✓        | 2h   | -        |

## Progress

- Total: 11
- Done: 0
- In Progress: 0
- Pending: 11
- **Estimated Hours: 26h**

## File Structure

```
apps/v2/src/utils/
├── datetime/
│   ├── datetime.ts       # T4.01
│   └── index.ts
├── text-formatting/
│   ├── text-formatting.ts # T4.02
│   └── index.ts
├── markdown/
│   ├── markdown.ts       # T4.03
│   └── index.ts
├── post-formatting/
│   ├── post-formatting.ts # T4.04
│   └── index.ts
├── timezone/
│   ├── timezone.ts       # T4.05
│   └── index.ts
├── url/
│   ├── url.ts            # T4.06
│   └── index.ts
├── file-size/
│   ├── file-size.ts      # T4.07 (canonical formatFileSize)
│   └── index.ts
├── number/
│   ├── number.ts         # T4.08
│   └── index.ts
├── username/
│   ├── username.ts       # T4.09
│   └── index.ts
├── password/
│   ├── password.ts       # T4.10
│   └── index.ts
├── emoji/
│   ├── emoji.ts          # T4.11
│   └── index.ts
└── index.ts              # Barrel exports
```

## Dependency Graph

```
T4.01 (datetime)
    ↓
T4.05 (timezone)

T2.03 (utils-string)
    ↓
T4.02 (text-formatting)
    ↓
T4.03 (markdown) ← depends on `marked` library
    ↓
T4.04 (post-formatting) ← needs T0.03 (Post types), T0.05 (File types), T4.07

T2.03 (utils-string)
    ↓
T4.06 (url)

T4.07 (file-size) — no deps, canonical location for formatFileSize
T4.08 (number) — no deps
T4.09 (username) ← T0.02 (User types)
T4.10 (password) — no deps
T4.11 (emoji) — no deps (emoji data injected)
```

## Consolidation Notes

### formatFileSize Duplication

`formatFileSize()` appears in multiple task specs. The **canonical location is T4.07 (`file-size.ts`)**.

| Task  | Action                                                         |
| ----- | -------------------------------------------------------------- |
| T4.04 | Remove `formatAttachmentSize`, import from `@/utils/file-size` |
| T4.08 | Remove `formatFileSize`, import from `@/utils/file-size`       |

### stripMarkdown Duplication

The canonical location is **T4.03 (`markdown.ts`)** using the `marked` lexer for accuracy.

| Task  | Action                                                           |
| ----- | ---------------------------------------------------------------- |
| T4.04 | Remove `stripMarkdownForPreview`, import from `@/utils/markdown` |

## Key Implementations

### DateTime Utils (T4.01)

```typescript
import { formatDistanceToNow, isToday, isYesterday, format } from "date-fns";

export function relativeFormatDate(date: Date | number): string;
export function isSameDay(a: Date | number, b: Date | number): boolean;
export function formatTimestamp(timestamp: number, pattern?: string): string;
```

### File Size Utils (T4.07) — Canonical

```typescript
export function formatFileSize(bytes: number, decimals?: number): string;
export function parseFileSize(sizeStr: string): number;
```

### Username Utils (T4.09)

```typescript
export function getDisplayName(user: IUserProfile): string;
export function getFullName(user: IUserProfile): string;
export function isValidUsername(name: string): boolean;
export function getUsernameStatus(name: string): IUsernameStatus;
```

### Emoji Utils (T4.11)

```typescript
export function initializeEmojiContext(emojiMap: IEmojiMap): void;
export function replaceShortcodesWithUnicode(text: string): string;
export function isOnlyEmoji(text: string): boolean;
export function isLargeEmojiOnly(text: string): boolean;
```

## Notes

- Use `date-fns` for date formatting (tree-shakeable)
- Remove moment.js dependencies
- Emoji map is injected to keep bundle size small
- Markdown utils use `marked` library for accurate parsing
- All utils should be pure functions (no side effects)
