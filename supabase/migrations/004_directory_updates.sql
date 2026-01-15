-- Add updated_by column to directory_entries
ALTER TABLE directory_entries
ADD COLUMN updated_by UUID REFERENCES users(id);

-- Create policy for updating directory entries (any authenticated user can update)
CREATE POLICY "Authenticated users can update directory" ON directory_entries
  FOR UPDATE USING (auth.role() = 'authenticated');
