-- Check channel_members structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'channel_members'
ORDER BY ordinal_position;

-- Fix the trigger function to include user_name
CREATE OR REPLACE FUNCTION public.create_project_channel()
RETURNS TRIGGER AS $$
DECLARE
  channel_id UUID;
  owner_name TEXT;
BEGIN
  -- Get the owner's name from profiles
  SELECT full_name INTO owner_name
  FROM public.profiles
  WHERE id = NEW.owner_id;
  
  -- Create a channel for the project
  INSERT INTO public.channels (name, description, project_id, created_by)
  VALUES (
    NEW.name,
    'Project channel for ' || NEW.name,
    NEW.id,
    NEW.owner_id
  )
  RETURNING id INTO channel_id;

  -- Add the project owner as a channel member with their name
  INSERT INTO public.channel_members (channel_id, user_id, user_name)
  VALUES (channel_id, NEW.owner_id, COALESCE(owner_name, 'Unknown User'));

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error creating project channel for project %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test it
INSERT INTO public.projects (name, description, status, priority, owner_id, progress, color)
VALUES (
  'Trigger Test Project 4',
  'Testing with user_name fix',
  'Planning',
  'Medium',
  '50b838da-779f-41ce-a17b-9e523ced9aa6',
  0,
  '#3b82f6'
)
RETURNING id, name;

-- Check results
SELECT * FROM public.channels WHERE name = 'Trigger Test Project 4';
SELECT cm.*, c.name as channel_name 
FROM public.channel_members cm 
INNER JOIN public.channels c ON cm.channel_id = c.id 
WHERE c.name = 'Trigger Test Project 4';
