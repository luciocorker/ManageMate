import { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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

interface Friend {
  id: number;
  name: string;
  message: string;
  avatar: string;
  online: boolean;
}

interface CreateChannelModalProps {
  visible: boolean;
  onClose: () => void;
  onCreateChannel: (channelName: string, selectedFriends: Friend[]) => void;
  friends: Friend[];
}

export default function CreateChannelModal({
  visible,
  onClose,
  onCreateChannel,
  friends,
}: CreateChannelModalProps) {
  const [channelName, setChannelName] = useState("");
  const [selectedFriends, setSelectedFriends] = useState<number[]>([]);

  const toggleFriend = (friendId: number) => {
    setSelectedFriends((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleCreate = () => {
    if (channelName.trim() && selectedFriends.length > 0) {
      const selected = friends.filter((f) => selectedFriends.includes(f.id));
      onCreateChannel(channelName, selected);
      // Reset form
      setChannelName("");
      setSelectedFriends([]);
      onClose();
    }
  };

  const handleClose = () => {
    setChannelName("");
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
            <Text style={styles.headerTitle}>Create Channel</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <CloseIcon />
            </TouchableOpacity>
          </View>

          {/* Channel Name Input */}
          <View style={styles.section}>
            <Text style={styles.label}>Channel Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter channel name..."
              placeholderTextColor="#666"
              value={channelName}
              onChangeText={setChannelName}
            />
          </View>

          {/* Friends Selection */}
          <View style={styles.section}>
            <Text style={styles.label}>
              Add Friends ({selectedFriends.length} selected)
            </Text>
            <ScrollView style={styles.friendsList}>
              {friends.map((friend) => {
                const isSelected = selectedFriends.includes(friend.id);
                return (
                  <TouchableOpacity
                    key={friend.id}
                    style={[
                      styles.friendItem,
                      isSelected && styles.friendItemSelected,
                    ]}
                    onPress={() => toggleFriend(friend.id)}
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
          </View>

          {/* Create Button */}
          <TouchableOpacity
            style={[
              styles.createButton,
              (!channelName.trim() || selectedFriends.length === 0) &&
                styles.createButtonDisabled,
            ]}
            onPress={handleCreate}
            disabled={!channelName.trim() || selectedFriends.length === 0}
          >
            <Text style={styles.createButtonText}>Create Channel</Text>
          </TouchableOpacity>
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
    maxHeight: "90%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  closeButton: {
    padding: 4,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    marginBottom: 12,
  },
  input: {
    backgroundColor: "#1e1e1e",
    borderRadius: 12,
    padding: 16,
    color: "white",
    fontSize: 15,
  },
  friendsList: {
    maxHeight: 300,
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
  createButton: {
    backgroundColor: "#DC2626",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  createButtonDisabled: {
    backgroundColor: "#555",
    opacity: 0.5,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
});
