-- Setup push notification system with pg_net

-- Step 1: Enable pg_net extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Step 2: Grant permissions
GRANT USAGE ON SCHEMA extensions TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA extensions TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA extensions TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA extensions TO postgres, anon, authenticated, service_role;

-- Step 3: Create function to trigger Edge Function for push notifications
CREATE OR REPLACE FUNCTION trigger_push_notification()
RETURNS TRIGGER AS $$
DECLARE
  request_id bigint;
BEGIN
  -- Call the Edge Function using pg_net
  SELECT extensions.http_post(
    url := 'https://xdvlkprwnnpxvpqncomn.supabase.co/functions/v1/send-push-notification',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkdmxrcHJ3bm5weHZwcW5jb21uIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc1NTE0MiwiZXhwIjoyMDc4MzMxMTQyfQ.2wEwMGYJt4lPDAIi3HoGhSsEXMZ0J4rD1TOrVmmsFtY'
    ),
    body := jsonb_build_object('notificationId', NEW.id)
  ) INTO request_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Create trigger to call Edge Function when notification is inserted
DROP TRIGGER IF EXISTS on_notification_created ON public.notifications;
CREATE TRIGGER on_notification_created
  AFTER INSERT ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION trigger_push_notification();

COMMENT ON FUNCTION trigger_push_notification() IS 
'Triggers push notification sending via Edge Function when a new notification is created';

SELECT 'Push notification trigger with pg_net installed successfully!' as status;
