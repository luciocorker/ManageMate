-- Create missing tables and update existing ones
-- Run this to complete the messaging schema setup

-- Step 1: Create direct_messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.direct_messages (
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

-- Create indexes for direct_messages
CREATE INDEX IF NOT EXISTS idx_direct_messages_sender ON public.direct_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_receiver ON public.direct_messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_created_at ON public.direct_messages(created_at DESC);

-- Step 2: Add missing columns to channels table
DO $$ 
BEGIN
  -- Add project_id column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'channels' 
    AND column_name = 'project_id'
  ) THEN
    ALTER TABLE public.channels 
    ADD COLUMN project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE;
    
    CREATE INDEX idx_channels_project ON public.channels(project_id);
  END IF;

  -- Add description column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'channels' 
    AND column_name = 'description'
  ) THEN
    ALTER TABLE public.channels 
    ADD COLUMN description TEXT;
  END IF;

  -- Add created_by column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'channels' 
    AND column_name = 'created_by'
  ) THEN
    ALTER TABLE public.channels 
    ADD COLUMN created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    
    CREATE INDEX idx_channels_created_by ON public.channels(created_by);
  END IF;

  -- Add updated_at column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'channels' 
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.channels 
    ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- Step 3: Add file attachment columns to messages table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'messages' 
    AND column_name = 'file_url'
  ) THEN
    ALTER TABLE public.messages 
    ADD COLUMN file_url TEXT,
    ADD COLUMN file_name TEXT,
    ADD COLUMN file_type TEXT,
    ADD COLUMN file_size INTEGER;
  END IF;
END $$;

-- Step 4: Disable RLS for testing
ALTER TABLE public.channels DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.direct_messages DISABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS policies (disabled but ready for when you enable them)

-- Channels policies
DROP POLICY IF EXISTS "Users can view channels they are members of" ON public.channels;
CREATE POLICY "Users can view channels they are members of"
  ON public.channels FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.channel_members
      WHERE channel_members.channel_id = channels.id
      AND channel_members.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create channels" ON public.channels;
CREATE POLICY "Users can create channels"
  ON public.channels FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Channel members policies
DROP POLICY IF EXISTS "Users can view members of their channels" ON public.channel_members;
CREATE POLICY "Users can view members of their channels"
  ON public.channel_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.channel_members cm
      WHERE cm.channel_id = channel_members.channel_id
      AND cm.user_id = auth.uid()
    )
  );

-- Messages policies
DROP POLICY IF EXISTS "Users can view messages in their channels" ON public.messages;
CREATE POLICY "Users can view messages in their channels"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.channel_members
      WHERE channel_members.channel_id = messages.channel_id
      AND channel_members.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Channel members can send messages" ON public.messages;
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

-- Direct messages policies
DROP POLICY IF EXISTS "Users can view their direct messages" ON public.direct_messages;
CREATE POLICY "Users can view their direct messages"
  ON public.direct_messages FOR SELECT
  USING (
    auth.uid() = sender_id OR auth.uid() = receiver_id
  );

DROP POLICY IF EXISTS "Users can send direct messages" ON public.direct_messages;
CREATE POLICY "Users can send direct messages"
  ON public.direct_messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Step 6: Create trigger function for channels updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for channels updated_at
DROP TRIGGER IF EXISTS update_channels_updated_at ON public.channels;
CREATE TRIGGER update_channels_updated_at
  BEFORE UPDATE ON public.channels
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Step 7: Function to automatically create channel when project is created
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

-- Step 8: Function to add team members to project channel
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

-- Step 9: Function to remove team members from project channel
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

-- Step 10: Verify the setup
SELECT 'Setup complete! Verifying...' as status;

-- Check tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('channels', 'channel_members', 'messages', 'direct_messages')
ORDER BY table_name;

-- Check columns in channels
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'channels'
ORDER BY ordinal_position;

-- Check triggers
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name IN ('on_project_created', 'on_project_member_added', 'on_project_member_removed')
ORDER BY trigger_name;
