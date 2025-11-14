-- Messaging System Schema
-- Run this after the main schema.sql

-- Create channels table (for project-based group chats)
CREATE TABLE public.channels (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create channel members table
CREATE TABLE public.channel_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  channel_id UUID REFERENCES public.channels(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(channel_id, user_id)
);

-- Create messages table (for channel messages)
CREATE TABLE public.messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  channel_id UUID REFERENCES public.channels(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  file_url TEXT,
  file_name TEXT,
  file_type TEXT,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create direct messages table (for 1-on-1 chats)
CREATE TABLE public.direct_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  file_url TEXT,
  file_name TEXT,
  file_type TEXT,
  file_size INTEGER,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_channels_project ON public.channels(project_id);
CREATE INDEX idx_channels_created_by ON public.channels(created_by);
CREATE INDEX idx_channel_members_channel ON public.channel_members(channel_id);
CREATE INDEX idx_channel_members_user ON public.channel_members(user_id);
CREATE INDEX idx_messages_channel ON public.messages(channel_id);
CREATE INDEX idx_messages_sender ON public.messages(sender_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX idx_direct_messages_sender ON public.direct_messages(sender_id);
CREATE INDEX idx_direct_messages_receiver ON public.direct_messages(receiver_id);
CREATE INDEX idx_direct_messages_created_at ON public.direct_messages(created_at DESC);

-- Enable Row Level Security (DISABLED FOR TESTING)
ALTER TABLE public.channels DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.direct_messages DISABLE ROW LEVEL SECURITY;

-- RLS Policies for channels (when enabled)
CREATE POLICY "Users can view channels they are members of"
  ON public.channels FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.channel_members
      WHERE channel_members.channel_id = channels.id
      AND channel_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create channels"
  ON public.channels FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Channel creators can update their channels"
  ON public.channels FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Channel creators can delete their channels"
  ON public.channels FOR DELETE
  USING (auth.uid() = created_by);

-- RLS Policies for channel_members
CREATE POLICY "Users can view members of their channels"
  ON public.channel_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.channel_members cm
      WHERE cm.channel_id = channel_members.channel_id
      AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Channel creators can add members"
  ON public.channel_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.channels
      WHERE channels.id = channel_members.channel_id
      AND channels.created_by = auth.uid()
    )
  );

CREATE POLICY "Channel creators can remove members"
  ON public.channel_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.channels
      WHERE channels.id = channel_members.channel_id
      AND channels.created_by = auth.uid()
    )
  );

-- RLS Policies for messages
CREATE POLICY "Users can view messages in their channels"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.channel_members
      WHERE channel_members.channel_id = messages.channel_id
      AND channel_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Channel members can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.channel_members
      WHERE channel_members.channel_id = messages.channel_id
      AND channel_members.user_id = auth.uid()
    )
    AND auth.uid() = sender_id
  );

CREATE POLICY "Senders can update their own messages"
  ON public.messages FOR UPDATE
  USING (auth.uid() = sender_id);

CREATE POLICY "Senders can delete their own messages"
  ON public.messages FOR DELETE
  USING (auth.uid() = sender_id);

-- RLS Policies for direct_messages
CREATE POLICY "Users can view their direct messages"
  ON public.direct_messages FOR SELECT
  USING (
    auth.uid() = sender_id OR auth.uid() = receiver_id
  );

CREATE POLICY "Users can send direct messages"
  ON public.direct_messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their sent messages"
  ON public.direct_messages FOR UPDATE
  USING (auth.uid() = sender_id);

CREATE POLICY "Users can delete their messages"
  ON public.direct_messages FOR DELETE
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Trigger for channels updated_at
CREATE TRIGGER update_channels_updated_at
  BEFORE UPDATE ON public.channels
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create channel when project is created
CREATE OR REPLACE FUNCTION public.create_project_channel()
RETURNS TRIGGER AS $$
DECLARE
  channel_id UUID;
BEGIN
  -- Create a channel for the project
  INSERT INTO public.channels (name, description, project_id, created_by)
  VALUES (
    NEW.name,
    'Project channel for ' || NEW.name,
    NEW.id,
    NEW.owner_id
  )
  RETURNING id INTO channel_id;

  -- Add the project owner as a channel member
  INSERT INTO public.channel_members (channel_id, user_id)
  VALUES (channel_id, NEW.owner_id);

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error creating project channel for project %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create channel when project is created
DROP TRIGGER IF EXISTS on_project_created ON public.projects;
CREATE TRIGGER on_project_created
  AFTER INSERT ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.create_project_channel();

-- Function to add team members to project channel
CREATE OR REPLACE FUNCTION public.add_member_to_project_channel()
RETURNS TRIGGER AS $$
DECLARE
  project_channel_id UUID;
BEGIN
  -- Find the channel associated with this project
  SELECT id INTO project_channel_id
  FROM public.channels
  WHERE project_id = NEW.project_id
  LIMIT 1;

  -- If channel exists, add the member
  IF project_channel_id IS NOT NULL THEN
    INSERT INTO public.channel_members (channel_id, user_id)
    VALUES (project_channel_id, NEW.user_id)
    ON CONFLICT (channel_id, user_id) DO NOTHING;
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error adding member to project channel: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to add team member to channel when added to project
DROP TRIGGER IF EXISTS on_project_member_added ON public.project_members;
CREATE TRIGGER on_project_member_added
  AFTER INSERT ON public.project_members
  FOR EACH ROW
  EXECUTE FUNCTION public.add_member_to_project_channel();

-- Function to remove team members from project channel
CREATE OR REPLACE FUNCTION public.remove_member_from_project_channel()
RETURNS TRIGGER AS $$
DECLARE
  project_channel_id UUID;
BEGIN
  -- Find the channel associated with this project
  SELECT id INTO project_channel_id
  FROM public.channels
  WHERE project_id = OLD.project_id
  LIMIT 1;

  -- If channel exists, remove the member
  IF project_channel_id IS NOT NULL THEN
    DELETE FROM public.channel_members
    WHERE channel_id = project_channel_id
    AND user_id = OLD.user_id;
  END IF;

  RETURN OLD;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error removing member from project channel: %', SQLERRM;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to remove team member from channel when removed from project
DROP TRIGGER IF EXISTS on_project_member_removed ON public.project_members;
CREATE TRIGGER on_project_member_removed
  AFTER DELETE ON public.project_members
  FOR EACH ROW
  EXECUTE FUNCTION public.remove_member_from_project_channel();
