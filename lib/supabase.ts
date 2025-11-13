import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
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

// Custom storage adapter for React Native using expo-secure-store
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    SecureStore.deleteItemAsync(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
