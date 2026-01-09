/**
 * Tests for post-formatting utilities
 */

import type { IPost, IFileInfo, IReaction } from "@/types";

import {
  isSystemPost,
  isEphemeralPost,
  isPostEdited,
  isPostDeleted,
  isPostPinned,
  isPostReply,
  isPostRoot,
  isPostFailed,
  hasPostPriority,
  getPostPriority,
  hasPostReactions,
  getPostReactionCount,
  getPostMessage,
  getPostPreview,
  getPostHashtags,
  formatPostTimestamp,
  getPostAttachmentCount,
  getPostFileInfos,
  getCombinedPosts,
} from "./post-formatting";

//#region Test Helpers

/**
 * Creates a mock post with optional overrides.
 */
function createMockPost(overrides: Partial<IPost> = {}): IPost {
  return {
    id: "post1",
    create_at: Date.now(),
    update_at: Date.now(),
    edit_at: 0,
    delete_at: 0,
    is_pinned: false,
    user_id: "user1",
    channel_id: "channel1",
    root_id: "",
    original_id: "",
    message: "Hello world",
    type: "",
    props: {},
    hashtags: "",
    pending_post_id: "",
    reply_count: 0,
    metadata: { embeds: [], emojis: [], files: [], images: {} },
    ...overrides,
  };
}

/**
 * Creates a mock file info.
 */
function createMockFileInfo(overrides: Partial<IFileInfo> = {}): IFileInfo {
  return {
    id: "file1",
    user_id: "user1",
    channel_id: "channel1",
    create_at: Date.now(),
    update_at: Date.now(),
    delete_at: 0,
    name: "test.txt",
    extension: "txt",
    size: 1024,
    mime_type: "text/plain",
    width: 0,
    height: 0,
    has_preview_image: false,
    archived: false,
    ...overrides,
  };
}

/**
 * Creates a mock reaction.
 */
function createMockReaction(overrides: Partial<IReaction> = {}): IReaction {
  return {
    user_id: "user1",
    post_id: "post1",
    emoji_name: "+1",
    create_at: Date.now(),
    ...overrides,
  };
}

//#endregion

//#region isSystemPost Tests

describe("isSystemPost", () => {
  it("returns true for system_join_channel", () => {
    const post = createMockPost({ type: "system_join_channel" });
    expect(isSystemPost(post)).toBe(true);
  });

  it("returns true for system_leave_channel", () => {
    const post = createMockPost({ type: "system_leave_channel" });
    expect(isSystemPost(post)).toBe(true);
  });

  it("returns true for system_ephemeral", () => {
    const post = createMockPost({ type: "system_ephemeral" });
    expect(isSystemPost(post)).toBe(true);
  });

  it("returns true for system_header_change", () => {
    const post = createMockPost({ type: "system_header_change" });
    expect(isSystemPost(post)).toBe(true);
  });

  it("returns true for system_combined_user_activity", () => {
    const post = createMockPost({ type: "system_combined_user_activity" });
    expect(isSystemPost(post)).toBe(true);
  });

  it("returns false for empty type (regular user post)", () => {
    const post = createMockPost({ type: "" });
    expect(isSystemPost(post)).toBe(false);
  });

  it("returns false for custom_calls type", () => {
    const post = createMockPost({ type: "custom_calls" });
    expect(isSystemPost(post)).toBe(false);
  });

  it("returns false for me type", () => {
    const post = createMockPost({ type: "me" });
    expect(isSystemPost(post)).toBe(false);
  });
});

//#endregion

//#region isEphemeralPost Tests

describe("isEphemeralPost", () => {
  it("returns true for system_ephemeral", () => {
    const post = createMockPost({ type: "system_ephemeral" });
    expect(isEphemeralPost(post)).toBe(true);
  });

  it("returns false for other system posts", () => {
    const post = createMockPost({ type: "system_join_channel" });
    expect(isEphemeralPost(post)).toBe(false);
  });

  it("returns false for regular posts", () => {
    const post = createMockPost({ type: "" });
    expect(isEphemeralPost(post)).toBe(false);
  });
});

//#endregion

//#region isPostEdited Tests

describe("isPostEdited", () => {
  it("returns true when edit_at > 0 and differs from create_at", () => {
    const post = createMockPost({
      create_at: 1704067200000,
      edit_at: 1704067300000,
    });
    expect(isPostEdited(post)).toBe(true);
  });

  it("returns false when edit_at is 0", () => {
    const post = createMockPost({ edit_at: 0 });
    expect(isPostEdited(post)).toBe(false);
  });

  it("returns false when edit_at equals create_at", () => {
    const timestamp = Date.now();
    const post = createMockPost({
      create_at: timestamp,
      edit_at: timestamp,
    });
    expect(isPostEdited(post)).toBe(false);
  });
});

