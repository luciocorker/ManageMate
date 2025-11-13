-- Fix Storage Policies - Version 2 (More Permissive)
-- Run this in Supabase SQL Editor

-- Make bucket public
UPDATE storage.buckets 
SET public = true 
WHERE name = 'profile-pictures';

-- Drop all existing policies for storage.objects related to profile-pictures
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%profile%') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON storage.objects';
    END LOOP;
END $$;

-- Create permissive policies that allow both authenticated AND anon users

-- 1. Allow EVERYONE (public + authenticated) to read
CREATE POLICY "profile_pictures_select"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-pictures');

-- 2. Allow EVERYONE to insert (for testing, can restrict later)
CREATE POLICY "profile_pictures_insert"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'profile-pictures');

-- 3. Allow EVERYONE to update
CREATE POLICY "profile_pictures_update"
ON storage.objects FOR UPDATE
USING (bucket_id = 'profile-pictures');

-- 4. Allow EVERYONE to delete
CREATE POLICY "profile_pictures_delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'profile-pictures');

-- Verify policies
SELECT policyname, cmd, roles 
FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE 'profile_pictures%';
