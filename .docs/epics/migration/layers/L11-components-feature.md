# L11: Feature Components

## Overview

Full-featured application components organized by domain. This is the largest layer with 63 tasks across 5 subgroups.

## Target Location

`apps/v2/src/components/`

## Dependencies

- L6: Base Components
- L9: State Hooks
- L10: Layout Components

## Subgroups

### L11a: Sidebar (15 tasks)

| ID                                                             | Name                | Status  | Parallel | Est. | Assignee |
| -------------------------------------------------------------- | ------------------- | ------- | -------- | ---- | -------- |
| [T11a.01](../tasks/T11a.01-component-sidebar.md)               | Sidebar             | pending | -        | 4h   | -        |
| [T11a.02](../tasks/T11a.02-component-sidebar-header.md)        | SidebarHeader       | pending | ✓        | 2h   | -        |
| [T11a.03](../tasks/T11a.03-component-sidebar-team-menu.md)     | SidebarTeamMenu     | pending | ✓        | 3h   | -        |
| [T11a.04](../tasks/T11a.04-component-sidebar-channel-list.md)  | SidebarChannelList  | pending | ✓        | 4h   | -        |
| [T11a.05](../tasks/T11a.05-component-sidebar-category.md)      | SidebarCategory     | pending | ✓        | 3h   | -        |
| [T11a.06](../tasks/T11a.06-component-sidebar-channel-link.md)  | SidebarChannelLink  | pending | ✓        | 3h   | -        |
| [T11a.07](../tasks/T11a.07-component-sidebar-channel-icon.md)  | SidebarChannelIcon  | pending | ✓        | 1h   | -        |
| [T11a.08](../tasks/T11a.08-component-sidebar-channel-menu.md)  | SidebarChannelMenu  | pending | ✓        | 2h   | -        |
| [T11a.09](../tasks/T11a.09-component-sidebar-drafts-link.md)   | SidebarDraftsLink   | pending | ✓        | 1h   | -        |
| [T11a.10](../tasks/T11a.10-component-sidebar-threads-link.md)  | SidebarThreadsLink  | pending | ✓        | 1h   | -        |
| [T11a.11](../tasks/T11a.11-component-unread-indicator.md)      | UnreadIndicator     | pending | ✓        | 1h   | -        |
| [T11a.12](../tasks/T11a.12-component-channel-navigator.md)     | ChannelNavigator    | pending | ✓        | 2h   | -        |
| [T11a.13](../tasks/T11a.13-component-add-channel-button.md)    | AddChannelButton    | pending | ✓        | 1h   | -        |
| [T11a.14](../tasks/T11a.14-component-edit-category-modal.md)   | EditCategoryModal   | pending | ✓        | 2h   | -        |
| [T11a.15](../tasks/T11a.15-component-browse-channels-modal.md) | BrowseChannelsModal | pending | ✓        | 3h   | -        |

### L11b: Messaging (20 tasks)

