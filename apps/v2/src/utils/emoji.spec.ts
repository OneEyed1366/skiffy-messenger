import {
  isEmoji,
  isOnlyEmoji,
  isLargeEmojiOnly,
  countEmoji,
  extractEmoji,
  extractEmojiWithPositions,
  replaceShortcodesWithUnicode,
  replaceUnicodeWithShortcodes,
  getShortcodeForEmoji,
  SHORTCODE_REGEX,
} from "./emoji";
import type { IEmojiMap } from "./emoji";

//#region Test Data

const testEmojiMap: IEmojiMap = {
  smile: "😄",
  heart: "❤️",
  thumbsup: "👍",
  "+1": "👍",
  fire: "🔥",
  wave: "👋",
  family: "👨‍👩‍👧",
  flag_us: "🇺🇸",
};

//#endregion Test Data

//#region isEmoji

describe("isEmoji", () => {
  it("returns true for simple emoji", () => {
    expect(isEmoji("😀")).toBe(true);
    expect(isEmoji("😃")).toBe(true);
    expect(isEmoji("🔥")).toBe(true);
    expect(isEmoji("❤️")).toBe(true);
  });

  it("returns true for emoji with skin tone modifiers", () => {
    expect(isEmoji("👍🏻")).toBe(true); // light
    expect(isEmoji("👍🏼")).toBe(true); // medium-light
    expect(isEmoji("👍🏽")).toBe(true); // medium
    expect(isEmoji("👍🏾")).toBe(true); // medium-dark
    expect(isEmoji("👍🏿")).toBe(true); // dark
  });

  it("returns true for ZWJ sequences (family emoji)", () => {
    expect(isEmoji("👨‍👩‍👧")).toBe(true); // family
    expect(isEmoji("👨‍👩‍👧‍👦")).toBe(true); // family with boy
    expect(isEmoji("👩‍❤️‍👨")).toBe(true); // couple with heart
  });

  it("returns true for flag emoji", () => {
    expect(isEmoji("🇺🇸")).toBe(true);
    expect(isEmoji("🇬🇧")).toBe(true);
    expect(isEmoji("🇯🇵")).toBe(true);
  });

  it("returns false for regular characters", () => {
    expect(isEmoji("a")).toBe(false);
    expect(isEmoji("A")).toBe(false);
    expect(isEmoji("1")).toBe(false);
    expect(isEmoji("!")).toBe(false);
    expect(isEmoji(" ")).toBe(false);
  });

  it("returns false for multiple emoji", () => {
    expect(isEmoji("😀😀")).toBe(false);
    expect(isEmoji("😀 😃")).toBe(false);
  });

  it("returns false for empty or null-like values", () => {
    expect(isEmoji("")).toBe(false);
  });

  it("returns false for mixed text", () => {
    expect(isEmoji("hello😀")).toBe(false);
    expect(isEmoji("😀hello")).toBe(false);
  });
});

//#endregion isEmoji

//#region isOnlyEmoji

describe("isOnlyEmoji", () => {
  it("returns true for single emoji", () => {
    expect(isOnlyEmoji("😀")).toBe(true);
    expect(isOnlyEmoji("👍")).toBe(true);
  });

  it("returns true for multiple emoji", () => {
    expect(isOnlyEmoji("😀😃😄")).toBe(true);
    expect(isOnlyEmoji("🔥🔥🔥")).toBe(true);
  });

  it("returns true for emoji with whitespace between", () => {
    expect(isOnlyEmoji("😀 😃")).toBe(true);
    expect(isOnlyEmoji("😀  😃  😄")).toBe(true);
    expect(isOnlyEmoji("😀\t😃")).toBe(true);
    expect(isOnlyEmoji("😀\n😃")).toBe(true);
  });

  it("returns true for emoji with modifiers", () => {
    expect(isOnlyEmoji("👍🏽")).toBe(true);
    expect(isOnlyEmoji("👍🏻 👍🏿")).toBe(true);
  });

  it("returns true for ZWJ sequences", () => {
    expect(isOnlyEmoji("👨‍👩‍👧")).toBe(true);
    expect(isOnlyEmoji("👨‍👩‍👧 👨‍👩‍👦")).toBe(true);
  });

  it("returns false for text with emoji", () => {
    expect(isOnlyEmoji("Hello 😀")).toBe(false);
    expect(isOnlyEmoji("😀 World")).toBe(false);
    expect(isOnlyEmoji("Hello 😀 World")).toBe(false);
  });

  it("returns false for empty or whitespace-only text", () => {
    expect(isOnlyEmoji("")).toBe(false);
    expect(isOnlyEmoji("   ")).toBe(false);
    expect(isOnlyEmoji("\t\n")).toBe(false);
  });

  it("returns false for plain text", () => {
    expect(isOnlyEmoji("Hello")).toBe(false);
    expect(isOnlyEmoji("123")).toBe(false);
  });
});

