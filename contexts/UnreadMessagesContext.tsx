import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import { useRealtime } from "./RealtimeContext";

// ============================================================================
// UNREAD MESSAGES CONTEXT - Notification & Badge System
// ============================================================================
// This context manages unread message counts and notifications across the app.
// It tracks:
// - Unread message counts per friend/channel
// - Last read timestamps for each conversation
// - Popup notifications when user is not on messenger page
//
// 🔒 PLACEHOLDER: Currently uses AsyncStorage for persistence
// TODO: Integrate with Supabase for real-time updates:
// 1. Store last_read_at in messages table
// 2. Use Supabase real-time subscriptions for instant updates
// 3. Query unread counts: SELECT COUNT(*) WHERE created_at > last_read_at
// ============================================================================

interface UnreadCount {
  count: number;
  lastMessageTime?: string;
  lastMessageText?: string;
  senderName?: string;
}

interface UnreadMessagesContextType {
  // Unread counts per conversation (by room/channel ID)
  unreadCounts: Record<string, UnreadCount>;

  // Get unread count for a specific conversation
  getUnreadCount: (conversationId: string) => number;

  // Increment unread count (called when new message arrives)
  incrementUnread: (
    conversationId: string,
    messageText: string,
    senderName: string
  ) => void;

  // Mark conversation as read (called when user opens chat)
  markAsRead: (conversationId: string) => void;

  // Total unread messages across all conversations
  totalUnread: number;

  // Show popup notification
  showNotification: (
    conversationId: string,
    messageText: string,
    senderName: string
  ) => void;

  // Current notification to display
  currentNotification: {
    conversationId: string;
    messageText: string;
    senderName: string;
  } | null;

  // Dismiss current notification
  dismissNotification: () => void;

  // Track if user is on messenger page
  isOnMessengerPage: boolean;
  setIsOnMessengerPage: (isOn: boolean) => void;
}

const UnreadMessagesContext = createContext<
  UnreadMessagesContextType | undefined
>(undefined);

const UNREAD_STORAGE_KEY = "@managemate_unread_counts";

