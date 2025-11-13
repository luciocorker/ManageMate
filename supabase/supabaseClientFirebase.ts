import { supabase } from "@/lib/supabase";
import type {
  AddChannelMemberInput,
  AddMessageReactionInput,
  Channel,
  ChannelMember,
  CreateChannelInput,
  CreateFriendRequestInput,
  Friend,
  FriendRequest,
  Message,
  MessageReaction,
  SendMessageInput,
  UpdateChannelInput,
  UserProfile,
} from "./types";

// ==========================================
// MANAGEMATE SUPABASE CLIENT (FIREBASE VERSION)
// ==========================================
// This client integrates with Firebase authentication
// All functions use firebase_uid as the user identifier
// ==========================================

// ==========================================
// USER FUNCTIONS
// ==========================================

/**
 * Get user profile by Firebase UID
 */
export async function getUserByFirebaseUid(
  firebaseUid: string
): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("firebase_uid", firebaseUid)
      .single();

    if (error) {
      console.error("Error fetching user:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Exception in getUserByFirebaseUid:", error);
    return null;
  }
}

/**
 * Get user profile by email
 */
export async function getUserByEmail(
  email: string
): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No rows found
        console.log("No user found with email:", email);
        return null;
      }
      console.error("Error fetching user by email:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Exception in getUserByEmail:", error);
    return null;
  }
}

/**
 * Search users by name or email
 */
export async function searchUsers(query: string): Promise<UserProfile[]> {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
      .limit(20);

    if (error) {
      console.error("Error searching users:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Exception in searchUsers:", error);
    return [];
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  firebaseUid: string,
  updates: Partial<UserProfile>
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("users")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("firebase_uid", firebaseUid);

    if (error) {
      console.error("Error updating user profile:", error);
      return false;
    }

    console.log("User profile updated successfully");
    return true;
  } catch (error) {
    console.error("Exception in updateUserProfile:", error);
    return false;
  }
}

// ==========================================
// FRIEND REQUEST FUNCTIONS
// ==========================================

/**
 * Send a friend request by email
 * Looks up the receiver by email and creates a friend request
 */
