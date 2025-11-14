-- Check if channels table has all required columns for project integration

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'channels'
ORDER BY ordinal_position;

-- If project_id, description, created_by, or updated_at are missing, run this:
-- ALTER TABLE public.channels ADD COLUMN project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE;
-- ALTER TABLE public.channels ADD COLUMN description TEXT;
-- ALTER TABLE public.channels ADD COLUMN created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
-- ALTER TABLE public.channels ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
