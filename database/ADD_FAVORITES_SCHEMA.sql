-- Migration: Add Task and Member Favorites Support
-- Description: Extends the favorites system to support tasks and team members in addition to projects
-- Date: 2025-11-14

-- =====================================================
-- OPTION 1: Extend existing favorites table (Recommended)
-- This approach adds nullable columns to the existing favorites table
-- Allows one row per favorite item with a check constraint
-- =====================================================

-- First, make project_id nullable (it was probably NOT NULL before)
ALTER TABLE favorites
ALTER COLUMN project_id DROP NOT NULL;

-- Add new columns to favorites table (only if they don't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'favorites' AND column_name = 'task_id'
  ) THEN
    ALTER TABLE favorites
    ADD COLUMN task_id UUID REFERENCES tasks(id) ON DELETE CASCADE;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'favorites' AND column_name = 'member_id'
  ) THEN
    ALTER TABLE favorites
    ADD COLUMN member_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add check constraint to ensure only one ID is set per row
-- Each favorite must be either a project, task, OR member (not multiple)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'favorites_single_item_check'
  ) THEN
    ALTER TABLE favorites
    ADD CONSTRAINT favorites_single_item_check 
    CHECK (
      (project_id IS NOT NULL AND task_id IS NULL AND member_id IS NULL) OR
      (project_id IS NULL AND task_id IS NOT NULL AND member_id IS NULL) OR
      (project_id IS NULL AND task_id IS NULL AND member_id IS NOT NULL)
    );
  END IF;
END $$;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_favorites_task_id ON favorites(task_id) WHERE task_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_favorites_member_id ON favorites(member_id) WHERE member_id IS NOT NULL;

-- Update the unique constraint to handle all three types
-- First, drop the old constraint if it exists
ALTER TABLE favorites DROP CONSTRAINT IF EXISTS favorites_user_id_project_id_key;

-- Add new unique constraints for each type
DROP INDEX IF EXISTS idx_favorites_user_project;
CREATE UNIQUE INDEX idx_favorites_user_project ON favorites(user_id, project_id) 
  WHERE project_id IS NOT NULL;
  
DROP INDEX IF EXISTS idx_favorites_user_task;
CREATE UNIQUE INDEX idx_favorites_user_task ON favorites(user_id, task_id) 
  WHERE task_id IS NOT NULL;
  
DROP INDEX IF EXISTS idx_favorites_user_member;
CREATE UNIQUE INDEX idx_favorites_user_member ON favorites(user_id, member_id) 
  WHERE member_id IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN favorites.task_id IS 'Reference to favorited task (mutually exclusive with project_id and member_id)';
COMMENT ON COLUMN favorites.member_id IS 'Reference to favorited team member (mutually exclusive with project_id and task_id)';

-- =====================================================
-- OPTION 2: Separate tables (Alternative approach)
-- Uncomment the section below if you prefer separate tables
-- This approach keeps favorites separate by type
-- =====================================================

/*
-- Create favorite_tasks table
CREATE TABLE favorite_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id, task_id)
);

-- Create favorite_members table
CREATE TABLE favorite_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id, member_id),
  CHECK(user_id != member_id) -- Prevent users from favoriting themselves
);

-- Add indexes
CREATE INDEX idx_favorite_tasks_user_id ON favorite_tasks(user_id);
CREATE INDEX idx_favorite_tasks_task_id ON favorite_tasks(task_id);
CREATE INDEX idx_favorite_members_user_id ON favorite_members(user_id);
CREATE INDEX idx_favorite_members_member_id ON favorite_members(member_id);

-- Enable Row Level Security
ALTER TABLE favorite_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorite_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for favorite_tasks
CREATE POLICY "Users can view their own favorite tasks"
  ON favorite_tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own favorite tasks"
  ON favorite_tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorite tasks"
  ON favorite_tasks FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for favorite_members
CREATE POLICY "Users can view their own favorite members"
  ON favorite_members FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own favorite members"
  ON favorite_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorite members"
  ON favorite_members FOR DELETE
  USING (auth.uid() = user_id);

-- Add comments
COMMENT ON TABLE favorite_tasks IS 'Stores user favorite tasks for quick access';
COMMENT ON TABLE favorite_members IS 'Stores user favorite team members for quick collaboration';
*/

-- =====================================================
-- Verification Queries
-- Run these after migration to verify everything works
-- =====================================================

-- Check the structure of the favorites table
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'favorites';

-- Test inserting a task favorite
-- INSERT INTO favorites (user_id, task_id) 
-- VALUES (auth.uid(), 'your-task-id-here');

-- Test inserting a member favorite
-- INSERT INTO favorites (user_id, member_id) 
-- VALUES (auth.uid(), 'their-user-id-here');

-- Query all favorites for current user
-- SELECT 
--   f.*,
--   p.name as project_name,
--   t.title as task_title,
--   prof.email as member_email
-- FROM favorites f
-- LEFT JOIN projects p ON f.project_id = p.id
-- LEFT JOIN tasks t ON f.task_id = t.id
-- LEFT JOIN profiles prof ON f.member_id = prof.id
-- WHERE f.user_id = auth.uid();