| ID                                                                   | Name                      | Status  | Parallel | Est. | Assignee |
| -------------------------------------------------------------------- | ------------------------- | ------- | -------- | ---- | -------- |
| [T11b.01](../tasks/T11b.01-component-post-view.md)                   | PostView                  | pending | -        | 4h   | -        |
| [T11b.02](../tasks/T11b.02-component-post-list.md)                   | PostList                  | pending | ✓        | 6h   | -        |
| [T11b.03](../tasks/T11b.03-component-post.md)                        | Post                      | pending | ✓        | 4h   | -        |
| [T11b.04](../tasks/T11b.04-component-post-header.md)                 | PostHeader                | pending | ✓        | 2h   | -        |
| [T11b.05](../tasks/T11b.05-component-post-body.md)                   | PostBody                  | pending | ✓        | 3h   | -        |
| [T11b.06](../tasks/T11b.06-component-post-footer.md)                 | PostFooter                | pending | ✓        | 2h   | -        |
| [T11b.07](../tasks/T11b.07-component-post-menu.md)                   | PostMenu                  | pending | ✓        | 2h   | -        |
| [T11b.08](../tasks/T11b.08-component-markdown.md)                    | Markdown                  | pending | ✓        | 6h   | -        |
| [T11b.09](../tasks/T11b.09-component-message-attachment.md)          | MessageAttachment         | pending | ✓        | 4h   | -        |
| [T11b.10](../tasks/T11b.10-component-file-attachment.md)             | FileAttachment            | pending | ✓        | 3h   | -        |
| [T11b.11](../tasks/T11b.11-component-image-preview.md)               | ImagePreview              | pending | ✓        | 3h   | -        |
| [T11b.12](../tasks/T11b.12-component-reactions.md)                   | Reactions                 | pending | ✓        | 3h   | -        |
| [T11b.13](../tasks/T11b.13-component-reaction-picker.md)             | ReactionPicker            | pending | ✓        | 2h   | -        |
| [T11b.14](../tasks/T11b.14-component-emoji-picker.md)                | EmojiPicker               | pending | ✓        | 4h   | -        |
| [T11b.15](../tasks/T11b.15-component-textbox.md)                     | TextBox                   | pending | ✓        | 6h   | -        |
| [T11b.16](../tasks/T11b.16-component-mention-suggestions.md)         | MentionSuggestions        | pending | ✓        | 3h   | -        |
| [T11b.17](../tasks/T11b.17-component-channel-mention-suggestions.md) | ChannelMentionSuggestions | pending | ✓        | 2h   | -        |
| [T11b.18](../tasks/T11b.18-component-slash-command-suggestions.md)   | SlashCommandSuggestions   | pending | ✓        | 2h   | -        |
| [T11b.19](../tasks/T11b.19-component-date-separator.md)              | DateSeparator             | pending | ✓        | 1h   | -        |
| [T11b.20](../tasks/T11b.20-component-new-message-indicator.md)       | NewMessageIndicator       | pending | ✓        | 1h   | -        |

### L11c: User & Profile (10 tasks)

| ID                                                             | Name                 | Status  | Parallel | Est. | Assignee |
| -------------------------------------------------------------- | -------------------- | ------- | -------- | ---- | -------- |
| [T11c.01](../tasks/T11c.01-component-profile-popover.md)       | ProfilePopover       | pending | ✓        | 3h   | -        |
| [T11c.02](../tasks/T11c.02-component-user-status.md)           | UserStatus           | pending | ✓        | 1h   | -        |
| [T11c.03](../tasks/T11c.03-component-custom-status.md)         | CustomStatus         | pending | ✓        | 2h   | -        |
| [T11c.04](../tasks/T11c.04-component-status-menu.md)           | StatusMenu           | pending | ✓        | 2h   | -        |
| [T11c.05](../tasks/T11c.05-component-user-menu.md)             | UserMenu             | pending | ✓        | 3h   | -        |
| [T11c.06](../tasks/T11c.06-component-user-settings.md)         | UserSettings         | pending | ✓        | 4h   | -        |
| [T11c.07](../tasks/T11c.07-component-notification-settings.md) | NotificationSettings | pending | ✓        | 3h   | -        |
| [T11c.08](../tasks/T11c.08-component-display-settings.md)      | DisplaySettings      | pending | ✓        | 2h   | -        |
| [T11c.09](../tasks/T11c.09-component-theme-settings.md)        | ThemeSettings        | pending | ✓        | 2h   | -        |
| [T11c.10](../tasks/T11c.10-component-language-settings.md)     | LanguageSettings     | pending | ✓        | 1h   | -        |

### L11d: Channel Management (10 tasks)

