# API Endpoint for Sending Friend Request Emails

## Why Use an API Endpoint?

Nodemailer requires SMTP credentials which should **never** be exposed in client-side code. You need a backend server to send emails securely.

## Option 1: Create Express.js API

### 1. Create a separate backend folder

```bash
mkdir backend
cd backend
npm init -y
npm install express nodemailer cors dotenv
npm install --save-dev @types/express @types/nodemailer typescript
```

### 2. Create `backend/server.ts`

```typescript
import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Send friend request email endpoint
app.post('/api/send-friend-request', async (req, res) => {
  try {
    const { recipientEmail, senderName, senderEmail, requestId } = req.body;

    // Validate input
    if (!recipientEmail || !senderName || !senderEmail || !requestId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Generate links
    const deepLink = `managemate://friend-request?requestId=${requestId}&senderEmail=${encodeURIComponent(senderEmail)}&senderName=${encodeURIComponent(senderName)}`;
    const webLink = `https://managemate-32f1d.firebaseapp.com/friend-request?requestId=${requestId}&senderEmail=${encodeURIComponent(senderEmail)}&senderName=${encodeURIComponent(senderName)}`;

    // HTML email template
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ff6b6b 0%, #ff8787 100%); color: white; padding: 40px; text-align: center; border-radius: 16px; }
          .button { display: inline-block; background: white; color: #ff6b6b; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; margin: 10px; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✓ ManageMate</h1>
            <h2>Friend Request</h2>
            <p><strong>${senderName}</strong> wants to connect with you!</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${deepLink}" class="button">Accept Friend Request</a>
            <br>
            <a href="${webLink}" class="button" style="background: transparent; color: #ff6b6b; border: 2px solid #ff6b6b;">Open in Browser</a>
          </div>
          <div class="footer">
            <p>If you don't have ManageMate installed, download it first and then click the link above.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email
    await transporter.sendMail({
      from: `"ManageMate" <${process.env.SMTP_USER}>`,
      to: recipientEmail,
      subject: `${senderName} wants to connect on ManageMate`,
      html: htmlContent,
    });

    res.json({ success: true, message: 'Email sent successfully' });
  } catch (error: any) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email', details: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
```

### 3. Create `backend/.env`

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### 4. Run the backend

```bash
cd backend
npm start
```

### 5. Update AddFriendModal to call API

```typescript
// In AddFriendModal.tsx
const response = await fetch('http://localhost:3000/api/send-friend-request', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    recipientEmail: friendEmail,
    senderName: currentUserName,
    senderEmail: currentUserEmail,
    requestId: friendRequest.id,
  }),
});

if (response.ok) {
  Alert.alert('Success!', 'Friend request email sent!');
} else {
  Alert.alert('Error', 'Failed to send email');
}
```

## Option 2: Use Supabase Edge Functions

### 1. Create edge function

```bash
supabase functions new send-friend-request
```

### 2. Implement function

```typescript
// supabase/functions/send-friend-request/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  const { recipientEmail, senderName, senderEmail, requestId } = await req.json()

  // Use a service like SendGrid, Mailgun, or Resend
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('SENDGRID_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{
        to: [{ email: recipientEmail }],
      }],
      from: { email: 'noreply@managemate.com' },
      subject: `${senderName} wants to connect on ManageMate`,
      content: [{
        type: 'text/html',
        value: `<h1>Friend Request from ${senderName}</h1>...`,
      }],
    }),
  })

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
```

## Option 3: Use Email Service (Easiest)

Use a service like:
- **SendGrid** (free tier: 100 emails/day)
- **Mailgun** (free tier: 5,000 emails/month)
- **Resend** (free tier: 3,000 emails/month)
- **AWS SES** (very cheap)

These services provide APIs that are easier to use than SMTP.

## Recommended Approach

For production, I recommend:
1. **Use Supabase Edge Functions** + **Resend** (easiest)
2. Or **Create Express API** + **SendGrid** (more control)

For development/testing:
- Use the mailto: link (current implementation)
- Or set up a local Express server with Gmail SMTP

## Deep Link Format

```
App Link: managemate://friend-request?requestId={id}&senderEmail={email}&senderName={name}
Web Link: https://managemate-32f1d.firebaseapp.com/friend-request?requestId={id}&senderEmail={email}&senderName={name}
```

Both links should be included in the email so users can choose how to open it.
