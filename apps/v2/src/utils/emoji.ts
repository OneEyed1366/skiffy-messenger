/**
 * Emoji detection and manipulation utilities
 * Provides functions for detecting, counting, and converting emoji in text
 */

//#region Types

/**
 * Emoji map type for shortcode replacement
 * Maps shortcodes (without colons) to unicode emoji
 * @example { 'smile': '😄', 'heart': '❤️' }
 */
type IEmojiMap = Record<string, string>;

/**
 * Represents a matched emoji with its position in text
 */
type IEmojiMatch = {
  emoji: string;
  index: number;
  length: number;
};

//#endregion Types

//#region Constants

/**
 * Regional indicator symbols range: [\u{1F1E6}-\u{1F1FF}]{2}
 * Used to match flag emoji like 🇺🇸 (U+1F1FA U+1F1F8)
 *
 * Skin tone modifiers range (Fitzpatrick scale): [\u{1F3FB}-\u{1F3FF}]
 * 🏻 (light) to 🏿 (dark)
 *
 * Keycap sequence: [0-9#*]\uFE0F?\u20E3
 * Matches: 0️⃣ 1️⃣ 2️⃣ ... #️⃣ *️⃣
 */

/**
 * Matches a single emoji that may include modifiers and ZWJ sequences
 * Handles skin tone modifiers, gender variations, compound emoji (families), and flags
 *
 * @example
 * - Simple: '😀' ✓
 * - With modifier: '👍🏽' ✓
 * - ZWJ sequence: '👨‍👩‍👧' ✓
 * - Flags: '🇺🇸' ✓
 * - Multiple emoji: '😀😀' ✗
 */