//#endregion

//#region isPostDeleted Tests

describe("isPostDeleted", () => {
  it("returns true when delete_at > 0", () => {
    const post = createMockPost({ delete_at: 1704067200000 });
    expect(isPostDeleted(post)).toBe(true);
  });

  it("returns true when state is DELETED", () => {
    const post = createMockPost({ state: "DELETED" });
    expect(isPostDeleted(post)).toBe(true);
  });

  it("returns false when delete_at is 0 and state is empty", () => {
    const post = createMockPost({ delete_at: 0, state: "" });
    expect(isPostDeleted(post)).toBe(false);
  });

  it("returns false when state is undefined", () => {
    const post = createMockPost({ delete_at: 0 });
    expect(isPostDeleted(post)).toBe(false);
  });
});

//#endregion

//#region isPostPinned Tests

describe("isPostPinned", () => {
  it("returns true when is_pinned is true", () => {
    const post = createMockPost({ is_pinned: true });
    expect(isPostPinned(post)).toBe(true);
  });

  it("returns false when is_pinned is false", () => {
    const post = createMockPost({ is_pinned: false });
    expect(isPostPinned(post)).toBe(false);
  });
});

//#endregion

//#region isPostReply Tests

describe("isPostReply", () => {
  it("returns true when root_id is set", () => {
    const post = createMockPost({ root_id: "abc123" });
    expect(isPostReply(post)).toBe(true);
  });

  it("returns false when root_id is empty", () => {
    const post = createMockPost({ root_id: "" });
    expect(isPostReply(post)).toBe(false);
  });
});

//#endregion

//#region isPostRoot Tests

describe("isPostRoot", () => {
  it("returns true when root_id is empty", () => {
    const post = createMockPost({ root_id: "" });
    expect(isPostRoot(post)).toBe(true);
  });

  it("returns false when root_id is set", () => {
    const post = createMockPost({ root_id: "abc123" });
    expect(isPostRoot(post)).toBe(false);
  });
});

//#endregion

//#region isPostFailed Tests

describe("isPostFailed", () => {
  it("returns true when failed is true", () => {
    const post = createMockPost({ failed: true });
    expect(isPostFailed(post)).toBe(true);
  });

  it("returns false when failed is false", () => {
    const post = createMockPost({ failed: false });
    expect(isPostFailed(post)).toBe(false);
  });

  it("returns false when failed is undefined", () => {
    const post = createMockPost({});
    expect(isPostFailed(post)).toBe(false);
  });
});

//#endregion

//#region hasPostPriority Tests

describe("hasPostPriority", () => {
  it("returns true for urgent priority", () => {
    const post = createMockPost({
      metadata: { priority: { priority: "urgent" } },
    });
    expect(hasPostPriority(post)).toBe(true);
  });

  it("returns true for important priority", () => {
    const post = createMockPost({
      metadata: { priority: { priority: "important" } },
    });
    expect(hasPostPriority(post)).toBe(true);
  });

  it("returns false for empty priority", () => {
    const post = createMockPost({
      metadata: { priority: { priority: "" } },
    });
    expect(hasPostPriority(post)).toBe(false);
  });

  it("returns false when no priority metadata", () => {
    const post = createMockPost({ metadata: {} });
    expect(hasPostPriority(post)).toBe(false);
  });
});

//#endregion

//#region getPostPriority Tests

describe("getPostPriority", () => {
  it("returns 'urgent' for urgent priority", () => {
    const post = createMockPost({
      metadata: { priority: { priority: "urgent" } },
    });
    expect(getPostPriority(post)).toBe("urgent");
  });

  it("returns 'important' for important priority", () => {
    const post = createMockPost({
      metadata: { priority: { priority: "important" } },
    });
    expect(getPostPriority(post)).toBe("important");
  });

  it("returns null for empty priority", () => {
    const post = createMockPost({
      metadata: { priority: { priority: "" } },
    });
    expect(getPostPriority(post)).toBeNull();
  });

  it("returns null when no priority metadata", () => {
    const post = createMockPost({ metadata: {} });
    expect(getPostPriority(post)).toBeNull();
  });
});

//#endregion

//#region hasPostReactions Tests

