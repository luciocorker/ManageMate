# Get Google Web Client ID - Quick Guide

## 🎯 What You Need

To make Google Sign-In work in Expo Go, you need **ONE** thing:

- **Web Client ID** from Firebase Console

## 📋 Step-by-Step Instructions

### Step 1: Go to Firebase Console

1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **managemate-32f1d**

### Step 2: Enable Google Sign-In

1. Click on **Authentication** in the left sidebar
2. Click on **Sign-in method** tab
3. Find **Google** in the list
4. Click on **Google**

### Step 3: Enable and Get Web Client ID

1. If not enabled, toggle the **Enable** switch
2. You'll see a section called **Web SDK configuration**
3. Copy the **Web client ID** (it looks like: `123456789-abcdefghijklmnop.apps.googleusercontent.com`)

### Step 4: Add to .env File

1. Open your `.env` file in the project
2. Find this line:
   ```env
   EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
   ```
3. Replace `your-web-client-id.apps.googleusercontent.com` with the Web Client ID you copied
4. Save the file

**Example:**

```env
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
```

### Step 5: Restart Expo Server

```bash
# Stop the current server (press Ctrl+C)
# Then restart with cache clear
npm start -- --clear
```

### Step 6: Test Again

1. Scan the QR code in Expo Go
2. Go to Sign Up or Sign In screen
3. Tap "Continue with Google"
4. ✅ Should work now!

## 🎉 That's It!

You only need the **Web Client ID** for Expo Go to work. The iOS and Android Client IDs are only needed when you build a standalone app.

## 🐛 Troubleshooting

### "Web Client ID not configured"

- Make sure you added it to .env file
- Make sure you restarted the Expo server
- Check for typos in the Client ID

### "Sign-In failed"

- Verify the Client ID is correct
- Make sure Google Sign-In is enabled in Firebase
- Check that you're using the Web Client ID (not iOS or Android)

### Still not working?

- Clear Expo cache: `npm start -- --clear`
- Check Firebase Console that Google provider is enabled
- Make sure the Client ID ends with `.apps.googleusercontent.com`

## 📸 Visual Guide

### Where to Find It:

```
Firebase Console
  ↓
Authentication
  ↓
Sign-in method
  ↓
Google (click on it)
  ↓
Web SDK configuration
  ↓
Web client ID: [COPY THIS]
```

## ✅ Checklist

- [ ] Opened Firebase Console
- [ ] Selected project: managemate-32f1d
- [ ] Went to Authentication → Sign-in method
- [ ] Clicked on Google provider
- [ ] Copied Web client ID
- [ ] Pasted into .env file
- [ ] Saved .env file
- [ ] Restarted Expo server with `npm start -- --clear`
- [ ] Tested Google Sign-In in Expo Go

---

**Once you add the Web Client ID, Google Sign-In will work in Expo Go!** 🚀
