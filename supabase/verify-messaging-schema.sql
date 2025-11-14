-- Verification queries for messaging schema
-- Run these in Supabase SQL Editor to verify everything is set up correctly

-- 1. Check if all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('channels', 'channel_members', 'messages', 'direct_messages')
ORDER BY table_name;

-- 2. Check if indexes exist
SELECT indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename IN ('channels', 'channel_members', 'messages', 'direct_messages')
ORDER BY indexname;

-- 3. Check if triggers exist
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND event_object_table IN ('projects', 'project_members')
  AND trigger_name IN ('on_project_created', 'on_project_member_added', 'on_project_member_removed');

-- 4. Check if trigger functions exist
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('create_project_channel', 'add_member_to_project_channel', 'remove_member_from_project_channel');

-- 5. Test if we can query channels (should return empty or existing channels)
SELECT id, name, project_id, created_by 
FROM public.channels 
LIMIT 5;

-- 6. Check RLS status
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('channels', 'channel_members', 'messages', 'direct_messages');
