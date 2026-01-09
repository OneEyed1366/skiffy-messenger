import {
  highlightSearchTerms,
  truncateText,
  wrapLongWords,
  escapeHtml,
  unescapeHtml,
  formatChannelName,
  normalizeWhitespace,
  countWords,
} from "./text-formatting";

//#region highlightSearchTerms

describe("highlightSearchTerms", () => {
  it("wraps matching terms in default markers", () => {
    expect(highlightSearchTerms("Hello World", ["world"])).toBe(
      "Hello **World**",
    );
  });

  it("handles multiple terms", () => {
    expect(highlightSearchTerms("foo bar baz", ["foo", "baz"])).toBe(
      "**foo** bar **baz**",
    );
  });

  it("is case-insensitive but preserves original case", () => {
    expect(highlightSearchTerms("HELLO hello Hello", ["hello"])).toBe(
      "**HELLO** **hello** **Hello**",
    );
  });

  it("uses custom marker", () => {
    expect(highlightSearchTerms("foo bar", ["bar"], "==")).toBe("foo ==bar==");
  });

  it("handles empty terms array", () => {
    expect(highlightSearchTerms("Hello World", [])).toBe("Hello World");
  });

  it("handles empty text", () => {
    expect(highlightSearchTerms("", ["test"])).toBe("");
  });

  it("handles null/undefined text", () => {
    expect(highlightSearchTerms(null as unknown as string, ["test"])).toBe("");
  });

  it("handles special regex characters in terms", () => {
    expect(highlightSearchTerms("price is $100", ["$100"])).toBe(
      "price is **$100**",
    );
    expect(highlightSearchTerms("a.b.c", ["a.b"])).toBe("**a.b**.c");
  });

  it("handles overlapping terms by matching longest first", () => {
    expect(highlightSearchTerms("foobar", ["foo", "foobar"])).toBe(
      "**foobar**",
    );
  });

  it("handles empty string in terms array", () => {
    expect(highlightSearchTerms("hello world", ["", "world"])).toBe(
      "hello **world**",
    );
  });
});

//#endregion

//#region truncateText

describe("truncateText", () => {
  it("returns text unchanged if shorter than maxLength", () => {
    expect(truncateText("Hi", 10)).toBe("Hi");
  });

  it("truncates and adds ellipsis when text exceeds maxLength", () => {
    expect(truncateText("Hello World", 8)).toBe("Hello...");
  });

  it("uses custom ellipsis", () => {
    // With word boundary breaking, it breaks at the space
    expect(truncateText("Hello World", 9, "…")).toBe("Hello…");
  });

  it("uses custom ellipsis without word boundary break", () => {
    // When no good word boundary is found, it truncates at the exact position
    expect(truncateText("HelloWorld", 9, "…")).toBe("HelloWor…");
  });

  it("tries to break at word boundary", () => {
    expect(truncateText("The quick brown fox", 15)).toBe("The quick...");
  });

  it("handles empty text", () => {
    expect(truncateText("", 10)).toBe("");
  });

  it("handles null/undefined text", () => {
    expect(truncateText(null as unknown as string, 10)).toBe("");
  });

  it("handles maxLength smaller than ellipsis", () => {
    expect(truncateText("Hello", 2)).toBe("..");
  });

  it("handles maxLength equal to text length", () => {
    expect(truncateText("Hello", 5)).toBe("Hello");
  });

  it("handles very long words without spaces", () => {
    expect(truncateText("superlongword", 10)).toBe("superlo...");
  });
});

//#endregion

//#region wrapLongWords

describe("wrapLongWords", () => {
  const ZWSP = "\u200B";

  it("inserts zero-width spaces in long words", () => {
    expect(wrapLongWords("superlongwordhere", 5)).toBe(
      `super${ZWSP}longw${ZWSP}ordhe${ZWSP}re`,
    );
  });

  it("leaves short words unchanged", () => {
    expect(wrapLongWords("hi there", 10)).toBe("hi there");
  });

  it("handles multiple long words", () => {
    expect(wrapLongWords("abc123 def456", 3)).toBe(
      `abc${ZWSP}123 def${ZWSP}456`,
    );
  });

  it("handles empty text", () => {
    expect(wrapLongWords("", 5)).toBe("");
  });

  it("handles null/undefined text", () => {
    expect(wrapLongWords(null as unknown as string, 5)).toBe("");
  });

  it("handles maxWordLength of 0", () => {
    expect(wrapLongWords("hello", 0)).toBe("hello");
  });

  it("handles words exactly at maxLength", () => {
    expect(wrapLongWords("hello", 5)).toBe("hello");
  });

  it("preserves whitespace between words", () => {
    expect(wrapLongWords("ab  cd", 5)).toBe("ab  cd");
  });
});

//#endregion

//#region escapeHtml

describe("escapeHtml", () => {
  it("escapes ampersand", () => {
    expect(escapeHtml("foo & bar")).toBe("foo &amp; bar");
  });

  it("escapes less than", () => {
    expect(escapeHtml("a < b")).toBe("a &lt; b");
  });

  it("escapes greater than", () => {
    expect(escapeHtml("a > b")).toBe("a &gt; b");
  });

  it("escapes double quotes", () => {
    expect(escapeHtml('say "hello"')).toBe("say &quot;hello&quot;");
  });

  it("escapes single quotes", () => {
    expect(escapeHtml("it's")).toBe("it&#39;s");
  });

  it("escapes all special characters together", () => {
    expect(escapeHtml('<script>alert("xss")</script>')).toBe(
      "&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;",
    );
  });

  it("handles empty text", () => {
    expect(escapeHtml("")).toBe("");
  });

  it("handles null/undefined text", () => {
    expect(escapeHtml(null as unknown as string)).toBe("");
  });

  it("leaves non-special characters unchanged", () => {
    expect(escapeHtml("Hello World 123")).toBe("Hello World 123");
  });
});

