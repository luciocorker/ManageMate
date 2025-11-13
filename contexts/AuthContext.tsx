import { auth } from "@/lib/firebase";
import { supabase } from "@/lib/supabase";
import type { User as FirebaseUser } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import React, { createContext, useContext, useEffect, useState } from "react";

// ==========================================
// FIREBASE AUTH CONTEXT
// ==========================================
// This context integrates Firebase Authentication with Supabase database
// - Firebase handles user authentication (signin/signup/signout)
// - Supabase stores user profiles and messaging data
// - Firebase UID is used as the foreign key across all Supabase tables
// ==========================================

export interface User {
  id: string; // Firebase UID
  email: string;
  name: string;
  emailVerified: boolean;
  photoURL?: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  firebaseUser: FirebaseUser | null;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
          // User is signed in
          console.log("✅ Firebase user authenticated:", firebaseUser.email);

          // Fetch or sync user data from Supabase
          await syncUserWithSupabase(firebaseUser);
          setFirebaseUser(firebaseUser);
        } else {
          // User is signed out
          console.log("🔓 User signed out");
          setUser(null);
          setFirebaseUser(null);
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Sync Firebase user with Supabase users table
  async function syncUserWithSupabase(firebaseUser: FirebaseUser) {
    try {
      // Check if user exists in Supabase
      const { data: existingUser, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .eq("firebase_uid", firebaseUser.uid)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        // PGRST116 means no rows found, which is ok
        console.error("Error fetching user from Supabase:", fetchError);
      }

      if (!existingUser) {
        // User doesn't exist in Supabase, create them
        const { data: newUser, error: insertError } = await supabase
          .from("users")
          .insert([
            {
              firebase_uid: firebaseUser.uid,
              email: firebaseUser.email,
              full_name: firebaseUser.displayName || "",
              email_verified: firebaseUser.emailVerified,
              profile_picture_url: firebaseUser.photoURL,
              created_at: new Date().toISOString(),
            },
          ])
          .select()
          .single();

        if (insertError) {
          console.error("Error creating user in Supabase:", insertError);
          return;
        }

        console.log("✅ User created in Supabase:", newUser);

        // Set user state
        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email || "",
          name: firebaseUser.displayName || "",
          emailVerified: firebaseUser.emailVerified,
          photoURL: firebaseUser.photoURL || undefined,
          created_at: newUser.created_at,
        });
      } else {
        // User exists, update their info if needed
        const { error: updateError } = await supabase
          .from("users")
          .update({
            email: firebaseUser.email,
            full_name: firebaseUser.displayName || existingUser.full_name,
            email_verified: firebaseUser.emailVerified,
            profile_picture_url: firebaseUser.photoURL,
            updated_at: new Date().toISOString(),
          })
          .eq("firebase_uid", firebaseUser.uid);

        if (updateError) {
          console.warn("Error updating user in Supabase:", updateError);
        }

        // Set user state
        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email || "",
          name: firebaseUser.displayName || existingUser.full_name,
          emailVerified: firebaseUser.emailVerified,
          photoURL: firebaseUser.photoURL || existingUser.profile_picture_url,
          created_at: existingUser.created_at,
        });
      }
    } catch (error) {
      console.error("Error syncing user with Supabase:", error);
    }
  }

  // Refresh user data from Supabase
  async function refreshUser() {
    if (firebaseUser) {
      await syncUserWithSupabase(firebaseUser);
    }
  }

  // Sign out
  async function signOut() {
    try {
      await auth.signOut();
      console.log("✅ User signed out");
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    firebaseUser,
    signOut,
    isAuthenticated: user !== null && user.emailVerified,
    refreshUser,
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
