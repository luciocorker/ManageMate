# Fix Authentication Issues

## Problem
The sign-in and sign-up screens were failing because:
1. Missing `signInWithGithub` import in signin.tsx ✅ FIXED
2. Code was trying to insert into a `users` table that doesn't exist in Supabase
3. Your schema has a `profiles` table designed for Supabase Auth, but the app uses Firebase Auth

## Solution

### Step 1: Run the SQL Migration ⚠️ IMPORTANT

You need to create the `users` table in your Supabase database:

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Go to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy and paste the contents of `supabase/firebase-users-table.sql`
6. Click **Run** or press Ctrl+Enter

This will create a new `users` table specifically for Firebase users with these columns:
- `id` (UUID, primary key)
- `firebase_uid` (TEXT, unique - stores Firebase user ID)
- `email` (TEXT, unique)
- `full_name` (TEXT)
- `avatar_url` (TEXT)
- `email_verified` (BOOLEAN)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Step 2: Test Authentication

After running the SQL:

1. **Test Sign Up:**
   - Open the app and go to the sign-up screen
   - Create a new account with email/password
   - Check your email for verification link
   - Verify your email

2. **Test Sign In:**
   - Go to the sign-in screen
   - Sign in with your verified email
   - Should redirect to dashboard

3. **Check Supabase:**
   - Go to Supabase Dashboard → Table Editor
   - Select the `users` table
   - You should see your user data with `firebase_uid` populated

## What Was Fixed in Code

### ✅ Fixed Files:
1. **app/(auth)/signin.tsx** - Added missing `signInWithGithub` import
2. **lib/socialAuth.ts** - Changed table name from `"Users"` to `"users"`

### 📝 Files That Already Use Correct Table Name:
- app/(auth)/signin.tsx - Already uses `"users"`
- app/(auth)/signup.tsx - Already uses `"users"`

## Understanding Your Database Structure

You now have TWO user-related tables:

1. **`profiles` table** - For Supabase Auth (currently not used)
   - References `auth.users` (Supabase's built-in auth)
   - Has RLS policies enabled

2. **`users` table** - For Firebase Auth (what your app uses)
   - Stores Firebase user data with `firebase_uid`
   - RLS disabled for testing
   - This is what signin/signup/social auth use

## Next Steps

After authentication works:

1. **Test all auth methods:**
   - Email/Password sign up & sign in ✓
   - Google Sign In (requires Google Web Client ID in .env)
   - Apple Sign In (iOS only)
   - GitHub Sign In (web only currently)

2. **Verify user data sync:**
   - Sign up → Check `users` table in Supabase
   - Ensure `firebase_uid`, `email`, `full_name` are populated

3. **Enable RLS in production:**
   - Currently RLS is disabled for testing
   - In production, enable RLS and create proper policies

## Troubleshooting

If sign-in/sign-up still doesn't work:

1. **Check the terminal for errors** - Look for Supabase connection errors
2. **Verify .env file** - Make sure `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` are set
3. **Check Supabase Dashboard** - Verify the `users` table was created successfully
4. **Check Firebase Console** - Make sure Firebase Auth is enabled for Email/Password

## Current Status

✅ Code fixed - `signInWithGithub` import added
✅ Table names corrected - all code uses `"users"`
✅ Migration SQL created - `supabase/firebase-users-table.sql`
⚠️ **ACTION REQUIRED** - You must run the SQL migration in Supabase Dashboard

Once you run the migration SQL, authentication should work properly!
