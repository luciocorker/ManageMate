-- Recreate trigger function WITHOUT exception handling to see real error

CREATE OR REPLACE FUNCTION public.create_project_channel()
RETURNS TRIGGER AS $$
DECLARE
  channel_id UUID;
BEGIN
  RAISE NOTICE 'Trigger fired for project: % with owner: %', NEW.name, NEW.owner_id;
  
  -- Create a channel for the project
  INSERT INTO public.channels (name, description, project_id, created_by)
  VALUES (
    NEW.name,
    'Project channel for ' || NEW.name,
    NEW.id,
    NEW.owner_id
  )
  RETURNING id INTO channel_id;
  
  RAISE NOTICE 'Channel created with ID: %', channel_id;

  -- Add the project owner as a channel member
  INSERT INTO public.channel_members (channel_id, user_id)
  VALUES (channel_id, NEW.owner_id);
  
  RAISE NOTICE 'Owner added as member';

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Now test by inserting a new project
INSERT INTO public.projects (name, description, status, priority, owner_id, progress, color)
VALUES (
  'Trigger Test Project 3',
  'Testing without exception handler',
  'Planning',
  'Medium',
  '50b838da-779f-41ce-a17b-9e523ced9aa6',
  0,
  '#3b82f6'
)
RETURNING id, name;

-- Check results
SELECT * FROM public.channels WHERE name = 'Trigger Test Project 3';
SELECT * FROM public.channel_members cm 
INNER JOIN public.channels c ON cm.channel_id = c.id 
WHERE c.name = 'Trigger Test Project 3';
