# ✅ Gmail Setup for Nodemailer - Complete Guide

## 📦 Installation Complete

✅ Nodemailer installed
✅ TypeScript types installed
✅ .env file updated with your email

## 🔐 What You Need to Do Now

### Step 1: Enable 2-Factor Authentication

**Click this link:** https://myaccount.google.com/signinoptions/two-step-verification

1. Sign in to your Gmail account (leemaalgraaff004@gmail.com)
2. Click "Get Started"
3. Follow the prompts to add your phone number
4. Verify your phone with the code sent via SMS
5. Complete the 2FA setup

**This takes about 2 minutes.**

### Step 2: Generate App Password

**Click this link:** https://myaccount.google.com/apppasswords

1. You'll need to sign in again (security check)
2. Under "Select app" → Choose **"Mail"**
3. Under "Select device" → Choose **"Other (Custom name)"**
4. Type: **"ManageMate App"**
5. Click **"Generate"**
6. You'll see a 16-character password like: `abcd efgh ijkl mnop`
7. **Copy this password** (you won't see it again!)

### Step 3: Add Password to .env File

1. Open your `.env` file
2. Find this line:
   ```
   EXPO_PUBLIC_SMTP_PASS=PASTE_YOUR_APP_PASSWORD_HERE
   ```
3. Replace `PASTE_YOUR_APP_PASSWORD_HERE` with your app password
4. **Remove the spaces** - it should look like:
   ```
   EXPO_PUBLIC_SMTP_PASS=abcdefghijklmnop
   ```
5. Save the file

## 🎯 Example .env Configuration

```env
# Email Configuration
EXPO_PUBLIC_SMTP_HOST=smtp.gmail.com
EXPO_PUBLIC_SMTP_PORT=587
EXPO_PUBLIC_SMTP_USER=leemaalgraaff004@gmail.com
EXPO_PUBLIC_SMTP_PASS=abcdefghijklmnop
```

## ✅ Verification

After setting up, you can test if it works:

1. Restart your development server:
   ```bash
   npx expo start --clear
   ```

2. Try sending a friend request
3. The email should be sent automatically!

## 🔒 Security Notes

- **Never commit your .env file to Git** (it's already in .gitignore)
- The app password is specific to ManageMate - you can revoke it anytime
- Your regular Gmail password remains unchanged
- If you lose the app password, just generate a new one

## 🚨 Troubleshooting

### "Less secure app access" error
- This shouldn't happen with app passwords
- Make sure you're using the app password, not your regular password

### "Invalid credentials" error
- Double-check the app password (no spaces, 16 characters)
- Make sure 2FA is enabled
- Try generating a new app password

### Email not sending
- Check your .env file has the correct values
- Restart the development server
- Check console for error messages

## 📧 What Happens Next

Once configured, when users send friend requests:
1. They enter a friend's email
2. Email is sent automatically via Gmail
3. Friend receives a beautiful HTML email
4. Friend clicks the link to accept
5. Both become friends in the app!

## 🎉 You're Almost Done!

Just complete these 3 quick steps:
1. ✅ Enable 2FA (2 minutes)
2. ✅ Generate app password (1 minute)
3. ✅ Add to .env file (30 seconds)

Total time: **~3 minutes**

Then your friend request emails will work automatically! 🚀
