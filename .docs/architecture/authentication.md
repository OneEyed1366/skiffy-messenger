# Authentication Architecture

## Overview

The application supports multiple authentication methods to match Mattermost server capabilities across all platforms (Mobile via Expo, Desktop via Tauri, Web via RN-Web).

| Method             | Protocol     | Platform Support | Notes                                   |
| ------------------ | ------------ | ---------------- | --------------------------------------- |
| **Email/Password** | REST API     | All              | Standard login with optional MFA        |
| **OAuth 2.0**      | OAuth + PKCE | All              | GitLab, Google, Office365, OpenID       |
| **SAML**           | SAML → OAuth | All              | Enterprise SSO via code-exchange bridge |
| **LDAP**           | REST API     | All              | Enterprise directory auth               |
| **Magic Link**     | REST API     | All              | Passwordless for guests                 |

## Authentication Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         AUTHENTICATION FLOW                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐                                                           │
│  │  Login UI    │                                                           │
│  │  Component   │                                                           │
│  └──────┬───────┘                                                           │
│         │                                                                   │
│         ▼                                                                   │
│  ┌──────────────────────────────────────────────────────────────────┐       │
│  │                    Authentication Method                         │       │
│  ├────────────┬────────────┬────────────┬────────────┬──────────────┤       │
│  │  Email/    │   OAuth    │   SAML     │   LDAP     │  Magic Link  │       │
│  │  Password  │   (PKCE)   │            │            │              │       │
│  └─────┬──────┴─────┬──────┴─────┬──────┴─────┬──────┴──────┬───────┘       │
│        │            │            │            │             │               │
│        ▼            ▼            ▼            ▼             ▼               │
│  ┌──────────┐ ┌───────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐         │
│  │  POST    │ │  System   │ │  System  │ │  POST    │ │  POST     │         │
│  │ /login   │ │  Browser  │ │  Browser │ │ /login   │ │ /login/   │         │
│  │          │ │  + PKCE   │ │  + Code  │ │ ldap_only│ │ one_time  │         │
│  └────┬─────┘ └─────┬─────┘ └────┬─────┘ └────┬─────┘ └─────┬─────┘         │
│       │             │            │            │             │               │
│       └─────────────┴────────────┴────────────┴─────────────┘               │
│                                  │                                          │
│                                  ▼                                          │
│                     ┌────────────────────────┐                              │
│                     │   Token + UserProfile  │                              │
│                     │   (Response Header)    │                              │
│                     └───────────┬────────────┘                              │
│                                 │                                           │
│                                 ▼                                           │
│                     ┌────────────────────────┐                              │
│                     │   Store Token          │                              │
│                     │   (SecureStore/Cookie) │                              │
│                     └───────────┬────────────┘                              │
│                                 │                                           │
│                                 ▼                                           │
│                     ┌────────────────────────┐                              │
│                     │   Set Auth State       │                              │
│                     │   (Zustand + TQ Cache) │                              │
│                     └────────────────────────┘                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## RFC 8252: OAuth 2.0 for Native Apps

