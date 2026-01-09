import {
  isValidUrl,
  isExternalUrl,
  extractDomain,
  normalizeUrl,
  buildQueryString,
  parseQueryString,
  joinPaths,
  isImageUrl,
  getUrlExtension,
  isDataUrl,
  setQueryParam,
  removeQueryParam,
} from "./url";

//#region isValidUrl

describe("isValidUrl", () => {
  it("returns true for valid HTTP URLs", () => {
    expect(isValidUrl("http://example.com")).toBe(true);
    expect(isValidUrl("https://example.com")).toBe(true);
    expect(isValidUrl("https://example.com/path")).toBe(true);
    expect(isValidUrl("https://example.com/path?query=1")).toBe(true);
    expect(isValidUrl("https://example.com:8080")).toBe(true);
  });

  it("returns true for other valid URL schemes", () => {
    expect(isValidUrl("ftp://files.example.com")).toBe(true);
    expect(isValidUrl("file:///path/to/file")).toBe(true);
  });

  it("returns false for invalid URLs", () => {
    expect(isValidUrl("not-a-url")).toBe(false);
    expect(isValidUrl("example.com")).toBe(false);
    expect(isValidUrl("://missing-protocol.com")).toBe(false);
  });

  it("returns false for empty or invalid input", () => {
    expect(isValidUrl("")).toBe(false);
    expect(isValidUrl(null as unknown as string)).toBe(false);
    expect(isValidUrl(undefined as unknown as string)).toBe(false);
  });
});

//#endregion

//#region isExternalUrl

describe("isExternalUrl", () => {
  it("returns true for URLs with different host", () => {
    expect(
      isExternalUrl("https://external.com/page", "https://mysite.com"),
    ).toBe(true);
    expect(
      isExternalUrl("https://subdomain.external.com", "https://mysite.com"),
    ).toBe(true);
  });

  it("returns false for URLs with same host", () => {
    expect(isExternalUrl("https://mysite.com/page", "https://mysite.com")).toBe(
      false,
    );
    expect(
      isExternalUrl(
        "https://mysite.com/path/to/page",
        "https://mysite.com/other",
      ),
    ).toBe(false);
  });

  it("returns false for relative URLs", () => {
    expect(isExternalUrl("/relative/path", "https://mysite.com")).toBe(false);
    expect(isExternalUrl("#anchor", "https://mysite.com")).toBe(false);
  });

  it("returns false for empty or invalid input", () => {
    expect(isExternalUrl("", "https://mysite.com")).toBe(false);
    expect(isExternalUrl("https://external.com", "")).toBe(false);
    expect(isExternalUrl("", "")).toBe(false);
  });

  it("handles port differences correctly", () => {
    expect(isExternalUrl("https://mysite.com:8080", "https://mysite.com")).toBe(
      false,
    );
  });
});

//#endregion

//#region extractDomain

describe("extractDomain", () => {
  it("extracts domain from valid URLs", () => {
    expect(extractDomain("https://www.example.com/path")).toBe(
      "www.example.com",
    );
    expect(extractDomain("https://example.com")).toBe("example.com");
    expect(extractDomain("http://subdomain.example.com:8080/path")).toBe(
      "subdomain.example.com",
    );
  });

  it("returns null for invalid URLs", () => {
    expect(extractDomain("not-a-url")).toBeNull();
    expect(extractDomain("")).toBeNull();
    expect(extractDomain(null as unknown as string)).toBeNull();
  });

  it("handles localhost and IP addresses", () => {
    expect(extractDomain("http://localhost:3000")).toBe("localhost");
    expect(extractDomain("http://127.0.0.1:8080")).toBe("127.0.0.1");
  });
});

//#endregion

//#region normalizeUrl

describe("normalizeUrl", () => {
  it("lowercases protocol and host", () => {
    expect(normalizeUrl("HTTPS://EXAMPLE.COM/Path")).toBe(
      "https://example.com/Path",
    );
    expect(normalizeUrl("HTTP://WWW.EXAMPLE.COM")).toBe(
      "http://www.example.com/",
    );
  });

  it("removes trailing slash from paths", () => {
    expect(normalizeUrl("https://example.com/path/")).toBe(
      "https://example.com/path",
    );
    expect(normalizeUrl("https://example.com/a/b/c/")).toBe(
      "https://example.com/a/b/c",
    );
  });

  it("preserves trailing slash for root", () => {
    expect(normalizeUrl("https://example.com")).toBe("https://example.com/");
    expect(normalizeUrl("https://example.com/")).toBe("https://example.com/");
  });

  it("returns original for invalid URLs", () => {
    expect(normalizeUrl("not-a-url")).toBe("not-a-url");
    expect(normalizeUrl("")).toBe("");
  });

  it("preserves query strings and fragments", () => {
    expect(normalizeUrl("https://example.com/path?query=1")).toContain(
      "query=1",
    );
    expect(normalizeUrl("https://example.com/path#section")).toContain(
      "#section",
    );
  });
});

