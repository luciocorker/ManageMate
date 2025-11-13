// TypeScript interfaces for Supabase database tables

export interface Friend {
  id: string;
  user_name: string;
  friend_name: string;
  created_at: string;
}

export interface Channel {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface Message {
  id: string;
  channel_id?: string;
  sender_name: string;
  receiver_name?: string;
  text: string;
  created_at: string;
  reply_to_message_id?: string;
}

export interface MessageReaction {
  id: string;
  message_id: string;
  user_name: string;
  emoji: string;
  created_at: string;
}

// Request types for creating new records
export interface CreateChannelRequest {
  name: string;
  description?: string;
}

export interface CreateFriendRequest {
  user_name: string;
  friend_name: string;
}

export interface SendMessageRequest {
  sender_name: string;
  text: string;
  channel_id?: string;
  receiver_name?: string;
}

export interface FriendRequest {
  id: string;
  sender_name: string;
  sender_email: string;
  receiver_name: string;
  receiver_email: string;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
  updated_at: string;
}

export interface CreateFriendRequestInput {
  sender_name: string;
  sender_email: string;
  receiver_name: string;
  receiver_email: string;
}

export interface ChannelMember {
  id: string;
  channel_id: string;
  user_name: string;
  added_at: string;
  added_by?: string;
}

export interface AddChannelMemberInput {
  channel_id: string;
  user_name: string;
  added_by: string;
}
