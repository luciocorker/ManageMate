/**
 * Example: How to integrate Supabase with MessagingPage.tsx
 *
 * This file demonstrates how to replace dummy data with real Supabase data.
 * Copy and adapt these patterns to your actual components.
 */

import {
  createChannel,
  getChannelMessages,
  getChannels,
  getDirectMessages,
  getFriends,
  sendMessageToChannel,
  sendMessageToFriend,
} from "@/supabase/supabaseClient";
import type { Channel, Friend, Message } from "@/supabase/types";
import { useEffect, useState } from "react";

// ==========================================
// EXAMPLE 1: Load Channels on Component Mount
// ==========================================

function MessagingPageExample() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  const CURRENT_USER = "Lee"; // Replace with actual authenticated user later

  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    setLoading(true);
    try {
      // Load channels and friends in parallel
      const [channelsData, friendsData] = await Promise.all([
        getChannels(),
        getFriends(CURRENT_USER),
      ]);

      setChannels(channelsData);
      setFriends(friendsData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }

  // Return your JSX...
}

// ==========================================
// EXAMPLE 2: Create a New Channel
// ==========================================

async function handleCreateChannelExample(
  name: string,
  selectedFriendNames: string[],
  setChannels: React.Dispatch<React.SetStateAction<Channel[]>>
) {
  try {
    // Create the channel in Supabase
    const newChannel = await createChannel(
      name,
      `Channel with: ${selectedFriendNames.join(", ")}`
    );

    if (newChannel) {
      console.log("Channel created:", newChannel);

      // Refresh channels list
      const updatedChannels = await getChannels();
      setChannels(updatedChannels);

      return newChannel;
    }
  } catch (error) {
    console.error("Error creating channel:", error);
  }
}

// ==========================================
// EXAMPLE 3: Load Channel Messages
// ==========================================

function ChannelChatExample({ channelId }: { channelId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const CURRENT_USER = "Lee";

  useEffect(() => {
    loadMessages();
  }, [channelId]);

  async function loadMessages() {
    const channelMessages = await getChannelMessages(channelId);
    setMessages(channelMessages);
  }

  async function handleSendMessage(text: string) {
    const newMessage = await sendMessageToChannel(
      channelId,
      CURRENT_USER,
      text
    );

    if (newMessage) {
      // Add new message to state
      setMessages((prev) => [...prev, newMessage]);
    }
  }

  // Return your JSX...
}

// ==========================================
// EXAMPLE 4: Load Direct Messages
// ==========================================

function ChatScreenExample({ friendName }: { friendName: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const CURRENT_USER = "Lee";

  useEffect(() => {
    loadDirectMessages();
  }, [friendName]);

  async function loadDirectMessages() {
    const directMessages = await getDirectMessages(CURRENT_USER, friendName);
    setMessages(directMessages);
  }

  async function handleSendMessage(text: string) {
    const newMessage = await sendMessageToFriend(
      CURRENT_USER,
      friendName,
      text
    );

    if (newMessage) {
      // Add new message to state
      setMessages((prev) => [...prev, newMessage]);
    }
  }

  // Return your JSX...
}

// ==========================================
// EXAMPLE 5: Real-time Message Subscription
// ==========================================

import { supabase } from "@/lib/supabase";

function ChatWithRealtime({ channelId }: { channelId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    // Load initial messages
    loadMessages();

    // Set up real-time subscription
    const subscription = supabase
      .channel(`channel-${channelId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `channel_id=eq.${channelId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages((prev) => [...prev, newMessage]);
        }
      )
      .subscribe();

    // Cleanup on unmount
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [channelId]);

  async function loadMessages() {
    const channelMessages = await getChannelMessages(channelId);
    setMessages(channelMessages);
  }

  // Return your JSX...
}

// ==========================================
// EXAMPLE 6: Format Messages for Display
// ==========================================

function formatMessageForDisplay(message: Message) {
  return {
    id: message.id,
    text: message.text,
    sender: message.sender_name,
    timestamp: new Date(message.created_at).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }),
    isCurrentUser: message.sender_name === "Lee", // Replace with actual current user
  };
}

// ==========================================
// EXAMPLE 7: Convert Friend to Display Format
// ==========================================

function formatFriendForDisplay(friend: Friend) {
  return {
    id: friend.id,
    name: friend.friend_name,
    // Add avatar logic, online status, etc.
  };
}

// ==========================================
// EXAMPLE 8: Error Handling Pattern
// ==========================================

async function safelyLoadData<T>(
  loadFunction: () => Promise<T>,
  fallbackValue: T,
  errorMessage: string
): Promise<T> {
  try {
    return await loadFunction();
  } catch (error) {
    console.error(errorMessage, error);
    return fallbackValue;
  }
}

// Usage:
const channels = await safelyLoadData(
  getChannels,
  [],
  "Failed to load channels"
);

export {
  ChannelChatExample,
  ChatScreenExample,
  ChatWithRealtime,
  formatFriendForDisplay,
  formatMessageForDisplay,
  handleCreateChannelExample,
  MessagingPageExample,
  safelyLoadData,
};
