# 🚀 Adding Test Data to Your Messenger

After running the SQL migration, you'll want to add some test data. Here are two ways to do it:

## Option 1: Via Supabase Dashboard (Easiest)

### Add Test Friends

1. Go to **Table Editor** → **friends**
2. Click **Insert** → **Insert row**
3. Fill in:
   - `user_name`: Lee
   - `friend_name`: Sarah Johnson
4. Click **Save**
5. Repeat for more friends:
   - Mike Chen
   - Emily Davis
   - James Wilson
   - Lisa Anderson

### Add Test Channels

1. Go to **Table Editor** → **channels**
2. Click **Insert** → **Insert row**
3. Fill in:
   - `name`: General
   - `description`: Main discussion channel
4. Click **Save**
5. Add more channels:
   - Design Squad (Design team discussions)
   - Development (Dev team channel)
   - Marketing (Marketing team chat)

### Add Test Messages

1. Go to **Table Editor** → **messages**
2. For a **direct message**:
   - `sender_name`: Lee
   - `receiver_name`: Sarah Johnson
   - `text`: Hey! How are you?
   - Leave `channel_id` empty
3. For a **channel message**:
   - `sender_name`: Lee
   - `channel_id`: [copy ID from channels table]
   - `text`: Welcome to the channel!
   - Leave `receiver_name` empty

## Option 2: Via SQL Editor (Faster)

Go to **SQL Editor** and run this script:

```sql
-- Add friends
INSERT INTO friends (user_name, friend_name) VALUES
  ('Lee', 'Sarah Johnson'),
  ('Lee', 'Mike Chen'),
  ('Lee', 'Emily Davis'),
  ('Lee', 'James Wilson'),
  ('Lee', 'Lisa Anderson');

-- Add channels
INSERT INTO channels (name, description) VALUES
  ('General', 'Main discussion channel'),
  ('Design Squad', 'Design team discussions'),
  ('Development', 'Dev team channel'),
  ('Marketing', 'Marketing team chat');

-- Add some direct messages
INSERT INTO messages (sender_name, receiver_name, text) VALUES
  ('Lee', 'Sarah Johnson', 'Hey! Did you finish the project?'),
  ('Sarah Johnson', 'Lee', 'Yes! Just submitted it.'),
  ('Lee', 'Mike Chen', 'Thanks for your help yesterday!'),
  ('Mike Chen', 'Lee', 'No problem, happy to help!');

-- Add some channel messages (you'll need to replace <channel-id> with actual IDs)
-- First, get channel IDs:
SELECT id, name FROM channels;

-- Then insert messages with actual channel IDs:
-- Example (replace 'actual-uuid-here' with real ID from above query):
-- INSERT INTO messages (channel_id, sender_name, text) VALUES
--   ('actual-uuid-here', 'Lee', 'Welcome to General!'),
--   ('actual-uuid-here', 'Sarah Johnson', 'Thanks! Excited to be here!');
```

## Option 3: Via Your App (Programmatically)

You can also add test data directly from your React Native app. Create a test function:

```typescript
import {
  addFriend,
  createChannel,
  sendMessageToFriend,
} from "@/supabase/supabaseClient";

async function seedTestData() {
  // Add friends
  await addFriend("Lee", "Sarah Johnson");
  await addFriend("Lee", "Mike Chen");
  await addFriend("Lee", "Emily Davis");

  // Create channels
  await createChannel("General", "Main discussion channel");
  await createChannel("Design Squad", "Design team discussions");

  // Send test messages
  await sendMessageToFriend("Lee", "Sarah Johnson", "Hey! How are you?");
  await sendMessageToFriend(
    "Sarah Johnson",
    "Lee",
    "Great! Thanks for asking!"
  );

  console.log("Test data added!");
}

// Call this once from your MessagingPage
// seedTestData();
```

## Verify Your Data

After adding test data, check your MessagingPage:

1. **Friends section** should show 5 friends
2. **Channels section** should show 4 channels
3. Click on a friend to see direct messages
4. Click on a channel to see channel messages

## 🎉 You're Ready!

Once you have test data, your messenger will be fully functional with:

- Real friends from Supabase
- Real channels from Supabase
- Real messages from Supabase
- Loading states and empty states

All data persists in your Supabase database!
