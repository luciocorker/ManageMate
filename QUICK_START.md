# 🚀 Quick Start: Friend Request System

## Test the Complete Flow

### 1. Start the App

```bash
npx expo start
```

### 2. Sign Up as First User

1. Open the app
2. You'll see the **Sign In** screen (placeholder auth)
3. Click **"Sign Up"**
4. Enter:
   - Name: `Lee`
   - Email: `lee@test.com`
   - Password: `test123`
   - Confirm Password: `test123`
5. Click **"Sign Up"**
6. You're now signed in!

### 3. Send Friend Request

1. Navigate to **Messages** tab
2. Click the **+** button next to "Friends"
3. Enter friend details:
   - Name: `John`
   - Email: `john@test.com`
4. Click **"Send Request"**
5. Click **"Share Link"** to open share dialog
6. **Copy the link** (it starts with `managemate://friend-request?...`)

### 4. Sign Out (Optional)

- For now, you can manually clear the auth:
  - Close and reopen the app
  - Or clear AsyncStorage via dev tools

### 5. Test as Second User (Receive Friend Request)

#### On iOS Simulator:

```bash
xcrun simctl openurl booted "PASTE_THE_LINK_HERE"
```

#### On Android Emulator:

```bash
adb shell am start -W -a android.intent.action.VIEW -d "PASTE_THE_LINK_HERE"
```

#### What Happens:

1. App opens to **Sign Up** screen
2. **Red banner** shows: "🎉 Lee sent you a friend request!"
3. Email (`john@test.com`) and name (`John`) are **pre-filled**
4. Enter password: `test123`
5. Click **"Sign Up"**
6. **Friend Request Modal** appears automatically
7. Click **"Accept"**
8. Success! You and Lee are now friends

### 6. Start Messaging

1. Go to **Messages** tab
2. You'll see Lee in your Friends list
3. Click on Lee's name
4. Send messages back and forth!

---

## 🎯 Key Points

### ✅ What's Working

- Friend request database (Supabase)
- Accept/Decline functionality
- Direct messaging
- Deep link handling
- Auth gate protection

### 🚧 Placeholder Auth

- No real password validation
- Data stored locally (AsyncStorage)
- Won't sync across devices
- Ready for Supabase Auth migration

### 🔗 Deep Links

Format: `managemate://friend-request?requestId=xxx&senderName=Lee&receiverEmail=john@test.com&receiverName=John`

---

## 📝 Testing Checklist

- [ ] Sign up as User 1
- [ ] Send friend request
- [ ] Copy generated link
- [ ] Open link in simulator/emulator
- [ ] Sign up as User 2
- [ ] See friend request modal
- [ ] Accept request
- [ ] Both users see each other in Friends list
- [ ] Send messages between users

---

## 🐛 Troubleshooting

### Deep link not working?

- Make sure the app scheme is `managemate` in `app.json`
- Rebuild the app after changes to `app.json`
- Check that the URL is properly formatted

### Friend not showing in list?

- Check database: `friend_requests` table should have status `accepted`
- Check database: `friends` table should have both user entries
- Refresh the Messages page

### Auth not working?

- Check console for errors
- Clear AsyncStorage: `AsyncStorage.clear()`
- Restart the app

---

## 📚 Full Documentation

See **AUTH_FRIEND_REQUEST_GUIDE.md** for:

- Complete system architecture
- Migration guide to Supabase Auth
- Database schema
- All components explained
- Code examples

---

## 🎉 You're All Set!

The friend request system is ready to use. When you're ready for production, follow the migration guide to integrate Supabase Auth.
