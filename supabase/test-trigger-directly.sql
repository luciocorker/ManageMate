-- Verify trigger setup and test it

-- 1. Check if trigger exists and is enabled
SELECT 
  trigger_name,
  event_object_table,
  action_timing,
  event_manipulation,
  action_statement,
  action_orientation,
  action_condition
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND event_object_table = 'projects';

-- 2. Check if the trigger function exists
SELECT 
  routine_name,
  routine_type,
  routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'create_project_channel';

-- 3. Manually test the trigger by inserting a test project
-- This will show if the trigger fires
INSERT INTO public.projects (name, description, status, priority, owner_id, progress, color)
VALUES (
  'Trigger Test Project',
  'Testing if trigger works',
  'planning',
  'medium',
  '50b838da-779f-41ce-a17b-9e523ced9aa6', -- Your user ID
  0,
  '#3b82f6'
)
RETURNING id, name, owner_id;

-- 4. Check if a channel was created for it
SELECT 
  c.id,
  c.name as channel_name,
  c.project_id,
  p.name as project_name
FROM public.channels c
INNER JOIN public.projects p ON c.project_id = p.id
WHERE p.name = 'Trigger Test Project';

-- 5. Check if you were added as a member
SELECT 
  cm.*,
  c.name as channel_name
FROM public.channel_members cm
INNER JOIN public.channels c ON cm.channel_id = c.id
WHERE c.name = 'Trigger Test Project';
