# Security Model Architecture

## Overview

This document defines the security architecture for the Mattermost Platform Migration project, covering the transition from Electron's Node.js security model to Tauri's Rust-based sandboxed security approach.

## Security Architecture Comparison

### Legacy Security Model (Electron)

**Node.js Runtime Security**:

- Full Node.js API access in main process
- Renderer process isolation via context isolation
- IPC communication between processes
- File system access through Node.js APIs
- External binary execution capabilities

**Security Concerns**:

```typescript
// vendor/desktop - Broad Node.js access
import { exec } from "child_process";
import * as fs from "fs";

// Main process has unrestricted access
exec("arbitrary-command", (error, stdout, stderr) => {
  // Potential security risk
});

// Direct file system access
fs.writeFileSync("/system/path", "data"); // No sandboxing
```

### Modern Security Model (Tauri)

**Rust-based Sandboxed Security**:

- Sandboxed execution environment
- Explicit permission-based API access
- Command-based IPC with type safety
- Capability-based security model
- Minimal attack surface

**Secure Implementation**:

```rust
// apps/v2/src-tauri - Restricted, permission-based access
#[tauri::command]
async fn read_config_file(path: String) -> Result<String, String> {
    // Validate path is within allowed directories
    if !is_path_allowed(&path) {
        return Err("Access denied: Path not allowed".to_string());
    }

    match std::fs::read_to_string(&path) {
        Ok(content) => Ok(content),
        Err(error) => Err(format!("Failed to read file: {}", error)),
    }
}
```

## Tauri Security Architecture

### Capability-Based Security Model

**Permission Configuration**:

```json
// apps/v2/src-tauri/capabilities/default.json
{
  "identifier": "default",
  "description": "Default app capabilities",
  "windows": ["main"],
  "permissions": [
    "fs:allow-read-text-file",
    "fs:allow-write-text-file",
    "fs:deny-write-file",
    "shell:allow-execute",
    "notification:allow-request-permission",
    "notification:allow-show"
  ]
}
```

**Runtime Permission Enforcement**:

```rust
// apps/v2/src-tauri/src/security/permissions.rs
use std::path::Path;

pub fn is_path_allowed(path: &str) -> bool {
    let allowed_directories = [
        std::env::var("HOME").unwrap_or_default() + "/.mattermost",
        std::env::var("APPDATA").unwrap_or_default() + "/Mattermost",
        "/tmp/mattermost",
    ];

    let path = Path::new(path);
    allowed_directories.iter().any(|allowed| {
        path.starts_with(allowed)
    })
}

pub fn validate_command_input<T>(input: &T) -> Result<(), String>
where
    T: serde::Serialize,
{
    // Validate input size to prevent DoS
    let serialized = serde_json::to_string(input)
        .map_err(|e| format!("Serialization error: {}", e))?;

    if serialized.len() > 1024 * 1024 { // 1MB limit
        return Err("Input too large".to_string());
    }

    Ok(())
}
```

### Secure Command Implementation

**Input Validation and Sanitization**:

```rust
// apps/v2/src-tauri/src/commands/secure_file_ops.rs
use serde::{Deserialize, Serialize};
use tauri::command;

#[derive(Deserialize)]
pub struct SecureFileRequest {
    path: String,
    content: Option<String>,
}

#[derive(Serialize)]
pub struct SecureFileResponse {
    success: bool,
    data: Option<String>,
    error: Option<String>,
}

#[command]
pub async fn secure_read_file(request: SecureFileRequest) -> SecureFileResponse {
    // Validate input
    if let Err(error) = validate_file_path(&request.path) {
        return SecureFileResponse {
            success: false,
            data: None,
            error: Some(error),
        };
    }

    // Perform operation with error handling
    match std::fs::read_to_string(&request.path) {
        Ok(content) => SecureFileResponse {
            success: true,
            data: Some(content),
            error: None,
        },
        Err(error) => SecureFileResponse {
            success: false,
            data: None,
            error: Some(format!("Read error: {}", error)),
        },
    }
}

fn validate_file_path(path: &str) -> Result<(), String> {
    // Check for path traversal attacks
    if path.contains("..") || path.contains("~") {
        return Err("Invalid path: Path traversal detected".to_string());
    }

    // Ensure path is within allowed directories
    if !is_path_allowed(path) {
        return Err("Access denied: Path not in allowed directories".to_string());
    }

    // Check file extension allowlist
    let allowed_extensions = [".json", ".txt", ".log", ".config"];
    if let Some(extension) = Path::new(path).extension() {
        if !allowed_extensions.iter().any(|&ext| ext == extension.to_str().unwrap_or("")) {
            return Err("Access denied: File type not allowed".to_string());
        }
    }

    Ok(())
}
```

