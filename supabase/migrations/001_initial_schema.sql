-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enums
CREATE TYPE user_category AS ENUM ('FLIGHT', 'GROUND');
CREATE TYPE user_position AS ENUM ('PILOT', 'FA', 'OPS', 'TRAFICO', 'MANTTO');
CREATE TYPE user_role AS ENUM ('PILOT', 'FA', 'OPS', 'TRAFICO', 'MANTTO', 'SUPERADMIN');
CREATE TYPE flight_status AS ENUM ('ON_TIME', 'DELAY', 'GATE_CHANGE', 'CANCELED');
CREATE TYPE subscription_tier AS ENUM ('FREE', 'PREMIUM');
CREATE TYPE sync_status AS ENUM ('synced', 'pending', 'syncing', 'error');

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  whatsapp TEXT UNIQUE NOT NULL,
  categoria user_category NOT NULL,
  posicion user_position NOT NULL,
  role user_role NOT NULL DEFAULT 'PILOT',
  strikes INTEGER DEFAULT 0,
  is_banned BOOLEAN DEFAULT FALSE,
  subscription_tier subscription_tier DEFAULT 'FREE',
  subscription_expires_at TIMESTAMPTZ,
  device_fingerprint TEXT,
  last_ip TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Set role based on position
CREATE OR REPLACE FUNCTION set_user_role()
RETURNS TRIGGER AS $$
BEGIN
  NEW.role = NEW.posicion::text::user_role;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_role_on_insert
  BEFORE INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION set_user_role();

-- Flights table (FIDS)
CREATE TABLE flights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  flight_number TEXT NOT NULL,
  airline TEXT NOT NULL,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  std TIMESTAMPTZ NOT NULL, -- Scheduled Time of Departure
  sta TIMESTAMPTZ NOT NULL, -- Scheduled Time of Arrival
  etd TIMESTAMPTZ, -- Estimated Time of Departure
  eta TIMESTAMPTZ, -- Estimated Time of Arrival
  atd TIMESTAMPTZ, -- Actual Time of Departure
  ata TIMESTAMPTZ, -- Actual Time of Arrival
  status flight_status DEFAULT 'ON_TIME',
  gate TEXT,
  aircraft_type TEXT,
  aircraft_registration TEXT,
  delay_minutes INTEGER DEFAULT 0,
  delay_reason TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  archived_at TIMESTAMPTZ
);

-- Index for FIDS retention window query
CREATE INDEX idx_flights_std ON flights(std);
CREATE INDEX idx_flights_archived ON flights(archived_at) WHERE archived_at IS NULL;

-- Pilot logs table
CREATE TABLE pilot_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) NOT NULL,
  date DATE NOT NULL,
  tail TEXT NOT NULL,
  aircraft_type TEXT NOT NULL,
  dep TEXT NOT NULL,
  dest TEXT NOT NULL,
  out_time TIME NOT NULL,
  off_time TIME NOT NULL,
  on_time TIME NOT NULL,
  in_time TIME NOT NULL,
  flight_time_minutes INTEGER GENERATED ALWAYS AS (
    EXTRACT(EPOCH FROM (on_time - off_time)) / 60
  ) STORED,
  block_time_minutes INTEGER GENERATED ALWAYS AS (
    EXTRACT(EPOCH FROM (in_time - out_time)) / 60
  ) STORED,
  duty_start TIME,
  duty_end TIME,
  duty_time_minutes INTEGER,
  notes TEXT,
  sync_status sync_status DEFAULT 'synced',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pilot_logs_user ON pilot_logs(user_id);
CREATE INDEX idx_pilot_logs_date ON pilot_logs(date);

