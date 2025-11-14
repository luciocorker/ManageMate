import { supabase } from './supabase';

// Types
export interface Channel {
  id: string;
  name: string;
  description: string | null;
  project_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  member_count?: number;
  last_message?: Message;
}

export interface Message {
  id: string;
  channel_id: string;
  sender_id: string;
  content: string;
  file_url: string | null;
  file_name: string | null;
  file_type: string | null;
  file_size: number | null;
  created_at: string;
  sender?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
}

export interface DirectMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  file_url: string | null;
  file_name: string | null;
  file_type: string | null;
  file_size: number | null;
  read: boolean;
  created_at: string;
  sender?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
  receiver?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
}

export interface User {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  last_message?: string;
  last_message_time?: string;
  last_message_sender_id?: string;
  unread_count?: number;
}

// Get current user
async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * Get all channels the user is a member of
 */
export async function getUserChannels(): Promise<Channel[]> {
  try {
    const user = await getCurrentUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('channel_members')
      .select(`
        channel_id,
        channels (
          id,
          name,
          description,
          project_id,
          created_by,
          created_at,
          updated_at
        )
      `)
      .eq('user_id', user.id);

    if (error) throw error;

    // Get member counts for each channel
    const channels = await Promise.all(
      (data || [])
        .filter(item => item.channels)
        .map(async (item: any) => {
          const channel = item.channels;
          
          // Get member count
          const { count } = await supabase
            .from('channel_members')
            .select('*', { count: 'exact', head: true })
            .eq('channel_id', channel.id);

          // Get last message
          const { data: lastMessageData } = await supabase
            .from('messages')
            .select('*')
            .eq('channel_id', channel.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          return {
            ...channel,
            member_count: count || 0,
            last_message: lastMessageData || undefined,
          };
        })
    );

    return channels;
  } catch (error) {
    console.error('Error fetching user channels:', error);
    return [];
  }
}

/**
 * Get channel by ID with members
 */
export async function getChannelById(channelId: string): Promise<Channel | null> {
  try {
    const { data: channel, error: channelError } = await supabase
      .from('channels')
      .select('*')
      .eq('id', channelId)
      .single();

    if (channelError) throw channelError;
    if (!channel) return null;

    // Get member count
    const { count } = await supabase
      .from('channel_members')
      .select('*', { count: 'exact', head: true })
      .eq('channel_id', channelId);

    return {
      ...channel,
      member_count: count || 0,
    };
  } catch (error) {
    console.error('Error fetching channel:', error);
    return null;
  }
}

/**
 * Get messages for a channel
 */
export async function getChannelMessages(channelId: string): Promise<Message[]> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('channel_id', channelId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Get sender info for each message
    const messages = await Promise.all(
      (data || []).map(async (message) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .eq('id', message.sender_id)
          .single();

        return {
          ...message,
          sender: profile || undefined,
        };
      })
    );

    return messages;
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
}

/**
 * Send a message to a channel
 */
export async function sendChannelMessage(
  channelId: string,
  content: string,
  fileUrl?: string,
  fileName?: string,
  fileType?: string,
  fileSize?: number
): Promise<Message | null> {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    // Get sender name from profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();

    const { data, error } = await supabase
      .from('messages')
      .insert({
        channel_id: channelId,
        sender_id: user.id,
        sender_name: profile?.full_name || 'Unknown User',
        text: content,
        content,
        file_url: fileUrl || null,
        file_name: fileName || null,
        file_type: fileType || null,
        file_size: fileSize || null,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      ...data,
      sender: profile || undefined,
    };
  } catch (error) {
    console.error('Error sending message:', error);
    return null;
  }
}

/**
 * Get channel members
 */
export async function getChannelMembers(channelId: string): Promise<User[]> {
  try {
    const { data, error } = await supabase
      .from('channel_members')
      .select('user_id')
      .eq('channel_id', channelId);

    if (error) throw error;

    const userIds = (data || []).map(m => m.user_id);
    if (userIds.length === 0) return [];

    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, email, avatar_url')
      .in('id', userIds);

    if (profilesError) throw profilesError;

    return profiles || [];
  } catch (error) {
    console.error('Error fetching channel members:', error);
    return [];
  }
}

/**
 * Create a new channel
 */
