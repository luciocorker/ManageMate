import { getUnreadMessageCount } from '@/lib/messagingService';
import { supabase } from '@/lib/supabase';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface MessagingContextType {
  unreadCount: number;
  refreshUnreadCount: () => Promise<void>;
}

const MessagingContext = createContext<MessagingContextType | undefined>(undefined);

export function MessagingProvider({ children }: { children: ReactNode }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);

  // Get current user and initial unread count
  useEffect(() => {
    const initializeMessaging = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const count = await getUnreadMessageCount();
        setUnreadCount(count);
      }
    };

    initializeMessaging();
  }, []);

  // Set up real-time subscription for new messages
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('direct_messages_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages',
          filter: `receiver_id=eq.${userId}`,
        },
        (payload) => {
          // New message received, increment unread count
          setUnreadCount(prev => prev + 1);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'direct_messages',
          filter: `receiver_id=eq.${userId}`,
        },
        async () => {
          // Message marked as read, refresh count
          const count = await getUnreadMessageCount();
          setUnreadCount(count);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const refreshUnreadCount = async () => {
    const count = await getUnreadMessageCount();
    setUnreadCount(count);
  };

  return (
    <MessagingContext.Provider value={{ unreadCount, refreshUnreadCount }}>
      {children}
    </MessagingContext.Provider>
  );
}

export function useMessaging() {
  const context = useContext(MessagingContext);
  if (context === undefined) {
    throw new Error('useMessaging must be used within a MessagingProvider');
  }
  return context;
}
