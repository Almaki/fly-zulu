-- 015_update_exchange_rates.sql
-- Update exchange_rates table to support buy/sell rates and user name tracking

-- Add new columns for buy and sell rates
ALTER TABLE exchange_rates
ADD COLUMN IF NOT EXISTS buy_rate DECIMAL(10, 3) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS sell_rate DECIMAL(10, 3) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS updated_by_name VARCHAR(100);

-- Migrate existing rate data to buy_rate (if rate column exists)
UPDATE exchange_rates SET buy_rate = rate WHERE rate > 0;

-- Drop old rate column if it exists (optional - keep for backwards compatibility)
-- ALTER TABLE exchange_rates DROP COLUMN IF EXISTS rate;

-- Update location values to match new keys
UPDATE exchange_rates SET location = 'terminal' WHERE location IN ('Terminal', 'Sala de espera');
UPDATE exchange_rates SET location = 'entrada' WHERE location IN ('Entrada aeropuerto', 'Entrada Terminal');

-- Delete duplicates keeping the most recent one
DELETE FROM exchange_rates a USING exchange_rates b
WHERE a.id < b.id
AND a.airport_code = b.airport_code
AND a.location = b.location;

-- Ensure we have the correct entries for TIJ and MEX
INSERT INTO exchange_rates (airport_code, location, buy_rate, sell_rate) VALUES
  ('MEX', 'terminal', 0, 0),
  ('TIJ', 'terminal', 0, 0),
  ('TIJ', 'entrada', 0, 0)
ON CONFLICT (airport_code, location) DO NOTHING;

-- Add comment
COMMENT ON COLUMN exchange_rates.buy_rate IS 'USD buy rate (compra)';
COMMENT ON COLUMN exchange_rates.sell_rate IS 'USD sell rate (venta)';
COMMENT ON COLUMN exchange_rates.updated_by_name IS 'Name of user who last updated the rate';
