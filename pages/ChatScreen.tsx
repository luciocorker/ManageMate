// ============================================================================
// CHAT SCREEN - Direct Messaging Between Friends
// ============================================================================
// ✅ FUNCTIONAL FEATURES:
// - Real-time messaging via Supabase Realtime
// - Message persistence via Supabase
// - Friend list navigation
// - Profile viewing (read-only)
// - Message reactions (UI only)
// - Reply functionality (UI only)
//
// 🔒 PLACEHOLDER FEATURES (Need Supabase Auth):
// - User authentication (currently using placeholder AuthContext)
// - Secure user ID-based messaging
// - Profile data fetching from authenticated user
// ============================================================================

import { useAuth } from "@/contexts/AuthContext";
import { useRealtime } from "@/contexts/RealtimeContext";
import { useUnreadMessages } from "@/contexts/UnreadMessagesContext";
import ProfilePage from "@/pages/ProfilePage";
import {
  getDirectMessages,
  sendMessageToFriend,
} from "@/supabase/supabaseClient";
import type { Friend } from "@/types/messaging";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
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

const ReactionIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke="#999" strokeWidth="2" />
    <Path
      d="M8 14C8 14 9.5 16 12 16C14.5 16 16 14 16 14"
      stroke="#999"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

const ReplyIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 14L4 9L9 4"
      stroke="#999"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M20 20V13C20 11.9391 19.5786 10.9217 18.8284 10.1716C18.0783 9.42143 17.0609 9 16 9H4"
      stroke="#999"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const CloseIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 6L6 18M6 6L18 18"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const OnlineIndicator = () => (
  <Svg width="10" height="10" viewBox="0 0 10 10">
    <Circle
      cx="5"
      cy="5"
      r="4"
      fill="#00ff00"
      stroke="#121212"
      strokeWidth="2"
    />
  </Svg>
);

interface MessageReaction {
  emoji: string;
  count: number;
  userReacted: boolean;
}

interface Message {
  id: string;
  text: string;
  sender: "me" | "them";
  senderName: string;
  timestamp: string;
  reactions?: MessageReaction[];
  replyTo?: {
    id: string;
    text: string;
    senderName: string;
  };
}

// Quick emoji reactions (like WhatsApp)
const QUICK_REACTIONS = ["❤️", "😂", "😮", "😢", "🙏", "👍"];

interface ChatScreenProps {
  friend: Friend;
  onBack: () => void;
}

