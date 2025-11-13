import * as AppleAuthentication from "expo-apple-authentication";
import * as WebBrowser from "expo-web-browser";
import {
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
      // Mobile implementation - requires Google Client IDs
      // You'll need to configure these in Firebase Console and Google Cloud Console
      throw new Error(
        "Google Sign-In on mobile requires additional configuration. Please set up Google Client IDs in Firebase Console."
      );
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
    const { error } = await supabase.from("Users").upsert(
      [
        {
          firebase_uid: user.uid,
          email: user.email,
          full_name: additionalData?.fullName || user.displayName || "",
          email_verified: user.emailVerified,
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
