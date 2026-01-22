-- 032_users_ciudad_empresa.sql
-- Add ciudad_base and empresa fields to users table for admin map

-- Add ciudad_base field (6 main bases)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS ciudad_base TEXT CHECK (ciudad_base IS NULL OR ciudad_base IN ('TIJ', 'BJX', 'GDL', 'MTY', 'MEX', 'CUN'));

-- Add empresa field
ALTER TABLE users
ADD COLUMN IF NOT EXISTS empresa TEXT;

-- Add notifications_muted field if not exists
ALTER TABLE users
ADD COLUMN IF NOT EXISTS notifications_muted BOOLEAN DEFAULT FALSE;

-- Create index for city-based queries
CREATE INDEX IF NOT EXISTS idx_users_ciudad_base ON users(ciudad_base) WHERE ciudad_base IS NOT NULL;

-- Comments
COMMENT ON COLUMN users.ciudad_base IS 'Código IATA del aeropuerto base del usuario (TIJ, BJX, GDL, MTY, MEX, CUN)';
COMMENT ON COLUMN users.empresa IS 'Empresa/aerolínea del usuario';
