-- ============================================================
-- Bolsa de Canje de Uniformes — tablas principales
-- ============================================================

CREATE TABLE IF NOT EXISTS canje_publicaciones (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_rol   TEXT NOT NULL,
  base         TEXT NOT NULL CHECK (base IN ('TIJ','MTY','BJX','GDL','MEX','CUN')),
  tipo         TEXT NOT NULL CHECK (tipo IN ('TENGO','REQUIERO')),
  prenda       TEXT NOT NULL CHECK (prenda IN ('GABARDINA','PANTALON','KEPI','CAMISA MC','CAMISA ML')),
  talla        TEXT NOT NULL,
  en_pool      BOOLEAN NOT NULL DEFAULT false,
  estado       TEXT NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo','resuelto')),
  resuelto_por TEXT[] DEFAULT '{}',
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS canje_mensajes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_key   TEXT NOT NULL,
  numero_rol TEXT NOT NULL,
  mensaje    TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices de rendimiento
CREATE INDEX IF NOT EXISTS idx_canje_pub_estado     ON canje_publicaciones(estado);
CREATE INDEX IF NOT EXISTS idx_canje_pub_numero_rol ON canje_publicaciones(numero_rol);
CREATE INDEX IF NOT EXISTS idx_canje_msg_chat_key   ON canje_mensajes(chat_key);

-- RLS
ALTER TABLE canje_publicaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE canje_mensajes      ENABLE ROW LEVEL SECURITY;

-- Lectura pública (tablero visible para todos)
CREATE POLICY canje_pub_select_all ON canje_publicaciones
  FOR SELECT USING (true);

CREATE POLICY canje_msg_select_all ON canje_mensajes
  FOR SELECT USING (true);

-- Inserción abierta (sin auth — cualquier tripulante puede publicar)
CREATE POLICY canje_pub_insert_all ON canje_publicaciones
  FOR INSERT WITH CHECK (true);

CREATE POLICY canje_msg_insert_all ON canje_mensajes
  FOR INSERT WITH CHECK (true);

-- UPDATE restringido: solo registros activos → solo puede pasar a 'resuelto'
CREATE POLICY canje_pub_update_all ON canje_publicaciones
  FOR UPDATE
  USING (estado = 'activo')
  WITH CHECK (estado IN ('activo', 'resuelto'));
