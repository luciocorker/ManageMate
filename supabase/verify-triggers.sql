-- Verify that all messaging triggers are installed

-- Check if triggers exist
SELECT 
  trigger_name,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name IN ('on_project_created', 'on_project_member_added', 'on_project_member_removed')
ORDER BY trigger_name;

-- Check if functions exist
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('create_project_channel', 'add_member_to_project_channel', 'remove_member_from_project_channel')
ORDER BY routine_name;

-- Check if channels table has required columns
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'channels'
  AND column_name IN ('project_id', 'description', 'created_by', 'updated_at')
ORDER BY column_name;
