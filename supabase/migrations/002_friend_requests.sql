-- Add friend_requests table for managing friend requests
CREATE TABLE friend_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_name TEXT NOT NULL,
    sender_email TEXT NOT NULL,
    receiver_name TEXT NOT NULL,
    receiver_email TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, accepted, rejected
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(sender_name, receiver_name)
);

-- Create indexes for better query performance
CREATE INDEX idx_friend_requests_receiver_name ON friend_requests(receiver_name);
CREATE INDEX idx_friend_requests_sender_name ON friend_requests(sender_name);
CREATE INDEX idx_friend_requests_status ON friend_requests(status);

-- Enable Row Level Security
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;

-- Create permissive policy for development
CREATE POLICY "Allow all operations on friend_requests" ON friend_requests FOR ALL USING (true);

-- Add a trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_friend_requests_updated_at BEFORE UPDATE ON friend_requests
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
