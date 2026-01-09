import {
  DEFAULT_PASSWORD_CONFIG,
  validatePassword,
  getPasswordStrength,
  getPasswordStrengthLabel,
  getPasswordRequirements,
  hasSequentialChars,
  hasRepeatedChars,
  isCommonPassword,
} from "./password";

//#region validatePassword

describe("validatePassword", () => {
  describe("minimum length", () => {
    it("fails when password is too short", () => {
      const result = validatePassword("short", { minimumLength: 10 });
      expect(result.valid).toBe(false);
      expect(
        result.requirements.find((r) => r.key === "minimumLength")?.met,
      ).toBe(false);
    });

    it("passes when password meets minimum length", () => {
      const result = validatePassword("longenoughpassword", {
        minimumLength: 10,
      });
      expect(
        result.requirements.find((r) => r.key === "minimumLength")?.met,
      ).toBe(true);
    });

    it("uses default minimum length of 8", () => {
      const shortResult = validatePassword("1234567");
      expect(
        shortResult.requirements.find((r) => r.key === "minimumLength")?.met,
      ).toBe(false);

      const validResult = validatePassword("12345678");
      expect(
        validResult.requirements.find((r) => r.key === "minimumLength")?.met,
      ).toBe(true);
    });
  });

  describe("maximum length", () => {
    it("passes for password at max length (72)", () => {
      const password = "a".repeat(72);
      const result = validatePassword(password, {
        requireLowercase: false,
        requireUppercase: false,
        requireNumber: false,
      });
      expect(
        result.requirements.find((r) => r.key === "maximumLength")?.met,
      ).toBe(true);
    });

    it("fails for password exceeding max length", () => {
      const password = "a".repeat(73);
      const result = validatePassword(password, {
        requireLowercase: false,
        requireUppercase: false,
        requireNumber: false,
      });
      expect(
        result.requirements.find((r) => r.key === "maximumLength")?.met,
      ).toBe(false);
    });
  });

  describe("lowercase requirement", () => {
    it("fails when lowercase is required but missing", () => {
      const result = validatePassword("UPPERCASE123", {
        requireLowercase: true,
        requireUppercase: false,
        requireNumber: false,
      });
      expect(result.valid).toBe(false);
      expect(result.requirements.find((r) => r.key === "lowercase")?.met).toBe(
        false,
      );
    });

    it("passes when lowercase is present", () => {
      const result = validatePassword("SOMELowercase", {
        requireLowercase: true,
        requireUppercase: false,
        requireNumber: false,
      });
      expect(result.requirements.find((r) => r.key === "lowercase")?.met).toBe(
        true,
      );
    });

    it("does not check lowercase when not required", () => {
      const result = validatePassword("ALLUPPERCASE", {
        requireLowercase: false,
        requireUppercase: false,
        requireNumber: false,
      });
      expect(
        result.requirements.find((r) => r.key === "lowercase"),
      ).toBeUndefined();
    });
  });

  describe("uppercase requirement", () => {
    it("fails when uppercase is required but missing", () => {
      const result = validatePassword("lowercase123", {
        requireLowercase: false,
        requireUppercase: true,
        requireNumber: false,
      });
      expect(result.valid).toBe(false);
      expect(result.requirements.find((r) => r.key === "uppercase")?.met).toBe(
        false,
      );
    });

    it("passes when uppercase is present", () => {
      const result = validatePassword("SomeUppercase", {
        requireLowercase: false,
        requireUppercase: true,
        requireNumber: false,
      });
      expect(result.requirements.find((r) => r.key === "uppercase")?.met).toBe(
        true,
      );
    });
  });

  describe("number requirement", () => {
    it("fails when number is required but missing", () => {
      const result = validatePassword("NoNumbers!", {
        requireLowercase: false,
        requireUppercase: false,
        requireNumber: true,
      });
      expect(result.valid).toBe(false);
      expect(result.requirements.find((r) => r.key === "number")?.met).toBe(
        false,
      );
    });

    it("passes when number is present", () => {
      const result = validatePassword("Has1Number", {
        requireLowercase: false,
        requireUppercase: false,
        requireNumber: true,
      });
      expect(result.requirements.find((r) => r.key === "number")?.met).toBe(
        true,
      );
    });
  });

  describe("symbol requirement", () => {
    it("fails when symbol is required but missing", () => {
      const result = validatePassword("NoSymbols123", {
        requireLowercase: false,
        requireUppercase: false,
        requireNumber: false,
        requireSymbol: true,
      });
      expect(result.valid).toBe(false);
      expect(result.requirements.find((r) => r.key === "symbol")?.met).toBe(
        false,
      );
    });

    it("passes when symbol is present", () => {
      const symbols = [
        "!",
        "@",
        "#",
        "$",
        "%",
        "^",
        "&",
        "*",
        "(",
        ")",
        "-",
        "_",
        "=",
        "+",
        " ",
      ];
      for (const sym of symbols) {
        const result = validatePassword(`Password${sym}`, {
          requireLowercase: false,
          requireUppercase: false,
          requireNumber: false,
          requireSymbol: true,
        });
        expect(result.requirements.find((r) => r.key === "symbol")?.met).toBe(
          true,
        );
      }
    });

    it("does not check symbol when not required (default)", () => {
      const result = validatePassword("NoSymbols");
      expect(
        result.requirements.find((r) => r.key === "symbol"),
      ).toBeUndefined();
    });
  });

  describe("combined requirements", () => {
    it("validates with all requirements enabled", () => {
      const result = validatePassword("MyStr0ng!Pass", {
        minimumLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireNumber: true,
        requireSymbol: true,
      });
      expect(result.valid).toBe(true);
      expect(result.requirements.every((r) => r.met)).toBe(true);
    });

    it("fails when any requirement is not met", () => {
      const result = validatePassword("mystr0ng!pass", {
        // no uppercase
        minimumLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireNumber: true,
        requireSymbol: true,
      });
      expect(result.valid).toBe(false);
      expect(result.requirements.find((r) => r.key === "uppercase")?.met).toBe(
        false,
      );
    });
  });
});

