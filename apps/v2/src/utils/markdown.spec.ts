import {
  parseMarkdown,
  stripMarkdown,
  extractLinks,
  extractMentions,
  extractHashtags,
  isMarkdownLink,
  getMarkdownPreview,
  hasMarkdownSyntax,
  escapeMarkdown,
} from "./markdown";

//#region parseMarkdown

describe("parseMarkdown", () => {
  it("returns empty string for empty input", () => {
    expect(parseMarkdown("")).toBe("");
  });

  it("parses headers", () => {
    expect(parseMarkdown("# Heading 1")).toContain("<h1>");
    expect(parseMarkdown("## Heading 2")).toContain("<h2>");
    expect(parseMarkdown("### Heading 3")).toContain("<h3>");
  });

  it("parses bold text", () => {
    const result = parseMarkdown("**bold**");
    expect(result).toContain("<strong>bold</strong>");
  });

  it("parses italic text", () => {
    const result = parseMarkdown("*italic*");
    expect(result).toContain("<em>italic</em>");
  });

  it("parses links", () => {
    const result = parseMarkdown("[Google](https://google.com)");
    expect(result).toContain('<a href="https://google.com"');
    expect(result).toContain("Google");
  });

  it("parses unordered lists", () => {
    const result = parseMarkdown("- item 1\n- item 2");
    expect(result).toContain("<ul>");
    expect(result).toContain("<li>");
  });

  it("parses ordered lists", () => {
    const result = parseMarkdown("1. first\n2. second");
    expect(result).toContain("<ol>");
    expect(result).toContain("<li>");
  });

  it("parses code blocks", () => {
    const result = parseMarkdown("```\ncode\n```");
    expect(result).toContain("<code>");
  });

  it("parses inline code", () => {
    const result = parseMarkdown("`inline code`");
    expect(result).toContain("<code>inline code</code>");
  });

  it("handles complex markdown", () => {
    const markdown = `# Title

This is **bold** and *italic*.

- List item 1
- List item 2

[Link](https://example.com)`;

    const result = parseMarkdown(markdown);
    expect(result).toContain("<h1>");
    expect(result).toContain("<strong>");
    expect(result).toContain("<em>");
    expect(result).toContain("<ul>");
    expect(result).toContain("<a href=");
  });
});

//#endregion

//#region stripMarkdown

describe("stripMarkdown", () => {
  it("returns empty string for empty input", () => {
    expect(stripMarkdown("")).toBe("");
  });

  it("strips headers", () => {
    expect(stripMarkdown("# Heading")).toBe("Heading");
    expect(stripMarkdown("## Sub Heading")).toBe("Sub Heading");
  });

  it("strips bold formatting", () => {
    expect(stripMarkdown("**bold**")).toBe("bold");
    expect(stripMarkdown("__bold__")).toBe("bold");
  });

  it("strips italic formatting", () => {
    expect(stripMarkdown("*italic*")).toBe("italic");
    expect(stripMarkdown("_italic_")).toBe("italic");
  });

  it("strips links but keeps text", () => {
    expect(stripMarkdown("[Google](https://google.com)")).toBe("Google");
    expect(stripMarkdown("[text](url)")).toBe("text");
  });

  it("strips inline code", () => {
    expect(stripMarkdown("`code`")).toBe("code");
  });

  it("strips code blocks", () => {
    const result = stripMarkdown("```\ncode block\n```");
    expect(result).toContain("code block");
  });

  it("strips lists", () => {
    const result = stripMarkdown("- item 1\n- item 2");
    expect(result).toContain("item 1");
    expect(result).toContain("item 2");
  });

  it("strips blockquotes", () => {
    expect(stripMarkdown("> quote")).toBe("quote");
  });

  it("handles mixed formatting", () => {
    const result = stripMarkdown(
      "# Title\n\nSome **bold** and *italic* [link](url).",
    );
    // Note: Header and paragraph are separate tokens, joined without extra space
    expect(result).toContain("Title");
    expect(result).toContain("bold");
    expect(result).toContain("italic");
    expect(result).toContain("link");
    expect(result).not.toContain("**");
    expect(result).not.toContain("*italic*");
    expect(result).not.toContain("[");
  });

  it("normalizes whitespace", () => {
    const result = stripMarkdown("Hello   World\n\nParagraph");
    expect(result).not.toContain("  ");
  });
});

//#endregion

//#region extractLinks

