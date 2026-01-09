# L4: Formatting Utils

## Overview

Pure formatting utilities for dates, text, numbers, URLs, and content processing.

## Status: COMPLETE

**Completed:** 2026-01-07
**Total Tests:** 748 (L4 only)
**All Tests Passing:** Yes

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

| Layer | Dependency                    | Status   |
| ----- | ----------------------------- | -------- |
| L0    | Types (IPost, IFileInfo, etc) | Complete |
| L2    | Pure Utils (string utils)     | Complete |
| L3    | Platform Utils                | Complete |

## Tasks

| ID    | Name              | Status   | Tests | Coverage |
| ----- | ----------------- | -------- | ----- | -------- |
| T4.01 | DateTime utils    | complete | 90    | 92%      |
| T4.02 | Text formatting   | complete | 75    | 100%     |
| T4.03 | Markdown utils    | complete | 96    | 96%      |
| T4.04 | Post formatting   | complete | 73    | 100%     |
| T4.05 | Timezone utils    | complete | 41    | 98%      |
| T4.06 | URL utils         | complete | 65    | 97%      |
| T4.07 | File size utils   | complete | 50    | 95%      |
| T4.08 | Number formatting | complete | 69    | 100%     |
| T4.09 | Username utils    | complete | 69    | 100%     |
| T4.10 | Password utils    | complete | 50    | 99%      |
| T4.11 | Emoji utils       | complete | 70    | 97%      |

## Progress

- Total: 11
- Done: 11
- In Progress: 0
- Pending: 0
- **Actual Hours: ~18h**

## File Structure (Flat)

Decision: Use flat file structure consistent with L2/L3 layers.

```
apps/v2/src/utils/
├── date.ts              # T4.01 - Extended with formatting
├── date.spec.ts
├── text-formatting.ts   # T4.02
├── text-formatting.spec.ts
├── markdown.ts          # T4.03
├── markdown.spec.ts
├── post-formatting.ts   # T4.04
├── post-formatting.spec.ts
├── timezone.ts          # T4.05 - Extended
├── timezone.spec.ts
├── url.ts               # T4.06
├── url.spec.ts
├── file.ts              # T4.07 - Extended with formatFileSize
├── file.spec.ts
├── number.ts            # T4.08
├── number.spec.ts
├── username.ts          # T4.09
├── username.spec.ts
├── password.ts          # T4.10
├── password.spec.ts
├── emoji.ts             # T4.11
├── emoji.spec.ts
└── index.ts             # Barrel exports
```

## Implementation Notes

### Date/Time Strategy

Uses native `Intl.DateTimeFormat` and `Intl.RelativeTimeFormat` for locale-aware formatting.
Uses `@date-fns/tz` for timezone offset calculations only.

**Rationale:** Native Intl API handles formatting well, but timezone offset calculation requires
date-fns/tz. Implementing this natively would add significant complexity without meaningful benefits.

### File Size Naming

- `fileSizeToString` renamed to `formatFileSize` for consistency with `format*` pattern
- `fileSizeToString` kept as `@deprecated` alias for backward compatibility

### Markdown

Uses `marked` library for accurate markdown parsing:

- `parseMarkdown()` - Convert to HTML
- `stripMarkdown()` - Uses marked lexer for accurate text extraction

### Emoji Detection

Uses Unicode property escapes (`\p{Emoji_Presentation}`) for reliable emoji detection.
Emoji map is injected to keep bundle size small.

## Key Functions by Module

### date.ts (Extended)

```typescript
// Comparison
(isSameDay,
  isSameMonth,
  isSameYear,
  isToday,
  isYesterday,
  isTomorrow,
  isWithinLastWeek);

// Difference
(getDiff(a, b, unit), isWithin(a, b, unit, threshold));

// Formatting (Intl.DateTimeFormat)
(formatDate, formatDateShort, formatTime, formatDateTime, formatDateTimeShort);

// Relative Time (Intl.RelativeTimeFormat)
(getRelativeTime, formatRelativeDate);

// Unix
(toUTCUnixSeconds, fromUnixSeconds);
```

### timezone.ts (Extended)

```typescript
(getBrowserTimezone, getUserTimezone, isValidTimezone);
(getUtcOffsetForTimezone, getTimezoneRegion);
(formatInTimezone, listTimezones);
(getCurrentDateForTimezone, getCurrentDateTimeForTimezone);
```

### file.ts (Extended)

```typescript
formatFileSize(bytes, options?)  // Renamed from fileSizeToString
parseFileSize(sizeString)        // New: "1.5 MB" -> 1572864
FILE_SIZE_UNITS, BYTES_PER_UNIT  // Constants
```

### text-formatting.ts

```typescript
(highlightSearchTerms, truncateText, wrapLongWords);
(escapeHtml, unescapeHtml, formatChannelName);
(normalizeWhitespace, countWords);
```

### markdown.ts

```typescript
(parseMarkdown, stripMarkdown);
(extractLinks, extractMentions, extractHashtags);
(isMarkdownLink, getMarkdownPreview, hasMarkdownSyntax);
escapeMarkdown;
```

### post-formatting.ts

```typescript
// Type checks
(isSystemPost, isEphemeralPost, isPostEdited, isPostDeleted);
(isPostPinned, isPostReply, isPostRoot, isPostFailed);

// Priority
(hasPostPriority, getPostPriority);

// Content
(getPostMessage, getPostPreview, getPostHashtags);
(formatPostTimestamp, getPostAttachmentCount, getPostFileInfos);
(hasPostReactions, getPostReactionCount, getCombinedPosts);
```

### url.ts

```typescript
(isValidUrl, isExternalUrl, isDataUrl, isImageUrl);
(extractDomain, getUrlExtension, normalizeUrl, joinPaths);
(buildQueryString, parseQueryString, setQueryParam, removeQueryParam);
```

### number.ts

```typescript
(formatNumber, formatCompactNumber, formatPercent, formatCurrency);
(ordinal, clamp, roundTo, isFiniteNumber);
```

### username.ts

```typescript
(getDisplayName, getFullName, getInitials);
(isValidUsername, getUsernameStatus, sanitizeUsername);
(formatMention, extractUsernameFromMention, isMention);
(isBotUser, isSystemAdmin, getUserPosition, getUserLocale);
```

### password.ts

```typescript
(validatePassword, getPasswordRequirements);
(getPasswordStrength, getPasswordStrengthLabel);
(hasSequentialChars, hasRepeatedChars, isCommonPassword);
DEFAULT_PASSWORD_CONFIG;
```

### emoji.ts

```typescript
(isEmoji, isOnlyEmoji, isLargeEmojiOnly, countEmoji);
(extractEmoji, extractEmojiWithPositions);
(replaceShortcodesWithUnicode, replaceUnicodeWithShortcodes);
(getShortcodeForEmoji, SHORTCODE_REGEX);
```

## Commands

```bash
# Run L4 tests
pnpm --filter @retrievly/app test:unit -- src/utils/

# Run specific module tests
pnpm --filter @retrievly/app test:unit -- date.spec
pnpm --filter @retrievly/app test:unit -- markdown.spec

# Type check
cd apps/v2 && npx tsc --noEmit
```