export async function createChannel(
  name: string,
  description: string,
  memberIds: string[]
): Promise<Channel | null> {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    // Create channel
    const { data: channel, error: channelError } = await supabase
      .from('channels')
      .insert({
        name,
        description,
        created_by: user.id,
      })
      .select()
      .single();

    if (channelError) throw channelError;

    // Add creator as member
    const members = [user.id, ...memberIds.filter(id => id !== user.id)];
    
    const { error: membersError } = await supabase
      .from('channel_members')
      .insert(
        members.map(userId => ({
          channel_id: channel.id,
          user_id: userId,
        }))
      );

    if (membersError) throw membersError;

    return {
      ...channel,
      member_count: members.length,
    };
  } catch (error) {
    console.error('Error creating channel:', error);
    return null;
  }
}

/**
 * Get all users for direct messaging
 */
export async function getAllUsers(): Promise<User[]> {
  try {
    const user = await getCurrentUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, avatar_url')
      .neq('id', user.id)
      .order('full_name', { ascending: true });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

/**
 * Get direct message conversations - OPTIMIZED VERSION
 */
export async function getDirectMessageConversations(): Promise<User[]> {
  try {
    const user = await getCurrentUser();
    if (!user) return [];

    // Use a more efficient query that gets conversation data in one go
    // Get distinct conversation partners with their latest message
    const { data: conversations, error } = await supabase.rpc('get_conversation_list', {
      p_user_id: user.id
    });

    if (error) {
      // Fallback to less efficient method if RPC doesn't exist
      console.warn('RPC function not found, using fallback method:', error);
      return await getDirectMessageConversationsFallback(user.id);
    }

    return conversations || [];
  } catch (error) {
    console.error('Error fetching conversations:', error);
    const user = await getCurrentUser();
    if (user) {
      return await getDirectMessageConversationsFallback(user.id);
    }
    return [];
  }
}

/**
 * Fallback method for getting conversations (less efficient but works without custom RPC)
 */
async function getDirectMessageConversationsFallback(userId: string): Promise<User[]> {
  try {
    // Get all direct messages involving current user (limit to recent messages for speed)
    const { data: allMessages, error } = await supabase
      .from('direct_messages')
      .select('sender_id, receiver_id, content, created_at, read')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false })
      .limit(1000); // Limit to last 1000 messages for performance

    if (error) throw error;

    // Group messages by conversation partner
    const conversationsMap = new Map<string, {
      userId: string;
      lastMessage: string;
      lastMessageTime: string;
      lastMessageSenderId: string;
      unreadCount: number;
    }>();

    (allMessages || []).forEach(msg => {
      const partnerId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
      
      if (!conversationsMap.has(partnerId)) {
        // Count unread messages from this partner (only in fetched messages)
        const unreadCount = (allMessages || []).filter(
          m => m.sender_id === partnerId && m.receiver_id === userId && !m.read
        ).length;

        conversationsMap.set(partnerId, {
          userId: partnerId,
          lastMessage: msg.content,
          lastMessageTime: msg.created_at,
          lastMessageSenderId: msg.sender_id,
          unreadCount
        });
      }
    });

    if (conversationsMap.size === 0) return [];

    // Get user profiles in batch
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, email, avatar_url')
      .in('id', Array.from(conversationsMap.keys()));

    if (profilesError) throw profilesError;

    // Combine profile data with conversation data
    const conversations = (profiles || []).map(profile => {
      const convData = conversationsMap.get(profile.id)!;
      return {
        ...profile,
        last_message: convData.lastMessage,
        last_message_time: convData.lastMessageTime,
        last_message_sender_id: convData.lastMessageSenderId,
        unread_count: convData.unreadCount
      };
    });

    // Sort by last message time
    conversations.sort((a, b) => 
      new Date(b.last_message_time!).getTime() - new Date(a.last_message_time!).getTime()
    );

    return conversations;
  } catch (error) {
    console.error('Error in fallback method:', error);
    return [];
  }
}

/**
 * Get direct messages with a specific user
 */
export async function getDirectMessages(otherUserId: string): Promise<DirectMessage[]> {
  try {
    const user = await getCurrentUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('direct_messages')
      .select('*')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Mark messages as read
    await supabase
      .from('direct_messages')
      .update({ read: true })
      .eq('receiver_id', user.id)
      .eq('sender_id', otherUserId)
      .eq('read', false);

    // Get sender/receiver info
    const messages = await Promise.all(
      (data || []).map(async (message) => {
        const { data: senderProfile } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .eq('id', message.sender_id)
          .single();

        const { data: receiverProfile } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .eq('id', message.receiver_id)
          .single();

        return {
          ...message,
          sender: senderProfile || undefined,
          receiver: receiverProfile || undefined,
        };
      })
    );

    return messages;
  } catch (error) {
    console.error('Error fetching direct messages:', error);
    return [];
  }
}

