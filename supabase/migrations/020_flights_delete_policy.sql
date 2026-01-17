-- Migration: 020_flights_delete_policy
-- Description: Allow all authenticated users to delete flights (collaborative board)

-- Add DELETE policy for flights
CREATE POLICY "flights_delete_authenticated" ON flights
  FOR DELETE
  TO authenticated
  USING (true);
