# Friend Profile Viewing - Feature Documentation

## Overview

Users can now view their friends' profile information in a read-only format. This feature is fully functional and ready for Supabase Auth integration.

## User Flow

### Complete Navigation Path:

1. **Friend List** (MessagingPage) → User sees list of friends
2. **Click Friend** → Opens ChatScreen for direct messaging
3. **Click Profile Avatar** in chat header → Opens ProfilePage (read-only)
4. **View Profile** → See friend's name, email, bio, phone, join date

## Features

### ✅ Fully Functional

1. **Friend List Display**

   - Shows all accepted friends
   - Avatar with initial letter
   - Online/offline status
   - Last message preview
   - Click to open chat

2. **Direct Messaging (ChatScreen)**

   - Real-time chat via Socket.IO
   - Message history from Supabase
   - Profile avatar in header (clickable)
   - Back navigation to friend list

3. **Profile Viewing (ProfilePage)**
   - **READ-ONLY** display of friend's profile
   - Profile information shown:
     - Profile image (placeholder: colored avatar with initial)
     - Full name
     - Email address
     - Phone number
     - Bio/About section
     - Member since date
     - Online/offline status
   - Back navigation to chat
   - Clear read-only indicator

### 🔒 Placeholder Features (Ready for Supabase Auth)

1. **Authentication**

   - Currently using AsyncStorage with username-based auth
   - All code marked with `🔒 PLACEHOLDER` comments
   - Ready to integrate with Supabase Auth

2. **Profile Data Source**

   - Currently using placeholder/dummy data
   - Will fetch from Supabase `profiles` table
   - Profile fields already defined in `Friend` interface

3. **Profile Images**
   - Currently showing colored avatars with initials
   - Ready for Supabase Storage integration
   - UI components already support images

## File Structure

### Core Files

#### `types/messaging.ts`

```typescript
export interface Friend {
  id: string;
  name: string;
  message: string;
  avatar: string;
  online: boolean;
  // Profile information
  email?: string;
  phone?: string;
  bio?: string;
  profileImage?: string;
  joinDate?: string;
}
```

#### `pages/ProfilePage.tsx`

- **Purpose**: Display friend's profile information (read-only)
- **Features**:
  - Large profile avatar/image
  - Name and online status
  - Bio section
  - Contact information (email, phone)
  - Member since date
  - Back to chat button
  - Read-only notice
- **Placeholders**:
  - Profile data fetching from Supabase
  - Profile image from Supabase Storage

#### `pages/ChatScreen.tsx`

- **Purpose**: Direct messaging between friends
- **Features**:
  - Clickable profile avatar in header
  - Real-time messaging
  - Message history
  - Profile viewing integration
- **Placeholders**:
  - User authentication
  - Profile data fetching

#### `pages/MessagingPage.tsx`

- **Purpose**: Friend list and channel list
- **Features**:
  - Friend list display
  - Navigation to chats
  - Friend requests
  - Channel management
- **Placeholders**:
  - User authentication
  - Friend relationship management

## Code Markers

All code is clearly marked with these comments:

### ✅ Functional Features

```typescript
// ✅ FUNCTIONAL: Feature description
// This feature works and is ready for production
```

### 🔒 Placeholder Features

```typescript
// ============================================================================
// 🔒 PLACEHOLDER: AUTHENTICATION & PROFILE DATA
// ============================================================================
// TODO: Replace with Supabase Auth integration
// When Supabase Auth is implemented:
// 1. Specific step 1
// 2. Specific step 2
// ============================================================================
```

## Integration Points for Supabase Auth

### 1. Authentication Context

**File**: `contexts/AuthContext.tsx`

**Current**: Placeholder using AsyncStorage

```typescript
const { user } = useAuth(); // Returns { id, email, name }
```

**Future**: Supabase Auth

```typescript
const {
  data: { user },
} = await supabase.auth.getUser();
// Use user.id for secure queries
```

### 2. Profile Data Fetching

**File**: `pages/ProfilePage.tsx`

**Current**: Placeholder data

```typescript
const email = friend.email || `${friend.name}@example.com`;
const bio = friend.bio || "No bio available";
```

**Future**: Supabase Query

```typescript
const { data: profile } = await supabase
  .from("profiles")
  .select("*")
  .eq("user_id", friend.id)
  .single();
```

### 3. Profile Images

**Current**: Colored avatars with initials

