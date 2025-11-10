# 🚀 Quick Start Checklist

Follow these steps to get your Supabase messenger system up and running.

## ✅ Setup Steps

### 1. Run Database Migration

- [ ] Open your Supabase project dashboard
- [ ] Go to **SQL Editor** (left sidebar)
- [ ] Click **New Query**
- [ ] Copy contents from `supabase/migrations/001_initial_schema.sql`
- [ ] Paste and click **Run**
- [ ] Verify success message appears

### 2. Verify Tables Created

- [ ] Go to **Table Editor** (left sidebar)
- [ ] Confirm you see these tables:
  - ✅ `friends`
  - ✅ `channels`
  - ✅ `messages`
- [ ] Click on each table to see the columns

### 3. Test Database Connection

Add this to your `pages/MessagingPage.tsx` to test:

```typescript
import { getChannels } from "@/supabase/supabaseClient";

// Inside your component:
useEffect(() => {
  async function test() {
    const channels = await getChannels();
    console.log("Channels from Supabase:", channels);
  }
  test();
}, []);
```

### 4. Add Sample Data (Optional)

Go to **SQL Editor** and run:

```sql
-- Add a test channel
INSERT INTO channels (name, description)
VALUES ('General', 'General discussion');

-- Add a test friend
INSERT INTO friends (user_name, friend_name)
VALUES ('Lee', 'Test Friend');

-- Add a test message
INSERT INTO messages (sender_name, receiver_name, text)
VALUES ('Lee', 'Test Friend', 'Hello from Supabase!');
```

### 5. Verify Sample Data

- [ ] Go to **Table Editor**
- [ ] Click on `channels` table → see your test channel
- [ ] Click on `friends` table → see your test friend
- [ ] Click on `messages` table → see your test message

### 6. Next: Replace Dummy Data

In `pages/MessagingPage.tsx`, replace:

```typescript
// OLD: Dummy data
const DUMMY_FRIENDS = [
  {
    id: "1",
    name: "Sarah Johnson",
    avatar: "SJ",
    lastMessage: "See you tomorrow!",
    time: "2:30 PM",
    unread: 2,
    online: true,
  },
  // ...
];
```

With real Supabase data:

```typescript
// NEW: Real data from Supabase
const [friends, setFriends] = useState<Friend[]>([]);

useEffect(() => {
  loadFriends();
}, []);

async function loadFriends() {
  const friendsData = await getFriends("Lee");
  setFriends(friendsData);
}
```

## 📚 Reference Files

- **Database Schema**: `supabase/migrations/001_initial_schema.sql`
- **Helper Functions**: `supabase/supabaseClient.ts`
- **TypeScript Types**: `supabase/types.ts`
- **Usage Examples**: `supabase/examples.tsx`
- **Full Guide**: `supabase/README.md`

## 🐛 Troubleshooting

**"relation does not exist"**
→ You didn't run the SQL migration. Go back to Step 1.

**"Cannot find module '@/supabase/supabaseClient'"**
→ Your path aliases are set up. Use the import as shown.

**Empty arrays returned**
→ Tables are empty. Add sample data (Step 4) or create data through your app.

**Environment variables undefined**
→ Check your `.env` file has `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`

## ✨ You're Ready!

Once you complete these steps, you can:

- ✅ Create channels
- ✅ Add friends
- ✅ Send messages to channels
- ✅ Send direct messages to friends
- ✅ Fetch and display real messages

Start with the examples in `supabase/examples.tsx` to integrate into your components!
