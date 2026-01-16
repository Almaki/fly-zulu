-- Migration: Add duty_sessions table for complete flight history tracking
-- This enables:
-- 1. Permanent storage of all duty sessions (for premium historical features)
-- 2. Better organization of flights by duty period
-- 3. Tracking of duty limits and compliance

-- Create duty_sessions table
CREATE TABLE IF NOT EXISTS duty_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) NOT NULL,
  local_id TEXT, -- Original IndexedDB ID for deduplication
  date DATE NOT NULL,
  duty_start TIME NOT NULL,
  duty_end TIME,
  duty_minutes INTEGER,
  duty_limit_hours DECIMAL(4,1) DEFAULT 14, -- User's configured limit for this session
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  flights_count INTEGER DEFAULT 0,
  total_flight_minutes INTEGER DEFAULT 0,
  total_block_minutes INTEGER DEFAULT 0,
  sync_status sync_status DEFAULT 'synced',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient queries
CREATE INDEX idx_duty_sessions_user ON duty_sessions(user_id);
CREATE INDEX idx_duty_sessions_date ON duty_sessions(date);
CREATE INDEX idx_duty_sessions_user_date ON duty_sessions(user_id, date);
CREATE INDEX idx_duty_sessions_local_id ON duty_sessions(local_id) WHERE local_id IS NOT NULL;

-- Apply updated_at trigger
CREATE TRIGGER update_duty_sessions_updated_at
  BEFORE UPDATE ON duty_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Enable RLS
ALTER TABLE duty_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own duty sessions
CREATE POLICY "Users can view own duty sessions" ON duty_sessions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own duty sessions" ON duty_sessions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own duty sessions" ON duty_sessions
  FOR UPDATE USING (user_id = auth.uid());

-- Add duty_session_id to pilot_logs for linking
ALTER TABLE pilot_logs
  ADD COLUMN IF NOT EXISTS duty_session_id UUID REFERENCES duty_sessions(id),
  ADD COLUMN IF NOT EXISTS local_id TEXT; -- Original IndexedDB ID for deduplication

CREATE INDEX idx_pilot_logs_duty_session ON pilot_logs(duty_session_id);
CREATE INDEX idx_pilot_logs_local_id ON pilot_logs(local_id) WHERE local_id IS NOT NULL;

-- Function to get user flight statistics (for premium features)
CREATE OR REPLACE FUNCTION get_pilot_stats(p_user_id UUID, p_days INTEGER DEFAULT 30)
RETURNS TABLE (
  total_flights BIGINT,
  total_flight_minutes BIGINT,
  total_block_minutes BIGINT,
  total_duty_sessions BIGINT,
  avg_duty_minutes NUMERIC,
  most_flown_aircraft TEXT,
  most_visited_dest TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH flight_stats AS (
    SELECT
      COUNT(*) as flights,
      COALESCE(SUM(flight_time_minutes), 0) as flight_mins,
      COALESCE(SUM(block_time_minutes), 0) as block_mins,
      aircraft_type,
      dest
    FROM pilot_logs
    WHERE user_id = p_user_id
      AND date >= CURRENT_DATE - p_days
    GROUP BY aircraft_type, dest
  ),
  duty_stats AS (
    SELECT
      COUNT(*) as sessions,
      AVG(duty_minutes) as avg_duty
    FROM duty_sessions
    WHERE user_id = p_user_id
      AND date >= CURRENT_DATE - p_days
  ),
  top_aircraft AS (
    SELECT aircraft_type
    FROM pilot_logs
    WHERE user_id = p_user_id AND date >= CURRENT_DATE - p_days
    GROUP BY aircraft_type
    ORDER BY COUNT(*) DESC
    LIMIT 1
  ),
  top_dest AS (
    SELECT dest
    FROM pilot_logs
    WHERE user_id = p_user_id AND date >= CURRENT_DATE - p_days
    GROUP BY dest
    ORDER BY COUNT(*) DESC
    LIMIT 1
  )
  SELECT
    (SELECT SUM(flights) FROM flight_stats),
    (SELECT SUM(flight_mins) FROM flight_stats),
    (SELECT SUM(block_mins) FROM flight_stats),
    (SELECT sessions FROM duty_stats),
    (SELECT avg_duty FROM duty_stats),
    (SELECT aircraft_type FROM top_aircraft),
    (SELECT dest FROM top_dest);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