//#endregion

//#region buildQueryString

describe("buildQueryString", () => {
  it("builds query string from object", () => {
    expect(buildQueryString({ page: 1, sort: "asc" })).toBe("page=1&sort=asc");
  });

  it("encodes special characters", () => {
    expect(buildQueryString({ search: "hello world" })).toBe(
      "search=hello%20world",
    );
    expect(buildQueryString({ query: "a=b&c=d" })).toBe("query=a%3Db%26c%3Dd");
  });

  it("handles boolean values", () => {
    expect(buildQueryString({ active: true, deleted: false })).toBe(
      "active=true&deleted=false",
    );
  });

  it("skips undefined values", () => {
    expect(buildQueryString({ page: 1, filter: undefined })).toBe("page=1");
  });

  it("returns empty string for empty object", () => {
    expect(buildQueryString({})).toBe("");
  });

  it("returns empty string for invalid input", () => {
    expect(buildQueryString(null as unknown as Record<string, string>)).toBe(
      "",
    );
  });
});

//#endregion

//#region parseQueryString

describe("parseQueryString", () => {
  it("parses query string with leading ?", () => {
    expect(parseQueryString("?page=1&sort=asc")).toEqual({
      page: "1",
      sort: "asc",
    });
  });

  it("parses query string without leading ?", () => {
    expect(parseQueryString("page=1&sort=asc")).toEqual({
      page: "1",
      sort: "asc",
    });
  });

  it("decodes URL-encoded values", () => {
    expect(parseQueryString("search=hello%20world")).toEqual({
      search: "hello world",
    });
  });

  it("handles values with equals signs", () => {
    expect(parseQueryString("formula=a=b+c")).toEqual({ formula: "a=b+c" });
  });

  it("handles empty values", () => {
    expect(parseQueryString("empty=&filled=value")).toEqual({
      empty: "",
      filled: "value",
    });
  });

  it("returns empty object for empty input", () => {
    expect(parseQueryString("")).toEqual({});
    expect(parseQueryString("?")).toEqual({});
    expect(parseQueryString(null as unknown as string)).toEqual({});
  });
});

//#endregion

//#region joinPaths

describe("joinPaths", () => {
  it("joins simple paths", () => {
    expect(joinPaths("api", "users", "123")).toBe("api/users/123");
  });

  it("handles leading and trailing slashes", () => {
    expect(joinPaths("/api/", "/users/", "/123/")).toBe("/api/users/123");
    expect(joinPaths("/api", "users", "123")).toBe("/api/users/123");
  });

  it("joins URL with path segments", () => {
    expect(joinPaths("https://example.com", "api", "users")).toBe(
      "https://example.com/api/users",
    );
  });

  it("handles empty strings", () => {
    expect(joinPaths("", "api", "")).toBe("api");
    expect(joinPaths()).toBe("");
  });

  it("handles single path", () => {
    expect(joinPaths("/api")).toBe("/api");
    expect(joinPaths("api/")).toBe("api");
  });

  it("preserves protocol in URL", () => {
    expect(joinPaths("https://example.com/", "/api/")).toBe(
      "https://example.com/api",
    );
  });
});

//#endregion

//#region isImageUrl

describe("isImageUrl", () => {
  it("returns true for image extensions", () => {
    expect(isImageUrl("https://example.com/photo.jpg")).toBe(true);
    expect(isImageUrl("https://example.com/photo.jpeg")).toBe(true);
    expect(isImageUrl("https://example.com/photo.png")).toBe(true);
    expect(isImageUrl("https://example.com/photo.gif")).toBe(true);
    expect(isImageUrl("https://example.com/photo.webp")).toBe(true);
    expect(isImageUrl("https://example.com/icon.svg")).toBe(true);
    expect(isImageUrl("https://example.com/icon.bmp")).toBe(true);
    expect(isImageUrl("https://example.com/favicon.ico")).toBe(true);
    expect(isImageUrl("https://example.com/photo.avif")).toBe(true);
  });

  it("returns false for non-image extensions", () => {
    expect(isImageUrl("https://example.com/doc.pdf")).toBe(false);
    expect(isImageUrl("https://example.com/script.js")).toBe(false);
    expect(isImageUrl("https://example.com/page.html")).toBe(false);
  });

  it("handles case insensitivity", () => {
    expect(isImageUrl("https://example.com/photo.JPG")).toBe(true);
    expect(isImageUrl("https://example.com/photo.PNG")).toBe(true);
  });

  it("handles URLs with query strings", () => {
    expect(isImageUrl("https://example.com/photo.jpg?v=1")).toBe(true);
  });

  it("returns true for image data URLs", () => {
    expect(isImageUrl("data:image/png;base64,iVBORw0KGgo")).toBe(true);
    expect(isImageUrl("data:image/jpeg;base64,/9j/4AAQ")).toBe(true);
  });

  it("returns false for non-image data URLs", () => {
    expect(isImageUrl("data:text/plain;base64,SGVsbG8")).toBe(false);
  });

  it("returns false for empty or invalid input", () => {
    expect(isImageUrl("")).toBe(false);
    expect(isImageUrl(null as unknown as string)).toBe(false);
  });
});

