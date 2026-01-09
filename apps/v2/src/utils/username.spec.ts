/**
 * Tests for username utilities
 */

import type { IUserProfile } from "@/types";

import {
  getDisplayName,
  getFullName,
  getInitials,
  isValidUsername,
  getUsernameStatus,
  formatMention,
  isBotUser,
  isSystemAdmin,
  getUserPosition,
  getUserLocale,
  extractUsernameFromMention,
  isMention,
  sanitizeUsername,
} from "./username";

//#region Mock Data

const mockUser: IUserProfile = {
  id: "user1",
  username: "john.doe",
  email: "john@example.com",
  first_name: "John",
  last_name: "Doe",
  nickname: "",
  position: "Developer",
  roles: "system_user",
  is_bot: false,
  locale: "en",
  create_at: 1609459200000,
  update_at: 1609459200000,
  delete_at: 0,
  auth_service: "",
  props: {},
  notify_props: {
    desktop: "default",
    desktop_sound: "default",
    email: "true",
    mark_unread: "all",
    push: "default",
    push_status: "offline",
    comments: "never",
    first_name: "false",
    channel: "true",
    mention_keys: "",
    highlight_keys: "",
  },
  last_password_update: 0,
  last_picture_update: 0,
  mfa_active: false,
  last_activity_at: 0,
  bot_description: "",
  terms_of_service_id: "",
  terms_of_service_create_at: 0,
};

const mockBotUser: IUserProfile = {
  ...mockUser,
  id: "bot1",
  username: "bot",
  is_bot: true,
  bot_description: "Test bot",
};

const mockAdminUser: IUserProfile = {
  ...mockUser,
  id: "admin1",
  username: "admin",
  roles: "system_admin system_user",
};

const mockUserWithNickname: IUserProfile = {
  ...mockUser,
  id: "user2",
  username: "jane.doe",
  first_name: "Jane",
  last_name: "Doe",
  nickname: "JD",
};

const mockUserOnlyFirstName: IUserProfile = {
  ...mockUser,
  id: "user3",
  username: "alice",
  first_name: "Alice",
  last_name: "",
};

const mockUserOnlyLastName: IUserProfile = {
  ...mockUser,
  id: "user4",
  username: "smith",
  first_name: "",
  last_name: "Smith",
};

const mockUserOnlyUsername: IUserProfile = {
  ...mockUser,
  id: "user5",
  username: "noname",
  first_name: "",
  last_name: "",
  nickname: "",
};

//#endregion

//#region getFullName Tests

describe("getFullName", () => {
  it("returns full name when both first and last name exist", () => {
    expect(getFullName(mockUser)).toBe("John Doe");
  });

  it("returns first name only when last name is missing", () => {
    expect(getFullName(mockUserOnlyFirstName)).toBe("Alice");
  });

  it("returns last name only when first name is missing", () => {
    expect(getFullName(mockUserOnlyLastName)).toBe("Smith");
  });

  it("returns empty string when both names are missing", () => {
    expect(getFullName(mockUserOnlyUsername)).toBe("");
  });

  it("returns empty string for null user", () => {
    expect(getFullName(null)).toBe("");
  });

  it("returns empty string for undefined user", () => {
    expect(getFullName(undefined)).toBe("");
  });

  it("trims whitespace from names", () => {
    const userWithWhitespace: IUserProfile = {
      ...mockUser,
      first_name: "  John  ",
      last_name: "  Doe  ",
    };
    expect(getFullName(userWithWhitespace)).toBe("John Doe");
  });
});

//#endregion

//#region getDisplayName Tests

describe("getDisplayName", () => {
  it("returns nickname when set", () => {
    expect(getDisplayName(mockUserWithNickname)).toBe("JD");
  });

  it("returns full name when nickname is empty", () => {
    expect(getDisplayName(mockUser)).toBe("John Doe");
  });

  it("returns username when no name is set", () => {
    expect(getDisplayName(mockUserOnlyUsername)).toBe("noname");
  });

  it("returns fallback for null user", () => {
    expect(getDisplayName(null, { fallback: "Unknown" })).toBe("Unknown");
  });

  it("returns fallback for undefined user", () => {
    expect(getDisplayName(undefined, { fallback: "Guest" })).toBe("Guest");
  });

  it("returns empty string as default fallback", () => {
    expect(getDisplayName(null)).toBe("");
  });

  it("respects showUsername option", () => {
    expect(getDisplayName(mockUserOnlyUsername, { showUsername: false })).toBe(
      "",
    );
    expect(
      getDisplayName(mockUserOnlyUsername, {
        showUsername: false,
        fallback: "No Name",
      }),
    ).toBe("No Name");
  });

  it("trims whitespace from nickname", () => {
    const userWithWhitespaceNickname: IUserProfile = {
      ...mockUser,
      nickname: "  Johnny  ",
    };
    expect(getDisplayName(userWithWhitespaceNickname)).toBe("Johnny");
  });
});

