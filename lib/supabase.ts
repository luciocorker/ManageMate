import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import "react-native-url-polyfill/auto";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

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
      storage: ExpoSecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
