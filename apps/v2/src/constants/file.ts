/**
 * File-related constants
 * Migrated from:
 * - vendor/desktop/webapp/channels/src/utils/constants.tsx
 * - vendor/desktop/webapp/channels/src/utils/file_utils.tsx
 */

import { type IFileType as IL0FileType } from "@/types";

//#region File Types

export const FILE_TYPES = {
  TEXT: "text",
  IMAGE: "image",
  AUDIO: "audio",
  VIDEO: "video",
  SPREADSHEET: "spreadsheet",
  CODE: "code",
  WORD: "word",
  PRESENTATION: "presentation",
  PDF: "pdf",
  PATCH: "patch",
  SVG: "svg",
  OTHER: "other",
} as const satisfies Record<string, IL0FileType>;

// Re-export from L0 (single source of truth)
export type { IFileType } from "@/types";

//#endregion

//#region File Size Units

// Re-export from L0 (single source of truth)
export { FILE_SIZES, type IFileSizeUnit } from "@/types";

//#endregion

//#region File Extensions by Category

export const TEXT_EXTENSIONS = ["txt", "rtf", "vtt"] as const;

export const IMAGE_EXTENSIONS = [
  "jpg",
  "gif",
  "bmp",
  "png",
  "jpeg",
  "tiff",
  "tif",
  "psd",
  "webp",
] as const;

export const AUDIO_EXTENSIONS = [
  "mp3",
  "wav",
  "wma",
  "m4a",
  "flac",
  "aac",
  "ogg",
  "m4r",
] as const;

export const VIDEO_EXTENSIONS = [
  "mp4",
  "avi",
  "webm",
  "mkv",
  "wmv",
  "mpg",
  "mov",
  "flv",
] as const;

export const PRESENTATION_EXTENSIONS = ["ppt", "pptx"] as const;

export const SPREADSHEET_EXTENSIONS = ["xlsx", "csv"] as const;

export const WORD_EXTENSIONS = ["doc", "docx"] as const;

export const PDF_EXTENSIONS = ["pdf"] as const;

export const PATCH_EXTENSIONS = ["patch"] as const;

export const SVG_EXTENSIONS = ["svg"] as const;

export const CODE_EXTENSIONS = [
  "applescript",
  "as",
  "atom",
  "bas",
  "bash",
  "boot",
  "c",
  "c++",
  "cake",
  "cc",
  "cjsx",
  "cl2",
  "clj",
  "cljc",
  "cljs",
  "cljs.hl",
  "cljscm",
  "cljx",
  "_coffee",
  "coffee",
  "cpp",
  "cs",
  "csharp",
  "cson",
  "css",
  "d",
  "dart",
  "delphi",
  "dfm",
  "di",
  "diff",
  "django",
  "docker",
  "dockerfile",
  "dpr",
  "erl",
  "ex",
  "exs",
  "f90",
  "f95",
  "freepascal",
  "fs",
  "fsharp",
  "gcode",
  "gemspec",
  "go",
  "groovy",
  "gyp",
  "h",
  "h++",
  "handlebars",
  "hbs",
  "hic",
  "hpp",
  "hs",
  "html",
  "html.handlebars",
  "html.hbs",
  "hx",
  "iced",
  "irb",
  "java",
  "jinja",
  "jl",
  "js",
  "json",
  "jsp",
  "jsx",
  "kt",
  "ktm",
  "kts",
  "lazarus",
  "less",
  "lfm",
  "lisp",
  "log",
  "lpr",
  "lua",
  "m",
  "mak",
  "matlab",
  "md",
  "mk",
  "mkd",
  "mkdown",
  "ml",
  "mm",
  "nc",
  "obj-c",
  "objc",
  "osascript",
  "pas",
  "pascal",
  "perl",
  "php",
  "php3",
  "php4",
  "php5",
  "php6",
  "pl",
  "plist",
  "podspec",
  "pp",
  "ps",
  "ps1",
  "py",
  "r",
  "rb",
  "rs",
  "rss",
  "ruby",
  "scala",
  "scm",
  "scpt",
  "scss",
  "sh",
  "sld",
  "sql",
  "st",
  "styl",
  "swift",
  "tex",
  "thor",
  "ts",
  "tsx",
  "v",
  "vb",
  "vbnet",
  "vbs",
  "veo",
  "xhtml",
  "xml",
  "xsl",
  "yaml",
  "yml",
  "zsh",
] as const;

//#endregion

//#region MIME Type Patterns

export const MIME_TYPE_PATTERNS = {
  SPREADSHEET: [
    "vnd.ms-excel",
    "spreadsheetml",
    "vnd.sun.xml.calc",
    "opendocument.spreadsheet",
  ],
  PRESENTATION: [
    "vnd.ms-powerpoint",
    "presentationml",
    "vnd.sun.xml.impress",
    "opendocument.presentation",
  ],
  WORD: [
    "msword",
    "vnd.ms-word",
    "officedocument.wordprocessingml",
    "application/x-mswrite",
  ],
} as const satisfies Record<string, readonly string[]>;

//#endregion

//#region File Upload Limits

export const FILE_UPLOAD_LIMITS = {
  MAX_FILES: 10,
  MAX_FILENAME_LENGTH: 35,
  CODE_PREVIEW_MAX_SIZE: 500000, // 500 KB
} as const;

//#endregion

//#region File Dimensions

export const FILE_DIMENSIONS = {
  THUMBNAIL_WIDTH: 128,
  THUMBNAIL_HEIGHT: 100,
  PREVIEWER_HEIGHT: 170,
  EXPANDABLE_INLINE_IMAGE_MIN_HEIGHT: 100,
  WEB_VIDEO_WIDTH: 640,
  WEB_VIDEO_HEIGHT: 480,
  MOBILE_VIDEO_WIDTH: 480,
  MOBILE_VIDEO_HEIGHT: 360,
} as const;

//#endregion

//#region Accepted File Types

export const ACCEPTED_FILE_TYPES = {
  /** Accepted static image types for profile pictures */
  STATIC_IMAGE: ".jpeg,.jpg,.png,.bmp",
  /** Accepted image types for emoji (includes gif) */
  EMOJI_IMAGE: ".jpeg,.jpg,.png,.gif",
  /** Accepted profile image MIME types */
  PROFILE_IMAGE_MIME: ["image/jpeg", "image/png", "image/bmp"],
} as const;

//#endregion

//#region License Extension

export const LICENSE_EXTENSION = ".mattermost-license";

//#endregion

//#region Image Type Constants

export const IMAGE_TYPE_GIF = "gif";

//#endregion
