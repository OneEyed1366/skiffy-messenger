mod frb_generated;

pub mod api;
pub mod core;

// Re-exports for FFI generated code
pub use core::matrix_client::OwnedUserId;
pub use core::storage::InMemoryStorage;

#[cfg(any(target_os = "macos", target_os = "ios"))]
pub use core::storage::KeychainStorage;
