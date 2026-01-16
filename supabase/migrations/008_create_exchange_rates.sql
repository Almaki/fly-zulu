-- Create exchange_rates table for collaborative exchange rate tracking
CREATE TABLE IF NOT EXISTS exchange_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  airport_code VARCHAR(3) NOT NULL,
  location VARCHAR(100) NOT NULL,
  rate DECIMAL(10, 2) NOT NULL DEFAULT 0,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Unique constraint per airport and location
  CONSTRAINT unique_airport_location UNIQUE (airport_code, location)
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_exchange_rates_airport ON exchange_rates(airport_code);

-- Enable RLS
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read exchange rates
CREATE POLICY "Anyone can read exchange rates"
ON exchange_rates FOR SELECT
TO public
USING (true);

-- Allow authenticated users to insert/update exchange rates
CREATE POLICY "Authenticated users can insert exchange rates"
ON exchange_rates FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update exchange rates"
ON exchange_rates FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Insert default data for MEX and TIJ
INSERT INTO exchange_rates (airport_code, location, rate) VALUES
  ('MEX', 'Terminal', 0),
  ('TIJ', 'Sala de espera', 0),
  ('TIJ', 'Entrada aeropuerto', 0)
ON CONFLICT (airport_code, location) DO NOTHING;

-- Add comment
COMMENT ON TABLE exchange_rates IS 'Collaborative exchange rates reported by users at airports';
