# 📊 Importing CSV Test Data into Supabase

This guide shows you how to import the CSV test data files into your Supabase tables.

## 📁 CSV Files

Located in `supabase/test_data/`:

- `friends.csv` - 8 friends for user "Lee"
- `channels.csv` - 8 different channels
- `messages.csv` - 15 direct messages between friends

---

## 🔄 How to Import via Supabase Dashboard

### **Step 1: Import Friends**

1. Go to **Table Editor** in Supabase
2. Click on the **`friends`** table
3. Click the **"..."** menu (top right, next to Insert)
4. Select **"Import data via CSV"**
5. Choose `supabase/test_data/friends.csv`
6. Make sure columns match:
   - Column 1: `user_name`
   - Column 2: `friend_name`
7. Click **"Import"**
8. You should see ✅ **8 rows imported**

---

### **Step 2: Import Channels**

1. Still in **Table Editor**, click on **`channels`** table
2. Click the **"..."** menu
3. Select **"Import data via CSV"**
4. Choose `supabase/test_data/channels.csv`
5. Make sure columns match:
   - Column 1: `name`
   - Column 2: `description`
6. Click **"Import"**
7. You should see ✅ **8 channels imported**

---

### **Step 3: Import Messages**

1. Click on **`messages`** table
2. Click the **"..."** menu
3. Select **"Import data via CSV"**
4. Choose `supabase/test_data/messages.csv`
5. Make sure columns match:
   - Column 1: `sender_name`
   - Column 2: `receiver_name`
   - Column 3: `text`
   - Column 4: `channel_id` (will be empty for direct messages)
6. Click **"Import"**
7. You should see ✅ **15 messages imported**

---

## ✅ Verify Import

After importing, run this query in **SQL Editor**:

```sql
-- Check counts
SELECT 'friends' as table_name, COUNT(*) as count FROM friends
UNION ALL
SELECT 'channels', COUNT(*) FROM channels
UNION ALL
SELECT 'messages', COUNT(*) FROM messages;
```

You should see:

- friends: 8
- channels: 8
- messages: 15

---

## 🔄 Alternative: Import via SQL

If the CSV import doesn't work, you can paste this in **SQL Editor**:

```sql
-- Insert friends
INSERT INTO friends (user_name, friend_name) VALUES
  ('Lee', 'Sarah Johnson'),
  ('Lee', 'Mike Chen'),
  ('Lee', 'Emily Davis'),
  ('Lee', 'James Wilson'),
  ('Lee', 'Lisa Anderson'),
  ('Lee', 'Alex Martinez'),
  ('Lee', 'Chris Taylor'),
  ('Lee', 'Jordan Smith');

-- Insert channels
INSERT INTO channels (name, description) VALUES
  ('General', 'Main discussion channel for everyone'),
  ('Project Team', 'Discuss project updates and milestones'),
  ('Design Squad', 'Design team discussions and reviews'),
  ('Development', 'Developer team channel'),
  ('Marketing', 'Marketing team and campaigns'),
  ('Sales Team', 'Sales discussions and leads'),
  ('HR & Admin', 'Human resources and administration'),
  ('Random', 'Off-topic and fun conversations');

-- Insert direct messages
INSERT INTO messages (sender_name, receiver_name, text) VALUES
  ('Lee', 'Sarah Johnson', 'Hey! Did you finish the project?'),
  ('Sarah Johnson', 'Lee', 'Yes! Just submitted it. Thanks for checking in!'),
  ('Lee', 'Mike Chen', 'Thanks for your help yesterday!'),
  ('Mike Chen', 'Lee', 'No problem! Happy to help anytime.'),
  ('Lee', 'Emily Davis', 'See you at the meeting tomorrow'),
  ('Emily Davis', 'Lee', 'Absolutely! I''ll bring the presentation.'),
  ('Lee', 'James Wilson', 'Can you send me those files?'),
  ('James Wilson', 'Lee', 'Sure! Sending them now via email.'),
  ('Lee', 'Lisa Anderson', 'Great work on the presentation!'),
  ('Lisa Anderson', 'Lee', 'Thank you! Glad you liked it.'),
  ('Sarah Johnson', 'Lee', 'Do you have time for a quick call?'),
  ('Mike Chen', 'Lee', 'I updated the documentation.'),
  ('Emily Davis', 'Lee', 'The design mockups are ready for review.'),
  ('James Wilson', 'Lee', 'Deployment is complete and running smoothly.'),
  ('Lisa Anderson', 'Lee', 'Marketing campaign launch went well!');
```

---

## 🎯 What You'll See in Your App

After importing:

### **Friends Section**

- Sarah Johnson
- Mike Chen
- Emily Davis
- James Wilson
- Lisa Anderson
- Alex Martinez
- Chris Taylor
- Jordan Smith

### **Channels Section**

- General
- Project Team
- Design Squad
- Development
- Marketing
- Sales Team
- HR & Admin
- Random

### **Messages**

- Click on any friend to see your conversation history
- 15 total messages between you and your friends

---

## 🚀 Next Steps

1. ✅ Import all 3 CSV files
2. ✅ Verify data in Table Editor
3. ✅ Open your app and see real data!
4. 🔮 Start sending real messages using the helper functions

**All your data is now persistent in Supabase!** 🎉
