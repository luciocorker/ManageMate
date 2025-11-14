-- Check what priority values are allowed

SELECT 
  con.conname as constraint_name,
  pg_get_constraintdef(con.oid) as constraint_definition
FROM pg_constraint con
INNER JOIN pg_class rel ON rel.oid = con.conrelid
INNER JOIN pg_namespace nsp ON nsp.oid = connamespace
WHERE nsp.nspname = 'public'
  AND rel.relname = 'projects'
  AND con.contype = 'c';

-- Try insert with correct priority AND status values
INSERT INTO public.projects (name, description, status, priority, owner_id, progress, color)
VALUES (
  'Trigger Test Project 2',
  'Testing if trigger works',
  'Planning', -- Capitalize status
  'Medium', -- Capitalize priority
  '50b838da-779f-41ce-a17b-9e523ced9aa6',
  0,
  '#3b82f6'
)
RETURNING id, name, owner_id;

-- Check if channel was created
SELECT 
  c.id,
  c.name as channel_name,
  c.project_id,
  p.name as project_name
FROM public.channels c
INNER JOIN public.projects p ON c.project_id = p.id
WHERE p.name = 'Trigger Test Project 2';

-- Check if you were added as member
SELECT 
  cm.channel_id,
  c.name as channel_name,
  cm.user_id
FROM public.channel_members cm
INNER JOIN public.channels c ON cm.channel_id = c.id
WHERE c.name = 'Trigger Test Project 2';
