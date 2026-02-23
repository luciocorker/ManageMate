-- Add reply_to_message_id field to messages table
ALTER TABLE messages
ADD COLUMN reply_to_message_id UUID REFERENCES messages(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX idx_messages_reply_to ON messages(reply_to_message_id);

-- Create message_reactions table
CREATE TABLE message_reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    emoji TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(message_id, user_name, emoji)
);

-- Create indexes for better query performance
CREATE INDEX idx_reactions_message_id ON message_reactions(message_id);
CREATE INDEX idx_reactions_user_name ON message_reactions(user_name);

-- Enable Row Level Security
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;

-- Create permissive policy for development
CREATE POLICY "Allow all operations on message_reactions" ON message_reactions FOR ALL USING (true);
