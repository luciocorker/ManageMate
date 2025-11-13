# ManageMate Authentication & Friend Request System

## 🎯 Overview

This document outlines the authentication and friend request system for ManageMate. The system is designed to work with **placeholder authentication** now and seamlessly integrate with **Supabase Auth** later.

---

## 📋 System Architecture

### Current State: Placeholder Authentication

- **Storage**: Local AsyncStorage (user data stored on device)
- **Purpose**: Test and develop friend request flow without auth complexity
- **Limitation**: Data is not synced across devices
- **When to migrate**: When you're ready to implement Supabase Auth

### Future State: Supabase Auth Integration

All placeholder components are marked with:

```typescript
// 🚧 PLACEHOLDER [Component Name] 🚧
// TODO: Replace with Supabase Auth
```

---

## 🔑 Authentication System

### Components

#### 1. **AuthContext** (`contexts/AuthContext.tsx`)

- **Purpose**: Manages user authentication state
- **Features**:
  - `signIn()`: Authenticate user (placeholder - checks local storage)
  - `signUp()`: Register new user (placeholder - saves to local storage)
  - `signOut()`: Log out user
  - `user`: Current user object with `id`, `email`, `name`
  - `isAuthenticated`: Boolean flag

**🚧 Placeholder Behavior**:

- Users stored in AsyncStorage under `@managemate_users`
- Current user stored under `@managemate_auth_user`
- No password validation (accepts any password)

**🔄 Migration Path**:

```typescript
// Replace signIn with:
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
});

// Replace signUp with:
const { data, error } = await supabase.auth.signUp({ email, password });
// Then create profile:
await supabase.from("profiles").insert({ user_id: data.user.id, name });
```

---

#### 2. **SignInScreen** (`pages/SignInScreen.tsx`)

- Email and password input
- Clear placeholder warning banner
- Switches to SignUpScreen via `onSignUpPress`

**🚧 Placeholder**: Shows orange banner: "Placeholder - Auth will be integrated with Supabase later"

---

#### 3. **SignUpScreen** (`pages/SignUpScreen.tsx`)

- Full name, email, password, confirm password
- Basic validation (password length, matching passwords)
- Auto-fills email/name from friend request link

**🚧 Placeholder**: Shows orange banner: "Placeholder - Auth will be integrated with Supabase later"

---

#### 4. **AuthGate** (`components/AuthGate.tsx`)

- **Purpose**: Protects app behind authentication
- **Features**:
  - Shows SignIn/SignUp screens if not authenticated
  - Handles deep link friend requests
  - Forces sign-in before showing friend request modal
  - Displays banner when friend request pending

**Flow**:

```
User clicks friend request link
  ↓
AuthGate receives deep link
  ↓
Is user authenticated?
  - YES → Show friend request modal
  - NO → Show auth screen with banner
  ↓
User signs in/up
  ↓
Friend request modal appears
```

---

## 👥 Friend Request System

### Features

#### 1. **Send Friend Request** (`components/AddFriendModal.tsx`)

- **Input**: Friend's name and email
- **Output**: Shareable deep link
- **Validation**:
  - Valid email format
  - Cannot send to self
  - Duplicate request prevention (database level)

**Link Format**:

```
managemate://friend-request?requestId=xxx&senderName=Lee&receiverEmail=friend@email.com&receiverName=John
```

**User Flow**:

1. User opens "Add Friend" modal
2. Enters friend's name and email
3. Clicks "Send Request"
4. Supabase creates `friend_requests` record
5. App generates shareable link
6. User shares link via SMS, email, etc.

---

#### 2. **Receive Friend Request** (`components/FriendRequestModal.tsx`)

- **Fully Functional** (not a placeholder)
- Shows sender name and prompt to accept/decline
- Works with Supabase database

**User Flow (Recipient)**:

1. Recipient clicks invitation link
2. **If not signed in**: Forced to sign in/up first
   - Banner shows: "🎉 [Sender] sent you a friend request! Sign in or sign up to accept"
   - Email/name pre-filled from link
3. **After authentication**: Friend request modal appears
4. Recipient clicks "Accept" or "Decline"
5. **If Accept**:
   - Updates `friend_requests` status to "accepted"
   - Adds both users to each other's `friends` table
   - Users can immediately start messaging

