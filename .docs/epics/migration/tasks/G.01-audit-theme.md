# G.01: Audit Current Theme

## Metadata

| Field        | Value         |
| ------------ | ------------- |
| **ID**       | G.01          |
| **Layer**    | Global Styles |
| **Status**   | pending       |
| **Priority** | high          |
| **Estimate** | 1h            |
| **Parallel** | true          |
| **Assignee** | -             |
| **Created**  | 2026-01-04    |
| **Updated**  | 2026-01-04    |

## Dependencies

None

## Blocks

| Task ID | Name                |
| ------- | ------------------- |
| G.02    | Add missing colors  |
| All L6+ | All component tasks |

## Description

Audit the current `apps/v2/src/theme.ts` file to verify all Mattermost CSS variables are properly mapped.

## Source Files

- `vendor/desktop/webapp/channels/src/sass/base/_css_variables.scss`
- `vendor/desktop/webapp/channels/src/sass/base/_variables.scss`

## Target File

`apps/v2/src/theme.ts`

## Audit Checklist

### Colors to Verify

```typescript
// Primary
primary: string;
primaryHover: string;

// Button
buttonBg: string;
buttonColor: string;

// Center channel
centerChannelBg: string;
centerChannelColor: string;

// Sidebar (9 colors)
sidebarBg: string;
sidebarText: string;
sidebarUnreadText: string;
sidebarTextHoverBg: string;
sidebarTextActiveBorder: string;
sidebarTextActiveColor: string;
sidebarHeaderBg: string;
sidebarTeambarBg: string;
sidebarHeaderTextColor: string;

// Status
onlineIndicator: string;
awayIndicator: string;
dndIndicator: string;

// Mentions
mentionBg: string;
mentionColor: string;
mentionHighlightBg: string;
mentionHighlightLink: string;
mentionHighlightBgMixed: string;
pinnedHighlightBgMixed: string;
ownHighlightBg: string;

// Messages
newMessageSeparator: string;
linkColor: string;
errorText: string;

// Borders
borderDefault: string;
borderLight: string;
borderDark: string;
```

### Tokens to Verify

```typescript
// Radius
radius: {
  xs: 2,
  s: 4,
  m: 8,
  l: 12,
  xl: 16,
  full: '50%',
}

// Elevation (6 levels)
elevation: {
  1: string;
  2: string;
  3: string;
  4: string;
  5: string;
  6: string;
}

// Fonts
fonts: {
  primary: string;
  heading: string;
  fontAwesome: string;
}

// Font weights
fontWeights: {
  light: 300;
  normal: 400;
  semiBold: 600;
}

// Gap function
gap: (v: number) => number;
```

## Tasks

1. [ ] Open `apps/v2/src/theme.ts` and compare with source SCSS files
2. [ ] Create list of missing colors
3. [ ] Create list of missing tokens
4. [ ] Verify dark theme has same keys as light theme
5. [ ] Document any CSS variables that don't translate to RN

## Acceptance Criteria

- [ ] Complete mapping document created
- [ ] Missing colors identified
- [ ] Missing tokens identified
- [ ] Dark theme verified to have parity with light theme

## Notes

- Current theme.ts was created earlier in migration - may already have most colors
- Focus on colors used in components we'll be building
- CSS box-shadow values need conversion to RN shadow format
