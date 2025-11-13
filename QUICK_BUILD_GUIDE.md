# Quick Build Guide - Google Sign-In

## 🎯 Two Options

### Option 1: Test in Expo Go (Quick & Easy)

**No building required!**

1. Get **Web Client ID** from Firebase Console
2. Add to `.env`:
   ```env
   EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
   ```
3. Restart: `npm start -- --clear`
4. Test in Expo Go ✅

### Option 2: Build Native App (Full Features)

**For production or native testing**

## 📋 What You Need

From Firebase Console:

1. ✅ `google-services.json` (Android config file)
2. ✅ `GoogleService-Info.plist` (iOS config file)
3. ✅ Web Client ID
4. ✅ iOS Client ID (from Google Cloud Console)
5. ✅ Android Client ID (from Google Cloud Console)

## 🚀 Quick Steps

### 1. Download Config Files

**Firebase Console** → **Project Settings** → **Your apps**:

- Download `google-services.json` (Android)
- Download `GoogleService-Info.plist` (iOS)
- Place both in project root

### 2. Get Client IDs

**Firebase Console** → **Authentication** → **Sign-in method** → **Google**:

- Copy Web Client ID

**Google Cloud Console** → **Credentials**:

- Create iOS OAuth Client ID (Bundle: `com.managemate.app`)
- Create Android OAuth Client ID (Package: `com.managemate.app`)

### 3. Update .env

```env
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-web-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your-ios-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your-android-id.apps.googleusercontent.com
```

### 4. Build

```bash
# Install EAS CLI (if not installed)
npm install -g eas-cli

# Login to Expo
eas login

# Configure EAS (first time only)
eas build:configure

# Build for Android
eas build --platform android --profile development

# Build for iOS
eas build --platform ios --profile development
```

### 5. Install & Test

- Download from EAS build page
- Install on device
- Test Google Sign-In ✅

## 📁 Required Files in Project Root

```
your-project/
├── google-services.json          ← Android config
├── GoogleService-Info.plist      ← iOS config
└── .env                          ← Client IDs
```

## ⚡ Already Configured

✅ `app.config.js` - Build properties plugin added
✅ `expo-build-properties` - Installed
✅ `.gitignore` - Config files excluded
✅ Example files created for reference

## 🎯 Choose Your Path

### Just Testing? → Use Expo Go

- Only need Web Client ID
- No building required
- Works immediately

### Need Production App? → Build with EAS

- Need all config files
- Need all Client IDs
- Full native features

## 📚 Detailed Guides

- `BUILD_APP_WITH_GOOGLE_SIGNIN.md` - Complete step-by-step
- `GET_GOOGLE_WEB_CLIENT_ID.md` - Quick Expo Go setup
- `GOOGLE_OAUTH_SETUP.md` - OAuth configuration

---

**Pick your option and follow the steps!** 🚀
