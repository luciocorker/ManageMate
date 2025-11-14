-- Fix for the assigned_to field error in task triggers
-- Run this in your Supabase SQL Editor

-- First, let's drop any existing triggers that might reference assigned_to
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT trigger_name, event_object_table 
              FROM information_schema.triggers 
              WHERE event_object_table = 'tasks') 
    LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || r.trigger_name || ' ON ' || r.event_object_table || ' CASCADE';
    END LOOP;
END $$;

-- Drop the trigger function if it exists
DROP FUNCTION IF EXISTS handle_task_notification CASCADE;
DROP FUNCTION IF EXISTS notify_task_assignment CASCADE;
DROP FUNCTION IF EXISTS update_task_timestamp CASCADE;

-- Create a simple updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add the updated_at trigger back
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Verify the tasks table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'tasks'
ORDER BY ordinal_position;
