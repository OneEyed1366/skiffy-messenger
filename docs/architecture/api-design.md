# API Design Architecture

## Overview

This document defines the API design patterns and integration strategies for the Mattermost Platform Migration project, covering the transition from Electron Node.js APIs to Tauri Rust commands and external service integrations.

## API Architecture Strategy

### Three-Layer API Model

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React Native)                   │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ │
│  │   UI Components │ │   React Hooks   │ │  Service Layer  │ │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Integration Layer                     │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ │
│  │  Tauri Commands │ │  HTTP Clients   │ │ External APIs   │ │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend Implementation                    │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ │
│  │   Rust Backend  │ │ Mattermost API  │ │  External APIs  │ │
│  │   (Tauri)       │ │   (HTTP/REST)   │ │   (Various)     │ │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Tauri API Migration

### Command Pattern Architecture

**Migration from Electron IPC to Tauri Commands**:

```typescript
// Legacy Electron IPC Pattern
// vendor/desktop/src/main/app/app.ts
ipcMain.handle('file-system-read', async (event, path: string) => {
  try {
    return await fs.readFile(path, 'utf8');
  } catch (error) {
    throw new Error(`Failed to read file: ${error.message}`);
  }
});

// Modern Tauri Command Pattern
// apps/v2/src-tauri/src/commands/file_system.rs
#[tauri::command]
async fn read_file_content(path: String) -> Result<String, String> {
    match std::fs::read_to_string(&path) {
        Ok(content) => Ok(content),
        Err(error) => Err(format!("Failed to read file {}: {}", path, error)),
    }
}
```

### Frontend Integration Patterns

**Service Layer Architecture**:

```typescript
// apps/v2/src/services/FileSystemService.ts
import { invoke } from "@tauri-apps/api/core";

export class FileSystemService {
  static async readFile(path: string): Promise<string> {
    try {
      const content = await invoke("read_file_content", { path });
      return content;
    } catch (error) {
      throw new FileSystemError(`Failed to read file: ${error}`);
    }
  }

  static async writeFile(path: string, content: string): Promise<void> {
    try {
      await invoke("write_file_content", { path, content });
    } catch (error) {
      throw new FileSystemError(`Failed to write file: ${error}`);
    }
  }

  static async exists(path: string): Promise<boolean> {
    try {
      return await invoke("file_exists", { path });
    } catch (error) {
      return false;
    }
  }
}

export class FileSystemError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FileSystemError";
  }
}
```

**Hook Integration Pattern**:

```typescript
// apps/v2/src/hooks/useFileSystem.ts
import { useState, useCallback } from "react";
import { FileSystemService } from "@/services/FileSystemService";

export function useFileSystem() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const readFile = useCallback(async (path: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const content = await FileSystemService.readFile(path);
      return content;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const writeFile = useCallback(async (path: string, content: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await FileSystemService.writeFile(path, content);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    readFile,
    writeFile,
    isLoading,
    error,
  };
}
```

## Core API Domains

### 1. File System Operations

**Tauri Implementation**:

```rust
// apps/v2/src-tauri/src/commands/file_system.rs
use tauri::command;
use std::path::Path;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct FileInfo {
    pub path: String,
    pub size: u64,
    pub modified: u64,
    pub is_directory: bool,
}

#[command]
pub async fn read_file_content(path: String) -> Result<String, String> {
    match std::fs::read_to_string(&path) {
        Ok(content) => Ok(content),
        Err(error) => Err(format!("Failed to read file {}: {}", path, error)),
    }
}

#[command]
pub async fn write_file_content(path: String, content: String) -> Result<(), String> {
    match std::fs::write(&path, content) {
        Ok(_) => Ok(()),
        Err(error) => Err(format!("Failed to write file {}: {}", path, error)),
    }
}

#[command]
pub async fn get_file_info(path: String) -> Result<FileInfo, String> {
    match std::fs::metadata(&path) {
        Ok(metadata) => {
            Ok(FileInfo {
                path: path.clone(),
                size: metadata.len(),
                modified: metadata.modified()
                    .unwrap_or(std::time::SystemTime::UNIX_EPOCH)
                    .duration_since(std::time::SystemTime::UNIX_EPOCH)
                    .unwrap_or_default()
                    .as_secs(),
                is_directory: metadata.is_dir(),
            })
        }
        Err(error) => Err(format!("Failed to get file info for {}: {}", path, error)),
    }
}

#[command]
pub async fn list_directory(path: String) -> Result<Vec<FileInfo>, String> {
    match std::fs::read_dir(&path) {
        Ok(entries) => {
            let mut files = Vec::new();
            for entry in entries {
                if let Ok(entry) = entry {
                    if let Ok(info) = get_file_info(entry.path().to_string_lossy().to_string()).await {
                        files.push(info);
                    }
                }
            }
            Ok(files)
        }
        Err(error) => Err(format!("Failed to list directory {}: {}", path, error)),
    }
}
```

