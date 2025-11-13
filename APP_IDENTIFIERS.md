# App Identifiers

## Bundle IDs & Package Names

Your app is now configured with the following identifiers:

### iOS Bundle Identifier

```
com.managemate.app
```

### Android Package Name

```
com.managemate.app
```

### App Scheme

```
managemate://
```

## Where They're Used

### iOS (Apple)

- **Bundle Identifier**: `com.managemate.app`
- Used for:
  - App Store submissions
  - Apple Developer Console
  - Push notifications
  - Apple Sign-In configuration
  - Deep linking

### Android

- **Package Name**: `com.managemate.app`
- Used for:
  - Google Play Store submissions
  - Firebase Android app configuration
  - Google Sign-In configuration
  - Deep linking

## Configuration Files

These identifiers are set in:

- ✅ `app.config.js` - Main Expo configuration
- ✅ `app.json` - Static configuration

## Firebase Configuration

### For iOS:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **managemate-32f1d**
3. Add iOS app with Bundle ID: `com.managemate.app`
4. Download `GoogleService-Info.plist`

### For Android:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **managemate-32f1d**
3. Add Android app with Package Name: `com.managemate.app`
4. Download `google-services.json`

## Apple Developer Console

### Setup:

1. Go to [Apple Developer Console](https://developer.apple.com/)
2. Create App ID with identifier: `com.managemate.app`
3. Enable capabilities:
   - Sign in with Apple
   - Push Notifications
   - Associated Domains (for deep linking)

## Google Play Console

### Setup:

1. Go to [Google Play Console](https://play.google.com/console/)
2. Create new app
3. Use package name: `com.managemate.app`

## Deep Linking

Your app responds to:

- `managemate://` - Custom scheme
- `com.managemate.app` - Universal links (iOS)
- `com.managemate.app` - App links (Android)

## Building the App

### iOS Build:

```bash
eas build --platform ios
```

### Android Build:

```bash
eas build --platform android
```

### Both Platforms:

```bash
eas build --platform all
```

## Important Notes

### Changing Bundle IDs:

⚠️ **Warning**: Changing bundle IDs after publishing requires:

- New app submission to stores
- Users must download new app
- Cannot update existing installations

### Best Practices:

- ✅ Use reverse domain notation (com.company.app)
- ✅ Keep it lowercase
- ✅ No special characters except dots
- ✅ Make it unique and memorable

## Social Authentication Setup

### Apple Sign-In:

- Bundle ID: `com.managemate.app`
- Configure in Apple Developer Console
- Add to Firebase iOS app

### Google Sign-In:

- iOS Bundle ID: `com.managemate.app`
- Android Package: `com.managemate.app`
- Configure in Google Cloud Console
- Add to Firebase apps

### GitHub Sign-In:

- Works with any bundle ID
- No additional configuration needed

## Verification

### Check iOS Bundle ID:

```bash
# In app.config.js
ios.bundleIdentifier: "com.managemate.app"
```

### Check Android Package:

```bash
# In app.config.js
android.package: "com.managemate.app"
```

## Next Steps

1. ✅ Bundle IDs configured
2. 🔄 Add iOS app to Firebase (if building for iOS)
3. 🔄 Add Android app to Firebase (if building for Android)
4. 🔄 Configure Apple Developer account
5. 🔄 Configure Google Play Console
6. 🔄 Set up push notifications
7. 🔄 Configure deep linking

## Summary

Your app identifiers are now set:

- **iOS**: `com.managemate.app`
- **Android**: `com.managemate.app`
- **Scheme**: `managemate://`

These are configured in both `app.config.js` and `app.json` for consistency.

---

**Your app is ready for production builds!** 🚀
