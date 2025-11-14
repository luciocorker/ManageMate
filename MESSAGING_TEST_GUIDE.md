# Messaging System Test Guide

## Prerequisites
✅ Database schema updated (complete-messaging-fix.sql run successfully)
✅ MessagingService.ts created with all functions
✅ UI components updated:
  - MessagingPage.tsx (loads real data)
  - ChannelDetail.tsx (shows channel members)
  - ChatScreen.tsx (direct messages with real-time)
  - Channel/[id].tsx (channel group chat with real-time)

## Test 1: Verify Database Setup

Run this query in Supabase SQL Editor to check everything is set up:

```sql
-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('channels', 'channel_members', 'messages', 'direct_messages')
ORDER BY table_name;

-- Check triggers exist
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name IN ('on_project_created', 'on_project_member_added', 'on_project_member_removed');
```

Expected: 4 tables, 3 triggers

## Test 2: Create Project and Verify Auto-Channel Creation

### Steps:
1. Open ManageMate app
2. Navigate to Projects tab
3. Click "Create New Project"
4. Fill in:
   - Project Name: "Test Messaging Project"
   - Description: "Testing automatic channel creation"
   - Start Date: Today
   - End Date: 1 week from today
5. Click "Create Project"

### Verify in Database:
```sql
-- Check if channel was created for the project
SELECT 
  c.id,
  c.name,
  c.description,
  c.project_id,
  c.created_by,
  p.name as project_name
FROM channels c
JOIN projects p ON c.project_id = p.id
WHERE p.name = 'Test Messaging Project';

-- Check if project owner was added to channel
SELECT 
  cm.channel_id,
  cm.user_id,
  c.name as channel_name,
  prof.full_name
FROM channel_members cm
JOIN channels c ON cm.channel_id = c.id
JOIN profiles prof ON cm.user_id = prof.id
WHERE c.name = 'Test Messaging Project';
```

Expected: 1 channel created, 1 member (project owner)

## Test 3: Add Team Member and Verify Auto-Add to Channel

### Steps:
1. Open the "Test Messaging Project"
2. Navigate to Team Members section
3. Click "Add Team Member"
4. Select another user from your database
5. Add them to the project

### Verify in Database:
```sql
-- Check if team member was added to channel
SELECT 
  cm.user_id,
  prof.full_name,
  prof.email,
  cm.joined_at
FROM channel_members cm
JOIN channels c ON cm.channel_id = c.id
JOIN profiles prof ON cm.user_id = prof.id
WHERE c.name = 'Test Messaging Project'
ORDER BY cm.joined_at;
```

Expected: 2 members now (owner + new team member)

## Test 4: Test Channel Messaging

### Steps:
1. Navigate to Messages tab
2. You should see "Test Messaging Project" in Channels section
3. Click on the channel
4. Click "Open Channel Chat"
5. Send a message: "Hello team! Testing channel messaging."
6. If testing with 2 accounts:
   - Open same channel on second account
   - Verify message appears immediately (real-time)
   - Send reply: "Got it! Real-time works!"
   - Verify both users see both messages

### Verify in Database:
```sql
-- Check messages in channel
SELECT 
  m.id,
  m.content,
  m.created_at,
  prof.full_name as sender_name,
  c.name as channel_name
FROM messages m
JOIN channels c ON m.channel_id = c.id
JOIN profiles prof ON m.sender_id = prof.id
WHERE c.name = 'Test Messaging Project'
ORDER BY m.created_at;
```

Expected: All messages saved with correct sender and timestamps

## Test 5: Test Direct Messaging

### Steps:
1. Navigate to Messages tab
2. Go to "Direct Messages" section
3. Click "+" to start new conversation
4. Select a user
5. Send message: "Hi! Testing direct messages."
6. If testing with 2 accounts:
   - Open DM conversation on second account
   - Should see the message
   - Reply: "DM received! Real-time works here too."
   - Verify both see messages immediately

