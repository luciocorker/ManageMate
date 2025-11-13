import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface EditChannelModalProps {
  visible: boolean;
  onClose: () => void;
  channelName: string;
  channelDescription?: string;
  onSave: (name: string, description: string) => Promise<boolean>;
}

export default function EditChannelModal({
  visible,
  onClose,
  channelName,
  channelDescription,
  onSave,
}: EditChannelModalProps) {
  const [name, setName] = useState(channelName);
  const [description, setDescription] = useState(channelDescription || "");
  const [loading, setLoading] = useState(false);

  // Reset form when modal opens
  React.useEffect(() => {
    if (visible) {
      setName(channelName);
      setDescription(channelDescription || "");
    }
  }, [visible, channelName, channelDescription]);

  const handleSave = async () => {
    // Validation
    if (!name.trim()) {
      Alert.alert("Error", "Channel name cannot be empty");
      return;
    }

    if (name.trim().length < 3) {
      Alert.alert("Error", "Channel name must be at least 3 characters");
      return;
    }

    if (name.trim().length > 50) {
      Alert.alert("Error", "Channel name must be less than 50 characters");
      return;
    }

    setLoading(true);

    try {
      const success = await onSave(name.trim(), description.trim());

      if (success) {
        Alert.alert("Success", "Channel updated successfully", [
          {
            text: "OK",
            onPress: () => {
              onClose();
            },
          },
        ]);
      } else {
        Alert.alert("Error", "Failed to update channel. Please try again.");
      }
    } catch (error) {
      console.error("Error updating channel:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
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
            <Text style={styles.title}>Edit Channel</Text>
            <Text style={styles.subtitle}>Update channel information</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Channel Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter channel name"
                placeholderTextColor="#666"
                autoCapitalize="words"
                editable={!loading}
                maxLength={50}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Description (optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Enter channel description"
                placeholderTextColor="#666"
                multiline
                numberOfLines={4}
                editable={!loading}
                maxLength={200}
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
                styles.saveButton,
                loading && styles.buttonDisabled,
              ]}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
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
  textArea: {
    height: 100,
    textAlignVertical: "top",
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
  saveButton: {
    backgroundColor: "#DC2626",
  },
  saveButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
