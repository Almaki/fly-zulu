-- Agrega campo género a publicaciones de canje (M = Masculino, F = Femenino)
-- El match requiere que TENGO y REQUIERO coincidan en prenda + talla + genero.

ALTER TABLE canje_publicaciones
  ADD COLUMN IF NOT EXISTS genero TEXT NOT NULL DEFAULT 'M'
    CHECK (genero IN ('M', 'F'));

COMMENT ON COLUMN canje_publicaciones.genero
  IS 'Género de la prenda: M = Masculino, F = Femenino';