### Verify in Database:
```sql
-- Check direct messages between users
SELECT 
  dm.id,
  sender.full_name as sender,
  receiver.full_name as receiver,
  dm.content,
  dm.read,
  dm.created_at
FROM direct_messages dm
JOIN profiles sender ON dm.sender_id = sender.id
JOIN profiles receiver ON dm.receiver_id = receiver.id
ORDER BY dm.created_at;
```

Expected: Messages saved with correct sender/receiver, read status tracking

## Test 6: Test Member Removal

### Steps:
1. Go back to "Test Messaging Project"
2. Remove the team member you added
3. Go to Messages tab → Channels
4. Open "Test Messaging Project"
5. Verify removed member is no longer in members list

### Verify in Database:
```sql
-- Check channel members after removal
SELECT 
  cm.user_id,
  prof.full_name,
  prof.email
FROM channel_members cm
JOIN channels c ON cm.channel_id = c.id
JOIN profiles prof ON cm.user_id = prof.id
WHERE c.name = 'Test Messaging Project';
```

Expected: Only project owner remains as member

## Test 7: Test Real-Time Subscriptions

### Requirements: 2 devices/browsers with different accounts

### Channel Real-Time Test:
1. Device A: Open channel chat
2. Device B: Open same channel chat
3. Device A: Send message
4. Device B: Should see message appear immediately without refresh
5. Device B: Send reply
6. Device A: Should see reply immediately

### DM Real-Time Test:
1. Device A: Open DM with Device B user
2. Device B: Open DM with Device A user
3. Both send messages back and forth
4. All messages should appear immediately on both sides

## Test 8: Test Message Features

### Timestamp Formatting:
- Send message now → Should show "Just now" or time
- Older messages → Should show formatted time/date
- Yesterday's messages → Should show day + time

### Multiple Users in Channel:
- Add 2-3 team members to project
- Verify all appear in channel members
- Have each send messages
- Verify sender avatars and names show correctly
- Verify conversation flows naturally

## Expected Results Summary

✅ **Automatic Channel Creation**
- Channel created when project is created
- Channel has same name as project
- Project owner automatically added as member

✅ **Automatic Member Sync**
- Team members added to project → added to channel
- Team members removed from project → removed from channel
- Members list always matches project team

✅ **Channel Messaging**
- Messages sent successfully
- Messages appear in correct order
- Sender names and avatars display correctly
- Real-time updates work instantly

✅ **Direct Messaging**
- Can start conversation with any user
- Messages save correctly
- Read status tracks properly
- Real-time updates work instantly

✅ **UI/UX**
- Loading states show while fetching data
- Empty states show when no messages
- Timestamps format nicely
- Avatars use consistent colors
- Navigation works smoothly

## Troubleshooting

### Messages Not Appearing
- Check Supabase credentials in lib/supabase.ts
- Verify RLS is disabled for testing
- Check browser console for errors

### Real-Time Not Working
- Verify Supabase Realtime is enabled in project settings
- Check subscription code in messagingService.ts
- Ensure both users have active connections

### Channels Not Auto-Creating
- Verify triggers are installed (run verification query)
- Check Supabase logs for trigger errors
- Ensure projects table has owner_id column

### Members Not Syncing
- Verify project_members table has correct foreign keys
- Check trigger functions are SECURITY DEFINER
- Look for warnings in Supabase logs

## Next Steps (Optional Enhancements)

1. **File Attachments**: Implement file upload in messages
2. **Message Editing**: Allow users to edit their messages
3. **Message Deletion**: Allow users to delete messages
4. **Read Receipts**: Show when messages have been read
5. **Typing Indicators**: Show when someone is typing
6. **Message Reactions**: Add emoji reactions to messages
7. **Search**: Add search functionality for messages
8. **Notifications**: Send push notifications for new messages
9. **Channel Management**: Add ability to create custom channels
10. **Direct Channel Updates**: Allow channel name/description editing

## Performance Notes

- Indexes created on all foreign keys for fast queries
- Real-time subscriptions filter by channel/user to reduce load
- Messages load on demand, not all at once
- Optimistic UI updates make app feel instant
- Cleanup subscriptions on component unmount to prevent memory leaks
