/**
 * Text formatting utilities
 * Migrated from: vendor/desktop/webapp/channels/src/utils/text_formatting.tsx
 */

//#region Constants

/**
 * Zero-width space character for word wrapping
 */
const ZERO_WIDTH_SPACE = "\u200B";

/**
 * Map of HTML special characters to their entity equivalents.
 * Used for escaping user input to prevent XSS.
 */
const HTML_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
} as const;

/**
 * Map of HTML entities back to their character equivalents.
 * Used for unescaping HTML content.
 */
const HTML_ENTITY_REVERSE: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&nbsp;": " ",
} as const;

//#endregion

//#region Search Highlighting

/**
 * Wraps search terms in highlight markers for display.
 * Performs case-insensitive matching and preserves the original case of matched text.
 * When terms overlap (e.g., "foo" and "foobar"), the longest match wins.
 *
 * @param text - The text to search in
 * @param terms - Array of terms to highlight
 * @param marker - Marker string (default: '**')
 * @returns Text with terms wrapped in markers
 *
 * @example
 * ```typescript
 * highlightSearchTerms('Hello World', ['world']) // => 'Hello **World**'
 * highlightSearchTerms('foo bar baz', ['bar'], '==') // => 'foo ==bar== baz'
 * ```
 */
export function highlightSearchTerms(
  text: string,
  terms: string[],
  marker = "**",
): string {
  if (!text || terms.length === 0) {
    return text ?? "";
  }

  // Filter out empty terms and sort by length (longest first) to handle overlapping matches
  const sortedTerms = [...terms]
    .filter((t) => t && t.length > 0)
    .sort((a, b) => b.length - a.length);

  if (sortedTerms.length === 0) {
    return text;
  }

  // Build a single regex pattern with all terms (longest first)
  // This ensures longest match wins when terms overlap
  const escapedTerms = sortedTerms.map((term) =>
    term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
  );
  const pattern = escapedTerms.join("|");
  const regex = new RegExp(`(${pattern})`, "gi");

  return text.replace(regex, `${marker}$1${marker}`);
}

//#endregion

//#region Text Truncation

/**
 * Truncates text to maxLength, adding ellipsis if truncated.
 * Attempts to break at word boundaries when possible.
 *
 * @param text - Text to truncate
 * @param maxLength - Maximum length (including ellipsis)
 * @param ellipsis - Ellipsis string (default: '...')
 * @returns Truncated text with ellipsis if needed
 *
 * @example
 * ```typescript
 * truncateText('Hello World', 8) // => 'Hello...'
 * truncateText('Hi', 10) // => 'Hi'
 * truncateText('Hello World', 8, '…') // => 'Hello W…'
 * ```
 */
export function truncateText(
  text: string,
  maxLength: number,
  ellipsis = "...",
): string {
  if (!text) {
    return "";
  }

  if (text.length <= maxLength) {
    return text;
  }

  const truncateAt = maxLength - ellipsis.length;
  if (truncateAt <= 0) {
    return ellipsis.slice(0, maxLength);
  }

  // Try to break at a word boundary
  const truncated = text.slice(0, truncateAt);
  const lastSpace = truncated.lastIndexOf(" ");

  // Only break at word boundary if it's reasonably close to the end
  if (lastSpace > truncateAt * 0.5) {
    return truncated.slice(0, lastSpace) + ellipsis;
  }

  return truncated + ellipsis;
}

//#endregion

//#region Word Wrapping

/**
 * Inserts zero-width spaces to allow long words to wrap.
 * Useful for displaying long URLs, file paths, or other unbreakable strings.
 *
 * @param text - Text with potentially long words
 * @param maxWordLength - Max length before inserting break (default: 20)
 * @returns Text with zero-width spaces inserted
 *
 * @example
 * ```typescript
 * wrapLongWords('superlongwordhere', 5) // => 'super\u200Blong\u200Bwordh\u200Bere'
 * wrapLongWords('hi there', 10) // => 'hi there' (unchanged)
 * ```
 */
