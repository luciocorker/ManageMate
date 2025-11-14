-- Check if the new project created a channel

-- 1. Check the newest project
SELECT 
  id,
  name,
  owner_id,
  created_at
FROM public.projects
ORDER BY created_at DESC
LIMIT 1;

-- 2. Check if a channel was created for it
SELECT 
  c.id,
  c.name as channel_name,
  c.project_id,
  c.created_by,
  c.created_at,
  p.name as project_name
FROM public.channels c
LEFT JOIN public.projects p ON c.project_id = p.id
ORDER BY c.created_at DESC;

-- 3. Check if any members were added
SELECT 
  cm.channel_id,
  c.name as channel_name,
  cm.user_id,
  u.email as member_email
FROM public.channel_members cm
LEFT JOIN public.channels c ON cm.channel_id = c.id
LEFT JOIN public.profiles u ON cm.user_id = u.id;

-- 4. Check trigger function logs (if any warnings were raised)
-- Note: Warnings only show in real-time, not stored
SELECT 
  trigger_name,
  event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name = 'on_project_created';
