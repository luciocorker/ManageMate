-- Fix Storage Policies for profile-pictures bucket
-- Run this in Supabase SQL Editor

-- First, make sure the bucket is public
UPDATE storage.buckets 
SET public = true 
WHERE name = 'profile-pictures';

-- Drop existing policies if any (to avoid conflicts)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;

-- Create new policies for profile-pictures bucket

-- 1. Allow anyone to view/download profile pictures (public read)
CREATE POLICY "profile_pictures_public_read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-pictures');

-- 2. Allow authenticated users to upload profile pictures
CREATE POLICY "profile_pictures_authenticated_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'profile-pictures');

-- 3. Allow authenticated users to update their own profile pictures
CREATE POLICY "profile_pictures_authenticated_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'profile-pictures');

-- 4. Allow authenticated users to delete their own profile pictures
CREATE POLICY "profile_pictures_authenticated_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'profile-pictures');

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'objects' AND policyname LIKE 'profile_pictures%';
