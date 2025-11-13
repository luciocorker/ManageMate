-- Create channel_members table to track which users are in which channels
CREATE TABLE channel_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    added_by TEXT,
    UNIQUE(channel_id, user_name)
);

-- Create index for better query performance
CREATE INDEX idx_channel_members_channel_id ON channel_members(channel_id);
CREATE INDEX idx_channel_members_user_name ON channel_members(user_name);

-- Enable Row Level Security
ALTER TABLE channel_members ENABLE ROW LEVEL SECURITY;

-- Create permissive policy for development
CREATE POLICY "Allow all operations on channel_members" ON channel_members FOR ALL USING (true);