//#endregion

//#region getUrlExtension

describe("getUrlExtension", () => {
  it("extracts extension from URL", () => {
    expect(getUrlExtension("https://example.com/image.png")).toBe("png");
    expect(getUrlExtension("https://example.com/file.tar.gz")).toBe("gz");
  });

  it("returns empty string for URLs without extension", () => {
    expect(getUrlExtension("https://example.com/page")).toBe("");
    expect(getUrlExtension("https://example.com/")).toBe("");
  });

  it("ignores query strings and fragments", () => {
    expect(getUrlExtension("https://example.com/image.png?v=1")).toBe("png");
    expect(getUrlExtension("https://example.com/image.png#section")).toBe(
      "png",
    );
  });

  it("handles relative paths", () => {
    expect(getUrlExtension("/path/to/file.txt")).toBe("txt");
    expect(getUrlExtension("file.pdf")).toBe("pdf");
  });

  it("returns empty string for invalid input", () => {
    expect(getUrlExtension("")).toBe("");
    expect(getUrlExtension(null as unknown as string)).toBe("");
  });

  it("handles edge cases", () => {
    expect(getUrlExtension("https://example.com/file.")).toBe("");
    expect(getUrlExtension("https://example.com/.hidden")).toBe("hidden");
  });
});

//#endregion

//#region isDataUrl

describe("isDataUrl", () => {
  it("returns true for data URLs", () => {
    expect(isDataUrl("data:image/png;base64,iVBORw0KGgo")).toBe(true);
    expect(isDataUrl("data:text/plain,Hello")).toBe(true);
    expect(isDataUrl("data:,")).toBe(true);
  });

  it("returns false for regular URLs", () => {
    expect(isDataUrl("https://example.com")).toBe(false);
    expect(isDataUrl("http://example.com/data:fake")).toBe(false);
  });

  it("handles case insensitivity", () => {
    expect(isDataUrl("DATA:image/png;base64,abc")).toBe(true);
    expect(isDataUrl("Data:text/plain,test")).toBe(true);
  });

  it("returns false for empty or invalid input", () => {
    expect(isDataUrl("")).toBe(false);
    expect(isDataUrl(null as unknown as string)).toBe(false);
  });

  it("handles whitespace", () => {
    expect(isDataUrl("  data:image/png;base64,abc")).toBe(true);
  });
});

//#endregion

//#region setQueryParam

describe("setQueryParam", () => {
  it("adds new query parameter", () => {
    expect(setQueryParam("https://example.com", "page", "2")).toBe(
      "https://example.com/?page=2",
    );
  });

  it("updates existing query parameter", () => {
    expect(setQueryParam("https://example.com?page=1", "page", "2")).toBe(
      "https://example.com/?page=2",
    );
  });

  it("preserves other query parameters", () => {
    const result = setQueryParam("https://example.com?sort=asc", "page", "2");
    expect(result).toContain("sort=asc");
    expect(result).toContain("page=2");
  });

  it("handles relative URLs", () => {
    expect(setQueryParam("/path", "key", "value")).toBe("/path?key=value");
    expect(setQueryParam("/path?existing=1", "key", "value")).toContain(
      "key=value",
    );
  });

  it("returns original URL for empty key", () => {
    expect(setQueryParam("https://example.com", "", "value")).toBe(
      "https://example.com",
    );
  });

  it("returns empty string for empty URL", () => {
    expect(setQueryParam("", "key", "value")).toBe("");
  });
});

//#endregion

//#region removeQueryParam

describe("removeQueryParam", () => {
  it("removes existing query parameter", () => {
    expect(
      removeQueryParam("https://example.com?page=1&sort=asc", "page"),
    ).toBe("https://example.com/?sort=asc");
  });

  it("removes last query parameter", () => {
    expect(removeQueryParam("https://example.com?page=1", "page")).toBe(
      "https://example.com/",
    );
  });

  it("handles non-existent parameter gracefully", () => {
    expect(removeQueryParam("https://example.com?page=1", "sort")).toBe(
      "https://example.com/?page=1",
    );
  });

  it("handles relative URLs", () => {
    expect(removeQueryParam("/path?key=value", "key")).toBe("/path");
    expect(removeQueryParam("/path?a=1&b=2", "a")).toBe("/path?b=2");
  });

  it("returns original URL for empty key", () => {
    expect(removeQueryParam("https://example.com?page=1", "")).toBe(
      "https://example.com?page=1",
    );
  });

  it("returns empty string for empty URL", () => {
    expect(removeQueryParam("", "key")).toBe("");
  });
});

//#endregion
