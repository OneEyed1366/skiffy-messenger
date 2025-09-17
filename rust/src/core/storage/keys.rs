// Storage key constants for SecureStorage
// This module defines all the keys used for storing data in SecureStorage
// to avoid magic strings throughout the codebase.

/// Matrix authentication storage keys
pub struct AuthKeys;

impl AuthKeys {
    /// Access token for Matrix authentication
    pub const ACCESS_TOKEN: &'static str = "skiffy__access_token";

    /// Refresh token for Matrix authentication
    pub const REFRESH_TOKEN: &'static str = "skiffy__refresh_token";

    /// Matrix user ID (e.g., @user:matrix.org)
    pub const USER_ID: &'static str = "skiffy__user_id";

    /// Matrix device ID for this client instance
    pub const DEVICE_ID: &'static str = "skiffy__device_id";

    /// Returns all authentication-related keys for bulk operations
    pub const fn all() -> &'static [&'static str] {
        &[
            Self::ACCESS_TOKEN,
            Self::REFRESH_TOKEN,
            Self::USER_ID,
            Self::DEVICE_ID,
        ]
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_auth_keys_constants() {
        assert_eq!(AuthKeys::ACCESS_TOKEN, "skiffy__access_token");
        assert_eq!(AuthKeys::REFRESH_TOKEN, "skiffy__refresh_token");
        assert_eq!(AuthKeys::USER_ID, "skiffy__user_id");
        assert_eq!(AuthKeys::DEVICE_ID, "skiffy__device_id");
    }

    #[test]
    fn test_auth_keys_all() {
        let all_keys = AuthKeys::all();
        assert_eq!(all_keys.len(), 4);
        assert!(all_keys.contains(&AuthKeys::ACCESS_TOKEN));
        assert!(all_keys.contains(&AuthKeys::REFRESH_TOKEN));
        assert!(all_keys.contains(&AuthKeys::USER_ID));
        assert!(all_keys.contains(&AuthKeys::DEVICE_ID));
    }
}
