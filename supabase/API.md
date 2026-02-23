# Supabase API Reference

Quick reference for all available functions in your messenger system.

## 📦 Import

```typescript
import {
  // Channel functions
  createChannel,
  getChannels,

  // Friend functions
  addFriend,
  getFriends,

  // Message functions
  sendMessageToChannel,
  sendMessageToFriend,
  getChannelMessages,
  getDirectMessages,
} from "@/supabase/supabaseClient";

import type { Channel, Friend, Message } from "@/supabase/types";
```

## 📋 Channel Functions

### `createChannel(name, description?)`

Creates a new channel.

```typescript
const channel = await createChannel("General", "Main discussion");
// Returns: Channel | null
```

### `getChannels()`

Fetches all channels, ordered by newest first.

```typescript
const channels = await getChannels();
// Returns: Channel[]
```

## 👥 Friend Functions

### `addFriend(userName, friendName)`

Adds a friend relationship.

```typescript
const friend = await addFriend("Lee", "Sarah Johnson");
// Returns: Friend | null
```

### `getFriends(userName)`

Gets all friends for a specific user.

```typescript
const friends = await getFriends("Lee");
// Returns: Friend[]
```

## 💬 Message Functions

### `sendMessageToChannel(channelId, senderName, text)`

Sends a message to a channel.

```typescript
const message = await sendMessageToChannel(
  "channel-uuid",
  "Lee",
  "Hello everyone!"
);
// Returns: Message | null
```

### `sendMessageToFriend(senderName, receiverName, text)`

Sends a direct message between two users.

```typescript
const message = await sendMessageToFriend("Lee", "Sarah Johnson", "Hey Sarah!");
// Returns: Message | null
```

### `getChannelMessages(channelId)`

Gets all messages in a channel, ordered chronologically.

```typescript
const messages = await getChannelMessages("channel-uuid");
// Returns: Message[]
```

### `getDirectMessages(senderName, receiverName)`

Gets all messages between two users (both directions).

```typescript
const messages = await getDirectMessages("Lee", "Sarah Johnson");
// Returns: Message[]
```

## 📊 TypeScript Types

### `Channel`

```typescript
interface Channel {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}
```

### `Friend`

```typescript
interface Friend {
  id: string;
  user_name: string;
  friend_name: string;
  created_at: string;
}
```

### `Message`

```typescript
interface Message {
  id: string;
  channel_id?: string; // Set for channel messages
  sender_name: string;
  receiver_name?: string; // Set for direct messages
  text: string;
  created_at: string;
}
```

## 🔄 Real-time Subscriptions

See `supabaseClient.ts` for commented examples of:

- Subscribing to new channel messages
- Subscribing to new direct messages
- Subscribing to channel updates

## 💡 Common Patterns

### Load data on mount

```typescript
useEffect(() => {
  async function load() {
    const data = await getChannels();
    setChannels(data);
  }
  load();
}, []);
```

### Send and update state

```typescript
async function handleSend(text: string) {
  const msg = await sendMessageToChannel(channelId, "Lee", text);
  if (msg) {
    setMessages((prev) => [...prev, msg]);
  }
}
```

### Parallel data loading

```typescript
const [channels, friends] = await Promise.all([
  getChannels(),
  getFriends("Lee"),
]);
```

## ⚠️ Error Handling

All functions return:

- **Success**: Data object or array
- **Error**: `null` (single item) or `[]` (array)

Always check for errors:

```typescript
const channel = await createChannel("Test");
if (!channel) {
  console.error("Failed to create channel");
  return;
}
// Use channel...
```

## 📱 Usage in Components

See `supabase/examples.tsx` for complete component examples.
See `supabase/README.md` for detailed setup instructions.
