-- Check why the trigger might be failing

-- 1. Check channels table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'channels'
ORDER BY ordinal_position;

-- 2. Check if there's a NOT NULL constraint on a missing field
SELECT 
  column_name,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'channels'
  AND is_nullable = 'NO';

-- 3. Try to insert a channel manually with minimal fields
INSERT INTO public.channels (name)
VALUES ('Manual Test Channel')
RETURNING id, name, project_id, created_by, created_at;

-- 4. Check if it worked
SELECT * FROM public.channels ORDER BY created_at DESC LIMIT 1;
