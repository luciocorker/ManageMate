import { supabase } from "@/lib/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "./AuthContext";

// ============================================================================
// REALTIME CONTEXT - Supabase Realtime Messaging
// ============================================================================
// This context manages real-time messaging using Supabase Realtime.
// Replaces Socket.IO with native Supabase subscriptions.
//
// Features:
// - Real-time message updates via PostgreSQL LISTEN/NOTIFY
// - Channel/room management
// - Automatic reconnection
// - No separate socket server needed
// ============================================================================

interface RealtimeContextType {
  isConnected: boolean;
  joinChannel: (channelId: string) => void;
  leaveChannel: (channelId: string) => void;
  sendMessage: (channelId: string, message: any) => void;
  onNewMessage: (callback: (message: any) => void) => void;
  offNewMessage: () => void;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(
  undefined
);

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [messageChannel, setMessageChannel] = useState<RealtimeChannel | null>(
    null
  );

  // Use ref to store callbacks so we don't recreate the channel subscription
  const messageCallbacksRef = React.useRef<((message: any) => void)[]>([]);

  useEffect(() => {
    // For now, always connect to Supabase Realtime (even without auth)
    // When Supabase Auth is implemented, add: if (!user) return;

    console.log("🔌 Connecting to Supabase Realtime...");

    // Create a channel for real-time message updates
    const channel = supabase
      .channel("messages-channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          console.log("📨 New message received:", payload.new);

          // Notify all registered callbacks using ref (always gets current callbacks)
          messageCallbacksRef.current.forEach((callback) =>
            callback(payload.new)
          );
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log("✅ Realtime subscribed successfully");
          setIsConnected(true);
        } else if (status === "CLOSED") {
          console.log("🔴 Realtime connection closed");
          setIsConnected(false);
        } else if (status === "CHANNEL_ERROR") {
          console.error("❌ Realtime channel error");
          setIsConnected(false);
        }
      });

    setMessageChannel(channel);

    // Cleanup on unmount
    return () => {
      console.log("🔌 Unsubscribing from realtime");
      channel.unsubscribe();
      setIsConnected(false);
    };
  }, []); // Remove user dependency for now

  const joinChannel = (channelId: string) => {
    // With Supabase Realtime, we don't need to explicitly join channels
    // All messages are received via the global subscription
    // Filtering happens in the callback
    console.log("Joined channel:", channelId);
  };

  const leaveChannel = (channelId: string) => {
    // With Supabase Realtime, we don't need to explicitly leave channels
    console.log("Left channel:", channelId);
  };

  const sendMessage = (channelId: string, message: any) => {
    // Messages are sent via the Supabase client in the message functions
    // This is just for API compatibility with the old Socket.IO interface
    console.log("Message sent to channel:", channelId);
  };

  const onNewMessage = (callback: (message: any) => void) => {
    // Add callback to the list of message listeners (using ref)
    messageCallbacksRef.current = [...messageCallbacksRef.current, callback];
  };

  const offNewMessage = () => {
    // Clear all message callbacks
    // Note: In practice, we keep the global listener active
    // Individual components will filter by their channelId/roomId
    messageCallbacksRef.current = [];
  };

  const value: RealtimeContextType = {
    isConnected,
    joinChannel,
    leaveChannel,
    sendMessage,
    onNewMessage,
    offNewMessage,
  };

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  const context = useContext(RealtimeContext);
  if (context === undefined) {
    throw new Error("useRealtime must be used within a RealtimeProvider");
  }
  return context;
}
