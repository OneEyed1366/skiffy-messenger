/**
 * Password validation and strength utilities
 * @module utils/password
 */

//#region Types

/**
 * Configuration for password validation rules
 */
type IPasswordConfig = {
  minimumLength: number;
  requireLowercase: boolean;
  requireUppercase: boolean;
  requireNumber: boolean;
  requireSymbol: boolean;
};

/**
 * Password strength score from 0-4
 * 0 = very weak, 1 = weak, 2 = fair, 3 = strong, 4 = very strong
 */
type IPasswordStrength = 0 | 1 | 2 | 3 | 4;

/**
 * Individual password requirement check result
 */
type IPasswordRequirement = {
  key: string;
  message: string;
  met: boolean;
};

/**
 * Result of password validation
 */
type IPasswordValidationResult = {
  valid: boolean;
  requirements: IPasswordRequirement[];
};

//#endregion Types

//#region Constants

/**
 * Default password configuration
 * @example
 * ```ts
 * const config = { ...DEFAULT_PASSWORD_CONFIG, minimumLength: 12 };
 * ```
 */
export const DEFAULT_PASSWORD_CONFIG: IPasswordConfig = {
  minimumLength: 8,
  requireLowercase: true,
  requireUppercase: true,
  requireNumber: true,
  requireSymbol: false,
};

/**
 * Maximum password length (matches Mattermost)
 */
const MAX_PASSWORD_LENGTH = 72;

/**
 * Common passwords list (top ~20 for basic security check)
 */
const COMMON_PASSWORDS = new Set([
  "password",
  "123456",
  "12345678",
  "qwerty",
  "abc123",
  "monkey",
  "1234567",
  "letmein",
  "trustno1",
  "dragon",
  "baseball",
  "iloveyou",
  "master",
  "sunshine",
  "ashley",
  "passw0rd",
  "shadow",
  "123123",
  "654321",
  "welcome",
]);

/**
 * Regex patterns for character type detection
 */