//#endregion

//#region getInitials Tests

describe("getInitials", () => {
  it("returns initials from first and last name", () => {
    expect(getInitials(mockUser)).toBe("JD");
  });

  it("returns single initial from first name only", () => {
    expect(getInitials(mockUserOnlyFirstName)).toBe("A");
  });

  it("returns single initial from last name only", () => {
    expect(getInitials(mockUserOnlyLastName)).toBe("S");
  });

  it("returns first two letters of username as fallback", () => {
    expect(getInitials(mockUserOnlyUsername)).toBe("NO");
  });

  it("returns empty string for null user", () => {
    expect(getInitials(null)).toBe("");
  });

  it("returns empty string for undefined user", () => {
    expect(getInitials(undefined)).toBe("");
  });

  it("returns uppercase initials", () => {
    const userLowercase: IUserProfile = {
      ...mockUser,
      first_name: "john",
      last_name: "doe",
    };
    expect(getInitials(userLowercase)).toBe("JD");
  });

  it("handles single character username", () => {
    const singleCharUser: IUserProfile = {
      ...mockUserOnlyUsername,
      username: "x",
    };
    expect(getInitials(singleCharUser)).toBe("X");
  });

  it("handles empty username", () => {
    const emptyUsernameUser: IUserProfile = {
      ...mockUserOnlyUsername,
      username: "",
    };
    expect(getInitials(emptyUsernameUser)).toBe("");
  });
});

//#endregion

//#region isValidUsername Tests

describe("isValidUsername", () => {
  it("returns true for valid usernames", () => {
    expect(isValidUsername("john")).toBe(true);
    expect(isValidUsername("john.doe")).toBe(true);
    expect(isValidUsername("john_doe")).toBe(true);
    expect(isValidUsername("john-doe")).toBe(true);
    expect(isValidUsername("john123")).toBe(true);
    expect(isValidUsername("abc")).toBe(true);
    expect(isValidUsername("a")).toBe(false); // too short
    expect(isValidUsername("abcdefghijklmnopqrstuv")).toBe(true); // 22 chars
  });

  it("returns false for too short usernames", () => {
    expect(isValidUsername("ab")).toBe(false);
    expect(isValidUsername("a")).toBe(false);
    expect(isValidUsername("")).toBe(false);
  });

  it("returns false for too long usernames", () => {
    expect(isValidUsername("abcdefghijklmnopqrstuvw")).toBe(false); // 23 chars
  });

  it("returns false for usernames not starting with a letter", () => {
    expect(isValidUsername("1john")).toBe(false);
    expect(isValidUsername("_john")).toBe(false);
    expect(isValidUsername(".john")).toBe(false);
    expect(isValidUsername("-john")).toBe(false);
  });

  it("returns false for usernames ending with a period", () => {
    expect(isValidUsername("john.")).toBe(false);
  });

  it("returns false for usernames with consecutive periods", () => {
    expect(isValidUsername("john..doe")).toBe(false);
  });

  it("returns false for usernames with invalid characters", () => {
    expect(isValidUsername("John")).toBe(false); // uppercase
    expect(isValidUsername("john doe")).toBe(false); // space
    expect(isValidUsername("john@doe")).toBe(false); // @
    expect(isValidUsername("john#doe")).toBe(false); // #
  });
});

//#endregion

//#region getUsernameStatus Tests

describe("getUsernameStatus", () => {
  it("returns valid status for valid username", () => {
    expect(getUsernameStatus("john.doe")).toEqual({ valid: true });
  });

  it("returns error for too short username", () => {
    const result = getUsernameStatus("ab");
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Username must be at least 3 characters");
  });

  it("returns error for too long username", () => {
    const result = getUsernameStatus("abcdefghijklmnopqrstuvw");
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Username must be at most 22 characters");
  });

  it("returns error for invalid start character", () => {
    const result = getUsernameStatus("1john");
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Username must start with a letter");
  });

  it("returns error for ending with period", () => {
    const result = getUsernameStatus("john.");
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Username cannot end with a period");
  });

  it("returns error for consecutive periods", () => {
    const result = getUsernameStatus("john..doe");
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Username cannot contain consecutive periods");
  });

  it("returns error for invalid characters", () => {
    // Use a username that starts with a valid lowercase letter but has invalid chars
    const result = getUsernameStatus("john@doe");
    expect(result.valid).toBe(false);
    expect(result.error).toBe(
      "Username can only contain lowercase letters, numbers, underscores, hyphens, and periods",
    );
  });
});

//#endregion

//#region sanitizeUsername Tests