export function UnreadMessagesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const realtime = useRealtime();
  const [unreadCounts, setUnreadCounts] = useState<Record<string, UnreadCount>>(
    {}
  );
  const [currentNotification, setCurrentNotification] = useState<{
    conversationId: string;
    messageText: string;
    senderName: string;
  } | null>(null);
  const [isOnMessengerPage, setIsOnMessengerPage] = useState(false);

  // ============================================================================
  // ✅ FUNCTIONAL: Load unread counts from AsyncStorage on mount
  // ============================================================================
  useEffect(() => {
    if (user) {
      loadUnreadCounts();
    }
  }, [user]);

  // ============================================================================
  // ✅ FUNCTIONAL: Save unread counts to AsyncStorage whenever they change
  // ============================================================================
  useEffect(() => {
    if (user && Object.keys(unreadCounts).length > 0) {
      saveUnreadCounts();
    }
  }, [unreadCounts, user]);

  // ============================================================================
  // ✅ FUNCTIONAL: Listen for incoming messages via Supabase Realtime
  // This is the global listener that increments unread counts when messages arrive
  // NOTE: We don't remove this listener to avoid conflicts with chat screens
  // ============================================================================
  useEffect(() => {
    if (!realtime.isConnected || !user) return;

    const handleNewMessage = (message: any) => {
      // Don't increment for messages sent by current user
      if (message.sender_name === user.name) return;

      // Determine conversation ID based on message type
      let conversationId: string;

      if (message.channel_id) {
        // Channel message
        conversationId = message.channel_id;
      } else {
        // Direct message - construct room ID from sender and receiver
        conversationId = [user.name, message.sender_name].sort().join("_");
      }

      // Increment unread count (this will also show notification if not on messenger page)
      incrementUnread(conversationId, message.text, message.sender_name);
    };

    // Listen for all incoming messages
    realtime.onNewMessage(handleNewMessage);

    // NOTE: We don't cleanup this global listener to avoid conflicts
    // The listener will be replaced when realtime reconnects
  }, [realtime.isConnected, user]);

  async function loadUnreadCounts() {
    try {
      const key = `${UNREAD_STORAGE_KEY}_${user?.name}`;
      const data = await AsyncStorage.getItem(key);
      if (data) {
        setUnreadCounts(JSON.parse(data));
      }
    } catch (error) {
      console.error("Error loading unread counts:", error);
    }
  }

  async function saveUnreadCounts() {
    try {
      const key = `${UNREAD_STORAGE_KEY}_${user?.name}`;
      await AsyncStorage.setItem(key, JSON.stringify(unreadCounts));
    } catch (error) {
      console.error("Error saving unread counts:", error);
    }
  }

  // ============================================================================
  // ✅ FUNCTIONAL: Get unread count for a specific conversation
  // ============================================================================
  function getUnreadCount(conversationId: string): number {
    return unreadCounts[conversationId]?.count || 0;
  }

  // ============================================================================
  // ✅ FUNCTIONAL: Increment unread count when new message arrives
  // This is called by Socket.IO listeners when a message is received
  // ============================================================================
  function incrementUnread(
    conversationId: string,
    messageText: string,
    senderName: string
  ) {
    setUnreadCounts((prev) => ({
      ...prev,
      [conversationId]: {
        count: (prev[conversationId]?.count || 0) + 1,
        lastMessageTime: new Date().toISOString(),
        lastMessageText: messageText,
        senderName: senderName,
      },
    }));

    // 🔔 FUNCTIONAL: Show popup notification if user is not on messenger page
    if (!isOnMessengerPage) {
      showNotification(conversationId, messageText, senderName);
    }
  }

  // ============================================================================
  // ✅ FUNCTIONAL: Mark conversation as read
  // Called when user opens a chat/channel
  // ============================================================================
  function markAsRead(conversationId: string) {
    setUnreadCounts((prev) => {
      const newCounts = { ...prev };
      delete newCounts[conversationId];
      return newCounts;
    });

    // 🔒 PLACEHOLDER: Store last_read_at timestamp
    // TODO: When Supabase Auth is implemented:
    // await supabase
    //   .from('conversation_reads')
    //   .upsert({
    //     user_id: user.id,
    //     conversation_id: conversationId,
    //     last_read_at: new Date().toISOString()
    //   });
  }

  // ============================================================================
  // ✅ FUNCTIONAL: Show popup notification
  // ============================================================================
  function showNotification(
    conversationId: string,
    messageText: string,
    senderName: string
  ) {
    setCurrentNotification({
      conversationId,
      messageText,
      senderName,
    });

    // Auto-dismiss notification after 5 seconds
    setTimeout(() => {
      setCurrentNotification(null);
    }, 5000);
  }

  // ============================================================================
  // ✅ FUNCTIONAL: Dismiss current notification
  // ============================================================================
  function dismissNotification() {
    setCurrentNotification(null);
  }

  // ============================================================================
  // ✅ FUNCTIONAL: Calculate total unread messages
  // ============================================================================
  const totalUnread = Object.values(unreadCounts).reduce(
    (sum, item) => sum + item.count,
    0
  );

  const value: UnreadMessagesContextType = {
    unreadCounts,
    getUnreadCount,
    incrementUnread,
    markAsRead,
    totalUnread,
    showNotification,
    currentNotification,
    dismissNotification,
    isOnMessengerPage,
    setIsOnMessengerPage,
  };

  return (
    <UnreadMessagesContext.Provider value={value}>
      {children}
    </UnreadMessagesContext.Provider>
  );
}

export function useUnreadMessages() {
  const context = useContext(UnreadMessagesContext);
  if (context === undefined) {
    throw new Error(
      "useUnreadMessages must be used within an UnreadMessagesProvider"
    );
  }
  return context;
}
