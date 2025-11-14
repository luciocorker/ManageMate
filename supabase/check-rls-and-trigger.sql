-- Check RLS status

-- 1. Check if RLS is enabled on channels and channel_members
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('channels', 'channel_members');

-- 2. If RLS is enabled, check policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('channels', 'channel_members');

-- 3. Let's test the trigger function directly
SELECT create_project_channel() FROM public.projects WHERE name = 'Trigger Test Project 2';