**Frontend Service**:

```typescript
// apps/v2/src/services/FileSystemService.ts
export interface FileInfo {
  path: string;
  size: number;
  modified: number;
  isDirectory: boolean;
}

export class FileSystemService {
  static async readFile(path: string): Promise<string> {
    return await invoke("read_file_content", { path });
  }

  static async writeFile(path: string, content: string): Promise<void> {
    await invoke("write_file_content", { path, content });
  }

  static async getFileInfo(path: string): Promise<FileInfo> {
    return await invoke("get_file_info", { path });
  }

  static async listDirectory(path: string): Promise<FileInfo[]> {
    return await invoke("list_directory", { path });
  }
}
```

### 2. Window Management

**Tauri Implementation**:

```rust
// apps/v2/src-tauri/src/commands/window_management.rs
use tauri::{command, Window, Manager};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct WindowPosition {
    pub x: i32,
    pub y: i32,
    pub width: u32,
    pub height: u32,
}

#[command]
pub async fn set_window_position(
    window: Window,
    position: WindowPosition,
) -> Result<(), String> {
    window
        .set_position(tauri::Position::Physical(tauri::PhysicalPosition {
            x: position.x,
            y: position.y,
        }))
        .map_err(|e| e.to_string())?;

    window
        .set_size(tauri::Size::Physical(tauri::PhysicalSize {
            width: position.width,
            height: position.height,
        }))
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[command]
pub async fn get_window_position(window: Window) -> Result<WindowPosition, String> {
    let position = window.outer_position().map_err(|e| e.to_string())?;
    let size = window.outer_size().map_err(|e| e.to_string())?;

    Ok(WindowPosition {
        x: position.x,
        y: position.y,
        width: size.width,
        height: size.height,
    })
}

#[command]
pub async fn minimize_window(window: Window) -> Result<(), String> {
    window.minimize().map_err(|e| e.to_string())
}

#[command]
pub async fn maximize_window(window: Window) -> Result<(), String> {
    window.maximize().map_err(|e| e.to_string())
}

#[command]
pub async fn close_window(window: Window) -> Result<(), String> {
    window.close().map_err(|e| e.to_string())
}
```

### 3. Desktop Notifications

**Tauri Implementation**:

```rust
// apps/v2/src-tauri/src/commands/notifications.rs
use tauri::command;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct NotificationOptions {
    pub title: String,
    pub body: String,
    pub icon: Option<String>,
    pub sound: Option<String>,
}

#[command]
pub async fn send_notification(options: NotificationOptions) -> Result<(), String> {
    // Implementation depends on tauri-plugin-notification
    // This is a simplified example
    println!("Notification: {} - {}", options.title, options.body);
    Ok(())
}

#[command]
pub async fn request_notification_permission() -> Result<bool, String> {
    // Platform-specific permission request
    Ok(true)
}
```

**Frontend Service**:

```typescript
// apps/v2/src/services/NotificationService.ts
import { invoke } from "@tauri-apps/api/core";

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  sound?: string;
}

export class NotificationService {
  static async send(options: NotificationOptions): Promise<void> {
    await invoke("send_notification", { options });
  }

  static async requestPermission(): Promise<boolean> {
    return await invoke("request_notification_permission");
  }
}
```

## External API Integration

### Mattermost Server API

**HTTP Client Architecture**:

```typescript
// apps/v2/src/services/api/MattermostAPI.ts
import { z } from "zod";

// Type-safe API response schemas
const UserSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  roles: z.string(),
  create_at: z.number(),
  update_at: z.number(),
});

const ChannelSchema = z.object({
  id: z.string(),
  name: z.string(),
  display_name: z.string(),
  type: z.enum(["O", "P", "D", "G"]),
  team_id: z.string(),
  create_at: z.number(),
  update_at: z.number(),
});

export type User = z.infer<typeof UserSchema>;
export type Channel = z.infer<typeof ChannelSchema>;

export class MattermostAPI {
  private baseUrl: string;
  private token: string | null = null;

  constructor(serverUrl: string) {
    this.baseUrl = `${serverUrl}/api/v4`;
  }

  async authenticate(loginId: string, password: string): Promise<User> {
    const response = await this.request("/users/login", {
      method: "POST",
      body: JSON.stringify({ login_id: loginId, password }),
    });

    const user = UserSchema.parse(response);
    this.token = response.token;
    return user;
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.request("/users/me");
    return UserSchema.parse(response);
  }

  async getChannels(teamId: string): Promise<Channel[]> {
    const response = await this.request(`/teams/${teamId}/channels`);
    return z.array(ChannelSchema).parse(response);
  }

  private async request(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new APIError(
        `Request failed: ${response.status} ${response.statusText}`,
        response.status,
      );
    }

    return await response.json();
  }
}

export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "APIError";
  }
}
```

**API Service Hook**:

