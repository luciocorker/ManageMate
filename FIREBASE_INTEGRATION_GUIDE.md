# ManageMate Firebase + Supabase Integration Guide

## Overview

I've integrated Firebase Authentication with your existing Supabase messaging system. Here's what has been completed and what remains:

## ✅ Completed Work

### 1. Firebase Authentication Context (`contexts/AuthContext.tsx`)

**Status: COMPLETE**

- ✅ Replaced AsyncStorage placeholder auth with Firebase Authentication
- ✅ Integrated `onAuthStateChanged` listener for real-time auth state
- ✅ Auto-sync Firebase users with Supabase `users` table
- ✅ User profile stored in Supabase with `firebase_uid` as foreign key
- ✅ Email verification status tracked
- ✅ `refreshUser()` function to manually sync user data

**Key Features:**

```typescript
interface User {
  id: string; // Firebase UID
  email: string;
  name: string;
  emailVerified: boolean;
  photoURL?: string;
  created_at: string;
}
```

### 2. Updated Database Schema (`supabase-setup.sql`)

**Status: COMPLETE**

Created comprehensive Supabase schema with:

- ✅ `users` table with Firebase UID integration
- ✅ `friends` table (user_id → firebase_uid)
- ✅ `friend_requests` table (sender_id, receiver_id → firebase_uid)
- ✅ `channels` table (created_by → firebase_uid)
- ✅ `channel_members` table (user_id → firebase_uid)
- ✅ `messages` table (sender_id, receiver_id → firebase_uid)
- ✅ `message_reactions` table (user_id → firebase_uid)
- ✅ All proper foreign key constraints and indexes
- ✅ Row Level Security policies
- ✅ Auto-update triggers for `updated_at` fields

### 3. Firebase-Compatible Supabase Client (`supabase/supabaseClientFirebase.ts`)

**Status: COMPLETE - NEW FILE CREATED**

Complete rewrite of Supabase client functions using Firebase UIDs:

**User Functions:**

- `getUserByFirebaseUid(firebaseUid)` - Fetch user profile
- `getUserByEmail(email)` - Look up user by email
- `searchUsers(query)` - Search users by name/email
- `updateUserProfile(firebaseUid, updates)` - Update profile

**Friend Request Functions:**

- `sendFriendRequest({ sender_id, receiver_email })` - Send request by email
- `getPendingFriendRequests(userId)` - Get pending requests
- `acceptFriendRequest(requestId, userId)` - Accept and create friendship
- `rejectFriendRequest(requestId, userId)` - Reject request

**Friends Functions:**

- `getFriends(userId)` - Get all friends with profiles
- `removeFriend(userId, friendId)` - Remove friendship

**Channel Functions:**

- `createChannel({ name, description, created_by })` - Create channel
- `getUserChannels(userId)` - Get user's channels
- `updateChannel(channelId, updates)` - Update channel
- `deleteChannel(channelId)` - Delete channel
- `addChannelMember({ channel_id, user_id })` - Add member
- `removeChannelMember(channelId, userId)` - Remove member
- `getChannelMembers(channelId)` - Get all members

**Message Functions:**

- `sendMessage({ sender_id, content, channel_id?, receiver_id? })` - Send message
- `getChannelMessages(channelId, limit)` - Get channel history
- `getDirectMessages(userId1, userId2, limit)` - Get DM history
- `deleteMessage(messageId, userId)` - Delete own message

**Reaction Functions:**

- `addMessageReaction({ message_id, user_id, emoji })` - Add reaction
- `removeMessageReaction(messageId, userId, emoji)` - Remove reaction
- `getMessageReactions(messageId)` - Get all reactions

**Realtime Subscriptions:**

- `subscribeToChannelMessages(channelId, callback)` - Listen for new channel messages
- `subscribeToDirectMessages(userId1, userId2, callback)` - Listen for DMs
- `subscribeToFriendRequests(userId, callback)` - Listen for friend requests