| ID                                                              | Name                 | Status  | Parallel | Est. | Assignee |
| --------------------------------------------------------------- | -------------------- | ------- | -------- | ---- | -------- |
| [T11d.01](../tasks/T11d.01-component-channel-header.md)         | ChannelHeader        | pending | ✓        | 3h   | -        |
| [T11d.02](../tasks/T11d.02-component-channel-info-modal.md)     | ChannelInfoModal     | pending | ✓        | 3h   | -        |
| [T11d.03](../tasks/T11d.03-component-channel-members-modal.md)  | ChannelMembersModal  | pending | ✓        | 3h   | -        |
| [T11d.04](../tasks/T11d.04-component-channel-settings-modal.md) | ChannelSettingsModal | pending | ✓        | 3h   | -        |
| [T11d.05](../tasks/T11d.05-component-create-channel-modal.md)   | CreateChannelModal   | pending | ✓        | 3h   | -        |
| [T11d.06](../tasks/T11d.06-component-invite-members-modal.md)   | InviteMembersModal   | pending | ✓        | 3h   | -        |
| [T11d.07](../tasks/T11d.07-component-channel-bookmarks.md)      | ChannelBookmarks     | pending | ✓        | 2h   | -        |
| [T11d.08](../tasks/T11d.08-component-channel-bookmark-item.md)  | ChannelBookmarkItem  | pending | ✓        | 1h   | -        |
| [T11d.09](../tasks/T11d.09-component-add-bookmark-modal.md)     | AddBookmarkModal     | pending | ✓        | 2h   | -        |
| [T11d.10](../tasks/T11d.10-component-pinned-messages.md)        | PinnedMessages       | pending | ✓        | 2h   | -        |

### L11e: Search & Navigation (8 tasks)

| ID                                                      | Name          | Status  | Parallel | Est. | Assignee |
| ------------------------------------------------------- | ------------- | ------- | -------- | ---- | -------- |
| [T11e.01](../tasks/T11e.01-component-global-header.md)  | GlobalHeader  | pending | ✓        | 3h   | -        |
| [T11e.02](../tasks/T11e.02-component-search-box.md)     | SearchBox     | pending | ✓        | 3h   | -        |
| [T11e.03](../tasks/T11e.03-component-search-results.md) | SearchResults | pending | ✓        | 3h   | -        |
| [T11e.04](../tasks/T11e.04-component-search-filters.md) | SearchFilters | pending | ✓        | 2h   | -        |
| [T11e.05](../tasks/T11e.05-component-quick-switcher.md) | QuickSwitcher | pending | ✓        | 3h   | -        |
| [T11e.06](../tasks/T11e.06-component-threads-view.md)   | ThreadsView   | pending | ✓        | 4h   | -        |
| [T11e.07](../tasks/T11e.07-component-thread-item.md)    | ThreadItem    | pending | ✓        | 2h   | -        |
| [T11e.08](../tasks/T11e.08-component-drafts-view.md)    | DraftsView    | pending | ✓        | 2h   | -        |

## Progress Summary

| Subgroup                  | Total  | Done  | In Progress | Pending |
| ------------------------- | ------ | ----- | ----------- | ------- |
| L11a: Sidebar             | 15     | 0     | 0           | 15      |
| L11b: Messaging           | 20     | 0     | 0           | 20      |
| L11c: User & Profile      | 10     | 0     | 0           | 10      |
| L11d: Channel Management  | 10     | 0     | 0           | 10      |
| L11e: Search & Navigation | 8      | 0     | 0           | 8       |
| **Total**                 | **63** | **0** | **0**       | **63**  |

## File Structure

```
apps/v2/src/components/
├── Sidebar/
│   ├── Sidebar.tsx
│   ├── SidebarHeader/
│   ├── SidebarChannelList/
│   ├── SidebarCategory/
│   ├── SidebarChannelLink/
│   └── ...
├── Post/
│   ├── Post.tsx
│   ├── PostHeader/
│   ├── PostBody/
│   ├── PostFooter/
│   └── ...
├── TextBox/
│   ├── TextBox.tsx
│   ├── MentionSuggestions/
│   └── ...
├── Profile/
│   ├── ProfilePopover/
│   ├── UserStatus/
│   ├── UserMenu/
│   └── ...
├── Channel/
│   ├── ChannelHeader/
│   ├── ChannelInfoModal/
│   └── ...
├── Search/
│   ├── SearchBox/
│   ├── SearchResults/
│   └── ...
└── Navigation/
    ├── GlobalHeader/
    ├── QuickSwitcher/
    └── ...
```

## Critical Components (Build First)

1. **PostList** - Core messaging display
2. **Post** - Individual message
3. **TextBox** - Message composer
4. **Sidebar** - Navigation
5. **ChannelHeader** - Channel context

## Notes

- Many components depend on base and layout components
- Messaging components (L10b) are the most complex
- Consider building a minimal version first, then enhancing
- Test components in Storybook before integration
- Mobile-specific patterns may differ from web (e.g., bottom sheets vs dropdowns)