const SINGLE_EMOJI_REGEX =
  /^(?:[\u{1F1E6}-\u{1F1FF}]{2}|[0-9#*]\uFE0F?\u20E3|(?:\p{Emoji_Presentation}|\p{Extended_Pictographic})(?:[\u{1F3FB}-\u{1F3FF}])?(?:\uFE0F)?(?:\u200D(?:\p{Emoji_Presentation}|\p{Extended_Pictographic})(?:[\u{1F3FB}-\u{1F3FF}])?(?:\uFE0F)?)*)$/u;

/**
 * Matches emoji with all possible modifiers for extraction
 * Includes variation selectors, skin tone modifiers, ZWJ sequences, flags, and keycaps
 */
const EMOJI_WITH_MODIFIERS_REGEX =
  /[\u{1F1E6}-\u{1F1FF}]{2}|[0-9#*]\uFE0F?\u20E3|(?:\p{Emoji_Presentation}|\p{Extended_Pictographic})(?:[\u{1F3FB}-\u{1F3FF}])?(?:\uFE0F)?(?:\u200D(?:\p{Emoji_Presentation}|\p{Extended_Pictographic})(?:[\u{1F3FB}-\u{1F3FF}])?(?:\uFE0F)?)*/gu;

/**
 * Shortcode regex for matching :shortcode: patterns
 * Shortcodes can contain alphanumeric characters, underscores, plus, and minus
 *
 * @example
 * - ':smile:' → matches 'smile'
 * - ':+1:' → matches '+1'
 * - ':e-mail:' → matches 'e-mail'
 */
export const SHORTCODE_REGEX = /:([a-zA-Z0-9_+-]+):/g;

//#endregion Constants

//#region Detection Functions

/**
 * Checks if a single character/string is an emoji
 *
 * @param char - The character or string to check
 * @returns True if the input is a single emoji (may include modifiers)
 *
 * @example
 * isEmoji('😀') // true
 * isEmoji('👍🏽') // true (with skin tone)
 * isEmoji('👨‍👩‍👧') // true (ZWJ family)
 * isEmoji('a') // false
 * isEmoji('😀😀') // false (multiple emoji)
 */
export function isEmoji(char: string): boolean {
  if (!char || char.length === 0) {
    return false;
  }
  return SINGLE_EMOJI_REGEX.test(char);
}

/**
 * Checks if text contains only emoji (no other characters)
 * Allows whitespace between emoji
 *
 * @param text - The text to check
 * @returns True if text contains only emoji and whitespace
 *
 * @example
 * isOnlyEmoji('😀') // true
 * isOnlyEmoji('😀 😃 😄') // true (with whitespace)
 * isOnlyEmoji('Hello 😀') // false
 * isOnlyEmoji('') // false
 */
export function isOnlyEmoji(text: string): boolean {
  if (!text || text.trim().length === 0) {
    return false;
  }

  // Remove all whitespace and check if remaining chars are all emoji
  const withoutWhitespace = text.replace(/\s/g, "");

  if (withoutWhitespace.length === 0) {
    return false;
  }

  // Extract all emoji and join them
  const extractedEmoji = extractEmoji(withoutWhitespace).join("");

  // Compare lengths - if they match, text is only emoji
  return extractedEmoji === withoutWhitespace;
}

/**
 * Checks if text should display as large emoji
 * True if text contains 1-3 emoji only, with no other text
 *
 * @param text - The text to check
 * @returns True if text should display as large emoji
 *
 * @example
 * isLargeEmojiOnly('😀') // true
 * isLargeEmojiOnly('😀😃😄') // true
 * isLargeEmojiOnly('😀😃😄😁') // false (more than 3)
 * isLargeEmojiOnly('Hello 😀') // false (contains text)
 */
export function isLargeEmojiOnly(text: string): boolean {
  if (!isOnlyEmoji(text)) {
    return false;
  }

  const count = countEmoji(text);
  return count >= 1 && count <= 3;
}

//#endregion Detection Functions

//#region Counting and Extraction

/**
 * Counts number of emoji in text
 *
 * @param text - The text to count emoji in
 * @returns Number of emoji found
 *
 * @example
 * countEmoji('Hello 😀 World 😃') // 2
 * countEmoji('👨‍👩‍👧') // 1 (ZWJ sequence counts as 1)
 * countEmoji('No emoji here') // 0
 */
export function countEmoji(text: string): number {
  if (!text) {
    return 0;
  }

  return extractEmoji(text).length;
}

/**
 * Extracts all emoji from text
 *
 * @param text - The text to extract emoji from
 * @returns Array of emoji strings found
 *
 * @example
 * extractEmoji('Hello 😀 World 😃!') // ['😀', '😃']
 * extractEmoji('👨‍👩‍👧 family') // ['👨‍👩‍👧']
 * extractEmoji('No emoji') // []
 */
export function extractEmoji(text: string): string[] {
  if (!text) {
    return [];
  }

  const matches = text.match(EMOJI_WITH_MODIFIERS_REGEX);
  return matches ?? [];
}

/**
 * Extracts all emoji with their positions in the text
 *
 * @param text - The text to extract emoji from
 * @returns Array of emoji matches with position information
 *
 * @example
 * extractEmojiWithPositions('Hi 😀!')
 * // [{ emoji: '😀', index: 3, length: 2 }]
 */
export function extractEmojiWithPositions(text: string): IEmojiMatch[] {
  if (!text) {
    return [];
  }

  const matches: IEmojiMatch[] = [];
  // Must create new regex instance to reset lastIndex and use stateless iteration
  const regex =
    /[\u{1F1E6}-\u{1F1FF}]{2}|[0-9#*]\uFE0F?\u20E3|(?:\p{Emoji_Presentation}|\p{Extended_Pictographic})(?:[\u{1F3FB}-\u{1F3FF}])?(?:\uFE0F)?(?:\u200D(?:\p{Emoji_Presentation}|\p{Extended_Pictographic})(?:[\u{1F3FB}-\u{1F3FF}])?(?:\uFE0F)?)*/gu;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    matches.push({
      emoji: match[0],
      index: match.index,
      length: match[0].length,
    });
  }

  return matches;
}

//#endregion Counting and Extraction

//#region Shortcode Conversion

/**
 * Replaces :shortcode: with unicode emoji
 *
 * @param text - Text with shortcodes
 * @param emojiMap - Map of shortcode (without colons) to unicode emoji
 * @returns Text with shortcodes replaced by unicode emoji
 *
 * @example
 * const map = { smile: '😄', heart: '❤️' };
 * replaceShortcodesWithUnicode('Hello :smile:!', map)
 * // 'Hello 😄!'
 */
export function replaceShortcodesWithUnicode(
  text: string,
  emojiMap: IEmojiMap,
): string {
  if (!text) {
    return "";
  }

  // Create a new regex to avoid stateful global regex issues
  const regex = /:([a-zA-Z0-9_+-]+):/g;

  return text.replace(regex, (fullMatch, shortcode: string) => {
    const emoji = emojiMap[shortcode];
    return emoji ?? fullMatch;
  });
}

/**
 * Replaces unicode emoji with :shortcode:
 *
 * @param text - Text with unicode emoji
 * @param emojiMap - Map of shortcode to unicode (will be inverted internally)
 * @returns Text with unicode emoji replaced by shortcodes
 *
 * @example
 * const map = { smile: '😄', heart: '❤️' };
 * replaceUnicodeWithShortcodes('Hello 😄!', map)
 * // 'Hello :smile:!'
 */
export function replaceUnicodeWithShortcodes(
  text: string,
  emojiMap: IEmojiMap,
): string {
  if (!text) {
    return "";
  }

  // Invert the map: unicode -> shortcode
  const unicodeToShortcode: Record<string, string> = {};
  for (const [shortcode, unicode] of Object.entries(emojiMap)) {
    unicodeToShortcode[unicode] = shortcode;
  }

  // Build a regex from the emoji in the map for exact matching
  // Sort by length descending to match longer sequences first (e.g., ZWJ sequences before components)
  const sortedEmoji = Object.values(emojiMap).sort(
    (a, b) => b.length - a.length,
  );

  if (sortedEmoji.length === 0) {
    return text;
  }

  // Escape special regex chars in emoji strings
  const escapedEmoji = sortedEmoji.map((e) =>
    e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
  );
  const emojiRegex = new RegExp(`(${escapedEmoji.join("|")})`, "gu");

  return text.replace(emojiRegex, (emoji) => {
    const shortcode = unicodeToShortcode[emoji];
    return shortcode ? `:${shortcode}:` : emoji;
  });
}

/**
 * Gets the shortcode for a unicode emoji
 *
 * @param emoji - The unicode emoji to look up
 * @param emojiMap - Map of shortcode to unicode emoji
 * @returns Shortcode without colons, or null if not found
 *
 * @example
 * const map = { smile: '😄', heart: '❤️' };
 * getShortcodeForEmoji('😄', map) // 'smile'
 * getShortcodeForEmoji('🤷', map) // null
 */
export function getShortcodeForEmoji(
  emoji: string,
  emojiMap: IEmojiMap,
): string | null {
  if (!emoji) {
    return null;
  }

  for (const [shortcode, unicode] of Object.entries(emojiMap)) {
    if (unicode === emoji) {
      return shortcode;
    }
  }

  return null;
}

//#endregion Shortcode Conversion

//#region Exports

export type { IEmojiMap, IEmojiMatch };

//#endregion Exports