---

## 🗄️ Database Schema

### Tables Used

#### `friend_requests`

```sql
id: uuid (primary key)
sender_name: text
sender_email: text
receiver_name: text
receiver_email: text
status: text ('pending', 'accepted', 'rejected')
created_at: timestamp
updated_at: timestamp
```

#### `friends`

```sql
id: uuid (primary key)
user_name: text
friend_name: text
created_at: timestamp
```

**Note**: When a friend request is accepted, two rows are created in `friends`:

- `{ user_name: "Lee", friend_name: "John" }`
- `{ user_name: "John", friend_name: "Lee" }`

This allows both users to query their friends list easily.

---

## 🔗 Deep Linking

### Configuration

**app.json**:

```json
{
  "scheme": "managemate"
}
```

### Deep Link Handler (`components/AuthGate.tsx`)

**Supported URLs**:

- `managemate://friend-request?requestId=xxx&senderName=Lee&receiverEmail=john@email.com&receiverName=John`

**Handling**:

1. Parse URL with `Linking.parse(url)`
2. Extract query parameters
3. Store pending friend request in state
4. If authenticated: Show modal immediately
5. If not authenticated: Show auth screen with pre-filled data

---

## 🚀 Testing the Flow

### Step-by-Step Test

#### 1. **Sign Up as User 1**

- Open app
- Click "Sign Up"
- Enter name: "Lee", email: "lee@test.com", password: "test123"
- Sign up

#### 2. **Send Friend Request**

- Go to Messages tab
- Click "+" button next to Friends
- Enter friend name: "John", email: "john@test.com"
- Click "Send Request"
- Click "Share Link" (copy the link)

#### 3. **Sign Out**

- Go to Profile tab (or implement sign out)
- Sign out

#### 4. **Receive Friend Request as User 2**

- Paste the deep link in browser/terminal:
  ```
  xcrun simctl openurl booted "managemate://friend-request?requestId=xxx&..."
  ```
- App opens with auth screen
- Banner shows: "🎉 Lee sent you a friend request!"
- Email "john@test.com" and name "John" pre-filled
- Sign up

#### 5. **Accept Friend Request**

- Friend request modal appears automatically
- Click "Accept"
- Success message: "You and Lee are now friends. You can start messaging!"

#### 6. **Start Messaging**

- Both users now see each other in Friends list
- Click on friend's name to open chat
- Send messages in real-time

---

## 🔄 Migration to Supabase Auth

### Step 1: Replace AuthContext

**Remove placeholder code**:

```typescript
// Delete from AuthContext.tsx:
- AsyncStorage user management
- Mock user database
```

**Add Supabase Auth**:

```typescript
import { supabase } from "@/lib/supabase";

async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  // Fetch user profile from profiles table
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", data.user.id)
    .single();

  setUser({
    id: data.user.id,
    email: data.user.email!,
    name: profile.name,
  });
}
```

---

### Step 2: Create Profiles Table

```sql
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  user_id uuid references auth.users unique not null,
  name text not null,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table profiles enable row level security;

-- Policy: Users can read their own profile
create policy "Users can read own profile"
  on profiles for select
  using (auth.uid() = user_id);

-- Policy: Users can update their own profile
create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = user_id);
```

---

### Step 3: Update Database Queries

**Current**: Uses `user_name` (string)
**Future**: Use `user_id` (uuid)

**Example Migration**:

```typescript
// Before (placeholder):
await supabase.from("friends").select("*").eq("user_name", "Lee");

// After (Supabase Auth):
await supabase.from("friends").select("*").eq("user_id", user.id);
```

---

### Step 4: Update Friend Requests

**Add user_id fields**:

```sql
alter table friend_requests
  add column sender_user_id uuid references auth.users,
  add column receiver_user_id uuid references auth.users;
```

**Update friend request flow**:

- Look up `receiver_user_id` by email when creating request
- Use `user_id` instead of `user_name` in friends table

---

## 📱 User Experience Highlights

### ✅ What Works Now (Fully Functional)

- Friend request database operations
- Accept/decline friend requests
- Direct messaging between friends
- Channel messaging
- Deep link handling
- Auth gate (forces sign in)

### 🚧 What's Placeholder

