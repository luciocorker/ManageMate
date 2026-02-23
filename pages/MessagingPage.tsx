// ============================================================================
// MESSAGING PAGE - Friend List & Channel List
// ============================================================================
// ✅ FUNCTIONAL FEATURES:
// - Friend list display (from Supabase)
// - Friend requests via email invitation
// - Channel creation and management
// - Navigation to direct messages (ChatScreen)
// - Navigation to channel chats (ChannelChatScreen)
// - Adding friends to channels
// - Deep linking for friend requests
//
// 🔒 PLACEHOLDER FEATURES (Need Supabase Auth):
// - User authentication (currently using placeholder AuthContext)
// - Secure user ID-based friend relationships
// - Profile data fetching from authenticated user
//
// ✅ FULLY FUNCTIONAL FLOW:
// 1. Click friend in list → Opens ChatScreen for direct messaging
// 2. In ChatScreen, click profile avatar → Opens ProfilePage (read-only)
// 3. ProfilePage shows friend's profile info (name, email, bio, etc.)
// ============================================================================

import AddFriendModal from "@/components/AddFriendModal";
import CreateChannelModal from "@/components/CreateChannelModal";
import UnreadBadge from "@/components/UnreadBadge";
import { useAuth } from "@/contexts/AuthContext";
import { useUnreadMessages } from "@/contexts/UnreadMessagesContext";
import ChannelChatScreen from "@/pages/ChannelChatScreen";
import ChannelDetail from "@/pages/ChannelDetail";
import ChatScreen from "@/pages/ChatScreen";
import {
  addChannelMembers,
  createChannel,
  getChannelMembers,
  getChannels,
  getDirectMessages,
  getFriendsWithProfiles,
} from "@/supabase/supabaseClient";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

import type { Channel, Friend } from "@/types/messaging";

// Avatar colors for friends
const AVATAR_COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEAA7",
  "#FF8B94",
  "#9B59B6",
  "#3498DB",
];

// Get consistent color for a friend
const getAvatarColor = (name: string) => {
  const index = name.length % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
};

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

const OnlineIndicator = () => (
  <Svg width="12" height="12" viewBox="0 0 12 12">
    <Circle
      cx="6"
      cy="6"
      r="5"
      fill="#00ff00"
      stroke="#121212"
      strokeWidth="2"
    />
  </Svg>
);