const PATTERNS = {
  lowercase: /[a-z]/,
  uppercase: /[A-Z]/,
  number: /[0-9]/,
  // Symbol pattern from Mattermost vendor code
  symbol: /[ !"\\#$%&'()*+,\-./:;<=>?@[\]^_`|~]/,
} as const;

/**
 * Strength labels mapped to IPasswordStrength values
 */
const STRENGTH_LABELS: Record<IPasswordStrength, string> = {
  0: "Very weak",
  1: "Weak",
  2: "Fair",
  3: "Strong",
  4: "Very strong",
};

//#endregion Constants

//#region Validation Functions

/**
 * Validates password against configuration
 * @param password - Password to validate
 * @param config - Optional partial config (merged with defaults)
 * @returns Object with valid flag and list of requirements
 * @example
 * ```ts
 * const result = validatePassword("MyPass123");
 * if (!result.valid) {
 *   result.requirements.filter(r => !r.met).forEach(r => console.log(r.message));
 * }
 * ```
 */
export function validatePassword(
  password: string,
  config?: Partial<IPasswordConfig>,
): IPasswordValidationResult {
  const mergedConfig: IPasswordConfig = {
    ...DEFAULT_PASSWORD_CONFIG,
    ...config,
  };
  const requirements: IPasswordRequirement[] = [];

  // Length requirement
  requirements.push({
    key: "minimumLength",
    message: `At least ${mergedConfig.minimumLength} characters`,
    met: password.length >= mergedConfig.minimumLength,
  });

  // Maximum length check
  requirements.push({
    key: "maximumLength",
    message: `No more than ${MAX_PASSWORD_LENGTH} characters`,
    met: password.length <= MAX_PASSWORD_LENGTH,
  });

  // Lowercase requirement
  if (mergedConfig.requireLowercase) {
    requirements.push({
      key: "lowercase",
      message: "At least one lowercase letter",
      met: PATTERNS.lowercase.test(password),
    });
  }

  // Uppercase requirement
  if (mergedConfig.requireUppercase) {
    requirements.push({
      key: "uppercase",
      message: "At least one uppercase letter",
      met: PATTERNS.uppercase.test(password),
    });
  }

  // Number requirement
  if (mergedConfig.requireNumber) {
    requirements.push({
      key: "number",
      message: "At least one number",
      met: PATTERNS.number.test(password),
    });
  }

  // Symbol requirement
  if (mergedConfig.requireSymbol) {
    requirements.push({
      key: "symbol",
      message: "At least one special character",
      met: PATTERNS.symbol.test(password),
    });
  }

  const valid = requirements.every((req) => req.met);

  return { valid, requirements };
}

/**
 * Gets list of password requirements based on config
 * @param config - Optional partial config (merged with defaults)
 * @returns Array of requirement descriptions
 * @example
 * ```ts
 * const reqs = getPasswordRequirements({ requireSymbol: true });
 * // ["At least 8 characters", "At least one lowercase letter", ...]
 * ```
 */
export function getPasswordRequirements(
  config?: Partial<IPasswordConfig>,
): string[] {
  const mergedConfig: IPasswordConfig = {
    ...DEFAULT_PASSWORD_CONFIG,
    ...config,
  };
  const requirements: string[] = [];

  requirements.push(`At least ${mergedConfig.minimumLength} characters`);

  if (mergedConfig.requireLowercase) {
    requirements.push("At least one lowercase letter");
  }

  if (mergedConfig.requireUppercase) {
    requirements.push("At least one uppercase letter");
  }

  if (mergedConfig.requireNumber) {
    requirements.push("At least one number");
  }

  if (mergedConfig.requireSymbol) {
    requirements.push("At least one special character");
  }

  return requirements;
}

//#endregion Validation Functions

//#region Strength Functions

/**
 * Counts the number of character types present in a password
 */
function countCharacterTypes(password: string): number {
  let count = 0;
  if (PATTERNS.lowercase.test(password)) count++;
  if (PATTERNS.uppercase.test(password)) count++;
  if (PATTERNS.number.test(password)) count++;
  if (PATTERNS.symbol.test(password)) count++;
  return count;
}

/**
 * Gets password strength score (0-4)
 * Based on length, character variety, and patterns
 *
 * Scoring logic:
 * - 0 (very weak): length < 6
 * - 1 (weak): length < 8 OR only one character type
 * - 2 (fair): length >= 8 AND two character types
 * - 3 (strong): length >= 10 AND three character types
 * - 4 (very strong): length >= 12 AND four character types AND no patterns
 *
 * @param password - Password to analyze
 * @returns Strength score from 0-4
 * @example
 * ```ts
 * getPasswordStrength("abc"); // 0 (very weak)
 * getPasswordStrength("MyStr0ng!Pass"); // 4 (very strong)
 * ```
 */
export function getPasswordStrength(password: string): IPasswordStrength {
  const length = password.length;

  // Very weak: length < 6
  if (length < 6) {
    return 0;
  }

  const charTypes = countCharacterTypes(password);

  // Weak: length < 8 OR only one character type
  if (length < 8 || charTypes <= 1) {
    return 1;
  }

  // Check for patterns that reduce strength
  const hasPatterns =
    hasSequentialChars(password, 3) || hasRepeatedChars(password, 3);

  // Very strong: length >= 12 AND four character types AND no patterns
  if (length >= 12 && charTypes >= 4 && !hasPatterns) {
    return 4;
  }

  // Strong: length >= 10 AND three character types
  if (length >= 10 && charTypes >= 3) {
    return 3;
  }

  // Fair: length >= 8 AND two character types
  if (length >= 8 && charTypes >= 2) {
    return 2;
  }

  // Default to weak
  return 1;
}

/**
 * Gets human-readable strength label
 * @param strength - Password strength score (0-4)
 * @returns Label string
 * @example
 * ```ts
 * getPasswordStrengthLabel(0); // "Very weak"
 * getPasswordStrengthLabel(4); // "Very strong"
 * ```
 */
export function getPasswordStrengthLabel(strength: IPasswordStrength): string {
  return STRENGTH_LABELS[strength];
}

//#endregion Strength Functions

//#region Pattern Detection Functions

/**
 * Checks if password contains sequential characters (abc, 123, xyz)
 * @param password - Password to check
 * @param length - Minimum sequence length to detect (default: 3)
 * @returns True if sequential pattern found
 * @example
 * ```ts
 * hasSequentialChars("abc123"); // true (abc, 123)
 * hasSequentialChars("aXb1Yc"); // false
 * hasSequentialChars("abcd", 4); // true
 * hasSequentialChars("abc", 4); // false (sequence too short)
 * ```
 */
export function hasSequentialChars(
  password: string,
  length: number = 3,
): boolean {
  if (password.length < length) {
    return false;
  }

  const lowerPassword = password.toLowerCase();

  for (let i = 0; i <= lowerPassword.length - length; i++) {
    let isAscending = true;
    let isDescending = true;

    for (let j = 0; j < length - 1; j++) {
      const current = lowerPassword.charCodeAt(i + j);
      const next = lowerPassword.charCodeAt(i + j + 1);

      if (next !== current + 1) {
        isAscending = false;
      }
      if (next !== current - 1) {
        isDescending = false;
      }

      // Early exit if neither pattern holds
      if (!isAscending && !isDescending) {
        break;
      }
    }

    if (isAscending || isDescending) {
      return true;
    }
  }

  return false;
}

/**
 * Checks if password contains repeated characters (aaa, 111)
 * @param password - Password to check
 * @param length - Minimum repetition length to detect (default: 3)
 * @returns True if repeated pattern found
 * @example
 * ```ts
 * hasRepeatedChars("password"); // false
 * hasRepeatedChars("passsword"); // true (sss)
 * hasRepeatedChars("aa", 3); // false (too short)
 * hasRepeatedChars("aaa", 3); // true
 * ```
 */
export function hasRepeatedChars(
  password: string,
  length: number = 3,
): boolean {
  if (password.length < length) {
    return false;
  }

  for (let i = 0; i <= password.length - length; i++) {
    const char = password[i];
    let isRepeated = true;

    for (let j = 1; j < length; j++) {
      if (password[i + j] !== char) {
        isRepeated = false;
        break;
      }
    }

    if (isRepeated) {
      return true;
    }
  }

  return false;
}

/**
 * Checks if password is in common passwords list
 * (Basic check against top ~20 common passwords)
 * @param password - Password to check
 * @returns True if password is common
 * @example
 * ```ts
 * isCommonPassword("password"); // true
 * isCommonPassword("MyUn1queP@ss"); // false
 * ```
 */
export function isCommonPassword(password: string): boolean {
  return COMMON_PASSWORDS.has(password.toLowerCase());
}

//#endregion Pattern Detection Functions

//#region Type Exports

export type {
  IPasswordConfig,
  IPasswordStrength,
  IPasswordRequirement,
  IPasswordValidationResult,
};

//#endregion Type Exports