-- FA logs table
CREATE TABLE fa_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) NOT NULL,
  date DATE NOT NULL,
  flight_number TEXT NOT NULL,
  aircraft_type TEXT NOT NULL,
  aircraft_registration TEXT NOT NULL,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  captain TEXT,
  copilot TEXT,
  entry_time TIME,
  release_time TIME,
  boarding_time TIME,
  first_pax_time TIME,
  last_pax_time TIME,
  door_close_time TIME,
  bar_set_number TEXT,
  fleje_color TEXT,
  cash_folio TEXT,
  sales_mxn DECIMAL(10,2) DEFAULT 0,
  sales_usd DECIMAL(10,2) DEFAULT 0,
  sales_card DECIMAL(10,2) DEFAULT 0,
  sync_status sync_status DEFAULT 'synced',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_fa_logs_user ON fa_logs(user_id);
CREATE INDEX idx_fa_logs_date ON fa_logs(date);

-- Directory entries
CREATE TABLE directory_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  airport_code TEXT NOT NULL,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  phone TEXT NOT NULL,
  whatsapp TEXT,
  address TEXT,
  rating DECIMAL(2,1) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES users(id) NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_directory_airport ON directory_entries(airport_code);
CREATE INDEX idx_directory_category ON directory_entries(category);

-- Incidents table
CREATE TABLE incidents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) NOT NULL,
  flight_id UUID REFERENCES flights(id),
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  actions_taken TEXT,
  witnesses TEXT,
  photos TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_incidents_user ON incidents(user_id);
CREATE INDEX idx_incidents_flight ON incidents(flight_id);

-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_flights_updated_at BEFORE UPDATE ON flights FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_pilot_logs_updated_at BEFORE UPDATE ON pilot_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_fa_logs_updated_at BEFORE UPDATE ON fa_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_directory_updated_at BEFORE UPDATE ON directory_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_incidents_updated_at BEFORE UPDATE ON incidents FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE flights ENABLE ROW LEVEL SECURITY;
ALTER TABLE pilot_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE fa_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE directory_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;

-- Users: Users can read their own data, SUPERADMIN can read all
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id OR EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'SUPERADMIN'
  ));

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Flights: All authenticated users can view, only SUPERADMIN and premium can edit
CREATE POLICY "Authenticated users can view flights" ON flights
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Premium users can insert flights" ON flights
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND (subscription_tier = 'PREMIUM' OR role = 'SUPERADMIN')
    )
  );

CREATE POLICY "Premium users can update flights" ON flights
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND (subscription_tier = 'PREMIUM' OR role = 'SUPERADMIN')
    )
  );

-- Pilot logs: Users can only access their own
CREATE POLICY "Pilots can view own logs" ON pilot_logs
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Pilots can insert own logs" ON pilot_logs
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Pilots can update own logs" ON pilot_logs
  FOR UPDATE USING (user_id = auth.uid());

-- FA logs: Users can only access their own
CREATE POLICY "FA can view own logs" ON fa_logs
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "FA can insert own logs" ON fa_logs
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "FA can update own logs" ON fa_logs
  FOR UPDATE USING (user_id = auth.uid());

-- Directory: FLIGHT users can view, all authenticated can insert
CREATE POLICY "Flight users can view directory" ON directory_entries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND (categoria = 'FLIGHT' OR role = 'SUPERADMIN')
    )
  );

CREATE POLICY "Authenticated users can insert directory" ON directory_entries
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Incidents: Users can access their own
CREATE POLICY "Users can view own incidents" ON incidents
  FOR SELECT USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'SUPERADMIN'
  ));

CREATE POLICY "Users can insert own incidents" ON incidents
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Function to archive old flights (called by cron job)
CREATE OR REPLACE FUNCTION archive_old_flights()
RETURNS void AS $$
BEGIN
  UPDATE flights
  SET archived_at = NOW()
  WHERE archived_at IS NULL
  AND std < NOW() - INTERVAL '3 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the superadmin user (to be run after auth user is created)
-- INSERT INTO users (id, email, nombre, whatsapp, categoria, posicion, role)
-- VALUES ('superadmin-uuid', 'maliachialex@gmail.com', 'Super Admin', '+521234567890', 'FLIGHT', 'PILOT', 'SUPERADMIN');
