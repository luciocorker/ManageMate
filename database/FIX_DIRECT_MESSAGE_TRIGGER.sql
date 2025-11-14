-- Fix: Update notification trigger to handle direct_messages correctly
-- The trigger was trying to access NEW.sender_name which doesn't exist
-- Instead, we need to look up the sender's name from the profiles table

-- Drop and recreate the notification function with proper sender name lookup
CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS TRIGGER AS $$
DECLARE
  sender_full_name TEXT;
  channel_name TEXT;
BEGIN
  -- For direct messages
  IF TG_TABLE_NAME = 'direct_messages' THEN
    -- Look up sender's name from profiles
    SELECT full_name INTO sender_full_name
    FROM public.profiles
    WHERE id = NEW.sender_id;
    
    -- Default to 'Unknown User' if name not found
    sender_full_name := COALESCE(sender_full_name, 'Unknown User');
    
    INSERT INTO public.notifications (user_id, title, body, data)
    VALUES (
      NEW.receiver_id,
      'New Message',
      'You have a new message from ' || sender_full_name,
      jsonb_build_object('type', 'message', 'message_id', NEW.id, 'sender_id', NEW.sender_id)
    );
  END IF;
  
  -- For channel messages
  IF TG_TABLE_NAME = 'messages' THEN
    -- Look up sender's name from profiles
    SELECT full_name INTO sender_full_name
    FROM public.profiles
    WHERE id = NEW.sender_id;
    
    -- Default to 'Unknown User' if name not found
    sender_full_name := COALESCE(sender_full_name, 'Unknown User');
    
    -- Get channel name
    SELECT name INTO channel_name
    FROM public.channels
    WHERE id = NEW.channel_id;
    
    -- Notify all channel members except sender
    INSERT INTO public.notifications (user_id, title, body, data)
    SELECT 
      cm.user_id,
      COALESCE(channel_name, 'Channel'),
      sender_full_name || ': ' || LEFT(NEW.content, 50),
      jsonb_build_object('type', 'channel_message', 'message_id', NEW.id, 'channel_id', NEW.channel_id)
    FROM public.channel_members cm
    WHERE cm.channel_id = NEW.channel_id 
      AND cm.user_id != NEW.sender_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate triggers to use the updated function
DROP TRIGGER IF EXISTS on_direct_message_sent ON public.direct_messages;
CREATE TRIGGER on_direct_message_sent
  AFTER INSERT ON public.direct_messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_message();

DROP TRIGGER IF EXISTS on_channel_message_sent ON public.messages;
CREATE TRIGGER on_channel_message_sent
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_message();

-- Verification query to test after running this migration
-- INSERT INTO direct_messages (sender_id, receiver_id, content)
-- VALUES ('your-user-id', 'receiver-user-id', 'Test message');
