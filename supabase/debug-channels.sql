-- Debug: Check if project channels are being created

-- 1. Check all channels
SELECT 
  id,
  name,
  description,
  project_id,
  created_by,
  created_at
FROM public.channels
ORDER BY created_at DESC;

-- 2. Check which projects exist
SELECT 
  id,
  name,
  owner_id,
  created_at
FROM public.projects
ORDER BY created_at DESC
LIMIT 5;

-- 3. Check if there are any channels linked to projects
SELECT 
  c.name as channel_name,
  c.project_id,
  p.name as project_name,
  p.owner_id
FROM public.channels c
LEFT JOIN public.projects p ON c.project_id = p.id
WHERE c.project_id IS NOT NULL;

-- 4. Check channel members
SELECT 
  cm.channel_id,
  c.name as channel_name,
  cm.user_id,
  u.email as user_email
FROM public.channel_members cm
LEFT JOIN public.channels c ON cm.channel_id = c.id
LEFT JOIN public.profiles u ON cm.user_id = u.id
ORDER BY c.created_at DESC;

-- 5. Check if triggers are still active
SELECT 
  trigger_name,
  event_object_table,
  action_timing,
  event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name IN ('on_project_created', 'on_project_member_added', 'on_project_member_removed');
