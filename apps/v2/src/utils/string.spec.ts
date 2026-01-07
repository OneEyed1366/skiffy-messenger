import {
  createSafeId,
  isEmail,
  latinise,
  replaceHtmlEntities,
  toTitleCase,
} from "./string";

describe("latinise", () => {
  // Tests from vendor
  it("should return ascii version of Dév Spé", () => {
    expect(latinise("Dév Spé")).toEqual("Dev Spe");
  });

  it("should not replace any characters for ASCII alphanumerics", () => {
    expect(
      latinise(
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890",
      ),
    ).toEqual("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890");
  });

  it("should replace characters with diacritics with ascii equivalents", () => {
    expect(latinise("àáâãäåæçèéêëìíîïñòóôõöœùúûüýÿ")).toEqual(
      "aaaaaaaeceeeeiiiinooooooeuuuuyy",
    );
  });

  // Additional edge case tests
  it("should handle null input by returning empty string", () => {
    expect(latinise(null as unknown as string)).toEqual("");
  });

  it("should handle undefined input by returning empty string", () => {
    expect(latinise(undefined as unknown as string)).toEqual("");
  });

  it("should handle empty string", () => {
    expect(latinise("")).toEqual("");
  });

  it("should preserve spaces and punctuation", () => {
    expect(latinise("Héllo, Wörld!")).toEqual("Hello, World!");
  });

  it("should handle mixed ASCII and non-ASCII", () => {
    expect(latinise("Café résumé")).toEqual("Cafe resume");
  });

  it("should handle German umlauts", () => {
    expect(latinise("Größe")).toEqual("Grosse");
  });

  it("should handle Scandinavian characters", () => {
    expect(latinise("Ångström")).toEqual("Angstrom");
  });

  it("should pass through characters not in the map", () => {
    expect(latinise("你好")).toEqual("你好"); // Chinese characters pass through
  });
});

describe("replaceHtmlEntities", () => {
  it("should replace &amp; with &", () => {
    expect(replaceHtmlEntities("Tom &amp; Jerry")).toBe("Tom & Jerry");
  });

  it("should replace &lt; with <", () => {
    expect(replaceHtmlEntities("a &lt; b")).toBe("a < b");
  });

  it("should replace &gt; with >", () => {
    expect(replaceHtmlEntities("a &gt; b")).toBe("a > b");
  });

  it("should replace multiple entities", () => {
    expect(
      replaceHtmlEntities("&lt;div&gt;Hello &amp; World&lt;/div&gt;"),
    ).toBe("<div>Hello & World</div>");
  });

  it("should handle empty string", () => {
    expect(replaceHtmlEntities("")).toBe("");
  });

  it("should handle null/undefined", () => {
    expect(replaceHtmlEntities(null as unknown as string)).toBe("");
    expect(replaceHtmlEntities(undefined as unknown as string)).toBe("");
  });
});

describe("toTitleCase", () => {
  it("should convert lowercase to title case", () => {
    expect(toTitleCase("hello world")).toBe("Hello World");
  });

  it("should convert uppercase to title case", () => {
    expect(toTitleCase("HELLO WORLD")).toBe("Hello World");
  });

  it("should handle mixed case", () => {
    expect(toTitleCase("hElLo WoRlD")).toBe("Hello World");
  });

  it("should handle single word", () => {
    expect(toTitleCase("hello")).toBe("Hello");
  });

  it("should handle empty string", () => {
    expect(toTitleCase("")).toBe("");
  });

  it("should preserve numbers", () => {
    expect(toTitleCase("hello 123 world")).toBe("Hello 123 World");
  });

  it("should handle null/undefined", () => {
    expect(toTitleCase(null as unknown as string)).toBe("");
    expect(toTitleCase(undefined as unknown as string)).toBe("");
  });
});

describe("isEmail", () => {
  it("should return true for valid email", () => {
    expect(isEmail("test@example.com")).toBe(true);
  });

  it("should return true for email with subdomain", () => {
    expect(isEmail("test@mail.example.com")).toBe(true);
  });

  it("should return true for email with plus", () => {
    expect(isEmail("test+tag@example.com")).toBe(true);
  });

  it("should return false for email without @", () => {
    expect(isEmail("testexample.com")).toBe(false);
  });

  it("should return false for email with multiple @", () => {
    expect(isEmail("test@@example.com")).toBe(false);
  });

  it("should return false for email with space", () => {
    expect(isEmail("test @example.com")).toBe(false);
  });

  it("should return false for empty string", () => {
    expect(isEmail("")).toBe(false);
  });

  it("should return false for email with comma", () => {
    expect(isEmail("test,user@example.com")).toBe(false);
  });
});

describe("createSafeId", () => {
  it("should replace spaces with underscores", () => {
    expect(createSafeId("hello world")).toBe("hello_world");
  });

  it("should handle object with defaultMessage", () => {
    expect(createSafeId({ props: { defaultMessage: "Hello World" } })).toBe(
      "Hello_World",
    );
  });

  it("should handle multiple spaces", () => {
    expect(createSafeId("hello  world")).toBe("hello__world");
  });

  it("should handle string without spaces", () => {
    expect(createSafeId("helloworld")).toBe("helloworld");
  });

  it("should handle empty string", () => {
    expect(createSafeId("")).toBe("");
  });
});
