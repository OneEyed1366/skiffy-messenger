use super::*;
use crate::core::storage::{create_secure_storage, factory::create_memory_storage};

#[tokio::test]
async fn test_memory_storage_basic_operations() {
    let storage = create_memory_storage();

    // Test set and get
    let result = storage.set("test_key", "test_value").await;
    assert!(result.is_ok());

    let value = storage.get("test_key").await;
    assert!(value.is_ok());
    assert_eq!(value.unwrap(), "test_value");

    // Test delete
    let result = storage.delete("test_key").await;
    assert!(result.is_ok());

    // Verify deletion
    let result = storage.get("test_key").await;
    assert!(result.is_err());
    matches!(result.unwrap_err(), SecureStorageError::KeyNotFound { .. });
}

#[tokio::test]
async fn test_memory_storage_clear() {
    let storage = create_memory_storage();

    // Set multiple values
    storage.set("key1", "value1").await.unwrap();
    storage.set("key2", "value2").await.unwrap();
    storage.set("key3", "value3").await.unwrap();

    // Clear all
    let result = storage.clear().await;
    assert!(result.is_ok());

    // Verify all are gone
    assert!(storage.get("key1").await.is_err());
    assert!(storage.get("key2").await.is_err());
    assert!(storage.get("key3").await.is_err());
}

#[tokio::test]
async fn test_memory_storage_session_status() {
    let storage = create_memory_storage();
    assert_eq!(storage.is_persistent(), SessionStatus::NonPersistent);
}

#[tokio::test]
async fn test_empty_key_validation() {
    let storage = create_memory_storage();

    // Test set with empty key
    let result = storage.set("", "value").await;
    assert!(result.is_err());
    matches!(result.unwrap_err(), SecureStorageError::InvalidInput { .. });

    // Test get with empty key
    let result = storage.get("").await;
    assert!(result.is_err());
    matches!(result.unwrap_err(), SecureStorageError::InvalidInput { .. });

    // Test delete with empty key
    let result = storage.delete("").await;
    assert!(result.is_err());
    matches!(result.unwrap_err(), SecureStorageError::InvalidInput { .. });
}

#[tokio::test]
async fn test_storage_factory() {
    let storage = create_secure_storage().await;
    assert!(storage.is_ok());

    let storage = storage.unwrap();
    // Should be able to perform basic operations
    let result = storage.set("factory_test", "factory_value").await;
    assert!(result.is_ok());

    let value = storage.get("factory_test").await;
    assert!(value.is_ok());
    assert_eq!(value.unwrap(), "factory_value");

    // Clean up
    let _ = storage.delete("factory_test").await;
}

#[tokio::test]
async fn test_concurrent_access() {
    let storage = create_memory_storage();
    let storage = Arc::new(storage);

    let mut handles = Vec::new();

    // Spawn multiple tasks that write concurrently
    for i in 0..10 {
        let storage_clone = storage.clone();
        let handle = tokio::spawn(async move {
            let key = format!("concurrent_key_{}", i);
            let value = format!("concurrent_value_{}", i);

            storage_clone.set(&key, &value).await.unwrap();

            // Verify we can read it back
            let retrieved = storage_clone.get(&key).await.unwrap();
            assert_eq!(retrieved, value);

            // Clean up
            storage_clone.delete(&key).await.unwrap();
        });
        handles.push(handle);
    }

    // Wait for all tasks to complete
    for handle in handles {
        handle.await.unwrap();
    }
}

#[tokio::test]
async fn test_error_types() {
    let storage = create_memory_storage();

    // Test KeyNotFound error
    let result = storage.get("nonexistent_key").await;
    assert!(result.is_err());
    match result.unwrap_err() {
        SecureStorageError::KeyNotFound { key } => {
            assert_eq!(key, "nonexistent_key");
        }
        _ => panic!("Expected KeyNotFound error"),
    }

    // Test InvalidInput error
    let result = storage.set("", "value").await;
    assert!(result.is_err());
    match result.unwrap_err() {
        SecureStorageError::InvalidInput { message } => {
            assert!(message.contains("Key cannot be empty"));
        }
        _ => panic!("Expected InvalidInput error"),
    }
}

#[tokio::test]
async fn test_overwrite_existing_key() {
    let storage = create_memory_storage();

    // Set initial value
    storage
        .set("overwrite_test", "initial_value")
        .await
        .unwrap();

    // Overwrite with new value
    storage.set("overwrite_test", "new_value").await.unwrap();

    // Verify new value
    let value = storage.get("overwrite_test").await.unwrap();
    assert_eq!(value, "new_value");

    // Clean up
    storage.delete("overwrite_test").await.unwrap();
}

#[tokio::test]
async fn test_delete_nonexistent_key() {
    let storage = create_memory_storage();

    // Deleting a non-existent key should succeed
    let result = storage.delete("nonexistent_key").await;
    assert!(result.is_ok());
}

#[tokio::test]
async fn test_large_value_storage() {
    let storage = create_memory_storage();

    // Create a large value (10KB)
    let large_value = "x".repeat(10240);
    let key = "large_value_test";

    // Store large value
    let result = storage.set(key, &large_value).await;
    assert!(result.is_ok());

    // Retrieve and verify
    let retrieved = storage.get(key).await.unwrap();
    assert_eq!(retrieved, large_value);
    assert_eq!(retrieved.len(), 10240);

    // Clean up
    storage.delete(key).await.unwrap();
}

#[tokio::test]
async fn test_special_characters_in_keys_and_values() {
    let storage = create_memory_storage();

    let test_cases = vec![
        ("key_with_spaces", "value with spaces"),
        ("key-with-dashes", "value-with-dashes"),
        ("key.with.dots", "value.with.dots"),
        ("key_with_unicode_🔑", "value_with_unicode_🔒"),
        ("key/with/slashes", "value/with/slashes"),
        ("key@with@symbols", "value@with@symbols"),
    ];

    for (key, value) in test_cases {
        // Set value
        let result = storage.set(key, value).await;
        assert!(result.is_ok(), "Failed to set key: {}", key);

        // Get value
        let retrieved = storage.get(key).await;
        assert!(retrieved.is_ok(), "Failed to get key: {}", key);
        assert_eq!(retrieved.unwrap(), value);

        // Clean up
        storage.delete(key).await.unwrap();
    }
}

/// Test that demonstrates the secure storage pattern
#[tokio::test]
async fn test_secure_storage_pattern() {
    // Initialize storage
    let storage = create_secure_storage().await.unwrap();

    // Simulate storing authentication credentials
    let auth_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
    let refresh_token = "refresh_token_value_here...";
    let user_id = "@alice:example.com";

    // Store credentials
    storage.set("auth_token", auth_token).await.unwrap();
    storage.set("refresh_token", refresh_token).await.unwrap();
    storage.set("user_id", user_id).await.unwrap();

    // Verify storage
    assert_eq!(storage.get("auth_token").await.unwrap(), auth_token);
    assert_eq!(storage.get("refresh_token").await.unwrap(), refresh_token);
    assert_eq!(storage.get("user_id").await.unwrap(), user_id);

    // Simulate logout - clear sensitive data
    storage.delete("auth_token").await.unwrap();
    storage.delete("refresh_token").await.unwrap();
    storage.delete("user_id").await.unwrap();

    // Verify cleanup
    assert!(storage.get("auth_token").await.is_err());
    assert!(storage.get("refresh_token").await.is_err());
    assert!(storage.get("user_id").await.is_err());
}