/**
 * Send a direct message
 */
export async function sendDirectMessage(
  receiverId: string,
  content: string,
  fileUrl?: string,
  fileName?: string,
  fileType?: string,
  fileSize?: number
): Promise<DirectMessage | null> {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('direct_messages')
      .insert({
        sender_id: user.id,
        receiver_id: receiverId,
        content,
        file_url: fileUrl || null,
        file_name: fileName || null,
        file_type: fileType || null,
        file_size: fileSize || null,
      })
      .select()
      .single();

    if (error) throw error;

    // Get sender info
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .eq('id', user.id)
      .single();

    return {
      ...data,
      sender: profile || undefined,
    };
  } catch (error) {
    console.error('Error sending direct message:', error);
    return null;
  }
}

/**
 * Get users you've collaborated with on projects (teammates)
 */
export async function getTeammates(): Promise<User[]> {
  try {
    const user = await getCurrentUser();
    if (!user) return [];

    // Get all projects where user is owner or member
    const { data: memberProjects, error: memberError } = await supabase
      .from('project_members')
      .select('project_id')
      .eq('user_id', user.id);

    if (memberError) throw memberError;

    const { data: ownedProjects, error: ownedError } = await supabase
      .from('projects')
      .select('id')
      .eq('owner_id', user.id);

    if (ownedError) throw ownedError;

    const projectIds = [
      ...(memberProjects || []).map(p => p.project_id),
      ...(ownedProjects || []).map(p => p.id),
    ];

    if (projectIds.length === 0) return [];

    // Get all team member IDs from these projects (excluding current user)
    const { data: teammates, error: teammatesError } = await supabase
      .from('project_members')
      .select('user_id')
      .in('project_id', projectIds)
      .neq('user_id', user.id);

    if (teammatesError) throw teammatesError;

    // Get all project owner IDs (excluding current user)
    const { data: owners, error: ownersError } = await supabase
      .from('projects')
      .select('owner_id')
      .in('id', projectIds)
      .neq('owner_id', user.id);

    if (ownersError) throw ownersError;

    // Collect unique user IDs
    const userIds = new Set<string>();
    (teammates || []).forEach((t: any) => userIds.add(t.user_id));
    (owners || []).forEach((o: any) => userIds.add(o.owner_id));

    if (userIds.size === 0) return [];

    // Fetch profiles for all unique user IDs
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, email, avatar_url')
      .in('id', Array.from(userIds));

    if (profilesError) throw profilesError;

    return profiles || [];
  } catch (error) {
    console.error('Error fetching teammates:', error);
    return [];
  }
}

/**
 * Subscribe to new messages in a channel
 */
export function subscribeToChannelMessages(
  channelId: string,
  callback: (message: Message) => void
) {
  return supabase
    .channel(`messages:${channelId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `channel_id=eq.${channelId}`,
      },
      async (payload) => {
        // Get sender info
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .eq('id', payload.new.sender_id)
          .single();

        callback({
          ...payload.new,
          sender: profile || undefined,
        } as Message);
      }
    )
    .subscribe();
}

/**
 * Subscribe to new direct messages
 */
export function subscribeToDirectMessages(
  callback: (message: DirectMessage) => void
) {
  return supabase
    .channel('direct_messages')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'direct_messages',
      },
      async (payload) => {
        // Get sender info
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .eq('id', payload.new.sender_id)
          .single();

        callback({
          ...payload.new,
          sender: profile || undefined,
        } as DirectMessage);
      }
    )
    .subscribe();
}

/**
 * Get unread direct message count
 */
export async function getUnreadMessageCount(): Promise<number> {
  try {
    const user = await getCurrentUser();
    if (!user) return 0;

    const { count, error } = await supabase
      .from('direct_messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', user.id)
      .eq('read', false);

    if (error) throw error;

    return count || 0;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
}

/**
 * Mark messages from a specific user as read
 */
export async function markMessagesAsRead(senderId: string): Promise<void> {
  try {
    const user = await getCurrentUser();
    if (!user) return;

    const { error } = await supabase
      .from('direct_messages')
      .update({ read: true })
      .eq('receiver_id', user.id)
      .eq('sender_id', senderId)
      .eq('read', false);

    if (error) throw error;
  } catch (error) {
    console.error('Error marking messages as read:', error);
  }
}
