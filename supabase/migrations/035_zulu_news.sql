-- ============================================
-- ZULU NEWS - Noticias manuales del equipo
-- ============================================

-- Tabla para noticias publicadas manualmente por el equipo
CREATE TABLE IF NOT EXISTS zulu_news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  content TEXT, -- Contenido completo (opcional)
  image_url TEXT,
  category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('aviacion', 'operaciones', 'seguridad', 'anuncios', 'general')),
  is_breaking BOOLEAN DEFAULT false, -- Si es noticia urgente/breaking
  is_published BOOLEAN DEFAULT true,
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_zulu_news_published ON zulu_news(is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_zulu_news_category ON zulu_news(category);
CREATE INDEX IF NOT EXISTS idx_zulu_news_breaking ON zulu_news(is_breaking) WHERE is_breaking = true;

-- Habilitar RLS
ALTER TABLE zulu_news ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
-- Todos los usuarios autenticados pueden ver noticias publicadas
CREATE POLICY "zulu_news_select_published" ON zulu_news
  FOR SELECT
  TO authenticated
  USING (is_published = true);

-- Solo SUPERADMIN puede insertar
CREATE POLICY "zulu_news_insert_admin" ON zulu_news
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'SUPERADMIN'::user_role
    )
  );

-- Solo SUPERADMIN puede actualizar
CREATE POLICY "zulu_news_update_admin" ON zulu_news
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'SUPERADMIN'::user_role
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'SUPERADMIN'::user_role
    )
  );

-- Solo SUPERADMIN puede eliminar
CREATE POLICY "zulu_news_delete_admin" ON zulu_news
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'SUPERADMIN'::user_role
    )
  );

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_zulu_news_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para updated_at
DROP TRIGGER IF EXISTS trigger_zulu_news_updated_at ON zulu_news;
CREATE TRIGGER trigger_zulu_news_updated_at
  BEFORE UPDATE ON zulu_news
  FOR EACH ROW
  EXECUTE FUNCTION update_zulu_news_updated_at();
