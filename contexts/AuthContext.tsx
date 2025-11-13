import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

// ==========================================
// 🚧 PLACEHOLDER AUTH CONTEXT 🚧
// ==========================================
// This is a placeholder auth system that stores user data locally.
// When Supabase Auth is implemented, replace this with:
// - supabase.auth.signUp()
// - supabase.auth.signInWithPassword()
// - supabase.auth.signOut()
// - supabase.auth.onAuthStateChange()
// ==========================================

export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string, name?: string) => Promise<boolean>;
  signUp: (email: string, password: string, name: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "@managemate_auth_user";
const USERS_STORAGE_KEY = "@managemate_users"; // Mock user database

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from storage on mount
  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    try {
      const userData = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error("Error loading user:", error);
    } finally {
      setLoading(false);
    }
  }

  // 🚧 PLACEHOLDER: Sign in function
  // TODO: Replace with Supabase Auth
  // const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  async function signIn(
    email: string,
    password: string,
    name?: string
  ): Promise<boolean> {
    try {
      // Get mock users from storage
      const usersData = await AsyncStorage.getItem(USERS_STORAGE_KEY);
      const users: User[] = usersData ? JSON.parse(usersData) : [];

      // Find user by email
      const existingUser = users.find((u) => u.email === email);

      if (existingUser) {
        // User exists, sign them in
        await AsyncStorage.setItem(
          AUTH_STORAGE_KEY,
          JSON.stringify(existingUser)
        );
        setUser(existingUser);
        console.log("✅ User signed in (placeholder):", existingUser.email);
        return true;
      } else if (name) {
        // Auto-register if name is provided (for friend request flow)
        return await signUp(email, password, name);
      } else {
        console.error("❌ User not found");
        return false;
      }
    } catch (error) {
      console.error("Error signing in:", error);
      return false;
    }
  }

  // 🚧 PLACEHOLDER: Sign up function
  // TODO: Replace with Supabase Auth
  // const { data, error } = await supabase.auth.signUp({ email, password })
  async function signUp(
    email: string,
    password: string,
    name: string
  ): Promise<boolean> {
    try {
      // Get existing users
      const usersData = await AsyncStorage.getItem(USERS_STORAGE_KEY);
      const users: User[] = usersData ? JSON.parse(usersData) : [];

      // Check if user already exists
      if (users.find((u) => u.email === email)) {
        console.error("❌ User already exists");
        return false;
      }

      // Create new user
      const newUser: User = {
        id: `user_${Date.now()}`,
        email,
        name,
        created_at: new Date().toISOString(),
      };

      // Save to mock database
      users.push(newUser);
      await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

      // Sign in the new user
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
      setUser(newUser);

      console.log("✅ User signed up (placeholder):", newUser.email);
      return true;
    } catch (error) {
      console.error("Error signing up:", error);
      return false;
    }
  }

  // 🚧 PLACEHOLDER: Sign out function
  // TODO: Replace with Supabase Auth
  // await supabase.auth.signOut()
  async function signOut() {
    try {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      setUser(null);
      console.log("✅ User signed out (placeholder)");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    isAuthenticated: user !== null,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