export default function MessagingPage() {
  const { user, loading: authLoading } = useAuth();

  // ============================================================================
  // ✅ FUNCTIONAL: Unread message tracking
  // Track when user is on messenger page to prevent popup notifications
  // ============================================================================
  const { getUnreadCount, setIsOnMessengerPage } = useUnreadMessages();

  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [showChannelDetail, setShowChannelDetail] = useState(false);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [showCreateChannelModal, setShowCreateChannelModal] = useState(false);
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // ============================================================================
  // ✅ FUNCTIONAL: Track when user enters/leaves messenger page
  // This prevents popup notifications when user is already viewing messages
  // ============================================================================
  useEffect(() => {
    // User is on messenger page
    setIsOnMessengerPage(true);

    // Cleanup: User left messenger page
    return () => {
      setIsOnMessengerPage(false);
    };
  }, []);

  // Load data from Supabase when component mounts
  useEffect(() => {
    // Don't load if auth is still loading
    if (!authLoading) {
      loadData();
    }
  }, [authLoading]);

  async function loadData() {
    if (!user) {
      console.log("⚠️ No user found, skipping data load");
      setLoading(false);
      return;
    }

    setLoading(true);
    console.log("📊 Loading messenger data for user:", user.email, "UID:", user.id);

    try {
      // Load channels and friends from Supabase using Firebase UID
      console.log("🔄 Fetching channels and friends from Supabase...");
      const [channelsData, friendsWithProfiles] = await Promise.all([
        getChannels(),
        getFriendsWithProfiles(user.id),
      ]);

      console.log("📊 Raw data loaded:");
      console.log("  - Channels:", channelsData.length);
      console.log("  - Friends with profiles:", friendsWithProfiles.length);

      if (channelsData.length > 0) {
        console.log("  - Sample channel:", channelsData[0]);
      }
      if (friendsWithProfiles.length > 0) {
        console.log("  - Sample friend:", friendsWithProfiles[0]);
      }

      // Transform Supabase channels to display format with member counts
      const displayChannels: Channel[] = await Promise.all(
        channelsData.map(async (ch) => {
          const memberIds = await getChannelMembers(ch.id);
          console.log(`  - Channel "${ch.name}" has ${memberIds.length} members`);
          return {
            id: ch.id,
            name: ch.name,
            members: memberIds.length,
            memberNames: memberIds, // These are Firebase UIDs
          };
        })
      );

      // Transform Supabase friends to display format with last message
      const displayFriends: Friend[] = await Promise.all(
        friendsWithProfiles.map(async (f) => {
          const profile = f.profile;
          
          console.log(`  - Processing friend: ${profile?.full_name || profile?.email}`);
          
          // Get last message with this friend using Firebase UIDs
          const messages = await getDirectMessages(user.id, f.friend_id);
          const lastMessage =
            messages.length > 0 ? messages[messages.length - 1] : null;

          console.log(`    - Messages with this friend: ${messages.length}`);
          if (lastMessage) {
            console.log(`    - Last message: "${lastMessage.content.substring(0, 30)}..."`);
          }

          return {
            id: f.friend_id, // Use friend's Firebase UID as ID
            name: profile?.full_name || profile?.email || "Unknown User",
            email: profile?.email,
            message: lastMessage ? lastMessage.content : "No messages yet",
            avatar: getAvatarColor(profile?.full_name || profile?.email || ""),
            online: false, // TODO: Add real-time presence
            bio: profile?.bio,
            phone: profile?.phone_number,
            profileImage: profile?.profile_picture_url,
            joinDate: profile?.created_at
              ? new Date(profile.created_at).toLocaleDateString()
              : "Recently",
          };
        })
      );

      console.log("✅ Data transformation complete:");
      console.log("  - Display channels:", displayChannels.length);
      console.log("  - Display friends:", displayFriends.length);

      setChannels(displayChannels);
      setFriends(displayFriends);
      console.log("✅ Messenger data loaded and state updated successfully");
    } catch (error) {
      console.error("❌ Error loading messenger data:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
    } finally {
      setLoading(false);
    }
  }

  const handleCreateChannel = async (
    channelName: string,
    selectedFriends: Friend[]
  ) => {
    if (!user) return;

    try {
      // Create channel in Supabase
      const memberNames = selectedFriends.map((f) => f.name).join(", ");
      const newChannel = await createChannel(
        channelName,
        `Members: ${memberNames}`
      );

      if (newChannel) {
        // Add selected friends as channel members using Firebase UIDs
        const friendIds = selectedFriends.map((f) => f.id);
        // Also add the current user as a member
        const allMemberIds = [user.id, ...friendIds];
        await addChannelMembers(newChannel.id, allMemberIds, user.id);

        // Add to local state
        const displayChannel: Channel = {
          id: newChannel.id,
          name: newChannel.name,
          members: allMemberIds.length,
          memberNames: [user.name, ...selectedFriends.map((f) => f.name)],
        };
        setChannels([displayChannel, ...channels]);
      }
    } catch (error) {
      console.error("Error creating channel:", error);
    }
  };

  // If viewing channel detail, show the detail screen
  if (selectedChannel && showChannelDetail) {
    return (
      <ChannelDetail
        channel={selectedChannel}
        onBack={() => {
          setShowChannelDetail(false);
          setSelectedChannel(null);
          // Reload data when returning from detail view
          loadData();
        }}
        onMembersUpdated={() => {
          // Reload data to reflect updated member counts
          loadData();
        }}
        onChannelDeleted={() => {
          // Channel was deleted, close detail and reload
          setShowChannelDetail(false);
          setSelectedChannel(null);
          loadData();
        }}
      />
    );
  }

  // If a channel is selected, show the channel chat screen
  if (selectedChannel) {
    return (
      <ChannelChatScreen
        channel={selectedChannel}
        onBack={() => {
          setSelectedChannel(null);
          // Reload data to ensure fresh state
          loadData();
        }}
        onInfoPress={() => setShowChannelDetail(true)}
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
          // Reload data to refresh last messages
          loadData();
        }}
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>

      <ScrollView style={styles.scrollContainer}>
        {/* Friends Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Friends</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddFriendModal(true)}
            >
              <AddFriendIcon />
            </TouchableOpacity>
          </View>

          <View style={styles.friendsList}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#DC2626" />
                <Text style={styles.loadingText}>Loading friends...</Text>
              </View>
            ) : friends.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No friends yet</Text>
                <Text style={styles.emptySubtext}>
                  Tap the + button to add friends
                </Text>
              </View>
            ) : (
              friends.map((friend) => {
                // ✅ FUNCTIONAL: Get unread count for this friend
                // Room ID uses Firebase UIDs
                const roomId = user ? [user.id, friend.id].sort().join("_") : "";
                const unreadCount = getUnreadCount(roomId);

                return (
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
                            { backgroundColor: friend.avatar },
                          ]}
                        >
                          <Text style={styles.avatarText}>
                            {friend.name.charAt(0)}
                          </Text>
                        </View>
                        {friend.online && (
                          <View style={styles.onlineIndicator}>
                            <OnlineIndicator />
                          </View>
                        )}
                      </View>
                      <View style={styles.friendInfo}>
                        <Text style={styles.friendName}>{friend.name}</Text>
                        <Text style={styles.friendMessage} numberOfLines={1}>
                          {friend.message}
                        </Text>
                      </View>

                      {/* ✅ FUNCTIONAL: Unread message badge */}
                      <UnreadBadge count={unreadCount} />
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
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

          <View style={styles.channelsList}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#DC2626" />
                <Text style={styles.loadingText}>Loading channels...</Text>
              </View>
            ) : channels.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No channels yet</Text>
                <Text style={styles.emptySubtext}>
                  Tap the + button to create a channel
                </Text>
              </View>
            ) : (
              channels.map((channel) => {
                // ✅ FUNCTIONAL: Get unread count for this channel
                const unreadCount = getUnreadCount(channel.id);

                return (
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
                        {channel.members > 0
                          ? `${channel.members} members`
                          : "No members yet"}
                      </Text>
                    </View>

                    {/* ✅ FUNCTIONAL: Unread message badge */}
                    <UnreadBadge count={unreadCount} />
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        </View>
      </ScrollView>

      {/* Create Channel Modal */}
      <CreateChannelModal
        visible={showCreateChannelModal}
        onClose={() => setShowCreateChannelModal(false)}
        onCreateChannel={handleCreateChannel}
        friends={friends}
      />

      <AddFriendModal
        visible={showAddFriendModal}
        onClose={() => setShowAddFriendModal(false)}
        currentUserName={user?.name || "TestUser"}
        currentUserEmail={user?.email || "test@example.com"}
        onSuccess={loadData}
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
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: "#121212",
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a2a",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
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
    color: "white",
  },
  addButton: {
    backgroundColor: "#DC2626",
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
    backgroundColor: "#1e1e1e",
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
  onlineIndicator: {
    position: "absolute",
    bottom: 0,
    right: 0,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    marginBottom: 4,
  },
  friendMessage: {
    fontSize: 14,
    color: "#999",
  },
  channelsList: {
    gap: 12,
  },
  channelItem: {
    backgroundColor: "#1e1e1e",
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
    color: "white",
    marginBottom: 4,
  },
  channelMembers: {
    fontSize: 13,
    color: "#999",
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "#999",
    marginTop: 12,
    fontSize: 14,
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptySubtext: {
    color: "#999",
    fontSize: 14,
    textAlign: "center",
  },
});
