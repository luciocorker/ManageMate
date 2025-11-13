# Test Data Verification Guide

## How to Verify Data is Displaying Correctly

### Step 1: Check Supabase Tables

Open your Supabase dashboard and verify you have data in these tables:

#### 1. **users** table
```sql
SELECT firebase_uid, email, full_name, created_at 
FROM users 
ORDER BY created_at DESC 
LIMIT 5;
```

Expected: At least 2 users (for testing friend messaging)

#### 2. **friends** table
```sql
SELECT f.id, f.user_id, f.friend_id, 
       u1.email as user_email, 
       u2.email as friend_email
FROM friends f
JOIN users u1 ON f.user_id = u1.firebase_uid
JOIN users u2 ON f.friend_id = u2.firebase_uid
ORDER BY f.created_at DESC;
```

Expected: Bidirectional friendships (2 rows per friendship)

#### 3. **messages** table
```sql
SELECT m.id, m.sender_id, m.receiver_id, m.content, m.created_at,
       u1.email as sender_email,
       u2.email as receiver_email
FROM messages m
LEFT JOIN users u1 ON m.sender_id = u1.firebase_uid
LEFT JOIN users u2 ON m.receiver_id = u2.firebase_uid
WHERE m.channel_id IS NULL
ORDER BY m.created_at DESC
LIMIT 10;
```

Expected: Messages between friends with correct sender_id and receiver_id

#### 4. **channels** table
```sql
SELECT id, name, description, created_at 
FROM channels 
ORDER BY created_at DESC;
```

Expected: Any channels you've created

#### 5. **channel_members** table
```sql
SELECT cm.id, cm.channel_id, cm.user_id, c.name as channel_name, u.email
FROM channel_members cm
JOIN channels c ON cm.channel_id = c.id
JOIN users u ON cm.user_id = u.firebase_uid
ORDER BY cm.joined_at DESC;
```

Expected: Channel memberships with correct user_id (Firebase UID)

### Step 2: Check Console Logs

When you navigate to the Messenger page, you should see these logs:

```
📊 Loading messenger data for user: user@example.com UID: abc123...
🔄 Fetching channels and friends from Supabase...
🔍 getChannels called
  ✅ Retrieved X channels from database
🔍 getFriendsWithProfiles called for userId: abc123...
  - Found X friend relationships
  - Fetching profiles for friend IDs: [...]
  - Retrieved X profiles
  ✅ Returning X friends with profiles
📊 Raw data loaded:
  - Channels: X
  - Friends with profiles: X
  - Sample channel: {...}
  - Sample friend: {...}
```

### Step 3: Common Issues and Solutions

#### Issue 1: No friends showing up
**Symptoms:** Friends list is empty even though data exists in database

**Check:**
1. Are you using the correct Firebase UID?
   ```javascript
   console.log("Current user ID:", user.id);
   ```

2. Do friend relationships exist in the `friends` table?
   ```sql
   SELECT * FROM friends WHERE user_id = 'YOUR_FIREBASE_UID';
   ```

3. Do the friend profiles exist in the `users` table?
   ```sql
   SELECT * FROM users WHERE firebase_uid IN (
     SELECT friend_id FROM friends WHERE user_id = 'YOUR_FIREBASE_UID'
   );
   ```

**Solution:**
- Ensure friend requests are accepted (creates entries in `friends` table)
- Verify both users have profiles in `users` table
- Check that `friend_id` matches `firebase_uid` in users table

#### Issue 2: No messages showing up
**Symptoms:** "No messages yet" even though messages exist

**Check:**
1. Are messages using Firebase UIDs?
   ```sql
   SELECT sender_id, receiver_id FROM messages WHERE channel_id IS NULL;
   ```

2. Do the UIDs match your current user and friend?
   ```javascript
   console.log("User ID:", user.id);
   console.log("Friend ID:", friend.id);
   ```

