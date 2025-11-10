-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create friends table
CREATE TABLE friends (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_name TEXT NOT NULL,
    friend_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_name, friend_name)
);

-- Create channels table
CREATE TABLE channels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
    sender_name TEXT NOT NULL,
    receiver_name TEXT,
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CHECK (
        (channel_id IS NOT NULL AND receiver_name IS NULL) OR
        (channel_id IS NULL AND receiver_name IS NOT NULL)
    )
);

-- Create indexes for better query performance
CREATE INDEX idx_friends_user_name ON friends(user_name);
CREATE INDEX idx_friends_friend_name ON friends(friend_name);
CREATE INDEX idx_messages_channel_id ON messages(channel_id);
CREATE INDEX idx_messages_sender_receiver ON messages(sender_name, receiver_name);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- Enable Row Level Security (RLS) - Optional for now
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for development (you can restrict these later)
CREATE POLICY "Allow all operations on friends" ON friends FOR ALL USING (true);
CREATE POLICY "Allow all operations on channels" ON channels FOR ALL USING (true);
CREATE POLICY "Allow all operations on messages" ON messages FOR ALL USING (true);
