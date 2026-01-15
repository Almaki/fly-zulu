-- Fix RLS infinite recursion in users table
-- The problem: SELECT policy was querying users table while being evaluated on users table

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Create a security definer function to check if user is superadmin
-- This function runs with elevated privileges and avoids RLS recursion
CREATE OR REPLACE FUNCTION is_superadmin(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_role user_role;
BEGIN
  SELECT role INTO user_role FROM users WHERE id = user_id;
  RETURN user_role = 'SUPERADMIN';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policy: Users can view their own profile
-- SUPERADMIN can view all profiles (using security definer function)
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (
    auth.uid() = id OR is_superadmin(auth.uid())
  );

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Policy: Allow new users to insert their own profile during registration
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Also fix the incidents table policy that has the same recursion issue
DROP POLICY IF EXISTS "Users can view own incidents" ON incidents;

CREATE POLICY "Users can view own incidents" ON incidents
  FOR SELECT USING (
    user_id = auth.uid() OR is_superadmin(auth.uid())
  );

-- Fix directory_entries policy
DROP POLICY IF EXISTS "Flight users can view directory" ON directory_entries;

-- Create function to check if user is FLIGHT category
CREATE OR REPLACE FUNCTION is_flight_user(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_cat user_category;
BEGIN
  SELECT categoria INTO user_cat FROM users WHERE id = user_id;
  RETURN user_cat = 'FLIGHT';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE POLICY "Flight users can view directory" ON directory_entries
  FOR SELECT USING (
    is_flight_user(auth.uid()) OR is_superadmin(auth.uid())
  );

-- Fix flights policies that also reference users table
DROP POLICY IF EXISTS "Premium users can insert flights" ON flights;
DROP POLICY IF EXISTS "Premium users can update flights" ON flights;

-- Create function to check premium status
CREATE OR REPLACE FUNCTION is_premium_user(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_tier subscription_tier;
BEGIN
  SELECT subscription_tier INTO user_tier FROM users WHERE id = user_id;
  RETURN user_tier = 'PREMIUM';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE POLICY "Premium users can insert flights" ON flights
  FOR INSERT WITH CHECK (
    is_premium_user(auth.uid()) OR is_superadmin(auth.uid())
  );

CREATE POLICY "Premium users can update flights" ON flights
  FOR UPDATE USING (
    is_premium_user(auth.uid()) OR is_superadmin(auth.uid())
  );
