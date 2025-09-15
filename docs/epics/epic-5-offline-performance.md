# Epic 5: Offline Support & Performance

**Цель:** Обеспечение работы приложения без подключения к сети и оптимизация производительности.

**Ключевые фичи:** Локальное хранение истории сообщений в SQLite, очередь сообщений для отправки при восстановлении соединения, достижение стабильных 60 FPS в ключевых сценариях.

## Story 5.1: Offline Message Storage

As a user, I want to access recent messages offline, so that I can continue conversations without internet connection.

**Acceptance Criteria:**

1. Local SQLite database for message storage
2. Offline message queue for sending when online
3. Sync status indicators
4. Automatic reconciliation when connection restored
5. Storage quota management

### User Story 5.3: Offline Conflict Notification

**As a user,**
I want to be clearly informed when an action I took offline could not be perfectly synchronized,
so that I understand the state of my conversation and can decide on the next step.

**Acceptance Criteria:**

1. When the application comes back online, it attempts to resolve any data conflicts according to the CRDT policy (as per NFR9).
2. If an unresolvable conflict is detected (e.g., the user replied to a message that was deleted on the server while they were offline), the application shall not silently fail.
3. The user's local action (e.g., the sent reply) shall remain visible in their own timeline.
4. The message that caused the conflict shall be marked with a distinct visual indicator (e.g., a small warning icon).
5. Tapping the indicator shall display a non-intrusive dialog with a clear explanation, such as: "Это сообщение является ответом на сообщение, которое было удалено." (This is a reply to a message that has since been deleted.)
6. The dialog may provide the user with an option to delete their conflicting message.

## Story 5.2: Performance Optimization

As a user, I want smooth 60 FPS performance during chat interactions, so that the app feels responsive and native.

**Acceptance Criteria:**

1. Optimized message list rendering
2. Efficient memory usage for large chat histories
3. Smooth scrolling performance
4. Minimal UI blocking during operations
5. Performance monitoring and metrics

---

*This is a shard of the complete SkiffyMessenger PRD. For the full document, see: [../prd.md](../prd.md)*
