# 🍎 Build iOS App with EAS - Complete Guide

## 🎯 Prerequisites

Before building, you need:

### 1. Firebase Configuration File

- ✅ Download `GoogleService-Info.plist` from Firebase Console
- ✅ Place in project root

### 2. Environment Variables

- ✅ Web Client ID in .env
- ✅ iOS Client ID in .env (already added: `711325957153-d3g1cc5ih282iua0d51icmg2on7v4og3...`)

### 3. EAS CLI

```bash
npm install -g eas-cli
```

### 4. Expo Account

- Create account at: https://expo.dev/signup
- Or login: `eas login`

## 📋 Step-by-Step Build Process

### Step 1: Get GoogleService-Info.plist

1. **Go to Firebase Console:**

   - URL: https://console.firebase.google.com/
   - Project: **managemate-32f1d**

2. **Navigate to Project Settings:**

   - Click gear icon ⚙️ → **Project settings**
   - Scroll down to **Your apps** section

3. **Add iOS App (if not exists):**

   - Click **Add app** → Select **iOS** (Apple icon)
   - **Bundle ID:** `com.managemate.app`
   - **App nickname:** `ManageMate iOS`
   - Click **Register app**

4. **Download Config File:**
   - Click **Download GoogleService-Info.plist**
   - Save to your project root folder
   - Verify filename is exactly: `GoogleService-Info.plist`

### Step 2: Verify .env Configuration

Open `.env` and verify these are set:

```env
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://xdvlkprwnnpxvpqncomn.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-key

# Google OAuth
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=711325957153-d3g1cc5ih282iua0d51icmg2on7v4og3.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your-android-client-id.apps.googleusercontent.com
```

### Step 3: Verify Files in Project Root

Check these files exist:

```
ManageMate/
├── GoogleService-Info.plist  ← Must be here!
├── .env                       ← Must have Client IDs
├── app.config.js              ← Already configured ✅
└── eas.json                   ← Already created ✅
```

### Step 4: Install EAS CLI (if not installed)

```bash
npm install -g eas-cli
```

### Step 5: Login to Expo

```bash
eas login
```

Enter your Expo credentials.

### Step 6: Configure EAS (First Time Only)

```bash
eas build:configure
```

This will:

- Create/update `eas.json`
- Set up build profiles
- Configure project settings

### Step 7: Build for iOS

#### Option A: Development Build (Recommended for Testing)

```bash
eas build --platform ios --profile development
```

**Benefits:**

- Faster build
- Can install on device via TestFlight or direct install
- Good for testing

#### Option B: Preview Build

```bash
eas build --platform ios --profile preview
```

**Benefits:**

- Internal distribution
- Can share with testers
- No App Store needed

#### Option C: Production Build

```bash
eas build --platform ios --profile production
```

**Benefits:**

- Ready for App Store
- Optimized for production
- Full release build

### Step 8: Wait for Build

The build process takes **15-30 minutes**. You'll see:

- Build queued
- Build in progress
- Build completed (or failed)

You can:

- Close terminal (build continues on EAS servers)
- Check status: https://expo.dev/accounts/[your-account]/projects/managemate/builds
- Get notified via email when complete

### Step 9: Download and Install

#### After Build Completes:

1. **Download IPA file** from EAS build page
2. **Install on Device:**

**Option A: TestFlight (Recommended)**

- EAS can submit to TestFlight automatically
- Easier for testing
- No cable needed

**Option B: Direct Install**

- Use Apple Configurator
- Or use `eas build:run` command
- Requires cable connection

### Step 10: Test Google Sign-In

1. Open app on iPhone
2. Tap "Continue with Google"
3. Sign in with Google account
4. ✅ Should work with native Google Sign-In!

## 🔧 Build Commands Reference

```bash
# Development build (recommended for testing)
eas build --platform ios --profile development

# Preview build (for internal testing)
eas build --platform ios --profile preview

# Production build (for App Store)
eas build --platform ios --profile production

# Check build status
eas build:list

# View build details
eas build:view [build-id]

# Install on connected device
eas build:run --platform ios
```

## 📱 Testing After Build

### What to Test:

1. **Email/Password Authentication:**

   - Sign up → Verify email → Sign in ✅

2. **Google Sign-In:**

   - Tap "Continue with Google"
   - Native Google Sign-In should appear
   - Sign in with Google account ✅

3. **Apple Sign-In:**

   - Tap "Continue with Apple"
   - Native Apple Sign-In should appear
   - Sign in with Apple ID ✅

4. **GitHub Sign-In:**

   - Tap "Continue with GitHub"
   - Web-based sign in ✅

5. **Forgot Password:**

   - Test password reset flow ✅

6. **Sign Out:**
   - Sign out and sign in again ✅

### Verify in Supabase:

- Check Users table
- Verify user data is stored
- Check email_verified status

## 🐛 Troubleshooting

### "GoogleService-Info.plist not found"

**Solution:**

- Download from Firebase Console
- Place in project root (not in subdirectory)
- Verify filename exactly: `GoogleService-Info.plist`

### "Build failed: Invalid bundle identifier"

**Solution:**

- Verify Bundle ID in app.config.js: `com.managemate.app`
- Check Apple Developer account has this Bundle ID registered

### "Google Sign-In not working"

**Solution:**

- Verify iOS Client ID in .env
- Check GoogleService-Info.plist is included
- Ensure Bundle ID matches: `com.managemate.app`

### "Build takes too long"

**Solution:**

- This is normal (15-30 minutes)
- Check build status on Expo dashboard
- You can close terminal, build continues

### "Cannot install on device"

**Solution:**

- Use TestFlight for easier installation
- Or use Apple Configurator for direct install
- Check device is registered in Apple Developer account

## 💡 Tips

### For Faster Testing:

1. Use development profile
2. Install via TestFlight
3. Test on physical device (not simulator)

### For Production:

1. Use production profile
2. Test thoroughly first
3. Submit to App Store when ready

### Cost:

- EAS builds are free for limited builds per month
- Check your plan: https://expo.dev/pricing
- Upgrade if needed for more builds

## ✅ Checklist Before Building

- [ ] Downloaded GoogleService-Info.plist from Firebase
- [ ] Placed GoogleService-Info.plist in project root
- [ ] Verified .env has Web Client ID
- [ ] Verified .env has iOS Client ID (already added ✅)
- [ ] Installed EAS CLI: `npm install -g eas-cli`
- [ ] Logged in to Expo: `eas login`
- [ ] Ready to build: `eas build --platform ios --profile development`

## 🎯 Quick Start

```bash
# 1. Install EAS CLI
npm install -g eas-cli

# 2. Login
eas login

# 3. Build
eas build --platform ios --profile development

# 4. Wait 15-30 minutes

# 5. Download and install

# 6. Test Google Sign-In!
```

## 📚 Additional Resources

- **EAS Build Docs:** https://docs.expo.dev/build/introduction/
- **iOS Builds:** https://docs.expo.dev/build-reference/ios-builds/
- **TestFlight:** https://docs.expo.dev/build/internal-distribution/

## 🎉 After Successful Build

You'll have:

- ✅ Native iOS app
- ✅ Native Google Sign-In working
- ✅ Apple Sign-In working
- ✅ All authentication methods functional
- ✅ Production-ready app

---

**Ready to build? Follow the steps above!** 🚀

## Quick Command

```bash
# After getting GoogleService-Info.plist:
eas build --platform ios --profile development
```

**Good luck with your build!** 🍎
