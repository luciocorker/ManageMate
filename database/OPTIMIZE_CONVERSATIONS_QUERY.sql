-- Optimize Direct Message Conversations Query
-- This function retrieves conversation list much faster than client-side processing

CREATE OR REPLACE FUNCTION get_conversation_list(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  last_message TEXT,
  last_message_time TIMESTAMP WITH TIME ZONE,
  last_message_sender_id UUID,
  unread_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH conversation_partners AS (
    -- Get distinct conversation partners
    SELECT DISTINCT
      CASE 
        WHEN dm.sender_id = p_user_id THEN dm.receiver_id
        ELSE dm.sender_id
      END AS partner_id
    FROM direct_messages dm
    WHERE dm.sender_id = p_user_id OR dm.receiver_id = p_user_id
  ),
  latest_messages AS (
    -- Get the latest message for each partner
    SELECT DISTINCT ON (
      CASE 
        WHEN dm.sender_id = p_user_id THEN dm.receiver_id
        ELSE dm.sender_id
      END
    )
      CASE 
        WHEN dm.sender_id = p_user_id THEN dm.receiver_id
        ELSE dm.sender_id
      END AS partner_id,
      dm.content AS last_message,
      dm.created_at AS last_message_time,
      dm.sender_id AS last_message_sender_id
    FROM direct_messages dm
    WHERE dm.sender_id = p_user_id OR dm.receiver_id = p_user_id
    ORDER BY 
      CASE 
        WHEN dm.sender_id = p_user_id THEN dm.receiver_id
        ELSE dm.sender_id
      END,
      dm.created_at DESC
  ),
  unread_counts AS (
    -- Count unread messages from each partner
    SELECT 
      dm.sender_id AS partner_id,
      COUNT(*) AS unread_count
    FROM direct_messages dm
    WHERE dm.receiver_id = p_user_id 
      AND dm.read = FALSE
    GROUP BY dm.sender_id
  )
  SELECT 
    p.id,
    p.full_name,
    p.email,
    p.avatar_url,
    lm.last_message,
    lm.last_message_time,
    lm.last_message_sender_id,
    COALESCE(uc.unread_count, 0) AS unread_count
  FROM conversation_partners cp
  JOIN profiles p ON p.id = cp.partner_id
  JOIN latest_messages lm ON lm.partner_id = cp.partner_id
  LEFT JOIN unread_counts uc ON uc.partner_id = cp.partner_id
  ORDER BY lm.last_message_time DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_conversation_list(UUID) TO authenticated;

-- Add comment
COMMENT ON FUNCTION get_conversation_list IS 'Efficiently retrieves conversation list with last message and unread count for a user';

-- Test query (uncomment to test after running)
-- SELECT * FROM get_conversation_list(auth.uid());
