# Friend Invitation System Guide

## Overview
The friend invitation system allows authenticated users to send friend requests via email. The system uses Firebase Authentication for user identity and Supabase for storing friend relationships.

## How It Works

### 1. Sending a Friend Request

When a user wants to add a friend:

1. **Open Add Friend Modal**: Click the "+" button in the Friends section of the Messaging page
2. **Enter Friend's Email**: Type the email address of the person you want to add
3. **Send Request**: The system will:
   - Look up the receiver by email in the Supabase users table
   - Create a friend request record with status "pending"
   - Generate a deep link with the request ID
   - Open the user's email client with a pre-filled invitation

### 2. Email Invitation

The email contains:
- A personalized message from the sender
- A deep link to accept the friend request
- Instructions for new users to download the app first

**Deep Link Format:**
```
managemate://friend-request?requestId={id}&senderEmail={email}&senderName={name}
```

### 3. Accepting a Friend Request

When the recipient clicks the link:

1. **App Opens**: The deep link opens the ManageMate app
2. **Authentication Check**: 
   - If not signed in → Redirects to landing/sign-in page
   - If signed in → Shows friend request modal
3. **Accept/Decline**: User can accept or decline the request
4. **Friend Added**: If accepted, both users are added to each other's friends list

## Technical Details

### Database Schema

**friend_requests table:**
- `id`: Unique request ID
- `sender_id`: Firebase UID of sender
- `receiver_id`: Firebase UID of receiver (looked up by email)
- `status`: "pending", "accepted", or "rejected"
- `created_at`: Timestamp
- `updated_at`: Timestamp

**friends table:**
- `id`: Unique friendship ID
- `user_id`: Firebase UID
- `friend_id`: Firebase UID of friend
- Bidirectional: Both users have entries

### Key Functions

**supabase/supabaseClient.ts:**
- `sendFriendRequest(input)`: Creates friend request, looks up receiver by email
- `acceptFriendRequest(requestId, userId)`: Accepts request and creates friendship
- `rejectFriendRequest(requestId, userId)`: Rejects request
- `getFriendRequestById(requestId)`: Gets request with sender profile info
- `getUserProfile(userId)`: Gets user profile by Firebase UID
- `getFriends(userId)`: Gets all friends for a user

### Components

**AddFriendModal.tsx:**
- Input for friend's email
- Validates email format
- Creates friend request
- Opens email client with invitation

**FriendRequestModal.tsx:**
- Displays sender information
- Fetches request details from database
- Handles accept/decline actions

**AuthGate.tsx:**
- Handles deep link routing
- Manages authentication state
- Shows friend request modal when appropriate

## Authentication Flow

1. **Sender must be authenticated** to send requests (uses Firebase UID)
2. **Receiver must be authenticated** to accept requests
3. **Email verification** is required before accessing the app
4. **Deep links work** whether the app is closed, backgrounded, or open

## Security

- Friend requests use Firebase UIDs, not emails, for database relationships
- Row Level Security (RLS) policies ensure users can only:
  - Create friend requests as themselves
  - Accept/reject requests sent to them
  - View their own friendships
- Email lookup happens server-side in Supabase

## Testing

To test the friend invitation flow:

1. **Create two accounts** with different emails
2. **Sign in as User A**
3. **Send friend request** to User B's email
4. **Check email** (or copy the deep link from logs)
5. **Sign in as User B** (or open link if already signed in)
6. **Accept the request**
7. **Verify** both users now see each other in their friends list

## Future Enhancements

- Push notifications for friend requests
- In-app friend request notifications
- Friend suggestions based on contacts
- QR code friend invitations
- Batch friend invitations
