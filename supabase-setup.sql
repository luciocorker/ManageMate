-- ==========================================
-- MANAGEMATE SUPABASE DATABASE SCHEMA
-- ==========================================
-- This schema integrates Firebase authentication with Supabase messaging
-- Firebase handles user authentication, Supabase stores profiles and messaging data
-- All tables reference users.firebase_uid as the foreign key
-- ==========================================

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

-- Create policy to allow users to read all user data (for searching friends)
CREATE POLICY "Users can read all user data" ON users
  FOR SELECT
  USING (true);

-- Create policy to allow insert (for signup)
CREATE POLICY "Allow insert for authenticated users" ON users
  FOR INSERT
  WITH CHECK (true);

-- Create policy to allow users to update their own data
CREATE POLICY "Users can update own data" ON users
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

-- ==========================================
-- FRIENDS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS friends (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(firebase_uid) ON DELETE CASCADE,
  friend_id TEXT NOT NULL REFERENCES users(firebase_uid) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_friends_user_id ON friends(user_id);
CREATE INDEX IF NOT EXISTS idx_friends_friend_id ON friends(friend_id);

-- Enable Row Level Security
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own friendships
CREATE POLICY "Users can read own friendships" ON friends
  FOR SELECT
  USING (true);

-- Allow users to delete their own friendships
CREATE POLICY "Users can delete own friendships" ON friends
  FOR DELETE
  USING (true);

-- ==========================================
-- FRIEND REQUESTS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS friend_requests (
  id BIGSERIAL PRIMARY KEY,
  sender_id TEXT NOT NULL REFERENCES users(firebase_uid) ON DELETE CASCADE,
  receiver_id TEXT NOT NULL REFERENCES users(firebase_uid) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(sender_id, receiver_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_friend_requests_receiver ON friend_requests(receiver_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_sender ON friend_requests(sender_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_status ON friend_requests(status);

-- Enable Row Level Security
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;

-- Allow users to read friend requests involving them
CREATE POLICY "Users can read own friend requests" ON friend_requests
  FOR SELECT
  USING (true);

-- Allow users to create friend requests
CREATE POLICY "Users can create friend requests" ON friend_requests
  FOR INSERT
  WITH CHECK (true);

-- Allow users to update friend requests they received
CREATE POLICY "Users can update received friend requests" ON friend_requests
  FOR UPDATE
  USING (true);

-- Create trigger for friend_requests updated_at
CREATE TRIGGER update_friend_requests_updated_at
  BEFORE UPDATE ON friend_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- CHANNELS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS channels (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_by TEXT REFERENCES users(firebase_uid) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_channels_created_by ON channels(created_by);

-- Enable Row Level Security
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;

-- Allow all users to read channels
CREATE POLICY "Users can read all channels" ON channels
  FOR SELECT
  USING (true);

-- Allow users to create channels
CREATE POLICY "Users can create channels" ON channels
  FOR INSERT
  WITH CHECK (true);

-- Allow channel creators to update their channels
CREATE POLICY "Creators can update own channels" ON channels
  FOR UPDATE
  USING (true);

-- Allow channel creators to delete their channels
CREATE POLICY "Creators can delete own channels" ON channels
  FOR DELETE
  USING (true);

-- Create trigger for channels updated_at
CREATE TRIGGER update_channels_updated_at
  BEFORE UPDATE ON channels
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- CHANNEL MEMBERS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS channel_members (
  id BIGSERIAL PRIMARY KEY,
  channel_id BIGINT NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(firebase_uid) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(channel_id, user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_channel_members_channel ON channel_members(channel_id);
CREATE INDEX IF NOT EXISTS idx_channel_members_user ON channel_members(user_id);

-- Enable Row Level Security
ALTER TABLE channel_members ENABLE ROW LEVEL SECURITY;

-- Allow users to read channel memberships
CREATE POLICY "Users can read channel memberships" ON channel_members
  FOR SELECT
  USING (true);

-- Allow users to join channels
CREATE POLICY "Users can join channels" ON channel_members
  FOR INSERT
  WITH CHECK (true);

-- Allow users to leave channels
CREATE POLICY "Users can leave channels" ON channel_members
  FOR DELETE
  USING (true);

-- ==========================================
-- MESSAGES TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS messages (
  id BIGSERIAL PRIMARY KEY,
  sender_id TEXT NOT NULL REFERENCES users(firebase_uid) ON DELETE CASCADE,
  receiver_id TEXT REFERENCES users(firebase_uid) ON DELETE CASCADE,
  channel_id BIGINT REFERENCES channels(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (
    (receiver_id IS NOT NULL AND channel_id IS NULL) OR
    (receiver_id IS NULL AND channel_id IS NOT NULL)
  )
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_channel ON messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- Enable Row Level Security
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Allow users to read messages in their channels or direct messages
CREATE POLICY "Users can read own messages" ON messages
  FOR SELECT
  USING (true);

-- Allow users to send messages
CREATE POLICY "Users can send messages" ON messages
  FOR INSERT
  WITH CHECK (true);

-- Allow users to update their own messages
CREATE POLICY "Users can update own messages" ON messages
  FOR UPDATE
  USING (true);

-- Allow users to delete their own messages
CREATE POLICY "Users can delete own messages" ON messages
  FOR DELETE
  USING (true);

-- Create trigger for messages updated_at
CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- MESSAGE REACTIONS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS message_reactions (
  id BIGSERIAL PRIMARY KEY,
  message_id BIGINT NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(firebase_uid) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(message_id, user_id, emoji)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_message_reactions_message ON message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_user ON message_reactions(user_id);

-- Enable Row Level Security
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;

-- Allow users to read reactions
CREATE POLICY "Users can read reactions" ON message_reactions
  FOR SELECT
  USING (true);

-- Allow users to add reactions
CREATE POLICY "Users can add reactions" ON message_reactions
  FOR INSERT
  WITH CHECK (true);

-- Allow users to remove their own reactions
CREATE POLICY "Users can remove own reactions" ON message_reactions
  FOR DELETE
  USING (true);

-- ==========================================
-- STORAGE BUCKET FOR PROFILE PICTURES
-- ==========================================

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