The application follows [RFC 8252](https://tools.ietf.org/html/rfc8252) best practices for native app OAuth:

| Requirement                     | Implementation                                     |
| ------------------------------- | -------------------------------------------------- |
| **Use external browser**        | `expo-web-browser` (in-app browser tabs)           |
| **PKCE required**               | `expo-auth-session` with `usePKCE: true` (default) |
| **No secrets in app**           | No client secret stored; public client only        |
| **Platform-specific redirects** | Custom URI scheme + Universal/App Links            |

### Why NOT Embedded WebViews

| Risk                  | Description                                          |
| --------------------- | ---------------------------------------------------- |
| **Credential theft**  | Host app can intercept keystrokes in login form      |
| **Session hijacking** | App can read cookies and inject JavaScript           |
| **No SSO**            | WebView doesn't share auth state with system browser |
| **Phishing risk**     | User can't verify URL bar / certificate              |

**RFC 8252 Section 8.12**: "Native apps MUST NOT use embedded user-agents to perform authorization requests."

---

## OAuth 2.0 with PKCE Flow

### Sequence Diagram

```
┌──────────┐                              ┌──────────┐                    ┌──────────────┐
│   App    │                              │ Browser  │                    │  Auth Server │
└────┬─────┘                              └────┬─────┘                    └──────┬───────┘
     │                                         │                                 │
     │ 1. Generate code_verifier (v)           │                                 │
     │    Hash to code_challenge ($)           │                                 │
     │                                         │                                 │
     │ 2. Open browser with auth URL           │                                 │
     │    includes: client_id, $, redirect_uri │                                 │
     │────────────────────────────────────────▶│                                 │
     │                                         │ 3. GET /authorize               │
     │                                         │────────────────────────────────▶│
     │                                         │                                 │
     │                                         │ 4. Login form                   │
     │                                         │◀────────────────────────────────│
     │                                         │                                 │
     │                                         │ 5. User authenticates           │
     │                                         │────────────────────────────────▶│
     │                                         │                                 │
     │                                         │ 6. Redirect with code (α)       │
     │ 7. Receive redirect                     │◀────────────────────────────────│
     │◀────────────────────────────────────────│                                 │
     │    (via deep link / custom scheme)      │                                 │
     │                                         │                                 │
     │ 8. POST /token                          │                                 │
     │    with: code (α), code_verifier (v)    │                                 │
     │─────────────────────────────────────────────────────────────────────────▶ │
     │                                         │                                 │
     │ 9. Validate: hash(v) === $ ?            │                                 │
     │    Return: access_token, refresh_token  │                                 │
     │◀───────────────────────────────────────────────────────────────────────── │
     │                                         │                                 │
```

### PKCE Security

| Value            | Purpose                                             |
| ---------------- | --------------------------------------------------- |
| `code_verifier`  | Random string (43-128 chars) generated by app       |
| `code_challenge` | SHA256 hash of verifier, sent in authorize URL      |
| `auth_code`      | One-time code from server, useless without verifier |

**Protection**: Even if a malicious app intercepts the auth code via redirect, it cannot exchange it for tokens without the original `code_verifier`.

---

## Expo Auth Session Implementation

### Dependencies

```bash
npx expo install expo-auth-session expo-crypto expo-web-browser expo-secure-store
```

### Redirect URI Configuration

```typescript
// src/services/auth/redirectUri.ts
import { makeRedirectUri } from "expo-auth-session";
import { Platform } from "react-native";

export const AUTH_REDIRECT_URI = makeRedirectUri({
  scheme: "com.retrievly.app",
  path: "auth/callback",
});

// Results:
// iOS/Android: com.retrievly.app://auth/callback
// Web:         https://yoursite.com/auth/callback
// Dev:         exp://192.168.1.x:8081/--/auth/callback
```

### App Configuration (app.json)

```json
{
  "expo": {
    "scheme": "com.retrievly.app",
    "ios": {
      "bundleIdentifier": "com.retrievly.app",
      "associatedDomains": ["applinks:your-mattermost.com"]
    },
    "android": {
      "package": "com.retrievly.app",
      "intentFilters": [
        {
          "action": "VIEW",
          "autoVerify": true,
          "data": [
            {
              "scheme": "com.retrievly.app",
              "host": "*",
              "pathPrefix": "/auth"
            }
          ],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    }
  }
}
```

### OAuth Hook Implementation

```typescript
// src/services/auth/useOAuthLogin.ts
import { useEffect } from "react";
import * as WebBrowser from "expo-web-browser";
import {
  useAuthRequest,
  makeRedirectUri,
  exchangeCodeAsync,
  ResponseType,
} from "expo-auth-session";
import { tokenStorage } from "@/stores/auth/storage";
import { useAuthStore } from "@/stores/auth/authStore";

// Required to close browser popup on web
WebBrowser.maybeCompleteAuthSession();

type IOAuthProvider = "gitlab" | "google" | "office365" | "openid";

type IProviderConfig = {
  authorizationEndpoint: string;
  tokenEndpoint: string;
};

const getProviderConfig = (
  serverUrl: string,
  provider: IOAuthProvider,
): IProviderConfig => ({
  authorizationEndpoint: `${serverUrl}/oauth/${provider}/login`,
  tokenEndpoint: `${serverUrl}/oauth/${provider}/access_token`,
});

export function useOAuthLogin(serverUrl: string, provider: IOAuthProvider) {
  const setCurrentUser = useAuthStore((s) => s.setCurrentUser);

  const redirectUri = makeRedirectUri({
    scheme: "com.retrievly.app",
    path: "auth/callback",
  });

  const discovery = getProviderConfig(serverUrl, provider);

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: "mattermost-mobile",
      scopes: ["openid", "profile", "email"],
      redirectUri,
      responseType: ResponseType.Code,
      usePKCE: true, // Default, but explicit for clarity
    },
    discovery,
  );

  useEffect(() => {
    if (response?.type === "success") {
      handleAuthResponse(response);
    }
  }, [response]);

  const handleAuthResponse = async (authResponse: typeof response) => {
    if (authResponse?.type !== "success" || !request?.codeVerifier) return;

    const { code } = authResponse.params;

    try {
      // Exchange code for tokens
      const tokenResponse = await exchangeCodeAsync(
        {
          clientId: "mattermost-mobile",
          code,
          redirectUri,
          extraParams: {
            code_verifier: request.codeVerifier,
          },
        },
        { tokenEndpoint: discovery.tokenEndpoint },
      );

      // Store tokens securely
      await tokenStorage.setToken(tokenResponse.accessToken);
      if (tokenResponse.refreshToken) {
        await tokenStorage.setRefreshToken(tokenResponse.refreshToken);
      }

      // Fetch user profile and update state
      // ... (call getMe() and setCurrentUser)
    } catch (error) {
      console.error("Token exchange failed:", error);
      throw error;
    }
  };

  const login = async () => {
    if (!request) throw new Error("Auth request not ready");

    // Warm up browser for faster auth (Android)
    await WebBrowser.warmUpAsync();

    try {
      const result = await promptAsync();
      return result;
    } finally {
      await WebBrowser.coolDownAsync();
    }
  };

  return {
    login,
    isReady: !!request,
    isLoading: !request,
  };
}
```

---

## SAML Authentication on Mobile

### The Challenge

SAML was designed for web browsers, not mobile apps:

| Issue              | Problem                                       |
| ------------------ | --------------------------------------------- |
| **POST binding**   | SAML responses use POST, not URL query params |
| **Large payloads** | SAML assertions are XML, often 10KB+          |
| **No native SDK**  | No official SAML library for React Native     |
| **Cookie-based**   | SAML relies on session cookies                |

### Solution: Mattermost Code-Exchange Bridge

Mattermost provides a mobile-friendly SAML flow that converts SAML to OAuth-like code exchange:

```
┌──────────┐              ┌──────────┐              ┌──────────┐              ┌──────────┐
│   App    │              │ Browser  │              │ Mattermost│              │ SAML IdP │
└────┬─────┘              └────┬─────┘              └─────┬────┘              └────┬─────┘
     │                         │                          │                        │
     │ 1. Open /login/sso/saml │                          │                        │
     │────────────────────────▶│                          │                        │
     │    ?redirect_to=app://  │                          │                        │
     │                         │ 2. Redirect to SAML      │                        │
     │                         │─────────────────────────▶│                        │
     │                         │                          │ 3. SAML Request        │
     │                         │                          │───────────────────────▶│
     │                         │                          │                        │
     │                         │                          │ 4. User authenticates  │
     │                         │                          │◀───────────────────────│
     │                         │                          │                        │
     │                         │                          │ 5. SAML Response       │
     │                         │◀─────────────────────────│ (via server)           │
     │                         │                          │                        │
     │ 6. Redirect to app      │                          │                        │
     │    with code            │                          │                        │
     │◀────────────────────────│                          │                        │
     │                         │                          │                        │
     │ 7. POST /login/sso/code-exchange                   │                        │
     │───────────────────────────────────────────────────▶│                        │
     │                         │                          │                        │
     │ 8. Token + UserProfile  │                          │                        │
     │◀───────────────────────────────────────────────────│                        │
     │                         │                          │                        │
```

### SAML Implementation

```typescript
// src/services/auth/useSAMLLogin.ts
import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from "expo-auth-session";
import { tokenStorage } from "@/stores/auth/storage";
import { useAuthStore } from "@/stores/auth/authStore";

WebBrowser.maybeCompleteAuthSession();

export function useSAMLLogin(serverUrl: string) {
  const setCurrentUser = useAuthStore((s) => s.setCurrentUser);

  const login = async () => {
    const redirectUri = makeRedirectUri({
      scheme: "com.retrievly.app",
      path: "auth/saml-callback",
    });

    // Construct SAML login URL with redirect
    const samlUrl = new URL(`${serverUrl}/login/sso/saml`);
    samlUrl.searchParams.set("redirect_to", redirectUri);

    // Open system browser for SAML flow
    const result = await WebBrowser.openAuthSessionAsync(
      samlUrl.toString(),
      redirectUri,
    );

    if (result.type !== "success") {
      throw new Error("SAML login cancelled");
    }

    // Extract code from callback URL
    const callbackUrl = new URL(result.url);
    const code = callbackUrl.searchParams.get("code");

    if (!code) {
      throw new Error("No code in SAML callback");
    }

    // Exchange code for session token
    const response = await fetch(
      `${serverUrl}/api/v4/users/login/sso/code-exchange`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      },
    );

    if (!response.ok) {
      throw new Error("SAML code exchange failed");
    }

    // Token is in response header
    const token = response.headers.get("Token");
    if (!token) {
      throw new Error("No token in response");
    }

    // Store token and user profile
    await tokenStorage.setToken(token);
    const user = await response.json();
    setCurrentUser(user.id);

    return { token, user };
  };

  return { login };
}
```

---

## Tauri Desktop Deep Linking

For OAuth redirects on the Tauri desktop app:

### Configuration (tauri.conf.json)

```json
{
  "plugins": {
    "deep-link": {
      "desktop": {
        "schemes": ["com.retrievly.app"]
      }
    }
  }
}
```

### Rust Setup (lib.rs)

```rust
use tauri_plugin_deep_link::DeepLinkExt;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_single_instance::init(|_app, argv, _cwd| {
            // Handle deep link from new instance
            println!("Deep link received: {:?}", argv);
        }))
        .setup(|app| {
            // Register schemes at runtime (for dev mode)
            #[cfg(any(windows, target_os = "linux"))]
            app.deep_link().register_all()?;

            // Listen for deep links
            app.deep_link().on_open_url(|event| {
                println!("OAuth callback: {:?}", event.urls());
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### JavaScript Handler

```typescript
// src/services/auth/tauriDeepLink.ts
import { onOpenUrl, getCurrent } from "@tauri-apps/plugin-deep-link";

export async function setupOAuthListener(
  onCallback: (code: string) => Promise<void>,
) {
  // Check if app was opened via deep link
  const startUrls = await getCurrent();
  if (startUrls?.length) {
    await handleOAuthCallback(startUrls[0], onCallback);
  }

  // Listen for future deep links
  await onOpenUrl(async (urls) => {
    if (urls.length) {
      await handleOAuthCallback(urls[0], onCallback);
    }
  });
}

async function handleOAuthCallback(
  urlString: string,
  onCallback: (code: string) => Promise<void>,
) {
  const url = new URL(urlString);

  // Check if this is an auth callback
  if (url.pathname.includes("/auth/callback")) {
    const code = url.searchParams.get("code");
    if (code) {
      await onCallback(code);
    }
  }
}
```

---

## Token Storage Strategy

### Platform-Specific Storage

| Platform            | Storage Method                 | Library                   |
| ------------------- | ------------------------------ | ------------------------- |
| **iOS**             | Keychain                       | `expo-secure-store`       |
| **Android**         | EncryptedSharedPreferences     | `expo-secure-store`       |
| **Web**             | HTTP-only Cookies (server-set) | Native `document.cookie`  |
| **Tauri (Desktop)** | OS Keyring                     | `tauri-plugin-stronghold` |

### Token Storage Implementation

```typescript
// src/stores/auth/storage.ts
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const TOKEN_KEY = "auth_token";
const REFRESH_TOKEN_KEY = "refresh_token";

export const tokenStorage = {
  async getToken(): Promise<string | null> {
    if (Platform.OS === "web") {
      // Web: token is in HTTP-only cookie (server-managed)
      // We track auth state via API calls, not local storage
      return null;
    }
    return SecureStore.getItemAsync(TOKEN_KEY);
  },

  async setToken(token: string): Promise<void> {
    if (Platform.OS === "web") {
      // Web: cookie set by server response
      return;
    }
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  },

  async getRefreshToken(): Promise<string | null> {
    if (Platform.OS === "web") return null;
    return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  },

  async setRefreshToken(token: string): Promise<void> {
    if (Platform.OS === "web") return;
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
  },

  async clearAll(): Promise<void> {
    if (Platform.OS === "web") {
      // Web: clear cookies
      document.cookie =
        "MMUSERID=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/";
      document.cookie = "MMCSRF=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/";
      return;
    }
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  },
};
```

---

## Auth State Management (Zustand)

```typescript
// src/stores/auth/authStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

type IAuthState = {
  currentUserId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  serverUrl: string | null;

  // Actions
  setCurrentUser: (userId: string) => void;
  setServerUrl: (url: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
};

const storage =
  Platform.OS === "web"
    ? createJSONStorage(() => localStorage)
    : createJSONStorage(() => AsyncStorage);

export const useAuthStore = create<IAuthState>()(
  persist(
    (set, get) => ({
      currentUserId: null,
      isAuthenticated: false,
      isLoading: true,
      serverUrl: null,

      setCurrentUser: (userId) =>
        set({
          currentUserId: userId,
          isAuthenticated: true,
          isLoading: false,
        }),

      setServerUrl: (url) => set({ serverUrl: url }),

      logout: () =>
        set({
          currentUserId: null,
          isAuthenticated: false,
          isLoading: false,
        }),

      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: "auth-storage",
      storage,
      partialize: (state) => ({
        currentUserId: state.currentUserId,
        serverUrl: state.serverUrl,
      }),
    },
  ),
);
```

---

## MFA (Multi-Factor Authentication)

### Detection and Handling

```typescript
// src/services/auth/mfa.ts
type ILoginError = {
  server_error_id: string;
  message: string;
};

export function isMfaRequired(error: ILoginError): boolean {
  return error.server_error_id === "mfa.validate_token.authenticate.app_error";
}

// Usage in login flow
async function login(email: string, password: string, mfaToken?: string) {
  try {
    const result = await authApi.login({
      login_id: email,
      password,
      token: mfaToken,
    });
    return result;
  } catch (error) {
    if (isMfaRequired(error)) {
      // Show MFA input UI, then retry with token
      throw { type: "MFA_REQUIRED", error };
    }
    throw error;
  }
}
```

---

## API Endpoints Reference

### Authentication

| Method | Endpoint                                | Description              |
| ------ | --------------------------------------- | ------------------------ |
| POST   | `/api/v4/users/login`                   | Email/password login     |
| POST   | `/api/v4/users/logout`                  | Logout current session   |
| GET    | `/api/v4/users/me`                      | Get current user profile |
| POST   | `/api/v4/users/login/sso/code-exchange` | SAML code exchange       |
| POST   | `/api/v4/users/mfa`                     | Check MFA requirement    |

### OAuth Endpoints

| Method | Endpoint                         | Description             |
| ------ | -------------------------------- | ----------------------- |
| GET    | `/oauth/{provider}/login`        | Initiate OAuth flow     |
| POST   | `/oauth/{provider}/access_token` | Exchange code for token |

### Session Management

| Method | Endpoint                                      | Description             |
| ------ | --------------------------------------------- | ----------------------- |
| GET    | `/api/v4/users/{user_id}/sessions`            | List user sessions      |
| POST   | `/api/v4/users/{user_id}/sessions/revoke`     | Revoke specific session |
| POST   | `/api/v4/users/{user_id}/sessions/revoke/all` | Revoke all sessions     |

---

## Security Considerations

### Token Security

| Practice               | Implementation                        |
| ---------------------- | ------------------------------------- |
| **Secure storage**     | Keychain/Keystore, never AsyncStorage |
| **No secrets in app**  | Public client, no client_secret       |
| **PKCE required**      | `usePKCE: true` on all OAuth flows    |
| **Short-lived tokens** | Use refresh tokens for renewal        |
| **Token rotation**     | Rotate refresh token on use           |

### Request Security

| Practice                 | Implementation                              |
| ------------------------ | ------------------------------------------- |
| **HTTPS only**           | All API calls over TLS                      |
| **CSRF protection**      | Include `X-CSRF-Token` header               |
| **Authorization header** | `Bearer {token}` on all authenticated calls |
| **Certificate pinning**  | Optional, for high-security deployments     |

---

## File Structure

```
src/
├── api/
│   └── auth.ts                    # Auth API endpoints
├── services/
│   └── auth/
│       ├── useOAuthLogin.ts       # OAuth hook
│       ├── useSAMLLogin.ts        # SAML hook
│       ├── useEmailLogin.ts       # Email/password hook
│       ├── redirectUri.ts         # Platform-aware redirect URIs
│       └── tauriDeepLink.ts       # Desktop deep link handler
├── stores/
│   └── auth/
│       ├── authStore.ts           # Zustand auth state
│       └── storage.ts             # Token storage adapter
├── queries/
│   └── useCurrentUserQuery.ts     # TanStack Query for user
└── mutations/
    └── useLoginMutation.ts        # TanStack Mutation for login
```

---

## References

- [RFC 8252: OAuth 2.0 for Native Apps](https://tools.ietf.org/html/rfc8252)
- [RFC 7636: PKCE](https://tools.ietf.org/html/rfc7636)
- [Expo AuthSession Documentation](https://docs.expo.dev/versions/latest/sdk/auth-session/)
- [Expo Authentication Guide](https://docs.expo.dev/guides/authentication/)
- [Tauri Deep Linking Plugin](https://v2.tauri.app/plugin/deep-linking/)
- [OAuth 2.0 Security Best Practices](https://tools.ietf.org/html/draft-ietf-oauth-security-topics)