describe("hasPostReactions", () => {
  it("returns true when reactions exist", () => {
    const post = createMockPost({
      metadata: { reactions: [createMockReaction()] },
    });
    expect(hasPostReactions(post)).toBe(true);
  });

  it("returns false for empty reactions array", () => {
    const post = createMockPost({
      metadata: { reactions: [] },
    });
    expect(hasPostReactions(post)).toBe(false);
  });

  it("returns false when no reactions metadata", () => {
    const post = createMockPost({ metadata: {} });
    expect(hasPostReactions(post)).toBe(false);
  });
});

//#endregion

//#region getPostReactionCount Tests

describe("getPostReactionCount", () => {
  it("returns correct count for multiple reactions", () => {
    const post = createMockPost({
      metadata: {
        reactions: [
          createMockReaction({ emoji_name: "+1" }),
          createMockReaction({ emoji_name: "heart" }),
          createMockReaction({ emoji_name: "smile" }),
        ],
      },
    });
    expect(getPostReactionCount(post)).toBe(3);
  });

  it("returns 0 for empty reactions array", () => {
    const post = createMockPost({
      metadata: { reactions: [] },
    });
    expect(getPostReactionCount(post)).toBe(0);
  });

  it("returns 0 when no reactions metadata", () => {
    const post = createMockPost({ metadata: {} });
    expect(getPostReactionCount(post)).toBe(0);
  });
});

//#endregion

//#region getPostMessage Tests

describe("getPostMessage", () => {
  it("returns the message for regular posts", () => {
    const post = createMockPost({ message: "Hello world" });
    expect(getPostMessage(post)).toBe("Hello world");
  });

  it("returns empty string for deleted posts", () => {
    const post = createMockPost({
      message: "Hello world",
      state: "DELETED",
    });
    expect(getPostMessage(post)).toBe("");
  });

  it("returns empty string for posts with delete_at set", () => {
    const post = createMockPost({
      message: "Hello world",
      delete_at: Date.now(),
    });
    expect(getPostMessage(post)).toBe("");
  });
});

//#endregion

//#region getPostPreview Tests

describe("getPostPreview", () => {
  it("returns plain text without markdown", () => {
    const post = createMockPost({ message: "**Hello** world" });
    expect(getPostPreview(post)).toBe("Hello world");
  });

  it("truncates long messages", () => {
    const post = createMockPost({
      message: "This is a very long message that should be truncated",
    });
    const preview = getPostPreview(post, 20);
    // truncateText breaks at word boundaries, so length may be less than maxLength
    expect(preview.length).toBeLessThanOrEqual(20);
    expect(preview).toMatch(/\.\.\.$/);
  });

  it("removes link syntax", () => {
    const post = createMockPost({
      message: "Check [this link](https://example.com) out",
    });
    expect(getPostPreview(post)).toBe("Check this link out");
  });

  it("removes image syntax", () => {
    const post = createMockPost({
      message: "Image: ![alt text](https://example.com/image.png) here",
    });
    // The regex removes the image syntax, leaving surrounding text
    expect(getPostPreview(post)).toBe("Image: here");
  });

  it("removes header markers", () => {
    const post = createMockPost({ message: "# Header text" });
    expect(getPostPreview(post)).toBe("Header text");
  });

  it("removes blockquote markers", () => {
    const post = createMockPost({ message: "> Quoted text" });
    expect(getPostPreview(post)).toBe("Quoted text");
  });

  it("returns empty string for deleted posts", () => {
    const post = createMockPost({
      message: "Hello",
      state: "DELETED",
    });
    expect(getPostPreview(post)).toBe("");
  });

  it("handles default maxLength of 100", () => {
    const longMessage = "a".repeat(150);
    const post = createMockPost({ message: longMessage });
    expect(getPostPreview(post).length).toBeLessThanOrEqual(100);
  });
});

//#endregion

//#region getPostHashtags Tests

describe("getPostHashtags", () => {
  it("parses space-separated hashtags", () => {
    const post = createMockPost({ hashtags: "#react #typescript #testing" });
    expect(getPostHashtags(post)).toEqual(["react", "typescript", "testing"]);
  });

  it("handles hashtags without # prefix", () => {
    const post = createMockPost({ hashtags: "react typescript" });
    expect(getPostHashtags(post)).toEqual(["react", "typescript"]);
  });

  it("handles mixed format", () => {
    const post = createMockPost({ hashtags: "#react typescript #jest" });
    expect(getPostHashtags(post)).toEqual(["react", "typescript", "jest"]);
  });

  it("returns empty array for empty hashtags", () => {
    const post = createMockPost({ hashtags: "" });
    expect(getPostHashtags(post)).toEqual([]);
  });

  it("returns empty array for whitespace-only hashtags", () => {
    const post = createMockPost({ hashtags: "   " });
    expect(getPostHashtags(post)).toEqual([]);
  });

  it("handles multiple spaces between hashtags", () => {
    const post = createMockPost({ hashtags: "#react    #typescript" });
    expect(getPostHashtags(post)).toEqual(["react", "typescript"]);
  });
});