## Frontend Security Implementation

### Secure Service Layer

**Type-Safe API Calls**:

```typescript
// apps/v2/src/services/SecureFileService.ts
import { invoke } from "@tauri-apps/api/core";
import * as v from "valibot";

// Input validation schemas
const FilePathSchema = v.pipe(
  v.string(),
  v.minLength(1),
  v.maxLength(500),
  v.regex(/^[a-zA-Z0-9\/_.-]+$/, "Invalid characters in path"),
);

const FileContentSchema = v.pipe(
  v.string(),
  v.maxLength(10 * 1024 * 1024), // 10MB limit
);

interface SecureFileRequest {
  path: string;
  content?: string;
}

interface SecureFileResponse {
  success: boolean;
  data?: string;
  error?: string;
}

export class SecureFileService {
  static async readFile(path: string): Promise<string> {
    // Validate input client-side
    const validatedPath = v.parse(FilePathSchema, path);

    const request: SecureFileRequest = { path: validatedPath };
    const response: SecureFileResponse = await invoke("secure_read_file", {
      request,
    });

    if (!response.success) {
      throw new SecurityError(response.error || "File read failed");
    }

    return response.data || "";
  }

  static async writeFile(path: string, content: string): Promise<void> {
    // Validate inputs
    const validatedPath = v.parse(FilePathSchema, path);
    const validatedContent = v.parse(FileContentSchema, content);

    const request: SecureFileRequest = {
      path: validatedPath,
      content: validatedContent,
    };

    const response: SecureFileResponse = await invoke("secure_write_file", {
      request,
    });

    if (!response.success) {
      throw new SecurityError(response.error || "File write failed");
    }
  }
}

export class SecurityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SecurityError";
  }
}
```

### Secure State Management

**Credential Storage Security**:

```typescript
// apps/v2/src/services/SecureStorageService.ts
import { invoke } from "@tauri-apps/api/core";

export interface StoredCredentials {
  serverUrl: string;
  userId: string;
  // Never store passwords - use tokens
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export class SecureStorageService {
  private static readonly STORAGE_KEY = "mattermost_credentials";

  static async storeCredentials(credentials: StoredCredentials): Promise<void> {
    // Validate token expiration
    if (credentials.expiresAt <= Date.now()) {
      throw new SecurityError("Cannot store expired credentials");
    }

    // Encrypt before storage
    const encrypted = await this.encrypt(JSON.stringify(credentials));

    await invoke("secure_store_data", {
      key: this.STORAGE_KEY,
      data: encrypted,
    });
  }

  static async retrieveCredentials(): Promise<StoredCredentials | null> {
    try {
      const encrypted: string = await invoke("secure_retrieve_data", {
        key: this.STORAGE_KEY,
      });

      if (!encrypted) return null;

      const decrypted = await this.decrypt(encrypted);
      const credentials: StoredCredentials = JSON.parse(decrypted);

      // Check if token is expired
      if (credentials.expiresAt <= Date.now()) {
        await this.clearCredentials();
        return null;
      }

      return credentials;
    } catch (error) {
      console.error("Failed to retrieve credentials:", error);
      return null;
    }
  }

  static async clearCredentials(): Promise<void> {
    await invoke("secure_delete_data", {
      key: this.STORAGE_KEY,
    });
  }

  private static async encrypt(data: string): Promise<string> {
    // Use Web Crypto API for encryption
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);

    const key = await crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt"],
    );

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      dataBuffer,
    );

    // In real implementation, securely store the key
    return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
  }

  private static async decrypt(encryptedData: string): Promise<string> {
    // Implement corresponding decryption
    // This is a simplified example
    return atob(encryptedData);
  }
}
```

