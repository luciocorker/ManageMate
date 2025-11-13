import { sendFriendRequest } from "@/supabase/supabaseClient";
import * as Linking from "expo-linking";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

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
  const [friendName, setFriendName] = useState("");
  const [friendEmail, setFriendEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSendRequest = async () => {
    // Validation
    if (!friendName.trim()) {
      Alert.alert("Error", "Please enter your friend's name");
      return;
    }

    if (!friendEmail.trim()) {
      Alert.alert("Error", "Please enter your friend's email");
      return;
    }

    if (!validateEmail(friendEmail)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    if (friendName.trim().toLowerCase() === currentUserName.toLowerCase()) {
      Alert.alert("Error", "You cannot send a friend request to yourself");
      return;
    }

    setLoading(true);

    try {
      const result = await sendFriendRequest({
        sender_name: currentUserName,
        sender_email: currentUserEmail,
        receiver_name: friendName.trim(),
        receiver_email: friendEmail.trim().toLowerCase(),
      });

      if (result) {
        // Generate deep link for friend request
        const friendRequestUrl = Linking.createURL("friend-request", {
          queryParams: {
            requestId: result.id,
            senderName: currentUserName,
            receiverEmail: friendEmail.trim().toLowerCase(),
            receiverName: friendName.trim(),
          },
        });

        console.log("Generated friend request URL:", friendRequestUrl);

        // Show success and share link
        Alert.alert(
          "Success!",
          `Friend request created for ${friendName}. Share the invitation link with them.`,
          [
            {
              text: "Share Link",
              onPress: async () => {
                try {
                  await Share.share({
                    message: `${currentUserName} wants to connect with you on ManageMate! Click here to accept: ${friendRequestUrl}`,
                    title: "Friend Request",
                  });
                  setFriendName("");
                  setFriendEmail("");
                  onClose();
                  onSuccess?.();
                } catch (error) {
                  console.error("Error sharing:", error);
                }
              },
            },
            {
              text: "Done",
              onPress: () => {
                setFriendName("");
                setFriendEmail("");
                onClose();
                onSuccess?.();
              },
              style: "cancel",
            },
          ]
        );
      } else {
        Alert.alert(
          "Error",
          "Failed to send friend request. They may have already received a request from you."
        );
      }
    } catch (error) {
      console.error("Error sending friend request:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFriendName("");
      setFriendEmail("");
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.overlay}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleClose}
          disabled={loading}
        />

        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Add Friend</Text>
            <Text style={styles.subtitle}>
              Send a friend request to connect
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Friend's Name</Text>
              <TextInput
                style={styles.input}
                value={friendName}
                onChangeText={setFriendName}
                placeholder="Enter name"
                placeholderTextColor="#666"
                autoCapitalize="words"
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Friend's Email</Text>
              <TextInput
                style={styles.input}
                value={friendEmail}
                onChangeText={setFriendEmail}
                placeholder="Enter email address"
                placeholderTextColor="#666"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>
          </View>

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
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.sendButtonText}>Send Request</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
    backgroundColor: "#1E1E1E",
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
    color: "#FFF",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#999",
    lineHeight: 20,
  },
  form: {
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFF",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#2A2A2A",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#FFF",
    borderWidth: 1,
    borderColor: "#333",
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
  },
  cancelButton: {
    backgroundColor: "#2A2A2A",
    borderWidth: 1,
    borderColor: "#444",
  },
  cancelButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  sendButton: {
    backgroundColor: "#DC2626",
  },
  sendButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
