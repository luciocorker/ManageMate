# Authentication Setup ✅

## Overview

Your app now has a complete authentication flow with:

- 🎨 Modern landing page with Teams-like design
- 🔐 Sign In screen
- 📝 Sign Up screen
- 🛡️ Protected routes with session management

## Setup Instructions

### 1. Configure Supabase

1. Create a `.env` file in the root directory (copy from `.env.example`)
2. Add your Supabase credentials:
   ```
   EXPO_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```
3. Get these values from: https://app.supabase.com/project/_/settings/api

### 2. Restart Expo

After adding the .env file, restart your Expo dev server:

```bash
npm start
```

## User Flow

1. **First Launch**: Users see the landing page at `/(auth)/landing`
2. **New Users**: Click "Get Started" → Sign Up screen → Email verification
3. **Existing Users**: Click "Sign In" → Sign In screen → Dashboard
4. **After Auth**: Redirected to dashboard at `/(tabs)/dashboard`
5. **Sign Out**: Available in Profile tab

## Features

- ✅ Modern gradient design (Teams-like aesthetic)
- ✅ Email/Password authentication via Supabase
- ✅ Social auth buttons (Apple & Google - ready for implementation)
- ✅ Password visibility toggle
- ✅ Form validation
- ✅ Loading states
- ✅ Protected routes
- ✅ Session persistence with SecureStore
- ✅ Auto-redirect based on auth state

## File Structure

```
app/
├── (auth)/
│   ├── _layout.tsx      # Auth stack navigator
│   ├── landing.tsx      # Landing page with features & pricing
│   ├── signin.tsx       # Sign in form
│   └── signup.tsx       # Sign up form
├── (tabs)/
│   └── profile.tsx      # Updated with sign out button
├── _layout.tsx          # Root layout with auth routes
└── index.tsx            # Auth check & redirect logic
```

## Testing

1. Scan the QR code in Expo Go
2. You'll see the landing page (if not authenticated)
3. Create an account with email/password
4. Check your email for verification (optional based on Supabase settings)
5. Sign in and access the dashboard
6. Sign out from the Profile tab to return to landing

## Next Steps

### Enable Social Authentication

1. **Apple Sign In**:
   - Configure in Supabase dashboard
   - Update handler in `signin.tsx` and `signup.tsx`
2. **Google Sign In**:
   - Configure in Supabase dashboard
   - Update handler in `signin.tsx` and `signup.tsx`

### Customize Design

- Colors are defined in the StyleSheet of each screen
- Primary color: `#ff6b6b` (coral red)
- Gradient: `#667eea` → `#764ba2` (purple)
- Modify these to match your brand
