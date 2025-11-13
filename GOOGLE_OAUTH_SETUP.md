# Google OAuth Setup Guide

## ✅ Configuration Added

Your app is now configured to use Google OAuth Client IDs for mobile authentication.

## 📋 What You Need

To enable Google Sign-In on mobile (iOS & Android), you need **3 Client IDs**:

1. **Web Client ID** - From Firebase Console
2. **iOS Client ID** - From Google Cloud Console
3. **Android Client ID** - From Google Cloud Console

## 🔧 Step-by-Step Setup

### Step 1: Get Web Client ID (Firebase)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **managemate-32f1d**
3. Go to **Authentication** → **Sign-in method**
4. Click on **Google** provider
5. Enable it if not already enabled
6. Copy the **Web Client ID** (looks like: `xxxxx.apps.googleusercontent.com`)
7. Save this for later

### Step 2: Go to Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project (should be the same project)
3. Go to **APIs & Services** → **Credentials**

### Step 3: Create iOS OAuth Client ID

1. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
2. Select **Application type**: **iOS**
3. Enter details:
   - **Name**: ManageMate iOS
   - **Bundle ID**: `com.managemate.app`
4. Click **CREATE**
5. Copy the **Client ID** (iOS Client ID)
6. Save this for later

### Step 4: Create Android OAuth Client ID

1. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
2. Select **Application type**: **Android**
3. Enter details:
   - **Name**: ManageMate Android
   - **Package name**: `com.managemate.app`
   - **SHA-1 certificate fingerprint**: (see below)

#### Get SHA-1 Fingerprint:

**For Development:**

```bash
# macOS/Linux
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

# Windows
keytool -list -v -keystore "%USERPROFILE%\.android\debug.keystore" -alias androiddebugkey -storepass android -keypass android
```

**For Production:**

```bash
# Use your production keystore
keytool -list -v -keystore /path/to/your/keystore.jks -alias your-key-alias
```

4. Copy the SHA-1 fingerprint and paste it
5. Click **CREATE**
6. Copy the **Client ID** (Android Client ID)
7. Save this for later

### Step 5: Update .env File

Open your `.env` file and replace the placeholder values:

```env
# Google OAuth Configuration
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=YOUR_WEB_CLIENT_ID.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=YOUR_IOS_CLIENT_ID.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com
```

**Example:**

```env
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=123456789-hijklmn.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=123456789-opqrstu.apps.googleusercontent.com
```

### Step 6: Restart Expo Server

After updating the `.env` file:

```bash
# Stop the current server (Ctrl+C)
# Clear cache and restart
npm start -- --clear
```

## 📱 Platform-Specific Setup

### iOS Additional Setup

1. **Add URL Scheme** (already configured in app.config.js):

   - Scheme: `managemate`
   - Bundle ID: `com.managemate.app`

2. **For Production Builds**:
   - Add reversed client ID as URL scheme
   - Format: `com.googleusercontent.apps.YOUR_IOS_CLIENT_ID`

### Android Additional Setup

1. **SHA-1 Fingerprints**:

   - Development: Use debug keystore SHA-1
   - Production: Use production keystore SHA-1
   - Add both to Google Cloud Console

2. **For Production Builds**:
   - Generate production keystore
   - Get SHA-1 from production keystore
   - Add to Google Cloud Console

## 🧪 Testing

### Test on Web (Already Works):

```bash
npm start
# Press 'w' for web
# Click "Continue with Google"
# ✅ Should work immediately
```

### Test on iOS (After Setup):

```bash
# Build and run on iOS
eas build --platform ios --profile development
# Or use Expo Go
npm start
# Scan QR code on iPhone
# Click "Continue with Google"
# ✅ Should open Google sign-in
```

### Test on Android (After Setup):

```bash
# Build and run on Android
eas build --platform android --profile development
# Or use Expo Go
npm start
# Scan QR code on Android
# Click "Continue with Google"
# ✅ Should open Google sign-in
```

## 🔍 Verification Checklist

- [ ] Web Client ID obtained from Firebase
- [ ] iOS Client ID created in Google Cloud Console
- [ ] Android Client ID created in Google Cloud Console
- [ ] SHA-1 fingerprint added for Android
- [ ] All 3 Client IDs added to .env file
- [ ] Expo server restarted
- [ ] Google Sign-In tested on web
- [ ] Google Sign-In tested on iOS (if building)
- [ ] Google Sign-In tested on Android (if building)

## 📊 Where Client IDs Are Used

### Web Client ID:

- Used for web authentication
- Used as audience for mobile tokens
- Required for all platforms

### iOS Client ID:

- Used for iOS native authentication
- Enables Google Sign-In on iPhone/iPad
- Required for iOS builds

### Android Client ID:

- Used for Android native authentication
- Enables Google Sign-In on Android devices
- Required for Android builds

## 🐛 Troubleshooting

### "Google Sign-In requires configuration"

- Check that all 3 Client IDs are in .env
- Restart Expo server after updating .env
- Verify Client IDs are correct (no typos)

### iOS: "Invalid Client ID"

- Verify Bundle ID matches: `com.managemate.app`
- Check iOS Client ID is correct
- Ensure URL scheme is configured

### Android: "Sign-in failed"

- Verify Package Name matches: `com.managemate.app`
- Check SHA-1 fingerprint is correct
- Add both debug and production SHA-1s

### "Token verification failed"

- Ensure Web Client ID is from Firebase
- Check that Firebase project matches Google Cloud project
- Verify all Client IDs are from the same project

## 📁 Configuration Files

### .env (Your Credentials)

```env
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-web-client-id
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your-ios-client-id
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your-android-client-id
```

### app.config.js (Loads from .env)

```javascript
extra: {
  googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  googleIosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  googleAndroidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
}
```

## 🔐 Security Notes

1. **Never commit .env to Git** - Already in .gitignore
2. **Keep Client IDs secure** - Don't share publicly
3. **Use different Client IDs** for dev/prod if needed
4. **Rotate credentials** if compromised

## 📚 Additional Resources

- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Google Sign-In for iOS](https://developers.google.com/identity/sign-in/ios)
- [Google Sign-In for Android](https://developers.google.com/identity/sign-in/android)
- [Expo Google Sign-In](https://docs.expo.dev/guides/google-authentication/)

## 🎯 Quick Reference

### Firebase Console:

```
https://console.firebase.google.com/
→ Project: managemate-32f1d
→ Authentication → Sign-in method → Google
→ Copy Web Client ID
```

### Google Cloud Console:

```
https://console.cloud.google.com/
→ APIs & Services → Credentials
→ Create OAuth Client ID (iOS)
→ Create OAuth Client ID (Android)
```

### Bundle IDs:

```
iOS: com.managemate.app
Android: com.managemate.app
```

---

## ✅ Summary

Your app is now configured for Google OAuth:

- ✅ Configuration added to app.config.js
- ✅ Environment variables set up in .env
- ✅ Ready for mobile Google Sign-In

**Next Steps:**

1. Get your 3 Client IDs from Firebase/Google Cloud
2. Add them to .env file
3. Restart Expo server
4. Test on all platforms!

**Google Sign-In will work on mobile once you add the Client IDs!** 🚀
