-- Install triggers to auto-create channels for projects
-- Run this in your Supabase SQL Editor

-- Step 1: Create the trigger function for project creation
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

-- Step 2: Create trigger on projects table
DROP TRIGGER IF EXISTS on_project_created ON public.projects;
CREATE TRIGGER on_project_created
  AFTER INSERT ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.create_project_channel();

-- Step 3: Create the trigger function for adding members
CREATE OR REPLACE FUNCTION public.add_member_to_project_channel()
RETURNS TRIGGER AS $$
DECLARE
  project_channel_id UUID;
BEGIN
  -- Only proceed if user_id is not null
  IF NEW.user_id IS NULL THEN
    RETURN NEW;
  END IF;

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

-- Step 4: Create trigger on project_members table
DROP TRIGGER IF EXISTS on_project_member_added ON public.project_members;
CREATE TRIGGER on_project_member_added
  AFTER INSERT ON public.project_members
  FOR EACH ROW
  EXECUTE FUNCTION public.add_member_to_project_channel();

-- Step 5: Create the trigger function for removing members
CREATE OR REPLACE FUNCTION public.remove_member_from_project_channel()
RETURNS TRIGGER AS $$
DECLARE
  project_channel_id UUID;
BEGIN
  -- Only proceed if user_id is not null
  IF OLD.user_id IS NULL THEN
    RETURN OLD;
  END IF;

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

-- Step 6: Create trigger on project_members table for deletions
DROP TRIGGER IF EXISTS on_project_member_removed ON public.project_members;
CREATE TRIGGER on_project_member_removed
  AFTER DELETE ON public.project_members
  FOR EACH ROW
  EXECUTE FUNCTION public.remove_member_from_project_channel();

-- Verify installation
SELECT 'Triggers installed successfully!' as status;

SELECT 
  trigger_name,
  event_object_table,
  action_timing,
  event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name IN ('on_project_created', 'on_project_member_added', 'on_project_member_removed')
ORDER BY trigger_name;
