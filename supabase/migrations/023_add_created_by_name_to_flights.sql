-- Migration: 023_add_created_by_name_to_flights
-- Description: Add created_by_name column to flights for showing contributor names

-- Add created_by_name column
ALTER TABLE flights
ADD COLUMN IF NOT EXISTS created_by_name TEXT;

-- Update existing flights to populate created_by_name from users table
UPDATE flights f
SET created_by_name = u.nombre
FROM users u
WHERE f.created_by = u.id
AND f.created_by_name IS NULL;