- User authentication (no real password checking)
- User data storage (local only)
- Session persistence across devices

### 🔮 What Will Change Later

- Auth screens will validate credentials with Supabase
- User data will sync across devices
- Email verification for new users
- Password reset functionality
- OAuth providers (Google, Apple, etc.)

---

## 🛠️ Technical Details

### Dependencies Installed

```json
{
  "@react-native-async-storage/async-storage": "^1.x.x",
  "expo-linking": "~8.0.8"
}
```

### Files Created/Modified

**New Files**:

- `contexts/AuthContext.tsx` - Auth state management
- `pages/SignInScreen.tsx` - Sign in UI
- `pages/SignUpScreen.tsx` - Sign up UI
- `components/AuthGate.tsx` - Auth guard + deep link handler
- `components/FriendRequestModal.tsx` - Accept/decline UI

**Modified Files**:

- `app/_layout.tsx` - Added AuthProvider
- `app/(tabs)/_layout.tsx` - Wrapped in AuthGate
- `pages/MessagingPage.tsx` - Uses useAuth() instead of CURRENT_USER
- `pages/ChatScreen.tsx` - Uses useAuth() instead of CURRENT_USER
- `pages/ChannelChatScreen.tsx` - Uses useAuth() instead of CURRENT_USER
- `components/AddFriendModal.tsx` - Generates shareable links

---

## 🎨 UI/UX Design

### Auth Screens

- **Theme**: Dark mode (#121212 background)
- **Accent**: Red (#DC2626)
- **Typography**: Bold headings, clean inputs
- **Banner**: Orange warning for placeholder notice

### Friend Request Modal

- **Theme**: Matches app (dark)
- **Buttons**: Red accept, gray decline
- **Message**: Clear sender name in red

### Auth Gate Banner

- **Color**: Red background
- **Icon**: 🎉 emoji
- **Text**: "X sent you a friend request! Sign in or sign up to accept"

---

## 📝 Summary

### Key Features Delivered

✅ **Authentication Placeholders**

- Sign In/Sign Up screens ready for Supabase Auth
- Clear TODO markers for easy migration
- Auth context with proper structure

✅ **Friend Request via Email Link**

- User enters friend's email
- Generates shareable deep link
- Friend clicks link → forced to sign in → accepts

✅ **Complete Friend Request Flow**

- Database integration (fully functional)
- Accept/Decline functionality
- Automatic friend list updates
- Immediate messaging after acceptance

✅ **Deep Linking**

- Handles `managemate://friend-request` URLs
- Extracts request data from URL
- Pre-fills auth forms with recipient info

✅ **All Components Ready for Supabase Auth**

- useAuth() hook used throughout
- No hardcoded users
- Structured for easy migration

---

## 🚦 Next Steps

1. **Test the flow** (see Testing section above)
2. **When ready for production**: Follow migration guide
3. **Add email verification** (Supabase feature)
4. **Add password reset** (Supabase feature)
5. **Add OAuth providers** (Google, Apple)
6. **Enhance profiles** (avatar, bio, etc.)

---

## 🐛 Known Limitations (Placeholder)

- No password security (accepts any password)
- No cross-device sync
- No session expiration
- No email verification
- Users can create duplicate accounts

**All limitations will be resolved with Supabase Auth integration.**

---

## 💡 Pro Tips

1. **Testing deep links on iOS simulator**:

   ```bash
   xcrun simctl openurl booted "managemate://friend-request?requestId=xxx&..."
   ```

2. **Testing deep links on Android emulator**:

   ```bash
   adb shell am start -W -a android.intent.action.VIEW -d "managemate://friend-request?requestId=xxx&..."
   ```

3. **Clearing auth state for testing**:

   ```typescript
   import AsyncStorage from "@react-native-async-storage/async-storage";
   await AsyncStorage.clear();
   ```

4. **Checking current user**:
   ```typescript
   const { user } = useAuth();
   console.log("Current user:", user);
   ```

---

## 📞 Support

For questions about:

- **Supabase Auth**: Check [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- **Deep Linking**: Check [Expo Linking Docs](https://docs.expo.dev/guides/linking/)
- **This Implementation**: Review this README and code comments

---

**Built with ❤️ for ManageMate**
