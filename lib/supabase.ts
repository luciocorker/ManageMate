import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import "react-native-url-polyfill/auto";

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl ?? "";
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey ?? "";

// Validate configuration
if (!supabaseUrl) {
  console.error("❌ Supabase URL is missing!");
  console.error("Constants.expoConfig:", Constants.expoConfig);
  console.error("Extra config:", Constants.expoConfig?.extra);
  throw new Error(
    "Supabase URL is required. Check your .env file and app.json configuration."
  );
}

if (!supabaseAnonKey) {
  console.error("❌ Supabase Anon Key is missing!");
  throw new Error(
    "Supabase Anon Key is required. Check your .env file and app.json configuration."
  );
}

// Validate URL format
if (!supabaseUrl.startsWith("http://") && !supabaseUrl.startsWith("https://")) {
  console.error("❌ Invalid Supabase URL format:", supabaseUrl);
  throw new Error("Supabase URL must start with http:// or https://");
}

console.log("✅ Supabase configured:", supabaseUrl.substring(0, 30) + "...");

// Custom storage adapter that works on both web and native
const createStorageAdapter = () => {
  // Use localStorage for web, SecureStore for native
  if (Platform.OS === "web") {
    return {
      getItem: (key: string) => {
        if (typeof localStorage !== "undefined") {
          return Promise.resolve(localStorage.getItem(key));
        }
        return Promise.resolve(null);
      },
      setItem: (key: string, value: string) => {
        if (typeof localStorage !== "undefined") {
          localStorage.setItem(key, value);
        }
        return Promise.resolve();
      },
      removeItem: (key: string) => {
        if (typeof localStorage !== "undefined") {
          localStorage.removeItem(key);
        }
        return Promise.resolve();
      },
    };
  } else {
    // Native platforms (iOS, Android)
    return {
      getItem: (key: string) => {
        return SecureStore.getItemAsync(key);
      },
      setItem: (key: string, value: string) => {
        return SecureStore.setItemAsync(key, value);
      },
      removeItem: (key: string) => {
        return SecureStore.deleteItemAsync(key);
      },
    };
  }
};

// Check if Supabase credentials are configured
if (!supabaseUrl || supabaseUrl === "https://placeholder.supabase.co") {
  console.warn(
    "⚠️ Supabase URL not configured. Please add your credentials to .env file."
  );
}

if (
  !supabaseAnonKey ||
  supabaseAnonKey === "placeholder-anon-key-replace-with-your-actual-key"
) {
  console.warn(
    "⚠️ Supabase Anon Key not configured. Please add your credentials to .env file."
  );
}

export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-key",
  {
    auth: {
      storage: createStorageAdapter(),
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: Platform.OS === "web",
    },
  }
);
