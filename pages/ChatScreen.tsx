import { useMessaging } from "@/contexts/MessagingContext";
import {
    DirectMessage,
    User,
    getDirectMessages,
    markMessagesAsRead,
    sendDirectMessage,
    subscribeToDirectMessages,
} from "@/lib/messagingService";
import { supabase } from "@/lib/supabase";
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

interface ChatScreenProps {
  friend: User;
  onBack: () => void;
}

// Helper to get avatar color from user ID
const getAvatarColor = (userId: string) => {
  const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E2"];
  const index = parseInt(userId.slice(0, 8), 16) % colors.length;
  return colors[index];
};

// Helper to format timestamp
const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function ChatScreen({ friend, onBack }: ChatScreenProps) {
  const { refreshUnreadCount } = useMessaging();
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
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

  // Load messages and mark as read
  useEffect(() => {
    if (!currentUserId) return;

    const loadMessages = async () => {
      setLoading(true);
      const msgs = await getDirectMessages(friend.id);
      setMessages(msgs);
      setLoading(false);
      
      // Mark messages from this friend as read
      await markMessagesAsRead(friend.id);
      // Refresh the badge count
      await refreshUnreadCount();
      
      // Scroll to bottom after loading
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: false });
      }, 100);
    };

    loadMessages();

    // Subscribe to new messages
    const subscription = subscribeToDirectMessages((newMessage) => {
      // Only add messages between current user and this friend
      if (
        (newMessage.sender_id === friend.id && newMessage.receiver_id === currentUserId) ||
        (newMessage.sender_id === currentUserId && newMessage.receiver_id === friend.id)
      ) {
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
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [friend.id, currentUserId, refreshUnreadCount]);

  const handleSend = async () => {
    if (inputText.trim() && currentUserId) {
      const tempMessage: DirectMessage = {
        id: `temp-${Date.now()}`,
        sender_id: currentUserId,
        receiver_id: friend.id,
        content: inputText.trim(),
        file_url: null,
        file_name: null,
        file_type: null,
        file_size: null,
        read: false,
        created_at: new Date().toISOString(),
      };
      
      // Optimistically add message to UI
      setMessages((prev) => [...prev, tempMessage]);
      setInputText("");
      
      // Scroll to bottom
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);

      // Send to database
      await sendDirectMessage(friend.id, inputText.trim());
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <BackIcon />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <View
            style={[styles.headerAvatar, { backgroundColor: getAvatarColor(friend.id) }]}
          >
            <Text style={styles.headerAvatarText}>
              {friend.full_name?.charAt(0) || "?"}
            </Text>
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerName}>{friend.full_name || "Unknown User"}</Text>
            <Text style={styles.onlineText}>{friend.email}</Text>
          </View>
        </View>
      </View>

      {/* Messages */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#DC2626" />
        </View>
      ) : (
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
        >
          {messages.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No messages yet</Text>
              <Text style={styles.emptySubtext}>Start the conversation!</Text>
            </View>
          ) : (
            messages.map((message) => {
              const isMe = message.sender_id === currentUserId;
              return (
                <View
                  key={message.id}
                  style={[
                    styles.messageWrapper,
                    isMe ? styles.myMessageWrapper : styles.theirMessageWrapper,
                  ]}
                >
                  <View
                    style={[
                      styles.messageBubble,
                      isMe ? styles.myMessage : styles.theirMessage,
                    ]}
                  >
                    <Text style={styles.messageText}>{message.content}</Text>
                  </View>
                  <Text style={styles.timestamp}>
                    {formatTimestamp(message.created_at)}
                  </Text>
                </View>
              );
            })
          )}
        </ScrollView>
      )}

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
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
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  headerAvatarText: {
    fontSize: 18,
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
  onlineStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  onlineText: {
    fontSize: 12,
    color: "#999",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  messageWrapper: {
    marginBottom: 16,
    maxWidth: "80%",
  },
  myMessageWrapper: {
    alignSelf: "flex-end",
    alignItems: "flex-end",
  },
  theirMessageWrapper: {
    alignSelf: "flex-start",
    alignItems: "flex-start",
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    marginBottom: 4,
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
  timestamp: {
    fontSize: 11,
    color: "#666",
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
