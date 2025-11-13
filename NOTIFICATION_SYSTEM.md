# WhatsApp-Style Notification System

## Overview

A comprehensive notification system that shows popup notifications and unread message badges, similar to WhatsApp.

## Features

### 1. **Popup Notifications**

- Appears when a new message arrives while user is NOT on the messenger page
- Slides in from the top with smooth animation
- Shows sender name and message preview (truncated to 80 characters)
- Auto-dismisses after 5 seconds
- Can be manually dismissed by tapping or clicking the X button

### 2. **Unread Message Badges**

- Red circular badges showing unread message count
- Appears next to friends and channels in the messenger list
- Shows "99+" for counts greater than 99
- Automatically disappears when user opens the chat
- Three size variants: small (16px), medium (20px), large (24px)

### 3. **Message Count Accumulation**

- Counts accumulate as new messages arrive
- Persisted to AsyncStorage (per user)
- Survives app restarts

### 4. **Smart Badge Clearing**

- Badge clears when user opens the chat
- Also clears when new messages arrive while chat is open
- Prevents false notifications

## Implementation Details

### Components

#### **UnreadMessagesContext** (`contexts/UnreadMessagesContext.tsx`)

Central state management for unread messages:

- Tracks unread counts per conversation (friend or channel)
- Listens to Socket.IO messages globally
- Manages popup notification display
- Persists counts to AsyncStorage
- Provides `incrementUnread()`, `markAsRead()`, and `getUnreadCount()` functions

#### **MessageNotificationToast** (`components/MessageNotificationToast.tsx`)

Popup notification component:

- Uses React Native Animated API for slide-in animation
- Positioned at top with zIndex 9999
- Shows sender name and message preview
- Auto-dismiss after 5 seconds

#### **UnreadBadge** (`components/UnreadBadge.tsx`)

Badge component:

- Circular red badge (#DC2626)
- White text
- Shows count or "99+"
- Hides when count is 0

### Integration Points

#### **App Layout** (`app/_layout.tsx`)

- Wraps app with `UnreadMessagesProvider`
- Renders `MessageNotificationToast` globally

#### **Messaging Page** (`pages/MessagingPage.tsx`)

- Sets `isOnMessengerPage` flag to prevent popups when user is viewing
- Renders `UnreadBadge` next to each friend and channel
- Uses consistent conversation IDs:
  - Friends: `[user.name, friend.name].sort().join("_")`
  - Channels: `channel.id`

#### **Chat Screens** (`pages/ChatScreen.tsx`, `pages/ChannelChatScreen.tsx`)

- Calls `markAsRead(conversationId)` when chat opens
- Also calls `markAsRead()` when new messages arrive while chat is open
- Ensures badges clear immediately

#### **Socket.IO Integration**

Global listener in `UnreadMessagesContext`:

```typescript
socket.onNewMessage((message: any) => {
  // Ignore messages from current user
  if (message.senderName === user.name) return;

  // Determine conversation ID
  const conversationId =
    message.channelId ||
    message.roomId ||
    [user.name, message.senderName].sort().join("_");

  // Increment unread count (shows notification if not on messenger page)
  incrementUnread(conversationId, message.text, message.senderName);
});
```

## How It Works

### When a Message Arrives:

1. **Socket.IO** emits `new-message` event
2. **UnreadMessagesContext** global listener catches it
3. If sender is NOT current user:
   - Increment unread count for that conversation
   - If user is NOT on messenger page: show popup notification
4. **MessagingPage** displays updated badge count next to friend/channel

### When User Opens a Chat:

1. **ChatScreen** or **ChannelChatScreen** calls `markAsRead(conversationId)`
2. **UnreadMessagesContext** clears the count for that conversation
3. Badge disappears from the messenger list

### When Message Arrives While Chat is Open:

1. Socket listener in chat screen receives message
2. Calls `markAsRead(conversationId)` immediately
3. Badge never appears (or disappears if it was there)

## Room ID Format

Consistent conversation IDs are critical for tracking:

### Direct Messages:

```typescript
const roomId = [user.name, friend.name].sort().join("_");
// Example: "Alice_Bob"
```

### Channel Messages:

```typescript
const conversationId = channel.id;
// Example: "channel-123"
```

## Persistence

Unread counts are stored in AsyncStorage:

```typescript
const key = `@managemate_unread_counts_${user.name}`;
// Stored as JSON: { "Alice_Bob": { count: 3, lastMessageTime: "..." } }
```

## Future Enhancements

### When Supabase Auth is Implemented:

1. Store `last_read_at` timestamps in database
2. Use Supabase real-time subscriptions for instant updates
3. Query unread counts: `SELECT COUNT(*) WHERE created_at > last_read_at`
4. Sync unread counts across devices

### Potential Features:

- Sound/vibration for notifications
- Different notification sounds per conversation
- Notification preferences (mute, snooze)
- Badge on app icon (device-level)
- Desktop push notifications

## Testing Checklist

- [ ] Send message to friend while on different page → popup appears
- [ ] Check badge appears in messenger list with correct count
- [ ] Multiple messages → count accumulates
- [ ] Open chat → badge disappears
- [ ] Receive message while chat is open → no badge
- [ ] Close and reopen app → counts persist
- [ ] Channel messages work the same way
- [ ] No popup when user is on messenger page
- [ ] Popup auto-dismisses after 5 seconds
- [ ] Can manually dismiss popup
- [ ] Badge shows "99+" for large counts
