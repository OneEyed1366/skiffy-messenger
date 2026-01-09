/**
 * URL manipulation utilities
 * Provides validation, parsing, and manipulation functions for URLs.
 */

//#region Constants

/**
 * Set of image file extensions for URL detection.
 * Used by isImageUrl to identify image resources.
 */
const IMAGE_EXTENSIONS = new Set([
  "png",
  "jpg",
  "jpeg",
  "gif",
  "webp",
  "svg",
  "bmp",
  "ico",
  "avif",
]);

//#endregion

//#region Validation

/**
 * Validates if a string is a valid URL.
 * Uses the URL constructor for validation.
 *
 * @param url - The string to validate
 * @returns true if the string is a valid URL
 *
 * @example
 * ```ts
 * isValidUrl('https://example.com') // true
 * isValidUrl('not-a-url') // false
 * isValidUrl('') // false
 * ```
 */
export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== "string") {
    return false;
  }

  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Checks if a URL is external (different host than baseUrl).
 *
 * @param url - URL to check
 * @param baseUrl - Base URL to compare against
 * @returns true if the URL points to a different host
 *
 * @example
 * ```ts
 * isExternalUrl('https://external.com/page', 'https://mysite.com') // true
 * isExternalUrl('https://mysite.com/page', 'https://mysite.com') // false
 * isExternalUrl('/relative/path', 'https://mysite.com') // false
 * ```
 */
export function isExternalUrl(url: string, baseUrl: string): boolean {
  if (!url || !baseUrl) {
    return false;
  }

  // Relative URLs are internal
  if (url.startsWith("/") || url.startsWith("#")) {
    return false;
  }

  try {
    const parsedUrl = new URL(url);
    const parsedBase = new URL(baseUrl);
    return parsedUrl.hostname !== parsedBase.hostname;
  } catch {
    // If parsing fails, treat as internal (likely relative URL)
    return false;
  }
}

/**
 * Checks if a URL is a data URL (data:...).
 *
 * @param url - URL to check
 * @returns true if the URL is a data URL
 *
 * @example
 * ```ts
 * isDataUrl('data:image/png;base64,iVBOR...') // true
 * isDataUrl('https://example.com/image.png') // false
 * ```
 */
export function isDataUrl(url: string): boolean {
  if (!url || typeof url !== "string") {
    return false;
  }
  return url.trim().toLowerCase().startsWith("data:");
}

/**
 * Checks if a URL points to an image file.
 * Based on extension: png, jpg, jpeg, gif, webp, svg, bmp, ico, avif.
 *
 * @param url - URL to check
 * @returns true if the URL appears to be an image
 *
 * @example
 * ```ts
 * isImageUrl('https://example.com/photo.jpg') // true
 * isImageUrl('https://example.com/doc.pdf') // false
 * isImageUrl('data:image/png;base64,...') // true (data URLs with image type)
 * ```
 */
export function isImageUrl(url: string): boolean {
  if (!url || typeof url !== "string") {
    return false;
  }

  // Check for data URLs with image mime type
  if (isDataUrl(url)) {
    return url.toLowerCase().startsWith("data:image/");
  }

  const extension = getUrlExtension(url).toLowerCase();
  return IMAGE_EXTENSIONS.has(extension);
}

//#endregion

//#region Extraction

/**
 * Extracts the domain (hostname) from a URL.
 *
 * @param url - URL to extract domain from
 * @returns hostname or null if invalid
 *
 * @example
 * ```ts
 * extractDomain('https://www.example.com/path') // 'www.example.com'
 * extractDomain('invalid-url') // null
 * ```
 */
export function extractDomain(url: string): string | null {
  if (!url || typeof url !== "string") {
    return null;
  }

  try {
    const parsed = new URL(url);
    return parsed.hostname;
  } catch {
    return null;
  }
}

/**
 * Gets the file extension from a URL path.
 *
 * @param url - URL to extract extension from
 * @returns Extension without dot, or empty string if none found
 *
 * @example
 * ```ts
 * getUrlExtension('https://example.com/image.png') // 'png'
 * getUrlExtension('https://example.com/page?v=1.0') // ''
 * getUrlExtension('https://example.com/file.tar.gz') // 'gz'
 * ```
 */