//#endregion

//#region unescapeHtml

describe("unescapeHtml", () => {
  it("unescapes &amp;", () => {
    expect(unescapeHtml("foo &amp; bar")).toBe("foo & bar");
  });

  it("unescapes &lt;", () => {
    expect(unescapeHtml("a &lt; b")).toBe("a < b");
  });

  it("unescapes &gt;", () => {
    expect(unescapeHtml("a &gt; b")).toBe("a > b");
  });

  it("unescapes &quot;", () => {
    expect(unescapeHtml("say &quot;hello&quot;")).toBe('say "hello"');
  });

  it("unescapes &#39;", () => {
    expect(unescapeHtml("it&#39;s")).toBe("it's");
  });

  it("unescapes &nbsp;", () => {
    expect(unescapeHtml("hello&nbsp;world")).toBe("hello world");
  });

  it("unescapes all entities together", () => {
    expect(
      unescapeHtml("&lt;div&gt;Hello&nbsp;&amp;&nbsp;World&lt;/div&gt;"),
    ).toBe("<div>Hello & World</div>");
  });

  it("handles empty text", () => {
    expect(unescapeHtml("")).toBe("");
  });

  it("handles null/undefined text", () => {
    expect(unescapeHtml(null as unknown as string)).toBe("");
  });

  it("leaves regular text unchanged", () => {
    expect(unescapeHtml("Hello World")).toBe("Hello World");
  });
});

//#endregion

//#region formatChannelName

describe("formatChannelName", () => {
  it("replaces dashes with spaces and title-cases", () => {
    expect(formatChannelName("general-discussion")).toBe("General Discussion");
  });

  it("replaces underscores with spaces and title-cases", () => {
    expect(formatChannelName("dev_team_standup")).toBe("Dev Team Standup");
  });

  it("handles mixed dashes and underscores", () => {
    expect(formatChannelName("my-cool_channel")).toBe("My Cool Channel");
  });

  it("title-cases single word", () => {
    expect(formatChannelName("announcements")).toBe("Announcements");
  });

  it("handles empty string", () => {
    expect(formatChannelName("")).toBe("");
  });

  it("handles null/undefined", () => {
    expect(formatChannelName(null as unknown as string)).toBe("");
  });

  it("handles multiple consecutive separators", () => {
    expect(formatChannelName("foo--bar__baz")).toBe("Foo Bar Baz");
  });

  it("handles already title-cased input", () => {
    expect(formatChannelName("Already-Good")).toBe("Already Good");
  });
});

//#endregion

//#region normalizeWhitespace

describe("normalizeWhitespace", () => {
  it("trims leading and trailing whitespace", () => {
    expect(normalizeWhitespace("  hello world  ")).toBe("hello world");
  });

  it("collapses multiple spaces into one", () => {
    expect(normalizeWhitespace("hello   world")).toBe("hello world");
  });

  it("normalizes \\r\\n to \\n", () => {
    expect(normalizeWhitespace("line1\r\nline2")).toBe("line1\nline2");
  });

  it("normalizes \\r to \\n", () => {
    expect(normalizeWhitespace("line1\rline2")).toBe("line1\nline2");
  });

  it("collapses multiple blank lines into one", () => {
    expect(normalizeWhitespace("line1\n\n\n\nline2")).toBe("line1\n\nline2");
  });

  it("removes spaces at start and end of lines", () => {
    expect(normalizeWhitespace("  line1  \n  line2  ")).toBe("line1\nline2");
  });

  it("handles tabs", () => {
    expect(normalizeWhitespace("hello\t\tworld")).toBe("hello world");
  });

  it("handles empty text", () => {
    expect(normalizeWhitespace("")).toBe("");
  });

  it("handles null/undefined text", () => {
    expect(normalizeWhitespace(null as unknown as string)).toBe("");
  });

  it("handles text with only whitespace", () => {
    expect(normalizeWhitespace("   \n\n   \t   ")).toBe("");
  });
});

//#endregion

//#region countWords

describe("countWords", () => {
  it("counts words separated by spaces", () => {
    expect(countWords("Hello World")).toBe(2);
  });

  it("handles multiple spaces between words", () => {
    expect(countWords("one   two   three")).toBe(3);
  });

  it("handles leading and trailing whitespace", () => {
    expect(countWords("  one two three  ")).toBe(3);
  });

  it("handles tabs and newlines", () => {
    expect(countWords("one\ttwo\nthree")).toBe(3);
  });

  it("returns 0 for empty text", () => {
    expect(countWords("")).toBe(0);
  });

  it("returns 0 for null/undefined text", () => {
    expect(countWords(null as unknown as string)).toBe(0);
  });

  it("returns 0 for whitespace-only text", () => {
    expect(countWords("   \t\n   ")).toBe(0);
  });

  it("counts single word", () => {
    expect(countWords("hello")).toBe(1);
  });

  it("counts hyphenated words as one word", () => {
    expect(countWords("well-known fact")).toBe(2);
  });

  it("handles punctuation attached to words", () => {
    expect(countWords("Hello, world!")).toBe(2);
  });
});

//#endregion
