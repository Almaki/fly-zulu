-- ============================================
-- AVISOS DE OCASIÓN - Clasificados por ciudad
-- ============================================

-- Tabla de avisos de ocasión
CREATE TABLE IF NOT EXISTS avisos_ocasion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Ciudad (código IATA del aeropuerto base)
  ciudad_code TEXT NOT NULL CHECK (ciudad_code IN ('TIJ', 'BJX', 'GDL', 'MTY', 'MEX', 'CUN')),

  -- Categoría del aviso (compra y venta separados)
  categoria TEXT NOT NULL CHECK (categoria IN ('compra', 'venta', 'renta_inmueble', 'venta_inmueble', 'renta_auto', 'roomie', 'servicios', 'otro')),

  -- Contenido
  titulo TEXT NOT NULL CHECK (char_length(titulo) <= 100),
  descripcion TEXT NOT NULL CHECK (char_length(descripcion) <= 1000),
  precio DECIMAL(12, 2), -- Opcional, puede ser NULL para "a convenir"
  moneda TEXT DEFAULT 'MXN' CHECK (moneda IN ('MXN', 'USD')),

  -- Contacto
  whatsapp TEXT,
  telefono TEXT,

  -- Imágenes (URLs de Supabase Storage, max 3)
  imagenes TEXT[] DEFAULT '{}',

  -- ========== CAMPOS PARA INMUEBLES Y ROOMIE ==========
  -- Dirección con coordenadas para mapa
  direccion TEXT,
  direccion_lat DECIMAL(10, 8), -- Latitud para Google Maps
  direccion_lng DECIMAL(11, 8), -- Longitud para Google Maps

  -- Fecha de disponibilidad del inmueble
  fecha_disponibilidad DATE,

  -- ========== CAMPOS ESPECÍFICOS PARA ROOMIE ==========
  -- Preferencia de mascotas
  acepta_mascotas BOOLEAN DEFAULT NULL, -- NULL = no especificado, TRUE = acepta, FALSE = no acepta

  -- Servicios incluidos en el precio
  servicios_incluidos TEXT[] DEFAULT '{}', -- ['internet', 'agua', 'luz', 'gas', 'mantenimiento', 'otro']

  -- Si el precio es todo incluido
  precio_todo_incluido BOOLEAN DEFAULT FALSE,

  -- ========== CAMPO GENERAL ==========
  -- Si el servicio se realiza a domicilio (aplica para servicios, venta, etc.)
  servicio_domicilio BOOLEAN DEFAULT FALSE,

  -- Metadata
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Estado
  activo BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'), -- Expira en 30 días por defecto

  -- Constraints
  CONSTRAINT avisos_max_imagenes CHECK (array_length(imagenes, 1) IS NULL OR array_length(imagenes, 1) <= 3),
  CONSTRAINT avisos_servicios_validos CHECK (
    servicios_incluidos <@ ARRAY['internet', 'agua', 'luz', 'gas', 'mantenimiento', 'otro']::TEXT[]
  )
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_avisos_ciudad ON avisos_ocasion(ciudad_code);
CREATE INDEX IF NOT EXISTS idx_avisos_categoria ON avisos_ocasion(categoria);
CREATE INDEX IF NOT EXISTS idx_avisos_activo ON avisos_ocasion(activo) WHERE activo = TRUE;
CREATE INDEX IF NOT EXISTS idx_avisos_created_at ON avisos_ocasion(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_avisos_expires_at ON avisos_ocasion(expires_at);
CREATE INDEX IF NOT EXISTS idx_avisos_coords ON avisos_ocasion(direccion_lat, direccion_lng) WHERE direccion_lat IS NOT NULL;

-- RLS
ALTER TABLE avisos_ocasion ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
-- Todos pueden ver avisos activos no expirados
CREATE POLICY "avisos_select_public" ON avisos_ocasion
  FOR SELECT
  USING (activo = TRUE AND expires_at > NOW());

-- Usuarios autenticados pueden crear avisos
CREATE POLICY "avisos_insert_auth" ON avisos_ocasion
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Solo el creador puede actualizar su aviso
CREATE POLICY "avisos_update_owner" ON avisos_ocasion
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Solo el creador o superadmin puede eliminar
CREATE POLICY "avisos_delete_owner_or_admin" ON avisos_ocasion
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'SUPERADMIN'::user_role
    )
  );

-- Función para limpiar avisos expirados (ejecutar via cron)
CREATE OR REPLACE FUNCTION limpiar_avisos_expirados()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  WITH deleted AS (
    DELETE FROM avisos_ocasion
    WHERE expires_at < NOW() - INTERVAL '7 days'
    RETURNING id
  )
  SELECT COUNT(*) INTO deleted_count FROM deleted;

  RETURN deleted_count;
END;
$$;

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_avisos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER avisos_updated_at_trigger
  BEFORE UPDATE ON avisos_ocasion
  FOR EACH ROW
  EXECUTE FUNCTION update_avisos_updated_at();

-- Comentarios
COMMENT ON TABLE avisos_ocasion IS 'Avisos clasificados por ciudad para tripulaciones';
COMMENT ON COLUMN avisos_ocasion.ciudad_code IS 'Código IATA del aeropuerto base';
COMMENT ON COLUMN avisos_ocasion.categoria IS 'Tipo: compra, venta, renta_inmueble, venta_inmueble, renta_auto, roomie, servicios, otro';
COMMENT ON COLUMN avisos_ocasion.expires_at IS 'Fecha de expiración del aviso (30 días por defecto)';
COMMENT ON COLUMN avisos_ocasion.direccion IS 'Dirección física del inmueble (para renta/venta inmueble y roomie)';
COMMENT ON COLUMN avisos_ocasion.direccion_lat IS 'Latitud de Google Maps para mostrar en mapa';
COMMENT ON COLUMN avisos_ocasion.direccion_lng IS 'Longitud de Google Maps para mostrar en mapa';
COMMENT ON COLUMN avisos_ocasion.fecha_disponibilidad IS 'Fecha desde la cual está disponible el inmueble';
COMMENT ON COLUMN avisos_ocasion.acepta_mascotas IS 'Si acepta mascotas (para roomie)';
COMMENT ON COLUMN avisos_ocasion.servicios_incluidos IS 'Servicios incluidos: internet, agua, luz, gas, mantenimiento, otro';
COMMENT ON COLUMN avisos_ocasion.precio_todo_incluido IS 'Si el precio incluye todos los servicios';
COMMENT ON COLUMN avisos_ocasion.servicio_domicilio IS 'Si el servicio/producto se entrega a domicilio';
