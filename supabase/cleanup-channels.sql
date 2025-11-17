-- Clean up orphaned channels and start fresh

-- Step 1: See which channels have no project_id
SELECT 
  id,
  name,
  project_id,
  created_by,
  created_at
FROM public.channels
WHERE project_id IS NULL;

-- Step 2: See which channels ARE linked to projects
SELECT 
  c.id,
  c.name as channel_name,
  c.project_id,
  p.name as project_name
FROM public.channels c
INNER JOIN public.projects p ON c.project_id = p.id;

-- Step 3: Delete all orphaned channels (channels with no project link)
DELETE FROM public.channels WHERE project_id IS NULL;

-- Step 4: Verify what's left
SELECT COUNT(*) as remaining_channels FROM public.channels;