//#endregion isOnlyEmoji

//#region isLargeEmojiOnly

describe("isLargeEmojiOnly", () => {
  it("returns true for 1 emoji", () => {
    expect(isLargeEmojiOnly("😀")).toBe(true);
  });

  it("returns true for 2 emoji", () => {
    expect(isLargeEmojiOnly("😀😃")).toBe(true);
    expect(isLargeEmojiOnly("😀 😃")).toBe(true);
  });

  it("returns true for 3 emoji", () => {
    expect(isLargeEmojiOnly("😀😃😄")).toBe(true);
    expect(isLargeEmojiOnly("😀 😃 😄")).toBe(true);
  });

  it("returns false for 4+ emoji", () => {
    expect(isLargeEmojiOnly("😀😃😄😁")).toBe(false);
    expect(isLargeEmojiOnly("😀😃😄😁😆")).toBe(false);
  });

  it("returns false for text with emoji", () => {
    expect(isLargeEmojiOnly("Hello 😀")).toBe(false);
    expect(isLargeEmojiOnly("😀!")).toBe(false);
  });

  it("returns false for empty text", () => {
    expect(isLargeEmojiOnly("")).toBe(false);
  });

  it("returns true for complex emoji (counts as 1)", () => {
    expect(isLargeEmojiOnly("👨‍👩‍👧")).toBe(true);
    expect(isLargeEmojiOnly("👍🏽")).toBe(true);
  });
});

//#endregion isLargeEmojiOnly

//#region countEmoji

describe("countEmoji", () => {
  it("counts simple emoji", () => {
    expect(countEmoji("😀")).toBe(1);
    expect(countEmoji("😀😃")).toBe(2);
    expect(countEmoji("😀😃😄😁😆")).toBe(5);
  });

  it("counts emoji in mixed text", () => {
    expect(countEmoji("Hello 😀 World")).toBe(1);
    expect(countEmoji("Hey 😀 there 😃!")).toBe(2);
  });

  it("counts emoji with modifiers as single emoji", () => {
    expect(countEmoji("👍🏽")).toBe(1);
    expect(countEmoji("👍🏻👍🏿")).toBe(2);
  });

  it("counts ZWJ sequences as single emoji", () => {
    expect(countEmoji("👨‍👩‍👧")).toBe(1);
    expect(countEmoji("👨‍👩‍👧 👨‍👩‍👦")).toBe(2);
  });

  it("returns 0 for text without emoji", () => {
    expect(countEmoji("Hello World")).toBe(0);
    expect(countEmoji("123 abc")).toBe(0);
  });

  it("returns 0 for empty text", () => {
    expect(countEmoji("")).toBe(0);
  });
});

//#endregion countEmoji

//#region extractEmoji

describe("extractEmoji", () => {
  it("extracts simple emoji", () => {
    expect(extractEmoji("Hello 😀 World")).toEqual(["😀"]);
    expect(extractEmoji("😀😃😄")).toEqual(["😀", "😃", "😄"]);
  });

  it("extracts emoji with modifiers", () => {
    expect(extractEmoji("Nice 👍🏽!")).toEqual(["👍🏽"]);
  });

  it("extracts ZWJ sequences", () => {
    expect(extractEmoji("Family: 👨‍👩‍👧")).toEqual(["👨‍👩‍👧"]);
  });

  it("extracts flag emoji", () => {
    expect(extractEmoji("USA 🇺🇸")).toEqual(["🇺🇸"]);
  });

  it("returns empty array for text without emoji", () => {
    expect(extractEmoji("Hello World")).toEqual([]);
  });

  it("returns empty array for empty text", () => {
    expect(extractEmoji("")).toEqual([]);
  });

  it("preserves emoji order", () => {
    expect(extractEmoji("😀 then 😃 then 😄")).toEqual(["😀", "😃", "😄"]);
  });
});

