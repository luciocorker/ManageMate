import {
    Channel,
    Message,
    User,
    getChannelById,
    getChannelMembers,
    getChannelMessages,
    sendChannelMessage,
    subscribeToChannelMessages,
} from "@/lib/messagingService";
import { supabase } from "@/lib/supabase";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
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

const SendIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M22 2L11 13M22 2L15 22L11 13M22 2L2 8L11 13"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const InfoIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 16V12M12 8H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Helper to format timestamp
const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diffDays < 7) return date.toLocaleDateString([], { weekday: "short", hour: "2-digit", minute: "2-digit" });
  return date.toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
};

// Helper to get avatar color
const getAvatarColor = (userId: string) => {
  const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E2"];
  const index = parseInt(userId.slice(0, 8), 16) % colors.length;
  return colors[index];
};

export default function ChannelChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const [channel, setChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [showMembers, setShowMembers] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const scrollViewRef = useRef<ScrollView>(null);

  // Get current user ID
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };
    getCurrentUser();
  }, []);

  // Load channel data
  useEffect(() => {
    if (!id || !currentUserId) return;

    const loadChannelData = async () => {
      setLoading(true);
      
      // Load channel info
      const channelData = await getChannelById(id);
      setChannel(channelData);

      // Load messages
      const msgs = await getChannelMessages(id);
      setMessages(msgs);

      // Load members
      const membersList = await getChannelMembers(id);
      setMembers(membersList);

      setLoading(false);

      // Scroll to bottom
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: false });
      }, 100);
    };

    loadChannelData();

    // Subscribe to new messages
    const subscription = subscribeToChannelMessages(id, (newMessage) => {
      setMessages((prev) => {
        // Check if message already exists
        if (prev.find((m) => m.id === newMessage.id)) {
          return prev;
        }
        return [...prev, newMessage];
      });

      // Scroll to bottom when new message arrives
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [id, currentUserId]);

  const handleSend = async () => {
    if (inputText.trim() && id && currentUserId) {
      const tempMessage: Message = {
        id: `temp-${Date.now()}`,
        channel_id: id,
        sender_id: currentUserId,
        content: inputText.trim(),
        file_url: null,
        file_name: null,
        file_type: null,
        file_size: null,
        created_at: new Date().toISOString(),
        sender: {
          id: currentUserId,
          full_name: "You",
          avatar_url: null,
        },
      };

      // Optimistically add message to UI
      setMessages((prev) => [...prev, tempMessage]);
      setInputText("");

      // Scroll to bottom
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);

      // Send to database
      await sendChannelMessage(id, inputText.trim());
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#DC2626" />
      </View>
    );
  }

  if (!channel) {
    return (
      <View style={styles.errorScreen}>
        <Text style={styles.errorText}>Channel not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButtonError}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <BackIcon />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <View style={styles.channelIcon}>
            <Text style={styles.channelIconText}>#</Text>
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerName}>{channel.name}</Text>
            <Text style={styles.memberCount}>{members.length} members</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => setShowMembers(!showMembers)} style={styles.infoButton}>
          <InfoIcon />
        </TouchableOpacity>
      </View>

      {/* Members List (collapsible) */}
      {showMembers && (
        <View style={styles.membersPanel}>
          <Text style={styles.membersPanelTitle}>Channel Members</Text>
          <ScrollView style={styles.membersList}>
            {members.map((member) => (
              <View key={member.id} style={styles.memberItem}>
                <View style={[styles.memberAvatar, { backgroundColor: getAvatarColor(member.id) }]}>
                  <Text style={styles.memberAvatarText}>
                    {member.full_name?.charAt(0) || "?"}
                  </Text>
                </View>
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{member.full_name || "Unknown"}</Text>
                  <Text style={styles.memberEmail}>{member.email}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No messages yet</Text>
            <Text style={styles.emptySubtext}>Be the first to send a message!</Text>
          </View>
        ) : (
          messages.map((message, index) => {
            const isMe = message.sender_id === currentUserId;
            const showSender = !isMe && (index === 0 || messages[index - 1].sender_id !== message.sender_id);
            
            return (
              <View key={message.id} style={styles.messageContainer}>
                {showSender && (
                  <View style={styles.senderInfo}>
                    <View style={[styles.miniAvatar, { backgroundColor: getAvatarColor(message.sender_id) }]}>
                      <Text style={styles.miniAvatarText}>
                        {message.sender?.full_name?.charAt(0) || "?"}
                      </Text>
                    </View>
                    <Text style={styles.senderName}>
                      {message.sender?.full_name || "Unknown User"}
                    </Text>
                    <Text style={styles.messageTime}>
                      {formatTimestamp(message.created_at)}
                    </Text>
                  </View>
                )}
                <View style={[styles.messageRow, isMe && styles.myMessageRow]}>
                  {!showSender && !isMe && <View style={styles.avatarSpacer} />}
                  <View
                    style={[
                      styles.messageBubble,
                      isMe ? styles.myMessage : styles.theirMessage,
                      showSender && !isMe && styles.firstMessage,
                    ]}
                  >
                    <Text style={styles.messageText}>{message.content}</Text>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={`Message #${channel.name}`}
          placeholderTextColor="#666"
          value={inputText}
          onChangeText={setInputText}
          multiline
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSend}
          disabled={!inputText.trim()}
        >
          <SendIcon />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  loadingScreen: {
    flex: 1,
    backgroundColor: "#121212",
    justifyContent: "center",
    alignItems: "center",
  },
  errorScreen: {
    flex: 1,
    backgroundColor: "#121212",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: "#DC2626",
    marginBottom: 20,
  },
  backButtonError: {
    backgroundColor: "#DC2626",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
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
  headerInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  channelIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#DC2626",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  channelIconText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  headerTextContainer: {
    flex: 1,
  },
  headerName: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
    marginBottom: 2,
  },
  memberCount: {
    fontSize: 12,
    color: "#999",
  },
  infoButton: {
    padding: 8,
  },
  membersPanel: {
    backgroundColor: "#1a1a1a",
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a2a",
    maxHeight: 200,
  },
  membersPanelTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#999",
    paddingHorizontal: 16,
    paddingVertical: 12,
    textTransform: "uppercase",
  },
  membersList: {
    maxHeight: 150,
  },
  memberItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  memberAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  memberAvatarText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "white",
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 14,
    fontWeight: "500",
    color: "white",
  },
  memberEmail: {
    fontSize: 12,
    color: "#666",
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#444",
  },
  messageContainer: {
    marginBottom: 12,
  },
  senderInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    marginLeft: 4,
  },
  miniAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  miniAvatarText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "white",
  },
  senderName: {
    fontSize: 13,
    fontWeight: "600",
    color: "white",
    marginRight: 8,
  },
  messageTime: {
    fontSize: 11,
    color: "#666",
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  myMessageRow: {
    justifyContent: "flex-end",
  },
  avatarSpacer: {
    width: 28,
  },
  messageBubble: {
    padding: 10,
    borderRadius: 12,
    maxWidth: "80%",
  },
  firstMessage: {
    marginLeft: 4,
  },
  myMessage: {
    backgroundColor: "#DC2626",
    borderBottomRightRadius: 4,
  },
  theirMessage: {
    backgroundColor: "#1e1e1e",
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    color: "white",
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 20,
    backgroundColor: "#121212",
    borderTopWidth: 1,
    borderTopColor: "#2a2a2a",
  },
  input: {
    flex: 1,
    backgroundColor: "#1e1e1e",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: "white",
    fontSize: 15,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: "#DC2626",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
});
