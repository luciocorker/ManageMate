import { User, getAllUsers, getTeammates } from "@/lib/messagingService";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
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

const SearchIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
      stroke="#666"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Helper to get avatar color
const getAvatarColor = (userId: string) => {
  const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E2"];
  const index = parseInt(userId.slice(0, 8), 16) % colors.length;
  return colors[index];
};

interface StartConversationModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectUser: (user: User) => void;
  existingConversations: User[];
}

export default function StartConversationModal({
  visible,
  onClose,
  onSelectUser,
  existingConversations,
}: StartConversationModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [teammates, setTeammates] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"teammates" | "all">("teammates");

  useEffect(() => {
    if (visible) {
      loadUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const loadUsers = async () => {
    setLoading(true);
    const [teammatesData, allUsersData] = await Promise.all([
      getTeammates(),
      getAllUsers(),
    ]);
    
    // Filter out users who already have conversations
    const existingIds = new Set(existingConversations.map(u => u.id));
    setTeammates(teammatesData.filter(u => !existingIds.has(u.id)));
    setAllUsers(allUsersData.filter(u => !existingIds.has(u.id)));
    setLoading(false);
  };

  const handleClose = () => {
    setSearchQuery("");
    setActiveTab("teammates");
    onClose();
  };

  const handleSelectUser = (user: User) => {
    setSearchQuery("");
    setActiveTab("teammates");
    onSelectUser(user);
  };

  const getFilteredUsers = () => {
    const users = activeTab === "teammates" ? teammates : allUsers;
    if (!searchQuery.trim()) return users;

    const query = searchQuery.toLowerCase();
    return users.filter(
      (user) =>
        user.full_name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query)
    );
  };

  const filteredUsers = getFilteredUsers();

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
            <Text style={styles.headerTitle}>Start Conversation</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <CloseIcon />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <SearchIcon />
            <TextInput
              style={styles.searchInput}
              placeholder="Search users..."
              placeholderTextColor="#666"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Tabs */}
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, activeTab === "teammates" && styles.tabActive]}
              onPress={() => setActiveTab("teammates")}
            >
              <Text style={[styles.tabText, activeTab === "teammates" && styles.tabTextActive]}>
                Teammates ({teammates.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === "all" && styles.tabActive]}
              onPress={() => setActiveTab("all")}
            >
              <Text style={[styles.tabText, activeTab === "all" && styles.tabTextActive]}>
                All Users ({allUsers.length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Users List */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#DC2626" />
            </View>
          ) : (
            <ScrollView style={styles.usersList}>
              {filteredUsers.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    {searchQuery
                      ? "No users found"
                      : activeTab === "teammates"
                      ? "No teammates yet"
                      : "No users available"}
                  </Text>
                  <Text style={styles.emptySubtext}>
                    {activeTab === "teammates" && !searchQuery
                      ? "Teammates are people you've worked with on projects"
                      : searchQuery
                      ? "Try a different search"
                      : ""}
                  </Text>
                </View>
              ) : (
                filteredUsers.map((user) => (
                  <TouchableOpacity
                    key={user.id}
                    style={styles.userItem}
                    onPress={() => handleSelectUser(user)}
                  >
                    <View
                      style={[
                        styles.userAvatar,
                        { backgroundColor: getAvatarColor(user.id) },
                      ]}
                    >
                      <Text style={styles.userAvatarText}>
                        {user.full_name?.charAt(0) || "?"}
                      </Text>
                    </View>
                    <View style={styles.userInfo}>
                      <Text style={styles.userName}>
                        {user.full_name || "Unknown User"}
                      </Text>
                      <Text style={styles.userEmail}>{user.email}</Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
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
    maxHeight: "90%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e1e1e",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    color: "white",
    fontSize: 15,
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: "#1e1e1e",
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: "#DC2626",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  tabTextActive: {
    color: "white",
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: "center",
  },
  usersList: {
    maxHeight: 400,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#444",
    textAlign: "center",
    paddingHorizontal: 40,
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e1e1e",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  userAvatarText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
    color: "#999",
  },
});
