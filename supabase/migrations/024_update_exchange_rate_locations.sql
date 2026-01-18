-- Migration: 024_update_exchange_rate_locations
-- Description: Update exchange rate locations to Toro Shop and Gates for MEX and TIJ

-- First, delete old locations that no longer exist
DELETE FROM exchange_rates WHERE location IN ('terminal', 'entrada');

-- Insert new locations for MEX if they don't exist
INSERT INTO exchange_rates (airport_code, location, buy_rate, sell_rate)
SELECT 'MEX', 'toro_shop', 0, 0
WHERE NOT EXISTS (SELECT 1 FROM exchange_rates WHERE airport_code = 'MEX' AND location = 'toro_shop');

INSERT INTO exchange_rates (airport_code, location, buy_rate, sell_rate)
SELECT 'MEX', 'gates', 0, 0
WHERE NOT EXISTS (SELECT 1 FROM exchange_rates WHERE airport_code = 'MEX' AND location = 'gates');

-- Insert new locations for TIJ if they don't exist
INSERT INTO exchange_rates (airport_code, location, buy_rate, sell_rate)
SELECT 'TIJ', 'toro_shop', 0, 0
WHERE NOT EXISTS (SELECT 1 FROM exchange_rates WHERE airport_code = 'TIJ' AND location = 'toro_shop');

INSERT INTO exchange_rates (airport_code, location, buy_rate, sell_rate)
SELECT 'TIJ', 'gates', 0, 0
WHERE NOT EXISTS (SELECT 1 FROM exchange_rates WHERE airport_code = 'TIJ' AND location = 'gates');
