-- ============================================
-- ZULU NEWS - Storage bucket para imágenes
-- ============================================

-- Crear bucket para imágenes de noticias
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'zulu-news',
  'zulu-news',
  true,  -- Público para que se puedan ver las imágenes
  5242880,  -- 5MB máximo
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Política: Cualquiera puede ver las imágenes (bucket público)
CREATE POLICY "zulu_news_images_public_read" ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'zulu-news');

-- Política: Solo SUPERADMIN puede subir imágenes
CREATE POLICY "zulu_news_images_admin_insert" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'zulu-news' AND
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'SUPERADMIN'::user_role
    )
  );

-- Política: Solo SUPERADMIN puede actualizar imágenes
CREATE POLICY "zulu_news_images_admin_update" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'zulu-news' AND
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'SUPERADMIN'::user_role
    )
  );

-- Política: Solo SUPERADMIN puede eliminar imágenes
CREATE POLICY "zulu_news_images_admin_delete" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'zulu-news' AND
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'SUPERADMIN'::user_role
    )
  );
