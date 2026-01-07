# L1: Constants

## Overview

Application constants, enums, and configuration values.

## Source Location

`vendor/desktop/webapp/channels/src/utils/constants.tsx`

## Target Location

`apps/v2/src/constants/`

## Dependencies

- L0: Types (for type annotations)

## Tasks

| ID                                                  | Name                       | Status | Parallel | Est. | Assignee |
| --------------------------------------------------- | -------------------------- | ------ | -------- | ---- | -------- |
| [T1.01](../tasks/T1.01-constants-general.md)        | General constants          | done   | ✓        | 1h   | -        |
| [T1.02](../tasks/T1.02-constants-channel.md)        | Channel constants          | done   | ✓        | 0.5h | -        |
| [T1.03](../tasks/T1.03-constants-post.md)           | Post constants             | done   | ✓        | 0.5h | -        |
| [T1.04](../tasks/T1.04-constants-file.md)           | File constants             | done   | ✓        | 0.5h | -        |
| [T1.05](../tasks/T1.05-constants-permissions.md)    | Permission constants       | done   | ✓        | 0.5h | -        |
| [T1.06](../tasks/T1.06-constants-websocket-team.md) | WebSocket & Team constants | done   | ✓        | 1h   | -        |

## Progress

- Total: 6
- Done: 6
- In Progress: 0
- Pending: 0

## File Structure

```
apps/v2/src/constants/
├── general.ts     # T1.01
├── channel.ts     # T1.02
├── post.ts        # T1.03
├── file.ts        # T1.04
├── permissions.ts # T1.05
├── websocket.ts   # T1.06
├── team.ts        # T1.06
└── index.ts       # Re-exports
```

## Key Constants to Migrate

### General (T1.01)

```typescript
export const Preferences = {
  CATEGORY_CHANNEL_OPEN_TIME: "channel_open_time",
  CATEGORY_DIRECT_CHANNEL_SHOW: "direct_channel_show",
  CATEGORY_DISPLAY_SETTINGS: "display_settings",
  CATEGORY_SIDEBAR_SETTINGS: "sidebar_settings",
  CATEGORY_ADVANCED_SETTINGS: "advanced_settings",
  // ... etc
} as const;

export const KeyCodes = {
  BACKSPACE: 8,
  TAB: 9,
  ENTER: 13,
  ESCAPE: 27,
  SPACE: 32,
  // ... etc
} as const;

export const ItemStatus = {
  NONE: "",
  SUCCESS: "success",
  WARNING: "warning",
  ERROR: "error",
  INFO: "info",
} as const;
```

### Channel (T1.02)

```typescript
export const ChannelTypes = {
  OPEN: "O",
  PRIVATE: "P",
  DIRECT: "D",
  GROUP: "G",
} as const;

export const NotifyLevels = {
  DEFAULT: "default",
  ALL: "all",
  MENTION: "mention",
  NONE: "none",
} as const;
```

### Post (T1.03)

```typescript
export const PostTypes = {
  DEFAULT: "",
  SYSTEM_GENERIC: "system_generic",
  SYSTEM_JOIN_CHANNEL: "system_join_channel",
  SYSTEM_LEAVE_CHANNEL: "system_leave_channel",
  // ... etc
} as const;
```

### File (T1.04)

```typescript
export const FileTypes = {
  TEXT: "text",
  IMAGE: "image",
  AUDIO: "audio",
  VIDEO: "video",
  SPREADSHEET: "spreadsheet",
  CODE: "code",
  WORD: "word",
  PRESENTATION: "presentation",
  PDF: "pdf",
  PATCH: "patch",
  SVG: "svg",
  OTHER: "other",
} as const;

export const FileSizes = {
  Bit: 1,
  Byte: 8,
  Kilobyte: 1024,
  Megabyte: 1024 * 1024,
  Gigabyte: 1024 * 1024 * 1024,
} as const;
```

### WebSocket & Team (T1.06)

```typescript
export const WebSocketEvents = {
  POSTED: "posted",
  POST_EDITED: "post_edited",
  POST_DELETED: "post_deleted",
  CHANNEL_CREATED: "channel_created",
  CHANNEL_UPDATED: "channel_updated",
  USER_ADDED: "user_added",
  USER_REMOVED: "user_removed",
  // ... etc
} as const;

export const TeamTypes = {
  OPEN: "O",
  INVITE: "I",
} as const;
```

## Notes

- Use `as const` for all constant objects
- Export type helpers: `type ChannelType = typeof ChannelTypes[keyof typeof ChannelTypes]`
- Remove web-specific constants (DOM, CSS selectors)
- KeyCodes may not be needed for mobile (evaluate usage)
