import React from "react";
import { StyleSheet, Text, View } from "react-native";

// ============================================================================
// UNREAD BADGE COMPONENT - WhatsApp-style Notification Badge
// ============================================================================
// This component displays a small circular badge with the number of unread
// messages next to a friend or channel in the list.
//
// Features:
// - Circular badge with red background
// - Shows number of unread messages
// - Hides when count is 0
// - Compact display for numbers > 99 ("99+")
//
// ✅ FUNCTIONAL: All features implemented
// ============================================================================

interface UnreadBadgeProps {
  count: number;
  size?: "small" | "medium" | "large";
}

export default function UnreadBadge({
  count,
  size = "medium",
}: UnreadBadgeProps) {
  // Don't render if no unread messages
  if (count === 0) {
    return null;
  }

  // Format count (show "99+" for counts over 99)
  const displayCount = count > 99 ? "99+" : count.toString();

  // Size configurations
  const sizeStyles = {
    small: {
      container: styles.smallContainer,
      text: styles.smallText,
    },
    medium: {
      container: styles.mediumContainer,
      text: styles.mediumText,
    },
    large: {
      container: styles.largeContainer,
      text: styles.largeText,
    },
  };

  const currentSize = sizeStyles[size];

  return (
    <View style={[styles.badge, currentSize.container]}>
      <Text style={[styles.badgeText, currentSize.text]}>{displayCount}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: "#DC2626",
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 20,
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: "#121212",
  },
  badgeText: {
    color: "white",
    fontWeight: "bold",
  },
  // Small size (14px)
  smallContainer: {
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
  },
  smallText: {
    fontSize: 10,
  },
  // Medium size (20px) - default
  mediumContainer: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
  },
  mediumText: {
    fontSize: 12,
  },
  // Large size (24px)
  largeContainer: {
    minWidth: 24,
    height: 24,
    paddingHorizontal: 8,
  },
  largeText: {
    fontSize: 14,
  },
});
