/**
 * Markdown parsing and manipulation utilities
 * Uses marked library for parsing
 */

import { marked, type Token, type Tokens } from "marked";

//#region Types

type IMarkdownLink = {
  text: string;
  href: string;
  title?: string;
};

type IMention = {
  username: string;
  index: number;
};

type IHashtag = {
  tag: string;
  index: number;
};

//#endregion

//#region Constants

/**
 * Regex pattern for @mentions
 * Matches: @username (alphanumeric, underscore, dot, hyphen)
 */
const MENTION_REGEX = /@([a-zA-Z0-9_.-]+)/g;

/**
 * Regex pattern for #hashtags
 * Matches: #word (alphanumeric, underscore)
 */
const HASHTAG_REGEX = /#([a-zA-Z0-9_]+)/g;

/**
 * Regex pattern for markdown links
 * Matches: [text](url) or [text][ref]
 */
const MARKDOWN_LINK_REGEX =
  /^\[([^\]]+)\]\(([^)]+)\)$|^\[([^\]]+)\]\[([^\]]+)\]$/;

/**
 * Characters that have special meaning in markdown and should be escaped
 */
const MARKDOWN_SPECIAL_CHARS = /[*_`[\]()#+\-.!\\]/g;

/**
 * Patterns that indicate markdown syntax presence
 */
const MARKDOWN_SYNTAX_PATTERNS = [
  /^#{1,6}\s/, // Headers: # ## ### etc.
  /\*\*.+\*\*/, // Bold: **text**
  /\*.+\*/, // Italic: *text*
  /__.+__/, // Bold: __text__
  /_.+_/, // Italic: _text_
  /~~.+~~/, // Strikethrough: ~~text~~
  /\[.+\]\(.+\)/, // Links: [text](url)
  /\[.+\]\[.+\]/, // Reference links: [text][ref]
  /!\[.*\]\(.+\)/, // Images: ![alt](url)
  /^>\s/, // Blockquotes: > text
  /^[-*+]\s/, // Unordered lists: - or * or +
  /^\d+\.\s/, // Ordered lists: 1. 2. etc.
  /`.+`/, // Inline code: `code`
  /^```/, // Code blocks: ```
  /^~~~/, // Code blocks: ~~~
  /^\|.+\|/, // Tables: | col1 | col2 |
  /^---+$/, // Horizontal rules: ---
  /^\*\*\*+$/, // Horizontal rules: ***
  /^___+$/, // Horizontal rules: ___
];

/**
 * Default preview max length
 */
const DEFAULT_PREVIEW_LENGTH = 100;

//#endregion

//#region Token Text Extraction

/**
 * Recursively extracts plain text from marked tokens.
 * Handles nested tokens and various token types.
 *
 * @param tokens - Array of marked Token objects
 * @returns Extracted plain text
 *
 * @example
 * ```typescript
 * const tokens = marked.lexer('**bold** text');
 * extractTextFromTokens(tokens); // => 'bold text'
 * ```
 */
function extractTextFromTokens(tokens: Token[]): string {
  let result = "";

  for (const token of tokens) {
    // Handle space and line break tokens
    if (token.type === "space" || token.type === "br") {
      result += " ";
      continue;
    }

    // Handle horizontal rule
    if (token.type === "hr") {
      result += " ";
      continue;
    }

    // Handle code blocks - use text directly
    if (token.type === "code") {
      const codeToken = token as Tokens.Code;
      result += codeToken.text + " ";
      continue;
    }

    // Handle inline code
    if (token.type === "codespan") {
      const codespanToken = token as Tokens.Codespan;
      result += codespanToken.text;
      continue;
    }

    // Handle text tokens directly
    if ("text" in token && typeof token.text === "string") {
      // If this token has nested tokens, extract from those instead
      if ("tokens" in token && Array.isArray(token.tokens)) {
        result += extractTextFromTokens(token.tokens);
      } else {
        result += token.text;
      }
      continue;
    }

    // Handle nested tokens
    if ("tokens" in token && Array.isArray(token.tokens)) {
      result += extractTextFromTokens(token.tokens);
      continue;
    }

    // Handle list items
    if (token.type === "list") {
      const listToken = token as Tokens.List;
      for (const item of listToken.items) {
        if (item.tokens) {
          result += extractTextFromTokens(item.tokens) + " ";
        }
      }
      continue;
    }
  }

  return result;
}

