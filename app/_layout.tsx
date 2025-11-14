import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { MessagingProvider } from '@/contexts/MessagingContext';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { registerForPushNotificationsAsync, savePushToken, setupNotificationListeners, subscribeToNotifications } from '@/lib/notificationService';
import { useEffect, useRef } from "react";
import { Alert, Linking } from "react-native";

export default function RootLayout() {
  const router = useRouter();
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

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
          router.push(`/(tabs)/project/${data.project_id}` as any);
        }
      }
    );

    notificationListener.current = listeners.notificationListener;
    responseListener.current = listeners.responseListener;

    // Subscribe to database notifications for real-time
    const notificationSubscription = subscribeToNotifications((notification) => {
      console.log('New notification from database:', notification);
    });

    // Handle deep links for email verification and password reset
    const handleDeepLink = async (event: { url: string }) => {
      const url = event.url;

      // Check if it's a Supabase action link
      if (url.includes("managemate://auth/callback") || url.includes("managemate://auth/reset-password")) {
        try {
          const urlObj = new URL(url);
          const access_token = urlObj.searchParams.get("access_token");
          const type = urlObj.searchParams.get("type");

          if (type === "recovery" && access_token) {
            // Handle password reset - navigate to a password reset screen
            router.push({
              pathname: "/(auth)/reset-password",
              params: { access_token },
            });
          } else if (type === "signup" || type === "email") {
            // Email verification is handled automatically by Supabase
            Alert.alert(
              "Email Verified!",
              "Your email has been successfully verified. You can now sign in.",
              [{ text: "OK", onPress: () => router.push("/(auth)/signin") }]
            );
          }
        } catch (error: any) {
          console.error("Deep link error:", error);
          Alert.alert("Error", error.message || "Failed to process link");
        }
      }
    };

    // Listen for deep links
    const linkSubscription = Linking.addEventListener("url", handleDeepLink);

    // Check if app was opened with a deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
      notificationSubscription.unsubscribe();
      linkSubscription.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ThemeProvider>
      <MessagingProvider>
        <AppContent />
      </MessagingProvider>
    </ThemeProvider>
  );
}

function AppContent() {
  const { theme } = useTheme();
  
  return (
    <NavigationThemeProvider value={theme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Modal" }}
        />
      </Stack>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
    </NavigationThemeProvider>
  );
}