//#endregion extractEmoji

//#region extractEmojiWithPositions

describe("extractEmojiWithPositions", () => {
  it("extracts emoji with correct positions", () => {
    const result = extractEmojiWithPositions("Hi 😀!");
    expect(result).toHaveLength(1);
    expect(result[0].emoji).toBe("😀");
    expect(result[0].index).toBe(3);
  });

  it("extracts multiple emoji with positions", () => {
    const result = extractEmojiWithPositions("😀 and 😃");
    expect(result).toHaveLength(2);
    expect(result[0].emoji).toBe("😀");
    expect(result[0].index).toBe(0);
    expect(result[1].emoji).toBe("😃");
  });

  it("returns correct length for complex emoji", () => {
    const result = extractEmojiWithPositions("👨‍👩‍👧 family");
    expect(result).toHaveLength(1);
    expect(result[0].emoji).toBe("👨‍👩‍👧");
    expect(result[0].length).toBe("👨‍👩‍👧".length);
  });

  it("returns empty array for text without emoji", () => {
    expect(extractEmojiWithPositions("Hello")).toEqual([]);
  });

  it("returns empty array for empty text", () => {
    expect(extractEmojiWithPositions("")).toEqual([]);
  });
});

//#endregion extractEmojiWithPositions

//#region replaceShortcodesWithUnicode

describe("replaceShortcodesWithUnicode", () => {
  it("replaces single shortcode", () => {
    expect(replaceShortcodesWithUnicode("Hello :smile:!", testEmojiMap)).toBe(
      "Hello 😄!",
    );
  });

  it("replaces multiple shortcodes", () => {
    expect(
      replaceShortcodesWithUnicode(":smile: :heart: :fire:", testEmojiMap),
    ).toBe("😄 ❤️ 🔥");
  });

  it("handles shortcodes with special characters", () => {
    expect(replaceShortcodesWithUnicode(":+1: great!", testEmojiMap)).toBe(
      "👍 great!",
    );
  });

  it("preserves unknown shortcodes", () => {
    expect(
      replaceShortcodesWithUnicode(":smile: :unknown:", testEmojiMap),
    ).toBe("😄 :unknown:");
  });

  it("handles text without shortcodes", () => {
    expect(replaceShortcodesWithUnicode("Hello World", testEmojiMap)).toBe(
      "Hello World",
    );
  });

  it("handles empty text", () => {
    expect(replaceShortcodesWithUnicode("", testEmojiMap)).toBe("");
  });

  it("handles consecutive shortcodes", () => {
    expect(replaceShortcodesWithUnicode(":smile::heart:", testEmojiMap)).toBe(
      "😄❤️",
    );
  });
});

//#endregion replaceShortcodesWithUnicode

//#region replaceUnicodeWithShortcodes

describe("replaceUnicodeWithShortcodes", () => {
  it("replaces single emoji", () => {
    expect(replaceUnicodeWithShortcodes("Hello 😄!", testEmojiMap)).toBe(
      "Hello :smile:!",
    );
  });

  it("replaces multiple emoji", () => {
    expect(replaceUnicodeWithShortcodes("😄 ❤️ 🔥", testEmojiMap)).toBe(
      ":smile: :heart: :fire:",
    );
  });

  it("preserves unknown emoji", () => {
    expect(replaceUnicodeWithShortcodes("😄 🤷", testEmojiMap)).toBe(
      ":smile: 🤷",
    );
  });

  it("handles text without emoji", () => {
    expect(replaceUnicodeWithShortcodes("Hello World", testEmojiMap)).toBe(
      "Hello World",
    );
  });

  it("handles empty text", () => {
    expect(replaceUnicodeWithShortcodes("", testEmojiMap)).toBe("");
  });

  it("handles ZWJ sequences when mapped", () => {
    expect(replaceUnicodeWithShortcodes("Family: 👨‍👩‍👧", testEmojiMap)).toBe(
      "Family: :family:",
    );
  });
});

