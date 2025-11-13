# Social Authentication Setup Guide

## ✅ What's Implemented

Your app now supports:

- **Google Sign-In** (Web ready, mobile needs configuration)
- **Apple Sign-In** (iOS only, ready to use)

## 🍎 Apple Sign-In Setup (iOS)

### Already Configured! ✅

Apple Sign-In is ready to use on iOS devices. No additional setup needed for testing in Expo Go.

### For Production (App Store):

1. Go to [Apple Developer Console](https://developer.apple.com/)
2. Select your app identifier
3. Enable "Sign in with Apple" capability
4. In Firebase Console:
   - Go to Authentication → Sign-in method
   - Enable Apple provider
   - Add your Apple Team ID and Key ID

### Testing:

- Apple Sign-In only works on **physical iOS devices**
- Not available in iOS Simulator
- Not available on Android

## 🔍 Google Sign-In Setup

### Current Status:

- ✅ Web implementation ready
- ⚠️ Mobile requires additional configuration

### Setup for Mobile (iOS & Android):

#### 1. Firebase Console Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **managemate-32f1d**
3. Go to **Authentication** → **Sign-in method**
4. Click on **Google** provider
5. Enable it
6. Note your **Web Client ID**

#### 2. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Go to **APIs & Services** → **Credentials**
4. Create OAuth 2.0 Client IDs for:
   - **iOS** (if building for iOS)
   - **Android** (if building for Android)

#### 3. iOS Configuration

1. In Google Cloud Console, create iOS OAuth client
2. Add your iOS Bundle ID: `com.yourcompany.managemate`
3. Download the `GoogleService-Info.plist`
4. Add to your project

#### 4. Android Configuration

1. In Google Cloud Console, create Android OAuth client
2. Add your Android package name
3. Get SHA-1 certificate fingerprint:
   ```bash
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey
   ```
4. Add SHA-1 to Google Cloud Console
5. Download `google-services.json`

#### 5. Update app.config.js

Add Google Client IDs:

```javascript
extra: {
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  googleWebClientId: "YOUR_WEB_CLIENT_ID",
  googleIosClientId: "YOUR_IOS_CLIENT_ID",
  googleAndroidClientId: "YOUR_ANDROID_CLIENT_ID",
}
```

## 📱 How It Works

### Sign In/Sign Up Flow:

1. User taps "Continue with Google" or "Continue with Apple"
2. Authentication popup appears
3. User signs in with their account
4. Firebase creates/authenticates the user
5. User data is stored in Supabase
6. User is redirected to dashboard

### Data Stored in Supabase:

- `firebase_uid` - Links to Firebase auth
- `email` - User's email
- `full_name` - From Google/Apple profile
- `email_verified` - Always true for social auth
- `created_at` - Timestamp

## 🧪 Testing

### Test Apple Sign-In (iOS only):

1. Run app on physical iPhone (not simulator)
2. Tap "Continue with Apple"
3. Sign in with Apple ID
4. Grant permissions
5. Should redirect to dashboard

### Test Google Sign-In (Web):

1. Run: `npm start` then press `w` for web
2. Tap "Continue with Google"
3. Sign in with Google account
4. Should redirect to dashboard

### Test Google Sign-In (Mobile):

- Requires completing Google Cloud Console setup above
- Will show error message until configured

## 🔒 Security Features

1. **Email Verification**: Social auth users are automatically verified
2. **Secure Tokens**: Firebase handles all token management
3. **Supabase Integration**: User data synced securely
4. **Platform Detection**: Apple Sign-In only shows on iOS

## ⚠️ Important Notes

### Apple Sign-In:

- ✅ Works immediately on iOS devices
- ❌ Not available on Android
- ❌ Not available in iOS Simulator
- ✅ No additional setup needed for Expo Go testing

### Google Sign-In:

- ✅ Works on web immediately
- ⚠️ Requires setup for iOS/Android
- ✅ Works across all platforms once configured

## 🐛 Troubleshooting

### "Apple Sign-In not available"

- Make sure you're on a physical iOS device
- Check iOS version (requires iOS 13+)

### "Google Sign-In requires configuration"

- Complete Google Cloud Console setup
- Add Client IDs to app.config.js
- Rebuild the app

### "Sign in was canceled"

- User canceled the authentication
- This is normal behavior

### Supabase insert fails

- Make sure you ran `supabase-setup.sql`
- Check that `users` table exists
- Verify RLS policies are set

## 📊 Monitoring

### Firebase Console:

- View all users: Authentication → Users
- See sign-in methods used
- Check authentication activity

### Supabase Dashboard:

- View user data: Table Editor → users
- Verify social auth users are stored
- Check `email_verified` is true

## 🚀 Quick Start

### For iOS Testing (Apple Sign-In):

1. Build app for iOS device
2. Install on physical iPhone
3. Tap "Continue with Apple"
4. Done! ✅

### For Web Testing (Google Sign-In):

1. Run `npm start`
2. Press `w` for web
3. Tap "Continue with Google"
4. Done! ✅

### For Mobile Google Sign-In:

1. Complete Google Cloud Console setup
2. Add Client IDs to config
3. Rebuild app
4. Test on device

## 📁 Files Modified

- ✅ `lib/socialAuth.ts` - Social authentication logic
- ✅ `app/(auth)/signin.tsx` - Added social sign-in buttons
- ✅ `app/(auth)/signup.tsx` - Added social sign-up buttons
- ✅ `app.config.js` - Added expo-web-browser plugin

## 🎯 Next Steps

1. Test Apple Sign-In on iOS device
2. Test Google Sign-In on web
3. Complete Google Cloud Console setup for mobile
4. Add Client IDs to app.config.js
5. Test on all platforms

---

**Apple Sign-In is ready to test on iOS! Google Sign-In works on web immediately!** 🚀
