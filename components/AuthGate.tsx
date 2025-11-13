import FriendRequestModal from "@/components/FriendRequestModal";
import { useAuth } from "@/contexts/AuthContext";
import SignInScreen from "@/pages/SignInScreen";
import SignUpScreen from "@/pages/SignUpScreen";
import * as Linking from "expo-linking";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

// ==========================================
// AUTH GATE WITH DEEP LINK SUPPORT
// ==========================================
// This component handles:
// 1. Authentication gate (show sign in/up if not authenticated)
// 2. Deep link handling for friend request invitations
// 3. Forcing sign in/up before showing friend request modal
// ==========================================

interface AuthGateProps {
  children: React.ReactNode;
}

export default function AuthGate({ children }: AuthGateProps) {
  const { user, loading } = useAuth();
  const [authScreen, setAuthScreen] = useState<"signIn" | "signUp">("signIn");
  const [pendingFriendRequest, setPendingFriendRequest] = useState<{
    requestId: string;
    senderName: string;
    receiverEmail: string;
    receiverName: string;
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

  function handleDeepLink(url: string) {
    console.log("Deep link received:", url);

    const { path, queryParams } = Linking.parse(url);

    if (path === "friend-request") {
      const { requestId, senderName, receiverEmail, receiverName } =
        queryParams as any;

      if (!requestId || !senderName || !receiverEmail || !receiverName) {
        console.error("Invalid friend request link");
        return;
      }

      // Store pending friend request
      setPendingFriendRequest({
        requestId,
        senderName,
        receiverEmail,
        receiverName,
      });

      // If user is authenticated, show modal immediately
      if (user) {
        setShowFriendRequestModal(true);
      }
      // Otherwise, user will need to sign in/up first
    }
  }

  // Show loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // If user is authenticated, show the app
  if (user) {
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
            senderName={pendingFriendRequest.senderName}
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

  // Show auth screens with friend request context
  return (
    <View style={styles.container}>
      {pendingFriendRequest && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            🎉 {pendingFriendRequest.senderName} sent you a friend request!
          </Text>
          <Text style={styles.bannerSubtext}>Sign in or sign up to accept</Text>
        </View>
      )}

      {authScreen === "signIn" ? (
        <SignInScreen
          onSignUpPress={() => setAuthScreen("signUp")}
          defaultEmail={pendingFriendRequest?.receiverEmail}
          onSuccess={() => {
            // After successful sign in, show friend request modal if pending
            if (pendingFriendRequest) {
              setShowFriendRequestModal(true);
            }
          }}
        />
      ) : (
        <SignUpScreen
          onSignInPress={() => setAuthScreen("signIn")}
          defaultEmail={pendingFriendRequest?.receiverEmail}
          defaultName={pendingFriendRequest?.receiverName}
          onSuccess={() => {
            // After successful sign up, show friend request modal if pending
            if (pendingFriendRequest) {
              setShowFriendRequestModal(true);
            }
          }}
        />
      )}

      {/* Friend request modal (shown after auth) */}
      {pendingFriendRequest && (
        <FriendRequestModal
          visible={showFriendRequestModal}
          onClose={() => {
            setShowFriendRequestModal(false);
            setPendingFriendRequest(null);
          }}
          requestId={pendingFriendRequest.requestId}
          senderName={pendingFriendRequest.senderName}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  loadingText: {
    color: "white",
    fontSize: 18,
    textAlign: "center",
    marginTop: 100,
  },
  banner: {
    backgroundColor: "#DC2626",
    padding: 16,
    alignItems: "center",
  },
  bannerText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  bannerSubtext: {
    color: "white",
    fontSize: 14,
    marginTop: 4,
    textAlign: "center",
  },
});
