# Friend Request System Setup Guide

## Overview

The friend request system allows users to send friend requests via email. When a user clicks "Add Friend", they enter the friend's name and email address, and a request is saved to the database.

## Step 1: Run Database Migration

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor** in the left sidebar
4. Copy and paste the contents of `supabase/migrations/002_friend_requests.sql`
5. Click **Run** to execute the migration
6. Verify the table was created:
   ```sql
   SELECT * FROM friend_requests LIMIT 5;
   ```

## Step 2: Test the Friend Request Feature

### Send a Friend Request

1. Open your app
2. Go to the Messages tab
3. Click the **+** button next to "Friends"
4. Enter a friend's name and email
5. Click **Send Request**
6. You should see a success message

### Verify in Database

Go to Supabase Dashboard → Table Editor → `friend_requests` to see the new request.

## Step 3: Email Notifications (Optional)

Currently, friend requests are saved to the database but no actual email is sent. To add email functionality, you have several options:

### Option A: Supabase Edge Functions (Recommended)

1. **Install Supabase CLI**

   ```powershell
   npm install -g supabase
   ```

2. **Create Edge Function**

   ```powershell
   supabase functions new send-friend-request-email
   ```

3. **Add Email Service**

   Use a service like:

   - [Resend](https://resend.com/) - Simple API, generous free tier
   - [SendGrid](https://sendgrid.com/) - Enterprise-grade
   - [Mailgun](https://www.mailgun.com/) - Reliable and scalable

4. **Example Edge Function Code** (using Resend):

   ```typescript
   import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
   import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

   const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;

   serve(async (req) => {
     try {
       const { sender_name, sender_email, receiver_name, receiver_email } =
         await req.json();

       const res = await fetch("https://api.resend.com/emails", {
         method: "POST",
         headers: {
           "Content-Type": "application/json",
           Authorization: `Bearer ${RESEND_API_KEY}`,
         },
         body: JSON.stringify({
           from: "ManageMate <noreply@yourdomain.com>",
           to: [receiver_email],
           subject: `${sender_name} sent you a friend request on ManageMate`,
           html: `
             <h2>New Friend Request</h2>
             <p><strong>${sender_name}</strong> (${sender_email}) wants to connect with you on ManageMate!</p>
             <p>Open the ManageMate app to accept or decline this request.</p>
           `,
         }),
       });

       const data = await res.json();
       return new Response(JSON.stringify(data), {
         headers: { "Content-Type": "application/json" },
       });
     } catch (error) {
       return new Response(JSON.stringify({ error: error.message }), {
         status: 400,
         headers: { "Content-Type": "application/json" },
       });
     }
   });
   ```

5. **Deploy Edge Function**

   ```powershell
   supabase functions deploy send-friend-request-email
   ```

6. **Set Environment Variables**

   ```powershell
   supabase secrets set RESEND_API_KEY=your_api_key_here
   ```

7. **Call from App**

   Update `sendFriendRequest()` in `supabaseClient.ts`:

   ```typescript
   // After successfully inserting into database:
   if (result) {
     // Call edge function to send email
     const { data: emailData, error: emailError } =
       await supabase.functions.invoke("send-friend-request-email", {
         body: {
           sender_name: input.sender_name,
           sender_email: input.sender_email,
           receiver_name: input.receiver_name,
           receiver_email: input.receiver_email,
         },
       });

     if (emailError) {
       console.error("Error sending email:", emailError);
     } else {
       console.log("Email sent successfully:", emailData);
     }
   }
   ```

### Option B: Database Trigger + Webhook

1. Create a webhook endpoint (e.g., using Vercel/Netlify functions)
2. Add a database trigger that calls your webhook when a new friend_request is inserted:

   ```sql
   CREATE OR REPLACE FUNCTION notify_friend_request()
   RETURNS trigger AS $$
   BEGIN
     PERFORM net.http_post(
       url := 'https://your-webhook-url.com/send-email',
       headers := '{"Content-Type": "application/json"}'::jsonb,
       body := json_build_object(
         'sender_name', NEW.sender_name,
         'sender_email', NEW.sender_email,
         'receiver_name', NEW.receiver_name,
         'receiver_email', NEW.receiver_email
       )::jsonb
     );
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql;

   CREATE TRIGGER on_friend_request_created
     AFTER INSERT ON friend_requests
     FOR EACH ROW
     EXECUTE FUNCTION notify_friend_request();
   ```

### Option C: Simple Mailto Link (Temporary Solution)

For testing without setting up email infrastructure, you could modify the modal to open the user's email client:

```typescript
import { Linking } from "react-native";

const emailBody = `Hi ${friendName},\n\n${currentUserName} wants to connect with you on ManageMate!\n\nOpen the ManageMate app to accept this friend request.`;

Linking.openURL(
  `mailto:${friendEmail}?subject=Friend Request from ${currentUserName}&body=${encodeURIComponent(
    emailBody
  )}`
);
```

## Database Schema

The `friend_requests` table has the following structure:

```sql
CREATE TABLE friend_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  receiver_name TEXT NOT NULL,
  receiver_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(sender_name, receiver_name)
);
```

## Available Helper Functions

- `sendFriendRequest(input)` - Send a friend request
- `getFriendRequests(userName)` - Get all sent and received requests
- `getPendingFriendRequests(userName)` - Get only pending requests
- `acceptFriendRequest(requestId, userName)` - Accept a request and add to friends
- `rejectFriendRequest(requestId, userName)` - Reject a request

## Next Steps

1. **Display Pending Requests**: Create a UI to show pending friend requests to users
2. **Accept/Reject Actions**: Add buttons to accept or reject requests
3. **Notifications**: Show a badge count for pending requests
4. **Real-time Updates**: Use Supabase realtime subscriptions to update the UI when new requests arrive

## Testing

Test data example:

```typescript
await sendFriendRequest({
  sender_name: "Lee",
  sender_email: "lee@example.com",
  receiver_name: "Alice",
  receiver_email: "alice@example.com",
});
```

Query requests:

```typescript
const { sent, received } = await getFriendRequests("Lee");
console.log("Sent:", sent.length);
console.log("Received:", received.length);
```

Accept a request:

```typescript
await acceptFriendRequest(requestId, "Alice");
// This will update the status to 'accepted' and add both users to each other's friends list
```
