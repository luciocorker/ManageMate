# Firebase + Supabase Setup Guide

## ✅ What's Been Configured

Your app now uses:

- **Firebase** for authentication (sign up, sign in, email verification, password reset)
- **Supabase** for storing user data

## 🔥 Firebase Setup

### 1. Enable Email/Password Authentication

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **managemate-32f1d**
3. Go to **Authentication** → **Sign-in method**
4. Enable **Email/Password** provider
5. Click **Save**

### 2. Configure Email Verification

1. In Firebase Console → **Authentication** → **Templates**
2. Click on **Email address verification**
3. Customize the email template (optional)
4. Make sure it's enabled

### 3. Configure Password Reset

1. In Firebase Console → **Authentication** → **Templates**
2. Click on **Password reset**
3. Customize the email template (optional)
4. Set the action URL if needed

## 🗄️ Supabase Setup

### 1. Create Users Table

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Go to **SQL Editor**
4. Copy and paste the contents of `supabase-setup.sql`
5. Click **Run**

This creates a `users` table with:

- `firebase_uid` - Links to Firebase user
- `email` - User's email
- `full_name` - User's display name
- `email_verified` - Verification status
- `created_at` / `updated_at` - Timestamps

### 2. Verify Table Creation

1. Go to **Table Editor** in Supabase
2. You should see the `users` table
3. Check that RLS (Row Level Security) is enabled

## 📱 App Features

### Sign Up Flow

1. User enters name, email, and password
2. Firebase creates the account
3. Firebase sends verification email
4. User data is stored in Supabase
5. User is redirected to sign in

### Sign In Flow

1. User enters email and password
2. Firebase authenticates
3. **Email verification check** - User must verify email first
4. If not verified, shows option to resend verification email
5. If verified, updates Supabase and redirects to dashboard

### Forgot Password Flow

1. User clicks "Forgot password?"
2. Enters email address
3. Firebase sends password reset email
4. User clicks link in email
5. Resets password on Firebase page
6. Can sign in with new password

### Sign Out Flow

1. User clicks "Sign Out" in Profile tab
2. Firebase signs out
3. Redirects to landing page

## 🧪 Testing

### Test Sign Up

```bash
npm start
```

1. Scan QR code in Expo Go
2. Tap "Get Started"
3. Fill in name, email, password
4. Tap "Create Account"
5. Check your email for verification link
6. Click the verification link

### Test Sign In (Before Verification)

1. Try to sign in with unverified email
2. Should see "Email Not Verified" alert
3. Can resend verification email

### Test Sign In (After Verification)

1. Verify email first
2. Sign in with email/password
3. Should redirect to dashboard

### Test Forgot Password

1. On sign in screen, tap "Forgot password?"
2. Enter your email
3. Tap "Send Reset Link"
4. Check email for reset link
5. Click link and reset password
6. Sign in with new password

## 🔍 Troubleshooting

### Email Verification Not Sending

- Check Firebase Console → Authentication → Templates
- Verify Email/Password provider is enabled
- Check spam folder

### Supabase Insert Failing

- Run the SQL script in Supabase SQL Editor
- Check that RLS policies are created
- Verify table exists in Table Editor

### Sign In Not Working

- Make sure email is verified
- Check Firebase Console → Authentication → Users
- Verify user exists and email is verified

### Password Reset Not Working

- Check Firebase Console → Authentication → Templates
- Verify password reset template is enabled
- Check spam folder for reset email

## 📊 Monitoring

### Firebase Console

- View all users: Authentication → Users
- Check email verification status
- See sign-in methods

### Supabase Dashboard

- View user data: Table Editor → users
- Check stored information
- Verify firebase_uid matches

## 🔐 Security Notes

1. **Email Verification Required** - Users cannot sign in until email is verified
2. **Firebase UIDs** - Used to link Firebase auth with Supabase data
3. **RLS Enabled** - Row Level Security protects user data in Supabase
4. **Password Reset** - Handled securely by Firebase

## 📝 Files Modified

- ✅ `lib/firebase.ts` - Firebase configuration
- ✅ `app/(auth)/signin.tsx` - Sign in with email verification check
- ✅ `app/(auth)/signup.tsx` - Sign up with Firebase + Supabase
- ✅ `app/(auth)/forgot-password.tsx` - Password reset screen
- ✅ `app/(auth)/_layout.tsx` - Added forgot-password route
- ✅ `app/index.tsx` - Firebase auth state listener
- ✅ `app/(tabs)/profile.tsx` - Firebase sign out
- ✅ `supabase-setup.sql` - Database schema

## 🚀 Ready to Go!

Your app is now configured with:

- ✅ Firebase authentication
- ✅ Email verification requirement
- ✅ Password reset functionality
- ✅ Supabase user data storage
- ✅ Secure sign in/sign up flow

Run `npm start` and test the complete authentication flow!
