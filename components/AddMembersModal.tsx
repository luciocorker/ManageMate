import type { Friend } from "@/types/messaging";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Path } from "react-native-svg";

// SVG Icons
const CloseIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 6L6 18M6 6L18 18"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const CheckIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 6L9 17L4 12"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

interface AddMembersModalProps {
  visible: boolean;
  onClose: () => void;
  onAddMembers: (selectedFriends: Friend[]) => Promise<boolean>;
  friends: Friend[];
  existingMembers: string[]; // Array of member names already in the channel
  channelName: string;
}

export default function AddMembersModal({
  visible,
  onClose,
  onAddMembers,
  friends,
  existingMembers,
  channelName,
}: AddMembersModalProps) {
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [adding, setAdding] = useState(false);

  // Filter out friends who are already members
  const availableFriends = friends.filter(
    (friend) => !existingMembers.includes(friend.name)
  );

  const toggleFriend = (friendId: string) => {
    setSelectedFriends((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleAdd = async () => {
    if (selectedFriends.length === 0) return;

    setAdding(true);
    try {
      const selected = availableFriends.filter((f) =>
        selectedFriends.includes(f.id)
      );
      const success = await onAddMembers(selected);

      if (success) {
        Alert.alert(
          "Success!",
          `${selected.length} member(s) added to ${channelName}`,
          [
            {
              text: "OK",
              onPress: () => {
                setSelectedFriends([]);
                onClose();
              },
            },
          ]
        );
      } else {
        Alert.alert("Error", "Failed to add members to channel");
      }
    } catch (error) {
      console.error("Error adding members:", error);
      Alert.alert("Error", "Something went wrong");
    } finally {
      setAdding(false);
    }
  };

  const handleClose = () => {
    setSelectedFriends([]);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Add Members</Text>
            <TouchableOpacity
              onPress={handleClose}
              style={styles.closeButton}
              disabled={adding}
            >
              <CloseIcon />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>Add friends to {channelName}</Text>

          {/* Friends Selection */}
          <View style={styles.section}>
            <Text style={styles.label}>
              Select Friends ({selectedFriends.length} selected)
            </Text>

            {availableFriends.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  All your friends are already in this channel
                </Text>
              </View>
            ) : (
              <ScrollView style={styles.friendsList}>
                {availableFriends.map((friend) => {
                  const isSelected = selectedFriends.includes(friend.id);
                  return (
                    <TouchableOpacity
                      key={friend.id}
                      style={[
                        styles.friendItem,
                        isSelected && styles.friendItemSelected,
                      ]}
                      onPress={() => toggleFriend(friend.id)}
                      disabled={adding}
                    >
                      <View
                        style={[
                          styles.friendAvatar,
                          { backgroundColor: friend.avatar },
                        ]}
                      >
                        <Text style={styles.friendAvatarText}>
                          {friend.name.charAt(0)}
                        </Text>
                      </View>
                      <View style={styles.friendInfo}>
                        <Text style={styles.friendName}>{friend.name}</Text>
                        <Text style={styles.friendStatus}>
                          {friend.online ? "Online" : "Offline"}
                        </Text>
                      </View>
                      {isSelected && (
                        <View style={styles.checkmark}>
                          <CheckIcon />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </View>

          {/* Add Button */}
          {availableFriends.length > 0 && (
            <TouchableOpacity
              style={[
                styles.addButton,
                (selectedFriends.length === 0 || adding) &&
                  styles.addButtonDisabled,
              ]}
              onPress={handleAdd}
              disabled={selectedFriends.length === 0 || adding}
            >
              {adding ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.addButtonText}>
                  Add {selectedFriends.length > 0 ? selectedFriends.length : ""}{" "}
                  Member{selectedFriends.length !== 1 ? "s" : ""}
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#121212",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  closeButton: {
    padding: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#999",
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    marginBottom: 12,
  },
  friendsList: {
    maxHeight: 400,
  },
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e1e1e",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  friendItemSelected: {
    backgroundColor: "#2a2a2a",
    borderWidth: 2,
    borderColor: "#DC2626",
  },
  friendAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  friendAvatarText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 15,
    fontWeight: "600",
    color: "white",
    marginBottom: 2,
  },
  friendStatus: {
    fontSize: 13,
    color: "#999",
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#DC2626",
    justifyContent: "center",
    alignItems: "center",
  },
  addButton: {
    backgroundColor: "#DC2626",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  addButtonDisabled: {
    backgroundColor: "#555",
    opacity: 0.5,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  emptyState: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    color: "#999",
    fontSize: 15,
    textAlign: "center",
  },
});
