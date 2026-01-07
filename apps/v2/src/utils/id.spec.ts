import { generateId } from "./id";

describe("generateId", () => {
  it("should return a string", () => {
    const id = generateId();
    expect(typeof id).toBe("string");
  });

  it("should return a valid UUID v4 format (8-4-4-4-12)", () => {
    const id = generateId();
    const uuidV4Regex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    expect(id).toMatch(uuidV4Regex);
  });

  it("should have version 4 indicator", () => {
    const id = generateId();
    // The 13th character (index 14 after first hyphen) should be '4'
    expect(id.charAt(14)).toBe("4");
  });

  it("should have valid variant bits (8, 9, a, or b)", () => {
    const id = generateId();
    // The 17th character (index 19) should be 8, 9, a, or b
    const variantChar = id.charAt(19).toLowerCase();
    expect(["8", "9", "a", "b"]).toContain(variantChar);
  });

  it("should generate unique IDs", () => {
    const ids = new Set<string>();
    const count = 1000;

    for (let i = 0; i < count; i++) {
      ids.add(generateId());
    }

    expect(ids.size).toBe(count);
  });

  it("should return 36 character string", () => {
    const id = generateId();
    expect(id.length).toBe(36);
  });
});