describe("extractLinks", () => {
  it("returns empty array for empty input", () => {
    expect(extractLinks("")).toEqual([]);
  });

  it("returns empty array when no links", () => {
    expect(extractLinks("Just plain text")).toEqual([]);
  });

  it("extracts inline links", () => {
    const result = extractLinks("[Google](https://google.com)");
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      text: "Google",
      href: "https://google.com",
    });
  });

  it("extracts links with titles", () => {
    const result = extractLinks('[Link](https://example.com "Example")');
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      text: "Link",
      href: "https://example.com",
      title: "Example",
    });
  });

  it("extracts multiple links", () => {
    const text = "[One](https://one.com) and [Two](https://two.com) links here";
    const result = extractLinks(text);
    expect(result).toHaveLength(2);
    expect(result[0]?.href).toBe("https://one.com");
    expect(result[1]?.href).toBe("https://two.com");
  });

  it("extracts links from complex markdown", () => {
    const markdown = `# Title

Check out [this site](https://example.com) and [another](https://other.com).

- [List link](https://list.com)
`;
    const result = extractLinks(markdown);
    expect(result).toHaveLength(3);
  });

  it("extracts images as links", () => {
    const result = extractLinks("![Alt text](https://image.com/img.png)");
    expect(result).toHaveLength(1);
    expect(result[0]?.href).toBe("https://image.com/img.png");
  });
});

//#endregion

//#region extractMentions

describe("extractMentions", () => {
  it("returns empty array for empty input", () => {
    expect(extractMentions("")).toEqual([]);
  });

  it("returns empty array when no mentions", () => {
    expect(extractMentions("Just plain text")).toEqual([]);
  });

  it("extracts simple mention", () => {
    const result = extractMentions("Hello @john");
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ username: "john", index: 6 });
  });

  it("extracts mention with underscore", () => {
    const result = extractMentions("Hello @john_doe");
    expect(result).toHaveLength(1);
    expect(result[0]?.username).toBe("john_doe");
  });

  it("extracts mention with dot", () => {
    const result = extractMentions("Hello @john.doe");
    expect(result).toHaveLength(1);
    expect(result[0]?.username).toBe("john.doe");
  });

  it("extracts mention with hyphen", () => {
    const result = extractMentions("Hello @john-doe");
    expect(result).toHaveLength(1);
    expect(result[0]?.username).toBe("john-doe");
  });

  it("extracts multiple mentions", () => {
    const result = extractMentions("Hey @alice and @bob, meet @charlie");
    expect(result).toHaveLength(3);
    expect(result[0]?.username).toBe("alice");
    expect(result[1]?.username).toBe("bob");
    expect(result[2]?.username).toBe("charlie");
  });

  it("records correct indices", () => {
    const result = extractMentions("@first @second");
    expect(result[0]?.index).toBe(0);
    expect(result[1]?.index).toBe(7);
  });

  it("handles mentions at different positions", () => {
    const result = extractMentions("Start @middle end @end");
    expect(result).toHaveLength(2);
  });
});

//#endregion

//#region extractHashtags

describe("extractHashtags", () => {
  it("returns empty array for empty input", () => {
    expect(extractHashtags("")).toEqual([]);
  });

  it("returns empty array when no hashtags", () => {
    expect(extractHashtags("Just plain text")).toEqual([]);
  });

  it("extracts simple hashtag", () => {
    const result = extractHashtags("Hello #world");
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ tag: "world", index: 6 });
  });

  it("extracts hashtag with underscore", () => {
    const result = extractHashtags("Check #react_native");
    expect(result).toHaveLength(1);
    expect(result[0]?.tag).toBe("react_native");
  });

  it("extracts hashtag with numbers", () => {
    const result = extractHashtags("Event #2024");
    expect(result).toHaveLength(1);
    expect(result[0]?.tag).toBe("2024");
  });

  it("extracts multiple hashtags", () => {
    const result = extractHashtags("#react #typescript #javascript");
    expect(result).toHaveLength(3);
    expect(result[0]?.tag).toBe("react");
    expect(result[1]?.tag).toBe("typescript");
    expect(result[2]?.tag).toBe("javascript");
  });

  it("records correct indices", () => {
    const result = extractHashtags("#first #second");
    expect(result[0]?.index).toBe(0);
    expect(result[1]?.index).toBe(7);
  });

  it("does not match dot in hashtag", () => {
    const result = extractHashtags("#hello.world");
    expect(result).toHaveLength(1);
    expect(result[0]?.tag).toBe("hello"); // Only matches up to dot
  });
});

//#endregion

//#region isMarkdownLink