//#endregion validatePassword

//#region getPasswordStrength

describe("getPasswordStrength", () => {
  describe("very weak (0)", () => {
    it("returns 0 for passwords shorter than 6 characters", () => {
      expect(getPasswordStrength("")).toBe(0);
      expect(getPasswordStrength("abc")).toBe(0);
      expect(getPasswordStrength("12345")).toBe(0);
    });
  });

  describe("weak (1)", () => {
    it("returns 1 for passwords shorter than 8 characters", () => {
      expect(getPasswordStrength("abcdef")).toBe(1);
      expect(getPasswordStrength("1234567")).toBe(1);
    });

    it("returns 1 for passwords with only one character type", () => {
      expect(getPasswordStrength("abcdefgh")).toBe(1); // only lowercase
      expect(getPasswordStrength("ABCDEFGH")).toBe(1); // only uppercase
      expect(getPasswordStrength("12345678")).toBe(1); // only numbers
    });
  });

  describe("fair (2)", () => {
    it("returns 2 for 8+ chars with two character types", () => {
      expect(getPasswordStrength("Abcdefgh")).toBe(2); // lower + upper
      expect(getPasswordStrength("abcd1234")).toBe(2); // lower + number
      expect(getPasswordStrength("ABCD1234")).toBe(2); // upper + number
    });
  });

  describe("strong (3)", () => {
    it("returns 3 for 10+ chars with three character types", () => {
      expect(getPasswordStrength("Abcdefg123")).toBe(3); // 10 chars, 3 types
      expect(getPasswordStrength("MyPassword1")).toBe(3);
    });
  });

  describe("very strong (4)", () => {
    it("returns 4 for 12+ chars with four character types and no patterns", () => {
      expect(getPasswordStrength("MyStr0ng!Pass")).toBe(4);
      expect(getPasswordStrength("Tr0ub4dor&3X!")).toBe(4);
    });

    it("downgrades to 3 if sequential pattern present", () => {
      // "abc" is sequential
      expect(getPasswordStrength("Mabcyr0ng!Pass")).toBe(3);
    });

    it("downgrades to 3 if repeated pattern present", () => {
      // "aaa" is repeated
      expect(getPasswordStrength("Maaayr0ng!Pass")).toBe(3);
    });
  });
});