```typescript
// apps/v2/src/hooks/useMattermostAPI.ts
import { useState, useCallback, useEffect } from "react";
import { MattermostAPI, User, Channel } from "@/services/api/MattermostAPI";

export function useMattermostAPI(serverUrl: string) {
  const [api] = useState(() => new MattermostAPI(serverUrl));
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const authenticate = useCallback(
    async (loginId: string, password: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const authenticatedUser = await api.authenticate(loginId, password);
        setUser(authenticatedUser);
        setIsAuthenticated(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Authentication failed");
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    },
    [api],
  );

  const logout = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  }, []);

  const fetchChannels = useCallback(
    async (teamId: string): Promise<Channel[]> => {
      setIsLoading(true);
      setError(null);

      try {
        const channels = await api.getChannels(teamId);
        return channels;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch channels",
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [api],
  );

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    authenticate,
    logout,
    fetchChannels,
  };
}
```

## Error Handling Architecture

### Standardized Error Types

```typescript
// apps/v2/src/types/errors.ts
export abstract class AppError extends Error {
  abstract readonly code: string;
  abstract readonly type: string;

  constructor(
    message: string,
    public readonly context?: Record<string, any>,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class APIError extends AppError {
  readonly type = "API_ERROR";

  constructor(
    message: string,
    public readonly code: string,
    public readonly status?: number,
    context?: Record<string, any>,
  ) {
    super(message, context);
  }
}

export class FileSystemError extends AppError {
  readonly type = "FILE_SYSTEM_ERROR";

  constructor(
    message: string,
    public readonly code: string,
    context?: Record<string, any>,
  ) {
    super(message, context);
  }
}

export class ValidationError extends AppError {
  readonly type = "VALIDATION_ERROR";

  constructor(
    message: string,
    public readonly code: string,
    public readonly field?: string,
    context?: Record<string, any>,
  ) {
    super(message, context);
  }
}
```

### Global Error Handler

```typescript
// apps/v2/src/services/ErrorService.ts
import { AppError } from "@/types/errors";

export class ErrorService {
  static handle(error: unknown): void {
    if (error instanceof AppError) {
      this.handleAppError(error);
    } else if (error instanceof Error) {
      this.handleGenericError(error);
    } else {
      this.handleUnknownError(error);
    }
  }

  private static handleAppError(error: AppError): void {
    console.error(`[${error.type}] ${error.code}: ${error.message}`, {
      context: error.context,
      stack: error.stack,
    });

    // Send to error reporting service
    this.reportError(error);
  }

  private static handleGenericError(error: Error): void {
    console.error(`[GENERIC_ERROR] ${error.message}`, {
      stack: error.stack,
    });

    this.reportError(error);
  }

  private static handleUnknownError(error: unknown): void {
    console.error("[UNKNOWN_ERROR]", error);
    this.reportError(new Error("Unknown error occurred"));
  }

  private static reportError(error: Error): void {
    // Integration with error reporting service
    // Could use Sentry, Bugsnag, or custom telemetry
  }
}
```

## API Testing Architecture

### Service Testing Patterns

```typescript
// apps/v2/src/services/__tests__/FileSystemService.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { FileSystemService } from "../FileSystemService";

// Mock Tauri invoke function
vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn(),
}));

describe("FileSystemService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("readFile", () => {
    it("should read file content successfully", async () => {
      const mockContent = "file content";
      const mockInvoke = vi.mocked(invoke);
      mockInvoke.mockResolvedValue(mockContent);

      const result = await FileSystemService.readFile("/path/to/file.txt");

      expect(result).toBe(mockContent);
      expect(mockInvoke).toHaveBeenCalledWith("read_file_content", {
        path: "/path/to/file.txt",
      });
    });

    it("should throw error when file read fails", async () => {
      const mockError = new Error("File not found");
      const mockInvoke = vi.mocked(invoke);
      mockInvoke.mockRejectedValue(mockError);

      await expect(
        FileSystemService.readFile("/invalid/path.txt"),
      ).rejects.toThrow("File not found");
    });
  });
});
```

## Performance Optimization

### API Response Caching

```typescript
// apps/v2/src/services/CacheService.ts
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export class CacheService {
  private cache = new Map<string, CacheEntry<any>>();

  set<T>(key: string, data: T, ttlMs: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }
}

// Usage in API services
export class CachedMattermostAPI extends MattermostAPI {
  private cache = new CacheService();

  async getChannels(teamId: string): Promise<Channel[]> {
    const cacheKey = `channels:${teamId}`;
    const cached = this.cache.get<Channel[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const channels = await super.getChannels(teamId);
    this.cache.set(cacheKey, channels, 2 * 60 * 1000); // 2 minutes TTL

    return channels;
  }
}
```

---

**Last Updated**: 2025-10-19  
**Version**: 1.0  
**Applies To**: Mattermost Platform Migration API Architecture