### 4. Updated Type Definitions (`supabase/types.ts`)

**Status: COMPLETE**

All interfaces updated to use `firebase_uid`:

- ✅ `UserProfile` interface
- ✅ `Friend`, `FriendRequest` interfaces
- ✅ `Channel`, `ChannelMember` interfaces
- ✅ `Message`, `MessageReaction` interfaces
- ✅ All input/request types updated

### 5. Updated AuthGate (`components/AuthGate.tsx`)

**Status: COMPLETE**

- ✅ Redirects to Firebase auth screens (landing/signin/signup)
- ✅ Deep link handling for friend requests
- ✅ Ensures email verification before app access
- ✅ Shows loading state during auth check

## 🚧 Remaining Work

### TODO #1: Update Messaging Components

**Files to Update:**

- `pages/MessagingPage.tsx` - Update to use new Supabase client
- `components/FriendsList.tsx` - Fetch friends using `getFriends(userId)`
- `components/ChannelsList.tsx` - Fetch channels using `getUserChannels(userId)`
- `components/ChatScreen.tsx` - Use `sendMessage()` with firebase_uid
- `contexts/RealtimeContext.tsx` - Update subscriptions to use firebase_uid

**Key Changes Needed:**

```typescript
// OLD WAY (using user.name)
const friends = await getFriends(user.name);

// NEW WAY (using user.id = firebase_uid)
const friends = await getFriends(user.id);
```

### TODO #2: Update Friend Request Flow

**Files to Update:**

- `components/AddFriendModal.tsx` - Use `sendFriendRequest({ sender_id, receiver_email })`
- `components/FriendRequestModal.tsx` - Update to accept/reject using firebase_uid
- Deep link generation - Update to pass firebase_uid instead of names

**Key Changes:**

```typescript
// OLD: sendFriendRequest with names
await sendFriendRequest({
  sender_name: user.name,
  sender_email: user.email,
  receiver_name: friendName,
  receiver_email: friendEmail,
});

// NEW: sendFriendRequest with firebase_uid
await sendFriendRequest({
  sender_id: user.id, // firebase_uid
  receiver_email: friendEmail,
});
```

### TODO #3: Update Realtime Context

**File:** `contexts/RealtimeContext.tsx`

Update to use new subscription functions:

```typescript
// Subscribe to direct messages
const subscription = subscribeToDirectMessages(
  user.id, // firebase_uid
  friendId, // firebase_uid
  (message) => {
    // Handle new message
  }
);

// Subscribe to channel messages
const channelSub = subscribeToChannelMessages(channelId, (message) => {
  // Handle new message
});
```

### TODO #4: Update Unread Messages Context

**File:** `contexts/UnreadMessagesContext.tsx`

- Store unread counts by firebase_uid instead of user name
- Update AsyncStorage keys to use firebase_uid

### TODO #5: Database Migration

**Action Required:**
Run the updated `supabase-setup.sql` in your Supabase SQL Editor to:

1. Create new tables with firebase_uid foreign keys
2. Set up Row Level Security policies
3. Create indexes for performance

**⚠️ IMPORTANT:** This will create NEW tables. You'll need to migrate data from old tables if you have existing data.

## 🔄 Migration Strategy

If you have existing data in old tables:

1. **Backup existing data**

   ```sql
   -- Export existing data
   COPY friends TO '/tmp/friends_backup.csv' CSV HEADER;
   COPY messages TO '/tmp/messages_backup.csv' CSV HEADER;
   ```

2. **Run new schema**

   - Execute `supabase-setup.sql`

3. **Map old users to Firebase UIDs**

   - Have users sign in with Firebase
   - Auto-sync creates users table entries
   - Manual mapping may be needed for old data

4. **Migrate data**
   - Write migration script to convert user names to firebase_uids
   - Use the `users` table as lookup (email → firebase_uid)

## 📝 Usage Examples

