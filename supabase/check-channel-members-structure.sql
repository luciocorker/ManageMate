-- Check channel_members table structure and constraints

-- 1. Check the table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'channel_members'
ORDER BY ordinal_position;

-- 2. Check constraints and indexes
SELECT
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema = 'public'
  AND tc.table_name = 'channel_members';

-- 3. Try a simple manual insert to see the exact error
-- First, get valid IDs
SELECT 'Step 1: Get a channel ID' as step;
SELECT id as channel_id FROM public.channels LIMIT 1;

SELECT 'Step 2: Get a user ID' as step;
SELECT id as user_id FROM public.profiles LIMIT 1;

-- Now try to insert (replace with actual IDs)
-- INSERT INTO public.channel_members (channel_id, user_id) 
-- VALUES ('CHANNEL_ID_HERE', 'USER_ID_HERE');
