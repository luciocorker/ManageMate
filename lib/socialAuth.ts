import * as AppleAuthentication from "expo-apple-authentication";
import Constants from "expo-constants";
import * as WebBrowser from "expo-web-browser";
import {
  GithubAuthProvider,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithCredential,
  signInWithPopup,
} from "firebase/auth";
import { Platform } from "react-native";
import { auth } from "./firebase";
import { supabase } from "./supabase";

WebBrowser.maybeCompleteAuthSession();

// Google Sign In
export const signInWithGoogle = async () => {
  try {
    if (Platform.OS === "web") {
      // Web implementation
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await storeUserInSupabase(result.user);
      return { success: true, user: result.user };
    } else {
      // Mobile implementation - Use web browser OAuth flow
      // This works in Expo Go without needing native builds
      const webClientId = Constants.expoConfig?.extra?.googleWebClientId;

      if (!webClientId) {
        throw new Error(
          "Google Web Client ID not configured. Please add EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID to your .env file."
        );
      }

      // Use Firebase Web Auth with redirect
      const provider = new GoogleAuthProvider();

      // Open Google Sign-In in browser
      const redirectUrl = `https://auth.expo.io/@${
        Constants.expoConfig?.owner || "anonymous"
      }/${Constants.expoConfig?.slug}`;

      // For Expo Go, we'll use a simpler approach with WebBrowser
      const authUrl =
        `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${webClientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUrl)}&` +
        `response_type=id_token&` +
        `scope=openid%20profile%20email&` +
        `nonce=${Math.random().toString(36)}`;

      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        redirectUrl
      );

      if (result.type === "success" && result.url) {
        // Extract ID token from URL
        const url = new URL(result.url);
        const idToken = url.hash.match(/id_token=([^&]+)/)?.[1];

        if (idToken) {
          // Sign in to Firebase with the ID token
          const credential = GoogleAuthProvider.credential(idToken);
          const userCredential = await signInWithCredential(auth, credential);
          await storeUserInSupabase(userCredential.user);
          return { success: true, user: userCredential.user };
        }
      }

      throw new Error("Google Sign-In was cancelled or failed");
    }
  } catch (error: any) {
    console.error("Google sign in error:", error);
    return { success: false, error: error.message };
  }
};

// Apple Sign In
export const signInWithApple = async () => {
  try {
    if (Platform.OS === "ios") {
      // Check if Apple Authentication is available
      const isAvailable = await AppleAuthentication.isAvailableAsync();
      if (!isAvailable) {
        throw new Error("Apple Authentication is not available on this device");
      }

      // Request Apple Authentication
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      // Create Firebase credential
      const provider = new OAuthProvider("apple.com");
      const firebaseCredential = provider.credential({
        idToken: credential.identityToken!,
        rawNonce: credential.nonce,
      });

      // Sign in to Firebase
      const result = await signInWithCredential(auth, firebaseCredential);

      // Store user in Supabase
      await storeUserInSupabase(result.user, {
        fullName: credential.fullName
          ? `${credential.fullName.givenName || ""} ${
              credential.fullName.familyName || ""
            }`.trim()
          : undefined,
      });

      return { success: true, user: result.user };
    } else {
      throw new Error("Apple Sign-In is only available on iOS devices");
    }
  } catch (error: any) {
    if (error.code === "ERR_REQUEST_CANCELED") {
      return { success: false, error: "Sign in was canceled" };
    }
    console.error("Apple sign in error:", error);
    return { success: false, error: error.message };
  }
};

// GitHub Sign In
export const signInWithGithub = async () => {
  try {
    if (Platform.OS === "web") {
      // Web implementation
      const provider = new GithubAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await storeUserInSupabase(result.user);
      return { success: true, user: result.user };
    } else {
      // Mobile implementation - uses web browser
      throw new Error(
        "GitHub Sign-In on mobile requires opening a web browser. This feature is coming soon."
      );
    }
  } catch (error: any) {
    console.error("GitHub sign in error:", error);
    return { success: false, error: error.message };
  }
};

// Helper function to store user in Supabase
async function storeUserInSupabase(
  user: any,
  additionalData?: { fullName?: string }
) {
  try {
    // Use upsert to handle both insert and update
    const { error } = await supabase.from("users").upsert(
      [
        {
          firebase_uid: user.uid,
          email: user.email,
          full_name: additionalData?.fullName || user.displayName || "",
          email_verified: user.emailVerified,
          profile_picture_url: user.photoURL,
          created_at: new Date().toISOString(),
        },
      ],
      {
        onConflict: "firebase_uid",
      }
    );

    if (error) {
      console.warn("Supabase storage error:", error);
    }
  } catch (error) {
    console.warn("Error storing user in Supabase:", error);
  }
}
