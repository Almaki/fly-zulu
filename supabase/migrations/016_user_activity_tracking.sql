-- 016_user_activity_tracking.sql
-- Add user activity tracking for admin metrics

-- Add columns for activity tracking
ALTER TABLE users
ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_location VARCHAR(100);

-- Create index for fast queries on last_seen_at
CREATE INDEX IF NOT EXISTS idx_users_last_seen ON users(last_seen_at DESC);

-- Function to update user activity
CREATE OR REPLACE FUNCTION update_user_activity(
  p_user_id UUID,
  p_location VARCHAR DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE users
  SET
    last_seen_at = NOW(),
    last_location = COALESCE(p_location, last_location)
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- View for active users (last hour)
CREATE OR REPLACE VIEW active_users_view AS
SELECT
  id,
  nombre,
  email,
  posicion,
  last_seen_at,
  last_location,
  subscription_tier
FROM users
WHERE last_seen_at >= NOW() - INTERVAL '1 hour'
ORDER BY last_seen_at DESC;

COMMENT ON COLUMN users.last_seen_at IS 'Timestamp of last user activity';
COMMENT ON COLUMN users.last_location IS 'Last known location/page of user';
COMMENT ON VIEW active_users_view IS 'Users active in the last hour';