//#endregion

//#region Parsing Functions

/**
 * Parses markdown text to HTML.
 * Uses the marked library for parsing.
 *
 * @param text - Markdown text to parse
 * @returns HTML string
 *
 * @example
 * ```typescript
 * parseMarkdown('# Hello'); // => '<h1>Hello</h1>\n'
 * parseMarkdown('**bold**'); // => '<p><strong>bold</strong></p>\n'
 * ```
 */
export function parseMarkdown(text: string): string {
  if (!text) {
    return "";
  }

  return marked.parse(text, { async: false }) as string;
}

/**
 * Strips markdown formatting, returning plain text.
 * Uses marked lexer to tokenize, then extracts text content.
 *
 * @param text - Markdown text to strip
 * @returns Plain text without markdown formatting
 *
 * @example
 * ```typescript
 * stripMarkdown('# Hello **World**'); // => 'Hello World'
 * stripMarkdown('[link](url)'); // => 'link'
 * ```
 */
export function stripMarkdown(text: string): string {
  if (!text) {
    return "";
  }

  const tokens = marked.lexer(text);
  return extractTextFromTokens(tokens).replace(/\s+/g, " ").trim();
}

//#endregion

//#region Link Extraction

/**
 * Recursively extracts links from marked tokens.
 *
 * @param tokens - Array of marked Token objects
 * @returns Array of link objects
 */
function extractLinksFromTokens(tokens: Token[]): IMarkdownLink[] {
  const links: IMarkdownLink[] = [];

  for (const token of tokens) {
    // Handle link tokens
    if (token.type === "link") {
      const linkToken = token as Tokens.Link;
      links.push({
        text: linkToken.text,
        href: linkToken.href,
        ...(linkToken.title ? { title: linkToken.title } : {}),
      });
    }

    // Handle image tokens (they also have href)
    if (token.type === "image") {
      const imageToken = token as Tokens.Image;
      links.push({
        text: imageToken.text || imageToken.title || "",
        href: imageToken.href,
        ...(imageToken.title ? { title: imageToken.title } : {}),
      });
    }

    // Recurse into nested tokens
    if ("tokens" in token && Array.isArray(token.tokens)) {
      links.push(...extractLinksFromTokens(token.tokens));
    }

    // Handle list items
    if (token.type === "list") {
      const listToken = token as Tokens.List;
      for (const item of listToken.items) {
        if (item.tokens) {
          links.push(...extractLinksFromTokens(item.tokens));
        }
      }
    }
  }

  return links;
}

/**
 * Extracts all links from markdown text.
 *
 * @param text - Markdown text to extract links from
 * @returns Array of link objects with text, href, and optional title
 *
 * @example
 * ```typescript
 * extractLinks('[Google](https://google.com)');
 * // => [{ text: 'Google', href: 'https://google.com' }]
 *
 * extractLinks('[link](url "title")');
 * // => [{ text: 'link', href: 'url', title: 'title' }]
 * ```
 */
export function extractLinks(text: string): IMarkdownLink[] {
  if (!text) {
    return [];
  }

  const tokens = marked.lexer(text);
  return extractLinksFromTokens(tokens);
}

//#endregion

//#region Mention & Hashtag Extraction

/**
 * Extracts @mentions from text.
 * Pattern: @username (alphanumeric, underscore, dot, hyphen)
 *
 * @param text - Text to extract mentions from
 * @returns Array of mention objects with username and index
 *
 * @example
 * ```typescript
 * extractMentions('Hello @john and @jane.doe');
 * // => [
 * //   { username: 'john', index: 6 },
 * //   { username: 'jane.doe', index: 17 }
 * // ]
 * ```
 */
export function extractMentions(text: string): IMention[] {
  if (!text) {
    return [];
  }

  const mentions: IMention[] = [];
  // Reset regex state before using
  MENTION_REGEX.lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = MENTION_REGEX.exec(text)) !== null) {
    mentions.push({
      username: match[1],
      index: match.index,
    });
  }

  return mentions;
}

