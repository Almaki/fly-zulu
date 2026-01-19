-- Migration: Add geolocation tracking for users
-- Description: Store latitude/longitude for live map in admin panel

-- Add columns for geolocation
ALTER TABLE users
ADD COLUMN IF NOT EXISTS last_latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS last_longitude DECIMAL(11, 8);

-- Create index for spatial queries (can use for proximity later)
CREATE INDEX IF NOT EXISTS idx_users_geolocation ON users(last_latitude, last_longitude)
WHERE last_latitude IS NOT NULL AND last_longitude IS NOT NULL;

-- Update the activity tracking function to include geolocation
CREATE OR REPLACE FUNCTION update_user_activity(
  p_user_id UUID,
  p_location VARCHAR DEFAULT NULL,
  p_latitude DECIMAL DEFAULT NULL,
  p_longitude DECIMAL DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE users
  SET
    last_seen_at = NOW(),
    last_location = COALESCE(p_location, last_location),
    last_latitude = COALESCE(p_latitude, last_latitude),
    last_longitude = COALESCE(p_longitude, last_longitude)
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update active users view to include coordinates
CREATE OR REPLACE VIEW active_users_view AS
SELECT
  id,
  nombre,
  email,
  posicion,
  last_seen_at,
  last_location,
  last_latitude,
  last_longitude,
  subscription_tier
FROM users
WHERE last_seen_at >= NOW() - INTERVAL '1 hour'
ORDER BY last_seen_at DESC;

COMMENT ON COLUMN users.last_latitude IS 'Last known latitude coordinate';
COMMENT ON COLUMN users.last_longitude IS 'Last known longitude coordinate';
