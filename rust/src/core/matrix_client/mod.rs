mod integration_tests;
pub mod structs;
mod unit_tests;

pub use structs::MatrixClient;
// Re-export types needed by FFI
pub use matrix_sdk::ruma::OwnedUserId;
