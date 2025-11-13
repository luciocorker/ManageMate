import FriendRequestModal from "@/components/FriendRequestModal";
import { useAuth } from "@/contexts/AuthContext";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

// ==========================================
// AUTH GATE WITH DEEP LINK SUPPORT (FIREBASE VERSION)
// ==========================================
// This component handles:
// 1. Authentication gate (redirect to Firebase auth screens if not authenticated)
// 2. Deep link handling for friend request invitations
// 3. Ensuring user is signed in with Firebase before showing friend request modal
// ==========================================

interface AuthGateProps {
  children: React.ReactNode;
}

export default function AuthGate({ children }: AuthGateProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const [pendingFriendRequest, setPendingFriendRequest] = useState<{
    requestId: string;
    senderEmail: string;
  } | null>(null);
  const [showFriendRequestModal, setShowFriendRequestModal] = useState(false);

  // Handle deep links
  useEffect(() => {
    // Handle initial URL when app opens from link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    // Listen for deep links while app is open
    const subscription = Linking.addEventListener("url", (event) => {
      handleDeepLink(event.url);
    });

    return () => {
      subscription.remove();
    };
  }, [user]);

  // Show friend request modal once user is authenticated
  useEffect(() => {
    if (isAuthenticated && pendingFriendRequest) {
      setShowFriendRequestModal(true);
    }
  }, [isAuthenticated, pendingFriendRequest]);

  function handleDeepLink(url: string) {
    console.log("Deep link received:", url);

    const { path, queryParams } = Linking.parse(url);

    if (path === "friend-request") {
      const { requestId, senderEmail } = queryParams as any;

      if (!requestId || !senderEmail) {
        console.error("Invalid friend request link - missing parameters");
        return;
      }

      // Store pending friend request
      setPendingFriendRequest({
        requestId,
        senderEmail,
      });

      // If user is authenticated, show modal immediately
      if (isAuthenticated) {
        setShowFriendRequestModal(true);
      } else {
        // Redirect to sign in with a message
        router.push("/(auth)/signin" as any);
      }
    }
  }

  // Show loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#ff6b6b" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // If user is not authenticated or email not verified, redirect to landing page
  if (!isAuthenticated) {
    router.replace("/(auth)/landing" as any);
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#ff6b6b" />
      </View>
    );
  }

  // If user is authenticated and email verified, show the app
  return (
    <>
      {children}
      {/* Friend request modal */}
      {pendingFriendRequest && (
        <FriendRequestModal
          visible={showFriendRequestModal}
          onClose={() => {
            setShowFriendRequestModal(false);
            setPendingFriendRequest(null);
          }}
          requestId={pendingFriendRequest.requestId}
          senderEmail={pendingFriendRequest.senderEmail}
          onAccept={() => {
            setShowFriendRequestModal(false);
            setPendingFriendRequest(null);
          }}
          onDecline={() => {
            setShowFriendRequestModal(false);
            setPendingFriendRequest(null);
          }}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "#2d3748",
    fontSize: 16,
    marginTop: 16,
  },
});
