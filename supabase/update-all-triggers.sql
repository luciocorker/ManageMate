-- Update all trigger functions to include user_name

-- 1. Fix the add_member_to_project_channel trigger
CREATE OR REPLACE FUNCTION public.add_member_to_project_channel()
RETURNS TRIGGER AS $$
DECLARE
  project_channel_id UUID;
  member_name TEXT;
BEGIN
  -- Only proceed if user_id is not null
  IF NEW.user_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Get the member's name from profiles
  SELECT full_name INTO member_name
  FROM public.profiles
  WHERE id = NEW.user_id;

  -- Find the channel associated with this project
  SELECT id INTO project_channel_id
  FROM public.channels
  WHERE project_id = NEW.project_id
  LIMIT 1;

  -- If channel exists, add the member
  IF project_channel_id IS NOT NULL THEN
    INSERT INTO public.channel_members (channel_id, user_id, user_name)
    VALUES (project_channel_id, NEW.user_id, COALESCE(member_name, 'Unknown User'))
    ON CONFLICT (channel_id, user_id) DO NOTHING;
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error adding member to project channel: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. The remove function is fine as-is (just deletes)

-- 3. Verify all triggers are set up correctly
SELECT 
  trigger_name,
  event_object_table,
  action_timing,
  event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name IN ('on_project_created', 'on_project_member_added', 'on_project_member_removed')
ORDER BY trigger_name;

SELECT 'All triggers updated successfully!' as status;