/**
 * Extracts #hashtags from text.
 * Pattern: #word (alphanumeric, underscore)
 *
 * @param text - Text to extract hashtags from
 * @returns Array of hashtag objects with tag and index
 *
 * @example
 * ```typescript
 * extractHashtags('Check #javascript and #react_native');
 * // => [
 * //   { tag: 'javascript', index: 6 },
 * //   { tag: 'react_native', index: 23 }
 * // ]
 * ```
 */
export function extractHashtags(text: string): IHashtag[] {
  if (!text) {
    return [];
  }

  const hashtags: IHashtag[] = [];
  // Reset regex state before using
  HASHTAG_REGEX.lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = HASHTAG_REGEX.exec(text)) !== null) {
    hashtags.push({
      tag: match[1],
      index: match.index,
    });
  }

  return hashtags;
}

//#endregion

//#region Validation Functions

/**
 * Checks if text is a markdown link.
 * Matches: [text](url) or [text][ref]
 *
 * @param text - Text to check
 * @returns True if text is a valid markdown link
 *
 * @example
 * ```typescript
 * isMarkdownLink('[Google](https://google.com)'); // => true
 * isMarkdownLink('[ref][1]'); // => true
 * isMarkdownLink('not a link'); // => false
 * ```
 */
export function isMarkdownLink(text: string): boolean {
  if (!text) {
    return false;
  }

  return MARKDOWN_LINK_REGEX.test(text.trim());
}

/**
 * Checks if text contains any markdown syntax.
 * Detects: headers, bold, italic, links, lists, code blocks, etc.
 *
 * @param text - Text to check
 * @returns True if text contains markdown syntax
 *
 * @example
 * ```typescript
 * hasMarkdownSyntax('# Header'); // => true
 * hasMarkdownSyntax('**bold**'); // => true
 * hasMarkdownSyntax('plain text'); // => false
 * ```
 */
export function hasMarkdownSyntax(text: string): boolean {
  if (!text) {
    return false;
  }

  // Check each line for patterns that need line start (^)
  const lines = text.split("\n");
  for (const line of lines) {
    for (const pattern of MARKDOWN_SYNTAX_PATTERNS) {
      if (pattern.test(line)) {
        return true;
      }
    }
  }

  return false;
}

//#endregion

//#region Transformation Functions

/**
 * Gets a preview of markdown text (stripped and truncated).
 *
 * @param text - Markdown text to preview
 * @param maxLength - Maximum length of preview (default: 100)
 * @returns Plain text preview, truncated with ellipsis if needed
 *
 * @example
 * ```typescript
 * getMarkdownPreview('# Hello **World**', 10); // => 'Hello W...'
 * getMarkdownPreview('Short', 100); // => 'Short'
 * ```
 */
export function getMarkdownPreview(
  text: string,
  maxLength: number = DEFAULT_PREVIEW_LENGTH,
): string {
  if (!text) {
    return "";
  }

  const stripped = stripMarkdown(text);

  if (stripped.length <= maxLength) {
    return stripped;
  }

  // Truncate and add ellipsis
  const truncated = stripped.slice(0, maxLength - 3);

  // Try to break at word boundary
  const lastSpace = truncated.lastIndexOf(" ");
  if (lastSpace > maxLength * 0.5) {
    return truncated.slice(0, lastSpace) + "...";
  }

  return truncated + "...";
}

/**
 * Escapes markdown special characters.
 * Escapes: * _ ` [ ] ( ) # + - . ! \
 *
 * @param text - Text to escape
 * @returns Text with markdown special characters escaped
 *
 * @example
 * ```typescript
 * escapeMarkdown('Hello *world*'); // => 'Hello \\*world\\*'
 * escapeMarkdown('[link](url)'); // => '\\[link\\]\\(url\\)'
 * ```
 */
export function escapeMarkdown(text: string): string {
  if (!text) {
    return "";
  }

  return text.replace(MARKDOWN_SPECIAL_CHARS, "\\$&");
}

//#endregion

//#region Type Exports

export type { IMarkdownLink, IMention, IHashtag };

//#endregion
