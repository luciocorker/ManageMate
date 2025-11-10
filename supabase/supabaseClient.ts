import { supabase } from "@/lib/supabase";
import type {
  Channel,
  CreateFriendRequestInput,
  Friend,
  FriendRequest,
  Message,
  MessageReaction,
} from "./types";

// ==========================================
// CHANNEL FUNCTIONS
// ==========================================

/**
 * Create a new channel
 */
export async function createChannel(
  name: string,
  description?: string
): Promise<Channel | null> {
  try {
    const { data, error } = await supabase
      .from("channels")
      .insert({ name, description })
      .select()
      .single();

    if (error) {
      console.error("Error creating channel:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Unexpected error creating channel:", error);
    return null;
  }
}

/**
 * Get all channels
 */
export async function getChannels(): Promise<Channel[]> {
  try {
    const { data, error } = await supabase
      .from("channels")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching channels:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Unexpected error fetching channels:", error);
    return [];
  }
}

// ==========================================
// FRIEND FUNCTIONS
// ==========================================

/**
 * Add a friend
 */
export async function addFriend(
  userName: string,
  friendName: string
): Promise<Friend | null> {
  try {
    const { data, error } = await supabase
      .from("friends")
      .insert({ user_name: userName, friend_name: friendName })
      .select()
      .single();

    if (error) {
      console.error("Error adding friend:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Unexpected error adding friend:", error);
    return null;
  }
}

/**
 * Get all friends for a user
 */
export async function getFriends(userName: string): Promise<Friend[]> {
  try {
    const { data, error } = await supabase
      .from("friends")
      .select("*")
      .eq("user_name", userName)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching friends:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Unexpected error fetching friends:", error);
    return [];
  }
}

// ==========================================
// MESSAGE FUNCTIONS
// ==========================================

/**
 * Send a message to a channel
 */
export async function sendMessageToChannel(
  channelId: string,
  senderName: string,
  text: string
): Promise<Message | null> {
  try {
    const { data, error } = await supabase
      .from("messages")
      .insert({
        channel_id: channelId,
        sender_name: senderName,
        text,
        receiver_name: null,
      })
      .select()
      .single();

    if (error) {
      console.error("Error sending channel message:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Unexpected error sending channel message:", error);
    return null;
  }
}

/**
 * Send a direct message to a friend
 */
export async function sendMessageToFriend(
  senderName: string,
  receiverName: string,
  text: string
): Promise<Message | null> {
  try {
    const { data, error } = await supabase
      .from("messages")
      .insert({
        channel_id: null,
        sender_name: senderName,
        receiver_name: receiverName,
        text,
      })
      .select()
      .single();

    if (error) {
      console.error("Error sending direct message:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Unexpected error sending direct message:", error);
    return null;
  }
}

/**
 * Get all messages for a specific channel
 */
export async function getChannelMessages(
  channelId: string
): Promise<Message[]> {
  try {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("channel_id", channelId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching channel messages:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Unexpected error fetching channel messages:", error);
    return [];
  }
}

/**
 * Get all direct messages between two users
 */
export async function getDirectMessages(
  senderName: string,
  receiverName: string
): Promise<Message[]> {
  try {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .is("channel_id", null)
      .or(
        `and(sender_name.eq.${senderName},receiver_name.eq.${receiverName}),and(sender_name.eq.${receiverName},receiver_name.eq.${senderName})`
      )
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching direct messages:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Unexpected error fetching direct messages:", error);
    return [];
  }
}

// ==========================================
// REAL-TIME SUBSCRIPTIONS (PLACEHOLDER)
// ==========================================

/**
 * Subscribe to new channel messages
 *
 * Example usage:
 *
 * const subscription = supabase
 *   .channel('channel-messages')
 *   .on('postgres_changes', {
 *     event: 'INSERT',
 *     schema: 'public',
 *     table: 'messages',
 *     filter: `channel_id=eq.${channelId}`
 *   }, (payload) => {
 *     console.log('New channel message:', payload.new);
 *     // Update your state with the new message
 *   })
 *   .subscribe();
 *
 * // Don't forget to unsubscribe when component unmounts:
 * // supabase.removeChannel(subscription);
 */

/**
 * Subscribe to new direct messages
 *
 * Example usage:
 *
 * const subscription = supabase
 *   .channel('direct-messages')
 *   .on('postgres_changes', {
 *     event: 'INSERT',
 *     schema: 'public',
 *     table: 'messages',
 *     filter: `receiver_name=eq.${currentUserName}`
 *   }, (payload) => {
 *     console.log('New direct message:', payload.new);
 *     // Update your state with the new message
 *   })
 *   .subscribe();
 *
 * // Don't forget to unsubscribe when component unmounts:
 * // supabase.removeChannel(subscription);
 */

// ==================== Friend Request Functions ====================

/**
 * Send a friend request
 */
export async function sendFriendRequest(
  input: CreateFriendRequestInput
): Promise<FriendRequest | null> {
  try {
    const { data, error } = await supabase
      .from("friend_requests")
      .insert([
        {
          sender_name: input.sender_name,
          sender_email: input.sender_email,
          receiver_name: input.receiver_name,
          receiver_email: input.receiver_email,
          status: "pending",
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error sending friend request:", error);
      return null;
    }

    console.log("Friend request sent successfully:", data);
    return data;
  } catch (error) {
    console.error("Exception in sendFriendRequest:", error);
    return null;
  }
}

/**
 * Get all friend requests for a user (both sent and received)
 */
export async function getFriendRequests(
  userName: string
): Promise<{ sent: FriendRequest[]; received: FriendRequest[] }> {
  try {
    // Get received requests (where user is the receiver)
    const { data: receivedData, error: receivedError } = await supabase
      .from("friend_requests")
      .select("*")
      .eq("receiver_name", userName)
      .order("created_at", { ascending: false });

    if (receivedError) {
      console.error("Error fetching received friend requests:", receivedError);
      return { sent: [], received: [] };
    }

    // Get sent requests (where user is the sender)
    const { data: sentData, error: sentError } = await supabase
      .from("friend_requests")
      .select("*")
      .eq("sender_name", userName)
      .order("created_at", { ascending: false });

    if (sentError) {
      console.error("Error fetching sent friend requests:", sentError);
      return { sent: [], received: receivedData || [] };
    }

    console.log(`Friend requests for ${userName}:`, {
      sent: sentData?.length || 0,
      received: receivedData?.length || 0,
    });

    return {
      sent: sentData || [],
      received: receivedData || [],
    };
  } catch (error) {
    console.error("Exception in getFriendRequests:", error);
    return { sent: [], received: [] };
  }
}

/**
 * Get only pending friend requests for a user
 */
export async function getPendingFriendRequests(
  userName: string
): Promise<FriendRequest[]> {
  try {
    const { data, error } = await supabase
      .from("friend_requests")
      .select("*")
      .eq("receiver_name", userName)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching pending friend requests:", error);
      return [];
    }

    console.log(`Pending friend requests for ${userName}:`, data?.length || 0);
    return data || [];
  } catch (error) {
    console.error("Exception in getPendingFriendRequests:", error);
    return [];
  }
}

/**
 * Accept a friend request
 * Updates the request status to 'accepted' and adds both users to each other's friends list
 */
export async function acceptFriendRequest(
  requestId: string,
  userName: string
): Promise<boolean> {
  try {
    // First, get the friend request details
    const { data: request, error: fetchError } = await supabase
      .from("friend_requests")
      .select("*")
      .eq("id", requestId)
      .single();

    if (fetchError || !request) {
      console.error("Error fetching friend request:", fetchError);
      return false;
    }

    // Verify the user is the receiver
    if (request.receiver_name !== userName) {
      console.error("User is not the receiver of this friend request");
      return false;
    }

    // Update request status to accepted
    const { error: updateError } = await supabase
      .from("friend_requests")
      .update({ status: "accepted" })
      .eq("id", requestId);

    if (updateError) {
      console.error("Error updating friend request:", updateError);
      return false;
    }

    // Add both users to each other's friends list
    const { error: friendError } = await supabase.from("friends").insert([
      {
        user_name: request.receiver_name,
        friend_name: request.sender_name,
      },
      {
        user_name: request.sender_name,
        friend_name: request.receiver_name,
      },
    ]);

    if (friendError) {
      console.error("Error adding friends:", friendError);
      return false;
    }

    console.log("Friend request accepted successfully:", requestId);
    return true;
  } catch (error) {
    console.error("Exception in acceptFriendRequest:", error);
    return false;
  }
}

/**
 * Reject a friend request
 * Updates the request status to 'rejected'
 */
export async function rejectFriendRequest(
  requestId: string,
  userName: string
): Promise<boolean> {
  try {
    // First verify the user is the receiver
    const { data: request, error: fetchError } = await supabase
      .from("friend_requests")
      .select("receiver_name")
      .eq("id", requestId)
      .single();

    if (fetchError || !request) {
      console.error("Error fetching friend request:", fetchError);
      return false;
    }

    if (request.receiver_name !== userName) {
      console.error("User is not the receiver of this friend request");
      return false;
    }

    // Update request status to rejected
    const { error: updateError } = await supabase
      .from("friend_requests")
      .update({ status: "rejected" })
      .eq("id", requestId);

    if (updateError) {
      console.error("Error rejecting friend request:", updateError);
      return false;
    }

    console.log("Friend request rejected successfully:", requestId);
    return true;
  } catch (error) {
    console.error("Exception in rejectFriendRequest:", error);
    return false;
  }
}

// ==================== Message Reaction Functions ====================

/**
 * Add a reaction to a message
 */
export async function addMessageReaction(
  messageId: string,
  userName: string,
  emoji: string
): Promise<MessageReaction | null> {
  try {
    const { data, error } = await supabase
      .from("message_reactions")
      .insert([
        {
          message_id: messageId,
          user_name: userName,
          emoji: emoji,
        },
      ])
      .select()
      .single();

    if (error) {
      // If it's a unique constraint violation, the user already reacted with this emoji
      if (error.code === "23505") {
        console.log("User already reacted with this emoji");
        return null;
      }
      console.error("Error adding reaction:", error);
      return null;
    }

    console.log("Reaction added successfully:", data);
    return data;
  } catch (error) {
    console.error("Exception in addMessageReaction:", error);
    return null;
  }
}

/**
 * Remove a reaction from a message
 */
export async function removeMessageReaction(
  messageId: string,
  userName: string,
  emoji: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("message_reactions")
      .delete()
      .eq("message_id", messageId)
      .eq("user_name", userName)
      .eq("emoji", emoji);

    if (error) {
      console.error("Error removing reaction:", error);
      return false;
    }

    console.log("Reaction removed successfully");
    return true;
  } catch (error) {
    console.error("Exception in removeMessageReaction:", error);
    return false;
  }
}

/**
 * Get all reactions for a message
 */
export async function getMessageReactions(
  messageId: string
): Promise<MessageReaction[]> {
  try {
    const { data, error } = await supabase
      .from("message_reactions")
      .select("*")
      .eq("message_id", messageId);

    if (error) {
      console.error("Error fetching reactions:", error);
      return [];
    }

    console.log(`Reactions for message ${messageId}:`, data?.length || 0);
    return data || [];
  } catch (error) {
    console.error("Exception in getMessageReactions:", error);
    return [];
  }
}

/**
 * Get reactions summary for multiple messages
 * Returns aggregated reaction counts per message
 */
export async function getMessagesReactionsSummary(
  messageIds: string[]
): Promise<Map<string, { emoji: string; count: number; users: string[] }[]>> {
  try {
    const { data, error } = await supabase
      .from("message_reactions")
      .select("*")
      .in("message_id", messageIds);

    if (error) {
      console.error("Error fetching reactions summary:", error);
      return new Map();
    }

    // Group reactions by message_id and emoji
    const summary = new Map<
      string,
      { emoji: string; count: number; users: string[] }[]
    >();

    data?.forEach((reaction) => {
      const messageReactions = summary.get(reaction.message_id) || [];
      const existingReaction = messageReactions.find(
        (r) => r.emoji === reaction.emoji
      );

      if (existingReaction) {
        existingReaction.count++;
        existingReaction.users.push(reaction.user_name);
      } else {
        messageReactions.push({
          emoji: reaction.emoji,
          count: 1,
          users: [reaction.user_name],
        });
      }

      summary.set(reaction.message_id, messageReactions);
    });

    return summary;
  } catch (error) {
    console.error("Exception in getMessagesReactionsSummary:", error);
    return new Map();
  }
}

/**
 * Subscribe to channel updates
 *
 * Example usage:
 *
 * const subscription = supabase
 *   .channel('channels')
 *   .on('postgres_changes', {
 *     event: '*',  // Listen to all events (INSERT, UPDATE, DELETE)
 *     schema: 'public',
 *     table: 'channels'
 *   }, (payload) => {
 *     console.log('Channel change:', payload);
 *     // Update your channels list
 *   })
 *   .subscribe();
 *
 * // Don't forget to unsubscribe when component unmounts:
 * // supabase.removeChannel(subscription);
 */
