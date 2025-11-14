import CreateChannelModal from "@/components/CreateChannelModal";
import StartConversationModal from "@/components/StartConversationModal";
import { useMessaging } from "@/contexts/MessagingContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Channel as ChannelType, getAllUsers, getDirectMessageConversations, getUserChannels, User } from "@/lib/messagingService";
import ChannelDetail from "@/pages/ChannelDetail";
import ChatScreen from "@/pages/ChatScreen";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Svg, { Path } from "react-native-svg";

// SVG Icons
const AddFriendIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M8.5 11C10.7091 11 12.5 9.20914 12.5 7C12.5 4.79086 10.7091 3 8.5 3C6.29086 3 4.5 4.79086 4.5 7C4.5 9.20914 6.29086 11 8.5 11Z"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M20 8V14M23 11H17"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const CreateChannelIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 5V19M5 12H19"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ChannelIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z"
      stroke="#888"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Helper to format timestamp
const formatMessageTime = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

export default function MessagingPage() {
  const { colors } = useTheme();
  const { refreshUnreadCount } = useMessaging();
  const [selectedFriend, setSelectedFriend] = useState<User | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<ChannelType | null>(null);
  const [channels, setChannels] = useState<ChannelType[]>([]);
  const [friends, setFriends] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [showCreateChannelModal, setShowCreateChannelModal] = useState(false);
  const [showStartConversationModal, setShowStartConversationModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string>("");

  useEffect(() => {
    loadData();
    // Get current user ID
    const getCurrentUser = async () => {
      const { data: { user } } = await (await import("@/lib/supabase")).supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };
    getCurrentUser();
  }, []);

  // Reload data when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadData();
      refreshUnreadCount(); // Refresh badge count when screen comes into focus
    }, [refreshUnreadCount])
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const [channelsData, friendsData, usersData] = await Promise.all([
        getUserChannels(),
        getDirectMessageConversations(),
        getAllUsers(),
      ]);
      setChannels(channelsData);
      setFriends(friendsData);
      setAllUsers(usersData);
    } catch (error) {
      console.error('Error loading messaging data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChannel = async (
    channelName: string,
    selectedFriends: User[]
  ) => {
    // This will be handled by the modal
    await loadData(); // Reload data after creating channel
  };

  // If a channel is selected, show the channel detail screen
  if (selectedChannel) {
    return (
      <ChannelDetail
        channel={selectedChannel}
        onBack={() => {
          setSelectedChannel(null);
          loadData();
        }}
      />
    );
  }

  // If a friend is selected, show the chat screen
  if (selectedFriend) {
    return (
      <ChatScreen
        friend={selectedFriend}
        onBack={() => {
          setSelectedFriend(null);
          loadData();
        }}
      />
    );
  }

  if (loading) {
    const styles = createStyles(colors);
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Messages</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading messages...</Text>
        </View>
      </View>
    );
  }

  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>

      <ScrollView style={styles.scrollContainer}>
        {/* Direct Messages Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Direct Messages</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setShowStartConversationModal(true)}
            >
              <AddFriendIcon />
            </TouchableOpacity>
          </View>

          {friends.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No conversations yet. Start chatting with your team members!
              </Text>
            </View>
          ) : (
            <View style={styles.friendsList}>
              {friends.map((friend) => (
                <TouchableOpacity
                  key={friend.id}
                  style={styles.friendItem}
                  onPress={() => setSelectedFriend(friend)}
                >
                  <View style={styles.friendContent}>
                    <View style={styles.avatarContainer}>
                      <View
                        style={[
                          styles.avatar,
                          { backgroundColor: getAvatarColor(friend.full_name) },
                        ]}
                      >
                        <Text style={styles.avatarText}>
                          {friend.full_name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      {(friend.unread_count ?? 0) > 0 && (
                        <View style={styles.unreadBadge}>
                          <Text style={styles.unreadBadgeText}>
                            {(friend.unread_count ?? 0) > 9 ? '9+' : String(friend.unread_count ?? 0)}
                          </Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.friendInfo}>
                      <View style={styles.friendNameRow}>
                        <Text style={styles.friendName}>{friend.full_name}</Text>
                        {friend.last_message_time && (
                          <Text style={styles.messageTime}>
                            {formatMessageTime(friend.last_message_time)}
                          </Text>
                        )}
                      </View>
                      <Text 
                        style={[
                          styles.friendMessage,
                          (friend.unread_count ?? 0) > 0 ? styles.unreadMessage : null
                        ]} 
                        numberOfLines={1}
                      >
                        {friend.last_message ? (
                          <>
                            {friend.last_message_sender_id === currentUserId ? "You: " : ""}
                            {friend.last_message}
                          </>
                        ) : (
                          friend.email
                        )}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Channels Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Channels</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowCreateChannelModal(true)}
            >
              <CreateChannelIcon />
            </TouchableOpacity>
          </View>

          {channels.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No channels yet. Create a project to get started!
              </Text>
            </View>
          ) : (
            <View style={styles.channelsList}>
              {channels.map((channel) => (
                <TouchableOpacity
                  key={channel.id}
                  style={styles.channelItem}
                  onPress={() => setSelectedChannel(channel)}
                >
                  <View style={styles.channelIcon}>
                    <ChannelIcon />
                  </View>
                  <View style={styles.channelInfo}>
                    <Text style={styles.channelName}>{channel.name}</Text>
                    <Text style={styles.channelMembers}>
                      {`${channel.member_count || 0} members`}
                      {channel.project_id ? ' • Project Channel' : ''}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Start Conversation Modal - For Direct Messages */}
      <StartConversationModal
        visible={showStartConversationModal}
        onClose={() => setShowStartConversationModal(false)}
        onSelectUser={(user) => {
          setShowStartConversationModal(false);
          setSelectedFriend(user);
        }}
        existingConversations={friends}
      />

      {/* Create Channel Modal - For Group Channels */}
      <CreateChannelModal
        visible={showCreateChannelModal}
        onClose={() => setShowCreateChannelModal(false)}
        onCreateChannel={handleCreateChannel}
        friends={allUsers}
      />
    </View>
  );
}

// Helper function to get consistent avatar color
function getAvatarColor(name: string): string {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#A29BFE', '#FD79A8'];
  const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  return colors[index];
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.text,
  },
  scrollContainer: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.text,
  },
  addButton: {
    backgroundColor: colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  friendsList: {
    gap: 12,
  },
  friendItem: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  friendContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  unreadBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 5,
    borderWidth: 2,
    borderColor: colors.background,
  },
  unreadBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 0,
    right: 0,
  },
  friendInfo: {
    flex: 1,
  },
  friendNameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  friendName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    flex: 1,
  },
  messageTime: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  friendMessage: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  unreadMessage: {
    fontWeight: "600",
    color: colors.text,
  },
  youPrefix: {
    color: colors.textSecondary,
    fontWeight: "400",
  },
  channelsList: {
    gap: 12,
  },
  channelItem: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  channelIcon: {
    marginRight: 12,
  },
  channelInfo: {
    flex: 1,
  },
  channelName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
  },
  channelMembers: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.textSecondary,
  },
  emptyState: {
    padding: 20,
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
  },
});