```typescript
<View style={[styles.avatar, { backgroundColor: friend.avatar }]}>
  <Text>{friend.name.charAt(0)}</Text>
</View>
```

**Future**: Supabase Storage

```typescript
{
  profileImage ? (
    <Image source={{ uri: profileImage }} style={styles.profileImage} />
  ) : (
    <View style={[styles.avatar, { backgroundColor: friend.avatar }]}>
      <Text>{friend.name.charAt(0)}</Text>
    </View>
  );
}
```

### 4. Row Level Security (RLS)

When implementing Supabase Auth, ensure these policies:

```sql
-- Profiles table policies
CREATE POLICY "Users can view profiles of their friends"
ON profiles FOR SELECT
USING (
  auth.uid() IN (
    SELECT user_id FROM friends WHERE friend_id = profiles.user_id
    UNION
    SELECT friend_id FROM friends WHERE user_id = profiles.user_id
  )
);

-- Friends can't edit other profiles
CREATE POLICY "Users can only edit own profile"
ON profiles FOR UPDATE
USING (auth.uid() = user_id);
```

## Testing Checklist

### Current Functionality (No Auth Required)

- [ ] Friend list displays correctly
- [ ] Click friend opens chat screen
- [ ] Profile avatar visible in chat header
- [ ] Click profile avatar opens profile page
- [ ] Profile displays read-only information
- [ ] Back navigation works from profile → chat → friend list
- [ ] Read-only notice is visible

### With Supabase Auth (Future)

- [ ] Profile data fetches from Supabase
- [ ] Only friends' profiles are viewable (RLS)
- [ ] Profile images load from Supabase Storage
- [ ] Online status updates in real-time
- [ ] Profile data is secure and private

## User Experience

### What Users See Now:

1. Open app → See friend list
2. Click "Sarah Johnson" → Opens chat
3. See Sarah's avatar at top of chat screen
4. Click Sarah's avatar → Opens her profile
5. See:
   - Large avatar with 'S'
   - Name: "Sarah Johnson"
   - Status: "🟢 Online"
   - Bio: "Software developer passionate about..."
   - Email: "sarah.johnson@example.com"
   - Phone: "+1 (555) 000-0000"
   - Member since: "Joined recently"
6. See notice: "👁️ Profile is read-only. You're viewing Sarah Johnson's information."
7. Click "Back to Chat" → Returns to chat

### What Changes with Supabase Auth:

- Profile data will be real (from database)
- Profile images will be actual photos
- Email/phone will be user's real contact info
- Bio will be user-written content
- Join date will be actual registration date
- Security: Only friends can view profiles

## Security Considerations

### Current State (Placeholder)

- ⚠️ No real authentication
- ⚠️ No data privacy
- ⚠️ Profile data is mock/placeholder

### With Supabase Auth

- ✅ Authenticated user sessions
- ✅ Row Level Security policies
- ✅ Encrypted passwords
- ✅ Private profile data
- ✅ Only friends can view profiles
- ✅ Users can only edit own profiles

## API Structure (For Future Supabase Integration)

### Get Friend Profile

```typescript
async function getFriendProfile(friendId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select(
      `
      id,
      user_id,
      email,
      full_name,
      bio,
      phone,
      profile_image_url,
      created_at
    `
    )
    .eq("user_id", friendId)
    .single();

  if (error) throw error;
  return data;
}
```

### Check if Users are Friends

```typescript
async function areFriends(userId: string, friendId: string) {
  const { data, error } = await supabase
    .from("friends")
    .select("id")
    .or(
      `and(user_name.eq.${userId},friend_name.eq.${friendId}),and(user_name.eq.${friendId},friend_name.eq.${userId})`
    )
    .eq("status", "accepted")
    .single();

  return !!data;
}
```

## Next Steps

1. ✅ **Current**: Profile viewing is functional with placeholder data
2. 🔄 **Next**: Integrate Supabase Auth
3. 🔄 **Next**: Create `profiles` table in Supabase
4. 🔄 **Next**: Implement RLS policies
5. 🔄 **Next**: Add profile image upload
6. 🔄 **Next**: Allow users to edit own profiles

## Related Documentation

- `FRIEND_REQUESTS_GUIDE.md` - Friend request system
- `REALTIME_MESSAGING_GUIDE.md` - Socket.IO messaging
- `CHANNEL_MEMBERS_GUIDE.md` - Channel management

## Support

All placeholder code is clearly marked and ready for Supabase Auth integration. The structure is in place and tested with the current placeholder auth system.
