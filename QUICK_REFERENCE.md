# Quick Reference Guide

## 🚀 Start App

```bash
npm start
```

## ⚙️ Setup (Do Once)

### Firebase (5 min)

1. https://console.firebase.google.com/
2. Project: **managemate-32f1d**
3. Authentication → Sign-in method → Enable Email/Password
4. Templates → Verify email verification & password reset enabled

### Supabase (2 min)

1. https://app.supabase.com/
2. SQL Editor → Paste `supabase-setup.sql` → Run

## 📱 Features

| Feature         | Location                         | Description                         |
| --------------- | -------------------------------- | ----------------------------------- |
| Landing Page    | `app/(auth)/landing.tsx`         | First screen, Get Started/Sign In   |
| Sign Up         | `app/(auth)/signup.tsx`          | Create account + email verification |
| Sign In         | `app/(auth)/signin.tsx`          | Login with verification check       |
| Forgot Password | `app/(auth)/forgot-password.tsx` | Password reset via email            |
| Sign Out        | `app/(tabs)/profile.tsx`         | Sign out button                     |

## 🔑 Credentials

### Firebase

- Project: managemate-32f1d
- Config: `lib/firebase.ts`

### Supabase

- URL: https://xdvlkprwnnpxvpqncomn.supabase.co
- Config: `.env` + `lib/supabase.ts`

## ✅ Test Flow

1. **Sign Up** → Enter details → Check email → Click verification link
2. **Sign In (Unverified)** → See "Email Not Verified" alert
3. **Sign In (Verified)** → Access dashboard
4. **Forgot Password** → Enter email → Check email → Reset password
5. **Sign Out** → Profile tab → Sign Out button

## 🐛 Common Issues

| Problem            | Fix                                   |
| ------------------ | ------------------------------------- |
| No email received  | Check spam, verify Firebase templates |
| Can't sign in      | Verify email first                    |
| Supabase error     | Run SQL script                        |
| Email not verified | Click link in email, wait 10 seconds  |

## 📁 Important Files

- `lib/firebase.ts` - Firebase config
- `lib/supabase.ts` - Supabase config
- `app/(auth)/signin.tsx` - Sign in logic
- `app/(auth)/signup.tsx` - Sign up logic
- `app/(auth)/forgot-password.tsx` - Password reset
- `supabase-setup.sql` - Database schema

## 📚 Documentation

- `COMPLETE_SETUP.md` - Full setup guide
- `FIREBASE_SETUP_GUIDE.md` - Detailed Firebase/Supabase setup
- `TEST_CHECKLIST.md` - Testing guide

## 🔍 Monitoring

**Firebase**: console.firebase.google.com → Authentication → Users
**Supabase**: app.supabase.com → Table Editor → users

## ✨ All Features

- ✅ Sign up with email/password
- ✅ Email verification (required)
- ✅ Sign in with verification check
- ✅ Resend verification email
- ✅ Forgot password
- ✅ Password reset via email
- ✅ Sign out
- ✅ User data in Supabase
- ✅ Firebase UID linking
- ✅ Verification status tracking
