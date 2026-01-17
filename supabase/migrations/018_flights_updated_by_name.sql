-- 018_flights_updated_by_name.sql
-- Add updated_by_name to flights table for collaborative tracking

-- Add column to track who last updated the flight
ALTER TABLE flights
ADD COLUMN IF NOT EXISTS updated_by_name TEXT;

-- Create index for sorting by last update
CREATE INDEX IF NOT EXISTS idx_flights_updated_at ON flights(updated_at DESC);

-- Comment for documentation
COMMENT ON COLUMN flights.updated_by_name IS 'Name of the user who last updated this flight';
