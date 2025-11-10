import ChatScreen from "@/pages/ChatScreen";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

// Dummy data
const DUMMY_FRIENDS = [
  {
    id: 1,
    name: "Sarah Johnson",
    message: "Hey! Did you finish the project?",
    avatar: "#FF6B6B",
    online: true,
  },
  {
    id: 2,
    name: "Mike Chen",
    message: "Thanks for your help yesterday!",
    avatar: "#4ECDC4",
    online: true,
  },
  {
    id: 3,
    name: "Emily Davis",
    message: "See you at the meeting tomorrow",
    avatar: "#45B7D1",
    online: false,
  },
  {
    id: 4,
    name: "James Wilson",
    message: "Can you send me those files?",
    avatar: "#96CEB4",
    online: false,
  },
  {
    id: 5,
    name: "Lisa Anderson",
    message: "Great work on the presentation!",
    avatar: "#FFEAA7",
    online: true,
  },
];

const DUMMY_CHANNELS = [
  { id: 1, name: "Project Team", members: 5 },
  { id: 2, name: "Design Squad", members: 3 },
  { id: 3, name: "Development", members: 8 },
  { id: 4, name: "Marketing", members: 4 },
];

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
  const [selectedFriend, setSelectedFriend] = useState<
    (typeof DUMMY_FRIENDS)[0] | null
  >(null);

  // If a friend is selected, show the chat screen
  if (selectedFriend) {
    return (
      <ChatScreen
        friend={selectedFriend}
        onBack={() => setSelectedFriend(null)}
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
            <TouchableOpacity style={styles.addButton}>
              <AddFriendIcon />
            </TouchableOpacity>
          </View>

          <View style={styles.friendsList}>
            {DUMMY_FRIENDS.map((friend) => (
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
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Channels Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Channels</Text>
            <TouchableOpacity style={styles.addButton}>
              <CreateChannelIcon />
            </TouchableOpacity>
          </View>

          <View style={styles.channelsList}>
            {DUMMY_CHANNELS.map((channel) => (
              <TouchableOpacity key={channel.id} style={styles.channelItem}>
                <View style={styles.channelIcon}>
                  <ChannelIcon />
                </View>
                <View style={styles.channelInfo}>
                  <Text style={styles.channelName}>{channel.name}</Text>
                  <Text style={styles.channelMembers}>
                    {channel.members} members
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
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
});
