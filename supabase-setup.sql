-- Create users table in Supabase to store Firebase user information
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  firebase_uid TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  profile_picture_url TEXT,
  phone_number TEXT,
  location TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on firebase_uid for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own data
CREATE POLICY "Users can read own data" ON users
  FOR SELECT
  USING (true);

-- Create policy to allow insert (for signup)
CREATE POLICY "Allow insert for authenticated users" ON users
  FOR INSERT
  WITH CHECK (true);

-- Create policy to allow update (for email verification)
CREATE POLICY "Allow update for authenticated users" ON users
  FOR UPDATE
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- Create storage bucket for profile pictures
-- Run this in Supabase Dashboard > Storage or via SQL

-- Note: Storage buckets are typically created via the Supabase Dashboard
-- Go to Storage > Create a new bucket named "profile-pictures"
-- Set it to public if you want profile pictures to be publicly accessible

-- After creating the bucket, set up storage policies:

-- Policy to allow users to upload their own profile pictures
-- CREATE POLICY "Users can upload own profile picture"
-- ON storage.objects FOR INSERT
-- WITH CHECK (bucket_id = 'profile-pictures' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy to allow users to update their own profile pictures
-- CREATE POLICY "Users can update own profile picture"
-- ON storage.objects FOR UPDATE
-- USING (bucket_id = 'profile-pictures' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy to allow users to delete their own profile pictures
-- CREATE POLICY "Users can delete own profile picture"
-- ON storage.objects FOR DELETE
-- USING (bucket_id = 'profile-pictures' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy to allow anyone to view profile pictures (if public)
-- CREATE POLICY "Anyone can view profile pictures"
-- ON storage.objects FOR SELECT
-- USING (bucket_id = 'profile-pictures');
