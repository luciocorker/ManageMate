import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { auth } from "@/lib/firebase";
import { applyActionCode } from "firebase/auth";
import { useEffect } from "react";
import { Alert, Linking } from "react-native";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  useEffect(() => {
    // Handle deep links for email verification and password reset
    const handleDeepLink = async (event: { url: string }) => {
      const url = event.url;

      // Check if it's a Firebase action link
      if (url.includes("firebaseapp.com") || url.includes("managemate://")) {
        try {
          const urlObj = new URL(url);
          const mode = urlObj.searchParams.get("mode");
          const oobCode = urlObj.searchParams.get("oobCode");

          if (mode === "verifyEmail" && oobCode) {
            // Handle email verification
            await applyActionCode(auth, oobCode);
            Alert.alert(
              "Email Verified!",
              "Your email has been successfully verified. You can now sign in.",
              [{ text: "OK", onPress: () => router.push("/(auth)/signin") }]
            );
          } else if (mode === "resetPassword" && oobCode) {
            // Handle password reset - navigate to a password reset screen
            router.push({
              pathname: "/(auth)/reset-password",
              params: { oobCode },
            });
          }
        } catch (error: any) {
          console.error("Deep link error:", error);
          Alert.alert("Error", error.message || "Failed to process link");
        }
      }
    };

    // Listen for deep links
    const subscription = Linking.addEventListener("url", handleDeepLink);

    // Check if app was opened with a deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Modal" }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
