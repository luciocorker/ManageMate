-- Simple check: Are you a member of any channels now?

-- Replace 'your-email@example.com' with your actual email from the app
SELECT 
  c.id,
  c.name as channel_name,
  c.description,
  c.project_id,
  'You are a member' as status
FROM public.channel_members cm
INNER JOIN public.channels c ON cm.channel_id = c.id
INNER JOIN public.profiles u ON cm.user_id = u.id
WHERE u.email = 'your-email@example.com'  -- Replace with your email
ORDER BY c.created_at DESC;

-- If above returns 0 rows, check this:
-- Are there any channel members at all?
SELECT COUNT(*) as total_channel_memberships
FROM public.channel_members;

-- Are there any channels at all?
SELECT COUNT(*) as total_channels
FROM public.channels;
