-- Create push notification tokens table

CREATE TABLE IF NOT EXISTS public.push_tokens (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  token TEXT NOT NULL,
  device_type TEXT, -- 'ios' or 'android'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, token)
);

CREATE INDEX IF NOT EXISTS idx_push_tokens_user ON public.push_tokens(user_id);

-- Disable RLS for testing
ALTER TABLE public.push_tokens DISABLE ROW LEVEL SECURITY;

-- Create function to send notification (placeholder - will use Supabase Edge Function)
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);

ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;

-- Trigger to send notification when message is received
CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS TRIGGER AS $$
BEGIN
  -- For direct messages
  IF TG_TABLE_NAME = 'direct_messages' THEN
    INSERT INTO public.notifications (user_id, title, body, data)
    VALUES (
      NEW.receiver_id,
      'New Message',
      'You have a new message from ' || NEW.sender_name,
      jsonb_build_object('type', 'message', 'message_id', NEW.id, 'sender_id', NEW.sender_id)
    );
  END IF;
  
  -- For channel messages
  IF TG_TABLE_NAME = 'messages' THEN
    -- Notify all channel members except sender
    INSERT INTO public.notifications (user_id, title, body, data)
    SELECT 
      cm.user_id,
      c.name,
      NEW.sender_name || ': ' || LEFT(NEW.text, 50),
      jsonb_build_object('type', 'channel_message', 'message_id', NEW.id, 'channel_id', NEW.channel_id)
    FROM public.channel_members cm
    INNER JOIN public.channels c ON cm.channel_id = c.id
    WHERE cm.channel_id = NEW.channel_id 
      AND cm.user_id != NEW.sender_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for messages
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

-- Trigger for project member added
CREATE OR REPLACE FUNCTION notify_project_member_added()
RETURNS TRIGGER AS $$
DECLARE
  project_name TEXT;
BEGIN
  -- Get project name
  SELECT name INTO project_name
  FROM public.projects
  WHERE id = NEW.project_id;
  
  -- Notify the added member
  INSERT INTO public.notifications (user_id, title, body, data)
  VALUES (
    NEW.user_id,
    'Added to Project',
    'You have been added to project: ' || project_name,
    jsonb_build_object('type', 'project_added', 'project_id', NEW.project_id)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_member_added_to_project ON public.project_members;
CREATE TRIGGER on_member_added_to_project
  AFTER INSERT ON public.project_members
  FOR EACH ROW
  EXECUTE FUNCTION notify_project_member_added();

-- Trigger for task assigned
CREATE OR REPLACE FUNCTION notify_task_assigned()
RETURNS TRIGGER AS $$
DECLARE
  task_title TEXT;
  project_name TEXT;
BEGIN
  -- Only notify if assigned_to changed and is not null
  IF NEW.assigned_to IS NOT NULL AND (OLD.assigned_to IS NULL OR OLD.assigned_to != NEW.assigned_to) THEN
    -- Get task and project info
    SELECT t.title, p.name INTO task_title, project_name
    FROM public.tasks t
    INNER JOIN public.projects p ON t.project_id = p.id
    WHERE t.id = NEW.id;
    
    -- Notify the assigned user
    INSERT INTO public.notifications (user_id, title, body, data)
    VALUES (
      NEW.assigned_to,
      'Task Assigned',
      'You have been assigned to: ' || task_title || ' in ' || project_name,
      jsonb_build_object('type', 'task_assigned', 'task_id', NEW.id, 'project_id', NEW.project_id)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_task_assigned ON public.tasks;
CREATE TRIGGER on_task_assigned
  AFTER INSERT OR UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION notify_task_assigned();

SELECT 'Notification system installed successfully!' as status;
