# Supabase Messenger Setup Guide

This guide will help you set up the Supabase database for the ManageMate messenger system.

## 📁 File Structure

```
supabase/
├── migrations/
│   └── 001_initial_schema.sql    # Database schema
├── types.ts                       # TypeScript interfaces
└── supabaseClient.ts              # Helper functions
```

## 🗄️ Database Setup

### Step 1: Create Tables in Supabase

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase/migrations/001_initial_schema.sql`
4. Paste and run the SQL script

This will create three tables:

- **friends** - Stores friendships between users
- **channels** - Stores channel information
- **messages** - Stores both channel and direct messages

### Step 2: Verify Tables

Go to **Table Editor** in Supabase and confirm you see:

- ✅ friends
- ✅ channels
- ✅ messages

## 🔧 Helper Functions

All helper functions are in `supabase/supabaseClient.ts`:

### Channel Functions

```typescript
import { createChannel, getChannels } from "@/supabase/supabaseClient";

// Create a new channel
const channel = await createChannel("General", "A general discussion channel");

// Get all channels
const channels = await getChannels();
```

### Friend Functions

```typescript
import { addFriend, getFriends } from "@/supabase/supabaseClient";

// Add a friend
const friend = await addFriend("Lee", "Sarah Johnson");

// Get all friends for a user
const friends = await getFriends("Lee");
```

### Message Functions

```typescript
import {
  sendMessageToChannel,
  sendMessageToFriend,
  getChannelMessages,
  getDirectMessages,
} from "@/supabase/supabaseClient";

// Send a channel message
const message = await sendMessageToChannel(channelId, "Lee", "Hello everyone!");

// Send a direct message
const dm = await sendMessageToFriend("Lee", "Sarah Johnson", "Hey Sarah!");

// Get channel messages
const channelMessages = await getChannelMessages(channelId);

// Get direct messages between two users
const directMessages = await getDirectMessages("Lee", "Sarah Johnson");
```

## 📊 TypeScript Interfaces

Import types from `supabase/types.ts`:

```typescript
import type { Channel, Friend, Message } from "@/supabase/types";

const channel: Channel = {
  id: "123",
  name: "General",
  description: "Main channel",
  created_at: "2025-11-10T00:00:00Z",
};
```

## 🔄 Real-time Updates (Future Implementation)

The `supabaseClient.ts` file includes commented examples for setting up real-time subscriptions.

### Example: Listen to new channel messages

```typescript
import { supabase } from "@/lib/supabase";

const subscription = supabase
  .channel("channel-messages")
  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "messages",
      filter: `channel_id=eq.${channelId}`,
    },
    (payload) => {
      console.log("New message:", payload.new);
      // Update your state here
    }
  )
  .subscribe();

// Cleanup when component unmounts
return () => {
  supabase.removeChannel(subscription);
};
```

## 🎯 Usage in React Native Components

### Example: Load channels on mount

```typescript
import { useEffect, useState } from 'react';
import { getChannels } from '@/supabase/supabaseClient';
import type { Channel } from '@/supabase/types';

function MessagingPage() {
  const [channels, setChannels] = useState<Channel[]>([]);

  useEffect(() => {
    loadChannels();
  }, []);

  async function loadChannels() {
    const data = await getChannels();
    setChannels(data);
  }

  return (
    // Your UI here
  );
}
```

### Example: Send a message

```typescript
import { sendMessageToChannel } from "@/supabase/supabaseClient";

async function handleSendMessage(text: string) {
  const message = await sendMessageToChannel(
    currentChannelId,
    "Lee", // Current user name
    text
  );

  if (message) {
    // Message sent successfully
    console.log("Message sent:", message);
  }
}
```

## 🔐 Security Notes

- Row Level Security (RLS) is enabled with permissive policies for development
- Before production, restrict policies based on authenticated users
- Never commit `.env` file (already in `.gitignore`)

## ✅ Testing the Setup

1. Create a test channel:

```typescript
const channel = await createChannel("Test Channel", "Testing");
console.log(channel);
```

2. Add a test friend:

```typescript
const friend = await addFriend("Lee", "Test Friend");
console.log(friend);
```

3. Send a test message:

```typescript
const message = await sendMessageToChannel(channelId, "Lee", "Hello!");
console.log(message);
```

## 📝 Next Steps

1. ✅ Run the SQL migration in Supabase
2. ✅ Import helper functions in your components
3. ✅ Replace dummy data with real Supabase data
4. 🔄 Implement real-time subscriptions for live updates
5. 🔐 Add user authentication with Supabase Auth

## 🆘 Troubleshooting

**"relation does not exist" error:**

- Make sure you ran the SQL migration script in Supabase

**Empty data returned:**

- Check if tables have data in Supabase Table Editor
- Verify RLS policies allow your queries

**Environment variables undefined:**

- Ensure `.env` file has correct Supabase URL and key
- Restart your Expo development server after changing `.env`

## 📚 Resources

- [Supabase JavaScript Client Docs](https://supabase.com/docs/reference/javascript)
- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)
- [React Native Supabase Guide](https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native)