describe("isMarkdownLink", () => {
  it("returns false for empty input", () => {
    expect(isMarkdownLink("")).toBe(false);
  });

  it("returns true for inline link", () => {
    expect(isMarkdownLink("[text](url)")).toBe(true);
    expect(isMarkdownLink("[Google](https://google.com)")).toBe(true);
  });

  it("returns true for reference link", () => {
    expect(isMarkdownLink("[text][ref]")).toBe(true);
    expect(isMarkdownLink("[link][1]")).toBe(true);
  });

  it("returns false for plain text", () => {
    expect(isMarkdownLink("plain text")).toBe(false);
  });

  it("returns false for partial link syntax", () => {
    expect(isMarkdownLink("[text]")).toBe(false);
    expect(isMarkdownLink("(url)")).toBe(false);
    expect(isMarkdownLink("[text](")).toBe(false);
  });

  it("returns false for link within text", () => {
    expect(isMarkdownLink("prefix [text](url)")).toBe(false);
    expect(isMarkdownLink("[text](url) suffix")).toBe(false);
  });

  it("handles whitespace", () => {
    expect(isMarkdownLink("  [text](url)  ")).toBe(true);
  });
});

//#endregion

//#region getMarkdownPreview

describe("getMarkdownPreview", () => {
  it("returns empty string for empty input", () => {
    expect(getMarkdownPreview("")).toBe("");
  });

  it("strips markdown and returns plain text", () => {
    expect(getMarkdownPreview("**bold** text")).toBe("bold text");
  });

  it("truncates long text with ellipsis", () => {
    const longText = "This is a very long text that should be truncated";
    const result = getMarkdownPreview(longText, 20);
    expect(result.length).toBeLessThanOrEqual(20);
    expect(result).toContain("...");
  });

  it("does not truncate short text", () => {
    expect(getMarkdownPreview("Short", 100)).toBe("Short");
  });

  it("uses default max length of 100", () => {
    const longText = "a".repeat(150);
    const result = getMarkdownPreview(longText);
    expect(result.length).toBeLessThanOrEqual(100);
  });

  it("tries to break at word boundary", () => {
    const text = "Hello wonderful world of markdown";
    const result = getMarkdownPreview(text, 20);
    // Should break at "wonderful" not mid-word
    expect(result).toMatch(/\.\.\.$/);
  });

  it("handles complex markdown", () => {
    const markdown = "# Title\n\nSome **bold** text with [link](url).";
    const result = getMarkdownPreview(markdown, 30);
    expect(result).not.toContain("#");
    expect(result).not.toContain("**");
    expect(result).not.toContain("[");
  });
});

//#endregion

//#region hasMarkdownSyntax

describe("hasMarkdownSyntax", () => {
  it("returns false for empty input", () => {
    expect(hasMarkdownSyntax("")).toBe(false);
  });

  it("returns false for plain text", () => {
    expect(hasMarkdownSyntax("Just plain text")).toBe(false);
  });

  it("detects headers", () => {
    expect(hasMarkdownSyntax("# Header")).toBe(true);
    expect(hasMarkdownSyntax("## Sub header")).toBe(true);
    expect(hasMarkdownSyntax("### Level 3")).toBe(true);
  });

  it("detects bold with asterisks", () => {
    expect(hasMarkdownSyntax("**bold**")).toBe(true);
  });

  it("detects bold with underscores", () => {
    expect(hasMarkdownSyntax("__bold__")).toBe(true);
  });

  it("detects italic with asterisks", () => {
    expect(hasMarkdownSyntax("*italic*")).toBe(true);
  });

  it("detects italic with underscores", () => {
    expect(hasMarkdownSyntax("_italic_")).toBe(true);
  });

  it("detects strikethrough", () => {
    expect(hasMarkdownSyntax("~~strikethrough~~")).toBe(true);
  });

  it("detects inline links", () => {
    expect(hasMarkdownSyntax("[text](url)")).toBe(true);
  });

  it("detects reference links", () => {
    expect(hasMarkdownSyntax("[text][ref]")).toBe(true);
  });

  it("detects images", () => {
    expect(hasMarkdownSyntax("![alt](url)")).toBe(true);
  });

  it("detects blockquotes", () => {
    expect(hasMarkdownSyntax("> quote")).toBe(true);
  });

  it("detects unordered lists", () => {
    expect(hasMarkdownSyntax("- item")).toBe(true);
    expect(hasMarkdownSyntax("* item")).toBe(true);
    expect(hasMarkdownSyntax("+ item")).toBe(true);
  });

  it("detects ordered lists", () => {
    expect(hasMarkdownSyntax("1. item")).toBe(true);
    expect(hasMarkdownSyntax("10. item")).toBe(true);
  });

  it("detects inline code", () => {
    expect(hasMarkdownSyntax("`code`")).toBe(true);
  });

  it("detects code blocks", () => {
    expect(hasMarkdownSyntax("```\ncode\n```")).toBe(true);
    expect(hasMarkdownSyntax("~~~\ncode\n~~~")).toBe(true);
  });

  it("detects horizontal rules", () => {
    expect(hasMarkdownSyntax("---")).toBe(true);
    expect(hasMarkdownSyntax("***")).toBe(true);
    expect(hasMarkdownSyntax("___")).toBe(true);
  });

  it("detects tables", () => {
    expect(hasMarkdownSyntax("| col1 | col2 |")).toBe(true);
  });
});

