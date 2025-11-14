-- Update existing messaging schema to add project integration
-- Run this to add missing columns and triggers

-- Step 1: Add missing columns to channels table if they don't exist
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

-- Step 2: Add file attachment columns to messages table
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

-- Step 3: Add file attachment columns to direct_messages table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'direct_messages' 
    AND column_name = 'file_url'
  ) THEN
    ALTER TABLE public.direct_messages 
    ADD COLUMN file_url TEXT,
    ADD COLUMN file_name TEXT,
    ADD COLUMN file_type TEXT,
    ADD COLUMN file_size INTEGER;
  END IF;

  -- Add read column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'direct_messages' 
    AND column_name = 'read'
  ) THEN
    ALTER TABLE public.direct_messages 
    ADD COLUMN read BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Step 4: Create trigger function for channels updated_at
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

-- Step 5: Function to automatically create channel when project is created
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

-- Step 6: Function to add team members to project channel
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

-- Step 7: Function to remove team members from project channel
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

-- Step 8: Verify the updates
SELECT 'Update complete! Verifying...' as status;

-- Check if all columns exist now
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('channels', 'messages', 'direct_messages')
  AND column_name IN ('project_id', 'description', 'created_by', 'updated_at', 'file_url', 'file_name', 'read')
ORDER BY table_name, column_name;