//#endregion getPasswordStrength

//#region getPasswordStrengthLabel

describe("getPasswordStrengthLabel", () => {
  it("returns correct labels for each strength level", () => {
    expect(getPasswordStrengthLabel(0)).toBe("Very weak");
    expect(getPasswordStrengthLabel(1)).toBe("Weak");
    expect(getPasswordStrengthLabel(2)).toBe("Fair");
    expect(getPasswordStrengthLabel(3)).toBe("Strong");
    expect(getPasswordStrengthLabel(4)).toBe("Very strong");
  });
});

//#endregion getPasswordStrengthLabel

//#region getPasswordRequirements

describe("getPasswordRequirements", () => {
  it("returns default requirements", () => {
    const reqs = getPasswordRequirements();
    expect(reqs).toContain("At least 8 characters");
    expect(reqs).toContain("At least one lowercase letter");
    expect(reqs).toContain("At least one uppercase letter");
    expect(reqs).toContain("At least one number");
    expect(reqs).not.toContain("At least one special character");
  });

  it("includes symbol requirement when enabled", () => {
    const reqs = getPasswordRequirements({ requireSymbol: true });
    expect(reqs).toContain("At least one special character");
  });

  it("respects custom minimum length", () => {
    const reqs = getPasswordRequirements({ minimumLength: 12 });
    expect(reqs).toContain("At least 12 characters");
    expect(reqs).not.toContain("At least 8 characters");
  });

  it("excludes requirements when disabled", () => {
    const reqs = getPasswordRequirements({
      requireLowercase: false,
      requireUppercase: false,
      requireNumber: false,
    });
    expect(reqs).not.toContain("At least one lowercase letter");
    expect(reqs).not.toContain("At least one uppercase letter");
    expect(reqs).not.toContain("At least one number");
  });
});

//#endregion getPasswordRequirements

//#region hasSequentialChars

describe("hasSequentialChars", () => {
  describe("ascending sequences", () => {
    it("detects abc pattern", () => {
      expect(hasSequentialChars("abc")).toBe(true);
      expect(hasSequentialChars("xyzabc")).toBe(true);
      expect(hasSequentialChars("passwordabc")).toBe(true);
    });

    it("detects 123 pattern", () => {
      expect(hasSequentialChars("123")).toBe(true);
      expect(hasSequentialChars("pass123word")).toBe(true);
    });

    it("detects longer sequences", () => {
      expect(hasSequentialChars("abcd", 4)).toBe(true);
      expect(hasSequentialChars("1234", 4)).toBe(true);
    });

    it("is case insensitive", () => {
      expect(hasSequentialChars("ABC")).toBe(true);
      expect(hasSequentialChars("XYZ")).toBe(true);
    });
  });

  describe("descending sequences", () => {
    it("detects cba pattern", () => {
      expect(hasSequentialChars("cba")).toBe(true);
      expect(hasSequentialChars("zyxcba")).toBe(true);
    });

    it("detects 321 pattern", () => {
      expect(hasSequentialChars("321")).toBe(true);
      expect(hasSequentialChars("pass321word")).toBe(true);
    });
  });

  describe("non-sequential passwords", () => {
    it("returns false for non-sequential passwords", () => {
      expect(hasSequentialChars("password")).toBe(false);
      expect(hasSequentialChars("MyP@ss!")).toBe(false);
      expect(hasSequentialChars("aXbYcZ")).toBe(false);
    });

    it("returns false when sequence is shorter than required", () => {
      expect(hasSequentialChars("ab", 3)).toBe(false);
      expect(hasSequentialChars("abc", 4)).toBe(false);
    });
  });

  describe("custom length parameter", () => {
    it("respects custom sequence length", () => {
      expect(hasSequentialChars("abc", 3)).toBe(true);
      expect(hasSequentialChars("abc", 4)).toBe(false);
      expect(hasSequentialChars("abcde", 5)).toBe(true);
    });
  });
});

