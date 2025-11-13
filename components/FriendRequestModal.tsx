import { useAuth } from "@/contexts/AuthContext";
import {
  acceptFriendRequest,
  rejectFriendRequest,
} from "@/supabase/supabaseClient";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ==========================================
// 🔥 FULLY FUNCTIONAL 🔥
// Friend Request Acceptance Modal
// ==========================================
// This modal appears when a user clicks a friend request link.
// It allows them to accept or decline the friend request.
// After accepting, both users can immediately start messaging.
// ==========================================

interface FriendRequestModalProps {
  visible: boolean;
  onClose: () => void;
  requestId: string;
  senderName: string;
  onAccept?: () => void;
  onDecline?: () => void;
}

export default function FriendRequestModal({
  visible,
  onClose,
  requestId,
  senderName,
  onAccept,
  onDecline,
}: FriendRequestModalProps) {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  async function handleAccept() {
    if (!user) {
      Alert.alert("Error", "You must be signed in to accept friend requests");
      return;
    }

    setLoading(true);
    try {
      const success = await acceptFriendRequest(requestId, user.name);

      if (success) {
        Alert.alert(
          "Success!",
          `You and ${senderName} are now friends. You can start messaging!`,
          [
            {
              text: "OK",
              onPress: () => {
                onClose();
                onAccept?.();
              },
            },
          ]
        );
      } else {
        Alert.alert("Error", "Failed to accept friend request");
      }
    } catch (error) {
      console.error("Error accepting friend request:", error);
      Alert.alert("Error", "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleDecline() {
    if (!user) {
      Alert.alert("Error", "You must be signed in to decline friend requests");
      return;
    }

    setLoading(true);
    try {
      const success = await rejectFriendRequest(requestId, user.name);

      if (success) {
        Alert.alert("Declined", "Friend request declined", [
          {
            text: "OK",
            onPress: () => {
              onClose();
              onDecline?.();
            },
          },
        ]);
      } else {
        Alert.alert("Error", "Failed to decline friend request");
      }
    } catch (error) {
      console.error("Error declining friend request:", error);
      Alert.alert("Error", "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
          disabled={loading}
        />

        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Friend Request</Text>
            <Text style={styles.message}>
              <Text style={styles.senderName}>{senderName}</Text> wants to
              connect with you
            </Text>
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.declineButton]}
              onPress={handleDecline}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#999" />
              ) : (
                <Text style={styles.declineButtonText}>Decline</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.acceptButton]}
              onPress={handleAccept}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.acceptButtonText}>Accept</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalContainer: {
    backgroundColor: "#1e1e1e",
    borderRadius: 16,
    padding: 24,
    width: "85%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: "#ccc",
    lineHeight: 24,
  },
  senderName: {
    fontWeight: "700",
    color: "#DC2626",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  declineButton: {
    backgroundColor: "#2a2a2a",
    borderWidth: 1,
    borderColor: "#444",
  },
  declineButtonText: {
    color: "#999",
    fontSize: 16,
    fontWeight: "600",
  },
  acceptButton: {
    backgroundColor: "#DC2626",
  },
  acceptButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