### Sending a Friend Request

```typescript
import { useAuth } from "@/contexts/AuthContext";
import { sendFriendRequest } from "@/supabase/supabaseClientFirebase";

function AddFriend() {
  const { user } = useAuth();

  async function handleAddFriend(friendEmail: string) {
    const result = await sendFriendRequest({
      sender_id: user.id, // Firebase UID
      receiver_email: friendEmail,
    });

    if (result) {
      Alert.alert("Success", "Friend request sent!");
    }
  }
}
```

### Sending a Message

```typescript
import { sendMessage } from "@/supabase/supabaseClientFirebase";

async function sendDM(receiverId: string, content: string) {
  const message = await sendMessage({
    sender_id: user.id,
    receiver_id: receiverId,
    content: content,
  });
}

async function sendChannelMessage(channelId: string, content: string) {
  const message = await sendMessage({
    sender_id: user.id,
    channel_id: channelId,
    content: content,
  });
}
```

### Getting Friends

```typescript
import { getFriends } from "@/supabase/supabaseClientFirebase";

async function loadFriends() {
  const friends = await getFriends(user.id);
  // friends is array of UserProfile objects
  friends.forEach((friend) => {
    console.log(friend.full_name, friend.email);
  });
}
```

## 🔐 Authentication Flow

1. User signs in with Firebase (email/password, Google, Apple, GitHub)
2. Firebase auth state change triggers
3. AuthContext syncs user to Supabase `users` table
4. All messaging operations use firebase_uid from `user.id`
5. Email must be verified before app access

## 📊 Database Structure

```
users (Supabase)
  ├─ firebase_uid (PK, from Firebase)
  ├─ email
  ├─ full_name
  └─ profile_picture_url

friends
  ├─ user_id (FK → users.firebase_uid)
  └─ friend_id (FK → users.firebase_uid)

friend_requests
  ├─ sender_id (FK → users.firebase_uid)
  ├─ receiver_id (FK → users.firebase_uid)
  └─ status (pending/accepted/rejected)

messages
  ├─ sender_id (FK → users.firebase_uid)
  ├─ receiver_id (FK → users.firebase_uid, nullable)
  ├─ channel_id (FK → channels.id, nullable)
  └─ content
```

## 🎯 Next Steps

1. **Run database migration**

   - Execute `supabase-setup.sql` in Supabase
   - Verify tables are created

2. **Update import statements**

   ```typescript
   // Change all imports from:
   import { ... } from '@/supabase/supabaseClient';

   // To:
   import { ... } from '@/supabase/supabaseClientFirebase';
   ```

3. **Update messaging components**

   - Replace `user.name` with `user.id` (firebase_uid)
   - Update all Supabase function calls

4. **Test authentication flow**

   - Sign up new user
   - Verify email
   - Check user appears in Supabase `users` table

5. **Test messaging**
   - Send friend request
   - Accept friend request
   - Send direct message
   - Create channel
   - Send channel message

## ⚠️ Breaking Changes

- **User identification**: Changed from `user.name` to `user.id` (firebase_uid)
- **Database schema**: All tables now use `firebase_uid` as foreign key
- **Friend requests**: Now lookup receiver by email instead of name
- **Authentication**: Email verification required before app access

## 🐛 Known Issues

1. Old `supabaseClient.ts` still exists - should be deprecated
2. Messaging components still use old client
3. Some TypeScript errors in AuthGate (using `as any` workaround)
4. FriendRequestModal needs update to use email lookup

## 📞 Support

The Firebase auth screens are fully functional:

- `/app/(auth)/landing.tsx` - Landing page
- `/app/(auth)/signin.tsx` - Sign in
- `/app/(auth)/signup.tsx` - Sign up
- `/app/(auth)/forgot-password.tsx` - Password reset
- `/app/(auth)/reset-password.tsx` - New password

All screens integrate with Firebase and auto-sync to Supabase.
