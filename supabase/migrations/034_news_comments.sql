-- ============================================
-- NOTICIAS - Comentarios de usuarios en noticias RSS
-- ============================================

-- Tabla de comentarios en noticias
CREATE TABLE IF NOT EXISTS news_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identificador único de la noticia (hash del URL del RSS)
  news_id TEXT NOT NULL,

  -- Metadata de la noticia (para referencia)
  news_title TEXT NOT NULL,
  news_source TEXT NOT NULL,

  -- Comentario
  content TEXT NOT NULL CHECK (char_length(content) <= 500),

  -- Usuario que comentó
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_news_comments_news_id ON news_comments(news_id);
CREATE INDEX IF NOT EXISTS idx_news_comments_user_id ON news_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_news_comments_created_at ON news_comments(created_at DESC);

-- RLS
ALTER TABLE news_comments ENABLE ROW LEVEL SECURITY;

-- Todos pueden ver comentarios
CREATE POLICY "news_comments_select_all" ON news_comments
  FOR SELECT
  TO authenticated
  USING (true);

-- Usuarios autenticados pueden crear comentarios
CREATE POLICY "news_comments_insert_auth" ON news_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Solo el creador puede actualizar su comentario
CREATE POLICY "news_comments_update_owner" ON news_comments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Creador o SUPERADMIN puede eliminar
CREATE POLICY "news_comments_delete_owner_or_admin" ON news_comments
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'SUPERADMIN'::user_role
    )
  );

-- Trigger para updated_at
CREATE TRIGGER news_comments_updated_at_trigger
  BEFORE UPDATE ON news_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_avisos_updated_at();

-- Comentarios
COMMENT ON TABLE news_comments IS 'Comentarios de usuarios en noticias RSS';
COMMENT ON COLUMN news_comments.news_id IS 'Hash único del URL de la noticia';

-- ============================================
-- LIMPIEZA AUTOMÁTICA DE COMENTARIOS (30 días)
-- ============================================

-- Función para limpiar comentarios antiguos
CREATE OR REPLACE FUNCTION limpiar_news_comments_antiguos()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  WITH deleted AS (
    DELETE FROM news_comments
    WHERE created_at < NOW() - INTERVAL '30 days'
    RETURNING id
  )
  SELECT COUNT(*) INTO deleted_count FROM deleted;

  RETURN deleted_count;
END;
$$;

COMMENT ON FUNCTION limpiar_news_comments_antiguos IS 'Elimina comentarios con más de 30 días. Ejecutar via cron diariamente.';
