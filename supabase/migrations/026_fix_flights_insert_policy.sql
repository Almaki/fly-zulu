-- Migration: Fix flights INSERT policy for all authenticated users
-- Description: Ensure ALL authenticated users can add flights (collaborative board)
-- This fixes the RLS error: "new row violates row-level security policy for table flights"

-- Drop ALL existing insert policies on flights to avoid conflicts
DROP POLICY IF EXISTS "Premium users can insert flights" ON flights;
DROP POLICY IF EXISTS "flights_insert_premium" ON flights;
DROP POLICY IF EXISTS "flights_insert_authenticated" ON flights;

-- Create new policy allowing ALL authenticated users to insert flights
CREATE POLICY "flights_insert_all_authenticated" ON flights
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Also ensure update policy allows all authenticated users
DROP POLICY IF EXISTS "Premium users can update flights" ON flights;
DROP POLICY IF EXISTS "flights_update_premium" ON flights;
DROP POLICY IF EXISTS "flights_update_authenticated" ON flights;

CREATE POLICY "flights_update_all_authenticated" ON flights
  FOR UPDATE
  TO authenticated
  USING (true);

-- Ensure delete policy exists for all authenticated users
DROP POLICY IF EXISTS "flights_delete_authenticated" ON flights;

CREATE POLICY "flights_delete_all_authenticated" ON flights
  FOR DELETE
  TO authenticated
  USING (true);