//#endregion

//#region formatPostTimestamp Tests

describe("formatPostTimestamp", () => {
  // Mock Date.now for consistent testing
  const NOW = new Date("2024-01-15T12:00:00Z").getTime();
  const ONE_HOUR_AGO = NOW - 3600000;
  const YESTERDAY = NOW - 86400000;
  const LAST_WEEK = NOW - 7 * 86400000;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(NOW);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("returns relative time for posts from today", () => {
    const post = createMockPost({ create_at: ONE_HOUR_AGO });
    const result = formatPostTimestamp(post);
    expect(result).toMatch(/hour|minute/i);
  });

  it("returns 'Yesterday at' for posts from yesterday", () => {
    const post = createMockPost({ create_at: YESTERDAY });
    const result = formatPostTimestamp(post);
    expect(result).toContain("Yesterday");
  });

  it("returns full date for older posts", () => {
    const post = createMockPost({ create_at: LAST_WEEK });
    const result = formatPostTimestamp(post);
    // Should contain the month name
    expect(result).toMatch(/January|Jan/i);
  });

  it("respects locale option", () => {
    const post = createMockPost({ create_at: LAST_WEEK });
    const result = formatPostTimestamp(post, { locale: "de-DE" });
    // German locale should format differently
    expect(result).toBeTruthy();
  });
});

//#endregion

//#region getPostAttachmentCount Tests

describe("getPostAttachmentCount", () => {
  it("returns count from metadata.files", () => {
    const post = createMockPost({
      metadata: {
        files: [createMockFileInfo(), createMockFileInfo()],
      },
    });
    expect(getPostAttachmentCount(post)).toBe(2);
  });

  it("returns count from file_ids when metadata.files is empty", () => {
    const post = createMockPost({
      file_ids: ["file1", "file2", "file3"],
      metadata: { files: [] },
    });
    expect(getPostAttachmentCount(post)).toBe(3);
  });

  it("prefers metadata.files over file_ids", () => {
    const post = createMockPost({
      file_ids: ["file1", "file2", "file3", "file4"],
      metadata: { files: [createMockFileInfo()] },
    });
    expect(getPostAttachmentCount(post)).toBe(1);
  });

  it("returns 0 when no files", () => {
    const post = createMockPost({ metadata: {} });
    expect(getPostAttachmentCount(post)).toBe(0);
  });
});

//#endregion

//#region getPostFileInfos Tests

describe("getPostFileInfos", () => {
  it("returns files from metadata", () => {
    const files = [
      createMockFileInfo({ id: "file1" }),
      createMockFileInfo({ id: "file2" }),
    ];
    const post = createMockPost({ metadata: { files } });
    expect(getPostFileInfos(post)).toEqual(files);
  });

  it("returns empty array when no files", () => {
    const post = createMockPost({ metadata: {} });
    expect(getPostFileInfos(post)).toEqual([]);
  });

  it("returns empty array when files is undefined", () => {
    const post = createMockPost({ metadata: { files: undefined } });
    expect(getPostFileInfos(post)).toEqual([]);
  });
});

//#endregion

//#region getCombinedPosts Tests

describe("getCombinedPosts", () => {
  it("returns combined posts for system_combined_user_activity", () => {
    const combinedPosts = [
      createMockPost({ id: "post1" }),
      createMockPost({ id: "post2" }),
    ];
    const post = createMockPost({
      type: "system_combined_user_activity",
      props: { user_activity_posts: combinedPosts },
    });
    expect(getCombinedPosts(post)).toEqual(combinedPosts);
  });

  it("returns empty array for non-combined posts", () => {
    const post = createMockPost({ type: "system_join_channel" });
    expect(getCombinedPosts(post)).toEqual([]);
  });

  it("returns empty array for regular posts", () => {
    const post = createMockPost({ type: "" });
    expect(getCombinedPosts(post)).toEqual([]);
  });

  it("returns empty array when props.user_activity_posts is missing", () => {
    const post = createMockPost({
      type: "system_combined_user_activity",
      props: {},
    });
    expect(getCombinedPosts(post)).toEqual([]);
  });
});

//#endregion