export function getUrlExtension(url: string): string {
  if (!url || typeof url !== "string") {
    return "";
  }

  try {
    // Try to parse as URL first
    const parsed = new URL(url);
    const pathname = parsed.pathname;

    // Get the last segment of the path
    const lastSegment = pathname.split("/").pop() ?? "";

    // Extract extension after last dot
    const dotIndex = lastSegment.lastIndexOf(".");
    if (dotIndex === -1 || dotIndex === lastSegment.length - 1) {
      return "";
    }

    return lastSegment.slice(dotIndex + 1);
  } catch {
    // Fallback for non-URL strings (e.g., relative paths)
    const cleanUrl = url.split("?")[0]?.split("#")[0] ?? "";
    const lastSegment = cleanUrl.split("/").pop() ?? "";
    const dotIndex = lastSegment.lastIndexOf(".");

    if (dotIndex === -1 || dotIndex === lastSegment.length - 1) {
      return "";
    }

    return lastSegment.slice(dotIndex + 1);
  }
}

//#endregion

//#region Transformation

/**
 * Normalizes a URL (lowercase protocol/host, remove trailing slash).
 *
 * @param url - URL to normalize
 * @returns Normalized URL string, or original if invalid
 *
 * @example
 * ```ts
 * normalizeUrl('HTTPS://EXAMPLE.COM/Path/') // 'https://example.com/Path'
 * normalizeUrl('https://example.com') // 'https://example.com'
 * ```
 */
export function normalizeUrl(url: string): string {
  if (!url || typeof url !== "string") {
    return "";
  }

  try {
    const parsed = new URL(url);

    // Build normalized URL with lowercase protocol and host
    const protocol = parsed.protocol.toLowerCase();
    const host = parsed.host.toLowerCase();
    const pathname = parsed.pathname;
    const search = parsed.search;
    const hash = parsed.hash;

    let normalized = `${protocol}//${host}${pathname}${search}${hash}`;

    // Remove trailing slash (unless it's just the origin)
    if (normalized.endsWith("/") && pathname !== "/") {
      normalized = normalized.slice(0, -1);
    }

    return normalized;
  } catch {
    // Return original if not a valid URL
    return url;
  }
}

/**
 * Joins URL path segments, handling slashes correctly.
 *
 * @param paths - Path segments to join
 * @returns Joined path string
 *
 * @example
 * ```ts
 * joinPaths('api', 'users', '123') // 'api/users/123'
 * joinPaths('/api/', '/users/', '/123/') // '/api/users/123'
 * joinPaths('https://example.com', 'api', 'users') // 'https://example.com/api/users'
 * ```
 */
export function joinPaths(...paths: string[]): string {
  if (paths.length === 0) {
    return "";
  }

  // Filter out empty strings
  const filtered = paths.filter((p) => p !== "");
  if (filtered.length === 0) {
    return "";
  }

  // Check if first path is a full URL
  const firstPath = filtered[0] ?? "";
  const hasProtocol = /^[a-z][a-z0-9+.-]*:\/\//i.test(firstPath);

  // Join paths, handling slashes
  const result = filtered.reduce((acc, path, index) => {
    if (index === 0) {
      return path;
    }

    const accEndsWithSlash = acc.endsWith("/");
    const pathStartsWithSlash = path.startsWith("/");

    if (accEndsWithSlash && pathStartsWithSlash) {
      return acc + path.slice(1);
    } else if (!accEndsWithSlash && !pathStartsWithSlash) {
      return acc + "/" + path;
    } else {
      return acc + path;
    }
  }, "");

  // Clean up trailing slashes (but preserve single trailing slash if originally present)
  if (hasProtocol) {
    try {
      const parsed = new URL(result);
      // Remove trailing slash unless it's just the origin
      if (parsed.pathname.endsWith("/") && parsed.pathname !== "/") {
        return result.replace(/\/+$/, "");
      }
      return result;
    } catch {
      // Fall through to default behavior
    }
  }

  // For non-URL paths, remove trailing slashes but preserve leading
  return result.replace(/\/+$/, "");
}