**Solution:**
- Messages must use `sender_id` and `receiver_id` (Firebase UIDs)
- Old messages with usernames won't display
- Send a new message to test

#### Issue 3: No channels showing up
**Symptoms:** Channels list is empty

**Check:**
1. Do channels exist in database?
   ```sql
   SELECT * FROM channels;
   ```

2. Are you a member of any channels?
   ```sql
   SELECT * FROM channel_members WHERE user_id = 'YOUR_FIREBASE_UID';
   ```

**Solution:**
- Create a new channel
- Ensure channel_members uses `user_id` (Firebase UID)

### Step 4: Test Data Creation

If you need to create test data manually:

#### Create Test Users
```sql
-- User 1
INSERT INTO users (firebase_uid, email, full_name, email_verified)
VALUES ('test-uid-1', 'alice@test.com', 'Alice Smith', true);

-- User 2
INSERT INTO users (firebase_uid, email, full_name, email_verified)
VALUES ('test-uid-2', 'bob@test.com', 'Bob Jones', true);
```

#### Create Friendship
```sql
-- Bidirectional friendship
INSERT INTO friends (user_id, friend_id)
VALUES 
  ('test-uid-1', 'test-uid-2'),
  ('test-uid-2', 'test-uid-1');
```

#### Create Test Messages
```sql
INSERT INTO messages (sender_id, receiver_id, content)
VALUES 
  ('test-uid-1', 'test-uid-2', 'Hi Bob!'),
  ('test-uid-2', 'test-uid-1', 'Hi Alice!'),
  ('test-uid-1', 'test-uid-2', 'How are you?');
```

#### Create Test Channel
```sql
-- Create channel
INSERT INTO channels (name, description, created_by)
VALUES ('Test Channel', 'A test channel', 'test-uid-1')
RETURNING id;

-- Add members (use the returned channel id)
INSERT INTO channel_members (channel_id, user_id)
VALUES 
  (1, 'test-uid-1'),
  (1, 'test-uid-2');
```

### Step 5: Verify in App

1. **Sign in** as one of the test users
2. **Navigate to Messenger** page
3. **Check console logs** for data loading
4. **Verify display:**
   - Friends list shows friend names
   - Last message preview shows
   - Channels list shows channels
   - Member counts are correct

### Step 6: Debug Checklist

- [ ] User is authenticated (check `user.id` in console)
- [ ] Supabase connection is working (check network tab)
- [ ] Data exists in Supabase tables (run SQL queries)
- [ ] Firebase UIDs are being used (not usernames)
- [ ] Console logs show data being fetched
- [ ] No errors in console
- [ ] State is being updated (`setFriends`, `setChannels`)
- [ ] Component is re-rendering after data load

### Expected Console Output

When everything is working correctly:

```
📊 Loading messenger data for user: alice@test.com UID: test-uid-1
🔄 Fetching channels and friends from Supabase...
🔍 getChannels called
  ✅ Retrieved 1 channels from database
🔍 getFriendsWithProfiles called for userId: test-uid-1
  - Found 1 friend relationships
  - Fetching profiles for friend IDs: ["test-uid-2"]
  - Retrieved 1 profiles
  ✅ Returning 1 friends with profiles
📊 Raw data loaded:
  - Channels: 1
  - Friends with profiles: 1
  - Sample channel: {id: 1, name: "Test Channel", ...}
  - Sample friend: {id: "test-uid-2", friend_id: "test-uid-2", profile: {...}}
  - Channel "Test Channel" has 2 members
  - Processing friend: Bob Jones
    - Messages with this friend: 3
    - Last message: "How are you?"
✅ Data transformation complete:
  - Display channels: 1
  - Display friends: 1
✅ Messenger data loaded and state updated successfully
```

## Quick Test Commands

Run these in your browser console while on the Messenger page:

```javascript
// Check current user
console.log("User:", user);

// Check loaded data
console.log("Friends:", friends);
console.log("Channels:", channels);

// Force reload
loadData();
```
