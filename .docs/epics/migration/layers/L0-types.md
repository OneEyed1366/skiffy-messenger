# L0: Types

## Overview

TypeScript type definitions migrated from Mattermost. Foundation layer with no dependencies.

## Source Location

`vendor/desktop/webapp/platform/types/src/`

## Target Location

`apps/v2/src/types/`

## Dependencies

None (foundation layer)

## Tasks

| ID                                          | Name             | Status  | Parallel | Est. | Assignee |
| ------------------------------------------- | ---------------- | ------- | -------- | ---- | -------- |
| [T0.01](../tasks/T0.01-types-user.md)       | User types       | pending | ✓        | 2h   | -        |
| [T0.02](../tasks/T0.02-types-channel.md)    | Channel types    | pending | ✓        | 2h   | -        |
| [T0.03](../tasks/T0.03-types-post.md)       | Post types       | pending | ✓        | 2h   | -        |
| [T0.04](../tasks/T0.04-types-team.md)       | Team types       | pending | ✓        | 1h   | -        |
| [T0.05](../tasks/T0.05-types-file.md)       | File types       | pending | ✓        | 1h   | -        |
| [T0.06](../tasks/T0.06-types-emoji.md)      | Emoji types      | pending | ✓        | 1h   | -        |
| [T0.07](../tasks/T0.07-types-draft.md)      | Draft types      | pending | ✓        | 1h   | -        |
| [T0.08](../tasks/T0.08-types-thread.md)     | Thread types     | pending | ✓        | 1h   | -        |
| [T0.09](../tasks/T0.09-types-category.md)   | Category types   | pending | ✓        | 1h   | -        |
| [T0.10](../tasks/T0.10-types-bookmark.md)   | Bookmark types   | pending | ✓        | 0.5h | -        |
| [T0.11](../tasks/T0.11-types-group.md)      | Group types      | pending | ✓        | 1h   | -        |
| [T0.12](../tasks/T0.12-types-preference.md) | Preference types | pending | ✓        | 0.5h | -        |
| [T0.13](../tasks/T0.13-types-session.md)    | Session types    | pending | ✓        | 1h   | -        |
| [T0.14](../tasks/T0.14-types-search.md)     | Search types     | pending | ✓        | 1h   | -        |
| [T0.15](../tasks/T0.15-types-utility.md)    | Utility types    | pending | ✓        | 1h   | -        |

## Progress

- Total: 15
- Done: 0
- In Progress: 0
- Pending: 15

## Conventions

- Use `type` keyword, not `interface`
- Prefix all types with `I` (e.g., `IUser`, `IChannel`)
- Export all types from `src/types/index.ts`
- Use `#region` comments for organization
- No `any` types allowed

## File Structure

```
apps/v2/src/types/
├── user.ts       # T0.01
├── channel.ts    # T0.02
├── post.ts       # T0.03
├── team.ts       # T0.04
├── file.ts       # T0.05
├── emoji.ts      # T0.06
├── draft.ts      # T0.07
├── thread.ts     # T0.08
├── category.ts   # T0.09
├── bookmark.ts   # T0.10
├── group.ts      # T0.11
├── preference.ts # T0.12
├── session.ts    # T0.13
├── search.ts     # T0.14
├── utility.ts    # T0.15
└── index.ts      # Re-exports all
```

## Notes

- All tasks can be parallelized
- Security: Remove sensitive fields (password, tokens) from client types
- Some types may need adaptation for React Native (e.g., no DOM types)
