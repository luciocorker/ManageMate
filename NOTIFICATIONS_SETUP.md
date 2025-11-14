# Push Notifications Setup Guide

## Step 1: Run the database setup
Run `supabase/setup-notifications.sql` in your Supabase SQL Editor. This creates:
- `push_tokens` table to store device tokens
- `notifications` table to store notification history
- Triggers that automatically create notifications when:
  - New messages are received (direct or channel)
  - User is added to a project
  - Task is assigned to user

## Step 2: Install required packages
Run in your terminal:
```bash
npm install expo-notifications expo-device expo-constants
```

## Step 3: Update app.json
Add this to your `app.json` file under the "expo" section:
```json
{
  "expo": {
    ...existing config...,
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/images/notification-icon.png",
          "color": "#DC2626",
          "sounds": ["./assets/sounds/notification.wav"]
        }
      ]
    ],
    "notification": {
      "icon": "./assets/images/notification-icon.png",
      "color": "#DC2626",
      "androidMode": "default",
      "androidCollapsedTitle": "#{unread_notifications} new notifications"
    }
  }
}
```

## Step 4: Add notification setup to your app layout
Add this code to `app/_layout.tsx` after your existing useEffect:

```typescript
import { registerForPushNotificationsAsync, savePushToken, setupNotificationListeners, subscribeToNotifications } from '@/lib/notificationService';
import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';

export default function RootLayout() {
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();
  
  useEffect(() => {
    // Register for push notifications
    registerForPushNotificationsAsync().then(token => {
      if (token) {
        savePushToken(token);
      }
    });

    // Setup notification listeners
    const listeners = setupNotificationListeners(
      // When notification received in foreground
      (notification) => {
        console.log('Notification received:', notification);
      },
      // When user taps notification
      (response) => {
        const data = response.notification.request.content.data;
        
        // Navigate based on notification type
        if (data.type === 'message' || data.type === 'channel_message') {
          router.push('/(tabs)/messaging');
        } else if (data.type === 'project_added') {
          router.push('/(tabs)/project');
        } else if (data.type === 'task_assigned') {
          router.push(`/(tabs)/project/${data.project_id}`);
        }
      }
    );

    notificationListener.current = listeners.notificationListener;
    responseListener.current = listeners.responseListener;

    // Subscribe to database notifications for real-time
    const subscription = subscribeToNotifications((notification) => {
      console.log('New notification from database:', notification);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
      subscription.unsubscribe();
    };
  }, []);

  // ...rest of your component
}
```

## Step 5: Fix the import path in notificationService.ts
Change line 4 in `lib/notificationService.ts` from:
```typescript
import { supabase } from './supabaseClient';
```
to:
```typescript
import { supabase } from './supabase';
```

## Step 6: Test notifications

### Testing on Physical Device:
1. Install Expo Go app on your phone
2. Run: `npx expo start`
3. Scan QR code with Expo Go
4. Grant notification permissions when prompted
5. Test by:
   - Having another user send you a message
   - Being added to a project
   - Being assigned a task

### Notification Features:
- ✅ In-app notifications (even when app is open)
- ✅ Push notifications when app is closed
- ✅ Notification badges
- ✅ Tap to navigate to relevant screen
- ✅ Database history of all notifications
- ✅ Unread count tracking

## Optional: Add notification badge to profile icon
You can show unread count on the profile tab by using `getUnreadNotificationCount()` from the notification service.

## For Production (later):
1. Set up EAS Build: `npm install -g eas-cli && eas build:configure`
2. Get Firebase Cloud Messaging (FCM) credentials for Android
3. Get Apple Push Notification (APN) credentials for iOS
4. Configure in `eas.json`

For now, notifications will work in development with Expo Go!