export default function ChatScreen({ friend, onBack }: ChatScreenProps) {
  // ============================================================================
  // 🔒 PLACEHOLDER: Authentication Context
  // ============================================================================
  // TODO: Replace with Supabase Auth
  // Currently using placeholder AuthContext with username-based authentication
  // When Supabase Auth is implemented:
  // 1. Use authenticated user ID instead of username
  // 2. Secure all API calls with RLS policies
  // 3. Fetch friend's profile data from profiles table
  // ============================================================================
  const { user } = useAuth();
  const realtime = useRealtime();

  // ============================================================================
  // ✅ FUNCTIONAL: Unread message tracking
  // Mark messages as read when user opens this chat
  // ============================================================================
  const { markAsRead } = useUnreadMessages();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showReactions, setShowReactions] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [longPressedMessage, setLongPressedMessage] = useState<string | null>(
    null
  );
  const scrollViewRef = useRef<ScrollView>(null);

  // ✅ FUNCTIONAL: Real-time messaging room ID
  // Create a unique room ID for direct messages between two users
  const roomId = [user?.name, friend.name].sort().join("_");

  // ============================================================================
  // ✅ FUNCTIONAL: Mark conversation as read when user opens chat
  // This clears the unread badge for this conversation
  // ============================================================================
  useEffect(() => {
    markAsRead(roomId);
  }, [roomId]);

  // ✅ FUNCTIONAL: Load messages from Supabase on mount
  useEffect(() => {
    loadMessages();
  }, [friend.name]);

  // ✅ FUNCTIONAL: Setup Supabase Realtime listeners for real-time messages
  useEffect(() => {
    if (!realtime.isConnected || !user) return;

    // Join the direct message room
    realtime.joinChannel(roomId);

    // Listen for new messages (add to existing global listener)
    const handleChatMessage = (message: any) => {
      // Construct roomId from message
      const messageRoomId = message.channel_id
        ? null
        : [message.sender_name, message.receiver_name].sort().join("_");

      // Only add messages for this conversation
      if (messageRoomId === roomId) {
        const newMessage: Message = {
          id: message.id,
          text: message.text,
          sender: message.sender_name === user.name ? "me" : "them",
          senderName: message.sender_name,
          timestamp: new Date(message.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };

        setMessages((prev) => [...prev, newMessage]);

        // ============================================================================
        // ✅ FUNCTIONAL: Mark messages as read when chat is open
        // Since the user is viewing this chat, clear the unread badge immediately
        // ============================================================================
        markAsRead(roomId);

        // Scroll to bottom when new message arrives
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    };

    realtime.onNewMessage(handleChatMessage);

    // Cleanup on unmount - only leave the room, keep global listener
    return () => {
      realtime.leaveChannel(roomId);
    };
  }, [realtime.isConnected, user, friend.name, roomId]);

  async function loadMessages() {
    if (!user) return;

    setLoading(true);
    try {
      const messagesData = await getDirectMessages(user.name, friend.name);

      // Transform Supabase messages to display format
      const displayMessages: Message[] = messagesData.map((msg) => ({
        id: msg.id,
        text: msg.text,
        sender: msg.sender_name === user.name ? "me" : "them",
        senderName: msg.sender_name,
        timestamp: new Date(msg.created_at).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      }));

      setMessages(displayMessages);
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setLoading(false);
    }
  }

  // ✅ FUNCTIONAL: Profile viewing modal/page
  // Shows friend's profile information (read-only)
  if (showProfile) {
    return <ProfilePage friend={friend} onBack={() => setShowProfile(false)} />;
  }

  const handleSend = async () => {
    if (inputText.trim() && !sending && user) {
      setSending(true);
      try {
        // Save message to Supabase
        const savedMessage = await sendMessageToFriend(
          user.name,
          friend.name,
          inputText.trim()
        );

        if (savedMessage) {
          // Message is automatically broadcast via Supabase Realtime
          // No need to manually emit - the INSERT trigger handles it
          realtime.sendMessage(roomId, {
            id: savedMessage.id,
            text: savedMessage.text,
            sender_name: savedMessage.sender_name,
            created_at: savedMessage.created_at,
            roomId: roomId,
          });

          // Add message to local state (will also be received via Supabase Realtime)
          const newMessage: Message = {
            id: savedMessage.id,
            text: savedMessage.text,
            sender: "me",
            senderName: savedMessage.sender_name,
            timestamp: new Date(savedMessage.created_at).toLocaleTimeString(
              [],
              {
                hour: "2-digit",
                minute: "2-digit",
              }
            ),
            reactions: [],
            replyTo: replyingTo
              ? {
                  id: replyingTo.id,
                  text: replyingTo.text,
                  senderName: replyingTo.senderName,
                }
              : undefined,
          };
          setMessages([...messages, newMessage]);
          setInputText("");
          setReplyingTo(null);

          // Scroll to bottom
          setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }, 100);
        } else {
          console.error("Failed to send message");
        }
      } catch (error) {
        console.error("Error sending message:", error);
      } finally {
        setSending(false);
      }
    }
  };

  const handleReaction = (messageId: string, emoji: string) => {
    setMessages((prevMessages) =>
      prevMessages.map((msg) => {
        if (msg.id === messageId) {
          const reactions = msg.reactions || [];
          const existingReaction = reactions.find((r) => r.emoji === emoji);

          if (existingReaction) {
            // Toggle user's reaction
            if (existingReaction.userReacted) {
              // Remove reaction
              return {
                ...msg,
                reactions: reactions
                  .map((r) =>
                    r.emoji === emoji
                      ? { ...r, count: r.count - 1, userReacted: false }
                      : r
                  )
                  .filter((r) => r.count > 0),
              };
            } else {
              // Add user's reaction
              return {
                ...msg,
                reactions: reactions.map((r) =>
                  r.emoji === emoji
                    ? { ...r, count: r.count + 1, userReacted: true }
                    : r
                ),
              };
            }
          } else {
            // Add new reaction
            return {
              ...msg,
              reactions: [...reactions, { emoji, count: 1, userReacted: true }],
            };
          }
        }
        return msg;
      })
    );
    setShowReactions(null);
  };

  const handleReply = (message: Message) => {
    setReplyingTo(message);
    setLongPressedMessage(null);
  };

  const handleLongPress = (messageId: string) => {
    setLongPressedMessage(messageId);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        {/* ✅ FUNCTIONAL: Back navigation to friend list */}
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <BackIcon />
        </TouchableOpacity>

        {/* ✅ FUNCTIONAL: Clickable profile avatar - opens friend's profile */}
        {/* Click here to view friend's profile information (read-only) */}
        <TouchableOpacity
          style={styles.headerInfo}
          onPress={() => setShowProfile(true)}
        >
          {/* 🔒 PLACEHOLDER: Profile image - currently using colored avatar with initial */}
          {/* TODO: Replace with actual profile image from Supabase Storage */}
          <View
            style={[styles.headerAvatar, { backgroundColor: friend.avatar }]}
          >
            <Text style={styles.headerAvatarText}>{friend.name.charAt(0)}</Text>
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerName}>{friend.name}</Text>
            {/* ✅ FUNCTIONAL: Online status indicator (placeholder data) */}
            {friend.online && (
              <View style={styles.onlineStatus}>
                <OnlineIndicator />
                <Text style={styles.onlineText}>Online</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() =>
          scrollViewRef.current?.scrollToEnd({ animated: false })
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#DC2626" />
            <Text style={styles.loadingText}>Loading messages...</Text>
          </View>
        ) : messages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No messages yet</Text>
            <Text style={styles.emptySubtext}>
              Start the conversation with {friend.name}!
            </Text>
          </View>
        ) : (
          messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageWrapper,
                message.sender === "me"
                  ? styles.myMessageWrapper
                  : styles.theirMessageWrapper,
              ]}
            >
              {/* Avatar for friend's messages */}
              {message.sender === "them" && (
                <View
                  style={[
                    styles.messageAvatar,
                    { backgroundColor: friend.avatar },
                  ]}
                >
                  <Text style={styles.messageAvatarText}>
                    {friend.name.charAt(0)}
                  </Text>
                </View>
              )}

              <View style={styles.messageBubbleContainer}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onLongPress={() => handleLongPress(message.id)}
                  style={[
                    styles.messageBubble,
                    message.sender === "me"
                      ? styles.myMessage
                      : styles.theirMessage,
                  ]}
                >
                  {/* Reply reference */}
                  {message.replyTo && (
                    <View style={styles.replyReference}>
                      <View style={styles.replyBar} />
                      <View style={styles.replyContent}>
                        <Text style={styles.replyName}>
                          {message.replyTo.senderName}
                        </Text>
                        <Text style={styles.replyText} numberOfLines={1}>
                          {message.replyTo.text}
                        </Text>
                      </View>
                    </View>
                  )}

                  <Text style={styles.messageText}>{message.text}</Text>
                  <Text
                    style={[
                      styles.timestamp,
                      message.sender === "me"
                        ? styles.myTimestamp
                        : styles.theirTimestamp,
                    ]}
                  >
                    {message.timestamp}
                  </Text>
                </TouchableOpacity>

                {/* Reactions */}
                {message.reactions && message.reactions.length > 0 && (
                  <View
                    style={[
                      styles.reactionsContainer,
                      message.sender === "me"
                        ? styles.myReactions
                        : styles.theirReactions,
                    ]}
                  >
                    {message.reactions.map((reaction, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={[
                          styles.reactionBadge,
                          reaction.userReacted && styles.reactionBadgeActive,
                        ]}
                        onPress={() =>
                          handleReaction(message.id, reaction.emoji)
                        }
                      >
                        <Text style={styles.reactionEmoji}>
                          {reaction.emoji}
                        </Text>
                        {reaction.count > 1 && (
                          <Text style={styles.reactionCount}>
                            {reaction.count}
                          </Text>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Action buttons on long press */}
                {longPressedMessage === message.id && (
                  <View style={styles.messageActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => {
                        setShowReactions(message.id);
                        setLongPressedMessage(null);
                      }}
                    >
                      <ReactionIcon />
                      <Text style={styles.actionButtonText}>React</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleReply(message)}
                    >
                      <ReplyIcon />
                      <Text style={styles.actionButtonText}>Reply</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* Avatar for user's messages */}
              {message.sender === "me" && (
                <View style={[styles.messageAvatar, styles.myAvatar]}>
                  <Text style={styles.messageAvatarText}>
                    {user?.name.charAt(0) || "U"}
                  </Text>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* Reaction picker modal */}
      {showReactions && (
        <Modal transparent visible={true} animationType="fade">
          <TouchableOpacity
            style={styles.reactionModalOverlay}
            activeOpacity={1}
            onPress={() => setShowReactions(null)}
          >
            <View style={styles.reactionPicker}>
              {QUICK_REACTIONS.map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  style={styles.reactionOption}
                  onPress={() => handleReaction(showReactions, emoji)}
                >
                  <Text style={styles.reactionOptionEmoji}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>
      )}

      {/* Reply preview */}
      {replyingTo && (
        <View style={styles.replyPreview}>
          <View style={styles.replyPreviewContent}>
            <View style={styles.replyPreviewBar} />
            <View style={styles.replyPreviewText}>
              <Text style={styles.replyPreviewName}>
                {replyingTo.senderName}
              </Text>
              <Text style={styles.replyPreviewMessage} numberOfLines={1}>
                {replyingTo.text}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.replyPreviewClose}
            onPress={() => setReplyingTo(null)}
          >
            <CloseIcon />
          </TouchableOpacity>
        </View>
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
          maxLength={1000}
          textAlignVertical="center"
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
    color: "#00ff00",
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  messageWrapper: {
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    paddingHorizontal: 4,
  },
  myMessageWrapper: {
    alignSelf: "flex-end",
    justifyContent: "flex-end",
  },
  theirMessageWrapper: {
    alignSelf: "flex-start",
    justifyContent: "flex-start",
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  myAvatar: {
    backgroundColor: "#DC2626",
  },
  messageAvatarText: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
  },
  messageBubbleContainer: {
    maxWidth: "75%",
    minWidth: 100,
  },
  messageBubble: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 20,
    borderRadius: 12,
    position: "relative",
    minHeight: 40,
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
    lineHeight: 21,
    marginBottom: 4,
    paddingRight: 8,
  },
  timestamp: {
    fontSize: 10,
    position: "absolute",
    bottom: 3,
    right: 8,
  },
  myTimestamp: {
    color: "rgba(255, 255, 255, 0.8)",
  },
  theirTimestamp: {
    color: "#999",
  },
  replyReference: {
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderRadius: 6,
    padding: 8,
    marginBottom: 6,
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
  },
  replyBar: {
    width: 3,
    backgroundColor: "#DC2626",
    borderRadius: 2,
    alignSelf: "stretch",
  },
  replyContent: {
    flex: 1,
  },
  replyName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#DC2626",
    marginBottom: 3,
  },
  replyText: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.7)",
    lineHeight: 18,
  },
  reactionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginTop: 4,
  },
  myReactions: {
    justifyContent: "flex-end",
  },
  theirReactions: {
    justifyContent: "flex-start",
  },
  reactionBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  reactionBadgeActive: {
    backgroundColor: "rgba(220, 38, 38, 0.2)",
    borderColor: "#DC2626",
  },
  reactionEmoji: {
    fontSize: 14,
  },
  reactionCount: {
    fontSize: 11,
    color: "white",
    fontWeight: "600",
  },
  messageActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
    backgroundColor: "#2a2a2a",
    padding: 8,
    borderRadius: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "#1e1e1e",
    borderRadius: 6,
  },
  actionButtonText: {
    fontSize: 13,
    color: "#999",
    fontWeight: "500",
  },
  reactionModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  reactionPicker: {
    backgroundColor: "#1e1e1e",
    borderRadius: 24,
    padding: 12,
    flexDirection: "row",
    gap: 8,
  },
  reactionOption: {
    padding: 8,
  },
  reactionOptionEmoji: {
    fontSize: 28,
  },
  replyPreview: {
    backgroundColor: "#1e1e1e",
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#2a2a2a",
  },
  replyPreviewContent: {
    flex: 1,
    flexDirection: "row",
    gap: 8,
  },
  replyPreviewBar: {
    width: 3,
    backgroundColor: "#DC2626",
    borderRadius: 2,
  },
  replyPreviewText: {
    flex: 1,
  },
  replyPreviewName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#DC2626",
    marginBottom: 2,
  },
  replyPreviewMessage: {
    fontSize: 13,
    color: "#999",
  },
  replyPreviewClose: {
    padding: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#121212",
    borderTopWidth: 1,
    borderTopColor: "#2a2a2a",
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: "#1e1e1e",
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 10,
    paddingTop: 10,
    color: "white",
    fontSize: 16,
    lineHeight: 22,
    maxHeight: 120,
    minHeight: 44,
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