## Network Security

### HTTPS Enforcement

**Secure HTTP Client Configuration**:

```typescript
// apps/v2/src/services/api/SecureHTTPClient.ts
export class SecureHTTPClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(serverUrl: string) {
    // Enforce HTTPS
    if (!serverUrl.startsWith("https://")) {
      throw new SecurityError("Only HTTPS connections are allowed");
    }

    this.baseURL = serverUrl;
    this.defaultHeaders = {
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest",
    };
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    // Validate URL to prevent SSRF
    if (!this.isValidURL(url)) {
      throw new SecurityError("Invalid URL detected");
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
      // Security headers
      credentials: "omit", // Don't send cookies
      mode: "cors",
      referrerPolicy: "no-referrer",
    });

    if (!response.ok) {
      throw new SecurityError(
        `HTTP ${response.status}: ${response.statusText}`,
      );
    }

    return await response.json();
  }

  private isValidURL(url: string): boolean {
    try {
      const parsedURL = new URL(url);

      // Only allow HTTPS
      if (parsedURL.protocol !== "https:") {
        return false;
      }

      // Prevent requests to private networks
      const hostname = parsedURL.hostname;
      if (
        hostname === "localhost" ||
        hostname.startsWith("127.") ||
        hostname.startsWith("10.") ||
        hostname.startsWith("192.168.") ||
        hostname.startsWith("172.")
      ) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }
}
```

### Certificate Validation

**Tauri Certificate Handling**:

```rust
// apps/v2/src-tauri/src/security/certificates.rs
use tauri::command;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct CertificateInfo {
    pub subject: String,
    pub issuer: String,
    pub valid_from: String,
    pub valid_to: String,
    pub fingerprint: String,
}

#[command]
pub async fn validate_server_certificate(url: String) -> Result<CertificateInfo, String> {
    // Implementation would verify certificate chain
    // This is a simplified example

    if !url.starts_with("https://") {
        return Err("Only HTTPS URLs are supported".to_string());
    }

    // In real implementation, would:
    // 1. Fetch certificate chain
    // 2. Validate against trusted CAs
    // 3. Check for revocation
    // 4. Verify hostname matching

    Ok(CertificateInfo {
        subject: "CN=example.com".to_string(),
        issuer: "CN=Trusted CA".to_string(),
        valid_from: "2024-01-01".to_string(),
        valid_to: "2025-01-01".to_string(),
        fingerprint: "SHA256:abcd1234...".to_string(),
    })
}
```

## Content Security Policy

### Frontend CSP Implementation

**Security Headers Configuration**:

```typescript
// apps/v2/src/security/ContentSecurityPolicy.ts
export const CSP_DIRECTIVES = {
  "default-src": ["'self'"],
  "script-src": ["'self'", "'unsafe-inline'"], // For React development
  "style-src": ["'self'", "'unsafe-inline'"], // For styled components
  "img-src": ["'self'", "data:", "https:"],
  "connect-src": ["'self'", "https:"],
  "font-src": ["'self'", "data:"],
  "media-src": ["'self'"],
  "object-src": ["'none'"],
  "base-uri": ["'self'"],
  "frame-ancestors": ["'none'"],
  "form-action": ["'self'"],
  "upgrade-insecure-requests": [],
} as const;

export function generateCSPHeader(): string {
  return Object.entries(CSP_DIRECTIVES)
    .map(([directive, sources]) => `${directive} ${sources.join(" ")}`)
    .join("; ");
}
```

## Security Monitoring and Logging

### Security Event Logging

**Security Audit Trail**:

