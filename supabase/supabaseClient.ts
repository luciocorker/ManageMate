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
    console.log("🔍 getChannels called");
    const { data, error } = await supabase
      .from("channels")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Error fetching channels:", error);
      return [];
    }

    console.log(`  ✅ Retrieved ${data?.length || 0} channels from database`);
    return data || [];
  } catch (error) {
    console.error("❌ Unexpected error fetching channels:", error);
    return [];
  }
}

/**
 * Update a channel's name and/or description
 */
export async function updateChannel(
  channelId: string,
  updates: { name?: string; description?: string }
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("channels")
      .update(updates)
      .eq("id", channelId);

    if (error) {
      console.error("Error updating channel:", error);
      return false;
    }

    console.log(`Channel ${channelId} updated successfully`);
    return true;
  } catch (error) {
    console.error("Unexpected error updating channel:", error);
    return false;
  }
}

/**
 * Delete a channel and all associated data
 * This will cascade delete channel members and messages due to database constraints
 */
export async function deleteChannel(channelId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("channels")
      .delete()
      .eq("id", channelId);

    if (error) {
      console.error("Error deleting channel:", error);
      return false;
    }

    console.log(`Channel ${channelId} deleted successfully`);
    return true;
  } catch (error) {
    console.error("Unexpected error deleting channel:", error);
    return false;
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
 * Get all friends for a user by Firebase UID
 */
export async function getFriends(userId: string): Promise<Friend[]> {
  try {
    const { data, error } = await supabase
      .from("friends")
      .select("*")
      .eq("user_id", userId)
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

/**
 * Get user profile by Firebase UID
 */
export async function getUserProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("firebase_uid", userId)
      .single();

    if (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Unexpected error fetching user profile:", error);
    return null;
  }
}

/**
 * Get multiple user profiles by Firebase UIDs
 */
export async function getUserProfiles(userIds: string[]) {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .in("firebase_uid", userIds);

    if (error) {
      console.error("Error fetching user profiles:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Unexpected error fetching user profiles:", error);
    return [];
  }
}

/**
 * Get friends with their profile information
 */
export async function getFriendsWithProfiles(userId: string) {
  try {
    console.log("🔍 getFriendsWithProfiles called for userId:", userId);
    
    // Get friend relationships
    const friends = await getFriends(userId);
    console.log(`  - Found ${friends.length} friend relationships`);
    
    if (friends.length === 0) {
      console.log("  - No friends found, returning empty array");
      return [];
    }

    // Get all friend profiles
    const friendIds = friends.map(f => f.friend_id);
    console.log(`  - Fetching profiles for friend IDs:`, friendIds);
    
    const profiles = await getUserProfiles(friendIds);
    console.log(`  - Retrieved ${profiles.length} profiles`);

    // Create a map of profiles by firebase_uid
    const profileMap = new Map(profiles.map(p => [p.firebase_uid, p]));

    // Combine friends with their profiles
    const result = friends.map(friend => {
      const profile = profileMap.get(friend.friend_id);
      if (!profile) {
        console.warn(`  ⚠️ No profile found for friend_id: ${friend.friend_id}`);
      }
      return {
        ...friend,
        profile: profile,
      };
    });
    
    console.log(`  ✅ Returning ${result.length} friends with profiles`);
    return result;
  } catch (error) {
    console.error("❌ Error fetching friends with profiles:", error);
    return [];
  }
}

// ==========================================
// MESSAGE FUNCTIONS
// ==========================================

/**
 * Send a message to a channel by Firebase UID
 */
export async function sendMessageToChannel(
  channelId: string,
  senderId: string,
  content: string
): Promise<Message | null> {
  try {
    const { data, error } = await supabase
      .from("messages")
      .insert({
        channel_id: channelId,
        sender_id: senderId,
        content: content,
        receiver_id: null,
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
 * Send a direct message to a friend by Firebase UIDs
 */
export async function sendMessageToFriend(
  senderId: string,
  receiverId: string,
  content: string
): Promise<Message | null> {
  try {
    const { data, error } = await supabase
      .from("messages")
      .insert({
        channel_id: null,
        sender_id: senderId,
        receiver_id: receiverId,
        content: content,
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
 * Get all direct messages between two users by Firebase UIDs
 */
export async function getDirectMessages(
  userId1: string,
  userId2: string
): Promise<Message[]> {
  try {
    console.log(`🔍 getDirectMessages called for users: ${userId1} <-> ${userId2}`);
    
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .is("channel_id", null)
      .or(
        `and(sender_id.eq.${userId1},receiver_id.eq.${userId2}),and(sender_id.eq.${userId2},receiver_id.eq.${userId1})`
      )
      .order("created_at", { ascending: true });

    if (error) {
      console.error("❌ Error fetching direct messages:", error);
      return [];
    }

    console.log(`  ✅ Retrieved ${data?.length || 0} messages`);
    return data || [];
  } catch (error) {
    console.error("❌ Unexpected error fetching direct messages:", error);
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
 * Looks up the receiver by email and creates a friend request
 */
export async function sendFriendRequest(
  input: CreateFriendRequestInput
): Promise<FriendRequest | null> {
  try {
    // First, look up the receiver by email
    const { data: receiverData, error: receiverError } = await supabase
      .from("users")
      .select("firebase_uid")
      .eq("email", input.receiver_email.toLowerCase())
      .single();

    if (receiverError || !receiverData) {
      console.error("Receiver not found:", receiverError);
      // Return a special error to indicate user not found
      return null;
    }

    // Check if a friend request already exists
    const { data: existingRequest, error: checkError } = await supabase
      .from("friend_requests")
      .select("*")
      .eq("sender_id", input.sender_id)
      .eq("receiver_id", receiverData.firebase_uid)
      .single();

    if (existingRequest) {
      console.log("Friend request already exists");
      return existingRequest;
    }

    // Create the friend request
    const { data, error } = await supabase
      .from("friend_requests")
      .insert([
        {
          sender_id: input.sender_id,
          receiver_id: receiverData.firebase_uid,
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
 * Get only pending friend requests for a user by Firebase UID
 */
export async function getPendingFriendRequests(
  userId: string
): Promise<FriendRequest[]> {
  try {
    const { data, error } = await supabase
      .from("friend_requests")
      .select("*")
      .eq("receiver_id", userId)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching pending friend requests:", error);
      return [];
    }

    console.log(`Pending friend requests for user:`, data?.length || 0);
    return data || [];
  } catch (error) {
    console.error("Exception in getPendingFriendRequests:", error);
    return [];
  }
}

/**
 * Get a friend request by ID with sender information
 */
export async function getFriendRequestById(requestId: string) {
  try {
    const { data, error } = await supabase
      .from("friend_requests")
      .select("*")
      .eq("id", requestId)
      .single();

    if (error) {
      console.error("Error fetching friend request:", error);
      return null;
    }

    // Get sender info
    const senderProfile = await getUserProfile(data.sender_id);

    return {
      ...data,
      senderProfile,
    };
  } catch (error) {
    console.error("Exception in getFriendRequestById:", error);
    return null;
  }
}

/**
 * Accept a friend request
 * Updates the request status to 'accepted' and adds both users to each other's friends list
 */
export async function acceptFriendRequest(
  requestId: string,
  userId: string
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
    if (request.receiver_id !== userId) {
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
        user_id: request.receiver_id,
        friend_id: request.sender_id,
      },
      {
        user_id: request.sender_id,
        friend_id: request.receiver_id,
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
  userId: string
): Promise<boolean> {
  try {
    // First verify the user is the receiver
    const { data: request, error: fetchError } = await supabase
      .from("friend_requests")
      .select("receiver_id")
      .eq("id", requestId)
      .single();

    if (fetchError || !request) {
      console.error("Error fetching friend request:", fetchError);
      return false;
    }

    if (request.receiver_id !== userId) {
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

// ==================== Channel Member Functions ====================

/**
 * Add a member to a channel by Firebase UID
 */
export async function addChannelMember(
  channelId: string,
  userId: string
): Promise<boolean> {
  try {
    const { error } = await supabase.from("channel_members").insert([
      {
        channel_id: channelId,
        user_id: userId,
      },
    ]);

    if (error) {
      // If it's a unique constraint violation, the member is already in the channel
      if (error.code === "23505") {
        console.log("Member already in channel");
        return true; // Not an error, just already exists
      }
      console.error("Error adding channel member:", error);
      return false;
    }

    console.log(`Member ${userId} added to channel ${channelId}`);
    return true;
  } catch (error) {
    console.error("Exception in addChannelMember:", error);
    return false;
  }
}

/**
 * Add multiple members to a channel by Firebase UIDs
 */
export async function addChannelMembers(
  channelId: string,
  userIds: string[],
  addedBy: string
): Promise<boolean> {
  try {
    const members = userIds.map((userId) => ({
      channel_id: channelId,
      user_id: userId,
    }));

    const { error } = await supabase.from("channel_members").insert(members);

    if (error) {
      console.error("Error adding channel members:", error);
      return false;
    }

    console.log(`${userIds.length} members added to channel ${channelId}`);
    return true;
  } catch (error) {
    console.error("Exception in addChannelMembers:", error);
    return false;
  }
}

/**
 * Remove a member from a channel by Firebase UID
 */
export async function removeChannelMember(
  channelId: string,
  userId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("channel_members")
      .delete()
      .eq("channel_id", channelId)
      .eq("user_id", userId);

    if (error) {
      console.error("Error removing channel member:", error);
      return false;
    }

    console.log(`Member ${userId} removed from channel ${channelId}`);
    return true;
  } catch (error) {
    console.error("Exception in removeChannelMember:", error);
    return false;
  }
}

/**
 * Get all members of a channel (returns Firebase UIDs)
 */
export async function getChannelMembers(channelId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from("channel_members")
      .select("user_id")
      .eq("channel_id", channelId);

    if (error) {
      console.error("Error fetching channel members:", error);
      return [];
    }

    return data?.map((member) => member.user_id) || [];
  } catch (error) {
    console.error("Exception in getChannelMembers:", error);
    return [];
  }
}

/**
 * Get all channels a user is a member of by Firebase UID
 */
export async function getUserChannels(userId: string): Promise<Channel[]> {
  try {
    const { data, error } = await supabase
      .from("channel_members")
      .select("channel_id, channels(*)")
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching user channels:", error);
      return [];
    }

    // Extract the channel data from the joined result
    const channels =
      data
        ?.map((item: any) => item.channels)
        .filter((channel: any) => channel !== null) || [];

    return channels;
  } catch (error) {
    console.error("Exception in getUserChannels:", error);
    return [];
  }
}

/**
 * Check if a user is a member of a channel by Firebase UID
 */
export async function isChannelMember(
  channelId: string,
  userId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("channel_members")
      .select("id")
      .eq("channel_id", channelId)
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "no rows returned"
      console.error("Error checking channel membership:", error);
      return false;
    }

    return data !== null;
  } catch (error) {
    console.error("Exception in isChannelMember:", error);
    return false;
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
