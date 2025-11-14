-- Comprehensive diagnostic

-- 1. Show all projects with their owners
SELECT 
  p.id as project_id,
  p.name as project_name,
  p.owner_id,
  u.email as owner_email
FROM public.projects p
LEFT JOIN public.profiles u ON p.owner_id = u.id
ORDER BY p.created_at DESC;

-- 2. Show all channels with their project links
SELECT 
  c.id as channel_id,
  c.name as channel_name,
  c.project_id,
  p.name as project_name,
  c.created_by,
  u.email as created_by_email
FROM public.channels c
LEFT JOIN public.projects p ON c.project_id = p.id
LEFT JOIN public.profiles u ON c.created_by = u.id
ORDER BY c.created_at DESC;

-- 3. Show all channel members (if any)
SELECT 
  cm.channel_id,
  c.name as channel_name,
  cm.user_id,
  u.email as member_email
FROM public.channel_members cm
LEFT JOIN public.channels c ON cm.channel_id = c.id
LEFT JOIN public.profiles u ON cm.user_id = u.id;

-- 4. Count everything
SELECT 
  (SELECT COUNT(*) FROM public.projects) as total_projects,
  (SELECT COUNT(*) FROM public.channels) as total_channels,
  (SELECT COUNT(*) FROM public.channel_members) as total_memberships,
  (SELECT COUNT(*) FROM public.profiles) as total_users;