```rust
// apps/v2/src-tauri/src/security/audit.rs
use serde::{Deserialize, Serialize};
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Serialize, Deserialize)]
pub struct SecurityEvent {
    pub timestamp: u64,
    pub event_type: SecurityEventType,
    pub user_id: Option<String>,
    pub details: String,
    pub severity: SecuritySeverity,
}

#[derive(Serialize, Deserialize)]
pub enum SecurityEventType {
    AuthenticationSuccess,
    AuthenticationFailure,
    UnauthorizedAccess,
    FileAccessDenied,
    CommandExecutionDenied,
    SuspiciousActivity,
}

#[derive(Serialize, Deserialize)]
pub enum SecuritySeverity {
    Low,
    Medium,
    High,
    Critical,
}

pub fn log_security_event(
    event_type: SecurityEventType,
    user_id: Option<String>,
    details: String,
    severity: SecuritySeverity,
) {
    let event = SecurityEvent {
        timestamp: SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs(),
        event_type,
        user_id,
        details,
        severity,
    };

    // Log to secure audit file
    if let Ok(json) = serde_json::to_string(&event) {
        eprintln!("[SECURITY_AUDIT] {}", json);

        // In production, also send to centralized logging
        // send_to_security_monitoring_service(event);
    }
}
```

### Frontend Security Monitoring

**Client-Side Security Monitoring**:

```typescript
// apps/v2/src/services/SecurityMonitoringService.ts
export enum SecurityEventType {
  SUSPICIOUS_ACTIVITY = "SUSPICIOUS_ACTIVITY",
  UNAUTHORIZED_ACCESS = "UNAUTHORIZED_ACCESS",
  DATA_VALIDATION_FAILURE = "DATA_VALIDATION_FAILURE",
  NETWORK_SECURITY_ERROR = "NETWORK_SECURITY_ERROR",
}

export interface SecurityEvent {
  type: SecurityEventType;
  message: string;
  context?: Record<string, any>;
  timestamp: number;
}

export class SecurityMonitoringService {
  private static events: SecurityEvent[] = [];

  static logSecurityEvent(
    type: SecurityEventType,
    message: string,
    context?: Record<string, any>,
  ): void {
    const event: SecurityEvent = {
      type,
      message,
      context,
      timestamp: Date.now(),
    };

    this.events.push(event);

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.warn("[SECURITY]", event);
    }

    // Send to backend for audit trail
    invoke("log_security_event", {
      eventType: type,
      details: message,
      context: JSON.stringify(context || {}),
    }).catch((err) => {
      console.error("Failed to log security event:", err);
    });
  }

  static getSecurityEvents(): SecurityEvent[] {
    return [...this.events];
  }

  static clearSecurityEvents(): void {
    this.events = [];
  }
}

// Usage in error boundaries and validation
export function useSecurityMonitoring() {
  const logEvent = useCallback(
    (
      type: SecurityEventType,
      message: string,
      context?: Record<string, any>,
    ) => {
      SecurityMonitoringService.logSecurityEvent(type, message, context);
    },
    [],
  );

  return { logEvent };
}
```

## Security Best Practices Summary

### Development Security Guidelines

1. **Input Validation**:
   - Validate all inputs client-side and server-side
   - Use schema validation libraries (valibot)
   - Sanitize data before processing

2. **Authentication & Authorization**:
   - Never store passwords in client
   - Use secure token-based authentication
   - Implement proper session management

3. **Data Protection**:
   - Encrypt sensitive data at rest
   - Use HTTPS for all network communication
   - Implement proper key management

4. **Error Handling**:
   - Don't expose sensitive information in error messages
   - Log security events for monitoring
   - Implement proper fallback mechanisms

5. **Code Security**:
   - Regular dependency updates
   - Static code analysis
   - Security-focused code reviews

### Migration Security Improvements

| Security Aspect    | Electron (Legacy)          | Tauri (Modern)               | Improvement   |
| ------------------ | -------------------------- | ---------------------------- | ------------- |
| **Sandboxing**     | Limited renderer isolation | Full Rust sandboxing         | ✅ Enhanced   |
| **API Access**     | Broad Node.js APIs         | Permission-based commands    | ✅ Restricted |
| **File System**    | Unrestricted access        | Path validation & allowlists | ✅ Controlled |
| **Network**        | Basic HTTP security        | HTTPS-only + validation      | ✅ Enforced   |
| **Process Model**  | Multi-process (complex)    | Single secure process        | ✅ Simplified |
| **Attack Surface** | Large (Node.js + Chromium) | Minimal (Rust + WebView)     | ✅ Reduced    |

---

**Last Updated**: 2025-10-19  
**Version**: 1.0  
**Applies To**: Mattermost Platform Migration Security Architecture
