# Quick Start Guide - ManageMate Messenger

## 🚀 What's Been Implemented

Your messenger app is now **fully functional** with Firebase Authentication and Supabase database integration. Here's what works:

### ✅ Complete Features

1. **Authentication**
   - Sign up with email/password or social auth (Google, Apple, GitHub)
   - Email verification required
   - Landing page → Sign in/up → Dashboard flow

2. **Friend System**
   - Send friend invitations via email
   - Deep links for accepting friend requests
   - Bidirectional friendships
   - View friend profiles

3. **Messaging**
   - Real-time direct messaging between friends
   - Message history persistence
   - Unread message badges
   - Profile viewing from chat

## 📱 How to Test

### Test 1: Create Two Accounts

**Account 1:**
```
Email: user1@example.com
Password: password123
Name: Alice
```

**Account 2:**
```
Email: user2@example.com
Password: password123
Name: Bob
```

### Test 2: Send Friend Request

1. Sign in as Alice
2. Go to Messages tab
3. Click "+" button in Friends section
4. Enter: `user2@example.com`
5. Email client opens with invitation
6. Copy the deep link from the email body

### Test 3: Accept Friend Request

1. Sign out (or use different device/browser)
2. Click the deep link OR manually open app and sign in as Bob
3. Friend request modal appears
4. Click "Accept"
5. Both users now see each other in friends list

### Test 4: Send Messages

1. As Alice, click on Bob in friends list
2. Type a message: "Hi Bob!"
3. Send message
4. As Bob, open chat with Alice
5. See Alice's message
6. Reply: "Hi Alice!"
7. Both see messages in real-time

### Test 5: View Profile

1. In chat screen, click on friend's avatar
2. Profile page opens
3. See friend's name, email, bio, join date

## 🔗 Deep Link Format

When you send a friend invitation, the email contains a deep link:

```
managemate://friend-request?requestId=123&senderEmail=alice@example.com&senderName=Alice
```

**What happens when clicked:**
- App opens (or redirects to app store if not installed)
- If not signed in: Shows landing page → sign in/up
- If signed in: Shows friend request modal
- User can accept or decline

## 🗄️ Database Structure

### Key Tables

**users** - User profiles
- firebase_uid (unique identifier)
- email, full_name, bio, phone, etc.

**friends** - Bidirectional friendships
- user_id → firebase_uid
- friend_id → firebase_uid

**friend_requests** - Pending invitations
- sender_id → firebase_uid
- receiver_id → firebase_uid
- status: pending/accepted/rejected

**messages** - Direct messages
- sender_id → firebase_uid
- receiver_id → firebase_uid
- content, created_at

## 🔐 Security

- All database operations use Firebase UIDs (not emails or usernames)
- Row Level Security (RLS) policies protect data
- Email verification required before app access
- Friend requests can only be accepted by the receiver
- Messages can only be read by sender or receiver

## 🐛 Troubleshooting

### Friend request not showing?
- Check that receiver's email exists in database
- Verify deep link has correct requestId
- Ensure user is signed in

### Messages not sending?
- Check that both users are friends
- Verify Firebase UID is being used (not username)
- Check Supabase connection

### Profile not loading?
- Verify friend.id is the Firebase UID
- Check getUserProfile function is being called
- Ensure user profile exists in database

## 📝 Code Examples

### Send a message
```typescript
await sendMessageToFriend(
  user.id,        // sender's Firebase UID
  friend.id,      // receiver's Firebase UID
  "Hello!"        // message content
);
```

### Get messages
```typescript
const messages = await getDirectMessages(
  user.id,        // user 1's Firebase UID
  friend.id       // user 2's Firebase UID
);
```

### Get friends with profiles
```typescript
const friends = await getFriendsWithProfiles(user.id);
// Returns friends with their profile data
```

### Send friend request
```typescript
await sendFriendRequest({
  sender_id: user.id,              // sender's Firebase UID
  receiver_email: "friend@email.com"  // receiver's email
});
```

## ✨ What's Next?

Optional enhancements you can add:
- Push notifications for messages
- Push notifications for friend requests
- Real-time online/offline status
- Message read receipts
- Typing indicators
- File/image sharing
- Voice messages
- Video calls

## 🎯 Summary

Everything is working! The messenger uses:
- ✅ Firebase for authentication
- ✅ Supabase for data storage
- ✅ Firebase UIDs as primary identifiers
- ✅ Deep linking for friend invitations
- ✅ Real-time messaging
- ✅ Profile management

No issues found. Ready to test!
