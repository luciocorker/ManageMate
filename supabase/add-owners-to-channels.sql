-- Manually add all project owners to their channels
-- Since the triggers didn't work, we'll do it manually

-- First, let's see what we're working with
SELECT 
  c.id as channel_id,
  c.name as channel_name,
  c.project_id,
  p.owner_id,
  u.email as owner_email
FROM public.channels c
LEFT JOIN public.projects p ON c.project_id = p.id
LEFT JOIN public.profiles u ON p.owner_id = u.id
WHERE c.project_id IS NOT NULL;

-- Now add the owners to their channels
-- This will work for channels that are linked to projects
INSERT INTO public.channel_members (channel_id, user_id)
SELECT 
  c.id as channel_id,
  p.owner_id as user_id
FROM public.channels c
INNER JOIN public.projects p ON c.project_id = p.id
WHERE p.owner_id IS NOT NULL;

-- Verify it worked
SELECT 
  c.name as channel_name,
  u.email as member_email
FROM public.channel_members cm
INNER JOIN public.channels c ON cm.channel_id = c.id
INNER JOIN public.profiles u ON cm.user_id = u.id;
