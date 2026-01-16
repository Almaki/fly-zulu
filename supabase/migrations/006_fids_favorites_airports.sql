-- Migration: FIDS Favorites and Airport Database
-- Adds user favorite airports and comprehensive airport data

-- =====================
-- AIRPORTS TABLE (Mexican and International destinations)
-- =====================

CREATE TABLE IF NOT EXISTS airports (
  code TEXT PRIMARY KEY,                    -- IATA 3-letter code
  name TEXT NOT NULL,                       -- Full airport name
  city TEXT NOT NULL,                       -- City name
  country TEXT NOT NULL DEFAULT 'México',
  timezone TEXT NOT NULL,
  has_terminals BOOLEAN DEFAULT FALSE,      -- CUN, GDL have terminals
  terminals TEXT[] DEFAULT '{}',            -- A, B, C, D for applicable airports
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert Mexican airports
INSERT INTO airports (code, name, city, country, timezone, has_terminals, terminals) VALUES
  ('MEX', 'Aeropuerto Internacional Benito Juárez', 'Ciudad de México', 'México', 'America/Mexico_City', FALSE, '{}'),
  ('CUN', 'Aeropuerto Internacional de Cancún', 'Cancún', 'México', 'America/Cancun', TRUE, ARRAY['1', '2', '3', '4']),
  ('GDL', 'Aeropuerto Internacional de Guadalajara', 'Guadalajara', 'México', 'America/Mexico_City', TRUE, ARRAY['A', 'B']),
  ('MTY', 'Aeropuerto Internacional de Monterrey', 'Monterrey', 'México', 'America/Monterrey', TRUE, ARRAY['A', 'B', 'C']),
  ('TIJ', 'Aeropuerto Internacional de Tijuana', 'Tijuana', 'México', 'America/Tijuana', FALSE, '{}'),
  ('SJD', 'Aeropuerto Internacional de Los Cabos', 'San José del Cabo', 'México', 'America/Mazatlan', FALSE, '{}'),
  ('PVR', 'Aeropuerto Internacional de Puerto Vallarta', 'Puerto Vallarta', 'México', 'America/Mexico_City', FALSE, '{}'),
  ('MID', 'Aeropuerto Internacional de Mérida', 'Mérida', 'México', 'America/Mexico_City', FALSE, '{}'),
  ('HMO', 'Aeropuerto Internacional de Hermosillo', 'Hermosillo', 'México', 'America/Hermosillo', FALSE, '{}'),
  ('CUL', 'Aeropuerto Internacional de Culiacán', 'Culiacán', 'México', 'America/Mazatlan', FALSE, '{}'),
  ('ZIH', 'Aeropuerto Internacional de Zihuatanejo', 'Zihuatanejo', 'México', 'America/Mexico_City', FALSE, '{}'),
  ('OAX', 'Aeropuerto Internacional de Oaxaca', 'Oaxaca', 'México', 'America/Mexico_City', FALSE, '{}'),
  ('BJX', 'Aeropuerto Internacional del Bajío', 'León', 'México', 'America/Mexico_City', FALSE, '{}'),
  ('VER', 'Aeropuerto Internacional de Veracruz', 'Veracruz', 'México', 'America/Mexico_City', FALSE, '{}'),
  ('CME', 'Aeropuerto Internacional de Ciudad del Carmen', 'Ciudad del Carmen', 'México', 'America/Mexico_City', FALSE, '{}'),
  ('VSA', 'Aeropuerto Internacional de Villahermosa', 'Villahermosa', 'México', 'America/Mexico_City', FALSE, '{}'),
  ('TAM', 'Aeropuerto Internacional de Tampico', 'Tampico', 'México', 'America/Mexico_City', FALSE, '{}'),
  ('AGU', 'Aeropuerto Internacional de Aguascalientes', 'Aguascalientes', 'México', 'America/Mexico_City', FALSE, '{}'),
  ('SLP', 'Aeropuerto Internacional de San Luis Potosí', 'San Luis Potosí', 'México', 'America/Mexico_City', FALSE, '{}'),
  ('ZCL', 'Aeropuerto Internacional de Zacatecas', 'Zacatecas', 'México', 'America/Mexico_City', FALSE, '{}'),
  ('CZM', 'Aeropuerto Internacional de Cozumel', 'Cozumel', 'México', 'America/Cancun', FALSE, '{}'),
  ('ACA', 'Aeropuerto Internacional de Acapulco', 'Acapulco', 'México', 'America/Mexico_City', FALSE, '{}'),
  ('MLM', 'Aeropuerto Internacional de Morelia', 'Morelia', 'México', 'America/Mexico_City', FALSE, '{}'),
  ('QRO', 'Aeropuerto Internacional de Querétaro', 'Querétaro', 'México', 'America/Mexico_City', FALSE, '{}'),
  ('TRC', 'Aeropuerto Internacional de Torreón', 'Torreón', 'México', 'America/Mexico_City', FALSE, '{}'),
  ('CJS', 'Aeropuerto Internacional de Ciudad Juárez', 'Ciudad Juárez', 'México', 'America/Ojinaga', FALSE, '{}'),
  ('MZT', 'Aeropuerto Internacional de Mazatlán', 'Mazatlán', 'México', 'America/Mazatlan', FALSE, '{}'),
  ('LAP', 'Aeropuerto Internacional de La Paz', 'La Paz', 'México', 'America/Mazatlan', FALSE, '{}'),
  ('REX', 'Aeropuerto Internacional de Reynosa', 'Reynosa', 'México', 'America/Matamoros', FALSE, '{}'),
  ('NLD', 'Aeropuerto Internacional de Nuevo Laredo', 'Nuevo Laredo', 'México', 'America/Matamoros', FALSE, '{}'),
  ('CLQ', 'Aeropuerto Internacional de Colima', 'Colima', 'México', 'America/Mexico_City', FALSE, '{}'),
  ('TGZ', 'Aeropuerto Internacional de Tuxtla Gutiérrez', 'Tuxtla Gutiérrez', 'México', 'America/Mexico_City', FALSE, '{}'),
  ('CTM', 'Aeropuerto Internacional de Chetumal', 'Chetumal', 'México', 'America/Cancun', FALSE, '{}'),
  ('CPE', 'Aeropuerto Internacional de Campeche', 'Campeche', 'México', 'America/Mexico_City', FALSE, '{}'),
  ('PAZ', 'Aeropuerto Internacional de Poza Rica', 'Poza Rica', 'México', 'America/Mexico_City', FALSE, '{}'),
  ('UPN', 'Aeropuerto Internacional de Uruapan', 'Uruapan', 'México', 'America/Mexico_City', FALSE, '{}'),
  ('LMM', 'Aeropuerto Internacional de Los Mochis', 'Los Mochis', 'México', 'America/Mazatlan', FALSE, '{}'),
  ('GUA', 'Aeropuerto Internacional La Aurora', 'Ciudad de Guatemala', 'Guatemala', 'America/Guatemala', FALSE, '{}'),
  ('SAL', 'Aeropuerto Internacional El Salvador', 'San Salvador', 'El Salvador', 'America/El_Salvador', FALSE, '{}'),
  ('SAP', 'Aeropuerto Internacional Ramón Villeda Morales', 'San Pedro Sula', 'Honduras', 'America/Tegucigalpa', FALSE, '{}'),
  ('MGA', 'Aeropuerto Internacional Augusto C. Sandino', 'Managua', 'Nicaragua', 'America/Managua', FALSE, '{}'),
  ('SJO', 'Aeropuerto Internacional Juan Santamaría', 'San José', 'Costa Rica', 'America/Costa_Rica', FALSE, '{}'),
  ('PTY', 'Aeropuerto Internacional de Tocumen', 'Ciudad de Panamá', 'Panamá', 'America/Panama', FALSE, '{}'),
  ('BOG', 'Aeropuerto Internacional El Dorado', 'Bogotá', 'Colombia', 'America/Bogota', FALSE, '{}'),
  ('HAV', 'Aeropuerto Internacional José Martí', 'La Habana', 'Cuba', 'America/Havana', FALSE, '{}'),
  ('LAX', 'Los Angeles International Airport', 'Los Ángeles', 'Estados Unidos', 'America/Los_Angeles', TRUE, ARRAY['1', '2', '3', '4', '5', '6', '7', '8', 'B']),
  ('JFK', 'John F. Kennedy International Airport', 'Nueva York', 'Estados Unidos', 'America/New_York', TRUE, ARRAY['1', '2', '4', '5', '7', '8']),
  ('MIA', 'Miami International Airport', 'Miami', 'Estados Unidos', 'America/New_York', FALSE, '{}'),
  ('DFW', 'Dallas/Fort Worth International Airport', 'Dallas', 'Estados Unidos', 'America/Chicago', TRUE, ARRAY['A', 'B', 'C', 'D', 'E']),
  ('ORD', 'O''Hare International Airport', 'Chicago', 'Estados Unidos', 'America/Chicago', TRUE, ARRAY['1', '2', '3', '5']),
  ('IAH', 'George Bush Intercontinental Airport', 'Houston', 'Estados Unidos', 'America/Chicago', TRUE, ARRAY['A', 'B', 'C', 'D', 'E']),
  ('PHX', 'Phoenix Sky Harbor International Airport', 'Phoenix', 'Estados Unidos', 'America/Phoenix', TRUE, ARRAY['2', '3', '4']),
  ('SFO', 'San Francisco International Airport', 'San Francisco', 'Estados Unidos', 'America/Los_Angeles', TRUE, ARRAY['1', '2', '3', 'G']),
  ('LAS', 'Harry Reid International Airport', 'Las Vegas', 'Estados Unidos', 'America/Los_Angeles', TRUE, ARRAY['1', '3']),
  ('ATL', 'Hartsfield-Jackson Atlanta International', 'Atlanta', 'Estados Unidos', 'America/New_York', TRUE, ARRAY['T', 'A', 'B', 'C', 'D', 'E', 'F']),
  ('DEN', 'Denver International Airport', 'Denver', 'Estados Unidos', 'America/Denver', TRUE, ARRAY['A', 'B', 'C']),
  ('MCO', 'Orlando International Airport', 'Orlando', 'Estados Unidos', 'America/New_York', TRUE, ARRAY['A', 'B', 'C'])
ON CONFLICT (code) DO NOTHING;

-- =====================
-- USER FAVORITE AIRPORTS
-- =====================

CREATE TABLE IF NOT EXISTS user_favorite_airports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  airport_code TEXT NOT NULL REFERENCES airports(code) ON DELETE CASCADE,
  board_type TEXT NOT NULL CHECK (board_type IN ('departures', 'arrivals', 'both')) DEFAULT 'both',
  is_primary BOOLEAN DEFAULT FALSE,         -- Primary favorite shows by default
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, airport_code, board_type)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_favorites_user ON user_favorite_airports(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_airport ON user_favorite_airports(airport_code);

-- =====================
-- RLS POLICIES
-- =====================

ALTER TABLE airports ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorite_airports ENABLE ROW LEVEL SECURITY;

-- Airports are readable by everyone
CREATE POLICY "airports_read_all" ON airports
  FOR SELECT USING (true);

-- User favorites are only accessible by the owner
CREATE POLICY "favorites_select_own" ON user_favorite_airports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "favorites_insert_own" ON user_favorite_airports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "favorites_update_own" ON user_favorite_airports
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "favorites_delete_own" ON user_favorite_airports
  FOR DELETE USING (auth.uid() = user_id);

-- =====================
-- UPDATE FLIGHTS TABLE - Allow all authenticated users
-- =====================

-- Drop existing restrictive policies if they exist
DROP POLICY IF EXISTS "flights_insert_premium" ON flights;
DROP POLICY IF EXISTS "flights_update_premium" ON flights;

-- Allow all authenticated users to insert flights
CREATE POLICY "flights_insert_authenticated" ON flights
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Allow all authenticated users to update flights
CREATE POLICY "flights_update_authenticated" ON flights
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Add new_gate column for gate changes
ALTER TABLE flights ADD COLUMN IF NOT EXISTS new_gate TEXT;
ALTER TABLE flights ADD COLUMN IF NOT EXISTS new_time TIMESTAMPTZ;
