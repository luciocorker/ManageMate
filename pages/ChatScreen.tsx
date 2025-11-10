import ProfilePage from "@/pages/ProfilePage";
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

interface Friend {
  id: number;
  name: string;
  message: string;
  avatar: string;
  online: boolean;
}

interface Message {
  id: number;
  text: string;
  sender: "me" | "them";
  timestamp: string;
}

interface ChatScreenProps {
  friend: Friend;
  onBack: () => void;
}

// Dummy messages
const DUMMY_MESSAGES: Message[] = [
  {
    id: 1,
    text: "Hey! How are you doing?",
    sender: "them",
    timestamp: "10:30 AM",
  },
  {
    id: 2,
    text: "I'm doing great! Just working on the project.",
    sender: "me",
    timestamp: "10:32 AM",
  },
  {
    id: 3,
    text: "That's awesome! Need any help?",
    sender: "them",
    timestamp: "10:33 AM",
  },
  {
    id: 4,
    text: "Actually yes, could you review my latest changes?",
    sender: "me",
    timestamp: "10:35 AM",
  },
  {
    id: 5,
    text: "Of course! Send them over.",
    sender: "them",
    timestamp: "10:36 AM",
  },
];

export default function ChatScreen({ friend, onBack }: ChatScreenProps) {
  const [messages, setMessages] = useState<Message[]>(DUMMY_MESSAGES);
  const [inputText, setInputText] = useState("");
  const [showProfile, setShowProfile] = useState(false);

  // If profile is open, show ProfilePage
  if (showProfile) {
    return <ProfilePage friend={friend} onBack={() => setShowProfile(false)} />;
  }

  const handleSend = () => {
    if (inputText.trim()) {
      const newMessage: Message = {
        id: messages.length + 1,
        text: inputText,
        sender: "me",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages([...messages, newMessage]);
      setInputText("");
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
        <TouchableOpacity
          style={styles.headerInfo}
          onPress={() => setShowProfile(true)}
        >
          <View
            style={[styles.headerAvatar, { backgroundColor: friend.avatar }]}
          >
            <Text style={styles.headerAvatarText}>{friend.name.charAt(0)}</Text>
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerName}>{friend.name}</Text>
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
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageWrapper,
              message.sender === "me"
                ? styles.myMessageWrapper
                : styles.theirMessageWrapper,
            ]}
          >
            <View
              style={[
                styles.messageBubble,
                message.sender === "me"
                  ? styles.myMessage
                  : styles.theirMessage,
              ]}
            >
              <Text style={styles.messageText}>{message.text}</Text>
            </View>
            <Text style={styles.timestamp}>{message.timestamp}</Text>
          </View>
        ))}
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
