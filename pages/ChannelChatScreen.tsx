import { useAuth } from "@/contexts/AuthContext";
import { useSocket } from "@/contexts/SocketContext";
import { useUnreadMessages } from "@/contexts/UnreadMessagesContext";
import {
  getChannelMessages,
  sendMessageToChannel,
} from "@/supabase/supabaseClient";
import type { Channel } from "@/types/messaging";
import { useEffect, useState } from "react";
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
import Svg, { Circle, Path } from "react-native-svg";

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
    <Circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" />
    <Path
      d="M12 16V12M12 8H12.01"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: string;
}

interface ChannelChatScreenProps {
  channel: Channel;
  onBack: () => void;
  onInfoPress: () => void;
}

export default function ChannelChatScreen({
  channel,
  onBack,
  onInfoPress,
}: ChannelChatScreenProps) {
  const { user } = useAuth();
  const socket = useSocket();

  // ============================================================================
  // ✅ FUNCTIONAL: Unread message tracking
  // Mark channel messages as read when user opens this channel
  // ============================================================================
  const { markAsRead } = useUnreadMessages();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Load messages on mount
  useEffect(() => {
    loadMessages();
  }, [channel.id]);

  // ============================================================================
  // ✅ FUNCTIONAL: Mark channel as read when user opens it
  // This clears the unread badge for this channel
  // ============================================================================
  useEffect(() => {
    markAsRead(channel.id);
  }, [channel.id]);

  // Setup Socket.IO listeners for real-time channel messages
  useEffect(() => {
    if (!socket.isConnected || !user) return;

    // Join the channel room
    socket.joinChannel(channel.id);

    // Listen for new messages in this channel
    socket.onNewMessage((message: any) => {
      // Only add messages for this channel
      if (message.channelId === channel.id) {
        const newMessage: Message = {
          id: message.id,
          text: message.text,
          sender: message.senderName === user.name ? "You" : message.senderName,
          timestamp: new Date(message.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };

        setMessages((prev) => [...prev, newMessage]);

        // ============================================================================
        // ✅ FUNCTIONAL: Mark channel as read when new message arrives
        // Since the user is viewing this channel, clear the unread badge immediately
        // ============================================================================
        markAsRead(channel.id);
      }
    });

    // Cleanup on unmount
    return () => {
      socket.leaveChannel(channel.id);
      socket.offNewMessage();
    };
  }, [socket.isConnected, user, channel.id]);

  async function loadMessages() {
    if (!user) return;

    setLoading(true);
    try {
      const supabaseMessages = await getChannelMessages(channel.id);

      // Transform Supabase messages to display format
      const displayMessages: Message[] = supabaseMessages.map((msg) => ({
        id: msg.id,
        text: msg.text,
        sender: msg.sender_name === user.name ? "You" : msg.sender_name,
        timestamp: new Date(msg.created_at).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      }));

      setMessages(displayMessages);
    } catch (error) {
      console.error("Error loading channel messages:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleSend = async () => {
    if (inputText.trim() && !sending && user) {
      setSending(true);
      try {
        // Save message to Supabase
        const savedMessage = await sendMessageToChannel(
          channel.id,
          user.name,
          inputText.trim()
        );

        if (savedMessage) {
          // Send message via Socket.IO for real-time delivery
          socket.sendMessage(channel.id, {
            id: savedMessage.id,
            text: savedMessage.text,
            senderName: savedMessage.sender_name,
            createdAt: savedMessage.created_at,
            channelId: channel.id,
          });

          // Add message to local state (will also be received via socket)
          const newMessage: Message = {
            id: savedMessage.id,
            text: savedMessage.text,
            sender: "You",
            timestamp: new Date(savedMessage.created_at).toLocaleTimeString(
              [],
              {
                hour: "2-digit",
                minute: "2-digit",
              }
            ),
          };
          setMessages([...messages, newMessage]);
          setInputText("");
        } else {
          console.error("Failed to send message");
        }
      } catch (error) {
        console.error("Error sending channel message:", error);
      } finally {
        setSending(false);
      }
    }
  };

  const getAvatarColor = (name: string) => {
    const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7"];
    const index = name.length % colors.length;
    return colors[index];
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <BackIcon />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerName}>{channel.name}</Text>
            <Text style={styles.memberCount}>{channel.members} members</Text>
          </View>
          <TouchableOpacity onPress={onInfoPress} style={styles.infoButton}>
            <InfoIcon />
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <ScrollView
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
        >
          {/* Channel Created Indicator */}
          {channel.memberNames && channel.memberNames.length > 0 && (
            <View style={styles.systemMessage}>
              <Text style={styles.systemMessageText}>
                Channel created with {channel.memberNames.join(", ")}
              </Text>
            </View>
          )}

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#DC2626" />
              <Text style={styles.loadingText}>Loading messages...</Text>
            </View>
          ) : messages.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No messages yet</Text>
              <Text style={styles.emptySubtext}>
                Be the first to send a message in this channel!
              </Text>
            </View>
          ) : (
            messages.map((message) => {
              const isMe = message.sender === "You";
              return (
                <View
                  key={message.id}
                  style={[
                    styles.messageWrapper,
                    isMe ? styles.myMessageWrapper : styles.theirMessageWrapper,
                  ]}
                >
                  {!isMe && (
                    <View style={styles.messageHeader}>
                      <View
                        style={[
                          styles.senderAvatar,
                          { backgroundColor: getAvatarColor(message.sender) },
                        ]}
                      >
                        <Text style={styles.senderAvatarText}>
                          {message.sender.charAt(0)}
                        </Text>
                      </View>
                      <Text style={styles.senderName}>{message.sender}</Text>
                    </View>
                  )}
                  <View
                    style={[
                      styles.messageBubble,
                      isMe ? styles.myMessage : styles.theirMessage,
                    ]}
                  >
                    <Text style={styles.messageText}>{message.text}</Text>
                  </View>
                  <Text style={styles.timestamp}>{message.timestamp}</Text>
                </View>
              );
            })
          )}
        </ScrollView>

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
            style={[
              styles.sendButton,
              (!inputText.trim() || sending) && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!inputText.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <SendIcon />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  flex: {
    flex: 1,
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
    flex: 1,
  },
  headerName: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
    marginBottom: 2,
  },
  memberCount: {
    fontSize: 13,
    color: "#999",
  },
  infoButton: {
    padding: 4,
    marginLeft: 8,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  systemMessage: {
    backgroundColor: "#2a2a2a",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: "center",
  },
  systemMessageText: {
    fontSize: 13,
    color: "#999",
    textAlign: "center",
  },
  messageWrapper: {
    marginBottom: 16,
    maxWidth: "85%",
  },
  myMessageWrapper: {
    alignSelf: "flex-end",
    alignItems: "flex-end",
  },
  theirMessageWrapper: {
    alignSelf: "flex-start",
    alignItems: "flex-start",
  },
  messageHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  senderAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  senderAvatarText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "white",
  },
  senderName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#ccc",
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
  sendButtonDisabled: {
    backgroundColor: "#666",
    opacity: 0.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    color: "#999",
    marginTop: 12,
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
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
