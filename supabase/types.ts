// ==========================================
// TYPESCRIPT INTERFACES FOR SUPABASE DATABASE
// ==========================================
// Updated to use Firebase UID as the foreign key
// All user references use firebase_uid from users table
// ==========================================

// User profile from Supabase users table
export interface UserProfile {
  id: number;
  firebase_uid: string;
  email: string;
  full_name: string;
  email_verified: boolean;
  profile_picture_url?: string;
  phone_number?: string;
  location?: string;
  linkedin_url?: string;
  github_url?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

// Friend relationship between two users
export interface Friend {
  id: string;
  user_id: string; // Firebase UID
  friend_id: string; // Firebase UID
  created_at: string;
}

// Friend with profile information (for display)
export interface FriendWithProfile extends Friend {
  profile?: UserProfile;
}

// Channel for group messaging
export interface Channel {
  id: string;
  name: string;
  description?: string;
  created_by?: string; // Firebase UID
  created_at: string;
  updated_at: string;
}

// Message in a channel or direct message
export interface Message {
  id: string;
  sender_id: string; // Firebase UID
  receiver_id?: string; // Firebase UID for direct messages
  channel_id?: string;
  content: string;
  created_at: string;
  updated_at: string;
}

// Reaction to a message
export interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string; // Firebase UID
  emoji: string;
  created_at: string;
}

// Friend request between users
export interface FriendRequest {
  id: string;
  sender_id: string; // Firebase UID
  receiver_id: string; // Firebase UID
  status: "pending" | "accepted" | "rejected";
  created_at: string;
  updated_at: string;
}

// Channel member
export interface ChannelMember {
  id: string;
  channel_id: string;
  user_id: string; // Firebase UID
  joined_at: string;
}

// ==========================================
// REQUEST/INPUT TYPES
// ==========================================

export interface CreateChannelInput {
  name: string;
  description?: string;
  created_by: string; // Firebase UID
}

export interface UpdateChannelInput {
  name?: string;
  description?: string;
}

export interface SendMessageInput {
  sender_id: string; // Firebase UID
  content: string;
  channel_id?: string;
  receiver_id?: string; // Firebase UID for direct messages
}

export interface CreateFriendRequestInput {
  sender_id: string; // Firebase UID
  receiver_email: string; // Look up receiver by email
}

export interface AddChannelMemberInput {
  channel_id: string;
  user_id: string; // Firebase UID
}

export interface AddMessageReactionInput {
  message_id: string;
  user_id: string; // Firebase UID
  emoji: string;
}
