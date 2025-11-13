# Build App with Google Sign-In - Complete Guide

## 🎯 Overview

This guide will help you build your app with native Google Sign-In support for iOS and Android.

## 📋 Prerequisites

- EAS CLI installed: `npm install -g eas-cli`
- Expo account created
- Firebase project: **managemate-32f1d**

## 🔧 Setup Steps

### Step 1: Get Firebase Configuration Files

#### For Android (google-services.json):

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **managemate-32f1d**
3. Click the gear icon ⚙️ → **Project settings**
4. Scroll down to **Your apps**
5. If you don't have an Android app:
   - Click **Add app** → Select **Android**
   - Package name: `com.managemate.app`
   - App nickname: `ManageMate Android`
   - Click **Register app**
6. Download **google-services.json**
7. Place it in your project root folder

#### For iOS (GoogleService-Info.plist):

1. In Firebase Console → **Project settings**
2. Scroll down to **Your apps**
3. If you don't have an iOS app:
   - Click **Add app** → Select **iOS**
   - Bundle ID: `com.managemate.app`
   - App nickname: `ManageMate iOS`
   - Click **Register app**
4. Download **GoogleService-Info.plist**
5. Place it in your project root folder

### Step 2: Get Google OAuth Client IDs

#### Web Client ID (Already in Firebase):

1. Firebase Console → **Authentication** → **Sign-in method**
2. Click on **Google** provider
3. Copy the **Web client ID**
4. Save for Step 4

#### iOS Client ID:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Go to **APIs & Services** → **Credentials**
4. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
5. Application type: **iOS**
6. Name: `ManageMate iOS`
7. Bundle ID: `com.managemate.app`
8. Click **CREATE**
9. Copy the **Client ID**
10. Save for Step 4

#### Android Client ID:

1. In Google Cloud Console → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
3. Application type: **Android**
4. Name: `ManageMate Android`
5. Package name: `com.managemate.app`
6. SHA-1 certificate fingerprint:

**Get SHA-1 for Development:**

```bash
# macOS/Linux
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android | grep SHA1

# Windows
keytool -list -v -keystore "%USERPROFILE%\.android\debug.keystore" -alias androiddebugkey -storepass android -keypass android | findstr SHA1
```

**Get SHA-1 for Production (EAS Build):**

```bash
# After your first EAS build, get the SHA-1 from:
eas credentials
# Select Android → Production → View credentials
```

7. Paste the SHA-1 fingerprint
8. Click **CREATE**
9. Copy the **Client ID**
10. Save for Step 4

### Step 3: Update .env File

Open your `.env` file and add all three Client IDs:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://xdvlkprwnnpxvpqncomn.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Google OAuth Configuration
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=123456789-abc.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=123456789-xyz.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=123456789-def.apps.googleusercontent.com
```

### Step 4: Verify Files in Project Root

Make sure these files are in your project root:

- ✅ `google-services.json` (Android)
- ✅ `GoogleService-Info.plist` (iOS)
- ✅ `.env` (with all Client IDs)

### Step 5: Configure EAS

If you don't have `eas.json`, create it:

```bash
eas build:configure
```

This creates `eas.json` with default configuration.

### Step 6: Build the App

#### Build for Android:

```bash
eas build --platform android --profile development
```

#### Build for iOS:

```bash
eas build --platform ios --profile development
```

#### Build for Both:

```bash
eas build --platform all --profile development
```

### Step 7: Install and Test

#### Android:

1. Download the APK from the EAS build page
2. Install on your Android device
3. Open the app
4. Tap "Continue with Google"
5. ✅ Should work!

#### iOS:

1. Download from TestFlight or install directly
2. Open the app
3. Tap "Continue with Google"
4. ✅ Should work!

## 📱 For Expo Go (Development)

If you just want to test in Expo Go without building:

1. Only add the **Web Client ID** to .env:

   ```env
   EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
   ```

2. Restart Expo:

   ```bash
   npm start -- --clear
   ```

3. Test in Expo Go - it will use web-based OAuth

## 🔍 File Structure

```
your-project/
├── google-services.json          # Android Firebase config
├── GoogleService-Info.plist      # iOS Firebase config
├── .env                          # Environment variables
├── app.config.js                 # Expo configuration
└── eas.json                      # EAS Build configuration
```

## ✅ Verification Checklist

### Before Building:

- [ ] Downloaded google-services.json from Firebase
- [ ] Downloaded GoogleService-Info.plist from Firebase
- [ ] Both files placed in project root
- [ ] Got Web Client ID from Firebase
- [ ] Created iOS Client ID in Google Cloud Console
- [ ] Created Android Client ID in Google Cloud Console
- [ ] Added SHA-1 fingerprint for Android
- [ ] Updated .env with all 3 Client IDs
- [ ] Installed expo-build-properties: `npm install expo-build-properties`
- [ ] Verified app.config.js has build properties plugin

### After Building:

- [ ] Build completed successfully
- [ ] Downloaded and installed app
- [ ] Tested Google Sign-In
- [ ] User data saved in Supabase
- [ ] Can sign out and sign in again

## 🐛 Troubleshooting

### "google-services.json not found"

- Make sure the file is in project root
- Check filename is exactly `google-services.json`
- Verify it's not in a subdirectory

### "GoogleService-Info.plist not found"

- Make sure the file is in project root
- Check filename is exactly `GoogleService-Info.plist`
- Verify it's not in a subdirectory

### "Sign-In failed" on Android

- Verify SHA-1 fingerprint is correct
- Add both debug and production SHA-1s
- Check package name matches: `com.managemate.app`

### "Sign-In failed" on iOS

- Verify Bundle ID matches: `com.managemate.app`
- Check iOS Client ID is correct
- Ensure GoogleService-Info.plist is included

### Build fails

- Run `eas build:configure` again
- Check all files are in project root
- Verify .env has all Client IDs
- Try clearing cache: `npm start -- --clear`

## 📊 What Each File Does

### google-services.json (Android)

- Contains Firebase configuration for Android
- Includes project info, API keys, OAuth clients
- Required for Firebase services on Android

### GoogleService-Info.plist (iOS)

- Contains Firebase configuration for iOS
- Includes project info, API keys, OAuth clients
- Required for Firebase services on iOS

### .env

- Stores environment variables
- Contains Client IDs for OAuth
- Not committed to Git (in .gitignore)

### app.config.js

- Expo configuration
- References Firebase config files
- Loads environment variables

## 🎯 Quick Reference

### Firebase Console:

```
https://console.firebase.google.com/
→ managemate-32f1d
→ Project settings
→ Your apps
→ Download config files
```

### Google Cloud Console:

```
https://console.cloud.google.com/
→ APIs & Services
→ Credentials
→ Create OAuth Client IDs
```

### Build Commands:

```bash
# Android
eas build --platform android --profile development

# iOS
eas build --platform ios --profile development

# Both
eas build --platform all --profile development
```

## 🚀 Summary

1. **Get Firebase config files** (google-services.json, GoogleService-Info.plist)
2. **Get OAuth Client IDs** (Web, iOS, Android)
3. **Update .env** with Client IDs
4. **Place files in project root**
5. **Build with EAS**: `eas build --platform all`
6. **Install and test**

---

**Your app will have native Google Sign-In after building!** 🎉

## 📝 Notes

- For Expo Go: Only Web Client ID needed
- For Production: All 3 Client IDs + config files needed
- SHA-1 fingerprints: Add both debug and production
- Config files: Must be in project root
- .env: Never commit to Git

**Follow this guide step-by-step for successful Google Sign-In integration!** ✨
