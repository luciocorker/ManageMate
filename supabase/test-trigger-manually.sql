-- Test the trigger function manually to see the error

-- Get the most recent project details
SELECT 
  id,
  name,
  owner_id
FROM public.projects
ORDER BY created_at DESC
LIMIT 1;

-- Try to manually insert a channel for this project
-- Replace the values below with the actual project id, name, and owner_id from above
DO $$
DECLARE
  v_project_id UUID := 'YOUR_PROJECT_ID_HERE'; -- Replace with actual project ID
  v_project_name TEXT := 'test 2';
  v_owner_id UUID := 'YOUR_OWNER_ID_HERE'; -- Replace with actual owner ID
  v_channel_id UUID;
BEGIN
  -- Try to create the channel
  INSERT INTO public.channels (name, description, project_id, created_by)
  VALUES (
    v_project_name,
    'Project channel for ' || v_project_name,
    v_project_id,
    v_owner_id
  )
  RETURNING id INTO v_channel_id;
  
  RAISE NOTICE 'Channel created successfully with ID: %', v_channel_id;
  
  -- Try to add the owner as a member
  INSERT INTO public.channel_members (channel_id, user_id)
  VALUES (v_channel_id, v_owner_id);
  
  RAISE NOTICE 'Owner added as member successfully';
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error occurred: %', SQLERRM;
END $$;

-- Check if it worked
SELECT COUNT(*) as total_channels FROM public.channels;
SELECT COUNT(*) as total_members FROM public.channel_members;
