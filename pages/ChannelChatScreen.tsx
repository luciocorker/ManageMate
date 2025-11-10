import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
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

interface Channel {
  id: number;
  name: string;
  members: number;
  memberNames?: string[];
}

interface Message {
  id: number;
  text: string;
  sender: string;
  timestamp: string;
}

interface ChannelChatScreenProps {
  channel: Channel;
  onBack: () => void;
  onInfoPress: () => void;
}

// Dummy messages for channel
const DUMMY_CHANNEL_MESSAGES: Message[] = [
  {
    id: 1,
    text: "Hey everyone! Welcome to the channel.",
    sender: "Sarah Johnson",
    timestamp: "10:30 AM",
  },
  {
    id: 2,
    text: "Thanks for creating this!",
    sender: "Mike Chen",
    timestamp: "10:32 AM",
  },
  {
    id: 3,
    text: "Great to have everyone here.",
    sender: "You",
    timestamp: "10:33 AM",
  },
  {
    id: 4,
    text: "Let's get started on the project!",
    sender: "Emily Davis",
    timestamp: "10:35 AM",
  },
];

export default function ChannelChatScreen({
  channel,
  onBack,
  onInfoPress,
}: ChannelChatScreenProps) {
  const [messages, setMessages] = useState<Message[]>(DUMMY_CHANNEL_MESSAGES);
  const [inputText, setInputText] = useState("");

  // Swipe gesture animations
  const translateX = useSharedValue(0);

  const handleSwipeBack = () => {
    onBack();
  };

  // Pan gesture for swiping right to go back
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      // Only allow swiping right (positive X)
      if (event.translationX > 0) {
        translateX.value = event.translationX;
      }
    })
    .onEnd((event) => {
      // If swiped more than 100px, go back
      if (event.translationX > 100) {
        translateX.value = withSpring(500, {}, () => {
          runOnJS(handleSwipeBack)();
        });
      } else {
        // Otherwise snap back
        translateX.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const handleSend = () => {
    if (inputText.trim()) {
      const newMessage: Message = {
        id: messages.length + 1,
        text: inputText,
        sender: "You",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages([...messages, newMessage]);
      setInputText("");
    }
  };

  const getAvatarColor = (name: string) => {
    const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7"];
    const index = name.length % colors.length;
    return colors[index];
  };

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.container, animatedStyle]}>
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
            <View style={styles.systemMessage}>
              <Text style={styles.systemMessageText}>
                Channel created with {channel.memberNames?.join(", ")}
              </Text>
            </View>

            {messages.map((message) => {
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
            })}
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
              style={styles.sendButton}
              onPress={handleSend}
              disabled={!inputText.trim()}
            >
              <SendIcon />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Animated.View>
    </GestureDetector>
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
});
