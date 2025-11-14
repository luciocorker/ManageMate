-- Check current schema structure
-- Run this first to see what we're working with

-- Check channel_members table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'channel_members'
ORDER BY ordinal_position;

-- Check channels table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'channels'
ORDER BY ordinal_position;

-- Check messages table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'messages'
ORDER BY ordinal_position;

-- Check if direct_messages exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'direct_messages'
ORDER BY ordinal_position;
