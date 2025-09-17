# Epic 6: Advanced Message Mechanics

**Цель:** Расширение базового функционала обмена сообщениями для повышения удобства и выразительности.

**Ключевые фичи:** Закрепление сообщений в 1-на-1 и групповых чатах, поиск по истории сообщений, отправка голосовых сообщений и коротких видеосообщений («кружочков»), а также выделение и управление несколькими сообщениями одновременно.

## User Story 6.1: Select and manage multiple messages

As a user, I want to select multiple messages to perform bulk actions like forwarding or deleting, so that I can efficiently manage chat content.

**Acceptance Criteria:**

1. **Entering Selection Mode:**
    - A long-press on any message (own or others') brings up a context menu with a "Select" button.
    - After tapping "Select," the application enters "selection mode":
        - A new app bar appears at the top of the screen, showing a counter for selected messages and action buttons: "Forward," "Delete," "Cancel."
        - The selected message is marked visually (e.g., with a checkbox or a background color change).
    - The user can add messages to the selection with a simple tap. A second tap deselects it.
    - Tapping the "Cancel" button or the system "Back" button exits selection mode.
2. **"Delete" Action:**
    - The "Delete" button is active only if _exclusively_ the current user's own messages are selected.
    - Tapping "Delete" shows a confirmation dialog: "Delete N messages? This action is irreversible."
    - After confirmation, an `m.room.redaction` event is sent for each message.
3. **"Forward" Action:**
    - The "Forward" button is active if at least one message is selected.
    - Tapping it opens a screen with a list of chats to select a recipient.
    - After selecting a chat, the selected messages are sent to it. Each forwarded message includes:
        - A visual "Forwarded message" label.
        - The name of the original author.
        - The content of the original message.

## Story 6.2: Message Search within a Chat

As a user, I want to search for messages within a specific chat, so that I can quickly find information in the conversation history.

**Acceptance Criteria:**

1. **Search Interface:**
    - A search icon (magnifying glass) is present in the top app bar of the chat screen.
    - Tapping the icon reveals a text input field, navigation buttons ("up," "down"), and a button to exit search mode.
    - As the user types, a counter for found matches is displayed in real-time (e.g., "3 of 15").
    - If nothing is found, a "Nothing found" message is displayed.
2. **Search Logic and Scope:**
    - The search is performed exclusively on the locally stored and decrypted message history. This ensures the feature works in E2E-encrypted chats without compromising privacy.
    - The search is case-insensitive (e.g., "Event" and "event" are considered matches).
    - The search finds matches by substring.
    - The found text within a message is highlighted for visual emphasis.
3. **Navigation and Display:**
    - On the first match, the chat automatically scrolls to the newest (most recent) found message.
    - The "up" and "down" buttons allow navigation between found messages in chronological order.
    - When navigating to a found message, it is briefly highlighted (e.g., with a quick background animation) to draw the user's attention.
    - Exiting search mode returns the user to their previous position in the chat before the search began.
4. **Technical and Functional Requirements:**
    - Search operations must be performed asynchronously to avoid blocking the user interface, especially with large chat histories.
    - The search applies to the text content of `m.room.message` and the text of edited messages (`m.replace`).
    - The search does not apply to system messages, filenames, or other non-text content.

## User Story 6.3: Message Pinning in 1:1 Chats

As a user in a 1:1 chat, I want to pin and unpin any message, so that important information is easily accessible and I can navigate between pins intuitively.

**Acceptance Criteria:**

1. **Pin Management (Permissions):**
    - The context menu for **any** message (own or the other person's) has a "Pin"/"Unpin" button.
    - **Both** chat participants can pin and unpin any message.
2. **Default Display:**
    - At the top of the chat screen, there is a bar that, by default, displays the **most recently** pinned message.
    - Tapping the bar scrolls the chat to the original message.
    - The bar has a button (e.g., a pin icon) that opens a separate screen with a list of all pinned messages.
3. **Dynamic Navigation on Scroll:**
    - When a user scrolls **up** the chat and a message currently displayed in the pinned bar appears on the screen, the bar automatically switches to show the **chronologically previous** pinned message.
    - This creates a "guide" effect through the pinned messages when scrolling into the past.
4. **Synchronization and Event Handling:**
    - All actions (pin/unpin) are synchronized between the two chat participants.
    - A system notification about the action is displayed in the chat (_"User X pinned a message"_).
    - If a pinned message is deleted, it automatically disappears from the pinned list for both participants.

## User Story 6.4: Message Pinning in Group Chats

As a room member,I want to see important messages pinned in a group chat, and as a room administrator, I want to manage these pins, so that key information is easily accessible to everyone.

**Acceptance Criteria:**

1. **Permission Model:**
    - The right to `pin` and `unpin` messages is granted only to users with a power level sufficient to change the room state (administrators and moderators).
    - For regular users, the "Pin" button in the context menu for any message (including their own) is either absent or inactive.
2. **State Synchronization:**
    - Pin/unpin actions send an `m.room.pinned_events` event to the server, which is synchronized with all chat participants.
    - Upon a successful pin, a system notification is displayed in the chat (e.g., _"User X pinned a message"_).
    - When unpinned, the message immediately disappears from the pinned list for all participants.
3. **User Interface (UI/UX):**
    - The UI for displaying pinned messages (bar at the top of the chat, list of pins) is identical to the implementation in 1:1 chats (Story 6.3), ensuring consistency.
    - All chat participants see a single, synchronized list of pinned messages.
    - Tapping a pinned message in the bar scrolls the chat history to its original position.
4. **Dynamic Navigation on Scroll:**
    - When a user scrolls **up** the chat and a message currently displayed in the pinned bar appears on the screen, the bar automatically switches to show the **chronologically previous** pinned message.
    - This creates a "guide" effect through the pinned messages when scrolling into the past.
5. **Edge Case Handling:**
    - If a pinned message is deleted (via an `m.room.redaction` event), it is automatically removed from the pinned list for all participants.
    - If a user who pinned a message loses their administrator rights, they can no longer manage that or any other pinned messages.

## Story 6.5: Send Voice Messages

**As a** user, **I want to** record and send voice messages in a chat, **so that** I can communicate more expressively and conveniently when typing is not practical.

**Acceptance Criteria:**

1. **Recording Interaction**:
    - A microphone icon is present in the message input area when the text field is empty.
    - **Tap-and-Hold Mode**:
        - Pressing and holding the microphone icon starts recording. The UI provides clear visual feedback, such as an incrementing timer and a microphone icon turning red.
        - Releasing the finger sends the voice message automatically.
        - Sliding left while holding cancels the recording. The UI provides visual feedback for the cancel action before the finger is released.
    - **Hands-Free (Locked) Mode**:
        - Swiping up from the microphone icon locks the recording mode, allowing the user to record without holding the button.
        - In locked mode, the UI displays a dedicated "Stop" button and a "Cancel" button.
        - After pressing "Stop", the user can preview the recording before sending or deleting it. Pressing "Send" dispatches the message.
2. **Playback Interaction**:
    - A received voice message is displayed in a message bubble showing a play/pause button, the duration of the audio, and a visual representation of the waveform or a progress bar.
    - Tapping "Play" starts audio playback through the device's main speaker.
    - During playback, the user can pause and resume the message. The progress bar updates to reflect the current position.
    - **Private Listening**: If the user brings the phone to their ear during playback, the audio output automatically and seamlessly switches from the loudspeaker to the earpiece.
3. **Technical and System Requirements**:
    - The first time the feature is used, the application must request microphone permissions from the user. If permission is denied, the feature is disabled, and the UI should indicate this gracefully.
    - The recorded audio is sent as an `m.room.message` event with `msgtype: "m.audio"`.
    - The event's `info` object must include the `duration` of the recording in milliseconds.
    - The `body` of the event should contain a non-empty fallback text (e.g., "Voice message").
    - The client should handle interruptions gracefully (e.g., an incoming phone call pauses or cancels the recording).
    - A reasonable maximum recording duration (e.g., 15 minutes) is enforced by the client to manage file size and prevent abuse.

## Story 6.6: Send Short Video Messages ("Circles")

**As a** user, **I want to** record and send short, circular video messages, **so that** I can share spontaneous reactions and moments with the same ease as sending a voice message.

**Acceptance Criteria:**

1. **Mode Switching and Recording**:
    - In the message input area, a single tap on the microphone icon (for voice messages) switches it to a camera icon, indicating video message mode. A subsequent tap switches it back.
    - **Tap-and-Hold Recording**: Pressing and holding the camera icon starts recording a video message. The UI displays a circular preview and a timer. Releasing the button sends the message instantly.
    - **Hands-Free (Locked) Recording**: Swiping up while holding the camera icon locks the recording mode. This allows the user to continue recording without holding the button. In this mode, "Stop" and "Cancel" controls are visible.
    - **Camera Switching**: While recording (in locked mode), the user can switch between the front and rear cameras.
2. **Video Message Properties**:
    - The final video is displayed in a circular "bubble" format.
    - The recording has a maximum duration of **60 seconds**. A visual indicator shows the remaining time during recording.
    - Video messages **autoplay silently** when they appear on the screen. Tapping the video enables audio.
3. **Playback and Interaction**:
    - While a video message is playing, the user can navigate to other chats. The video will continue to play in a small Picture-in-Picture (PiP) window that can be moved around the screen or closed.
    - The user can pause, resume, and seek through the video during playback.
4. **Technical and System Requirements**:
    - The application must request camera permissions on the first use. If permission is denied, the feature is disabled gracefully.
    - The video is sent as an `m.room.message` event with `msgtype: "m.video"`.
    - To distinguish it from a regular video file, a custom flag should be added to the event content, for example: `io.skiffymessenger.video_type: "round"`.
    - The `info` object of the event must include the `duration` of the video in milliseconds and should ideally store metadata about the video's dimensions to ensure a proper circular crop.
    - The `body` of the event should contain a fallback text like "Video message".

---

_This is a shard of the complete SkiffyMessenger PRD. For the full document, see: [../prd.md](../prd.md)_
