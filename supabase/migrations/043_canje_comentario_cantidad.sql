-- Agrega campos comentario y cantidad a publicaciones de canje

ALTER TABLE canje_publicaciones
  ADD COLUMN IF NOT EXISTS cantidad INTEGER NOT NULL DEFAULT 1 CHECK (cantidad >= 1 AND cantidad <= 10);

ALTER TABLE canje_publicaciones
  ADD COLUMN IF NOT EXISTS comentario TEXT DEFAULT NULL;

COMMENT ON COLUMN canje_publicaciones.cantidad
  IS 'Cantidad de prendas disponibles (1-10). Por defecto 1.';

COMMENT ON COLUMN canje_publicaciones.comentario
  IS 'Comentario libre del piloto: estado de la prenda, detalles adicionales, etc.';
