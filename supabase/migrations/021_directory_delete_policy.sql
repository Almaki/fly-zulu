-- Migration: 021_directory_delete_policy
-- Description: Add DELETE policy for directory entries (SUPERADMIN only)
-- This closes a security gap where the app logic enforces SUPERADMIN-only
-- but there was no corresponding RLS policy at the database level

CREATE POLICY "SUPERADMIN can delete directory" ON directory_entries
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'SUPERADMIN'
    )
  );