describe("sanitizeUsername", () => {
  it("converts to lowercase", () => {
    expect(sanitizeUsername("JohnDoe")).toBe("johndoe");
    expect(sanitizeUsername("JOHN.DOE")).toBe("john.doe");
  });

  it("trims whitespace", () => {
    expect(sanitizeUsername("  john  ")).toBe("john");
  });

  it("handles both trim and lowercase", () => {
    expect(sanitizeUsername("  JohnDoe  ")).toBe("johndoe");
  });
});

//#endregion

//#region formatMention Tests

describe("formatMention", () => {
  it("prepends @ to username", () => {
    expect(formatMention("john.doe")).toBe("@john.doe");
  });

  it("handles empty string", () => {
    expect(formatMention("")).toBe("@");
  });
});

//#endregion

//#region extractUsernameFromMention Tests

describe("extractUsernameFromMention", () => {
  it("removes @ from mention", () => {
    expect(extractUsernameFromMention("@john.doe")).toBe("john.doe");
  });

  it("returns username unchanged if no @", () => {
    expect(extractUsernameFromMention("john.doe")).toBe("john.doe");
  });

  it("only removes leading @", () => {
    expect(extractUsernameFromMention("@john@doe")).toBe("john@doe");
  });
});

//#endregion

//#region isMention Tests

describe("isMention", () => {
  it("returns true for valid mention", () => {
    expect(isMention("@john.doe")).toBe(true);
  });

  it("returns false for string without @", () => {
    expect(isMention("john.doe")).toBe(false);
  });

  it("returns false for just @", () => {
    expect(isMention("@")).toBe(false);
  });

  it("returns false for mention with invalid username", () => {
    expect(isMention("@ab")).toBe(false); // too short
    expect(isMention("@1john")).toBe(false); // starts with number
    expect(isMention("@JOHN")).toBe(false); // uppercase
  });
});

//#endregion

//#region isBotUser Tests

describe("isBotUser", () => {
  it("returns true for bot user", () => {
    expect(isBotUser(mockBotUser)).toBe(true);
  });

  it("returns false for regular user", () => {
    expect(isBotUser(mockUser)).toBe(false);
  });

  it("returns false for null user", () => {
    expect(isBotUser(null)).toBe(false);
  });

  it("returns false for undefined user", () => {
    expect(isBotUser(undefined)).toBe(false);
  });
});

//#endregion

//#region isSystemAdmin Tests

describe("isSystemAdmin", () => {
  it("returns true for admin user", () => {
    expect(isSystemAdmin(mockAdminUser)).toBe(true);
  });

  it("returns false for regular user", () => {
    expect(isSystemAdmin(mockUser)).toBe(false);
  });

  it("returns false for null user", () => {
    expect(isSystemAdmin(null)).toBe(false);
  });

  it("returns false for undefined user", () => {
    expect(isSystemAdmin(undefined)).toBe(false);
  });

  it("detects system_admin in mixed roles string", () => {
    const mixedRolesUser: IUserProfile = {
      ...mockUser,
      roles: "channel_admin system_admin team_user",
    };
    expect(isSystemAdmin(mixedRolesUser)).toBe(true);
  });
});

//#endregion

//#region getUserPosition Tests

describe("getUserPosition", () => {
  it("returns position for user with position", () => {
    expect(getUserPosition(mockUser)).toBe("Developer");
  });

  it("returns empty string for user without position", () => {
    const userNoPosition: IUserProfile = { ...mockUser, position: "" };
    expect(getUserPosition(userNoPosition)).toBe("");
  });

  it("returns empty string for null user", () => {
    expect(getUserPosition(null)).toBe("");
  });

  it("returns empty string for undefined user", () => {
    expect(getUserPosition(undefined)).toBe("");
  });

  it("trims whitespace from position", () => {
    const userWhitespacePosition: IUserProfile = {
      ...mockUser,
      position: "  Developer  ",
    };
    expect(getUserPosition(userWhitespacePosition)).toBe("Developer");
  });
});

//#endregion

//#region getUserLocale Tests

describe("getUserLocale", () => {
  it("returns locale for user with locale", () => {
    const userWithLocale: IUserProfile = { ...mockUser, locale: "es" };
    expect(getUserLocale(userWithLocale)).toBe("es");
  });

  it("returns default en for user without locale", () => {
    const userNoLocale: IUserProfile = { ...mockUser, locale: "" };
    expect(getUserLocale(userNoLocale)).toBe("en");
  });

  it("returns default en for null user", () => {
    expect(getUserLocale(null)).toBe("en");
  });

  it("returns default en for undefined user", () => {
    expect(getUserLocale(undefined)).toBe("en");
  });

  it("trims whitespace from locale", () => {
    const userWhitespaceLocale: IUserProfile = {
      ...mockUser,
      locale: "  fr  ",
    };
    expect(getUserLocale(userWhitespaceLocale)).toBe("fr");
  });
});

//#endregion