//#endregion

//#region Query String

/**
 * Builds a query string from an object.
 *
 * @param params - Key-value pairs to encode
 * @returns Query string without leading '?'
 *
 * @example
 * ```ts
 * buildQueryString({ page: 1, search: 'hello world' }) // 'page=1&search=hello%20world'
 * buildQueryString({ active: true, count: undefined }) // 'active=true'
 * ```
 */
export function buildQueryString(
  params: Record<string, string | number | boolean | undefined>,
): string {
  if (!params || typeof params !== "object") {
    return "";
  }

  const entries = Object.entries(params)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => {
      const encodedKey = encodeURIComponent(key);
      const encodedValue = encodeURIComponent(String(value));
      return `${encodedKey}=${encodedValue}`;
    });

  return entries.join("&");
}

/**
 * Parses a query string to an object.
 *
 * @param query - Query string (with or without leading '?')
 * @returns Object with parsed key-value pairs
 *
 * @example
 * ```ts
 * parseQueryString('?page=1&search=hello%20world') // { page: '1', search: 'hello world' }
 * parseQueryString('active=true') // { active: 'true' }
 * ```
 */
export function parseQueryString(query: string): Record<string, string> {
  if (!query || typeof query !== "string") {
    return {};
  }

  // Remove leading '?' if present
  const cleanQuery = query.startsWith("?") ? query.slice(1) : query;

  if (!cleanQuery) {
    return {};
  }

  const result: Record<string, string> = {};

  const pairs = cleanQuery.split("&");
  for (const pair of pairs) {
    const [key, ...valueParts] = pair.split("=");
    if (key) {
      const decodedKey = decodeURIComponent(key);
      // Handle values with '=' in them by rejoining
      const value = valueParts.join("=");
      result[decodedKey] = value ? decodeURIComponent(value) : "";
    }
  }

  return result;
}

/**
 * Adds or updates a query parameter in a URL.
 *
 * @param url - Original URL
 * @param key - Parameter key
 * @param value - Parameter value
 * @returns Updated URL string
 *
 * @example
 * ```ts
 * setQueryParam('https://example.com', 'page', '2') // 'https://example.com?page=2'
 * setQueryParam('https://example.com?page=1', 'page', '2') // 'https://example.com?page=2'
 * ```
 */
export function setQueryParam(url: string, key: string, value: string): string {
  if (!url || typeof url !== "string") {
    return "";
  }

  if (!key || typeof key !== "string") {
    return url;
  }

  try {
    const parsed = new URL(url);
    parsed.searchParams.set(key, value);
    return parsed.href;
  } catch {
    // Handle relative URLs or invalid URLs
    const [basePath = "", existingQuery = ""] = url.split("?");
    const params = parseQueryString(existingQuery);
    params[key] = value;
    const newQuery = buildQueryString(params);
    return newQuery ? `${basePath}?${newQuery}` : basePath;
  }
}

/**
 * Removes a query parameter from a URL.
 *
 * @param url - Original URL
 * @param key - Parameter key to remove
 * @returns Updated URL string
 *
 * @example
 * ```ts
 * removeQueryParam('https://example.com?page=1&sort=asc', 'page') // 'https://example.com?sort=asc'
 * removeQueryParam('https://example.com?page=1', 'page') // 'https://example.com'
 * ```
 */
export function removeQueryParam(url: string, key: string): string {
  if (!url || typeof url !== "string") {
    return "";
  }

  if (!key || typeof key !== "string") {
    return url;
  }

  try {
    const parsed = new URL(url);
    parsed.searchParams.delete(key);
    return parsed.href;
  } catch {
    // Handle relative URLs or invalid URLs
    const [basePath = "", existingQuery = ""] = url.split("?");
    const params = parseQueryString(existingQuery);
    delete params[key];
    const newQuery = buildQueryString(params);
    return newQuery ? `${basePath}?${newQuery}` : basePath;
  }
}

//#endregion
