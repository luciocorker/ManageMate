# ✅ Pre-Build Checklist - iOS App

## 🎯 Before Running `eas build --platform ios`

### Required Files

#### 1. GoogleService-Info.plist

- [ ] Downloaded from Firebase Console
- [ ] Placed in project root folder
- [ ] Filename is exactly: `GoogleService-Info.plist`

**How to get it:**

1. Go to: https://console.firebase.google.com/
2. Project: **managemate-32f1d**
3. Settings ⚙️ → Project settings
4. Your apps → iOS app → Download GoogleService-Info.plist

#### 2. .env File

- [x] iOS Client ID added (already done ✅)
- [ ] Web Client ID added (get from Firebase)
- [ ] Supabase credentials present

**Current .env status:**

```env
✅ EXPO_PUBLIC_SUPABASE_URL=https://xdvlkprwnnpxvpqncomn.supabase.co
✅ EXPO_PUBLIC_SUPABASE_ANON_KEY=your-key
⚠️ EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=need-to-add
✅ EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=711325957153-d3g1cc5ih282iua0d51icmg2on7v4og3...
⏳ EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=optional
```

### Required Tools

#### 3. EAS CLI

- [ ] Installed globally

**Install command:**

```bash
npm install -g eas-cli
```

**Verify installation:**

```bash
eas --version
```

#### 4. Expo Account

- [ ] Created account at expo.dev
- [ ] Logged in via `eas login`

**Login command:**

```bash
eas login
```

### Configuration Files

#### 5. Project Configuration

- [x] app.config.js configured ✅
- [x] eas.json created ✅
- [x] Bundle ID set: `com.managemate.app` ✅
- [x] Build properties plugin added ✅

### File Structure Verification

```
ManageMate/
├── GoogleService-Info.plist  ← ⚠️ MUST ADD THIS
├── .env                       ← ⚠️ ADD WEB CLIENT ID
├── app.config.js              ← ✅ Ready
├── eas.json                   ← ✅ Ready
├── package.json               ← ✅ Ready
└── app/                       ← ✅ Ready
```

## 🚀 Build Commands

### After Completing Checklist:

#### Development Build (Recommended):

```bash
eas build --platform ios --profile development
```

#### Preview Build:

```bash
eas build --platform ios --profile preview
```

#### Production Build:

```bash
eas build --platform ios --profile production
```

## ⚠️ Common Issues

### Issue: "GoogleService-Info.plist not found"

**Solution:** Download from Firebase and place in project root

### Issue: "Invalid credentials"

**Solution:** Run `eas login` and enter your Expo credentials

### Issue: "Bundle identifier mismatch"

**Solution:** Verify Bundle ID is `com.managemate.app` in Firebase

## 📋 Quick Checklist

Before building, verify:

- [ ] GoogleService-Info.plist in project root
- [ ] Web Client ID in .env
- [ ] iOS Client ID in .env (already done ✅)
- [ ] EAS CLI installed
- [ ] Logged in to Expo
- [ ] All packages installed (already done ✅)
- [ ] Code committed to git (recommended)

## 🎯 Two Options

### Option A: Build Now (Requires GoogleService-Info.plist)

1. Get GoogleService-Info.plist from Firebase
2. Place in project root
3. Run: `eas build --platform ios --profile development`

### Option B: Test in Expo Go First (Easier)

1. Just add Web Client ID to .env
2. Run: `npm start -- --clear`
3. Test in Expo Go
4. Build later when ready

## 💡 Recommendation

**Start with Option B (Expo Go):**

- Faster to test
- No building required
- See everything working
- Then build when ready

**Then do Option A (Build):**

- Get native Google Sign-In
- Full production features
- Ready for App Store

## 📚 Documentation

- **`BUILD_IOS_APP.md`** - Complete build guide
- **`GET_GOOGLE_WEB_CLIENT_ID.md`** - Get Web Client ID
- **`FINAL_CHECKLIST.md`** - Overall status

## ✅ Summary

**To build iOS app, you need:**

1. GoogleService-Info.plist from Firebase
2. Web Client ID in .env
3. EAS CLI installed
4. Expo account

**Then run:**

```bash
eas build --platform ios --profile development
```

---

**Follow `BUILD_IOS_APP.md` for detailed instructions!** 🚀
