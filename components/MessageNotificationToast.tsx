import { useUnreadMessages } from "@/contexts/UnreadMessagesContext";
import React, { useEffect } from "react";
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Path } from "react-native-svg";

// ============================================================================
// MESSAGE NOTIFICATION TOAST - WhatsApp-style Popup
// ============================================================================
// This component displays a popup notification when a new message arrives
// while the user is not on the messenger page.
//
// Features:
// - Slides down from top with animation
// - Shows sender name and message preview
// - Auto-dismisses after 5 seconds
// - Can be dismissed by tapping
// - Tap to navigate to conversation (future enhancement)
//
// ✅ FUNCTIONAL: Animation, display, auto-dismiss
// 🔒 PLACEHOLDER: Tap to navigate to conversation
// ============================================================================

const MessageIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z"
      fill="white"
      stroke="white"
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

export default function MessageNotificationToast() {
  const { currentNotification, dismissNotification } = useUnreadMessages();
  const slideAnim = React.useRef(new Animated.Value(-100)).current;

  // ============================================================================
  // ✅ FUNCTIONAL: Slide in/out animation when notification appears/disappears
  // ============================================================================
  useEffect(() => {
    if (currentNotification) {
      // Slide in
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    } else {
      // Slide out
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [currentNotification]);

  if (!currentNotification) {
    return null;
  }

  const { senderName, messageText, count = 1 } = currentNotification;

  // Truncate message if too long
  const displayMessage =
    messageText.length > 80
      ? `${messageText.substring(0, 80)}...`
      : messageText;

  // Show count if multiple messages
  const displaySender = count > 1 ? `${senderName} (${count})` : senderName;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {/* ✅ FUNCTIONAL: Tap to dismiss notification */}
      {/* 🔒 PLACEHOLDER: Tap to navigate to conversation */}
      {/* TODO: Add onPress handler to navigate to the conversation */}
      <TouchableOpacity
        style={styles.content}
        onPress={dismissNotification}
        activeOpacity={0.9}
      >
        <View style={styles.iconContainer}>
          <MessageIcon />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.senderName}>{displaySender}</Text>
          <Text style={styles.messageText} numberOfLines={2}>
            {count > 1 ? `${count} new messages` : displayMessage}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.closeButton}
          onPress={(e) => {
            e.stopPropagation();
            dismissNotification();
          }}
        >
          <CloseIcon />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 10,
    left: 10,
    right: 10,
    zIndex: 9999,
    elevation: 10,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DC2626",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  senderName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: 18,
  },
  closeButton: {
    padding: 4,
  },
});
