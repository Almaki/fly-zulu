-- Migration: 022_add_lounge_type_to_forum
-- Description: Add lounge_type column to forum_posts for team-specific lounges

-- Add lounge_type enum type
DO $$ BEGIN
  CREATE TYPE lounge_type AS ENUM ('CREW', 'OPS', 'TRAFICO', 'MANTTO');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Add lounge_type column to forum_posts (default to 'CREW' for existing posts)
ALTER TABLE forum_posts
ADD COLUMN IF NOT EXISTS lounge_type lounge_type DEFAULT 'CREW' NOT NULL;

-- Create index for faster queries by lounge_type
CREATE INDEX IF NOT EXISTS idx_forum_posts_lounge_type ON forum_posts(lounge_type);

-- Update RLS policies to consider lounge_type access
-- Users can only see posts in lounges they have access to
DROP POLICY IF EXISTS "Users can view posts in their lounge" ON forum_posts;
CREATE POLICY "Users can view posts in their lounge" ON forum_posts
  FOR SELECT
  USING (
    -- SUPERADMIN/ADMIN can see all
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'SUPERADMIN'
    )
    OR
    -- CREW lounge: PILOT and FA
    (lounge_type = 'CREW' AND EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND posicion IN ('PILOT', 'FA')
    ))
    OR
    -- OPS lounge
    (lounge_type = 'OPS' AND EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND posicion = 'OPS'
    ))
    OR
    -- TRAFICO lounge
    (lounge_type = 'TRAFICO' AND EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND posicion = 'TRAFICO'
    ))
    OR
    -- MANTTO lounge
    (lounge_type = 'MANTTO' AND EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND posicion = 'MANTTO'
    ))
  );

-- Users can only create posts in lounges they have access to
DROP POLICY IF EXISTS "Users can create posts in their lounge" ON forum_posts;
CREATE POLICY "Users can create posts in their lounge" ON forum_posts
  FOR INSERT
  WITH CHECK (
    auth.uid() = author_id
    AND (
      -- SUPERADMIN/ADMIN can post anywhere
      EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid()
        AND role = 'SUPERADMIN'
      )
      OR
      -- CREW lounge: PILOT and FA
      (lounge_type = 'CREW' AND EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid()
        AND posicion IN ('PILOT', 'FA')
      ))
      OR
      -- OPS lounge
      (lounge_type = 'OPS' AND EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid()
        AND posicion = 'OPS'
      ))
      OR
      -- TRAFICO lounge
      (lounge_type = 'TRAFICO' AND EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid()
        AND posicion = 'TRAFICO'
      ))
      OR
      -- MANTTO lounge
      (lounge_type = 'MANTTO' AND EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid()
        AND posicion = 'MANTTO'
      ))
    )
  );
