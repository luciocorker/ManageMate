import { useAuth } from "@/contexts/AuthContext";
import { sendFriendRequestEmail } from "@/services/emailService";
import { sendFriendRequest } from "@/supabase/supabaseClient";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ==========================================
// ADD FRIEND MODAL - Send Friend Request via Email
// ==========================================
// This modal allows users to send friend requests via email.
// It creates a deep link that the recipient can click to accept the request.
// Uses Firebase Authentication to identify the sender.
// ==========================================

interface AddFriendModalProps {
  visible: boolean;
  onClose: () => void;
  currentUserName: string;
  currentUserEmail: string;
  onSuccess?: () => void;
}

export default function AddFriendModal({
  visible,
  onClose,
  currentUserName,
  currentUserEmail,
  onSuccess,
}: AddFriendModalProps) {
  const { user } = useAuth();
  const [friendEmail, setFriendEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendRequest = async () => {
    if (!friendEmail.trim()) {
      Alert.alert("Error", "Please enter a friend's email address");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(friendEmail.trim())) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    // Check if trying to add themselves
    if (friendEmail.trim().toLowerCase() === currentUserEmail.toLowerCase()) {
      Alert.alert("Error", "You cannot add yourself as a friend");
      return;
    }

    if (!user) {
      Alert.alert("Error", "You must be signed in to send friend requests");
      return;
    }

    setLoading(true);

    try {
      // Create friend request in Supabase
      const friendRequest = await sendFriendRequest({
        sender_id: user.id, // Firebase UID
        receiver_email: friendEmail.trim().toLowerCase(),
      });

      if (!friendRequest) {
        Alert.alert("Error", "Failed to create friend request. The user might not exist.");
        setLoading(false);
        return;
      }

      // Send email using EmailJS (no backend needed!)
      console.log("📧 Sending friend request email via EmailJS...");

      const emailResult = await sendFriendRequestEmail(
        friendEmail.trim(),
        currentUserName,
        currentUserEmail,
        friendRequest.id
      );

      if (emailResult.success) {
        console.log("✅ Email sent successfully!");
        Alert.alert(
          "Friend Request Sent!",
          `An email invitation has been sent to ${friendEmail}. They will receive a link to accept your friend request.`,
          [
            {
              text: "OK",
              onPress: () => {
                setFriendEmail("");
                onClose();
                onSuccess?.();
              },
            },
          ]
        );
      } else {
        // Email failed, but friend request was created
        console.error("Email sending failed:", emailResult.error);
        Alert.alert(
          "Friend Request Created",
          `Friend request created, but email failed to send. Error: ${emailResult.error}\n\nPlease share the friend request link manually.`,
          [
            {
              text: "OK",
              onPress: () => {
                setFriendEmail("");
                onClose();
                onSuccess?.();
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error("Error sending friend request:", error);
      Alert.alert("Error", "Failed to send friend request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFriendEmail("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleClose}
          disabled={loading}
        />

        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Add Friend</Text>
            <Text style={styles.subtitle}>
              Send a friend request via email
            </Text>
          </View>

          {/* Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Friend's Email</Text>
            <TextInput
              style={styles.input}
              placeholder="friend@example.com"
              placeholderTextColor="#666"
              value={friendEmail}
              onChangeText={setFriendEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
          </View>

          {/* Info Text */}
          <Text style={styles.infoText}>
            Your friend will receive an email with a link to accept your friend
            request.
          </Text>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.sendButton,
                loading && styles.buttonDisabled,
              ]}
              onPress={handleSendRequest}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.sendButtonText}>Send Request</Text>
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#999",
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ccc",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#2a2a2a",
    borderWidth: 1,
    borderColor: "#444",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "white",
  },
  infoText: {
    fontSize: 12,
    color: "#999",
    marginBottom: 24,
    lineHeight: 18,
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
  cancelButton: {
    backgroundColor: "#2a2a2a",
    borderWidth: 1,
    borderColor: "#444",
  },
  cancelButtonText: {
    color: "#999",
    fontSize: 16,
    fontWeight: "600",
  },
  sendButton: {
    backgroundColor: "#DC2626",
  },
  sendButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
