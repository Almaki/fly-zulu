-- ============================================
-- AVISOS DE OCASIÓN - Nuevos campos
-- ============================================

-- Actualizar categorías permitidas (agregar taxi_seguro)
ALTER TABLE avisos_ocasion DROP CONSTRAINT IF EXISTS avisos_ocasion_categoria_check;
ALTER TABLE avisos_ocasion ADD CONSTRAINT avisos_ocasion_categoria_check
  CHECK (categoria IN ('compra', 'venta', 'renta_inmueble', 'venta_inmueble', 'renta_auto', 'roomie', 'taxi_seguro', 'servicios', 'otro'));

-- Nuevos campos para inmuebles
ALTER TABLE avisos_ocasion ADD COLUMN IF NOT EXISTS tipo_inmueble TEXT CHECK (tipo_inmueble IN ('casa', 'departamento'));
ALTER TABLE avisos_ocasion ADD COLUMN IF NOT EXISTS tiene_cochera BOOLEAN DEFAULT NULL;

-- Nuevos campos para taxi seguro
ALTER TABLE avisos_ocasion ADD COLUMN IF NOT EXISTS nombre_conductor TEXT;
ALTER TABLE avisos_ocasion ADD COLUMN IF NOT EXISTS tipo_auto_taxi TEXT CHECK (tipo_auto_taxi IN ('compacto', 'camioneta'));

-- Comentarios
COMMENT ON COLUMN avisos_ocasion.tipo_inmueble IS 'Tipo de inmueble: casa o departamento';
COMMENT ON COLUMN avisos_ocasion.tiene_cochera IS 'Si el inmueble cuenta con cochera';
COMMENT ON COLUMN avisos_ocasion.nombre_conductor IS 'Nombre del conductor (para taxi seguro)';
COMMENT ON COLUMN avisos_ocasion.tipo_auto_taxi IS 'Tipo de auto para taxi: compacto o camioneta';

-- Índice para taxi seguro
CREATE INDEX IF NOT EXISTS idx_avisos_taxi ON avisos_ocasion(categoria) WHERE categoria = 'taxi_seguro';