//#endregion replaceUnicodeWithShortcodes

//#region getShortcodeForEmoji

describe("getShortcodeForEmoji", () => {
  it("returns shortcode for known emoji", () => {
    expect(getShortcodeForEmoji("😄", testEmojiMap)).toBe("smile");
    expect(getShortcodeForEmoji("❤️", testEmojiMap)).toBe("heart");
  });

  it("returns null for unknown emoji", () => {
    expect(getShortcodeForEmoji("🤷", testEmojiMap)).toBeNull();
    expect(getShortcodeForEmoji("🦄", testEmojiMap)).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(getShortcodeForEmoji("", testEmojiMap)).toBeNull();
  });

  it("returns first matching shortcode when multiple exist", () => {
    // '+1' and 'thumbsup' both map to 👍
    const result = getShortcodeForEmoji("👍", testEmojiMap);
    expect(result === "thumbsup" || result === "+1").toBe(true);
  });
});

//#endregion getShortcodeForEmoji

//#region SHORTCODE_REGEX

describe("SHORTCODE_REGEX", () => {
  it("matches simple shortcodes", () => {
    const matches = ":smile:".match(new RegExp(SHORTCODE_REGEX.source, "g"));
    expect(matches).toEqual([":smile:"]);
  });

  it("matches shortcodes with numbers", () => {
    const matches = ":100:".match(new RegExp(SHORTCODE_REGEX.source, "g"));
    expect(matches).toEqual([":100:"]);
  });

  it("matches shortcodes with underscores", () => {
    const matches = ":slightly_smiling_face:".match(
      new RegExp(SHORTCODE_REGEX.source, "g"),
    );
    expect(matches).toEqual([":slightly_smiling_face:"]);
  });

  it("matches shortcodes with plus and minus", () => {
    const matchesPlus = ":+1:".match(new RegExp(SHORTCODE_REGEX.source, "g"));
    expect(matchesPlus).toEqual([":+1:"]);

    const matchesMinus = ":e-mail:".match(
      new RegExp(SHORTCODE_REGEX.source, "g"),
    );
    expect(matchesMinus).toEqual([":e-mail:"]);
  });

  it("matches multiple shortcodes in text", () => {
    const matches = "Hello :smile: World :wave:!".match(
      new RegExp(SHORTCODE_REGEX.source, "g"),
    );
    expect(matches).toEqual([":smile:", ":wave:"]);
  });

  it("does not match incomplete shortcodes", () => {
    const matches = ":incomplete".match(
      new RegExp(SHORTCODE_REGEX.source, "g"),
    );
    expect(matches).toBeNull();
  });
});

//#endregion SHORTCODE_REGEX

//#region Edge Cases

describe("Edge Cases", () => {
  it("handles variation selectors (VS16)", () => {
    // Heart with variation selector
    expect(isEmoji("❤️")).toBe(true);
    expect(countEmoji("❤️")).toBe(1);
  });

  it("handles keycap sequences", () => {
    // Keycap digits are technically emoji
    expect(countEmoji("1️⃣2️⃣3️⃣")).toBeGreaterThan(0);
  });

  it("handles regional indicator pairs (flags)", () => {
    expect(isEmoji("🇺🇸")).toBe(true);
    expect(countEmoji("🇺🇸🇬🇧")).toBe(2);
  });

  it("handles professional emoji (ZWJ)", () => {
    // Woman technologist
    expect(isEmoji("👩‍💻")).toBe(true);
    expect(countEmoji("👩‍💻")).toBe(1);
  });

  it("handles emoji presentation vs text presentation", () => {
    // ⭐ can be text or emoji depending on VS
    expect(extractEmoji("⭐")).toHaveLength(1);
  });

  it("handles round-trip conversion", () => {
    const original = "Hello :smile: and :heart:!";
    const withUnicode = replaceShortcodesWithUnicode(original, testEmojiMap);
    const backToShortcode = replaceUnicodeWithShortcodes(
      withUnicode,
      testEmojiMap,
    );
    expect(backToShortcode).toBe(original);
  });
});

//#endregion Edge Cases
