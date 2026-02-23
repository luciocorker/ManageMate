# ✅ EmailJS Setup Guide - Complete

## 🎉 What's Done

✅ Nodemailer removed
✅ EmailJS installed
✅ Email service created
✅ AddFriendModal updated
✅ No backend required!

## 🚀 Quick Setup (5 minutes)

### Step 1: Create EmailJS Account

1. Go to: **https://www.emailjs.com/**
2. Click "Sign Up" (it's FREE!)
3. Sign up with your email or Google account

### Step 2: Add Email Service

1. After signing in, go to: **https://dashboard.emailjs.com/admin**
2. Click "Add New Service"
3. Choose "Gmail" (or your preferred email provider)
4. Click "Connect Account"
5. Sign in with your Gmail (leemaalgraaff004@gmail.com)
6. Allow EmailJS to send emails on your behalf
7. Copy the **Service ID** (looks like: `service_abc123`)

### Step 3: Create Email Template

1. Go to: **https://dashboard.emailjs.com/admin/templates**
2. Click "Create New Template"
3. Use this template:

**Subject:**
```
{{from_name}} wants to connect on ManageMate
```

**Content (HTML):**
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #ff6b6b 0%, #ff8787 100%); color: white; padding: 40px; text-align: center; border-radius: 16px; }
    .button { display: inline-block; background: white; color: #ff6b6b; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; margin: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✓ ManageMate</h1>
      <h2>Friend Request</h2>
      <p><strong>{{from_name}}</strong> wants to connect with you!</p>
    </div>
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{app_link}}" class="button">Accept Friend Request</a>
      <br>
      <a href="{{web_link}}" class="button" style="background: transparent; color: #ff6b6b; border: 2px solid #ff6b6b;">Open in Browser</a>
    </div>
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666;">
      <p>If you don't have ManageMate installed, download it first and then click the link above.</p>
      <p>From: {{from_email}}</p>
    </div>
  </div>
</body>
</html>
```

4. Click "Save"
5. Copy the **Template ID** (looks like: `template_xyz789`)

### Step 4: Get Public Key

1. Go to: **https://dashboard.emailjs.com/admin/account**
2. Find "Public Key" section
3. Copy your **Public Key** (looks like: `AbCdEfGhIjKlMnOp`)

### Step 5: Update .env File

Open your `.env` file and add:

```env
EXPO_PUBLIC_EMAILJS_SERVICE_ID=service_abc123
EXPO_PUBLIC_EMAILJS_TEMPLATE_ID=template_xyz789
EXPO_PUBLIC_EMAILJS_PUBLIC_KEY=AbCdEfGhIjKlMnOp
```

Replace with your actual values from EmailJS dashboard.

### Step 6: Restart Your App

```bash
npx expo start --clear
```

## ✅ Test It!

1. Open your app
2. Go to Messages → Click "+" to add friend
3. Enter a friend's email
4. Click "Send Request"
5. Check the email inbox - they should receive a beautiful email!

## 📧 Email Template Variables

The template uses these variables (automatically filled):
- `{{to_email}}` - Recipient's email
- `{{from_name}}` - Your name
- `{{from_email}}` - Your email
- `{{app_link}}` - Deep link to open app
- `{{web_link}}` - Web link fallback
- `{{request_id}}` - Friend request ID

## 🎯 Benefits of EmailJS

✅ **No backend needed** - Works directly from React Native
✅ **Free tier** - 200 emails/month (perfect for testing)
✅ **Easy setup** - Just 5 minutes
✅ **Beautiful emails** - HTML templates with styling
✅ **Reliable** - Professional email service
✅ **No SMTP hassle** - No app passwords or configuration

## 🔒 Security

- Your EmailJS Public Key is safe to expose in client code
- EmailJS handles rate limiting automatically
- Free tier has 200 emails/month limit
- Upgrade to paid plan for more emails if needed

## 🚨 Troubleshooting

### "Service ID not found"
- Double-check your Service ID in .env matches EmailJS dashboard
- Make sure you connected your Gmail account

### "Template not found"
- Verify Template ID in .env matches the template you created
- Make sure template is saved and active

### "Public Key invalid"
- Copy the Public Key from Account settings
- Make sure there are no extra spaces

### Email not received
- Check spam folder
- Verify recipient email is correct
- Check EmailJS dashboard for send logs

## 📊 Monitor Emails

View sent emails at: **https://dashboard.emailjs.com/admin/logs**

You can see:
- How many emails sent
- Success/failure status
- Error messages if any

## 🎉 You're Done!

Once you complete the 5 steps above, your friend request emails will work automatically!

No backend, no server, no SMTP configuration needed! 🚀