//#endregion hasSequentialChars

//#region hasRepeatedChars

describe("hasRepeatedChars", () => {
  describe("repeated patterns", () => {
    it("detects aaa pattern", () => {
      expect(hasRepeatedChars("aaa")).toBe(true);
      expect(hasRepeatedChars("passsword")).toBe(true); // sss
      expect(hasRepeatedChars("helllo")).toBe(true); // lll
    });

    it("detects 111 pattern", () => {
      expect(hasRepeatedChars("111")).toBe(true);
      expect(hasRepeatedChars("pass111")).toBe(true);
    });

    it("detects longer repetitions", () => {
      expect(hasRepeatedChars("aaaa", 4)).toBe(true);
      expect(hasRepeatedChars("11111", 5)).toBe(true);
    });
  });

  describe("non-repeated passwords", () => {
    it("returns false for normal passwords", () => {
      expect(hasRepeatedChars("password")).toBe(false);
      expect(hasRepeatedChars("MyP@ss!")).toBe(false);
      expect(hasRepeatedChars("abcabc")).toBe(false);
    });

    it("returns false when repetition is shorter than required", () => {
      expect(hasRepeatedChars("aa", 3)).toBe(false);
      expect(hasRepeatedChars("aaa", 4)).toBe(false);
    });
  });

  describe("custom length parameter", () => {
    it("respects custom repetition length", () => {
      expect(hasRepeatedChars("aaa", 3)).toBe(true);
      expect(hasRepeatedChars("aaa", 4)).toBe(false);
      expect(hasRepeatedChars("aaaaa", 5)).toBe(true);
    });
  });

  describe("case sensitivity", () => {
    it("treats different cases as different characters", () => {
      expect(hasRepeatedChars("aAa")).toBe(false);
      expect(hasRepeatedChars("AaA")).toBe(false);
    });
  });
});

//#endregion hasRepeatedChars

//#region isCommonPassword

describe("isCommonPassword", () => {
  it("returns true for common passwords", () => {
    const commonPasswords = [
      "password",
      "123456",
      "12345678",
      "qwerty",
      "abc123",
      "letmein",
      "welcome",
      "passw0rd",
    ];

    for (const pwd of commonPasswords) {
      expect(isCommonPassword(pwd)).toBe(true);
    }
  });

  it("is case insensitive", () => {
    expect(isCommonPassword("PASSWORD")).toBe(true);
    expect(isCommonPassword("PassWord")).toBe(true);
    expect(isCommonPassword("QWERTY")).toBe(true);
  });

  it("returns false for uncommon passwords", () => {
    expect(isCommonPassword("MyUn1queP@ss")).toBe(false);
    expect(isCommonPassword("xK9#mNp2$qR")).toBe(false);
    expect(isCommonPassword("notinlist")).toBe(false);
  });
});

//#endregion isCommonPassword

//#region DEFAULT_PASSWORD_CONFIG

describe("DEFAULT_PASSWORD_CONFIG", () => {
  it("has correct default values", () => {
    expect(DEFAULT_PASSWORD_CONFIG).toEqual({
      minimumLength: 8,
      requireLowercase: true,
      requireUppercase: true,
      requireNumber: true,
      requireSymbol: false,
    });
  });
});

//#endregion DEFAULT_PASSWORD_CONFIG
