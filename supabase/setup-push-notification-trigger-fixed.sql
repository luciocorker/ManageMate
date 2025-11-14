-- Fixed push notification trigger that won't break messaging

-- Create function that handles errors gracefully
CREATE OR REPLACE FUNCTION trigger_push_notification()
RETURNS TRIGGER AS $$
DECLARE
  request_id bigint;
BEGIN
  -- Try to call the Edge Function, but don't fail if it errors
  BEGIN
    SELECT extensions.http_post(
      url := 'https://xdvlkprwnnpxvpqncomn.supabase.co/functions/v1/send-push-notification',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkdmxrcHJ3bm5weHZwcW5jb21uIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc1NTE0MiwiZXhwIjoyMDc4MzMxMTQyfQ.2wEwMGYJt4lPDAIi3HoGhSsEXMZ0J4rD1TOrVmmsFtY'
      ),
      body := jsonb_build_object('notificationId', NEW.id)
    ) INTO request_id;
  EXCEPTION
    WHEN OTHERS THEN
      -- Log the error but don't stop the notification from being created
      RAISE WARNING 'Failed to send push notification: %', SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger with error handling
DROP TRIGGER IF EXISTS on_notification_created ON public.notifications;
CREATE TRIGGER on_notification_created
  AFTER INSERT ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION trigger_push_notification();

SELECT 'Push notification trigger with error handling installed!' as status;
