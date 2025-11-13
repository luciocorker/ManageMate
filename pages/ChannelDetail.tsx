import AddMembersModal from "@/components/AddMembersModal";
import EditChannelModal from "@/components/EditChannelModal";
import { useAuth } from "@/contexts/AuthContext";
import {
  addChannelMembers,
  deleteChannel,
  getChannelMembers,
  getFriends,
  updateChannel,
} from "@/supabase/supabaseClient";
import type { Channel, Friend } from "@/types/messaging";
import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Path } from "react-native-svg";

// SVG Icons
const BackIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 12H5M5 12L12 19M5 12L12 5"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const UsersIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 1.17157 16.1716C0.421427 16.9217 0 17.9391 0 19V21"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45768C17.623 10.1593 16.8604 10.6597 16 10.88"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

interface ChannelDetailProps {
  channel: Channel;
  onBack: () => void;
  onMembersUpdated?: () => void;
  onChannelDeleted?: () => void;
}

export default function ChannelDetail({
  channel,
  onBack,
  onMembersUpdated,
  onChannelDeleted,
}: ChannelDetailProps) {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [showAddMembersModal, setShowAddMembersModal] = useState(false);
  const [showEditChannelModal, setShowEditChannelModal] = useState(false);
  const [channelMembers, setChannelMembers] = useState<string[]>(
    channel.memberNames || []
  );
  const [channelName, setChannelName] = useState(channel.name);
  const [channelDescription, setChannelDescription] = useState(
    channel.description || ""
  );
  const avatarColors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7"];

  // Load friends when component mounts
  useEffect(() => {
    loadFriends();
    loadChannelMembers();
  }, [user]);

  async function loadFriends() {
    if (!user) return;
    try {
      const friendsData = await getFriends(user.name);
      const displayFriends: Friend[] = friendsData.map((f) => ({
        id: f.id,
        name: f.friend_name,
        message: "",
        avatar: getAvatarColor(f.friend_name),
        online: Math.random() > 0.5,
      }));
      setFriends(displayFriends);
    } catch (error) {
      console.error("Error loading friends:", error);
    }
  }

  async function loadChannelMembers() {
    try {
      const members = await getChannelMembers(channel.id);
      setChannelMembers(members);
    } catch (error) {
      console.error("Error loading channel members:", error);
    }
  }

  async function handleAddMembers(selectedFriends: Friend[]): Promise<boolean> {
    if (!user) return false;

    try {
      const friendNames = selectedFriends.map((f) => f.name);
      const success = await addChannelMembers(
        channel.id,
        friendNames,
        user.name
      );

      if (success) {
        // Reload members
        await loadChannelMembers();
        // Notify parent to refresh
        onMembersUpdated?.();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error adding members:", error);
      return false;
    }
  }

  function getAvatarColor(name: string) {
    const index = name.length % avatarColors.length;
    return avatarColors[index];
  }

  async function handleEditChannel(
    name: string,
    description: string
  ): Promise<boolean> {
    try {
      const success = await updateChannel(channel.id, { name, description });

      if (success) {
        // Update local state
        setChannelName(name);
        setChannelDescription(description);
        // Notify parent to refresh
        onMembersUpdated?.();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error editing channel:", error);
      return false;
    }
  }

  function handleDeleteChannel() {
    // Show confirmation dialog
    Alert.alert(
      "Delete Channel",
      `Are you sure you want to delete "${channel.name}"? This will delete all messages and cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const success = await deleteChannel(channel.id);
              if (success) {
                // Notify parent and go back
                onChannelDeleted?.();
                onBack();
              } else {
                Alert.alert(
                  "Error",
                  "Failed to delete channel. Please try again."
                );
              }
            } catch (error) {
              console.error("Error deleting channel:", error);
              Alert.alert(
                "Error",
                "An error occurred while deleting the channel."
              );
            }
          },
        },
      ]
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <BackIcon />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{channelName}</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Channel Info */}
        <View style={styles.infoSection}>
          <View style={styles.channelIcon}>
            <UsersIcon />
          </View>
          <Text style={styles.channelName}>{channelName}</Text>
          {channelDescription ? (
            <Text style={styles.channelDescription}>{channelDescription}</Text>
          ) : null}
          <Text style={styles.memberCount}>
            {channelMembers.length} members
          </Text>
        </View>

        {/* Members List */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Members</Text>
            <TouchableOpacity
              style={styles.addMemberButton}
              onPress={() => setShowAddMembersModal(true)}
            >
              <Text style={styles.addMemberButtonText}>+ Add</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.membersList}>
            {channelMembers.map((memberName, index) => (
              <View key={index} style={styles.memberItem}>
                <View
                  style={[
                    styles.memberAvatar,
                    {
                      backgroundColor:
                        avatarColors[index % avatarColors.length],
                    },
                  ]}
                >
                  <Text style={styles.memberAvatarText}>
                    {memberName.charAt(0)}
                  </Text>
                </View>
                <Text style={styles.memberName}>{memberName}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Channel Actions */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Open Channel Chat</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setShowEditChannelModal(true)}
          >
            <Text style={styles.editButtonText}>Edit Channel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteChannel}
          >
            <Text style={styles.deleteButtonText}>Delete Channel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Add Members Modal */}
      <AddMembersModal
        visible={showAddMembersModal}
        onClose={() => setShowAddMembersModal(false)}
        onAddMembers={handleAddMembers}
        friends={friends}
        existingMembers={channelMembers}
        channelName={channelName}
      />

      {/* Edit Channel Modal */}
      <EditChannelModal
        visible={showEditChannelModal}
        onClose={() => setShowEditChannelModal(false)}
        channelName={channelName}
        channelDescription={channelDescription}
        onSave={handleEditChannel}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: "#121212",
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a2a",
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "white",
  },
  content: {
    flex: 1,
  },
  infoSection: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a2a",
  },
  channelIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#DC2626",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  channelName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
  },
  channelDescription: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  memberCount: {
    fontSize: 16,
    color: "#999",
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
  },
  addMemberButton: {
    backgroundColor: "#DC2626",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addMemberButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  membersList: {
    gap: 12,
  },
  memberItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e1e1e",
    borderRadius: 12,
    padding: 12,
  },
  memberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  memberAvatarText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  memberName: {
    fontSize: 16,
    fontWeight: "500",
    color: "white",
  },
  actionButton: {
    backgroundColor: "#DC2626",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  editButton: {
    backgroundColor: "#1e1e1e",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#4ECDC4",
    marginBottom: 12,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4ECDC4",
  },
  deleteButton: {
    backgroundColor: "#1e1e1e",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DC2626",
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#DC2626",
  },
});