//#endregion

//#region escapeMarkdown

describe("escapeMarkdown", () => {
  it("returns empty string for empty input", () => {
    expect(escapeMarkdown("")).toBe("");
  });

  it("returns plain text unchanged", () => {
    expect(escapeMarkdown("Hello World")).toBe("Hello World");
  });

  it("escapes asterisks", () => {
    expect(escapeMarkdown("*italic*")).toBe("\\*italic\\*");
  });

  it("escapes underscores", () => {
    expect(escapeMarkdown("_italic_")).toBe("\\_italic\\_");
  });

  it("escapes backticks", () => {
    expect(escapeMarkdown("`code`")).toBe("\\`code\\`");
  });

  it("escapes brackets", () => {
    expect(escapeMarkdown("[link]")).toBe("\\[link\\]");
  });

  it("escapes parentheses", () => {
    expect(escapeMarkdown("(url)")).toBe("\\(url\\)");
  });

  it("escapes hash", () => {
    expect(escapeMarkdown("# header")).toBe("\\# header");
  });

  it("escapes plus", () => {
    expect(escapeMarkdown("+ item")).toBe("\\+ item");
  });

  it("escapes minus/hyphen", () => {
    expect(escapeMarkdown("- item")).toBe("\\- item");
  });

  it("escapes dot", () => {
    expect(escapeMarkdown("1. item")).toBe("1\\. item");
  });

  it("escapes exclamation mark", () => {
    expect(escapeMarkdown("![image]")).toBe("\\!\\[image\\]");
  });

  it("escapes backslash", () => {
    expect(escapeMarkdown("back\\slash")).toBe("back\\\\slash");
  });

  it("escapes all special characters in complex text", () => {
    const input = "[link](url) and **bold** `code`";
    const result = escapeMarkdown(input);
    expect(result).toBe("\\[link\\]\\(url\\) and \\*\\*bold\\*\\* \\`code\\`");
  });
});

//#endregion

//#region Edge Cases

describe("Edge cases", () => {
  it("handles null-like values gracefully", () => {
    // TypeScript ensures string type, but runtime might get null
    const nullish = null as unknown as string;
    expect(parseMarkdown(nullish)).toBe("");
    expect(stripMarkdown(nullish)).toBe("");
    expect(extractLinks(nullish)).toEqual([]);
    expect(extractMentions(nullish)).toEqual([]);
    expect(extractHashtags(nullish)).toEqual([]);
    expect(isMarkdownLink(nullish)).toBe(false);
    expect(getMarkdownPreview(nullish)).toBe("");
    expect(hasMarkdownSyntax(nullish)).toBe(false);
    expect(escapeMarkdown(nullish)).toBe("");
  });

  it("handles nested formatting", () => {
    const nested = "**bold and *italic* inside**";
    const stripped = stripMarkdown(nested);
    expect(stripped).toContain("bold");
    expect(stripped).toContain("italic");
  });

  it("handles unicode characters", () => {
    const unicode = "# 你好世界 **粗体** [链接](url)";
    expect(parseMarkdown(unicode)).toContain("你好世界");
    expect(stripMarkdown(unicode)).toContain("你好世界");
  });

  it("handles emoji", () => {
    const emoji = "# Hello 👋 **World** 🌍";
    expect(parseMarkdown(emoji)).toContain("👋");
    expect(stripMarkdown(emoji)).toContain("🌍");
  });

  it("extracts mentions and hashtags correctly when repeated calls", () => {
    // Test regex state reset
    const text1 = "@user1 #tag1";
    const text2 = "@user2 #tag2";

    expect(extractMentions(text1)).toHaveLength(1);
    expect(extractMentions(text2)).toHaveLength(1);
    expect(extractHashtags(text1)).toHaveLength(1);
    expect(extractHashtags(text2)).toHaveLength(1);
  });
});

//#endregion
