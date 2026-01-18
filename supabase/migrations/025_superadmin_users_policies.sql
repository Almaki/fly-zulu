-- Migration: Add SUPERADMIN policies for users table management
-- Description: Allow SUPERADMIN to update and delete any user profile

-- Drop existing update policy and recreate with SUPERADMIN access
DROP POLICY IF EXISTS "Users can update own profile" ON users;

CREATE POLICY "Users can update own profile or SUPERADMIN can update any" ON users
  FOR UPDATE USING (
    auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'SUPERADMIN'
    )
  );

-- Add DELETE policy for SUPERADMIN
DROP POLICY IF EXISTS "SUPERADMIN can delete users" ON users;

CREATE POLICY "SUPERADMIN can delete users" ON users
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'SUPERADMIN'
    )
  );
