-- Agrega campo talla_alternativa a publicaciones de canje
-- Permite que un piloto indique una segunda talla aceptable para ampliar el match.

ALTER TABLE canje_publicaciones
  ADD COLUMN IF NOT EXISTS talla_alternativa TEXT DEFAULT NULL;

COMMENT ON COLUMN canje_publicaciones.talla_alternativa
  IS 'Talla alternativa aceptable (opcional). Si se especifica, el match también acepta esta talla.';