export async function sendFriendRequest(
  input: CreateFriendRequestInput
): Promise<FriendRequest | null> {
  try {
    // Look up receiver by email
    const receiver = await getUserByEmail(input.receiver_email);

    if (!receiver) {
      console.error("Receiver not found with email:", input.receiver_email);
      return null;
    }

    // Check if friend request already exists
    const { data: existing, error: existingError } = await supabase
      .from("friend_requests")
      .select("*")
      .eq("sender_id", input.sender_id)
      .eq("receiver_id", receiver.firebase_uid)
      .single();

    if (existing) {
      console.log("Friend request already exists");
      return existing;
    }

    // Create friend request
    const { data, error } = await supabase
      .from("friend_requests")
      .insert([
        {
          sender_id: input.sender_id,
          receiver_id: receiver.firebase_uid,
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
 * Get all pending friend requests for a user
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
 * Accept a friend request
 * Updates the request status and adds both users to each other's friends list
 */
export async function acceptFriendRequest(
  requestId: string,
  userId: string
): Promise<boolean> {
  try {
    // Get the friend request
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

    console.log("Friend request accepted successfully");
    return true;
  } catch (error) {
    console.error("Exception in acceptFriendRequest:", error);
    return false;
  }
}

/**
 * Reject a friend request
 */
export async function rejectFriendRequest(
  requestId: string,
  userId: string
): Promise<boolean> {
  try {
    // Verify the user is the receiver
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
    const { error } = await supabase
      .from("friend_requests")
      .update({ status: "rejected" })
      .eq("id", requestId);

    if (error) {
      console.error("Error rejecting friend request:", error);
      return false;
    }

    console.log("Friend request rejected successfully");
    return true;
  } catch (error) {
    console.error("Exception in rejectFriendRequest:", error);
    return false;
  }
}

// ==========================================
// FRIENDS FUNCTIONS
// ==========================================

/**
 * Get all friends for a user with their profiles
 */
export async function getFriends(userId: string): Promise<UserProfile[]> {
  try {
    // Get friend IDs
    const { data: friendships, error: friendError } = await supabase
      .from("friends")
      .select("friend_id")
      .eq("user_id", userId);

    if (friendError) {
      console.error("Error fetching friends:", friendError);
      return [];
    }

    if (!friendships || friendships.length === 0) {
      return [];
    }

    // Get friend profiles
    const friendIds = friendships.map((f) => f.friend_id);
    const { data: profiles, error: profileError } = await supabase
      .from("users")
      .select("*")
      .in("firebase_uid", friendIds);

    if (profileError) {
      console.error("Error fetching friend profiles:", profileError);
      return [];
    }

    console.log(`Friends for user:`, profiles?.length || 0);
    return profiles || [];
  } catch (error) {
    console.error("Exception in getFriends:", error);
    return [];
  }
}

/**
 * Remove a friend
 */
export async function removeFriend(
  userId: string,
  friendId: string
): Promise<boolean> {
  try {
    // Remove both friendship records
    const { error } = await supabase
      .from("friends")
      .delete()
      .or(
        `and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`
      );

    if (error) {
      console.error("Error removing friend:", error);
      return false;
    }

    console.log("Friend removed successfully");
    return true;
  } catch (error) {
    console.error("Exception in removeFriend:", error);
    return false;
  }
}

// ==========================================
// CHANNEL FUNCTIONS
// ==========================================

/**
 * Create a new channel
 */
export async function createChannel(
  input: CreateChannelInput
): Promise<Channel | null> {
  try {
    const { data, error } = await supabase
      .from("channels")
      .insert({
        name: input.name,
        description: input.description,
        created_by: input.created_by,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating channel:", error);
      return null;
    }

    // Add creator as a member
    await addChannelMember({
      channel_id: data.id,
      user_id: input.created_by,
    });

    console.log("Channel created successfully:", data);
    return data;
  } catch (error) {
    console.error("Exception in createChannel:", error);
    return null;
  }
}

/**
 * Get all channels a user is a member of
 */
export async function getUserChannels(userId: string): Promise<Channel[]> {
  try {
    // Get channel IDs user is a member of
    const { data: memberships, error: memberError } = await supabase
      .from("channel_members")
      .select("channel_id")
      .eq("user_id", userId);

    if (memberError) {
      console.error("Error fetching channel memberships:", memberError);
      return [];
    }

    if (!memberships || memberships.length === 0) {
      return [];
    }

    // Get channel details
    const channelIds = memberships.map((m) => m.channel_id);
    const { data: channels, error: channelError } = await supabase
      .from("channels")
      .select("*")
      .in("id", channelIds)
      .order("created_at", { ascending: false });

    if (channelError) {
      console.error("Error fetching channels:", channelError);
      return [];
    }

    console.log(`Channels for user:`, channels?.length || 0);
    return channels || [];
  } catch (error) {
    console.error("Exception in getUserChannels:", error);
    return [];
  }
}

/**
 * Update a channel
 */
export async function updateChannel(
  channelId: string,
  updates: UpdateChannelInput
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("channels")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", channelId);

    if (error) {
      console.error("Error updating channel:", error);
      return false;
    }

    console.log("Channel updated successfully");
    return true;
  } catch (error) {
    console.error("Exception in updateChannel:", error);
    return false;
  }
}

/**
 * Delete a channel
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

    console.log("Channel deleted successfully");
    return true;
  } catch (error) {
    console.error("Exception in deleteChannel:", error);
    return false;
  }
}

// ==========================================
// CHANNEL MEMBER FUNCTIONS
// ==========================================

/**
 * Add a member to a channel
 */
export async function addChannelMember(
  input: AddChannelMemberInput
): Promise<boolean> {
  try {
    const { error } = await supabase.from("channel_members").insert({
      channel_id: input.channel_id,
      user_id: input.user_id,
    });

    if (error) {
      // Ignore duplicate key errors
      if (error.code === "23505") {
        console.log("User is already a member of this channel");
        return true;
      }
      console.error("Error adding channel member:", error);
      return false;
    }

    console.log("Channel member added successfully");
    return true;
  } catch (error) {
    console.error("Exception in addChannelMember:", error);
    return false;
  }
}

/**
 * Remove a member from a channel
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

    console.log("Channel member removed successfully");
    return true;
  } catch (error) {
    console.error("Exception in removeChannelMember:", error);
    return false;
  }
}

/**
 * Get all members of a channel with their profiles
 */
export async function getChannelMembers(
  channelId: string
): Promise<UserProfile[]> {
  try {
    // Get member user IDs
    const { data: memberships, error: memberError } = await supabase
      .from("channel_members")
      .select("user_id")
      .eq("channel_id", channelId);

    if (memberError) {
      console.error("Error fetching channel members:", memberError);
      return [];
    }

    if (!memberships || memberships.length === 0) {
      return [];
    }

    // Get user profiles
    const userIds = memberships.map((m) => m.user_id);
    const { data: profiles, error: profileError } = await supabase
      .from("users")
      .select("*")
      .in("firebase_uid", userIds);

    if (profileError) {
      console.error("Error fetching member profiles:", profileError);
      return [];
    }

    return profiles || [];
  } catch (error) {
    console.error("Exception in getChannelMembers:", error);
    return [];
  }
}

// ==========================================
// MESSAGE FUNCTIONS
// ==========================================

/**
 * Send a message (channel or direct)
 */
export async function sendMessage(
  input: SendMessageInput
): Promise<Message | null> {
  try {
    const { data, error } = await supabase
      .from("messages")
      .insert({
        sender_id: input.sender_id,
        receiver_id: input.receiver_id,
        channel_id: input.channel_id,
        content: input.content,
      })
      .select()
      .single();

    if (error) {
      console.error("Error sending message:", error);
      return null;
    }

    console.log("Message sent successfully:", data);
    return data;
  } catch (error) {
    console.error("Exception in sendMessage:", error);
    return null;
  }
}

/**
 * Get channel messages
 */
export async function getChannelMessages(
  channelId: string,
  limit: number = 50
): Promise<Message[]> {
  try {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("channel_id", channelId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching channel messages:", error);
      return [];
    }

    return (data || []).reverse();
  } catch (error) {
    console.error("Exception in getChannelMessages:", error);
    return [];
  }
}

/**
 * Get direct messages between two users
 */
export async function getDirectMessages(
  userId1: string,
  userId2: string,
  limit: number = 50
): Promise<Message[]> {
  try {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .or(
        `and(sender_id.eq.${userId1},receiver_id.eq.${userId2}),and(sender_id.eq.${userId2},receiver_id.eq.${userId1})`
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching direct messages:", error);
      return [];
    }

    return (data || []).reverse();
  } catch (error) {
    console.error("Exception in getDirectMessages:", error);
    return [];
  }
}

/**
 * Delete a message
 */
export async function deleteMessage(
  messageId: string,
  userId: string
): Promise<boolean> {
  try {
    // Verify user owns the message
    const { data: message, error: fetchError } = await supabase
      .from("messages")
      .select("sender_id")
      .eq("id", messageId)
      .single();

    if (fetchError || !message) {
      console.error("Error fetching message:", fetchError);
      return false;
    }

    if (message.sender_id !== userId) {
      console.error("User does not own this message");
      return false;
    }

    const { error } = await supabase
      .from("messages")
      .delete()
      .eq("id", messageId);

    if (error) {
      console.error("Error deleting message:", error);
      return false;
    }

    console.log("Message deleted successfully");
    return true;
  } catch (error) {
    console.error("Exception in deleteMessage:", error);
    return false;
  }
}

// ==========================================
// MESSAGE REACTION FUNCTIONS
// ==========================================

/**
 * Add a reaction to a message
 */
export async function addMessageReaction(
  input: AddMessageReactionInput
): Promise<MessageReaction | null> {
  try {
    const { data, error } = await supabase
      .from("message_reactions")
      .insert({
        message_id: input.message_id,
        user_id: input.user_id,
        emoji: input.emoji,
      })
      .select()
      .single();

    if (error) {
      // Ignore duplicate reactions
      if (error.code === "23505") {
        console.log("User already reacted with this emoji");
        return null;
      }
      console.error("Error adding reaction:", error);
      return null;
    }

    console.log("Reaction added successfully");
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
  userId: string,
  emoji: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("message_reactions")
      .delete()
      .eq("message_id", messageId)
      .eq("user_id", userId)
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

    return data || [];
  } catch (error) {
    console.error("Exception in getMessageReactions:", error);
    return [];
  }
}

// ==========================================
// REALTIME SUBSCRIPTIONS
// ==========================================

/**
 * Subscribe to new messages in a channel
 */
export function subscribeToChannelMessages(
  channelId: string,
  callback: (message: Message) => void
) {
  return supabase
    .channel(`channel:${channelId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `channel_id=eq.${channelId}`,
      },
      (payload) => {
        callback(payload.new as Message);
      }
    )
    .subscribe();
}

/**
 * Subscribe to direct messages between two users
 */
export function subscribeToDirectMessages(
  userId1: string,
  userId2: string,
  callback: (message: Message) => void
) {
  return supabase
    .channel(`dm:${userId1}:${userId2}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
      },
      (payload) => {
        const message = payload.new as Message;
        // Only trigger callback if message is between these two users
        if (
          (message.sender_id === userId1 && message.receiver_id === userId2) ||
          (message.sender_id === userId2 && message.receiver_id === userId1)
        ) {
          callback(message);
        }
      }
    )
    .subscribe();
}

/**
 * Subscribe to friend requests for a user
 */
export function subscribeToFriendRequests(
  userId: string,
  callback: (request: FriendRequest) => void
) {
  return supabase
    .channel(`friend_requests:${userId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "friend_requests",
        filter: `receiver_id=eq.${userId}`,
      },
      (payload) => {
        callback(payload.new as FriendRequest);
      }
    )
    .subscribe();
}
