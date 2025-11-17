-- Add existing project owners and members to their project channels
-- This fixes channels that were created before members were added

-- Step 1: Add all project owners to their project channels
INSERT INTO public.channel_members (channel_id, user_id)
SELECT 
  c.id as channel_id,
  p.owner_id as user_id
FROM public.channels c
INNER JOIN public.projects p ON c.project_id = p.id
WHERE c.project_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.channel_members cm
    WHERE cm.channel_id = c.id AND cm.user_id = p.owner_id
  );

-- Step 2: Add all project members to their project channels
INSERT INTO public.channel_members (channel_id, user_id)
SELECT DISTINCT
  c.id as channel_id,
  pm.user_id as user_id
FROM public.channels c
INNER JOIN public.projects p ON c.project_id = p.id
INNER JOIN public.project_members pm ON pm.project_id = p.id
WHERE c.project_id IS NOT NULL
  AND pm.user_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.channel_members cm
    WHERE cm.channel_id = c.id AND cm.user_id = pm.user_id
  );

-- Verify: Show all channel memberships
SELECT 
  c.name as channel_name,
  p.name as project_name,
  u.email as member_email,
  CASE 
    WHEN p.owner_id = u.id THEN 'Owner'
    ELSE 'Member'
  END as role
FROM public.channel_members cm
INNER JOIN public.channels c ON cm.channel_id = c.id
LEFT JOIN public.projects p ON c.project_id = p.id
LEFT JOIN public.profiles u ON cm.user_id = u.id
WHERE c.project_id IS NOT NULL
ORDER BY c.name, role;