export function wrapLongWords(text: string, maxWordLength: number): string {
  if (!text || maxWordLength <= 0) {
    return text ?? "";
  }

  return text.replace(/\S+/g, (word) => {
    if (word.length <= maxWordLength) {
      return word;
    }

    const chunks: string[] = [];
    for (let i = 0; i < word.length; i += maxWordLength) {
      chunks.push(word.slice(i, i + maxWordLength));
    }

    return chunks.join(ZERO_WIDTH_SPACE);
  });
}

//#endregion

//#region HTML Escaping

/**
 * Escapes HTML special characters to prevent XSS attacks.
 * Converts: & < > " '
 *
 * @param text - Text to escape
 * @returns HTML-escaped text
 *
 * @example
 * ```typescript
 * escapeHtml('<script>alert("xss")</script>')
 * // => '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
 * ```
 */
export function escapeHtml(text: string): string {
  if (!text) {
    return "";
  }

  return text.replace(/[&<>"']/g, (char) => HTML_ENTITIES[char] ?? char);
}

/**
 * Unescapes HTML entities back to characters.
 * Converts: &amp; &lt; &gt; &quot; &#39; &nbsp;
 *
 * @param text - Text with HTML entities
 * @returns Unescaped text
 *
 * @example
 * ```typescript
 * unescapeHtml('&lt;div&gt;Hello&nbsp;World&lt;/div&gt;')
 * // => '<div>Hello World</div>'
 * ```
 */
export function unescapeHtml(text: string): string {
  if (!text) {
    return "";
  }

  let result = text;
  for (const [entity, char] of Object.entries(HTML_ENTITY_REVERSE)) {
    result = result.replace(new RegExp(entity, "g"), char);
  }

  return result;
}

//#endregion

//#region Channel Name Formatting

/**
 * Formats a channel name for display.
 * Replaces dashes and underscores with spaces, then title-cases the result.
 *
 * @param name - Raw channel name (e.g., 'my-cool_channel')
 * @returns Formatted display name (e.g., 'My Cool Channel')
 *
 * @example
 * ```typescript
 * formatChannelName('general-discussion') // => 'General Discussion'
 * formatChannelName('dev_team_standup') // => 'Dev Team Standup'
 * formatChannelName('announcements') // => 'Announcements'
 * ```
 */
export function formatChannelName(name: string): string {
  if (!name) {
    return "";
  }

  // Replace dashes and underscores with spaces
  const spaced = name.replace(/[-_]+/g, " ");

  // Title case each word
  return spaced.replace(/\b\w/g, (char) => char.toUpperCase());
}

//#endregion

//#region Whitespace Normalization

/**
 * Removes extra whitespace, trims, and normalizes line breaks.
 * - Collapses multiple spaces/tabs into single space
 * - Normalizes all line breaks to \n
 * - Collapses multiple blank lines into single blank line
 * - Trims leading/trailing whitespace
 *
 * @param text - Text to normalize
 * @returns Normalized text
 *
 * @example
 * ```typescript
 * normalizeWhitespace('  hello   world  ') // => 'hello world'
 * normalizeWhitespace('line1\r\n\r\n\r\nline2') // => 'line1\n\nline2'
 * ```
 */
export function normalizeWhitespace(text: string): string {
  if (!text) {
    return "";
  }

  return (
    text
      // Normalize line endings to \n
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      // Collapse multiple blank lines into one
      .replace(/\n{3,}/g, "\n\n")
      // Collapse multiple spaces/tabs into single space (but preserve newlines)
      .replace(/[^\S\n]+/g, " ")
      // Remove spaces at the start/end of each line
      .replace(/^ +| +$/gm, "")
      // Trim the whole string
      .trim()
  );
}

//#endregion

//#region Word Counting

/**
 * Counts words in text.
 * Words are defined as sequences of non-whitespace characters.
 *
 * @param text - Text to count words in
 * @returns Number of words
 *
 * @example
 * ```typescript
 * countWords('Hello World') // => 2
 * countWords('  one   two   three  ') // => 3
 * countWords('') // => 0
 * ```
 */
export function countWords(text: string): number {
  if (!text) {
    return 0;
  }

  const trimmed = text.trim();
  if (!trimmed) {
    return 0;
  }

  // Split on whitespace and filter out empty strings
  const words = trimmed.split(/\s+/).filter(Boolean);
  return words.length;
}

//#endregion
