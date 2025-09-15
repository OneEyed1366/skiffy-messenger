# Epic 3: Core Messaging Experience

**Цель:** Обеспечение базового взаимодействия с сообщениями: отправка, получение, отображение и реакции.

**Ключевые фичи:** Отправка текстовых сообщений, отображение сообщений в хронологическом порядке, добавление/удаление реакций-эмодзи, редактирование собственных сообщений, отправка медиафайлов с аннотацией.

## Story 3.1: Message Display

As a user, I want to view messages and their reactions in a room, so that I can understand the full context of the conversation.

**Acceptance Criteria:**

1. Message list view displays messages in chronological order.
2. Message bubbles clearly show the sender's name and a timestamp.
3. Application correctly renders the **plain-text body** of `m.room.message` events.
4. **Application displays aggregated emoji reactions** (e.g., 👍 5) below messages that have them.
5. The list of users who reacted to a message is **not** displayed in this story (out of scope).
6. Rendering of **HTML and Markdown** formatting is explicitly **out of scope**.
7. Smooth scrolling performance (60 FPS) is maintained even with lists of reacted messages.

## Story 3.2: Send Text Messages

As a user, I want to send text messages to a room, so that I can participate in conversations.

**Acceptance Criteria:**

1. A message input field with a send button is present.
2. The UI optimistically updates with the new message immediately upon sending.
3. A visual indicator shows the sending status (e.g., pending, sent, failed).
4. The input field is cleared after a successful send.
5. Error handling is implemented for failed messages.

## Story 3.3: Add & Retract Reactions

As a user, I want to add or remove emoji reactions to messages, so that I can quickly express my feelings.

**Acceptance Criteria:**

1. A mechanism exists to trigger the reaction UI (e.g., a long-press on a message bubble).
2. An emoji picker is displayed, allowing the user to select an emoji.
3. Selecting an emoji sends a corresponding `m.reaction` event to the homeserver.
4. The UI optimistically updates the reaction count on the message.
5. If a user taps on a reaction they have already added, the application sends a redaction (retraction) event for that reaction.
6. The UI optimistically updates to reflect the removed reaction.

## Story 3.4: Edit Messages

As a user, I want to edit my sent messages, so that I can correct typos or clarify my thoughts.

**Acceptance Criteria:**

1. A UI mechanism exists to initiate editing for a user's own sent messages (e.g., via a long-press context menu).
2. The application provides an input view, pre-filled with the original text, to modify the message.
3. Saving the edit sends a correctly formatted `m.replace` relation event to the homeserver.
4. The message in the timeline updates to show the new content.
5. A visual indicator (e.g., an "(edited)" label) is displayed on the edited message.
6. The UI optimistically updates the message content immediately upon sending the edit request.
7. Error handling is implemented to revert the message or show an error if the edit fails.

## Story 3.5: Delete (Redact) Messages

As a user, I want to delete my sent messages, so that I can permanently remove information from the conversation.

**Acceptance Criteria:**

1. A UI mechanism exists to initiate deletion for a user's own sent messages.
2. A confirmation dialog is displayed to prevent accidental deletions.
3. Confirming the action sends a `m.room.redaction` event targeting the message's event ID.
4. The content of the redacted message in the timeline is replaced with a placeholder (e.g., "Message deleted").
5. Reactions and other relations associated with the message are hidden or removed.
6. The UI optimistically updates to the "deleted" state immediately upon sending the redaction request.
7. Error handling is implemented if the redaction fails.

## Story 3.6: Send media with **optional** annotation

As a user, I want to send one or more media files (images, videos) with a single optional annotation, so that I can provide context to the media within a single, grouped message.

**Acceptance Criteria:**

1. **Media Selection and Annotation**:
    - The user can select one or more media files from the device's gallery or file system.
    - After selection, a single, optional text input field for an annotation (caption) appears.
    - The client enforces a character limit for the annotation (e.g., 1024 characters) and displays a counter to the user.
2. **Message Structure and Sending**:
    - If an annotation is provided, its text is included in the `body` field of the `m.room.message` event for **each** file sent.
    - If no annotation is provided, the `body` field for each event defaults to the original filename (e.g., `IMG_4581.jpeg`).
    - The operation of sending a media group is **atomic**. If any file in the group fails to upload, the entire group is marked as failed, and nothing is sent.
3. **User Interface and Experience**:
    - In the chat timeline, media files sent together in a single operation are displayed as a visually grouped "album," similar to the experience in Telegram.
    - The single annotation is displayed with the album.
    - If the atomic send operation fails, the entire album is visually marked with an error state (e.g., "Failed to send").
    - The user is provided with a single "Retry" button to attempt re-sending the entire group of files.

---

*This is a shard of the complete SkiffyMessenger PRD. For the full document, see: [../prd.md](../prd.md)*
